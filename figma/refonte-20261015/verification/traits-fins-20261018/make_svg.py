"""Thin-stroke test for the globe components (18 Oct. 2026): which ink does Figma give to the 0.1-0.75 px land outline,
to zero-area rings drawn only by their stroke, and to tiny filled rings, against Inkscape? Same colours as the light globe."""
import json
LAND, WATER = '#19B8B5', '#D9EEEE'
WIDTHS = [0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.75]
W, H = 600, 40 + 50 * len(WIDTHS)
rows, layout = [], []
for i, w in enumerate(WIDTHS):
    y0 = 30 + 50 * i
    d_line = 'M20 %.2fh60M100 %.2fh60' % (y0 + 0.5, y0 + 0.25)          # two sub-pixel phases
    d_dots = ''.join('M%.2f %.2fl.5 0z' % (200 + 9 * k + (k % 4) * 0.25, y0 + 0.5 + (k % 3) * 0.25) for k in range(10))   # zero-area rings
    d_tiny = ''.join('M%.2f %.2fl.8 0l-.4 .7z' % (320 + 9 * k + (k % 4) * 0.25, y0 + (k % 3) * 0.25) for k in range(10))  # 0.28 px² triangles
    d_fill = ''.join('M%.2f %.2fl.8 0l-.4 .7z' % (440 + 9 * k + (k % 4) * 0.25, y0 + (k % 3) * 0.25) for k in range(10))  # same, fill only
    rows.append(f'<path d="{d_line}" stroke="{LAND}" stroke-width="{w}" stroke-linejoin="round" fill="none"/>')
    rows.append(f'<path d="{d_dots}{d_tiny}" fill="{LAND}" stroke="{LAND}" stroke-width="{w}" stroke-linejoin="round"/>')
    rows.append(f'<path d="{d_fill}" fill="{LAND}"/>')
    layout.append({'w': w, 'y0': y0, 'line': [[20, 80], [100, 160]], 'dots': [200, 290], 'tiny': [320, 410], 'fill': [440, 530]})
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
       f'<rect width="{W}" height="{H}" fill="{WATER}"/>' + ''.join(rows) + '</svg>')
open('traits.svg', 'w').write(svg)
json.dump({'W': W, 'H': H, 'rows': layout, 'land': LAND, 'water': WATER}, open('layout.json', 'w'))
print(len(svg), W, H)
