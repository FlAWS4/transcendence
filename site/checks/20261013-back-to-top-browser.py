from pathlib import Path
import json,time,base64,hashlib
root=Path('/home/le-rif/Bureau/Transcendence');folder=root/'site';out=folder/'checks'
exec((out/'20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
files=['back-to-top.mjs','back-to-top.css','welcome.mjs','index.html','content-preview.html']
hashes=lambda:{name:hashlib.sha256((folder/name).read_bytes()).hexdigest() for name in files}
report={'date':'2026-10-13','sourcesBefore':hashes(),'cases':[]};c=Chrome()
def wait(expression,seconds=6):
 end=time.time()+seconds
 while time.time()<end:
  if c.js(expression):return
  time.sleep(.08)
 raise AssertionError(expression)
def click(selector):c.js('document.querySelector('+json.dumps(selector)+').click()');time.sleep(.12)
def key(name,code):
 params={'type':'keyDown','key':name,'code':name,'windowsVirtualKeyCode':code}
 if code==13:params.update(text='\r',unmodifiedText='\r')
 c.call('Input.dispatchKeyEvent',params);c.call('Input.dispatchKeyEvent',{'type':'keyUp','key':name,'code':name,'windowsVirtualKeyCode':code});time.sleep(.12)
def scroll(y):c.js('scrollTo({top:'+str(y)+',behavior:"instant"})');time.sleep(.6)
def state():return c.js('''(()=>{const b=document.querySelector('#back-to-top'),r=b?.getBoundingClientRect(),controls=[...document.querySelectorAll('.dock-shell,.dock-search-toggle,.dock-random-toggle')].map(e=>{const p=e.getBoundingClientRect();return {class:e.className,rect:[p.left,p.top,p.right,p.bottom]}});return {hidden:b?.hidden,shown:!!r?.width&&!!r?.height,label:b?.getAttribute('aria-label'),rect:r&&[r.left,r.top,r.right,r.bottom],scroll:scrollY,hash:location.hash,lang:document.documentElement.lang,focus:document.activeElement.id,controls,overflows:document.documentElement.scrollWidth>innerWidth}})()''')
def record(name):
 value=state();report['cases'].append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True);assert not value['overflows'];return value
def shot(name):(out/('20261013-back-to-top-'+name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def language(value):
 click('#profile');click('[data-account-action="language"]');click('[data-account-locale="'+value+'"]');key('Escape',27)
def no_overlap(value):
 x,y,right,bottom=value['rect'];assert right-x>=44 and bottom-y>=44
 for control in value['controls']:
  a,top,b,lower=control['rect'];assert bottom<=top-11.5,(value,control)
try:
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.width(390,844)
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/index.html?qa=back-to-top'});wait('!!document.querySelector("#back-to-top")');assert not record('entrance-mobile-hidden')['shown']
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=back-to-top#projects'});wait('!!document.querySelector("#back-to-top")&&document.querySelectorAll("#content-list .cp-card").length>0');time.sleep(.5)
 assert not record('mobile-list-top-hidden')['shown'];scroll(300);assert not record('below-threshold-hidden')['shown']
 scroll(1000);value=record('mobile-list-scrolled');assert value['shown'];no_overlap(value);shot('fr390')
 c.js('window.qaScrollCalls=[];window.qaNativeScroll=window.scrollTo;window.scrollTo=function(options){qaScrollCalls.push(options);return qaNativeScroll.call(this,options)}');click('#back-to-top');wait('scrollY===0');value=record('smooth-return-focus-list');assert value['focus']=='section-title' and not value['shown'];assert c.js('qaScrollCalls.at(-1).behavior')=='smooth'
 # Responsive boundary, including focus when a visible control is hidden.
 scroll(1000);c.width(840,844);time.sleep(.4);value=record('width840-visible');assert value['shown'];no_overlap(value)
 c.js('document.querySelector("#back-to-top").focus()');c.width(841,844);time.sleep(.3);value=record('width841-hidden-focus-retained');assert not value['shown'] and value['focus']=='section-title'
 c.width(1280,900);scroll(1000);assert not record('desktop-hidden-after-scroll')['shown']
 c.width(320,640);language('en');scroll(900);value=record('mobile-English');assert value['label']=='Back to top' and value['shown'];no_overlap(value)
 language('ar');scroll(900);value=record('mobile-Arabic320');assert value['label']=='العودة إلى الأعلى' and value['shown'];assert value['rect'][0]>=15 and value['rect'][2]<=61;no_overlap(value);shot('ar320')
 # Open panels retain their own focus and document position.
 click('.dock-search-toggle');value=record('search-hides-shortcut');assert not value['shown'];key('Escape',27);time.sleep(.55);value=record('search-close-restores-shortcut');assert value['shown'];no_overlap(value);assert abs(value['controls'][1]['rect'][1]-value['rect'][3]-12)<1
 click('#scope-picker');value=record('geography-hides-shortcut');assert not value['shown'];key('Escape',27);assert record('geography-close-restores-shortcut')['shown']
 click('#profile');value=record('account-hides-shortcut');assert not value['shown'];key('Escape',27);assert record('account-close-restores-shortcut')['shown']
 click('#content-category-button');value=record('filter-hides-shortcut');assert not value['shown'];key('Escape',27);assert record('filter-close-restores-shortcut')['shown']
 # Native Enter activation and reduced-motion return on actual detail pages.
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 for section,title in [('projects','project-title'),('people','profile-title'),('journal','journal-title')]:
  c.js('location.hash='+json.dumps('#'+section));time.sleep(.45)
  selector='#content-list a[href*="'+section+'/"]';link=c.js('document.querySelector('+json.dumps(selector)+').getAttribute("href")');c.js('location.href='+json.dumps(link));time.sleep(.5);scroll(900)
  value=record(section+'-detail-scrolled');assert value['shown'];no_overlap(value)
  c.js('window.qaScrollCalls=[];document.querySelector("#back-to-top").focus()');key('Enter',13);wait('scrollY===0');value=record(section+'-detail-reduced-return');assert value['focus']==title and not value['shown'];assert c.js('qaScrollCalls.at(-1).behavior')=='instant'
 c.js('location.hash="#projects"');time.sleep(.4);scroll(900);c.width(640,360);time.sleep(.4);value=record('mobile-landscape');assert value['shown'];no_overlap(value);shot('landscape')
 click('#main-nav [data-section="explore"]');assert not record('explorer-hidden')['shown']
 report['passed']=True
except Exception as error:
 report['passed']=False;report['error']=repr(error)
 try:record('failure');shot('failure')
 except Exception:pass
 raise
finally:
 report['sourcesAfter']=hashes();report['sourcesUnchanged']=report['sourcesBefore']==report['sourcesAfter'];(out/'20261013-back-to-top-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');c.close()
