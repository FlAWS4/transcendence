"""Risk 4 outside the arrival: buttons of the filter dialog, account menu and its sign-in / sign-up
dialogs, comment form (and emoji palette), report dialog, repository-link form, message composer.

python3 -I dialogues.py [mesure]
For 4 screens (desktop light FR, desktop dark FR, 390 px dark AR, 320 px light AR), baseline and the
nine trials, fresh loads: each button's painted background and text contrast (screenshot pixels),
size, radius, shadow, font size, label clipping, focus ring; detectors of the echelle-unifiee checker
restricted to the open surface; in the combination, the same properties read with each trial sheet
alone (TOGGLE_JS), so every property is traced to the trial that sets it.
Results: dialogues.json; screenshots in shots/.
"""
import base64, collections, io, json, re, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import *  # noqa: F401,F403

SHOTS = HERE / 'shots'
PROJECT = f'projects/{PID}'
SCREENS = [('ordinateur', D, 'light', 'fr'), ('ordinateur-sombre', D, 'dark', 'fr'), ('mobile-sombre-ar', M, 'dark', 'ar'), ('petit-ar', S, 'light', 'ar')]
MAIN = '.cp-comments-form:not(.cp-comments-reply-form):not(.cp-comments-edit-form)'
SURFACES = {  # state -> (scope selector, [(button, selector)])
    'filtre': ('.cp-project-filter-dialog[open]', [('Appliquer', '.cp-project-filter-dialog[open] .cp-project-filter-apply'), ('Annuler', '.cp-project-filter-dialog[open] .cp-project-filter-cancel'),
               ('Réinitialiser', '.cp-project-filter-dialog[open] .cp-project-filter-reset'), ('Tout sélectionner', '.cp-project-filter-dialog[open] .cp-project-filter-all'),
               ('Fermer (croix)', '.cp-project-filter-dialog[open] .cp-project-filter-close')]),
    'compte': ('#account-menu', [('Se connecter', '#account-menu [data-account-action=signin]'), ('Créer un compte', '#account-menu [data-account-action=signup]')]),
    'connexion': ('#dialog[open]', [('Continuer (connexion)', '#dialog[open][data-kind=login] #dialog-content>button:first-of-type'), ('Annuler (connexion)', '#dialog[open][data-kind=login] #dialog-content>button:last-of-type'), ('Fermer (connexion)', '#dialog[open] #close-dialog')]),
    'inscription': ('#dialog[open]', [('Simuler la création', '#dialog[open][data-kind=signup] #dialog-content>button:first-of-type'), ('Annuler (inscription)', '#dialog[open][data-kind=signup] #dialog-content>button:last-of-type'), ('Fermer (inscription)', '#dialog[open] #close-dialog')]),
    'commentaires': (MAIN, [('Ajouter', MAIN + ' .cp-comments-submit'), ('Emoji', MAIN + ' .cp-comments-emoji-toggle')]),
    'emoji': (MAIN + ' .cp-comments-emoji-palette', [('Premier emoji', MAIN + ' .cp-comments-emoji-palette .cp-comments-emoji-choice')]),
    'signalement': ('.cp-report-dialog[open]', [('Enregistrer le signalement', '.cp-report-dialog[open] .cp-report-submit'), ('Annuler (signalement)', '.cp-report-dialog[open] .cp-report-cancel')]),
    'depot': ('.cp-project-repository-form', [('Enregistrer (dépôt)', '.cp-project-repository-actions button[type=submit]'), ('Annuler (dépôt)', '.cp-project-repository-actions button[type=button]')]),
    'message': ('.cp-profile-message-dialog[open]', [('Envoyer', '.cp-profile-message-dialog[open] .cp-profile-message-send'), ('Annuler (message)', '.cp-profile-message-dialog[open] .cp-profile-message-cancel')]),
}
GEOM_KEYS = ['w', 'h', 'fs', 'lh', 'radius', 'bg', 'color', 'border', 'shadow', 'pad']
SURFACE_KEYS = ['radius', 'shadow', 'bg', 'border']


def parse(value):
    if not value: return None
    m = re.match(r'rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)', value)
    if m: return tuple(round(float(m.group(i))) for i in (1, 2, 3)), float(m.group(4) or 1)
    m = re.match(r'color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: / ([\d.]+))?\)', value)
    if m: return tuple(round(float(m.group(i)) * 255) for i in (1, 2, 3)), float(m.group(4) or 1)
    return None


