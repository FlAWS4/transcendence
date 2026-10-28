"""Scroll-compensated board: site viewport capture (taken at scroll dy) | Figma frame region y = dy .. dy + vh | diff.
python3 scrolldiff.py <section> <frame index> <dy> <out png>"""
import json, sys, pathlib
from PIL import Image, ImageChops, ImageFilter, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, fi, dy, outp = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
lay = json.loads((BASE / 'layouts' / 'projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / 'call-results' / f'projects-{sid}-v3.png').convert('RGB')
k = fig.width / (sec['w'] + 80)
site = Image.open(BASE / 'reference' / 'projects' / f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}.png").convert('RGB')
W = int(f['w']); vh = int(round(site.height * f['w'] / site.width))
site = site.resize((W, vh), Image.LANCZOS)
x0, y0 = 40 * k + f['x'] * k, 40 * k + (f['y'] + dy) * k
h = min(vh, f['h'] - dy)
crop = fig.transform((W, int(h)), Image.Transform.EXTENT, (x0, y0, x0 + W * k, y0 + h * k), Image.Resampling.BICUBIC)
s2 = site.crop((0, 0, W, int(h)))
d = ImageChops.difference(s2.filter(ImageFilter.GaussianBlur(1)), crop.filter(ImageFilter.GaussianBlur(1)))
ch = d.split(); m = ImageChops.lighter(ImageChops.lighter(ch[0], ch[1]), ch[2]).point(lambda v: min(255, v * 4)).convert('RGB')
board = Image.new('RGB', (W * 3 + 40, int(h) + 24), (70, 70, 70))
board.paste(s2, (0, 24)); board.paste(crop, (W + 20, 24)); board.paste(m, (2 * W + 40, 24))
dr = ImageDraw.Draw(board)
dr.text((4, 6), f"site (défilé de {dy:.0f})", fill=(255, 255, 255)); dr.text((W + 24, 6), f"Figma y {dy:.0f}-{dy+h:.0f}", fill=(255, 255, 255)); dr.text((2 * W + 44, 6), "écart x4", fill=(255, 255, 255))
board.save(outp); print(outp, board.size)
