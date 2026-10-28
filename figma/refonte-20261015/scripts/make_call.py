"""use_figma call files for the Figma rebuild (15 October 2026).

  python3 make_call.py renderer                          → calls/<n>-renderer.js  (stores render.min.js in the tools text node)
  python3 make_call.py scene <scene.json> <pageKey> <name> <x> <y> [--prefix P]
        → calls/<n>-<slug>-<k>of<K>.js : the scene split in chunks of at most LIMIT characters. The first chunk creates the
          frame under a unique build name; the following ones find it by that name and fill the deferred containers
          (⟨pN⟩ markers); the last one gives the frame its final name. Run the files in order with use_figma.

Every file is self-contained. Until 16 October the renderer was stored in a text node of the Figma file and evaluated
from there; the permission classifier then refused that pattern (« Create RCE Surface »), so every call now carries the
data (const S, const X) followed by the renderer itself (render.inline.js, else render.min.js), with nothing stored or
evaluated from the document.
"""
import json, re, sys, pathlib
from figlib import BASE

LEDGER = BASE / 'figma-ledger.json'
CALLS = BASE / 'calls'
LIMIT = 48500   # use_figma accepts 50 000 characters of code (44 000 until 16 Oct.)
LOADER = ("const R = new (Object.getPrototypeOf(async function(){}).constructor)('figma','S','X', "
          "(await figma.getNodeByIdAsync('%s')).characters);\nreturn await R(figma, %s, %s);")   # until 16 Oct. (stored renderer)
INLINE = "// 42 Horizon — appel autonome : données S et X, puis le moteur render.js (refonte Figma, 16 oct. 2026)\nconst S = %s;\nconst X = %s;\n%s"


ESBUILD = pathlib.Path('/home/le-rif/Bureau/Wahda Project by claude.ai/node_modules/esbuild')


def renderer_src(library=False, glass=False, narrow=False):
    """Renderer pasted into each call: an esbuild build of render.js without the blocks the call does not need
    (18 Oct., build_renderer.cjs): the library builder (library calls of components.py only), the glass copies (scenes
    holding a glass under a weaker blur) and the narrow no-break spaces (scenes holding a U+202F). The build is cached
    beside render.js (render.<blocks>.inline.js) and redone when render.js is newer; without esbuild, the stripped source."""
    import subprocess
    here = BASE / 'scripts'
    src = here / 'render.js'
    flags = (['--screens'] if not library else []) + (['--no-glass'] if (library or not glass) else []) + ([] if narrow else ['--no-narrow'])
    tag = '-'.join(f[2:] for f in flags) or 'complet'
    inline = here / ('render.%s.inline.js' % tag)
    if not inline.exists() or inline.stat().st_mtime < src.stat().st_mtime:
        if ESBUILD.exists():
            out = subprocess.run(['node', str(here / 'build_renderer.cjs'), str(ESBUILD), str(src)] + flags, capture_output=True, text=True, check=True).stdout
            inline.write_text(out)
        else:
            text = src.read_text()
            for flag, mark in (('--screens', 'bibliothèque'), ('--no-glass', 'verre'), ('--no-narrow', 'espaces')):
                if flag in flags:
                    a, b = text.index('// ⟦%s⟧' % mark), text.index('// ⟦/%s⟧' % mark)
                    text = text[:a] + text[b:]
            return '\n'.join(l.strip() for l in text.split('\n') if l.strip() and not l.strip().startswith('//'))
    return inline.read_text()


DATA_LIMIT = LIMIT - len(renderer_src()) - 400   # what remains for S and X
NARROW_MARK = '\u202f'
NARROW_EXTRA = len(renderer_src(narrow=True)) - len(renderer_src())   # 18 Oct.: a scene holding a U+202F
DATA_LIMIT_GLASS = LIMIT - len(renderer_src(glass=True, narrow=True)) - 400   # 18 Oct.: scenes holding a glass under a weaker blur
GLASS_MARK = '⟨verre '


def dumps(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':'))


def next_index():
    CALLS.mkdir(exist_ok=True)
    # numbers of calls written then replaced without being sent (_superseded/) are not reused (16 Oct.)
    nums = [int(m.group(1)) for f in list(CALLS.glob('*.js')) + list(CALLS.glob('done/*.js')) + list((BASE / '_superseded').glob('*/*.js'))
            if (m := re.match(r'(\d+)-', f.name))]
    return max(nums, default=0) + 1


