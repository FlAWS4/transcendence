"""Essai illustrations-variees: no identical covers between row/column neighbours on page 1
(Projets, Chroniques; grid and list; light and dark; FR desktop and AR mobile), and the
same palette in the card, the detail media and the viewer.
Run: python3 -I studies/design-review-studies/checks/illustrations-variees/check.py"""
import base64, io, json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M

ID = 'illustrations-variees'
ERRORS = 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'
# Per card: entry, palette, cover markup, painted colours of every SVG node, cover rect (page coordinates).
CARDS = '''(()=>[...document.querySelectorAll("#content-list > article.cp-card")].map(card=>{const cover=card.querySelector(".cp-cover"),svg=cover.querySelector("svg"),r=cover.getBoundingClientRect();
 return {id:(card.querySelector("a[href]").getAttribute("href").match(/#(?:projects|journal)\\/([^?]+)/)||[])[1],cover:card.dataset.cover,palette:card.dataset.essaiPalette||"0",
  markup:(card.dataset.essaiPalette||"")+cover.outerHTML,paint:[...svg.querySelectorAll("[fill],[stroke]")].map(e=>{const s=getComputedStyle(e);return (e.hasAttribute("fill")?s.fill:"")+"/"+(e.hasAttribute("stroke")?s.stroke:"")}).join(";")+"|"+getComputedStyle(cover).backgroundColor,
  rect:[r.left+scrollX,r.top+scrollY,r.width,r.height]}}))()'''
PAINT = '''(sel=>{const svg=document.querySelector(sel);if(!svg)return null;const host=svg.closest("[data-cover]");return {palette:host.dataset.essaiPalette||"0",cover:host.dataset.cover,paint:[...svg.querySelectorAll("[fill],[stroke]")].map(e=>{const s=getComputedStyle(e);return (e.hasAttribute("fill")?s.fill:"")+"/"+(e.hasAttribute("stroke")?s.stroke:"")}).join(";")}})'''
VIEWS = {'grid': 'grid', 'list': 'list'}
COMBOS = [('ordinateur', D, 'light', 'fr'), ('sombre-ordinateur', D, 'dark', 'fr'), ('ar-mobile', M, 'light', 'ar'), ('sombre-ar-mobile', M, 'dark', 'ar')]
KEEP = {('projects', 'grid', 'ordinateur'), ('journal', 'grid', 'ordinateur'), ('journal', 'list', 'ordinateur'), ('projects', 'grid', 'sombre-ordinateur'),
        ('journal', 'grid', 'ar-mobile'), ('journal', 'grid', 'sombre-ar-mobile'), ('projects', 'list', 'sombre-ar-mobile')}
DETAILS = [('projects', 'demo-project-across-the-terminals'), ('projects', 'demo-project-pairing-calendar'), ('journal', 'demo-journal-small-demo'), ('journal', 'journal-share-the-unfinished')]


def png(s, name=None, clip=None):
    params = {'format': 'png', 'optimizeForSpeed': True}
    if clip: params.update({'clip': {'x': clip[0], 'y': clip[1], 'width': clip[2], 'height': clip[3], 'scale': 1}, 'captureBeyondViewport': True})
    data = base64.b64decode(s.c.call('Page.captureScreenshot', params, timeout=60)['data'])
    if name: (HERE / (name + '.png')).write_bytes(data)
    return data


def fresh(s, route, essais, theme, lang, vp):
    """New tab per view, previous tab closed (a reused tab keeps old documents alive)."""
    c = s.c; c.session = None
    target = c.call('Target.createTarget', {'url': 'about:blank'})['targetId']
    session = c.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
    for info in c.call('Target.getTargets')['targetInfos']:
        if info['type'] == 'page' and info['targetId'] != target: c.call('Target.closeTarget', {'targetId': info['targetId']})
    c.session = session
    c.call('Page.enable'); c.call('Page.bringToFront'); c.call('Emulation.setFocusEmulationEnabled', {'enabled': True})
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': ERRORS}); c.call('Network.enable'); s.reduced(True)
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)


