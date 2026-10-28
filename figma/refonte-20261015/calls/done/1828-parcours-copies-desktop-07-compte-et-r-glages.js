// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « 09 · Parcours · ordinateur », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('760:7');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('1:14');
if (src.id !== dest.id) await src.loadAsync();
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "desktop|fr|v|account-language", "src": "605:189103", "name": "Langue — Ordinateur · Clair", "section": "760:29", "at": [3280, 260], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|account-member", "src": "612:136293", "name": "Panneau du compte · membre — Ordinateur · Clair", "section": "760:29", "at": [1680, 1420], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|account-settings", "src": "602:150373", "name": "Paramètres — Ordinateur · Clair", "section": "760:29", "at": [4880, 1420], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|account-theme", "src": "594:159474", "name": "Thème — Ordinateur · Clair", "section": "760:29", "at": [80, 2580], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|account-visitor", "src": "591:54714", "name": "Panneau du compte · visiteur — Ordinateur · Clair", "section": "760:29", "at": [3280, 1420], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|messages", "src": "600:218629", "name": "Messagerie — Ordinateur · Clair", "section": "760:29", "at": [4880, 260], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|notifications", "src": "607:165718", "name": "Notifications — Ordinateur · Clair", "section": "760:29", "at": [80, 1420], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|signin-dialog", "src": "592:24717", "name": "Connexion simulée — Ordinateur · Clair", "section": "760:29", "at": [80, 260], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|signup-dialog", "src": "602:146533", "name": "Création de compte simulée — Ordinateur · Clair", "section": "760:29", "at": [1680, 260], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|account-language", "src": "608:190020", "name": "Langue — Ordinateur · Clair · English", "section": "760:56", "at": [3280, 260], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|account-member", "src": "595:103274", "name": "Panneau du compte · membre — Ordinateur · Clair · English", "section": "760:56", "at": [1680, 1420], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|account-settings", "src": "608:191136", "name": "Paramètres — Ordinateur · Clair · English", "section": "760:56", "at": [4880, 1420], "full": false, "vh": 960, "fixed": []}];
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