def context(led):
    assets = dict(led.get('assets', {}))
    out = {'icons': led['components']['icons'], 'assets': assets, 'texts': led['collections']['42 · Textes']['id'],
           'colors': led['collections']['42 · Couleurs']['id']}
    files = {k: v for k, v in (led.get('images') or {}).items() if k.startswith('file:')}
    if files:
        out['images'] = files   # 16 Oct.: photos already in the file, laid by their hash
    sh = (led.get('shaders') or {}).get('saturation-du-verre') or {}
    if sh.get('built'):
        out['shader'] = sh['built']   # 18 Oct.: versioned id « id/version » of saturate(1.15), on the blurred backdrop of the glass
    if sh.get('split'):
        out['glassSplit'] = 1   # « Verre · flou » under « Verre · surface » in every glass (render.js splitGlass), once tested
    return out


def used_components(S):
    """18 Oct.: ids of the library variants the instances of a call use (nodes « C », components.py), and only those."""
    import components
    ids, out = components.component_ids(), {}
    def walk(o):
        if isinstance(o, dict):
            if o.get('t') == 'C':
                cid = (ids.get(o['c']) or {}).get(o['v'])
                if not cid:
                    raise ValueError('no Figma id for the variant %s · %s' % (o['c'], o['v']))
                out.setdefault(o['c'], {})[o['v']] = cid
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(S)
    return out


def job_images(led, scene, ctx):
    """Images of one screen: the shared photos, plus the street map captured for this state in the light theme."""
    state = scene.get('name', '').split('/')[-1]
    imgs, fmt, lang = led.get('images') or {}, scene.get('fmt'), scene.get('lang', 'fr')
    h = imgs.get('map:%s--%s--%s-light' % (state, fmt, lang))
    if not h and lang == 'en':
        # 18 Oct.: the maps were captured in French and Arabic only: an English frame takes the French map (same box of
        # the canvas in both languages, place names in their own language on the map, French and Arabic maps identical);
        # its dark clone takes the French dark map (layout.image_swap)
        h = imgs.get('map:%s--%s--fr-light' % (state, fmt))
    return {**ctx.get('images', {}), 'canvas': h} if h else None


def split(scene):
    """[(target placeholder or None, nodes)] in creation order; oversized nodes get their children deferred."""
    counter = [0]
    ops = []
    queue = [(None, scene['ch'])]
    while queue:
        target, nodes = queue.pop(0)
        for nd in nodes:
            def shrink(n):
                if len(dumps(n)) <= DATA_LIMIT:
                    return
                kids = n.get('ch') or []
                if not kids:
                    raise ValueError('single node larger than the limit: ' + n.get('n', '?'))
                counter[0] += 1
                ph = 'p%d' % counter[0]
                n['ph'] = ph; n.pop('al', None)
                queue.append((ph, kids)); n['ch'] = []
            shrink(nd)
        groups, cur, size = [], [], 0
        for nd in nodes:
            s = len(dumps(nd))
            if cur and size + s > DATA_LIMIT // 4:
                groups.append(cur); cur, size = [], 0
            cur.append(nd); size += s
        if cur or target is None:
            groups.append(cur)
        for g in groups:
            ops.append((target, g))
    return ops


SENT = CALLS / 'strings-sent.json'
# 18 Oct.: U+00A0 and U+202F read as ordinary spaces, to recognise a variable sent before the capture kept them
PLAIN = {0xa0: 0x20, 0x202f: 0x20}
# 18 Oct. (evening): U+202F and U+00A0 travel in the calls as visible tokens, put back by render.js (and by the text
# variable call): the courier of call 1236 had copied U+202F as an ordinary space; no call sent before held either
SPACE_TOKENS = (('\u202f', '\u27e6202f\u27e7'), ('\u00a0', '\u27e600a0\u27e7'))


def guard_spaces(code):
    for ch, tok in SPACE_TOKENS:
        code = code.replace(ch, tok)
    return code


def unguard_spaces(text):
    for ch, tok in SPACE_TOKENS:
        text = text.replace(tok, ch)
    return text


def dedupe_strings(nodes, save=True):
    """Texts whose FR/EN/AR variable was already sent by an earlier call keep only its name. 18 Oct.: save=False returns
    the registry instead of writing it, for the caller to write once the call file is written (a call refused before,
    by the size limit or a missing component id, announced its variables as sent)."""
    reg = json.loads(SENT.read_text()) if SENT.exists() else {}
    def walk(o):
        if isinstance(o, dict):
            sv = o.get('sv')
            if isinstance(sv, dict) and 'fr' in sv:
                key = [sv['fr'], sv['en'], sv['ar']]
                if reg.get(sv['n']) == key:
                    o['sv'] = {'n': sv['n']}
                elif sv['n'] not in reg:
                    reg[sv['n']] = key
                elif reg[sv['n']][:2] == key[:2] and '‏' + reg[sv['n']][2] == key[2]:
                    reg[sv['n']] = key   # 17 Oct.: right-to-left mark added to the Arabic text (render.js updates it)
                elif [x.translate(PLAIN) for x in reg[sv['n']]] == [x.translate(PLAIN) for x in key]:
                    reg[sv['n']] = key   # 18 Oct.: no-break spaces kept by the capture (render.js updates the variable in place)
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(nodes)
    if not save:
        return reg
    SENT.write_text(json.dumps(reg, ensure_ascii=False))


