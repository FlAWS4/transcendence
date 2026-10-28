// 42 Horizon — mise à jour en place des ressources (assets.py update, 17 oct. 2026) : Illustration/Une porte vers la troisième dimension, Illustration/Derrière une ligne de commande, Illustration/Montrer ce qui n’est pas encore fini, Illustration/Un jardin de petites idées, Illustration/ft_transcendence, Illustration/Derrière une ligne de commande (114x1ky-1393)
const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const U = [{"ref": "114x1ky-1393", "id": "5:161", "prefix": "Illustration/", "w": 800.0, "h": 500.0, "svg": "<svg width=\"800\" height=\"500\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 800 500\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"none\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n    <rect width=\"800\" height=\"500\" fill=\"#102E35\"></rect>\n    <path d=\"M0 0h800L494 166H314Z\" fill=\"#284851\"></path>\n    <path d=\"M0 500h800L494 334H314Z\" fill=\"#1A3B43\"></path>\n    <path d=\"M0 0 314 166v168L0 500Z\" fill=\"#4B8D8D\"></path>\n    <path d=\"M800 0 494 166v168L800 500Z\" fill=\"#216267\"></path>\n    <path d=\"M0 84 314 195M0 220 314 238M0 380l314-87M96 51v398M209 111v278\" stroke=\"#0A545D\" stroke-width=\"3\" opacity=\".6\"></path>\n    <path d=\"M800 84 494 195M800 220l-306 18M800 380l-306-87M705 52v396M594 112v276\" stroke=\"#0E444B\" stroke-width=\"3\"></path>\n    <rect x=\"314\" y=\"166\" width=\"180\" height=\"168\" fill=\"#163F46\"></rect>\n    <path d=\"M349 334V192h110v142\" fill=\"#07282F\"></path>\n    <path d=\"M366 334V207h73v127\" fill=\"#E4E8C9\"></path>\n    <path d=\"m366 334-83 166h259L439 334Z\" fill=\"#A9BDA3\" opacity=\".18\"></path>\n    <path d=\"M314 334 0 500M494 334l306 166M350 334 225 500M455 334l125 166M256 365h295M172 410h466M81 458h638\" stroke=\"#A0B0A2\" stroke-width=\"1\" opacity=\".25\"></path>\n    <path d=\"M0 0h800\" stroke=\"#EC3391\" stroke-width=\"9\"></path>\n    <circle cx=\"405\" cy=\"249\" r=\"5\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"1\" opacity=\".55\"></circle>\n    <path d=\"M35 465h55M35 451h19\" stroke=\"#9AE0D3\" stroke-width=\"3\"></path>\n  </svg>"}];
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