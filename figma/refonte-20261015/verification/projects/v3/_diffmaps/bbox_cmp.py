"""Bounding box and centroid of the « ink » of a region, site vs Figma, at a common magnified scale (verification
helper, read-only on sources, 17 Oct. 2026).
  python3 bbox_cmp.py <section> <frame substring> <x> <y> <w> <h> [threshold]
The site crop is reduced to the export scale (box filter); the ink is every pixel off the region's corner colour by
more than <threshold> (default 30) on a channel. Prints both boxes and centroids in frame CSS px."""
import json, sys, pathlib
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image
from figlib import BASE
sid, sub, x, y, w, h = sys.argv[1:7]
x, y, w, h = map(float, (x, y, w, h))
thr = int(sys.argv[7]) if len(sys.argv) > 7 else 30
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = next(f for row in sec['rows'] for f in row if sub in f['name'])
fig = Image.open(BASE / f'call-results/projects-{sid}-v3.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
ref = BASE / 'reference/projects'
full = ref / f'{name}--full.png'; vp = ref / f'{name}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB'); dpr = site.width / f['w']
M = 4   # supersampling of both sides for sub-pixel boxes
Wp, Hp = round(w * k * M), round(h * k * M)
sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr))).resize((round(w * k), round(h * k)), Image.BOX).resize((Wp, Hp), Image.BILINEAR)
x0, y0 = 40 * k + (f['x'] + x) * k, 40 * k + (f['y'] + y) * k
fc = fig.transform((round(w * k), round(h * k)), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BILINEAR).resize((Wp, Hp), Image.BILINEAR)
def ink(im):
    bg = im.getpixel((1, 1)); px = im.load(); xs = ys = n = 0; bb = [Wp, Hp, 0, 0]
    for j in range(Hp):
        for i in range(Wp):
            p = px[i, j]
            if max(abs(p[c] - bg[c]) for c in range(3)) > thr:
                n += 1; xs += i; ys += j; bb = [min(bb[0], i), min(bb[1], j), max(bb[2], i), max(bb[3], j)]
    s = 1 / (k * M)
    return (n, [round(x + bb[0] * s, 1), round(y + bb[1] * s, 1), round(x + bb[2] * s, 1), round(y + bb[3] * s, 1)],
            (round(x + xs / max(n, 1) * s, 1), round(y + ys / max(n, 1) * s, 1)))
print(f['name'], 'scale', round(k, 4))
print(' site ', ink(sc))
print(' figma', ink(fc))
