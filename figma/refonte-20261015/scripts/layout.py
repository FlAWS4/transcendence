"""Page layout of the rebuilt Figma file (15 October 2026): one section per screen of the site map.

Each section holds, for every captured state of that screen, one row of four frames:
    Ordinateur · Clair | Ordinateur · Sombre | Mobile · Clair | Mobile · Sombre
then the same row in English for every state captured in English (decision of the user, 18 Oct.: « cadres anglais
partout », the English site moves boxes) and, for the main screens (site-map « page » kind), in Arabic (RTL), each
built from the captures of its language. Light frames are rendered from the captures; dark frames are clones with the
« Sombre » mode of « 42 · Couleurs » (dark captures only serve to pair colours), except the states of DARK_RENDER that
have a dark capture in that language. Until 18 Oct., English was only a mode of « 42 · Textes ».

  python3 layout.py plan <area> <pageKey>      → ../layouts/<area>.json  (rows, frame sizes and positions)
  python3 layout.py sections <area>            → calls/<n>-sections-<area>.js  (creates the sections with title and notes)
  python3 layout.py record <area> <json>       → stores the returned section ids
  python3 layout.py scenes <area>              → converts every light state and writes its scene calls (X.section)
  python3 layout.py dark <area>                → calls/<n>-dark-<area>.js  (clones every light frame into its dark slot)
"""
import json, re, subprocess, sys, pathlib
from figlib import BASE, DOM, REPO, slug

LAYOUTS = BASE / 'layouts'
LEDGER = BASE / 'figma-ledger.json'
EFFECT_FILE = BASE / 'effect-vars.json'   # 18 Oct.: shadow geometry variables needed by the scenes (name → field, values)
SITE_MAP = REPO / 'docs' / 'site-map' / 'site-map-data.js'
PAD, GAP, ROWGAP, HEAD = 80, 120, 160, 260
FMT = {'desktop': 'Ordinateur', 'mobile': 'Mobile'}
THEME = {'light': 'Clair', 'dark': 'Sombre'}


