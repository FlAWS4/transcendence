"""Trial recherche-repliee, adversarial verification (resumed run, 14 Oct 2026). Every state is a
fresh page load (about:blank first: the helper does not reload a URL that differs only by its hash).
Floating row at 1440x900, 390x844 and 320x640; search from the magnifier (FR desktop, AR mobile);
runtime language and theme changes; Explorer unchanged (DOM, pixels, real globe); motion between
Projects and Explorer and during a language switch; the pinned desktop sidebar at 900 and 1024 px.
Writes results-verification.json next to results.json.
Run: python3 -I studies/design-review-studies/checks/recherche-repliee/check-verification.py"""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, image_diff

ID = 'recherche-repliee'
OUT = HERE / 'results-verification.json'
DETAIL = 'projects/ft-transcendence-building-together?tab=overview'
ROW_JS = '''(()=>{const box=e=>{if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}};
const t=document.querySelector('.dock-search-toggle'),d=document.querySelector('.dock-random-toggle'),l=t.querySelector('.dock-search-toggle-label'),ts=getComputedStyle(t),ds=getComputedStyle(d);
const nav=[...document.querySelectorAll('#main-nav > button[data-section]')].map(b=>{const sp=b.querySelector('span');return [b.dataset.section,sp.textContent,box(b),box(sp),getComputedStyle(sp).opacity]});
return {section:document.getElementById('app').dataset.section,lang:document.documentElement.lang,dir:document.documentElement.dir,theme:document.documentElement.dataset.theme,
 toggle:box(t),die:box(d),dock:box(document.getElementById('main-nav')),nav,name:t.getAttribute('aria-label'),title:t.title,labelDisplay:getComputedStyle(l).display,
 icons:t.querySelectorAll('svg[data-essai]').length,iconDisplay:(i=>i?getComputedStyle(i).display:'absent')(t.querySelector('svg[data-essai]')),
 diffFromDie:['color','backgroundColor','borderTopColor','borderTopWidth','boxShadow','backdropFilter','width','height'].filter(k=>ts[k]!==ds[k]),
 radius:ts.borderRadius,overflow:document.documentElement.scrollWidth>innerWidth+1}})()'''
SIDEBAR_JS = '''(()=>{const side=[...document.querySelectorAll('[data-detail-scroll=sidebar]')].find(e=>!e.closest('[hidden]')&&e.getClientRects().length);if(!side)return null;
const f=side.querySelector('.cp-detail-menu'),box=e=>{const r=e.getBoundingClientRect();return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1),right:+r.right.toFixed(1),bottom:+r.bottom.toFixed(1)}};
const t=box(document.querySelector('.dock-search-toggle')),d=box(document.querySelector('.dock-random-toggle')),m=f?box(f):null;
const hit=(a,b)=>a&&b&&a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y;
return {sidebar:box(side),menu:m,overflow:f?.dataset.overflow||null,density:side.dataset.detailDensity||null,toggle:t,die:d,menuHitsToggle:hit(m,t),menuHitsDie:hit(m,d)}})()'''
# Gap between the magnifier (or capsule) and the die, sampled every frame for 1.3 s; negative = overlap.
SAMPLE_JS = '''(()=>{window.qaSamples=[];const t=document.querySelector('.dock-search-toggle'),d=document.querySelector('.dock-random-toggle'),start=performance.now();
(function step(){const a=t.getBoundingClientRect(),b=d.getBoundingClientRect();const overlap=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
 const gap=a.right<=b.left?b.left-a.right:b.right<=a.left?a.left-b.right:-overlap;qaSamples.push({t:Math.round(performance.now()-start),w:+a.width.toFixed(1),gap:+gap.toFixed(1)});
 if(performance.now()-start<1300)requestAnimationFrame(step)})();return true})()'''


def exact(a, b):
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(a).convert('RGB')); y = np.asarray(Image.open(b).convert('RGB'))
    return bool(x.shape == y.shape and (x == y).all())


def fresh(s, route, **kw):
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.4)
    s.open(route, **kw)


def area(g):
    rs = [g['toggle'], g['die']]
    x0 = min(r['x'] for r in rs); x1 = max(r['x'] + r['w'] for r in rs); y0 = min(r['y'] for r in rs); y1 = max(r['y'] + r['h'] for r in rs)
    return round((x1 - x0) * (y1 - y0))


