"""Asset components for the Figma rebuild (15 October 2026): inline UI icons, illustrations, portraits, SVG images.

Collects every SVG used by the converted scenes (../scenes/*.svgs.json): inline <svg> elements and <img> pointing
to .svg files of the prototype. Each distinct asset becomes one Figma component on the « Icônes et marque » page;
scenes then place instances (render.js, X.assets). Already created assets are listed in ../figma-ledger.json and
skipped.

Usage: python3 assets.py plan            → ../assets-plan.json (what is new, with names)
       python3 assets.py call <n> [max]  → prints the use_figma code creating batch n (max chars ~45000)
       python3 assets.py record <json>   → stores the returned {ref: componentId} map in the ledger
       python3 assets.py update          → ../assets-update/: calls updating in place the existing components whose
                                           normalised SVG changed (17 Oct.: inherited strokes, outlined texts)
"""
import collections, gzip, hashlib, html, json, re, sys
from figlib import BASE, SITE, slug, parse_color, hex_of
from svg_text_outlines import outline_texts

LEDGER = BASE / 'figma-ledger.json'
PLAN = BASE / 'assets-plan.json'
UPDATE = BASE / 'assets-update'

# 17 Oct.: paint the page stylesheet gives every inline <svg> (welcome.css, line 3: svg {fill: none; stroke: currentColor;
# stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round}); the cards only take the stroke off
# (content-preview.css: .cp-art > svg {stroke: none}). Shapes and texts without attributes of their own inherit these
# values. Caps and joins are not in the dumps: checked in Chrome (computed style of the <text> of the cards, of the
# detail pages and of the viewer: round / round).
PAGE_SVG_CAPS = (('stroke-linecap', 'round'), ('stroke-linejoin', 'round'))


def ledger():
    return json.loads(LEDGER.read_text())


def normalise_inline(svg, w, h, stroke, fill, sw):
    """Inline icon: give the root its CSS-computed stroke/fill so Figma imports what the browser paints."""
    m = re.match(r'<svg\b([^>]*)>', svg)
    if not m:
        return svg
    attrs = m.group(1)
    attrs = re.sub(r'\s(width|height|aria-hidden|class|focusable|role)="[^"]*"', '', attrs)
    if 'xmlns=' not in attrs:
        attrs += ' xmlns="http://www.w3.org/2000/svg"'
    vb = re.search(r'viewBox="([^"]+)"', attrs)
    vw, vh = (float(x) for x in vb.group(1).split()[2:4]) if vb else (w, h)
    paint = ''
    if 'stroke=' not in attrs:
        paint += ' stroke="%s"' % ('#1B1B1B' if stroke else 'none')
        if stroke:
            paint += ' stroke-width="%s" stroke-linecap="round" stroke-linejoin="round"' % (str(sw or '1.6').replace('px', ''))
    if 'fill=' not in attrs:
        paint += ' fill="%s"' % ('#1B1B1B' if fill else 'none')
    return '<svg width="%g" height="%g"%s%s>' % (vw, vh, attrs, paint) + svg[m.end():]


def normalise_illustration(svg, stroke=None, width='1.6', text=None):
    """17 Oct.: inline illustration with the paint its root gets from the page (fill none, the captured stroke or none,
    its width, round caps and joins), so that shapes and texts without attributes of their own inherit in Figma what
    they inherit in Chrome; their own attributes are untouched. Texts in a generic family become outlines of the font
    Chrome used (svg_text_outlines.py); `text` = values the texts inherit from the page (font-weight, direction…).
    Until 17 Oct. the raw markup was imported: no stroke at all, butt caps, Figma's fallback fonts. → (svg, reports)"""
    m = re.match(r'<svg\b([^>]*)>', svg)
    attrs = re.sub(r'\s(width|height|aria-hidden|class|focusable|role)="[^"]*"', '', m.group(1))
    if 'xmlns=' not in attrs:
        attrs += ' xmlns="http://www.w3.org/2000/svg"'
    vw, vh = (float(x) for x in re.search(r'viewBox="([^"]+)"', attrs).group(1).replace(',', ' ').split()[2:4])
    paint = ''
    for k, v in (('fill', 'none'), ('stroke', stroke or 'none'), ('stroke-width', width)) + PAGE_SVG_CAPS:
        if not re.search(r'\s%s=' % k, attrs):
            paint += ' %s="%s"' % (k, v)
    return outline_texts('<svg width="%g" height="%g"%s%s>' % (vw, vh, attrs, paint) + svg[m.end():], text)


