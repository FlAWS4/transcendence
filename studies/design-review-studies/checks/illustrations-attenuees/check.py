"""Essai illustrations-attenuees: dark-only dimming of the inline covers; portraits and photos untouched.
Run: python3 -I studies/design-review-studies/checks/illustrations-attenuees/check.py"""
import base64, io, json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M

ID = 'illustrations-attenuees'
NETWORK, ARTICLE = 'projects/ft-transcendence-building-together', 'journal/journal-an-evening-debugging'
PROFILE, PROFILE_HOME, MINISHELL = 'people/profile-leila-mansour?tab=projects', 'people/profile-leila-mansour', 'projects/minishell-under-the-prompt?tab=media'
CAMPUS = 'explore?country=FRA&campus=paris'
COVERS = '.cp-card .cp-cover,.cp-profile-related-link .cp-cover,.cp-project-media-art:has(svg),.media-viewer-illustration svg'
RECTS_OF = lambda sel: '(()=>[...document.querySelectorAll(' + json.dumps(sel) + ')].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return [Math.max(0,r.left),Math.max(0,r.top),Math.min(innerWidth,r.right),Math.min(innerHeight,r.bottom)]}).filter(r=>r[2]-r[0]>4&&r[3]-r[1]>4))()'
PHOTOS = 'img'
# Every raster or file image must keep filter:none; the covers carry the dimming.
FILTERS = '''(()=>({images:[...document.images].filter(i=>i.getClientRects().length).map(i=>getComputedStyle(i).filter),
 covers:[...document.querySelectorAll('svg[viewBox="0 0 800 500"]')].slice(0,6).map(s=>getComputedStyle(s).filter)}))()'''


# Same error collector as helper.Session, installed again in each new tab.
ERRORS = 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'


def capture(s, name=None):
    data = base64.b64decode(s.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=60)['data'])
    if name: (HERE / (name + '.png')).write_bytes(data)
    return data


def image(data):
    from PIL import Image
    return Image.open(io.BytesIO(data)).convert('RGB')


def luminance(data, rects, scale):
    import numpy as np
    img = np.asarray(image(data), dtype=float) / 255
    lin = np.where(img <= .03928, img / 12.92, ((img + .055) / 1.055) ** 2.4)
    lum = .2126 * lin[..., 0] + .7152 * lin[..., 1] + .0722 * lin[..., 2]
    mask = np.zeros(lum.shape, bool)
    for x0, y0, x1, y1 in rects:
        mask[int(y0 * scale):int(y1 * scale), int(x0 * scale):int(x1 * scale)] = True
    return round(float(lum[mask].mean()), 4) if mask.any() else None


def diff(a, b, rects=None, scale=1):
    """Share of differing pixels (strict), on the whole image or only inside rects."""
    import numpy as np
    x, y = np.asarray(image(a), dtype=int), np.asarray(image(b), dtype=int)
    if x.shape != y.shape: return 1.0
    changed = np.abs(x - y).sum(axis=2) > 0
    if rects is None: return float(changed.mean())
    mask = np.zeros(changed.shape, bool)
    for x0, y0, x1, y1 in rects: mask[int(y0 * scale):int(y1 * scale), int(x0 * scale):int(x1 * scale)] = True
    return float(changed[mask].mean()) if mask.any() else None


def fresh(s, route, essais, theme, lang, vp, globe=False):
    """Open the view in a new tab and close the previous one: a reused tab keeps every
    earlier document alive (about +480 MB each here), which exhausts the 2.6 GB cap."""
    c = s.c; c.session = None
    target = c.call('Target.createTarget', {'url': 'about:blank'})['targetId']
    session = c.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
    for info in c.call('Target.getTargets')['targetInfos']:
        if info['type'] == 'page' and info['targetId'] != target: c.call('Target.closeTarget', {'targetId': info['targetId']})
    c.session = session
    c.call('Page.enable'); c.call('Page.bringToFront'); c.call('Emulation.setFocusEmulationEnabled', {'enabled': True})
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': ERRORS}); c.call('Network.enable'); s.reduced(True)
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=not globe)


