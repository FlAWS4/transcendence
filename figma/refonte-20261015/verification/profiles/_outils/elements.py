"""Element-level scan « site vs Figma » for one frame (verification helper, 18 Oct.; reads only, prints numbers).
  python3 elements.py <section> <frame index> [min delta] [min export px]
For each visible text, icon, image and control of the state's DOM record, compares the site capture and the Figma
export inside the element box, both at the export scale and slightly blurred: mean colour per channel and share of
pixels off by more than 24 levels. Fixed and sticky elements are skipped (placed elsewhere in full-height frames)."""
import sys
from PIL import Image, ImageChops, ImageFilter
from common import load, dom
sid, fi = sys.argv[1], int(sys.argv[2])
mind = float(sys.argv[3]) if len(sys.argv) > 3 else 14
minpx = float(sys.argv[4]) if len(sys.argv) > 4 else 2
L = load(sid, fi)
f, fig, k, o, site, dpr = L['f'], L['fig'], L['k'], L['o'], L['site'], L['dpr']
H = min(f['h'], site.height / dpr)
Wp, Hp = round(f['w'] * k), round(H * k)
x0, y0 = o + f['x'] * k, o + f['y'] * k
fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + f['w'] * k, y0 + H * k), Image.Resampling.BICUBIC)
sc = site.crop((0, 0, site.width, round(H * dpr))).resize((Wp, Hp), Image.LANCZOS)
fc = fc.filter(ImageFilter.GaussianBlur(0.5)); sc = sc.filter(ImageFilter.GaussianBlur(0.5))
d, dname = dom(L['name'])
nodes = d['nodes']; byi = {n['i']: n for n in nodes}
def fixed(n):
    while n is not None:
        if n.get('s', {}).get('position') in ('fixed', 'sticky'):
            return True
        n = byi.get(n['p'])
    return False
print(f['name'], '| ref', L['src'].name, '| dom', dname, '| export px', (Wp, Hp))
seen = set()
for n in nodes:
    if not (n.get('text') or n['tag'] in ('svg', 'img', 'button', 'input', 'a', 'label', 'select', 'textarea', 'article')):
        continue
    if fixed(n) or n['w'] * k < minpx or n['h'] * k < minpx or n['y'] >= H or n['x'] >= f['w']:
        continue
    box = (n['x'] * k, n['y'] * k, min(Wp, (n['x'] + n['w']) * k), min(Hp, (n['y'] + n['h']) * k))
    b = tuple(round(v) for v in box)
    if b[2] - b[0] < 1 or b[3] - b[1] < 1 or b in seen:
        continue
    seen.add(b)
    a, g = sc.crop(b), fc.crop(b)
    na = (b[2] - b[0]) * (b[3] - b[1])
    ma = [sum(i * c for i, c in enumerate(ch.histogram())) / na for ch in a.split()]
    mg = [sum(i * c for i, c in enumerate(ch.histogram())) / na for ch in g.split()]
    dd = ImageChops.difference(a, g).split()
    off = ImageChops.lighter(ImageChops.lighter(dd[0], dd[1]), dd[2]).point(lambda v: 255 if v > 24 else 0).histogram()[255] / na
    delta = max(abs(p - q) for p, q in zip(ma, mg))
    if delta > mind or off > 0.35:
        lab = (n.get('text') or n.get('cls') or n['tag'])[:44]
        print(f"{n['i']:4d} {n['tag']:7s} {lab:44s} [{n['x']:.0f},{n['y']:.0f} {n['w']:.0f}x{n['h']:.0f}] "
              f"site {tuple(round(v) for v in ma)} figma {tuple(round(v) for v in mg)} d{delta:.0f} off{off:.2f}")
