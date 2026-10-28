"""Trial lisibilite-textes: text audit before/after (AUDIT_JS logic of the 14 Oct design review),
overflow, line counts and captures. Run: python3 -I studies/design-review-studies/checks/lisibilite-textes/check.py
[audit] [scope] [listView] [dialogs] [runtime] [densities] (default: all; stages left out keep their previous results)."""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S
from PIL import Image

ID = 'lisibilite-textes'
PID, LEILA, ART = 'ft-transcendence-building-together', 'profile-leila-mansour', 'journal-an-evening-debugging'
# Same parsing, background stacking, visibility (first screen) and WCAG thresholds as the review's AUDIT_JS;
# every text is returned so attribution and decorative SVG text can be reported separately.
AUDIT_JS = r'''(()=>{
const parse=s=>{if(!s)return null;let m=s.match(/rgba?\(([^)]+)\)/);if(m){const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return{r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}}m=s.match(/color\(srgb ([^)]+)\)/);if(m){const p=m[1].split(/[ \/]+/).filter(Boolean).map(Number);return{r:p[0]*255,g:p[1]*255,b:p[2]*255,a:p.length>3?p[3]:1}}return null};
const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
const over=(top,bot)=>{const a=top.a+bot.a*(1-top.a);if(!a)return{r:255,g:255,b:255,a:1};return{r:(top.r*top.a+bot.r*bot.a*(1-top.a))/a,g:(top.g*top.a+bot.g*bot.a*(1-top.a))/a,b:(top.b*top.a+bot.b*bot.a*(1-top.a))/a,a}};
const pageBg=()=>{const b=parse(getComputedStyle(document.body).backgroundColor);const h=parse(getComputedStyle(document.documentElement).backgroundColor);if(b&&b.a>0)return b;if(h&&h.a>0)return h;return{r:255,g:255,b:255,a:1}};
const bgOf=el=>{const stack=[];let e=el,uncertain=false;while(e&&e.nodeType===1){const s=getComputedStyle(e);const c=parse(s.backgroundColor);if(s.backgroundImage&&s.backgroundImage!=='none')uncertain=true;if(s.backdropFilter&&s.backdropFilter!=='none')uncertain=true;if(c&&c.a>0){stack.push(c);if(c.a>=.999)break}e=e.parentElement}let base=pageBg();if(!e)uncertain=uncertain||stack.length===0;let col=stack.length&&stack[stack.length-1].a>=.999?stack.pop():base;for(let i=stack.length-1;i>=0;i--)col=over(stack[i],col);return{col,uncertain}};
const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};
const visible=el=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)return false;const s=getComputedStyle(el);if(s.visibility==='hidden'||s.display==='none'||Number(s.opacity)===0)return false;let e=el;while(e){if(Number(getComputedStyle(e).opacity)===0)return false;if(e.hidden)return false;e=e.parentElement}return true};
const texts=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;const seen=new Set();
while(n=walker.nextNode()){const t=n.textContent.replace(/\s+/g,' ').trim();if(!t)continue;const el=n.parentElement;if(!el||seen.has(el))continue;if(!visible(el))continue;seen.add(el);const s=getComputedStyle(el);let fg=parse(s.color)||{r:0,g:0,b:0,a:1};const {col,uncertain}=bgOf(el);if(fg.a<1)fg=over(fg,col);const size=parseFloat(s.fontSize),weight=Number(s.fontWeight)||400;const large=size>=24||size>=18.66&&weight>=700;const cr=ratio(fg,col);
 texts.push({text:t.slice(0,40),cls:(typeof el.className==='string'?el.className:'').slice(0,50),parent:(typeof el.parentElement?.className==='string'?el.parentElement.className:'').slice(0,40),size:Math.round(size*100)/100,weight,color:s.color,bg:`rgb(${Math.round(col.r)}, ${Math.round(col.g)}, ${Math.round(col.b)})`,ratio:Math.round(cr*100)/100,fail:cr<(large?3:4.5),uncertain,attribution:Boolean(el.closest('.map-credit,.maplibregl-ctrl-attrib')),svgArt:Boolean(el.closest('svg')),dock:Boolean(el.closest('.main-nav')),brand:Boolean(el.closest('.brand'))})}
return {theme:document.documentElement.dataset.theme,lang:document.documentElement.lang,dir:document.documentElement.dir,texts}})()'''
# Rows of wrapped metadata, chip and toolbar lines; label overflow inside the dock and header.
LAYOUT_JS = r'''(()=>{const lines=sel=>[...document.querySelectorAll(sel)].filter(e=>e.getBoundingClientRect().height>0).slice(0,12).map(e=>{const range=document.createRange();range.selectNodeContents(e);const tops=[];for(const r of range.getClientRects()){if(r.width<1)continue;if(!tops.some(t=>Math.abs(t-r.bottom)<4))tops.push(r.bottom)}return tops.length});
const rows=sel=>{const tops=new Set([...document.querySelectorAll(sel)].filter(e=>e.getBoundingClientRect().height>0).map(e=>Math.round(e.getBoundingClientRect().top/6)));return tops.size};
const clipped=sel=>[...document.querySelectorAll(sel)].filter(e=>e.getBoundingClientRect().width>0&&e.scrollWidth>e.clientWidth+1).map(e=>e.textContent.trim().slice(0,20));
return {overflow:document.documentElement.scrollWidth>innerWidth+1,metaLines:lines('#content-list .cp-meta'),statusLines:lines('#content-list .cp-profile-status'),
 toolbarRows:rows('#content-index .cp-toolbar>#content-count,#content-index .cp-toolbar .cp-control-menu:not([hidden])'),countLines:lines('#content-count'),
 toolbarRoom:(()=>{const c=document.querySelector('#content-count'),m=document.querySelector('#content-index .cp-content-controls');if(!c||!m||!c.getBoundingClientRect().width)return null;const a=c.getBoundingClientRect(),b=m.getBoundingClientRect();return Math.round(document.documentElement.dir==='rtl'?a.left-b.right:b.left-a.right)})(),
 dockClipped:clipped('.main-nav button span'),headerClipped:clipped('.header .brand-names,.header .utilities'),
 density:[...document.querySelectorAll('[data-detail-density]')].map(e=>e.dataset.detailDensity),
 dockLabels:[...document.querySelectorAll('.main-nav>button[data-section]')].map(b=>{const l=b.querySelector('span'),r=b.getBoundingClientRect();return{t:l?.textContent.trim(),size:l?getComputedStyle(l).fontSize:null,label:l?l.scrollWidth:0,slot:Math.round(r.width)}}),
 actions:[...document.querySelectorAll('#content-sheet :is(.cp-favorite:not(.cp-favorite-compact),.cp-report-trigger,.cp-profile-message,.cp-project-campus,.cp-profile-campus)')].filter(e=>e.getBoundingClientRect().width>0).map(e=>{const r=e.getBoundingClientRect();return{t:e.textContent.trim().slice(0,22),size:getComputedStyle(e).fontSize,w:Math.round(r.width),h:Math.round(r.height)}})}})()'''

