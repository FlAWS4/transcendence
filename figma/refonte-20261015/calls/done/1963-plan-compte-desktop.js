// 42 Horizon — plan des rues des pages Compte en membre (23 oct. 2026) : chaque emplacement reçoit l'image envoyée par upload_assets (par son empreinte, s'il ne l'a pas encore) et prend le nom des autres plans, « Plan du campus · carte du site » ; rien d'autre ne change
const page = await figma.getNodeByIdAsync('760:7');
await figma.setCurrentPageAsync(page);
const N = [["797:1125888", "5e02866c60dfbe3f1b9e198fefb0c044b7204ab3"], ["809:468625", "5e02866c60dfbe3f1b9e198fefb0c044b7204ab3"]];
const out = {};
for (const [id, hash] of N) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) { out[id] = 'absent'; continue; }
  let img = (n.fills || []).find(p => p.type === 'IMAGE');
  if (!img && hash) {
    if (!figma.getImageByHash(hash)) { out[id] = { name: n.name, image: null, unknownHash: hash }; continue; }
    n.fills = [{ type: 'IMAGE', imageHash: hash, scaleMode: 'FILL' }];
    img = n.fills[0];
  }
  if (!img) { out[id] = { name: n.name, image: null }; continue; }
  n.name = 'Plan du campus · carte du site';
  out[id] = { name: n.name, image: img.imageHash, scaleMode: img.scaleMode };
}
return out;