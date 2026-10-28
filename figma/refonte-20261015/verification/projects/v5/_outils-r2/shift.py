"""Best (dx, dy) shift, in CSS px, that aligns the Figma export with the site in a region (both at the export scale,
upsampled x4); prints the error before and after (v5 check helper, read-only on sources).
  python3 shift.py '<json list of [frame, x, y, w, h, label]>' [max shift px]"""
import json, sys
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image, ImageChops, ImageStat
from figlib import BASE
spec = json.loads(sys.argv[1]); M = float(sys.argv[2]) if len(sys.argv) > 2 else 6
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == 'projects')
fig = Image.open(BASE / 'call-results/projects-projects-v5.png').convert('L')
k = fig.height / (sec['h'] + 80)
frs = {f['name']: f for row in sec['rows'] for f in row}
U = 4
for fname, x, y, w, h, label in spec:
    f = frs[fname]
    st = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
    full = BASE / f'reference/projects/{st}--full.png'; vp = BASE / f'reference/projects/{st}.png'
    src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
    site = Image.open(src).convert('L'); dpr = site.width / f['w']
    Wp, Hp = max(1, round(w * k)), max(1, round(h * k))
    sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr))).resize((Wp, Hp), Image.BOX).resize((Wp * U, Hp * U), Image.BICUBIC)
    best = None
    steps = [i * 0.5 for i in range(int(-M * 2), int(M * 2) + 1)]
    for dy in steps:
        for dx in steps:
            x0, y0 = 40 * k + (f['x'] + x + dx) * k, 40 * k + (f['y'] + y + dy) * k
            fc = fig.transform((Wp * U, Hp * U), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BICUBIC)
            e = ImageStat.Stat(ImageChops.difference(sc, fc)).mean[0]
            if dx == 0 and dy == 0: e0 = e
            if best is None or e < best[0]: best = (e, dx, dy)
    print(f"{label:40s} erreur {e0:.2f} -> {best[0]:.2f} avec Figma lu à dx={best[1]:+.1f} dy={best[2]:+.1f} px")
