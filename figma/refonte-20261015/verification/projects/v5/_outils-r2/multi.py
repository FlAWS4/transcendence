"""Stack of fair zooms « site | Figma | diff » (both sides at the export scale, then enlarged) for several regions
(v5 check helper, read-only on sources, 18 Oct. 2026).
  python3 multi.py <out name> '<json list of [frame, x, y, w, h, zoom, label]>' [native]
With « native » the site side is the capture at its own resolution (no reduction) and Figma is enlarged to match:
positions can be compared, sharpness cannot."""
import json, sys
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image, ImageDraw, ImageChops
from figlib import BASE
OUT = BASE / 'verification/projects/v5/_zoom-pl-r2'
outn, spec = sys.argv[1], json.loads(sys.argv[2])
native = len(sys.argv) > 3 and sys.argv[3] == 'native'
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == 'projects')
frs = {f['name']: f for row in sec['rows'] for f in row}
fig = Image.open(BASE / 'call-results/projects-projects-v5.png').convert('RGB')
k = fig.height / (sec['h'] + 80)
panels = []
for item in spec:
    fname, x, y, w, h, Z = item[:6]; label = item[6] if len(item) > 6 else ''
    f = frs[fname]
    st = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
    full = BASE / f'reference/projects/{st}--full.png'; vp = BASE / f'reference/projects/{st}.png'
    src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
    site = Image.open(src).convert('RGB'); dpr = site.width / f['w']
    Wp, Hp = max(1, round(w * k)), max(1, round(h * k))
    W, H = round(w * k * Z), round(h * k * Z)
    raw = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr)))
    sc = raw.resize((Wp, Hp), Image.BOX)
    x0, y0 = 40 * k + (f['x'] + x) * k, 40 * k + (f['y'] + y) * k
    fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BILINEAR)
    d = ImageChops.difference(sc, fc).point(lambda v: min(255, v * 3))
    a = raw.resize((W, H), Image.LANCZOS) if native else sc.resize((W, H), Image.BICUBIC)
    b = fc.resize((W, H), Image.BICUBIC)
    p = Image.new('RGB', (W * (2 if native else 3) + 24, H + 18), (70, 70, 70))
    p.paste(a, (0, 18)); p.paste(b, (W + 12, 18))
    if not native: p.paste(d.resize((W, H), Image.NEAREST), (2 * W + 24, 18))
    dr = ImageDraw.Draw(p)
    dr.text((3, 3), f"{label} | {fname} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}]", fill=(255, 255, 0))
    dr.text((W + 15, 3), 'Figma', fill=(255, 255, 255))
    panels.append(p)
Wt = max(p.width for p in panels); Ht = sum(p.height + 6 for p in panels)
out = Image.new('RGB', (Wt, Ht), (35, 35, 35)); yy = 0
for p in panels:
    out.paste(p, (0, yy)); yy += p.height + 6
OUT.mkdir(parents=True, exist_ok=True)
out.save(OUT / (outn + '.png')); print(OUT / (outn + '.png'), out.size)