def open_viewer(s):
    s.click('.cp-project-media-open[data-media-type=illustration]')
    s.wait('Boolean(document.querySelector("dialog.media-viewer[open] .media-viewer-illustration svg"))', 10); time.sleep(.6)


def theme(s, value):
    s.click('#profile'); s.click('[data-account-action=theme]'); s.click(f'[data-account-theme={value}]'); s.key('Escape'); s.away(); s.blur(); time.sleep(.5)


DARK = [('sombre-ordinateur', 'projects', 'fr', D, None, True), ('sombre-mobile', 'projects', 'fr', M, None, True),
        ('chroniques-sombre-ordinateur', 'journal', 'fr', D, None, True), ('ar-mobile', 'journal', 'ar', M, None, True),
        ('fiche-sombre-ordinateur', NETWORK, 'fr', D, None, True), ('article-sombre-ordinateur', ARTICLE, 'fr', D, None, False),
        ('visionneuse-sombre', NETWORK, 'fr', D, open_viewer, True), ('profil-sombre', PROFILE, 'fr', D, None, False)]
# Pages whose photos/portraits must stay pixel-identical in dark (rects of their images).
KEEP = [('profils-sombre', 'people', 'fr', D, '.cp-profile-card img', True), ('profil-accueil-sombre', PROFILE_HOME, 'fr', D, 'img', False),
        ('minishell-medias-sombre', MINISHELL, 'fr', D, '.cp-project-media-image', False)]
CAMPUS_CASE = ('campus-sombre', CAMPUS, 'fr', D, '.campus-details-photo-image', True)
LIGHT = [('clair-ordinateur', 'projects', 'fr', D, None), ('clair-mobile-ar', 'journal', 'ar', M, None),
         ('fiche-claire', NETWORK, 'fr', D, None), ('visionneuse-claire', NETWORK, 'fr', D, open_viewer), ('profil-clair', PROFILE, 'fr', D, None)]


def dark_cases(results):
    s = Session(HERE)
    try:
        for name, route, lang, vp, action, keep in DARK:
            case = {'vue': name, 'route': route, 'lang': lang, 'viewport': vp[:2]}
            for label, essais in (('avant', []), ('apres', [ID])):
                fresh(s, route, essais, 'dark', lang, vp)
                if action: action(s)
                png = capture(s, f'{label}-{name}' if keep else None)
                case[label] = {'meanCoverLuminance': luminance(png, s.js(RECTS_OF(COVERS)), 2 if vp[2] else 1), 'filters': s.js(FILTERS), 'overflow': s.overflow()}
                results['errors'][f'{label}-{name}'] = s.errors()
            results['cases'].append(case); s.record(name, {k: case[k]['meanCoverLuminance'] for k in ('avant', 'apres')})
        keep_cases(s, results, KEEP)
    finally:
        s.close()


def keep_cases(s, results, cases):
    """Photos and portraits: identical pixels inside their rects, identical image filters."""
    for name, route, lang, vp, selector, keep in cases:
        shots, rects, filters = [], None, []
        for label, essais in (('avant', []), ('apres', [ID])):
            fresh(s, route, essais, 'dark', lang, vp, globe='campus' in route)
            if 'campus' in route:
                # The sheet opens from the campus label drawn on the globe (as in the design review).
                s.wait('[...document.querySelectorAll("#globe button")].some(b=>/42 Paris/.test(b.textContent)&&b.getBoundingClientRect().width>0)', 30)
                s.js('(()=>{const b=[...document.querySelectorAll("#globe button")].find(b=>/42 Paris/.test(b.textContent)&&b.getBoundingClientRect().width>0);if(b)b.setAttribute("data-qa-campus","1");return Boolean(b)})()')
                s.click('[data-qa-campus="1"]'); s.wait('[...document.querySelectorAll(".campus-details-photo-image")].some(i=>i.complete&&i.naturalWidth)', 20); time.sleep(2.5)
            rects = s.js(RECTS_OF(selector)); filters.append(s.js(FILTERS))
            shots.append(capture(s, f'{label}-{name}' if keep else None)); results['errors'][f'{label}-{name}'] = s.errors()
        item = {'vue': name, 'route': route, 'images': len(rects), 'imagePixelsChanged': diff(*shots, rects, 2 if vp[2] else 1) if rects else None,
                'pagePixelsChanged': diff(*shots), 'imageFiltersBefore': filters[0]['images'], 'imageFiltersAfter': filters[1]['images']}
        results['keep'].append(item); s.record(name, item)


