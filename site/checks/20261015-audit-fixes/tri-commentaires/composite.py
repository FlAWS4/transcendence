# Composite des captures (sans Chrome) : chaque entrée = (fichier, légende) ; rangées de captures
# réduites, légendées. Usage : python3 -I composite.py sortie.png échelle "f1|légende1" "f2|légende2" ...
# Une valeur "--" commence une nouvelle rangée.
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
OUT=Path('/home/le-rif/Bureau/Transcendence/site/checks/20261015-audit-fixes/tri-commentaires')
target=OUT/sys.argv[1];scale=float(sys.argv[2])
rows=[[]]
for arg in sys.argv[3:]:
 if arg=='--':rows.append([]);continue
 f,label=arg.split('|',1);rows[-1].append((OUT/f,label))
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',14)
pad=10;head=40
built=[]
for row in rows:
 ims=[]
 for f,label in row:
  im=Image.open(f).convert('RGB');im=im.resize((round(im.width*scale),round(im.height*scale)),Image.LANCZOS);ims.append((im,label))
 w=sum(im.width for im,_ in ims)+pad*(len(ims)+1);h=max(im.height for im,_ in ims)+head+pad
 canvas=Image.new('RGB',(w,h),(245,245,245));d=ImageDraw.Draw(canvas);x=pad
 for im,label in ims:
  lines=label.split('\\n')
  for i,line in enumerate(lines):d.text((x,4+i*17),line,fill=(20,20,20),font=font)
  canvas.paste(im,(x,head));d.rectangle([x-1,head-1,x+im.width,head+im.height],outline=(120,120,120));x+=im.width+pad
 built.append(canvas)
W=max(b.width for b in built);H=sum(b.height for b in built)
final=Image.new('RGB',(W,H),(245,245,245));y=0
for b in built:final.paste(b,(0,y));y+=b.height
final.save(target,optimize=True);print(target,final.size)
