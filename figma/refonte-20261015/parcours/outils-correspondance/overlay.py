"""Dessine les zones retrouvées sur les captures de référence du site (contrôle visuel du calcul des coordonnées).

python3 -I overlay.py [state--fmt ...]  -> ../verif/<state>--<fmt>.png
"""
import sys, json, pathlib, collections
from PIL import Image, ImageDraw

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import plib

OUT = pathlib.Path(__file__).resolve().parent.parent
D = json.loads((OUT / 'parcours-correspondance.json').read_text())
V = OUT / 'verif'
V.mkdir(exist_ok=True)

zones = collections.defaultdict(list)   # (state, fmt) -> [(box, label, colour)]


def add(fr, h, label, col):
    if fr and h:
        zones[(fr['state'], fr['fmt'] if 'fmt' in fr else None)].append((h, label, col))


for l in D['links']:
    fr = l.get('fromFrame')
    if fr and l.get('hotspot'):
        zones[(fr['state'], l['fmt'])].append((l['hotspot'], ('G ' if l['from'].startswith('g-') else '') + l['via'][:28], 'red' if not l['from'].startswith('g-') else 'blue'))
    for a in l.get('altHotspots', []):
        zones[(fr['state'], l['fmt'])].append((a['hotspot'], 'alt ' + (a['label'] or '')[:20], 'orange'))
for l in D['implicitLinks']['tabs']:
    fr = l.get('fromFrame')
    if fr and l.get('hotspot'):
        zones[(fr['state'], l['fmt'])].append((l['hotspot'], l['via'][:28], 'green'))
for nid, s in D['screens'].items():
    for fmt in ('desktop', 'mobile'):
        for c in (s.get('close') or {}).get(fmt, []):
            if c.get('close'):
                zones[(c['frame']['state'], fmt)].append((c['close']['hotspot'], 'Fermer', 'magenta'))

want = set(sys.argv[1:])
for (state, fmt), zs in sorted(zones.items()):
    if want and f'{state}--{fmt}' not in want:
        continue
    f = next(x for x in plib.frames() if x['state'] == state and x['fmt'] == fmt)
    full = f['h'] > (844 if fmt == 'mobile' else 960) + 4
    ref = plib.REF / 'reference' / f['area'] / f'{state}--{fmt}--fr-light{"--full" if full else ""}.png'
    if not ref.exists():
        print('no reference', ref)
        continue
    im = Image.open(ref).convert('RGB')
    k = im.size[0] / f['w']
    dr = ImageDraw.Draw(im)
    for h, lab, col in zs:
        x0, y0, x1, y1 = h['x'] * k, h['y'] * k, (h['x'] + h['w']) * k, (h['y'] + h['h']) * k
        dr.rectangle([x0, y0, x1, y1], outline=col, width=max(2, int(k * 2)))
        dr.text((x0 + 3, y0 + 2), lab, fill=col)
    if im.size[1] > 3000:
        im = im.resize((int(im.size[0] * 3000 / im.size[1]), 3000))
    im.save(V / f'{state}--{fmt}.png')
    print('wrote', V / f'{state}--{fmt}.png', len(zs), 'zones', ref.name)
