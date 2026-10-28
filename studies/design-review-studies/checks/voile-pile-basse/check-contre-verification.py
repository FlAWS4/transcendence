"""Trial voile-pile-basse, second adversarial verification (14 Oct 2026, after the 19:00 outage).
Re-measures the acceptance criteria and probes the keyboard rule added at 18:42 (the veil steps aside
while :focus-visible is inside #content-sheet), including the programmatic focus that the baseline
moves to the page heading after every dock or card navigation.
Parts: coverage, ends, focus, menus, scroll, motion, runtime, sidebar, explorer, globe, awards, combined.
One short Chrome session per part (pages kept in the back/forward cache add up under the memory cap).
Writes results-contre-verification.json. Run:
python3 -I studies/design-review-studies/checks/voile-pile-basse/check-contre-verification.py [part ...]"""
import json, re, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, L

ID = 'voile-pile-basse'
OUT = HERE / 'results-contre-verification.json'
SCRATCH = Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/2cf0c114-786b-4a24-866f-57822e04403f/scratchpad/agents/verif-pile-recherche-voile/vpb')
COMMENTS = 'projects/ft-transcendence-building-together?tab=comments'
DETAIL = 'projects/ft-transcendence-building-together?tab=overview'
ARTICLE = 'journal/journal-an-evening-debugging?tab=article'
PROFILE = 'people/profile-leila-mansour?tab=overview'

VEIL_JS = r'''(()=>{const app=document.getElementById('app'),sheet=document.getElementById('content-sheet'),b=getComputedStyle(app,'::before'),a=getComputedStyle(sheet,'::after');
const on=v=>v.display!=='none'&&v.content!=='none'&&v.content!=='normal';const host=on(b)?'app::before':on(a)?'content-sheet::after':null,v=host==='content-sheet::after'?a:b,h=host?parseFloat(v.height)||0:0;
const box=s=>{const e=document.querySelector(s);if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}};
const probe=document.createElement('i');probe.style.color='var(--h42-color-bg)';document.body.append(probe);const bg=getComputedStyle(probe).color;probe.remove();
const f=document.activeElement;
return {host,height:h,top:+(innerHeight-h).toFixed(1),opacity:host?v.opacity:null,visibility:host?v.visibility:null,pointerEvents:host?v.pointerEvents:null,bg,image:host?v.backgroundImage.slice(0,70):null,
 theme:document.documentElement.dataset.theme,lang:document.documentElement.lang,dir:document.documentElement.dir,section:app.dataset.section,
 toggle:box('.dock-search-toggle'),die:box('.dock-random-toggle'),dock:box('#main-nav'),scrollY:Math.round(scrollY),
 scrolling:document.querySelector('.dock-shell')?.dataset.documentScrolling||null,
 focus:f&&f!==document.body?{el:f.tagName.toLowerCase()+(f.id?'#'+f.id:'')+(f.classList[0]?'.'+f.classList[0]:''),visible:f.matches(':focus-visible'),inSheet:Boolean(f.closest('#content-sheet'))}:null}})()'''
