"""DOM dump → compact Figma scene (Figma rebuild of 15 October 2026).

Turns one captured state of the prototype into a tree that render.js rebuilds with real Figma layers:
frames (fills, borders, radii, shadows, glass blur, clipping), text (font, size, line height, tracking,
alignment, colour, wrapping, truncation), icons (instances of the sprite components), inline SVG
illustrations and portraits (instances of asset components), placeholders for rasters and canvases.

Colours are references to the « 42 · Couleurs » variables (palette.json, light/dark pairs). Interface and
content strings carry their FR/EN/AR values (paired by element key across the language dumps) so render.js
binds them to the « 42 · Textes » variables. Geometry is absolute and exact; auto-layout is applied only where
the measured positions prove a flex container behaves like a Figma auto-layout frame.

Usage (library): from dom2fig import convert
    scene = convert('projects', 'projects', 'desktop', lang='fr', full=True)
CLI: python3 dom2fig.py <area> <state> <desktop|mobile> [fr|ar] [--viewport] → ../scenes/<…>.json
"""
import copy, json, math, re, sys
import components
from figlib import (BASE, SITE, load, parse_color, hex_of, parse_shadows, parse_blur, parse_gradients, parse_font,
                    figma_font, has_arabic, px, radii, border_side, slug, CLEAR_DARK, img_tint, dialog_backdrop,
                    pseudo_style, content_box_x, ASCENT, gradient_layers)
from build_palette import node_colors

SCENES = BASE / 'scenes'
PALETTE = None
NUM = r'[-+]?\d*\.?\d+(?:e[-+]?\d+)?'


def palette():
    global PALETTE
    if PALETTE is None:
        PALETTE = json.loads((BASE / 'palette.json').read_text())
    return PALETTE


def r2(v):
    return round(float(v), 2)


# ------------------------------------------------------------------ colour references
PAIRS = None


def any_kind(lh, dh):
    """Variable holding the pair (light, dark) under any kind, CSS-named variables first (16 Oct.)."""
    global PAIRS
    if PAIRS is None:
        PAIRS = {}
        for key, name in palette()['map'].items():
            _k, l, d = key.split('|')
            old = PAIRS.get((l, d))
            if old is None or (old.startswith('dérivées/') and not name.startswith('dérivées/')):
                PAIRS[(l, d)] = name
    return PAIRS.get((lh, dh))


SWAP = False   # 17 Oct.: convert(theme='dark') reads the dark capture first; its colours are the dark side of the pairs


DARK_SIDE = None


def by_dark(kind, dh):
    """Variable whose dark value is dh (17 Oct.): same kind first, CSS-named variables before derived ones."""
    global DARK_SIDE
    if DARK_SIDE is None:
        DARK_SIDE = {}
        for key, name in palette()['map'].items():
            k, _l, d = key.split('|')
            DARK_SIDE.setdefault((k, d), set()).add(name)
            DARK_SIDE.setdefault(('*', d), set()).add(name)
    names = DARK_SIDE.get((kind, dh)) or DARK_SIDE.get(('*', dh)) or set()
    ranked = sorted(names, key=lambda n: (n.startswith('dérivées/'), n))
    return ranked[0] if ranked else None


def cref(kind, c, dark_c=None):
    """Colour → {'v': variable name} when the pair is known, else {'h': hex} (alpha kept in hex)."""
    if SWAP:
        if c is None:
            return None
        if dark_c is None:
            # no light counterpart (the check mark of « Sombre » exists only in the dark capture): the variable whose
            # dark value is this colour, else the colour itself
            name = by_dark(kind, hex_of(c))
            return {'v': name} if name else {'h': hex_of(c)}
        # 18 Oct.: pick_dark(), frame_paints() and gradient_layers() mark a paint present on one side only for the light →
        # dark direction (CLEAR_DARK for « absent from the other capture », (0,0,0,0) for « only in the other »); after
        # the swap these marks fall on the wrong side of the key (the selected « Clair » row of the dark Theme panel kept
        # its light turquoise). Both spellings of transparent are tried on each side, the raw pair first (a really
        # transparent gradient stop keeps its key); with no variable, the colour seen in the dark capture, never the light
        lc, dc = dark_c, c
        l2 = (0, 0, 0, 0) if lc[3] <= 0.001 else lc
        d2 = CLEAR_DARK if dc[3] <= 0.001 else dc
        pal = palette()
        for l_, d_ in ((lc, dc), (l2, dc), (lc, d2), (l2, d2)):
            lh_, dh_ = hex_of(l_), hex_of(d_)
            name = pal['map'].get('%s|%s|%s' % (kind, lh_, dh_)) or any_kind(lh_, dh_)
            if name:
                return {'v': name}
        return {'h': hex_of(c)}
    if c is None:
        return None
    lh = hex_of(c)
    pal = palette()
    dh = hex_of(dark_c) if dark_c is not None else pal['fallback'].get(kind + '|' + lh)
    name = pal['map'].get('%s|%s|%s' % (kind, lh, dh)) if dh else None
    if name is None and dh:
        name = any_kind(lh, dh)
    if name is None and dh is None:
        # never seen in a pair: same colour in both themes; reuse a variable if one has it on both sides
        name = pal['map'].get('%s|%s|%s' % (kind, lh, lh)) or any_kind(lh, lh)
    return {'v': name} if name else {'h': lh}


def dark_colors(dn):
    return node_colors(dn, False) if dn else []


def pick_dark(kind, idx, dcs, dark_present=False):
    """Dark colour of the same kind; a paint absent from an element present in the dark dump is transparent there."""
    same = [d for k, d in dcs if k == kind]
    if same:
        return same[min(idx, len(same) - 1)]
    return CLEAR_DARK if dark_present and kind in ('fond', 'bordure', 'ombre', 'dégradé') else None


# ------------------------------------------------------------------ naming
# Layer names: prototype classes → clear French names (most specific class first), then the element's own label.
CLASS_LABELS = {
    'cp-card': 'Carte', 'cp-card-cover-link': 'Lien de l’illustration', 'cp-cover': 'Illustration', 'cp-art': 'Dessin',
    'cp-card-copy': 'Texte de la carte', 'cp-meta': 'Campus et date', 'cp-content-campuses': 'Campus', 'cp-published': 'Date',
    'cp-card-title-link': 'Titre', 'cp-authors': 'Auteurs', 'cp-authors-label': 'Libellé « Créé par »',
    'cp-author-list': 'Liste des auteurs', 'cp-author-item': 'Auteur', 'cp-author-link': 'Lien d’auteur',
    'cp-person-avatar': 'Avatar', 'cp-author-copy': 'Nom et rôle', 'cp-author-name': 'Nom', 'cp-author-responsibility': 'Couronne',
    'cp-author-more': 'Autres auteurs (+N)', 'cp-summary': 'Résumé', 'cp-favorite': 'Bouton Favoris',
    'cp-pagination-link': 'Page', 'cp-pagination': 'Pagination', 'cp-control-menu': 'Menu de commande', 'cp-toolbar': 'Barre de commandes',
    'cp-profile-card': 'Carte profil', 'cp-profile-login': 'Pseudo', 'cp-status': 'Statut',
    'brand': 'Marque 42 Horizon', 'brand-names': 'Nom', 'brand-wordmark': 'HORIZON', 'brand-wordmark-cell': 'Lettre',
    'arabic-brand': 'Ligne arabe', 'utilities': 'Utilitaires', 'account-switcher': 'Compte', 'profile': 'Bouton du compte',
    'dock-shell': 'Menu du bas', 'main-nav': 'Navigation principale', 'nav-indicator': 'Pastille active',
    'dock-search-toggle': 'Recherche', 'dock-search-toggle-label': 'Libellé de recherche', 'random-campus': 'Dé',
    'scope-bar': 'Barre de périmètre', 'scope-path': 'Filtre de périmètre', 'scope-medallion': 'Médaillon du globe',
    'scope-trail': 'Chemin', 'scope-current': 'Périmètre actuel', 'scope-picker': 'Sélecteur de périmètre',
    'scope-name': 'Nom du périmètre', 'scope-world-return': 'Retour au Monde', 'globe-stage': 'Globe',
    'content-sheet': 'Contenu', 'content-index': 'Liste', 'atmosphere': 'Fond', 'header': 'En-tête', 'app': 'Application',
    'main': 'Principal', 'back-to-top': 'Remonter en haut', 'entrance': 'Arrivée', 'entrance-scene': 'Message',
    'entrance-ring': 'Anneau', 'entrance-logo': 'Logo 42', 'campus-sheet': 'Fiche campus', 'prototype-note': 'Ligne d’état',
    'hg-marker': 'Repère de campus', 'icon-button': 'Bouton icône', 'utility': 'Bouton utilitaire',
}


def node_name(n, fallback='Bloc'):
    classes = (n.get('cls') or '').split()
    if n.get('id') and n['id'] in CLASS_LABELS:
        classes = [n['id']] + classes
    label = next((CLASS_LABELS[c] for c in classes if c in CLASS_LABELS), None)
    detail = n.get('aria-label') or n.get('title') or n.get('alt') or n.get('text') or n.get('_desc') or ''
    if label and detail and detail != label:
        return label + ' · ' + slug(detail, 32)
    if label:
        return label
    if detail:
        return slug(detail, 36)
    if n.get('id'):
        return '#' + n['id']
    if classes:
        return '.' + classes[0]
    return fallback if n['tag'] in ('div', 'span') else '<' + n['tag'] + '>'


def ring_progress(n):
    """Drawn share (0..1) of a single dashed circle (stroke-dasharray = pathLength, animated dashoffset), else None."""
    kids = n.get('svgKids') or []
    if len(kids) != 1 or kids[0].get('tag') != 'circle':
        return None
    k = kids[0]
    try:
        length = float(k.get('len') or 0); dash = px(str(k.get('dash', '')).split(',')[0].split()[0], 0); off = px(k.get('off'), 0)
    except (ValueError, IndexError):
        return None
    if not length or not dash:
        return None
    return max(0.0, min(1.0, 1 - off / length))


def ring_svg(prog, w, h, stroke_units):
    """Arc of the entrance ring, starting at the top and turning clockwise (the CSS rotates the circle by −90°)."""
    import math
    cx = cy = 100; r = 96
    if prog >= 0.999:
        shape = '<circle cx="100" cy="100" r="96"/>'
    elif prog <= 0.001:
        shape = ''
    else:
        a = 2 * math.pi * prog - math.pi / 2
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        shape = '<path d="M100 4 A96 96 0 %d 1 %.3f %.3f"/>' % (1 if prog > 0.5 else 0, x, y)
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none" stroke="#1B1B1B" '
            'stroke-width="%g">%s</svg>' % (stroke_units or 1, shape))  # user units: the instance scale carries it


def icon_like(n, svg):
    """Small inline UI icons (24-unit viewBox, no own colours) are recoloured per instance like sprite icons."""
    return n['w'] <= 40 and n['h'] <= 40 and len(svg) < 1500 and 'fill="#' not in svg and 'stroke="#' not in svg


LABELS = {}


def parent_label(n):
    return LABELS.get(n['i'], '')


# ------------------------------------------------------------------ geometry helpers
def is_visual(n):
    s = n.get('s', {})
    bg = parse_color(s.get('bg'))
    if bg and bg[3] > 0.001:
        return True
    if s.get('bgImage'):
        return True
    if any(border_side(s.get(k)) for k in ('bT', 'bR', 'bB', 'bL')):
        return True
    if parse_shadows(s.get('shadow')) or parse_blur(s.get('backdrop')):
        return True
    if n['tag'] in ('svg', 'img', 'canvas', 'input', 'textarea', 'video', 'hr'):
        return True
    if n.get('before') or n.get('after'):
        b = n.get('before') or {}; a = n.get('after') or {}
        if any(parse_color(x.get('bg')) or x.get('bgImage') for x in (b, a)):
            return True
    return False


def clips(n):
    return n.get('s', {}).get('overflow', '') .split(' ')[0] in ('hidden', 'clip', 'auto', 'scroll')


def opacity(n):
    try:
        return float(n.get('s', {}).get('opacity', 1))
    except ValueError:
        return 1.0


def own_scale(n):
    """Uniform scale of the element's own CSS transform (computed as matrix(a, b, …)), 1 without one (16 Oct.)."""
    t = (n or {}).get('s', {}).get('transform') or ''
    m = re.match(r'matrix(3d)?\(\s*(' + NUM + r')\s*,\s*(' + NUM + r')', t)
    return (math.hypot(float(m.group(2)), float(m.group(3))) or 1.0) if m else 1.0


def own_matrix(n):
    """Rotation or mirror (a, b, c, d) of the element's own CSS transform, its scale removed (16 Oct.)."""
    t = (n or {}).get('s', {}).get('transform') or ''
    m = re.match(r'matrix\(\s*(' + NUM + r')\s*,\s*(' + NUM + r')\s*,\s*(' + NUM + r')\s*,\s*(' + NUM + r')', t)
    if not m:
        return (1.0, 0.0, 0.0, 1.0)
    a, b, c, d = (float(m.group(i)) for i in range(1, 5))
    sc = math.hypot(a, b) or 1.0
    return (a / sc, b / sc, c / sc, d / sc)


def keeps_grid(t):
    """18 Oct. (review): does a computed CSS transform leave the pixel grid of the texts in place? The identity, or a
    translation by whole pixels vertically (the letters of HORIZON, the bottom menu, the scope bar: translateX). In the
    reference captures their first baselines are snapped as without a transform (261 letters of 268 on a computer, the
    search results and the bottom menu on a phone too); a scale, a turn or a vertical fraction of a pixel moves it."""
    m = re.match(r'matrix\(' + r'\s*,'.join([r'\s*(' + NUM + r')'] * 6) + r'\s*\)$', t.strip())
    if not m:
        return False
    a, b, c, d, e, f = (float(v) for v in m.groups())
    return abs(a - 1) < 1e-6 and abs(b) < 1e-6 and abs(c) < 1e-6 and abs(d - 1) < 1e-6 and abs(f - round(f)) < 1e-6


def translation_y(t):
    """18 Oct. (review of the fixes): vertical offset of a computed CSS transform that only translates (0 for none), None
    for a scale, a turn or an unreadable value."""
    if not t or t == 'none':
        return 0.0
    m = re.match(r'matrix\(' + r'\s*,'.join([r'\s*(' + NUM + r')'] * 6) + r'\s*\)$', t.strip())
    if not m:
        return None
    a, b, c, d, e, f = (float(v) for v in m.groups())
    return f if abs(a - 1) < 1e-6 and abs(b) < 1e-6 and abs(c) < 1e-6 and abs(d - 1) < 1e-6 else None


def mat_mul(p, q):
    """2 × 2 linear parts (a, b, c, d) as CSS writes them: p applied after q."""
    return (p[0] * q[0] + p[2] * q[1], p[1] * q[0] + p[3] * q[1], p[0] * q[2] + p[2] * q[3], p[1] * q[2] + p[3] * q[3])


def tf_of(m):
    """[a, b, c, d] for render.js when the matrix turns or mirrors, else None."""
    r = [round(v, 4) + 0.0 for v in m]
    return None if (abs(r[0] - 1) < 1e-3 and abs(r[1]) < 1e-3 and abs(r[2]) < 1e-3 and abs(r[3] - 1) < 1e-3) else r


def border_width(v):
    """Width of a computed border even when its colour is transparent (absolute offsets start inside it)."""
    parts = (v or '').split()
    if not parts or 'none' in parts or 'hidden' in parts:
        return 0.0
    return px(parts[0])


def paddings(s):
    """CSS padding shorthand → [top, right, bottom, left] in px."""
    raw = (s.get('padding') or '0px').split()
    p = [px(v) for v in (raw + ['0px'] * 4)[:4]]
    return {1: [p[0]] * 4, 2: [p[0], p[1], p[0], p[1]], 3: [p[0], p[1], p[2], p[1]]}.get(len(raw), p)


# ------------------------------------------------------------------ text measurement (16 Oct.)
JOST_TTF = BASE.parent.parent / 'visualizations' / 'assets' / 'jost-0.ttf'   # static Jost Regular, as served to the site
_FONTS = {}


def measure_font(size):
    """Jost Regular at this size with the RAQM layout (Chrome's widths to 0.01 px), or None without it."""
    if size not in _FONTS:
        try:
            from PIL import ImageFont
            _FONTS[size] = ImageFont.truetype(str(JOST_TTF), size, layout_engine=ImageFont.Layout.RAQM)
        except (OSError, ImportError, AttributeError):
            _FONTS[size] = None
    return _FONTS[size]


def break_lines(txt, widths, f, ls=0.0):
    """Lines of a pre-line / pre-wrap text whose newlines the capture folded into spaces: words are given to each line
    until its measured width is reached. None when the measure is unavailable or does not fit."""
    font = measure_font(f['size']) if f['family'] == 'Jost' and f['weight'] == 400 and not f['italic'] else None
    if font is None:
        return None
    width = lambda s: font.getlength(s) + ls * len(s)
    words = txt.split(' ')
    out, i = [], 0
    for li, w in enumerate(widths):
        if i >= len(words):
            return None
        if li == len(widths) - 1:
            out.append(' '.join(words[i:])); break
        j = i + 1
        while j < len(words) and width(' '.join(words[i:j + 1])) <= w + 0.75:
            j += 1
        out.append(' '.join(words[i:j])); i = j
    return out if len(out) == len(widths) and all(out) else None


# 17 Oct.: the other weights of Jost served to the site, and Chrome's Arabic fallback
JOST_FILES = {400: JOST_TTF, 500: JOST_TTF.with_name('jost-1.ttf'), 600: JOST_TTF.with_name('jost-2.ttf')}
ARABIC_FILES = {400: '/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf', 700: '/usr/share/fonts/truetype/noto/NotoSansArabic-Bold.ttf'}


def measure_any(weight, size, arabic=False):
    """Font measuring a run of this weight (Jost 400/500/600, Noto Sans Arabic for Arabic text), or None."""
    files = ARABIC_FILES if arabic else JOST_FILES
    w = min(files, key=lambda k: abs(k - weight))
    key = (str(files[w]), size)
    if key not in _FONTS:
        try:
            from PIL import ImageFont
            _FONTS[key] = ImageFont.truetype(str(files[w]), size, layout_engine=ImageFont.Layout.RAQM)
        except (OSError, ImportError, AttributeError):
            _FONTS[key] = None
    return _FONTS[key]


