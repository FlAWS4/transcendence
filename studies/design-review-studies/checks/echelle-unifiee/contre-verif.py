"""Trial echelle-unifiee, second verifier pass (15 Oct 2026): what check.py and verif.py do not open.
Run: python3 -I .../checks/echelle-unifiee/contre-verif.py [phase ...]; contre-verif-results.json keeps the others.
 menus     comment emoji palette and comment actions menu (only reachable by clicks): radius and shadow before/after
 densite   profile and project details loaded directly at desktop window sizes (no progressive resize):
           sidebar density, menu overflow and visible scroll arrows, before/after
 seuil     window height at which the profile sidebar leaves the compact density, 1024 px wide
 progressif  6 Oct progressive sizes: font size per component at 1440-320 px, before/after, and the
           grid card titles pixel by pixel around 390 px (the trial's only media-query step)
 table     per-component sizes, radii and shadows with menus and dialogs open (check.py's MAP_JS), for
           the mapping table of essai.json together with check.py's mapping phase
 lignes    Profiles in Arabic dark mobile with the typography trials: lines of the counter, names and
           cohorts with lisibilite-textes (and titres-forts) alone and with this trial"""
import ast, json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M

ID = 'echelle-unifiee'
PID, LEILA, ART = 'ft-transcendence-building-together', 'profile-leila-mansour', 'journal-an-evening-debugging'
OUT = HERE / 'contre-verif-results.json'
SCRATCH = Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/2cf0c114-786b-4a24-866f-57822e04403f/scratchpad/agents/echelle-unifiee-verif3')
ESSAIS = HERE.parent.parent / 'essais'
PHASES = ['menus', 'densite', 'seuil', 'progressif', 'table', 'lignes']
asked = [a for a in sys.argv[1:] if a in PHASES] or PHASES
results = json.loads(OUT.read_text()) if OUT.exists() else {}
stamp = lambda p: time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(p.stat().st_mtime))
results['trialFiles'] = {f: stamp(ESSAIS / ID / f) for f in ('essai.css', 'essai.mjs', 'early.js')}
results.setdefault('ranAt', {}); results.setdefault('ranWith', {})


def save():
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')


def keep(s, name):
    # Captures cited in essai.json go to checks/echelle-unifiee/, the others to the scratch folder.
    out, s.out = s.out, HERE
    try: return s.shot(name)
    finally: s.out = out


def fresh(s, route, essais, theme='light', lang='fr', vp=D):
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.3)
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)


BOX = '''(sel=>{const e=[...document.querySelectorAll(sel)].find(x=>x.getClientRects().length&&!x.hidden);if(!e)return null;const s=getComputedStyle(e),r=e.getBoundingClientRect();
return{radius:s.borderRadius,shadow:s.boxShadow,r:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
 items:[...e.querySelectorAll('button')].filter(b=>b.getClientRects().length).slice(0,3).map(b=>[getComputedStyle(b).borderRadius,getComputedStyle(b).fontSize])}})'''

