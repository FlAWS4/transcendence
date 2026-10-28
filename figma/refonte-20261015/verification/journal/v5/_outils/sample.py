"""Couleur moyenne et médiane d'une zone du cadre, site contre Figma (vérification Chroniques v5).
  python3 sample.py <planche.png> x0 y0 x1 y1 [x0 y0 x1 y1 ...]   (px du cadre)
"""
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB'); W = (im.width - 20) // 2
v = list(map(int, sys.argv[2:]))
def stats(img, box):
    c = img.crop(box); px = list(c.getdata()); n = len(px)
    avg = tuple(round(sum(p[i] for p in px) / n) for i in range(3))
    med = tuple(sorted(p[i] for p in px)[n // 2] for i in range(3))
    return avg, med
for i in range(0, len(v), 4):
    x0, y0, x1, y1 = v[i:i + 4]
    a = stats(im, (x0, 30 + y0, x1, 30 + y1)); f = stats(im, (W + 20 + x0, 30 + y0, W + 20 + x1, 30 + y1))
    print('[%d,%d,%d,%d] site moy %s méd %s | figma moy %s méd %s' % (x0, y0, x1, y1, a[0], a[1], f[0], f[1]))
