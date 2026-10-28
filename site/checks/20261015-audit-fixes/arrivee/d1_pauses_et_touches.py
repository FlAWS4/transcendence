"""D1 d — pauses voulues toujours actives dans 145 (1280×900), puis touches au-delà des modificateurs.

Pauses : focus clavier (Tab, Tab → Se connecter) ≥ 8 s puis clic souris du fond → reprise ;
survol de Se connecter ≥ 6 s puis sortie → reprise ; fenêtre ouverte ≥ 6 s puis Annuler → reprise ;
onglet masqué (document.hidden simulé) ≥ 6 s puis visible → reprise.
Touches : après Se connecter → Annuler à la souris (focus pointeur sur Se connecter), une touche
parmi Shift, Meta, AltGraph, CapsLock, NumLock, PrintScreen, Escape, a, Tab ; on note :focus-visible
(heuristique clavier de Chrome, à titre de comparaison) et le changement de libellé dans les 4,5 s.
Variante : fermeture de la fenêtre par Échap (usage clavier).
Globe bloqué, animations non réduites, sources non modifiées.
"""
import json, time, traceback
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
OUT = EVID / 'd1-pauses-touches'; OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'd1_pauses_et_touches.py', 'viewport': [1280, 900], 'state': '145', 'pauses': {}, 'keys': [], 'passed': None}
c = Chrome('d1-pauses.log'); h = make(c); globals().update(h)


def window_changes(t_from, t_to=None):
    r = rec(); ch = changes_after(r, t_from)
    return [e for e in ch if t_to is None or e['dtMs'] <= round(t_to - t_from)]


def cancel_with_mouse():
    click('#entry-login'); wait('document.querySelector("#dialog").open', 5)
    click('#dialog-content button:last-child'); wait('!document.querySelector("#dialog").open', 5)
    move(4, 4); time.sleep(.2)


