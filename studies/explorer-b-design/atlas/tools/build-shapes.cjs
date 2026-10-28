// Atlas study (24 Oct 2026): what the design needs on top of site-b/explorer-shapes.mjs ({viewBox,d} only).
//  1. ATLAS_META, keyed like the site-b asset and expressed in its units: projected campus pins, a label anchor
//     (pole of inaccessibility of the main part), the bbox and, for Europe and Asia, the straight Urals cut that
//     the renderer fades. Pins are aligned by fitting our projection of the same main part onto the asset's one.
//  2. ATLAS_STANDIN (atlas-standin.mjs), a stand-in built with the same rules (used only if the site-b asset is missing), and the
//     orthographic globe of the "Monde" item, which the asset does not provide (its world is a flat Natural Earth 1).
// Rules mirror the header of site-b/explorer-shapes.mjs (windows, Morocco with Western Sahara, Russia cut at 50.5°E).
// Usage: node build-shapes.cjs <repoRoot> <out.mjs>
// Inputs (read-only): site/geography/world-countries.topo.json (Natural Earth 5.1.1, 10m), shared/map-data/world.json
// (110m, globe only), site/campuses.json, site-b/explorer-shapes.mjs, shared/map-data/{d3,topojson}.min.js.
'use strict';
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const [root, out] = process.argv.slice(2);
const d3 = require(path.join(root, 'shared/map-data/d3.min.js'));
const topojson = require(path.join(root, 'shared/map-data/topojson.min.js'));
const topo = JSON.parse(fs.readFileSync(path.join(root, 'site/geography/world-countries.topo.json'), 'utf8'));
const world110 = JSON.parse(fs.readFileSync(path.join(root, 'shared/map-data/world.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'site/campuses.json'), 'utf8'));
const BOX = 1000, fmt = v => Math.round(v * 100) / 100;

// UN M49 regions approximated by lists (the topology carries id and name only); Russia is handled by windows.
const EUROPE = 'ALA ALB AND AUT BEL BGR BIH BLR CHE CZE DEU DNK ESP EST FIN FRA FRO GBR GGY GIB GRC HRV HUN IMN IRL ISL ITA JEY KOS LIE LTU LUX LVA MCO MDA MKD MLT MNE NLD NOR POL PRT ROU RUS SMR SRB SVK SVN SWE UKR VAT SJM'.split(' ');
const AFRICA = 'DZA AGO BEN BWA BFA BDI CMR CPV CAF TCD COM COG COD CIV DJI EGY GNQ ERI SWZ ETH GAB GMB GHA GIN GNB KEN LSO LBR LBY MDG MWI MLI MRT MUS MAR MOZ NAM NER NGA RWA STP SEN SYC SLE SOM ZAF SSD SDN TZA TGO TUN UGA ZMB ZWE SAH ESH SOL'.split(' ');
const OCEANIA = 'AUS NZL PNG FJI SLB VUT NCL PYF WSM TON KIR FSM MHL PLW NRU TUV NIU COK ASM GUM MNP WLF NFK PCN HMD ATF ATA'.split(' ');
const features = topojson.feature(topo, topo.objects.countries).features;
const featureById = new Map(features.map(f => [f.id, f]));
const polygonsOf = g => !g ? [] : g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
const polyArea = p => d3.geoArea({type: 'Polygon', coordinates: p});
const fixWinding = p => polyArea(p) > 2 * Math.PI ? p.map(r => r.slice().reverse()) : p;
const centroidOf = p => d3.geoCentroid({type: 'Polygon', coordinates: p});
function regionOf(f) {
 if (EUROPE.includes(f.id)) return 'europe';
 if (AFRICA.includes(f.id)) return 'africa';
 if (OCEANIA.includes(f.id)) return null;
 const polys = polygonsOf(f.geometry).map(fixWinding); if (!polys.length) return null;
 const [lon, lat] = centroidOf(polys.reduce((a, b) => polyArea(a) > polyArea(b) ? a : b));
 if (lat < -56) return null;
 return lon < -25 ? 'americas' : 'asia';
}
// Sutherland-Hodgman against one lon/lat half-plane, then a rectangle window
function clipRing(ring, test, cut) {
 const res = [];
 for (let i = 0; i < ring.length; i++) {
  const p = ring[i], q = ring[(i + 1) % ring.length], pin = test(p), qin = test(q);
  if (pin) res.push(p);
  if (pin !== qin) res.push(cut(p, q));
 }
 return res.length >= 3 ? res : null;
}
const lonCut = k => (p, q) => [k, p[1] + (k - p[0]) / (q[0] - p[0]) * (q[1] - p[1])];
const latCut = k => (p, q) => [p[0] + (k - p[1]) / (q[1] - p[1]) * (q[0] - p[0]), k];
function windowPolys(polys, [x0, y0, x1, y1]) {
 const clipOne = ring => {
  let r = ring;
  for (const [test, cut] of [[p => p[0] >= x0, lonCut(x0)], [p => p[0] <= x1, lonCut(x1)], [p => p[1] >= y0, latCut(y0)], [p => p[1] <= y1, latCut(y1)]]) { if (!r) return null; r = clipRing(r, test, cut); }
  return r && [...r, r[0]];
 };
 return polys.map(p => p.map(clipOne).filter(Boolean)).filter(p => p.length && p[0].length >= 4);
}
const inBox = ([lon, lat], [x0, y0, x1, y1]) => lon >= x0 && lon <= x1 && lat >= y0 && lat <= y1;
const dropBox = (polys, box) => polys.filter(p => !inBox(centroidOf(p), box));
const unwrap = polys => polys.map(p => p.map(r => r.map(([lon, lat]) => [lon < 0 ? lon + 360 : lon, lat])));

// geometry helpers in projected space
const ringArea = r => { let s = 0; for (let i = 0, n = r.length; i < n; i++) { const [a, b] = r[i], [c, d] = r[(i + 1) % n]; s += a * d - c * b; } return s / 2; };
function dp(points, tol) {
 if (points.length < 3) return points.slice();
 const keep = new Uint8Array(points.length); keep[0] = keep[points.length - 1] = 1; const stack = [[0, points.length - 1]];
 while (stack.length) {
  const [a, b] = stack.pop(); let max = -1, idx = -1; const [ax, ay] = points[a], [bx, by] = points[b], dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-9;
  for (let i = a + 1; i < b; i++) { const [px, py] = points[i], d = Math.abs(dy * px - dx * py + bx * ay - by * ax) / len; if (d > max) { max = d; idx = i; } }
  if (max > tol) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
 }
 return points.filter((_, i) => keep[i]);
}
function simplifyRing(ring, tol) {
 if (ring.length < 4) return ring;
 let far = 0, fd = -1; for (let i = 1; i < ring.length; i++) { const d = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]); if (d > fd) { fd = d; far = i; } }
 const res = dp(ring.slice(0, far + 1), tol).concat(dp(ring.slice(far).concat([ring[0]]), tol).slice(1, -1));
 return res.length >= 3 ? res : ring;
}
function pointToRingDist(x, y, ring) {
 let inside = false, min = Infinity;
 for (let i = 0, n = ring.length, j = n - 1; i < n; j = i++) {
  const [ax, ay] = ring[i], [bx, by] = ring[j];
  if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  const dx = bx - ax, dy = by - ay; let t = ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1e-9); t = Math.max(0, Math.min(1, t));
  min = Math.min(min, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
 }
 return (inside ? 1 : -1) * min;
}
function polylabel(ring, precision) {
 let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
 for (const [x, y] of ring) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
 const w = maxX - minX, h = maxY - minY, size = Math.min(w, h), half = size / 2;
 const cell = (x, y, hh) => { const d = pointToRingDist(x, y, ring); return {x, y, h: hh, d, max: d + hh * Math.SQRT2}; };
 let q = []; for (let x = minX; x < maxX; x += size) for (let y = minY; y < maxY; y += size) q.push(cell(x + half, y + half, half));
 let best = cell(minX + w / 2, minY + h / 2, 0);
 while (q.length) {
  q.sort((a, b) => b.max - a.max); const c = q.shift(); if (c.d > best.d) best = c; if (c.max - best.d <= precision) continue;
  const hh = c.h / 2; q.push(cell(c.x - hh, c.y - hh, hh), cell(c.x + hh, c.y - hh, hh), cell(c.x - hh, c.y + hh, hh), cell(c.x + hh, c.y + hh, hh));
  if (q.length > 4000) q = q.sort((a, b) => b.max - a.max).slice(0, 2000);
 }
 return [best.x, best.y];
}
function projectedRings(projection, geometry) {
 const rings = []; let cur = null;
 d3.geoPath(projection, {moveTo(x, y) { cur = [[x, y]]; rings.push(cur); }, lineTo(x, y) { cur.push([x, y]); }, closePath() {}, arc() {}})(geometry);
 return rings.filter(r => r.length >= 3);
}
const bboxOf = r => { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const [x, y] of r) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; };
const mainRing = rings => rings.reduce((a, b) => Math.abs(ringArea(a)) > Math.abs(ringArea(b)) ? a : b);
function parsePath(d) { return d.split('M').filter(Boolean).map(s => { const n = s.replace(/Z/g, ' ').trim().split(/[\s,L]+/).map(Number); const r = []; for (let i = 0; i + 1 < n.length; i += 2) r.push([n[i], n[i + 1]]); return r; }).filter(r => r.length >= 3); }

