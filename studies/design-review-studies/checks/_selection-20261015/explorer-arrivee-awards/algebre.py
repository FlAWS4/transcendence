"""Selection of 15 Oct 2026: "together exactly as alone", element by element. In one page, the computed styles of
every element are taken for the baseline (all trial sheets off), for each of the nine trials alone, and for the
nine together. For each element and property, the value with the nine must be the value of the only trial that
changes it alone (or the baseline value when none does); several trials changing the same property are listed
with the value that wins. Layout sizes are left out on purpose (they follow from the declared values).
Transitions and animations are switched off by an injected style so that no value is read mid-transition.
Run: python3 -I checks/_selection-20261015/explorer-arrivee-awards/algebre.py [view ...]"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, ALL9, SHORT, D, M, S, L, run, fresh, subset, save

RESULTS = HERE / 'results-algebre.json'
PROPS = ['fontSize', 'lineHeight', 'fontFamily', 'fontWeight', 'fontStyle', 'letterSpacing', 'color', 'backgroundColor', 'borderTopColor', 'borderBottomColor',
         'borderTopWidth', 'borderTopLeftRadius', 'borderBottomRightRadius', 'boxShadow', 'paddingTop', 'paddingLeft', 'outlineColor', 'outlineWidth', 'outlineOffset',
         'display', 'visibility', 'opacity', 'gridTemplateColumns', 'textDecorationLine']
SETUP = r'''((props)=>{const st=document.createElement('style');st.id='qa-no-motion';st.textContent='*,*::before,*::after{transition:none!important;animation:none!important}';document.head.append(st);
 window.__snap={};window.__props=props;
 window.__take=key=>{const els=[...document.querySelectorAll('body *')];window.__els=els;window.__snap[key]=els.map(e=>{const s=getComputedStyle(e);return props.map(p=>s[p])});return els.length};
 window.__analyse=(trials)=>{const base=__snap.socle,all=__snap.ALL9,out={unexpected:[],overlaps:[],changedByTrial:{}};
  const name=e=>{let n=e.tagName.toLowerCase();if(e.id)n+='#'+e.id;else if(e.classList.length)n+='.'+[...e.classList].slice(0,2).join('.');const t=(e.textContent||'').trim().slice(0,30);return t?n+' «'+t+'»':n};
  for(const t of trials)out.changedByTrial[t]=0;
  for(let i=0;i<base.length;i++){for(let p=0;p<props.length;p++){const b=base[i][p],a=all[i][p];const by=trials.filter(t=>__snap[t][i][p]!==b);
   for(const t of by)out.changedByTrial[t]++;
   if(by.length===0){if(a!==b)out.unexpected.push({el:name(__els[i]),prop:props[p],socle:b,ALL9:a})}
   else if(by.length===1){const v=__snap[by[0]][i][p];if(a!==v)out.unexpected.push({el:name(__els[i]),prop:props[p],socle:b,alone:[by[0],v],ALL9:a})}
   else out.overlaps.push({el:name(__els[i]),prop:props[p],socle:b,alone:by.map(t=>[t,__snap[t][i][p]]),ALL9:a})}}
  out.unexpectedCount=out.unexpected.length;out.overlapCount=out.overlaps.length;out.unexpected=out.unexpected.slice(0,40);out.overlaps=out.overlaps.slice(0,60);return out};
 return true})'''
VIEWS = {
    'explorer-1440x900': ('explore', D, 'light', 'fr', 'content-preview.html', False, None),
    'explorer-390x844-sombre': ('explore', M, 'dark', 'fr', 'content-preview.html', False, None),
    'fiche-campus-1440x900': ('explore', D, 'light', 'fr', 'content-preview.html', False, 'campus'),
    'arrivee-1440x900-sombre': ('', D, 'dark', 'fr', 'index.html', True, None),
    'connexion-arrivee-390x844-sombre': ('', M, 'dark', 'fr', 'index.html', True, 'login'),
    'arrivee-320x640-ar-clair': ('', S, 'light', 'ar', 'index.html', True, 'login'),
    'awards-1440x900': ('awards', D, 'light', 'fr', 'content-preview.html', True, None),
    'awards-390x844-sombre-en': ('awards', M, 'dark', 'en', 'content-preview.html', True, None),
}


def open_campus(s):
    s.js('(()=>{window.horizonStudy.globe.selectCountry("FRA");return true})()')
    s.wait('document.getElementById("globe").dataset.level==="country"', 25); time.sleep(2)
    s.js('(()=>{window.horizonStudy.globe.selectCampus("paris");return true})()')
    s.wait('document.getElementById("globe").dataset.level==="campus"', 30)
    s.wait('(()=>{const t=document.querySelector("#globe .hg-target");return Boolean(t&&t.getBoundingClientRect().width)})()', 45); time.sleep(1.5)
    s.click('#globe .hg-target')
    return s.wait('document.getElementById("dialog").open&&document.getElementById("dialog").dataset.kind==="campus"', 10)


def view(name):
    route, vp, theme, lang, page, block, extra = VIEWS[name]

    def body(s):
        fresh(s, route, ALL9, theme, lang, vp, page=page, block_globe=block, settle=1.5)
        if page != 'index.html' and not block:
            s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(1)
        opened = None
        if extra == 'campus': opened = open_campus(s); time.sleep(1.2)
        if extra == 'login':
            s.click('#entry-login'); opened = s.wait('Boolean(document.querySelector("#dialog[open][data-kind=login]"))', 10); time.sleep(.8)
        s.away()
        s.js(SETUP + '(' + json.dumps(PROPS) + ')')
        counts = {}
        for key, ids in [('ALL9', ALL9), ('socle', [])] + [(t, [t]) for t in ALL9]:
            subset(s, ids); time.sleep(.35); counts[key] = s.js(f'window.__take({json.dumps(key)})', 30)
        subset(s, ALL9)
        result = s.js('window.__analyse(' + json.dumps(ALL9) + ')', 60)
        result['elements'] = counts; result['opened'] = opened; result['errors'] = s.errors()
        return result
    out = run(name, body)
    save(RESULTS, name, out)
    print(name, json.dumps({'elements': out['elements']['ALL9'], 'sameCount': len(set(out['elements'].values())) == 1, 'unexpected': out['unexpectedCount'], 'overlaps': out['overlapCount'],
                            'byTrial': {SHORT[k]: v for k, v in out['changedByTrial'].items()}, 'opened': out['opened'], 'errors': out['errors']}, ensure_ascii=False), flush=True)
    for item in out['unexpected'][:12]: print('   UNEXPECTED', json.dumps(item, ensure_ascii=False)[:300])
    for item in out['overlaps'][:20]: print('   OVERLAP', json.dumps(item, ensure_ascii=False)[:300])


if __name__ == '__main__':
    for name in sys.argv[1:] or list(VIEWS):
        print('==', name, flush=True); view(name)
