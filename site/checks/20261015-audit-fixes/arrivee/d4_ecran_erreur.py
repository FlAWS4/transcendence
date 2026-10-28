"""D4 — compte sur l'écran d'erreur de l'arrivée, état actif 145 puis archive 144.

f) 1280×900 clair puis 390×844 sombre, globe bloqué : compte masqué sur l'arrivée et pendant
   les phases d'ouverture (relevé de chaque changement de body[data-entry]) ; sur l'écran d'erreur
   (145) compte visible, #profile atteignable (elementFromPoint), panneau #account-menu ouvert,
   thème et langue changés par le panneau (message et trois boutons traduits), #entry-theme-toggle
   masqué ; « Continue without the globe » → accueil avec compte, sans erreur. 144 : compte absent.
g) Depuis l'écran d'erreur (145), « Se connecter » puis « Créer un compte » du panneau :
   retour à l'arrivée et fenêtre ; Annuler ; aucune erreur, aucun état bloqué.
   Observation : parcours membre (connexion confirmée) jusqu'à l'écran d'erreur.
Sources non modifiées.
"""
import json, time, traceback
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
OUT = EVID / 'd4-ecran-erreur'; OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'd4_ecran_erreur.py', 'runs': {}, 'passed': None}
c = Chrome('d4-erreur.log'); h = make(c); globals().update(h)

PHASES = r'''(()=>{window.qaPhases=[];const acc=document.querySelector('.account-switcher');
 const snap=why=>{const p=document.querySelector('#profile'),r=p?p.getBoundingClientRect():null;
  qaPhases.push({why,entry:document.body.dataset.entry,account:acc?getComputedStyle(acc).display:null,profile:r?[Math.round(r.x),Math.round(r.y),r.width,r.height]:null,toggleHidden:document.querySelector('#entry-theme-toggle')?.hidden??null,dialogOpen:!!document.querySelector('#dialog')?.open,t:Math.round(performance.now())});};
 snap('start');new MutationObserver(()=>snap('data-entry')).observe(document.body,{attributes:true,attributeFilter:['data-entry']});return true})()'''

ERR = r'''(()=>{const acc=document.querySelector('.account-switcher'),p=document.querySelector('#profile'),tog=document.querySelector('#entry-theme-toggle'),st=document.querySelector('#entrance-status'),menu=document.querySelector('#account-menu'),ent=document.querySelector('#entrance');
 const rect=e=>{const q=e.getBoundingClientRect();return[Math.round(q.x),Math.round(q.y),Math.round(q.width),Math.round(q.height)]};
 const inter=(a,b)=>a[2]>0&&b[2]>0&&!(a[0]+a[2]<=b[0]||b[0]+b[2]<=a[0]||a[1]+a[3]<=b[1]||b[1]+b[3]<=a[1]);
 const r=p.getBoundingClientRect();const hit=r.width?document.elementFromPoint(r.x+r.width/2,r.y+r.height/2):null;
 const buttons=[...document.querySelectorAll('#entrance-access button')],pr=rect(p);const a=document.activeElement;
 return{entry:document.body.dataset.entry,theme:document.documentElement.dataset.theme,preference:document.documentElement.dataset.themePreference,lang:document.documentElement.lang,dir:document.documentElement.dir,
  status:st.hidden?null:st.textContent,buttons:buttons.map(b=>b.textContent.trim()),buttonRects:buttons.map(rect),statusRect:rect(st),
  account:{display:getComputedStyle(acc).display,visibility:getComputedStyle(acc).visibility},profile:{rect:pr,hit:hit?(hit.closest('#profile')?'#profile':(hit.id||hit.className||hit.tagName)):null,label:p.getAttribute('aria-label')},
  overlapWithErrorContent:[st,...buttons].some(e=>!e.hidden&&inter(pr,rect(e))),
  toggle:{hidden:tog.hidden,display:getComputedStyle(tog).display},entrance:{bg:getComputedStyle(ent).backgroundColor,image:getComputedStyle(ent).backgroundImage.slice(0,60),hidden:ent.hidden},
  menuHidden:menu?menu.hidden:null,active:a?(a.id||(a.dataset&&a.dataset.accountAction)||a.textContent.trim().slice(0,30)||a.tagName):null,errors:window.qaErrors||[]}})()'''

