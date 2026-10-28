"""« site (native) | Figma (enlarged) » of a frame region (v5 check helper, read-only on sources, 18 Oct. 2026).
  python3 native.py <section> <frame name or substring> <x> <y> <w> <h> <out name> [scale]
The site side is the capture at its own resolution (scaled to `scale` px per CSS px); the Figma side is the section
export enlarged to the same size (bicubic), so positions can be compared directly; a 10 px grid helps."""
import json, sys, pathlib
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image, ImageDraw
from figlib import BASE
OUT = BASE / 'verification/projects/v5/_zoom-pl-r2'
sid, sub, x, y, w, h, outn = sys.argv[1:8]
x, y, w, h = map(float, (x, y, w, h))
S = float(sys.argv[8]) if len(sys.argv) > 8 else 2.0
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
frs = [f for row in sec['rows'] for f in row]
f = ([f for f in frs if f['name'] == sub] or [f for f in frs if sub in f['name']])[0]
fig = Image.open(BASE / f'call-results/projects-{sid}-v5.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
ref = BASE / 'reference/projects'
full = ref / f'{name}--full.png'; vp = ref / f'{name}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB'); dpr = site.width / f['w']
W, H = round(w * S), round(h * S)
sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr))).resize((W, H), Image.LANCZOS)
x0, y0 = 40 * k + (f['x'] + x) * k, 40 * k + (f['y'] + y) * k
fc = fig.transform((max(1, round(w * k)), max(1, round(h * k))), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BILINEAR).resize((W, H), Image.BICUBIC)
board = Image.new('RGB', (W * 2 + 12, H + 22), (70, 70, 70))
board.paste(sc, (0, 22)); board.paste(fc, (W + 12, 22))
d = ImageDraw.Draw(board)
for gx in range(0, int(w) + 1, 10):
    for X in (gx * S, W + 12 + gx * S):
        d.line((X, 18, X, 22), fill=(255, 200, 0) if gx % 50 == 0 else (160, 160, 160))
d.text((4, 4), f"site {f['name']} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}] (traits tous les 10 px)", fill=(255, 255, 255))
d.text((W + 16, 4), 'Figma (export agrandi)', fill=(255, 255, 255))
board.save(OUT / (outn + '.png')); print(OUT / (outn + '.png'), board.size)
