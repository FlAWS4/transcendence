# 07 — (c) Style inchangé : TOUTES les propriétés calculées (getComputedStyle complet) du bouton, du panneau
# et d'une option non cochée du tri des Commentaires, comparées au tri des Projets (#content-sort-button,
# #content-sort-menu) dans la même fenêtre et le même thème, géométrie exclue. Panneau ouvert vers le bas
# (bouton centré) et vers le haut (bouton à 60 px de la limite) dans 145 ; panneau vers le bas dans 144.
# FR 1280×900 clair, FR 390×844 clair, AR 320×640 sombre.
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires/lib.py').read())
GEOMETRY={'width','height','inline-size','block-size','top','left','right','bottom','inset','inset-block-start','inset-block-end','inset-inline-start','inset-inline-end','max-height','max-block-size','perspective-origin','transform-origin','translate'}
def snapsel(sel):return c.js('(()=>{const e=document.querySelector('+json.dumps(sel)+');return e?__v.snapEl(e):null})()')
def snapexpr(expr):return c.js('(()=>{const e='+expr+';return e?__v.snapEl(e):null})()')
def diff(a,b):
 if not a or not b:return {'missing':[bool(a),bool(b)]}
 keys=sorted(set(a['css'])|set(b['css']))
 d={k:[a['css'].get(k),b['css'].get(k)] for k in keys if a['css'].get(k)!=b['css'].get(k)}
 return {'proprietes':len(keys),'geometrie':{k:v for k,v in d.items() if k in GEOMETRY},'personnalisees':{k:v for k,v in d.items() if k.startswith('--')},
  'autres':{k:v for k,v in d.items() if k not in GEOMETRY and not k.startswith('--')},'etatA':a['state'],'etatB':b['state']}
UNCHECKED_P='[...document.querySelectorAll("#content-sort-menu [role=menuitemradio][aria-checked=false]")].find(e=>e!==document.activeElement&&!e.matches(":hover"))'
CHECKED_P='document.querySelector("#content-sort-menu [role=menuitemradio][aria-checked=true]")'
def projects_ref():
 c.js('location.hash="projects"');wait('Boolean(document.querySelector("#content-sort-button")) && !document.querySelector("#content-sort-button").closest("[hidden]")',15);lib()
 c.js('window.scrollTo({top:0,behavior:"instant"})');time.sleep(.7);away();c.js('document.activeElement.blur()');time.sleep(.2)
 ref={'repos':snapsel('#content-sort-button'),'libelle':snapsel('#content-sort-button > span'),'icone1':snapsel('#content-sort-button > svg:first-child'),'icone2':snapsel('#content-sort-button > svg:last-child')}
 p=c.js('__v.clickPoint(document.querySelector("#content-sort-button"))');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':p['x'],'y':p['y']});time.sleep(.3)
 ref['survol']=snapsel('#content-sort-button')
 mouse_click(p['x'],p['y']);time.sleep(.4);away()
 ref['ouvert']=snapsel('#content-sort-button');ref['panneau']=snapsel('#content-sort-menu');ref['optionNonCochee']=snapexpr(UNCHECKED_P);ref['optionCochee']=snapexpr(CHECKED_P)
 ref['texteBouton']=c.js('document.querySelector("#content-sort-button").textContent.trim()')
 key('Escape');return ref
def comment_side(top):
 sel='__v.button()'
 place_button(top);away();c.js('document.activeElement.blur()');time.sleep(.2)
 side={'repos':snapexpr(sel),'libelle':snapexpr(sel+'.querySelector(":scope > span")'),'icone1':snapexpr(sel+'.querySelector(":scope > svg:first-child")'),'icone2':snapexpr(sel+'.querySelector(":scope > svg:last-child")')}
 p=c.js('__v.clickPoint(__v.button())');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':p['x'],'y':p['y']});time.sleep(.3)
 side['survol']=snapexpr(sel)
 mouse_click(p['x'],p['y']);time.sleep(.4);away()
 side['ouvert']=snapexpr(sel);side['panneau']=snapexpr('__v.panel()')
 side['optionNonCochee']=snapexpr('[...__v.panel().querySelectorAll("[role=menuitemradio][aria-checked=false]")].find(e=>e!==document.activeElement&&!e.matches(":hover"))')
 side['optionCochee']=snapexpr('__v.panel().querySelector("[role=menuitemradio][aria-checked=true]")')
 side['info']=c.js('__v.info()');side['texteBouton']=c.js('__v.button().textContent.trim()')
 key('Escape');away();return side
