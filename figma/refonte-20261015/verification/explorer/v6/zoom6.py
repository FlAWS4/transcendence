"""Zoomed « site | Figma » crops for one frame region of a v6 section capture (verification helper, read-only on sources).
  python3 zoom6.py <section> <figma section png> <frame index> <x> <y> <w> <h> <zoom> <out png> [site png override]
Same origin and scale as section_frames.py (export margin of 40 units). Coordinates in frame CSS px."""
import json, sys, pathlib
from PIL import Image, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, figp, fi = sys.argv[1], sys.argv[2], int(sys.argv[3])
x, y, w, h, z = map(float, sys.argv[4:9]); outp = sys.argv[9]
lay = json.loads((BASE / 'layouts' / 'explorer.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(figp).convert('RGB')
kx, ky = fig.width / (sec['w'] + 80), fig.height / (sec['h'] + 80)
kx = ky = kx if fig.width >= fig.height else ky
box = (40 * kx, 40 * ky)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
vp = BASE / 'reference' / 'explorer' / f'{name}.png'
src = pathlib.Path(sys.argv[10]) if len(sys.argv) > 10 else vp
site = Image.open(src).convert('RGB')
dpr = site.width / f['w']
W, H = int(w * z), int(h * z)
sc = site.transform((W, H), Image.Transform.EXTENT, (x * dpr, y * dpr, (x + w) * dpr, (y + h) * dpr), Image.Resampling.BICUBIC)
x0, y0 = box[0] + (f['x'] + x) * kx, box[1] + (f['y'] + y) * ky
fc = fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * kx, y0 + h * ky), Image.Resampling.BICUBIC)
board = Image.new('RGB', (W * 2 + 12, H + 22), (70, 70, 70))
board.paste(sc, (0, 22)); board.paste(fc, (W + 12, 22))
d = ImageDraw.Draw(board)
d.text((4, 5), f'site {name} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}] dpr {dpr:.2f}', fill=(255, 255, 255))
d.text((W + 16, 5), f'Figma v6 (export scale {kx:.3f})', fill=(255, 255, 255))
board.save(outp)
print(outp, board.size, 'src', src.name)
