"""Section-level visual check (Figma rebuild of 15 October 2026).

  python3 compare_section.py <area> <section id> <figma section png> <out png>
Rebuilds the section from the site captures (reference/<area>/<state>--<fmt>--<lang>-<theme>.png, viewport or full
height as in the layout), placed exactly like the frames of ../layouts/<area>.json, scales it to the Figma screenshot,
and writes « site » above « Figma » for a direct comparison. Prints the share of differing pixels.
"""
import json, sys
from PIL import Image, ImageChops, ImageDraw
from figlib import BASE


def site_board(area, sid):
    lay = json.loads((BASE / 'layouts' / f'{area}.json').read_text())
    sec = next(s for s in lay['sections'] if s['id'] == sid)
    board = Image.new('RGB', (int(sec['w']), int(sec['h'])), (245, 245, 245))
    for row in sec['rows']:
        for f in row:
            name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
            full = BASE / 'reference' / area / f'{name}--full.png'
            vp = BASE / 'reference' / area / f'{name}.png'
            src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
            if not src.exists():
                continue
            im = Image.open(src).convert('RGB')
            im = im.resize((int(f['w']), int(round(im.height * f['w'] / im.width))), Image.LANCZOS)
            board.paste(im.crop((0, 0, int(f['w']), int(f['h']))), (int(f['x']), int(f['y'])))
    return board


if __name__ == '__main__':
    area, sid, fig_png, out = sys.argv[1:5]
    site = site_board(area, sid)
    fig = Image.open(fig_png).convert('RGB')
    site_s = site.resize(fig.size, Image.LANCZOS)
    diff = ImageChops.difference(site_s, fig).convert('L')
    px = list(diff.getdata())
    changed = sum(1 for v in px if v > 40) / len(px)
    W, H = fig.size
    canvas = Image.new('RGB', (W, H * 2 + 60), (60, 60, 60))
    canvas.paste(site_s, (0, 30)); canvas.paste(fig, (0, H + 60))
    d = ImageDraw.Draw(canvas)
    d.text((8, 8), 'site (captures)', fill=(255, 255, 255)); d.text((8, H + 38), 'Figma — %.1f %% de pixels différents' % (changed * 100), fill=(255, 255, 255))
    canvas.save(out)
    print(json.dumps({'changed': round(changed, 4), 'size': [W, H]}))
