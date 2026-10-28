# 14 — Reprise du 15 octobre 2026 : complément de (c). Les bancs 07 et 12 tournaient avec
# prefers-reduced-motion: reduce (animation du panneau désactivée par content-controls.css). Ici, mouvement NON réduit
# (réglage par défaut des visiteurs) : FR 390×844 clair, toutes les propriétés calculées du bouton, du panneau et des
# options du tri des Commentaires (ouverture vers le bas : bouton centré ; vers le haut : bouton à 60 px de la capsule)
# comparées au tri des Projets, géométrie exclue ; animation réellement attachée au panneau (getAnimations : nom,
# durée, images clés) dans les trois cas ; 144 contre 145 au même endroit (vers le bas), toutes propriétés comprises.
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires/lib.py').read())
GEOMETRY={'width','height','inline-size','block-size','top','left','right','bottom','inset','inset-block-start','inset-block-end','inset-inline-start','inset-inline-end','max-height','max-block-size','perspective-origin','transform-origin','translate'}
ANIM='''(p=>p?p.getAnimations().map(a=>({name:a.animationName,state:a.playState,duration:a.effect.getTiming().duration,fill:a.effect.getTiming().fill,
 easing:a.effect.getTiming().easing,keyframes:a.effect.getKeyframes().map(k=>({offset:k.offset,opacity:k.opacity,transform:k.transform,easing:k.easing}))})):null)'''
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
 c.js('window.scrollTo({top:0,behavior:"instant"})');time.sleep(.7);away();c.js('document.activeElement.blur()');time.sleep(.3)
 ref={'repos':snapsel('#content-sort-button'),'libelle':snapsel('#content-sort-button > span'),'icone1':snapsel('#content-sort-button > svg:first-child'),'icone2':snapsel('#content-sort-button > svg:last-child')}
 p=c.js('__v.clickPoint(document.querySelector("#content-sort-button"))');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':p['x'],'y':p['y']});time.sleep(.4)
 ref['survol']=snapsel('#content-sort-button')
 mouse_click(p['x'],p['y']);ref['animationsDebut']=c.js(ANIM+'(document.querySelector("#content-sort-menu"))');time.sleep(.5);away();time.sleep(.3)
 ref['ouvert']=snapsel('#content-sort-button');ref['panneau']=snapsel('#content-sort-menu');ref['optionNonCochee']=snapexpr(UNCHECKED_P);ref['optionCochee']=snapexpr(CHECKED_P)
 ref['animations']=c.js(ANIM+'(document.querySelector("#content-sort-menu"))')
 key('Escape');return ref
def comment_side(top):
 sel='__v.button()'
 placed=place_button(top);away();c.js('document.activeElement.blur()');time.sleep(.3)
 side={'place':placed,'repos':snapexpr(sel),'libelle':snapexpr(sel+'.querySelector(":scope > span")'),'icone1':snapexpr(sel+'.querySelector(":scope > svg:first-child")'),'icone2':snapexpr(sel+'.querySelector(":scope > svg:last-child")')}
 p=c.js('__v.clickPoint(__v.button())');c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':p['x'],'y':p['y']});time.sleep(.4)
 side['survol']=snapexpr(sel)
 mouse_click(p['x'],p['y']);side['animationsDebut']=c.js(ANIM+'(__v.panel())');time.sleep(.5);away();time.sleep(.3)
 side['ouvert']=snapexpr(sel);side['panneau']=snapexpr('__v.panel()')
 side['optionNonCochee']=snapexpr('[...__v.panel().querySelectorAll("[role=menuitemradio][aria-checked=false]")].find(e=>e!==document.activeElement&&!e.matches(":hover"))')
 side['optionCochee']=snapexpr('__v.panel().querySelector("[role=menuitemradio][aria-checked=true]")')
 side['animations']=c.js(ANIM+'(__v.panel())')
 side['info']=c.js('__v.info()')
 key('Escape');away();return side
PARTS=['repos','libelle','icone1','icone2','survol','ouvert','panneau','optionNonCochee','optionCochee']
def compare(a,b):return {part:diff(a.get(part),b.get(part)) for part in PARTS}
def brief(cmp):
 return {part:{'autres':v.get('autres'),'personnalisees':sorted((v.get('personnalisees') or {}).keys()),'geometrie':sorted((v.get('geometrie') or {}).keys()),'proprietes':v.get('proprietes')} for part,v in cmp.items()}
def keyframes(a):return [(x['name'],x['duration'],x['fill'],x['keyframes']) for x in (a or [])]
STORE={}
def cfg(state):
 def go():
  s=open_route(state,'project',390,844,'fr','light');record('mouvement-fr390-'+state+'-reglages',s)
  record('mouvement-fr390-'+state+'-media',c.js('({reduce:matchMedia("(prefers-reduced-motion: reduce)").matches})'))
  ref=projects_ref()
  c.js('location.hash='+json.dumps(ROUTES['project']));wait('Boolean(__v.button())',15);lib();time.sleep(.5)
  vh=c.js('innerHeight');bh=button_h()
  below=comment_side(round(vh/2-bh/2,2))
  out={'directionProjets':'below','directionCentre':below['info']['direction'],'panneauCentre':below['info']['panel'],
   'animationsProjets':ref['animations'],'animationsProjetsDebut':ref['animationsDebut'],'animationsCentre':below['animations'],'animationsCentreDebut':below['animationsDebut'],
   'bas_vs_projets':brief(compare(ref,below))}
  if state=='145':
   above=comment_side(place_rel_limit(60))
   out.update({'directionBasse':above['info']['direction'],'panneauBas':above['info']['panel'],'animationsHaut':above['animations'],'animationsHautDebut':above['animationsDebut'],
    'haut_vs_projets':brief(compare(ref,above)),'haut_vs_bas':brief(compare(below,above)),
    'memesImagesCles':keyframes(ref['animations'])==keyframes(below['animations'])==keyframes(above['animations'])})
  STORE[state]={'ref':ref,'bas':below}
  record('mouvement-fr390-'+state,out,quiet=True)
  print('mouvement',state,out['directionCentre'],out.get('directionBasse'),{k:{p:len(v['autres'] or {}) for p,v in out[k].items()} for k in out if k.endswith('projets') or k.endswith('_bas')},'anim',keyframes(below['animations']),out.get('memesImagesCles'),flush=True)
 return go
def cross():
 a,b=STORE.get('144'),STORE.get('145')
 if not(a and b):return
 for key_ in ('bas','ref'):
  full={part:diff(a[key_].get(part),b[key_].get(part)) for part in PARTS}
  record('mouvement-fr390-144-vs-145-'+key_,{part:{'differences':{**v.get('geometrie',{}),**v.get('autres',{}),**v.get('personnalisees',{})},'proprietes':v.get('proprietes')} for part,v in full.items()})
run('14-style-mouvement',[('145',cfg('145')),('144',cfg('144')),('croise',cross)],budget=200,reduced=False)
