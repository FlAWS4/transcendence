"""Écran d'erreur 145 contre 144 : origine des pixels différents hors du compte (1280 clair, 390 sombre).

Le relevé arrivee_regressions.py trouve, en plus du compte, des différences limitées au lissage des
glyphes du message et des boutons (mêmes rectangles). Ici : 145 tel quel (A), 145 rechargé (A2, bruit
de rendu), 145 avec le compte masqué par un style injecté en mémoire seulement (B), 144 (C).
B contre C dit si le compte affiché suffit à expliquer l'écart. Animations réduites, globe bloqué.
"""
import json, time, traceback, io
from PIL import Image, ImageChops
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
OUT = EVID / 'regressions'; OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'erreur_rendu_texte.py', 'cases': [], 'passed': None}
c = Chrome('erreur-rendu.log'); h = make(c); globals().update(h)


def grab():
    return Image.open(io.BytesIO(base64.b64decode(c.call('Page.captureScreenshot', {'format': 'png'})['data']))).convert('RGB')


def set_theme(value):
    for _ in range(2):
        if c.js('document.documentElement.dataset.theme') == value: return
        point(20, 220); move(4, 4); time.sleep(.2)


def error_shot(prefix, w, hh, theme, hide_account=False):
    load(BASE + prefix + 'index.html?qa=verif-rendu-' + str(time.time()), w, hh); set_theme(theme)
    click('#entry-guest'); wait('document.body.dataset.entry==="error"', 25); move(4, 4); time.sleep(.5)
    if hide_account:
        c.js('(()=>{const s=document.createElement("style");s.textContent=".account-switcher{display:none!important}";document.head.append(s);return true})()'); time.sleep(.3)
    return grab()


def compare(a, b):
    d = ImageChops.difference(a, b).convert('L')
    hist = d.histogram()
    return {'pixels': sum(hist[1:]), 'strong': sum(hist[16:]), 'box': d.getbbox()}


try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Network.enable'); c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*']})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'reduce'}]})
    for w, hh, theme in [(1280, 900, 'light'), (390, 844, 'dark')]:
        A = error_shot('', w, hh, theme); A2 = error_shot('', w, hh, theme); B = error_shot('', w, hh, theme, True); C = error_shot(A144, w, hh, theme)
        C2 = error_shot(A144, w, hh, theme)
        entry = {'viewport': '%dx%d-%s' % (w, hh, theme), 'A_vs_A2_bruit145': compare(A, A2), 'C_vs_C2_bruit144': compare(C, C2), 'A_vs_C': compare(A, C), 'B_compteMasque_vs_C': compare(B, C), 'A_vs_B': compare(A, B)}
        R['cases'].append(entry); print(json.dumps(entry), flush=True)
    R['passed'] = all(e['B_compteMasque_vs_C']['pixels'] == 0 for e in R['cases'])
except Exception as error:
    R['failure'] = traceback.format_exc()[-1500:]; print(R['failure'], flush=True)
finally:
    try: c.js('1')
    except Exception: pass
    R['console'] = c.console
    R['sourcesUnchanged'] = before == hashes(); R['sources'] = before
    R['durationS'] = round(time.time() - T0, 1)
    save(OUT / 'rendu-texte-erreur.json', R); cleanup(c)
