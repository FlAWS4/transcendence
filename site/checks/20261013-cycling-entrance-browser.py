"""Browser-only checks for the explicitly requested colours and Visit dimensions."""
from pathlib import Path
import json,time,base64,hashlib
root=Path(__file__).resolve().parent.parent
exec((root/'checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=root/'checks/20261013-cycling-entrance';out.mkdir(exist_ok=True)
base='http://127.0.0.1:8765/site/'
c=Chrome();results=[];passed=False
files=['index.html','content-preview.html','welcome.mjs','content-preview.mjs','entrance.mjs','entrance.css','dock-navigation.css']
hashes=lambda:{name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in files}
initial=hashes()
def wait(expression,seconds=25):
 end=time.time()+seconds
 while time.time()<end:
  if c.js(expression):return
  time.sleep(.1)
 raise AssertionError(expression)
def click(selector):
 pos=c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');if(!e)throw Error("Missing target");e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error("Hidden target");return{x:r.x+r.width/2,y:r.y+r.height/2}})()')
 for kind in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':kind,**pos,'button':'left','clickCount':1})
 time.sleep(.12)
def key(name):
 for kind in ['keyDown','keyUp']:c.call('Input.dispatchKeyEvent',{'type':kind,'key':name,'code':name,'windowsVirtualKeyCode':{'Escape':27,'Tab':9}[name]})
 time.sleep(.12)
def shot(name):(out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def record(name,value=True):results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def style(selector):
 return c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+'),s=getComputedStyle(e),r=e.getBoundingClientRect();return{width:r.width,height:r.height,...Object.fromEntries(["backgroundColor","color","borderColor","borderRadius","fontSize","padding","minHeight","textAlign","outlineColor","outlineStyle","outlineWidth"].map(k=>[k,s[k]]))}})()')
def settings(locale,theme):
 click('#profile');click('[data-account-action=settings]');click('[data-account-locale='+locale+']');click('[data-account-theme='+theme+']');click('[data-account-action=back]')
 c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':0,'y':0});time.sleep(.2)
def healthy():
 state=c.js('({overflow:document.documentElement.scrollWidth>innerWidth,errors:qaErrors})');assert not state['overflow'] and not state['errors'],state
def load(prefix,page,locale,theme,width,height):
 c.width(width,height);c.call('Page.navigate',{'url':base+prefix+page+'?qa=targeted-colors-142#explore'})
 wait('Boolean(document.querySelector("#entry-login"))' if page=='index.html' else 'document.body?.dataset.entry==="welcome"')
 c.js('document.fonts.ready.then(()=>true)');time.sleep(.7);settings(locale,theme)
def chroma(selector,theme):
 s=style(selector);expected='rgb(0, 186, 188)' if theme=='light' else 'rgb(237, 52, 145)'
 assert s['backgroundColor']==expected and s['color']=='rgb(27, 27, 27)',(selector,s)
 return s
def dimension(s):return {k:s[k] for k in ['width','height','borderRadius','fontSize','padding','minHeight','textAlign']}
def point(x,y):
 for kind in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':kind,'x':x,'y':y,'button':'left','clickCount':1})
 time.sleep(.15)
def away():c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':4,'y':4})
def hold(seconds):c.js('new Promise(resolve=>setTimeout(resolve,'+str(int(seconds*1000))+'))')
def locale():return c.js('document.documentElement.lang')
def theme():return c.js('document.documentElement.dataset.theme')
def pair():
 a,b=style('#entry-login'),style('#entry-guest');assert a['width']==b['width'] and a['height']==b['height'],(a,b)
 return {'width':a['width'],'height':a['height'],'lang':locale(),'labels':c.js('[...document.querySelectorAll("#entry-login,#entry-guest")].map(e=>e.textContent)')}
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)))'})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.width(1280,900);c.call('Page.navigate',{'url':base+'index.html?qa=cycling-143'})
 wait('Boolean(document.querySelector("#entry-login"))');c.js('document.fonts.ready.then(()=>true)');time.sleep(.5)
 assert c.js('getComputedStyle(document.querySelector(".account-switcher")).display')=='none'
 assert not c.js('document.querySelector("#entry-theme-toggle").hidden');record('arrival-account-hidden',pair())
 first=theme();point(20,220);assert theme()!=first;record('background-click-theme',theme());away()
 # Exact ordering and cadence, using real browser timers and no source instrumentation.
 changes=c.js('new Promise((resolve,reject)=>{const rows=[{lang:document.documentElement.lang,t:performance.now()}];const start=performance.now();const timer=setInterval(()=>{const lang=document.documentElement.lang;if(lang!==rows.at(-1).lang)rows.push({lang,t:performance.now()});if(rows.length===4){clearInterval(timer);resolve(rows)}else if(performance.now()-start>14500){clearInterval(timer);reject(Error("Language cycle stalled"))}},50)})')
 order=['fr','en','ar'];assert all(order[(order.index(a['lang'])+1)%3]==b['lang'] for a,b in zip(changes,changes[1:])),changes
 assert all(3800<=changes[i]['t']-changes[i-1]['t']<=4300 for i in [2,3]),changes
 record('automatic-language-cycle',changes)
 # Hover holds both labels stable; native tab focus does too.
 rect=c.js('(()=>{const r=document.querySelector("#entry-login").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved',**rect});before=locale();hold(4.3);assert locale()==before;record('hover-pauses-language',before)
 away();c.js('document.querySelector("#entry-theme-toggle").focus()');key('Tab');assert c.js('document.activeElement.id')=='entry-login';before=locale();hold(4.3);assert locale()==before;record('keyboard-focus-pauses-language',before)
 click('#entry-login');wait('document.querySelector("#dialog").open');before=locale();oldTheme=theme();hold(4.3);assert locale()==before and theme()==oldTheme;record('dialog-pauses-language',before);click('#dialog-content button:last-child')
 # The gap between the two actions is also outside the buttons.
 gap=c.js('(()=>{const a=document.querySelector("#entry-login").getBoundingClientRect(),b=document.querySelector("#entry-guest").getBoundingClientRect();return{x:(a.right+b.left)/2,y:a.y+a.height/2}})()');oldTheme=theme();point(**gap);assert theme()!=oldTheme;record('gap-changes-theme',theme())
 # Keyboard activation of the unobtrusive native background control.
 away();c.js('document.querySelector("#entry-theme-toggle").focus()');oldTheme=theme()
 for kind in ['keyDown','keyUp']:c.call('Input.dispatchKeyEvent',{'type':kind,'key':' ','code':'Space','windowsVirtualKeyCode':32,'text':' ' if kind=='keyDown' else ''})
 time.sleep(.15);assert theme()!=oldTheme;record('keyboard-background-theme',{'theme':theme(),'focusVisible':c.js('document.activeElement.matches(":focus-visible")')})
 chroma('#entry-login',theme());healthy();shot('arrival-desktop')
 # Release keyboard focus, then let the cycle reach Arabic for narrow/landscape checks.
 point(20,220);away();wait('document.documentElement.lang==="ar"',10)
 rect=c.js('(()=>{const r=document.querySelector("#entry-login").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved',**rect})
 c.width(320,640);time.sleep(.25);c.js('document.querySelector("#entry-login").focus()');healthy();record('mobile-arabic-equal-pair',pair());shot('arrival-ar-320')
 c.width(667,375);time.sleep(.25);healthy();record('landscape-equal-pair',pair());shot('arrival-landscape')
 c.width(390,844);time.sleep(.25);oldTheme=theme();c.call('Emulation.setTouchEmulationEnabled',{'enabled':True})
 c.call('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':20,'y':180,'radiusX':4,'radiusY':4,'force':1}]});c.call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});time.sleep(.3);assert theme()!=oldTheme;record('touch-background-theme',theme())
 c.call('Emulation.setTouchEmulationEnabled',{'enabled':False});c.js('document.querySelector("#entry-guest").focus()');selected=locale();click('#entry-guest');wait('document.body.dataset.entry==="error"');click('#entrance-access button:last-child');wait('document.body.dataset.entry==="welcome"');hold(4.3)
 assert locale()==selected and c.js('getComputedStyle(document.querySelector(".account-switcher")).display')!='none';assert not c.js('Boolean(document.querySelector("#profile img"))');record('visit-freezes-language-and-restores-account',selected)
 # Current World control: restore its transparent background; colour only the icon.
 c.call('Network.setBlockedURLs',{'urls':[]});c.width(1280,900);c.call('Page.navigate',{'url':base+'content-preview.html?qa=world-icon-143#explore'});wait('Boolean(document.querySelector("#loading")?.hidden)',45);time.sleep(.4)
 for value in ['light','dark']:
  settings('fr',value);key('Escape');away();s=style('#reset');expected='rgb(0, 186, 188)' if value=='light' else 'rgb(237, 52, 145)'
  assert s['backgroundColor']=='rgba(0, 0, 0, 0)' and s['color']==expected and s['width']==44 and s['height']==44,s
  healthy();shot('world-icon-'+value);record('world-icon-'+value,{'background':s['backgroundColor'],'icon':s['color'],'target':44})
 assert initial==hashes();passed=True
finally:
 if not passed:
  try:shot('failure');record('failure',c.js('({errors:qaErrors,text:document.body.innerText.slice(-1800)})'))
  except:pass
 (out/'browser-results.json').write_text(json.dumps({'passed':passed,'cases':results,'sourcesBefore':initial,'sourcesAfter':hashes(),'limits':'Isolated Chrome, real 4-second timers, keyboard/mouse/touch events, reduced motion. Mobile and landscape emulated. No physical phone or real screen reader. Globe positioning verified independently.'},ensure_ascii=False,indent=2)+'\n');c.close()
