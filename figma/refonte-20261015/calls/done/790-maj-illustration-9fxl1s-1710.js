// 42 Horizon — mise à jour en place des ressources (assets.py update, 17 oct. 2026) : Illustration/Une porte vers la troisième dimension, Illustration/Derrière une ligne de commande, Illustration/Montrer ce qui n’est pas encore fini, Illustration/Un jardin de petites idées, Illustration/ft_transcendence, Illustration/Derrière une ligne de commande (9fxl1s-1710)
const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const U = [{"ref": "9fxl1s-1710", "id": "5:223", "prefix": "Illustration/", "w": 800.0, "h": 500.0, "svg": "<svg width=\"800\" height=\"500\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 800 500\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"none\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n    <rect width=\"800\" height=\"500\" fill=\"#DCEDE7\"></rect>\n    <path d=\"M0 84h800M0 167h800M0 250h800M0 333h800M0 416h800M80 0v500M240 0v500M400 0v500M560 0v500M720 0v500\" stroke=\"#C5DCD3\" stroke-width=\"1\"></path>\n    <rect x=\"140\" y=\"96\" width=\"253\" height=\"310\" rx=\"26\" fill=\"#F5F3E9\"></rect>\n    <rect x=\"417\" y=\"96\" width=\"243\" height=\"142\" rx=\"26\" fill=\"#2A5550\"></rect>\n    <rect x=\"417\" y=\"259\" width=\"243\" height=\"147\" rx=\"26\" fill=\"#EFB7CC\"></rect>\n    <path d=\"M265 272v-91\" stroke=\"#27554A\" stroke-width=\"7\" fill=\"none\"></path>\n    <path d=\"M265 227c-59 0-70-28-70-56 50-1 70 26 70 56Z\" fill=\"#00BABC\"></path>\n    <path d=\"M266 209c61 0 75-34 75-60-48-1-75 22-75 60Z\" fill=\"#76AE92\"></path>\n    <path d=\"M223 270h85l-13 53h-59Z\" fill=\"#EC3391\"></path>\n    <rect x=\"194\" y=\"355\" width=\"142\" height=\"7\" rx=\"3.5\" fill=\"#B3C3B6\"></rect>\n    <rect x=\"217\" y=\"373\" width=\"96\" height=\"5\" rx=\"2.5\" fill=\"#DAE0D4\"></rect>\n    <circle cx=\"469\" cy=\"143\" r=\"16\" fill=\"#00BABC\"></circle>\n    <path d=\"m462 143 5 5 10-10\" stroke=\"#FFFFFF\" stroke-width=\"2\" fill=\"none\"></path>\n    <rect x=\"504\" y=\"136\" width=\"108\" height=\"7\" rx=\"3.5\" fill=\"#E2EDDB\"></rect>\n    <rect x=\"451\" y=\"184\" width=\"164\" height=\"6\" rx=\"3\" fill=\"#74958A\"></rect>\n    <rect x=\"451\" y=\"203\" width=\"96\" height=\"6\" rx=\"3\" fill=\"#74958A\"></rect>\n    <path d=\"M463 359v-37M498 359v-58M533 359v-45M568 359v-71M603 359v-92\" stroke=\"#9F3F70\" stroke-width=\"15\"></path>\n    <path d=\"M97 80v35M80 97h35\" stroke=\"#82AEA0\" stroke-width=\"2\"></path>\n    <circle cx=\"700\" cy=\"433\" r=\"13\" fill=\"#A5C7B8\"></circle>\n  </svg>"}];
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync('COLOR')) V[v.name] = v;
const SHAPES = ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'LINE', 'POLYGON', 'STAR', 'BOOLEAN_OPERATION'];
const pageOf = n => { while (n && n.type !== 'PAGE') n = n.parent; return n; };
const updated = [], errors = [];
for (const u of U) {
  let tmp = null, added = [];
  try {
    const comp = await figma.getNodeByIdAsync(u.id);
    if (!comp || comp.type !== 'COMPONENT') throw new Error('not a component: ' + u.id);
    if (pageOf(comp) !== page) throw new Error('not on the page « Icônes et marque »');
    if (Math.abs(comp.width - u.w) > 0.5 || Math.abs(comp.height - u.h) > 0.5) throw new Error('unexpected size ' + comp.width + ' × ' + comp.height);
    if (!(comp.description || '').includes(u.ref) && !comp.name.startsWith(u.prefix)) throw new Error('unexpected component « ' + comp.name + ' »');
    if (u.bind && !V[u.bind.v]) throw new Error('missing variable ' + u.bind.v);
    tmp = figma.createNodeFromSvg(u.svg);
    if (Math.abs(tmp.width - u.w) > 0.01 || Math.abs(tmp.height - u.h) > 0.01) throw new Error('SVG imported at ' + tmp.width + ' × ' + tmp.height);
    const old = [...comp.children];
    added = [...tmp.children];
    for (const c of added) comp.appendChild(c);
    for (const o of old) o.remove();
    added = [];
    tmp.remove(); tmp = null;
    for (const c of comp.children) if (c.type !== 'GROUP' && 'constraints' in c) c.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
    let bound = 0;
    if (u.bind) {
      const h = [1, 3, 5].map(i => parseInt(u.bind.hex.slice(i, i + 2), 16) / 255);
      for (const n of comp.findAllWithCriteria({ types: SHAPES })) {
        let hit = false;
        const s = n.strokes.map(p => { if (p.type === 'SOLID' && Math.abs(p.color.r - h[0]) < 0.003 && Math.abs(p.color.g - h[1]) < 0.003 && Math.abs(p.color.b - h[2]) < 0.003) { hit = true; return figma.variables.setBoundVariableForPaint(p, 'color', V[u.bind.v]); } return p; });
        if (hit) { n.strokes = s; bound++; }
      }
    }
    updated.push({ ref: u.ref, id: comp.id, name: comp.name, children: comp.children.length, shapes: comp.findAllWithCriteria({ types: SHAPES }).length,
                   texts: comp.findAllWithCriteria({ types: ['TEXT'] }).length, bound, w: comp.width, h: comp.height });
  } catch (e) {
    for (const c of added) if (!c.removed) c.remove();
    errors.push(u.ref + ': ' + e.message);
  } finally { if (tmp && !tmp.removed) tmp.remove(); }
}
return { updated, errors, mutatedNodeIds: updated.map(x => x.id) };