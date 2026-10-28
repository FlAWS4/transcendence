"""Signed colour drift (Figma - site) per frame and per horizontal band, both at the export scale, site reduced with a
box filter; also the share of pixels whose hue drifts (v5 check helper, read-only on sources).
  python3 drift.py [band px]"""
import json, sys
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image, ImageFilter
from figlib import BASE
band = float(sys.argv[1]) if len(sys.argv) > 1 else 200
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == 'projects')
fig = Image.open(BASE / 'call-results/projects-projects-v5.png').convert('RGB')
k = fig.height / (sec['h'] + 80)
for f in [f for row in sec['rows'] for f in row]:
    st = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
    full = BASE / f'reference/projects/{st}--full.png'; vp = BASE / f'reference/projects/{st}.png'
    src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
    if not src.exists():
        print('==', f['name'], 'pas de référence'); continue
    site = Image.open(src).convert('RGB'); dpr = site.width / f['w']
    H = min(f['h'], site.height / dpr)
    Wp, Hp = round(f['w'] * k), round(H * k)
    x0, y0 = 40 * k + f['x'] * k, 40 * k + f['y'] * k
    fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + f['w'] * k, y0 + H * k), Image.Resampling.BILINEAR)
    sc = site.crop((0, 0, site.width, round(H * dpr))).resize((Wp, Hp), Image.BOX)
    a = sc.load(); b = fc.load()
    rows = []
    nb = int(H // band) + 1
    tot = [0, 0, 0]; n = 0
    for bi in range(nb):
        ya, yb = int(bi * band * k), min(Hp, int((bi + 1) * band * k))
        s = [0, 0, 0]; m = 0
        for j in range(max(1, ya), max(1, yb) - 0):
            if j >= Hp - 1: break
            for i in range(2, Wp - 2):
                pa, pb = a[i, j], b[i, j]
                for c in range(3): s[c] += pb[c] - pa[c]
                m += 1
        if m:
            rows.append((round(bi * band), [round(v / m, 1) for v in s]))
            for c in range(3): tot[c] += s[c]
            n += m
    print('==', f['name'], 'moyenne signée Figma−site', [round(v / max(1, n), 2) for v in tot])
    print('    ', ' '.join(f"{y}:{v[0]:+.0f}/{v[1]:+.0f}/{v[2]:+.0f}" for y, v in rows))
