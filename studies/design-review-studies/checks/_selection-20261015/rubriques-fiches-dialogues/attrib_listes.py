"""Targeted attribution for the two list findings (run after listes.py mesure).
python3 -I attrib_listes.py"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import listes as LS
from lib import *  # noqa: F401,F403

CASES = {c[0]: c for c in LS.CASES}
PLAN = [  # (case, trial sets)
    ('projects-grid-mobile-sombre', [['lisibilite-textes'], ['echelle-unifiee'], ['lisibilite-textes', 'echelle-unifiee']]),
    ('people-list-360-ar', [['lisibilite-textes'], ['echelle-unifiee'], ['pseudo-manquant'], ['lisibilite-textes', 'echelle-unifiee'], ['echelle-unifiee', 'pseudo-manquant']]),
    ('projects-list-360-ar', [['echelle-unifiee'], ['lisibilite-textes']]),
]
ROWS_JS = r'''(()=>[...document.querySelectorAll('#content-index .cp-profile-card')].map(c=>{const r=c.getBoundingClientRect();const lines=e=>{if(!e||!e.getClientRects().length)return 0;const rg=document.createRange();rg.selectNodeContents(e);return new Set([...rg.getClientRects()].filter(q=>q.width>.5).map(q=>Math.round(q.top))).size};
 return{id:c.dataset.profileId,h:Math.round(r.height),name:c.querySelector('h2')?.textContent.trim(),nameLines:lines(c.querySelector('h2')),metaLines:lines(c.querySelector('.cp-card-copy>.cp-meta')),cohortLines:lines(c.querySelector('.cp-profile-cohort'))}}).filter(x=>x.h>120))()'''
AUTH_JS = r'''(()=>{const a=document.querySelectorAll('#content-list > .cp-card');return [...a].map(c=>({title:c.querySelector('.cp-card-title-link')?.textContent.trim().slice(0,30),w:Math.round(c.getBoundingClientRect().width),shown:c.querySelectorAll('.cp-authors:not(.cp-author-fit-probe) .cp-author-item .cp-person-avatar').length,
 names:[...c.querySelectorAll('.cp-authors:not(.cp-author-fit-probe) .cp-author-name>strong')].filter(e=>e.getClientRects().length).map(e=>{const g=document.createRange();g.selectNodeContents(e);return e.textContent+':'+new Set([...g.getClientRects()].map(q=>Math.round(q.top))).size+':'+getComputedStyle(e).fontSize+':'+Math.round(e.getBoundingClientRect().width)}),
 more:c.querySelector('.cp-authors:not(.cp-author-fit-probe) .cp-author-more')?.innerText.replace(/\s+/g,'')||null}))})()'''
store = Store('attribution-listes')


def job(name, trials):
    case = CASES[name]; _, sec, view, vp, theme, lang = case
    label = '+'.join(trials) if trials else 'base'
    def run(s):
        if label in store.data.get(name, {}): return
        load(s, sec, [t for t in ALL9 if t in trials], theme, lang, vp)
        ensure_view(s, view); s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.5)
        m = LS.measure(s, sec, view)
        m['extra'] = s.js(ROWS_JS) if sec == 'people' else s.js(AUTH_JS)
        if name == 'projects-grid-mobile-sombre':
            y = s.js('(()=>{const c=[...document.querySelectorAll("#content-list > .cp-card")].find(c=>c.textContent.includes("Arun Suri"));if(!c)return 0;return Math.max(0,Math.round(c.getBoundingClientRect().top+scrollY-80))})()')
            s.scroll(y); s.shot(f'attrib-{name}-{label}'); s.scroll(0)
        if name == 'people-list-360-ar':
            y = s.js('(()=>{const c=[...document.querySelectorAll("#content-index .cp-profile-card")].find(c=>c.getBoundingClientRect().height>120);if(!c)return 0;return Math.max(0,Math.round(c.getBoundingClientRect().top+scrollY-100))})()')
            s.scroll(y); s.shot(f'attrib-{name}-{label}'); s.scroll(0)
        store.data.setdefault(name, {})[label] = m; store.save(); print(name, label, flush=True)
    return run


jobs = []
for name, sets in PLAN:
    jobs.append(job(name, []))
    for t in sets: jobs.append(job(name, t))
    jobs.append(job(name, ALL9))
run_jobs(jobs, LS.SHOTS, per=6)
base = json.loads((HERE / 'listes.json').read_text())
for name, sets in PLAN:
    e = store.data[name]
    for label, m in e.items():
        new = LS.new_in(e['base'], m)
        print(name, label, json.dumps(new, ensure_ascii=False)[:300])
        if name == 'projects-grid-mobile-sombre':
            for c in m['extra']:
                if any('Arun' in n for n in c['names']): print('   ', c)
        elif name == 'people-list-360-ar':
            print('    tall rows', m['extra'][:6])
