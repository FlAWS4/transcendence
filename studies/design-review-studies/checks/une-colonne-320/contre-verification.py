"""Independent re-check of trial une-colonne-320 (adversarial pass, 14 Oct 2026).
Measures every visible author (not only the first), exact pixel identity (threshold 0)
plus a full layout signature below the fold for unaffected states, live language and
theme changes without reload, keyboard focus, and Explorer with the real globe.
Run: python3 -I studies/design-review-studies/checks/une-colonne-320/contre-verification.py"""
import hashlib, json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, L, image_diff

ID = 'une-colonne-320'
S340, S360, S361 = (340, 720, True), (360, 780, True), (361, 780, True)
# Every visible card of the list: columns, title lines, each visible author's name lines and
# words split across lines (per-character rects; a break after a hyphen is a normal one),
# pairwise rect hits between the label, avatars, names, crown and +N chip, and descendants
# leaving the card horizontally.
AUDIT_JS = r'''(()=>{const vis=e=>!!e&&!e.closest('.cp-author-fit-probe')&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';
const R=r=>r&&{x:+r.left.toFixed(1),y:+r.top.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)};
const hit=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.5;
function text(el){const clip=el.getBoundingClientRect(),tops=[],breaks=[];let prev=null;const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
 for(let n=walk.nextNode();n;n=walk.nextNode())for(let i=0;i<n.data.length;i++){const ch=n.data[i];if(/\s/.test(ch)){prev=null;continue}
  const g=document.createRange();g.setStart(n,i);g.setEnd(n,i+1);const r=[...g.getClientRects()].find(q=>q.width>0&&q.height>0);if(!r)continue;
  if(r.top>=clip.bottom-1){prev=null;continue}const top=Math.round(r.top);if(!tops.some(t=>Math.abs(t-top)<=2))tops.push(top);
  if(prev&&Math.abs(prev.top-top)>2&&!/[-\u2010\u2013\u2014]/.test(prev.ch))breaks.push(prev.ch+'|'+ch);prev={ch,top}}
 return{lines:tops.length,breaks}}
const index=document.getElementById('content-index'),list=document.getElementById('content-list');
const cards=[...list.querySelectorAll(':scope > .cp-card')].filter(vis).map(card=>{const cb=card.getBoundingClientRect(),row=card.querySelector('.cp-authors:not(.cp-author-fit-probe)'),parts=[],names=[];
 if(row){const label=row.querySelector(':scope > .cp-authors-label');if(vis(label))parts.push({k:'label',o:'',r:label.getBoundingClientRect()});
  [...row.querySelectorAll(':scope > .cp-author-list > .cp-author-item')].filter(vis).forEach((item,i)=>{
   const av=item.querySelector('.cp-person-avatar'),st=item.querySelector('.cp-author-name > strong'),cr=item.querySelector('.cp-author-responsibility'),mo=item.querySelector('.cp-author-more'),link=item.querySelector('.cp-author-link');
   if(vis(av))parts.push({k:'avatar',o:i,r:av.getBoundingClientRect()});
   if(vis(st)){const t=text(st);names.push({name:st.textContent,lines:t.lines,breaks:t.breaks,truncated:st.scrollWidth>st.clientWidth+1,width:+st.getBoundingClientRect().width.toFixed(1),accessible:link.getAttribute('aria-label')||link.textContent.trim()});parts.push({k:'name',o:i,r:st.getBoundingClientRect()})}
   if(vis(cr))parts.push({k:'crown',o:i,r:cr.getBoundingClientRect()});
   if(vis(mo))parts.push({k:'more',o:i,r:mo.getBoundingClientRect(),text:mo.innerText.replace(/\s+/g,''),label:mo.getAttribute('aria-label')})})}
 const hits=[];for(let a=0;a<parts.length;a++)for(let b=a+1;b<parts.length;b++)if(hit(parts[a].r,parts[b].r))hits.push(parts[a].k+parts[a].o+'/'+parts[b].k+parts[b].o);
 const title=card.querySelector('.cp-card-title-link'),tl=text(title);
 const outside=[...card.querySelectorAll('*')].filter(e=>vis(e)&&!(e instanceof SVGElement)).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.left<cb.left-1||r.right>cb.right+1)}).map(e=>e.tagName+'.'+String(e.className).slice(0,30));
 const more=parts.find(p=>p.k==='more');
 return{title:title.textContent.trim().slice(0,48),card:R(cb),titleLines:tl.lines,titleBreaks:tl.breaks,collapsed:row?row.dataset.overflow||null:null,authorsShown:parts.filter(p=>p.k==='avatar').length,more:more?more.text:null,moreLabel:more?more.label:null,names,hits,outside}});
const first=cards[0],eighth=cards[Math.min(7,cards.length-1)];
return{vw:innerWidth,lang:document.documentElement.lang,dir:getComputedStyle(document.documentElement).direction,theme:document.documentElement.dataset.theme,section:index.dataset.section,view:index.dataset.view,
 columns:getComputedStyle(list).gridTemplateColumns.split(' ').length,tracks:getComputedStyle(list).gridTemplateColumns,overflowX:document.documentElement.scrollWidth>innerWidth+1,
 firstEightHeight:cards.length?+(eighth.card.y+eighth.card.h-first.card.y).toFixed(1):0,cards}})()'''
