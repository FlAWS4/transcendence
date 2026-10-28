"""Trial awards-a-venir: before/after captures and measurements (14 Oct 2026).
Run: python3 -I studies/design-review-studies/checks/awards-a-venir/check.py [part ...]
Parts: views-1 views-2 sections wordmark arrival arrival-globe keyboard overlay extremes others a11y (default: all).
A partial run keeps the other parts of results.json and recomputes every criterion.
Short sessions run one after another (one headless Chrome at a time). The globe module is blocked,
except in arrival-globe, which plays the real Visit -> globe -> Awards path once with motion."""
import base64, io, json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, L, contrast
from PIL import Image
import numpy as np

ID = 'awards-a-venir'
COPY = {'fr': 'Les 42 Awards arrivent bientôt.', 'en': '42 Awards are coming soon.', 'ar': 'جوائز 42 قادمة قريبًا.'}
PROBE = r'''(()=>{
const app=document.getElementById('app'),n=document.querySelector('.essai-awards-a-venir'),p=n&&n.querySelector('p'),i=n&&n.querySelector('svg');
const R=e=>{if(!e)return null;const r=e.getBoundingClientRect();return r.width||r.height?{x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}:null};
const cs=n&&getComputedStyle(n),ps=p&&getComputedStyle(p),is=i&&getComputedStyle(i),as=getComputedStyle(app);
const texts=[],walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let t;
while((t=walk.nextNode())){const s=t.textContent.trim(),e=t.parentElement;if(!s||e.closest('.header,.dock-shell,.icon-library,.sr-only,#announcement,script,style'))continue;
 let shown=true;for(let a=e;a;a=a.parentElement){const c=getComputedStyle(a);if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0){shown=false;break}}
 const r=e.getBoundingClientRect();if(shown&&r.width>1&&r.height>1&&r.bottom>0&&r.top<innerHeight)texts.push(s.slice(0,60))}
const tabbable=[...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(e=>!e.disabled&&e.tabIndex>=0&&!e.closest('[inert]')&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>e.id||(e.dataset.section?'nav:'+e.dataset.section:'')||e.className||e.tagName);
const ind=document.querySelector('.nav-indicator');
return {section:app.dataset.section,entry:document.body.dataset.entry,lang:document.documentElement.lang,dir:document.documentElement.dir,theme:document.documentElement.dataset.theme,
 present:Boolean(n),display:cs?cs.display:null,opacity:cs?+cs.opacity:null,note:R(n),p:R(p),icon:R(i),text:p?p.textContent:null,pLang:p?p.lang:null,pDir:p?p.dir:null,
 color:ps?ps.color:null,iconColor:is?is.color:null,fontSize:ps?ps.fontSize:null,lineHeight:ps?ps.lineHeight:null,fontWeight:ps?ps.fontWeight:null,
 lines:p&&ps&&p.getClientRects().length?Math.round(p.getBoundingClientRect().height/parseFloat(ps.lineHeight)):null,clipped:p&&p.getClientRects().length?p.scrollWidth>p.clientWidth+1:null,
 iconHidden:i?i.getAttribute('aria-hidden'):null,focusableInside:Boolean(n&&n.querySelector('a,button,input,[tabindex]')),pointerEvents:cs?cs.pointerEvents:null,
 dock:R(document.querySelector('.dock-shell')),indicator:R(ind),indicatorTransform:ind?getComputedStyle(ind).transform:null,header:R(document.querySelector('.header')),
 fadeEnd:parseFloat(as.getPropertyValue('--header-fade-end')),wordmark:document.getElementById('brand-wordmark')?.dataset.wordmarkText||null,
 brandLabel:document.querySelector('.header .brand')?.getAttribute('aria-label')||null,visibleTexts:texts,tabbable}})()'''