VIEWS = [  # (vue, route, theme, lang, viewport, capture)
    ('ordinateur', 'projects', 'light', 'fr', D, True), ('profils-ordinateur', 'people', 'light', 'fr', D, True),
    ('chroniques-ordinateur', 'journal', 'light', 'fr', D, False), ('fiche-ordinateur', f'projects/{PID}', 'light', 'fr', D, True),
    ('commentaires-ordinateur', f'projects/{PID}?tab=comments', 'light', 'fr', D, False), ('profil-ordinateur', f'people/{LEILA}', 'light', 'fr', D, True),
    ('parcours-ordinateur', f'people/{LEILA}?tab=journey', 'light', 'fr', D, False), ('article-ordinateur', f'journal/{ART}', 'light', 'fr', D, False),
    ('mobile', 'projects', 'light', 'fr', M, True), ('profils-mobile', 'people', 'light', 'fr', M, True), ('fiche-mobile', f'projects/{PID}', 'light', 'fr', M, True),
    ('petit', 'projects', 'light', 'fr', S, True), ('profils-petit-en-sombre', 'people', 'dark', 'en', S, False),
    ('sombre-ordinateur', 'people', 'dark', 'fr', D, True), ('fiche-sombre-ordinateur', f'people/{LEILA}', 'dark', 'fr', D, False),
    ('ar-sombre-mobile', 'people', 'dark', 'ar', M, True), ('explorer-ordinateur', 'explore', 'light', 'fr', D, False),
]