# Rects of every element of the page (rounded): equal signatures mean the same layout,
# including what lies below the screenshot.
LAYOUT_JS = r'''(()=>{const out=[];for(const e of document.querySelectorAll('body *')){const r=e.getBoundingClientRect();out.push(e.tagName+'.'+String(e.className.baseVal??e.className)+'@'+[r.left,r.top+scrollY,r.width,r.height].map(v=>Math.round(v*10)/10).join(','))}return out.join('\n')})()'''
# Rules of the trial's stylesheet that currently apply, and how many rendered elements they reach.
REACH_JS = r'''((id)=>{const sheet=[...document.styleSheets].find(s=>s.ownerNode?.dataset?.essai===id);if(!sheet)return{loaded:false};const out=[];
 const walk=(rules,active)=>{for(const r of rules){if(r instanceof CSSMediaRule)walk(r.cssRules,active&&matchMedia(r.conditionText).matches);else if(r instanceof CSSStyleRule){const els=[...document.querySelectorAll(r.selectorText)];out.push({selector:r.selectorText.slice(-70),mediaActive:active,matched:els.length,rendered:els.filter(e=>e.getClientRects().length>0).length})}}};
 walk(sheet.cssRules,true);return{loaded:true,rules:out,renderedWhileActive:out.filter(r=>r.mediaActive).reduce((n,r)=>n+r.rendered,0)}})'''


def exact(a, b):
    """Differing pixels (any channel) between two PNGs, plus the helper's thresholded share."""
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(a).convert('RGB'), dtype=int); y = np.asarray(Image.open(b).convert('RGB'), dtype=int)
    if x.shape != y.shape: return {'sameSize': False}
    return {'sameSize': True, 'differentPixels': int((np.abs(x - y).sum(axis=2) > 0).sum()), 'thresholdShare': round(image_diff(a, b), 6)}


def problems(state, one_column):
    bad = []
    if one_column and state['columns'] != 1: bad.append('columns:' + state['tracks'])
    if state['overflowX']: bad.append('overflowX')
    for c in state['cards']:
        for n in c['names']:
            if n['lines'] != 1 or n['breaks']: bad.append(f"name:{n['name']}:{n['lines']}:{''.join(n['breaks'])}")
        if c['hits']: bad.append('hits:' + c['title'] + ':' + ','.join(c['hits']))
        if c['titleLines'] > 3 or c['titleBreaks']: bad.append('title:' + c['title'])
        if c['outside']: bad.append('outside:' + c['title'] + ':' + ','.join(c['outside'][:3]))
    return bad


def digest(text): return hashlib.sha256(text.encode()).hexdigest()[:16]


