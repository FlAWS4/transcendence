"""Adversarial re-check of essai pseudo-manquant (14 Oct 2026): python3 -I checks/pseudo-manquant/contre-verification.py 1|2|3|4|5|fusion.

Independent of check.py (own measures): every directory page, not only the first; the full Chrome
accessibility tree; a text-node walk with checkVisibility(); arrival from Explorer without reload;
the people filter dialog, language and theme changed through the account menu; intermediate widths;
keyboard focus; the list view on every page; Explorer with the real globe (trial vs baseline vs
baseline); pages the trial must not touch (exact pixels) and a combination with the other trials
that restyle directory cards; exact pixel masks of the cited captures and a desktop list capture
scrolled to the rows without login. Each session writes contre-verification-s<n>.json; "fusion" merges
them into contre-verification.json with the acceptance summary. The run of 18:56, cut by a network
outage, stays in contre-verification-partiel.json.
"""
import hashlib, json, sys, time, pathlib
HERE = pathlib.Path(__file__).resolve().parent
STUDY_ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S

ID = 'pseudo-manquant'
PENDING = ['Pseudo Intra à renseigner', 'Intra login to be added', 'اسم مستخدم Intra غير محدد']
LUCIA = 'people/profile-lucia-roca?tab=overview'
LEILA = 'people/profile-leila-mansour?tab=overview'
P = json.dumps(PENDING, ensure_ascii=False)
# Other trials that restyle directory cards or their grid (combination check, informational).
CARD_TRIALS = ['lisibilite-textes', 'titres-forts', 'echelle-unifiee', 'une-colonne-320']

# Text nodes holding a placeholder, and how many of them Chrome reports as visible.
TEXT = '(()=>{const P=' + P + ',w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),o={nodes:0,visible:0,where:[]};for(let n;(n=w.nextNode());){if(!P.some(p=>n.nodeValue.includes(p)))continue;o.nodes++;const e=n.parentElement;if(e.checkVisibility({visibilityProperty:true})){o.visible++;if(o.where.length<4)o.where.push(e.closest("[data-profile-id]")?.dataset.profileId||e.className)}}o.innerText=P.map(p=>document.body.innerText.split(p).length-1).reduce((a,b)=>a+b,0);return o})()'
# Grid rows (cards sharing a top edge): heights, positions of campus and cohort, line heights, states.
GRID = r'''(() => {
 const index=document.querySelector('#content-index');
 if(!index||index.hidden||!index.getClientRects().length)return {visible:false};
 const cards=[...index.querySelectorAll('.cp-profile-card')],rows=[];
 for(const card of cards){const t=card.getBoundingClientRect().top;let row=rows.find(r=>Math.abs(r.top-t)<1);if(!row)rows.push(row={top:t,cards:[]});row.cards.push(card);}
 const rel=(card,sel)=>{const e=card.querySelector(sel);if(!e||!e.getClientRects().length)return null;return e.getBoundingClientRect().top-card.getBoundingClientRect().top;};
 const spread=values=>{const v=values.filter(x=>x!==null);return v.length?Math.round((Math.max(...v)-Math.min(...v))*10)/10:0;};
 const out=rows.map(row=>{
  const real=row.cards.map(c=>c.querySelector('.cp-card-copy > .cp-profile-login[dir]')).filter(Boolean);
  const pend=row.cards.map(c=>c.querySelector('.cp-card-copy > .cp-profile-login:not([dir])')).filter(Boolean);
  const states=pend.map(l=>{const s=getComputedStyle(l);return s.display==='none'?'replie':s.visibility==='hidden'?'reserve':'visible';});
  return {n:row.cards.length,real:real.length,pending:pend.length,states:[...new Set(states)],
   heightSpread:spread(row.cards.map(c=>c.getBoundingClientRect().height)),metaSpread:spread(row.cards.map(c=>rel(c,'.cp-card-copy > .cp-meta'))),
   cohortSpread:spread(row.cards.map(c=>rel(c,'.cp-card-copy > .cp-profile-cohort'))),
   height:Math.round(row.cards[0].getBoundingClientRect().height),
   pendingH:[...new Set(pend.filter(l=>l.getClientRects().length).map(l=>Math.round(l.getBoundingClientRect().height*10)/10))],
   realH:[...new Set(real.map(l=>Math.round(l.getBoundingClientRect().height*10)/10))]};
 });
 return {visible:true,columns:getComputedStyle(document.querySelector('#content-list')).gridTemplateColumns.split(' ').length,cards:cards.length,
  page:document.querySelector('#content-pagination [aria-current=page]')?.dataset.page||'1',rows:out.length,rowHeights:out.map(r=>r.height),
  wrongState:out.filter(r=>r.pending&&(r.states.length!==1||r.states[0]!==(r.real?'reserve':'replie'))).length,
  shownPlaceholders:out.filter(r=>r.states.includes('visible')).length,unequalHeights:out.filter(r=>r.heightSpread>1).length,
  unlevelCampus:out.filter(r=>r.metaSpread>1).length,unlevelCohort:out.filter(r=>r.cohortSpread>1).length,
  reserveNotOneLoginLine:out.filter(r=>r.real&&r.states[0]==='reserve'&&r.pendingH.some(h=>!r.realH.includes(h))).length,
  overflow:document.documentElement.scrollWidth>innerWidth+1};
})()'''
# List rows: text under the favourite heart, placeholders still shown, row heights, overflow.
LIST = r'''(() => {
 const inter=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
 const cards=[...document.querySelectorAll('#content-index .cp-profile-card')];let overlap=0,shown=0;
 for(const card of cards){const fav=card.querySelector(':scope > .cp-favorite').getBoundingClientRect();
  for(const el of card.querySelectorAll('.cp-card-copy *')){if(!el.checkVisibility({visibilityProperty:true}))continue;for(const node of el.childNodes){if(node.nodeType!==3||!node.nodeValue.trim())continue;const range=document.createRange();range.selectNodeContents(node);for(const t of range.getClientRects())overlap+=inter(t,fav);}}
  const line=card.querySelector('.cp-card-copy > .cp-profile-login:not([dir])');if(line&&line.checkVisibility({visibilityProperty:true}))shown++;}
 return {view:document.querySelector('#content-index').dataset.view,cards:cards.length,page:document.querySelector('#content-pagination [aria-current=page]')?.dataset.page||'1',
  heartOverlap:Math.round(overlap),shownPlaceholders:shown,heights:[...new Set(cards.map(c=>Math.round(c.getBoundingClientRect().height)))].sort((a,b)=>a-b),overflow:document.documentElement.scrollWidth>innerWidth+1};
})()'''
DETAIL = r'''(() => {const l=document.querySelector('#profile-detail .cp-profile-heading > .cp-profile-login'),h=document.querySelector('#profile-title');
 return {lang:document.documentElement.lang,theme:document.documentElement.dataset.theme||null,title:h?.textContent,loginShown:Boolean(l?.checkVisibility({visibilityProperty:true})),loginText:l?.textContent||null,overflow:document.documentElement.scrollWidth>innerWidth+1};})()'''
