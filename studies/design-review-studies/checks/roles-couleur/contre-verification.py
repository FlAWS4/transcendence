"""Counter-check of roles-couleur (independent of check.py): the arrival sign-up dialog
(opened through the hidden account menu, as the interface cannot), pages without these
buttons stay pixel-identical, and live theme and language switches without reload.
Run: python3 -I studies/design-review-studies/checks/roles-couleur/contre-verification.py"""
import base64, io, json, re, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, contrast

ID = 'roles-couleur'
ERRORS = 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'
STYLE = '''(sel=>{const e=document.querySelector(sel);if(!e)return null;const s=getComputedStyle(e),d=e.closest("dialog"),r=e.getBoundingClientRect();
 return {text:e.textContent.trim(),color:s.color,bg:s.backgroundColor,border:s.borderTopColor+" "+s.borderTopWidth+" "+s.borderTopStyle,shadow:s.boxShadow,
  surface:d?getComputedStyle(d).backgroundColor:null,size:[Math.round(r.width*100)/100,Math.round(r.height*100)/100],radius:s.borderTopLeftRadius,padding:s.padding,dir:d?.getAttribute("dir")||document.dir}})'''
SIGNUP_PRIMARY = '#dialog[open][data-kind=signup] #dialog-content>button:first-of-type'
SIGNUP_SECONDARY = '#dialog[open][data-kind=signup] #dialog-content>button:last-of-type'
APPLY = '.cp-project-filter-dialog[open] .cp-project-filter-apply'
PROJECT = 'projects/ft-transcendence-building-together'


def rgb(value):
    m = re.match(r'rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)', value or '')
    return (tuple(round(float(m.group(i))) for i in (1, 2, 3)), float(m.group(4) or 1)) if m else (None, 0)


def text_contrast(style):
    """Text against the button fill, or against the dialog surface when the fill is transparent."""
    color, _ = rgb(style['color']); bg, alpha = rgb(style['bg'])
    if alpha < 1: bg, alpha = rgb(style['surface'])
    return round(contrast(color, bg), 2) if color and bg and alpha == 1 else None


def png(s):
    return base64.b64decode(s.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=60)['data'])


def diff(a, b, mask=None, scale=1):
    """Changed pixels (strict): share, positions and largest channel step."""
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(io.BytesIO(a)).convert('RGB'), dtype=int); y = np.asarray(Image.open(io.BytesIO(b)).convert('RGB'), dtype=int)
    if x.shape != y.shape: return {'share': 1.0, 'pixels': None, 'step': None}
    step = np.abs(x - y).max(axis=2); changed = step > 0
    if mask:
        mx, my, mw, mh = [int(v * scale) for v in mask]; changed[max(0, my):my + mh, max(0, mx):mx + mw] = False
    ys, xs = np.nonzero(changed)
    return {'share': float(changed.mean()), 'pixels': [[int(a), int(b)] for a, b in zip(xs[:20], ys[:20])], 'step': int(step[changed].max()) if len(xs) else 0}


def fresh(s, route, essais, theme, lang, vp, page='content-preview.html'):
    """New tab per view, previous tab closed (a reused tab keeps old documents alive)."""
    c = s.c; c.session = None
    target = c.call('Target.createTarget', {'url': 'about:blank'})['targetId']
    session = c.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
    for info in c.call('Target.getTargets')['targetInfos']:
        if info['type'] == 'page' and info['targetId'] != target: c.call('Target.closeTarget', {'targetId': info['targetId']})
    c.session = session
    c.call('Page.enable'); c.call('Page.bringToFront'); c.call('Emulation.setFocusEmulationEnabled', {'enabled': True})
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': ERRORS}); c.call('Network.enable'); s.reduced(True)
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True, page=page)


def account(s, screen, key, value):
    s.click('#profile'); s.click(f'[data-account-action={screen}]'); s.click(f'[data-account-{key}={value}]'); s.key('Escape'); s.away(); s.blur(); time.sleep(.8)


def open_filter(s):
    s.click('#content-category-button'); s.wait('Boolean(document.querySelector("dialog.cp-project-filter-dialog[open]"))', 8); time.sleep(.5)
    out = s.js(STYLE + '(' + json.dumps(APPLY) + ')'); s.key('Escape'); time.sleep(.5); return out