def split_run(txt, widths, f, ls=0.0):
    """17 Oct.: text of each line of a run, from the measured width of each line (words are given to a line until its
    width is reached). Without a font to measure, the characters are shared in proportion to the widths, at spaces."""
    words = txt.split(' ')
    font = measure_any(f['weight'], f['size'], has_arabic(txt))
    if font is not None and len(words) >= len(widths):
        width = lambda s: font.getlength(s) + ls * len(s)
        out, i = [], 0
        for li, w in enumerate(widths):
            if li == len(widths) - 1:
                out.append(' '.join(words[i:])); break
            j = i + 1
            while j < len(words) and width(' '.join(words[i:j + 1])) <= w + 0.75:
                j += 1
            out.append(' '.join(words[i:j])); i = j
        if len(out) == len(widths) and all(out):
            return out
    total = sum(widths) or 1
    out, start = [], 0
    for li, w in enumerate(widths):
        if li == len(widths) - 1:
            out.append(txt[start:].strip()); break
        cut = start + round(len(txt) * w / total)
        sp = txt.rfind(' ', start, cut + 1)
        cut = sp if sp > start else cut
        out.append(txt[start:cut].strip()); start = cut
    return out


def next_word_threshold(txt, lines, f, ls=0.0):
    """17 Oct.: smallest width at which a word would come back to the line above (line + space + first word of the next
    line, without the letter spacing after its last letter), from the measured widths of the lines. None without a font
    to measure or when the cut does not match the lines."""
    font = measure_any(f['weight'], f['size'], has_arabic(txt))
    parts = split_run(txt, [l[2] for l in lines], f, ls)
    if font is None or len(parts) != len(lines) or not all(parts):
        return None
    vals = []
    for a, b in zip(parts, parts[1:]):
        s = a + ' ' + b.split(' ')[0]
        vals.append(font.getlength(s) + ls * (len(s) - 1))
    return min(vals) if vals else None


def clamp_text(txt, width, lines_max, f, ls=0.0):
    """17 Oct.: what Chrome shows of a text cut by -webkit-line-clamp: its own lines (words given to each line up to the
    box width), the last visible line followed by « … », letters removed only when the ellipsis does not fit. Figma's
    truncation fills the last line letter by letter instead (« imaginer une application… » for « imaginer une… »)."""
    font = measure_any(f['weight'], f['size'], has_arabic(txt))
    if font is None or not txt:
        return txt
    meas = lambda s: font.getlength(s) + ls * len(s)
    lines, cur = [], ''
    for w in txt.split(' '):
        cand = (cur + ' ' + w) if cur else w
        if not cur or meas(cand) <= width:   # « modifier et lancer les outils », 160.09 px in 160, goes to the next line
            cur = cand
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    if len(lines) <= lines_max:
        return txt
    last = lines[lines_max - 1]
    while last and meas(last + '…') > width:   # « imaginer une application… » is 160.12 px in 160: « applicatio… »
        last = last[:-1]
    return ' '.join(lines[:lines_max - 1] + [last.rstrip() + '…'])


# ------------------------------------------------------------------ paints / effects
# 18 Oct.: geometry of a shadow that changes with the theme (dark clones kept the light offset and blur: 0 9 22 instead
# of 0 12 26 for the glass controls, 0 5 18 instead of 0 8 26 for the globe markers, 0 22 64 / 0 28 90 instead of
# 0 16 48 for panels and dialogs). Each such field is bound to a FLOAT variable of « 42 · Couleurs » (modes Clair /
# Sombre, the collection the clones switch): (scene key, parse_shadows field, VariableBindableEffectField, folder).
EFFECT_FIELDS = (('x', 'x', 'offsetX', 'ombre-x'), ('y', 'y', 'offsetY', 'ombre-y'),
                 ('b', 'blur', 'radius', 'ombre-flou'), ('s', 'spread', 'spread', 'ombre-étalement'))
EFFECT_VARS = {}   # name → {'field', 'light', 'dark'}; layout.scenes() merges it into ../effect-vars.json


def fr_num(v):
    """9 → « 9 », 3.4 → « 3,4 », −10 → « −10 »: Figma refuses « . » in a variable name (see var_name)."""
    s = ('%.2f' % v).rstrip('0').rstrip('.')
    return s.replace('-', '−').replace('.', ',')


def effect_vars(sh, other, k):
    """{scene key: {'v': name}} for the fields of a paired shadow whose value differs between the themes, as emitted
    (× k, r2). sh: shadow of the dump the frame is built from; other: its pair in the other dump (light → dark, or
    dark → light under SWAP). Names « Effets/ombre-y/<clair>-<sombre> », like « dérivées/<rôle>/<clair>-<sombre> »."""
    out = {}
    for key, css, field, folder in EFFECT_FIELDS:
        a, b = r2(sh[css] * k), r2(other[css] * k)
        if abs(a - b) <= 0.005:
            continue
        lv, dv = (b, a) if SWAP else (a, b)
        name = 'Effets/%s/%s-%s' % (folder, fr_num(lv), fr_num(dv))
        EFFECT_VARS[name] = {'field': field, 'light': lv, 'dark': dv}
        out[key] = {'v': name}
    return out


def frame_paints(n, dn, k=1.0):
    """Paints and effects of one element. k: cumulative scale of the CSS transforms of the element and its ancestors;
    the boxes are measured scaled, the computed lengths (borders, radii, shadows, blur) are not (16 Oct.)."""
    s = n.get('s', {}); ds = (dn or {}).get('s', {})
    dcs = dark_colors(dn)
    fills = []
    gfills = []
    present = dn is not None
    # gradient layers paired layer by layer when both themes share their structure, else each theme keeps its own
    # layers, transparent in the other theme (16 Oct.)
    for g in gradient_layers(s.get('bgImage'), ds.get('bgImage') if present else None, present):
        if 'url' in g:
            gfills.append({'url': g['url'][:4000]}); continue
        st = []
        if g.get('px'):
            w_, h_ = (n.get('w') or 0) / k, (n.get('h') or 0) / k
            a_ = math.radians(g['angle'])
            g = {**g, 'stops': [[p_] + rest for p_, (_, *rest) in zip(
                resolve_stops(g['stops'], abs(w_ * math.sin(a_)) + abs(h_ * math.cos(a_)) if g['g'] == 'L' else math.hypot(w_, h_) / 2), g['stops'])]}
        for pos, c, d in g['stops']:
            ref = cref('dégradé', c, d)
            st.append([pos, hex_of(c)] + ([ref['v']] if 'v' in ref else []))
        gfills.append({'g': g['g'], 'a': g['angle'], 'c': g['center'], 'st': st})
    fills.extend(reversed(gfills))  # CSS lists the top layer first; Figma paints the bottom one first
    bg = parse_color(s.get('bg'))
    if bg and bg[3] > 0.001:
        fills.insert(0, cref('fond', bg, pick_dark('fond', 0, dcs, present)))
    elif ds and parse_color(ds.get('bg')) and parse_color(ds.get('bg'))[3] > 0.001:
        fills.insert(0, cref('fond', (0, 0, 0, 0), parse_color(ds.get('bg'))))   # background shown only in the dark theme
    out = {}
    if fills:
        out['f'] = fills
    sides = [border_side(s.get(k)) for k in ('bT', 'bR', 'bB', 'bL')]
    dsides = [border_side(ds.get(k)) for k in ('bT', 'bR', 'bB', 'bL')] if ds else [None] * 4
    if not any(sides) and any(dsides):
        # outline shown only in the dark theme: same width, transparent in the light mode
        first = next(b for b in dsides if b)
        out['s'] = cref('bordure', (0, 0, 0, 0), first[2])
        ws = [round(b[0] * k, 3) if b else 0 for b in dsides]
        out['sw'] = ws[0] if len(set(ws)) == 1 else ws
    if any(sides):
        first = next(b for b in sides if b)
        out['s'] = cref('bordure', first[2], pick_dark('bordure', 0, dcs, present))
        ws = [round(b[0] * k, 3) if b else 0 for b in sides]
        out['sw'] = ws[0] if len(set(ws)) == 1 else ws
        if first[1] in ('dashed', 'dotted'):
            out['sd'] = first[1]
    r = [v * k for v in radii(s.get('radius'), (n.get('w') or 0) / k, (n.get('h') or 0) / k)]
    if any(r):
        maxr = min(n['w'], n['h']) / 2
        r = [min(v, maxr) for v in r]
        out['r'] = r[0] if len(set(r)) == 1 else r
    eff = []
    dsh = parse_shadows(ds.get('shadow'))
    lsh = parse_shadows(s.get('shadow'))
    # inset and drop shadows are paired apart, by order (16 Oct.); light-only ones are transparent in the dark theme,
    # dark-only ones transparent in the light theme
    seen = {True: 0, False: 0}
    for sh in lsh:
        grp = [d for d in dsh if d['inset'] == sh['inset']]
        j = seen[sh['inset']]; seen[sh['inset']] += 1
        d = grp[j]['color'] if j < len(grp) else (CLEAR_DARK if present else None)
        fx = {'t': 'I' if sh['inset'] else 'D', 'x': r2(sh['x'] * k), 'y': r2(sh['y'] * k), 'b': r2(sh['blur'] * k), 's': r2(sh['spread'] * k),
              'c': cref('ombre', sh['color'], d)}
        gv = effect_vars(sh, grp[j], k) if j < len(grp) else None   # 18 Oct.: offset / blur / spread of the other theme
        if gv:
            fx['gv'] = gv
        eff.append(fx)
    for inset in (False, True):
        for sh in [d for d in dsh if d['inset'] == inset][seen[inset]:]:
            eff.append({'t': 'I' if inset else 'D', 'x': r2(sh['x'] * k), 'y': r2(sh['y'] * k), 'b': r2(sh['blur'] * k), 's': r2(sh['spread'] * k), 'c': cref('ombre', (0, 0, 0, 0), sh['color'])})
    blur = parse_blur(s.get('backdrop'))
    if blur:
        eff.append({'t': 'B', 'b': r2(blur * 2 * k)})  # Figma's background blur value is twice the CSS radius
    lblur = parse_blur(s.get('filter'))
    if lblur:
        eff.append({'t': 'L', 'b': r2(lblur * 2 * k)})
    if eff:
        out['e'] = eff
    o = opacity(n)
    if o < 0.999:
        out['o'] = round(o, 3)
    return out


def resolve_stops(stops, length):
    """17 Oct.: CSS stop positions along a gradient line of `length` px → 0..1: px positions divided by it, unpositioned
    stops spread evenly between their positioned neighbours (first 0, last 1), each at least the previous one."""
    pos = [((p[1] / length) if length else 0.0) if isinstance(p, tuple) else p for p, *_ in stops]
    n = len(pos)
    if not n:
        return []
    if pos[0] is None:
        pos[0] = 0.0
    if pos[-1] is None:
        pos[-1] = 1.0
    i = 1
    while i < n:
        if pos[i] is None:
            j = i
            while pos[j] is None:
                j += 1
            for m in range(i, j):
                pos[m] = pos[i - 1] + (pos[j] - pos[i - 1]) * (m - i + 1) / (j - i + 1)
            i = j
        i += 1
    for m in range(1, n):
        pos[m] = max(pos[m], pos[m - 1])
    return [round(min(1.0, max(0.0, v)), 4) for v in pos]


def pseudo_frame(ps, owner, which, dark_owner=None, k=1.0, fixed_ctx=None):
    """::before / ::after with a background or border → a frame positioned inside its owner.
    16 Oct.: the glass blur (backdrop-filter) is kept; absolute offsets start at the owner's padding box (inside its
    border, even a transparent one), and a pseudo-element with both offsets of an axis in px spans that box minus them;
    otherwise its size is the computed size plus its own borders. A pseudo-element that is not positioned is a flex item
    of its owner: when it is the only one, the owner's justify / align place it."""
    s = {'bg': ps.get('bg'), 'bgImage': ps.get('bgImage'), 'bT': ps.get('bT'), 'bR': ps.get('bR'), 'bB': ps.get('bB'),
         'bL': ps.get('bL'), 'radius': ps.get('radius'), 'shadow': ps.get('shadow'), 'opacity': ps.get('opacity', '1'), 'filter': ps.get('filter'),
         'backdrop': ps.get('backdrop')}
    dps = (dark_owner or {}).get(which)
    fake_dark = {'tag': 'div', 's': pseudo_style(dps)} if dps else ({'tag': 'div', 's': {}} if dark_owner is not None else None)
    if not (parse_color(s['bg']) or s['bgImage'] or any(border_side(s[k]) for k in ('bT', 'bR', 'bB', 'bL'))):
        return None
    own = [border_width(ps.get(b)) * k for b in ('bT', 'bR', 'bB', 'bL')]
    w, h = px(ps.get('w'), -1) * k + own[1] + own[3], px(ps.get('h'), -1) * k + own[0] + own[2]
    if w <= 0 or h <= 0:
        return None
    os_ = owner.get('s', {})
    ob = [border_width(os_.get(b)) * k for b in ('bT', 'bR', 'bB', 'bL')]
    pw, ph = owner['w'] - ob[1] - ob[3], owner['h'] - ob[0] - ob[2]   # owner's padding box
    positioned = ps.get('position') in ('absolute', 'fixed')
    def axis(a, b, size, total, start):
        pa, pb = str(ps.get(a, '')).endswith('px'), str(ps.get(b, '')).endswith('px')
        if pa and pb:
            va, vb = px(ps.get(a)) * k, px(ps.get(b)) * k
            return start + va, total - va - vb
        if pa:
            return start + px(ps.get(a)) * k, size
        if pb:
            return start + total - px(ps.get(b)) * k - size, size
        return None, size
    if ps.get('position') == 'fixed' and fixed_ctx:
        # 17 Oct.: a fixed pseudo-element is placed in the screen, not in its owner (#app::after, the fade under the
        # header: 166 px high on a phone, it spanned the whole page and hid the background). In a full-height frame it
        # follows the rule of the fixed layers (top half: at the top; lower half: at the bottom of the frame).
        vw_, vh_, H_, full_, ox_, oy_ = fixed_ctx
        x, w2 = axis('left', 'right', w, vw_, 0.0)
        y, h2 = axis('top', 'bottom', h, vh_, 0.0)
        if x is not None and y is not None:
            if full_ and H_ > vh_ and y > vh_ / 2:
                y += H_ - vh_
            x, y = x - ox_, y - oy_
    else:
        x, w2 = axis('left', 'right', w, pw, ob[3]) if positioned else (None, w)
        y, h2 = axis('top', 'bottom', h, ph, ob[0]) if positioned else (None, h)
    if x is None or y is None:
        # static: content box of the owner, flex alignment when the pseudo-element is its only item
        pad = [v * k for v in paddings(os_)]
        cx0, cy0 = ob[3] + pad[3], ob[0] + pad[0]
        cw, chh = pw - pad[1] - pad[3], ph - pad[0] - pad[2]
        m = re.match(r'(row|column)\S* \S+ j:(\S+) a:(\S+)', os_.get('flex') or '')
        alone = not owner.get('runs') and not owner.get('_kids')
        fx = fy = 0.0
        if not m and alone and (os_.get('display') or '') in ('grid', 'inline-grid'):
            fx = fy = 0.5   # 17 Oct.: marks of the check boxes, single-cell grids with place-items: center
        if m and alone:
            row = m.group(1) == 'row'
            main = {'center': 0.5, 'flex-end': 1.0, 'end': 1.0, 'right': 1.0}.get(m.group(2), 0.0)
            cross = {'center': 0.5, 'flex-end': 1.0, 'end': 1.0}.get(m.group(3), 0.0)
            if row and os_.get('dir') == 'rtl':
                main = 1.0 - main
            fx, fy = (main, cross) if row else (cross, main)
        if x is None:
            x = cx0 + (cw - w2) * fx
        if y is None:
            y = cy0 + (chh - h2) * fy
    w, h = w2, h2
    if w <= 0 or h <= 0:
        return None
    fake = {'w': w, 'h': h, 's': s}
    fr = {'t': 'F', 'n': ('Avant · ' if which == 'before' else 'Après · ') + node_name(owner), 'x': r2(x), 'y': r2(y), 'w': r2(w), 'h': r2(h)}
    fr.update(frame_paints(fake, fake_dark, k))
    tf = tf_of(own_matrix({'s': {'transform': ps.get('transform')}}))
    if tf:
        fr['tf'] = tf   # 17 Oct.: the check mark is a border corner turned by 45° around its centre
    return fr


# ------------------------------------------------------------------ text
def merge_line_rects(rects):
    """One rectangle per line (16 Oct., evening). Chrome returns one rectangle per bidirectional fragment of a line
    (« جوائز 42 », « 58 فرعًا · 30 دولة »): fragments whose vertical centres are within 2 px make one line, spanning
    them all; its top and height stay those of its first fragment (the primary font's content area)."""
    out = []
    for r in rects:
        if out and abs((r[1] + r[3] / 2) - (out[-1][1] + out[-1][3] / 2)) <= 2:
            last = out[-1]
            x0, x1 = min(last[0], r[0]), max(last[0] + last[2], r[0] + r[2])
            out[-1] = [x0, last[1], x1 - x0, last[3]]
        else:
            out.append(list(r))
    return out


def text_align(s, dirn):
    ta = s.get('ta', 'start')
    if ta in ('center', '-webkit-center'):
        return 'CENTER'
    if ta in ('right', '-webkit-right') or (ta == 'start' and dirn == 'rtl') or (ta == 'end' and dirn == 'ltr'):
        return 'RIGHT'
    if ta == 'justify':
        return 'JUSTIFIED'
    return 'LEFT'


# 17 Oct.: characters that Jost lacks and that Figma would draw as colour emoji (Chrome falls back to DejaVu Sans,
# monochrome, in the text colour): « ☺ Emoji » of the comment forms, « Voir le dépôt ↗ ». They are drawn as vector
# components of the DejaVu Sans outlines, like the digits of the scan.
SYMBOLS = {'\u263a': 'sourire', '\u2197': 'flèche nord-est'}
# 18 Oct.: the font Chrome falls back on for each symbol. The site's stack reaches Arial, which fontconfig maps to
# Liberation Sans: it has ☺ (advance 1.021 em, the 14.30 px measured in the captures at 14 px) but not ↗, which goes on
# to DejaVu Sans (checked against the glyph drawn in the 2× capture of the comment form, Chroniques v5)
SYMBOL_FONTS = {'\u263a': ('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 'Liberation Sans', 'liberation-sans'),
                '\u2197': ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 'DejaVu Sans', 'dejavu-sans')}
