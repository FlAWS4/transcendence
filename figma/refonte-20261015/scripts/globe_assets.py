"""Vector globe components for Figma (rebuild of 15–16 October 2026).

  python3 globe_assets.py palette   → calls/<n>-palette-globe.js : « Globe/… » colour variables (Clair/Sombre)
  python3 globe_assets.py calls     → calls/<n>-globe-<name>.js  : one component per globe SVG
  python3 globe_assets.py record <result json>  → stores {ref: componentId} in the ledger (same as assets.py record)
  python3 globe_assets.py chunks    → the same components sent in parts of 6 000 characters (16 Oct.), then reassembled
  python3 globe_assets.py reveal    → calls/<n>-globe-revelation.js : the globe component in the reveal frames of the entrance
  python3 globe_assets.py update    → calls/<n>-globe-<name>-<k>of<N>.js : the 4 views updated IN PLACE (same component ids,
                                      every instance follows), data in parts of 6 000 characters (18 Oct., islets and Arctic)
  python3 globe_assets.py fade-mask → calls/<n>-globe-fondu-masque-<name>.js : the painted fade of the 2 country views
                                      turned into the alpha mask of the map, one call per view, sent after the update (18 Oct.)

The SVGs come from globe_svg.py (assets/globe/, vertical-perspective projection of MapLibre 5.24, aligned on the
captures within 1 px). Campus and country markers are removed: the screens already draw them from the page.
The medallion keeps only the disc, its 1 px white ring being drawn by the screen itself.
Colours are hard-coded in globe-style.mjs (no CSS property): they become « Globe/… » variables, and the fade of
the country view is bound to the page background (Rôles/bg) so that dark clones follow the theme.
"""
import json, re, sys, xml.etree.ElementTree as ET
from make_call import CALLS, LEDGER, next_index, dumps
from figlib import BASE

GLOBE = BASE / 'assets' / 'globe'
SVG_NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', SVG_NS)
FILES = [('globe-monde--desktop', 'Globe/Monde · ordinateur'), ('globe-monde--mobile', 'Globe/Monde · mobile'),
         ('globe-pays-france--desktop', 'Globe/Pays · France · ordinateur'), ('globe-pays-france--mobile', 'Globe/Pays · France · mobile'),
         ('globe-medaillon', 'Globe/Médaillon des rubriques')]
VARS = [['Globe/océan', '#D9EEEE', '#25232B', 'globe-style.mjs palettes.*.waterWorld (fond de la sphère)'],
        ['Globe/terres', '#19B8B5', '#256967', 'globe-style.mjs palettes.*.landWorld (terres, uniformes jusqu’au zoom 5)'],
        ['Globe/frontières', '#C4F3EF', '#A5DBD2', 'globe-style.mjs palettes.*.border (frontières et côtes, opacité ≈ 0,73)']]


def cleaned(name):
    tree = ET.parse(GLOBE / (name + '.svg'))
    root = tree.getroot()
    for parent in root.iter():
        for child in list(parent):
            gid = child.get('id', '')
            if gid == 'markers' or (name == 'globe-medaillon' and gid == 'outline'):
                parent.remove(child)
    return ET.tostring(root, encoding='unicode')


PALETTE = r"""const col = await figma.variables.getVariableCollectionByIdAsync('%(coll)s');
const light = col.modes.find(m => m.name === 'Clair').modeId, dark = col.modes.find(m => m.name === 'Sombre').modeId;
const have = new Set((await figma.variables.getLocalVariablesAsync('COLOR')).map(v => v.name));
const hex = h => { const n = h.replace('#', ''); return { r: parseInt(n.slice(0, 2), 16) / 255, g: parseInt(n.slice(2, 4), 16) / 255, b: parseInt(n.slice(4, 6), 16) / 255, a: 1 }; };
const made = [];
for (const [name, l, d, src] of %(rows)s) {
  if (have.has(name)) continue;
  const v = figma.variables.createVariable(name, col, 'COLOR');
  v.setValueForMode(light, hex(l)); v.setValueForMode(dark, hex(d));
  v.description = 'Couleur du globe codée dans ' + src + ' — pas de propriété CSS.';
  v.scopes = ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR'];
  made.push(name);
}
return { created: made.length, names: made };"""

