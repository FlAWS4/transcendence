"""Details: project (overview, comments), profile of Leïla Mansour (overview, projects at 320 px),
article; baseline vs the nine trials, fresh loads; detectors of the trials' checkers, cascade of the
nine sheets, detail-scroll density and the sizes the trials set on the sidebar actions.

python3 -I fiches.py [mesure|bilan]
Results: fiches.json; screenshots in shots/.
"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import *  # noqa: F401,F403

SHOTS = HERE / 'shots'
ROUTES = [('projet-apercu', f'projects/{PID}?tab=overview'), ('projet-commentaires', f'projects/{PID}?tab=comments'),
          ('profil', f'people/{LEILA}?tab=overview'), ('article', f'journal/{ART}?tab=article')]
SCREENS = [('ordinateur', D, 'light', 'fr'), ('mobile-sombre', M, 'dark', 'fr'), ('320-ar', S, 'light', 'ar')]
CASES = [(f'{r}-{n}', route, vp, theme, lang) for r, route in ROUTES for n, vp, theme, lang in SCREENS]
CASES += [('profil-projets-320-ar', f'people/{LEILA}?tab=projects', S, 'light', 'ar'),
          ('projet-apercu-en-ordinateur', f'projects/{PID}?tab=overview', D, 'light', 'en'),
          ('projet-commentaires-en-sombre-mobile', f'projects/{PID}?tab=comments', M, 'dark', 'en')]

PROBE_JS = r'''(()=>{const q=s=>[...document.querySelectorAll(s)].find(e=>e.getClientRects().length);const cs=e=>e?getComputedStyle(e):null;
const pick=(s,props)=>{const e=q(s);if(!e)return null;const c=cs(e),r=e.getBoundingClientRect();return Object.assign({w:+r.width.toFixed(1),h:+r.height.toFixed(1)},Object.fromEntries(props.map(p=>[p,c.getPropertyValue(p)])))};
const F=['font-size','color','border-top-left-radius','box-shadow','background-color'];
return{density:[...new Set([...document.querySelectorAll('[data-detail-density]')].map(e=>e.dataset.detailDensity))],scroll:[...new Set([...document.querySelectorAll('[data-detail-scroll]')].map(e=>e.dataset.detailScroll))],
 h1:pick(':is(#project-detail,#journal-detail,#profile-detail):not([hidden]) h1',F),eyebrow:pick(':is(#project-detail,#journal-detail):not([hidden]) .cp-project-eyebrow',F),
 facts:pick(':is(#project-detail,#journal-detail):not([hidden]) .cp-project-facts',F),favori:pick(':is(#project-detail,#journal-detail,#profile-detail):not([hidden]) .cp-favorite:not(.cp-favorite-compact)',F),
 signaler:pick(':is(#project-detail,#journal-detail,#profile-detail):not([hidden]) .cp-report-trigger',F),campus:pick(':is(#project-detail,#profile-detail):not([hidden]) :is(.cp-project-campus,.cp-profile-campus)',F),
 message:pick('#profile-detail:not([hidden]) .cp-profile-message',F),login:pick('#profile-detail:not([hidden]) .cp-profile-heading>.cp-profile-login',F),
 navLink:pick(':is(#project-detail,#journal-detail,#profile-detail):not([hidden]) :is(.cp-project-sidebar-nav,.cp-profile-sidebar-nav) a',F),
 bodyText:pick(':is(#project-detail,#journal-detail,#profile-detail):not([hidden]) :is(.cp-project-block>p,.cp-profile-overview-block>p,.cp-profile-story>p)',F),
 blockTitle:pick(':is(#project-detail,#journal-detail,#profile-detail):not([hidden]) :is(.cp-project-block h3,.cp-profile-overview-block h3)',F),
 commentHint:pick('.cp-comments-hint',F),commentText:pick('.cp-comments-form textarea',F),relatedCard:pick('.cp-profile-related-link',F),relatedTitle:pick('.cp-profile-related-copy h3',F),
 relatedCols:(()=>{const g=q('.cp-profile-related-grid');return g?cs(g).gridTemplateColumns.split(' ').length:null})()}})()'''


def measure(s):
    return {'state': s.js(STATE_JS), 'overflow': s.overflow(), 'clips': s.js(CLIP_JS, 30), 'shapes': s.js(SHAPE_JS, 30),
            'spill': s.js(SPILL_JS, 60), 'words': s.js(WORDS_JS, 20), 'probe': s.js(PROBE_JS), 'errors': s.errors()}


def signature(m):
    return {'clips': {f"{c['k']} «{c['t']}»" for c in m['clips']},
            'boxClips': {f"{c['k']} < {c['a']} «{c['t']}»" for c in m['shapes']['boxClips']},
            'ovals': {o['k'] for o in m['shapes']['ovals']},
            'spills': {f"{x['k']} hors de {x['a']} «{x['t']}»" for x in m['spill']['spills']},
            'collisions': {f"«{x['ta']}» / «{x['tb']}»" for x in m['spill']['collisions']},
            'brokenWords': set(m['words']['broken']), 'clamped': set(m['words']['clamped']),
            'overflow': {'défilement horizontal'} if m['overflow'] else set(), 'errors': set(map(str, m['errors']))}


def new_in(a, b):
    sa, sb = signature(a), signature(b)
    return {k: sorted(v - sa.get(k, set())) for k, v in sb.items() if v - sa.get(k, set())}


store = Store('fiches')


def job(case, label, essais, shots=True):
    name, route, vp, theme, lang = case
    def run(s):
        if label in store.data.get(name, {}): return
        load(s, route, essais, theme, lang, vp)
        time.sleep(.6); s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.4)
        m = measure(s)
        if label == 'combo': m['cascade'] = cascade(s)
        if shots:
            s.shot(f'fiche-{name}-{label}')
            if 'commentaires' in name:
                s.js('(()=>{const f=document.querySelector(".cp-comments-form");f&&f.scrollIntoView({block:"center"});return true})()'); time.sleep(.8); s.shot(f'fiche-{name}-{label}-form')
        store.data.setdefault(name, {'route': route, 'viewport': list(vp[:2]), 'theme': theme, 'lang': lang})[label] = m; store.save()
        print(name, label, m['probe']['density'], flush=True)
    return run


def summarize():
    bilan = {}
    for case in CASES:
        name = case[0]; e = store.data.get(name)
        if not e or 'base' not in e or 'combo' not in e: continue
        c = e['combo']; cas = c['cascade']
        bilan[name] = {'nouveauxDansCombinaison': new_in(e['base'], c), 'densite': [e['base']['probe']['density'], c['probe']['density']],
                       'sondes': {k: [e['base']['probe'].get(k), c['probe'].get(k)] for k in c['probe'] if k not in ('density', 'scroll')},
                       'cascade': {'elements': cas['elements'], 'changes': cas['changed'], 'gardes': cas['kept'],
                                   'surcharges': [i for i in cas['issues'] if i['p'] != 'grid-template-columns'],
                                   'pistesCalculees': [i for i in cas['issues'] if i['p'] == 'grid-template-columns'],
                                   'plusieursEssais': [{k: m[k] for k in ('p', 'by', 'vals', 'base', 'combo', 'n', 'sample')} for m in cas['multi']]}}
    store.put('bilan', bilan)
    return bilan


if __name__ == '__main__':
    phase = sys.argv[1] if len(sys.argv) > 1 else 'mesure'
    if phase == 'mesure':
        run_jobs([job(case, label, essais) for case in CASES for label, essais in (('base', []), ('combo', ALL9))], SHOTS, per=6)
    b = summarize()
    for name, x in b.items():
        print(name, json.dumps({'new': x['nouveauxDansCombinaison'], 'densite': x['densite'], 'surcharges': x['cascade']['surcharges'][:4]}, ensure_ascii=False)[:1200])
