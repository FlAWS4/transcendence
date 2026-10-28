# 03 — AR 320×640 sombre, détail projet minishell, onglet Commentaires : positions nommées, balayage de
# 12 en 12 px, et bande fine (4 px) autour du bouton « remonter en haut » visible (seuil scrollY >= 480),
# dans 145 puis 144. Ouverture par vrai clic souris sur un point non couvert du bouton, fermeture par Échap.
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires/lib.py').read())
P='ar320-projet'
def one(state):
 def go():
  s=open_route(state,'project',320,640,'ar','dark');record(P+'-'+state+'-reglages',s)
  tops=named_tops();record(P+'-'+state+'-positions',tops)
  # Position du banc du 14 octobre et de l'audit (barre centrée : haut du bouton 314,09) : « remonter » visible.
  tops['audit-centre']=314.09
  named=[]
  for lab,t in tops.items():
   snap=(lambda r,lab=lab:shot('ar320-'+state+'-'+lab)) if lab in ('audit-centre','iii-60') else None
   rec=open_sort_at(t,lab,snapshot=snap);rec['eval']=evaluate(rec,state);named.append(rec)
   record(P+'-'+state+'-'+lab,{**summarize(rec),'eval':rec['eval']})
  record(P+'-'+state+'-nommees-complet',named,quiet=True)
  lim=c.js('__v.limits()');vh=c.js('innerHeight')
  coll=[];sweep(state,list(range(int(lim['top'])-36,int(vh)-50,12)),'balayage',coll)
  # Bande fine : du haut du bouton « remonter » − 30 px jusqu’à 471 px (au-delà, « remonter » disparaît sur ce détail).
  band=[];sweep(state,list(range(420,472,4)),"bande",band)
  for name,data in [('balayage',coll),('bande',band)]:
   record(P+'-'+state+'-'+name,[{**summarize(r),'eval':r['eval']} for r in data],quiet=True)
   bad=[{**summarize(r),'eval':r['eval']} for r in data if r['eval'].get('clickable') and not r['eval']['ok']]
   record(P+'-'+state+'-'+name+'-bilan',{'positions':len(data),'cliquables':sum(1 for r in data if r['eval'].get('clickable')),'echecs':len(bad),'bttVisible':sum(1 for r in data if (r.get('info') or {}).get('floating',{}).get('btt')),'detailEchecs':bad})
 return go
def modules():record('modules',loaded_modules())
run('03-ar320-projet',[('145',one('145')),('modules145',modules),('144',one('144')),('modules144',modules)],budget=200)
