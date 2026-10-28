from pathlib import Path
import json,time,base64,hashlib
folder=Path(__file__).resolve().parent.parent
repo=folder.parents[1]
exec((repo/'site/checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=folder/'checks/mouse-events';out.mkdir(exist_ok=True)
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
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':"window.qaErrors=[];window.qaInput=[];for(const type of ['pointerdown','pointermove','pointerup','pointercancel','gotpointercapture','lostpointercapture','mousedown','mouseup','click','contextmenu','keydown','keyup','blur','focus'])addEventListener(type,e=>qaInput.push({type,id:e.pointerId,button:e.button,buttons:e.buttons,target:e.target.id||e.target.className?.baseVal||e.target.className,x:e.clientX,y:e.clientY,time:Math.round(performance.now())}),true);"})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 page(3,390,844);shot('press-rest-mobile')
 # Press on open ocean in the real canvas; keep the pointer still.
 c.call('Input.dispatchMouseEvent',{'type':'mousePressed','x':100,'y':410,'button':'left','clickCount':1});time.sleep(.75);assert c.js('horizonControlsStudy.state.open&&horizonControlsStudy.state.hold');shot('press-open-mobile')
 c.call('Input.dispatchMouseEvent',{'type':'mouseReleased','x':100,'y':410,'button':'left','clickCount':1});time.sleep(.2);assert c.js('horizonControlsStudy.state.open&&!horizonControlsStudy.state.hold');record('longpress-opens-without-action')
 key('Escape');assert c.js('!horizonControlsStudy.state.open');
 wait('!horizonStudy.globe.getNavigationState().inFlight');time.sleep(.5);record('before-second-hold',c.js('({state:horizonStudy.globe.getNavigationState(),target:document.elementFromPoint(100,410)?.outerHTML.slice(0,250)})'))
 # Escape during a recognized press must also cancel pointer capture.
 c.call('Input.dispatchMouseEvent',{'type':'mousePressed','x':100,'y':410,'button':'left','clickCount':1});time.sleep(.7);record('events-second-hold',c.js('({events:qaInput,study:horizonControlsStudy.state,map:horizonStudy.globe.getNavigationState()})'));assert c.js('horizonControlsStudy.state.hold');key('Escape');assert c.js('!horizonControlsStudy.state.hold&&!horizonControlsStudy.state.open');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':140,'y':420,'button':'left','buttons':1});c.call('Input.dispatchMouseEvent',{'type':'mouseReleased','x':140,'y':420,'button':'left','clickCount':1});record('hold-escape-cancels')
 # Real mouse drag must remain a rotation and must never open the menu.
 before=state()['center'];c.call('Input.dispatchMouseEvent',{'type':'mousePressed','x':100,'y':410,'button':'left','clickCount':1});
 for x in [112,128,150,180]:c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':x,'y':410,'button':'left','buttons':1});time.sleep(.04)
 time.sleep(.6);c.call('Input.dispatchMouseEvent',{'type':'mouseReleased','x':180,'y':410,'button':'left','clickCount':1});time.sleep(.25);assert not c.js('horizonControlsStudy.state.open');assert state()['center']!=before;record('ordinary-drag-not-intercepted')
 # Long press then slide onto a zoom control and release selects that action.
 c.call('Input.dispatchMouseEvent',{'type':'mousePressed','x':100,'y':410,'button':'left','clickCount':1});time.sleep(.7);assert c.js('horizonControlsStudy.state.hold');before=state()['zoom']
 pos=c.js('(()=>{const r=document.querySelector("#zoom-in").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved',**pos,'button':'left','buttons':1});c.call('Input.dispatchMouseEvent',{'type':'mouseReleased',**pos,'button':'left','clickCount':1});time.sleep(.4);assert state()['zoom']>before;assert not c.js('horizonControlsStudy.state.open');record('press-slide-select')
 passed=True
finally:
 if not passed:
  try:shot('failure');record('failure-dom',c.js('({errors:qaErrors,events:qaInput,state:window.horizonControlsStudy?.state,body:document.body.innerText.slice(-1600)})'))
  except:pass
 (out/'browser-results.json').write_text(json.dumps({'passed':passed,'cases':results,'sources':{name:hashlib.sha256((folder/name).read_bytes()).hexdigest() for name in ['study.mjs','study.css','press-gesture.mjs']}},ensure_ascii=False,indent=2)+'\n');c.close()