NOTE_STATE = '''(()=>{const n=document.querySelector('.essai-awards-a-venir'),c=n&&getComputedStyle(n),p=n&&n.querySelector('p');return {section:document.getElementById('app').dataset.section,entry:document.body.dataset.entry,present:Boolean(n),display:c?c.display:null,opacity:c?+c.opacity:null,shown:p?p.checkVisibility({checkVisibilityCSS:true}):null,text:n?n.textContent:null}})()'''
WORDMARK_RECORDER = '''(()=>{const w=document.getElementById('brand-wordmark'),log=window.qaWordmark=[],t0=performance.now();let last='';
const rec=()=>{const k=w.dataset.wordmarkText+'|'+w.dataset.wordmarkPhase;if(k===last)return;last=k;log.push({t:Math.round(performance.now()-t0),text:w.dataset.wordmarkText,phase:w.dataset.wordmarkPhase})};
new MutationObserver(rec).observe(w,{attributes:true,attributeFilter:['data-wordmark-text','data-wordmark-phase']});rec();return true})()'''
FADE_TRACE = '''(()=>{const fade=window.qaFade=[],t0=performance.now(),app=document.getElementById('app');
const step=()=>{const t=performance.now()-t0,n=document.querySelector('.essai-awards-a-venir'),c=n&&getComputedStyle(n);fade.push([Math.round(t),app.dataset.section,c?c.display:null,c?+(+c.opacity).toFixed(3):null]);if(t<1500)requestAnimationFrame(step)};step();return true})()'''
ENTRY_RECORDER = '''(()=>{const log=window.qaEntry=[],t0=performance.now(),app=document.getElementById('app');
const rec=()=>{const n=document.querySelector('.essai-awards-a-venir'),c=n&&getComputedStyle(n);log.push({t:Math.round(performance.now()-t0),entry:document.body.dataset.entry,section:app.dataset.section,display:c?c.display:null,opacity:c?+c.opacity:null})};
new MutationObserver(rec).observe(document.body,{attributes:true,attributeFilter:['data-entry']});new MutationObserver(rec).observe(app,{attributes:true,attributeFilter:['data-section']});rec();return true})()'''
FOCUS = r'''(()=>{const e=document.activeElement;if(!e||e===document.body||e===document.documentElement)return {id:'body'};
const s=getComputedStyle(e),r=e.getBoundingClientRect();
return {id:(e.closest('.essai-awards-a-venir')?'NOTE:':'')+(e.id||(e.dataset.section?'nav:'+e.dataset.section:'')||e.className||e.tagName),focusVisible:e.matches(':focus-visible'),
 outline:s.outlineStyle+' '+s.outlineWidth+' '+s.outlineColor,rect:{x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}}})()'''

PARTS = ['views-1', 'views-2', 'sections', 'wordmark', 'arrival', 'arrival-globe', 'keyboard', 'overlay', 'extremes', 'others', 'a11y']
results = {'id': ID, 'date': time.strftime('%Y-%m-%d %H:%M'), 'views': [], 'sections': [], 'navigation': [], 'liveSettings': [], 'wordmark': {},
           'arrival': {}, 'arrivalGlobe': {}, 'combined': {}, 'keyboard': {}, 'overlay': {}, 'extremes': [], 'others': [], 'a11y': {}, 'criteria': {}, 'passed': False}


def rgb(value):
    return tuple(int(float(v)) for v in value[value.index('(') + 1:value.index(')')].split(',')[:3])


def content_box(state):
    boxes = [b for b in (state.get('icon'), state.get('p')) if b]
    if not boxes: return None
    x0, y0 = min(b['x'] for b in boxes), min(b['y'] for b in boxes)
    x1, y1 = max(b['x'] + b['w'] for b in boxes), max(b['y'] + b['h'] for b in boxes)
    return {'x': x0, 'y': y0, 'w': x1 - x0, 'h': y1 - y0}


def load(path):
    return np.asarray(Image.open(path).convert('RGB'), dtype=int)


def pixel_diffs(a, b, box, scale, header, dock):
    """Exact differing pixels: outside the note's own box, inside it, in the header band and in the dock band."""
    x = load(a); y = load(b)
    if x.shape != y.shape: return None
    diff = np.any(x != y, axis=2); inside = 0
    if box:
        x0, y0 = max(0, int((box['x'] - 4) * scale)), max(0, int((box['y'] - 4) * scale))
        x1, y1 = int((box['x'] + box['w'] + 4) * scale) + 1, int((box['y'] + box['h'] + 4) * scale) + 1
        inside = int(diff[y0:y1, x0:x1].sum()); diff = diff.copy(); diff[y0:y1, x0:x1] = False
    head = int(diff[:int((header['y'] + header['h']) * scale)].sum()) if header else None
    band = int(diff[max(0, int((dock['y'] - 8) * scale)):int((dock['y'] + dock['h'] + 8) * scale)].sum()) if dock else None
    return {'outsideNote': int(diff.sum()), 'insideNote': inside, 'headerBand': head, 'dockBand': band}


def diff_bbox(a, b, scale):
    """Bounding box (CSS px) of every differing pixel, computed independently of the note's measured box."""
    x, y = (load(a), load(b)) if isinstance(a, Path) else (a, b)
    if x.shape != y.shape: return {'shapeMismatch': True}
    d = np.any(x != y, axis=2)
    if not d.any(): return {'pixels': 0}
    ys, xs = np.nonzero(d)
    return {'pixels': int(d.sum()), 'x': round(xs.min() / scale, 1), 'y': round(ys.min() / scale, 1),
            'right': round((xs.max() + 1) / scale, 1), 'bottom': round((ys.max() + 1) / scale, 1)}


