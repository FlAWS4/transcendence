// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « 10 · Parcours · mobile », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('760:65');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('1:12');
if (src.id !== dest.id) await src.loadAsync();
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "mobile|fr|v|article", "src": "599:198973", "name": "Chronique — Mobile · Clair", "section": "760:78", "at": [630, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 147.1, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [147.1, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 140.4, "y": 84.0, "w": 109.1, "h": 38, "dy": 0, "bbox": [140.4, 84.0, 109.1, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1669.0, "w": 358, "h": 60, "dy": -902, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|fr|v|article-authors", "src": "600:155587", "name": "Auteurs — Mobile · Clair", "section": "760:78", "at": [80, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 147.1, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [147.1, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 140.4, "y": 84.0, "w": 109.1, "h": 38, "dy": 0, "bbox": [140.4, 84.0, 109.1, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1117.0, "w": 358, "h": 60, "dy": -350, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|fr|v|article-media", "src": "595:115480", "name": "Médias — Mobile · Clair", "section": "760:78", "at": [2830, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 147.1, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [147.1, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 140.4, "y": 84.0, "w": 109.1, "h": 38, "dy": 0, "bbox": [140.4, 84.0, 109.1, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 870.0, "w": 358, "h": 60, "dy": -103, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|fr|v|journal", "src": "592:32125", "name": "Liste des chroniques — Mobile · Clair", "section": "760:78", "at": [2280, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 137.6, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [137.6, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 130.9, "y": 84.0, "w": 128.1, "h": 46, "dy": 0, "bbox": [130.9, 84.0, 128.1, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 2635.0, "w": 358, "h": 60, "dy": -1868, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|article", "src": "602:149074", "name": "Chronique — Mobile · Clair · English", "section": "760:105", "at": [630, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1712.0, "w": 358, "h": 60, "dy": -945, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|article-authors", "src": "603:165181", "name": "Auteurs — Mobile · Clair · English", "section": "760:105", "at": [80, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1160.0, "w": 358, "h": 60, "dy": -393, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|article-media", "src": "597:115037", "name": "Médias — Mobile · Clair · English", "section": "760:105", "at": [2830, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 913.0, "w": 358, "h": 60, "dy": -146, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|journal", "src": "594:160978", "name": "Liste des chroniques — Mobile · Clair · English", "section": "760:105", "at": [2280, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 140.2, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [140.2, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 133.5, "y": 84.0, "w": 123.0, "h": 46, "dy": 0, "bbox": [133.5, 84.0, 123.0, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 2608.0, "w": 358, "h": 60, "dy": -1841, "bbox": [16.0, 710.0, 358.0, 117.0]}]}];
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