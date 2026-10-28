#!/usr/bin/env node
/* Stand-in silhouettes for the "arcade" study (24 Oct 2026).
 *
 * Used only until site-b/explorer-shapes.mjs exists; the study page prefers that module when it loads.
 * Source: the project's own Natural Earth 5.1.1 geometry (site/geography/world-countries.topo.json) and
 * the UN regions of the same Natural Earth release (tools/un-regions.json, REGION_UN by country id).
 *
 *   node studies/explorer-b-design/arcade/tools/build-standin-shapes.cjs
 *
 * Output: studies/explorer-b-design/arcade/standin-shapes.mjs
 *   SHAPES = {world, continents:{africa,americas,asia,europe}, countries:{ISO3}}, each {viewBox, d, points}
 *   points = {campusId:[x,y]} in the shape's own viewBox (campus markers on the silhouette).
 *
 * Simplification is deliberate ("version simplifiée"): Douglas-Peucker in projected units of a 1000-unit
 * box, small islands dropped, then one Chaikin pass so coastlines read as soft pebbles, not as maps.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../../..');
const d3 = require(path.join(ROOT, 'shared/map-data/d3.min.js'));
const topojson = require(path.join(ROOT, 'shared/map-data/topojson.min.js'));

const topo = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/geography/world-countries.topo.json'), 'utf8'));
const regions = JSON.parse(fs.readFileSync(path.join(__dirname, 'un-regions.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/campuses.json'), 'utf8'));
const geometries = topo.objects.countries.geometries;
const idOf = g => g.id ?? g.properties?.id;
const byId = new Map(geometries.map(g => [idOf(g), g]));

const CONTINENT_REGION = {africa: 'Africa', americas: 'Americas', asia: 'Asia', europe: 'Europe'};
const BOX = 1000;

/* --- geometry helpers ------------------------------------------------------------------------- */
// d3-geo wants clockwise exterior rings; a polygon larger than a hemisphere is a wound-backwards one.
function rewind(polygon) {
  return d3.geoArea({type: 'Polygon', coordinates: polygon}) > 2 * Math.PI ? polygon.map(ring => ring.slice().reverse()) : polygon;
}
function polygonsOf(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [rewind(geometry.coordinates)];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.map(rewind);
  return [];
}
const centroidOf = polygon => d3.geoCentroid({type: 'Polygon', coordinates: polygon});
const areaOf = polygon => d3.geoArea({type: 'Polygon', coordinates: polygon});
const feature = polygons => ({type: 'Feature', geometry: {type: 'MultiPolygon', coordinates: polygons}});

// Planar half-plane clip of a lon/lat ring along a meridian (Sutherland-Hodgman), keep lon >= meridian.
function clipRingEast(ring, meridian) {
  const out = [], inside = p => p[0] >= meridian;
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i], b = ring[i + 1];
    const cut = () => { const t = (meridian - a[0]) / (b[0] - a[0]); return [meridian, a[1] + t * (b[1] - a[1])]; };
    if (inside(a)) { out.push(a); if (!inside(b)) out.push(cut()); }
    else if (inside(b)) out.push(cut());
  }
  if (out.length < 3) return null;
  out.push(out[0]);
  return out;
}
function clipPolygonEast(polygon, meridian) {
  const outer = clipRingEast(polygon[0], meridian);
  if (!outer) return null;
  return [outer, ...polygon.slice(1).map(ring => clipRingEast(ring, meridian)).filter(Boolean)];
}