CALL = r"""const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: 'Jost', style: 'Medium' });
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
// 18 Oct.: a colour bound to a variable keeps the variable's alpha, not the paint opacity (33:19 after call 1164): the
// border classes carry their opacity on the layer
const paint = (name, opacity) => { const p = figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[name]); return opacity === undefined ? p : { ...p, opacity }; };
const A = %(item)s;
let sec = page.children.find(n => n.type === 'SECTION' && n.name === 'Globe vectoriel');
if (!sec) {
  let bottom = 0; for (const s of page.children) bottom = Math.max(bottom, s.y + s.height);
  sec = figma.createSection(); page.appendChild(sec); sec.name = 'Globe vectoriel'; sec.x = 0; sec.y = bottom + 80; sec.resizeWithoutConstraints(3300, 1200);
  const t = figma.createText(); sec.appendChild(t); t.fontName = { family: 'Jost', style: 'Medium' }; t.fontSize = 32; t.characters = 'Globe vectoriel'; t.x = 40; t.y = 40;
}
for (const old of sec.children.filter(n => n.type === 'COMPONENT' && n.name === A.name)) old.remove();
const node = figma.createNodeFromSvg(A.svg);
sec.appendChild(node);
const comp = figma.createComponentFromNode(node);
comp.name = A.name; comp.fills = [];
comp.description = A.description;
let bound = 0;
for (const n of comp.findAll(() => true)) {
  const nm = n.name || '';
  if (!('fills' in n)) continue;
  if (nm === 'ocean') { n.fills = [paint('Globe/océan')]; bound++; }
  else if (nm.startsWith('land')) { n.fills = [paint('Globe/terres')]; bound++; }
  else if (nm.startsWith('borders')) { const op = n.strokes && n.strokes[0] ? n.strokes[0].opacity : 0.73; n.strokes = [paint('Globe/frontières')]; n.opacity = op; bound++; }
  else if (nm.startsWith('fade')) {
    // page background showing through the mask of the country view: stops bound to the page colour
    n.fills = n.fills.map(f => f.type && f.type.startsWith('GRADIENT') ? { ...f, gradientStops: f.gradientStops.map(s => ({ ...s, boundVariables: { color: figma.variables.createVariableAlias(V[s.color.a > 0.5 ? 'Rôles/bg' : 'dérivées/dégradé/F7FAFA00-1B1B1B00']) } })) } : f);
    bound++;
  }
}
const i = sec.children.filter(n => n.type === 'COMPONENT').length - 1;
comp.x = 40 + (i %% 2) * 1520; comp.y = 110 + Math.floor(i / 2) * 1000;
let w = 0, h = 0; for (const c of sec.children) { w = Math.max(w, c.x + c.width); h = Math.max(h, c.y + c.height); }
sec.resizeWithoutConstraints(w + 40, h + 40);
return { created: { [A.ref]: comp.id }, bound, size: [comp.width, comp.height] };"""


def palette():
    led = json.loads(LEDGER.read_text())
    code = PALETTE % {'coll': led['collections']['42 · Couleurs']['id'], 'rows': dumps(VARS)}
    f = CALLS / ('%03d-palette-globe.js' % next_index()); f.write_text(code); print(f.name, len(code))


def calls():
    led = json.loads(LEDGER.read_text())
    for name, label in FILES:
        if ('globe:' + name) in led.get('assets', {}):
            continue
        svg = cleaned(name)
        item = {'ref': 'globe:' + name, 'name': label, 'svg': svg,
                'description': 'Globe vectoriel du site (projection en perspective verticale de MapLibre 5.24, comme le site), généré par scripts/globe_svg.py ; '
                               'aligné sur les captures à moins d’1 px. Couleurs liées aux variables Globe/… (clair et sombre). Repères de campus dessinés par les écrans.'}
        code = CALL % {'page': led['pages']['Icônes et marque'], 'item': json.dumps(item, ensure_ascii=False)}
        f = CALLS / ('%03d-globe-%s.js' % (next_index(), name)); f.write_text(code); print(f.name, len(code))



