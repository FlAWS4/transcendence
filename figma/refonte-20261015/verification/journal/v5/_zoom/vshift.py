"""Best vertical/horizontal shift (frame px) between site and Figma halves of a board, in a region (v5 check)."""
import sys
from PIL import Image, ImageChops
p = sys.argv[1]; x0, y0, x1, y1 = map(int, sys.argv[2:6]); R = int(sys.argv[6]) if len(sys.argv) > 6 else 6
im = Image.open(p).convert('L'); W = (im.width - 20) // 2
a = im.crop((x0, 30 + y0, x1, 30 + y1))
best = None
for dy in range(-R, R + 1):
    for dx in range(-R, R + 1):
        b = im.crop((W + 20 + x0 + dx, 30 + y0 + dy, W + 20 + x1 + dx, 30 + y1 + dy))
        h = ImageChops.difference(a, b).histogram(); s = sum(i * c for i, c in enumerate(h)) / sum(h)
        if best is None or s < best[0]: best = (s, dx, dy)
b0 = im.crop((W + 20 + x0, 30 + y0, W + 20 + x1, 30 + y1)); h = ImageChops.difference(a, b0).histogram()
print(p.split('/')[-1], (x0, y0, x1, y1), 'mean diff at 0:', round(sum(i * c for i, c in enumerate(h)) / sum(h), 2), 'best', [round(best[0], 2), best[1], best[2]])
