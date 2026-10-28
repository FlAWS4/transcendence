"""Trial recherche-repliee, complement: runtime language and theme changes (account menu),
Explorer <-> content navigation, the die following the capsule's morph, keyboard use, reduced
motion and the RTL search. Writes results-complement.json next to results.json.
Run: python3 -I studies/design-review-studies/checks/recherche-repliee/check-complement.py"""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M

ID = 'recherche-repliee'
OUT = HERE / 'results-complement.json'
STATE_JS = '''(()=>{const t=document.querySelector('.dock-search-toggle'),d=document.querySelector('.dock-random-toggle'),l=t.querySelector('.dock-search-toggle-label'),i=t.querySelector('svg[data-essai]');
const box=e=>{const r=e.getBoundingClientRect();return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}};const ts=getComputedStyle(t),ds=getComputedStyle(d);
return {section:document.getElementById('app').dataset.section,lang:document.documentElement.lang,dir:document.documentElement.dir,theme:document.documentElement.dataset.theme,
 toggle:box(t),die:box(d),name:t.getAttribute('aria-label'),title:t.title,label:l.textContent,labelDisplay:getComputedStyle(l).display,icons:t.querySelectorAll('svg[data-essai]').length,iconDisplay:i?getComputedStyle(i).display:'absent',
 color:ts.color,dieColor:ds.color,bg:ts.backgroundColor,dieBg:ds.backgroundColor,border:ts.borderTopColor,dieBorder:ds.borderTopColor,
 transitions:{toggle:ts.transitionDuration,die:ds.transitionDuration,icon:i?getComputedStyle(i).transitionDuration:null}}})()'''
SAMPLE_JS = '''(()=>{window.qaSamples=[];const t=document.querySelector('.dock-search-toggle'),d=document.querySelector('.dock-random-toggle'),start=performance.now();
const rtl=document.documentElement.dir==='rtl';
(function step(){const a=t.getBoundingClientRect(),b=d.getBoundingClientRect();qaSamples.push({t:Math.round(performance.now()-start),toggleW:+a.width.toFixed(1),gap:+(rtl?a.left-b.right:b.left-a.right).toFixed(1)});
 if(performance.now()-start<1300)requestAnimationFrame(step)})();return true})()'''


def key(s, name, code, text=None, shift=False):
    for kind in ('keyDown', 'keyUp'):
        event = {'type': kind, 'key': name, 'code': name, 'windowsVirtualKeyCode': code, 'modifiers': 8 if shift else 0}
        if text and kind == 'keyDown': event['text'] = text
        s.c.call('Input.dispatchKeyEvent', event)
    time.sleep(.35)


def hash_to(s, route):
    s.js('(()=>{location.hash=' + json.dumps('#' + route) + ';return true})()'); time.sleep(1.4); s.away()


