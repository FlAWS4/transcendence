"""Browser comparison for the integration of the design-review selection (15 Oct 2026); read-only on every source.

Sides (same viewport, theme stored before load, language chosen through the account menu on every side, storage
cleared before each side, same setup steps):
  copie-socle   design-review-studies/baseline/<page>                  study copy (state 144), no trial
  copie-essais  design-review-studies/baseline/<page>?essais=<nine>    study copy + the nine selected trials
  archive       horizon-welcome/archive/pre-design-review-selection-20261015/baseline/<page>   state 146 before integration
  original      horizon-welcome/<page> as served now
Mode "avant" (before the integration): archive vs original (both state 146), a few views, plus welcome-panels.html.
Mode "apres": the four sides on each view, plus welcome-panels.html compared with its "avant" capture.
Per step: screenshot (pixels compared without tolerance), hash of every computed property of every element (custom
properties excluded, url() reduced to the file name, trial hook names mapped as in the preparation), extras, probes.
Trial effect check ("apres"): the elements and pixels changed by the integration (archive -> original) are compared
with those changed by the nine trials on the study copy (copie-socle -> copie-essais).
python3 -I comparaison.py avant|apres [view-name ...]   ->  results-<mode>.json, captures/<mode>/, planches/<mode>/"""
import base64, difflib, io, json, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ACTIVE_DIR = HERE.parents[1]
PREP = ACTIVE_DIR.parent / 'studies/design-review-studies/checks/_integration-20261015/preparation'
sys.path.insert(0, str(PREP))
import equivalence as eq  # noqa: E402  (helper on sys.path, in-page measures, fresh tabs, language switch)
import etat_actuel as ea  # noqa: E402  (account/arrival/sort measures, setups, comment seed)
from helper import Session, STUDY, ACTIVE, D, M, S  # noqa: E402

MODE = sys.argv[1] if len(sys.argv) > 1 else 'apres'
assert MODE in ('avant', 'apres'), MODE
ONLY = sys.argv[2:]
ARCHIVE_URL = ACTIVE + 'archive/pre-design-review-selection-20261015/baseline/'
BASES = {'copie-socle': STUDY, 'copie-essais': STUDY, 'archive': ARCHIVE_URL, 'original': ACTIVE}
PREFIX = {'copie-socle': 'horizon-design-review-studies-20261014-', 'copie-essais': 'horizon-design-review-studies-20261014-',
          'archive': 'horizon-archive-pre-design-review-selection-20261015-', 'original': 'horizon-'}
CAPTURES = HERE / 'captures' / MODE
PLANCHES = HERE / 'planches' / MODE
RESULTS = HERE / f'results-{MODE}.json'
for folder in (CAPTURES, PLANCHES): folder.mkdir(parents=True, exist_ok=True)

# eq.STYLES with url() values reduced to their file name: the three variants serve the same images from other paths.
STYLES = eq.STYLES.replace("for(const [a,b] of VALUE)s=s.split(a).join(b);return s;",
                           "for(const [a,b] of VALUE)s=s.split(a).join(b);return s.replace(/url\\(\"?([^\")]*)\"?\\)/g,(m,u)=>'url('+u.split('/').pop()+')');")
assert STYLES != eq.STYLES
PROBES = r'''(()=>{const v=e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
 const first=s=>[...document.querySelectorAll(s)].find(v)||null;
 const pick=(s,props)=>{const e=first(s);if(!e)return null;const c=getComputedStyle(e);const o=Object.fromEntries(props.map(p=>[p,p.startsWith('--')?c.getPropertyValue(p).trim():c[p]]));const r=e.getBoundingClientRect();o.box=[r.x,r.y,r.width,r.height].map(x=>Math.round(x*100)/100);return o};
 const B=['color','backgroundColor','borderTopColor','borderTopWidth','fontSize','borderTopLeftRadius','boxShadow'];
 return {signup:pick('[data-account-action=signup]',B),login:pick('[data-account-action=login]',B),guest:pick('#entry-guest',B),entryLogin:pick('#entry-login',B),
  sortPanel:pick('#project-comment-sort-menu',['borderTopLeftRadius','boxShadow','fontSize']),
  awardsNote:(e=>e&&{text:e.textContent,lang:e.lang,dir:e.dir,fontSize:getComputedStyle(e).fontSize,color:getComputedStyle(e).color,visible:Boolean(v(e))})(document.querySelector('#main > .awards-coming-soon p, #main > .essai-awards-a-venir p')),
  globe:pick('#globe',['--hg-radius']),marker:pick('.hg-integrated .hg-marker',['fontFamily','fontSize']),grid:pick('#content-list',['gridTemplateColumns']),
  meta:pick('#content-sheet .cp-meta',['fontSize','color']),count:pick('#content-count',['fontSize']),card:pick('#content-sheet .cp-card',['borderTopLeftRadius'])}})()'''


