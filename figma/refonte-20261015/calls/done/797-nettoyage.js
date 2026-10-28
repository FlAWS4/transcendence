// 42 Horizon — nettoyage de fin de refonte (17 oct. 2026) : page technique 4:2 (ancien moteur stocké, nœud 4:3) et
// variables de texte « _pipeline/… » des essais 004/005. Rien n'est supprimé si la page contient autre chose que le
// moteur ou ses morceaux de données, ni une variable encore liée à un calque de la page Archives.
const out = { page: null, removedVars: [], keptVars: [] };
const tp = await figma.getNodeByIdAsync('4:2');
if (tp && tp.type === 'PAGE') {
  await tp.loadAsync();
  const kids = tp.children.map(n => ({ id: n.id, name: n.name.slice(0, 60), type: n.type }));
  const expected = n => n.type === 'TEXT' && (n.id === '4:3' || n.name.startsWith('⟦data⟧') || /moteur|renderer|render/i.test(n.name));
  const unexpected = tp.children.filter(n => !expected(n)).map(n => n.type + ' ' + n.name.slice(0, 60));
  out.page = { id: tp.id, name: tp.name, count: kids.length, children: kids.slice(0, 12), unexpected: unexpected.slice(0, 12) };
  if (!unexpected.length && figma.currentPage !== tp) { tp.remove(); out.page.removed = true; }
}
const coll = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:97');
const pipe = [];
for (const id of coll.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); if (v && v.name.startsWith('_pipeline/')) pipe.push(v); }
const used = new Set();
if (pipe.length) {
  const archives = await figma.getNodeByIdAsync('1:16');
  if (archives && archives.type === 'PAGE') {
    await archives.loadAsync();
    for (const t of archives.findAllWithCriteria({ types: ['TEXT'] })) {
      const b = t.boundVariables && t.boundVariables.characters;
      if (b && b.id) used.add(b.id);
    }
  }
}
for (const v of pipe) {
  if (used.has(v.id)) { out.keptVars.push(v.name); continue; }
  out.removedVars.push(v.name); v.remove();
}
return out;
