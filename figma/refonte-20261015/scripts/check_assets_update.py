#!/usr/bin/env python3
"""Raster check of the in-place asset update of 17 Oct. 2026 (assets.py update → ../assets-update/).

Each corrected SVG (../assets-update/svg/) is drawn by headless Chrome as a standalone image, the way Figma imports it
(no page stylesheet: only its own attributes), at the place and size of an illustration in a capture of the site
(../reference/<zone>/<state>.png, boxes from ../dom/<zone>/<state>.json.gz), then compared with that capture.
Variants drawn for comparison, never sent:
  before      what was imported until 17 Oct. (raw markup: no inherited stroke, butt caps; Chrome still draws the
              texts in the right fonts, Figma did not)
  stroked     the same drawing with the stroke of the detail headers and of the viewer (#1B1B1B light, #FFFFFF dark)
  rtl         texts anchored as in the Arabic pages (direction rtl: text-anchor start = right edge, bidi order)
  dark        a bound stroke resolved in the dark mode (#FFFFFF instead of #1B1B1B)
  wrong-font  control: outlines from other fonts (Noto Serif, Liberation Mono) must be worse on the text regions
  vsChromeText  the component against the same markup whose <text> Chrome draws itself, unhinted
              (text-rendering geometricPrecision): checks the outlines and their positions, hinting set aside
Masked: rounded corners of the container, and the layers painted over the illustration (favourite button, dock…).
Metrics (inside the mask): mae = mean absolute difference per channel (0-255); diff = share of pixels whose summed
channel difference exceeds 24 (helper.image_diff); text = the same on the boxes of the outlined texts; inkIoU = per
text, intersection over union of its ink (luminance closer to the text colour than to the background of its box),
capture vs drawing, insensitive to the coloured fringes of Chrome's sub-pixel text antialiasing.

Usage: cd /home/le-rif/Bureau/Transcendence && python3 figma/refonte-20261015/scripts/check_assets_update.py
Writes ../verification/assets-update/results.json and one board per case (capture | drawing | differences, PNG,
not versioned); the drawn SVG and HTML pages live in a temporary folder.
"""
import base64, gzip, io, json, pathlib, re, shutil, sys, tempfile, time
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import numpy as np
from PIL import Image
import assets
import svg_text_outlines as sto
from figlib import BASE, SITE
from capture_lib import Session

OUT = BASE / 'verification' / 'assets-update'
UPD = BASE / 'assets-update'
DUMP = BASE / 'dom'
REF = BASE / 'reference'

