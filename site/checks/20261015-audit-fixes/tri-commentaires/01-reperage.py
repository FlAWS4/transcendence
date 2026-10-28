# 01 — Repérage géométrique (état 145 seulement ; mise en page identique dans 144, seules les règles de
# placement du panneau diffèrent) : position du bouton de tri dans le document, défilement maximal,
# commandes flottantes et seuil d'apparition du bouton « remonter en haut ».
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires/lib.py').read())
CONFIGS=[('project',390,844,'fr','light'),('journal',390,844,'fr','light'),('transcendence',390,844,'fr','light'),('project',320,640,'ar','dark'),('journal',320,640,'ar','dark'),('transcendence',320,640,'ar','dark'),('project',1280,900,'fr','light'),('journal',1280,900,'fr','light'),('project',375,667,'fr','light')]
def recon():
 for route,w,h,loc,theme in CONFIGS:
  s=open_route('145',route,w,h,loc,theme)
  base=c.js('(()=>{const b=__v.button();return {settings:null,buttonDocY:__v.docY(b),buttonH:b.getBoundingClientRect().height,buttonW:b.getBoundingClientRect().width,buttonX:b.getBoundingClientRect().x,maxScroll:__v.maxScroll(),threshold:Math.max(360,innerHeight*.75),firstDots:__v.dots()?__v.docY(__v.dots()):null}})()')
  base['settings']=s
  c.js('window.scrollTo({top:0,behavior:"instant"})');time.sleep(.6);base['floatingTop']=c.js('__v.floating()');base['limitsTop']=c.js('__v.limits()')
  c.js('window.scrollTo({top:__v.maxScroll(),behavior:"instant"})');time.sleep(.7);base['floatingMax']=c.js('__v.floating()');base['limitsMax']=c.js('__v.limits()');base['scrollYMax']=c.js('scrollY')
  base['bttState']=c.js('(()=>{const e=document.getElementById("back-to-top");return e?{hidden:e.hidden,display:getComputedStyle(e).display,style:e.getAttribute("style")}:null})()')
  record('reperage-'+route+'-'+loc+'-'+str(w)+'x'+str(h),base)
 record('modules-145',loaded_modules())
run('01-reperage',[('recon',recon)])