// one shape: our projection of the parts; stand-in path; meta aligned to the asset when it exists
function build(polys, pins, real, {cutLon = null, cutSide = null, id = ''} = {}) {
 const geometry = {type: 'MultiPolygon', coordinates: polys};
 const centroid = d3.geoCentroid(geometry);
 const projection = d3.geoAzimuthalEqualArea().rotate([-centroid[0], -centroid[1]]).fitExtent([[20, 20], [BOX - 20, BOX - 20]], geometry);
 let rings = projectedRings(projection, geometry).map(r => simplifyRing(r, 1.4));
 const areas = rings.map(r => Math.abs(ringArea(r))), maxA = Math.max(...areas);
 rings = rings.filter((r, i) => areas[i] >= 300 || areas[i] === maxA);
 const mine = bboxOf(mainRing(rings));
 // target space: the asset (if given), else our own fitted box
 let map = p => p, viewBox, w, h, standIn = null;
 if (real) {
  // two candidate fits (main part, all parts); keep the one whose x and y scales agree best
  const realRings = parsePath(real.d), ownAll = bboxOf(rings.flat()), theirAll = bboxOf(realRings.flat()), theirMain = bboxOf(mainRing(realRings));
  const fit = (a, b) => { const sx = (b[2] - b[0]) / (a[2] - a[0]), sy = (b[3] - b[1]) / (a[3] - a[1]); return {a, b, sx, sy, skew: Math.abs(sx / sy - 1)}; };
  const best = [fit(mine, theirMain), fit(ownAll, theirAll)].sort((p, q) => p.skew - q.skew)[0];
  if (best.skew > .03) console.warn('alignment skew', id, best.skew.toFixed(3));
  // a single scale (azimuthal equal-area on both sides): the mean, centred on the chosen boxes
  const s = (best.sx + best.sy) / 2, ca = [(best.a[0] + best.a[2]) / 2, (best.a[1] + best.a[3]) / 2], cb = [(best.b[0] + best.b[2]) / 2, (best.b[1] + best.b[3]) / 2];
  map = ([x, y]) => [cb[0] + (x - ca[0]) * s, cb[1] + (y - ca[1]) * s];
  [, , w, h] = real.viewBox.split(/\s+/).map(Number); viewBox = real.viewBox;
 } else {
  let all = bboxOf(rings.flat()); const pad = 24;
  map = ([x, y]) => [x - all[0] + pad, y - all[1] + pad]; w = all[2] - all[0] + 2 * pad; h = all[3] - all[1] + 2 * pad; viewBox = `0 0 ${fmt(w)} ${fmt(h)}`;
 }
 const target = real ? parsePath(real.d) : rings.map(r => r.map(map));
 const main = mainRing(target);
 const [lx, ly] = polylabel(main, Math.max(w, h) / 2000);
 const [bx0, by0, bx1, by1] = bboxOf(target.flat());
 const pinOut = {};
 for (const c of pins) { const p = projection(c.coordinates); if (p) { const [x, y] = map(p); pinOut[c.id] = [fmt(x), fmt(y)]; } }
 const meta = {label: [fmt(lx), fmt(ly)], bbox: [fmt(bx0), fmt(by0), fmt(bx1 - bx0), fmt(by1 - by0)], pins: pinOut};
 if (cutLon != null) {
  // the straight cut along cutLon: endpoints from the clipped parts, an inner point on the kept side
  const lats = polys.flatMap(p => p.flatMap(r => r.filter(([lon]) => Math.abs(lon - cutLon) < 1e-9).map(([, lat]) => lat)));
  const lo = Math.min(...lats), hi = Math.max(...lats);
  const a = map(projection([cutLon, lo])), b = map(projection([cutLon, hi])), inner = map(projection([cutLon + (cutSide === 'east' ? 5 : -5), (lo + hi) / 2]));
  meta.cut = {a: a.map(fmt), b: b.map(fmt), inner: inner.map(fmt)};
 }
 if (!real) standIn = {viewBox, d: rings.map(r => 'M' + r.map(map).map(([x, y]) => fmt(x) + ' ' + fmt(y)).join('L') + 'Z').join('')};
 return {meta, standIn, w, h, viewBox};
}

