// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « 09 · Parcours · ordinateur », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('760:7');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('1:10');
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "desktop|fr|v|projects-sort-open", "src": "605:186998", "name": "Liste des projets · tri ouvert — Ordinateur · Clair", "section": "760:14", "at": [3280, 2580], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|report", "src": "597:34700", "name": "Signaler — Ordinateur · Clair", "section": "760:23", "at": [4880, 260], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|fr|v|viewer", "src": "645:394089", "name": "Visionneuse de médias — Ordinateur · Clair", "section": "760:23", "at": [80, 1420], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|campus-choice", "src": "591:55828", "name": "Choisir un campus — Ordinateur · Clair · English", "section": "760:41", "at": [80, 260], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|comment-menu", "src": "641:188868", "name": "Menu à trois points d’un commentaire — Ordinateur · Clair · English", "section": "760:50", "at": [1680, 260], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|project", "src": "605:191665", "name": "Fiche projet — Ordinateur · Clair · English", "section": "760:41", "at": [3280, 1420], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-sidebar"], "x": 170.0, "y": 236.0, "w": 268, "h": 708, "dy": 0, "bbox": [170.0, 235.5, 268.0, 708.5]}, {"path": ["Application", "Contenu", "#project-detail", "Back to projects"], "x": 170.0, "y": 152.0, "w": 120.4, "h": 44, "dy": 0, "bbox": [170.0, 152.0, 120.4, 44.0]}, {"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 642.9, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [642.9, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 663.0, "y": 40.0, "w": 114.0, "h": 48, "dy": 0, "bbox": [663.0, 40.0, 114.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 1520.0, "w": 636, "h": 60, "dy": -652, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|project-implementation", "src": "600:218360", "name": "Réalisation — Ordinateur · Clair · English", "section": "760:41", "at": [80, 4900], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-sidebar"], "x": 170.0, "y": 236.0, "w": 268, "h": 708, "dy": 0, "bbox": [170.0, 235.5, 268.0, 708.5]}, {"path": ["Application", "Contenu", "#project-detail", "Back to projects"], "x": 170.0, "y": 152.0, "w": 120.4, "h": 44, "dy": 0, "bbox": [170.0, 152.0, 120.4, 44.0]}, {"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 642.9, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [642.9, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 663.0, "y": 40.0, "w": 114.0, "h": 48, "dy": 0, "bbox": [663.0, 40.0, 114.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 1259.0, "w": 636, "h": 60, "dy": -391, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|project-media", "src": "607:164447", "name": "Médias — Ordinateur · Clair · English", "section": "760:41", "at": [3280, 3740], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-sidebar"], "x": 170.0, "y": 236.0, "w": 268, "h": 708, "dy": 0, "bbox": [170.0, 235.5, 268.0, 708.5]}, {"path": ["Application", "Contenu", "#project-detail", "Back to projects"], "x": 170.0, "y": 152.0, "w": 120.4, "h": 44, "dy": 0, "bbox": [170.0, 152.0, 120.4, 44.0]}, {"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 642.9, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [642.9, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 663.0, "y": 40.0, "w": 114.0, "h": 48, "dy": 0, "bbox": [663.0, 40.0, 114.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 1449.0, "w": 636, "h": 60, "dy": -581, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|project-single", "src": "595:160351", "name": "Fiche projet · projet à campus unique — Ordinateur · Clair · English", "section": "760:41", "at": [1680, 1420], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-sidebar"], "x": 170.0, "y": 236.0, "w": 268, "h": 708, "dy": 0, "bbox": [170.0, 235.5, 268.0, 708.5]}, {"path": ["Application", "Contenu", "#project-detail", "Back to projects"], "x": 170.0, "y": 152.0, "w": 120.4, "h": 44, "dy": 0, "bbox": [170.0, 152.0, 120.4, 44.0]}, {"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 642.9, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [642.9, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 663.0, "y": 40.0, "w": 114.0, "h": 48, "dy": 0, "bbox": [663.0, 40.0, 114.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 1374.0, "w": 636, "h": 60, "dy": -506, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|project-test", "src": "596:32078", "name": "Tester le projet — Ordinateur · Clair · English", "section": "760:41", "at": [3280, 4900], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-sidebar"], "x": 170.0, "y": 236.0, "w": 268, "h": 708, "dy": 0, "bbox": [170.0, 235.5, 268.0, 708.5]}, {"path": ["Application", "Contenu", "#project-detail", "Back to projects"], "x": 170.0, "y": 152.0, "w": 120.4, "h": 44, "dy": 0, "bbox": [170.0, 152.0, 120.4, 44.0]}, {"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 642.9, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [642.9, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 663.0, "y": 40.0, "w": 114.0, "h": 48, "dy": 0, "bbox": [663.0, 40.0, 114.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 931.0, "w": 636, "h": 60, "dy": -63, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|project-test-saved", "src": "600:217916", "name": "Tester le projet · lien enregistré — Ordinateur · Clair · English", "section": "760:41", "at": [1680, 4900], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|projects", "src": "593:71895", "name": "Liste des projets — Ordinateur · Clair · English", "section": "760:41", "at": [1680, 3740], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 630.9, "y": 79.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [630.9, 79.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 651.0, "y": 84.0, "w": 137.9, "h": 48, "dy": 0, "bbox": [651.0, 84.0, 138.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 124, "dy": 0, "bbox": [0, 0, 1440, 124]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 2510.0, "w": 636, "h": 60, "dy": -1642, "bbox": [402.0, 811.0, 636.0, 117.0]}]}];
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