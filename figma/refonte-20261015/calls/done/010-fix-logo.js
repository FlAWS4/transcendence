// Rebuild the vectors of « Marque/Logo 42 » (2:112) from the official SVG: the first build placed each path at the
// origin of its own bounding box. The component keeps its id, so every instance is corrected at once.
const comp = await figma.getNodeByIdAsync('2:112');
if (!comp || comp.type !== 'COMPONENT') throw new Error('Logo component not found');
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const W = comp.width, H = comp.height;
for (const c of [...comp.children]) c.remove();
const tmp = figma.createNodeFromSvg("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"31.144531\" height=\"21.855468\" viewBox=\"0 0 31.144531 21.855468\" fill=\"#000000\">\n  \n  <path d=\"M 17.210938 0 L 11.472656 0 L 0 11.476562 L 0 16.121093 L 11.472656 16.121093 L 11.472656 21.855468 L 17.210938 21.855468 L 17.210938 11.476562 L 5.738281 11.476562 Z M 17.210938 0 \"/>\n  <path d=\"M 19.667969 5.738281 L 25.40625 0 L 19.667969 0 Z M 19.667969 5.738281 \"/>\n  <path d=\"M 31.144531 5.738281 L 31.144531 0 L 25.40625 0 L 25.40625 5.738281 L 19.667969 11.476562 L 19.667969 17.210937 L 25.40625 17.210937 L 25.40625 11.476562 Z M 31.144531 5.738281 \"/>\n  <path d=\"M 31.144531 11.476562 L 25.40625 17.210937 L 31.144531 17.210937 Z M 31.144531 11.476562 \"/>\n</svg>");
comp.parent.appendChild(tmp);
const k = W / tmp.width;
tmp.rescale(k);
for (const c of [...tmp.children]) {
  const x = c.x, y = c.y;
  comp.appendChild(c); c.x = x; c.y = y;
  if ('constraints' in c && c.type !== 'GROUP') c.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  for (const v of (c.type === 'VECTOR' ? [c] : c.findAllWithCriteria({ types: ['VECTOR'] }))) v.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V['Rôles/logo'])];
}
tmp.remove();
comp.resize(W, H);
return { id: comp.id, children: comp.children.length, size: [comp.width, comp.height] };