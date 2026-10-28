import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {geometryPath} from './build-world-vectors.mjs';
import {removePolarBorderSeams} from '../../../site/polar-geometry.mjs';

if(!process.argv.includes('--compact'))throw new Error('Run this exporter with --compact so its SVG path scale matches the compact encoding.');

const require=createRequire(import.meta.url);
const d3=require('../../../shared/map-data/d3.min.js');
const topojson=require('../../../shared/map-data/topojson.min.js');
const here=path.dirname(fileURLToPath(import.meta.url));
const topology=JSON.parse(fs.readFileSync(path.join(here,'../../../site/geography/world-countries.topo.json')));
const world=topojson.feature(topology,topology.objects.countries);
const borders=removePolarBorderSeams(topojson.mesh(topology,topology.objects.countries));
const spec=JSON.parse(fs.readFileSync(path.join(here,'../welcome-sync-spec.json')));
const country=spec.map.markerData.countries.find(country=>country.id==='FRA');
const center=country.centroidOfMemberCampuses;
const feature=world.features.find(feature=>feature.properties.id==='FRA');
const parts=feature.geometry.coordinates.map(coordinates=>({type:'Polygon',coordinates}));
const part=parts.find(part=>d3.geoContains(part,center))||parts.sort((a,b)=>d3.geoArea(b)-d3.geoArea(a))[0];
const bounds=d3.geoBounds(part),[[west,south],[east,north]]=bounds;
const span=Math.max(east-west,(north-south)/Math.max(.25,Math.cos(center[1]*Math.PI/180)),1.3);
const radians=Math.PI/180,round=n=>Math.round(n*1000)/1000;
const formatXml=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;');
const report={date:'2026-09-27',country:'FRA',center,bounds,span,views:{},notes:[
 'Same centre, main-country polygon, countryZoom formula and perspective equations as integrated-globe.mjs / MapLibre5.24.',
 'Raw SVG omits edge fading deliberately so geometry remains editable. Apply the documented X and Y opacity gradient masks to the map layers only; campus markers remain outside those masks.',
 'SVG scale(.1) is used for compact integer relative paths. Figma import should preserve physical stage dimensions.',
 'Desktop RTL uses the same unmirrored geography with centreX .45 instead of .55; export included.',
]};
for(const [name,width,height,cx,stageX,stageY] of [['desktop',1051.2,668,.55,388.8,208],['desktop-rtl',1051.2,668,.45,0,208],['mobile',390,429,.5,0,170]]){
 const worldZoom=Math.log2(Math.min(width,height)/600)+1.88+Math.log2((name==='mobile'?.46:.425)/.425);
 const zoom=Math.max(worldZoom+1.35,Math.min(6.7,Math.log2(Math.min(width,height)*.64*360/(512*(span+1)))));
 const R=512*2**zoom/(2*Math.PI*Math.cos(center[1]*radians)),D=1.5*height/R;
 const raw=(lon,lat)=>{const k=D/(D+1-Math.cos(lon)*Math.cos(lat));return [k*Math.cos(lat)*Math.sin(lon),k*Math.sin(lat)];};
 const projection=d3.geoProjection(raw).rotate([-center[0],-center[1]]).clipAngle(Math.acos(1/(D+1))/radians-1e-7)
  .scale(R).translate([width*cx,height*.5]).precision(.025).clipExtent([[0,0],[width,height]]);
 const countries=world.features.map(feature=>({id:feature.properties.id,name:feature.properties.name,path:geometryPath(feature,projection)})).filter(c=>c.path);
 const borderPath=geometryPath(borders,projection),borderWidth=.4+.07*zoom,borderOpacity=.72+.03/7*zoom;
 for(const [theme,land,water,border] of [['light','#19B8B5','#D9EEEE','#C4F3EF'],['dark','#256967','#25232B','#A5DBD2']]){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>42 Horizon — France ${name}, ${theme}</title><rect id="Ocean" width="${width}" height="${height}" fill="${water}"/><g id="Land" fill="${land}" transform="scale(.1)">${countries.map(c=>`<path id="${formatXml(c.id)}" data-name="${formatXml(c.name)}" d="${c.path}"/>`).join('')}</g><path id="Shared-borders" d="${borderPath}" transform="scale(.1)" fill="none" stroke="${border}" stroke-width="${round(borderWidth*10)}" stroke-opacity="${round(borderOpacity)}" stroke-linejoin="round"/></svg>`;
  fs.writeFileSync(path.join(here,`france-${name}-${theme}.svg`),svg);
 }
 const campuses=spec.map.markerData.coordinates.filter(c=>c.country==='FRA').map(c=>{
  const p=projection(c.coordinates);return {id:c.id,name:c.name,coordinates:c.coordinates,mapLocal:p.map(round),page:[p[0]+stageX,p[1]+stageY].map(round)};
 });
 report.views[name]={width,height,camera:{center,zoom,pitch:0,bearing:0},stageOffset:[stageX,stageY],mapCenter:[width*cx,height*.5],physicalSphereRadius:R,cameraDistance:1.5*height,fade:{x:Math.round(Math.min(width*.14,180)),y:Math.round(Math.min(height*.18,150))},campuses,visibleCountryShapes:countries.length};
}
fs.writeFileSync(path.join(here,'france-vector-state.json'),JSON.stringify(report,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(report.views).map(([name,v])=>[name,{camera:v.camera,fade:v.fade}])));
