from pathlib import Path
import json,time,base64,threading,hashlib
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from urllib.parse import urlparse
root=Path('/home/le-rif/Bureau/Transcendence');folder=root/'site';out=folder/'checks'
exec((out/'20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
injection='''
for(const qaSection of ['projects','people','journal']){
 const qaSeeds=discoveryEntries.filter(entry=>entry.section===qaSection),qaTotal=qaSection==='people'?2400:1200;
 for(let i=qaSeeds.length;i<qaTotal;i++){
  const source=qaSeeds[i%qaSeeds.length],entry={...source,id:source.id+'-qa-'+i,title:Object.fromEntries(Object.entries(source.title).map(([lang,title])=>[lang,title+' [QA '+i+']']))};
  discoveryEntries.push(entry);if(entry.kind==='profile')profileById.set(entry.id,entry);
 }
}
'''
class Fixture(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
 def log_message(self,*args):pass
 def do_GET(self):
  if urlparse(self.path).path=='/site/welcome.mjs':
   code=(folder/'welcome.mjs').read_text();needle='const discoveryEntries=createDiscoveryEntries(previewEntries);';assert needle in code
   body=code.replace(needle,needle+injection).encode();self.send_response(200);self.send_header('Content-Type','text/javascript');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
  else:super().do_GET()
server=ThreadingHTTPServer(('127.0.0.1',0),Fixture);threading.Thread(target=server.serve_forever,daemon=True).start();base='http://127.0.0.1:'+str(server.server_port)+'/site/'
c=Chrome();results=[];sources=lambda:{n:hashlib.sha256((folder/n).read_bytes()).hexdigest() for n in ['content-pagination.mjs','content-pagination-ui.mjs','content-pagination.css']};initial=sources()
def click(selector):c.js('document.querySelector('+json.dumps(selector)+').click()');time.sleep(.25)
def go(route):c.js('location.hash='+json.dumps(route));time.sleep(.3)
def record(name):
 value=c.js("""(()=>{const p=document.querySelector('#content-pagination'),pages=p.querySelector('.cp-pagination-pages');return {hash:location.hash,count:document.querySelector('#content-list').children.length,summary:p.querySelector('.cp-pagination-summary')?.textContent,current:p.querySelector('[aria-current=page]')?.dataset.page,numbers:[...pages.querySelectorAll('a')].map(e=>Number(e.dataset.page)),ellipses:pages.querySelectorAll('.cp-pagination-ellipsis').length,rows:[...new Set([...pages.children].map(e=>Math.round(e.getBoundingClientRect().top+e.getBoundingClientRect().height/2)))],previousDisabled:p.querySelector('.cp-pagination-previous')?.disabled===true,nextDisabled:p.querySelector('.cp-pagination-next')?.disabled===true,overflow:document.documentElement.scrollWidth>innerWidth||pages.scrollWidth>pages.clientWidth,scroll:scrollY}})()""")
 results.append({'case':name,'result':value});assert not value['overflow'];assert len(value['numbers'])<=5;assert len(value['rows'])==1,value;return value
def shot(name):
 c.js("document.querySelector('#content-pagination').scrollIntoView({block:'center',behavior:'instant'})");time.sleep(.2);(out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]});c.call('Page.navigate',{'url':base+'content-preview.html?qa=100pages#projects'});time.sleep(1.5)
 for section in ['projects','people','journal']:
  for page in [1,50,100]:
   go(section+('?page='+str(page) if page>1 else ''));s=record(section+'-'+str(page));assert s['count']==(24 if section=='people' else 12);assert s['current']==str(page) and '100' in s['summary'];assert s['numbers'][0]==1 and s['numbers'][-1]==100
   if section=='projects' and page==50:shot('20261013-compact-pagination-desktop-100')
  assert s['nextDisabled'];click('.cp-pagination-previous');assert record(section+'-previous')['current']=='99';click('.cp-pagination-pages [data-page="1"]');assert record(section+'-first')['current']=='1'
 for lang in ['fr','ar']:
  c.width(320,640);click('#profile');click('[data-account-action="settings"]');click('[data-account-locale="'+lang+'"]');click('[data-account-theme="'+('dark' if lang=='ar' else 'light')+'"]');click('[data-account-action="close"]')
  for page in [1,50,100]:
   go('projects?page='+str(page));s=record(lang+'-mobile-'+str(page));shot('20261013-compact-pagination-'+lang+'-'+str(page));assert s['current']==str(page)
 # Real corpus:24 profiles per page and no record lost between the four pages.
 c.width(1280,900);c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=24profiles#people'});time.sleep(1.2)
 seen=[]
 for page,count in [(1,24),(2,24),(3,24),(4,6)]:
  go('people?page='+str(page));s=record('real-people-'+str(page));assert s['count']==count and s['current']==str(page)
  seen+=c.js("[...document.querySelectorAll('#content-list .cp-card-open')].map(e=>e.getAttribute('href'))")
 assert len(seen)==78 and len(set(seen))==78
 go('people?page=7');assert record('old-profile-page-clamped')['current']=='4'
 go('people?page=2');c.js('scrollTo({top:200,behavior:"instant"})');click('#content-list .cp-card-open');c.js('history.back()');time.sleep(.4);s=record('real-profile-detail-back');assert s['current']=='2' and s['scroll']==200
 go('projects');s=record('real-seven-page-compact');assert s['numbers']==[1,2,3,7] and s['ellipses']==1
 shot('20261013-compact-pagination-seven-pages');print('PASS',len(results),'cases')
finally:
 (out/'20261013-compact-pagination-browser.json').write_text(json.dumps({'fixture':'1200 projects,2400 profiles,1200 chronicles injected into HTTP only; actual corpus remains78 per section','sourcesBefore':initial,'sourcesAfter':sources(),'cases':results},ensure_ascii=False,indent=2)+'\n');c.close();server.shutdown()
