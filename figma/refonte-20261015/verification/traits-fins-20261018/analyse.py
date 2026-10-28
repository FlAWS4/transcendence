"""Ink of each element row: Figma's export against Inkscape renders of the same SVG with stroke widths w + g."""
import json, re, subprocess, numpy as np
from PIL import Image
L = json.load(open('layout.json'))
land = np.array([int(L['land'][i:i + 2], 16) for i in (1, 3, 5)]) / 255
water = np.array([int(L['water'][i:i + 2], 16) for i in (1, 3, 5)]) / 255
d = land - water
def tmap(img):
    a = np.asarray(img.convert('RGB')).astype(float) / 255
    return ((a - water) @ d) / (d @ d)
def inks(t):
    out = []
    for r in L['rows']:
        y0 = r['y0']
        row = {'w': r['w']}
        for k, (x0, x1) in zip(('line5', 'line25'), r['line']):
            row[k] = t[int(y0) - 3:int(y0) + 4, x0 - 2:x1 + 2].sum() / (x1 - x0)
        for k in ('dots', 'tiny', 'fill'):
            x0, x1 = r[k]
            row[k] = t[int(y0) - 3:int(y0) + 5, x0 - 3:x1 + 4].sum() / 10
        out.append(row)
    return out
svg = open('traits.svg').read()
def render(g, mode='add'):
    s = re.sub(r'stroke-width="([\d.]+)"', lambda m: 'stroke-width="%g"' % (float(m.group(1)) + g if mode == 'add' else float(m.group(1)) * g), svg)
    open('tmp.svg', 'w').write(s)
    subprocess.run(['inkscape', 'tmp.svg', '--export-type=png', '--export-filename=tmp.png', '--export-area-page', '--export-width=600', '--export-height=440'],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return inks(tmap(Image.open('tmp.png')))
fig = inks(tmap(Image.open('figma.png')))
gains = [0, .05, .1, .15, .2, .25, .3, .4]
ink = {g: render(g) for g in gains}
print('w     | Figma: trait(par px) points  petits  remplis | Inkscape sans gain: trait points petits remplis | gain équivalent (trait / points / petits)')
for i, r in enumerate(fig):
    w = r['w']
    base = ink[0][i]
    def equiv(key):
        xs = [ink[g][i][key] for g in gains]
        v = r[key]
        for a, b, ga, gb in zip(xs, xs[1:], gains, gains[1:]):
            if (a - v) * (b - v) <= 0 and b != a:
                return ga + (v - a) / (b - a) * (gb - ga)
        return float('nan') if v < xs[0] else float('inf')
    lf = (r['line5'] + r['line25']) / 2; lb = (base['line5'] + base['line25']) / 2
    print('%-5g | %6.3f %8.3f %7.3f %7.3f | %6.3f %8.3f %7.3f %7.3f | %5.3f / %5.3f / %5.3f' % (
        w, lf, r['dots'], r['tiny'], r['fill'], lb, base['dots'], base['tiny'], base['fill'],
        equiv('line5') / 2 + equiv('line25') / 2, equiv('dots'), equiv('tiny')))
json.dump({'figma': fig, 'inkscape': {str(g): v for g, v in ink.items()}}, open('resultats.json', 'w'), indent=1)
