from pathlib import Path
import json,time,base64,hashlib
source=Path('site/checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0];exec(source)
root=Path('site');out=root/'checks';results=[]
files=['demo-content-seed.mjs','content-preview-data.mjs','profile-data.mjs','content-filters.mjs','welcome.mjs']
report={'date':'2026-10-13','scenario':'Actual26records in each discovery section,12/12/2 pages and new translated details','initial_sha256':{f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in files},'results':results}
c=Chrome()
def record(name,value):results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def wait(expr,seconds=15):
 deadline=time.time()+seconds
 while time.time()<deadline:
  v=c.js(expr)
  if v:return v
  time.sleep(.12)
 raise AssertionError(expr)
def click(sel):c.js('document.querySelector('+json.dumps(sel)+').click()');time.sleep(.3)
def go(route):c.js('location.hash='+json.dumps(route));time.sleep(.5)
def shot(name):(out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def details():return c.js('({hash:location.hash,title:document.querySelector("#detail-title").innerText,body:document.querySelector("#content-sheet").innerText,overflow:document.documentElement.scrollWidth>innerWidth,errors:window.qaErrors})')
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));'});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=demo-content-130#projects'});wait('!!document.querySelector("#content-pagination a[data-page="+CSS.escape("3")+"]")')
 for section in ['projects','people','journal']:
  go(section);seen=[]
  for page,count in [(1,12),(2,12),(3,2)]:
   if page>1:click('#content-pagination .cp-pagination-pages [data-page="'+str(page)+'"]')
   s=c.js('({hash:location.hash,count:document.querySelectorAll("#content-list .cp-card").length,total:document.querySelector("#content-count").innerText,summary:document.querySelector(".cp-pagination-summary").innerText,hrefs:[...document.querySelectorAll("#content-list .cp-card")].map(e=>e.querySelector(".cp-card-title-link,.cp-card-open").getAttribute("href")),overflow:document.documentElement.scrollWidth>innerWidth,errors:window.qaErrors})');assert s['count']==count and '26' in s['total'] and not s['overflow'] and not s['errors'],s;seen+=s['hrefs'];record(section+'-page-'+str(page),s)
  assert len(seen)==len(set(seen))==26;c.js('document.querySelector("#content-pagination").scrollIntoView({block:"end"})');time.sleep(.2);shot('20261013-demo-content-'+section+'-page3')
 # Language-specific names and bodies from the authored local seed.
 c.js('(async()=>{window.qaSeed=await import("./demo-content-seed.mjs?v=1");return true})()')
 samples=[('projects','demo-project-bytes-in-order'),('people','profile-nora-bensaid'),('journal','demo-journal-question-before-code')]
 for lang,w in [('fr',1280),('en',1280),('ar',320)]:
  c.width(w,900 if w==1280 else 640);click('#language');click('[data-locale="'+lang+'"]')
  for section,id in samples:
   go(section+'/'+id);s=details();expected=c.js('(()=>{const e=[...qaSeed.demoProfiles,...qaSeed.demoEditorialEntries].find(e=>e.id==='+json.dumps(id)+');return {title:e.title['+json.dumps(lang)+'],body:(e.bio||e.body[0].text)['+json.dumps(lang)+']}})()');assert expected['title'] in s['body'] and expected['body'] in s['body'] and not s['errors'] and not s['overflow'],(id,lang,s,expected)
   record('detail-'+section+'-'+lang,{'hash':s['hash'],'title':expected['title'],'translatedBodyPresent':True,'overflow':s['overflow'],'errors':s['errors']})
   if lang=='ar':shot('20261013-demo-content-'+section+'-detail-ar')
 # Actual author link and reverse contribution.
 c.width(1280,900);click('#language');click('[data-locale="fr"]');go('projects/demo-project-bytes-in-order');click('#project-detail .cp-author-link[href*="profile-nora-bensaid"]');s=details();assert 'people/profile-nora-bensaid' in s['hash'] and 'Nora Bensaïd' in s['body'];record('project-author-profile',{'hash':s['hash'],'name':'Nora Bensaïd'})
 click('[data-profile-section-link="projects"]');links=c.js('[...document.querySelectorAll("#profile-detail a[href*=demo-project]")].map(a=>({href:a.getAttribute("href"),text:a.innerText}))');assert any('demo-project-bytes-in-order' in x['href'] for x in links);assert any('demo-project-across-the-terminals' in x['href'] for x in links);record('profile-reverse-projects',links)
 click('#profile-detail a[href*="demo-project-across-the-terminals"]');s=details();assert 'projects/demo-project-across-the-terminals' in s['hash'];click('.cp-project-campus');campuses=c.js('[...document.querySelectorAll(".cp-project-campus-dialog [data-campus-id]")].map(b=>b.dataset.campusId)');assert campuses==['1337-khouribga','abu-dhabi','bangkok'];record('new-multicampus-dialog',campuses)
 # Local country/campus selectors continue filtering the enriched dataset without map.
 c.call('Input.dispatchKeyEvent',{'type':'keyDown','key':'Escape','code':'Escape','windowsVirtualKeyCode':27});c.call('Input.dispatchKeyEvent',{'type':'keyUp','key':'Escape','code':'Escape','windowsVirtualKeyCode':27});go('projects');click('#scope-picker');c.js('var q=document.querySelector(".scope-selectors select[name=campus]");q.value="1337-khouribga";q.dispatchEvent(new Event("change",{bubbles:true}))');time.sleep(.4);s=c.js('({hash:location.hash,count:document.querySelectorAll("#content-list .cp-card").length,total:document.querySelector("#content-count").innerText,errors:qaErrors})');assert s['count']==2 and 'country=MAR' in s['hash'] and 'campus=1337-khouribga' in s['hash'] and not s['errors'];record('new-campus-scope',s);report['passed']=True
except Exception as e:
 report['passed']=False;report['error']=repr(e)
 try:record('failure-state',c.js('({hash:location.hash,body:document.querySelector("#content-sheet")?.innerText,errors:window.qaErrors})'));shot('20261013-demo-content-failure')
 except:pass
 raise
finally:
 report['final_sha256']={f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in files};(out/'20261013-demo-content-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');c.close()
