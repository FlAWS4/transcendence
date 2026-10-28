"""Browser-only checks for the explicitly requested colours and Visit dimensions."""
from pathlib import Path
import json,time,base64,hashlib
root=Path(__file__).resolve().parent.parent
exec((root/'checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=root/'checks/20261013-targeted-button-colors';out.mkdir(exist_ok=True)
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
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)))'})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 old={}
 states=[('fr','light',1280,900),('fr','dark',1280,900),('en','light',390,844),('ar','dark',320,640),('fr','dark',667,375)]
 for kind,prefix in [('141','archive/pre-targeted-button-colors-20261013/baseline/'),('142','')]:
  for locale,theme,width,height in states:
   name=f'{locale}-{theme}-{width}'
   load(prefix,'index.html',locale,theme,width,height)
   snapshots={key:style(sel) for key,sel in [('login','#entry-login'),('visit','#entry-guest'),('account','[data-account-action=signin]'),('signup','[data-account-action=signup]')]}
   if kind=='141':old[name]=snapshots
   else:
    chroma('#entry-login',theme);chroma('[data-account-action=signin]',theme)
    assert snapshots['signup']==old[name]['signup'],name
    assert dimension(snapshots['account'])==dimension(old[name]['account']),name
    assert dimension(snapshots['login'])==dimension(old[name]['login']),(name,snapshots['login'],old[name]['login'])
    assert snapshots['visit']['width']==snapshots['login']['width'] and snapshots['visit']['height']==snapshots['login']['height'],snapshots
    for field in ['backgroundColor','color','borderColor','borderRadius','fontSize','padding','minHeight','textAlign']:
     assert snapshots['visit'][field]==old[name]['visit'][field],(name,field)
    assert c.js('document.querySelector("#entry-guest").textContent')=={'fr':'Visiter','en':'Visit','ar':'زيارة'}[locale]
    record('entrance-'+name,{'pair':dimension(snapshots['login']),'palette':theme,'otherActionsUnchanged':True})
   click('[data-account-action=signin]');wait('document.querySelector("#dialog").open')
   signin={'confirm':style('#dialog-content button:first-of-type'),'cancel':style('#dialog-content button:last-child'),'copy':c.js('document.querySelector("#dialog-content p").textContent')}
   if kind=='141':old[name]['signin']=signin
   else:
    chroma('#dialog-content button:first-of-type',theme)
    assert dimension(signin['confirm'])==dimension(old[name]['signin']['confirm'])
    assert signin['cancel']==old[name]['signin']['cancel'] and signin['copy']==old[name]['signin']['copy']
   click('#dialog-content button:last-child');click('#profile');click('[data-account-action=signup]');wait('document.querySelector("#dialog").open')
   signup={'confirm':style('#dialog-content button:first-of-type'),'cancel':style('#dialog-content button:last-child'),'text':c.js('document.querySelector("#dialog-content").textContent')}
   if kind=='141':old[name]['signupDialog']=signup
   else:assert signup==old[name]['signupDialog'];record('dialogs-'+name,{'signinColourOnly':True,'signupAndCancelUnchanged':True})
   click('#dialog-content button:last-child');healthy()
   if kind=='142':shot('entrance-'+name)
  # Preview confirms post-entry sign-in and top World colours with their old dimensions.
  for theme in ['light','dark']:
   name='preview-'+theme;load(prefix,'content-preview.html','fr',theme,1280,900)
   world=style('#reset');click('[data-account-action=signin]');wait('document.querySelector("#dialog").open')
   value={'world':world,'confirm':style('#dialog-content button:first-of-type'),'cancel':style('#dialog-content button:last-child'),'copy':c.js('document.querySelector("#dialog-content p").textContent')}
   if kind=='141':old[name]=value
   else:
    chroma('#reset',theme);chroma('#dialog-content button:first-of-type',theme)
    assert dimension(world)==dimension(old[name]['world']) and world['width']==44 and world['height']==44
    assert dimension(value['confirm'])==dimension(old[name]['confirm'])
    assert value['cancel']==old[name]['cancel'] and value['copy']==old[name]['copy']
    record(name,{'worldTarget':44,'signinDimensionsPreserved':True,'localNoticeAndCancelUnchanged':True})
   click('#dialog-content button:last-child');healthy()
 # Follow the renamed action, then verify real Explorer and keyboard focus.
 load('','index.html','fr','dark',390,844);key('Escape');click('#entry-guest');wait('document.body.dataset.entry==="error"');click('#entrance-access button:last-child');wait('document.body.dataset.entry==="welcome"');record('visit-still-enters-as-visitor',c.js('!document.querySelector("#profile img")'))
 c.call('Network.setBlockedURLs',{'urls':[]});c.width(1280,900);c.call('Page.navigate',{'url':base+'content-preview.html?qa=targeted-colors-ready#explore'});wait('Boolean(document.querySelector("#loading")?.hidden)',45);time.sleep(.5)
 for theme in ['light','dark']:
  settings('fr',theme);key('Escape');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':0,'y':0});chroma('#reset',theme)
  c.js('document.querySelector("#scope-picker").focus()');c.call('Input.dispatchKeyEvent',{'type':'keyDown','key':'Tab','code':'Tab','windowsVirtualKeyCode':9,'modifiers':8});c.call('Input.dispatchKeyEvent',{'type':'keyUp','key':'Tab','code':'Tab','windowsVirtualKeyCode':9,'modifiers':8})
  focus=c.js('(()=>{const e=document.activeElement,s=getComputedStyle(e);return{id:e.id,visible:e.matches(":focus-visible"),outline:s.outlineColor}})()')
  assert focus['id']=='reset' and focus['visible'] and focus['outline']=='rgb(27, 27, 27)',focus
  assert not c.js('document.querySelector("#zoom-in,#zoom-out")!==null');healthy();shot('world-'+theme);record('world-focus-'+theme,focus)
 assert initial==hashes();passed=True
finally:
 if not passed:
  try:shot('failure');record('failure',c.js('({errors:qaErrors,text:document.body.innerText.slice(-1400)})'))
  except:pass
 (out/'browser-results.json').write_text(json.dumps({'passed':passed,'cases':results,'sourcesBefore':initial,'sourcesAfter':hashes(),'limits':'Isolated Chrome, reduced motion, desktop/mobile/landscape viewports. Account checks block the map; final Explorer capture waits for the real map. Scanner and decryption checked separately with motion enabled.'},ensure_ascii=False,indent=2)+'\n');c.close()
