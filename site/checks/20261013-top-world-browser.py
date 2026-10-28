from pathlib import Path
import json,time,base64,hashlib
root=Path(__file__).resolve().parent.parent
exec((root/'checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=root/'checks/20261013-top-world';out.mkdir(exist_ok=True)
c=Chrome();results=[];passed=False;base='http://127.0.0.1:8765/site/'
def wait(expression,seconds=55):
 end=time.time()+seconds
 while time.time()<end:
  r=c.js(expression)
  if r:return r
  time.sleep(.12)
 raise AssertionError(expression+' '+str(c.js('({errors:qaErrors,body:document.body.innerText.slice(-500)})')))
def record(name,value=True):results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def shot(name):(out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def click(selector):
 pos=c.js('(()=>{const r=document.querySelector('+json.dumps(selector)+').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()')
 for typ in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':typ,**pos,'button':'left','clickCount':1})
 time.sleep(.25)
def key(name):
 for typ in ['keyDown','keyUp']:c.call('Input.dispatchKeyEvent',{'type':typ,'key':name,'code':name,'windowsVirtualKeyCode':{'Enter':13,'Escape':27,'Tab':9}[name],**({'text':'\r','unmodifiedText':'\r'} if name=='Enter' and typ=='keyDown' else {})})
 time.sleep(.25)
def route(value):c.js('location.hash='+json.dumps(value));time.sleep(.4)
def geometry():return c.js('(()=>{const rect=id=>{const r=document.getElementById(id).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom,cx:r.x+r.width/2,cy:r.y+r.height/2}};return {reset:rect("reset"),anchor:rect("scope-medallion"),filter:rect("scope-bar"),hint:rect("globe-hint"),picker:rect("scope-picker"),hidden:document.querySelector("#reset").hidden,statusHidden:document.querySelector("#globe-status").hidden,canvas:document.querySelectorAll("canvas.maplibregl-canvas").length,overflow:document.documentElement.scrollWidth>innerWidth}})()')
def check_explore(name):
 r=geometry();assert not r['hidden'] and not r['statusHidden'];assert r['reset']['w']==44 and r['reset']['h']==44;assert r['anchor']['w']==32
 assert abs(r['reset']['cx']-r['anchor']['cx'])<1 and abs(r['reset']['cy']-r['anchor']['cy'])<1;assert r['hint']['y']>=r['filter']['bottom']+9;assert not r['overflow'];record(name,r)
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)))'})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.width(1280,900);c.call('Page.navigate',{'url':base+'content-preview.html#explore'});wait('document.querySelector("#loading")?.hidden&&!document.querySelector("#reset").disabled');check_explore('desktop-world');shot('desktop-world')
 before=c.js('document.querySelector(".globe-controls").getBoundingClientRect().x');c.js('var qaHint=document.querySelector("#globe-hint");var qaText=qaHint.textContent;qaHint.textContent="Un texte de situation nettement plus long pour vérifier le centrage des boutons de zoom"');after=c.js('document.querySelector(".globe-controls").getBoundingClientRect().x');assert abs(after-before)<.1;c.js('qaHint.textContent=qaText');record('zoom-position-independent-of-text')
 for section in ['projects','people','journal','awards']:
  click('[data-section='+section+']');assert c.js('document.querySelector("#reset").hidden&&document.querySelector("#globe-status").hidden');c.js('document.querySelector("#reset").focus()');assert c.js('document.activeElement.id!=="reset"');record('hidden-and-unfocusable-'+section)
  if section=='projects':
   time.sleep(.2);shot('projects-mini-globe');r=c.js('(()=>{const a=document.querySelector("#scope-medallion").getBoundingClientRect(),s=getComputedStyle(document.querySelector("#globe")),m=new DOMMatrix(s.transform);return {errorX:Math.abs(parseFloat(s.getPropertyValue("--dock-origin-x"))+m.e-(a.x+a.width/2)),errorY:Math.abs(parseFloat(s.getPropertyValue("--dock-origin-y"))+m.f-(a.y+a.height/2))}})()');assert r['errorX']<1 and r['errorY']<1;record('mini-globe-aligned',r)
 click('[data-section=explore]');check_explore('restored-explorer')
 route('explore?country=FRA');wait('document.querySelector("#scope-bar").dataset.level==="country"');click('#reset');wait('document.querySelector("#scope-bar").dataset.level==="world"');record('click-returns-world')
 route('explore?country=FRA');c.js('document.querySelector("#reset").focus()');key('Enter');wait('document.querySelector("#scope-bar").dataset.level==="world"');assert c.js('document.activeElement.id==="reset"');record('keyboard-world-and-focus')
 # Both entry paths load the same new controller.
 c.call('Page.navigate',{'url':base+'index.html#explore'});wait('Boolean(document.querySelector("#entry-guest"))');click('#entry-guest');wait('document.body.dataset.entry==="welcome"');check_explore('main-entrance-visitor')
 for w,h in [(390,844),(320,640),(667,390)]:
  c.width(w,h);time.sleep(.5);check_explore('responsive-'+str(w));shot('explore-'+str(w))
 c.width(320,640);time.sleep(.3);click('#profile');click('[data-account-action=language]');click('[data-account-locale=ar]');key('Escape');click('#profile');click('[data-account-action=theme]');click('[data-account-theme=dark]');key('Escape');check_explore('arabic-dark-320');shot('arabic-dark-320')
 route('explore?country=ARE&campus=abu-dhabi');wait('document.querySelector("#scope-bar").dataset.level==="campus"');check_explore('arabic-campus-320');shot('arabic-campus-320');click('#reset');wait('document.querySelector("#scope-bar").dataset.level==="world"');record('arabic-reset')
 # Ordinary (non-reduced) docking and return.
 c.width(1280,900);c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'no-preference'}]});click('[data-section=projects]');assert c.js('document.querySelector("#reset").hidden');time.sleep(.7);shot('animated-docked');click('[data-section=explore]');shot('animated-return');time.sleep(.8);check_explore('animated-return-complete')
 assert not c.js('qaErrors'),c.js('qaErrors');passed=True
finally:
 if not passed:
  try:shot('failure');record('failure',c.js('({errors:qaErrors,body:document.body.innerText.slice(-900)})'))
  except:pass
 (out/'results.json').write_text(json.dumps({'passed':passed,'cases':results,'sources':{name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in ['index.html','content-preview.html','content-preview.mjs','welcome.mjs','dock-navigation.css','globe-framing.css']}},ensure_ascii=False,indent=2)+'\n');c.close()