if 'menus' in asked:
    store = results['menus'] = {}
    CASES = [('commentaires-ordinateur', 'light', 'fr', D), ('commentaires-ar-sombre-mobile', 'dark', 'ar', M)]
    # The demo has no comments: one is posted first (local state of this headless profile only), so that
    # its actions menu exists; the comparison side then loads with the same comment.
    POST = '''(()=>{const i=document.getElementById('project-comment-input');if(!i)return false;i.focus();return true})()'''
    TARGET = '''(()=>{const b=[...document.querySelectorAll('.cp-comment-menu-toggle')].find(x=>x.getClientRects().length&&!x.disabled);if(b)b.dataset.cvTarget='1';return Boolean(b)})()'''
    for attempt in range(3):
        s = Session(SCRATCH)
        try:
            for vue, theme, lang, vp in CASES:
                for label, essais in (('avant', []), ('apres', [ID])):
                    if label in store.get(vue, {}): continue
                    fresh(s, f'projects/{PID}?tab=comments', essais, theme, lang, vp)
                    out = {}
                    s.click('.cp-comments-emoji-toggle'); time.sleep(.6)
                    out['emoji'] = s.js(BOX + '(".cp-comments-emoji-palette")')
                    if out['emoji']: keep(s, f'{label}-emoji-ordinateur') if vue == 'commentaires-ordinateur' else s.shot(f'{label}-{vue}-emoji')
                    s.key('Escape'); s.away(); s.blur(); time.sleep(.3)
                    if not s.js(TARGET) and s.js(POST):
                        s.c.call('Input.insertText', {'text': 'Essai de mise en page'}); time.sleep(.3)
                        s.click('.cp-comments-submit'); time.sleep(1)
                    out['owner'] = None
                    if s.js(TARGET):
                        s.click('.cp-comment-menu-toggle[data-cv-target]'); time.sleep(.6)
                        out['owner'] = s.js(BOX + '(".cp-comment-owner-menu")')
                        if out['owner']: keep(s, f'{label}-actions-commentaire-ordinateur') if vue == 'commentaires-ordinateur' else s.shot(f'{label}-{vue}-actions')
                    out['errors'] = s.errors(); out['overflow'] = s.overflow()
                    store.setdefault(vue, {})[label] = out; save()
                    print('menus', vue, label, json.dumps(out, ensure_ascii=False)[:500], flush=True)
            break
        except Exception as error:  # cap kill, closed pipe or timeout: fresh Chrome
            print('retry menus', type(error).__name__, error, flush=True)
        finally:
            s.close()
    results['ranAt']['menus'] = time.strftime('%Y-%m-%d %H:%M:%S'); results['ranWith']['menus'] = results['trialFiles']; save()

DENS = '''(()=>{const side=[...document.querySelectorAll('.cp-profile-sidebar,.cp-project-sidebar')].find(e=>e.getClientRects().length);if(!side)return null;
const f=side.querySelector('.cp-detail-menu'),nav=side.querySelector('.cp-profile-sidebar-nav,.cp-project-sidebar-nav'),h=side.querySelector('h1');
const links=nav?[...nav.querySelectorAll('a')]:[];const nr=nav&&nav.getBoundingClientRect();
return{density:side.dataset.detailDensity||'',menuOverflow:f?.dataset.overflow||null,arrows:[...side.querySelectorAll('.cp-detail-menu-arrow')].filter(b=>!b.hidden).map(b=>b.dataset.direction),
 links:links.length,linksFullyVisible:nr?links.filter(a=>{const r=a.getBoundingClientRect();return r.top>=nr.top-1&&r.bottom<=nr.bottom+1}).length:0,
 title:h&&[getComputedStyle(h).fontSize,Math.round(h.getBoundingClientRect().height)],linkSize:links[0]&&getComputedStyle(links[0]).fontSize,
 overflow:document.documentElement.scrollWidth>innerWidth+1}})()'''

if 'densite' in asked:
    store = results['densite'] = {}
    SIZES = [(1024, 768), (1100, 700), (1280, 720), (1366, 768), (1440, 900)]
    ROUTES = [f'people/{LEILA}', f'projects/{PID}', f'journal/{ART}']
    jobs = [(r, w, h, label, essais) for r in ROUTES for (w, h) in SIZES for label, essais in (('avant', []), ('apres', [ID]))]
    for i in range(0, len(jobs), 10):
        for attempt in range(2):
            s = Session(SCRATCH)
            try:
                for route, w, h, label, essais in jobs[i:i + 10]:
                    key = f'{route.split("/")[0]}-{w}x{h}'
                    if label in store.get(key, {}): continue
                    fresh(s, route, essais, 'light', 'fr', (w, h, False)); time.sleep(.6)
                    store.setdefault(key, {})[label] = {**(s.js(DENS) or {}), 'errors': s.errors()}
                    if route.startswith('people') and (w, h) == (1024, 768): keep(s, f'{label}-profil-1024-ordinateur')
                    print('densite', key, label, json.dumps(store[key][label], ensure_ascii=False), flush=True); save()
                break
            except Exception as error:  # cap kill, closed pipe or timeout: fresh Chrome, same chunk
                print('retry densite', i, type(error).__name__, error, flush=True)
            finally:
                s.close()
    results['densiteBilan'] = {k: [[v[l].get('density'), v[l].get('menuOverflow'), v[l].get('arrows'), v[l].get('linksFullyVisible'), v[l].get('links')] for l in ('avant', 'apres')]
                               for k, v in store.items() if 'avant' in v and 'apres' in v}
    results['densiteDiff'] = [k for k, v in results['densiteBilan'].items() if v[0][:3] != v[1][:3]]
    results['ranAt']['densite'] = time.strftime('%Y-%m-%d %H:%M:%S'); results['ranWith']['densite'] = results['trialFiles']; save()

