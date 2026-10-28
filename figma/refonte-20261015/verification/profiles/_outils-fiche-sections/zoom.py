"""Zoomed « site | Figma » crops of one frame region.
  python3 zoom.py <section> <frame index> <x> <y> <w> <h> <zoom> <out png> [site png override]
Frame coordinates in CSS px."""
import sys
from PIL import Image, ImageDraw
from common import load, figma_crop, site_crop
sid, fi = sys.argv[1], int(sys.argv[2]); x, y, w, h, z = map(float, sys.argv[3:8]); outp = sys.argv[8]
c = load(sid, fi, sys.argv[9] if len(sys.argv) > 9 else None)
W, H = int(w * z), int(h * z)
sc = site_crop(c, x, y, w, h, W, H); fc = figma_crop(c, x, y, w, h, W, H)
board = Image.new('RGB', (W * 2 + 12, H + 22), (70, 70, 70))
board.paste(sc, (0, 22)); board.paste(fc, (W + 12, 22))
d = ImageDraw.Draw(board)
d.text((4, 5), f"site {c['name']} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}]", fill=(255, 255, 255))
d.text((W + 16, 5), f"Figma (export scale {c['k']:.3f})", fill=(255, 255, 255))
board.save(outp)
print(outp, board.size, 'src', c['src'].name, 'frame', c['f']['name'])
