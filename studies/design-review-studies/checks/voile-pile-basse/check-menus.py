"""Trial voile-pile-basse, complement: page menus opened next to the floating stack.
The baseline stops these menus 8 px (lists, comments) or 12 px (section selectors) above the
capsule, i.e. inside the veil's 24 px ramp; the trial lets the veil step aside while one is open.
Run: python3 -I studies/design-review-studies/checks/voile-pile-basse/check-menus.py"""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, L, image_diff

ID = 'voile-pile-basse'
OUT = HERE / 'results-menus.json'
VEIL_JS = '''(()=>{const v=getComputedStyle(document.getElementById('app'),'::before'),w=getComputedStyle(document.getElementById('content-sheet'),'::after');
return v.display!=='none'&&v.content!=='none'?v:w})()'''
# Veil opacity at a viewport y from the trial's gradient (solid, 82 % at 35 % of the 24 px ramp, then 0).
ALPHA_JS = '''((y,o)=>{const host=VEIL,H=parseFloat(host.height)||0,ramp=24,plein=H-ramp,d=innerHeight-y;
let a=0;if(H&&d<=plein)a=1;else if(H&&d<=plein+ramp*.35)a=1-.18*(d-plein)/(ramp*.35);else if(H&&d<=H)a=.82*(1-(d-plein-ramp*.35)/(ramp*.65));
return +(a*(o===undefined?parseFloat(host.opacity)||0:o)).toFixed(3)})'''.replace('VEIL', VEIL_JS)
# Open popup of the page: a role=menu panel, or the panel of an open section selector.
STATE_JS = '''(()=>{const alpha=ALPHA,host=VEIL,H=parseFloat(host.height)||0,top=innerHeight-H,cap=document.querySelector('.dock-search-toggle').getBoundingClientRect();
const p=[...document.querySelectorAll('#content-sheet [role=menu]:not([hidden]),#content-sheet details[open] :is(.cp-project-switch-panel,.cp-profile-switch-panel)')].find(e=>e.getClientRects().length&&!e.closest('[hidden]'));
const base={veilTop:+top.toFixed(1),veilOpacity:host.opacity,capsuleTop:cap.top,dialog:Boolean(document.querySelector('dialog[open]'))};
if(!p)return {...base,panel:null};
const r=p.getBoundingClientRect(),items=[...p.querySelectorAll('[role^=menuitem],a')].filter(e=>e.getClientRects().length),last=items.filter(e=>e.getBoundingClientRect().top<r.bottom).at(-1)?.getBoundingClientRect();
return {...base,panel:{cls:String(p.className).slice(0,40),top:+r.top.toFixed(1),bottom:+r.bottom.toFixed(1),h:+r.height.toFixed(1),scrolls:p.scrollHeight>p.clientHeight+1},
 gapToCapsule:+(cap.top-r.bottom).toFixed(1),inVeilZone:+Math.max(0,r.bottom-top).toFixed(1),
 alphaAtPanelBottom:alpha(r.bottom-1),alphaAtLastItemText:last?alpha(Math.min(last.bottom,r.bottom)-8):null,
 alphaAtPanelBottomIfVeilShown:alpha(r.bottom-1,1),alphaAtLastItemTextIfVeilShown:last?alpha(Math.min(last.bottom,r.bottom)-8,1):null}})()'''.replace('ALPHA', ALPHA_JS).replace('VEIL', VEIL_JS)
TRIGGER_JS = '''(sel=>{const t=[...document.querySelectorAll(sel)].find(e=>e.getClientRects().length&&!e.closest('[hidden]'));if(!t)return null;const r=t.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,top:r.top,bottom:r.bottom}})'''
LIST_MENU = '#content-sheet .cp-content-controls .cp-control-menu[data-control="%s"] > .cp-control-trigger'
FORCE_VEIL = '(()=>{let s=document.getElementById("qa-force");if(!s){s=document.createElement("style");s.id="qa-force";document.head.append(s)}s.textContent=%s;return true})()'


def press(s, point):
    for kind in ('mousePressed', 'mouseReleased'):
        s.c.call('Input.dispatchMouseEvent', {'type': kind, 'x': point['x'], 'y': point['y'], 'button': 'left', 'clickCount': 1})