if 'seuil' in asked:
    store = results['seuil'] = {}
    HEIGHTS = [740, 750, 760, 764, 768, 772, 776, 780, 785, 790, 800, 820]
    for attempt in range(2):
        s = Session(SCRATCH)
        try:
            for label, essais in (('avant', []), ('apres', [ID])):
                if label in store: continue
                fresh(s, f'people/{LEILA}', essais, 'light', 'fr', (1024, 768, False)); out = {}
                for h in HEIGHTS:
                    s.viewport(1024, h, False); time.sleep(.9); d = s.js(DENS) or {}
                    out[str(h)] = [d.get('density'), d.get('menuOverflow'), d.get('linksFullyVisible'), d.get('title')]
                store[label] = out; print('seuil', label, json.dumps(out), flush=True)
            break
        except Exception as error:
            print('retry seuil', type(error).__name__, error, flush=True)
        finally:
            s.close()
    first = lambda label: next((int(h) for h, v in store[label].items() if v[0] == ''), None)
    results['seuilBilan'] = {'premiereHauteurNormale': {l: first(l) for l in ('avant', 'apres')},
                             'differentes': [h for h in store['avant'] if store['avant'][h][:2] != store['apres'][h][:2]]}
    results['ranAt']['seuil'] = time.strftime('%Y-%m-%d %H:%M:%S'); results['ranWith']['seuil'] = results['trialFiles']; save()

SIZES_JS = r'''(()=>{const key=el=>{const c=typeof el.className==='string'?el.className.trim().split(/\s+/).slice(0,2).join('.'):'';const p=el.parentElement;const pc=p&&typeof p.className==='string'?p.className.trim().split(/\s+/)[0]:'';return el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(c?'.'+c:'')+(!c&&!el.id&&p?' < '+p.tagName.toLowerCase()+(p.id?'#'+p.id:'')+(pc?'.'+pc:''):'')};
const out={};const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){if(!n.textContent.trim())continue;const el=n.parentElement;if(!el||el.closest('svg,.brand,[data-detail-density],#main-nav>button[data-section]'))continue;if(!el.checkVisibility({opacityProperty:true,visibilityProperty:true}))continue;
 const k=key(el);if(k in out)continue;out[k]=Math.round(parseFloat(getComputedStyle(el).fontSize)*100)/100}return out})()'''
TITLE_JS = '''(()=>{const e=[...document.querySelectorAll('#content-index[data-view=grid] .cp-card:not(.cp-profile-card) .cp-card-title-link')].find(x=>x.getClientRects().length);return e?Math.round(parseFloat(getComputedStyle(e).fontSize)*100)/100:null})()'''
if 'progressif' in asked:
    store = results['progressif'] = {}
    WIDTHS = [1440, 1024, 834, 600, 390, 360, 320]
    ROUTES = [('projets', 'projects'), ('profils', 'people'), ('chroniques', 'journal'), ('fiche', f'projects/{PID}'), ('profil', f'people/{LEILA}'), ('article', f'journal/{ART}')]
    jobs = [(name, route, label, essais) for name, route in ROUTES for label, essais in (('avant', []), ('apres', [ID]))]
    for i in range(0, len(jobs), 6):
        for attempt in range(2):
            s = Session(SCRATCH)
            try:
                for name, route, label, essais in jobs[i:i + 6]:
                    if label in store.get(name, {}): continue
                    fresh(s, route, essais, 'light', 'fr', (1440, 900, False)); out = {}
                    for w in WIDTHS:
                        s.viewport(w, 900, False); time.sleep(.8); out[str(w)] = s.js(SIZES_JS, 20)
                    if name == 'projets':
                        steps = {}
                        for w in list(range(320, 386, 10)) + list(range(386, 395)) + [400, 420]:
                            s.viewport(w, 900, False); time.sleep(.35); steps[str(w)] = s.js(TITLE_JS)
                        out['titres'] = steps
                    store.setdefault(name, {})[label] = out; print('progressif', name, label, len(out), flush=True); save()
                break
            except Exception as error:
                print('retry progressif', i, type(error).__name__, error, flush=True)
            finally:
                s.close()
    bilan = {}
    for name, v in store.items():
        if 'avant' not in v or 'apres' not in v: continue
        keys = set.intersection(*[set(v[l][str(w)]) for l in ('avant', 'apres') for w in WIDTHS])
        series = lambda l, k: [v[l][str(w)][k] for w in WIDTHS]
        varies = lambda xs: max(xs) - min(xs) > .05
        bilan[name] = {'figees': {k: [series('avant', k), series('apres', k)] for k in sorted(keys) if varies(series('avant', k)) and not varies(series('apres', k))},
                       'progressives': {k: [series('avant', k), series('apres', k)] for k in sorted(keys) if varies(series('apres', k))},
                       'devenuesProgressives': sorted(k for k in keys if varies(series('apres', k)) and not varies(series('avant', k)))}
    results['progressifBilan'] = bilan
    if 'titres' in store.get('projets', {}).get('avant', {}):
        a, b = store['projets']['avant']['titres'], store['projets']['apres']['titres']
        results['sautTitres'] = {w: [a[w], b[w]] for w in a}
    results['ranAt']['progressif'] = time.strftime('%Y-%m-%d %H:%M:%S'); results['ranWith']['progressif'] = results['trialFiles']; save()

