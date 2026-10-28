"""Integration pass of the 15 Oct 2026 selection: writes results.json (problems, decisions, fixes, evidence, final pass)
from the measured files of this folder. python3 -I checks/_selection-20261015/integration/bilan.py"""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
I = 'checks/_selection-20261015/integration/'
load = lambda name: json.loads((HERE / name).read_text())
before, after, scope = load('results-globe-avant.json'), load('results-globe-apres.json'), load('results-perimetre-lisibilite.json')
lists, final, journeys, sheets = load('results-listes-compte.json'), load('results-passe-finale.json'), load('results-parcours-globe.json'), load('results-fiches.json')
NINE = 'G+P+U+R+V+L+E+PM+A'
air = lambda data, view, key, part: data[view][key]['clearance'][part]
radius = lambda data, view, key: data[view][key]['geometry']['radius']

problems = [
    {'id': 1, 'source': 'explorer-arrivee-awards, problème 1', 'essais': ['globe-espace-libre', 'lisibilite-textes'], 'nature': 'conflit entre essais',
     'reproduction': {'ensembleMinimal': 'G+L, chargements directs, vrai globe',
                      '1440x900-ar-statut': {'G': air(before, '1440x900', 'G-ar', 'status'), 'G+L': air(before, '1440x900', 'G+L-ar', 'status'), 'G+E': air(before, '1440x900', 'G+E-ar', 'status')},
                      '680x560-ar-statut': {'G': air(before, '680x560', 'G-ar', 'status'), 'G+L': air(before, '680x560', 'G+L-ar', 'status')},
                      '700x500-ar-statistiques (non signalé)': {'G': air(before, '700x500', 'G-ar', 'stats'), 'G+L': air(before, '700x500', 'G+L-ar', 'stats')}},
     'correction': 'essais/globe-espace-libre/essai.css : trois bandes conditionnelles :root[data-essais~=lisibilite-textes] (bas 196 px ordinateur et tablette, 181 px paysage étroit ≥ 521 px, haut 151,9 px paysage étroit ≤ 520 px). Essai seul inchangé.',
     'apres': {'1440x900-ar': {'G': [radius(after, '1440x900', 'G-ar'), air(after, '1440x900', 'G-ar', 'status')], 'G+L': [radius(after, '1440x900', 'G+L-ar'), air(after, '1440x900', 'G+L-ar', 'status')],
                               'neuf': [radius(after, '1440x900', NINE + '-ar'), air(after, '1440x900', NINE + '-ar', 'status')]},
               '680x560-ar': {'G': [radius(after, '680x560', 'G-ar'), air(after, '680x560', 'G-ar', 'status')], 'G+L': [radius(after, '680x560', 'G+L-ar'), air(after, '680x560', 'G+L-ar', 'status')],
                              'neuf': [radius(after, '680x560', NINE + '-ar'), air(after, '680x560', NINE + '-ar', 'status')]},
               '700x500-ar': {'G': [radius(after, '700x500', 'G-ar'), air(after, '700x500', 'G-ar', 'stats')], 'G+L': [radius(after, '700x500', 'G+L-ar'), air(after, '700x500', 'G+L-ar', 'stats')],
                              'neuf': [radius(after, '700x500', NINE + '-ar'), air(after, '700x500', NINE + '-ar', 'stats')]}},
     'conclusion': 'conflit corrigé'},
    {'id': 2, 'source': 'explorer-arrivee-awards, problème 2', 'essais': ['lisibilite-textes'], 'nature': 'défaut de l’essai seul',
     'reproduction': {'1440x900': {k: before['polices'][f'1440x900-{k}']['stats'] for k in ('socle', 'L')}, '844x390': {k: before['polices'][f'844x390-{k}']['stats'] for k in ('socle', 'L')},
                      '390x844': {k: before['polices'][f'390x844-{k}']['stats'] for k in ('socle', 'L')}},
     'correction': 'essais/lisibilite-textes/essai.css : .globe-status p à 13 px seulement sous @media(max-width:700px) ; l’essai seul change sur ordinateur (ligne d’aide 13 → 14 px, valeur de la copie, conforme à sa fiche).',
     'apres': {'polices': {k: v['stats'] for k, v in after['polices'].items()},
               'perimetreExplorer': {k: {'baisses': len(v['sizeDecreases']), 'auDessusDe14': len(v['sizeAbove14']), 'couleursInattendues': len(v['unexpectedColours']), 'ligneAide': v['hint']['L']['size']}
                                     for k, v in {**scope['globe-bloque'], **scope['vrai-globe']}.items()}},
     'conclusion': 'défaut d’un essai corrigé'},
    {'id': 3, 'source': 'explorer-arrivee-awards, problème 3', 'essais': ['globe-espace-libre', 'lisibilite-textes'], 'nature': 'limite de la paire, disque au zoom minimal',
     'reproduction': {'667x375-ar-statistiques': {'G': air(before, '667x375', 'G-ar', 'stats'), 'G+L': air(before, '667x375', 'G+L-ar', 'stats')}, 'rayon': radius(before, '667x375', 'G+L-ar')},
     'apres': {'667x375-ar-statistiques': {'G': air(after, '667x375', 'G-ar', 'stats'), 'G+L': air(after, '667x375', 'G+L-ar', 'stats'), 'neuf': air(after, '667x375', NINE + '-ar', 'stats')}},
     'correction': 'Aucune possible sans toucher au moteur du globe ou au plancher de lisibilite-textes ; limite consignée dans les deux fiches.', 'conclusion': 'non corrigé'},
    {'id': 4, 'source': 'rubriques-fiches-dialogues, problème 1', 'essais': ['lisibilite-textes'], 'nature': 'effet de l’essai seul, sans défaut',
     'reproduction': {k: lists['arun'][k]['arun'] for k in ('socle', 'L', 'E', 'L+E', NINE)}, 'nomsSurDeuxLignesDansLaCopie': [n['t'] for n in lists['arun']['socle']['twoLines']],
     'correction': 'Aucune ; limite consignée dans essais/lisibilite-textes/essai.json.', 'conclusion': 'non corrigé'},
    {'id': 5, 'source': 'rubriques-fiches-dialogues, problème 2', 'essais': ['echelle-unifiee'], 'nature': 'effet de l’essai seul, non relevé par ses vérificateurs',
     'reproduction': {'360': {k: {'hauteurs': lists['alumni'][k]['heights'], 'pastilles': lists['alumni'][k]['chips'], 'rognees': lists['alumni'][k]['clipped']} for k in lists['alumni']},
                      'autresLargeurs': {k: {'hauteurs': v['heights'], 'pastilles': v['chips']} for k, v in {**lists['alumni-largeurs'], **lists['alumni-largeurs-ordinateur']}.items()}},
     'correction': 'Aucune (la seule correction sortirait la pastille de l’échelle et changerait l’essai seul) ; limite consignée dans essais/echelle-unifiee/essai.json, avec les largeurs exactes (320 à au moins 768 px).',
     'conclusion': 'non corrigé'},
    {'id': 6, 'source': 'rubriques-fiches-dialogues, problème 3', 'essais': ['visiter-contour-sombre'], 'nature': 'contraste préexistant de la copie, inchangé par les essais',
     'reproduction': {k: {'texte': v['color'], 'fond': v['bgPixel'], 'contraste': v['textContrast'], 'bordure': v['border'], 'contrasteBordure': v['borderContrast'], 'taille': v['size']} for k, v in lists['compte'].items() if v},
     'correction': 'Aucune : couleur choisie par l’utilisateur le 13 octobre, déjà signalée dans les limites de visiter-contour-sombre.', 'conclusion': 'fausse alerte'},
]

