"""Zone « contraste » (D3), 15 octobre 2026 — analyse des compléments de la reprise.
 1. État pressé (:active) 144 / 145, sombre et clair : toutes les propriétés calculées, contraste réel.
 2. Écran d'erreur en clair : instantanés de couleurs 144 / 145 (seul l'affichage du compte doit changer).
 3. Panneau ouvert sur l'écran d'erreur (145) : « Créer un compte » clair et sombre comparé au même
    bouton après l'entrée (145 et 144), contraste réel, anneau de focus ; retour au clair.
 4. Panneau sombre sur l'écran d'erreur : couleurs de tout le sous-arbre #account-menu comparées à
    celles du panneau sombre de content-preview (145).
 5. Rappel des bancs « mouvement réel » (sans prefers-reduced-motion).
 6. Planche : écran d'erreur clair 144 / 145, panneau sur l'écran d'erreur (145), état pressé.
Lit uniquement les JSON et captures de ce dossier et les instantanés du scratchpad ; écrit ici.
"""
import json,math,statistics
from collections import Counter
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
EVID=Path('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/contraste')
SHOTS=EVID/'captures'
def lin(v):
 v=v/255
 return v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4
def L(p):r,g,b=[lin(v) for v in p[:3]];return 0.2126*r+0.7152*g+0.0722*b
def ratio(a,b):
 la,lb=L(a),L(b);hi,lo=max(la,lb),min(la,lb);return (hi+0.05)/(lo+0.05)
def rgb(s):
 parts=[float(x) for x in s[s.index('(')+1:s.index(')')].replace('/',',').split(',')]
 return tuple(int(round(v)) for v in parts[:3]),(parts[3] if len(parts)>3 else 1.0)
def px(v):return float(str(v).replace('px','') or 0)
def load(name):
 p=EVID/name
 return json.loads(p.read_text()) if p.exists() else None