GRID_TEXT = 'Object.assign(' + GRID + ',{text:' + TEXT + '})'
SHIFTS = "window.qaShifts=[];try{new PerformanceObserver(list=>{for(const e of list.getEntries()){const nodes=(e.sources||[]).map(x=>x.node).filter(Boolean),el=n=>n.nodeType===1?n:n.parentElement;qaShifts.push({value:e.value,recentInput:e.hadRecentInput,sources:nodes.map(n=>el(n)?.className||n.nodeName).slice(0,5),inGrid:nodes.some(n=>Boolean(el(n)?.closest('#content-list')))})}}).observe({type:'layout-shift',buffered:true})}catch(error){}"
# Rules of the trial's stylesheet that match a rendered element (for Explorer).
REACH = r'''(()=>{const sheet=[...document.styleSheets].find(s=>s.ownerNode?.dataset?.essai==='pseudo-manquant');if(!sheet)return{loaded:false};
 const rules=[...sheet.cssRules].filter(r=>r instanceof CSSStyleRule).map(r=>({rule:r.selectorText.slice(0,60),matched:document.querySelectorAll(r.selectorText).length,rendered:[...document.querySelectorAll(r.selectorText)].filter(e=>e.getClientRects().length).length}));
 return{loaded:true,rules,rendered:rules.reduce((n,r)=>n+r.rendered,0),marked:document.querySelectorAll('[data-pseudo-manquant]').length,markedOutsideIndex:[...document.querySelectorAll('[data-pseudo-manquant]')].filter(e=>!e.closest('#content-index')).length}})()'''
# Rows whose campus lines are not level: name, login line (top and height in the card) and campus top per card.
UNLEVEL = r'''(() => {
 const cards=[...document.querySelectorAll('#content-index .cp-profile-card')],rows=[];
 for(const card of cards){const t=card.getBoundingClientRect().top;let row=rows.find(r=>Math.abs(r.top-t)<1);if(!row)rows.push(row={top:t,cards:[]});row.cards.push(card);}
 const rel=(c,sel)=>{const e=c.querySelector(sel);if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return [Math.round(r.top-c.getBoundingClientRect().top),Math.round(r.height)]};
 const state=l=>!l?null:l.hasAttribute('dir')?'vrai':getComputedStyle(l).display==='none'?'replie':getComputedStyle(l).visibility==='hidden'?'reserve':'visible';
 return rows.map((row,i)=>({rangee:i+1,cartes:row.cards.map(c=>({id:c.dataset.profileId,nom:rel(c,'h2'),pseudo:rel(c,'.cp-card-copy > .cp-profile-login'),etat:state(c.querySelector('.cp-card-copy > .cp-profile-login')),campus:rel(c,'.cp-card-copy > .cp-meta')}))}))
  .filter(r=>new Set(r.cartes.map(c=>c.campus&&c.campus[0])).size>1);
})()'''
GRID_KEYS = ('cards', 'rows', 'wrongState', 'shownPlaceholders', 'unequalHeights', 'unlevelCampus', 'unlevelCohort', 'reserveNotOneLoginLine', 'overflow')

