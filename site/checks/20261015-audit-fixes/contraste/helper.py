# Vérification du 15 octobre 2026, zone « contraste » (D3) — aides partagées.
# Classe Chrome copiée de checks/20261012-multi-campus-browser.py (CDP par pipe),
# avec tous les chemins de sortie déplacés : preuves dans ce dossier, fichiers
# temporaires (journal Chrome, instantanés volumineux) dans le scratchpad.
# Rien ici n'écrit dans les sources, les tests, les documents ou les archives.
import os, subprocess, json, select, time, tempfile, base64, shutil, hashlib
from pathlib import Path
EVID=Path('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/contraste')
TMP=Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/verif-contraste')
SHOTS=EVID/'captures'
for folder in (EVID,TMP,SHOTS):folder.mkdir(parents=True,exist_ok=True)
BASE='http://127.0.0.1:8765/site/'
PREFIX={'145':'','144':'archive/pre-codex-audit-fixes-20261015/baseline/'}
REPO=Path('/home/le-rif/Bureau/Transcendence/site')
WATCH=['entrance.css','entrance.mjs','account-menu.css','account-menu.mjs','welcome.css','welcome.mjs','index.html','content-preview.html','content-preview.mjs','comments.mjs','project-ui.mjs','journal-ui.mjs']
QA_ERRORS='window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)))'
def hashes():
 out={}
 for name in WATCH:
  for label,root in (('145',REPO),('144',REPO/PREFIX['144'])):
   path=root/name
   out[label+':'+name]=hashlib.sha256(path.read_bytes()).hexdigest() if path.exists() else None
 return out
class Chrome:
 def __init__(self):
  self.profile=tempfile.mkdtemp(prefix='horizon-verif-contraste-')
  self.proc=subprocess.Popen(['bash','-c','exec 3<&0 4>&1; exec /usr/bin/google-chrome --headless=new --remote-debugging-pipe --no-first-run --no-default-browser-check --disable-background-networking --disable-sync --disable-dev-shm-usage --user-data-dir="$1" about:blank','horizon-qa',self.profile],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=open(TMP/'chrome-stderr.log','a'))
  self.seq=0;self.buf=b'';self.session=None
  target=self.call('Target.createTarget',{'url':'about:blank'})['targetId']
  self.session=self.call('Target.attachToTarget',{'targetId':target,'flatten':True})['sessionId']
  self.call('Page.enable')
  self.call('Page.bringToFront')
  self.call('Emulation.setFocusEmulationEnabled',{'enabled':True})
 def call(self,method,params=None,timeout=20):
  self.seq+=1; req={'id':self.seq,'method':method,'params':params or {}}
  if self.session:req['sessionId']=self.session
  self.proc.stdin.write(json.dumps(req).encode()+b'\0');self.proc.stdin.flush()
  deadline=time.time()+timeout
  while time.time()<deadline:
   if b'\0' not in self.buf:
    if not select.select([self.proc.stdout],[],[],1)[0]:continue
    data=os.read(self.proc.stdout.fileno(),1048576)
    if not data:raise RuntimeError('Chrome pipe closed; see chrome-stderr.log')
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
 def close(self):
  try:self.call('Browser.close')
  finally:self.proc.wait(timeout=10)
def cleanup(c):
 try:c.close()
 except Exception as error:print('close error',error,flush=True)
 finally:shutil.rmtree(c.profile,ignore_errors=True)
