"""Trial recherche-repliee, second adversarial verification (14 Oct 2026, after the 19:00 outage).
Independent re-measure of the acceptance criteria plus the cases the earlier runs left out:
- floating row (union box of capsule + die) and dock labels at 1440x900, 390x844, 320x640, 300x640;
- pixels: outside the floating row and its shadow, content pages are identical to the baseline;
- text line area hidden under the row at rest;
- search from a mouse click (FR mobile) and from the keyboard (AR dark desktop), compared with the baseline;
- hover and rest styles of the magnifier against the die; reduced-motion transitions;
- runtime language/theme changes and dock navigation (mouse) without reload;
- pinned detail sidebar geometry at 841 px (LTR and RTL) and 1100 px RTL;
- Explorer (no globe, and the real globe) and 42 Awards pixel-identical.
Every state is a fresh load (about:blank first). Writes results-contre-verification.json.
Run: python3 -I studies/design-review-studies/checks/recherche-repliee/check-contre-verification.py [part ...]"""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S

ID = 'recherche-repliee'
OUT = HERE / 'results-contre-verification.json'
SCRATCH = Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/2cf0c114-786b-4a24-866f-57822e04403f/scratchpad/agents/verif-pile-recherche-voile/rr')
COMMENTS = 'projects/ft-transcendence-building-together?tab=comments'
DETAIL = 'projects/ft-transcendence-building-together?tab=overview'
N300 = (300, 640, True)
SB841 = (841, 700, False)
SB1100 = (1100, 760, False)

ROW_JS = r'''(()=>{const box=e=>{if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}};
const t=document.querySelector('.dock-search-toggle'),d=document.querySelector('.dock-random-toggle'),l=t.querySelector('.dock-search-toggle-label'),ts=getComputedStyle(t),ds=getComputedStyle(d);
const icon=t.querySelector('svg[data-essai]');
const nav=[...document.querySelectorAll('#main-nav > button[data-section]')].map(b=>{const sp=b.querySelector('span');return [b.dataset.section,sp.textContent,box(b),box(sp),getComputedStyle(sp).opacity]});
return {section:document.getElementById('app').dataset.section,lang:document.documentElement.lang,dir:document.documentElement.dir,theme:document.documentElement.dataset.theme,
 toggle:box(t),die:box(d),dock:box(document.getElementById('main-nav')),nav,indicator:box(document.querySelector('#main-nav .nav-indicator')),
 name:t.getAttribute('aria-label'),title:t.title,expanded:t.getAttribute('aria-expanded'),labelDisplay:getComputedStyle(l).display,labelText:l.textContent,
 icons:t.querySelectorAll('svg').length,iconDisplay:icon?getComputedStyle(icon).display:'absent',iconBox:icon&&icon.getClientRects().length?box(icon):null,
 iconStroke:icon?[getComputedStyle(icon).stroke,getComputedStyle(icon).fill,getComputedStyle(icon).strokeWidth]:null,
 dieIcon:(i=>i?[box(i),getComputedStyle(i).stroke,getComputedStyle(i).strokeWidth]:null)(d.querySelector('svg')),
 diffFromDie:['color','backgroundColor','borderTopColor','borderTopWidth','boxShadow','backdropFilter','width','height','borderTopLeftRadius','opacity'].filter(k=>ts[k]!==ds[k]),
 transitions:[ts.transitionDuration,ds.transitionDuration],overflow:document.documentElement.scrollWidth>innerWidth+1}})()'''

# Text line boxes of the content sheet that intersect the toggle or the die (px^2), at rest.
TEXT_JS = r'''(()=>{const rs=['.dock-search-toggle','.dock-random-toggle'].map(s=>document.querySelector(s).getBoundingClientRect());
const w=document.createTreeWalker(document.getElementById('content-sheet'),NodeFilter.SHOW_TEXT);let a=0,n;
while(n=w.nextNode()){if(!n.textContent.trim())continue;const p=n.parentElement;if(!p||p.closest('[hidden],.sr-only')||!p.checkVisibility({visibilityProperty:true,opacityProperty:true}))continue;
 const g=document.createRange();g.selectNodeContents(n);for(const q of g.getClientRects())for(const r of rs){const x=Math.min(q.right,r.right)-Math.max(q.left,r.left),y=Math.min(q.bottom,r.bottom)-Math.max(q.top,r.top);if(x>0&&y>0)a+=x*y}}
return Math.round(a)})()'''