results = {'essai': ID, 'date': '2026-10-14', 'role': 'contre-vérification indépendante de check.py', 'page': 'baseline/content-preview.html', 'cases': []}


def record(s, name, **values):
    values['errors'] = s.errors() if s else []
    results['cases'].append({'case': name, **values})
    print(name, json.dumps(values, ensure_ascii=False)[:500], flush=True)


def guard(s, name, fn):
    try: fn()
    except Exception as error:
        results['cases'].append({'case': name, 'exception': repr(error)[:400], 'errors': s.errors()}); print('EXCEPTION', name, repr(error)[:400], flush=True)
        if 'pipe closed' in str(error): raise


def ax_hits(s):
    """Unignored accessibility nodes whose name, description or value still holds a placeholder."""
    nodes = s.c.call('Accessibility.getFullAXTree', {}, timeout=60)['nodes']
    hits = []
    for n in nodes:
        if n.get('ignored'): continue
        for key in ('name', 'description', 'value'):
            v = (n.get(key) or {}).get('value')
            if isinstance(v, str) and any(p in v for p in PENDING): hits.append(v[:90]); break
    return {'nodes': len(nodes), 'hits': len(hits), 'sample': hits[:2]}


CURRENT = 'document.querySelector("#content-pagination [aria-current=page]")?.dataset.page||"1"'


def pages(s, measure):
    """Measure page 1, then follow the "next" link (re-render without reload) to the last page.
    The link is activated by script: on phones the floating pile can cover it, and a missed pointer
    click once re-measured the same page. Every step must really reach the next page number."""
    out = [s.js(measure)]
    for _ in range(12):
        if not s.js('Boolean(document.querySelector("#content-pagination a.cp-pagination-next"))'): break
        before = s.js(CURRENT)
        s.js('(()=>{document.querySelector("#content-pagination a.cp-pagination-next").click();return true})()'); time.sleep(.9); s.away(); s.blur()
        after = s.js(CURRENT)
        assert int(after) == int(before) + 1, f'pagination stuck on page {before} -> {after}'
        out.append(s.js(measure))
    return out


def layout(s, value):
    s.click('#content-layout-button'); s.click('#content-layout-menu [data-value=' + value + ']'); time.sleep(.8); s.away(); s.blur()
    assert s.js('document.querySelector("#content-index").dataset.view') == value, value


def sort(s, value):
    s.click('#content-sort-button'); s.click(f'#content-sort-menu [data-value={value}]'); time.sleep(.8); s.away(); s.blur()


def sweep(s, name, viewport, lang='fr', theme='light'):
    """Every directory page before/after: the trial must not add any unlevel or unequal row."""
    out = {}
    for label, essais in (('avant', []), ('apres', [ID])):
        s.open('people', essais=essais, theme=theme, lang=lang, viewport=viewport, block_globe=True)
        out[label] = pages(s, GRID_TEXT)
    a, b = out['avant'], out['apres']
    record(s, name, pages=len(b), cards=sum(p['cards'] for p in b), lang=s.js('document.documentElement.lang'), theme=s.js('document.documentElement.dataset.theme||null'),
           apres={k: sum(p[k] for p in b) for k in ('wrongState', 'shownPlaceholders', 'unequalHeights', 'unlevelCampus', 'unlevelCohort', 'reserveNotOneLoginLine')},
           avant={k: sum(p[k] for p in a) for k in ('unequalHeights', 'unlevelCampus', 'unlevelCohort')},
           texteVisibleAvant=sum(p['text']['visible'] for p in a), texteVisibleApres=sum(p['text']['visible'] for p in b),
           innerTextAvant=sum(p['text']['innerText'] for p in a), innerTextApres=sum(p['text']['innerText'] for p in b),
           rangeesAvantApres=[(p['rows'], q['rows']) for p, q in zip(a, b)], colonnes=sorted({p['columns'] for p in b}),
           hauteursPage1={'avant': a[0]['rowHeights'], 'apres': b[0]['rowHeights']}, overflowApres=any(p['overflow'] for p in b))


def filter_dialog(s, values):
    """Open the people filter dialog, reset it, tick the given values (inputs may sit in closed groups) and apply."""
    s.click('#content-category-button'); time.sleep(.6)
    assert s.js('Boolean(document.querySelector("#content-category-dialog")?.open)'), 'filter dialog not open'
    s.click('#content-category-dialog .cp-project-filter-reset')
    for value in values:
        assert s.js('(()=>{const i=document.querySelector(\'#content-category-dialog input[value="' + value + '"]\');if(!i)return false;i.click();return i.checked})()'), value
    s.click('#content-category-dialog .cp-project-filter-apply'); time.sleep(.9); s.away(); s.blur()
    assert not s.js('Boolean(document.querySelector("#content-category-dialog")?.open)'), 'filter dialog still open'