def dominant(img, rect, scale, inset=4, ring=0):
    """Most frequent colour inside the rect (inset), or in a ring just outside it."""
    import numpy as np
    h, w = img.shape[:2]
    x0, y0, x1, y1 = [int(round(v * scale)) for v in rect]
    if ring:
        r = int(ring * scale)
        parts = [img[max(0, y0 - r):max(0, y0 - 1), max(0, x0):min(w, x1)], img[min(h, y1 + 1):min(h, y1 + r), max(0, x0):min(w, x1)],
                 img[max(0, y0):min(h, y1), max(0, x0 - r):max(0, x0 - 1)], img[max(0, y0):min(h, y1), min(w, x1 + 1):min(w, x1 + r)]]
        box = np.concatenate([p.reshape(-1, 3) for p in parts if p.size]) if any(p.size for p in parts) else None
    else:
        i = int(inset * scale); box = img[max(0, y0 + i):max(y0 + i + 1, y1 - i), max(0, x0 + i):max(x0 + i + 1, x1 - i)].reshape(-1, 3)
    if box is None or not len(box): return None
    counts = collections.Counter(map(tuple, (box // 4) * 4))
    key = counts.most_common(1)[0][0]
    sel = box[((box // 4) * 4 == key).all(axis=1)]
    return tuple(int(v) for v in sel.mean(axis=0))


def geom_src(items):
    return ('()=>' + json.dumps([sel for _, sel in items]) + '.map(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);'
            'return{w:+r.width.toFixed(2),h:+r.height.toFixed(2),fs:s.fontSize,lh:s.lineHeight,radius:s.borderTopLeftRadius+" "+s.borderBottomRightRadius,bg:s.backgroundColor,color:s.color,'
            'border:s.borderTopColor+" "+s.borderTopWidth,shadow:s.boxShadow,pad:s.padding}})')


def surface_src(scope):
    return ('()=>{const e=document.querySelector(' + json.dumps(scope) + ');if(!e)return [null];const s=getComputedStyle(e),r=e.getBoundingClientRect();'
            'return [{radius:s.borderTopLeftRadius,shadow:s.boxShadow,bg:s.backgroundColor,border:s.borderTopColor+" "+s.borderTopWidth,w:+r.width.toFixed(1),h:+r.height.toFixed(1)}]}')


def measure_state(s, state, label, screen, scale, keep_shot=True):
    from PIL import Image
    import numpy as np
    scope, items = SURFACES[state]
    s.away(); time.sleep(.3)
    data = base64.b64decode(s.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=60)['data'])
    if keep_shot: (SHOTS / f'dialogue-{state}-{screen}-{label}.png').write_bytes(data)
    img = np.asarray(Image.open(io.BytesIO(data)).convert('RGB'))
    buttons = s.js(BUTTONS_JS + '(' + json.dumps(items, ensure_ascii=False) + ')', 30)
    for b in buttons:
        if not b.get('found'): continue
        fg = parse(b['color']); seen = dominant(img, b['rect'], scale)
        b['fondPeint'] = '#%02X%02X%02X' % seen if seen else None
        b['contraste'] = round(contrast(fg[0], seen), 2) if fg and seen else None
        around = dominant(img, b['rect'], scale, ring=8)
        border = parse(b['border'].split(' ')[0] if b['border'].startswith('#') else re.match(r'(rgba?\([^)]*\)|color\([^)]*\))', b['border']).group(1))
        b['autour'] = '#%02X%02X%02X' % around if around else None
        b['contrasteBordure'] = round(contrast(border[0], around), 2) if border and around and border[1] > 0 else None
    s.js('(()=>{window.__qaScope=document.querySelector(' + json.dumps(scope) + ');return true})()')
    out = {'boutons': buttons, 'surface': s.js(surface_src(scope).replace('()=>', '(()=>') + ')()'),
           'clips': s.js(CLIP_SCOPED, 30), 'shapes': s.js(SHAPE_SCOPED, 30), 'spill': s.js(SPILL_SCOPED, 40)}
    s.js('(()=>{window.__qaScope=null;return true})()')
    if label == 'combo':
        out['toggle'] = {'boutons': toggle(s, geom_src(items)), 'surface': toggle(s, surface_src(scope))}
        out['cascade'] = s.js(CASCADE_JS + f'({json.dumps(ALL9)},{json.dumps(CASCADE_PROPS)},{json.dumps(scope + ", " + scope + " *")})', 60)
    return out


store = Store('dialogues')
MENU_OPEN = '(()=>{const m=document.querySelector("#account-menu");return Boolean(m&&!m.hidden&&m.getClientRects().length)})()'


def wait_open(s, expr, what):
    if not s.wait(expr, 8): raise RuntimeError('not open: ' + what)
    time.sleep(.5)


def group_job(screen, label, essais, group):
    name, vp, theme, lang = screen
    scale = 2 if vp[2] else 1
    def run(s):
        entry = store.data.setdefault(name, {})
        done = entry.get(label, {})
        states = {'projets': ['filtre', 'compte', 'connexion', 'inscription'], 'fiche': ['commentaires', 'emoji', 'signalement'], 'depot': ['depot'], 'message': ['message']}[group]
        if all(st in done for st in states): return
        res = {}
        if group == 'projets':
            load(s, 'projects', essais, theme, lang, vp)
            s.click('#content-category-button'); wait_open(s, 'Boolean(document.querySelector("dialog.cp-project-filter-dialog[open]"))', 'filtre')
            res['filtre'] = measure_state(s, 'filtre', label, name, scale); s.key('Escape'); time.sleep(.5)
            s.click('#profile'); wait_open(s, MENU_OPEN, 'compte')
            res['compte'] = measure_state(s, 'compte', label, name, scale)
            if not s.js(MENU_OPEN): s.click('#profile'); wait_open(s, MENU_OPEN, 'compte (réouvert)')
            s.click('#account-menu [data-account-action=signin]'); wait_open(s, 'Boolean(document.querySelector("#dialog[open][data-kind=login]"))', 'connexion')
            res['connexion'] = measure_state(s, 'connexion', label, name, scale); s.key('Escape'); time.sleep(.5)
            s.click('#profile'); wait_open(s, MENU_OPEN, 'compte (inscription)'); s.click('#account-menu [data-account-action=signup]'); wait_open(s, 'Boolean(document.querySelector("#dialog[open][data-kind=signup]"))', 'inscription')
            res['inscription'] = measure_state(s, 'inscription', label, name, scale); s.key('Escape'); time.sleep(.5)
        elif group == 'fiche':
            load(s, PROJECT + '?tab=comments', essais, theme, lang, vp)
            s.wait('Boolean(document.querySelector(' + json.dumps(MAIN + ' .cp-comments-submit') + '))', 10)
            s.js('(()=>{document.querySelector(' + json.dumps(MAIN + ' .cp-comments-submit') + ').scrollIntoView({block:"center"});return true})()'); time.sleep(.8)
            res['commentaires'] = measure_state(s, 'commentaires', label, name, scale)
            s.click(MAIN + ' .cp-comments-emoji-toggle'); time.sleep(.6)
            if s.js('(()=>{const p=document.querySelector(' + json.dumps(MAIN + ' .cp-comments-emoji-palette') + ');return Boolean(p&&p.getClientRects().length&&getComputedStyle(p).visibility!=="hidden")})()'):
                res['emoji'] = measure_state(s, 'emoji', label, name, scale)
            else:
                res['emoji'] = {'absent': True}
            s.key('Escape'); time.sleep(.4)
            s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.6)
            s.click('.cp-project-actions .cp-report-trigger'); wait_open(s, 'Boolean(document.querySelector("dialog.cp-report-dialog[open]"))', 'signalement')
            res['signalement'] = measure_state(s, 'signalement', label, name, scale); s.key('Escape'); time.sleep(.4)
        elif group == 'depot':
            load(s, PROJECT + '?tab=test', essais, theme, lang, vp)
            s.wait('Boolean(document.querySelector(".cp-project-repository-edit"))', 10)
            s.click('.cp-project-repository-edit'); wait_open(s, 'Boolean(document.querySelector(".cp-project-repository-form"))', 'depot')
            s.js('(()=>{document.querySelector(".cp-project-repository-actions").scrollIntoView({block:"center"});return true})()'); time.sleep(.8)
            res['depot'] = measure_state(s, 'depot', label, name, scale)
        elif group == 'message':
            load(s, f'people/{LEILA}', essais, theme, lang, vp)
            s.wait('Boolean(document.querySelector("#profile-detail .cp-profile-message"))', 10)
            s.click('#profile-detail .cp-profile-message'); wait_open(s, 'Boolean(document.querySelector("dialog.cp-profile-message-dialog[open]"))', 'message')
            res['message'] = measure_state(s, 'message', label, name, scale); s.key('Escape'); time.sleep(.4)
        res_errors = s.errors()
        entry.setdefault(label, {}).update(res)
        entry[label].setdefault('erreurs', {})[group] = res_errors
        entry[label].setdefault('debordement', {})[group] = s.overflow()
        store.save()
        print(name, label, group, 'ok', flush=True)
    return run


def analyse():
    bilan = {}
    for name, vp, theme, lang in SCREENS:
        e = store.data.get(name, {})
        if 'base' not in e or 'combo' not in e: continue
        rows = []
        for state, (scope, items) in SURFACES.items():
            b, c = e['base'].get(state), e['combo'].get(state)
            if not b or not c or b.get('absent') or c.get('absent'): continue
            trace = owners(c['toggle']['boutons'], GEOM_KEYS)
            for i, (btn, sel) in enumerate(items):
                cb, bb = c['boutons'][i], b['boutons'][i]
                if not cb.get('found'): rows.append({'etat': state, 'bouton': btn, 'absent': True}); continue
                t = [r for r in trace if r['i'] == i]
                rows.append({'etat': state, 'bouton': btn, 'texte': cb['text'],
                             'base': {k: bb.get(k) for k in ('w', 'h', 'fs', 'radius', 'bg', 'color', 'fondPeint', 'contraste', 'contrasteBordure', 'labelLines', 'shadow')},
                             'combo': {k: cb.get(k) for k in ('w', 'h', 'fs', 'radius', 'bg', 'color', 'fondPeint', 'contraste', 'contrasteBordure', 'labelLines', 'shadow', 'border')},
                             'coupe': bool(cb['overflowX'] or cb['textOut'] > 1 or cb['clippedBy']), 'lignes': [bb['labelLines'], cb['labelLines']],
                             'focus': cb['focus'], 'tracage': {r['p']: {k: r[k] for k in ('etat', 'par', 'seuls', 'base', 'combo')} for r in t if r['etat'] != 'inchangé'}})
            st = owners(c['toggle']['surface'], SURFACE_KEYS)
            rows.append({'etat': state, 'surface': True, 'tracage': {r['p']: {k: r[k] for k in ('etat', 'par', 'seuls', 'base', 'combo')} for r in st if r['etat'] != 'inchangé'},
                         'nouveaux': {'clips': [x for x in c['clips'] if (x['k'], x['t']) not in {(y['k'], y['t']) for y in b['clips']}],
                                      'boxClips': [x for x in c['shapes']['boxClips'] if (x['k'], x['t']) not in {(y['k'], y['t']) for y in b['shapes']['boxClips']}],
                                      'spills': [x for x in c['spill']['spills'] if (x['k'], x['a'], x['t']) not in {(y['k'], y['a'], y['t']) for y in b['spill']['spills']}],
                                      'collisions': [x for x in c['spill']['collisions'] if (x['a'], x['b'], x['ta'], x['tb']) not in {(y['a'], y['b'], y['ta'], y['tb']) for y in b['spill']['collisions']}]},
                         'cascade': {'changes': c['cascade']['changed'], 'gardes': c['cascade']['kept'], 'surcharges': c['cascade']['issues'][:20], 'plusieurs': [{k: m[k] for k in ('p', 'by', 'vals', 'base', 'combo', 'n', 'sample')} for m in c['cascade']['multi'][:20]]}})
        bilan[name] = {'lignes': rows, 'erreurs': e['combo'].get('erreurs'), 'debordement': e['combo'].get('debordement')}
    store.put('bilan', bilan)
    return bilan


if __name__ == '__main__':
    phase = sys.argv[1] if len(sys.argv) > 1 else 'mesure'
    if phase == 'mesure':
        jobs = [group_job(screen, label, essais, group) for screen in SCREENS for label, essais in (('base', []), ('combo', ALL9)) for group in ('projets', 'fiche', 'depot', 'message')]
        run_jobs(jobs, SHOTS, per=4)
    analyse()
    print('analysed', list(store.data.get('bilan', {}).keys()))
