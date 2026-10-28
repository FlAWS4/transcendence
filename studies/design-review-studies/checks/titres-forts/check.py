"""Trial titres-forts: heavier titles (700) at unchanged sizes. Stages (default: all, in order):
  lists[:section]  every card title of every list page (hash navigation) at 1440/390/320, FR/EN/AR, light/dark,
                   grid and list views: line counts, 3-line clamp truncation, card heights, overflow, header pixels
  details          detail titles and section headings of project, article and profile tabs (incl. a 1280 x 720 window)
  sweep            detail title (h1) of the first 12 entries of each section at 1440, 1280 x 720, 390 and 320 (FR)
                   and 390 (AR): line counts, own overflow, sidebar identity height and detail-scroll density
  extras           scope (only targeted titles change, only weight/tracking, family in Arabic only), real faces,
                   targets absent from the demo data, runtime re-render, arrival page, and the combination with
                   lisibilite-textes and titres-marque
  fallback         Arabic titles at 700 with the baseline family: the regular face stays (why Noto Sans Arabic is named)
  review           independent cross-check on review: text-range line counts on the same DOM (sheet off/on), header pixels, runtime switch
  echelle          combination with echelle-unifiee (read only; run on demand, not part of the default stages)
Run: python3 -I studies/design-review-studies/checks/titres-forts/check.py [lists|lists:projects|details|sweep|extras|fallback|review|echelle]"""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, image_diff
from PIL import Image

ID = 'titres-forts'
COMBO = ['lisibilite-textes', 'titres-marque', 'titres-forts']
W = (1280, 720, False)  # short desktop window: detail-scroll may pick a compact density there
PREFS = 'horizon-design-review-studies-20261014-content-preferences-v2'
# Same targets as essai.css (without the :root #app prefix).
SEL = (':is(#project-detail,#journal-detail) .cp-project-heading>h1,#profile-detail .cp-profile-heading>h1,.cp-card .cp-card-copy>h2,'
       '.cp-profile-related-copy>h3,:is(.cp-project-block,.cp-profile-overview-block,.cp-profile-campus-history,.cp-project-trial-mode)>h3,'
       '.cp-profile-milestone-copy>h3,.cp-profile-story>:is(h3,h4)')
SELJ = json.dumps(SEL)
# Visible targeted titles: lines shown, natural lines (behind the 3-line clamp of project/journal cards), own overflow.
# A word is "broken" when its glyphs sit on several lines (overflow-wrap:anywhere splitting a word wider than its column).
TITLES_JS = r'''(()=>{const broken=el=>{const out=[],walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;while((node=walk.nextNode())){const re=/\S+/g;let m;
  while((m=re.exec(node.textContent))){const range=document.createRange();range.setStart(node,m.index);range.setEnd(node,m.index+m[0].length);
   if(new Set([...range.getClientRects()].filter(x=>x.width>.5).map(x=>Math.round(x.top))).size>1)out.push(m[0])}}return out};
 const out=[];for(const e of document.querySelectorAll(%s)){const r=e.getBoundingClientRect();if(r.width<2||r.height<2||!e.closest('#app'))continue;
 const s=getComputedStyle(e),lh=parseFloat(s.lineHeight)||parseFloat(s.fontSize)*1.2,link=e.querySelector('.cp-card-title-link'),clamped=Boolean(link&&getComputedStyle(link).display.includes('box'));
 const lines=Math.round(r.height/lh),natural=clamped?Math.round(link.scrollHeight/lh):lines;
 const kind=e.tagName==='H1'?'titre':e.matches('.cp-card h2,.cp-profile-related-copy>h3')?'carte':'section';
 out.push({kind,t:e.textContent.trim().replace(/\s+/g,' ').slice(0,60),fs:s.fontSize,fw:s.fontWeight,ls:s.letterSpacing,ff:s.fontFamily,synth:s.fontSynthesisWeight,
  style:s.fontStyle,tt:s.textTransform,w:Math.round(r.width),lines,natural,clamped,truncated:natural>lines,ownOverflow:e.scrollWidth>e.clientWidth+1,broken:broken(e)})}
 const cards=[...document.querySelectorAll('#content-list>.cp-card')].filter(c=>c.getClientRects().length).map(c=>Math.round(c.getBoundingClientRect().height));
 const list=document.querySelector('#content-list'),cur=document.querySelector('#content-pagination [aria-current]');
 const identity=[...document.querySelectorAll(':is(#project-detail,#journal-detail,#profile-detail):not([hidden]) :is(.cp-project-sidebar,.cp-profile-sidebar)>header')].map(h=>Math.round(h.getBoundingClientRect().height));
 return {titles:out,cards,listHeight:list&&list.getClientRects().length?Math.round(list.getBoundingClientRect().height):null,
  density:[...document.querySelectorAll('[data-detail-density]')].map(e=>e.dataset.detailDensity),identity,
  page:cur?Number(cur.dataset.page):null,pages:Math.max(1,...[...document.querySelectorAll('#content-pagination [data-page]')].map(a=>Number(a.dataset.page)||1)),
  view:document.getElementById('content-index')?.dataset.view||null,
  overflow:document.documentElement.scrollWidth>innerWidth+1,headerBottom:Math.round(document.querySelector('.header').getBoundingClientRect().bottom)}})()''' % SELJ
# Every element's typography, to prove that only targeted titles change and that no size changes.
STYLES_JS = r'''(()=>[...document.body.querySelectorAll('*')].map(e=>{const s=getComputedStyle(e);return[e.tagName,s.fontWeight,s.letterSpacing,s.fontFamily,s.fontSize,s.lineHeight,s.fontStyle,s.textTransform,s.color,s.display,Boolean(e.closest(%s)),Boolean(e.closest('.cp-card .cp-card-copy>h2,.cp-profile-related-copy>h3'))]}))()''' % SELJ
TOGGLE_JS = '(()=>{for(const l of document.querySelectorAll("link[data-essai=\\"titres-forts\\"]"))l.disabled=%s;return document.querySelectorAll("link[data-essai=\\"titres-forts\\"]").length})()'
HIDDEN_JS = r'''(()=>[...document.querySelectorAll('#section-title,#project-section-title,#journal-section-title,#profile-section-title')].map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{id:e.id,w:Math.round(r.width),h:Math.round(r.height),clip:s.clipPath,cls:e.className}}))()'''

