"""Zoom on a region of a frame: site (native capture) | Figma (section capture), same CSS-px region.
  python3 zoom.py <section> <frame substring> <x> <y> <w> <h> <out name> [scale]
Coordinates are CSS px in the frame. Written for the v3 check of the projects area (17 Oct. 2026)."""
import json, sys, pathlib, re
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image, ImageDraw
from figlib import BASE
sid, sub, x, y, w, h, outn = sys.argv[1:8]
x, y, w, h = map(float, (x, y, w, h))
S = float(sys.argv[8]) if len(sys.argv) > 8 else 2.0
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
fr = [f for row in sec['rows'] for f in row if sub in f['name']]
assert len(fr) >= 1, [f['name'] for row in sec['rows'] for f in row]
f = fr[0]
fig = Image.open(BASE / f'call-results/projects-{sid}-v3.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
ref = BASE / 'reference/projects'
full = ref / f'{name}--full.png'; vp = ref / f'{name}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB')
dpr = site.width / f['w']
W, H = int(w * S), int(h * S)
sc = site.transform((W, H), Image.Transform.EXTENT, (x * dpr, y * dpr, (x + w) * dpr, (y + h) * dpr), Image.Resampling.BICUBIC)
x0, y0 = 40 * k + (f['x'] + x) * k, 40 * k + (f['y'] + y) * k
fc = fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BICUBIC)
board = Image.new('RGB', (W * 2 + 16, H + 24), (70, 70, 70))
board.paste(sc, (0, 24)); board.paste(fc, (W + 16, 24))
d = ImageDraw.Draw(board)
d.text((4, 6), f"site {f['name']} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}] (site dpr {dpr:.1f})", fill=(255, 255, 255))
d.text((W + 20, 6), f'Figma (capture scale {k:.3f})', fill=(255, 255, 255))
out = BASE / 'verification/projects/v3/_zoom' / (outn + '.png')
board.save(out); print(out)