SYMBOLS_USED = {}
_DEJAVU = {}


def symbol_ref(ch):
    """(component ref, advance, ascent, height) in em of a symbol drawn in Chrome's fallback font (SYMBOL_FONTS); the
    component is listed in SYMBOLS_USED."""
    from font_outlines import TTF, svg_path
    import pathlib
    path, family, slug_ = SYMBOL_FONTS[ch]
    if path not in _DEJAVU:
        _DEJAVU[path] = TTF(pathlib.Path(path))
    f = _DEJAVU[path]
    gid = f.cmap[ord(ch)]
    contours, _ = f.contours(gid)
    adv, asc, dsc = f.advance(gid), f.ascent, -f.descent
    ref = 'glyph:%s-%04x' % (slug_, ord(ch))
    em = 100.0 / f.upm   # components drawn at 100 px per em (the scan digits, at font size, were 2 384 px high)
    SYMBOLS_USED[ref] = {'svg': '<svg xmlns="http://www.w3.org/2000/svg" width="%g" height="%g" viewBox="0 0 %d %d"><path fill="#1B1B1B" d="%s"/></svg>'
                         % (round(adv * em, 3), round((asc + dsc) * em, 3), adv, asc + dsc, svg_path(contours, dy=asc)),
                         'name': 'Symbole/%s · %s (U+%04X)' % (family, SYMBOLS[ch], ord(ch)), 'kind': 'Symbole', 'w': adv, 'h': asc + dsc, 'ctx': [],
                         'family': family}
    return ref, adv / f.upm, asc / f.upm, (asc + dsc) / f.upm


def rlm(text):
    """17 Oct.: Figma takes the direction of a paragraph from its first strong letter; an Arabic paragraph that opens
    with a Latin word (« ft_transcendence · نبني معًا… ») was laid out left to right. A right-to-left mark in front keeps
    the browser's order (Arabic texts only)."""
    if not text or text.startswith(RLM) or not has_arabic(text):
        return text
    m = re.search(r'[A-Za-z\u00c0-\u024f\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]', text)
    return RLM + text if (m and not has_arabic(m.group(0))) else text


RLM = '\u200f'


def text_nodes(n, dn, strings, origin, rtl, parent=None, k=1.0, bdir=None, snap=False, snap_off=None, in_map=False, dpr=1):
    """One TEXT layer per text run of the element, positioned from its measured line boxes (k: transform scale)."""
    s = n.get('s', {})
    f = parse_font(s.get('font'))
    if abs(k - 1) > 0.002:
        f = {**f, 'size': round(f['size'] * k, 3), 'lh': round(f['lh'] * k, 3) if f['lh'] else None}
    out = []
    dcs = dark_colors(dn)
    col = parse_color(s.get('color')) or (0, 0, 0, 1)
    dark_col = pick_dark('texte', 0, dcs)
    if n.get('_ph'):
        col, dark_col = n['_ph']   # 17 Oct.: placeholder of a text field, in the page's muted colour
    lsv = px(s.get('ls')) * k if s.get('ls') not in (None, 'normal') else 0.0
    clamp = s.get('lineClamp')
    clamped = None
    if clamp and clamp not in ('none',):
        try:
            clamped = int(clamp)
        except ValueError:
            clamped = None
    ellipsis = s.get('textOverflow') == 'ellipsis'

    def chrome_baseline(top):
        """18 Oct. (review): Chrome's first baseline of a line whose content area starts at `top` (rule of emit()), None
        when the texts of this element are not put on the pixel grid."""
        if not (snap and abs(k - 1) < 0.002 and f['family'] in ASCENT):
            return None
        R = math.floor(ASCENT[f['family']][0] * f['size'] + 0.5)
        if not snap_off and not in_map:
            return math.floor(round(top * 64) / 64 + R + 0.5)
        # 18 Oct. (review of the fixes): under translations only (snap_off, their vertical sum), Chrome snaps the baseline
        # in the element's own space, then to the device pixels; in .hg-map the holder .hg-pin (0 x 0, not captured) adds
        # its half pixel (integrated-globe.mjs: translate(round(y * 2) / 2 px)), read from the line's top. Exact on the
        # 92 labels of the globe markers measured in the captures (0.004 px at most); a whole offset gives the rule above
        off = snap_off or 0.0
        if in_map:
            off += (top - off) - math.floor(top - off + 1e-6)
        return math.floor((math.floor(round((top - off) * 64) / 64 + R + 0.5) + off) * dpr + 0.5) / dpr

    def emit(txt, lines, sv):
        nl = len(lines)
        fnt = figma_font(f['family'], f['weight'], f['italic'], txt)
        ar = has_arabic(txt)
        if nl > 1 and not ar and not sv and s.get('whiteSpace') in ('pre', 'pre-line', 'pre-wrap', 'break-spaces'):
            # 16 Oct.: newlines kept by the page (addresses, comments) were folded by the capture: found again from the
            # measured width of each line
            split = break_lines(txt, [l[2] for l in lines], f, lsv)
            if split:
                txt = '\n'.join(split)
        if f['lh']:
            # The run rectangles are font content areas; the line box is centred on them (half-leading).
            lh = f['lh']
            top = lines[0][1] + lines[0][3] / 2 - lh / 2
        else:
            # line-height: normal (16 Oct.). The rectangle is the content area of the primary font: its top lies one
            # primary ascent above the baseline. Figma's automatic line height puts the baseline one ascent of the
            # tallest font of the line below the top (Noto Sans Arabic, 1.374 em, for Arabic text set in Jost).
            asc_p = ASCENT.get(fnt['family'], (None,))[0]
            asc_l = max(asc_p, ASCENT['Noto Sans Arabic'][0]) if (asc_p and ar and fnt['family'] != 'Noto Sans Arabic') else asc_p
            lh = lines[0][3]
            top = lines[0][1] + ((asc_p - asc_l) * f['size'] if asc_p else 0)
        bc = chrome_baseline(lines[0][1]) if fnt['family'] in ASCENT else None
        if bc is not None:
            # 18 Oct.: Chrome draws the first baseline on the pixel grid, the primary font's ascent rounded first
            # (floor(top of the content area + round(ascent × size) + 0.5)); the text moves by what its Figma baseline
            # lacks (later lines keep Figma's even spacing, at most 0.5 px off: audit of the remaining gaps, step 5)
            A0f, A1f = ASCENT[fnt['family']]
            bfig = (lh / 2 + (A0f - A1f) / 2 * f['size']) if f['lh'] else (asc_l or A0f) * f['size']
            if abs(bc - (top + bfig)) < 1:
                top += bc - (top + bfig)
        t = {'t': 'T', 'x': r2(min(l[0] for l in lines) - origin[0]), 'y': r2(top - origin[1]), 'tx': txt,
             'fn': [fnt['family'], fnt['style']], 'fs': f['size'], 'lh': r2(lh) if f['lh'] else None,
             'col': cref('texte', col, dark_col), 'al': text_align(s, s.get('dir', 'ltr'))}
        if s.get('ls'):
            t['ls'] = round(lsv, 3)
        tt = s.get('tt')
        if tt in ('uppercase', 'lowercase', 'capitalize'):
            t['tc'] = {'uppercase': 'UPPER', 'lowercase': 'LOWER', 'capitalize': 'TITLE'}[tt]
        if 'tabular-nums' in (s.get('fvn') or '') and re.search(r'[0-9]', txt):
            t['tn'] = 1   # 18 Oct.: tabular figures (font-variant-numeric), a text style made by hand in Figma (render.js)
        if s.get('deco') and 'underline' in s['deco']:
            t['td'] = 'UNDERLINE'
        if s.get('deco') and 'line-through' in s['deco']:
            t['td'] = 'STRIKETHROUGH'
        if t.get('td'):
            # 18 Oct.: colour, offset and thickness of the decoration when the site sets them (« Réinitialiser » of the
            # filter windows: var(--cp-line), 4 px under the text); the colour pairs with the dark capture like a border
            if s.get('decoColor'):
                dds = (dn or {}).get('s', {}) if dn else {}
                t['tdc'] = cref('bordure', parse_color(s['decoColor']), parse_color(dds.get('decoColor') or dds.get('color')) if dds else None)
            if t['td'] == 'UNDERLINE' and s.get('skipInk') == 'none':
                t['tsk'] = 0   # 18 Oct.: the descenders cross the line (Chrome skips them by default, auto)
            if t['td'] == 'UNDERLINE':
                # 18 Oct.: same line as Chrome. Chrome puts the top edge of an underline at the baseline + its offset,
                # snapped to the pixel like the glyphs, with an automatic thickness of max(⌊size / 10⌋, 1); Figma
                # measures textDecorationOffset from its baseline to the top edge, the thickness growing downwards
                # and without rounding (calibrated on Jost 100 px: offsets 0 and 20 px end at baseline + 10 and + 30
                # with a 10 px line, 20.37 at + 30.37). The offset given to Figma is the snapped top edge minus the
                # baseline of this text box.
                fs_ = f['size']
                uo, dw = s.get('uOffset') or '', s.get('decoW') or ''
                th = float(dw[:-2]) if dw.endswith('px') else max(1.0, fs_ / 10)
                thick = max(1, round(th)) if dw.endswith('px') else max(1, math.floor(th))
                if uo.endswith('px') or dw.endswith('px') or s.get('decoColor'):
                    a_ = math.floor(ASCENT['Jost'][0] * fs_ + 0.5)
                    off = float(uo[:-2]) if uo.endswith('px') else max(1, math.ceil(th / 2))
                    U = math.floor(lines[0][1] + a_ + off + 0.5)
                    B = top + ((lh / 2 + (ASCENT['Jost'][0] - ASCENT['Jost'][1]) / 2 * fs_) if f['lh'] else (asc_l or ASCENT['Jost'][0]) * fs_)
                    t['tdo'] = r2(U - B)
                    t['tdw'] = thick
        if nl == 1 and not clamped:
            # 16 Oct.: one line never wraps in Figma either. Its box is the measured line, placed by the alignment around
            # an automatic width (aw); the ellipsis stays only where the browser did cut the text, i.e. when the line is
            # wider than the content box (the 522 French texts with an ellipsis all fit, ±0.11 px)
            cl, cr = content_box_x(n, parent)
            if ellipsis and lines[0][2] > (cr - cl) + 0.5:
                t['x'] = r2(cl - origin[0]); t['w'] = r2(cr - cl); t['ar'] = 'H'; t['ml'] = 1
            elif t['al'] in ('CENTER', 'RIGHT') or ellipsis:
                t['x'] = r2(lines[0][0] - origin[0]); t['w'] = r2(lines[0][2]); t['aw'] = 1
        elif nl > 1 or clamped:
            # wrap exactly where the browser wrapped: the text box spans the content box it flowed in (16 Oct.;
            # the former 1.5 px margin let a title of 247.3 px stay on one line in a 246 px box). A clamped text on one
            # line takes that box too (16 Oct., evening): with the measured width alone, the last word of the card
            # titles of Projets went to a second line that the clamp hid.
            cl, cr = content_box_x(n, parent)
            lo = min(l[0] for l in lines); hi = max(l[0] + l[2] for l in lines)
            x0 = lo if t['al'] in ('LEFT', 'JUSTIFIED') else min(cl, lo)
            x1 = hi if t['al'] == 'RIGHT' else max(cr, hi)
            t['x'] = r2(x0 - origin[0]); width = x1 - x0
            # 18 Oct.: Figma counts a negative letter spacing after the last letter, Chrome does not (« Ce qui relie nos
            # messages » needed 299.82 px in a 299.23 px box and lost its last word, Projets v5 P2); the room goes on
            # the side the alignment leaves free, so a right-aligned (Arabic) text keeps its right edge
            extra = 0.4 + max(0.0, -t.get('ls', 0.0))
            t['w'] = r2(width + extra)
            if t['al'] == 'RIGHT':
                t['x'] = r2(x0 - extra - origin[0])
            elif t['al'] == 'CENTER':
                t['x'] = r2(x0 - extra / 2 - origin[0])
            t['ar'] = 'H'
            if clamped:
                # 17 Oct.: the visible text is written out (same cut in the three languages, each measured in its font)
                vis = clamp_text(txt, cr - cl, clamped, f, lsv)
                if vis != txt:
                    t['tx'] = vis
                    if sv and sv.get('en') and sv.get('ar'):
                        en, ar_ = clamp_text(sv['en'], cr - cl, clamped, f, lsv), clamp_text(sv['ar'], cr - cl, clamped, f, lsv)
                        sv = {'n': sv['n'].split('/', 1)[0] + '/' + var_name('', vis).split('/', 1)[1], 'fr': vis, 'en': en, 'ar': ar_, 'dar': sv.get('dar')}
                    else:
                        sv = None
                elif nl < clamped:
                    # 18 Oct.: a clamped text the browser laid out on fewer lines than its clamp keeps that number of
                    # lines in Figma (render.js fitLines, as for the paragraphs)
                    t['nl'] = nl; t['wmin'] = r2(max(l[2] for l in lines)); t['wmax'] = r2(width + 2 + max(0.0, -t.get('ls', 0.0)))
                t['ml'] = clamped
            elif nl > 1:
                # 16 Oct.: render.js keeps the browser's number of lines (Figma's Jost and Noto Sans Arabic are a
                # little wider or narrower), moving the width between the longest line and the box + 2 px
                t['nl'] = nl; t['wmin'] = r2(max(l[2] for l in lines)); t['wmax'] = r2(width + 2)
                # 16 Oct., evening: a left-aligned paragraph starts at its longest line (+0.3 px) rather than at the
                # box, so a word the browser sent to the next line (« …avec / des », 302.26 px in 302) goes too;
                # render.js widens it when Figma needs more room. 17 Oct.: Figma counts a negative letter spacing
                # after the last letter of a line, Chrome does not (« Montrer ce qui n’est » went to 233.4 px in a
                # 232.99 px box): that spacing is added back. A right-aligned paragraph (Arabic) gets the same tight
                # box, anchored at its right edge (it kept the whole box and took one word more per line).
                slack = 0.3 + max(0.0, -t.get('ls', 0.0))
                wbox = t['wmin'] + slack
                # 17 Oct., evening: halfway between the longest line and the width at which the first word of a
                # line would come back to the line above (about ±24 px of room instead of 0.3 px; vérification des
                # Chroniques v2, § 7)
                # (Latin text only: Figma sets Noto Sans Arabic narrower than Chrome, the tight box stays safer there)
                thr = next_word_threshold(txt, lines, f, lsv) if ('\n' not in txt and not ar) else None
                if thr:
                    wbox = max(wbox, min(t['wmax'], (t['wmin'] + max(0.0, -t.get('ls', 0.0)) + thr) / 2))
                if t['al'] in ('LEFT', 'JUSTIFIED'):
                    t['w'] = r2(wbox)
                elif t['al'] == 'RIGHT':
                    t['w'] = r2(wbox); t['x'] = r2(hi - wbox - origin[0])
        if txt in ('·', '•', '|', '/', '›', '‹', '—', '–', '-') and nl == 1 and 'w' not in t:
            # older captures measured separators with their surrounding spaces: centre them in the measured box
            t['w'] = r2(lines[0][2]); t['x'] = r2(lines[0][0] - origin[0]); t['al'] = 'CENTER'; t['ar'] = 'H'
        if ar:
            t['rtl'] = 1   # Arabic ranges in Noto Sans Arabic, like the browser's fallback (any page direction)
        if s.get('dir') == 'rtl' and ar:
            t['tx'] = rlm(t['tx'])
        if sv and sv.get('ar'):
            if sv.get('dar', 'rtl') == 'rtl':
                sv['ar'] = rlm(sv['ar'])
            elif rlm(sv['ar']) != sv['ar']:
                sv = {**sv, 'n': sv['n'] + ' · LTR'}
        if sv:
            t['sv'] = {k_: v_ for k_, v_ in sv.items() if k_ != 'dar'}
        return t

    def with_symbols(txt, line, sv):
        """A one-line run holding a SYMBOLS character: the symbols as DejaVu Sans components on the baseline, the rest as
        texts, laid out from the start of the measured line (its end in a right-to-left run)."""
        parts = [p for p in re.split('([' + ''.join(SYMBOLS) + '])', txt) if p]
        font = measure_any(f['weight'], f['size'], has_arabic(txt))
        fs = f['size']
        widths = []
        for p_ in parts:
            if p_ in SYMBOLS:
                widths.append(symbol_ref(p_)[1] * fs)
            else:
                widths.append((font.getlength(p_) if font else 0.55 * fs * len(p_)) + lsv * len(p_))
        k_ = line[2] / sum(widths) if sum(widths) > 0 else 1.0   # absorbs the last tenths of a pixel of Chrome's layout
        rtl_ = s.get('dir') == 'rtl'
        x = line[0] + line[2] if rtl_ else line[0]
        base = line[1] + ASCENT['Jost'][0] * fs
        bc = chrome_baseline(line[1])
        if bc is not None and abs(bc - base) < 1:
            base = bc   # 18 Oct. (review): the baseline emit() gives the texts beside it (« ☺ Emoji »)
        res = []
        strip = lambda v: re.sub('[' + ''.join(SYMBOLS) + ']', '', v or '').strip()
        for p_, w_ in zip(parts, widths):
            w_ *= k_
            x0 = x - w_ if rtl_ else x
            if p_ in SYMBOLS:
                ref, adv, asc, hh = symbol_ref(p_)
                res.append({'t': 'S', 'n': 'Symbole ' + p_, 'ref': ref, 'x': r2(x0 - origin[0]), 'y': r2(base - asc * fs - origin[1]),
                            'w': r2(adv * fs), 'h': r2(hh * fs), 'col': cref('texte', col, dark_col), 'st': 0})
            elif p_.strip():
                lead = (font.getlength(p_[:len(p_) - len(p_.lstrip())]) if font else 0) * k_
                trail = (font.getlength(p_[len(p_.rstrip()):]) if font else 0) * k_
                seg = [x0 + (trail if rtl_ else lead), line[1], max(1.0, w_ - lead - trail), line[3]]
                sv_ = None
                if sv and sv.get('en') and sv.get('ar') and len(parts) > 1:
                    fr_ = strip(sv.get('fr', txt))
                    if len({fr_, strip(sv['en']), strip(sv['ar'])}) > 1:
                        sv_ = {'n': sv['n'].split('/', 1)[0] + '/' + var_name('', fr_).split('/', 1)[1], 'fr': fr_, 'en': strip(sv['en']), 'ar': strip(sv['ar'])}
                res.append(emit(p_.strip(), [seg], sv_))
            x = x - w_ if rtl_ else x + w_
        return res

    for ri, run in enumerate(n.get('runs', [])):
        txt = run['t']
        lines = merge_line_rects(run.get('l') or [[run['x'], run['y'], run['w'], run['h']]])
        sv = strings.get((n.get('k'), ri)) if strings else None
        if len(lines) == 1 and any(c in SYMBOLS for c in txt):
            out.extend(with_symbols(txt, lines[0], sv))
            continue
        if len(lines) > 1 and not clamped:
            first, rest = lines[0], lines[1:]
            if (bdir or s.get('dir')) == 'rtl':
                mid = first[0] + first[2] < max(l[0] + l[2] for l in rest) - 1.5
            else:
                mid = first[0] > min(l[0] for l in rest) + 1.5
            if mid:
                # 17 Oct.: an inline run that starts in the middle of a line and goes on to the next (a campus name
                # after « 42 Paris · », a comment's words after an @mention) cannot be one Figma text: Figma starts every
                # line at the same edge, and the first words were drawn over the start of the line. Each line becomes its
                # own one-line text, cut from the measured width of the line; the translations are not bound there.
                for part, ln in zip(split_run(txt, [l[2] for l in lines], f, lsv), lines):
                    if part:
                        out.append(emit(part, [ln], None))
                continue
        out.append(emit(txt, lines, sv))
    return out


