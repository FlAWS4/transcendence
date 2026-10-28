"""Compare the visible globe centre before/after the narrow CSS framing change."""
from pathlib import Path
import json,time,base64,hashlib,sys
root=Path(__file__).resolve().parents[2]
exec((root/'checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=Path(__file__).resolve().parent
mode=sys.argv[1] if len(sys.argv)>1 else 'before'
assert mode in ['before','after']
c=Chrome();cases=[];passed=False;base='http://127.0.0.1:8765/site/'
source=root/'globe-framing.css';initial=hashlib.sha256(source.read_bytes()).hexdigest()
def wait(expression,seconds=50):
 end=time.time()+seconds
 while time.time()<end:
  value=c.js(expression)
  if value:return value
  time.sleep(.1)
 raise AssertionError(expression+' '+str(c.js('({errors:qaErrors,loading:document.querySelector("#loading")?.textContent})')))
def click(selector):
 c.js('document.querySelector('+json.dumps(selector)+').click()');time.sleep(.15)
def shot(name):
 (out/(mode+'-'+name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def state():
 return c.js('''(()=>{
 const e=document.querySelector('#globe'),s=getComputedStyle(e),r=e.getBoundingClientRect();
 const rect=q=>{const a=document.querySelector(q).getBoundingClientRect();return{x:a.x,y:a.y,width:a.width,height:a.height,bottom:a.bottom,cx:a.x+a.width/2,cy:a.y+a.height/2}};
 return {width:innerWidth,height:innerHeight,lang:document.documentElement.lang,dir:document.documentElement.dir,stage:rect('#globe'),
 center:{x:parseFloat(s.getPropertyValue('--dock-origin-x')),y:parseFloat(s.getPropertyValue('--dock-origin-y'))},
 engineFocusY:s.getPropertyValue('--hg-focus-y'),responsive:s.getPropertyValue('--horizon-responsive-globe'),radiusToken:s.getPropertyValue('--hg-radius'),
 filter:rect('#scope-bar'),status:rect('#globe-status'),dock:rect('.dock-shell'),canvasCount:document.querySelectorAll('#globe canvas').length,
 ready:document.querySelector('#loading').hidden,overflow:document.documentElement.scrollWidth>innerWidth};})()''')
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)))'})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.width(1280,900);c.call('Page.navigate',{'url':base+'content-preview.html?qa=globe-recenter-'+mode+'#explore'})
 wait('document.querySelector("#loading")?.hidden&&document.querySelector("#globe canvas")');c.js('document.fonts.ready');time.sleep(.3)
 for lang in ['fr','ar']:
  if lang=='ar':
   click('#profile');click('[data-account-action=language]');click('[data-account-locale=ar]');c.js('document.querySelector("#profile").click()')
  for width,height in [(1280,900),(390,844),(320,640),(667,375)]:
   c.width(width,height);time.sleep(.55)
   c.js('location.hash="explore"');wait('document.querySelector("#app").dataset.section==="explore"');time.sleep(.3)
   r=state();assert r['ready'] and r['canvasCount']==1 and not r['overflow'],r
   r['case']=f'{lang}-{width}x{height}';r['viewportCentreOffset']={'x':r['center']['x']-width/2,'y':r['center']['y']-height/2}
   r['spaceBetweenStatusAndDockCentre']=(r['status']['bottom']+r['dock']['y'])/2
   shot(r['case'])
   c.js('location.hash="projects"');wait('document.querySelector("#app").dataset.globeDocked==="true"');time.sleep(.25)
   r['docked']=c.js('''(()=>{const a=document.querySelector('#scope-medallion').getBoundingClientRect(),e=document.querySelector('#globe'),s=getComputedStyle(e),m=new DOMMatrix(s.transform),x=parseFloat(s.getPropertyValue('--dock-origin-x')),y=parseFloat(s.getPropertyValue('--dock-origin-y'));return{radius:parseFloat(s.getPropertyValue('--dock-clip-radius')),errorX:Math.abs(x+m.e-(a.x+a.width/2)),errorY:Math.abs(y+m.f-(a.y+a.height/2)),anchorWidth:a.width,canvasCount:document.querySelectorAll('#globe canvas').length}})()''')
   assert r['docked']['errorX']<1 and r['docked']['errorY']<1 and r['docked']['canvasCount']==1,r
   c.js('location.hash="explore"');wait('document.querySelector("#app").dataset.globeDocked==="false"');time.sleep(.2)
   returned=state();assert abs(returned['center']['x']-r['center']['x'])<.1 and abs(returned['center']['y']-r['center']['y'])<.1
   if mode=='after':
    before=json.loads((out/'before.json').read_text())
    old=next(x for x in before['cases'] if x['case']==r['case'])
    assert abs(r['center']['x']-width/2)<.1 and abs(r['center']['y']-height/2)<.1,r
    assert r['radiusToken']==old['radiusToken'] and abs(r['docked']['radius']-old['docked']['radius'])<.1,(r,old)
    r['deltaFromBefore']={'x':r['center']['x']-old['center']['x'],'y':r['center']['y']-old['center']['y']}
   cases.append(r);print(r['case'],r['center'],'radius',r['docked']['radius'],'dockErrors',r['docked']['errorX'],r['docked']['errorY'],flush=True)
 assert not c.js('qaErrors'),c.js('qaErrors')
 assert initial==hashlib.sha256(source.read_bytes()).hexdigest(),'Framing CSS changed during run'
 passed=True
finally:
 if not passed:
  try:shot('failure')
  except:pass
 (out/(mode+'.json')).write_text(json.dumps({'passed':passed,'mode':mode,'cases':cases,'globeFramingSha256':initial,'limits':'Isolated headless Chrome, reduced motion, viewport emulation. Real ready map; no remote street or physical-phone verification. Coordinates use the shared CSS/dock centre consumed by the engine; sphere radius comes from its existing dock geometry measurement.'},ensure_ascii=False,indent=2)+'\n')
 c.close()
