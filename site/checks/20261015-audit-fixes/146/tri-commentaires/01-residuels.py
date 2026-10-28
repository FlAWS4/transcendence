# 01 — Résiduels de D2 relevés sur l'état 145 : bouton de tri au niveau du bouton « remonter » (AR 320×640
# sombre) ou sous la capsule de recherche (FR 390×844 clair), plus les positions nommées pour la non-régression.
# Détail projet minishell, onglet Commentaires ; ouverture par vrai clic souris sur un point non couvert du bouton,
# fermeture par Échap. État 146 (actif) puis 145 (archive pre-audit-fixes-refinement-20261015), un état par appel.
import sys
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/146/tri-commentaires/lib.py').read())
STATE=sys.argv[1] if len(sys.argv)>1 else '146'
COVERING=('btt','search','nav','random','header','scope')  # commandes dessinées au-dessus du panneau
def judge(r):
 if r.get('unclickable'):return {'clickable':False}
 i=r['info'];over={k:v for k,v in i['overlap'].items() if v and k in COVERING}
 full=all(o['fully'] and not o['covered'] for o in i['options'])
 return {'clickable':True,'direction':i['direction'],'panel':[round(i['panel']['y'],2),round(i['panel']['bottom'],2)],'allOptionsFull':full,
  'coveredBy':over,'drawsOverSectionSwitch':bool(i['overlap'].get('switch')),'scroll':[i['scrollHeight'],i['clientHeight']],'inViewport':i['inViewport'],'errors':i['errors'],
  'ok':not over and i['inViewport'] and not i['errors']}
def series(name,w,h,locale,theme,tops):
 def go():
  s=open_route(STATE,'project',w,h,locale,theme);record(name+'-reglages',s)
  named=named_tops();record(name+'-positions-nommees',named)
  rows=[]
  for lab,t in list(named.items())+[('balayage@'+str(t),t) for t in tops]:
   r=open_sort_at(t,lab);j=judge(r);rows.append({**summarize(r),'judge':j})
  record(name+'-ouvertures',rows,quiet=True)
  click=[x for x in rows if x['judge'].get('clickable')]
  record(name+'-bilan',{'ouvertures':len(rows),'cliquables':len(click),'sansRecouvrement':sum(1 for x in click if x['judge']['ok']),
   'recouvertes':[{'label':x['label'],'buttonTop':x.get('buttonTop'),'panel':x['judge']['panel'],'coveredBy':x['judge']['coveredBy']} for x in click if not x['judge']['ok']],
   'optionsEntieres':sum(1 for x in click if x['judge']['allOptionsFull']),'versLeHaut':sum(1 for x in click if x['judge']['direction']=='above'),
   'surSelecteurDeSection':sum(1 for x in click if x['judge']['drawsOverSectionSwitch'])})
 return go
run('01-residuels-'+STATE,[('ar320',series('ar320',320,640,'ar','dark',list(range(420,592,6)))),
 ('fr390',series('fr390',390,844,'fr','light',list(range(680,772,6)))),('modules',lambda:record('modules',loaded_modules()))],budget=230)
