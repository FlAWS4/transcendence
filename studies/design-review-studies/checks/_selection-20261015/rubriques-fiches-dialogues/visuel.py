"""Targeted captures and probes after listes.py / fiches.py (read-only on the trials).
python3 -I visuel.py
 liste-profils-360  Profiles list at 360x640 light AR: the same tall card (Inès Morel) in the copy,
                    echelle-unifiee alone and the nine, with the heights of its lines.
 focus              keyboard ring of the first card link (Projects 320 AR, Profiles 1440 FR), copy vs nine.
Results: visuel.json; screenshots in shots/.
"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import *  # noqa: F401,F403

SHOTS = HERE / 'shots'
store = Store('visuel')
CARD_JS = r'''((id)=>{const c=document.querySelector('#content-index .cp-profile-card[data-profile-id="'+id+'"]');if(!c)return null;c.scrollIntoView({block:'center'});
const R=e=>{const r=e.getBoundingClientRect();return[+r.top.toFixed(1),+r.height.toFixed(1)]};const lines=e=>{const g=document.createRange();g.selectNodeContents(e);return new Set([...g.getClientRects()].filter(q=>q.width>.5).map(q=>Math.round(q.top))).size};
const copy=c.querySelector('.cp-card-copy');const kids=[...(copy?copy.children:[])].filter(e=>e.getClientRects().length).map(e=>({k:e.tagName.toLowerCase()+'.'+String(e.className).split(' ')[0],t:e.textContent.trim().slice(0,30),fs:getComputedStyle(e).fontSize,lh:getComputedStyle(e).lineHeight,box:R(e),lines:lines(e)}));
const p=c.querySelector('.cp-profile-portrait');return{card:R(c),portrait:p?R(p):null,copy:copy?R(copy):null,kids}})'''
FOCUS_JS = r'''((sel)=>{const e=document.querySelector(sel);if(!e)return null;e.scrollIntoView({block:'center'});e.focus({focusVisible:true});const s=getComputedStyle(e),r=e.getBoundingClientRect();
return{k:sel,focusVisible:e.matches(':focus-visible'),outline:[s.outlineStyle,s.outlineWidth,s.outlineColor,s.outlineOffset].join(' '),rect:[+r.left.toFixed(1),+r.top.toFixed(1),+r.width.toFixed(1),+r.height.toFixed(1)],inside:r.left>=0&&r.right<=innerWidth}})'''


def tall(label, essais):
    def run(s):
        if label in store.data.get('liste-profils-360', {}): return
        load(s, 'people', essais, 'light', 'ar', S360)
        ensure_view(s, 'list'); time.sleep(.5)
        m = s.js(CARD_JS + '("profile-ines-morel")'); time.sleep(.8); s.away()
        s.shot(f'visuel-liste-profils-360-{label}')
        m['top'] = s.js('(()=>{const c=document.querySelector(\'#content-index .cp-profile-card[data-profile-id="profile-ines-morel"]\');return c?+c.getBoundingClientRect().top.toFixed(1):null})()')
        store.data.setdefault('liste-profils-360', {})[label] = m; store.save(); print('tall', label, json.dumps(m, ensure_ascii=False)[:500], flush=True)
    return run


def focus(label, essais, route, vp, lang, sel, name):
    def run(s):
        if label in store.data.get('focus', {}).get(name, {}): return
        load(s, route, essais, 'light', lang, vp)
        ensure_view(s, 'grid'); time.sleep(.4)
        m = s.js(FOCUS_JS + '(' + json.dumps(sel) + ')'); time.sleep(.5)
        s.shot(f'visuel-focus-{name}-{label}')
        store.data.setdefault('focus', {}).setdefault(name, {})[label] = m; store.save(); print('focus', name, label, m, flush=True)
    return run


ACTIONS = [('Favoris', '#project-detail .cp-favorite:not(.cp-favorite-compact)'), ('Signaler', '#project-detail .cp-report-trigger'), ('Explorer un campus', '#project-detail .cp-project-campus')]
GEOM = ('()=>' + json.dumps([sel for _, sel in ACTIONS]) + '.map(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);'
        'const g=document.createRange();g.selectNodeContents(e);const lines=new Set([...g.getClientRects()].filter(q=>q.width>.5).map(q=>Math.round(q.top))).size;'
        'return{w:+r.width.toFixed(1),h:+r.height.toFixed(1),fs:s.fontSize,lines,over:e.scrollWidth>e.clientWidth+1}})')


def actions(label, essais):
    """Sidebar actions of the project page at 320 px AR: size and label lines, with each trial sheet alone (in place)."""
    def run(s):
        if label in store.data.get('actions-fiche-320', {}): return
        load(s, f'projects/{PID}?tab=overview', essais, 'light', 'ar', S)
        time.sleep(.6)
        y = s.js('(()=>{const e=document.querySelector("#project-detail .cp-report-trigger");if(!e)return 0;return Math.max(0,Math.round(e.getBoundingClientRect().top+scrollY-200))})()')
        s.scroll(y); s.shot(f'visuel-actions-fiche-320-{label}')
        m = {'direct': s.js(GEOM.replace('()=>', '(()=>', 1) + ')()')}
        if label == 'combo': m['toggle'] = toggle(s, GEOM)
        store.data.setdefault('actions-fiche-320', {})[label] = m; store.save(); print('actions', label, json.dumps(m, ensure_ascii=False)[:900], flush=True)
    return run


LUCIA_JS = r'''(()=>{const h=document.querySelector('#profile-detail .cp-profile-heading');const l=h?.querySelector('.cp-profile-login');const t=h?.querySelector('h1');const R=e=>{if(!e)return null;const r=e.getBoundingClientRect();return[+r.top.toFixed(1),+r.height.toFixed(1)]};
const P=['Pseudo Intra à renseigner','Intra login to be added','اسم مستخدم Intra غير محدد'];return{heading:R(h),title:t?[t.textContent.trim(),getComputedStyle(t).fontSize]:null,login:l?{dir:l.getAttribute('dir'),shown:l.checkVisibility({visibilityProperty:true}),text:l.textContent.trim()}:null,
 placeholders:P.map(p=>document.body.innerText.split(p).length-1).reduce((a,b)=>a+b,0),actions:R(document.querySelector('#profile-detail .cp-profile-actions, #profile-detail .cp-favorite'))}})()'''


def lucia(label, essais, name, vp, theme, lang):
    """Profile page without an Intra login (pseudo-manquant on a detail page) with the type trials."""
    def run(s):
        if label in store.data.get('fiche-lucia', {}).get(name, {}): return
        load(s, 'people/profile-lucia-roca?tab=overview', essais, theme, lang, vp)
        time.sleep(.6); m = s.js(LUCIA_JS)
        from lib import CLIP_JS, SPILL_JS
        m['clips'] = len(s.js(CLIP_JS, 30)); sp = s.js(SPILL_JS, 60); m['spills'] = len(sp['spills']); m['collisions'] = sp['collisionCount']; m['errors'] = s.errors(); m['overflow'] = s.overflow()
        s.shot(f'visuel-fiche-lucia-{name}-{label}')
        store.data.setdefault('fiche-lucia', {}).setdefault(name, {})[label] = m; store.save(); print('lucia', name, label, json.dumps(m, ensure_ascii=False)[:400], flush=True)
    return run


jobs = [tall('base', []), tall('echelle-unifiee', ['echelle-unifiee']), tall('combo', ALL9), actions('base', []), actions('combo', ALL9)]
for name, vp, theme, lang in (('ordinateur', D, 'light', 'fr'), ('petit-ar', S, 'light', 'ar')):
    for label, essais in (('base', []), ('pseudo-manquant', ['pseudo-manquant']), ('combo', ALL9)):
        jobs.append(lucia(label, essais, name, vp, theme, lang))
for label, essais in (('base', []), ('combo', ALL9)):
    jobs.append(focus(label, essais, 'projects', S, 'ar', '#content-list > .cp-card .cp-card-title-link', 'projets-320-ar'))
    jobs.append(focus(label, essais, 'people', D, 'fr', '#content-list > .cp-profile-card a', 'profils-1440'))
run_jobs(jobs, SHOTS, per=6)
