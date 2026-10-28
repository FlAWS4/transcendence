# 19 Oct.: the hotspots of plan.json drawn on the captures of the site, one board per flow frame (offline check)
import json, pathlib, re, sys
from PIL import Image, ImageDraw, ImageFont
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
OUT = BASE / 'verification' / 'parcours-20261019' / (sys.argv[1] if len(sys.argv) > 1 else 'zones')
plan = json.loads((BASE / 'parcours' / 'plan.json').read_text())
VH = {'desktop': 960, 'mobile': 844}
COL = {'nav': (37, 99, 235), 'back': (234, 88, 12), 'url': (147, 51, 234), 'mode': (22, 163, 74), 'top': (100, 100, 100)}
BAND = (120, 120, 120)   # beside a menu, the veil of a window: drawn faint
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except OSError:
    font = ImageFont.load_default()
index = []
for key, F in plan['frames'].items():
    fmt, lang, flow, state = key.split('|')
    area = 'shell' if state.startswith('member-') else F['area']
    lg = F['srcLang']
    ref = BASE / 'reference' / area
    full = F['h'] > VH[fmt] + 4
    import gzip
    dp = BASE / 'dom' / area / f'{state}--{fmt}--{lg}-light.json.gz'
    sy = float((json.loads(gzip.decompress(dp.read_bytes())).get('scroll') or [0, 0])[1] or 0) if dp.exists() else 0.0
    tall = full   # every zone of a page on the whole page (fixed ones at their place in the tall window)
    p = ref / (f'{state}--{fmt}--{lg}-light--full.png' if tall else f'{state}--{fmt}--{lg}-light.png')
    if not p.exists():
        index.append({'key': key, 'missing': str(p.name)}); continue
    im = Image.open(p).convert('RGB')
    W = F['w']
    im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    d = ImageDraw.Draw(im, 'RGBA')
    n = 0
    for h in plan['hotspots'].get(key, []):
        x, y, w, hh = h['box']
        if h.get('in'):   # inside a container that scrolls: its box is in the coordinates of the container's layer
            x, y = x + h['in']['x'], y + h['in']['y']
        elif tall and h['fixed']:
            # the fixed layer that holds the zone: in the tall capture it is where its dy put it back from (dock at the bottom)
            lay = next((L for L in F.get('fixed') or [] if L['bbox'][0] - 1 <= x and x + w <= L['bbox'][0] + L['bbox'][2] + 1 and L['bbox'][1] - 1 <= y and y + hh <= L['bbox'][1] + L['bbox'][3] + 1), None)
            y -= lay['dy'] if lay else (-(F['h'] - VH[fmt]) if y > VH[fmt] / 2 else 0)
        a = next(iter(h['act']))
        c = COL.get(a, (0, 0, 0))
        if h.get('layer') in ('beside', 'veil'):
            d.rectangle([x, y, x + w, y + hh], outline=BAND + (90,), width=1, fill=BAND + (18,))
            n += 1
            continue
        if h.get('in') and 'w' in h['in']:
            # inside a container that scrolls: the part out of its box is reached by scrolling it (faint, thin outline)
            cx0, cy0, cx1, cy1 = h['in']['x'], h['in']['y'], h['in']['x'] + h['in']['w'], h['in']['y'] + h['in']['h']
            vx0, vy0, vx1, vy1 = max(x, cx0), max(y, cy0), min(x + w, cx1), min(y + hh, cy1)
            d.rectangle([x, y, x + w, y + hh], outline=c + (110,), width=1)
            if vx1 - vx0 > 1 and vy1 - vy0 > 1:
                d.rectangle([vx0, vy0, vx1, vy1], outline=c + (255,), width=2, fill=c + (40,))
                d.text((vx0 + 2, vy0 + 1), h['label'][:28] + ' ⇕', fill=c + (255,), font=font)
            else:
                d.text((x + 2, y + 1), h['label'][:24] + ' ⇕ en défilant', fill=c + (150,), font=font)
            n += 1
            continue
        d.rectangle([x, y, x + w, y + hh], outline=c + (255,), width=2, fill=c + (40,))
        lab = h['label'][:28] + (' ⇢' if h['fixed'] else '')
        d.text((x + 2, y + 1), lab, fill=c + (255,), font=font)
        n += 1
    auto = plan['auto'].get(key)
    if auto:
        d.text((8, 8), '⏱ %.2g s → %s' % (auto['after'], plan['frames'][auto['nav']]['name'][:60]), fill=(220, 20, 60, 255), font=font)
    sub = OUT / fmt / lang
    sub.mkdir(parents=True, exist_ok=True)
    name = re.sub(r'[^\w·—-]+', '_', F['name'])[:110] + '__' + state + ('__m' if flow == 'm' else '') + '.png'   # 19 Oct.: chronicle and project tabs share names
    im.save(sub / name)
    index.append({'key': key, 'board': str(sub / name), 'zones': n, 'pageEntiere': tall, 'scroll': sy})
(OUT / 'index.json').write_text(json.dumps(index, ensure_ascii=False, indent=1))
print(len([i for i in index if 'board' in i]), 'planches ;', len([i for i in index if 'missing' in i]), 'sans capture :', [i['key'] for i in index if 'missing' in i][:12])
