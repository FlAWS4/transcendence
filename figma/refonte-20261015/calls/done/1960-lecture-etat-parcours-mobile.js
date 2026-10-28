// 42 Horizon — lecture seule (23 oct. 2026) : état de « 10 · Parcours · mobile » à la reprise (sections, cadres, zones au premier niveau, interactions, points de départ) ; rien n'est modifié
const page = await figma.getNodeByIdAsync('760:65');
await figma.setCurrentPageAsync(page);
const S = {"mobile-fr-entry": "760:66", "mobile-fr-explore": "760:69", "mobile-fr-projects": "760:72", "mobile-fr-people": "760:75", "mobile-fr-journal": "760:78", "mobile-fr-shared": "760:81", "mobile-fr-awards": "760:84", "mobile-fr-account": "760:87", "mobile-fr-member": "760:90", "mobile-en-entry": "760:93", "mobile-en-explore": "760:96", "mobile-en-projects": "760:99", "mobile-en-people": "760:102", "mobile-en-journal": "760:105", "mobile-en-shared": "760:108", "mobile-en-awards": "760:111", "mobile-en-account": "760:114", "mobile-en-member": "760:117", "mobile-staging": "760:120", "mobile-fr-global": "761:63", "mobile-en-global": "761:84"};
const out = { page: page.name, children: page.children.length, flows: page.flowStartingPoints.length, sections: {}, frames: {} };
for (const [sid, id] of Object.entries(S)) {
  const s = await figma.getNodeByIdAsync(id);
  if (!s) { out.sections[sid] = 'absente'; continue; }
  const fr = s.children.filter(n => n.type === 'FRAME');
  out.sections[sid] = [s.name, fr.length];
  for (const f of fr) out.frames[f.id] = [f.children.filter(c => c.name.startsWith('Zone · ')).length, (f.reactions || []).length];
}
out.others = page.children.filter(n => n.type !== 'SECTION').map(n => [n.type, n.name, n.id]);
return out;