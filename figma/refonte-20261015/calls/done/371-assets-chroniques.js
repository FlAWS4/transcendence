const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({family:'Jost', style:'Medium'}); await figma.loadFontAsync({family:'Jost', style:'Regular'});
const A = [{"ref": "wur4f5-193", "kind": "Icône intégrée", "name": "Icône intégrée/Auteurs", "w": 19, "h": 19, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><circle cx=\"9\" cy=\"8\" r=\"3\"></circle><path d=\"M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 4a4 4 0 0 1 3 4v1\"></path></svg>"}, {"ref": "1jtwtz9-1629", "kind": "Illustration", "name": "Illustration/Montrer ce qui n’est pas encore fini", "w": 745, "h": 465.63, "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 800 500\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\" focusable=\"false\">\n    <rect width=\"800\" height=\"500\" fill=\"#203F42\"></rect>\n    <path d=\"M0 440 800 90v410H0Z\" fill=\"#294F4F\"></path>\n    <rect x=\"130\" y=\"70\" width=\"263\" height=\"357\" rx=\"3\" fill=\"#102E33\" opacity=\".3\" transform=\"rotate(-8 260 250)\"></rect>\n    <g transform=\"rotate(-8 260 250)\">\n      <rect x=\"116\" y=\"56\" width=\"263\" height=\"357\" rx=\"3\" fill=\"#F1EFDF\"></rect>\n      <path d=\"M150 105h195M150 116h120\" stroke=\"#87A299\" stroke-width=\"3\"></path>\n      <text x=\"137\" y=\"271\" fill=\"#EC3391\" font-family=\"Georgia,serif\" font-size=\"165\">“</text>\n      <rect x=\"152\" y=\"284\" width=\"172\" height=\"5\" fill=\"#647C70\"></rect>\n      <rect x=\"152\" y=\"303\" width=\"149\" height=\"5\" fill=\"#647C70\"></rect>\n      <rect x=\"152\" y=\"322\" width=\"165\" height=\"5\" fill=\"#647C70\"></rect>\n      <rect x=\"152\" y=\"364\" width=\"57\" height=\"5\" fill=\"#A2B0A0\"></rect>\n    </g>\n    <g transform=\"rotate(9 526 268)\">\n      <rect x=\"413\" y=\"133\" width=\"232\" height=\"288\" rx=\"3\" fill=\"#00BABC\"></rect>\n      <text x=\"441\" y=\"225\" fill=\"#133D3E\" font-family=\"monospace\" font-size=\"70\" font-weight=\"700\">&amp;</text>\n      <path d=\"M445 262h161M445 277h139M445 292h161M445 307h113\" stroke=\"#165F5D\" stroke-width=\"4\"></path>\n      <circle cx=\"575\" cy=\"369\" r=\"22\" fill=\"#F3E6D8\"></circle>\n      <path d=\"m566 369 7 7 12-13\" fill=\"none\" stroke=\"#256C62\" stroke-width=\"3\"></path>\n    </g>\n    <path d=\"M681 86h35M698 69v35\" stroke=\"#76A69D\" stroke-width=\"2\"></path>\n    <circle cx=\"77\" cy=\"395\" r=\"8\" fill=\"#EC3391\"></circle>\n  </svg>"}];
const SECTIONS = { 'Icône intégrée': 'Icônes intégrées', 'Illustration': 'Illustrations', 'Portrait': 'Portraits', 'Image SVG': 'Images SVG', 'Glyphe': 'Glyphes du scan (DejaVu Sans Mono)', 'Globe': 'Globe vectoriel' };
const out = {}, errors = [];
const sec = {};
for (const s of page.children) if (s.type === 'SECTION') sec[s.name] = s;
let bottom = 0; for (const s of page.children) bottom = Math.max(bottom, s.y + s.height);
for (const a of A) {
  const title = SECTIONS[a.kind] || a.kind;
  if (!sec[title]) {
    const s = figma.createSection(); page.appendChild(s); s.name = title; s.x = 0; s.y = bottom + 80; s.resizeWithoutConstraints(1600, 200);
    const t = figma.createText(); s.appendChild(t); t.fontName = {family:'Jost', style:'Medium'}; t.fontSize = 32; t.characters = title; t.x = 40; t.y = 40;
    sec[title] = s; bottom = s.y + s.height;
  }
  const s = sec[title];
  try {
    const node = figma.createNodeFromSvg(a.svg);
    s.appendChild(node);
    const comp = figma.createComponentFromNode(node);
    comp.name = a.name; comp.fills = [];
    comp.description = 'Ressource du prototype (' + a.kind + '), identifiant de relevé ' + a.ref + '.';
    for (const c of comp.children) if (c.type !== 'GROUP' && 'constraints' in c) c.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
    // grid placement inside the section
    const kids = s.children.filter(n => n.type === 'COMPONENT');
    const G = { 'Icône intégrée': [16, 80, 80], 'Portrait': [6, 290, 290], 'Glyphe': [12, 100, 160], 'Globe': [2, 1560, 1080] }[a.kind] || [2, 860, 560];
    const i = kids.length - 1, cols = G[0], cellW = G[1], cellH = G[2];
    comp.x = 40 + (i % cols) * cellW; comp.y = 110 + Math.floor(i / cols) * cellH;
    const needW = Math.max(s.width, comp.x + comp.width + 40), needH = Math.max(s.height, comp.y + comp.height + 60);
    s.resizeWithoutConstraints(needW, needH);
    out[a.ref] = comp.id;
  } catch (e) { errors.push(a.ref + ': ' + e.message); }
}
// theme-aware defaults: scan glyphs in the text role, the entrance ring in the accent role
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const bind = name => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[name]);
for (const a of A) {
  const id = out[a.ref]; if (!id) continue;
  const c = await figma.getNodeByIdAsync(id);
  const role = a.kind === 'Glyphe' || a.kind === 'Icône intégrée' ? 'Rôles/text' : (a.name.startsWith('Anneau') ? 'Rôles/accent' : null);
  if (!role || !V[role]) continue;
  for (const v of c.findAllWithCriteria({ types: ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'LINE', 'POLYGON', 'STAR', 'BOOLEAN_OPERATION'] })) {
    if (v.strokes && v.strokes.length) v.strokes = [bind(role)];
    if (v.fills && v.fills.length) v.fills = [bind(role)];
  }
}
return { created: out, errors, count: Object.keys(out).length };