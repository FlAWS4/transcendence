"""D1 b — toucher, 390×844 avec émulation tactile, état actif 145 puis archive 144.

Toucher « Se connecter », toucher « Annuler » : le focus revient à Se connecter ; 145 : le libellé
doit changer moins de 4,5 s après la fermeture, deux fois de suite ; 144 : aucun changement pendant
au moins 9 s. Deuxième essai : toucher du fond (thème basculé) puis attente d'un changement.
Globe bloqué, animations non réduites, sources non modifiées.
"""
import json, time, traceback
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
OUT = EVID / 'd1-toucher'; OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'd1_toucher.py', 'viewport': [390, 844], 'touchEmulation': True, 'states': {}, 'passed': None}
c = Chrome('d1-toucher.log'); h = make(c); globals().update(h)
try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Network.enable'); c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*']})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'no-preference'}]})
    c.call('Emulation.setTouchEmulationEnabled', {'enabled': True, 'maxTouchPoints': 1})
    for state, prefix in [('145', ''), ('144', A144)]:
        S = R['states'][state] = {}
        url = BASE + prefix + 'index.html?qa=verif-d1-toucher-' + state
        load(url, 390, 844); c.js(REC)
        wait('qaRec.log.length>=2', 7)
        p_login = tap_on('#entry-login'); wait('document.querySelector("#dialog").open', 5)
        cancel = c.js('(()=>{const b=document.querySelector("#dialog-content button:last-child"),r=b.getBoundingClientRect();return{text:b.textContent.trim(),x:r.x+r.width/2,y:r.y+r.height/2}})()')
        tap(cancel['x'], cancel['y']); wait('!document.querySelector("#dialog").open', 5)
        after = c.js(STATE)
        shot(OUT / (state + '-apres-annuler-toucher.png'))
        time.sleep(9.4)
        r = rec(); close = [e for e in r['ev'] if e['type'] == 'dialog-close'][-1]
        ch = changes_after(r, close['t'])
        pointer = [{'type': e['type'], 'pointerType': e['pointerType'], 'target': e['target']} for e in r['ev'] if e['type'] in ('pointerdown', 'pointerenter', 'pointerleave', 'click')]
        a = {'tapLogin': p_login, 'cancel': cancel, 'afterCancel': {k: after[k] for k in ['active', 'focusVisible', 'accessHover', 'site', 'theme']} | {'label': after['login']['lang']},
             'activeAtClose': close.get('active'), 'observedAfterCloseMs': round(now() - close['t']), 'changesAfterClose': ch, 'pointerEvents': pointer}
        if state == '145': a['passed'] = len(ch) >= 2 and ch[0]['dtMs'] <= 4500 and ch[1]['dtMs'] - ch[0]['dtMs'] <= 4500 and after['active'] == 'entry-login'
        else: a['passed'] = len(ch) == 0 and a['observedAfterCloseMs'] >= 9000 and after['active'] == 'entry-login'
        S['b-annuler-toucher'] = a
        print(state, 'b', json.dumps(a, ensure_ascii=False)[:900], flush=True)
        # Toucher du fond : thème basculé, le cycle doit reprendre (dans les deux états).
        theme_before = c.js('document.documentElement.dataset.theme'); t_tap = now(); tap(20, 220)
        st = c.js(STATE); time.sleep(4.9); r = rec(); ch = changes_after(r, t_tap)
        S['b2-toucher-fond'] = {'themeBefore': theme_before, 'themeAfter': st['theme'], 'activeAfterTap': st['active'], 'changesAfterTap': ch, 'resumedWithin4_5s': bool(ch) and ch[0]['dtMs'] <= 4500}
        print(state, 'b2', json.dumps(S['b2-toucher-fond'], ensure_ascii=False), flush=True)
    R['passed'] = all(R['states'][s]['b-annuler-toucher']['passed'] for s in R['states'])
except Exception as error:
    R['failure'] = traceback.format_exc()[-1500:]; print(R['failure'], flush=True)
    try: shot(OUT / 'echec.png'); R['failureState'] = c.js(STATE)
    except Exception: pass
finally:
    try: c.js('1')
    except Exception: pass
    R['console'] = c.console
    R['sourcesUnchanged'] = before == hashes(); R['sources'] = before
    R['durationS'] = round(time.time() - T0, 1)
    save(OUT / 'resultats.json', R); cleanup(c)
