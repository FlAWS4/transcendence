"""Essai illustrations-sombres: dark remap of the inline covers (cards, details, viewer, profile).
Run: python3 -I studies/design-review-studies/checks/illustrations-sombres/check.py"""
import base64, io, json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M

ID = 'illustrations-sombres'
NETWORK, SHELL, GARDEN = 'projects/ft-transcendence-building-together', 'projects/demo-project-commands-in-layers', 'projects/demo-project-pairing-calendar'
ARTICLE, PROFILE = 'journal/journal-an-evening-debugging', 'people/profile-leila-mansour?tab=projects'
COVERS = '.cp-card .cp-cover,.cp-profile-related-link .cp-cover,.cp-project-media-art,.media-viewer-illustration svg,#detail-cover'
RECTS = '(()=>[...document.querySelectorAll(' + json.dumps(COVERS) + ')].filter(e=>e.offsetParent||e.closest("dialog[open]")).map(e=>{const r=e.getBoundingClientRect();return [Math.max(0,r.left),Math.max(0,r.top),Math.min(innerWidth,r.right),Math.min(innerHeight,r.bottom)]}).filter(r=>r[2]-r[0]>4&&r[3]-r[1]>4))()'
# Ground fill of the first covers in each place, and the accents that must keep their colour.
FILLS = '''(()=>{const ground=s=>[...document.querySelectorAll(s)].slice(0,6).map(svg=>getComputedStyle(svg.querySelector(':scope>rect')).fill);
 const accents=[...document.querySelectorAll('svg[viewBox="0 0 800 500"] [fill="#00BABC" i],svg[viewBox="0 0 800 500"] [fill="#EC3391" i]')].slice(0,40).map(e=>e.getAttribute('fill').toUpperCase()+'>'+getComputedStyle(e).fill);
 return {cards:ground('.cp-card .cp-art>svg'),detail:ground('.cp-project-media-art svg'),viewer:ground('.media-viewer-illustration svg'),profile:ground('.cp-profile-related-link .cp-art>svg'),
  accentsChanged:accents.filter(a=>!/#00BABC>rgb\\(0, 186, 188\\)|#EC3391>rgb\\(236, 51, 145\\)/.test(a)).length,accents:accents.length}})()'''
# Six motifs in card frames, then detail-style frames (inherited outline) for four of them.
BOARD = '''(()=>{import('./content-preview-art.mjs?v=1').then(m=>{
 const kinds=['shell','raycast','network','garden','path','journal'];
 const wrap=document.createElement('div');wrap.id='qa-board';
 wrap.style.cssText='position:fixed;inset:0;z-index:99999;background:var(--h42-color-bg);display:grid;grid-template-columns:repeat(4,320px);gap:22px 24px;padding:24px 36px;align-content:start;overflow:hidden';
 for(const k of kinds){const card=document.createElement('article');card.className='cp-card';card.dataset.cover=k;card.style.cssText='display:block';
  card.innerHTML='<div class="cp-cover" style="aspect-ratio:16/9"><div class="cp-art">'+m.coverArt(k)+'</div></div><p style="margin:4px 0 0;color:var(--h42-color-text);font:13px sans-serif">'+k+' (carte)</p>';wrap.append(card);}
 for(const k of ['network','shell','garden','path','journal','raycast']){const box=document.createElement('div');box.innerHTML='<div class="cp-project-media-art cp-project-media-open" style="aspect-ratio:16/9;display:block"><div data-cover="'+k+'" style="width:100%;height:100%">'+m.coverArt(k)+'</div></div><p style="margin:4px 0 0;color:var(--h42-color-text);font:13px sans-serif">'+k+' (fiche)</p>';wrap.append(box);}
 document.body.append(wrap);window.__board=true;});return true})()'''
BOARD_RECTS = '[...document.querySelectorAll("#qa-board .cp-cover,#qa-board .cp-project-media-art")].map(e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]})'
BOARD_NAMES = [k + ' carte' for k in ['shell', 'raycast', 'network', 'garden', 'path', 'journal']] + [k + ' fiche' for k in ['network', 'shell', 'garden', 'path', 'journal', 'raycast']]


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
    """Mean WCAG relative luminance of the cover pixels inside the viewport."""
    import numpy as np
    img = np.asarray(image(data), dtype=float) / 255
    lin = np.where(img <= .03928, img / 12.92, ((img + .055) / 1.055) ** 2.4)
    lum = .2126 * lin[..., 0] + .7152 * lin[..., 1] + .0722 * lin[..., 2]
    mask = np.zeros(lum.shape, bool)
    for x0, y0, x1, y1 in rects:
        mask[int(y0 * scale):int(y1 * scale), int(x0 * scale):int(x1 * scale)] = True
    return round(float(lum[mask].mean()), 4) if mask.any() else None


def diff(a, b):
    """Share of pixels differing in any channel (strict)."""
    import numpy as np
    x, y = np.asarray(image(a), dtype=int), np.asarray(image(b), dtype=int)
    return 1.0 if x.shape != y.shape else float((np.abs(x - y).sum(axis=2) > 0).mean())


def fresh(s, route, essais, theme, lang, vp):
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
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)


def open_viewer(s):
    s.click('.cp-project-media-open[data-media-type=illustration]')
    s.wait('Boolean(document.querySelector("dialog.media-viewer[open] .media-viewer-illustration svg"))', 10); time.sleep(.6)