def colour_variable(kind, lh, dh):
    """Variable holding the pair (light, dark): same lookup as dom2fig.cref/any_kind (palette.json « map », CSS-named
    variables before derived ones), repeated here so that this script does not import dom2fig.py (17 Oct.)."""
    pal = json.loads((BASE / 'palette.json').read_text())
    name = pal['map'].get('%s|%s|%s' % (kind, lh, dh))
    if name:
        return name
    best = None
    for key, other in pal['map'].items():
        _k, l, d = key.split('|')
        if (l, d) == (lh, dh) and (best is None or (best.startswith('dérivées/') and not other.startswith('dérivées/'))):
            best = other
    return best


def browser_contexts(refs):
    """17 Oct.: every capture of these inline SVGs (dom/*/*.json.gz, light and dark): computed stroke, width, font and
    direction of the root, width inherited by its shapes without a stroke (svgKids)."""
    refs, out = set(refs), collections.defaultdict(list)
    for f in sorted((BASE / 'dom').glob('*/*.json.gz')):
        d = json.loads(gzip.decompress(f.read_bytes()))
        for n in d.get('nodes', []):
            if n.get('tag') != 'svg' or n.get('svgRef') not in refs:
                continue
            s = n.get('s') or {}
            kids = sorted({k['sw'] for k in n.get('svgKids') or [] if k.get('stroke') in (None, 'none') and k.get('sw')})
            out[n['svgRef']].append({'dump': '%s/%s' % (f.parent.name, f.name[:-len('.json.gz')]), 'key': n.get('k'),
                                     'theme': d.get('theme'), 'stroke': s.get('stroke'), 'sw': s.get('strokeWidth'),
                                     'font': s.get('font') or '', 'dir': s.get('dir') or 'ltr', 'kidsSW': kids})
    return out


def illustration_paint(ctxs):
    """17 Oct.: stroke Chrome gives the shapes of an illustration that have none of their own, over all its captures →
    {'stroke': None or light hex, 'dark', 'var' (light/dark pair, palette.json), 'width', 'text', 'mixed'}.
    The same svgRef drawn with and without that stroke (cards: .cp-art > svg {stroke: none}; headers of the detail pages
    and viewer: stroke currentColor) is not settled here: the component keeps the cards' drawing and 'mixed' lists the
    captures drawn with the stroke, for a decision."""
    width = collections.Counter(w.replace('px', '') for c in ctxs for w in ([c['sw']] if c['sw'] else c['kidsSW']))
    fonts = collections.Counter(tuple(c['font'].split(' ')[:2]) for c in ctxs if c['font'])
    style, weight = fonts.most_common(1)[0][0] if fonts else ('normal', '400')
    dec = {'width': width.most_common(1)[0][0] if width else '1.6', 'widths': sorted(width), 'captures': len(ctxs),
           'text': {'font-style': style, 'font-weight': weight, 'direction': 'ltr'}, 'fonts': sorted(' '.join(k) for k in fonts),
           'directions': dict(collections.Counter(c['dir'] for c in ctxs)), 'stroke': None}
    stroked = [c for c in ctxs if c['stroke'] not in (None, 'none')]
    plain = [c for c in ctxs if c['stroke'] in (None, 'none')]
    if stroked and plain:
        dec['mixed'] = {'stroked': sorted({c['dump'] for c in stroked}), 'plainCaptures': len(plain),
                        'strokedColours': dict(collections.Counter('%s %s' % (c['theme'], hex_of(parse_color(c['stroke']))) for c in stroked))}
        return dec
    if not stroked:
        return dec
    # pair each light capture with the dark capture of the same state and element
    dark = {(c['dump'].rsplit('-', 1)[0], c['key']): c for c in stroked if c['theme'] == 'dark'}
    light = collections.Counter(hex_of(parse_color(c['stroke'])) for c in stroked if c['theme'] == 'light')
    pairs = collections.Counter()
    for c in stroked:
        d = dark.get((c['dump'].rsplit('-', 1)[0], c['key'])) if c['theme'] == 'light' else None
        if d:
            pairs[(hex_of(parse_color(c['stroke'])), hex_of(parse_color(d['stroke'])))] += 1
    if len(light) != 1 or len(pairs) > 1:
        dec['mixed'] = {'stroked': sorted({c['dump'] for c in stroked}), 'plainCaptures': 0, 'strokedColours': dict(light), 'pairs': [list(p) for p in pairs]}
        return dec
    dec['stroke'] = next(iter(light))
    if pairs:
        dec['dark'] = next(iter(pairs))[1]
        dec['var'] = colour_variable('icône', dec['stroke'], dec['dark'])
    return dec