def base_of(side):
    """'<side>-2' is a second load of the same side (noise control)."""
    return side.removesuffix('-2')


def preset(s, side, view):
    """Theme as a stored preference of each variant; comments seeded for the sort view (prefix of each variant)."""
    prefix = PREFIX[base_of(side)]
    source = f"try{{localStorage.setItem('{prefix}theme-preference-v1',{json.dumps(view['theme'])})}}catch(e){{}}"
    if view.get('seed'):
        source += f"try{{if(!sessionStorage.getItem('{prefix}{ea.SEED_KEY}'))sessionStorage.setItem('{prefix}{ea.SEED_KEY}',{json.dumps(json.dumps(ea.SEED))})}}catch(e){{}}"
    s.c.call('Page.addScriptToEvaluateOnNewDocument', {'source': source})


def open_side(s, side, view):
    page = view.get('page', 'content-preview.html'); block = view.get('block', True)
    for attempt in (1, 2):
        eq.fresh(s, False); s.reduced(view.get('reduced', True)); preset(s, side, view)
        s.block_globe(block); s.viewport(*view['vp'])
        url = s.url(view['route'], eq.NINE if base_of(side) == 'copie-essais' else (), None, None, page, BASES[base_of(side)])
        s.c.call('Page.navigate', {'url': url})
        arrival = page in ('index.html', 'welcome-panels.html')
        entry = s.wait('Boolean(document.querySelector("#entry-login"))' if arrival else 'document.body?.dataset.entry==="welcome"', 30)
        s.wait('document.fonts.status==="loaded"', 10)
        if BASES[base_of(side)] == STUDY: s.wait('document.documentElement.dataset.essaisReady==="true"', 15)
        globe = s.globe_ready() if not block and view['route'].split('?')[0].split('/')[0] == 'explore' else None
        if globe is False and attempt == 1: continue  # a cold headless GPU occasionally fails the first WebGL preparation
        break
    note = {'copie-essais': '#main > .essai-awards-a-venir', 'original': '#main > .awards-coming-soon' if MODE == 'apres' else None}.get(base_of(side))
    installed = s.wait(f'Boolean(document.querySelector({json.dumps(note)}))', 15) if note and page != 'welcome-panels.html' else None
    time.sleep(1.2); s.away(); s.blur()
    if view.get('lang', 'fr') != 'fr': eq.switch_lang(s, view['lang'])
    return {'url': url.replace('http://127.0.0.1:8765', ''), 'entry': entry, 'globe': globe, 'globeAttempts': attempt, 'installed': installed}


def screenshot(s):
    return s.c.call('Page.captureScreenshot', {'format': 'png'}, timeout=90)['data']


def settle(s, tries=6):
    """Two identical consecutive screenshots, one second apart (globe and layout at rest)."""
    previous = None
    for i in range(tries):
        data = screenshot(s)
        if previous is not None and data == previous: return i, data
        previous = data; time.sleep(1.0)
    return None, previous


def capture(s, side, view, step):
    page = view.get('page', 'content-preview.html')
    arrival = page == 'index.html' and not view.get('error')
    if arrival:
        steady = eq.arrival_steady(s); stable, data = None, screenshot(s); after = eq.arrival_steady(s)
    else:
        steady = after = None; stable, data = settle(s)
    path = CAPTURES / f"{view['name']}-{side}-{step}.png"; path.write_bytes(base64.b64decode(data))
    out = {'step': step, 'shot': str(path.relative_to(HERE)), 'stableAfter': stable, 'steady': [steady, after] if arrival else None}
    out['styles'] = s.js(STYLES, 90); out['extras'] = s.js(eq.EXTRAS, 30); out['presence'] = s.js(ea.PRESENCE)
    out['probes'] = s.js(PROBES, 20); out['account'] = s.js(ea.ACCOUNT)
    try: out['arrival'] = s.js(ea.ARRIVAL) if page == 'index.html' else None
    except RuntimeError as error: out['arrival'] = f'unavailable: {error}'[:200]
    out['sort'] = s.js(ea.SORT) if view.get('seed') else None
    out['errors'] = out['extras']['errors']; out['overflow'] = out['extras']['overflow']
    return out


