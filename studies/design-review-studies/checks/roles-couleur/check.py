"""Essai roles-couleur: colour inventory of primary/secondary actions, light/dark, FR (desktop) and AR (mobile).
Run: python3 -I studies/design-review-studies/checks/roles-couleur/check.py"""
import base64, collections, io, json, re, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, contrast

ID = 'roles-couleur'
PROJECT, PROFILE = 'projects/ft-transcendence-building-together', 'people/profile-leila-mansour'
ERRORS = 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'
INSPECT = '''(sel=>{const e=document.querySelector(sel);if(!e)return null;e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect(),s=getComputedStyle(e);
 return {text:e.textContent.replace(/\\s+/g," ").trim().slice(0,60),rect:[r.left,r.top,r.right,r.bottom],disabled:e.disabled===true,
  color:s.color,bg:s.backgroundColor,border:s.borderTopColor,borderWidth:s.borderTopWidth,borderStyle:s.borderTopStyle,shadow:s.boxShadow,
  radius:s.borderTopLeftRadius,padding:s.padding,font:s.fontSize+" "+s.fontWeight,size:[Math.round(r.width*100)/100,Math.round(r.height*100)/100]}})'''
FOCUS = '''(sel=>{const e=document.querySelector(sel);if(!e)return null;e.focus({focusVisible:true});const s=getComputedStyle(e);
 const out={focusVisible:e.matches(":focus-visible"),outline:s.outlineStyle+" "+s.outlineWidth+" "+s.outlineColor,offset:s.outlineOffset};e.blur();return out})'''
SELECTED = '''(()=>Object.fromEntries([".main-nav button[aria-current]",".cp-project-sidebar-nav a[aria-current]",".cp-profile-sidebar-nav a[aria-current]"].map(q=>{const e=document.querySelector(q);if(!e)return [q,null];const s=getComputedStyle(e);return [q,[s.color,s.backgroundColor,s.boxShadow].join(" | ")]})))()'''
# state -> how to open it, then (role, label, selector)
STATES = {
 'filtre': [('primaire', 'Appliquer', '.cp-project-filter-dialog[open] .cp-project-filter-apply'), ('secondaire', 'Annuler', '.cp-project-filter-dialog[open] .cp-project-filter-cancel'), ('secondaire', 'Réinitialiser', '.cp-project-filter-dialog[open] .cp-project-filter-reset')],
 'commentaires': [('primaire', 'Ajouter', '.cp-comments-form:not(.cp-comments-reply-form):not(.cp-comments-edit-form) .cp-comments-submit'), ('secondaire', 'Emoji', '.cp-comments-form .cp-comments-emoji-toggle')],
 'signalement': [('primaire', 'Enregistrer le signalement', '.cp-report-dialog[open] .cp-report-submit'), ('secondaire', 'Annuler', '.cp-report-dialog[open] .cp-report-cancel')],
 'depot': [('primaire', 'Enregistrer', '.cp-project-repository-actions button[type=submit]'), ('secondaire', 'Annuler', '.cp-project-repository-actions button[type=button]')],
 'message': [('primaire', 'Envoyer', '.cp-profile-message-dialog[open] .cp-profile-message-send'), ('secondaire', 'Annuler', '.cp-profile-message-dialog[open] .cp-profile-message-cancel')],
 'connexion': [('primaire', 'Continuer avec le profil', '#dialog[open][data-kind=login] #dialog-content>button:first-of-type'), ('secondaire', 'Annuler', '#dialog[open][data-kind=login] #dialog-content>button:last-of-type')],
 'inscription': [('primaire', 'Simuler la création du compte', '#dialog[open][data-kind=signup] #dialog-content>button:first-of-type'), ('secondaire', 'Annuler', '#dialog[open][data-kind=signup] #dialog-content>button:last-of-type')],
 'connexion-arrivee': [('primaire', 'Simuler une connexion réussie (arrivée)', '#dialog[open][data-kind=login] #dialog-content>button:first-of-type'), ('secondaire', 'Annuler (arrivée)', '#dialog[open][data-kind=login] #dialog-content>button:last-of-type')],
}
COMBOS = [('ordinateur', D, 'light', 'fr'), ('sombre-ordinateur', D, 'dark', 'fr'), ('ar-mobile', M, 'light', 'ar'), ('sombre-ar-mobile', M, 'dark', 'ar')]
KEEP = {('filtre', 'ordinateur'), ('filtre', 'sombre-ordinateur'), ('commentaires', 'sombre-ordinateur'), ('signalement', 'sombre-ar-mobile'),
        ('depot', 'ordinateur'), ('message', 'ar-mobile'), ('inscription', 'sombre-ordinateur'), ('connexion', 'sombre-ordinateur'),
        ('connexion-arrivee', 'sombre-ordinateur'), ('connexion-arrivee', 'sombre-ar-mobile')}


