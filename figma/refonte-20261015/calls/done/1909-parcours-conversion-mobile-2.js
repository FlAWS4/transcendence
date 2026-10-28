// 42 Horizon — parcours cliquables : écrans membre rendus dans « 10 · Parcours · mobile », mis à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026)
const dest = await figma.getNodeByIdAsync('760:65');
await figma.setCurrentPageAsync(dest);
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const J = [{"key": "mobile|en|v|member-account", "name": "Compte de Leïla Mansour · membre — Mobile · Clair · English", "staging": "760:120", "section": "760:117", "at": [630, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 111.1, "y": 68.5, "w": 35.6, "h": 77.0, "dy": 0, "bbox": [111.1, 68.5, 35.6, 77.0]}, {"path": ["Application", "Barre de périmètre"], "x": 105.9, "y": 84.0, "w": 178.2, "h": 46, "dy": 0, "bbox": [105.9, 84.0, 178.2, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 94, "dy": 0, "bbox": [0, 0, 390, 94]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1689.0, "w": 358, "h": 60, "dy": -922, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|member-article", "name": "Chronique · membre — Mobile · Clair · English", "staging": "760:120", "section": "760:117", "at": [80, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 94, "dy": 0, "bbox": [0, 0, 390, 94]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1714.0, "w": 358, "h": 60, "dy": -947, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|member-awards", "name": "Page 42 Awards · membre — Mobile · Clair · English", "staging": "760:120", "section": "760:117", "at": [4480, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|member-explore", "name": "Explorer · Monde · membre — Mobile · Clair · English", "staging": "760:120", "section": "760:117", "at": [1180, 260], "full": false, "vh": 844, "fixed": []}, {"key": "mobile|en|v|member-journal", "name": "Liste des chroniques · membre — Mobile · Clair · English", "staging": "760:120", "section": "760:117", "at": [2830, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 140.2, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [140.2, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 133.5, "y": 84.0, "w": 123.0, "h": 46, "dy": 0, "bbox": [133.5, 84.0, 123.0, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 94, "dy": 0, "bbox": [0, 0, 390, 94]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 2610.0, "w": 358, "h": 60, "dy": -1843, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|member-people", "name": "Liste des profils · membre — Mobile · Clair · English", "staging": "760:120", "section": "760:117", "at": [3380, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 140.2, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [140.2, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 133.5, "y": 84.0, "w": 123.0, "h": 46, "dy": 0, "bbox": [133.5, 84.0, 123.0, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 94, "dy": 0, "bbox": [0, 0, 390, 94]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 3967.0, "w": 358, "h": 60, "dy": -3200, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|member-profile", "name": "Fiche profil · membre — Mobile · Clair · English", "staging": "760:120", "section": "760:117", "at": [1730, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 94, "dy": 0, "bbox": [0, 0, 390, 94]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1689.0, "w": 358, "h": 60, "dy": -922, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|member-project", "name": "Fiche projet · membre — Mobile · Clair · English", "staging": "760:120", "section": "760:117", "at": [2280, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 149.7, "y": 67.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [149.7, 67.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 143.0, "y": 84.0, "w": 104.0, "h": 38, "dy": 0, "bbox": [143.0, 84.0, 104.0, 38.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 94, "dy": 0, "bbox": [0, 0, 390, 94]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 1930.0, "w": 358, "h": 60, "dy": -1163, "bbox": [16.0, 710.0, 358.0, 117.0]}]}, {"key": "mobile|en|v|member-projects", "name": "Liste des projets · membre — Mobile · Clair · English", "staging": "760:120", "section": "760:117", "at": [3930, 260], "full": true, "vh": 844, "fixed": [{"path": ["Application", "Globe · Interactive globe. Drag to rotat…"], "x": 140.2, "y": 71.6, "w": 32.7, "h": 70.7, "dy": 0, "bbox": [140.2, 71.6, 32.7, 70.7]}, {"path": ["Application", "Barre de périmètre"], "x": 133.5, "y": 84.0, "w": 123.0, "h": 46, "dy": 0, "bbox": [133.5, 84.0, 123.0, 46.0]}, {"path": ["Application", "En-tête"], "x": 0, "y": 0, "w": 390, "h": 94, "dy": 0, "bbox": [0, 0, 390, 94]}, {"path": ["Application", "Menu du bas"], "x": 16.0, "y": 2725.0, "w": 358, "h": 60, "dy": -1958, "bbox": [16.0, 710.0, 358.0, 117.0]}]}];
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