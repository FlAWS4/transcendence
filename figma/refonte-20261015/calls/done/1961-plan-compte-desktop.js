// 42 Horizon — plan des rues des pages Compte en membre (19 oct. 2026) : les emplacements remplis par upload_assets prennent le nom des autres plans, « Plan du campus · carte du site » ; seuls leurs noms changent
const page = await figma.getNodeByIdAsync('760:7');
await figma.setCurrentPageAsync(page);
const out = {};
for (const id of ["797:1125888", "809:468625"]) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) { out[id] = 'absent'; continue; }
  const img = (n.fills || []).find(p => p.type === 'IMAGE');
  if (!img) { out[id] = { name: n.name, image: null }; continue; }
  n.name = 'Plan du campus · carte du site';
  out[id] = { name: n.name, image: img.imageHash, scaleMode: img.scaleMode };
}
return out;