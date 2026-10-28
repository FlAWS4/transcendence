"""Browser checks for the animated-entry-144 state, resumed on 14 October 2026.

Re-run copy of 15 October 2026 (verification of the audit fixes, active state
audit-fixes-145): identical cases; only the repository root, the output folder,
the Chrome log path and a "rerun" note in the results differ from the original
checks/20261013-animated-entry-labels-browser.py.

Explicit requests of 13 October under verification: only the two arrival
labels (Se connecter / Visiter) rotate FR → EN → AR, with an animated text
transition; the site language and reading direction never change because of
that rotation; the two buttons keep equal, constant dimensions and their order
in every language; the account stays hidden on arrival; the background changes
the theme. Isolated headless Chrome, real timers, no source instrumentation.
"""
from pathlib import Path
import json,time,base64,hashlib,shutil,traceback
root=Path('/home/le-rif/Bureau/Transcendence/site')
exec((root/'checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0].replace('/tmp/horizon-dock-chrome.log','/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/verif-arrivee/bench-chrome.log').replace("'/tmp/'+name+'.png'","'/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/verif-arrivee/'+name+'.png'"))
out=root/'checks/20261015-audit-fixes/146/arrivee/bench-20261014-rejoue-146';out.mkdir(parents=True,exist_ok=True)
base='http://127.0.0.1:8765/site/'
files=['index.html','content-preview.html','welcome.mjs','content-preview.mjs','entrance.mjs','entrance.css','dock-navigation.css','globe-framing.css','account-menu.mjs']
hashes=lambda:{name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in files}
initial=hashes()
expected={'fr':['Se connecter','Visiter'],'en':['Sign in','Visit'],'ar':['تسجيل الدخول','زيارة']}
order=['fr','en','ar']
c=Chrome();results=[];passed=False;failure=None
def wait(expression,seconds=25):
 end=time.time()+seconds
 while time.time()<end:
  if c.js(expression):return
  time.sleep(.1)
 raise AssertionError('Timeout: '+expression)
def click(selector):
 pos=c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');if(!e)throw Error("Missing target "+'+json.dumps(selector)+');e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error("Hidden target");return{x:r.x+r.width/2,y:r.y+r.height/2}})()')
 for kind in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':kind,**pos,'button':'left','clickCount':1})
 time.sleep(.12)
def key(name):
 codes={'Escape':27,'Tab':9,'Enter':13,'Space':32}
 for kind in ['keyDown','keyUp']:
  payload={'type':kind,'key':' ' if name=='Space' else name,'code':name,'windowsVirtualKeyCode':codes[name]}
  if name=='Space' and kind=='keyDown':payload['text']=' '
  c.call('Input.dispatchKeyEvent',payload)
 time.sleep(.12)
def shot(name):(out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def record(name,value=True):results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False)[:400],flush=True)
def away():c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':4,'y':4})
def hold(seconds):c.js('new Promise(resolve=>setTimeout(resolve,'+str(int(seconds*1000))+'))')
def point(x,y):
 for kind in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':kind,'x':x,'y':y,'button':'left','clickCount':1})
 time.sleep(.15)
READ='(()=>{const L=document.querySelector("#entry-login"),G=document.querySelector("#entry-guest");if(!L||!G)return null;const l=L.querySelector(".entrance-action-label"),g=G.querySelector(".entrance-action-label"),a=L.getBoundingClientRect(),b=G.getBoundingClientRect();return{site:document.documentElement.lang,dir:getComputedStyle(document.documentElement).direction,label:l.lang,labelDir:l.dir,guestLabel:g.lang,text:[l.textContent,g.textContent],buttonLang:[L.lang,G.lang],login:{x:a.x,y:a.y,w:a.width,h:a.height},guest:{x:b.x,y:b.y,w:b.width,h:b.height},outgoing:document.querySelectorAll(".entrance-action-label-outgoing").length,animating:l.getAnimations().length+g.getAnimations().length,overflow:document.documentElement.scrollWidth>innerWidth,entry:document.body.dataset.entry,errors:qaErrors,focused:document.activeElement&&document.activeElement.id}})()'
def state():
 s=c.js(READ);assert s,'Entrance buttons missing';return s
