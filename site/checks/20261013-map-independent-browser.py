from pathlib import Path
import json,time,base64,hashlib
source=Path('site/checks/20261012-multi-campus-browser.py').read_text()
exec(source.split('from pathlib import Path')[0])
root=Path('site');out=root/'checks';results=[]
files=['welcome.mjs','entrance.mjs','index.html','content-preview.html','content-preview.mjs']
report={'date':'2026-10-13','scenario':'Globe module blocked; local campus catalogue available','initial_sha256':{f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in files},'results':results}
c=Chrome()
def record(name,value):
 results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def wait(expr,seconds=10):
 deadline=time.time()+seconds
 while time.time()<deadline:
  value=c.js(expr)
  if value:return value
  time.sleep(.1)
 raise AssertionError('Timeout: '+expr)
def click(sel):
 c.js('document.querySelector('+json.dumps(sel)+').click()');time.sleep(.2)
def choose(name,value):
 c.js('(()=>{const s=document.querySelector(".scope-selectors select[name='+name+']");s.value='+json.dumps(value)+';s.dispatchEvent(new Event("change",{bubbles:true}));})()');time.sleep(.4)
def state():
 return c.js('({hash:location.hash,entry:document.body.dataset.entry,section:document.querySelector("#app").dataset.section,scope:document.querySelector("#scope-name").innerText,count:document.querySelectorAll("#content-list .cp-card").length,summary:document.querySelector("#content-count").innerText,disabled:document.querySelector("#scope-picker").disabled,overflow:document.documentElement.scrollWidth>innerWidth,errors:window.qaErrors,loading:document.querySelector("#loading").innerText,globePhase:document.querySelector("#entrance").dataset.preload})')
def shot(name):
 data=c.call('Page.captureScreenshot',{'format':'png'})['data'];(out/(name+'.png')).write_bytes(base64.b64decode(data))
def picker():
 if c.js('document.querySelector("#scope-popover").hidden'):click('#scope-picker')
 wait('!document.querySelector("#scope-popover").hidden')
def close_picker():
 if not c.js('document.querySelector("#scope-popover").hidden'):click('#close-scope-popover')
def navigate(page,route):
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/'+page+'?qa=map-independent-127#'+route});wait('document.querySelector("#scope-picker")&&!document.querySelector("#scope-picker").disabled');time.sleep(.6)
def assert_count(name,count,substring=None):
 s=state();assert s['count']==count,(name,s);assert not s['disabled'];assert not s['errors'],s
 if substring:assert substring in s['hash'],s
 record(name,s)
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));'});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 navigate('content-preview.html','projects');assert_count('world-projects-module-blocked',5)
 picker();opts=c.js('Object.fromEntries([...document.querySelectorAll(".scope-selectors select")].map(s=>[s.name,{count:s.options.length-1,value:s.value}]))');assert opts['country']['count']==30 and opts['campus']['count']==58;record('all-options-available',opts)
 choose('country','FRA');assert_count('select-france',3,'country=FRA')
 campuses=c.js('[...document.querySelectorAll(".scope-selectors select[name=campus] option")].map(o=>({id:o.value,label:o.textContent}))');record('france-campus-options',campuses)
 choose('campus','lyon');assert_count('select-lyon-projects',2,'campus=lyon');close_picker();shot('20261013-map-independent-lyon-projects')
 for section,count in [('people',1),('journal',1),('projects',2)]:
  click('#main-nav button[data-section="'+section+'"]');assert_count('lyon-'+section,count,'campus=lyon')
 picker();choose('country','');assert_count('world-after-country-reset',5);assert 'country=' not in state()['hash'] and 'campus=' not in state()['hash'];choose('campus','tokyo');assert_count('tokyo-infers-japan',2,'country=JPN');close_picker()
 click('#scope-back');assert_count('back-to-japan',2,'country=JPN');assert 'campus=' not in state()['hash'];click('#scope-world');assert_count('breadcrumb-world',5);assert 'country=' not in state()['hash']
 navigate('content-preview.html','journal?country=JPN&campus=tokyo');assert_count('direct-route-tokyo-journal',1,'campus=tokyo')
 c.width(320,640);click('#language');click('[data-locale="ar"]');picker();s=c.js('(()=>{const p=document.querySelector("#scope-popover"),r=p.getBoundingClientRect();return {dir:document.documentElement.dir,selectorDir:document.querySelector(".scope-selectors").dir,x:r.x,right:r.right,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,labels:[...p.querySelectorAll("label")].map(x=>x.innerText)}})()');assert s['dir']=='rtl' and not s['overflow'] and s['x']>=0 and s['right']<=320;record('arabic-320-picker',s);shot('20261013-map-independent-arabic-320-picker');choose('country','FRA');choose('campus','lyon');close_picker();assert_count('arabic-320-lyon-journal',1,'campus=lyon');shot('20261013-map-independent-arabic-320-journal')
 click('#main-nav button[data-section="explore"]');s=state();assert s['section']=='explore' and not s['disabled'] and not s['errors'];record('explorer-failed-map-keeps-filter',s);picker();choose('country','BRA');choose('campus','rio');close_picker();click('#main-nav button[data-section="projects"]');assert_count('explorer-selection-applies-to-content',2,'campus=rio')
 c.width(1280,900);click('#language');click('[data-locale="fr"]');navigate('index.html','projects?country=FRA&campus=lyon');wait('!!document.querySelector("#entry-guest")');click('#entry-guest');wait('document.body.dataset.entry==="error"');buttons=c.js('[...document.querySelectorAll("#entrance-access button")].map(b=>b.textContent)');assert 'Continuer sans le globe' in buttons;record('entrance-error-actions',buttons);shot('20261013-map-independent-entry-error');c.js('[...document.querySelectorAll("#entrance-access button")].find(b=>b.textContent==="Continuer sans le globe").click()');wait('document.body.dataset.entry==="welcome"');assert_count('entrance-continue-direct-route',2,'campus=lyon');picker();choose('country','BRA');choose('campus','sao');close_picker();assert_count('entrance-filter-brazil-sao',1,'campus=sao');shot('20261013-map-independent-entry-continued')
 record('successful-cases',len(results));report['passed']=True
except Exception as e:
 report['passed']=False;report['error']=repr(e)
 try:record('failure-state',state());shot('20261013-map-independent-failure')
 except:pass
 raise
finally:
 report['final_sha256']={f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in files};(out/'20261013-map-independent-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');c.close()
