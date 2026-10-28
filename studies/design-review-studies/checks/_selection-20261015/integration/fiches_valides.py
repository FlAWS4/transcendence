"""Integration pass: the nine trial sheets of the selection are valid JSON, have every field the gallery reads, and every
listed file and capture exists (same rules as checks/galerie/check.py, without rewriting the gallery results).
python3 -I checks/_selection-20261015/integration/fiches_valides.py"""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
STUDY = HERE.parents[2]
ALL9 = ['globe-espace-libre', 'police-etiquettes-globe', 'une-colonne-320', 'roles-couleur', 'visiter-contour-sombre',
        'lisibilite-textes', 'echelle-unifiee', 'pseudo-manquant', 'awards-a-venir']
REQUIRED = ['id', 'groupe', 'titre', 'resume', 'probleme', 'changement', 'decisionConcernee', 'alternativeDe', 'vues', 'verifications', 'limites', 'fichiers', 'captures']
out = {}
for trial in ALL9:
    path = STUDY / 'essais' / trial / 'essai.json'
    try:
        sheet = json.loads(path.read_text(encoding='utf-8')); valid = True
    except Exception as error:
        out[trial] = {'validJson': False, 'error': str(error)}; continue
    paths = list(sheet.get('fichiers', []))
    shots = [c[k] for c in sheet.get('captures', []) for k in ('avant', 'apres') if c.get(k)]
    out[trial] = {'validJson': valid, 'idMatches': sheet.get('id') == trial, 'missingFields': [k for k in REQUIRED if k not in sheet],
                  'files': len(paths), 'missingFiles': [p for p in paths if not (STUDY / p).exists()],
                  'captures': len(shots), 'missingCaptures': [p for p in shots if not (STUDY / p).exists()],
                  'verifications': len(sheet.get('verifications', [])), 'limites': len(sheet.get('limites', []))}
ok = all(v.get('validJson') and v['idMatches'] and not v['missingFields'] and not v['missingFiles'] and not v['missingCaptures'] for v in out.values())
(HERE / 'results-fiches.json').write_text(json.dumps({'passed': ok, 'fiches': out}, ensure_ascii=False, indent=1) + '\n')
for trial, v in out.items(): print(trial, json.dumps(v, ensure_ascii=False))
print('passed', ok)
