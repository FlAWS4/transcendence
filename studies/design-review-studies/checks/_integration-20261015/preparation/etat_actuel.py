"""Combined result on the CURRENT original (read-only everywhere): what the package gives once added to it.

Three sides per view, same viewport, theme (stored preference) and French language:
 - "copie-essais": the study copy (state 144) with the nine trials, as the user saw the selection;
 - "original": horizon-welcome/<page> as served now (state recorded in the results);
 - "original-paquet": the same page whose HTML response is rewritten on the fly (CDP Fetch) with the two lines
   of PLAN.md (package stylesheet after content-report.css, package module after the page's main module).
Nothing is written outside this folder; the original's files are only read and served by the local server.
Views: account menu in dark (D3 "Créer un compte" fill + visiter-contour-sombre outline), the arrival in dark,
the arrival error screen with its account menu (D4), the comment sort panel opened low on a phone (D2).
After the integration, INTEGRE=1 compares the integrated original itself (no rewrite) with the copy and the nine
trials, and checks that the package is loaded exactly once:
python3 -I etat_actuel.py [view-name …]   ->  results-etat-actuel.json  (INTEGRE=1: results-etat-integre.json)"""
import hashlib, json, os, re, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import equivalence as eq  # noqa: E402  (also patches helper.Chrome.call for CDP Fetch)
from helper import Session, ACTIVE, D, M, contrast  # noqa: E402

ORIGINAL = eq.STUDY.parents[1] / 'site'
INTEGRE = os.environ.get('INTEGRE') == '1'
RESULTS = HERE / ('results-etat-integre.json' if INTEGRE else 'results-etat-actuel.json')
PATTERNS = ['*/horizon-welcome/index.html*', '*/horizon-welcome/content-preview.html*']
PKG = '../design-review-studies/integration-20261015/design-review-selection'
MAIN = re.compile(r'  <script src="(?:welcome|content-preview)\.mjs\?v=[^"]+" type="module"></script>\n')
SEED_KEY = 'comments-demo-v1:project:minishell-under-the-prompt'
# Eight local comments (as in the 15 Oct sort bench) so the discussion is long enough to scroll the sort button low.
SEED = {'version': 2, 'sort': 'newest', 'draft': '', 'replyDrafts': {},
        'comments': [{'id': f'qa-{i}', 'text': f'Commentaire de contrôle {i} pour allonger la discussion.', 'created': 1700000000000 + i * 1000000} for i in range(8)]}


def original_packaged(page):
    html = (ORIGINAL / page).read_text(encoding='utf-8')
    main = MAIN.findall(html)
    assert html.count(eq.LAST_SHEET) == 1 and len(main) == 1, page
    html = html.replace(eq.LAST_SHEET, eq.LAST_SHEET + f'  <link rel="stylesheet" href="{PKG}.css?v=1">\n')
    return html.replace(main[0], main[0] + f'  <script src="{PKG}.mjs?v=1" type="module"></script>\n')


def rewrite(url):
    if '/horizon-welcome/' in url: return original_packaged('index.html' if '/horizon-welcome/index.html' in url else 'content-preview.html')
    return eq.packaged_html('index.html' if '/baseline/index.html' in url else 'content-preview.html')


eq.rewrite = rewrite


def state_of_original():
    names = ['index.html', 'content-preview.html', 'content-preview.mjs', 'welcome.mjs', 'entrance.css', 'entrance.mjs', 'comments.mjs', 'account-menu.css', 'account-menu.mjs']
    index = (ORIGINAL / 'index.html').read_text(encoding='utf-8'); preview = (ORIGINAL / 'content-preview.html').read_text(encoding='utf-8')
    return {'controller': re.search(r'welcome\.mjs\?v=([^"]+)"', index).group(1), 'preview': re.search(r'content-preview\.mjs\?v=([^"]+)"', preview).group(1),
            'entranceCss': re.search(r'entrance\.css\?v=([^"]+)"', index).group(1),
            'sha256': {n: hashlib.sha256((ORIGINAL / n).read_bytes()).hexdigest() for n in names}}


