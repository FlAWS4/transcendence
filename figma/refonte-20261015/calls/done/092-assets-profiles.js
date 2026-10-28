const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({family:'Jost', style:'Medium'}); await figma.loadFontAsync({family:'Jost', style:'Regular'});
const A = [{"ref": "1fetukd-211", "kind": "Icône intégrée", "name": "Icône intégrée/Envoyer un message", "w": 16, "h": 16, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><path d=\"M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3h2a8.5 8.5 0 0 1 8.5 8.5Z\"></path><path d=\"M7 9h9M7 13h6\"></path></svg>"}, {"ref": "5rjxzj-157", "kind": "Icône intégrée", "name": "Icône intégrée/Vue d’ensemble · profil", "w": 19, "h": 19, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><circle cx=\"12\" cy=\"8\" r=\"3.5\"></circle><path d=\"M5 21v-2a7 7 0 0 1 14 0v2\"></path></svg>"}, {"ref": "zpj70d-136", "kind": "Icône intégrée", "name": "Icône intégrée/Projets · profil", "w": 19, "h": 19, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><path d=\"m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5\"></path></svg>"}, {"ref": "jzsgmo-219", "kind": "Icône intégrée", "name": "Icône intégrée/Parcours · profil", "w": 19, "h": 19, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><circle cx=\"6\" cy=\"5\" r=\"2\"></circle><circle cx=\"18\" cy=\"19\" r=\"2\"></circle><path d=\"M6 7v5a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8m-3 2 3-3 3 3\"></path></svg>"}, {"ref": "19hqjfg-168", "kind": "Icône intégrée", "name": "Icône intégrée/Contribution · profil", "w": 19, "h": 19, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"3\"></rect><path d=\"M9 3v18m4-12h3m-3 4h3\"></path></svg>"}, {"ref": "14x7gt8-180", "kind": "Icône intégrée", "name": "Icône intégrée/Trophée · distinctions du profil", "w": 26, "h": 26, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><path d=\"M8 3h8v5a4 4 0 0 1-8 0Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v6m-4 3h8m-7-3h6\"></path></svg>"}, {"ref": "7a7jq8-89", "kind": "Icône intégrée", "name": "Icône intégrée/Flèche vers la gauche · courte · Retour aux profils", "w": 18, "h": 18, "svg": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#1B1B1B\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><path d=\"m14 6-6 6 6 6M8 12h12\"></path></svg>"}];
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