# Same measure as check.py's mapping phase (read from its source), plus outer shadows per component.
_tree = ast.parse((HERE / 'check.py').read_text())
_lit = {x.id: n.value for n in _tree.body if isinstance(n, ast.Assign) for x in n.targets if isinstance(x, ast.Name) and x.id in ('MEASURE_JS', 'MAP_JS')}
# check.py builds MAP_JS as MEASURE_JS.split('const texts=')[0] + its own literal.
MAP_JS = ast.literal_eval(_lit['MEASURE_JS']).split(_lit['MAP_JS'].left.value.args[0].value)[0] + ast.literal_eval(_lit['MAP_JS'].right)
SHADOW_JS = r'''(()=>{const key=el=>{const c=typeof el.className==='string'?el.className.trim().split(/\s+/).slice(0,2).join('.'):'';const p=el.parentElement;const pc=p&&typeof p.className==='string'?p.className.trim().split(/\s+/)[0]:'';return el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(c?'.'+c:'')+(!c&&!el.id&&p?' < '+p.tagName.toLowerCase()+(p.id?'#'+p.id:'')+(pc?'.'+pc:''):'')};
const outer=v=>v.split(/,(?![^(]*\))/).map(x=>x.trim()).filter(x=>!/inset/.test(x)).join(', ');const out={};
for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el);if(s.boxShadow==='none'||!el.checkVisibility({opacityProperty:true,visibilityProperty:true}))continue;const r=el.getBoundingClientRect();if(r.width<2||r.height<2)continue;const o=outer(s.boxShadow);if(!o)continue;(out[key(el)]||(out[key(el)]=[])).includes(o)||out[key(el)].push(o)}return out})()'''
if 'table' in asked:
    store = results['table'] = {}
    sys.path.insert(0, str(HERE)); CASES = [  # (vue, route, theme, lang, viewport, action)
        ('tri-ordinateur', 'projects', 'light', 'fr', D, 'sort'), ('filtre-ouvert-sombre-ordinateur', 'projects', 'dark', 'fr', D, 'filter-open'),
        ('signaler-ordinateur', f'projects/{PID}', 'light', 'fr', D, 'report'), ('message-ordinateur', f'people/{LEILA}', 'light', 'fr', D, 'message'),
        ('media-ordinateur', f'projects/{PID}', 'light', 'fr', D, 'media'), ('media-mobile', f'projects/{PID}', 'light', 'fr', M, 'media'),
        ('campus-ordinateur', f'projects/{PID}', 'light', 'fr', D, 'campus'), ('connexion-ordinateur', 'projects', 'light', 'fr', D, 'signin'),
        ('portee-ordinateur', 'projects', 'light', 'fr', D, 'scope'), ('apropos-ordinateur', 'explore', 'light', 'fr', D, 'about'),
        ('compte-sombre-ordinateur', 'projects', 'dark', 'fr', D, 'account'), ('profils-ordinateur', 'people', 'light', 'fr', D, None),
        ('fiche-mobile', f'projects/{PID}', 'light', 'fr', M, None), ('profil-mobile', f'people/{LEILA}', 'light', 'fr', M, None),
    ]
    ACTS = {'sort': ['#content-sort-button'], 'filter-open': ['#content-index .cp-control-menu[data-control=category] .cp-control-trigger', '#content-category-dialog-toggle-1'],
            'report': ['#project-detail .cp-report-trigger'], 'message': ['#profile-detail .cp-profile-message'], 'media': ['#project-detail .cp-project-media-open'],
            'campus': ['#project-detail .cp-project-campus'], 'signin': ['#profile', '#account-menu [data-account-action=signin]'], 'scope': ['#scope-picker'],
            'about': ['#about'], 'account': ['#profile']}
    jobs = [(c, label, essais) for c in CASES for label, essais in (('avant', []), ('apres', [ID]))]
    for i in range(0, len(jobs), 8):
        for attempt in range(2):
            s = Session(SCRATCH)
            try:
                for (vue, route, theme, lang, vp, kind), label, essais in jobs[i:i + 8]:
                    if label in store.get(vue, {}): continue
                    fresh(s, route, essais, theme, lang, vp); note = None
                    for sel in ACTS.get(kind, []):
                        try: s.click(sel); time.sleep(.9)
                        except RuntimeError as error: note = str(error)
                    data = s.js(MAP_JS, 30); data['shadows'] = s.js(SHADOW_JS, 20); data['actionError'] = note; data['errors'] = s.errors()
                    store.setdefault(vue, {'route': route, 'theme': theme, 'lang': lang, 'viewport': list(vp[:2]), 'action': kind})[label] = data
                    print('table', vue, label, len(data['sizes']), note, flush=True); save()
                break
            except Exception as error:
                print('retry table', i, type(error).__name__, error, flush=True)
            finally:
                s.close()
    results['ranAt']['table'] = time.strftime('%Y-%m-%d %H:%M:%S'); results['ranWith']['table'] = results['trialFiles']; save()