SIDEBAR_JS = r'''(()=>{const side=[...document.querySelectorAll('[data-detail-scroll=sidebar]')].find(e=>!e.closest('[hidden]')&&e.getClientRects().length);if(!side)return null;
const props=['x','width','top','height'].map(k=>side.style.getPropertyValue('--detail-sidebar-'+k));
const m=side.querySelector('.cp-detail-menu'),r=m?m.getBoundingClientRect():null;
return {props,density:side.dataset.detailDensity||null,menu:r?[+r.x.toFixed(1),+r.y.toFixed(1),+r.width.toFixed(1),+r.height.toFixed(1)]:null,overflow:m?.dataset.overflow||null,
 toggle:(b=>[+b.x.toFixed(1),+b.width.toFixed(1)])(document.querySelector('.dock-search-toggle').getBoundingClientRect()),dir:document.documentElement.dir}})()'''

SEARCH_STATE_JS = r'''(()=>{const a=document.activeElement,sh=document.querySelector('.dock-shell'),t=document.querySelector('.dock-search-toggle'),st=getComputedStyle(t);
const res=[...document.querySelectorAll('.dock-search-result')].filter(e=>e.getClientRects().length);
const panel=document.querySelector('.dock-search-panel'),pr=panel&&panel.getClientRects().length?panel.getBoundingClientRect():null;
return {open:sh.dataset.searchOpen||null,active:a?(a.className||a.tagName).toString().slice(0,40):null,activeIsInput:Boolean(a&&a.classList.contains('dock-search-input')),activeIsToggle:a===t,
 focusVisible:a?a.matches(':focus-visible'):false,outline:[st.outlineStyle,st.outlineWidth,st.outlineOffset],results:res.length,first:res[0]?res[0].textContent.trim().slice(0,40):null,
 status:(document.querySelector('.dock-search-status')||{}).textContent||'',panel:pr?[+pr.x.toFixed(1),+pr.y.toFixed(1),+pr.width.toFixed(1),+pr.height.toFixed(1)]:null,
 surface:(b=>[+b.x.toFixed(1),+b.y.toFixed(1),+b.width.toFixed(1),+b.height.toFixed(1)])(t.getBoundingClientRect())}})()'''


def press(s, key, code, text=None, shift=False):
    down = {'type': 'keyDown', 'key': key, 'code': key, 'windowsVirtualKeyCode': code, 'modifiers': 8 if shift else 0}
    if text: down['text'] = text
    s.c.call('Input.dispatchKeyEvent', down)
    s.c.call('Input.dispatchKeyEvent', {'type': 'keyUp', 'key': key, 'code': key, 'windowsVirtualKeyCode': code, 'modifiers': 8 if shift else 0})
    time.sleep(.35)


def fresh(s, route, **kw):
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.4)
    s.open(route, **kw)


def union_area(g):
    rs = [g['toggle'], g['die']]
    x0 = min(r['x'] for r in rs); x1 = max(r['x'] + r['w'] for r in rs); y0 = min(r['y'] for r in rs); y1 = max(r['y'] + r['h'] for r in rs)
    return {'box': [round(x0, 1), round(y0, 1), round(x1 - x0, 1), round(y1 - y0, 1)], 'area': round((x1 - x0) * (y1 - y0))}


