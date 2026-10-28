"""Trial echelle-unifiee, verifier pass (14 Oct 2026), independent of check.py: every view is a fresh
page load (about:blank first, so no same-document hash navigation carries state over), before/after.
Phases (python3 -I .../checks/echelle-unifiee/verif.py [phase ...]; verif-results.json keeps the others):
 cles      6 key views + 320 px + English + list view: distinct sizes, radii, elevations; text newly cut by
           an overflow:hidden/clip ancestor, an ellipsis or a line clamp; split title words; overflow; errors;
           text newly spilling out of its painted box or overlapping other text (second pass, 15 Oct)
 superpositions  menus and dialogs (FR, AR RTL, dark, 320 px): the same measures with the overlay open
 largeurs  widths between the measured ones (701-1100 px, tablet portrait): list chips, cards, details
 rangees   Profiles grid at phone widths (320-430 px, FR/EN/AR): pending-login placeholders wrapping and
           rows whose campus lines are no longer level
 vivant    theme and language changed without reload (account menu), compared with fresh loads
 densite   detail sidebar density chosen by detail-scroll at desktop sizes, before/after
 combos    with lisibilite-textes (current file), titres-forts and pseudo-manquant, against each one alone
 surfaces  scope popover and about dialog; 42 Awards page pixel-identical
 clavier   arrival (index.html) and account menu: same tab stops and focus rings before/after
 campus    (on request) the Explorer campus sheet keeps its look, compared on its own area"""
import ast, json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, image_diff

ID = 'echelle-unifiee'
SCALE = [12, 14, 16, 20, 28, 35]
PID, LEILA, ART = 'ft-transcendence-building-together', 'profile-leila-mansour', 'journal-an-evening-debugging'
ESSAIS = HERE.parent.parent / 'essais'
OUT = HERE / 'verif-results.json'
SHOTS = Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/2cf0c114-786b-4a24-866f-57822e04403f/scratchpad/agents/echelle-unifiee-verif/out')

# Same measures as check.py (read from its source, not re-typed), plus a generic clipping detector.
_tree = ast.parse((HERE / 'check.py').read_text())
_js = {t.id: ast.literal_eval(n.value) for n in _tree.body if isinstance(n, ast.Assign) for t in n.targets
       if isinstance(t, ast.Name) and t.id in ('MEASURE_JS', 'WORDS_JS', 'FOCUS_JS', 'COMBO_JS')}
