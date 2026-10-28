// 42 Horizon — lecture seule (19 oct. 2026) : cadres, zones, interactions et points de départ de « 10 · Parcours · mobile » ; rien n'est modifié
const page = await figma.getNodeByIdAsync('760:65');
await figma.setCurrentPageAsync(page);
const S = {"mobile-en-people": "760:102", "mobile-en-journal": "760:105", "mobile-en-shared": "760:108", "mobile-en-awards": "760:111", "mobile-en-account": "760:114", "mobile-en-member": "760:117", "mobile-fr-global": "761:63", "mobile-en-global": "761:84"}, IN = {"767:1544274": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 76.0}], "767:1544384": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 78.0}], "767:1544507": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 76.0}], "767:1655872": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 76.0}], "767:1655982": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 76.0}], "793:194304": [{"path": ["Application", "Contenu", "#project-detail", "Comment actions"], "x": 186.0, "y": 382.5}], "767:1423936": [{"path": ["#content-category-dialog", ".cp-project-filter-form", ".cp-project-filter-body"], "x": 9.0, "y": 347.0}], "767:1629064": [{"path": [".cp-profile-message-dialog"], "x": 19.0, "y": 222.7}], "767:1656094": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 78.0}], "767:1656201": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 78.0}], "767:1632342": [{"path": ["Application", "Contenu", "#content-sort-menu"], "x": 72.0, "y": 229.0}], "767:1632854": [{"path": ["Application", "Contenu", "#profile-detail", ".cp-profile-section-switch", "Profile sections"], "x": 24.0, "y": 517.8}], "794:192319": [{"path": ["#content-report-1"], "x": 12.0, "y": 154.2}], "767:1643623": [{"path": ["#content-report-1"], "x": 12.0, "y": 154.2}], "767:1656305": [{"path": ["#dialog"], "x": 19.0, "y": 270.4}], "767:1660332": [{"path": ["#dialog"], "x": 19.0, "y": 257.6}]};
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
const zoneInfo = z => { const r = z.reactions || []; const a = r.length && r[0].actions && r[0].actions[0]; return a ? (a.type === 'NODE' ? a.destinationId : a.type === 'BACK' ? 'BACK' : a.type === 'URL' ? 'URL' : a.type) : null; };
const out = { sections: {}, flows: page.flowStartingPoints.map(p => [p.name, p.nodeId]) };
for (const [sid, id] of Object.entries(S)) {
  const s = await figma.getNodeByIdAsync(id);
  if (!s) { out.sections[sid] = 'absente'; continue; }
  out.sections[sid] = s.children.filter(n => n.type === 'FRAME').map(f => {
    const top = f.children.filter(c => c.name.startsWith('Zone · '));
    const inner = (IN[f.id] || []).map(p => { const c = locate(f, p.path, p.x, p.y); return c ? [c.overflowDirection, c.children.filter(z => z.name.startsWith('Zone · ')).map(zoneInfo)] : null; });
    const fr = (f.reactions || [])[0];
    return { name: f.name, id: f.id, w: Math.round(f.width), h: Math.round(f.height), fixed: f.numberOfFixedChildren, scroll: f.overflowDirection,
             zones: top.map(zoneInfo), lastFixed: f.children.slice(f.children.length - f.numberOfFixedChildren).map(c => c.name.startsWith('Zone · ') ? 'Z' : c.name).filter(n => n !== 'Z'),
             inner, auto: fr ? [fr.trigger && fr.trigger.type, fr.trigger && fr.trigger.timeout, fr.actions && fr.actions[0] && fr.actions[0].destinationId] : null };
  });
}
return out;