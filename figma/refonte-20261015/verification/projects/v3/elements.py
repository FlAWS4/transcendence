"""Element-level scan « site vs Figma » for one frame (verification helper; reads only, prints numbers, 17 Oct.).
  python3 elements.py <section> <frame index> [min delta]
For each visible text, icon, image and control of the state's DOM record (dom/<area>/<state>.json.gz), compares the
site capture and the Figma section export inside the element box, both at the export scale and slightly blurred:
mean colour per channel and the share of pixels off by more than 24 levels. Prints the elements whose mean differs by
more than <min delta> (default 14) on a channel, or with more than 35 % of their pixels off. Fixed elements (dock,
search, header backdrop) are skipped: the full captures and the Figma frames put them elsewhere than the DOM record.
Boxes smaller than 2 export pixels are skipped."""
import gzip, json, sys, pathlib
from PIL import Image, ImageChops, ImageFilter
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
AREA = 'projects'
sid, fi = sys.argv[1], int(sys.argv[2])
mind = float(sys.argv[3]) if len(sys.argv) > 3 else 14
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
fc = fc.filter(ImageFilter.GaussianBlur(0.5)); sc = sc.filter(ImageFilter.GaussianBlur(0.5))
domf = BASE / 'dom' / AREA / f'{name}.json.gz'
if not domf.exists():
    domf = BASE / 'dom' / AREA / f"{f['state']}--{f['fmt']}--{f['lang']}-light.json.gz"
d = json.load(gzip.open(domf))
nodes = d['nodes']; byi = {n['i']: n for n in nodes}
def fixed(n):
    while n is not None:
        if n.get('s', {}).get('position') in ('fixed', 'sticky'):
            return True
        n = byi.get(n['p'])
    return False
print(f['name'], '| ref', src.name, '| dom', domf.name, '| export px', (Wp, Hp))
seen = set()
for n in nodes:
    if not (n.get('text') or n['tag'] in ('svg', 'img', 'button', 'input', 'a', 'label', 'select', 'textarea')):
        continue
    if fixed(n) or n['w'] * k < 2 or n['h'] * k < 2 or n['y'] >= H or n['x'] >= f['w']:
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
