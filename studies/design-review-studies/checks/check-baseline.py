"""The study copy must render like the active prototype, with or without (empty) trials loaded.
Run from anywhere: python3 -I studies/design-review-studies/checks/check-baseline.py"""
import json, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from helper import Session, STUDY, ACTIVE, D, M, image_diff

OUT = HERE / 'baseline'
ALL = ['globe-espace-libre', 'textes-sur-pastilles', 'police-etiquettes-globe', 'titre-fiche-campus', 'recherche-repliee', 'voile-pile-basse',
       'une-colonne-320', 'deux-colonnes-allegees', 'illustrations-sombres', 'illustrations-attenuees', 'roles-couleur', 'visiter-contour-sombre',
       'illustrations-variees', 'lisibilite-textes', 'titres-marque', 'titres-forts', 'echelle-unifiee', 'pseudo-manquant', 'awards-a-venir']
STATES = [('projects', 'light', 'fr', D, True), ('people', 'light', 'fr', D, True), ('projects/ft-transcendence-building-together', 'dark', 'fr', M, True),
          ('journal', 'light', 'ar', M, True), ('explore', 'light', 'fr', D, False)]
results = {'cases': [], 'passed': False}
s = Session(OUT)
try:
    for route, theme, lang, vp, block in STATES:
        name = f"{route.split('/')[0]}-{theme}-{lang}-{vp[0]}"
        s.open(route, theme=theme, lang=lang, viewport=vp, block_globe=block, base=ACTIVE); active = s.shot('active-' + name); active_err = s.errors()
        s.open(route, theme=theme, lang=lang, viewport=vp, block_globe=block); study = s.shot('study-' + name); study_err = s.errors()
        state = s.js('({essais:document.documentElement.dataset.essais,ready:document.documentElement.dataset.essaisReady,lang:document.documentElement.lang,theme:document.documentElement.dataset.theme})')
        s.open(route, essais=ALL, theme=theme, lang=lang, viewport=vp, block_globe=block); empty = s.shot('study-empty-trials-' + name)
        loaded = s.js('({active:window.horizonEssais.active.length,ignored:window.horizonEssais.ignored,links:document.querySelectorAll("link[data-essai]").length,ready:document.documentElement.dataset.essaisReady})')
        case = {'state': name, 'diffActiveVsStudy': round(image_diff(active, study), 5), 'diffStudyVsEmptyTrials': round(image_diff(study, empty), 5),
                'studyState': state, 'emptyTrials': loaded, 'errors': {'active': active_err, 'study': study_err, 'emptyTrials': s.errors()}}
        results['cases'].append(case); s.record(name, case)
    tolerance = lambda case: 0.02 if case['state'].startswith('explore') else 0.001
    results['passed'] = all(c['diffActiveVsStudy'] <= tolerance(c) and c['diffStudyVsEmptyTrials'] <= tolerance(c) and not any(c['errors'].values()) for c in results['cases'])
finally:
    s.close()
    (OUT / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    print('passed', results['passed'])