SECTIONS = ('projects', 'people', 'journal')
LISTS = [(sec, vp, lang, 'light', 'grid') for sec in SECTIONS for vp in (D, M, S) for lang in ('fr', 'en', 'ar')]
LISTS += [('projects', D, 'fr', 'dark', 'grid'), ('people', M, 'ar', 'dark', 'grid'), ('journal', S, 'en', 'dark', 'grid')]
LISTS += [('projects', D, 'fr', 'light', 'list'), ('people', M, 'fr', 'light', 'list'), ('journal', S, 'ar', 'light', 'list')]
LIST_SHOTS = {('projects', D, 'fr', 'light', 'grid'): 'ordinateur', ('journal', M, 'fr', 'light', 'grid'): 'mobile', ('projects', S, 'fr', 'light', 'grid'): 'petit',
              ('projects', M, 'ar', 'light', 'grid'): 'ar-mobile', ('projects', D, 'fr', 'dark', 'grid'): 'sombre-ordinateur', ('people', M, 'ar', 'dark', 'grid'): 'ar-sombre-mobile',
              ('people', D, 'en', 'light', 'grid'): 'profils-ordinateur-en'}
P, J, R = 'projects/ft-transcendence-building-together', 'journal/journal-an-evening-debugging', 'people/profile-leila-mansour'
DROUTES = [P + '?tab=overview', P + '?tab=implementation', J + '?tab=article', R + '?tab=overview', R + '?tab=journey', R + '?tab=projects']
DETAILS = [(r, vp, 'fr', 'light') for r in DROUTES for vp in (D, M, S)]
DETAILS += [(r, S, 'en', 'light') for r in (P + '?tab=overview', J + '?tab=article', R + '?tab=overview')]
DETAILS += [(r, M, 'ar', 'light') for r in (P + '?tab=overview', J + '?tab=article', R + '?tab=overview', R + '?tab=journey')]
DETAILS += [(R + '?tab=overview', D, 'fr', 'dark'), (J + '?tab=article', M, 'en', 'dark'), (R + '?tab=contribution', D, 'ar', 'dark')]
DETAILS += [(r, W, 'fr', 'light') for r in (P + '?tab=overview', J + '?tab=article', R + '?tab=overview')]
DETAIL_SHOTS = {(P + '?tab=overview', D, 'fr', 'light'): 'fiche-ordinateur', (R + '?tab=overview', D, 'fr', 'light'): 'profil-ordinateur',
                (R + '?tab=journey', D, 'fr', 'light'): 'parcours-ordinateur', (J + '?tab=article', M, 'fr', 'light'): 'article-mobile',
                (P + '?tab=overview', M, 'ar', 'light'): 'fiche-ar-mobile', (R + '?tab=overview', D, 'fr', 'dark'): 'sombre-profil-ordinateur',
                (P + '?tab=overview', S, 'fr', 'light'): 'fiche-petit', (P + '?tab=overview', W, 'fr', 'light'): 'fiche-fenetre-basse'}
SWEEP = [(sec, vp, lang) for sec in SECTIONS for vp, lang in ((D, 'fr'), (W, 'fr'), (M, 'fr'), (S, 'fr'), (M, 'ar'))]
DETAIL_TITLE = {'projects': '#project-title', 'journal': '#journal-title', 'people': '#profile-title'}


def vname(vp): return {D: '1440', M: '390', S: '320', W: '1280x720'}[vp]


def new_session():
    # Pages kept in the back/forward cache stay alive (one renderer, ~350 MB each) until the 2.6 GB cap kills
    # Chrome; an empty unload listener, added by this check only, makes them ineligible for that cache.
    s = Session(HERE)
    s.c.call('Page.addScriptToEvaluateOnNewDocument', {'source': 'addEventListener("unload",()=>{})'})
    return s


def chunked(items, work, size):
    """work(session, item) over items, with a fresh Chrome every `size` items; a crashed chunk is retried once."""
    out = []
    for start in range(0, len(items), size):
        chunk = items[start:start + size]
        for attempt in (1, 2):
            s = new_session(); part = []
            try:
                for item in chunk: part.append(work(s, item))
                break
            except (RuntimeError, TimeoutError, OSError) as error:  # OSError: Chrome killed (memory cap or guard)
                if attempt == 2: raise
                print('chunk retried after', error, flush=True)
            finally:
                s.close()
        out.extend(part)
    return out


def fresh(s, route, essais, theme='light', lang='fr', vp=D, page='content-preview.html', settle=.6):
    """Reload even when only the hash differs from the current URL."""
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.15)
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True, settle=settle, page=page)


def set_view(s, view):
    s.js('(()=>{localStorage.setItem(%s,JSON.stringify({version:2,layoutBySection:{projects:%s,people:%s,journal:%s}}));return true})()' % ((json.dumps(PREFS),) + (json.dumps(view),) * 3))


def go(s, hash_, ready):
    s.js('(()=>{location.hash=%s;return true})()' % json.dumps(hash_))
    ok = s.wait(ready, 10); time.sleep(.3); return ok


def header_crop(path, vp, bottom, name):
    scale = 2 if vp[2] else 1
    Image.open(path).crop((0, 0, vp[0] * scale, bottom * scale)).save(HERE / name)


def compare(before, after):
    """Titles are paired by DOM order (same data on both sides)."""
    a, b = before['titles'], after['titles']
    by_kind = {}
    for x, y in zip(a, b):
        k = by_kind.setdefault(x['kind'], {'n': 0, 'plus': 0, 'moins': 0})
        k['n'] += 1; k['plus'] += y['natural'] > x['natural']; k['moins'] += y['natural'] < x['natural']
    return {'n': len(a), 'sameTexts': [x['t'] for x in a] == [y['t'] for y in b],
            'changes': [{'kind': x['kind'], 't': x['t'], 'w': x['w'], 'avant': x['natural'], 'apres': y['natural']} for x, y in zip(a, b) if x['natural'] != y['natural']],
            'byKind': by_kind, 'sizesUnchanged': all(x['fs'] == y['fs'] for x, y in zip(a, b)),
            'styleCaseUnchanged': all(x['style'] == y['style'] == 'normal' and x['tt'] == y['tt'] == 'none' for x, y in zip(a, b)),
            'weights': sorted({y['fw'] for y in b}), 'weightsBefore': sorted({x['fw'] for x in a}), 'synthesis': sorted({y['synth'] for y in b}),
            'families': sorted({y['ff'] for y in b}), 'familiesBefore': sorted({x['ff'] for x in a}),
            'truncated': [sum(t['truncated'] for t in a), sum(t['truncated'] for t in b)],
            'newlyTruncated': [y['t'] for x, y in zip(a, b) if y['truncated'] and not x['truncated']],
            'ownOverflow': [sum(t['ownOverflow'] for t in a), sum(t['ownOverflow'] for t in b)],
            'broken': [sum(len(t['broken']) for t in a), sum(len(t['broken']) for t in b)],
            'newlyBroken': [(y['t'][:40], w) for x, y in zip(a, b) for w in y['broken'] if w not in x['broken']],
            'cardsTaller': sum(1 for x, y in zip(before['cards'], after['cards']) if y > x), 'cardDelta': max([y - x for x, y in zip(before['cards'], after['cards'])] or [0]),
            'listHeight': [before['listHeight'], after['listHeight']], 'density': [before['density'], after['density']], 'identity': [before['identity'], after['identity']],
            'overflow': [before['overflow'], after['overflow']]}


