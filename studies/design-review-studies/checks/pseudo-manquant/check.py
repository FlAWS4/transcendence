"""Check for essai pseudo-manquant (14 Oct 2026): run with python3 -I checks/pseudo-manquant/check.py.

Before = study copy without trial, after = same URL with ?essais=pseudo-manquant. The globe module is
blocked: the trial only touches directory profile cards and the profile page.
Four short Chrome sessions, one after the other: 1 desktop, 2 phones, 3 re-renders, 4 load shifts.
Writes before/after screenshots and results.json next to this file (results-partiel.json when
session numbers are passed as arguments).
"""
import json, sys, time, pathlib
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, image_diff

ID = 'pseudo-manquant'
PENDING = ['Pseudo Intra à renseigner', 'Intra login to be added', 'اسم مستخدم Intra غير محدد']
LUCIA = 'people/profile-lucia-roca?tab=overview'      # fictional profile without login
LEILA = 'people/profile-leila-mansour?tab=overview'   # fictional profile with a demo login
SHORT = (1280, 640, False)                            # short desktop window for the menu densities

# Visible occurrences of the three placeholders (innerText skips display:none and visibility:hidden).
COUNT = '(()=>{const t=document.body.innerText;return ' + json.dumps(PENDING, ensure_ascii=False) + '.map(p=>t.split(p).length-1)})()'
# Grid rows: equal heights, level campus lines, and the state of every placeholder line.
GRID = r'''(() => {
 const index=document.querySelector('#content-index');
 if(!index||index.hidden||!index.getClientRects().length)return {visible:false};
 const rows=new Map();
 for(const card of index.querySelectorAll('.cp-profile-card')){const y=Math.round(card.getBoundingClientRect().top+scrollY);if(!rows.has(y))rows.set(y,[]);rows.get(y).push(card);}
 const out=[];
 for(const [y,row] of rows){
  const real=row.filter(card=>card.querySelector('.cp-card-copy > .cp-profile-login[dir]')).length;
  const lines=row.map(card=>card.querySelector('.cp-card-copy > .cp-profile-login:not([dir])')).filter(Boolean);
  const states=lines.map(line=>{const s=getComputedStyle(line);return s.display==='none'?'replie':s.visibility==='hidden'?'reserve':'visible';});
  out.push({y,cards:row.length,realLogins:real,placeholders:lines.length,states:[...new Set(states)],
   heights:[...new Set(row.map(card=>Math.round(card.getBoundingClientRect().height)))],
   campusTop:[...new Set(row.map(card=>Math.round(card.querySelector('.cp-card-copy > .cp-meta').getBoundingClientRect().top-card.getBoundingClientRect().top)))]});
 }
 const expected=out.every(row=>!row.placeholders||row.states.length===1&&row.states[0]===(row.realLogins?'reserve':'replie'));
 return {visible:true,view:index.dataset.view,columns:getComputedStyle(index.querySelector('.cp-grid')).gridTemplateColumns.split(' ').length,
  rows:out,unequalRows:out.filter(row=>row.heights.length>1).length,unlevelRows:out.filter(row=>row.campusTop.length>1).length,expected};
})()'''
# Keyboard order of the directory: every focusable control, in document order.
FOCUS = r'''(() => [...document.querySelectorAll('#content-index a[href],#content-index button,#content-index [tabindex]')].filter(e=>e.tabIndex>=0&&!e.disabled&&!e.closest('[hidden]')).map(e=>(e.closest('[data-profile-id]')?.dataset.profileId||'-')+':'+(e.getAttribute('class')||e.tagName)))()'''
# Placeholder line boxes in viewport coordinates (for the pixel-diff mask) and lines shown.
LINES = r'''(() => [...document.querySelectorAll('.cp-profile-login:not([dir])')].filter(l=>l.getClientRects().length).map(l=>{const r=l.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}))()'''
# List rows: heights, campus line position, and overlap of any text with the favourite heart.
LIST = r'''(() => {
 const inter=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
 const cards=[...document.querySelectorAll('#content-index .cp-profile-card')].map(card=>{
  const r=card.getBoundingClientRect(),fav=card.querySelector(':scope > .cp-favorite').getBoundingClientRect();let overlap=0;
  for(const el of card.querySelectorAll('.cp-card-copy > *')){if(!el.getClientRects().length||getComputedStyle(el).visibility==='hidden')continue;const range=document.createRange();range.selectNodeContents(el);for(const t of range.getClientRects())overlap+=inter(t,fav);}
  const line=card.querySelector('.cp-card-copy > .cp-profile-login:not([dir])');
  return {id:card.dataset.profileId,real:Boolean(card.querySelector('.cp-profile-login[dir]')),placeholder:line?getComputedStyle(line).display:null,h:Math.round(r.height),
   copyH:Math.round(card.querySelector('.cp-card-copy').getBoundingClientRect().height),campusTop:Math.round(card.querySelector('.cp-card-copy > .cp-meta').getBoundingClientRect().top-r.top),overlap:Math.round(overlap)};
 });
 return {view:document.querySelector('#content-index').dataset.view,cards:cards.length,heartOverlap:cards.reduce((n,c)=>n+c.overlap,0),
  heights:[...new Set(cards.map(c=>c.h))],shownPlaceholders:cards.filter(c=>c.placeholder&&c.placeholder!=='none').length,
  sample:cards.filter(c=>['profile-leila-mansour','profile-lucia-roca','profile-emma-de-smet'].includes(c.id))};
})()'''
# Profile page identity: login line, name, actions, menu position and the measured menu density.
DETAIL = r'''(() => {
 const q=s=>document.querySelector(s),R=e=>{if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom),h:Math.round(r.height)}};
 const login=q('#profile-detail .cp-profile-heading > .cp-profile-login'),h1=q('#profile-detail .cp-profile-heading > h1'),actions=q('#profile-detail .cp-profile-hero > .cp-profile-actions');
 const nav=q('#profile-detail .cp-profile-sidebar-nav'),picker=q('#profile-detail .cp-profile-section-switch');
 return {title:h1?.textContent,login:login?.textContent,loginShown:Boolean(login?.getClientRects().length),h1:R(h1),hero:R(q('#profile-detail .cp-profile-hero')),
  nameToActions:Math.round(actions.getBoundingClientRect().top-h1.getBoundingClientRect().bottom),
  menu:R(nav)||R(picker),density:q('#profile-detail .cp-profile-sidebar')?.dataset.detailDensity||null,overflow:document.documentElement.scrollWidth>innerWidth+1};
})()'''

