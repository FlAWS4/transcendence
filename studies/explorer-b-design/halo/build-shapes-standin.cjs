// Builds stand-in silhouettes for the "halo" study (read-only on the sources).
// Countries: site/geography/world-countries.geojson. Continents and world: shared/map-data/world.json (110m)
// with UN regions read from a local Natural Earth 10m copy. Output: studies/explorer-b-design/halo/shapes-standin.js
// Usage, from the repository root:
//   node studies/explorer-b-design/halo/build-shapes-standin.cjs <ne_10m_admin_0_countries.geojson> studies/explorer-b-design/halo/shapes-standin.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../..');
const d3 = require(path.join(ROOT, 'shared/map-data/d3.min.js'));
const topojson = require(path.join(ROOT, 'shared/map-data/topojson.min.js'));
const NE = process.argv[2];
const OUT = process.argv[3];

const countriesGeo = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/geography/world-countries.geojson'), 'utf8'));
const world = JSON.parse(fs.readFileSync(path.join(ROOT, 'shared/map-data/world.json'), 'utf8'));
const campusData = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/campuses.json'), 'utf8'));
const ne = JSON.parse(fs.readFileSync(NE, 'utf8'));
const region = {};
for (const f of ne.features) {
  const p = f.properties;
  for (const k of ['ADM0_A3', 'ISO_A3', 'SOV_A3', 'GU_A3', 'BRK_A3']) {
    const v = p[k];
    if (v && v !== '-99' && !(v in region)) region[v] = p.REGION_UN;
  }
}
const campuses = campusData.campuses;
const CONT = {
  africa: ['AGO', 'MAR', 'MDG'], americas: ['BRA', 'CAN'],
  asia: ['ARE', 'ARM', 'JOR', 'JPN', 'KOR', 'LBN', 'MYS', 'PSE', 'SGP', 'THA', 'TUR'],
  europe: ['ALB', 'AUT', 'BEL', 'CHE', 'CZE', 'DEU', 'ESP', 'FRA', 'GBR', 'ITA', 'LUX', 'NLD', 'POL', 'PRT'],
};
const r1 = v => Math.round(v * 10) / 10;

// ---- geometry helpers -------------------------------------------------------------------
function dp(points, tol) { // Douglas-Peucker on an open polyline
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length); keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let max = 0, idx = -1;
    const [ax, ay] = points[a], [bx, by] = points[b]; const dx = bx - ax, dy = by - ay; const len = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i];
      const dist = Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
      if (dist > max) { max = dist; idx = i; }
    }
    if (max > tol && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return points.filter((_, i) => keep[i]);
}
function simplifyRing(ring, tol) {
  if (ring.length < 4) return ring;
  // split the closed ring at its farthest point so DP keeps the shape
  let far = 0, best = 0;
  for (let i = 1; i < ring.length; i++) { const d = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]); if (d > best) { best = d; far = i; } }
  const a = dp(ring.slice(0, far + 1), tol), b = dp(ring.slice(far), tol);
  return a.concat(b.slice(1));
}
const ringArea = r => { let s = 0; for (let i = 0, n = r.length; i < n; i++) { const [x1, y1] = r[i], [x2, y2] = r[(i + 1) % n]; s += x1 * y2 - x2 * y1; } return s / 2; };
// Parse an absolute path string produced by d3.geoPath (M/L/Z only) into rings.
function parseRings(d) {
  const rings = []; let cur = null;
  const re = /([MLZ])([^MLZ]*)/g; let m;
  while ((m = re.exec(d))) {
    const cmd = m[1], args = m[2].trim();
    if (cmd === 'Z') { if (cur) { rings.push(cur); cur = null; } continue; }
    const nums = args.split(/[ ,]+/).filter(Boolean).map(Number);
    if (cmd === 'M') { if (cur) rings.push(cur); cur = []; }
    for (let i = 0; i + 1 < nums.length; i += 2) cur.push([nums[i], nums[i + 1]]);
  }
  if (cur) rings.push(cur);
  return rings;
}
function ringsToD(rings) {
  return rings.map(r => 'M' + r.map(p => r1(p[0]) + ' ' + r1(p[1])).join('L') + 'Z').join('');
}
function pointInRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function distToRings(x, y, rings) {
  let min = Infinity;
  for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [ax, ay] = r[j], [bx, by] = r[i]; const dx = bx - ax, dy = by - ay; const l2 = dx * dx + dy * dy || 1e-9;
    let t = ((x - ax) * dx + (y - ay) * dy) / l2; t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(x - (ax + t * dx), y - (ay + t * dy)); if (d < min) min = d;
  }
  return min;
}
function insideAny(x, y, rings) { let c = 0; for (const r of rings) if (pointInRing(x, y, r)) c++; return c % 2 === 1; }
function poleOfInaccessibility(rings, bounds, centre) { // clearance minus a pull toward the centre of the box
  const [[x0, y0], [x1, y1]] = bounds; let best = null, bestD = -Infinity;
  const [cx, cy] = centre || [(x0 + x1) / 2, (y0 + y1) / 2];
  const scan = (ax, ay, bx, by, n) => {
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
      const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * j / n;
      if (!insideAny(x, y, rings)) continue;
      const d = distToRings(x, y, rings) - .45 * Math.hypot(x - cx, y - cy); if (d > bestD) { bestD = d; best = [x, y]; }
    }
  };
  scan(x0, y0, x1, y1, 40);
  if (best) { const w = (x1 - x0) / 20, h = (y1 - y0) / 20; scan(best[0] - w, best[1] - h, best[0] + w, best[1] + h, 20); }
  return best || [(x0 + x1) / 2, (y0 + y1) / 2];
}
// Sutherland-Hodgman clip of a lon/lat ring against lon >= cut (side=1) or lon <= cut (side=-1)
function clipRing(ring, cut, side) {
  const inside = p => side > 0 ? p[0] >= cut : p[0] <= cut;
  const out = [];
  for (let i = 0; i < ring.length; i++) {
    const cur = ring[i], prev = ring[(i + ring.length - 1) % ring.length];
    const ci = inside(cur), pi = inside(prev);
    if (ci) {
      if (!pi) { const t = (cut - prev[0]) / (cur[0] - prev[0]); out.push([cut, prev[1] + t * (cur[1] - prev[1])]); }
      out.push(cur);
    } else if (pi) { const t = (cut - prev[0]) / (cur[0] - prev[0]); out.push([cut, prev[1] + t * (cur[1] - prev[1])]); }
  }
  if (out.length && (out[0][0] !== out[out.length - 1][0] || out[0][1] !== out[out.length - 1][1])) out.push(out[0]);
  return out.length >= 4 ? out : null;
}
function clipGeometry(geom, cut, side) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const res = [];
  for (const poly of polys) {
    const outer = clipRing(poly[0], cut, side); if (!outer) continue;
    const holes = poly.slice(1).map(h => clipRing(h, cut, side)).filter(Boolean);
    res.push([outer, ...holes]);
  }
  return {type: 'MultiPolygon', coordinates: res};
}
function filterPolygons(geom, keep) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  return {type: 'MultiPolygon', coordinates: polys.filter(p => keep(p))};
}

