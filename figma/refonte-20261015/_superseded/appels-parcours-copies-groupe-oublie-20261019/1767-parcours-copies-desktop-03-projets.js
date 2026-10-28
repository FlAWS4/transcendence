// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « 09 · Parcours · ordinateur », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('760:7');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('1:10');
if (src.id !== dest.id) await src.loadAsync();
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "desktop|fr|v|project-comments", "src": "646:266782", "name": "Commentaires — Ordinateur · Clair", "section": "760:14", "at": [80, 1420], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-sidebar"], "x": 170.0, "y": 236.0, "w": 268, "h": 708, "dy": 0, "bbox": [170.0, 235.5, 270.0, 708.5]}, {"path": ["Application", "Contenu", "#project-detail", "Retour aux projets"], "x": 170.0, "y": 152.0, "w": 133.5, "h": 44, "dy": 0, "bbox": [170.0, 152.0, 133.5, 44.0]}, {"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 640.3, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [640.3, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 660.4, "y": 40.0, "w": 119.1, "h": 48, "dy": 0, "bbox": [660.4, 40.0, 119.1, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 913.0, "w": 636, "h": 60, "dy": -45, "bbox": [402.0, 811.0, 636.0, 117.0]}]}];
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