def compare(a,b):return {part:diff(a.get(part),b.get(part)) for part in ['repos','libelle','icone1','icone2','survol','ouvert','panneau','optionNonCochee','optionCochee']}
def brief(cmp):
 return {part:{'autres':v.get('autres'),'personnalisees':sorted((v.get('personnalisees') or {}).keys()),'geometrie':sorted((v.get('geometrie') or {}).keys()),'proprietes':v.get('proprietes'),'etats':[v.get('etatA'),v.get('etatB')]} for part,v in cmp.items()}
STORE={}
def cfg(state,w,h,loc,theme,tag):
 def go():
  s=open_route(state,'project',w,h,loc,theme);record('style-'+tag+'-'+state+'-reglages',s)
  ref=projects_ref()
  c.js('location.hash='+json.dumps(ROUTES['project']));wait('Boolean(__v.button())',15);lib();time.sleep(.5)
  vh=c.js('innerHeight');bh=button_h()
  below=comment_side(round(vh/2-bh/2,2))
  out={'texteBoutonProjets':ref['texteBouton'],'texteBoutonCommentaires':below['texteBouton'],
   'directionCentre':below['info']['direction'],'bas_vs_projets':brief(compare(ref,below))}
  if state=='145' or w<1000:
   lim=c.js('__v.limit()');above=comment_side(round(lim-60-bh,2))
   out['directionBasse']=above['info']['direction'];out['haut_vs_projets']=brief(compare(ref,above));out['haut_vs_bas']=brief(compare(below,above))
   STORE[tag+'-'+state+'-haut']=above
  STORE[tag+'-'+state+'-bas']=below;STORE[tag+'-'+state+'-ref']=ref
  record('style-'+tag+'-'+state,out,quiet=True)
  print('style',tag,state,json.dumps({k:{p:(len(v['autres'] or {}) if isinstance(v.get('autres'),dict) else v) for p,v in out[k].items()} for k in out if k.endswith('projets') or k.endswith('bas')},ensure_ascii=False)[:600],flush=True)
 return go
def cross():
 # 144 contre 145 à la même position (panneau vers le bas, bouton centré) : toutes propriétés, géométrie comprise.
 for tag in ['fr1280','fr390','ar320']:
  a,b=STORE.get(tag+'-144-bas'),STORE.get(tag+'-145-bas')
  if a and b:
   full={part:diff(a.get(part),b.get(part)) for part in ['repos','survol','ouvert','panneau','optionNonCochee','optionCochee']}
   record('style-'+tag+'-144-vs-145-bas',{part:{'differences':{**v.get('geometrie',{}),**v.get('autres',{}),**v.get('personnalisees',{})}} for part,v in full.items()})
  r4,r5=STORE.get(tag+'-144-ref'),STORE.get(tag+'-145-ref')
  if r4 and r5:
   full={part:diff(r4.get(part),r5.get(part)) for part in ['repos','survol','ouvert','panneau','optionNonCochee','optionCochee']}
   record('style-'+tag+'-projets-144-vs-145',{part:{'differences':{**v.get('geometrie',{}),**v.get('autres',{}),**v.get('personnalisees',{})}} for part,v in full.items()})
run('07-style',[('fr1280-145',cfg('145',1280,900,'fr','light','fr1280')),('fr390-145',cfg('145',390,844,'fr','light','fr390')),('ar320-145',cfg('145',320,640,'ar','dark','ar320')),
 ('fr1280-144',cfg('144',1280,900,'fr','light','fr1280')),('fr390-144',cfg('144',390,844,'fr','light','fr390')),('ar320-144',cfg('144',320,640,'ar','dark','ar320')),('croise',cross)],budget=215)