def slim(o, fonts):
    """Smaller payload: one decimal for geometry, font pairs through S.FN, FR text not repeated in sv."""
    if isinstance(o, dict):
        for k in ('x', 'y', 'w', 'h'):
            if isinstance(o.get(k), float):
                o[k] = round(o[k], 1)
                if o[k] == int(o[k]):
                    o[k] = int(o[k])
        if o.get('t') == 'T':
            fn = tuple(o['fn']) if isinstance(o.get('fn'), list) else None
            if fn:
                if fn not in fonts:
                    fonts[fn] = len(fonts)
                o['fn'] = fonts[fn]
            sv = o.get('sv')
            if isinstance(sv, dict) and sv.get('fr') == o.get('tx') and 'en' in sv:
                del sv['fr']
        for v in o.values():
            slim(v, fonts)
    elif isinstance(o, list):
        for v in o:
            slim(v, fonts)


FRAME_STYLE = ('f', 's', 'sw', 'r', 'e', 'c', 'o', 'sd')
TEXT_STYLE = ('fn', 'fs', 'lh', 'col', 'al', 'ls', 'tc', 'td', 'ar', 'rtl')


def factor_styles(S):
    """Repeated frame and text styles → one table per call, S.ST; nodes keep its index in « k » (16 Oct., -15 %)."""
    found, count = [], {}
    def walk(o):
        if isinstance(o, dict):
            keys = FRAME_STYLE if o.get('t') == 'F' else TEXT_STYLE if o.get('t') == 'T' else ()
            st = {k: o[k] for k in keys if k in o}
            if st:
                key = o['t'] + dumps(st)
                found.append((o, key, st)); count[key] = count.get(key, 0) + 1
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(S.get('ops') or S.get('jobs') or S.get('library'))   # 18 Oct.: also the variants of a library call
    table = {}
    for node, key, st in found:
        if count[key] >= 2 and len(key) > 14:
            node['k'] = table.setdefault(key, len(table))
            for k in st:
                del node[k]
    if table:
        S['ST'] = [json.loads(k[1:]) for k, _ in sorted(table.items(), key=lambda kv: kv[1])]


def compress(nodes, table):
    """Replace colour references {'v': name} by indexes into the per-call table S.VN."""
    def walk(o):
        if isinstance(o, dict):
            if set(o.keys()) == {'v'} and isinstance(o['v'], str):
                if o['v'] not in table:
                    table[o['v']] = len(table)
                o['v'] = table[o['v']]
                return
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(nodes)


def packed_size(nodes):
    """Characters a node list will weigh in a call once compressed like the calls (VN, FN, style table), 16 Oct."""
    import copy
    S = {'ops': [[None, copy.deepcopy(nodes)]]}
    table = {}
    compress(S, table)
    fonts = {}
    slim(S, fonts)
    factor_styles(S)
    return len(dumps(S)) + 40 * len(table) + 60 * len(fonts)