MENU = r'''(()=>{const m=document.querySelector('#account-menu');if(!m||m.hidden)return{open:false};const r=m.getBoundingClientRect();
 const items=[...m.querySelectorAll('button')].map(b=>{const q=b.getBoundingClientRect();const x=q.x+q.width/2,y=q.y+q.height/2;const e=q.width?document.elementFromPoint(x,y):null;return{text:b.textContent.trim().slice(0,40),action:b.dataset.accountAction||b.dataset.accountTheme||b.dataset.accountLocale||null,hit:!!(e&&(e===b||b.contains(e)))}});
 return{open:true,rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],title:m.querySelector('h2')?.textContent,items}})()'''


def to_error(url, w, h, theme=None):
    load(url, w, h)
    arrival = c.js(ERR)
    if theme:
        for _ in range(2):
            if c.js('document.documentElement.dataset.theme') == theme: break
            point(20, 220); move(4, 4); time.sleep(.2)
    arrival_after_theme = c.js('({theme:document.documentElement.dataset.theme,account:getComputedStyle(document.querySelector(".account-switcher")).display})')
    c.js(PHASES)
    click('#entry-guest'); wait('document.body.dataset.entry==="error"', 25); time.sleep(.4)
    return arrival, arrival_after_theme, c.js('qaPhases')


def panel_switch(theme, locale, shot_name=None):
    steps = {}
    click('#profile'); wait('!document.querySelector("#account-menu").hidden', 5)
    steps['home'] = c.js(MENU)
    click('[data-account-action=settings]'); wait('Boolean(document.querySelector("[data-account-theme]"))', 5)
    steps['settings'] = c.js(MENU)
    if theme:
        for value in theme:
            click('[data-account-theme=' + value + ']'); time.sleep(.25)
            steps['theme-' + value] = c.js(ERR)
    if locale:
        click('[data-account-locale=' + locale + ']'); time.sleep(.3)
        steps['locale-' + locale] = c.js(ERR)
        steps['settingsAfterLocale'] = c.js(MENU)
    if shot_name: shot(OUT / shot_name)
    key('Escape'); time.sleep(.2)
    steps['afterEscape'] = c.js(ERR)
    return steps


