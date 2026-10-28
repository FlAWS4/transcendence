"""Integration pass, problems 4 to 6 of the second checker, globe blocked, direct loads with the smallest sets.
 4. Projects grid 390x844 dark FR: author name "Arun Suri" on two lines (lisibilite-textes floor 13 px).
 5. Profiles List view 360x640 AR: Alumni chip on two lines under the thumbnail (echelle-unifiee 12 px).
 6. Account menu, dark: Royal Pink text of "Créer un compte" against the menu glass (pixels).
python3 -I checks/_selection-20261015/integration/listes_compte.py [arun] [alumni] [compte]"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, ALL9, LT, E, V, PM, D, M, label, fresh, run, save, png, pixels, contrast

RESULTS = HERE / 'results-listes-compte.json'
LINES = 'const lines=e=>{if(!e||!e.getClientRects().length)return 0;const g=document.createRange();g.selectNodeContents(e);return new Set([...g.getClientRects()].filter(q=>q.width>.5).map(q=>Math.round(q.top))).size};'
ARUN_JS = '(()=>{' + LINES + r'''const cards=[...document.querySelectorAll('#content-list > .cp-card')];
 const all=cards.map(c=>[...c.querySelectorAll('.cp-authors:not(.cp-author-fit-probe) .cp-author-name>strong')].filter(e=>e.getClientRects().length)
  .map(e=>({t:e.textContent.trim(),lines:lines(e),fs:getComputedStyle(e).fontSize,w:Math.round(e.getBoundingClientRect().width)}))).flat();
 const card=cards.find(c=>c.textContent.includes('Arun Suri'));if(card)card.scrollIntoView({block:'center'});
 const r=card&&card.getBoundingClientRect();
 return {columns:getComputedStyle(document.querySelector('#content-list')).gridTemplateColumns,names:all.length,twoLines:all.filter(n=>n.lines>1),
  arun:all.filter(n=>n.t.includes('Arun')),card:r&&[r.left,r.top,r.right,r.bottom],overflow:document.documentElement.scrollWidth>innerWidth+1,errors:window.qaErrors||[]}})()'''
CHIP_JS = '(()=>{' + LINES + r'''const cards=[...document.querySelectorAll('#content-index .cp-profile-card')].filter(c=>c.getClientRects().length);
 const rows=cards.map(c=>{const chip=c.querySelector('.cp-profile-portrait>.cp-profile-status'),p=chip?.parentElement.getBoundingClientRect(),q=chip?.getBoundingClientRect();
  return {name:c.querySelector('h2')?.textContent.trim(),h:Math.round(c.getBoundingClientRect().height*10)/10,chip:chip?.textContent.trim(),chipLines:lines(chip),chipFs:chip&&getComputedStyle(chip).fontSize,
   clipped:Boolean(q&&(q.left<p.left-.5||q.right>p.right+.5||q.bottom>p.bottom+.5))}});
 const tall=cards.find(c=>c.getBoundingClientRect().height>120)||cards.find(c=>/إيناس/.test(c.textContent));if(tall)tall.scrollIntoView({block:'center'});
 const r=tall&&tall.getBoundingClientRect(),n=tall&&tall.nextElementSibling?.getBoundingClientRect();
 return {view:document.querySelector('#content-index')?.dataset.view,heights:[...new Set(rows.map(x=>x.h))].sort((a,b)=>a-b),tall:rows.filter(x=>x.h>120).map(x=>x.name+' · '+x.chip),
  chips:[...new Set(rows.map(x=>x.chip+':'+x.chipLines+':'+x.chipFs))],clipped:rows.filter(x=>x.clipped).length,box:r&&[r.left,r.top,r.right,(n||r).bottom],
  overflow:document.documentElement.scrollWidth>innerWidth+1,errors:window.qaErrors||[]}})()'''
ACCOUNT_JS = r'''(()=>{const b=document.querySelector('[data-account-action=signup]'),i=document.querySelector('[data-account-action=login]');if(!b)return null;
 const r=b.getBoundingClientRect(),c=getComputedStyle(b),g=document.createRange();g.selectNodeContents(b);const t=[...g.getClientRects()].filter(q=>q.width>.5);
 const tx=t.length?[Math.min(...t.map(q=>q.left)),Math.min(...t.map(q=>q.top)),Math.max(...t.map(q=>q.right)),Math.max(...t.map(q=>q.bottom))]:null;
 return {box:[r.left,r.top,r.right,r.bottom],text:tx,color:c.color,border:c.borderTopColor,borderWidth:c.borderTopWidth,size:[Math.round(r.width*10)/10,Math.round(r.height*10)/10],
  login:i&&[Math.round(i.getBoundingClientRect().width*10)/10,Math.round(i.getBoundingClientRect().height*10)/10],menuBg:getComputedStyle(document.querySelector('#account-menu')).backgroundColor,
  overflow:document.documentElement.scrollWidth>innerWidth+1,errors:window.qaErrors||[]}})()'''


def view_list(s, view):
    if s.js('document.querySelector("#content-index")?.dataset.view') == view: return
    s.click('#content-layout-button'); time.sleep(.5)
    s.click(f'#content-layout-menu [data-value={view}]'); time.sleep(1.2); s.away(); s.blur()


def arun():
    out = {}

    def body(s):
        for ids in ([], [LT], [E], [LT, E], ALL9):
            fresh(s, 'projects', ids, 'dark', 'fr', M, block_globe=True); view_list(s, 'grid'); time.sleep(.6)
            d = s.js(ARUN_JS); time.sleep(.6); d = s.js(ARUN_JS)
            if ids in ([], [LT], ALL9): d['shot'] = str(png(s, f'arun-390-sombre-{label(ids)}'))
            out[label(ids)] = d; print('arun', label(ids), json.dumps({k: d[k] for k in ('columns', 'twoLines', 'arun')}, ensure_ascii=False), flush=True)
        return out
    save(RESULTS, 'arun', run('arun', body))


def alumni():
    out = {}

    def body(s):
        for ids in ([], [E], [LT], [PM], [LT, E], ALL9):
            fresh(s, 'people', ids, 'light', 'ar', (360, 640, True), block_globe=True); view_list(s, 'list'); time.sleep(.6)
            d = s.js(CHIP_JS); time.sleep(.6); d = s.js(CHIP_JS)
            if ids in ([], [E], ALL9): d['shot'] = str(png(s, f'alumni-360-ar-{label(ids)}'))
            out[label(ids)] = d; print('alumni', label(ids), json.dumps({k: d[k] for k in ('view', 'heights', 'tall', 'chips', 'clipped')}, ensure_ascii=False)[:400], flush=True)
        return out
    save(RESULTS, 'alumni', run('alumni', body))


WIDTHS = (768, 1024, 1199, 1200, 1440) if 'ordinateur' in sys.argv else (320, 340, 390)


def alumni_widths():
    """Same measure at 320, 340 and 390 px (360 px is part 'alumni'), copy / echelle-unifiee / the nine."""
    out = {}

    def body(s):
        for w in WIDTHS:
            for ids in ([], [E], ALL9):
                fresh(s, 'people', ids, 'light', 'ar', (w, 640 if w < 390 else 844, True) if w <= 390 else (w, 800, False), block_globe=True); view_list(s, 'list'); time.sleep(.6)
                d = s.js(CHIP_JS); time.sleep(.6); d = s.js(CHIP_JS)
                out[f'{w}-{label(ids)}'] = {k: d[k] for k in ('view', 'heights', 'tall', 'chips', 'clipped', 'overflow', 'errors')}
                print('alumni', w, label(ids), json.dumps({k: d[k] for k in ('heights', 'chips', 'clipped')}, ensure_ascii=False), len(d['tall']), flush=True)
        return out
    save(RESULTS, 'alumni-largeurs' if WIDTHS == (320, 340, 390) else 'alumni-largeurs-ordinateur', run('alumni-widths', body))


def account():
    out = {}

    def body(s):
        for vp, lang in ((D, 'fr'), (M, 'ar')):
            for ids in ([], [V], ALL9):
                key = f'{vp[0]}-{lang}-{label(ids)}'
                fresh(s, 'projects', ids, 'dark', lang, vp, block_globe=True)
                s.click('#profile'); time.sleep(1.2); s.away()
                d = s.js(ACCOUNT_JS)
                if not d: out[key] = None; continue
                shot = png(s, f'compte-{key}'); img = pixels(shot); k = 2 if vp[2] else 1
                x0, y0, x1, y1 = [round(v * k) for v in d['box']]; tx = [round(v * k) for v in d['text']]
                inner = img[y0 + 3 * k:y1 - 3 * k, x0 + 3 * k:x1 - 3 * k].reshape(-1, 3)
                # Background: pixels of the button outside the text box (median, robust to the glass blur).
                import numpy as np
                ys, xs = np.mgrid[y0 + 3 * k:y1 - 3 * k, x0 + 3 * k:x1 - 3 * k]
                mask = ~((xs >= tx[0] - 2 * k) & (xs <= tx[2] + 2 * k) & (ys >= tx[1] - 2 * k) & (ys <= tx[3] + 2 * k))
                bg = tuple(int(v) for v in np.median(inner[mask.reshape(-1)], axis=0))
                fg = tuple(int(float(v)) for v in d['color'][d['color'].index('(') + 1:-1].split(',')[:3])
                d['bgPixel'] = bg; d['textContrast'] = round(contrast(fg, bg), 2)
                bc = d['border'][d['border'].index('(') + 1:-1].split(',')
                d['borderContrast'] = round(contrast(tuple(int(float(v)) for v in bc[:3]), bg), 2) if len(bc) == 3 or float(bc[3]) > 0 else None
                out[key] = d; print('compte', key, json.dumps({x: d[x] for x in ('color', 'border', 'bgPixel', 'textContrast', 'borderContrast', 'size', 'login')}), flush=True)
        return out
    save(RESULTS, 'compte', run('compte', body))


if __name__ == '__main__':
    parts = sys.argv[1:] or ['arun', 'alumni', 'compte']
    if 'arun' in parts: arun()
    if 'alumni' in parts: alumni()
    if 'alumni-largeurs' in parts: alumni_widths()
    if 'compte' in parts: account()
