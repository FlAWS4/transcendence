"""Integration pass, problem 2: scope of lisibilite-textes in Explorer after its fix (same method as the scope stage of
checks/lisibilite-textes/check.py: same DOM, trial sheet off then on). Expected: sizes only go up, never above 14 px,
colours only #008E90 -> #0C7677 (light) / #ED3491 -> #F485BD (dark); the stats line keeps 14 px above 700 px.
World level with the globe blocked at five sizes, then World, Country (France) and Campus (42 Paris) with the REAL globe.
python3 -I checks/_selection-20261015/integration/perimetre_lisibilite.py"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, LT, D, M, L, fresh, run, save, globe_wait

RESULTS = HERE / 'results-perimetre-lisibilite.json'
TOGGLE = '(()=>{for(const l of document.querySelectorAll("link[data-essai]"))l.disabled=%s;return true})()'
SNAP_JS = r"""(()=>[...document.body.querySelectorAll('*')].filter(e=>e.getClientRects().length).map(e=>{let own='';for(const n of e.childNodes)if(n.nodeType===3)own+=n.textContent;
 const s=getComputedStyle(e);return[e.tagName+(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.split(' ')[0]:''),own.replace(/\s+/g,' ').trim().slice(0,24),parseFloat(s.fontSize),s.color,e.closest('svg')!==null]}))()"""
HINT_JS = '(()=>{const e=document.getElementById("globe-hint"),s=getComputedStyle(e);return {text:e.textContent,size:s.fontSize,level:document.getElementById("globe").dataset.level||null}})()'
SWAPS = {'light': {'rgb(0, 142, 144)': 'rgb(12, 118, 119)'}, 'dark': {'rgb(237, 52, 145)': 'rgb(244, 133, 189)'}}
BLOCKED = [('1440x900-fr', D, 'light', 'fr'), ('1440x900-ar-sombre', D, 'dark', 'ar'), ('390x844-fr', M, 'light', 'fr'),
           ('667x375-ar', L, 'light', 'ar'), ('844x390-fr', (844, 390, True), 'light', 'fr')]
REAL = [('monde', 'explore'), ('pays-france', 'explore?country=FRA'), ('campus-paris', 'explore?country=FRA&campus=paris')]


def compare(s, theme):
    s.js(TOGGLE % 'true'); time.sleep(.5); a = s.js(SNAP_JS, 30)
    off_hint = s.js(HINT_JS)
    s.js(TOGGLE % 'false'); time.sleep(.5); b = s.js(SNAP_JS, 30)
    on_hint = s.js(HINT_JS)
    same = len(a) == len(b) and all(x[:2] == y[:2] for x, y in zip(a, b))
    sizes = [(x[0], x[1], x[2], y[2]) for x, y in zip(a, b) if x[2] != y[2] and not x[4]]
    colours = [(x[0], x[3], y[3]) for x, y in zip(a, b) if x[3] != y[3]]
    return {'sameDom': same, 'elements': len(a), 'sizeChanges': sizes, 'sizeDecreases': [c for c in sizes if c[3] < c[2]],
            'sizeAbove14': [c for c in sizes if c[3] > 14], 'unexpectedColours': [c for c in colours if SWAPS[theme].get(c[1]) != c[2]],
            'hint': {'socle': off_hint, 'L': on_hint}, 'overflow': s.overflow(), 'errors': s.errors()}


def blocked():
    out = {}

    def body(s):
        for name, vp, theme, lang in BLOCKED:
            fresh(s, 'explore', [LT], theme, lang, vp, block_globe=True)
            out[name] = compare(s, theme)
            r = out[name]; print(name, json.dumps({'same': r['sameDom'], 'n': r['elements'], 'changes': [c[:2] + c[2:] for c in r['sizeChanges']],
                                                    'down': len(r['sizeDecreases']), 'col': len(r['unexpectedColours']), 'hint': r['hint']}, ensure_ascii=False), flush=True)
        return out
    save(RESULTS, 'globe-bloque', run('blocked', body))


def real():
    out = {}

    def body(s):
        for name, route in REAL:
            fresh(s, route, [LT], 'light', 'fr', D); globe_wait(s, 40)
            if name != 'monde': s.wait('document.getElementById("globe").dataset.level!=="world"', 25); time.sleep(4)
            out[name] = compare(s, 'light')
            r = out[name]; print(name, json.dumps({'same': r['sameDom'], 'n': r['elements'], 'changes': len(r['sizeChanges']), 'down': r['sizeDecreases'],
                                                    'col': len(r['unexpectedColours']), 'hint': r['hint']}, ensure_ascii=False), flush=True)
        return out
    save(RESULTS, 'vrai-globe', run('real', body))


if __name__ == '__main__':
    blocked(); real()
