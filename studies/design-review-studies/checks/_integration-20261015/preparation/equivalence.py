"""Equivalence of the integration package with the nine selected trials, on the frozen study copy (read-only).

Side "essais": baseline/<page>?essais=<the nine>  (the study loader inserts the nine stylesheets and modules).
Side "paquet": baseline/<page> without any trial; its HTML response is rewritten on the fly (CDP Fetch) exactly
as PLAN.md proposes for the original: the package stylesheet right after the last stylesheet (content-report.css)
and the package module right after the page's main module. Nothing is written outside this folder.
Each view: same viewport/theme/language/route, storage cleared before each side, identical setup steps, then
a screenshot (compared pixel by pixel, no tolerance), a hash of every computed property of every element of the
page (custom properties excluded, trial hook names mapped), the trial custom properties by their two names,
the globe geometry, the children of #main, the pending-login marks, the Awards note and console errors.
python3 -I equivalence.py <part> [<part>…]   parts: globe lists details arrival awards controle switch"""
import base64, json, os, select, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
STUDY = HERE.parents[2]
sys.path.insert(0, str(STUDY / 'checks'))
import helper  # noqa: E402
from helper import Session, D, M, S, L  # noqa: E402

NINE = ['globe-espace-libre', 'police-etiquettes-globe', 'une-colonne-320', 'roles-couleur', 'visiter-contour-sombre',
        'lisibilite-textes', 'echelle-unifiee', 'pseudo-manquant', 'awards-a-venir']
CAPTURES = HERE / 'captures'; CAPTURES.mkdir(exist_ok=True)
RESULTS = HERE / 'results-equivalence.json'
PKG_CSS = '../integration-20261015/design-review-selection.css?v=1'
PKG_JS = '../integration-20261015/design-review-selection.mjs?v=1'
LAST_SHEET = '  <link rel="stylesheet" href="content-report.css?v=3">\n'
MAIN_MODULE = {'index.html': '  <script src="welcome.mjs?v=animated-entry-144" type="module"></script>\n',
               'content-preview.html': '  <script src="content-preview.mjs?v=111" type="module"></script>\n'}
PID = 'ft-transcendence-building-together'
ERRORS = ('window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});'
          'addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));'
          'const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}')


def packaged_html(page):
    """The copy's entry with the two lines PLAN.md adds to the original (paths relative to baseline/)."""
    html = (STUDY / 'baseline' / page).read_text(encoding='utf-8')
    assert html.count(LAST_SHEET) == 1 and html.count(MAIN_MODULE[page]) == 1, page
    html = html.replace(LAST_SHEET, LAST_SHEET + f'  <link rel="stylesheet" href="{PKG_CSS}">\n')
    return html.replace(MAIN_MODULE[page], MAIN_MODULE[page] + f'  <script src="{PKG_JS}" type="module"></script>\n')


# --- helper.Chrome.call with one addition: paused document requests of the package side are fulfilled ----------
def rewrite(url):
    """HTML served for a paused entry request (another check may replace this function)."""
    return packaged_html('index.html' if '/baseline/index.html' in url else 'content-preview.html')


def _fulfil(chrome, event):
    params = event['params']; url = params['request']['url']
    chrome.fetch_seq = getattr(chrome, 'fetch_seq', 0) + 1
    body = base64.b64encode(rewrite(url).encode('utf-8')).decode()
    req = {'id': 10 ** 9 + chrome.fetch_seq, 'method': 'Fetch.fulfillRequest', 'sessionId': event.get('sessionId'),
           'params': {'requestId': params['requestId'], 'responseCode': 200, 'body': body,
                      'responseHeaders': [{'name': 'Content-Type', 'value': 'text/html; charset=utf-8'}, {'name': 'Cache-Control', 'value': 'no-store'}]}}
    chrome.proc.stdin.write(json.dumps(req).encode() + b'\0'); chrome.proc.stdin.flush()
    chrome.fulfilled = getattr(chrome, 'fulfilled', []) + [url]


