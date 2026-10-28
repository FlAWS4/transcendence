"""Integration pass, final check of the nine trials together after the fixes (direct loads of the nine only).
Views: Explorer with the REAL globe (1440x900 light FR, 390x844 dark FR), Projects 320x640 light AR, a project detail
with its comments (1440 light FR, 390 dark AR), the filter dialog (1440 light FR, 390 dark AR), Profiles 1440 (pseudo
effect), the arrival in dark (index.html, 1440 and 390, sign-in dialog included) and the 42 Awards page (1440 light FR,
390 dark FR). Every view records console errors, horizontal overflow and the effect of each trial it shows.
python3 -I checks/_selection-20261015/integration/passe_finale.py [explorer] [rubriques] [arrivee] [awards]"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, ALL9, D, M, S, fresh, run, save, globe_wait, relayout, globe_measure, png, pixels, contrast

RESULTS = HERE / 'results-passe-finale.json'
PID = 'ft-transcendence-building-together'
COMMON = '''(()=>({active:document.documentElement.dataset.essais,ready:document.documentElement.dataset.essaisReady,lang:document.documentElement.lang,
 dir:document.documentElement.dir,theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth+1,errors:window.qaErrors||[]}))()'''
# Computed look of one element; 'clipped' when its own content overflows its box.
LOOK = r'''(sel=>{const e=typeof sel==='string'?document.querySelector(sel):sel;if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);
 return {text:e.textContent.replace(/\s+/g,' ').trim().slice(0,40),rect:[+r.left.toFixed(1),+r.top.toFixed(1),+r.width.toFixed(1),+r.height.toFixed(1)],color:s.color,bg:s.backgroundColor,
  border:s.borderTopColor+' '+s.borderTopWidth,radius:s.borderTopLeftRadius,shadow:s.boxShadow==='none'?'none':s.boxShadow.slice(0,60),font:s.fontSize+' '+s.fontWeight,family:s.fontFamily.slice(0,30),
  clipped:e.scrollWidth>e.clientWidth+1}})'''
# Words split across two lines inside the given elements (a name or title broken in the middle of a word).
BROKEN = r'''(sel=>{const out=[];for(const e of document.querySelectorAll(sel)){if(!e.getClientRects().length)continue;const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let n;
 while(n=walker.nextNode()){const re=/\S+/g;let m;while(m=re.exec(n.textContent)){const g=document.createRange();g.setStart(n,m.index);g.setEnd(n,m.index+m[0].length);
  const tops=new Set([...g.getClientRects()].filter(q=>q.width>.5).map(q=>Math.round(q.top)));if(tops.size>1)out.push(m[0])}}}return out})'''


def parse(value):
    v = value[value.index('(') + 1:value.index(')')].replace('/', ' ').replace(',', ' ').split()
    return tuple(round(float(x)) for x in v[:3]), (float(v[3]) if len(v) > 3 else 1.0)


def text_contrast(look):
    """Contrast of the text against an opaque button background (None when the background is not opaque)."""
    fg, _ = parse(look['color']); bg, alpha = parse(look['bg'])
    return round(contrast(fg, bg), 2) if alpha >= .999 else None


def sampled(s, shot, look, dpr):
    """Background pixel just inside the left edge of a box (for transparent buttons), and contrasts against it."""
    img = pixels(shot); x, y, w, h = look['rect']
    px = tuple(int(v) for v in img[int((y + h / 2) * dpr), int((x + 4) * dpr)]) if look else None
    fg, _ = parse(look['color']); border, _ = parse(look['border'].rsplit(' ', 1)[0])
    return {'bgPixel': px, 'text': round(contrast(fg, px), 2), 'border': round(contrast(border, px), 2)}


def look(s, sel):
    return s.js(LOOK + '(' + json.dumps(sel) + ')')


def explorer():
    out = {}

    def body(s):
        for name, vp, theme in (('explorer-1440x900-clair', D, 'light'), ('explorer-390x844-sombre', M, 'dark')):
            fresh(s, 'explore', ALL9, theme, 'fr', vp); globe_wait(s, 40); relayout(s)
            d = globe_measure(s, name); d['common'] = s.js(COMMON)
            d['searchLabel'] = look(s, '.dock-shell>.dock-search-toggle'); d['scope'] = look(s, '#scope-picker')
            d['shot'] = str(png(s, f'finale-{name}')); out[name] = d
        return out
    save(RESULTS, 'explorer', run('explorer', body))


def rubriques():
    out = {}

    def body(s):
        # Projects grid 320x640 Arabic: one column, no broken word, no clipped chip, no overflow.
        fresh(s, 'projects', ALL9, 'light', 'ar', S, block_globe=True)
        if s.js('document.querySelector("#content-index")?.dataset.view') != 'grid':
            s.click('#content-layout-button'); time.sleep(.5); s.click('#content-layout-menu [data-value=grid]'); time.sleep(1.2); s.away(); s.blur()
        out['projets-320x640-ar'] = {
            'common': s.js(COMMON), 'columns': s.js('getComputedStyle(document.querySelector("#content-list")).gridTemplateColumns'),
            'brokenNames': s.js(BROKEN + '(".cp-authors:not(.cp-author-fit-probe) .cp-author-name>strong")'),
            'brokenTitles': s.js(BROKEN + '("#content-list .cp-card-title-link")'),
            'clippedChips': s.js('[...document.querySelectorAll("#content-list :is(.cp-project-tags li,.cp-meta,.cp-author-role)")].filter(e=>e.getClientRects().length&&e.scrollWidth>e.clientWidth+1).length'),
            'metaFont': look(s, '#content-list .cp-meta'), 'cardRadius': look(s, '#content-list > .cp-card')}
        out['projets-320x640-ar']['shot'] = str(png(s, 'finale-projets-320x640-ar'))
        # Profiles 1440: no pending-login line visible, real logins kept.
        fresh(s, 'people', ALL9, 'light', 'fr', D, block_globe=True)
        out['profils-1440'] = {'common': s.js(COMMON), 'pendingVisible': s.js('[...document.querySelectorAll(".cp-profile-login:not([dir])")].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=="hidden").length'),
                               'realLogins': s.js('[...document.querySelectorAll(".cp-profile-login[dir]")].filter(e=>e.getClientRects().length).map(e=>e.textContent.trim()).slice(0,6)')}
        # Project detail, comments tab, then the filter dialog of Projects, in two formats.
        for name, vp, theme, lang in (('1440-clair-fr', D, 'light', 'fr'), ('390-sombre-ar', M, 'dark', 'ar')):
            fresh(s, f'projects/{PID}?tab=comments', ALL9, theme, lang, vp, block_globe=True)
            s.js('(()=>{document.querySelector(".cp-comments-form")?.scrollIntoView({block:"center"});return true})()'); time.sleep(1.2)
            c = {'common': s.js(COMMON), 'submit': look(s, '.cp-comments-form .cp-comments-submit'), 'emoji': look(s, '.cp-comments-form .cp-comments-emoji-toggle'),
                 'textarea': look(s, '.cp-comments-form textarea'), 'favorite': look(s, '#content-sheet .cp-favorite:not(.cp-favorite-compact)')}
            c['submitContrast'] = c['submit'] and text_contrast(c['submit'])
            c['shot'] = str(png(s, f'finale-commentaires-{name}')); out[f'commentaires-{name}'] = c
            fresh(s, 'projects', ALL9, theme, lang, vp, block_globe=True)
            s.click('#content-index .cp-control-menu[data-control=category] .cp-control-trigger'); time.sleep(1.2)
            f = {'common': s.js(COMMON), 'open': s.js('Boolean(document.querySelector("dialog.cp-project-filter-dialog[open]"))'),
                 'dialog': look(s, 'dialog.cp-project-filter-dialog[open]')}
            for key in ('apply', 'cancel', 'reset', 'close', 'all'):
                f[key] = look(s, f'dialog.cp-project-filter-dialog[open] .cp-project-filter-{key}')
                if f[key]: f[key]['contrast'] = text_contrast(f[key])
            f['shot'] = str(png(s, f'finale-filtre-{name}')); out[f'filtre-{name}'] = f
            print(name, json.dumps({'submit': c['submit'] and [c['submit']['bg'], c['submit']['font'], c['submitContrast']],
                                    'apply': f['apply'] and [f['apply']['bg'], f['apply']['color'], f['apply']['font'], f['apply']['radius'], f['apply']['contrast']],
                                    'dialog': f['dialog'] and [f['dialog']['radius'], f['dialog']['shadow'][:30]], 'err': f['common']['errors'] + c['common']['errors']}), flush=True)
        return out
    save(RESULTS, 'rubriques', run('rubriques', body))


def arrivee():
    out = {}

    def body(s):
        for name, vp in (('1440x900-sombre', D), ('390x844-sombre', M)):
            fresh(s, '', ALL9, 'dark', 'fr', vp, page='index.html', block_globe=True)
            s.wait('document.querySelector("#entry-guest")?.getClientRects().length>0', 20); time.sleep(5)
            d = {'common': s.js(COMMON), 'guest': look(s, '#entry-guest'), 'login': look(s, '#entry-login')}
            d['shot'] = str(png(s, f'finale-arrivee-{name}'))
            d['guestContrast'] = sampled(s, d['shot'], d['guest'], 2 if vp[2] else 1)
            d['loginContrast'] = text_contrast(d['login'])
            d['sameSize'] = d['guest']['rect'][2:] == d['login']['rect'][2:]
            # Keyboard focus reaches both buttons with a visible ring.
            rings = []
            for _ in range(6):
                s.key('Tab'); rings.append(s.js('(()=>{const e=document.activeElement,c=getComputedStyle(e);return {id:e.id||e.className,visible:e.matches(":focus-visible"),outline:c.outlineStyle+" "+c.outlineWidth+" "+c.outlineColor}})()'))
                if rings[-1]['id'] == 'entry-guest': break
            d['focus'] = rings
            # Sign-in dialog (roles-couleur: neutral Annuler in dark; echelle-unifiee: 20 px radius).
            s.blur(); s.click('#entry-login'); time.sleep(1.2)
            d['dialog'] = look(s, '#dialog[open]')
            d['dialogButtons'] = s.js('[...document.querySelectorAll("#dialog[open] #dialog-content>button")].map(b=>(' + LOOK + ')(b))')
            for b in d['dialogButtons'] or []: b['contrast'] = text_contrast(b)
            d['dialogShot'] = str(png(s, f'finale-arrivee-connexion-{name}'))
            d['errorsAfterDialog'] = s.errors(); out[name] = d
            print(name, json.dumps({'guest': [d['guest']['rect'], d['guest']['border'], d['guest']['font'], d['guest']['radius']], 'login': d['login']['rect'],
                                    'same': d['sameSize'], 'contrast': d['guestContrast'], 'loginContrast': d['loginContrast'],
                                    'focus': [(r['id'], r['visible']) for r in rings], 'dialog': d['dialog'] and d['dialog']['radius'],
                                    'buttons': [(b['text'][:12], b['contrast'], b['clipped']) for b in d['dialogButtons'] or []], 'err': d['common']['errors'] + d['errorsAfterDialog']}, ensure_ascii=False), flush=True)
        return out
    save(RESULTS, 'arrivee', run('arrivee', body))


def awards():
    out = {}
    probe = r'''(()=>{const n=document.querySelector('.essai-awards-a-venir'),p=n&&n.querySelector('p'),i=n&&n.querySelector('svg');if(!p||!p.getClientRects().length)return null;
 const R=e=>{const r=e.getBoundingClientRect();return [+r.left.toFixed(1),+r.top.toFixed(1),+r.right.toFixed(1),+r.bottom.toFixed(1)]};const s=getComputedStyle(p),dock=document.querySelector('.dock-shell');
 const g=document.createRange();g.selectNodeContents(p);const lines=new Set([...g.getClientRects()].filter(q=>q.width>.5).map(q=>Math.round(q.top))).size;
 return {text:p.textContent,font:s.fontSize+' / '+s.lineHeight,lines,text_rect:R(p),icon:R(i),fadeEnd:parseFloat(getComputedStyle(document.getElementById('app')).getPropertyValue('--header-fade-end'))||null,
  dock:R(dock),centerOffset:+((p.getBoundingClientRect().left+p.getBoundingClientRect().right)/2-innerWidth/2).toFixed(1)}})()'''

    def body(s):
        for name, vp, theme in (('1440x900-clair', D, 'light'), ('390x844-sombre', M, 'dark')):
            fresh(s, 'awards', ALL9, theme, 'fr', vp, block_globe=True); time.sleep(2.5)
            d = {'common': s.js(COMMON), 'note': s.js(probe)}
            n = d['note']
            if n:
                fade = n['fadeEnd'] or s.js('parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-fade-end"))')
                d['belowFadeEnd'] = round(n['icon'][1] - fade, 1) if fade else None; d['aboveDock'] = round(n['dock'][1] - n['text_rect'][3], 1)
            d['shot'] = str(png(s, f'finale-awards-{name}')); out[name] = d
            print(name, json.dumps({k: d.get(k) for k in ('note', 'belowFadeEnd', 'aboveDock')}, ensure_ascii=False), d['common']['errors'], flush=True)
        return out
    save(RESULTS, 'awards', run('awards', body))


if __name__ == '__main__':
    parts = sys.argv[1:] or ['explorer', 'rubriques', 'arrivee', 'awards']
    for part in parts: print('==', part, flush=True); globals()[part]()
