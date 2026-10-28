"""Zone « contraste » (D3), 15 octobre 2026 — contrôle complémentaire SANS l'émulation
« prefers-reduced-motion » (transitions réelles .2 s et animation d'ouverture du panneau) :
content-preview.html#projects 1280×900, globe bloqué, sombre. Usage : bench_motion.py 145|144
Repos, survol (relevé après 0,6 s) et focus clavier : propriétés calculées et contraste mesuré
sur une paire d'images (normale / texte transparent), calculé ici même avec PIL.
"""
import sys,time,json,math,statistics
exec(open('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/contraste/helper.py').read())
from PIL import Image
mode=sys.argv[1] if len(sys.argv)>1 else '145'
assert mode in PREFIX,mode
prefix=PREFIX[mode]
SIGNUP='[data-account-action=signup]'
R={'mode':mode,'started':time.strftime('%Y-%m-%d %H:%M:%S'),'sourcesBefore':hashes(),'reducedMotionEmulated':False,'states':{},'passed':False}
started=time.time()
def lin(v):
 v=v/255
 return v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4
def Lum(p):r,g,b=[lin(v) for v in p[:3]];return 0.2126*r+0.7152*g+0.0722*b
def ratio(a,b):
 la,lb=Lum(a),Lum(b);hi,lo=max(la,lb),min(la,lb);return round((hi+0.05)/(lo+0.05),3)
def measure_pair(p):
 N=Image.open(p['normal']).convert('RGB').load();B=Image.open(p['blank']).convert('RGB').load();ox,oy=p['clip'][0],p['clip'][1];t=p['text']
 xs=range(math.floor(t['x']-ox)-1,math.ceil(t['x']+t['w']-ox)+1);ys=range(math.floor(t['y']-oy)-1,math.ceil(t['y']+t['h']-oy)+1)
 bg=sorted((B[x,y] for y in ys for x in xs),key=Lum);med=bg[len(bg)//2]
 text=[N[x,y] for y in ys for x in xs if sum(abs(N[x,y][i]-B[x,y][i]) for i in range(3))>24]
 nominal=tuple(int(v) for v in p['color'][p['color'].index('(')+1:-1].split(',')[:3])
 best=max(text,key=lambda q:ratio(q,med)) if text else None
 return {'medianBackground':med,'lightestBackground':bg[-1],'nominal':nominal,'contrastNominal':ratio(nominal,med),'contrastWorstBackground':ratio(nominal,bg[-1]),'bestTextPixel':best,'contrastBestTextPixel':ratio(best,med) if best else None,'textPixels':len(text)}
c=Chrome();h=make(c);globals().update(h)
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':QA_ERRORS})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 R['reducedMotionMatches']=None
 c.width(1280,900);c.call('Page.navigate',{'url':BASE+prefix+'content-preview.html?qa=verif-contraste-mouvement-'+mode+'#projects'})
 wait('document.body&&document.body.dataset.entry==="welcome"&&Boolean(document.querySelector("#profile"))',30)
 c.js('document.fonts.ready.then(()=>true)');time.sleep(.8)
 R['reducedMotionMatches']=c.js('matchMedia("(prefers-reduced-motion: reduce)").matches')
 settings('fr','dark');key('Escape');away();assert theme()=='dark'
 click('#profile');wait('!document.querySelector("#account-menu").hidden');away();time.sleep(.6)
 R['transition']=c.js('getComputedStyle(document.querySelector('+json.dumps(SIGNUP)+')).transition')
 R['menuAnimation']=c.js('getComputedStyle(document.querySelector("#account-menu")).animationName')
 clip=menu_clip()
 R['states']['repos']={'computed':brief(SIGNUP),'pair':pair(SIGNUP,f'{mode}-mouvement-repos',clip)}
 hover(SIGNUP,settle=.6)
 R['states']['survol']={'computed':brief(SIGNUP),'pair':pair(SIGNUP,f'{mode}-mouvement-survol',clip)}
 away();time.sleep(.4)
 c.js('(()=>{const e=document.querySelector("#account-menu [data-account-action=close]")||document.querySelector("#account-menu button");e.focus()})()')
 tab_to('document.activeElement&&document.activeElement.dataset.accountAction==="signup"');time.sleep(.4)
 R['states']['focus']={'computed':brief(SIGNUP),'focusInfo':focus_info(),'pair':pair(SIGNUP,f'{mode}-mouvement-focus',clip)}
 for name,s in R['states'].items():
  s['contrast']=measure_pair(s['pair'])
  print(mode,name,s['computed']['backgroundColor'],s['computed']['color'],s['computed']['transform'],'contraste',s['contrast']['contrastNominal'],s['contrast']['medianBackground'],flush=True)
 R['errors']=errors();R['passed']=True
except Exception as error:
 R['failure']=repr(error)
 try:shot(f'{mode}-mouvement-echec')
 except Exception:pass
 print('FAILURE',repr(error),flush=True)
finally:
 R['durationSeconds']=round(time.time()-started,1);R['sourcesAfter']=hashes();R['sourcesUnchanged']=R['sourcesBefore']==R['sourcesAfter']
 save(f'motion-{mode}',R);cleanup(c)