# Session 1 — desktop: all pages, accessibility tree, arrival from Explorer, filter, account menu, widths, focus, arrival page.
def session1(s):
    s.c.call('Page.addScriptToEvaluateOnNewDocument', {'source': SHIFTS}); s.c.call('Accessibility.enable')
    guard(s, 'toutes-pages-ordinateur-fr', lambda: sweep(s, 'toutes-pages-ordinateur-fr', D))

    def tree():
        out = {}
        for label, essais in (('avant', []), ('apres', [ID])):
            for route, lang in (('people', 'fr'), ('people', 'ar'), (LUCIA, 'fr'), (LUCIA, 'en')):
                s.open(route, essais=essais, lang=lang, viewport=D, block_globe=True)
                out[f'{label} {route.split("?")[0]} {lang}'] = {'ax': ax_hits(s), 'texte': s.js(TEXT)}
        record(s, 'arbre-accessibilite-et-texte', **out)
    guard(s, 'arbre-accessibilite-et-texte', tree)

    def from_explore():
        # Oldest first: the top rows have no login and collapse, inside the viewport.
        out = {}
        for label, essais in (('avant', []), ('apres', [ID])):
            s.open('people', essais=essais, viewport=D, block_globe=True); sort(s, 'oldest')
            s.open('explore', essais=essais, viewport=D, block_globe=True)
            s.js('(()=>{qaShifts=[];return true})()'); s.click('button[data-section=people]'); time.sleep(1.6); s.away()
            g = s.js(GRID); shifts = s.js('qaShifts')
            out[label] = {'route': s.js('location.hash'), 'grille': {k: g.get(k) for k in ('wrongState', 'shownPlaceholders', 'unequalHeights', 'unlevelCampus')},
                          'etatsPremieresRangees': s.js('(()=>[...new Set([...document.querySelectorAll("#content-list .cp-profile-card")].slice(0,10).map(c=>{const l=c.querySelector(".cp-profile-login:not([dir])");if(!l)return"pseudo";const s=getComputedStyle(l);return s.display==="none"?"replie":s.visibility==="hidden"?"reserve":"visible"}))])()'),
                          'decalagesGrille': [x for x in shifts if x['inGrid']], 'decalages': len(shifts)}
            sort(s, 'newest')
        record(s, 'arrivee-depuis-explorer-tri-plus-anciens', **out)
    guard(s, 'arrivee-depuis-explorer-tri-plus-anciens', from_explore)

    def status_filter():
        # The people filter is a modal dialog (presentation "dialog"): tick, apply, measure, then reset.
        s.open('people', essais=[ID], viewport=D, block_globe=True)
        steps = []
        s.click('#content-category-button'); time.sleep(.6)
        status = s.js('[...document.querySelectorAll("#content-category-dialog [data-facet=status] input")].map(i=>i.value)')
        s.key('Escape'); time.sleep(.4)
        for label, values in (('arrivee-2024', ['arrival:2024']), ('statut-' + status[0], [status[0]]), ('arrivee-2022-et-2023', ['arrival:2022', 'arrival:2023']), ('tous', [])):
            filter_dialog(s, values)
            g = s.js(GRID_TEXT)
            steps.append({'filtre': label, 'compte': s.js('document.querySelector("#content-count").textContent'), **{k: g.get(k) for k in GRID_KEYS}, 'texteVisible': g['text']['visible']})
        record(s, 'filtre-statut-sans-recharger', optionsStatut=status, etapes=steps)
    guard(s, 'filtre-statut-sans-recharger', status_filter)

    def account_menu():
        # Language and theme through the account menu, as a visitor would change them.
        steps = []
        s.open('people', essais=[ID], viewport=D, block_globe=True)
        for lang, theme in (('ar', 'light'), ('en', 'dark'), ('fr', 'light')):
            s.settings(lang, theme); time.sleep(.6)
            g = s.js(GRID)
            steps.append({'vue': 'annuaire', 'lang': s.js('document.documentElement.lang'), 'theme': s.js('document.documentElement.dataset.theme||null'), 'dir': s.js('getComputedStyle(document.body).direction'), 'texte': s.js(TEXT),
                          'grille': {k: g.get(k) for k in ('wrongState', 'shownPlaceholders', 'unequalHeights', 'unlevelCampus', 'overflow')}})
        s.open(LUCIA, essais=[ID], viewport=D, block_globe=True)
        for lang, theme in (('ar', 'dark'), ('en', 'light'), ('fr', 'light')):
            s.settings(lang, theme); time.sleep(.6)
            steps.append({'vue': 'fiche Lucía Roca', 'detail': s.js(DETAIL), 'texte': s.js(TEXT)})
        record(s, 'langue-et-theme-par-le-menu-du-compte', etapes=steps)
    guard(s, 'langue-et-theme-par-le-menu-du-compte', account_menu)

    def widths():
        s.open('people', essais=[ID], viewport=D, block_globe=True)
        steps = []
        for w in (1280, 1100, 900, 768, 601, 600, 480, 1440):
            s.viewport(w, 900, False); time.sleep(.7)
            g = s.js(GRID)
            steps.append({'largeur': w, **{k: g.get(k) for k in ('columns', 'rows', 'wrongState', 'shownPlaceholders', 'unequalHeights', 'unlevelCampus', 'overflow')}})
        record(s, 'largeurs-intermediaires-sans-recharger', etapes=steps)
    guard(s, 'largeurs-intermediaires-sans-recharger', widths)

    def focus():
        # Tab from the top to Lucía Roca's card: same number of steps and the same focus ring.
        out = {}
        for label, essais in (('avant', []), ('apres', [ID])):
            s.open('people', essais=essais, viewport=D, block_globe=True)
            steps = None
            for i in range(1, 90):
                s.key('Tab')
                if s.js('Boolean(document.activeElement?.closest("[data-profile-id=profile-lucia-roca]"))'): steps = i; break
            out[label] = {'tabulations': steps, 'focus': s.js('(()=>{const e=document.activeElement,c=getComputedStyle(e);return{tag:e.tagName,cls:e.className,visible:e.matches(":focus-visible"),outline:c.outlineStyle+" "+c.outlineWidth+" "+c.outlineColor,offset:c.outlineOffset,shadow:c.boxShadow.slice(0,80)}})()')}
            r = s.js('(()=>{const r=document.activeElement.closest("[data-profile-id]").getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})()')
            out[label]['carte'] = r
        record(s, 'focus-clavier-carte-sans-pseudo', **out)
    guard(s, 'focus-clavier-carte-sans-pseudo', focus)

    def arrival():
        # The arrival entry (index.html) loads the trial too: it must install without error.
        s.open('', essais=[ID], viewport=D, block_globe=True, page='index.html')
        record(s, 'page-arrivee-index', pret=s.js('document.documentElement.dataset.essaisReady||null'), essais=s.js('document.documentElement.dataset.essais'),
               feuille=s.js('Boolean([...document.styleSheets].find(x=>x.ownerNode?.dataset?.essai==="pseudo-manquant"))'), texte=s.js(TEXT))
    guard(s, 'page-arrivee-index', arrival)


