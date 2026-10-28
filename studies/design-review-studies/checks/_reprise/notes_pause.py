"""Write the paused-state NOTES.md of the design-review studies from the trial sheets."""
import json
from pathlib import Path

STUDY = Path('/home/le-rif/Bureau/Transcendence/studies/design-review-studies')
REPRISE = STUDY / 'checks' / '_reprise'
GROUPS = [
    ('Explorer et globe', ['globe-espace-libre', 'textes-sur-pastilles', 'police-etiquettes-globe', 'titre-fiche-campus']),
    ('Pile flottante, cartes et petits écrans', ['recherche-repliee', 'voile-pile-basse', 'une-colonne-320', 'deux-colonnes-allegees', 'pseudo-manquant']),
    ('Couleurs, thème sombre et illustrations', ['illustrations-sombres', 'illustrations-attenuees', 'roles-couleur', 'visiter-contour-sombre', 'illustrations-variees']),
    ('Typographie, lisibilité et pages', ['lisibilite-textes', 'titres-marque', 'titres-forts', 'echelle-unifiee', 'awards-a-venir']),
]
# State at the 14:39 pause and the earlier decision each trial revisits (short form).
STATE = {
    'globe-espace-libre': ('**Vérifié, avec réserves**', '4 et 13 oct. : rayon du globe'),
    'textes-sur-pastilles': ('**Vérifié**', '—'),
    'police-etiquettes-globe': ('**Vérifié**', '—'),
    'titre-fiche-campus': ('**Vérifié après correction**', '8 oct. : logo, sinon nom'),
    'recherche-repliee': ('Réalisé et contrôlé par son auteur ; fiche et vérification à faire', '5 oct. : capsule flottante'),
    'voile-pile-basse': ('Réalisé et contrôlé par son auteur ; fiche et vérification à faire', '—'),
    'une-colonne-320': ('Réalisé ; dernier contrôle interrompu à relancer, fiche à écrire', '6 et 8 oct. : deux colonnes à 320 px'),
    'deux-colonnes-allegees': ('Brouillon non contrôlé', '—'),
    'pseudo-manquant': ('À réaliser', '—'),
    'illustrations-sombres': ('**Vérifié**', '—'),
    'illustrations-attenuees': ('**Vérifié**', '—'),
    'roles-couleur': ('**Vérifié, fiche corrigée**', '13 oct. : couleurs limitées à Se connecter et au retour Monde'),
    'visiter-contour-sombre': ('**Vérifié**', '13 oct. : rose et dimensions conservés, contour ajouté'),
    'illustrations-variees': ('**Vérifié**', '—'),
    'lisibilite-textes': ('Réalisé, contrôlé et documenté ; vérification à faire', '—'),
    'titres-marque': ('Réalisé, contrôlé et documenté ; vérification à faire', 'Point en attente : Futura PT, HORIZON en Jost Medium'),
    'titres-forts': ('Commencé', '—'),
    'echelle-unifiee': ('À réaliser', '—'),
    'awards-a-venir': ('Ancien brouillon à reprendre', '7 oct. : page Awards sans contenu'),
}
# Short wording of the verifiers' outcome where it is not a plain validation.
VERDICT_NOTES = {
    'globe-espace-libre': 'réserves. Le code est conforme, mais le globe devient inutilisable sur un téléphone en paysage et les vues Pays du Canada et du Brésil sont moins zoomées ; contrôle étendu aux changements de langue et de thème et aux quatre essais du groupe combinés.',
    'titre-fiche-campus': 'corrigé. Le titre n’est plus ajouté sous un logo qui écrit déjà le nom (Mulhouse) ; contrôle étendu à Mulhouse et Lyon, qui restent identiques au pixel près, et aux changements de langue et de thème.',
    'roles-couleur': 'corrigé. La fiche est précisée (décision concernée, bouton « Fermer », quatre contrôles ajoutés) ; le code de l’essai est inchangé.',
}
VERIFIED = [i for i, (state, _) in STATE.items() if state.startswith('**')]
DOCUMENTED = ['lisibilite-textes', 'titres-marque']
verdicts = {}
for group in json.loads((REPRISE / 'vague1-resultats.json').read_text()):
    for trial in group['verification']['trials']:
        verdicts[trial['id']] = trial

head = (REPRISE / 'notes-entete.md').read_text().rstrip('\n')
old = 'ce sont des propositions de l’assistant, réalisées et vérifiées techniquement, en attente du choix de l’utilisateur.'
assert old in head
head = head.replace(old, 'ce sont des propositions de l’assistant, en attente du choix de l’utilisateur. **Le travail est en pause depuis 14 h 39, à la demande de l’utilisateur** : 9 essais sont vérifiés, les 10 autres sont à finir ou à vérifier ([état et reprise](#reprise)).')
head = head.replace(
    'Les vues de la galerie sont réduites',
    'Les cartes des essais non terminés affichent « Essai en cours de réalisation » ; leurs fichiers peuvent encore changer. Les vues de la galerie sont réduites')

out = [head, '', '## Les 19 essais', '',
       'État au 14 octobre, 14 h 39. « Vérifié » signifie réalisé, contrôlé par son auteur, puis revérifié par un second agent chargé de le contredire ; ce n’est pas une acceptation de l’utilisateur.', '',
       '| N° | Essai | État | Décision antérieure concernée | Accès |', '| --- | --- | --- | --- | --- |']
number = 0
for group, ids in GROUPS:
    out.append(f'| | **{group}** | | | |')
    for trial_id in ids:
        number += 1
        trial = json.loads((STUDY / 'essais' / trial_id / 'essai.json').read_text())
        state, decision = STATE[trial_id]
        out.append(f'| {number:02d} | {trial["titre"]} | {state} | {decision} | [Comparer](index.html?essai={trial_id}) |')

def details(trial_id, verdict=None):
    trial = json.loads((STUDY / 'essais' / trial_id / 'essai.json').read_text())
    lines = [f'#### {trial["titre"]} (`{trial_id}`)', '', trial['resume'], '']
    if trial.get('decisionConcernee'):
        lines.append(f'- **Décision concernée :** {trial["decisionConcernee"]}')
    if trial.get('alternativeDe'):
        lines.append(f'- **Alternative :** `{trial["alternativeDe"]}`')
    if verdict:
        lines.append(f'- **Vérification contradictoire :** {VERDICT_NOTES.get(trial_id, verdict["verdict"] + ".")}')
    lines.append(f'- **Mesures :** {len(trial.get("verifications", []))} contrôles consignés dans [essai.json](essais/{trial_id}/essai.json) et [results.json](checks/{trial_id}/results.json) ; {len(trial.get("captures", []))} paires de captures avant/après.')
    limits = trial.get('limites', [])[:3]
    if limits:
        lines.append('- **Limites principales :**')
        lines += [f'  - {limit}' for limit in limits]
    return lines + ['']

out += ['', '## Essais vérifiés', '']
for group, ids in GROUPS:
    chosen = [i for i in ids if i in VERIFIED]
    if not chosen:
        continue
    out += [f'### {group}', '']
    for trial_id in chosen:
        out += details(trial_id, verdicts.get(trial_id))
out += ['## Réalisés et documentés, vérification à faire', '',
        'Ces deux essais ont leur fiche et leurs mesures, mais pas encore la vérification contradictoire.', '']
for trial_id in DOCUMENTED:
    out += details(trial_id)
(STUDY / 'NOTES.md').write_text('\n'.join(out).rstrip('\n') + '\n' + (REPRISE / 'notes-fin.md').read_text(), encoding='utf-8')
print('NOTES.md', len('\n'.join(out)))
