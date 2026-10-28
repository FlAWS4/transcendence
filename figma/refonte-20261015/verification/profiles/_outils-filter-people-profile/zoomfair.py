"""Like zoom.py, but the site crop goes through the same resolution as the Figma export (downsampled to the export
scale, then enlarged like the Figma crop), so that both sides are equally blurred.
  python3 zoomfair.py <section> <frame index> <x> <y> <w> <h> <zoom> <out png>"""
import sys
from PIL import Image, ImageDraw
from common import load, figma_crop, site_crop
sid, fi, x, y, w, h, z, outp = sys.argv[1], int(sys.argv[2]), *map(float, sys.argv[3:8]), sys.argv[8]
c = load(sid, fi); k = c['k']
W, H = int(w * z), int(h * z)
fc = figma_crop(c, x, y, w, h, W, H)
small = site_crop(c, x, y, w, h, max(1, round(w * k)), max(1, round(h * k)))
sc = small.resize((W, H), Image.BICUBIC)
board = Image.new('RGB', (W * 2 + 12, H + 22), (70, 70, 70))
board.paste(sc, (0, 22)); board.paste(fc, (W + 12, 22))
d = ImageDraw.Draw(board)
d.text((4, 5), f"site (export scale) {c['name']} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}]", fill=(255, 255, 255))
d.text((W + 16, 5), f"Figma (export scale {k:.3f})", fill=(255, 255, 255))
board.save(outp)
print(outp, board.size)
