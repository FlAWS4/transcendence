"""Trial deux-colonnes-allegees: two cards per row kept at <= 360 px; lighter author row.
Run: python3 -I studies/design-review-studies/checks/deux-colonnes-allegees/check.py"""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, M, S, image_diff

ID = 'deux-colonnes-allegees'
S340 = (340, 720, True)
S360 = (360, 780, True)
# Per card (measurement approach of une-colonne-320, extended to every visible chip):
# name lines and words broken across lines (character rects), title lines, pairwise rect
# intersections of avatars, names, crown and +N chip (the crown on its own avatar is the
# intended badge), content leaving the card, and the fit controller's collapse state.
CARDS_JS = r'''(()=>{const R=r=>r&&{x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)};
const vis=e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
const meet=(a,b)=>a&&b&&Math.min(a.right,b.right)-Math.max(a.left,b.left)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.5;
function lines(el,clip){const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let broken=[];let prev=null;const tops=new Set();
 for(let n=walk.nextNode();n;n=walk.nextNode()){const t=n.textContent;for(let i=0;i<t.length;i++){if(/\s/.test(t[i])){prev=null;continue}const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);const b=r.getClientRects()[0];if(!b||!b.width)continue;
  if(clip&&b.top>=clip.bottom-1)continue;const top=Math.round(b.top);tops.add(top);
  if(prev&&Math.abs(prev.top-top)>2)broken.push(prev.ch+'|'+t[i]);prev={ch:t[i],top}}}
 return {lines:tops.size,broken}}
function paint(e){for(let n=e;n;n=n.parentElement){const b=getComputedStyle(n).backgroundColor;if(b&&b!=='transparent'&&!/rgba\(.*,\s*0\)$/.test(b))return b}return null}
const rtl=getComputedStyle(document.documentElement).direction==='rtl';
const list=document.getElementById('content-list'),cols=getComputedStyle(list).gridTemplateColumns.split(' ').length;
const cards=[...list.querySelectorAll(':scope > .cp-card')].filter(vis).slice(0,8).map(c=>{const cb=c.getBoundingClientRect();
 const row=c.querySelector('.cp-authors:not(.cp-author-fit-probe)');const items=[...row.querySelectorAll('.cp-author-item')].filter(vis);
 const parts=[],names=[];let lead=null;
 items.forEach((it,i)=>{const av=it.querySelector('.cp-person-avatar'),st=it.querySelector('.cp-author-name > strong'),cr=it.querySelector('.cp-author-responsibility'),more=it.querySelector('.cp-author-more'),link=it.querySelector('.cp-author-link');
  if(vis(av))parts.push({kind:'avatar',owner:i,r:av.getBoundingClientRect()});
  if(vis(st)){const r=st.getBoundingClientRect();parts.push({kind:'name',owner:i,r});const l=lines(st,r);
   names.push({name:st.textContent,lines:l.lines,broken:l.broken,truncated:st.scrollWidth>st.clientWidth+1,width:+r.width.toFixed(1),accessible:link&&(link.getAttribute('aria-label')||link.textContent.trim()),title:link&&link.title})}
  if(vis(cr)){const r=cr.getBoundingClientRect(),a=av.getBoundingClientRect(),s=getComputedStyle(cr);parts.push({kind:'crown',owner:i,r});
   lead={crown:R(r),avatar:R(a),onAvatar:meet(r,a),towardName:rtl?(r.x+r.width/2)<(a.x+a.width/2):(r.x+r.width/2)>(a.x+a.width/2),
    crownColor:getComputedStyle(cr.querySelector('svg')).stroke,badgeFill:s.backgroundColor,badgeBorder:s.borderTopColor,behind:paint(c.parentElement),title:cr.title,ariaHidden:cr.getAttribute('aria-hidden')}}
  if(vis(more))parts.push({kind:'more',owner:i,r:more.getBoundingClientRect(),text:more.innerText.replace(/\s+/g,''),label:more.getAttribute('aria-label')})});
 const collisions=[];for(let a=0;a<parts.length;a++)for(let b=a+1;b<parts.length;b++){const p=parts[a],q=parts[b];
  const own=p.owner===q.owner&&[p.kind,q.kind].sort().join()==='avatar,crown';if(!own&&meet(p.r,q.r))collisions.push(p.kind+p.owner+'/'+q.kind+q.owner)}
 const h2=c.querySelector('h2'),link=h2.querySelector('a')||h2,title=lines(link,link.getBoundingClientRect());
 const outside=[...c.querySelectorAll('*')].filter(e=>!e.closest('.cp-author-fit-probe')&&vis(e)&&!(e instanceof SVGElement)).filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.left<cb.left-1||r.right>cb.right+1)}).map(e=>e.tagName+'.'+String(e.className).slice(0,24));
 const more=parts.find(p=>p.kind==='more');
 return {card:R(cb),title:link.textContent.trim().slice(0,40),titleLines:title.lines,overflowState:row.dataset.overflow||null,
  avatars:parts.filter(p=>p.kind==='avatar').length,moreText:more?more.text:null,moreLabel:more?more.label:null,names,lead,collisions,outside}});
return {vw:innerWidth,dir:rtl?'rtl':'ltr',section:document.getElementById('content-index').dataset.section,view:document.getElementById('content-index').dataset.view,columns:cols,cards,overflow:document.documentElement.scrollWidth>innerWidth+1}})()'''