UNAFFECTED = [('projets-clair', 'projects', 'light', 'fr', D), ('projets-sombre', 'projects', 'dark', 'fr', D),
              ('fiche-sombre', 'projects/ft-transcendence-building-together', 'dark', 'fr', D), ('profil-sombre-ar-mobile', 'people/profile-leila-mansour', 'dark', 'ar', M)]
results = {'essai': ID, 'inscriptionArrivee': [], 'inchanges': [], 'apresAction': [], 'live': {}, 'errors': {}, 'passed': False}
s = Session(HERE)
try:
    # 1. Arrival sign-up dialog: the account menu is hidden on the arrival, so it is opened by script.
    for theme in ('light', 'dark'):
        case = {'theme': theme}
        for label, essais in (('avant', []), ('apres', [ID])):
            fresh(s, '', essais, theme, 'fr', D, page='index.html'); time.sleep(.5)
            s.js('(()=>{document.getElementById("profile").click();return true})()'); s.wait('Boolean(document.querySelector("[data-account-action=signup]"))', 6)
            s.js('(()=>{document.querySelector("[data-account-action=signup]").click();return true})()')
            opened = s.wait('Boolean(document.querySelector("#dialog[open][data-kind=signup]"))', 8); time.sleep(.6)
            primary, secondary = s.js(STYLE + '(' + json.dumps(SIGNUP_PRIMARY) + ')'), s.js(STYLE + '(' + json.dumps(SIGNUP_SECONDARY) + ')')
            case[label] = {'opened': opened, 'entryStillClosed': s.js('document.body.dataset.entry!=="welcome"'), 'primary': primary, 'secondary': secondary,
                           'primaryContrast': text_contrast(primary) if primary else None, 'secondaryContrast': text_contrast(secondary) if secondary else None}
            results['errors'][f'inscription-{theme}-{label}'] = s.errors()
        results['inscriptionArrivee'].append(case); s.record('inscription', {theme: {k: (case[k]['primary'] or {}).get('bg') for k in ('avant', 'apres')}})
    # 2. Pages that show none of these buttons stay pixel-identical (the arrival cipher canvas excluded).
    #    Any change is compared with a control trial whose rules have no target on these pages
    #    (visiter-contour-sombre): a pixel changed by both comes from loading a stylesheet, not from this trial.
    for name, route, theme, lang, vp in UNAFFECTED + [('arrivee-sombre', '', 'dark', 'fr', D)]:
        shots, scene = [], None
        page = 'index.html' if name.startswith('arrivee') else 'content-preview.html'
        for essais in ([], [ID]):
            fresh(s, route, essais, theme, lang, vp, page=page)
            if page == 'index.html': r = s.rect('.entrance-scene'); scene = [r['x'], r['y'], r['w'], r['h']]
            shots.append(png(s)); results['errors'][f'{name}-{len(shots)}'] = s.errors()
        item = {'vue': name, 'pixelsChanged': diff(*shots, scene, 2 if vp[2] else 1)}
        if item['pixelsChanged']['share'] and page == 'content-preview.html':
            fresh(s, route, ['visiter-contour-sombre'], theme, lang, vp, page=page)
            item['temoin'] = diff(shots[0], png(s), None, 2 if vp[2] else 1); results['errors'][f'{name}-temoin'] = s.errors()
        results['inchanges'].append(item); s.record(name, item)
    # 3. Buttons reached after an action: "Fermer" once a report is saved (same class as its
    #    submit button) and "Répondre" in a reply form (same class as "Ajouter").
    for theme in ('light', 'dark'):
        for label, essais in (('avant', []), ('apres', [ID])):
            fresh(s, PROJECT, essais, theme, 'fr', D)
            s.click('.cp-project-actions .cp-report-trigger'); s.wait('Boolean(document.querySelector("dialog.cp-report-dialog[open]"))', 8)
            s.js('(()=>{const e=document.querySelector(".cp-report-dialog[open] select");e.value=e.options[1].value;e.dispatchEvent(new Event("change",{bubbles:true}));return true})()')
            s.click('.cp-report-dialog[open] .cp-report-submit'); saved = s.wait('Boolean(document.querySelector(".cp-report-dialog[open] .cp-report-result"))', 8); time.sleep(.4)
            close = s.js(STYLE + '(".cp-report-dialog[open] .cp-report-footer .cp-report-submit")'); s.key('Escape'); time.sleep(.4)
            fresh(s, PROJECT + '?tab=comments', essais, theme, 'fr', D)
            s.click('.cp-comments-form textarea'); s.c.call('Input.insertText', {'text': 'Essai de couleur'}); time.sleep(.3)
            s.click('.cp-comments-form .cp-comments-submit'); s.wait('Boolean(document.querySelector(".cp-comment-reply"))', 8)
            # Centre the reply action: near the bottom edge the floating dock would take the click.
            s.js('(()=>{document.querySelector(".cp-comment-reply").scrollIntoView({block:"center"});return true})()'); time.sleep(.4); s.click('.cp-comment-reply')
            s.wait('Boolean(document.querySelector(".cp-comments-reply-form .cp-comments-submit"))', 8); time.sleep(.4)
            reply = s.js(STYLE + '(".cp-comments-reply-form .cp-comments-submit")')
            results['apresAction'].append({'theme': theme, 'essai': label, 'reportSaved': saved, 'fermer': close, 'fermerContrast': text_contrast(close) if close else None,
                                           'repondre': reply, 'repondreContrast': text_contrast(reply) if reply else None})
            results['errors'][f'action-{theme}-{label}'] = s.errors()
    s.record('apresAction', [(x['theme'], x['essai'], (x['fermer'] or {}).get('bg'), (x['repondre'] or {}).get('bg')) for x in results['apresAction']])
    # 4. Live switches without reload: theme light -> dark -> light, then language FR -> AR.
    fresh(s, 'projects', [ID], 'light', 'fr', D); s.js('(()=>{window.__noReload=1;return true})()')
    live = {'clair': open_filter(s)}
    account(s, 'theme', 'theme', 'dark'); live['sombre'] = open_filter(s)
    account(s, 'theme', 'theme', 'light'); live['clairAgain'] = open_filter(s)
    account(s, 'language', 'locale', 'ar'); live['arabe'] = open_filter(s)
    live['noReload'] = s.js('window.__noReload===1'); live['lang'] = s.js('document.documentElement.lang+" "+document.dir')
    results['live'] = live; results['errors']['live'] = s.errors(); s.record('live', {k: (v or {}).get('bg') if isinstance(v, dict) else v for k, v in live.items()})
