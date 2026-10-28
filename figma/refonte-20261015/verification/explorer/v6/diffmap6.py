"""Difference map of one frame of a v6 section capture (verification helper): both sides at the Figma export scale,
slightly blurred to ignore anti-aliasing; |site − Figma| amplified. Writes site | Figma | diff and prints the strongest
difference blobs (frame px), limited to the viewport height of the site capture.
  python3 diffmap6.py <section> <figma section png> <frame index> <out png> [threshold]"""
import json, sys, pathlib
from PIL import Image, ImageChops, ImageFilter
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, figp, fi, outp = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
thr = int(sys.argv[5]) if len(sys.argv) > 5 else 24
lay = json.loads((BASE / 'layouts' / 'explorer.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(figp).convert('RGB')
kx, ky = fig.width / (sec['w'] + 80), fig.height / (sec['h'] + 80)
kx = ky = kx if fig.width >= fig.height else ky
box = (40 * kx, 40 * ky)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
site = Image.open(BASE / 'reference' / 'explorer' / f'{name}.png').convert('RGB')
vh = 844 if f['fmt'] == 'mobile' else 960
H = min(f['h'], vh)
Wp, Hp = round(f['w'] * kx), round(H * ky)
x0, y0 = box[0] + f['x'] * kx, box[1] + f['y'] * ky
fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + f['w'] * kx, y0 + H * ky), Image.Resampling.BICUBIC)
sc = site.resize((Wp, round(site.height * Wp / site.width)), Image.LANCZOS).crop((0, 0, Wp, Hp))
a = sc.filter(ImageFilter.GaussianBlur(0.8)); b = fc.filter(ImageFilter.GaussianBlur(0.8))
d = ImageChops.difference(a, b)
ch = d.split(); m = ImageChops.lighter(ImageChops.lighter(ch[0], ch[1]), ch[2])
vis = m.point(lambda v: min(255, v * 4)).convert('RGB')
board = Image.new('RGB', (Wp * 3 + 20, Hp), (70, 70, 70))
board.paste(sc, (0, 0)); board.paste(fc, (Wp + 10, 0)); board.paste(vis, (2 * Wp + 20, 0))
board.save(outp)
g = 8; cells = []; px = m.load()
for gy in range(0, m.height, g):
    for gx in range(0, m.width, g):
        n = sum(1 for yy in range(gy, min(gy + g, m.height)) for xx in range(gx, min(gx + g, m.width)) if px[xx, yy] > thr)
        if n >= g * g * 0.15: cells.append((gx, gy))
seen = set(); blobs = []; cs = set(cells)
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
    blobs.append((cnt, [round(bb[0] / kx), round(bb[1] / ky), round(bb[2] / kx), round(bb[3] / ky)]))
blobs.sort(reverse=True)
print(f['name'], 'export size', fc.size, 'blobs (cells, frame box x0,y0,x1,y1):')
for cnt, bb in blobs[:20]: print('  ', cnt, bb)
