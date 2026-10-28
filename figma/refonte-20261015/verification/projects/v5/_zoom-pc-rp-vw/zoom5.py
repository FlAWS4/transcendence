"""Zoomed « site | Figma » crops of one frame region (v5 verification helper, read-only on sources, 18 Oct.).
  python3 zoom5.py <section> <frame index> <x> <y> <w> <h> <zoom> <out png> [--dy N] [--ref vp|full|<png>]
x, y, w, h: region of the site capture in CSS px. The Figma crop is the same region of the frame shifted by dy
(frame y = site y + dy), so a capture taken page scrolled can be compared with the band of the frame it shows
(dy = scrollY), or a fixed layer with the top of the frame (dy = 0). Same box and scale as section_frames.py."""
import json, sys, pathlib
from PIL import Image, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
AREA = 'projects'
args = sys.argv[1:]
dy, ref = 0.0, None
if '--dy' in args:
    i = args.index('--dy'); dy = float(args[i + 1]); del args[i:i + 2]
if '--ref' in args:
    i = args.index('--ref'); ref = args[i + 1]; del args[i:i + 2]
sid, fi, x, y, w, h, z, outp = args[0], int(args[1]), *map(float, args[2:7]), args[7]
lay = json.loads((BASE / 'layouts' / f'{AREA}.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / 'call-results' / f'{AREA}-{sid}-v5.png').convert('RGB')
kx, ky = fig.width / (sec['w'] + 80), fig.height / (sec['h'] + 80)
k = kx if fig.width >= fig.height else ky
ox = oy = 40 * k
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / 'reference' / AREA / f'{name}--full.png'
vp = BASE / 'reference' / AREA / f'{name}.png'
if ref == 'vp': src = vp
elif ref == 'full': src = full
elif ref: src = pathlib.Path(ref)
else: src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB')
dpr = site.width / f['w']
sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr)))
x0, y0 = ox + (f['x'] + x) * k, oy + (f['y'] + y + dy) * k
W, H = int(w * z), int(h * z)
fc = fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BICUBIC)
sc = sc.resize((W, H), Image.LANCZOS)
board = Image.new('RGB', (W * 2 + 12, H + 22), (70, 70, 70))
board.paste(sc, (0, 22)); board.paste(fc, (W + 12, 22))
d = ImageDraw.Draw(board)
d.text((4, 5), f'site {name} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}] dpr {dpr:.2f}', fill=(255, 255, 255))
d.text((W + 16, 5), f'Figma {f["name"][:40]} y+{dy:.0f} (k {k:.3f})', fill=(255, 255, 255))
board.save(outp)
print(outp, board.size, 'src', src.name, 'frame', f['name'])