def summary(audit):
    texts = [t for t in audit['texts'] if not t['attribution']]
    small = [t for t in texts if t['size'] < 13]
    fails = [t for t in texts if t['fail']]
    return {'texts': len(texts), 'below13': len(small), 'below13Share': round(len(small) / max(1, len(texts)), 4),
            'below13OutsideDock': len([t for t in small if not t['dock']]), 'below13Useful': len([t for t in small if not t['dock'] and not t['brand']]), 'contrastFails': len(fails),
            'contrastFailsOutsideSvgArt': len([t for t in fails if not t['svgArt']]),
            'sizes': sorted({t['size'] for t in texts}), 'smallSamples': sorted({f"{t['size']} {t['cls'] or t['parent']} «{t['text'][:18]}»" for t in small})[:14],
            'failSamples': sorted({f"{t['ratio']} {t['color']} on {t['bg']} {t['cls'] or t['parent']} «{t['text'][:16]}»" for t in fails})[:10]}

# Stages: audit (views, overlays, campus sheet), scope, listView, dialogs, runtime, densities; default all.
# Stages left out keep their previous results from results.json.
ALL = ['audit', 'scope', 'listView', 'dialogs', 'runtime', 'densities']
STAGES = sys.argv[1:] or ALL
PREVIOUS = json.loads((HERE / 'results.json').read_text()) if (HERE / 'results.json').exists() else {}
results = {'id': ID, 'views': [], 'totals': {}, 'sheet': {}, 'passed': False}
for key, stage in (('views', 'audit'), ('overlays', 'audit'), ('sheet', 'audit'), ('scope', 'scope'), ('listView', 'listView'), ('dialogs', 'dialogs'), ('runtime', 'runtime'), ('densities', 'densities')):
    if stage not in STAGES and key in PREVIOUS: results[key] = PREVIOUS[key]
if 'audit' in STAGES:
    # A fresh, short Chrome session every three views keeps the renderer under the memory cap.
    for chunk in range(0, len(VIEWS), 3):
        s = Session(HERE)
        try:
            for vue, route, theme, lang, vp, capture in VIEWS[chunk:chunk + 3]:
                case = {'vue': vue, 'route': route, 'theme': theme, 'lang': lang, 'viewport': vp[:2]}
                for label, essais in [('avant', []), ('apres', [ID])]:
                    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)
                    if capture: s.shot(f'{label}-{vue}')
                    case[label] = {'audit': summary(s.js(AUDIT_JS, 20)), 'layout': s.js(LAYOUT_JS), 'errors': s.errors()}
                results['views'].append(case)
                print(vue, json.dumps({k: {x: case[k]['audit'][x] for x in ('texts', 'below13', 'below13Useful', 'contrastFails', 'contrastFailsOutsideSvgArt')} for k in ('avant', 'apres')}), flush=True)
        finally:
            s.close()

# Overlays that are not in the first screen of a page: search results, filter dialog, account menu.
OVERLAYS = [('recherche-mobile', 'projects', M, 'search'), ('recherche-ordinateur', 'projects', D, 'search'),
            ('filtre-mobile', 'projects', M, 'filter'), ('compte-ordinateur', 'projects', D, 'account')]