results = {'id': ID, 'small': [], 'identity': [], 'people': [], 'pages': [], 'switch': {}, 'live': {}, 'focus': {}, 'explorer': {}, 'errors': [], 'passed': False}
SMALL = [  # vue, route, viewport, theme, lang
    ('cv-petit', 'projects', S, 'light', 'fr'),
    ('cv-en-petit', 'projects', S, 'light', 'en'),
    ('cv-petit-chroniques', 'journal', S, 'light', 'fr'),
    ('cv-ar-sombre-petit', 'journal', S, 'dark', 'ar'),
    ('cv-ar-sombre-340-projets', 'projects', S340, 'dark', 'ar'),
    ('cv-340-chroniques', 'journal', S340, 'light', 'fr'),
    ('cv-360', 'projects', S360, 'light', 'fr'),
]
s = Session(HERE)
try:
    for vue, route, vp, theme, lang in SMALL:
        case = {'vue': vue, 'route': route, 'viewport': list(vp[:2]), 'theme': theme, 'lang': lang}
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)
            case[side] = s.js(AUDIT_JS); case[side + 'Errors'] = s.errors()
        case['problemsBefore'] = problems(case['avant'], False); case['problemsAfter'] = problems(case['apres'], True)
        case['sameAuthorsShown'] = [c['authorsShown'] for c in case['avant']['cards']] == [c['authorsShown'] for c in case['apres']['cards']]
        results['small'].append(case)
        s.record(vue, {'columns': [case['avant']['columns'], case['apres']['columns']], 'cards': len(case['apres']['cards']), 'before': len(case['problemsBefore']), 'after': case['problemsAfter'],
                       'height8': [case['avant']['firstEightHeight'], case['apres']['firstEightHeight']], 'titleLines': [[c['titleLines'] for c in case[k]['cards']] for k in ('avant', 'apres')]})
finally:
    s.close()

IDENTITY = [  # states the trial must leave untouched: exact pixels + whole-page layout
    ('mobile', 'projects', M, 'light', 'fr'),
    ('mobile-chroniques', 'journal', M, 'dark', 'ar'),
    ('limite-361', 'projects', S361, 'light', 'fr'),
    ('ordinateur', 'projects', D, 'light', 'fr'),
    ('paysage', 'journal', L, 'light', 'fr'),
]
s = Session(HERE)
try:
    for vue, route, vp, theme, lang in IDENTITY:
        case = {'vue': vue, 'route': route, 'viewport': list(vp[:2]), 'theme': theme, 'lang': lang}
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)
            s.shot(f'{side}-{vue}'); layout = s.js(LAYOUT_JS, 20)
            case[side] = {'layout': digest(layout), 'elements': layout.count('\n') + 1, 'columns': s.js('getComputedStyle(document.getElementById("content-list")).gridTemplateColumns'), 'errors': s.errors()}
            if side == 'apres': case['reach'] = s.js(REACH_JS + f'({json.dumps(ID)})')
        case['pixels'] = exact(HERE / f'avant-{vue}.png', HERE / f'apres-{vue}.png')
        case['sameLayout'] = case['avant']['layout'] == case['apres']['layout']
        results['identity'].append(case); s.record(vue, {'pixels': case['pixels'], 'sameLayout': case['sameLayout'], 'reach': case['reach'].get('renderedWhileActive')})
finally:
    s.close()