ACCOUNT = r'''(()=>{const b=document.querySelector('[data-account-action=signup]'),i=document.querySelector('[data-account-action=login]'),m=document.querySelector('#account-menu');
 if(!b||!b.getClientRects().length)return {visible:false};
 const r=b.getBoundingClientRect(),c=getComputedStyle(b),g=document.createRange();g.selectNodeContents(b);const t=[...g.getClientRects()].filter(q=>q.width>.5);
 const box=e=>{const q=e.getBoundingClientRect();return [q.left,q.top,q.right,q.bottom].map(v=>Math.round(v*100)/100)};
 return {visible:true,box:box(b),text:t.length?[Math.min(...t.map(q=>q.left)),Math.min(...t.map(q=>q.top)),Math.max(...t.map(q=>q.right)),Math.max(...t.map(q=>q.bottom))]:null,
  label:b.textContent.trim(),color:c.color,background:c.backgroundColor,border:c.borderTopColor,borderWidth:c.borderTopWidth,font:c.fontSize+' '+c.fontWeight,radius:c.borderTopLeftRadius,shadow:c.boxShadow,
  login:i&&{box:box(i),background:getComputedStyle(i).backgroundColor,color:getComputedStyle(i).color,font:getComputedStyle(i).fontSize,radius:getComputedStyle(i).borderTopLeftRadius},
  menu:m&&{background:getComputedStyle(m).backgroundColor,radius:getComputedStyle(m).borderTopLeftRadius,shadow:getComputedStyle(m).boxShadow.slice(0,90)},
  entry:document.body.dataset.entry,theme:document.documentElement.dataset.theme}})()'''
ARRIVAL = r'''(()=>{const f=id=>{const e=document.getElementById(id);if(!e)return null;const c=getComputedStyle(e),q=e.getBoundingClientRect();
 return {box:[q.left,q.top,q.width,q.height].map(v=>Math.round(v*100)/100),color:c.color,background:c.backgroundColor,border:c.borderTopColor+' '+c.borderTopWidth,font:c.fontSize,radius:c.borderTopLeftRadius,shadow:c.boxShadow.slice(0,60),lang:e.getAttribute('lang')}};
 return {guest:f('entry-guest'),login:f('entry-login'),entry:document.body.dataset.entry,theme:document.documentElement.dataset.theme,
  account:getComputedStyle(document.querySelector('.account-switcher')).display}})()'''
SORT = r'''(()=>{const N=v=>Math.round(v*100)/100,R=e=>{if(!e||e.closest('[hidden]'))return null;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display==='none'||s.visibility==='hidden'||!r.width?null:{x:N(r.x),y:N(r.y),right:N(r.right),bottom:N(r.bottom)}};
 const b=[...document.querySelectorAll('.cp-comments-sort')].find(e=>!e.closest('[hidden]')),p=b&&document.getElementById(b.getAttribute('aria-controls'));
 const q=s=>{for(const e of document.querySelectorAll(s)){const r=R(e);if(r)return r;}return null};
 const fl={search:q('.dock-search-toggle'),nav:q('#main-nav'),btt:q('#back-to-top'),header:q('.app > .header'),scope:q('#scope-bar')};
 const pr=R(p),br=R(b),hit=(a,c)=>Boolean(a&&c&&Math.min(a.right,c.right)-Math.max(a.x,c.x)>.01&&Math.min(a.bottom,c.bottom)-Math.max(a.y,c.y)>.01);
 return {open:Boolean(p&&!p.hidden),button:br,panel:pr,direction:pr&&br?(pr.y>=br.bottom-1?'bas':pr.bottom<=br.y+1?'haut':'chevauche'):null,floating:fl,
  overlaps:pr&&{search:hit(pr,fl.search),nav:hit(pr,fl.nav),backToTop:hit(pr,fl.btt),header:hit(pr,fl.header)},inViewport:pr&&pr.y>=0&&pr.bottom<=innerHeight,
  panelStyle:p&&{radius:getComputedStyle(p).borderTopLeftRadius,shadow:getComputedStyle(p).boxShadow.slice(0,60),font:getComputedStyle(p.querySelector('button')).fontSize,scroll:[p.scrollHeight,p.clientHeight]},
  triggerFont:b&&getComputedStyle(b).fontSize,scrollY}})()'''
PRESENCE = r'''(()=>({links:[...document.querySelectorAll('link[rel=stylesheet]')].filter(l=>/design-review-selection\.css/.test(l.href)).length,
 modules:[...document.querySelectorAll('script[type=module]')].filter(s=>/design-review-selection\.mjs/.test(s.src)).length,
 lastSheet:[...document.querySelectorAll('link[rel=stylesheet]')].pop()?.getAttribute('href'),notes:document.querySelectorAll('#main > .awards-coming-soon').length,
 started:Boolean(globalThis[Symbol.for('horizon.design-review-selection')])}))()'''


def preset(s, view, mode):
    """Theme as a stored preference (the original has no ?theme=); comments seeded for the sort view."""
    prefix = 'horizon-design-review-studies-20261014-' if mode == 'copie-essais' else 'horizon-'
    source = f"try{{localStorage.setItem('{prefix}theme-preference-v1',{json.dumps(view['theme'])})}}catch(e){{}}"
    if view.get('seed'):
        source += f"try{{if(!sessionStorage.getItem('{prefix}{SEED_KEY}'))sessionStorage.setItem('{prefix}{SEED_KEY}',{json.dumps(json.dumps(SEED))})}}catch(e){{}}"
    s.c.call('Page.addScriptToEvaluateOnNewDocument', {'source': source})