if 'audit' in STAGES:
    results['overlays'] = []
    s = Session(HERE)
    try:
        for vue, route, vp, kind in OVERLAYS:
            case = {'vue': vue, 'viewport': vp[:2], 'kind': kind}
            for label, essais in [('avant', []), ('apres', [ID])]:
                s.open(route, essais=essais, theme='light', lang='fr', viewport=vp, block_globe=True)
                try:
                    if kind == 'search':
                        s.click('.dock-search-toggle'); time.sleep(.8); s.c.call('Input.insertText', {'text': 'Paris'}); time.sleep(1.2)
                    elif kind == 'filter':
                        s.click('#content-index .cp-control-menu[data-control=category] .cp-control-trigger'); time.sleep(1)
                    else:
                        s.click('#profile'); time.sleep(.8)
                except RuntimeError as error:
                    case[label + 'Action'] = str(error)
                s.shot(f'{label}-{vue}')
                case[label] = {'audit': summary(s.js(AUDIT_JS, 20)), 'overflow': s.overflow(), 'errors': s.errors(),
                               'open': s.js('Boolean(document.querySelector("dialog[open],.dock-shell[data-search-open=true],.account-menu:not([hidden])"))')}
            results['overlays'].append(case)
            print(vue, json.dumps({k: {x: case[k]['audit'][x] for x in ('texts', 'below13', 'below13Useful', 'contrastFails')} | {'open': case[k]['open'], 'overflow': case[k]['overflow']} for k in ('avant', 'apres')}), flush=True)
    finally:
        s.close()

# Campus sheet in Explorer, with the real globe (separate short session).
OPEN_SHEET = '(()=>{const b=[...document.querySelectorAll("#globe button")].find(b=>/42 Paris/.test(b.textContent)&&b.getBoundingClientRect().width>0);if(b)b.setAttribute("data-qa-campus","1");return Boolean(b)})()'
if 'audit' in STAGES:
    s = Session(HERE)
    try:
        for label, essais in [('avant', []), ('apres', [ID])]:
            s.open('explore?country=FRA&campus=paris', essais=essais, theme='light', lang='fr', viewport=D, block_globe=False)
            s.wait('[...document.querySelectorAll("#globe button")].some(b=>/42 Paris/.test(b.textContent)&&b.getBoundingClientRect().width>0)', 30)
            ok = s.js(OPEN_SHEET)
            if ok: s.click('[data-qa-campus="1"]'); time.sleep(2.5)
            s.shot(f'{label}-fiche-campus-ordinateur')
            audit = s.js(AUDIT_JS, 20)
            results['sheet'][label] = {'opened': bool(ok) and bool(s.js('Boolean(document.querySelector("dialog[data-kind=campus][open]"))')),
                                       'audit': summary(audit), 'attributionSizes': sorted({t['size'] for t in audit['texts'] if t['attribution']}),
                                       'overflow': s.overflow(), 'errors': s.errors()}
            s.record('fiche-campus-' + label, results['sheet'][label])
    finally:
        s.close()

# --- Verification stages added on review (14 Oct 2026, evening) -----------------------------------------
PREFS = 'horizon-design-review-studies-20261014-content-preferences-v2'
TOGGLE = '(()=>{for(const l of document.querySelectorAll("link[data-essai]"))l.disabled=%s;return document.querySelectorAll("link[data-essai]").length})()'
# Every rendered element: tag, class, own text, size, colour (same DOM with the trial sheet off, then on).
SNAP_JS = r"""(()=>[...document.body.querySelectorAll('*')].filter(e=>e.getClientRects().length).map(e=>{let own='';for(const n of e.childNodes)if(n.nodeType===3)own+=n.textContent;
 const s=getComputedStyle(e),r=e.getBoundingClientRect();return[e.tagName,typeof e.className==='string'?e.className.slice(0,40):'',own.replace(/\s+/g,' ').trim().slice(0,20),parseFloat(s.fontSize),s.color,Math.round(r.width),Math.round(r.height),e.tagName==='svg'||e.closest('svg')!==null]}))()"""
