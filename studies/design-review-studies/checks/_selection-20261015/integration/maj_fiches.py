"""Integration pass: records the fixes and new limits in the trial sheets (essai.json) and results.json of the trials
concerned. Idempotent (each addition is skipped when already present); keeps each file's JSON layout.
python3 -I checks/_selection-20261015/integration/maj_fiches.py"""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
STUDY = HERE.parents[2]
I = 'checks/_selection-20261015/integration/'
MARK = 'intégration de la sélection du 15 octobre'


def edit(trial_id, indent, change):
    path = STUDY / 'essais' / trial_id / 'essai.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    change(data)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=indent) + '\n', encoding='utf-8')


def add(items, text):
    if text not in items: items.append(text)


def extend(items, start, suffix):
    """Append a suffix to the first item starting with 'start' (once)."""
    for i, item in enumerate(items):
        if item.startswith(start):
            if suffix not in item: items[i] = item + suffix
            return
    raise KeyError(start)


def globe(d):
    tail = (' Avec l’essai lisibilite-textes, dont les planchers de 13 px agrandissent « Exploration · 42 Horizon » et, sous 701 px, '
            'la ligne de statistiques, trois bandes conditionnelles (:root[data-essais~=lisibilite-textes]) reprennent le pire cas arabe '
            'mesuré avec les deux essais : bas à 196 px sur ordinateur et tablette (193 px sinon), 181 px en paysage étroit d’au moins 521 px '
            'de haut (174 px), haut à 151,9 px en paysage étroit bas (150,4 px). Sans lisibilite-textes, rien ne change.')
    if tail not in d['changement']: d['changement'] += tail
    add(d['verifications'], 'Intégration de la sélection du 15 octobre (vrai globe, chargements directs ; ' + I + ') : avec lisibilite-textes, '
        'avant correction, l’air entre le disque et « Exploration · 42 Horizon » tombait en arabe de 17,0 à 14,0 px sur ordinateur (1440 × 900) '
        'et de 17,0 à 10,0 px à 680 × 560, et l’air sous la ligne de statistiques de 17,0 à 15,6 px à 700 × 500. Après correction, avec '
        'lisibilite-textes comme avec les neuf essais de la sélection : rayon 237,0 / 171,0 / 147,0 / 327,0 / 299,0 px à 1440 × 900, 1366 × 768, '
        '1280 × 720, 1920 × 1080 et 768 × 1024 (essai seul : 240,0 / 174,0 / 150,0 / 330,0 / 302,0 px), 82,0 px à 680 × 560 (89,0) et 81,1 px '
        'à 700 × 500 (82,6) ; air d’au moins 17,0 px en arabe et de 26,0 px sous le disque en français et en anglais, centre à 0 px, sans erreur '
        'ni débordement. L’essai seul garde ses rayons, bandes et marges ; à 844 × 390 et 1280 × 500, mêmes valeurs avec ou sans lisibilite-textes.')
    extend(d['limites'], 'Téléphone en paysage :', ' En arabe, l’air au-dessus de la bille n’est que de 15,0 px à 844 × 390, essai seul ; avec '
           'lisibilite-textes, il descend aussi de 16,5 à 15,0 px à 667 × 375, la ligne de statistiques passant de 12 à 13 px : le disque étant '
           'déjà au zoom minimal, aucune bande ne peut le réduire.')
    extend(d['limites'], 'En FR et EN, l’air sous le disque', ' Avec lisibilite-textes, 26 px.')
    extend(d['limites'], 'Les bandes sont des valeurs fixes', ' Seul lisibilite-textes est pris en compte, par des bandes conditionnelles '
           'ajoutées à l’intégration de la sélection du 15 octobre : avec lui, le disque perd 3 px de rayon sur ordinateur et tablette, 7 px à '
           '680 × 560 et 1,5 px à 700 × 500, dans toutes les langues.')
    for f in ('globe_bandes.py', 'results-globe-avant.json', 'results-globe-apres.json'): add(d['fichiers'], I + f)


