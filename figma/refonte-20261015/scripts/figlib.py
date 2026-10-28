"""Shared parsing helpers for the DOM-dump → Figma conversion (Figma rebuild of 15 October 2026).

Reads the layout dumps written by capture_lib.py (dom/<area>/<state>--<format>--<lang>-<theme>.json.gz) and parses
CSS computed values (colours, fonts, shadows, gradients, blur) into plain Python structures used by build_palette.py
and dom2fig.py. Nothing here talks to Figma.
"""
import gzip, json, math, pathlib, re

BASE = pathlib.Path(__file__).resolve().parent.parent
DOM = BASE / 'dom'
REPO = BASE.parents[1]
SITE = REPO / 'site'


def dump_path(area, state, fmt, lang, theme):
    return DOM / area / f'{state}--{fmt}--{lang}-{theme}.json.gz'


def load(area, state, fmt, lang, theme):
    p = dump_path(area, state, fmt, lang, theme)
    if not p.exists():
        return None
    d = json.loads(gzip.decompress(p.read_bytes()))
    d['byKey'] = {n['k']: n for n in d['nodes'] if 'k' in n}
    d['children'] = {}
    for n in d['nodes']:
        d['children'].setdefault(n['p'], []).append(n)
    return d


# ---------------------------------------------------------------- colours
_num = r'[-+]?\d*\.?\d+(?:e[-+]?\d+)?'


def parse_color(s):
    """CSS computed colour → (r, g, b, a) floats in 0..1, or None for none/transparent/unparsed."""
    if not s:
        return None
    s = s.strip()
    if s in ('transparent', 'none', 'currentcolor', 'currentColor'):
        return None
    m = re.match(r'rgba?\(\s*(' + _num + r')[ ,]+(' + _num + r')[ ,]+(' + _num + r')(?:\s*[,/]\s*(' + _num + r')(%?))?\s*\)', s)
    if m:
        r, g, b = (float(m.group(i)) / 255 for i in (1, 2, 3))
        a = float(m.group(4)) / (100 if m.group(5) else 1) if m.group(4) is not None else 1.0
        return (r, g, b, a)
    m = re.match(r'color\(srgb\s+(' + _num + r')\s+(' + _num + r')\s+(' + _num + r')(?:\s*/\s*(' + _num + r'))?\s*\)', s)
    if m:
        r, g, b = (float(m.group(i)) for i in (1, 2, 3))
        a = float(m.group(4)) if m.group(4) is not None else 1.0
        return (min(max(r, 0), 1), min(max(g, 0), 1), min(max(b, 0), 1), a)
    m = re.match(r'#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$', s)
    if m:
        h = m.group(1)
        return (int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255,
                int(m.group(2), 16) / 255 if m.group(2) else 1.0)
    return None


def hex_of(c):
    """(r,g,b,a) → '#RRGGBB' or '#RRGGBBAA' (alpha only when < 1)."""
    if c is None:
        return None
    r, g, b, a = c
    h = '#%02X%02X%02X' % tuple(round(v * 255) for v in (r, g, b))
    if a < 0.999:
        h += '%02X' % round(a * 255)
    return h


def color_key(c):
    return hex_of(c) if c else None


def split_top(s, sep=','):
    """Split on sep at parenthesis depth 0."""
    out, depth, cur = [], 0, ''
    for ch in s:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if ch == sep and depth == 0:
            out.append(cur.strip()); cur = ''
        else:
            cur += ch
    if cur.strip():
        out.append(cur.strip())
    return out


_color_re = re.compile(r'(rgba?\([^)]*\)|color\(srgb[^)]*\)|#[0-9a-fA-F]{6,8})')


def parse_shadows(s):
    """box-shadow computed value → list of dicts {inset, x, y, blur, spread, color}."""
    if not s or s == 'none':
        return []
    out = []
    for part in split_top(s):
        m = _color_re.search(part)
        color = parse_color(m.group(1)) if m else (0, 0, 0, 1)
        rest = (part[:m.start()] + part[m.end():]) if m else part
        inset = 'inset' in rest
        nums = [float(x) for x in re.findall(r'(' + _num + r')px', rest)]
        nums += [0.0] * (4 - len(nums))
        if color and color[3] > 0.001:
            out.append({'inset': inset, 'x': nums[0], 'y': nums[1], 'blur': nums[2], 'spread': nums[3], 'color': color})
    return out


