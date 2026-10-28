"""Trial echelle-unifiee: distinct visible font sizes, radii and elevations before/after on six key views,
overlays and extra widths; overflow; combinations with lisibilite-textes and titres-forts; captures;
mapping table per component, broken title words and keyboard focus rings.
Run: python3 -I studies/design-review-studies/checks/echelle-unifiee/check.py [phase ...]
(phases: key overlays extra arrival combinations mapping; results.json keeps the phases not run)."""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, L, image_diff

ID = 'echelle-unifiee'
SCALE = [12, 14, 16, 20, 28, 35]
PID, LEILA, ART = 'ft-transcendence-building-together', 'profile-leila-mansour', 'journal-an-evening-debugging'
T = (834, 1112, True)    # tablet portrait, between two steps
W = (1024, 768, False)   # small laptop

# Inline links and card title links (their box follows the number of text lines) are reported apart
# from the 44 px target comparison.
# Whole page, visible elements only (sr-only, hidden tabs and clipped probes excluded).
# Text zones: brand wordmark, SVG illustrations, map attribution, dock labels, compact densities
# and emoji glyphs are reported apart from the interface text ('ui').
MEASURE_JS = r'''(()=>{
const clipped=el=>{for(let e=el;e&&e.nodeType===1;e=e.parentElement){const s=getComputedStyle(e);if((s.clip&&s.clip!=='auto')||(s.clipPath&&s.clipPath!=='none'&&/inset\(50%/.test(s.clipPath)))return true;if(s.display!=='contents'&&s.overflow!=='visible'){const r=e.getBoundingClientRect();if(r.width<=1.5||r.height<=1.5)return true}}return false};
const vis=el=>{if(!el.checkVisibility({opacityProperty:true,visibilityProperty:true}))return false;const r=el.getBoundingClientRect();return r.width>1.5&&r.height>1.5&&!clipped(el)};
const alpha=c=>{if(!c||c==='transparent')return 0;const m=c.match(/rgba?\(([^)]+)\)/);if(m){const p=m[1].split(/[ ,\/]+/).filter(Boolean);return p.length>3?Number(p[3]):1}const n=c.match(/color\([^)]*\/\s*([\d.]+)\)/);return n?Number(n[1]):1};
const key=el=>{const c=typeof el.className==='string'?el.className.trim().split(/\s+/).slice(0,2).join('.'):'';const p=el.parentElement;const pc=p&&typeof p.className==='string'?p.className.trim().split(/\s+/)[0]:'';return el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(c?'.'+c:'')+(!c&&!el.id&&p?' < '+p.tagName.toLowerCase()+(p.id?'#'+p.id:'')+(pc?'.'+pc:''):'')};
const zone=el=>el.closest('svg')?'svg':el.closest('.brand')?'brand':el.closest('.maplibregl-ctrl-attrib,.map-credit')?'attribution':el.closest('#main-nav>button[data-section]')?'dock':el.closest('[data-detail-density]')?'density':el.closest('.cp-reaction-icon,.cp-comments-emoji-choice')?'emoji':'ui';
const texts=[];const seen=new Set();const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){if(!n.textContent.trim())continue;const el=n.parentElement;if(!el||seen.has(el))continue;seen.add(el);if(!vis(el))continue;const s=getComputedStyle(el);
 texts.push({k:key(el),z:zone(el),fs:Math.round(parseFloat(s.fontSize)*100)/100})}
const corners=['borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius'];
const outer=v=>{if(!v||v==='none')return '';return v.split(/,(?![^(]*\))/).map(x=>x.trim()).filter(p=>!/inset/.test(p)).filter(p=>{const nums=p.replace(/(rgba?|color)\([^)]*\)/g,'').match(/-?[\d.]+px/g)||[];return nums[2]&&parseFloat(nums[2])>0}).join(', ')};
const radii=[];const shadows=[];
for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el);const hasR=corners.some(p=>s[p]!=='0px');const sh=s.boxShadow!=='none';if(!hasR&&!sh)continue;if(!vis(el))continue;const r=el.getBoundingClientRect();
 const bw=['Top','Right','Bottom','Left'].some(d=>parseFloat(s['border'+d+'Width'])>0&&alpha(s['border'+d+'Color'])>0);const repl=/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME|svg)$/i.test(el.tagName);const clip=(s.overflow!=='visible'||s.overflowX!=='visible')&&el.querySelector('img,svg,canvas,video,picture');
 const painted=alpha(s.backgroundColor)>0||s.backgroundImage!=='none'||bw||sh||repl||Boolean(clip)||(s.backdropFilter&&s.backdropFilter!=='none');
 if(!painted)continue;
 if(hasR){const m=Math.min(r.width,r.height)/2;const corner=v=>{const parts=v.split(' ');const one=x=>x.endsWith('%')?parseFloat(x)/100*Math.min(r.width,r.height):parseFloat(x);const e=Math.min(...parts.map(one));if(e<=0)return 0;return e>=m-.5?'full':Math.round(Math.min(e,m)*2)/2};
  radii.push({k:key(el),z:zone(el),c:corners.map(p=>corner(s[p]))})}
 const o=outer(s.boxShadow);if(o)shadows.push({k:key(el),v:o})}
for(const el of document.querySelectorAll('#main-nav,.dock-shell>*,#account-menu,dialog[open]')){if(!vis(el))continue;for(const pseudo of ['::before','::after']){const s=getComputedStyle(el,pseudo);if(s.content==='none')continue;const o=outer(s.boxShadow);if(o)shadows.push({k:key(el)+pseudo,v:o})}}
const labels=[...document.querySelectorAll('#main-nav button span,.dock-search-toggle-label,.cp-control-trigger span,.cp-favorite span,.cp-report-trigger span,.cp-profile-message,.cp-pagination-link,.cp-project-filter-footer button,.account-option span,.entrance-action')].filter(vis);
const path=el=>{const out=[];for(let e=el;e&&e!==document.body;e=e.parentElement){out.push(e.tagName.toLowerCase()+(e.parentElement?[...e.parentElement.children].indexOf(e):''))}return out.reverse().join('/')};
const targets={};for(const el of document.querySelectorAll('a[href],button,input,select,textarea,[role=button],[role=tab],[role=menuitem],[role=menuitemradio],[role=menuitemcheckbox]')){if(!vis(el)||getComputedStyle(el).display==='inline')continue;const r=el.getBoundingClientRect();targets[path(el)]=[Math.round(r.width*10)/10,Math.round(r.height*10)/10,el.matches('.cp-card-title-link')?1:0]}
const lines=sel=>[...document.querySelectorAll(sel)].filter(vis).map(e=>{const s=getComputedStyle(e);const lh=parseFloat(s.lineHeight);return Math.round(e.getBoundingClientRect().height/(isNaN(lh)?parseFloat(s.fontSize)*1.2:lh))});
return {theme:document.documentElement.dataset.theme,lang:document.documentElement.lang,dir:document.documentElement.dir,essais:document.documentElement.dataset.essais||'',
 overflow:document.documentElement.scrollWidth>innerWidth+1,clipped:labels.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent.trim().slice(0,20)),
 density:[...document.querySelectorAll('[data-detail-density]')].map(e=>e.dataset.detailDensity),
 cardTitleLines:lines('#content-list .cp-card h2'),texts,radii,shadows,targets,
 open:Boolean(document.querySelector('dialog[open],.dock-shell[data-search-open=true],#account-menu:not([hidden])'))||[...document.querySelectorAll('.cp-control-panel')].some(vis)}})()'''

