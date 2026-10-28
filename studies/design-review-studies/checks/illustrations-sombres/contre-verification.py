"""Counter-check of illustrations-sombres (independent of check.py): 320 px, live language
and theme switches without reload, every SVG node after the switch back to light, the
group's trials combined, and the exclusive pair.
Run: python3 -I studies/design-review-studies/checks/illustrations-sombres/contre-verification.py"""
import base64, io, json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S

ID = 'illustrations-sombres'
DETAIL = 'projects/ft-transcendence-building-together'
ERRORS = 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'
COVERS = '.cp-card .cp-cover,.cp-profile-related-link .cp-cover,.cp-project-media-art:has(svg),.media-viewer-illustration svg'
RECTS = '(()=>[...document.querySelectorAll(' + json.dumps(COVERS) + ')].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return [Math.max(0,r.left),Math.max(0,r.top),Math.min(innerWidth,r.right),Math.min(innerHeight,r.bottom)]}).filter(r=>r[2]-r[0]>4&&r[3]-r[1]>4))()'
# Light-ground nodes whose painted fill/stroke still equals their attribute (= not remapped).
# Grounds are the first rect of the four light motifs and the journal page.
UNMAPPED = '''(()=>{const light=['#DCECE7','#F5E4EA','#DCEDE7','#ECE8DD','#F1EFDF'];const hex=v=>{const m=v.match(/\\d+/g);return m?'#'+m.slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join('').toUpperCase():v};
 const nodes=[...document.querySelectorAll('svg[viewBox="0 0 800 500"] [fill]')].filter(e=>light.includes(e.getAttribute('fill').toUpperCase()));
 return {grounds:nodes.length,unmapped:nodes.filter(e=>hex(getComputedStyle(e).fill)===e.getAttribute('fill').toUpperCase()).length}})()'''
# Every node of every cover: painted value equals its attribute (no remap left after going back to light).
ALL_ATTR = '''(()=>{const hex=v=>{const m=v.match(/[\\d.]+/g);return m&&m.length>=3?'#'+m.slice(0,3).map(n=>Math.round(+n).toString(16).padStart(2,'0')).join('').toUpperCase():v};let n=0,off=[];
 for(const e of document.querySelectorAll('svg[viewBox="0 0 800 500"] *')){for(const k of ['fill','stroke']){const a=e.getAttribute(k);if(!a||a==='none')continue;n++;if(hex(getComputedStyle(e)[k])!==a.toUpperCase())off.push(k+':'+a+'>'+getComputedStyle(e)[k])}}
 const boxes=[...document.querySelectorAll('.cp-cover')].map(c=>getComputedStyle(c).backgroundColor);return {checked:n,different:off.slice(0,8),differentCount:off.length,coverBackgrounds:[...new Set(boxes)]}})()'''


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


results = {'essai': ID, 'petit': {}, 'langue': {}, 'theme': {}, 'combinaison': {}, 'exclusif': {}, 'errors': {}, 'passed': False}
s = Session(HERE)
try:
    # 1. Small screen (320 x 640), dark: lower luminance, no overflow.
    for label, essais in (('avant', []), ('apres', [ID])):
        fresh(s, 'projects', essais, 'dark', 'fr', S)
        shot = png(s, f'{label}-petit-sombre')
        results['petit'][label] = {'meanCoverLuminance': luminance(shot, s.js(RECTS), 2), 'overflow': s.overflow(), 'grounds': s.js(UNMAPPED)}
        results['errors'][f'petit-{label}'] = s.errors()
    s.record('petit', results['petit'])
    # 2. Live language switch (FR -> AR) in dark: the list is rebuilt, the remap still applies.
    fresh(s, 'projects', [ID], 'dark', 'fr', D); s.js('(()=>{window.__noReload=1;return true})()')
    before = s.js(UNMAPPED); account(s, 'language', 'locale', 'ar')
    results['langue'] = {'avant': before, 'apres': s.js(UNMAPPED), 'lang': s.js('document.documentElement.lang+" "+document.dir'), 'noReload': s.js('window.__noReload===1'),
                         'meanCoverLuminance': luminance(png(s), s.js(RECTS), 1)}
    results['errors']['langue'] = s.errors(); s.record('langue', results['langue'])
    # 3. Live theme switch on a detail page (dark -> light -> dark): back in light, every node paints its own attribute.
    fresh(s, DETAIL, [ID], 'dark', 'fr', D); s.js('(()=>{window.__noReload=1;return true})()')
    dark = s.js(UNMAPPED); account(s, 'theme', 'theme', 'light')
    light = s.js(ALL_ATTR); account(s, 'theme', 'theme', 'dark')
    results['theme'] = {'sombre': dark, 'clair': light, 'sombreAgain': s.js(UNMAPPED), 'theme': s.js('document.documentElement.dataset.theme'), 'noReload': s.js('window.__noReload===1')}
    results['errors']['theme'] = s.errors(); s.record('theme', results['theme'])
    # 4. Combined with the other trials of the group, and the exclusive pair (attenuees listed second is ignored).
    group = [ID, 'roles-couleur', 'visiter-contour-sombre', 'illustrations-variees']
    fresh(s, 'projects', group, 'dark', 'fr', D)
    results['combinaison'] = {'active': s.js('document.documentElement.dataset.essais'), 'grounds': s.js(UNMAPPED), 'meanCoverLuminance': luminance(png(s), s.js(RECTS), 1), 'overflow': s.overflow()}
    results['errors']['combinaison'] = s.errors(); s.record('combinaison', results['combinaison'])
    fresh(s, 'projects', [ID, 'illustrations-attenuees'], 'dark', 'fr', D)
    results['exclusif'] = {'active': s.js('document.documentElement.dataset.essais'), 'ignored': s.js('[...window.horizonEssais.ignored]'),
                           'svgFilter': s.js('getComputedStyle(document.querySelector(".cp-card .cp-art>svg")).filter'), 'grounds': s.js(UNMAPPED)}
    results['errors']['exclusif'] = s.errors(); s.record('exclusif', results['exclusif'])
finally:
    s.close()
    p, l, t, c, x = results['petit'], results['langue'], results['theme'], results['combinaison'], results['exclusif']
    results['checks'] = {
        'smallScreenDarker': bool(p.get('apres')) and p['apres']['meanCoverLuminance'] < p['avant']['meanCoverLuminance'] and not p['avant']['overflow'] and not p['apres']['overflow'] and p['apres']['grounds']['unmapped'] == 0,
        'liveLanguage': bool(l) and l['lang'] == 'ar rtl' and l['noReload'] and l['avant']['unmapped'] == 0 and l['apres']['unmapped'] == 0 and l['apres']['grounds'] > 0,
        'liveTheme': bool(t) and t['noReload'] and t['theme'] == 'dark' and t['sombre']['unmapped'] == 0 and t['sombreAgain']['unmapped'] == 0 and t['clair']['differentCount'] == 0 and t['clair']['checked'] > 0,
        'groupCombined': bool(c) and c['active'] == ' '.join(['illustrations-sombres', 'roles-couleur', 'visiter-contour-sombre', 'illustrations-variees']) and c['grounds']['unmapped'] == 0 and not c['overflow'],
        'exclusivePair': bool(x) and x['active'] == ID and x['ignored'] == ['illustrations-attenuees'] and x['svgFilter'] == 'none' and x['grounds']['unmapped'] == 0,
        'noErrors': not any(results['errors'].values()),
    }
    results['passed'] = all(results['checks'].values())
    (HERE / 'contre-verification.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    print('passed', results['passed'], results['checks'])
