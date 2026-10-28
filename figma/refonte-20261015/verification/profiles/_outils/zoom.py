"""Zoomed « site | site at export scale | Figma » crops of one frame region (verification helper, 18 Oct.).
  python3 zoom.py <section> <frame index> <x> <y> <w> <h> <zoom> <out png>
Frame coordinates in CSS px. The middle pane is the site downsampled to the Figma export scale and enlarged the same
way as the Figma pane, so that blur alone does not read as a difference."""
import sys
from PIL import Image, ImageDraw
from common import load
sid, fi = sys.argv[1], int(sys.argv[2])
x, y, w, h, z = map(float, sys.argv[3:8]); outp = sys.argv[8]
L = load(sid, fi)
f, fig, k, o, site, dpr = L['f'], L['fig'], L['k'], L['o'], L['site'], L['dpr']
W, H = int(w * z), int(h * z)
sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr)))
se = sc.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS).resize((W, H), Image.BICUBIC)
sc = sc.resize((W, H), Image.LANCZOS)
x0, y0 = o + (f['x'] + x) * k, o + (f['y'] + y) * k
fc = fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BICUBIC)
board = Image.new('RGB', (W * 3 + 24, H + 22), (70, 70, 70))
board.paste(sc, (0, 22)); board.paste(se, (W + 12, 22)); board.paste(fc, (2 * W + 24, 22))
d = ImageDraw.Draw(board)
d.text((4, 5), f'site [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}]', fill=(255, 255, 255))
d.text((W + 16, 5), f'site @export {k:.3f}', fill=(255, 255, 255))
d.text((2 * W + 28, 5), 'Figma', fill=(255, 255, 255))
board.save(outp)
print(outp, board.size, L['src'].name, f['name'])