/* --- projected rings, simplification, smoothing ---------------------------------------------------- */
function projectedRings(projection, geo) {
  const rings = []; let ring = null;
  const context = {
    moveTo(x, y) { ring = [[x, y]]; rings.push(ring); },
    lineTo(x, y) { ring.push([x, y]); },
    closePath() { ring = null; },
    arc() {}, rect() {},
  };
  d3.geoPath(projection, context)(geo);
  return rings.filter(r => r.length > 2);
}
function ringArea(ring) {
  let sum = 0;
  for (let i = 0, n = ring.length; i < n; i++) { const [x1, y1] = ring[i], [x2, y2] = ring[(i + 1) % n]; sum += x1 * y2 - x2 * y1; }
  return sum / 2;
}
function douglasPeucker(points, epsilon) {
  if (points.length < 4) return points;
  const keep = new Uint8Array(points.length); keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    const [ax, ay] = points[first], [bx, by] = points[last];
    const dx = bx - ax, dy = by - ay, length = Math.hypot(dx, dy) || 1e-9;
    let index = -1, max = 0;
    for (let i = first + 1; i < last; i++) {
      const [px, py] = points[i];
      const distance = Math.abs(dy * px - dx * py + bx * ay - by * ax) / length;
      if (distance > max) { max = distance; index = i; }
    }
    if (index > 0 && max > epsilon) { keep[index] = 1; stack.push([first, index], [index, last]); }
  }
  return points.filter((_, i) => keep[i]);
}
function simplifyRing(ring, epsilon) {
  // Split the closed ring at its farthest point from the start so both halves keep their extremes.
  let far = 0, max = 0;
  for (let i = 1; i < ring.length; i++) { const d = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]); if (d > max) { max = d; far = i; } }
  const a = douglasPeucker(ring.slice(0, far + 1), epsilon), b = douglasPeucker([...ring.slice(far), ring[0]], epsilon);
  return [...a, ...b.slice(1, -1)];
}
function chaikin(ring, passes) {
  let points = ring;
  for (let pass = 0; pass < passes; pass++) {
    const next = [];
    for (let i = 0, n = points.length; i < n; i++) {
      const [x1, y1] = points[i], [x2, y2] = points[(i + 1) % n];
      next.push([0.75 * x1 + 0.25 * x2, 0.75 * y1 + 0.25 * y2], [0.25 * x1 + 0.75 * x2, 0.25 * y1 + 0.75 * y2]);
    }
    points = next;
  }
  return points;
}

/* --- build one silhouette ------------------------------------------------------------------------- */
function build({polygons, projection, epsilon, minArea, smooth = 1, campuses = []}) {
  const geo = feature(polygons);
  projection.fitExtent([[0, 0], [BOX, BOX]], geo);
  let rings = projectedRings(projection, geo)
    .map(ring => simplifyRing(ring, epsilon))
    .filter(ring => ring.length > 3 && Math.abs(ringArea(ring)) >= minArea)
    .map(ring => simplifyRing(chaikin(ring, smooth), epsilon * 0.3));
  // Dropped islands can shrink the drawing: rescale what is left so its longer side is BOX again.
  const xs = rings.flat().map(p => p[0]), ys = rings.flat().map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const k = BOX / Math.max(maxX - minX, maxY - minY), margin = BOX * 0.02;
  const fmt = v => (Math.round(v * 10) / 10).toString();
  const X = x => (x - minX) * k + margin, Y = y => (y - minY) * k + margin;
  const d = rings.map(ring => 'M' + ring.map(([x, y]) => fmt(X(x)) + ' ' + fmt(Y(y))).join('L') + 'Z').join('');
  const points = {};
  for (const campus of campuses) {
    const p = projection(campus.coordinates);
    if (p) points[campus.id] = [Math.round(X(p[0]) * 10) / 10, Math.round(Y(p[1]) * 10) / 10];
  }
  return {viewBox: `0 0 ${fmt((maxX - minX) * k + 2 * margin)} ${fmt((maxY - minY) * k + 2 * margin)}`, d, points};
}

/* --- selections --------------------------------------------------------------------------------- */
function mergedPolygons(ids) {
  const merged = topojson.merge(topo, geometries.filter(g => ids.has(idOf(g))));
  return polygonsOf(merged);
}
const within = (polygon, [w, s, e, n]) => { const [x, y] = centroidOf(polygon); return x >= w && x <= e && y >= s && y <= n; };
const allIds = geometries.map(idOf);
const campusesIn = test => catalog.campuses.filter(test);

// World: every country but Antarctica.
const world = build({
  polygons: mergedPolygons(new Set(allIds.filter(id => regions[id] !== 'Antarctica'))),
  projection: d3.geoNaturalEarth1().rotate([-10, 0]),
  epsilon: 1.8, minArea: 30, smooth: 1, campuses: catalog.campuses,
});

