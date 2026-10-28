"""Zone « contraste », 15 octobre 2026 — non-régression des COULEURS sur l'autre écran touché par le
diff (comments.mjs : position du panneau de tri des commentaires). Usage : bench_commentaires.py 145|144
content-preview.html#projects/minishell-under-the-prompt?tab=comments, 1280×900, globe bloqué,
mouvement réduit ; sombre puis clair (thème par le panneau du compte) : instantané des couleurs de
tous les éléments panneau de tri fermé, puis ouvert (clic sur .cp-comments-sort), relevé des couleurs
du panneau et de ses options, capture du panneau ouvert. La POSITION du panneau n'est pas jugée ici
(zone « tri-commentaires ») ; seules les couleurs et propriétés de rendu sont comparées 144 / 145.
Écrit uniquement dans le dossier de preuves de la zone et dans le scratchpad verif-contraste.
"""
import sys,time,json
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/contraste/helper.py').read())
mode=sys.argv[1] if len(sys.argv)>1 else '145'
assert mode in PREFIX,mode
prefix=PREFIX[mode]
R={'mode':mode,'started':time.strftime('%Y-%m-%d %H:%M:%S'),'sourcesBefore':hashes(),'cases':{},'snapshots':{},'passed':False}
started=time.time()
c=Chrome();h=make(c);globals().update(h)
PANEL='#project-comment-sort-menu'
def panel_open():return c.js('Boolean(document.querySelector("#account-menu"))&&!document.querySelector("#account-menu").hidden')
def close_panel():
 if panel_open():key('Escape')
 away()
def snap(tag):
 data=snapshot();path=TMP/f'snap-{mode}-{tag}.json';path.write_text(json.dumps(data,ensure_ascii=False));R['snapshots'][tag]={'count':data['count'],'file':str(path)}
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':QA_ERRORS})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.width(1280,900);c.call('Page.navigate',{'url':BASE+prefix+'content-preview.html?qa=verif-contraste-commentaires-'+mode+'#projects/minishell-under-the-prompt?tab=comments'})
 wait('document.body&&document.body.dataset.entry==="welcome"&&Boolean(document.querySelector(".cp-comments-sort"))',30)
 c.js('document.fonts.ready.then(()=>true)');time.sleep(1)
 for value in ['dark','light']:
  settings('fr',value);close_panel();assert theme()==value,('theme',theme())
  c.js('scrollTo(0,0)');time.sleep(.3)
  K={'theme':theme(),'hash':c.js('location.hash')}
  snap(f'commentaires-{value}-ferme')
  click('.cp-comments-sort');wait('Boolean(document.querySelector('+json.dumps(PANEL)+'))&&!document.querySelector('+json.dumps(PANEL)+').hidden',8);time.sleep(.3)
  K['button']=brief('.cp-comments-sort');K['panel']=brief(PANEL)
  K['options']=c.js('[...document.querySelectorAll('+json.dumps(PANEL+' [role=menuitemradio],'+PANEL+' button')+')].map(b=>{const s=getComputedStyle(b);return[b.textContent.trim(),s.backgroundColor,s.color,b.matches(":focus-visible")]})')
  K['panelStyle']=computed(PANEL)['style']
  K['scrollY']=c.js('scrollY')
  p=K['panel'];shot(f'{mode}-commentaires-{value}-tri-ouvert',(p['x']-14,p['y']-14,p['width']+28,p['height']+28))
  snap(f'commentaires-{value}-ouvert')
  key('Escape');time.sleep(.2)
  K['closed']=c.js('document.querySelector('+json.dumps(PANEL)+').hidden')
  R['cases'][value]=K
  print(mode,'commentaires',value,'panneau',{k:p[k] for k in ['x','y','width','height','backgroundColor']},'options',len(K['options']),'fermé',K['closed'],flush=True)
 R['errors']=errors();R['passed']=True
except Exception as error:
 R['failure']=repr(error)
 try:shot(f'{mode}-commentaires-echec');R['failureText']=c.js('document.body.innerText.slice(0,600)')
 except Exception:pass
 print('FAILURE',repr(error),flush=True)
finally:
 R['durationSeconds']=round(time.time()-started,1);R['sourcesAfter']=hashes();R['sourcesUnchanged']=R['sourcesBefore']==R['sourcesAfter']
 save(f'commentaires-{mode}',R);cleanup(c)
