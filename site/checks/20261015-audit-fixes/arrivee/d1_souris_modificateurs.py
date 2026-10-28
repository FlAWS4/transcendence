"""D1 — souris et touches de modification, 1280×900, état actif 145 puis archive 144.

a) Survol puis clic de « Se connecter », clic d'« Annuler », focus rendu à Se connecter,
   souris écartée en (4,4) : deux changements de libellé attendus, chacun en moins de 4,5 s (145) ;
   aucun changement pendant au moins 9 s (144).
a') Même parcours sans bouger la souris après « Annuler » : position du pointeur, élément sous
   le pointeur, état :hover, puis léger déplacement sur place et sortie.
c) Clic du fond en (20,220) (thème basculé, focus sur #entry-theme-toggle), puis Alt, puis Shift,
   puis Control+C (modifiers 2), chacun précédé d'un nouveau clic du fond : le libellé doit encore
   changer moins de 4,5 s après la touche (145) ; 144 : bloqué.
Globe bloqué (*integrated-globe.mjs*), animations non réduites, sources non modifiées.
"""
import json, time, traceback
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
OUT = EVID / 'd1-souris-modificateurs'; OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'd1_souris_modificateurs.py', 'viewport': [1280, 900], 'states': {}, 'console': [], 'passed': None}
c = Chrome('d1-souris.log'); h = make(c); globals().update(h)


def annuler_souris(tag, url, move_away=True, observe=9.6, shots=False):
    load(url, 1280, 900); c.js(REC)
    wait('qaRec.log.length>=2', 7)  # one spontaneous change first (synchronisation)
    first = rec()['log'][1]
    p_login = click('#entry-login'); wait('document.querySelector("#dialog").open', 5)
    in_dialog = c.js(STATE)
    cancel = c.js('(()=>{const b=document.querySelector("#dialog-content button:last-child"),r=b.getBoundingClientRect();return{text:b.textContent.trim(),x:r.x+r.width/2,y:r.y+r.height/2,kind:document.querySelector("#dialog").dataset.kind||null,title:document.querySelector("#dialog-title").textContent}})()')
    if shots: shot(OUT / (tag + '-1-fenetre.png'))
    move(cancel['x'], cancel['y']); time.sleep(.1); press(cancel['x'], cancel['y'])
    wait('!document.querySelector("#dialog").open', 5)
    after = c.js(STATE)
    under = c.js('(e=>e?(e.closest("button")?.id||e.id||e.className||e.tagName):null)(document.elementFromPoint(' + str(cancel['x']) + ',' + str(cancel['y']) + '))')
    if move_away: move(4, 4)
    if shots: shot(OUT / (tag + '-2-apres-annuler.png'))
    t_end = time.time() + observe
    while time.time() < t_end: time.sleep(.25)
    r = rec(); close = [e for e in r['ev'] if e['type'] == 'dialog-close'][-1]
    ch = changes_after(r, close['t'])
    out = {'firstSpontaneousChange': {'lang': first['lang']}, 'pointerOnLogin': p_login, 'dialog': {'title': cancel['title'], 'kind': cancel['kind'], 'cancelText': cancel['text'], 'activeInDialog': in_dialog['active']},
           'cancelPoint': [round(cancel['x'], 1), round(cancel['y'], 1)], 'elementUnderPointerAfterClose': under,
           'afterCancel': {k: after[k] for k in ['active', 'focusVisible', 'accessHover', 'dialogOpen', 'site', 'theme']} | {'label': after['login']['lang'], 'loginRect': after['login']['rect'], 'guestRect': after['guest']['rect']},
           'activeAtClose': close.get('active'), 'mouseMovedAway': move_away,
           'observedAfterCloseMs': round(c.js('performance.now()') - close['t']), 'changesAfterClose': ch,
           'accessEnterLeave': [{'type': e['type'], 'dtMs': round(e['t'] - close['t']), 'pointerType': e['pointerType']} for e in r['ev'] if e['type'] in ('pointerenter', 'pointerleave') and e['t'] > close['t'] - 2000]}
    if shots:
        shot(OUT / (tag + '-3-fin-observation.png'))
    return out, r, close