# Session 2 — phones: every page in FR/EN/AR (light and dark), then the list view on every page.
def session2(s):
    for name, viewport, lang, theme in (('toutes-pages-mobile-fr', M, 'fr', 'light'), ('toutes-pages-petit-fr', S, 'fr', 'light'),
                                        ('toutes-pages-petit-en', S, 'en', 'light'), ('toutes-pages-petit-ar', S, 'ar', 'light'),
                                        ('toutes-pages-mobile-ar-sombre', M, 'ar', 'dark')):
        guard(s, name, lambda name=name, viewport=viewport, lang=lang, theme=theme: sweep(s, name, viewport, lang, theme))

    def lists():
        out = {}
        for vname, viewport, lang in (('petit-fr', S, 'fr'), ('petit-ar', S, 'ar'), ('mobile-en', M, 'en'), ('ordinateur-fr', D, 'fr')):
            for label, essais in (('avant', []), ('apres', [ID])):
                s.open('people', essais=essais, lang=lang, viewport=viewport, block_globe=True)
                if s.js('document.querySelector("#content-index").dataset.view') != 'list': layout(s, 'list')
                out[f'{label}-{vname}'] = pages(s, LIST)
        summary = {k: {'pages': len(v), 'cards': sum(p['cards'] for p in v), 'heartOverlap': sum(p['heartOverlap'] for p in v), 'shownPlaceholders': sum(p['shownPlaceholders'] for p in v),
                       'heights': sorted({h for p in v for h in p['heights']}), 'overflow': any(p['overflow'] for p in v)} for k, v in out.items()}
        record(s, 'liste-toutes-pages', resume=summary)
        layout(s, 'grid')
    guard(s, 'liste-toutes-pages', lists)


# Session 3 — Explorer with the real globe: trial vs baseline, and baseline vs itself (noise).
def session3(s):
    from PIL import Image
    import numpy as np
    out = {}
    for name, essais in (('avant', []), ('apres', [ID]), ('avant-bis', [])):
        s.open('explore', essais=essais, viewport=D, block_globe=False, settle=3)
        out[name] = {'globe': s.js('Boolean(document.querySelector("#globe canvas"))&&document.querySelector("#loading")?.hidden===true')}
        if essais: out['portee'] = s.js(REACH)
        s.shot(f'{name}-explorer-globe')

    def exact(a, b):
        x = np.asarray(Image.open(HERE / f'{a}-explorer-globe.png').convert('RGB'), dtype=int); y = np.asarray(Image.open(HERE / f'{b}-explorer-globe.png').convert('RGB'), dtype=int)
        return int((np.abs(x - y).sum(axis=2) > 0).sum()) if x.shape == y.shape else 'tailles différentes'
    record(s, 'explorer-vrai-globe', **out, pixelsEssaiContreBase=exact('avant', 'apres'), pixelsBaseContreBase=exact('avant', 'avant-bis'))


