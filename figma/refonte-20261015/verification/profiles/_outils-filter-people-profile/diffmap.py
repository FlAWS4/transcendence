"""Difference map of one frame: both sides at <scale> x the Figma export scale, slightly blurred to ignore
anti-aliasing, then |site - Figma| amplified. Writes <out png> = site | Figma | diff over the compared height and
prints the strongest difference blobs (frame CSS px).
  python3 diffmap.py <section> <frame index> <out png> [threshold] [y0] [y1]"""
import sys
from PIL import Image, ImageChops, ImageFilter
from common import load, figma_crop, site_crop
sid, fi, outp = sys.argv[1], int(sys.argv[2]), sys.argv[3]
thr = int(sys.argv[4]) if len(sys.argv) > 4 else 24
c = load(sid, fi); f = c['f']; k = c['k']
dpr = c['site'].width / f['w']
site_h = c['site'].height / dpr
y0 = float(sys.argv[5]) if len(sys.argv) > 5 else c['sy']
y1 = float(sys.argv[6]) if len(sys.argv) > 6 else min(f['h'], c['sy'] + site_h)
W, H = round(f['w'] * k), round((y1 - y0) * k)
fc = figma_crop(c, 0, y0, f['w'], y1 - y0, W, H)
sc = site_crop(c, 0, y0, f['w'], y1 - y0, W, H)
a = sc.filter(ImageFilter.GaussianBlur(0.8)); b = fc.filter(ImageFilter.GaussianBlur(0.8))
d = ImageChops.difference(a, b); ch = d.split(); m = ImageChops.lighter(ImageChops.lighter(ch[0], ch[1]), ch[2])
vis = m.point(lambda v: min(255, v * 4)).convert('RGB')
board = Image.new('RGB', (W * 3 + 20, H), (70, 70, 70))
board.paste(sc, (0, 0)); board.paste(fc, (W + 10, 0)); board.paste(vis, (2 * W + 20, 0))
board.save(outp)
g = 6; px = m.load(); cells = []
for gy in range(0, m.height, g):
    for gx in range(0, m.width, g):
        n = sum(1 for yy in range(gy, min(gy + g, m.height)) for xx in range(gx, min(gx + g, m.width)) if px[xx, yy] > thr)
        if n >= g * g * 0.15: cells.append((gx, gy))
cs = set(cells); seen = set(); blobs = []
for cl in cells:
    if cl in seen: continue
    st = [cl]; seen.add(cl); bb = [cl[0], cl[1], cl[0] + g, cl[1] + g]; cnt = 0
    while st:
        cx, cy = st.pop(); cnt += 1
        bb = [min(bb[0], cx), min(bb[1], cy), max(bb[2], cx + g), max(bb[3], cy + g)]
        for dx in (-g, 0, g):
            for dy in (-g, 0, g):
                nb = (cx + dx, cy + dy)
                if nb in cs and nb not in seen: seen.add(nb); st.append(nb)
    blobs.append((cnt, [round(bb[0] / k), round(bb[1] / k + y0), round(bb[2] / k), round(bb[3] / k + y0)]))
blobs.sort(reverse=True)
print(f['name'], '| ref', c['src'].name, '| y', y0, '->', y1, '| blobs (cells, x0,y0,x1,y1 frame px):')
for cnt, bb in blobs[:18]: print('  ', cnt, bb)
