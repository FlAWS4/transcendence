"""Region metrics « site vs Figma v6 » for one frame (verification helper; reads only, prints numbers).
  python3 regions6.py <section> <figma section png> <frame index> name:x,y,w,h [name:x,y,w,h …]
Frame coordinates in CSS px. Mean RGB of each side (site resampled to the Figma export scale) and share of pixels
with a channel off by more than 12 levels."""
import json, sys, pathlib
from PIL import Image, ImageChops
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, figp, fi = sys.argv[1], sys.argv[2], int(sys.argv[3])
lay = json.loads((BASE / 'layouts' / 'explorer.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(figp).convert('RGB')
k = fig.width / (sec['w'] + 80)
box = (40 * k, 40 * k)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
site = Image.open(BASE / 'reference' / 'explorer' / f'{name}.png').convert('RGB')
dpr = site.width / f['w']
def stats(im):
    px = list(im.getdata()); n = len(px)
    return tuple(round(sum(p[i] for p in px) / n, 1) for i in range(3))
for spec in sys.argv[4:]:
    nm, r = spec.split(':'); x, y, w, h = map(float, r.split(','))
    W, H = max(1, round(w * k)), max(1, round(h * k))
    sc = site.transform((W, H), Image.Transform.EXTENT, (x * dpr, y * dpr, (x + w) * dpr, (y + h) * dpr), Image.Resampling.BILINEAR)
    x0, y0 = box[0] + (f['x'] + x) * k, box[1] + (f['y'] + y) * k
    fc = fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BILINEAR)
    d = ImageChops.difference(sc, fc); ch = d.split()
    off = ImageChops.lighter(ImageChops.lighter(ch[0], ch[1]), ch[2]).point(lambda v: 255 if v > 12 else 0).histogram()[255] / (W * H)
    print(f'{nm:26s} site {stats(sc)}  figma {stats(fc)}  off12 {off:.3f}')
