"""Write the final NOTES.md of the design-review studies from the trial sheets and agent reports."""
import json
from pathlib import Path

STUDY = Path(__file__).resolve().parents[2]
REPRISE = STUDY / 'checks' / '_reprise'
GROUPS = [
    ('Explorer et globe', ['globe-espace-libre', 'textes-sur-pastilles', 'police-etiquettes-globe', 'titre-fiche-campus']),
    ('Pile flottante, cartes et petits écrans', ['recherche-repliee', 'voile-pile-basse', 'une-colonne-320', 'deux-colonnes-allegees', 'pseudo-manquant']),
    ('Couleurs, thème sombre et illustrations', ['illustrations-sombres', 'illustrations-attenuees', 'roles-couleur', 'visiter-contour-sombre', 'illustrations-variees']),
    ('Typographie, lisibilité et pages', ['lisibilite-textes', 'titres-marque', 'titres-forts', 'echelle-unifiee', 'awards-a-venir']),
]
# Short form of the earlier decision each trial revisits (full wording in essai.json).
DECISIONS = {
    'globe-espace-libre': '4 et 13 oct. : rayon du globe',
    'titre-fiche-campus': '8 oct. : logo, sinon nom',
    'recherche-repliee': '5 oct. : capsule flottante',
    'une-colonne-320': '6 et 8 oct. : deux colonnes à 320 px',
    'deux-colonnes-allegees': '11 oct. : couronne à droite du nom, tailles conservées',
    'roles-couleur': '13 oct. : couleurs limitées à Se connecter et au retour Monde',
    'visiter-contour-sombre': '13 oct. : rose et dimensions conservés, contour ajouté',
    'titres-marque': 'Point en attente : Futura PT, HORIZON en Jost Medium',
    'awards-a-venir': '7 oct. : page Awards sans contenu',
    'echelle-unifiee': '6 oct. : adapter la page sans paliers de taille (en partie)',
}
LABELS = {'validé': '**Validé**', 'corrigé': '**Corrigé**', 'réserves': '**Avec réserves**'}
# Short wording of the verifiers' outcome where it is not a plain validation.
VERDICT_NOTES = {
    'globe-espace-libre': 'avec réserves. Le code est conforme, mais le globe devient inutilisable sur un téléphone en paysage et les vues Pays du Canada et du Brésil sont moins zoomées ; contrôle étendu aux changements de langue et de thème et aux quatre essais du groupe combinés.',
    'titre-fiche-campus': 'corrigé. Le titre n’est plus ajouté sous un logo qui écrit déjà le nom (Mulhouse) ; contrôle étendu à Mulhouse et Lyon, qui restent identiques au pixel près, et aux changements de langue et de thème.',
    'roles-couleur': 'corrigé. La fiche est précisée (décision concernée, bouton « Fermer », quatre contrôles ajoutés) ; le code de l’essai est inchangé.',
    'voile-pile-basse': 'corrigé. Le voile s’efface quand la navigation au clavier sélectionne un élément placé sous la pile ; deux affirmations inexactes de la fiche sont corrigées.',
    'une-colonne-320': 'corrigé. Code conforme ; la fiche mesure les 12 cartes de la page au lieu de 8 et signale qu’en arabe à 340 px la référence coupe encore un nom ; une mesure indépendante est ajoutée.',
    'deux-colonnes-allegees': 'corrigé. Code conforme ; la fiche est corrigée et signale la décision du 11 octobre sur la couronne (18 → 11 px, posée sur l’avatar).',
    'pseudo-manquant': 'corrigé. Code conforme ; deux chiffres inexacts de la fiche sont remplacés par des mesures sur les 4 pages de profils.',
    'lisibilite-textes': 'corrigé. La pastille de statut agrandie était rognée dans la vue Liste des Profils sous 1200 px : elle y garde sa taille d’origine.',
    'titres-marque': 'corrigé. Le slogan « BEYOND THE CODE » n’est plus rogné, et le message chiffré ne passe plus en gras italique avant le décryptage.',
    'awards-a-venir': 'corrigé. Un commentaire du code et une limite inexacte de la fiche sont corrigés ; aucune règle de style n’est modifiée.',
    'echelle-unifiee': 'corrigé. Au fil de trois vérifications, six défauts sont corrigés dans le style : portraits devenus ovales, ombre sans effet sur le sélecteur Monde, pastille rognée avec les textes plus lisibles, indication et état vide à 16 px, règle inutile, pseudos des cartes de profils remis à 12 px ; la fiche est réécrite depuis les mesures et signale la décision du 6 octobre.',
}


def load(name):
    path = REPRISE / name
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}


verdicts = {}
for group in load('vague1-resultats.json') or []:
    for trial in group['verification']['trials']:
        verdicts[trial['id']] = trial
