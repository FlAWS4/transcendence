"""Trial voile-pile-basse, adversarial verification (resumed run, 14 Oct 2026). Every state is a
fresh page load (about:blank first: the helper does not reload a URL that differs only by its hash).
Coverage behind the capsule and the die at rest, page ends, hit tests, keyboard focus (the veil steps
aside while keyboard focus is in the page), runtime language and theme, Explorer unchanged (DOM,
pixels, real globe) and the combination with recherche-repliee.
Writes results-verification.json next to results.json.
Run: python3 -I studies/design-review-studies/checks/voile-pile-basse/check-verification.py"""
import json, re, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, image_diff

ID = 'voile-pile-basse'
OUT = HERE / 'results-verification.json'
COMMENTS = 'projects/ft-transcendence-building-together?tab=comments'
DETAIL = 'projects/ft-transcendence-building-together?tab=overview'
HIDE = '(()=>{let s=document.getElementById("qa-hide");if(!s){s=document.createElement("style");s.id="qa-hide";document.head.append(s)}s.textContent=%s;return true})()'
CONTROLS = json.dumps('.dock-shell,.dock-shell *,.back-to-top{visibility:hidden!important}')
CONTROLS_AND_VEIL = json.dumps('.dock-shell,.dock-shell *,.back-to-top{visibility:hidden!important}#app::before,#content-sheet::after{display:none!important}')
VEIL_JS = '''(()=>{const app=document.getElementById('app'),b=getComputedStyle(app,'::before'),a=getComputedStyle(document.getElementById('content-sheet'),'::after');
const host=b.display!=='none'&&b.content!=='none'?'app::before':(a.display!=='none'&&a.content!=='none'?'content-sheet::after':null),v=host==='content-sheet::after'?a:b,h=host?parseFloat(v.height)||0:0;
const box=s=>{const e=document.querySelector(s);if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};
const probe=document.createElement('i');probe.style.color='var(--h42-color-bg)';document.body.append(probe);const bg=getComputedStyle(probe).color;probe.remove();
return {host,height:h,top:innerHeight-h,opacity:host?v.opacity:null,visibility:host?v.visibility:null,pointerEvents:host?v.pointerEvents:null,image:host?v.backgroundImage.slice(0,60):null,bg,
 theme:document.documentElement.dataset.theme,lang:document.documentElement.lang,dir:document.documentElement.dir,section:app.dataset.section,
 toggle:box('.dock-search-toggle'),die:box('.dock-random-toggle'),dock:box('#main-nav'),scrollY:Math.round(scrollY)}})()'''
