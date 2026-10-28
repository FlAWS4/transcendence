"""D1 — rotation des libellés de l'arrivée, état 146 (actif) puis état 145 (archive), 1280×900.

Cas mesurés, chacun sur un chargement neuf, globe bloqué, animations non réduites :
 annuler-souris      Se connecter → Annuler à la souris, souris écartée : la rotation continue.
 echap-apres-souris  Se connecter à la souris → Échap : la rotation continue (145 : figée).
 touches-rares       focus pointeur sur Se connecter, puis Verr. num, Arrêt défil, Impr. écran, F11,
                     Échap : la rotation continue après chacune (145 : figée par Verr. num/Arrêt défil/Impr./Échap).
 modificateurs       clic du fond, puis Alt, Shift, Ctrl+C : la rotation continue (déjà vrai en 145).
 clavier             Tab, Tab (focus clavier sur Se connecter) : pause ; Entrée puis Échap : pause maintenue ;
                     clic du fond : reprise (pause voulue, inchangée).
 focus-programme     focus() sans touche ni pointeur, comme un focus déplacé par une aide technique : pause
                     (145 : la rotation continuait).
 survol              survol de Se connecter : pause ; sortie : reprise (inchangé).
Écrit seulement sous checks/20261015-audit-fixes/146/arrivee/ et dans le dossier temporaire verif-arrivee/.
"""
import json, sys, time, traceback
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
EVID = HW / 'checks/20261015-audit-fixes/146/arrivee'
A145 = 'archive/pre-audit-fixes-refinement-20261015/baseline/'
SOURCES = ['index.html', 'welcome.mjs', 'entrance.mjs', 'entrance.css', A145 + 'index.html', A145 + 'entrance.mjs']
KEYS.update({'ScrollLock': ('ScrollLock', 'ScrollLock', 145, 0), 'F11': ('F11', 'F11', 122, 0)})
STATE_NAME = sys.argv[1] if len(sys.argv) > 1 else '146'
URL = BASE + ('index.html' if STATE_NAME == '146' else A145 + 'index.html') + '?qa=verif-146-d1'
OUT = EVID / ('d1-' + STATE_NAME); OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'd1_146.py', 'state': STATE_NAME, 'url': URL, 'viewport': [1280, 900], 'cases': {}, 'console': [], 'failure': None}
c = Chrome('d1-146.log'); h = make(c); globals().update(h)


def fresh():
    load(URL, 1280, 900); c.js(REC)


def observe(seconds, since):
    end = time.time() + seconds
    while time.time() < end: time.sleep(.25)
    return changes_after(rec(), since)


def first_change():
    wait('qaRec.log.length>=2', 7)


def enter():  # Enter must carry its text to activate a focused button through CDP (attempt 1 sent a raw key without it)
    c.call('Input.dispatchKeyEvent', {'type': 'keyDown', 'key': 'Enter', 'code': 'Enter', 'windowsVirtualKeyCode': 13, 'text': '\r'})
    c.call('Input.dispatchKeyEvent', {'type': 'keyUp', 'key': 'Enter', 'code': 'Enter', 'windowsVirtualKeyCode': 13}); time.sleep(.12)


try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Network.enable'); c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*']})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'no-preference'}]})

    # annuler-souris
    fresh(); first_change(); click('#entry-login'); wait('document.querySelector("#dialog").open', 5)
    p = centre('#dialog-content button:last-child'); move(p['x'], p['y']); time.sleep(.1); press(p['x'], p['y'])
    wait('!document.querySelector("#dialog").open', 5); move(4, 4); t = now(); s = c.js(STATE)
    ch = observe(9.6, t); R['cases']['annuler-souris'] = {'active': s['active'], 'focusVisible': s['focusVisible'], 'changes': ch}

    # echap-apres-souris
    fresh(); first_change(); click('#entry-login'); wait('document.querySelector("#dialog").open', 5)
    move(4, 4); key('Escape'); wait('!document.querySelector("#dialog").open', 5); t = now(); s = c.js(STATE)
    ch = observe(9.6, t); R['cases']['echap-apres-souris'] = {'active': s['active'], 'focusVisible': s['focusVisible'], 'changes': ch}
    shot(OUT / 'echap-apres-souris.png')

    # touches-rares (focus pointeur sur Se connecter rendu par Annuler)
    fresh(); first_change(); click('#entry-login'); wait('document.querySelector("#dialog").open', 5)
    p = centre('#dialog-content button:last-child'); move(p['x'], p['y']); time.sleep(.1); press(p['x'], p['y'])
    wait('!document.querySelector("#dialog").open', 5); move(4, 4)
    rows = []
    for name in ['NumLock', 'ScrollLock', 'PrintScreen', 'F11', 'Escape']:
        key(name); t = now(); ch = observe(4.7, t); s = c.js(STATE)
        rows.append({'key': name, 'active': s['active'], 'focusVisible': s['focusVisible'], 'changesWithin4700ms': ch})
    R['cases']['touches-rares'] = rows

    # modificateurs (focus pointeur sur le contrôle de fond)
    fresh(); first_change(); rows = []
    for name in ['Alt', 'Shift', 'ctrl+c']:
        point(20, 220); move(4, 4)
        if name == 'ctrl+c': ctrl_c()
        else: key(name)
        t = now(); ch = observe(4.7, t); s = c.js(STATE)
        rows.append({'key': name, 'active': s['active'], 'theme': s['theme'], 'changesWithin4700ms': ch})
    R['cases']['modificateurs'] = rows

    # clavier
    fresh(); key('Tab'); key('Tab'); t = now(); s1 = c.js(STATE); ch1 = observe(8.6, t)
    enter(); wait('document.querySelector("#dialog").open', 5); key('Escape'); wait('!document.querySelector("#dialog").open', 5)
    t = now(); s2 = c.js(STATE); ch2 = observe(6.4, t)
    point(20, 220); move(4, 4); t = now(); s3 = c.js(STATE); ch3 = observe(4.7, t)
    R['cases']['clavier'] = {'afterTabTab': {'active': s1['active'], 'focusVisible': s1['focusVisible'], 'changes': ch1},
                             'afterEnterEscape': {'active': s2['active'], 'focusVisible': s2['focusVisible'], 'changes': ch2},
                             'afterBackgroundClick': {'active': s3['active'], 'theme': s3['theme'], 'changes': ch3}}

    # focus-programme (aucune touche ni aucun pointeur avant)
    fresh(); c.js('document.querySelector("#entry-login").focus();true'); t = now(); s1 = c.js(STATE); ch1 = observe(8.6, t)
    point(20, 220); move(4, 4); t = now(); ch2 = observe(4.7, t)
    R['cases']['focus-programme'] = {'active': s1['active'], 'focusVisible': s1['focusVisible'], 'changes': ch1, 'afterBackgroundClick': ch2}

    # survol
    fresh(); first_change(); p = centre('#entry-login'); move(p['x'], p['y']); t = now(); ch1 = observe(6.4, t)
    move(4, 4); t = now(); ch2 = observe(4.7, t)
    R['cases']['survol'] = {'whileHovering': ch1, 'afterLeaving': ch2}
    R['errors'] = c.js('window.qaErrors||[]')
except Exception as error:
    R['failure'] = repr(error)[:1500]; traceback.print_exc()
    try: shot(OUT / 'echec.png')
    except Exception: pass
finally:
    R['console'] = c.console; R['sourcesUnchanged'] = before == hashes(); R['seconds'] = round(time.time() - T0, 1)
    save(OUT / 'resultats.json', R); cleanup(c)
