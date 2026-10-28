# 08 — (d) Menus « Actions du commentaire » (⋮) inchangés : menu du premier commentaire ouvert d'un vrai clic
# aux mêmes positions de défilement dans 144 et 145 (bouton ⋮ centré, à 120 / 60 / 20 px de la limite basse,
# juste sous l'en-tête), FR 390×844 clair, AR 320×640 sombre, FR 1280×900 clair. Comparaison exacte des
# rectangles, de la direction, de max-height et des options.
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires/lib.py').read())
DOTS_INFO='__v.menuInfo(__v.dots(),document.getElementById(__v.dots().getAttribute("aria-controls")))'
def place_dots(top):
 r=c.js('__v.placeTop(__v.dots(),'+str(top)+')');time.sleep(.65);return r
def open_dots(top,label):
 placed=place_dots(top)
 pre=c.js('({dots:__v.R(__v.dots().getBoundingClientRect()),id:__v.dots().dataset.commentId,disabled:__v.dots().disabled,scrollY:scrollY,limit:__v.limit()})')
 pt=c.js('__v.clickPoint(__v.dots())')
 rec={'label':label,'requestedTop':top,'placed':placed,'pre':pre,'clickPoint':pt}
 if not pt:rec['unclickable']=True;return rec
 mouse_click(pt['x'],pt['y']);time.sleep(.35)
 i=c.js(DOTS_INFO)
 rec['info']={k:i[k] for k in ['expanded','button','panel','direction','gap','edgeOffset','styleTop','maxHeight','scrollHeight','clientHeight','overlap','inViewport','active','viewport']}
 rec['info']['options']=[{k:o[k] for k in ['value','top','bottom','visiblePx','fully','focused']} for o in i['options']]
 key('Escape',.2);away()
 rec['afterEscape']=c.js('({focusOnDots:document.activeElement===__v.dots(),expanded:__v.dots().getAttribute("aria-expanded")})')
 return rec
STORE={}
def cfg(state,w,h,loc,theme,tag):
 def go():
  s=open_route(state,'project',w,h,loc,theme);record('menus-'+tag+'-'+state+'-reglages',s)
  hh=c.js('__v.dots().getBoundingClientRect().height');vh=c.js('innerHeight');lim0=c.js('__v.limits()')
  out=[]
  tops=[('centre',round(vh/2-hh/2,2)),('haut',round(lim0['top']+2,2))]
  for off in (120,60,20):
   # Limite basse prise au moment du placement (capsule ou « remonter » visible), comme pour le tri.
   L=c.js('__v.limit()');tops.append(('limite-'+str(off),round(L-off-hh,2)))
  for lab,t in tops:out.append(open_dots(t,lab))
  STORE[tag+'-'+state]=out
  record('menus-'+tag+'-'+state,out,quiet=True)
  print(tag,state,[(r['label'],r.get('info',{}).get('direction'),r.get('info',{}).get('panel')) for r in out],flush=True)
 return go
def cross():
 for tag in ['fr390','ar320','fr1280']:
  a,b=STORE.get(tag+'-144'),STORE.get(tag+'-145')
  if not a or not b:continue
  rows=[]
  for x,y in zip(a,b):
   same=x.get('placed',{}).get('got')==y.get('placed',{}).get('got')
   ia,ib=x.get('info'),y.get('info')
   eq=bool(ia and ib) and all(ia[k]==ib[k] for k in ['panel','direction','gap','styleTop','maxHeight','scrollHeight','clientHeight','options','button'])
   rows.append({'position':x['label'],'scrollY144':x.get('placed',{}).get('got'),'scrollY145':y.get('placed',{}).get('got'),'memeDefilement':same,
    'direction':[ia and ia['direction'],ib and ib['direction']],'panneau144':ia and ia['panel'],'panneau145':ib and ib['panel'],'identique':eq,
    'focusRetour':[x.get('afterEscape'),y.get('afterEscape')]})
  record('menus-'+tag+'-144-vs-145',{'toutIdentique':all(r['identique'] and r['memeDefilement'] for r in rows),'positions':rows})
run('08-menus-actions',[('fr390-145',cfg('145',390,844,'fr','light','fr390')),('fr390-144',cfg('144',390,844,'fr','light','fr390')),
 ('ar320-145',cfg('145',320,640,'ar','dark','ar320')),('ar320-144',cfg('144',320,640,'ar','dark','ar320')),
 ('fr1280-145',cfg('145',1280,900,'fr','light','fr1280')),('fr1280-144',cfg('144',1280,900,'fr','light','fr1280')),('croise',cross)],budget=215)