def search(s, lang, vp):
    fresh(s, 'projects', essais=[ID], lang=lang, viewport=vp, block_globe=True)
    s.click('.dock-search-toggle'); s.wait('document.querySelector(".dock-shell")?.dataset.searchOpen==="true"', 5); time.sleep(.7)
    out = {'lang': lang, 'viewport': list(vp[:2]), 'focusInField': s.js('document.activeElement?.classList.contains("dock-search-input")')}
    s.c.call('Input.insertText', {'text': 'Paris'}); s.wait('document.querySelectorAll(".dock-search-result").length>0', 8); time.sleep(.6)
    out['results'] = s.js('document.querySelectorAll(".dock-search-result").length'); out['status'] = s.js('document.querySelector(".dock-search-status")?.textContent||""')
    s.key('Escape'); time.sleep(.7)
    out['closed'] = s.js('document.querySelector(".dock-shell").dataset.searchOpen==="false"')
    out['focusBack'] = s.js('document.activeElement===document.querySelector(".dock-search-toggle")')
    out['focusVisible'] = s.js('document.querySelector(".dock-search-toggle").matches(":focus-visible")')
    out['outline'] = s.js('(()=>{const c=getComputedStyle(document.querySelector(".dock-search-toggle"));return [c.outlineStyle,c.outlineWidth,c.outlineOffset]})()')
    out['folded'] = s.js('(()=>{const r=document.querySelector(".dock-search-toggle").getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]})()')
    return out


def part_rows(s):
    out = {}
    for vue, vp in (('ordinateur', D), ('mobile', M), ('petit', S)):
        pair = {}
        for side, essais in (('avant', []), ('apres', [ID])):
            fresh(s, 'projects', essais=essais, viewport=vp, block_globe=True)
            pair[side] = s.js(ROW_JS)
        pair['area'] = [area(pair['avant']), area(pair['apres'])]
        pair['navUnchanged'] = pair['avant']['nav'] == pair['apres']['nav'] and pair['avant']['dock'] == pair['apres']['dock']
        out[vue] = pair
        s.record(vue, {'area': pair['area'], 'toggle': pair['apres']['toggle'], 'die': pair['apres']['die'], 'navUnchanged': pair['navUnchanged'], 'diffFromDie': pair['apres']['diffFromDie']})
    return out


def part_search(s):
    out = []
    for lang, vp in (('fr', D), ('ar', M)):
        x = search(s, lang, vp); out.append(x); s.record('search-' + lang, x)
    return out


def part_runtime(s):
    # Language and theme from the account menu, then Explorer and back, without reloading.
    out = {}
    fresh(s, 'projects', essais=[ID], viewport=D, block_globe=True)
    s.settings('ar', 'dark'); out['arDark'] = s.js(ROW_JS)
    s.settings('en', 'light'); out['enLight'] = s.js(ROW_JS)
    s.js('(()=>{location.hash="#explore";return true})()'); time.sleep(1.4); s.away(); out['explore'] = s.js(ROW_JS)
    s.js('(()=>{location.hash="#journal";return true})()'); time.sleep(1.4); s.away(); out['journal'] = s.js(ROW_JS)
    for k, g in out.items(): s.record('runtime-' + k, {x: g[x] for x in ('section', 'lang', 'dir', 'theme', 'toggle', 'die', 'name', 'labelDisplay', 'icons', 'iconDisplay', 'diffFromDie')})
    return out


def part_sidebar(s):
    # The pinned desktop sidebar reads the toggle's rectangle (detail-scroll.mjs): narrower toggle, more menu room.
    out = {}
    for vue, vp in (('900x700', (900, 700, False)), ('1024x768', (1024, 768, False)), ('ordinateur', D)):
        pair = {}
        for side, essais in (('avant', []), ('apres', [ID])):
            fresh(s, DETAIL, essais=essais, viewport=vp, block_globe=True); time.sleep(.4)
            pair[side] = s.js(SIDEBAR_JS)
        out[vue] = pair; s.record('sidebar-' + vue, {k: (pair[k] or {}).get('menu') for k in ('avant', 'apres')} | {'hits': [(pair['apres'] or {}).get('menuHitsToggle'), (pair['apres'] or {}).get('menuHitsDie')]})
    return out


def part_explorer(s):
    out = {}
    for vue, vp in (('ordinateur', D), ('mobile', M)):
        pair = {}
        for side, essais in (('avant', []), ('apres', [ID])):
            fresh(s, 'explore', essais=essais, viewport=vp, block_globe=True)
            g = s.js(ROW_JS); pair[side] = {k: g[k] for k in ('toggle', 'die', 'nav', 'labelDisplay', 'name')}; pair[side + 'Icon'] = g['iconDisplay']
            s.shot(f'{side}-verif-explorer-{vue}-sans-globe')
        pair['sameDom'] = pair['avant'] == pair['apres']
        pair['pixelShare'] = image_diff(HERE / f'avant-verif-explorer-{vue}-sans-globe.png', HERE / f'apres-verif-explorer-{vue}-sans-globe.png')
        pair['identicalPixels'] = exact(HERE / f'avant-verif-explorer-{vue}-sans-globe.png', HERE / f'apres-verif-explorer-{vue}-sans-globe.png')
        out[vue] = pair; s.record('explorer-' + vue, {'sameDom': pair['sameDom'], 'icon': pair['apresIcon'], 'pixelShare': pair['pixelShare'], 'identical': pair['identicalPixels']})
    return out


