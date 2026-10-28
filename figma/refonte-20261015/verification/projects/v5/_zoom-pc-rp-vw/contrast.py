"""Contrast-stretched « site | Figma » crops (v5 helper): python3 contrast.py <section> <frame idx> x y w h zoom gain out [--dy N]"""
import sys, subprocess, pathlib
from PIL import Image, ImageOps
args = sys.argv[1:]
dy = []
if '--dy' in args:
    i = args.index('--dy'); dy = ['--dy', args[i + 1]]; del args[i:i + 2]
sid, fi, x, y, w, h, z, gain, out = args
tmp = pathlib.Path(out).with_suffix('.raw.png')
subprocess.run(['python3', str(pathlib.Path(__file__).with_name('zoom5.py')), sid, fi, x, y, w, h, z, str(tmp)] + dy, check=True, capture_output=True)
im = Image.open(tmp).convert('RGB')
g = float(gain)
# stretch around the mean of the image
import statistics
px = list(im.getdata())
m = [statistics.mean(p[c] for p in px[::97]) for c in range(3)]
lut = []
for c in range(3):
    lut += [max(0, min(255, int(round(m[c] + (v - m[c]) * g)))) for v in range(256)]
im.point(lut).save(out)
tmp.unlink()
print(out)
