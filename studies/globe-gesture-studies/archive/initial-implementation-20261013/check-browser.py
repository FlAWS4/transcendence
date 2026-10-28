from pathlib import Path
import json,time,base64,hashlib
folder=Path(__file__).resolve().parent
repo=folder.parents[2]
exec((repo/'site/checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=folder/'checks';out.mkdir(exist_ok=True)
c=Chrome();results=[];passed=False
base='http://127.0.0.1:8765/studies/globe-gesture-studies/'
def wait(expression,seconds=35):
 end=time.time()+seconds
 while time.time()<end:
  result=c.js(expression)
  if result:return result
  time.sleep(.15)
 raise AssertionError('Timed out: '+expression+' '+str(c.js('({errors:window.qaErrors,body:document.body.innerText.slice(-800)})')))
def record(name,value=True):
 results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def shot(name):(out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def click(selector):
 pos=c.js('(()=>{const el=document.querySelector('+json.dumps(selector)+');const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
 for kind in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':kind,**pos,'button':'left','clickCount':1})
 time.sleep(.25)
def key(name):
 for kind in ['keyDown','keyUp']:c.call('Input.dispatchKeyEvent',{'type':kind,'key':name,'code':name,'windowsVirtualKeyCode':{'Escape':27,'Enter':13,'Tab':9}.get(name,0)})
 time.sleep(.15)
def state():return c.js('window.horizonStudy.globe.getNavigationState()')
def page(variant,w=1280,h=900):
 c.width(w,h);c.call('Page.navigate',{'url':base+'baseline/content-preview.html?variant='+str(variant)+'#explore'})
 wait('window.horizonControlsStudy');wait('window.horizonStudy.globe?.getNavigationState().worldRender.phase==="ready"',55)
 time.sleep(.4);assert not c.js('qaErrors'),c.js('qaErrors');record('ready-'+str(variant),c.js('({study:horizonControlsStudy.state,canvas:document.querySelectorAll("canvas.maplibregl-canvas").length,overflow:document.documentElement.scrollWidth>innerWidth})'))
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));'})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.width(1280,900);c.call('Page.navigate',{'url':base});time.sleep(.6);shot('gallery-desktop')
 assert c.js('document.querySelectorAll("a.try").length===3');c.width(320,780);time.sleep(.2);assert c.js('document.documentElement.scrollWidth<=innerWidth');shot('gallery-mobile');record('gallery-responsive')
 page(1);shot('gestures-rest-desktop')
 click('#study-trigger');assert c.js('horizonControlsStudy.state.open');shot('gestures-controls-desktop')
 before=state();click('#zoom-in');wait('!horizonStudy.globe.getNavigationState().inFlight');after=state();assert after['zoom']>before['zoom'];record('single-click-zoom',{'before':before['zoom'],'after':after['zoom']})
 before=state()['center'];click('[data-direction=east]');time.sleep(.2);after=state()['center'];assert before!=after;record('single-click-pan',{'before':before,'after':after})
 key('Escape');assert c.js('!horizonControlsStudy.state.open&&document.activeElement.id==="study-trigger"');record('escape-focus')
 c.js('document.querySelector("#globe").focus()');key('Enter');assert c.js('horizonControlsStudy.state.open&&document.querySelector("#study-palette").contains(document.activeElement)');record('keyboard-open-focus')
 click('.study-pin input');assert c.js('horizonControlsStudy.state.pinned');key('Tab');time.sleep(.7);assert c.js('horizonControlsStudy.state.open');record('pinned-stays-open')
 click('.study-close');assert c.js('!horizonControlsStudy.state.pinned');click('#study-world-return');wait('!horizonStudy.globe.getNavigationState().inFlight');record('medallion-world',state()['level'])
 click('#study-guide-button');assert c.js('document.querySelector("#study-guide").open');key('Escape');assert c.js('!document.querySelector("#study-guide").open&&document.activeElement.id==="study-guide-button"');record('guide-escape-focus')
 click('[data-section=projects]');time.sleep(.3);assert c.js('document.querySelector("#study-layer").hidden');click('[data-section=explore]');wait('!document.querySelector("#study-layer").hidden');record('section-isolation')
 page(2,390,844);shot('halo-rest-mobile');click('#study-trigger');shot('halo-open-mobile');assert c.js('horizonControlsStudy.state.open');time.sleep(.8);assert c.js('horizonControlsStudy.state.open');record('halo-tap-persists')
 bounds=c.js('(()=>{const r=document.querySelector("#study-palette").getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:innerWidth,height:innerHeight}})()');assert bounds['left']>=0 and bounds['right']<=bounds['width'];record('halo-bounds',bounds)
 key('Escape');assert c.js('!horizonControlsStudy.state.open');c.width(1280,900);time.sleep(.3)
 pos=c.js('(()=>{const r=document.querySelector("#study-trigger").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':0,'y':0});c.call('Input.dispatchMouseEvent',{'type':'mouseMoved',**pos});time.sleep(.25);assert c.js('horizonControlsStudy.state.open');shot('halo-open-desktop');record('halo-hover')
 page(3,390,844);shot('press-rest-mobile')
 # Press on open ocean in the real canvas; keep the pointer still.
 c.call('Input.dispatchMouseEvent',{'type':'mousePressed','x':100,'y':410,'button':'left','clickCount':1});time.sleep(.75);assert c.js('horizonControlsStudy.state.open&&horizonControlsStudy.state.hold');shot('press-open-mobile')
 c.call('Input.dispatchMouseEvent',{'type':'mouseReleased','x':100,'y':410,'button':'left','clickCount':1});time.sleep(.2);assert c.js('horizonControlsStudy.state.open&&!horizonControlsStudy.state.hold');record('longpress-opens-without-action')
 key('Escape');assert c.js('!horizonControlsStudy.state.open');
 # Real mouse drag must remain a rotation and must never open the menu.
 before=state()['center'];c.call('Input.dispatchMouseEvent',{'type':'mousePressed','x':100,'y':410,'button':'left','clickCount':1});
 for x in [112,128,150,180]:c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':x,'y':410,'button':'left','buttons':1});time.sleep(.04)
 time.sleep(.6);c.call('Input.dispatchMouseEvent',{'type':'mouseReleased','x':180,'y':410,'button':'left','clickCount':1});time.sleep(.25);assert not c.js('horizonControlsStudy.state.open');assert state()['center']!=before;record('ordinary-drag-not-intercepted')
 # Long press then slide onto a zoom control and release selects that action.
 c.call('Input.dispatchMouseEvent',{'type':'mousePressed','x':100,'y':410,'button':'left','clickCount':1});time.sleep(.7);assert c.js('horizonControlsStudy.state.hold');before=state()['zoom']
 pos=c.js('(()=>{const r=document.querySelector("#zoom-in").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved',**pos,'button':'left','buttons':1});c.call('Input.dispatchMouseEvent',{'type':'mouseReleased',**pos,'button':'left','clickCount':1});time.sleep(.4);assert state()['zoom']>before;assert not c.js('horizonControlsStudy.state.open');record('press-slide-select')
 # Test mobile RTL and low landscape, preserving accessible controls.
 click('#profile');click('[data-account-action=language]');click('[data-account-locale=ar]');key('Escape');c.width(320,640);time.sleep(.5);click('#study-trigger');shot('press-arabic-320');assert c.js('document.documentElement.scrollWidth<=innerWidth');record('arabic-mobile')
 c.width(667,390);time.sleep(.3);shot('press-landscape');assert c.js('getComputedStyle(document.querySelector("#reset")).display!=="none"');record('landscape-world-control')
 assert not c.js('qaErrors'),c.js('qaErrors');passed=True
finally:
 if not passed:
  try:shot('failure');record('failure-dom',c.js('({errors:qaErrors,state:window.horizonControlsStudy?.state,body:document.body.innerText.slice(-1600)})'))
  except:pass
 (out/'browser-results.json').write_text(json.dumps({'passed':passed,'cases':results,'sources':{name:hashlib.sha256((folder/name).read_bytes()).hexdigest() for name in ['study.mjs','study.css','press-gesture.mjs']}},ensure_ascii=False,indent=2)+'\n');c.close()
