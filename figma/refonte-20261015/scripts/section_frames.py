"""Frame-by-frame boards of a section (Figma rebuild, 16 October 2026).

  python3 section_frames.py <area> <section id> <figma section png> <out dir>
  python3 section_frames.py --frame <area> <frame name> <figma frame png> <out dir>
Cuts every frame out of the Figma section screenshot (positions from ../layouts/<area>.json, scaled to the screenshot)
and writes, per frame, « site | Figma » side by side at the frame's own scale (out dir/<frame>.png), plus the share
of differing pixels in index.json. The site capture is the viewport or full-height reference of the same state.
16 Oct.: the section export has a grey margin around the section; its box is detected in the screenshot (scale and
origin), and index.json also gives the mean error per channel and the share of pixels with a channel off by more than
12 levels (hue drifts such as a teal haze stay under the luminance threshold).
18 Oct.: --frame compares the export of one frame (get_screenshot of the frame node, named exactly as in the layout):
no section margin, origin (0, 0), scale = width of the png / width of the frame (from the longer side when both sides
agree). Its board and entry join the index.json of the out dir (the entry of the same frame is replaced), so the frames
of a section can be exported one by one. Frames at the height of the screen (layout.scene_size, 18 Oct.) are compared
whole with the screen-high capture, without band nor mask. In a full-height frame of a state captured scrolled, the
masks also cover the descendants of the fixed and sticky layers; --own-masks (either mode) keeps the masks of 17 Oct.,
the layers' own boxes only.
"""
import gzip, json, math, sys, pathlib, re
from PIL import Image, ImageChops, ImageDraw
from figlib import BASE


def pinned_masks(dd, f, sh, sy, own=False):
    """Boxes, in the screen-high capture of a state captured scrolled (sy), of the fixed and sticky layers but those
    covering most of the screen (17 Oct.). 18 Oct.: also of their descendants that leave the layer's box, which a
    full-height frame moves with their layer (absolute search and dice buttons of the bottom menu: 2.6 to 3.3 % of the
    pixels of « Remonter en haut », communs v3; open panel of a sticky section picker), except the content of a closed
    <details>, laid out but not drawn by Chrome (same rule as dom2fig.build). own: the layers only, as on 17 Oct.
    → (boxes, number of layers, number of descendants added)."""
    big = 0.6 * f['w'] * sh
    layers = [nd for nd in dd['nodes']
              if (nd.get('s') or {}).get('position') in ('fixed', 'sticky') and nd['w'] * nd['h'] < big]
    box = lambda nd: (nd['x'], nd['y'] - sy, nd['x'] + nd['w'], nd['y'] - sy + nd['h'])
    masks = [box(nd) for nd in layers]
    if own:
        return masks, len(layers), 0
    from dom2fig import OPEN_DETAILS_STATES
    by_i = {nd['i']: nd for nd in dd['nodes']}
    ids = {nd['i'] for nd in layers}
    inside = lambda nd, a: (a['x'] <= nd['x'] and a['y'] <= nd['y'] and nd['x'] + nd['w'] <= a['x'] + a['w']
                            and nd['y'] + nd['h'] <= a['y'] + a['h'])
    added = 0
    for nd in dd['nodes']:
        if nd['i'] in ids or not 0 < nd['w'] * nd['h'] < big:
            continue
        held, q = [], nd   # the masked layers among the ancestors of nd, none when nd is not drawn
        while q is not None:
            par = by_i.get(q.get('p'))
            if par is not None and par['tag'] == 'details' and q['tag'] != 'summary' and not (
                    par.get('open') if 'open' in par else f['state'] in OPEN_DETAILS_STATES):
                held = []
                break
            if par is not None and par['i'] in ids:
                held.append(par)
            q = par
        if held and not any(inside(nd, a) for a in held):   # a box inside its layer's adds no pixel
            masks.append(box(nd))
            added += 1
    return masks, len(layers), added


