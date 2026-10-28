"""Agrandissements site | Figma | écart d'une zone d'un cadre (vérification Chroniques v5, 18 octobre 2026).

  python3 zoom.py <section> <cadre (sous-chaîne du nom)> <x0> <y0> <x1> <y1> <zoom> <sortie.png> [diff]
Coordonnées en px du cadre. Le site est pris dans la capture d'origine (2x sur mobile), Figma dans l'export de section.
"""
import json, sys, pathlib
from PIL import Image, ImageChops, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
FIG = {'journal': BASE / 'call-results/journal-journal-v3.png', 'article': BASE / 'call-results/journal-article-v4.png'}
sid, key = sys.argv[1], sys.argv[2]
x0, y0, x1, y1 = map(float, sys.argv[3:7]); z = float(sys.argv[7]); out = sys.argv[8]
withdiff = len(sys.argv) > 9
lay = json.loads((BASE / 'layouts/journal.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = next(f for row in sec['rows'] for f in row if f['name'] == key or key == f"{f['fmt']}-{f['lang']}-{f['theme']}")
fig = Image.open(FIG[sid]).convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
bx = 40 * k
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / 'reference/journal' / f'{name}--full.png'
vp = BASE / 'reference/journal' / f'{name}.png'
src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
site = Image.open(src).convert('RGB')
s = site.width / f['w']
W, H = int(round((x1 - x0) * z)), int(round((y1 - y0) * z))
a = site.transform((W, H), Image.Transform.EXTENT, (x0 * s, y0 * s, x1 * s, y1 * s), Image.Resampling.BICUBIC)
fx0, fy0 = bx + (f['x'] + x0) * k, bx + (f['y'] + y0) * k
b = fig.transform((W, H), Image.Transform.EXTENT, (fx0, fy0, fx0 + (x1 - x0) * k, fy0 + (y1 - y0) * k), Image.Resampling.BICUBIC)
panels = [a, b]
if withdiff:
    d = ImageChops.difference(a, b).convert('L').point(lambda v: min(255, v * 3))
    panels.append(Image.merge('RGB', (d, d, d)))
board = Image.new('RGB', (W * len(panels) + 10 * (len(panels) - 1), H + 22), (70, 70, 70))
for i, p in enumerate(panels):
    board.paste(p, (i * (W + 10), 22))
dr = ImageDraw.Draw(board)
dr.text((4, 5), 'site %s  [%g,%g → %g,%g] x%g' % (src.name, x0, y0, x1, y1, z), fill=(255, 255, 255))
dr.text((W + 14, 5), 'Figma (export x%.3f)' % k, fill=(255, 255, 255))
if withdiff: dr.text((2 * W + 24, 5), 'écart x3', fill=(255, 255, 255))
board.save(out)
print(out, board.size)
