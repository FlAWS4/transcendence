"""Counter-check of illustrations-variees (independent of check.py): pages 2-7 in the
browser (3 and 2 columns), nothing but the covers changes in light, live language and
theme switches, and profile project grids use the same palette as the lists.
Run: python3 -I studies/design-review-studies/checks/illustrations-variees/contre-verification.py"""
import base64, io, json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M

ID = 'illustrations-variees'
ERRORS = 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'
CARDS = '''(()=>[...document.querySelectorAll("#content-list > article.cp-card")].map(card=>{const cover=card.querySelector(".cp-cover"),svg=cover.querySelector("svg"),r=cover.getBoundingClientRect(),c=card.getBoundingClientRect();
 return {id:(card.querySelector("a[href]").getAttribute("href").match(/#(?:projects|journal)\\/([^?]+)/)||[])[1],cover:card.dataset.cover,palette:card.dataset.essaiPalette||"0",
  paint:[...svg.querySelectorAll("[fill],[stroke]")].map(e=>{const s=getComputedStyle(e);return (e.hasAttribute("fill")?s.fill:"")+"/"+(e.hasAttribute("stroke")?s.stroke:"")}).join(";")+"|"+getComputedStyle(cover).backgroundColor,
  rect:[r.left,r.top+scrollY,r.width,r.height],card:[c.left,c.top+scrollY,c.width,c.height]}}))()'''
PROFILE_COVERS = '''(()=>[...document.querySelectorAll(".cp-profile-related-link .cp-cover[data-cover]")].map(c=>({id:(c.closest("a[href]").getAttribute("href").match(/#(?:projects|journal)\\/([^?]+)/)||[])[1],cover:c.dataset.cover,palette:c.dataset.essaiPalette||"0"})))()'''


def png(s, name=None):
    data = base64.b64decode(s.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=60)['data'])
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


def set_view(s, view):
    if s.js('document.getElementById("content-index").dataset.view') == view: return True
    s.click('#content-layout-button'); s.click(f'.cp-control-menu[data-control=layout] [data-value={view}]'); s.key('Escape'); s.away(); s.blur()
    return s.wait(f'document.getElementById("content-index").dataset.view==={json.dumps(view)}', 6)


def goto(s, route):
    first = s.js('document.querySelector("#content-list > article.cp-card a[href]")?.getAttribute("href")||""')
    s.js('(()=>{history.pushState(null,"","#' + route + '");dispatchEvent(new PopStateEvent("popstate"));return true})()')
    ok = s.wait(f'(document.querySelector("#content-list > article.cp-card a[href]")?.getAttribute("href")||"")!=={json.dumps(first)}', 10)
    s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.6); return ok


def neighbours(cards):
    """Row neighbours share a top edge, column neighbours a left edge (geometry, so RTL is covered)."""
    pairs = []
    for axis, other in ((1, 0), (0, 1)):
        lines = {}
        for i, card in enumerate(cards): lines.setdefault(round(card['rect'][axis] / 4), []).append(i)
        for members in lines.values():
            members.sort(key=lambda i: cards[i]['rect'][other]); pairs += list(zip(members, members[1:]))
    return pairs


def identical(cards):
    return [(cards[a]['id'], cards[b]['id']) for a, b in neighbours(cards) if cards[a]['paint'] == cards[b]['paint']]


