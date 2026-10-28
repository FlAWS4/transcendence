# Run from repository root with Chrome and local server 8765.
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
  deadline=time.time()+45
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
out=Path('site/checks');base='http://127.0.0.1:8765/site/'
c=Chrome();results={}
try:
 c.width(1280,900);c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]});results['reducedMotion']=True;c.call('Page.navigate',{'url':base+'index.html?qa=multi-campus-125#projects/ft-transcendence-building-together'});time.sleep(2)
 c.js("document.querySelector('#entry-guest').click()");time.sleep(3)
 for attempt in range(20):
  if c.js("Boolean(document.querySelector('#project-detail .cp-project-campus'))"):break
  time.sleep(1)
 results['mainState']=c.js("({body:document.body.innerText.slice(0,2000),data:document.querySelector('#app')?.dataset})")
 results['mainVisitor']=c.js("({route:location.hash,visible:!document.querySelector('#project-detail').hidden,text:document.querySelector('.cp-project-facts')?.innerText,explore:document.querySelector('.cp-project-campus')?.innerText,entrance:document.querySelector('#entry-guest')?.offsetWidth||0})")
 assert results['mainVisitor']['visible'] and results['mainVisitor']['explore']=='Explorer un campus' and not results['mainVisitor']['entrance'],results
 c.js("location.hash='people/profile-leila-mansour?tab=projects&country=JPN&campus=tokyo'");time.sleep(.8)
 results['profileCards']=c.js("[...document.querySelectorAll('.cp-profile-related-card .cp-project-campus-names')].map(x=>x.textContent)")
 assert '42 Paris · 42 Lyon · 42 Tokyo · 42 Rio' in results['profileCards']
 (out/'20261012-multi-campus-profile.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
 c.js("[...document.querySelectorAll('.cp-profile-related-link')].find(x=>x.href.includes('ft-transcendence-building-together')).click()");time.sleep(.6)
 results['fromProfile']=c.js('location.hash');assert 'campus=tokyo' in results['fromProfile']
 c.js("location.hash='projects/minishell-under-the-prompt'");time.sleep(.5)
 results['singleCampus']=c.js("({text:document.querySelector('#project-detail .cp-project-campus')?.innerText,title:document.querySelector('#project-detail').innerText})")
 assert results['singleCampus']['text']=='Explorer 42 Paris'
 c.js("document.querySelector('#project-detail .cp-project-campus').click()");time.sleep(.4)
 results['singleMap']=c.js("({open:document.querySelector('#campus-map-dialog').open,name:document.querySelector('#campus-map-name').innerText,choices:document.querySelectorAll('.cp-project-campus-dialog').length})")
 assert results['singleMap']['open'] and results['singleMap']['name']=='42 Paris' and results['singleMap']['choices']==0
 print(json.dumps(results,ensure_ascii=False))
finally:
 (out/'20261012-multi-campus-main-browser.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');c.close()
