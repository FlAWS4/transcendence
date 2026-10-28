"""Whole-frame « site at export scale | Figma » strips, enlarged (verification helper, 18 Oct.).
  python3 strip.py <section> <frame index> <enlarge> <parts> <out prefix>
Both sides at the Figma export scale (site downsampled), then enlarged by the same factor; the frame height is cut into
<parts> strips (out prefix-<n>.png)."""
import sys
from PIL import Image, ImageDraw
from common import load
sid, fi, z, parts, outp = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
L = load(sid, fi)
f, fig, k, o, site, dpr = L['f'], L['fig'], L['k'], L['o'], L['site'], L['dpr']
H = f['h']
Wp, Hp = round(f['w'] * k), round(H * k)
x0, y0 = o + f['x'] * k, o + f['y'] * k
fc = fig.transform((Wp, Hp), Image.Transform.EXTENT, (x0, y0, x0 + f['w'] * k, y0 + H * k), Image.Resampling.BICUBIC)
sh = min(H, site.height / dpr)
sc = Image.new('RGB', (Wp, Hp), (0, 0, 0))
sc.paste(site.crop((0, 0, site.width, round(sh * dpr))).resize((Wp, round(sh * k)), Image.LANCZOS), (0, 0))
W2, H2 = round(Wp * z), round(Hp * z)
a, b = sc.resize((W2, H2), Image.BICUBIC), fc.resize((W2, H2), Image.BICUBIC)
step = H2 / parts
for p in range(parts):
    t0, t1 = round(p * step), round((p + 1) * step)
    board = Image.new('RGB', (W2 * 2 + 12, t1 - t0 + 16), (70, 70, 70))
    board.paste(a.crop((0, t0, W2, t1)), (0, 16)); board.paste(b.crop((0, t0, W2, t1)), (W2 + 12, 16))
    d = ImageDraw.Draw(board)
    d.text((4, 2), f'site@export y {t0 / z / k:.0f}-{t1 / z / k:.0f}', fill=(255, 255, 255)); d.text((W2 + 16, 2), 'Figma', fill=(255, 255, 255))
    board.save(f'{outp}-{p + 1}.png')
print(f['name'], L['src'].name, (W2, H2), parts)