def goto(s, route, ready):
    s.js('(()=>{history.pushState(null,"","#' + route + '");dispatchEvent(new PopStateEvent("popstate"));return true})()')
    ok = s.wait(ready, 10); s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.7); return ok


def set_view(s, view):
    if s.js('document.getElementById("content-index").dataset.view') == view: return True
    s.click('#content-layout-button'); s.click(f'.cp-control-menu[data-control=layout] [data-value={view}]'); s.key('Escape'); s.away(); s.blur()
    return s.wait(f'document.getElementById("content-index").dataset.view==={json.dumps(view)}', 6)


def neighbours(cards):
    """Row neighbours share a top edge, column neighbours a left edge (geometry, so RTL is covered)."""
    pairs = []
    for axis, other in ((1, 0), (0, 1)):
        lines = {}
        for i, card in enumerate(cards): lines.setdefault(round(card['rect'][axis] / 4), []).append(i)
        for members in lines.values():
            members.sort(key=lambda i: cards[i]['rect'][other])
            pairs += [(a, b, 'rang' if axis == 1 else 'colonne') for a, b in zip(members, members[1:])]
    return pairs


def crops_differ(s, cards, a, b):
    from PIL import Image
    import numpy as np
    shots = []
    for i in (a, b):
        x, y, w, h = cards[i]['rect']; shots.append(np.asarray(Image.open(io.BytesIO(png(s, clip=(x, y, w, h)))).convert('RGB'), dtype=int))
    if shots[0].shape != shots[1].shape: return None
    return round(float(np.abs(shots[0] - shots[1]).mean()), 2)


def lists(results, label, essais, vue, vp, theme, lang):
    s = Session(HERE)
    try:
        fresh(s, 'projects', essais, theme, lang, vp)
        for section in ('projects', 'journal'):
            if section == 'journal': goto(s, 'journal', 'document.querySelectorAll("#content-list > article.cp-card[data-cover=journal]").length>=12')
            for view in VIEWS:
                ok = set_view(s, view); s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.6)
                cards = s.js(CARDS); pairs = neighbours(cards)
                same_markup = [(cards[a]['id'], cards[b]['id'], k) for a, b, k in pairs if cards[a]['markup'] == cards[b]['markup']]
                same_paint = [(cards[a]['id'], cards[b]['id'], k) for a, b, k in pairs if cards[a]['paint'] == cards[b]['paint']]
                state = {'essai': label, 'vue': vue, 'section': section, 'affichage': view, 'viewOk': ok, 'cards': len(cards), 'pairs': len(pairs),
                         'identicalMarkup': same_markup, 'identicalPaint': same_paint, 'palettes': [c['cover'] + ':' + c['palette'] for c in cards],
                         'ids': [c['id'] for c in cards]}
                if label == 'apres' and (section, view, vue) in {('projects', 'grid', 'ordinateur'), ('journal', 'grid', 'sombre-ar-mobile')}:
                    state['pixelDifferenceOfPairs'] = [crops_differ(s, cards, a, b) for a, b, _ in pairs]
                if (section, view, vue) in KEEP:
                    png(s, f'{label}-{section}-{view}-{vue}')
                    # Second and third rows, where repeated covers were side by side.
                    s.scroll(520 if vp == D else 640); png(s, f'{label}-{section}-{view}-{vue}-defile'); s.scroll(0)
                results['lists'].append(state); s.record(f'{label} {vue} {section} {view}', {k: state[k] for k in ('cards', 'pairs')} | {'markup': len(same_markup), 'paint': len(same_paint)})
        results['errors'][f'{label}-{vue}'] = s.errors(); results['overflow'][f'{label}-{vue}'] = s.overflow()
        set_view(s, 'grid')
    finally:
        s.close()


