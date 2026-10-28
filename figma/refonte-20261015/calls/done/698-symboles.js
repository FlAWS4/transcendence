const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: 'Jost', style: 'Medium' }); await figma.loadFontAsync({ family: 'Jost', style: 'Regular' });
const A = [{"ref": "glyph:dejavu-sans-263a", "name": "Symbole/DejaVu Sans · sourire (U+263A)", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"104.248\" height=\"116.406\" viewBox=\"0 0 2135 2384\"><path fill=\"#1B1B1B\" d=\"M 642 880 Q 642 821 682.5 780.5 Q 723 740 782 740 Q 840 740 881 780.5 Q 922 821 922 880 Q 922 939 881 980 Q 840 1021 782 1021 Q 723 1021 682.5 979.5 Q 642 938 642 880 Z M 1220 880 Q 1220 821 1261 780.5 Q 1302 740 1360 740 Q 1418 740 1459.5 780.5 Q 1501 821 1501 880 Q 1501 938 1459.5 979.5 Q 1418 1021 1360 1021 Q 1301 1021 1260.5 979.5 Q 1220 938 1220 880 Z M 170 1155 Q 170 782 433 518.5 Q 696 255 1068 255 Q 1441 255 1703 518.5 Q 1965 782 1965 1155 Q 1965 1527 1703 1789 Q 1441 2051 1068 2051 Q 696 2051 433 1789 Q 170 1527 170 1155 Z M 305 1155 Q 305 1471 528.5 1693.5 Q 752 1916 1068 1916 Q 1385 1916 1607.5 1693.5 Q 1830 1471 1830 1155 Q 1830 838 1607.5 614 Q 1385 390 1068 390 Q 752 390 528.5 614 Q 305 838 305 1155 Z M 541 1436 L 656 1365 Q 684 1408 724 1447 Q 866 1589 1068 1589 Q 1270 1589 1412 1447 Q 1451 1408 1480 1364 L 1595 1436 Q 1558 1492 1508 1543 Q 1326 1724 1068 1724 Q 810 1724 628 1543 Q 577 1492 541 1436 Z\"/></svg>"}, {"ref": "glyph:dejavu-sans-2197", "name": "Symbole/DejaVu Sans · flèche nord-est (U+2197)", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"83.789\" height=\"116.406\" viewBox=\"0 0 1716 2384\"><path fill=\"#1B1B1B\" d=\"M 1376 698 L 1439 761 L 1439 1317 L 1270 1317 L 1270 987 L 408 1849 L 288 1729 L 1150 867 L 820 867 L 820 698 L 1376 698 Z\"/></svg>"}];
const TITLE = 'Symboles (DejaVu Sans)';
let sec = page.children.find(n => n.type === 'SECTION' && n.name === TITLE);
if (!sec) {
  let bottom = 0; for (const s of page.children) bottom = Math.max(bottom, s.y + s.height);
  sec = figma.createSection(); page.appendChild(sec); sec.name = TITLE; sec.x = 0; sec.y = bottom + 80; sec.resizeWithoutConstraints(1600, 200);
  const t = figma.createText(); sec.appendChild(t); t.fontName = { family: 'Jost', style: 'Medium' }; t.fontSize = 32; t.characters = TITLE; t.x = 40; t.y = 40;
  const n = figma.createText(); sec.appendChild(n); n.fontName = { family: 'Jost', style: 'Regular' }; n.fontSize = 16; n.x = 40; n.y = 90;
  n.characters = 'Jost n’a pas ces caractères : Chrome les dessine en DejaVu Sans, d’un seul ton, de la couleur du texte. Figma les afficherait en émoji couleur. Contours exacts de DejaVu Sans, 100 px par cadratin.';
  n.textAutoResize = 'HEIGHT'; n.resize(1500, n.height);
}
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const text = V['Rôles/text'];
const out = {};
A.forEach((a, i) => {
  for (const old of sec.children.filter(n => n.type === 'COMPONENT' && n.name === a.name)) old.remove();
  const node = figma.createNodeFromSvg(a.svg); sec.appendChild(node);
  const comp = figma.createComponentFromNode(node);
  comp.name = a.name; comp.fills = [];
  comp.description = 'Symbole dessiné par Chrome en DejaVu Sans (absent de Jost), identifiant de relevé ' + a.ref + '.';
  for (const c of comp.children) if ('constraints' in c) c.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  if (text) for (const v of comp.findAllWithCriteria({ types: ['VECTOR', 'BOOLEAN_OPERATION'] })) if (v.fills && v.fills.length) v.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', text)];
  comp.x = 40 + i * 180; comp.y = 150;
  out[a.ref] = comp.id;
});
sec.resizeWithoutConstraints(Math.max(1600, 40 + A.length * 180 + 40), 320);
return { created: out, count: Object.keys(out).length };