// Build one silhouette from a list of features, projected around a centre and fitted to `size`.
function build({features, center, size = 300, tol = 0.55, minArea = 3, projection = 'azimuthal', dots = [], sphere = false}) {
  const fc = {type: 'FeatureCollection', features};
  let proj;
  if (projection === 'orthographic') proj = d3.geoOrthographic().rotate([-center[0], -center[1]]).clipAngle(90);
  else proj = d3.geoAzimuthalEqualArea().rotate([-center[0], -center[1]]).clipAngle(150);
  proj.fitExtent([[0, 0], [1000, 1000]], sphere ? {type: 'Sphere'} : fc);
  const pathGen = d3.geoPath(proj);
  let rings = [];
  for (const f of features) { const d = pathGen(f); if (d) rings.push(...parseRings(d)); }
  // normalise into a size-wide box
  let xs = [], ys = [];
  const boundsSrc = sphere ? parseRings(pathGen({type: 'Sphere'})) : rings;
  for (const r of boundsSrc) for (const [x, y] of r) { xs.push(x); ys.push(y); }
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const k = size / Math.max(maxX - minX, maxY - minY);
  const pad = 4;
  const tx = x => (x - minX) * k + pad, ty = y => (y - minY) * k + pad;
  const w = (maxX - minX) * k + pad * 2, h = (maxY - minY) * k + pad * 2;
  rings = rings.map(r => r.map(([x, y]) => [tx(x), ty(y)]));
  rings = rings.map(r => simplifyRing(r, tol)).filter(r => r.length >= 4 && Math.abs(ringArea(r)) >= minArea);
  const out = {viewBox: `0 0 ${r1(w)} ${r1(h)}`, d: ringsToD(rings)};
  if (sphere) { const s = parseRings(pathGen({type: 'Sphere'}))[0].map(([x, y]) => [tx(x), ty(y)]); const cx = (Math.min(...s.map(p => p[0])) + Math.max(...s.map(p => p[0]))) / 2; const cy = (Math.min(...s.map(p => p[1])) + Math.max(...s.map(p => p[1]))) / 2; out.sphere = {cx: r1(cx), cy: r1(cy), r: r1((Math.max(...s.map(p => p[0])) - Math.min(...s.map(p => p[0]))) / 2)}; }
  // label anchor = pole of inaccessibility of the largest ring (and its holes are ignored)
  const largest = rings.slice().sort((a, b) => Math.abs(ringArea(b)) - Math.abs(ringArea(a)))[0];
  if (largest && !sphere) {
    const bx = largest.map(p => p[0]), by = largest.map(p => p[1]);
    const pole = poleOfInaccessibility([largest], [[Math.min(...bx), Math.min(...by)], [Math.max(...bx), Math.max(...by)]], [w / 2, h / 2]);
    out.label = [r1(pole[0] / w * 100), r1(pole[1] / h * 100)];
  } else out.label = [50, 50];
  out.dots = [];
  for (const c of dots) {
    if (projection === 'orthographic' && d3.geoDistance(c.coordinates, center) > Math.PI / 2 - 0.12) continue;
    const p = proj(c.coordinates); if (!p) continue;
    out.dots.push([r1(tx(p[0])), r1(ty(p[1])), c.id]);
  }
  return out;
}

