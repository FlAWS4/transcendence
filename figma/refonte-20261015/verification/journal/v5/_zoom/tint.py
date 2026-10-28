"""Area tint differences of a board (v5 check): both halves blurred (radius r) to hide text anti-aliasing, then
regions whose max channel difference exceeds th are listed as 32 px blocks and painted red on a dimmed site copy."""
import sys
from PIL import Image, ImageChops, ImageFilter
p, out = sys.argv[1], sys.argv[2]; th = int(sys.argv[3]) if len(sys.argv) > 3 else 6; r = float(sys.argv[4]) if len(sys.argv) > 4 else 4
im = Image.open(p).convert('RGB'); W = (im.width - 20) // 2; H = im.height - 30
a = im.crop((0, 30, W, 30 + H)); b = im.crop((W + 20, 30, W + 20 + W, 30 + H))
ab, bb = a.filter(ImageFilter.GaussianBlur(r)), b.filter(ImageFilter.GaussianBlur(r))
d = ImageChops.difference(ab, bb); R, G, B = d.split()
m = ImageChops.lighter(ImageChops.lighter(R, G), B).point(lambda v: 255 if v > th else 0)
base = Image.blend(a, Image.new('RGB', a.size, (128, 128, 128)), 0.6); base.paste(Image.new('RGB', a.size, (255, 0, 0)), (0, 0), m)
base.save(out)
S = 32; blocks = []
for y in range(0, H - S + 1, S):
    for x in range(0, W - S + 1, S):
        c = m.crop((x, y, x + S, y + S)).histogram()[255]
        if c > S * S * 0.25:
            blocks.append((x, y, c))
print(out, 'blocks >25% over', th, ':', len(blocks), blocks[:40])
