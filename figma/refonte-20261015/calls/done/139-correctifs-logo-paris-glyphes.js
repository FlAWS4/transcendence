// 42 Horizon — correctifs ponctuels (refonte Figma, 16 oct. 2026), sans nouveau rendu :
// 1. logo de 42 Paris (composant 77:7905) : l'import SVG de Figma a ignoré le filtre feColorMatrix qui blanchit ses formes
//    (#000105 → #FFFFFF) ; elles sont peintes en blanc, comme sur le site, dans les deux thèmes.
// 2. page « 01 · Arrivée et décryptage » : les glyphes resserrés (vecteurs « · resserré × ») affichaient la couleur de base
//    noire de leur peinture liée dans les cadres clairs ; la peinture est reliée à sa variable avec, pour couleur de base,
//    la valeur résolue dans le mode du cadre.
const pageOf = n => { while (n && n.type !== 'PAGE') n = n.parent; return n; };
const out = { logoPaints: 0, glyphs: 0, glyphsWithoutVariable: 0 };
const logo = await figma.getNodeByIdAsync('77:7905');
if (!logo) throw new Error('Composant du logo de 42 Paris introuvable (77:7905)');
await figma.setCurrentPageAsync(pageOf(logo));
for (const v of logo.findAll(n => 'fills' in n && Array.isArray(n.fills) && n.fills.some(p => p.type === 'SOLID'))) {
  v.fills = v.fills.map(p => p.type === 'SOLID' ? { type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: p.opacity === undefined ? 1 : p.opacity } : p);
  out.logoPaints++;
}
const page = await figma.getNodeByIdAsync('1:8');
await figma.setCurrentPageAsync(page);
for (const v of page.findAll(n => n.type === 'VECTOR' && n.name.includes('· resserré ×'))) {
  const p = v.fills[0];
  const id = p && p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
  if (!id) { out.glyphsWithoutVariable++; continue; }
  const cv = await figma.variables.getVariableByIdAsync(id);
  const rv = cv.resolveForConsumer(v).value;
  v.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: rv.r, g: rv.g, b: rv.b } }, 'color', cv)];
  out.glyphs++;
}
return out;