def scene_calls(path, page_key, name, x, y, prefix='', section=None):
    led = json.loads(LEDGER.read_text())
    scene = json.loads(pathlib.Path(path).read_text())
    page = led['pages'][page_key]
    ctx = context(led)
    build = '⟦build %s⟧' % re.sub(r'\W+', '-', pathlib.Path(path).stem)[-40:]
    text = json.dumps(scene, ensure_ascii=False)
    glass, narrow = GLASS_MARK in text, NARROW_MARK in text
    budget = DATA_LIMIT_GLASS if glass else DATA_LIMIT - (NARROW_EXTRA if narrow else 0)
    ops = split(scene)
    # pack consecutive operations into calls under the budget
    calls, cur, size = [], [], 0
    for op in ops:
        s = packed_size(op[1]) + 40
        if cur and size + s > budget:
            calls.append(cur); cur, size = [], 0
        cur.append(op); size += s
    if cur:
        calls.append(cur)
    files = []
    n0 = next_index()
    slug = re.sub(r'[^a-z0-9]+', '-', (prefix + name).lower())[:50].strip('-')
    head = {k: scene[k] for k in ('name', 'w', 'h') if k in scene}
    for i, group in enumerate(calls):
        last = i == len(calls) - 1
        table = {}
        opsj = [[t, nodes] for t, nodes in group]
        S = {'ops': opsj}
        if i == 0:
            S.update(head); S['bg'] = scene.get('bg')
        reg = dedupe_strings(S, save=False)
        compress(S, table)
        S['VN'] = [k for k, _ in sorted(table.items(), key=lambda kv: kv[1])]
        fonts = {}
        slim(S, fonts)
        S['FN'] = [list(k) for k, _ in sorted(fonts.items(), key=lambda kv: kv[1])]
        factor_styles(S)
        X = {'page': page, **ctx, 'theme': scene.get('theme', 'Clair'), 'lang': scene.get('lang', 'fr')}   # 17 Oct.: « Sombre » for a dark capture
        imgs = job_images(led, scene, ctx)
        if imgs:
            X['images'] = imgs
        if section:
            X['section'] = section
        comps = used_components(S)
        if comps:
            X['components'] = comps
        if i == 0:
            X.update({'name': build, 'at': [x, y]})
        else:
            X['find'] = build
        if last:
            X['final'] = name
        code = guard_spaces(INLINE % (dumps(S), dumps(X), renderer_src(glass=glass and last, narrow=narrow)))   # the glass copies run in the last call
        if len(code) > 49500:
            raise ValueError('call of %d characters, above the 50 000 limit of use_figma' % len(code))
        f = CALLS / ('%03d-%s-%dof%d.js' % (n0, slug, i + 1, len(calls)))
        f.write_text(code)
        SENT.write_text(json.dumps(reg, ensure_ascii=False))   # 18 Oct.: once the call is written
        files.append((f.name, len(code)))
    return files


def renderer_call():
    led = json.loads(LEDGER.read_text())
    src = (BASE / 'scripts' / 'render.min.js').read_text()
    code = ("const t = await figma.getNodeByIdAsync('%s');\nawait figma.loadFontAsync(t.fontName);\nt.characters = %s;\n"
            "const ok = typeof new (Object.getPrototypeOf(async function(){}).constructor)('figma','S','X', t.characters) === 'function';\n"
            "t.name = 'render.js — moteur de rendu des relevés (version %d)';\nreturn { chars: t.characters.length, ok };"
            ) % (led['tools']['renderer'], json.dumps(src, ensure_ascii=False), led['tools'].get('rendererVersion', 1) + 1)
    f = CALLS / ('%03d-renderer.js' % next_index())
    f.write_text(code)
    return f.name, len(code)


if __name__ == '__main__':
    if sys.argv[1] == 'renderer':
        print(renderer_call())
    elif sys.argv[1] == 'scene':
        args = sys.argv[2:]
        prefix = ''
        if '--prefix' in args:
            i = args.index('--prefix'); prefix = args[i + 1]; del args[i:i + 2]
        for f in scene_calls(args[0], args[1], args[2], float(args[3]), float(args[4]), prefix):
            print(f)


PALETTE_CALL = r"""const col = await figma.variables.getVariableCollectionByIdAsync('%(coll)s');
const light = col.modes.find(m => m.name === 'Clair').modeId, dark = col.modes.find(m => m.name === 'Sombre').modeId;
const have = new Set((await figma.variables.getLocalVariablesAsync('COLOR')).map(v => v.name));
const hex = h => { const n = h.replace('#', ''); return { r: parseInt(n.slice(0, 2), 16) / 255, g: parseInt(n.slice(2, 4), 16) / 255, b: parseInt(n.slice(4, 6), 16) / 255, a: n.length > 6 ? parseInt(n.slice(6, 8), 16) / 255 : 1 }; };
const ROWS = %(rows)s;
const made = [];
for (const [name, l, d, kinds] of ROWS) {
  if (have.has(name)) continue;
  const v = figma.variables.createVariable(name, col, 'COLOR');
  v.setValueForMode(light, hex(l)); v.setValueForMode(dark, hex(d));
  v.description = 'Couleur peinte par le prototype sans propriété CSS dédiée (souvent un mélange color-mix ou une ombre), relevée en clair et en sombre. Usages : ' + kinds + '.';
  v.scopes = kinds === 'dégradé' ? ['FRAME_FILL', 'SHAPE_FILL'] : kinds.includes('ombre') && !kinds.includes('fond') ? ['EFFECT_COLOR'] : (kinds.includes('texte') ? ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'] : (kinds.includes('bordure') ? ['STROKE_COLOR'] : ['FRAME_FILL', 'SHAPE_FILL']));
  made.push(name);
}
return { created: made.length, names: made };"""


