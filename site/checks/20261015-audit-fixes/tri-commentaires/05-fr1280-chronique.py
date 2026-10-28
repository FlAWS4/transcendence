# 05 — FR 1280×900 clair (projet minishell et chronique « an evening debugging ») : positions nommées et
# balayage de 28 en 28 px. (La chronique en FR 390×844 est dans 06-fr390-chronique.py.)
# États 145 puis 144. Ouverture par vrai clic souris, fermeture par Échap.
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires/lib.py').read())
def detail(r):
 s={**summarize(r),'eval':r['eval']}
 if not r.get('unclickable'):s['clickPoint']=r['clickPoint'];s['buttonCover']=r['pre']['cover']
 return s
def cfg(state,route,w,h,step,prefix,shots=()):
 def go():
  s=open_route(state,route,w,h,'fr','light');record(prefix+'-'+state+'-reglages',s)
  record(prefix+'-'+state+'-bouton',c.js('({id:__v.button().id,panel:__v.panel().id,docY:__v.docY(__v.button())})'))
  tops=named_tops();record(prefix+'-'+state+'-positions',tops)
  for lab,t in tops.items():
   snap=(lambda r,lab=lab:shot(prefix+'-'+state+'-'+lab)) if lab in shots else None
   rec=open_sort_at(t,lab,snapshot=snap);rec['eval']=evaluate(rec,state)
   record(prefix+'-'+state+'-'+lab,detail(rec))
  lim=c.js('__v.limits()');vh=c.js('innerHeight')
  data=[];sweep(state,list(range(int(lim['top'])-30,int(vh)-60,step)),'balayage',data)
  record(prefix+'-'+state+'-balayage',[detail(r) for r in data],quiet=True)
  bad=[detail(r) for r in data if r['eval'].get('clickable') and not r['eval']['ok']]
  record(prefix+'-'+state+'-balayage-bilan',{'positions':len(data),'cliquables':sum(1 for r in data if r['eval'].get('clickable')),'echecs':len(bad),'detailEchecs':bad})
 return go
if __name__=='__main__' and 'SECOND' not in globals():
 run('05-fr1280-chronique',[
  ('p145',cfg('145','project',1280,900,28,'fr1280-projet',('ii-120',))),('p144',cfg('144','project',1280,900,28,'fr1280-projet',('ii-120',))),
  ('j145',cfg('145','journal',1280,900,28,'fr1280-chronique')),('j144',cfg('144','journal',1280,900,28,'fr1280-chronique')),
 ],budget=215)