# Combination guard: every element targeted by a lisibilite-textes floor (13 px or 14 px rule) keeps
# at least that floor; every title targeted by titres-forts keeps weight 700 and its em tracking.
# Rules inside a media query count only where that query matches.
COMBO_JS = r'''(()=>{
const vis=el=>el.checkVisibility({opacityProperty:true,visibilityProperty:true})&&el.getBoundingClientRect().width>1.5;
const rulesOf=id=>{const sheet=[...document.styleSheets].find(s=>s.ownerNode?.dataset?.essai===id);if(!sheet)return null;const out=[];const walk=list=>{for(const r of list){if(r.selectorText&&r.style)out.push(r);else if(r.cssRules&&(r.conditionText===undefined||matchMedia(r.conditionText).matches))walk(r.cssRules)}};walk(sheet.cssRules);return out};
const res={floors:null,titles:null};
const lt=rulesOf('lisibilite-textes');
if(lt){const f=[];for(const r of lt){const v=r.style.fontSize;const floor=v==='14px'?14:(v==='13px'||/max\(13px/.test(v))?13:null;if(!floor)continue;for(const el of document.querySelectorAll(r.selectorText)){if(!vis(el))continue;const fs=parseFloat(getComputedStyle(el).fontSize);f.push({floor,fs,ok:fs>=floor-.01,k:el.tagName.toLowerCase()+'.'+(typeof el.className==='string'?el.className.split(' ')[0]:'')})}}
 res.floors={checked:f.length,failed:f.filter(x=>!x.ok).slice(0,12),failures:f.filter(x=>!x.ok).length}}
const tf=rulesOf('titres-forts');
if(tf){const t=[];for(const r of tf){const wgt=r.style.fontWeight,ls=r.style.letterSpacing;if(!wgt&&!ls)continue;for(const el of document.querySelectorAll(r.selectorText)){if(!vis(el))continue;const s=getComputedStyle(el);if(wgt)t.push({kind:'weight',want:wgt,got:s.fontWeight,ok:s.fontWeight===wgt,k:el.tagName.toLowerCase()});
 if(ls&&ls.endsWith('em')){const em=parseFloat(s.letterSpacing)/parseFloat(s.fontSize);t.push({kind:'tracking',want:ls,got:Math.round(em*1000)/1000+'em',ok:Math.abs(em-parseFloat(ls))<.002,k:el.tagName.toLowerCase()})}}}
 res.titles={checked:t.length,weights:t.filter(x=>x.kind==='weight').length,tracking:t.filter(x=>x.kind==='tracking').length,failed:t.filter(x=>!x.ok).slice(0,12),failures:t.filter(x=>!x.ok).length}}
return res})()'''