def _call(self, method, params=None, timeout=30):
    self.seq += 1; wanted = self.seq
    req = {'id': wanted, 'method': method, 'params': params or {}}
    if self.session: req['sessionId'] = self.session
    self.proc.stdin.write(json.dumps(req).encode() + b'\0'); self.proc.stdin.flush()
    deadline = time.time() + timeout
    while time.time() < deadline:
        if b'\0' not in self.buf:
            if not select.select([self.proc.stdout], [], [], 1)[0]: continue
            data = os.read(self.proc.stdout.fileno(), 1 << 20)
            if not data: raise RuntimeError('Chrome pipe closed')
            self.buf += data
        while b'\0' in self.buf:
            msg, self.buf = self.buf.split(b'\0', 1)
            if not msg: continue
            item = json.loads(msg)
            if item.get('method') == 'Fetch.requestPaused': _fulfil(self, item); continue
            if item.get('id') == wanted:
                if 'error' in item: raise RuntimeError(f"{method}: {item['error']}")
                return item.get('result', {})
    raise TimeoutError(method)


helper.Chrome.call = _call

# --- In-page measures --------------------------------------------------------------------------------------------
STYLES = r'''(()=>{
 const CLASS={'awards-coming-soon':'essai-awards-a-venir'},VALUE=[['awards-coming-soon-in','essai-awards-a-venir-in']];
 const hash=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193);}return (x>>>0).toString(16).padStart(8,'0');};
 const dump=cs=>{let s='';for(let i=0;i<cs.length;i++){const n=cs[i];if(n.startsWith('--'))continue;s+=n+':'+cs.getPropertyValue(n)+';';}for(const [a,b] of VALUE)s=s.split(a).join(b);return s;};
 const out=[];
 for(const e of [document.documentElement,document.body,...document.body.querySelectorAll('*')]){
  let s=dump(getComputedStyle(e));
  for(const p of ['::before','::after']){const c=getComputedStyle(e,p);const v=c.getPropertyValue('content');if(v&&v!=='none'&&v!=='normal')s+=p+'{'+dump(c)+'}';}
  const cls=[...e.classList].map(c=>CLASS[c]||c).sort().join('.');
  const mark=e.getAttribute('data-pseudo-manquant')??(e.hasAttribute('data-pending-login')?(e.getAttribute('data-pending-login')==='collapsed'?'replie':e.getAttribute('data-pending-login')):null);
  out.push([e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(cls?'.'+cls:'')+(mark?'[mark='+mark+']':''),hash(s)]);
 }
 return out;
})()'''
EXTRAS = r'''(()=>{
 const root=document.documentElement,rs=getComputedStyle(root),stage=document.getElementById('globe'),gs=stage&&getComputedStyle(stage);
 const pick=(cs,names)=>Object.fromEntries(names.map(n=>[n,cs?cs.getPropertyValue(n).trim():null]));
 const g=window.horizonStudy?.globe?.getWorldScreenGeometry?.()||null;
 const note=document.querySelector('#main > .essai-awards-a-venir, #main > .awards-coming-soon'),p=note&&note.querySelector('p');
 const lines=[...document.querySelectorAll('#content-index .cp-profile-card .cp-card-copy > .cp-profile-login, #profile-detail .cp-profile-heading > .cp-profile-login')].map(e=>{
  const c=getComputedStyle(e);return [e.hasAttribute('dir')?'real':'pending',e.getAttribute('data-pseudo-manquant')??(e.getAttribute('data-pending-login')==='collapsed'?'replie':e.getAttribute('data-pending-login')),c.display,c.visibility,Math.round(e.getBoundingClientRect().height*100)/100];});
 return {lang:root.lang,dir:root.dir,theme:root.dataset.theme,essais:root.dataset.essais,ready:root.dataset.essaisReady,
  sheets:[...document.styleSheets].map(s=>s.href&&s.href.replace(location.origin,'')).filter(h=>h&&/essais|integration-20261015/.test(h)),
  rootVars:{scale:pick(rs,['--eu-caption','--eu-action','--eu-label','--eu-body','--eu-title-3','--eu-ramp','--eu-radius-control','--eu-radius-surface','--eu-shadow-2','--eu-glass-edge']),
   accent:rs.getPropertyValue('--essai-lt-accent').trim()||rs.getPropertyValue('--readable-text-accent').trim(),
   accentNames:{essai:rs.getPropertyValue('--essai-lt-accent').trim(),paquet:rs.getPropertyValue('--readable-text-accent').trim()}},
  globeVars:gs&&{hgRadius:gs.getPropertyValue('--hg-radius').trim(),
   fit:['radius','top','bottom','disc','q'].map(k=>gs.getPropertyValue('--essai-globe-'+k).trim()||gs.getPropertyValue('--globe-fit-'+k).trim()),
   names:{essai:gs.getPropertyValue('--essai-globe-radius').trim(),paquet:gs.getPropertyValue('--globe-fit-radius').trim()}},
  geometry:g&&{x:g.center.x,y:g.center.y,r:g.radius},
  main:[...document.getElementById('main').children].map(e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).map(c=>c==='awards-coming-soon'?'essai-awards-a-venir':c).join('.'):'')),
  note:note&&{text:p.textContent,lang:p.lang,dir:p.dir,display:getComputedStyle(note).display,rect:(r=>[r.x,r.y,r.width,r.height].map(v=>Math.round(v*100)/100))(p.getBoundingClientRect())},
  logins:lines,view:document.getElementById('content-index')?.dataset.view||null,
  accountOpen:(m=>Boolean(m&&!m.hidden&&m.getClientRects().length))(document.getElementById('account-menu')),openDialogs:[...document.querySelectorAll('dialog[open]')].map(d=>d.id||d.className),section:document.getElementById('app')?.dataset.section||null,
  overflow:root.scrollWidth>innerWidth+1,scrollY,errors:window.qaErrors||[]};
})()'''


