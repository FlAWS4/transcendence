# 04 — AR 320×640 sombre. (a) Détail ft_transcendence (barre de tri plus bas dans la page : « remonter »
# reste visible jusqu'à un haut de bouton de 524 px) : bande fine de 3 en 3 px entre 438 et 530 px, avec le
# point de clic réellement utilisé et la part du bouton couverte. (b) Chronique « an evening debugging » :
# positions nommées. États 145 puis 144.
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires/lib.py').read())
def detail(r):
 s={**summarize(r),'eval':r['eval']}
 if not r.get('unclickable'):s['clickPoint']=r['clickPoint'];s['buttonCover']=r['pre']['cover']
 return s
def band(state):
 def go():
  s=open_route(state,'transcendence',320,640,'ar','dark');record('ar320-transcendence-'+state+'-reglages',s)
  data=[]
  for t in range(438,531,3):
   snap=(lambda r,t=t:shot('ar320-transcendence-'+state+'-'+str(t))) if t in (500,512) else None
   rec=open_sort_at(t,'bande@'+str(t),snapshot=snap);rec['eval']=evaluate(rec,state);data.append(rec)
  record('ar320-transcendence-'+state+'-bande',[detail(r) for r in data],quiet=True)
  inter=[(r['info']['button']['y'],r['info']['overlap']['btt']) for r in data if r.get('info') and r['info']['overlap'].get('btt')]
  record('ar320-transcendence-'+state+'-bande-bilan',{'positions':len(data),'cliquables':sum(1 for r in data if r['eval'].get('clickable')),
   'bttVisible':sum(1 for r in data if (r.get('info') or {}).get('floating',{}).get('btt')),'intersectionsRemonter':inter,
   'echecs':[detail(r) for r in data if r['eval'].get('clickable') and not r['eval']['ok']]})
 return go
def journal(state):
 def go():
  s=open_route(state,'journal',320,640,'ar','dark');record('ar320-chronique-'+state+'-reglages',s)
  record('ar320-chronique-'+state+'-bouton',c.js('({id:__v.button().id,panel:__v.panel().id})'))
  tops=named_tops();record('ar320-chronique-'+state+'-positions',tops)
  for lab,t in tops.items():
   rec=open_sort_at(t,lab);rec['eval']=evaluate(rec,state)
   record('ar320-chronique-'+state+'-'+lab,detail(rec))
 return go
run('04-ar320-remonter',[('bande145',band('145')),('bande144',band('144')),('chronique145',journal('145')),('chronique144',journal('144'))],budget=215)
