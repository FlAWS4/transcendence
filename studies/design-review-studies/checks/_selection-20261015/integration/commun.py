"""Shared helpers for the integration pass of the 15 Oct 2026 selection (trials 01, 03, 07, 09, 12, 13, 15, 18, 19).
Builds on checks/helper.py and on the method of the two read-only checkers (one new tab per view, short Chrome
sessions with retries). Everything is written in this folder."""
import base64, io, json, math, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
STUDY = HERE.parents[2]
sys.path.insert(0, str(HERE.parents[1]))
from helper import Session, D, M, S, L, contrast  # noqa: E402

# The user's selection, canonical order of essais/boot.js.
ALL9 = ['globe-espace-libre', 'police-etiquettes-globe', 'une-colonne-320', 'roles-couleur', 'visiter-contour-sombre',
        'lisibilite-textes', 'echelle-unifiee', 'pseudo-manquant', 'awards-a-venir']
G, P, U, R, V, LT, E, PM, A = ALL9
SHORT = {G: 'G', P: 'P', U: 'U', R: 'R', V: 'V', LT: 'L', E: 'E', PM: 'PM', A: 'A'}
ERRORS = ('window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});'
          'addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));'
          'const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}')


def label(ids):
    return '+'.join(SHORT[i] for i in ALL9 if i in ids) if ids else 'socle'


def fresh(s, route, essais, theme='light', lang='fr', vp=D, page='content-preview.html', block_globe=False, settle=1.2):
    """New tab per view, previous tabs closed (a reused tab keeps old documents and WebGL contexts alive)."""
    c = s.c; c.session = None
    target = c.call('Target.createTarget', {'url': 'about:blank'})['targetId']
    session = c.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
    for info in c.call('Target.getTargets')['targetInfos']:
        if info['type'] == 'page' and info['targetId'] != target: c.call('Target.closeTarget', {'targetId': info['targetId']})
    c.session = session
    c.call('Page.enable'); c.call('Page.bringToFront'); c.call('Emulation.setFocusEmulationEnabled', {'enabled': True})
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': ERRORS}); c.call('Network.enable'); s.reduced(True)
    ordered = [i for i in ALL9 if i in essais]
    s.open(route, essais=ordered, theme=theme, lang=lang, viewport=vp, block_globe=block_globe, page=page, settle=settle)


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


def save(path, part, value):
    try: data = json.loads(path.read_text())
    except Exception: data = {}
    data[part] = value
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')


def load(path):
    try: return json.loads(path.read_text())
    except Exception: return {}


# --- Globe ----------------------------------------------------------------------------------------------------
GLOBE_JS = r'''(()=>{
 const g=window.horizonStudy?.globe?.getWorldScreenGeometry?.()||null;
 const box=sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect(),s=getComputedStyle(e);
  return {left:+b.left.toFixed(2),top:+b.top.toFixed(2),right:+b.right.toFixed(2),bottom:+b.bottom.toFixed(2),shown:s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0};};
 const font=sel=>{const e=document.querySelector(sel);if(!e)return null;const s=getComputedStyle(e);return s.fontSize+' / '+s.lineHeight};
 const stage=document.getElementById('globe'),cs=getComputedStyle(stage);
 const markers=[...document.querySelectorAll('#globe .hg-marker')].filter(m=>{const r=m.getBoundingClientRect();return r.width>0&&r.height>0});
 return {vw:innerWidth,vh:innerHeight,lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,active:document.documentElement.dataset.essais,
  sheets:[...document.querySelectorAll('link[data-essai]')].filter(l=>!l.disabled).map(l=>l.dataset.essai),
  geometry:g&&{center:{x:+g.center.x.toFixed(2),y:+g.center.y.toFixed(2)},radius:+g.radius.toFixed(2)},
  hgRadius:cs.getPropertyValue('--hg-radius').trim(),bandTop:cs.getPropertyValue('--essai-globe-top').trim(),bandBottom:cs.getPropertyValue('--essai-globe-bottom').trim(),
  level:stage.dataset.level||null,filter:box('#scope-path'),stats:box('#globe-hint'),status:box('#about'),search:box('.dock-search-toggle'),dice:box('#random-campus'),
  fonts:{stats:font('#globe-hint'),status:font('#about'),search:font('.dock-search-toggle'),marker:markers[0]?getComputedStyle(markers[0]).fontFamily:null},
  markers:markers.length,hint:document.getElementById('globe-hint')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth+1,errors:window.qaErrors||[]};
})()'''
KEYS = ('filter', 'stats', 'status', 'search', 'dice')


def clearance(geometry, rect):
    """Distance from the disc edge to a rectangle (negative = overlap); None when hidden."""
    if not geometry or not rect or not rect.get('shown'): return None
    cx, cy, r = geometry['center']['x'], geometry['center']['y'], geometry['radius']
    nx, ny = min(max(cx, rect['left']), rect['right']), min(max(cy, rect['top']), rect['bottom'])
    return round(math.hypot(cx - nx, cy - ny) - r, 2)


def globe_wait(s, seconds=40):
    s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', seconds); time.sleep(.8)


def relayout(s):
    time.sleep(.3); s.js('(()=>{window.horizonStudy.globe.refreshLayout({animate:false});return true})()'); time.sleep(.8)
    globe_wait(s, 25)


def setlang(s, lang):
    s.js(f'(()=>{{window.horizonStudy.setLocale({json.dumps(lang)});return true}})()')
    s.wait(f'document.documentElement.lang==={json.dumps(lang)}', 10); time.sleep(1.2)


def globe_measure(s, name=''):
    d = s.js(GLOBE_JS, 20)
    d['clearance'] = {k: clearance(d['geometry'], d[k]) for k in KEYS}
    g = d['geometry']
    d['centerOffset'] = g and [round(g['center']['x'] - d['vw'] / 2, 2), round(g['center']['y'] - d['vh'] / 2, 2)]
    print(name, json.dumps({'r': g and g['radius'], 'clear': d['clearance'], 'stats': d['fonts']['stats'], 'status': d['fonts']['status'],
                            'bands': [d['bandTop'], d['bandBottom']], 'err': len(d['errors'])}, ensure_ascii=False), flush=True)
    return d


# --- Images ---------------------------------------------------------------------------------------------------
def png(s, name):
    data = base64.b64decode(s.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=60)['data'])
    path = HERE / 'captures' / (name + '.png'); path.write_bytes(data); return path


def pixels(path):
    from PIL import Image
    import numpy as np
    return np.asarray(Image.open(path).convert('RGB'), dtype=int)


def board(items, out, height=None, width=None, gap=12, caption=22):
    """Side-by-side board of (path, box or None, caption); box in image pixels [x0, y0, x1, y1]."""
    from PIL import Image, ImageDraw
    tiles = []
    for path, box, text in items:
        img = Image.open(path).convert('RGB')
        if box: img = img.crop(tuple(int(v) for v in box))
        if height: img = img.resize((max(1, round(img.width * height / img.height)), height))
        elif width: img = img.resize((width, max(1, round(img.height * width / img.width))))
        tiles.append((img, text))
    w = sum(t.width for t, _ in tiles) + gap * (len(tiles) + 1); h = max(t.height for t, _ in tiles) + caption + gap * 2
    sheet = Image.new('RGB', (w, h), (245, 245, 245)); draw = ImageDraw.Draw(sheet); x = gap
    for img, text in tiles:
        draw.text((x, gap // 2), text, fill=(20, 20, 20)); sheet.paste(img, (x, gap + caption - 6)); x += img.width + gap
    out = HERE / 'planches' / out; sheet.save(out); return out