def palette_call():
    led = json.loads(LEDGER.read_text())
    pal = json.loads((BASE / 'palette.json').read_text())
    known = set(led.get('variables', {}).get('dérivées', []))
    rows = [[v['name'], v['light'], v['dark'], ', '.join(sorted(v['kinds']))] for v in pal['vars']
            if v['name'].startswith('dérivées/') and v['name'] not in known]
    if not rows:
        return None
    code = PALETTE_CALL % {'coll': led['collections']['42 · Couleurs']['id'], 'rows': dumps(rows)}
    f = CALLS / ('%03d-palette.js' % next_index())
    f.write_text(code)
    return f.name, len(code), len(rows)


def palette_record(names):
    led = json.loads(LEDGER.read_text())
    led.setdefault('variables', {}).setdefault('dérivées', [])
    led['variables']['dérivées'] = sorted(set(led['variables']['dérivées']) | set(names))
    LEDGER.write_text(json.dumps(led, ensure_ascii=False, indent=1))


if __name__ == '__main__' and sys.argv[1] == 'palette':
    print(palette_call())


# 18 Oct.: FLOAT variables Clair / Sombre for the shadow fields that change with the theme (dom2fig.effect_vars,
# ../effect-vars.json). Same collection as the colours (« 42 · Couleurs »): it is the one the dark clones switch.
EFFECTS_CALL = r"""// 42 Horizon — variables de géométrie des ombres Clair / Sombre (refonte Figma, 18 oct. 2026)
const col = await figma.variables.getVariableCollectionByIdAsync('%(coll)s');
const light = col.modes.find(m => m.name === 'Clair').modeId, dark = col.modes.find(m => m.name === 'Sombre').modeId;
const have = {}; for (const v of await figma.variables.getLocalVariablesAsync('FLOAT')) if (v.variableCollectionId === col.id) have[v.name] = v;
const ROWS = %(rows)s;
const made = [], kept = [], ids = {};
for (const [name, field, l, d, desc] of ROWS) {
  let v = have[name];
  if (!v) { v = figma.variables.createVariable(name, col, 'FLOAT'); made.push(name); } else kept.push(name);
  v.setValueForMode(light, l); v.setValueForMode(dark, d);
  v.scopes = ['EFFECT_FLOAT'];
  v.description = desc;
  ids[name] = v.id;
}
return { created: made.length, updated: kept.length, ids };"""
FIELD_FR = {'offsetX': 'décalage horizontal', 'offsetY': 'décalage vertical', 'radius': 'flou', 'spread': 'étalement'}


def effects_call():
    led = json.loads(LEDGER.read_text())
    reg = json.loads((BASE / 'effect-vars.json').read_text())
    rows = [[name, v['field'], v['light'], v['dark'],
             'Ombre portée : %s (px) en clair et en sombre, relevé dans le prototype pour le même élément (champ %s de l’effet).'
             % (FIELD_FR[v['field']], v['field'])] for name, v in sorted(reg.items())]
    code = EFFECTS_CALL % {'coll': led['collections']['42 · Couleurs']['id'], 'rows': dumps(rows)}
    f = CALLS / ('%03d-effets.js' % next_index())
    f.write_text(code)
    return f.name, len(code), len(rows)


def effects_record(result):
    led = json.loads(LEDGER.read_text())
    led.setdefault('variables', {}).setdefault('effets', {}).update(json.loads(result)['ids'])
    LEDGER.write_text(json.dumps(led, ensure_ascii=False, indent=1))


if __name__ == '__main__' and sys.argv[1] == 'effects':
    print(effects_call())