# (dump, capture, ref, variants): desktop captures, DPR 1
CASES = [
    ('projects/projects--desktop--fr-light', 'projects/projects--desktop--fr-light--full.png', 'kz2k1m-1697', ['component', 'before', 'stroked']),
    ('projects/projects--desktop--fr-light', 'projects/projects--desktop--fr-light--full.png', '11myu71-1682', ['component', 'before', 'stroked', 'wrong-font']),
    ('projects/projects--desktop--fr-light', 'projects/projects--desktop--fr-light--full.png', '114x1ky-1393', ['component', 'before']),
    ('projects/projects--desktop--fr-light', 'projects/projects--desktop--fr-light--full.png', '9fxl1s-1710#1', ['component', 'before']),
    ('projects/projects--desktop--fr-dark', 'projects/projects--desktop--fr-dark--full.png', '11myu71-1682', ['component', 'stroked-dark']),
    ('projects/projects--desktop--ar-light', 'projects/projects--desktop--ar-light--full.png', '11myu71-1682', ['component', 'rtl']),
    ('journal/journal--desktop--fr-light', 'journal/journal--desktop--fr-light.png', '1jtwtz9-1629', ['component', 'before', 'stroked', 'wrong-font']),
    ('journal/journal--desktop--ar-light', 'journal/journal--desktop--ar-light.png', '1jtwtz9-1629', ['component', 'rtl']),
    ('projects/project--desktop--fr-light', 'projects/project--desktop--fr-light.png', 'kz2k1m-1697', ['component', 'stroked']),
    ('projects/project--desktop--fr-dark', 'projects/project--desktop--fr-dark.png', 'kz2k1m-1697', ['component', 'stroked-dark']),
    ('projects/project-single--desktop--fr-light', 'projects/project-single--desktop--fr-light.png', '11myu71-1682', ['component', 'stroked']),
    ('projects/project-single--desktop--fr-dark', 'projects/project-single--desktop--fr-dark.png', '11myu71-1682', ['component', 'stroked-dark']),
    ('projects/project-single--desktop--ar-light', 'projects/project-single--desktop--ar-light.png', '11myu71-1682', ['stroked', 'stroked-rtl']),
    ('journal/article--desktop--fr-light', 'journal/article--desktop--fr-light.png', '1jtwtz9-1629', ['component', 'stroked']),
    ('journal/article--desktop--fr-dark', 'journal/article--desktop--fr-dark.png', '1jtwtz9-1629', ['component', 'stroked-dark']),
    ('projects/viewer--desktop--fr-light', 'projects/viewer--desktop--fr-light.png', 'rqcd84-1681', ['component', 'before', 'wrong-font']),
    ('projects/viewer--desktop--fr-dark', 'projects/viewer--desktop--fr-dark.png', 'rqcd84-1681', ['dark', 'before']),
    ('projects/project-implementation--desktop--fr-light', 'projects/project-implementation--desktop--fr-light.png', 'file:./assets/minishell-flow-demo.svg', ['component', 'wrong-font']),
]


def manifest():
    return {c['ref']: c for c in json.loads((UPD / 'manifest.json').read_text())['components']}


def raw_markup(ref):
    for f in sorted((BASE / 'scenes').glob('*.svgs.json')):
        a = json.loads(f.read_text()).get(ref)
        if isinstance(a, dict) and a.get('svg'):
            return a['svg']
    raise KeyError(ref)


def wrong_font(fn):
    """Run fn with other fonts behind the generic families (control)."""
    keep = dict(sto.CHROME_GENERIC)
    sto.CHROME_GENERIC.update({'monospace': 'Liberation Mono', 'serif': 'Noto Serif'}); sto.resolve.cache_clear()
    try:
        return fn()
    finally:
        sto.CHROME_GENERIC.clear(); sto.CHROME_GENERIC.update(keep); sto.resolve.cache_clear()


def chrome_text(ref, comp):
    """The component's markup with its texts left to Chrome (fonts resolved by Chrome itself) and unhinted
    (text-rendering geometricPrecision): the reference for the geometry of the outlines, hinting set aside."""
    root = re.match(r'<svg\b[^>]*>', (UPD / comp['svg']).read_text()).group(0)
    body = assets.normalise_file((SITE / ref[5:]).resolve().read_text()) if ref.startswith('file:') else raw_markup(ref)
    body = body[re.match(r'<svg\b[^>]*>', body).end():]
    return root[:-1] + ' text-rendering="geometricPrecision">' + body


def variant(ref, name, comp):
    """SVG markup of a variant, and the reports of its outlined texts."""
    if ref.startswith('file:'):
        raw = assets.normalise_file((SITE / ref[5:]).resolve().read_text())
        if name == 'component':
            return (UPD / comp['svg']).read_text(), comp['texts']
        if name == 'wrong-font':
            return wrong_font(lambda: sto.outline_texts(raw))
        raise ValueError(name)
    raw = raw_markup(ref)
    text = {'font-style': 'normal', 'font-weight': '400', 'direction': 'ltr'}
    if name == 'component':
        return (UPD / comp['svg']).read_text(), comp['texts']
    if name == 'before':
        return re.sub(r'<svg\b', '<svg width="800" height="500"', raw, count=1), []
    if name == 'dark':   # the bound stroke of the component, resolved in the dark mode
        svg = (UPD / comp['svg']).read_text()
        return svg.replace('stroke="%s"' % comp['bind']['hex'], 'stroke="#FFFFFF"', 1), comp['texts']
    if name == 'wrong-font':
        paint = comp.get('paint') or {}
        return wrong_font(lambda: assets.normalise_illustration(raw, paint.get('stroke'), '1.6', text))
    stroke = '#FFFFFF' if name.endswith('-dark') else ('#1B1B1B' if name.startswith('stroked') else None)
    if name.endswith('rtl') or name == 'rtl':
        text = dict(text, direction='rtl')
    return assets.normalise_illustration(raw, stroke, '1.6', text)


