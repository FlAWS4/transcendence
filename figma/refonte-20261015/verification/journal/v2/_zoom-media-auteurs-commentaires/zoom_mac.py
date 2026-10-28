"""Zoom helper of the media / authors / comments check (journal v2, 17 Oct. 2026): same region of a board's site and
Figma halves, side by side (or stacked when wide).
  python3 zoom_mac.py <board png> <x> <y> <w> <h> <scale> <out png>   (x, y in frame coordinates)
"""
import sys
from PIL import Image, ImageDraw
b, x, y, w, h, s, out = sys.argv[1], *map(float, sys.argv[2:7]), sys.argv[7]
im = Image.open(b).convert('RGB')
W = (im.width - 20) // 2
site = im.crop((int(x), int(30 + y), int(x + w), int(30 + y + h)))
fig = im.crop((int(W + 20 + x), int(30 + y), int(W + 20 + x + w), int(30 + y + h)))
sw, sh = int(w * s), int(h * s)
site = site.resize((sw, sh), Image.LANCZOS); fig = fig.resize((sw, sh), Image.LANCZOS)
if sw <= sh * 1.6:
    o = Image.new('RGB', (sw * 2 + 12, sh + 22), (70, 70, 70)); o.paste(site, (0, 22)); o.paste(fig, (sw + 12, 22))
    d = ImageDraw.Draw(o); d.text((4, 5), 'site', fill=(255, 255, 255)); d.text((sw + 16, 5), 'Figma', fill=(255, 255, 255))
else:
    o = Image.new('RGB', (sw, sh * 2 + 44), (70, 70, 70)); o.paste(site, (0, 22)); o.paste(fig, (0, sh + 44))
    d = ImageDraw.Draw(o); d.text((4, 5), 'site', fill=(255, 255, 255)); d.text((4, sh + 27), 'Figma', fill=(255, 255, 255))
o.save(out); print(out, o.size)
