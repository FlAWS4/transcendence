"""Colour profile along a line, site (reduced to the export scale) vs Figma v5 export (verification helper, 18 Oct.).
  python3 profile.py <section> <frame name or substring> h|v <fixed coord> <from> <to> [band]
Coordinates in frame CSS px. Prints, every export pixel along the line, the RGB of the site (box-reduced) and Figma,
averaged over a band of <band> CSS px across the line (default 1). Reads only."""
import json, sys
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image
from figlib import BASE
sid, sub, orient, c, a, b = sys.argv[1:7]
c, a, b = float(c), float(a), float(b)
band = float(sys.argv[7]) if len(sys.argv) > 7 else 1.0
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
fr = [f for row in sec['rows'] for f in row if f['name'] == sub] or [f for row in sec['rows'] for f in row if sub in f['name']]
f = fr[0]
fig = Image.open(BASE / f'call-results/projects-{sid}-v5.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
ref = BASE / 'reference/projects'
full = ref / f'{name}--full.png'; vp = ref / f'{name}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB'); dpr = site.width / f['w']
# region box in CSS px
if orient == 'h':
    x, y, w, h = a, c - band / 2, b - a, band
else:
    x, y, w, h = c - band / 2, a, band, b - a
Wp, Hp = max(1, round(w * k)), max(1, round(h * k))
sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr))).resize((Wp, Hp), Image.BOX)
x0, y0 = 40 * k + (f['x'] + x) * k, 40 * k + (f['y'] + y) * k
fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BILINEAR)
print(f['name'], 'ref', src.name, 'k', round(k, 4), 'export px', Wp, Hp)
n = Wp if orient == 'h' else Hp
for i in range(n):
    if orient == 'h':
        s = [sum(sc.getpixel((i, j))[ch] for j in range(Hp)) / Hp for ch in range(3)]
        g = [sum(fc.getpixel((i, j))[ch] for j in range(Hp)) / Hp for ch in range(3)]
    else:
        s = [sum(sc.getpixel((j, i))[ch] for j in range(Wp)) / Wp for ch in range(3)]
        g = [sum(fc.getpixel((j, i))[ch] for j in range(Wp)) / Wp for ch in range(3)]
    pos = a + (i + 0.5) / k
    print(f'{pos:8.1f}  site {tuple(round(v) for v in s)}  figma {tuple(round(v) for v in g)}')
