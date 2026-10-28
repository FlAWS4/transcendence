"""Component library of the Figma rebuild and the instances of the screens (18 October 2026, « passe complète »).

The user asked for no difference at all between the mock-ups and the site. An occurrence of a family therefore becomes an
instance only when the subtree the converter built for it is identical (to 0.1 px, colours, effects and texts included)
to the subtree of a library variant. Only the layer names and the names of the string variables may differ: the words of
each text in French, English and Arabic must be the same (« Projets/Explorer » and « Profils/Explorer » hold the same
words), so the instance keeps the variables of its main component, with no override. Anything else keeps the flat
layers. The variants are built from occurrences by the same converter and renderer as the
screens, so an instance draws exactly what the flat layers drew.

  python3 components.py collect            → ../components/occurrences.json (all light scenes and DARK_RENDER)
  python3 components.py library            → ../components/library.json (variants, reference occurrence, counts)
  python3 components.py calls [families]   → calls/<n>-bibliotheque-<famille>.js (variants built on « Composants »)
  python3 components.py record <json…>     → figma-ledger.json « components.library » (results of the calls)

COMPONENTS_FAKE_IDS=1 gives every variant a placeholder id, for the dry runs of sim_figma.mjs before the library exists.
COMPONENTS_IDS_FILE=<json> takes the ids of a test library instead, in the form record() gives the ledger (18 Oct.):
{family: {"variants": {variant name: id}, "sigs": {variant name: signature}}}.

dom2fig.convert() calls occurrence() for every element that becomes a frame; MODE selects what it does.
"""
import copy
import hashlib
import json
import os
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
BASE = HERE.parent
OUT = BASE / 'components'
LIBRARY_FILE = OUT / 'library.json'

MODE = None          # None: off; 'collect': record the occurrences; 'emit': instances for the library variants
COLLECTED = []
_LIBRARY = None

SECTIONS = {'explore': 'Explorer', 'projects': 'Projets', 'people': 'Profils', 'journal': 'Chroniques', 'awards': '42 Awards'}
AREA_SECTION = {'projects': 'projects', 'profiles': 'people', 'journal': 'journal', 'explorer': 'explore'}


def cls(n):
    return (n.get('cls') or '').split()


def width_name(vw):
    return {1440: 'Ordinateur', 390: 'Mobile', 320: '320 px', 300: '300 px'}.get(round(vw), '%d px' % round(vw))


def direction(n):
    return 'RTL' if (n.get('s') or {}).get('dir') == 'rtl' else 'LTR'


def text_of(n, byI_children):
    out = []
    def walk(m):
        for r in m.get('runs') or []:
            out.append(r.get('t') or '')
        for c in byI_children.get(m['i'], []):
            walk(c)
    walk(n)
    return ' '.join(t for t in out if t).strip()


# family key → (Figma name, root predicate, variant properties). The properties only name the variants: the subtree
# signature decides which occurrences share a variant.
def _props_nav(n, ctx):
    return {'Actif': SECTIONS.get(ctx['section'], ctx['section'] or '—'), 'Format': width_name(ctx['vw']), 'Direction': direction(n)}


def _props_simple(n, ctx):
    return {'Format': width_name(ctx['vw']), 'Direction': direction(n)}


def _props_brand(n, ctx):
    t = text_of(n, ctx['kids'])
    return {'Mot': 'AWARDS' if 'AWARDS' in t.upper() else 'HORIZON', 'Format': width_name(ctx['vw']), 'Direction': direction(n)}


def _props_account(n, ctx):
    has_img = any(c['tag'] == 'img' for c in ctx['kids'].get(n['i'], []))
    return {'Profil': 'Membre' if has_img else 'Visiteur', 'Ouvert': 'Oui' if n.get('aria-expanded') == 'true' else 'Non',
            'Format': width_name(ctx['vw'])}


def _props_scope(n, ctx):
    sec = ctx['section']
    context = 'Explorer' if sec == 'explore' else 'Liste'
    return {'Contexte': context, 'Format': width_name(ctx['vw']), 'Direction': direction(n)}


