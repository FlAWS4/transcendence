// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « 10 · Parcours · mobile », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('760:65');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('1:8');
if (src.id !== dest.id) await src.loadAsync();
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "mobile|en|v|arrival-scan-binary", "src": "576:1427", "name": "Arrivée : message chiffré · scan · binaire — Mobile · Clair · parcours English", "section": "760:93", "at": [4480, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|arrival-scan-hex", "src": "579:1802", "name": "Arrivée : message chiffré · scan · hexadécimal — Mobile · Clair · parcours English", "section": "760:93", "at": [5030, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|arrival-scan-return", "src": "575:1549", "name": "Arrivée : message chiffré · scan · remontée — Mobile · Clair · parcours English", "section": "760:93", "at": [80, 1304], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|decrypt-final", "src": "575:1816", "name": "Déchiffrement : BEYOND THE CODE · phrase finale — Mobile · Clair · parcours English", "section": "760:93", "at": [1180, 1304], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|decrypt-mid", "src": "575:1770", "name": "Déchiffrement : BEYOND THE CODE · à mi-parcours — Mobile · Clair · parcours English", "section": "760:93", "at": [2280, 1304], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|entry-signin", "src": "577:1956", "name": "Connexion — prototype — Mobile · Clair · English", "section": "760:93", "at": [630, 1304], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|member-transition", "src": "575:1863", "name": "Déchiffrement : BEYOND THE CODE · vers le logo (membre) — Mobile · Clair · parcours English", "section": "760:93", "at": [1730, 1304], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|opening-logo", "src": "576:1342", "name": "Logo 42, puis cercle · logo seul — Mobile · Clair · parcours English", "section": "760:93", "at": [4480, 1304], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|m|opening-logo", "src": "576:1342", "name": "Logo 42, puis cercle · logo seul — Mobile · Clair · parcours membre · parcours English", "section": "760:93", "at": [1730, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|opening-ring", "src": "576:1389", "name": "Logo 42, puis cercle · cercle complet — Mobile · Clair · parcours English", "section": "760:93", "at": [3930, 1304], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|m|opening-ring", "src": "576:1389", "name": "Logo 42, puis cercle · cercle complet — Mobile · Clair · parcours membre · parcours English", "section": "760:93", "at": [1180, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|opening-ring-drawing", "src": "576:1365", "name": "Logo 42, puis cercle · tracé du cercle — Mobile · Clair · parcours English", "section": "760:93", "at": [80, 2348], "full": false, "vh": 844, "fixed": []}];
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