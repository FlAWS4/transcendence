// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « 10 · Parcours · mobile », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('760:65');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('1:11');
if (src.id !== dest.id) await src.loadAsync();
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "mobile|en|v|message-dialog", "src": "697:585400", "name": "Envoyer un message — Mobile · Clair · English", "section": "760:102", "at": [630, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|people", "src": "700:82084", "name": "Liste des profils — Mobile · Clair · English", "section": "760:102", "at": [5030, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 140.2, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [140.2, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 133.5, "y": 84.0, "w": 123.0, "h": 46, "dy": 0, "bbox": [133.5, 84.0, 123.0, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 3965.0, "w": 358, "h": 60, "dy": -3198, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|people-last-page", "src": "698:36302", "name": "Liste des profils · dernière page — Mobile · Clair · English", "section": "760:102", "at": [3380, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 140.2, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [140.2, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 133.5, "y": 84.0, "w": 123.0, "h": 46, "dy": 0, "bbox": [133.5, 84.0, 123.0, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1354.0, "w": 358, "h": 60, "dy": -587, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|people-list", "src": "708:76304", "name": "Liste des profils · vue Liste — Mobile · Clair · English", "section": "760:102", "at": [4480, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 140.2, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [140.2, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 133.5, "y": 84.0, "w": 123.0, "h": 46, "dy": 0, "bbox": [133.5, 84.0, 123.0, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 3844.0, "w": 358, "h": 60, "dy": -3077, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|people-sort-open", "src": "695:579460", "name": "Liste des profils · tri ouvert — Mobile · Clair · English", "section": "760:102", "at": [3930, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|profile", "src": "704:84363", "name": "Fiche profil — Mobile · Clair · English", "section": "760:102", "at": [1730, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1687.0, "w": 358, "h": 60, "dy": -920, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|profile-contribution", "src": "597:132536", "name": "Contribution — Mobile · Clair · English", "section": "760:102", "at": [80, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 780.0, "w": 358, "h": 60, "dy": -13, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|profile-journey", "src": "592:122986", "name": "Parcours — Mobile · Clair · English", "section": "760:102", "at": [80, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1764.0, "w": 358, "h": 60, "dy": -997, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|profile-local-menu", "src": "710:81149", "name": "Fiche profil · sélecteur de rubriques ouvert — Mobile · Clair · English", "section": "760:102", "at": [1180, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|profile-projects", "src": "595:115688", "name": "Projets — Mobile · Clair · English", "section": "760:102", "at": [630, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1499.0, "w": 358, "h": 60, "dy": -732, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|profile-projects-filter", "src": "705:93903", "name": "Projets · filtre local ouvert — Mobile · Clair · English", "section": "760:99", "at": [3380, 1304], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|report-profile", "src": "708:72501", "name": "Signaler · depuis un profil — Mobile · Clair · English", "section": "760:108", "at": [1180, 260], "full": false, "vh": 844, "fixed": []}];
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