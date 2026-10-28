from pathlib import Path
import json,time,base64
repo=Path(__file__).resolve().parents[3]
exec((repo/'site/checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=Path(__file__).resolve().parent
c=Chrome();results=[]
def record(name,value):
 results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def wait(expression,seconds=55):
 end=time.time()+seconds
 while time.time()<end:
  value=c.js(expression)
  if value:return value
  time.sleep(.2)
 raise AssertionError(expression)
def point():return c.js('(()=>{const r=document.querySelector("#study-trigger").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
def click():
 pos=point()
 for kind in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':kind,**pos,'button':'left','clickCount':1})
 time.sleep(.25)
try:
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.width(390,844);c.call('Page.navigate',{'url':'http://127.0.0.1:8765/studies/globe-gesture-studies/baseline/content-preview.html?variant=2&diagnose=hover#explore'})
 wait('window.horizonControlsStudy');wait('window.horizonStudy.globe?.getNavigationState().worldRender.phase==="ready"');time.sleep(.4)
 c.js('''window.trace=[];window.lastPointer={x:0,y:0};window.snap=()=>({t:performance.now(),state:horizonControlsStudy.state,active:document.activeElement.id,hit:document.elementFromPoint(lastPointer.x,lastPointer.y)?.outerHTML.slice(0,250),pointer:lastPointer,trigger:(()=>{const r=document.querySelector('#study-trigger').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,hover:document.querySelector('#study-trigger').matches(':hover')}})(),palette:(()=>{const p=document.querySelector('#study-palette'),r=p.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,hover:p.matches(':hover'),hidden:p.hidden}})()});document.addEventListener('pointermove',e=>lastPointer={x:e.clientX,y:e.clientY},true);for(const id of ['study-trigger','study-palette'])for(const event of ['pointerenter','pointerleave','focus','blur','focusout'])document.getElementById(id).addEventListener(event,e=>trace.push({event,id,related:e.relatedTarget?.id,...snap()}));new MutationObserver(()=>trace.push({event:'open-mutation',...snap()})).observe(document.getElementById('study-layer'),{attributes:true,attributeFilter:['data-open']});''')
 click();time.sleep(.8);record('mobile-open',c.js('snap()'))
 for kind in ['keyDown','keyUp']:c.call('Input.dispatchKeyEvent',{'type':kind,'key':'Escape','code':'Escape','windowsVirtualKeyCode':27})
 time.sleep(.15);record('mobile-escape',c.js('snap()'))
 c.width(1280,900);time.sleep(.3);record('resized',c.js('snap()'))
 pos=point();c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':0,'y':0});record('left',c.js('snap()'))
 c.call('Input.dispatchMouseEvent',{'type':'mouseMoved',**pos});time.sleep(.25);record('hover-250',c.js('snap()'));time.sleep(.8);record('hover-1050',c.js('snap()'))
 record('timeline',c.js('trace'))
 (out/'diagnose-halo-hover.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
 # Leave fully, then re-enter a second time to identify Escape-specific suppression.
 c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':0,'y':0});time.sleep(.2);pos=point();c.call('Input.dispatchMouseEvent',{'type':'mouseMoved',**pos});time.sleep(.3);record('second-entry',c.js('snap()'))
finally:
 (out/'diagnose-halo-hover.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');c.close()