HIDE = '(()=>{let s=document.getElementById("qa-hide");if(!s){s=document.createElement("style");s.id="qa-hide";document.head.append(s)}s.textContent=%s;return true})()'
NO_CONTROLS = json.dumps('.dock-shell,.dock-shell *,.back-to-top{visibility:hidden!important}')
NO_CONTROLS_NO_VEIL = json.dumps('.dock-shell,.dock-shell *,.back-to-top{visibility:hidden!important}#app::before,#content-sheet::after{display:none!important}')
# Scroll so that a picture (else a text block) of the page sits right behind the capsule.
TARGET_JS = r'''(()=>{const t=document.querySelector(".dock-search-toggle").getBoundingClientRect(),d=document.querySelector(".dock-random-toggle").getBoundingClientRect();
const left=Math.min(t.left,d.left),right=Math.max(t.right,d.right);
const ok=e=>{if(e.closest("[hidden],[data-detail-scroll=sidebar]")||!e.checkVisibility())return false;const r=e.getBoundingClientRect();return r.width&&r.height>=t.height&&r.left<right&&r.right>left&&r.top+scrollY>t.top};
const pick=[...document.querySelectorAll("#content-sheet .cp-cover,#content-sheet img")].find(ok)||[...document.querySelectorAll("#content-sheet p,#content-sheet h2,#content-sheet h3")].find(e=>{const r=e.getBoundingClientRect();return !e.closest("[hidden],[data-detail-scroll=sidebar]")&&e.checkVisibility()&&r.left<right&&r.right>left&&r.top+scrollY>t.top});
if(!pick)return null;const r=pick.getBoundingClientRect();return {scroll:Math.round(r.top+scrollY-t.top+2),cls:String(pick.className).slice(0,30),tag:pick.tagName.toLowerCase()}})()'''
# Lowest visible content box of the sheet (closed <details> panels and fixed boxes excluded).
LAST_JS = r'''(()=>{const sheet=document.getElementById('content-sheet');let best=null;
for(const e of sheet.querySelectorAll('a,button,input,textarea,select,p,h1,h2,h3,li,img,time,label,nav,figure')){if(e.closest('[hidden],[data-detail-scroll=sidebar],.sr-only')||!e.checkVisibility({visibilityProperty:true}))continue;
 const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;if(getComputedStyle(e).position==='fixed')continue;
 if(!best||r.bottom>best.bottom)best={bottom:+r.bottom.toFixed(1),tag:e.tagName.toLowerCase(),text:(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,40)}}
return {best,scrollY:Math.round(scrollY),maxScroll:document.documentElement.scrollHeight-innerHeight,docHeight:document.documentElement.scrollHeight}})()'''
GRID_JS = r'''(top=>{const stack=['.dock-search-toggle','.dock-random-toggle','#main-nav','.back-to-top'].map(s=>document.querySelector(s)).filter(e=>e&&e.getClientRects().length).map(e=>e.getBoundingClientRect());
const inStack=(x,y)=>stack.some(r=>x>=r.left-4&&x<=r.right+4&&y>=r.top-4&&y<=r.bottom+4);const name=e=>e?e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.classList&&e.classList[0]?'.'+e.classList[0]:''):null;
const out=[];for(const y of [top-3,top+8,top+60])for(let i=0;i<10;i++){const x=8+i*(innerWidth-16)/9;if(inStack(x,y)||y>=innerHeight)continue;const h=document.elementFromPoint(x,y);out.push([Math.round(x),Math.round(y),name(h),Boolean(h&&h.closest('#content-sheet'))])}
return out})(%s)'''
FOCUS_JS = r'''(()=>{const e=document.activeElement,r=e.getBoundingClientRect(),app=document.getElementById('app'),sheet=document.getElementById('content-sheet'),b=getComputedStyle(app,'::before'),a=getComputedStyle(sheet,'::after');
const v=b.display!=='none'?b:a,h=parseFloat(v.height)||0,top=innerHeight-h;
return {el:e.tagName.toLowerCase()+(e.classList[0]?'.'+e.classList[0]:''),text:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,24),top:Math.round(r.top),bottom:Math.round(r.bottom),
 veilTop:Math.round(top),veilOpacity:v.opacity,focusVisible:e.matches(':focus-visible'),inSheet:Boolean(e.closest('#content-sheet')),visibleAboveVeil:Math.max(0,Math.round(Math.min(r.bottom,top)-Math.max(r.top,0)))}})()'''


def fresh(s, route, **kw):
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.4)
    s.open(route, **kw)


def press(s, key, code, text=None, shift=False):
    down = {'type': 'keyDown', 'key': key, 'code': key, 'windowsVirtualKeyCode': code, 'modifiers': 8 if shift else 0}
    if text: down['text'] = text
    s.c.call('Input.dispatchKeyEvent', down)
    s.c.call('Input.dispatchKeyEvent', {'type': 'keyUp', 'key': key, 'code': key, 'windowsVirtualKeyCode': code, 'modifiers': 8 if shift else 0})
    time.sleep(.35)


