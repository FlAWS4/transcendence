"""D1 — touches de verrouillage absentes de MODIFIER_KEYS (NumLock, ScrollLock), 1280×900, 145 puis 144.

UI Events range NumLock et ScrollLock parmi les touches de modification (comme CapsLock, qui est dans
la liste du correctif). Parcours : Se connecter → Annuler à la souris (focus pointeur sur Se connecter),
souris écartée, touche, observation 9,5 s ; puis clic du fond (reprise attendue).
Globe bloqué, animations non réduites, sources non modifiées.
"""
import json, time, traceback
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
KEYS['ScrollLock'] = ('ScrollLock', 'ScrollLock', 145, 0)
OUT = EVID / 'd1-verrous'; OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'd1_verrous.py', 'viewport': [1280, 900], 'states': {}}
c = Chrome('d1-verrous.log'); h = make(c); globals().update(h)
try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Network.enable'); c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*']})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'no-preference'}]})
    for state, prefix in [('145', ''), ('144', A144)]:
        load(BASE + prefix + 'index.html?qa=verif-d1-verrous-' + state, 1280, 900); c.js(REC); wait('qaRec.log.length>=2', 7)
        out = []
        for name in ['NumLock', 'ScrollLock']:
            click('#entry-login'); wait('document.querySelector("#dialog").open', 5)
            click('#dialog-content button:last-child'); wait('!document.querySelector("#dialog").open', 5); move(4, 4); time.sleep(.2)
            st = c.js(STATE); t1 = now(); key(name); st2 = c.js(STATE); time.sleep(9.5); t2 = now()
            held = changes_after(rec(), t1)
            point(20, 220); move(4, 4); t3 = now(); time.sleep(4.8)
            entry = {'key': name, 'active': st['active'], 'focusVisibleAfterKey': st2['focusVisible'], 'observedMs': round(t2 - t1), 'changesAfterKey': [e for e in held if e['dtMs'] <= round(t2 - t1)],
                     'changesAfterBackgroundClick': changes_after(rec(), t3)}
            out.append(entry); print(state, json.dumps(entry, ensure_ascii=False), flush=True)
        R['states'][state] = out
except Exception as error:
    R['failure'] = traceback.format_exc()[-1500:]; print(R['failure'], flush=True)
finally:
    try: c.js('1')
    except Exception: pass
    R['console'] = c.console
    R['sourcesUnchanged'] = before == hashes(); R['sources'] = before
    R['durationS'] = round(time.time() - T0, 1)
    save(OUT / 'resultats.json', R); cleanup(c)
