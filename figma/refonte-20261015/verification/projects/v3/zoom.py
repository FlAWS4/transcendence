"""Zoomed « site | Figma » crops of one frame region (verification helper, read-only on sources, 17 Oct.).
  python3 zoom.py <section> <frame index> <x> <y> <w> <h> <zoom> <out png> [site png override]
Frame coordinates in CSS px. Same box and scale as section_frames.py (v3: 40-unit export margin, one scale from the
longer side). The site crop uses the full capture when present and the frame is taller than the viewport."""
import json, sys, pathlib
from PIL import Image, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
AREA = 'projects'
sid, fi, x, y, w, h, z, outp = sys.argv[1], int(sys.argv[2]), *map(float, sys.argv[3:8]), sys.argv[8]
lay = json.loads((BASE / 'layouts' / f'{AREA}.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / 'call-results' / f'{AREA}-{sid}-v3.png').convert('RGB')
kx, ky = fig.width / (sec['w'] + 80), fig.height / (sec['h'] + 80)
k = kx if fig.width >= fig.height else ky
ox = oy = 40 * k
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / 'reference' / AREA / f'{name}--full.png'
vp = BASE / 'reference' / AREA / f'{name}.png'
src = pathlib.Path(sys.argv[9]) if len(sys.argv) > 9 else (full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp)
site = Image.open(src).convert('RGB')
dpr = site.width / f['w']
sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr)))
x0, y0 = ox + (f['x'] + x) * k, oy + (f['y'] + y) * k
W, H = int(w * z), int(h * z)
fc = fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BICUBIC)
sc = sc.resize((W, H), Image.LANCZOS)
board = Image.new('RGB', (W * 2 + 12, H + 22), (70, 70, 70))
board.paste(sc, (0, 22)); board.paste(fc, (W + 12, 22))
d = ImageDraw.Draw(board)
d.text((4, 5), f'site {name} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}] dpr {dpr:.2f}', fill=(255, 255, 255))
d.text((W + 16, 5), f'Figma (export scale {k:.3f})', fill=(255, 255, 255))
board.save(outp)
print(outp, board.size, 'src', src.name, 'frame', f['name'])
