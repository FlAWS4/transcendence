"""Carte des écarts d'une planche « site | Figma » (vérification Chroniques v5, 18 octobre 2026).

  python3 hotspots.py <planche.png> <sortie.png> [bloc=16] [flou=1.5] [n=25]
Les deux moitiés sont légèrement floutées (l'export Figma est à 0,5 ou 0,7 px par px), puis comparées par blocs.
La sortie montre le site, Figma et la carte des écarts (rouge = blocs les plus différents) ; la console liste
les blocs les plus différents en px du cadre, regroupés en zones.
"""
import sys
from PIL import Image, ImageChops, ImageFilter, ImageDraw
p, out = sys.argv[1], sys.argv[2]
bs = int(sys.argv[3]) if len(sys.argv) > 3 else 16
fl = float(sys.argv[4]) if len(sys.argv) > 4 else 1.5
n = int(sys.argv[5]) if len(sys.argv) > 5 else 25
im = Image.open(p).convert('RGB')
W = (im.width - 20) // 2
a = im.crop((0, 30, W, im.height)); b = im.crop((W + 20, 30, 2 * W + 20, im.height))
da = a.filter(ImageFilter.GaussianBlur(fl)); db = b.filter(ImageFilter.GaussianBlur(fl))
d = ImageChops.difference(da, db)
dl = ImageChops.lighter(ImageChops.lighter(*d.split()[:2]), d.split()[2])
H = a.height
scores = []
for y in range(0, H - bs + 1, bs):
    for x in range(0, W - bs + 1, bs):
        c = dl.crop((x, y, x + bs, y + bs))
        hist = c.histogram(); tot = bs * bs
        mean = sum(i * v for i, v in enumerate(hist)) / tot
        scores.append((mean, x, y))
scores.sort(reverse=True)
heat = Image.new('RGB', a.size, (0, 0, 0))
hd = ImageDraw.Draw(heat)
mx = max(scores[0][0], 1)
for m, x, y in scores:
    v = int(255 * min(1, m / max(mx * 0.6, 8)))
    if m > 6: hd.rectangle((x, y, x + bs - 1, y + bs - 1), fill=(v, 0, 0))
over = Image.blend(b, heat, 0.55)
board = Image.new('RGB', (W * 3 + 20, H), (70, 70, 70))
board.paste(a, (0, 0)); board.paste(b, (W + 10, 0)); board.paste(over, (2 * W + 20, 0))
board.save(out)
# zones: merge neighbouring top blocks
top = [(m, x, y) for m, x, y in scores if m > 10][:400]
zones = []
for m, x, y in top:
    for z in zones:
        if x <= z[2] + bs and x + bs >= z[0] and y <= z[3] + bs and y + bs >= z[1]:
            z[0] = min(z[0], x); z[1] = min(z[1], y); z[2] = max(z[2], x + bs); z[3] = max(z[3], y + bs); z[4] = max(z[4], m); z[5] += 1
            break
    else:
        zones.append([x, y, x + bs, y + bs, m, 1])
zones.sort(key=lambda z: -z[4] * z[5] ** 0.5)
for z in zones[:n]:
    print('zone x %d-%d y %d-%d  max %.1f  blocs %d' % (z[0], z[2], z[1], z[3], z[4], z[5]))
