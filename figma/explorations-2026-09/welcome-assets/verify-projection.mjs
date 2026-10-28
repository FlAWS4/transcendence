import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const original=fs.readFileSync(path.join(here,'../../../site/vendor/maplibre-gl.js'),'utf8');
if(original.split('class zi{').length!==2)throw new Error('Pinned MapLibre transform export location changed');
// Expose the internal CPU transform in memory only. The vendor file stays intact.
const source=original.replace('class zi{','e.__horizonVerticalTransform=()=>zi;class zi{');
const module=new Module('maplibre-analysis');module._compile(source,'maplibre-analysis');
const lib=module.exports,Transform=lib.__horizonVerticalTransform();
const world=JSON.parse(fs.readFileSync(path.join(here,'world-vector-state.json')));
const france=JSON.parse(fs.readFileSync(path.join(here,'france-vector-state.json')));
const results=[];
for(const [level,state] of [['world',world],['France',france]]){
 for(const [format,view] of Object.entries(state.views)){
  const transform=new Transform();transform.setMinZoom(-2);transform.resize(view.width,view.height);
  transform.setCenter(new lib.LngLat(...(view.camera?.center||world.camera.center)));
  transform.setZoom(view.camera?.zoom||view.zoom);
  const x=view.mapCenter[0]/view.width;
  transform.setPadding({top:0,bottom:0,left:Math.max(0,(2*x-1)*view.width),right:Math.max(0,(1-2*x)*view.width)});
  const markers=view.markers||view.campuses;
  let maxError=0;
  for(const marker of markers){
   const actual=transform.locationToScreenPoint(new lib.LngLat(...marker.coordinates));
   maxError=Math.max(maxError,Math.hypot(actual.x-marker.mapLocal[0],actual.y-marker.mapLocal[1]));
  }
  if(maxError>.001)throw new Error(`${level}/${format} exceeded .001px CPU projection tolerance`);
  results.push({level,format,markersCompared:markers.length,maxMarkerProjectionErrorPixels:maxError});
 }
}
const verification={date:'2026-09-27',method:'Compare projected source-coordinate metadata with the actual local MapLibre5.24 CPU vertical-perspective transform. In-memory export injection only; vendor source on disk unchanged.',results,limit:'Checks analytic projection coordinates, not GPU raster antialiasing or Figma SVG import fidelity.'};
fs.writeFileSync(path.join(here,'projection-verification.json'),JSON.stringify(verification,null,2)+'\n');
console.log(verification);
