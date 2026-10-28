"""D4 — compléments de la reprise du 15 octobre 2026 (zone « arrivée »), état actif 145.

Le correctif D4 rend le compte utilisable sur l'écran d'erreur : on peut désormais y changer thème et
langue puis revenir à l'arrivée ou réessayer. Ces parcours n'existaient pas en 144 (compte masqué).
1. Écran d'erreur → panneau (sombre + EN, puis sombre + AR) → Échap → « Revenir au message » :
   arrivée dans la langue choisie, compte masqué, contrôle de fond visible et localisé, libellés qui
   partent de la langue du site et tournent toutes les 4 s, langue et sens du site inchangés, paire
   de boutons stable (ordre rtl en arabe) ; fenêtre de connexion dans la langue du site ; Annuler à
   la souris → la rotation continue ; clic du fond → thème basculé. 1280×900, puis AR en 390×844.
2. « Réessayer » après passage en anglais : compte masqué pendant opening/ring/waiting, visible au
   nouvel écran d'erreur (anglais) ; puis panneau ouvert et clic direct sur « Réessayer » : panneau
   refermé, même relevé ; « Continuer sans le globe » → accueil avec compte, sans erreur.
Globe bloqué. Écrit sous arrivee/complement-d4/. Sources non modifiées.
"""
import json, time, traceback
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
OUT = EVID / 'complement-d4'; OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'complement_d4.py', 'retour': {}, 'reessayer': {}, 'passed': None}
c = Chrome('complement-d4.log'); h = make(c); globals().update(h)

PHASES = r'''(()=>{window.qaPhases=[];const acc=document.querySelector('.account-switcher');
 const snap=why=>qaPhases.push({why,entry:document.body.dataset.entry,account:acc?getComputedStyle(acc).display:null,menuHidden:document.querySelector('#account-menu')?.hidden??null,t:Math.round(performance.now())});
 snap('start');new MutationObserver(()=>snap('data-entry')).observe(document.body,{attributes:true,attributeFilter:['data-entry']});return true})()'''
ERRS = r'''({entry:document.body.dataset.entry,lang:document.documentElement.lang,dir:document.documentElement.dir||'ltr',theme:document.documentElement.dataset.theme,
 status:document.querySelector('#entrance-status').hidden?null:document.querySelector('#entrance-status').textContent,buttons:[...document.querySelectorAll('#entrance-access button')].map(b=>b.textContent.trim()),
 account:getComputedStyle(document.querySelector('.account-switcher')).display,menuHidden:document.querySelector('#account-menu')?.hidden??null,toggleHidden:document.querySelector('#entry-theme-toggle').hidden,errors:window.qaErrors||[]})'''
EXTRA = r'''(()=>{const t=document.querySelector('#entry-theme-toggle');return{toggleLabel:t.getAttribute('aria-label'),toggleLang:t.getAttribute('lang'),
 sceneLabel:document.querySelector('#entrance-scene').getAttribute('aria-label'),entranceLabel:document.querySelector('#entrance').getAttribute('aria-label'),
 overflow:document.documentElement.scrollWidth>innerWidth,direction:getComputedStyle(document.documentElement).direction}})()'''
NEXT = {'fr': 'en', 'en': 'ar', 'ar': 'fr'}
LOGIN = {'fr': 'Se connecter', 'en': 'Sign in', 'ar': 'تسجيل الدخول'}
TITLE = {'en': 'Sign in — prototype', 'ar': 'تسجيل الدخول — نموذج أولي'}


def set_theme(value):
    for _ in range(2):
        if c.js('document.documentElement.dataset.theme') == value: return
        point(20, 220); move(4, 4); time.sleep(.2)


def to_error(url, w, hh, theme):
    load(url, w, hh); set_theme(theme)
    click('#entry-guest'); wait('document.body.dataset.entry==="error"', 25); time.sleep(.4)


def panel(theme=None, locale=None):
    click('#profile'); wait('!document.querySelector("#account-menu").hidden', 5)
    click('[data-account-action=settings]'); wait('Boolean(document.querySelector("[data-account-theme]"))', 5)
    if theme: click('[data-account-theme=' + theme + ']'); time.sleep(.25)
    if locale: click('[data-account-locale=' + locale + ']'); time.sleep(.3)
    key('Escape'); time.sleep(.2)