BASELINE_PATTERNS = ['*/design-review-studies/baseline/index.html*', '*/design-review-studies/baseline/content-preview.html*']


def fresh(s, package, patterns=None):
    """New tab per side, previous tabs closed; the package side intercepts its two entry documents."""
    c = s.c; c.session = None
    target = c.call('Target.createTarget', {'url': 'about:blank'})['targetId']
    session = c.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
    for info in c.call('Target.getTargets')['targetInfos']:
        if info['type'] == 'page' and info['targetId'] != target: c.call('Target.closeTarget', {'targetId': info['targetId']})
    c.session = session
    c.call('Page.enable'); c.call('Page.bringToFront'); c.call('Emulation.setFocusEmulationEnabled', {'enabled': True})
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': ERRORS}); c.call('Network.enable')
    c.call('Network.setCacheDisabled', {'cacheDisabled': False})
    c.call('Storage.clearDataForOrigin', {'origin': 'http://127.0.0.1:8765', 'storageTypes': 'local_storage,session_storage'})
    if package:
        c.call('Fetch.enable', {'patterns': [{'urlPattern': u, 'resourceType': 'Document', 'requestStage': 'Request'} for u in (patterns or BASELINE_PATTERNS)]})


def view_list(s, view):
    if s.js('document.querySelector("#content-index")?.dataset.view') == view: return
    s.click('#content-layout-button'); time.sleep(.5); s.click(f'#content-layout-menu [data-value={view}]'); time.sleep(1.2); s.away(); s.blur()


def switch_lang(s, locale):
    s.click('#profile'); s.click('[data-account-action=settings]'); s.click(f'[data-account-locale={locale}]')
    s.click('[data-account-action=back]'); s.key('Escape'); s.away(); s.blur(); s.wait(f'document.documentElement.lang==={json.dumps(locale)}', 10); time.sleep(1.5)


def switch_theme(s, theme):
    s.click('#profile'); s.click('[data-account-action=settings]'); s.click(f'[data-account-theme={theme}]')
    s.click('[data-account-action=back]'); s.key('Escape'); s.away(); s.blur(); s.wait(f'document.documentElement.dataset.theme==={json.dumps(theme)}', 10); time.sleep(1.5)


