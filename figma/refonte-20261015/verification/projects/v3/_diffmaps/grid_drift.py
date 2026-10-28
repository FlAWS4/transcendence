"""Block-wise mean colour drift « site vs Figma » of one frame (verification helper, read-only on sources, 17 Oct.).
  python3 grid_drift.py <section> <frame substring> [block CSS px] [min drift]
Both sides at the export scale (site reduced with a box filter). For each block, the mean colour of each side; prints
the blocks whose means differ by more than <min drift> (default 6) on a channel, merged by rows."""
import json, sys, pathlib
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image, ImageStat
from figlib import BASE
sid, sub = sys.argv[1:3]
B = float(sys.argv[3]) if len(sys.argv) > 3 else 40
md = float(sys.argv[4]) if len(sys.argv) > 4 else 6
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = next(f for row in sec['rows'] for f in row if sub == f['name'])
fig = Image.open(BASE / f'call-results/projects-{sid}-v3.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
ref = BASE / 'reference/projects'
full = ref / f'{name}--full.png'; vp = ref / f'{name}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB'); dpr = site.width / f['w']
H = min(f['h'], site.height / dpr)
Wp, Hp = round(f['w'] * k), round(H * k)
sc = site.crop((0, 0, site.width, round(H * dpr))).resize((Wp, Hp), Image.BOX)
x0, y0 = 40 * k + f['x'] * k, 40 * k + f['y'] * k
fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + f['w'] * k, y0 + H * k), Image.Resampling.BILINEAR)
b = max(2, round(B * k))
print(f['name'], '| ref', src.name, '| block', B, 'CSS px')
for j in range(1, Hp // b - 1):
    row = []
    for i in range(0, Wp // b):
        box = (i * b, j * b, (i + 1) * b, (j + 1) * b)
        a = ImageStat.Stat(sc.crop(box)).mean; g = ImageStat.Stat(fc.crop(box)).mean
        dlt = [round(g[c] - a[c]) for c in range(3)]
        if max(abs(v) for v in dlt) > md:
            row.append(f"x{round(i * b / k)}:{dlt}")
    if row:
        print(f"y{round(j * b / k):5d}", ' '.join(row))
