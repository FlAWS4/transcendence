import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';

const require = createRequire(import.meta.url);
const d3 = require('../../shared/map-data/d3.min.js');
const topojson = require('../../shared/map-data/topojson.min.js');
const directory = dirname(fileURLToPath(import.meta.url));
const read = async path => JSON.parse(await readFile(join(directory,path),'utf8'));
const topology = await read('world-countries.topo.json');
const raw = await read('world-countries.geojson');
const collection = topojson.feature(topology,topology.objects.countries);
const catalogue = await read('../campuses.json');
const overrides = new Map((await read('../campus-location-overrides.json')).map(row => [row.campusId,row.coordinates]));
const sourceIndex = process.argv.indexOf('--source');
const source = sourceIndex < 0 ? null : JSON.parse(await readFile(process.argv[sourceIndex+1],'utf8'));
const sourceById = source && new Map(source.features.map(feature => [feature.properties.ISO_A3 === '-99' ? feature.properties.ADM0_A3 : feature.properties.ISO_A3,feature]));
assert.equal(topology.type,'Topology');
assert.equal(collection.type,'FeatureCollection');
assert.equal(collection.features.length,258);
assert.equal(raw.features.length,258);
assert.equal(new Set(collection.features.map(feature => feature.id)).size,258);

const report = {features:258,networkCountries:catalogue.countries.length,campuses:catalogue.campuses.length,
 representations:{},landmarks:{},campusesOutsideCountry:[],sourceContainmentCompared:Boolean(source)};
for(const [name,world] of [['topologyDecoded',collection],['geojson',raw]]) {
 const byId = new Map(world.features.map(feature => [feature.id,feature]));
 let polygons = 0,rings = 0,coordinates = 0,holes = 0;
 for(const feature of world.features) {
  assert.equal(feature.properties.id,feature.id);
  assert.match(feature.id,/^[A-Z]{3}$/);
  assert.ok(['Polygon','MultiPolygon'].includes(feature.geometry.type));
  assert.ok(d3.geoArea(feature) > 0 && d3.geoArea(feature) < 2*Math.PI,`${name}: ${feature.id} spherical winding`);
  const parts = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  for(const part of parts) {
   polygons++;holes += part.length-1;
   for(let index=0;index<part.length;index++) {
    const ring = part[index];rings++;coordinates += ring.length;
    assert.ok(ring.length >= 4,`${feature.id}: ring length`);
    assert.deepEqual(ring[0],ring.at(-1),`${feature.id}: ring closure`);
    const area = d3.geoArea({type:'Polygon',coordinates:[ring]});
    assert.ok(index === 0 ? area < 2*Math.PI : area > 2*Math.PI,`${feature.id}: outer/hole orientation`);
    for(const [lng,lat] of ring) {
     assert.ok(Number.isFinite(lng) && Number.isFinite(lat));
     assert.ok(Math.abs(lng) <= 180+1e-9 && Math.abs(lat) <= 90+1e-9,`${feature.id}: coordinate range`);
    }
   }
  }
 }
 for(const country of catalogue.countries)assert.ok(byId.has(country.id),`${name}: catalogue ${country.id}`);
 const landmarks = {SGP:[103.8198,1.3521],LUX:[6.1319,49.6116],FRA:[2.3522,48.8566],JPN:[139.6917,35.6895],PSE:[35.2034,31.9038]};
 for(const [id,position] of Object.entries(landmarks)) {
  assert.ok(d3.geoContains(byId.get(id),position),`${name}: ${id} contains landmark`);
  assert.ok(!d3.geoContains(byId.get(id),[0,0]),`${name}: ${id} does not cover whole globe`);
 }
 assert.ok(!byId.has('PSX'),'Palestine must use catalogue ISO3 PSE, not ADM0 alias PSX');
 const fiji = byId.get('FJI'),fijiBounds = d3.geoBounds(fiji);
 assert.ok(fijiBounds[0][0] > 170 && fijiBounds[1][0] < -170,`${name}: wrapped Fiji bounds`);
 assert.ok(d3.geoContains(fiji,[178.4419,-18.1416]),`${name}: Fiji west of antimeridian`);
 assert.ok(d3.geoContains(fiji,[-179.9701,-16.841]),`${name}: Fiji east of antimeridian`);
 assert.ok(!d3.geoContains(byId.get('ZAF'),[27.5,-29.5]),`${name}: Lesotho hole in South Africa`);
 assert.ok(d3.geoContains(byId.get('LSO'),[27.5,-29.5]),`${name}: Lesotho remains separate`);
 report.representations[name] = {polygons,rings,holes,coordinates,fijiBounds};
 if(name === 'topologyDecoded') {
  for(const [id,position] of Object.entries(landmarks))report.landmarks[id] = {position,bounds:d3.geoBounds(byId.get(id))};
  for(const campus of catalogue.campuses) {
   const position = overrides.get(campus.id) || campus.coordinates;
   const contained = d3.geoContains(byId.get(campus.country),position);
   if(sourceById)assert.equal(contained,d3.geoContains(sourceById.get(campus.country),position),`${campus.id}: containment preserved from original source`);
   if(!contained)report.campusesOutsideCountry.push({id:campus.id,country:campus.country,position});
  }
 }
}
for(const name of ['world-countries.topo.json','world-countries.geojson']) {
 const bytes = await readFile(join(directory,name));
 assert.deepEqual(gunzipSync(await readFile(join(directory,`${name}.gz`))),bytes,`${name}: gzip round trip`);
}
// These four points are already outside the source's generalized coastlines.
// Preserve the source and campus coordinates; do not fabricate land to pass QA.
assert.deepEqual(report.campusesOutsideCountry.map(campus => campus.id).sort(),
 ['abu-dhabi','malaga','penang','quebec'],'Inspect any new source/coastline exception');
await writeFile(join(directory,'CHECKS.json'),`${JSON.stringify(report,null,2)}\n`);
console.log(JSON.stringify(report,null,2));