// ---- countries -------------------------------------------------------------------------
const BOX = {FRA: [-5.5, 41, 10, 51.5], PRT: [-10, 36.8, -6, 42.3], ESP: [-9.5, 35.8, 4.5, 44], NLD: [3, 50.5, 7.5, 54], JPN: [128, 30, 146, 46], GBR: [-9, 49.8, 2, 61], MYS: [99, 0, 120, 8], TUR: [25, 35, 45, 43]};
const FLAG_FIT = {}; // filled in the page
const countries = {};
for (const iso of Object.values(CONT).flat()) {
  const f = countriesGeo.features.find(x => x.properties.id === iso);
  let geom = f.geometry;
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const areas = polys.map(p => d3.geoArea({type: 'Polygon', coordinates: p}));
  const maxA = Math.max(...areas);
  geom = filterPolygons(geom, p => {
    const a = d3.geoArea({type: 'Polygon', coordinates: p});
    const c = d3.geoCentroid({type: 'Polygon', coordinates: p});
    if (BOX[iso]) { const [x0, y0, x1, y1] = BOX[iso]; if (c[0] < x0 || c[0] > x1 || c[1] < y0 || c[1] > y1) return false; }
    return a >= maxA * 0.003;
  });
  const feat = {type: 'Feature', properties: {}, geometry: geom};
  const center = d3.geoCentroid(feat);
  const shape = build({features: [feat], center, size: 300, tol: 0.5, minArea: 2, dots: campuses.filter(c => c.country === iso)});
  countries[iso] = shape;
}

// ---- continents -------------------------------------------------------------------------
const geoms = world.objects.features.geometries;
const all = topojson.feature(world, world.objects.features).features;
const byRegion = name => geoms.filter(g => region[g.properties.id] === name);
const russia = all.find(f => f.properties.id === 'RUS');
const CENTERS = {africa: [18, 2], americas: [-78, 14], asia: [92, 36], europe: [14, 53]};
const REGION = {africa: 'Africa', americas: 'Americas', asia: 'Asia', europe: 'Europe'};
const KEEP = {
  europe: c => c[0] > -26 && c[0] < 62 && c[1] > 34 && c[1] < 72,
  americas: c => !(c[0] < -140 && c[1] < 35) && c[1] < 80,
  africa: c => c[0] > -26,
  asia: c => true,
};
const continents = {};
for (const id of Object.keys(CENTERS)) {
  let list = byRegion(REGION[id]).filter(g => g.properties.id !== 'RUS');
  const merged = topojson.merge(world, list);
  const parts = [{type: 'Feature', properties: {}, geometry: filterPolygons(merged, p => KEEP[id](d3.geoCentroid({type: 'Polygon', coordinates: p})))}];
  if (id === 'europe') parts.push({type: 'Feature', properties: {}, geometry: filterPolygons(clipGeometry(clipGeometry(russia.geometry, 58, -1), 0, 1), p => KEEP.europe(d3.geoCentroid({type: 'Polygon', coordinates: p})))});
  if (id === 'asia') parts.push({type: 'Feature', properties: {}, geometry: clipGeometry(russia.geometry, 58, 1)});
  const dots = campuses.filter(c => CONT[id].includes(c.country));
  continents[id] = build({features: parts, center: CENTERS[id], size: 300, tol: 0.7, minArea: 6, dots});
  if (id === 'europe') continents[id].fade = {x1: .6, y1: .42, x2: .93, y2: .52};
  if (id === 'asia') continents[id].fade = {x1: .17, y1: .3, x2: .03, y2: .12};
}

// ---- world globe -------------------------------------------------------------------------
const land = topojson.merge(world, geoms.filter(g => region[g.properties.id] !== 'Antarctica'));
const worldShape = build({features: [{type: 'Feature', properties: {}, geometry: land}], center: [12, 24], size: 300, tol: 0.7, minArea: 4, projection: 'orthographic', dots: campuses, sphere: true});

const data = {source: 'stand-in built from site/geography/world-countries.geojson and shared/map-data/world.json (Natural Earth); UN regions from Natural Earth 10m', world: worldShape, continents, countries};
fs.writeFileSync(OUT, '// Stand-in silhouettes for the "halo" study, generated on ' + new Date().toISOString().slice(0, 10) + ' (see README).\n// Replaced at runtime by site-b/explorer-shapes.mjs when that file exists.\nexport const SHAPES = ' + JSON.stringify(data) + ';\n');
const sizes = Object.fromEntries(Object.entries(countries).map(([k, v]) => [k, v.d.length]));
console.log('world', worldShape.d.length, 'continents', Object.fromEntries(Object.entries(continents).map(([k, v]) => [k, v.d.length + ' ' + v.viewBox])), sizes);
console.log('bytes', fs.statSync(OUT).size);
