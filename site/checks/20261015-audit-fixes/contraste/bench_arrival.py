"""Zone « contraste » (D3), 15 octobre 2026 — arrivée (index.html, 1280×900, globe bloqué).
Usage : bench_arrival.py 145|144
 - #entry-login et #entry-guest, clair et sombre (thème par clic du fond en 20,220) : propriétés
   calculées complètes au repos, au survol et au focus clavier ; boutons du dialogue de connexion ;
 - Visiter → écran d'erreur (compte visible ? panneau sombre mesuré s'il s'ouvre) →
   « Continuer sans le globe » → #profile : « Créer un compte » en sombre (paires d'images,
   survol, focus) puis en clair ; boutons des dialogues de connexion et de création après l'entrée.
Le cycle des libellés est figé pendant les relevés de l'arrivée (document.hidden simulé puis rendu)
pour comparer 144 et 145 dans la même langue d'affichage (fr).
Écrit uniquement dans le dossier de preuves de la zone et dans le scratchpad verif-contraste.
"""
import sys,time,json
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/contraste/helper.py').read())
mode=sys.argv[1] if len(sys.argv)>1 else '145'
assert mode in PREFIX,mode
prefix=PREFIX[mode]
SIGNUP='[data-account-action=signup]';SIGNIN='[data-account-action=signin]'
R={'mode':mode,'started':time.strftime('%Y-%m-%d %H:%M:%S'),'sourcesBefore':hashes(),'arrival':{},'error':{},'after':{},'snapshots':{},'skipped':[],'passed':False}
started=time.time()
def left():return 225-(time.time()-started)
c=Chrome();h=make(c);globals().update(h)
READY='Boolean(document.querySelector("#entry-login"))&&["encrypted","scanning"].includes(document.body.dataset.entry)'
LABEL='(document.querySelector("#entry-login .entrance-action-label")||document.querySelector("#entry-login")).getAttribute("lang")'
FREEZE='(()=>{Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});document.dispatchEvent(new Event("visibilitychange"));return document.hidden})()'
UNFREEZE='(()=>{delete document.hidden;document.dispatchEvent(new Event("visibilitychange"));return document.hidden})()'
def panel_open():return c.js('Boolean(document.querySelector("#account-menu"))&&!document.querySelector("#account-menu").hidden')
def open_panel():
 if not panel_open():click('#profile');wait('Boolean(document.querySelector("#account-menu"))&&!document.querySelector("#account-menu").hidden')
 away()
def close_panel():
 if panel_open():key('Escape')
 away()
def snap(tag):
 data=snapshot();path=TMP/f'snap-{mode}-{tag}.json';path.write_text(json.dumps(data,ensure_ascii=False));R['snapshots'][tag]={'count':data['count'],'file':str(path)}
def dialog_buttons():
 n=c.js('document.querySelectorAll("#dialog-content > button").length')
 out={'kind':c.js('document.querySelector("#dialog").dataset.kind'),'count':n,'buttons':[]}
 for i in range(1,n+1):
  sel=f'#dialog-content > button:nth-of-type({i})';out['buttons'].append({'selector':sel,'computed':computed(sel)})
 out['close']=computed('#close-dialog')
 if n:
  hover('#dialog-content > button:nth-of-type(1)');out['confirmHover']=computed('#dialog-content > button:nth-of-type(1)');away()
 return out
