// 42 Horizon — symboles redessinés sur place (18 oct. 2026) : même composant, mêmes instances, contour de la police
// que Chrome utilise vraiment pour chaque caractère
const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: 'Jost', style: 'Medium' }); await figma.loadFontAsync({ family: 'Jost', style: 'Regular' });
const A = [{"id": "291:12", "ref": "glyph:liberation-sans-263a", "name": "Symbole/Liberation Sans · sourire (U+263A)", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"102.1\" height=\"111.719\" viewBox=\"0 0 2091 2288\"><path fill=\"#1B1B1B\" d=\"M 1657 1270 Q 1657 1524 1477 1702 Q 1297 1880 1045 1881 Q 792 1881 613 1702 Q 434 1523 433 1270 Q 433 1020 610 839 Q 787 658 1045 658 Q 1303 658 1480 839.5 Q 1657 1021 1657 1270 Z M 1567 1270 Q 1567 1053 1414 900 Q 1261 747 1045 746 Q 827 746 676 900 Q 523 1053 523 1270 Q 523 1486 676 1639 Q 829 1792 1045 1793 Q 1262 1793 1414 1639 Q 1566 1485 1567 1270 Z M 889 1143 Q 889 1175 866 1198 Q 843 1221 811 1221 Q 779 1221 756.5 1198 Q 734 1175 734 1143 Q 734 1111 756.5 1088.5 Q 779 1066 811 1066 Q 843 1066 866 1088.5 Q 889 1111 889 1143 Z M 1356 1143 Q 1356 1175 1334 1198 Q 1312 1221 1280 1221 Q 1248 1221 1224.5 1198 Q 1201 1175 1201 1143 Q 1201 1111 1224.5 1088.5 Q 1248 1066 1280 1066 Q 1312 1066 1334 1088.5 Q 1356 1111 1356 1143 Z M 822 1432 Q 898 1569 1045 1569 Q 1190 1569 1266 1432 L 1328 1467 Q 1230 1653 1045 1653 Q 860 1653 762 1467 L 822 1432 Z\"/></svg>", "family": "Liberation Sans"}, {"id": "291:15", "ref": "glyph:dejavu-sans-2197", "name": "Symbole/DejaVu Sans · flèche nord-est (U+2197)", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"83.789\" height=\"116.406\" viewBox=\"0 0 1716 2384\"><path fill=\"#1B1B1B\" d=\"M 1376 698 L 1439 761 L 1439 1317 L 1270 1317 L 1270 987 L 408 1849 L 288 1729 L 1150 867 L 820 867 L 820 698 L 1376 698 Z\"/></svg>", "family": "DejaVu Sans"}];
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const text = V['Rôles/text'];
const out = {}, missing = [];
let sec = null;
for (const a of A) {
  const comp = await figma.getNodeByIdAsync(a.id);
  if (!comp || comp.type !== 'COMPONENT') { missing.push(a.id); continue; }
  sec = sec || comp.parent;
  const node = figma.createNodeFromSvg(a.svg); comp.parent.appendChild(node);
  for (const c of [...comp.children]) c.remove();
  comp.resizeWithoutConstraints(node.width, node.height);
  for (const c of [...node.children]) comp.appendChild(c);
  node.remove();
  for (const c of comp.children) if ('constraints' in c) c.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  if (text) for (const v of comp.findAllWithCriteria({ types: ['VECTOR', 'BOOLEAN_OPERATION'] })) if (v.fills && v.fills.length) v.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', text)];
  comp.name = a.name; comp.fills = [];
  comp.description = 'Symbole absent de Jost, dessiné par Chrome en ' + a.family + ' (police de secours relevée), identifiant de relevé ' + a.ref + '.';
  out[a.ref] = { id: comp.id, w: comp.width, h: comp.height, name: comp.name, instances: (await comp.getInstancesAsync()).length };
}
if (sec && sec.type === 'SECTION') {
  sec.name = 'Symboles (polices de secours de Chrome)';
  const texts = sec.children.filter(n => n.type === 'TEXT');
  const title = texts.find(n => n.fontSize === 32), note = texts.find(n => n.fontSize === 16);
  if (title) title.characters = 'Symboles (polices de secours de Chrome)';
  if (note) note.characters = 'Jost n’a pas ces caractères. Chrome les prend dans sa police de secours : le sourire (U+263A) en Liberation Sans, par Arial, la flèche nord-est (U+2197) en DejaVu Sans, d’un seul ton, de la couleur du texte. Figma les afficherait en émoji couleur. Contours exacts de ces polices, 100 px par cadratin.';
}
return { updated: out, missing, section: sec ? sec.id : null };