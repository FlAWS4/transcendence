from pathlib import Path
import json,time,base64,hashlib
source=Path('site/checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0]
source=source.replace("self.seq=0;self.buf=b''", "self.seq=0;self.events=[];self.buf=b''").replace("item=json.loads(msg)","item=json.loads(msg)\n    if 'method' in item:self.events.append(item)")
exec(source)
root=Path('site');out=root/'checks';results=[]
report={'date':'2026-10-13','scenario':'Pause globe module request, use selectors before map ready, release request','initial_sha256':hashlib.sha256((root/'welcome.mjs').read_bytes()).hexdigest(),'results':results}
c=Chrome()
def record(name,value):results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def wait(expr,seconds=15):
 deadline=time.time()+seconds
 while time.time()<deadline:
  v=c.js(expr)
  if v:return v
  time.sleep(.15)
 return False
def state():return c.js('({hash:location.hash,scope:document.querySelector("#scope-name").innerText,disabled:document.querySelector("#scope-picker").disabled,count:document.querySelectorAll("#content-list .cp-card").length,phase:document.querySelector("#entrance").dataset.preload,canvas:!!document.querySelector("#globe canvas"),zoomDisabled:document.querySelector("#zoom-in").disabled,errors:window.qaErrors,loading:document.querySelector("#loading").innerText})')
def shot(name):(out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
try:
 c.width(1280,900);c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));'});c.call('Fetch.enable',{'patterns':[{'urlPattern':'*integrated-globe.mjs*','requestStage':'Request'}]})
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=map-independent-slow-127#projects'})
 assert wait('!!document.querySelector("#scope-picker")&&!document.querySelector("#scope-picker").disabled')
 paused=[e for e in c.events if e['method']=='Fetch.requestPaused'];assert len(paused)==1,paused
 record('module-held',{'url':paused[0]['params']['request']['url'],'state':state()})
 c.js('document.querySelector("#scope-picker").click()');time.sleep(.2)
 c.js('var field=document.querySelector(".scope-selectors select[name=campus]");field.value="tokyo";field.dispatchEvent(new Event("change",{bubbles:true}))');time.sleep(.4)
 before=state();assert before['count']==2 and 'campus=tokyo' in before['hash'] and not before['canvas'];assert not before['errors'];record('select-tokyo-before-globe-response',before);c.js('document.querySelector("#close-scope-popover").click()')
 c.call('Fetch.continueRequest',{'requestId':paused[0]['params']['requestId']});c.call('Fetch.disable')
 ready=wait('document.querySelector("#entrance").dataset.preload==="ready"',35)
 after=state();record('globe-released',{'ready':ready,'state':after})
 assert after['count']==2 and 'campus=tokyo' in after['hash'];assert not after['errors'];report['filter_preserved']=True;report['real_globe_ready']=bool(ready)
 if ready:
  c.js('document.querySelector("#main-nav button[data-section=explore]").click()');time.sleep(1);shot('20261013-map-independent-delayed-globe-explore');record('restored-map-explorer',state())
 else:
  report['limitation']='Actual map did not report ready within35s after release; independent filtering verified while pending.'
 report['passed']=True
except Exception as e:
 report['passed']=False;report['error']=repr(e)
 try:record('failure-state',state());shot('20261013-map-independent-slow-failure')
 except:pass
 raise
finally:
 report['final_sha256']=hashlib.sha256((root/'welcome.mjs').read_bytes()).hexdigest();(out/'20261013-map-independent-slow-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');c.close()