def pair(s):
    return {'labels': [s['login']['lang'], s['guest']['lang']], 'texts': [s['login']['text'], s['guest']['text']], 'login': s['login']['rect'], 'guest': s['guest']['rect'], 'site': s['site'], 'dir': s['dir']}


try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Network.enable'); c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*']})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'no-preference'}]})
    # 1. Retour à l'arrivée après changement de langue et de thème sur l'écran d'erreur.
    for w, hh, locale, layout in [(1280, 900, 'en', 'row-ltr'), (1280, 900, 'ar', 'row-rtl'), (390, 844, 'ar', 'column')]:
        name = '%dx%d-%s' % (w, hh, locale)
        to_error(BASE + 'index.html?qa=verif-complement-d4-retour-' + name, w, hh, 'light')
        panel('dark', locale)
        err = c.js(ERRS)
        c.js(REC); c.js(PHASES)
        click('#entrance-access button:nth-child(2)')
        wait('Boolean(document.querySelector("#entry-login .entrance-action-label"))', 5)
        t_back = now(); move(4, 4); time.sleep(.3)
        s0 = c.js(STATE); x0 = c.js(EXTRA); shot(OUT / ('145-arrivee-apres-retour-' + name + '.png'))
        time.sleep(4.1); s1 = c.js(STATE); time.sleep(4.0); s2 = c.js(STATE); x2 = c.js(EXTRA)
        r = rec(); ch = changes_after(r, t_back)
        samples = [pair(s) for s in (s0, s1, s2)]
        expected = [locale, NEXT[locale], NEXT[NEXT[locale]]]
        # Fenêtre de connexion, puis Annuler à la souris.
        click('#entry-login'); wait('document.querySelector("#dialog").open', 5)
        dlg = c.js('({title:document.querySelector("#dialog-title").textContent,buttons:[...document.querySelectorAll("#dialog-content button")].map(b=>b.textContent.trim()),close:document.querySelector("#close-dialog").getAttribute("aria-label")})')
        click('#dialog-content button:last-child'); wait('!document.querySelector("#dialog").open', 5); move(4, 4)
        t_cancel = now(); sc = c.js(STATE); time.sleep(4.6); ch_cancel = changes_after(rec(), t_cancel)
        theme_before = c.js('document.documentElement.dataset.theme'); point(20, 220); move(4, 4); time.sleep(.2)
        theme_after = c.js('document.documentElement.dataset.theme')
        out = {'errorScreenAfterPanel': {k: err[k] for k in ['entry', 'lang', 'dir', 'theme', 'status', 'buttons', 'account', 'toggleHidden', 'errors']},
               'phasesAfterBack': c.js('qaPhases'),
               'arrival': {'entry': s0['entry'], 'site': s0['site'], 'dir': s0['dir'], 'theme': s0['theme'], 'account': s0['account'], 'toggleHidden': s0['toggleHidden']} | x0,
               'samples': samples, 'labelChangesAfterBack': ch, 'expectedOrder': expected, 'extraAt8s': x2,
               'dialog': dlg, 'afterCancel': {'active': sc['active'], 'label': sc['login']['lang']}, 'labelChangesAfterCancel': ch_cancel,
               'backgroundClick': {'before': theme_before, 'after': theme_after}, 'errors': c.js('window.qaErrors||[]')}
        L = [s['login'] for s in samples]; G = [s['guest'] for s in samples]
        layout_ok = all((l[0] < g[0] and l[1] == g[1]) if layout == 'row-ltr' else (l[0] > g[0] and l[1] == g[1]) if layout == 'row-rtl' else (l[1] < g[1] and l[0] == g[0]) for l, g in zip(L, G))
        out['verdict'] = {
            'arrivalAccountHidden': s0['account'] == 'none' and s2['account'] == 'none',
            'toggleVisibleAndLocalised': s0['toggleHidden'] is False and x0['toggleLang'] == locale and x0['toggleLabel'] == {'en': 'Switch to light mode', 'ar': 'التبديل إلى الوضع الفاتح'}[locale],
            'themeKeptDark': s0['theme'] == 'dark',
            'labelsStartInSiteLanguage': samples[0]['labels'] == [locale, locale] and samples[0]['texts'][0] == LOGIN[locale],
            'rotationOrderAndTiming': [e['lang'] for e in ch][:2] == expected[1:] and len(ch) >= 2 and ch[0]['dtMs'] <= 4500 and ch[1]['dtMs'] - ch[0]['dtMs'] <= 4500,
            'siteLanguageUnchanged': all(s['site'] == locale and s['dir'] == ('rtl' if locale == 'ar' else 'ltr') for s in samples),
            'pairStableAndOrdered': all(l == L[0] for l in L) and all(g == G[0] for g in G) and L[0][2] == G[0][2] and L[0][3] == G[0][3] and layout_ok and not x2['overflow'],
            'dialogInSiteLanguage': dlg['title'] == TITLE[locale],
            'rotationAfterCancel': sc['active'] == 'entry-login' and len(ch_cancel) >= 1 and ch_cancel[0]['dtMs'] <= 4500,
            'backgroundTheme': theme_after != theme_before,
            'noErrors': not out['errors'] and not err['errors'],
        }
        R['retour'][name] = out
        print('retour', name, json.dumps(out['verdict']), json.dumps({k: out[k] for k in ['arrival', 'labelChangesAfterBack', 'dialog', 'labelChangesAfterCancel']}, ensure_ascii=False)[:1200], flush=True)
    # 2. Réessayer après passage en anglais, puis avec le panneau ouvert.
    to_error(BASE + 'index.html?qa=verif-complement-d4-reessayer', 1280, 900, 'light')
    panel(None, 'en')
    c.js(PHASES); click('#entrance-access button:first-child')
    wait('qaPhases.some(p=>p.entry==="opening")&&document.body.dataset.entry==="error"', 25); time.sleep(.4)
    R['reessayer']['simple'] = {'phases': c.js('qaPhases'), 'error': c.js(ERRS)}
    click('#profile'); wait('!document.querySelector("#account-menu").hidden', 5)
    target = centre('#entrance-access button:first-child')
    hit = c.js('((x,y)=>{const e=document.elementFromPoint(x,y);return e?(e.closest("#account-menu")?"account-menu":(e.closest("button")?.textContent.trim()||e.id||e.tagName)):null})(' + str(target['x']) + ',' + str(target['y']) + ')')
    c.js(PHASES); click('#entrance-access button:first-child')
    wait('qaPhases.some(p=>p.entry==="opening")&&document.body.dataset.entry==="error"', 25); time.sleep(.4)
    R['reessayer']['panneauOuvert'] = {'elementUnderTryAgain': hit, 'phases': c.js('qaPhases'), 'error': c.js(ERRS)}
    click('#entrance-access button:last-child'); wait('document.body.dataset.entry==="welcome"', 10); time.sleep(.5)
    R['reessayer']['accueil'] = c.js('({entry:document.body.dataset.entry,lang:document.documentElement.lang,account:getComputedStyle(document.querySelector(".account-switcher")).display,errors:window.qaErrors||[]})')
    def hidden_until_error(ph): return all(p['account'] == 'none' for p in ph if p['entry'] not in ('error', 'welcome')) and ph[-1]['entry'] == 'error' and ph[-1]['account'] != 'none'
    rs = R['reessayer']
    rs['verdict'] = {
        'simple': hidden_until_error(rs['simple']['phases']) and rs['simple']['error']['status'] == 'The world could not be prepared.' and rs['simple']['error']['buttons'] == ['Try again', 'Back to the message', 'Continue without the globe'],
        'panneauOuvert': hidden_until_error(rs['panneauOuvert']['phases']) and rs['panneauOuvert']['error']['menuHidden'] is True and rs['panneauOuvert']['error']['account'] != 'none',
        'accueil': rs['accueil']['account'] != 'none' and not rs['accueil']['errors'],
    }
    print('reessayer', json.dumps(rs, ensure_ascii=False)[:2000], flush=True)
    R['passed'] = all(all(v['verdict'].values()) for v in R['retour'].values()) and all(rs['verdict'].values())
except Exception as error:
    R['failure'] = traceback.format_exc()[-1500:]; print(R['failure'], flush=True)
    try: shot(OUT / 'echec.png'); R['failureState'] = c.js(ERRS)
    except Exception: pass
finally:
    try: c.js('1')
    except Exception: pass
    R['console'] = c.console
    R['sourcesUnchanged'] = before == hashes(); R['sources'] = before
    R['durationS'] = round(time.time() - T0, 1)
    save(OUT / 'resultats.json', R); cleanup(c)