def problems(state, small):
    bad = []
    if state['overflow']: bad.append('overflow')
    if small and state['columns'] != 2: bad.append('columns')
    for c in state['cards']:
        for n in c['names']:
            if n['lines'] != 1 or n['broken']: bad.append('name:' + n['name'])
        if c['collisions']: bad.append('collision:' + c['title'] + ':' + ','.join(c['collisions']))
        if c['titleLines'] > 3: bad.append('title:' + c['title'])
        if c['outside']: bad.append('outside:' + c['title'])
    return bad


VIEWS = [  # vue, route, viewport, theme, lang
    ('petit', 'projects', S, 'light', 'fr'),
    ('petit-chroniques', 'journal', S, 'light', 'fr'),
    ('petit-340', 'journal', S340, 'light', 'fr'),
    ('petit-340-projets', 'projects', S340, 'light', 'fr'),
    ('petit-360', 'projects', S360, 'light', 'fr'),
    ('en-petit', 'projects', S, 'light', 'en'),
    ('sombre-petit', 'projects', S, 'dark', 'fr'),
    ('ar-sombre-petit', 'journal', S, 'dark', 'ar'),
    ('mobile', 'projects', M, 'light', 'fr'),
    ('mobile-chroniques', 'journal', M, 'light', 'fr'),
]
SMALL = [v[0] for v in VIEWS if v[2][0] <= 360]
ROW_Y = '(()=>{const a=document.querySelector("#content-list > .cp-card .cp-authors:not(.cp-author-fit-probe)");return Math.max(0,Math.round(a.getBoundingClientRect().top+scrollY-innerHeight*.4))})()'
results = {'id': ID, 'views': [], 'switch': {}, 'list': {}, 'people': {}, 'explorer': {}, 'focus': {}, 'liveArabic': {'dir': None, 'problems': ['not run'], 'crownOnAvatar': False, 'leads': 0}, 'errors': {}, 'passed': False}


def run(s, vue, route, vp, theme, lang):
    case = {'vue': vue, 'route': route, 'viewport': list(vp[:2]), 'theme': theme, 'lang': lang}
    for side, essais in (('avant', []), ('apres', [ID])):
        s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)
        s.shot(f'{side}-{vue}'); case[side] = s.js(CARDS_JS); case[side + 'Errors'] = s.errors()
        if vp[0] <= 360:
            # Bring the first author row to 40 % of the screen, away from the floating stack.
            s.scroll(s.js(ROW_Y)); time.sleep(.6); s.shot(f'{side}-{vue}-auteurs')
            case[side + 'Scrolled'] = s.js(CARDS_JS)
    case['pixelShare'] = round(image_diff(HERE / f'avant-{vue}.png', HERE / f'apres-{vue}.png'), 6)
    small = vp[0] <= 360
    case['problemsBefore'] = problems(case['avant'], small)
    case['problemsAfter'] = problems(case['apres'], small) + (problems(case['apresScrolled'], small) if small else [])
    # The same people stay visible: avatars, +N chip and accessible names are unchanged.
    keep = lambda st: [(c['avatars'], c['moreText'], c['moreLabel'], [(n['name'], n['accessible'], n['title']) for n in c['names']]) for c in st['cards']]
    case['sameAuthors'] = keep(case['avant']) == keep(case['apres'])
    case['crownOnAvatar'] = all(c['lead']['onAvatar'] and c['lead']['towardName'] for c in case['apres']['cards'] if c['lead']) if small else None
    s.record(vue, {'columns': [case['avant']['columns'], case['apres']['columns']], 'problemsBefore': case['problemsBefore'][:5], 'problemsAfter': case['problemsAfter'],
                   'sameAuthors': case['sameAuthors'], 'crownOnAvatar': case['crownOnAvatar'], 'pixelShare': case['pixelShare']})
    return case


s = Session(HERE)
try:
    for view in VIEWS[:5]: results['views'].append(run(s, *view))
finally:
    s.close()
