"""Visual check of a rebuilt Figma frame against the capture of the site (Figma rebuild of 15 October 2026).

  python3 compare.py <figma.png> <reference.png> <out.png> [--crop x,y,w,h]
Writes a side-by-side board (site | Figma | difference heat map) and prints metrics:
share of pixels differing by more than a small tolerance, and the mean absolute difference.
Both images are brought to the reference size first (the Figma screenshot may be scaled).
"""
import json, sys
from PIL import Image, ImageChops, ImageDraw, ImageOps


def board(figma_png, ref_png, out_png, crop=None, tol=40):
    ref = Image.open(ref_png).convert('RGB')
    fig = Image.open(figma_png).convert('RGB')
    if crop:
        x, y, w, h = crop
        ref = ref.crop((x, y, x + w, y + h))
    if fig.size != ref.size:
        fig = fig.resize(ref.size, Image.LANCZOS)
    diff = ImageChops.difference(ref, fig).convert('L')
    px = list(diff.getdata())
    changed = sum(1 for v in px if v > tol) / len(px)
    mean = sum(px) / len(px)
    heat = ImageOps.colorize(diff.point(lambda v: min(255, v * 3)), black='#101010', white='#ff2d6f')
    W, H = ref.size
    out = Image.new('RGB', (W * 3 + 40, H + 36), (60, 60, 60))
    d = ImageDraw.Draw(out)
    for i, (im, label) in enumerate(((ref, 'site'), (fig, 'Figma'), (heat, 'différences (%.1f %% > %d)' % (changed * 100, tol)))):
        out.paste(im, (i * (W + 20), 36))
        d.text((i * (W + 20) + 6, 10), label, fill=(255, 255, 255))
    out.save(out_png)
    return {'changed': round(changed, 4), 'mean': round(mean, 2), 'size': list(ref.size)}


if __name__ == '__main__':
    crop = None
    if '--crop' in sys.argv:
        crop = [int(v) for v in sys.argv[sys.argv.index('--crop') + 1].split(',')]
    print(json.dumps(board(sys.argv[1], sys.argv[2], sys.argv[3], crop)))