CHIP_JS = r"""(()=>[...document.querySelectorAll('#content-list .cp-profile-portrait>.cp-profile-status')].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect(),
 range=document.createRange();range.selectNodeContents(e);const lines=new Set([...range.getClientRects()].filter(x=>x.width>.5).map(x=>Math.round(x.top))).size;
 return{t:e.textContent.trim(),fs:parseFloat(getComputedStyle(e).fontSize),w:Math.round(r.width*10)/10,lines,clipped:r.left<p.left-.5||r.right>p.right+.5||r.bottom>p.bottom+.5,own:e.scrollWidth>e.clientWidth+1}}))()"""
FIND_CHIP = r"""((re)=>{const chip=[...document.querySelectorAll('#content-list .cp-profile-portrait>.cp-profile-status')].find(e=>new RegExp(re).test(e.textContent));if(!chip)return null;
 const p=chip.parentElement;p.scrollIntoView({block:'center'});const r=p.getBoundingClientRect();return[Math.round(r.left-8),Math.round(r.top-8),Math.round(r.right+8),Math.round(r.bottom+8)]})(%s)"""
STATE_JS = r"""(()=>({density:[...document.querySelectorAll('[data-detail-density]')].map(e=>e.closest('[id]')?.id+':'+e.dataset.detailDensity),
 identity:[...document.querySelectorAll(':is(#project-detail,#journal-detail,#profile-detail):not([hidden]) :is(.cp-project-sidebar,.cp-profile-sidebar)>header')].map(h=>Math.round(h.getBoundingClientRect().height)),
 overflow:document.documentElement.scrollWidth>innerWidth+1}))()"""
RUNTIME_JS = r"""(()=>{const q=s=>[...document.querySelectorAll(s)].filter(e=>e.getClientRects().length).slice(0,4).map(e=>{const c=getComputedStyle(e);return[parseFloat(c.fontSize),c.color]});
 return{lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,status:q('#content-list .cp-profile-status'),meta:q('#content-list .cp-meta'),campus:q('#content-sheet .cp-project-campus,#content-sheet .cp-profile-campus'),
  actions:q('#content-sheet :is(.cp-favorite:not(.cp-favorite-compact),.cp-report-trigger)'),overflow:document.documentElement.scrollWidth>innerWidth+1}})()"""
LIGHT = {'rgb(0, 142, 144)': 'rgb(12, 118, 119)'}; DARK = {'rgb(237, 52, 145)': 'rgb(244, 133, 189)'}


def fresh(s, route, essais, theme='light', lang='fr', vp=D, settle=.8):
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.15)
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True, settle=settle)


def new_session():
    s = Session(HERE)
    # Pages left in the back/forward cache stay alive until the memory cap; an unload listener opts them out.
    s.c.call('Page.addScriptToEvaluateOnNewDocument', {'source': 'addEventListener("unload",()=>{})'})
    return s


# 1. Scope of the sheet on the same DOM: only sizes going up (never down) and only the two accent swaps.
SCOPE = [('projects', 'light', 'fr', D), ('people', 'light', 'fr', D), ('journal', 'light', 'fr', D), (f'projects/{PID}?tab=overview', 'light', 'fr', D),
         (f'projects/{PID}?tab=comments', 'light', 'fr', D), (f'journal/{ART}?tab=article', 'light', 'fr', D), (f'people/{LEILA}?tab=overview', 'light', 'fr', D),
         (f'people/{LEILA}?tab=journey', 'light', 'fr', D), ('people', 'dark', 'fr', D), (f'projects/{PID}?tab=overview', 'dark', 'fr', D),
         ('projects', 'light', 'fr', M), ('people', 'dark', 'ar', M), (f'projects/{PID}?tab=overview', 'light', 'ar', M), ('journal', 'light', 'en', S)]
