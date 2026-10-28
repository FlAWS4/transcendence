// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « 10 · Parcours · mobile », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('760:65');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('1:10');
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "mobile|fr|v|projects-list", "src": "600:216974", "name": "Liste des projets · vue Liste — Mobile · Clair", "section": "760:72", "at": [1180, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 137.6, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [137.6, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 130.9, "y": 84.0, "w": 128.1, "h": 46, "dy": 0, "bbox": [130.9, 84.0, 128.1, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 3133.0, "w": 358, "h": 60, "dy": -2366, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|fr|v|projects-sort-open", "src": "607:178934", "name": "Liste des projets · tri ouvert — Mobile · Clair", "section": "760:72", "at": [630, 1304], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|fr|v|report", "src": "599:198731", "name": "Signaler — Mobile · Clair", "section": "760:81", "at": [1730, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|fr|v|viewer", "src": "745:560454", "name": "Visionneuse de médias — Mobile · Clair", "section": "760:81", "at": [2280, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|campus-choice", "src": "594:143360", "name": "Choisir un campus — Mobile · Clair · English", "section": "760:99", "at": [80, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|comment-menu", "src": "643:227160", "name": "Menu à trois points d’un commentaire — Mobile · Clair · English", "section": "760:108", "at": [630, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|project", "src": "607:179911", "name": "Fiche projet — Mobile · Clair · English", "section": "760:99", "at": [3930, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1928.0, "w": 358, "h": 60, "dy": -1161, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|project-implementation", "src": "602:146306", "name": "Réalisation — Mobile · Clair · English", "section": "760:99", "at": [3930, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1444.0, "w": 358, "h": 60, "dy": -677, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|project-local-menu", "src": "591:76733", "name": "Fiche projet · sélecteur « Dans ce projet » ouvert — Mobile · Clair · English", "section": "760:99", "at": [3380, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|project-media", "src": "591:73262", "name": "Médias — Mobile · Clair · English", "section": "760:99", "at": [2830, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1272.0, "w": 358, "h": 60, "dy": -505, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|project-single", "src": "597:98395", "name": "Fiche projet · projet à campus unique — Mobile · Clair · English", "section": "760:99", "at": [2830, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1552.0, "w": 358, "h": 60, "dy": -785, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|project-test", "src": "597:100293", "name": "Tester le projet — Mobile · Clair · English", "section": "760:99", "at": [5030, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1204.0, "w": 358, "h": 60, "dy": -437, "bbox": [16.0, 710.0, 358.0, 117.0]}]}];
const out = { ids: {}, missing: [], fixed: {}, notFound: {}, kept: 0 };
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
  // converted by an earlier run: left as it is
  if (Math.round(c.height) === j.vh && c.overflowDirection === 'VERTICAL' && (c.numberOfFixedChildren > 0 || !j.fixed.length)) { out.fixed[j.key] = c.numberOfFixedChildren; return; }
  const T0 = c.absoluteTransform;
  let moved = 0;
  const lost = [];
  for (const f of j.fixed) {
    // 19 Oct.: already moved to the top of the frame by a run cut short (before the copy only has « Application »
    // there): appended again, in the same order, and put back in place if the run stopped before it was
    const top = c.children.find(n => n.name === f.path[f.path.length - 1] && n.name !== 'Application');
    if (top) {
      c.appendChild(top);
      if (Math.abs(top.x - f.x) + Math.abs(top.y - f.y - f.dy) >= 2) { top.x = f.x; top.y = f.y + f.dy; }
      moved++; continue;
    }
    const n = locate(c, f.path, f.x, f.y);
    if (!n) { lost.push(f.path.join(' > ')); continue; }
    const t = n.absoluteTransform, ax = t[0][2] - T0[0][2], ay = t[1][2] - T0[1][2];
    c.appendChild(n); n.x = ax; n.y = ay + f.dy; moved++;
  }
  if (Math.round(c.height) !== j.vh) c.resizeWithoutConstraints(c.width, j.vh);
  c.clipsContent = true; c.overflowDirection = 'VERTICAL';
  c.numberOfFixedChildren = moved;
  out.fixed[j.key] = moved;
  if (lost.length) out.notFound[j.key] = lost;
}
let loaded = src.id === dest.id;
for (const j of J) {
  const sec = await figma.getNodeByIdAsync(j.section);
  if (!sec) { out.missing.push(j.key); continue; }
  // 19 Oct.: the copy made by a run whose answer was lost or that was cut short (the heaviest screens of Projets) is kept,
  // its conversion finished; the source page is loaded only for a copy still to make
  const there = sec.children.filter(n => n.name === j.name);
  let c = there.length === 1 && there[0].type === 'FRAME' ? there[0] : null;
  if (c) out.kept++;
  else {
    if (!loaded) { await src.loadAsync(); loaded = true; }
    const s = await figma.getNodeByIdAsync(j.src);
    if (!s) { out.missing.push(j.key); continue; }
    for (const old of there) old.remove();
    c = s.clone(); sec.appendChild(c); c.name = j.name;
  }
  c.x = j.at[0]; c.y = j.at[1];
  convert(c, j);
  out.ids[j.key] = c.id;
}
return out;