def trial(s, case, selector, shots=None):
    """Open the popup from its trigger, measure the veil while it is open, close it, measure again."""
    point = s.js(TRIGGER_JS + '(' + json.dumps(selector) + ')')
    if not point: return {**case, 'missing': selector}
    press(s, point); time.sleep(1.3)
    out = {**case, 'open': s.js(STATE_JS)}
    if shots: shots(out)
    s.key('Escape'); time.sleep(1.3); s.away()
    out['closed'] = {k: v for k, v in s.js(STATE_JS).items() if k in ('veilOpacity', 'panel')}
    out['errors'] = s.errors()
    print(json.dumps({k: out.get(k) for k in ('vue', 'route', 'menu')}, ensure_ascii=False), json.dumps({k: out['open'].get(k) for k in ('veilOpacity', 'inVeilZone', 'gapToCapsule', 'alphaAtLastItemText', 'alphaAtLastItemTextIfVeilShown')}), 'closed', out['closed']['veilOpacity'], flush=True)
    return out


results = {'id': ID, 'what': 'page menus next to the stack', 'cases': [], 'captures': {}, 'errors': []}
s = Session(HERE)
try:
    # List menus at rest: landscape phone (they reach the baseline limit) and portrait phone.
    for vue, vp in (('paysage', L), ('mobile', M)):
        for name in ('layout', 'sort'):
            s.open('projects', essais=[ID], viewport=vp, block_globe=True)
            def shots(out, vue=vue, name=name):
                if vue != 'paysage' or name != 'sort': return
                s.shot('apres-menu-paysage')
                s.js(FORCE_VEIL % json.dumps('#app::before{opacity:1!important;visibility:visible!important}')); time.sleep(.3)
                s.shot('mesure-menu-sans-ajustement-paysage'); s.js(FORCE_VEIL % json.dumps(''))
            results['cases'].append(trial(s, {'vue': vue, 'route': 'projects', 'menu': name}, LIST_MENU % name, shots))
    # Comment sort menu opened just above the stack (portrait phone): the page is scrolled first.
    route = 'projects/ft-transcendence-building-together?tab=comments'
    s.open(route, essais=[ID], viewport=M, block_globe=True)
    t = s.js(TRIGGER_JS + '(".cp-comments-sort")')
    veil_top = s.js('innerHeight-parseFloat(' + VEIL_JS + '.height)')
    if t: s.scroll(max(0, round(s.js('scrollY') + t['bottom'] - (veil_top - 70))))
    results['cases'].append(trial(s, {'vue': 'mobile', 'route': route, 'menu': 'comment-sort', 'scrollY': s.js('Math.round(scrollY)')}, '.cp-comments-sort'))
    # Mobile section selector of a project detail (details/summary).
    route = 'projects/ft-transcendence-building-together?tab=overview'
    s.open(route, essais=[ID], viewport=M, block_globe=True)
    results['cases'].append(trial(s, {'vue': 'mobile', 'route': route, 'menu': 'section-selector'}, '.cp-project-section-trigger'))
    results['errors'] = s.errors()
    # Baseline frame for the landscape sort menu.
    s.open('projects', viewport=L, block_globe=True)
    point = s.js(TRIGGER_JS + '(' + json.dumps(LIST_MENU % 'sort') + ')'); press(s, point); time.sleep(1.3)
    results['baselineLandscapeSort'] = s.js(STATE_JS); s.shot('avant-menu-paysage')
finally:
    s.close()

results['captures'] = {'avant': 'avant-menu-paysage.png', 'apres': 'apres-menu-paysage.png', 'sansAjustement': 'mesure-menu-sans-ajustement-paysage.png',
                       'pixelShareAvantApres': round(image_diff(HERE / 'avant-menu-paysage.png', HERE / 'apres-menu-paysage.png'), 5)}
cases = [c for c in results['cases'] if 'open' in c]
results['passed'] = bool(len(cases) == 6 and all(c['open']['panel'] and c['open']['veilOpacity'] == '0' and c['open']['alphaAtLastItemText'] == 0 and c['closed']['veilOpacity'] == '1' and not c['closed']['panel'] and not c['errors'] for c in cases))
OUT.write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
print('passed', results['passed'], 'written', OUT)
