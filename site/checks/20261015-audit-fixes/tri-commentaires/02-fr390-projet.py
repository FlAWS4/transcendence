# 02 — FR 390×844 clair, détail projet minishell, onglet Commentaires : positions nommées (i)-(iv),
# positions de l'audit (limite = capsule − 8 px, moins 120 / 60 px) et balayage du bouton de 14 en 14 px,
# dans 145 (actif) puis 144 (archive). Ouverture par vrai clic souris, fermeture par Échap.
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires/lib.py').read())
P='fr390-projet'
def one(state):
 def go():
  s=open_route(state,'project',390,844,'fr','light');record(P+'-'+state+'-reglages',s)
  tops=named_tops();record(P+'-'+state+'-positions',tops)
  named=[]
  for lab,t in tops.items():
   snap=(lambda r,lab=lab:shot('fr390-'+state+'-'+lab)) if lab in ('ii-120','iii-60') else None
   rec=open_sort_at(t,lab,snapshot=snap);rec['eval']=evaluate(rec,state);named.append(rec)
   record(P+'-'+state+'-'+lab,{**summarize(rec),'eval':rec['eval']})
  record(P+'-'+state+'-nommees-complet',named,quiet=True)
  lim=c.js('__v.limits()');vh=c.js('innerHeight')
  coll=[];sweep(state,list(range(int(lim['top'])-40,int(vh)-58,14)),'balayage',coll)
  record(P+'-'+state+'-balayage',[{**summarize(r),'eval':r['eval']} for r in coll],quiet=True)
  bad=[{**summarize(r),'eval':r['eval']} for r in coll if r['eval'].get('clickable') and not r['eval']['ok']]
  record(P+'-'+state+'-balayage-bilan',{'positions':len(coll),'cliquables':sum(1 for r in coll if r['eval'].get('clickable')),'echecs':len(bad),'detailEchecs':bad})
 return go
def modules():record('modules',loaded_modules())
run('02-fr390-projet',[('145',one('145')),('modules145',modules),('144',one('144')),('modules144',modules)])
