/**
 * Natural Earth's Antarctic outer ring closes via the antimeridian and the
 * South Pole. Those edges close a polygon; they are not coastline/borders.
 * Keep country polygons intact for MapLibre fills and D3 selection. Only use
 * this function for the separate line geometry displayed as world borders.
 *
 * MapLibre 5.24 GeoJSON-vt clamps projected latitude to the Mercator extent.
 * Drawing the pole closure as a line therefore produces a false polar circle
 * and dateline spokes. Fill subdivision already extends polar tiles to the
 * actual pole. This line-only correction does not restore coastlines south of
 * the Mercator limit: any remaining fill wedge requires a separate rendering
 * correction, not deletion or movement of the geographic coastline.
 * https://github.com/maplibre/maplibre-gl-js/blob/main/developer-guides/globe.md#data-near-the-poles
 */
const EPSILON = 1e-5;
const samePoint = (a,b) => a.length === b.length && a.every((value,index) => value === b[index]);
const atSouthPole = point => Math.abs(point[1]+90) <= EPSILON;
const atDateline = point => Math.abs(Math.abs(point[0])-180) <= EPSILON;

function artificialPolarEdge(a,b) {
 if(atSouthPole(a) && atSouthPole(b))return true;
 // This bound isolates the Antarctic closing seam. Real coastlines crossing
 // the antimeridian (Fiji, Russia, Alaska, etc.) remain untouched.
 return a[1] < -60 && b[1] < -60 && atDateline(a) && atDateline(b)
  && Math.sign(a[0]) === Math.sign(b[0]);
}

function splitLine(line) {
 const parts = [];
 let current = [];
 const flush = () => {if(current.length >= 2)parts.push(current);current = [];};
 for(let index=1;index<line.length;index++) {
  const a = line[index-1],b = line[index];
  if(artificialPolarEdge(a,b)) {flush();continue;}
  if(!current.length)current.push(a.slice());
  current.push(b.slice());
 }
 flush();
 // A closed ring can begin halfway along the real coast. Join its tail and
 // head there, preserving an open coast between the two dateline endpoints.
 if(parts.length > 1 && samePoint(line[0],line.at(-1))) {
  const first = parts[0],last = parts.at(-1);
  if(samePoint(last.at(-1),first[0])) {
   parts[0] = last.concat(first.slice(1));
   parts.pop();
  }
 }
 return parts;
}

/** Return a fresh MultiLineString; never modify the mesh or source polygons. */
export function removePolarBorderSeams(borders) {
 if(borders == null)return borders;
 if(!['LineString','MultiLineString'].includes(borders.type))throw new TypeError('Expected border LineString or MultiLineString');
 const lines = borders.type === 'LineString' ? [borders.coordinates] : borders.coordinates;
 const {bbox,...rest} = borders;
 return {...rest,type:'MultiLineString',coordinates:lines.flatMap(splitLine)};
}
