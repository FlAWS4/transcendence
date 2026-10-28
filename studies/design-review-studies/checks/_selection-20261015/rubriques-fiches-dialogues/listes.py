"""Risk 3: Projects, Chronicles and Profiles lists (grid and list views), baseline vs the nine trials.

python3 -I listes.py [mesure|attribution]
 mesure       30 views (3 sections x 2 views x 5 screens), baseline and combination, fresh loads;
              detectors of the trials' own checkers + cascade of the nine sheets on the combination.
 attribution  views with a regression: each card trial alone and in pairs, to name the trials.
Results: listes.json; screenshots in shots/.
"""
import itertools, json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import *  # noqa: F401,F403

SHOTS = HERE / 'shots'
SCREENS = [('ordinateur', D, 'light', 'fr'), ('mobile-sombre', M, 'dark', 'fr'), ('360-ar', S360, 'light', 'ar'),
           ('340-ar', S340, 'light', 'ar'), ('320-ar', S, 'light', 'ar')]
SECTIONS = ['projects', 'journal', 'people']
VIEWS = ['grid', 'list']
CASES = [(f'{sec}-{view}-{name}', sec, view, vp, theme, lang) for sec in SECTIONS for view in VIEWS for name, vp, theme, lang in SCREENS]
# One English view (the zone asks for one): Projects and Profiles grids at 340 px.
CASES += [('projects-grid-340-en', 'projects', 'grid', S340, 'light', 'en'), ('people-grid-340-en', 'people', 'grid', S340, 'light', 'en')]
CARD_TRIALS = ['une-colonne-320', 'pseudo-manquant', 'lisibilite-textes', 'echelle-unifiee']

PROBE_JS = r'''(()=>{const list=document.querySelector('#content-list'),card=list?.querySelector('.cp-card'),meta=list?.querySelector('.cp-card-copy>.cp-meta, .cp-meta'),h=list?.querySelector('.cp-card h2');
const cs=e=>e?getComputedStyle(e):null;const P=['Pseudo Intra à renseigner','Intra login to be added','اسم مستخدم Intra غير محدد'];
const pend=[...document.querySelectorAll('#content-index .cp-profile-login:not([dir])')];
return{tracks:list?cs(list).gridTemplateColumns:null,columns:list?cs(list).gridTemplateColumns.split(' ').length:null,cardRadius:card?cs(card).borderTopLeftRadius:null,
 metaSize:meta?cs(meta).fontSize:null,metaColor:meta?cs(meta).color:null,titleSize:h?cs(h).fontSize:null,
 placeholdersVisible:pend.filter(e=>e.checkVisibility({visibilityProperty:true})).length,placeholdersTotal:pend.length,
 marksReplie:document.querySelectorAll('[data-pseudo-manquant=replie]').length,innerTextPlaceholders:P.map(p=>document.body.innerText.split(p).length-1).reduce((a,b)=>a+b,0)}})()'''


def measure(s, section, view):
    out = {'state': s.js(STATE_JS), 'overflow': s.overflow(), 'clips': s.js(CLIP_JS, 30), 'shapes': s.js(SHAPE_JS, 30),
           'spill': s.js(SPILL_JS, 60), 'words': s.js(WORDS_JS, 20), 'probe': s.js(PROBE_JS)}
    if section in ('projects', 'journal'):
        out['audit'] = s.js(AUDIT_JS, 30)
    else:
        out['breaks'] = s.js(BREAKS_JS, 30)
        if view == 'grid': out['grid'] = s.js(GRID_JS, 20); out['unlevel'] = s.js(UNLEVEL_JS, 20)
        else: out['list'] = s.js(LIST_JS, 20)
    out['errors'] = s.errors()
    return out


def audit_problems(a):
    """Author names on several lines or cut inside a word, rect hits in the author row, titles over 3 lines, parts leaving the card."""
    bad = set()
    for c in a['cards']:
        for n in c['names']:
            if n['lines'] != 1: bad.add(f"nom sur {n['lines']} lignes: {n['name']} ({c['title'][:24]})")
            for b in n['breaks']: bad.add(f"mot coupé: {n['name']} {b}")
        for h in c['hits']: bad.add(f"chevauchement auteurs: {c['title'][:24]} {h}")
        if c['titleLines'] > 3: bad.add(f"titre sur {c['titleLines']} lignes: {c['title'][:30]}")
        for b in c['titleBreaks']: bad.add(f"mot de titre coupé: {c['title'][:30]} {b}")
        for o in c['outside']: bad.add(f"hors de la carte: {c['title'][:24]} {o}")
    return bad


