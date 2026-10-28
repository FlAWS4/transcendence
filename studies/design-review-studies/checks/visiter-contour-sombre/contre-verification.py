"""Counter-check of visiter-contour-sombre (independent of check.py): live theme toggle on
the arrival, 320 x 640 and 667 x 375 phones, Arabic arrival with its label cycle, account
menu rebuilt by a live language switch, and the arrival combined with roles-couleur.
Run: python3 -I studies/design-review-studies/checks/visiter-contour-sombre/contre-verification.py"""
import base64, io, json, re, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, L, contrast

ID = 'visiter-contour-sombre'
ERRORS = 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'
BOX = '''(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);
 return {rect:[r.left,r.top,r.width,r.height],border:s.borderTopColor,borderWidth:s.borderTopWidth,color:s.color,label:(e.querySelector(".entrance-action-label")||e).textContent.trim()}})'''


def png(s, name=None):
    data = base64.b64decode(s.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=60)['data'])
    if name: (HERE / (name + '.png')).write_bytes(data)
    return data


def painted(data, rect, scale):
    """Contrast of the painted top edge (centre column) against the page 6 px above it."""
    from PIL import Image
    import numpy as np
    img = np.asarray(Image.open(io.BytesIO(data)).convert('RGB'), dtype=int)
    x, y, w, h = rect; cx = int((x + w / 2) * scale)
    edge = tuple(int(v) for v in img[int(y * scale), cx]); outside = tuple(int(v) for v in img[int((y - 6) * scale), cx])
    return {'edge': edge, 'outside': outside, 'contrast': round(contrast(edge, outside), 2)}


def fresh(s, route, essais, theme, lang, vp, page='index.html'):
    """New tab per view, previous tab closed (a reused tab keeps old documents alive)."""
    c = s.c; c.session = None
    target = c.call('Target.createTarget', {'url': 'about:blank'})['targetId']
    session = c.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
    for info in c.call('Target.getTargets')['targetInfos']:
        if info['type'] == 'page' and info['targetId'] != target: c.call('Target.closeTarget', {'targetId': info['targetId']})
    c.session = session
    c.call('Page.enable'); c.call('Page.bringToFront'); c.call('Emulation.setFocusEmulationEnabled', {'enabled': True})
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': ERRORS}); c.call('Network.enable'); s.reduced(True)
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True, page=page, settle=.6)


def tap(s, x, y):
    for kind in ('mousePressed', 'mouseReleased'):
        s.c.call('Input.dispatchMouseEvent', {'type': kind, 'x': x, 'y': y, 'button': 'left', 'clickCount': 1})
    time.sleep(.6)


def account(s, screen, key, value):
    s.click('#profile'); s.click(f'[data-account-action={screen}]'); s.click(f'[data-account-{key}={value}]'); s.key('Escape'); s.away(); s.blur(); time.sleep(.8)