def resync_strings():
    """Rebuild the « already sent » string registry from the executed calls only (calls/done/). 18 Oct.: in the order they
    ran (numbers, 1000 after 999; parts of a split screen by rank), the calls of text variables included (their rows are
    the values Figma holds: created, reused or updated in place, never renamed), and the right-to-left mark render.js
    adds in place."""
    reg = {}
    def order(f):
        m, p = re.match(r'(\d+)-', f.name), re.search(r'-(\d+)of\d+\.js$', f.name)
        return (int(m.group(1)) if m else 0, int(p.group(1)) if p else 0, f.name)
    for f in sorted((CALLS / 'done').glob('*.js'), key=order):
        text = unguard_spaces(f.read_text())
        if text.startswith('// 42 Horizon — variables de texte'):
            for n, fr, en, ar in json.loads(text.split('\n')[1][len('const T = '):-1]):
                reg[n] = [fr, en, ar]
            continue
        if text.startswith('const R = new'):
            line = text.split('\n')[1]
            S, X = json.loads('[' + line[len('return await R(figma, '):-2] + ']')
        elif text.startswith('// 42 Horizon — appel autonome'):
            S = json.loads(text.split('\n')[1][len('const S = '):-1])
        else:
            continue
        def walk(o):
            if isinstance(o, dict):
                sv = o.get('sv')
                if isinstance(sv, dict) and 'en' in sv:
                    key = [sv.get('fr', o.get('tx')), sv['en'], sv['ar']]   # slim() drops fr when it equals the text
                    old = reg.get(sv['n'])
                    # 18 Oct.: a later call that updated the variable in place (no-break spaces, right-to-left mark added)
                    # replaces the registered value
                    if old is None or (old != key and ([x.translate(PLAIN) for x in old] == [x.translate(PLAIN) for x in key] or
                                                       (old[:2] == key[:2] and '\u200f' + old[2] == key[2]))):
                        reg[sv['n']] = key
                for v in o.values():
                    walk(v)
            elif isinstance(o, list):
                for v in o:
                    walk(v)
        walk(S)
    SENT.write_text(json.dumps(reg, ensure_ascii=False))
    print('strings already in Figma:', len(reg))


if __name__ == '__main__' and sys.argv[1] == 'resync-strings':
    resync_strings()


def batch_calls(jobs, tag):
    """Several screens per call. jobs: [(scene_path, page_key, final_name, x, y, section_id)], all on one page.
    Screens too large for one call get their own split calls (scene_calls); the others are packed under DATA_LIMIT."""
    led = json.loads(LEDGER.read_text())
    ctx = context(led)
    files = []
    pending, size, pending_glass, pending_narrow = [], 0, False, False

    def flush():
        nonlocal pending, size
        if not pending:
            return
        page = led['pages'][pending[0][1]]
        S = {'jobs': []}
        for path, page_key, name, x, y, section, scene in pending:
            build = '⟦build %s⟧' % re.sub(r'\W+', '-', pathlib.Path(path).stem)[-40:]
            XJ = {'name': build, 'final': name, 'at': [x, y], 'theme': scene.get('theme', 'Clair'), 'lang': scene.get('lang', 'fr')}
            if section:
                XJ['section'] = section
            imgs = job_images(led, scene, ctx)
            if imgs:
                XJ['images'] = imgs
            S['jobs'].append({'ops': [[None, scene['ch']]], 'w': scene['w'], 'h': scene['h'], 'bg': scene.get('bg'), 'X': XJ})
        table = {}
        reg = dedupe_strings(S, save=False)
        compress(S, table)
        S['VN'] = [k for k, _ in sorted(table.items(), key=lambda kv: kv[1])]
        fonts = {}
        slim(S, fonts)
        S['FN'] = [list(k) for k, _ in sorted(fonts.items(), key=lambda kv: kv[1])]
        factor_styles(S)
        X = {'page': page, **ctx}
        comps = used_components(S)
        if comps:
            X['components'] = comps
        code = guard_spaces(INLINE % (dumps(S), dumps(X), renderer_src(glass=pending_glass, narrow=pending_narrow)))
        if len(code) > 49500:
            raise ValueError('lot of %d characters, above the 50 000 limit of use_figma' % len(code))
        f = CALLS / ('%03d-%s-lot.js' % (next_index(), tag))
        f.write_text(code)
        SENT.write_text(json.dumps(reg, ensure_ascii=False))   # 18 Oct.: once the call is written
        files.append((f.name, len(code), len(pending)))
        pending, size = [], 0

    for path, page_key, name, x, y, section in jobs:
        scene = json.loads(pathlib.Path(path).read_text())
        text = json.dumps(scene, ensure_ascii=False)
        glass, narrow = GLASS_MARK in text, NARROW_MARK in text   # 18 Oct.: calls of their own, renderer with those blocks
        limit = DATA_LIMIT_GLASS if glass else DATA_LIMIT - (NARROW_EXTRA if narrow else 0)
        s = packed_size(scene['ch']) + 300 + 90 * len({(c['c'], c['v']) for c in _instances(scene['ch'])})
        if s > limit:
            flush()
            for f in scene_calls(path, page_key, name, x, y, section=section):
                files.append(f + (1,))
            continue
        if pending and (size + s > limit or pending[0][1] != page_key or pending_glass != glass or pending_narrow != narrow):
            flush()
        pending_glass, pending_narrow = glass, narrow
        pending.append((path, page_key, name, x, y, section, scene)); size += s
    flush()
    return files


