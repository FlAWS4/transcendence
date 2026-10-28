"""Hotspots of a board: blocks of 16 px where site and Figma differ most (v5 check, read-only pass)."""
import sys, json
from PIL import Image, ImageChops, ImageFilter
p = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 25
im = Image.open(p).convert('RGB')
W = (im.width - 20) // 2; H = im.height - 30
a = im.crop((0, 30, W, 30 + H)); b = im.crop((W + 20, 30, W + 20 + W, 30 + H))
d = ImageChops.difference(a, b).convert('L')
B = 16
cells = []
for y in range(0, H - B + 1, B):
    for x in range(0, W - B + 1, B):
        h = d.crop((x, y, x + B, y + B)).histogram()
        s = sum(i * c for i, c in enumerate(h)) / (B * B)
        big = sum(h[41:])
        cells.append((s, big, x, y))
cells.sort(reverse=True)
for s, big, x, y in cells[:n]:
    print(f'x={x:5d} y={y:5d} mean={s:6.1f} px>40={big}')
