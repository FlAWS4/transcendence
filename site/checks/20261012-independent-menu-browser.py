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

# Standalone CDP-pipe replay of the 12 October local-menu regression.
# Chrome helper copied from /tmp/horizon-dock-qa.py; no package install required.
from pathlib import Path
import hashlib, argparse
ROOT=Path(__file__).resolve().parents[2]
CHECKS=Path(__file__).resolve().parent
BASE='http://127.0.0.1:8765/site/'
ARCHIVE='archive/pre-multi-campus-projects-20261012/preview.html'
ACTIVE='content-preview.html'
RESULT={'viewport':{'width':960,'height':640},'method':'Chrome headless, CDP pipe; DOM activation for out-of-view section links and native pointer/wheel for menu arrows and scrolling.','cases':[]}
WATCH=r"""(()=>{
 const shell=document.querySelector('.dock-shell'),menu=document.querySelector('[data-detail-scroll=menu]');
 window.__menuQA={startY:scrollY,startMenu:menu?.scrollTop||0,maxY:scrollY,minY:scrollY,maxMenu:menu?.scrollTop||0,minMenu:menu?.scrollTop||0,scrollingObserved:false,minButtonOpacity:1,dockChanges:[],scrollTargets:[]};
 const q=window.__menuQA;
 window.__menuObserver?.disconnect();
 window.__menuObserver=new MutationObserver(()=>{const state=shell.dataset.documentScrolling==='true';q.scrollingObserved ||= state;q.dockChanges.push({t:Math.round(performance.now()),state});});
 window.__menuObserver.observe(shell,{attributes:true,attributeFilter:['data-document-scrolling']});
 const scroll=e=>{const item={target:e.target===document?'document':e.target.id||e.target.tagName,y:scrollY,top:e.target.scrollTop||0};q.scrollTargets.push(item);};
 document.addEventListener('scroll',scroll,true);
 q.startedAt=performance.now();
 const frame=()=>{
  const menu=document.querySelector('[data-detail-scroll=menu]'),button=document.querySelector('#main-nav>button[data-section]');
  q.maxY=Math.max(q.maxY,scrollY);q.minY=Math.min(q.minY,scrollY);
  q.maxMenu=Math.max(q.maxMenu,menu?.scrollTop||0);q.minMenu=Math.min(q.minMenu,menu?.scrollTop||0);
  q.scrollingObserved ||= shell.dataset.documentScrolling==='true';
  q.minButtonOpacity=Math.min(q.minButtonOpacity,Number(getComputedStyle(button).opacity));
  if(!q.stop)requestAnimationFrame(frame);else{document.removeEventListener('scroll',scroll,true);q.done=true;}
 };
 requestAnimationFrame(frame);
})()"""
STATE=r"""(()=>{const menu=document.querySelector('[data-detail-scroll=menu]'),shell=document.querySelector('.dock-shell');return {url:location.href,scrollY,documentScrolling:shell.dataset.documentScrolling==='true',menu:{top:menu?.scrollTop,height:menu?.clientHeight,scrollHeight:menu?.scrollHeight,selected:menu?.querySelector('[aria-current=page]')?.textContent},title:document.querySelector('#project-detail:not([hidden]) h1,#profile-detail:not([hidden]) h1,#journal-detail:not([hidden]) h1')?.textContent,meta:document.querySelector('#project-detail:not([hidden]) .cp-meta')?.textContent,qa:window.__menuQA};})()"""
def wait_ready(c,kind):
 deadline=time.time()+10
 while time.time()<deadline:
  if c.js(f"!!document.querySelector('#{kind}-detail [data-detail-scroll=menu]')"):break
  time.sleep(.1)
 else:raise AssertionError('Detail menu did not mount')
 time.sleep(.7)
def load(c,entry,hash,kind):
 c.call('Page.navigate',{'url':BASE+entry+'?independent-menu-check=20261012&case='+str(time.time_ns())+'#'+hash})
 wait_ready(c,kind)
def pointer(c,selector):
 box=c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');if(!e||e.hidden)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height};})()')
 if not box or not box['w'] or not box['h']:raise AssertionError('No visible target '+selector)
 c.call('Input.dispatchMouseEvent',{'type':'mousePressed','x':box['x'],'y':box['y'],'button':'left','clickCount':1})
 c.call('Input.dispatchMouseEvent',{'type':'mouseReleased','x':box['x'],'y':box['y'],'button':'left','clickCount':1})
def wheel(c,selector,delta):
 box=c.js('(()=>{const r=document.querySelector('+json.dumps(selector)+').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()')
 c.call('Input.dispatchMouseEvent',{'type':'mouseMoved',**box})
 c.call('Input.dispatchMouseEvent',{'type':'mouseWheel',**box,'deltaX':0,'deltaY':delta})
def take(c,name):
 data=c.call('Page.captureScreenshot',{'format':'png'})['data']
 (CHECKS/(name+'.png')).write_bytes(base64.b64decode(data))
