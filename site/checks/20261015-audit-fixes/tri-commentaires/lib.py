# Bibliothèque commune des bancs « tri des commentaires » (D2), 15 octobre 2026.
# Lecture seule : aucune écriture dans les sources ; sorties uniquement dans OUT (preuves)
# et TMP (journal stderr de Chrome). Chargée par exec() depuis chaque script (python3 -I).
# Classe Chrome recopiée de checks/20261012-multi-campus-browser.py (avant 'from pathlib import Path'),
# avec le journal stderr déplacé dans TMP.
import os, subprocess, json, select, time, tempfile, base64, shutil, hashlib, sys, traceback
from pathlib import Path
OUT=Path('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires')
TMP=Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/verif-tri-commentaires')
OUT.mkdir(parents=True,exist_ok=True);TMP.mkdir(parents=True,exist_ok=True)
REPO=Path('/home/le-rif/Bureau/Transcendence/site')
ARCH=REPO/'archive/pre-codex-audit-fixes-20261015/baseline'
BASES={'145':'http://127.0.0.1:8765/site/','144':'http://127.0.0.1:8765/archives/site-versions/pre-codex-audit-fixes-20261015/baseline/'}
PREFIX={'145':'horizon-','144':'horizon-archive-pre-codex-audit-fixes-20261015-'}
START=time.time()
class Chrome:
 def __init__(self):
  self.profile=tempfile.mkdtemp(prefix='horizon-verif-tri-')
  self.proc=subprocess.Popen(['bash','-c','exec 3<&0 4>&1; exec /usr/bin/google-chrome --headless=new --remote-debugging-pipe --no-first-run --no-default-browser-check --disable-background-networking --disable-sync --disable-dev-shm-usage --user-data-dir="$1" about:blank','horizon-qa',self.profile],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=open(TMP/'chrome-stderr.log','a'))
  self.seq=0;self.buf=b'';self.session=None
  target=self.call('Target.createTarget',{'url':'about:blank'})['targetId']
  self.session=self.call('Target.attachToTarget',{'targetId':target,'flatten':True})['sessionId']
  self.call('Page.enable');self.call('Page.bringToFront');self.call('Emulation.setFocusEmulationEnabled',{'enabled':True})
 def call(self,method,params=None):
  self.seq+=1;req={'id':self.seq,'method':method,'params':params or {}}
  if self.session:req['sessionId']=self.session
  self.proc.stdin.write(json.dumps(req).encode()+b'\0');self.proc.stdin.flush()
  deadline=time.time()+20
  while time.time()<deadline:
   if b'\0' not in self.buf:
    if not select.select([self.proc.stdout],[],[],1)[0]:continue
    data=os.read(self.proc.stdout.fileno(),1048576)
    if not data:raise RuntimeError('Chrome pipe closed')
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
  if 'exceptionDetails' in res:raise RuntimeError(json.dumps(res['exceptionDetails'])[:700])
  return res['result'].get('value')
 def width(self,w,h=800):self.call('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False})
 def close(self):
  try:self.call('Browser.close')
  finally:self.proc.wait(timeout=10)

# Sources dont l'empreinte doit rester stable pendant les bancs (actif et archive).
SOURCES=['comments.mjs','comments.css','content-controls.mjs','content-controls.css','project-ui.mjs','journal-ui.mjs','back-to-top.css','back-to-top.mjs','dock-search.css','content-preview.html','content-preview.mjs','welcome.mjs']
def hashes():
 return {'145':{n:hashlib.sha256((REPO/n).read_bytes()).hexdigest() for n in SOURCES},'144':{n:hashlib.sha256((ARCH/n).read_bytes()).hexdigest() for n in SOURCES}}

ROUTES={'project':'projects/minishell-under-the-prompt?tab=comments','journal':'journal/journal-an-evening-debugging?tab=comments','transcendence':'projects/ft-transcendence-building-together?tab=comments'}
ENTRY={'project':('project','minishell-under-the-prompt'),'journal':('journal','journal-an-evening-debugging'),'transcendence':('project','ft-transcendence-building-together')}
# Graine du banc du 14 octobre (browser.py) : trois commentaires, brouillon principal et brouillon de réponse,
# complétée de cinq commentaires plus anciens pour donner assez de page sous la barre de tri
# (positions « bouton juste sous l'en-tête »). Graine identique dans 144 et 145.
SEED={'version':2,'sort':'newest','draft':'Brouillon conservé · مسودة','replyDrafts':{'qa-middle':{'text':'Réponse conservée','targetId':'qa-middle'}},
 'comments':[{'id':'qa-old','text':'Premier commentaire chronologique','created':1700000000000},{'id':'qa-middle','text':'Deuxième commentaire · préféré localement','created':1700001000000,'reaction':'like'},{'id':'qa-new','text':'Troisième commentaire chronologique','created':1700002000000}]
 +[{'id':'qa-extra-'+str(i),'text':'Commentaire de remplissage '+str(i)+' pour allonger la discussion.','created':1690000000000+i*1000000} for i in range(1,6)]}
def seed_script():
 s='window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));'
 for state,prefix in PREFIX.items():
  for kind,eid in ENTRY.values():
   k=prefix+'comments-demo-v1:'+kind+':'+eid
   s+='if(!sessionStorage.getItem('+json.dumps(k)+'))sessionStorage.setItem('+json.dumps(k)+','+json.dumps(json.dumps(SEED))+');'
 return s

LIB=r'''
window.__v=(()=>{
 const N=v=>Math.round(v*100)/100;
 const R=r=>r?{x:N(r.x??r.left),y:N(r.y??r.top),w:N(r.width??r.w),h:N(r.height??r.h),right:N(r.right),bottom:N(r.bottom)}:null;
 const vis=e=>{if(!e||e.closest('[hidden]'))return null;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display==='none'||s.visibility==='hidden'||!r.width||!r.height?null:r;};
 const name=h=>h?((h.id?'#'+h.id:'')+'<'+h.tagName.toLowerCase()+'>'+(typeof h.className==='string'&&h.className.trim()?'.'+h.className.trim().split(/\s+/).join('.'):'')):null;
 const inter=(a,b)=>{if(!a||!b)return null;const w=Math.min(a.right,b.right)-Math.max(a.x,b.x),h=Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y);return w>0.01&&h>0.01?{w:N(w),h:N(h)}:null;};
 const api={
  vis,name,inter,R,
  button(){return [...document.querySelectorAll('.cp-comments-sort')].find(e=>!e.closest('[hidden]'))||null;},
  panel(){const b=this.button();return b?document.getElementById(b.getAttribute('aria-controls')):null;},
  dots(){return [...document.querySelectorAll('.cp-comment-menu-toggle')].find(e=>!e.closest('[hidden]')&&!e.disabled)||null;},
  floating(){
   const q=s=>{for(const e of document.querySelectorAll(s)){const r=vis(e);if(r)return r;}return null;};
   // 'switch' : sélecteur de section des détails, collant (sticky, z-index 5) sous l'en-tête en mobile.
   return {search:R(q('.dock-search-toggle')),nav:R(q('#main-nav')),btt:R(q('#back-to-top')),header:R(q('.app > .header')),scope:R(q('#scope-bar')),random:R(q('.dock-random-toggle')),shell:R(q('.dock-shell')),switch:R(q('.cp-project-section-switch'))};
  },
  // Limite basse au sens de la consigne : haut de la capsule de recherche, ou du bouton « remonter » s'il est visible.
  limit(){const f=this.floating();const tops=[f.search?.y,f.btt?.y].filter(v=>v!=null);return tops.length?Math.min(...tops):innerHeight;},
  // Limites recalculées comme comments.mjs 145 (tri) et 144 / menus d'actions (sans le bouton « remonter »).
  limits(){
   const f=this.floating(),vv=visualViewport,vt=vv?.offsetTop||0,vh=vv?.height||document.documentElement.clientHeight;
   const top=Math.max(vt+8,...[f.header,f.scope].filter(Boolean).map(r=>r.bottom+8));
   const base=Math.min(vt+vh-8,...[f.search,f.nav].filter(Boolean).map(r=>r.y-8));
   return {top,bottom144:base,bottom145:f.btt?Math.min(base,f.btt.y-8):base,audit:base};
  },
  docY(el){const r=el.getBoundingClientRect();return r.top+scrollY;},
  maxScroll(){return document.scrollingElement.scrollHeight-innerHeight;},
  scrollTo(y){window.scrollTo({top:y,behavior:'instant'});return scrollY;},
  placeTop(el,targetTop){const r=el.getBoundingClientRect();const want=scrollY+r.top-targetTop;window.scrollTo({top:want,behavior:'instant'});return {want:N(want),got:N(scrollY),top:N(el.getBoundingClientRect().top),max:N(this.maxScroll())};},
  clickPoint(el){
   const r=el.getBoundingClientRect();
   const pts=[[.5,.5],[.35,.5],[.65,.5],[.5,.3],[.5,.7],[.2,.5],[.8,.5],[.5,.15],[.5,.85],[.25,.25],[.75,.25],[.25,.75],[.75,.75],[.1,.5],[.9,.5],[.5,.06],[.5,.94]];
   for(const [fx,fy] of pts){const x=r.left+r.width*fx,y=r.top+r.height*fy;if(x<1||y<1||x>=innerWidth-1||y>=innerHeight-1)continue;const h=document.elementFromPoint(x,y);if(h&&el.contains(h))return {x:N(x),y:N(y),fx,fy};}
   return null;
  },
  coverOf(el){ // part of an element covered by another element (hit-test grid)
   const r=el.getBoundingClientRect(),hits={};let n=0,covered=0;
   for(let i=0;i<9;i++)for(let j=0;j<5;j++){const x=r.left+r.width*(i+.5)/9,y=r.top+r.height*(j+.5)/5;if(x<0||y<0||x>=innerWidth||y>=innerHeight)continue;n++;const h=document.elementFromPoint(x,y);if(!h||!el.contains(h)){covered++;const k=name(h);hits[k]=(hits[k]||0)+1;}}
   return {samples:n,covered,hits};
  },
  menuInfo(trigger,panel){
   if(!trigger||!panel)return null;
   const br=trigger.getBoundingClientRect(),pr=panel.getBoundingClientRect(),cs=getComputedStyle(panel);
   const visTop=pr.top+parseFloat(cs.borderTopWidth),visBottom=pr.bottom-parseFloat(cs.borderBottomWidth);
   const f=this.floating();
   const options=[...panel.querySelectorAll('[role^=menuitem]')].map(o=>{
    const q=o.getBoundingClientRect();const top=Math.max(q.top,visTop,0),bottom=Math.min(q.bottom,visBottom,innerHeight);
    const covered=bottom>top?[.04,.25,.5,.75,.96].flatMap(fx=>[.15,.5,.85].map(fy=>{const x=q.left+q.width*fx,y=top+(bottom-top)*fy;const h=document.elementFromPoint(x,y);return h&&panel.contains(h)?null:{x:Math.round(x),y:Math.round(y),hit:name(h)};})).filter(Boolean):[];
    return {value:o.dataset.value||o.dataset.commentAction,checked:o.getAttribute('aria-checked'),focused:document.activeElement===o,top:N(q.top),bottom:N(q.bottom),h:N(q.height),visiblePx:N(Math.max(0,bottom-top)),fully:q.top>=visTop-.5&&q.bottom<=visBottom+.5&&q.top>=-.5&&q.bottom<=innerHeight+.5,covered};
   });
   const P=R(pr),B=R(br);
   const btt=document.getElementById('back-to-top');
   return {hidden:panel.hidden,expanded:trigger.getAttribute('aria-expanded'),button:B,panel:P,
    direction:pr.bottom<=br.top+.5?'above':pr.top>=br.bottom-.5?'below':'overlap',
    gap:N(pr.bottom<=br.top+.5?br.top-pr.bottom:pr.top-br.bottom),edgeOffset:N(getComputedStyle(trigger).direction==='rtl'||document.documentElement.dir==='rtl'?pr.left-br.left:pr.right-br.right),
    styleTop:panel.style.top,maxHeight:panel.style.maxHeight,scrollHeight:panel.scrollHeight,clientHeight:panel.clientHeight,scrollTop:N(panel.scrollTop),natural:panel.scrollHeight+parseFloat(cs.borderTopWidth)+parseFloat(cs.borderBottomWidth),
    options,floating:f,limits:this.limits(),
    overlap:{search:inter(P,f.search),nav:inter(P,f.nav),btt:inter(P,f.btt),header:inter(P,f.header),scope:inter(P,f.scope),random:inter(P,f.random),shell:inter(P,f.shell),switch:inter(P,f.switch)},
    bttState:btt?{hidden:btt.hidden,display:getComputedStyle(btt).display,opacity:getComputedStyle(btt).opacity,z:getComputedStyle(btt).zIndex,pointer:getComputedStyle(btt).pointerEvents}:null,
    panelZ:cs.zIndex,transform:cs.transform,opacity:cs.opacity,animation:cs.animationName,
    inViewport:pr.top>=-.5&&pr.bottom<=innerHeight+.5&&pr.left>=-.5&&pr.right<=innerWidth+.5,
    viewport:{w:innerWidth,h:innerHeight,scrollY:N(scrollY)},active:name(document.activeElement),activeValue:document.activeElement?.dataset?.value||null,
    shellScrolling:document.querySelector('.dock-shell')?.dataset.documentScrolling||null,errors:(window.qaErrors||[]).slice()};
  },
  info(){return this.menuInfo(this.button(),this.panel());},
  all(e){const s=getComputedStyle(e),o={};for(const k of s)o[k]=s.getPropertyValue(k);for(const k of ['border-color','border-radius','border-width','padding','gap','inset','translate','font','background','border'])o[k]=s.getPropertyValue(k);return o;},
  state(e){return {focus:e.matches(':focus'),focusVisible:e.matches(':focus-visible'),hover:e.matches(':hover'),expanded:e.getAttribute('aria-expanded'),checked:e.getAttribute('aria-checked')};},
  snapEl(e){return e?{rect:R(e.getBoundingClientRect()),state:this.state(e),css:this.all(e)}:null;},
 };
 return api;
})();true'''

results={'date':'2026-10-15','cases':[],'phaseErrors':[]}
def record(name,value,quiet=False):
 results['cases'].append({'case':name,'t':round(time.time()-START,1),'result':value})
 if not quiet:print(name,json.dumps(value,ensure_ascii=False)[:260],flush=True)

c=None
def lib():return c.js(LIB)
def wait(expr,seconds=20):
 end=time.time()+seconds
 while time.time()<end:
  try:
   v=c.js(expr)
   if v:return v
  except RuntimeError:pass
  time.sleep(.1)
 raise AssertionError('timeout '+expr)
def mouse_click(x,y):
 c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':x,'y':y})
 for t in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':t,'x':x,'y':y,'button':'left','clickCount':1})
def away():c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':2,'y':2});time.sleep(.15)
def click_sel(sel):
 pos=c.js('(()=>{const e=document.querySelector('+json.dumps(sel)+');return e?__v.clickPoint(e):null})()')
 assert pos,('cible absente ou couverte',sel)
 mouse_click(pos['x'],pos['y']);time.sleep(.2);return pos
CODES={'Escape':27,'Tab':9,'Enter':13,'ArrowDown':40,'ArrowUp':38,'Home':36,'End':35}
def key(name,pause=.15):
 for t in ['keyDown','keyUp']:
  p={'type':t,'key':name,'code':name,'windowsVirtualKeyCode':CODES[name]}
  if name=='Enter' and t=='keyDown':p['text']='\r'
  c.call('Input.dispatchKeyEvent',p)
 time.sleep(pause)
def shot(name,clip=None):
 params={'format':'png'}
 if clip:params['clip']={'x':max(0,clip[0]),'y':max(0,clip[1]),'width':clip[2],'height':clip[3],'scale':1}
 (OUT/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',params)['data']))
def start(reduced=True):
 global c
 c=Chrome()
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':seed_script()})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 if reduced:c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 else:c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'no-preference'}]})
 return c
def settings(locale,theme):
 click_sel('#profile');click_sel('[data-account-action=settings]');click_sel('[data-account-locale='+locale+']');click_sel('[data-account-theme='+theme+']');key('Escape')
 wait('!document.querySelector("#account-panel") || document.querySelector("#account-panel").hidden');away()
 return c.js('({lang:document.documentElement.lang,dir:document.documentElement.dir,theme:document.documentElement.dataset.theme})')
def open_route(state,route_key,w,h,locale,theme):
 """Chargement neuf d'un détail (un seul détail dans le DOM), puis réglages par le panneau du compte."""
 c.width(w,h);c.call('Page.navigate',{'url':BASES[state]+'content-preview.html?qa=verif-tri-'+state+'#'+ROUTES[route_key]})
 time.sleep(.6);wait('Boolean([...document.querySelectorAll(".cp-comments-sort")].find(e=>!e.closest("[hidden]")))',25);lib()
 s=settings(locale,theme);lib()
 wait('Boolean(__v.button())',10);time.sleep(.3)
 return s
def loaded_modules():
 return c.js('performance.getEntriesByType("resource").map(x=>x.name.replace(location.origin,"")).filter(x=>/comments\\.(mjs|css)|project-ui\\.mjs|journal-ui\\.mjs|content-controls\\.(mjs|css)|back-to-top\\.(mjs|css)/.test(x))')
def place_button(top):
 r=c.js('__v.placeTop(__v.button(),'+str(top)+')');time.sleep(.65);return r
def open_sort_at(top,label,snapshot=None,pause=.35):
 """Place le haut du bouton de tri à `top`, l'ouvre d'un vrai clic souris sur un point non couvert, mesure, referme par Échap."""
 placed=place_button(top)
 pre=c.js('({button:__v.R(__v.button().getBoundingClientRect()),floating:__v.floating(),limits:__v.limits(),limit:__v.limit(),cover:__v.coverOf(__v.button()),scrollY:scrollY,shell:document.querySelector(".dock-shell")?.dataset.documentScrolling||null})')
 pt=c.js('__v.clickPoint(__v.button())')
 rec={'label':label,'requestedTop':top,'placed':placed,'pre':pre,'clickPoint':pt}
 if not pt:
  rec['unclickable']=True;return rec
 mouse_click(pt['x'],pt['y']);time.sleep(pause)
 rec['info']=c.js('__v.info()')
 if snapshot:snapshot(rec)
 key('Escape',.2);away()
 rec['afterEscape']=c.js('({expanded:__v.button().getAttribute("aria-expanded"),hidden:__v.panel().hidden,focusOnButton:document.activeElement===__v.button()})')
 return rec
def summarize(rec):
 """Résumé lisible d'une ouverture : direction, panneau, options visibles, recouvrements."""
 if rec.get('unclickable'):return {'label':rec['label'],'top':rec['pre']['button']['y'],'unclickable':True,'btt':rec['pre']['floating']['btt']}
 i=rec['info']
 return {'label':rec['label'],'buttonTop':i['button']['y'],'buttonBottom':i['button']['bottom'],'scrollY':i['viewport']['scrollY'],'direction':i['direction'],'gap':i['gap'],'panel':[i['panel']['y'],i['panel']['bottom'],i['panel']['x'],i['panel']['right']],
  'sh/ch':[i['scrollHeight'],i['clientHeight']],'opts':[[o['value'],o['visiblePx'],o['fully'],len(o['covered'])] for o in i['options']],'overlap':{k:v for k,v in i['overlap'].items() if v},'btt':i['floating']['btt'],'limits':i['limits'],'edgeOffset':i['edgeOffset']}
def finish(name,failure,extra=None):
 after=hashes()
 results.update({'failure':failure,'sourcesUnchanged':HASHES_BEFORE==after,'sourceHashes':{s:{k:v[:16] for k,v in d.items()} for s,d in after.items()},'durationSeconds':round(time.time()-START,1)})
 if extra:results.update(extra)
 (OUT/(name+'-results.json')).write_text(json.dumps(results,ensure_ascii=False,indent=1)+'\n')
HASHES_BEFORE=hashes()
def phase(name,fn):
 try:fn()
 except Exception as e:
  results['phaseErrors'].append({'phase':name,'error':repr(e)[:1200]});traceback.print_exc()
  try:shot('echec-'+name)
  except Exception:pass
  try:key('Escape')
  except Exception:pass
def run(name,phases,budget=225,reduced=True,extra=None):
 failure=None
 try:
  start(reduced)
  for pname,fn in phases:
   if time.time()-START>budget:results['phaseErrors'].append({'phase':pname,'error':'sautée : budget de temps'});continue
   phase(pname,fn)
 except Exception as e:
  failure=repr(e)[:1500];traceback.print_exc()
 finally:
  try:finish(name,failure,extra)
  finally:
   if c is not None:
    try:c.close()
    except Exception as error:print('close error',error)
    finally:shutil.rmtree(c.profile,ignore_errors=True)
 print('fin',name,failure is None,results['phaseErrors'],round(time.time()-START,1),flush=True)

# ---- Positions nommées et balayage -------------------------------------------------------------
def button_h():return c.js('__v.button().getBoundingClientRect().height')
def place_rel_limit(offset):
 """Bas du bouton à `offset` px au-dessus de la limite basse (haut de la capsule de recherche, ou du
 bouton « remonter » s'il est visible) ; itère car l'apparition de ce bouton dépend du défilement."""
 h=button_h();top=None
 for _ in range(4):
  L=c.js('__v.limit()');top=L-offset-h;place_button(top)
  if abs(c.js('__v.limit()')-L)<.5:break
 return round(top,2)
def named_tops():
 h=button_h();lim=c.js('__v.limits()');vh=c.js('innerHeight')
 tops={'i-centre':round(vh/2-h/2,2)}
 tops['ii-120']=place_rel_limit(120);tops['iii-60']=place_rel_limit(60)
 tops['iv-haut']=round(c.js('__v.limits().top')+2,2)
 tops['audit-120']=round(lim['audit']-120-h,2);tops['audit-60']=round(lim['audit']-60-h,2)
 return tops
def evaluate(rec,state):
 """Critères : 145 -> options entières si la place existe d'un côté, aucun recouvrement d'une commande flottante."""
 if rec.get('unclickable'):return {'clickable':False}
 i=rec['info'];b=i['button'];L=i['limits']
 below=L['bottom145' if state=='145' else 'bottom144']-b['bottom']-9;above=b['y']-L['top']-9
 # Place réelle des deux côtés, bouton « remonter » compris (critère de la consigne, identique pour 144 et 145).
 realBelow=L['bottom145']-b['bottom']-9
 room=i['natural']<=realBelow+.01 or i['natural']<=above+.01
 full=all(o['fully'] and not o['covered'] for o in i['options'])
 over={k:v for k,v in i['overlap'].items() if v and k!='shell'}
 return {'clickable':True,'direction':i['direction'],'roomEitherSide':room,'allOptionsFull':full,'scrollEqualsClient':i['scrollHeight']<=i['clientHeight'],
  'overlaps':over,'inViewport':i['inViewport'],'ok':(full or not room) and not over and i['inViewport'],'errors':i['errors']}
def sweep(state,tops,label,collect,snap_labels=(),shot_prefix=None,clip=None):
 for t in tops:
  rec=open_sort_at(t,label+'@'+str(t),snapshot=(lambda r:shot(shot_prefix+'-'+str(int(t)),clip)) if shot_prefix and t in snap_labels else None)
  rec['eval']=evaluate(rec,state);collect.append(rec)