def part_motion(s):
    # Reduced motion off: Projects -> Explorer -> Projects, and a language switch on Projects.
    s.reduced(False); out = {}
    for side, essais in (('avant', []), ('apres', [ID])):
        fresh(s, 'projects', essais=essais, viewport=D, block_globe=True); time.sleep(.6)
        m = {}
        for name, action in (('versExplorer', 'location.hash="#explore"'), ('versProjets', 'location.hash="#projects"'), ('versArabe', 'window.horizonStudy.setLocale("ar")')):
            s.js(SAMPLE_JS); s.js('(()=>{' + action + ';return true})()'); time.sleep(1.6)
            samples = s.js('window.qaSamples')
            m[name] = {'frames': len(samples), 'minGap': min(x['gap'] for x in samples), 'widths': [samples[0]['w'], samples[-1]['w']], 'overlapFrames': sum(1 for x in samples if x['gap'] < 0)}
        out[side] = m; s.record('motion-' + side, m)
    return out


def part_globe(s):
    out = {}
    for side, essais in (('avant', []), ('apres', [ID])):
        fresh(s, 'explore', essais=essais, viewport=D, block_globe=False, settle=3)
        out[side + 'Ready'] = s.globe_ready(5); s.shot(f'{side}-verif-explorer-globe')
    out['pixelShare'] = image_diff(HERE / 'avant-verif-explorer-globe.png', HERE / 'apres-verif-explorer-globe.png')
    out['identicalPixels'] = exact(HERE / 'avant-verif-explorer-globe.png', HERE / 'apres-verif-explorer-globe.png')
    s.record('explorer-globe', out)
    return out


# One short Chrome session per part (memory is shared with other checks); each part is retried once
# if its Chrome is stopped, and completed parts are kept in the partial file across runs.
PARTIAL = HERE / 'results-verification.partial.json'
r = json.loads(PARTIAL.read_text()) if PARTIAL.exists() else {'id': ID, 'errors': {}}
for name, fn in (('rows', part_rows), ('search', part_search), ('runtime', part_runtime), ('sidebar', part_sidebar),
                 ('explorer', part_explorer), ('motion', part_motion), ('globe', part_globe)):
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
r['explorer']['globe'] = r.pop('globe')

rows, rt = r['rows'], r['runtime']
folded = lambda g: g['toggle']['w'] == 44 and g['toggle']['h'] == 44 and g['icons'] == 1 and g['iconDisplay'] == 'block' and g['labelDisplay'] == 'none' and g['diffFromDie'] == []
r['passed'] = bool(
    all(p['area'] == [11088, 4224] and p['navUnchanged'] and folded(p['apres']) and not p['apres']['overflow'] for p in rows.values())
    and all(x['focusInField'] and x['results'] > 0 and x['closed'] and x['focusBack'] and x['focusVisible'] and x['folded'] == [44, 44] for x in r['search'])
    and folded(rt['arDark']) and rt['arDark']['dir'] == 'rtl' and rt['arDark']['toggle']['x'] > rt['arDark']['die']['x'] and folded(rt['enLight']) and folded(rt['journal'])
    and rt['explore']['toggle']['w'] == 200 and rt['explore']['iconDisplay'] == 'none' and rt['explore']['labelDisplay'] != 'none'
    and all(p['apres'] and not p['apres']['menuHitsToggle'] and not p['apres']['menuHitsDie'] for p in r['sidebar'].values())
    and all(p['sameDom'] and p['pixelShare'] == 0 and p['apresIcon'] == 'none' for k, p in r['explorer'].items() if k != 'globe')
    and r['explorer']['globe']['avantReady'] and r['explorer']['globe']['apresReady'] and r['explorer']['globe']['pixelShare'] == 0
    and r['motion']['apres']['versProjets']['minGap'] >= 7.5 and r['motion']['apres']['versExplorer']['minGap'] >= 7.5
    and not any(r['errors'].values()))
OUT.write_text(json.dumps(r, ensure_ascii=False, indent=1) + '\n')
PARTIAL.unlink(missing_ok=True)
print('passed', r['passed'], 'written', OUT)
