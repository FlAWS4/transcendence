"""Selection of 15 Oct 2026: one probe per trial outside the Explorer/arrival/Awards measures (une-colonne-320,
pseudo-manquant, roles-couleur on a content page), plus portrait Explorer captures (real globe) at 320x640 AR light
and 390x844 dark FR, where globe-espace-libre does not apply but lisibilite-textes enlarges the status note.
Run: python3 -I checks/_selection-20261015/explorer-arrivee-awards/sondes.py [part ...]"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, ALL9, D, M, S, run, fresh, subset, save, png, clearance

RESULTS = HERE / 'results-sondes.json'
GRID = r'''(()=>{const g=document.querySelector('#content-index .cp-grid');const cards=[...document.querySelectorAll('#content-index .cp-card')].slice(0,4).map(c=>{const r=c.getBoundingClientRect();return [+r.left.toFixed(1),+r.top.toFixed(1),+r.width.toFixed(1)]});
 return {section:document.getElementById('content-index')?.dataset.section,view:document.getElementById('content-index')?.dataset.view,columns:g&&getComputedStyle(g).gridTemplateColumns,cards,errors:window.qaErrors||[]}})()'''
PSEUDO = r'''(()=>{const lines=[...document.querySelectorAll('#content-index .cp-profile-card .cp-profile-login')];
 const shown=e=>{const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&e.getClientRects().length>0};
 return {cards:document.querySelectorAll('#content-index .cp-profile-card').length,pendingShown:lines.filter(e=>!e.hasAttribute('dir')&&shown(e)).map(e=>e.textContent.trim()).slice(0,3),
  pendingCount:lines.filter(e=>!e.hasAttribute('dir')).length,realShown:lines.filter(e=>e.hasAttribute('dir')&&shown(e)).map(e=>e.textContent.trim()).slice(0,3),errors:window.qaErrors||[]}})()'''
APPLY = r'''(()=>{const b=document.querySelector('.cp-project-filter-dialog[open] .cp-project-filter-apply');if(!b)return null;const s=getComputedStyle(b);return {text:b.textContent.trim(),bg:s.backgroundColor,color:s.color,radius:s.borderTopLeftRadius,font:s.fontSize}})()'''
WORLD = r'''(()=>{const g=window.horizonStudy?.globe?.getWorldScreenGeometry?.()||null;
 const box=sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect(),s=getComputedStyle(e);
  return {left:b.left,top:b.top,right:b.right,bottom:b.bottom,shown:s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0};};
 const about=document.getElementById('about'),as=getComputedStyle(about);
 return {geometry:g,stats:box('#globe-hint'),status:box('#about'),search:box('.dock-search-toggle'),aboutText:about.textContent,aboutFont:as.fontSize,aboutColor:as.color,
  errors:window.qaErrors||[]}})()'''


def contenus():
    out = {}

    def body(s):
        fresh(s, 'projects', ALL9, 'light', 'fr', S, block_globe=True)
        out['grille320-ALL9'] = s.js(GRID)
        subset(s, ['lisibilite-textes', 'echelle-unifiee', 'pseudo-manquant']); time.sleep(.4)
        out['grille320-sans-U'] = s.js(GRID)
        subset(s, ALL9)
        fresh(s, 'people', ALL9, 'light', 'fr', D, block_globe=True)
        out['profils1440-ALL9'] = s.js(PSEUDO)
        fresh(s, 'people', [], 'light', 'fr', D, block_globe=True)
        out['profils1440-socle'] = s.js(PSEUDO)
        fresh(s, 'projects', ALL9, 'light', 'fr', D, block_globe=True)
        s.click('#content-category-button'); s.wait('Boolean(document.querySelector("dialog.cp-project-filter-dialog[open]"))', 8); time.sleep(.5)
        out['filtre-ALL9'] = s.js(APPLY)
        subset(s, []); time.sleep(.3); out['filtre-socle'] = s.js(APPLY); subset(s, ALL9)
        out['errors'] = s.errors()
    run('contenus', body)
    save(RESULTS, 'contenus', out)
    print(json.dumps(out, ensure_ascii=False)[:1500], flush=True)


def portrait():
    out = {}

    def body(s):
        for name, vp, theme, lang in (('320x640-ar', S, 'light', 'ar'), ('390x844-sombre', M, 'dark', 'fr')):
            fresh(s, 'explore', ALL9, theme, lang, vp)
            s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(1)
            for key, ids in (('ALL9', ALL9), ('socle', []), ('L', ['lisibilite-textes'])):
                subset(s, ids); time.sleep(.5)
                d = s.js(WORLD); d['clearance'] = {k: clearance(d['geometry'], d[k]) for k in ('stats', 'status', 'search')}
                png(s, f'monde-{name}-{key}'); out[f'{name}-{key}'] = d
            subset(s, ALL9)
            out[f'{name}-errors'] = s.errors()
    run('portrait', body)
    save(RESULTS, 'portrait', out)
    print(json.dumps({k: (v.get('clearance'), v.get('aboutFont')) if isinstance(v, dict) else v for k, v in out.items()}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    parts = {'contenus': contenus, 'portrait': portrait}
    for name in sys.argv[1:] or list(parts):
        print('==', name, flush=True); parts[name]()
