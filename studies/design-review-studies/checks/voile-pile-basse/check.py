"""Trial voile-pile-basse: veil coverage behind the capsule, readable page ends, clicks through,
scroll fade with the dock, fixed desktop sidebar kept above the veil, Explorer unchanged.
Run: python3 -I studies/design-review-studies/checks/voile-pile-basse/check.py"""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, L, image_diff

ID = 'voile-pile-basse'
HIDE = '(()=>{let s=document.getElementById("qa-hide");if(!s){s=document.createElement("style");s.id="qa-hide";document.head.append(s)}s.textContent=%s;return true})()'
CONTROLS_HIDDEN = json.dumps('.dock-shell,.dock-shell *,.back-to-top{visibility:hidden!important}')
CONTROLS_AND_VEIL_HIDDEN = json.dumps('.dock-shell,.dock-shell *,.back-to-top{visibility:hidden!important}#app::before,#content-sheet::after{display:none!important}')
STATE_JS = '''(()=>{const app=document.getElementById('app'),b=getComputedStyle(app,'::before'),a=getComputedStyle(document.getElementById('content-sheet'),'::after');
const host=b.display!=='none'&&b.content!=='none'?'app::before':(a.display!=='none'&&a.content!=='none'?'content-sheet::after':null),v=host==='content-sheet::after'?a:b;
const box=s=>{const e=document.querySelector(s);if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};
const side=[...document.querySelectorAll('[data-detail-scroll=sidebar]')].find(e=>!e.closest('[hidden]')&&e.getClientRects().length);const frame=side&&side.querySelector('.cp-detail-menu');
const probe=document.createElement('i');probe.style.color='var(--h42-color-bg)';document.body.append(probe);const bg=getComputedStyle(probe).color;probe.remove();
return {vw:innerWidth,vh:innerHeight,scrollY:Math.round(scrollY),section:app.dataset.section,host,veil:{content:v.content,display:v.display,height:parseFloat(v.height)||0,opacity:v.opacity,visibility:v.visibility,zIndex:v.zIndex,pointerEvents:v.pointerEvents,position:v.position},
 veilTop:innerHeight-(parseFloat(v.height)||0),bg,theme:document.documentElement.dataset.theme,
 toggle:box('.dock-search-toggle'),die:box('.dock-random-toggle'),dock:box('#main-nav'),scrolling:document.querySelector('.dock-shell')?.dataset.documentScrolling||null,
 sidebar:side?(r=>({x:r.x,y:r.y,w:r.width,h:r.height,zIndex:getComputedStyle(side).zIndex}))(side.getBoundingClientRect()):null,
 menuFrame:frame?(r=>({x:r.x,y:r.y,w:r.width,h:r.height}))(frame.getBoundingClientRect()):null,overflow:document.documentElement.scrollWidth>innerWidth+1}})()'''