def merge(rows):
    """Sum per-page comparisons into one row."""
    out = {'n': 0, 'sameTexts': True, 'changes': [], 'byKind': {}, 'sizesUnchanged': True, 'styleCaseUnchanged': True, 'weights': set(), 'weightsBefore': set(),
           'synthesis': set(), 'families': set(), 'familiesBefore': set(), 'truncated': [0, 0], 'newlyTruncated': [], 'ownOverflow': [0, 0], 'broken': [0, 0], 'newlyBroken': [], 'cardsTaller': 0, 'cardDelta': 0,
           'overflow': [False, False], 'pages': len(rows)}
    for r in rows:
        out['n'] += r['n']; out['sameTexts'] &= r['sameTexts']; out['changes'] += r['changes']; out['sizesUnchanged'] &= r['sizesUnchanged']
        out['styleCaseUnchanged'] &= r['styleCaseUnchanged']; out['newlyTruncated'] += r['newlyTruncated']; out['newlyBroken'] += r['newlyBroken']
        for key in ('weights', 'weightsBefore', 'synthesis', 'families', 'familiesBefore'): out[key] |= set(r[key])
        for i in (0, 1):
            out['truncated'][i] += r['truncated'][i]; out['ownOverflow'][i] += r['ownOverflow'][i]; out['broken'][i] += r['broken'][i]; out['overflow'][i] |= r['overflow'][i]
        out['cardsTaller'] += r['cardsTaller']; out['cardDelta'] = max(out['cardDelta'], r['cardDelta'])
        for kind, k in r['byKind'].items():
            agg = out['byKind'].setdefault(kind, {'n': 0, 'plus': 0, 'moins': 0})
            for key in agg: agg[key] += k[key]
    for key in ('weights', 'weightsBefore', 'synthesis', 'families', 'familiesBefore'): out[key] = sorted(out[key])
    return out


def list_case(s, case):
    sec, vp, lang, theme, view = case
    sides, vue = {}, LIST_SHOTS.get(case)
    if getattr(s, 'view', 'grid') != view:
        fresh(s, sec, [], theme, lang, vp, settle=.2); set_view(s, view); s.view = view
    for label, essais in (('avant', []), ('apres', [ID])):
        fresh(s, sec, essais, theme, lang, vp)
        first = s.js(TITLES_JS); first['errors'] = s.errors(); pages = [first]
        if vue:
            header_crop(s.shot(f'{label}-{vue}'), vp, first['headerBottom'], f'_head-{label}.png')
        for number in range(2, first['pages'] + 1):
            ok = go(s, f'#{sec}?page={number}', f'document.querySelector("#content-pagination [aria-current]")?.dataset.page==="{number}"&&document.querySelector("#content-list>.cp-card")!==null')
            state = s.js(TITLES_JS); state['ready'] = ok; pages.append(state)
        sides[label] = {'pages': pages, 'errors': s.errors(), 'view': first['view']}
    rows = [compare(x, y) for x, y in zip(sides['avant']['pages'], sides['apres']['pages'])]
    row = {'section': sec, 'viewport': vname(vp), 'lang': lang, 'theme': theme, 'requestedView': view, 'view': [sides['avant']['view'], sides['apres']['view']]} | merge(rows)
    row['pagesReady'] = all(p.get('ready', True) for side in sides.values() for p in side['pages'])
    row['samePages'] = len(sides['avant']['pages']) == len(sides['apres']['pages'])
    row['errors'] = [sides['avant']['errors'], sides['apres']['errors']]
    if vue:
        row['vue'] = vue; row['headerDiff'] = round(image_diff(HERE / '_head-avant.png', HERE / '_head-apres.png'), 5)
    s.record(f'lists {sec} {vname(vp)} {lang} {theme} {view}', {k: row[k] for k in ('n', 'pages', 'byKind', 'truncated', 'newlyTruncated', 'broken', 'newlyBroken', 'overflow', 'weights', 'cardsTaller')})
    return row


def detail_case(s, case):
    route, vp, lang, theme = case
    sides, vue = {}, DETAIL_SHOTS.get(case)
    for label, essais in (('avant', []), ('apres', [ID])):
        fresh(s, route, essais, theme, lang, vp)
        state = s.js(TITLES_JS); state['errors'] = s.errors(); sides[label] = state
        if vue: header_crop(s.shot(f'{label}-{vue}'), vp, state['headerBottom'], f'_head-{label}.png')
    row = {'route': route, 'viewport': vname(vp), 'lang': lang, 'theme': theme} | compare(sides['avant'], sides['apres'])
    row['errors'] = [sides['avant']['errors'], sides['apres']['errors']]
    row['titles'] = [(x['kind'], x['t'][:40], x['fs'], x['natural'], y['natural']) for x, y in zip(sides['avant']['titles'], sides['apres']['titles'])]
    if vue:
        row['vue'] = vue; row['headerDiff'] = round(image_diff(HERE / '_head-avant.png', HERE / '_head-apres.png'), 5)
    s.record(f'details {route} {vname(vp)} {lang} {theme}', {k: row[k] for k in ('n', 'byKind', 'truncated', 'broken', 'newlyBroken', 'overflow', 'weights', 'density', 'identity')} | {'changes': [(c['t'][:20], c['avant'], c['apres']) for c in row['changes']]})
    return row