def box_and_mask(dump, ref, nth=0):
    """Box of the illustration in the capture, and the rectangles painted over it (later layers, fixed layers)."""
    d = json.loads(gzip.decompress((DUMP / (dump + '.json.gz')).read_bytes()))
    nodes = d['nodes']; by = {n['i']: n for n in nodes}
    if ref.startswith('file:'):
        node = next(n for n in nodes if n.get('tag') == 'img' and ref[5:].lstrip('.') in (n.get('src') or ''))
    else:
        node = [n for n in nodes if n.get('tag') == 'svg' and n.get('svgRef') == ref and n['w'] > 100][nth]
    ancestors, p = set(), node.get('p')
    while p in by:
        ancestors.add(p); p = by[p].get('p')
    radius = 0.0
    for a in [node] + [by[i] for i in ancestors]:
        r = (a.get('s') or {}).get('radius')
        if r and a['w'] <= node['w'] + 2:
            radius = max(radius, max(float(v) for v in re.findall(r'([\d.]+)px', r) or [0]))
    x, y, w, h = node['x'], node['y'], node['w'], node['h']
    over = []
    idx = nodes.index(node)
    for k, n in enumerate(nodes):
        if n is node or n['i'] in ancestors or not n.get('w') or not n.get('h'):
            continue
        q, inside = n.get('p'), False
        while q in by:   # descendants of the illustration are part of it
            if q == node['i']:
                inside = True; break
            q = by[q].get('p')
        st = n.get('s') or {}
        # fixed layers above the page (the dock…), not those painted below everything (.atmosphere, z-index -1)
        fixed = st.get('position') in ('fixed', 'sticky') and not str(st.get('z', '0')).lstrip().startswith('-')
        if inside or not (k > idx or fixed):
            continue
        if n['x'] < x + w and n['x'] + n['w'] > x and n['y'] < y + h and n['y'] + n['h'] > y:
            over.append((n['x'] - 6, n['y'] - 6, n['w'] + 12, n['h'] + 12))
    return (x, y, w, h), radius, over, node


def render(s, svg, box, path):
    """Chrome draws the SVG as an image at the box (sub-pixel offset kept) → PIL image of the covered pixels."""
    x, y, w, h = box
    fx, fy = x - int(x), y - int(y)
    W, H = int(np.ceil(x + w)) - int(x), int(np.ceil(y + h)) - int(y)
    path.with_suffix('.svg').write_text(svg)
    html = ('<!doctype html><html><body style="margin:0;background:#808080">'
            '<img id="i" src="%s" style="position:absolute;left:%.3fpx;top:%.3fpx;width:%.3fpx;height:%.3fpx">'
            '</body></html>' % (path.with_suffix('.svg').name, fx, fy, w, h))
    page = path.with_suffix('.html'); page.write_text(html)
    s.c.call('Emulation.setDeviceMetricsOverride', {'width': max(W, 64), 'height': max(H, 64), 'deviceScaleFactor': 1, 'mobile': False})
    s.c.call('Page.navigate', {'url': page.as_uri()})
    s.wait('document.readyState==="complete"&&document.getElementById("i")&&document.getElementById("i").complete', 15)
    time.sleep(.2)
    data = s.c.call('Page.captureScreenshot', {'format': 'png', 'clip': {'x': 0, 'y': 0, 'width': W, 'height': H, 'scale': 1}})['data']
    return Image.open(io.BytesIO(base64.b64decode(data))).convert('RGB')


