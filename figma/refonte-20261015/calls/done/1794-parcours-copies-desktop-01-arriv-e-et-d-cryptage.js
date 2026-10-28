// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « 09 · Parcours · ordinateur », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('760:7');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('1:8');
if (src.id !== dest.id) await src.loadAsync();
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "desktop|fr|v|arrival-encrypted", "src": "575:1635", "name": "Arrivée : message chiffré · message chiffré au repos — Ordinateur · Clair", "section": "760:8", "at": [4880, 1420], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|arrival-labels-ar", "src": "576:1753", "name": "Arrivée : message chiffré · libellés en arabe — Ordinateur · Clair", "section": "760:8", "at": [3280, 1420], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|arrival-labels-en", "src": "576:1699", "name": "Arrivée : message chiffré · libellés en anglais — Ordinateur · Clair", "section": "760:8", "at": [1680, 1420], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|arrival-scan-binary", "src": "575:1331", "name": "Arrivée : message chiffré · scan · binaire — Ordinateur · Clair", "section": "760:8", "at": [80, 2580], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|arrival-scan-hex", "src": "577:1565", "name": "Arrivée : message chiffré · scan · hexadécimal — Ordinateur · Clair", "section": "760:8", "at": [1680, 2580], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|arrival-scan-return", "src": "579:2079", "name": "Arrivée : message chiffré · scan · remontée — Ordinateur · Clair", "section": "760:8", "at": [3280, 2580], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|decrypt-final", "src": "575:1797", "name": "Déchiffrement : BEYOND THE CODE · phrase finale — Ordinateur · Clair", "section": "760:8", "at": [80, 3740], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|decrypt-mid", "src": "575:1743", "name": "Déchiffrement : BEYOND THE CODE · à mi-parcours — Ordinateur · Clair", "section": "760:8", "at": [3280, 3740], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|entry-signin", "src": "577:1842", "name": "Connexion — prototype — Ordinateur · Clair", "section": "760:8", "at": [4880, 2580], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|member-transition", "src": "575:1835", "name": "Déchiffrement : BEYOND THE CODE · vers le logo (membre) — Ordinateur · Clair", "section": "760:8", "at": [1680, 3740], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|opening-logo", "src": "576:1331", "name": "Logo 42, puis cercle · logo seul — Ordinateur · Clair", "section": "760:8", "at": [3280, 4900], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|m|opening-logo", "src": "576:1331", "name": "Logo 42, puis cercle · logo seul — Ordinateur · Clair · parcours membre", "section": "760:8", "at": [4880, 260], "full": false, "vh": 960, "fixed": []}];
const out = { ids: {}, missing: [], fixed: {}, notFound: {} };
// a layer of the scene found again in the frame: the path of names from the frame, the last step by its position
function locate(c, path, x, y) {
  let cur = c;
  const T0 = c.absoluteTransform;
  for (let i = 0; i < path.length; i++) {
    const kids = ('children' in cur ? cur.children : []).filter(n => n.name === path[i]);
    if (!kids.length) return null;
    if (i < path.length - 1) { cur = kids[0]; continue; }
    let best = null, bd = 1e9;
    for (const k of kids) { const t = k.absoluteTransform, d = Math.abs(t[0][2] - T0[0][2] - x) + Math.abs(t[1][2] - T0[1][2] - y); if (d < bd) { bd = d; best = k; } }
    return bd < 2 ? best : null;
  }
  return null;
}
function convert(c, j) {
  c.clearExplicitVariableModeForCollection(colors);
  if (!j.full) return;
  const T0 = c.absoluteTransform;
  let moved = 0;
  const lost = [];
  for (const f of j.fixed) {
    const n = locate(c, f.path, f.x, f.y);
    if (!n) { lost.push(f.path.join(' > ')); continue; }
    const t = n.absoluteTransform, ax = t[0][2] - T0[0][2], ay = t[1][2] - T0[1][2];
    c.appendChild(n); n.x = ax; n.y = ay + f.dy; moved++;
  }
  c.resizeWithoutConstraints(c.width, j.vh); c.clipsContent = true; c.overflowDirection = 'VERTICAL';
  c.numberOfFixedChildren = moved;
  out.fixed[j.key] = moved;
  if (lost.length) out.notFound[j.key] = lost;
}
for (const j of J) {
  const s = await figma.getNodeByIdAsync(j.src);
  const sec = await figma.getNodeByIdAsync(j.section);
  if (!s || !sec) { out.missing.push(j.key); continue; }
  for (const old of sec.children.filter(n => n.name === j.name)) old.remove();
  const c = s.clone(); sec.appendChild(c); c.name = j.name; c.x = j.at[0]; c.y = j.at[1];
  convert(c, j);
  out.ids[j.key] = c.id;
}
return out;