def tap(s, selector):
    """Touch tap (mobile emulation) at the centre of an element."""
    pos = s.js('(()=>{const e=document.querySelector(' + json.dumps(selector) + ');if(!e)return null;e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
    if not pos: raise RuntimeError('missing ' + selector)
    s.c.call('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [pos]})
    s.c.call('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    time.sleep(.4)


def rgb(value):
    return tuple(int(round(float(n))) for n in re.findall(r'[\d.]+', value)[:3])


def diff_box(a, b, scale, region=None):
    """Exact comparison: count and CSS-px bounding box of differing pixels (optionally inside region x,y,w,h)."""
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(a).convert('RGB'), dtype=int); y = np.asarray(Image.open(b).convert('RGB'), dtype=int)
    if x.shape != y.shape: return {'shape': [list(x.shape), list(y.shape)]}
    m = (x != y).any(axis=2); delta = np.abs(x - y).sum(axis=2)
    if region:
        rx, ry, rw, rh = (int(round(v * scale)) for v in region); keep = np.zeros_like(m); keep[max(0, ry):ry + rh, max(0, rx):rx + rw] = True; m &= keep
    if not m.any(): return {'pixels': 0, 'box': None, 'maxDelta': 0}
    ys, xs = np.nonzero(m)
    return {'pixels': int(m.sum()), 'box': [round(float(xs.min()) / scale, 1), round(float(ys.min()) / scale, 1), round(float(xs.max() + 1) / scale, 1), round(float(ys.max() + 1) / scale, 1)],
            'maxDelta': int(delta[m].max())}


def coverage(with_veil, without_veil, rects, bg, scale):
    """Inside the capsule and die rects (controls hidden): share of all sampled pixels that read as the page
    background with the veil; content pixels (differ from bg by > 30 without the veil) and the share of them
    that read as background with the veil; effective opacity alpha = 1 - (A - bg) / (B - bg)."""
    from PIL import Image
    import numpy as np
    A0 = np.asarray(Image.open(with_veil).convert('RGB'), dtype=float); B0 = np.asarray(Image.open(without_veil).convert('RGB'), dtype=float)
    bgv = np.array(bg, dtype=float); total = asbg = content = hidden = 0; alphas = []
    for r in rects:
        y0, y1, x0, x1 = (int(round(v * scale)) for v in (r['y'], r['y'] + r['h'], r['x'], r['x'] + r['w']))
        A, B = A0[y0:y1, x0:x1], B0[y0:y1, x0:x1]
        dA, dB = A - bgv, B - bgv
        total += A.shape[0] * A.shape[1]; asbg += int((np.abs(dA).sum(axis=2) <= 24).sum())
        ch = np.abs(dB).argmax(axis=2)
        db = np.take_along_axis(dB, ch[..., None], axis=2)[..., 0]; da = np.take_along_axis(dA, ch[..., None], axis=2)[..., 0]
        mask = np.abs(db) > 30
        content += int(mask.sum()); hidden += int(((np.abs(dA).sum(axis=2) <= 24) & mask).sum())
        if mask.any(): alphas.append(np.clip(1 - da[mask] / db[mask], 0, 1))
    return {'sampled': total, 'coveredShare': round(asbg / total, 4) if total else None, 'contentPixels': content,
            'hiddenShare': round(hidden / content, 4) if content else None,
            'effectiveOpacity': round(float(np.concatenate(alphas).mean()), 4) if alphas else None}


def part_coverage(s, cases):
    out = []
    for vue, route, theme, lang, vp in cases:
        fresh(s, route, essais=[ID], theme=theme, lang=lang, viewport=vp, block_globe=True)
        target = s.js(TARGET_JS)
        if target: s.scroll(max(0, target['scroll']))
        time.sleep(1.0); v = s.js(VEIL_JS)
        s.shot(f'apres-repos-{vue}')
        s.js(HIDE % NO_CONTROLS); time.sleep(.3); s.shot(f'cv-voile-{vue}')
        s.js(HIDE % NO_CONTROLS_NO_VEIL); time.sleep(.3); s.shot(f'cv-sans-voile-{vue}')
        s.js(HIDE % json.dumps(''))
        cov = coverage(SCRATCH / f'cv-voile-{vue}.png', SCRATCH / f'cv-sans-voile-{vue}.png', [v['toggle'], v['die']], rgb(v['bg']), 2 if vp[2] else 1)
        row = {'vue': vue, 'route': route, 'theme': theme, 'lang': lang, 'viewport': list(vp[:2]), 'target': target, 'veil': {k: v[k] for k in ('host', 'height', 'top', 'opacity', 'pointerEvents', 'bg', 'scrollY')},
               'capsuleTop': v['toggle']['y'], 'rampAboveCapsule': round(v['toggle']['y'] - v['top'], 1), **cov}
        out.append(row); s.record('coverage-' + vue, {k: row[k] for k in ('veil', 'rampAboveCapsule', 'coveredShare', 'contentPixels', 'hiddenShare', 'effectiveOpacity')})
    return out


def part_ends(s, cases):
    out = []
    for vue, route, vp in cases:
        case = {'vue': vue, 'route': route, 'viewport': list(vp[:2])}
        for side, essais in (('apres', [ID]), ('avant', [])):
            fresh(s, route, essais=essais, viewport=vp, block_globe=True)
            if side == 'apres': case['veil'] = s.js(VEIL_JS)
            case['grid' + side.capitalize()] = s.js(GRID_JS % case['veil']['top'])
            if vue in ('ordinateur', 'mobile'): s.shot(f'{side}-repos-liste-{vue}')
            s.scroll(10 ** 6); time.sleep(.8); case[side] = s.js(LAST_JS)
            case[side + 'VeilAtEnd'] = s.js(VEIL_JS)['opacity']
            s.shot(f'{side}-fin-{vue}')
        case['sameLayout'] = case['avant'] == case['apres']
        case['margin'] = round(case['veil']['top'] - case['apres']['best']['bottom'], 1)
        case['hitsIdentical'] = case['gridAvant'] == case['gridApres']
        case['hitsOnContent'] = sum(1 for p in case['gridApres'] if p[3]), len(case['gridApres'])
        if vue in ('ordinateur', 'mobile'):
            # At rest, outside the veil band the trial must not change a single pixel.
            sc = 2 if vp[2] else 1
            case['pixelsAboveVeil'] = diff_box(SCRATCH / f'avant-repos-liste-{vue}.png', SCRATCH / f'apres-repos-liste-{vue}.png', sc, (0, 0, vp[0], case['veil']['top']))
            case['pixelsAll'] = diff_box(SCRATCH / f'avant-repos-liste-{vue}.png', SCRATCH / f'apres-repos-liste-{vue}.png', sc)
        out.append(case)
        s.record('end-' + vue, {k: case.get(k) for k in ('sameLayout', 'margin', 'hitsIdentical', 'hitsOnContent', 'pixelsAboveVeil', 'pixelsAll', 'apresVeilAtEnd')} | {'last': case['apres']['best']})
    return out


def state(s):
    v = s.js(VEIL_JS); return {'section': v['section'], 'host': v['host'], 'opacity': v['opacity'], 'focus': v['focus'], 'scrollY': v['scrollY']}


def part_focus(s):
    out = {}
    # Mouse click on a dock destination: the baseline then focuses the page heading by script.
    fresh(s, 'projects', essais=[ID], viewport=D, block_globe=True)
    s.click('#main-nav > button[data-section=journal]'); time.sleep(1.2); out['sourisDockChroniques'] = state(s)
    s.click('#content-list .cp-card-title-link'); time.sleep(1.4); out['sourisCarteVersArticle'] = state(s)
    s.js('(()=>{history.back();return true})()'); time.sleep(1.4); out['retourHistorique'] = state(s)
    # Touch taps on mobile: dock, then a card, then the in-page Back button.
    fresh(s, 'projects', essais=[ID], viewport=M, block_globe=True)
    tap(s, '#main-nav > button[data-section=people]'); time.sleep(1.2); out['toucherDockProfils'] = state(s)
    tap(s, '#content-list a'); time.sleep(1.4); out['toucherCarteVersProfil'] = state(s)
    back = s.js('(()=>{const b=[...document.querySelectorAll("#content-sheet button,#content-sheet a")].find(e=>e.checkVisibility()&&/retour/i.test(e.getAttribute("aria-label")||e.textContent||""));return b?(b.id?"#"+b.id:null):null})()')
    if back: tap(s, back); time.sleep(1.4); out['toucherRetour'] = state(s)
    # Keyboard: Enter on a dock destination, then a Tab walk through the list (positions under the veil).
    fresh(s, 'projects', essais=[ID], viewport=M, block_globe=True)
    s.js('(()=>{document.querySelector("#main-nav > button[data-section=journal]").focus();return true})()')
    press(s, 'Enter', 13, text='\r'); time.sleep(1.2); out['clavierDockChroniques'] = state(s)
    press(s, 'Escape', 27)
    fresh(s, 'projects', essais=[ID], viewport=M, block_globe=True)
    s.js('(()=>{scrollTo(0,0);document.querySelector("#content-list a").focus();return true})()'); time.sleep(.6)
    rows = []
    for step in range(1, 23):
        press(s, 'Tab', 9); time.sleep(.45)
        row = s.js(FOCUS_JS); row['step'] = step
        if not row['inSheet']: break
        rows.append(row)
    out['tab'] = {'steps': len(rows), 'underVeil': [r for r in rows if r['visibleAboveVeil'] == 0 and r['top'] < 844],
                  'hiddenUnderOpaqueVeil': [r for r in rows if r['visibleAboveVeil'] == 0 and r['top'] < 844 and float(r['veilOpacity']) > .05],
                  'opacities': sorted({r['veilOpacity'] for r in rows})}
    s.blur(); time.sleep(.6); out['tab']['afterBlur'] = s.js(VEIL_JS)['opacity']
    for k, v in out.items(): s.record('focus-' + k, v if k != 'tab' else {x: (len(y) if isinstance(y, list) and x != 'opacities' else y) for x, y in v.items()})
    return out


def part_menus(s):
    out = {}
    fresh(s, 'projects', essais=[ID], viewport=M, block_globe=True)
    s.click('#content-sort-button'); time.sleep(.6); out['triOuvert'] = state(s)
    press(s, 'Escape', 27); time.sleep(.6); out['triFerme'] = state(s)
    s.blur(); time.sleep(.6); out['triFermeSansFocus'] = state(s)
    fresh(s, DETAIL, essais=[ID], viewport=M, block_globe=True)
    s.click('#project-section-picker'); time.sleep(.6)
    out['sectionsOuvert'] = state(s) | {'open': s.js('Boolean(document.querySelector("details.cp-project-section-switch[open]"))')}
    press(s, 'Escape', 27); time.sleep(.6); s.blur(); time.sleep(.6)
    out['sectionsFerme'] = state(s) | {'open': s.js('Boolean(document.querySelector("details.cp-project-section-switch[open]"))')}
    for k, v in out.items(): s.record('menus-' + k, v)
    return out


def part_scroll(s):
    out = {}
    fresh(s, 'projects', essais=[ID], viewport=M, block_globe=True)
    out['repos'] = state(s)
    samples = []
    for i in range(6):
        s.c.call('Input.dispatchMouseEvent', {'type': 'mouseWheel', 'x': 195, 'y': 400, 'deltaX': 0, 'deltaY': 120})
        time.sleep(.12); v = s.js(VEIL_JS); samples.append([v['scrolling'], v['opacity'], v['scrollY']])
    out['pendantDefilement'] = samples
    time.sleep(2.0); v = s.js(VEIL_JS); out['apresDefilement'] = [v['scrolling'], v['opacity'], v['scrollY']]
    s.record('scroll', out)
    return out


def part_motion(s):
    # Motion on: list -> desktop detail (veil moves from .app::before to #content-sheet::after) and back.
    SAMPLE = r'''(()=>{window.qaFrames=[];const app=document.getElementById('app'),sheet=document.getElementById('content-sheet'),t0=performance.now();
(function step(){const b=getComputedStyle(app,'::before'),a=getComputedStyle(sheet,'::after');
 qaFrames.push([Math.round(performance.now()-t0),b.display,b.opacity,a.display,a.opacity,getComputedStyle(sheet).transform,getComputedStyle(sheet).opacity]);
 if(performance.now()-t0<900)requestAnimationFrame(step)})();return true})()'''
    out = {}
    s.reduced(False)
    try:
        fresh(s, 'projects', essais=[ID], viewport=D, block_globe=True)
        s.js(SAMPLE); s.click('#content-list .cp-card-title-link'); time.sleep(1.3)
        frames = s.js('qaFrames')
        def summary(frames):
            bad = [f for f in frames if (f[1] == 'none' and f[3] == 'none') or (f[3] != 'none' and f[5] != 'none')]
            return {'frames': len(frames), 'hosts': sorted({(f[1] != 'none') * 1 + (f[3] != 'none') * 2 for f in frames}),
                    'framesWithoutVeilOrMisplaced': len(bad), 'firstBad': bad[:3], 'minOpacity': min(min(float(f[2]) if f[1] != 'none' else 1, float(f[4]) if f[3] != 'none' else 1) for f in frames)}
        out['versFiche'] = summary(frames); out['versFicheEtat'] = state(s)
        s.js(SAMPLE); s.js('(()=>{history.back();return true})()'); time.sleep(1.3)
        frames = s.js('qaFrames'); out['retourListe'] = summary(frames); out['retourListeEtat'] = state(s)
    finally:
        s.reduced(True)
    s.record('motion', out)
    return out


def part_runtime(s):
    out = {}
    fresh(s, 'projects', essais=[ID], viewport=M, block_globe=True)
    pick = lambda v: {x: v[x] for x in ('host', 'height', 'top', 'opacity', 'bg', 'image', 'theme', 'lang', 'dir')}
    out['start'] = pick(s.js(VEIL_JS))
    s.settings('ar', 'dark'); time.sleep(.8); out['arDark'] = pick(s.js(VEIL_JS)); s.shot('apres-runtime-ar-sombre-mobile')
    s.settings('en', 'light'); time.sleep(.8); out['enLight'] = pick(s.js(VEIL_JS))
    for k, v in out.items(): s.record('runtime-' + k, v)
    return out


def part_sidebar(s):
    out = {}
    for side, essais in (('avant', []), ('apres', [ID])):
        fresh(s, DETAIL, essais=essais, viewport=D, block_globe=True); time.sleep(.5)
        out[side] = {'veil': s.js(VEIL_JS), 'sidebar': s.js('(()=>{const e=[...document.querySelectorAll("[data-detail-scroll=sidebar]")].find(e=>!e.closest("[hidden]"));if(!e)return null;const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})()')}
        s.shot(f'{side}-fiche-ordinateur')
    v = out['apres']['veil']; sb = out['apres']['sidebar']
    if sb:
        out['pixelsSidebarInVeil'] = diff_box(SCRATCH / 'avant-fiche-ordinateur.png', SCRATCH / 'apres-fiche-ordinateur.png', 1, (sb[0], v['top'], sb[2], 900 - v['top']))
    out['pixelsAboveVeil'] = diff_box(SCRATCH / 'avant-fiche-ordinateur.png', SCRATCH / 'apres-fiche-ordinateur.png', 1, (0, 0, 1440, v['top']))
    out['pixelsAll'] = diff_box(SCRATCH / 'avant-fiche-ordinateur.png', SCRATCH / 'apres-fiche-ordinateur.png', 1)
    s.record('sidebar', {k: out[k] for k in out if k.startswith('pixels')} | {'host': v['host'], 'sidebar': sb, 'veilTop': v['top']})
    return out


def part_pages(s, kind, cases, globe=False):
    out = {}
    for vue, route, vp in cases:
        for side, essais in (('avant', []), ('apres', [ID])):
            fresh(s, route, essais=essais, viewport=vp, block_globe=not globe)
            if globe: out[f'{vue}-{side}-ready'] = s.globe_ready(); time.sleep(2.5); s.away(); s.blur(); time.sleep(.5)
            out[f'{vue}-{side}-veil'] = {k: s.js(VEIL_JS)[k] for k in ('host', 'opacity', 'visibility')}
            s.shot(f'{side}-{kind}-{vue}')
        out[f'{vue}-pixels'] = diff_box(SCRATCH / f'avant-{kind}-{vue}.png', SCRATCH / f'apres-{kind}-{vue}.png', 2 if vp[2] else 1)
    s.record(kind, out)
    return out


def part_combined(s):
    out = {}
    for vue, vp in (('mobile', M), ('petit', S)):
        fresh(s, 'projects', essais=['recherche-repliee', ID], viewport=vp, block_globe=True)
        v = s.js(VEIL_JS)
        out[vue] = {'active': s.js('window.horizonEssais.active'), 'toggle': v['toggle'], 'veilTop': v['top'], 'rampAboveMagnifier': round(v['toggle']['y'] - v['top'], 1), 'opacity': v['opacity']}
        s.shot(f'apres-combine-{vue}')
    s.record('combined', out)
    return out


def part_extra(s):
    # Reduced motion removes the veil transition; desktop detail: keyboard focus in the reading pane
    # sets the veil aside, focus in the pinned sidebar keeps it.
    out = {}
    tr = '(()=>{const a=getComputedStyle(document.getElementById("app"),"::before");return [a.transitionProperty,a.transitionDuration]})()'
    fresh(s, 'projects', essais=[ID], viewport=M, block_globe=True)
    out['reduced'] = s.js(tr)
    s.reduced(False); time.sleep(.3); out['motion'] = s.js(tr); s.reduced(True)
    fresh(s, DETAIL, essais=[ID], viewport=D, block_globe=True)
    out['zones'] = s.js('[...document.querySelectorAll("#project-detail [data-detail-scroll]")].map(e=>e.dataset.detailScroll+":"+String(e.className).slice(0,40))')
    s.js('(()=>{const r=document.querySelector("#project-detail .cp-project-reading-pane");const f=[...r.querySelectorAll("a,button,summary")].filter(e=>e.checkVisibility());f[0].focus();return true})()')
    press(s, 'Tab', 9); time.sleep(.5)
    out['lecture'] = state(s) | {'inReading': s.js('Boolean(document.activeElement.closest(".cp-project-reading-pane"))'), 'inSidebar': s.js('Boolean(document.activeElement.closest("[data-detail-scroll=sidebar]"))')}
    s.js('(()=>{document.querySelector("[data-detail-scroll=menu] a").focus();return true})()')
    press(s, 'Tab', 9); time.sleep(.5)
    out['menuLateral'] = state(s) | {'inSidebar': s.js('Boolean(document.activeElement.closest("[data-detail-scroll=sidebar]"))')}
    for k, v in out.items(): s.record('extra-' + k, v)
    return out


ZINDEX_JS = r'''(()=>{const out=[];const side=document.querySelector('[data-detail-scroll=sidebar]');
for(const e of document.querySelectorAll('#content-sheet *')){if(side&&side.contains(e))continue;if(e.closest('[hidden]'))continue;const st=getComputedStyle(e);
 if(st.position==='static'||st.zIndex==='auto')continue;const z=parseInt(st.zIndex,10);if(!(z>=2))continue;if(!e.checkVisibility())continue;
 out.push([e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.classList[0]?'.'+e.classList[0]:''),st.position,z,e.getAttribute('role')])}
return {host:(b=>b.display!=='none'?'content-sheet::after':'app::before')(getComputedStyle(document.getElementById('content-sheet'),'::after')),raised:out}})()'''


def part_zindex(s, routes):
    # Desktop details: anything raised above z-index 1 inside the sheet would paint over #content-sheet::after.
    out = {}
    for route in routes:
        fresh(s, route, essais=[ID], viewport=D, block_globe=True); out[route] = s.js(ZINDEX_JS)
    s.record('zindex', out)
    return out


TOOLBAR_JS = r'''(()=>{const t=document.querySelector('#profile-detail .cp-profile-project-toolbar');if(!t)return null;const v=getComputedStyle(document.getElementById('content-sheet'),'::after');
const r=t.getBoundingClientRect();return {docTop:+(r.top+scrollY).toFixed(1),docBottom:+(r.bottom+scrollY).toFixed(1),zIndex:getComputedStyle(t).zIndex,veilTop:innerHeight-(parseFloat(v.height)||0),host:v.display}})()'''


def part_toolbar(s):
    # The only element raised above the in-sheet veil (z-index 4): it must stay above the veil band at
    # scroll 0, so that scrolling (which only moves content up) can never bring it into the band.
    out = {}
    for vp in ((1440, 900, False), (1280, 720, False), (1024, 600, False), (841, 520, False)):
        fresh(s, 'people/profile-leila-mansour?tab=projects', essais=[ID], viewport=vp, block_globe=True)
        out[f'{vp[0]}x{vp[1]}'] = s.js(TOOLBAR_JS)
    s.record('toolbar', out)
    return out


def summary(d):
    c = {}
    c['coverage'] = all(r['coveredShare'] >= .85 and r['hiddenShare'] >= .85 and r['effectiveOpacity'] >= .85 and r['veil']['opacity'] == '1' and r['veil']['pointerEvents'] == 'none' and abs(r['rampAboveCapsule'] - 24) < .6
                        for r in d['coverage'] + d['coverage2'])
    ends = d['ends'] + d['ends2'] + d['ends3']
    c['ends'] = all(e['margin'] >= 0 and e['sameLayout'] and e['hitsIdentical'] and e['apresVeilAtEnd'] == '1' for e in ends)
    c['onlyVeilBandChanges'] = all(e['pixelsAboveVeil']['pixels'] == 0 for e in ends if 'pixelsAboveVeil' in e) and d['sidebar']['pixelsAboveVeil']['pixels'] == 0
    c['sidebarUnchanged'] = d['sidebar']['pixelsSidebarInVeil']['maxDelta'] <= 6
    f = d['focus']
    c['pointerNavigationKeepsVeil'] = all(f[k]['opacity'] == '1' and not (f[k]['focus'] or {}).get('visible') for k in ('sourisDockChroniques', 'sourisCarteVersArticle', 'retourHistorique', 'toucherDockProfils'))
    c['keyboardFocusNeverHidden'] = not f['tab']['hiddenUnderOpaqueVeil'] and f['tab']['afterBlur'] == '1' and f['clavierDockChroniques']['opacity'] == '0' and d['extra']['lecture']['opacity'] == '0' and d['extra']['menuLateral']['opacity'] == '1'
    m = d['menus']
    c['menus'] = m['triOuvert']['opacity'] == '0' and m['triFermeSansFocus']['opacity'] == '1' and m['sectionsOuvert']['opacity'] == '0' and m['sectionsFerme']['opacity'] == '1'
    sc = d['scroll']
    c['scrollFollowsDock'] = all(x[0] == 'true' and x[1] == '0' for x in sc['pendantDefilement']) and sc['apresDefilement'][1] == '1'
    c['motion'] = d['motion']['versFiche']['framesWithoutVeilOrMisplaced'] == 0 and d['motion']['retourListe']['framesWithoutVeilOrMisplaced'] == 0
    c['reducedMotion'] = d['extra']['reduced'][1] == '0s'
    rt = d['runtime']
    c['runtime'] = rt['arDark']['bg'] != rt['start']['bg'] and rt['arDark']['height'] == rt['start']['height'] and rt['arDark']['opacity'] == '1' and rt['enLight']['bg'] == rt['start']['bg']
    c['explorerAwards'] = all(v['pixels'] == 0 for part in ('explorer', 'globe', 'awards') for k, v in d[part].items() if k.endswith('pixels')) and d['globe']['ordinateur-avant-ready'] and d['globe']['ordinateur-apres-ready']
    c['combined'] = all(v['toggle']['w'] == 44 and abs(v['rampAboveMagnifier'] - 24) < .6 and v['opacity'] == '1' for v in d['combined'].values())
    c['raisedInSheet'] = all(not v['raised'] or all(r[0] == 'div.cp-profile-project-toolbar' for r in v['raised']) for part in ('zindex', 'zindex2', 'zindex3') for v in d[part].values()) and all(v['docBottom'] < v['veilTop'] for v in d['toolbar'].values())
    c['noErrors'] = not any(d['errors'].values())
    d['criteres'] = c
    return all(c.values())


PARTS = {
    'toolbar': part_toolbar,
    'zindex': lambda s: part_zindex(s, ('projects/ft-transcendence-building-together?tab=overview', 'projects/ft-transcendence-building-together?tab=implementation', 'projects/ft-transcendence-building-together?tab=media', 'projects/ft-transcendence-building-together?tab=test', COMMENTS)),
    'zindex2': lambda s: part_zindex(s, (ARTICLE, 'journal/journal-an-evening-debugging?tab=media', 'journal/journal-an-evening-debugging?tab=authors', 'journal/journal-an-evening-debugging?tab=comments')),
    'zindex3': lambda s: part_zindex(s, (PROFILE, 'people/profile-leila-mansour?tab=projects', 'people/profile-leila-mansour?tab=path', 'people/profile-leila-mansour?tab=contribution')),
    'extra': part_extra,
    'coverage': lambda s: part_coverage(s, (('ordinateur', 'projects', 'light', 'fr', D), ('sombre-mobile', 'journal', 'dark', 'fr', M), ('petit', 'projects', 'light', 'fr', S))),
    'coverage2': lambda s: part_coverage(s, (('ar-sombre-mobile', 'people', 'dark', 'ar', M), ('paysage', 'projects', 'light', 'fr', L), ('fiche-ordinateur', DETAIL, 'light', 'fr', D))),
    'ends': lambda s: part_ends(s, (('ordinateur', 'projects', D), ('mobile', 'projects', M))),
    'ends2': lambda s: part_ends(s, (('petit', 'projects', S), ('commentaires-petit', COMMENTS, S))),
    'ends3': lambda s: part_ends(s, (('article-mobile', ARTICLE, M), ('profil-petit', PROFILE, S))),
    'focus': part_focus, 'menus': part_menus, 'scroll': part_scroll, 'motion': part_motion, 'runtime': part_runtime, 'sidebar': part_sidebar,
    'explorer': lambda s: part_pages(s, 'explorer', (('ordinateur', 'explore', D), ('mobile', 'explore', M))),
    'globe': lambda s: part_pages(s, 'explorer-globe', (('ordinateur', 'explore', D),), globe=True),
    'awards': lambda s: part_pages(s, 'awards', (('ordinateur', 'awards', D), ('mobile', 'awards', M))),
    'combined': part_combined,
}

if __name__ == '__main__':
    SCRATCH.mkdir(parents=True, exist_ok=True)
    data = json.loads(OUT.read_text()) if OUT.exists() else {'id': ID, 'errors': {}}
    for name in sys.argv[1:] or list(PARTS):
        for attempt in (1, 2):
            s = Session(SCRATCH)
            try:
                data[name] = PARTS[name](s); data['errors'][name] = s.errors(); break
            except (RuntimeError, TimeoutError, BrokenPipeError, OSError) as error:
                print(f'part {name} attempt {attempt} failed: {error}', flush=True)
                if attempt == 2: data['errors'][name] = [f'failed: {error}']
            finally:
                s.close()
        OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
    if all(k in data for k in PARTS):
        data['passed'] = summary(data); OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
        print('passed', data['passed'], data['criteres'])
