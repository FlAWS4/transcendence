import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {removePolarBorderSeams} from '../../../site/polar-geometry.mjs';

const require=createRequire(import.meta.url);
const d3=require('../../../shared/map-data/d3.min.js');
const topojson=require('../../../shared/map-data/topojson.min.js');
const here=path.dirname(fileURLToPath(import.meta.url));
const topology=JSON.parse(fs.readFileSync(path.join(here,'../../../site/geography/world-countries.topo.json')));
const world=topojson.feature(topology,topology.objects.countries);
const borders=removePolarBorderSeams(topojson.mesh(topology,topology.objects.countries));
const spec=JSON.parse(fs.readFileSync(path.join(here,'../welcome-sync-spec.json')));
const center=[6,18], radians=Math.PI/180;
const compact=process.argv.includes('--compact');
const round=value=>Math.round(value*(compact?10:1000))/(compact?10:1000);

// Match the low-zoom, zero-pitch MapLibre 5.24 vertical-perspective transform.
// Source: local vendor/maplibre-gl.js, gi(), vertical transform _calcMatrices().
// Globe scale compensates the camera latitude; camera distance uses default FOV.
function view(width,height,radiusFraction,centerFractionX,stageX,stageY){
 const zoom=Math.log2(Math.min(width,height)/600)+1.88+Math.log2(radiusFraction/.425);
 const physicalRadius=512*2**zoom/(2*Math.PI*Math.cos(center[1]*radians));
 const cameraDistance=height*.5/Math.tan(.6435011087932844/2);
 const distance=cameraDistance/physicalRadius;
 const horizon=Math.acos(1/(distance+1))/radians;
 const screenRadius=cameraDistance/Math.sqrt((distance+1)**2-1);
 const raw=(lon,lat)=>{
  const scale=distance/(distance+1-Math.cos(lat)*Math.cos(lon));
  return [scale*Math.cos(lat)*Math.sin(lon),scale*Math.sin(lat)];
 };
 const projection=d3.geoProjection(raw).rotate([-center[0],-center[1]])
  .clipAngle(horizon-1e-7).scale(physicalRadius).translate([screenRadius,screenRadius]).precision(.025);
 return {width,height,zoom,physicalRadius,cameraDistance,distance,horizon,screenRadius,
  mapCenter:[width*centerFractionX,height*.5],stageOffset:[stageX,stageY],projection};
}

