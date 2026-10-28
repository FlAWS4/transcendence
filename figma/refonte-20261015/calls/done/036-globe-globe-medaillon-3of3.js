const tools = await figma.getNodeByIdAsync('4:2');
const N = 2, REF = "globe:globe-medaillon";
const parts = [];
for (let k = 1; k <= N; k++) {
  const nm = '⟦data⟧ ' + REF + ' · ' + k + '/' + N;
  const t = tools.children.find(n => n.name === nm);
  if (!t) throw new Error('partie manquante : ' + nm);
  parts.push(t.characters);
}
const svg = parts.join('');
let h = 0x811c9dc5; for (let i = 0; i < svg.length; i++) { h ^= svg.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
if (svg.length !== 10666 || h !== 325940575) throw new Error('données altérées : longueur ' + svg.length + ', empreinte ' + h);
const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: 'Jost', style: 'Medium' });
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const paint = (name, opacity) => { const p = figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[name]); return opacity === undefined ? p : { ...p, opacity }; };
const A = {"ref": "globe:globe-medaillon", "name": "Globe/Médaillon des rubriques", "slot": 4, "description": "Globe vectoriel du site (projection en perspective verticale de MapLibre 5.24, comme le site), généré par scripts/globe_svg.py ; aligné sur les captures à moins d’1 px. Couleurs liées aux variables Globe/… (clair et sombre). Repères de campus dessinés par les écrans."};
let sec = page.children.find(n => n.type === 'SECTION' && n.name === 'Globe vectoriel');
if (!sec) {
  let bottom = 0; for (const s of page.children) bottom = Math.max(bottom, s.y + s.height);
  sec = figma.createSection(); page.appendChild(sec); sec.name = 'Globe vectoriel'; sec.x = 0; sec.y = bottom + 80; sec.resizeWithoutConstraints(3300, 1200);
  const tt = figma.createText(); sec.appendChild(tt); tt.fontName = { family: 'Jost', style: 'Medium' }; tt.fontSize = 32; tt.characters = 'Globe vectoriel'; tt.x = 40; tt.y = 40;
}
for (const old of sec.children.filter(n => n.type === 'COMPONENT' && n.name === A.name)) old.remove();
const node = figma.createNodeFromSvg(svg);
sec.appendChild(node);
const comp = figma.createComponentFromNode(node);
comp.name = A.name; comp.fills = [];
comp.description = A.description;
let bound = 0;
for (const n of comp.findAll(() => true)) {
  const nm = n.name || '';
  if (!('fills' in n)) continue;
  if (nm === 'ocean') { n.fills = [paint('Globe/océan')]; bound++; }
  else if (nm.startsWith('land')) { n.fills = [paint('Globe/terres')]; bound++; }
  else if (nm.startsWith('borders')) { const op = n.strokes && n.strokes[0] ? n.strokes[0].opacity : 0.73; n.strokes = [paint('Globe/frontières', op)]; bound++; }
  else if (nm.startsWith('fade')) {
    n.fills = n.fills.map(f => f.type && f.type.startsWith('GRADIENT') ? { ...f, gradientStops: f.gradientStops.map(s => ({ ...s, boundVariables: { color: figma.variables.createVariableAlias(V[s.color.a > 0.5 ? 'Rôles/bg' : 'dérivées/dégradé/F7FAFA00-1B1B1B00']) } })) } : f);
    bound++;
  }
}
// fixed slot per globe (two per row), whatever the order of the calls
comp.x = 40 + (A.slot % 2) * 1520; comp.y = 110 + Math.floor(A.slot / 2) * 1000;
let w = 0, hh = 0; for (const c of sec.children) { w = Math.max(w, c.x + c.width); hh = Math.max(hh, c.y + c.height); }
sec.resizeWithoutConstraints(w + 40, hh + 40);
for (const t of tools.children.filter(n => n.name.startsWith('⟦data⟧ ' + REF + ' · '))) t.remove();
return { created: { [A.ref]: comp.id }, bound, size: [comp.width, comp.height], data: svg.length };