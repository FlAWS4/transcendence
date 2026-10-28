"""Zone « contraste » (D3), 15 octobre 2026 — panneau du compte au-dessus du VRAI globe
(content-preview.html#explore, 1280×900, aucun blocage réseau). Usage : bench_globe.py 145|144
Sombre : repos, survol, focus clavier (paires normale / texte transparent) ; clair : repos.
Écrit uniquement dans le dossier de preuves de la zone et dans le scratchpad verif-contraste.
"""
import sys,time,json
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/contraste/helper.py').read())
mode=sys.argv[1] if len(sys.argv)>1 else '145'
assert mode in PREFIX,mode
prefix=PREFIX[mode]
SIGNUP='[data-account-action=signup]';SIGNIN='[data-account-action=signin]'
R={'mode':mode,'started':time.strftime('%Y-%m-%d %H:%M:%S'),'sourcesBefore':hashes(),'cases':{},'skipped':[],'passed':False}
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
def measure(tag,deep=True):
 out={'theme':theme(),'lang':lang(),'globeReady':c.js('Boolean(document.querySelector("#loading")&&document.querySelector("#loading").hidden)'),'canvas':c.js('(()=>{const k=document.querySelector("#globe canvas");if(!k)return null;const r=k.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})()')}
 open_panel()
 out['signup']=computed(SIGNUP);out['signin']=computed(SIGNIN)
 out['menu']=brief('#account-menu')
 clip=menu_clip();out['clip']=clip
 out['pairRest']=pair(SIGNUP,f'{mode}-{tag}-repos',clip)
 out['page']=shot(f'{mode}-{tag}-page')
 if deep:
  hover(SIGNUP);out['signupHover']=computed(SIGNUP);out['pairHover']=pair(SIGNUP,f'{mode}-{tag}-survol',clip);away()
  c.js('(()=>{const e=document.querySelector("#account-menu [data-account-action=close]")||document.querySelector("#account-menu button");e.focus()})()')
  out['tabsToSignup']=tab_to('document.activeElement&&document.activeElement.dataset.accountAction==="signup"')
  out['signupFocus']=computed(SIGNUP);out['signupFocusInfo']=focus_info()
  out['pairFocus']=pair(SIGNUP,f'{mode}-{tag}-focus',clip)
 close_panel()
 return out
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':QA_ERRORS})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.width(1280,900);c.call('Page.navigate',{'url':BASE+prefix+'content-preview.html?qa=verif-contraste-globe-'+mode+'#explore'})
 wait('document.body&&document.body.dataset.entry==="welcome"&&Boolean(document.querySelector("#profile"))',30)
 try:wait('Boolean(document.querySelector("#loading")&&document.querySelector("#loading").hidden)',90);R['globeReady']=True
 except AssertionError:R['globeReady']=False
 R['globeReadyAfterSeconds']=round(time.time()-started,1)
 c.js('document.fonts.ready.then(()=>true)');time.sleep(1.5)
 for value in ['dark','light']:
  if left()<40:R['skipped'].append(value);continue
  settings('fr',value);assert theme()==value,('theme',theme());close_panel();time.sleep(.8)
  R['cases'][f'g1280-{value}']=measure(f'g1280-{value}',deep=(value=='dark'))
  s=R['cases'][f'g1280-{value}']
  print(mode,'globe',value,'ready',s['globeReady'],'signup',s['signup']['style']['background-color'],s['signup']['style']['color'],flush=True)
 R['errors']=errors();R['passed']=True
except Exception as error:
 R['failure']=repr(error)
 try:shot(f'{mode}-globe-echec');R['failureText']=c.js('document.body.innerText.slice(0,600)')
 except Exception:pass
 print('FAILURE',repr(error),flush=True)
finally:
 R['durationSeconds']=round(time.time()-started,1);R['sourcesAfter']=hashes();R['sourcesUnchanged']=R['sourcesBefore']==R['sourcesAfter']
 save(f'globe-{mode}',R);cleanup(c)
