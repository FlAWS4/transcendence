# Targeted, isolated Chrome QA. No user browser profile or production data.
from pathlib import Path
import hashlib, traceback
root=Path('site')
exec((root/'checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=root/'checks/20261013-comment-sort-style';out.mkdir(exist_ok=True)
base='http://127.0.0.1:8765/site/'
results=[];failure=None
source_names=['comments.mjs','comments.css','content-controls.mjs','content-controls.css','project-ui.mjs','tests/comments-actions.test.mjs']
def hashes():return {n:hashlib.sha256((root/n).read_bytes()).hexdigest() for n in source_names}
before=hashes();c=Chrome()
def record(name,value=True):
 results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def wait(js):
 deadline=time.time()+45
 while time.time()<deadline:
  if c.js(js):return
  time.sleep(.1)
 raise AssertionError('Timeout: '+js)
def click(sel):
 pos=c.js('(()=>{const e=document.querySelector('+json.dumps(sel)+');if(!e)throw Error("Missing target");const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,hit:e.contains(document.elementFromPoint(x,y))}})()')
 assert pos.pop('hit'),(sel,pos,c.js('document.elementFromPoint('+str(pos['x'])+','+str(pos['y'])+')?.outerHTML'))
 for typ in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':typ,**pos,'button':'left','clickCount':1})
 time.sleep(.15)
def key(name):
 codes={'Escape':27,'Tab':9,'Enter':13,'ArrowDown':40,'ArrowUp':38,'Home':36,'End':35}
 for typ in ['keyDown','keyUp']:
  payload={'type':typ,'key':name,'code':name,'windowsVirtualKeyCode':codes[name]}
  if name=='Enter' and typ=='keyDown':payload['text']='\r'
  c.call('Input.dispatchKeyEvent',payload)
 time.sleep(.1)
def go(route):
 c.js('location.hash='+json.dumps(route));time.sleep(.4)
def shot(name):(out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def settings(locale,theme):
 click('#profile');click('[data-account-action=settings]');click('[data-account-locale='+locale+']');click('[data-account-theme='+theme+']');key('Escape')
 wait('!document.querySelector("#account-panel") || document.querySelector("#account-panel").hidden')
def css(selector):
 return c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+'),s=getComputedStyle(e);return Object.fromEntries(["color","backgroundColor","borderColor","borderRadius","borderWidth","fontSize","fontWeight","padding","minHeight","boxShadow","backdropFilter","gap","textAlign","lineHeight"].map(k=>[k,s[k]]))})()')
def rects():
 return c.js('(()=>{const e=document.querySelector(".cp-comments-sort"),p=document.querySelector("#project-comment-sort-menu"),r=e.getBoundingClientRect(),q=p.getBoundingClientRect();return {button:{x:r.x,y:r.y,width:r.width,height:r.height},panel:{x:q.x,y:q.y,right:q.right,bottom:q.bottom,width:q.width,height:q.height,scrollHeight:p.scrollHeight,clientHeight:p.clientHeight},labelDisplay:getComputedStyle(e.querySelector("span")).display,options:[...p.querySelectorAll("button")].map(x=>({value:x.dataset.value,text:x.textContent,checked:x.getAttribute("aria-checked")})),active:document.activeElement.dataset.value,overflow:document.documentElement.scrollWidth>innerWidth,errors:qaErrors}})()')
route='projects/minishell-under-the-prompt?tab=comments'
statekey='horizon-comments-demo-v1:project:minishell-under-the-prompt'
seed={'version':2,'sort':'newest','draft':'Brouillon conservé · مسودة','replyDrafts':{'qa-middle':{'text':'Réponse conservée','targetId':'qa-middle'}},'comments':[{'id':'qa-old','text':'Premier commentaire chronologique','created':1700000000000},{'id':'qa-middle','text':'Deuxième commentaire · préféré localement','created':1700001000000,'reaction':'like'},{'id':'qa-new','text':'Troisième commentaire chronologique','created':1700002000000}]}
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));if(!sessionStorage.getItem('+json.dumps(statekey)+'))sessionStorage.setItem('+json.dumps(statekey)+','+json.dumps(json.dumps(seed))+');'})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.width(1280,900);c.call('Page.navigate',{'url':base+'content-preview.html?qa=comment-sort#projects'})
 wait('Boolean(document.querySelector("#content-sort-button"))')
 for locale,theme,w,h in [('fr','light',1280,900),('fr','light',390,844),('ar','dark',320,640)]:
  c.width(w,h);go('projects');settings(locale,theme)
  # Project sort is the requested visual reference at this exact viewport/theme.
  c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':0,'y':0})
  c.js('document.activeElement.blur()');project_button=css('#content-sort-button')
  click('#content-sort-button');key('End');key('Home');project_panel=css('#content-sort-menu');project_option=css('#content-sort-menu button[role=menuitemradio]:last-of-type')
  shot('projects-'+locale+'-'+str(w));key('Escape')
  go(route);wait('Boolean(document.querySelector(".cp-comments-sort"))')
  c.js('document.querySelector(".cp-comments-toolbar").scrollIntoView({block:"center",behavior:"instant"})');time.sleep(.4)
  c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':0,'y':0});c.js('document.activeElement.blur()')
  comment_button=css('.cp-comments-sort')
  assert comment_button==project_button,{'buttonStyleDiff':{k:[project_button[k],v] for k,v in comment_button.items() if v!=project_button[k]},'locale':locale,'width':w}
  click('.cp-comments-sort');key('Home');r=rects()
  assert [x['value'] for x in r['options']]==['newest','oldest','popular'],r
  assert sum(x['checked']=='true' for x in r['options'])==1,r
  assert not r['overflow'] and not r['errors'],r
  assert r['panel']['x']>=0 and r['panel']['right']<=w and r['panel']['y']>=r['button']['y']+r['button']['height'] and r['panel']['bottom']<=h,r
  comment_panel=css('#project-comment-sort-menu');comment_option=css('#project-comment-sort-menu button[data-value=popular]')
  assert comment_panel==project_panel,{'panelStyleDiff':{k:[project_panel[k],v] for k,v in comment_panel.items() if v!=project_panel[k]}}
  # All unselected Project and Comment options share the same appearance.
  assert comment_option==project_option,{'optionStyleDiff':{k:[project_option[k],v] for k,v in comment_option.items() if v!=project_option[k]}}
  if w==320:assert r['labelDisplay']=='none' and r['button']['width']==44 and r['button']['height']==44,r
  record('shared-style-and-bounds-'+locale+'-'+str(w),r);shot('comments-'+locale+'-'+str(w))
  key('End');assert c.js('document.activeElement.dataset.value')=='popular';key('Enter')
  s=c.js('({expanded:document.querySelector(".cp-comments-sort").getAttribute("aria-expanded"),focused:document.activeElement.matches(".cp-comments-sort"),ids:[...document.querySelectorAll(".cp-comment-thread > .cp-comment")].map(x=>x.dataset.commentId),draft:document.querySelector(".cp-comments-form textarea").value,state:JSON.parse(sessionStorage.getItem('+json.dumps(statekey)+'))})')
  assert s['expanded']=='false' and s['focused'] and s['ids']==['qa-middle','qa-new','qa-old'],s
  assert s['draft']==seed['draft'] and s['state']['replyDrafts']==seed['replyDrafts'] and s['state']['sort']=='popular',s
  record('keyboard-sort-and-drafts-'+locale+'-'+str(w),s)
  key('ArrowUp');assert c.js('document.activeElement.dataset.value')=='popular';key('Home');key('ArrowDown');key('Enter')
  assert c.js('[...document.querySelectorAll(".cp-comment-thread > .cp-comment")].map(x=>x.dataset.commentId)')==['qa-old','qa-middle','qa-new']
  click('.cp-comments-sort');key('Escape');assert c.js('document.activeElement.matches(".cp-comments-sort") && document.querySelector(".cp-comments-sort").getAttribute("aria-expanded")==="false"')
  click('.cp-comments-sort');click('.cp-comments-sort-label');assert c.js('document.querySelector(".cp-comments-sort").getAttribute("aria-expanded")==="false"')
  record('oldest-escape-outside-'+locale+'-'+str(w))
  c.call('Page.reload');wait('Boolean(document.querySelector(".cp-comments-sort"))')
  assert c.js('document.querySelector(".cp-comments-form textarea").value')==seed['draft']
  assert c.js('document.querySelector(".cp-comments-sort").title').endswith(c.js('document.querySelector("#project-comment-sort-menu [data-value=oldest]").textContent'))
  assert c.js('[...document.querySelectorAll(".cp-comment-thread > .cp-comment")].map(x=>x.dataset.commentId)')==['qa-old','qa-middle','qa-new']
  record('reload-persists-'+locale+'-'+str(w))
 record('source-fingerprints-stable',before==hashes());assert before==hashes()
 record('loaded-module-and-css-urls',c.js('performance.getEntriesByType("resource").map(x=>x.name).filter(x=>/comments\\.(mjs|css)|content-controls\\.(mjs|css)|project-ui\\.mjs/.test(x))'))
except Exception as e:
 failure=str(e);shot('failure');traceback.print_exc()
finally:
 (out/'browser-results.json').write_text(json.dumps({'passed':failure is None,'observations':results,'failure':failure,'fingerprintsBefore':before,'fingerprintsAfter':hashes(),'limitations':['Isolated desktop Chrome with viewport emulation; no physical phone or screen reader.','Reduced motion; integrated globe import intentionally blocked to isolate content sorting.','Only the local isolated comment session is seeded; no real publication.']},ensure_ascii=False,indent=2)+'\n');c.close()
if failure:raise SystemExit(1)
