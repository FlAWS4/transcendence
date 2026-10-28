"""Zone « contraste » (D3), 15 octobre 2026 — compléments ajoutés à la reprise (après les bancs
panel / globe / arrival / motion de 12 h 20–12 h 43). Usage : bench_complement.py 145|144
 A. content-preview.html#projects, 1280×900, globe bloqué, mouvement réduit : état PRESSÉ (:active,
    bouton de la souris maintenu) de « Créer un compte » en sombre puis en clair (propriétés calculées
    complètes et paire d'images normale / texte transparent), puis relâchement et fermeture du dialogue.
 B. index.html, 1280×900, globe bloqué : thème CLAIR choisi par le fond (20,220), Visiter → écran
    d'erreur de la carte : instantané des couleurs de tous les éléments. En 145 seulement (le compte
    est masqué en 144) : panneau du compte ouvert sur l'écran d'erreur, « Créer un compte » en clair,
    bascule en sombre PAR LE PANNEAU (le fond y est inactif), repos / survol / focus clavier en
    sombre, instantané avec le panneau ouvert, puis retour au clair.
Écrit uniquement dans le dossier de preuves de la zone et dans le scratchpad verif-contraste.
"""
import sys,time,json
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/contraste/helper.py').read())
mode=sys.argv[1] if len(sys.argv)>1 else '145'
assert mode in PREFIX,mode
prefix=PREFIX[mode]
SIGNUP='[data-account-action=signup]';SIGNIN='[data-account-action=signin]'
R={'mode':mode,'started':time.strftime('%Y-%m-%d %H:%M:%S'),'sourcesBefore':hashes(),'pressed':{},'errorLight':{},'snapshots':{},'skipped':[],'passed':False}
started=time.time()
def left():return 225-(time.time()-started)
c=Chrome();h=make(c);globals().update(h)
READY='Boolean(document.querySelector("#entry-login"))&&["encrypted","scanning"].includes(document.body.dataset.entry)'
def panel_open():return c.js('Boolean(document.querySelector("#account-menu"))&&!document.querySelector("#account-menu").hidden')
def open_panel():
 if not panel_open():click('#profile');wait('Boolean(document.querySelector("#account-menu"))&&!document.querySelector("#account-menu").hidden')
 away()
def close_panel():
 if panel_open():key('Escape')
 away()
def snap(tag):
 data=snapshot();path=TMP/f'snap-{mode}-{tag}.json';path.write_text(json.dumps(data,ensure_ascii=False));R['snapshots'][tag]={'count':data['count'],'file':str(path)}
