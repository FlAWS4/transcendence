"""D1 — compléments de la reprise du 15 octobre 2026 (zone « arrivée »).

1. Fermeture de la fenêtre de connexion par la croix (#close-dialog) puis par un clic hors de la
   fenêtre (fond de la boîte modale), à la souris, 1280×900 : 145 → le libellé doit encore changer
   deux fois (moins de 4,5 s chacune) ; 144 → aucun changement pendant au moins 9 s.
2. Variante « Annuler sans bouger la souris » dans trois autres formats (145) : 667×375, 320×640 et
   390×844 à la souris : position du pointeur après la fermeture (au-dessus des boutons ou non),
   état de survol, changements pendant 9 s sans bouger, puis après sortie du pointeur.
Globe bloqué (*integrated-globe.mjs*), animations non réduites. Écrit sous arrivee/complement-d1/.
Sources non modifiées (empreintes relevées avant et après).
"""
import json, time, traceback
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
OUT = EVID / 'complement-d1'; OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'complement_d1.py', 'fermetures': {}, 'sansBouger': {}, 'passed': None}
c = Chrome('complement-d1.log'); h = make(c); globals().update(h)

UNDER = r'''((x,y)=>{const e=document.elementFromPoint(x,y);if(!e)return null;const b=e.closest('button');return b?(b.id||b.className):(e.id||e.className||e.tagName)})'''


def first_change():
    wait('qaRec.log.length>=2', 7)


try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Network.enable'); c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*']})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'no-preference'}]})
    # 1. Croix et clic hors de la fenêtre.
    for state, prefix in [('145', ''), ('144', A144)]:
        F = R['fermetures'][state] = {}
        for how in ['croix', 'hors-fenetre']:
            load(BASE + prefix + 'index.html?qa=verif-complement-d1-' + how + '-' + state, 1280, 900); c.js(REC); first_change()
            click('#entry-login'); wait('document.querySelector("#dialog").open', 5)
            box = c.js('(r=>[r.x,r.y,r.width,r.height])(document.querySelector("#dialog").getBoundingClientRect())')
            if how == 'croix':
                at = click('#close-dialog')
            else:
                at = {'x': 20, 'y': 20}; move(20, 20); time.sleep(.1); press(20, 20)
            wait('!document.querySelector("#dialog").open', 5)
            after = c.js(STATE); theme_after = after['theme']
            move(4, 4); time.sleep(9.6)
            r = rec(); close = [e for e in r['ev'] if e['type'] == 'dialog-close'][-1]
            ch = changes_after(r, close['t'])
            out = {'pointer': [round(at['x'], 1), round(at['y'], 1)], 'dialogRect': [round(v, 1) for v in box], 'activeAtClose': close.get('active'),
                   'afterClose': {k: after[k] for k in ['active', 'focusVisible', 'dialogOpen', 'site']} | {'theme': theme_after, 'label': after['login']['lang']},
                   'observedAfterCloseMs': round(now() - close['t']), 'changesAfterClose': ch}
            if state == '145':
                out['passed'] = after['active'] == 'entry-login' and len(ch) >= 2 and ch[0]['dtMs'] <= 4500 and ch[1]['dtMs'] - ch[0]['dtMs'] <= 4500
            else:
                out['passed'] = after['active'] == 'entry-login' and not ch and out['observedAfterCloseMs'] >= 9000
            F[how] = out
            print(state, how, json.dumps(out, ensure_ascii=False), flush=True)
    # 2. Annuler sans bouger la souris, autres formats (145).
    for w, hh in [(667, 375), (320, 640), (390, 844)]:
        name = '%dx%d' % (w, hh)
        load(BASE + 'index.html?qa=verif-complement-d1-sans-bouger-' + name, w, hh); c.js(REC); first_change()
        click('#entry-login'); wait('document.querySelector("#dialog").open', 5)
        cancel = centre('#dialog-content button:last-child')
        move(cancel['x'], cancel['y']); time.sleep(.1); press(cancel['x'], cancel['y'])
        wait('!document.querySelector("#dialog").open', 5); time.sleep(.15)
        st = c.js(STATE)
        under = c.js(UNDER + '(' + str(cancel['x']) + ',' + str(cancel['y']) + ')')
        r = rec(); close = [e for e in r['ev'] if e['type'] == 'dialog-close'][-1]
        if under in ('entry-login', 'entry-guest'): shot(OUT / ('145-sans-bouger-' + name + '.png'))
        time.sleep(9.0); t_leave = now(); r = rec()
        held = [e for e in changes_after(r, close['t']) if e['dtMs'] <= round(t_leave - close['t'])]
        move(4, 4); time.sleep(4.8)
        r = rec(); after_leave = changes_after(r, t_leave)
        overBoxes = any(st[b] and st[b]['rect'][0] <= cancel['x'] <= st[b]['rect'][0] + st[b]['rect'][2] and st[b]['rect'][1] <= cancel['y'] <= st[b]['rect'][1] + st[b]['rect'][3] for b in ('login', 'guest'))
        out = {'cancelPoint': [round(cancel['x'], 1), round(cancel['y'], 1)], 'elementUnderPointer': under, 'pointerInsideAButtonRect': overBoxes,
               'loginRect': st['login']['rect'], 'guestRect': st['guest']['rect'], 'active': st['active'], 'accessHover': st['accessHover'],
               'loginHover': st['login']['hover'], 'guestHover': st['guest']['hover'],
               'accessEnterLeave': [{'type': e['type'], 'dtMs': round(e['t'] - close['t']), 'pointerType': e['pointerType']} for e in r['ev'] if e['type'] in ('pointerenter', 'pointerleave') and e['t'] > close['t'] - 1500],
               'stillMs': round(t_leave - close['t']), 'changesWhileStill': held, 'changesAfterLeave': after_leave}
        R['sansBouger'][name] = out
        print('sans-bouger', name, json.dumps(out, ensure_ascii=False), flush=True)
    R['passed'] = all(v['passed'] for s in R['fermetures'].values() for v in s.values())
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