s = Session(HERE)
try:
    # Pages outside the trial at 320 px: Profiles grid (also re-measured for the same breakage),
    # a project detail and the projects tab of a profile.
    BREAKS_JS = r'''(()=>{const out=[];for(const card of document.querySelectorAll('#content-list > .cp-card')){for(const el of card.querySelectorAll('h2,.cp-profile-login,.cp-profile-role,.cp-profile-status,.cp-profile-tags li')){
     if(!el.getClientRects().length)continue;const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let prev=null;
     for(let n=walk.nextNode();n;n=walk.nextNode())for(let i=0;i<n.data.length;i++){const ch=n.data[i];if(/\s/.test(ch)){prev=null;continue}const g=document.createRange();g.setStart(n,i);g.setEnd(n,i+1);const r=[...g.getClientRects()].find(q=>q.width>0);if(!r)continue;const top=Math.round(r.top);
      if(prev&&Math.abs(prev.top-top)>2)out.push(el.className+':'+el.textContent.trim().slice(0,30)+':'+prev.ch+'|'+ch);prev={ch,top}}}
     const st=card.querySelector('.cp-profile-status'),fav=card.querySelector('.cp-favorite');if(st&&fav&&st.getClientRects().length&&fav.getClientRects().length){const a=st.getBoundingClientRect(),b=fav.getBoundingClientRect();if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.5)out.push('status/heart:'+card.querySelector('h2').textContent)}}
     return{columns:getComputedStyle(document.getElementById('content-list')).gridTemplateColumns,cards:document.querySelectorAll('#content-list > .cp-card').length,breaks:out,overflowX:document.documentElement.scrollWidth>innerWidth+1}})()'''
    for vp, name in ((S, 'profils-petit'), (S340, 'profils-340')):
        case = {'vue': name}
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open('people', essais=essais, viewport=vp, block_globe=True); s.shot(f'{side}-{name}')
            case[side] = s.js(BREAKS_JS); case[side + 'Layout'] = digest(s.js(LAYOUT_JS, 20))
        case['pixels'] = exact(HERE / f'avant-{name}.png', HERE / f'apres-{name}.png'); case['sameLayout'] = case['avantLayout'] == case['apresLayout']
        results['people'].append(case); s.record(name, {'columns': case['apres']['columns'], 'breaks': case['avant']['breaks'], 'pixels': case['pixels'], 'sameLayout': case['sameLayout']})
    for route, name in (('projects/ft-transcendence-building-together?tab=overview', 'fiche-projet-petit'), ('people/profile-leila-mansour?tab=projects', 'profil-projets-petit')):
        case = {'vue': name, 'route': route}
        for side, essais in (('avant', []), ('apres', [ID])):
            s.open(route, essais=essais, viewport=S, block_globe=True); s.shot(f'{side}-{name}'); case[side + 'Layout'] = digest(s.js(LAYOUT_JS, 20))
        case['pixels'] = exact(HERE / f'avant-{name}.png', HERE / f'apres-{name}.png'); case['sameLayout'] = case['avantLayout'] == case['apresLayout']
        results['pages'].append(case); s.record(name, {'pixels': case['pixels'], 'sameLayout': case['sameLayout']})
    # Grid/List switch at 320 px: List equals the baseline List, Grid comes back in one column.
    for side, essais in (('avant', []), ('apres', [ID])):
        s.open('projects', essais=essais, viewport=S, block_globe=True)
        s.click('#content-layout-button'); s.click('#content-layout-menu [data-value=list]'); time.sleep(.8); s.away(); s.blur()
        s.shot(f'{side}-cv-liste-petit'); results['switch'][side + 'List'] = {'view': s.js('document.getElementById("content-index").dataset.view'), 'layout': digest(s.js(LAYOUT_JS, 20))}
        s.click('#content-layout-button'); s.click('#content-layout-menu [data-value=grid]'); time.sleep(.8)
        results['switch'][side + 'Grid'] = s.js('({view:document.getElementById("content-index").dataset.view,tracks:getComputedStyle(document.getElementById("content-list")).gridTemplateColumns})')
    results['switch']['listPixels'] = exact(HERE / 'avant-cv-liste-petit.png', HERE / 'apres-cv-liste-petit.png')
    results['switch']['sameListLayout'] = results['switch']['avantList']['layout'] == results['switch']['apresList']['layout']
    s.record('switch', results['switch'])
    # Live changes without reload through the account menu: FR light -> AR dark -> EN light.
    for side, essais in (('avant', []), ('apres', [ID])):
        s.open('projects', essais=essais, viewport=S, block_globe=True)
        s.settings('ar', 'dark'); s.wait('document.documentElement.lang==="ar"&&document.documentElement.dataset.theme==="dark"', 10); time.sleep(.8)
        ar = s.js(AUDIT_JS); y = s.js('(()=>{const a=document.querySelector("#content-list > .cp-card .cp-authors:not(.cp-author-fit-probe)");return Math.max(0,Math.round(a.getBoundingClientRect().top+scrollY-innerHeight*.4))})()')
        s.scroll(y); s.shot(f'{side}-direct-ar-sombre-petit'); s.scroll(0)
        s.settings('en', 'light'); s.wait('document.documentElement.lang==="en"&&document.documentElement.dataset.theme==="light"', 10); time.sleep(.8)
        en = s.js(AUDIT_JS)
        results['live'][side] = {'ar': {'lang': ar['lang'], 'dir': ar['dir'], 'theme': ar['theme'], 'columns': ar['columns'], 'problems': problems(ar, side == 'apres')},
                                 'en': {'lang': en['lang'], 'dir': en['dir'], 'theme': en['theme'], 'columns': en['columns'], 'problems': problems(en, side == 'apres')}, 'errors': s.errors()}
    s.record('live', results['live'])
    # Keyboard: Tab from the top reaches the first card's links, with a visible focus ring.
    # The previous step left this very URL open: leave it first, or open() would not reload.
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.5)
    s.open('projects', essais=[ID], viewport=S, block_globe=True)
    seen = None
    for _ in range(40):
        s.key('Tab')
        seen = s.js('(()=>{const a=document.activeElement;if(!a||!a.closest("#content-list"))return null;const st=getComputedStyle(a),r=a.getBoundingClientRect();return{cls:a.className,text:(a.getAttribute("aria-label")||a.textContent).trim().slice(0,40),focusVisible:a.matches(":focus-visible"),outline:st.outlineStyle+" "+st.outlineWidth,inside:r.left>=0&&r.right<=innerWidth}})()')
        if seen: break
    results['focus'] = seen or {}; s.record('focus', results['focus'])
    results['errors'] = s.errors()