def sweep_case(s, case):
    sec, vp, lang = case
    sel = DETAIL_TITLE[sec]
    probe = r'''(()=>{const broken=el=>{const out=[],walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;while((node=walk.nextNode())){const re=/\S+/g;let m;
  while((m=re.exec(node.textContent))){const range=document.createRange();range.setStart(node,m.index);range.setEnd(node,m.index+m[0].length);
   if(new Set([...range.getClientRects()].filter(x=>x.width>.5).map(x=>Math.round(x.top))).size>1)out.push(m[0])}}return out};
     const h=document.querySelector(%s),side=h&&h.closest('aside,.cp-profile-sidebar'),s=h&&getComputedStyle(h),lh=s?parseFloat(s.lineHeight)||parseFloat(s.fontSize)*1.2:1,r=h?h.getBoundingClientRect():null,
     head=h&&h.closest('header');return h&&r.height?{t:h.textContent.trim().slice(0,60),fs:s.fontSize,fw:s.fontWeight,lines:Math.round(r.height/lh),own:h.scrollWidth>h.clientWidth+1,broken:broken(h),
     identity:head?Math.round(head.getBoundingClientRect().height):null,density:side?.dataset.detailDensity||null,overflow:document.documentElement.scrollWidth>innerWidth+1}:null})()''' % json.dumps(sel)
    sides = {}
    for label, essais in (('avant', []), ('apres', [ID])):
        fresh(s, sec, essais, 'light', lang, vp)
        hrefs = s.js('[...document.querySelectorAll("#content-list>.cp-card :is(.cp-card-title-link,.cp-card-open)")].map(a=>a.getAttribute("href")).filter(Boolean).slice(0,12)')
        rows, prev = [], None
        for href in hrefs:
            ok = go(s, href, f'(()=>{{const h=document.querySelector({json.dumps(sel)});return Boolean(h&&h.getClientRects().length&&h.textContent.trim()&&h.textContent!=={json.dumps(prev)})}})()')
            state = s.js(probe) or {}; state['ready'] = ok; prev = s.js(f'document.querySelector({json.dumps(sel)})?.textContent||null'); rows.append(state)
        sides[label] = {'hrefs': hrefs, 'rows': rows, 'errors': s.errors()}
    a, b = sides['avant']['rows'], sides['apres']['rows']
    pairs = list(zip(a, b))
    row = {'section': sec, 'viewport': vname(vp), 'lang': lang, 'n': len(pairs), 'sameEntries': sides['avant']['hrefs'] == sides['apres']['hrefs'],
           'ready': all(x.get('ready') and y.get('ready') for x, y in pairs),
           'linesPlus': [(x['t'][:40], x['lines'], y['lines']) for x, y in pairs if y.get('lines', 0) > x.get('lines', 0)],
           'linesMinus': [(x['t'][:40], x['lines'], y['lines']) for x, y in pairs if y.get('lines', 0) < x.get('lines', 0)],
           'lineHistogram': [sorted({x.get('lines') for x in a}), sorted({y.get('lines') for y in b})],
           'sizesUnchanged': all(x.get('fs') == y.get('fs') for x, y in pairs), 'weights': [sorted({x.get('fw') for x in a}), sorted({y.get('fw') for y in b})],
           'densityChanged': [(x['t'][:40], x['density'], y['density']) for x, y in pairs if x.get('density') != y.get('density')],
           'densities': [sorted({str(x.get('density')) for x in a}), sorted({str(y.get('density')) for y in b})],
           'identityDeltaMax': max([(y.get('identity') or 0) - (x.get('identity') or 0) for x, y in pairs] or [0]),
           'ownOverflow': [sum(bool(x.get('own')) for x in a), sum(bool(y.get('own')) for y in b)],
           'newlyBroken': [(y['t'][:40], w) for x, y in pairs for w in y.get('broken', []) if w not in x.get('broken', [])],
           'overflow': [any(x.get('overflow') for x in a), any(y.get('overflow') for y in b)], 'errors': [sides['avant']['errors'], sides['apres']['errors']]}
    s.record(f'sweep {sec} {vname(vp)} {lang}', {k: row[k] for k in ('n', 'ready', 'linesPlus', 'newlyBroken', 'densityChanged', 'densities', 'identityDeltaMax', 'overflow')})
    return row


def platform_fonts(s, selector):
    s.c.call('DOM.enable'); s.c.call('CSS.enable')
    root = s.c.call('DOM.getDocument', {'depth': 0})['root']['nodeId']
    node = s.c.call('DOM.querySelector', {'nodeId': root, 'selector': selector})['nodeId']
    if not node: return None
    return [{k: f.get(k) for k in ('familyName', 'postScriptName', 'isCustomFont', 'glyphCount')} for f in s.c.call('CSS.getPlatformFontsForNode', {'nodeId': node})['fonts']]


def scope_case(s, case):
    route, vp, lang = case
    fresh(s, route, [ID], 'light', lang, vp)
    if route.endswith('tab=test'):
        # The demo projects have no repository: seed one (session storage of this tab) so the repository heading renders.
        s.js('(()=>{sessionStorage.setItem("horizon-design-review-studies-20261014-project-repository-v1:ft-transcendence-building-together",JSON.stringify({url:"https://example.org/ft-transcendence",instructions:{fr:"Lancer make puis ouvrir le navigateur.",en:"Run make, then open the browser.",ar:"شغّل make ثم افتح المتصفح."}}));return true})()')
        fresh(s, route, [ID], 'light', lang, vp)
    on = s.js(STYLES_JS, 20); hidden_on = s.js(HIDDEN_JS)
    links = s.js(TOGGLE_JS % 'true'); time.sleep(.4)
    off = s.js(STYLES_JS, 20); hidden_off = s.js(HIDDEN_JS)
    s.js(TOGGLE_JS % 'false'); time.sleep(.2)
    # [tag, weight, tracking, family, size, line height, style, case, colour, display, inside a title]
    changed = [i for i, (x, y) in enumerate(zip(on, off)) if x[:10] != y[:10]]
    row = {'route': route, 'viewport': vname(vp), 'lang': lang, 'links': links, 'elements': len(on), 'sameCount': len(on) == len(off), 'changed': len(changed),
           'changedOutsideTitles': [on[i][:10] for i in changed if not on[i][10]][:5], 'changedOutsideCount': sum(1 for i in changed if not on[i][10]),
           'otherCount': sum(1 for i in changed if on[i][4:10] != off[i][4:10]), 'otherSamples': [on[i][:10] for i in changed if on[i][4:10] != off[i][4:10]][:5],
           'familyChanged': sum(1 for i in changed if on[i][3] != off[i][3]), 'trackingOutsideCardsInArabic': sum(1 for i in changed if lang == 'ar' and on[i][2] != off[i][2] and not on[i][11]), 'kinds': sorted({(on[i][0],) + tuple(off[i][1:3]) + tuple(on[i][1:3]) for i in changed})[:10],
           'emptyStateWeights': s.js('[...document.querySelectorAll(".cp-comments-empty h3,.cp-project-trial-empty h3,.cp-project-trial-mode>h4,.content-empty h2")].map(e=>getComputedStyle(e).fontWeight)'),
           'repositoryHeading': s.js('(()=>{const h=document.querySelector(".cp-project-trial-mode>h3");return h?[h.textContent,getComputedStyle(h).fontWeight]:null})()'),
           'hiddenTitles': [hidden_off, hidden_on], 'errors': s.errors()}
    s.record('scope ' + route, {k: row[k] for k in ('elements', 'changed', 'changedOutsideCount', 'otherCount', 'familyChanged', 'emptyStateWeights', 'repositoryHeading')})
    return row


