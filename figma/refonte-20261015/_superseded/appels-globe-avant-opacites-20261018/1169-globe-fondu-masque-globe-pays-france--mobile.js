// 42 Horizon — fondu de la vue Pays en masque alpha, comme le site (globe_assets.py fade-mask, 18 oct. 2026) : Globe/Pays · France · mobile
const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const A = {"ref": "globe:globe-pays-france--mobile", "id": "45:32", "name": "Globe/Pays · France · mobile", "w": 390, "h": 844, "painted": {"fade-x": [0, 0.14102564102564102, 0.858974358974359, 1], "fade-y": [0, 0.17772511848341233, 0.8222748815165877, 1]}, "mask": {"fade-x": [[0, 0], [0.14102564102564102, 1], [0.858974358974359, 1], [1, 0]], "fade-y": [[0, 0], [0.17772511848341233, 1], [0.8222748815165877, 1], [1, 0]]}, "inner": "Fondu vertical", "outer": "Fondu de la carte (masque alpha, comme le site)", "description": "Globe vectoriel du site (perspective verticale de MapLibre 5.24), généré par scripts/globe_svg.py (18 oct.) : géométrie et îlots des sources GeoJSON telles que geojson-vt les tuile (zoom de tuile 3, tolérance 0,2 px), contour des terres de fill-antialias : liseré de 0,1 px sur les côtes (land-union), de 0,3 px sur les 38 anneaux d’au plus 1 px, points compris (land-islets), Figma arrondissant les traits fins au quart de pixel ; frontières en 5 classes d’encre (traits projetés sur la sphère). Couleurs liées aux variables Globe/… (clair et sombre). Repères dessinés par les écrans. Fondu des bords en masque alpha de la carte (deux dégradés linéaires multipliés, 55 × 150 px, integrated-globe.css) : le fond de l’écran apparaît dessous."};
const comp = await figma.getNodeByIdAsync(A.id);
if (!comp || comp.type !== 'COMPONENT' || comp.name !== A.name) throw new Error('composant inattendu : ' + A.id);
if (Math.abs(comp.width - A.w) > 0.5 || Math.abs(comp.height - A.h) > 0.5) throw new Error('taille inattendue ' + comp.width + ' × ' + comp.height);
const names = comp.children.map(n => n.name);
if (names.length === 1 && names[0] === A.outer) return { already: true, children: names, mutatedNodeIds: [] };
if (names.join('|') !== 'sphere|land|borders|fade') throw new Error('structure inattendue : ' + names.join(', '));
const content = comp.children.slice(0, 3), fade = comp.children[3];
if (fade.type !== 'GROUP' || content.some(n => n.type !== 'GROUP')) throw new Error('groupes attendus : ' + comp.children.map(n => n.type).join(', '));
const src = {};
for (const nm of ['fade-x', 'fade-y']) {
  const r = fade.children.find(n => n.name === nm);
  const g = r && r.fills.length === 1 && r.fills[0].type === 'GRADIENT_LINEAR' ? r.fills[0] : null;
  if (!g || Math.abs(r.x) > 0.01 || Math.abs(r.y) > 0.01 || Math.abs(r.width - A.w) > 0.01 || Math.abs(r.height - A.h) > 0.01) throw new Error('fondu peint inattendu : ' + nm);
  const pos = g.gradientStops.map(s => s.position), want = A.painted[nm];
  if (pos.length !== want.length || pos.some((p, i) => Math.abs(p - want[i]) > 2e-3)) throw new Error('arrêts inattendus ' + nm + ' : ' + pos.join(' '));
  src[nm] = g.gradientTransform;
}
const made = [];
try {
  const mask = (nm, label, above) => {
    const r = figma.createRectangle(); made.push(r);
    comp.insertChild(comp.children.indexOf(above), r);
    r.resize(A.w, A.h); r.x = 0; r.y = 0; r.name = label;
    // only the alpha of a mask counts: 0 at the edges, 1 inside, as the site's mask-image
    r.fills = [{ type: 'GRADIENT_LINEAR', gradientTransform: src[nm], gradientStops: A.mask[nm].map(([position, a]) => ({ position, color: { r: 0, g: 0, b: 0, a } })) }];
    r.isMask = true; if ('maskType' in r) r.maskType = 'ALPHA';
    return r;
  };
  const my = mask('fade-y', 'Masque · fondu vertical', content[0]);
  const inner = figma.group([my, ...content], comp, comp.children.indexOf(my)); made.push(inner); inner.name = A.inner;
  const mx = mask('fade-x', 'Masque · fondu horizontal', inner);
  const outer = figma.group([mx, inner], comp, comp.children.indexOf(mx)); made.push(outer); outer.name = A.outer;
  comp.description = A.description;
  fade.remove();
  return { converted: { [A.ref]: comp.id }, children: comp.children.map(n => n.name), outer: outer.children.map(n => n.name),
           inner: inner.children.map(n => n.name), masks: [mx.isMask, my.isMask], mutatedNodeIds: [comp.id] };
} catch (e) {
  // back to the painted fade: the map groups in place, the new layers removed
  for (const n of content) if (!n.removed && n.parent !== comp) comp.insertChild(comp.children.indexOf(fade), n);
  for (const n of made.reverse()) if (!n.removed) n.remove();
  throw e;
}