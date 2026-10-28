"""Integration pass, after the fixes: the two journeys that read the fitted globe, with the nine trials and the REAL globe
(1440x900): arrival index.html -> Visiter -> world reveal; then World -> Projects (globe docked into the filter medallion)
-> back to Explorer -> Arabic dark through the account settings, without reloading. Method of the first checker's
transitions.py and arrivee.py (revelation).
python3 -I checks/_selection-20261015/integration/parcours_globe.py"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, ALL9, D, fresh, run, save, globe_wait, globe_measure, png

RESULTS = HERE / 'results-parcours-globe.json'
DOCK = r'''(()=>{const st=document.getElementById("globe"),m=document.getElementById("scope-medallion").getBoundingClientRect();
 const v=k=>parseFloat(st.style.getPropertyValue(k));
 return {docked:document.getElementById("app").dataset.globeDocked,section:document.getElementById("app").dataset.section,scale:v("--dock-scale"),clip:v("--dock-clip-radius"),
  ox:v("--dock-origin-x"),oy:v("--dock-origin-y"),tx:v("--dock-translate-x"),ty:v("--dock-translate-y"),left:st.offsetLeft,top:st.offsetTop,
  medallion:{x:m.left+m.width/2,y:m.top+m.height/2,r:m.width/2},errors:window.qaErrors||[]}})()'''


def body(s):
    out = {}
    fresh(s, '', ALL9, 'light', 'fr', D, page='index.html', settle=1.5)
    s.click('#entry-guest')
    out['revelationTerminee'] = s.wait('document.body.dataset.entry==="welcome"', 90)
    globe_wait(s, 40); time.sleep(1.5)
    out['revelation'] = globe_measure(s, 'revelation'); png(s, 'parcours-revelation-1440x900-neuf')
    fresh(s, 'explore', ALL9, 'light', 'fr', D); globe_wait(s, 40)
    out['monde'] = globe_measure(s, 'monde')
    s.click('#main-nav button[data-section=projects]'); time.sleep(2.8)
    d = s.js(DOCK); d['dockedRadius'] = round(d['clip'] * d['scale'], 2)
    centre = [d['left'] + d['ox'] + d['tx'], d['top'] + d['oy'] + d['ty']]
    d['offsetFromMedallion'] = [round(centre[0] - d['medallion']['x'], 2), round(centre[1] - d['medallion']['y'], 2)]
    out['medaillon'] = d; print('medaillon', d['docked'], d['dockedRadius'], d['offsetFromMedallion'], flush=True)
    s.click('#main-nav button[data-section=explore]'); time.sleep(2.5); globe_wait(s, 30)
    out['retour'] = globe_measure(s, 'retour-explorer')
    s.settings('ar', 'dark')
    s.wait('document.documentElement.lang==="ar"&&document.documentElement.dataset.theme==="dark"', 10); time.sleep(1.5); globe_wait(s, 30)
    out['ar-sombre'] = globe_measure(s, 'ar-sombre-sans-rechargement'); png(s, 'parcours-ar-sombre-1440x900-neuf')
    out['errors'] = s.errors()
    return out


if __name__ == '__main__':
    save(RESULTS, '1440x900', run('parcours', body))