# ------------------------------------------------------------------ auto-layout detection
def flex_layout(n, kids):
    """Return Figma auto-layout settings if the measured children positions match a simple flex row/column."""
    s = n.get('s', {})
    fl = s.get('flex')
    if not fl or len(kids) < 2 or n.get('cls', '').find('grid') >= 0:
        return None
    m = re.match(r'(row|column)(?:-reverse)? (\w+(?:-\w+)?) j:(\S+) a:(\S+)', fl)
    if not m:
        return None
    direction, wrap, justify, align = m.groups()
    if wrap != 'nowrap' or s.get('position') in ('absolute', 'fixed'):
        return None
    pad = [px(v) for v in (s.get('padding', '0px').split() + ['0px'] * 4)[:4]]
    if len(s.get('padding', '0px').split()) == 1:
        pad = [pad[0]] * 4
    elif len(s.get('padding', '0px').split()) == 2:
        pad = [pad[0], pad[1], pad[0], pad[1]]
    elif len(s.get('padding', '0px').split()) == 3:
        pad = [pad[0], pad[1], pad[2], pad[1]]
    # 16 Oct., evening: CSS lays the children inside the border; Figma's auto-layout ignores the stroke
    # (strokesIncludedInLayout is false), so the border goes into the padding
    pad = [p + border_width(s.get(b)) for p, b in zip(pad, ('bT', 'bR', 'bB', 'bL'))]
    horiz = direction == 'row'
    rtl = s.get('dir') == 'rtl' and horiz
    ordered = sorted(kids, key=lambda k: (k['x'] if not rtl else -k['x'] - k['w']) if horiz else k['y'])
    gaps = []
    for a, b in zip(ordered, ordered[1:]):
        gaps.append((b['x'] - (a['x'] + a['w'])) if (horiz and not rtl) else ((a['x'] - (b['x'] + b['w'])) if horiz else (b['y'] - (a['y'] + a['h']))))
    if min(gaps) < -0.5:
        return None
    spread = max(gaps) - min(gaps)
    if justify == 'space-between' and len(kids) >= 2:
        primary = 'SPACE_BETWEEN'; gap = 0
    else:
        if spread > 1.5:
            return None
        gap = round(sum(gaps) / len(gaps), 2)
        primary = {'center': 'CENTER', 'flex-end': 'MAX', 'end': 'MAX', 'right': 'MAX'}.get(justify, 'MIN')
        if rtl and justify not in ('center', 'left', 'right'):
            # 17 Oct.: the start of a right-to-left row is its right edge (rows of authors packed to the left in Arabic)
            primary = 'MIN' if primary == 'MAX' else 'MAX'
    # cross axis
    def cross(k):
        return (k['y'], k['y'] + k['h']) if horiz else (k['x'], k['x'] + k['w'])
    lo = (n['y'] + pad[0]) if horiz else (n['x'] + pad[3])
    hi = (n['y'] + n['h'] - pad[2]) if horiz else (n['x'] + n['w'] - pad[1])
    mid = (lo + hi) / 2
    if all(abs((cross(k)[0] + cross(k)[1]) / 2 - mid) < 1.2 for k in kids):
        counter = 'CENTER'
    elif all(abs(cross(k)[0] - lo) < 1.2 for k in kids):
        counter = 'MIN'
    elif all(abs(cross(k)[1] - hi) < 1.2 for k in kids):
        counter = 'MAX'
    else:
        return None
    return {'d': 'H' if horiz else 'V', 'g': gap, 'p': [r2(v) for v in pad], 'pa': primary, 'ca': counter, 'rtl': 1 if rtl else 0}


# ------------------------------------------------------------------ conversion
AREA_FR = {'entrance': 'Arrivée', 'explorer': 'Explorer', 'projects': 'Projets', 'profiles': 'Profils', 'shell': 'Commun',
           'journal': 'Chroniques', 'awards': 'Awards', 'account': 'Compte', '_pipeline': 'Projets'}


def var_name(area, fr):
    """Figma variable names refuse « . », « { », « } » (alias syntax) and some symbols: replace them by look-alikes."""
    s = slug(fr, 40)
    s = s.replace('.', '․').replace('{', '(').replace('}', ')').replace('$', '＄').replace('\\', '∖').strip() or '—'
    return '%s/%s' % (AREA_FR.get(area, area), s)


def pair_strings(base, others, area, same=None):
    """(element key, run index) → {'n': variable name, 'fr', 'en', 'ar'} for texts present in every language.
    18 Oct. (review): `same` receives the keys of the texts that read alike in every language."""
    out = {}
    for n in base['nodes']:
        runs = n.get('runs')
        if not runs:
            continue
        vals = {}
        dar = None
        for lang, d in others.items():
            if d is None:
                continue
            on = d['byKey'].get(n['k'])
            if not on or not on.get('runs') or len(on['runs']) != len(runs) or on.get('cls') != n.get('cls'):
                continue
            if bool(on.get('_bdim')) != bool(n.get('_bdim')):
                # 18 Oct. (review): a line merged by bdi_runs in one capture only (« Explore » for « Explorer 42 Paris »)
                continue
            vals[lang] = [r['t'] for r in on['runs']]
            if lang == 'ar':
                dar = (on.get('s') or {}).get('dir')
        for ri, run in enumerate(runs):
            entry = {lang: vals[lang][ri] for lang in vals}
            if len(entry) < 3:
                continue
            if entry['fr'] == entry['en'] == entry['ar']:
                if same is not None:
                    same.add((n['k'], ri))   # 18 Oct. (review): never bound, not even by the fallback of _convert
                continue  # numbers, names: identical in every language, no variable needed
            entry['n'] = var_name(area, entry['fr'])
            if 'ar' in vals:
                entry['dar'] = dar
            out[(n['k'], ri)] = entry
    return out


_DG = json.loads((BASE / 'assets' / 'entrance' / 'dejavu-sans-mono-digits.json').read_text()) if (BASE / 'assets' / 'entrance' / 'dejavu-sans-mono-digits.json').exists() else None
DIGITS = _DG['glyphs'] if _DG else {}
DIGITS_META = _DG or {}


def digit_svg(d, asc, dsc):
    """Glyph outline in font units, baseline at y = ascent, inside its advance × (ascent + descent) box."""
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d"><path transform="translate(0 %d)" '
            'fill="#1B1B1B" d="%s"/></svg>' % (d['advance'], asc + dsc, d['advance'], asc + dsc, asc, d['path']))


GLOBES = BASE / 'assets' / 'globe'


def globe_asset(dump, fmt, n=None, byI=None):
    """Vector globe drawn by globe_svg.py for the captured view (world or country); campus street views stay rasters.
    16 Oct.: the canvas of the campus map window is that street view whatever the page's route."""
    a = byI.get(n['p']) if (n is not None and byI) else None
    while a is not None:
        if a.get('id') in ('campus-map-dialog', 'campus-map-viewport') or 'campus-map-viewport' in (a.get('cls') or '').split():
            return None
        a = byI.get(a['p'])
    url = dump.get('url', '')
    route = url.split('#', 1)[1] if '#' in url else ''
    if 'campus=' in route:
        return None
    name, label = ('globe-monde--%s' % fmt, 'Monde · %s' % ('ordinateur' if fmt == 'desktop' else 'mobile'))
    if 'country=' in route:
        code = route.split('country=')[1].split('&')[0].lower()
        if code in ('fr', 'fra', 'france'):   # the routes use ISO 3166 alpha-3 (country=FRA)
            name, label = 'globe-pays-france--%s' % fmt, 'Pays · France · %s' % ('ordinateur' if fmt == 'desktop' else 'mobile')
        else:
            return None
    path = GLOBES / (name + '.svg')
    return ('globe:' + name, label) if path.exists() else None


def load_canvas(area, state, fmt, lang, theme):
    p = BASE / 'dom' / area / f'{state}--{fmt}--{lang}-{theme}.canvas.json'
    return json.loads(p.read_text()) if p.exists() else None


# States captured with the mobile section picker (<details>) open (16 Oct., late)
OPEN_DETAILS_STATES = ('project-local-menu', 'profile-local-menu')


# Text shown by a closed <select> (16 Oct.): the capture keeps no <option>; nothing is chosen in the captured states, so
# the first option shows (reference/explorer/index.json checks.popover; content-report.mjs « choose »)
SELECT_LABELS = {
    'scope-selectors-1-country': {'fr': 'Tous les pays', 'en': 'All countries', 'ar': 'جميع الدول'},
    'scope-selectors-1-campus': {'fr': 'Tous les campus', 'en': 'All campuses', 'ar': 'جميع الفروع'},
    'content-report-1-reason': {'fr': 'Choisissez un motif', 'en': 'Choose a reason', 'ar': 'اختر سببًا'},
}


def select_runs(dump):
    """Adds to each known closed <select> of a dump the run Chrome draws: text 4 px inside the padding (after the start
    border and padding), its line box centred in the content box; the arrow is added by convert()."""
    if dump is None:
        return
    lang = (dump.get('lang') or 'fr')[:2]
    for n in dump['nodes']:
        if n['tag'] != 'select' or n.get('runs') or n.get('id') not in SELECT_LABELS:
            continue
        label = SELECT_LABELS[n['id']].get(lang)
        if not label:
            continue
        s = n.get('s', {})
        f = parse_font(s.get('font'))
        fs = f['size']
        bw = [border_width(s.get(b)) for b in ('bT', 'bR', 'bB', 'bL')]
        pad = paddings(s)
        ar = has_arabic(label)
        asc_l, dsc_l = (max(ASCENT['Jost'][0], ASCENT['Noto Sans Arabic'][0]), max(ASCENT['Jost'][1], ASCENT['Noto Sans Arabic'][1])) if ar else ASCENT['Jost']
        top = n['y'] + bw[0] + pad[0]
        ch = n['h'] - bw[0] - bw[2] - pad[0] - pad[2]
        base_y = top + (ch - (asc_l + dsc_l) * fs) / 2 + asc_l * fs
        font = measure_font(fs)
        w = font.getlength(label) if (font and not ar) else 0.55 * fs * len(label)
        y = base_y - ASCENT['Jost'][0] * fs
        h = (ASCENT['Jost'][0] + ASCENT['Jost'][1]) * fs
        if s.get('dir') == 'rtl':
            x = n['x'] + n['w'] - bw[1] - pad[1] - 4 - w
        else:
            x = n['x'] + bw[3] + pad[3] + 4
        n['runs'] = [{'t': label, 'x': round(x, 2), 'y': round(y, 2), 'w': round(w, 2), 'h': round(h, 2), 'l': [[round(x, 2), round(y, 2), round(w, 2), round(h, 2)]]}]
        n['_select'] = 1


def select_arrow_origin(n):
    """18 Oct.: top-left corner (page px) of the centre line of the arrow Chrome 155 paints in a closed <select>
    (appearance auto). Blink snaps the border box (ToPixelSnappedRect: edges rounded half up), then
    ThemePainterDefault::SetupMenuListArrow puts an 8 px arrow in a 15 px box (scrollbar button width) next to the
    inline-end border, the int conversion truncating: x = right - ⌊border-right⌋ - 12 (LTR), left + ⌊border-left⌋ + 3
    (RTL); NativeThemeBase::PaintMenuList draws the open « V » from (x, top) through (x + 4, top + 4) to (x + 8, top),
    top = snapped top + ⌊snapped height / 2⌋ - 2, stroked 2 px with butt caps and a miter join (Skia defaults).
    Checked on the 32 captured selects (dpr 1 and 2, LTR and RTL) and at ×8 / ×16 in Chrome."""
    s = n.get('s', {})
    rnd = lambda v: math.floor(v + 0.5)
    X, Y = rnd(n['x']), rnd(n['y'])
    W, H = rnd(n['x'] + n['w']) - X, rnd(n['y'] + n['h']) - Y
    if s.get('dir') == 'rtl':
        ax = X + math.floor(border_width(s.get('bL'))) + 3
    else:
        ax = X + W - math.floor(border_width(s.get('bR'))) - 12
    return ax, Y + H // 2 - 2


# 17 Oct.: text of a text field (typed value, else its placeholder), which the capture keeps in n['text'] without runs
FIELD_SKIP = ('checkbox', 'radio', 'range', 'color', 'file', 'hidden', 'submit', 'button', 'image', 'reset')


PLACEHOLDER_MUTED = {'cp-comments-form', 'cp-search', 'dock-search-input'}


def ancestor_classes(dump, n):
    """Classes of the element and of its ancestors in a capture."""
    by = dump.get('_byI')
    if by is None:
        by = dump['_byI'] = {m['i']: m for m in dump['nodes']}
    out, a = set(), n
    while a is not None:
        out.update((a.get('cls') or '').split())
        a = by.get(a.get('p'))
    return out


BDI_TYPO = ('font', 'color', 'ls', 'tt', 'deco', 'decoColor', 'uOffset', 'decoW', 'whiteSpace')
BDI_PAINT = ('bg', 'bgImage', 'bT', 'bR', 'bB', 'bL', 'shadow', 'outline', 'filter', 'transform', 'padding')


def bdi_runs(dump):
    """18 Oct.: the site isolates campus and people names in <bdi> (profile-ui.mjs, « Explorer <bdi>42 Paris</bdi> »).
    Measured as two pieces, the line kept a hole in the English mode of a French frame (« Explore » shorter than
    « Explorer », « 42 Paris » left in place) and its pieces were paired apart. A line made of the text of an element
    and of <bdi> children styled like it, all on one line, becomes one run of the element in the order of the line, a
    space where the pieces are apart. Only for the scenes read from left to right (_convert): an Arabic frame keeps the
    measured pieces, exact as they are, so the Arabic value of such a merged line is shown by no frame (no isolation
    marks: invisible characters the couriers would have to copy)."""
    if dump is None:
        return
    kids = dump['children']
    for n in dump['nodes']:
        runs = n.get('runs')
        ch = kids.get(n['i'], [])
        bd = [c for c in ch if c['tag'] == 'bdi' and c.get('runs')]
        if not runs or not bd or len(bd) != len(ch) or any(kids.get(c['i']) for c in bd):
            continue
        st = n.get('s', {})
        if any(tuple(c.get('s', {}).get(k) for k in BDI_TYPO) != tuple(st.get(k) for k in BDI_TYPO) or
               any(c.get('s', {}).get(k) for k in BDI_PAINT) for c in bd):
            continue
        frags = [(r, None) for r in runs] + [(r, c) for c in bd for r in c['runs']]
        if any(len(r.get('l') or []) != 1 for r, _ in frags):
            continue
        if len({(round(r['l'][0][1], 1), round(r['l'][0][3], 1)) for r, _ in frags}) != 1:
            continue   # not one line
        rtl = st.get('dir') == 'rtl'
        frags.sort(key=lambda fr: -(fr[0]['l'][0][0] + fr[0]['l'][0][2]) if rtl else fr[0]['l'][0][0])
        fs = parse_font(st.get('font'))['size']
        text, prev = '', None
        for r, c in frags:
            x0, x1 = r['l'][0][0], r['l'][0][0] + r['l'][0][2]
            if prev is not None and ((prev - x1) if rtl else (x0 - prev)) > 0.12 * fs:
                text += ' '
            text += r['t']
            prev = x0 if rtl else x1
        x0 = min(r['l'][0][0] for r, _ in frags)
        x1 = max(r['l'][0][0] + r['l'][0][2] for r, _ in frags)
        y, h = frags[0][0]['l'][0][1], frags[0][0]['l'][0][3]
        n['runs'] = [{'t': text, 'x': x0, 'y': y, 'w': round(x1 - x0, 2), 'h': h, 'lines': 1, 'l': [[x0, y, round(x1 - x0, 2), h]]}]
        n['_bdim'] = 1   # 18 Oct. (review): pair_strings pairs it only with a capture where the line was merged too
        for c in bd:
            c['runs'] = []   # drawn by the run of its element
            c['_bdi'] = 1