def site_map():
    src = SITE_MAP.read_text()
    out = subprocess.run(['node', '-e', 'const w={};' + 'new Function("window", require("fs").readFileSync(process.argv[1],"utf8"))(w);'
                          'process.stdout.write(JSON.stringify(w.HORIZON_SITE_MAP))', str(SITE_MAP)], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def scene_size(area, state, fmt, lang):
    import gzip
    p = DOM / area / f'{state}--{fmt}--{lang}-light.json.gz'
    if not p.exists():
        return None
    d = json.loads(gzip.decompress(p.read_bytes()))
    vw, vh = d['viewport']
    dh = d['doc'][1]
    full = dh > vh + 4
    if full:
        # 18 Oct., decision of the user: a state the site was captured for at the height of the screen only (no
        # full-height reference: menus, panels, dialogs, open sorts and filters, search) or captured scrolled is shown
        # at the height of the screen, as the capture shows it (fixed layers in place, content shifted by the scroll)
        scrolled = float((d.get('scroll') or [0, 0])[1] or 0) > 0.5
        if scrolled or not (BASE / 'reference' / area / f'{state}--{fmt}--{lang}-light--full.png').exists():
            full = False
    return [vw, round(max(dh, vh), 2) if full else vh]


# States captured under names that are not site-map ids, and French labels of state suffixes.
STATE_ALIASES = {'visitor-transition': ('opening', 'parcours visiteur'), 'member-transition': ('decrypt', 'vers le logo (membre)'),
                 'comments-sort-open': ('project-comments', 'tri ouvert'), 'mention-picker': ('project-comments', 'suggestions de mention'),
                 'project-local-menu': ('project', 'sélecteur « Dans ce projet » ouvert'), 'profile-local-menu': ('profile', 'sélecteur de rubriques ouvert'),
                 # shell captures (16 Oct., evening): account panels, search and the bottom menu on small screens
                 'account-settings': ('settings', ''), 'account-theme': ('theme', ''), 'account-language': ('language', ''),
                 'search-open': ('g-search', 'ouverte'), 'back-to-top': ('g-back-top', ''), 'dock-300': ('g-dock', 'fenêtre de 300 px'),
                 'dock-320': ('g-dock', 'téléphone de 320 px'),
                 'article-comments-thread': ('article-comments', 'avec un fil')}
# Reading order of the sections of each page (site-map ids); others follow in site-map order.
SECTION_ORDER = {
    'projects': ['projects', 'filter-projects', 'project', 'project-overview', 'project-implementation', 'project-media', 'project-test',
                 'project-comments', 'comment-menu', 'campus-choice', 'report', 'viewer'],
    'profiles': ['people', 'filter-people', 'profile', 'profile-overview', 'profile-projects', 'profile-journey', 'profile-contribution',
                 'message-dialog', 'report'],
    'explorer': ['explore', 'explore-country', 'explore-campus', 'campus-sheet', 'scope-popover', 'about-dialog', 'explore-noglobe', 'campus-window'],
    'compte': ['account-visitor', 'settings', 'theme', 'language', 'signin-dialog', 'signup-dialog', 'account-member', 'messages', 'notifications'],
    'communs': ['g-search', 'g-dock', 'g-back-top'],
    'journal': ['journal', 'article', 'article-media', 'article-authors', 'article-comments'],
}
SUFFIX_FR = {'scan binary': 'scan · binaire', 'scan hex': 'scan · hexadécimal', 'scan return': 'scan · remontée',
             'encrypted': 'message chiffré au repos', 'labels en': 'libellés en anglais', 'labels ar': 'libellés en arabe',
             'mid': 'à mi-parcours', 'final': 'phrase finale', 'logo': 'logo seul', 'ring drawing': 'tracé du cercle',
             'ring': 'cercle complet', 'end': 'fin', 'expanded': 'déployée', 'mulhouse': '42 Mulhouse', 'list': 'vue Liste',
             'sort open': 'tri ouvert', 'last page': 'dernière page', 'empty': 'état vide', 'single': 'projet à campus unique',
             'thread': 'avec un fil', 'saved': 'lien enregistré', 'local menu': 'sélecteur local ouvert', 'filter': 'filtre local ouvert',
             'alumni': 'statut Alumni', 'transcender': 'statut Transcender', 'profile': 'depuis un profil'}


# Chronological / reading order of states inside a section (others follow alphabetically).
STATE_ORDER = ['arrival-scan-binary', 'arrival-scan-hex', 'arrival-scan-return', 'arrival-encrypted', 'arrival-labels-en',
               'arrival-labels-ar', 'decrypt-mid', 'decrypt-final', 'member-transition', 'visitor-transition', 'opening-logo',
               'opening-ring-drawing', 'opening-ring', 'reveal-mid', 'reveal-end',
               'explore', 'explore-country', 'explore-campus', 'campus-sheet', 'campus-sheet-expanded', 'campus-sheet-mulhouse',
               'projects', 'projects-list', 'projects-sort-open', 'projects-last-page', 'projects-empty',
               'people', 'people-list', 'people-sort-open', 'people-last-page']


def plan(area, page_key, key=None, only_states=None):
    """key (16 Oct., evening): one capture area may fill several pages (shell → 42 Awards, Compte, Éléments communs);
    the layout, its sections in the ledger and its calls are named after the key, the dumps after the area."""
    key = key or area
    sm = site_map()
    nodes = {n['id']: n for n in sm['nodes']}
    states = sorted({p.name.split('--')[0] for p in (DOM / area).glob('*--*--fr-light.json.gz')})
    if only_states:
        states = [st for st in states if st in only_states]
    screens = {}
    labels = {}
    for st in states:
        if st in STATE_ALIASES:
            node, lab = STATE_ALIASES[st]; labels[st] = lab
        else:
            node = max((nid for nid in nodes if st == nid or st.startswith(nid + '-')), key=len, default=None)
            suffix = st[len(node):].strip('-').replace('-', ' ') if node else ''
            labels[st] = SUFFIX_FR.get(suffix, suffix)
        screens.setdefault(node or st, []).append(st)
    order = [n['id'] for n in sm['nodes']]
    sections = []
    y = 0
    pref = SECTION_ORDER.get(key) or SECTION_ORDER.get(area, [])
    for sid in sorted(screens, key=lambda s: (pref.index(s) if s in pref else 100 + (order.index(s) if s in order else 999))):
        node = nodes.get(sid, {})
        title = (node.get('name') or {}).get('fr', sid)
        note = (node.get('note') or {}).get('fr', '')
        route = node.get('route') or node.get('open') or ''
        main = node.get('kind') == 'page'
        rows = []
        ordered = sorted(screens[sid], key=lambda s: (STATE_ORDER.index(s) if s in STATE_ORDER else 999, s))
        # the main state of the screen: the state named like the screen, else the first one captured in Arabic
        with_ar = [s for s in ordered if (DOM / area / f'{s}--desktop--ar-light.json.gz').exists() or (DOM / area / f'{s}--mobile--ar-light.json.gz').exists()]
        main_state = sid if sid in with_ar else (with_ar[0] if with_ar else None)
        for st in ordered:
            suffix = labels.get(st, '')
            # English for every state captured in English (18 Oct.); Arabic (mirrored layout) for the default state of each
            # main screen: the user's « arabe pour chaque écran principal »
            for lang in ['fr', 'en'] + (['ar'] if main and st == main_state else []):
                row = []
                for fmt in ('desktop', 'mobile'):
                    size = scene_size(area, st, fmt, lang)
                    if not size:
                        continue
                    for theme in ('light', 'dark'):
                        name = '%s%s — %s · %s%s' % (title, (' · ' + suffix) if suffix else '', FMT[fmt], THEME[theme],
                                                     {'ar': ' · العربية', 'en': ' · English'}.get(lang, ''))
                        row.append({'state': st, 'fmt': fmt, 'lang': lang, 'theme': theme, 'name': name, 'w': size[0], 'h': size[1]})
                if row:
                    rows.append(row)
        if not rows:
            continue
        # positions inside the section
        cy = HEAD
        width = 0
        for row in rows:
            cx = PAD
            for f in row:
                f['x'], f['y'] = cx, cy
                cx += f['w'] + GAP
            width = max(width, cx - GAP + PAD)
            cy += max(f['h'] for f in row) + ROWGAP
        height = cy - ROWGAP + PAD
        sections.append({'id': sid, 'title': title, 'note': note, 'route': route, 'main': main, 'y': y,
                         'w': max(width, 1600), 'h': height, 'rows': rows})
        y += height + 200
    out = {'area': area, 'key': key, 'page': page_key, 'sections': sections}
    LAYOUTS.mkdir(exist_ok=True)
    (LAYOUTS / f'{key}.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
    n = sum(len(r) for s in sections for r in s['rows'])
    print(key, len(sections), 'sections', n, 'frames', '(%d built, %d dark clones)' % (n // 2, n // 2))


SECTIONS_CALL = r"""const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
await Promise.all([{family:'Jost',style:'Medium'},{family:'Jost',style:'Regular'}].map(f => figma.loadFontAsync(f)));
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const paint = n => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[n]);
const L = %(sections)s;
const out = {};
for (const s of L) {
  let sec = page.children.find(n => n.type === 'SECTION' && n.name === s.name);
  if (!sec) { sec = figma.createSection(); page.appendChild(sec); sec.name = s.name; }
  sec.x = 0; sec.y = s.y; sec.resizeWithoutConstraints(s.w, s.h);
  for (const old of sec.children.filter(n => n.type === 'TEXT' && n.name.startsWith('Note · '))) old.remove();
  const t = figma.createText(); sec.appendChild(t); t.name = 'Note · titre';
  t.fontName = { family: 'Jost', style: 'Medium' }; t.fontSize = 40; t.characters = s.title; t.fills = [paint('Rôles/text')]; t.x = 80; t.y = 64;
  const d = figma.createText(); sec.appendChild(d); d.name = 'Note · description';
  d.fontName = { family: 'Jost', style: 'Regular' }; d.fontSize = 18; d.lineHeight = { value: 28, unit: 'PIXELS' };
  d.characters = s.desc; d.fills = [paint('Rôles/muted')]; d.textAutoResize = 'HEIGHT'; d.resize(Math.min(1400, s.w - 160), d.height); d.x = 80; d.y = 124;
  out[s.id] = sec.id;
}
return { sections: out };"""


def sections_call(area):
    from make_call import next_index, CALLS
    lay = json.loads((LAYOUTS / f'{area}.json').read_text())
    led = json.loads(LEDGER.read_text())
    items = []
    for s in lay['sections']:
        desc = s['note']
        meta = 'Écran du plan du site : %s%s. Relevé du prototype actif (audit-fixes-146 + sélection du 15 octobre 2026). Le mode sombre est le mode « Sombre » de 42 · Couleurs ; chaque état relevé en anglais a sa rangée « English » (décision du 18 octobre), les textes étant liés aux variables FR/EN/AR de 42 · Textes.' % (
            s['id'], (' · adresse ' + s['route']) if s['route'] else '')
        items.append({'id': s['id'], 'name': '%s · %s' % (s['title'], s['id']), 'title': s['title'], 'desc': (desc + '\n' if desc else '') + meta,
                      'y': s['y'], 'w': s['w'], 'h': s['h']})
    code = SECTIONS_CALL % {'page': led['pages'][lay['page']], 'sections': json.dumps(items, ensure_ascii=False)}
    f = CALLS / ('%03d-sections-%s.js' % (next_index(), area))
    f.write_text(code)
    print(f.name, len(code))


def record(area, result):
    led = json.loads(LEDGER.read_text())
    led.setdefault('sections', {}).setdefault(area, {}).update(json.loads(result)['sections'])
    LEDGER.write_text(json.dumps(led, ensure_ascii=False, indent=1))
    print('sections recorded:', len(led['sections'][area]))


# 17 Oct.: states whose content changes with the theme (checked option, « Thème … Sombre »): their dark frames are
# built from the dark capture instead of being clones of the light frame in the « Sombre » mode
DARK_RENDER = {('shell', 'account-visitor'), ('shell', 'account-member'), ('shell', 'account-settings'), ('shell', 'account-theme'),
               ('projects', 'mention-picker'),   # its focus ring is lavender in dark (no colour variable has that pair)
               # 18 Oct.: in dark, .dialog-option trades its 1 px border for an inset ring: 51 px buttons instead of 53,
               # a window 4 px shorter (compte v2, cause 4)
               ('shell', 'signin-dialog'), ('shell', 'signup-dialog')}


def dark_render(area, f):
    """A dark frame built from its own dark capture (DARK_RENDER) rather than cloned: 18 Oct., only when that capture
    exists in the frame's language (the English and most Arabic states have none; their dark frames are clones)."""
    return (area, f['state']) in DARK_RENDER and (DOM / area / f"{f['state']}--{f['fmt']}--{f['lang']}-dark.json.gz").exists()


def scenes(key, only=None, names=None):
    """Screen calls of a layout (sections `only`, frames `names` when given; 17 Oct.: dark frames of DARK_RENDER too)."""
    from dom2fig import convert, SCENES
    from make_call import batch_calls, _instances
    jobs = []
    lay = json.loads((LAYOUTS / f'{key}.json').read_text())
    area = lay.get('area', key)
    led = json.loads(LEDGER.read_text())
    secs = led.get('sections', {}).get(key, {})
    SCENES.mkdir(exist_ok=True)
    for s in lay['sections']:
        if only and s['id'] not in only:
            continue
        for row in s['rows']:
            for f in row:
                if names and f['name'] not in names:
                    continue
                if f['theme'] != 'light' and not dark_render(area, f):
                    continue
                full = f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4
                scene, svgs = convert(area, f['state'], f['fmt'], f['lang'], full, theme=f['theme'])
                if 'instances' in scene['stats']:
                    # 18 Oct.: the instances the scene holds; dom2fig also counts those nested in a card or a pagination
                    # that became an instance itself
                    scene['stats']['instances'] = len(_instances(scene['ch']))
                skey = f'{area}--{f["state"]}--{f["fmt"]}--{f["lang"]}' + ('--dark' if f['theme'] == 'dark' else '')
                (SCENES / f'{skey}.json').write_text(json.dumps(scene, ensure_ascii=False, separators=(',', ':')))
                (SCENES / f'{skey}.svgs.json').write_text(json.dumps(svgs, ensure_ascii=False))
                jobs.append((SCENES / f'{skey}.json', lay['page'], f['name'], f['x'], f['y'], secs.get(s['id'])))
    # 18 Oct.: FLOAT variables Clair / Sombre the scenes bind to their shadow fields (dom2fig.effect_vars); they must
    # exist in Figma before the scene calls run: python3 make_call.py effects (written by rendu_complet.py scenes, sent
    # before the screens with the text calls)
    from dom2fig import EFFECT_VARS
    if EFFECT_VARS:
        reg = json.loads(EFFECT_FILE.read_text()) if EFFECT_FILE.exists() else {}
        for name, v in EFFECT_VARS.items():
            if name in reg and (reg[name]['field'], reg[name]['light'], reg[name]['dark']) != (v['field'], v['light'], v['dark']):
                raise ValueError('effect variable %s already registered with other values' % name)
            reg[name] = v
        EFFECT_FILE.write_text(json.dumps(reg, ensure_ascii=False, indent=1, sort_keys=True))
    # 18 Oct.: the string variables of these screens are created first, by calls of their own, so that screen calls
    # sent side by side never use a variable another one has not created yet (call 977)
    from make_call import strings_calls
    for f in strings_calls([j[0] for j in jobs]):
        print(f)
    for f in batch_calls(jobs, key):
        print(f)


DARK_CALL = r"""const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
const fams = ['Jost', 'Noto Sans Arabic', 'IBM Plex Mono'];
const avail = (await figma.listAvailableFontsAsync()).map(f => f.fontName).filter(f => fams.includes(f.family) && !/Condensed|Display|Italic/.test(f.style));
await Promise.all(avail.map(f => figma.loadFontAsync(f)));
await figma.loadFontAsync({ family: 'Noto Sans', style: 'Regular' });   // 18 Oct.: U+202F of the texts is set in Noto Sans (render.js narrowSpaces)
const cc = await figma.variables.getVariableCollectionByIdAsync('%(coll)s');
const dark = cc.modes.find(m => m.name === 'Sombre').modeId;
const J = %(jobs)s;
const SWAP = %(swap)s;   // image of the light theme → same image in the dark theme (street maps, 16 Oct.)
const out = {}, missing = [];
let swapped = 0;
for (const [sec, light, darkName, x, y] of J) {
  const s = await figma.getNodeByIdAsync(sec);
  const src = s && s.children.find(n => n.name === light);
  if (!src) { missing.push(light); continue; }
  for (const old of s.children.filter(n => n.name === darkName)) old.remove();
  const c = src.clone(); s.appendChild(c); c.name = darkName; c.x = x; c.y = y;
  c.setExplicitVariableModeForCollection(cc, dark);
  for (const k of c.findAll(n => 'fills' in n && Array.isArray(n.fills) && n.fills.some(p => p.type === 'IMAGE' && SWAP[p.imageHash]))) {
    k.fills = k.fills.map(p => p.type === 'IMAGE' && SWAP[p.imageHash] ? Object.assign({}, p, { imageHash: SWAP[p.imageHash] }) : p);
    swapped++;
  }
  out[darkName] = c.id;
}
return { created: Object.keys(out).length, missing, swapped, ids: out };"""


def image_swap(led):
    """Light → dark hash of the street maps captured in both themes (ledger « images »)."""
    imgs = led.get('images') or {}
    return {h: imgs[k[:-len('-light')] + '-dark'] for k, h in imgs.items()
            if k.startswith('map:') and k.endswith('-light') and imgs.get(k[:-len('-light')] + '-dark')}


def dark(area, only=None, names=None):
    from make_call import next_index, CALLS
    lay = json.loads((LAYOUTS / f'{area}.json').read_text())
    led = json.loads(LEDGER.read_text())
    secs = led.get('sections', {}).get(area, {})
    jobs = []
    for s in lay['sections']:
        if only and s['id'] not in only:
            continue
        for row in s['rows']:
            lights = {(f['state'], f['fmt'], f['lang']): f for f in row if f['theme'] == 'light'}
            for f in row:
                if names and f['name'] not in names:
                    continue
                if f['theme'] == 'dark' and dark_render(lay.get('area', area), f):
                    continue   # 17 Oct.: built from the dark capture by scenes()
                if f['theme'] == 'dark':
                    if (lay.get('area', area), f['state']) in DARK_RENDER:
                        # 18 Oct.: a state whose content changes with the theme, without its dark capture in this
                        # language: its clone shows the light content (checked option, heights of the buttons), listed
                        print('  dark clone, no dark capture (DARK_RENDER):', f['name'], file=sys.stderr)
                    lf = lights.get((f['state'], f['fmt'], f['lang']))
                    if lf and s['id'] in secs:
                        jobs.append([secs[s['id']], lf['name'], f['name'], f['x'], f['y']])
    code = DARK_CALL % {'page': led['pages'][lay['page']], 'coll': led['collections']['42 · Couleurs']['id'], 'jobs': json.dumps(jobs, ensure_ascii=False),
                        'swap': json.dumps(image_swap(led))}
    f = CALLS / ('%03d-dark-%s.js' % (next_index(), area))
    f.write_text(code)
    print(f.name, len(code), len(jobs), 'clones')


if __name__ == '__main__':
    cmd, area = sys.argv[1], sys.argv[2]
    if cmd == 'plan':
        plan(area, sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else None, sys.argv[5:] or None)
    elif cmd == 'sections':
        sections_call(area)
    elif cmd == 'record':
        record(area, sys.argv[3])
    elif cmd == 'scenes':
        scenes(area, sys.argv[3:] or None)
    elif cmd == 'dark':
        dark(area, sys.argv[3:] or None)