results = {'essai': ID, 'date': '2026-10-14', 'page': 'baseline/content-preview.html', 'globe': 'bloqué', 'cases': []}


def record(s, name, **values):
    values['errors'] = s.errors()
    results['cases'].append({'case': name, **values})
    print(name, json.dumps(values, ensure_ascii=False)[:600], flush=True)
    return values


def guard(s, name, fn):
    """Run one measured block; an exception is recorded as a failed case instead of stopping the check."""
    try: fn()
    except Exception as error:
        results['cases'].append({'case': name, 'exception': repr(error)[:400], 'errors': s.errors()}); print('EXCEPTION', name, repr(error)[:400], flush=True)


def ax_name(s, selector):
    """Accessible name Chrome computes for the first element matching selector."""
    root = s.c.call('DOM.getDocument', {'depth': 0})['root']['nodeId']
    node = s.c.call('DOM.querySelector', {'nodeId': root, 'selector': selector}).get('nodeId')
    if not node: return None
    for item in s.c.call('Accessibility.getPartialAXTree', {'nodeId': node, 'fetchRelatives': False})['nodes']:
        if not item.get('ignored'): return item.get('name', {}).get('value')


def ax_node(s, selector):
    """Chrome accessibility node of the first element matching selector: ignored flag, role and name."""
    root = s.c.call('DOM.getDocument', {'depth': 0})['root']['nodeId']
    node = s.c.call('DOM.querySelector', {'nodeId': root, 'selector': selector}).get('nodeId')
    if not node: return None
    item = s.c.call('Accessibility.getPartialAXTree', {'nodeId': node, 'fetchRelatives': False})['nodes'][0]
    return {'ignored': bool(item.get('ignored')), 'role': item.get('role', {}).get('value'), 'name': item.get('name', {}).get('value')}


def layout(s, value):
    s.click('#content-layout-button'); s.click('#content-layout-menu [data-value=' + value + ']'); time.sleep(.8)
    s.away(); s.blur(); time.sleep(.2)
    assert s.js('document.querySelector("#content-index").dataset.view') == value, value


