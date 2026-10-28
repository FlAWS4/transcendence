"""Essai illustrations-variees combined with the dark-theme trials (illustrations-sombres or
illustrations-attenuees, which exclude each other): neighbours still differ, covers stay dark/dim.
Run: python3 -I studies/design-review-studies/checks/illustrations-variees/combinaisons.py"""
import base64, io, json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D

ERRORS = 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'
CARDS = '''(()=>[...document.querySelectorAll("#content-list > article.cp-card")].map(card=>{const cover=card.querySelector(".cp-cover"),svg=cover.querySelector("svg"),r=cover.getBoundingClientRect();
 return {id:(card.querySelector("a[href]").getAttribute("href").match(/#(?:projects|journal)\\/([^?]+)/)||[])[1],palette:card.dataset.essaiPalette||"0",
  paint:[...svg.querySelectorAll("[fill],[stroke]")].map(e=>{const s=getComputedStyle(e);return (e.hasAttribute("fill")?s.fill:"")+"/"+(e.hasAttribute("stroke")?s.stroke:"")+"/"+s.filter}).join(";")+"|"+getComputedStyle(svg).filter,
  rect:[r.left,r.top,r.width,r.height]}}))()'''
CASES = [('sombres', ['illustrations-sombres', 'illustrations-variees']), ('attenuees', ['illustrations-attenuees', 'illustrations-variees']), ('variees-seul', ['illustrations-variees'])]


def png(s, name=None):
    data = base64.b64decode(s.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=60)['data'])
    if name: (HERE / (name + '.png')).write_bytes(data)
    return data


def luminance(data, rects):
    from PIL import Image
    import numpy as np
    img = np.asarray(Image.open(io.BytesIO(data)).convert('RGB'), dtype=float) / 255
    lin = np.where(img <= .03928, img / 12.92, ((img + .055) / 1.055) ** 2.4)
    lum = .2126 * lin[..., 0] + .7152 * lin[..., 1] + .0722 * lin[..., 2]
    mask = np.zeros(lum.shape, bool)
    for x, y, w, h in rects:
        x0, y0, x1, y1 = max(0, int(x)), max(0, int(y)), min(lum.shape[1], int(x + w)), min(lum.shape[0], int(y + h))
        if x1 > x0 and y1 > y0: mask[y0:y1, x0:x1] = True
    return round(float(lum[mask].mean()), 4) if mask.any() else None


def fresh(s, route, essais):
    c = s.c; c.session = None
    target = c.call('Target.createTarget', {'url': 'about:blank'})['targetId']
    session = c.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
    for info in c.call('Target.getTargets')['targetInfos']:
        if info['type'] == 'page' and info['targetId'] != target: c.call('Target.closeTarget', {'targetId': info['targetId']})
    c.session = session
    c.call('Page.enable'); c.call('Page.bringToFront'); c.call('Emulation.setFocusEmulationEnabled', {'enabled': True})
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': ERRORS}); c.call('Network.enable'); s.reduced(True)
    s.open(route, essais=essais, theme='dark', lang='fr', viewport=D, block_globe=True)


def neighbours(cards):
    pairs = []
    for axis, other in ((1, 0), (0, 1)):
        lines = {}
        for i, card in enumerate(cards): lines.setdefault(round(card['rect'][axis] / 4), []).append(i)
        for members in lines.values():
            members.sort(key=lambda i: cards[i]['rect'][other]); pairs += list(zip(members, members[1:]))
    return pairs


results = {'cases': [], 'passed': False}
s = Session(HERE)
try:
    for tag, essais in CASES:
        for section in ('projects', 'journal'):
            fresh(s, section, essais)
            if s.js('document.getElementById("content-index").dataset.view') != 'grid':
                s.click('#content-layout-button'); s.click('.cp-control-menu[data-control=layout] [data-value=grid]'); s.key('Escape'); s.away()
            s.scroll(520)
            cards = s.js(CARDS); pairs = neighbours(cards)
            shot = png(s, f'combinaison-{tag}-{section}' if tag != 'variees-seul' else None)
            visible = [c['rect'] for c in cards if c['rect'][1] + c['rect'][3] > 0 and c['rect'][1] < 900]
            item = {'combinaison': tag, 'essais': essais, 'active': s.js('document.documentElement.dataset.essais'), 'section': section, 'cards': len(cards), 'pairs': len(pairs),
                    'identicalNeighbours': [(cards[a]['id'], cards[b]['id']) for a, b in pairs if cards[a]['paint'] == cards[b]['paint']],
                    'meanCoverLuminance': luminance(shot, visible), 'palettes': [c['palette'] for c in cards], 'errors': s.errors()}
            results['cases'].append(item); s.record(f'{tag} {section}', {k: item[k] for k in ('cards', 'pairs', 'meanCoverLuminance')} | {'identical': len(item['identicalNeighbours'])})
finally:
    s.close()
    by = {(c['combinaison'], c['section']): c for c in results['cases']}
    results['checks'] = {
        'bothActive': all(c['active'] == ' '.join(c['essais']) for c in results['cases']) and len(results['cases']) == 6,
        'noIdenticalNeighbours': all(not c['identicalNeighbours'] for c in results['cases']),
        'darkerThanVarieesAlone': all(by[(t, sec)]['meanCoverLuminance'] < by[('variees-seul', sec)]['meanCoverLuminance'] for t in ('sombres', 'attenuees') for sec in ('projects', 'journal') if (t, sec) in by and ('variees-seul', sec) in by),
        'samePalettes': all(by[(t, sec)]['palettes'] == by[('variees-seul', sec)]['palettes'] for t in ('sombres', 'attenuees') for sec in ('projects', 'journal') if (t, sec) in by and ('variees-seul', sec) in by),
        'noErrors': not any(c['errors'] for c in results['cases']),
    }
    results['passed'] = all(results['checks'].values())
    (HERE / 'combinaisons.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    print('passed', results['passed'], results['checks'])
