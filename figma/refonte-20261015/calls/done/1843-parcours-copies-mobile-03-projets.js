// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « 10 · Parcours · mobile », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('760:65');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('1:10');
if (src.id !== dest.id) await src.loadAsync();
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "mobile|fr|v|campus-choice", "src": "607:57946", "name": "Choisir un campus — Mobile · Clair", "section": "760:72", "at": [80, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|fr|v|comment-menu", "src": "638:179305", "name": "Menu à trois points d’un commentaire — Mobile · Clair", "section": "760:81", "at": [630, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|fr|v|project", "src": "602:148715", "name": "Fiche projet — Mobile · Clair", "section": "760:72", "at": [3930, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 147.1, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [147.1, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 140.4, "y": 84.0, "w": 109.1, "h": 38, "dy": 0, "bbox": [140.4, 84.0, 109.1, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1929.0, "w": 358, "h": 60, "dy": -1162, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|fr|v|project-implementation", "src": "599:125834", "name": "Réalisation — Mobile · Clair", "section": "760:72", "at": [3930, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 147.1, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [147.1, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 140.4, "y": 84.0, "w": 109.1, "h": 38, "dy": 0, "bbox": [140.4, 84.0, 109.1, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1459.0, "w": 358, "h": 60, "dy": -692, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|fr|v|project-local-menu", "src": "612:184070", "name": "Fiche projet · sélecteur « Dans ce projet » ouvert — Mobile · Clair", "section": "760:72", "at": [3380, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|fr|v|project-media", "src": "605:186751", "name": "Médias — Mobile · Clair", "section": "760:72", "at": [2830, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 147.1, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [147.1, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 140.4, "y": 84.0, "w": 109.1, "h": 38, "dy": 0, "bbox": [140.4, 84.0, 109.1, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1229.0, "w": 358, "h": 60, "dy": -462, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|fr|v|project-single", "src": "594:145140", "name": "Fiche projet · projet à campus unique — Mobile · Clair", "section": "760:72", "at": [2830, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 147.1, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [147.1, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 140.4, "y": 84.0, "w": 109.1, "h": 38, "dy": 0, "bbox": [140.4, 84.0, 109.1, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1509.0, "w": 358, "h": 60, "dy": -742, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|fr|v|project-test", "src": "594:146619", "name": "Tester le projet — Mobile · Clair", "section": "760:72", "at": [5030, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 147.1, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [147.1, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 140.4, "y": 84.0, "w": 109.1, "h": 38, "dy": 0, "bbox": [140.4, 84.0, 109.1, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1161.0, "w": 358, "h": 60, "dy": -394, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|fr|v|project-test-saved", "src": "599:127750", "name": "Tester le projet · lien enregistré — Mobile · Clair", "section": "760:72", "at": [4480, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 147.1, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [147.1, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 140.4, "y": 84.0, "w": 109.1, "h": 38, "dy": 0, "bbox": [140.4, 84.0, 109.1, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 954.0, "w": 358, "h": 60, "dy": -187, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|fr|v|projects", "src": "592:57933", "name": "Liste des projets — Mobile · Clair", "section": "760:72", "at": [2280, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 137.6, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [137.6, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 130.9, "y": 84.0, "w": 128.1, "h": 46, "dy": 0, "bbox": [130.9, 84.0, 128.1, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 2749.0, "w": 358, "h": 60, "dy": -1982, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|fr|v|projects-empty", "src": "597:140044", "name": "Liste des projets · état vide — Mobile · Clair", "section": "760:72", "at": [1730, 1304], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|fr|v|projects-last-page", "src": "594:146048", "name": "Liste des projets · dernière page — Mobile · Clair", "section": "760:72", "at": [80, 1304], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Globe interactif. Glisse pour to…"], "x": 137.6, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [137.6, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 130.9, "y": 84.0, "w": 128.1, "h": 46, "dy": 0, "bbox": [130.9, 84.0, 128.1, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 92, "dy": 0, "bbox": [0, 0, 390, 92]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1643.0, "w": 358, "h": 60, "dy": -876, "bbox": [16.0, 710.0, 358.0, 117.0]}]}];
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