# Scroll so that a picture (or else a text block) of the page sits right behind the capsule and the die.
TARGET_JS = '''(()=>{const t=document.querySelector(".dock-search-toggle").getBoundingClientRect(),d=document.querySelector(".dock-random-toggle").getBoundingClientRect();
const left=Math.min(t.left,d.left),right=Math.max(t.right,d.right);
const ok=e=>{if(e.closest("[hidden],[data-detail-scroll=sidebar],.cp-author-fit-probe")||!e.checkVisibility())return false;const r=e.getBoundingClientRect();return r.width&&r.height>=t.height&&r.left<right&&r.right>left&&r.top+scrollY>t.top};
const pick=[...document.querySelectorAll("#content-sheet .cp-cover,#content-sheet img")].find(ok)||[...document.querySelectorAll("#content-sheet p,#content-sheet h2,#content-sheet h3")].find(e=>{const r=e.getBoundingClientRect();return !e.closest("[hidden],[data-detail-scroll=sidebar]")&&e.checkVisibility()&&r.left<right&&r.right>left&&r.top+scrollY>t.top});
if(!pick)return null;const r=pick.getBoundingClientRect();return {scroll:Math.round(r.top+scrollY-t.top+2),cls:String(pick.className).slice(0,30),tag:pick.tagName.toLowerCase()}})()'''
LAST_JS = '''(()=>{const sheet=document.getElementById('content-sheet');let best=null;
for(const e of sheet.querySelectorAll('a,button,input,textarea,select,p,h1,h2,h3,li,img,time,label,nav')){if(e.closest('[hidden],[data-detail-scroll=sidebar],.cp-author-fit-probe')||!e.checkVisibility())continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
 const st=getComputedStyle(e);if(st.visibility==='hidden'||st.position==='fixed')continue;if(!best||r.bottom>best.bottom)best={bottom:+r.bottom.toFixed(1),tag:e.tagName.toLowerCase(),text:(e.textContent||'').trim().slice(0,40)}}
return {best,scrollY:Math.round(scrollY),maxScroll:document.documentElement.scrollHeight-innerHeight}})()'''
GRID_JS = '''(top=>{const stack=['.dock-search-toggle','.dock-random-toggle','#main-nav','.back-to-top'].map(s=>document.querySelector(s)).filter(e=>e&&e.getClientRects().length).map(e=>e.getBoundingClientRect());
const inStack=(x,y)=>stack.some(r=>x>=r.left-4&&x<=r.right+4&&y>=r.top-4&&y<=r.bottom+4);const name=e=>e?e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.classList&&e.classList[0]?'.'+e.classList[0]:''):null;
const sheet=document.getElementById('content-sheet').getBoundingClientRect();
const out=[];for(const y of [top-3,top+8,top+60])for(let i=0;i<10;i++){const x=8+i*(innerWidth-16)/9;if(inStack(x,y))continue;const h=document.elementFromPoint(x,y);out.push([Math.round(x),Math.round(y),name(h),Boolean(h&&h.closest('#content-sheet')),x>=sheet.left&&x<=sheet.right])}
return out})(%s)'''
FOCUS_JS = '''(()=>{const e=document.activeElement,r=e.getBoundingClientRect(),app=document.getElementById('app'),v=getComputedStyle(app,'::before'),h=parseFloat(v.height)||0,top=innerHeight-h;
return {el:e.tagName.toLowerCase()+(e.classList[0]?'.'+e.classList[0]:''),text:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,24),top:Math.round(r.top),bottom:Math.round(r.bottom),
 scrollY:Math.round(scrollY),veilTop:Math.round(top),veilOpacity:v.opacity,focusVisible:e.matches(':focus-visible'),inSheet:Boolean(e.closest('#content-sheet')),
 visibleAboveVeil:Math.max(0,Math.round(Math.min(r.bottom,top)-Math.max(r.top,0))),inViewport:r.bottom>0&&r.top<innerHeight}})()'''


def fresh(s, route, **kw):
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.4)
    s.open(route, **kw)


def rgb(value):
    return tuple(int(round(float(n))) for n in re.findall(r'[\d.]+', value)[:3])


def exact(a, b):
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(a).convert('RGB')); y = np.asarray(Image.open(b).convert('RGB'))
    return bool(x.shape == y.shape and (x == y).all())


def coverage(with_veil, without_veil, rects, bg, scale):
    """Inside rects: content pixels (frame without veil differs from the page background by > 30 on a
    channel), share of them that read as the background with the veil (RGB sum within 24), and the
    effective veil opacity alpha = 1 - (A - bg) / (B - bg) on the most contrasted channel."""
    from PIL import Image
    import numpy as np
    A0 = np.asarray(Image.open(with_veil).convert('RGB'), dtype=float); B0 = np.asarray(Image.open(without_veil).convert('RGB'), dtype=float)
    bgv = np.array(bg, dtype=float); content = hidden = 0; alphas = []
    for r in rects:
        y0, y1, x0, x1 = (int(round(v * scale)) for v in (r['y'], r['y'] + r['h'], r['x'], r['x'] + r['w']))
        A, B = A0[y0:y1, x0:x1], B0[y0:y1, x0:x1]
        dB, dA = B - bgv, A - bgv
        ch = np.abs(dB).argmax(axis=2)
        db = np.take_along_axis(dB, ch[..., None], axis=2)[..., 0]; da = np.take_along_axis(dA, ch[..., None], axis=2)[..., 0]
        mask = np.abs(db) > 30
        content += int(mask.sum()); hidden += int(((np.abs(dA).sum(axis=2) <= 24) & mask).sum())
        if mask.any(): alphas.append(np.clip(1 - da[mask] / db[mask], 0, 1))
    return {'contentPixels': content, 'hiddenShare': round(hidden / content, 4) if content else None,
            'effectiveCoverage': round(float(np.concatenate(alphas).mean()), 4) if alphas else None}


def tab_walk(s, steps=22):
    s.js('(()=>{scrollTo(0,0);document.querySelector("#content-list a").focus();return true})()'); time.sleep(.6)
    rows = []
    for step in range(1, steps + 1):
        s.key('Tab'); time.sleep(.7)
        row = s.js(FOCUS_JS); row['step'] = step
        if not row['inSheet']: break
        rows.append(row)
    return rows