def campus_case(results):
    """Campus photos live in the Explorer sheet, which needs the real globe: own session."""
    s = Session(HERE)
    try:
        keep_cases(s, results, [CAMPUS_CASE])
    finally:
        s.close()


def light_live(results):
    s = Session(HERE)
    try:
        for name, route, lang, vp, action in LIGHT:
            shots = []
            for essais in ([], [ID]):
                fresh(s, route, essais, 'light', lang, vp)
                if action: action(s)
                shots.append(capture(s))
            item = {'vue': name, 'pixelsChanged': diff(*shots)}; results['light'].append(item); s.record(name, item)
        fresh(s, 'projects', [ID], 'dark', 'fr', D)
        s.js('(()=>{window.__noReload=1;return true})()')
        first = 'getComputedStyle(document.querySelector(".cp-card .cp-art>svg")).filter'
        live = {'dark': s.js(first)}
        theme(s, 'light'); live['light'] = s.js(first); live['themeAfterLight'] = s.js('document.documentElement.dataset.theme')
        theme(s, 'dark'); live['darkAgain'] = s.js(first); live['noReload'] = s.js('window.__noReload===1')
        results['live'] = live; s.record('live', live); results['errors']['live'] = s.errors()
    finally:
        s.close()


results = {'essai': ID, 'cases': [], 'keep': [], 'light': [], 'live': None, 'errors': {}, 'passed': False}
try:
    for step in (dark_cases, light_live, campus_case):
        try:
            step(results)
        except (TimeoutError, RuntimeError) as error:
            print('retrying', step.__name__, 'once:', error, flush=True)
            results['retried'] = results.get('retried', []) + [step.__name__]
            if step is dark_cases: results.update({'cases': [], 'keep': [k for k in results['keep'] if k['vue'] == CAMPUS_CASE[0]]})
            elif step is campus_case: results['keep'] = [k for k in results['keep'] if k['vue'] != CAMPUS_CASE[0]]
            else: results.update({'light': [], 'live': None})
            step(results)
finally:
    def lower(case): return case['apres']['meanCoverLuminance'] is not None and case['apres']['meanCoverLuminance'] < case['avant']['meanCoverLuminance']
    live = results['live'] or {}
    keep = [k for k in results['keep'] if k['images']]
    results['checks'] = {
        'darkLowerEverywhere': bool(results['cases']) and all(lower(c) for c in results['cases']),
        'imagesUnchanged': len(keep) == len(KEEP) + 1 and all(k['imagePixelsChanged'] == 0 and k['imageFiltersBefore'] == k['imageFiltersAfter'] for k in keep),
        'lightPixelIdentical': len(results['light']) == len(LIGHT) and all(item['pixelsChanged'] == 0 for item in results['light']),
        'liveSwitch': live.get('light') == 'none' and live.get('dark') == live.get('darkAgain') == 'brightness(0.8) saturate(0.9)' and bool(live.get('noReload')),
        'noOverflow': bool(results['cases']) and not any(c[k]['overflow'] for c in results['cases'] for k in ('avant', 'apres')),
        'noErrors': not any(results['errors'].values()),
    }
    results['passed'] = all(results['checks'].values())
    (HERE / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    print('passed', results['passed'], results['checks'])
