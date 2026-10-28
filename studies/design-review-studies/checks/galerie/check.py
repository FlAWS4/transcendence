"""Gallery check with the final trial sheets: cards, captures, comparator, selection and small screens.

Run from anywhere with: python3 -I checks/galerie/check.py (the local server must serve the repository).
"""
import json, pathlib, sys, time
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from helper import Session, ROOT_URL, D, M, S

OUT = pathlib.Path(__file__).resolve().parent
STUDY_DIR = OUT.parents[1]
GALLERY = ROOT_URL + 'studies/design-review-studies/index.html'
SELECTION_KEY = 'horizon-design-review-studies-20261014-gallery-selection'
IDS = ['globe-espace-libre', 'textes-sur-pastilles', 'police-etiquettes-globe', 'titre-fiche-campus',
       'recherche-repliee', 'voile-pile-basse', 'une-colonne-320', 'deux-colonnes-allegees',
       'illustrations-sombres', 'illustrations-attenuees', 'roles-couleur', 'visiter-contour-sombre', 'illustrations-variees',
       'lisibilite-textes', 'titres-marque', 'titres-forts', 'echelle-unifiee', 'pseudo-manquant', 'awards-a-venir']
REQUIRED = ['id', 'groupe', 'titre', 'resume', 'probleme', 'changement', 'decisionConcernee', 'alternativeDe', 'vues', 'verifications', 'limites', 'fichiers', 'captures']
results = {'sheets': {}, 'pages': {}}

# Sheets on disk: valid JSON, every field, files and captures present.
for trial_id in IDS:
    sheet = json.loads((STUDY_DIR / 'essais' / trial_id / 'essai.json').read_text(encoding='utf-8'))
    paths = list(sheet.get('fichiers', [])) + [c[k] for c in sheet.get('captures', []) for k in ('avant', 'apres') if c.get(k)]
    results['sheets'][trial_id] = {
        'missingFields': [k for k in REQUIRED if k not in sheet],
        'placeholder': sheet.get('resume') == 'Essai en cours de réalisation.' or not sheet.get('verifications'),
        'views': len(sheet.get('vues', [])), 'captures': len(sheet.get('captures', [])),
        'missingFiles': [p for p in paths if not (STUDY_DIR / p).exists()],
    }


def go(session, query='', viewport=D):
    session.viewport(*viewport)
    session.c.call('Page.navigate', {'url': GALLERY + query})
    session.wait('document.querySelectorAll("article.trial").length === 19', 30)
    session.wait('document.fonts.status === "loaded"', 10)
    time.sleep(1)


def page_state(session):
    return session.js('''(() => ({
        cards: document.querySelectorAll("article.trial").length,
        decisionBadges: document.querySelectorAll("article.trial .badge.decision").length,
        unfinished: [...document.querySelectorAll("article.trial .resume")].filter(p => p.textContent.includes("en cours de réalisation")).length,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
    }))()''')


session = Session(OUT)
try:
    go(session)
    state = page_state(session)
    # Every capture shown on a card must answer HTTP 200 (images are lazy, so ask for them directly).
    session.js('''(() => { window.__heads = null; const srcs = [...new Set([...document.querySelectorAll(".shots img")].map(i => i.src))];
        Promise.all(srcs.map(src => fetch(src, {method: "HEAD", cache: "no-store"}).then(r => [src, r.status]).catch(() => [src, 0]))).then(list => { window.__heads = list; }); return srcs.length; })()''')
    session.wait('Array.isArray(window.__heads)', 30)
    heads = session.js('window.__heads')
    state['captureImages'] = len(heads)
    state['brokenCaptures'] = [src for src, status in heads if status != 200]
    state['errors'] = session.errors()
    session.shot('galerie-ordinateur')
    results['pages']['ordinateur'] = state

    # Deep link: the comparator opens both frames, current copy without trials, trial copy with it.
    go(session, '?essai=lisibilite-textes')
    session.wait('document.getElementById("comparer").dataset.ready === "true"', 15)
    ready = session.wait('(() => { const f = id => document.getElementById(id).contentDocument?.documentElement; return f("frame-current")?.dataset.essaisReady === "true" && f("frame-trial")?.dataset.essaisReady === "true"; })()', 45)
    frames = session.js('''(() => { const f = id => document.getElementById(id).contentDocument?.documentElement;
        return {current: f("frame-current")?.dataset.essais ?? null, trial: f("frame-trial")?.dataset.essais ?? null,
                subject: document.getElementById("compare-subject").textContent, views: document.getElementById("view-select").options.length}; })()''')
    time.sleep(1.5)
    session.shot('galerie-comparaison')
    results['pages']['comparaison'] = {'framesReady': ready, **frames, 'errors': session.errors()}

    # Exclusive pair in the selection: the warning must appear.
    session.js(f'(() => {{ localStorage.setItem({json.dumps(SELECTION_KEY)}, JSON.stringify(["une-colonne-320", "deux-colonnes-allegees"])); return true; }})()')
    go(session)
    results['pages']['selection'] = session.js('''(() => { const w = document.getElementById("selection-warning");
        return {warningShown: !w.hidden, warning: w.textContent, items: document.querySelectorAll("#selection-list li").length,
                link: document.getElementById("open-selection").getAttribute("href")}; })()''')
    session.js('document.getElementById("selection").scrollIntoView({block: "start"}); true')
    time.sleep(.5)
    session.shot('galerie-selection')
    session.js(f'(() => {{ localStorage.removeItem({json.dumps(SELECTION_KEY)}); return true; }})()')

    # Small screens: no horizontal scrolling.
    for name, viewport in (('mobile', M), ('petit', S)):
        go(session, '', viewport)
        results['pages'][name] = {**page_state(session), 'errors': session.errors()}
        session.shot('galerie-' + name)
finally:
    session.close()

sheets = results['sheets'].values()
pages = results['pages']
results['passed'] = (
    all(not s['missingFields'] and not s['placeholder'] and not s['missingFiles'] and s['views'] >= 2 and s['captures'] >= 1 for s in sheets)
    and pages['ordinateur']['cards'] == 19 and pages['ordinateur']['unfinished'] == 0 and not pages['ordinateur']['brokenCaptures']
    and not pages['ordinateur']['overflow'] and not pages['ordinateur']['errors']
    and pages['comparaison']['framesReady'] and pages['comparaison']['current'] == '' and pages['comparaison']['trial'] == 'lisibilite-textes' and not pages['comparaison']['errors']
    and pages['selection']['warningShown']
    and all(not pages[n]['overflow'] and not pages[n]['errors'] for n in ('mobile', 'petit'))
)
(OUT / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding='utf-8')
print(json.dumps({'passed': results['passed'], 'pages': pages}, ensure_ascii=False, indent=1)[:3000])
print('sheets with problems:', {k: v for k, v in results['sheets'].items() if v['missingFields'] or v['placeholder'] or v['missingFiles'] or v['views'] < 2 or v['captures'] < 1})