def inside(bbox, box, margin=4):
    if not bbox or bbox.get('pixels') == 0: return True
    if not box or 'x' not in bbox: return False
    return bbox['x'] >= box['x'] - margin and bbox['y'] >= box['y'] - margin and \
        bbox['right'] <= box['x'] + box['w'] + margin and bbox['bottom'] <= box['y'] + box['h'] + margin


def sample_bg(path, state, scale):
    """Median background colour in a 5x5 patch just outside the start of the text line."""
    im = load(path); p = state['p']
    cx, cy = int((p['x'] - 14) * scale), int((p['y'] + p['h'] / 2) * scale)
    patch = im[cy - 2:cy + 3, cx - 2:cx + 3].reshape(-1, 3)
    return tuple(int(v) for v in np.median(patch, axis=0))


def grab(s):
    """Screenshot kept in memory (pages the trial must leave untouched)."""
    data = s.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=60)['data']
    return np.asarray(Image.open(io.BytesIO(base64.b64decode(data))).convert('RGB'), dtype=int)


def run(name, body, attempts=2):
    """One short Chrome session; a cap kill or a timeout gets one fresh retry."""
    for attempt in range(attempts):
        s = Session(HERE)
        try:
            return body(s)
        except (RuntimeError, TimeoutError) as error:
            print(name, 'attempt', attempt + 1, 'failed:', error, flush=True)
            if attempt + 1 == attempts: return {'failed': str(error)}
        finally:
            s.close()


VIEWS = [  # (vue, theme, lang, viewport)
    ('ordinateur', 'light', 'fr', D), ('sombre-ordinateur', 'dark', 'fr', D), ('sombre-ordinateur-en', 'dark', 'en', D),
    ('ar-ordinateur', 'light', 'ar', D), ('paysage', 'light', 'fr', L),
    ('mobile', 'light', 'fr', M), ('sombre-mobile', 'dark', 'fr', M), ('en-mobile', 'light', 'en', M),
    ('ar-sombre-mobile', 'dark', 'ar', M), ('petit', 'light', 'fr', S),
]


def views(chunk):
    def body(s):
        out = []
        for vue, theme, lang, vp in chunk:
            scale = 2 if vp[2] else 1
            s.open('awards', theme=theme, lang=lang, viewport=vp, block_globe=True)
            before = s.shot('avant-' + vue); base = s.js(PROBE); err_before = s.errors(); of_before = s.overflow()
            s.open('awards', essais=[ID], theme=theme, lang=lang, viewport=vp, block_globe=True)
            after = s.shot('apres-' + vue); state = s.js(PROBE); err_after = s.errors(); of_after = s.overflow()
            box = content_box(state)
            bg = sample_bg(after, state, scale) if state['p'] else None
            case = {'vue': vue, 'theme': theme, 'lang': lang, 'viewport': list(vp[:2]),
                    'before': {k: base[k] for k in ('present', 'section', 'visibleTexts', 'tabbable', 'dock', 'header', 'indicator', 'wordmark', 'brandLabel')},
                    'after': state, 'contentBox': box,
                    'clearance': {'aboveFadeEnd': round(box['y'] - state['fadeEnd'], 1), 'aboveDock': round(state['dock']['y'] - (box['y'] + box['h']), 1),
                                  'belowHeader': round(box['y'] - (state['header']['y'] + state['header']['h']), 1),
                                  'centreOffsetFromViewport': round(box['y'] + box['h'] / 2 - vp[1] / 2, 1)} if box else None,
                    'pixels': pixel_diffs(before, after, box, scale, state['header'], state['dock']),
                    'diffBBox': diff_bbox(before, after, scale),
                    'background': bg, 'textContrast': round(contrast(rgb(state['color']), bg), 2) if bg else None,
                    'iconContrast': round(contrast(rgb(state['iconColor']), bg), 2) if bg else None,
                    'overflow': [of_before, of_after], 'errors': {'avant': err_before, 'apres': err_after}}
            out.append(case); s.record(vue, {k: case[k] for k in ('clearance', 'pixels', 'diffBBox', 'textContrast')})
        return out
    return body