def diff_masked(a, b, boxes, scale):
    """Changed pixels inside / outside the before page's placeholder boxes (2 px margin)."""
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(a).convert('RGB'), dtype=int); y = np.asarray(Image.open(b).convert('RGB'), dtype=int)
    if x.shape != y.shape: return {'sameSize': False}
    mask = np.abs(x - y).sum(axis=2) > 24; inside = np.zeros_like(mask)
    for r in boxes:
        inside[max(0, int((r['y'] - 2) * scale)):int((r['y'] + r['h'] + 2) * scale), max(0, int((r['x'] - 2) * scale)):int((r['x'] + r['w'] + 2) * scale)] = True
    return {'sameSize': True, 'changed': int(mask.sum()), 'inside': int((mask & inside).sum()), 'outside': int((mask & ~inside).sum()), 'boxes': len(boxes)}


def zoom(s, name, first, second, factor=2):
    """Enlarged 16:10 crop of a before/after pair around two neighbouring cards, for the gallery card.
    Measured on the current page: the first grid row keeps its geometry with the trial."""
    from PIL import Image
    a, b = (s.js('(()=>{const r=document.querySelector(' + json.dumps(f'#content-index .cp-profile-card[data-profile-id="{pid}"]') + ').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()') for pid in (first, second))
    x0 = round(a['x'] - 8); width = round(b['x'] + b['w'] - x0 + 4); height = round(width / 1.6)
    y1 = round(a['y'] + a['h'] + 32); box = (x0, y1 - height, x0 + width, y1)
    for label in ('avant', 'apres'):
        image = Image.open(HERE / f'{label}-{name}.png').crop(box)
        image.resize((image.width * factor, image.height * factor), Image.LANCZOS).save(HERE / f'{label}-{name}-zoom.png')
    return {'box': box, 'factor': factor}


def pair(s, route, view, vue, viewport=D, theme='light', lang='fr', scroll=0, list_view=False):
    """Before/after screenshots and measurements of one view."""
    out = {}
    for label, essais in (('avant', []), ('apres', [ID])):
        s.open(route, essais=essais, theme=theme, lang=lang, viewport=viewport, block_globe=True)
        if list_view and s.js('document.querySelector("#content-index")?.dataset.view') != 'list': layout(s, 'list')
        if scroll: s.scroll(scroll)
        s.away(); s.blur()
        out[label] = {'counts': s.js(COUNT), 'lines': s.js(LINES), view: s.js({'grid': GRID, 'list': LIST, 'detail': DETAIL}[view]), 'overflow': s.overflow()}
        out[label]['shot'] = str(s.shot(f'{label}-{vue}').relative_to(HERE.parent.parent))
    return out


def only(case, *keys):
    keys += ('overflow',)
    return {k: ({key: v[key] for key in keys} if k in ('avant', 'apres') else v) for k, v in case.items()}