def signature(m):
    sig = {
        'clips': {f"{c['k']} «{c['t']}»" for c in m['clips']},
        'boxClips': {f"{c['k']} < {c['a']} «{c['t']}»" for c in m['shapes']['boxClips']},
        'ovals': {o['k'] for o in m['shapes']['ovals']},
        'spills': {f"{x['k']} hors de {x['a']} «{x['t']}»" for x in m['spill']['spills']},
        'collisions': {f"«{x['ta']}» / «{x['tb']}»" for x in m['spill']['collisions']},
        'brokenWords': set(m['words']['broken']), 'clamped': set(m['words']['clamped']),
        'audit': audit_problems(m['audit']) if 'audit' in m else set(),
        'breaks': set(m['breaks']['breaks']) if 'breaks' in m else set(),
    }
    if 'grid' in m:
        g = m['grid']
        sig['grid'] = {f'rangées décalées (campus): {g["unlevelCampus"]}'} if g['unlevelCampus'] else set()
        if g['unlevelCohort']: sig['grid'].add(f'rangées décalées (promotion): {g["unlevelCohort"]}')
        if g['unequalHeights']: sig['grid'].add(f'rangées de hauteurs inégales: {g["unequalHeights"]}')
        if g['shownPlaceholders']: sig['grid'].add(f'mentions visibles: {g["shownPlaceholders"]}')
        if g['wrongState']: sig['grid'].add(f'état pseudo inattendu: {g["wrongState"]}')
    if 'list' in m:
        sig['list'] = {f'texte sous le cœur: {m["list"]["heartOverlap"]}'} if m['list']['heartOverlap'] else set()
    if m['overflow']: sig['overflow'] = {'défilement horizontal'}
    if m['errors']: sig['errors'] = set(map(str, m['errors']))
    return sig


def new_in(a, b):
    """What view b shows and view a does not."""
    sa, sb = signature(a), signature(b)
    return {k: sorted(v - sa.get(k, set())) for k, v in sb.items() if v - sa.get(k, set())}


def expectations(case, m):
    """What the combination must show whatever the baseline does."""
    name, sec, view, vp, theme, lang = case
    p, bad = m['probe'], []
    if sec in ('projects', 'journal') and view == 'grid':
        want = 1 if vp[0] <= 360 else None
        if want and p['columns'] != want: bad.append(f"colonnes {p['columns']} au lieu de 1")
        if vp[0] <= 360:
            for x in sorted(audit_problems(m['audit'])): bad.append(x)
    if sec == 'people':
        if p['placeholdersVisible'] or p['innerTextPlaceholders']: bad.append(f"mentions « pseudo à renseigner » visibles: {p['placeholdersVisible']}/{p['innerTextPlaceholders']}")
        if view == 'grid':
            g = m['grid']
            for k in ('unlevelCampus', 'unlevelCohort', 'unequalHeights', 'wrongState'):
                if g[k]: bad.append(f'{k}: {g[k]}')
        if m['breaks']['breaks']: bad.extend(m['breaks']['breaks'])
    if m['overflow']: bad.append('défilement horizontal')
    if m['errors']: bad.append('erreurs: ' + '; '.join(map(str, m['errors']))[:300])
    return bad


store = Store('listes')


def job(case, label, essais, shots=True):
    name, sec, view, vp, theme, lang = case
    def run(s):
        if label in store.data.get(name, {}): return
        load(s, sec, essais, theme, lang, vp)
        ensure_view(s, view)
        s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.5)
        m = measure(s, sec, view)
        if label == 'combo': m['cascade'] = cascade(s)
        if shots:
            s.shot(f'{name}-{label}')
            if sec == 'people' and view == 'grid' and vp[0] <= 360:
                # Second screen of the directory grid (rows 3 to 5).
                y = s.js('(()=>{const c=[...document.querySelectorAll("#content-list .cp-card")];const t=c[4]||c[0];return Math.max(0,Math.round(t.getBoundingClientRect().top+scrollY-120))})()')
                s.scroll(y); s.shot(f'{name}-{label}-bas'); s.scroll(0)
        entry = store.data.setdefault(name, {'section': sec, 'view': view, 'viewport': list(vp[:2]), 'theme': theme, 'lang': lang})
        entry[label] = m; store.save()
        print(name, label, 'cols', m['probe']['columns'], 'new' if label != 'base' else '', flush=True)
    return run