if 'scope' in STAGES:
    results['scope'] = []
    for start in range(0, len(SCOPE), 7):
        s = new_session()
        try:
            for route, theme, lang, vp in SCOPE[start:start + 7]:
                fresh(s, route, [ID], theme, lang, vp)
                s.js(TOGGLE % 'true'); time.sleep(.4); a = s.js(SNAP_JS, 30)
                s.js(TOGGLE % 'false'); time.sleep(.4); b = s.js(SNAP_JS, 30)
                same = len(a) == len(b) and all(x[:3] == y[:3] for x, y in zip(a, b))
                swaps = LIGHT if theme == 'light' else DARK
                colours = [(x[1] or x[0], x[4], y[4]) for x, y in zip(a, b) if x[4] != y[4]]
                sizes = [(x[1] or x[0], x[3], y[3]) for x, y in zip(a, b) if x[3] != y[3] and not x[7]]
                icons = [(x[1] or x[0], x[5], x[6], y[5], y[6]) for x, y in zip(a, b) if x[7] and (x[5], x[6]) != (y[5], y[6])]
                row = {'route': route, 'theme': theme, 'lang': lang, 'viewport': vp[:2], 'sameDom': same, 'elements': len(a),
                       'sizeChanges': len(sizes), 'sizeDecreases': [c for c in sizes if c[2] < c[1]], 'sizeAbove14': sorted({c[0] for c in sizes if c[2] > 14}),
                       'colourChanges': len(colours), 'unexpectedColours': [c for c in colours if swaps.get(c[1]) != c[2]],
                       'colourChangedIn': sorted({c[0] for c in colours})[:20], 'iconBoxChanges': icons[:5], 'overflow': s.overflow(), 'errors': s.errors()}
                results['scope'].append(row)
                print('scope', route, theme, lang, vp[:2], {k: row[k] for k in ('sameDom', 'sizeChanges', 'colourChanges')}, len(row['sizeDecreases']), len(row['unexpectedColours']), len(row['iconBoxChanges']), flush=True)
        finally:
            s.close()

# 2. Profiles list view: status chips inside their clipping thumbnail (FR and AR, 320 to 1440 px), and grid chips at 320/390.
CHIP_VIEWS = [('petit', 'light', 'fr', S, 'list'), ('mobile', 'light', 'fr', M, 'list'), ('ar-sombre-mobile', 'dark', 'ar', M, 'list'), ('tablette', 'light', 'fr', (1024, 768, False), 'list'),
              ('seuil-1199', 'light', 'fr', (1199, 800, False), 'list'), ('seuil-1200', 'light', 'fr', (1200, 800, False), 'list'), ('seuil-1200-ar', 'light', 'ar', (1200, 800, False), 'list'),
              ('ordinateur', 'light', 'fr', D, 'list'), ('ar-ordinateur', 'light', 'ar', D, 'list'),
              ('grille-petit', 'light', 'fr', S, 'grid'), ('grille-petit-ar', 'light', 'ar', S, 'grid'), ('grille-ar-sombre-mobile', 'dark', 'ar', M, 'grid')]