def _instances(nodes):
    """Instance nodes (« C ») of a node list: their ids go in X.components, about 90 characters each."""
    out = []
    for n in nodes:
        if n.get('t') == 'C':
            out.append(n)
        out.extend(_instances(n.get('ch') or []))
    return out


def componentize_call(page_key, patterns, tag):
    """Componentisation pass on one page (scripts/componentize.js), with the library page « Composants »."""
    led = json.loads(LEDGER.read_text())
    X = {'page': led['pages'][page_key], 'lib': led['pages']['Composants'], 'patterns': patterns}
    body = (BASE / 'scripts' / 'componentize.js').read_text()
    body = '\n'.join(l for l in body.split('\n') if not l.strip().startswith('//'))
    code = '// COMPONENTIZE\nconst X = %s;\n%s' % (dumps(X), body)
    f = CALLS / ('%03d-composants-%s.js' % (next_index(), tag))
    f.write_text(code)
    return f.name, len(code)


# 18 Oct.: the string variables a render needs, created before its screen calls. A screen call sends by name only a
# triple an earlier call already sent (dedupe_strings): with chains run side by side, a call could run before the one
# creating its variable (« Commun/42 Rio · 42 São Paulo » missing in call 977). These calls create every triple of the
# given scenes that the registry does not hold yet, with the rules of render.js stringVar (same values: reused; Arabic
# without its right-to-left mark or no-break spaces read as spaces: updated in place), then record them as sent.
# 18 Oct.: other values under the same name (the registry out of step with the file) refuse the call before anything is
# made: the screens bind these texts by name only, a « name (k) » variable would have left them on the other words. The
# right-to-left mark is written with String.fromCodePoint: no invisible character in the code the couriers copy.
STRINGS_CALL = r"""// 42 Horizon — variables de texte du rendu, créées avant les appels d'écrans (refonte Figma, 18 oct. 2026)
const T = %(rows)s;
const TOK = new RegExp(String.fromCodePoint(0x27e6) + '(202f|00a0)' + String.fromCodePoint(0x27e7), 'g');
for (const r of T) for (let i = 0; i < r.length; i++) r[i] = r[i].replace(TOK, (_, h) => String.fromCodePoint(parseInt(h, 16)));
const coll = await figma.variables.getVariableCollectionByIdAsync('%(coll)s');
const M = {}; for (const m of coll.modes) M[m.name] = m.modeId;
const have = {}; for (const v of await figma.variables.getLocalVariablesAsync('STRING')) if (v.variableCollectionId === coll.id) have[v.name] = v;
const NB = new RegExp('[' + String.fromCharCode(0xa0, 0x202f) + ']', 'g'), plain = s => String(s).replace(NB, ' '), RLM = String.fromCodePoint(0x200f);
const vals = v => [v.valuesByMode[M['Français']], v.valuesByMode[M['English']], v.valuesByMode[M['العربية']]];
const same = (v, fr, en, ar) => { const [vf, ve, va] = vals(v); return vf === fr && ve === en && va === ar; };
const near = (v, fr, en, ar) => { const [vf, ve, va] = vals(v); return (vf === fr && ve === en && RLM + va === ar) || (plain(vf) === plain(fr) && plain(ve) === plain(en) && plain(va) === plain(ar)); };
const clash = T.filter(([n, fr, en, ar]) => have[n] && !same(have[n], fr, en, ar) && !near(have[n], fr, en, ar)).map(r => r[0]);
if (clash.length) throw new Error("Variables de texte déjà dans Figma avec d'autres mots (registre strings-sent.json en retard sur le fichier), rien n'est créé : " + clash.join(' | '));
const out = { created: [], reused: [], updated: [] };
// 18 Oct.: setValueForMode lays out the texts bound to the variable: load a font Figma asks for, then try again (as render.js setStringValues)
const setv = async (v, mode, val) => { for (let i = 0; ; i++) { try { v.setValueForMode(mode, val); return; } catch (e) { const msg = String((e && e.message) || e); const f = i < 3 && (/family:\s*"([^"]+)",\s*style:\s*"([^"]+)"/.exec(msg) || /unloaded font "([^"]*) ([^" ]+)"/.exec(msg)); if (!f) throw e; await figma.loadFontAsync({ family: f[1], style: f[2] }); } } };
for (const [n, fr, en, ar] of T) {
  const v = have[n];
  if (v && same(v, fr, en, ar)) { out.reused.push(n); continue; }
  if (v) { await setv(v, M['Français'], fr); await setv(v, M['English'], en); await setv(v, M['العربية'], ar); out.updated.push(n); continue; }
  const c = figma.variables.createVariable(n, coll, 'STRING');
  c.setValueForMode(M['Français'], fr); c.setValueForMode(M['English'], en); c.setValueForMode(M['العربية'], ar);
  c.scopes = ['TEXT_CONTENT']; have[n] = c; out.created.push(n);
}
return { created: out.created.length, reused: out.reused.length, updated: out.updated.length };"""