def _props_favorite(n, ctx):
    return {'Style': 'Compact' if 'cp-favorite-compact' in cls(n) else 'Libellé', 'Pressé': 'Oui' if n.get('aria-pressed') == 'true' else 'Non',
            'Taille': '%d × %d' % (round(n['w']), round(n['h'])), 'Direction': direction(n)}


def _props_more(n, ctx):
    return {'Nombre': text_of(n, ctx['kids']) or '+N', 'Direction': direction(n)}


def _props_page(n, ctx):
    c = cls(n)
    kind = 'Précédent' if 'cp-pagination-previous' in c else 'Suivant' if 'cp-pagination-next' in c else 'Page'
    # 18 Oct.: the site makes a <button disabled> only for a disabled Previous or Next, the others are links
    # (content-pagination-ui.mjs); the captures do not record `disabled`
    state = 'Actuelle' if n.get('aria-current') == 'page' else ('Désactivée' if n['tag'] == 'button' else 'Repos')
    props = {'Type': kind, 'État': state, 'Direction': direction(n)}
    if kind == 'Page':
        props['Numéro'] = text_of(n, ctx['kids']) or '?'
    return props


def _props_card(n, ctx):
    # 18 Oct.: a card of a list, named by its first text (its title in most cards); the same card in other states of
    # the list (sort, filters, views) is the same subtree
    first, title = '', ''
    stack = [n]
    while stack and not title:
        m = stack.pop(0)
        txt = ' '.join((r.get('t') or '').strip() for r in m.get('runs') or []).strip()
        if txt and ('cp-card-title-link' in cls(m) or m['tag'] in ('h2', 'h3')):
            title = txt
        if txt and not first:
            first = txt
        stack = list(ctx['kids'].get(m['i'], [])) + stack
    first = title or first
    return {'Rubrique': SECTIONS.get(ctx['section'], ctx['section'] or '—'), 'Carte': (first[:40] or '?').replace(',', ' ').replace('=', ' '),
            'Format': width_name(ctx['vw']), 'Direction': direction(n)}


def _props_list_part(n, ctx):
    return {'Rubrique': SECTIONS.get(ctx['section'], ctx['section'] or '—'), 'Format': width_name(ctx['vw']), 'Direction': direction(n)}


def _props_label(n, ctx):
    return {'Libellé': (text_of(n, ctx['kids']) or '?')[:40].replace(',', ' ').replace('=', ' '), 'Format': width_name(ctx['vw']), 'Direction': direction(n)}


FAMILIES = [
    ('menu-du-bas', 'Navigation/Menu du bas', lambda n: n['tag'] == 'nav' and 'main-nav' in cls(n), _props_nav),
    ('capsule-recherche', 'Navigation/Capsule de recherche', lambda n: 'dock-search-toggle' in cls(n), _props_simple),
    ('de', 'Navigation/Dé', lambda n: 'random-campus' in cls(n), _props_simple),
    ('remonter', 'Navigation/Remonter en haut', lambda n: 'back-to-top' in cls(n), _props_simple),
    ('fil', 'Navigation/Fil géographique', lambda n: n.get('id') == 'scope-bar', _props_scope),
    ('marque', 'Marque/42 Horizon', lambda n: n['tag'] == 'a' and 'brand' in cls(n), _props_brand),
    ('bouton-compte', 'En-tête/Bouton du compte', lambda n: n.get('id') == 'profile', _props_account),
    ('favori', 'Commandes/Favori', lambda n: 'cp-favorite' in cls(n), _props_favorite),
    ('signaler', 'Commandes/Signaler', lambda n: 'cp-report-trigger' in cls(n), _props_simple),
    ('autres-auteurs', 'Cartes/Autres auteurs (+N)', lambda n: 'cp-author-more' in cls(n), _props_more),
    ('pagination-lien', 'Listes/Lien de pagination', lambda n: 'cp-pagination-link' in cls(n), _props_page),
    # 18 Oct.: larger repeated parts, exact copies only like the others (the instances nested in them are read as their
    # flat variants, _flat; their main components hold flat layers)
    ('declencheur', 'Commandes/Bouton de la barre d’outils', lambda n: 'cp-control-trigger' in cls(n), _props_label),
    # 18 Oct.: no family for .cp-toolbar: it paints nothing, so dom2fig flattens it as a transparent wrapper and never
    # calls occurrence() for it (no occurrence); its buttons are « declencheur »
    ('pagination', 'Listes/Pagination', lambda n: 'cp-pagination' in cls(n), _props_list_part),
    ('retour', 'Commandes/Bouton Retour', lambda n: 'cp-back' in cls(n), _props_label),
    ('carte', 'Cartes/Carte', lambda n: 'cp-card' in cls(n), _props_card),
]
FAMILY_NAMES = {k: name for k, name, _, _ in FAMILIES}
# 18 Oct.: families split into several sets (one per section and format for the cards: hundreds of variants in one set
# would be unwieldy in Figma); the key of such a set is « family|suffix »
SPLIT = {'carte': lambda props: props['Rubrique'] + ' · ' + props['Format']}


