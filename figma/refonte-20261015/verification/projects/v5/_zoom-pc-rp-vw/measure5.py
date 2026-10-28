"""Same measures as section_frames.py for one frame with a chosen band offset (v5 helper):
  python3 measure5.py <section> <frame idx> <dy> [h]  → changed, meanRGB, channelOff12 (no masks)"""
import json, sys, math, pathlib
from PIL import Image, ImageChops
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sid, fi, dy = sys.argv[1], int(sys.argv[2]), float(sys.argv[3])
lay = json.loads((BASE / 'layouts' / 'projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / 'call-results' / f'projects-{sid}-v5.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
vp = BASE / 'reference' / 'projects' / f'{name}.png'
site = Image.open(vp).convert('RGB')
W = int(f['w']); H = int(round(site.height * W / site.width)); H = int(sys.argv[4]) if len(sys.argv) > 4 else H
site = site.resize((W, int(round(site.height * W / site.width))), Image.LANCZOS).crop((0, 0, W, H))
x0, y0 = 40 * k + f['x'] * k, 40 * k + (f['y'] + dy) * k
crop = fig.transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + W * k, y0 + H * k), Image.Resampling.BICUBIC)
m = math.ceil(1.5 / k)
inner = (m, m, W - m, H - m)
rgb = ImageChops.difference(site.crop(inner), crop.crop(inner)); diff = rgb.convert('L')
hist = diff.histogram(); tot = sum(hist); ch = sum(hist[41:]) / tot
chans = rgb.split(); mean = [round(sum(i * c for i, c in enumerate(cc.histogram())) / tot, 2) for cc in chans]
off = ImageChops.lighter(ImageChops.lighter(chans[0], chans[1]), chans[2]).point(lambda v: 255 if v > 12 else 0).histogram()[255] / tot
print(f['name'], 'dy', dy, 'h', H, 'changed %.4f' % ch, 'meanRGB', mean, 'off12 %.4f' % off)
