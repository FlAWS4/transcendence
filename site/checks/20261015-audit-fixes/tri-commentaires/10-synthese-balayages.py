# 10 — Synthèse sans navigateur (reprise du 15 octobre 2026) : relit les résultats 02 à 06 et classe chaque
# ouverture du panneau de tri des commentaires selon les critères de la consigne D2 :
#  - « place » : le panneau entier (scrollHeight + 2 px de bordure) tient au-dessus OU au-dessous du bouton,
#    entre le haut (en-tête + 8 px) et la limite basse (capsule de recherche / navigation / « remonter » visible − 8 px),
#    avec l'écart de 9 px du code ;
#  - « entier » : les trois options entièrement visibles dans le panneau et non recouvertes (test de points) ;
#  - recouvrement d'une commande flottante : capsule de recherche, dé (dock), navigation, « remonter », en-tête, portée ;
#    le sélecteur de section collant (.cp-project-section-switch) est compté à part (contenu de page, pas flottant).
# Catégories : ok ; borne-sans-place (aucun côté n'a la place : panneau borné, défilant — attendu) ;
# bouton-sous-limite (le bouton lui-même est déjà dans la bande des commandes flottantes : son haut − 9 px dépasse la
# limite basse) ; echec (tout le reste).
import json
from pathlib import Path
OUT=Path('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires')
FLOAT={'search','random','nav','btt','header','scope'}
SOURCES=[('02-fr390-projet','fr390-projet-{s}-balayage','FR 390×844 clair · projet minishell'),
 ('03-ar320-projet','ar320-projet-{s}-balayage','AR 320×640 sombre · projet minishell'),
 ('03-ar320-projet','ar320-projet-{s}-bande','AR 320×640 sombre · projet minishell (bande fine)'),
 ('04-ar320-remonter','ar320-transcendence-{s}-bande','AR 320×640 sombre · projet ft_transcendence (bande fine)'),
 ('05-fr1280-chronique','fr1280-projet-{s}-balayage','FR 1280×900 clair · projet minishell'),
 ('05-fr1280-chronique','fr1280-chronique-{s}-balayage','FR 1280×900 clair · chronique'),
 ('06-fr390-chronique','fr390-chronique-{s}-balayage','FR 390×844 clair · chronique')]
def case(f,name):
 for c in json.load(open(OUT/(f+'-results.json')))['cases']:
  if c['case']==name:return c['result']
 return None
def classify(r):
 if r.get('unclickable'):return {'categorie':'non-cliquable'}
 L=r['limits'];bottom=L['bottom145'];top=L['top']
 natural=r['sh/ch'][0]+2
 roomBelow=bottom-r['buttonBottom']-9;roomAbove=r['buttonTop']-top-9
 room=natural<=roomBelow+.01 or natural<=roomAbove+.01
 full=all(o[2] and not o[3] for o in r['opts'])
 floats={k:v for k,v in r['overlap'].items() if k in FLOAT and v}
 switch=r['overlap'].get('switch')
 under=r['buttonTop']-9>bottom
 if floats and under:cat='bouton-sous-limite'
 elif floats:cat='echec'
 elif full:cat='ok'
 elif not room:cat='borne-sans-place'
 else:cat='echec'
 return {'categorie':cat,'haut':r['buttonTop'],'direction':r['direction'],'panneau':r['panel'],'sh/ch':r['sh/ch'],'placeDessous':round(roomBelow,2),'placeDessus':round(roomAbove,2),'naturel':natural,
  'optionsVisiblesPx':[o[1] for o in r['opts']],'pointsCouverts':[o[3] for o in r['opts']],'recouvrementsFlottants':floats,'selecteurSection':switch,'remonterVisible':bool(r.get('btt'))}
out={'date':'2026-10-15','methode':'relecture des résultats 02 à 06 (aucun navigateur)','series':[]}
for f,pattern,label in SOURCES:
 for s in ('145','144'):
  rows=case(f,pattern.format(s=s))
  if rows is None:continue
  items=[classify(r) for r in rows]
  cats={}
  for it in items:cats[it['categorie']]=cats.get(it['categorie'],0)+1
  btt=[(it['haut'],it['recouvrementsFlottants'].get('btt')) for it in items if it.get('recouvrementsFlottants',{}).get('btt')]
  ser={'serie':label,'etat':s,'positions':len(items),'categories':cats,'intersectionsRemonter':btt,
   'echecs':[it for it in items if it['categorie']=='echec'],'boutonSousLimite':[{k:it[k] for k in ('haut','direction','panneau','recouvrementsFlottants','optionsVisiblesPx','pointsCouverts')} for it in items if it['categorie']=='bouton-sous-limite'],
   'bornes':[{k:it[k] for k in ('haut','direction','panneau','sh/ch','placeDessous','placeDessus','optionsVisiblesPx')} for it in items if it['categorie']=='borne-sans-place'],
   'selecteurSectionRecouvert':sum(1 for it in items if it.get('selecteurSection')),
   'plageHautsMesures':[min((it['haut'] for it in items if 'haut' in it),default=None),max((it['haut'] for it in items if 'haut' in it),default=None)]}
  out['series'].append(ser)
  print(label,s,'positions',len(items),cats,'| remonter∩panneau',len(btt),'| echecs',[(e['haut'],e['direction']) for e in ser['echecs']][:12])
# Contrôle complémentaire : aux mêmes positions, 145 ne diffère de 144 (direction, rectangle, scrollHeight/clientHeight)
# que là où le panneau entier ne tenait pas dessous dans 145 (limite basse « remonter » compris).
cmp={'identiques':0,'differents':0,'differentsAlorsQueLePanneauTenaitDessous':[]}
for f,pattern,label in SOURCES:
 S={s:{r['label']:r for r in (case(f,pattern.format(s=s)) or [])} for s in ('145','144')}
 for lab,b in S['145'].items():
  a=S['144'].get(lab)
  if not a or a.get('unclickable') or b.get('unclickable'):continue
  if a['direction']==b['direction'] and a['panel']==b['panel'] and a['sh/ch']==b['sh/ch']:cmp['identiques']+=1;continue
  cmp['differents']+=1
  natural=b['sh/ch'][0]+2;rb=b['limits']['bottom145']-b['buttonBottom']-9
  if natural<=rb+.01:cmp['differentsAlorsQueLePanneauTenaitDessous'].append({'serie':label,'position':lab,'direction145':b['direction']})
out['comparaison144_145']=cmp
print('comparaison 144/145',{k:(v if not isinstance(v,list) else len(v)) for k,v in cmp.items()})
(OUT/'10-synthese-balayages-results.json').write_text(json.dumps(out,ensure_ascii=False,indent=1)+'\n')