results = {'essai': ID, 'basculeTheme': {}, 'formats': [], 'arabe': {}, 'menuLangue': {}, 'avecRoles': {}, 'errors': {}, 'passed': False}
s = Session(HERE)
try:
    # 1. Live theme toggle of the arrival (its background is the theme button): dark -> light -> dark.
    fresh(s, '', [ID], 'dark', 'fr', D); s.js('(()=>{window.__noReload=1;return true})()')
    states = [s.js(BOX + '("#entry-guest")')]
    for _ in range(2): tap(s, 40, 40); states.append(s.js(BOX + '("#entry-guest")') | {'theme': s.js('document.documentElement.dataset.theme')})
    results['basculeTheme'] = {'states': states, 'noReload': s.js('window.__noReload===1')}
    results['errors']['bascule'] = s.errors(); s.record('bascule', [(x.get('theme'), x['border']) for x in states])
    # Reference: light arrival without the trial.
    fresh(s, '', [], 'light', 'fr', D); results['basculeTheme']['lightBaseline'] = s.js(BOX + '("#entry-guest")')
    # 2. Small and landscape phones, dark: same boxes, painted boundary of at least 3:1, no overflow.
    for vue, vp in (('petit', S), ('paysage', L)):
        case = {'vue': vue}
        for label, essais in (('avant', []), ('apres', [ID])):
            fresh(s, '', essais, 'dark', 'fr', vp)
            guest, login = s.js(BOX + '("#entry-guest")'), s.js(BOX + '("#entry-login")')
            shot = png(s, f'{label}-{vue}-sombre')
            case[label] = {'guest': guest, 'login': login, 'painted': painted(shot, guest['rect'], 2), 'overflow': s.overflow()}
            results['errors'][f'{vue}-{label}'] = s.errors()
        results['formats'].append(case); s.record(vue, {k: case[k]['painted']['contrast'] for k in ('avant', 'apres')})
    # 3. Arabic arrival (mobile, dark): same box before/after and through one label change.
    for label, essais in (('avant', []), ('apres', [ID])):
        fresh(s, '', essais, 'dark', 'ar', M)
        first = s.js(BOX + '("#entry-guest")')
        s.wait(f'document.querySelector("#entry-guest .entrance-action-label")?.textContent.trim()!=={json.dumps(first["label"])}', 9)
        later = s.js(BOX + '("#entry-guest")')
        results['arabe'][label] = {'first': first, 'later': later, 'painted': painted(png(s, f'{label}-ar-mobile-sombre'), first['rect'], 2), 'dir': s.js('document.dir')}
        results['errors'][f'arabe-{label}'] = s.errors()
    s.record('arabe', {k: [results['arabe'][k]['first']['label'], results['arabe'][k]['later']['label']] for k in ('avant', 'apres')})
    # 4. Account menu rebuilt by a live language switch (FR -> AR), dark.
    fresh(s, 'projects', [ID], 'dark', 'fr', D, page='content-preview.html'); s.js('(()=>{window.__noReload=1;return true})()')
    account(s, 'language', 'locale', 'ar'); s.click('#profile'); s.wait('Boolean(document.querySelector("[data-account-action=signup]"))', 6); time.sleep(.4)
    results['menuLangue'] = {'signup': s.js(BOX + '("[data-account-action=signup]")'), 'lang': s.js('document.documentElement.lang'), 'noReload': s.js('window.__noReload===1')}
    results['errors']['menu'] = s.errors(); s.record('menuLangue', results['menuLangue'])
    # 5. Arrival with roles-couleur too: Visiter keeps its boundary, the sign-in dialog still opens.
    fresh(s, '', [ID, 'roles-couleur'], 'dark', 'fr', D)
    guest = s.js(BOX + '("#entry-guest")'); s.click('#entry-login')
    results['avecRoles'] = {'active': s.js('document.documentElement.dataset.essais'), 'guest': guest, 'dialog': s.wait('Boolean(document.querySelector("#dialog[open][data-kind=login]"))', 8)}
    results['errors']['avecRoles'] = s.errors(); s.record('avecRoles', results['avecRoles'])
finally:
    s.close()
    def same(a, b): return all(abs(x - y) <= .5 for x, y in zip(a, b))
    b, f, a, m, r = results['basculeTheme'], results['formats'], results['arabe'], results['menuLangue'], results['avecRoles']
    boundary = 'rgb(112, 131, 131)'
    results['checks'] = {
        'liveThemeToggle': bool(b.get('states')) and len(b['states']) == 3 and b['noReload'] and b['states'][0]['border'] == boundary and b['states'][1].get('theme') == 'light'
                           and b['states'][1]['border'] == b['lightBaseline']['border'] and b['states'][2].get('theme') == 'dark' and b['states'][2]['border'] == boundary,
        'phonesKeepBoxes': len(f) == 2 and all(same(c['avant'][k]['rect'], c['apres'][k]['rect']) for c in f for k in ('guest', 'login')),
        'phonesBoundary3': len(f) == 2 and all(c['apres']['painted']['contrast'] >= 3 and c['avant']['painted']['contrast'] < 1.2 for c in f),
        'phonesNoOverflow': len(f) == 2 and not any(c[k]['overflow'] for c in f for k in ('avant', 'apres')),
        'arabicCycle': bool(a.get('apres')) and a['apres']['dir'] == 'rtl' and a['apres']['first']['label'] != a['apres']['later']['label'] and same(a['apres']['first']['rect'], a['apres']['later']['rect'])
                       and same(a['avant']['first']['rect'], a['apres']['first']['rect']) and a['apres']['painted']['contrast'] >= 3,
        'menuAfterLanguage': bool(m) and m['lang'] == 'ar' and m['noReload'] and (m['signup'] or {}).get('border') == boundary,
        'withRolesCouleur': bool(r) and r['active'] == 'roles-couleur visiter-contour-sombre' and r['guest']['border'] == boundary and r['dialog'],
        'noErrors': not any(results['errors'].values()),
    }
    results['passed'] = all(results['checks'].values())
    (HERE / 'contre-verification.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    print('passed', results['passed'], results['checks'])