def part_coverage(s):
    # Coverage at rest, with page content scrolled right behind the capsule and the die.
    out = []
    for vue, route, theme, vp in (('ordinateur', 'projects', 'light', D), ('sombre-mobile', 'journal', 'dark', M), ('petit', 'projects', 'light', S)):
        fresh(s, route, essais=[ID], theme=theme, viewport=vp, block_globe=True)
        target = s.js(TARGET_JS)
        if target: s.scroll(max(0, target['scroll']))
        time.sleep(1.0); v = s.js(VEIL_JS)
        s.js(HIDE % CONTROLS); time.sleep(.3); s.shot(f'mesure-verif-voile-{vue}')
        s.js(HIDE % CONTROLS_AND_VEIL); time.sleep(.3); s.shot(f'mesure-verif-sans-voile-{vue}')
        s.js(HIDE % json.dumps(''))
        cov = coverage(HERE / f'mesure-verif-voile-{vue}.png', HERE / f'mesure-verif-sans-voile-{vue}.png', [v['toggle'], v['die']], rgb(v['bg']), 2 if vp[2] else 1)
        row = {'vue': vue, 'route': route, 'theme': theme, 'viewport': list(vp[:2]), 'target': target, 'scrollY': v['scrollY'], 'veil': {k: v[k] for k in ('host', 'height', 'top', 'opacity', 'pointerEvents', 'bg')},
               'capsuleTop': v['toggle']['y'], 'rampAboveCapsule': round(v['toggle']['y'] - v['top'], 1), **cov}
        out.append(row); s.record('coverage-' + vue, row)
    return out


ENDS = (('ordinateur', 'projects', D), ('mobile', 'projects', M), ('petit', 'projects', S), ('commentaires-petit', COMMENTS, S))


def part_ends(s, cases=ENDS):
    # Page ends (trial and baseline, same layout) and hit tests at rest.
    out = []
    for vue, route, vp in cases:
        case = {'vue': vue, 'route': route, 'viewport': list(vp[:2])}
        for side, essais in (('apres', [ID]), ('avant', [])):
            fresh(s, route, essais=essais, viewport=vp, block_globe=True)
            if side == 'apres': case['veil'] = s.js(VEIL_JS)
            case['grid' + side.capitalize()] = s.js(GRID_JS % case['veil']['top'])
            s.scroll(10 ** 6); time.sleep(.6); case[side] = s.js(LAST_JS)
        case['sameLayout'] = case['avant'] == case['apres']
        case['margin'] = round(case['veil']['top'] - case['apres']['best']['bottom'], 1)
        case['hitsIdentical'] = case['gridAvant'] == case['gridApres']
        case['hitsAboveVeilOnContent'] = all(p[3] for p in case['gridApres'] if p[1] < case['veil']['top'] and p[4])
        case['points'] = len(case['gridApres'])
        out.append(case); s.record('end-' + vue, {k: case[k] for k in ('sameLayout', 'margin', 'hitsIdentical', 'hitsAboveVeilOnContent', 'points')} | {'last': case['apres']['best']['text']})
    return out


def part_keyboard(s):
    # Tab through the list: a focused element must never rest under an opaque veil.
    out = {}
    for vue, vp in (('mobile', M), ('petit', S), ('ordinateur', D)):
        fresh(s, 'projects', essais=[ID], viewport=vp, block_globe=True)
        rows = tab_walk(s)
        s.blur(); time.sleep(.6); rest = s.js(VEIL_JS)['opacity']
        out[vue] = {'steps': len(rows), 'focusVisibleSteps': sum(1 for x in rows if x['focusVisible']),
                    'wouldBeHidden': [x for x in rows if x['visibleAboveVeil'] == 0 and x['inViewport']],
                    'hiddenUnderOpaqueVeil': [x for x in rows if x['visibleAboveVeil'] == 0 and x['inViewport'] and x['veilOpacity'] != '0'],
                    'veilOpacities': sorted({x['veilOpacity'] for x in rows}), 'veilAfterBlur': rest}
        s.record('keyboard-' + vue, {k: (len(v) if isinstance(v, list) else v) for k, v in out[vue].items()})
    # Side-by-side capture at the first focus position inside the veiled band (mobile): same Tab count.
    hidden = out['mobile']['wouldBeHidden']
    if hidden:
        for side, essais in (('apres', [ID]), ('avant', [])):
            fresh(s, 'projects', essais=essais, viewport=M, block_globe=True)
            rows = tab_walk(s, steps=hidden[0]['step']); s.shot(f'{side}-focus-clavier-mobile')
            out[side + 'FocusCapture'] = rows[-1] if rows else None
        s.record('focus-capture', {k: out.get(k) for k in ('apresFocusCapture', 'avantFocusCapture')})
    return out