def base_key(key):
    return key.split('|', 1)[0]


def family_name(key):
    b = base_key(key)
    return FAMILY_NAMES[b] + (' · ' + key.split('|', 1)[1] if '|' in key else '')
# what each family is on the site, for the description of its set
SELECTORS = {'menu-du-bas': 'nav.main-nav', 'capsule-recherche': '.dock-search-toggle', 'de': '.random-campus', 'remonter': '.back-to-top',
             'fil': '#scope-bar', 'marque': 'a.brand', 'bouton-compte': '#profile', 'favori': '.cp-favorite',
             'signaler': '.cp-report-trigger', 'autres-auteurs': '.cp-author-more', 'pagination-lien': '.cp-pagination-link',
             'declencheur': '.cp-control-trigger', 'pagination': '.cp-pagination',
             'retour': '.cp-back', 'carte': '.cp-card'}


# ------------------------------------------------------------------ signature
SKIP_KEYS = {'n', 'sv', '_z', '_nsc', 'dom', 'ph', 'ch'}
ROOT_ONLY = {'x', 'y', 'fx', 'sk', 'tf'}   # placement of the root in its frame, not part of its appearance


def _norm(v):
    if isinstance(v, float):
        return round(v, 1) + 0.0
    if isinstance(v, list):
        return [_norm(x) for x in v]
    if isinstance(v, dict):
        return {k: _norm(x) for k, x in sorted(v.items())}
    return v


def canonical(node, root=True):
    d = {k: _norm(v) for k, v in node.items() if k not in SKIP_KEYS and not (root and k in ROOT_ONLY)}
    sv = node.get('sv')
    if isinstance(sv, dict):
        # the words of the text in the three languages, not the name of its variable: « Projets/Explorer » and
        # « Profils/Explorer » hold the same words, so the instance can keep the variable of its main component and
        # read the same in every mode of the frame (no override at all)
        d['sv'] = [sv.get('fr', node.get('tx')), sv.get('en'), sv.get('ar')]
    if node.get('ch'):
        d['ch'] = [canonical(c, False) for c in node['ch']]
    return d