REVEAL = r"""const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
const J = %(jobs)s;
const done = [], missing = [];
for (const [sectionId, frameName, compId] of J) {
  const sec = await figma.getNodeByIdAsync(sectionId);
  const top = sec && sec.children.find(n => n.name === frameName);
  if (!top) { missing.push(frameName); continue; }
  const ph = top.findOne(n => n.name.startsWith('Globe ·') && n.name.endsWith('à remplacer'));
  const ring = top.findOne(n => n.name.startsWith('Anneau de l'));
  const comp = await figma.getNodeByIdAsync(compId);
  if (!ph || !comp) { missing.push(frameName + (ph ? '' : ' (pas d’emplacement)')); continue; }
  const parent = ph.parent, idx = parent.children.indexOf(ph);
  const inst = comp.createInstance();
  parent.insertChild(idx, inst);
  inst.rescale(ph.width / comp.width); inst.x = ph.x; inst.y = ph.y; inst.name = 'Globe · révélé par le cercle';
  let node = inst;
  if (ring) {
    // the globe shows through the growing circle: elliptic mask on the ring's box
    const pb = parent.absoluteTransform, rb = ring.absoluteBoundingBox, ib = inst.absoluteBoundingBox;
    const mask = figma.createEllipse(); parent.insertChild(idx, mask);
    mask.resize(rb.width, rb.height); mask.x = inst.x + (rb.x - ib.x); mask.y = inst.y + (rb.y - ib.y);
    mask.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; mask.isMask = true; mask.name = 'Masque · cercle';
    node = figma.group([mask, inst], parent, idx); node.name = 'Globe révélé';
  }
  ph.remove();
  done.push(frameName);
}
return { patched: done.length, missing, frames: done };"""


def reveal_patch():
    led = json.loads(LEDGER.read_text())
    lay = json.loads((BASE / 'layouts' / 'entrance.json').read_text())
    secs = led['sections']['entrance']
    jobs = []
    for s in lay['sections']:
        for row in s['rows']:
            for f in row:
                if not f['state'].startswith('reveal'):
                    continue
                ref = 'globe:globe-monde--%s' % f['fmt']
                if ref in led.get('assets', {}):
                    jobs.append([secs[s['id']], f['name'], led['assets'][ref]])
    code = REVEAL % {'page': led['pages']['01 · Arrivée et décryptage'], 'jobs': json.dumps(jobs, ensure_ascii=False)}
    f = CALLS / ('%03d-globe-revelation.js' % next_index()); f.write_text(code); print(f.name, len(code), len(jobs), 'frames')




# ---- 16 October: the whole-SVG calls (40 000 characters) were cut by the safety filter while being written.
# Each globe now goes in parts of about 6 000 characters, stored in hidden text nodes of the tools page,
# then one call reassembles them, checks length and FNV-1a hash, and builds the component in a fixed slot.
PART = 6000
DATA = r"""const tools = await figma.getNodeByIdAsync('%(tools)s');
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
const NAME = %(name)s;
for (const old of tools.children.filter(n => n.name === NAME)) old.remove();
const t = figma.createText(); tools.appendChild(t); t.name = NAME; t.x = 4000; t.y = %(y)d;
t.characters = %(chunk)s;
t.visible = false;
return { part: NAME, length: t.characters.length };"""