def part_focus_cases(s):
    # Mouse: a click on a page button keeps the veil (no :focus-visible); a text field typed in removes it.
    out = {}
    fresh(s, 'projects', essais=[ID], viewport=M, block_globe=True)
    s.click('#content-list .cp-favorite'); time.sleep(.6)
    out['mouseClick'] = {'focusVisible': s.js('document.activeElement.matches(":focus-visible")'), 'veil': s.js(VEIL_JS)['opacity']}
    fresh(s, COMMENTS, essais=[ID], viewport=M, block_globe=True)
    field = s.js('(()=>{const e=document.querySelector("#content-sheet textarea");return e?e.id||e.className:null})()')
    if field:
        s.click('#content-sheet textarea'); time.sleep(.6)
        out['textField'] = {'field': field, 'focusVisible': s.js('document.activeElement.matches(":focus-visible")'), 'veil': s.js(VEIL_JS)['opacity']}
        s.blur(); time.sleep(.6); out['textField']['afterBlur'] = s.js(VEIL_JS)['opacity']
    # Keyboard focus in the dock keeps the veil; so does focus in the pinned desktop sidebar.
    fresh(s, 'projects', essais=[ID], viewport=M, block_globe=True)
    s.js('(()=>{document.querySelector(".dock-search-toggle").focus();return true})()'); s.key('Tab')
    out['dockFocus'] = {'focus': s.js('document.activeElement.className'), 'focusVisible': s.js('document.activeElement.matches(":focus-visible")'), 'veil': s.js(VEIL_JS)['opacity']}
    fresh(s, DETAIL, essais=[ID], viewport=D, block_globe=True)
    s.js('(()=>{document.querySelector("[data-detail-scroll=menu] a").focus();return true})()'); s.key('Tab'); time.sleep(.5)
    out['sidebarFocus'] = {'focus': s.js('document.activeElement.textContent.trim().slice(0,30)'), 'inSidebar': s.js('Boolean(document.activeElement.closest("[data-detail-scroll=sidebar]"))'),
                           'focusVisible': s.js('document.activeElement.matches(":focus-visible")'), 'veil': s.js(VEIL_JS)}
    for k in ('mouseClick', 'textField', 'dockFocus'): s.record(k, out.get(k))
    s.record('sidebarFocus', {k: (v['opacity'], v['host']) if isinstance(v, dict) else v for k, v in out['sidebarFocus'].items()})
    return out


def part_runtime(s):
    # Language and theme from the account menu, without reloading; then the combination with recherche-repliee.
    out = {}
    fresh(s, 'projects', essais=[ID], viewport=M, block_globe=True)
    out['start'] = s.js(VEIL_JS)
    s.settings('ar', 'dark'); time.sleep(.6); out['arDark'] = s.js(VEIL_JS)
    s.settings('en', 'light'); time.sleep(.6); out['enLight'] = s.js(VEIL_JS)
    for k, v in out.items(): s.record('runtime-' + k, {x: v[x] for x in ('host', 'height', 'top', 'opacity', 'bg', 'theme', 'lang', 'dir')})
    fresh(s, 'projects', essais=['recherche-repliee', ID], viewport=M, block_globe=True)
    v = s.js(VEIL_JS); out['combined'] = {'active': s.js('window.horizonEssais.active'), 'toggle': v['toggle'], 'veilTop': v['top'], 'rampAboveMagnifier': round(v['toggle']['y'] - v['top'], 1), 'opacity': v['opacity']}
    s.record('combined', out['combined'])
    return out


