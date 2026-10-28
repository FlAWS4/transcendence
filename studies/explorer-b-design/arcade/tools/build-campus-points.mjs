// Campus markers aligned on site-b/explorer-shapes.mjs (arcade study, 24 Oct 2026).
// The silhouettes of version B carry no campus positions. This script repeats the generator's projection for each
// shape (same parts, same centre, same fit; site-b/tools/build-explorer-shapes.mjs is imported, never modified) and
// places the 58 campuses of site/campuses.json in each viewBox, then checks the frame against the published viewBox.
//   node studies/explorer-b-design/arcade/tools/build-campus-points.mjs --source ne_10m_admin_0_countries.geojson
// Output: studies/explorer-b-design/arcade/campus-points.mjs  (POINTS = {world, continents:{id}, countries:{ISO3}})
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {PARAMETERS,COUNTRY_RULES,CONTINENT_RULES,clipPolygon,ringArea,verifySource} from '../../../../site-b/tools/build-explorer-shapes.mjs';
import {SHAPES} from '../../../../site-b/explorer-shapes.mjs';
import {CONTINENTS} from '../../../../site-b/continents.mjs';

const require=createRequire(import.meta.url);
const d3=require('../../../../shared/map-data/d3.min.js');
const sourceIndex=process.argv.indexOf('--source');
if(sourceIndex<0){console.error('Usage: node build-campus-points.mjs --source ne_10m_admin_0_countries.geojson');process.exit(2);}
const bytes=readFileSync(process.argv[sourceIndex+1]);verifySource(bytes);
const geojson=JSON.parse(bytes.toString('utf8'));
const catalog=JSON.parse(readFileSync(new URL('../../../../site/campuses.json',import.meta.url),'utf8'));

// The generator's private helpers, repeated as they are.
const featureId=({ISO_A3,ADM0_A3})=>ISO_A3!=='-99'?ISO_A3:ADM0_A3;
const polygonsOf=geometry=>geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];
const boundsOf=rings=>{let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const ring of rings)for(const [x,y] of ring){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}return [x0,y0,x1,y1];};
const contains=(outer,inner)=>inner[0]>=outer[0]&&inner[1]>=outer[1]&&inner[2]<=outer[2]&&inner[3]<=outer[3];
const densify=(ring,step)=>{const out=[ring[0]];for(let i=1;i<ring.length;i++){const [ax,ay]=ring[i-1],[bx,by]=ring[i],n=Math.ceil(Math.max(Math.abs(bx-ax),Math.abs(by-ay))/step);for(let k=1;k<n;k++)out.push([ax+(bx-ax)*k/n,ay+(by-ay)*k/n]);out.push(ring[i]);}return out;};
function selectParts(polygons,{window,drop,unwrap}){
 const out=[];
 for(let polygon of polygons){
  if(unwrap&&boundsOf([polygon[0]])[2]<-160)polygon=polygon.map(ring=>ring.map(([x,y])=>[x+360,y]));
  if(drop?.some(box=>contains(box,boundsOf([polygon[0]]))))continue;
  if(!window){out.push(polygon);continue;}
  const clipped=clipPolygon(polygon,window);if(clipped)out.push(clipped);
 }
 return out;
}
const ceilTenth=value=>Math.ceil(value*10-1e-9)/10;
function frameFor([x0,y0,x1,y1]){
 const {long,margin}=PARAMETERS,w=x1-x0,h=y1-y0,scale=(long-2*margin)/Math.max(w,h);
 const width=w>=h?long:ceilTenth(w*scale+2*margin),height=w>=h?ceilTenth(h*scale+2*margin):long;
 return {width,height,scale,dx:(width-w*scale)/2-x0*scale,dy:(height-h*scale)/2-y0*scale};
}