def signature(node):
    return hashlib.sha1(json.dumps(canonical(node), sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]


def texts(node):
    """Text layers of a subtree in depth-first order (the order of the text properties)."""
    out = []
    def walk(m):
        if m.get('t') == 'T':
            out.append(m)
        for c in m.get('ch') or []:
            walk(c)
    walk(node)
    return out


# ------------------------------------------------------------------ hook called by dom2fig
def _recorded():
    """18 Oct.: {family: {'variants': {variant name: Figma id}, 'sigs': {variant name: signature}}} of the library built
    in Figma: the ledger (record), a test library (COMPONENTS_IDS_FILE, same form) or placeholders (COMPONENTS_FAKE_IDS=1)."""
    if os.environ.get('COMPONENTS_IDS_FILE'):   # ids of a test library (Archives)
        rec = json.loads(pathlib.Path(os.environ['COMPONENTS_IDS_FILE']).read_text())
        if any(not isinstance(v, dict) or not isinstance(v.get('variants'), dict) or not isinstance(v.get('sigs'), dict) for v in rec.values()):
            raise ValueError('COMPONENTS_IDS_FILE: {family: {"variants": {name: id}, "sigs": {name: signature}}} expected')
        return rec
    if os.environ.get('COMPONENTS_FAKE_IDS'):
        lib = json.loads(LIBRARY_FILE.read_text()) if LIBRARY_FILE.exists() else {}
        return {fam: {'variants': {name: 'fake:%s:%d' % (fam, i) for i, name in enumerate(v['variants'])},
                      'sigs': {name: x['sig'] for name, x in v['variants'].items()}} for fam, v in lib.items()}
    return json.loads((BASE / 'figma-ledger.json').read_text()).get('components', {}).get('library', {})


def component_ids():
    """{family: {variant name: Figma id}} recorded in the ledger (or placeholders with COMPONENTS_FAKE_IDS=1)."""
    return {fam: dict(v.get('variants', {})) for fam, v in _recorded().items()}


def library():
    global _LIBRARY
    if _LIBRARY is None:
        _LIBRARY = json.loads(LIBRARY_FILE.read_text()) if LIBRARY_FILE.exists() else {}
        rec = _recorded()
        for fam, lib in _LIBRARY.items():
            lib['ids'] = dict((rec.get(fam) or {}).get('variants') or {})
            if lib['ids'] and set(lib['ids']) != set(lib['variants']):
                raise ValueError('library.json and the ledger disagree on the variants of ' + fam)
            # 18 Oct.: the names follow the order of the scenes (« Version=2 ») and stay the same when a fix changes a
            # subtree: an id is kept only for a variant whose subtree is the one built in Figma (same signature), the
            # others stay flat (« variante absente de Figma »)
            sigs = (rec.get(fam) or {}).get('sigs') or {}
            if lib['ids'] and set(sigs) != set(lib['ids']):
                raise ValueError('no signature recorded for some variants of ' + fam)
            lib['ids'] = {name: cid for name, cid in lib['ids'].items() if sigs[name] == lib['variants'][name]['sig']}
    return _LIBRARY


FLAT = {}   # family → reason → occurrences kept flat


def _hoistable(fr, clipped):
    """Same walk as dom2fig.hoist_z's gather(): the z-indexes of the descendants its parent's list may pull out."""
    out = []
    for g in fr.get('ch') or []:
        if g.get('_z') and (not clipped or g.get('fx')):
            out.append(g['_z'])
        elif g.get('t') == 'F' and g.get('_nsc') and not g.get('_z') and not g.get('tf'):
            out.extend(_hoistable(g, clipped or g.get('c')))
    return out


def _flat(node):
    """18 Oct.: the subtree as the collect pass saw it. The children of an element are built before it, so in emit mode a
    card or a pagination already holds instances (favourite, « +N », page links) while the library was collected flat:
    each nested instance is read as the frame of its variant (the same subtree by construction) at the place of the
    instance, keeping the _nsc of the variant, so that the signature and the z-indexes the parent may pull out are those
    of the flat layers. Nothing is copied where no instance is nested (the collect pass)."""
    if node.get('t') == 'C':
        fr = variant_frame(node['c'], node['v'])
        if fr is None:
            return node
        out = {k: v for k, v in fr.items() if k not in ROOT_ONLY and k not in ('_z', 'n')}
        out.update({k: node[k] for k in ('x', 'y', 'fx', 'sk', 'tf', '_z', 'n') if k in node})
        return out
    if not node.get('ch'):
        return node
    ch = [_flat(c) for c in node['ch']]
    return node if all(a is b for a, b in zip(ch, node['ch'])) else dict(node, ch=ch)


def occurrence(n, frame, ctx):
    """None (keep the flat frame) or the instance node replacing it."""
    if MODE is None:
        return None
    fam = next(((k, props) for k, _, pred, props in FAMILIES if pred(n)), None)
    if fam is None:
        return None
    key, props_fn = fam
    props = props_fn(n, ctx)
    if key in SPLIT:
        key = key + '|' + SPLIT[key](props)
    # an element without a stacking context of its own whose descendants with a z-index may still be moved into its
    # parent's paint order (dom2fig.hoist_z, after this hook): the instance carries their z-indexes (_hz) and hoist_z
    # puts it back to flat layers when it does pull them (a sibling's z-index crossed), else it stays an instance
    # 18 Oct.: both read on the flat subtree (instances nested in a card or a pagination, _flat)
    flat = _flat(frame)
    hz = _hoistable(flat, flat.get('c')) if (frame.get('_nsc') and not frame.get('_z') and not frame.get('tf')) else []
    sig = signature(flat)
    if MODE == 'collect':
        COLLECTED.append({'family': key, 'props': props, 'sig': sig, 'scene': ctx['scene'], 'lang': ctx['lang'],
                          'theme': ctx['theme'], 'frame': copy.deepcopy(frame), 'texts': [t.get('sv') for t in texts(frame)],
                          '_live': frame})
        return None
    lib = library().get(key)
    if not lib:
        return None
    var = lib['bySig'].get(sig)
    if not var or var not in lib['ids']:
        reason = 'variante inconnue' if not var else 'variante absente de Figma'
        FLAT.setdefault(key, {}).setdefault(reason, 0)
        FLAT[key][reason] += 1
        return None
    node = {'t': 'C', 'c': key, 'v': var, 'n': frame.get('n'), 'x': frame.get('x'), 'y': frame.get('y'), 'w': frame.get('w'), 'h': frame.get('h')}
    for k in ('fx', 'sk', 'tf', '_z'):
        if k in frame:
            node[k] = frame[k]
    if hz:
        node['_hz'] = hz
    return node


# ------------------------------------------------------------------ collection and library
def variant_frame(fam, name):
    """Subtree of a library variant (the reference occurrence), None when unknown."""
    v = (library().get(fam) or {}).get('variants', {}).get(name)
    return v['frame'] if v else None


def scene_done(start):
    """End of a conversion (dom2fig._convert): an occurrence recorded since `start` whose subtree got a glass marked
    « ⟨verre … ⟩ » (dom2fig.glass_under_blur: glass under a weaker blur, it needs a copy of its own screen) is not a
    variant candidate."""
    def marked(m):
        return ' ⟨verre ' in (m.get('n') or '') or any(marked(c) for c in m.get('ch') or [])
    for o in COLLECTED[start:]:
        live = o.pop('_live', None)
        if live is not None and marked(live):
            o['skip'] = 'verre sous un flou'


def collect():
    """Convert every light scene (and DARK_RENDER dark ones) with MODE='collect' and keep the occurrences."""
    global MODE
    import dom2fig
    import layout
    MODE = 'collect'
    COLLECTED.clear()
    seen = set()
    for lf in sorted((BASE / 'layouts').glob('*.json')):
        lay = json.loads(lf.read_text())
        area = lay.get('area', lf.stem)
        for s in lay['sections']:
            for row in s['rows']:
                for f in row:
                    if f['theme'] != 'light' and not layout.dark_render(area, f):
                        continue
                    key = (area, f['state'], f['fmt'], f['lang'], f['theme'])
                    if key in seen:
                        continue
                    seen.add(key)
                    full = f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4
                    try:
                        dom2fig.convert(area, f['state'], f['fmt'], f['lang'], full, theme=f['theme'])
                    except Exception as e:   # a missing capture: reported, not fatal
                        print('  skip', key, repr(e)[:120], file=sys.stderr)
    MODE = None
    OUT.mkdir(exist_ok=True)
    (OUT / 'occurrences.json').write_text(json.dumps(COLLECTED, ensure_ascii=False))
    print(len(COLLECTED), 'occurrences in', len(seen), 'scenes')


def variant_name(props):
    return ', '.join('%s=%s' % (k, v) for k, v in props.items())


def rank(o):
    """Preferred reference of a variant: a light scene, then French, English, Arabic (the pinned modes are fewer)."""
    return (o.get('theme') != 'light', {'fr': 0, 'en': 1, 'ar': 2}.get(o.get('lang'), 3))


def build_library():
    """Group the occurrences by signature: one variant per distinct subtree, named by its properties (« Version=2 »
    when two subtrees share the same properties). The reference is the first occurrence of the best rank (light, French)."""
    occ = [o for o in json.loads((OUT / 'occurrences.json').read_text()) if not o.get('skip')]
    occ.sort(key=rank)   # stable: the order of the scenes is kept within a rank
    lib = {}
    for o in occ:
        fam = lib.setdefault(o['family'], {'name': family_name(o['family']), 'variants': {}, 'bySig': {}, 'count': {}})
        sig = o['sig']
        if sig not in fam['bySig']:
            base = variant_name(o['props'])
            name = base
            i = 2
            while name in fam['variants']:
                name = base + ', Version=%d' % i
                i += 1
            fam['variants'][name] = {'props': o['props'], 'sig': sig, 'scene': o['scene'], 'lang': o['lang'], 'theme': o['theme'],
                                     'frame': o['frame'], 'texts': o['texts'], 'scenes': []}
            fam['bySig'][sig] = name
        fam['count'][fam['bySig'][sig]] = fam['count'].get(fam['bySig'][sig], 0) + 1
        sc = fam['variants'][fam['bySig'][sig]]['scenes']
        if o['scene'] not in sc:
            sc.append(o['scene'])
    # names of the variant properties must be the same within a set: missing ones get « — »
    for fam in lib.values():
        keys = []
        for v in fam['variants'].values():
            for k in v['props']:
                if k not in keys:
                    keys.append(k)
        renamed, bysig = {}, {}
        for name, v in fam['variants'].items():
            props = {k: v['props'].get(k, '—') for k in keys}
            extra = name.split(', Version=')[1] if ', Version=' in name else None
            if extra:
                props['Version'] = extra
            v['props'] = props
            new = variant_name(props)
            renamed[new] = v
            bysig[v['sig']] = new
        if any(', Version=' in n or 'Version=' in n for n in renamed):
            for name, v in list(renamed.items()):
                if 'Version' not in v['props']:
                    v['props']['Version'] = '1'
                    nn = variant_name(v['props'])
                    renamed[nn] = renamed.pop(name)
                    bysig[v['sig']] = nn
        fam['count'] = {bysig[fam['variants'][old]['sig']]: c for old, c in fam['count'].items()}
        fam['variants'], fam['bySig'] = renamed, bysig
    LIBRARY_FILE.write_text(json.dumps(lib, ensure_ascii=False))
    for k, fam in lib.items():
        print('%-18s %3d variantes, %5d occurrences' % (k, len(fam['variants']), sum(fam['count'].values())))
    return lib


# ------------------------------------------------------------------ calls and ledger
FORMAT_ORDER = {'Ordinateur': 0, 'Mobile': 1, '320 px': 2, '300 px': 3}
LIB_HEAD = '// 42 Horizon — appel autonome : bibliothèque de composants, données S et X, puis le moteur render.js (refonte Figma, 18 oct. 2026)'


def _variant_key(v):
    out = []
    for k, val in v['props'].items():
        if k == 'Format':
            out.append((FORMAT_ORDER.get(val, 9), ''))
        elif k == 'Direction':
            out.append((0 if val == 'LTR' else 1, ''))
        else:
            s = str(val)
            out.append((0, s.zfill(6) if s.isdigit() else s))
    return out


def _clean(node, root=True):
    """Variant root as the renderer must build it: no placement in a screen, no converter-only keys."""
    out = {k: v for k, v in node.items() if k not in ('_z', '_nsc') and not (root and k in ('fx', 'sk', 'tf', 'x', 'y'))}
    if node.get('ch'):
        out['ch'] = [_clean(c, False) for c in node['ch']]
    if root:
        out['x'] = out['y'] = 0
    return out


def _scene_fr(scene):
    area, state, fmt, lang = scene.split('--')[:4]
    return '%s · %s · %s · %s · %s' % (area, state, {'desktop': 'ordinateur', 'mobile': 'mobile'}.get(fmt, fmt), lang,
                                     'sombre' if scene.endswith('--dark') else 'clair')


def library_entries(families=None, prefix=''):
    lib = json.loads(LIBRARY_FILE.read_text())
    out = []
    order = [k for b, _, _, _ in FAMILIES for k in sorted(lib) if base_key(k) == b]
    for key in order:
        name = family_name(key)
        if families and key not in families and base_key(key) not in families:
            continue
        fam = lib[key]
        variants = sorted(fam['variants'].items(), key=lambda kv: _variant_key(kv[1]))
        entries = []
        for vname, v in variants:
            n = fam['count'][vname]
            desc = ('Occurrence de référence : %s (relevé du site). %d occurrence%s identique%s dans %d écran%s, au 0,1 px près, '
                    'couleurs, effets et textes des trois langues compris. Signature %s.') % (
                _scene_fr(v['scene']), n, 's' if n > 1 else '', 's' if n > 1 else '', len(v['scenes']), 's' if len(v['scenes']) > 1 else '', v['sig'])
            # 18 Oct.: sig, returned by render.js with the ids (res.sigs) and recorded with them (record)
            entries.append({'name': vname, 'desc': desc, 'lang': v['lang'], 'theme': v['theme'],
                            'pinLang': v['lang'] != 'fr', 'pinTheme': v['theme'] == 'dark', 'sig': v['sig'], 'node': _clean(v['frame'])})
        desc = ('Élément du site %s. Chaque variante est une occurrence relevée telle quelle et construite par le même moteur que '
                'les écrans ; une occurrence devient une instance seulement si elle est identique à une variante, sinon elle reste '
                'à plat. Une variante d’un écran arabe garde la langue arabe, une variante d’une capture sombre le thème sombre ; '
                'les autres suivent la langue et le thème de leur cadre (components.py, 18 oct. 2026).') % SELECTORS[base_key(key)]
        out.append({'key': key, 'setName': prefix + name, 'desc': desc, 'variants': entries})
    return out


def library_calls(families=None, page_key='Composants', prefix='', parent=None):
    """Calls that build the variants of each family on the page « Composants », then combine them into one set (the
    last call of a family). A family larger than one call is split; the variants of one call never exceed the budget."""
    import make_call as mc
    led = json.loads(mc.LEDGER.read_text())
    ctx = mc.context(led)
    page = led['pages'][page_key]
    budget = mc.LIMIT - len(mc.renderer_src(library=True, narrow=True)) - 400 - 2500   # X (icons, assets, photos) and the set description
    calls, cur, size = [], [], 0
    for fam in library_entries(families, prefix):
        names = [v['name'] for v in fam['variants']]
        # 18 Oct.: the list of names the last call of a family carries, reserved with its last variant (60 characters per
        # name were counted: the names of the cards are longer, two calls went over the limit with the current renderer)
        tail = len(mc.dumps(names)) + 20
        chunk = None
        for i, v in enumerate(fam['variants']):
            s = mc.packed_size([v['node']]) + len(v['desc']) + 200 + (tail if i == len(fam['variants']) - 1 else 0)
            if s > budget:
                raise ValueError('variant larger than one call: %s · %s (%d)' % (fam['key'], v['name'], s))
            if size + s > budget and cur:
                calls.append(cur); cur, size, chunk = [], 0, None
            if chunk is None:
                chunk = {'key': fam['key'], 'setName': fam['setName'], 'desc': fam['desc'], 'combine': False, 'variants': []}
                cur.append(chunk)
            chunk['variants'].append(v); size += s
        chunk['combine'] = True
        chunk['names'] = names
    if cur:
        calls.append(cur)
    files = []
    for group in calls:
        S = {'library': copy.deepcopy(group)}
        table, fonts = {}, {}
        reg = mc.dedupe_strings(S, save=False)
        mc.compress(S, table)
        S['VN'] = [k for k, _ in sorted(table.items(), key=lambda kv: kv[1])]
        mc.slim(S, fonts)
        S['FN'] = [list(k) for k, _ in sorted(fonts.items(), key=lambda kv: kv[1])]
        mc.factor_styles(S)
        X = {'page': page, **ctx}
        if parent:
            X['libParent'] = parent
        code = mc.guard_spaces((LIB_HEAD + '\nconst S = %s;\nconst X = %s;\n%s') % (mc.dumps(S), mc.dumps(X), mc.renderer_src(library=True, narrow=mc.NARROW_MARK in mc.dumps(S))))
        if len(code) > 49500:
            raise ValueError('library call of %d characters, above the 50 000 limit of use_figma' % len(code))
        # 18 Oct.: [a-z0-9-] only, as scene_calls names its files: the key of a split family holds « | », spaces and « · »,
        # which broke the couriers' shell commands
        tag = re.sub(r'[^a-z0-9]+', '-', '-'.join(dict.fromkeys(c['key'] for c in group)).lower())[:40].strip('-')
        f = mc.CALLS / ('%03d-bibliotheque-%s.js' % (mc.next_index(), tag))
        f.write_text(code)
        mc.SENT.write_text(json.dumps(reg, ensure_ascii=False))   # 18 Oct.: once the call is written
        files.append((f.name, len(code), sum(len(c['variants']) for c in group), [c['key'] + ('*' if c['combine'] else '') for c in group]))
    return files


def record(paths):
    """Store the sets returned by the library calls (results saved as JSON) in figma-ledger.json. 18 Oct.: with the
    signature of every variant built (res.sigs of each call of its family: give the results of all the calls of a
    family), which must be the one of library.json; a result with tabular-figure styles missing or with variants
    outside the modes of their scenes is refused (a set already built is never rebuilt)."""
    lib = json.loads(LIBRARY_FILE.read_text())
    ledger_path = BASE / 'figma-ledger.json'
    led = json.loads(ledger_path.read_text())
    reg = led.setdefault('components', {}).setdefault('library', {})
    results, sigs = [], {}
    for p in paths:
        res = json.loads(pathlib.Path(p).read_text())
        res = res.get('result', res)
        if res.get('missing') and any(res['missing'].get(k) for k in ('vars', 'icons', 'assets', 'fonts', 'components', 'tabular')):
            raise ValueError('%s: missing %s' % (p, res['missing']))
        if (res.get('stats') or {}).get('modeMismatch'):
            raise ValueError('%s: variants outside the modes of their scenes: %s' % (p, res['stats'].get('modeMismatchNames')))
        for key, r in res['library'].items():
            sigs.setdefault(key, {}).update(r.get('sigs') or {})
        results.append((p, res))
    for p, res in results:
        for key, r in res['library'].items():
            if 'set' not in r:
                continue
            want = set(lib[key]['variants'])
            if set(r['variants']) != want:
                raise ValueError('%s: variants of %s differ from library.json' % (p, key))
            bad = [n for n in sorted(want) if sigs[key].get(n) != lib[key]['variants'][n]['sig']]
            if bad:
                raise ValueError('%s: %d variants of %s without the signature of library.json (other subtree, or result of one '
                                 'of its calls not given): %s' % (p, len(bad), key, ' | '.join(bad[:3])))
            reg[key] = {'name': family_name(key), 'set': r['set'], 'section': r['section'], 'variants': r['variants'],
                        'sigs': {n: sigs[key][n] for n in r['variants']}}
            print(key, len(r['variants']), 'variantes', r['set'])
    ledger_path.write_text(json.dumps(led, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    # 18 Oct.: run through the imported module « components », the one dom2fig calls: as __main__, collect() set MODE on a
    # second copy of this file and dom2fig collected nothing (0 occurrences in 354 scenes)
    import components as _c
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'collect':
        _c.collect()
    elif cmd == 'library':
        _c.build_library()
    elif cmd == 'calls':
        for f in _c.library_calls(sys.argv[2:] or None):
            print(f)
    elif cmd == 'record':
        _c.record(sys.argv[2:])
    else:
        print(__doc__)