def sections(s):
    out = []
    for route in ['explore', 'explore?country=FRA&campus=paris', 'projects', 'people', 'journal', 'projects/ft-transcendence-building-together',
                  'projects/minishell-under-the-prompt?tab=comments', 'people/profile-leila-mansour?tab=path', 'journal/journal-an-evening-debugging']:
        s.open(route, essais=[ID], viewport=D, block_globe=True)
        st = s.js(NOTE_STATE); st['route'] = route; st['visibleTexts'] = [t for t in s.js(PROBE)['visibleTexts'] if t in COPY.values()]
        st['errors'] = s.errors(); out.append(st); s.record('section ' + route, st)
    # Dock clicks inside one page: the note follows the section, never the previous page.
    s.open('awards', essais=[ID], viewport=M, theme='dark', lang='fr', block_globe=True)
    nav = [dict(s.js(NOTE_STATE), step='awards (ouverture)')]
    for target in ['projects', 'awards', 'explore', 'awards', 'people', 'awards', 'journal']:
        s.click(f'.main-nav button[data-section={target}]'); time.sleep(1.0)
        nav.append(dict(s.js(NOTE_STATE), step=target))
    # Account settings change language and theme live on Awards.
    s.click('.main-nav button[data-section=awards]'); time.sleep(1.0)
    live = []
    for locale, theme in [('en', 'light'), ('ar', 'dark'), ('fr', 'light')]:
        s.settings(locale, theme); time.sleep(.6)
        st = s.js(PROBE)
        live.append({'locale': locale, 'wantTheme': theme, **{k: st[k] for k in ('lang', 'dir', 'theme', 'display', 'text', 'pLang', 'pDir', 'color', 'iconColor', 'lines', 'clipped')}})
        s.shot(f'apres-reglages-{locale}-{theme}-mobile')
    return {'sections': out, 'navigation': nav, 'liveSettings': live, 'errors': s.errors()}


def wordmark(s):
    s.reduced(False)
    out = {}
    for label, ess in [('avant', []), ('apres', [ID])]:
        s.open('projects', essais=ess, viewport=D, block_globe=True)
        s.js(WORDMARK_RECORDER); s.js(FADE_TRACE)
        s.click('.main-nav button[data-section=awards]')
        time.sleep(2.0)
        to_awards = s.js('qaWordmark.splice(0)'); settled = s.js(PROBE); fade_in = s.js('qaFade')
        s.js(FADE_TRACE)
        s.click('.main-nav button[data-section=projects]')
        time.sleep(2.0)
        back = s.js('qaWordmark.splice(0)'); returned = s.js(PROBE); fade_out = s.js('qaFade')
        entered = [f for f in fade_in if f[1] == 'awards']
        fade = [f for f in entered if f[0] - entered[0][0] <= 600][::3] if entered and ess else None
        left = [f for f in fade_out if f[1] != 'awards']
        right_after = {'firstFrameOutside': left[0] if left else None, 'shownOutsideAwards': any(f[2] not in (None, 'none') for f in left)}
        def summary(log):
            start = next((e['t'] for e in log if e['phase'] == 'switching'), None)
            end = next((e['t'] for e in log if e['phase'] == 'settled' and start is not None and e['t'] >= start), None)
            return {'texts': [e['text'] for e in log], 'durationMs': end - start if start is not None and end is not None else None, 'final': log[-1]['text'] if log else None}
        out[label] = {'toAwards': summary(to_awards), 'toProjects': summary(back), 'noteFadeFrames': fade,
                      'settled': {k: settled[k] for k in ('wordmark', 'brandLabel', 'dock', 'indicator', 'indicatorTransform', 'display', 'opacity')},
                      'noteRightAfterLeaving': right_after, 'returned': {k: returned[k] for k in ('wordmark', 'brandLabel', 'dock', 'indicator', 'display')},
                      'errors': s.errors()}
        s.record('wordmark ' + label, out[label]['toAwards'])
    return out


def arrival(s):
    s.open('awards', essais=[ID], viewport=D, block_globe=True, page='index.html')
    s.js(ENTRY_RECORDER)
    start = s.js(NOTE_STATE)
    s.click('#entry-guest')
    reached_error = s.wait('document.body.dataset.entry==="error"', 40)
    during = s.js(NOTE_STATE)
    s.click('#entrance-access button:nth-child(3)')  # "Continue" without the globe
    reached_welcome = s.wait('document.body.dataset.entry==="welcome"', 20); time.sleep(1.2)
    final = s.js(PROBE)
    s.shot('apres-arrivee-sans-globe-ordinateur')
    res = {'start': start, 'reachedError': reached_error, 'duringError': during, 'reachedWelcome': reached_welcome, 'log': s.js('qaEntry'),
           'final': {k: final[k] for k in ('entry', 'section', 'display', 'text', 'wordmark')}, 'errors': s.errors()}
    # Every trial at once, as the gallery may combine them: informative only.
    order = s.js('window.horizonEssais.order')
    s.open('awards', essais=order, viewport=D, block_globe=True)
    st = s.js(PROBE); box = content_box(st)
    res['combined'] = {'active': s.js('document.documentElement.dataset.essais'), 'display': st['display'], 'text': st['text'], 'contentBox': box,
                       'aboveDock': round(st['dock']['y'] - (box['y'] + box['h']), 1) if box else None,
                       'belowHeader': round(box['y'] - (st['header']['y'] + st['header']['h']), 1) if box else None,
                       'aboveFadeEnd': round(box['y'] - st['fadeEnd'], 1) if box else None, 'errors': s.errors()}
    s.shot('combinaison-tous-essais-ordinateur')
    return res


