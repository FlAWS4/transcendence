"""Aligned « site | Figma » boards: the section screenshot includes a 40-unit padding (scale = width / (w + 80))."""
import json, sys, pathlib, re
from PIL import Image, ImageChops, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
area, sid, fig_png, out = sys.argv[1:5]
PAD = 40
out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
lay = json.loads((BASE / 'layouts' / f'{area}.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
fig = Image.open(fig_png).convert('RGB')
k = fig.width / (sec['w'] + 2 * PAD)
ky = fig.height / (sec['h'] + 2 * PAD)
rows = []
for row in sec['rows']:
    for f in row:
        name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
        full = BASE / 'reference' / area / f'{name}--full.png'
        vp = BASE / 'reference' / area / f'{name}.png'
        src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
        box = ((f['x'] + PAD) * k, (f['y'] + PAD) * k, (f['x'] + PAD + f['w']) * k, (f['y'] + PAD + f['h']) * k)
        crop = fig.resize((fig.width, fig.height)).crop(tuple(round(v) for v in box))
        W, H = int(f['w']), int(f['h'])
        site = Image.open(src).convert('RGB')
        site = site.resize((W, int(round(site.height * W / site.width))), Image.LANCZOS).crop((0, 0, W, H))
        # native-scale diff (site reduced to the Figma crop size)
        site_small = site.resize(crop.size, Image.LANCZOS)
        diff = ImageChops.difference(site_small, crop).convert('L')
        hist = diff.histogram(); changed = sum(hist[41:]) / sum(hist)
        up = crop.resize((W, H), Image.LANCZOS)
        board = Image.new('RGB', (W * 2 + 20, H + 30), (70, 70, 70))
        board.paste(site, (0, 30)); board.paste(up, (W + 20, 30))
        d = ImageDraw.Draw(board); d.text((6, 8), 'site', fill=(255, 255, 255)); d.text((W + 26, 8), 'Figma aligned (%.1f %% differents, native scale)' % (changed * 100), fill=(255, 255, 255))
        fn = re.sub(r'[^\w.-]+', '_', f['name'])[:120] + '.png'
        board.save(out / fn)
        crop.save(out / ('_crop_' + fn))
        rows.append({'frame': f['name'], 'state': name, 'board': str(out / fn), 'crop': str(out / ('_crop_' + fn)), 'changed_native': round(changed, 4), 'scale': round(k, 5), 'scale_y': round(ky, 5)})
(out / 'index.json').write_text(json.dumps(rows, ensure_ascii=False, indent=1))
for r in sorted(rows, key=lambda r: -r['changed_native']): print(r['changed_native'], r['frame'])