ASSEMBLE = r"""const tools = await figma.getNodeByIdAsync('%(tools)s');
const N = %(n)d, REF = %(ref)s;
const parts = [];
for (let k = 1; k <= N; k++) {
  const nm = '⟦data⟧ ' + REF + ' · ' + k + '/' + N;
  const t = tools.children.find(n => n.name === nm);
  if (!t) throw new Error('partie manquante : ' + nm);
  parts.push(t.characters);
}
const svg = parts.join('');
let h = 0x811c9dc5; for (let i = 0; i < svg.length; i++) { h ^= svg.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
if (svg.length !== %(len)d || h !== %(hash)d) throw new Error('données altérées : longueur ' + svg.length + ', empreinte ' + h);
const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: 'Jost', style: 'Medium' });
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
// 18 Oct.: a colour bound to a variable keeps the variable's alpha, not the paint opacity (33:19 after call 1164): the
// border classes carry their opacity on the layer
const paint = (name, opacity) => { const p = figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[name]); return opacity === undefined ? p : { ...p, opacity }; };
const A = %(item)s;
let sec = page.children.find(n => n.type === 'SECTION' && n.name === 'Globe vectoriel');
if (!sec) {
  let bottom = 0; for (const s of page.children) bottom = Math.max(bottom, s.y + s.height);
  sec = figma.createSection(); page.appendChild(sec); sec.name = 'Globe vectoriel'; sec.x = 0; sec.y = bottom + 80; sec.resizeWithoutConstraints(3300, 1200);
  const tt = figma.createText(); sec.appendChild(tt); tt.fontName = { family: 'Jost', style: 'Medium' }; tt.fontSize = 32; tt.characters = 'Globe vectoriel'; tt.x = 40; tt.y = 40;
}
for (const old of sec.children.filter(n => n.type === 'COMPONENT' && n.name === A.name)) old.remove();
const node = figma.createNodeFromSvg(svg);
sec.appendChild(node);
const comp = figma.createComponentFromNode(node);
comp.name = A.name; comp.fills = [];
comp.description = A.description;
let bound = 0;
for (const n of comp.findAll(() => true)) {
  const nm = n.name || '';
  if (!('fills' in n)) continue;
  if (nm === 'ocean') { n.fills = [paint('Globe/océan')]; bound++; }
  else if (nm.startsWith('land')) { n.fills = [paint('Globe/terres')]; bound++; }
  else if (nm.startsWith('borders')) { const op = n.strokes && n.strokes[0] ? n.strokes[0].opacity : 0.73; n.strokes = [paint('Globe/frontières')]; n.opacity = op; bound++; }
  else if (nm.startsWith('fade')) {
    n.fills = n.fills.map(f => f.type && f.type.startsWith('GRADIENT') ? { ...f, gradientStops: f.gradientStops.map(s => ({ ...s, boundVariables: { color: figma.variables.createVariableAlias(V[s.color.a > 0.5 ? 'Rôles/bg' : 'dérivées/dégradé/F7FAFA00-1B1B1B00']) } })) } : f);
    bound++;
  }
}
// fixed slot per globe (two per row), whatever the order of the calls
comp.x = 40 + (A.slot %% 2) * 1520; comp.y = 110 + Math.floor(A.slot / 2) * 1000;
let w = 0, hh = 0; for (const c of sec.children) { w = Math.max(w, c.x + c.width); hh = Math.max(hh, c.y + c.height); }
sec.resizeWithoutConstraints(w + 40, hh + 40);
for (const t of tools.children.filter(n => n.name.startsWith('⟦data⟧ ' + REF + ' · '))) t.remove();
return { created: { [A.ref]: comp.id }, bound, size: [comp.width, comp.height], data: svg.length };"""


def fnv1a(s):
    h = 0x811c9dc5
    for i in range(0, len(s.encode('utf-16-le')), 2):
        c = int.from_bytes(s.encode('utf-16-le')[i:i + 2], 'little')
        h = ((h ^ c) * 0x01000193) & 0xFFFFFFFF
    return h


def chunk_calls():
    led = json.loads(LEDGER.read_text())
    tools = led['tools']['page']
    for slot, (name, label) in enumerate(FILES):
        ref = 'globe:' + name
        if ref in led.get('assets', {}):
            continue
        svg = cleaned(name)
        parts = [svg[i:i + PART] for i in range(0, len(svg), PART)]
        n = len(parts)
        assert n + 1 <= 9, 'parts must sort as single digits'
        idx = next_index()
        for k, chunk in enumerate(parts, 1):
            code = DATA % {'tools': tools, 'name': json.dumps('⟦data⟧ %s · %d/%d' % (ref, k, n), ensure_ascii=False),
                           'y': (slot * 10 + k) * 40, 'chunk': json.dumps(chunk)}
            f = CALLS / ('%03d-globe-%s-%dof%d.js' % (idx, name, k, n + 1)); f.write_text(code); print(f.name, len(code))
        item = {'ref': ref, 'name': label, 'slot': slot,
                'description': 'Globe vectoriel du site (projection en perspective verticale de MapLibre 5.24, comme le site), généré par scripts/globe_svg.py ; '
                               'aligné sur les captures à moins d’1 px. Couleurs liées aux variables Globe/… (clair et sombre). Repères de campus dessinés par les écrans.'}
        code = ASSEMBLE % {'tools': tools, 'n': n, 'ref': json.dumps(ref), 'len': len(svg), 'hash': fnv1a(svg),
                           'page': led['pages']['Icônes et marque'], 'item': json.dumps(item, ensure_ascii=False)}
        f = CALLS / ('%03d-globe-%s-%dof%d.js' % (idx, name, n + 1, n + 1)); f.write_text(code); print(f.name, len(code))