def stage_extras():
    out = {}
    out['scope'] = chunked([('projects', D, 'fr'), ('people', D, 'fr'), ('journal', M, 'en'), (P + '?tab=overview', D, 'fr'), (P + '?tab=test', D, 'fr'),
                            (P + '?tab=comments', D, 'fr'), (P + '?tab=media', M, 'fr'), (R + '?tab=overview', M, 'fr'), (R + '?tab=journey', D, 'fr'),
                            (J + '?tab=article', S, 'ar'), (R + '?tab=overview', M, 'ar')], scope_case, 4)

    def fonts_case(s, item):
        key, route, vp, lang, sel = item; res = {}
        for label, essais in (('avant', []), ('apres', [ID])):
            fresh(s, route, essais, 'light', lang, vp, settle=.5)
            res[label] = {'fonts': platform_fonts(s, sel), 'style': s.style(sel, ('fontWeight', 'letterSpacing', 'fontSynthesisWeight', 'fontFamily'))}
        s.record('fonts ' + key, res); return key, res
    out['fonts'] = dict(chunked([('carte-latin', 'projects', D, 'fr', '#content-list .cp-card h2'), ('titre-latin', P, D, 'fr', '#project-title'),
                                 ('carte-arabe', 'projects', M, 'ar', '#content-list .cp-card h2'), ('nom-arabe', R + '?tab=overview', M, 'ar', '#profile-title'),
                                 ('section-arabe', R + '?tab=overview', M, 'ar', '.cp-profile-overview-block>h3')], fonts_case, 5))

    def misc(s, _):
        res = {}
        # Targets absent from the demo data: a profile campus history (no demo profile changed campus).
        fresh(s, R + '?tab=journey', [ID], 'light', 'fr', D)
        res['campusHistorySelector'] = s.js('(()=>{const sec=document.createElement("section");sec.className="cp-profile-campus-history";const h=document.createElement("h3");h.textContent="Test";sec.append(h);document.querySelector("#profile-detail .cp-profile-active-section").append(sec);const w=getComputedStyle(h).fontWeight;sec.remove();return w})()')
        # Card tracking in Arabic: Chrome leaves joined Arabic letters unspaced, so only Latin words tighten.
        fresh(s, 'projects', [ID], 'light', 'ar', S)
        res['arabicTracking'] = s.js(r'''(()=>{const h=document.querySelector('#content-list .cp-card h2'),out={};
         for(const [name,text] of [['arabe','خلف سطر الأوامر'],['latin','ft_transcendence']]){const sp=document.createElement('span');sp.textContent=text;sp.style.cssText='white-space:nowrap;display:inline-block';h.append(sp);
          const w={};for(const ls of ['0px','-0.035em','-0.055em']){sp.style.letterSpacing=ls;w[ls]=+sp.getBoundingClientRect().width.toFixed(2)}sp.remove();out[name]=w}
         return {fontSize:getComputedStyle(h).fontSize,column:h.clientWidth,widths:out}})()''')
        s.record('arabicTracking', res['arabicTracking'])
        # Runtime: the baseline re-renders on navigation, language and theme; the CSS must follow.
        probe = r'''(()=>{const t=[...document.querySelectorAll(%s)].filter(e=>e.getClientRects().length&&e.closest('#app'));return{lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,n:t.length,weights:[...new Set(t.map(e=>getComputedStyle(e).fontWeight))],families:[...new Set(t.map(e=>getComputedStyle(e).fontFamily))],tracking:[...new Set(t.slice(0,4).map(e=>getComputedStyle(e).letterSpacing))]}})()''' % SELJ
        runtime = []
        fresh(s, 'projects', [ID], 'light', 'fr', D)
        runtime.append({'etape': 'liste fr clair'} | s.js(probe))
        go(s, '#people/profile-leila-mansour?tab=overview', 'Boolean(document.querySelector("#profile-title")?.getClientRects().length)')
        runtime.append({'etape': 'fiche profil'} | s.js(probe))
        s.settings('ar', 'dark'); s.wait('document.documentElement.lang==="ar"', 10); time.sleep(.8)
        step = {'etape': 'fiche profil ar sombre'} | s.js(probe)
        on = s.js(STYLES_JS, 20); s.js(TOGGLE_JS % 'true'); time.sleep(.3); off = s.js(STYLES_JS, 20); s.js(TOGGLE_JS % 'false')
        # In Arabic only card titles (where the baseline applies its tracking too) may change their tracking.
        step['arabicTrackingCardsOnly'] = len(on) == len(off) and all(x[2] == y[2] or x[11] for x, y in zip(on, off))
        step['arabicTrackingChangedOnCards'] = sum(1 for x, y in zip(on, off) if x[2] != y[2] and x[11])
        step['arabicFamilyOnTitlesOnly'] = len(on) == len(off) and all(x[3] == y[3] or x[10] for x, y in zip(on, off))
        runtime.append(step)
        go(s, '#journal', 'Boolean(document.querySelector("#content-list .cp-card h2"))')
        runtime.append({'etape': 'liste chroniques ar sombre'} | s.js(probe))
        s.settings('en', 'light'); s.wait('document.documentElement.lang==="en"', 10); time.sleep(.8)
        runtime.append({'etape': 'liste chroniques en clair'} | s.js(probe) | {'errors': s.errors()})
        res['runtime'] = runtime
        for step in runtime: s.record('runtime', step)
        # Arrival page: the trial (and its empty early.js) loads without error and leaves the arrival alone.
        arrival = {}
        for label, essais in (('avant', []), ('apres', [ID])):
            s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.15)
            s.open('', essais=essais, viewport=D, block_globe=True, page='index.html', settle=1.0)
            shot = s.shot(f'_arrivee-{label}')
            arrival[label] = {'errors': s.errors(), 'early': s.js('[...document.querySelectorAll("script[data-essai]")].map(x=>x.getAttribute("src"))'), 'ready': s.js('document.documentElement.dataset.essaisReady||null')}
        arrival['diff'] = round(image_diff(HERE / '_arrivee-avant.png', HERE / '_arrivee-apres.png'), 5)
        for f in HERE.glob('_arrivee-*.png'): f.unlink()
        res['arrival'] = arrival; s.record('arrival', arrival)
        return res
    out |= chunked([None], misc, 1)[0]

    def combo_case(s, item):
        vue, route, vp, lang, theme = item
        js = r'''(()=>{const w=getComputedStyle(document.getElementById('brand-wordmark')),meta=[...document.querySelectorAll('#app .cp-meta')].filter(e=>e.getClientRects().length).map(e=>parseFloat(getComputedStyle(e).fontSize));return{wordmark:w.fontStyle+' '+w.fontWeight,metaMin:meta.length?Math.min(...meta):null,sheets:[...document.querySelectorAll('link[data-essai]')].map(l=>l.dataset.essai)}})()'''
        pair = {}
        for label, essais in (('base', []), ('seul', [ID]), ('combine', COMBO)):
            fresh(s, route, essais, theme, lang, vp)
            st = s.js(TITLES_JS); st['errors'] = s.errors(); st |= s.js(js); pair[label] = st
            if label == 'combine' and vue in ('combine-ordinateur', 'combine-ar-sombre-mobile', 'combine-profil-ordinateur'): s.shot(f'apres-{vue}')
            if label == 'base' and vue in ('combine-ordinateur', 'combine-ar-sombre-mobile', 'combine-profil-ordinateur'): s.shot(f'avant-{vue}')
        row = {'vue': vue, 'route': route, 'viewport': vname(vp), 'lang': lang, 'theme': theme} | compare(pair['seul'], pair['combine'])
        row['vsBase'] = {k: v for k, v in compare(pair['base'], pair['combine']).items() if k in ('n', 'byKind', 'truncated', 'newlyTruncated', 'overflow', 'sizesUnchanged', 'cardsTaller')}
        row['wordmark'] = [pair['seul']['wordmark'], pair['combine']['wordmark']]; row['metaMin'] = [pair['seul']['metaMin'], pair['combine']['metaMin']]
        row['sheets'] = pair['combine']['sheets']; row['errors'] = [pair['seul']['errors'], pair['combine']['errors']]
        row['titleSizesSeul'] = sorted({t['fs'] for t in pair['seul']['titles']}); row['titleSizesCombine'] = sorted({t['fs'] for t in pair['combine']['titles']})
        s.record('combo ' + vue, {k: row[k] for k in ('weights', 'wordmark', 'metaMin', 'overflow', 'sizesUnchanged', 'sheets', 'truncated')} | {'changes': [(c['t'][:18], c['avant'], c['apres']) for c in row['changes']]})
        return row
    out['combo'] = chunked([('combine-ordinateur', 'projects', D, 'fr', 'light'), ('combine-petit', 'projects', S, 'fr', 'light'), ('combine-profil-ordinateur', R + '?tab=overview', D, 'fr', 'light'),
                            ('combine-ar-sombre-mobile', 'people', M, 'ar', 'dark'), ('combine-mobile-en', 'journal', M, 'en', 'light'), ('combine-fiche-petit', P + '?tab=overview', S, 'fr', 'light')], combo_case, 2)
    return out