def summarize():
    bilan = {}
    for case in CASES:
        name = case[0]; e = store.data.get(name)
        if not e or 'base' not in e or 'combo' not in e: continue
        c = e['combo']; cas = c.get('cascade', {})
        bilan[name] = {'nouveauxDansCombinaison': new_in(e['base'], c), 'attentesNonTenues': expectations(case, c),
                       'cascade': {'elements': cas.get('elements'), 'changes': cas.get('changed'), 'gardes': cas.get('kept'),
                                   'surcharges': [i for i in cas.get('issues', []) if i['p'] not in ('grid-template-columns',)],
                                   'pistesCalculees': [i for i in cas.get('issues', []) if i['p'] == 'grid-template-columns'],
                                   'plusieursEssais': [{k: m[k] for k in ('p', 'by', 'vals', 'base', 'combo', 'n', 'sample')} for m in cas.get('multi', [])]},
                       'sonde': c['probe'], 'sondeBase': e['base']['probe']}
    store.put('bilan', bilan)
    return bilan


def attribution():
    """For each view with a new problem or an unmet expectation, find the smallest set of card trials reproducing it."""
    bilan = store.data.get('bilan') or summarize()
    sets = [[t] for t in CARD_TRIALS] + [list(p) for p in itertools.combinations(CARD_TRIALS, 2)] + [list(p) for p in itertools.combinations(CARD_TRIALS, 3)] + [CARD_TRIALS]
    todo = [case for case in CASES if case[0] in bilan and (bilan[case[0]]['nouveauxDansCombinaison'] or bilan[case[0]]['attentesNonTenues'])]
    print('attribution for', [c[0] for c in todo], flush=True)
    jobs = []
    for case in todo:
        for trials in sets:
            label = '+'.join(trials)
            jobs.append(job(case, label, [t for t in ALL9 if t in trials], shots=False))
    run_jobs(jobs, SHOTS, per=6)
    out = {}
    for case in todo:
        name = case[0]; e = store.data[name]; target = bilan[name]
        wanted = {k: set(v) for k, v in target['nouveauxDansCombinaison'].items()}
        found = {}
        for trials in sets:
            label = '+'.join(trials)
            if label not in e: continue
            got = new_in(e['base'], e[label])
            for k, items in wanted.items():
                for item in items:
                    if item in set(got.get(k, [])) and item not in found: found[item] = label
        out[name] = {'reproduitPar': found, 'nonReproduits': sorted({i for v in wanted.values() for i in v} - set(found)),
                     'attentesParEnsemble': {'+'.join(t): expectations(case, e['+'.join(t)]) for t in sets if '+'.join(t) in e}}
    store.put('attribution', out)


if __name__ == '__main__':
    phase = sys.argv[1] if len(sys.argv) > 1 else 'mesure'
    if phase == 'mesure':
        jobs = [job(case, label, essais) for case in CASES for label, essais in (('base', []), ('combo', ALL9))]
        run_jobs(jobs, SHOTS, per=6)
        b = summarize()
        for name, x in b.items():
            print(name, json.dumps({'new': x['nouveauxDansCombinaison'], 'attentes': x['attentesNonTenues'], 'surcharges': x['cascade']['surcharges'][:3]}, ensure_ascii=False)[:900])
    elif phase == 'bilan':
        b = summarize()
        for name, x in b.items():
            print(name, json.dumps({'new': x['nouveauxDansCombinaison'], 'attentes': x['attentesNonTenues'], 'surcharges': x['cascade']['surcharges'][:3]}, ensure_ascii=False)[:900])
    elif phase == 'attribution':
        attribution()
        print(json.dumps(store.data['attribution'], ensure_ascii=False, indent=1)[:6000])