def compare(f, area, fig, kx, ky, box, at, out, own=False, export=None):
    """Board and index entry of frame f, drawn in the Figma screenshot fig at scale (kx, ky); box: origin of the section
    (or (0, 0)), at: position of the frame in it, in layout units. export (--frame): the frame png and its height in
    site px when it differs from the frame's."""
    name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
    ref = BASE / 'reference' / area
    full = ref / f'{name}--full.png'
    vp = ref / f'{name}.png'
    # 18 Oct.: same rule as layout.scenes: a frame at most 4 px taller than the screen is built with convert(full=False)
    # and shows the screen as captured, content shifted by the scroll, fixed and sticky layers in place; it always takes
    # the screen-high capture and is compared whole
    screen = f['h'] <= (844 if f['fmt'] == 'mobile' else 960) + 4
    src = vp if screen or not full.exists() else full
    if not src.exists():
        return {'frame': f['name'], 'missing reference': src.name}
    site = Image.open(src).convert('RGB')
    sh = int(round(site.height * f['w'] / site.width))
    site = site.resize((int(f['w']), sh), Image.LANCZOS).crop((0, 0, int(f['w']), int(f['h'])))
    # 17 Oct.: a state captured scrolled shows the page from scrollY; the full-height Figma frame draws the page from
    # its top, with the fixed and sticky layers at the top or bottom of the frame. The screen-high reference is compared
    # with the band of the frame that starts at scrollY, both masked where the dump has fixed or sticky layers.
    sy, masks, layers, added = 0.0, [], 0, 0
    if src == vp and not screen:
        dump = BASE / 'dom' / area / f"{name}.json.gz"
        if dump.exists():
            dd = json.loads(gzip.decompress(dump.read_bytes()))
            sy = float((dd.get('scroll') or [0, 0])[1] or 0)
            if sy > 0.5:
                masks, layers, added = pinned_masks(dd, f, sh, sy, own)
            else:
                sy = 0.0
    x0, y0 = box[0] + at[0] * kx, box[1] + (at[1] + sy) * ky
    crop = fig.transform(site.size, Image.Transform.EXTENT, (x0, y0, x0 + site.width * kx, y0 + site.height * ky), Image.Resampling.BICUBIC)
    # v3 check: the export mixes a frame's edge pixel with the white section around it; the measures leave out a
    # border of 1.5 screenshot pixels (the board stays whole)
    m = math.ceil(1.5 / kx)
    # 17 Oct.: a frame taller than its only reference (menus and dialogs captured at screen height, the Figma frame
    # keeps the whole page): the measures cover the reference's height, the board shows the whole frame
    mh = min(site.height, sh)
    if export and export[1] is not None:   # 18 Oct.: a frame export shorter than the layout's frame
        mh = min(mh, int(export[1] - sy))
        if mh <= 2 * m:
            sys.exit('« %s »: the export ends before the band to compare (y = %d)' % (f['name'], sy))
    inner = (m, m, site.width - m, mh - m)
    a_, b_ = site.copy(), crop.copy()
    if masks:
        da_, db_ = ImageDraw.Draw(a_), ImageDraw.Draw(b_)
        for mx0, my0, mx1, my1 in masks:
            da_.rectangle((mx0, my0, mx1, my1), fill=(0, 0, 0)); db_.rectangle((mx0, my0, mx1, my1), fill=(0, 0, 0))
    rgb = ImageChops.difference(a_.crop(inner), b_.crop(inner))
    diff = rgb.convert('L')
    hist = diff.histogram(); total = sum(hist); changed = sum(hist[41:]) / total
    chans = rgb.split()
    mean = [round(sum(i * c for i, c in enumerate(ch.histogram())) / total, 2) for ch in chans]
    off12 = ImageChops.lighter(ImageChops.lighter(chans[0], chans[1]), chans[2]).point(lambda v: 255 if v > 12 else 0).histogram()[255] / total
    W, H = site.size
    board = Image.new('RGB', (W * 2 + 20, H + 30), (70, 70, 70))
    board.paste(site, (0, 30)); board.paste(crop, (W + 20, 30))
    d = ImageDraw.Draw(board); d.text((6, 8), 'site', fill=(255, 255, 255))
    d.text((W + 26, 8), 'Figma  (%.1f %% différents%s%s)' % (changed * 100, '' if mh >= H else ', mesurés sur les %d px du haut' % mh,
                                                          ', bande à partir de y = %d, calques fixes masqués' % sy if sy else ''), fill=(255, 255, 255))
    if mh < H: d.line((0, 30 + mh, W * 2 + 20, 30 + mh), fill=(255, 64, 64), width=2)
    fn = re.sub(r'[^\w.-]+', '_', f['name'])[:120] + '.png'
    board.save(out / fn)
    return {'frame': f['name'], 'board': str(out / fn), 'changed': round(changed, 4), 'meanRGB': mean, 'channelOff12': round(off12, 4),
            'scale': [round(kx, 5), round(ky, 5)], 'origin': [round(box[0], 2), round(box[1], 2)], 'border': m,
            **({} if mh >= H else {'measuredHeight': mh}),
            **({'scrollY': sy, 'masked': layers, **({} if own else {'maskedDescendants': added})} if sy else {}),
            **({'export': export[0], **({} if export[1] is None else {'exportHeight': round(export[1], 1)})} if export else {})}