def constant_colour(values):
    """feColorMatrix values that paint every pixel with one colour and keep its alpha → '#RRGGBB', else None."""
    try:
        v = [float(x) for x in values.replace(',', ' ').split()]
    except ValueError:
        return None
    if len(v) != 20:
        return None
    rgb, a = (v[0:5], v[5:10], v[10:15]), v[15:20]
    if any(abs(x) > 1e-9 for r in rgb for x in r[:4]) or abs(a[3] - 1) > 1e-9 or any(abs(x) > 1e-9 for x in a[:3] + [a[4]]):
        return None
    return '#%02X%02X%02X' % tuple(round(max(0.0, min(1.0, r[4])) * 255) for r in rgb)


def normalise_file(svg):
    svg = re.sub(r'<\?xml[^>]*>\s*', '', svg)
    svg = re.sub(r'<!--.*?-->', '', svg, flags=re.S)
    # 16 Oct.: Figma's SVG import ignores filters. A group whitened (or tinted) by a constant feColorMatrix (logo of
    # 42 Paris: shapes in #000105 made white) gets that colour on its painted fills and strokes, without the filter.
    for fid, vals in re.findall(r'<filter id="([^"]+)"[^>]*>\s*<feColorMatrix[^>]*\svalues="([^"]+)"[^>]*>(?:\s*</feColorMatrix>)?\s*</filter>', svg):
        col = constant_colour(vals)
        m = re.search(r'<g\b[^>]*\sfilter="url\(#' + re.escape(fid) + r'\)"[^>]*>', svg) if col else None
        if not m:
            continue
        depth, end = 0, None
        for t in re.finditer(r'<(/?)g\b[^>]*?(/?)>', svg[m.start():]):
            if t.group(2):
                continue
            depth += -1 if t.group(1) else 1
            if depth == 0:
                end = m.start() + t.end(); break
        if end is None:
            continue
        inner = re.sub(r'\sfilter="url\(#' + re.escape(fid) + r'\)"', '', svg[m.start():end], count=1)
        inner = re.sub(r'\b(fill|stroke)="(?!none)[^"]*"', lambda mm: '%s="%s"' % (mm.group(1), col), inner)
        svg = svg[:m.start()] + inner + svg[end:]
        svg = re.sub(r'<filter id="' + re.escape(fid) + r'"[^>]*>.*?</filter>', '', svg, flags=re.S)
    return svg.strip()


