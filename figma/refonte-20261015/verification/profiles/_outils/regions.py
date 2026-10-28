"""Region metrics « site vs Figma » for one frame (verification helper, 18 Oct.).
  python3 regions.py <section> <frame index> name:x,y,w,h [name:x,y,w,h …]
Frame coordinates in CSS px, both sides at the Figma export scale. Prints mean RGB, darkest and lightest pixel."""
import sys
from PIL import Image, ImageChops
from common import load
sid, fi = sys.argv[1], int(sys.argv[2])
L = load(sid, fi)
f, fig, k, o, site, dpr = L['f'], L['fig'], L['k'], L['o'], L['site'], L['dpr']
def stats(im):
    px = list(im.getdata()); n = len(px)
    mean = tuple(round(sum(p[i] for p in px) / n) for i in range(3))
    lum = sorted(px, key=lambda p: 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2])
    return mean, lum[0], lum[-1]
print(f['name'], '| ref', L['src'].name)
for spec in sys.argv[3:]:
    nm, r = spec.split(':'); x, y, w, h = map(float, r.split(','))
    Wp, Hp = max(1, round(w * k)), max(1, round(h * k))
    x0, y0 = o + (f['x'] + x) * k, o + (f['y'] + y) * k
    fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BICUBIC)
    sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr))).resize((Wp, Hp), Image.LANCZOS)
    d = ImageChops.difference(sc, fc); ch = d.split()
    off = ImageChops.lighter(ImageChops.lighter(ch[0], ch[1]), ch[2]).point(lambda v: 255 if v > 12 else 0).histogram()[255] / (Wp * Hp)
    s, g = stats(sc), stats(fc)
    print(f'{nm:22s} site mean{s[0]} dark{s[1]} light{s[2]} | figma mean{g[0]} dark{g[1]} light{g[2]} | off12 {off:.2f}')