def parse_blur(s):
    """backdrop-filter / filter → blur radius in CSS px (0 if none)."""
    if not s or s == 'none':
        return 0.0
    m = re.search(r'blur\((' + _num + r')px\)', s)
    return float(m.group(1)) if m else 0.0


def parse_gradients(s):
    """background-image → list of gradient dicts (linear/radial) or {'url': ...} items, in paint order (last = bottom)."""
    if not s or s == 'none':
        return []
    items = []
    for part in split_top(s):
        m = re.match(r'(repeating-)?(linear|radial)-gradient\((.*)\)$', part, re.S)
        if m:
            args = split_top(m.group(3))
            kind = m.group(2)
            head = args[0] if args and not _color_re.match(args[0].strip()) else None
            stops_raw = args[1:] if head is not None else args
            stops = []
            for st in stops_raw:
                cm = _color_re.search(st)
                if not cm:
                    continue
                # 17 Oct.: positions in px are kept as ('px', v); dom2fig resolves them along the gradient line of the
                # element (they were spread evenly: the fixed header fade of 166 px became opaque over 716 px)
                pos = re.findall(r'(' + _num + r')(%|px)', st[cm.end():])
                p = (float(pos[0][0]) / 100 if pos[0][1] == '%' else ('px', float(pos[0][0]))) if pos else None
                stops.append([p, parse_color(cm.group(1))])
            n = len(stops)
            has_px = any(isinstance(st[0], tuple) for st in stops)
            for i, st in enumerate(stops):  # CSS default stop positions: evenly spread
                if st[0] is None and not has_px:
                    st[0] = 0.0 if i == 0 else (1.0 if i == n - 1 else i / (n - 1))
            # CSS interpolates in premultiplied alpha: a transparent stop takes the colour of its nearest opaque
            # neighbour, otherwise Figma would fade through grey/black
            for i, st in enumerate(stops):
                c = st[1]
                if c and c[3] < 0.001:
                    near = [stops[j][1] for j in sorted(range(n), key=lambda j: abs(j - i)) if stops[j][1] and stops[j][1][3] >= 0.001]
                    if near:
                        st[1] = (near[0][0], near[0][1], near[0][2], 0.0)
            angle = 180.0
            center = (0.5, 0.5)
            if kind == 'linear' and head:
                am = re.search(r'(' + _num + r')deg', head)
                if am:
                    angle = float(am.group(1))
                elif 'to ' in head:
                    dirs = {'to top': 0, 'to right': 90, 'to bottom': 180, 'to left': 270, 'to top right': 45,
                            'to right top': 45, 'to bottom right': 135, 'to right bottom': 135, 'to bottom left': 225,
                            'to left bottom': 225, 'to top left': 315, 'to left top': 315}
                    angle = dirs.get(head.strip(), 180)
            if kind == 'radial' and head:
                pm = re.search(r'at\s+(' + _num + r')%\s+(' + _num + r')%', head)
                if pm:
                    center = (float(pm.group(1)) / 100, float(pm.group(2)) / 100)
            items.append({'g': 'L' if kind == 'linear' else 'R', 'angle': angle, 'center': center, 'head': head,
                          'stops': [[round(p, 4) if isinstance(p, float) else p, c] for p, c in stops if c],
                          **({'px': True} if has_px else {})})
            continue
        um = re.match(r'url\((["\']?)(.*)\1\)$', part, re.S)
        if um:
            items.append({'url': um.group(2)})
    return items


# ---------------------------------------------------------------- fonts
WEIGHTS = {100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold',
           700: 'Bold', 800: 'ExtraBold', 900: 'Black'}


def parse_font(font):
    """capture_lib font string 'normal 500 25px/28.75px Jost, sans-serif' → dict."""
    m = re.match(r'(\S+)\s+(\d+)\s+(' + _num + r')px/(\S+)\s+(.*)$', font or '')
    if not m:
        return {'family': 'Jost', 'weight': 400, 'italic': False, 'size': 16.0, 'lh': None}
    style, weight, size, lh, fam = m.groups()
    fam0 = fam.split(',')[0].strip().strip('"\'')
    lhv = float(lh[:-2]) if lh.endswith('px') else None
    return {'family': fam0, 'weight': int(weight), 'italic': style == 'italic', 'size': float(size), 'lh': lhv}


