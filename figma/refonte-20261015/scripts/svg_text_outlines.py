"""Vector outlines of the <text> of SVG assets, in the fonts Chrome really uses on this machine (Figma rebuild, 17 Oct. 2026).

Figma's SVG import keeps a <text> as a text layer and cannot resolve generic or missing families: « monospace »,
« Georgia, serif »… fall back to some other font (pink quote of the chronicle vignettes in Georgia 165 px, bold « & »,
« $ ./minishell », labels of ./assets/minishell-flow-demo.svg). Each such <text> is replaced by a <path> holding the
outlines of the glyphs Chrome drew, at the same size, position, anchor, letter-spacing, colour and opacity; texts in a
family Figma has (Jost of the globe labels) are kept as text.

Fonts actually used, proven on 17 Oct. by CSS.getPlatformFontsForNode in the headless Chrome of the captures (fresh
profile, journal, projects and project pages, FR and AR, and the schema file opened alone):
  - « monospace », weight 400  → DejaVu Sans Mono Book  (/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf)
  - « monospace », weight 700  → DejaVu Sans Mono Bold  (DejaVuSansMono-Bold.ttf)
  - « Georgia,serif », 400     → Liberation Serif Regular: Georgia is not installed and Chrome's default serif font,
    Times New Roman, maps to its metric-compatible Liberation Serif. fontconfig's « serif » (fc-match: Noto Serif) is
    NOT what Chrome draws.
Glyph positions follow the font advances (hmtx, no kerning pair or ligature in these strings); Chrome's own positions
(SVGTextContentElement.getStartPositionOfChar) differ by less than 0.35 user unit over a 13-character string.
Composite glyphs (accented letters: é, ç, Å…) are resolved too (Font.outline) and pass the same raster check, with
the non-zero rule of TrueType and of the SVG <path>.

Usage (library): from svg_text_outlines import outline_texts
    svg, report = outline_texts(svg_markup, context={'font-weight': '400', 'direction': 'ltr'})
CLI check: python3 svg_text_outlines.py → raster comparison of every glyph used with FreeType (Pillow), as in
font_outlines.py, printed as JSON (about one minute).
"""
import functools, pathlib, re, struct, subprocess, unicodedata
import xml.etree.ElementTree as ET
from font_outlines import TTF, segments

SVG_NS = '{http://www.w3.org/2000/svg}'
# Generic families as Chrome resolves them here (verified, see above); other generics are refused until verified.
CHROME_GENERIC = {'monospace': 'DejaVu Sans Mono', 'serif': 'Liberation Serif'}
# Named families that Figma cannot resolve either (not a Google font): their texts are outlined too.
NOT_IN_FIGMA = {'georgia'}
GENERIC_NAMES = {'monospace', 'serif', 'sans-serif', 'cursive', 'fantasy', 'system-ui', 'ui-monospace', 'ui-serif',
                 'ui-sans-serif', 'ui-rounded', 'math', 'emoji', 'fangsong'}
