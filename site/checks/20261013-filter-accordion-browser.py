from pathlib import Path
import json,time,base64,hashlib
root=Path('/home/le-rif/Bureau/Transcendence');folder=root/'site';out=folder/'checks'
source=(out/'20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0]
source=source.replace("self.seq=0;self.buf=b''", "self.seq=0;self.events=[];self.buf=b''").replace("item=json.loads(msg)","item=json.loads(msg)\n    if 'method' in item:self.events.append(item)")
exec(source)
files=['welcome.mjs','project-filter-dialog.mjs','project-filter-dialog.css','content-controls.mjs','content-filters.mjs','content-preview-data.mjs','profile-data.mjs','demo-content-seed.mjs']
def hashes():return {name:hashlib.sha256((folder/name).read_bytes()).hexdigest() for name in files}
report={'date':'2026-10-13','scenario':'Final accordion filters in Chrome, including deferred globe readiness','initial_sha256':hashes(),'results':[]};c=Chrome()
def wait(expr,seconds=15):
 deadline=time.time()+seconds
 while time.time()<deadline:
  value=c.js(expr)
  if value:return value
  time.sleep(.12)
 return False
def click(selector):
 assert c.js('!!document.querySelector('+json.dumps(selector)+')'),selector
 c.js('document.querySelector('+json.dumps(selector)+').click()');time.sleep(.12)
def key(name,code):
 params={'type':'keyDown','key':name,'code':'Space' if code==32 else name,'windowsVirtualKeyCode':code,'nativeVirtualKeyCode':code}
 if code in [13,32]:params.update(text='\r' if code==13 else ' ',unmodifiedText='\r' if code==13 else ' ')
 c.call('Input.dispatchKeyEvent',params);c.call('Input.dispatchKeyEvent',{k:v for k,v in {**params,'type':'keyUp'}.items() if k not in ['text','unmodifiedText']});time.sleep(.12)
def shot(name):(out/('20261013-filter-accordion-'+name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def selector(facet,part='toggle',nested=False):return '[data-'+('group' if nested else 'facet')+'="'+facet+'"] > .cp-project-filter-category .cp-project-filter-'+part
def state():return c.js("""(()=>{const d=document.querySelector('#content-category-dialog'),r=d?.getBoundingClientRect(),f=d?.querySelector('.cp-project-filter-footer').getBoundingClientRect(),body=d?.querySelector('.cp-project-filter-body');return {hash:location.hash,kind:d?.dataset.kind,open:!!d?.open,count:document.querySelector('#content-count').textContent,filtered:document.querySelector('#content-category-button').dataset.filtered,criteria:d?.querySelector('.cp-project-filter-count').textContent,checked:[...document.querySelectorAll('#content-category-dialog input:checked')].map(e=>e.value),groups:d?[...d.querySelectorAll('.cp-project-filter-section,.cp-project-filter-group')].map(g=>({key:g.dataset.facet||g.dataset.group,expanded:g.querySelector('.cp-project-filter-toggle').getAttribute('aria-expanded'),pressed:g.querySelector('.cp-project-filter-all').getAttribute('aria-pressed')})):[],bounds:r&&[r.left,r.top,r.right,r.bottom],footerBottom:f?.bottom,bodyScrollable:body?.scrollHeight>body?.clientHeight,overflow:document.documentElement.scrollWidth>innerWidth||!!d&&d.scrollWidth>d.clientWidth,active:document.activeElement.id,errors:window.qaErrors||[]}})()""")
def record(name,value=None):
 value=state() if value is None else value;report['results'].append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True);return value
def reset():
 click('#content-category-button');click('.cp-project-filter-reset');click('.cp-project-filter-apply')
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));'});
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=filter-accordion-3#projects'});assert wait('!!document.querySelector("#content-category-button")&&!document.querySelector("#scope-picker").disabled');time.sleep(.3)
 click('#content-category-button');initial=record('projects-initially-folded');assert initial['kind']=='projects' and all(g['expanded']=='false' for g in initial['groups']) and not initial['overflow'];shot('projects-folded-fr')
 click(selector('technologies','all'));draft=record('select-all-technologies-without-expanding');assert len(draft['checked'])==6 and draft['count']==initial['count'] and next(g for g in draft['groups'] if g['key']=='technologies')['expanded']=='false'
 click(selector('technologies'));click('input[value="tech:c"]');mixed=record('individual-technology-makes-category-mixed');assert len(mixed['checked'])==5 and next(g for g in mixed['groups'] if g['key']=='technologies')['pressed']=='mixed'
 c.js('document.querySelector('+json.dumps(selector('technologies'))+').focus()');key('Enter',13);assert c.js('document.querySelector('+json.dumps(selector('technologies'))+').getAttribute("aria-expanded")==="false"');record('keyboard-enter-fold-preserves-five-choices')
 click(selector('projects','all'));click(selector('projects'));click(selector('common-core',nested=True));click('input[value="minishell"]');nested=record('nested-individual-propagates-mixed-to-project-and-common-core');assert all(next(g for g in nested['groups'] if g['key']==name)['pressed']=='mixed' for name in ['projects','common-core']);shot('projects-expanded-fr')
 click('.cp-project-filter-cancel');assert record('cancel-discards-all-drafts')['filtered']=='false'
 click('#content-category-button');click(selector('technologies'));click('input[value="tech:c"]');assert record('single-criterion-singular-fr')['criteria']=='1 critère sélectionné';click('.cp-project-filter-apply');applied=record('apply-technology-filter');assert applied['filtered']=='true' and applied['active']=='content-category-button'
 click('#content-category-button');click('.cp-project-filter-reset');click('.cp-project-filter-cancel');assert record('reset-cancel-keeps-applied-filter')['count']==applied['count'];reset();assert record('reset-apply-restores-list')['filtered']=='false'
 click('#main-nav [data-section="people"]');click('#content-category-button');profile=record('profiles-initially-folded');assert profile['kind']=='people' and all(g['expanded']=='false' for g in profile['groups']);shot('profiles-folded-fr')
 click(selector('status','all'));click(selector('status'));click('input[value="alumni"]');assert next(g for g in record('profiles-bulk-then-individual-mixed')['groups'] if g['key']=='status')['pressed']=='mixed';click(selector('status'));click('.cp-project-filter-apply');assert record('profiles-apply-two-statuses')['filtered']=='true';reset()
 click('#content-category-button');click(selector('status'));click('input[value="student"]');click(selector('arrival'));year=c.js('[...document.querySelectorAll("input[name=criteria]")].find(e=>e.value.startsWith("arrival:")).value');click('input[value="'+year+'"]');assert record('profile-status-and-arrival-draft')['filtered']=='false';shot('profiles-expanded-fr');click('.cp-project-filter-apply');assert record('profile-status-and-arrival-applied')['filtered']=='true';reset()
 c.width(320,640);click('#language');click('[data-locale="ar"]');click('#theme');click('[data-theme-choice="dark"]')
 for section,facets in [('projects',['projects','technologies','skills']),('people',['status','arrival'])]:
  click('#main-nav [data-section="'+section+'"]');click('#content-category-button');folded=record(section+'-ar320-folded');assert not folded['overflow'] and folded['bounds'][0]>=0 and folded['bounds'][2]<=320 and folded['footerBottom']<=640;shot(section+'-ar320-folded')
  for facet in facets:click(selector(facet))
  if section=='projects':click(selector('common-core',nested=True));click(selector('specialization',nested=True))
  expanded=record(section+'-ar320-expanded');assert not expanded['overflow'] and expanded['footerBottom']<=640;shot(section+'-ar320-expanded')
  # Native keyboard Space operates the collective button without submitting.
  bulk=selector(facets[0],'all');c.js('document.querySelector('+json.dumps(bulk)+').focus()');key(' ',32);assert c.js('document.querySelector('+json.dumps(bulk)+').getAttribute("aria-pressed")==="true"');assert c.js('document.querySelector("#content-category-dialog").open');record(section+'-space-selects-all')
  key('Escape',27);assert c.js('!document.querySelector("#content-category-dialog")&&document.activeElement.id==="content-category-button"')
 c.width(640,360);click('#main-nav [data-section="projects"]');click('#content-category-button');click(selector('projects'));click(selector('common-core',nested=True));small=record('short-landscape-footer-reachable');assert not small['overflow'] and small['footerBottom']<=360 and small['bodyScrollable'];shot('landscape-ar');key('Escape',27)
 # New document: hold the map module, edit a profile filter, then finish WebGL.
 c.width(1280,900);c.call('Network.setBlockedURLs',{'urls':[]});c.call('Fetch.enable',{'patterns':[{'urlPattern':'*integrated-globe.mjs*','requestStage':'Request'}]});c.events=[]
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=filter-accordion-pending#people'});assert wait('!!document.querySelector("#content-category-button")&&!document.querySelector("#scope-picker").disabled')
 paused=[e for e in c.events if e['method']=='Fetch.requestPaused'];assert len(paused)==1,paused
 click('#content-category-button');click(selector('status'));click('input[value="student"]');c.js('window.qaHeldDialog=document.querySelector("#content-category-dialog")');record('draft-open-while-map-pending')
 c.call('Fetch.continueRequest',{'requestId':paused[0]['params']['requestId']});c.call('Fetch.disable');ready=wait('document.querySelector("#entrance").dataset.preload==="ready"',40)
 after=record('draft-after-map-completion');assert after['open'] and 'student' in after['checked'];assert c.js('window.qaHeldDialog===document.querySelector("#content-category-dialog")');assert not after['errors'];report['real_globe_ready']=bool(ready);shot('draft-after-map-ready')
 if not ready:report['limitation']='Map did not report ready within40s; draft remained open during the pending or failed render.'
 report['passed']=True
except Exception as error:
 report['passed']=False;report['error']=repr(error)
 try:record('failure');shot('failure')
 except Exception:pass
 raise
finally:
 report['final_sha256']=hashes();report['source_unchanged']=report['initial_sha256']==report['final_sha256'];(out/'20261013-filter-accordion-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');c.close()