# 16 Oct.: inline icons drawn exactly like a sprite icon reuse its component; the others are named by their shape.
SPRITE_SAME = {'m7 10 5 5 5-5': 'i-down', 'm5 12 4 4L19 6': 'i-check', 'm6 6 12 12M18 6 6 18': 'i-close', 'm6 6 12 12M6 18 18 6': 'i-close'}
SHAPES = {'m5 11 7-7 7 7M12 4v16': 'Flèche vers le haut', 'M12 19V5m-6 6 6-6 6 6': 'Flèche vers le haut · large',
          'M5 12h14m-6-6 6 6-6 6': 'Flèche vers la droite · grande pointe', 'm14 6-6 6 6 6M8 12h12': 'Flèche vers la gauche · courte',
          'm5 7.5 5 5 5-5': 'Chevron vers le bas · 20', 'M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1': 'Liste',
          'M8 3h8v5a4 4 0 0 1-8 0Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v6m-4 3h8m-7-3h6': 'Trophée · distinctions du profil'}


def path_d(svg):
    ds = re.findall(r'\sd="([^"]+)"', svg or '')
    return ds[0] if len(ds) == 1 else None


def scene_assets():
    """Every asset used by the converted scenes: {ref: first record, with the contexts of FR scenes (ctx) and others}."""
    found = {}
    for f in sorted((BASE / 'scenes').glob('*--fr.svgs.json')) + sorted((BASE / 'scenes').glob('*--[ea][nr].svgs.json')):
        for ref, a in json.loads(f.read_text()).items():
            if not isinstance(a, dict):
                continue
            fr = f.name.endswith('--fr.svgs.json')
            e = found.setdefault(ref, {**a, 'ctx': [], 'ctx2': []})
            (e['ctx'] if fr else e['ctx2']).extend(a.get('ctx', []))
    return found


def is_icon(a):
    svg = a.get('svg') or ''
    return a['w'] <= 40 and a['h'] <= 40 and len(svg) < 1500 and 'fill="#' not in svg and 'stroke="#' not in svg


def is_illustration(ref, a):
    return not ref.startswith(('globe:', 'file:')) and not a.get('name') and bool(a.get('svg')) and not is_icon(a)


def plan():
    led = ledger()
    done = led.get('assets', {})
    found = scene_assets()
    items, aliases, paints = [], {}, None
    for ref, a in found.items():
        if ref in done:
            continue
        ctx = collections.Counter(c for c in (a['ctx'] or a['ctx2']) if c).most_common(1)
        label = ctx[0][0] if ctx else ''
        if ref.startswith('globe:'):
            path = BASE / 'assets' / 'globe' / (ref.split(':', 1)[1] + '.svg')
            if not path.exists():
                continue
            items.append({'ref': ref, 'kind': 'Globe', 'name': a.get('name', 'Globe/' + ref), 'w': a['w'], 'h': a['h'],
                          'svg': normalise_file(path.read_text()), 'chars': path.stat().st_size})
            continue
        if ref.startswith('file:'):
            path = (SITE / a['file']).resolve()
            if not path.exists():
                continue
            # 17 Oct.: texts in a generic family (monospace of the minishell schema) as outlines of the font Chrome used
            svg, _ = outline_texts(normalise_file(path.read_text()))
            kind = 'Portrait' if 'avatar' in a['file'] else 'Image SVG'
            name = '%s/%s' % (kind, path.stem)
        elif a.get('name'):
            svg, kind, name = a['svg'], a.get('kind', 'Illustration'), a['name']
            items.append({'ref': ref, 'kind': kind, 'name': name, 'w': a['w'], 'h': a['h'], 'svg': svg, 'chars': len(svg), 'recolor': True})
            continue
        else:
            svg = a.get('svg') or ''
            bind = None
            if is_icon(a):
                svg = normalise_inline(svg, a['w'], a['h'], a.get('stroke'), a.get('fill'), a.get('sw'))
                kind = 'Icône intégrée'
            else:
                # 17 Oct.: the page paint of the root and outlined texts (normalise_illustration); until then the raw
                # markup was imported (no stroke, butt caps, Figma's fallback fonts)
                if paints is None:
                    paints = browser_contexts([r for r, x in found.items() if r not in done and is_illustration(r, x)])
                dec = illustration_paint(paints.get(ref, []))
                svg, _ = normalise_illustration(svg, dec['stroke'], dec['width'], dec['text'])
                if dec.get('var'):
                    bind = {'hex': dec['stroke'], 'v': dec['var']}
                if dec.get('mixed'):
                    print('warning: %s drawn with and without the inherited stroke, kept without (captures with it: %s)'
                          % (ref, ', '.join(dec['mixed']['stroked'])))
                kind = 'Illustration'
            name = '%s/%s' % (kind, label or ref)
            d = path_d(svg) if kind == 'Icône intégrée' else None
            if d in SPRITE_SAME:
                aliases[ref] = SPRITE_SAME[d]   # same drawing as a sprite icon: its component is reused
                continue
            if d in SHAPES:
                name = '%s/%s' % (kind, SHAPES[d] + (' · ' + label if label and not re.match(r'^[0-9a-z]+-\d+$', label) else ''))
            if bind:
                items.append({'ref': ref, 'kind': kind, 'name': name, 'w': a['w'], 'h': a['h'], 'svg': svg, 'chars': len(svg), 'bind': bind})
                continue
        items.append({'ref': ref, 'kind': kind, 'name': name, 'w': a['w'], 'h': a['h'], 'svg': svg, 'chars': len(svg)})
    # unique names
    seen = collections.Counter()
    for it in items:
        seen[it['name']] += 1
        if seen[it['name']] > 1:
            it['name'] += ' %d' % seen[it['name']]
    PLAN.write_text(json.dumps(items, ensure_ascii=False, indent=1))
    if aliases:
        icons = led['components']['icons']
        led.setdefault('assets', {}).update({ref: icons[i] for ref, i in aliases.items() if i in icons})
        LEDGER.write_text(json.dumps(led, ensure_ascii=False, indent=1))
        print('reused sprite icons:', aliases)
    by = collections.Counter(i['kind'] for i in items)
    print(len(items), 'new assets', dict(by), sum(i['chars'] for i in items), 'chars')


