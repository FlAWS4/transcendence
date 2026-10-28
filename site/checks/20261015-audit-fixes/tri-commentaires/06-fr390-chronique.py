# 06 — FR 390×844 clair, chronique « an evening debugging » : positions nommées et balayage de 16 en 16 px,
# états 145 puis 144 (mêmes fonctions que 05-fr1280-chronique.py, chargées sans relancer ce banc).
SECOND=True
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires/05-fr1280-chronique.py').read())
run('06-fr390-chronique',[('k145',cfg('145','journal',390,844,16,'fr390-chronique',('iii-60',))),('k144',cfg('144','journal',390,844,16,'fr390-chronique',('iii-60',)))],budget=200)
