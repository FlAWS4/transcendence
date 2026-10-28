"""Zoomed site|Figma crops from a section_frames board (verification helper, journal v2, 17 Oct.)
python3 zoom.py <board png> <out png> x0 y0 x1 y1 [scale] [stack]
Coordinates are in site px of the frame (board minus its 30 px header)."""
import sys
from PIL import Image, ImageDraw
board, out = sys.argv[1], sys.argv[2]
x0, y0, x1, y1 = map(int, sys.argv[3:7])
k = float(sys.argv[7]) if len(sys.argv) > 7 else 1.0
stack = len(sys.argv) > 8 and sys.argv[8] == 'stack'
b = Image.open(board).convert('RGB')
W = (b.width - 20) // 2
s = b.crop((x0, 30 + y0, x1, 30 + y1))
f = b.crop((W + 20 + x0, 30 + y0, W + 20 + x1, 30 + y1))
w, h = int((x1 - x0) * k), int((y1 - y0) * k)
s = s.resize((w, h), Image.LANCZOS); f = f.resize((w, h), Image.LANCZOS)
if stack:
    im = Image.new('RGB', (w, 2 * h + 40), (255, 0, 255))
    im.paste(s, (0, 18)); im.paste(f, (0, h + 40))
    d = ImageDraw.Draw(im); d.text((4, 3), 'site', fill=(255, 255, 255)); d.text((4, h + 24), 'Figma', fill=(255, 255, 255))
else:
    im = Image.new('RGB', (2 * w + 12, h + 18), (255, 0, 255))
    im.paste(s, (0, 18)); im.paste(f, (w + 12, 18))
    d = ImageDraw.Draw(im); d.text((4, 3), 'site', fill=(255, 255, 255)); d.text((w + 16, 3), 'Figma', fill=(255, 255, 255))
im.save(out)
print(out, im.size)