# Mapping table: font sizes ('ui' zone) and radii per component key, with MEASURE_JS's own visibility,
# key and zone helpers so both measures agree.
MAP_JS = MEASURE_JS.split('const texts=')[0] + r'''
const sizes={};const seen=new Set();const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){if(!n.textContent.trim())continue;const el=n.parentElement;if(!el||seen.has(el))continue;seen.add(el);if(!vis(el)||zone(el)!=='ui')continue;
 const fs=Math.round(parseFloat(getComputedStyle(el).fontSize)*100)/100;const k=key(el);const e=sizes[k]||(sizes[k]={n:0,fs:[]});e.n++;if(!e.fs.includes(fs))e.fs.push(fs)}
const corners=['borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius'];const radii={};
for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el);if(!corners.some(p=>s[p]!=='0px'))continue;if(!vis(el))continue;const r=el.getBoundingClientRect();
 const bw=['Top','Right','Bottom','Left'].some(d=>parseFloat(s['border'+d+'Width'])>0&&alpha(s['border'+d+'Color'])>0);const repl=/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME|svg)$/i.test(el.tagName);const clip=(s.overflow!=='visible'||s.overflowX!=='visible')&&el.querySelector('img,svg,canvas,video,picture');
 if(!(alpha(s.backgroundColor)>0||s.backgroundImage!=='none'||bw||s.boxShadow!=='none'||repl||Boolean(clip)||(s.backdropFilter&&s.backdropFilter!=='none')))continue;
 const m=Math.min(r.width,r.height)/2;const corner=v=>{const one=x=>x.endsWith('%')?parseFloat(x)/100*Math.min(r.width,r.height):parseFloat(x);const e=Math.min(...v.split(' ').map(one));if(e<=0)return 0;return e>=m-.5?'full':Math.round(Math.min(e,m)*2)/2};
 const k=key(el);const e=radii[k]||(radii[k]=[]);for(const c of corners.map(p=>corner(s[p])))if(c!==0&&!e.includes(c))e.push(c)}
return{sizes,radii}})()'''

# Titles whose words the new sizes could split (card and detail titles use overflow-wrap:anywhere):
# a word part (between spaces, hyphens or slashes, the normal break points) whose text range spans
# two line boxes is broken; a title wider than its box overflows.
WORDS_JS = r'''(()=>{
const vis=el=>el.checkVisibility({opacityProperty:true,visibilityProperty:true})&&el.getBoundingClientRect().width>1.5;
const T='.cp-card h2,#project-detail .cp-project-heading>h1,#journal-detail .cp-project-heading>h1,#profile-detail .cp-profile-heading>h1,.cp-profile-related-copy h3,.cp-project-block h3,.cp-profile-overview-block h3,.cp-profile-story>:is(h3,h4),.cp-profile-campus-history>h3,.cp-project-trial h3,.cp-profile-milestone h3,dialog[open] h2,.cp-meta,.cp-content-campuses';
const broken=[],overflow=[];let checked=0;
for(const el of document.querySelectorAll(T)){if(!vis(el))continue;checked++;const fs=parseFloat(getComputedStyle(el).fontSize);
 if(el.scrollWidth>el.clientWidth+1)overflow.push(el.textContent.trim().slice(0,40));
 const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let t;
 while(t=tw.nextNode()){const re=/[^\s\-\u2010\u2011\u2013\u2014\/]+/g;let m;while(m=re.exec(t.data)){const r=document.createRange();r.setStart(t,m.index);r.setEnd(t,m.index+m[0].length);
  const tops=[...r.getClientRects()].filter(x=>x.width>.5).map(x=>x.top);if(tops.length>1&&Math.max(...tops)-Math.min(...tops)>fs*.5)broken.push(m[0])}}}
// Card titles are clamped to three lines by the baseline: a taller title would be cut, not overflow.
// Cut = at least half a hidden line (one-line titles already overflow by ~2 px of descenders).
const clamped=[...document.querySelectorAll('.cp-card-title-link')].filter(vis).filter(e=>e.scrollHeight-e.clientHeight>parseFloat(getComputedStyle(e).lineHeight)/2).map(e=>e.textContent.trim().slice(0,40));
const ex=[...document.querySelectorAll('#content-list .cp-card-copy>.cp-summary')].filter(vis);
return{checked,broken,overflow,clamped,excerptsCut:[ex.filter(e=>e.scrollHeight-e.clientHeight>parseFloat(getComputedStyle(e).lineHeight)/2).length,ex.length]}})()'''

# Keyboard focus: the trial must keep the baseline focus rings (outline style, width, colour, offset).
FOCUS_JS = r'''(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const s=getComputedStyle(e);
return{k:e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.trim().split(/\s+/)[0]:''),focusVisible:e.matches(':focus-visible'),outline:[s.outlineStyle,s.outlineWidth,s.outlineColor,s.outlineOffset].join(' '),radius:s.borderRadius}})()'''

