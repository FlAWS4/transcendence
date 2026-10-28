"""Zoom on one region of a frame: site reference (native resolution) | Figma section capture (upscaled), same scale.
python3 zoomcmp.py <section> <state> <fmt> <theme> <x0> <y0> <x1> <y1> <out.png> [scale] [siteScrollFix]
Region in frame units (Figma frame coordinates). The site side reads the reference at the same frame coordinates
(viewport capture: only valid for y < viewport height); pass siteScrollFix=dy to read site region shifted by dy."""
import json, sys, pathlib
from PIL import Image, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, state, fmt, theme = sys.argv[1:5]
x0, y0, x1, y1 = map(float, sys.argv[5:9]); out = sys.argv[9]
S = float(sys.argv[10]) if len(sys.argv) > 10 else 3.0
dy = float(sys.argv[11]) if len(sys.argv) > 11 else 0.0
lay = json.loads((BASE / 'layouts' / 'projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = next(f for row in sec['rows'] for f in row if f['fmt'] == fmt and f['theme'] == theme and f['state'] == state)
fig = Image.open(BASE / 'call-results' / f'projects-{sid}-v3.png').convert('RGB')
k = fig.width / (sec['w'] + 80)
bx, by = 40 * k, 40 * k
W, H = int((x1 - x0) * S), int((y1 - y0) * S)
fx0, fy0 = bx + (f['x'] + x0) * k, by + (f['y'] + y0) * k
figc = fig.transform((W, H), Image.Transform.EXTENT, (fx0, fy0, fx0 + (x1 - x0) * k, fy0 + (y1 - y0) * k), Image.Resampling.BICUBIC)
ref = Image.open(BASE / 'reference' / 'projects' / f"{state}--{fmt}--fr-{theme}.png").convert('RGB')
r = ref.width / f['w']
sitec = ref.transform((W, H), Image.Transform.EXTENT, (x0 * r, (y0 + dy) * r, x1 * r, (y1 + dy) * r), Image.Resampling.BICUBIC)
board = Image.new('RGB', (W * 2 + 12, H + 22), (70, 70, 70))
board.paste(sitec, (0, 22)); board.paste(figc, (W + 12, 22))
d = ImageDraw.Draw(board)
d.text((4, 5), f'site {fmt} {theme} y{y0:.0f}-{y1:.0f}' + (f' (site +{dy:.0f})' if dy else ''), fill=(255, 255, 255))
d.text((W + 16, 5), f'Figma (capture x{k:.3f}, agrandie)', fill=(255, 255, 255))
board.save(out)
print(out, board.size)
