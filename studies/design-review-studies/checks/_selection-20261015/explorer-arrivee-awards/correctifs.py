"""Selection of 15 Oct 2026: dry run of the fixes proposed in the report, injected at run time into the page
(a <style> element appended to <head>); no file of essais/ or baseline/ is modified. REAL globe.
 - fix-bandes: globe-espace-libre bands with lisibilite-textes active (bottom band 196 px on desktop/tablet,
   181 px in narrow landscape at least 521 px tall); conditional on data-essais, so each trial alone is unchanged.
 - fix-statistiques: lisibilite-textes keeps its 13 px floor for the globe stats line only at 700 px and below
   (simulated here by restoring the baseline 14 px above 700 px).
Run: python3 -I checks/_selection-20261015/explorer-arrivee-awards/correctifs.py"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, ALL9, D, run, fresh, subset, save, png, clearance

RESULTS = HERE / 'results-correctifs.json'
G, LT = 'globe-espace-libre', 'lisibilite-textes'
FIX_BANDES = '''@media (min-width: 701px) and (min-height: 521px) {
  :root[data-essais~=lisibilite-textes] .app[data-navigation=dock] #main > .globe-stage { --essai-globe-bottom: 196px; }
}
@media (max-width: 700px) and (orientation: landscape) and (min-height: 521px) {
  :root[data-essais~=lisibilite-textes] .app[data-navigation=dock] #main > .globe-stage { --essai-globe-bottom: 181px; }
}'''
FIX_STATS = '''@media (min-width: 701px) { :root #app[data-navigation=dock] .globe-status p { font-size: 14px; } }'''
MEASURE = r'''(()=>{const g=window.horizonStudy?.globe?.getWorldScreenGeometry?.()||null;
 const box=sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect(),s=getComputedStyle(e);
  return {left:b.left,top:b.top,right:b.right,bottom:b.bottom,shown:s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0};};
 return {vw:innerWidth,vh:innerHeight,lang:document.documentElement.lang,active:document.documentElement.dataset.essais,geometry:g&&{center:g.center,radius:+g.radius.toFixed(2)},
  hg:getComputedStyle(document.getElementById('globe')).getPropertyValue('--hg-radius').trim(),statsFont:getComputedStyle(document.getElementById('globe-hint')).fontSize,
  filter:box('#scope-path'),stats:box('#globe-hint'),status:box('#about'),search:box('.dock-search-toggle'),dice:box('#random-campus'),errors:window.qaErrors||[]}})()'''


def inject(s, key, css):
    s.js('((id,css)=>{let e=document.getElementById(id);if(!e){e=document.createElement("style");e.id=id;document.head.append(e)}e.textContent=css;return true})(' + json.dumps(key) + ',' + json.dumps(css) + ')')


def remove(s, key):
    s.js('(id=>{document.getElementById(id)?.remove();return true})(' + json.dumps(key) + ')')


def relayout(s):
    time.sleep(.3); s.js('(()=>{window.horizonStudy.globe.refreshLayout({animate:false});return true})()'); time.sleep(.8)
    s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 25); time.sleep(.5)


def measure(s, label):
    d = s.js(MEASURE, 20)
    d['clearance'] = {k: clearance(d['geometry'], d[k]) for k in ('filter', 'stats', 'status', 'search', 'dice')}
    print(label, json.dumps({'r': d['geometry'] and d['geometry']['radius'], 'clear': d['clearance'], 'stats': d['statsFont'], 'active': d['active']}), flush=True)
    return d


def setlang(s, lang):
    s.js(f'(()=>{{window.horizonStudy.setLocale({json.dumps(lang)});return true}})()'); s.wait(f'document.documentElement.lang==={json.dumps(lang)}', 10); time.sleep(1.2)


def desktop(s):
    out = {}
    fresh(s, 'explore', ALL9, 'light', 'fr', D)
    s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(.8)
    inject(s, 'fix-bandes', FIX_BANDES); relayout(s)
    for vp in ((1440, 900), (1366, 768), (1280, 720), (1920, 1080)):
        if vp != (1440, 900):
            s.viewport(vp[0], vp[1], False); time.sleep(2); relayout(s)
        name = f'{vp[0]}x{vp[1]}'
        setlang(s, 'fr'); relayout(s); out[f'{name}-ALL9+fix-fr'] = measure(s, f'{name} ALL9+fix fr')
        setlang(s, 'ar'); relayout(s); out[f'{name}-ALL9+fix-ar'] = measure(s, f'{name} ALL9+fix ar')
        if name == '1440x900':
            png(s, 'correctif-1440x900-ALL9+fix-ar')
            # Each trial alone stays as it was: the rule needs lisibilite-textes in data-essais.
            subset(s, [G]); relayout(s); out[f'{name}-G+fix-ar'] = measure(s, f'{name} G+fix ar')
            subset(s, [G, LT]); relayout(s); out[f'{name}-G+L+fix-ar'] = measure(s, f'{name} G+L+fix ar')
            subset(s, ALL9); relayout(s)
            inject(s, 'fix-stats', FIX_STATS); relayout(s); out[f'{name}-ALL9+fix+stats-ar'] = measure(s, f'{name} ALL9+fix+stats ar')
            setlang(s, 'fr'); relayout(s); out[f'{name}-ALL9+fix+stats-fr'] = measure(s, f'{name} ALL9+fix+stats fr')
            remove(s, 'fix-stats'); relayout(s)
    out['errors'] = s.errors()
    return out


def narrow(s):
    out = {}
    fresh(s, 'explore', ALL9, 'light', 'fr', (680, 560, False))
    s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(.8)
    inject(s, 'fix-bandes', FIX_BANDES); relayout(s)
    out['680x560-ALL9+fix-fr'] = measure(s, '680x560 ALL9+fix fr')
    setlang(s, 'ar'); relayout(s); out['680x560-ALL9+fix-ar'] = measure(s, '680x560 ALL9+fix ar')
    subset(s, [G]); relayout(s); out['680x560-G+fix-ar'] = measure(s, '680x560 G+fix ar')
    subset(s, ALL9); relayout(s)
    out['errors'] = s.errors()
    return out


if __name__ == '__main__':
    save(RESULTS, 'desktop', run('correctif-desktop', desktop))
    save(RESULTS, 'narrow', run('correctif-narrow', narrow))