MEASURE_JS, WORDS_JS, FOCUS_JS, COMBO_JS = (_js[k] for k in ('MEASURE_JS', 'WORDS_JS', 'FOCUS_JS', 'COMBO_JS'))
CLIP_JS = r'''(()=>{
const vis=el=>{if(!el.checkVisibility({opacityProperty:true,visibilityProperty:true}))return false;const r=el.getBoundingClientRect();return r.width>1.5&&r.height>1.5};
const key=el=>{const c=typeof el.className==='string'?el.className.trim().split(/\s+/).slice(0,2).join('.'):'';const p=el.parentElement;const pc=p&&typeof p.className==='string'?p.className.trim().split(/\s+/)[0]:'';return el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(c?'.'+c:'')+(!c&&!el.id&&p?' < '+p.tagName.toLowerCase()+(p.id?'#'+p.id:'')+(pc?'.'+pc:''):'')};
const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){
 const t=n.data.trim();if(!t)continue;const el=n.parentElement;if(!el||!vis(el))continue;if(el.closest('svg,.sr-only'))continue;
 const range=document.createRange();range.selectNodeContents(n);const rects=[...range.getClientRects()].filter(r=>r.width>.5&&r.height>.5);if(!rects.length)continue;
 const box={l:Math.min(...rects.map(r=>r.left)),r:Math.max(...rects.map(r=>r.right)),t:Math.min(...rects.map(r=>r.top)),b:Math.max(...rects.map(r=>r.bottom))};
 for(let a=el;a&&a!==document.documentElement&&a!==document.body;a=a.parentElement){
  const s=getComputedStyle(a);const cx=s.overflowX==='hidden'||s.overflowX==='clip',cy=s.overflowY==='hidden'||s.overflowY==='clip';if(!cx&&!cy)continue;
  const ar=a.getBoundingClientRect();const L=ar.left+parseFloat(s.borderLeftWidth),R=ar.right-parseFloat(s.borderRightWidth),T=ar.top+parseFloat(s.borderTopWidth),B=ar.bottom-parseFloat(s.borderBottomWidth);
  const dx=cx?Math.max(L-box.l,box.r-R,0):0,dy=cy?Math.max(T-box.t,box.b-B,0):0;
  if(dx>1.5||dy>2.5){out.push({k:key(el),a:key(a),t:t.slice(0,32),dx:Math.round(dx*10)/10,dy:Math.round(dy*10)/10,fs:parseFloat(getComputedStyle(el).fontSize)});break}
 }
}
for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el);
 if(s.textOverflow==='ellipsis'&&el.scrollWidth>el.clientWidth+1&&vis(el))out.push({k:key(el),t:el.textContent.trim().slice(0,32),ellipsis:true,fs:parseFloat(s.fontSize)});
 if(s.webkitLineClamp&&s.webkitLineClamp!=='none'&&vis(el)){const lh=parseFloat(s.lineHeight)||parseFloat(s.fontSize)*1.2;if(el.scrollHeight-el.clientHeight>lh/2)out.push({k:key(el),t:el.textContent.trim().slice(0,32),clamp:true,fs:parseFloat(s.fontSize)})}}
return out})()'''
# Painted boxes (chips, pills, buttons) cut by an overflow:hidden/clip ancestor, and large boxes whose
# corners are fully round although they are not square (ovals instead of rounded rectangles; pills up to
# 56 px tall, such as the scope path, are normal).
SHAPE_JS = r'''(()=>{
const vis=el=>{if(!el.checkVisibility({opacityProperty:true,visibilityProperty:true}))return false;const r=el.getBoundingClientRect();return r.width>1.5&&r.height>1.5};
const key=el=>{const c=typeof el.className==='string'?el.className.trim().split(/\s+/).slice(0,2).join('.'):'';return el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(c?'.'+c:'')};
const alpha=c=>{if(!c||c==='transparent')return 0;const m=c.match(/rgba?\(([^)]+)\)/);if(m){const p=m[1].split(/[ ,\/]+/).filter(Boolean);return p.length>3?Number(p[3]):1}return 1};
const boxClips=[],ovals=[];
for(const el of document.querySelectorAll('#app *,dialog[open] *,#scope-popover *')){const s=getComputedStyle(el);
 const painted=alpha(s.backgroundColor)>0||(parseFloat(s.borderTopWidth)>0&&alpha(s.borderTopColor)>0);if(!painted||!vis(el)||el.closest('svg'))continue;const r=el.getBoundingClientRect();
 const one=v=>{const x=v.split(' ')[0];return x.endsWith('%')?parseFloat(x)/100*Math.min(r.width,r.height):parseFloat(x)};
 const corners=['borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius'].map(p=>one(s[p]));
 if(Math.min(r.width,r.height)>56&&Math.abs(r.width-r.height)>4&&corners.every(c=>c>=Math.min(r.width,r.height)/2-.5))ovals.push({k:key(el),w:Math.round(r.width),h:Math.round(r.height)});
 for(let a=el.parentElement;a&&a!==document.body&&a!==document.documentElement;a=a.parentElement){const t=getComputedStyle(a);if(!['hidden','clip'].includes(t.overflowX)&&!['hidden','clip'].includes(t.overflowY))continue;
  const ar=a.getBoundingClientRect();const dx=Math.max(ar.left+parseFloat(t.borderLeftWidth)-r.left,r.right-ar.right+parseFloat(t.borderRightWidth),0),dy=Math.max(ar.top+parseFloat(t.borderTopWidth)-r.top,r.bottom-ar.bottom+parseFloat(t.borderBottomWidth),0);
  // Only boxes mostly inside their clipping ancestor (scrolled-away rows and carousels are not cut chips).
  if((dx>.5||dy>.5)&&dx<r.width/2&&dy<r.height/2)boxClips.push({k:key(el),a:key(a),t:el.textContent.trim().slice(0,24),dx:Math.round(dx*10)/10,dy:Math.round(dy*10)/10});break}}
return{boxClips,ovals}})()'''
# Effectiveness of the trial's own rules: for every visible element a trial rule targets (media
# conditions honoured), the computed value must equal one of the trial values resolved in place
# (probe element of the same tag in the same parent); otherwise a baseline rule still wins.
RULES_JS = r'''(()=>{
const sheet=[...document.styleSheets].find(s=>s.ownerNode?.dataset?.essai==='echelle-unifiee');if(!sheet)return null;
const key=el=>{const c=typeof el.className==='string'?el.className.trim().split(/\s+/).slice(0,2).join('.'):'';const p=el.parentElement;const pc=p&&typeof p.className==='string'?p.className.trim().split(/\s+/)[0]:'';return el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(c?'.'+c:'')+(!c&&!el.id&&p?' < '+p.tagName.toLowerCase()+(p.id?'#'+p.id:'')+(pc?'.'+pc:''):'')};
const rules=[];const walk=(list,cond)=>{for(const r of list){if(r instanceof CSSStyleRule)rules.push({r,cond});else if(r.conditionText!==undefined&&r.cssRules)walk(r.cssRules,(cond?cond+' and ':'')+r.conditionText);else if(r.cssRules)walk(r.cssRules,cond)}};walk(sheet.cssRules,'');
const PROPS=['font-size','border-top-left-radius','border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius','box-shadow'];
const vis=el=>el.checkVisibility({opacityProperty:true,visibilityProperty:true})&&el.getBoundingClientRect().width>1.5;
const expected=new Map();
for(const {r,cond} of rules){
 if(cond&&!matchMedia(cond).matches)continue;
 const decl={};for(const p of PROPS){const v=r.style.getPropertyValue(p);if(v)decl[p]=v}
 const ss=r.style.getPropertyValue('border-start-start-radius'),se=r.style.getPropertyValue('border-start-end-radius');
 if(!Object.keys(decl).length&&!ss&&!se)continue;
 let els;try{els=document.querySelectorAll(r.selectorText)}catch(e){continue}
 for(const el of els){if(!vis(el))continue;const rtl=getComputedStyle(el).direction==='rtl';const d={...decl};
  if(ss)d[rtl?'border-top-right-radius':'border-top-left-radius']=ss;if(se)d[rtl?'border-top-left-radius':'border-top-right-radius']=se;
  const e=expected.get(el)||{};for(const [p,v] of Object.entries(d))(e[p]||(e[p]=[])).push({v,sel:r.selectorText.replace(/\s+/g,' ').slice(0,90)});expected.set(el,e)}
}
const out=[];let checked=0;
for(const [el,props] of expected){const parent=el.parentElement||document.body;const cs=getComputedStyle(el);const b=el.getBoundingClientRect();
 for(const [p,cands] of Object.entries(props)){const got=cs.getPropertyValue(p);const res=[];let ok=false;
  for(const c of cands){const probe=document.createElement(el.tagName==='DIALOG'?'div':el.tagName.toLowerCase());probe.setAttribute('aria-hidden','true');probe.style.cssText='position:absolute;visibility:hidden;pointer-events:none;width:'+b.width+'px;height:'+b.height+'px';probe.style.setProperty(p,c.v);parent.appendChild(probe);const val=getComputedStyle(probe).getPropertyValue(p);probe.remove();res.push(val);if(val===got)ok=true}
  checked++;if(!ok)out.push({k:key(el),p,got,want:[...new Set(res)],sel:[...new Set(cands.map(c=>c.sel))].slice(-2)})}}
const uniq={};for(const m of out){const id=m.k+'|'+m.p+'|'+m.got;if(!uniq[id])uniq[id]={...m,n:0};uniq[id].n++}
return {checked,elements:expected.size,mismatches:Object.values(uniq)}})()'''
# Collisions: text whose glyph box leaves its nearest painted box (background or border: chips, pills,
# buttons, cards) and pairs of texts of different elements overlapping by more than a third of the
# smaller font size. Only texts of the same layer are paired (fixed, sticky, dialog or z-indexed
# absolute ancestor), so content scrolling under the dock or a menu over cards is not a collision.
SPILL_JS = r'''(()=>{
const vis=el=>{if(!el.checkVisibility({opacityProperty:true,visibilityProperty:true}))return false;const r=el.getBoundingClientRect();return r.width>1.5&&r.height>1.5};
const key=el=>{const c=typeof el.className==='string'?el.className.trim().split(/\s+/).slice(0,2).join('.'):'';const p=el.parentElement;const pc=p&&typeof p.className==='string'?p.className.trim().split(/\s+/)[0]:'';return el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(c?'.'+c:'')+(!c&&!el.id&&p?' < '+p.tagName.toLowerCase()+(p.id?'#'+p.id:'')+(pc?'.'+pc:''):'')};
const alpha=c=>{if(!c||c==='transparent')return 0;const m=c.match(/rgba?\(([^)]+)\)/);if(m){const p=m[1].split(/[ ,\/]+/).filter(Boolean);return p.length>3?Number(p[3]):1}const n=c.match(/color\([^)]*\/\s*([\d.]+)\)/);return n?Number(n[1]):1};
const painted=el=>{const s=getComputedStyle(el);return alpha(s.backgroundColor)>0||s.backgroundImage!=='none'||['Top','Right','Bottom','Left'].some(d=>parseFloat(s['border'+d+'Width'])>0&&alpha(s['border'+d+'Color'])>0)};
const layerOf=el=>{for(let e=el;e&&e!==document.body;e=e.parentElement){const s=getComputedStyle(e);if(e.tagName==='DIALOG'||s.position==='fixed'||s.position==='sticky'||(s.position==='absolute'&&s.zIndex!=='auto'))return e}return document.body};
const items=[],spills=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){
 const t=n.data.trim();if(!t)continue;const el=n.parentElement;if(!el||el.closest('svg,.sr-only,script,style')||!vis(el))continue;
 const range=document.createRange();range.selectNodeContents(n);const rects=[...range.getClientRects()].filter(r=>r.width>.5&&r.height>.5);if(!rects.length)continue;
 const fs=parseFloat(getComputedStyle(el).fontSize);
 const box={l:Math.min(...rects.map(r=>r.left)),r:Math.max(...rects.map(r=>r.right)),t:Math.min(...rects.map(r=>r.top)),b:Math.max(...rects.map(r=>r.bottom))};
 let a=el;while(a&&a!==document.body&&!painted(a))a=a.parentElement;
 if(a&&a!==document.body){const ar=a.getBoundingClientRect();const dx=Math.max(ar.left-box.l,box.r-ar.right,0),dy=Math.max(ar.top-box.t,box.b-ar.bottom,0);
  if(dx>1||dy>fs*.25)spills.push({k:key(el),a:key(a),t:t.slice(0,32),dx:Math.round(dx*10)/10,dy:Math.round(dy*10)/10})}
 items.push({el,rects,t,fs,layer:layerOf(el)})}
const collisions=[];
for(let i=0;i<items.length;i++){const A=items[i];for(let j=i+1;j<items.length;j++){const B=items[j];if(A.layer!==B.layer||A.el===B.el||A.el.contains(B.el)||B.el.contains(A.el))continue;
 const min=Math.min(A.fs,B.fs)*.35;let hit=null;
 for(const r of A.rects){for(const q of B.rects){const ix=Math.min(r.right,q.right)-Math.max(r.left,q.left),iy=Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top);if(ix>1&&iy>min){hit=[ix,iy];break}}if(hit)break}
 if(hit)collisions.push({a:key(A.el),b:key(B.el),ta:A.t.slice(0,24),tb:B.t.slice(0,24),ix:Math.round(hit[0]*10)/10,iy:Math.round(hit[1]*10)/10})}}
return{texts:items.length,spills,collisions:collisions.slice(0,80),collisionCount:collisions.length}})()'''
STATE_JS = '''({essais:document.documentElement.dataset.essais||'',sheet:Boolean(document.querySelector('link[data-essai="echelle-unifiee"]')),theme:document.documentElement.dataset.theme,lang:document.documentElement.lang,dir:document.documentElement.dir,view:document.querySelector('#content-index')?.dataset.view||null})'''


