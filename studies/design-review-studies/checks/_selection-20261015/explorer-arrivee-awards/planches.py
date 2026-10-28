"""Side-by-side crops (PIL) of the captures kept in captures/, for the report. Each sheet is small on purpose.
Run: python3 -I checks/_selection-20261015/explorer-arrivee-awards/planches.py [name ...]"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw
HERE = Path(__file__).resolve().parent
CAP = HERE / 'captures'
OUT = HERE / 'planches'


def crop(name, box, scale=1):
    im = Image.open(CAP / (name + '.png')).convert('RGB')
    x0, y0, x1, y1 = [int(v * scale) for v in box]
    return im.crop((x0, y0, x1, y1))


def sheet(out, items, width=None, gap=12, title_h=22, guides=()):
    """items: [(caption, image)] laid out left to right; guides: [(y, colour)] horizontal lines in crop coordinates."""
    if width:
        items = [(c, im.resize((width, int(im.height * width / im.width)))) for c, im in items]
    h = max(im.height for _, im in items) + title_h
    w = sum(im.width for _, im in items) + gap * (len(items) - 1)
    canvas = Image.new('RGB', (w, h), (255, 255, 255)); draw = ImageDraw.Draw(canvas); x = 0
    for caption, im in items:
        canvas.paste(im, (x, title_h)); draw.text((x + 4, 4), caption, fill=(0, 0, 0))
        for y, colour in guides: draw.line([(x, title_h + y), (x + im.width, title_h + y)], fill=colour, width=1)
        x += im.width + gap
    OUT.mkdir(exist_ok=True); canvas.save(OUT / (out + '.png')); print(OUT / (out + '.png'), canvas.size)


def monde_ar():
    # 1440x900 Arabic: the band under the disc (bottom of the disc to the search capsule), G alone vs the nine.
    box = (520, 600, 920, 805)
    sheet('monde-1440x900-ar-bas-G-vs-ALL9', [('G seul (AR) : air 17 px', crop('monde-1440x900-G-ar', box)), ('9 essais (AR) : air 14 px', crop('monde-1440x900-ALL9-ar', box))])


def monde_fr():
    box = (420, 60, 1020, 820)
    sheet('monde-1440x900-socle-G-ALL9', [('socle', crop('monde-1440x900-socle', box)), ('G seul', crop('monde-1440x900-G', box)), ('9 essais', crop('monde-1440x900-ALL9', box))], width=330)


def paysage_ar():
    box = (213, 60, 453, 300)
    sheet('monde-667x375-ar-G-vs-ALL9', [('G seul (AR)', crop('monde-667x375-G-ar', box, 2)), ('9 essais (AR)', crop('monde-667x375-ALL9-ar', box, 2))], width=420)


def generic(spec):
    """spec: json list [out, [[caption, capture, [x0,y0,x1,y1], scale], ...], width]"""
    out, items, width = spec
    sheet(out, [(c, crop(n, b, sc)) for c, n, b, sc in items], width=width)


if __name__ == '__main__':
    names = {'monde_ar': monde_ar, 'monde_fr': monde_fr, 'paysage_ar': paysage_ar}
    for arg in sys.argv[1:]:
        if arg in names: names[arg]()
        else: generic(json.loads(arg))
