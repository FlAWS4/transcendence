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
c=Chrome();results=[]
names=['content-pagination.mjs','content-pagination-ui.mjs','content-pagination.css']
sources=lambda:{n:hashlib.sha256((folder/n).read_bytes()).hexdigest() for n in names}
initial=sources()
def click(selector):
 pos=c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');e.scrollIntoView({block:"center",behavior:"instant"});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
 for event in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':event,**pos,'button':'left','clickCount':1})
 time.sleep(.2)
def go(route):c.js('location.hash='+json.dumps(route));time.sleep(.2)
def record(name):
 value=c.js("""(()=>{const p=document.querySelector('#content-pagination'),group=p.querySelector('.cp-pagination-controls'),pages=p.querySelector('.cp-pagination-pages'),rect=group.getBoundingClientRect();const box=e=>{const r=e.getBoundingClientRect();return {left:r.left-rect.left,right:r.right-rect.left,cy:r.top+r.height/2,width:r.width,height:r.height,label:e.getAttribute('aria-label'),title:e.title,text:e.textContent,disabled:e.disabled===true,transform:e.querySelector('svg')?getComputedStyle(e.querySelector('svg')).transform:null}};return {width:innerWidth,dir:document.documentElement.dir,hash:location.hash,current:p.querySelector('[aria-current=page]')?.dataset.page,groupWidth:rect.width,numbers:[...pages.querySelectorAll('a')].map(e=>({page:Number(e.dataset.page),...box(e)})),previous:box(p.querySelector('.cp-pagination-previous')),next:box(p.querySelector('.cp-pagination-next')),centers:[...new Set([...group.querySelectorAll('.cp-pagination-link,.cp-pagination-ellipsis')].map(e=>Math.round(e.getBoundingClientRect().top+e.getBoundingClientRect().height/2)))],overflow:document.documentElement.scrollWidth>innerWidth||pages.scrollWidth>pages.clientWidth}})()""")
 results.append({'case':name,'result':value})
 assert not value['overflow'],value
 assert value['groupWidth']==264 and len(value['centers'])==1,value
 assert len(value['numbers'])<=5 and all(28<=n['width']<=32 and n['height']==36 for n in value['numbers']),value
 assert all(a['width']==32 and a['height']==36 and not a['text'] and a['label']==a['title'] for a in [value['previous'],value['next']]),value
 expected=(232,0) if value['dir']=='rtl' else (0,232)
 assert (value['previous']['left'],value['next']['left'])==expected,value
 return value
def shot(name):
 c.js("document.querySelector('#content-pagination').scrollIntoView({block:'center',behavior:'instant'})");time.sleep(.2)
 (out/('20261013-pagination-fixed-row-'+name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
try:
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.width(1280,900);c.call('Page.navigate',{'url':base+'content-preview.html?qa=fixed-row#projects?page=50'});time.sleep(1.4)
 for width in [1280,841,840,601,600,390,320,600,1280]:
  c.width(width,900 if width>840 else 640);time.sleep(.15);record('resize-fr-'+str(width))
 c.width(320,640)
 for locale in ['fr','en','ar']:
  click('#profile');click('[data-account-action="settings"]');click('[data-account-locale="'+locale+'"]');click('[data-account-theme="'+('dark' if locale=='ar' else 'light')+'"]');click('[data-account-action="close"]')
  for page in [1,50,100]:
   go('projects?page='+str(page));value=record(locale+'-100pages-'+str(page));assert value['current']==str(page)
   assert value['previous']['disabled']==(page==1) and value['next']['disabled']==(page==100)
   if page==50:shot(locale+'-320-middle')
  click('.cp-pagination-previous');assert record(locale+'-pointer-previous')['current']=='99'
  click('.cp-pagination-next');assert record(locale+'-pointer-next')['current']=='100'
 c.width(1280,900);go('projects?page=50');record('ar-desktop');shot('ar-desktop-middle')
 for section in ['people','journal']:
  go(section+'?page=50');record(section+'-100pages')
 # Short page counts keep exactly the same fixed arrow columns.
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=fixed-row-real#people'});time.sleep(1.2);c.width(320,640)
 for section in ['people','projects','journal']:
  go(section);record('actual-'+section)
 shot('actual-seven-pages')
 print('PASS',len(results),'states; one row, arrows at 0/232 (RTL reversed), compact28x36/32x36, real pointer navigation')
finally:
 (out/'20261013-pagination-fixed-row-browser.json').write_text(json.dumps({'fixture':'100 pages injected into HTTP only, then actual corpus','sourcesBefore':initial,'sourcesAfter':sources(),'cases':results},ensure_ascii=False,indent=2)+'\n');c.close();server.shutdown()