(async () => {
 let real = null;
 try { real = (await import(pathToFileURL(path.join(root, 'site-b/explorer-shapes.mjs')).href)).SHAPES; } catch { console.warn('site-b/explorer-shapes.mjs missing: stand-in only'); }
 const campuses = catalog.campuses;
 const COUNTRY_RULES = {FRA: {window: [-6, 41, 10, 52]}, ESP: {window: [-10, 35.5, 5, 44.5]}, PRT: {window: [-10, 36.5, -6, 42.5]}, NLD: {window: [3, 50.5, 7.5, 54]}, JPN: {window: [128, 30.9, 146.5, 46]}, ARM: {drop: [45.3, 40.5, 45.7, 40.8]}, MAR: {with: 'ESH'}};
 const META = {countries: {}, continents: {}}, STAND = {countries: {}, continents: {}};
 for (const {id} of catalog.countries) {
  const rule = COUNTRY_RULES[id] || {};
  let polys = polygonsOf(featureById.get(id).geometry).map(fixWinding);
  if (rule.with) polys = polys.concat(polygonsOf(featureById.get(rule.with).geometry).map(fixWinding));
  if (rule.window) polys = windowPolys(polys, rule.window);
  if (rule.drop) polys = dropBox(polys, rule.drop);
  const pins = campuses.filter(c => c.country === id);
  META.countries[id] = build(polys, pins, real?.countries?.[id], {id}).meta;
  const own = build(polys, pins, null, {id}); STAND.countries[id] = {...own.standIn, ...own.meta};
 }
 const members = key => features.filter(f => regionOf(f) === key && f.id !== 'RUS').flatMap(f => polygonsOf(f.geometry).map(fixWinding));
 const russia = polygonsOf(featureById.get('RUS').geometry).map(fixWinding);
 const pinsIn = key => campuses.filter(c => regionOf(featureById.get(c.country)) === key);
 const CONT = {
  africa: () => windowPolys(members('africa'), [-26, -36, 64, 38]),
  americas: () => dropBox(windowPolys(members('americas'), [-172, -57, -10, 84]), [-161, 18, -154, 23]),
  asia: () => dropBox(windowPolys(unwrap(members('asia')), [25, -12, 192, 82]).concat(windowPolys(unwrap(russia), [50.5, 0, 192, 82])), [44, 79.5, 66, 82.5]),
  europe: () => windowPolys(members('europe').concat(russia), [-25, 34, 50.5, 72]),
 };
 for (const [key, polysOf] of Object.entries(CONT)) {
  const cut = key === 'europe' ? {cutLon: 50.5, cutSide: 'west', id: key} : key === 'asia' ? {cutLon: 50.5, cutSide: 'east', id: key} : {id: key};
  const polys = polysOf();
  META.continents[key] = build(polys, pinsIn(key), real?.continents?.[key], cut).meta;
  const own = build(polys, pinsIn(key), null, cut); STAND.continents[key] = {...own.standIn, ...own.meta};
 }
 // the "Monde" item: an orthographic globe (110m land), centred on 12°E 22°N
 const land = topojson.merge(world110, world110.objects[Object.keys(world110.objects)[0]].geometries);
 const globe = d3.geoOrthographic().rotate([-12, -22]).fitExtent([[24, 24], [BOX - 24, BOX - 24]], {type: 'Sphere'});
 const gp = d3.geoPath(globe), round = s => s.replace(/(\d+\.\d)\d+/g, '$1');
 const worldPins = {};
 for (const c of campuses) if (d3.geoDistance(c.coordinates, [12, 22]) < Math.PI / 2 - .02) { const p = globe(c.coordinates); worldPins[c.id] = [fmt(p[0]), fmt(p[1])]; }
 const [cx, cy] = globe.translate();
 const GLOBE = {viewBox: `0 0 ${BOX} ${BOX}`, sphere: {cx: fmt(cx), cy: fmt(cy), r: fmt(globe.scale())}, land: round(gp(land)), graticule: round(gp(d3.geoGraticule10())), label: [fmt(cx), fmt(cy)], pins: worldPins};
 const header = `// Generated by tools/build-shapes.cjs (atlas study): do not edit.\n// ATLAS_META is keyed and scaled like site-b/explorer-shapes.mjs (null if it was missing at build time);\n// ATLAS_GLOBE is the orthographic globe of the "Monde" item.\n`;
 fs.writeFileSync(out, header + 'export const ATLAS_META=' + JSON.stringify(real ? META : null) + ';\nexport const ATLAS_GLOBE=' + JSON.stringify(GLOBE) + ';\n');
 const standOut = out.replace(/meta\.mjs$/, 'standin.mjs');
 fs.writeFileSync(standOut, '// Generated by tools/build-shapes.cjs (atlas study): stand-in silhouettes with their own meta, loaded only when\n// site-b/explorer-shapes.mjs cannot be imported. Same rules as the asset (see its header).\nexport const ATLAS_STANDIN=' + JSON.stringify(STAND) + ';\n');
 console.log('written', out, fs.statSync(out).size, 'bytes; aligned to site-b asset:', Boolean(real));
 for (const [k, v] of Object.entries(META.continents)) console.log(k, Object.keys(v.pins).length, 'pins', JSON.stringify(v.cut || null), 'label', v.label);
 console.log('FRA', JSON.stringify(META.countries.FRA));
})();