try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Network.enable'); c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*']})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'no-preference'}]})
    for state, prefix in [('145', ''), ('144', A144)]:
        S = R['states'][state] = {}
        url = BASE + prefix + 'index.html?qa=verif-d1-souris-' + state
        # a) Annuler puis souris écartée.
        out, r, close = annuler_souris(state + '-a', url, True, 9.6, shots=True)
        ch = out['changesAfterClose']
        if state == '145':
            ok = len(ch) >= 2 and ch[0]['dtMs'] <= 4500 and ch[1]['dtMs'] - ch[0]['dtMs'] <= 4500 and out['afterCancel']['active'] == 'entry-login'
        else:
            ok = len(ch) == 0 and out['observedAfterCloseMs'] >= 9000 and out['afterCancel']['active'] == 'entry-login'
        out['passed'] = ok; S['a-annuler-souris-ecartee'] = out
        print(state, 'a', json.dumps(out, ensure_ascii=False)[:900], flush=True)
        # a') Annuler sans bouger la souris, puis léger déplacement sur place (survol), puis sortie.
        out, r, close = annuler_souris(state + '-a2', url, False, 9.6)
        x, y = out['cancelPoint']
        t_nudge = now(); move(x + 1, y); nudge_state = c.js(STATE)
        time.sleep(6.3)
        t_leave = now(); move(4, 4); time.sleep(4.8)
        r = rec()
        out['nudge'] = {'accessHoverAfterNudge': nudge_state['accessHover'], 'loginHover': nudge_state['login']['hover'], 'guestHover': nudge_state['guest']['hover'],
                        'changesDuringNudge': [e for e in changes_after(r, t_nudge) if e['dtMs'] <= round(t_leave - t_nudge)],
                        'nudgeMs': round(t_leave - t_nudge), 'changesAfterLeave': changes_after(r, t_leave)}
        S['a2-annuler-sans-bouger'] = out
        print(state, 'a2', json.dumps(out, ensure_ascii=False)[:900], flush=True)
        # c) Touches de modification, focus pointeur sur le contrôle du fond.
        load(url, 1280, 900); c.js(REC)
        wait('qaRec.log.length>=2', 7)
        mods = []
        for i, name in enumerate(['Alt', 'Shift', 'Control+C']):
            theme_before = c.js('document.documentElement.dataset.theme')
            point(20, 220); move(4, 4); time.sleep(.3)
            st = c.js(STATE)
            t_key = now()
            if name == 'Control+C': ctrl_c()
            else: key(name)
            st_key = c.js(STATE)
            hold = 9.6 if (state == '144' and i == 0) else (5.2 if state == '144' else 4.8)
            time.sleep(hold)
            r = rec(); ch = changes_after(r, t_key)
            keyev = [{'key': e['key'], 'mods': e['mods']} for e in r['ev'] if e['type'] == 'keydown' and e['t'] >= t_key - 5]
            entry = {'key': name, 'themeBefore': theme_before, 'themeAfterBackgroundClick': st['theme'], 'activeBeforeKey': st['active'], 'focusVisibleBeforeKey': st['focusVisible'],
                     'focusVisibleAfterKey': st_key['focusVisible'], 'keydownSeen': keyev, 'observedMs': round(now() - t_key), 'changesAfterKey': ch}
            entry['passed'] = (len(ch) >= 1 and ch[0]['dtMs'] <= 4500) if state == '145' else (len(ch) == 0)
            mods.append(entry)
            print(state, 'c', json.dumps(entry, ensure_ascii=False)[:600], flush=True)
        S['c-modificateurs-fond'] = mods
    R['passed'] = all(R['states'][s]['a-annuler-souris-ecartee']['passed'] for s in R['states']) and all(m['passed'] for s in R['states'] for m in R['states'][s]['c-modificateurs-fond'])
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