KEY = [  # (vue, route, theme, lang, viewport, action)
    ('ordinateur', 'projects', 'light', 'fr', D, None), ('fiche-ordinateur', f'projects/{PID}', 'light', 'fr', D, None),
    ('profil-sombre-ordinateur', f'people/{LEILA}', 'dark', 'fr', D, None), ('article-ordinateur', f'journal/{ART}', 'light', 'fr', D, None),
    ('ar-sombre-mobile', 'people', 'dark', 'ar', M, None), ('mobile', 'projects', 'light', 'fr', M, None),
]
OVERLAYS = [
    ('compte-ordinateur', 'projects', 'light', 'fr', D, 'account'), ('filtre-mobile', 'projects', 'light', 'fr', M, 'filter'),
    ('recherche-ordinateur', 'projects', 'light', 'fr', D, 'search'), ('recherche-ar-sombre-mobile', 'projects', 'dark', 'ar', M, 'search'),
    ('filtre-ouvert-sombre-ordinateur', 'projects', 'dark', 'fr', D, 'filter-open'), ('tri-ordinateur', 'projects', 'light', 'fr', D, 'sort'),
    ('signaler-ordinateur', f'projects/{PID}', 'light', 'fr', D, 'report'), ('message-ordinateur', f'people/{LEILA}', 'light', 'fr', D, 'message'),
    ('media-ordinateur', f'projects/{PID}', 'light', 'fr', D, 'media'), ('campus-ordinateur', f'projects/{PID}', 'light', 'fr', D, 'campus'),
    # Generic dialog (#dialog): simulated sign-in from the account menu.
    ('connexion-ordinateur', 'projects', 'light', 'fr', D, 'signin'), ('connexion-ar-sombre-mobile', 'projects', 'dark', 'ar', M, 'signin'),
]
EXTRA = [
    ('profils-ordinateur', 'people', 'light', 'fr', D, None), ('chroniques-ordinateur', 'journal', 'light', 'fr', D, None),
    ('commentaires-ordinateur', f'projects/{PID}?tab=comments', 'light', 'fr', D, None), ('tester-ordinateur', f'projects/{PID}?tab=test', 'light', 'fr', D, None),
    ('realisation-ordinateur', f'projects/{PID}?tab=implementation', 'light', 'fr', D, None), ('auteurs-ordinateur', f'journal/{ART}?tab=authors', 'light', 'fr', D, None),
    ('profil-projets-ordinateur', f'people/{LEILA}?tab=projects', 'light', 'fr', D, None), ('profil-contribution-ordinateur', f'people/{LEILA}?tab=contribution', 'light', 'fr', D, None),
    ('parcours-ordinateur', f'people/{LEILA}?tab=path', 'light', 'fr', D, None), ('profils-liste-mobile', 'people', 'light', 'fr', M, 'list'),
    ('profils-liste-ordinateur', 'people', 'light', 'fr', D, 'list'), ('projets-liste-mobile', 'projects', 'light', 'fr', M, 'list'),
    ('fiche-mobile', f'projects/{PID}', 'light', 'fr', M, None), ('profil-ar-mobile', f'people/{LEILA}', 'light', 'ar', M, None),
    ('petit', 'projects', 'light', 'fr', S, None), ('fiche-ar-sombre-petit', f'projects/{PID}', 'dark', 'ar', S, None),
    ('profil-petit', f'people/{LEILA}', 'light', 'fr', S, None), ('paysage', f'projects/{PID}', 'light', 'fr', L, None),
    ('tablette', 'projects', 'light', 'fr', T, None), ('profil-tablette', f'people/{LEILA}', 'light', 'fr', T, None),
    ('fiche-1024', f'projects/{PID}', 'light', 'fr', W, None), ('explorer-ordinateur', 'explore', 'light', 'fr', D, None),
]
SHOTS = {'ordinateur', 'fiche-ordinateur', 'profil-sombre-ordinateur', 'article-ordinateur', 'ar-sombre-mobile', 'mobile',
         'compte-ordinateur', 'filtre-mobile', 'recherche-ordinateur', 'profils-liste-mobile', 'fiche-mobile', 'connexion-ordinateur'}


def fresh(s, *args, **kw):
    # about:blank first: a URL differing only by its hash would be a same-document navigation that keeps
    # the previous view's state (scroll, sidebar density, menus).
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.3); s.open(*args, **kw)


def act(s, kind):
    if kind == 'search': s.click('.dock-search-toggle'); time.sleep(.8); s.c.call('Input.insertText', {'text': 'Paris'}); time.sleep(1.2)
    elif kind == 'filter': s.click('#content-index .cp-control-menu[data-control=category] .cp-control-trigger'); time.sleep(1)
    elif kind == 'filter-open': act(s, 'filter'); s.click('#content-category-dialog-toggle-1'); time.sleep(.8)
    elif kind == 'account': s.click('#profile'); time.sleep(.8)
    elif kind == 'sort': s.click('#content-sort-button'); time.sleep(.8)
    elif kind == 'list': s.click('#content-layout-button'); time.sleep(.5); s.click('#content-layout-menu [data-value=list]'); time.sleep(1.2)
    elif kind == 'report': s.click('#project-detail .cp-report-trigger'); time.sleep(1)
    elif kind == 'message': s.click('#profile-detail .cp-profile-message'); time.sleep(1)
    elif kind == 'media': s.click('#project-detail .cp-project-media-open'); time.sleep(1.2)
    elif kind == 'campus': s.click('#project-detail .cp-project-campus'); time.sleep(1)
    elif kind == 'signin': act(s, 'account'); s.click('#account-menu [data-account-action=signin]'); time.sleep(1)