def fresh(s, route, essais, theme='light', lang='fr', vp=D, page='content-preview.html'):
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.3)
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True, page=page)


def act(s, kind):
    if kind == 'list': s.click('#content-layout-button'); time.sleep(.5); s.click('#content-layout-menu [data-value=list]'); time.sleep(1.2)
    elif kind == 'scope': s.click('#scope-picker'); time.sleep(1)
    elif kind == 'about': s.click('#about'); time.sleep(1)
    # Overlays, as in check.py.
    elif kind == 'search': s.click('.dock-search-toggle'); time.sleep(.8); s.c.call('Input.insertText', {'text': 'Paris'}); time.sleep(1.2)
    elif kind == 'filter': s.click('#content-index .cp-control-menu[data-control=category] .cp-control-trigger'); time.sleep(1)
    elif kind == 'filter-open': act(s, 'filter'); s.click('#content-category-dialog-toggle-1'); time.sleep(.8)
    elif kind == 'account': s.click('#profile'); time.sleep(.8)
    elif kind == 'sort': s.click('#content-sort-button'); time.sleep(.8)
    elif kind == 'report': s.click('#project-detail .cp-report-trigger'); time.sleep(1)
    elif kind == 'message': s.click('#profile-detail .cp-profile-message'); time.sleep(1)
    elif kind == 'media': s.click('#project-detail .cp-project-media-open'); time.sleep(1.2)
    elif kind == 'campus': s.click('#project-detail .cp-project-campus'); time.sleep(1)
    elif kind == 'signin': act(s, 'account'); s.click('#account-menu [data-account-action=signin]'); time.sleep(1)