def access_clip():
 a=brief('#entry-login');b=brief('#entry-guest')
 x0=min(a['x'],b['x'])-16;y0=min(a['y'],b['y'])-16;x1=max(a['x']+a['width'],b['x']+b['width'])+16;y1=max(a['y']+a['height'],b['y']+b['height'])+16
 return (x0,y0,x1-x0,y1-y0)
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':QA_ERRORS})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.width(1280,900);c.call('Page.navigate',{'url':BASE+prefix+'index.html?qa=verif-contraste-arrivee-'+mode})
 wait(READY,25);c.js('document.fonts.ready.then(()=>true)');time.sleep(.6)
 R['labelBeforeFreeze']=c.js(LABEL);R['frozen']=c.js(FREEZE);time.sleep(.2)
 for value in ['light','dark']:
  if theme()!=value:point(20,220);away()
  assert theme()==value,('arrival theme',theme())
  A={'theme':theme(),'entry':c.js('document.body.dataset.entry'),'label':c.js(LABEL)}
  A['login']=computed('#entry-login');A['guest']=computed('#entry-guest')
  shot(f'{mode}-arrivee-{value}',access_clip())
  snap(f'arrivee-{value}')
  hover('#entry-login');A['loginHover']=computed('#entry-login');away()
  hover('#entry-guest');A['guestHover']=computed('#entry-guest');away()
  c.js('document.querySelector("#entry-theme-toggle").focus()')
  A['tabsToLogin']=tab_to('document.activeElement&&document.activeElement.id==="entry-login"')
  A['loginFocus']=computed('#entry-login');A['loginFocusInfo']=focus_info()
  A['tabsToGuest']=tab_to('document.activeElement&&document.activeElement.id==="entry-guest"')
  A['guestFocus']=computed('#entry-guest');A['guestFocusInfo']=focus_info()
  click('#entry-login');wait('document.querySelector("#dialog").open');away()
  A['dialog']=dialog_buttons();A['labelInDialog']=c.js(LABEL)
  d=brief('#dialog');shot(f'{mode}-arrivee-{value}-dialogue',(d['x']-10,d['y']-10,d['width']+20,d['height']+20))
  snap(f'arrivee-{value}-dialogue')
  click('#dialog-content > button:last-of-type');wait('!document.querySelector("#dialog").open');away()
  A['labelAfter']=c.js(LABEL)
  R['arrival'][value]=A
  print(mode,'arrivee',value,'login',A['login']['style']['background-color'],A['login']['style']['color'],'guest',A['guest']['style']['background-color'],A['guest']['style']['color'],'dialog',A['dialog']['kind'],A['dialog']['count'],'label',A['label'],flush=True)
 R['unfrozen']=c.js(UNFREEZE)
 # Écran d'erreur (sombre) : Visiter avec le globe bloqué.
 assert theme()=='dark'
 click('#entry-guest');wait('document.body.dataset.entry==="error"',30);time.sleep(.4)
 E={'theme':theme(),'entry':c.js('document.body.dataset.entry'),'status':c.js('document.querySelector("#entrance-status")?.textContent'),'buttons':c.js('[...document.querySelectorAll("#entrance-access button")].map(b=>b.textContent.trim())')}
 E['account']=c.js('(()=>{const s=document.querySelector(".account-switcher"),p=document.querySelector("#profile");const r=p.getBoundingClientRect();const hit=r.width?document.elementFromPoint(r.x+r.width/2,r.y+r.height/2):null;return{switcherDisplay:getComputedStyle(s).display,profileRect:{x:r.x,y:r.y,w:r.width,h:r.height},hitIsProfile:Boolean(hit&&(hit===p||p.contains(hit))),hit:hit?hit.tagName+"#"+hit.id+"."+hit.className:null}})()')
 shot(f'{mode}-erreur-dark-page')
 snap('erreur-dark')
 if E['account']['switcherDisplay']!='none' and E['account']['hitIsProfile']:
  open_panel()
  E['signup']=computed(SIGNUP);E['signin']=computed(SIGNIN)
  E['pairRest']=pair(SIGNUP,f'{mode}-erreur-dark-repos',menu_clip())
  close_panel()
  print(mode,'erreur panneau',E['signup']['style']['background-color'],E['signup']['style']['color'],flush=True)
 else:print(mode,'erreur : compte non accessible',E['account'],flush=True)
 R['error']=E
 # Continuer sans le globe → panneau après l'entrée.
 click('#entrance-access button:last-of-type');wait('document.body.dataset.entry==="welcome"',20);time.sleep(.6)
 for value in ['dark','light']:
  if left()<35:R['skipped'].append('after-'+value);continue
  if theme()!=value:settings('fr',value);close_panel()
  assert theme()==value,('after theme',theme())
  P={'theme':theme(),'entry':c.js('document.body.dataset.entry')}
  open_panel()
  P['signup']=computed(SIGNUP);P['signin']=computed(SIGNIN)
  clip=menu_clip();P['clip']=clip
  P['pairRest']=pair(SIGNUP,f'{mode}-apres-entree-{value}-repos',clip)
  if value=='dark':
   hover(SIGNUP);P['signupHover']=computed(SIGNUP);P['pairHover']=pair(SIGNUP,f'{mode}-apres-entree-dark-survol',clip);away()
   c.js('(()=>{const e=document.querySelector("#account-menu [data-account-action=close]")||document.querySelector("#account-menu button");e.focus()})()')
   P['tabsToSignup']=tab_to('document.activeElement&&document.activeElement.dataset.accountAction==="signup"')
   P['signupFocus']=computed(SIGNUP);P['signupFocusInfo']=focus_info();P['pairFocus']=pair(SIGNUP,f'{mode}-apres-entree-dark-focus',clip)
  close_panel()
  P['dialogs']={}
  for kind in ['signin','signup']:
   open_panel();click(f'[data-account-action={kind}]');wait('document.querySelector("#dialog").open');away()
   P['dialogs'][kind]=dialog_buttons()
   click('#dialog-content > button:last-of-type');wait('!document.querySelector("#dialog").open');away()
  R['after'][value]=P
  print(mode,'apres entree',value,'signup',P['signup']['style']['background-color'],P['signup']['style']['color'],'dialogs',{k:v['kind'] for k,v in P['dialogs'].items()},flush=True)
 R['errors']=errors();R['passed']=True
except Exception as error:
 R['failure']=repr(error)
 try:shot(f'{mode}-arrivee-echec');R['failureText']=c.js('document.body.innerText.slice(0,600)')
 except Exception:pass
 print('FAILURE',repr(error),flush=True)
finally:
 R['durationSeconds']=round(time.time()-started,1);R['sourcesAfter']=hashes();R['sourcesUnchanged']=R['sourcesBefore']==R['sourcesAfter']
 save(f'arrival-{mode}',R);cleanup(c)