def arrival_steady(s):
    """The arrival labels rotate FR/EN/AR every ~4 s: shoot while both show the site language (fr)."""
    for _ in range(40):
        state = s.js('(()=>{const l=document.getElementById("entry-login"),g=document.getElementById("entry-guest");return [l?.getAttribute("lang"),g?.getAttribute("lang"),document.querySelectorAll(".entrance-action-label-outgoing").length]})()')
        if state[0] == 'fr' and state[1] == 'fr' and not state[2]: return True
        time.sleep(.25)
    return False


def capture(s, name):
    data = base64.b64decode(s.c.call('Page.captureScreenshot', {'format': 'png'}, timeout=90)['data'])
    path = CAPTURES / (name + '.png'); path.write_bytes(data); return path


def side(s, view, package, essais=None, suffix=''):
    fresh(s, package)
    essais = (() if package else NINE) if essais is None else essais
    s.reduced(view.get('reduced', True))
    s.open(view['route'], essais=essais, theme=view['theme'], lang=view['lang'], viewport=view['vp'], block_globe=view.get('block', True),
           page=view.get('page', 'content-preview.html'), settle=1.2)
    ready = '#main > .awards-coming-soon' if package else '#main > .essai-awards-a-venir'
    installed = s.wait(f'Boolean(document.querySelector({json.dumps(ready)}))', 15 if essais or package else 2)
    if view.get('globe'):
        s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(.8)
        s.js('(()=>{window.horizonStudy.globe.refreshLayout({animate:false});return true})()'); time.sleep(1.5)
    for step in view.get('setup', []): step(s)
    # An open account menu closes when its focus is removed: those views keep the focus where the click left it.
    time.sleep(view.get('settle', 1.5)); s.away()
    if not view.get('keep_focus'): s.blur()
    time.sleep(.4)
    label = view['name'] + ('-paquet' if package else '-essais' if essais else '-socle') + suffix
    states = []
    for step_name, action in [('initial', None)] + list(view.get('steps', [])):
        if action: action(s); s.away(); s.blur(); time.sleep(.6)
        steady = arrival_steady(s) if view.get('page') == 'index.html' else True
        shot = capture(s, f'{label}-{step_name}')
        after = arrival_steady(s) if view.get('page') == 'index.html' else True
        states.append({'step': step_name, 'shot': str(shot), 'steady': [steady, after], 'styles': s.js(STYLES, 90), 'extras': s.js(EXTRAS, 30)})
    return {'installed': installed, 'fulfilled': list(getattr(s.c, 'fulfilled', [])), 'states': states}


def pixels(path):
    from PIL import Image
    import numpy as np
    return np.asarray(Image.open(path).convert('RGBA'), dtype=int)


