"""Shared tools of the combination check (15 Oct 2026), zone « rubriques, fiches et dialogues ».

Read-only on the trials: the detectors written by the trials' own checkers are read from their
source files (ast, never imported or run), and this folder only adds its own measures:
 - CASCADE_JS: on one loaded page with the nine trials, every visible element is read with all
   trial sheets on, with none, and with each trial sheet alone (data-essais follows, since
   echelle-unifiee reads it). For each computed property, the trials that change it alone are
   named; the combination must show the value of the single trial that changes it, and the
   properties changed by several trials are listed for judgement.
 - BUTTONS_JS: geometry, colours, label clipping and focus ring of given buttons.
"""
import ast, json, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
CHECKS = HERE.parents[1]
STUDY_ROOT = CHECKS.parent
sys.path.insert(0, str(CHECKS))
from helper import Session, D, M, S, L, contrast, image_diff  # noqa: E402

# Canonical order of essais/boot.js (stylesheet order in the page).
ALL9 = ['globe-espace-libre', 'police-etiquettes-globe', 'une-colonne-320', 'roles-couleur', 'visiter-contour-sombre',
        'lisibilite-textes', 'echelle-unifiee', 'pseudo-manquant', 'awards-a-venir']
S340 = (340, 640, True)
S360 = (360, 640, True)
PID, LEILA, ART = 'ft-transcendence-building-together', 'profile-leila-mansour', 'journal-an-evening-debugging'


def js_consts(path, names):
    """String constants of another check script, read from its syntax tree (the script is not run)."""
    found = {}
    for node in ast.walk(ast.parse(Path(path).read_text())):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id in names and target.id not in found:
                    try: found[target.id] = ast.literal_eval(node.value)
                    except ValueError: pass
    missing = set(names) - set(found)
    if missing: raise KeyError(f'{path}: {sorted(missing)}')
    return found


_v = js_consts(CHECKS / 'echelle-unifiee' / 'verif.py', ['CLIP_JS', 'SHAPE_JS', 'SPILL_JS'])
_c = js_consts(CHECKS / 'echelle-unifiee' / 'check.py', ['WORDS_JS'])
_u = js_consts(CHECKS / 'une-colonne-320' / 'contre-verification.py', ['AUDIT_JS', 'BREAKS_JS'])
_p = js_consts(CHECKS / 'pseudo-manquant' / 'contre-verification.py', ['GRID', 'LIST', 'UNLEVEL'])
CLIP_JS, SHAPE_JS, SPILL_JS, WORDS_JS = _v['CLIP_JS'], _v['SHAPE_JS'], _v['SPILL_JS'], _c['WORDS_JS']
AUDIT_JS, BREAKS_JS = _u['AUDIT_JS'], _u['BREAKS_JS']
GRID_JS, LIST_JS, UNLEVEL_JS = _p['GRID'], _p['LIST'], _p['UNLEVEL']

# Visible elements, read under several sets of trial sheets (transitions off while reading).
CASCADE_JS = r'''((ids,props,scope)=>{
const root=document.documentElement,links=[...document.querySelectorAll('link[data-essai]')],saved=root.dataset.essais;
const vis=el=>{if(el.closest('svg')&&el.tagName.toLowerCase()!=='svg')return false;if(!el.checkVisibility({visibilityProperty:true}))return false;const r=el.getBoundingClientRect();return r.width>0.5&&r.height>0.5};
const key=el=>{const c=typeof el.className==='string'?el.className.trim().split(/\s+/).filter(Boolean).slice(0,2).join('.'):'';const host=el.closest('[id],[data-profile-id],[data-id]');
 const h=host&&host!==el?(host.id?'#'+host.id:host.dataset.profileId?'['+host.dataset.profileId+']':'['+(host.dataset.id||'')+']'):'';const t=(el.childElementCount===0?el.textContent:'').trim().slice(0,24);
 return el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(c?'.'+c:'')+(h?' in '+h:'')+(t?' "'+t+'"':'')};
const els=[...document.querySelectorAll(scope)].filter(vis);
const freeze=document.createElement('style');freeze.textContent='*,*::before,*::after{transition:none!important}';document.head.append(freeze);
const read=()=>els.map(e=>{const s=getComputedStyle(e);return props.map(p=>s.getPropertyValue(p))});
const only=list=>{for(const l of links)if(l.sheet)l.sheet.disabled=!list.includes(l.dataset.essai);root.dataset.essais=list.join(' ')};
const states={};
try{only(ids);states.combo=read();only([]);states.base=read();for(const id of ids){only([id]);states[id]=read()}}
finally{only(ids);root.dataset.essais=saved;freeze.remove()}
const changed={},kept={},issues=[],multi={};
els.forEach((el,i)=>props.forEach((p,j)=>{const b=states.base[i][j],c=states.combo[i][j];const by=ids.filter(id=>states[id][i][j]!==b);
 for(const id of by){changed[id]=(changed[id]||0)+1;if(states[id][i][j]===c)kept[id]=(kept[id]||0)+1}
 if(!by.length){if(c!==b)issues.push({k:key(el),p,kind:'combo-only',base:b,combo:c})}
 else if(by.length===1){if(c!==states[by[0]][i][j])issues.push({k:key(el),p,kind:'override',by:by[0],alone:states[by[0]][i][j],base:b,combo:c})}
 else{const vals=Object.fromEntries(by.map(id=>[id,states[id][i][j]]));const sig=p+' | '+by.join('+')+' | '+JSON.stringify(vals)+' | base '+b+' | combo '+c;
  const m=multi[sig]||(multi[sig]={p,by,vals,base:b,combo:c,n:0,sample:[]});m.n++;if(m.sample.length<4)m.sample.push(key(el))}}));
return{elements:els.length,changed,kept,issues:issues.slice(0,120),issueCount:issues.length,multi:Object.values(multi).sort((a,b)=>b.n-a.n).slice(0,80),multiCount:Object.keys(multi).length}})'''
CASCADE_PROPS = ['font-size', 'line-height', 'font-family', 'font-weight', 'letter-spacing', 'color', 'background-color',
                 'border-top-color', 'border-top-width', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius',
                 'border-bottom-left-radius', 'box-shadow', 'display', 'visibility', 'grid-template-columns', 'white-space', 'opacity', 'outline-style']

