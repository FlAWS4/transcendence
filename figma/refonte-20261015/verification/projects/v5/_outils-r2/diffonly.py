"""Difference maps of the section, one image per row of frames (site | Figma | |diff| x4 after a 0.6 px blur), all at
the export scale x2 (v5 check helper, read-only on sources)."""
import json, sys
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from PIL import Image, ImageChops, ImageFilter, ImageDraw
from figlib import BASE
OUT = BASE / 'verification/projects/v5/_zoom-pl-r2'
Z = float(sys.argv[1]) if len(sys.argv) > 1 else 2.0
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == 'projects')
fig = Image.open(BASE / 'call-results/projects-projects-v5.png').convert('RGB')
k = fig.height / (sec['h'] + 80)
for ri, row in enumerate(sec['rows']):
    tiles = []
    for f in row:
        st = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
        full = BASE / f'reference/projects/{st}--full.png'; vp = BASE / f'reference/projects/{st}.png'
        src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
        site = Image.open(src).convert('RGB'); dpr = site.width / f['w']
        H = min(f['h'], site.height / dpr)
        Wp, Hp = round(f['w'] * k), round(H * k)
        x0, y0 = 40 * k + f['x'] * k, 40 * k + f['y'] * k
        fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + f['w'] * k, y0 + H * k), Image.Resampling.BILINEAR)
        sc = site.crop((0, 0, site.width, round(H * dpr))).resize((Wp, Hp), Image.BOX)
        d = ImageChops.difference(sc.filter(ImageFilter.GaussianBlur(0.6)), fc.filter(ImageFilter.GaussianBlur(0.6))).point(lambda v: min(255, v * 4))
        W2, H2 = round(Wp * Z), round(Hp * Z)
        t = Image.new("RGB", (W2, H2 + 16), (60, 60, 60))
        t.paste(d.resize((W2, H2), Image.NEAREST), (0, 16))
        dr = ImageDraw.Draw(t); dr.text((2, 2), f['name'][:70], fill=(255, 255, 0))
        # 100 px ticks on the left of the diff panel
        for yy in range(0, int(H) + 1, 100):
            Y = 16 + yy * k * Z
            dr.line((0, Y, 6 + (6 if yy % 500 == 0 else 0), Y), fill=(0, 255, 255))
        tiles.append(t)
    Wt = sum(t.width + 10 for t in tiles); Ht = max(t.height for t in tiles)
    out = Image.new('RGB', (Wt, Ht), (30, 30, 30)); xx = 0
    for t in tiles:
        out.paste(t, (xx, 0)); xx += t.width + 10
    out.save(OUT / f'_diffonly-{ri}.png'); print(OUT / f'_diffrow-{ri}.png', out.size)
