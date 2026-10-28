"""Zone « contraste » (D3), 15 octobre 2026 — panneau du compte sur content-preview.html#projects,
globe bloqué. Usage : bench_panel.py 145|144
 - sombre et clair à 1280×900, sombre et clair à 390×844 : propriétés calculées complètes de
   « Créer un compte » et « Se connecter » (repos, survol, focus clavier), paire d'images
   (normale / texte de « Créer un compte » seul rendu transparent) pour le contraste réel ;
 - arabe 390 sombre, anglais 1280 sombre, préférence « Système » avec un système émulé sombre ;
 - instantané des couleurs de tous les éléments (panneau ouvert) pour la non-régression.
Écrit uniquement dans le dossier de preuves de la zone et dans le scratchpad verif-contraste.
"""
import sys,time,json
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/contraste/helper.py').read())
mode=sys.argv[1] if len(sys.argv)>1 else '145'
assert mode in PREFIX,mode
prefix=PREFIX[mode]
SIGNUP='[data-account-action=signup]';SIGNIN='[data-account-action=signin]'
R={'mode':mode,'started':time.strftime('%Y-%m-%d %H:%M:%S'),'sourcesBefore':hashes(),'cases':{},'snapshots':{},'skipped':[],'passed':False}
started=time.time()
def left():return 225-(time.time()-started)
c=Chrome();h=make(c);globals().update(h)
def panel_open():return c.js('Boolean(document.querySelector("#account-menu"))&&!document.querySelector("#account-menu").hidden')
def open_panel():
 if not panel_open():click('#profile');wait('Boolean(document.querySelector("#account-menu"))&&!document.querySelector("#account-menu").hidden')
 away()
def close_panel():
 if panel_open():key('Escape')
 away()
def load(w,hgt,route,tag):
 c.width(w,hgt);c.call('Page.navigate',{'url':BASE+prefix+'content-preview.html?qa=verif-contraste-'+mode+'-'+tag+route})
 wait('document.body&&document.body.dataset.entry==="welcome"&&Boolean(document.querySelector("#profile"))',30)
 c.js('document.fonts.ready.then(()=>true)');time.sleep(.8)
def measure(tag,deep=True,snap=False):
 out={'theme':theme(),'lang':lang(),'preference':c.js('document.documentElement.dataset.themePreference'),'viewport':c.js('[innerWidth,innerHeight]')}
 open_panel()
 out['tokens']=tokens(['--h42-ink','--h42-pink','--h42-color-focus','--h42-access-accent','--control-glass-surface'])
 out['signup']=computed(SIGNUP);out['signin']=computed(SIGNIN)
 out['menu']=brief('#account-menu');out['menuBackdrop']=c.js('getComputedStyle(document.querySelector("#account-menu")).backdropFilter')
 if snap:
  data=snapshot();path=TMP/f'snap-{mode}-{tag}.json';path.write_text(json.dumps(data,ensure_ascii=False));R['snapshots'][tag]={'count':data['count'],'file':str(path)}
 clip=menu_clip();out['clip']=clip
 out['pairRest']=pair(SIGNUP,f'{mode}-{tag}-repos',clip)
 if deep:
  hover(SIGNUP);out['signupHover']=computed(SIGNUP);out['pairHover']=pair(SIGNUP,f'{mode}-{tag}-survol',clip);away()
  hover(SIGNIN);out['signinHover']=computed(SIGNIN);away()
  start=c.js('(()=>{const e=document.querySelector("#account-menu [data-account-action=close]")||document.querySelector("#account-menu button");e.focus();return e.dataset.accountAction||e.textContent.trim()})()')
  out['focusStart']=start
  out['tabsToSignin']=tab_to('document.activeElement&&document.activeElement.dataset.accountAction==="signin"')
  out['signinFocus']=computed(SIGNIN);out['signinFocusInfo']=focus_info();shot(f'{mode}-{tag}-focus-signin',clip)
  out['tabsToSignup']=tab_to('document.activeElement&&document.activeElement.dataset.accountAction==="signup"')
  out['signupFocus']=computed(SIGNUP);out['signupFocusInfo']=focus_info()
  out['pairFocus']=pair(SIGNUP,f'{mode}-{tag}-focus',clip)
  out['signupFocusAfterPair']=focus_info()
 close_panel()
 return out
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':QA_ERRORS})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 # (1) 1280×900, #projects : sombre puis clair.
 load(1280,900,'#projects','1280')
 for value in ['dark','light']:
  settings('fr',value);assert theme()==value,('theme',theme());close_panel()
  R['cases'][f'p1280-{value}']=measure(f'p1280-{value}',deep=True,snap=True)
  s=R['cases'][f'p1280-{value}']
  print(mode,'1280',value,'signup',s['signup']['style']['background-color'],s['signup']['style']['color'],'hover',s['signupHover']['style']['background-color'],'focus',s['signupFocusInfo']['visible'],s['signupFocusInfo']['outlineColor'],flush=True)
 # (2) 390×844, #projects : nouveau chargement, sombre puis clair.
 load(390,844,'#projects','390')
 for value in ['dark','light']:
  settings('fr',value);assert theme()==value,('theme',theme());close_panel()
  R['cases'][f'p390-{value}']=measure(f'p390-{value}',deep=(value=='dark'),snap=False)
  s=R['cases'][f'p390-{value}']
  print(mode,'390',value,'signup',s['signup']['style']['background-color'],s['signup']['style']['color'],flush=True)
 # (3) Arabe (RTL) à 390 et anglais à 1280, sombre.
 if left()>60:
  settings('ar','dark');close_panel()
  R['cases']['p390-dark-ar']=measure('p390-dark-ar',deep=False)
  load(1280,900,'#projects','1280-en')
  settings('en','dark');close_panel()
  R['cases']['p1280-dark-en']=measure('p1280-dark-en',deep=False)
  print(mode,'ar/en',R['cases']['p390-dark-ar']['signup']['style']['background-color'],R['cases']['p1280-dark-en']['signup']['style']['background-color'],flush=True)
 else:R['skipped'].append('ar-en')
 # (4) Préférence « Système » avec un système émulé sombre.
 if left()>30:
  c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'},{'name':'prefers-color-scheme','value':'dark'}]})
  settings('fr','system');close_panel();time.sleep(.3)
  R['cases']['p1280-system-dark']=measure('p1280-system-dark',deep=False)
  print(mode,'system',R['cases']['p1280-system-dark']['theme'],R['cases']['p1280-system-dark']['preference'],R['cases']['p1280-system-dark']['signup']['style']['background-color'],flush=True)
 else:R['skipped'].append('system')
 R['errors']=errors();R['passed']=True
except Exception as error:
 R['failure']=repr(error)
 try:shot(f'{mode}-panneau-echec');R['failureText']=c.js('document.body.innerText.slice(0,600)')
 except Exception:pass
 print('FAILURE',repr(error),flush=True)
finally:
 R['durationSeconds']=round(time.time()-started,1);R['sourcesAfter']=hashes();R['sourcesUnchanged']=R['sourcesBefore']==R['sourcesAfter']
 save(f'panel-{mode}',R);cleanup(c)
