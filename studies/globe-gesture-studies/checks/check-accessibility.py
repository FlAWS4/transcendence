from pathlib import Path
import json,time,base64,hashlib
folder=Path(__file__).resolve().parent.parent
repo=folder.parents[1]
exec((repo/'site/checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=folder/'checks/accessibility';out.mkdir(exist_ok=True)
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
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)})'})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 page(1,320,640);click('#study-trigger');shot('fr-320-controls')
 targets=c.js('Array.from(document.querySelectorAll("#study-palette button,#study-trigger,#study-world-return,.study-pin")).filter(e=>e.getClientRects().length).map(e=>({name:e.getAttribute("aria-label")||e.textContent.trim(),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))')
 assert all(x['w']>=44 and x['h']>=44 for x in targets);record('target-dimensions',targets)
 assert c.js('getComputedStyle(document.querySelector("#study-palette")).animationName==="none"');record('reduced-motion')
 assert c.js('document.documentElement.scrollWidth<=innerWidth');record('french-320')
 key('Escape');click('#profile');assert c.js('document.querySelector("#study-layer").hidden');record('account-isolation');click('[data-account-action=language]');click('[data-account-locale=ar]');key('Escape');time.sleep(.4);click('#study-trigger');shot('arabic-320-controls');assert c.js('document.documentElement.scrollWidth<=innerWidth&&document.documentElement.lang==="ar"');record('arabic-320')
 key('Escape');click('#profile');click('[data-account-action=theme]');click('[data-account-theme=dark]');key('Escape');time.sleep(.4);click('#study-trigger');shot('arabic-dark-320-controls');assert c.js('document.documentElement.dataset.theme==="dark"');record('dark-theme')
 c.width(667,390);time.sleep(.4);shot('arabic-dark-landscape');assert c.js('getComputedStyle(document.querySelector("#reset")).display!=="none"');record('landscape-world-visible')
 key('Escape');c.width(390,844);time.sleep(.6);click('#profile');click('[data-account-action=language]');click('[data-account-locale=en]');key('Escape');time.sleep(.3);click('#study-trigger');assert c.js('document.querySelector("#study-trigger").getAttribute("aria-label")==="Globe controls"');record('english-labels')
 tree=c.call('Accessibility.getFullAXTree',{})['nodes'];names=[n.get('name',{}).get('value') for n in tree if n.get('role',{}).get('value')=='button'];assert 'Globe controls' in names and 'Move the view left' in names and 'Back to World' in names;record('accessibility-tree-names',[n for n in names if n and ('view' in n or 'World' in n or 'controls' in n)])
 # Pinning is remembered across reload; keep the globe loaded before using controls.
 c.js('document.querySelector("#study-palette .study-pin input").click()');assert c.js('horizonControlsStudy.state.pinned');c.call('Page.reload',{});wait('window.horizonControlsStudy?.state.pinned&&window.horizonControlsStudy.state.open');record('pinned-after-reload')
 # New control names in Chrome's accessibility tree are exposed as buttons.
 assert not c.js('qaErrors');passed=True
finally:
 if not passed:
  try:shot('failure');record('failure-dom',c.js('({errors:qaErrors,state:window.horizonControlsStudy?.state,body:document.body.innerText.slice(-1600)})'))
  except:pass
 (out/'browser-results.json').write_text(json.dumps({'passed':passed,'cases':results,'sources':{name:hashlib.sha256((folder/name).read_bytes()).hexdigest() for name in ['study.mjs','study.css','press-gesture.mjs']}},ensure_ascii=False,indent=2)+'\n');c.close()
