"""Couleur du fond le long d'une bande verticale, site contre Figma (vérification Chroniques v5).
  python3 bg_strip.py <planche.png> <x0> <x1> [pas=40]
"""
import sys
from PIL import Image
p = sys.argv[1]; x0, x1 = int(sys.argv[2]), int(sys.argv[3]); step = int(sys.argv[4]) if len(sys.argv) > 4 else 40
im = Image.open(p).convert('RGB'); W = (im.width - 20) // 2; H = im.height - 30
def avg(img, xa, xb, ya, yb):
    c = img.crop((xa, ya, xb, yb)); n = c.width * c.height
    r = g = b = 0
    for pr, pg, pb in c.getdata(): r += pr; g += pg; b += pb
    return (round(r / n), round(g / n), round(b / n))
for y in range(0, H - 8, step):
    a = avg(im, x0, x1, 30 + y, 30 + y + 8); f = avg(im, W + 20 + x0, W + 20 + x1, 30 + y, 30 + y + 8)
    d = max(abs(a[i] - f[i]) for i in range(3))
    print('y %5d  site %-16s figma %-16s  écart %3d %s' % (y, a, f, d, '*' * min(d, 30)))