# Session 1 — desktop, French, light: directory grid, list rows, profile pages, untouched pages.
def session1(s):
    def grid_top():
        top = pair(s, 'people', 'grid', 'ordinateur')
        top['diff'] = diff_masked(HERE / 'avant-ordinateur.png', HERE / 'apres-ordinateur.png', top['avant']['lines'], 1)
        top['zoom'] = zoom(s, 'ordinateur', 'profile-leila-mansour', 'profile-lucia-roca')
        names = {}
        for label, essais in (('avant', []), ('apres', [ID])):
            s.open('people', essais=essais, viewport=D, block_globe=True)
            names[label] = {pid: ax_name(s, f'#content-index .cp-profile-card[data-profile-id="{pid}"] .cp-card-open') for pid in ('profile-lucia-roca', 'profile-leila-mansour')}
            names[label]['focusables'] = s.js(FOCUS)
        same_order = names['avant'].pop('focusables') == names['apres']['focusables']
        names['apres']['focusables'] = len(names['apres']['focusables'])
        record(s, 'grille-ordinateur-fr', mesures=only(top, 'counts', 'grid', 'shot'), nomsAccessibles=names, ordreClavierIdentique=same_order)
    guard(s, 'grille-ordinateur-fr', grid_top)
    guard(s, 'grille-ordinateur-fr-bas', lambda: record(s, 'grille-ordinateur-fr-bas', mesures=only(pair(s, 'people', 'grid', 'ordinateur-bas', scroll=820), 'counts', 'grid', 'shot')))
    guard(s, 'fiche-sans-pseudo-ordinateur-fr', lambda: record(s, 'fiche-sans-pseudo-ordinateur-fr', mesures=only(pair(s, LUCIA, 'detail', 'fiche-ordinateur'), 'counts', 'detail', 'shot')))
    def detail_ax():
        out = {}
        for label, essais in (('avant', []), ('apres', [ID])):
            s.open(LUCIA, essais=essais, viewport=D, block_globe=True)
            out[label] = {'ligne': ax_node(s, '#profile-detail .cp-profile-heading > .cp-profile-login'), 'titre': ax_node(s, '#profile-title')}
        record(s, 'fiche-sans-pseudo-accessibilite', **out)
    guard(s, 'fiche-sans-pseudo-accessibilite', detail_ax)
    def real_login():
        # A real (demo) login must stay identical: same page with and without the trial.
        shots = {}
        for label, essais in (('avant', []), ('apres', [ID])):
            s.open(LEILA, essais=essais, viewport=D, block_globe=True); s.away(); s.blur()
            shots[label] = {'detail': s.js(DETAIL), 'png': s.shot(f'temoin-{label}-fiche-avec-pseudo')}
        record(s, 'fiche-avec-pseudo-inchangee', login=shots['apres']['detail']['login'], loginShown=shots['apres']['detail']['loginShown'],
               pixelsDifferents=image_diff(shots['avant']['png'], shots['apres']['png']))
    guard(s, 'fiche-avec-pseudo-inchangee', real_login)
    def short_window():
        # Short desktop window: the baseline measures the identity to pick the menu density.
        dens = {}
        for label, essais in (('avant', []), ('apres', [ID])):
            s.open(LUCIA, essais=essais, viewport=SHORT, block_globe=True)
            dens[label] = s.js(DETAIL)
        record(s, 'fiche-sans-pseudo-fenetre-basse-1280x640', avant=dens['avant'], apres=dens['apres'])
    guard(s, 'fiche-sans-pseudo-fenetre-basse-1280x640', short_window)
    def other_pages():
        # Pages without profile cards are untouched (Explorer with the globe module blocked).
        other = {}
        for route in ('projects', 'journal', 'explore'):
            pngs = []
            for label, essais in (('avant', []), ('apres', [ID])):
                s.open(route, essais=essais, viewport=D, block_globe=True); s.away(); s.blur()
                pngs.append(s.shot(f'temoin-{label}-{route}'))
            other[route] = image_diff(*pngs)
        record(s, 'pages-sans-profil-inchangees', pixelsDifferents=other)
    guard(s, 'pages-sans-profil-inchangees', other_pages)
    guard(s, 'liste-ordinateur-fr', lambda: record(s, 'liste-ordinateur-fr', mesures=only(pair(s, 'people', 'list', 'liste-ordinateur', list_view=True), 'counts', 'list', 'shot')))


# Session 2 — phones: list (FR), small-screen list and profile in Arabic, grid in Arabic dark, English.
def session2(s):
    guard(s, 'liste-mobile-fr', lambda: record(s, 'liste-mobile-fr', mesures=only(pair(s, 'people', 'list', 'liste-mobile', viewport=M, scroll=300, list_view=True), 'counts', 'list', 'shot')))
    def small_list():
        small = {}
        for label, essais in (('avant', []), ('apres', [ID])):
            s.open('people', essais=essais, lang='ar', viewport=S, block_globe=True)
            if s.js('document.querySelector("#content-index").dataset.view') != 'list': layout(s, 'list')
            small[label] = {'counts': s.js(COUNT), 'list': s.js(LIST), 'direction': s.js('getComputedStyle(document.body).direction'), 'overflow': s.overflow()}
        record(s, 'liste-petit-ecran-ar', mesures=small)
        layout(s, 'grid')
    guard(s, 'liste-petit-ecran-ar', small_list)
    def ar_grid():
        ar = pair(s, 'people', 'grid', 'sombre-ar-mobile', viewport=M, theme='dark', lang='ar', scroll=200)
        ar['diff'] = diff_masked(HERE / 'avant-sombre-ar-mobile.png', HERE / 'apres-sombre-ar-mobile.png', ar['avant']['lines'], 2)
        record(s, 'grille-mobile-ar-sombre', mesures=only(ar, 'counts', 'grid', 'shot'))
    guard(s, 'grille-mobile-ar-sombre', ar_grid)
    # 320 px grid: French with screenshots (the placeholder wraps to two lines there), English and Arabic measured.
    guard(s, 'grille-petit-ecran-fr', lambda: record(s, 'grille-petit-ecran-fr', mesures=only(pair(s, 'people', 'grid', 'petit', viewport=S, scroll=470), 'counts', 'grid', 'shot')))
    def small_grid(lang):
        grid_s = {}
        for label, essais in (('avant', []), ('apres', [ID])):
            s.open('people', essais=essais, lang=lang, viewport=S, block_globe=True)
            grid_s[label] = {'counts': s.js(COUNT), 'grid': s.js(GRID), 'overflow': s.overflow()}
        record(s, 'grille-petit-ecran-' + lang, mesures=grid_s)
    for lang in ('en', 'ar'): guard(s, 'grille-petit-ecran-' + lang, lambda lang=lang: small_grid(lang))
    guard(s, 'fiche-sans-pseudo-mobile-en', lambda: record(s, 'fiche-sans-pseudo-mobile-en', mesures=only(pair(s, LUCIA, 'detail', 'fiche-en-mobile', viewport=M, lang='en'), 'counts', 'detail', 'shot')))
    def ar_detail():
        out = {}
        for label, essais in (('avant', []), ('apres', [ID])):
            s.open(LUCIA, essais=essais, lang='ar', viewport=S, block_globe=True)
            out[label] = {'counts': s.js(COUNT), 'detail': s.js(DETAIL)}
        record(s, 'fiche-sans-pseudo-petit-ecran-ar', mesures=out)
    guard(s, 'fiche-sans-pseudo-petit-ecran-ar', ar_detail)


