"""Fair zoom « site | Figma | diff » at the export scale (v5 helper, read-only on sources, 18 Oct. 2026).
  python3 fair5.py <section> <frame index> <x> <y> <w> <h> <out png> [zoom] [site png] [site dy]
Frame coordinates in CSS px. The site crop is reduced to the Figma export scale with a box filter (as an export
does), so thin strokes keep the same contrast on both sides; both are then enlarged (nearest). Third panel:
|site - Figma| x3. For a state captured scrolled, the site crop is read at y - scrollY. An optional site png (file
name in reference/projects) replaces the frame's own capture (read at y + site dy, no scroll)."""
import gzip, json, sys, pathlib
from PIL import Image, ImageDraw, ImageChops
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, fi = sys.argv[1], int(sys.argv[2])
x, y, w, h = map(float, sys.argv[3:7]); outp = sys.argv[7]
Z = float(sys.argv[8]) if len(sys.argv) > 8 else 4.0
alt = sys.argv[9] if len(sys.argv) > 9 and sys.argv[9] != '-' else ''
ady = float(sys.argv[10]) if len(sys.argv) > 10 else 0.0
lay = json.loads((BASE / 'layouts/projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / f'call-results/projects-{sid}-v5.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
ref = BASE / 'reference/projects'
full = ref / f'{name}--full.png'; vp = ref / f'{name}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
sy = 0.0
if alt:
    src = ref / alt; sy = -ady
elif src == vp:
    dump = BASE / 'dom/projects' / f'{name}.json.gz'
    if dump.exists():
        sy = float((json.loads(gzip.decompress(dump.read_bytes())).get('scroll') or [0, 0])[1] or 0)
site = Image.open(src).convert('RGB')
dpr = site.width / f['w']
Wp, Hp = max(1, round(w * k)), max(1, round(h * k))
sc = site.crop((round(x * dpr), round((y - sy) * dpr), round((x + w) * dpr), round((y - sy + h) * dpr))).resize((Wp, Hp), Image.BOX)
x0, y0 = 40 * k + (f['x'] + x) * k, 40 * k + (f['y'] + y) * k
fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BILINEAR)
d = ImageChops.difference(sc, fc).point(lambda v: min(255, v * 3))
W, H = round(Wp * Z), round(Hp * Z)
board = Image.new('RGB', (W * 3 + 24, H + 24), (70, 70, 70))
for i, im in enumerate((sc, fc, d)):
    board.paste(im.resize((W, H), Image.NEAREST), (i * (W + 12), 24))
dr = ImageDraw.Draw(board)
dr.text((4, 6), f"site {src.name} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}] sy {sy:.0f} k={k:.3f}", fill=(255, 255, 255))
dr.text((W + 16, 6), 'Figma ' + f['name'], fill=(255, 255, 255)); dr.text((2 * W + 28, 6), '|diff| x3', fill=(255, 255, 255))
board.save(outp)
def st(im):
    px = sorted(im.getdata(), key=lambda p: 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]); n = len(px)
    return px[0], px[n // 50], px[n // 2], px[-1]
print(outp, board.size, 'ref', src.name, 'sy', sy, '| site dark/p2/med/light', st(sc), '| figma', st(fc))