def observe(changes=3,limit=14500):
 # Sample the login label language every 25 ms; keep a full snapshot at every change.
 return c.js('new Promise((resolve,reject)=>{const read=()=>'+READ+';const rows=[Object.assign(read(),{t:performance.now()})];const start=performance.now();const timer=setInterval(()=>{const s=read();if(!s)return;if(s.label!==rows.at(-1).label){s.t=performance.now();rows.push(s)}if(rows.length==='+str(changes+1)+'){clearInterval(timer);resolve(rows)}else if(performance.now()-start>'+str(limit)+'){clearInterval(timer);reject(Error("Label cycle stalled: "+JSON.stringify(rows.map(r=>[r.label,r.t])))) }},25)})')
def same_pair(s):
 assert s['login']['w']==s['guest']['w'] and s['login']['h']==s['guest']['h'],('unequal pair',s)
 assert not s['overflow'] and not s['errors'],('overflow/errors',s)
 assert s['text']==expected[s['label']] and s['guestLabel']==s['label'] and s['buttonLang']==[s['label']]*2,('labels',s)
 assert s['labelDir']==('rtl' if s['label']=='ar' else 'ltr'),('label dir',s)
def check_cycle(rows,site,direction,row_layout):
 for a,b in zip(rows,rows[1:]):assert order[(order.index(a['label'])+1)%3]==b['label'],rows
 for i in [2,3]:assert 3800<=rows[i]['t']-rows[i-1]['t']<=4300,[r['t'] for r in rows]
 for r in rows:
  assert r['site']==site and r['dir']==direction,('site language changed',r)
  same_pair(r)
  assert r['login']['w']==rows[0]['login']['w'] and r['login']['h']==rows[0]['login']['h'],('dimensions changed',r['login'],rows[0]['login'])
  if row_layout=='row-ltr':assert r['login']['x']<r['guest']['x'] and r['login']['y']==r['guest']['y'],('order',r)
  if row_layout=='row-rtl':assert r['login']['x']>r['guest']['x'] and r['login']['y']==r['guest']['y'],('order',r)
  if row_layout=='column':assert r['login']['y']<r['guest']['y'] and r['login']['x']==r['guest']['x'],('order',r)
  assert r['login']['x']==rows[0]['login']['x'] and r['guest']['x']==rows[0]['guest']['x'],('buttons moved',r,rows[0])
 for r in rows[1:]:assert r['outgoing']>=1 and r['animating']>=1,('no transition captured',r)
 return {'order':[r['label'] for r in rows],'intervalsMs':[round(rows[i]['t']-rows[i-1]['t']) for i in range(1,4)],'site':site,'dir':direction,'pair':{'w':rows[0]['login']['w'],'h':rows[0]['login']['h']},'texts':[r['text'] for r in rows]}
def load(width,height,query):
 c.width(width,height);c.call('Page.navigate',{'url':base+'index.html?qa='+query})
 wait('Boolean(document.querySelector("#entry-login .entrance-action-label"))');c.js('document.fonts.ready.then(()=>true)');time.sleep(.6);away()