# Bottom of the last visible in-flow content of the page (the fixed desktop sidebar excluded).
LAST_JS = '''(()=>{const sheet=document.getElementById('content-sheet');let best=null;
for(const e of sheet.querySelectorAll('a,button,input,textarea,select,p,h1,h2,h3,li,img,time,label,nav')){if(e.closest('[hidden],[data-detail-scroll=sidebar],.cp-author-fit-probe'))continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
 const st=getComputedStyle(e);if(st.visibility==='hidden'||st.position==='fixed')continue;if(!best||r.bottom>best.bottom)best={bottom:r.bottom,tag:e.tagName.toLowerCase(),cls:e.className&&String(e.className).slice(0,40),text:(e.textContent||'').trim().slice(0,40)}}
return {best,scrollY:Math.round(scrollY),maxScroll:document.documentElement.scrollHeight-innerHeight}})()'''
# elementFromPoint on a grid inside the veil zone and just above it, outside the floating controls.
GRID_JS = '''(top=>{const stack=['.dock-search-toggle','.dock-random-toggle','#main-nav','.back-to-top'].map(s=>document.querySelector(s)).filter(e=>e&&e.getClientRects().length).map(e=>e.getBoundingClientRect());
const inStack=(x,y)=>stack.some(r=>x>=r.left-4&&x<=r.right+4&&y>=r.top-4&&y<=r.bottom+4);const name=e=>e?e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.classList&&e.classList[0]?'.'+e.classList[0]:''):null;
const out=[];for(const y of [top-3,top+8,(top+innerHeight)/2,innerHeight-6])for(let i=0;i<12;i++){const x=6+i*(innerWidth-12)/11;if(inStack(x,y))continue;out.push([Math.round(x),Math.round(y),name(document.elementFromPoint(x,y))])}
return out})(%s)'''
# A link of the page lying under the veil, outside the floating controls (for a real click).
LINK_JS = '''(()=>{const v=getComputedStyle(document.getElementById('app'),'::before'),top=innerHeight-(parseFloat(v.height)||0);
const stack=['.dock-search-toggle','.dock-random-toggle','#main-nav','.back-to-top'].map(s=>document.querySelector(s)).filter(e=>e&&e.getClientRects().length).map(e=>e.getBoundingClientRect());
const inStack=(x,y)=>stack.some(r=>x>=r.left-4&&x<=r.right+4&&y>=r.top-4&&y<=r.bottom+4);
for(const a of document.querySelectorAll('#content-list a.cp-card-title-link,#content-list a.cp-card-cover-link')){for(const r of a.getClientRects()){const y=Math.max(r.top,top)+6;if(y>Math.min(r.bottom,innerHeight)-4)continue;
 for(const x of [r.left+10,r.left+r.width/2]){if(inStack(x,y))continue;const hit=document.elementFromPoint(x,y);if(hit===a||a.contains(hit))return {x,y,veilTop:top,href:a.getAttribute('href')}}}}return null})()'''
# Scroll so that a large picture (or else a text block) sits behind the capsule and the die.
TARGET_JS = '''(()=>{const t=document.querySelector(".dock-search-toggle").getBoundingClientRect(),d=document.querySelector(".dock-random-toggle").getBoundingClientRect();
const fits=e=>{const r=e.getBoundingClientRect();return !e.closest("[hidden],[data-detail-scroll=sidebar],.cp-author-fit-probe")&&r.width&&r.top>=t.top-4&&r.left<Math.max(t.right,d.right)&&r.right>Math.min(t.left,d.left)};
const pick=[...document.querySelectorAll("#content-sheet .cp-cover,#content-sheet .cp-profile-portrait,#content-sheet img")].find(e=>fits(e)&&e.getBoundingClientRect().height>=t.height)
 ||[...document.querySelectorAll("#content-sheet p,#content-sheet h2,#content-sheet h3,#content-sheet textarea,#content-sheet li")].find(fits);
if(!pick)return null;return {scroll:Math.round(pick.getBoundingClientRect().top+scrollY-t.top+2),tag:pick.tagName.toLowerCase(),cls:String(pick.className).slice(0,30)}})()'''

VIEWS = [  # vue, route, theme, lang, viewport
    ('ordinateur', 'projects', 'light', 'fr', D),
    ('mobile', 'projects', 'light', 'fr', M),
    ('petit', 'projects', 'light', 'fr', S),
    ('sombre-mobile', 'journal', 'dark', 'fr', M),
    ('sombre-ordinateur', 'people', 'dark', 'en', D),
    ('paysage', 'projects', 'light', 'fr', L),
    ('fiche-ordinateur', 'projects/ft-transcendence-building-together?tab=overview', 'light', 'fr', D),
    ('fiche-1280x720', 'projects/ft-transcendence-building-together?tab=comments', 'light', 'fr', (1280, 720, False)),
    ('ar-mobile', 'people/profile-leila-mansour?tab=overview', 'light', 'ar', M),
    ('chronique-ordinateur', 'journal/journal-an-evening-debugging?tab=article', 'light', 'fr', D),
    ('profil-sombre-ordinateur', 'people/profile-leila-mansour?tab=overview', 'dark', 'fr', D),
]
results = {'id': ID, 'views': [], 'runtime': {}, 'explorer': {}, 'errors': {}, 'passed': False}
# First colour stop of the veil (the page background of the current theme) and its transition.
PAINT_JS = '''(()=>{const app=document.getElementById('app'),v=getComputedStyle(app,'::before');const probe=document.createElement('i');probe.style.color='var(--h42-color-bg)';document.body.append(probe);const bg=getComputedStyle(probe).color;probe.remove();
return {theme:document.documentElement.dataset.theme,bg,image:v.backgroundImage.slice(0,120),opacity:v.opacity,transition:v.transition,top:innerHeight-parseFloat(v.height),
 toggle:(r=>({x:r.x,y:r.y,w:r.width,h:r.height}))(document.querySelector('.dock-search-toggle').getBoundingClientRect())}})()'''