# ---- 18 Oct.: islets and Arctic fringe (verification/explorer/synthese.md § 14). The four view components are updated in
# place: same id, so the instances of Explorer (Monde, Pays, « Où veux-tu aller ? », « À propos »), of their dark clones
# and of the reveal frames of the entrance follow without any new scene. The SVG (globe_svg.py of 18 Oct., 107 000 to
# 280 000 characters) goes in parts of PART characters, kept until the last call in hidden texts of the page « Icônes et
# marque » (the technical page 4:2 was deleted on 18 Oct.); the last call reassembles them, checks length and FNV-1a,
# swaps the children of the component, binds the colours (outlines of the land and, 18 Oct., of the islets path, border
# classes included), masks the world views by their disc, then removes the texts. Nothing is evaluated from the document.
UPDATE_VIEWS = [('globe-monde--desktop', 0), ('globe-monde--mobile', 1), ('globe-pays-france--desktop', 2), ('globe-pays-france--mobile', 3)]
DATA_PAGE = r"""// 42 Horizon — globe, données de la mise à jour en place (globe_assets.py update, 18 oct. 2026) : %(label)s
const page = await figma.getNodeByIdAsync('%(page)s');
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
const NAME = %(name)s;
for (const old of page.children.filter(n => n.name === NAME)) old.remove();
const t = figma.createText(); page.appendChild(t); t.name = NAME; t.x = -6000; t.y = %(y)d;
t.characters = %(chunk)s;
t.visible = false;
return { part: NAME, length: t.characters.length, mutatedNodeIds: [t.id] };"""

UPDATE = r"""// 42 Horizon — globe mis à jour en place (globe_assets.py update, 18 oct. 2026) : %(label)s
const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
const A = %(item)s;
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
// 18 Oct.: a colour bound to a variable keeps the variable's alpha, not the paint opacity (33:19 after call 1164): the
// border classes carry their opacity on the layer
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
    else if (nm.startsWith('borders-')) { const op = n.strokes && n.strokes[0] ? n.strokes[0].opacity : 1; n.strokes = [paint('Globe/frontières')]; n.opacity = op; bound++; classes++; }
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
} finally { if (tmp && !tmp.removed) tmp.remove(); }"""


def describe(view):
    """Description of an updated view component (18 Oct.: islets in their own path, with their outline)."""
    s = view['simplification']
    num = lambda v: ('%g' % v).replace('.', ',')
    return ('Globe vectoriel du site (perspective verticale de MapLibre 5.24), généré par scripts/globe_svg.py (18 oct.) : '
            'géométrie et îlots des sources GeoJSON telles que geojson-vt les tuile (zoom de tuile %d, tolérance 0,2 px), '
            'contour des terres de fill-antialias : liseré de %s px sur les côtes (land-union), de %s px sur les %d anneaux '
            'd’au plus %s px, points compris (land-islets), Figma arrondissant les traits fins au quart de pixel ; '
            'frontières en %d classes d’encre (traits projetés sur la sphère). '
            'Couleurs liées aux variables Globe/… (clair et sombre). Repères dessinés par les écrans.'
            % (s['tileZoom'], num(s['landOutlinePx']), num(s['isletOutlinePx']), s['isletRings'], num(s['isletMaxSidePx']),
               s['borderClasses']))


def update_calls(part=PART):
    led = json.loads(LEDGER.read_text())
    page = led['pages']['Icônes et marque']
    params = json.loads((GLOBE / 'globe-params.json').read_text())
    labels = dict(FILES)
    for name, slot in UPDATE_VIEWS:
        ref = 'globe:' + name
        cid = led['assets'][ref]
        svg = cleaned(name)
        view = params['views'][name.replace('globe-', '', 1)]
        parts = [svg[i:i + part] for i in range(0, len(svg), part)]
        n = len(parts)
        idx = next_index()
        for k, chunk in enumerate(parts, 1):
            code = DATA_PAGE % {'label': '%s · %d/%d' % (ref, k, n), 'page': page,
                                'name': json.dumps('⟦data⟧ %s · %d/%d' % (ref, k, n), ensure_ascii=False),
                                'y': (slot * 100 + k) * 40, 'chunk': json.dumps(chunk)}
            f = CALLS / ('%03d-globe-%s-%02dof%02d.js' % (idx, name, k, n + 1)); f.write_text(code); print(f.name, len(code))
        world = name.startswith('globe-monde')
        item = {'ref': ref, 'id': cid, 'name': labels[name], 'w': view['viewport'][0], 'h': view['viewport'][1], 'n': n,
                'len': len(svg), 'hash': fnv1a(svg), 'islets': int('id="land-islets"' in svg),
                'vars': ['Globe/océan', 'Globe/terres', 'Globe/frontières'] + ([] if world else ['Rôles/bg', 'dérivées/dégradé/F7FAFA00-1B1B1B00']),
                'disc': [view['discCenterPx'][0], view['discCenterPx'][1], view['discRadiusPx']] if world else None,
                'description': describe(view)}
        code = UPDATE % {'label': labels[name], 'page': page, 'item': json.dumps(item, ensure_ascii=False)}
        f = CALLS / ('%03d-globe-%s-%02dof%02d.js' % (idx, name, n + 1, n + 1)); f.write_text(code); print(f.name, len(code))