def summary(m):
    ui = [t for t in m['texts'] if t['z'] == 'ui']
    corners = sorted({str(c) for r in m['radii'] for c in r['c'] if c != 0}, key=lambda c: (c == 'full', float(c) if c != 'full' else 0))
    return {'textCount': len(ui), 'sizesUI': sorted({t['fs'] for t in ui}), 'sizesAll': sorted({t['fs'] for t in m['texts']}),
            'offScaleUI': sorted({f"{t['fs']} {t['k']}" for t in ui if t['fs'] not in SCALE})[:12],
            'radii': corners, 'offScaleRadii': sorted({f"{c} {r['k']}" for r in m['radii'] for c in r['c'] if c not in (0, 12, 20, 'full')})[:12],
            'elevations': sorted({x['v'] for x in m['shadows']}), 'overflow': m['overflow'], 'clipped': m['clipped'], 'density': m['density'],
            'cardTitleLines': m['cardTitleLines'], 'targets': m['targets'], 'open': m['open'], 'theme': m['theme'], 'lang': m['lang'], 'dir': m['dir'], 'essais': m['essais']}


def run(cases, label, essais, shots, results, chunk=6):
    for i in range(0, len(cases), chunk):
        for attempt in range(2):
            s = Session(HERE)
            try:
                for vue, route, theme, lang, vp, kind in cases[i:i + chunk]:
                    if vue in results and label in results[vue]: continue
                    fresh(s, route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)
                    note = None
                    if kind:
                        try: act(s, kind)
                        except RuntimeError as error: note = str(error)
                    if vue in shots: s.shot(f'{label}-{vue}')
                    data = summary(s.js(MEASURE_JS, 30)); data['errors'] = s.errors(); data['actionError'] = note
                    if label != 'avant' and label != 'apres': data['combo'] = s.js(COMBO_JS, 20); data['words'] = s.js(WORDS_JS, 20)
                    entry = results.setdefault(vue, {'route': route, 'theme': theme, 'lang': lang, 'viewport': list(vp[:2])})
                    entry[label] = data
                    # Targets are compared by DOM path once both sides exist, then dropped to keep results small.
                    if label == 'apres' and 'targets' in entry.get('avant', {}):
                        before, after = entry['avant'].pop('targets'), data.pop('targets')
                        big = lambda x: min(x[:2]) >= 44
                        entry['targets44'] = [sum(map(big, before.values())), sum(map(big, after.values()))]
                        lost = [[p, before[p][:2], after[p][:2]] for p, x in before.items() if big(x) and p in after and not big(after[p])]
                        entry['targetsLost44'] = [x for x in lost if not before[x[0]][2]]
                        entry['titleLinksBelow44'] = [x for x in lost if before[x[0]][2]]
                    elif label not in ('avant', 'apres'):
                        data.pop('targets', None)
                    print(label, vue, len(data['sizesUI']), data['sizesUI'], data['radii'], data['overflow'], (data.get('combo') or ''), flush=True)
                break
            except (RuntimeError, TimeoutError) as error:
                print('retry', label, i, error, flush=True)
            finally:
                s.close()


# Phases can be run one at a time (python3 -I check.py key overlays ...); results.json keeps the others.
# 'diffs' runs no Chrome: it only recomputes the totals and the pixel differences of the captures.
PHASES = ['key', 'overlays', 'extra', 'arrival', 'combinations', 'mapping', 'diffs']
asked = [a for a in sys.argv[1:] if a in PHASES] or PHASES
OUT = HERE / 'results.json'
results = json.loads(OUT.read_text()) if asked != PHASES and OUT.exists() else {}
stamp = lambda path: time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(path.stat().st_mtime))
ESSAIS = HERE.parent.parent / 'essais'
results.update({'id': ID, 'scale': SCALE, 'trialFilesModified': max(stamp(ESSAIS / ID / f) for f in ('essai.css', 'essai.mjs', 'early.js'))})
if 'combinations' in asked:  # versions of the neighbouring trials measured by the combinations
    results['combinedTrialFiles'] = {f'{other}/essai.css': stamp(ESSAIS / other / 'essai.css') for other in ('lisibilite-textes', 'titres-forts')}
for phase in PHASES: results.setdefault(phase, {})
results.setdefault('ranAt', {})
for phase in asked: results[phase] = {}


def save():
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')


for group, cases in (('key', KEY), ('overlays', OVERLAYS), ('extra', EXTRA)):
    if group not in asked: continue
    run(cases, 'avant', [], SHOTS, results[group])
    run(cases, 'apres', [ID], SHOTS, results[group])
    results['ranAt'][group] = time.strftime('%Y-%m-%d %H:%M:%S'); save()

# Arrival (index.html): the two entry buttons share .entrance-action with the account menu.
DIALOG_JS = r'''(()=>{const d=document.querySelector('dialog[open]');if(!d)return null;const s=getComputedStyle(d);const h=d.querySelector('.dialog-top h2'),p=d.querySelector('.dialog-text');
return{kind:d.dataset.kind,radius:s.borderRadius,shadow:s.boxShadow,title:h&&getComputedStyle(h).fontSize,text:p&&getComputedStyle(p).fontSize,
 buttons:[...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>{const c=getComputedStyle(b),r=b.getBoundingClientRect();return[b.textContent.trim().slice(0,24),c.fontSize,c.borderRadius,Math.round(r.width),Math.round(r.height)]})}})()'''