# Buttons: box, colours, radius, shadow, size, padding, clipped label, focus ring.
BUTTONS_JS = r'''((items)=>{const prev=document.activeElement;const out=items.map(([name,sel])=>{const e=document.querySelector(sel);if(!e)return{name,sel,found:false};
 const r=e.getBoundingClientRect(),s=getComputedStyle(e);const range=document.createRange();range.selectNodeContents(e);
 const rs=[...range.getClientRects()].filter(q=>q.width>.5&&q.height>.5);const tb=rs.length?{l:Math.min(...rs.map(q=>q.left)),r:Math.max(...rs.map(q=>q.right)),t:Math.min(...rs.map(q=>q.top)),b:Math.max(...rs.map(q=>q.bottom))}:null;
 const tops=[...new Set(rs.map(q=>Math.round(q.top)))];
 let clipAnc=null;for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){const t=getComputedStyle(a);if(['hidden','clip'].includes(t.overflowX)||['hidden','clip'].includes(t.overflowY)){const ar=a.getBoundingClientRect();if(r.left<ar.left-.5||r.right>ar.right+.5||r.top<ar.top-.5||r.bottom>ar.bottom+.5){clipAnc=(a.className||a.tagName).toString().slice(0,40)}break}}
 const focus=null;
 return{name,sel,found:true,text:e.textContent.replace(/\s+/g,' ').trim().slice(0,50),rect:[+r.left.toFixed(2),+r.top.toFixed(2),+r.right.toFixed(2),+r.bottom.toFixed(2)],
  w:+r.width.toFixed(2),h:+r.height.toFixed(2),disabled:e.disabled===true,color:s.color,bg:s.backgroundColor,border:s.borderTopColor+' '+s.borderTopWidth+' '+s.borderTopStyle,
  radius:s.borderTopLeftRadius+' '+s.borderTopRightRadius+' '+s.borderBottomRightRadius+' '+s.borderBottomLeftRadius,shadow:s.boxShadow,fs:s.fontSize,fw:s.fontWeight,lh:s.lineHeight,pad:s.padding,
  labelLines:tops.length,overflowX:e.scrollWidth>e.clientWidth+1,overflowY:e.scrollHeight>e.clientHeight+1,
  textOut:tb?Math.max(r.left-tb.l,tb.r-r.right,r.top-tb.t,tb.b-r.bottom,0):0,clippedBy:clipAnc,
  inViewport:r.left>=-.5&&r.right<=innerWidth+.5&&r.top>=-.5&&r.bottom<=innerHeight+.5,focus}});
 items.forEach(([name,sel],i)=>{const e=document.querySelector(sel);if(!e||!out[i].found)return;e.focus({focusVisible:true,preventScroll:true});const f=getComputedStyle(e);out[i].focus={visible:e.matches(':focus-visible'),active:document.activeElement===e,outline:[f.outlineStyle,f.outlineWidth,f.outlineColor,f.outlineOffset].join(' '),shadow:f.boxShadow}});
 if(prev&&prev.isConnected&&prev.focus)prev.focus({preventScroll:true});return out})'''

STATE_JS = '''({essais:document.documentElement.dataset.essais||'',ready:document.documentElement.dataset.essaisReady||'',sheets:[...document.querySelectorAll('link[data-essai]')].map(l=>l.dataset.essai),theme:document.documentElement.dataset.theme,lang:document.documentElement.lang,dir:document.documentElement.dir||getComputedStyle(document.documentElement).direction,view:document.querySelector('#content-index')?.dataset.view||null,section:document.querySelector('#content-index')?.dataset.section||null,hash:location.hash,w:innerWidth,h:innerHeight})'''