def run_side(s, side, view):
    meta = open_side(s, side, view)
    meta['setup'] = []
    for step in view.get('setup', []):
        result = step(s)
        if result: meta['setup'].append(result)
    time.sleep(view.get('settle', 1.2)); s.away()
    if not view.get('keep_focus'): s.blur()
    time.sleep(.4)
    states = [capture(s, side, view, 'initial')]
    for name, action in view.get('steps', []):
        action(s); s.away(); s.blur(); time.sleep(.6)
        states.append(capture(s, side, view, name))
    meta['states'] = states
    return meta


# --- comparisons ----------------------------------------------------------------------------------------------
def pixels(path):
    from PIL import Image
    import numpy as np
    return np.asarray(Image.open(HERE / path).convert('RGBA'), dtype=np.int16)


def keys(signatures):
    seen, out = {}, []
    for sig in signatures:
        seen[sig] = seen.get(sig, 0) + 1; out.append(f'{sig}@{seen[sig]}')
    return out


IGNORED_EXTRAS = ('essais', 'ready', 'sheets', 'errors', 'geometry')


def extras_view(e):
    e = {k: v for k, v in e.items() if k not in IGNORED_EXTRAS}
    e['rootVars'] = {k: v for k, v in e['rootVars'].items() if k != 'accentNames'}
    if e.get('globeVars'): e['globeVars'] = {k: v for k, v in e['globeVars'].items() if k != 'names'}
    return e


def compare(x, y):
    """x -> y for one step: pixels, aligned elements (by signature), style changes, extras."""
    import numpy as np
    p, q = pixels(x['shot']), pixels(y['shot'])
    out = {'from': x['shot'], 'to': y['shot']}
    mask = None
    if p.shape != q.shape: out['pixelsDiffer'] = None
    else:
        mask = (p != q).any(axis=2); n = int(mask.sum()); out['pixelsDiffer'] = n
        if n:
            ys, xs = np.nonzero(mask); out['diffBox'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]; out['maxChannelDelta'] = int(np.abs(p - q).max())
    sa, sb = [e[0] for e in x['styles']], [e[0] for e in y['styles']]; ka, kb = keys(sa), keys(sb)
    matcher = difflib.SequenceMatcher(None, sa, sb, autojunk=False)
    changed, only_x, only_y, pairs = [], [], [], []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'equal':
            pairs += list(zip(range(i1, i2), range(j1, j2)))
            changed += [kb[j] for i, j in zip(range(i1, i2), range(j1, j2)) if x['styles'][i][1] != y['styles'][j][1]]
        else:
            only_x += ka[i1:i2]; only_y += kb[j1:j2]
    out.update({'elements': [len(sa), len(sb)], 'onlyFrom': only_x, 'onlyTo': only_y, 'styleChanged': changed})
    ex, ey = extras_view(x['extras']), extras_view(y['extras'])
    out['extrasEqual'] = ex == ey
    if ex != ey: out['extrasDiff'] = {k: [ex.get(k), ey.get(k)] for k in sorted(set(ex) | set(ey)) if ex.get(k) != ey.get(k)}
    out['identical'] = out['pixelsDiffer'] == 0 and not only_x and not only_y and not changed and out['extrasEqual']
    return out, mask, {'keysFrom': ka, 'keysTo': kb, 'pairs': pairs}


def short(c):
    """Compact form for the results file (full lists kept up to 60 entries)."""
    o = {k: v for k, v in c.items() if k not in ('onlyFrom', 'onlyTo', 'styleChanged')}
    for k in ('onlyFrom', 'onlyTo', 'styleChanged'): o[k + 'Count'] = len(c[k]); o[k] = c[k][:60]
    return o


ABSENT = 'absent-de-la-copie:'


