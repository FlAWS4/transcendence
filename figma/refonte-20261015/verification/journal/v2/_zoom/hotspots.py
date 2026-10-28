"""Hot spots of a board (v2 journal check, 17 Oct. 2026): tiles where site and Figma differ beyond anti-aliasing.
  python3 hotspots.py <board png> [tile] [threshold]
Prints clusters of tiles (frame coordinates) with their mean channel error and the mean colours of both sides.
"""
import sys
from PIL import Image, ImageChops, ImageFilter
b = sys.argv[1]; T = int(sys.argv[2]) if len(sys.argv) > 2 else 16; th = float(sys.argv[3]) if len(sys.argv) > 3 else 10
im = Image.open(b).convert('RGB')
W = (im.width - 20) // 2; H = im.height - 30
site = im.crop((0, 30, W, 30 + H)).filter(ImageFilter.GaussianBlur(1.2))
fig = im.crop((W + 20, 30, W + 20 + W, 30 + H)).filter(ImageFilter.GaussianBlur(1.2))
diff = ImageChops.difference(site, fig)
mx = ImageChops.lighter(ImageChops.lighter(*diff.split()[:2]), diff.split()[2])
hot = {}
for ty in range(0, H - T + 1, T):
    for tx in range(3, W - T - 2, T):
        box = (tx, ty, tx + T, ty + T)
        h = mx.crop(box).histogram(); n = sum(h)
        mean = sum(i * c for i, c in enumerate(h)) / n
        if mean > th:
            hot[(tx // T, ty // T)] = mean
# cluster 8-connected
seen = set(); clusters = []
for k in hot:
    if k in seen: continue
    st = [k]; seen.add(k); cl = []
    while st:
        c = st.pop(); cl.append(c)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                nb = (c[0] + dx, c[1] + dy)
                if nb in hot and nb not in seen:
                    seen.add(nb); st.append(nb)
    clusters.append(cl)
def avg(img, box):
    c = img.crop(box).resize((1, 1), Image.BOX).getpixel((0, 0)); return c
res = []
for cl in clusters:
    x0 = min(c[0] for c in cl) * T; y0 = min(c[1] for c in cl) * T
    x1 = (max(c[0] for c in cl) + 1) * T; y1 = (max(c[1] for c in cl) + 1) * T
    m = sum(hot[c] for c in cl) / len(cl); peak = max(hot[c] for c in cl)
    res.append((len(cl) * m, x0, y0, x1, y1, len(cl), m, peak, avg(site, (x0, y0, x1, y1)), avg(fig, (x0, y0, x1, y1))))
res.sort(reverse=True)
print(b.split('/')[-1], 'W', W, 'H', H, 'clusters', len(res))
for r in res[:40]:
    print('  box(%d,%d)-(%d,%d) tiles=%d mean=%.1f peak=%.1f site=%s fig=%s' % (r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9]))