def to_error(s):
    s.click('#entry-guest'); s.wait('document.body.dataset.entry==="error"', 30); time.sleep(1.5); s.away(); s.blur()


def open_account(s):
    try: s.click('#profile'); time.sleep(1.2)
    except RuntimeError as error: return str(error)


def sort_low(s):
    """Sort button placed just above the floating search/back-to-top band, then opened with a real click."""
    s.wait('Boolean([...document.querySelectorAll(".cp-comments-sort")].find(e=>!e.closest("[hidden]")))', 15)
    s.js(r'''(()=>{const b=[...document.querySelectorAll('.cp-comments-sort')].find(e=>!e.closest('[hidden]'));
     const tops=[document.querySelector('.dock-search-toggle'),document.getElementById('back-to-top')].filter(e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>e.getBoundingClientRect().top);
     const limit=Math.min(innerHeight,...tops),r=b.getBoundingClientRect();window.scrollTo({top:scrollY+r.top-(limit-r.height-24),behavior:'instant'});return true})()''')
    time.sleep(1.2)
    s.click('.cp-comments-sort'); time.sleep(1.0)


def side(s, view, mode):
    eq.fresh(s, mode == 'original-paquet', PATTERNS); s.reduced(True); preset(s, view, mode)
    page = view.get('page', 'content-preview.html')
    if mode == 'copie-essais':
        s.open(view['route'], essais=eq.NINE, theme=view['theme'], lang='fr', viewport=view['vp'], block_globe=True, page=page)
    else:
        # theme='light' keeps helper.open from switching the theme through the account menu: it is stored above.
        s.open(view['route'], theme='light', lang='fr', viewport=view['vp'], block_globe=True, page=page, base=ACTIVE)
    note = '#main > .awards-coming-soon' if mode == 'original-paquet' or (INTEGRE and mode == 'original') else '#main > .essai-awards-a-venir' if mode == 'copie-essais' else None
    installed = s.wait(f'Boolean(document.querySelector({json.dumps(note)}))', 15) if note else None
    out = {'mode': mode, 'installed': installed, 'notes': []}
    for step in view.get('setup', []):
        result = step(s)
        if result: out['notes'].append(result)
    time.sleep(1.2); s.away(); time.sleep(.3)
    if page == 'index.html' and not view.get('error'): out['steady'] = eq.arrival_steady(s)
    shot = eq.capture(s, f"{'integre' if INTEGRE else 'actuel'}-{view['name']}-{mode}"); out['shot'] = str(shot)
    out['account'] = s.js(ACCOUNT); out['arrival'] = s.js(ARRIVAL) if page == 'index.html' else None
    out['sort'] = s.js(SORT) if view.get('seed') else None
    out['presence'] = s.js(PRESENCE)
    out['styles'] = s.js(eq.STYLES, 90); out['extras'] = s.js(eq.EXTRAS, 30); out['errors'] = out['extras']['errors']
    out['theme'] = out['extras']['theme']
    return out


def parse(value):
    v = value[value.index('(') + 1:value.index(')')].replace('/', ' ').replace(',', ' ').split()
    return tuple(round(float(x)) for x in v[:3]), (float(v[3]) if len(v) > 3 else 1.0)


