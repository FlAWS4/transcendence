import json, sys, pathlib, re
from PIL import Image, ImageChops, ImageDraw, ImageOps
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
idx = json.load(open(BASE / 'verification/entrance/arrival/aligned/index.json'))
for r in idx:
    st = r['state']; mobile = '--mobile--' in st
    W, H = (390, 844) if mobile else (1440, 960)
    site = Image.open(BASE / 'reference/entrance' / (st + '.png')).convert('RGB').resize((W, H), Image.LANCZOS)
    crop = Image.open(r['crop']).convert('RGB').resize((W, H), Image.LANCZOS)
    box = (0, 280, 390, 720) if mobile else (240, 290, 1200, 720)
    a = site.crop(box); b = crop.crop(box)
    diff = ImageChops.difference(a, b)
    diff = ImageOps.autocontrast(diff.convert('L')).convert('RGB')
    scale = 2 if mobile else 1
    a = a.resize((a.width * scale, a.height * scale), Image.LANCZOS); b = b.resize(a.size, Image.LANCZOS); diff = diff.resize(a.size)
    if mobile:
        board = Image.new('RGB', (a.width * 3 + 40, a.height + 24), (70, 70, 70))
        for i, im in enumerate((a, b, diff)): board.paste(im, (i * (a.width + 20), 24))
        d = ImageDraw.Draw(board)
        for i, t in enumerate(('site', 'Figma', 'difference (contraste auto)')): d.text((i * (a.width + 20) + 4, 6), t, fill=(255, 255, 255))
    else:
        board = Image.new('RGB', (a.width, a.height * 3 + 3 * 24), (70, 70, 70))
        for i, im in enumerate((a, b, diff)): board.paste(im, (0, 24 + i * (a.height + 24)))
        d = ImageDraw.Draw(board)
        for i, t in enumerate(('site', 'Figma', 'difference (contraste auto)')): d.text((4, 6 + i * (a.height + 24)), t, fill=(255, 255, 255))
    fn = 'detail_' + pathlib.Path(r['board']).name
    board.save(out / fn)
    print(out / fn)
