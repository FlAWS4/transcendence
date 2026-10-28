"""Zoomed « site | Figma » crop of one frame region (v4 check of project-media / project-comments, 17 Oct. 2026).

  python3 zoom.py <section id> <frame name substring> <x> <y> <w> <h> <out png> [k=2] [offset=0] [ref=auto|viewport|full]
x, y, w, h in frame px. offset: scroll of the site capture (viewport capture taken at scrollY = offset), so the site
crop is read at y - offset. The Figma crop comes from the section capture (call-results/projects-<section>-v4.png).
"""
import json, sys, pathlib
from PIL import Image, ImageChops, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, sub, x, y, w, h, out = sys.argv[1], sys.argv[2], *map(float, sys.argv[3:7]), sys.argv[7]
k = float(sys.argv[8]) if len(sys.argv) > 8 else 2.0
off = float(sys.argv[9]) if len(sys.argv) > 9 else 0.0
refmode = sys.argv[10] if len(sys.argv) > 10 else 'auto'
lay = json.loads((BASE / 'layouts' / 'projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = next(f for row in sec['rows'] for f in row if sub == f['name'] or sub in f['name'])
fig = Image.open(BASE / 'call-results' / f'projects-{sid}-v4.png').convert('RGB')
kx, ky = fig.width / (sec['w'] + 80), fig.height / (sec['h'] + 80)
kx = ky = kx if fig.width >= fig.height else ky
box = (40 * kx, 40 * ky)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / 'reference' / 'projects' / f'{name}--full.png'
vp = BASE / 'reference' / 'projects' / f'{name}.png'
if refmode == 'full' or (refmode == 'auto' and full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4):
    src = full
else:
    src = vp
site = Image.open(src).convert('RGB')
ss = site.width / f['w']
W, H = int(round(w * k)), int(round(h * k))
s_crop = site.transform((W, H), Image.Transform.EXTENT, (x * ss, (y - off) * ss, (x + w) * ss, (y - off + h) * ss), Image.Resampling.BICUBIC)
x0, y0 = box[0] + (f['x'] + x) * kx, box[1] + (f['y'] + y) * ky
g_crop = fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * kx, y0 + h * ky), Image.Resampling.BICUBIC)
board = Image.new('RGB', (W * 2 + 12, H + 22), (70, 70, 70))
board.paste(s_crop, (0, 22)); board.paste(g_crop, (W + 12, 22))
d = ImageDraw.Draw(board)
d.text((4, 5), f'site {src.name} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}] off {off:.0f}', fill=(255, 255, 255))
d.text((W + 16, 5), f"Figma {f['name']} (capture {kx:.3f} px/px)", fill=(255, 255, 255))
o = pathlib.Path(out)
if not o.is_absolute():
    o = pathlib.Path(__file__).parent / o
board.save(o)
print(o, board.size, src.name)