def measure(s):
    m = s.js(MEASURE_JS, 30); ui = [t for t in m['texts'] if t['z'] == 'ui']
    radii = sorted({str(c) for r in m['radii'] for c in r['c'] if c != 0}, key=lambda c: (c == 'full', float(c) if c != 'full' else 0))
    return {'sizesUI': sorted({t['fs'] for t in ui}), 'sizesAll': sorted({t['fs'] for t in m['texts']}),
            'offScaleUI': sorted({f"{t['fs']} {t['k']}" for t in ui if t['fs'] not in SCALE})[:10], 'radii': radii,
            'elevations': sorted({x['v'] for x in m['shadows']}), 'overflow': m['overflow'], 'clips': s.js(CLIP_JS, 30),
            'words': s.js(WORDS_JS, 20), 'shapes': s.js(SHAPE_JS, 30), 'spill': s.js(SPILL_JS, 40), 'errors': s.errors(), 'state': s.js(STATE_JS),
            'open': s.js('Boolean(document.querySelector("dialog[open],.dock-shell[data-search-open=true],#account-menu:not([hidden]),#scope-popover:not([hidden])"))||[...document.querySelectorAll(".cp-control-panel")].some(e=>e.getClientRects().length>0)'),
            'rules': s.js(RULES_JS, 40)}  # last: its probes are added to and removed from the page


def sessions(jobs, per=5):
    """Run jobs (callables taking a Session) a few per Chrome, retrying a chunk up to three times if Chrome dies."""
    for i in range(0, len(jobs), per):
        for attempt in range(4):  # a cap kill or a closed pipe costs one attempt
            s = Session(SHOTS)
            try:
                for job in jobs[i:i + per]: job(s)
                break
            except Exception as error:  # cap kill, closed pipe or timeout: fresh Chrome, same chunk
                print('retry', i, type(error).__name__, str(error)[:120], flush=True)
            finally:
                s.close()


def new_clips(before, after):
    seen = {(c['k'], c['t']) for c in before}
    return [c for c in after if (c['k'], c['t']) not in seen]


def regressions(a, b):
    """What b (trial side) shows that a (reference side) does not: cut text, cut boxes, ovals, split or clamped titles."""
    ovals = {o['k'] for o in a['shapes']['ovals']}
    sa, sb = a.get('spill') or {}, b.get('spill') or {}
    pair = lambda c: (c['a'], c['b'], c['ta'], c['tb'])
    out = {'clips': new_clips(a['clips'], b['clips']), 'boxClips': new_clips(a['shapes']['boxClips'], b['shapes']['boxClips']),
           'spills': [x for x in sb.get('spills', []) if (x['k'], x['a'], x['t']) not in {(y['k'], y['a'], y['t']) for y in sa.get('spills', [])}],
           'collisions': [x for x in sb.get('collisions', []) if pair(x) not in {pair(y) for y in sa.get('collisions', [])}],
           'ovals': [o for o in b['shapes']['ovals'] if o['k'] not in ovals],
           'brokenWords': sorted(set(b['words']['broken']) - set(a['words']['broken'])), 'clamped': sorted(set(b['words']['clamped']) - set(a['words']['clamped'])),
           'overflow': b['overflow'], 'errors': b['errors'], 'ruleMismatches': (b['rules'] or {}).get('mismatches', [])}
    return {k: v for k, v in out.items() if v}


PHASES = ['cles', 'superpositions', 'largeurs', 'rangees', 'vivant', 'densite', 'combos', 'surfaces', 'clavier', 'campus']
asked = [a for a in sys.argv[1:] if a in PHASES] or PHASES[:-1]  # campus only on request
results = json.loads(OUT.read_text()) if OUT.exists() else {}
stamp = lambda p: time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(p.stat().st_mtime))
results['trialFiles'] = {f: stamp(ESSAIS / ID / f) for f in ('essai.css', 'essai.mjs', 'early.js')}
results.setdefault('ranAt', {})
# Trial file versions each phase was measured with (phases not run keep their earlier record).
results.setdefault('ranWith', {}).update({phase: results['trialFiles'] for phase in asked})


def save():
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')


KEY6 = ['ordinateur', 'fiche-ordinateur', 'profil-sombre-ordinateur', 'article-ordinateur', 'ar-sombre-mobile', 'mobile']
VIEWS = [  # (vue, route, theme, lang, viewport, action)
    ('ordinateur', 'projects', 'light', 'fr', D, None), ('fiche-ordinateur', f'projects/{PID}', 'light', 'fr', D, None),
    ('profil-sombre-ordinateur', f'people/{LEILA}', 'dark', 'fr', D, None), ('article-ordinateur', f'journal/{ART}', 'light', 'fr', D, None),
    ('ar-sombre-mobile', 'people', 'dark', 'ar', M, None), ('mobile', 'projects', 'light', 'fr', M, None),
    ('petit', 'projects', 'light', 'fr', S, None), ('profils-petit', 'people', 'light', 'fr', S, None),
    ('fiche-ar-sombre-petit', f'projects/{PID}', 'dark', 'ar', S, None), ('chroniques-en-mobile', 'journal', 'light', 'en', M, None),
    ('profil-en-mobile', f'people/{LEILA}', 'light', 'en', M, None), ('commentaires-en-sombre-ordinateur', f'projects/{PID}?tab=comments', 'dark', 'en', D, None),
    ('profils-liste-ordinateur', 'people', 'light', 'fr', D, 'list'), ('profils-liste-ar-sombre-mobile', 'people', 'dark', 'ar', M, 'list'),
    ('profils-liste-mobile', 'people', 'light', 'fr', M, 'list'),
]

