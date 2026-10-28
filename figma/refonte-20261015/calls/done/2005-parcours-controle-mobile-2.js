// 42 Horizon — lecture seule (19 oct. 2026) : cadres, zones, interactions et points de départ de « 10 · Parcours · mobile » ; rien n'est modifié
const page = await figma.getNodeByIdAsync('760:65');
await figma.setCurrentPageAsync(page);
const S = {"mobile-fr-account": "760:87", "mobile-fr-member": "760:90", "mobile-en-entry": "760:93", "mobile-en-explore": "760:96", "mobile-en-projects": "760:99"}, IN = {"767:1535383": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 76.0}], "767:1535493": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 78.0}], "767:1535616": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 76.0}], "767:1535737": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 76.0}], "767:1535847": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 76.0}], "767:1535959": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 78.0}], "767:1536066": [{"path": ["Application", "En-tête", "#account-menu"], "x": 84.0, "y": 78.0}], "767:1536170": [{"path": ["#dialog"], "x": 19.0, "y": 270.4}], "767:1540222": [{"path": ["#dialog"], "x": 19.0, "y": 250.6}], "767:1572310": [{"path": ["#dialog"], "x": 19.0, "y": 154.6}], "793:191405": [{"path": ["#project-campus-choice-1"], "x": 12.0, "y": 229.0}], "767:1573821": [{"path": ["#dialog"], "x": 10.0, "y": 209.4}], "767:1575616": [{"path": ["#dialog"], "x": 10.0, "y": 10.0}], "767:1721442": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-active-section", ".cp-comments-discussion", "#project-comment-sort-menu"], "x": 186.0, "y": 452.5}], "767:1399905": [{"path": ["#dialog"], "x": 19.0, "y": 278.4}], "767:1722382": [{"path": ["#content-category-dialog", ".cp-project-filter-form", ".cp-project-filter-body"], "x": 9.0, "y": 313.5}], "782:183555": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-active-section", ".cp-comments-form", ".cp-mention-picker", "Profiles to mention"], "x": 33.0, "y": 535.3}], "793:194739": [{"path": ["Application", "Contenu", "#project-detail", ".cp-project-section-switch", "Project sections"], "x": 24.0, "y": 501.8}], "794:192211": [{"path": ["Application", "Contenu", "#content-sort-menu"], "x": 72.0, "y": 229.0}], "767:1676158": [{"path": ["#scope-popover"], "x": 58.0, "y": 136.0}]};
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