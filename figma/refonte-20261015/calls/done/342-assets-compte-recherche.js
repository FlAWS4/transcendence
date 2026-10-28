const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({family:'Jost', style:'Medium'}); await figma.loadFontAsync({family:'Jost', style:'Regular'});
const A = [{"ref": "m2k74t-81", "kind": "Icône intégrée", "name": "Icône intégrée/Retour", "w": 20, "h": 20, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><path d=\"m14 6-6 6 6 6\"></path></svg>"}, {"ref": "1qgndoo-164", "kind": "Icône intégrée", "name": "Icône intégrée/Langue", "w": 20, "h": 20, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><ellipse cx=\"12\" cy=\"12\" rx=\"4\" ry=\"9\"></ellipse><path d=\"M3 12h18\"></path></svg>"}, {"ref": "gdbd7c-83", "kind": "Icône intégrée", "name": "Icône intégrée/Coche · listes", "w": 18, "h": 18, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><path d=\"m5 12 4 4 10-10\"></path></svg>"}, {"ref": "nk3jnr-179", "kind": "Icône intégrée", "name": "Icône intégrée/Messagerie", "w": 24, "h": 24, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><path d=\"M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 3-2Z\"></path><path d=\"M7 9h10M7 13h6\"></path></svg>"}, {"ref": "1p72vvm-123", "kind": "Icône intégrée", "name": "Icône intégrée/Notifications", "w": 24, "h": 24, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4\"></path></svg>"}, {"ref": "ru0s0h-159", "kind": "Icône intégrée", "name": "Icône intégrée/Paramètres", "w": 20, "h": 20, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><path d=\"M4 7h16M4 17h16\"></path><circle cx=\"8\" cy=\"7\" r=\"2\"></circle><circle cx=\"16\" cy=\"17\" r=\"2\"></circle></svg>"}, {"ref": "1xhf2rd-121", "kind": "Icône intégrée", "name": "Icône intégrée/Thème", "w": 20, "h": 20, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><path d=\"M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z\"></path></svg>"}, {"ref": "1ehh37d-101", "kind": "Icône intégrée", "name": "Icône intégrée/Se déconnecter", "w": 20, "h": 20, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><path d=\"M9 4H4v16h5M11 12h10m-4-4 4 4-4 4\"></path></svg>"}, {"ref": "1c87ybt-145", "kind": "Icône intégrée", "name": "Icône intégrée/Rechercher dans Horizon", "w": 22, "h": 22, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><circle cx=\"10.5\" cy=\"10.5\" r=\"6.5\"></circle><path d=\"m16 16 4.5 4.5\"></path></svg>"}];
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