def stage_fallback():
    """Why essai.css names Noto Sans Arabic in Arabic: with the baseline family alone, the Arabic glyphs
    of a 700 title still come from the regular face (system fallback), so the weight would not show."""
    def case(s, item):
        route, sel = item; res = {}
        fresh(s, route, [ID], 'light', 'ar', M, settle=.5)
        res['named'] = {'fonts': platform_fonts(s, sel), 'style': s.style(sel, ('fontWeight', 'fontFamily', 'fontSynthesisWeight'))}
        s.js('(()=>{const h=document.querySelector(%s);h.style.fontFamily="Jost, sans-serif";return true})()' % json.dumps(sel)); time.sleep(.4)
        res['baselineFamily'] = {'fonts': platform_fonts(s, sel), 'style': s.style(sel, ('fontWeight', 'fontFamily', 'fontSynthesisWeight'))}
        res['errors'] = s.errors(); s.record('fallback ' + sel, res); return res
    return chunked([('projects', '#content-list .cp-card h2'), (R + '?tab=overview', '#profile-title')], case, 2)


def stage_review():
    """Independent cross-check added on review (14 Oct 2026, evening): same DOM with the trial sheet off then on,
    line counts from the text range (distinct line tops, clamped lines included), card heights, overflow, header
    pixels, then a language and theme switch without reload."""
    lines_js = r"""(()=>{const out=[];for(const e of document.querySelectorAll(%s)){if(!e.getClientRects().length||!e.closest('#app'))continue;const r=e.getBoundingClientRect();if(r.width<2||r.height<2)continue;
     const range=document.createRange();range.selectNodeContents(e);const tops=[];for(const x of range.getClientRects()){if(x.width<.5)continue;if(!tops.some(t=>Math.abs(t-x.top)<4))tops.push(x.top)}
     const s=getComputedStyle(e);out.push([e.textContent.trim().slice(0,40),tops.length,s.fontSize,s.fontWeight,s.fontFamily,e.scrollWidth>e.clientWidth+1])}
     const cards=[...document.querySelectorAll('#content-list>.cp-card')].filter(c=>c.getClientRects().length).map(c=>Math.round(c.getBoundingClientRect().height));
     return{titles:out,cards,overflow:document.documentElement.scrollWidth>innerWidth+1,headerBottom:Math.round(document.querySelector('.header').getBoundingClientRect().bottom)}})()""" % SELJ
    cases = [(sec, vp, lang, 'light') for sec in SECTIONS for vp, lang in ((D, 'fr'), (M, 'fr'), (S, 'fr'), (M, 'ar'), (S, 'ar'))]
    cases += [('projects', M, 'en', 'dark'), ('people', D, 'ar', 'dark'), (P + '?tab=overview', M, 'fr', 'light'), (P + '?tab=overview', D, 'fr', 'light'),
              (R + '?tab=overview', D, 'fr', 'light'), (R + '?tab=journey', D, 'fr', 'dark'), (J + '?tab=article', M, 'ar', 'light'), (P + '?tab=overview', S, 'ar', 'light')]

    def case(s, item):
        route, vp, lang, theme = item
        fresh(s, route, [ID], theme, lang, vp)
        k = 2 if vp[2] else 1
        s.js(TOGGLE_JS % 'true'); time.sleep(.5); a = s.js(lines_js); shot_a = s.shot('_rev-a')
        s.js(TOGGLE_JS % 'false'); time.sleep(.5); b = s.js(lines_js); shot_b = s.shot('_rev-b')
        for src, dst in ((shot_a, '_rev-ha.png'), (shot_b, '_rev-hb.png')):
            Image.open(src).crop((0, 0, vp[0] * k, a['headerBottom'] * k)).save(HERE / dst)
        pairs = list(zip(a['titles'], b['titles']))
        row = {'route': route, 'viewport': vname(vp), 'lang': lang, 'theme': theme, 'n': len(pairs), 'sameTitles': [x[0] for x in a['titles']] == [y[0] for y in b['titles']],
               'plus': [(x[0], x[1], y[1]) for x, y in pairs if y[1] > x[1]], 'minus': [(x[0], x[1], y[1]) for x, y in pairs if y[1] < x[1]],
               'sizesUnchanged': all(x[2] == y[2] for x, y in pairs), 'weights': [sorted({x[3] for x, _ in pairs}), sorted({y[3] for _, y in pairs})],
               'families': [sorted({x[4] for x, _ in pairs}), sorted({y[4] for _, y in pairs})], 'ownOverflow': [sum(x[5] for x, _ in pairs), sum(y[5] for _, y in pairs)],
               'cardsTaller': sum(1 for x, y in zip(a['cards'], b['cards']) if y > x), 'cardDeltaMax': max([y - x for x, y in zip(a['cards'], b['cards'])] or [0]),
               'overflow': [a['overflow'], b['overflow']], 'headerDiff': round(image_diff(HERE / '_rev-ha.png', HERE / '_rev-hb.png'), 5), 'errors': s.errors()}
        s.record(f'review {route} {vname(vp)} {lang} {theme}', {x: row[x] for x in ('n', 'plus', 'minus', 'weights', 'overflow', 'headerDiff')})
        return row
    out = {'cases': chunked(cases, case, 6)}

    def runtime(s, _):
        probe = r"""(()=>{const t=[...document.querySelectorAll(%s)].filter(e=>e.getClientRects().length&&e.closest('#app'));return{lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,n:t.length,
         weights:[...new Set(t.map(e=>getComputedStyle(e).fontWeight))],families:[...new Set(t.map(e=>getComputedStyle(e).fontFamily))],overflow:document.documentElement.scrollWidth>innerWidth+1}})()""" % SELJ
        steps = []
        fresh(s, 'people', [ID], 'light', 'fr', M); steps.append(['people fr clair', s.js(probe)])
        s.settings('ar', 'dark'); s.wait('document.documentElement.lang==="ar"', 10); time.sleep(.8); steps.append(['people ar sombre', s.js(probe)])
        go(s, '#projects/ft-transcendence-building-together?tab=overview', 'Boolean(document.querySelector("#project-title")?.getClientRects().length)'); steps.append(['fiche ar sombre', s.js(probe)])
        s.settings('fr', 'light'); s.wait('document.documentElement.lang==="fr"', 10); time.sleep(.8); steps.append(['fiche fr clair', s.js(probe)])
        return {'steps': steps, 'errors': s.errors()}
    out['runtime'] = chunked([None], runtime, 1)[0]
    for f in HERE.glob('_rev-*.png'): f.unlink()
    return out


