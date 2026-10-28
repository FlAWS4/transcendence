"""Probes of the two globe trials and of the Awards note inside the nine-trial combination (zone
« rubriques, fiches et dialogues »: one probe each, the Explorer zone checker measures them in depth).

python3 -I sondes.py
 globe   Explorer 1440x900 light FR with the real globe: baseline, globe-espace-libre alone,
         police-etiquettes-globe alone, the nine (4 globe loads in one Chrome).
 awards  #awards at 1440x900 light FR and 390x844 dark FR: awards-a-venir alone and the nine.
Results: sondes.json; screenshots in shots/.
"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import *  # noqa: F401,F403

SHOTS = HERE / 'shots'
store = Store('sondes')

GLOBE_JS = r'''(()=>{const g=window.horizonStudy?.globe;let geo=null;try{geo=g?.getWorldScreenGeometry?.()||null}catch(e){geo=String(e)}
const stage=document.querySelector('#main > .globe-stage');const markers=[...document.querySelectorAll('.hg-integrated .hg-marker')].filter(e=>e.getClientRects().length);
const label=markers.map(m=>m.querySelector('*')||m).find(Boolean);
return{geo,hgRadius:stage?getComputedStyle(stage).getPropertyValue('--hg-radius').trim():null,markers:markers.length,
 markerFont:markers[0]?getComputedStyle(markers[0]).fontFamily:null,labelFont:label?getComputedStyle(label).fontFamily:null,labelSize:label?getComputedStyle(label).fontSize:null,
 labelText:label?label.textContent.trim().slice(0,30):null}})()'''

AWARDS_JS = r'''(()=>{const n=document.querySelector('.essai-awards-a-venir');const vis=n&&n.checkVisibility({opacityProperty:true,visibilityProperty:true});
const p=n?.querySelector('p'),svg=n?.querySelector('svg');const R=e=>{if(!e)return null;const r=e.getBoundingClientRect();return[+r.left.toFixed(1),+r.top.toFixed(1),+r.right.toFixed(1),+r.bottom.toFixed(1)]};
const cs=getComputedStyle(document.querySelector('.app')||document.body);const fadeEnd=parseFloat(cs.getPropertyValue('--header-fade-end'))||null;
const dock=document.querySelector('.dock-shell')||document.querySelector('#main-nav');
return{visible:Boolean(vis),text:p?.textContent||null,fs:p?getComputedStyle(p).fontSize:null,lh:p?getComputedStyle(p).lineHeight:null,color:p?getComputedStyle(p).color:null,
 p:R(p),svg:R(svg),fadeEnd,dock:R(dock),h:innerHeight}})()'''


def globe_job(label, essais):
    def run(s):
        if label in store.data.get('globe', {}): return
        load(s, 'explore', essais, 'light', 'fr', D, block=False, settle=3)
        s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 20)
        m = s.js(GLOBE_JS); m['errors'] = s.errors(); m['state'] = s.js(STATE_JS)
        s.shot(f'sonde-globe-{label}')
        store.data.setdefault('globe', {})[label] = m; store.save(); print('globe', label, json.dumps(m, ensure_ascii=False)[:400], flush=True)
    return run


def awards_job(label, essais, name, vp, theme):
    def run(s):
        if label in store.data.get('awards', {}).get(name, {}): return
        load(s, 'awards', essais, theme, 'fr', vp)
        time.sleep(.6); m = s.js(AWARDS_JS); m['errors'] = s.errors(); m['overflow'] = s.overflow()
        s.shot(f'sonde-awards-{name}-{label}')
        store.data.setdefault('awards', {}).setdefault(name, {})[label] = m; store.save(); print('awards', name, label, json.dumps(m, ensure_ascii=False)[:300], flush=True)
    return run


if __name__ == '__main__':
    run_jobs([globe_job('base', []), globe_job('globe-espace-libre', ['globe-espace-libre']), globe_job('police-etiquettes-globe', ['police-etiquettes-globe']), globe_job('combo', ALL9)], SHOTS, per=4)
    run_jobs([awards_job(label, essais, name, vp, theme) for name, vp, theme in (('ordinateur', D, 'light'), ('mobile-sombre', M, 'dark'))
              for label, essais in (('awards-a-venir', ['awards-a-venir']), ('combo', ALL9))], SHOTS, per=4)
