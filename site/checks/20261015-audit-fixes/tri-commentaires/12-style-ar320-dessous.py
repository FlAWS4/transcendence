# 12 — Reprise du 15 octobre 2026 : complément de (c) pour AR 320×640 sombre. Dans 07-style, le bouton centré y
# ouvrait le panneau vers le HAUT dans 145 (« remonter » visible), si bien qu'aucune ouverture vers le BAS n'avait
# été comparée à ce format. Ici : bouton juste sous l'en-tête (haut = limite haute + 2 px, ouverture vers le bas dans
# 144 et 145), comparaison de TOUTES les propriétés calculées (bouton au repos / survolé / ouvert, libellé, icônes,
# panneau, option cochée et non cochée) avec le tri des Projets (#content-sort-button / #content-sort-menu), géométrie
# exclue ; puis bouton centré (ouverture vers le haut dans 145) comparé à l'ouverture vers le bas ; puis 144 contre 145
# à la même position, toutes propriétés comprises (géométrie incluse). Fonctions recopiées de 07-style.py.
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
 ref['direction']=c.js('(()=>{const b=document.querySelector("#content-sort-button").getBoundingClientRect(),p=document.querySelector("#content-sort-menu").getBoundingClientRect();return p.top>=b.bottom-.5?"below":p.bottom<=b.top+.5?"above":"overlap"})()')
 key('Escape');return ref
def comment_side(top):
 sel='__v.button()'
 placed=place_button(top);away();c.js('document.activeElement.blur()');time.sleep(.2)
 side={'place':placed,'repos':snapexpr(sel),'libelle':snapexpr(sel+'.querySelector(":scope > span")'),'icone1':snapexpr(sel+'.querySelector(":scope > svg:first-child")'),'icone2':snapexpr(sel+'.querySelector(":scope > svg:last-child")')}
 p=c.js('__v.clickPoint(__v.button())');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':p['x'],'y':p['y']});time.sleep(.3)
 side['survol']=snapexpr(sel)
 mouse_click(p['x'],p['y']);time.sleep(.4);away()
 side['ouvert']=snapexpr(sel);side['panneau']=snapexpr('__v.panel()')
 side['optionNonCochee']=snapexpr('[...__v.panel().querySelectorAll("[role=menuitemradio][aria-checked=false]")].find(e=>e!==document.activeElement&&!e.matches(":hover"))')
 side['optionCochee']=snapexpr('__v.panel().querySelector("[role=menuitemradio][aria-checked=true]")')
 side['info']=c.js('__v.info()');side['texteBouton']=c.js('__v.button().textContent.trim()')
 key('Escape');away();return side
PARTS=['repos','libelle','icone1','icone2','survol','ouvert','panneau','optionNonCochee','optionCochee']
def compare(a,b):return {part:diff(a.get(part),b.get(part)) for part in PARTS}
def brief(cmp):
 return {part:{'autres':v.get('autres'),'personnalisees':sorted((v.get('personnalisees') or {}).keys()),'geometrie':sorted((v.get('geometrie') or {}).keys()),'proprietes':v.get('proprietes'),'etats':[v.get('etatA'),v.get('etatB')]} for part,v in cmp.items()}
STORE={}
def cfg(state):
 def go():
  s=open_route(state,'project',320,640,'ar','dark');record('style-ar320-dessous-'+state+'-reglages',s)
  ref=projects_ref()
  c.js('location.hash='+json.dumps(ROUTES['project']));wait('Boolean(__v.button())',15);lib();time.sleep(.5)
  top=round(c.js('__v.limits().top')+2,2)
  below=comment_side(top)
  vh=c.js('innerHeight');bh=button_h()
  centre=comment_side(round(vh/2-bh/2,2))
  out={'texteBoutonProjets':ref['texteBouton'],'texteBoutonCommentaires':below['texteBouton'],'directionProjets':ref['direction'],
   'positionHaut':top,'directionHaut':below['info']['direction'],'panneauHaut':below['info']['panel'],'remonterVisibleHaut':below['info']['floating']['btt'],
   'directionCentre':centre['info']['direction'],'panneauCentre':centre['info']['panel'],
   'bas_vs_projets':brief(compare(ref,below)),'centre_vs_projets':brief(compare(ref,centre)),'centre_vs_bas':brief(compare(below,centre))}
  STORE[state]={'ref':ref,'bas':below,'centre':centre}
  record('style-ar320-dessous-'+state,out,quiet=True)
  print('style',state,'haut',out['directionHaut'],'centre',out['directionCentre'],{k:{p:len(v['autres'] or {}) for p,v in out[k].items()} for k in ('bas_vs_projets','centre_vs_projets','centre_vs_bas')},flush=True)
 return go
def cross():
 a,b=STORE.get('144'),STORE.get('145')
 if not(a and b):return
 for key_ in ('bas','ref'):
  full={part:diff(a[key_].get(part),b[key_].get(part)) for part in PARTS}
  record('style-ar320-dessous-144-vs-145-'+key_,{part:{'differences':{**v.get('geometrie',{}),**v.get('autres',{}),**v.get('personnalisees',{})},'proprietes':v.get('proprietes')} for part,v in full.items()})
run('12-style-ar320-dessous',[('145',cfg('145')),('144',cfg('144')),('croise',cross)],budget=200)
