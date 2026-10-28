"""Region metrics « site vs Figma » for one frame (reads only, prints numbers).
  python3 regions.py <section> <frame index> name:x,y,w,h [name:x,y,w,h ...]
Frame coordinates in CSS px, both sides at the Figma export scale. Prints the mean RGB of each side, the darkest and
lightest pixel and the share of pixels off by > 12 on a channel."""
import sys
from PIL import ImageChops
from common import load, figma_crop, site_crop
sid, fi = sys.argv[1], int(sys.argv[2])
c = load(sid, fi); k = c['k']
def stats(im):
    px = list(im.getdata()); n = len(px)
    mean = tuple(round(sum(p[i] for p in px) / n) for i in range(3))
    lum = sorted(px, key=lambda p: 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2])
    return mean, lum[0], lum[-1]
print(c['f']['name'], '| ref', c['src'].name)
for spec in sys.argv[3:]:
    nm, r = spec.split(':'); x, y, w, h = map(float, r.split(','))
    Wp, Hp = max(1, round(w * k)), max(1, round(h * k))
    fc = figma_crop(c, x, y, w, h, Wp, Hp); sc = site_crop(c, x, y, w, h, Wp, Hp)
    d = ImageChops.difference(sc, fc); ch = d.split()
    off = ImageChops.lighter(ImageChops.lighter(ch[0], ch[1]), ch[2]).point(lambda v: 255 if v > 12 else 0).histogram()[255] / (Wp * Hp)
    s, g = stats(sc), stats(fc)
    print(f'{nm:22s} site mean{s[0]} dark{s[1]} light{s[2]} | figma mean{g[0]} dark{g[1]} light{g[2]} | off12 {off:.2f}')
