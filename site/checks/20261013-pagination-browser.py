from pathlib import Path
import json, time, base64, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse
root=Path('/home/le-rif/Bureau/Transcendence')
source=(root/'site/checks/20261012-multi-campus-browser.py').read_text()
exec(source.split('from pathlib import Path')[0])
out=root/'site/checks'
injection='''
// Browser QA only: extend each section without changing the repository corpus.
for(const qaSection of ['projects','people','journal']){
 const qaSeeds=discoveryEntries.filter(entry=>entry.section===qaSection);
 for(let qaIndex=qaSeeds.length;qaIndex<29;qaIndex++){
  const qaSeed=qaSeeds[qaIndex%qaSeeds.length];
  const qaEntry={...qaSeed,id:qaSeed.id+'-qa-'+qaIndex,title:Object.fromEntries(Object.entries(qaSeed.title).map(([lang,title])=>[lang,title+' [QA '+qaIndex+']']))};
  discoveryEntries.push(qaEntry);
  if(qaEntry.kind==='profile')profileById.set(qaEntry.id,qaEntry);
 }
}
'''
class Fixture(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
 def log_message(self,*args):pass
 def do_GET(self):
  if urlparse(self.path).path=='/site/welcome.mjs':
   code=(root/'site/welcome.mjs').read_text()
   needle='const discoveryEntries=createDiscoveryEntries(previewEntries);'
   assert needle in code
   body=code.replace(needle,needle+injection).encode()
   self.send_response(200);self.send_header('Content-Type','text/javascript');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
  else:super().do_GET()
server=ThreadingHTTPServer(('127.0.0.1',0),Fixture)
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:'+str(server.server_port)+'/site/'
c=Chrome();results=[]
def click(selector):
 c.js('document.querySelector('+json.dumps(selector)+').click()');time.sleep(.6)
def go(route):
 c.js('location.hash='+json.dumps(route));time.sleep(.6)
def record(name,value):
 results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def shot(name):
 (out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def state():
 return c.js("""(()=>{const p=document.querySelector('#content-pagination');return {hash:location.hash,count:document.querySelector('#content-list').children.length,summary:p.querySelector('.cp-pagination-summary')?.textContent,current:p.querySelector('[aria-current=page]')?.dataset.page,previousDisabled:p.querySelector('.cp-pagination-previous')?.disabled===true,nextDisabled:p.querySelector('.cp-pagination-next')?.disabled===true,links:[...document.querySelectorAll('#content-list .cp-card-title-link,#content-list .cp-card-open')].map(e=>e.getAttribute('href')),focus:document.activeElement.id,scroll:scrollY,overflow:document.documentElement.scrollWidth>innerWidth}})()""")
try:
 c.width(1280,900)
 c.call('Page.navigate',{'url':base+'content-preview.html?qa=pagination#projects'})
 time.sleep(2)
 for section in ['projects','people','journal']:
  go(section);first=state();assert first['count']==12 and first['current']=='1' and first['previousDisabled'],first
  click('.cp-pagination-next');second=state();assert second['count']==12 and second['current']=='2' and second['focus']=='section-title',second
  assert not set(first['links'])&set(second['links'])
  c.js('window.scrollTo(0,180)');time.sleep(.2)
  click('#content-list .cp-card-title-link' if section!='people' else '#content-list .cp-card-open')
  assert c.js("!!document.querySelector('#content-index').hidden")
  c.js("[...document.querySelectorAll('#content-sheet .cp-back')].find(e=>e.offsetWidth).click()");time.sleep(.7)
  returned=state();assert returned['current']=='2' and returned['links']==second['links'],returned
  assert abs(returned['scroll']-180)<2,returned
  click('.cp-pagination-next');last=state();assert last['count']==5 and last['current']=='3' and last['nextDisabled'],last
  c.js("document.querySelector('#content-pagination').scrollIntoView({block:'center'})");time.sleep(.3)
  if section=='projects':shot('20261013-pagination-projects-fr')
  click('.cp-pagination-previous');assert state()['current']=='2'
  click('.cp-pagination-pages [data-page="1"]');assert state()['current']=='1'
  go(section+'?page=999');clamped=state();assert clamped['current']=='3' and 'page=3' in clamped['hash'],clamped
  go(section+'?page=-2');invalid=state();assert invalid['current']=='1' and 'page=' not in invalid['hash'],invalid
  record(section,{'first':first,'second':second,'returned':returned,'last':last,'clamped':clamped,'invalid':invalid})
 go('projects?page=2')
 click('#language');click('[data-locale="en"]');assert state()['current']=='2'
 click('#theme');click('[data-theme-choice="dark"]');assert state()['current']=='2'
 click('#content-layout-button');click('#content-layout-menu [data-value="list"]');assert state()['current']=='2'
 record('locale-theme-view-preserve-page',state())
 go('projects?page=3');click('#scope-picker')
 c.js("var select=document.querySelector('.scope-selectors [name=country]');select.value='FRA';select.dispatchEvent(new Event('change',{bubbles:true}))");time.sleep(.6)
 filtered=state();assert filtered['current']=='1' and 'country=FRA' in filtered['hash'] and 'page=' not in filtered['hash'],filtered
 record('country-resets-page',filtered)
 c.js("document.querySelector('#close-scope-popover').click()")
 go('projects?page=2');click('#content-sort-button');click('#content-sort-menu [data-value="oldest"]');assert state()['current']=='1'
 record('sort-resets-page',state())
 c.width(320,640);click('#language');click('[data-locale="ar"]')
 go('people?page=3');assert not state()['overflow']
 c.js("document.querySelector('#content-pagination').scrollIntoView({block:'center'})");time.sleep(.3)
 record('arabic-mobile',state());shot('20261013-pagination-people-ar')
 click('.cp-pagination-previous');assert state()['current']=='2'
finally:
 (out/'20261013-pagination-browser.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
 c.close();server.shutdown()
