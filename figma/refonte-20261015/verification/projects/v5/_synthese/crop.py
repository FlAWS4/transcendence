"""Composite crops of boards (site | Figma) at frame coordinates. Synthesis v5, read-only pass.
usage: python3 crop.py out.png scale x y w h board1.png [board2.png ...]
Each board: site at (0,30), Figma at (W+20,30), W = (board.width-20)/2.
"""
import sys
from PIL import Image, ImageDraw
out, sc, x, y, w, h = sys.argv[1], float(sys.argv[2]), *map(float, sys.argv[3:7])
boards = sys.argv[7:]
tiles = []
for b in boards:
    im = Image.open(b).convert('RGB')
    W = (im.width - 20) // 2
    s = im.crop((int(x), int(y + 30), int(x + w), int(y + 30 + h)))
    f = im.crop((int(W + 20 + x), int(y + 30), int(W + 20 + x + w), int(y + 30 + h)))
    s = s.resize((int(w * sc), int(h * sc)), Image.LANCZOS); f = f.resize((int(w * sc), int(h * sc)), Image.LANCZOS)
    t = Image.new('RGB', (s.width * 2 + 10, s.height + 16), (60, 60, 60))
    t.paste(s, (0, 16)); t.paste(f, (s.width + 10, 16))
    d = ImageDraw.Draw(t); d.text((2, 2), b.split('/')[-1][:90] + '  [site | Figma]', fill=(255, 255, 0))
    tiles.append(t)
Wt = max(t.width for t in tiles); Ht = sum(t.height + 6 for t in tiles)
canvas = Image.new('RGB', (Wt, Ht), (40, 40, 40)); yy = 0
for t in tiles:
    canvas.paste(t, (0, yy)); yy += t.height + 6
canvas.save(out); print(out, canvas.size)