def lisibilite(d):
    old = 'compteur du globe et note « Exploration · 42 Horizon »'
    new = 'compteur du globe sous 701 px de large (12 px dans la copie ; au-dessus, il garde ses 14 px) et note « Exploration · 42 Horizon »'
    if old in d['changement']: d['changement'] = d['changement'].replace(old, new)
    assert new in d['changement']
    add(d['verifications'], 'Explorer, à l’' + MARK + ' : la règle commune ramenait aussi sur ordinateur la ligne d’aide du globe '
        '(« 58 campus · 30 pays », « Choisis un campus pour t’en approcher. », « Explore les alentours du campus. ») de 14 à 13 px, contrairement '
        'à cette fiche ; corrigé, elle n’est relevée (12 → 13 px) que jusqu’à 700 px de large. Même DOM, feuille coupée puis rétablie : à 1440 × 900 '
        '(FR clair, AR sombre), 390 × 844, 667 × 375 et 844 × 390 globe bloqué, puis aux niveaux Monde, Pays (France) et Campus (42 Paris) avec le '
        'vrai globe, seules des tailles augmentent (portée et état de la recherche 12 et 11 → 13 px, « Exploration · 42 Horizon » 12 ou 10 → 13 px, '
        'ligne d’aide 12 → 13 px sous 701 px), aucune ne baisse ni ne dépasse 14 px, aucune couleur ne change ; ligne d’aide à 14 px sur ordinateur '
        'aux trois niveaux.')
    extend(d['limites'], 'Les étiquettes de campus sur le globe', ' À l’' + MARK + ', Explorer est aussi mesuré avec le vrai globe '
           '(niveaux Monde, Pays et Campus).')
    add(d['limites'], 'Avec globe-espace-libre, « Exploration · 42 Horizon » agrandi (et la ligne de statistiques sous 701 px) demande au globe '
        'réduit des bandes un peu plus larges, prévues dans cet essai-là : rayon −3 px sur ordinateur et tablette, −7 px à 680 × 560. En paysage '
        'bas (667 × 375), où le disque est déjà au zoom minimal, l’air au-dessus de la bille passe en arabe de 16,5 à 15,0 px.')
    add(d['limites'], 'Dans la grille Projets à 390 px (deux colonnes), un nom d’auteur de plus passe sur deux lignes, à l’espace (« Arun Suri », '
        '12,2 → 13 px) ; la copie en replie déjà quatre à cette largeur (Luiza Costa, Leïla Mansour, Caio Mendes, Tomás Vieira). Aucun mot coupé '
        'ni chevauchement ; même rendu avec les neuf essais de la sélection.')
    add(d['limites'], 'Explorer en portrait (globe-espace-libre inactif) : à 320 × 640, le disque de la copie recouvre déjà le bas de '
        '« Exploration · 42 Horizon » (9 px en arabe, 3 px en français) ; à 13 px, le texte plus haut l’est de 16 et 7 px. Il reste lisible sur '
        'le bord pâle de l’océan ; même rendu avec les neuf essais de la sélection.')
    for f in ('perimetre_lisibilite.py', 'results-perimetre-lisibilite.json', 'globe_bandes.py', 'results-globe-apres.json', 'listes_compte.py', 'results-listes-compte.json'):
        add(d['fichiers'], I + f)


def echelle(d):
    add(d['limites'], 'Vue Liste des Profils en arabe, de 320 à au moins 768 px de large : la pastille « خريج / خريجة » (Alumni), passée de 11 à '
        '12 px, se replie sur deux lignes dans sa vignette, qui s’allonge ; les rangées Alumni mesurent alors 18 px de plus que les autres '
        '(132 contre 114 px de 320 à 390 px, 139 contre 121 px à 768 px ; 112,5 et 120 px pour toutes dans la copie). Pastille entière, sans '
        'rognure ni chevauchement ; sur une ligne à 1024 et 1199 px. Même résultat avec les neuf essais de la sélection (' + MARK + '). '
        'La garder à 11 px dans ce cas la sortirait de l’échelle : non fait, faute de décision.')
    for f in ('listes_compte.py', 'results-listes-compte.json'): add(d['fichiers'], I + f)


def results(trial_id, key, value, check, ok):
    path = STUDY / 'checks' / trial_id / 'results.json'
    raw = path.read_text(encoding='utf-8'); data = json.loads(raw)
    indent = 2 if raw.startswith('{\n  "') else 1
    data[key] = value; data.setdefault('checks', {})[check] = ok
    path.write_text(json.dumps(data, ensure_ascii=False, indent=indent) + '\n', encoding='utf-8')


if __name__ == '__main__':
    edit('globe-espace-libre', 2, globe)
    edit('lisibilite-textes', 2, lisibilite)
    edit('echelle-unifiee', 1, echelle)
    after = json.loads((HERE / 'results-globe-apres.json').read_text())
    scope = json.loads((HERE / 'results-perimetre-lisibilite.json').read_text())
    pick = lambda view, key: {k: after[view][key][k] for k in ('geometry', 'clearance', 'bandTop', 'bandBottom')}
    results('globe-espace-libre', 'integration20261015', {
        'cause': 'lisibilite-textes agrandit « Exploration · 42 Horizon » (et la ligne de statistiques sous 701 px) : les bandes fixes ne suivaient pas.',
        'correction': 'essai.css : bandes conditionnelles :root[data-essais~=lisibilite-textes] (bas 196 px ordinateur/tablette, 181 px paysage étroit ≥ 521 px, haut 151,9 px paysage étroit bas).',
        'seul1440ar': pick('1440x900', 'G-ar'), 'avecLisibilite1440ar': pick('1440x900', 'G+L-ar'), 'neuf1440ar': pick('1440x900', 'G+P+U+R+V+L+E+PM+A-ar'),
        'avecLisibilite680x560ar': pick('680x560', 'G+L-ar'), 'avecLisibilite700x500ar': pick('700x500', 'G+L-ar'),
        'limite': '667 × 375 en arabe : 15,0 px au-dessus de la bille avec lisibilite-textes (16,5 px seul), disque au zoom minimal.',
        'source': I + 'results-globe-apres.json'}, 'bandsFollowLisibiliteTextes', True)
    results('lisibilite-textes', 'integration20261015', {
        'cause': 'La règle « Explorer and dock search » ramenait la ligne d’aide du globe de 14 à 13 px au-dessus de 700 px.',
        'correction': 'essai.css : .globe-status p à 13 px seulement sous @media(max-width:700px).',
        'explorer': {k: {x: v[x] for x in ('sameDom', 'sizeDecreases', 'sizeAbove14', 'unexpectedColours', 'hint')} for k, v in {**scope['globe-bloque'], **scope['vrai-globe']}.items()},
        'source': I + 'results-perimetre-lisibilite.json'}, 'scopeExplorer',
        all(not v['sizeDecreases'] and not v['sizeAbove14'] and not v['unexpectedColours'] and v['sameDom'] for v in {**scope['globe-bloque'], **scope['vrai-globe']}.values()))
    print('ok')
