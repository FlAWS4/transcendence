// 42 Horizon — mise à jour en place des ressources (assets.py update, 17 oct. 2026) : Illustration/Une porte vers la troisième dimension, Illustration/Derrière une ligne de commande, Illustration/Montrer ce qui n’est pas encore fini, Illustration/Un jardin de petites idées, Illustration/ft_transcendence, Illustration/Derrière une ligne de commande (1jtwtz9-1629)
const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const U = [{"ref": "1jtwtz9-1629", "id": "171:31", "prefix": "Illustration/", "w": 800.0, "h": 500.0, "svg": "<svg width=\"800\" height=\"500\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 800 500\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"none\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n    <rect width=\"800\" height=\"500\" fill=\"#203F42\"></rect>\n    <path d=\"M0 440 800 90v410H0Z\" fill=\"#294F4F\"></path>\n    <rect x=\"130\" y=\"70\" width=\"263\" height=\"357\" rx=\"3\" fill=\"#102E33\" opacity=\".3\" transform=\"rotate(-8 260 250)\"></rect>\n    <g transform=\"rotate(-8 260 250)\">\n      <rect x=\"116\" y=\"56\" width=\"263\" height=\"357\" rx=\"3\" fill=\"#F1EFDF\"></rect>\n      <path d=\"M150 105h195M150 116h120\" stroke=\"#87A299\" stroke-width=\"3\"></path>\n      <path d=\"m178.73 190.51q0-10.87 6.29-18.32 6.28-7.46 18.29-11.08v6.28q-14.18 4.51-14.18 13.54 0 1.69 1.2 2.86 1.21 1.17 4.27 2.78 5.4 2.82 5.4 8.05 0 4.35-2.74 6.61-2.74 2.26-6.93 2.26-5.15 0-8.37-3.67-3.23-3.67-3.23-9.31zm-33.83 0q0-10.87 6.28-18.32 6.28-7.46 18.29-11.08v6.28q-14.18 4.51-14.18 13.54 0 1.69 1.21 2.86 1.21 1.17 4.27 2.78 5.4 2.82 5.4 8.05 0 4.35-2.74 6.61-2.74 2.26-6.93 2.26-5.16 0-8.38-3.67-3.22-3.67-3.22-9.31z\" fill=\"#EC3391\" fill-rule=\"nonzero\"/>\n      <rect x=\"152\" y=\"284\" width=\"172\" height=\"5\" fill=\"#647C70\"></rect>\n      <rect x=\"152\" y=\"303\" width=\"149\" height=\"5\" fill=\"#647C70\"></rect>\n      <rect x=\"152\" y=\"322\" width=\"165\" height=\"5\" fill=\"#647C70\"></rect>\n      <rect x=\"152\" y=\"364\" width=\"57\" height=\"5\" fill=\"#A2B0A0\"></rect>\n    </g>\n    <g transform=\"rotate(9 526 268)\">\n      <rect x=\"413\" y=\"133\" width=\"232\" height=\"288\" rx=\"3\" fill=\"#00BABC\"></rect>\n      <path d=\"m470.74 222.54q-2.57 1.71-5.46 2.58-2.88.87-5.86.87-7.65 0-12.4-4.48-4.76-4.47-4.76-11.62 0-4.95 2.41-9.02 2.41-4.07 7.16-7.08-1.7-2.66-2.52-4.94-.82-2.27-.82-4.32 0-5.54 3.72-8.51 3.73-2.97 10.77-2.97 2.49 0 4.89.37 2.39.38 4.71 1.1v8.75q-2.19-1.23-4.42-1.87-2.24-.63-4.46-.63-2.74 0-4.14.96-1.4.96-1.4 2.8 0 1.23 1.04 3.39 1.04 2.15 3.37 5.63l10.7 16.41q.71-1.3 1.09-2.97.38-1.68.38-3.63 0-1.02-.07-2-.07-.97-.21-1.82h8.03v1.74q0 4.96-1.16 8.66-1.16 3.71-3.66 6.65l5.54 8.41h-10.83zm-14.7-22.53q-2.26 1.47-3.4 3.51-1.15 2.03-1.15 4.53 0 4.17 2.69 7.02 2.68 2.85 6.58 2.85.95 0 1.96-.22 1.01-.22 1.97-.63.06-.03.27-.14.99-.47 1.61-.89z\" fill=\"#133D3E\" fill-rule=\"nonzero\"/>\n      <path d=\"M445 262h161M445 277h139M445 292h161M445 307h113\" stroke=\"#165F5D\" stroke-width=\"4\"></path>\n      <circle cx=\"575\" cy=\"369\" r=\"22\" fill=\"#F3E6D8\"></circle>\n      <path d=\"m566 369 7 7 12-13\" fill=\"none\" stroke=\"#256C62\" stroke-width=\"3\"></path>\n    </g>\n    <path d=\"M681 86h35M698 69v35\" stroke=\"#76A69D\" stroke-width=\"2\"></path>\n    <circle cx=\"77\" cy=\"395\" r=\"8\" fill=\"#EC3391\"></circle>\n  </svg>"}];
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