def edge_blur(ps, owner):
    """18 Oct.: a pseudo-element that blurs its backdrop under a radial mask (.hg-map::after of Explorer, globe-framing.css:
    backdrop-filter blur(12px), 8 px under 700 px, mask-image radial-gradient(ellipse closest-side at 50% focus-y,
    transparent 52%, #0003 72%, #0009 88%, #000 100%)). Figma has no masked background blur: a group whose first child is
    an ALPHA mask with that gradient, then (dom2fig adds it once the children exist) a copy of the globe blurred as a
    layer (2 × the CSS radius, like every blur here). The copy only blurs the globe, which is what lies under the edge in
    the stage (a backdrop root: transform and clip-path)."""
    b = parse_blur(ps.get('backdrop'))
    gr = parse_gradients(ps.get('mask'))
    if not b or not gr or gr[0].get('g') != 'R':
        return None
    g0 = gr[0]
    w, h = owner['w'], owner['h']
    st = []
    for pos, c in g0['stops']:
        if isinstance(pos, tuple) or c is None:
            return None
        st.append([round(pos, 4), '#000000%02X' % round(c[3] * 255)])
    paint = {'g': 'R', 'c': [round(g0['center'][0], 4), round(g0['center'][1], 4)], 'st': st}
    if 'closest-side' in (g0.get('head') or ''):
        paint['sz'] = 'cs'
    mask = {'t': 'F', 'n': 'Masque · mask-image (dégradé radial)', 'x': 0, 'y': 0, 'w': w, 'h': h, 'f': [paint], 'mk': 'ALPHA'}
    out = {'t': 'F', 'n': 'Bord flouté du globe (::after, backdrop-filter blur(%gpx))' % b, 'x': 0, 'y': 0, 'w': w, 'h': h,
           'ch': [mask], '_edge': r2(2 * b)}
    try:
        if int(ps.get('z') or 0):
            out['_z'] = int(ps.get('z'))
    except ValueError:
        pass
    return out


def pin_stacking(dump):
    """18 Oct.: each campus marker of the globe sits alone in a .hg-pin holder (integrated-globe.mjs syncMarkers) of
    0 × 0 px with z-index 2 (integrated-globe.css l. 7; 5 with .hg-offscreen-pin, campus-direction.css l. 8), above the
    blurred edge of the map (.hg-map::after, z-index 1, globe-framing.css l. 39-53). The capture keeps no element of
    zero size, so the holder and its z-index are lost: the marker, the holder's only child, takes that z-index back
    (same order: one stacking context per marker, in document order). Test 986 (Archives): the edge was drawn over the
    markers."""
    if dump is None:
        return
    for n in dump['nodes']:
        cls = (n.get('cls') or '').split()
        if 'hg-marker' in cls:
            s = n.setdefault('s', {})
            if s.get('z') in (None, '', 'auto'):
                s['z'] = '5' if 'hg-offscreen' in cls else '2'


def field_runs(dump):
    """Adds to each <input> and <textarea> showing a text the run Chrome draws: at the start of the content box, centred
    on its height in an <input>, on the first line of a <textarea>. A placeholder is marked (_ph): the site paints it in
    var(--h42-color-muted) (content-preview.css, comments.css, dock-search.css)."""
    if dump is None:
        return
    for n in dump['nodes']:
        if n['tag'] not in ('input', 'textarea') or n.get('runs') or not (n.get('text') or '').strip() or n.get('type') in FIELD_SKIP:
            continue
        text = n['text'].strip()
        s = n.get('s', {})
        f = parse_font(s.get('font'))
        fs = f['size']
        bw = [border_width(s.get(b)) for b in ('bT', 'bR', 'bB', 'bL')]
        pad = paddings(s)
        ar = has_arabic(text)
        asc_l, dsc_l = (max(ASCENT['Jost'][0], ASCENT['Noto Sans Arabic'][0]), max(ASCENT['Jost'][1], ASCENT['Noto Sans Arabic'][1])) if ar else ASCENT['Jost']
        x0, x1 = n['x'] + bw[3] + pad[3], n['x'] + n['w'] - bw[1] - pad[1]
        y0, y1 = n['y'] + bw[0] + pad[0], n['y'] + n['h'] - bw[2] - pad[2]
        if n['tag'] == 'input':
            base_y = y0 + ((y1 - y0) - (asc_l + dsc_l) * fs) / 2 + asc_l * fs
        else:
            lh = f['lh'] or (asc_l + dsc_l) * fs
            base_y = y0 + (lh - (asc_l + dsc_l) * fs) / 2 + asc_l * fs
        font = measure_any(f['weight'], fs, ar)
        w = min(font.getlength(text) if font else 0.55 * fs * len(text), max(1.0, x1 - x0))
        y = base_y - ASCENT['Jost'][0] * fs
        h = (ASCENT['Jost'][0] + ASCENT['Jost'][1]) * fs
        x = x1 - w if s.get('dir') == 'rtl' else x0
        n['runs'] = [{'t': text, 'x': round(x, 2), 'y': round(y, 2), 'w': round(w, 2), 'h': round(h, 2), 'l': [[round(x, 2), round(y, 2), round(w, 2), round(h, 2)]]}]
        if n.get('placeholder') and text == n['placeholder'].strip():
            # 18 Oct.: the colour Chrome gives the placeholder (captures from 18 Oct.); before them, the site's three
            # ::placeholder rules (comment form, search, bottom-menu search: var(--h42-color-muted)), else Chrome's
            # default grey, measured at (117, 117, 117) on the report form in both themes (Projets v5, P7)
            if n.get('phColor'):
                n['_phc'] = n['phColor']
            elif any(c in PLACEHOLDER_MUTED for c in ancestor_classes(dump, n)):
                n['_phv'] = '--h42-color-muted'
            else:
                n['_phc'] = 'rgb(117, 117, 117)'


_INFLOW = {}


def inflow_positions(area, fmt, lang, base):
    """17 Oct.: y of the sticky elements of a capture taken scrolled, where the flow puts them: the same element (key and
    tag) in a capture of the area taken at the top, of the same address first (the header at 0, the mobile picker
    « Dans ce projet » at 380 instead of stuck under the header)."""
    want = {n['k']: n['tag'] for n in base['nodes'] if n.get('s', {}).get('position') == 'sticky'}
    if not want:
        return {}
    key = (area, fmt, lang)
    if key not in _INFLOW:
        dumps = []
        for p in sorted((BASE / 'dom' / area).glob('*--%s--%s-light.json.gz' % (fmt, lang))):
            d = load(area, p.name.split('--')[0], fmt, lang, 'light')
            if d is not None and float((d.get('scroll') or [0, 0])[1] or 0) <= 0.5:
                dumps.append((d.get('url', ''), {k: (nd['y'], nd['tag']) for k, nd in d['byKey'].items() if nd.get('s', {}).get('position') == 'sticky'}))
        _INFLOW[key] = dumps
    hash_of = lambda u: u.split('#', 1)[1] if '#' in u else ''
    hb = hash_of(base.get('url', ''))
    tiers = (lambda u: hash_of(u) == hb, lambda u: hash_of(u).split('?')[0] == hb.split('?')[0], lambda u: True)
    out = {}
    for k, tag in want.items():
        for tier in tiers:
            hit = next((m[k][0] for u, m in _INFLOW[key] if tier(u) and k in m and m[k][1] == tag), None)
            if hit is not None:
                out[k] = hit
                break
    return out


def focus_ring(n, dn, shift, origin):
    """17 Oct.: the focus ring of a focused field (CSS outline « 2px solid … off 3px »), drawn as a frame around it: no
    fill, an inside stroke of the outline width, the field's radius grown by offset + width."""
    m = re.match(r'(' + NUM + r')px (\w+) (rgba?\([^)]*\)|#\w+) off (' + NUM + r')px', (n.get('s') or {}).get('outline') or '')
    if not m or float(m.group(1)) <= 0:
        return None
    w, off = float(m.group(1)), float(m.group(4))
    dm = re.match(r'(' + NUM + r')px (\w+) (rgba?\([^)]*\)|#\w+)', ((dn or {}).get('s') or {}).get('outline') or '')
    grow = off + w
    ring = {'t': 'F', 'n': 'Anneau de focus', 'x': r2(n['x'] - grow - origin[0]), 'y': r2(n['y'] + shift - grow - origin[1]),
            'w': r2(n['w'] + 2 * grow), 'h': r2(n['h'] + 2 * grow), 'f': [],
            's': cref('bordure', parse_color(m.group(3)), parse_color(dm.group(3)) if dm else None), 'sw': r2(w)}
    rr = radii((n.get('s') or {}).get('radius'), n['w'], n['h'])
    if any(rr):
        ring['r'] = r2(max(rr) + grow) if len(set(rr)) == 1 else [r2(v + grow) for v in rr]
    return ring


# ------------------------------------------------------------------ resize grip of a <textarea> (18 Oct.)
# Chrome draws a grip over the bottom corner of a resizable <textarea> (resize ≠ none, overflow ≠ visible); it is not an
# element, so the dump does not hold it. Chromium 155, third_party/blink/renderer/core/paint/scrollable_area_painter.cc,
# DrawPlatformResizerImage() with TextAreaResizerFixedSize (status « stable »): from the corner of the padding box, 2 px
# in, a long stroke (7 px) and a short one (3 px) at 45°, 1 px wide, butt caps, no anti-aliasing; first dark
# (SkColorSetARGB(153, 0, 0, 0)), then light (153, 255, 255, 255) one pixel lower; the same colours in both themes.
# Bottom right; bottom left when the field's own direction is rtl (dir="auto" stays ltr while the field is empty).
# The phone captures emulate a 2× screen with DevTools: the grip is laid out in CSS px (ScaleFromDIP() keeps the
# original scale, 1: widget_base.cc DIPsToBlinkSpace) and drawn × 2, its short stroke 3 CSS px long (6 device px).
# The corner is the border box rounded to whole CSS px, minus the borders. Drawn as its exact device pixels, one vector
# per colour, above the field (Chrome paints it over the border, unclipped by the rounded corner). Checked against the
# 80 captures where nothing covers it: every pixel within 1.8 levels.
GRIP = (('trait sombre', (0.0, 0.0, 0.0, 0.6), ((2, 9, 9, 2), (2, 5, 5, 2))),
        ('trait clair', (1.0, 1.0, 1.0, 0.6), ((2, 8, 8, 2), (2, 4, 4, 2))))   # (in, up) of the upper end, then the lower one


def stroke_pixels(p, q, width):
    """Device pixels whose centre lies in the butt-capped stroke p → q (p is the upper end), as Chrome fills it without
    anti-aliasing. Exact arithmetic on half pixels; a centre on the upper cap is filled, on the lower cap it is not."""
    (x0, y0), (x1, y1) = p, q
    dx, dy = x1 - x0, y1 - y0
    l2 = dx * dx + dy * dy
    out = set()
    for j in range(math.floor(min(y0, y1) - width), math.ceil(max(y0, y1) + width) + 1):
        for i in range(math.floor(min(x0, x1) - width), math.ceil(max(x0, x1) + width) + 1):
            cx, cy = i + 0.5 - x0, j + 0.5 - y0
            t, perp = cx * dx + cy * dy, cx * dy - cy * dx
            if 4 * perp * perp <= width * width * l2 and 0 <= t < l2:
                out.add((i, j))
    return out


def resizer_grip(n, shift, origin, dpr):
    """Chrome's resize grip of a resizable box (the <textarea> fields) as two vector layers (dark stroke, then light
    stroke), placed in the parent's coordinates like the focus ring; [] without one. dpr: device scale of the capture."""
    s = n.get('s') or {}
    # computed resize: captures from 18 Oct. (capture_lib n.resize); before, a <textarea> has the UA default (auto)
    rz = n.get('resize') or ('auto' if n['tag'] == 'textarea' else 'none')
    if rz == 'none' or (s.get('overflow') or 'visible').split()[0] == 'visible':
        return []
    snap = lambda v: math.floor(v + 0.5)
    rtl_ = s.get('dir') == 'rtl'
    cx = snap(n['x']) + border_width(s.get('bL')) if rtl_ else snap(n['x'] + n['w']) - border_width(s.get('bR'))
    cy = snap(n['y'] + n['h']) - border_width(s.get('bB'))
    k = 1 if rtl_ else -1
    num = lambda v: ('%.4f' % v).rstrip('0').rstrip('.')
    out = []
    for name, rgba, lines in GRIP:
        pix = set()
        for a, b, c, d in lines:
            pix |= stroke_pixels(((cx + k * a) * dpr, (cy - b) * dpr), ((cx + k * c) * dpr, (cy - d) * dpr), dpr)
        rows = {}
        for i, j in pix:
            rows.setdefault(j, []).append(i)
        runs = []   # one rectangle per horizontal run of pixels
        for j in sorted(rows):
            xs = sorted(rows[j])
            start = prev = xs[0]
            for i in xs[1:] + [None]:
                if i is not None and i == prev + 1:
                    prev = i
                    continue
                runs.append((start, j, prev + 1, j + 1))
                if i is not None:
                    start = prev = i
        x0, y0 = min(r[0] for r in runs), min(r[1] for r in runs)
        x1, y1 = max(r[2] for r in runs), max(r[3] for r in runs)
        u = lambda v, o: num((v - o) / dpr)
        data = ' '.join('M %s %s L %s %s L %s %s L %s %s Z' % (u(a, x0), u(b, y0), u(c, x0), u(b, y0), u(c, x0), u(e, y0), u(a, x0), u(e, y0))
                        for a, b, c, e in runs)
        out.append({'t': 'V', 'n': 'Poignée de redimensionnement · ' + name, 'x': r2(x0 / dpr - origin[0]),
                    'y': r2(y0 / dpr + shift - origin[1]), 'w': r2((x1 - x0) / dpr), 'h': r2((y1 - y0) / dpr), 'd': data,
                    'col': cref('icône', rgba, rgba), **({'o': round(opacity(n), 3)} if opacity(n) < 0.999 else {})})
    return out   # (the field's own opacity applies to its grip; none of the captured fields has one)


def z_index(n):
    """Stacking order of an element among the layers of its frame (17 Oct.): modal dialogs on top, then the z-index of a
    positioned element."""
    if n['tag'] == 'dialog':
        return 10 ** 6
    s = n.get('s', {})
    if s.get('position') not in ('absolute', 'relative', 'fixed', 'sticky'):
        return 0
    try:
        return int(s.get('z', 0))
    except ValueError:
        return 0


# 18 Oct. (audit of the remaining gaps, step 5): boxes and first baselines placed on Chrome's pixel grid. The boxes
# brought nothing on the list of projects compared with its GPU capture (call 982: mean gap 1.384 against 1.334, the
# residual being the glyphs' rasterization) and they split identical elements into variants by their sub-pixel phase:
# off. The baselines alone (call 983) brought the mean gap from 1.334 to 1.248 over the screen and from 5.71 to 5.14
# inside the text boxes (pixels off by more than 40 levels: 5.31 % → 4.80 %): kept.
# 18 Oct. (review): reservation on call 982: the guard of build_one() that spares the children of an auto-layout frame
# never held (n['_al'] is set once its children are built), so they were snapped too before Figma's auto-layout placed
# them; snap the boxes in a final pass over the finished tree before turning PIXEL_SNAP on again.
PIXEL_SNAP = False
PIXEL_SNAP_TEXT = True


def px_round(v):
    """Chrome's LayoutUnit::Round on a 1/64 px value: half up."""
    return math.floor(round(v * 64) / 64 + 0.5)


def snap_frame(frame, x0, y0):
    """18 Oct.: Chrome paints the background, borders and shadows of a box that no transform moves on the pixel grid
    (PixelSnappedIntRect: x = round(x), width = round(x + width) − round(x), the same vertically), while Figma would
    draw a box at 328.41 px with a blended first row. The frame takes the snapped rectangle; its children, placed from
    the measured origin, move back by the snap so that they keep their own positions (a child frame snaps itself)."""
    w, h = frame.get('w') or 0, frame.get('h') or 0
    X0, Y0 = px_round(x0), px_round(y0)
    X1, Y1 = px_round(x0 + w), px_round(y0 + h)
    if X1 - X0 < 1 or Y1 - Y0 < 1:
        return
    dx, dy = x0 - X0, y0 - Y0
    frame['x'], frame['y'] = r2(frame['x'] - dx), r2(frame['y'] - dy)
    frame['w'], frame['h'] = X1 - X0, Y1 - Y0
    for k_ in ('cm', 'hole'):
        if frame.get(k_):
            frame[k_] = [r2(frame[k_][0] + dx), r2(frame[k_][1] + dy), frame[k_][2]]
    for c in frame.get('ch') or []:
        c['x'], c['y'] = r2((c.get('x') or 0) + dx), r2((c.get('y') or 0) + dy)


def zsort(nodes):
    """17 Oct.: layers in paint order. A positioned element with a z-index (its _z, kept when its wrapper is flattened)
    goes above its later siblings, as in the page (the « Trier » menu was under the cards that follow it)."""
    return sorted(nodes, key=lambda t: t.get('_z', 0)) if any(t.get('_z') for t in nodes) else nodes


def stacking_context(n, par=None):
    """18 Oct.: does the element create a stacking context of its own? (CSS: fixed or sticky, positioned with a
    z-index, opacity below 1, transform, filter or backdrop-filter, flex or grid item with a z-index, dialog)"""
    s = n.get('s', {})
    pos, z = s.get('position'), s.get('z')
    if n['tag'] == 'dialog' or pos in ('fixed', 'sticky'):
        return True
    if z not in (None, '', 'auto') and (pos in ('absolute', 'relative') or
                                       (par is not None and (par.get('s', {}).get('display') or '').endswith(('flex', 'grid')))):
        return True
    if opacity(n) < 0.999:
        return True
    if s.get('iso') == 'isolate' or s.get('blend') not in (None, '', 'normal'):
        return True
    if n.get('id') == 'app' or 'app' in (n.get('cls') or '').split():
        return True   # welcome.css:4 .app { isolation: isolate }, not recorded by the captures made before 18 Oct.
    return any(s.get(k) not in (None, '', 'none') for k in ('transform', 'filter', 'backdrop'))


