// 42 Horizon — lecture seule (23 oct. 2026) : état de « 09 · Parcours · ordinateur » à la reprise (sections, cadres, zones au premier niveau, interactions, points de départ) ; rien n'est modifié
const page = await figma.getNodeByIdAsync('760:7');
await figma.setCurrentPageAsync(page);
const S = {"desktop-fr-entry": "760:8", "desktop-fr-explore": "760:11", "desktop-fr-projects": "760:14", "desktop-fr-people": "760:17", "desktop-fr-journal": "760:20", "desktop-fr-shared": "760:23", "desktop-fr-awards": "760:26", "desktop-fr-account": "760:29", "desktop-fr-member": "760:32", "desktop-en-entry": "760:35", "desktop-en-explore": "760:38", "desktop-en-projects": "760:41", "desktop-en-people": "760:44", "desktop-en-journal": "760:47", "desktop-en-shared": "760:50", "desktop-en-awards": "760:53", "desktop-en-account": "760:56", "desktop-en-member": "760:59", "desktop-staging": "760:62", "desktop-fr-global": "761:19", "desktop-en-global": "761:40"};
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