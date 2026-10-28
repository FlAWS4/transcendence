"""Essai visiter-contour-sombre: dark boundary on Visiter (arrival) and Créer un compte (account menu).
Run: python3 -I studies/design-review-studies/checks/visiter-contour-sombre/check.py"""
import base64, collections, io, json, re, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, contrast

ID = 'visiter-contour-sombre'
ERRORS = 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'
INSPECT = '''(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);
 return {rect:[r.left,r.top,r.width,r.height],color:s.color,bg:s.backgroundColor,border:s.borderTopColor+" "+s.borderTopWidth+" "+s.borderTopStyle,
  label:(e.querySelector(".entrance-action-label")||e).textContent.trim(),lang:e.getAttribute("lang"),radius:s.borderTopLeftRadius,padding:s.padding}})'''
FOCUSED = '''(()=>{const e=document.activeElement,s=getComputedStyle(e);return {id:e.id||e.dataset.accountAction||e.tagName,focusVisible:e.matches(":focus-visible"),outline:s.outlineStyle+" "+s.outlineWidth+" "+s.outlineColor,offset:s.outlineOffset}})()'''


def png(s, name=None):
    data = base64.b64decode(s.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=60)['data'])
    if name: (HERE / (name + '.png')).write_bytes(data)
    return data


def image(data):
    from PIL import Image
    import numpy as np
    return np.asarray(Image.open(io.BytesIO(data)).convert('RGB'), dtype=int)


def parse(value):
    m = re.match(r'rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)', value or '')
    return tuple(round(float(m.group(i))) for i in (1, 2, 3)) if m else None


def pixel(data, x, y, scale):
    img = image(data); return tuple(int(v) for v in img[int(y * scale), int(x * scale)])


def boundary(data, rect, scale):
    """Painted colour on the top edge (centre) and the page just outside it."""
    x, y, w, h = rect
    edge = pixel(data, x + w / 2, y + .5 / scale, scale)
    outside = pixel(data, x + w / 2, y - 6, scale)
    return edge, outside


def diff(a, b, mask=None, scale=1):
    import numpy as np
    x, y = image(a), image(b)
    if x.shape != y.shape: return 1.0
    changed = np.abs(x - y).sum(axis=2) > 0
    if mask:
        mx, my, mw, mh = [int(v * scale) for v in mask]; changed[my:my + mh, mx:mx + mw] = False
    return float(changed.mean())


def fresh(s, route, essais, theme, lang, vp, page):
    """New tab per view, previous tab closed (a reused tab keeps old documents alive)."""
    c = s.c; c.session = None
    target = c.call('Target.createTarget', {'url': 'about:blank'})['targetId']
    session = c.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
    for info in c.call('Target.getTargets')['targetInfos']:
        if info['type'] == 'page' and info['targetId'] != target: c.call('Target.closeTarget', {'targetId': info['targetId']})
    c.session = session
    c.call('Page.enable'); c.call('Page.bringToFront'); c.call('Emulation.setFocusEmulationEnabled', {'enabled': True})
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': ERRORS}); c.call('Network.enable'); s.reduced(True)
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True, page=page, settle=.4)


def tab_to(s, selector, limit=12):
    for _ in range(limit):
        s.key('Tab')
        if s.js('document.activeElement?.matches(' + json.dumps(selector) + ')'): return True
    return False


def arrival(results):
    s = Session(HERE)
    try:
        for vue, vp, theme in (('sombre-ordinateur', D, 'dark'), ('sombre-mobile', M, 'dark'), ('ordinateur', D, 'light'), ('mobile', M, 'light')):
            scale = 2 if vp[2] else 1; case = {'vue': vue, 'theme': theme}
            shots = {}
            for label, essais in (('avant', []), ('apres', [ID])):
                fresh(s, '', essais, theme, 'fr', vp, 'index.html')
                guest, login = s.js(INSPECT + '("#entry-guest")'), s.js(INSPECT + '("#entry-login")')
                shot = png(s, f'{label}-{vue}' if theme == 'dark' or vue == 'ordinateur' else None); shots[label] = shot
                edge, outside = boundary(shot, guest['rect'], scale)
                border = parse(guest['border'])
                state = {'guest': guest, 'login': login, 'edgePixel': edge, 'outsidePixel': outside,
                         'boundaryContrast': round(contrast(border, outside), 2) if border and guest['border'].split()[-1] == 'solid' and not guest['border'].startswith('rgba(0, 0, 0, 0)') else None,
                         'paintedEdgeContrast': round(contrast(edge, outside), 2), 'textContrast': round(contrast(parse(guest['color']), outside), 2),
                         'scene': s.rect('.entrance-scene')}
                # Labels keep cycling (4 s rhythm): wait for the next label, then re-measure the box.
                first = guest['label']
                s.wait(f'document.querySelector("#entry-guest .entrance-action-label")?.textContent.trim()!=={json.dumps(first)}', 9)
                later = s.js(INSPECT + '("#entry-guest")'); state['labelAfterCycle'] = later['label']; state['langAfterCycle'] = later['lang']; state['rectAfterCycle'] = later['rect']
                if theme == 'dark':
                    s.js('(()=>{document.activeElement?.blur();return true})()')
                    state['focus'] = s.js(FOCUSED) if tab_to(s, '#entry-guest') else None
                    time.sleep(.3); focus_shot = png(s, f'{label}-focus-{vue}' if vue == 'sombre-ordinateur' else None)
                    x, y, w, h = s.js(INSPECT + '("#entry-guest")')['rect']
                    ring = pixel(focus_shot, x + w / 2, y - 5 - 1 / scale, scale)   # outline-offset 5px, 2px wide
                    state['focusRingPixel'] = ring; state['focusRingContrast'] = round(contrast(ring, outside), 2)
                state['errors'] = s.errors(); case[label] = state
            # Light: identical pixels outside the cipher canvas (its glyph order varies between loads).
            if theme == 'light': case['pixelsChangedOutsideScene'] = diff(shots['avant'], shots['apres'], [case['avant']['scene'][k] for k in ('x', 'y', 'w', 'h')], scale)
            results['arrival'].append(case); s.record(vue, {k: case[k]['boundaryContrast'] for k in ('avant', 'apres')} | {'light': case.get('pixelsChangedOutsideScene')})
    finally:
        s.close()


