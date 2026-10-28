"""Ink extent of each measured text line, site vs Figma, at the export scale (v5 check helper, read-only).
  python3 lines.py <frame name> <dump name> <regex on text or class> [contrast]
For every matching dump node with runs, each line rect (from the dump) is cut from the site capture (downsampled with
a box filter to the export scale) and from the Figma export; prints the left and right ink limits in CSS px."""
import json, gzip, re, sys
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image, ImageFilter
from figlib import BASE
fname, dname, rx = sys.argv[1], sys.argv[2], re.compile(sys.argv[3])
con = float(sys.argv[4]) if len(sys.argv) > 4 else 18
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == 'projects')
f = next(f for row in sec['rows'] for f in row if f['name'] == fname)
fig = Image.open(BASE / 'call-results/projects-projects-v5.png').convert('L')
k = fig.height / (sec['h'] + 80)
st = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / f'reference/projects/{st}--full.png'; vp = BASE / f'reference/projects/{st}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('L'); dpr = site.width / f['w']
d = json.loads(gzip.decompress((BASE / f'dom/projects/{dname}.json.gz').read_bytes()))
S = 8   # analysis resolution: 8 samples per export pixel
def strip(img_getter, x, y, w, h):
    return img_getter(x, y, w, h)
def site_strip(x, y, w, h):
    W, H = max(1, round(w * k)), max(1, round(h * k))
    c = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr))).resize((W, H), Image.BOX)
    return c.resize((W * S, H), Image.BILINEAR)
def fig_strip(x, y, w, h):
    W, H = max(1, round(w * k)), max(1, round(h * k))
    x0, y0 = 40 * k + (f['x'] + x) * k, 40 * k + (f['y'] + y) * k
    c = fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BILINEAR)
    return c.resize((W * S, H), Image.BILINEAR)
def extent(im, dark):
    px = im.load(); W, H = im.size
    bg = sorted(px[i, j] for i in range(W) for j in range(H))
    bgv = bg[len(bg) // 2] if False else (bg[-1] if dark else bg[0])
    cols = []
    for i in range(W):
        v = min(px[i, j] for j in range(H)) if dark else max(px[i, j] for j in range(H))
        cols.append(abs(bgv - v) > con)
    if not any(cols): return None
    a = cols.index(True); b = W - 1 - cols[::-1].index(True)
    return a, b
dark_text = f['theme'] == 'light'
for n in d['nodes']:
    txt = n.get('text') or ''
    if not (rx.search(txt) or rx.search(n.get('cls', '') or '')) or not n.get('runs'): continue
    for r in n['runs']:
        for li, (lx, ly, lw, lh) in enumerate(r.get('l') or []):
            pad = 6
            X, Y, W_, H_ = lx - pad - 20, ly + 3, lw + 2 * pad + 40, max(4, lh - 6)
            out = []
            for g in (site_strip, fig_strip):
                im = g(X, Y, W_, H_)
                e = extent(im, dark_text)
                out.append(None if e is None else (round(X + e[0] / (k * S), 1), round(X + (e[1] + 1) / (k * S), 1)))
            print(f"{n['i']:4d} l{li} dump [{lx:.1f} → {lx + lw:.1f}]  site {out[0]}  figma {out[1]}  | {txt[:50]}")
