"""Montage of the clamped excerpts of a mobile list board (journal v2 check, reprise 17 Oct.)
  python3 excerpts.py <board> <out> <scene json>"""
import sys, json
from PIL import Image, ImageDraw
b = Image.open(sys.argv[1]).convert('RGB'); out = sys.argv[2]; sc = json.load(open(sys.argv[3]))
W = (b.width - 20) // 2
boxes = []
def walk(n, ox=0, oy=0):
    if not isinstance(n, dict): return
    x = ox + (n.get('x') or 0); y = oy + (n.get('y') or 0)
    if n.get('t') == 'T' and n.get('ml') == 2 and (n.get('w') or 0) > 100:
        boxes.append((x - 4, y - 2, x + n['w'] + 4, y + 2 * n['lh'] + 4))
    for c in n.get('ch', []) or []:
        walk(c, x, y)
walk(sc)
k = 2.5
rows = []
for (x0, y0, x1, y1) in boxes:
    s = b.crop((int(x0), int(30 + y0), int(x1), int(30 + y1)))
    f = b.crop((int(W + 20 + x0), int(30 + y0), int(W + 20 + x1), int(30 + y1)))
    w, h = int((x1 - x0) * k), int((y1 - y0) * k)
    rows.append((s.resize((w, h), Image.LANCZOS), f.resize((w, h), Image.LANCZOS)))
w = max(r[0].width for r in rows); h = sum(r[0].height + 6 for r in rows)
im = Image.new('RGB', (2 * w + 12, h + 18), (255, 0, 255))
d = ImageDraw.Draw(im); d.text((4, 3), 'site', fill=(255, 255, 255)); d.text((w + 16, 3), 'Figma', fill=(255, 255, 255))
y = 18
for s, f in rows:
    im.paste(s, (0, y)); im.paste(f, (w + 12, y)); y += s.height + 6
im.save(out); print(out, im.size, len(rows))
