"""Fast vertical (and small horizontal) offset of a region of the Figma half against the site half of a board
(media / authors / comments check, journal v2, 17 Oct. 2026). Integer search, then a parabola for the sub-pixel part.
  python3 vshift_mac.py <board png> <x> <y> <w> <h> <dy range> [dx range]
Prints the best (dx, dy): the Figma content is at site position + (dx, dy).
"""
import sys
import numpy as np
from PIL import Image
b = sys.argv[1]; x, y, w, h, R = map(int, sys.argv[2:7]); RX = int(sys.argv[7]) if len(sys.argv) > 7 else 2
im = np.asarray(Image.open(b).convert('L'), dtype=float)
W = (im.shape[1] - 20) // 2
s = im[30 + y:30 + y + h, x:x + w]
best = None; errs = {}
for dy in range(-R, R + 1):
    if 30 + y + dy < 30 or 30 + y + dy + h > im.shape[0]:
        continue
    for dx in range(-RX, RX + 1):
        f = im[30 + y + dy:30 + y + dy + h, W + 20 + x + dx:W + 20 + x + dx + w]
        if f.shape != s.shape:
            continue
        e = np.abs(f - s).mean(); errs[(dx, dy)] = e
        if best is None or e < best[0]:
            best = (e, dx, dy)
e0 = errs.get((0, 0))
e, dx, dy = best
def para(a, b_, c):
    d = a - 2 * b_ + c
    return 0.0 if d <= 0 else 0.5 * (a - c) / d
sy = para(errs.get((dx, dy - 1), e), e, errs.get((dx, dy + 1), e))
sx = para(errs.get((dx - 1, dy), e), e, errs.get((dx + 1, dy), e))
print('region', (x, y, w, h), 'err0 %s' % ('%.2f' % e0 if e0 is not None else '-'), 'best err %.2f' % e, 'figma at site + (dx=%+.2f, dy=%+.2f)' % (dx + sx, dy + sy))
