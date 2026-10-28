"""Check the shared miniature and borrowed campus viewport after recentering."""
from pathlib import Path
exec(Path(__file__).with_name('browser.py').read_text().split('\ntry:\n')[0])
mode='after';cases=[];passed=False
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)))'})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.width(1280,900);c.call('Page.navigate',{'url':base+'content-preview.html?qa=globe-recenter-campus#explore'})
 wait('Boolean(document.querySelector("#loading")?.hidden&&document.querySelector("#globe canvas"))');time.sleep(.3)
 for lang,w,h in [('fr',1280,900),('ar',390,844)]:
  if lang=='ar':
   click('#profile');click('[data-account-action=language]');click('[data-account-locale=ar]');click('#profile')
  c.width(w,h);c.js('location.hash="projects"');wait('document.querySelector("#app").dataset.globeDocked==="true"');time.sleep(.4)
  shot('mini-'+lang+'-'+str(w))
  c.js('location.hash="projects/ft-transcendence-building-together"');wait('Boolean(document.querySelector(".cp-project-campus"))');time.sleep(.3)
  click('.cp-project-campus');wait('Boolean(document.querySelector("[data-campus-id=paris]"))');click('[data-campus-id=paris]')
  wait('Boolean(document.querySelector("#campus-map-dialog[open] #globe"))');time.sleep(.25)
  borrowed=c.js('''(()=>{const e=document.querySelector('#globe'),s=getComputedStyle(e),r=e.getBoundingClientRect(),v=e.parentElement.getBoundingClientRect();return{parent:e.parentElement.id,responsive:s.getPropertyValue('--horizon-responsive-globe'),x:s.getPropertyValue('--hg-center-x'),y:s.getPropertyValue('--hg-center-y'),radius:s.getPropertyValue('--hg-radius'),transform:s.transform,viewport:{x:v.x,y:v.y,width:v.width,height:v.height},stage:{x:r.x,y:r.y,width:r.width,height:r.height},canvasCount:document.querySelectorAll('#globe canvas').length}})()''')
  assert borrowed['parent']=='campus-map-viewport' and borrowed['responsive'].strip()=='' and float(borrowed['x'])==.5 and float(borrowed['y'])==.5 and float(borrowed['radius'])==.43 and borrowed['transform']=='none' and borrowed['canvasCount']==1,borrowed
  assert all(abs(borrowed['viewport'][x]-borrowed['stage'][x])<1 for x in ['x','y','width','height']),borrowed
  shot('campus-viewport-'+lang+'-'+str(w));click('#campus-map-close');wait('Boolean(document.querySelector("#main > #globe"))')
  c.js('location.hash="explore"');wait('document.querySelector("#app").dataset.globeDocked==="false"');time.sleep(.4)
  returned=state();assert returned['center']=={'x':w/2,'y':h/2} and returned['responsive'].strip()=='0',returned
  cases.append({'case':lang+'-'+str(w),'borrowed':borrowed,'restored':returned['center']});print(lang,'campus viewport unaffected and centre restored',returned['center'],flush=True)
 assert not c.js('qaErrors'),c.js('qaErrors')
 assert initial==hashlib.sha256(source.read_bytes()).hexdigest()
 passed=True
finally:
 if not passed:
  try:shot('campus-failure')
  except:pass
 (out/'campus-results.json').write_text(json.dumps({'passed':passed,'cases':cases,'globeFramingSha256':initial,'limits':'Real single canvas borrowed and restored in isolated Chrome, reduced motion, emulated mobile width. The check covers viewport geometry; detailed remote street readiness is not asserted.'},ensure_ascii=False,indent=2)+'\n')
 c.close()
