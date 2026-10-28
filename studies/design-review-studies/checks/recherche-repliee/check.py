"""Trial recherche-repliee: floating stack area, search behaviour, dock labels, Explorer unchanged.
Run: python3 -I studies/design-review-studies/checks/recherche-repliee/check.py"""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, image_diff

ID = 'recherche-repliee'
STACK_JS = '''(()=>{const box=s=>{const e=document.querySelector(s);if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}};
const t=document.querySelector('.dock-search-toggle'),l=t&&t.querySelector('.dock-search-toggle-label'),i=t&&t.querySelector('svg[data-essai]'),cs=t&&getComputedStyle(t);
const nav=[...document.querySelectorAll('#main-nav > button[data-section]')].map(b=>{const sp=b.querySelector('span'),r=b.getBoundingClientRect(),q=sp.getBoundingClientRect(),st=getComputedStyle(sp);
 return {section:b.dataset.section,text:sp.textContent,button:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],label:[Math.round(q.x),Math.round(q.y),Math.round(q.width),Math.round(q.height)],opacity:st.opacity,blockSize:st.blockSize}});
const die=document.querySelector('.dock-random-toggle');
return {vw:innerWidth,vh:innerHeight,lang:document.documentElement.lang,dir:document.documentElement.dir,section:document.getElementById('app').dataset.section,
 toggle:box('.dock-search-toggle'),die:box('.dock-random-toggle'),dock:box('#main-nav'),header:box('.header'),scope:box('.scope-bar'),
 toggleName:t&&t.getAttribute('aria-label'),toggleTitle:t&&t.title,labelDisplay:l&&getComputedStyle(l).display,iconDisplay:i?getComputedStyle(i).display:'absent',
 toggleColor:cs&&cs.color,dieColor:die&&getComputedStyle(die).color,toggleRadius:cs&&cs.borderRadius,toggleBorder:cs&&cs.borderTopColor,dieBorder:die&&getComputedStyle(die).borderTopColor,
 toggleBg:cs&&cs.backgroundColor,dieBg:die&&getComputedStyle(die).backgroundColor,dieName:die&&die.getAttribute('aria-label'),nav,
 overflow:document.documentElement.scrollWidth>innerWidth+1}})()'''


# Text line boxes of the page that sit under the floating capsule and die at rest.
TEXT_UNDER_JS = '''(()=>{const boxes=['.dock-search-toggle','.dock-random-toggle'].map(s=>document.querySelector(s)).filter(e=>e&&e.getClientRects().length).map(e=>e.getBoundingClientRect());
const sheet=document.getElementById('content-sheet');if(!sheet)return {area:0,lines:[]};const walk=document.createTreeWalker(sheet,NodeFilter.SHOW_TEXT);let area=0;const lines=[];
for(let n=walk.nextNode();n;n=walk.nextNode()){if(!n.textContent.trim())continue;const el=n.parentElement;if(!el||el.closest('[hidden],[aria-hidden=true]'))continue;const st=getComputedStyle(el);if(st.visibility==='hidden'||st.opacity==='0')continue;
 const range=document.createRange();range.selectNodeContents(n);for(const r of range.getClientRects()){for(const b of boxes){const w=Math.min(r.right,b.right)-Math.max(r.left,b.left),h=Math.min(r.bottom,b.bottom)-Math.max(r.top,b.top);
 if(w>0&&h>0){area+=w*h;lines.push(n.textContent.trim().slice(0,40))}}}}
return {area:Math.round(area),lines:[...new Set(lines)]}})()'''


def union_bbox(rects):
    rects = [r for r in rects if r]
    x0 = min(r['x'] for r in rects); y0 = min(r['y'] for r in rects)
    x1 = max(r['x'] + r['w'] for r in rects); y1 = max(r['y'] + r['h'] for r in rects)
    return {'x': round(x0, 1), 'y': round(y0, 1), 'w': round(x1 - x0, 1), 'h': round(y1 - y0, 1), 'area': round((x1 - x0) * (y1 - y0))}


def covered_area(rects, vw, vh):
    """Exact pixel area covered by the union of the rectangles (no double counting)."""
    import numpy as np
    grid = np.zeros((vh, vw), dtype=bool)
    for r in rects:
        if not r: continue
        grid[max(0, round(r['y'])):min(vh, round(r['y'] + r['h'])), max(0, round(r['x'])):min(vw, round(r['x'] + r['w']))] = True
    return int(grid.sum())