def diff_box(a, b, scale):
    """Exact pixel comparison: count and CSS-pixel bounding box of differing pixels."""
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(a).convert('RGB'), dtype=int); y = np.asarray(Image.open(b).convert('RGB'), dtype=int)
    if x.shape != y.shape: return {'shape': [list(x.shape), list(y.shape)]}
    m = (x != y).any(axis=2)
    if not m.any(): return {'pixels': 0, 'box': None}
    ys, xs = np.nonzero(m)
    return {'pixels': int(m.sum()), 'box': [round(float(xs.min()) / scale, 1), round(float(ys.min()) / scale, 1), round(float(xs.max() + 1) / scale, 1), round(float(ys.max() + 1) / scale, 1)]}


def exact(a, b):
    r = diff_box(a, b, 1)
    return r.get('pixels') == 0


def run(parts):
    SCRATCH.mkdir(parents=True, exist_ok=True)
    data = json.loads(OUT.read_text()) if OUT.exists() else {'id': ID}
    data.setdefault('errors', {})
    if 'rows' in parts:
        rows = data.get('rows', {})
        for vue, vp in (('ordinateur', D), ('mobile', M), ('petit', S), ('etroit-300', N300)):
            if vue in rows and '--redo' not in parts: continue
            s = Session(SCRATCH)
            try:
                case = {}
                for side, essais in (('avant', []), ('apres', [ID])):
                    fresh(s, 'projects', essais=essais, viewport=vp, block_globe=True)
                    g = s.js(ROW_JS); g['union'] = union_area(g); g['textUnder'] = s.js(TEXT_JS)
                    case[side] = g
                    if vue in ('ordinateur', 'mobile', 'petit'): s.shot(f'{side}-projets-{vue}')
                case['area'] = [case['avant']['union']['area'], case['apres']['union']['area']]
                case['navUnchanged'] = case['avant']['nav'] == case['apres']['nav'] and case['avant']['indicator'] == case['apres']['indicator'] and case['avant']['dock'] == case['apres']['dock']
                if vue != 'etroit-300':
                    scale = 2 if vp[2] else 1
                    case['pixels'] = diff_box(SCRATCH / f'avant-projets-{vue}.png', SCRATCH / f'apres-projets-{vue}.png', scale)
                case['errors'] = s.errors()
                rows[vue] = case
                s.record('row-' + vue, {'area': case['area'], 'navUnchanged': case['navUnchanged'], 'text': [case['avant']['textUnder'], case['apres']['textUnder']], 'pixels': case.get('pixels'), 'diffFromDie': case['apres']['diffFromDie']})
            finally:
                s.close()
            data['rows'] = rows; OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1))
        s = Session(SCRATCH)
        try:
            # Detail page (comments tab) on desktop: only the row region may differ.
            case = {}
            for side, essais in (('avant', []), ('apres', [ID])):
                fresh(s, COMMENTS, essais=essais, viewport=D, block_globe=True)
                case[side] = {'row': s.js(ROW_JS), 'textUnder': s.js(TEXT_JS)}; s.shot(f'{side}-commentaires-ordinateur')
            case['pixels'] = diff_box(SCRATCH / 'avant-commentaires-ordinateur.png', SCRATCH / 'apres-commentaires-ordinateur.png', 1)
            data['commentaires'] = {'textUnder': [case['avant']['textUnder'], case['apres']['textUnder']], 'pixels': case['pixels'], 'union': [union_area(case['avant']['row']), union_area(case['apres']['row'])],
                                    'rowAvant': {k: case['avant']['row'][k] for k in ('toggle', 'die', 'dock')}}
            s.record('commentaires', data['commentaires'])
            # 42 Awards: no capsule there; must be pixel-identical.
            aw = {}
            for vue, vp in (('ordinateur', D), ('mobile', M)):
                for side, essais in (('avant', []), ('apres', [ID])):
                    fresh(s, 'awards', essais=essais, viewport=vp, block_globe=True); s.shot(f'{side}-awards-{vue}')
                aw[vue] = diff_box(SCRATCH / f'avant-awards-{vue}.png', SCRATCH / f'apres-awards-{vue}.png', 2 if vp[2] else 1)
            data['awards'] = aw; s.record('awards', aw)
            data['errors']['rows'] = s.errors()
        finally:
            s.close()
    if 'search' in parts:
        s = Session(SCRATCH)
        try:
            out = {}
            # Mouse/touch: tap the magnifier on mobile (FR light), type, Escape. Same flow on the baseline capsule.
            for side, essais in (('avant', []), ('apres', [ID])):
                fresh(s, 'projects', essais=essais, viewport=M, block_globe=True)
                s.click('.dock-search-toggle'); s.wait('document.querySelector(".dock-shell")?.dataset.searchOpen==="true"', 5); time.sleep(.8)
                step = {'opened': s.js(SEARCH_STATE_JS)}
                s.c.call('Input.insertText', {'text': 'Paris'}); s.wait('document.querySelectorAll(".dock-search-result").length>0', 8); time.sleep(.8)
                step['typed'] = s.js(SEARCH_STATE_JS); s.shot(f'{side}-recherche-ouverte-mobile')
                press(s, 'Escape', 27); time.sleep(.6)
                step['closed'] = s.js(SEARCH_STATE_JS)
                out['souris-mobile-' + side] = step
            # Keyboard: AR dark desktop. Script focus on the die, Shift+Tab reaches the toggle, Enter opens.
            for side, essais in (('avant', []), ('apres', [ID])):
                fresh(s, 'projects', essais=essais, lang='ar', theme='dark', viewport=D, block_globe=True)
                s.js('(()=>{document.querySelector(".dock-random-toggle").focus();return true})()')
                press(s, 'Tab', 9, shift=True)
                step = {'afterShiftTab': s.js(SEARCH_STATE_JS)}
                press(s, 'Enter', 13, text='\r'); s.wait('document.querySelector(".dock-shell")?.dataset.searchOpen==="true"', 5); time.sleep(.8)
                step['opened'] = s.js(SEARCH_STATE_JS)
                s.c.call('Input.insertText', {'text': 'Paris'}); s.wait('document.querySelectorAll(".dock-search-result").length>0', 8); time.sleep(.8)
                step['typed'] = s.js(SEARCH_STATE_JS)
                press(s, 'Escape', 27); time.sleep(.6)
                step['closed'] = s.js(SEARCH_STATE_JS)
                if side == 'apres': s.shot('apres-focus-retour-ar-sombre-ordinateur')
                out['clavier-ar-sombre-ordinateur-' + side] = step
            for k in ('souris-mobile', 'clavier-ar-sombre-ordinateur'):
                a, b = out[k + '-avant'], out[k + '-apres']
                out[k + '-memeRecherche'] = {'surface': a['typed']['surface'] == b['typed']['surface'], 'panel': a['typed']['panel'] == b['typed']['panel'],
                                              'results': [a['typed']['results'], b['typed']['results']], 'first': [a['typed']['first'], b['typed']['first']]}
            out['pixelsRechercheOuverteMobile'] = diff_box(SCRATCH / 'avant-recherche-ouverte-mobile.png', SCRATCH / 'apres-recherche-ouverte-mobile.png', 2)
            data['search'] = out; s.record('search', {k: v for k, v in out.items() if 'meme' in k or 'pixels' in k})
            # Hover state of the magnifier against the die (mouse over each, light then dark).
            hov = {}
            for theme in ('light', 'dark'):
                fresh(s, 'projects', essais=[ID], theme=theme, viewport=D, block_globe=True)
                read = '(()=>{const e=document.querySelector(%s),s=getComputedStyle(e),i=e.querySelector("svg");return [s.color,s.backgroundColor,s.borderTopColor,s.boxShadow,getComputedStyle(i).transform]})()'
                for name, sel in (('loupe', '.dock-search-toggle'), ('de', '.dock-random-toggle')):
                    r = s.rect(sel); s.c.call('Input.dispatchMouseEvent', {'type': 'mouseMoved', 'x': r['x'] + r['w'] / 2, 'y': r['y'] + r['h'] / 2}); time.sleep(.5)
                    hov[f'{theme}-{name}'] = s.js(read % json.dumps(sel))
                    s.away()
                hov[f'{theme}-memeSurvol'] = hov[f'{theme}-loupe'][:4] == hov[f'{theme}-de'][:4]
            data['hover'] = hov; s.record('hover', hov)
            data['errors']['search'] = s.errors()
        finally:
            s.close()
    if 'runtime' in parts:
        s = Session(SCRATCH)
        try:
            rt = {}
            fresh(s, 'projects', essais=[ID], viewport=D, block_globe=True)
            rt['start'] = s.js(ROW_JS)
            s.settings('ar', 'dark'); time.sleep(.6); rt['arDark'] = s.js(ROW_JS)
            s.settings('en', 'light'); time.sleep(.6); rt['enLight'] = s.js(ROW_JS)
            s.click('#main-nav > button[data-section=explore]'); time.sleep(1.2); rt['explore'] = s.js(ROW_JS)
            s.click('#main-nav > button[data-section=journal]'); time.sleep(1.2); rt['journal'] = s.js(ROW_JS)
            s.click('#main-nav > button[data-section=awards]'); time.sleep(1.2); rt['awards'] = s.js(ROW_JS)
            s.click('#main-nav > button[data-section=people]'); time.sleep(1.2); rt['people'] = s.js(ROW_JS)
            data['runtime'] = rt
            s.record('runtime', {k: [v['section'], v['lang'], v['dir'], v['theme'], v['toggle'], v['die'], v['name'], v['title'], v['labelDisplay'], v['icons'], v['iconDisplay'], v['diffFromDie']] for k, v in rt.items()})
            data['errors']['runtime'] = s.errors()
        finally:
            s.close()
        OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1))
    if 'sidebar' in parts:
        # Pinned detail sidebar: geometry must not depend on the narrower toggle (one session per case:
        # pages left in the back/forward cache add up under the helper's memory cap).
        sb = data.get('sidebar', {})
        for vue, vp, lang in (('841-ltr', SB841, 'fr'), ('841-rtl', SB841, 'ar'), ('1100-rtl', SB1100, 'ar')):
            s = Session(SCRATCH)
            try:
                case = {}
                for side, essais in (('avant', []), ('apres', [ID])):
                    fresh(s, DETAIL, essais=essais, lang=lang, viewport=vp, block_globe=True); time.sleep(.4)
                    case[side] = s.js(SIDEBAR_JS)
                a, b = case['avant'], case['apres']
                case['identical'] = bool(a and b and a['props'] == b['props'] and a['menu'] == b['menu'] and a['density'] == b['density'] and a['overflow'] == b['overflow'])
                case['errors'] = s.errors()
                sb[vue] = case
            finally:
                s.close()
            data['sidebar'] = sb; OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1))
        print('sidebar', json.dumps({k: v['identical'] for k, v in sb.items()}), flush=True)
    if 'explorer' in parts:
        s = Session(SCRATCH)
        try:
            ex = {}
            for vue, vp in (('ordinateur', D), ('mobile', M)):
                for side, essais in (('avant', []), ('apres', [ID])):
                    fresh(s, 'explore', essais=essais, viewport=vp, block_globe=True); time.sleep(.5)
                    ex[f'{vue}-{side}'] = s.js(ROW_JS); s.shot(f'{side}-explorer-{vue}-sans-globe')
                ex[f'{vue}-pixels'] = diff_box(SCRATCH / f'avant-explorer-{vue}-sans-globe.png', SCRATCH / f'apres-explorer-{vue}-sans-globe.png', 2 if vp[2] else 1)
            data['explorer'] = ex; s.record('explorer', {k: v for k, v in ex.items() if 'pixels' in k})
            data['errors']['explorer'] = s.errors()
        finally:
            s.close()
    if 'globe' in parts:
        s = Session(SCRATCH)
        try:
            gl = {}
            for side, essais in (('avant', []), ('apres', [ID])):
                fresh(s, 'explore', essais=essais, viewport=D, block_globe=False)
                gl[side + 'Ready'] = s.globe_ready(); time.sleep(2.5); s.away(); s.blur(); time.sleep(.5)
                gl[side + 'Row'] = s.js(ROW_JS); s.shot(f'{side}-explorer-globe')
            gl['pixels'] = diff_box(SCRATCH / 'avant-explorer-globe.png', SCRATCH / 'apres-explorer-globe.png', 1)
            data['globe'] = gl; s.record('globe', {k: v for k, v in gl.items() if 'Row' not in k})
            data['errors']['globe'] = s.errors()
        finally:
            s.close()
    if 'summary' in parts:
        data['passed'] = summary(data)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1))


