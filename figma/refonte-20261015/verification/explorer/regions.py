"""Region metrics « site vs Figma » for one frame (verification helper; reads only, prints numbers).
  python3 regions.py <section> <frame index> name:x,y,w,h [name:x,y,w,h …]
Frame coordinates in CSS px. Prints mean RGB of each side and the share of pixels off by more than 12 levels."""
import json, sys, pathlib
from PIL import Image, ImageChops
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, fi = sys.argv[1], int(sys.argv[2])
lay = json.loads((BASE / 'layouts' / 'explorer.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / 'call-results' / f'explorer-{sid}.png').convert('RGB')
margin = Image.new('RGB', fig.size, fig.getpixel((0, 0)))
box = ImageChops.difference(fig, margin).convert('L').point(lambda v: 255 if v > 6 else 0).getbbox()
kx, ky = (box[2] - box[0]) / sec['w'], (box[3] - box[1]) / sec['h']
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
site = Image.open(BASE / 'reference' / 'explorer' / f'{name}.png').convert('RGB')
dpr = site.width / f['w']
def stats(im):
    px = list(im.getdata()); n = len(px)
    return tuple(round(sum(p[i] for p in px) / n, 1) for i in range(3))
for spec in sys.argv[3:]:
    nm, r = spec.split(':'); x, y, w, h = map(float, r.split(','))
    sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr)))
    fc = fig.crop((round(box[0] + (f['x'] + x) * kx), round(box[1] + (f['y'] + y) * ky), round(box[0] + (f['x'] + x + w) * kx), round(box[1] + (f['y'] + y + h) * ky)))
    sc2 = sc.resize(fc.size, Image.LANCZOS)
    d = ImageChops.difference(sc2, fc); ch = d.split()
    off = ImageChops.lighter(ImageChops.lighter(ch[0], ch[1]), ch[2]).point(lambda v: 255 if v > 12 else 0).histogram()[255] / (fc.width * fc.height)
    print(f'{nm:24s} site {stats(sc2)}  figma {stats(fc)}  off12 {off:.3f}')
