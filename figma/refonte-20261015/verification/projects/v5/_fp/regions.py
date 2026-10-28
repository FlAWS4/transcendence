"""Region metrics « site vs Figma v5 » for one frame, by frame name (filter-projects / project check, 18 Oct. 2026).
  python3 regions.py <section> <frame name or substring> name:x,y,w,h [name:x,y,w,h …]
Frame coordinates in CSS px. Both sides at the Figma export scale (site box-reduced). Prints the mean RGB of each side,
the darkest and lightest pixel (luminance), and the share of pixels off by > 12. Reads only."""
import json, sys
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image, ImageChops
from figlib import BASE
sid, sub = sys.argv[1], sys.argv[2]
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
fr = [f for row in sec['rows'] for f in row if f['name'] == sub] or [f for row in sec['rows'] for f in row if sub in f['name']]
f = fr[0]
fig = Image.open(BASE / f'call-results/projects-{sid}-v5.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
ref = BASE / 'reference/projects'
full = ref / f'{name}--full.png'; vp = ref / f'{name}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB'); dpr = site.width / f['w']
def stats(im):
    px = list(im.get_flattened_data()) if hasattr(im, 'get_flattened_data') else list(im.getdata()); n = len(px)
    mean = tuple(round(sum(p[i] for p in px) / n) for i in range(3))
    lum = sorted(px, key=lambda p: 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2])
    return mean, lum[0], lum[-1]
print(f['name'], '| ref', src.name, '| k', round(k, 4))
for spec in sys.argv[3:]:
    nm, r = spec.split(':'); x, y, w, h = map(float, r.split(','))
    Wp, Hp = max(1, round(w * k)), max(1, round(h * k))
    x0, y0 = 40 * k + (f['x'] + x) * k, 40 * k + (f['y'] + y) * k
    fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BILINEAR)
    if y + h <= site.height / dpr + 0.5:
        sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr))).resize((Wp, Hp), Image.BOX)
        d = ImageChops.difference(sc, fc); ch = d.split()
        off = ImageChops.lighter(ImageChops.lighter(ch[0], ch[1]), ch[2]).point(lambda v: 255 if v > 12 else 0).histogram()[255] / (Wp * Hp)
        s = stats(sc)
        print(f'{nm:22s} site mean{s[0]} dark{s[1]} light{s[2]} | ', end='')
    else:
        off = float('nan'); print(f'{nm:22s} site (outside the reference) | ', end='')
    g = stats(fc)
    print(f'figma mean{g[0]} dark{g[1]} light{g[2]} | off12 {off:.2f}')
