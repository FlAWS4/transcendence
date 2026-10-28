"""Site region next to a Figma region shifted by (dx, dy) frame px (journal v2 check, reprise 17 Oct.)
  python3 zoom_shift.py <board> <out> x0 y0 x1 y1 dx dy [scale]"""
import sys
from PIL import Image, ImageDraw
b = Image.open(sys.argv[1]).convert('RGB'); out = sys.argv[2]
x0, y0, x1, y1, dx, dy = map(float, sys.argv[3:9]); k = float(sys.argv[9]) if len(sys.argv) > 9 else 1.0
W = (b.width - 20) // 2
s = b.crop((int(x0), int(30 + y0), int(x1), int(30 + y1)))
f = b.crop((int(W + 20 + x0 + dx), int(30 + y0 + dy), int(W + 20 + x1 + dx), int(30 + y1 + dy)))
w, h = int((x1 - x0) * k), int((y1 - y0) * k)
s = s.resize((w, h), Image.LANCZOS); f = f.resize((w, h), Image.LANCZOS)
im = Image.new('RGB', (2 * w + 12, h + 18), (255, 0, 255)); im.paste(s, (0, 18)); im.paste(f, (w + 12, 18))
d = ImageDraw.Draw(im); d.text((4, 3), 'site', fill=(255, 255, 255)); d.text((w + 16, 3), 'Figma (decale de %+g, %+g)' % (dx, dy), fill=(255, 255, 255))
im.save(out); print(out, im.size)
