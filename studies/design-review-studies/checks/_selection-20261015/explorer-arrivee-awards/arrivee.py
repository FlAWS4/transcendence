"""Selection of 15 Oct 2026, risk 4 (arrival part): Visiter / Se connecter and the arrival sign-in dialog with the
nine trials. Globe blocked (the buttons and the dialog do not depend on it); the Visiter -> globe reveal with the
real globe is checked by part 'revelation'. Subsets are obtained in the same page by switching stylesheets off:
roles-couleur, visiter-contour-sombre, lisibilite-textes and echelle-unifiee are CSS only here (no-op essai.mjs/early.js).
Run: python3 -I checks/_selection-20261015/explorer-arrivee-awards/arrivee.py [view ...|revelation]"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from commun import HERE, ALL9, D, M, S, L, run, fresh, subset, save, png, parse, pixel, contrast, clearance

RESULTS = HERE / 'results-arrivee.json'
R, V, LT, E, G = 'roles-couleur', 'visiter-contour-sombre', 'lisibilite-textes', 'echelle-unifiee', 'globe-espace-libre'
VIEWS = {
    '1440x900-clair': (D, 'light', 'fr'),
    '1440x900-sombre': (D, 'dark', 'fr'),
    '390x844-sombre': (M, 'dark', 'fr'),
    '320x640-ar-clair': (S, 'light', 'ar'),
    '667x375-sombre': (L, 'dark', 'fr'),
}
SUBSETS = {'socle': [], 'R': [R], 'V': [V], 'L': [LT], 'E': [E], 'R+V': [R, V], 'V+E': [V, E], 'R+E': [R, E], 'R+V+E': [R, V, E], 'R+V+L+E': [R, V, LT, E]}
BUTTON = r'''(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);
 const slot=e.querySelector('.entrance-action-labels');const spans=[...e.querySelectorAll('.entrance-action-measure,.entrance-action-label')];
 const inner=r.width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-parseFloat(s.borderLeftWidth)-parseFloat(s.borderRightWidth);
 return {text:(e.querySelector('.entrance-action-label')||e).textContent.trim(),lang:e.getAttribute('lang'),rect:[+r.left.toFixed(2),+r.top.toFixed(2),+r.width.toFixed(2),+r.height.toFixed(2)],
  color:s.color,bg:s.backgroundColor,border:s.borderTopColor+' '+s.borderTopWidth+' '+s.borderTopStyle,radius:s.borderTopLeftRadius,shadow:s.boxShadow,
  font:s.fontSize+' '+s.fontWeight+' '+s.lineHeight,padding:s.padding,
  widestLabel:spans.length?+Math.max(...spans.map(x=>x.getBoundingClientRect().width)).toFixed(2):null,innerWidth:+inner.toFixed(2),
  clipped:e.scrollWidth>e.clientWidth+1||(slot?slot.scrollWidth>slot.clientWidth+1:false)||(spans.length?Math.max(...spans.map(x=>x.getBoundingClientRect().width))>inner+.5:false)}})'''
DIALOG = r'''(()=>{const d=document.querySelector('#dialog[open]');if(!d)return null;const r=d.getBoundingClientRect(),s=getComputedStyle(d),t=document.getElementById('dialog-title');
 const buttons=[...d.querySelectorAll('#dialog-content>button')].map(b=>{const q=b.getBoundingClientRect(),c=getComputedStyle(b);return {text:b.textContent.trim(),cls:b.className,
  rect:[+q.left.toFixed(2),+q.top.toFixed(2),+q.width.toFixed(2),+q.height.toFixed(2)],color:c.color,bg:c.backgroundColor,border:c.borderTopColor+' '+c.borderTopWidth+' '+c.borderTopStyle,
  radius:c.borderTopLeftRadius,font:c.fontSize+' '+c.fontWeight,shadow:c.boxShadow,clipped:b.scrollWidth>b.clientWidth+1}});
 const gaps=buttons.slice(1).map((b,i)=>+(b.rect[1]-(buttons[i].rect[1]+buttons[i].rect[3])).toFixed(2));
 return {kind:d.dataset.kind,rect:[+r.left.toFixed(2),+r.top.toFixed(2),+r.width.toFixed(2),+r.height.toFixed(2)],radius:s.borderTopLeftRadius,shadow:s.boxShadow,bg:s.backgroundColor,
  title:t&&[t.textContent.trim(),getComputedStyle(t).fontSize],titleClipped:t?t.scrollWidth>t.clientWidth+1:null,buttons,verticalGaps:gaps,overflow:d.scrollHeight>d.clientHeight+1}})()'''
FOCUSED = r'''(()=>{const e=document.activeElement,s=getComputedStyle(e),r=e.getBoundingClientRect();return {id:e.id||e.className||e.tagName,focusVisible:e.matches(':focus-visible'),
 outline:s.outlineStyle+' '+s.outlineWidth+' '+s.outlineColor,offset:s.outlineOffset,rect:[r.left,r.top,r.width,r.height]}})()'''


def surface(button, page_bg):
    """Colour behind the text: the button fill, or the page when the fill is transparent."""
    bg, alpha = parse(button['bg'])
    return bg if bg and alpha == 1 else page_bg


def state(s, scale, shot=None):
    data = {'guest': s.js(BUTTON + '("#entry-guest")'), 'login': s.js(BUTTON + '("#entry-login")')}
    image = png(s, shot)
    g = data['guest']; x, y, w, h = g['rect']
    page_bg = pixel(image, x + w / 2, max(1, y - 12), scale)
    data['pageBg'] = '#%02X%02X%02X' % page_bg
    for key in ('guest', 'login'):
        b = data[key]; fg = parse(b['color'])[0]
        b['textContrast'] = round(contrast(fg, surface(b, page_bg)), 2)
    border, alpha = parse(g['border'])
    edge = pixel(image, x + w / 2, y + .5 / scale, scale)
    data['guestBoundary'] = {'edgePixel': '#%02X%02X%02X' % edge, 'paintedContrast': round(contrast(edge, page_bg), 2),
                             'computedContrast': round(contrast(border, page_bg), 2) if border and alpha > 0 else None}
    data['sameSize'] = abs(g['rect'][2] - data['login']['rect'][2]) <= .5 and abs(g['rect'][3] - data['login']['rect'][3]) <= .5
    data['overflow'] = s.js('document.documentElement.scrollWidth>innerWidth+1')
    return data, image


def tab_to(s, selector, limit=14):
    s.js('(()=>{document.activeElement?.blur();return true})()')
    for _ in range(limit):
        s.key('Tab')
        if s.js('document.activeElement?.matches(' + json.dumps(selector) + ')'): return True
    return False


def focus_ring(s, selector, scale, page_bg_hex):
    if not tab_to(s, selector): return None
    time.sleep(.3); out = s.js(FOCUSED); image = png(s)
    x, y, w, h = out['rect']; off = float(out['offset'].replace('px', '') or 0)
    ring = pixel(image, x + w / 2, y - off - 1 / scale, scale)
    bg = tuple(int(page_bg_hex[i:i + 2], 16) for i in (1, 3, 5))
    out['ringPixel'] = '#%02X%02X%02X' % ring; out['ringContrast'] = round(contrast(ring, bg), 2)
    s.blur(); return out


def view(name):
    vp, theme, lang = VIEWS[name]; scale = 2 if vp[2] else 1
    out = {'viewport': vp, 'theme': theme, 'lang': lang}

    def body(s):
        fresh(s, '', ALL9, theme, lang, vp, page='index.html', block_globe=True, settle=1.5)
        out['ALL9'], _ = state(s, scale, f'arrivee-{name}-ALL9')
        out['ALL9']['focusGuest'] = focus_ring(s, '#entry-guest', scale, out['ALL9']['pageBg'])
        out['ALL9']['focusLogin'] = focus_ring(s, '#entry-login', scale, out['ALL9']['pageBg'])
        # The labels cycle (FR -> EN -> AR): the boxes must not move while they change.
        first = out['ALL9']['guest']['text']
        s.wait(f'document.querySelector("#entry-guest .entrance-action-label")?.textContent.trim()!=={json.dumps(first)}', 10)
        later = [s.js(BUTTON + '("#entry-guest")'), s.js(BUTTON + '("#entry-login")')]
        s.wait(f'document.querySelector("#entry-guest .entrance-action-label")?.textContent.trim()!=={json.dumps(later[0]["text"])}', 10)
        third = [s.js(BUTTON + '("#entry-guest")'), s.js(BUTTON + '("#entry-login")')]
        out['ALL9']['cycle'] = [[b['text'], b['rect'], b['clipped']] for b in later + third]
        for key, ids in SUBSETS.items():
            subset(s, ids)
            out[key], _ = state(s, scale, f'arrivee-{name}-{key}' if key in ('socle',) else None)
        subset(s, ALL9)
        # Sign-in dialog of the arrival.
        s.click('#entry-login'); s.wait('Boolean(document.querySelector("#dialog[open][data-kind=login]"))', 10); time.sleep(.8)
        dialogs = {}
        for key, ids in (('ALL9', ALL9), ('socle', []), ('R', [R]), ('E', [E]), ('L', [LT]), ('R+E', [R, E]), ('R+L+E', [R, LT, E])):
            subset(s, ids); time.sleep(.3)
            d = s.js(DIALOG); image = png(s, f'connexion-{name}-{key}' if key in ('ALL9', 'socle') else None)
            if d:
                dbg = parse(d['bg'])[0]
                for b in d['buttons']:
                    fill, alpha = parse(b['bg'])
                    b['textContrast'] = round(contrast(parse(b['color'])[0], fill if alpha == 1 else dbg), 2) if dbg else None
                    bc, ba = parse(b['border'])
                    b['borderContrastOnDialog'] = round(contrast(bc, dbg), 2) if bc and dbg and ba > 0 else None
            dialogs[key] = d
        subset(s, ALL9)
        # Keyboard focus inside the dialog (both buttons).
        foc = []
        for sel in ('#dialog[open] #dialog-content>button:first-of-type', '#dialog[open] #dialog-content>button:last-of-type'):
            s.js('(sel=>{document.querySelector(sel)?.focus({focusVisible:true});return true})(' + json.dumps(sel) + ')'); time.sleep(.2)
            foc.append(s.js(FOCUSED))
        dialogs['focus'] = foc
        out['dialog'] = dialogs
        out['errors'] = s.errors()
    run(name, body)
    save(RESULTS, name, out)
    a = out['ALL9']
    print(name, json.dumps({'sameSize': a['sameSize'], 'guest': a['guest']['rect'], 'login': a['login']['rect'], 'contrast': [a['guest']['textContrast'], a['login']['textContrast']],
                            'boundary': a['guestBoundary'], 'font': a['guest']['font'], 'radius': a['guest']['radius'], 'clipped': [a['guest']['clipped'], a['login']['clipped']],
                            'errors': out['errors']}, ensure_ascii=False), flush=True)


MEASURE = r'''(()=>{const g=window.horizonStudy?.globe?.getWorldScreenGeometry?.()||null;
 const box=sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect(),s=getComputedStyle(e);
  return {left:b.left,top:b.top,right:b.right,bottom:b.bottom,shown:s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0};};
 return {vw:innerWidth,vh:innerHeight,geometry:g,filter:box('#scope-path'),stats:box('#globe-hint'),status:box('#about'),search:box('.dock-search-toggle'),dice:box('#random-campus'),
  entry:document.body.dataset.entry,errors:window.qaErrors||[]}})()'''


def revelation():
    """Real globe: Visiter on the arrival with the nine trials, then the fitted world disc after the reveal (1440x900 light FR)."""
    out = {}

    def body(s):
        fresh(s, '', ALL9, 'light', 'fr', D, page='index.html', block_globe=False, settle=1.5)
        s.click('#entry-guest')
        ok = s.wait('document.body.dataset.entry==="welcome"', 90)
        s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(1.5)
        data = s.js(MEASURE); png(s, 'revelation-1440x900-ALL9')
        data['clearance'] = {k: clearance(data['geometry'], data[k]) for k in ('filter', 'stats', 'status', 'search', 'dice')}
        data['welcome'] = ok; data['errors'] = s.errors(); out['ALL9'] = data
    run('revelation', body)
    save(RESULTS, 'revelation', out)
    print('revelation', json.dumps({'r': out['ALL9']['geometry'] and out['ALL9']['geometry']['radius'], 'clear': out['ALL9']['clearance'], 'welcome': out['ALL9']['welcome'], 'errors': out['ALL9']['errors']}), flush=True)


if __name__ == '__main__':
    for name in sys.argv[1:] or list(VIEWS) + ['revelation']:
        print('==', name, flush=True)
        revelation() if name == 'revelation' else view(name)