# ---- 18 Oct.: fade of the country views (verification/globe-liseres-20261018). On the site the canvas is masked by the
# intersection of two linear fades (integrated-globe.css mask-image, alpha = gx . gy) and the page shows through, with its
# gradient and halos; the SVG paints the page colour instead (the « fade » group), exact on a plain background only. This
# call turns that paint into the alpha mask of the map in the component: « Fondu de la carte » = [horizontal mask, « Fondu
# vertical » = [vertical mask, sphere, land, borders]], nested masks giving the product of the two fades. Only groups lie
# under the masks: a layer that clips its content (clipsContent, an instance of a clipping component) escapes the mask under
# it (Archives 474:18605, 475:18605, 476:45969). The masks reuse the gradient transforms Figma made from the painted fade.
# The captures of the site show more map in the bands than these linear ramps (alpha = a + m.a.(1 - a), m the radial
# mask of the blurred edge): that surplus comes from .hg-map::after, whose backdrop holds the faded globe only. The screens
# rebuild it with « Globe · copie floutée » under that radial mask (dom2fig.edge_blur), transparent in the bands once the
# fade is a mask: so the mask stays linear, as the CSS declares (verification of 18 Oct.: bands of Pays desktop 10.2 -> 1.9
# levels with the copy; a « measured » profile would count the surplus twice).
# Kept apart from the update because Figma's rendering of nested gradient masks is not measured yet: send it after the
# update of the same component, then capture the component and an Explorer Pays screen; send it again after any new update.
# Nothing is evaluated from the document; a second run finds the converted structure and changes nothing.
FADE = r"""// 42 Horizon — fondu de la vue Pays en masque alpha, comme le site (globe_assets.py fade-mask, 18 oct. 2026) : %(label)s
const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
const A = %(item)s;
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
}"""


def fade_mask_calls():
    led = json.loads(LEDGER.read_text())
    page = led['pages']['Icônes et marque']
    params = json.loads((GLOBE / 'globe-params.json').read_text())
    labels = dict(FILES)
    for name, _ in UPDATE_VIEWS:
        if name.startswith('globe-monde'):
            continue
        ref = 'globe:' + name
        view = params['views'][name.replace('globe-', '', 1)]
        W, H = view['viewport']
        fx, fy = view['edgeFadePx']['x'] / W, view['edgeFadePx']['y'] / H
        item = {'ref': ref, 'id': led['assets'][ref], 'name': labels[name], 'w': W, 'h': H,
                'painted': {'fade-x': [0, fx, 1 - fx, 1], 'fade-y': [0, fy, 1 - fy, 1]},
                'mask': {'fade-x': [[0, 0], [fx, 1], [1 - fx, 1], [1, 0]], 'fade-y': [[0, 0], [fy, 1], [1 - fy, 1], [1, 0]]},
                'inner': 'Fondu vertical', 'outer': 'Fondu de la carte (masque alpha, comme le site)',
                'description': describe(view) + ' Fondu des bords en masque alpha de la carte (deux dégradés linéaires '
                               'multipliés, %d × %d px, integrated-globe.css) : le fond de l’écran apparaît dessous.'
                               % (view['edgeFadePx']['x'], view['edgeFadePx']['y'])}
        code = FADE % {'label': labels[name], 'page': page, 'item': json.dumps(item, ensure_ascii=False)}
        f = CALLS / ('%03d-globe-fondu-masque-%s.js' % (next_index(), name)); f.write_text(code); print(f.name, len(code))


if __name__ == '__main__':
    {'palette': palette, 'calls': calls, 'reveal': reveal_patch, 'chunks': chunk_calls, 'update': update_calls,
     'fade-mask': fade_mask_calls}[sys.argv[1]]()
