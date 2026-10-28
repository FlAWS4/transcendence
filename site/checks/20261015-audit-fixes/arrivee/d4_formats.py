"""D4 — compte de l'écran d'erreur dans d'autres formats (145) : 320×640 sombre en arabe,
667×375 clair (paysage, contenu d'erreur défilant), 390×844 clair en arabe.

Mesures : rectangle du compte contre message et boutons (chevauchement), compte atteignable
(elementFromPoint) avant et après défilement du contenu d'erreur, panneau entièrement dans la
fenêtre, textes arabes du message et des boutons, sens rtl. Globe bloqué. Sources non modifiées.
"""
import json, time, traceback
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/arrivee/cdp.py').read())
OUT = EVID / 'd4-formats'; OUT.mkdir(parents=True, exist_ok=True)
T0 = time.time(); before = hashes()
R = {'script': 'd4_formats.py', 'cases': [], 'passed': None}
c = Chrome('d4-formats.log'); h = make(c); globals().update(h)
GEOM = r'''(()=>{const p=document.querySelector('#profile'),st=document.querySelector('#entrance-status'),ent=document.querySelector('#entrance');
 const rect=e=>{const q=e.getBoundingClientRect();return[Math.round(q.x),Math.round(q.y),Math.round(q.width),Math.round(q.height)]};
 const inter=(a,b)=>a[2]>0&&b[2]>0&&!(a[0]+a[2]<=b[0]||b[0]+b[2]<=a[0]||a[1]+a[3]<=b[1]||b[1]+b[3]<=a[1]);
 const r=p.getBoundingClientRect(),hit=r.width?document.elementFromPoint(r.x+r.width/2,r.y+r.height/2):null;
 const buttons=[...document.querySelectorAll('#entrance-access button')],pr=rect(p);const m=document.querySelector('#account-menu');
 return{entry:document.body.dataset.entry,lang:document.documentElement.lang,dir:document.documentElement.dir,theme:document.documentElement.dataset.theme,status:st.textContent,buttons:buttons.map(b=>b.textContent.trim()),
  profile:pr,profileHit:!!(hit&&p.contains(hit)),statusRect:rect(st),buttonRects:buttons.map(rect),overlap:[st,...buttons].filter(e=>inter(pr,rect(e))).map(e=>e.textContent.trim().slice(0,30)),
  scroll:{top:ent.scrollTop,height:ent.scrollHeight,client:ent.clientHeight},menu:m&&!m.hidden?rect(m):null,viewport:[innerWidth,innerHeight],errors:window.qaErrors||[]}})()'''


def set_theme(value):
    for _ in range(2):
        if c.js('document.documentElement.dataset.theme') == value: return
        point(20, 220); move(4, 4); time.sleep(.2)


try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    c.call('Network.enable'); c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*']})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'no-preference'}]})
    for w, hh, theme, locale in [(320, 640, 'dark', 'ar'), (667, 375, 'light', 'fr'), (390, 844, 'light', 'ar')]:
        name = '%dx%d-%s-%s' % (w, hh, theme, locale)
        load(BASE + 'index.html?qa=verif-d4-formats-' + name, w, hh); set_theme(theme)
        click('#entry-guest'); wait('document.body.dataset.entry==="error"', 25); move(4, 4); time.sleep(.4)
        entry = {'case': name, 'initial': c.js(GEOM)}
        if locale != 'fr':
            click('#profile'); wait('!document.querySelector("#account-menu").hidden', 5); entry['menuHome'] = c.js(GEOM)['menu']
            click('[data-account-action=settings]'); click('[data-account-locale=' + locale + ']'); time.sleep(.3)
            entry['menuSettings'] = c.js(GEOM)['menu']; shot(OUT / (name + '-panneau.png')); key('Escape'); time.sleep(.2)
        else:
            click('#profile'); wait('!document.querySelector("#account-menu").hidden', 5); entry['menuHome'] = c.js(GEOM)['menu']; key('Escape'); time.sleep(.2)
        entry['after'] = c.js(GEOM); shot(OUT / (name + '-erreur.png'))
        c.js('(e=>{e.scrollTop=e.scrollHeight;return true})(document.querySelector("#entrance"))'); time.sleep(.3)
        entry['scrolledBottom'] = c.js(GEOM)
        if entry['scrolledBottom']['scroll']['height'] > entry['scrolledBottom']['scroll']['client']: shot(OUT / (name + '-erreur-defilee.png'))
        g = entry['after']; s = entry['scrolledBottom']; W = g['viewport'][0]
        menus = [m for m in [entry.get('menuHome'), entry.get('menuSettings')] if m]
        entry['verdict'] = {'noOverlapInitial': not g['overlap'], 'noOverlapScrolled': not s['overlap'], 'profileHit': g['profileHit'] and s['profileHit'],
                            'menuInsideViewport': all(m[0] >= 0 and m[0] + m[2] <= W for m in menus),
                            'arabicTexts': locale != 'ar' or (g['status'] == 'تعذّر تجهيز العالم.' and g['buttons'] == ['إعادة المحاولة', 'العودة إلى الرسالة', 'المتابعة دون الكرة الأرضية'] and g['dir'] == 'rtl'),
                            'noErrors': not g['errors']}
        R['cases'].append(entry); print(json.dumps(entry, ensure_ascii=False)[:1600], flush=True)
    R['passed'] = all(all(e['verdict'].values()) for e in R['cases'])
except Exception as error:
    R['failure'] = traceback.format_exc()[-1500:]; print(R['failure'], flush=True)
    try: shot(OUT / 'echec.png')
    except Exception: pass
finally:
    try: c.js('1')
    except Exception: pass
    R['console'] = c.console
    R['sourcesUnchanged'] = before == hashes(); R['sources'] = before
    R['durationS'] = round(time.time() - T0, 1)
    save(OUT / 'resultats.json', R); cleanup(c)