if 'cles' in asked:
    store = results['cles'] = {}
    def job(vue, route, theme, lang, vp, kind, label, essais):
        def run(s):
            if label in store.get(vue, {}): return
            fresh(s, route, essais, theme, lang, vp)
            if kind: act(s, kind)
            store.setdefault(vue, {'route': route, 'theme': theme, 'lang': lang, 'viewport': list(vp[:2])})[label] = measure(s)
            print('cles', vue, label, store[vue][label]['sizesUI'], store[vue][label]['radii'], flush=True)
        return run
    sessions([job(*v, label, essais) for v in VIEWS for label, essais in (('avant', []), ('apres', [ID]))])
    union = lambda label, field: sorted({str(x) for v in KEY6 for x in store[v][label][field]}, key=lambda x: (x == 'full', float(x) if x != 'full' else 0))
    results['clesBilan'] = {
        'key6SizesUI': {l: union(l, 'sizesUI') for l in ('avant', 'apres')}, 'key6Radii': {l: union(l, 'radii') for l in ('avant', 'apres')},
        'key6SizesAll': {l: union(l, 'sizesAll') for l in ('avant', 'apres')},
        'perView': {v: [len(store[v]['avant']['sizesUI']), len(store[v]['apres']['sizesUI']), len(store[v]['avant']['radii']), len(store[v]['apres']['radii'])] for v in store},
        'regressions': {v: regressions(store[v]['avant'], store[v]['apres']) for v in store if regressions(store[v]['avant'], store[v]['apres'])},
        'rulesChecked': sum((store[v]['apres']['rules'] or {}).get('checked', 0) for v in store),
        'stateOk': all(store[v]['apres']['state']['sheet'] and not store[v]['avant']['state']['sheet'] for v in store),
    }
    results['ranAt']['cles'] = time.strftime('%Y-%m-%d %H:%M:%S'); save()


def pairs(phase, views):
    """Before/after measures of views (vue, route, theme, lang, viewport, action) and their regressions."""
    store = results[phase] = {}
    def job(vue, route, theme, lang, vp, kind, label, essais):
        def run(s):
            fresh(s, route, essais, theme, lang, vp); note = None
            if kind:
                try: act(s, kind)
                except RuntimeError as error: note = str(error)
            data = measure(s); data['actionError'] = note
            data['chips'] = s.js('[...document.querySelectorAll("#content-list .cp-profile-status")].filter(e=>e.getClientRects().length).slice(0,6).map(e=>[e.textContent.trim(),getComputedStyle(e).fontSize,e.scrollWidth>e.clientWidth+1])')
            store.setdefault(vue, {'route': route, 'theme': theme, 'lang': lang, 'viewport': list(vp[:2]), 'action': kind})[label] = data
            print(phase, vue, label, data['sizesUI'], data['radii'], data['open'], note, len(data['spill']['spills']), data['spill']['collisionCount'], flush=True)
        return run
    sessions([job(*v, label, essais) for v in views for label, essais in (('avant', []), ('apres', [ID]))])
    results[phase + 'Bilan'] = {
        'regressions': {v: regressions(x['avant'], x['apres']) for v, x in store.items() if regressions(x['avant'], x['apres'])},
        'open': {v: [x['avant']['open'], x['apres']['open'], x['apres']['actionError']] for v, x in store.items() if x.get('action')},
        'sizes': {v: [x['avant']['sizesUI'], x['apres']['sizesUI']] for v, x in store.items()},
        'radii': {v: [x['avant']['radii'], x['apres']['radii']] for v, x in store.items()},
        'offScale': {v: x['apres']['offScaleUI'] for v, x in store.items() if x['apres']['offScaleUI']},
        'chips': {v: [x['avant']['chips'], x['apres']['chips']] for v, x in store.items() if x['avant']['chips']},
        'rulesChecked': sum((x['apres']['rules'] or {}).get('checked', 0) for x in store.values()),
        'textsChecked': sum((x['apres']['spill'] or {}).get('texts', 0) for x in store.values()),
    }
    results['ranAt'][phase] = time.strftime('%Y-%m-%d %H:%M:%S'); save()


T = (834, 1112, True)  # tablet portrait
if 'superpositions' in asked:
    pairs('superpositions', [
        ('compte-ordinateur', 'projects', 'light', 'fr', D, 'account'), ('compte-ar-sombre-mobile', 'projects', 'dark', 'ar', M, 'account'),
        ('filtre-mobile', 'projects', 'light', 'fr', M, 'filter'), ('filtre-ouvert-sombre-ordinateur', 'projects', 'dark', 'fr', D, 'filter-open'),
        ('filtre-ouvert-petit', 'projects', 'light', 'fr', S, 'filter-open'), ('recherche-ordinateur', 'projects', 'light', 'fr', D, 'search'),
        ('recherche-ar-sombre-mobile', 'projects', 'dark', 'ar', M, 'search'), ('recherche-petit', 'projects', 'light', 'fr', S, 'search'),
        ('tri-ordinateur', 'projects', 'light', 'fr', D, 'sort'), ('tri-ar-sombre-mobile', 'projects', 'dark', 'ar', M, 'sort'),
        ('signaler-ordinateur', f'projects/{PID}', 'light', 'fr', D, 'report'), ('signaler-ar-sombre-mobile', f'projects/{PID}', 'dark', 'ar', M, 'report'),
        ('message-ordinateur', f'people/{LEILA}', 'light', 'fr', D, 'message'), ('message-ar-petit', f'people/{LEILA}', 'light', 'ar', S, 'message'),
        ('media-ordinateur', f'projects/{PID}', 'light', 'fr', D, 'media'), ('media-mobile', f'projects/{PID}', 'light', 'fr', M, 'media'),
        ('campus-ordinateur', f'projects/{PID}', 'light', 'fr', D, 'campus'), ('campus-ar-sombre-mobile', f'projects/{PID}', 'dark', 'ar', M, 'campus'),
        ('connexion-ordinateur', 'projects', 'light', 'fr', D, 'signin'), ('connexion-ar-sombre-mobile', 'projects', 'dark', 'ar', M, 'signin'),
        ('portee-petit', 'projects', 'light', 'fr', S, 'scope'),
    ])

