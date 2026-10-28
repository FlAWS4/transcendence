"""Where did the Figma half change between two passes of the same board (v2 → v5)? Blocks of 16 px (v5 check)."""
import sys
from PIL import Image, ImageChops
p1, p2 = sys.argv[1], sys.argv[2]; n = int(sys.argv[3]) if len(sys.argv) > 3 else 20
def fig(p):
    im = Image.open(p).convert('L'); W = (im.width - 20) // 2
    return im.crop((W + 20, 30, W + 20 + W, im.height))
a, b = fig(p1), fig(p2)
w, h = min(a.width, b.width), min(a.height, b.height)
d = ImageChops.difference(a.crop((0, 0, w, h)), b.crop((0, 0, w, h)))
B = 16; cells = []
for y in range(0, h - B + 1, B):
    for x in range(0, w - B + 1, B):
        hh = d.crop((x, y, x + B, y + B)).histogram(); s = sum(i * c for i, c in enumerate(hh)) / (B * B)
        if s > 6: cells.append((s, x, y))
cells.sort(reverse=True)
# merge into row bands for readability
rows = {}
for s, x, y in cells:
    rows.setdefault(y, []).append((x, round(s, 1)))
for y in sorted(rows)[:200]:
    xs = sorted(rows[y]); print(f'y={y:5d} n={len(xs):3d} x={xs[0][0]}..{xs[-1][0]+16} max={max(v for _, v in xs)}')
