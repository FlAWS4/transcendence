"""Differences that are not edges, on the boards of section_frames.py (Figma rebuild, 18 October 2026, full pass).

  python3 diff_blocks.py <dir with index.json> [more dirs…]
Text and shape edges differ between Chrome and Figma in a band of one or two pixels (font smoothing, anti-aliasing, and a
mobile capture taken at DPR 2 then reduced). A wrong colour, a missing or moved element or a different blur differs over a
surface instead. For each board: the mask of pixels with a channel off by more than 12 levels, eroded twice by a 3 × 3
minimum (a band up to four pixels wide disappears), then the remaining pixels, their share of the frame, and the boxes of
the larger groups (in frame pixels). Prints the frames sorted by remaining share; writes blocks.json beside index.json.
"""
import json, pathlib, sys
from PIL import Image, ImageChops, ImageFilter


def blocks(board):
    b = Image.open(board).convert('RGB')
    W, H = b.size
    w = (W - 20) // 2
    site, fig = b.crop((0, 30, w, H)), b.crop((W - w, 30, W, H))
    d = ImageChops.difference(site, fig)
    r, g, bl = d.split()
    m = ImageChops.lighter(ImageChops.lighter(r, g), bl).point(lambda v: 255 if v > 12 else 0)
    er = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MinFilter(3))
    # leave out the frame border (the export mixes the frame edge with the section around it)
    er = er.crop((3, 3, er.width - 3, er.height - 3))
    hist = er.histogram()
    n = hist[255]
    boxes = []
    if n:
        # coarse groups: 16 px cells holding remaining pixels, merged row by row into boxes
        cell = 16
        px = er.load()
        cells = set()
        for y in range(0, er.height, 2):
            for x in range(0, er.width, 2):
                if px[x, y]:
                    cells.add((x // cell, y // cell))
        seen = set()
        for c in sorted(cells):
            if c in seen:
                continue
            stack, grp = [c], []
            seen.add(c)
            while stack:
                cx, cy = stack.pop()
                grp.append((cx, cy))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nb = (cx + dx, cy + dy)
                        if nb in cells and nb not in seen:
                            seen.add(nb)
                            stack.append(nb)
            xs, ys = [g[0] for g in grp], [g[1] for g in grp]
            boxes.append((len(grp), [min(xs) * cell + 3, min(ys) * cell + 3, (max(xs) + 1) * cell + 3, (max(ys) + 1) * cell + 3]))
        boxes.sort(reverse=True)
    return n, n / (er.width * er.height), [b for _, b in boxes[:6]]


def main(dirs):
    out = []
    for d in dirs:
        d = pathlib.Path(d)
        rows = json.loads((d / 'index.json').read_text())
        res = []
        for r in rows:
            if not r.get('board'):
                continue
            n, share, boxes = blocks(r['board'])
            res.append({'frame': r['frame'], 'section': r.get('section', d.name), 'remaining': n, 'share': round(share, 5), 'boxes': boxes,
                        'board': r['board'], 'tenu': r.get('tenu', False)})
        (d / 'blocks.json').write_text(json.dumps(res, ensure_ascii=False, indent=1))
        out += res
    for r in sorted(out, key=lambda r: -r['share']):
        print('%-8s %-5s %6d px  %.4f %%  %s  %s' % (r['section'][:8], 'tenu' if r['tenu'] else '', r['remaining'], r['share'] * 100, r['frame'], r['boxes'][:3]))


if __name__ == '__main__':
    main(sys.argv[1:])
