"""Trial une-colonne-320: one card per row at <= 360 px for Projects and Chronicles.
Run: python3 -I studies/design-review-studies/checks/une-colonne-320/check.py"""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, M, S, image_diff

ID = 'une-colonne-320'
S340 = (340, 720, True)
S360 = (360, 780, True)
# Per card: author name lines and words broken across lines (character rects), title lines,
# rect intersections in the author row, and content leaving the card.
CARDS_JS = r'''(()=>{const R=r=>r&&{x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)};
const vis=e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
const meet=(a,b)=>a&&b&&Math.min(a.right,b.right)-Math.max(a.left,b.left)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.5;
function lines(el,clip){const out=[];const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let broken=[];let prev=null;const tops=new Set();
 for(let n=walk.nextNode();n;n=walk.nextNode()){const t=n.textContent;for(let i=0;i<t.length;i++){if(/\s/.test(t[i])){prev=null;continue}const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);const b=r.getClientRects()[0];if(!b||!b.width)continue;
  if(clip&&b.top>=clip.bottom-1)continue;const top=Math.round(b.top);tops.add(top);
  if(prev&&/\S/.test(t[i])&&/\S/.test(prev.ch)&&Math.abs(prev.top-top)>2)broken.push(prev.ch+'|'+t[i]);prev={ch:t[i],top}}}
 return {lines:tops.size,broken}}
const list=document.getElementById('content-list'),cols=getComputedStyle(list).gridTemplateColumns.split(' ').length;
const cards=[...list.querySelectorAll(':scope > .cp-card')].filter(vis).slice(0,8).map(c=>{const cb=c.getBoundingClientRect();
 const first=c.querySelector('.cp-authors:not(.cp-author-fit-probe) .cp-author-item:not(.cp-author-more-item)');const visibleItems=[...c.querySelectorAll('.cp-authors:not(.cp-author-fit-probe) .cp-author-item')].filter(vis);
 const strong=first&&first.querySelector('.cp-author-name > strong'),crown=first&&first.querySelector('.cp-author-responsibility'),avatar=first&&first.querySelector('.cp-person-avatar'),more=[...c.querySelectorAll('.cp-authors:not(.cp-author-fit-probe) .cp-author-more')].find(vis);
 const sb=strong&&strong.getBoundingClientRect(),crb=crown&&vis(crown)?crown.getBoundingClientRect():null,ab=avatar&&avatar.getBoundingClientRect(),mb=more?more.getBoundingClientRect():null;
 const name=strong?lines(strong,sb):null,h2=c.querySelector('h2'),link=h2.querySelector('a')||h2,title=lines(link,link.getBoundingClientRect());
 const outside=[...c.querySelectorAll('*')].filter(e=>!e.closest('.cp-author-fit-probe')&&vis(e)&&!['svg','path','circle','rect','g','line','ellipse','polyline','polygon','use','defs','linearGradient','stop','text','tspan','clipPath','mask','pattern','image'].includes(e.tagName)).filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.left<cb.left-1||r.right>cb.right+1)}).map(e=>e.tagName+'.'+String(e.className).slice(0,24));
 const authorLink=first&&first.querySelector('.cp-author-link');
 return {card:R(cb),title:link.textContent.trim().slice(0,40),titleLines:title.lines,titleBroken:title.broken,name:strong&&strong.textContent,nameLines:name&&name.lines,nameBroken:name&&name.broken,
  nameTruncated:Boolean(strong&&strong.scrollWidth>strong.clientWidth+1),nameBox:R(sb),crown:R(crb),avatar:R(ab),more:R(mb),moreText:more?more.innerText.replace(/\s+/g,''):null,visibleAuthors:visibleItems.length,
  accessibleName:authorLink&&(authorLink.getAttribute('aria-label')||authorLink.textContent.trim()),
  collisions:{nameCrown:meet(sb,crb),nameMore:meet(sb,mb),crownMore:meet(crb,mb),avatarName:meet(ab,sb),avatarMore:meet(ab,mb),crownAvatar:meet(crb,ab)},outside}});
return {vw:innerWidth,section:document.getElementById('content-index').dataset.section,view:document.getElementById('content-index').dataset.view,columns:cols,cards,overflow:document.documentElement.scrollWidth>innerWidth+1}})()'''
PEOPLE_JS = r'''(()=>{const vis=e=>e&&e.getClientRects().length;const list=document.getElementById('content-list');
const meet=(a,b)=>a&&b&&Math.min(a.right,b.right)-Math.max(a.left,b.left)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.5;
const cards=[...list.querySelectorAll(':scope > .cp-card')].filter(vis).slice(0,8).map(c=>{const h=c.querySelector('h2');let broken=[],prev=null;const n=h.firstChild;
 if(n&&n.nodeType===3)for(let i=0;i<n.textContent.length;i++){if(/\s/.test(n.textContent[i])){prev=null;continue}const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);const b=r.getClientRects()[0];if(!b)continue;const top=Math.round(b.top);const ch=n.textContent[i];
  if(prev&&/\S/.test(ch)&&/\S/.test(prev.ch)&&Math.abs(prev.top-top)>2)broken.push(prev.ch+'|'+ch);prev={ch,top}}
 const st=c.querySelector('.cp-profile-status')?.getBoundingClientRect(),fav=c.querySelector('.cp-favorite')?.getBoundingClientRect(),cb=c.getBoundingClientRect();
 return {name:h.textContent,broken,statusHeart:meet(st,fav),outside:[...c.querySelectorAll('*')].some(e=>{const r=e.getBoundingClientRect();return r.width&&(r.left<cb.left-1||r.right>cb.right+1)})}});
return {columns:getComputedStyle(list).gridTemplateColumns.split(' ').length,cards,overflow:document.documentElement.scrollWidth>innerWidth+1}})()'''


