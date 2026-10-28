"""Every measured text line of a frame, site vs Figma ink extents at the export scale; prints the lines whose left or
right ink limit differs by more than `tol` CSS px, or that have ink on one side only (v5 check helper, read-only).
  python3 allines.py <frame name> [tol] [contrast]
The dump is the one of the frame's state/format/language/theme (dark frames: the dark dump when it exists)."""
import json, gzip, sys
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image
from figlib import BASE
fname = sys.argv[1]; tol = float(sys.argv[2]) if len(sys.argv) > 2 else 6; con = float(sys.argv[3]) if len(sys.argv) > 3 else 22
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == 'projects')
f = next(f for row in sec['rows'] for f in row if f['name'] == fname)
fig = Image.open(BASE / 'call-results/projects-projects-v5.png').convert('L')
k = fig.height / (sec['h'] + 80)
st = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / f'reference/projects/{st}--full.png'; vp = BASE / f'reference/projects/{st}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('L'); dpr = site.width / f['w']
Hsite = site.height / dpr
dump = BASE / f'dom/projects/{st}.json.gz'
if not dump.exists():
    dump = BASE / f"dom/projects/{f['state']}--{f['fmt']}--{f['lang']}-light.json.gz"
d = json.loads(gzip.decompress(dump.read_bytes()))
S = 8
def site_strip(x, y, w, h):
    W, H = max(1, round(w * k)), max(1, round(h * k))
    c = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr))).resize((W, H), Image.BOX)
    return c.resize((W * S, H), Image.BILINEAR)
def fig_strip(x, y, w, h):
    W, H = max(1, round(w * k)), max(1, round(h * k))
    x0, y0 = 40 * k + (f['x'] + x) * k, 40 * k + (f['y'] + y) * k
    c = fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BILINEAR)
    return c.resize((W * S, H), Image.BILINEAR)
def extent(im):
    px = im.load(); W, H = im.size
    vals = sorted(px[i, j] for i in range(W) for j in range(H))
    bg = vals[len(vals) // 2]          # median = background
    cols = [max(abs(px[i, j] - bg) for j in range(H)) > con for i in range(W)]
    if not any(cols): return None
    a = cols.index(True); b = W - 1 - cols[::-1].index(True)
    return a, b
n_lines = 0; bad = 0
for n in d['nodes']:
    txt = n.get('text') or ''
    if not txt.strip() or not n.get('runs'): continue
    for r in n['runs']:
        for li, (lx, ly, lw, lh) in enumerate(r.get('l') or []):
            if ly + lh > min(f['h'], Hsite) or lw < 4: continue
            pad = 2
            X, Y, W_, H_ = lx - pad, ly + 3, lw + 2 * pad, max(4, lh - 6)
            res = []
            for g in (site_strip, fig_strip):
                e = extent(g(X, Y, W_, H_))
                res.append(None if e is None else (round(X + e[0] / (k * S), 1), round(X + (e[1] + 1) / (k * S), 1)))
            n_lines += 1
            a, b = res
            flag = (a is None) != (b is None) or (a and b and (abs(a[0] - b[0]) > tol or abs(a[1] - b[1]) > tol))
            if flag:
                bad += 1
                print(f"{n['i']:4d} l{li} [{lx:.0f},{ly:.0f} {lw:.0f}]  site {a}  figma {b}  | {txt[:60]!r}")
print(f'-- {fname}: {n_lines} lignes, {bad} écarts > {tol} px ({dump.name}, {src.name})')
