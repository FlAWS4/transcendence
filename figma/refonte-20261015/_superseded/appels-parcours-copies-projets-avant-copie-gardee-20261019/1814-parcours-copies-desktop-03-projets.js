// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « 09 · Parcours · ordinateur », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('760:7');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('1:10');
if (src.id !== dest.id) await src.loadAsync();
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "desktop|en|v|projects-empty", "src": "599:127945", "name": "Liste des projets · état vide — Ordinateur · Clair · English", "section": "760:41", "at": [80, 3740], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|projects-last-page", "src": "596:126267", "name": "Liste des projets · dernière page — Ordinateur · Clair · English", "section": "760:41", "at": [1680, 2580], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 630.9, "y": 79.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [630.9, 79.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 651.0, "y": 84.0, "w": 137.9, "h": 48, "dy": 0, "bbox": [651.0, 84.0, 138.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 1561.0, "w": 636, "h": 60, "dy": -693, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|projects-list", "src": "602:143508", "name": "Liste des projets · vue Liste — Ordinateur · Clair · English", "section": "760:41", "at": [4880, 2580], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 630.9, "y": 79.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [630.9, 79.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 651.0, "y": 84.0, "w": 137.9, "h": 48, "dy": 0, "bbox": [651.0, 84.0, 138.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 3218.0, "w": 636, "h": 60, "dy": -2350, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|projects-sort-open", "src": "591:31490", "name": "Liste des projets · tri ouvert — Ordinateur · Clair · English", "section": "760:41", "at": [3280, 2580], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|report", "src": "602:149297", "name": "Signaler — Ordinateur · Clair · English", "section": "760:50", "at": [4880, 260], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|viewer", "src": "650:266202", "name": "Visionneuse de médias — Ordinateur · Clair · English", "section": "760:50", "at": [80, 1420], "full": false, "vh": 960, "fixed": []}];
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