C={m:load(f'complement-{m}.json') for m in ['144','145']}
ARR={m:load(f'arrival-{m}.json') for m in ['144','145']}
PAN={m:load(f'panel-{m}.json') for m in ['144','145']}
MOT={m:load(f'motion-{m}.json') for m in ['144','145']}
OUT={'runs':{},'pressed':{},'errorLightSnapshots':{},'errorPanel':{},'errorPanelSubtree':{},'motion':{},'summary':{}}
for m,R in C.items():OUT['runs'][m]={k:R.get(k) for k in ['started','passed','failure','durationSeconds','sourcesUnchanged','errors','skipped']}
def analyse_pair(p,nominal):
 N=Image.open(p['normal']).convert('RGB');B=Image.open(p['blank']).convert('RGB');W,H=N.size
 n=N.load();b=B.load();ox,oy=p['clip'][0],p['clip'][1];t=p['text']
 x0=max(0,math.floor(t['x']-ox)-1);y0=max(0,math.floor(t['y']-oy)-1);x1=min(W,math.ceil(t['x']+t['w']-ox)+1);y1=min(H,math.ceil(t['y']+t['h']-oy)+1)
 bg=[b[x,y] for y in range(y0,y1) for x in range(x0,x1)]
 bgL=sorted(bg,key=L);med=bgL[len(bgL)//2]
 text=[]
 for y in range(y0,y1):
  for x in range(x0,x1):
   d=sum(abs(n[x,y][i]-b[x,y][i]) for i in range(3))
   if d>24:text.append((d,n[x,y],b[x,y]))
 text.sort(key=lambda q:-q[0]);top=text[:max(5,len(text)//10)] if text else []
 core=tuple(int(statistics.median(q[1][i] for q in top)) for i in range(3)) if top else None
 best=max(text,key=lambda q:ratio(q[1],q[2])) if text else None
 bx=p['box'];r=px(p.get('radius','0px'))
 ix0=max(0,math.ceil(bx['x']-ox+r));ix1=min(W,math.floor(bx['x']+bx['w']-ox-r));iy0=max(0,math.ceil(bx['y']-oy+3));iy1=min(H,math.floor(bx['y']+bx['h']-oy-3))
 inner=Counter(b[x,y] for y in range(iy0,iy1) for x in range(ix0,ix1))
 # Verre du panneau juste à gauche du bouton (pour le contour du bouton, simple constat).
 gx=max(0,int(round(bx['x']-ox))-3);gy=int(round(bx['y']-oy+bx['h']/2))
 return {'computedBackground':p.get('backgroundColor'),'computedColor':p.get('color'),'label':p.get('label'),'transparentCheck':p.get('transparentCheck'),'restoredColor':p.get('restoredColor'),
  'backgroundPixels':len(bg),'backgroundMedian':med,'backgroundDarkest':bgL[0],'backgroundLightest':bgL[-1],
  'textPixels':len(text),'coreTextColour':core,'textPixelsExactlyNominal':sum(1 for q in text if q[1]==nominal),
  'contrastNominalVsMedianBackground':round(ratio(nominal,med),3),
  'contrastNominalWorstBackgroundPixel':round(min(ratio(nominal,v) for v in bg),3),
  'contrastCoreVsMedianBackground':round(ratio(core,med),3) if core else None,
  'contrastBestTextPixel':round(ratio(best[1],best[2]),3) if best else None,
  'buttonInnerDistinctColours':len(inner),'buttonInnerTopColours':[[list(k),v] for k,v in inner.most_common(2)],
  'glassLeftOfButton':b[gx,gy],'contrastButtonFillVsGlass':round(ratio(inner.most_common(1)[0][0],b[gx,gy]),3) if inner else None}
def ring(p,finfo):
 N=Image.open(p['normal']).convert('RGB');n=N.load();ox,oy=p['clip'][0],p['clip'][1];bx=p['box']
 xl=int(round(bx['x']-ox));ym=int(round(bx['y']-oy+bx['h']/2))
 oc,_=rgb(finfo['outlineColor'])
 return {'visible':finfo['visible'],'outlineColor':finfo['outlineColor'],'outlineStyle':finfo['outlineStyle'],'outlineWidth':finfo['outlineWidth'],'outlineOffset':finfo['outlineOffset'],
  'ringPixels':[n[xl,ym],n[xl+1,ym]],'inside':n[xl+4,ym],'outside':n[xl-2,ym],
  'ringPixelsMatchOutline':all(tuple(v)==oc for v in [n[xl,ym],n[xl+1,ym]]),
  'contrastOutlineVsInside':round(ratio(oc,n[xl+4,ym]),3),'contrastOutlineVsOutside':round(ratio(oc,n[xl-2,ym]),3)}
def diff(a,b):
 sa,sb=a['style'],b['style']
 return {p:[sa.get(p),sb.get(p)] for p in sorted(set(sa)|set(sb)) if sa.get(p)!=sb.get(p)}
# ---------------------------------------------------------------- 1. état pressé
for value in ['dark','light']:
 a=C['144']['pressed'][value];b=C['145']['pressed'][value]
 d=diff(a['computed'],b['computed']);ds=diff(a['signinWhilePressed'],b['signinWhilePressed'])
 OUT['pressed'][value]={'active144':[a['active'],a['activeAfterPair']],'active145':[b['active'],b['activeAfterPair']],'dialog':[a['dialogKind'],b['dialogKind']],
  'signupDiffs':d,'signupPropsCompared':len(set(a['computed']['style'])|set(b['computed']['style'])),'signinWhilePressedDiffs':ds,
  'contrast144':analyse_pair(a['pair'],rgb(a['pair']['color'])[0]),'contrast145':analyse_pair(b['pair'],rgb(b['pair']['color'])[0])}
# ---------------------------------------------------------------- 2. instantanés de l'écran d'erreur en clair
def snapdiff(fa,fb):
 A=json.loads(Path(fa).read_text());B=json.loads(Path(fb).read_text());props=A['props']
 ma,mb=dict(A['items']),dict(B['items']);changed=[]
 for path in sorted(set(ma)&set(mb)):
  if ma[path]!=mb[path]:
   va,vb=ma[path].split('|'),mb[path].split('|')
   changed.append({'path':path,'diffs':{props[i]:[va[i],vb[i]] for i in range(len(props)) if va[i]!=vb[i]}})
 return {'elements':[A['count'],B['count']],'onlyIn144':sorted(set(ma)-set(mb)),'onlyIn145':sorted(set(mb)-set(ma)),'changedCount':len(changed),'changed':changed}
OUT['errorLightSnapshots']=snapdiff(C['144']['snapshots']['erreur-light']['file'],C['145']['snapshots']['erreur-light']['file'])
OUT['errorLightButtons']={m:C[m]['errorLight'].get('buttons') for m in C}
OUT['errorLightAccount']={m:C[m]['errorLight'].get('account') for m in C}
# ---------------------------------------------------------------- 3. panneau sur l'écran d'erreur (145)
E=C['145']['errorLight'];A145=ARR['145']['after'];A144=ARR['144']['after']
P=OUT['errorPanel']
P['theme']={'start':E['theme'],'afterPanelSwitch':E.get('themeAfterPanelSwitch'),'entryAfterPanelSwitch':E.get('entryAfterPanelSwitch'),'back':E.get('themeBack'),'entryAtEnd':E.get('entryAtEnd')}
P['vsAfterEntry145']={'light':diff(E['lightSignup'],A145['light']['signup']),'dark':diff(E['darkSignup'],A145['dark']['signup']),'darkHover':diff(E['darkSignupHover'],A145['dark']['signupHover']),'darkFocus':diff(E['darkSignupFocus'],A145['dark']['signupFocus']),'signinLight':diff(E['lightSignin'],A145['light']['signin']),'signinDark':diff(E['darkSignin'],A145['dark']['signin'])}
P['vsAfterEntry144']={'light':diff(A144['light']['signup'],E['lightSignup']),'dark':diff(A144['dark']['signup'],E['darkSignup']),'darkFocus':diff(A144['dark']['signupFocus'],E['darkSignupFocus'])}
P['lightAgainVsLight']=diff(E['lightSignup'],E['lightSignupAgain'])
P['contrast']={'light':analyse_pair(E['pairLight'],rgb(E['pairLight']['color'])[0]),'darkRest':analyse_pair(E['pairDarkRest'],rgb(E['pairDarkRest']['color'])[0]),'darkHover':analyse_pair(E['pairDarkHover'],rgb(E['pairDarkHover']['color'])[0]),'darkFocus':analyse_pair(E['pairDarkFocus'],rgb(E['pairDarkFocus']['color'])[0])}
P['focusRing']=ring(E['pairDarkFocus'],E['darkFocusInfo']);P['tabsToSignup']=E.get('tabsToSignup')
# ---------------------------------------------------------------- 4. sous-arbre #account-menu : écran d'erreur sombre vs content-preview sombre (145)
def subtree(file):
 D=json.loads(Path(file).read_text());props=D['props'];out={}
 for path,val in D['items']:
  if 'section#account-menu' in path:out[path[path.index('section#account-menu'):]]=val.split('|')
 return props,out
props,sa=subtree(C['145']['snapshots']['erreur-dark-panneau-ouvert']['file'])
_,sb=subtree(PAN['145']['snapshots']['p1280-dark']['file'])
ch=[]
for k in sorted(set(sa)&set(sb)):
 if sa[k]!=sb[k]:ch.append({'path':k,'diffs':{props[i]:[sb[k][i],sa[k][i]] for i in range(len(props)) if sa[k][i]!=sb[k][i]}})
OUT['errorPanelSubtree']={'note':'valeurs [content-preview #projects sombre, écran d’erreur sombre], état 145','elements':[len(sb),len(sa)],'onlyInContentPreview':sorted(set(sb)-set(sa)),'onlyInError':sorted(set(sa)-set(sb)),'changedCount':len(ch),'changed':ch}
# ---------------------------------------------------------------- 5. mouvement réel
for m,R in MOT.items():
 if R:OUT['motion'][m]={'reducedMotionMatches':R.get('reducedMotionMatches'),'transition':R.get('transition'),'menuAnimation':R.get('menuAnimation'),'states':{k:{'bg':v['computed']['backgroundColor'],'color':v['computed']['color'],'transform':v['computed']['transform'],'contrast':v['contrast']['contrastNominal'],'medianBackground':v['contrast']['medianBackground'],'bestTextPixel':v['contrast']['contrastBestTextPixel']} for k,v in R['states'].items()},'focusVisible':R['states']['focus']['focusInfo']['visible'],'focusOutline':R['states']['focus']['focusInfo']['outlineColor']}
# ---------------------------------------------------------------- 6. planche
FONT=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
SMALL=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
def tile(im,label,sub=''):
 w,h=im.size;canvas=Image.new('RGB',(w+20,h+58),(245,245,245));canvas.paste(im,(10,48))
 d=ImageDraw.Draw(canvas);d.text((10,6),label,fill=(20,20,20),font=FONT);d.text((10,26),sub,fill=(80,80,80),font=SMALL);return canvas
def row(tiles):
 W=sum(t.size[0] for t in tiles);H=max(t.size[1] for t in tiles);canvas=Image.new('RGB',(W,H),(245,245,245));x=0
 for t in tiles:canvas.paste(t,(x,0));x+=t.size[0]
 return canvas
def column(rows):
 W=max(r.size[0] for r in rows);H=sum(r.size[1] for r in rows);canvas=Image.new('RGB',(W,H),(245,245,245));y=0
 for r in rows:canvas.paste(r,(0,y));y+=r.size[1]
 return canvas
def page(name,scale=.36):
 im=Image.open(SHOTS/name).convert('RGB');return im.resize((int(im.size[0]*scale),int(im.size[1]*scale)),Image.LANCZOS)
def crop_button(p,margin=10):
 im=Image.open(p['normal']).convert('RGB');ox,oy=p['clip'][0],p['clip'][1];bx=p['box']
 return im.crop((int(bx['x']-ox-margin),int(bx['y']-oy-margin),int(bx['x']-ox+bx['w']+margin),int(bx['y']-oy+bx['h']+margin)))
def menu(p):return Image.open(p['normal']).convert('RGB')
rows=[row([tile(page('144-erreur-light-page.png'),'144 écran d’erreur, clair','compte : '+('visible' if OUT['errorLightAccount']['144']['switcherDisplay']!='none' else 'masqué')),
           tile(page('145-erreur-light-page.png'),'145 écran d’erreur, clair','compte : '+('visible' if OUT['errorLightAccount']['145']['switcherDisplay']!='none' else 'masqué'))])]
pc=P['contrast']
rows.append(row([tile(menu(E['pairLight']),'145 erreur : panneau clair',f"texte/fond {pc['light']['contrastNominalVsMedianBackground']}:1"),
                 tile(menu(E['pairDarkRest']),'145 erreur : sombre (panneau)',f"texte/fond {pc['darkRest']['contrastNominalVsMedianBackground']}:1"),
                 tile(menu(E['pairDarkFocus']),'145 erreur : sombre, focus',f"anneau/encre {P['focusRing']['contrastOutlineVsInside']}:1")]))
pr=OUT['pressed']
rows.append(row([tile(crop_button(C['144']['pressed']['dark']['pair']),'144 pressé, sombre',f"{pr['dark']['contrast144']['contrastNominalVsMedianBackground']}:1"),
                 tile(crop_button(C['145']['pressed']['dark']['pair']),'145 pressé, sombre',f"{pr['dark']['contrast145']['contrastNominalVsMedianBackground']}:1"),
                 tile(crop_button(C['145']['pressed']['light']['pair']),'145 pressé, clair',f"{pr['light']['contrast145']['contrastNominalVsMedianBackground']}:1")]))
comp=column(rows);comp.save(EVID/'composite-complement-erreur-presse.png')
OUT['summary']['composite']=str(EVID/'composite-complement-erreur-presse.png');OUT['summary']['compositeSize']=comp.size
OUT['summary']['inkVsGlass']=round(ratio((27,27,27),(41,41,46)),3)
(EVID/'analyse-complement.json').write_text(json.dumps(OUT,ensure_ascii=False,indent=1)+'\n')
brief={'runs':OUT['runs'],
 'pressed':{v:{'active':[x['active144'],x['active145']],'dialog':x['dialog'],'diffs':x['signupDiffs'],'props':x['signupPropsCompared'],'signinDiffs':x['signinWhilePressedDiffs'],'c144':x['contrast144']['contrastNominalVsMedianBackground'],'c145':x['contrast145']['contrastNominalVsMedianBackground'],'med144':x['contrast144']['backgroundMedian'],'med145':x['contrast145']['backgroundMedian'],'best144':x['contrast144']['contrastBestTextPixel'],'best145':x['contrast145']['contrastBestTextPixel']} for v,x in OUT['pressed'].items()},
 'errorLightSnapshots':{k:(v if k!='changed' else v[:6]) for k,v in OUT['errorLightSnapshots'].items()},
 'errorLightButtons':OUT['errorLightButtons'],
 'errorPanel':{k:v for k,v in P.items() if k!='contrast'},
 'errorPanelContrast':{k:{f:v[f] for f in ['computedBackground','computedColor','backgroundMedian','coreTextColour','textPixelsExactlyNominal','contrastNominalVsMedianBackground','contrastNominalWorstBackgroundPixel','contrastBestTextPixel','buttonInnerDistinctColours','glassLeftOfButton','contrastButtonFillVsGlass','transparentCheck','restoredColor']} for k,v in P['contrast'].items()},
 'errorPanelSubtree':{k:(v if k!='changed' else v[:8]) for k,v in OUT['errorPanelSubtree'].items()},
 'motion':OUT['motion'],'summary':OUT['summary']}
print(json.dumps(brief,ensure_ascii=False,indent=1))