CHIP_SHOTS = {'mobile': 'Transcender', 'ar-sombre-mobile': 'خريج', 'ordinateur': 'Transcender'}
if 'listView' in STAGES:
    results['listView'] = []
    for start in range(0, len(CHIP_VIEWS), 6):
        s = new_session()
        try:
            fresh(s, 'people', [ID])
            for vue, theme, lang, vp, view in CHIP_VIEWS[start:start + 6]:
                s.js('(()=>{localStorage.setItem(%s,JSON.stringify({version:2,layoutBySection:{projects:"grid",people:%s,journal:"grid"}}));return true})()' % (json.dumps(PREFS), json.dumps(view)))
                row = {'vue': vue, 'theme': theme, 'lang': lang, 'viewport': vp[:2], 'requestedView': view}
                for label, essais in (('avant', []), ('apres', [ID])):
                    fresh(s, 'people', essais, theme, lang, vp)
                    row['view'] = s.js('document.getElementById("content-index")?.dataset.view')
                    chips = s.js(CHIP_JS)
                    row[label] = {'sizes': sorted({c['fs'] for c in chips}), 'clipped': [c['t'] for c in chips if c['clipped']], 'ownOverflow': [c['t'] for c in chips if c['own']],
                                  'twoLines': sorted({c['t'] for c in chips if c['lines'] > 1}), 'widest': max([c['w'] for c in chips] or [0]), 'n': len(chips),
                                  'overflow': s.overflow(), 'errors': s.errors()}
                    if vue in CHIP_SHOTS:
                        box = s.js(FIND_CHIP % json.dumps(CHIP_SHOTS[vue])); time.sleep(.6); box = s.js(FIND_CHIP % json.dumps(CHIP_SHOTS[vue])); time.sleep(.3)
                        k = 2 if vp[2] else 1
                        Image.open(s.shot('_t')).crop(tuple(v * k for v in box)).save(HERE / f'{label}-liste-puce-{vue}.png')
                results['listView'].append(row)
                print('liste', vue, row['view'], {k: row[k] for k in ('avant', 'apres')}, flush=True)
            s.js('(()=>{localStorage.removeItem(%s);return true})()' % json.dumps(PREFS))
        finally:
            s.close(); (HERE / '_t.png').unlink(missing_ok=True)

# 3. Report and message dialogs (not in the first screen of a page): small text and overflow.
if 'dialogs' in STAGES:
    results['dialogs'] = []
    s = new_session()
    try:
        for vue, kind, lang, vp in [('signaler-mobile', 'report', 'fr', M), ('message-mobile', 'message', 'fr', M), ('signaler-ordinateur-ar', 'report', 'ar', D), ('message-petit', 'message', 'fr', S)]:
            row = {'vue': vue, 'kind': kind, 'lang': lang, 'viewport': vp[:2]}
            fresh(s, f'people/{LEILA}', [ID], 'light', lang, vp)
            try: s.click('#content-sheet .cp-report-trigger' if kind == 'report' else '#content-sheet .cp-profile-message'); time.sleep(1)
            except RuntimeError as error: row['action'] = str(error)
            s.blur()
            for label, off in (('avant', 'true'), ('apres', 'false')):
                s.js(TOGGLE % off); time.sleep(.4)
                audit = summary(s.js(AUDIT_JS, 20))
                row[label] = {'audit': {k: audit[k] for k in ('texts', 'below13', 'below13Useful', 'contrastFails', 'smallSamples', 'failSamples')},
                              'dialog': s.js('(()=>{const d=document.querySelector("dialog[open]");return d?{cls:d.className,overflow:d.scrollWidth>d.clientWidth+1,w:Math.round(d.getBoundingClientRect().width)}:null})()'),
                              'overflow': s.overflow(), 'errors': s.errors()}
                s.shot(f'{label}-{vue}')
            results['dialogs'].append(row)
            print('dialogue', vue, {k: (row[k]['audit']['below13Useful'], row[k]['dialog']) for k in ('avant', 'apres')}, flush=True)
    finally:
        s.close()

# 4. Language and theme switched through the account menu, then a navigation, without reload.
if 'runtime' in STAGES:
    s = new_session()
    try:
        fresh(s, 'people', [ID])
        steps = [('fr-clair', s.js(RUNTIME_JS))]
        s.settings('ar', 'dark'); time.sleep(1); steps.append(('ar-sombre', s.js(RUNTIME_JS)))
        s.js('(()=>{location.hash="#projects/ft-transcendence-building-together";return true})()'); time.sleep(1.5); steps.append(('ar-sombre-fiche', s.js(RUNTIME_JS)))
        s.settings('en', 'light'); time.sleep(1); steps.append(('en-clair-fiche', s.js(RUNTIME_JS)))
        results['runtime'] = {'steps': steps, 'errors': s.errors()}
        for name, st in steps: print('runtime', name, st, flush=True)
    finally:
        s.close()

