// Geographic limits only: no MapLibre, DOM, events, or camera mutations.
export const CAMPUS_RADIUS_KM = 3;
const EARTH_RADIUS_KM = 6371.0088;
const DEG = Math.PI / 180;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const wrap = longitude => ((longitude + 180) % 360 + 360) % 360 - 180;
const unwrapNear = (longitude, reference) => reference + wrap(longitude - reference);
const coordinates = value => Array.isArray(value)
 ? {lng:finite(value[0]),lat:finite(value[1])}
 : {lng:finite(value?.lng),lat:finite(value?.lat)};

/** Return {min,max}; layout zooms are numbers, not callbacks. */
export function getNavigationZoomRange(policy, latitude = 18) {
 if(policy.inFlight)return {min:-2,max:19};
 if(policy.level === 'campus')return {min:14.5,max:19};
 if(policy.level === 'country'){
  const zoom = finite(policy.countryZoom, finite(policy.worldZoom, 1) + 2);
  const max = clamp(Math.min(9.5, zoom + 2.1), -2, 19);
  return {min:clamp(zoom - .25, -2, max),max};
 }
 const lat = clamp(finite(latitude, 18), -75, 75);
 const adjustment = Math.log2(Math.cos(lat * DEG) / Math.cos(18 * DEG));
 const min = clamp(finite(policy.worldZoom, 1) + adjustment, -2, 19);
 return {min,max:clamp(finite(policy.worldZoom, 1) + adjustment + 1.8, min, 19)};
}

// Select the longitude copy closest to a continuous interval. This retains
// every campus without accidentally making a dateline-crossing country global.
function longitudeForInterval(longitude, west, east, reference) {
 const base = unwrapNear(longitude, reference);
 const distance = value => Math.max(west - value, value - east, 0);
 return [base,base - 360,base + 360].reduce((best, value) =>
  distance(value) < distance(best) ||
  (distance(value) === distance(best) && Math.abs(value-reference) < Math.abs(best-reference))
   ? value : best, base);
}

function countryLimits(country) {
 const reference = coordinates(country?.center);
 let west = reference.lng, east = reference.lng, south = reference.lat, north = reference.lat;
 const bounds = country?.bounds;
 if(Array.isArray(bounds) && bounds.length === 2){
  const a = coordinates(bounds[0]), b = coordinates(bounds[1]);
  const difference = b.lng - a.lng;
  const span = Math.abs(difference) >= 360 ? 360 : (difference + 360) % 360;
  west = unwrapNear(a.lng, reference.lng);east = west + span;
  const shift = Math.round((reference.lng - (west + east) / 2) / 360) * 360;
  west += shift;east += shift;
  south = Math.min(a.lat,b.lat);north = Math.max(a.lat,b.lat);
 }
 for(const campus of country?.members || []){
  const point = coordinates(campus.coordinates);
  const longitude = longitudeForInterval(point.lng,west,east,reference.lng);
  west = Math.min(west,longitude);east = Math.max(east,longitude);
  south = Math.min(south,point.lat);north = Math.max(north,point.lat);
 }
 const xMargin = Math.max(.05,(east-west)*.03), yMargin = Math.max(.05,(north-south)*.03);
 return {west:west-xMargin,east:east+xMargin,south:clamp(south-yMargin,-85,85),north:clamp(north+yMargin,-85,85),reference:reference.lng};
}

function campusCenter(campus, requested) {
 const origin = coordinates(campus.coordinates);
 const latitude = clamp(requested.lat,-85,85);
 const longitude = unwrapNear(requested.lng,origin.lng);
 const lat1 = origin.lat*DEG,lat2 = latitude*DEG,deltaLat = lat2-lat1,deltaLon = (longitude-origin.lng)*DEG;
 const haversine = Math.sin(deltaLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(deltaLon/2)**2;
 const distance = 2*Math.atan2(Math.sqrt(clamp(haversine,0,1)),Math.sqrt(1-clamp(haversine,0,1)));
 const radius = CAMPUS_RADIUS_KM/EARTH_RADIUS_KM;
 if(distance <= radius)return {lng:longitude,lat:latitude};
 const bearing = Math.atan2(Math.sin(deltaLon)*Math.cos(lat2),Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(deltaLon));
 const destinationLat = Math.asin(clamp(Math.sin(lat1)*Math.cos(radius)+Math.cos(lat1)*Math.sin(radius)*Math.cos(bearing),-1,1));
 const destinationLon = origin.lng + Math.atan2(Math.sin(bearing)*Math.sin(radius)*Math.cos(lat1),Math.cos(radius)-Math.sin(lat1)*Math.sin(destinationLat))/DEG;
 return {lng:destinationLon,lat:destinationLat/DEG};
}

/**
 * policy = {level,country,campus,worldZoom,countryZoom,inFlight}.
 * GeoJSON pairs are [longitude,latitude]. Input lngLat can also be a pair.
 * Country/campus output longitudes remain unwrapped near their local reference.
 */
export function constrainNavigation(policy, lngLat, zoom) {
 const requested = coordinates(lngLat);
 let center;
 if(policy.inFlight){
  center = {lng:requested.lng,lat:clamp(requested.lat,-85,85)};
 }else if(policy.level === 'country' && policy.country){
  const bounds = countryLimits(policy.country);
  const longitude = longitudeForInterval(requested.lng,bounds.west,bounds.east,bounds.reference);
  center = {lng:clamp(longitude,bounds.west,bounds.east),lat:clamp(requested.lat,bounds.south,bounds.north)};
 }else if(policy.level === 'campus' && policy.campus){
  center = campusCenter(policy.campus,requested);
 }else{
  center = {lng:wrap(requested.lng),lat:clamp(requested.lat,-75,75)};
 }
 const range = getNavigationZoomRange(policy,center.lat);
 return {center,zoom:clamp(finite(zoom,range.min),range.min,range.max)};
}
