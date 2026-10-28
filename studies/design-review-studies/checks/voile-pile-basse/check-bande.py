"""Trial voile-pile-basse, complement: height of the clear reading band left between the
baseline header fade (.app::after) and the trial's bottom veil (.app::before), per viewport.
Run: python3 -I studies/design-review-studies/checks/voile-pile-basse/check-bande.py"""
import json, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, L

ID = 'voile-pile-basse'
BAND_JS = '''(()=>{const app=document.getElementById('app'),h=getComputedStyle(app,'::after'),v=getComputedStyle(app,'::before');
const header=parseFloat(h.height)||0,veil=parseFloat(v.height)||0,clear=innerHeight-header-veil;
return {vh:innerHeight,headerFade:header,headerOpacity:h.opacity,veil:veil,veilOpacity:v.opacity,clearBand:+clear.toFixed(1),clearShare:+(clear/innerHeight).toFixed(3),veilShare:+(veil/innerHeight).toFixed(3)}})()'''
rows = {}
s = Session(HERE)
try:
    for vue, vp in (('ordinateur', D), ('mobile', M), ('petit', S), ('paysage', L)):
        s.open('projects', essais=[ID], viewport=vp, block_globe=True)
        rows[vue] = s.js(BAND_JS); s.record(vue, rows[vue])
    errors = s.errors()
finally:
    s.close()
(HERE / 'results-bande.json').write_text(json.dumps({'id': ID, 'what': 'clear band between header fade and veil (Projects, at rest)', 'views': rows, 'errors': errors}, ensure_ascii=False, indent=1) + '\n')
print('written')
