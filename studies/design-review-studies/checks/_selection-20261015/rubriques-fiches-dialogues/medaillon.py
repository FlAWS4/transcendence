"""Header medallion of the content pages with the REAL globe (globe-espace-libre shrinks the world
disc; dock-navigation rescales it into #scope-medallion; echelle-unifiee resizes the « Monde » pill).
python3 -I medaillon.py  ->  medaillon.json, shots/medaillon-*.png"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import *  # noqa: F401,F403

store = Store('medaillon')
JS = r'''(()=>{const a=document.querySelector('#scope-medallion'),p=document.querySelector('#scope-picker'),st=document.querySelector('#main > .globe-stage');const R=e=>{if(!e)return null;const r=e.getBoundingClientRect();return[+r.left.toFixed(1),+r.top.toFixed(1),+r.width.toFixed(1),+r.height.toFixed(1)]};
const cs=st?getComputedStyle(st):null;const g=window.horizonStudy?.globe;let world=null;try{world=g?.getWorldScreenGeometry?.()||null}catch(e){}
return{anchor:R(a),picker:R(p),pickerFont:p?getComputedStyle(p).fontSize:null,pickerRadius:p?getComputedStyle(p).borderTopLeftRadius:null,docked:document.querySelector('.app')?.dataset.globeDocked||null,
 scale:st?st.style.getPropertyValue('--dock-scale'):null,clip:st?st.style.getPropertyValue('--dock-clip-radius'):null,hg:cs?cs.getPropertyValue('--hg-radius').trim():null,world:world&&world.radius,
 canvas:Boolean(document.querySelector('#globe canvas'))}})()'''


def job(label, essais):
    def run(s):
        if label in store.data: return
        load(s, 'projects', essais, 'light', 'fr', D, block=False, settle=4)
        s.wait('Boolean(document.querySelector("#globe canvas"))', 40); time.sleep(3)
        m = s.js(JS); m['errors'] = s.errors()
        s.shot(f'medaillon-{label}')
        store.put(label, m); print(label, json.dumps(m, ensure_ascii=False), flush=True)
    return run


run_jobs([job('base', []), job('globe-espace-libre', ['globe-espace-libre']), job('combo', ALL9)], HERE / 'shots', per=3)