if 'largeurs' in asked:
    pairs('largeurs', [
        ('profils-liste-701', 'people', 'light', 'fr', (701, 900, False), 'list'), ('profils-liste-720', 'people', 'light', 'fr', (720, 900, False), 'list'),
        ('profils-liste-768', 'people', 'light', 'fr', (768, 1024, True), 'list'), ('profils-liste-ar-sombre-768', 'people', 'dark', 'ar', (768, 1024, True), 'list'),
        ('profils-liste-800', 'people', 'light', 'fr', (800, 900, False), 'list'), ('profils-liste-tablette', 'people', 'light', 'fr', T, 'list'),
        ('profils-liste-1100', 'people', 'light', 'fr', (1100, 800, False), 'list'), ('profils-768', 'people', 'light', 'fr', (768, 1024, True), None),
        ('projets-768', 'projects', 'light', 'fr', (768, 1024, True), None), ('projets-liste-768', 'projects', 'light', 'fr', (768, 1024, True), 'list'),
        ('chroniques-tablette', 'journal', 'light', 'fr', T, None), ('fiche-768', f'projects/{PID}', 'light', 'fr', (768, 1024, True), None),
        ('profil-ar-sombre-768', f'people/{LEILA}', 'dark', 'ar', (768, 1024, True), None), ('article-tablette', f'journal/{ART}', 'light', 'fr', T, None),
        ('explorer-ordinateur', 'explore', 'light', 'fr', D, None), ('explorer-ar-sombre-mobile', 'explore', 'dark', 'ar', M, None),
    ])

# Profiles grid rows: a wrapped login placeholder pushes the campus line of its card down, so the
# cards of that row are no longer level (the baseline already does this below about 350 px).
ROWS_JS = r"""(()=>{const cards=[...document.querySelectorAll('#content-list .cp-profile-card')].filter(c=>c.getClientRects().length);const rows={};
for(const c of cards){const r=c.getBoundingClientRect();const l=c.querySelector('.cp-profile-login');const cs=l&&getComputedStyle(l);const camp=c.querySelector('.cp-content-campuses,.cp-meta');
 (rows[Math.round(r.top)]||(rows[Math.round(r.top)]=[])).push({lines:l?Math.round(l.getBoundingClientRect().height/parseFloat(cs.lineHeight)):0,fs:cs?.fontSize,campus:camp?Math.round(camp.getBoundingClientRect().top-r.top):null})}
const out=Object.values(rows);return{cards:cards.length,rows:out.length,unlevel:out.filter(r=>new Set(r.map(x=>x.campus)).size>1).length,wrapped:out.reduce((n,r)=>n+r.filter(x=>x.lines>1).length,0),loginSizes:[...new Set(out.flat().map(x=>x.fs))]}})()"""
if 'rangees' in asked:
    store = results['rangees'] = {}
    def job(lang, w, label, essais):
        def run(s):
            fresh(s, 'people', essais, 'light', lang, (w, 844, True))
            store.setdefault(f'{lang}-{w}', {})[label] = {'rows': s.js(ROWS_JS), 'errors': s.errors()}
            print('rangees', lang, w, label, store[f'{lang}-{w}'][label]['rows'], flush=True)
        return run
    sessions([job(lang, w, label, essais) for lang in ('fr', 'en', 'ar') for w in (320, 350, 360, 375, 390, 430) for label, essais in (('avant', []), ('apres', [ID]))])
    results['rangeesBilan'] = {k: [v['avant']['rows']['unlevel'], v['apres']['rows']['unlevel'], v['avant']['rows']['wrapped'], v['apres']['rows']['wrapped']] for k, v in store.items()}
    results['rangeesNouvelles'] = [k for k, v in store.items() if v['apres']['rows']['unlevel'] > v['avant']['rows']['unlevel']]
    results['ranAt']['rangees'] = time.strftime('%Y-%m-%d %H:%M:%S'); save()

if 'vivant' in asked:
    store = results['vivant'] = {}
    CASES = [('liste-ordinateur', 'projects', D, [('fr', 'dark'), ('ar', 'dark'), ('en', 'light')]),
             ('profil-mobile', f'people/{LEILA}', M, [('en', 'dark'), ('ar', 'light')])]
    def live(name, route, vp, steps):
        def run(s):
            fresh(s, route, [ID], 'light', 'fr', vp); seq = [{'step': 'fr-light', **measure(s)}]
            for lang, theme in steps:
                s.settings(lang, theme); time.sleep(1); seq.append({'step': f'{lang}-{theme}', **measure(s)})
            store.setdefault(name, {})['live'] = seq
        return run
    def ref(name, route, vp, lang, theme):
        def run(s):
            fresh(s, route, [ID], theme, lang, vp); store.setdefault(name, {})[f'fresh-{lang}-{theme}'] = measure(s)
        return run
    jobs = []
    for name, route, vp, steps in CASES:
        jobs.append(live(name, route, vp, steps)); jobs += [ref(name, route, vp, lang, theme) for lang, theme in steps]
    sessions(jobs, per=4)
    bilan = {}
    for name, route, vp, steps in CASES:
        for item in store[name]['live'][1:]:
            f = store[name].get('fresh-' + item['step'])
            if not f: continue
            bilan[f'{name}:{item["step"]}'] = {'sameSizes': item['sizesUI'] == f['sizesUI'], 'sameRadii': item['radii'] == f['radii'], 'sameElevations': item['elevations'] == f['elevations'],
                                               'onScale': not item['offScaleUI'], 'state': item['state'], 'errors': item['errors'], 'overflow': item['overflow'],
                                               'sizes': item['sizesUI'], 'freshSizes': f['sizesUI'], 'offScale': item['offScaleUI']}
    results['vivantBilan'] = bilan; results['ranAt']['vivant'] = time.strftime('%Y-%m-%d %H:%M:%S'); save()

if 'densite' in asked:
    store = results['densite'] = {}
    SIZES = [(1440, 900), (1440, 700), (1366, 768), (1280, 720), (1280, 600), (1100, 620), (1024, 768), (900, 600)]
    DENS = '''(()=>{const d=[...document.querySelectorAll('[data-detail-density]')].filter(e=>e.getClientRects().length).map(e=>e.dataset.detailDensity);const f=document.querySelector('.cp-detail-menu');return {density:d,menuOverflow:f?.dataset.overflow||null,overflow:document.documentElement.scrollWidth>innerWidth+1}})()'''
    def job(route, label, essais):
        def run(s):
            fresh(s, route, essais, 'light', 'fr', D); out = {}
            for w, h in SIZES:
                s.viewport(w, h, False); time.sleep(1.2); out[f'{w}x{h}'] = s.js(DENS)
            store.setdefault(route, {})[label] = out; print('densite', route, label, json.dumps(out)[:300], flush=True)
        return run
    sessions([job(r, l, e) for r in (f'projects/{PID}', f'people/{LEILA}', f'journal/{ART}') for l, e in (('avant', []), ('apres', [ID]))], per=3)
    results['densiteBilan'] = {r: {sz: [v['avant'][sz]['density'], v['apres'][sz]['density'], v['avant'][sz]['menuOverflow'], v['apres'][sz]['menuOverflow']] for sz in v['avant']
                                   if v['avant'][sz]['density'] != v['apres'][sz]['density'] or v['avant'][sz]['menuOverflow'] != v['apres'][sz]['menuOverflow']} for r, v in store.items()}
    results['densiteOverflow'] = [f'{r}:{sz}' for r, v in store.items() for sz, x in v['apres'].items() if x['overflow']]
    results['ranAt']['densite'] = time.strftime('%Y-%m-%d %H:%M:%S'); save()

