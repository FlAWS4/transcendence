"""Non-régression de l'arrivée, 145 contre 144 (même session Chrome, animations réduites, globe bloqué).

1. Captures de l'arrivée (libellés français, avant le premier changement) dans cinq formats/thèmes ;
   comparaison au pixel hors de la zone du texte chiffré (#entrance-scene, dont le tirage varie).
2. Écrans d'erreur 1280 clair et 390 sombre : zone exacte des pixels qui diffèrent, comparée au
   rectangle du compte (seule différence attendue).
3. Ordre de tabulation sur l'arrivée et sur l'écran d'erreur.
4. Focus donné sans touche ni pointeur (focus() programmatique, comparable à un focus d'aide
   technique) : différence de comportement 144/145, par construction du correctif.
Écrit sous arrivee/regressions/. Sources non modifiées.
"""
import json, time, traceback, io
from PIL import Image, ImageChops
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
OUT = EVID / 'regressions'; OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'arrivee_regressions.py', 'arrival': [], 'error': [], 'tab': {}, 'programmaticFocus': {}, 'passed': None}
c = Chrome('regressions.log'); h = make(c); globals().update(h)


def grab():
    return Image.open(io.BytesIO(base64.b64decode(c.call('Page.captureScreenshot', {'format': 'png'})['data']))).convert('RGB')


def set_theme(value):
    for _ in range(2):
        if c.js('document.documentElement.dataset.theme') == value: return
        point(20, 220); move(4, 4); time.sleep(.2)


def diff_box(a, b, mask=None):
    d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 0 else 0)
    if mask:
        x, y, w, hh = [int(round(v)) for v in mask]
        blank = Image.new('L', (max(1, w + 2), max(1, hh + 2)), 0); d.paste(blank, (x - 1, y - 1))
    box = d.getbbox(); count = sum(1 for v in d.getdata() if v)
    return box, count


