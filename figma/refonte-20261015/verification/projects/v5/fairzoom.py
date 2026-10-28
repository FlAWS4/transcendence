"""Fair zoom « site | Figma | diff » of one frame region (verification helper, read-only on sources, 18 Oct. 2026).
  python3 fairzoom.py <section> <frame substring> <x> <y> <w> <h> <out name> [zoom] [nearest|bicubic] [Figma dy] [hi]
Frame coordinates in CSS px. Same method as v3/_diffmaps/fairzoom.py, on the v5 section exports: the site crop is
first reduced to the export scale (box filter, as an export does), so a thin line keeps the same contrast on both
sides; both are then enlarged the same way. The third panel is |site - Figma| amplified x3. With « hi » as last
argument, a fourth panel shows the site crop at full resolution (for reading the text the export blurs).
Writes only in verification/projects/v5/_zoom/."""
import json, sys, pathlib
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image, ImageDraw, ImageChops
from figlib import BASE
sid, sub, x, y, w, h, outn = sys.argv[1:8]
x, y, w, h = map(float, (x, y, w, h))
Z = float(sys.argv[8]) if len(sys.argv) > 8 else 4.0
mode = Image.NEAREST if (len(sys.argv) <= 9 or sys.argv[9] == 'nearest') else Image.BICUBIC
fdy = float(sys.argv[10]) if len(sys.argv) > 10 else 0.0
hi = len(sys.argv) > 11 and sys.argv[11] == 'hi'
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
fr = [f for row in sec['rows'] for f in row if f['name'] == sub] or [f for row in sec['rows'] for f in row if sub in f['name']]
assert fr, [f['name'] for row in sec['rows'] for f in row]
f = fr[0]
fig = Image.open(BASE / f'call-results/projects-{sid}-v5.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
ref = BASE / 'reference/projects'
full = ref / f'{name}--full.png'; vp = ref / f'{name}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB')
dpr = site.width / f['w']
Wp, Hp = max(1, round(w * k)), max(1, round(h * k))
scrop = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr)))
sc = scrop.resize((Wp, Hp), Image.BOX)
x0, y0 = 40 * k + (f['x'] + x) * k, 40 * k + (f['y'] + y + fdy) * k
fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BILINEAR)
d = ImageChops.difference(sc, fc).point(lambda v: min(255, v * 3))
W, H = round(Wp * Z), round(Hp * Z)
panels = [sc, fc, d] + ([scrop] if hi else [])
board = Image.new('RGB', (W * len(panels) + 12 * (len(panels) - 1), H + 24), (70, 70, 70))
for i, im in enumerate(panels):
    board.paste(im.resize((W, H), Image.LANCZOS if (hi and i == 3) else mode), (i * (W + 12), 24))
dr = ImageDraw.Draw(board)
dr.text((4, 6), f"site {f['name']} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}] at export scale {k:.3f}", fill=(255, 255, 255))
dr.text((W + 16, 6), 'Figma v5' + (f' (read {fdy:+.0f} px lower)' if fdy else ''), fill=(255, 255, 255))
dr.text((2 * W + 28, 6), '|diff| x3', fill=(255, 255, 255))
if hi:
    dr.text((3 * W + 40, 6), 'site, full resolution', fill=(255, 255, 255))
outd = BASE / 'verification/projects/v5/_zoom'; outd.mkdir(parents=True, exist_ok=True)
out = outd / (outn + '.png')
board.save(out); print(out, board.size, 'ref', src.name, 'k', round(k, 4))
