"""Zoom on a region of a frame: site reference (native resolution) | Figma section capture (native 0.704), same scale.
  python3 zoom.py <section> <frame substring> x0 y0 x1 y1 scale out.png [vertical]
Coordinates are in frame units (CSS px). Written for the v5 check (read-only pass, 18 Oct. 2026)."""
import json, sys, pathlib
from PIL import Image, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, fsub = sys.argv[1], sys.argv[2]
x0, y0, x1, y1, sc = map(float, sys.argv[3:8]); out = sys.argv[8]
vert = len(sys.argv) > 9 and sys.argv[9] == 'v'
lay = json.loads((BASE / 'layouts' / 'journal.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
fr = next(f for row in sec['rows'] for f in row if fsub == f['name'] or fsub in f['name'])
name = f"{fr['state']}--{fr['fmt']}--{fr['lang']}-{fr['theme']}"
ref = BASE / 'reference' / 'journal'
full, vp = ref / f'{name}--full.png', ref / f'{name}.png'
src = full if (full.exists() and fr['h'] > (844 if fr['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB'); ks = site.width / fr['w']
fig = Image.open(BASE / 'call-results' / f'journal-{sid}-v3.png').convert('RGB')
k = fig.width / (sec['w'] + 80); ox = 40 * k
W, H = int((x1 - x0) * sc), int((y1 - y0) * sc)
a = site.crop((int(x0 * ks), int(y0 * ks), int(x1 * ks), int(y1 * ks))).resize((W, H), Image.LANCZOS)
fx, fy = ox + (fr['x'] + x0) * k, ox + (fr['y'] + y0) * k
b = fig.transform((W, H), Image.Transform.EXTENT, (fx, fy, fx + (x1 - x0) * k, fy + (y1 - y0) * k), Image.Resampling.BICUBIC)
if vert:
    board = Image.new('RGB', (W, H * 2 + 40), (70, 70, 70)); board.paste(a, (0, 18)); board.paste(b, (0, H + 40))
    d = ImageDraw.Draw(board); d.text((4, 3), 'site', fill=(255, 255, 255)); d.text((4, H + 24), 'Figma', fill=(255, 255, 255))
else:
    board = Image.new('RGB', (W * 2 + 12, H + 18), (70, 70, 70)); board.paste(a, (0, 18)); board.paste(b, (W + 12, 18))
    d = ImageDraw.Draw(board); d.text((4, 3), 'site', fill=(255, 255, 255)); d.text((W + 16, 3), 'Figma', fill=(255, 255, 255))
board.save(out)
print(out, board.size, 'site src', src.name, 'ks', ks)