s = Session(HERE)
try:
    for view in VIEWS[5:]: results['views'].append(run(s, *view))
    # List view at 320 px is untouched, and the Grid/List switch still works with the trial.
    for side, essais in (('avant', []), ('apres', [ID])):
        s.open('projects', essais=essais, viewport=S, block_globe=True)
        if side == 'apres': results['switch']['start'] = s.js('document.getElementById("content-index").dataset.view')
        s.click('#content-layout-button'); s.click('#content-layout-menu [data-value=list]'); time.sleep(.8); s.away(); s.blur()
        results['list'][side] = s.js('({view:document.getElementById("content-index").dataset.view,cardColumns:getComputedStyle(document.querySelector("#content-list > .cp-card")).gridTemplateColumns,listColumns:getComputedStyle(document.getElementById("content-list")).gridTemplateColumns})')
        s.shot(f'{side}-liste-petit')
        # Back to Grid: the saved view preference would otherwise open the next page in List.
        s.click('#content-layout-button'); s.click('#content-layout-menu [data-value=grid]'); time.sleep(.8)
        if side == 'apres':
            results['switch']['afterGrid'] = s.js('({view:document.getElementById("content-index").dataset.view,listColumns:getComputedStyle(document.getElementById("content-list")).gridTemplateColumns})')
    results['list']['pixelShare'] = round(image_diff(HERE / 'avant-liste-petit.png', HERE / 'apres-liste-petit.png'), 6)
    s.record('list', results['list']); s.record('switch', results['switch'])
finally:
    s.close()
s = Session(HERE)
try:
    # Profiles grid and Explorer (globe module blocked) are outside the trial's selectors.
    for route, name in (('people', 'profils-petit'), ('explore', 'explorer-petit-sans-globe')):
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open(route, essais=essais, viewport=S, block_globe=True); s.shot(f'{side}-{name}')
        results['people' if route == 'people' else 'explorer'] = {'pixelShare': round(image_diff(HERE / f'avant-{name}.png', HERE / f'apres-{name}.png'), 6)}
    s.record('people', results['people']); s.record('explorer', results['explorer'])
    # Keyboard focus on the lead author link: the badge stays inside the focused link.
    s.open('projects', essais=[ID], viewport=S, block_globe=True)
    s.key('Tab')  # keyboard modality, then the row is brought back away from the floating stack
    s.scroll(s.js(ROW_Y)); time.sleep(.4)
    results['focus'] = s.js('(()=>{const l=document.querySelector("#content-list > .cp-card .cp-authors:not(.cp-author-fit-probe) .cp-author-link");l.focus({preventScroll:true});const s=getComputedStyle(l),r=l.getBoundingClientRect(),b=l.querySelector(".cp-author-responsibility").getBoundingClientRect();return{focused:document.activeElement===l,focusVisible:l.matches(":focus-visible"),outline:s.outlineStyle+" "+s.outlineWidth,badgeInside:b.left>=r.left&&b.right<=r.right&&b.top>=r.top&&b.bottom<=r.bottom,link:{x:r.x,y:r.y,w:r.width,h:r.height}}})()')
    time.sleep(.3); s.shot('apres-focus-petit'); s.record('focus', results['focus'])
    # Live language change (no reload): the re-rendered rows follow the new direction.
    s.blur(); s.js('(()=>{window.horizonStudy.setLocale("ar");return true})()')
    s.wait('document.documentElement.lang==="ar"&&document.documentElement.dir==="rtl"', 10); time.sleep(1)
    live = s.js(CARDS_JS)
    results['liveArabic'] = {'dir': live['dir'], 'columns': live['columns'], 'problems': problems(live, True),
                             'crownOnAvatar': all(c['lead']['onAvatar'] and c['lead']['towardName'] for c in live['cards'] if c['lead']),
                             'leads': sum(1 for c in live['cards'] if c['lead'])}
    s.record('liveArabic', results['liveArabic'])
    results['errors'] = s.errors()
finally:
    s.close()

v = {c['vue']: c for c in results['views']}
results['passed'] = bool(
    all(not v[k]['problemsAfter'] and v[k]['sameAuthors'] and v[k]['crownOnAvatar'] for k in SMALL)
    and v['mobile']['pixelShare'] == 0 and v['mobile-chroniques']['pixelShare'] == 0
    and results['list']['pixelShare'] == 0 and results['list']['avant'] == results['list']['apres'] and results['list']['apres']['view'] == 'list'
    and results['switch']['start'] == 'grid' and results['switch']['afterGrid']['view'] == 'grid' and len(results['switch']['afterGrid']['listColumns'].split(' ')) == 2
    and results['liveArabic']['dir'] == 'rtl' and not results['liveArabic']['problems'] and results['liveArabic']['crownOnAvatar'] and results['liveArabic']['leads'] > 0
    and results['people']['pixelShare'] == 0 and results['explorer']['pixelShare'] == 0
    and results['focus']['focusVisible'] and results['focus']['badgeInside']
    and not any(c['apresErrors'] for c in results['views']) and not results['errors'])
(HERE / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
print('passed', results['passed'])
