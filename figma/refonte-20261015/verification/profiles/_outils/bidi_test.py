"""Order test of the Arabic campus labels « 42 X » (verification helper, 18 Oct.; reads only).
  python3 bidi_test.py <section> <frame index> [zoom]
For each campus label of an Arabic frame (DOM runs split by the browser into « X », space, « 42 »), builds from the
full-resolution site capture (a) the label as the site draws it (« X 42 », 42 on the right) and (b) the same glyph
images reordered as a left-to-right paragraph would draw them (« 42 X », 42 on the left), brings both to the Figma
export scale and measures which one the Figma export matches better (mean absolute error on luminance)."""
import sys
from PIL import Image, ImageChops, ImageStat
from common import load, dom
sid, fi = sys.argv[1], int(sys.argv[2])
up = int(sys.argv[3]) if len(sys.argv) > 3 else 4
L = load(sid, fi)
f, fig, k, o, site, dpr = L['f'], L['fig'], L['k'], L['o'], L['site'], L['dpr']
d, dname = dom(L['name'])
wins = {'site order (X 42)': 0, 'LTR order (42 X)': 0}
rows = []
for n in d['nodes']:
    if 'cp-meta' not in (n.get('cls') or '') or not n.get('runs'):
        continue
    r = n['runs'][0]
    if not r['t'].startswith('42 ') or len(r.get('l', [])) != 3:
        continue
    l = sorted(r['l'], key=lambda q: q[0])
    x0, x1 = l[0][0], l[2][0] + l[2][2]
    y0, h = min(q[1] for q in l), max(q[3] for q in l)
    if y0 + h > site.height / dpr:
        continue
    crop = lambda a, b: site.crop((round(a * dpr), round(y0 * dpr), round(b * dpr), round((y0 + h) * dpr)))
    A = crop(x0, x1)
    parts = [crop(q[0], q[0] + q[2]) for q in l]
    B = Image.new('RGB', A.size, site.getpixel((round(x0 * dpr) - 2, round(y0 * dpr))))
    xx = 0
    for p in (parts[2], parts[1], parts[0]):
        B.paste(p, (xx, 0)); xx += p.width
    W, H = max(1, round((x1 - x0) * k * up)), max(1, round(h * k * up))
    # bring to the export resolution, then enlarge both by `up` (same blur on every side)
    def to_export(im):
        return im.resize((max(1, round((x1 - x0) * k)), max(1, round(h * k))), Image.LANCZOS).resize((W, H), Image.BICUBIC)
    a, b = to_export(A), to_export(B)
    fx0, fy0 = o + (f['x'] + x0) * k, o + (f['y'] + y0) * k
    g = fig.transform((max(1, round((x1 - x0) * k)), max(1, round(h * k))), Image.Transform.EXTENT,
                      (fx0, fy0, fx0 + (x1 - x0) * k, fy0 + h * k), Image.Resampling.BICUBIC).resize((W, H), Image.BICUBIC)
    ea = ImageStat.Stat(ImageChops.difference(a.convert('L'), g.convert('L'))).mean[0]
    eb = ImageStat.Stat(ImageChops.difference(b.convert('L'), g.convert('L'))).mean[0]
    rows.append((r['t'], round(x1 - x0, 1), round(ea, 2), round(eb, 2)))
    wins['site order (X 42)' if ea < eb else 'LTR order (42 X)'] += 1
print(f['name'], '|', L['src'].name, '| export scale', round(k, 4))
for t in rows: print('  ', t)
print(wins, 'mean err site-order %.2f, LTR-order %.2f' % (sum(r[2] for r in rows) / max(1, len(rows)), sum(r[3] for r in rows) / max(1, len(rows))))
