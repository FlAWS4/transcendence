"""Region metrics « site vs Figma » for one frame (verification helper; reads only, prints numbers, 17 Oct.).
  python3 regions.py <section> <frame index> name:x,y,w,h [name:x,y,w,h …]
Frame coordinates in CSS px. Both sides at the Figma export scale (same box and scale as section_frames.py v3).
Prints the mean RGB of each side, the darkest and lightest pixel (luminance), and the share of pixels off by > 12."""
import json, sys, pathlib
from PIL import Image, ImageChops
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
AREA = 'projects'
sid, fi = sys.argv[1], int(sys.argv[2])
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
def stats(im):
    px = list(im.getdata()); n = len(px)
    mean = tuple(round(sum(p[i] for p in px) / n) for i in range(3))
    lum = sorted(px, key=lambda p: 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2])
    return mean, lum[0], lum[-1]
print(f['name'], '| ref', src.name)
for spec in sys.argv[3:]:
    nm, r = spec.split(':'); x, y, w, h = map(float, r.split(','))
    Wp, Hp = max(1, round(w * k)), max(1, round(h * k))
    x0, y0 = ox + (f['x'] + x) * k, oy + (f['y'] + y) * k
    fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BICUBIC)
    sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr))).resize((Wp, Hp), Image.LANCZOS)
    d = ImageChops.difference(sc, fc); ch = d.split()
    off = ImageChops.lighter(ImageChops.lighter(ch[0], ch[1]), ch[2]).point(lambda v: 255 if v > 12 else 0).histogram()[255] / (Wp * Hp)
    s, g = stats(sc), stats(fc)
    print(f'{nm:22s} site mean{s[0]} dark{s[1]} light{s[2]} | figma mean{g[0]} dark{g[1]} light{g[2]} | off12 {off:.2f}')
