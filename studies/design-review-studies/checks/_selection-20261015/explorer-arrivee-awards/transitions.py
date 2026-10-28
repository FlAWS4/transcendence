"""Selection of 15 Oct 2026: Explorer transitions with the nine trials and the REAL globe (1440x900).
World disc -> Projects (globe docked into the filter medallion, whose pill echelle-unifiee resizes) -> back to
Explorer -> language and theme switched through the account settings (AR dark) without reloading.
Run: python3 -I checks/_selection-20261015/explorer-arrivee-awards/transitions.py"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, ALL9, D, run, fresh, subset, save, png, clearance

RESULTS = HERE / 'results-transitions.json'
WORLD = r'''(()=>{const g=window.horizonStudy?.globe?.getWorldScreenGeometry?.()||null;
 const box=sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect(),s=getComputedStyle(e);
  return {left:b.left,top:b.top,right:b.right,bottom:b.bottom,shown:s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0};};
 const fam=[...new Set([...document.querySelectorAll('#globe .hg-marker-label')].map(l=>getComputedStyle(l).fontFamily))];
 return {lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,section:document.getElementById('app').dataset.section,
  geometry:g&&{center:g.center,radius:+g.radius.toFixed(2)},filter:box('#scope-path'),stats:box('#globe-hint'),status:box('#about'),search:box('.dock-search-toggle'),dice:box('#random-campus'),
  labelFamilies:fam,aboutFont:getComputedStyle(document.getElementById('about')).fontSize,overflow:document.documentElement.scrollWidth>innerWidth+1,errors:window.qaErrors||[]}})()'''
DOCK = r'''(()=>{const st=document.getElementById("globe"),m=document.getElementById("scope-medallion").getBoundingClientRect();
 const v=k=>parseFloat(st.style.getPropertyValue(k));
 return {docked:document.getElementById("app").dataset.globeDocked,section:document.getElementById("app").dataset.section,scale:v("--dock-scale"),clip:v("--dock-clip-radius"),
  ox:v("--dock-origin-x"),oy:v("--dock-origin-y"),tx:v("--dock-translate-x"),ty:v("--dock-translate-y"),left:st.offsetLeft,top:st.offsetTop,
  medallion:{x:m.left+m.width/2,y:m.top+m.height/2,r:m.width/2},picker:getComputedStyle(document.getElementById("scope-picker")).fontSize}})()'''


def world(s, label):
    s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(1)
    d = s.js(WORLD, 20); d['clearance'] = {k: clearance(d['geometry'], d[k]) for k in ('filter', 'stats', 'status', 'search', 'dice')}
    print(label, json.dumps({'r': d['geometry'] and d['geometry']['radius'], 'clear': d['clearance'], 'labels': d['labelFamilies'], 'lang': d['lang'], 'theme': d['theme']}, ensure_ascii=False), flush=True)
    return d


def body(s):
    out = {}
    fresh(s, 'explore', ALL9, 'light', 'fr', D)
    out['monde'] = world(s, 'monde')
    s.click('#main-nav button[data-section=projects]'); time.sleep(2.8)
    dock = s.js(DOCK)
    dock['dockedRadius'] = round(dock['clip'] * dock['scale'], 2)
    centre = [dock['left'] + dock['ox'] + dock['tx'], dock['top'] + dock['oy'] + dock['ty']]
    dock['offsetFromMedallion'] = [round(centre[0] - dock['medallion']['x'], 2), round(centre[1] - dock['medallion']['y'], 2)]
    out['medaillon'] = dock; png(s, 'transition-medaillon-1440x900-ALL9')
    # Same page, echelle-unifiee off: the medallion seat moves with the pill; the docked globe must follow.
    subset(s, [i for i in ALL9 if i != 'echelle-unifiee']); time.sleep(.6)
    s.js('(()=>{window.horizonStudy.globe.refreshLayout({animate:false});return true})()'); time.sleep(1.5)
    d2 = s.js(DOCK); d2['dockedRadius'] = round(d2['clip'] * d2['scale'], 2)
    c2 = [d2['left'] + d2['ox'] + d2['tx'], d2['top'] + d2['oy'] + d2['ty']]
    d2['offsetFromMedallion'] = [round(c2[0] - d2['medallion']['x'], 2), round(c2[1] - d2['medallion']['y'], 2)]
    out['medaillon-sans-E'] = d2
    subset(s, ALL9); time.sleep(.6)
    s.js('(()=>{window.horizonStudy.globe.refreshLayout({animate:false});return true})()'); time.sleep(1.5)
    print('medaillon', json.dumps({k: (out[k]['docked'], out[k]['dockedRadius'], out[k]['offsetFromMedallion'], out[k]['picker']) for k in ('medaillon', 'medaillon-sans-E')}), flush=True)
    s.click('#main-nav button[data-section=explore]'); time.sleep(2.5)
    out['retour'] = world(s, 'retour-explorer')
    s.settings('ar', 'dark')
    s.wait('document.documentElement.lang==="ar"&&document.documentElement.dataset.theme==="dark"', 10); time.sleep(1.5)
    out['ar-sombre'] = world(s, 'ar-sombre-sans-rechargement'); png(s, 'transition-ar-sombre-1440x900-ALL9')
    out['errors'] = s.errors()
    return out


if __name__ == '__main__':
    save(RESULTS, '1440x900', run('transitions', body))
