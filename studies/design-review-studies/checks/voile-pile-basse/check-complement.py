"""Trial voile-pile-basse, complement (resumed 14 Oct 2026): ends of detail pages on phones
(comments and article at 320 x 640, comments at 390 x 844), the open search drawn above the veil,
the veil kept while keyboard focus keeps the dock revealed during a scroll, and Awards unchanged.
Writes results-complement.json next to results.json.
Run: python3 -I studies/design-review-studies/checks/voile-pile-basse/check-complement.py"""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, image_diff

ID = 'voile-pile-basse'
OUT = HERE / 'results-complement.json'
VEIL_JS = '''(()=>{const app=document.getElementById('app'),b=getComputedStyle(app,'::before'),a=getComputedStyle(document.getElementById('content-sheet'),'::after');
const host=b.display!=='none'&&b.content!=='none'?'app::before':(a.display!=='none'&&a.content!=='none'?'content-sheet::after':null),v=host==='content-sheet::after'?a:b,h=parseFloat(v.height)||0;
return {host,height:h,top:innerHeight-h,opacity:v.opacity,visibility:v.visibility,scrolling:document.querySelector('.dock-shell')?.dataset.documentScrolling||null,
 dockOpacity:getComputedStyle(document.querySelector('.dock-search-toggle')).opacity}})()'''
# Bottom of the last visible in-flow content of the page (rule of check.py, plus checkVisibility():
# the panel of a closed <details> section selector reports a box although it is not rendered).
LAST_JS = '''(()=>{const sheet=document.getElementById('content-sheet');let best=null;
for(const e of sheet.querySelectorAll('a,button,input,textarea,select,p,h1,h2,h3,li,img,time,label,nav')){if(e.closest('[hidden],[data-detail-scroll=sidebar],.cp-author-fit-probe'))continue;if(!e.checkVisibility())continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
 const st=getComputedStyle(e);if(st.visibility==='hidden'||st.position==='fixed')continue;if(!best||r.bottom>best.bottom)best={bottom:+r.bottom.toFixed(1),tag:e.tagName.toLowerCase(),text:(e.textContent||'').trim().slice(0,40)}}
return {best,scrollY:Math.round(scrollY),maxScroll:document.documentElement.scrollHeight-innerHeight}})()'''

r = {'id': ID, 'ends': [], 'search': {}, 'keyboard': {}, 'awards': {}, 'errors': {}}
s = Session(HERE)
try:
    for vue, route, vp in (('fiche-commentaires-petit', 'projects/ft-transcendence-building-together?tab=comments', S),
                           ('chronique-petit', 'journal/journal-an-evening-debugging?tab=article', S),
                           ('fiche-commentaires-mobile', 'projects/ft-transcendence-building-together?tab=comments', M)):
        case = {'vue': vue, 'route': route, 'viewport': list(vp[:2])}
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open(route, essais=essais, viewport=vp, block_globe=True)
            veil = s.js(VEIL_JS); s.scroll(10 ** 6); time.sleep(.6)
            case[side] = {'veil': veil, 'end': s.js(LAST_JS)}
            s.shot(f'{side}-fin-{vue}')
        a, b = case['avant'], case['apres']
        top = b['veil']['top']; last = b['end']['best']['bottom']
        case['sameLayout'] = a['end'] == b['end']; case['veilTop'] = top; case['lastBottom'] = last
        case['margin'] = round(top - last, 1); case['clear'] = last <= top + .5
        r['ends'].append(case); s.record(vue, {k: case[k] for k in ('sameLayout', 'veilTop', 'lastBottom', 'margin', 'clear')} | {'host': b['veil']['host'], 'last': b['end']['best']['text']})
    r['errors']['ends'] = s.errors()
finally:
    s.close()

