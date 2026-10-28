// 42 Horizon — globe mis à jour en place (globe_assets.py update, 18 oct. 2026) : Globe/Monde · ordinateur
const page = await figma.getNodeByIdAsync('1:5');
await figma.setCurrentPageAsync(page);
const A = {"ref": "globe:globe-monde--desktop", "id": "33:19", "name": "Globe/Monde · ordinateur", "w": 1440, "h": 960, "n": 47, "len": 279994, "hash": 3171027272, "islets": 1, "vars": ["Globe/océan", "Globe/terres", "Globe/frontières"], "disc": [720.0, 480.0, 267.012], "description": "Globe vectoriel du site (perspective verticale de MapLibre 5.24), généré par scripts/globe_svg.py (18 oct.) : géométrie et îlots des sources GeoJSON telles que geojson-vt les tuile (zoom de tuile 1, tolérance 0,2 px), contour des terres de fill-antialias : liseré de 0,3 px sur les côtes (land-union), de 0,5 px sur les 862 anneaux d’au plus 1 px, points compris (land-islets), Figma arrondissant les traits fins au quart de pixel ; frontières en 9 classes d’encre (traits projetés sur la sphère). Couleurs liées aux variables Globe/… (clair et sombre). Repères dessinés par les écrans."};
const parts = [];
for (let k = 1; k <= A.n; k++) {
  const nm = '⟦data⟧ ' + A.ref + ' · ' + k + '/' + A.n;
  const t = page.children.find(n => n.name === nm);
  if (!t) throw new Error('partie manquante : ' + nm);
  parts.push(t.characters);
}
const svg = parts.join('');
let h = 0x811c9dc5; for (let i = 0; i < svg.length; i++) { h ^= svg.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
if (svg.length !== A.len || h !== A.hash) throw new Error('données altérées : longueur ' + svg.length + ', empreinte ' + h);
const comp = await figma.getNodeByIdAsync(A.id);
if (!comp || comp.type !== 'COMPONENT' || comp.name !== A.name) throw new Error('composant inattendu : ' + A.id);
if (Math.abs(comp.width - A.w) > 0.5 || Math.abs(comp.height - A.h) > 0.5) throw new Error('taille inattendue ' + comp.width + ' × ' + comp.height);
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync('COLOR')) V[v.name] = v;
for (const nm of A.vars) if (!V[nm]) throw new Error('variable manquante : ' + nm);
const paint = (name, opacity) => { const p = figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[name]); return opacity === undefined ? p : { ...p, opacity }; };
let tmp = figma.createNodeFromSvg(svg), added = [];
try {
  if (Math.abs(tmp.width - A.w) > 0.01 || Math.abs(tmp.height - A.h) > 0.01) throw new Error('SVG importé à ' + tmp.width + ' × ' + tmp.height);
  const old = [...comp.children];
  added = [...tmp.children];
  for (const c of added) comp.appendChild(c);
  let bound = 0, classes = 0, islets = 0;
  const widths = {};
  for (const n of added.flatMap(c => [c, ...('findAll' in c ? c.findAll(() => true) : [])])) {
    const nm = n.name || '';
    if (!('fills' in n)) continue;
    if (nm === 'ocean') { n.fills = [paint('Globe/océan')]; bound++; }
    else if (nm === 'land-union' || nm === 'land-islets') {
      // 18 Oct.: the islets have their own path, same colour, wider outline (globe_svg.py ISLET_OUTLINE)
      n.fills = [paint('Globe/terres')]; n.strokes = [paint('Globe/terres')]; bound++; islets += nm === 'land-islets'; widths[nm] = n.strokeWeight;
    }
    else if (nm.startsWith('borders-')) { const op = n.strokes && n.strokes[0] ? n.strokes[0].opacity : 1; n.strokes = [paint('Globe/frontières', op)]; bound++; classes++; }
    else if (nm.startsWith('fade')) {
      n.fills = n.fills.map(f => f.type && f.type.startsWith('GRADIENT') ? { ...f, gradientStops: f.gradientStops.map(s => ({ ...s, boundVariables: { color: figma.variables.createVariableAlias(V[s.color.a > 0.5 ? 'Rôles/bg' : 'dérivées/dégradé/F7FAFA00-1B1B1B00']) } })) } : f);
      bound++;
    }
  }
  if (islets !== A.islets) throw new Error('chemin des îlots : ' + islets + ' au lieu de ' + A.islets);
  if (A.disc) {
    // MapLibre draws nothing beyond the sphere: the outline of the land and the strokes stop at the disc
    const land = added.find(n => n.name === 'land'), borders = added.find(n => n.name === 'borders');
    const e = figma.createEllipse(); comp.insertChild(comp.children.indexOf(land), e);
    e.resize(2 * A.disc[2], 2 * A.disc[2]); e.x = A.disc[0] - A.disc[2]; e.y = A.disc[1] - A.disc[2];
    e.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; e.name = 'Masque · disque'; e.isMask = true;
    const g = figma.group([e, land, borders].filter(Boolean), comp, comp.children.indexOf(e)); g.name = 'Disque';
  } else comp.clipsContent = true;
  for (const o of old) o.remove();
  added = [];
  tmp.remove(); tmp = null;
  comp.description = A.description;
  for (const t of page.children.filter(n => n.name.startsWith('⟦data⟧ ' + A.ref + ' · '))) t.remove();
  return { updated: { [A.ref]: comp.id }, bound, classes, islets, widths, children: comp.children.length, size: [comp.width, comp.height], data: svg.length, mutatedNodeIds: [comp.id] };
} catch (e) {
  for (const c of added) if (!c.removed) c.remove();
  throw e;
} finally { if (tmp && !tmp.removed) tmp.remove(); }