def text_boxes(texts, box, vb, slice_):
    """Screen boxes of the outlined texts (font ascent/descent of hhea), relative to the drawing."""
    x, y, w, h = box
    vw, vh = vb
    k = (max if slice_ else min)(w / vw, h / vh)
    ox, oy = (w - vw * k) / 2, (h - vh * k) / 2
    out = []
    for t in texts:
        f = sto.font(sto.resolve(t['font'], t['weight'])[0])
        size = t['size']
        top, bottom = t['y'] - f.ascent * size / f.upm, t['y'] - f.descent * size / f.upm
        out.append((ox + t['left'] * k - 2, oy + top * k - 2, t['advance'] * k + 4, (bottom - top) * k + 4))
    return out


def ink_iou(ref_img, img, fill, region):
    """Intersection over union of the ink of a text in two images: pixels whose luminance is closer to the text colour
    than to the background of its box (median), i.e. insensitive to the coloured fringes of Chrome's sub-pixel text
    antialiasing, which the outlines (grey antialiasing, like Figma) do not have."""
    lum = lambda im: (np.asarray(im, dtype=np.float32) * np.array([0.2126, 0.7152, 0.0722])).sum(axis=2)
    f = fill.lstrip('#')
    lf = float(np.dot([int(f[i:i + 2], 16) for i in (0, 2, 4)], [0.2126, 0.7152, 0.0722]))
    la, lb = lum(ref_img), lum(img)
    if not region.any():
        return None
    bg = float(np.median(la[region]))
    if abs(lf - bg) < 8:
        return None
    ia = (np.abs(la - bg) > abs(lf - bg) / 2) & (np.sign(la - bg) == np.sign(lf - bg)) & region
    ib = (np.abs(lb - bg) > abs(lf - bg) / 2) & (np.sign(lb - bg) == np.sign(lf - bg)) & region
    return round(float((ia & ib).sum() / max(1, (ia | ib).sum())), 3)


