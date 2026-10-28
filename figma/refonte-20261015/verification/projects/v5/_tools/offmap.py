"""Where do the channel drifts (> 12 levels) of one frame lie? (v5 helper, read-only, 18 Oct.)
  python3 offmap.py <section> <frame index> [cell px]
Both sides at the board scale (CSS px, as section_frames.py), blurred 1 px; prints the share of off pixels per band
of <cell> px rows and the mean signed difference (Figma - site) per channel in the worst bands."""
import gzip, json, sys, pathlib
from PIL import Image, ImageChops, ImageFilter
import numpy as np
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, fi = sys.argv[1], int(sys.argv[2]); cell = int(sys.argv[3]) if len(sys.argv) > 3 else 40
lay = json.loads((BASE / 'layouts' / 'projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / 'call-results' / f'projects-{sid}-v5.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
o = 40 * k
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / 'reference' / 'projects' / f'{name}--full.png'; vp = BASE / 'reference' / 'projects' / f'{name}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB')
sh = int(round(site.height * f['w'] / site.width))
site = site.resize((int(f['w']), sh), Image.LANCZOS).crop((0, 0, int(f['w']), min(int(f['h']), sh)))
sy = 0.0
if src == vp:
    dump = BASE / 'dom' / 'projects' / f'{name}.json.gz'
    if dump.exists():
        sy = float((json.loads(gzip.decompress(dump.read_bytes())).get('scroll') or [0, 0])[1] or 0)
x0, y0 = o + f['x'] * k, o + (f['y'] + sy) * k
crop = fig.transform(site.size, Image.Transform.EXTENT, (x0, y0, x0 + site.width * k, y0 + site.height * k), Image.Resampling.BICUBIC)
a = np.asarray(site.filter(ImageFilter.GaussianBlur(1)), dtype=np.int16)
b = np.asarray(crop.filter(ImageFilter.GaussianBlur(1)), dtype=np.int16)
d = b - a
off = (np.abs(d).max(axis=2) > 12)
print(f['name'], src.name, 'sy', sy, 'size', site.size, 'off share %.4f' % off.mean())
rows = []
for y in range(0, off.shape[0], cell):
    band = off[y:y + cell]
    rows.append((band.mean(), y, d[y:y + cell][band].mean(axis=0) if band.any() else np.zeros(3)))
for s, y, m in sorted(rows, reverse=True)[:8]:
    cols = off[y:y + cell].mean(axis=0)
    xs = np.where(cols > 0.05)[0]
    print('  y %4d-%4d off %.3f  x %s  mean(F-S) %s' % (y + sy, y + sy + cell, s, (xs.min(), xs.max()) if len(xs) else '-', np.round(m, 1)))
