"""Zone « contraste » (D3), 15 octobre 2026 — analyse hors navigateur des relevés 144 / 145.
 1. Contraste réel du texte de « Créer un compte » : paires d'images normale / texte transparent
    (fond médian sous la boîte du texte, pixels de texte les plus marqués, rapport WCAG 2) ;
    uniformité du fond du bouton ; anneau de focus (couleur, contraste contre l'intérieur et l'extérieur).
 2. Différences de TOUTES les propriétés calculées entre 144 et 145 pour chaque bouton et chaque état.
 3. Différences des instantanés de couleurs de tous les éléments de la page.
 4. Composite (panneau sombre 144 / 145, clair 145) et agrandissement du bouton en sombre.
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
DATA={(kind,mode):load(f'{kind}-{mode}.json') for kind in ['panel','globe','arrival'] for mode in ['144','145']}
OUT={'pairs':{},'focusRings':{},'computedDiffs':{},'snapshotDiffs':{},'summary':{}}
# ---------------------------------------------------------------- 1. paires d'images
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
 # Fond du bouton sur toute sa boîte, coins arrondis exclus (image sans texte).
 bx=p['box'];r=px(p.get('radius','0px'))
 ix0=max(0,math.ceil(bx['x']-ox+r));ix1=min(W,math.floor(bx['x']+bx['w']-ox-r));iy0=max(0,math.ceil(bx['y']-oy+3));iy1=min(H,math.floor(bx['y']+bx['h']-oy-3))
 inner=Counter(b[x,y] for y in range(iy0,iy1) for x in range(ix0,ix1))
 return {'computedBackground':p.get('backgroundColor'),'computedColor':p.get('color'),'label':p.get('label'),
  'textBoxPx':[x0,y0,x1,y1],'backgroundPixels':len(bg),'backgroundMedian':med,'backgroundDarkest':bgL[0],'backgroundLightest':bgL[-1],
  'textPixels':len(text),'corePixels':len(top),'coreTextColour':core,'textPixelsExactlyNominal':sum(1 for q in text if q[1]==nominal),
  'contrastNominalVsMedianBackground':round(ratio(nominal,med),3),
  'contrastNominalWorstBackgroundPixel':round(min(ratio(nominal,v) for v in bg),3),
  'contrastCoreVsMedianBackground':round(ratio(core,med),3) if core else None,
  'contrastBestTextPixel':round(ratio(best[1],best[2]),3) if best else None,'bestTextPixel':[best[1],best[2]] if best else None,
  'buttonInnerPixels':sum(inner.values()),'buttonInnerDistinctColours':len(inner),'buttonInnerTopColours':[[list(k),v] for k,v in inner.most_common(3)]}
def ring(p,shot_path=None):
 """Anneau de focus : bords gauche et haut au milieu, contour de 2 px décalé de -2 px."""
 N=Image.open(shot_path or p['normal']).convert('RGB');n=N.load();ox,oy=p['clip'][0],p['clip'][1];bx=p['box']
 xl=int(round(bx['x']-ox));ym=int(round(bx['y']-oy+bx['h']/2));xc=int(round(bx['x']-ox+bx['w']/2));yt=int(round(bx['y']-oy))
 return {'left':{'ring':[n[xl,ym],n[xl+1,ym]],'inside':n[xl+4,ym],'outside':n[xl-2,ym]},'top':{'ring':[n[xc,yt],n[xc,yt+1]],'inside':n[xc,yt+5],'outside':n[xc,yt-2]}}
def pairs_of(kind,mode,R):
 found=[]
 if kind in ('panel','globe'):
  for case,v in R['cases'].items():
   for state in ['pairRest','pairHover','pairFocus']:
    if state in v:found.append((f'{case}:{state}',v[state],v.get('signupFocusInfo') if state=='pairFocus' else None))
 else:
  if 'pairRest' in R.get('error',{}):found.append(('erreur-dark:pairRest',R['error']['pairRest'],None))
  for value,v in R.get('after',{}).items():
   for state in ['pairRest','pairHover','pairFocus']:
    if state in v:found.append((f'apres-entree-{value}:{state}',v[state],v.get('signupFocusInfo') if state=='pairFocus' else None))
 return found
for (kind,mode),R in DATA.items():
 if not R:continue
 for name,p,finfo in pairs_of(kind,mode,R):
  nominal,alpha=rgb(p['color'])
  res=analyse_pair(p,nominal)
  if finfo:
   rr=ring(p);oc,_=rgb(finfo['outlineColor'])
   res['focus']={'visible':finfo['visible'],'outlineColor':finfo['outlineColor'],'outlineStyle':finfo['outlineStyle'],'outlineWidth':finfo['outlineWidth'],'outlineOffset':finfo['outlineOffset'],'samples':rr,
    'contrastOutlineVsInside':round(ratio(oc,rr['left']['inside']),3),'contrastOutlineVsOutside':round(ratio(oc,rr['left']['outside']),3),
    'ringPixelsMatchOutline':all(tuple(v)==oc for side in ('left','top') for v in rr[side]['ring'])}
  if name.endswith('pairRest'):res['restEdge']=ring(p)
  OUT['pairs'][f'{mode}:{kind}:{name}']=res
# ---------------------------------------------------------------- 2. propriétés calculées
def elements(kind,R):
 """(clé, dictionnaire computed) pour chaque bouton et chaque état relevés."""
 out=[]
 if kind in ('panel','globe'):
  for case,v in R['cases'].items():
   for k in ['signup','signin','signupHover','signinHover','signinFocus','signupFocus']:
    if v.get(k):out.append((f'{case}:{k}',v[k]))
 else:
  for value,A in R.get('arrival',{}).items():
   for k in ['login','guest','loginHover','guestHover','loginFocus','guestFocus']:
    if A.get(k):out.append((f'arrivee-{value}:{k}',A[k]))
   for i,bt in enumerate(A['dialog']['buttons']):out.append((f'arrivee-{value}:dialogue-{A["dialog"]["kind"]}:bouton{i+1}',bt['computed']))
   out.append((f'arrivee-{value}:dialogue:fermer',A['dialog']['close']))
   if A['dialog'].get('confirmHover'):out.append((f'arrivee-{value}:dialogue:bouton1-survol',A['dialog']['confirmHover']))
  for value,P in R.get('after',{}).items():
   for k in ['signup','signin','signupHover','signupFocus']:
    if P.get(k):out.append((f'apres-entree-{value}:{k}',P[k]))
   for kind2,D in P.get('dialogs',{}).items():
    for i,bt in enumerate(D['buttons']):out.append((f'apres-entree-{value}:dialogue-{kind2}({D["kind"]}):bouton{i+1}',bt['computed']))
    out.append((f'apres-entree-{value}:dialogue-{kind2}:fermer',D['close']))
    if D.get('confirmHover'):out.append((f'apres-entree-{value}:dialogue-{kind2}:bouton1-survol',D['confirmHover']))
 return out
allowed=[];unexpected=[];compared=0;props_compared=0
for kind in ['panel','globe','arrival']:
 A,B=DATA[(kind,'144')],DATA[(kind,'145')]
 if not A or not B:continue
 ea,eb=dict(elements(kind,A)),dict(elements(kind,B))
 for key in sorted(set(ea)|set(eb)):
  if key not in ea or key not in eb:unexpected.append({'element':f'{kind}:{key}','missing':'144' if key not in ea else '145'});continue
  sa,sb=ea[key]['style'],eb[key]['style'];compared+=1;props_compared+=len(set(sa)|set(sb))
  diffs={p:[sa.get(p),sb.get(p)] for p in sorted(set(sa)|set(sb)) if sa.get(p)!=sb.get(p)}
  meta={f:[ea[key].get(f),eb[key].get(f)] for f in ['rect','text','className','lang','hover','focusVisible'] if ea[key].get(f)!=eb[key].get(f)}
  if not diffs and not meta:continue
  record={'element':f'{kind}:{key}','diffs':diffs,'meta':meta,'theme':'dark' if 'dark' in key else 'light'}
  is_dark_signup=('dark' in key) and (':signup' in key) and 'dialogue' not in key
  if is_dark_signup and set(diffs)<={'background-color'} and not meta:allowed.append(record)
  else:unexpected.append(record)
OUT['computedDiffs']={'elementsCompared':compared,'propertiesCompared':props_compared,'allowedDarkSignupBackground':allowed,'unexpected':unexpected}
# ---------------------------------------------------------------- 3. instantanés de couleurs
snapdiffs={}
tags=set()
for kind in ['panel','arrival']:
 for mode in ['144','145']:
  R=DATA[(kind,mode)]
  if R:tags|={(kind,t) for t in R.get('snapshots',{})}
for kind,tag in sorted(tags):
 sa=DATA[(kind,'144')].get('snapshots',{}).get(tag);sb=DATA[(kind,'145')].get('snapshots',{}).get(tag)
 if not sa or not sb:snapdiffs[tag]={'missing':'144' if not sa else '145'};continue
 A=json.loads(Path(sa['file']).read_text());B=json.loads(Path(sb['file']).read_text());props=A['props']
 ma,mb=dict(A['items']),dict(B['items'])
 changed=[]
 for path in sorted(set(ma)&set(mb)):
  if ma[path]!=mb[path]:
   va,vb=ma[path].split('|'),mb[path].split('|')
   changed.append({'path':path,'diffs':{props[i]:[va[i],vb[i]] for i in range(len(props)) if va[i]!=vb[i]}})
 snapdiffs[tag]={'elements144':A['count'],'elements145':B['count'],'onlyIn144':sorted(set(ma)-set(mb))[:20],'onlyIn145':sorted(set(mb)-set(ma))[:20],'onlyCounts':[len(set(ma)-set(mb)),len(set(mb)-set(ma))],'changedCount':len(changed),'changed':changed[:40]}
OUT['snapshotDiffs']=snapdiffs
# ---------------------------------------------------------------- 4. images
FONT=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
SMALL=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
def tile(path,label,sub=''):
 im=Image.open(path).convert('RGB');w,h=im.size
 canvas=Image.new('RGB',(w+20,h+58),(245,245,245));canvas.paste(im,(10,48))
 d=ImageDraw.Draw(canvas);d.text((10,6),label,fill=(20,20,20),font=FONT);d.text((10,26),sub,fill=(80,80,80),font=SMALL);return canvas
def row(tiles):
 W=sum(t.size[0] for t in tiles);H=max(t.size[1] for t in tiles);canvas=Image.new('RGB',(W,H),(245,245,245));x=0
 for t in tiles:canvas.paste(t,(x,0));x+=t.size[0]
 return canvas
def column(rows):
 W=max(r.size[0] for r in rows);H=sum(r.size[1] for r in rows);canvas=Image.new('RGB',(W,H),(245,245,245));y=0
 for r in rows:canvas.paste(r,(0,y));y+=r.size[1]
 return canvas
def cr(mode,kind,name):
 v=OUT['pairs'].get(f'{mode}:{kind}:{name}')
 return f"texte/fond {v['contrastNominalVsMedianBackground']}:1" if v else ''
rows=[]
G=[(SHOTS/'144-g1280-dark-repos-normal.png','144 sombre (vrai globe, 1280)',cr('144','globe','g1280-dark:pairRest')),
   (SHOTS/'145-g1280-dark-repos-normal.png','145 sombre (vrai globe, 1280)',cr('145','globe','g1280-dark:pairRest')),
   (SHOTS/'145-g1280-light-repos-normal.png','145 clair (vrai globe, 1280)',cr('145','globe','g1280-light:pairRest'))]
if all(p.exists() for p,_,_ in G):rows.append(row([tile(*g) for g in G]))
M=[(SHOTS/'144-p390-dark-repos-normal.png','144 sombre (#projects, 390)',cr('144','panel','p390-dark:pairRest')),
   (SHOTS/'145-p390-dark-repos-normal.png','145 sombre (#projects, 390)',cr('145','panel','p390-dark:pairRest')),
   (SHOTS/'145-p390-light-repos-normal.png','145 clair (#projects, 390)',cr('145','panel','p390-light:pairRest'))]
if all(p.exists() for p,_,_ in M):rows.append(row([tile(*m) for m in M]))
if rows:
 comp=column(rows);comp.save(EVID/'composite-panneau-sombre-144-145-clair-145.png');OUT['summary']['composite']=str(EVID/'composite-panneau-sombre-144-145-clair-145.png');OUT['summary']['compositeSize']=comp.size
def zoom(mode,kind,case,state,label,scale=4,margin=8):
 R=DATA[(kind,mode)];p=R['cases'][case][state];im=Image.open(p['normal']).convert('RGB');ox,oy=p['clip'][0],p['clip'][1];bx=p['box']
 box=(int(bx['x']-ox-margin),int(bx['y']-oy-margin),int(bx['x']-ox+bx['w']+margin),int(bx['y']-oy+bx['h']+margin))
 crop=im.crop(box).resize(((box[2]-box[0])*scale,(box[3]-box[1])*scale),Image.NEAREST)
 canvas=Image.new('RGB',(crop.size[0]+20,crop.size[1]+34),(245,245,245));canvas.paste(crop,(10,28));ImageDraw.Draw(canvas).text((10,6),label,fill=(20,20,20),font=FONT);return canvas
Z=[]
for mode,state,label in [('144','pairRest','144 sombre, repos — fond transparent sur le verre'),('145','pairRest','145 sombre, repos — fond encre #1B1B1B'),('145','pairHover','145 sombre, survol'),('145','pairFocus','145 sombre, focus clavier (anneau violet)')]:
 try:Z.append(zoom(mode,'globe','g1280-dark',state,label))
 except Exception as error:OUT['summary'].setdefault('zoomErrors',[]).append(repr(error))
if Z:
 z=column(Z);z.save(EVID/'zoom-creer-un-compte-sombre.png');OUT['summary']['zoom']=str(EVID/'zoom-creer-un-compte-sombre.png');OUT['summary']['zoomSize']=z.size
# ---------------------------------------------------------------- résumé
S=OUT['summary']
S['pinkOnInk']=round(ratio((237,52,145),(27,27,27)),3)
S['focusVioletOnInk']=round(ratio((150,163,235),(27,27,27)),3)
S['contrastBySituation']={k:{f:v[f] for f in ['computedBackground','computedColor','backgroundMedian','coreTextColour','textPixelsExactlyNominal','contrastNominalVsMedianBackground','contrastNominalWorstBackgroundPixel','contrastCoreVsMedianBackground','contrastBestTextPixel','buttonInnerDistinctColours']} for k,v in OUT['pairs'].items()}
S['unexpectedComputedDiffs']=len(unexpected);S['allowedComputedDiffs']=len(allowed)
(EVID/'analyse.json').write_text(json.dumps(OUT,ensure_ascii=False,indent=1)+'\n')
print(json.dumps({'summary':S,'computed':{'compared':compared,'props':props_compared,'allowed':[a['element'] for a in allowed],'unexpected':unexpected[:12]},'snapshots':{k:{f:v.get(f) for f in ['elements144','elements145','onlyCounts','changedCount']} for k,v in snapdiffs.items()}},ensure_ascii=False,indent=1))
