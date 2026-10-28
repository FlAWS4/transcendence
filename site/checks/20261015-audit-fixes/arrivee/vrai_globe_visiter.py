"""Chemin réel de l'arrivée avec le vrai globe (rien de bloqué) : 145 puis 144, 1280×900, animations normales.

Visiter → opening → ring → (waiting) → revealing → welcome : affichage du compte relevé à chaque
changement de body[data-entry] (masqué attendu jusqu'à welcome, y compris pendant revealing),
aucune erreur, compte visible à l'accueil. Délais bornés pour rester sous 4 minutes ; un état non
atteint est noté tel quel. Sources non modifiées.
"""
import json, time, traceback
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
OUT = EVID / 'vrai-globe'; OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'vrai_globe_visiter.py', 'viewport': [1280, 900], 'states': {}, 'passed': None}
c = Chrome('vrai-globe.log'); h = make(c); globals().update(h)
PHASES = r'''(()=>{window.qaPhases=[];const acc=document.querySelector('.account-switcher');
 const snap=why=>qaPhases.push({why,entry:document.body.dataset.entry,account:acc?getComputedStyle(acc).display:null,ready:!!document.querySelector('#loading')?.hidden,t:Math.round(performance.now())});
 snap('start');new MutationObserver(()=>snap('data-entry')).observe(document.body,{attributes:true,attributeFilter:['data-entry']});return true})()'''


SLOW = []


def soft_wait(expression, seconds):
    # Software WebGL in headless Chrome can hold the page thread for long stretches: a probe may wait
    # up to 60 s, always within a global budget that keeps the script under 4 minutes.
    end = min(time.time() + seconds, T0 + 150)
    while time.time() < end:
        t = time.time()
        try:
            if c.js(expression, timeout=max(5, min(60, end - time.time()))): return True
        except (RuntimeError, TimeoutError): pass
        if time.time() - t > 2: SLOW.append({'expression': expression[:60], 'probeS': round(time.time() - t, 1)})
        time.sleep(.25)
    return False


def budget():
    if time.time() - T0 > 150: raise TimeoutError('budget de 150 s dépassé (Chrome sans tête, WebGL logiciel)')


try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'no-preference'}]})
    for state, prefix in [('145', ''), ('144', A144)]:
        if time.time() - T0 > 110: R['states'][state] = {'skipped': 'budget de temps (4 minutes par script)'}; continue
        S = R['states'][state] = {}
        load(BASE + prefix + 'index.html?qa=verif-vrai-globe-' + state, 1280, 900); c.js(PHASES)
        t = time.time(); S['globeReadyBeforeVisit'] = soft_wait('document.querySelector("#loading")?.hidden===true', 30); S['readyWaitS'] = round(time.time() - t, 1)
        click('#entry-guest'); t = time.time()
        S['welcomeReached'] = soft_wait('document.body.dataset.entry==="welcome"', 75); S['visitToWelcomeS'] = round(time.time() - t, 1)
        time.sleep(.6); budget()
        S['phases'] = c.js('qaPhases', timeout=15)
        S['final'] = c.js('({entry:document.body.dataset.entry,account:getComputedStyle(document.querySelector(".account-switcher")).display,canvas:document.querySelectorAll("#globe canvas").length,errors:window.qaErrors||[]})', timeout=15); budget()
        shot(OUT / (state + '-accueil-vrai-globe.png'))
        S['accountHiddenUntilWelcome'] = all(p['account'] == 'none' for p in S['phases'] if p['entry'] != 'welcome')
        S['sawRevealing'] = any(p['entry'] == 'revealing' for p in S['phases'])
        print(state, json.dumps(S, ensure_ascii=False)[:1500], flush=True)
    R['passed'] = all(s.get('welcomeReached') and s.get('accountHiddenUntilWelcome') and s['final']['account'] != 'none' and not s['final']['errors'] for s in R['states'].values() if 'skipped' not in s)
except Exception as error:
    R['failure'] = traceback.format_exc()[-1500:]; print(R['failure'], flush=True)
    try:
        if not isinstance(error, TimeoutError): shot(OUT / 'echec.png')
    except Exception: pass
finally:
    try: c.js('1')
    except Exception: pass
    R['console'] = c.console; R['slowProbes'] = SLOW
    R['sourcesUnchanged'] = before == hashes(); R['sources'] = before
    R['durationS'] = round(time.time() - T0, 1)
    save(OUT / 'resultats.json', R); cleanup(c)
