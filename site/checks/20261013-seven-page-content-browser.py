from pathlib import Path
import json,time,base64,hashlib
source=Path('site/checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0];exec(source)
b=Path('site');o=b/'checks';results=[];files=['demo-content-seed.mjs','demo-content-expanded.mjs','content-preview-data.mjs','profile-data.mjs','content-filters.mjs','welcome.mjs'];report={'date':'2026-10-13','scenario':'Actual78per section;seven pages12x6+6;new details and preserved26archive','initial_sha256':{f:hashlib.sha256((b/f).read_bytes()).hexdigest() for f in files},'results':results};c=Chrome()
def record(name,value):results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def wait(expr,seconds=15):
 deadline=time.time()+seconds
 while time.time()<deadline:
  v=c.js(expr)
  if v:return v
  time.sleep(.12)
 raise AssertionError(expr)
def click(sel):c.js('document.querySelector('+json.dumps(sel)+').click()');time.sleep(.25)
def go(route):c.js('location.hash='+json.dumps(route));time.sleep(.4)
def shot(name):(o/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def ids():return c.js('[...document.querySelectorAll("#content-list .cp-card")].map(e=>e.querySelector(".cp-card-title-link,.cp-card-open").getAttribute("href"))')
def change_language(lang):
 if c.js('!document.querySelector("#language").offsetWidth'):click('#profile')
 click('#language');click('[data-locale="'+lang+'"]')
 if c.js('document.querySelector("#profile").getAttribute("aria-expanded")==="true"'):click('#profile')
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));'});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]});c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=seven-pages#projects'});wait('!!document.querySelector("#content-pagination .cp-pagination-pages [data-page=\\"7\\"]")')
 for section in ['projects','people','journal']:
  go(section);seen=[];counts=[]
  for page in range(1,8):
   if page>1:click('#content-pagination .cp-pagination-pages [data-page="'+str(page)+'"]')
   links=ids();expected=12 if page<7 else 6;assert len(links)==expected,(section,page,links);seen+=links;counts.append(len(links));assert c.js('document.querySelector("#content-count").innerText.includes("78")');assert c.js('document.documentElement.scrollWidth<=innerWidth');assert not c.js('qaErrors')
  assert len(seen)==len(set(seen))==78;record(section+'-all-pages',{'counts':counts,'total':len(seen),'unique':len(set(seen)),'last':seen[-6:]})
  click('#content-pagination .cp-pagination-previous');assert 'page=6' in c.js('location.hash');assert len(ids())==12;click('#content-pagination .cp-pagination-pages [data-page="7"]');assert len(ids())==6
  before=ids();click('#content-list .cp-card-title-link,#content-list .cp-card-open');detail=c.js('location.hash');click('#content-back');assert 'page=7' in c.js('location.hash') and ids()==before;record(section+'-previous-jump-detail-return',{'detail':detail,'return':c.js('location.hash'),'itemsPreserved':True})
  c.js('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');time.sleep(.5);shot('20261013-seven-page-content-'+section+'-page7')
 c.js('(async()=>{window.qaExpanded=await import("./demo-content-expanded.mjs?v=1");return true})()')
 samples=[('projects','demo-expanded-project-nadia-selim'),('people','profile-nadia-selim'),('journal','demo-expanded-journal-nadia-selim')]
 for lang,w in [('fr',1280),('en',1280),('ar',320)]:
  c.width(w,900 if w==1280 else 640);change_language(lang)
  for section,id in samples:
   go(section+'/'+id);s=c.js('({hash:location.hash,body:document.querySelector("#content-sheet").innerText,overflow:document.documentElement.scrollWidth>innerWidth,errors:qaErrors})');expected=c.js('(()=>{const e=[...qaExpanded.expandedProfiles,...qaExpanded.expandedEditorialEntries].find(e=>e.id==='+json.dumps(id)+');return {title:e.title['+json.dumps(lang)+'],body:(e.bio||e.body[0].text)['+json.dumps(lang)+']}})()');assert expected['title'] in s['body'] and expected['body'] in s['body'] and not s['errors'] and not s['overflow'],(id,lang,s);record('new-detail-'+section+'-'+lang,{'hash':s['hash'],'title':expected['title'],'bodyLocalized':True,'overflow':False})
   if lang=='ar':shot('20261013-seven-page-content-'+section+'-detail-ar')
 c.width(1280,900);change_language('fr');go('projects/demo-expanded-project-nadia-selim');click('#project-detail .cp-author-link[href*="profile-nadia-selim"]');assert 'people/profile-nadia-selim' in c.js('location.hash');click('[data-profile-section-link="projects"]');links=c.js('[...document.querySelectorAll("#profile-detail a[href*=demo-expanded-project]")].map(a=>a.getAttribute("href"))');assert any('demo-expanded-project-nadia-selim' in x for x in links);record('new-profile-reverse-projects',links)
 go('projects/demo-expanded-project-nadia-selim');click('.cp-project-campus');places=c.js('[...document.querySelectorAll(".cp-project-campus-dialog [data-campus-id]")].map(b=>b.dataset.campusId)');assert places==['tirana','zurich'];record('new-project-campus-choice',places);go('projects?country=ALB&campus=tirana');assert len(ids())==2;record('albania-tirana-filter-without-globe',{'count':len(ids()),'ids':ids()});assert not c.js('qaErrors')
 # Reconstructed intermediate reader keeps26records and three pages after active expansion.
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/archives/site-versions/pre-seven-page-demo-content-20261013/preview.html?qa=preserved26#projects?page=3'});wait('!!document.querySelector("#content-pagination")&&document.querySelector("#content-count").innerText.includes("26")');time.sleep(.5);assert len(ids())==2;assert not c.js('qaErrors');record('preserved-three-page-reader',{'count':len(ids()),'total':c.js('document.querySelector("#content-count").innerText'),'summary':c.js('document.querySelector(".cp-pagination-summary").innerText')});report['passed']=True
except Exception as e:
 report['passed']=False;report['error']=repr(e)
 try:record('failure-state',c.js('({hash:location.hash,body:document.querySelector("#content-sheet")?.innerText,errors:window.qaErrors})'));shot('20261013-seven-page-content-failure')
 except:pass
 raise
finally:
 report['final_sha256']={f:hashlib.sha256((b/f).read_bytes()).hexdigest() for f in files};(o/'20261013-seven-page-content-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');c.close()
