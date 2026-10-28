"""Selection of 15 Oct 2026, risk 2 and the campus sheet: Explorer at country (France) and campus (42 Paris) levels,
REAL globe, 1440x900 light FR then Arabic, with the nine trials. Subsets in the same page (stylesheets switched off)
compare the globe labels and the campus sheet against each trial alone without WebGL noise between sessions.
Run: python3 -I checks/_selection-20261015/explorer-arrivee-awards/explorer_niveaux.py"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, ALL9, D, M, S, L, run, fresh, subset, save, png, strict_diff

RESULTS = HERE / 'results-explorer-niveaux.json'
G, P, LT, E, R = 'globe-espace-libre', 'police-etiquettes-globe', 'lisibilite-textes', 'echelle-unifiee', 'roles-couleur'
LEVEL = r'''(()=>{const stage=document.getElementById('globe');
 const box=sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect();return [+b.left.toFixed(1),+b.top.toFixed(1),+b.right.toFixed(1),+b.bottom.toFixed(1)]};
 const markers=[...document.querySelectorAll('#globe .hg-marker')].filter(m=>{const r=m.getBoundingClientRect(),s=getComputedStyle(m);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&+s.opacity>0&&r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight});
 const labels=markers.map(m=>{const l=m.querySelector('.hg-marker-label')||m;const s=getComputedStyle(l),r=m.getBoundingClientRect();
  return {text:l.textContent.trim(),family:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,color:s.color,compact:m.classList.contains('hg-compact'),selected:m.classList.contains('hg-selected'),
   clipped:l.scrollWidth>l.clientWidth+1,rect:[+r.left.toFixed(1),+r.top.toFixed(1),+r.right.toFixed(1),+r.bottom.toFixed(1)]}});
 const overlaps=[];for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i].rect,b=labels[j].rect;if(a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3])overlaps.push([labels[i].text,labels[j].text])}
 const hint=document.getElementById('globe-hint'),hs=getComputedStyle(hint);
 return {level:stage.dataset.level,lang:document.documentElement.lang,active:document.documentElement.dataset.essais,hint:hint.textContent,hintFont:hs.fontSize+' / '+hs.lineHeight,hintRect:box('#globe-hint'),
  filterRect:box('#scope-path'),labels,overlaps,overflow:document.documentElement.scrollWidth>innerWidth+1,errors:window.qaErrors||[]}})()'''
PROPS = ['fontSize', 'lineHeight', 'fontFamily', 'fontWeight', 'color', 'backgroundColor', 'borderTopColor', 'borderTopWidth', 'borderTopLeftRadius', 'boxShadow',
         'paddingTop', 'paddingLeft', 'marginTop', 'width', 'height', 'display', 'textDecorationLine']
SHEET = r'''(props=>{const d=document.querySelector('#dialog[open][data-kind=campus]');if(!d)return null;
 const els=[d,...d.querySelectorAll('*')];const r=d.getBoundingClientRect(),ds=getComputedStyle(d);
 const visible=e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return b.width>0&&b.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
 const styles=els.map(e=>{const s=getComputedStyle(e);return props.map(k=>s[k]).join('|')});
 const texts=[];for(const e of els){if(!visible(e))continue;const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!own)continue;
  const s=getComputedStyle(e);texts.push({tag:e.tagName.toLowerCase(),cls:e.className&&String(e.className).slice(0,60),text:e.textContent.trim().slice(0,40),size:parseFloat(s.fontSize),
   clipped:(s.overflow!=='visible'||s.textOverflow==='ellipsis')&&e.scrollWidth>e.clientWidth+1})}
 const buttons=[...d.querySelectorAll('button,a')].filter(visible).map(b=>{const q=b.getBoundingClientRect(),s=getComputedStyle(b);return {text:b.textContent.trim().slice(0,40),font:s.fontSize,
  size:[+q.width.toFixed(1),+q.height.toFixed(1)],clipped:b.scrollWidth>b.clientWidth+1,outside:q.right>r.right+.5||q.left<r.left-.5}});
 return {title:document.getElementById('dialog-title').textContent,rect:[+r.left.toFixed(1),+r.top.toFixed(1),+r.width.toFixed(1),+r.height.toFixed(1)],radius:ds.borderTopLeftRadius,shadow:ds.boxShadow,
  count:els.length,styles,minTextSize:texts.length?Math.min(...texts.map(t=>t.size)):null,smallTexts:texts.filter(t=>t.size<13),clippedTexts:texts.filter(t=>t.clipped),
  buttons,clippedButtons:buttons.filter(b=>b.clipped||b.outside),horizontalOverflow:d.scrollWidth>d.clientWidth+1}})'''


def compare(a, b):
    """Elements of the sheet whose listed computed properties differ, with the properties."""
    if not a or not b or len(a['styles']) != len(b['styles']): return {'comparable': False}
    diff = []
    for i, (x, y) in enumerate(zip(a['styles'], b['styles'])):
        if x != y:
            xs, ys = x.split('|'), y.split('|')
            diff.append({'index': i, 'props': {PROPS[k]: [xs[k], ys[k]] for k in range(len(PROPS)) if xs[k] != ys[k]}})
    return {'comparable': True, 'elementsDiffering': len(diff), 'first': diff[:6]}


def label_styles(level):
    return sorted({(l['family'], l['size'], l['weight'], l['line']) for l in level['labels']})


VIEWS = {'1440x900': (D, 'light', 'fr'), '390x844-sombre': (M, 'dark', 'fr'), '320x640-ar': (S, 'light', 'ar'), '667x375': (L, 'light', 'fr'), '1280x720': ((1280, 720, False), 'light', 'fr')}


def body(s, name='1440x900'):
    vp, theme, lang = VIEWS[name]; scale = 2 if vp[2] else 1
    out = {}
    fresh(s, 'explore', ALL9, theme, lang, vp)
    s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(.8)
    # Country level: France.
    s.js('(()=>{window.horizonStudy.globe.selectCountry("FRA");return true})()')
    s.wait('document.getElementById("globe").dataset.level==="country"', 25); time.sleep(3.5)
    pays = {'ALL9': s.js(LEVEL, 20)}; shots = {'ALL9': png(s, f'pays-{name}-ALL9')}
    for key, ids in (('G+P', [G, P]), ('P', [P]), ('socle', []), ('P+L+E', [P, LT, E])):
        subset(s, ids); time.sleep(.4); pays[key] = s.js(LEVEL, 20); shots[key] = png(s, f'pays-{name}-{key}' if key == 'G+P' else None)
    subset(s, ALL9); time.sleep(.4)
    # The label area, away from the filter, stats line and dock: the globe itself (y 200 .. 640).
    top = max(pays['ALL9']['hintRect'][3], pays['G+P']['hintRect'][3]) + 8
    bottom = s.js('Math.min(...[".dock-search-toggle","#random-campus",".dock-shell"].map(q=>document.querySelector(q)).filter(Boolean).map(e=>e.getBoundingClientRect().top).filter(v=>v>0))') - 8
    pays['labelBand'] = [0, top, vp[0], bottom - top]
    pays['diffLabels_ALL9_vs_G+P'] = strict_diff(shots['ALL9'], shots['G+P'], pays['labelBand'], scale)
    pays['diffPage_ALL9_vs_G+P'] = strict_diff(shots['ALL9'], shots['G+P'], None, scale)
    pays['labelStyles'] = {k: label_styles(v) for k, v in pays.items() if isinstance(v, dict) and 'labels' in v}
    out['pays'] = pays
    # Campus level: 42 Paris.
    s.js('(()=>{window.horizonStudy.globe.selectCampus("paris");return true})()')
    s.wait('document.getElementById("globe").dataset.level==="campus"', 30)
    # Language-agnostic: the hint leaves the country text and its pending form (ending with an ellipsis).
    country_hint = pays['ALL9']['hint']
    ready = s.wait('(()=>{const t=document.getElementById("globe-hint").textContent;return t!==' + json.dumps(country_hint) + '&&!t.includes("…")})()', 45); time.sleep(3)
    campus = {'ready': ready, 'ALL9': s.js(LEVEL, 20)}; png(s, f'campus-{name}-ALL9')
    for key, ids in (('G+P', [G, P]), ('socle', [])):
        subset(s, ids); time.sleep(.4); campus[key] = s.js(LEVEL, 20)
    subset(s, ALL9); time.sleep(.4)
    campus['labelStyles'] = {k: label_styles(v) for k, v in campus.items() if isinstance(v, dict) and 'labels' in v}
    out['campus'] = campus
    # Campus sheet.
    s.wait('(()=>{const t=document.querySelector("#globe .hg-target");return Boolean(t&&t.getBoundingClientRect().width)})()', 45); time.sleep(1)
    s.click('#globe .hg-target')
    s.wait('document.getElementById("dialog").open&&document.getElementById("dialog").dataset.kind==="campus"', 10)
    s.wait('(()=>{const i=document.querySelector("#dialog .campus-details-logo-image");return !i||i.complete})()', 10); time.sleep(1.2)
    sheet = {}; sshots = {}
    for key, ids in (('ALL9', ALL9), ('L', [LT]), ('socle', []), ('E', [E]), ('R', [R]), ('L+E', [LT, E]), ('G+P+L', [G, P, LT])):
        subset(s, ids); time.sleep(.4)
        sheet[key] = s.js(SHEET + '(' + json.dumps(PROPS) + ')', 20)
        sshots[key] = png(s, f'fiche-campus-{name}-{key}' if key in ('ALL9', 'L', 'socle') else None)
    subset(s, ALL9); time.sleep(.3)
    box = sheet['ALL9']['rect'] if sheet['ALL9'] else None
    sheet['compare'] = {'ALL9_vs_L': compare(sheet['ALL9'], sheet['L']), 'E_vs_socle': compare(sheet['E'], sheet['socle']), 'R_vs_socle': compare(sheet['R'], sheet['socle']),
                        'L+E_vs_L': compare(sheet['L+E'], sheet['L']), 'ALL9_vs_G+P+L': compare(sheet['ALL9'], sheet['G+P+L'])}
    sheet['pixels'] = {'ALL9_vs_L_sheet': strict_diff(sshots['ALL9'], sshots['L'], box, scale), 'ALL9_vs_socle_sheet': strict_diff(sshots['ALL9'], sshots['socle'], box, scale)}
    for key in list(sheet):
        if isinstance(sheet[key], dict) and 'styles' in sheet[key]: sheet[key].pop('styles')
    out['fiche'] = sheet
    if name != '1440x900':
        out['errors'] = s.errors(); return out
    # Arabic, same page: close the sheet, switch language, labels at campus level then the sheet again.
    s.key('Escape'); s.wait('!document.getElementById("dialog").open', 5)
    s.js('(()=>{window.horizonStudy.setLocale("ar");return true})()'); s.wait('document.documentElement.lang==="ar"', 10); time.sleep(2.5)
    ar = {'ALL9': s.js(LEVEL, 20)}; png(s, 'campus-1440x900-ALL9-ar')
    subset(s, [G, P]); time.sleep(.4); ar['G+P'] = s.js(LEVEL, 20); subset(s, ALL9); time.sleep(.4)
    ar['labelStyles'] = {k: label_styles(v) for k, v in ar.items() if isinstance(v, dict) and 'labels' in v}
    s.wait('(()=>{const t=document.querySelector("#globe .hg-target");return Boolean(t&&t.getBoundingClientRect().width)})()', 30); time.sleep(.8)
    s.click('#globe .hg-target')
    if s.wait('document.getElementById("dialog").open&&document.getElementById("dialog").dataset.kind==="campus"', 10):
        time.sleep(1.2); ar['fiche'] = s.js(SHEET + '(' + json.dumps(PROPS) + ')', 20); png(s, 'fiche-campus-1440x900-ALL9-ar')
        if ar['fiche']: ar['fiche'].pop('styles')
    out['ar'] = ar
    out['errors'] = s.errors()
    return out


def report(name, result):
    p, c, f = result['pays'], result['campus'], result['fiche']
    print(json.dumps({'paysLabels': p['labelStyles'], 'diffLabels': p['diffLabels_ALL9_vs_G+P'], 'overlapsPays': [p['ALL9']['overlaps'], p['G+P']['overlaps']],
                      'campusReady': c['ready'], 'campusLabels': c['labelStyles'], 'ficheCompare': f['compare'], 'fichePixels': f['pixels'],
                      'ficheALL9': {k: f['ALL9'][k] for k in ('title', 'radius', 'minTextSize', 'smallTexts', 'clippedTexts', 'clippedButtons', 'horizontalOverflow')},
                      'ar': result.get('ar') and {'labels': result['ar']['labelStyles'], 'fiche': result['ar'].get('fiche') and {k: result['ar']['fiche'][k] for k in ('title', 'minTextSize', 'clippedTexts', 'clippedButtons', 'horizontalOverflow')}},
                      'errors': result['errors']}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    for name in sys.argv[1:] or ['1440x900']:
        result = run('niveaux-' + name, lambda s: body(s, name))
        save(RESULTS, name, result); report(name, result)
