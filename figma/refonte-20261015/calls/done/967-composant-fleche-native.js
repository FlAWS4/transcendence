// 42 Horizon — composant « Flèche native de liste (Chrome) » (18 oct. 2026, étude audit-ecarts-restants)
// Flèche que Chrome 155 peint lui-même dans un <select> fermé (appearance auto) : NativeThemeBase::PaintMenuList
// (ui/native_theme/native_theme_base.cc, l. 690-800 au tag 155.0.8059.84) : V ouvert, ligne médiane 8 x 4 px,
// trait 2 px (setStrokeWidth(2.0f)), bouts plats et jonction en onglet (défauts Skia), couleur = color du <select>.
// Composant 10 x 7 : la ligne médiane part de (1, 1), l'encre tient dans [0.293, 9.707] x [0.293, 6.414].
// Page « Icônes et marque » = 1:5 (figma-ledger.json « pages »). Une fois créé : figma-ledger.json
// components.icons['select-arrow'] = <id> (make_call.context() le passe dans X.icons).
const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: 'Jost', style: 'Medium' }); await figma.loadFontAsync({ family: 'Jost', style: 'Regular' });
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const TITLE = 'Contrôles natifs (Chrome)';
let sec = page.children.find(n => n.type === 'SECTION' && n.name === TITLE);
if (!sec) {
  let bottom = 0; for (const s of page.children) bottom = Math.max(bottom, s.y + s.height);
  sec = figma.createSection(); page.appendChild(sec); sec.name = TITLE; sec.x = 0; sec.y = bottom + 80; sec.resizeWithoutConstraints(1600, 320);
  const t = figma.createText(); sec.appendChild(t); t.fontName = { family: 'Jost', style: 'Medium' }; t.fontSize = 32; t.characters = TITLE; t.x = 40; t.y = 40;
  const n = figma.createText(); sec.appendChild(n); n.fontName = { family: 'Jost', style: 'Regular' }; n.fontSize = 16; n.x = 40; n.y = 90;
  n.characters = 'Ce que Chrome dessine lui-même, hors du DOM : flèche d’un <select> fermé (V ouvert 8 x 4, trait 2, bouts plats, onglet).';
  n.textAutoResize = 'HEIGHT'; n.resize(1500, n.height);
}
const NAME = 'Flèche native de liste (Chrome)';
for (const old of sec.children.filter(n => n.type === 'COMPONENT' && n.name === NAME)) old.remove();
const comp = figma.createComponent(); sec.appendChild(comp);
comp.name = NAME; comp.resize(10, 7); comp.fills = []; comp.clipsContent = false;
comp.description = 'Flèche que Chrome 155 peint dans un <select> fermé (NativeThemeBase::PaintMenuList) : V ouvert, ligne médiane 8 × 4 depuis (1, 1), trait 2, bouts plats (NONE), jonction en onglet (MITER, limite 4), couleur = color du select. Placée par dom2fig.select_arrow_origin().';
const v = figma.createVector(); comp.appendChild(v);
v.vectorPaths = [{ windingRule: 'NONE', data: 'M 0 0 L 4 4 L 8 0' }];
v.x = 1; v.y = 1;
v.fills = [];
const paint = V['Rôles/logo']
  ? figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V['Rôles/logo'])
  : { type: 'SOLID', color: { r: 27 / 255, g: 27 / 255, b: 27 / 255 } };
v.strokes = [paint];
v.strokeWeight = 2; v.strokeAlign = 'CENTER'; v.strokeCap = 'NONE'; v.strokeJoin = 'MITER'; v.strokeMiterLimit = 4;
v.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
v.name = 'V ouvert 8 × 4 · trait 2';
comp.x = 40; comp.y = 150;
// contrôles relus : taille, tracé, contour du trait (6 sommets attendus : (-0.707, 0.707) (4, 5.414) (8.707, 0.707)
// (7.293, -0.707) (4, 2.586) (0.707, -0.707) dans le repère du vecteur), limites d'encre
return { id: comp.id, comp: [comp.width, comp.height], vec: [v.x, v.y, v.width, v.height], path: v.vectorPaths, cap: v.strokeCap,
         join: v.strokeJoin, miter: v.strokeMiterLimit, weight: v.strokeWeight, stroke: v.strokeGeometry, render: v.absoluteRenderBounds };
