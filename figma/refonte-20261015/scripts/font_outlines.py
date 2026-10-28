"""Vector outlines of the digits drawn by the entrance canvas in binary and hexadecimal (Figma rebuild, 15 Oct 2026).

The renderer asks for `ui-monospace, SFMono-Regular, monospace`. In the capture (headless Chrome on this Linux machine)
neither ui-monospace nor SFMono-Regular exists, so Chrome uses its default fixed font, DejaVu Sans Mono Book (pixel
identity proven in ../dom/entrance/_fonts.json). That font is not offered by Figma's Google Fonts: its outlines are
exported here so the 0-9 digits can be redrawn exactly. Only the glyphs needed by the message bytes are required
(0-9; the bytes 0x25-0x78 of the ciphertext never use A-F), the whole 0-9 set is exported.

No dependency: a minimal reader of the TrueType tables head, hhea, hmtx, cmap (format 4), loca and glyf (simple
glyphs), checked against FreeType (Pillow) by rasterising both at 800 px.
Usage: python3 figma/refonte-20261015/scripts/font_outlines.py
Writes ../assets/entrance/dejavu-sans-mono-digits.json and .svg (specimen).
"""
import json, pathlib, struct

FONT = pathlib.Path('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf')
OUT = pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'entrance'
CHARS = '0123456789'


class TTF:
    def __init__(self, path):
        self.data = data = path.read_bytes()
        count = struct.unpack('>H', data[4:6])[0]
        self.tables = {}
        for i in range(count):
            tag, _, off, length = struct.unpack('>4sIII', data[12 + 16 * i: 28 + 16 * i])
            self.tables[tag.decode('latin-1')] = (off, length)
        head = self.tables['head'][0]
        self.upm = struct.unpack('>H', data[head + 18: head + 20])[0]
        self.loca_long = struct.unpack('>h', data[head + 50: head + 52])[0] == 1
        hhea = self.tables['hhea'][0]
        self.ascent, self.descent, self.line_gap = struct.unpack('>hhh', data[hhea + 4: hhea + 10])
        self.num_hmetrics = struct.unpack('>H', data[hhea + 34: hhea + 36])[0]
        maxp = self.tables['maxp'][0]
        self.num_glyphs = struct.unpack('>H', data[maxp + 4: maxp + 6])[0]
        self.cmap = self._cmap()

    def _cmap(self):
        d = self.data; base = self.tables['cmap'][0]
        n = struct.unpack('>H', d[base + 2: base + 4])[0]
        for i in range(n):
            pid, eid, off = struct.unpack('>HHI', d[base + 4 + 8 * i: base + 12 + 8 * i])
            sub = base + off
            if struct.unpack('>H', d[sub: sub + 2])[0] == 4 and pid in (0, 3):
                segx2 = struct.unpack('>H', d[sub + 6: sub + 8])[0]; seg = segx2 // 2
                ends = struct.unpack('>%dH' % seg, d[sub + 14: sub + 14 + segx2])
                starts = struct.unpack('>%dH' % seg, d[sub + 16 + segx2: sub + 16 + 2 * segx2])
                deltas = struct.unpack('>%dh' % seg, d[sub + 16 + 2 * segx2: sub + 16 + 3 * segx2])
                ro_pos = sub + 16 + 3 * segx2
                ranges = struct.unpack('>%dH' % seg, d[ro_pos: ro_pos + segx2])
                table = {}
                for s in range(seg):
                    for code in range(starts[s], ends[s] + 1):
                        if code == 0xFFFF: continue
                        if ranges[s] == 0: gid = (code + deltas[s]) & 0xFFFF
                        else:
                            at = ro_pos + 2 * s + ranges[s] + 2 * (code - starts[s])
                            gid = struct.unpack('>H', d[at: at + 2])[0]
                            if gid: gid = (gid + deltas[s]) & 0xFFFF
                        table[code] = gid
                return table
        raise ValueError('no format 4 cmap')

    def advance(self, gid):
        off = self.tables['hmtx'][0]
        i = min(gid, self.num_hmetrics - 1)
        return struct.unpack('>H', self.data[off + 4 * i: off + 4 * i + 2])[0]

    def glyph_range(self, gid):
        off = self.tables['loca'][0]
        if self.loca_long: a, b = struct.unpack('>II', self.data[off + 4 * gid: off + 4 * gid + 8])
        else: a, b = (2 * v for v in struct.unpack('>HH', self.data[off + 2 * gid: off + 2 * gid + 4]))
        return self.tables['glyf'][0] + a, b - a

    def contours(self, gid):
        start, length = self.glyph_range(gid)
        if length == 0: return [], None
        d = self.data
        n, xmin, ymin, xmax, ymax = struct.unpack('>hhhhh', d[start: start + 10])
        if n < 0: raise ValueError('composite glyph not supported')
        p = start + 10
        ends = struct.unpack('>%dH' % n, d[p: p + 2 * n]); p += 2 * n
        ilen = struct.unpack('>H', d[p: p + 2])[0]; p += 2 + ilen
        total = ends[-1] + 1
        flags = []
        while len(flags) < total:
            f = d[p]; p += 1; flags.append(f)
            if f & 8:
                r = d[p]; p += 1; flags.extend([f] * r)
        def coords(short_bit, same_bit):
            nonlocal p
            out, v = [], 0
            for f in flags:
                if f & short_bit:
                    delta = d[p]; p += 1
                    v += delta if f & same_bit else -delta
                elif not f & same_bit:
                    v += struct.unpack('>h', d[p: p + 2])[0]; p += 2
                out.append(v)
            return out
        xs = coords(2, 16); ys = coords(4, 32)
        result, s = [], 0
        for e in ends:
            result.append([(xs[i], ys[i], bool(flags[i] & 1)) for i in range(s, e + 1)]); s = e + 1
        return result, (xmin, ymin, xmax, ymax)


