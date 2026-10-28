"""Frame-by-frame boards of a section (Figma rebuild, 16 October 2026).

  python3 section_frames.py <area> <section id> <figma section png> <out dir>
Cuts every frame out of the Figma section screenshot (positions from ../layouts/<area>.json, scaled to the screenshot)
and writes, per frame, « site | Figma » side by side at the frame's own scale (out dir/<frame>.png), plus the share
of differing pixels in index.json. The site capture is the viewport or full-height reference of the same state.
16 Oct.: the section export has a grey margin around the section; its box is detected in the screenshot (scale and
origin), and index.json also gives the mean error per channel and the share of pixels with a channel off by more than
12 levels (hue drifts such as a teal haze stay under the luminance threshold).
"""
import gzip, json, math, sys, pathlib, re
from PIL import Image, ImageChops, ImageDraw
from figlib import BASE

area, sid, fig_png, out = sys.argv[1:5]
out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
lay = json.loads((BASE / 'layouts' / f'{area}.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
fig = Image.open(fig_png).convert('RGB')
# 16 Oct. (v2 check): the export adds 40 units around the section; scale and origin follow from it exactly, and frames
# are cut at sub-pixel positions (the detected box drifted by about one screenshot pixel, 2.7 site px)
kx, ky = fig.width / (sec['w'] + 80), fig.height / (sec['h'] + 80)
if abs(kx - ky) / kx < 0.01:
    # v3 check: the export fixes its longer side exactly and rounds the other one; one scale, from the longer side
    kx = ky = kx if fig.width >= fig.height else ky
    box = (40 * kx, 40 * ky)
else:   # another margin: box detected in the screenshot
    margin = Image.new('RGB', fig.size, fig.getpixel((0, 0)))
    box = ImageChops.difference(fig, margin).convert('L').point(lambda v: 255 if v > 6 else 0).getbbox() or (0, 0, fig.width, fig.height)
    kx, ky = (box[2] - box[0]) / sec['w'], (box[3] - box[1]) / sec['h']
rows = []
for row in sec['rows']:
    for f in row:
        name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
        ref = BASE / 'reference' / lay.get('area', area)   # 16 Oct.: a layout key (awards, compte…) reads the captures of its area
        full = ref / f'{name}--full.png'
        vp = ref / f'{name}.png'
        src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
        if not src.exists():
            rows.append({'frame': f['name'], 'missing reference': src.name}); continue
        site = Image.open(src).convert('RGB')
        sh = int(round(site.height * f['w'] / site.width))
        site = site.resize((int(f['w']), sh), Image.LANCZOS).crop((0, 0, int(f['w']), int(f['h'])))
        # 17 Oct.: a state captured scrolled shows the page from scrollY; the Figma frame draws the page from its top, with
        # the fixed and sticky layers at the top or bottom of the frame. The screen-high reference is compared with the
        # band of the frame that starts at scrollY, both masked where the dump has fixed or sticky layers.
        sy, masks = 0.0, []
        if src == vp:
            dump = BASE / 'dom' / lay.get('area', area) / f"{name}.json.gz"
            if dump.exists():
                dd = json.loads(gzip.decompress(dump.read_bytes()))
                sy = float((dd.get('scroll') or [0, 0])[1] or 0)
                if sy > 0.5:
                    masks = [(nd['x'], nd['y'] - sy, nd['x'] + nd['w'], nd['y'] - sy + nd['h']) for nd in dd['nodes']
                             if (nd.get('s') or {}).get('position') in ('fixed', 'sticky') and nd['w'] * nd['h'] < 0.6 * f['w'] * sh]
                else:
                    sy = 0.0
        x0, y0 = box[0] + f['x'] * kx, box[1] + (f['y'] + sy) * ky
        crop = fig.transform(site.size, Image.Transform.EXTENT, (x0, y0, x0 + site.width * kx, y0 + site.height * ky), Image.Resampling.BICUBIC)
        # v3 check: the export mixes a frame's edge pixel with the white section around it; the measures leave out a
        # border of 1.5 screenshot pixels (the board stays whole)
        m = math.ceil(1.5 / kx)
        # 17 Oct.: a frame taller than its only reference (menus and dialogs captured at screen height, the Figma frame
        # keeps the whole page): the measures cover the reference's height, the board shows the whole frame
        mh = min(site.height, sh)
        inner = (m, m, site.width - m, mh - m)
        a_, b_ = site.copy(), crop.copy()
        if masks:
            da_, db_ = ImageDraw.Draw(a_), ImageDraw.Draw(b_)
            for mx0, my0, mx1, my1 in masks:
                da_.rectangle((mx0, my0, mx1, my1), fill=(0, 0, 0)); db_.rectangle((mx0, my0, mx1, my1), fill=(0, 0, 0))
        rgb = ImageChops.difference(a_.crop(inner), b_.crop(inner))
        diff = rgb.convert('L')
        hist = diff.histogram(); total = sum(hist); changed = sum(hist[41:]) / total
        chans = rgb.split()
        mean = [round(sum(i * c for i, c in enumerate(ch.histogram())) / total, 2) for ch in chans]
        off12 = ImageChops.lighter(ImageChops.lighter(chans[0], chans[1]), chans[2]).point(lambda v: 255 if v > 12 else 0).histogram()[255] / total
        W, H = site.size
        board = Image.new('RGB', (W * 2 + 20, H + 30), (70, 70, 70))
        board.paste(site, (0, 30)); board.paste(crop, (W + 20, 30))
        d = ImageDraw.Draw(board); d.text((6, 8), 'site', fill=(255, 255, 255))
        d.text((W + 26, 8), 'Figma  (%.1f %% différents%s%s)' % (changed * 100, '' if mh >= H else ', mesurés sur les %d px du haut' % mh,
                                                              ', bande à partir de y = %d, calques fixes masqués' % sy if sy else ''), fill=(255, 255, 255))
        if mh < H: d.line((0, 30 + mh, W * 2 + 20, 30 + mh), fill=(255, 64, 64), width=2)
        fn = re.sub(r'[^\w.-]+', '_', f['name'])[:120] + '.png'
        board.save(out / fn)
        rows.append({'frame': f['name'], 'board': str(out / fn), 'changed': round(changed, 4), 'meanRGB': mean, 'channelOff12': round(off12, 4),
                     'scale': [round(kx, 5), round(ky, 5)], 'origin': [round(box[0], 2), round(box[1], 2)], 'border': m,
                     **({} if mh >= H else {'measuredHeight': mh}), **({'scrollY': sy, 'masked': len(masks)} if sy else {})})
(out / 'index.json').write_text(json.dumps(rows, ensure_ascii=False, indent=1))
print(json.dumps(rows, ensure_ascii=False)[:2000])
