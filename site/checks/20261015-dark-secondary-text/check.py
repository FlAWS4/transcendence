"""White dark-theme text of Visit and Create an account (15 Oct 2026): archive (before) vs original (after).

Measures the three entrance/account actions in dark and light, compares screenshots, and writes results.json.
python3 -I check.py   (the local server must serve the repository)
"""
import json, pathlib, sys, time
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[3] / 'studies/design-review-studies/checks'))
from helper import Session, ACTIVE, D, M


def diff_box(a, b):
    # Exact pixel difference: count and bounding box (x0, y0, x1, y1) in device pixels.
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(a).convert('RGB'), dtype=int); y = np.asarray(Image.open(b).convert('RGB'), dtype=int)
    if x.shape != y.shape: return {'count': -1, 'box': None}
    mask = np.abs(x - y).sum(axis=2) > 0
    if not mask.any(): return {'count': 0, 'box': None}
    ys, xs = np.nonzero(mask)
    return {'count': int(mask.sum()), 'box': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]}

OUT = pathlib.Path(__file__).resolve().parent
SIDES = {'avant': (ACTIVE + 'archive/pre-dark-secondary-text-20261015/baseline/', 'horizon-archive-pre-dark-secondary-text-20261015-'),
         'apres': (ACTIVE, 'horizon-')}
PROBE = '''(() => Object.fromEntries(["#entry-login", "#entry-guest", "[data-account-action=signin]", "[data-account-action=signup]"].map(sel => {
  const e = document.querySelector(sel); if (!e || !e.getClientRects().length) return [sel, null];
  const s = getComputedStyle(e), r = e.getBoundingClientRect();
  return [sel, {color: s.color, background: s.backgroundColor, border: s.borderTopColor, w: +r.width.toFixed(2), h: +r.height.toFixed(2)}];
})))()'''
VIEWS = [('arrivee-sombre', 'index.html', '', 'dark', D), ('arrivee-sombre-mobile', 'index.html', '', 'dark', M),
         ('arrivee-claire', 'index.html', '', 'light', D), ('compte-sombre', 'content-preview.html', 'projects', 'dark', D),
         ('compte-clair', 'content-preview.html', 'projects', 'light', D)]


def rgb(value):
    parts = [float(x) for x in value[value.index('(') + 1:value.index(')')].split(',')[:3]]
    return '#%02X%02X%02X' % tuple(round(x) for x in parts)


results = {}
for name, page, route, theme, viewport in VIEWS:
    view = {}
    for side, (base, prefix) in SIDES.items():
        s = Session(OUT / 'captures')
        try:
            s.c.call('Page.addScriptToEvaluateOnNewDocument', {'source': f'try{{localStorage.setItem({json.dumps(prefix + "theme-preference-v1")},{json.dumps(theme)})}}catch(e){{}}'})
            s.viewport(*viewport); s.block_globe(True)
            s.c.call('Page.navigate', {'url': base + page + ('#' + route if route else '')})
            s.wait('document.fonts.status==="loaded" && document.documentElement.dataset.theme', 30); time.sleep(3)
            if page == 'content-preview.html':
                s.wait('Boolean(document.querySelector("#profile"))', 20); s.click('#profile'); time.sleep(1)
            s.away()
            view[side] = {'theme': s.js('document.documentElement.dataset.theme'), 'probe': s.js(PROBE), 'errors': s.errors(),
                          'shot': str(s.shot(f'{name}-{side}'))}
        finally:
            s.close()
    view['pixelsDiffer'] = diff_box(view['avant']['shot'], view['apres']['shot'])
    after = view['apres']['probe']
    for sel in ('#entry-guest', '[data-account-action=signup]', '#entry-login', '[data-account-action=signin]'):
        item = after.get(sel)
        if item and theme == 'dark':
            item['hex'] = {k: rgb(item[k]) for k in ('color', 'background', 'border') if 'rgba(0, 0, 0, 0)' not in item[k]}
    results[name] = view
    print(name, 'pixels', view['pixelsDiffer'], json.dumps({k: (v and {a: v[a] for a in ('color', 'background', 'border', 'w', 'h')}) for k, v in after.items()}, ensure_ascii=False)[:600], flush=True)
(OUT / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding='utf-8')