def set_theme(value):
 for _ in range(2):
  if c.js('document.documentElement.dataset.theme')==value:return
  point(20,220);away();time.sleep(.2)
 assert c.js('document.documentElement.dataset.theme')==value
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)))'})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'no-preference'}]})
 # 1. Desktop, French site, ordinary motion: private cycle, animated transition, stable pair.
 load(1280,900,'animated-144');s=state()
 assert c.js('getComputedStyle(document.querySelector(".account-switcher")).display')=='none' and not c.js('document.querySelector("#entry-theme-toggle").hidden')
 assert s['site']=='fr' and s['label']=='fr';record('arrival-account-hidden-french-site',{'site':s['site'],'label':s['label'],'text':s['text']})
 rows=observe();record('private-label-cycle-desktop',check_cycle(rows,'fr','ltr','row-ltr'))
 hold(.5);s=state();assert s['outgoing']==0 and s['animating']==0,s;record('transition-settles',{'outgoing':s['outgoing'],'animating':s['animating']})
 # 2. Pauses: hover, keyboard focus, open dialog, hidden tab.
 rect=c.js('(()=>{const r=document.querySelector("#entry-login").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved',**rect});before=state()['label'];hold(4.4);assert state()['label']==before;record('hover-pauses-labels',before)
 away();time.sleep(.2);c.js('document.querySelector("#entry-theme-toggle").focus()');key('Tab');assert c.js('document.activeElement.id')=='entry-login';before=state()['label'];hold(4.4);assert state()['label']==before;record('keyboard-focus-pauses-labels',before)
 click('#entry-login');wait('document.querySelector("#dialog").open');before=state()['label'];title=c.js('document.querySelector("#dialog h2, #dialog [id^=dialog-title], #dialog-title")?.textContent||document.querySelector("#dialog").textContent.trim().slice(0,40)')
 assert 'Connexion' in title,title;hold(4.4);assert state()['label']==before;record('dialog-pauses-labels-and-stays-french',{'label':before,'dialogTitle':title});click('#dialog-content button:last-child');wait('!document.querySelector("#dialog").open')
 point(20,220);away();time.sleep(.3)
 c.js('Object.defineProperty(document,"hidden",{get:()=>true,configurable:true});document.dispatchEvent(new Event("visibilitychange"));true');before=state()['label'];hold(4.4);assert state()['label']==before
 c.js('delete document.hidden;document.dispatchEvent(new Event("visibilitychange"));true');wait('document.querySelector("#entry-login .entrance-action-label").lang!=='+json.dumps(before),6);record('hidden-tab-pauses-then-resumes',{'during':before,'after':state()['label']})
 # 3. Background theme control: pointer on the background and the gap, keyboard on its control.
 away();first=c.js('document.documentElement.dataset.theme');point(20,220);assert c.js('document.documentElement.dataset.theme')!=first;record('background-click-theme',c.js('document.documentElement.dataset.theme'))
 gap=c.js('(()=>{const a=document.querySelector("#entry-login").getBoundingClientRect(),b=document.querySelector("#entry-guest").getBoundingClientRect();return{x:(a.right+b.left)/2,y:a.y+a.height/2}})()');first=c.js('document.documentElement.dataset.theme');point(**gap);assert c.js('document.documentElement.dataset.theme')!=first;record('gap-click-theme',c.js('document.documentElement.dataset.theme'))
 away();c.js('document.querySelector("#entry-theme-toggle").focus()');first=c.js('document.documentElement.dataset.theme');key('Space');assert c.js('document.documentElement.dataset.theme')!=first;record('keyboard-background-theme',{'theme':c.js('document.documentElement.dataset.theme'),'focusVisible':c.js('document.activeElement.matches(":focus-visible")')})
 point(20,220);away();set_theme('light');wait('document.querySelector("#entry-login .entrance-action-label").lang==="en"',14);hold(.6);shot('arrival-desktop-light-english-label');s=state();same_pair(s);assert s['outgoing']==0 and s['animating']==0,s;record('desktop-light-english-label',{'site':s['site'],'label':s['label'],'text':s['text']})
 # 4. Reduced motion: labels still change, without any transition.
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]});before=state()['label']
 rows=c.js('new Promise((resolve,reject)=>{const read=()=>'+READ+';const start=performance.now();const timer=setInterval(()=>{const s=read();if(s.label!=='+json.dumps(before)+'){clearInterval(timer);resolve(s)}else if(performance.now()-start>5000){clearInterval(timer);reject(Error("stalled"))}},20)})')
 assert rows['outgoing']==0 and rows['animating']==0 and rows['site']=='fr',rows;same_pair(rows);record('reduced-motion-changes-without-transition',{'label':rows['label'],'outgoing':rows['outgoing'],'animating':rows['animating']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'no-preference'}]})
 # 5. Entering while Arabic labels are shown keeps a French site.
 wait('document.querySelector("#entry-login .entrance-action-label").lang==="ar"',14);s=state();assert s['site']=='fr' and s['dir']=='ltr',s
 click('#entry-guest');wait('document.body.dataset.entry==="error"');e=c.js('({site:document.documentElement.lang,status:document.querySelector("#entrance-status").textContent,buttons:[...document.querySelectorAll("#entrance-access button")].map(b=>b.textContent)})')
 assert e['site']=='fr' and e['buttons'][-1]=='Continuer sans le globe',e
 click('#entrance-access button:last-child');wait('document.body.dataset.entry==="welcome"');hold(.5)
 w=c.js('({site:document.documentElement.lang,dir:getComputedStyle(document.documentElement).direction,account:getComputedStyle(document.querySelector(".account-switcher")).display,dock:[...document.querySelectorAll("#main-nav a, #main-nav button")].map(e=>e.textContent.trim()).filter(Boolean).slice(0,5),errors:qaErrors})')
 assert w['site']=='fr' and w['dir']=='ltr' and w['account']!='none' and 'Explorer' in w['dock'] and not w['errors'],w;record('visit-during-arabic-keeps-french-site',w);shot('welcome-after-arabic-visit')
 # 6. Sign-in dialog while English labels are shown is French; the pair keeps its size in dark.
 load(1280,900,'animated-144-signin');set_theme('dark');wait('document.querySelector("#entry-login .entrance-action-label").lang==="en"',14)
 click('#entry-login');wait('document.querySelector("#dialog").open');d=c.js('({site:document.documentElement.lang,text:document.querySelector("#dialog").textContent.trim().slice(0,60),bg:getComputedStyle(document.querySelector("#entry-login")).backgroundColor})')
 assert d['site']=='fr' and 'Connexion' in d['text'] and d['bg']=='rgb(237, 52, 145)',d;record('signin-during-english-is-french-dark',d);click('#dialog-content button:last-child');wait('!document.querySelector("#dialog").open')
 # 7. Mobile 390×844 dark, 320×640 dark and landscape 667×375: equal pair, no movement, no overflow.
 for width,height,layout,name in [(390,844,'column','mobile-390-dark'),(320,640,'column','mobile-320-dark'),(667,375,'row-ltr','landscape-667')]:
  load(width,height,'animated-144-'+str(width));set_theme('dark' if layout=='column' else 'light');rows=observe();record('private-label-cycle-'+name,check_cycle(rows,'fr','ltr',layout))
  if width!=390:
   # First shot right after the change: both labels overlap during the cross-fade (expected);
   # second shot once the transition has settled, with the Arabic labels alone.
   wait('document.querySelector("#entry-login .entrance-action-label").lang==="ar"',14);shot('arrival-'+name+'-arabic-label-mid-transition');hold(.6);s=state();assert s['outgoing']==0 and s['animating']==0 and s['label']=='ar',s;same_pair(s);shot('arrival-'+name+'-arabic-label');record('settled-arabic-label-'+name,{'text':s['text'],'pair':s['login']})
  else:shot('arrival-'+name)
 # 8. Arabic site at arrival, when the language chosen in the account persists across loads.
 load(1280,900,'animated-144-ar-prep');wait('document.querySelector("#entry-login .entrance-action-label").lang==="fr"',14);click('#entry-guest');wait('document.body.dataset.entry==="error"');click('#entrance-access button:last-child');wait('document.body.dataset.entry==="welcome"');hold(.4)
 click('#profile');click('[data-account-action=settings]');click('[data-account-locale=ar]');key('Escape');time.sleep(.3)
 assert c.js('document.documentElement.lang')=='ar'
 load(1280,900,'animated-144-ar');s=state()
 if s['site']=='ar':
  rows=observe();record('private-label-cycle-arabic-site',check_cycle(rows,'ar','rtl','row-rtl'));shot('arrival-arabic-site-desktop')
 else:record('arabic-site-not-persisted-at-arrival',{'site':s['site'],'note':'the account language choice does not persist across page loads; Arabic-site arrival cycle not observed'})
 assert initial==hashes();passed=True
except Exception as e:
 failure=str(e);traceback.print_exc()
 try:shot('failure');record('failure',c.js('({errors:qaErrors,entry:document.body.dataset.entry,text:document.body.innerText.slice(0,600)})'))
 except Exception:pass
finally:
 (out/'browser-results.json').write_text(json.dumps({'rerun':'15 October 2026, active state audit-fixes-145 (welcome.mjs?v=audit-fixes-145, entrance.mjs?v=audit-fixes-14, entrance.css?v=audit-fixes-24)','passed':passed,'failure':failure,'cases':results,'sourcesBefore':initial,'sourcesAfter':hashes(),'limits':'Isolated headless Chrome, real 4-second timers, keyboard/mouse events, emulated viewports and dark theme via the background control. The hidden-tab pause is simulated by overriding document.hidden and dispatching visibilitychange. The integrated globe import is blocked so the arrival reaches the error path; the real globe is covered by the separate recentering checks. No physical phone or screen reader.'},ensure_ascii=False,indent=2)+'\n')
 try:c.close()
 finally:shutil.rmtree(c.profile,ignore_errors=True)
if not passed:raise SystemExit(1)