partial, final = load('vague2-resultats-partiels.json'), load('vague2-fin.json')
for label, result in list(partial.items()) + [(k, v) for k, v in final.items() if k.startswith('vérification:')]:
    if label.startswith('vérification:'):
        for trial in result['trials']:
            verdicts[trial['id']] = trial
VERDICT_NOTES.update(final.get('notes', {}))


def sheet(trial_id):
    return json.loads((STUDY / 'essais' / trial_id / 'essai.json').read_text(encoding='utf-8'))


def details(trial_id):
    trial, verdict = sheet(trial_id), verdicts.get(trial_id)
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


head = (REPRISE / 'notes-entete.md').read_text(encoding='utf-8').rstrip('\n')
out = [head, '', '## Les 19 essais', '',
       '« Validé » ou « Corrigé » : réalisé, contrôlé par son auteur, puis revérifié par un second agent chargé de le contredire, qui a corrigé les défauts trouvés. Ce n’est pas une acceptation de l’utilisateur.', '',
       '| N° | Essai | Vérification | Décision antérieure concernée | Accès |', '| --- | --- | --- | --- | --- |']
number = 0
for group, ids in GROUPS:
    out.append(f'| | **{group}** | | | |')
    for trial_id in ids:
        number += 1
        verdict = verdicts.get(trial_id)
        state = LABELS.get(verdict['verdict'], verdict['verdict']) if verdict else 'Non vérifié'
        out.append(f'| {number:02d} | {sheet(trial_id)["titre"]} | {state} | {DECISIONS.get(trial_id, "—")} | [Comparer](index.html?essai={trial_id}) |')
out += ['', '## Détail des essais', '']
for group, ids in GROUPS:
    out += [f'### {group}', '']
    for trial_id in ids:
        out += details(trial_id)

integration = final.get('integration') or {}
if integration:
    out += ['## Combinaisons', '', final.get('combinaisonsIntro', ''), '',
            '| Combinaison | Essais | Vues | Résultat |', '| --- | --- | --- | --- |']
    for combo in integration.get('combinations', []):
        result = 'sans problème' if combo['passed'] else '; '.join(combo['problemes']) or 'à revoir'
        out.append(f'| {combo["nom"]} | {len(combo["essais"])} | {", ".join(combo["vues"])} | {result} |')
    for title, key in (('Conflits corrigés', 'conflictsFixed'), ('Fiches', 'essaiJsonIssues'), ('Points restants', 'remainingIssues')):
        items = integration.get(key) or []
        out += ['', f'**{title} :** ' + ('aucun.' if not items else ''), '']
        out += [f'- {item}' for item in items]
    out.append('')
# Selection chosen by the user on 15 Oct and its combination test (selection-20261015.json).
selection = load('selection-20261015.json')
tail = (REPRISE / 'notes-fin-finale.md').read_text(encoding='utf-8')
if selection:
    ids, final = selection['ids'], selection.get('final') or {}
    numbers = {trial_id: n for n, trial_id in enumerate([i for _, group in GROUPS for i in group], 1)}
    part = ['## Sélection retenue le 15 octobre', '',
            'L’utilisateur retient neuf essais pour les voir ensemble : ' + ', '.join(f'{numbers[i]:02d} {sheet(i)["titre"]}' for i in ids) + '. '
            'La combinaison est d’abord testée sur la copie, puis intégrée au prototype actif à la demande de l’utilisateur ([notes d’intégration](../horizon-welcome/DESIGN_REVIEW_SELECTION_NOTES.md)).', '',
            f'[Ouvrir la sélection](baseline/content-preview.html?essais={",".join(ids)}#explore) · [scripts et résultats du test](checks/_selection-20261015/)', '',
            selection.get('intro', ''), '']
    for item in final.get('problemesTraites', []):
        part.append(f'- **{item["conclusion"].capitalize()} :** {item["description"]} — {item["correction"]}')
    if final.get('fichiersModifies'):
        part += ['', '**Fichiers modifiés :** ' + ', '.join(f'`{f}`' for f in final['fichiersModifies']) + '.']
    if final.get('verificationsFinales'):
        part += ['', '**Contrôle final de la combinaison :**', ''] + [f'- {line}' for line in final['verificationsFinales']]
    if final.get('limites'):
        part += ['', '**Limites :**', ''] + [f'- {line}' for line in final['limites']]
    marker = '\n## Sources et conservation'
    tail = tail.replace(marker, '\n' + '\n'.join(part).rstrip('\n') + '\n' + marker, 1)
(STUDY / 'NOTES.md').write_text('\n'.join(out).rstrip('\n') + '\n' + tail, encoding='utf-8')
print('NOTES.md', number, 'essais')