ARRIVAL_JS = r'''[...document.querySelectorAll('.entrance-action')].filter(e=>e.getBoundingClientRect().width>0).map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return{t:e.textContent.trim().slice(0,20),fs:s.fontSize,radius:s.borderRadius,shadow:s.boxShadow,w:Math.round(r.width),h:Math.round(r.height)}})'''
for attempt in range(2 if 'arrival' in asked else 0):
    s = Session(HERE)
    try:
        for vue, vp, theme, lang in (('arrivee-ordinateur', D, 'light', 'fr'), ('arrivee-mobile', M, 'light', 'fr'), ('arrivee-ar-sombre-mobile', M, 'dark', 'ar')):
            for label, essais in (('avant', []), ('apres', [ID])):
                if label in results['arrival'].get(vue, {}): continue
                fresh(s, '', essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True, page='index.html')
                s.wait('[...document.querySelectorAll(".entrance-action")].some(e=>e.getBoundingClientRect().width>0)', 30); time.sleep(1.5)
                s.shot(f'{label}-{vue}')
                results['arrival'].setdefault(vue, {})[label] = {'buttons': s.js(ARRIVAL_JS), 'overflow': s.overflow(), 'errors': s.errors()}
                if vue == 'arrivee-ordinateur':  # the sign-in dialog of the arrival (generic #dialog)
                    s.click('#entry-login'); s.wait('Boolean(document.querySelector("dialog[open]"))', 10); time.sleep(.8)
                    s.shot(f'{label}-arrivee-connexion-ordinateur'); results['arrival'][vue][label]['dialog'] = s.js(DIALOG_JS)
                print(vue, label, json.dumps(results['arrival'][vue][label], ensure_ascii=False)[:300], flush=True)
        break
    except (RuntimeError, TimeoutError) as error:
        print('retry arrival', error, flush=True)
    finally:
        s.close()
if 'arrival' in asked: results['ranAt']['arrival'] = time.strftime('%Y-%m-%d %H:%M:%S'); save()

# Combinations, in canonical order: lisibilite-textes and titres-forts load before this trial.
# ref-titres-forts (that trial alone) tells its own broken words apart from the combination's.
COMBOS = {'lisibilite+echelle': ['lisibilite-textes', ID], 'titres-forts+echelle': ['titres-forts', ID], 'trois': ['lisibilite-textes', 'titres-forts', ID], 'ref-titres-forts': ['titres-forts']}
COMBO_CASES = KEY + [OVERLAYS[0], OVERLAYS[1], OVERLAYS[2], EXTRA[2], EXTRA[12], EXTRA[14], ('chroniques-mobile', 'journal', 'light', 'fr', M, None)]
# The mapping phase adds the other 320 px lists and details (narrowest card columns).
MAP_CASES = COMBO_CASES + [('profils-petit', 'people', 'light', 'fr', S, None), ('chroniques-petit', 'journal', 'light', 'fr', S, None), EXTRA[15], EXTRA[16]]
for name, essais in COMBOS.items():
    if 'combinations' not in asked: break
    shots = {'ordinateur', 'ar-sombre-mobile'} if name == 'trois' else set()
    store = results['combinations'].setdefault(name, {})
    run(COMBO_CASES, name, essais, shots, store)
    results['ranAt']['combinations'] = time.strftime('%Y-%m-%d %H:%M:%S'); save()
# Rename combination captures so they read as apres-trois-<vue>.png.
for vue in ('ordinateur', 'ar-sombre-mobile'):
    src = HERE / f'trois-{vue}.png'
    if src.exists(): src.replace(HERE / f'apres-trois-{vue}.png')

# Mapping phase on the combination views: sizes and radii per component before/after (the mapping
# table of essai.json), broken title words, and the keyboard focus rings on three views.
FOCUS_VIEWS = {'ordinateur', 'fiche-ordinateur', 'ar-sombre-mobile'}


def run_map(cases, label, essais, store, chunk=6):
    for i in range(0, len(cases), chunk):
        for attempt in range(2):
            s = Session(HERE)
            try:
                for vue, route, theme, lang, vp, kind in cases[i:i + chunk]:
                    if label in store.get(vue, {}): continue
                    fresh(s, route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)
                    if kind:
                        try: act(s, kind)
                        except RuntimeError as error: print('action', vue, error, flush=True)
                    data = s.js(MAP_JS, 30); data['words'] = s.js(WORDS_JS, 20); data['errors'] = s.errors()
                    if vue in FOCUS_VIEWS and not kind:
                        s.blur(); data['focus'] = []
                        for _ in range(12): s.key('Tab'); data['focus'].append(s.js(FOCUS_JS))
                    store.setdefault(vue, {'route': route, 'theme': theme, 'lang': lang, 'viewport': list(vp[:2])})[label] = data
                    print('mapping', label, vue, len(data['sizes']), json.dumps(data['words'], ensure_ascii=False), flush=True)
                break
            except (RuntimeError, TimeoutError) as error:
                print('retry mapping', label, i, error, flush=True)
            finally:
                s.close()


