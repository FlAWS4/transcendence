from pathlib import Path
import json,time,base64,hashlib
source=Path('site/checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0];exec(source)
root=Path('site');out=root/'checks';results=[]
report={'date':'2026-10-13','scenario':'Corrected entrance failure layout French desktop and Arabic320 then continue','initial_sha256':{f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in ['welcome.mjs','entrance.mjs','entrance.css']},'results':results}
c=Chrome()
def record(name,value):results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def wait(expr,seconds=15):
 deadline=time.time()+seconds
 while time.time()<deadline:
  v=c.js(expr)
  if v:return v
  time.sleep(.15)
 raise AssertionError(expr)
def shot(name):(out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def measure():return c.js('(()=>{let s=document.querySelector("#entrance-status").getBoundingClientRect(),a=document.querySelector("#entrance-access").getBoundingClientRect();return {status:{top:s.top,bottom:s.bottom},actions:{top:a.top,bottom:a.bottom,left:a.left,right:a.right},width:innerWidth,height:innerHeight,buttons:[...document.querySelectorAll("#entrance-access button")].map(b=>({text:b.innerText,top:b.getBoundingClientRect().top,bottom:b.getBoundingClientRect().bottom})),overflow:document.documentElement.scrollWidth>innerWidth}})()')
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/index.html?qa=map-independent-entry-layout-128#projects?country=FRA&campus=lyon'});wait('!!document.querySelector("#entry-guest")');c.js('document.querySelector("#entry-guest").click()');wait('document.body.dataset.entry==="error"')
 for lang,w,h in [('fr',1280,900),('ar',320,640)]:
  c.width(w,h);c.js('document.querySelector("#language").click()');c.js('document.querySelector('+json.dumps('[data-locale="'+lang+'"]')+').click()');time.sleep(.3);m=measure();assert m['status']['bottom']<=m['actions']['top'] and not m['overflow'] and m['actions']['left']>=0 and m['actions']['right']<=w and m['actions']['bottom']<=h,m;record('error-layout-'+lang,m);shot('20261013-map-independent-entry-error-fixed-'+lang)
 c.js('document.querySelectorAll("#entrance-access button")[2].click()');wait('document.body.dataset.entry==="welcome"');s=c.js('({hash:location.hash,count:document.querySelectorAll("#content-list .cp-card").length,disabled:document.querySelector("#scope-picker").disabled,dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth>innerWidth,active:document.activeElement.id})');assert s['count']==2 and 'campus=lyon' in s['hash'] and s['dir']=='rtl' and not s['disabled'] and not s['overflow'];record('arabic-continue-filtered',s);shot('20261013-map-independent-entry-continued-arabic-320');report['passed']=True
except Exception as e:
 report['passed']=False;report['error']=repr(e)
 try:shot('20261013-map-independent-entry-layout-failure')
 except:pass
 raise
finally:
 report['final_sha256']={f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in ['welcome.mjs','entrance.mjs','entrance.css']};(out/'20261013-map-independent-entry-layout-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');c.close()