# 5. detail-scroll densities in short windows (the floor makes the identity a little taller).
DENSITY = [(vp, r, lang) for vp in ((1280, 720, False), (1366, 768, False), (1024, 768, False), (900, 600, False)) for r in (f'projects/{PID}', f'journal/{ART}', f'people/{LEILA}') for lang in ('fr',)]
DENSITY += [((1280, 720, False), r, 'ar') for r in (f'projects/{PID}', f'journal/{ART}', f'people/{LEILA}')]
if 'densities' in STAGES:
    results['densities'] = []
    for start in range(0, len(DENSITY), 5):
        s = new_session()
        try:
            for vp, route, lang in DENSITY[start:start + 5]:
                row = {'viewport': vp[:2], 'route': route, 'lang': lang}
                for label, essais in (('avant', []), ('apres', [ID])):
                    fresh(s, route, essais, 'light', lang, vp, settle=1.0); row[label] = s.js(STATE_JS)
                row['errors'] = s.errors(); results['densities'].append(row)
                print('densite', vp[:2], route.split('/')[0], lang, row['avant']['density'], row['apres']['density'], row['avant']['identity'], row['apres']['identity'], flush=True)
        finally:
            s.close()

def total(label):
    views = [v[label]['audit'] for v in results['views']]
    t = sum(v['texts'] for v in views); b = sum(v['below13'] for v in views)
    return {'texts': t, 'below13': b, 'below13Share': round(b / max(1, t), 4), 'below13OutsideDock': sum(v['below13OutsideDock'] for v in views), 'below13Useful': sum(v['below13Useful'] for v in views),
            'contrastFails': sum(v['contrastFails'] for v in views), 'contrastFailsOutsideSvgArt': sum(v['contrastFailsOutsideSvgArt'] for v in views)}
results['totals'] = {'avant': total('avant'), 'apres': total('apres')}
# Dock labels that the baseline already hides at 320 px are not a regression: compare with the same view before.
results['passed'] = bool(all(not v['apres']['layout']['overflow'] and not v['apres']['errors'] and v['apres']['layout']['dockClipped'] == v['avant']['layout']['dockClipped'] and not v['apres']['layout']['headerClipped'] for v in results['views'])
                         and results['totals']['apres']['contrastFailsOutsideSvgArt'] == 0 and results['totals']['apres']['below13Useful'] == 0
                         and all(o['apres']['open'] and not o['apres']['overflow'] and not o['apres']['errors'] and o['apres']['audit']['below13Useful'] == 0 for o in results['overlays'])
                         and results['sheet'].get('apres', {}).get('opened'))
checks = {
    'scope': all(r['sameDom'] and not r['sizeDecreases'] and not r['unexpectedColours'] and not r['iconBoxChanges'] and not r['overflow'] and not r['errors'] for r in results['scope']),
    'listView': all(not r['apres']['clipped'] and not r['apres']['ownOverflow'] and not r['apres']['overflow'] and not r['apres']['errors'] and r['view'] == r['requestedView'] for r in results['listView']),
    'dialogs': all(r['apres']['audit']['below13Useful'] == 0 and r['apres']['dialog'] and not r['apres']['dialog']['overflow'] and not r['apres']['overflow'] and not r['apres']['errors'] for r in results['dialogs']),
    'runtime': not results['runtime']['errors'] and all(not st['overflow'] and all(fs >= 13 for fs, _ in st['status'] + st['meta']) and all(fs >= 14 for fs, _ in st['campus'] + st['actions'])
                                                        and all(c in ('rgb(12, 118, 119)', 'rgb(244, 133, 189)') for _, c in st['status'] + st['meta'] + st['campus']) for _, st in results['runtime']['steps']),
    'densities': all(r['avant']['density'] == r['apres']['density'] and not r['apres']['overflow'] and not r['errors'] for r in results['densities']),
}
results['checks'] = checks
results['passed'] = bool(results['passed'] and all(checks.values()))
(HERE / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
print('totals', json.dumps(results['totals'], ensure_ascii=False)); print('checks', results['checks']); print('passed', results['passed'])