def batches(limit=42000):
    items = json.loads(PLAN.read_text())
    out, cur, size = [], [], 0
    for it in items:
        c = it['chars'] + 200
        if cur and size + c > limit:
            out.append(cur); cur, size = [], 0
        cur.append(it); size += c
    if cur:
        out.append(cur)
    return out


CALL = r"""const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({family:'Jost', style:'Medium'}); await figma.loadFontAsync({family:'Jost', style:'Regular'});
const A = %(items)s;
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
    comp.x = 40 + (i %% cols) * cellW; comp.y = 110 + Math.floor(i / cols) * cellH;
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
// 17 Oct.: the stroke an illustration inherits from the page (a.bind.hex), bound to its light/dark variable
for (const a of A) {
  const id = out[a.ref]; if (!id || !a.bind) continue;
  if (!V[a.bind.v]) { errors.push(a.ref + ': missing variable ' + a.bind.v); continue; }
  const c = await figma.getNodeByIdAsync(id);
  const h = [1, 3, 5].map(i => parseInt(a.bind.hex.slice(i, i + 2), 16) / 255);
  for (const v of c.findAllWithCriteria({ types: ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'LINE', 'POLYGON', 'STAR', 'BOOLEAN_OPERATION'] })) {
    let hit = false;
    const s = v.strokes.map(p => { if (p.type === 'SOLID' && Math.abs(p.color.r - h[0]) < 0.003 && Math.abs(p.color.g - h[1]) < 0.003 && Math.abs(p.color.b - h[2]) < 0.003) { hit = true; return figma.variables.setBoundVariableForPaint(p, 'color', V[a.bind.v]); } return p; });
    if (hit) v.strokes = s;
  }
}
return { created: out, errors, count: Object.keys(out).length };"""


def call(n):
    b = batches()[int(n)]
    led = ledger()
    items = [{k: it[k] for k in ('ref', 'kind', 'name', 'w', 'h', 'svg', 'bind') if k in it} for it in b]
    return CALL % {'page': led['pages']['Icônes et marque'], 'items': json.dumps(items, ensure_ascii=False)}


