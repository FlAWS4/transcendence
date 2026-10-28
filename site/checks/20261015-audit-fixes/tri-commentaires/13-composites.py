# 13 — Composites sans navigateur (reprise du 15 octobre 2026), à partir des captures déjà faites :
#  composite-d2-avant-apres.png : rangée 1 = demande de la consigne (144 contre 145, FR 390 près du bas et AR 320 avec
#    « remonter ») ; rangée 2 = compléments (FR 390 avec « remonter » visible ; cas résiduels : bouton de tri sous le
#    « remonter » en AR 320, sous la capsule de recherche en FR 390).
#  composite-d2-residuel-zoom.png : recadrages à l'échelle 1 des cas résiduels (144 contre 145).
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
OUT=Path('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires')
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',13)
def build(rows,scale,target,head=40,pad=10):
 built=[]
 for row in rows:
  ims=[]
  for f,label,crop in row:
   im=Image.open(OUT/f).convert('RGB')
   if crop:im=im.crop(crop)
   if scale!=1:im=im.resize((round(im.width*scale),round(im.height*scale)),Image.LANCZOS)
   ims.append((im,label))
  w=sum(im.width for im,_ in ims)+pad*(len(ims)+1);h=max(im.height for im,_ in ims)+head+pad
  canvas=Image.new('RGB',(w,h),(245,245,245));d=ImageDraw.Draw(canvas);x=pad
  for im,label in ims:
   for i,line in enumerate(label.split('\n')):d.text((x,4+i*16),line,fill=(20,20,20),font=font)
   canvas.paste(im,(x,head));d.rectangle([x-1,head-1,x+im.width,head+im.height],outline=(120,120,120));x+=im.width+pad
  built.append(canvas)
 W=max(b.width for b in built);H=sum(b.height for b in built)
 final=Image.new('RGB',(W,H),(245,245,245));y=0
 for b in built:final.paste(b,(0,y));y+=b.height
 final.save(OUT/target,optimize=True);print(target,final.size)
build([
 [('fr390-144-iii-60.png','144 FR 390 (iii) 60 px\npanneau coupé',None),('fr390-145-iii-60.png','145 FR 390 (iii) 60 px\nouvert vers le haut',None),
  ('ar320-144-audit-centre.png','144 AR 320 centre\nremonter dessus',None),('ar320-145-audit-centre.png','145 AR 320 centre\ndégagé',None)],
 [('fr390-remonter-144-250.png','144 FR 390 haut 250\n« remonter » visible',None),('fr390-remonter-145-250.png','145 FR 390 haut 250\n« remonter » visible',None),
  ('ar320-residuel-144-480.png','144 AR 320 · 480\nsous remonter',None),('ar320-residuel-145-480.png','145 AR 320 · 480\nsous remonter',None),
  ('fr390-capsule-145-748.png','145 FR 390 · 748\nsous la capsule',None)]],.5,'composite-d2-avant-apres.png')
build([[('ar320-residuel-144-480.png','144 AR 320 · haut 480',(0,270,320,640)),('ar320-residuel-145-480.png','145 AR 320 · haut 480',(0,270,320,640)),
  ('fr390-capsule-145-748.png','145 FR 390 · haut 748',(0,560,390,844))]],1,'composite-d2-residuel-zoom.png',head=24)