def stack_summary(g):
    floating = union_bbox([g['toggle'], g['die']])
    whole = union_bbox([g['toggle'], g['die'], g['dock']])
    area = covered_area([g['toggle'], g['die'], g['dock']], g['vw'], g['vh'])
    return {'floatingUnionBox': floating, 'stackUnionBox': whole, 'stackCoveredArea': area,
            'stackCoveredShare': round(area / (g['vw'] * g['vh']), 4)}


VIEWS = [  # vue, route, theme, lang, viewport
    ('ordinateur', 'projects', 'light', 'fr', D),
    ('mobile', 'projects', 'light', 'fr', M),
    ('petit', 'projects', 'light', 'fr', S),
    ('ar-sombre-mobile', 'projects', 'dark', 'ar', M),
    ('fiche-commentaires-ordinateur', 'projects/ft-transcendence-building-together?tab=comments', 'light', 'fr', D),
    ('fiche-ordinateur', 'projects/ft-transcendence-building-together?tab=overview', 'light', 'fr', D),
    ('fiche-mobile', 'projects/ft-transcendence-building-together?tab=overview', 'light', 'fr', M),
]
results = {'id': ID, 'views': [], 'search': [], 'names': [], 'explorer': {}, 'errors': {}, 'passed': False}


def interact(s, vue, essais):
    """Open the search from the (folded) toggle, type Paris, close with Escape."""
    out = {'vue': vue, 'essais': essais}
    s.click('.dock-search-toggle')
    s.wait('document.querySelector(".dock-shell")?.dataset.searchOpen==="true"', 5); time.sleep(.7)
    out['openedFocus'] = s.js('document.activeElement?.className||null')
    s.c.call('Input.insertText', {'text': 'Paris'})
    s.wait('document.querySelectorAll(".dock-search-result").length>0', 8); time.sleep(.8)
    out['results'] = s.js('document.querySelectorAll(".dock-search-result").length')
    out['status'] = s.js('document.querySelector(".dock-search-status")?.textContent||""')
    out['firstResult'] = s.js('document.querySelector(".dock-search-result-title")?.textContent||null')
    if essais: s.shot(f'apres-recherche-ouverte-{vue}')
    s.key('Escape'); time.sleep(.8)
    out['closed'] = s.js('document.querySelector(".dock-shell")?.dataset.searchOpen==="false"')
    out['focusBackOnToggle'] = s.js('document.activeElement===document.querySelector(".dock-search-toggle")')
    out['focusVisible'] = s.js('document.querySelector(".dock-search-toggle").matches(":focus-visible")')
    out['outline'] = s.js('(()=>{const c=getComputedStyle(document.querySelector(".dock-search-toggle"));return c.outlineStyle+" "+c.outlineWidth+" "+c.outlineColor})()')
    out['toggleAfterClose'] = s.js('(()=>{const r=document.querySelector(".dock-search-toggle").getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]})()')
    if essais: s.shot(f'apres-focus-retour-{vue}')
    else: s.shot(f'avant-focus-retour-{vue}')
    return out