finally:
    s.close()

s = Session(HERE)
try:
    # Explorer at 320 px with the real globe: trial vs baseline, and baseline vs itself (noise).
    for name, essais in (('avant', []), ('apres', [ID]), ('avant-bis', [])):
        s.open('explore', essais=essais, viewport=S, block_globe=False, settle=3)
        s.shot(f'{name}-explorer-globe-petit')
        results['explorer'][name] = {'globe': s.js('Boolean(document.querySelector("#globe canvas"))&&document.querySelector("#loading")?.hidden===true'), 'errors': s.errors()}
        if essais: results['explorer']['reach'] = s.js(REACH_JS + f'({json.dumps(ID)})')
    results['explorer']['trialVsBaseline'] = exact(HERE / 'avant-explorer-globe-petit.png', HERE / 'apres-explorer-globe-petit.png')
    results['explorer']['baselineVsBaseline'] = exact(HERE / 'avant-explorer-globe-petit.png', HERE / 'avant-bis-explorer-globe-petit.png')
    s.record('explorer', {k: results['explorer'][k] for k in ('trialVsBaseline', 'baselineVsBaseline')})
finally:
    s.close()

sw, live, ex = results['switch'], results['live'], results['explorer']
results['passed'] = bool(
    all(not c['problemsAfter'] and c['apres']['columns'] == 1 and not c['apresErrors'] for c in results['small'])
    and all(c['pixels'].get('differentPixels') == 0 and c['sameLayout'] and c['reach']['renderedWhileActive'] == 0 for c in results['identity'])
    and all(c['pixels'].get('differentPixels') == 0 and c['sameLayout'] for c in results['people'] + results['pages'])
    and sw['listPixels'].get('differentPixels') == 0 and sw['sameListLayout'] and sw['apresList']['view'] == 'list'
    and sw['apresGrid']['view'] == 'grid' and len(sw['apresGrid']['tracks'].split(' ')) == 1
    and live['apres']['ar']['dir'] == 'rtl' and live['apres']['ar']['theme'] == 'dark' and not live['apres']['ar']['problems']
    and live['apres']['en']['lang'] == 'en' and live['apres']['en']['theme'] == 'light' and not live['apres']['en']['problems'] and not live['apres']['errors']
    and results['focus'].get('focusVisible') and not results['errors']
    and ex['avant']['globe'] and ex['apres']['globe'] and ex['reach']['renderedWhileActive'] == 0
    and ex['trialVsBaseline'].get('differentPixels', 1) <= ex['baselineVsBaseline'].get('differentPixels', 0))
(HERE / 'contre-verification.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
print('passed', results['passed'])