if 'combos' in asked:
    store = results['combos'] = {}
    results['combinedFiles'] = {o: stamp(ESSAIS / o / 'essai.css') for o in ('lisibilite-textes', 'titres-forts', 'pseudo-manquant')}
    GROUPS = {
        'lisibilite-textes': [('profils-liste-mobile', 'people', 'light', 'fr', M, 'list'), ('profils-liste-1024', 'people', 'light', 'fr', (1024, 768, False), 'list'),
                              ('profils-ar-sombre-mobile', 'people', 'dark', 'ar', M, None), ('mobile', 'projects', 'light', 'fr', M, None),
                              ('ordinateur', 'projects', 'light', 'fr', D, None), ('fiche-ordinateur', f'projects/{PID}', 'light', 'fr', D, None),
                              ('profil-mobile', f'people/{LEILA}', 'light', 'fr', M, None), ('chroniques-petit', 'journal', 'light', 'fr', S, None)],
        'titres-forts': [('petit', 'projects', 'light', 'fr', S, None), ('chroniques-petit', 'journal', 'light', 'fr', S, None), ('profils-petit', 'people', 'light', 'fr', S, None),
                         ('fiche-petit', f'projects/{PID}', 'light', 'fr', S, None), ('mobile', 'projects', 'light', 'fr', M, None), ('ordinateur', 'projects', 'light', 'fr', D, None)],
        'pseudo-manquant': [('profils-mobile', 'people', 'light', 'fr', M, None), ('profils-ar-sombre-petit', 'people', 'dark', 'ar', S, None), ('profils-ordinateur', 'people', 'light', 'fr', D, None)],
    }
    def job(other, vue, route, theme, lang, vp, kind, label, essais):
        def run(s):
            fresh(s, route, essais, theme, lang, vp)
            if kind: act(s, kind)
            data = measure(s); data['combo'] = s.js(COMBO_JS, 20)
            data['chips'] = s.js('[...document.querySelectorAll("#content-list .cp-profile-status")].filter(e=>e.getClientRects().length).slice(0,4).map(e=>[e.textContent.trim(),getComputedStyle(e).fontSize,e.scrollWidth>e.clientWidth+1])')
            store.setdefault(other, {}).setdefault(vue, {'route': route, 'theme': theme, 'lang': lang, 'viewport': list(vp[:2])})[label] = data
            print('combos', other, vue, label, data['sizesUI'], (data['combo'] or {}).get('floors', {}) and data['combo']['floors'].get('failures'), len(data['clips']), flush=True)
        return run
    jobs = [job(o, *v, l, e) for o, views in GROUPS.items() for v in views for l, e in (('seul', [o]), ('ensemble', [o, ID]))]
    sessions(jobs)
    bilan = {}
    for o, views in store.items():
        for vue, v in views.items():
            if 'seul' not in v or 'ensemble' not in v: continue
            a, b = v['seul'], v['ensemble']
            floors = (b['combo'] or {}).get('floors') or {}; titles = (b['combo'] or {}).get('titles') or {}
            bilan[f'{o}:{vue}'] = {'regressions': regressions(a, b),
                                   'floors': [floors.get('checked'), floors.get('failures'), floors.get('failed')], 'titles': [titles.get('checked'), titles.get('failures'), titles.get('failed')],
                                   'chips': [a['chips'], b['chips']]}
    results['combosBilan'] = bilan; results['ranAt']['combos'] = time.strftime('%Y-%m-%d %H:%M:%S'); save()

if 'surfaces' in asked:
    store = results['surfaces'] = {}
    SURF = '''(()=>{const e=document.querySelector('dialog[open]')||document.querySelector('#scope-popover:not([hidden])');if(!e)return null;const s=getComputedStyle(e),h=e.querySelector('h2');return{id:e.id,kind:e.dataset.kind||'',radius:s.borderRadius,shadow:s.boxShadow,title:h&&getComputedStyle(h).fontSize,selects:[...e.querySelectorAll('select')].map(x=>getComputedStyle(x).borderRadius)}})()'''
    CASES = [('popover-ordinateur', 'projects', 'light', 'fr', D, 'scope'), ('popover-ar-sombre-mobile', 'projects', 'dark', 'ar', M, 'scope'),
             ('apropos-ordinateur', 'explore', 'light', 'fr', D, 'about'), ('awards-ordinateur', 'awards', 'light', 'fr', D, None), ('awards-ar-sombre-mobile', 'awards', 'dark', 'ar', M, None)]
    def job(vue, route, theme, lang, vp, kind, label, essais):
        def run(s):
            fresh(s, route, essais, theme, lang, vp); note = None
            if kind:
                try: act(s, kind)
                except RuntimeError as error: note = str(error)
            data = measure(s); data['surface'] = s.js(SURF); data['actionError'] = note
            if vue.startswith('awards'): s.shot(f'{label}-{vue}')
            store.setdefault(vue, {})[label] = data; print('surfaces', vue, label, data['surface'], note, flush=True)
        return run
    sessions([job(*v, l, e) for v in CASES for l, e in (('avant', []), ('apres', [ID]))])
    results['surfacesBilan'] = {v: {'surface': [x['avant']['surface'], x['apres']['surface']], 'regressions': regressions(x['avant'], x['apres']),
                                    'sizes': [x['avant']['sizesUI'], x['apres']['sizesUI']]} for v, x in store.items()}
    results['awardsPixelDiff'] = {v: round(image_diff(SHOTS / f'avant-{v}.png', SHOTS / f'apres-{v}.png'), 5) for v in ('awards-ordinateur', 'awards-ar-sombre-mobile')}
    results['ranAt']['surfaces'] = time.strftime('%Y-%m-%d %H:%M:%S'); save()

