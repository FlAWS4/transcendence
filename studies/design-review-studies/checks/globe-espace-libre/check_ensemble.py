"""Explorer et globe: the four trials of the group active together (real globe, 1440x900).
Run: python3 -I checks/globe-espace-libre/check_ensemble.py (merges 'ensemble' into results.json).
Each effect must stay present and independent: fitted disc, opaque pills, Jost labels, Paris title;
then the same after a language and theme change made through the account settings."""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D

GROUP = ['globe-espace-libre', 'textes-sur-pastilles', 'police-etiquettes-globe', 'titre-fiche-campus']
RESULTS = HERE / 'results.json'
STATE = '''(()=>{const g=window.horizonStudy?.globe?.getWorldScreenGeometry?.();const pill=sel=>getComputedStyle(document.querySelector(sel),"::before");
 const labels=[...new Set([...document.querySelectorAll("#globe .hg-marker-label")].map(l=>getComputedStyle(l).fontFamily))];
 return {active:document.documentElement.dataset.essais,lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,level:document.getElementById("globe").dataset.level,
  radius:g&&Math.round(g.radius*100)/100,hintPill:[pill("#globe-hint").content,pill("#globe-hint").backgroundColor],aboutPill:[pill("#about").content,pill("#about").backgroundColor],
  labelFamilies:labels,overflow:document.documentElement.scrollWidth>innerWidth+1,errors:window.qaErrors||[]}})()'''
SHEET = '''(()=>{const d=document.getElementById("dialog");const hero=d?.querySelector(".campus-details-hero");if(!d?.open||!hero)return null;
 const vis=e=>e&&e.getClientRects().length&&!e.closest("[hidden]");
 return {campus:document.getElementById("dialog-title").textContent,titles:hero.querySelectorAll(".essai-campus-title").length,
  visibleNames:[...hero.querySelectorAll("h3")].filter(vis).map(e=>e.textContent)}})()'''


def open_paris_sheet(s):
    s.js('window.horizonStudy.globe.selectCountry("FRA"),true')
    s.wait('document.getElementById("globe").dataset.level==="country"', 20); time.sleep(1.5)
    s.js('window.horizonStudy.globe.selectCampus("paris"),true')
    s.wait('document.getElementById("globe").dataset.level==="campus"', 30)
    s.wait('(()=>{const t=document.querySelector("#globe .hg-target");return Boolean(t&&t.getBoundingClientRect().width)})()', 45); time.sleep(1.5)
    s.click('#globe .hg-target')
    s.wait('document.getElementById("dialog").open&&document.getElementById("dialog").dataset.kind==="campus"', 10)
    s.wait('(()=>{const i=document.querySelector("#dialog .campus-details-logo-image");return Boolean(i&&i.complete)})()', 10); time.sleep(1)
    sheet = s.js(SHEET)
    s.key('Escape'); s.wait('!document.getElementById("dialog").open', 5)
    s.js('window.horizonStudy.globe.reset(),true')
    s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 30); time.sleep(1)
    return sheet


out = {}
s = None
try:
    s = Session(HERE)
    s.open('explore', essais=GROUP, viewport=D, block_globe=False)
    s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(1)
    out['fr-light'] = s.js(STATE); s.shot('apres-ensemble-ordinateur')
    out['fr-light']['sheet'] = open_paris_sheet(s)
    s.settings('ar', 'dark')
    s.wait('document.documentElement.lang==="ar"&&document.documentElement.dataset.theme==="dark"', 10)
    s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 30); time.sleep(1.5)
    out['ar-dark'] = s.js(STATE); s.shot('apres-ensemble-ar-sombre')
    out['ar-dark']['sheet'] = open_paris_sheet(s)
    out['ar-dark']['errors'] = s.errors()
finally:
    if s: s.close()

def good(v, lang, theme):
    return (v['active'] == ' '.join(GROUP) and v['lang'] == lang and v['theme'] == theme and abs((v['radius'] or 0) - 240.01) < .6
            and v['hintPill'][0] == '""' and v['aboutPill'][0] == '""' and v['labelFamilies'] == ['Jost, sans-serif']
            and v['sheet'] and v['sheet']['titles'] == 1 and v['sheet']['visibleNames'] == ['42 Paris'] and not v['overflow'] and not v['errors'])
out['passed'] = good(out['fr-light'], 'fr', 'light') and good(out['ar-dark'], 'ar', 'dark')
print(json.dumps(out, ensure_ascii=False, indent=1))
data = json.loads(RESULTS.read_text()); data['ensemble'] = out
RESULTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
