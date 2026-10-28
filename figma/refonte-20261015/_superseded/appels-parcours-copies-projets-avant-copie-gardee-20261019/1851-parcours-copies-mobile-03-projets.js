// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « 10 · Parcours · mobile », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('760:65');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('1:10');
if (src.id !== dest.id) await src.loadAsync();
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "mobile|en|v|project-test-saved", "src": "602:60933", "name": "Tester le projet · lien enregistré — Mobile · Clair · English", "section": "760:99", "at": [4480, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 997.0, "w": 358, "h": 60, "dy": -230, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|projects", "src": "595:29852", "name": "Liste des projets — Mobile · Clair · English", "section": "760:99", "at": [2280, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 140.2, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [140.2, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 133.5, "y": 84.0, "w": 123.0, "h": 46, "dy": 0, "bbox": [133.5, 84.0, 123.0, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 2723.0, "w": 358, "h": 60, "dy": -1956, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|projects-empty", "src": "599:128147", "name": "Liste des projets · état vide — Mobile · Clair · English", "section": "760:99", "at": [1730, 1304], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|projects-last-page", "src": "596:127186", "name": "Liste des projets · dernière page — Mobile · Clair · English", "section": "760:99", "at": [80, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 140.2, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [140.2, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 133.5, "y": 84.0, "w": 123.0, "h": 46, "dy": 0, "bbox": [133.5, 84.0, 123.0, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1643.0, "w": 358, "h": 60, "dy": -876, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|projects-list", "src": "603:148511", "name": "Liste des projets · vue Liste — Mobile · Clair · English", "section": "760:99", "at": [1180, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 140.2, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [140.2, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 133.5, "y": 84.0, "w": 123.0, "h": 46, "dy": 0, "bbox": [133.5, 84.0, 123.0, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 3133.0, "w": 358, "h": 60, "dy": -2366, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|projects-sort-open", "src": "592:120623", "name": "Liste des projets · tri ouvert — Mobile · Clair · English", "section": "760:99", "at": [630, 1304], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|report", "src": "605:190219", "name": "Signaler — Mobile · Clair · English", "section": "760:108", "at": [1730, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|viewer", "src": "747:560435", "name": "Visionneuse de médias — Mobile · Clair · English", "section": "760:108", "at": [2280, 260], "full": false, "vh": 844, "fixed": []}];
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