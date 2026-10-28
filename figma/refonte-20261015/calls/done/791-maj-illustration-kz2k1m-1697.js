// 42 Horizon — mise à jour en place des ressources (assets.py update, 17 oct. 2026) : Illustration/Une porte vers la troisième dimension, Illustration/Derrière une ligne de commande, Illustration/Montrer ce qui n’est pas encore fini, Illustration/Un jardin de petites idées, Illustration/ft_transcendence, Illustration/Derrière une ligne de commande (kz2k1m-1697)
const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const U = [{"ref": "kz2k1m-1697", "id": "5:42", "prefix": "Illustration/", "w": 800.0, "h": 500.0, "svg": "<svg width=\"800\" height=\"500\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 800 500\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"none\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n    <rect width=\"800\" height=\"500\" fill=\"#F5E4EA\"></rect>\n    <circle cx=\"411\" cy=\"241\" r=\"167\" fill=\"none\" stroke=\"#DDAFC3\" stroke-width=\"1\"></circle>\n    <circle cx=\"411\" cy=\"241\" r=\"235\" fill=\"none\" stroke=\"#E7C6D3\" stroke-width=\"1\"></circle>\n    <path d=\"M157 154 411 241 653 129M411 241l192 161M411 241 154 397M411 241l51-158\" stroke=\"#AD839B\" stroke-width=\"2\" fill=\"none\"></path>\n    <path d=\"M157 154 411 241 603 402\" stroke=\"#EC3391\" stroke-width=\"3\" stroke-dasharray=\"6 11\" fill=\"none\"></path>\n    <rect x=\"346\" y=\"176\" width=\"130\" height=\"130\" rx=\"34\" fill=\"#242F38\"></rect>\n    <path d=\"m382 229 14 13-14 13M409 255h26\" stroke=\"#F5E4EA\" stroke-width=\"5\" fill=\"none\"></path>\n    <circle cx=\"157\" cy=\"154\" r=\"39\" fill=\"#FFFFFF\"></circle>\n    <path d=\"M141 144h32v23h-18l-11 7v-7h-3Z\" fill=\"#00BABC\"></path>\n    <circle cx=\"653\" cy=\"129\" r=\"29\" fill=\"#FFFFFF\"></circle>\n    <rect x=\"642\" y=\"121\" width=\"22\" height=\"16\" rx=\"5\" fill=\"#D479A3\"></rect>\n    <circle cx=\"603\" cy=\"402\" r=\"46\" fill=\"#EC3391\"></circle>\n    <path d=\"M584 390h37v25h-20l-13 7v-7h-4Z\" fill=\"#FFFFFF\"></path>\n    <circle cx=\"154\" cy=\"397\" r=\"26\" fill=\"#FFFFFF\"></circle>\n    <circle cx=\"154\" cy=\"397\" r=\"8\" fill=\"#87B8B3\"></circle>\n    <circle cx=\"462\" cy=\"83\" r=\"17\" fill=\"#00BABC\"></circle>\n    <circle cx=\"280\" cy=\"196\" r=\"6\" fill=\"#EC3391\"></circle>\n    <circle cx=\"555\" cy=\"173\" r=\"5\" fill=\"#7D8D94\"></circle>\n    <circle cx=\"510\" cy=\"324\" r=\"6\" fill=\"#EC3391\"></circle>\n    <path d=\"M72 72h24M84 60v24M712 346h18M721 337v18\" stroke=\"#C38CA6\" stroke-width=\"2\"></path>\n  </svg>"}];
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