def metrics(a, b, mask, region=None):
    A = np.asarray(a, dtype=np.int32); B = np.asarray(b, dtype=np.int32)
    m = mask.copy()
    if region is not None:
        m &= region
    if not m.any():
        return None
    d = np.abs(A - B)
    return {'mae': round(float(d[m].mean()), 2), 'diff': round(float((d.sum(axis=2)[m] > 24).mean()), 4), 'pixels': int(m.sum())}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    work = pathlib.Path(tempfile.mkdtemp(prefix='assets-update-'))   # drawn SVG/HTML pages, removed at the end
    comps = manifest()
    results = []
    s = Session(OUT)
    try:
        for dump, capture, ref, names in CASES:
            ref, nth = (ref.split('#') + ['0'])[:2]   # « ref#n »: the n-th drawing of that ref in the capture
            comp = comps[ref]
            box, radius, over, node = box_and_mask(dump, ref, int(nth))
            x, y, w, h = box
            W, H = int(np.ceil(x + w)) - int(x), int(np.ceil(y + h)) - int(y)
            ref_img = Image.open(REF / capture).convert('RGB').crop((int(x), int(y), int(x) + W, int(y) + H))
            mask = np.ones((H, W), dtype=bool)
            r = int(np.ceil(radius)) + 2
            if r > 2:
                for cx, cy in ((0, 0), (W - r, 0), (0, H - r), (W - r, H - r)):
                    mask[max(cy, 0): cy + r, max(cx, 0): cx + r] = False
            for ox, oy, ow, oh in over:
                x0, y0 = max(int(ox - int(x)), 0), max(int(oy - int(y)), 0)
                x1, y1 = min(int(np.ceil(ox + ow - int(x))), W), min(int(np.ceil(oy + oh - int(y))), H)
                if x1 > x0 and y1 > y0:
                    mask[y0:y1, x0:x1] = False
            first = (UPD / comp['svg']).read_text()
            vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', first).group(1).split()[2:4]]
            slice_ = 'slice' in first[:400]
            case = {'dump': dump, 'capture': capture, 'ref': ref, 'id': comp['id'], 'box': [x, y, w, h],
                    'masked': round(1 - float(mask.mean()), 4), 'variants': {}}
            boards = [ref_img]
            for name in names:
                svg, texts = variant(ref, name, comp)
                tag = '%s__%s__%s' % (dump.replace('/', '_'), re.sub(r'[^A-Za-z0-9]+', '-', ref), name)
                img = render(s, svg, box, work / tag)
                res = {'all': metrics(img, ref_img, mask)}
                # text boxes: the variant's own texts, else (« before ») those of the component at the same place
                tb = texts or (comp['texts'] if name == 'before' else [])
                if tb:
                    region = np.zeros_like(mask)
                    fx, fy = x - int(x), y - int(y)
                    ious = []
                    for t, (tx, ty, tw, th) in zip(tb, text_boxes(tb, (0, 0, w, h), vb, slice_)):
                        one = np.zeros_like(mask)
                        one[max(int(ty + fy), 0): int(np.ceil(ty + fy + th)), max(int(tx + fx), 0): int(np.ceil(tx + fx + tw))] = True
                        region |= one
                        iou = ink_iou(ref_img, img, t.get('fill') or '#000000', one & mask)
                        if iou is not None:
                            ious.append([t['text'], iou])
                    res['text'] = metrics(img, ref_img, mask, region)
                    res['inkIoU'] = ious
                if name in ('component', 'dark') and tb:
                    ct = render(s, chrome_text(ref, comp) if name == 'component' else chrome_text(ref, comp).replace(
                        'stroke="%s"' % comp['bind']['hex'], 'stroke="#FFFFFF"', 1), box, work / (tag + '-chrome-text'))
                    whole = np.ones_like(mask)
                    vs = {'text': metrics(img, ct, whole, region), 'inkIoU': []}
                    for t, (tx, ty, tw, th) in zip(tb, text_boxes(tb, (0, 0, w, h), vb, slice_)):
                        one = np.zeros_like(mask)
                        one[max(int(ty + fy), 0): int(np.ceil(ty + fy + th)), max(int(tx + fx), 0): int(np.ceil(tx + fx + tw))] = True
                        vs['inkIoU'].append([t['text'], ink_iou(ct, img, t.get('fill') or '#000000', one)])
                    res['vsChromeText'] = vs
                case['variants'][name] = res
                diff = np.abs(np.asarray(img, dtype=np.int32) - np.asarray(ref_img, dtype=np.int32)).sum(axis=2)
                heat = np.zeros((H, W, 3), dtype=np.uint8)
                heat[..., 0] = np.clip(diff, 0, 255); heat[~mask] = (40, 40, 90)
                boards += [img, Image.fromarray(heat)]
                print(dump, ref, name, json.dumps(res), flush=True)
            # board: capture | drawing, differences | drawing, differences…
            gap = 8
            board = Image.new('RGB', (sum(b.width for b in boards) + gap * (len(boards) - 1), H), (255, 255, 255))
            px = 0
            for b in boards:
                board.paste(b, (px, 0)); px += b.width + gap
            board.save(OUT / ('%s__%s.png' % (dump.replace('/', '_'), re.sub(r'[^A-Za-z0-9]+', '-', ref))))
            results.append(case)
    finally:
        s.close()
        shutil.rmtree(work, ignore_errors=True)
        (OUT / 'results.json').write_text(json.dumps({'date': '2026-10-17', 'method': __doc__.split('\n\n')[1], 'cases': results},
                                                     ensure_ascii=False, indent=1) + '\n')


if __name__ == '__main__':
    main()
