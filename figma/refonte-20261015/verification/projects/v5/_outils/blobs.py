"""Difference blobs of every frame of a section at the Figma export scale (v5 check helper, read-only on sources).
  python3 blobs.py <section> [threshold] [min cells]
Site downsampled with a box filter, both sides blurred (0.6 px) to ignore anti-aliasing; |site - Figma| max channel;
4×4 cells above the threshold are grouped; prints the frame-px boxes and the mean signed difference (Figma - site)."""
import json, sys, pathlib
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image, ImageChops, ImageFilter
from figlib import BASE
sid = sys.argv[1]; thr = int(sys.argv[2]) if len(sys.argv) > 2 else 40; minc = int(sys.argv[3]) if len(sys.argv) > 3 else 6
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
fig = Image.open(BASE / f'call-results/projects-{sid}-v5.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
out = {}
for f in [f for row in sec['rows'] for f in row]:
    name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
    ref = BASE / 'reference/projects'
    full = ref / f'{name}--full.png'; vp = ref / f'{name}.png'
    src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
    if not src.exists():
        continue
    site = Image.open(src).convert('RGB'); dpr = site.width / f['w']
    H = min(f['h'], site.height / dpr)
    Wp, Hp = round(f['w'] * k), round(H * k)
    x0, y0 = 40 * k + f['x'] * k, 40 * k + f['y'] * k
    fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + f['w'] * k, y0 + H * k), Image.Resampling.BICUBIC)
    sc = site.crop((0, 0, site.width, round(H * dpr))).resize((Wp, Hp), Image.BOX)
    a = sc.filter(ImageFilter.GaussianBlur(0.6)); b = fc.filter(ImageFilter.GaussianBlur(0.6))
    d = ImageChops.difference(a, b); ch = d.split()
    m = ImageChops.lighter(ImageChops.lighter(ch[0], ch[1]), ch[2])
    g = 4; px = m.load(); cells = []
    for gy in range(2, m.height - 2, g):
        for gx in range(2, m.width - 2, g):
            n = sum(1 for yy in range(gy, min(gy + g, m.height)) for xx in range(gx, min(gx + g, m.width)) if px[xx, yy] > thr)
            if n >= g * g * 0.3: cells.append((gx, gy))
    cs = set(cells); seen = set(); blobs = []
    pa, pb = a.load(), b.load()
    for c in cells:
        if c in seen: continue
        stack = [c]; seen.add(c); bb = [c[0], c[1], c[0] + g, c[1] + g]; cnt = 0
        while stack:
            cx, cy = stack.pop(); cnt += 1
            bb = [min(bb[0], cx), min(bb[1], cy), max(bb[2], cx + g), max(bb[3], cy + g)]
            for dx in (-g, 0, g):
                for dy in (-g, 0, g):
                    nb = (cx + dx, cy + dy)
                    if nb in cs and nb not in seen: seen.add(nb); stack.append(nb)
        if cnt >= minc:
            sa = [0, 0, 0]; sb = [0, 0, 0]; nn = 0
            for yy in range(bb[1], min(bb[3], m.height)):
                for xx in range(bb[0], min(bb[2], m.width)):
                    for i in range(3): sa[i] += pa[xx, yy][i]; sb[i] += pb[xx, yy][i]
                    nn += 1
            blobs.append({'cells': cnt, 'box': [round(bb[0] / k), round(bb[1] / k), round(bb[2] / k), round(bb[3] / k)],
                          'site': [round(v / nn) for v in sa], 'figma': [round(v / nn) for v in sb]})
    blobs.sort(key=lambda b: -b['cells'])
    out[f['name']] = {'ref': src.name, 'blobs': blobs[:25]}
    print('==', f['name'], '|', src.name, '|', len(blobs), 'taches')
    for bl in blobs[:14]:
        print('   ', bl['cells'], bl['box'], 'site', bl['site'], 'figma', bl['figma'])
(BASE / f'verification/projects/v5/_outils/blobs-{sid}.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
