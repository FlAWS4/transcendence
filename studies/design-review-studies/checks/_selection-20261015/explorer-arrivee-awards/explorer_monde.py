"""Selection of 15 Oct 2026, risks 1 and 2: Explorer world level with the REAL globe and the nine trials.
One page per viewport (fresh Chrome each time): the nine together are measured as loaded, then subsets are
obtained in the same page by switching trial stylesheets off (see commun.subset) and asking the globe to
re-read its layout (horizonStudy.globe.refreshLayout), which gives the baseline, each trial alone and pairs
against the same globe. One fresh page with globe-espace-libre alone checks that the toggled subset matches.
Run: python3 -I checks/_selection-20261015/explorer-arrivee-awards/explorer_monde.py [name ...]"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, ALL9, D, M, S, L, run, fresh, subset, save, load, png, clearance

RESULTS = HERE / 'results-explorer-monde.json'
G, P, LT, E = 'globe-espace-libre', 'police-etiquettes-globe', 'lisibilite-textes', 'echelle-unifiee'
VIEWS = {
    '1440x900': (D, 'light', 'fr', ['ar', 'en']),
    '1366x768': ((1366, 768, False), 'light', 'fr', ['ar']),
    '1280x720': ((1280, 720, False), 'light', 'fr', ['ar']),
    '1920x1080': ((1920, 1080, False), 'light', 'fr', ['ar']),
    '667x375': (L, 'light', 'fr', ['ar']),
    '390x844-sombre': (M, 'dark', 'fr', []),
    '320x640-ar': (S, 'light', 'ar', []),
    # Two more layouts of globe-espace-libre's bands: narrow landscape at least 521 px tall, wide short landscape.
    '680x560': ((680, 560, False), 'light', 'fr', ['ar']),
    '844x390': ((844, 390, True), 'light', 'fr', ['ar']),
}
SUBSETS = {'socle': [], 'G': [G], 'L': [LT], 'E': [E], 'G+L': [G, LT], 'G+E': [G, E], 'G+L+E': [G, LT, E], 'G+P': [G, P]}
SHOTS = {'1440x900', '667x375', '1366x768'}
MEASURE = r'''(()=>{
 const g=window.horizonStudy?.globe?.getWorldScreenGeometry?.()||null;
 const box=sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect(),s=getComputedStyle(e);
  return {left:+b.left.toFixed(2),top:+b.top.toFixed(2),right:+b.right.toFixed(2),bottom:+b.bottom.toFixed(2),shown:s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0};};
 const font=sel=>{const e=document.querySelector(sel);if(!e)return null;const s=getComputedStyle(e);return [s.fontSize,s.lineHeight,s.fontWeight,s.fontFamily].join(' / ')};
 const clipped=sel=>{const e=document.querySelector(sel);return e&&e.getClientRects().length?e.scrollWidth>e.clientWidth+1:null};
 const stage=document.getElementById('globe');
 const markers=[...document.querySelectorAll('#globe .hg-marker')].filter(m=>{const r=m.getBoundingClientRect(),s=getComputedStyle(m);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&+s.opacity>0&&r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight});
 const labels=markers.map(m=>{const l=m.querySelector('.hg-marker-label');const s=getComputedStyle(l||m),ms=getComputedStyle(m),r=m.getBoundingClientRect();
  return {text:(l||m).textContent.trim(),family:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,markerSize:ms.fontSize,compact:m.classList.contains('hg-compact'),
   clipped:l?l.scrollWidth>l.clientWidth+1:false,rect:[+r.left.toFixed(1),+r.top.toFixed(1),+r.right.toFixed(1),+r.bottom.toFixed(1)]}});
 return {vw:innerWidth,vh:innerHeight,lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,active:document.documentElement.dataset.essais,
  sheets:[...document.querySelectorAll('link[data-essai]')].filter(l=>!l.disabled).map(l=>l.dataset.essai),
  geometry:g&&{center:{x:+g.center.x.toFixed(2),y:+g.center.y.toFixed(2)},radius:+g.radius.toFixed(2)},hgRadius:getComputedStyle(stage).getPropertyValue('--hg-radius').trim(),level:stage.dataset.level||null,
  filter:box('#scope-path'),stats:box('#globe-hint'),status:box('#about'),search:box('.dock-search-toggle'),dice:box('#random-campus'),
  fonts:{stats:font('#globe-hint'),status:font('#about'),picker:font('#scope-picker'),search:font('.dock-search-toggle'),marker:font('#globe .hg-marker')},
  clipped:{searchLabel:clipped('.dock-search-toggle-label'),pickerLabel:clipped('#scope-picker>span'),status:clipped('#about')},
  hint:document.getElementById('globe-hint').textContent,labels,overflow:document.documentElement.scrollWidth>innerWidth+1,errors:window.qaErrors||[]};
})()'''
KEYS = ('filter', 'stats', 'status', 'search', 'dice')


def geometry(s, seconds=25):
    s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', seconds); time.sleep(.6)


def measure(s, label):
    data = s.js(MEASURE, 20)
    data['clearance'] = {k: clearance(data['geometry'], data[k]) for k in KEYS}
    g = data['geometry']
    data['centerOffset'] = g and [round(g['center']['x'] - data['vw'] / 2, 2), round(g['center']['y'] - data['vh'] / 2, 2)]
    print(label, json.dumps({'r': g and g['radius'], 'clear': data['clearance'], 'fonts': data['fonts']['stats'] + ' | ' + data['fonts']['status'], 'labels': len(data['labels'])}, ensure_ascii=False), flush=True)
    return data


def relayout(s):
    s.js('(()=>{window.horizonStudy.globe.refreshLayout({animate:false});return true})()'); time.sleep(.8); geometry(s)


def view(name):
    vp, theme, lang, extra = VIEWS[name]
    out = {'viewport': vp, 'theme': theme, 'lang': lang}

    def body(s):
        fresh(s, 'explore', ALL9, theme, lang, vp)
        geometry(s, 40)
        out['ALL9'] = measure(s, f'{name} ALL9')
        if name in SHOTS: png(s, f'monde-{name}-ALL9')
        for key, ids in SUBSETS.items():
            subset(s, ids); relayout(s)
            out[key] = measure(s, f'{name} {key}')
            if name in SHOTS and key in ('socle', 'G'): png(s, f'monde-{name}-{key}')
        subset(s, ALL9); relayout(s)
        out['ALL9-retour'] = measure(s, f'{name} ALL9-retour')
        for other in extra:
            s.js(f'(()=>{{window.horizonStudy.setLocale({json.dumps(other)});return true}})()')
            s.wait(f'document.documentElement.lang==={json.dumps(other)}', 10); time.sleep(1.5); relayout(s)
            out[f'ALL9-{other}'] = measure(s, f'{name} ALL9-{other}')
            png(s, f'monde-{name}-ALL9-{other}')
            for key in ('socle', 'G', 'G+L', 'G+E', 'G+L+E'):
                subset(s, SUBSETS[key]); relayout(s)
                out[f'{key}-{other}'] = measure(s, f'{name} {key}-{other}')
                if key == 'G': png(s, f'monde-{name}-G-{other}')
            subset(s, ALL9); relayout(s)
        out['errors'] = s.errors()
        if name == '1440x900':
            # Control: a fresh page with globe-espace-libre alone must give the toggled 'G' disc.
            fresh(s, 'explore', [G], theme, lang, vp); geometry(s, 40)
            out['G-chargement-direct'] = measure(s, f'{name} G direct')
            out['errorsDirect'] = s.errors()
    run(name, body)
    save(RESULTS, name, out)


if __name__ == '__main__':
    for name in sys.argv[1:] or list(VIEWS):
        print('==', name, flush=True); view(name)