if 'mapping' in asked:
    run_map(MAP_CASES, 'avant', [], results['mapping'])
    run_map(MAP_CASES, 'apres', [ID], results['mapping'])
    results['ranAt']['mapping'] = time.strftime('%Y-%m-%d %H:%M:%S'); save()


def mapping_table(field):
    """{width: {after value: {'avant': [values], 'composants': {key: [values before]}}}} (1024 px and up = ordinateur)."""
    rows = {}
    for entry in results['mapping'].values():
        if 'avant' not in entry or 'apres' not in entry: continue
        width = 'ordinateur' if entry['viewport'][0] >= 1024 else 'mobile'
        for k, after in entry['apres'][field].items():
            before = entry['avant'][field].get(k)
            if before is None: continue
            for a in (after['fs'] if field == 'sizes' else after):
                rows.setdefault(width, {}).setdefault(str(a), {}).setdefault(k, set()).update(map(str, before['fs'] if field == 'sizes' else before))
    num = lambda x: (x == 'full', float(x) if x != 'full' else 0)
    return {w: {a: {'avant': sorted({b for v in comps.values() for b in v}, key=num), 'composants': {k: sorted(v, key=num) for k, v in sorted(comps.items())}}
                for a, comps in sorted(r.items(), key=lambda x: num(x[0]))} for w, r in rows.items()}


results['mappingTable'] = {'sizes': mapping_table('sizes'), 'radii': mapping_table('radii')}
# Share of differing pixels between each before/after capture pair (helper.image_diff).
results['imageDiff'] = {a.name[6:-4]: round(image_diff(a, HERE / ('apres-' + a.name[6:])), 4) for a in sorted(HERE.glob('avant-*.png')) if (HERE / ('apres-' + a.name[6:])).exists()}


def union(group, label, field):
    out = set()
    for v in results[group].values():
        if label in v: out |= set(map(str, v[label][field]))
    return sorted(out, key=lambda x: (not x.replace('.', '').isdigit(), float(x) if x.replace('.', '').isdigit() else 0, x))


totals = {}
for label in ('avant', 'apres'):
    totals[label] = {g: {'sizesUI': union(g, label, 'sizesUI'), 'sizesAll': union(g, label, 'sizesAll'), 'radii': union(g, label, 'radii'), 'elevations': union(g, label, 'elevations')} for g in ('key', 'overlays', 'extra')}
