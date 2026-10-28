from pathlib import Path
import json,time,base64,hashlib
source=Path('site/checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0];exec(source)
b=Path('site');o=b/'checks';c=Chrome();r=[]
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 for section in ['projects','journal']:
  c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=demo-final#'+section+'?page=3'});time.sleep(1.5)
  c.js('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');time.sleep(.8)
  s=c.js('(()=>{const p=document.querySelector("#content-pagination"),q=p.getBoundingClientRect(),b=document.querySelector("#main-nav").getBoundingClientRect();return {hash:location.hash,scrollY,maxScroll:document.documentElement.scrollHeight-innerHeight,pagination:{top:q.top,bottom:q.bottom},dock:{top:b.top,bottom:b.bottom},summary:p.innerText,visibleLinks:[...p.querySelectorAll("a")].map(x=>{const r=x.getBoundingClientRect();const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {label:x.innerText,unobscured:t===x||x.contains(t)}}),artText:[...document.querySelectorAll(".cp-art")].map(x=>x.textContent)}})()');assert all(x['unobscured'] for x in s['visibleLinks']),s
  if section=='projects':assert not any('minishell' in x for x in s['artText'])
  r.append({'case':section+'-bottom-final','result':s});print(json.dumps(r[-1],ensure_ascii=False),flush=True);(o/('20261013-demo-content-'+section+'-page3-final.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
finally:
 (o/'20261013-demo-content-final-browser.json').write_text(json.dumps({'results':r,'seed_sha256':hashlib.sha256((b/'demo-content-seed.mjs').read_bytes()).hexdigest()},ensure_ascii=False,indent=2)+'\n');c.close()