def stage_echelle():
    """Combination with echelle-unifiee (another trial of the group, read only): sizes come from that trial,
    weights from this one; title line counts compared with echelle-unifiee alone. The state of its sheet is
    recorded (it may change after this check)."""
    import hashlib, os
    sheet = HERE.parent.parent / 'essais' / 'echelle-unifiee' / 'essai.css'
    probe = r"""(()=>{const t=[];for(const e of document.querySelectorAll(%s)){if(!e.getClientRects().length||!e.closest('#app'))continue;const range=document.createRange();range.selectNodeContents(e);const tops=[];
     for(const x of range.getClientRects()){if(x.width<.5)continue;if(!tops.some(v=>Math.abs(v-x.top)<4))tops.push(x.top)}const s=getComputedStyle(e);t.push([e.textContent.trim().slice(0,30),tops.length,s.fontSize,s.fontWeight])}
     return{titles:t,overflow:document.documentElement.scrollWidth>innerWidth+1}})()""" % SELJ

    def case(s, item):
        route, vp, lang, theme = item; sides = {}
        for label, essais in (('seul', ['echelle-unifiee']), ('combine', [ID, 'echelle-unifiee'])):
            fresh(s, route, essais, theme, lang, vp); sides[label] = s.js(probe) | {'errors': s.errors()}
        a, b = sides['seul']['titles'], sides['combine']['titles']
        row = {'route': route, 'viewport': vname(vp), 'lang': lang, 'theme': theme, 'n': len(a), 'sameTitles': [x[0] for x in a] == [y[0] for y in b],
               'sizesFromEchelle': all(x[2] == y[2] for x, y in zip(a, b)), 'weights': sorted({y[3] for y in b}),
               'plus': [(x[0], x[1], y[1]) for x, y in zip(a, b) if y[1] > x[1]], 'minus': [(x[0], x[1], y[1]) for x, y in zip(a, b) if y[1] < x[1]],
               'overflow': [sides['seul']['overflow'], sides['combine']['overflow']], 'errors': [sides['seul']['errors'], sides['combine']['errors']]}
        s.record(f'echelle {route} {vname(vp)} {lang}', {k: row[k] for k in ('n', 'weights', 'plus', 'minus', 'overflow')})
        return row
    cases = [('projects', D, 'fr', 'light'), ('projects', S, 'fr', 'light'), ('people', M, 'ar', 'dark'), ('journal', M, 'en', 'light'),
             (P + '?tab=overview', M, 'fr', 'light'), (R + '?tab=overview', D, 'fr', 'light')]
    return {'sheet': {'mtime': time.strftime('%Y-%m-%d %H:%M', time.localtime(os.path.getmtime(sheet))), 'sha1': hashlib.sha1(sheet.read_bytes()).hexdigest()[:12]},
            'cases': chunked(cases, case, 3)}