def details(results):
    """Card, detail media and viewer share the palette (trial on, light FR then dark AR).
    Each page is loaded on its own: a hidden earlier detail would otherwise keep its media button."""
    s = Session(HERE)
    try:
        for vue, vp, theme, lang in (('ordinateur', D, 'light', 'fr'), ('sombre-ar-mobile', M, 'dark', 'ar')):
            for section, entry in DETAILS:
                fresh(s, section, [ID], theme, lang, vp); set_view(s, 'grid')
                card = s.js(PAINT + '(' + json.dumps(f'#content-list > article.cp-card:has(a[href*="/{entry}"]) .cp-art > svg') + ')')
                fresh(s, f'{section}/{entry}', [ID], theme, lang, vp)
                s.wait('Boolean(document.querySelector(".cp-project-media-open > [data-cover] > svg"))', 10)
                detail = s.js(PAINT + '(".cp-project-media-open > [data-cover] > svg")')
                s.click('.cp-project-media-open[data-media-type=illustration]'); s.wait('Boolean(document.querySelector("dialog.media-viewer[open] .media-viewer-illustration svg"))', 8); time.sleep(.5)
                viewer = s.js(PAINT + '(".media-viewer-illustration > [data-cover] > svg")')
                if entry == 'demo-project-across-the-terminals' and vue == 'ordinateur': png(s, 'apres-visionneuse-ordinateur')
                item = {'vue': vue, 'entry': entry, 'card': card and card['palette'], 'detail': detail and detail['palette'], 'viewer': viewer and viewer['palette'],
                        'samePaint': bool(card and detail and viewer and card['paint'] == detail['paint'] == viewer['paint'])}
                results['details'].append(item); s.record('detail', item)
                results['errors'][f'details-{vue}-{entry}'] = s.errors()
    finally:
        s.close()


results = {'essai': ID, 'lists': [], 'details': [], 'errors': {}, 'overflow': {}, 'passed': False}
try:
    jobs = [(lists, (label, essais, vue, vp, theme, lang)) for vue, vp, theme, lang in COMBOS for label, essais in (('avant', []), ('apres', [ID]))] + [(details, ())]
    for job, args in jobs:
        try:
            job(results, *args)
        except (TimeoutError, RuntimeError) as error:
            print('retrying', job.__name__, args[:3], 'once:', error, flush=True)
            results.setdefault('retried', []).append([job.__name__, list(map(str, args[:3]))])
            if job is lists: results['lists'] = [x for x in results['lists'] if not (x['essai'] == args[0] and x['vue'] == args[2])]
            else: results['details'] = []
            job(results, *args)
finally:
    after = [x for x in results['lists'] if x['essai'] == 'apres']
    before = [x for x in results['lists'] if x['essai'] == 'avant']
    results['summary'] = {'baselineIdenticalNeighbourPairs': {f"{x['vue']} {x['section']} {x['affichage']}": len(x['identicalPaint']) for x in before},
                          'trialIdenticalNeighbourPairs': {f"{x['vue']} {x['section']} {x['affichage']}": len(x['identicalPaint']) for x in after}}
    results['checks'] = {
        'allStates': len(after) == len(before) == len(COMBOS) * 4 and all(x['viewOk'] and x['cards'] == 12 and x['pairs'] > 0 for x in results['lists']),
        'noIdenticalNeighbours': bool(after) and all(not x['identicalMarkup'] and not x['identicalPaint'] for x in after),
        'pixelsDiffer': all(all(v and v > 0 for v in x['pixelDifferenceOfPairs']) for x in after if 'pixelDifferenceOfPairs' in x),
        'sameOrderAsBaseline': all(a['ids'] == b['ids'] for a in after for b in before if (a['vue'], a['section'], a['affichage']) == (b['vue'], b['section'], b['affichage'])),
        'cardEqualsDetail': len(results['details']) == len(DETAILS) * 2 and all(d['samePaint'] and d['card'] == d['detail'] == d['viewer'] != '0' for d in results['details']),
        'noOverflow': not any(results['overflow'].values()),
        'noErrors': not any(results['errors'].values()),
    }
    results['passed'] = all(results['checks'].values())
    (HERE / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    print('passed', results['passed'], results['checks'])