def strings_calls(scene_paths, limit=44000):
    """Calls creating the string variables of the given scenes that strings-sent.json does not hold yet; the registry
    is updated as for the screen calls (run them before any screen call of the render, then the screen calls send
    these triples by name only)."""
    led = json.loads(LEDGER.read_text())
    reg = json.loads(SENT.read_text()) if SENT.exists() else {}
    rows, seen = [], {}
    def walk(o):
        if isinstance(o, dict):
            sv = o.get('sv')
            if isinstance(sv, dict) and 'en' in sv:
                key = [sv.get('fr', o.get('tx')), sv['en'], sv['ar']]
                old = reg.get(sv['n'])
                # new names, and the values render.js updates in place (right-to-left mark, no-break spaces); another
                # triple under a known name stays in the screen call, where render.js names it « name (k) »
                same = old is not None and ((old[:2] == key[:2] and '\u200f' + old[2] == key[2]) or
                                            [x.translate(PLAIN) for x in old] == [x.translate(PLAIN) for x in key])
                if (old is None or (same and old != key)) and sv['n'] not in seen:
                    seen[sv['n']] = key   # a second triple under the same new name stays in its screen call
                    rows.append([sv['n']] + key)
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    for p in scene_paths:
        walk(json.loads(pathlib.Path(p).read_text()))
    files, cur = [], []
    def flush():
        if not cur:
            return
        code = guard_spaces(STRINGS_CALL % {'rows': dumps(cur), 'coll': led['collections']['42 · Textes']['id']})
        f = CALLS / ('%03d-variables-textes.js' % next_index())
        f.write_text(code)
        files.append((f.name, len(code), len(cur)))
        for n, fr, en, ar in cur:
            reg[n] = [fr, en, ar]
        cur.clear()
    size = 0
    for r in rows:
        s = len(dumps(r)) + 2
        if cur and size + s > limit:
            flush(); size = 0
        cur.append(r); size += s
    flush()
    SENT.write_text(json.dumps(reg, ensure_ascii=False))
    return files


if __name__ == '__main__' and sys.argv[1] == 'strings':
    for f in strings_calls(sys.argv[2:]):
        print(f)


# 18 Oct.: the saturation of the site's glass (saturate(1.15)) added in place once the shader is built: on every
# « Verre · flou » layer (render.js splitGlass) and every blurred copy of a glass under a veil (glassCopies) of a page,
# except inside instances (their main components on the page « Composants » carry it, the instances follow).
SATURATION_CALL = r"""// 42 Horizon — effet de saturation du verre posé sur place (refonte Figma, 18 oct. 2026)
const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
const sh = await figma.importShaderById('%(shader)s');
const inInstance = n => { for (let a = n.parent; a && a.type !== 'PAGE'; a = a.parent) if (a.type === 'INSTANCE') return true; return false; };
let added = 0, kept = 0;
for (const n of page.findAll(x => x.name === 'Verre · flou' || x.name.startsWith('Arrière-plan flouté (copie'))) {
  if (inInstance(n)) continue;
  if (n.effects.some(e => e.type === 'SHADER')) { kept++; continue; }
  n.effects = [...n.effects, { type: 'SHADER', visible: true, id: sh.id }];
  added++;
}
return { page: page.name, added, kept };"""


def saturation_calls(page_keys):
    led = json.loads(LEDGER.read_text())
    sh = (led.get('shaders') or {}).get('saturation-du-verre') or {}
    if not sh.get('built'):
        raise ValueError('the saturation shader is not built yet (ledger shaders.saturation-du-verre.built)')
    files = []
    for key in page_keys:
        code = SATURATION_CALL % {'page': led['pages'][key], 'shader': sh['built']}
        f = CALLS / ('%03d-saturation-%s.js' % (next_index(), re.sub(r'[^a-z0-9]+', '-', key.lower()).strip('-')[:30]))
        f.write_text(code)
        files.append((f.name, len(code)))
    return files


if __name__ == '__main__' and sys.argv[1] == 'saturation':
    for f in saturation_calls(sys.argv[2:]):
        print(f)
