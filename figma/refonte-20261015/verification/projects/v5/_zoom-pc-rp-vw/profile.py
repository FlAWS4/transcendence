"""Pixel profile across a line, site (downsampled to the Figma export scale) vs Figma (v5 helper).
  python3 profile.py <section> <frame idx> <x0> <y0> <x1> <y1> [--dy N] [--ref vp|full|png] [--step S]"""
import json, sys, pathlib
from PIL import Image
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
args = sys.argv[1:]
opt = {}
for o in ('--dy', '--ref', '--step'):
    if o in args:
        i = args.index(o); opt[o] = args[i + 1]; del args[i:i + 2]
sid, fi = args[0], int(args[1]); x0, y0, x1, y1 = map(float, args[2:6])
dy = float(opt.get('--dy', 0)); step = float(opt.get('--step', 1))
lay = json.loads((BASE / 'layouts' / 'projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / 'call-results' / f'projects-{sid}-v5.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / 'reference' / 'projects' / f'{name}--full.png'; vp = BASE / 'reference' / 'projects' / f'{name}.png'
ref = opt.get('--ref')
src = vp if ref == 'vp' else full if ref == 'full' else pathlib.Path(ref) if ref else (full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp)
site = Image.open(src).convert('RGB'); dpr = site.width / f['w']
small = site.resize((round(site.width * k / dpr), round(site.height * k / dpr)), Image.LANCZOS)
n = int(max(abs(x1 - x0), abs(y1 - y0)) / step) + 1
ox, oy = 40 * k + f['x'] * k, 40 * k + (f['y'] + dy) * k
for i in range(n):
    t = i / max(1, n - 1); x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t
    s = small.getpixel((min(small.width - 1, int(x * k)), min(small.height - 1, int(y * k))))
    sf = site.getpixel((min(site.width - 1, int(x * dpr)), min(site.height - 1, int(y * dpr))))
    g = fig.getpixel((int(ox + x * k), int(oy + y * k)))
    print('%7.1f %7.1f  site %-16s site@k %-16s figma %s' % (x, y, sf, s, g))