def part_explorer(s):
    out = {}
    for vue, vp in (('ordinateur', D), ('mobile', M)):
        pair = {}
        for side, essais in (('avant', []), ('apres', [ID])):
            fresh(s, 'explore', essais=essais, viewport=vp, block_globe=True)
            v = s.js(VEIL_JS); pair[side] = {'host': v['host'], 'opacity': v['opacity'], 'visibility': v['visibility']}
            s.shot(f'{side}-verif-explorer-{vue}-sans-globe')
        pair['identicalPixels'] = exact(HERE / f'avant-verif-explorer-{vue}-sans-globe.png', HERE / f'apres-verif-explorer-{vue}-sans-globe.png')
        out[vue] = pair; s.record('explorer-' + vue, pair)
    return out


def part_globe(s):
    out = {}
    for side, essais in (('avant', []), ('apres', [ID])):
        fresh(s, 'explore', essais=essais, viewport=D, block_globe=False, settle=3)
        out[side + 'Ready'] = s.globe_ready(5); s.shot(f'{side}-verif-explorer-globe')
    out['identicalPixels'] = exact(HERE / 'avant-verif-explorer-globe.png', HERE / 'apres-verif-explorer-globe.png')
    out['pixelShare'] = image_diff(HERE / 'avant-verif-explorer-globe.png', HERE / 'apres-verif-explorer-globe.png')
    s.record('explorer-globe', out)
    return out


# One short Chrome session per part (memory is shared with other checks); each part is retried once
# if its Chrome is stopped, and completed parts are kept in the partial file across runs.
PARTIAL = HERE / 'results-verification.partial.json'
r = json.loads(PARTIAL.read_text()) if PARTIAL.exists() else {'id': ID, 'errors': {}}
PARTS = [('coverage', part_coverage)] + [('ends-' + c[0], lambda s, c=c: part_ends(s, (c,))) for c in ENDS] + [
    ('keyboard', part_keyboard), ('focusCases', part_focus_cases), ('runtime', part_runtime), ('explorer', part_explorer), ('globe', part_globe)]
for name, fn in PARTS:
    if name in r: continue
    for attempt in (1, 2):
        s = Session(HERE)
        try:
            r[name] = fn(s); r['errors'][name] = s.errors(); break
        except (RuntimeError, TimeoutError, BrokenPipeError, OSError) as error:
            print(f'part {name} attempt {attempt} failed: {error}', flush=True)
            if attempt == 2: raise
        finally:
            s.close()
    PARTIAL.write_text(json.dumps(r, ensure_ascii=False, indent=1) + '\n')
r['ends'] = [case for c in ENDS for case in r.pop('ends-' + c[0])]
r['explorer']['globe'] = r.pop('globe')
r['keyboard'].update(r.pop('focusCases'))
r['combined'] = r['runtime'].pop('combined')

kb, rt = r['keyboard'], r['runtime']
r['passed'] = bool(
    all(c['contentPixels'] > 0 and c['effectiveCoverage'] >= .85 and c['hiddenShare'] >= .85 and c['veil']['pointerEvents'] == 'none' and c['veil']['opacity'] == '1' for c in r['coverage'])
    and all(c['sameLayout'] and c['margin'] >= 0 and c['hitsIdentical'] and c['hitsAboveVeilOnContent'] and c['points'] > 0 for c in r['ends'])
    and all(not kb[v]['hiddenUnderOpaqueVeil'] and kb[v]['veilAfterBlur'] == '1' for v in ('mobile', 'petit', 'ordinateur'))
    and kb['mouseClick']['veil'] == '1' and kb['dockFocus']['veil'] == '1' and (not kb['sidebarFocus']['inSidebar'] or kb['sidebarFocus']['veil']['opacity'] == '1')
    and (not kb.get('textField') or (kb['textField']['veil'] == '0' and kb['textField']['afterBlur'] == '1'))
    and rt['arDark']['bg'] != rt['start']['bg'] and rt['arDark']['opacity'] == '1' and rt['arDark']['height'] == rt['start']['height'] and rt['arDark']['dir'] == 'rtl' and rt['enLight']['bg'] == rt['start']['bg']
    and abs(r['combined']['rampAboveMagnifier'] - 24) < .6 and r['combined']['toggle']['w'] == 44
    and all(p['identicalPixels'] for p in r['explorer'].values())
    and not any(r['errors'].values()))
OUT.write_text(json.dumps(r, ensure_ascii=False, indent=1) + '\n')
PARTIAL.unlink(missing_ok=True)
print('passed', r['passed'], 'written', OUT)