function placer(kind,parts){
 const {margin,densify:step}=PARAMETERS,minPart=PARAMETERS.minPart[kind];
 const lonLat=parts.map(polygon=>polygon.map(ring=>densify(ring,step)));
 let projection;
 if(kind==='world')projection=d3.geoNaturalEarth1();
 else{const centre=d3.geoCentroid({type:'MultiPolygon',coordinates:lonLat});projection=d3.geoAzimuthalEqualArea().rotate([-centre[0],-centre[1]]);}
 const sample={type:'MultiPoint',coordinates:lonLat.flat(2)};
 const [[a0,b0],[a1,b1]]=d3.geoPath(projection.fitSize([1000,1000],sample)).bounds(sample);
 const provisional=frameFor([a0,b0,a1,b1]);
 projection.fitExtent([[margin,margin],[provisional.width-margin,provisional.height-margin]],sample);
 // The generator re-fits on the traced union of the parts that keep minPart; the projected outer rings stand in for it.
 const projected=lonLat.map(polygon=>polygon[0].map(point=>projection(point)).filter(Boolean)).filter(ring=>ring.length>2);
 const kept=projected.filter(ring=>Math.abs(ringArea(ring))>=minPart);
 const frame=frameFor(boundsOf(kept.length?kept:projected));
 const toFrame=([x,y])=>[x*frame.scale+frame.dx,y*frame.scale+frame.dy];
 const mine=boundsOf(kept.map(ring=>ring.map(toFrame)));
 return {frame,mine,place:(coordinates,fit=null)=>{
  const p=projection(coordinates);if(!p)return null;let [x,y]=toFrame(p);
  // When the published frame differs (islands kept or merged differently), map the outline bounds onto the published ones.
  if(fit){x=fit[0]+(x-mine[0])*(fit[2]-fit[0])/(mine[2]-mine[0]);y=fit[1]+(y-mine[1])*(fit[3]-fit[1])/(mine[3]-mine[1]);}
  return [Math.round(x*10)/10,Math.round(y*10)/10];
 }};
}
const pathBounds=d=>{const values=d.match(/-?\d+(?:\.\d+)?/g).map(Number),points=[];for(let i=0;i+1<values.length;i+=2)points.push([values[i],values[i+1]]);return boundsOf([points]);};

const features=geojson.features.filter(feature=>feature.properties.ADM0_A3!=='ATA');
const byId=new Map(features.map(feature=>[featureId(feature.properties),feature]));
const POINTS={world:{},continents:{},countries:{}},report=[];
let fit=null;
const check=(label,frame,shape)=>{const [,,w,h]=shape.viewBox.split(/\s+/).map(Number),ok=Math.abs(frame.width-w)<=0.3&&Math.abs(frame.height-h)<=0.3;report.push({label,computed:[frame.width,frame.height],published:[w,h],ok});fit=ok?null:pathBounds(shape.d);};
const fill=(target,place,campuses)=>{for(const campus of campuses){const p=place(campus.coordinates,fit);if(p)target[campus.id]=p;}};

{const {frame,place}=placer('world',features.flatMap(feature=>polygonsOf(feature.geometry)));check('world',frame,SHAPES.world);fill(POINTS.world,place,catalog.campuses);}
for(const {id,countries} of CONTINENTS){
 const rule=CONTINENT_RULES[id],parts=[];
 for(const feature of features){const fid=featureId(feature.properties),extra=rule.add?.[fid];if(feature.properties.REGION_UN!==rule.region&&!extra)continue;parts.push(...selectParts(polygonsOf(feature.geometry),{...rule,window:extra??rule.window}));}
 const {frame,place}=placer('continent',parts);check(id,frame,SHAPES.continents[id]);
 POINTS.continents[id]={};
 // Asia's window unwraps Chukotka, never a campus; longitudes stay as they are.
 fill(POINTS.continents[id],place,catalog.campuses.filter(campus=>countries.includes(campus.country)));
}
for(const country of catalog.countries){
 const feature=byId.get(country.id);
 const {frame,place}=placer('country',selectParts(polygonsOf(feature.geometry),COUNTRY_RULES[country.id]??{}));
 check(country.id,frame,SHAPES.countries[country.id]);
 POINTS.countries[country.id]={};fill(POINTS.countries[country.id],place,catalog.campuses.filter(campus=>campus.country===country.id));
}
const out=fileURLToPath(new URL('../campus-points.mjs',import.meta.url));
const mapped=report.filter(r=>!r.ok).map(r=>r.label).join(', ');
writeFileSync(out,`// Generated by tools/build-campus-points.mjs: campus positions in the viewBoxes of site-b/explorer-shapes.mjs.\n// Frames repeated exactly for ${report.filter(r=>r.ok).length}/${report.length} shapes (within 0.3 unit)${mapped?`; ${mapped}: mapped on the published outline bounds`:''}.\n// Rebuild whenever site-b/explorer-shapes.mjs changes.\nexport const POINTS=${JSON.stringify(POINTS)};\n`);
console.log(JSON.stringify(report.filter(r=>!r.ok)),report.filter(r=>r.ok).length+'/'+report.length);