results['totals'] = totals
views = [v for g in ('key', 'overlays', 'extra') for v in results[g].values()]
# References (ref-*) measure a neighbouring trial alone; they are kept out of the combination totals.
real = {name: store for name, store in results['combinations'].items() if not name.startswith('ref-')}
combos = [v[name] for name, store in real.items() for v in store.values()]
words = lambda entry, label: set((entry.get(label, {}).get('words') or {}).get('broken', []))
over = lambda entry, label: (entry.get(label, {}).get('words') or {}).get('overflow') or []
cut = lambda entry, label: (entry.get(label, {}).get('words') or {}).get('clamped') or []
maps = results['mapping']
ref = results['combinations'].get('ref-titres-forts', {})
results['checks'] = {
    'keyUnionSizesUI': [len(totals['avant']['key']['sizesUI']), len(totals['apres']['key']['sizesUI'])],
    'keyUnionRadii': [len(totals['avant']['key']['radii']), len(totals['apres']['key']['radii'])],
    'keyUnionElevations': [len(totals['avant']['key']['elevations']), len(totals['apres']['key']['elevations'])],
    'keyAfterOnScale': all(not v['apres']['offScaleUI'] for v in results['key'].values()),
    'overflowAfter': [k for g in ('key', 'overlays', 'extra') for k, v in results[g].items() if v['apres']['overflow']],
    'newClipped': [k for g in ('key', 'overlays', 'extra') for k, v in results[g].items() if set(v['apres']['clipped']) - set(v['avant']['clipped'])],
    'errorsAfter': [k for g in ('key', 'overlays', 'extra') for k, v in results[g].items() if v['apres']['errors']],
    'overlaysOpen': {k: [v['avant']['open'], v['apres']['open'], v['apres']['actionError']] for k, v in results['overlays'].items()},
    # Targets that met 44 px in both dimensions before and lost it after (same DOM path).
    'targetsLost44': {k: v['targetsLost44'] for g in ('key', 'overlays', 'extra') for k, v in results[g].items() if v.get('targetsLost44')},
    'targets44': [sum(v.get('targets44', [0, 0])[i] for g in ('key', 'overlays', 'extra') for v in results[g].values()) for i in (0, 1)],
    'titleLinksBelow44': {k: v['titleLinksBelow44'] for g in ('key', 'overlays', 'extra') for k, v in results[g].items() if v.get('titleLinksBelow44')},
    'floorFailures': sum((c.get('combo') or {}).get('floors', {}).get('failures', 0) for c in combos if (c.get('combo') or {}).get('floors')),
    'floorChecked': sum((c.get('combo') or {}).get('floors', {}).get('checked', 0) for c in combos if (c.get('combo') or {}).get('floors')),
    'titleFailures': sum((c.get('combo') or {}).get('titles', {}).get('failures', 0) for c in combos if (c.get('combo') or {}).get('titles')),
    'titleChecked': sum((c.get('combo') or {}).get('titles', {}).get('checked', 0) for c in combos if (c.get('combo') or {}).get('titles')),
    'comboOverflow': [f'{name}:{k}' for name, store in real.items() for k, v in store.items() if v[name]['overflow']],
    'comboErrors': [f'{name}:{k}' for name, store in real.items() for k, v in store.items() if v[name]['errors']],
    # Title words split across two lines: before, with the trial, and new ones in the combinations
    # (not split by the trial alone nor by titres-forts alone).
    'brokenWords': {k: [sorted(words(e, 'avant')), sorted(words(e, 'apres'))] for k, e in maps.items() if words(e, 'avant') or words(e, 'apres')},
    'newBrokenWords': {k: sorted(words(e, 'apres') - words(e, 'avant')) for k, e in maps.items() if words(e, 'apres') - words(e, 'avant')},
    'titleOverflow': {k: [(e.get(l, {}).get('words') or {}).get('overflow') for l in ('avant', 'apres')] for k, e in maps.items() if any((e.get(l, {}).get('words') or {}).get('overflow') for l in ('avant', 'apres'))},
    'comboNewBrokenWords': {f'{name}:{k}': sorted(words(v, name) - words(maps.get(k, {}), 'apres') - words(maps.get(k, {}), 'avant') - words(ref.get(k, {}), 'ref-titres-forts'))
                            for name, store in real.items() for k, v in store.items() if words(v, name) - words(maps.get(k, {}), 'apres') - words(maps.get(k, {}), 'avant') - words(ref.get(k, {}), 'ref-titres-forts')},
    # Titles wider than their box that the baseline did not already have.
    'newTitleOverflow': {k: sorted(set(over(e, 'apres')) - set(over(e, 'avant'))) for k, e in maps.items() if set(over(e, 'apres')) - set(over(e, 'avant'))},
    'newClampedTitles': {k: sorted(set(cut(e, 'apres')) - set(cut(e, 'avant'))) for k, e in maps.items() if set(cut(e, 'apres')) - set(cut(e, 'avant'))},
    'comboNewClampedTitles': {f'{name}:{k}': sorted(set(cut(v, name)) - set(cut(maps.get(k, {}), 'avant'))) for name, store in real.items() for k, v in store.items() if set(cut(v, name)) - set(cut(maps.get(k, {}), 'avant'))},
    'excerptsCut': {k: [(e.get(l, {}).get('words') or {}).get('excerptsCut') for l in ('avant', 'apres')] for k, e in maps.items() if (e.get('avant', {}).get('words') or {}).get('excerptsCut', [0, 0])[1]},
    'comboTitleOverflow': {f'{name}:{k}': sorted(set(over(v, name)) - set(over(maps.get(k, {}), 'avant'))) for name, store in real.items() for k, v in store.items() if set(over(v, name)) - set(over(maps.get(k, {}), 'avant'))},
    'refTitresForts': {'brokenWords': {k: sorted(words(v, 'ref-titres-forts')) for k, v in ref.items() if words(v, 'ref-titres-forts')}, 'titleFailures': sum(((v['ref-titres-forts'].get('combo') or {}).get('titles') or {}).get('failures', 0) for v in ref.values())},
    # Same focus targets and the same outline (style, width, colour, offset) before and after.
    'focusSame': {k: [[a and a['k'], a and a['outline'], a and a['focusVisible']] for a in e['avant']['focus']] == [[b and b['k'], b and b['outline'], b and b['focusVisible']] for b in e['apres']['focus']]
                  for k, e in maps.items() if 'focus' in e.get('avant', {}) and 'focus' in e.get('apres', {})},
    'mappingErrors': [k for k, e in maps.items() if (e.get('apres') or {}).get('errors')],
    'arrival': {k: {l: [[b['fs'], b['radius'], b['w'], b['h']] for b in (e.get(l) or {}).get('buttons') or []] for l in ('avant', 'apres')} for k, e in results['arrival'].items()},
    'arrivalOverflow': [k for k, e in results['arrival'].items() if (e.get('apres') or {}).get('overflow')],
    'arrivalDialog': {l: (results['arrival'].get('arrivee-ordinateur', {}).get(l) or {}).get('dialog') for l in ('avant', 'apres')},
}
c = results['checks']
results['passed'] = bool(c['keyUnionSizesUI'][1] <= len(SCALE) and c['keyUnionSizesUI'][1] < c['keyUnionSizesUI'][0] and c['keyAfterOnScale']
                         and not c['overflowAfter'] and not c['newClipped'] and not c['targetsLost44'] and not c['errorsAfter'] and all(o[1] for o in c['overlaysOpen'].values())
                         and c['floorFailures'] == 0 and c['titleFailures'] == 0 and not c['comboOverflow'] and not c['comboErrors']
                         and not c['newBrokenWords'] and not c['comboNewBrokenWords'] and not c['newTitleOverflow'] and not c['comboTitleOverflow'] and not c['newClampedTitles'] and not c['comboNewClampedTitles'] and all(c['focusSame'].values()) and len(c['focusSame']) == len(FOCUS_VIEWS)
                         and not c['mappingErrors'] and not c['arrivalOverflow'])
save()
print('checks', json.dumps(results['checks'], ensure_ascii=False)); print('passed', results['passed'])
