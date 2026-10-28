"""Trial recherche-repliee, second complement (resumed 14 Oct 2026): the dock labels in all four
width stages (1440, 390, 320 and 300 px wide, plus the 667 x 375 landscape phone), Awards (the
baseline hides the capsule there) and the open search compared with the baseline's own.
Writes results-etapes.json next to results.json.
Run: python3 -I studies/design-review-studies/checks/recherche-repliee/check-etapes.py"""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, L, image_diff

ID = 'recherche-repliee'
OUT = HERE / 'results-etapes.json'
TINY = (300, 640, True)  # main-nav content box below 280 px: fourth stage of responsive-dock.css
DOCK_JS = '''(()=>{const box=e=>{if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}};
const nav=document.getElementById('main-nav'),ns=getComputedStyle(nav),t=document.querySelector('.dock-search-toggle'),d=document.querySelector('.dock-random-toggle');
const navContent=nav.clientWidth-parseFloat(ns.paddingLeft)-parseFloat(ns.paddingRight);
const stage=navContent>560?1:navContent>340?2:navContent>280?3:4;
const buttons=[...nav.querySelectorAll(':scope > button[data-section]')].map(b=>{const sp=b.querySelector('span'),st=getComputedStyle(sp);
 return {section:b.dataset.section,current:b.hasAttribute('aria-current'),text:sp.textContent,button:box(b),label:box(sp),labelOpacity:st.opacity,labelBlockSize:st.blockSize,direction:getComputedStyle(b).flexDirection}});
return {vw:innerWidth,vh:innerHeight,section:document.getElementById('app').dataset.section,navContent:+navContent.toFixed(1),stage,buttons,indicator:box(nav.querySelector('.nav-indicator')),
 toggle:box(t),die:box(d),toggleDisplay:t?getComputedStyle(t).display:null,dieDisplay:d?getComputedStyle(d).display:null,overflow:document.documentElement.scrollWidth>innerWidth+1}})()'''


def union_area(*rects):
    rects = [r for r in rects if r]
    if not rects: return 0
    x0 = min(r['x'] for r in rects); y0 = min(r['y'] for r in rects)
    return round((max(r['x'] + r['w'] for r in rects) - x0) * (max(r['y'] + r['h'] for r in rects) - y0))


r = {'id': ID, 'stages': [], 'awards': {}, 'search': [], 'errors': {}}
s = Session(HERE)
try:
    for vue, vp in (('ordinateur', D), ('mobile', M), ('petit', S), ('etroit-300', TINY), ('paysage', L)):
        case = {'vue': vue, 'viewport': list(vp[:2])}
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open('projects', essais=essais, viewport=vp, block_globe=True)
            case[side] = s.js(DOCK_JS)
            if vue in ('etroit-300', 'paysage'): s.shot(f'{side}-{vue}')
        a, b = case['avant'], case['apres']
        case['labelsUnchanged'] = a['buttons'] == b['buttons'] and a['indicator'] == b['indicator'] and a['stage'] == b['stage']
        case['floatingAreaBefore'] = union_area(a['toggle'], a['die']); case['floatingAreaAfter'] = union_area(b['toggle'], b['die'])
        case['toggleAfter'] = b['toggle']; case['noOverflow'] = not a['overflow'] and not b['overflow']
        r['stages'].append(case)
        s.record(vue, {'stage': b['stage'], 'navContent': b['navContent'], 'labelsUnchanged': case['labelsUnchanged'], 'area': [case['floatingAreaBefore'], case['floatingAreaAfter']], 'toggle': b['toggle']})
    # Awards: the baseline hides the capsule, the die and the sheet; the trial must change nothing.
    for vue, vp in (('awards-ordinateur', D), ('awards-mobile', M)):
        pair = {}
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open('awards', essais=essais, viewport=vp, block_globe=True)
            g = s.js(DOCK_JS); pair[side] = {'toggleDisplay': g['toggleDisplay'], 'dieDisplay': g['dieDisplay'], 'buttons': g['buttons']}
            s.shot(f'{side}-{vue}')
        pair['pixelShare'] = round(image_diff(HERE / f'avant-{vue}.png', HERE / f'apres-{vue}.png'), 6)
        r['awards'][vue] = pair; s.record(vue, {'pixelShare': pair['pixelShare'], 'toggle': pair['apres']['toggleDisplay']})
    r['errors']['stages'] = s.errors()
finally:
    s.close()

# The open search: same surface, results and field as the baseline once the morph has finished.
s = Session(HERE)
try:
    for vue, vp in (('ordinateur', D), ('mobile', M)):
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open('projects', essais=essais, viewport=vp, block_globe=True)
            s.click('.dock-search-toggle'); s.wait('document.querySelector(".dock-shell")?.dataset.searchOpen==="true"', 5); time.sleep(.7)
            focus = s.js('document.activeElement?.classList.contains("dock-search-input")')
            s.c.call('Input.insertText', {'text': 'Paris'}); s.wait('document.querySelectorAll(".dock-search-result").length>0', 8); time.sleep(.8)
            s.away(); time.sleep(.3)
            row = {'vue': vue, 'side': side, 'focusInField': focus, 'results': s.js('document.querySelectorAll(".dock-search-result").length'),
                   'surface': s.js('(()=>{const r=document.querySelector(".dock-search-toggle").getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]})()'),
                   'titles': s.js('[...document.querySelectorAll(".dock-search-result-title")].map(e=>e.textContent)')}
            s.shot(f'{side}-recherche-ouverte-{vue}' if side == 'avant' else f'apres-recherche-ouverte-{vue}-comparable')
            s.key('Escape'); time.sleep(.6)
            row['closed'] = s.js('document.querySelector(".dock-shell").dataset.searchOpen==="false"')
            row['focusBack'] = s.js('document.activeElement===document.querySelector(".dock-search-toggle")')
            r['search'].append(row); s.record(f'search-{vue}-{side}', {k: row[k] for k in ('focusInField', 'results', 'surface', 'closed', 'focusBack')})
    r['errors']['search'] = s.errors()
finally:
    s.close()

pairs = {}
for vue in ('ordinateur', 'mobile'):
    a = next(x for x in r['search'] if x['vue'] == vue and x['side'] == 'avant'); b = next(x for x in r['search'] if x['vue'] == vue and x['side'] == 'apres')
    pairs[vue] = {'sameSurface': a['surface'] == b['surface'], 'sameResults': a['titles'] == b['titles'],
                  'pixelShare': round(image_diff(HERE / f'avant-recherche-ouverte-{vue}.png', HERE / f'apres-recherche-ouverte-{vue}-comparable.png'), 5)}
r['searchComparison'] = pairs
r['passed'] = bool(
    [c['apres']['stage'] for c in r['stages']] == [1, 2, 3, 4, 1]
    and all(c['labelsUnchanged'] and c['noOverflow'] and c['floatingAreaAfter'] < c['floatingAreaBefore'] and c['toggleAfter']['w'] >= 44 and c['toggleAfter']['h'] >= 44 for c in r['stages'])
    and all(p['pixelShare'] == 0 and p['apres']['toggleDisplay'] == 'none' for p in r['awards'].values())
    and all(x['focusInField'] and x['results'] > 0 and x['closed'] and x['focusBack'] for x in r['search'])
    and all(p['sameSurface'] and p['sameResults'] for p in pairs.values())
    and not any(r['errors'].values()))
OUT.write_text(json.dumps(r, ensure_ascii=False, indent=1) + '\n')
print('passed', r['passed'], json.dumps(pairs), 'written', OUT)