s = Session(HERE)
try:
    # Open search over the veil: the results surface stays above it and keeps the baseline's hits
    # (the last row can sit under the search field in both; the veil has no pointer events).
    HITS_JS = '''(top=>[...document.querySelectorAll('.dock-search-result')].map(e=>{const r=e.getBoundingClientRect();const y=r.top+r.height/2,x=r.left+r.width/2,h=document.elementFromPoint(x,y);
     return {y:Math.round(y),inVeilZone:y>top,hit:Boolean(e.contains(h)),target:h?h.tagName.toLowerCase()+(h.classList[0]?'.'+h.classList[0]:''):null}}).filter(p=>p.y>0&&p.y<innerHeight))(%s)'''
    for side, essais in (('avant', []), ('apres', [ID])):
        s.open('projects', essais=essais, viewport=M, block_globe=True)
        s.click('.dock-search-toggle'); s.wait('document.querySelector(".dock-shell")?.dataset.searchOpen==="true"', 5); time.sleep(.7)
        s.c.call('Input.insertText', {'text': 'Paris'}); s.wait('document.querySelectorAll(".dock-search-result").length>0', 8); time.sleep(.8); s.away(); time.sleep(.3)
        veil = s.js(VEIL_JS); top = veil['top'] if essais else 686
        hits = s.js(HITS_JS % top)
        if essais: s.shot('apres-recherche-ouverte-mobile')
        r['search'][side] = {'veil': veil, 'points': hits}
        s.key('Escape'); time.sleep(.6)
        r['search'][side]['closedVeil'] = s.js(VEIL_JS)['opacity']
    a, b = r['search']['avant'], r['search']['apres']
    r['search'].update({'results': len(b['points']), 'inVeilZone': sum(1 for h in b['points'] if h['inVeilZone']), 'hitsIdentical': a['points'] == b['points'],
                        'veilOpacityOpen': b['veil']['opacity'], 'closedVeil': b['closedVeil']})
    s.record('search-open', {k: r['search'][k] for k in ('results', 'inVeilZone', 'hitsIdentical', 'veilOpacityOpen', 'closedVeil')} | {'targets': [h['target'] for h in b['points']]})
    if (HERE.parent / 'recherche-repliee' / 'avant-recherche-ouverte-mobile.png').exists():
        r['search']['pixelShareVsBaselineSearch'] = round(image_diff(HERE.parent / 'recherche-repliee' / 'avant-recherche-ouverte-mobile.png', HERE / 'apres-recherche-ouverte-mobile.png'), 5)
    # Keyboard focus in the dock keeps the dock revealed while scrolling, and the veil with it.
    s.open('projects', essais=[ID], viewport=M, block_globe=True)
    s.js('(()=>{document.querySelector(".dock-search-toggle").focus();return true})()')
    s.key('Tab'); focus = s.js('(()=>{const e=document.activeElement;return {cls:e?.className||null,visible:e?.matches(":focus-visible")||false}})()')
    for _ in range(4): s.js('(()=>{scrollBy(0,90);return true})()'); time.sleep(.09)
    during = s.js(VEIL_JS); time.sleep(1.2); after = s.js(VEIL_JS)
    r['keyboard'] = {'focus': focus, 'during': during, 'rest': after}
    s.record('keyboard-scroll', {'focus': focus, 'during': [during['scrolling'], during['opacity'], during['dockOpacity']], 'rest': [after['scrolling'], after['opacity']]})
    # Awards: the baseline hides the sheet, the capsule and the die; the veil stays off.
    for vue, vp in (('awards-ordinateur', D), ('awards-mobile', M)):
        pair = {}
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open('awards', essais=essais, viewport=vp, block_globe=True)
            pair[side] = s.js(VEIL_JS); s.shot(f'{side}-{vue}')
        pair['pixelShare'] = round(image_diff(HERE / f'avant-{vue}.png', HERE / f'apres-{vue}.png'), 6)
        r['awards'][vue] = pair; s.record(vue, {'pixelShare': pair['pixelShare'], 'veil': [pair['apres']['opacity'], pair['apres']['visibility']]})
    r['errors']['other'] = s.errors()
finally:
    s.close()

kb = r['keyboard']
r['passed'] = bool(
    all(c['sameLayout'] and c['clear'] for c in r['ends'])
    and r['search']['veilOpacityOpen'] == '1' and r['search']['results'] > 0 and r['search']['hitsIdentical'] and r['search']['closedVeil'] == '1'
    and sum(1 for h in r['search']['apres']['points'] if h['inVeilZone'] and h['hit']) > 0
    and kb['focus']['visible'] and kb['during']['opacity'] == '1' and kb['rest']['opacity'] == '1'
    and all(p['pixelShare'] == 0 and p['apres']['visibility'] == 'hidden' for p in r['awards'].values())
    and not any(r['errors'].values()))
OUT.write_text(json.dumps(r, ensure_ascii=False, indent=1) + '\n')
print('passed', r['passed'], 'written', OUT)
