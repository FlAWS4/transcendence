"""Boards site | Figma | diff with the section origin and scale measured in the Figma capture.
The Figma section capture has a margin (~29 px) around the section: detect the white section box
(1 px grey outline) and map layout coordinates with it instead of k = capture width / section width.
usage: python3 -I aligned_frames.py <base> <area> <sid> <figma png> <out dir>
"""
import json, sys, pathlib, re
import numpy as np
from PIL import Image, ImageChops, ImageDraw

base, area, sid, fig_png, out = sys.argv[1:6]
base = pathlib.Path(base); out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
lay = json.loads((base / 'layouts' / f'{area}.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
fig = Image.open(fig_png).convert('RGB')
a = np.asarray(fig).astype(int)
white = (a[:, :, 0] == 255) & (a[:, :, 1] == 255) & (a[:, :, 2] == 255)
rows = np.where(white.mean(axis=1) > 0.3)[0]; cols = np.where(white.mean(axis=0) > 0.2)[0]
# white interior is inside a 1 px outline: section box = outline box
x0, x1 = cols.min() - 1, cols.max() + 1
y0, y1 = rows.min() - 1, rows.max() + 1
kx = (x1 - x0 + 1) / sec['w']; ky = (y1 - y0 + 1) / sec['h']
k = (kx + ky) / 2
res = {'section': sid, 'box': [int(x0), int(y0), int(x1), int(y1)], 'kx': kx, 'ky': ky, 'frames': []}
for row in sec['rows']:
    for f in row:
        name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
        full = base / 'reference' / area / f'{name}--full.png'
        vp = base / 'reference' / area / f'{name}.png'
        src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
        box = (x0 + f['x'] * k, y0 + f['y'] * k, x0 + (f['x'] + f['w']) * k, y0 + (f['y'] + f['h']) * k)
        crop = fig.crop(tuple(round(v) for v in box))
        site = Image.open(src).convert('RGB')
        site = site.resize((int(f['w']), int(round(site.height * f['w'] / site.width))), Image.LANCZOS).crop((0, 0, int(f['w']), int(f['h'])))
        crop = crop.resize(site.size, Image.LANCZOS)
        diff = ImageChops.difference(site, crop).convert('L')
        hist = diff.histogram(); total = sum(hist); changed = sum(hist[41:]) / total
        W, H = site.size
        heat = diff.point(lambda v: 0 if v < 41 else min(255, v * 2)).convert('RGB')
        heat = Image.merge('RGB', (heat.split()[0], Image.new('L', heat.size, 0), Image.new('L', heat.size, 0)))
        board = Image.new('RGB', (W * 3 + 40, H + 30), (70, 70, 70))
        board.paste(site, (0, 30)); board.paste(crop, (W + 20, 30)); board.paste(heat, (2 * W + 40, 30))
        d = ImageDraw.Draw(board)
        d.text((6, 8), 'site', fill=(255, 255, 255))
        d.text((W + 26, 8), 'Figma (cadrage mesuré, %.1f %% différents)' % (changed * 100), fill=(255, 255, 255))
        d.text((2 * W + 46, 8), 'écarts > 40/255', fill=(255, 255, 255))
        fn = re.sub(r'[^\w.-]+', '_', f['name'])[:120]
        board.save(out / (fn + '.png'))
        site.save(out / (fn + '--site.png')); crop.save(out / (fn + '--figma.png'))
        res['frames'].append({'frame': f['name'], 'board': str(out / (fn + '.png')), 'changed': round(changed, 4),
                              'figmaBox': [round(v, 1) for v in box], 'src': str(src)})
(out / 'index.json').write_text(json.dumps(res, ensure_ascii=False, indent=1))
print(json.dumps(res, ensure_ascii=False, indent=1))