finally:
    s.close()
    ink, accent = (27, 27, 27), {'light': (0, 186, 188), 'dark': (237, 52, 145)}
    arr, live = results['inscriptionArrivee'], results['live']
    def primary_ok(style, theme): return bool(style) and rgb(style['bg'])[0] == accent[theme] and rgb(style['color'])[0] == ink
    results['checks'] = {
        'arrivalSignupMeasured': len(arr) == 2 and all(c[k]['opened'] and c[k]['entryStillClosed'] and c[k]['primary'] and c[k]['secondary'] for c in arr for k in ('avant', 'apres')),
        'arrivalSignupPrimaryAccent': len(arr) == 2 and all(primary_ok(c['apres']['primary'], c['theme']) for c in arr),
        'arrivalSignupGeometryKept': len(arr) == 2 and all(c['avant'][b][k] == c['apres'][b][k] for c in arr for b in ('primary', 'secondary') for k in ('size', 'radius', 'padding')),
        'arrivalSignupContrast': len(arr) == 2 and all((c['apres'][k] or 0) >= 4.5 for c in arr for k in ('primaryContrast', 'secondaryContrast')),
        'unaffectedPagesIdentical': len(results['inchanges']) == 5 and all(i['pixelsChanged']['share'] == 0 or (i.get('temoin') and i['pixelsChanged']['pixels'] == i['temoin']['pixels']
                                    and i['pixelsChanged']['step'] <= i['temoin']['step']) for i in results['inchanges']),
        'afterActionButtons': len(results['apresAction']) == 4 and all(x['reportSaved'] and x['fermer'] and x['repondre'] for x in results['apresAction'])
                              and all(primary_ok(x['fermer'], x['theme']) and primary_ok(x['repondre'], x['theme']) and x['fermerContrast'] >= 4.5 and x['repondreContrast'] >= 4.5
                                      for x in results['apresAction'] if x['essai'] == 'apres'),
        'liveSwitches': bool(live) and live['noReload'] and live['lang'] == 'ar rtl' and primary_ok(live['clair'], 'light') and primary_ok(live['sombre'], 'dark')
                        and primary_ok(live['clairAgain'], 'light') and primary_ok(live['arabe'], 'light') and live['arabe']['text'] != live['clair']['text'],
        'noErrors': not any(results['errors'].values()),
    }
    results['passed'] = all(results['checks'].values())
    (HERE / 'contre-verification.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    print('passed', results['passed'], results['checks'])
