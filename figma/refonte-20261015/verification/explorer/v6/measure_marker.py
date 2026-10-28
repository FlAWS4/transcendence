"""Measure the crosshair lines and the dot of the campus marker, site vs Figma v6 (frame px). Read-only helper."""
import json, sys, pathlib
import numpy as np
from PIL import Image
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, figp = 'campus-window', sys.argv[1]
lay = json.loads((BASE / 'layouts' / 'explorer.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
frames = [f for row in sec['rows'] for f in row]
fig = Image.open(figp).convert('RGB')
k = fig.width / (sec['w'] + 80)
box = (40 * k, 40 * k)
S = 8  # supersampling factor in frame px
def pinkness(a):
    a = a.astype(float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return np.clip((r - g) - 40, 0, None)   # pink: r much greater than g
for fi, (cx, cy) in [(0, (720, 477)), (1, (720, 477)), (2, (195, 401.5)), (3, (195, 401.5))]:
    f = frames[fi]
    name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
    site = Image.open(BASE / 'reference' / 'explorer' / f'{name}.png').convert('RGB')
    dpr = site.width / f['w']
    x, y, w, h = cx - 40, cy - 40, 80, 80
    W, H = int(w * S), int(h * S)
    sc = np.array(site.transform((W, H), Image.Transform.EXTENT, (x * dpr, y * dpr, (x + w) * dpr, (y + h) * dpr), Image.Resampling.BILINEAR))
    x0, y0 = box[0] + (f['x'] + x) * k, box[1] + (f['y'] + y) * k
    fc = np.array(fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BILINEAR))
    out = []
    for nm, a in (('site', sc), ('figma', fc)):
        p = pinkness(a)
        # vertical line: column profile over rows far from the centre (top band 5..20 px of the crop: y in [cy-35, cy-25])
        band_v = p[int(5 * S):int(14 * S), :].sum(axis=0)
        band_h = p[:, int(5 * S):int(14 * S)].sum(axis=1)
        xs = np.arange(W) / S + x; ys = np.arange(H) / S + y
        vx = (band_v * xs).sum() / max(band_v.sum(), 1e-9)
        hy = (band_h * ys).sum() / max(band_h.sum(), 1e-9)
        # line widths (FWHM-ish): count of columns above half max
        vw = (band_v > band_v.max() / 2).sum() / S if band_v.max() > 0 else 0
        hw = (band_h > band_h.max() / 2).sum() / S if band_h.max() > 0 else 0
        # dot: pink pixels within 9 px of the centre
        yy, xx = np.mgrid[0:H, 0:W]
        fx, fy = xx / S + x, yy / S + y
        m = ((fx - cx) ** 2 + (fy - cy) ** 2) < 9 ** 2
        pd = p * m
        dx = (pd * fx).sum() / max(pd.sum(), 1e-9); dy = (pd * fy).sum() / max(pd.sum(), 1e-9)
        # mean colour of the halo ring band (radius 18..24 px), away from the lines (diagonals)
        r = np.sqrt((fx - cx) ** 2 + (fy - cy) ** 2)
        diag = (np.abs(np.abs(fx - cx) - np.abs(fy - cy)) < 3)
        ring = (r > 19) & (r < 24) & diag
        col = a[ring].mean(axis=0).round(1)
        outside = (r > 33) & (r < 38) & diag
        col_out = a[outside].mean(axis=0).round(1)
        out.append(f"{nm}: vline x={vx:.2f} (w~{vw:.2f}) hline y={hy:.2f} (w~{hw:.2f}) dot=({dx:.2f},{dy:.2f}) halo={col} outside={col_out}")
    print(f['name']); print('   ' + '\n   '.join(out))
