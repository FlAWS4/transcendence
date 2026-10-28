"""Tint drift of a board (media / authors / comments check, 17 Oct. 2026): splits the pixels whose channel error is
above 12 between flat areas (site locally uniform) and edges, and prints the mean signed error (Figma − site) per
channel in the flat areas, by horizontal band.
  python3 tint_mac.py <board png> [band height]
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
b = sys.argv[1]; bh = int(sys.argv[2]) if len(sys.argv) > 2 else 120
im = Image.open(b).convert('RGB')
W = (im.width - 20) // 2; H = im.height - 30
s = np.asarray(im.crop((0, 30, W, 30 + H)), dtype=float)
f = np.asarray(im.crop((W + 20, 30, 2 * W + 20, 30 + H)), dtype=float)
g = np.asarray(im.crop((0, 30, W, 30 + H)).convert('L').filter(ImageFilter.FIND_EDGES), dtype=float)
gm = np.asarray(Image.fromarray(g.astype('uint8')).filter(ImageFilter.MaxFilter(7)), dtype=float)
flat = gm < 6
flat[:, :4] = False; flat[:, -4:] = False
d = f - s
off = np.abs(d).max(axis=2) > 12
print(b.split('/')[-1], 'off12 total %.4f, in flat areas %.4f, flat share %.2f' % (off.mean(), (off & flat).mean(), flat.mean()))
for y in range(0, H, bh):
    sl = slice(y, min(H, y + bh))
    m = flat[sl]
    if m.sum() < 50: continue
    md = d[sl][m].mean(axis=0); o = (off[sl] & m).mean()
    sc = s[sl][m].mean(axis=0)
    print('  y %4d-%4d flat %.2f  site %s  Figma−site %s  off12(flat) %.3f' % (y, min(H, y + bh), m.mean(), np.round(sc).astype(int), np.round(md, 1), o))