if 'clavier' in asked:
    store = results['clavier'] = {}
    def job(vue, page, route, theme, lang, vp, opener, label, essais):
        def run(s):
            fresh(s, route, essais, theme, lang, vp, page=page)
            if page == 'index.html': s.wait('[...document.querySelectorAll(".entrance-action")].some(e=>e.getBoundingClientRect().width>0)', 30); time.sleep(1.5)
            if opener: s.click(opener); time.sleep(.8)
            else: s.blur()
            seq = []
            for _ in range(8): s.key('Tab'); seq.append(s.js(FOCUS_JS))
            store.setdefault(vue, {})[label] = {'focus': seq, 'errors': s.errors()}
            print('clavier', vue, label, [x and x['k'] for x in seq], flush=True)
        return run
    CASES = [('arrivee-ordinateur', 'index.html', '', 'light', 'fr', D, None), ('arrivee-ar-sombre-mobile', 'index.html', '', 'dark', 'ar', M, None),
             ('compte-ordinateur', 'content-preview.html', 'projects', 'light', 'fr', D, '#profile')]
    sessions([job(*v, l, e) for v in CASES for l, e in (('avant', []), ('apres', [ID]))], per=3)
    sig = lambda seq: [[x and x['k'], x and x['outline'], x and x['focusVisible']] for x in seq]
    results['clavierBilan'] = {v: {'same': sig(x['avant']['focus']) == sig(x['apres']['focus']), 'visible': all(f is None or f['focusVisible'] for f in x['apres']['focus']),
                                   'radius': [[f and f['radius'] for f in x[l]['focus']] for l in ('avant', 'apres')], 'errors': x['apres']['errors']} for v, x in store.items()}
    results['ranAt']['clavier'] = time.strftime('%Y-%m-%d %H:%M:%S'); save()

# Campus sheet with the real globe (the only phase that loads it): excluded by the trial, so the open
# sheet must look the same; compared on the sheet's own area.
if 'campus' in asked:
    store = results['campus'] = {}
    CAMPUS_JS = '''(()=>{const d=document.querySelector('dialog[data-kind=campus][open]');if(!d)return null;const r=d.getBoundingClientRect(),s=getComputedStyle(d);return{r:[r.x,r.y,r.width,r.height],radius:s.borderRadius,shadow:s.boxShadow,images:[...d.querySelectorAll('img')].map(i=>i.complete)}})()'''
    # Every element of the open sheet: font size, radii and shadow must be the baseline's.
    STYLES_JS = '''(()=>{const d=document.querySelector('dialog[data-kind=campus][open]');if(!d)return null;return[d,...d.querySelectorAll('*')].map(e=>{const s=getComputedStyle(e);return[e.tagName.toLowerCase()+'.'+(typeof e.className==='string'?e.className.trim().split(/\\s+/)[0]:''),s.fontSize,s.borderTopLeftRadius,s.borderBottomRightRadius,s.boxShadow]})})()'''
    # The route only selects Paris; its sheet opens from a click on the selected campus marker once the flight ends.
    CLICK_JS = '''(()=>{const m=[...document.querySelectorAll('.hg-marker')].find(b=>/Paris/.test(b.textContent)&&b.getClientRects().length);if(!m)return false;m.click();return true})()'''
    def job(label, essais):
        def run(s):
            s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.3)
            s.open('explore?country=FRA&campus=paris', essais=essais, viewport=D, block_globe=False)
            ok = False
            for _ in range(25):
                time.sleep(1); s.js(CLICK_JS)
                if s.wait('Boolean(document.querySelector("dialog[data-kind=campus][open]"))', 2): ok = True; break
            s.wait('[...document.querySelectorAll("dialog[open] img")].every(i=>i.complete)', 20); time.sleep(3)
            store[label] = {'open': ok, 'dialog': s.js(CAMPUS_JS), 'styles': s.js(STYLES_JS, 20), 'errors': s.errors()}
            if ok: s.shot(f'{label}-campus-ordinateur')
            print('campus', label, ok, store[label]['dialog'], len(store[label]['styles'] or []), flush=True)
        return run
    sessions([job('avant', []), job('apres', [ID])], per=2)
    a, b = store.get('avant', {}), store.get('apres', {})
    if a.get('dialog') and b.get('dialog'):
        from PIL import Image
        import numpy as np
        x, y, w, h = (round(v) for v in a['dialog']['r'])
        crop = lambda label: np.asarray(Image.open(SHOTS / f'{label}-campus-ordinateur.png').convert('RGB').crop((x, y, x + w, y + h)), dtype=int)
        results['campusBilan'] = {'sameBox': a['dialog']['r'] == b['dialog']['r'], 'sameRadius': a['dialog']['radius'] == b['dialog']['radius'], 'sameShadow': a['dialog']['shadow'] == b['dialog']['shadow'],
                                  'sameStyles': a['styles'] == b['styles'], 'elements': len(a['styles'] or []),
                                  'pixelDiff': round(float((np.abs(crop('avant') - crop('apres')).sum(axis=2) > 24).mean()), 5), 'errors': b.get('errors')}
    else:
        results['campusBilan'] = {'opened': [a.get('open'), b.get('open')]}
    results['ranAt']['campus'] = time.strftime('%Y-%m-%d %H:%M:%S'); save()

save()
for k in ('clesBilan', 'superpositionsBilan', 'largeursBilan', 'rangeesBilan', 'rangeesNouvelles', 'vivantBilan', 'densiteBilan', 'combosBilan', 'surfacesBilan', 'awardsPixelDiff', 'clavierBilan', 'campusBilan'):
    if k in results: print(k, json.dumps(results[k], ensure_ascii=False)[:2500])