# Session 3 — the trial follows the baseline's re-renders (language, sort, resize, navigation, layout, theme).
def session3(s):
    steps = []
    def step(name):
        steps.append({'etape': name, 'counts': s.js(COUNT), 'grid': s.js(GRID)})
        g = steps[-1]['grid']
        print(name, steps[-1]['counts'], g.get('columns'), g.get('expected'), g.get('unequalRows'), g.get('unlevelRows'), flush=True)
    def run():
        s.open('people', essais=[ID], viewport=D, block_globe=True); step('ouverture fr 1440')
        for lang in ('en', 'ar', 'fr'):
            s.js(f'(()=>{{horizonStudy.setLocale("{lang}");return true}})()'); time.sleep(.8); step(f'langue {lang} sans recharger')
        for value, label in (('oldest', 'tri plus anciens'), ('newest', 'tri plus récents')):
            s.click('#content-sort-button'); s.click(f'#content-sort-menu [data-value={value}]'); time.sleep(.8); s.away(); s.blur(); step(label)
        for size, label in ((M, '390'), (S, '320'), ((1024, 768, False), '1024'), (D, '1440')):
            s.viewport(*size); time.sleep(1); step('largeur ' + label)
        s.click('#content-index .cp-profile-card[data-profile-id="profile-lucia-roca"] .cp-card-open h2'); time.sleep(1)
        detail = s.js(DETAIL); detail['counts'] = s.js(COUNT); steps.append({'etape': 'clic vers la fiche de Lucía Roca', 'detail': detail})
        s.click('#profile-back'); time.sleep(1); s.away(); s.blur(); step('retour à l’annuaire')
        layout(s, 'list'); steps.append({'etape': 'présentation liste', 'counts': s.js(COUNT), 'list': s.js(LIST)})
        layout(s, 'grid'); step('retour en grille')
        s.settings('fr', 'dark'); time.sleep(.6); step('thème sombre par le menu du compte')
    try: guard(s, 'suivi-des-re-rendus', run)
    finally: record(s, 'suivi-des-re-rendus', etapes=steps)


# Session 4 — load: essai.mjs runs after the baseline's first render; measure layout shifts in view.
# Each shift keeps its sources and whether one of them lies in the directory grid (the trial's area).
SHIFTS = "window.qaShifts=[];try{new PerformanceObserver(list=>{for(const e of list.getEntries()){const nodes=(e.sources||[]).map(x=>x.node).filter(Boolean),el=n=>n.nodeType===1?n:n.parentElement;qaShifts.push({value:e.value,time:Math.round(e.startTime),sources:nodes.map(n=>el(n)?.className||n.nodeName).slice(0,5),inGrid:nodes.some(n=>Boolean(el(n)?.closest('#content-index .cp-grid')))})}}).observe({type:'layout-shift',buffered:true})}catch(error){}"
def session4(s):
    s.c.call('Page.addScriptToEvaluateOnNewDocument', {'source': SHIFTS})
    def load(sort):
        out = {}
        for viewport, vname in ((D, 'ordinateur'), (M, 'mobile')):
            for label, essais in (('avant', []), ('apres', [ID])):
                s.open('people', essais=essais, viewport=viewport, block_globe=True, settle=2)
                shifts = s.js('qaShifts')
                out[f'{label}-{vname}'] = {'somme': round(sum(x['value'] for x in shifts), 4), 'decalages': shifts, 'grille': s.js(GRID)['rows'][:3]}
        record(s, 'chargement-tri-' + sort, **out)
    guard(s, 'chargement-tri-par-defaut', lambda: load('par-defaut'))
    def oldest():
        s.open('people', essais=[], viewport=D, block_globe=True)
        s.click('#content-sort-button'); s.click('#content-sort-menu [data-value=oldest]'); time.sleep(.8)
        load('plus-anciens')
    guard(s, 'chargement-tri-plus-anciens', oldest)