def action(c,name,fn,expect_fade=False,expect_menu=False,screenshot=False):
 c.js(WATCH);fn()
 time.sleep(.22)
 if screenshot:take(c,'20261012-independent-menu-'+name)
 time.sleep(1.1)
 c.js('window.__menuQA.stop=true');time.sleep(.05)
 state=c.js(STATE)
 state['name']=name;state['expectedDocumentFade']=expect_fade
 errors=[]
 if state['qa']['scrollingObserved']!=expect_fade:errors.append('Unexpected dock documentScrolling state')
 if not expect_fade and state['qa']['maxY']!=state['qa']['minY']:errors.append('Local action moved the document')
 if not expect_fade and state['qa']['minButtonOpacity']<.99:errors.append('Local action faded main menu')
 if expect_menu and state['qa']['maxMenu']==state['qa']['minMenu']:errors.append('Menu did not scroll')
 state['errors']=errors;state['pass']=not errors
 RESULT['cases'].append(state)
 print(name,'PASS' if not errors else errors,flush=True)
 return state

def main():
 c=Chrome()
 try:
  c.width(960,640)
  project='projects/ft-transcendence-building-together'
  load(c,ARCHIVE,project,'project')
  baseline=c.js(STATE)
  RESULT['archiveInitial']=baseline
  RESULT['archiveIcons']=c.js("[...document.querySelectorAll('#profile use,#main-nav>button[data-section] use')].map(e=>({href:e.getAttribute('href'),width:e.getBBox().width,height:e.getBBox().height}))")
  assert all(i['width']>0 and i['height']>0 and i['href'].startswith(baseline['url'].split('#')[0]+'#') for i in RESULT['archiveIcons'])
  state=action(c,'archive-project-comment-click',lambda:c.js("document.querySelector('[data-project-section-link=comments]').click()"),expect_fade=True,expect_menu=True,screenshot=True)
  assert '/archive/pre-multi-campus-projects-20261012/preview.html?' in state['url']
  assert 'tab=comments' in state['url']
  RESULT['archiveData']=c.js("import('./archive/pre-multi-campus-projects-20261012/runtime/content-preview-data.mjs').then(m=>{const p=m.previewEntries.find(e=>e.id==='ft-transcendence-building-together');return {campus:p.campus,campuses:p.campuses??null}})")
  assert RESULT['archiveData']=={'campus':'paris','campuses':None}
  variants=[('project',project,'comments'),('profile','people/profile-leila-mansour','contribution'),('journal','journal/journal-an-evening-debugging','comments')]
  for kind,route,last in variants:
   load(c,ACTIVE,route,kind)
   select=f'[data-{kind}-section-link={last}]'
   action(c,kind+'-section-click',lambda:c.js('document.querySelector('+json.dumps(select)+').click()'),expect_menu=True,screenshot=kind=='project')
   c.js("document.querySelector('[data-detail-scroll=menu]').scrollTop=0");time.sleep(.6)
   action(c,kind+'-selected-section-reclick',lambda:c.js('document.querySelector('+json.dumps(select)+').click()'),expect_menu=True)
   menu='[data-detail-scroll=menu]'
   action(c,kind+'-arrow-up',lambda:pointer(c,'.cp-detail-menu-arrow[data-direction=up]'),expect_menu=True)
   action(c,kind+'-wheel-down',lambda:wheel(c,menu,120),expect_menu=True)
   action(c,kind+'-wheel-boundary',lambda:wheel(c,menu,300),expect_menu=False)
  load(c,ACTIVE,project,'project')
  action(c,'document-reading-wheel',lambda:wheel(c,'.cp-project-reading-pane',300),expect_fade=True,screenshot=True)
  # The archive's route and data semantics also survive normal left-menu navigation.
  load(c,ARCHIVE,project+'?tab=comments','project')
  pointer(c,'.cp-detail-menu-arrow[data-direction=down]') if c.js("!document.querySelector('.cp-detail-menu-arrow[data-direction=down]').hidden") else None
  c.js("document.querySelector('[data-project-section-link=overview]').click()")
  time.sleep(.7)
  RESULT['archiveAfterNavigation']=c.js(STATE)
  assert '/archive/pre-multi-campus-projects-20261012/preview.html?' in RESULT['archiveAfterNavigation']['url']
  assert '?independent-menu-check=20261012&case=' in RESULT['archiveAfterNavigation']['url']
  take(c,'20261012-independent-menu-archive-overview')
 finally:
  c.close()
  source=ROOT/'site'
  RESULT['sourceHashes']={name:hashlib.sha256((source/name).read_bytes()).hexdigest() for name in ['welcome.mjs','dock-search.mjs','detail-scroll.mjs','content-preview.html']}
  RESULT['passed']=sum(item['pass'] for item in RESULT['cases']);RESULT['failed']=sum(not item['pass'] for item in RESULT['cases'])
  (CHECKS/'20261012-independent-menu-results.json').write_text(json.dumps(RESULT,ensure_ascii=False,indent=2)+'\n')
 if RESULT['failed']:raise SystemExit(str(RESULT['failed'])+' checks failed')
if __name__=='__main__':main()
