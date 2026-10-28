"""Grid -> List -> Grid at 320 px, baseline vs trial deux-colonnes-allegees: which elements leave
their card after the switch, and the fit controller's state at that moment. Finding: only the
cover art of the card under the pointer (hover zoom scale(1.035)), in both; gone once the
pointer moves away.
Run: python3 -I studies/design-review-studies/checks/deux-colonnes-allegees/bascule-grille.py"""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, S

ID = 'deux-colonnes-allegees'
OUTSIDE_JS = r'''(()=>{const R=r=>({x:+r.left.toFixed(1),y:+r.top.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)});const out=[];
 for(const card of document.querySelectorAll('#content-list > .cp-card')){const cb=card.getBoundingClientRect();
  for(const e of card.querySelectorAll('*')){if(e instanceof SVGElement||!e.getClientRects().length||getComputedStyle(e).visibility==='hidden')continue;const r=e.getBoundingClientRect();
   if(r.width>0&&(r.left<cb.left-1||r.right>cb.right+1))out.push({card:card.querySelector('.cp-card-title-link').textContent.trim().slice(0,32),el:e.tagName+'.'+String(e.className),probe:Boolean(e.closest('.cp-author-fit-probe')),
    rect:R(r),cardRect:R(cb),overflow:e.closest('.cp-authors')?.dataset.overflow??null,style:e.getAttribute('style')||''})}}
 const rows=[...document.querySelectorAll('#content-list > .cp-card .cp-authors')].map(a=>({probe:a.classList.contains('cp-author-fit-probe'),overflow:a.dataset.overflow??null,parent:a.parentElement.className,shown:[...a.querySelectorAll('.cp-author-item')].filter(i=>i.getClientRects().length).length}));
 return{view:document.getElementById('content-index').dataset.view,tracks:getComputedStyle(document.getElementById('content-list')).gridTemplateColumns,outside:out,probes:rows.filter(r=>r.probe).length,rows:rows.filter(r=>!r.probe)}})()'''

results = {'id': ID}
s = Session(HERE)
try:
    for side, essais in (('avant', []), ('apres', [ID])):
        s.open('projects', essais=essais, viewport=S, block_globe=True)
        case = {'fresh': s.js(OUTSIDE_JS)}
        s.click('#content-layout-button'); s.click('#content-layout-menu [data-value=list]'); time.sleep(.8)
        case['list'] = s.js(OUTSIDE_JS)
        s.click('#content-layout-button'); s.click('#content-layout-menu [data-value=grid]'); time.sleep(.8)
        case['grid'] = s.js(OUTSIDE_JS); time.sleep(2); case['gridLater'] = s.js(OUTSIDE_JS)
        case['hovered'] = s.js('[...document.querySelectorAll("#content-list > .cp-card")].filter(c=>c.matches(":hover")).map(c=>c.querySelector(".cp-card-title-link").textContent.trim().slice(0,32))')
        s.away(); s.blur(); time.sleep(.6); case['gridAway'] = s.js(OUTSIDE_JS); s.shot(f'{side}-bascule-grille-petit')
        results[side] = case
        s.record(side, {k: [(o['card'], o['el'][:40], o['probe']) for o in case[k]['outside']][:4] for k in ('fresh', 'list', 'grid', 'gridLater', 'gridAway')} | {'hovered': case['hovered']})
finally:
    s.close()
(HERE / 'bascule-grille.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