// Keep the SVG practical to edit. Maximum projected line simplification is .055px.
// This is finer than a pixel and does not replace the geographic source dataset.
function simplify(points,tolerance=compact?.25:.055){
 if(points.length<=2)return points;
 const keep=new Uint8Array(points.length);keep[0]=keep[points.length-1]=1;
 const stack=[[0,points.length-1]],threshold=tolerance*tolerance;
 while(stack.length){
  const [first,last]=stack.pop(),a=points[first],b=points[last];
  const dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy;
  let best=-1,max=threshold;
  for(let i=first+1;i<last;i++){
   const p=points[i],u=den?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)):0;
   const dd=(p[0]-a[0]-u*dx)**2+(p[1]-a[1]-u*dy)**2;
   if(dd>max){max=dd;best=i;}
  }
  if(best>=0){keep[best]=1;stack.push([first,best],[best,last]);}
 }
 return points.filter((p,i)=>keep[i]);
}
function geometryPath(geometry,projection){
 const pieces=[];let current=null;
 const context={
  moveTo(x,y){if(current)pieces.push(current);current={points:[[x,y]],closed:false};},
  lineTo(x,y){current.points.push([x,y]);},
  closePath(){current.closed=true;},
  arc(){throw new Error('Point arcs are not part of the map paths');},
 };
 d3.geoPath(projection,context)(geometry);
 if(current)pieces.push(current);
 return pieces.map(piece=>{
  const list=piece.closed?[...piece.points,piece.points[0]]:piece.points;
  let points=simplify(list);
  if(piece.closed){points=points.slice(0,-1);if(points.length<3){if(compact)return '';points=piece.points;}}
  if(compact&&points.every(p=>Math.hypot(p[0]-points[0][0],p[1]-points[0][1])<.25))return '';
  if(compact&&points.length>1){
   const integer=points.map(p=>p.map(n=>Math.round(n*10)));
   const delta=integer.slice(1).map((p,i)=>[p[0]-integer[i][0],p[1]-integer[i][1]]).filter(p=>p[0]||p[1]);
   return delta.length?`M${integer[0].join(',')}l${delta.map(p=>p.join(',')).join(' ')}${piece.closed?'Z':''}`:'';
  }
  return points.length>1?`M${points.map(p=>p.map(round).join(',')).join('L')}${piece.closed?'Z':''}`:'';
 }).join('');
}
function xml(value){return String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');}
const views={desktop:view(1051.2,668,.425,.55,388.8,208),mobile:view(390,429,.46,.5,0,170)};
const palettes={light:{land:'#19B8B5',water:'#D9EEEE',border:'#C4F3EF'},dark:{land:'#256967',water:'#25232B',border:'#A5DBD2'}};
const report={generated:'2026-09-27',camera:{center,pitch:0,bearing:0},source:'Natural Earth 5.1.1, same local topology used by the web prototype',projection:'MapLibre 5.24 vertical perspective at pitch0; default FOV 0.6435011087932844rad',simplificationMaxErrorPixels:.055,views:{},limits:[
 'Projection equations match the CPU MapLibre globe transform at the source camera; not a raster capture of the GPU triangulation.',
 'MapLibre GeoJSON-vt tile simplification, resampling, floating-point latitude correction and antialiasing may differ by subpixels.',
 'Each file is a static vector map, not a rotatable globe. SVG has editable land shapes and shared border paths, no raster image.',
 'Country label collision decisions must be copied from the actual DOM: font metrics and sorting affect which labels stay expanded.',
 'No polar closure artefacts are added; only real Natural Earth rings and the web polar-border seam correction are used.',
]};
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
for(const [name,v] of Object.entries(views)){
 const R=v.screenRadius,size=R*2;
 const countries=world.features.map(feature=>({id:feature.properties.id,name:feature.properties.name,path:geometryPath(feature,v.projection)})).filter(c=>c.path);
 const borderPath=geometryPath(borders,v.projection),borderWidth=.4+.07*v.zoom,borderOpacity=.72+(.03/7)*v.zoom;
 for(const [theme,p] of Object.entries(palettes)){
  if(compact&&theme!=='light')continue;
  const sizeText=(Math.round(size*1000)/1000),RText=(Math.round(R*1000)/1000),scale=compact?' transform="scale(.1)"':'';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${sizeText}" height="${sizeText}" viewBox="0 0 ${sizeText} ${sizeText}"><title>42 Horizon — monde ${name}, ${theme}</title><circle id="Ocean" cx="${RText}" cy="${RText}" r="${RText}" fill="${p.water}"/><g id="Land" fill="${p.land}"${scale}>${countries.map(c=>`<path id="${xml(c.id)}" data-name="${xml(c.name)}" d="${c.path}"/>`).join('')}</g><path id="Shared-borders" d="${borderPath}"${scale} fill="none" stroke="${p.border}" stroke-width="${Math.round(borderWidth*(compact?10:1)*1000)/1000}" stroke-opacity="${Math.round(borderOpacity*1000)/1000}" stroke-linejoin="round"/></svg>`;
  fs.writeFileSync(path.join(here,compact?(name==='desktop'?'world-compact.svg':'world-mobile-compact.svg'):`world-${name}-${theme}.svg`),svg);
 }
 const markers=spec.map.markerData.countries.map(country=>{
  const coordinate=country.centroidOfMemberCampuses,p=v.projection(coordinate);
  const distance=d3.geoDistance(center,coordinate);
  const visible=distance<=v.horizon*radians&&distance<Math.PI/2-.07;
  return {id:country.id,labels:country.labels,coordinates:coordinate,visible,
   globeLocal:p.map(round),mapLocal:p.map((n,i)=>round(n-R+v.mapCenter[i])),
   page:p.map((n,i)=>round(n-R+v.mapCenter[i]+v.stageOffset[i])),distanceDegrees:round(distance/radians)};
 }).sort((a,b)=>a.distanceDegrees-b.distanceDegrees);
 const {projection,...numbers}=v;
 report.views[name]={...numbers,diameter:size,visibleCountryShapes:countries.length,geographyTopLeft:v.mapCenter.map((n,i)=>n-R+v.stageOffset[i]),borderWidth,borderOpacity,markers};
 fs.writeFileSync(path.join(here,compact?(name==='desktop'?'world-compact-paths.json':'world-mobile-compact-paths.json'):`world-${name}-paths.json`),JSON.stringify({size,R,countries,borders:borderPath}));
}
if(!compact)fs.writeFileSync(path.join(here,'world-vector-state.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(report.views).map(([k,v])=>[k,{diameter:v.diameter,geographyTopLeft:v.geographyTopLeft,visibleCountryShapes:v.visibleCountryShapes,visibleMarkers:v.markers.filter(m=>m.visible).length}]))));
}

export {geometryPath};
