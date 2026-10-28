"""Zoomed « site | Figma » crops for one frame region (verification helper, read-only on sources).
  python3 zoom.py <section> <frame index> <x> <y> <w> <h> <zoom> <out png> [site png override]
Coordinates are in frame (CSS px) units. The site crop uses the full capture when present and the frame is taller
than the viewport, at its native DPR; the Figma crop comes from call-results/explorer-<section>.png (box detected
as in section_frames.py)."""
import json, sys, pathlib
from PIL import Image, ImageChops, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, fi, x, y, w, h, z, outp = sys.argv[1], int(sys.argv[2]), *map(float, sys.argv[3:8]), sys.argv[8]
lay = json.loads((BASE / 'layouts' / 'explorer.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
frames = [f for row in sec['rows'] for f in row]
f = frames[fi]
fig = Image.open(BASE / 'call-results' / f'explorer-{sid}.png').convert('RGB')
margin = Image.new('RGB', fig.size, fig.getpixel((0, 0)))
box = ImageChops.difference(fig, margin).convert('L').point(lambda v: 255 if v > 6 else 0).getbbox()
kx, ky = (box[2] - box[0]) / sec['w'], (box[3] - box[1]) / sec['h']
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / 'reference' / 'explorer' / f'{name}--full.png'
vp = BASE / 'reference' / 'explorer' / f'{name}.png'
src = pathlib.Path(sys.argv[9]) if len(sys.argv) > 9 else (full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp)
site = Image.open(src).convert('RGB')
dpr = site.width / f['w']
sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr)))
fc = fig.crop((round(box[0] + (f['x'] + x) * kx), round(box[1] + (f['y'] + y) * ky), round(box[0] + (f['x'] + x + w) * kx), round(box[1] + (f['y'] + y + h) * ky)))
W, H = int(w * z), int(h * z)
sc = sc.resize((W, H), Image.LANCZOS); fc = fc.resize((W, H), Image.LANCZOS)
board = Image.new('RGB', (W * 2 + 12, H + 22), (70, 70, 70))
board.paste(sc, (0, 22)); board.paste(fc, (W + 12, 22))
d = ImageDraw.Draw(board)
d.text((4, 5), f'site {f["name"]} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}] dpr {dpr:.2f}', fill=(255, 255, 255))
d.text((W + 16, 5), f'Figma (export scale {kx:.3f})', fill=(255, 255, 255))
board.save(outp)
print(outp, board.size, 'src', src.name)
