// 42 Horizon — parcours cliquables : écrans membre rendus dans « 09 · Parcours · ordinateur », mis à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026)
const dest = await figma.getNodeByIdAsync('760:7');
await figma.setCurrentPageAsync(dest);
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "desktop|en|v|member-account", "name": "Compte de Leïla Mansour · membre — Ordinateur · Clair · English", "staging": "760:62", "section": "760:59", "at": [1680, 260], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#profile-detail", ".cp-profile-sidebar"], "x": 170.0, "y": 238.0, "w": 246, "h": 706, "dy": 0, "bbox": [170.0, 238.0, 246.0, 706.0]}, {"path": ["Application", "Contenu", "#profile-detail", "Back to profiles"], "x": 170.0, "y": 154.0, "w": 117.7, "h": 44, "dy": 0, "bbox": [170.0, 154.0, 117.7, 44.0]}, {"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 614.6, "y": 46.2, "w": 53.3, "h": 35.6, "dy": 0, "bbox": [614.6, 46.2, 53.3, 35.6]}, {"path": ["Application", "Barre de périmètre"], "x": 618.3, "y": 40.0, "w": 203.4, "h": 48, "dy": 0, "bbox": [618.3, 40.0, 203.4, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 126, "dy": 0, "bbox": [0, 0, 1440, 126]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 1230.0, "w": 636, "h": 60, "dy": -362, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|member-article", "name": "Chronique · membre — Ordinateur · Clair · English", "staging": "760:62", "section": "760:59", "at": [80, 260], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#journal-detail", ".cp-project-sidebar"], "x": 170.0, "y": 238.0, "w": 268, "h": 706, "dy": 0, "bbox": [170.0, 237.5, 270.0, 706.5]}, {"path": ["Application", "Contenu", "#journal-detail", "Back to Chronicles"], "x": 170.0, "y": 154.0, "w": 136.7, "h": 44, "dy": 0, "bbox": [170.0, 154.0, 136.7, 44.0]}, {"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 642.9, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [642.9, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 663.0, "y": 40.0, "w": 114.0, "h": 48, "dy": 0, "bbox": [663.0, 40.0, 114.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 126, "dy": 0, "bbox": [0, 0, 1440, 126]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 1507.0, "w": 636, "h": 60, "dy": -639, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|member-awards", "name": "Page 42 Awards · membre — Ordinateur · Clair · English", "staging": "760:62", "section": "760:59", "at": [80, 2580], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|member-explore", "name": "Explorer · Monde · membre — Ordinateur · Clair · English", "staging": "760:62", "section": "760:59", "at": [3280, 260], "full": false, "vh": 960, "fixed": []}, {"key": "desktop|en|v|member-journal", "name": "Liste des chroniques · membre — Ordinateur · Clair · English", "staging": "760:62", "section": "760:59", "at": [1680, 1420], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 630.9, "y": 79.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [630.9, 79.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 651.0, "y": 84.0, "w": 137.9, "h": 48, "dy": 0, "bbox": [651.0, 84.0, 138.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 126, "dy": 0, "bbox": [0, 0, 1440, 126]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 2441.0, "w": 636, "h": 60, "dy": -1573, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|member-people", "name": "Liste des profils · membre — Ordinateur · Clair · English", "staging": "760:62", "section": "760:59", "at": [3280, 1420], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 630.9, "y": 79.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [630.9, 79.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 651.0, "y": 84.0, "w": 137.9, "h": 48, "dy": 0, "bbox": [651.0, 84.0, 138.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 126, "dy": 0, "bbox": [0, 0, 1440, 126]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 2054.0, "w": 636, "h": 60, "dy": -1186, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|member-profile", "name": "Fiche profil · membre — Ordinateur · Clair · English", "staging": "760:62", "section": "760:59", "at": [4880, 260], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#profile-detail", ".cp-profile-sidebar"], "x": 170.0, "y": 238.0, "w": 246, "h": 706, "dy": 0, "bbox": [170.0, 238.0, 246.0, 706.0]}, {"path": ["Application", "Contenu", "#profile-detail", "Back to profiles"], "x": 170.0, "y": 154.0, "w": 117.7, "h": 44, "dy": 0, "bbox": [170.0, 154.0, 117.7, 44.0]}, {"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 642.9, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [642.9, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 663.0, "y": 40.0, "w": 114.0, "h": 48, "dy": 0, "bbox": [663.0, 40.0, 114.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 126, "dy": 0, "bbox": [0, 0, 1440, 126]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 1230.0, "w": 636, "h": 60, "dy": -362, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|member-project", "name": "Fiche projet · membre — Ordinateur · Clair · English", "staging": "760:62", "section": "760:59", "at": [80, 1420], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-sidebar"], "x": 170.0, "y": 238.0, "w": 268, "h": 706, "dy": 0, "bbox": [170.0, 237.5, 268.0, 706.5]}, {"path": ["Application", "Contenu", "#project-detail", "Back to projects"], "x": 170.0, "y": 154.0, "w": 120.4, "h": 44, "dy": 0, "bbox": [170.0, 154.0, 120.4, 44.0]}, {"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 642.9, "y": 35.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [642.9, 35.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 663.0, "y": 40.0, "w": 114.0, "h": 48, "dy": 0, "bbox": [663.0, 40.0, 114.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 126, "dy": 0, "bbox": [0, 0, 1440, 126]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 1522.0, "w": 636, "h": 60, "dy": -654, "bbox": [402.0, 811.0, 636.0, 117.0]}]}, {"key": "desktop|en|v|member-projects", "name": "Liste des projets · membre — Ordinateur · Clair · English", "staging": "760:62", "section": "760:59", "at": [4880, 1420], "full": true, "vh": 960, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 630.9, "y": 79.2, "w": 86.3, "h": 57.5, "dy": 0, "bbox": [630.9, 79.2, 86.3, 57.5]}, {"path": ["Application", "Barre de périmètre"], "x": 651.0, "y": 84.0, "w": 137.9, "h": 48, "dy": 0, "bbox": [651.0, 84.0, 138.0, 48.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 1440, "h": 126, "dy": 0, "bbox": [0, 0, 1440, 126]}, {"path": ["Application", "Menu du bas"], "x": 402.0, "y": 2512.0, "w": 636, "h": 60, "dy": -1644, "bbox": [402.0, 811.0, 636.0, 117.0]}]}];
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
for (const j of J) {
  const stage = await figma.getNodeByIdAsync(j.staging), sec = await figma.getNodeByIdAsync(j.section);
  const done = sec && sec.children.find(n => n.name === j.name && n.type === 'FRAME');
  if (done) { out.ids[j.key] = done.id; out.fixed[j.key] = done.numberOfFixedChildren; continue; }   // converted by an earlier run
  const c = stage && stage.children.find(n => n.name === j.name && n.type === 'FRAME');
  if (!c || !sec) { out.missing.push(j.key); continue; }
  convert(c, j);
  sec.appendChild(c); c.x = j.at[0]; c.y = j.at[1];
  out.ids[j.key] = c.id;
}
const stages = [...new Set(J.map(j => j.staging))];
for (const id of stages) { const s = await figma.getNodeByIdAsync(id); if (s && !s.children.some(n => n.type === 'FRAME')) { s.remove(); out.stagingRemoved = (out.stagingRemoved || 0) + 1; } }
return out;