# Run from repository root with Google Chrome and local server on 8765.
import os, subprocess, json, select, time, tempfile, base64
class Chrome:
 def __init__(self):
  self.profile=tempfile.mkdtemp(prefix='horizon-dock-chrome-')
  self.proc=subprocess.Popen(['bash','-c','exec 3<&0 4>&1; exec /usr/bin/google-chrome --headless=new --remote-debugging-pipe --no-first-run --no-default-browser-check --disable-background-networking --disable-sync --disable-dev-shm-usage --user-data-dir="$1" about:blank','horizon-qa',self.profile],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=open('/tmp/horizon-dock-chrome.log','w'))
  self.seq=0;self.buf=b'';self.session=None
  target=self.call('Target.createTarget',{'url':'about:blank'})['targetId']
  self.session=self.call('Target.attachToTarget',{'targetId':target,'flatten':True})['sessionId']
  self.call('Page.enable')
  self.call('Page.bringToFront')
  self.call('Emulation.setFocusEmulationEnabled',{'enabled':True})
 def call(self,method,params=None):
  self.seq+=1; req={'id':self.seq,'method':method,'params':params or {}}
  if self.session:req['sessionId']=self.session
  self.proc.stdin.write(json.dumps(req).encode()+b'\0');self.proc.stdin.flush()
  deadline=time.time()+20
  while time.time()<deadline:
   if b'\0' not in self.buf:
    if not select.select([self.proc.stdout],[],[],1)[0]:continue
    data=os.read(self.proc.stdout.fileno(),1048576)
    if not data:raise RuntimeError('Chrome pipe closed; see /tmp/horizon-dock-chrome.log')
    self.buf+=data
   while b'\0' in self.buf:
    msg,self.buf=self.buf.split(b'\0',1)
    if not msg:continue
    item=json.loads(msg)
    if item.get('id')==self.seq:
     if 'error' in item:raise RuntimeError(item['error'])
     return item.get('result',{})
  raise TimeoutError(method)
 def js(self,expression):
  res=self.call('Runtime.evaluate',{'expression':expression,'awaitPromise':True,'returnByValue':True})
  if 'exceptionDetails' in res:raise RuntimeError(res['exceptionDetails'])
  return res['result'].get('value')
 def width(self,w,h=800):self.call('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False})
 def shot(self,name):
  data=self.call('Page.captureScreenshot',{'format':'png'})['data']
  open('/tmp/'+name+'.png','wb').write(base64.b64decode(data))
 def close(self):
  try:self.call('Browser.close')
  finally:self.proc.wait(timeout=10)
from pathlib import Path
out=Path('site/checks');out.mkdir(exist_ok=True)
base='http://127.0.0.1:8765/site/'
c=Chrome();results=[]
def record(name,value):
 results.append({'case':name,'result':value})
 print(name,json.dumps(value,ensure_ascii=False),flush=True)
def go(route):
 c.js('location.hash='+json.dumps(route));time.sleep(.6)
def click(sel):c.js('document.querySelector('+json.dumps(sel)+').click()');time.sleep(.2)
def shot(name):
 data=c.call('Page.captureScreenshot',{'format':'png'})['data'];(out/(name+'.png')).write_bytes(base64.b64decode(data))
def key(name):
 c.call('Input.dispatchKeyEvent',{'type':'keyDown','key':name,'code':name,'windowsVirtualKeyCode':27,'nativeVirtualKeyCode':27});c.call('Input.dispatchKeyEvent',{'type':'keyUp','key':name,'code':name,'windowsVirtualKeyCode':27,'nativeVirtualKeyCode':27});time.sleep(.2)
try:
 c.width(1280,900);c.call('Page.navigate',{'url':base+'content-preview.html?qa=multi-campus-125#projects'});time.sleep(2)
 for route,count in [('projects',5),('projects?country=FRA',3),('projects?country=BRA',2),('projects?country=JPN&campus=tokyo',2),('projects?country=FRA&campus=lyon',2),('projects?country=BRA&campus=sao',1)]:
  go(route)
  state=c.js("({count:document.querySelectorAll('#content-list .cp-card').length,titles:[...document.querySelectorAll('#content-list .cp-card-title-link')].map(x=>x.innerText),campuses:[...document.querySelectorAll('#content-list .cp-content-campuses')].map(x=>x.innerText)})")
  assert state['count']==count,(route,state);assert len(set(state['titles']))==count;record(route,state)
 go('projects/ft-transcendence-building-together?country=JPN&campus=tokyo')
 for lang,theme,w in [('fr','light',1280),('en','light',960),('ar','dark',320)]:
  c.width(w,900 if w==1280 else 640);click('#language');click('[data-locale="'+lang+'"]');click('#theme');click('[data-theme-choice="'+theme+'"]')
  click('.cp-project-campus');state=c.js("(()=>{const d=document.querySelector('.cp-project-campus-dialog'),r=d.getBoundingClientRect();return {text:d.innerText,ids:[...d.querySelectorAll('[data-campus-id]')].map(x=>x.dataset.campusId),dir:d.dir,x:r.x,right:r.right,viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth}})()")
  assert state['ids']==['paris','lyon','tokyo','rio'];assert not state['overflow'];assert state['x']>=0 and state['right']<=w
  record('dialog-'+lang,state);shot('20261012-multi-campus-dialog-'+lang)
  key('Escape');record('escape-'+lang,c.js("({active:document.activeElement.outerHTML,dialog:!!document.querySelector('.cp-project-campus-dialog')})"));assert c.js("document.activeElement.matches('.cp-project-campus')")
 # Selected campus opens its map, preserving route and return focus.
 c.width(1280,900);click('#language');click('[data-locale="fr"]');click('#theme');click('[data-theme-choice="light"]');click('.cp-project-campus')
 before=c.js('location.hash');click('[data-campus-id="lyon"]');time.sleep(.7)
 state=c.js("({open:document.querySelector('#campus-map-dialog').open,name:document.querySelector('#campus-map-name').innerText,hash:location.hash,choices:document.querySelectorAll('.cp-project-campus-dialog').length})")
 assert state['open'] and state['name']=='42 Lyon' and state['hash']==before and state['choices']==0;record('map-choice',state)
 click('#campus-map-close');assert c.js("document.activeElement.matches('.cp-project-campus')");assert c.js('location.hash')==before
 # Shared content state across campus contexts.
 click('#project-detail .cp-favorite');click('[data-project-section-link="comments"]')
 c.js("var field=document.querySelector('.cp-comments-form textarea');field.value='Essai multicampus partagé';field.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.cp-comments-form').requestSubmit()")
 time.sleep(.3);go('projects/ft-transcendence-building-together?country=BRA&campus=rio&project=comments')
 # Route key comes from the actual link to avoid assuming internal parameter naming.
 click('[data-project-section-link="comments"]')
 state=c.js("({comments:[...document.querySelectorAll('.cp-comment-text')].map(x=>x.textContent),text:document.querySelector('.cp-comments').innerText,favorite:document.querySelector('#project-detail .cp-favorite').getAttribute('aria-pressed'),hash:location.hash})")
 assert 'Essai multicampus partagé' in state['text'];assert state['favorite']=='true';record('shared-state',state)
 # Search geographical destination and lexical world context.
 for query,expected in [('Tokyo','campus=tokyo'),('Construire à cinq',None)]:
  go('projects');click('.dock-search-toggle');c.js("var input=document.querySelector('.dock-search-input');input.value="+json.dumps(query)+";input.dispatchEvent(new Event('input',{bubbles:true}))");time.sleep(.4)
  state=c.js("[...document.querySelectorAll('.dock-search-result')].map(x=>({text:x.innerText,index:x.dataset.resultIndex}))");matches=[x for x in state if 'ft_transcendence' in x['text']];assert len(matches)==1,state
  click('[data-result-index="'+matches[0]['index']+'"]');time.sleep(.5);url=c.js('location.hash');assert 'ft-transcendence-building-together' in url
  assert (expected in url) if expected else ('campus=' not in url);record('search-'+query,{'results':state,'destination':url})
 # Small grid and detail have no horizontal overflow in French and Arabic.
 for lang,theme in [('fr','light'),('ar','dark')]:
  c.width(320,640);click('#language');click('[data-locale="'+lang+'"]');click('#theme');click('[data-theme-choice="'+theme+'"]');go('projects')
  assert c.js('document.documentElement.scrollWidth<=innerWidth');shot('20261012-multi-campus-grid-'+lang)
  go('projects/ft-transcendence-building-together');assert c.js('document.documentElement.scrollWidth<=innerWidth');shot('20261012-multi-campus-detail-'+lang);record('mobile-'+lang,True)
 # The main entrance loads the same implementation.
 c.width(1280,900);c.call('Page.navigate',{'url':base+'index.html?qa=multi-campus-125#projects/ft-transcendence-building-together'});time.sleep(2)
 record('entrance-controls',c.js("[...document.querySelectorAll('button')].filter(x=>x.offsetWidth&&x.innerText).map(x=>({id:x.id,text:x.innerText}))"))
finally:
 (out/'20261012-multi-campus-browser.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');c.close()
