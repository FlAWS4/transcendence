"""Best shift of the Figma half against the site half for a region (v2 journal check, 17 Oct. 2026).
  python3 shift.py <board png> <x> <y> <w> <h> [range]
Upsamples by 4 to find quarter-pixel shifts; prints the best (dx, dy) in frame pixels and the error before/after.
"""
import sys
import numpy as np
from PIL import Image
b = sys.argv[1]; x, y, w, h = map(int, sys.argv[2:6]); R = int(sys.argv[6]) if len(sys.argv) > 6 else 4
im = Image.open(b).convert('L')
W = (im.width - 20) // 2
U = 4
def get(ox, oy, ww, hh):
    return np.asarray(im.crop((ox, 30 + oy, ox + ww, 30 + oy + hh)).resize((ww * U, hh * U), Image.BICUBIC), dtype=float)
s = get(x, y, w, h)
f = get(W + 20 + x - R, y - R, w + 2 * R, h + 2 * R)
best = None
for dy in range(0, 2 * R * U + 1):
    for dx in range(0, 2 * R * U + 1):
        e = np.abs(f[dy:dy + h * U, dx:dx + w * U] - s).mean()
        if best is None or e < best[0]:
            best = (e, dx, dy)
e0 = np.abs(f[R * U:R * U + h * U, R * U:R * U + w * U] - s).mean()
print('region', (x, y, w, h), 'err0 %.2f' % e0, 'best err %.2f' % best[0], 'figma shift dx=%+.2f dy=%+.2f (figma content is at site+shift)' % (best[1] / U - R, best[2] / U - R))