# Inherited properties a <text> takes from its ancestors (or from the page, for an inline SVG: see `context`).
INHERITED = ('font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'text-anchor', 'direction', 'fill')
# Attributes that only shape the text: dropped from the <path> that replaces it (fill, stroke, opacity… are kept).
TEXT_ONLY = {'x', 'y', 'dx', 'dy', 'rotate', 'textLength', 'lengthAdjust', 'font-family', 'font-size', 'font-weight',
             'font-style', 'font-variant', 'font-stretch', 'letter-spacing', 'word-spacing', 'text-anchor', 'direction',
             'unicode-bidi', 'dominant-baseline', 'alignment-baseline', 'baseline-shift', 'writing-mode', 'kerning',
             'xml:space', 'text-rendering'}
UA_DEFAULTS = {'font-family': 'serif', 'font-size': '16', 'font-weight': '400', 'font-style': 'normal',
               'letter-spacing': 'normal', 'text-anchor': 'start', 'direction': 'ltr', 'fill': '#000000'}
MIRROR = {'(': ')', ')': '(', '<': '>', '>': '<', '[': ']', ']': '[', '{': '}', '}': '{', '«': '»', '»': '«'}


class Font(TTF):
    """TrueType reader of font_outlines.py plus composite glyphs (component offsets and scales)."""

    def outline(self, gid, depth=0):
        start, length = self.glyph_range(gid)
        if length == 0:
            return []
        n = struct.unpack('>h', self.data[start: start + 2])[0]
        if n >= 0:
            return self.contours(gid)[0]
        if depth > 8:
            raise ValueError('composite glyph nesting too deep: %d' % gid)
        d, p, out = self.data, start + 10, []
        while True:
            flags, sub = struct.unpack('>HH', d[p: p + 4]); p += 4
            if flags & 1:   # ARG_1_AND_2_ARE_WORDS
                a1, a2 = struct.unpack('>hh' if flags & 2 else '>HH', d[p: p + 4]); p += 4
            else:
                a1, a2 = struct.unpack('>bb' if flags & 2 else '>BB', d[p: p + 2]); p += 2
            if not flags & 2:   # ARGS_ARE_XY_VALUES unset: point matching, not used by the fonts here
                raise ValueError('composite glyph %d places a component by point matching' % gid)
            xx, xy, yx, yy = 1.0, 0.0, 0.0, 1.0
            f2 = lambda off: struct.unpack('>h', d[off: off + 2])[0] / 16384
            if flags & 8:        # WE_HAVE_A_SCALE
                xx = yy = f2(p); p += 2
            elif flags & 0x40:   # WE_HAVE_AN_X_AND_Y_SCALE
                xx, yy = f2(p), f2(p + 2); p += 4
            elif flags & 0x80:   # WE_HAVE_A_TWO_BY_TWO
                xx, xy, yx, yy = f2(p), f2(p + 2), f2(p + 4), f2(p + 6); p += 8
            for contour in self.outline(sub, depth + 1):
                out.append([(xx * x + yx * y + a1, xy * x + yy * y + a2, on) for x, y, on in contour])
            if not flags & 0x20:   # MORE_COMPONENTS
                return out


@functools.lru_cache(maxsize=None)
def font(path):
    return Font(pathlib.Path(path))


def _fc(pattern, fmt):
    return subprocess.run(['fc-match', '-f', fmt, pattern], capture_output=True, text=True, check=True).stdout


@functools.lru_cache(maxsize=None)
def installed(family):
    out = subprocess.run(['fc-list', ':family=' + family, 'family'], capture_output=True, text=True).stdout
    return bool(out.strip())


def css_weight(w):
    w = str(w).strip().lower()
    return {'normal': 400, 'bold': 700, 'lighter': 300, 'bolder': 700}.get(w) or int(float(w))


def families(value):
    return [f.strip().strip('"\'') for f in str(value).split(',') if f.strip()]


def should_outline(family_value):
    """True when Figma cannot draw the text in the font Chrome used: generic family first, or a family absent there."""
    first = (families(family_value) or ['serif'])[0].lower()
    return first in GENERIC_NAMES or first in NOT_IN_FIGMA


@functools.lru_cache(maxsize=None)
def resolve(family_value, weight=400, italic=False):
    """Font file Chrome draws a family list with on this machine → (file, family)."""
    fc_weight = {100: 0, 200: 40, 300: 50, 400: 80, 500: 100, 600: 180, 700: 200, 800: 205, 900: 210}
    w = fc_weight.get(int(round(weight / 100.0)) * 100, 80)
    for fam in families(family_value):
        low = fam.lower()
        if low in GENERIC_NAMES:
            if low not in CHROME_GENERIC:
                raise ValueError('generic family %r not verified against Chrome yet' % fam)
            name = CHROME_GENERIC[low]
        elif installed(fam):
            name = fam
        else:
            continue   # Chrome skips a family it does not have (Georgia here)
        got = _fc('%s:weight=%d:slant=%d' % (name, w, 100 if italic else 0), '%{family}|%{file}')
        fam_got, path = got.split('|', 1)
        if name.lower() not in [f.strip().lower() for f in fam_got.split(',')]:
            raise ValueError('fontconfig gave %r for %r' % (fam_got, name))
        return path, name
    raise ValueError('no installed family in %r' % family_value)


def number(v, what):
    m = re.fullmatch(r'\s*([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*(px)?\s*', str(v))
    if not m:
        raise ValueError('unsupported %s: %r' % (what, v))
    return float(m.group(1))


def visual_order(text, rtl):
    """Characters in visual order (left → right). RTL base: minimal bidi for Latin runs and neutrals (the strings of
    these illustrations); numbers and right-to-left letters are refused rather than guessed."""
    if not rtl:
        return list(text)
    cls = []
    for ch in text:
        b = unicodedata.bidirectional(ch)
        if b in ('R', 'AL', 'EN', 'AN', 'NSM', 'LRE', 'RLE', 'LRO', 'RLO', 'PDF', 'LRI', 'RLI', 'FSI', 'PDI'):
            raise NotImplementedError('bidi class %s of %r not handled' % (b, ch))
        cls.append('L' if b == 'L' else 'N')
    # neutrals between two L take L; any other neutral takes the embedding direction (R)
    res, i = [], 0
    while i < len(cls):
        if cls[i] == 'L':
            res.append('L'); i += 1; continue
        j = i
        while j < len(cls) and cls[j] == 'N':
            j += 1
        between_l = i > 0 and j < len(cls) and cls[i - 1] == 'L' and cls[j] == 'L'
        res.extend(['L' if between_l else 'R'] * (j - i)); i = j
    runs = []
    for ch, r in zip(text, res):
        if runs and runs[-1][0] == 'L' == r:
            runs[-1][1].append(ch)
        else:
            runs.append([r, [ch]])
    out = []
    for r, chars in reversed(runs):
        if r == 'L':
            out.extend(chars)
        else:
            for ch in reversed(chars):
                if unicodedata.mirrored(ch) and ch not in MIRROR:
                    raise NotImplementedError('mirrored character %r' % ch)
                out.append(MIRROR.get(ch, ch))
    return out


def num(v):
    """Shortest SVG spelling of a value rounded to 0.01 user unit (« .5 », « -1.25 »)."""
    s = ('%.2f' % v).rstrip('0').rstrip('.')
    if s in ('-0', ''):
        return '0'
    return s.replace('0.', '.', 1) if s.startswith('0.') else (s.replace('-0.', '-.', 1) if s.startswith('-0.') else s)


class PathWriter:
    """Compact relative path data (m/l/h/v/q/z) over points already rounded to 0.01: the decoded absolute points are
    exactly the rounded ones, without drift (about 40 % shorter than absolute coordinates)."""

    def __init__(self):
        self.parts, self.cur, self.start, self.last = [], (0.0, 0.0), (0.0, 0.0), None

    def _emit(self, cmd, values):
        text = ''
        for v in values:
            t = num(v)
            if text and not t.startswith('-') and not (t.startswith('.') and '.' in text.split(' ')[-1].split('-')[-1]):
                text += ' '
            text += t
        if cmd == self.last and cmd != 'm':
            sep = '' if text.startswith('-') or (text.startswith('.') and '.' in self.parts[-1].split(' ')[-1].split('-')[-1]) else ' '
            self.parts.append(sep + text)
        else:
            self.parts.append(cmd + text)
        self.last = cmd

    def contour(self, pts_ops):
        for k, (op, pts) in enumerate(pts_ops):
            pts = [(round(x, 2), round(y, 2)) for x, y in pts]
            if op == 'M':
                self._emit('m', (round(pts[0][0] - self.cur[0], 2), round(pts[0][1] - self.cur[1], 2)))
                self.cur = self.start = pts[0]
                self.last = 'l'   # further pairs after a moveto are implicit linetos
                continue
            if op == 'L':
                end = pts[0]
                if k == len(pts_ops) - 1 and end == self.start:
                    continue   # the closing line is drawn by z
                dx, dy = round(end[0] - self.cur[0], 2), round(end[1] - self.cur[1], 2)
                if dy == 0:
                    self._emit('h', (dx,))
                elif dx == 0:
                    self._emit('v', (dy,))
                else:
                    self._emit('l', (dx, dy))
            else:
                (cx, cy), end = pts
                self._emit('q', (round(cx - self.cur[0], 2), round(cy - self.cur[1], 2),
                                 round(end[0] - self.cur[0], 2), round(end[1] - self.cur[1], 2)))
            self.cur = end
        self.parts.append('z'); self.cur = self.start; self.last = 'z'

    def text(self):
        return ''.join(self.parts)


def glyph_ops(contours, scale, dx, dy):
    """TrueType contours (font units, y up) → absolute segments in user units (y down)."""
    for contour in contours:
        if len(contour) < 2:
            continue
        yield [(op, [(dx + x * scale, dy - y * scale) for x, y in pts]) for op, pts in segments(contour)]


def layout(text, props):
    """Glyphs of one <text> → (path data, report). props: resolved font-family, font-size, font-weight, font-style,
    letter-spacing, text-anchor, direction, x, y."""
    path, family = resolve(props['font-family'], css_weight(props['font-weight']), props['font-style'] in ('italic', 'oblique'))
    f = font(path)
    size = number(props['font-size'], 'font-size')
    ls = 0.0 if str(props['letter-spacing']).strip() == 'normal' else number(props['letter-spacing'], 'letter-spacing')
    rtl = str(props['direction']).strip() == 'rtl'
    scale = size / f.upm
    chars = visual_order(text, rtl)
    glyphs = []
    for ch in chars:
        gid = f.cmap.get(ord(ch))
        if not gid:
            raise ValueError('%s has no glyph for %r' % (family, ch))
        glyphs.append((ch, gid, f.advance(gid) * scale + ls))
    total = sum(g[2] for g in glyphs)   # Chrome counts the letter-spacing after the last character too
    x, y = number(props['x'], 'x'), number(props['y'], 'y')
    anchor = str(props['text-anchor']).strip()
    if anchor == 'middle':
        left = x - total / 2
    elif (anchor == 'end') != rtl:   # end in LTR, start in RTL: the anchor is the right edge
        left = x - total
    else:
        left = x
    w, pos = PathWriter(), left
    for ch, gid, adv in glyphs:
        for ops in glyph_ops(f.outline(gid), scale, pos, y):
            w.contour(ops)
        pos += adv
    return w.text(), {'text': text, 'font': family, 'file': path, 'size': size, 'weight': css_weight(props['font-weight']),
                        'letterSpacing': ls, 'anchor': anchor, 'direction': 'rtl' if rtl else 'ltr', 'x': x, 'y': y,
                        'left': round(left, 3), 'advance': round(total, 3), 'glyphs': [(ch, gid) for ch, gid, _ in glyphs]}


def style_props(el):
    out = {}
    for decl in (el.get('style') or '').split(';'):
        if ':' in decl:
            k, v = decl.split(':', 1)
            out[k.strip()] = v.strip()
    return out


def outline_texts(svg, context=None, only_generic=True):
    """Replace every <text> Figma could not draw faithfully by the outlines of its glyphs.
    context: inherited values from outside the SVG (an inline SVG takes font-weight, direction… from the page).
    Returns (svg, reports). Texts in a family Figma has are left untouched (only_generic=True)."""
    if '<text' not in svg:
        return svg, []
    root = ET.fromstring(svg)
    parent = {c: p for p in root.iter() for c in p}
    texts = [el for el in root.iter() if el.tag in (SVG_NS + 'text', 'text')]
    matches = list(re.finditer(r'<text\b([^>]*)>(.*?)</text\s*>', svg, flags=re.S))
    if len(matches) != len(texts):
        raise ValueError('text elements: %d parsed, %d found in the markup' % (len(texts), len(matches)))
    base = {**UA_DEFAULTS, **(context or {})}
    out, last, reports = [], 0, []
    for el, m in zip(texts, matches):
        props, chain, node = dict(base), [], el
        while node is not None:
            chain.append(node); node = parent.get(node)
        for node in reversed(chain):   # root first, the text itself last
            for k in INHERITED:
                v = style_props(node).get(k, node.get(k))
                if v is not None and v != 'inherit':
                    props[k] = v
        text = re.sub(r'\s+', ' ', ''.join(el.itertext())).strip()
        if not text or (only_generic and not should_outline(props['font-family'])):
            continue   # e.g. the Jost labels of the globe: Figma has the font, the text stays editable
        if len(el):
            raise NotImplementedError('<tspan> or other child in <text>')
        for k in ('x', 'y'):
            props[k] = el.get(k, '0')
            if len(props[k].replace(',', ' ').split()) > 1:
                raise NotImplementedError('per-glyph %s list' % k)
        d, rep = layout(text, props)
        rep['fill'] = props['fill']   # resolved colour, for the reports and the raster checks
        attrs = [(k, a if q == '"' else b) for k, q, a, b in
                 re.findall(r'([\w:.-]+)\s*=\s*(?=(["\']))(?:"([^"]*)"|\'([^\']*)\')', m.group(1))]
        keep = ''.join(' %s="%s"' % (k, v.replace('"', '&quot;')) for k, v in attrs if k not in TEXT_ONLY and k not in ('style', 'fill-rule'))
        out.append(svg[last: m.start()])
        # glyph contours are wound for the non-zero rule (overlapping components of composite glyphs)
        out.append('<path d="%s"%s fill-rule="nonzero"/>' % (d, keep))
        last = m.end()
        reports.append(rep)
    out.append(svg[last:])
    return ''.join(out), reports


def raster_check(chars_by_font, size=2048, against=None):
    """Each glyph: non-zero fill of these outlines vs FreeType (Pillow, hinted, threshold 50 %) at `size` px, as in
    font_outlines.py, but at 2048 px by default: one pixel per font unit of these fonts, where FreeType's hinting no
    longer moves whole stems (at 800 px it lifts the top of DejaVu's « l » by 5 px). edge = differing pixels / inked
    pixels; interior = differing pixels farther than 2 px from any edge of the FreeType glyph (0 when the outline is
    right). against: {file: other file} draws the FreeType glyph from another font (control: a wrong font must give
    interior > 0)."""
    import numpy
    from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageFilter
    from font_outlines import flatten
    results = {}
    for path, chars in chars_by_font.items():
        f = font(path)
        ref_path = (against or {}).get(path, path)
        ft = ImageFont.truetype(ref_path, size)
        scale = size / f.upm
        base, pad = int(size * 1.25), int(size * 0.2)
        for ch in sorted(set(chars)):
            gid = f.cmap[ord(ch)]
            a = Image.new('L', (int(size * 1.6), int(size * 1.7)), 0)
            ImageDraw.Draw(a).text((pad, base), ch, font=ft, fill=255, anchor='ls')
            # non-zero winding, the rule of TrueType and of the SVG <path> (overlapping components of « ç », « Å »)
            wind = numpy.zeros((a.size[1], a.size[0]), dtype=numpy.int16)
            for poly in flatten(f.outline(gid), scale, pad, base, steps=24):
                if len(poly) < 3:
                    continue
                area = sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(poly, poly[1:] + poly[:1]))
                mask = Image.new('1', a.size, 0); ImageDraw.Draw(mask).polygon(poly, fill=1)
                wind += numpy.asarray(mask, dtype=numpy.int16) * (1 if area > 0 else -1)
            b = Image.fromarray(((wind != 0) * 255).astype(numpy.uint8), 'L')
            ba = a.point(lambda v: 255 if v >= 128 else 0)
            diff = ImageChops.difference(ba, b)
            band = ImageChops.difference(ba.filter(ImageFilter.MaxFilter(5)), ba.filter(ImageFilter.MinFilter(5)))
            interior = ImageChops.multiply(diff, ImageChops.invert(band))
            differing = diff.size[0] * diff.size[1] - diff.histogram()[0]
            inked = max(1, ba.size[0] * ba.size[1] - ba.histogram()[0])
            results['%s %s' % (pathlib.Path(path).stem, ch)] = {
                'edge': round(differing / inked, 4), 'interior': interior.size[0] * interior.size[1] - interior.histogram()[0]}
    return results


if __name__ == '__main__':
    import json
    used_serif = resolve('Georgia,serif', 400)[0]
    used = {resolve('monospace', 400)[0]: '$ ./minishellMINISHEL01·READPARSERUNOUTPUT>echo"hlo',
            resolve('monospace', 700)[0]: '&', resolve('Georgia,serif', 400)[0]: '“'}
    res = raster_check(used)
    print(json.dumps(res, ensure_ascii=False))
    print('max edge share', max(v['edge'] for v in res.values()), 'interior pixels', sum(v['interior'] for v in res.values()))
    # control: the same check against a wrong font (fontconfig's « serif », Noto Serif) must fail
    noto = _fc('serif', '%{file}')
    print('control vs', noto, json.dumps(raster_check({used_serif: '\u201c'}, against={used_serif: noto})))