# 17 Oct.: in-place update of existing components (same id, name and position: their instances, which carry no override
# on these children, should follow): the content of the corrected SVG replaces the children of the component.
# Self-contained, nothing stored or evaluated from the document. Guards: a component of the page « Icônes et marque »,
# of the expected size, whose description names the capture ref or whose name has the expected prefix. The new
# children are added before the old ones are removed; a failure before that removal takes them out again and leaves
# the component as it was.
CALL_UPDATE = r"""// 42 Horizon — mise à jour en place des ressources (assets.py update, 17 oct. 2026) : __TITLE__
const page = await figma.getNodeByIdAsync('__PAGE__');
await figma.setCurrentPageAsync(page);
const U = __ITEMS__;
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
return { updated, errors, mutatedNodeIds: updated.map(x => x.id) };"""
CALL_FORBIDDEN = ('loadAllPagesAsync', 'setPluginData', 'setSharedPluginData', 'createImageAsync', 'eval(', 'new Function')


def created_names():
    """Names given at creation, read from the asset calls already sent (calls/done/*.js, read only): {ref: name}.
    The batch of 15 Oct. is not archived there; its names are then rebuilt like plan() does (« probable »)."""
    names = {}
    for f in sorted((BASE / 'calls' / 'done').glob('*.js')):
        m = re.search(r'^const A = (\[.*\]);$', f.read_text(), flags=re.M)
        if m and 'createNodeFromSvg' in f.read_text():
            for a in json.loads(m.group(1)):
                if isinstance(a, dict) and a.get('ref') and a.get('name'):
                    names[a['ref']] = a['name']
    return names


def update_items():
    """17 Oct.: components of the ledger whose SVG, normalised as now, differs from the one imported: inline illustrations
    (page paint of the root, outlined texts) and SVG files with texts in a generic family (minishell schema)."""
    led = ledger()
    done = led.get('assets', {})
    found = scene_assets()
    names = created_names()
    paints = browser_contexts([r for r, a in found.items() if r in done and is_illustration(r, a)])
    items = []
    for ref, a in found.items():
        if ref not in done:
            continue
        if ref.startswith('file:'):
            path = (SITE / a['file']).resolve()
            if not path.exists():
                continue
            old = normalise_file(path.read_text())
            new, texts = outline_texts(old)
            kind = 'Portrait' if 'avatar' in a['file'] else 'Image SVG'
            it = {'ref': ref, 'id': done[ref], 'kind': kind, 'name': '%s/%s' % (kind, path.stem), 'old': old, 'svg': new, 'texts': texts}
        elif is_illustration(ref, a):
            # what plan() imported until 17 Oct.: the raw markup (it already has its xmlns)
            old = normalise_inline(a['svg'], a['w'], a['h'], None, None, None) if 'xmlns=' not in a['svg'][:200] else a['svg']
            dec = illustration_paint(paints.get(ref, []))
            new, texts = normalise_illustration(a['svg'], dec['stroke'], dec['width'], dec['text'])
            ctx = collections.Counter(c for c in (a['ctx'] or a['ctx2']) if c).most_common(1)
            it = {'ref': ref, 'id': done[ref], 'kind': 'Illustration', 'name': 'Illustration/' + (ctx[0][0] if ctx else ref),
                  'old': old, 'svg': new, 'texts': texts, 'paint': dec}
            if dec.get('var'):
                it['bind'] = {'hex': dec['stroke'], 'v': dec['var']}
        else:
            continue
        if it['svg'] == it['old']:
            continue
        it['nameKnown'] = ref in names
        it['name'] = names.get(ref, it['name'])
        m = re.match(r'<svg\b[^>]*\swidth="([^"]+)"[^>]*\sheight="([^"]+)"', it['svg'])
        it['w'], it['h'] = float(m.group(1)), float(m.group(2))
        items.append(it)
    return items, led


def file_slug(t):
    return re.sub(r'[^A-Za-z0-9]+', '-', t).strip('-')[:60]