def hoist_z(nodes):
    """18 Oct.: CSS paints the positioned descendants of an element that creates no stacking context (main: static,
    without z-index, opacity, transform or filter) among the layers of the nearest ancestor that creates one. The header
    fade #app::after (z-index 6) is a sibling of main: zsort() put the whole of main under it, and with main the scope
    bar (8), the globe (7) and the bottom menu (20) it contains. When a descendant with a z-index must cross a sibling
    of such a frame, all its descendants with a z-index move up beside it (coordinates of this list) and are sorted with
    it. A clipping frame only gives up its fixed descendants, which its clip does not reach on the site. A frame left
    empty and without paint is removed."""
    sib = [t['_z'] for t in nodes if t.get('_z')]
    if not sib:
        return nodes
    # 18 Oct.: an instance whose variant holds descendants with a z-index this list pulls out goes back to its flat
    # layers first (components.occurrence: _hz), with their z-indexes, then is treated like any frame
    for t in nodes:
        if t.get('t') == 'C' and t.get('_hz') and any((s > 0 and z > s) or (s < 0 and z < s) for z in t['_hz'] for s in sib):
            expand_instance(t, keep_z=True)
    cand = lambda f: f.get('t') == 'F' and f.get('_nsc') and not f.get('_z') and not f.get('tf')

    def gather(fr, clipped):
        out = []
        for g in fr.get('ch', []):
            if g.get('_z') and (not clipped or g.get('fx')):
                out.append(g['_z'])
            elif cand(g):
                out.extend(gather(g, clipped or g.get('c')))
        return out

    def pull(fr, dx, dy, clipped):
        moved, keep = [], []
        for g in fr.get('ch', []):
            if g.get('_z') and (not clipped or g.get('fx')):
                g['x'], g['y'] = r2(g['x'] + dx), r2(g['y'] + dy)
                moved.append(g)
                continue
            if cand(g):
                moved.extend(pull(g, dx + g['x'], dy + g['y'], clipped or g.get('c')))
                if not g.get('ch') and not (g.get('f') or g.get('s') or g.get('e')) and not fr.get('al'):
                    continue   # an emptied frame stays in an auto-layout parent, where it holds its place
            keep.append(g)
        if keep:
            fr['ch'] = keep
        else:
            fr.pop('ch', None)
        return moved

    out = []
    for t in nodes:
        if cand(t):
            zs = gather(t, t.get('c'))
            if any((s > 0 and z > s) or (s < 0 and z < s) for z in zs for s in sib):
                moved = pull(t, t['x'], t['y'], t.get('c'))
                if t.get('ch') or t.get('f') or t.get('s') or t.get('e'):
                    out.append(t)
                out.extend(moved)
                continue
        out.append(t)
    return out


def strip_z(nodes):
    for t in nodes:
        t.pop('_z', None)
        t.pop('_nsc', None)
        t.pop('_hz', None)
        if t.get('ch'):
            strip_z(t['ch'])


def blur_layers(nodes, virtual=False):
    """18 Oct.: frames with a background blur, in paint order (depth first, children in order), with their box in
    the coordinates of the scene: [(order, node, x, y, w, h, radius, instance)]. A rotated frame keeps its measured box.
    virtual: an instance (« C ») is read through the subtree of its library variant; instance = the outermost instance
    holding the layer (None for a real layer)."""
    out = []
    def walk(ns, ox, oy, owner):
        for n in ns:
            x, y = ox + (n.get('x') or 0), oy + (n.get('y') or 0)
            src, own = n, owner
            if virtual and n.get('t') == 'C':
                src, own = components.variant_frame(n['c'], n['v']) or n, owner or n
            b = next((e['b'] for e in src.get('e') or [] if e.get('t') == 'B'), None)
            if b:
                out.append((len(out), n, x, y, n.get('w', 0), n.get('h', 0), b, own))
            if src.get('ch'):
                walk(src['ch'], x, y, own)
    walk(nodes, 0, 0, None)
    return out


def expand_instance(c, keep_z=False):
    """18 Oct.: an instance back to the flat layers of its variant (same subtree by construction), in place. keep_z:
    for hoist_z, which still needs the z-indexes of the descendants (the root has no stacking context of its own)."""
    fr = copy.deepcopy(components.variant_frame(c['c'], c['v']))
    for k in ('x', 'y', 'fx', 'sk', 'tf', '_z', '_nsc', 'n'):
        fr.pop(k, None)
    keep = {k: c[k] for k in ('x', 'y', 'fx', 'sk', 'tf', 'n', '_z') if k in c}
    fam = c['c']
    c.clear(); c.update(fr); c.update(keep)
    if keep_z:
        c['_nsc'] = 1
    else:
        strip_z([c])
    reason = 'empilement' if keep_z else 'verre sous un flou'
    components.FLAT.setdefault(fam, {}).setdefault(reason, 0)
    components.FLAT[fam][reason] += 1


def glass_under_blur(nodes):
    """18 Oct.: Figma ignores the background blur of a layer when it computes the background blur of a later layer
    (help.figma.com/hc/en-us/articles/360041488473): under the ::backdrop veil of a window, the glass of the bottom menu,
    of the scope bar or of a button showed the map unblurred. Such a glass loses its BACKGROUND_BLUR and is marked
    « ⟨verre r⟩ »: render.js gives it an explicit copy of what is painted before it, blurred as a layer (a layer blur is
    not ignored). Only under a weaker later blur (veil of 4 to 14 over glass of 52): a later blur as strong as the glass
    (a glass panel over glass buttons) removes by itself the detail the glass would have blurred."""
    def hits(layers):
        res = []
        for i, L in enumerate(layers):
            (oi, g, gx, gy, gw, gh, gb, own) = L
            for (oj, v, vx, vy, vw_, vh_, vb, _) in layers[i + 1:]:
                if vx < gx + gw and gx < vx + vw_ and vy < gy + gh and gy < vy + vh_ and vb < gb:
                    res.append(L)
                    break
        return res
    # an instance holding such a glass cannot take a copy of the screen behind it: it goes back to flat layers
    owners = {id(L[7]): L[7] for L in hits(blur_layers(nodes, virtual=True)) if L[7] is not None}
    for c in owners.values():
        expand_instance(c)
    marked = [(L[1], L[6]) for L in hits(blur_layers(nodes, virtual=True)) if L[7] is None]
    for g, gb in marked:
        g['e'] = [e for e in g['e'] if e.get('t') != 'B']
        if not g['e']:
            del g['e']
        g['n'] = (g.get('n') or 'Verre') + ' ⟨verre %s⟩' % fr_num(gb).replace(',', '.')
    return [g for g, _ in marked], len(owners)


DARK_TEXT = BASE / 'calls' / 'strings-sent.json'
SITE_COPY_FILE = BASE / 'site-copy.json'   # 18 Oct.: translation tables of the prototype (scripts/site_copy.cjs)
_FALLBACK = None
_FALLBACK_KEY = None


def fallback_strings():
    """18 Oct.: French wording → (variable name or None, en, ar), for the wordings that have one translation only in the
    tables of the site (site-copy.json) and among the variables already sent (strings-sent.json). A sent variable is
    preferred: its name and values are reused as they are. 18 Oct. (review): read again when either file changes
    (rendu_complet.py scenes renders the pages in one process, each page registering its variables in turn)."""
    global _FALLBACK, _FALLBACK_KEY
    stamp = tuple((p.stat().st_mtime_ns, p.stat().st_size) if p.exists() else None for p in (SITE_COPY_FILE, DARK_TEXT))
    if _FALLBACK is None or stamp != _FALLBACK_KEY:
        cands = {}

        def add(fr, en, ar, name):
            key = (en, (ar or '').lstrip(RLM))
            d = cands.setdefault(fr, {})
            if key not in d or (name and not d[key][0]):
                d[key] = (name, en, ar)
        if SITE_COPY_FILE.exists():
            for x in json.loads(SITE_COPY_FILE.read_text()):
                add(x['fr'], x['en'], x['ar'], None)
        if DARK_TEXT.exists():
            for name, (fr, en, ar) in json.loads(DARK_TEXT.read_text()).items():
                add(fr, en, ar, name)
        _FALLBACK = {fr: next(iter(d.values())) for fr, d in cands.items() if len(d) == 1}
        _FALLBACK_KEY = stamp
    return _FALLBACK


def convert(area, state, fmt, lang='fr', full=True, viewport=None, theme='light'):
    """Scene of one captured state. 17 Oct.: theme='dark' builds the dark frame from the dark capture (states whose
    content changes with the theme: the checked option and the « Thème … Sombre » line of the account panels), its
    colours bound to the same light/dark variables as the light frame."""
    global SWAP
    SWAP = theme == 'dark'
    try:
        return _convert(area, state, fmt, lang, full, viewport, theme)
    finally:
        SWAP = False