def menu(results):
    """Créer un compte in the account menu (same text-only treatment in dark)."""
    s = Session(HERE)
    try:
        for vue, vp, theme, lang in (('menu-sombre-ordinateur', D, 'dark', 'fr'), ('menu-sombre-ar-mobile', M, 'dark', 'ar'), ('menu-ordinateur', D, 'light', 'fr')):
            scale = 2 if vp[2] else 1; case = {'vue': vue, 'theme': theme, 'lang': lang}; shots = {}
            for label, essais in (('avant', []), ('apres', [ID])):
                fresh(s, 'projects', essais, theme, lang, vp, 'content-preview.html')
                s.click('#profile'); s.wait('Boolean(document.querySelector("[data-account-action=signup]"))', 8); time.sleep(.5)
                signup = s.js(INSPECT + '("[data-account-action=signup]")'); signin = s.js(INSPECT + '("[data-account-action=signin]")')
                shot = png(s, f'{label}-{vue}'); shots[label] = shot
                edge, outside = boundary(shot, signup['rect'], scale); border = parse(signup['border'])
                menu_rect = s.rect('.account-menu')
                state = {'signup': signup, 'signin': signin, 'edgePixel': edge, 'outsidePixel': outside, 'menu': menu_rect,
                         'boundaryContrast': round(contrast(border, outside), 2) if border and not signup['border'].startswith('rgba(0, 0, 0, 0)') else None,
                         'paintedEdgeContrast': round(contrast(edge, outside), 2), 'textContrast': round(contrast(parse(signup['color']), outside), 2)}
                if theme == 'dark':
                    s.js('(()=>{document.querySelector("[data-account-action=signin]").focus();return true})()')
                    state['focus'] = s.js(FOCUSED) if tab_to(s, '[data-account-action=signup]', 3) else None
                state['errors'] = s.errors(); case[label] = state
            if theme == 'light': case['pixelsChanged'] = diff(shots['avant'], shots['apres'])
            results['menu'].append(case); s.record(vue, {k: case[k]['boundaryContrast'] for k in ('avant', 'apres')} | {'light': case.get('pixelsChanged')})
    finally:
        s.close()


results = {'essai': ID, 'arrival': [], 'menu': [], 'passed': False}
try:
    for step in (arrival, menu):
        try:
            step(results)
        except (TimeoutError, RuntimeError) as error:
            print('retrying', step.__name__, 'once:', error, flush=True)
            results.setdefault('retried', []).append(step.__name__); results[step.__name__] = []
            step(results)
finally:
    def same_rect(a, b): return all(abs(x - y) <= .5 for x, y in zip(a, b))
    dark_arrival = [c for c in results['arrival'] if c['theme'] == 'dark']
    dark_menu = [c for c in results['menu'] if c['theme'] == 'dark']
    results['checks'] = {
        'boundaryAtLeast3': len(dark_arrival) == 2 and len(dark_menu) == 2 and all((c['apres']['boundaryContrast'] or 0) >= 3 and c['apres']['paintedEdgeContrast'] >= 3 for c in dark_arrival + dark_menu),
        'baselineHadNoBoundary': all(c['avant']['boundaryContrast'] is None for c in dark_arrival + dark_menu),
        'rectsIdentical': bool(results['arrival']) and all(same_rect(c['avant']['guest']['rect'], c['apres']['guest']['rect']) and same_rect(c['avant']['login']['rect'], c['apres']['login']['rect']) for c in results['arrival'])
                          and all(same_rect(c['avant']['signup']['rect'], c['apres']['signup']['rect']) for c in results['menu']),
        'pinkTextKept': all(c['apres'][k]['color'] == c['avant'][k]['color'] == 'rgb(237, 52, 145)' for c, k in [(c, 'guest') for c in dark_arrival] + [(c, 'signup') for c in dark_menu]),
        'labelsCycle': bool(results['arrival']) and all(c['apres']['labelAfterCycle'] != c['apres']['guest']['label'] and same_rect(c['apres']['rectAfterCycle'], c['apres']['guest']['rect']) for c in results['arrival']),
        'focusVisible': all(c['apres'].get('focus') and c['apres']['focus']['focusVisible'] and 'solid' in c['apres']['focus']['outline'] for c in dark_arrival + dark_menu)
                        and all(c['apres']['focusRingContrast'] >= 3 for c in dark_arrival),
        'lightIdentical': all(c.get('pixelsChangedOutsideScene') == 0 for c in results['arrival'] if c['theme'] == 'light') and all(c.get('pixelsChanged') == 0 for c in results['menu'] if c['theme'] == 'light'),
        'noErrors': not any(c[k]['errors'] for c in results['arrival'] + results['menu'] for k in ('avant', 'apres')),
    }
    results['passed'] = all(results['checks'].values())
    (HERE / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    print('passed', results['passed'], results['checks'])