def rgb(value):
    import re
    return tuple(int(round(float(n))) for n in re.findall(r'[\d.]+', value)[:3])


def crop(path, rect, scale):
    from PIL import Image
    import numpy as np
    img = np.asarray(Image.open(path).convert('RGB'), dtype=float)
    y0, y1 = int(round(rect['y'] * scale)), int(round((rect['y'] + rect['h']) * scale)); x0, x1 = int(round(rect['x'] * scale)), int(round((rect['x'] + rect['w']) * scale))
    return img[max(0, y0):y1, max(0, x0):x1]


def coverage(with_veil, without_veil, rects, bg, scale):
    """Effective veil opacity over content pixels inside rects: alpha = 1 - (A-bg)/(B-bg)."""
    import numpy as np
    bgv = np.array(bg, dtype=float); alphas, near, total, content = [], 0, 0, 0
    for r in rects:
        if not r: continue
        A, B = crop(with_veil, r, scale), crop(without_veil, r, scale)
        dB, dA = B - bgv, A - bgv
        ch = np.abs(dB).argmax(axis=2)
        db = np.take_along_axis(dB, ch[..., None], axis=2)[..., 0]; da = np.take_along_axis(dA, ch[..., None], axis=2)[..., 0]
        mask = np.abs(db) > 30
        if mask.any(): alphas.append(np.clip(1 - da[mask] / db[mask], 0, 1))
        content += int(mask.sum()); total += A.shape[0] * A.shape[1]; near += int((np.abs(dA).sum(axis=2) <= 24).sum())
    alpha = float(np.concatenate(alphas).mean()) if alphas else None
    return {'contentPixels': content, 'pixels': total, 'effectiveCoverage': None if alpha is None else round(alpha, 4), 'shareReadingAsBackground': round(near / total, 4) if total else None}


def region_change(with_veil, without_veil, rect, scale):
    """Share of pixels changed by more than 24 (sum of RGB) between the two frames."""
    import numpy as np
    A, B = crop(with_veil, rect, scale), crop(without_veil, rect, scale)
    return round(float((np.abs(A - B).sum(axis=2) > 24).mean()), 5) if A.size else None