def png(s, name=None):
    data = base64.b64decode(s.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=60)['data'])
    if name: (HERE / (name + '.png')).write_bytes(data)
    return data


def parse(value):
    """rgb()/rgba()/color(srgb ...) -> ((r,g,b), alpha)."""
    if not value: return None
    m = re.match(r'rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)', value)
    if m: return tuple(round(float(m.group(i))) for i in (1, 2, 3)), float(m.group(4) or 1)
    m = re.match(r'color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: / ([\d.]+))?\)', value)
    if m: return tuple(round(float(m.group(i)) * 255) for i in (1, 2, 3)), float(m.group(4) or 1)
    return None


def dominant(data, rect, scale, inset=4, ring=0):
    """Most frequent colour inside the rect (inset), or in a ring around it."""
    from PIL import Image
    import numpy as np
    img = np.asarray(Image.open(io.BytesIO(data)).convert('RGB'))
    h, w = img.shape[:2]
    x0, y0, x1, y1 = [int(v * scale) for v in rect]
    if ring:
        r = int(ring * scale); box = img[max(0, y0 - r):min(h, y1 + r), max(0, x0 - r):min(w, x1 + r)].reshape(-1, 3)
        inner = set(); pixels = []
        for yy in range(max(0, y0 - r), min(h, y1 + r)):
            for xx in (list(range(max(0, x0 - r), max(0, x0 - r // 2))) + list(range(min(w, x1 + r // 2), min(w, x1 + r)))):
                pixels.append(tuple(img[yy, xx]))
        box = np.array(pixels) if pixels else box
    else:
        i = int(inset * scale); box = img[y0 + i:max(y0 + i + 1, y1 - i), x0 + i:max(x0 + i + 1, x1 - i)].reshape(-1, 3)
    if not len(box): return None
    counts = collections.Counter(map(tuple, (box // 4) * 4))
    key = counts.most_common(1)[0][0]
    sel = box[((box // 4) * 4 == key).all(axis=1)]
    return tuple(int(v) for v in sel.mean(axis=0))


def fresh(s, route, essais, theme, lang, vp, page='content-preview.html'):
    """New tab per view, previous tab closed (a reused tab keeps old documents alive)."""
    c = s.c; c.session = None
    target = c.call('Target.createTarget', {'url': 'about:blank'})['targetId']
    session = c.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
    for info in c.call('Target.getTargets')['targetInfos']:
        if info['type'] == 'page' and info['targetId'] != target: c.call('Target.closeTarget', {'targetId': info['targetId']})
    c.session = session
    c.call('Page.enable'); c.call('Page.bringToFront'); c.call('Emulation.setFocusEmulationEnabled', {'enabled': True})
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': ERRORS}); c.call('Network.enable'); s.reduced(True)
    s.open(route, essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True, page=page)


def goto(s, route, ready, essais, theme, lang, vp):
    s.js('(()=>{history.pushState(null,"","#' + route + '");dispatchEvent(new PopStateEvent("popstate"));return true})()')
    if not s.wait(ready, 8): fresh(s, route, essais, theme, lang, vp); s.wait(ready, 8)
    s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.6)


def hover(s, sel):
    r = s.js(INSPECT + '(' + json.dumps(sel) + ')')
    if not r: return None
    x, y = (r['rect'][0] + r['rect'][2]) / 2, (r['rect'][1] + r['rect'][3]) / 2
    s.c.call('Input.dispatchMouseEvent', {'type': 'mouseMoved', 'x': x, 'y': y}); time.sleep(.35)
    out = s.js(INSPECT + '(' + json.dumps(sel) + ')'); s.away(); return out


def measure(s, state, vue, label, results, scale):
    shot = png(s, f'{label}-{state}-{vue}' if (state, vue) in KEEP else None)
    for role, name, sel in STATES[state]:
        item = s.js(INSPECT + '(' + json.dumps(sel) + ')')
        if item:
            text = parse(item['color']); seen = dominant(shot, item['rect'], scale)
            around = dominant(shot, item['rect'], scale, ring=10)
            item['pixelBackground'] = '#%02X%02X%02X' % seen if seen else None
            item['textContrast'] = round(contrast(text[0], seen), 2) if text and seen else None
            item['surround'] = '#%02X%02X%02X' % around if around else None
            if role == 'primaire':
                hov = hover(s, sel); item['hover'] = {'bg': hov['bg'], 'color': hov['color']} if hov else None
                hb, hc = (parse(hov['bg']), parse(hov['color'])) if hov else (None, None)
                item['hoverContrast'] = round(contrast(hc[0], hb[0]), 2) if hb and hc and hb[1] == 1 else None
            item['focus'] = s.js(FOCUS + '(' + json.dumps(sel) + ')')
        results['items'].append({'etat': state, 'vue': vue, 'role': role, 'bouton': name, 'selecteur': sel, 'essai': label, 'mesure': item})


def run_content(results, label, essais, vue, vp, theme, lang):
    s = Session(HERE); scale = 2 if vp[2] else 1
    try:
        fresh(s, 'projects', essais, theme, lang, vp)
        s.click('#content-category-button'); s.wait('Boolean(document.querySelector("dialog.cp-project-filter-dialog[open]"))', 8); time.sleep(.5)
        measure(s, 'filtre', vue, label, results, scale); s.key('Escape'); time.sleep(.4)
        goto(s, PROJECT + '?tab=comments', 'Boolean(document.querySelector(".cp-comments-submit"))', essais, theme, lang, vp)
        s.js('(()=>{document.querySelector(".cp-comments-submit").scrollIntoView({block:"center"});return true})()'); time.sleep(.6)
        measure(s, 'commentaires', vue, label, results, scale)
        results['selected'].append({'essai': label, 'vue': vue, 'styles': s.js(SELECTED)})
        s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.5)
        s.click('.cp-project-actions .cp-report-trigger'); s.wait('Boolean(document.querySelector("dialog.cp-report-dialog[open]"))', 8); time.sleep(.5)
        measure(s, 'signalement', vue, label, results, scale); s.key('Escape'); time.sleep(.4)
        goto(s, PROJECT + '?tab=test', 'Boolean(document.querySelector(".cp-project-repository-edit"))', essais, theme, lang, vp)
        s.click('.cp-project-repository-edit'); s.wait('Boolean(document.querySelector(".cp-project-repository-form"))', 8)
        s.js('(()=>{document.querySelector(".cp-project-repository-actions").scrollIntoView({block:"center"});return true})()'); time.sleep(.6)
        measure(s, 'depot', vue, label, results, scale)
        goto(s, PROFILE, 'Boolean(document.querySelector(".cp-profile-message"))', essais, theme, lang, vp)
        results['selected'].append({'essai': label, 'vue': vue + '-profil', 'styles': s.js(SELECTED)})
        s.click('.cp-profile-message'); s.wait('Boolean(document.querySelector("dialog.cp-profile-message-dialog[open]"))', 8); time.sleep(.5)
        measure(s, 'message', vue, label, results, scale); s.key('Escape'); time.sleep(.4)
        for state, action, kind in (('connexion', 'signin', 'login'), ('inscription', 'signup', 'signup')):
            s.click('#profile'); s.click(f'[data-account-action={action}]')
            s.wait(f'Boolean(document.querySelector("#dialog[open][data-kind={kind}]"))', 8); time.sleep(.5)
            measure(s, state, vue, label, results, scale); s.key('Escape'); time.sleep(.4)
        results['errors'][f'{label}-{vue}'] = s.errors(); results['overflow'][f'{label}-{vue}'] = s.overflow()
    finally:
        s.close()


def run_arrival(results):
    s = Session(HERE)
    try:
        for vue, vp, theme, lang in COMBOS:
            for label, essais in (('avant', []), ('apres', [ID])):
                fresh(s, '', essais, theme, lang, vp, page='index.html'); time.sleep(.5)
                s.click('#entry-login'); s.wait('Boolean(document.querySelector("#dialog[open][data-kind=login]"))', 8); time.sleep(.6)
                measure(s, 'connexion-arrivee', vue, label, results, 2 if vp[2] else 1)
                results['errors'][f'arrivee-{label}-{vue}'] = s.errors()
    finally:
        s.close()


def summarize(results):
    table = collections.OrderedDict()
    for row in results['items']:
        key = (row['etat'], row['vue'], row['bouton'])
        table.setdefault(key, {'etat': row['etat'], 'vue': row['vue'], 'role': row['role'], 'bouton': row['bouton'], 'selecteur': row['selecteur']})
        m = row['mesure']
        table[key][row['essai']] = None if not m else {'texte': m['text'], 'fond': m['bg'], 'fondVu': m['pixelBackground'], 'couleur': m['color'],
            'bordure': m['border'] + ' ' + m['borderWidth'] + ' ' + m['borderStyle'], 'ombre': m['shadow'], 'contraste': m['textContrast'],
            'survol': m.get('hover'), 'contrasteSurvol': m.get('hoverContrast'), 'focus': m['focus'], 'taille': m['size'], 'rayon': m['radius'], 'padding': m['padding'], 'desactive': m['disabled']}
    return list(table.values())


results = {'essai': ID, 'items': [], 'selected': [], 'errors': {}, 'overflow': {}, 'passed': False}
try:
    jobs = [(run_content, (label, essais, vue, vp, theme, lang)) for vue, vp, theme, lang in COMBOS for label, essais in (('avant', []), ('apres', [ID]))] + [(run_arrival, ())]
    for job, args in jobs:
        try:
            job(results, *args)
        except (TimeoutError, RuntimeError) as error:
            print('retrying', job.__name__, args[:1], 'once:', error, flush=True)
            results.setdefault('retried', []).append([job.__name__, list(map(str, args[:3]))])
            keep = [r for r in results['items'] if not (job is run_arrival and r['etat'] == 'connexion-arrivee') and not (job is run_content and r['essai'] == args[0] and r['vue'] == args[2])]
            results['items'] = keep; job(results, *args)
        print('done', job.__name__, args[:3], flush=True)
finally:
    rows = summarize(results); results['inventaire'] = rows
    after = [r for r in rows if r.get('apres')]
    accent = {'light': (0, 186, 188), 'dark': (237, 52, 145)}
    def theme_of(vue): return 'dark' if 'sombre' in vue else 'light'
    def same_geometry(r): return r.get('avant') and r.get('apres') and all(r['avant'][k] == r['apres'][k] for k in ('taille', 'rayon', 'padding')) and r['avant']['bordure'].split(' ')[-2:] == r['apres']['bordure'].split(' ')[-2:]
    prim = [r for r in after if r['role'] == 'primaire']
    results['checks'] = {
        'allStatesFound': len(rows) == sum(len(v) for v in STATES.values()) * len(COMBOS) and all(r.get('avant') and r.get('apres') for r in rows),
        'primaryAccent': bool(prim) and all(parse(r['apres']['fond'])[0] == accent[theme_of(r['vue'])] and parse(r['apres']['couleur'])[0] == (27, 27, 27) for r in prim),
        'primaryHoverKept': bool(prim) and all((r['apres']['survol'] or {}).get('bg') == r['apres']['fond'] for r in prim),
        'textContrastAtLeast45': bool(after) and all((r['apres']['contraste'] or 0) >= 4.5 for r in after if not r['apres']['desactive']),
        'focusVisible': bool(after) and all(r['apres']['focus'] and r['apres']['focus']['focusVisible'] and 'solid' in r['apres']['focus']['outline'] for r in after),
        'geometryUnchanged': bool(rows) and all(same_geometry(r) for r in rows),
        'selectedUnchanged': all(a['styles'] == b['styles'] for a in results['selected'] if a['essai'] == 'avant' for b in results['selected'] if b['essai'] == 'apres' and b['vue'] == a['vue']),
        'noOverflow': not any(results['overflow'].values()),
        'noErrors': not any(results['errors'].values()),
    }
    results['passed'] = all(results['checks'].values())
    (HERE / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    # Readable inventory: one line per button and view (painted background = colour seen behind the text).
    import csv
    with open(HERE / 'inventaire.csv', 'w', newline='', encoding='utf-8') as handle:
        out = csv.writer(handle)
        out.writerow(['état', 'vue', 'rôle', 'bouton', 'texte mesuré', 'sélecteur', 'avant fond', 'avant texte', 'avant contraste', 'après fond', 'après texte', 'après contraste', 'après survol', 'focus visible'])
        for r in rows:
            a, b = r.get('avant') or {}, r.get('apres') or {}
            out.writerow([r['etat'], r['vue'], r['role'], r['bouton'], b.get('texte'), r['selecteur'], a.get('fondVu'), a.get('couleur'), a.get('contraste'),
                          b.get('fondVu'), b.get('couleur'), b.get('contraste'), (b.get('survol') or {}).get('bg', ''), bool(b.get('focus') and b['focus']['focusVisible'])])
    print('passed', results['passed'], results['checks'])
