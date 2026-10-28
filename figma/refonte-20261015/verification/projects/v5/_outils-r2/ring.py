"""Mean colour of a rounded-rect ring (border band) and of its interior, site (box-downsampled to the export scale) vs
Figma export (v5 check helper, read-only on sources).
  python3 ring.py <frame name> <x> <y> <w> <h> <radius> [band px]"""
import json, sys
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image, ImageDraw
from figlib import BASE
fname = sys.argv[1]; x, y, w, h, r = map(float, sys.argv[2:7]); band = float(sys.argv[7]) if len(sys.argv) > 7 else 2.0
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == 'projects')
f = next(f for row in sec['rows'] for f in row if f['name'] == fname)
fig = Image.open(BASE / 'call-results/projects-projects-v5.png').convert('RGB')
k = fig.height / (sec['h'] + 80)
st = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / f'reference/projects/{st}--full.png'; vp = BASE / f'reference/projects/{st}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB'); dpr = site.width / f['w']
# work at 4 samples per CSS px for masks; images resampled to the export scale then up
S = 4
pad = 6
X0, Y0, W, H = x - pad, y - pad, w + 2 * pad, h + 2 * pad
Wp, Hp = max(1, round(W * k)), max(1, round(H * k))
sc = site.crop((round(X0 * dpr), round(Y0 * dpr), round((X0 + W) * dpr), round((Y0 + H) * dpr))).resize((Wp, Hp), Image.BOX).resize((round(W * S), round(H * S)), Image.BILINEAR)
x0, y0 = 40 * k + (f['x'] + X0) * k, 40 * k + (f['y'] + Y0) * k
fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + W * k, y0 + H * k), Image.Resampling.BILINEAR).resize((round(W * S), round(H * S)), Image.BILINEAR)
def mask(inset0, inset1):
    m = Image.new('L', sc.size, 0); d = ImageDraw.Draw(m)
    d.rounded_rectangle(((pad - inset0) * S, (pad - inset0) * S, (pad + w + inset0) * S, (pad + h + inset0) * S), radius=(r + inset0) * S, fill=255)
    if inset1 is not None:
        d.rounded_rectangle(((pad + inset1) * S, (pad + inset1) * S, (pad + w - inset1) * S, (pad + h - inset1) * S), radius=max(0, r - inset1) * S, fill=0)
    return m
def mean(im, m):
    px = im.load(); mp = m.load(); s = [0, 0, 0]; n = 0
    for j in range(im.height):
        for i in range(im.width):
            if mp[i, j]:
                p = px[i, j]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; n += 1
    return [round(v / max(1, n), 1) for v in s]
ringm = mask(band, band); inner = mask(-band * 2, None); outer = mask(band * 3, -band * 1.5) if False else None
print('ring  site', mean(sc, ringm), 'figma', mean(fc, ringm))
print('inner site', mean(sc, inner), 'figma', mean(fc, inner))