LINES_JS = '''(()=>{const lines=e=>{if(!e||!e.getClientRects().length)return null;const s=getComputedStyle(e);const lh=parseFloat(s.lineHeight)||parseFloat(s.fontSize)*1.2;return Math.round(e.getBoundingClientRect().height/lh)};
const cards=[...document.querySelectorAll('#content-list .cp-profile-card')].filter(c=>c.getClientRects().length).slice(0,8);
return{count:[lines(document.getElementById('content-count')),getComputedStyle(document.getElementById('content-count')).fontSize],names:cards.map(c=>lines(c.querySelector('h2'))),
 cohorts:cards.map(c=>lines(c.querySelector('.cp-profile-cohort'))),cohortSize:cards[0]&&getComputedStyle(cards[0].querySelector('.cp-profile-cohort')).fontSize,overflow:document.documentElement.scrollWidth>innerWidth+1}})()'''
if 'lignes' in asked:
    store = results['lignes'] = {}
    SETS = {'lisibilite': ['lisibilite-textes'], 'lisibilite+echelle': ['lisibilite-textes', ID], 'lisibilite+titres': ['lisibilite-textes', 'titres-forts'],
            'trois': ['lisibilite-textes', 'titres-forts', ID], 'echelle': [ID], 'base': []}
    for attempt in range(3):
        s = Session(SCRATCH)
        try:
            for name, essais in SETS.items():
                if name in store: continue
                fresh(s, 'people', essais, 'dark', 'ar', M); store[name] = s.js(LINES_JS); store[name]['errors'] = s.errors()
                print('lignes', name, json.dumps(store[name]), flush=True); save()
            break
        except Exception as error:
            print('retry lignes', type(error).__name__, error, flush=True)
        finally:
            s.close()
    results['ranAt']['lignes'] = time.strftime('%Y-%m-%d %H:%M:%S'); results['ranWith']['lignes'] = results['trialFiles']; save()

save()
print(json.dumps({k: results.get(k) for k in ('densiteBilan', 'densiteDiff', 'seuilBilan', 'sautTitres')}, ensure_ascii=False)[:4000])
for vue, v in results.get('menus', {}).items():
    print(vue, {l: {m: (v[l][m] or {}).get('radius') for m in ('emoji', 'owner')} for l in v})
