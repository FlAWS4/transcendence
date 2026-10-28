"""Amplified difference map of a board (media / authors / comments check, 17 Oct. 2026): site in grey, differences
above the anti-aliasing level in red (Figma darker) or cyan (Figma lighter).
  python3 diffmap_mac.py <board png> <out png> [threshold]
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
b, out = sys.argv[1], sys.argv[2]; th = float(sys.argv[3]) if len(sys.argv) > 3 else 28
im = Image.open(b).convert('RGB')
W = (im.width - 20) // 2; H = im.height - 30
s = im.crop((0, 30, W, 30 + H)); f = im.crop((W + 20, 30, 2 * W + 20, 30 + H))
# compare after a slight blur of the site (the Figma export is 0.7x, hence softer)
sb = np.asarray(s.filter(ImageFilter.GaussianBlur(0.8)), dtype=float); fb = np.asarray(f, dtype=float)
d = fb.mean(axis=2) - sb.mean(axis=2)
grey = np.asarray(s.convert('L'), dtype=float) * 0.35 + 150
o = np.stack([grey, grey, grey], axis=2)
o[d < -th] = [220, 30, 30]
o[d > th] = [0, 170, 200]
Image.fromarray(o.clip(0, 255).astype('uint8')).save(out); print(out, (W, H))