s = Session(HERE)
try:
    for vue, route, theme, lang, vp in VIEWS:
        scale = 2 if vp[2] else 1
        case = {'vue': vue, 'route': route, 'theme': theme, 'lang': lang, 'viewport': list(vp[:2])}
        s.open(route, essais=[ID], theme=theme, lang=lang, viewport=vp, block_globe=True)
        s.shot(f'apres-{vue}'); st = s.js(STATE_JS); case['apres'] = {'state': st, 'errors': s.errors()}
        case['gridApres'] = s.js(GRID_JS % st['veilTop'])
        # Coverage behind the capsule and the die, with a picture (or text) scrolled behind them.
        target = s.js(TARGET_JS); case['coverageTarget'] = target
        if target: s.scroll(max(0, target['scroll']))
        time.sleep(1.0)
        geo = s.js(STATE_JS)
        s.js(HIDE % CONTROLS_HIDDEN); time.sleep(.3); s.shot(f'mesure-voile-{vue}')
        s.js(HIDE % CONTROLS_AND_VEIL_HIDDEN); time.sleep(.3); s.shot(f'mesure-sans-voile-{vue}')
        s.js(HIDE % json.dumps(''))
        case['coverageScroll'] = geo['scrollY']
        case['coverage'] = coverage(HERE / f'mesure-voile-{vue}.png', HERE / f'mesure-sans-voile-{vue}.png', [geo['toggle'], geo['die']], rgb(geo['bg']), scale)
        if geo['sidebar'] and geo['menuFrame']:
            f = geo['menuFrame']; top = max(f['y'], geo['veilTop']); bottom = f['y'] + f['h']
            zone = {'x': f['x'], 'y': top, 'w': f['w'], 'h': max(0, bottom - top)}
            case['sidebar'] = {'host': geo['host'], 'zIndex': geo['sidebar']['zIndex'], 'menuFrame': f, 'veilTop': geo['veilTop'], 'menuPartInVeilZone': round(zone['h'], 1),
                               'menuPixelsChangedByVeil': region_change(HERE / f'mesure-voile-{vue}.png', HERE / f'mesure-sans-voile-{vue}.png', zone, scale) if zone['h'] > 1 else None}
        # The veil leaves with the dock while the document scrolls, then returns.
        s.scroll(0)
        for _ in range(4): s.js('(()=>{scrollBy(0,90);return true})()'); time.sleep(.09)
        during = s.js(STATE_JS); time.sleep(1.2); after = s.js(STATE_JS)
        case['scrollFade'] = {'during': {'scrolling': during['scrolling'], 'veilOpacity': during['veil']['opacity']}, 'rest': {'scrolling': after['scrolling'], 'veilOpacity': after['veil']['opacity']}}
        # The end of the page sits fully above the veil.
        s.scroll(10 ** 6); time.sleep(.6); end = s.js(LAST_JS); s.shot(f'apres-fin-{vue}')
        case['end'] = {**end, 'veilTop': st['veilTop'], 'clear': bool(end['best'] and end['best']['bottom'] <= st['veilTop'] + .5), 'margin': round(st['veilTop'] - end['best']['bottom'], 1) if end['best'] else None}
        case['apres']['errorsAfter'] = s.errors()
        # Baseline: same frames, and the same hit-test grid.
        s.open(route, theme=theme, lang=lang, viewport=vp, block_globe=True)
        s.shot(f'avant-{vue}'); case['avant'] = {'state': s.js(STATE_JS), 'errors': s.errors()}
        case['gridAvant'] = s.js(GRID_JS % st['veilTop'])
        case['hitTestsIdentical'] = case['gridAvant'] == case['gridApres']; case['hitTestPoints'] = len(case['gridApres'])
        s.scroll(10 ** 6); time.sleep(.6); case['avant']['end'] = s.js(LAST_JS); s.shot(f'avant-fin-{vue}')
        case['pixelShareAtRest'] = round(image_diff(HERE / f'avant-{vue}.png', HERE / f'apres-{vue}.png'), 5)
        results['views'].append(case)
        s.record(vue, {'host': st['host'], 'veilHeight': st['veil']['height'], 'coverage': case['coverage'], 'target': target, 'hitTestsIdentical': case['hitTestsIdentical'], 'points': case['hitTestPoints'],
                       'end': {k: case['end'][k] for k in ('clear', 'margin')}, 'scrollFade': case['scrollFade'], 'sidebar': case.get('sidebar')})
    # A real click on a link that lies under the veil (desktop list).
    s.open('projects', essais=[ID], viewport=D, block_globe=True)
    point = s.js(LINK_JS)
    if point:
        for kind in ('mousePressed', 'mouseReleased'): s.c.call('Input.dispatchMouseEvent', {'type': kind, 'x': point['x'], 'y': point['y'], 'button': 'left', 'clickCount': 1})
        time.sleep(1.2)
        results['realClick'] = {'point': point, 'hashAfter': s.js('location.hash'), 'detailOpen': s.js('!document.getElementById("project-detail").hidden')}
        s.record('real-click', results['realClick'])
    # Theme switched at runtime through the account menu: the veil takes the new background.
    rt = results['runtime']
    s.open('projects', essais=[ID], viewport=M, block_globe=True)
    rt['themeBefore'] = s.js(PAINT_JS); s.settings('fr', 'dark'); time.sleep(.8); rt['themeAfter'] = s.js(PAINT_JS)
    # Combined with the alternative recherche-repliee (both may be active together).
    s.open('projects', essais=['recherche-repliee', ID], viewport=M, block_globe=True)
    rt['combined'] = {'paint': s.js(PAINT_JS), 'active': s.js('window.horizonEssais.active'), 'errors': s.errors()}; s.shot('apres-combine-mobile')
    # Transitions: the baseline's global reduced-motion rule removes them, otherwise .35 s.
    rt['reducedMotion'] = s.js(PAINT_JS)['transition']
    s.reduced(False); s.open('projects', essais=[ID], viewport=M, block_globe=True); rt['fullMotion'] = s.js(PAINT_JS)['transition']; s.reduced(True)
    s.record('runtime', rt)
    results['errors']['content'] = s.errors()