# Session 4 — pages the trial must not touch (exact pixels, phones, dark Arabic) and the card trials combined.
def session4(s):
    from PIL import Image
    import numpy as np

    def identity():
        out = {}
        for vname, route, viewport, lang, theme in (('fiche-leila-mobile-ar-sombre', LEILA, M, 'ar', 'dark'), ('projets-mobile-ar-sombre', 'projects', M, 'ar', 'dark'),
                                                     ('chronique-petit-fr', 'journal/journal-an-evening-debugging?tab=article', S, 'fr', 'light'), ('explorer-bloque-mobile-en', 'explore', M, 'en', 'light')):
            shots = []
            for label, essais in (('avant', []), ('apres', [ID])):
                s.open(route, essais=essais, theme=theme, lang=lang, viewport=viewport, block_globe=True)
                shots.append(s.shot(f'_temoins-s4-{label}-{vname}'))
            x, y = (np.asarray(Image.open(p).convert('RGB'), dtype=int) for p in shots)
            out[vname] = int((np.abs(x - y).sum(axis=2) > 0).sum()) if x.shape == y.shape else 'tailles différentes'
            for p in shots: p.unlink()
        record(s, 'pages-non-concernees-pixels-exacts', pixelsDifferents=out)
    guard(s, 'pages-non-concernees-pixels-exacts', identity)

    def combined():
        out = {}
        for vname, viewport, lang, theme in (('ordinateur-fr', D, 'fr', 'light'), ('petit-ar', S, 'ar', 'light'), ('mobile-fr-sombre', M, 'fr', 'dark')):
            for label, essais in (('sans', CARD_TRIALS), ('avec', CARD_TRIALS + [ID])):
                s.open('people', essais=essais, theme=theme, lang=lang, viewport=viewport, block_globe=True)
                g = s.js(GRID_TEXT)
                out[f'{label}-{vname}'] = {'actifs': s.js('document.documentElement.dataset.essais'), **{k: g.get(k) for k in GRID_KEYS}, 'texteVisible': g['text']['visible'], 'colonnes': g.get('columns'),
                                           'rangeesDecalees': s.js(UNLEVEL)}
        record(s, 'combinaison-essais-des-cartes', essais=CARD_TRIALS, mesures=out)
    guard(s, 'combinaison-essais-des-cartes', combined)


# Session 5 — exact pixel masks of the cited captures, and a desktop list capture scrolled to rows without login.
LINES = r'''(() => [...document.querySelectorAll('.cp-profile-login:not([dir])')].filter(l=>l.getClientRects().length).map(l=>{const r=l.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}))()'''


