from pathlib import Path
import json,time,base64,hashlib
source=Path('site/checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0]
source=source.replace("self.seq=0;self.buf=b''", "self.seq=0;self.events=[];self.buf=b''").replace("item=json.loads(msg)","item=json.loads(msg)\n    if 'method' in item:self.events.append(item)")
exec(source)
root=Path('site');out=root/'checks';results=[]
report={'date':'2026-10-13','scenario':'Globe import blocked then unblocked before entrance Retry','initial_sha256':{f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in ['welcome.mjs','entrance.mjs','entrance.css']},'results':results}
c=Chrome()
def record(name,value):results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def wait(expr,seconds=15):
 deadline=time.time()+seconds
 while time.time()<deadline:
  v=c.js(expr)
  if v:return v
  time.sleep(.15)
 return False
def state():return c.js('({hash:location.hash,entry:document.body.dataset.entry,scope:document.querySelector("#scope-name").innerText,disabled:document.querySelector("#scope-picker").disabled,count:document.querySelectorAll("#content-list .cp-card").length,phase:document.querySelector("#entrance").dataset.preload,canvas:!!document.querySelector("#globe canvas"),errors:window.qaErrors,loading:document.querySelector("#loading").innerText})')
def shot(name):(out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));'});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/index.html?qa=map-independent-retry-127#projects?country=FRA&campus=lyon'})
 assert wait('!!document.querySelector("#entry-guest")');c.js('document.querySelector("#entry-guest").click()');assert wait('document.body.dataset.entry==="error"');record('first-error',state())
 c.call('Network.setBlockedURLs',{'urls':[]});c.js('[...document.querySelectorAll("#entrance-access button")].find(b=>b.textContent==="Réessayer").click()')
 ready=wait('document.body.dataset.entry==="welcome"',35);after=state();record('retry-result',{'ready':ready,'state':after});assert ready and after['phase']=='ready' and after['canvas'] and after['count']==2 and 'campus=lyon' in after['hash'];assert not after['errors'];shot('20261013-map-independent-retry-content')
 imports=[e['params']['request']['url'] for e in c.events if e['method']=='Network.requestWillBeSent' and 'integrated-globe.mjs' in e['params']['request']['url']];assert any('attempt=' in url for url in imports);record('retried-module-urls',imports)
 c.js('document.querySelector("#scope-world").click()');time.sleep(.5);after=state();assert after['count']==5 and 'campus=' not in after['hash'];record('reset-after-retry',after)
 c.js('document.querySelector("#main-nav button[data-section=explore]").click()');time.sleep(1);shot('20261013-map-independent-retry-world');record('world-after-retry',state());report['passed']=True
except Exception as e:
 report['passed']=False;report['error']=repr(e)
 try:record('failure-state',state());shot('20261013-map-independent-retry-failure')
 except:pass
 raise
finally:
 report['final_sha256']={f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in ['welcome.mjs','entrance.mjs','entrance.css']};(out/'20261013-map-independent-retry-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');c.close()