try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Network.enable'); c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*']})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'reduce'}]})
    # 1. Arrivée.
    for w, hh, theme in [(1280, 900, 'light'), (1280, 900, 'dark'), (390, 844, 'dark'), (320, 640, 'dark'), (667, 375, 'light')]:
        imgs, meta = {}, {}
        for state, prefix in [('145', ''), ('144', A144)]:
            load(BASE + prefix + 'index.html?qa=verif-reg-' + state, w, hh); set_theme(theme); move(4, 4); time.sleep(.3)
            meta[state] = c.js(STATE) | {'scene': c.js('(r=>[r.x,r.y,r.width,r.height])(document.querySelector("#entrance-scene").getBoundingClientRect())')}
            imgs[state] = grab()
        name = '%dx%d-%s' % (w, hh, theme)
        imgs['145'].save(OUT / ('arrivee-145-' + name + '.png')); imgs['144'].save(OUT / ('arrivee-144-' + name + '.png'))
        box, count = diff_box(imgs['145'], imgs['144'], meta['145']['scene'])
        entry = {'viewport': name, 'labels145': [meta['145']['login']['text'], meta['145']['guest']['text']], 'labels144': [meta['144']['login']['text'], meta['144']['guest']['text']],
                 'rects145': [meta['145']['login']['rect'], meta['145']['guest']['rect']], 'rects144': [meta['144']['login']['rect'], meta['144']['guest']['rect']],
                 'scene': meta['145']['scene'], 'diffPixelsOutsideScene': count, 'diffBox': box, 'account': [meta['145']['account'], meta['144']['account']]}
        entry['identicalOutsideScene'] = count == 0 and entry['rects145'] == entry['rects144'] and entry['labels145'] == entry['labels144']
        R['arrival'].append(entry); print('arrivee', json.dumps(entry, ensure_ascii=False), flush=True)
    # 2. Écrans d'erreur.
    for w, hh, theme in [(1280, 900, 'light'), (390, 844, 'dark')]:
        imgs, meta = {}, {}
        for state, prefix in [('145', ''), ('144', A144)]:
            load(BASE + prefix + 'index.html?qa=verif-reg-err-' + state, w, hh); set_theme(theme)
            click('#entry-guest'); wait('document.body.dataset.entry==="error"', 25); move(4, 4); time.sleep(.5)
            meta[state] = c.js('({account:getComputedStyle(document.querySelector(".account-switcher")).display,rect:(r=>[r.x,r.y,r.width,r.height])(document.querySelector(".account-switcher").getBoundingClientRect()),buttons:[...document.querySelectorAll("#entrance-access button")].map(b=>(r=>[b.textContent.trim(),r.x,r.y,r.width,r.height])(b.getBoundingClientRect())),status:document.querySelector("#entrance-status").textContent,active:document.activeElement?.textContent?.trim()})')
            imgs[state] = grab()
            # Tab order on the error screen
            order = [c.js('document.activeElement?.id||document.activeElement?.textContent?.trim()')]
            for _ in range(4):
                key('Tab'); order.append(c.js('document.activeElement?.id||document.activeElement?.textContent?.trim()||document.activeElement?.tagName'))
            meta[state]['tabOrder'] = order
        name = '%dx%d-%s' % (w, hh, theme)
        imgs['145'].save(OUT / ('erreur-145-' + name + '.png')); imgs['144'].save(OUT / ('erreur-144-' + name + '.png'))
        box, count = diff_box(imgs['145'], imgs['144'])
        acc = meta['145']['rect']
        inside = box is not None and box[0] >= acc[0] - 2 and box[1] >= acc[1] - 2 and box[2] <= acc[0] + acc[2] + 2 and box[3] <= acc[1] + acc[3] + 2
        entry = {'viewport': name, 'account': [meta['145']['account'], meta['144']['account']], 'accountRect145': acc, 'diffPixels': count, 'diffBox': box, 'diffOnlyInAccountRect': inside,
                 'buttonsSame': meta['145']['buttons'] == meta['144']['buttons'], 'buttons145': meta['145']['buttons'], 'status': [meta['145']['status'], meta['144']['status']],
                 'focusAtError': [meta['145']['active'], meta['144']['active']], 'tabOrder145': meta['145']['tabOrder'], 'tabOrder144': meta['144']['tabOrder']}
        R['error'].append(entry); print('erreur', json.dumps(entry, ensure_ascii=False), flush=True)
    # 3. Ordre de tabulation sur l'arrivée (145 et 144).
    for state, prefix in [('145', ''), ('144', A144)]:
        load(BASE + prefix + 'index.html?qa=verif-reg-tab-' + state, 1280, 900)
        order = []
        for _ in range(4):
            key('Tab'); order.append(c.js('document.activeElement?.id||document.activeElement?.tagName'))
        R['tab'][state] = order
    print('tab', json.dumps(R['tab']), flush=True)
    # 4. Focus programmatique sans touche ni pointeur.
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'no-preference'}]})
    for state, prefix in [('145', ''), ('144', A144)]:
        load(BASE + prefix + 'index.html?qa=verif-reg-focus-' + state, 1280, 900); c.js(REC); wait('qaRec.log.length>=2', 7)
        c.js('document.querySelector("#entry-login").focus(),true'); t1 = now(); st = c.js(STATE); time.sleep(4.8)
        R['programmaticFocus'][state] = {'active': st['active'], 'focusVisible': st['focusVisible'], 'changesAfterFocus': changes_after(rec(), t1)}
    print('focus', json.dumps(R['programmaticFocus']), flush=True)
    R['passed'] = all(e['identicalOutsideScene'] for e in R['arrival']) and all(e['diffOnlyInAccountRect'] and e['buttonsSame'] for e in R['error']) and R['tab']['145'] == R['tab']['144']
except Exception as error:
    R['failure'] = traceback.format_exc()[-1500:]; print(R['failure'], flush=True)
    try: shot(OUT / 'echec.png')
    except Exception: pass
finally:
    try: c.js('1')
    except Exception: pass
    R['console'] = c.console
    R['sourcesUnchanged'] = before == hashes(); R['sources'] = before
    R['durationS'] = round(time.time() - T0, 1)
    save(OUT / 'resultats.json', R); cleanup(c)