def session5(s):
    from PIL import Image
    import numpy as np

    # Translucent overlays (backdrop-filter, also on ::before/::after as on the dock) blur whatever lies
    # behind them, placeholder text included.
    GLASS = r'''(() => [...document.querySelectorAll('body *')].filter(e=>{const f=p=>{const v=getComputedStyle(e,p).backdropFilter;return Boolean(v&&v!=='none')};return (f(null)||f('::before')||f('::after'))&&e.getClientRects().length}).map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}).filter(r=>r[2]&&r[3]&&r[1]<innerHeight&&r[1]+r[3]>0))()'''

    def paint(shape, boxes, scale, margin):
        area = np.zeros(shape, dtype=bool)
        for bx, by, bw, bh in boxes:
            area[max(0, int((by - margin) * scale)):max(0, int((by + bh + margin) * scale) + 1), max(0, int((bx - margin) * scale)):max(0, int((bx + bw + margin) * scale) + 1)] = True
        return area

    def masked(a, b, lines, glass, scale):
        x = np.asarray(Image.open(HERE / a).convert('RGB'), dtype=int); y = np.asarray(Image.open(HERE / b).convert('RGB'), dtype=int)
        delta = np.abs(x - y).sum(axis=2); changed = delta > 0
        inside = paint(changed.shape, lines, scale, 2); under = paint(changed.shape, glass, scale, 0) & ~inside
        rest = changed & ~inside & ~under
        # Pixels left over: are they glyph ink just past a line box (Arabic marks overflow the line box)?
        near = {m: int((rest & ~paint(changed.shape, lines, scale, m)).sum()) for m in (4, 6, 8)}
        ys, xs = np.nonzero(rest)
        return {'changed': int(changed.sum()), 'insideLines': int((changed & inside).sum()), 'underGlassOnly': int((changed & under).sum()), 'elsewhere': int(rest.sum()),
                'elsewhereBeyondMargin': near, 'elsewhereBox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())] if len(xs) else None,
                'maxDeltaElsewhere': int(delta[rest].max()) if rest.any() else 0,
                'maxDeltaUnderGlass': int(delta[changed & under].max()) if (changed & under).any() else 0, 'lineBoxes': len(lines), 'glassBoxes': len(glass),
                'lines': [[round(v * scale) for v in box] for box in lines]}

    def masks():
        out = {}
        # Same views and scroll positions as check.py took them (avant-ordinateur at 0, avant-sombre-ar-mobile at 200).
        for vname, viewport, lang, theme, scale, scroll in (('ordinateur', D, 'fr', 'light', 1, 0), ('sombre-ar-mobile', M, 'ar', 'dark', 2, 200)):
            s.open('people', theme=theme, lang=lang, viewport=viewport, block_globe=True)
            if scroll: s.scroll(scroll); s.away()
            fresh = s.shot('_masque-avant-' + vname)
            x = np.asarray(Image.open(fresh).convert('RGB'), dtype=int); y = np.asarray(Image.open(HERE / f'avant-{vname}.png').convert('RGB'), dtype=int)
            same = x.shape == y.shape and int((np.abs(x - y).sum(axis=2) > 0).sum()) == 0
            fresh.unlink()
            out[vname] = {'captureAvantReproduite': same, **masked(f'avant-{vname}.png', f'apres-{vname}.png', s.js(LINES), s.js(GLASS), scale)}
        record(s, 'masques-exacts-des-captures', **out)
    guard(s, 'masques-exacts-des-captures', masks)

    def list_shots():
        out = {}
        y = None
        for label, essais in (('avant', []), ('apres', [ID])):
            s.open('people', essais=essais, viewport=D, block_globe=True)
            if s.js('document.querySelector("#content-index").dataset.view') != 'list': layout(s, 'list')
            if y is None: y = s.js('Math.round(document.querySelector("[data-profile-id=profile-lucia-roca]").getBoundingClientRect().top+scrollY-150)')
            s.scroll(y); s.away()
            s.shot(f'{label}-liste-ordinateur-milieu')
            out[label] = {'scrollY': s.js('scrollY'), 'mentionsVisibles': s.js(TEXT)['visible'], **{k: v for k, v in s.js(LIST).items() if k in ('heartOverlap', 'shownPlaceholders', 'heights', 'overflow')}}
            layout(s, 'grid')
        record(s, 'capture-liste-ordinateur-milieu', **out)
    guard(s, 'capture-liste-ordinateur-milieu', list_shots)


def baseline_hashes():
    """Read-only check of the frozen copy against snapshot-manifest.json (never writes snapshot-verification.json)."""
    manifest = json.loads((STUDY_ROOT / 'snapshot-manifest.json').read_text())
    bad = []
    for row in manifest['files']:
        data = (STUDY_ROOT / row['runtime']).read_bytes()
        if hashlib.sha256(data).hexdigest() != row['runtimeSha256'] or len(data) != row['runtimeBytes']: bad.append(row['runtime'])
    return {'fichiers': len(manifest['files']), 'differents': bad}


