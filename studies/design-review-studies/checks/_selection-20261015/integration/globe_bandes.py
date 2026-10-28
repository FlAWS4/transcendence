"""Integration pass, problems 1 to 3 (globe-espace-libre with lisibilite-textes), REAL globe, direct loads only.
Each trial set is loaded fresh (new tab) in Arabic, then measured again in French and English without reloading
(setLocale + refreshLayout). The stats/status fonts are also read with the globe blocked for the baseline and
lisibilite-textes alone. Run before the fixes with 'avant', after them with 'apres':
  python3 -I checks/_selection-20261015/integration/globe_bandes.py avant [view ...]
  python3 -I checks/_selection-20261015/integration/globe_bandes.py apres [view ...]"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, ALL9, G, LT, E, D, M, L, label, fresh, run, save, globe_wait, relayout, setlang, globe_measure, png

PHASE = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] in ('avant', 'apres') else 'avant'
RESULTS = HERE / f'results-globe-{PHASE}.json'
# view: (viewport, trial sets loaded fresh, languages measured after the Arabic load, extra sizes reached by resizing)
VIEWS = {
    '1440x900': (D, [[G], [G, LT], [G, E]] + ([ALL9] if PHASE == 'apres' else []), ['fr', 'en'],
                 [(1366, 768), (1280, 720), (1920, 1080), (768, 1024)] if PHASE == 'apres' else []),
    '680x560': ((680, 560, False), [[G], [G, LT]] + ([ALL9] if PHASE == 'apres' else []), ['fr', 'en'], []),
    '667x375': (L, [[G], [G, LT]] + ([ALL9] if PHASE == 'apres' else []), ['fr', 'en'], []),
    '844x390': ((844, 390, True), [[G], [G, LT]] + ([ALL9] if PHASE == 'apres' else []), ['fr'], []),
    # Narrow short landscape where the disc is not held at MapLibre's minimum zoom (the top band binds).
    '700x500': ((700, 500, False), [[G], [G, LT]] + ([ALL9] if PHASE == 'apres' else []), ['fr', 'en'], []),
    # Desktop short window, not held at the minimum zoom: lisibilite-textes must leave its bands alone.
    '1280x500': ((1280, 500, False), [[G], [G, LT]] + ([ALL9] if PHASE == 'apres' else []), ['fr'], []),
    '390x844': (M, [[G], ALL9], ['fr'], []),
    # Portrait phone (globe-espace-libre inactive): the copy's disc already covers the status line in Arabic.
    '320x640': ((320, 640, True), [[], [LT], ALL9], ['fr'], []),
}
DEFAULT = ['1440x900', '680x560', '667x375', '700x500'] + (['844x390', '1280x500', '390x844'] if PHASE == 'apres' else [])
FONT_VIEWS = {'1440x900': D, '390x844': M, '667x375': L, '680x560': (680, 560, False), '844x390': (844, 390, True), '700x500': (700, 500, False), '1280x500': (1280, 500, False)}
FONT_JS = '''(()=>{const f=s=>{const e=document.querySelector(s);if(!e)return null;const c=getComputedStyle(e);return c.fontSize+' / '+c.lineHeight};
 return {stats:f('#globe-hint'),status:f('#about'),overflow:document.documentElement.scrollWidth>innerWidth+1,errors:window.qaErrors||[]}})()'''


def view(name):
    vp, sets, langs, sizes = VIEWS[name]
    out = {'viewport': vp, 'phase': PHASE}

    def body(s):
        for ids in sets:
            key = label(ids)
            fresh(s, 'explore', ids, 'light', 'ar', vp); globe_wait(s, 40); relayout(s)
            out[f'{key}-ar'] = globe_measure(s, f'{name} {key} ar')
            if name in ('1440x900', '680x560', '667x375') and ids in ([G], [G, LT]) or (PHASE == 'apres' and ids == ALL9 and name in ('1440x900', '667x375')) or name == '320x640':
                png(s, f'{PHASE}-globe-{name}-{key}-ar')
            for lang in langs:
                setlang(s, lang); relayout(s)
                out[f'{key}-{lang}'] = globe_measure(s, f'{name} {key} {lang}')
            for w, h in sizes:
                for lang in ('ar', 'fr'):
                    s.viewport(w, h, False); time.sleep(2); setlang(s, lang); relayout(s)
                    out[f'{w}x{h}-{key}-{lang}'] = globe_measure(s, f'{w}x{h} {key} {lang}')
            out[f'{key}-errors'] = s.errors()
        return out
    run(name, body)
    save(RESULTS, name, out)


def fonts():
    out = {}

    def body(s):
        for name, vp in FONT_VIEWS.items():
            for ids in ([], [LT], [G, LT]):
                fresh(s, 'explore', ids, 'light', 'fr', vp, block_globe=True)
                out[f'{name}-{label(ids)}'] = s.js(FONT_JS)
                print(name, label(ids), out[f'{name}-{label(ids)}'], flush=True)
        return out
    save(RESULTS, 'polices', run('fonts', body))


if __name__ == '__main__':
    names = [a for a in sys.argv[2:] if a in VIEWS] or DEFAULT
    if 'polices' in sys.argv[2:] or not sys.argv[2:]: fonts()
    for name in names:
        print('==', name, flush=True); view(name)