def segments(contour):
    """TrueType quadratic contour → list of ('M'|'L'|'Q', points) with implied on-curve points."""
    pts = contour[:]
    if not pts[0][2]:
        if pts[-1][2]: pts = [pts[-1]] + pts[:-1]
        else: pts = [((pts[0][0] + pts[-1][0]) / 2, (pts[0][1] + pts[-1][1]) / 2, True)] + pts
    out = [('M', [pts[0][:2]])]
    i, n = 1, len(pts)
    while i <= n:
        cur = pts[i % n]
        if cur[2]:
            out.append(('L', [cur[:2]])); i += 1
        else:
            nxt = pts[(i + 1) % n]
            end = nxt[:2] if nxt[2] else ((cur[0] + nxt[0]) / 2, (cur[1] + nxt[1]) / 2)
            out.append(('Q', [cur[:2], end])); i += 1 if not nxt[2] else 2
    return out


def svg_path(contours, flip=True, scale=1.0, dx=0.0, dy=0.0):
    f = lambda x, y: (round(dx + x * scale, 3), round(dy + (-y if flip else y) * scale, 3))
    parts = []
    for contour in contours:
        for op, points in segments(contour):
            parts.append(op + ' ' + ' '.join('%g %g' % f(*pt) for pt in points))
        parts.append('Z')
    return ' '.join(parts)


def flatten(contours, scale, dx, dy, steps=16):
    polys = []
    for contour in contours:
        poly, cur = [], None
        for op, points in segments(contour):
            if op in ('M', 'L'):
                cur = points[0]; poly.append(cur)
            else:
                c, e = points
                for k in range(1, steps + 1):
                    t = k / steps
                    poly.append(((1 - t) ** 2 * cur[0] + 2 * (1 - t) * t * c[0] + t * t * e[0], (1 - t) ** 2 * cur[1] + 2 * (1 - t) * t * c[1] + t * t * e[1]))
                cur = e
        polys.append([(dx + x * scale, dy - y * scale) for x, y in poly])
    return polys


def check(font, glyphs, size=800):
    """Raster comparison with FreeType: share of differing pixels (even-odd fill of the outline vs Pillow text)."""
    from PIL import Image, ImageDraw, ImageFont, ImageChops
    ft = ImageFont.truetype(str(FONT), size)
    scale = size / font.upm; base = int(size * 1.2)
    results = {}
    for ch, g in glyphs.items():
        a = Image.new('L', (size, int(size * 1.6)), 0)
        ImageDraw.Draw(a).text((0, base), ch, font=ft, fill=255, anchor='ls')
        b = Image.new('L', a.size, 0); draw = ImageDraw.Draw(b)
        for poly in flatten(g['_contours'], scale, 0, base):
            mask = Image.new('L', a.size, 0); ImageDraw.Draw(mask).polygon(poly, fill=255)
            b = ImageChops.logical_xor(b.convert('1'), mask.convert('1')).convert('L')
        ba, bb = a.point(lambda v: 255 if v >= 128 else 0), b
        diff = ImageChops.difference(ba, bb)
        differing = diff.size[0] * diff.size[1] - diff.histogram()[0]
        inked = max(1, ba.size[0] * ba.size[1] - ba.histogram()[0])
        results[ch] = round(differing / inked, 4)
    return results


def main():
    font = TTF(FONT)
    glyphs = {}
    for ch in CHARS:
        gid = font.cmap[ord(ch)]
        contours, bbox = font.contours(gid)
        glyphs[ch] = {'glyphId': gid, 'advance': font.advance(gid), 'bbox': bbox, 'path': svg_path(contours), '_contours': contours}
    quality = check(font, glyphs)
    OUT.mkdir(parents=True, exist_ok=True)
    data = {'font': 'DejaVu Sans Mono Book', 'file': str(FONT), 'version': 'Version 2.37', 'unitsPerEm': font.upm,
            'hhea': {'ascent': font.ascent, 'descent': font.descent, 'lineGap': font.line_gap},
            'coordinates': 'path in font units, y axis pointing down with the alphabetic baseline at y = 0 (SVG convention): '
                           'scale by fontSizePx / unitsPerEm and translate to (advance left, baselineY) of each glyph of the canvas redraw list',
            'rasterCheck': {'method': 'even-odd fill of these paths vs FreeType (Pillow, hinted, threshold 50 %) at 800 px; value = differing pixels / inked pixels (edge pixels only: the best alignment is the zero offset)', 'result': quality},
            'glyphs': {ch: {k: v for k, v in g.items() if not k.startswith('_')} for ch, g in glyphs.items()}}
    (OUT / 'dejavu-sans-mono-digits.json').write_text(json.dumps(data, indent=1))
    size, pad = 120, 20; adv = font.advance(font.cmap[ord('0')]) * size / font.upm
    width = int(pad * 2 + adv * len(CHARS)); height = int(size * 1.6)
    paths = ''.join(f'<path d="{svg_path(g["_contours"], scale=size / font.upm, dx=pad + i * adv, dy=size * 1.2)}"/>' for i, g in enumerate(glyphs.values()))
    (OUT / 'dejavu-sans-mono-digits.svg').write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">'
        f'<rect width="100%" height="100%" fill="#fff"/><line x1="0" x2="{width}" y1="{size * 1.2}" y2="{size * 1.2}" stroke="#00BABC" stroke-width="1"/>'
        f'<g fill="#1B1B1B" fill-rule="nonzero">{paths}</g></svg>\n')
    print(json.dumps(quality), 'advance', font.advance(font.cmap[ord('0')]), 'upm', font.upm)


if __name__ == '__main__':
    main()
