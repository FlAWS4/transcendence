# 09 — (e) Clavier avec le panneau de tri ouvert vers le haut : Flèche bas/haut, Début, Fin déplacent le focus
# et gardent l'option focalisée visible dans le panneau ; Échap ferme et rend le focus au bouton ; Entrée sur une
# option trie et conserve les brouillons. A : 145 FR 390 clair (bouton à 60 px de la capsule, panneau entier vers
# le haut). B : 145 AR 320 sombre, « remonter » visible, haut du bouton 270 px (pas de place entière d'aucun côté :
# panneau vers le haut borné, défilant). C : 144 FR 390 même position (référence avant).
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires/lib.py').read())
FOCUS='''(()=>{const p=__v.panel(),a=document.activeElement,pr=p.getBoundingClientRect(),cs=getComputedStyle(p);
 const top=pr.top+parseFloat(cs.borderTopWidth),bottom=pr.bottom-parseFloat(cs.borderBottomWidth);
 const r=a.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,h=document.elementFromPoint(cx,cy);
 return {value:a.dataset.value||null,inPanel:p.contains(a),optionTop:Math.round(r.top*100)/100,optionBottom:Math.round(r.bottom*100)/100,
  panelTop:Math.round(pr.top*100)/100,panelBottom:Math.round(pr.bottom*100)/100,visibleInPanel:r.top>=top-.5&&r.bottom<=bottom+.5,
  centreHit:!!h&&a.contains(h),scrollTop:p.scrollTop,scrollY,expanded:__v.button().getAttribute("aria-expanded"),focusVisible:a.matches(":focus-visible")};})()'''
def thread_ids():return c.js('[...__v.button().closest(".cp-comments").querySelectorAll(".cp-comment-thread > .cp-comment")].map(x=>x.dataset.commentId)')
def scenario(state,w,h,loc,theme,tag,top=None,rel=None):
 def go():
  s=open_route(state,'project',w,h,loc,theme);record('clavier-'+tag+'-reglages',s)
  t=place_rel_limit(rel) if rel is not None else top
  placed=place_button(t)
  out={'position':{'demandee':t,'obtenue':placed},'etapes':[]}
  pt=c.js('__v.clickPoint(__v.button())');mouse_click(pt['x'],pt['y']);time.sleep(.35)
  i=c.js('__v.info()');out['ouverture']={k:i[k] for k in ['direction','panel','button','scrollHeight','clientHeight','activeValue','overlap']}
  out['etapes'].append({'touche':'clic','focus':c.js(FOCUS)})
  for k in ['ArrowDown','ArrowDown','ArrowDown','ArrowUp','Home','End','ArrowUp','End']:
   key(k,.18);out['etapes'].append({'touche':k,'focus':c.js(FOCUS)})
  sy=c.js('scrollY');key('Escape',.25)
  out['echap']=c.js('({expanded:__v.button().getAttribute("aria-expanded"),hidden:__v.panel().hidden,focusOnButton:document.activeElement===__v.button(),focusVisible:document.activeElement.matches(":focus-visible"),scrollY})');out['echap']['scrollYAvant']=sy
  # Ouverture au clavier (Flèche haut : dernière option), puis Entrée sur « populaires ».
  key('ArrowUp',.3);i=c.js('__v.info()');out['ouvertureClavier']={'direction':i['direction'],'panel':i['panel'],'focus':c.js(FOCUS)}
  if state=='145' and tag.startswith('fr390'):shot('clavier-'+tag+'-fleche-haut')
  sk=PREFIX[state]+'comments-demo-v1:project:minishell-under-the-prompt'
  before={'ordre':thread_ids(),'brouillon':c.js('document.getElementById("project-comment-input")?.value'),'scrollY':c.js('scrollY')}
  key('Enter',.4)
  after=c.js('({expanded:__v.button().getAttribute("aria-expanded"),focusOnButton:document.activeElement===__v.button(),texte:__v.button().textContent.trim(),titre:__v.button().title,scrollY,brouillon:document.getElementById("project-comment-input")?.value,etat:JSON.parse(sessionStorage.getItem('+json.dumps(sk)+'))})')
  after['ordre']=thread_ids();after['badgeBrouillonReponse']=c.js('Boolean(document.querySelector("[data-comment-action=reply][data-comment-id=qa-middle] .cp-comment-draft"))')
  st=after.pop('etat');after['etat']={'sort':st['sort'],'draft':st['draft'],'replyDrafts':st['replyDrafts'],'nbComments':len(st['comments'])}
  out['entree']={'avant':before,'apres':after,
   'controle':{'trie':after['ordre'][:3]==['qa-middle','qa-new','qa-old'] and st['sort']=='popular','brouillonConserve':after['brouillon']==SEED['draft'] and st['draft']==SEED['draft'],
    'reponseConservee':st['replyDrafts'].get('qa-middle',{}).get('text')=='Réponse conservée' and st['replyDrafts'].get('qa-middle',{}).get('targetId')=='qa-middle',
    'fermeEtFocus':after['expanded']=='false' and after['focusOnButton']}}
  # Retour à « plus récent » : Flèche bas (première option) puis Entrée.
  key('ArrowDown',.3);fb=c.js(FOCUS);key('Enter',.4)
  out['retour']={'focusOuverture':fb,'ordre':thread_ids(),'texte':c.js('__v.button().textContent.trim()'),'focusOnButton':c.js('document.activeElement===__v.button()')}
  # Tab dans le panneau ouvert : fermeture (comportement existant, relevé seulement).
  key('ArrowDown',.3);key('Tab',.3)
  out['tab']=c.js('({expanded:__v.button().getAttribute("aria-expanded"),hidden:__v.panel().hidden,active:__v.name(document.activeElement)})')
  out['erreurs']=c.js('window.qaErrors||[]')
  ok=lambda e:e['focus']['inPanel'] and e['focus']['visibleInPanel'] and e['focus']['centreHit']
  vals=[e['focus']['value'] for e in out['etapes']]
  out['bilan']={'sequenceFocus':vals,'attendu':['newest','oldest','popular','newest','popular','newest','popular','oldest','popular'],
   'toujoursVisible':all(ok(e) for e in out['etapes']),'panneauImmobile':len({(e['focus']['panelTop'],e['focus']['panelBottom']) for e in out['etapes']})==1,
   'pageImmobile':len({e['focus']['scrollY'] for e in out['etapes']})==1,'echapOk':out['echap']['expanded']=='false' and out['echap']['focusOnButton'] and out['echap']['scrollY']==sy}
  out['bilan']['sequenceOk']=out['bilan']['sequenceFocus']==out['bilan']['attendu']
  record('clavier-'+tag,out)
 return go
run('09-clavier',[('A',scenario('145',390,844,'fr','light','fr390-145',rel=60)),('B',scenario('145',320,640,'ar','dark','ar320-145-borne',top=270)),
 ('C',scenario('144',390,844,'fr','light','fr390-144',rel=60))],budget=200)
