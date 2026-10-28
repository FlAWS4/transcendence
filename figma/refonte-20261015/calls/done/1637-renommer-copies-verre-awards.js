// 42 Horizon — copies de l'écran sous le verre renommées « Écran (copie sous le verre) » : glassCopies leur donnait le nom de construction « ⟦build …⟧ » du cadre (corrigé le 19 oct. 2026 dans render.js) ; seuls ces noms changent (refonte Figma)
const page = await figma.getNodeByIdAsync('1:13');
await figma.setCurrentPageAsync(page);
const frames = page.findAllWithCriteria({ types: ['FRAME'] }).filter(n => n.name.startsWith('⟦build') && n.parent && n.parent.name === 'Calques peints avant le verre');
for (const n of frames) n.name = 'Écran (copie sous le verre)';
const left = page.findAllWithCriteria({ types: ['FRAME'] }).filter(n => n.name.startsWith('⟦build')).map(n => n.id + ' ' + n.name + ' (dans ' + (n.parent ? n.parent.name : '?') + ')');
return { page: page.name, renamed: frames.length, leftBuild: left.length, leftSample: left.slice(0, 8) };