def summary():
    cases = {c['case']: c for c in results['cases'] if 'exception' not in c}
    paired = [c for c in cases.values() if 'mesures' in c and 'apres' in c['mesures']]
    counts = [c['mesures']['apres']['counts'] for c in paired]
    counts_before = [c['mesures']['avant']['counts'] for c in paired]
    steps = cases.get('suivi-des-re-rendus', {}).get('etapes', [])
    counts += [st['counts'] if 'counts' in st else st['detail']['counts'] for st in steps]
    grids = [c['mesures']['apres']['grid'] for c in paired if 'grid' in c['mesures']['apres']] + [st['grid'] for st in steps if 'grid' in st]
    level = [(c['mesures']['avant']['grid']['unlevelRows'], c['mesures']['apres']['grid']['unlevelRows']) for c in paired if 'grid' in c['mesures']['apres']]
    lists = [c['mesures']['apres']['list'] for c in paired if 'list' in c['mesures']['apres']]
    details = [c['mesures']['apres']['detail'] for c in paired if 'detail' in c['mesures']['apres']]
    real = cases.get('fiche-avec-pseudo-inchangee', {})
    results['acceptation'] = {
        'casMesures': len(results['cases']), 'exceptions': [c['case'] for c in results['cases'] if 'exception' in c],
        'placeholdersVisiblesAvant': sum(sum(c) for c in counts_before),
        'texteAbsentFrEnAr': bool(counts) and all(sum(c) == 0 for c in counts),
        'hauteursEgalesParRangee': bool(grids) and all(g['unequalRows'] == 0 for g in grids),
        'etatAttenduParRangee': bool(grids) and all(g['expected'] for g in grids),
        'rangeesDesaligneesAvantApres': level,
        'listeSansChevauchementDuCoeur': bool(lists) and all(l['heartOverlap'] == 0 and l['shownPlaceholders'] == 0 for l in lists),
        'fichesSansPseudoAffiche': bool(details) and all(not d['loginShown'] for d in details),
        'vraisPseudosConserves': bool(real.get('loginShown')) and real.get('pixelsDifferents') == 0,
        'autresPagesInchangees': all(v == 0 for v in cases.get('pages-sans-profil-inchangees', {}).get('pixelsDifferents', {'absent': 1}).values()),
        'ordreClavierIdentique': bool(cases.get('grille-ordinateur-fr', {}).get('ordreClavierIdentique')),
        'ligneAbsenteDeLArbreAccessible': bool(cases.get('fiche-sans-pseudo-accessibilite', {}).get('apres', {}).get('ligne', {}).get('ignored')),
        'aucunDecalageDesCartesAuChargement': all(cases.get(k) for k in ('chargement-tri-par-defaut', 'chargement-tri-plus-anciens')) and not any(x['inGrid'] for k in ('chargement-tri-par-defaut', 'chargement-tri-plus-anciens') for v in cases[k].values() if isinstance(v, dict) and 'decalages' in v for x in v['decalages']),
        'aucuneErreur': all(not c['errors'] for c in results['cases']),
    }
    print(json.dumps(results['acceptation'], ensure_ascii=False))


if __name__ == '__main__':
    only_sessions = sys.argv[1:] or ['1', '2', '3', '4']
    try:
        for number, fn in (('1', session1), ('2', session2), ('3', session3), ('4', session4)):
            if number not in only_sessions: continue
            s = Session(HERE)
            try: fn(s)
            finally: s.close()
    finally:
        summary()
        (HERE / ('results.json' if only_sessions == ['1', '2', '3', '4'] else 'results-partiel.json')).write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