const continentSpecs = {
  africa: {projection: d3.geoAzimuthalEqualArea().rotate([-18, -2]), bbox: [-26, -36, 64, 38]},
  americas: {projection: d3.geoAzimuthalEqualArea().rotate([82, -12]), bbox: [-170, -60, -10, 84], drop: p => { const [x, y] = centroidOf(p); return x < -140 && y < 50; }},
  asia: {projection: d3.geoConicEqualArea().parallels([15, 55]).rotate([-95, 0]), bbox: [24, -12, 180, 82]},
  europe: {projection: d3.geoAzimuthalEqualArea().rotate([-10, -52]), bbox: [-25, 34, 45, 72], exclude: ['RUS']},
};
const continents = {};
const continentOfCountry = new Map();
for (const [key, spec] of Object.entries(continentSpecs)) {
  const ids = new Set(allIds.filter(id => regions[id] === CONTINENT_REGION[key] && !(spec.exclude || []).includes(id)));
  let polygons = mergedPolygons(ids).filter(p => within(p, spec.bbox) && !(spec.drop && spec.drop(p)));
  if (key === 'asia') {
    // Asia keeps Siberia: Russia east of 58° E (about the Urals), and Chukotka beyond the antimeridian.
    const russia = polygonsOf(topojson.feature(topo, byId.get('RUS')).geometry);
    for (const polygon of russia) {
      const [x] = centroidOf(polygon);
      if (x < -150) { polygons.push(polygon); continue; }
      const clipped = clipPolygonEast(polygon, 58);
      if (clipped) polygons.push(clipped);
    }
  }
  for (const id of ids) continentOfCountry.set(id, key);
  continents[key] = build({
    polygons, projection: spec.projection, epsilon: 2.2, minArea: 70, smooth: 2,
    campuses: campusesIn(campus => regions[campus.country] === CONTINENT_REGION[key] || (key === 'asia' && campus.country === 'RUS')),
  });
}

// Countries with a campus: the polygons holding the campuses, the large ones, and the nearby islands.
const countries = {};
for (const country of catalog.countries) {
  const geometry = byId.get(country.id);
  if (!geometry) { console.warn('missing geometry', country.id); continue; }
  const polygons = polygonsOf(topojson.feature(topo, geometry).geometry);
  const campuses = catalog.campuses.filter(c => c.country === country.id);
  const contains = (polygon, point) => d3.geoContains({type: 'Polygon', coordinates: polygon}, point);
  const kept = new Set();
  for (const campus of campuses) {
    let index = polygons.findIndex(p => contains(p, campus.coordinates));
    if (index < 0) { // offshore coordinates: nearest centroid
      let best = Infinity;
      polygons.forEach((p, i) => { const d = d3.geoDistance(centroidOf(p), campus.coordinates); if (d < best) { best = d; index = i; } });
    }
    kept.add(index);
  }
  const keptArea = Math.max(...[...kept].map(i => areaOf(polygons[i])));
  polygons.forEach((p, i) => { if (areaOf(p) >= keptArea * 0.2) kept.add(i); });
  const bounds = d3.geoBounds(feature([...kept].map(i => polygons[i])));
  const span = d3.geoDistance(bounds[0], bounds[1]);
  polygons.forEach((p, i) => {
    if (kept.has(i)) return;
    const c = centroidOf(p);
    const near = [...kept].some(k => d3.geoDistance(c, centroidOf(polygons[k])) < span * 0.75);
    if (near) kept.add(i);
  });
  const chosen = [...kept].map(i => polygons[i]);
  const [cx, cy] = d3.geoCentroid(feature(chosen));
  countries[country.id] = build({
    polygons: chosen, projection: d3.geoAzimuthalEqualArea().rotate([-cx, -cy]),
    // Very indented coasts (Canada's archipelago, Korea's islets) get a stronger pass to stay a silhouette.
    epsilon: {CAN: 5, KOR: 3.5, GBR: 3}[country.id] || 2.4, minArea: {CAN: 1600, KOR: 900}[country.id] || 400, smooth: 2, campuses,
  });
}

const out = path.join(__dirname, '..', 'standin-shapes.mjs');
const header = `/* Generated by tools/build-standin-shapes.cjs on ${new Date().toISOString().slice(0, 10)} — stand-in silhouettes for the arcade study.\n` +
  ` * Natural Earth 5.1.1 (public domain) via site/geography/world-countries.topo.json; continents follow the UN regions.\n` +
  ` * Simplified on purpose. Replaced at runtime by site-b/explorer-shapes.mjs when that module exists. */\n`;
fs.writeFileSync(out, header + 'export const STANDIN=true;\nexport const SHAPES=' + JSON.stringify({world, continents, countries}) + ';\n');
const size = fs.statSync(out).size;
console.log('wrote', out, (size / 1024).toFixed(1) + ' KB', 'countries', Object.keys(countries).length);
