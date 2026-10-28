"""Essai globe-espace-libre: the campus map dialog borrows the globe with its own radius and returns it fitted.
Run: python3 -I checks/globe-espace-libre/check_campus_dialog.py (merges 'campusDialog' into results.json)."""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D

ID = 'globe-espace-libre'
RESULTS = HERE / 'results.json'
STAGE = '''(()=>{const st=document.getElementById("globe"),cs=getComputedStyle(st),g=window.horizonStudy?.globe?.getWorldScreenGeometry?.();
 return {parent:st.parentElement?.id||st.parentElement?.className,hg:cs.getPropertyValue("--hg-radius").trim(),level:st.dataset.level,
  dialog:document.getElementById("campus-map-dialog")?.open||false,section:document.getElementById("app").dataset.section,radius:g&&Math.round(g.radius*100)/100}})()'''
out = {}
for side, essais in (('avant', []), ('apres', [ID])):
    s = Session(HERE)
    try:
        s.open('journal/journal-an-evening-debugging', essais=essais, viewport=D, block_globe=False)
        s.wait('Boolean(document.querySelector(".cp-project-campus"))', 20); time.sleep(1)
        s.click('.cp-project-campus')
        s.wait('document.getElementById("campus-map-viewport")?.contains(document.getElementById("globe"))', 40)
        s.wait('document.getElementById("campus-map-status")?.hidden', 45); time.sleep(2)
        borrowed = s.js(STAGE); s.shot(side + '-fenetre-campus')
        s.click('#campus-map-close'); s.wait('document.getElementById("main").contains(document.getElementById("globe"))', 20); time.sleep(1)
        returned = s.js(STAGE)
        s.click('#main-nav button[data-section=explore]')
        s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(1.5)
        explorer = s.js(STAGE); s.shot(side + '-retour-explorer')
        out[side] = {'borrowed': borrowed, 'returned': returned, 'explorer': explorer, 'errors': s.errors()}
        print(side, json.dumps(out[side], ensure_ascii=False), flush=True)
    finally:
        s.close()
a = out['apres']
out['passed'] = a['borrowed']['hg'] == out['avant']['borrowed']['hg'] == '.43' and a['borrowed']['dialog'] and a['explorer']['radius'] is not None \
    and abs(a['explorer']['radius'] - 240.01) < .6 and not a['errors'] and not out['avant']['errors']
data = json.loads(RESULTS.read_text()); data['campusDialog'] = out; RESULTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
print('passed', out['passed'])