def arrival_globe(s):
    s.reduced(False)
    s.open('awards', essais=[ID], viewport=D, block_globe=False, page='index.html')
    s.js(ENTRY_RECORDER)
    s.click('#entry-guest')
    reached = s.wait('["welcome","error"].includes(document.body.dataset.entry)', 120)
    retried = s.js('document.body.dataset.entry') == 'error'
    if retried: s.click('#entrance-access button:nth-child(1)')
    reached = s.wait('document.body.dataset.entry==="welcome"', 120); time.sleep(1.5)
    final = s.js(PROBE)
    return {'reachedWelcome': reached, 'retriedAfterGlobeError': retried, 'log': s.js('qaEntry'), 'final': {k: final[k] for k in ('entry', 'section', 'display', 'opacity', 'text', 'wordmark')}, 'errors': s.errors()}


def keyboard(s):
    """Real Tab presses from the top of the page, with and without the trial; focus ring captured on the dock's Awards button."""
    out = {}
    for vue, theme, lang, vp in [('ordinateur', 'light', 'fr', D), ('ar-sombre-mobile', 'dark', 'ar', M)]:
        scale = 2 if vp[2] else 1; case = {}
        for side, ess in (('avant', []), ('apres', [ID])):
            s.open('awards', essais=ess, theme=theme, lang=lang, viewport=vp, block_globe=True)
            box = content_box(s.js(PROBE)); steps = []; shot = None
            for _ in range(9):
                s.key('Tab'); steps.append(s.js(FOCUS))
                if steps[-1]['id'] == 'nav:awards' and shot is None: shot = s.shot(f'{side}-focus-{vue}')
            case[side] = {'steps': steps, 'shot': shot.name if shot else None, 'box': box, 'errors': s.errors()}
        a, b = case['avant'], case['apres']
        case['sameSequence'] = [x['id'] for x in a['steps']] == [x['id'] for x in b['steps']]
        case['focusInNote'] = any(x['id'].startswith('NOTE:') for x in b['steps'])
        case['focusRing'] = [x for x in b['steps'] if x['id'] == 'nav:awards'][:1]
        case['pixels'] = pixel_diffs(HERE / a['shot'], HERE / b['shot'], b['box'], scale, None, None) if a['shot'] and b['shot'] else None
        out[vue] = case; s.record('keyboard ' + vue, {k: case[k] for k in ('sameSequence', 'focusInNote', 'pixels')})
    return out


def overlay(s):
    """Account menu opened over Awards: the panel must still cover the note, with nothing else moving."""
    out = {}
    for side, ess in (('avant', []), ('apres', [ID])):
        s.open('awards', essais=ess, theme='light', lang='fr', viewport=M, block_globe=True)
        box = content_box(s.js(PROBE))
        s.click('#profile'); time.sleep(.8); s.away()
        menu = s.rect('#account-menu')
        top = s.js('(()=>{const n=document.querySelector(".essai-awards-a-venir p");if(!n)return null;const r=n.getBoundingClientRect(),e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e?(e.closest("#account-menu")?"account-menu":(e.closest(".essai-awards-a-venir")?"note":e.tagName+"."+e.className)):null})()')
        out[side] = {'menu': menu, 'box': box, 'topAtNoteCentre': top, 'shot': s.shot(f'{side}-menu-compte-mobile').name, 'errors': s.errors()}
        s.key('Escape')
    a, b = HERE / out['avant']['shot'], HERE / out['apres']['shot']
    x, y = load(a), load(b); d = np.any(x != y, axis=2); m = out['apres']['menu']; box = out['apres']['box']
    in_menu = np.zeros_like(d)
    if m: in_menu[int(m['y'] * 2):int((m['y'] + m['h']) * 2) + 1, int(m['x'] * 2):int((m['x'] + m['w']) * 2) + 1] = True
    in_note = np.zeros_like(d)
    if box: in_note[int((box['y'] - 4) * 2):int((box['y'] + box['h'] + 4) * 2) + 1, int((box['x'] - 4) * 2):int((box['x'] + box['w'] + 4) * 2) + 1] = True
    out['overlap'] = bool(m and box and m['x'] < box['x'] + box['w'] and box['x'] < m['x'] + m['w'] and m['y'] < box['y'] + box['h'] and box['y'] < m['y'] + m['h'])
    out['pixels'] = {'insideMenu': int((d & in_menu).sum()), 'insideNoteOutsideMenu': int((d & in_note & ~in_menu).sum()), 'elsewhere': int((d & ~in_menu & ~in_note).sum())}
    s.record('overlay', {k: out[k] for k in ('overlap', 'pixels')})
    return out


