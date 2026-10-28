"""D5 — ancien accueil à panneaux (welcome-panels.html, état actif 145), 1280×900, globe bloqué.

Pendant au moins 9 s : « Se connecter » / « Visiter » en texte simple (pas de .entrance-action-labels,
pas d'aria-description), langue du site fr, aucune erreur ; relevé de chaque mutation des boutons.
Changement de langue par le sélecteur de la page (#language) : libellés mis à jour, toujours sans rotation.
Parcours Visiter → écran d'erreur → Continuer sans le globe (la page partage le module actif).
Puis index.html : la rotation des libellés continue (D5 ne doit pas l'avoir désactivée).
Comparaison « avant » : mesure de l'audit (codex-audit/contre-perimetre-strict/chrome/p1-results.json).
Sources non modifiées.
"""
import json, time, traceback
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
OUT = EVID / 'd5-ancien-accueil-panneaux'; OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'd5_ancien_accueil_panneaux.py', 'viewport': [1280, 900], 'panels': {}, 'index': {}, 'passed': None}
c = Chrome('d5-panneaux.log'); h = make(c); globals().update(h)

MUT = r'''(()=>{window.qaMut=[];const access=document.querySelector('#entrance-access');
 new MutationObserver(list=>{for(const m of list)qaMut.push({t:Math.round(performance.now()),type:m.type,attr:m.attributeName||null,target:m.target.id||m.target.className||m.target.nodeName,text:[...access.querySelectorAll('button')].map(b=>b.textContent)});}).observe(access,{subtree:true,childList:true,attributes:true,characterData:true});return true})()'''


def access_clip():
    r = c.js('(r=>[r.x,r.y,r.width,r.height])(document.querySelector("#entrance-access").getBoundingClientRect())')
    return (r[0] - 40, r[1] - 24, r[2] + 80, r[3] + 48)


try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Network.enable'); c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*']})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'no-preference'}]})
    P = R['panels']
    load(BASE + 'welcome-panels.html?qa=verif-d5', 1280, 900)
    c.js(REC); c.js(MUT); t0 = now()
    P['t0'] = c.js(STATE); shot(OUT / 'panneaux-t0.png', access_clip())
    time.sleep(4.7); P['t4_7'] = c.js(STATE)
    time.sleep(4.9); P['t9_6'] = c.js(STATE); P['observedMs'] = round(now() - t0)
    shot(OUT / 'panneaux-t9_6.png', access_clip()); shot(OUT / 'panneaux-plein-t9_6.png')
    P['labelLog'] = rec()['log']; P['mutations'] = c.js('qaMut')
    # Sélecteur de langue de la page pendant l'arrivée.
    P['languageControl'] = c.js('(()=>{const b=document.querySelector("#language");if(!b)return null;const r=b.getBoundingClientRect();const e=r.width?document.elementFromPoint(r.x+r.width/2,r.y+r.height/2):null;return{rect:[r.x,r.y,r.width,r.height],visible:getComputedStyle(b).visibility,hit:!!(e&&(e===b||b.contains(e))),text:b.textContent}})()')
    switches = []
    for loc in ['en', 'ar', 'fr']:
        if not (P['languageControl'] and P['languageControl']['hit']): break
        click('#language'); wait('!document.querySelector("#language-menu").hidden', 4)
        click('#language-menu [data-locale=' + loc + ']'); time.sleep(.3); move(4, 4)
        t1 = now(); st = c.js(STATE)
        if loc != 'fr': shot(OUT / ('panneaux-langue-' + loc + '.png'), access_clip())
        time.sleep(4.7); st2 = c.js(STATE)
        switches.append({'locale': loc, 'state': st, 'after4_7s': {'login': st2['login'], 'guest': st2['guest'], 'site': st2['site']}, 'labelChanges': changes_after(rec(), t1)})
    P['languageSwitches'] = switches
    # Parcours Visiter → erreur → Continuer sans le globe.
    click('#entry-guest'); wait('document.body.dataset.entry==="error"', 25); time.sleep(.3)
    P['error'] = c.js('({entry:document.body.dataset.entry,status:document.querySelector("#entrance-status").textContent,buttons:[...document.querySelectorAll("#entrance-access button")].map(b=>b.textContent.trim())})')
    click('#entrance-access button:last-child'); wait('document.body.dataset.entry==="welcome"', 10); time.sleep(.5)
    P['welcome'] = c.js('({entry:document.body.dataset.entry,lang:document.documentElement.lang,errors:window.qaErrors||[]})')
    P['errors'] = c.js('window.qaErrors||[]')
    print('panels', json.dumps({k: P[k] for k in ['t0', 't9_6', 'observedMs', 'labelLog', 'languageControl', 'error', 'welcome']}, ensure_ascii=False)[:2500], flush=True)
    # index.html : la rotation continue.
    I = R['index']
    load(BASE + 'index.html?qa=verif-d5-index', 1280, 900); c.js(REC); t0 = now()
    I['t0'] = c.js(STATE)
    time.sleep(9.2); r = rec(); I['changes'] = changes_after(r, t0); I['t9'] = c.js(STATE)
    print('index', json.dumps(I, ensure_ascii=False)[:1500], flush=True)
    t0s = P['t0']; t9 = P['t9_6']
    plain = all(s[b]['slots'] == 0 and s[b]['spans'] == 0 and s[b]['ariaDescription'] is None for s in (t0s, P['t4_7'], t9) for b in ('login', 'guest'))
    R['verdicts'] = {
        'panelsPlainLabels': plain,
        'panelsTextsStable': [t0s['login']['text'], t0s['guest']['text']] == ['Se connecter', 'Visiter'] == [t9['login']['text'], t9['guest']['text']],
        'panelsNoRotation9s': len(P['labelLog']) == 1 and P['observedMs'] >= 9000,
        'panelsSiteFr': t0s['site'] == 'fr' == t9['site'],
        'panelsLanguageSwitch': all(s['state']['login']['text'] == {'en': 'Sign in', 'ar': 'تسجيل الدخول', 'fr': 'Se connecter'}[s['locale']] and s['state']['guest']['text'] == {'en': 'Visit', 'ar': 'زيارة', 'fr': 'Visiter'}[s['locale']] and s['state']['login']['buttonLang'] == s['locale'] and not s['labelChanges'] for s in switches) and len(switches) == 3,
        'panelsNoErrors': not P['errors'],
        'indexRotates': len(I['changes']) >= 2 and I['changes'][0]['dtMs'] <= 4500 and I['changes'][1]['dtMs'] - I['changes'][0]['dtMs'] <= 4500 and I['t0']['login']['slots'] == 1 and bool(I['t0']['login']['ariaDescription']),
    }
    R['passed'] = all(R['verdicts'].values())
except Exception as error:
    R['failure'] = traceback.format_exc()[-1500:]; print(R['failure'], flush=True)
    try: shot(OUT / 'echec.png'); R['failureState'] = c.js(STATE)
    except Exception: pass
finally:
    try: c.js('1')
    except Exception: pass
    R['console'] = c.console
    R['before144FromAudit'] = '/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/codex-audit/contre-perimetre-strict/chrome/p1-results.json (welcomePanels)'
    R['sourcesUnchanged'] = before == hashes(); R['sources'] = before
    R['durationS'] = round(time.time() - T0, 1)
    save(OUT / 'resultats.json', R); cleanup(c)