def press_measure(tag):
 """Souris maintenue sur le bouton : :active réel, relevés, paire d'images ; puis relâchement."""
 clip=menu_clip()
 pos=centre(SIGNUP)
 c.call('Input.dispatchMouseEvent',{'type':'mouseMoved',**pos});time.sleep(.35)
 c.call('Input.dispatchMouseEvent',{'type':'mousePressed',**pos,'button':'left','clickCount':1});time.sleep(.35)
 out={'active':c.js('document.querySelector('+json.dumps(SIGNUP)+').matches(":active")'),'hover':c.js('document.querySelector('+json.dumps(SIGNUP)+').matches(":hover")')}
 out['computed']=computed(SIGNUP);out['signinWhilePressed']=computed(SIGNIN)
 out['pair']=pair(SIGNUP,f'{mode}-{tag}',clip)
 out['activeAfterPair']=c.js('document.querySelector('+json.dumps(SIGNUP)+').matches(":active")')
 c.call('Input.dispatchMouseEvent',{'type':'mouseReleased',**pos,'button':'left','clickCount':1});time.sleep(.4)
 out['dialogOpened']=c.js('Boolean(document.querySelector("#dialog")&&document.querySelector("#dialog").open)')
 out['dialogKind']=c.js('document.querySelector("#dialog")?.dataset.kind||null')
 if out['dialogOpened']:
  click('#dialog-content > button:last-of-type');wait('!document.querySelector("#dialog").open');away()
 return out
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':QA_ERRORS})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 # ---------------------------------------------------------------- A. état pressé
 c.width(1280,900);c.call('Page.navigate',{'url':BASE+prefix+'content-preview.html?qa=verif-contraste-presse-'+mode+'#projects'})
 wait('document.body&&document.body.dataset.entry==="welcome"&&Boolean(document.querySelector("#profile"))',30)
 c.js('document.fonts.ready.then(()=>true)');time.sleep(.8)
 for value in ['dark','light']:
  settings('fr',value);close_panel();assert theme()==value,('theme',theme())
  open_panel()
  R['pressed'][value]=press_measure(f'presse-{value}')
  close_panel()
  s=R['pressed'][value]
  print(mode,'presse',value,'active',s['active'],s['activeAfterPair'],'bg',s['computed']['style']['background-color'],'color',s['computed']['style']['color'],'transform',s['computed']['style']['transform'],'dialog',s['dialogKind'],flush=True)
 # ---------------------------------------------------------------- B. écran d'erreur en clair
 c.width(1280,900);c.call('Page.navigate',{'url':BASE+prefix+'index.html?qa=verif-contraste-erreur-clair-'+mode})
 wait(READY,25);c.js('document.fonts.ready.then(()=>true)');time.sleep(.6)
 R['arrivalThemeAtLoad']=theme()
 if theme()!='light':point(20,220);away()
 assert theme()=='light',('arrival theme',theme())
 click('#entry-guest');wait('document.body.dataset.entry==="error"',30);time.sleep(.5)
 E=R['errorLight']
 E['theme']=theme();E['entry']=c.js('document.body.dataset.entry');E['status']=c.js('document.querySelector("#entrance-status")?.textContent')
 E['buttons']=c.js('[...document.querySelectorAll("#entrance-access button")].map(b=>[b.textContent.trim(),getComputedStyle(b).backgroundColor,getComputedStyle(b).color])')
 E['account']=c.js('(()=>{const s=document.querySelector(".account-switcher"),p=document.querySelector("#profile");const r=p.getBoundingClientRect();const hit=r.width?document.elementFromPoint(r.x+r.width/2,r.y+r.height/2):null;return{switcherDisplay:getComputedStyle(s).display,profileRect:{x:r.x,y:r.y,w:r.width,h:r.height},hitIsProfile:Boolean(hit&&(hit===p||p.contains(hit)))}})()')
 shot(f'{mode}-erreur-light-page')
 snap('erreur-light')
 print(mode,'erreur clair',E['entry'],E['theme'],E['account'],flush=True)
 if E['account']['switcherDisplay']!='none' and E['account']['hitIsProfile']:
  open_panel()
  E['lightSignup']=computed(SIGNUP);E['lightSignin']=computed(SIGNIN)
  E['pairLight']=pair(SIGNUP,f'{mode}-erreur-light-repos',menu_clip())
  close_panel()
  # Bascule en sombre par le panneau du compte (le contrôle du fond est inactif ici).
  E['backgroundClickTheme']=None
  settings('fr','dark');close_panel()
  E['themeAfterPanelSwitch']=theme();E['entryAfterPanelSwitch']=c.js('document.body.dataset.entry')
  assert theme()=='dark',('error theme',theme())
  open_panel()
  E['darkSignup']=computed(SIGNUP);E['darkSignin']=computed(SIGNIN)
  clip=menu_clip();E['clipDark']=clip
  E['pairDarkRest']=pair(SIGNUP,f'{mode}-erreur-dark2-repos',clip)
  hover(SIGNUP);E['darkSignupHover']=computed(SIGNUP);E['pairDarkHover']=pair(SIGNUP,f'{mode}-erreur-dark2-survol',clip);away()
  c.js('(()=>{const e=document.querySelector("#account-menu [data-account-action=close]")||document.querySelector("#account-menu button");e.focus()})()')
  E['tabsToSignup']=tab_to('document.activeElement&&document.activeElement.dataset.accountAction==="signup"')
  E['darkSignupFocus']=computed(SIGNUP);E['darkFocusInfo']=focus_info();E['pairDarkFocus']=pair(SIGNUP,f'{mode}-erreur-dark2-focus',clip)
  snap('erreur-dark-panneau-ouvert')
  shot(f'{mode}-erreur-dark2-page')
  close_panel()
  settings('fr','light');close_panel()
  E['themeBack']=theme();open_panel();E['lightSignupAgain']=computed(SIGNUP);close_panel()
  E['entryAtEnd']=c.js('document.body.dataset.entry')
  print(mode,'erreur panneau','clair',E['lightSignup']['style']['background-color'],E['lightSignup']['style']['color'],'sombre',E['darkSignup']['style']['background-color'],E['darkSignup']['style']['color'],'focus',E['darkFocusInfo']['visible'],E['darkFocusInfo']['outlineColor'],'retour',E['themeBack'],E['lightSignupAgain']['style']['background-color'],flush=True)
 else:
  R['skipped'].append('error-panel: account not reachable on the error screen')
 R['errors']=errors();R['passed']=True
except Exception as error:
 R['failure']=repr(error)
 try:shot(f'{mode}-complement-echec');R['failureText']=c.js('document.body.innerText.slice(0,600)')
 except Exception:pass
 print('FAILURE',repr(error),flush=True)
finally:
 R['durationSeconds']=round(time.time()-started,1);R['sourcesAfter']=hashes();R['sourcesUnchanged']=R['sourcesBefore']==R['sourcesAfter']
 save(f'complement-{mode}',R);cleanup(c)
