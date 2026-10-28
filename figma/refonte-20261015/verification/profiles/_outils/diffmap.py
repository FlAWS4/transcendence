"""Difference map of one frame at the Figma export scale (verification helper, 18 Oct.).
  python3 diffmap.py <section> <frame index> <out png> [threshold] [zoom]
Site downsampled to the export scale, both slightly blurred, |site - Figma| amplified; prints the frame-px boxes of
the strongest blobs. Covers the reference height only."""
import sys
from PIL import Image, ImageChops, ImageFilter
from common import load
sid, fi, outp = sys.argv[1], int(sys.argv[2]), sys.argv[3]
thr = int(sys.argv[4]) if len(sys.argv) > 4 else 24
zoom = float(sys.argv[5]) if len(sys.argv) > 5 else 1
L = load(sid, fi)
f, fig, k, o, site, dpr = L['f'], L['fig'], L['k'], L['o'], L['site'], L['dpr']
H = min(f['h'], site.height / dpr)
Wp, Hp = round(f['w'] * k), round(H * k)
x0, y0 = o + f['x'] * k, o + f['y'] * k
fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + f['w'] * k, y0 + H * k), Image.Resampling.BICUBIC)
sc = site.crop((0, 0, site.width, round(H * dpr))).resize((Wp, Hp), Image.LANCZOS)
a = sc.filter(ImageFilter.GaussianBlur(0.6)); b = fc.filter(ImageFilter.GaussianBlur(0.6))
d = ImageChops.difference(a, b)
ch = d.split(); m = ImageChops.lighter(ImageChops.lighter(ch[0], ch[1]), ch[2])
vis = m.point(lambda v: min(255, v * 4)).convert('RGB')
board = Image.new('RGB', (Wp * 3 + 20, Hp), (70, 70, 70))
board.paste(sc, (0, 0)); board.paste(fc, (Wp + 10, 0)); board.paste(vis, (2 * Wp + 20, 0))
if zoom != 1:
    board = board.resize((round(board.width * zoom), round(board.height * zoom)), Image.LANCZOS)
board.save(outp)
g = 3
px = m.load(); cells = []
for gy in range(0, m.height, g):
    for gx in range(0, m.width, g):
        n = sum(1 for yy in range(gy, min(gy + g, m.height)) for xx in range(gx, min(gx + g, m.width)) if px[xx, yy] > thr)
        if n >= g * g * 0.34: cells.append((gx, gy))
cs = set(cells); seen = set(); blobs = []
for c in cells:
    if c in seen: continue
    stack = [c]; seen.add(c); bb = [c[0], c[1], c[0] + g, c[1] + g]; cnt = 0
    while stack:
        cx, cy = stack.pop(); cnt += 1
        bb = [min(bb[0], cx), min(bb[1], cy), max(bb[2], cx + g), max(bb[3], cy + g)]
        for dx in (-g, 0, g):
            for dy in (-g, 0, g):
                nb = (cx + dx, cy + dy)
                if nb in cs and nb not in seen: seen.add(nb); stack.append(nb)
    blobs.append((cnt, [round(bb[0] / k), round(bb[1] / k), round(bb[2] / k), round(bb[3] / k)]))
blobs.sort(reverse=True)
print(f['name'], '| ref', L['src'].name, '| export px', (Wp, Hp), '| blobs (cells, frame box x0,y0,x1,y1):')
for cnt, bb in blobs[:25]: print('  ', cnt, bb)
