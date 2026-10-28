"""Zoom « site (another state's capture, page top) | Figma frame » (v5 helper, read-only, 18 Oct.).
  python3 zoom_alt.py <section> <frame index> <site png> <x> <y> <w> <h> <zoom> <out png>
Used for scrolled states whose own capture hides a region under the header: the site side comes from the capture of
a state with the same page above the changed part (e.g. project-comments for comment-menu)."""
import json, sys, pathlib
from PIL import Image, ImageDraw
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, fi, sp = sys.argv[1], int(sys.argv[2]), sys.argv[3]
x, y, w, h, z = map(float, sys.argv[4:9]); outp = sys.argv[9]
lay = json.loads((BASE / 'layouts' / 'projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / 'call-results' / f'projects-{sid}-v5.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
o = 40 * k
site = Image.open(BASE / 'reference' / 'projects' / sp).convert('RGB'); dpr = site.width / f['w']
W, H = int(w * z), int(h * z)
sc = site.crop((round(x * dpr), round(y * dpr), round((x + w) * dpr), round((y + h) * dpr))).resize((W, H), Image.LANCZOS)
x0, y0 = o + (f['x'] + x) * k, o + (f['y'] + y) * k
fc = fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BICUBIC)
b = Image.new('RGB', (W * 2 + 12, H + 22), (70, 70, 70)); b.paste(sc, (0, 22)); b.paste(fc, (W + 12, 22))
d = ImageDraw.Draw(b); d.text((4, 5), f'site {sp} [{x:.0f},{y:.0f} {w:.0f}x{h:.0f}]', fill=(255, 255, 255)); d.text((W + 16, 5), 'Figma ' + f['name'], fill=(255, 255, 255))
b.save(outp); print(outp, b.size)