result = {
    'date': '2026-10-15', 'selection': ['globe-espace-libre', 'police-etiquettes-globe', 'une-colonne-320', 'roles-couleur', 'visiter-contour-sombre',
                                         'lisibilite-textes', 'echelle-unifiee', 'pseudo-manquant', 'awards-a-venir'],
    'lienCombinaison': 'baseline/content-preview.html?essais=globe-espace-libre,police-etiquettes-globe,une-colonne-320,roles-couleur,visiter-contour-sombre,lisibilite-textes,echelle-unifiee,pseudo-manquant,awards-a-venir#explore',
    'problemes': problems,
    'fichiersModifies': ['essais/globe-espace-libre/essai.css', 'essais/globe-espace-libre/essai.json', 'checks/globe-espace-libre/results.json',
                         'essais/lisibilite-textes/essai.css', 'essais/lisibilite-textes/essai.json', 'checks/lisibilite-textes/results.json', 'essais/echelle-unifiee/essai.json'],
    'parcoursGlobe': {k: (v['geometry']['radius'] if isinstance(v, dict) and 'geometry' in v else v) for k, v in journeys['1440x900'].items() if k != 'medaillon'} | {'medaillon': [journeys['1440x900']['medaillon']['dockedRadius'], journeys['1440x900']['medaillon']['offsetFromMedallion']]},
    'passeFinale': {
        'explorer1440': {'rayon': final['explorer']['explorer-1440x900-clair']['geometry']['radius'], 'air': final['explorer']['explorer-1440x900-clair']['clearance'], 'etiquettes': final['explorer']['explorer-1440x900-clair']['fonts']['marker']},
        'explorer390': {'rayon': final['explorer']['explorer-390x844-sombre']['geometry']['radius'], 'air': final['explorer']['explorer-390x844-sombre']['clearance']},
        'projets320ar': {k: final['rubriques']['projets-320x640-ar'][k] for k in ('columns', 'brokenNames', 'brokenTitles', 'clippedChips')},
        'profils1440': {k: final['rubriques']['profils-1440'][k] for k in ('pendingVisible', 'realLogins')},
        'commentaires': {k: [v['submit']['bg'], v['submitContrast'], v['emoji']['font']] for k, v in final['rubriques'].items() if k.startswith('commentaires')},
        'filtre': {k: [v['apply']['bg'], v['apply']['contrast'], v['apply']['font'], v['dialog']['radius']] for k, v in final['rubriques'].items() if k.startswith('filtre')},
        'arrivee': {k: {'visiter': v['guest']['rect'][2:], 'seConnecter': v['login']['rect'][2:], 'contrastes': v['guestContrast'], 'focus': [(f['id'], f['visible']) for f in v['focus']]} for k, v in final['arrivee'].items()},
        'awards': {k: [v['note']['text'], v['note']['font'], v['belowFadeEnd'], v['aboveDock']] for k, v in final['awards'].items()},
        'erreurs': sorted({e for part in final.values() for v in part.values() for e in (v.get('common', {}).get('errors', []) if isinstance(v, dict) else [])}),
        'debordement': any(v.get('common', {}).get('overflow') for part in final.values() for v in part.values() if isinstance(v, dict)),
        'planches': [I + 'planches/' + n for n in ('f1-explorer-neuf.png', 'f2-projets-commentaires-neuf.png', 'f3-filtre-neuf.png', 'f4-arrivee-sombre-neuf.png', 'f5-awards-neuf.png')]},
    'fiches': sheets['passed'],
}
(HERE / 'results.json').write_text(json.dumps(result, ensure_ascii=False, indent=1) + '\n')
print(json.dumps({'erreurs': result['passeFinale']['erreurs'], 'debordement': result['passeFinale']['debordement'], 'fiches': result['fiches'],
                  'parcours': result['parcoursGlobe']}, ensure_ascii=False))