def extremes(s):
    """Viewports outside the required set, to document the limits: short landscape and very narrow portrait."""
    out = []
    for vue, vp in (('paysage-court', (568, 320, True)), ('etroit', (280, 653, True))):
        s.open('awards', essais=[ID], viewport=vp, block_globe=True)
        st = s.js(PROBE); box = content_box(st)
        s.shot('apres-' + vue)
        out.append({'vue': vue, 'viewport': list(vp[:2]), 'contentBox': box, 'fadeEnd': st['fadeEnd'], 'header': st['header'], 'dock': st['dock'],
                    'lines': st['lines'], 'clipped': st['clipped'], 'overflow': s.overflow(), 'text': st['text'],
                    'aboveFadeEnd': round(box['y'] - st['fadeEnd'], 1) if box else None, 'aboveDock': round(st['dock']['y'] - (box['y'] + box['h']), 1) if box else None,
                    'belowHeader': round(box['y'] - (st['header']['y'] + st['header']['h']), 1) if box else None, 'errors': s.errors()})
        s.record('extreme ' + vue, out[-1])
    return out


OTHERS = [('projects', D, 'light', 'fr'), ('people/profile-leila-mansour', M, 'dark', 'fr'), ('journal', S, 'light', 'ar'),
          ('projects/ft-transcendence-building-together?tab=comments', M, 'light', 'en'), ('explore', D, 'dark', 'fr')]


def others(s):
    """Pages the trial must not touch: exact screenshot comparison with and without it (a second copy capture measures any noise)."""
    out = []
    for route, vp, theme, lang in OTHERS:
        s.open(route, theme=theme, lang=lang, viewport=vp, block_globe=True, settle=2.0); before = grab(s)
        s.open(route, essais=[ID], theme=theme, lang=lang, viewport=vp, block_globe=True, settle=2.0); after = grab(s); state = s.js(NOTE_STATE)
        case = {'route': route, 'viewport': list(vp[:2]), 'theme': theme, 'lang': lang, 'diff': diff_bbox(before, after, 2 if vp[2] else 1), 'note': state, 'errors': s.errors()}
        if case['diff'].get('pixels'):
            # Noise of the copy itself: a second load without the trial, compared with the first one and with the trial page.
            s.open(route, theme=theme, lang=lang, viewport=vp, block_globe=True, settle=2.0); again = grab(s)
            case['copyNoise'] = diff_bbox(before, again, 2 if vp[2] else 1); case['trialVsSecondCopy'] = diff_bbox(after, again, 2 if vp[2] else 1)
        out.append(case); s.record('other ' + route, case)
    return out


MOTION = '''(()=>{const n=document.querySelector('.essai-awards-a-venir'),c=n&&getComputedStyle(n);return c?{animationName:c.animationName,animationDuration:c.animationDuration,display:c.display}:null})()'''


def a11y(s):
    """Accessibility tree as Chrome exposes it (sentence present on Awards only, icon ignored) and the fade under both motion preferences."""
    out = {'tree': [], 'motion': {}}
    s.c.call('Accessibility.enable')
    for route, lang in (('awards', 'fr'), ('awards', 'ar'), ('projects', 'fr')):
        s.open(route, essais=[ID], lang=lang, viewport=D, block_globe=True)
        nodes = s.c.call('Accessibility.getFullAXTree', timeout=60)['nodes']
        named = [{'role': n.get('role', {}).get('value'), 'ignored': n.get('ignored', False)} for n in nodes if (n.get('name') or {}).get('value') in COPY.values()]
        out['tree'].append({'route': route, 'lang': lang, 'exposed': [x for x in named if not x['ignored']], 'ignoredCount': sum(x['ignored'] for x in named),
                            'iconAriaHidden': s.js('(()=>{const i=document.querySelector(".essai-awards-a-venir svg");return i?i.closest("[aria-hidden=true]")!==null:null})()')})
        s.record('a11y ' + route + ' ' + lang, out['tree'][-1])
    for label, reduce in (('reduite', True), ('libre', False)):
        s.reduced(reduce)
        s.open('awards', essais=[ID], viewport=D, block_globe=True)
        out['motion'][label] = s.js(MOTION)
    s.reduced(True)
    out['errors'] = s.errors()
    return out