r = {'id': ID}
s = Session(HERE)
try:
    # Keyboard: Shift+Tab from the die reaches the folded toggle, Enter opens the search.
    s.open('projects', essais=[ID], viewport=D, block_globe=True)
    s.js('(()=>{document.querySelector(".dock-random-toggle").focus();return true})()')
    key(s, 'Tab', 9, shift=True)
    kb = {'focusOnToggle': s.js('document.activeElement===document.querySelector(".dock-search-toggle")'), 'focusVisible': s.js('document.querySelector(".dock-search-toggle").matches(":focus-visible")'),
          'outline': s.js('(()=>{const c=getComputedStyle(document.querySelector(".dock-search-toggle"));return c.outlineStyle+" "+c.outlineWidth+" "+c.outlineOffset})()')}
    key(s, 'Enter', 13, text='\r'); time.sleep(.6)
    kb['opened'] = s.js('document.querySelector(".dock-shell").dataset.searchOpen==="true"'); kb['focusInField'] = s.js('document.activeElement?.classList.contains("dock-search-input")')
    key(s, 'Escape', 27); time.sleep(.6)
    kb['closed'] = s.js('document.querySelector(".dock-shell").dataset.searchOpen==="false"'); kb['focusBack'] = s.js('document.activeElement===document.querySelector(".dock-search-toggle")')
    r['keyboard'] = kb; s.record('keyboard', kb)
    s.blur(); s.away()
    r['initial'] = s.js(STATE_JS)
    # Runtime language and theme through the account menu: the inserted icon survives.
    s.settings('ar', 'light'); r['runtimeAr'] = s.js(STATE_JS)
    s.settings('en', 'dark'); r['runtimeEnDark'] = s.js(STATE_JS)
    # Explorer keeps the capsule; content pages fold it again.
    hash_to(s, 'explore'); r['explorerAfterHash'] = s.js(STATE_JS)
    hash_to(s, 'people'); r['peopleAfterHash'] = s.js(STATE_JS)
    r['reducedMotion'] = r['peopleAfterHash']['transitions']
    for k in ('initial', 'runtimeAr', 'runtimeEnDark', 'explorerAfterHash', 'peopleAfterHash'):
        s.record(k, {x: r[k][x] for x in ('section', 'lang', 'dir', 'theme', 'toggle', 'die', 'name', 'labelDisplay', 'icons', 'iconDisplay')})
    r['errorsRuntime'] = s.errors()
    # Without reduced motion: sample the morph from Explorer to Projects, frame by frame.
    s.reduced(False)
    s.open('explore', essais=[ID], viewport=D, block_globe=True)
    s.js(SAMPLE_JS); hash_to(s, 'projects')
    samples = s.js('window.qaSamples')
    r['morph'] = {'frames': len(samples), 'minGap': min(x['gap'] for x in samples), 'maxGap': max(x['gap'] for x in samples),
                  'widths': [samples[0]['toggleW'], samples[-1]['toggleW']], 'samples': samples[::4], 'transitions': s.js(STATE_JS)['transitions']}
    s.record('morph', {k: r['morph'][k] for k in ('frames', 'minGap', 'maxGap', 'widths', 'transitions')})
    s.reduced(True)
    # RTL search from the folded toggle (mobile).
    s.open('projects', essais=[ID], lang='ar', viewport=M, block_globe=True)
    s.click('.dock-search-toggle'); s.wait('document.querySelector(".dock-shell")?.dataset.searchOpen==="true"', 5); time.sleep(.6)
    rtl = {'focusInField': s.js('document.activeElement?.classList.contains("dock-search-input")')}
    s.c.call('Input.insertText', {'text': 'Paris'}); s.wait('document.querySelectorAll(".dock-search-result").length>0', 8); time.sleep(.6)
    rtl['results'] = s.js('document.querySelectorAll(".dock-search-result").length'); rtl['status'] = s.js('document.querySelector(".dock-search-status")?.textContent||""')
    s.shot('apres-recherche-ouverte-ar-mobile')
    s.key('Escape'); time.sleep(.6)
    rtl['closed'] = s.js('document.querySelector(".dock-shell").dataset.searchOpen==="false"'); rtl['focusBack'] = s.js('document.activeElement===document.querySelector(".dock-search-toggle")')
    r['rtlSearch'] = rtl; s.record('rtl-search', rtl)
    r['errors'] = s.errors()
finally:
    s.close()

i, ar, en, ex, pe, kb, mo, rtl = r['initial'], r['runtimeAr'], r['runtimeEnDark'], r['explorerAfterHash'], r['peopleAfterHash'], r['keyboard'], r['morph'], r['rtlSearch']
folded = lambda g: g['toggle']['w'] == 44 and g['toggle']['h'] == 44 and g['icons'] == 1 and g['iconDisplay'] == 'block' and g['labelDisplay'] == 'none'
r['passed'] = bool(
    all(kb[k] for k in ('focusOnToggle', 'focusVisible', 'opened', 'focusInField', 'closed', 'focusBack'))
    and folded(i) and folded(ar) and folded(en) and folded(pe)
    and ar['dir'] == 'rtl' and ar['toggle']['x'] > ar['die']['x'] and i['toggle']['x'] < i['die']['x'] and ar['name'] != i['name'] and en['name'] not in (i['name'], ar['name']) and ar['title'] == ar['name'] and en['title'] == en['name']
    and en['theme'] == 'dark' and en['color'] == en['dieColor'] and en['bg'] == en['dieBg'] and en['border'] == en['dieBorder']
    and ex['section'] == 'explore' and ex['toggle']['w'] == 200 and ex['labelDisplay'] != 'none' and ex['iconDisplay'] == 'none'
    and all(v in ('0s', None) or set(v.replace(' ', '').split(',')) == {'0s'} for v in r['reducedMotion'].values())
    and mo['minGap'] >= 7.5 and mo['widths'][0] > 150 and mo['widths'][-1] == 44
    and rtl['focusInField'] and rtl['results'] > 0 and rtl['closed'] and rtl['focusBack']
    and not r['errors'] and not r['errorsRuntime'])
OUT.write_text(json.dumps(r, ensure_ascii=False, indent=1) + '\n')
print('passed', r['passed'], 'written', OUT)
