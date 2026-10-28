"""Shared helpers for the selection check of 15 Oct 2026 (zone Explorer, arrival, Awards, header/dock).
Read-only on essais/ and baseline/: everything is written in this folder."""
import base64, io, json, math, re, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent.parent))
from helper import Session, D, M, S, L, contrast, image_diff  # noqa: E402

# The user's selection (gallery numbers 1, 3, 7, 9, 12, 13, 15, 18, 19), canonical order of boot.js.
ALL9 = ['globe-espace-libre', 'police-etiquettes-globe', 'une-colonne-320', 'roles-couleur', 'visiter-contour-sombre',
        'lisibilite-textes', 'echelle-unifiee', 'pseudo-manquant', 'awards-a-venir']
SHORT = {'globe-espace-libre': 'G', 'police-etiquettes-globe': 'P', 'une-colonne-320': 'U', 'roles-couleur': 'R', 'visiter-contour-sombre': 'V',
         'lisibilite-textes': 'L', 'echelle-unifiee': 'E', 'pseudo-manquant': 'PM', 'awards-a-venir': 'A'}
ERRORS = 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'


def fresh(s, route, essais, theme, lang, vp, page='content-preview.html', block_globe=False, settle=1.2):
    """New tab per view, previous tab closed (a reused tab keeps old documents and WebGL contexts alive)."""
    c = s.c; c.session = None
    target = c.call('Target.createTarget', {'url': 'about:blank'})['targetId']
    session = c.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
    for info in c.call('Target.getTargets')['targetInfos']:
        if info['type'] == 'page' and info['targetId'] != target: c.call('Target.closeTarget', {'targetId': info['targetId']})
    c.session = session
    c.call('Page.enable'); c.call('Page.bringToFront'); c.call('Emulation.setFocusEmulationEnabled', {'enabled': True})
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': ERRORS}); c.call('Network.enable'); s.reduced(True)
    s.open(route, essais=list(essais), theme=theme, lang=lang, viewport=vp, block_globe=block_globe, page=page, settle=settle)


def run(name, body, attempts=3):
    """One short Chrome session; a cap kill, a closed pipe or a timeout gets a fresh retry."""
    for attempt in range(1, attempts + 1):
        s = None
        try:
            s = Session(HERE / 'captures')
            return body(s)
        except (RuntimeError, TimeoutError, OSError) as error:
            print(f'[{name}] session error {attempt}: {error}', flush=True)
            if attempt == attempts: raise
            time.sleep(5)
        finally:
            if s: s.close()


def subset(s, ids):
    """Keep only these trial stylesheets in the current page (data-essais follows, as boot.js would set it).
    Every selected trial except pseudo-manquant and awards-a-venir is CSS only (their essai.mjs and early.js
    are no-ops), so for Explorer and arrival geometry this reproduces the subset without reloading the globe."""
    # The note added by awards-a-venir's essai.mjs would show unstyled once its sheet is off: hide it too.
    s.js('(ids=>{for(const l of document.querySelectorAll("link[data-essai]"))l.disabled=!ids.includes(l.dataset.essai);'
         'document.documentElement.dataset.essais=window.horizonEssais.order.filter(i=>ids.includes(i)).join(" ");'
         'const n=document.querySelector(".essai-awards-a-venir");if(n)n.style.display=ids.includes("awards-a-venir")?"":"none";return true})(' + json.dumps(list(ids)) + ')')
    time.sleep(.4)


def save(path, part, value):
    try: data = json.loads(path.read_text())
    except Exception: data = {}
    data[part] = value
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')


def load(path):
    try: return json.loads(path.read_text())
    except Exception: return {}


def parse(value):
    """rgb()/rgba() -> ((r, g, b), alpha)."""
    m = re.match(r'rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)', value or '')
    return (tuple(round(float(m.group(i))) for i in (1, 2, 3)), float(m.group(4) or 1)) if m else (None, 0)


def png(s, name=None):
    data = base64.b64decode(s.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=60)['data'])
    if name:
        (HERE / 'captures').mkdir(exist_ok=True); (HERE / 'captures' / (name + '.png')).write_bytes(data)
    return data


def array(data):
    from PIL import Image
    import numpy as np
    return np.asarray(Image.open(io.BytesIO(data) if isinstance(data, bytes) else data).convert('RGB'), dtype=int)


def pixel(data, x, y, scale=1):
    img = array(data); return tuple(int(v) for v in img[int(y * scale), int(x * scale)])


def strict_diff(a, b, box=None, scale=1):
    """Exactly differing pixels, optionally restricted to a CSS box [x, y, w, h]; with bounding box of the change."""
    import numpy as np
    x, y = array(a), array(b)
    if x.shape != y.shape: return {'shape': 'different'}
    d = np.any(x != y, axis=2)
    if box:
        x0, y0, w, h = [int(round(v * scale)) for v in box]
        d = d[max(0, y0):y0 + h, max(0, x0):x0 + w]; ox, oy = max(0, x0), max(0, y0)
    else: ox = oy = 0
    if not d.any(): return {'pixels': 0}
    ys, xs = np.nonzero(d)
    return {'pixels': int(d.sum()), 'bbox': [round((xs.min() + ox) / scale, 1), round((ys.min() + oy) / scale, 1), round((xs.max() + 1 + ox) / scale, 1), round((ys.max() + 1 + oy) / scale, 1)]}


def clearance(geometry, rect):
    """Distance from the disc edge to a rectangle (negative = overlap); None when hidden."""
    if not geometry or not rect or not rect.get('shown'): return None
    cx, cy, r = geometry['center']['x'], geometry['center']['y'], geometry['radius']
    nx, ny = min(max(cx, rect['left']), rect['right']), min(max(cy, rect['top']), rect['bottom'])
    return round(math.hypot(cx - nx, cy - ny) - r, 2)