try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Network.enable'); c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*']})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'no-preference'}]})
    url = BASE + 'index.html?qa=verif-d1-pauses'
    load(url, 1280, 900); c.js(REC); wait('qaRec.log.length>=2', 7)
    P = R['pauses']
    # 1. Focus clavier.
    key('Tab'); first = c.js(STATE)['active']; key('Tab'); st = c.js(STATE); t1 = now()
    time.sleep(8.6); t2 = now(); during = window_changes(t1, t2)
    theme_before = st['theme']; point(20, 220); move(4, 4); t3 = now(); st2 = c.js(STATE); time.sleep(4.8)
    after = window_changes(t3)
    P['clavier'] = {'firstTab': first, 'secondTab': st['active'], 'focusVisible': st['focusVisible'], 'heldMs': round(t2 - t1), 'changesWhileHeld': during,
                    'backgroundClick': {'themeBefore': theme_before, 'themeAfter': st2['theme'], 'active': st2['active']}, 'changesAfterClick': after}
    P['clavier']['passed'] = first == 'entry-theme-toggle' and st['active'] == 'entry-login' and not during and P['clavier']['heldMs'] >= 8000 and bool(after) and after[0]['dtMs'] <= 4500
    print('clavier', json.dumps(P['clavier'], ensure_ascii=False), flush=True)
    # 2. Survol.
    p = centre('#entry-login'); move(p['x'], p['y']); t1 = now(); st = c.js(STATE); time.sleep(6.4); t2 = now(); during = window_changes(t1, t2)
    move(4, 4); t3 = now(); time.sleep(4.8); after = window_changes(t3)
    P['survol'] = {'accessHover': st['accessHover'], 'heldMs': round(t2 - t1), 'changesWhileHeld': during, 'changesAfterLeave': after}
    P['survol']['passed'] = st['accessHover'] and not during and P['survol']['heldMs'] >= 6000 and bool(after) and after[0]['dtMs'] <= 4500
    print('survol', json.dumps(P['survol'], ensure_ascii=False), flush=True)
    # 3. Fenêtre ouverte.
    click('#entry-login'); wait('document.querySelector("#dialog").open', 5); move(4, 4); t1 = now(); time.sleep(6.4); t2 = now(); during = window_changes(t1, t2)
    click('#dialog-content button:last-child'); wait('!document.querySelector("#dialog").open', 5); move(4, 4); t3 = now(); time.sleep(4.8); after = window_changes(t3)
    P['fenetre'] = {'heldMs': round(t2 - t1), 'changesWhileOpen': during, 'changesAfterCancel': after}
    P['fenetre']['passed'] = not during and P['fenetre']['heldMs'] >= 6000 and bool(after) and after[0]['dtMs'] <= 4500
    print('fenetre', json.dumps(P['fenetre'], ensure_ascii=False), flush=True)
    # 4. Onglet masqué (simulation : document.hidden forcé + visibilitychange).
    c.js('Object.defineProperty(document,"hidden",{get:()=>true,configurable:true});document.dispatchEvent(new Event("visibilitychange"));true')
    t1 = now(); time.sleep(6.4); t2 = now(); during = window_changes(t1, t2)
    c.js('delete document.hidden;document.dispatchEvent(new Event("visibilitychange"));true'); t3 = now(); time.sleep(4.8); after = window_changes(t3)
    P['onglet-masque'] = {'heldMs': round(t2 - t1), 'changesWhileHidden': during, 'changesAfterVisible': after}
    P['onglet-masque']['passed'] = not during and P['onglet-masque']['heldMs'] >= 6000 and bool(after) and after[0]['dtMs'] <= 4500
    print('onglet', json.dumps(P['onglet-masque'], ensure_ascii=False), flush=True)
    # 5. Touches après un focus rendu par Annuler à la souris.
    # Each iteration starts with a mouse click on Se connecter (pointerdown resets the keyboard flag).
    for name in ['Shift', 'Meta', 'AltGraph', 'CapsLock', 'NumLock', 'PrintScreen', 'Escape', 'a', 'Tab']:
        cancel_with_mouse(); st = c.js(STATE); t1 = now(); key(name); st2 = c.js(STATE); time.sleep(4.8)
        ch = window_changes(t1)
        entry = {'key': name, 'activeBefore': st['active'], 'activeAfter': st2['active'], 'focusVisibleBefore': st['focusVisible'], 'focusVisibleAfter': st2['focusVisible'],
                 'changesAfterKey': ch, 'paused': not (ch and ch[0]['dtMs'] <= 4500)}
        R['keys'].append(entry); print('touche', json.dumps(entry, ensure_ascii=False), flush=True)
    # 6. Fenêtre ouverte à la souris, fermée par Échap.
    load(url, 1280, 900); c.js(REC); wait('qaRec.log.length>=2', 7)
    click('#entry-login'); wait('document.querySelector("#dialog").open', 5); move(4, 4)
    key('Escape'); wait('!document.querySelector("#dialog").open', 5); st = c.js(STATE); t1 = now(); time.sleep(6.4); t2 = now(); during = window_changes(t1, t2)
    point(20, 220); move(4, 4); t3 = now(); time.sleep(4.8); after = window_changes(t3)
    R['fermeture-echap'] = {'active': st['active'], 'focusVisible': st['focusVisible'], 'heldMs': round(t2 - t1), 'changesAfterEscape': during, 'changesAfterBackgroundClick': after}
    print('echap', json.dumps(R['fermeture-echap'], ensure_ascii=False), flush=True)
    # 7. Cadre de focus du contrôle de fond après Maj seule (heuristique :focus-visible de Chrome).
    load(url, 1280, 900); c.js(REC); wait('qaRec.log.length>=2', 7)
    point(20, 220); move(4, 4); time.sleep(.3)
    o1 = c.js('(e=>({active:e.id,focusVisible:e.matches(":focus-visible"),outline:getComputedStyle(e).outlineStyle+" "+getComputedStyle(e).outlineWidth+" "+getComputedStyle(e).outlineColor}))(document.activeElement)')
    t1 = now(); key('Shift')
    o2 = c.js('(e=>({active:e.id,focusVisible:e.matches(":focus-visible"),outline:getComputedStyle(e).outlineStyle+" "+getComputedStyle(e).outlineWidth+" "+getComputedStyle(e).outlineColor}))(document.activeElement)')
    shot(OUT / '145-cadre-focus-apres-maj.png'); time.sleep(4.8)
    R['cadre-apres-maj'] = {'beforeShift': o1, 'afterShift': o2, 'changesAfterShift': window_changes(t1)}
    print('cadre', json.dumps(R['cadre-apres-maj'], ensure_ascii=False), flush=True)
    R['passed'] = all(v['passed'] for v in P.values())
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