try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Network.enable'); c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*']})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'no-preference'}]})
    # ---- 145, 1280×900 clair
    run = R['runs']['145-1280-clair'] = {}
    arrival, themed, phases = to_error(BASE + 'index.html?qa=verif-d4-145-1280', 1280, 900, 'light')
    run['arrival'] = {'account': arrival['account'], 'toggle': arrival['toggle'], 'entry': arrival['entry'], 'theme': themed}
    run['phases'] = phases; run['error'] = c.js(ERR)
    shot(OUT / '145-1280-clair-erreur.png')
    run['panel'] = panel_switch(['dark'], 'en', '145-1280-panneau-anglais-sombre.png')
    click('#entrance-access button:last-child'); wait('document.body.dataset.entry==="welcome"', 10); time.sleep(.6)
    run['welcome'] = c.js('({entry:document.body.dataset.entry,lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,account:getComputedStyle(document.querySelector(".account-switcher")).display,profileHit:(p=>{const r=p.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return!!(e&&p.contains(e))})(document.querySelector("#profile")),errors:window.qaErrors||[]})')
    print('145-1280', json.dumps({k: run[k] for k in ['arrival', 'error', 'welcome']}, ensure_ascii=False)[:1500], flush=True)
    # ---- g) 145 : « Se connecter » puis « Créer un compte » du panneau depuis l'écran d'erreur
    g = R['runs']['145-1280-panneau-depuis-erreur'] = {}
    arrival, themed, phases = to_error(BASE + 'index.html?qa=verif-d4-145-g', 1280, 900, 'light')
    for action in ['signin', 'signup']:
        if c.js('document.body.dataset.entry') != 'error':
            c.js(PHASES); click('#entry-guest'); wait('document.body.dataset.entry==="error"', 25); time.sleep(.4)
        c.js(PHASES); c.js(REC)
        click('#profile'); wait('!document.querySelector("#account-menu").hidden', 5)
        label = c.js('document.querySelector("[data-account-action=' + action + ']").textContent.trim()')
        click('[data-account-action=' + action + ']'); time.sleep(.5)
        st = c.js('({entry:document.body.dataset.entry,dialogOpen:document.querySelector("#dialog").open,kind:document.querySelector("#dialog").dataset.kind||null,title:document.querySelector("#dialog-title").textContent,buttons:[...document.querySelectorAll("#dialog-content button")].map(b=>b.textContent.trim()),account:getComputedStyle(document.querySelector(".account-switcher")).display,menuHidden:document.querySelector("#account-menu").hidden,toggleHidden:document.querySelector("#entry-theme-toggle").hidden,access:[...document.querySelectorAll("#entrance-access button")].map(b=>b.id),active:document.activeElement?.id||document.activeElement?.tagName})')
        shot(OUT / ('145-1280-g-' + action + '-fenetre.png'))
        click('#dialog-content button:last-child'); wait('!document.querySelector("#dialog").open', 5); move(4, 4)
        t1 = now(); after = c.js(STATE); time.sleep(4.8); r = rec()
        g[action] = {'panelButton': label, 'afterClick': st, 'phases': c.js('qaPhases'), 'afterCancel': {k: after[k] for k in ['entry', 'active', 'site', 'theme', 'toggleHidden', 'account']} | {'label': after['login']['lang'] if after['login'] else None},
                     'labelChangesAfterCancel': changes_after(r, t1), 'errors': c.js('window.qaErrors||[]')}
        print('g', action, json.dumps(g[action], ensure_ascii=False)[:1200], flush=True)
    # ---- Observation : connexion confirmée → écran d'erreur (145)
    m = R['runs']['145-1280-membre'] = {}
    load(BASE + 'index.html?qa=verif-d4-145-membre', 1280, 900); c.js(PHASES)
    click('#entry-login'); wait('document.querySelector("#dialog").open', 5)
    click('#dialog-content > button:first-of-type'); wait('document.body.dataset.entry==="error"', 30); time.sleep(.4)
    m['phases'] = c.js('qaPhases'); m['error'] = c.js(ERR)
    click('#profile'); wait('!document.querySelector("#account-menu").hidden', 5); m['panel'] = c.js(MENU); key('Escape')
    click('#entrance-access button:last-child'); wait('document.body.dataset.entry==="welcome"', 10); time.sleep(.5)
    m['welcome'] = c.js('({account:getComputedStyle(document.querySelector(".account-switcher")).display,profileLabel:document.querySelector("#profile").getAttribute("aria-label"),errors:window.qaErrors||[]})')
    print('membre', json.dumps(m, ensure_ascii=False)[:1500], flush=True)
    # Observation : « Se connecter » du panneau après une connexion confirmée (écran d'erreur), nouvelle page.
    load(BASE + 'index.html?qa=verif-d4-145-membre-2', 1280, 900); c.js(PHASES)
    click('#entry-login'); wait('document.querySelector("#dialog").open', 5)
    click('#dialog-content > button:first-of-type'); wait('document.body.dataset.entry==="error"', 30); time.sleep(.4)
    c.js(PHASES); c.js(REC); click('#profile'); wait('!document.querySelector("#account-menu").hidden', 5); click('[data-account-action=signin]'); time.sleep(.5)
    m['signinFromMemberError'] = c.js('({entry:document.body.dataset.entry,dialogOpen:document.querySelector("#dialog").open,title:document.querySelector("#dialog-title").textContent,scene:document.querySelector("#entrance-scene").getAttribute("aria-label"),access:[...document.querySelectorAll("#entrance-access button")].map(b=>b.id||b.textContent.trim()),accessHidden:document.querySelector("#entrance-access").hidden,account:getComputedStyle(document.querySelector(".account-switcher")).display})')
    shot(OUT / '145-1280-membre-se-connecter-depuis-erreur.png')
    click('#dialog-content button:last-child'); wait('!document.querySelector("#dialog").open', 5); move(4, 4); t1 = now(); time.sleep(4.8)
    m['afterCancelFromMemberError'] = c.js(STATE) | {'labelChanges': changes_after(rec(), t1), 'phases': c.js('qaPhases')}
    print('membre-2', json.dumps({k: m[k] for k in ['signinFromMemberError', 'afterCancelFromMemberError']}, ensure_ascii=False)[:1500], flush=True)
    # ---- 144, 1280×900 clair
    run = R['runs']['144-1280-clair'] = {}
    arrival, themed, phases = to_error(BASE + A144 + 'index.html?qa=verif-d4-144-1280', 1280, 900, 'light')
    run['arrival'] = {'account': arrival['account'], 'toggle': arrival['toggle'], 'entry': arrival['entry'], 'theme': themed}
    run['phases'] = phases; run['error'] = c.js(ERR); shot(OUT / '144-1280-clair-erreur.png')
    point(1210, 62); time.sleep(.3)  # where the account sits in 145
    run['clickWhereAccountWouldBe'] = c.js('({menuHidden:document.querySelector("#account-menu").hidden,theme:document.documentElement.dataset.theme,entry:document.body.dataset.entry})')
    print('144-1280', json.dumps({k: run[k] for k in ['arrival', 'error', 'clickWhereAccountWouldBe']}, ensure_ascii=False)[:1200], flush=True)
    # ---- 145, 390×844 sombre (le thème choisi par le panneau à 1280 est conservé ; vérifié)
    run = R['runs']['145-390-sombre'] = {}
    arrival, themed, phases = to_error(BASE + 'index.html?qa=verif-d4-145-390', 390, 844, 'dark')
    run['arrival'] = {'account': arrival['account'], 'toggle': arrival['toggle'], 'entry': arrival['entry'], 'theme': themed}
    run['phases'] = phases; run['error'] = c.js(ERR); shot(OUT / '145-390-sombre-erreur.png')
    run['panel'] = panel_switch(['light', 'dark'], 'en', '145-390-panneau-anglais-sombre.png')
    run['afterPanel'] = c.js(ERR); shot(OUT / '145-390-sombre-erreur-anglais.png')
    click('#entrance-access button:last-child'); wait('document.body.dataset.entry==="welcome"', 10); time.sleep(.6)
    run['welcome'] = c.js('({entry:document.body.dataset.entry,lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,account:getComputedStyle(document.querySelector(".account-switcher")).display,errors:window.qaErrors||[]})')
    print('145-390', json.dumps({k: run[k] for k in ['arrival', 'error', 'afterPanel', 'welcome']}, ensure_ascii=False)[:1500], flush=True)
    # ---- 144, 390×844 sombre
    run = R['runs']['144-390-sombre'] = {}
    arrival, themed, phases = to_error(BASE + A144 + 'index.html?qa=verif-d4-144-390', 390, 844, 'dark')
    run['arrival'] = {'account': arrival['account'], 'toggle': arrival['toggle'], 'entry': arrival['entry'], 'theme': themed}
    run['phases'] = phases; run['error'] = c.js(ERR); shot(OUT / '144-390-sombre-erreur.png')
    print('144-390', json.dumps({k: run[k] for k in ['arrival', 'error']}, ensure_ascii=False)[:1200], flush=True)
    # Verdicts
    def hidden_before_error(ph): return all(p['account'] == 'none' for p in ph if p['entry'] not in ('error', 'welcome'))
    v = {}
    for name in ['145-1280-clair', '145-390-sombre']:
        r = R['runs'][name]; e = r['error']; pnl = r['panel']; loc = pnl.get('locale-en', {})
        v[name] = {'arrivalHidden': r['arrival']['account']['display'] == 'none' and r['arrival']['theme']['account'] == 'none', 'phasesHidden': hidden_before_error(r['phases']), 'errorVisible': e['account']['display'] != 'none' and e['profile']['hit'] == '#profile',
                   'menuOpened': pnl['home']['open'], 'themeChanged': all(pnl['theme-' + t]['theme'] == t for t in ['light', 'dark'] if 'theme-' + t in pnl),
                   'translated': loc.get('status') == 'The world could not be prepared.' and loc.get('buttons') == ['Try again', 'Back to the message', 'Continue without the globe'] and loc.get('lang') == 'en',
                   'toggleHidden': e['toggle']['hidden'] and loc.get('toggle', {}).get('hidden'), 'noOverlap': not e['overlapWithErrorContent'],
                   'welcomeAccount': r['welcome']['account'] != 'none' and not r['welcome']['errors']}
    for name in ['144-1280-clair', '144-390-sombre']:
        r = R['runs'][name]
        v[name] = {'arrivalHidden': r['arrival']['account']['display'] == 'none' and r['arrival']['theme']['account'] == 'none', 'phasesHidden': hidden_before_error(r['phases']), 'errorHidden': r['error']['account']['display'] == 'none' and r['error']['profile']['hit'] != '#profile'}
    R['verdicts'] = v
    R['passed'] = all(all(x.values()) for x in v.values())
except Exception as error:
    R['failure'] = traceback.format_exc()[-1500:]; print(R['failure'], flush=True)
    try: shot(OUT / 'echec.png'); R['failureState'] = c.js(ERR)
    except Exception: pass
finally:
    try: c.js('1')
    except Exception: pass
    R['console'] = c.console
    R['sourcesUnchanged'] = before == hashes(); R['sources'] = before
    R['durationS'] = round(time.time() - T0, 1)
    save(OUT / 'resultats.json', R); cleanup(c)