def criteria():
    v = [c for c in results['views'] if isinstance(c, dict) and 'after' in c]
    c = results['criteria'] = {}
    c['emptyBefore'] = len(v) == len(VIEWS) and all(not x['before']['present'] and x['before']['visibleTexts'] == [] for x in v)
    c['textPerLanguage'] = len(v) == len(VIEWS) and all(x['after']['display'] == 'grid' and x['after']['opacity'] == 1 and x['after']['text'] == COPY[x['lang']] and x['after']['pLang'] == x['lang']
                               and x['after']['pDir'] == ('rtl' if x['lang'] == 'ar' else 'ltr') and x['after']['visibleTexts'] == [COPY[x['lang']]] for x in v)
    c['oneLineNotClipped'] = len(v) == len(VIEWS) and all(x['after']['lines'] == 1 and not x['after']['clipped'] for x in v)
    c['clearOfHeaderFadeAndDock'] = len(v) == len(VIEWS) and all(x['clearance']['aboveFadeEnd'] >= 0 and x['clearance']['aboveDock'] >= 16 for x in v)
    c['nothingElseChanged'] = len(v) == len(VIEWS) and all(x['pixels'] and x['pixels']['outsideNote'] == 0 and x['pixels']['headerBand'] == 0 and x['pixels']['dockBand'] == 0
                                  and x['pixels']['insideNote'] > 0 for x in v)
    c['diffBoxWithinNote'] = len(v) == len(VIEWS) and all(x.get('diffBBox', {}).get('pixels') and inside(x['diffBBox'], x['contentBox']) for x in v)
    c['sameTabOrderAndDock'] = len(v) == len(VIEWS) and all(x['before']['tabbable'] == x['after']['tabbable'] and x['before']['dock'] == x['after']['dock']
                                   and x['before']['indicator'] == x['after']['indicator'] and x['before']['wordmark'] == x['after']['wordmark'] == 'AWARDS'
                                   and not x['after']['focusableInside'] and x['after']['iconHidden'] == 'true' and x['after']['pointerEvents'] == 'none' for x in v)
    c['textContrastAA'] = len(v) == len(VIEWS) and all(x['textContrast'] >= 4.5 for x in v)
    c['noOverflowNoErrors'] = len(v) == len(VIEWS) and all(x['overflow'] == [False, False] and not x['errors']['avant'] and not x['errors']['apres'] for x in v)
    c['hiddenInOtherSections'] = bool(results['sections']) and all(x['display'] == 'none' and x.get('shown') is False and not x['visibleTexts'] and not x['errors'] for x in results['sections'])
    c['followsDockNavigation'] = bool(results['navigation']) and all((x['display'] == 'grid') == (x['section'] == 'awards') for x in results['navigation'])
    c['liveLanguageAndTheme'] = bool(results['liveSettings']) and all(x['text'] == COPY[x['locale']] and x['lang'] == x['locale'] and x['theme'] == x['wantTheme']
                                                                      and x['pDir'] == ('rtl' if x['locale'] == 'ar' else 'ltr') for x in results['liveSettings'])
    w = results['wordmark']
    c['wordmarkAndDockUnchanged'] = isinstance(w, dict) and 'avant' in w and 'apres' in w and \
        w['avant']['toAwards']['texts'] == w['apres']['toAwards']['texts'] and w['avant']['toProjects']['texts'] == w['apres']['toProjects']['texts'] and \
        w['apres']['toAwards']['final'] == 'AWARDS' and w['apres']['toProjects']['final'] == 'HORIZON' and \
        abs((w['avant']['toAwards']['durationMs'] or 0) - (w['apres']['toAwards']['durationMs'] or 0)) <= 120 and \
        abs((w['avant']['toProjects']['durationMs'] or 0) - (w['apres']['toProjects']['durationMs'] or 0)) <= 120 and \
        w['avant']['settled']['dock'] == w['apres']['settled']['dock'] and w['avant']['settled']['indicator'] == w['apres']['settled']['indicator'] and \
        not w['apres']['noteRightAfterLeaving']['shownOutsideAwards'] and w['apres']['returned']['display'] == 'none' and not w['avant']['errors'] and not w['apres']['errors']
    a = results['arrival']
    c['hiddenDuringArrival'] = isinstance(a, dict) and bool(a.get('reachedWelcome')) and \
        all(e['display'] == 'none' for e in a['log'] if e['entry'] != 'welcome') and a['final']['display'] == 'grid' and a['final']['wordmark'] == 'AWARDS'
    g = results['arrivalGlobe']
    c['hiddenDuringRealArrival'] = isinstance(g, dict) and bool(g.get('reachedWelcome')) and \
        all(e['display'] == 'none' for e in g['log'] if e['entry'] != 'welcome') and g['final']['display'] == 'grid' and g['final']['wordmark'] == 'AWARDS'
    k = results['keyboard']
    c['keyboardUnchanged'] = isinstance(k, dict) and len(k) == 2 and all(isinstance(x, dict) and x.get('sameSequence') and not x['focusInNote'] and x['focusRing']
                                                                        and x['focusRing'][0]['focusVisible'] and x['pixels'] and x['pixels']['outsideNote'] == 0
                                                                        and not x['avant']['errors'] and not x['apres']['errors'] for x in k.values())
    o = results['overlay']
    # elementFromPoint skips the pointer-free note, so topAtNoteCentre is informative only.
    c['accountMenuUnchangedAround'] = isinstance(o, dict) and 'pixels' in o and bool(o['avant']['menu']) and o['apres']['menu'] == o['avant']['menu'] and \
        o['pixels']['elsewhere'] == 0 and not o['avant']['errors'] and not o['apres']['errors']
    # Identical to the copy: no differing pixel, or none against a second copy load when the copy itself flickers.
    c['otherPagesPixelIdentical'] = len(results['others']) == len(OTHERS) and all(isinstance(x, dict) and 'diff' in x and x['note']['display'] == 'none' and not x['errors']
                                                                                and (x['diff'].get('pixels') == 0 or (x.get('copyNoise', {}).get('pixels') and x.get('trialVsSecondCopy', {}).get('pixels') == 0))
                                                                                for x in results['others'])
    t = results['a11y']
    c['exposedOnAwardsOnly'] = isinstance(t, dict) and len(t.get('tree', [])) == 3 and \
        all(bool(x['exposed']) and x['iconAriaHidden'] is True for x in t['tree'] if x['route'] == 'awards') and \
        all(not x['exposed'] for x in t['tree'] if x['route'] != 'awards') and \
        t['motion'].get('reduite', {}).get('animationName') == 'none' and t['motion'].get('libre', {}).get('animationName') == 'essai-awards-a-venir-in' and not t['errors']
    results['passed'] = all(bool(value) for value in c.values())


