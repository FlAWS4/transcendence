# 11 — Reprise du 15 octobre 2026 : mesures et captures manquantes pour (b).
# A. FR 390×844 clair, projet minishell, « remonter » visible (scrollY >= 633) : panneau de tri ouvert d'un vrai clic
#    avec le haut du bouton à 132 / 210 / 250 / 280 px ; intersection avec #back-to-top ; capture à 250 px (144 et 145).
# B. AR 320×640 sombre, projet ft_transcendence : cas résiduel où le bouton de tri est lui-même au niveau du bouton
#    « remonter » (haut 455 / 470 / 480 / 510 px) ; intersection, élément au premier plan au centre de l'intersection,
#    part du bouton de tri couverte ; capture à 480 px (144 et 145).
# C. FR 390×844 clair, projet minishell, bouton de tri sous le haut de la capsule de recherche (haut 748 px) : capture 145.
# Lecture seule ; sorties dans le dossier de preuves ; un seul Chrome (lanceur run.sh).
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires/lib.py').read())
PROBE='''(()=>{const p=__v.panel(),b=document.getElementById("back-to-top"),pr=p.getBoundingClientRect(),br=__v.vis(b);
 const out={btt:br?__v.R(br):null,inter:null,topmost:null,bttZ:b?getComputedStyle(b).zIndex:null,panelZ:getComputedStyle(p).zIndex,menuZ:getComputedStyle(p.parentElement).zIndex};
 if(br){const x1=Math.max(pr.left,br.left),x2=Math.min(pr.right,br.right),y1=Math.max(pr.top,br.top),y2=Math.min(pr.bottom,br.bottom);
  if(x2>x1&&y2>y1){out.inter={x:x1,y:y1,w:Math.round((x2-x1)*100)/100,h:Math.round((y2-y1)*100)/100};const h=document.elementFromPoint((x1+x2)/2,(y1+y2)/2);out.topmost=__v.name(h);out.topmostIsBtt=!!h&&b.contains(h);}}
 out.optionsCover=[...p.querySelectorAll("[role=menuitemradio]")].map(o=>{const r=o.getBoundingClientRect();let n=0,c=0,by={};
  for(let i=0;i<20;i++)for(let j=0;j<5;j++){const x=r.left+r.width*(i+.5)/20,y=r.top+r.height*(j+.5)/5;if(y<pr.top||y>pr.bottom)continue;n++;const h=document.elementFromPoint(x,y);if(!h||!o.contains(h)){c++;const k=__v.name(h);by[k]=(by[k]||0)+1;}}
  return {value:o.dataset.value,checked:o.getAttribute("aria-checked"),samples:n,covered:c,by};});
 return out;})()'''
def brief(rec):
 if rec.get('unclickable'):return {'label':rec['label'],'unclickable':True,'pre':rec['pre']}
 i=rec['info']
 return {**summarize(rec),'eval':rec['eval'],'probe':rec.get('probe'),'clickPoint':rec['clickPoint'],'buttonCover':rec['pre']['cover'],'bttState':i['bttState'],'scrollYOk':i['viewport']['scrollY']}
def make_snap(name):
 def snap(r):
  r['probe']=c.js(PROBE)
  if name:shot(name)
 return snap
def fr390(state):
 def go():
  s=open_route(state,'project',390,844,'fr','light');record('fr390-remonter-'+state+'-reglages',s)
  rows=[]
  for t in (132,210,250,280):
   rec=open_sort_at(t,'remonter@'+str(t),snapshot=make_snap('fr390-remonter-'+state+'-250' if t==250 else None));rec['eval']=evaluate(rec,state);rows.append(rec)
  record('fr390-remonter-'+state,[brief(r) for r in rows])
  record('fr390-remonter-'+state+'-bilan',{'positions':len(rows),'remonterVisible':sum(1 for r in rows if (r.get('info') or {}).get('floating',{}).get('btt')),
   'intersections':[(r['info']['button']['y'],r['info']['overlap']['btt']) for r in rows if r.get('info') and r['info']['overlap'].get('btt')],
   'seuil':c.js('Math.max(360,innerHeight*.75)')})
 return go
def ar320(state):
 def go():
  s=open_route(state,'transcendence',320,640,'ar','dark');record('ar320-residuel-'+state+'-reglages',s)
  rows=[]
  for t in (455,470,480,510):
   rec=open_sort_at(t,'residuel@'+str(t),snapshot=make_snap('ar320-residuel-'+state+'-480' if t==480 else None));rec['eval']=evaluate(rec,state);rows.append(rec)
  record('ar320-residuel-'+state,[brief(r) for r in rows])
 return go
def fr390_capsule():
 s=open_route('145','project',390,844,'fr','light');record('fr390-capsule-145-reglages',s)
 rec=open_sort_at(748,'capsule@748',snapshot=make_snap('fr390-capsule-145-748'));rec['eval']=evaluate(rec,'145')
 record('fr390-capsule-145',brief(rec))
run('11-remonter-captures',[('fr390-145',fr390('145')),('fr390-144',fr390('144')),('ar320-145',ar320('145')),('ar320-144',ar320('144')),('capsule',fr390_capsule)],budget=200)