def update(limit=30000):
    """Writes ../assets-update/NN-*.js (one call per group of components, below `limit` characters of SVG), the
    corrected SVG files (svg/) and manifest.json (decisions, outlined texts, captures drawn differently)."""
    items, led = update_items()
    (UPDATE / 'svg').mkdir(parents=True, exist_ok=True)
    groups, cur, size = [], [], 0
    for it in sorted(items, key=lambda i: (i['kind'] != 'Illustration', i['ref'])):
        if cur and size + len(it['svg']) > limit:
            groups.append(cur); cur, size = [], 0
        cur.append(it); size += len(it['svg'])
    if cur:
        groups.append(cur)
    manifest = {'date': '2026-10-17', 'page': led['pages']['Icônes et marque'], 'calls': [], 'components': []}
    for n, group in enumerate(groups, 1):
        title = ', '.join(it['name'] for it in group)
        fname = '%02d-%s.js' % (n, 'illustrations' if group[0]['kind'] == 'Illustration' else file_slug(group[0]['name'].split('/')[-1]))
        payload = [{'ref': it['ref'], 'id': it['id'], 'prefix': it['kind'] + '/', 'w': it['w'], 'h': it['h'], 'svg': it['svg'],
                    **({'bind': it['bind']} if it.get('bind') else {})} for it in group]
        code = (CALL_UPDATE.replace('__TITLE__', title).replace('__PAGE__', led['pages']['Icônes et marque'])
                .replace('__ITEMS__', json.dumps(payload, ensure_ascii=False)))
        bad = [t for t in CALL_FORBIDDEN if t in code]
        if bad or len(code) >= 49500:
            raise SystemExit('call %s refused: %s, %d characters' % (fname, bad, len(code)))
        (UPDATE / fname).write_text(code)
        manifest['calls'].append({'file': fname, 'chars': len(code), 'components': [it['ref'] for it in group]})
        for it in group:
            svg_name = 'svg/%s.svg' % file_slug(it['ref'].replace('file:', '').replace('.svg', ''))
            (UPDATE / svg_name).write_text(it['svg'] + '\n')
            manifest['components'].append({
                'ref': it['ref'], 'id': it['id'], 'kind': it['kind'], 'name': it['name'],
                'nameSource': 'calls/done' if it['nameKnown'] else 'probable (batch of 15 Oct. not archived)', 'call': fname, 'svg': svg_name,
                'size': [it['w'], it['h']], 'chars': {'before': len(it['old']), 'after': len(it['svg'])},
                'sha1': hashlib.sha1(it['svg'].encode()).hexdigest(), 'bind': it.get('bind'),
                'paint': {k: v for k, v in (it.get('paint') or {}).items()} or None,
                'texts': [{k: t[k] for k in ('text', 'font', 'size', 'weight', 'letterSpacing', 'anchor', 'direction', 'x', 'y', 'left', 'advance', 'fill')} for t in it['texts']]})
    (UPDATE / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n')
    for c in manifest['calls']:
        print(c['file'], c['chars'], 'characters,', len(c['components']), 'components')
    for c in manifest['components']:
        mixed = (c['paint'] or {}).get('mixed')
        print(' ', c['ref'], c['id'], c['name'], '· stroke', (c['paint'] or {}).get('stroke'), '· bind', c['bind'],
              '· texts', len(c['texts']), '· drawn with the stroke in %d captures' % len(mixed['stroked']) if mixed else '')


def record(result_json):
    res = json.loads(result_json)
    led = ledger()
    led.setdefault('assets', {}).update(res['created'])
    LEDGER.write_text(json.dumps(led, ensure_ascii=False, indent=1))
    print('assets recorded:', len(res['created']), 'total', len(led['assets']), 'errors', res.get('errors'))


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'plan':
        plan(); print(len(batches()), 'batch(es)')
    elif cmd == 'call':
        print(call(sys.argv[2]))
    elif cmd == 'record':
        record(sys.argv[2] if len(sys.argv) > 2 else sys.stdin.read())
    elif cmd == 'update':
        update()