s = Session(HERE)
try:
    for vue, route, theme, lang, vp in VIEWS:
        case = {'vue': vue, 'route': route, 'theme': theme, 'lang': lang, 'viewport': list(vp[:2])}
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)
            g = s.js(STACK_JS); shot = s.shot(f'{side}-{vue}')
            case[side] = {'geometry': g, **stack_summary(g), 'textUnderStack': s.js(TEXT_UNDER_JS), 'errors': s.errors()}
        a, b = case['avant'], case['apres']
        case['navLabelsUnchanged'] = a['geometry']['nav'] == b['geometry']['nav']
        case['dockUnchanged'] = a['geometry']['dock'] == b['geometry']['dock']
        case['floatingAreaBefore'] = a['floatingUnionBox']['area']; case['floatingAreaAfter'] = b['floatingUnionBox']['area']
        case['floatingAreaSaved'] = round(1 - b['floatingUnionBox']['area'] / a['floatingUnionBox']['area'], 3)
        case['textAreaUnderStackBefore'] = a['textUnderStack']['area']; case['textAreaUnderStackAfter'] = b['textUnderStack']['area']
        case['pixelShare'] = round(image_diff(HERE / f'avant-{vue}.png', HERE / f'apres-{vue}.png'), 5)
        results['views'].append(case); s.record(vue, {k: case[k] for k in ('floatingAreaBefore', 'floatingAreaAfter', 'floatingAreaSaved', 'textAreaUnderStackBefore', 'textAreaUnderStackAfter', 'navLabelsUnchanged', 'dockUnchanged', 'pixelShare')})
    # Search behaviour: baseline capsule and folded toggle, desktop and mobile.
    for vue, vp in (('ordinateur', D), ('mobile', M)):
        for essais in ([], [ID]):
            s.open('projects', essais=essais, viewport=vp, block_globe=True)
            r = interact(s, vue, essais); r['errors'] = s.errors(); results['search'].append(r); s.record('search-' + vue + ('-apres' if essais else '-avant'), r)
    # Localized accessible names and titles (FR and AR come from the views above).
    for lang in ('en',):
        s.open('people', essais=[ID], lang=lang, viewport=D, block_globe=True)
        g = s.js(STACK_JS); results['names'].append({'lang': lang, 'toggleName': g['toggleName'], 'toggleTitle': g['toggleTitle'], 'dieName': g['dieName'], 'section': g['section'], 'toggle': g['toggle'], 'die': g['die']})
    for case in results['views']:
        g = case['apres']['geometry']
        results['names'].append({'lang': g['lang'], 'vue': case['vue'], 'toggleName': g['toggleName'], 'toggleTitle': g['toggleTitle'], 'dir': g['dir'], 'toggle': g['toggle'], 'die': g['die']})
    results['errors']['content'] = s.errors()
finally:
    s.close()

# Explorer keeps the capsule: DOM geometry without the globe, then pixels with the real globe.
s = Session(HERE)
try:
    ex = {}
    for vue, vp in (('explorer-ordinateur', D), ('explorer-mobile', M)):
        pair = {}
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open('explore', essais=essais, viewport=vp, block_globe=True)
            g = s.js(STACK_JS); s.shot(f'{side}-{vue}-sans-globe')
            pair[side] = {k: g[k] for k in ('toggle', 'die', 'dock', 'labelDisplay', 'toggleColor', 'toggleName', 'nav')}
            pair[side + 'Icon'] = g['iconDisplay']  # 'absent' in the baseline, inserted but 'none' with the trial
        pair['identicalGeometry'] = pair['avant'] == pair['apres'] and pair['apresIcon'] in ('none', 'absent')
        pair['pixelShare'] = round(image_diff(HERE / f'avant-{vue}-sans-globe.png', HERE / f'apres-{vue}-sans-globe.png'), 6)
        ex[vue] = pair; s.record(vue, {'identicalGeometry': pair['identicalGeometry'], 'pixelShare': pair['pixelShare']})
    for side, essais in (('avant', []), ('apres', [ID])):
        s.open('explore', essais=essais, viewport=D, block_globe=False, settle=3)
        ex.setdefault('globe', {})[side + 'Ready'] = s.globe_ready(5)
        s.shot(f'{side}-explorer-globe')
    ex['globe']['pixelShare'] = round(image_diff(HERE / 'avant-explorer-globe.png', HERE / 'apres-explorer-globe.png'), 6)
    results['explorer'] = ex; results['errors']['explorer'] = s.errors()
    s.record('explorer-globe', ex['globe'])
finally:
    s.close()

v = {c['vue']: c for c in results['views']}
searches = [r for r in results['search'] if r['essais']]
results['passed'] = bool(
    all(c['apres']['floatingUnionBox']['area'] < c['avant']['floatingUnionBox']['area'] for c in results['views'])
    and all(c['navLabelsUnchanged'] and c['dockUnchanged'] for c in results['views'])
    and all(r['openedFocus'] and 'dock-search-input' in r['openedFocus'] and r['results'] > 0 and r['closed'] and r['focusBackOnToggle'] and r['focusVisible'] for r in searches)
    and all(min(c['apres']['geometry']['toggle']['w'], c['apres']['geometry']['toggle']['h']) >= 44 for c in results['views'])
    and results['explorer']['explorer-ordinateur']['identicalGeometry'] and results['explorer']['explorer-mobile']['identicalGeometry']
    and results['explorer']['explorer-ordinateur']['pixelShare'] == 0 and results['explorer']['explorer-mobile']['pixelShare'] == 0
    and results['explorer']['globe']['pixelShare'] <= 0.02
    and not any(c['apres']['errors'] for c in results['views']))
(HERE / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
print('passed', results['passed'])