def theme(s, value):
    s.click('#profile'); s.click('[data-account-action=theme]'); s.click(f'[data-account-theme={value}]'); s.key('Escape'); s.away(); s.blur(); time.sleep(.5)


DARK = [('sombre-ordinateur', 'projects', 'fr', D, None, True), ('sombre-mobile', 'projects', 'fr', M, None, True),
        ('chroniques-sombre-ordinateur', 'journal', 'fr', D, None, True), ('ar-mobile', 'journal', 'ar', M, None, True),
        ('fiche-sombre-ordinateur', NETWORK, 'fr', D, None, True), ('fiche-shell-sombre', SHELL, 'fr', D, None, False),
        ('fiche-garden-sombre', GARDEN, 'fr', D, None, False), ('article-sombre-ordinateur', ARTICLE, 'fr', D, None, True),
        ('visionneuse-sombre', NETWORK, 'fr', D, open_viewer, True), ('profil-sombre', PROFILE, 'fr', D, None, True)]
LIGHT = [('clair-ordinateur', 'projects', 'fr', D, None), ('clair-mobile-ar', 'journal', 'ar', M, None),
         ('fiche-claire', NETWORK, 'fr', D, None), ('visionneuse-claire', NETWORK, 'fr', D, open_viewer),
         ('profil-clair', PROFILE, 'fr', D, None)]


def dark_cases(results):
    s = Session(HERE)
    try:
        for name, route, lang, vp, action, keep in DARK:
            case = {'vue': name, 'route': route, 'lang': lang, 'viewport': vp[:2]}
            for label, essais in (('avant', []), ('apres', [ID])):
                fresh(s, route, essais, 'dark', lang, vp)
                if action: action(s)
                png = capture(s, f'{label}-{name}' if keep else None)
                case[label] = {'meanCoverLuminance': luminance(png, s.js(RECTS), 2 if vp[2] else 1), 'fills': s.js(FILLS), 'overflow': s.overflow()}
                results['errors'][f'{label}-{name}'] = s.errors()
            results['cases'].append(case); s.record(name, {k: case[k]['meanCoverLuminance'] for k in ('avant', 'apres')})
    finally:
        s.close()


def board_light_live(results):
    s = Session(HERE)
    try:
        for label, essais in (('avant', []), ('apres', [ID])):
            fresh(s, 'projects', essais, 'dark', 'fr', D); s.js(BOARD); s.wait('window.__board===true', 10); time.sleep(.8)
            png = capture(s, f'{label}-motifs')
            results['motifs'][label] = dict(zip(BOARD_NAMES, [luminance(png, [r], 1) for r in s.js(BOARD_RECTS)]))
        s.record('motifs', results['motifs'])
        # Light theme: strictly pixel-identical with and without the trial.
        for name, route, lang, vp, action in LIGHT:
            shots = []
            for essais in ([], [ID]):
                fresh(s, route, essais, 'light', lang, vp)
                if action: action(s)
                shots.append(capture(s))
            item = {'vue': name, 'pixelsChanged': diff(*shots)}; results['light'].append(item); s.record(name, item)
        # Live switch through the account menu, without reload.
        fresh(s, 'projects', [ID], 'dark', 'fr', D)
        s.js('(()=>{window.__noReload=1;return true})()')
        first = 'getComputedStyle(document.querySelector(".cp-card .cp-art>svg>rect")).fill'
        live = {'dark': s.js(first)}
        theme(s, 'light'); live['light'] = s.js(first); live['themeAfterLight'] = s.js('document.documentElement.dataset.theme')
        theme(s, 'dark'); live['darkAgain'] = s.js(first); live['themeAfterDark'] = s.js('document.documentElement.dataset.theme'); live['noReload'] = s.js('window.__noReload===1')
        results['live'] = live; s.record('live', live)
        results['errors']['live'] = s.errors()
    finally:
        s.close()


results = {'essai': ID, 'cases': [], 'motifs': {}, 'light': [], 'live': None, 'errors': {}, 'passed': False}
try:
    for step in (dark_cases, board_light_live):
        try:
            step(results)
        except (TimeoutError, RuntimeError) as error:
            print('retrying', step.__name__, 'once:', error, flush=True)
            results['retried'] = results.get('retried', []) + [step.__name__]
            if step is dark_cases: results['cases'] = []
            else: results.update({'motifs': {}, 'light': [], 'live': None})
            step(results)
finally:
    def lower(case): return case['apres']['meanCoverLuminance'] is not None and case['apres']['meanCoverLuminance'] < case['avant']['meanCoverLuminance']
    live = results['live'] or {}
    results['checks'] = {
        'darkLowerEverywhere': bool(results['cases']) and all(lower(c) for c in results['cases']),
        'accentsKept': bool(results['cases']) and all(c['apres']['fills']['accentsChanged'] == 0 for c in results['cases']),
        'lightPixelIdentical': len(results['light']) == len(LIGHT) and all(item['pixelsChanged'] == 0 for item in results['light']),
        'liveSwitch': live.get('light') == 'rgb(245, 228, 234)' and live.get('dark') == live.get('darkAgain') == 'rgb(64, 43, 57)' and bool(live.get('noReload')),
        'noOverflow': bool(results['cases']) and not any(c[k]['overflow'] for c in results['cases'] for k in ('avant', 'apres')),
        'noErrors': not any(results['errors'].values()),
    }
    results['passed'] = all(results['checks'].values())
    (HERE / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    print('passed', results['passed'], results['checks'])