def load(s, route, essais, theme='light', lang='fr', vp=D, page='content-preview.html', block=True, settle=1.2):
    """Fresh document load (about:blank first, so a hash-only change cannot reuse the previous document)."""
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.3)
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=block, page=page, settle=settle)
    state = s.js(STATE_JS)
    want = [e for e in ALL9 if e in essais]
    assert state['sheets'] == want, f'sheets {state["sheets"]} != {want}'
    return state


def ensure_view(s, view):
    """Grid/List of the current list section (the choice persists per section in localStorage)."""
    if s.js('document.querySelector("#content-index")?.dataset.view') == view: return
    s.click('#content-layout-button'); time.sleep(.5)
    s.click(f'#content-layout-menu [data-value={view}]'); time.sleep(1.2); s.away(); s.blur()
    got = s.js('document.querySelector("#content-index")?.dataset.view')
    assert got == view, f'view {got} != {view}'


def cascade(s, scope='body *'):
    return s.js(CASCADE_JS + f'({json.dumps(ALL9)},{json.dumps(CASCADE_PROPS)},{json.dumps(scope)})', 90)


def present(s):
    return [e for e in ALL9 if e in (s.js('document.documentElement.dataset.essais') or '').split()]


class Store:
    """results.json of one phase script, saved after every case."""
    def __init__(self, name):
        self.path = HERE / f'{name}.json'
        self.data = json.loads(self.path.read_text()) if self.path.exists() else {}

    def put(self, key, value):
        self.data[key] = value; self.save()

    def save(self):
        self.path.write_text(json.dumps(self.data, ensure_ascii=False, indent=1) + '\n')


def run_jobs(jobs, out_dir, per=6):
    """Run jobs (callables taking a Session) a few per Chrome; a dead Chrome costs one retry of its chunk."""
    for i in range(0, len(jobs), per):
        for attempt in range(3):
            s = Session(out_dir)
            try:
                for job in jobs[i:i + per]: job(s)
                break
            except Exception as error:
                print('retry chunk', i, type(error).__name__, str(error)[:200], flush=True)
                if attempt == 2: raise
            finally:
                s.close()


def scoped(js):
    """A whole-page detector restricted to window.__qaScope when it is set (an open dialog or menu)."""
    out = (js.replace('document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT)', 'document.createTreeWalker(window.__qaScope||document.body,NodeFilter.SHOW_TEXT)')
             .replace("document.querySelectorAll('body *')", "(window.__qaScope||document.body).querySelectorAll('*')")
             .replace("document.querySelectorAll('#app *,dialog[open] *,#scope-popover *')", "(window.__qaScope?window.__qaScope.querySelectorAll('*'):document.querySelectorAll('#app *,dialog[open] *,#scope-popover *'))"))
    assert out != js, 'scope hook not found'
    return out


CLIP_SCOPED, SHAPE_SCOPED, SPILL_SCOPED = scoped(CLIP_JS), scoped(SHAPE_JS), scoped(SPILL_JS)

# Evaluates f() with all trial sheets, none, then each one alone (same document, transitions off).
TOGGLE_JS = r'''((ids,f)=>{const root=document.documentElement,links=[...document.querySelectorAll('link[data-essai]')],saved=root.dataset.essais;
const freeze=document.createElement('style');freeze.textContent='*,*::before,*::after{transition:none!important}';document.head.append(freeze);
const only=list=>{for(const l of links)if(l.sheet)l.sheet.disabled=!list.includes(l.dataset.essai);root.dataset.essais=list.join(' ')};
const out={};try{only(ids);out.combo=f();only([]);out.base=f();for(const id of ids){only([id]);out[id]=f()}}finally{only(ids);root.dataset.essais=saved;freeze.remove()}return out})'''


def toggle(s, fn_src):
    return s.js(TOGGLE_JS + f'({json.dumps(ALL9)},{fn_src})', 60)


def owners(per_state, keys):
    """Per item and property: trials that change it alone, the value expected in the combination, and the combination."""
    out = []
    items = per_state['combo']
    for i, combo in enumerate(items):
        if combo is None: continue
        for k in keys:
            b = per_state['base'][i][k] if per_state['base'][i] else None
            by = [t for t in ALL9 if per_state[t][i] and per_state[t][i][k] != b]
            row = {'i': i, 'p': k, 'base': b, 'combo': combo[k], 'par': by, 'seuls': {t: per_state[t][i][k] for t in by}}
            row['etat'] = ('inchangé' if combo[k] == b else 'modifié par la combinaison seule') if not by else (
                'conforme' if len(by) == 1 and combo[k] == per_state[by[0]][i][k] else 'écart' if len(by) == 1 else 'plusieurs essais')
            out.append(row)
    return out
