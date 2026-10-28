"""Selection of 15 Oct 2026, risk 5: the 42 Awards page with the nine trials, the header fade and the dock.
Globe blocked, as in the trial's own checks (the page hides the globe). Subsets in the same page: stylesheets are
switched off, and the note added by awards-a-venir's essai.mjs is hidden when that trial is not in the subset.
Run: python3 -I checks/_selection-20261015/explorer-arrivee-awards/awards.py [view ...]"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, ALL9, D, M, S, L, run, fresh, subset, save, png, strict_diff

RESULTS = HERE / 'results-awards.json'
A, LT, E = 'awards-a-venir', 'lisibilite-textes', 'echelle-unifiee'
VIEWS = {
    '1440x900-clair': (D, 'light', 'fr'),
    '390x844-sombre': (M, 'dark', 'fr'),
    '320x640-ar-clair': (S, 'light', 'ar'),
    '667x375-clair': (L, 'light', 'fr'),
    '1440x900-en-sombre': (D, 'dark', 'en'),
}
SUBSETS = {'socle': [], 'A': [A], 'A+E': [A, E], 'A+L': [A, LT], 'A+L+E': [A, LT, E]}
PROBE = r'''(()=>{const app=document.getElementById('app'),n=document.querySelector('.essai-awards-a-venir'),p=n&&n.querySelector('p'),i=n&&n.querySelector('svg');
 const R=e=>{if(!e)return null;const r=e.getBoundingClientRect();return r.width||r.height?{x:+r.x.toFixed(2),y:+r.y.toFixed(2),w:+r.width.toFixed(2),h:+r.height.toFixed(2)}:null};
 const cs=n&&getComputedStyle(n),ps=p&&getComputedStyle(p),as=getComputedStyle(app);
 const dock=document.querySelector('.dock-shell'),header=document.querySelector('.header');
 const navLabels=[...document.querySelectorAll('#main-nav > button[data-section]')].map(b=>{const t=b.querySelector('span[data-copy]')||b;const s=getComputedStyle(t);
  return {section:b.dataset.section,text:t.textContent.trim(),size:s.fontSize,shown:s.display!=='none'&&s.visibility!=='hidden'&&t.getClientRects().length>0,clipped:t.scrollWidth>t.clientWidth+1}});
 return {section:app.dataset.section,lang:document.documentElement.lang,dir:document.documentElement.dir,theme:document.documentElement.dataset.theme,active:document.documentElement.dataset.essais,
  display:cs?cs.display:null,note:R(n),p:R(p),icon:R(i),text:p?p.textContent:null,pLang:p?p.lang:null,pDir:p?p.dir:null,
  font:ps?[ps.fontSize,ps.lineHeight,ps.fontWeight,ps.color].join(' / '):null,iconColor:i?getComputedStyle(i).color:null,
  lines:p&&ps&&p.getClientRects().length?Math.round(p.getBoundingClientRect().height/parseFloat(ps.lineHeight)):null,clipped:p&&p.getClientRects().length?p.scrollWidth>p.clientWidth+1:null,
  fadeEnd:parseFloat(as.getPropertyValue('--header-fade-end')),dock:R(dock),header:R(header),brand:R(document.querySelector('.header .brand')),account:R(document.getElementById('profile')),
  wordmark:document.getElementById('brand-wordmark')?.dataset.wordmarkText||null,navLabels,
  overflow:document.documentElement.scrollWidth>innerWidth+1,errors:window.qaErrors||[]}})()'''


def awards_subset(s, ids):
    subset(s, ids)
    # Without its stylesheet the trial's note would show unstyled: hide it, as in the baseline (no note at all).
    s.js('(on=>{const n=document.querySelector(".essai-awards-a-venir");if(n)n.style.display=on?"":"none";return true})(' + json.dumps(A in ids) + ')')
    time.sleep(.3)


def geometry(d):
    """Gaps of the note's visible content (icon + sentence) to the end of the header fade and to the dock."""
    if not d['icon'] or not d['p']: return None
    top, bottom = d['icon']['y'], d['p']['y'] + d['p']['h']
    left, right = min(d['icon']['x'], d['p']['x']), max(d['icon']['x'] + d['icon']['w'], d['p']['x'] + d['p']['w'])
    vw, vh = d['vw'], d['vh']
    return {'belowFadeEnd': round(top - d['fadeEnd'], 2), 'aboveDock': round(d['dock']['y'] - bottom, 2),
            'centreOffset': [round((left + right) / 2 - vw / 2, 2), round((top + bottom) / 2 - vh / 2, 2)]}


def view(name):
    vp, theme, lang = VIEWS[name]; scale = 2 if vp[2] else 1
    out = {'viewport': vp, 'theme': theme, 'lang': lang}

    def body(s):
        fresh(s, 'awards', ALL9, theme, lang, vp, block_globe=True, settle=1.5)
        shots = {}
        for key, ids in [('ALL9', ALL9)] + list(SUBSETS.items()):
            awards_subset(s, ids)
            d = s.js(PROBE); d['vw'], d['vh'] = vp[0], vp[1]; d['gaps'] = geometry(d)
            shots[key] = png(s, f'awards-{name}-{key}' if key in ('ALL9', 'socle', 'A') else None)
            out[key] = d
        awards_subset(s, ALL9)
        a = out['ALL9']; box = None
        if a['icon'] and a['p']:
            x0 = min(a['icon']['x'], a['p']['x']) - 4; y0 = a['icon']['y'] - 4
            x1 = max(a['icon']['x'] + a['icon']['w'], a['p']['x'] + a['p']['w']) + 4; y1 = a['p']['y'] + a['p']['h'] + 4
            box = [x0, y0, x1 - x0, y1 - y0]
        hb = a['header']; db = a['dock']
        header_band = [0, 0, vp[0], hb['y'] + hb['h']] if hb else None
        dock_band = [0, db['y'] - 8, vp[0], db['h'] + 16] if db else None
        out['diffs'] = {
            'ALL9_vs_A_page': strict_diff(shots['ALL9'], shots['A'], None, scale),
            'ALL9_vs_A_note': strict_diff(shots['ALL9'], shots['A'], box, scale) if box else None,
            'ALL9_vs_socle_page': strict_diff(shots['ALL9'], shots['socle'], None, scale),
            'ALL9_vs_socle_header': strict_diff(shots['ALL9'], shots['socle'], header_band, scale) if header_band else None,
            'ALL9_vs_socle_dock': strict_diff(shots['ALL9'], shots['socle'], dock_band, scale) if dock_band else None,
            'A_vs_socle_page': strict_diff(shots['A'], shots['socle'], None, scale),
            'noteBox': box,
        }
        out['errors'] = s.errors()
    run(name, body)
    save(RESULTS, name, out)
    a = out['ALL9']
    print(name, json.dumps({'text': a['text'], 'font': a['font'], 'lines': a['lines'], 'clipped': a['clipped'], 'gaps': a['gaps'], 'gapsA': out['A']['gaps'],
                            'diffs': {k: v for k, v in out['diffs'].items() if k != 'noteBox'}, 'errors': out['errors']}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    for name in sys.argv[1:] or list(VIEWS):
        print('==', name, flush=True); view(name)
