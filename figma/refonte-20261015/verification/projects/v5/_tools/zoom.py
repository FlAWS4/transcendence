"""Zoomed « site | Figma » crops of one frame region (v5 verification helper, read-only on sources, 18 Oct.).
  python3 zoom.py <section> <frame index> <x> <y> <w> <h> <zoom> <out png> [figma|full]
Frame coordinates in CSS px (Figma frame). Same box and scale as section_frames.py (40-unit export margin, one
scale from the longer side). For a state captured scrolled (dump 'scroll'), the site crop is taken at y - scrollY.
'full' as last arg: the site side shows the full-height capture when present."""
import gzip, json, sys, pathlib
from PIL import Image, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
AREA = 'projects'
sid, fi, x, y, w, h, z, outp = sys.argv[1], int(sys.argv[2]), *map(float, sys.argv[3:8]), sys.argv[8]
mode = sys.argv[9] if len(sys.argv) > 9 else ''
lay = json.loads((BASE / 'layouts' / f'{AREA}.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / 'call-results' / f'{AREA}-{sid}-v5.png').convert('RGB')
kx, ky = fig.width / (sec['w'] + 80), fig.height / (sec['h'] + 80)
k = kx if fig.width >= fig.height else ky
ox = oy = 40 * k
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / 'reference' / AREA / f'{name}--full.png'
vp = BASE / 'reference' / AREA / f'{name}.png'
src = full if (full.exists() and (mode == 'full' or f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4)) else vp
sy = 0.0
if src == vp:
    dump = BASE / 'dom' / AREA / f'{name}.json.gz'
    if dump.exists():
        dd = json.loads(gzip.decompress(dump.read_bytes()))
        sy = float((dd.get('scroll') or [0, 0])[1] or 0)
W, H = int(w * z), int(h * z)
if src.exists():
    site = Image.open(src).convert('RGB')
    dpr = site.width / f['w']
    sc = site.crop((round(x * dpr), round((y - sy) * dpr), round((x + w) * dpr), round((y - sy + h) * dpr))).resize((W, H), Image.LANCZOS)
else:
    sc = Image.new('RGB', (W, H), (0, 0, 0)); dpr = 0
x0, y0 = ox + (f['x'] + x) * k, oy + (f['y'] + y) * k
fc = fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BICUBIC)
if mode == 'figma':
    board = Image.new('RGB', (W, H + 22), (70, 70, 70)); board.paste(fc, (0, 22))
    ImageDraw.Draw(board).text((4, 5), f'Figma {f["name"]} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}] k {k:.3f}', fill=(255, 255, 255))
else:
    board = Image.new('RGB', (W * 2 + 12, H + 22), (70, 70, 70))
    board.paste(sc, (0, 22)); board.paste(fc, (W + 12, 22))
    d = ImageDraw.Draw(board)
    d.text((4, 5), f'site {src.name} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}] sy {sy:.0f} dpr {dpr:.2f}', fill=(255, 255, 255))
    d.text((W + 16, 5), f'Figma (export scale {k:.3f})', fill=(255, 255, 255))
board.save(outp)
print(outp, board.size, 'src', src.name, 'sy', sy, 'frame', f['name'])