def main(argv):
    own = '--own-masks' in argv
    argv = [a for a in argv if a != '--own-masks']
    one = argv[:1] == ['--frame']
    if one:
        argv = argv[1:]
    area, key, fig_png, out = argv[:4]
    out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
    lay = json.loads((BASE / 'layouts' / f'{area}.json').read_text())
    ref_area = lay.get('area', area)   # 16 Oct.: a layout key (awards, compte…) reads the captures of its area
    fig = Image.open(fig_png).convert('RGB')
    if one:
        hits = [f for s in lay['sections'] for row in s['rows'] for f in row if f['name'] == key]
        if len(hits) != 1:
            sys.exit('%d frames named « %s » in layouts/%s.json' % (len(hits), key, area))
        f = hits[0]
        # 18 Oct.: the export of a frame has no margin; like a section export, it fixes its longer side exactly and
        # rounds the other one (a 5138 px frame exported 3000 px high), so the scale comes from the longer side when
        # both agree; otherwise the frame in Figma is not as high as in the layout, and the width gives the scale
        kx, ky = fig.width / f['w'], fig.height / f['h']
        eh = None
        if abs(kx - ky) / kx < 0.01:
            kx = ky = kx if fig.width >= fig.height else ky
        else:
            ky = kx
            eh = fig.height / kx
            print('warning: « %s » is %.1f px high in the export, %s in the layout' % (key, eh, f['h']), file=sys.stderr)
        row = compare(f, ref_area, fig, kx, ky, (0, 0), (0, 0), out, own, (str(fig_png), eh))
        idx = out / 'index.json'
        rows = json.loads(idx.read_text()) if idx.exists() else []
        pos = next((i for i, r in enumerate(rows) if r.get('frame') == f['name']), None)
        if pos is None:
            rows.append(row)
        else:
            rows[pos] = row
        idx.write_text(json.dumps(rows, ensure_ascii=False, indent=1))
        print(json.dumps(row, ensure_ascii=False))
        return
    sec = next(s for s in lay['sections'] if s['id'] == key)
    # 16 Oct. (v2 check): the export adds 40 units around the section; scale and origin follow from it exactly, and frames
    # are cut at sub-pixel positions (the detected box drifted by about one screenshot pixel, 2.7 site px)
    kx, ky = fig.width / (sec['w'] + 80), fig.height / (sec['h'] + 80)
    if abs(kx - ky) / kx < 0.01:
        # v3 check: the export fixes its longer side exactly and rounds the other one; one scale, from the longer side
        kx = ky = kx if fig.width >= fig.height else ky
        box = (40 * kx, 40 * ky)
    else:   # another margin: box detected in the screenshot
        margin = Image.new('RGB', fig.size, fig.getpixel((0, 0)))
        box = ImageChops.difference(fig, margin).convert('L').point(lambda v: 255 if v > 6 else 0).getbbox() or (0, 0, fig.width, fig.height)
        kx, ky = (box[2] - box[0]) / sec['w'], (box[3] - box[1]) / sec['h']
    rows = [compare(f, ref_area, fig, kx, ky, box, (f['x'], f['y']), out, own) for row in sec['rows'] for f in row]
    (out / 'index.json').write_text(json.dumps(rows, ensure_ascii=False, indent=1))
    print(json.dumps(rows, ensure_ascii=False)[:2000])


if __name__ == '__main__':
    main(sys.argv[1:])