def summary(d):
    """Acceptance verdict from the stored parts (pixels may differ only around the floating stack)."""
    def in_stack(box, row):
        if box is None: return True
        dock = row['dock']; top = min(row['toggle']['y'], row['die']['y']) - 8
        return bool(box[1] >= top and box[0] >= dock['x'] - 40 and box[2] <= dock['x'] + dock['w'] + 40)
    rows = d['rows']; rt = d['runtime']; se = d['search']
    checks = {
        'area': all(r['area'] == [11088, 4224] for r in rows.values()),
        'navUnchanged': all(r['navUnchanged'] for r in rows.values()),
        'pixelsOnlyAroundStack': all(in_stack(r['pixels']['box'], r['avant']) for r in rows.values() if 'pixels' in r) and in_stack(d['commentaires']['pixels']['box'], d['commentaires']['rowAvant']),
        'textUnderReduced': all(r['apres']['textUnder'] < r['avant']['textUnder'] for r in rows.values()),
        'magnifier44': all(r['apres']['toggle']['w'] == 44 and r['apres']['toggle']['h'] == 44 and r['apres']['icons'] == 1 for r in rows.values()),
        'sameSearch': all(se[k]['surface'] and se[k]['panel'] and se[k]['results'][0] == se[k]['results'][1] > 0 for k in ('souris-mobile-memeRecherche', 'clavier-ar-sombre-ordinateur-memeRecherche')) and se['pixelsRechercheOuverteMobile']['pixels'] == 0,
        'focusAndEscape': all(se[k]['opened']['activeIsInput'] and se[k]['closed']['activeIsToggle'] and se[k]['closed']['focusVisible'] and se[k]['closed']['open'] == 'false' for k in ('souris-mobile-apres', 'clavier-ar-sombre-ordinateur-apres')) and se['clavier-ar-sombre-ordinateur-apres']['afterShiftTab']['activeIsToggle'],
        'hoverLikeDie': d['hover']['light-memeSurvol'] and d['hover']['dark-memeSurvol'],
        'runtime': all(v['icons'] == 1 for v in rt.values()) and rt['arDark']['name'] == 'البحث في أفق' and rt['enLight']['name'] == 'Search Horizon' and rt['arDark']['toggle']['x'] > rt['arDark']['die']['x'] and rt['explore']['toggle']['w'] == 200 and rt['explore']['labelDisplay'] == 'block' and rt['explore']['iconDisplay'] == 'none' and rt['journal']['toggle']['w'] == 44,
        'sidebar': all(v['identical'] for v in d['sidebar'].values()),
        'explorer': all(v['pixels'] == 0 for k, v in d['explorer'].items() if k.endswith('pixels')) and d['globe']['pixels']['pixels'] == 0 and d['globe']['avantReady'] and d['globe']['apresReady'],
        'awards': all(v['pixels'] == 0 for v in d['awards'].values()),
        'noErrors': not any(d['errors'].values()) and not any(r.get('errors') for r in rows.values()) and not any(v.get('errors') for v in d['sidebar'].values()),
    }
    d['criteres'] = checks
    return all(checks.values())


if __name__ == '__main__':
    run(sys.argv[1:] or ['rows', 'search', 'runtime', 'sidebar', 'explorer', 'globe'])