# Couleurs et propriétés de rendu relevées sur chaque élément pour la non-régression.
SNAP_PROPS=['color','background-color','background-image','border-top-color','border-right-color','border-bottom-color','border-left-color','outline-color','outline-style','outline-width','outline-offset','box-shadow','text-shadow','fill','stroke','opacity','filter','backdrop-filter','text-decoration-color','caret-color','accent-color','visibility','display','mix-blend-mode']
SNAP_JS='(()=>{const P='+json.dumps(SNAP_PROPS)+';const path=e=>{const parts=[];while(e&&e.nodeType===1&&e!==document.documentElement){let i=0,s=e;while((s=s.previousElementSibling))i++;parts.push(e.tagName.toLowerCase()+(e.id?"#"+e.id:"")+"["+i+"]");e=e.parentElement;}return parts.reverse().join(">");};const items=[];for(const e of document.querySelectorAll("*")){const s=getComputedStyle(e);items.push([path(e),P.map(p=>s.getPropertyValue(p)).join("|")]);}return{props:P,count:items.length,items};})()'
def make(c):
 def wait(expression,seconds=25):
  end=time.time()+seconds
  while time.time()<end:
   value=c.js(expression)
   if value:return value
   time.sleep(.1)
  raise AssertionError('wait timeout: '+expression)
 def centre(selector):
  return c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');if(!e)throw Error("Missing target '+selector+'");e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error("Hidden target '+selector+'");return{x:r.x+r.width/2,y:r.y+r.height/2}})()')
 def click(selector):
  pos=centre(selector)
  for kind in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':kind,**pos,'button':'left','clickCount':1})
  time.sleep(.15)
 def point(x,y):
  for kind in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':kind,'x':x,'y':y,'button':'left','clickCount':1})
  time.sleep(.15)
 def hover(selector,settle=.45):
  pos=centre(selector);c.call('Input.dispatchMouseEvent',{'type':'mouseMoved',**pos});time.sleep(settle);return pos
 def away():
  c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':2,'y':2});time.sleep(.3)
 def key(name,modifiers=0):
  codes={'Escape':27,'Tab':9,'Enter':13,' ':32}
  for kind in ['keyDown','keyUp']:c.call('Input.dispatchKeyEvent',{'type':kind,'key':name,'code':'Space' if name==' ' else name,'windowsVirtualKeyCode':codes[name],'modifiers':modifiers})
  time.sleep(.15)
 def shot(name,clip=None):
  params={'format':'png'}
  if clip:params['clip']={'x':max(0,clip[0]),'y':max(0,clip[1]),'width':clip[2],'height':clip[3],'scale':1}
  path=SHOTS/(name+'.png');path.write_bytes(base64.b64decode(c.call('Page.captureScreenshot',params)['data']));return str(path)
 def computed(selector):
  """Toutes les propriétés calculées énumérées par Chrome, la boîte et l'état de l'élément."""
  return c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');if(!e)return null;const s=getComputedStyle(e),r=e.getBoundingClientRect();const all={};for(const k of s)all[k]=s.getPropertyValue(k);return{rect:{x:r.x,y:r.y,width:r.width,height:r.height},text:e.textContent.trim(),className:String(e.className),lang:e.getAttribute("lang"),hover:e.matches(":hover"),focus:e.matches(":focus"),focusVisible:e.matches(":focus-visible"),style:all}})()')
 def brief(selector):
  return c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');if(!e)return null;const s=getComputedStyle(e),r=e.getBoundingClientRect();return{width:r.width,height:r.height,x:r.x,y:r.y,hover:e.matches(":hover"),focusVisible:e.matches(":focus-visible"),...Object.fromEntries(["backgroundColor","color","borderColor","borderWidth","borderRadius","boxShadow","outlineColor","outlineStyle","outlineWidth","outlineOffset","transform","opacity"].map(k=>[k,s[k]]))}})()')
 def settings(locale,theme):
  click('#profile');click('[data-account-action=settings]');click('[data-account-locale='+locale+']');click('[data-account-theme='+theme+']');click('[data-account-action=back]')
  c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':2,'y':2});time.sleep(.25)
 def theme():return c.js('document.documentElement.dataset.theme')
 def lang():return c.js('document.documentElement.lang')
 def errors():return c.js('window.qaErrors||[]')
 def tokens(names):
  return c.js('(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries('+json.dumps(names)+'.map(n=>[n,s.getPropertyValue(n).trim()]))})()')
 def geometry(selector):
  """Boîte du bouton, boîte du texte (Range) et défilement, en pixels CSS de la fenêtre."""
  return c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');if(!e)return null;const g=document.createRange();g.selectNodeContents(e);const t=g.getBoundingClientRect(),b=e.getBoundingClientRect(),s=getComputedStyle(e);return{text:{x:t.x,y:t.y,w:t.width,h:t.height},box:{x:b.x,y:b.y,w:b.width,h:b.height},radius:s.borderTopLeftRadius,backgroundColor:s.backgroundColor,color:s.color,scroll:[scrollX,scrollY],label:e.textContent.trim()}})()')
 def pair(selector,tag,clip):
  """Même image deux fois : normale, puis avec le seul texte de l'élément rendu transparent."""
  g=geometry(selector)
  normal=shot(tag+'-normal',clip)
  c.js('document.querySelector('+json.dumps(selector)+').style.setProperty("color","transparent","important")');time.sleep(.2)
  g['transparentCheck']=c.js('getComputedStyle(document.querySelector('+json.dumps(selector)+')).color')
  blank=shot(tag+'-sans-texte',clip)
  c.js('document.querySelector('+json.dumps(selector)+').style.removeProperty("color")');time.sleep(.1)
  g['restoredColor']=c.js('getComputedStyle(document.querySelector('+json.dumps(selector)+')).color')
  g['geometryAfter']=geometry(selector)
  return {'clip':[max(0,clip[0]),max(0,clip[1]),clip[2],clip[3]],'normal':normal,'blank':blank,**g}
 def menu_clip():
  m=brief('#account-menu')
  return (m['x']-12,m['y']-12,m['width']+24,min(m['height']+24,860))
 def snapshot():return c.js(SNAP_JS)
 def focus_info():
  return c.js('(()=>{const e=document.activeElement,s=getComputedStyle(e),r=e.getBoundingClientRect();return{id:e.id||null,action:(e.dataset&&e.dataset.accountAction)||null,tag:e.tagName,visible:e.matches(":focus-visible"),outlineColor:s.outlineColor,outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth,outlineOffset:s.outlineOffset,backgroundColor:s.backgroundColor,color:s.color,rect:{x:r.x,y:r.y,w:r.width,h:r.height}}})()')
 def tab_to(predicate_js,limit=8):
  for i in range(limit):
   key('Tab')
   if c.js(predicate_js):return i+1
  raise AssertionError('focus never reached: '+predicate_js)
 return dict(wait=wait,centre=centre,click=click,point=point,hover=hover,away=away,key=key,shot=shot,computed=computed,brief=brief,settings=settings,theme=theme,lang=lang,errors=errors,tokens=tokens,geometry=geometry,pair=pair,menu_clip=menu_clip,snapshot=snapshot,focus_info=focus_info,tab_to=tab_to)
def save(name,payload,folder=EVID):
 path=folder/(name+'.json');path.write_text(json.dumps(payload,ensure_ascii=False,indent=1)+'\n')
 print('saved',path,flush=True);return str(path)
