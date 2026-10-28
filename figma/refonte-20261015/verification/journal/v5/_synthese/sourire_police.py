"""Synthèse v5 des Chroniques (18 octobre 2026) : police de « ☺ » dans Chrome.

Compare le glyphe de la capture du site (2×, bouton « ☺ Emoji » du formulaire de commentaire) avec le même caractère
rendu par FreeType en Liberation Sans et en DejaVu Sans à 28 px (14 px × 2), à la même origine (début du texte,
ligne de base de Jost). Écrit sourire_police.png et sourire_police.json à côté de ce script. Lecture seule ailleurs.
"""
import gzip, json, pathlib
from PIL import Image, ImageChops, ImageDraw, ImageFont

HERE = pathlib.Path(__file__).resolve().parent
BASE = HERE.parents[3]
J = BASE.parents[1] / 'shared/assets/jost-0.ttf'
FONTS = {'Liberation Sans': '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
         'DejaVu Sans': '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'}
out, tiles = {}, []
for state in ('article-comments--mobile--fr-light', 'article-comments--mobile--fr-dark', 'article-comments-thread--mobile--fr-light'):
    dump = json.loads(gzip.decompress((BASE / 'dom/journal' / (state + '.json.gz')).read_bytes()))
    K = int(dump.get('dpr') or 1)   # captures mobiles à 2 px par px CSS (ordinateur : 1, trop peu pour juger la forme)
    SIZE = 14 * K
    node = next(n for n in dump['nodes'] for r in (n.get('runs') or []) if '☺' in (r.get('t') or ''))
    run = next(r for r in node['runs'] if '☺' in r['t'])
    site = Image.open(BASE / 'reference/journal' / (state + '--full.png')).convert('L')
    dark = state.endswith('dark')
    x0, y0 = run['x'] * K, run['y'] * K
    # ligne de base de Jost dans la boîte de ligne « normal » (métriques de la police, comme dom2fig)
    jf = ImageFont.truetype(str(J), SIZE)
    asc, dsc = jf.getmetrics()
    base_y = y0 + (run['h'] * K - (asc + dsc)) / 2 + asc
    box = (int(x0) - 4, int(y0) - 2, int(x0) + 34, int(y0 + run['h'] * K) + 2)
    crop = site.crop(box)
    if dark:
        crop = ImageChops.invert(crop)
    row = {'site': crop}
    res = {}
    for name, path in FONTS.items():
        f = ImageFont.truetype(path, SIZE)
        img = Image.new('L', crop.size, 255)
        d = ImageDraw.Draw(img)
        d.text((x0 - box[0], base_y - box[1]), '☺', font=f, fill=0, anchor='ls')
        row[name] = img
        a = crop.point(lambda v: 255 if v < 150 else 0)
        b = img.point(lambda v: 255 if v < 150 else 0)
        inter = ImageChops.multiply(a, b).histogram()[255]
        union = ImageChops.lighter(a, b).histogram()[255]
        ink = b.getbbox()
        res[name] = {'IoU': round(inter / union, 3) if union else None,
                     'encre_px_css': [round((ink[2] - ink[0]) / K, 2), round((ink[3] - ink[1]) / K, 2)] if ink else None}
    sink = crop.point(lambda v: 255 if v < 150 else 0).getbbox()
    res['site encre_px_css'] = [round((sink[2] - sink[0]) / K, 2), round((sink[3] - sink[1]) / K, 2)] if sink else None
    res['largeur du texte relevée'] = run['w']
    out[state] = res
    tiles.append((state, row))

Z = 6
w = max(r['site'].width for _, r in tiles) * Z
sheet = Image.new('RGB', (w * 3 + 40, len(tiles) * (tiles[0][1]['site'].height * Z + 40) + 10), (60, 60, 60))
dd = ImageDraw.Draw(sheet)
y = 10
for state, row in tiles:
    for i, (name, img) in enumerate(row.items()):
        big = img.resize((img.width * Z, img.height * Z), Image.NEAREST).convert('RGB')
        sheet.paste(big, (10 + i * (w + 10), y + 24))
        label = name if name == 'site' else '%s (IoU %.2f)' % (name, out[state][name]['IoU'])
        dd.text((10 + i * (w + 10), y + 6), state.replace('article-comments--', '') + ' · ' + label, fill=(255, 230, 140))
    y += row['site'].height * Z + 40
sheet.save(HERE / 'sourire_police.png')
(HERE / 'sourire_police.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
print(json.dumps(out, ensure_ascii=False, indent=1))