def _convert(area, state, fmt, lang, full, viewport, theme):
    collected_from = len(components.COLLECTED)   # 18 Oct.: occurrences recorded by this conversion (collect mode)
    geo, oth = ('dark', 'light') if theme == 'dark' else ('light', 'dark')
    base = load(area, state, fmt, lang, geo)
    if base is None:
        raise FileNotFoundError(f'{area}/{state}--{fmt}--{lang}-{geo}')
    dark = load(area, state, fmt, lang, oth)   # the other theme (the dark one, unless theme='dark')
    if dark is None and lang != 'fr' and theme != 'dark':
        # 16 Oct.: no dark capture in this language (many Arabic states): the French dark capture gives the dark paints
        # of the same elements (same key, tag and classes; the templates are shared)
        fr_dark = load(area, state, fmt, 'fr', 'dark')
        if fr_dark is not None:
            same = {k: dn for k, dn in fr_dark['byKey'].items()
                    if k in base['byKey'] and base['byKey'][k]['tag'] == dn['tag'] and (base['byKey'][k].get('cls') or '') == (dn.get('cls') or '')}
            dark = dict(fr_dark, byKey=same, _fallback='fr')
    langs = {l: (base if l == lang else (load(area, state, fmt, l, geo) or load(area, state, fmt, l, 'light'))) for l in ('fr', 'en', 'ar')}
    for d in [base, dark] + list(langs.values()):
        select_runs(d)
        field_runs(d)
        pin_stacking(d)
    merge_bdi = base.get('dir') != 'rtl'
    if merge_bdi:
        for d in [base, dark] + list(langs.values()):
            bdi_runs(d)
    for n in base['nodes']:
        if n.get('_phv'):
            c = parse_color((base.get('vars') or {}).get(n['_phv']))
            dc = parse_color(((dark or {}).get('vars') or {}).get(n['_phv'])) if dark else None
            if c:
                n['_ph'] = (c, dc)
        elif n.get('_phc'):
            dn_ = (dark or {}).get('byKey', {}).get(n['k']) if dark else None
            c = parse_color(n['_phc'])
            dc = parse_color(dn_.get('_phc') or dn_.get('phColor')) if dn_ and (dn_.get('_phc') or dn_.get('phColor')) else (c if dark else None)
            if c:
                n['_ph'] = (c, dc)
    same_text = set()   # 18 Oct. (review): texts all the captures show alike, never bound (pair_strings, fallback below)
    strings = pair_strings(base, langs, area, same_text) if all(langs.values()) else {}
    if theme == 'dark' and strings:
        # 17 Oct.: a text that depends on the theme (« Sombre » where the light capture says « Clair ») was paired with
        # the light captures of the other languages: it takes the variable already sent for its French wording, else none
        light = load(area, state, fmt, lang, 'light')
        if merge_bdi:
            bdi_runs(light)
        reg = json.loads(DARK_TEXT.read_text()) if DARK_TEXT.exists() else {}
        for (k, ri), e in list(strings.items()):
            ln = light['byKey'].get(k) if light else None
            lt = ln['runs'][ri]['t'] if ln and len(ln.get('runs') or []) > ri else None
            if lt is not None and lt != e['fr']:
                vals = reg.get(var_name(area, e['fr']))
                if vals:
                    strings[(k, ri)] = {'n': var_name(area, e['fr']), 'fr': vals[0], 'en': vals[1], 'ar': vals[2]}
                else:
                    del strings[(k, ri)]
    rtl = base.get('dir') == 'rtl'
    vw, vh = base['viewport']
    dw, dh = base['doc']
    H = max(dh, vh) if full else vh
    kids = base['children']
    svgs_used = {}
    stats = {'frames': 0, 'texts': 0, 'icons': 0, 'svgs': 0, 'rasters': 0, 'autolayout': 0, 'strings': 0}
    if lang == 'fr':
        # 18 Oct.: a French text the other captures could not pair (no English or Arabic capture of this state, or
        # another structure there) takes the variable of its wording when that wording has one translation only.
        # 18 Oct. (review): not a text the three captures show alike (« Français » of the language list, « 42 Awards »
        # beside « Distinctions »: the fallback gave them « English » and « جوائز 42 »)
        fb = fallback_strings()
        for n in base['nodes']:
            if not n.get('runs') or 'entrance-action-label' in (n.get('cls') or '').split():
                continue   # the labels of the arrival turn FR → EN → AR whatever the language: never bound
            for ri, run in enumerate(n['runs']):
                key = (n.get('k'), ri)
                hit = None if (key in strings or key in same_text) else fb.get(run['t'])
                if hit and not (run['t'] == hit[1] == hit[2]):
                    strings[(n['k'], ri)] = {'n': hit[0] or var_name(area, run['t']), 'fr': run['t'], 'en': hit[1], 'ar': hit[2]}
                    stats['fallbackStrings'] = stats.get('fallbackStrings', 0) + 1

    sy = float((base.get('scroll') or [0, 0])[1] or 0)
    inflow = inflow_positions(area, fmt, lang, base) if (sy > 0.5 and full) else {}

    def fixed_y(n, y):
        """Place of a fixed or sticky layer in the frame. 17 Oct.: the capture gives document coordinates, so a state
        captured scrolled had its header, globe button and bottom menu shifted by the scroll. A fixed layer goes back to
        its place on the screen; in a full-height frame, the layers whose top edge is in the lower half of the screen
        (bottom menu, search, back-to-top) move to the bottom of the frame. The tall project sidebar (top 236 px, 708 px
        high: its centre is below the middle) and the centred dialogs stay at the top. A sticky layer stuck by the scroll
        goes back to its place in the flow (same element in a capture taken at the top)."""
        pos = n.get('s', {}).get('position')
        if not full or pos not in ('fixed', 'sticky'):
            return y
        if pos == 'fixed':
            yv = y - sy
            return yv + (H - vh) if (H > vh and yv > vh / 2) else yv
        if sy <= 0.5:
            return y
        if n['k'] in inflow:
            return inflow[n['k']]
        return y - sy if y - sy <= vh / 4 else y

    def hidden(n):
        cls = (n.get('cls') or '').split()
        if any(c in ('sr-only', 'visually-hidden', 'screen-reader-text') for c in cls):
            return True
        return n['w'] <= 1.5 and n['h'] <= 1.5 and n.get('s', {}).get('overflow', '').split(' ')[0] in ('hidden', 'clip')

    meta = base.get('meta') if isinstance(base.get('meta'), dict) else {}
    reveal = meta.get('reveal') or {}

    def clip_inset(n):
        """clip-path: inset(top right bottom left) → offsets in px: computed style of captures from 16 Oct., or the
        facts of the logo animation at the entrance."""
        v = n.get('s', {}).get('clip')
        if not v and 'entrance-logo' in (n.get('cls') or '').split():
            v = (meta.get('symbol') or {}).get('logoClip')
        if not v or not v.startswith('inset('):
            return None
        vals = v[6:].split(')')[0].split(' round ')[0].split()
        if not vals:
            return None
        vals = {1: vals * 4, 2: vals[:2] * 2, 3: vals[:3] + vals[1:2]}.get(len(vals), vals[:4])
        conv = lambda v, ref: float(v[:-1]) / 100 * ref if v.endswith('%') else px(v)
        out = (conv(vals[0], n['h']), conv(vals[1], n['w']), conv(vals[2], n['h']), conv(vals[3], n['w']))
        return out if sum(out) > 0.01 else None

    def page_circle(n):
        """Circle (centre, radius) in page px of the reveal: hole of the veil's mask, or clip-path of the globe.
        18 Oct.: also the globe docked in the « Monde » medallion (#globe: clip-path circle in its own coordinates, under a
        transform that only scales and moves it, so the measured box starts at its origin)."""
        if n.get('id') == 'globe' and GLOBE_DOCKED:
            s = n.get('s', {})
            m = re.search(r'circle\((' + NUM + r')px at (' + NUM + r')px (' + NUM + r')px\)', s.get('clip') or '')
            mt = re.search(r'matrix\((' + NUM + r'),\s*(' + NUM + r'),\s*(' + NUM + r'),\s*(' + NUM + r')', s.get('transform') or '')
            if m and mt and abs(float(mt.group(2))) < 1e-6 and abs(float(mt.group(3))) < 1e-6:
                k = float(mt.group(1))
                r0, cx, cy = (float(m.group(i)) for i in (1, 2, 3))
                return 'cm', n['x'] + cx * k, n['y'] + cy * k, r0 * k
        if n.get('id') == 'entrance-veil' and (reveal.get('veil') or {}).get('mask'):
            m = re.search(r'circle at (' + NUM + r')px (' + NUM + r')px,\s*transparent (' + NUM + r')px,.*?(' + NUM + r')px\)\s*$', reveal['veil']['mask'])
            if m:
                return 'hole', float(m.group(1)), float(m.group(2)), (float(m.group(3)) + float(m.group(4))) / 2
        g = reveal.get('globe') or {}
        if n.get('id') == 'globe' and g.get('clipPath'):
            m = re.search(r'circle\((' + NUM + r')px at (' + NUM + r')px (' + NUM + r')px\)', g['clipPath'])
            if m:
                r0, cx, cy = (float(m.group(i)) for i in (1, 2, 3))
                sc = re.search(r'scale\((' + NUM + r')\)', g.get('transform') or '')
                tr = re.search(r'translate\((' + NUM + r')px,\s*(' + NUM + r')px\)', g.get('transform') or '')
                og = re.findall(NUM, g.get('origin') or '')
                k = float(sc.group(1)) if sc else 1.0
                tx, ty = (float(tr.group(1)), float(tr.group(2))) if tr else (0.0, 0.0)
                ox, oy = (float(og[0]), float(og[1])) if len(og) >= 2 else (cx, cy)
                return 'cm', ox + tx + (cx - ox) * k, oy + ty + (cy - oy) * k, r0 * k
        return None

    SCALE = {}
    ROT = {}   # rotation / mirror of the element and its ancestors (16 Oct.)
    MOVED = {}   # 18 Oct.: the element or an ancestor has a CSS transform (Chrome paints it without pixel snapping)
    # 18 Oct. (review): only a transform that moves the pixel grid (keeps_grid). Inside .hg-map any transform still
    # counts: the markers hang on .hg-pin holders translated by half pixels (integrated-globe.mjs, syncMarkers) that
    # the capture does not keep (0 × 0 px); their labels are off the whole pixel on a phone
    IN_MAP = {}
    TOFF = {}   # 18 Oct. (review of the fixes): vertical sum of the translations of the element and its ancestors, None otherwise
    for nd in base['nodes']:   # parents come before their children in the dump
        SCALE[nd['i']] = own_scale(nd) * SCALE.get(nd['p'], 1.0)
        ROT[nd['i']] = mat_mul(ROT.get(nd['p'], (1.0, 0.0, 0.0, 1.0)), own_matrix(nd))
        IN_MAP[nd['i']] = IN_MAP.get(nd['p'], False) or 'hg-map' in (nd.get('cls') or '').split()
        tf_ = nd.get('s', {}).get('transform') or 'none'
        MOVED[nd['i']] = MOVED.get(nd['p'], False) or (tf_ != 'none' and (IN_MAP[nd['i']] or not keeps_grid(tf_)))
        ty_ = translation_y(tf_)
        TOFF[nd['i']] = None if (ty_ is None or TOFF.get(nd['p'], 0.0) is None) else TOFF.get(nd['p'], 0.0) + ty_   # 18 Oct.: translations only

    def text_snap(n):
        """18 Oct. (review of the fixes): how the first baseline of the element's texts goes on Chrome's grid: as in the
        page when no transform moves it, in the element's own space under translations only (TOFF, .hg-map), never under
        a scale or a turn."""
        i = n['i']
        if not PIXEL_SNAP_TEXT or (MOVED.get(i) and TOFF.get(i) is None):
            return {'snap': False}
        return {'snap': True, 'snap_off': TOFF.get(i) or 0.0, 'in_map': bool(IN_MAP.get(i) and MOVED.get(i)), 'dpr': base.get('dpr') or 1}

    def with_tf(node, n):
        tf = tf_of(ROT.get(n['i'], (1.0, 0.0, 0.0, 1.0)))
        if tf:
            node['tf'] = tf
        return node

    def line_dir(n):
        a = n
        while a is not None and (a.get('s', {}).get('display') or 'inline') in ('inline', 'contents'):
            a = byI.get(a['p'])
        return (a or n).get('s', {}).get('dir', 'ltr')

    def caret(n, dn, shift, origin):
        """18 Oct.: the text cursor Chrome draws in the focused field (captures from 18 Oct.: focus, caret, caretColor):
        1 px wide, at the caret position (end of the typed value, or start of the content box before a placeholder),
        as high as the line, in the caret colour (auto: the text colour)."""
        if not n.get('focus') or n['tag'] not in ('input', 'textarea') or hidden(n):
            return None
        s = n.get('s', {})
        f = parse_font(s.get('font'))
        fs = f['size']
        rtl_ = s.get('dir') == 'rtl'
        bw = [border_width(s.get(b)) for b in ('bT', 'bR', 'bB', 'bL')]
        pad = paddings(s)
        x0, x1 = n['x'] + bw[3] + pad[3], n['x'] + n['w'] - bw[1] - pad[1]
        run = (n.get('runs') or [None])[0]
        value = n.get('value') or ''
        typed = bool(run) and not n.get('_ph') and not n.get('_phc') and not n.get('_phv')
        if typed and (n.get('caret') is None or n.get('caret') >= len(value)):
            line = run['l'][-1] if run.get('l') else [run['x'], run['y'], run['w'], run['h']]
            x = line[0] if rtl_ else line[0] + line[2]
        else:
            x = x1 if rtl_ else x0
        h = (f['lh'] if (n['tag'] == 'textarea' and f['lh']) else (ASCENT['Jost'][0] + ASCENT['Jost'][1]) * fs)
        if run:
            ly = (run['l'][-1][1] if typed and run.get('l') else run['y'])
            y = ly + (run['h'] - h) / 2 if n['tag'] == 'input' else ly
        else:
            y = n['y'] + bw[0] + pad[0]
        def cc(node):
            st = (node or {}).get('s', {})
            v = (node or {}).get('caretColor')
            return parse_color(v) if v and v != 'auto' else parse_color(st.get('color'))
        col = cc(n)
        if col is None:
            return None
        dcol = cc(dn) if dn else None
        return {'t': 'F', 'n': 'Curseur de saisie', 'x': r2(x - (1 if rtl_ else 0) - origin[0]), 'y': r2(y + shift - origin[1]), 'w': 1, 'h': r2(h),
                'f': [cref('texte', col, dcol)]}

    def build(n, origin, depth, sh=0.0):
        """build_one(), plus what the computed style adds around an element (16 Oct.): the ::backdrop veil of an open
        modal dialog, a clip-path inset, the circular hole and clip of the entrance's reveal."""
        out = build_one(n, origin, depth, sh)
        if not out:
            return out
        if len(out) == 1 and out[0].get('t') == 'F':
            fr = out[0]
            circ = page_circle(n)
            if circ:
                # 18 Oct. (review): in the frame's coordinates, from n['y'] like the circle; fixed_y() is where the frame
                # goes (moved by the scroll: the docked globe of back-to-top fell 1 400 px below its frame)
                fr[circ[0]] = [r2(circ[1] - n['x']), r2(circ[2] - n['y']), r2(circ[3])]
                fr.pop('al', None)
            ci = clip_inset(n)
            if ci:
                t_, r_, b_, l_ = ci
                wrap = {'t': 'F', 'n': 'Découpe · clip-path', 'x': r2(fr['x'] + l_), 'y': r2(fr['y'] + t_),
                        'w': r2(max(0.01, n['w'] - l_ - r_)), 'h': r2(max(0.01, n['h'] - t_ - b_)), 'c': 1, 'ch': [fr]}
                fr['x'], fr['y'] = r2(-l_), r2(-t_)
                out = [wrap]
        bd = dialog_backdrop(n, base) if not hidden(n) else None
        if bd:
            dn = dark['byKey'].get(n['k']) if dark else None
            dbd = dialog_backdrop(dn, dark) if dn else None
            veil = {'t': 'F', 'n': 'Voile de la fenêtre (::backdrop)', 'x': r2(-origin[0]), 'y': r2(-origin[1]), 'w': vw, 'h': round(H, 2),
                    'f': [cref('fond', bd[0], dbd[0] if dbd and dbd[0] else None)] if bd[0] else []}
            if bd[1]:
                veil['e'] = [{'t': 'B', 'b': bd[1] * 2}]   # Figma's background blur value is twice the CSS radius
            stats['frames'] += 1
            out = [veil] + out
        ring = focus_ring(n, dark['byKey'].get(n['k']) if dark else None, fixed_y(n, n['y']) - n['y'] if fixed_y(n, n['y']) != n['y'] else sh, origin)
        if ring:
            out = out + [ring]   # 17 Oct.: a sibling, the field clips its own content
            stats['frames'] += 1
        cur = caret(n, dark['byKey'].get(n['k']) if dark else None, fixed_y(n, n['y']) - n['y'] if fixed_y(n, n['y']) != n['y'] else sh, origin)
        if cur:
            out = out + [cur]
            stats['frames'] += 1
        grip = resizer_grip(n, fixed_y(n, n['y']) - n['y'] if fixed_y(n, n['y']) != n['y'] else sh, origin, base.get('dpr') or 1) if not hidden(n) else []
        if grip:
            out = out + grip   # 18 Oct.: Chrome's resize grip, above the field and its border (not clipped by its radius)
            stats['vectors'] = stats.get('vectors', 0) + len(grip)
        zi = z_index(n)
        if zi and 'map-credit' in (n.get('cls') or '').split():
            # 18 Oct.: the 16 Oct. rule of order().zz (credits just above the opaque vector globe, their sibling) is
            # kept in the paint order, which zsort() otherwise takes from the z-index alone (5, under the globe's 7)
            g = next((c for c in kids.get(n['p'], []) if c.get('id') == 'globe'), None)
            if g is not None and z_index(g):
                zi = z_index(g) + 0.5
        if zi:
            for o in out:
                o['_z'] = zi
        return out

    def build_one(n, origin, depth, sh=0.0):
        """Return a list of scene nodes for element n (a frame, or its flattened children)."""
        if hidden(n):
            return []
        dn = dark['byKey'].get(n['k']) if dark else None
        children = kids.get(n['i'], [])
        tag = n['tag']
        # 16 Oct., evening: a fixed layer moved to the bottom of a full-height frame takes its whole subtree with it
        # (sh: shift inherited from the nearest moved ancestor; the dock's buttons stayed mid-page before)
        yf = fixed_y(n, n['y'])
        shift = (yf - n['y']) if yf != n['y'] else sh
        x0, y0 = n['x'], n['y'] + shift
        par = byI.get(n['p'])
        if par is not None and par['tag'] == 'details' and tag != 'summary':
            # 16 Oct., late: Chrome gives the content of a closed <details> a box but does not draw it (the mobile
            # section pickers of projects, profiles and articles). Captures before 16 Oct. lack the « open » flag: the
            # pickers are closed except in the states captured with them open.
            if not (par.get('open') if 'open' in par else state in OPEN_DETAILS_STATES):
                return []
        if tag == 'svg' and '>' in n.get('k', ''):
            # 16 Oct.: the direction arrow of a campus marker lies in a span of opacity 0 that the capture left out, while
            # its svg (opacity 1 of its own) was kept and hung on the marker; it is invisible on the site
            par = byI.get(n['p'])
            pcls = (par.get('cls') or '').split() if par else []
            if n['k'].rsplit('>', 1)[0] not in base['byKey'] and 'hg-marker' in pcls and 'hg-offscreen' not in pcls:
                return []
        # icons from the sprite
        if tag == 'svg' and n.get('use'):
            s = n['s']; dcs = dark_colors(dn)
            c = parse_color(s.get('stroke')) if s.get('stroke') else None
            kind_c = c or parse_color(s.get('fill')) or parse_color(s.get('color'))
            stats['icons'] += 1
            return [with_tf({'t': 'I', 'n': 'Icône · ' + n['use'].lstrip('#').replace('i-', ''), 'id': n['use'].lstrip('#'),
                             'x': r2(x0 - origin[0]), 'y': r2(y0 - origin[1]), 'w': n['w'], 'h': n['h'],
                             'col': cref('icône', kind_c, pick_dark('icône', 0, dcs)), 'st': 1 if c else 0,
                             **({'o': round(opacity(n), 3)} if opacity(n) < 0.999 else {})}, n)]
        is_ring = tag == 'svg' and ('entrance-ring' in (n.get('cls') or '').split() or (n.get('svgKids') and ring_progress(n) is not None))
        if is_ring:
            prog = ring_progress(n) if n.get('svgKids') else 1.0   # older captures without shape data: the ring is complete
            if prog is None:
                prog = 1.0
            k0 = (n.get('svgKids') or [{'stroke': n['s'].get('color'), 'sw': '1px'}])[0]
            if prog <= 0.001:
                if k0.get('cap') != 'round':
                    return []   # nothing drawn yet
                # 18 Oct.: a dash of length 0 with round caps is still drawn by Chrome: a dot as wide as the stroke at the
                # start of the path, the top of the circle once turned by −90° (« vers le logo (membre) »)
                dk0 = ((dn or {}).get('svgKids') or [{'stroke': (dn or {}).get('s', {}).get('color')}])[0] if dn else {}
                sw_ = px(k0.get('sw'), 1) * min(n['w'], n['h']) / 200   # stroke of the 200-unit viewBox, at the box scale
                return [{'t': 'F', 'n': 'Anneau de l\'entrée · point de départ', 'x': r2(x0 + n['w'] / 2 - sw_ / 2 - origin[0]),
                         'y': r2(y0 + (n['h'] - min(n['w'], n['h'])) / 2 + 4 * min(n['w'], n['h']) / 200 - sw_ / 2 - origin[1]),
                         'w': r2(sw_), 'h': r2(sw_), 'r': r2(sw_ / 2),
                         'f': [cref('icône', parse_color(k0.get('stroke')), parse_color(dk0.get('stroke')) if dk0 else None)]}]
            dk0 = ((dn or {}).get('svgKids') or [{'stroke': (dn or {}).get('s', {}).get('color')}])[0] if dn else {}
            ref = 'ring-%d' % round(prog * 100)   # one component per progress: the instance scale gives the size
            svgs_used[ref] = {'svg': ring_svg(prog, n['w'], n['h'], px(k0.get('sw'), 1)), 'ctx': ['Anneau de l\'entrée'], 'w': n['w'], 'h': n['h'],
                              'stroke': '#1B1B1B', 'fill': None, 'sw': k0.get('sw'), 'name': 'Anneau de l\'entrée/%d %%' % round(prog * 100)}
            stats['svgs'] += 1
            node = {'t': 'S', 'n': 'Anneau de l\'entrée · %d %%' % round(prog * 100), 'ref': ref, 'x': r2(x0 - origin[0]), 'y': r2(y0 - origin[1]),
                    'w': n['w'], 'h': n['h'], 'col': cref('icône', parse_color(k0.get('stroke')), parse_color(dk0.get('stroke')) if dk0 else None), 'st': 1}
            # opacity of the circle itself (16 Oct.): entrance facts, else the computed style of the shape
            cop = ((base.get('meta') or {}).get('symbol') or {}).get('circleOpacity') or (n.get('svgKids') or [{}])[0].get('op')
            try:
                op = float(cop) * opacity(n) if cop not in (None, '') else opacity(n)
            except ValueError:
                op = opacity(n)
            if op < 0.999:
                node['o'] = round(max(op, 0.0), 4)
                if op < 0.01:
                    node['n'] += ' · effacé'
            return [node]
        if tag == 'svg' and n.get('svgRef'):
            s = n['s']; dcs = dark_colors(dn)
            stroke = parse_color(s.get('stroke')) if s.get('stroke') else None
            fill = parse_color(s.get('fill')) if s.get('fill') else None
            ctx = parent_label(n)
            svgs_used.setdefault(n['svgRef'], {'svg': base['svgs'].get(n['svgRef']), 'ctx': [], 'w': n['w'], 'h': n['h'],
                                               'stroke': hex_of(stroke), 'fill': hex_of(fill), 'sw': s.get('strokeWidth')})
            svgs_used[n['svgRef']]['ctx'].append(ctx)
            stats['svgs'] += 1
            node = {'t': 'S', 'n': (ctx or 'Illustration'), 'ref': n['svgRef'], 'x': r2(x0 - origin[0]),
                    'y': r2(y0 - origin[1]), 'w': n['w'], 'h': n['h']}
            par_ = re.search(r'preserveAspectRatio="([^"]+)"', (base['svgs'].get(n['svgRef']) or '')[:600])
            if not (par_ and ('slice' in par_.group(1) or par_.group(1).strip() == 'none')):
                node['fit'] = 'contain'   # 17 Oct.: an inline SVG keeps its proportions in its box (meet), never cropped
            if icon_like(n, base['svgs'].get(n['svgRef']) or ''):
                c = stroke or fill or parse_color(s.get('color'))
                node['col'] = cref('icône', c, pick_dark('icône', 0, dcs)); node['st'] = 1 if stroke else 0
                # 17 Oct.: an outlined icon filled in its active state (« J'aime » pressed: its shapes are filled in blue)
                kf = next((parse_color(k.get('fill')) for k in (n.get('svgKids') or []) if parse_color(k.get('fill')) and parse_color(k.get('fill'))[3] > 0.001), None)
                if stroke and kf:
                    dkf = next((parse_color(k.get('fill')) for k in ((dn or {}).get('svgKids') or []) if parse_color(k.get('fill'))), None)
                    node['fc'] = cref('icône', kf, dkf if dkf is not None else pick_dark('icône', 0, dcs))
            if opacity(n) < 0.999:
                node['o'] = round(opacity(n), 3)
            return [with_tf(node, n)]
        if tag == 'img':
            # same file whether the page wrote it relative or absolute on the local server (comment avatars, 16 Oct.)
            src = re.sub(r'^https?://(?:127\.0\.0\.1|localhost)(?::\d+)?/work/visualizations/horizon-welcome/', './', n.get('src') or '')
            if src.endswith('.svg'):
                svgs_used.setdefault('file:' + src, {'file': src, 'ctx': [], 'w': n['w'], 'h': n['h']})['ctx'].append(n.get('alt') or parent_label(n))
            stats['rasters'] += 1
            node = {'t': 'P', 'n': 'Image · ' + (n.get('alt') or src.split('/')[-1])[:40], 'src': src, 'x': r2(x0 - origin[0]),
                    'y': r2(y0 - origin[1]), 'w': n['w'], 'h': n['h'], **frame_paints(n, dn, SCALE.get(n['i'], 1.0))}
            if img_tint(n):
                node['col'] = cref('icône', img_tint(n), img_tint(dn) if dn else None)
            if (n.get('s') or {}).get('objectFit') in ('contain', 'scale-down'):
                node['fit'] = 'contain'   # 16 Oct.: campus logos fit inside their box, never cropped
            return [with_tf(node, n)]
        if tag == 'canvas':
            cv = canvas_scene(n, x0 - origin[0], y0 - origin[1])
            if cv:
                stats['frames'] += 1; stats['texts'] += cv.pop('_texts', 0)
                return [cv]
            gref = globe_asset(base, fmt, n, byI)
            if gref:
                ref, label = gref
                svgs_used[ref] = {'file': ref, 'kind': 'Globe', 'name': 'Globe/' + label, 'w': n['w'], 'h': n['h'], 'ctx': []}
                stats['svgs'] += 1
                return [{'t': 'S', 'n': 'Globe · ' + label, 'ref': ref, 'x': r2(x0 - origin[0]), 'y': r2(y0 - origin[1]), 'w': n['w'], 'h': n['h']}]
            stats['rasters'] += 1
            return [{'t': 'P', 'n': 'Canvas · ' + node_name(n, 'globe'), 'src': 'canvas', 'x': r2(x0 - origin[0]),
                     'y': r2(y0 - origin[1]), 'w': n['w'], 'h': n['h']}]
        visual = is_visual(n) or clips(n) and children or opacity(n) < 0.999 or (n.get('runs') and (is_visual(n)))
        container = (n.get('s', {}).get('position') in ('fixed', 'sticky') or tag in ('dialog', 'header', 'nav', 'section', 'article', 'main', 'aside', 'form', 'button', 'a', 'li', 'ul', 'ol'))
        if depth == 0 or visual or (container and (len(children) + len(n.get('runs', []))) >= 1):
            frame = {'t': 'F', 'n': node_name(n), 'x': r2(x0 - origin[0]), 'y': r2(y0 - origin[1]), 'w': n['w'], 'h': n['h']}
            if not stacking_context(n, par):
                frame['_nsc'] = 1   # 18 Oct.: its descendants with a z-index may join its parent's paint order (hoist_z)
            if (full and H > vh + 0.5 and n.get('s', {}).get('position') == 'fixed' and not children and abs(y0 - origin[1]) < 1
                    and abs(n['h'] - vh) < 1 and abs(n['w'] - vw) < 1):
                # 18 Oct.: a childless fixed layer that covers the screen (the « atmosphere ») covers the whole of a
                # full-height frame, as in the site's full-height capture (cause K of Projets v4, N of Chroniques v2);
                # its gradients are sized in % of the box
                frame['h'] = round(H, 2)
            frame.update(frame_paints(n, dn, SCALE.get(n['i'], 1.0)))
            if clips(n):
                frame['c'] = 1
            pos = n.get('s', {}).get('position')
            if pos == 'fixed':
                frame['fx'] = 1
            elif pos == 'sticky':
                frame['sk'] = 1
            if n.get('id'):
                frame['dom'] = n['id']
            ch = []
            origin2 = (x0, y0)
            n['_kids'] = len(children)
            npseudo = 0
            after = []
            for which in ('before', 'after'):
                ps = n.get(which)
                if ps:
                    pf = pseudo_frame(ps, n, which, dn, SCALE.get(n['i'], 1.0), (vw, vh, H, full, x0, y0 - (0 if full else sy)))
                    if pf and ps.get('position') in ('absolute', 'fixed', 'relative', 'sticky'):
                        try:
                            if int(ps.get('z') or 0):
                                pf['_z'] = int(ps.get('z'))   # 17 Oct.: z-index of the pseudo-element (the header fade, 6)
                        except ValueError:
                            pass
                    if pf and which == 'before' and 'scope-path' in (n.get('cls') or '').split():
                        # 16 Oct.: the glass of the scope path is cut by the medallion's seat, a 32 px disc 22 px from the
                        # start edge (mask: radial-gradient(circle at var(--scope-seat-x) 50%, transparent 15.5px, #000 16px))
                        pf['hole'] = [r2(pf['w'] - 22 if n.get('s', {}).get('dir') == 'rtl' else 22), r2(pf['h'] / 2), 15.75]
                    if pf:
                        # 17 Oct.: ::after is painted after the element's children, ::before before them
                        (after if which == 'after' else ch).append(pf); stats['frames'] += 1; npseudo += 1
                    elif parse_blur(ps.get('backdrop')) and (ps.get('mask') or '').startswith('radial-gradient'):
                        edge = edge_blur(ps, n)
                        if edge:
                            (after if which == 'after' else ch).append(edge); stats['frames'] += 1
            if ('scope-medallion' in (n.get('cls') or '').split() and not GLOBE_DOCKED and area not in ('explorer', 'entrance')
                    and _app.get('data-section') != 'explore' and (GLOBES / 'globe-medaillon.svg').exists()):
                # (18 Oct.: a capture with the docked globe draws #globe itself, its world view and its markers, under the seat)
                # (18 Oct., review: nor on the Explorer page captured in another area, shell/member-explore: the globe
                # is undocked there, dock-navigation.mjs, and the seat only shows the button back to the world, #reset)
                # the shrunken world globe seen through the medallion of the content pages (vector disc; the ring is the span's border)
                svgs_used['globe:globe-medaillon'] = {'file': 'globe:globe-medaillon', 'kind': 'Globe', 'name': 'Globe/Médaillon des rubriques', 'w': 32, 'h': 32, 'ctx': []}
                ch.append({'t': 'S', 'n': 'Globe · médaillon', 'ref': 'globe:globe-medaillon', 'x': 0, 'y': 0, 'w': n['w'], 'h': n['h']})
                stats['svgs'] += 1
            for t in text_nodes(n, dn, strings, (x0, y0 - shift), rtl, byI.get(n['p']), SCALE.get(n['i'], 1.0), line_dir(n),
                                **text_snap(n)):
                t['y'] = r2(t['y'] + 0)
                ch.append(t); stats['texts'] += 1; stats['strings'] += 1 if t.get('sv') else 0
            if n.get('_select'):
                # Chrome's arrow of a closed <select> (18 Oct.; was the i-down icon at 19.2 px, 9.5 px from the end edge):
                # the 10 × 7 component « Flèche native de liste (Chrome) » holds the open V (centre line 8 × 4 from
                # (1, 1), stroke 2, butt caps, miter join), so its instance goes 1 px before the centre line's corner
                s = n.get('s', {}); dcs = dark_colors(dn)
                ax, ay = select_arrow_origin(n)
                ch.append({'t': 'I', 'n': 'Flèche native de liste (Chrome)', 'id': 'select-arrow', 'x': r2(ax - 1 - n['x']), 'y': r2(ay - 1 - n['y']),
                           'w': 10, 'h': 7, 'col': cref('icône', parse_color(s.get('color')), pick_dark('texte', 0, dcs)), 'st': 1})
                stats['icons'] += 1
            for c in order(children):
                ch.extend(build(c, origin2, depth + 1, shift))
            for e_ in after:
                if e_.get('_edge'):
                    # 18 Oct.: the blurred copy of what the edge blur covers (the globe of the map, drawn before it)
                    src_ = [c for c in ch if c.get('t') == 'S' and (c.get('ref') or '').startswith('globe:')]
                    if src_:
                        cp_ = copy.deepcopy(src_[0]); cp_['n'] = 'Globe · copie floutée'; cp_['e'] = [{'t': 'L', 'b': e_['_edge']}]
                        e_['ch'].append(cp_)
                    e_.pop('_edge')
            ch.extend(after)
            ch = hoist_z(ch)   # 18 Oct.
            reordered = any(t.get('_z') for t in ch)
            ch = zsort(ch)
            if ch:
                frame['ch'] = ch
            # 16 Oct., evening: no auto-layout around a pseudo-element (it would join the flow) or around a hidden or
            # positioned child (the sr-only label of .scope-path gave it a wrong gap)
            in_flow = all(not hidden(c) and c.get('s', {}).get('position') not in ('absolute', 'fixed') for c in children)
            al = flex_layout(n, [c for c in children]) if (len(ch) == len(children) and not npseudo and in_flow and not n.get('runs') and not reordered) else None
            if al and all(c.get('t') in ('F', 'I', 'S', 'P', 'C') for c in ch):
                frame['al'] = al; stats['autolayout'] += 1
            stats['frames'] += 1
            if PIXEL_SNAP and not MOVED.get(n['i']) and not frame.get('al') and not (par is not None and par.get('_al')):
                snap_frame(frame, x0, y0)
            if frame.get('al'):
                n['_al'] = 1   # its children are placed by Figma's auto-layout: they keep their measured sizes
            inst = components.occurrence(n, frame, COMP_CTX)   # 18 Oct.: an exact copy of a library variant becomes an instance
            if inst:
                stats['instances'] = stats.get('instances', 0) + 1
                return [inst]
            return [frame]
        # transparent wrapper: flatten, but keep its own texts
        out = []
        for t in text_nodes(n, dn, strings, (origin[0], origin[1] - shift), rtl, byI.get(n['p']), SCALE.get(n['i'], 1.0), line_dir(n),
                            **text_snap(n)):
            out.append(t); stats['texts'] += 1; stats['strings'] += 1 if t.get('sv') else 0
        for c in order(children):
            out.extend(build(c, origin, depth + 1, shift))
        return out

    def order(children):
        def z(c):
            s = c.get('s', {})
            pos = s.get('position')
            try:
                zi = int(s.get('z', 0))
            except ValueError:
                zi = 0
            top = 1 if c['tag'] == 'dialog' else 0
            return (top, zi if pos in ('absolute', 'fixed', 'relative', 'sticky') else 0)
        globe = next((c for c in children if c.get('id') == 'globe'), None)
        def zz(c):
            # 16 Oct.: the map credits (z-index 5) show on the site through the faded edges of the globe's canvas
            # (z-index 7, mask-image); the vector globe is opaque there, so the credits go just above it
            if globe is not None and 'map-credit' in (c.get('cls') or '').split():
                g = z(globe)
                return (g[0], g[1] + 0.5)
            return z(c)
        return sorted(children, key=zz)

    LABELS.clear()
    byI = {n['i']: n for n in base['nodes']}
    GLOBE_DOCKED = any(n.get('id') == 'app' and n.get('data-globe-docked') == 'true' for n in base['nodes'])
    # 18 Oct.: what the component hook needs to name an occurrence (section of the page, width, children, scene)
    _app = next((n for n in base['nodes'] if n.get('id') == 'app'), {})
    _route = (base.get('url') or '').split('#', 1)[1].split('/')[0].split('?')[0] if '#' in (base.get('url') or '') else ''
    COMP_CTX = {'section': _app.get('data-section') or _route or components.AREA_SECTION.get(area, ''), 'vw': vw, 'kids': kids,
                'scene': f'{area}--{state}--{fmt}--{lang}' + ('--dark' if theme == 'dark' else ''), 'lang': lang, 'theme': theme}
    # buttons and links labelled only by an inner text take that text as their layer name
    for n in base['nodes']:
        if n['tag'] in ('button', 'a', 'li') and not (n.get('aria-label') or n.get('title') or n.get('text')):
            stack = list(kids.get(n['i'], []))
            while stack:
                c = stack.pop(0)
                if c.get('text'):
                    n['_desc'] = c['text']; break
                stack[0:0] = kids.get(c['i'], [])
    def subtree_texts(a):
        out, stack = [], list(kids.get(a['i'], []))
        while stack:
            c = stack.pop(0)
            if c.get('text'):
                out.append((parse_font(c['s'].get('font'))['size'], c['text']))
            stack[0:0] = kids.get(c['i'], [])
        return out
    for n in base['nodes']:
        if n['tag'] not in ('svg', 'img'):
            continue
        a = byI.get(n['p']); label = ''
        while a is not None:
            lab = a.get('aria-label') or a.get('title') or a.get('alt')
            if lab:
                label = lab; break
            texts = subtree_texts(a)
            if len(texts) >= 2 and n['w'] > 40:
                label = max(texts, key=lambda x: x[0])[1]; break
            if len(texts) == 1:
                label = texts[0][1]; break   # an icon next to a single label (tab, button): named after that label
            if a.get('text'):
                label = a['text']; break
            a = byI.get(a['p'])
        if label:
            LABELS[n['i']] = slug(label.split(' · ')[0], 40)
    def canvas_scene(n, rx, ry):
        """Entrance message drawn in a <canvas>: one text layer per glyph on its exact baseline, scan beam layers."""
        cl = load_canvas(area, state, fmt, lang, 'light'); cd = load_canvas(area, state, fmt, lang, 'dark')
        if not cl:
            return None
        box = cl['canvas']['cssBox']
        if abs(box['x'] - n['x']) > 2 or abs(box['y'] - n['y']) > 2:
            return None
        r = cl['redraw']; rd = cd['redraw'] if cd else {'glyphs': [], 'beamSummary': None}
        ch = []
        clips = {}
        for gi, g in enumerate(r['glyphs']):
            dg = rd['glyphs'][gi] if gi < len(rd['glyphs']) else None
            jost = 'Jost' in g['fontFamilyList']
            if not jost and g['text'].strip() and all(ch in DIGITS for ch in g['text'].strip()):
                # exact DejaVu Sans Mono outlines (the browser's monospace font), one digit component instance per character
                upm = DIGITS_META['unitsPerEm']; asc_u = DIGITS_META['hhea']['ascent']; dsc_u = -DIGITS_META['hhea']['descent']
                k = g['fontSizePx'] / upm
                col = parse_color(g['color']); dg2 = rd['glyphs'][gi] if gi < len(rd['glyphs']) else None
                op = (g.get('opacity') or 1) * (g.get('colorAlpha') or 1)
                key = tuple(g['clip']) if g.get('clip') else None
                adv_u = DIGITS['0']['advance']
                # the string is centred on its anchor: start at anchor − (n × advance) / 2
                n_ch = len(g['text'])
                x_start = g['anchor'][0] - n_ch * adv_u * k / 2 if g.get('textAlign') == 'center' else g['advance'][0]
                for ci, ch in enumerate(g['text']):
                    if ch not in DIGITS:
                        continue
                    d = DIGITS[ch]
                    ref = 'dejavu-digit-' + ch
                    svgs_used[ref] = {'svg': digit_svg(d, asc_u, dsc_u), 'name': 'Glyphe du scan/DejaVu Sans Mono ' + ch,
                                      'kind': 'Glyphe', 'w': round(d['advance'] * 100 / upm, 3), 'h': round((asc_u + dsc_u) * 100 / upm, 3), 'ctx': []}
                    node = {'t': 'S', 'n': 'Chiffre ' + ch, 'ref': ref, 'x': r2(x_start + ci * adv_u * k - box['x']),
                            'y': r2(g['baselineY'] - asc_u * k - box['y']), 'w': r2(d['advance'] * k), 'h': r2((asc_u + dsc_u) * k),
                            'col': cref('texte', col, parse_color(dg2['color']) if dg2 else None), 'st': 0}
                    if op < 0.999:
                        node['o'] = round(op, 3)
                    clips.setdefault(key, []).append(node)
                continue
            fam, asc, dsc = ('Jost', 1.07, 0.375) if jost else ('Cousine', 0.8325, 0.3003)
            style = figma_font('Jost', g.get('fontWeight', 400), False)['style'] if jost else 'Regular'
            fs = g['fontSizePx']; lh = round((asc + dsc) * fs, 2)
            ax0, ax1 = g['advance']
            col = parse_color(g['color']); dcol = parse_color(dg['color']) if dg else None
            node = {'t': 'T', 'tx': g['text'], 'fn': [fam, style], 'fs': fs, 'lh': lh, 'al': 'CENTER',
                    'w': r2(max(1, ax1 - ax0)), 'x': r2(ax0 - box['x']), 'y': r2(g['baselineY'] - asc * fs - box['y']),
                    'col': cref('texte', col, dcol), 'ar': 'H'}
            try:
                sxv = float(g.get('scaleX') or 1)
            except (TypeError, ValueError):
                sxv = 1.0
            if abs(sxv - 1) > 0.005:
                node['sx'] = round(sxv, 4)   # the canvas squeezes this glyph into its cell (16 Oct.)
            op = (g.get('opacity') or 1) * (g.get('colorAlpha') or 1)
            if op < 0.999:
                node['o'] = round(op, 3)
            key = tuple(g['clip']) if g.get('clip') else None
            clips.setdefault(key, []).append(node)
        out_children = []
        beam = r.get('beamSummary')
        if beam:
            dbeam = rd.get('beamSummary') or {}
            bc = parse_color(beam['color']); dbc = parse_color(dbeam.get('color')) if dbeam else None
            for layer in beam['layers']:
                x0b, y0b, x1b, y1b = layer['page']
                out_children.append({'t': 'F', 'n': 'Barre de scan · ' + layer['role'], 'x': r2(x0b - box['x']), 'y': r2(y0b - box['y']),
                                     'w': r2(x1b - x0b), 'h': r2(y1b - y0b), 'f': [cref('fond', bc, dbc)], 'o': round(layer['alpha'] * (beam.get('opacity') or 1), 3)})
        groups = []
        for key, nodes in clips.items():
            if key is None:
                groups.extend(nodes); continue
            cx0, cy0, cx1, cy1 = key
            for nd in nodes:
                nd['x'] = r2(nd['x'] - (cx0 - box['x'])); nd['y'] = r2(nd['y'] - (cy0 - box['y']))
            groups.append({'t': 'F', 'n': 'Zone découpée du scan', 'x': r2(cx0 - box['x']), 'y': r2(cy0 - box['y']),
                           'w': r2(cx1 - cx0), 'h': r2(cy1 - cy0), 'c': 1, 'ch': nodes})
        phase = (cl.get('instant') or {}).get('phase', '')
        return {'t': 'F', 'n': 'Message chiffré · canvas (' + phase + ')', 'x': r2(rx), 'y': r2(ry), 'w': n['w'], 'h': n['h'],
                'ch': groups + out_children, '_texts': len(r['glyphs'])}

    roots = kids.get(-1, [])
    page_bg = parse_color(base.get('bodyBg')) or parse_color(base.get('htmlBg'))
    dark_bg = parse_color(dark.get('bodyBg')) if dark else None
    nodes = []
    for r in order(roots):
        nodes.extend(build(r, (0, 0 if full else sy), 0))   # 17 Oct.: a screen-high frame of a scrolled capture
    nodes = zsort(hoist_z(nodes))
    strip_z(nodes)
    glasses, expanded = glass_under_blur(nodes)   # 18 Oct.
    if glasses:
        stats['glassUnderBlur'] = len(glasses)
    if expanded:
        stats['instances'] = stats.get('instances', 0) - expanded
    components.scene_done(collected_from)
    scene = {'name': f'{area}/{state}', 'fmt': fmt, 'lang': lang, 'w': vw, 'h': round(H, 2), 'vh': vh, 'rtl': 1 if rtl else 0,
             'bg': cref('fond', page_bg, dark_bg), 'ch': nodes, 'stats': stats,
             'version': base.get('meta', {}).get('version') if isinstance(base.get('meta'), dict) else None}
    if theme == 'dark':
        scene['theme'] = 'Sombre'
    svgs_used.update(SYMBOLS_USED)
    SYMBOLS_USED.clear()
    return scene, svgs_used


def main():
    area, state, fmt = sys.argv[1:4]
    lang = sys.argv[4] if len(sys.argv) > 4 and not sys.argv[4].startswith('--') else 'fr'
    full = '--viewport' not in sys.argv
    scene, svgs = convert(area, state, fmt, lang, full)
    SCENES.mkdir(exist_ok=True)
    out = SCENES / f'{area}--{state}--{fmt}--{lang}.json'
    out.write_text(json.dumps(scene, ensure_ascii=False, separators=(',', ':')))
    (SCENES / f'{area}--{state}--{fmt}--{lang}.svgs.json').write_text(json.dumps(svgs, ensure_ascii=False))
    print(out.name, len(out.read_text()), 'chars', scene['stats'])


if __name__ == '__main__':
    main()
