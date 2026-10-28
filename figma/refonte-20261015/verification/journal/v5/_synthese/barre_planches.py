"""Synthèse v5 des Chroniques (18 octobre 2026) : zone de la barre de périmètre, site | Figma, découpée dans les
planches v5 de toutes les sections (32 cadres). Écrit barre_<section>.png à côté de ce script."""
import json, pathlib, re
from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parent
V5 = HERE.parent
BASE = V5.parents[2]
lay = json.loads((BASE / 'layouts/journal.json').read_text())
for sec in lay['sections']:
    tiles = []
    for row in sec['rows']:
        for f in row:
            fn = V5 / sec['id'] / (re.sub(r'[^\w.-]+', '_', f['name'])[:120] + '.png')
            if not fn.exists():
                continue
            board = Image.open(fn).convert('RGB')
            W = (board.width - 20) // 2
            box = (60, 50, 330, 150) if f['fmt'] == 'mobile' else (540, 15, 900, 115)
            site = board.crop((box[0], 30 + box[1], box[2], 30 + box[3]))
            fig = board.crop((W + 20 + box[0], 30 + box[1], W + 20 + box[2], 30 + box[3]))
            k = 2
            t = Image.new('RGB', ((site.width * 2 + 10) * k, site.height * k + 22), (50, 50, 50))
            t.paste(site.resize((site.width * k, site.height * k), Image.LANCZOS), (0, 22))
            t.paste(fig.resize((fig.width * k, fig.height * k), Image.LANCZOS), ((site.width + 10) * k, 22))
            ImageDraw.Draw(t).text((6, 5), f['name'] + '   (site | Figma)', fill=(255, 225, 130))
            tiles.append(t)
    if not tiles:
        continue
    sheet = Image.new('RGB', (max(t.width for t in tiles), sum(t.height + 6 for t in tiles)), (30, 30, 30))
    y = 0
    for t in tiles:
        sheet.paste(t, (0, y)); y += t.height + 6
    sheet.save(HERE / ('barre_%s.png' % sec['id']))
    print(sec['id'], len(tiles), sheet.size)
