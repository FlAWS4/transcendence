"""Planches de captures réduites (PIL) pour la zone « arrivée » — 15 octobre 2026.
Lit uniquement les captures de ce dossier ; écrit planche-d1.png, planche-d4.png, planche-d5.png.
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


def crop(path, box, scale):
    im = Image.open(path).convert('RGB').crop(box); return im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)


# D1 : souris 1280, fenêtre / juste après Annuler / ≈10 s après Annuler ; toucher 390 juste après Annuler.
res = json.loads((D / 'd1-souris-modificateurs/resultats.json').read_text())
rows = []
for s in ['145', '144']:
    a = res['states'][s]['a-annuler-souris-ecartee']; ch = a['changesAfterClose']
    seq = ' → '.join([a['afterCancel']['label']] + [c['lang'] for c in ch]) if ch else a['afterCancel']['label'] + ' (inchangé)'
    box = (340, 290, 940, 700)
    rows.append([tag(crop(D / ('d1-souris-modificateurs/%s-a-1-fenetre.png' % s), box, .55), '%s souris : fenêtre ouverte' % s),
                 tag(crop(D / ('d1-souris-modificateurs/%s-a-2-apres-annuler.png' % s), box, .55), '%s juste après Annuler (focus %s)' % (s, a['afterCancel']['active'])),
                 tag(crop(D / ('d1-souris-modificateurs/%s-a-3-fin-observation.png' % s), box, .55), '%s +%d ms : %s' % (s, a['observedAfterCloseMs'], seq))])
grid(rows).save(D / 'planche-d1.png')

# D4 : écran d'erreur, 145 panneau ouvert en anglais sombre (390) contre 144 (390), puis 1280 clair.
mob = [tag(crop(D / 'd4-ecran-erreur/145-390-panneau-anglais-sombre.png', (0, 0, 390, 844), .62), '145 390 sombre : compte, EN'),
       tag(crop(D / 'd4-ecran-erreur/145-390-sombre-erreur-anglais.png', (0, 0, 390, 844), .62), '145 après Échap'),
       tag(crop(D / 'd4-ecran-erreur/144-390-sombre-erreur.png', (0, 0, 390, 844), .62), '144 390 sombre : sans compte')]
desk = [tag(crop(D / 'd4-ecran-erreur/145-1280-panneau-anglais-sombre.png', (0, 0, 1280, 900), .3), '145 1280 : panneau, EN sombre'),
        tag(crop(D / 'd4-ecran-erreur/145-1280-clair-erreur.png', (0, 0, 1280, 900), .3), '145 1280 clair : compte visible'),
        tag(crop(D / 'd4-ecran-erreur/144-1280-clair-erreur.png', (0, 0, 1280, 900), .3), '144 1280 clair : sans compte')]
grid([mob, desk]).save(D / 'planche-d4.png')

# D5 : welcome-panels (boutons) à t0, t+9,6 s, après passage en anglais puis en arabe ; page entière à t+9,6 s.
p = D / 'd5-ancien-accueil-panneaux'
clips = [tag(Image.open(p / n).convert('RGB'), t) for n, t in [('panneaux-t0.png', 'welcome-panels t0'), ('panneaux-t9_6.png', 'welcome-panels +9,6 s'),
                                                               ('panneaux-langue-en.png', 'langue de la page : EN'), ('panneaux-langue-ar.png', 'langue de la page : AR')] if (p / n).exists()]
full = [tag(crop(p / 'panneaux-plein-t9_6.png', (0, 0, 1280, 900), .4), 'welcome-panels.html +9,6 s (1280×900)')] if (p / 'panneaux-plein-t9_6.png').exists() else []
grid([[full[0]]] + [[c] for c in clips] if full else [[c] for c in clips]).save(D / 'planche-d5.png')
print('ok')

# Planche unique et courte : D1 (après Annuler puis fin d'observation, 145 et 144), D4 (390 sombre, panneau
# anglais 145 contre 144), D5 (welcome-panels à t0 et +9,6 s).
d1 = Image.open(D / 'planche-d1.png').convert('RGB')
d1 = d1.crop((338, 0, d1.width, d1.height))  # sans la colonne « fenêtre ouverte »
d4 = grid([[mob[0], mob[2]]])
d5 = grid([[c] for c in clips[:2]])
scale = lambda im, f: im.resize((int(im.width * f), int(im.height * f)), Image.LANCZOS)
top = grid([[d1]]); bottom = grid([[scale(d4, .8), scale(d5, .9)]])
grid([[tag(top, 'D1 — souris 1280 : juste après Annuler / ≈10 s plus tard (haut 145, bas 144)', (210, 230, 255))],
      [tag(bottom, 'D4 — écran d’erreur 390 sombre, panneau en anglais (145) / sans compte (144)   ·   D5 — welcome-panels t0 et +9,6 s', (210, 230, 255))]]).save(D / 'planche-arrivee.png')
print('ok planche-arrivee')
