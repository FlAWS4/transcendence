// 42 Horizon — lecture seule (19 oct. 2026) : cadres, zones, interactions et points de départ de « 10 · Parcours · mobile » ; rien n'est modifié
const page = await figma.getNodeByIdAsync('760:65');
await figma.setCurrentPageAsync(page);
const S = {"mobile-fr-entry": "760:66", "mobile-fr-explore": "760:69", "mobile-fr-projects": "760:72", "mobile-fr-people": "760:75", "mobile-fr-journal": "760:78", "mobile-fr-shared": "760:81", "mobile-fr-awards": "760:84"}, IN = {"767:1565398": [{"path": ["#dialog"], "x": 19.0, "y": 147.6}], "767:1682526": [{"path": ["#project-campus-choice-1"], "x": 12.0, "y": 229.0}], "767:1566909": [{"path": ["#dialog"], "x": 10.0, "y": 209.4}], "767:1568704": [{"path": ["#dialog"], "x": 10.0, "y": 10.0}], "767:1685425": [{"path": ["Application", "Contenu", "#project-detail", "Actions du commentaire"], "x": 186.0, "y": 382.3}], "766:964619": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-active-section", ".cp-comments-discussion", "#project-comment-sort-menu"], "x": 102.3, "y": 453.3}], "766:1058380": [{"path": ["#dialog"], "x": 19.0, "y": 278.4}], "766:420090": [{"path": ["#content-category-dialog", ".cp-project-filter-form", ".cp-project-filter-body"], "x": 9.0, "y": 347.0}], "767:1074749": [{"path": ["#content-category-dialog", ".cp-project-filter-form", ".cp-project-filter-body"], "x": 9.0, "y": 313.5}], "767:1469519": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-active-section", ".cp-comments-form", ".cp-mention-picker", "Profils à mentionner"], "x": 33.0, "y": 554.5}], "767:1134661": [{"path": [".cp-profile-message-dialog"], "x": 19.0, "y": 222.7}], "767:1137924": [{"path": ["Application", "Contenu", "#content-sort-menu"], "x": 72.0, "y": 229.0}], "767:1138436": [{"path": ["Application", "Contenu", "#profile-detail", ".cp-profile-section-switch", "Rubriques du profil"], "x": 24.0, "y": 517.8}], "767:1685860": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-section-switch", "Rubriques du projet"], "x": 24.0, "y": 501.8}], "793:185336": [{"path": ["Application", "Contenu", "#content-sort-menu"], "x": 72.0, "y": 229.0}], "793:185444": [{"path": ["#content-report-1"], "x": 12.0, "y": 154.2}], "767:1149205": [{"path": ["#content-report-1"], "x": 12.0, "y": 154.2}], "767:1572208": [{"path": ["#scope-popover"], "x": 58.0, "y": 136.0}]};
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