def summary():
    cases = {c['case']: c for c in results['cases'] if 'exception' not in c}
    sweeps = [c for c in cases.values() if c['case'].startswith('toutes-pages')]
    tree = cases.get('arbre-accessibilite-et-texte', {})
    menu = cases.get('langue-et-theme-par-le-menu-du-compte', {}).get('etapes', [])
    exp = cases.get('arrivee-depuis-explorer-tri-plus-anciens', {}).get('apres', {})
    focus = cases.get('focus-clavier-carte-sans-pseudo', {})
    filt = cases.get('filtre-statut-sans-recharger', {}).get('etapes', [])
    lists = cases.get('liste-toutes-pages', {}).get('resume', {})
    globe = cases.get('explorer-vrai-globe', {})
    ident = cases.get('pages-non-concernees-pixels-exacts', {}).get('pixelsDifferents', {})
    combo = cases.get('combinaison-essais-des-cartes', {}).get('mesures', {})
    arrival = cases.get('page-arrivee-index', {})
    masks = {k: v for k, v in cases.get('masques-exacts-des-captures', {}).items() if isinstance(v, dict)}
    listshot = cases.get('capture-liste-ordinateur-milieu', {})
    results['empreintesCopie'] = baseline_hashes()
    results['acceptation'] = {
        'exceptions': [c['case'] for c in results['cases'] if 'exception' in c],
        'balayages': len(sweeps),
        'toutesPagesSansMention': bool(sweeps) and all(c['apres']['shownPlaceholders'] == 0 and c['texteVisibleApres'] == 0 and c['innerTextApres'] == 0 for c in sweeps),
        'toutesPagesMentionPresenteAvant': bool(sweeps) and all(c['texteVisibleAvant'] > 0 for c in sweeps),
        'toutesPagesEtatAttendu': bool(sweeps) and all(c['apres']['wrongState'] == 0 for c in sweeps),
        'toutesPagesHauteursEgales': bool(sweeps) and all(c['apres']['unequalHeights'] == 0 for c in sweeps),
        'aucuneRangeeDesaligneeAjoutee': bool(sweeps) and all(c['apres']['unlevelCampus'] <= c['avant']['unlevelCampus'] and c['apres']['unlevelCohort'] <= c['avant']['unlevelCohort'] for c in sweeps),
        'espaceReserveEgalAUneLigneDePseudo': bool(sweeps) and all(c['apres']['reserveNotOneLoginLine'] == 0 for c in sweeps),
        'aucunDebordement': bool(sweeps) and not any(c['overflowApres'] for c in sweeps),
        'arbreAccessibleSansMention': bool(tree) and all(v['ax']['hits'] == 0 and v['texte']['visible'] == 0 for k, v in tree.items() if k.startswith('apres') and isinstance(v, dict)),
        'arbreAccessibleAvantAvecMention': bool(tree) and all(v['ax']['hits'] > 0 for k, v in tree.items() if k.startswith('avant') and isinstance(v, dict)),
        'arriveeDepuisExplorerSansDecalageGrille': bool(exp) and not exp['decalagesGrille'] and exp['grille']['wrongState'] == 0,
        'filtreSuivi': len(filt) == 4 and all(st['wrongState'] == 0 and st['shownPlaceholders'] == 0 and st['unequalHeights'] == 0 and st['texteVisible'] == 0 for st in filt),
        'menuDuCompteLangueEtTheme': bool(menu) and all(st['texte']['visible'] == 0 and (st.get('grille', {}).get('wrongState', 0) == 0) and not st.get('detail', {}).get('loginShown', False) for st in menu),
        'largeursIntermediaires': all(st['wrongState'] == 0 and st['unequalHeights'] == 0 and not st['overflow'] for st in cases.get('largeurs-intermediaires-sans-recharger', {}).get('etapes', [{'wrongState': 1}])),
        'focusClavierIdentique': bool(focus) and focus.get('avant', {}).get('tabulations') == focus.get('apres', {}).get('tabulations') and focus.get('avant', {}).get('focus') == focus.get('apres', {}).get('focus'),
        'pageArriveeSansErreur': arrival.get('pret') == 'true' and arrival.get('feuille') is True and not arrival.get('errors'),
        'listeToutesPages': bool(lists) and all(v['heartOverlap'] == 0 and not v['overflow'] for v in lists.values()) and all(v['shownPlaceholders'] == 0 for k, v in lists.items() if k.startswith('apres')),
        'explorerVraiGlobeIdentique': globe.get('pixelsEssaiContreBase') == 0 and all(globe.get(k, {}).get('globe') for k in ('avant', 'apres', 'avant-bis')) and globe.get('portee', {}).get('rendered') == 0,
        'bruitGlobeBaseContreBase': globe.get('pixelsBaseContreBase'),
        'pagesNonConcerneesIdentiques': bool(ident) and all(v == 0 for v in ident.values()),
        'combinaisonCartesSansMention': bool(combo) and all(v['texteVisible'] == 0 and v['wrongState'] == 0 and v['unequalHeights'] == 0 for k, v in combo.items() if k.startswith('avec')),
        'masquesExactsSansPixelAilleurs': bool(masks) and all(v['captureAvantReproduite'] and v['elsewhere'] == 0 for v in masks.values()),
        'captureListeMilieu': bool(listshot) and listshot['avant']['mentionsVisibles'] > 0 and listshot['apres']['mentionsVisibles'] == 0 and listshot['apres']['heartOverlap'] == 0,
        'copieDeReferenceIntacte': not results['empreintesCopie']['differents'],
        'aucuneErreur': all(not c['errors'] for c in results['cases']),
    }
    print(json.dumps(results['acceptation'], ensure_ascii=False))


if __name__ == '__main__':
    only = sys.argv[1:] or ['1']
    if only == ['fusion']:
        for n in '12345':
            path = HERE / f'contre-verification-s{n}.json'
            if path.exists(): results['cases'] += json.loads(path.read_text())['cases']
        summary()
        (HERE / 'contre-verification.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
        sys.exit(0)
    for number in only:
        fn = {'1': session1, '2': session2, '3': session3, '4': session4, '5': session5}[number]
        results['cases'] = []
        for attempt in (1, 2):
            s = Session(HERE)
            try: fn(s); break
            except RuntimeError as error:
                # A memory-cap kill closes the pipe: retry the whole session once in a fresh Chrome.
                if 'pipe closed' not in str(error) or attempt == 2: raise
                results['cases'] = [{'case': f'session {number} relancée', 'exception': repr(error)[:200], 'errors': []}]
            finally: s.close()
        (HERE / f'contre-verification-s{number}.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
