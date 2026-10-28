"""Difference map of one frame (verification helper): both sides at the Figma export scale, blurred slightly to
ignore anti-aliasing, then |site − Figma| amplified. Writes <out png> = site | Figma | diff, and prints the
bounding boxes (frame px) of the strongest difference blobs on a coarse grid.
  python3 diffmap.py <section> <frame index> <out png> [threshold]"""
import json, sys, pathlib
from PIL import Image, ImageChops, ImageFilter, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, fi, outp = sys.argv[1], int(sys.argv[2]), sys.argv[3]
thr = int(sys.argv[4]) if len(sys.argv) > 4 else 24
lay = json.loads((BASE / 'layouts' / 'explorer.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / 'call-results' / f'explorer-{sid}.png').convert('RGB')
margin = Image.new('RGB', fig.size, fig.getpixel((0, 0)))
box = ImageChops.difference(fig, margin).convert('L').point(lambda v: 255 if v > 6 else 0).getbbox()
kx, ky = (box[2] - box[0]) / sec['w'], (box[3] - box[1]) / sec['h']
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
site = Image.open(BASE / 'reference' / 'explorer' / f'{name}.png').convert('RGB')
vh = 844 if f['fmt'] == 'mobile' else 960
H = min(f['h'], vh)
fc = fig.crop((round(box[0] + f['x'] * kx), round(box[1] + f['y'] * ky), round(box[0] + (f['x'] + f['w']) * kx), round(box[1] + (f['y'] + H) * ky)))
sc = site.resize((fc.width, round(site.height * fc.width / site.width)), Image.LANCZOS).crop((0, 0, fc.width, fc.height))
a = sc.filter(ImageFilter.GaussianBlur(0.8)); b = fc.filter(ImageFilter.GaussianBlur(0.8))
d = ImageChops.difference(a, b)
ch = d.split(); m = ImageChops.lighter(ImageChops.lighter(ch[0], ch[1]), ch[2])
vis = m.point(lambda v: min(255, v * 4)).convert('RGB')
W = fc.width
board = Image.new('RGB', (W * 3 + 20, fc.height), (70, 70, 70))
board.paste(sc, (0, 0)); board.paste(fc, (W + 10, 0)); board.paste(vis, (2 * W + 20, 0))
board.save(outp)
# coarse grid of strong differences
g = 8
cells = []
px = m.load()
for gy in range(0, m.height, g):
    for gx in range(0, m.width, g):
        n = 0
        for y in range(gy, min(gy + g, m.height)):
            for x in range(gx, min(gx + g, m.width)):
                if px[x, y] > thr: n += 1
        if n >= g * g * 0.15:
            cells.append((gx, gy))
# merge cells into blobs
seen = set(); blobs = []
cs = set(cells)
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
for cnt, bb in blobs[:15]: print('  ', cnt, bb)
