"""Side-by-side crops (PIL) with a caption above each panel. python3 -I planche.py out.png 'label=path:x0,y0,x1,y1:scale' ..."""
import sys
from PIL import Image, ImageDraw, ImageFont
out, specs = sys.argv[1], sys.argv[2:]
panels = []
for spec in specs:
    label, rest = spec.split('=', 1)
    path, box, scale = rest.rsplit(':', 2)
    img = Image.open(path).convert('RGB')
    x0, y0, x1, y1 = [int(float(v)) for v in box.split(',')]
    crop = img.crop((x0, y0, min(x1, img.width), min(y1, img.height)))
    f = float(scale)
    crop = crop.resize((max(1, int(crop.width * f)), max(1, int(crop.height * f))), Image.LANCZOS)
    panels.append((label, crop))
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
except OSError: font = ImageFont.load_default()
pad, cap = 10, 24
W = sum(p.width for _, p in panels) + pad * (len(panels) + 1)
H = max(p.height for _, p in panels) + cap + pad * 2
sheet = Image.new('RGB', (W, H), (255, 255, 255))
draw = ImageDraw.Draw(sheet); x = pad
for label, p in panels:
    draw.text((x, pad // 2), label, fill=(0, 0, 0), font=font)
    sheet.paste(p, (x, cap + pad)); draw.rectangle([x - 1, cap + pad - 1, x + p.width, cap + pad + p.height], outline=(200, 0, 0))
    x += p.width + pad
sheet.save(out)
print(out, sheet.size)