def figma_font(fam, weight, italic, text=''):
    """CSS family/weight → Figma {family, style}; Arabic text uses Noto Sans Arabic like the browser fallback."""
    w = min(WEIGHTS, key=lambda k: abs(k - weight))
    style = WEIGHTS[w]
    if fam.lower() in ('monospace', 'ibm plex mono', 'ui-monospace', 'menlo', 'consolas', 'courier new'):
        family = 'IBM Plex Mono'
    elif fam.lower() in ('cousine',):
        family = 'Cousine'
    elif fam.lower().startswith('noto sans arabic'):
        family = 'Noto Sans Arabic'
    else:
        family = 'Jost'
    if italic and family in ('Jost', 'IBM Plex Mono'):
        style = 'Italic' if style == 'Regular' else style + ' Italic'
    return {'family': family, 'style': style}


ARABIC = re.compile(r'[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]')


def has_arabic(t):
    return bool(ARABIC.search(t or ''))


def px(v, default=0.0):
    try:
        return float(str(v).replace('px', ''))
    except (TypeError, ValueError):
        return default


def radii(s, w=None, h=None):
    """'8px 8px 8px 8px' (computed corners) → [tl, tr, br, bl] in px; percentages use the smaller side of the box."""
    if not s:
        return [0, 0, 0, 0]
    parts = s.split()
    vals = []
    for p in parts[:4]:
        p = p.split('/')[0]
        if p.endswith('%') and w and h:
            vals.append(float(p[:-1]) / 100 * min(w, h))
        else:
            vals.append(px(p) if p.endswith('px') else 0.0)
    while len(vals) < 4:
        vals.append(vals[-1] if vals else 0.0)
    return vals


def border_side(v):
    """'1px solid rgb(…)' → (width, style, color) or None."""
    if not v:
        return None
    m = re.match(r'(' + _num + r')px\s+(\w+)\s+(.*)$', v)
    if not m:
        return None
    c = parse_color(m.group(3))
    if not c or c[3] < 0.001 or float(m.group(1)) <= 0:
        return None
    return (float(m.group(1)), m.group(2), c)


def slug(t, n=48):
    t = re.sub(r'\s+', ' ', t or '').strip()
    t = t.replace('/', '∕')
    return t[:n].rstrip() + ('…' if len(t) > n else '')


def figma_var_name(css):
    """CSS custom property → Figma variable name (folders by family; primitives apart from roles)."""
    core = css.lstrip('-')
    if core.startswith('h42-color-'):
        return 'Rôles/' + core[len('h42-color-'):]
    if core == 'h42-access-accent':
        return 'Rôles/access-accent'
    if core.startswith('h42-'):
        return 'Primitives/' + core[4:]
    for prefix, folder in (('control-', 'Contrôles/'), ('cp-', 'Contenus/'), ('horizon-', 'Horizon/'),
                           ('readable-', 'Verre lisible/'), ('warm-', 'Chaleur/')):
        if core.startswith(prefix):
            return folder + core[len(prefix):]
    return 'Autres/' + core


# ---------------------------------------------------------------- theme pairing (16 October, after the entrance check)
# A paint present in the light dump but absent from the same element in the dark dump (background, border, shadow,
# gradient) is transparent in the dark theme: its dark value is the dark page colour with alpha 0, so that Figma,
# which interpolates gradient stops without premultiplied alpha, cannot tint anything with it.
CLEAR_DARK = (27 / 255, 27 / 255, 27 / 255, 0.0)
LIGHT_ONLY_KINDS = ('fond', 'bordure', 'ombre', 'dégradé')
# Single-colour SVG images recoloured by CSS (filter: invert(1) in the dark theme): colour of their paths.
IMG_TINT = {'logo-42.svg': (0.0, 0.0, 0.0, 1.0)}