def compare(a, b):
    import numpy as np
    out = {'steps': []}
    for x, y in zip(a['states'], b['states']):
        p, q = pixels(x['shot']), pixels(y['shot'])
        step = {'step': x['step'], 'size': list(p.shape[:2])}
        if p.shape != q.shape: step.update({'pixelsDiffer': None, 'sameSize': False})
        else:
            mask = (p != q).any(axis=2); n = int(mask.sum()); step['pixelsDiffer'] = n
            if n:
                ys, xs = np.nonzero(mask); step['diffBox'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
                step['maxChannelDelta'] = int(np.abs(p - q).max())
        sa, sb = x['styles'], y['styles']
        step['elements'] = [len(sa), len(sb)]
        sig = [i for i, (u, v) in enumerate(zip(sa, sb)) if u[0] != v[0]]
        sty = [i for i, (u, v) in enumerate(zip(sa, sb)) if u[0] == v[0] and u[1] != v[1]]
        step['domMismatches'] = len(sig) + abs(len(sa) - len(sb)); step['styleMismatches'] = len(sty)
        step['firstDom'] = [[i, sa[i][0], sb[i][0]] for i in sig[:5]]; step['firstStyle'] = [[i, sa[i][0]] for i in sty[:8]]
        ea, eb = dict(x['extras']), dict(y['extras'])
        for k in ('essais', 'sheets', 'errors'): ea.pop(k, None), eb.pop(k, None)
        ea['rootVars'] = {k: v for k, v in ea['rootVars'].items() if k != 'accentNames'}; eb['rootVars'] = {k: v for k, v in eb['rootVars'].items() if k != 'accentNames'}
        if ea.get('globeVars'): ea['globeVars'] = {k: v for k, v in ea['globeVars'].items() if k != 'names'}
        if eb.get('globeVars'): eb['globeVars'] = {k: v for k, v in eb['globeVars'].items() if k != 'names'}
        step['extrasEqual'] = ea == eb
        if not step['extrasEqual']: step['extrasDiff'] = {k: [ea.get(k), eb.get(k)] for k in set(ea) | set(eb) if ea.get(k) != eb.get(k)}
        step['errors'] = {'essais': x['extras']['errors'], 'paquet': y['extras']['errors']}
        step['steady'] = {'essais': x['steady'], 'paquet': y['steady']}
        step['identical'] = (step.get('pixelsDiffer') == 0 and step['domMismatches'] == 0 and step['styleMismatches'] == 0 and step['extrasEqual']
                             and not x['extras']['errors'] and not y['extras']['errors'])
        out['steps'].append(step)
    out['identical'] = all(st['identical'] for st in out['steps']) and len(a['states']) == len(b['states'])
    return out


def load():
    try: return json.loads(RESULTS.read_text(encoding='utf-8'))
    except Exception: return {}


def save(name, value):
    data = load(); data[name] = value
    RESULTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


def summary(view, a, b, cmp):
    keep = lambda st: {k: st['extras'].get(k) for k in ('lang', 'theme', 'section', 'view', 'geometry', 'globeVars', 'rootVars', 'note', 'main', 'sheets', 'essais', 'overflow', 'accountOpen', 'openDialogs')}
    return {'view': {k: (list(v) if isinstance(v, tuple) else v) for k, v in view.items() if k not in ('setup', 'steps')},
            'steps': [st['step'] for st in a['states']], 'installed': [a['installed'], b['installed']], 'fulfilled': b['fulfilled'][-1:] if b['fulfilled'] else [],
            'essais': [keep(st) | {'logins': st['extras']['logins']} for st in a['states']], 'paquet': [keep(st) | {'logins': st['extras']['logins']} for st in b['states']],
            'comparison': cmp}


def run_view(view, attempts=3):
    for attempt in range(1, attempts + 1):
        s = None
        try:
            s = Session(CAPTURES)
            # Negative control: the bare copy (no trial, no package) must differ from the nine trials.
            # Noise control ('twice'): the same side loaded twice (WebGL raster of the real globe).
            twice = view.get('twice')
            a = side(s, view, twice == 'paquet')
            b = side(s, view, False, essais=()) if view.get('control') else side(s, view, twice != 'essais', suffix='-2' if twice else '')
            cmp = compare(a, b); result = summary(view, a, b, cmp); save(view['name'], result)
            st = [(x['step'], x.get('pixelsDiffer'), x['domMismatches'], x['styleMismatches'], x['extrasEqual'], len(x['errors']['essais']) + len(x['errors']['paquet'])) for x in cmp['steps']]
            print(view['name'], 'IDENTICAL' if cmp['identical'] else 'DIFFERENT', st, flush=True)
            return result
        except (RuntimeError, TimeoutError, OSError, AssertionError) as error:
            print(f"[{view['name']}] session error {attempt}: {error}", flush=True)
            if attempt == attempts: save(view['name'], {'error': str(error)}); return None
            time.sleep(5)
        finally:
            if s: s.close()


def comments(s):
    s.js('(()=>{document.querySelector(".cp-comments-form")?.scrollIntoView({block:"center"});return true})()'); time.sleep(1.2)


def open_filter(s):
    s.click('#content-index .cp-control-menu[data-control=category] .cp-control-trigger'); time.sleep(1.2)


def open_account(s):
    s.click('#profile'); time.sleep(1.2)


VIEWS = {
    'globe': [
        {'name': 'explorer-1440x900-clair-fr', 'route': 'explore', 'theme': 'light', 'lang': 'fr', 'vp': D, 'block': False, 'globe': True},
        {'name': 'explorer-1366x768-clair-ar', 'route': 'explore', 'theme': 'light', 'lang': 'ar', 'vp': (1366, 768, False), 'block': False, 'globe': True},
        {'name': 'explorer-667x375-clair-ar', 'route': 'explore', 'theme': 'light', 'lang': 'ar', 'vp': L, 'block': False, 'globe': True},
        {'name': 'explorer-390x844-sombre-fr', 'route': 'explore', 'theme': 'dark', 'lang': 'fr', 'vp': M, 'block': False, 'globe': True},
    ],
    'lists': [
        {'name': 'projets-320x640-clair-ar', 'route': 'projects', 'theme': 'light', 'lang': 'ar', 'vp': S, 'setup': [lambda s: view_list(s, 'grid')]},
        {'name': 'projets-1440x900-clair-fr-vrai-globe', 'route': 'projects', 'theme': 'light', 'lang': 'fr', 'vp': D, 'block': False, 'globe': True},
        {'name': 'profils-grille-1440x900-clair-fr', 'route': 'people', 'theme': 'light', 'lang': 'fr', 'vp': D, 'setup': [lambda s: view_list(s, 'grid')]},
        {'name': 'profils-liste-1440x900-clair-fr', 'route': 'people', 'theme': 'light', 'lang': 'fr', 'vp': D, 'setup': [lambda s: view_list(s, 'list')]},
        {'name': 'profils-grille-340x640-clair-fr', 'route': 'people', 'theme': 'light', 'lang': 'fr', 'vp': (340, 640, True), 'setup': [lambda s: view_list(s, 'grid')]},
        {'name': 'profils-liste-340x640-clair-fr', 'route': 'people', 'theme': 'light', 'lang': 'fr', 'vp': (340, 640, True), 'setup': [lambda s: view_list(s, 'list')]},
        {'name': 'chroniques-390x844-sombre-fr', 'route': 'journal', 'theme': 'dark', 'lang': 'fr', 'vp': M},
    ],
    'details': [
        {'name': 'fiche-commentaires-1440x900-clair-fr', 'route': f'projects/{PID}?tab=comments', 'theme': 'light', 'lang': 'fr', 'vp': D, 'setup': [comments]},
        {'name': 'fiche-commentaires-390x844-sombre-ar', 'route': f'projects/{PID}?tab=comments', 'theme': 'dark', 'lang': 'ar', 'vp': M, 'setup': [comments]},
        {'name': 'profil-leila-1440x900-clair-fr', 'route': 'people/profile-leila-mansour', 'theme': 'light', 'lang': 'fr', 'vp': D},
        {'name': 'dialogue-filtrer-1440x900-clair-fr', 'route': 'projects', 'theme': 'light', 'lang': 'fr', 'vp': D, 'setup': [open_filter]},
        {'name': 'menu-compte-1440x900-sombre-fr', 'route': 'projects', 'theme': 'dark', 'lang': 'fr', 'vp': D, 'setup': [open_account], 'keep_focus': True},
        {'name': 'menu-compte-390x844-sombre-ar', 'route': 'projects', 'theme': 'dark', 'lang': 'ar', 'vp': M, 'setup': [open_account], 'keep_focus': True},
    ],
    'arrival': [
        {'name': 'arrivee-1440x900-clair', 'route': '', 'page': 'index.html', 'theme': 'light', 'lang': None, 'vp': D, 'settle': 5},
        {'name': 'arrivee-1440x900-sombre', 'route': '', 'page': 'index.html', 'theme': 'dark', 'lang': None, 'vp': D, 'settle': 5},
        {'name': 'arrivee-390x844-sombre', 'route': '', 'page': 'index.html', 'theme': 'dark', 'lang': None, 'vp': M, 'settle': 5},
    ],
    'awards': [
        {'name': 'awards-1440x900-clair-fr', 'route': 'awards', 'theme': 'light', 'lang': 'fr', 'vp': D},
        {'name': 'awards-1440x900-clair-en', 'route': 'awards', 'theme': 'light', 'lang': 'en', 'vp': D},
        {'name': 'awards-1440x900-clair-ar', 'route': 'awards', 'theme': 'light', 'lang': 'ar', 'vp': D},
        {'name': 'awards-390x844-sombre-fr-mouvement', 'route': 'awards', 'theme': 'dark', 'lang': 'fr', 'vp': M, 'reduced': False, 'settle': 2.5},
    ],
    'controle': [
        {'name': 'controle-socle-awards-1440x900-clair-fr', 'route': 'awards', 'theme': 'light', 'lang': 'fr', 'vp': D, 'control': True},
        {'name': 'controle-socle-profils-grille-340x640-clair-fr', 'route': 'people', 'theme': 'light', 'lang': 'fr', 'vp': (340, 640, True), 'control': True,
         'setup': [lambda s: view_list(s, 'grid')]},
    ],
    'bruit': [
        {'name': 'bruit-essais-deux-fois-explorer-1366x768-clair-ar', 'route': 'explore', 'theme': 'light', 'lang': 'ar', 'vp': (1366, 768, False), 'block': False, 'globe': True, 'twice': 'essais'},
        {'name': 'bruit-paquet-deux-fois-explorer-1366x768-clair-ar', 'route': 'explore', 'theme': 'light', 'lang': 'ar', 'vp': (1366, 768, False), 'block': False, 'globe': True, 'twice': 'paquet'},
        {'name': 'reprise-explorer-1366x768-clair-ar', 'route': 'explore', 'theme': 'light', 'lang': 'ar', 'vp': (1366, 768, False), 'block': False, 'globe': True},
        {'name': 'bruit-essais-deux-fois-menu-ferme-1440x900-sombre-fr', 'route': 'projects', 'theme': 'dark', 'lang': 'fr', 'vp': D, 'setup': [open_account], 'twice': 'essais'},
        {'name': 'bruit-paquet-deux-fois-menu-ferme-1440x900-sombre-fr', 'route': 'projects', 'theme': 'dark', 'lang': 'fr', 'vp': D, 'setup': [open_account], 'twice': 'paquet'},
        {'name': 'reprise-menu-ferme-1440x900-sombre-fr', 'route': 'projects', 'theme': 'dark', 'lang': 'fr', 'vp': D, 'setup': [open_account]},
        {'name': 'bruit-essais-deux-fois-menu-compte-1440x900-sombre-fr', 'route': 'projects', 'theme': 'dark', 'lang': 'fr', 'vp': D, 'setup': [open_account], 'keep_focus': True, 'twice': 'essais'},
    ],
    'switch': [
        {'name': 'bascules-awards-1440x900', 'route': 'awards', 'theme': 'light', 'lang': 'fr', 'vp': D,
         'steps': [('langue-ar', lambda s: switch_lang(s, 'ar')), ('langue-en', lambda s: switch_lang(s, 'en')), ('theme-sombre', lambda s: switch_theme(s, 'dark'))]},
        {'name': 'bascules-profils-grille-1440x900', 'route': 'people', 'theme': 'light', 'lang': 'fr', 'vp': D, 'setup': [lambda s: view_list(s, 'grid')],
         'steps': [('langue-ar', lambda s: switch_lang(s, 'ar')), ('theme-sombre', lambda s: switch_theme(s, 'dark')), ('vue-liste', lambda s: view_list(s, 'list')), ('vue-grille', lambda s: view_list(s, 'grid'))]},
        {'name': 'bascules-profils-grille-340x640', 'route': 'people', 'theme': 'light', 'lang': 'fr', 'vp': (340, 640, True), 'setup': [lambda s: view_list(s, 'grid')],
         'steps': [('langue-en', lambda s: switch_lang(s, 'en')), ('theme-sombre', lambda s: switch_theme(s, 'dark'))]},
    ],
}

if __name__ == '__main__':
    parts = sys.argv[1:] or list(VIEWS)
    only = os.environ.get('ONLY')
    for part in parts:
        for view in VIEWS[part]:
            if only and view['name'] != only: continue
            print('==', part, view['name'], time.strftime('%H:%M:%S'), flush=True)
            run_view(view)