def trial_effect(trials, integration, m_trials, m_integration, link):
    """Same elements and pixels changed by the integration (archive -> original) as by the nine trials on the copy
    (copie-socle -> copie-essais). The original's elements are expressed in the copy's keys through the alignment
    copie-essais -> original; an element of the original without counterpart in the copy (D-area) is marked ABSENT."""
    import numpy as np
    to_copy = {link['keysTo'][j]: link['keysFrom'][i] for i, j in link['pairs']}
    tr = lambda key: to_copy.get(key, ABSENT + key)
    a, b = set(trials['styleChanged']), {tr(k) for k in integration['styleChanged']}
    added_a, added_b = sorted(trials['onlyTo']), sorted(tr(k) for k in integration['onlyTo'])
    removed_a, removed_b = sorted(trials['onlyFrom']), sorted(integration['onlyFrom'])
    only_b = sorted(b - a)
    out = {'styleChangedTrials': len(a), 'styleChangedIntegration': len(b), 'onlyTrials': sorted(a - b)[:40], 'onlyTrialsCount': len(a - b),
           'onlyIntegrationInCopy': [k for k in only_b if not k.startswith(ABSENT)][:40], 'onlyIntegrationInCopyCount': sum(not k.startswith(ABSENT) for k in only_b),
           'onlyIntegrationAbsentFromCopy': [k for k in only_b if k.startswith(ABSENT)][:40], 'onlyIntegrationAbsentFromCopyCount': sum(k.startswith(ABSENT) for k in only_b),
           'addedTrials': added_a, 'addedIntegration': added_b, 'removedTrials': removed_a, 'removedIntegration': removed_b}
    out['sameElements'] = a == b and added_a == added_b and removed_a == removed_b
    # Same effect wherever the element exists in both states (D4 adds the account to the error screen in 146 only).
    out['sameElementsWhereBothExist'] = not (a - b) and not out['onlyIntegrationInCopyCount'] and added_a == [k for k in added_b if not k.startswith(ABSENT)] and removed_a == removed_b
    if m_trials is not None and m_integration is not None and m_trials.shape == m_integration.shape:
        x = m_trials ^ m_integration; n = int(x.sum()); out['pixelsChangedTrials'] = int(m_trials.sum()); out['pixelsChangedIntegration'] = int(m_integration.sum()); out['pixelsXor'] = n
        if n: ys, xs = np.nonzero(x); out['xorBox'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    return out


def planche(view, sides, step_index, label):
    """Side-by-side reduced composition for the visual review."""
    from PIL import Image, ImageDraw
    images = [Image.open(HERE / sides[name]['states'][step_index]['shot']).convert('RGB') for name in label]
    width = 1500 // len(images); scaled = [im.resize((width, round(im.height * width / im.width))) for im in images]
    canvas = Image.new('RGB', (width * len(scaled) + 8 * (len(scaled) - 1), max(im.height for im in scaled) + 22), 'white')
    draw = ImageDraw.Draw(canvas)
    for i, (name, im) in enumerate(zip(label, scaled)):
        canvas.paste(im, (i * (width + 8), 22)); draw.text((i * (width + 8) + 4, 4), name, fill='black')
    step = sides[label[0]]['states'][step_index]['step']
    path = PLANCHES / f"{view['name']}-{step}.png"; canvas.save(path, optimize=True); return str(path.relative_to(HERE))


# --- views ------------------------------------------------------------------------------------------------------
def grid(s): eq.view_list(s, 'grid')


COMMENTS = 'projects/minishell-under-the-prompt?tab=comments'
AWARDS_STEPS_AVANT = [('langue-ar', lambda s: eq.switch_lang(s, 'ar'))]
AWARDS_STEPS = [('langue-ar', lambda s: eq.switch_lang(s, 'ar')), ('langue-en', lambda s: eq.switch_lang(s, 'en'))]
PANELS = {'name': 'welcome-panels-1440x900-clair', 'route': '', 'page': 'welcome-panels.html', 'theme': 'light', 'vp': D, 'only': ['original']}
VIEWS = {
    'avant': [
        {'name': 'explorer-1440x900-clair-fr', 'route': 'explore', 'theme': 'light', 'vp': D, 'block': False},
        {'name': 'arrivee-1440x900-sombre', 'route': '', 'page': 'index.html', 'theme': 'dark', 'vp': D, 'settle': 3},
        {'name': 'menu-compte-1440x900-sombre', 'route': 'projects', 'theme': 'dark', 'vp': D, 'setup': [ea.open_account], 'keep_focus': True},
        {'name': 'profils-grille-340x640-clair-fr', 'route': 'people', 'theme': 'light', 'vp': (340, 640, True), 'setup': [grid]},
        {'name': 'tri-commentaires-bas-390x844-clair', 'route': COMMENTS, 'theme': 'light', 'vp': M, 'seed': True, 'setup': [ea.sort_low], 'keep_focus': True},
        {'name': 'awards-1440x900-clair', 'route': 'awards', 'theme': 'light', 'vp': D, 'steps': AWARDS_STEPS_AVANT},
        PANELS,
    ],
    'apres': [
        {'name': 'explorer-1440x900-clair-fr', 'route': 'explore', 'theme': 'light', 'vp': D, 'block': False},
        {'name': 'explorer-1366x768-clair-ar', 'route': 'explore', 'theme': 'light', 'lang': 'ar', 'vp': (1366, 768, False), 'block': False},
        {'name': 'explorer-390x844-sombre-fr', 'route': 'explore', 'theme': 'dark', 'vp': M, 'block': False},
        {'name': 'projets-320x640-clair-ar', 'route': 'projects', 'theme': 'light', 'lang': 'ar', 'vp': S, 'setup': [grid]},
        {'name': 'profils-grille-1440x900-clair-fr', 'route': 'people', 'theme': 'light', 'vp': D, 'setup': [grid]},
        {'name': 'profils-grille-340x640-clair-fr', 'route': 'people', 'theme': 'light', 'vp': (340, 640, True), 'setup': [grid]},
        {'name': 'awards-1440x900-clair-fr-ar-en', 'route': 'awards', 'theme': 'light', 'vp': D, 'steps': AWARDS_STEPS},
        {'name': 'menu-compte-1440x900-sombre', 'route': 'projects', 'theme': 'dark', 'vp': D, 'setup': [ea.open_account], 'keep_focus': True},
        {'name': 'arrivee-1440x900-sombre', 'route': '', 'page': 'index.html', 'theme': 'dark', 'vp': D, 'settle': 3},
        {'name': 'ecran-erreur-compte-1440x900-sombre', 'route': '', 'page': 'index.html', 'theme': 'dark', 'vp': D, 'error': True, 'setup': [ea.to_error, ea.open_account], 'keep_focus': True},
        {'name': 'tri-commentaires-bas-390x844-clair', 'route': COMMENTS, 'theme': 'light', 'vp': M, 'seed': True, 'setup': [ea.sort_low], 'keep_focus': True},
        PANELS,
        # Noise control: the same side loaded twice (real globe, WebGL raster at DPR 2).
        {'name': 'bruit-explorer-390x844-sombre-fr', 'route': 'explore', 'theme': 'dark', 'vp': M, 'block': False, 'noise': True},
    ],
}


def groups(view):
    if view.get('only'): return [view['only']]
    if view.get('noise'): return [['original', 'original-2'], ['copie-essais', 'copie-essais-2']]
    if MODE == 'avant': return [['archive', 'original']]
    # Real globe: two WebGL pages per Chrome; the pairs compared directly share a browser.
    if not view.get('block', True): return [['copie-essais', 'original'], ['copie-socle', 'archive']]
    return [['copie-socle', 'copie-essais', 'archive', 'original']]


def load():
    try: return json.loads(RESULTS.read_text(encoding='utf-8'))
    except Exception: return {}


def run_group(view, names, attempts=3):
    for attempt in range(1, attempts + 1):
        s = None
        try:
            s = Session(CAPTURES)
            return {name: run_side(s, name, view) for name in names}
        except (RuntimeError, TimeoutError, OSError, AssertionError) as error:
            print(f"[{view['name']}] {names} session error {attempt}: {error}", flush=True)
            if attempt == attempts: raise
            time.sleep(5)
        finally:
            if s: s.close()


def evaluate(view, sides):
    result = {'view': {k: (list(v) if isinstance(v, tuple) else v) for k, v in view.items() if k not in ('setup', 'steps')},
              'steps': [st['step'] for st in next(iter(sides.values()))['states']],
              'sides': {n: {k: v for k, v in r.items() if k != 'states'} | {'states': [{k: v for k, v in st.items() if k not in ('styles', 'extras')} | {
                  'lang': st['extras']['lang'], 'dir': st['extras']['dir'], 'theme': st['extras']['theme'], 'section': st['extras']['section'], 'main': st['extras']['main'],
                  'note': st['extras']['note'], 'logins': st['extras']['logins'], 'globeVars': st['extras']['globeVars'], 'elements': len(st['styles'])} for st in r['states']]}
                  for n, r in sides.items()}, 'comparisons': [], 'planches': []}
    for i, step in enumerate(result['steps']):
        st = {n: r['states'][i] for n, r in sides.items()}; row = {'step': step}
        if view.get('only'):
            if MODE == 'apres':
                before = load_avant(view['name'])
                if before:
                    c, _, _ = compare(before['states'][i], st['original']); row['originalAvantVsApres'] = short(c)
        elif view.get('noise'):
            for name in ('original', 'copie-essais'):
                c, _, _ = compare(st[name], st[name + '-2']); row['bruit-' + name] = short(c)
        elif MODE == 'avant':
            c, _, _ = compare(st['archive'], st['original']); row['archiveVsOriginal'] = short(c)
        else:
            c1, _, link = compare(st['copie-essais'], st['original']); row['copieEssaisVsIntegre'] = short(c1)
            c2, _, _ = compare(st['copie-socle'], st['archive']); row['copieSocleVsArchive'] = short(c2)
            c3, m3, _ = compare(st['copie-socle'], st['copie-essais']); c4, m4, _ = compare(st['archive'], st['original'])
            row['effetEssais'] = short(c3); row['effetIntegration'] = short(c4); row['memeEffet'] = trial_effect(c3, c4, m3, m4, link)
        result['comparisons'].append(row)
        order = (['original'] if view.get('only') else ['original', 'original-2', 'copie-essais', 'copie-essais-2'] if view.get('noise')
                 else ['archive', 'original'] if MODE == 'avant' else ['copie-essais', 'original', 'archive'])
        result['planches'].append(planche(view, sides, i, order))
    result['errors'] = {n: [st['errors'] for st in r['states']] for n, r in sides.items()}
    result['overflow'] = {n: [st['overflow'] for st in r['states']] for n, r in sides.items()}
    result['presence'] = {n: r['states'][0]['presence'] for n, r in sides.items()}
    return result


def load_avant(name):
    """Full measures of the "avant" capture of a view, kept on disk for the comparison after the integration."""
    path = HERE / 'captures' / 'avant' / f'{name}-measures.json'
    return json.loads(path.read_text()) if path.is_file() else None


if __name__ == '__main__':
    for view in VIEWS[MODE]:
        if ONLY and view['name'] not in ONLY: continue
        print('==', MODE, view['name'], time.strftime('%H:%M:%S'), flush=True)
        sides = {}
        try:
            for names in groups(view): sides |= run_group(view, names)
        except Exception as error:
            data = load(); data[view['name']] = {'error': str(error)}; RESULTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n'); continue
        if view.get('only') and MODE == 'avant':
            (CAPTURES / f"{view['name']}-measures.json").write_text(json.dumps(sides['original'], ensure_ascii=False) + '\n')
        result = evaluate(view, sides)
        data = load(); data[view['name']] = result
        RESULTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        for row in result['comparisons']:
            parts = []
            for key in ('archiveVsOriginal', 'copieEssaisVsIntegre', 'copieSocleVsArchive', 'originalAvantVsApres', 'bruit-original', 'bruit-copie-essais'):
                if key in row: c = row[key]; parts.append(f"{key}: px {c['pixelsDiffer']} style {c['styleChangedCount']} dom {c['onlyFromCount']}/{c['onlyToCount']} extras {c['extrasEqual']}")
            if 'memeEffet' in row:
                m = row['memeEffet']; parts.append(f"memeEffet: {m['sameElements']} / where both exist {m['sameElementsWhereBothExist']} ({m['styleChangedTrials']}/{m['styleChangedIntegration']}, absent from copy {m['onlyIntegrationAbsentFromCopyCount']}, xor px {m.get('pixelsXor')})")
            print(' ', row['step'], ' | '.join(parts), flush=True)
        print('  errors', {n: sum(len(e) for e in v) for n, v in result['errors'].items()}, 'overflow', result['overflow'], flush=True)
