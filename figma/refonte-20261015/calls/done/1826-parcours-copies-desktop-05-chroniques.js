// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « 09 · Parcours · ordinateur », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('760:7');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('1:12');
if (src.id !== dest.id) await src.loadAsync();
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "desktop|fr|v|article", "src": "598:187378", "name": "Chronique — Ordinateur · Clair", "section": "760:20", "at": [1680, 260], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#journal-detail", ".cp-project-sidebar"], "x": 170.0, "y": 236.0, "w": 268, "h": 708, "dy": 0, "bbox": [170.0, 235.5, 268.0, 708.5]}, {"path": ["Application", "Contenu", "#journal-detail", "Retour aux chroniques"], "x": 170.0, "y": 152.0, "w": 159.0, "h": 44, "dy": 0, "bbox": [170.0, 152.0, 159.0, 44.0]}, {"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 640.3, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [640.3, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 660.4, "y": 40.0, "w": 119.1, "h": 48, "dy": 0, "bbox": [660.4, 40.0, 119.1, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 1505.0, "w": 636, "h": 60, "dy": -637, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|fr|v|article-authors", "src": "599:13196", "name": "Auteurs — Ordinateur · Clair", "section": "760:20", "at": [80, 260], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|article-media", "src": "594:143914", "name": "Médias — Ordinateur · Clair", "section": "760:20", "at": [1680, 1420], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#journal-detail", ".cp-project-sidebar"], "x": 170.0, "y": 236.0, "w": 268, "h": 708, "dy": 0, "bbox": [170.0, 235.5, 268.0, 708.5]}, {"path": ["Application", "Contenu", "#journal-detail", "Retour aux chroniques"], "x": 170.0, "y": 152.0, "w": 159.0, "h": 44, "dy": 0, "bbox": [170.0, 152.0, 159.0, 44.0]}, {"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 640.3, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [640.3, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 660.4, "y": 40.0, "w": 119.1, "h": 48, "dy": 0, "bbox": [660.4, 40.0, 119.1, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 885.0, "w": 636, "h": 60, "dy": -17, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|fr|v|journal", "src": "591:6205", "name": "Liste des chroniques — Ordinateur · Clair", "section": "760:20", "at": [80, 1420], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 628.3, "y": 79.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [628.3, 79.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 648.4, "y": 84.0, "w": 143.1, "h": 48, "dy": 0, "bbox": [648.4, 84.0, 143.1, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 2497.0, "w": 636, "h": 60, "dy": -1629, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|article", "src": "600:228389", "name": "Chronique — Ordinateur · Clair · English", "section": "760:47", "at": [1680, 260], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#journal-detail", ".cp-project-sidebar"], "x": 170.0, "y": 236.0, "w": 268, "h": 708, "dy": 0, "bbox": [170.0, 235.5, 270.0, 708.5]}, {"path": ["Application", "Contenu", "#journal-detail", "Back to Chronicles"], "x": 170.0, "y": 152.0, "w": 136.7, "h": 44, "dy": 0, "bbox": [170.0, 152.0, 136.7, 44.0]}, {"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 642.9, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [642.9, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 663.0, "y": 40.0, "w": 114.0, "h": 48, "dy": 0, "bbox": [663.0, 40.0, 114.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 1505.0, "w": 636, "h": 60, "dy": -637, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|article-authors", "src": "602:20784", "name": "Auteurs — Ordinateur · Clair · English", "section": "760:47", "at": [80, 260], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|article-media", "src": "596:128008", "name": "Médias — Ordinateur · Clair · English", "section": "760:47", "at": [1680, 1420], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#journal-detail", ".cp-project-sidebar"], "x": 170.0, "y": 236.0, "w": 268, "h": 708, "dy": 0, "bbox": [170.0, 235.5, 270.0, 708.5]}, {"path": ["Application", "Contenu", "#journal-detail", "Back to Chronicles"], "x": 170.0, "y": 152.0, "w": 136.7, "h": 44, "dy": 0, "bbox": [170.0, 152.0, 136.7, 44.0]}, {"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 642.9, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [642.9, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 663.0, "y": 40.0, "w": 114.0, "h": 48, "dy": 0, "bbox": [663.0, 40.0, 114.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 885.0, "w": 636, "h": 60, "dy": -17, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|journal", "src": "593:70236", "name": "Liste des chroniques — Ordinateur · Clair · English", "section": "760:47", "at": [80, 1420], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 630.9, "y": 79.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [630.9, 79.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 651.0, "y": 84.0, "w": 137.9, "h": 48, "dy": 0, "bbox": [651.0, 84.0, 138.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 2439.0, "w": 636, "h": 60, "dy": -1571, "bbox": [402.0, 811.0, 636.0, 117.0]}]}];
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