def img_tint(n):
    """Painted colour of a single-colour SVG <img> (with filter: invert(1) applied), else None."""
    if not n or n.get('tag') != 'img':
        return None
    src = (n.get('src') or '').split('?')[0].split('/')[-1]
    c = IMG_TINT.get(src)
    if c and 'invert(1)' in (n.get('s', {}).get('filter') or ''):
        c = (1 - c[0], 1 - c[1], 1 - c[2], c[3])
    return c


def dialog_backdrop(n, dump):
    """(colour or None, blur in CSS px) of the ::backdrop of an open modal <dialog>, else None.
    Captures from 16 October record it on the node; the entrance records it in meta.state.dialog.backdrop."""
    if not n or n.get('tag') != 'dialog':
        return None
    b = n.get('backdrop')
    if not b:
        st = (((dump or {}).get('meta') or {}).get('state') or {})
        b0 = (st.get('dialog') or {}).get('backdrop') if isinstance(st, dict) else None
        if b0:
            b = {'bg': b0.get('background'), 'filter': b0.get('backdropFilter')}
    if not b:
        return None
    c = parse_color(b.get('bg'))
    blur = parse_blur(b.get('filter'))
    return (c, blur) if (c and c[3] > 0.001) or blur else None


def pseudo_style(ps):
    """Paint-related computed style of a ::before/::after record, shaped like an element style."""
    if not ps:
        return {}
    return {k: ps.get(k) for k in ('bg', 'bgImage', 'bT', 'bR', 'bB', 'bL', 'radius', 'shadow', 'opacity', 'filter') if ps.get(k) is not None}


def content_box_x(n, parent=None):
    """Left and right edges of the content box available to the text of n (inline elements wrap in their parent)."""
    box = n
    if parent is not None and (n.get('s', {}).get('display') or '') == 'inline':
        box = parent   # a plain inline element wraps its lines in the content box of its parent
    s = box.get('s', {})
    pad = [px(v) for v in ((s.get('padding') or '0px').split() + ['0px'] * 4)[:4]]
    k = len((s.get('padding') or '0px').split())
    if k == 1:
        pad = [pad[0]] * 4
    elif k == 2:
        pad = [pad[0], pad[1], pad[0], pad[1]]
    elif k == 3:
        pad = [pad[0], pad[1], pad[2], pad[1]]
    bl = border_side(s.get('bL')); br = border_side(s.get('bR'))
    left = box['x'] + pad[3] + (bl[0] if bl else 0)
    right = box['x'] + box['w'] - pad[1] - (br[0] if br else 0)
    return left, right


# Vertical metrics (ascender, descender in em, hhea) of the fonts the browser used, read from the font files:
# Jost 3.710 (site assets) and Noto Sans Arabic 2.005 (system fallback of Chrome for Arabic).
ASCENT = {'Jost': (1.070, 0.375), 'Noto Sans Arabic': (1.374, 0.738)}


def gradient_layers(ls, ds, present):
    """Gradient layers of one element for both themes (16 Oct.), shared by build_palette.py and dom2fig.py.
    ls, ds: background-image of the light and dark element (ds None when the element is missing in the dark dump).
    Same structure in both themes (count, kind, geometry, stops): stops paired one by one. Otherwise the light layers
    are transparent in the dark theme and the dark layers are added, transparent in the light theme, so each theme
    keeps its own geometry (Figma cannot change a gradient's geometry per mode).
    Returns [{'g', 'angle', 'center', 'stops': [[pos, light rgba, dark rgba or None]]} | {'url'}] in CSS order."""
    lg = parse_gradients(ls)
    dg = parse_gradients(ds) if present else []
    geo = lambda g: ('url',) if 'url' in g else (g['g'], g['angle'], g['center'], len(g['stops']))
    if lg and len(lg) == len(dg) and all(geo(a) == geo(b) for a, b in zip(lg, dg)):
        return [g if 'url' in g else {**g, 'stops': [[p, c, d[1]] for (p, c), d in zip(g['stops'], h['stops'])]} for g, h in zip(lg, dg)]
    out = [g if 'url' in g else {**g, 'stops': [[p, c, CLEAR_DARK if present else None] for p, c in g['stops']]} for g in lg]
    out += [{**g, 'stops': [[p, (0.0, 0.0, 0.0, 0.0), c] for p, c in g['stops']], 'darkOnly': True} for g in dg if 'url' not in g]
    return out
