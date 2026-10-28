"""Difference map of one frame at the Figma export scale (verification helper, read-only on sources, 17 Oct.).
  python3 diffmap.py <section> <frame index> <out png> [threshold] [zoom]
Both sides at the export scale (site downsampled), slightly blurred to ignore anti-aliasing, then |site - Figma|
amplified. Writes site | Figma | diff (optionally enlarged) and prints the frame-px boxes of the strongest blobs.
The site side covers the reference height only (viewport capture when there is no full capture)."""
import json, sys, pathlib
from PIL import Image, ImageChops, ImageFilter
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
AREA = 'projects'
sid, fi, outp = sys.argv[1], int(sys.argv[2]), sys.argv[3]
thr = int(sys.argv[4]) if len(sys.argv) > 4 else 24
zoom = float(sys.argv[5]) if len(sys.argv) > 5 else 1
lay = json.loads((BASE / 'layouts' / f'{AREA}.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / 'call-results' / f'{AREA}-{sid}-v3.png').convert('RGB')
kx, ky = fig.width / (sec['w'] + 80), fig.height / (sec['h'] + 80)
k = kx if fig.width >= fig.height else ky
ox = oy = 40 * k
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / 'reference' / AREA / f'{name}--full.png'
vp = BASE / 'reference' / AREA / f'{name}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB')
dpr = site.width / f['w']
H = min(f['h'], site.height / dpr)
Wp, Hp = round(f['w'] * k), round(H * k)
x0, y0 = ox + f['x'] * k, oy + f['y'] * k
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
g = 4
px = m.load(); cells = []
for gy in range(0, m.height, g):
    for gx in range(0, m.width, g):
        n = sum(1 for yy in range(gy, min(gy + g, m.height)) for xx in range(gx, min(gx + g, m.width)) if px[xx, yy] > thr)
        if n >= g * g * 0.25: cells.append((gx, gy))
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
print(f['name'], '| ref', src.name, '| export px', (Wp, Hp), '| blobs (cells, frame box x0,y0,x1,y1):')
for cnt, bb in blobs[:20]: print('  ', cnt, bb)