def contrasts(side_result, vp):
    """Pixel-measured contrasts of "Créer un compte": text against the median fill, outline against fill and glass."""
    a = side_result['account']
    if not a or not a.get('visible'): return None
    import numpy as np
    img = eq.pixels(side_result['shot'])[:, :, :3]; k = 2 if vp[2] else 1
    x0, y0, x1, y1 = [round(v * k) for v in a['box']]; tx = [round(v * k) for v in a['text']]
    ys, xs = np.mgrid[y0 + 3 * k:y1 - 3 * k, x0 + 3 * k:x1 - 3 * k]
    inner = img[y0 + 3 * k:y1 - 3 * k, x0 + 3 * k:x1 - 3 * k].reshape(-1, 3)
    mask = ~((xs >= tx[0] - 2 * k) & (xs <= tx[2] + 2 * k) & (ys >= tx[1] - 2 * k) & (ys <= tx[3] + 2 * k))
    fill = tuple(int(v) for v in np.median(inner[mask.reshape(-1)], axis=0))
    outside = tuple(int(v) for v in np.median(img[(y0 + y1) // 2 - 4 * k:(y0 + y1) // 2 + 4 * k, max(0, x0 - 6 * k):max(1, x0 - 3 * k)].reshape(-1, 3), axis=0))
    fg, _ = parse(a['color']); border, alpha = parse(a['border'])
    out = {'fillPixel': fill, 'glassOutside': outside, 'text': round(contrast(fg, fill), 2)}
    if alpha > 0 and a['borderWidth'] != '0px':
        out['outlineVsFill'] = round(contrast(border, fill), 2); out['outlineVsGlass'] = round(contrast(border, outside), 2)
    out['fillVsGlass'] = round(contrast(fill, outside), 2)
    return out


def pair(a, b):
    """Pixel/DOM/style comparison of two sides (the same code as the equivalence check)."""
    wrap = lambda r: {'states': [{'step': 'initial', 'shot': r['shot'], 'steady': [True, True], 'styles': r['styles'], 'extras': r['extras']}]}
    c = eq.compare(wrap(a), wrap(b))['steps'][0]
    return {k: c.get(k) for k in ('pixelsDiffer', 'diffBox', 'maxChannelDelta', 'elements', 'domMismatches', 'styleMismatches', 'firstDom', 'firstStyle', 'extrasEqual', 'extrasDiff')}


VIEWS = [
    {'name': 'menu-compte-1440x900-sombre', 'route': 'projects', 'theme': 'dark', 'vp': D, 'setup': [open_account]},
    {'name': 'menu-compte-390x844-sombre', 'route': 'projects', 'theme': 'dark', 'vp': M, 'setup': [open_account]},
    {'name': 'menu-compte-1440x900-clair', 'route': 'projects', 'theme': 'light', 'vp': D, 'setup': [open_account]},
    {'name': 'arrivee-1440x900-sombre', 'route': '', 'page': 'index.html', 'theme': 'dark', 'vp': D},
    {'name': 'ecran-erreur-compte-1440x900-sombre', 'route': '', 'page': 'index.html', 'theme': 'dark', 'vp': D, 'error': True, 'setup': [to_error, open_account]},
    {'name': 'tri-commentaires-bas-390x844-clair', 'route': 'projects/minishell-under-the-prompt?tab=comments', 'theme': 'light', 'vp': M, 'seed': True, 'setup': [sort_low]},
]


def load():
    try: return json.loads(RESULTS.read_text(encoding='utf-8'))
    except Exception: return {}


def run(view, attempts=3):
    for attempt in range(1, attempts + 1):
        s = None
        try:
            s = Session(eq.CAPTURES)
            before = state_of_original()
            modes = ('copie-essais', 'original') if INTEGRE else ('copie-essais', 'original', 'original-paquet')
            sides = {m: side(s, view, m) for m in modes}
            after = state_of_original()
            result = {'view': {k: (list(v) if isinstance(v, tuple) else v) for k, v in view.items() if k != 'setup'},
                      'originalState': before, 'originalUnchangedDuringView': before == after,
                      'sides': {m: {k: v for k, v in r.items() if k not in ('styles', 'extras')} | {'lang': r['extras']['lang'], 'main': r['extras']['main'], 'sheets': r['extras']['sheets']}
                                for m, r in sides.items()},
                      'contrasts': {m: contrasts(r, view['vp']) for m, r in sides.items()},
                      'paquetVsEssais': pair(sides['copie-essais'], sides['original' if INTEGRE else 'original-paquet']),
                      'paquetVsOriginal': None if INTEGRE else pair(sides['original'], sides['original-paquet'])}
            data = load(); data[view['name']] = result
            RESULTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
            pe, po = result['paquetVsEssais'], result['paquetVsOriginal'] or {'pixelsDiffer': None, 'styleMismatches': None}
            print(view['name'], 'state', before['controller'], 'unchanged', result['originalUnchangedDuringView'],
                  '| vs essais px', pe['pixelsDiffer'], 'dom', pe['domMismatches'], 'style', pe['styleMismatches'],
                  '| vs original px', po['pixelsDiffer'], 'style', po['styleMismatches'],
                  '| contrasts', json.dumps(result['contrasts'], ensure_ascii=False), '| errors', [len(r['errors']) for r in sides.values()], flush=True)
            return result
        except (RuntimeError, TimeoutError, OSError, AssertionError) as error:
            print(f"[{view['name']}] session error {attempt}: {error}", flush=True)
            if attempt == attempts: return None
            time.sleep(5)
        finally:
            if s: s.close()


if __name__ == '__main__':
    names = sys.argv[1:]
    for view in VIEWS:
        if names and view['name'] not in names: continue
        print('==', view['name'], time.strftime('%H:%M:%S'), flush=True)
        run(view)
