// 42 Horizon — lecture seule (19 oct. 2026) : emplacements « à remplacer » des pages Compte en membre (plan des rues) ; rien n'est modifié
const page = await figma.getNodeByIdAsync('760:7');
await figma.setCurrentPageAsync(page);
const out = {};
for (const id of ["797:1125772", "809:468509"]) {
  const f = await figma.getNodeByIdAsync(id);
  if (!f) { out[id] = 'absent'; continue; }
  out[id] = { name: f.name, parent: f.parent && f.parent.name, places: f.findAll(n => n.name.endsWith(' · à remplacer')).map(n => [n.id, n.name, n.type, Math.round(n.width), Math.round(n.height), (n.fills || []).map(p => p.type)]) };
}
return out;