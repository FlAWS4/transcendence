"""Counter-check of illustrations-attenuees (independent of check.py): 320 px, live language
and theme switches without reload, and no filter on any image file while it is active.
Run: python3 -I studies/design-review-studies/checks/illustrations-attenuees/contre-verification.py"""
import base64, io, json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S

ID = 'illustrations-attenuees'
ERRORS = 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'
COVERS = '.cp-card .cp-cover,.cp-profile-related-link .cp-cover,.cp-project-media-art:has(svg),.media-viewer-illustration svg'
RECTS = '(()=>[...document.querySelectorAll(' + json.dumps(COVERS) + ')].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return [Math.max(0,r.left),Math.max(0,r.top),Math.min(innerWidth,r.right),Math.min(innerHeight,r.bottom)]}).filter(r=>r[2]-r[0]>4&&r[3]-r[1]>4))()'
FILTERS = '''(()=>{const covers=[...document.querySelectorAll('svg[viewBox="0 0 800 500"]')].map(s=>getComputedStyle(s).filter);
 const others=[...document.querySelectorAll('img,svg:not([viewBox="0 0 800 500"]),video,canvas')].filter(e=>getComputedStyle(e).filter!=='none');
 return {covers:covers.length,dimmed:covers.filter(f=>f==='brightness(0.8) saturate(0.9)').length,undimmed:covers.filter(f=>f==='none').length,otherFiltered:others.map(e=>e.tagName+'.'+(e.getAttribute('class')||'')).slice(0,6),images:document.images.length}})()'''


def png(s, name=None):
    data = base64.b64decode(s.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=60)['data'])
    if name: (HERE / (name + '.png')).write_bytes(data)
    return data


def luminance(data, rects, scale):
    from PIL import Image
    import numpy as np
    img = np.asarray(Image.open(io.BytesIO(data)).convert('RGB'), dtype=float) / 255
    lin = np.where(img <= .03928, img / 12.92, ((img + .055) / 1.055) ** 2.4)
    lum = .2126 * lin[..., 0] + .7152 * lin[..., 1] + .0722 * lin[..., 2]
    mask = np.zeros(lum.shape, bool)
    for x0, y0, x1, y1 in rects: mask[int(y0 * scale):int(y1 * scale), int(x0 * scale):int(x1 * scale)] = True
    return round(float(lum[mask].mean()), 4) if mask.any() else None


def fresh(s, route, essais, theme, lang, vp):
    """New tab per view, previous tab closed (a reused tab keeps old documents alive)."""
    c = s.c; c.session = None
    target = c.call('Target.createTarget', {'url': 'about:blank'})['targetId']
    session = c.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
    for info in c.call('Target.getTargets')['targetInfos']:
        if info['type'] == 'page' and info['targetId'] != target: c.call('Target.closeTarget', {'targetId': info['targetId']})
    c.session = session
    c.call('Page.enable'); c.call('Page.bringToFront'); c.call('Emulation.setFocusEmulationEnabled', {'enabled': True})
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': ERRORS}); c.call('Network.enable'); s.reduced(True)
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)


def account(s, screen, key, value):
    s.click('#profile'); s.click(f'[data-account-action={screen}]'); s.click(f'[data-account-{key}={value}]'); s.key('Escape'); s.away(); s.blur(); time.sleep(.8)


results = {'essai': ID, 'petit': {}, 'langue': {}, 'theme': {}, 'images': [], 'errors': {}, 'passed': False}
s = Session(HERE)
try:
    # 1. Small screen (320 x 640), dark.
    for label, essais in (('avant', []), ('apres', [ID])):
        fresh(s, 'projects', essais, 'dark', 'fr', S)
        shot = png(s, f'{label}-petit-sombre')
        results['petit'][label] = {'meanCoverLuminance': luminance(shot, s.js(RECTS), 2), 'overflow': s.overflow(), 'filters': s.js(FILTERS)}
        results['errors'][f'petit-{label}'] = s.errors()
    s.record('petit', results['petit'])
    # 2. Live language switch (FR -> AR) in dark, then 3. live theme switch dark -> light -> dark.
    fresh(s, 'journal', [ID], 'dark', 'fr', D); s.js('(()=>{window.__noReload=1;return true})()')
    before = s.js(FILTERS); account(s, 'language', 'locale', 'ar')
    results['langue'] = {'avant': before, 'apres': s.js(FILTERS), 'lang': s.js('document.documentElement.lang+" "+document.dir')}
    account(s, 'theme', 'theme', 'light'); light = s.js(FILTERS); account(s, 'theme', 'theme', 'dark')
    results['theme'] = {'clair': light, 'sombreAgain': s.js(FILTERS), 'theme': s.js('document.documentElement.dataset.theme'), 'noReload': s.js('window.__noReload===1')}
    results['errors']['live'] = s.errors(); s.record('langue', results['langue']); s.record('theme', results['theme'])
    # 4. Pages with portraits and image media: images, icons and canvases keep the baseline filters.
    for route in ('people', 'people/profile-leila-mansour', 'projects/minishell-under-the-prompt?tab=media'):
        item = {'route': route}
        for label, essais in (('avant', []), ('apres', [ID])):
            fresh(s, route, essais, 'dark', 'fr', D); item[label] = s.js(FILTERS); results['errors'][f'{route}-{label}'] = s.errors()
        results['images'].append(item); s.record('images', item)
finally:
    s.close()
    p, l, t = results['petit'], results['langue'], results['theme']
    results['checks'] = {
        'smallScreenDimmed': bool(p.get('apres')) and p['apres']['meanCoverLuminance'] < p['avant']['meanCoverLuminance'] and not p['avant']['overflow'] and not p['apres']['overflow']
                             and p['apres']['filters']['undimmed'] == 0 and p['apres']['filters']['dimmed'] > 0 and p['avant']['filters']['dimmed'] == 0,
        'liveLanguage': bool(l) and l['lang'] == 'ar rtl' and l['avant']['undimmed'] == 0 and l['apres']['undimmed'] == 0 and l['apres']['dimmed'] > 0,
        'liveTheme': bool(t) and t['noReload'] and t['theme'] == 'dark' and t['clair']['dimmed'] == 0 and t['clair']['covers'] > 0 and t['sombreAgain']['undimmed'] == 0,
        'imagesUntouched': len(results['images']) == 3 and all(i['avant']['otherFiltered'] == i['apres']['otherFiltered'] and i['avant']['images'] == i['apres']['images'] for i in results['images'])
                           and sum(i['apres']['images'] for i in results['images']) > 0 and p['avant']['filters']['otherFiltered'] == p['apres']['filters']['otherFiltered'],
        'noErrors': not any(results['errors'].values()),
    }
    results['passed'] = all(results['checks'].values())
    (HERE / 'contre-verification.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    print('passed', results['passed'], results['checks'])