wanted = sys.argv[1:] or PARTS
unknown = [p for p in wanted if p not in PARTS]
if unknown: sys.exit(f'unknown part(s): {unknown}; expected {PARTS}')
if wanted != PARTS and (HERE / 'results.json').exists():
    results.update({k: v for k, v in json.loads((HERE / 'results.json').read_text()).items() if k not in ('date', 'criteria', 'passed')})
try:
    if 'views-1' in wanted or 'views-2' in wanted:
        kept = {c.get('vue'): c for c in results['views'] if isinstance(c, dict)}
        for part, chunk in (('views-1', VIEWS[:5]), ('views-2', VIEWS[5:])):
            if part not in wanted: continue
            got = run(part, views(chunk))
            for case in (got if isinstance(got, list) else []): kept[case['vue']] = case
            if not isinstance(got, list): kept[part] = dict(got, vue=part)
        results['views'] = [kept[vue] for vue, *_ in VIEWS if vue in kept] + [c for name, c in kept.items() if name in ('views-1', 'views-2')]
    if 'sections' in wanted:
        nav = run('sections', sections) or {}
        results.update({k: nav.get(k) for k in ('sections', 'navigation', 'liveSettings')}); results['sectionsErrors'] = nav.get('errors') or nav.get('failed')
    if 'wordmark' in wanted: results['wordmark'] = run('wordmark', wordmark)
    if 'arrival' in wanted:
        arr = run('arrival', arrival) or {}; results['combined'] = arr.pop('combined', None); results['arrival'] = arr
    if 'arrival-globe' in wanted: results['arrivalGlobe'] = run('arrival-globe', arrival_globe)
    if 'keyboard' in wanted: results['keyboard'] = run('keyboard', keyboard)
    if 'overlay' in wanted: results['overlay'] = run('overlay', overlay)
    if 'extremes' in wanted: results['extremes'] = run('extremes', extremes)
    if 'others' in wanted: results['others'] = run('others', others)
    if 'a11y' in wanted: results['a11y'] = run('a11y', a11y)
    criteria()
finally:
    results['date'] = time.strftime('%Y-%m-%d %H:%M')
    (HERE / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    print('criteria', json.dumps(results['criteria'], ensure_ascii=False))
    print('passed', results['passed'])
