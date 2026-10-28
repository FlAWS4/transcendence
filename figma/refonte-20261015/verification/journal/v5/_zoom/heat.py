"""Difference map of a board (v5 check): pixels whose channels differ by more than a threshold, in red over a dimmed
copy of the site half. python3 heat.py <board> <out.png> [threshold]"""
import sys
from PIL import Image, ImageChops
p, out = sys.argv[1], sys.argv[2]; th = int(sys.argv[3]) if len(sys.argv) > 3 else 24
im = Image.open(p).convert('RGB'); W = (im.width - 20) // 2; H = im.height - 30
a = im.crop((0, 30, W, 30 + H)); b = im.crop((W + 20, 30, W + 20 + W, 30 + H))
d = ImageChops.difference(a, b)
r, g, bl = d.split()
m = ImageChops.lighter(ImageChops.lighter(r, g), bl).point(lambda v: 255 if v > th else 0)
base = Image.blend(a, Image.new('RGB', a.size, (128, 128, 128)), 0.6)
red = Image.new('RGB', a.size, (255, 0, 0))
base.paste(red, (0, 0), m)
base.save(out)
print(out, base.size, 'pixels over', th, ':', m.histogram()[255])