def card_ok(state, one_column):
    bad = []
    if one_column and state['columns'] != 1: bad.append('columns')
    if state['overflow']: bad.append('overflow')
    for c in state['cards']:
        if c['name'] and (c['nameLines'] != 1 or c['nameBroken']): bad.append('name:' + c['name'])
        if any(v for k, v in c['collisions'].items()): bad.append('collision:' + c['title'])
        if c['outside']: bad.append('outside:' + c['title'])
    return bad


VIEWS = [  # vue, route, viewport, theme, lang
    ('petit', 'projects', S, 'light', 'fr'),
    ('petit-chroniques', 'journal', S, 'light', 'fr'),
    ('petit-340', 'journal', S340, 'light', 'fr'),
    ('petit-340-projets', 'projects', S340, 'light', 'fr'),
    ('petit-360', 'projects', S360, 'light', 'fr'),
    ('en-petit', 'projects', S, 'light', 'en'),
    ('ar-sombre-petit', 'journal', S, 'dark', 'ar'),
    ('mobile', 'projects', M, 'light', 'fr'),
    ('mobile-chroniques', 'journal', M, 'light', 'fr'),
]
SMALL = [v[0] for v in VIEWS if v[2][0] <= 360]
results = {'id': ID, 'views': [], 'switch': {}, 'people': [], 'profileProjects': {}, 'explorer': {}, 'errors': {}, 'passed': False}
s = Session(HERE)
try:
    for vue, route, vp, theme, lang in VIEWS:
        case = {'vue': vue, 'route': route, 'viewport': list(vp[:2]), 'theme': theme, 'lang': lang}
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)
            s.shot(f'{side}-{vue}'); case[side] = s.js(CARDS_JS); case[side + 'Errors'] = s.errors()
            if vp[0] <= 360:
                # Bring the first author row to 40 % of the screen, away from the floating stack.
                y = s.js('(()=>{const a=document.querySelector("#content-list > .cp-card .cp-authors:not(.cp-author-fit-probe)");return Math.max(0,Math.round(a.getBoundingClientRect().top+scrollY-innerHeight*.4))})()')
                s.scroll(y); time.sleep(.6); s.shot(f'{side}-{vue}-auteurs')
        case['pixelShare'] = round(image_diff(HERE / f'avant-{vue}.png', HERE / f'apres-{vue}.png'), 6)
        case['problemsBefore'] = card_ok(case['avant'], False); case['problemsAfter'] = card_ok(case['apres'], vp[0] <= 360)
        results['views'].append(case)
        s.record(vue, {'columns': [case['avant']['columns'], case['apres']['columns']], 'problemsBefore': case['problemsBefore'][:6], 'problemsAfter': case['problemsAfter'], 'pixelShare': case['pixelShare']})
    # Grid/List switch with the trial at 320 px.
    s.open('projects', essais=[ID], viewport=S, block_globe=True)
    sw = {'start': s.js('document.getElementById("content-index").dataset.view')}
    s.click('#content-layout-button'); s.click('#content-layout-menu [data-value=list]'); time.sleep(.8)
    sw['afterList'] = s.js('({view:document.getElementById("content-index").dataset.view,cardColumns:getComputedStyle(document.querySelector("#content-list > .cp-card")).gridTemplateColumns,listColumns:getComputedStyle(document.getElementById("content-list")).gridTemplateColumns})')
    s.shot('apres-liste-petit')
    s.click('#content-layout-button'); s.click('#content-layout-menu [data-value=grid]'); time.sleep(.8)
    sw['afterGrid'] = s.js('({view:document.getElementById("content-index").dataset.view,listColumns:getComputedStyle(document.getElementById("content-list")).gridTemplateColumns})')
    results['switch'] = sw; s.record('switch', sw)
    s.open('projects', viewport=S, block_globe=True)
    s.click('#content-layout-button'); s.click('#content-layout-menu [data-value=list]'); time.sleep(.8)
    results['switch']['baselineList'] = s.js('({view:document.getElementById("content-index").dataset.view,cardColumns:getComputedStyle(document.querySelector("#content-list > .cp-card")).gridTemplateColumns,listColumns:getComputedStyle(document.getElementById("content-list")).gridTemplateColumns})')
    s.shot('avant-liste-petit')
    # Profiles grid and the projects tab of a profile are left as they are: measured only.
    for vp, name in ((S, 'petit'), (S340, 'petit-340')):
        s.open('people', essais=[ID], viewport=vp, block_globe=True)
        results['people'].append({'vue': name, **s.js(PEOPLE_JS)})
    s.open('people/profile-leila-mansour?tab=projects', essais=[ID], viewport=S, block_globe=True)
    results['profileProjects'] = s.js('(()=>{const g=document.querySelector(".cp-profile-related-grid");return g?{columns:getComputedStyle(g).gridTemplateColumns.split(" ").length,cards:g.children.length}:null})()')
    results['errors'] = s.errors()
    # Explorer (globe module blocked): the trial's selectors only reach the content grid.
    for side, essais in (('avant', []), ('apres', [ID])):
        s.open('explore', essais=essais, viewport=S, block_globe=True)
        s.shot(f'{side}-explorer-petit-sans-globe')
    results['explorer'] = {'pixelShare': round(image_diff(HERE / 'avant-explorer-petit-sans-globe.png', HERE / 'apres-explorer-petit-sans-globe.png'), 6)}
    s.record('explorer', results['explorer'])
finally:
    s.close()

v = {c['vue']: c for c in results['views']}
results['passed'] = bool(
    all(not v[k]['problemsAfter'] for k in SMALL)
    and v['mobile']['pixelShare'] == 0 and v['mobile-chroniques']['pixelShare'] == 0
    and results['explorer']['pixelShare'] == 0
    and results['switch']['afterList']['view'] == 'list' and results['switch']['afterList'] == {**results['switch']['baselineList']}
    and results['switch']['afterGrid']['view'] == 'grid' and len(results['switch']['afterGrid']['listColumns'].split(' ')) == 1
    and not any(c['apresErrors'] for c in results['views']))
(HERE / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
print('passed', results['passed'])