finally:
    s.close()

s = Session(HERE)
try:
    ex = {}
    for vue, vp in (('explorer-ordinateur', D), ('explorer-mobile', M)):
        pair = {}
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open('explore', essais=essais, viewport=vp, block_globe=True)
            st = s.js(STATE_JS); s.shot(f'{side}-{vue}-sans-globe')
            pair[side] = {'host': st['host'], 'veilOpacity': st['veil']['opacity'], 'veilVisibility': st['veil']['visibility']}
        pair['pixelShare'] = round(image_diff(HERE / f'avant-{vue}-sans-globe.png', HERE / f'apres-{vue}-sans-globe.png'), 6)
        ex[vue] = pair; s.record(vue, pair)
    for side, essais in (('avant', []), ('apres', [ID])):
        s.open('explore', essais=essais, viewport=D, block_globe=False, settle=3)
        ex.setdefault('globe', {})[side + 'Ready'] = s.globe_ready(5); s.shot(f'{side}-explorer-globe')
    ex['globe']['pixelShare'] = round(image_diff(HERE / 'avant-explorer-globe.png', HERE / 'apres-explorer-globe.png'), 6)
    results['explorer'] = ex; results['errors']['explorer'] = s.errors(); s.record('explorer-globe', ex['globe'])
finally:
    s.close()

views = results['views']
rt = results['runtime']
results['runtimePassed'] = bool(
    rt['themeBefore']['theme'] == 'light' and rt['themeAfter']['theme'] == 'dark' and rt['themeAfter']['bg'] != rt['themeBefore']['bg']
    and rt['themeBefore']['bg'] in rt['themeBefore']['image'] and rt['themeAfter']['bg'] in rt['themeAfter']['image'] and rt['themeBefore']['bg'] not in rt['themeAfter']['image']
    and rt['themeAfter']['opacity'] == '1'
    and rt['combined']['paint']['opacity'] == '1' and rt['combined']['paint']['toggle']['w'] == 44 and abs(rt['combined']['paint']['top'] - (rt['combined']['paint']['toggle']['y'] - 24)) < .6
    and not rt['combined']['errors'] and '0.35s' not in rt['reducedMotion'] and '0.35s' in rt['fullMotion'])
results['passed'] = bool(
    results['runtimePassed'] and
    all(c['coverage']['effectiveCoverage'] is not None and c['coverage']['effectiveCoverage'] >= .85 for c in views)
    and all(c['end']['clear'] for c in views)
    and all(c['hitTestsIdentical'] and c['hitTestPoints'] > 0 for c in views)
    and all(c['scrollFade']['during']['veilOpacity'] == '0' and c['scrollFade']['rest']['veilOpacity'] == '1' for c in views)
    and all(c['sidebar']['menuPixelsChangedByVeil'] in (None, 0.0) for c in views if c.get('sidebar'))
    and results.get('realClick', {}).get('detailOpen')
    and all(results['explorer'][k]['pixelShare'] == 0 for k in ('explorer-ordinateur', 'explorer-mobile'))
    and results['explorer']['globe']['pixelShare'] <= .02
    and not any(c['apres']['errors'] or c['apres']['errorsAfter'] for c in views))
(HERE / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
print('passed', results['passed'])