def verdict(res):
    ok = {}
    lists = [r for rows in res.get('lists', {}).values() for r in rows]
    rows = lists + res.get('details', [])
    if rows:
        ok['weights'] = all(r['weights'] == ['700'] and r['weightsBefore'] == ['500'] and r['synthesis'] == ['none'] for r in rows if r['n'])
        ok['sizesStyleCase'] = all(r['sizesUnchanged'] and r['styleCaseUnchanged'] and r['sameTexts'] for r in rows)
        ok['familyArabicOnly'] = all((r['families'] == r['familiesBefore']) == (r['lang'] != 'ar') for r in rows if r['n'])
        ok['noOverflow'] = all(not r['overflow'][1] and r['ownOverflow'][1] <= r['ownOverflow'][0] for r in rows)
        ok['noNewTruncation'] = all(not r['newlyTruncated'] for r in rows)
        ok['noNewBrokenWord'] = all(not r['newlyBroken'] for r in rows)
        ok['densityUnchanged'] = all(r.get('density', [0, 0])[0] == r.get('density', [0, 0])[1] for r in res.get('details', []))
        ok['noErrors'] = all(not r['errors'][0] and not r['errors'][1] for r in rows)
        ok['headerUnchanged'] = all(r.get('headerDiff', 0) == 0 for r in rows)
    if lists:
        ok['listsComplete'] = all(r['pagesReady'] and r['samePages'] and r['view'] == [r['requestedView']] * 2 for r in lists)
    sweep = res.get('sweep', [])
    if sweep:
        ok['sweep'] = all(r['ready'] and r['sameEntries'] and r['n'] == 12 and r['sizesUnchanged'] and r['weights'][1] == ['700'] and not r['densityChanged'] and not r['overflow'][1] and not r['newlyBroken']
                          and r['ownOverflow'][1] <= r['ownOverflow'][0] and not r['errors'][0] and not r['errors'][1] for r in sweep)
    ex = res.get('extras')
    if ex:
        ok['scope'] = all(c['sameCount'] and c['links'] == 1 and c['changedOutsideCount'] == 0 and c['otherCount'] == 0 and c['hiddenTitles'][0] == c['hiddenTitles'][1]
                          and (c['familyChanged'] == 0) == (c['lang'] != 'ar') and c['trackingOutsideCardsInArabic'] == 0 and all(w != '700' for w in c['emptyStateWeights']) and not c['errors'] for c in ex['scope'])
        ok['repositoryHeading'] = any((c['repositoryHeading'] or [None, None])[1] == '700' for c in ex['scope'])
        f = ex['fonts']
        ok['realFaces'] = all(any(x['isCustomFont'] and x['postScriptName'] == 'Jost-Bold' for x in f[k]['apres']['fonts']) for k in ('carte-latin', 'titre-latin')) and all(
            any('Bold' in (x['postScriptName'] or '') and not x['isCustomFont'] for x in f[k]['apres']['fonts']) and any('Regular' in (x['postScriptName'] or '') and not x['isCustomFont'] for x in f[k]['avant']['fonts'])
            for k in ('carte-arabe', 'nom-arabe', 'section-arabe'))
        ok['campusHistorySelector'] = ex['campusHistorySelector'] == '700'
        at = ex['arabicTracking']['widths']
        ok['arabicTracking'] = abs(at['arabe']['0px'] - at['arabe']['-0.055em']) < 2.5 and at['latin']['0px'] - at['latin']['-0.055em'] > 10 and at['latin']['-0.055em'] < ex['arabicTracking']['column']
        rt = ex['runtime']; ar = next(r for r in rt if r['etape'] == 'fiche profil ar sombre')
        ok['runtime'] = all(r['weights'] == ['700'] for r in rt) and ar['arabicTrackingCardsOnly'] and ar['arabicFamilyOnTitlesOnly'] and not rt[-1]['errors']
        a = ex['arrival']
        ok['arrival'] = a['diff'] == 0 and not a['avant']['errors'] and not a['apres']['errors'] and a['apres']['ready'] == 'true'
        ok['combo'] = all(r['weights'] == ['700'] and not r['overflow'][1] and not r['errors'][1] and r['wordmark'][1] == 'italic 800' and r['sizesUnchanged']
                          and (r['metaMin'][1] is None or r['metaMin'][1] >= 13) and r['sheets'] == COMBO for r in ex['combo'])
    rv = res.get('review')
    if rv:
        ok['review'] = all(r['n'] and r['sameTitles'] and not r['minus'] and r['sizesUnchanged'] and r['weights'][1] == ['700'] and r['weights'][0] == ['500'] and not r['overflow'][1]
                           and r['ownOverflow'][1] <= r['ownOverflow'][0] and r['headerDiff'] == 0 and not r['errors'] and (r['families'][0] == r['families'][1]) == (r['lang'] != 'ar') for r in rv['cases']) and \
            not rv['runtime']['errors'] and all(st['weights'] == ['700'] and not st['overflow'] and any('Noto Sans Arabic' in f for f in st['families']) == (st['lang'] == 'ar') for _, st in rv['runtime']['steps'])
    ec = res.get('echelle')
    if ec:
        ok['echelle'] = all(r['n'] and r['sameTitles'] and r['sizesFromEchelle'] and r['weights'] == ['700'] and not r['minus'] and not r['overflow'][1] and not r['errors'][1] for r in ec['cases'])
    fb = res.get('fallback')
    if fb:
        arabic = lambda fonts, face: any(face in (x['postScriptName'] or '') and 'Arabic' in (x['familyName'] or '') for x in fonts or [])
        ok['arabicFamilyNeeded'] = all(arabic(r['named']['fonts'], 'Bold') and not arabic(r['baselineFamily']['fonts'], 'Bold') and r['baselineFamily']['style']['fontWeight'] == '700' for r in fb)
    res['checks'] = ok
    res['passed'] = bool(ok) and all(ok.values()) and all(k in res for k in ('lists', 'details', 'sweep', 'extras')) and set(res.get('lists', {})) == set(SECTIONS)
    return res


if __name__ == '__main__':
    stages = sys.argv[1:] or ['lists', 'details', 'sweep', 'extras', 'fallback', 'review']
    path = HERE / 'results.json'
    res = json.loads(path.read_text()) if path.exists() else {'id': ID}
    try:
        for stage in stages:
            if stage.startswith('lists'):
                wanted = [stage.split(':', 1)[1]] if ':' in stage else list(SECTIONS)
                for sec in wanted:
                    res.setdefault('lists', {})[sec] = chunked([c for c in LISTS if c[0] == sec], list_case, 2)
            elif stage == 'details': res['details'] = chunked(DETAILS, detail_case, 5)
            elif stage == 'sweep': res['sweep'] = chunked(SWEEP, sweep_case, 1)
            elif stage == 'extras': res['extras'] = stage_extras()
            elif stage == 'fallback': res['fallback'] = stage_fallback()
            elif stage == 'review': res['review'] = stage_review()
            elif stage == 'echelle': res['echelle'] = stage_echelle()
            res = verdict(res); path.write_text(json.dumps(res, ensure_ascii=False, indent=1) + '\n')
    finally:
        for f in HERE.glob('_head-*.png'): f.unlink()
    print('checks', res.get('checks'), 'passed', res.get('passed'))
