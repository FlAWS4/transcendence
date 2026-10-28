"""Planche réduite (PIL) des compléments de la reprise du 15 octobre 2026 — zone « arrivée ».
Lit uniquement les captures de complement-d1/ et complement-d4/ ; écrit planche-complements.png.
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
D = Path('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee')
try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except Exception: FONT = ImageFont.load_default()
GREY = (120, 120, 120)


def tag(im, text, colour=(255, 230, 0)):
    out = Image.new('RGB', (im.width, im.height + 22), colour); out.paste(im, (0, 22))
    ImageDraw.Draw(out).text((4, 3), text, fill=(0, 0, 0), font=FONT); return out


def grid(rows, gap=8, bg=GREY):
    w = max(sum(i.width for i in r) + gap * (len(r) - 1) for r in rows); hh = sum(max(i.height for i in r) for r in rows) + gap * (len(rows) - 1)
    out = Image.new('RGB', (w, hh), bg); y = 0
    for r in rows:
        x = 0
        for i in r: out.paste(i, (x, y)); x += i.width + gap
        y += max(i.height for i in r) + gap
    return out


def shrink(path, scale, box=None):
    im = Image.open(path).convert('RGB')
    if box: im = im.crop(box)
    return im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)


d1 = json.loads((D / 'complement-d1/resultats.json').read_text())['sansBouger']['320x640']
d4 = json.loads((D / 'complement-d4/resultats.json').read_text())['retour']
first = []
p = D / 'complement-d1/145-sans-bouger-320x640.png'
if p.exists():
    im = shrink(p, .9)
    x, y = d1['cancelPoint']; dr = ImageDraw.Draw(im); r = 6
    dr.ellipse((x * .9 - r, y * .9 - r, x * .9 + r, y * .9 + r), outline=(255, 0, 0), width=3)
    first.append(tag(im, '145 · 320×640', (255, 230, 0)))
row = []
for name, scale in [('1280x900-en', .34), ('1280x900-ar', .34), ('390x844-ar', .62)]:
    f = D / ('complement-d4/145-arrivee-apres-retour-' + name + '.png')
    if f.exists():
        ch = d4[name]['labelChangesAfterBack']
        seq = ' → '.join([d4[name]['expectedOrder'][0]] + [c['lang'] for c in ch[:2]])
        row.append(tag(shrink(f, scale), name + ' : ' + seq))
bottom = grid([row])
top = None
if first:
    # Pad the single D1 capture to the D4 row width so that its caption is not cut.
    top = Image.new('RGB', (bottom.width, first[0].height), GREY); top.paste(first[0], (0, 0))
    note = ('Pointeur resté en (%.0f, %.0f) sur Se connecter après Annuler : survol, aucun changement pendant %d ms ;'
            % (d1['cancelPoint'][0], d1['cancelPoint'][1], d1['stillMs']))
    note2 = 'après sortie du pointeur, changement à +%d ms (pause de survol voulue).' % d1['changesAfterLeave'][0]['dtMs']
    dr = ImageDraw.Draw(top); dr.text((first[0].width + 16, 40), note, fill=(255, 255, 255), font=FONT); dr.text((first[0].width + 16, 62), note2, fill=(255, 255, 255), font=FONT)
rows = []
if top: rows.append([tag(top, 'D1 — Annuler sans bouger (survol : pause voulue)', (210, 230, 255))])
rows.append([tag(bottom, 'D4 — retour à l’arrivée après thème sombre + langue changés sur l’écran d’erreur (145)', (210, 230, 255))])
grid(rows).save(D / 'planche-complements.png')
print('ok', Image.open(D / 'planche-complements.png').size)