def masked_diff(a, b, rects, glass, scale=1):
    """Differing pixels (strict) outside the cover rects: on frosted glass (backdrop blur of
    the covers behind it, expected) and elsewhere (must be none)."""
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(io.BytesIO(a)).convert('RGB'), dtype=int); y = np.asarray(Image.open(io.BytesIO(b)).convert('RGB'), dtype=int)
    if x.shape != y.shape: return {'shape': 'different'}
    changed = np.abs(x - y).sum(axis=2) > 0
    def cut(mask, boxes):
        for left, top, w, h in boxes: mask[max(0, int(top * scale) - 1):int((top + h) * scale) + 1, max(0, int(left * scale) - 1):int((left + w) * scale) + 1] = False
    cut(changed, rects); on_glass = changed.copy(); cut(changed, glass); on_glass &= ~changed
    ys, xs = np.nonzero(changed)
    return {'outsideCovers': float((changed | on_glass).mean()), 'onGlass': float(on_glass.mean()), 'elsewhere': float(changed.mean()),
            'elsewhereBox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())] if len(xs) else None}


GLASS = '''(()=>[...document.querySelectorAll("body *")].filter(e=>e.getClientRects().length&&[null,"::before","::after"].some(p=>{const v=getComputedStyle(e,p).backdropFilter;return v&&v!=="none"})).map(e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.width,r.height]}))()'''


def account(s, screen, key, value):
    s.click('#profile'); s.click(f'[data-account-action={screen}]'); s.click(f'[data-account-{key}={value}]'); s.key('Escape'); s.away(); s.blur(); time.sleep(.8)


results = {'essai': ID, 'pages': [], 'clair': {}, 'langue': {}, 'theme': {}, 'profil': {}, 'errors': {}, 'passed': False}
palette_of = {}
s = Session(HERE)
try:
    # 1. Pages 2-7 of both sections: grid at 1440 px (3 columns), then grid at 390 px (2 columns).
    for vue, vp in (('ordinateur', D), ('mobile', M)):
        fresh(s, 'projects', [ID], 'light', 'fr', vp); set_view(s, 'grid')
        for section in ('projects', 'journal'):
            for page in range(1, 8):
                ok = goto(s, f'{section}?page={page}') if (section, page) != ('projects', 1) else True
                cards = s.js(CARDS)
                for card in cards: palette_of[card['id']] = card['cover'] + ':' + card['palette']
                columns = len({round(c['rect'][0]) for c in cards})
                item = {'vue': vue, 'section': section, 'page': page, 'navigated': ok, 'cards': len(cards), 'columns': columns, 'pairs': len(neighbours(cards)), 'identical': identical(cards)}
                results['pages'].append(item)
                if item['identical'] or not ok: s.record('page', item)
        results['errors'][f'pages-{vue}'] = s.errors(); results[f'overflow-{vue}'] = s.overflow()
    s.record('pages', {'states': len(results['pages']), 'identical': sum(len(p['identical']) for p in results['pages'])})
    # 2. Light, page 1: outside the cover rects the page is pixel-identical; card boxes are unchanged.
    shots, boxes, covers, glass = [], [], None, []
    for essais in ([], [ID]):
        fresh(s, 'projects', essais, 'light', 'fr', D); set_view(s, 'grid')
        cards = s.js(CARDS); boxes.append([c['card'] for c in cards]); covers = [c['rect'] for c in cards]; glass += s.js(GLASS)
        shots.append(png(s))
    results['clair'] = {'diff': masked_diff(shots[0], shots[1], covers, glass), 'glass': len(glass), 'cardBoxesIdentical': boxes[0] == boxes[1], 'cards': len(boxes[1])}
    s.record('clair', results['clair'])
    # 3. Live language switch (FR -> AR): the list is rebuilt, palettes are applied again.
    fresh(s, 'journal', [ID], 'light', 'fr', D); set_view(s, 'grid'); s.js('(()=>{window.__noReload=1;return true})()')
    before = s.js(CARDS); account(s, 'language', 'locale', 'ar'); after = s.js(CARDS)
    results['langue'] = {'lang': s.js('document.documentElement.lang+" "+document.dir'), 'noReload': s.js('window.__noReload===1'),
                         'palettesBefore': [c['palette'] for c in before], 'palettesAfter': [c['palette'] for c in after], 'identicalAfter': identical(after)}
    s.record('langue', results['langue'])
    # 4. Live theme switch (light -> dark), still in Arabic: palettes kept.
    account(s, 'theme', 'theme', 'dark'); dark = s.js(CARDS)
    results['theme'] = {'theme': s.js('document.documentElement.dataset.theme'), 'noReload': s.js('window.__noReload===1'), 'palettes': [c['palette'] for c in dark], 'identical': identical(dark)}
    results['errors']['live'] = s.errors(); s.record('theme', results['theme'])
    # 5. Profile project grids (Arun Suri: three demo projects; Haru Mizuno: a varied original).
    found = []
    for person in ('profile-arun-suri', 'profile-haru-mizuno'):
        fresh(s, f'people/{person}?tab=projects', [ID], 'light', 'fr', D); found += s.js(PROFILE_COVERS); results['errors'][f'profil-{person}'] = s.errors()
    results['profil'] = {'covers': found, 'mismatch': [c for c in found if palette_of.get(c['id']) != c['cover'] + ':' + c['palette']], 'varied': sum(c['palette'] != '0' for c in found)}
    s.record('profil', {k: results['profil'][k] for k in ('mismatch', 'varied')})
finally:
    s.close()
    pages, l, t, c, p = results['pages'], results['langue'], results['theme'], results['clair'], results['profil']
    results['checks'] = {
        'pagesWithoutIdenticalNeighbours': len(pages) == 28 and all(x['navigated'] and x['cards'] > 0 and not x['identical'] for x in pages)
                                          and {x['columns'] for x in pages if x['vue'] == 'ordinateur' and x['cards'] >= 3} == {3} and {x['columns'] for x in pages if x['vue'] == 'mobile' and x['cards'] >= 2} == {2},
        'lightOnlyCoversChange': bool(c) and c['diff'].get('elsewhere') == 0 and c['cardBoxesIdentical'],
        'liveLanguage': bool(l) and l['lang'] == 'ar rtl' and l['noReload'] and l['palettesBefore'] == l['palettesAfter'] and any(v != '0' for v in l['palettesAfter']) and not l['identicalAfter'],
        'liveTheme': bool(t) and t['theme'] == 'dark' and t['noReload'] and t['palettes'] == l.get('palettesAfter') and not t['identical'],
        'profileMatchesLists': bool(p.get('covers')) and not p['mismatch'] and p['varied'] > 0,
        'noOverflow': not results.get('overflow-ordinateur') and not results.get('overflow-mobile'),
        'noErrors': not any(results['errors'].values()),
    }
    results['passed'] = all(results['checks'].values())
    (HERE / 'contre-verification.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    print('passed', results['passed'], results['checks'])
