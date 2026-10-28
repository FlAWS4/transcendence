"""Clickable flows of the Figma rebuild (19 October 2026): pages « 09 · Parcours · ordinateur » and « 10 · Parcours · mobile ».

Decisions of the user: two pages of clickable flows, French light, the dark theme by the « Sombre » mode of « 42 · Couleurs »,
windows and panels leading to the exact captured screen, member screens captured for the member flow (18 Oct.); the English
flows use the real English frames (19 Oct., « Écrans anglais exacts »).

Every frame of a flow is a copy of a verified frame of pages 01 to 08, or a member screen rendered by the same engine (layout
« parcours »). A frame taller than the screen becomes a screen-high frame whose page scrolls: the fixed layers of the site
(header, globe pill, scope bar, bottom menu, project sidebar…) leave « Application » for the fixed children of the frame
(Figma keeps the fixed children above the scrolling ones, so the fixed background « Fond » stays in the page and scrolls).
Hotspots are transparent frames over the elements of the site, found in the captures (dom/) by the key of the element that the
offline mapping of the site map recorded (parcours/correspondance-fr.json), or by their structure for the elements present on
every page; the same key gives the English and member boxes.

  python3 parcours.py plan        → ../parcours/plan.json, report on stdout
  python3 parcours.py pages       → calls/<n>-parcours-pages.js (pages 09 and 10 and their sections)
  python3 parcours.py copies      → calls/<n>-parcours-copies-*.js (copies of the frames of pages 01 to 08, converted)
  python3 parcours.py layout      → ../layouts/parcours.json (member screens, rendered by layout.scenes('parcours'))
  python3 parcours.py convert     → calls/<n>-parcours-conversion-*.js (member screens, after their rendering)
  python3 parcours.py links       → calls/<n>-parcours-liens-*.js (hotspots, reactions, flows; needs ../parcours/ids.json)
  python3 parcours.py record      → ../parcours/ids.json (ids of the pages, sections and frames, from call-results/)
  python3 parcours.py correct <tag> <keys…> → calls/<n>-parcours-liens-<fmt>-<tag>-<lot>.js (the links of some frames again)
  python3 parcours.py check       → calls/<n>-parcours-controle-*.js (read-only check of each page after the links)
  python3 parcours.py verify <call-results of the checks…>   → the checks compared with the plan
"""
import gzip, json, pathlib, re, sys
from figlib import BASE
from make_call import CALLS, LEDGER, next_index, guard_spaces
from dom2fig import OPEN_DETAILS_STATES

LAYOUTS, DOM, SCENES, PARC = BASE / 'layouts', BASE / 'dom', BASE / 'scenes', BASE / 'parcours'
VW = {'desktop': 1440, 'mobile': 390}
VH = {'desktop': 960, 'mobile': 844}
PAGES = {'desktop': '09 · Parcours · ordinateur', 'mobile': '10 · Parcours · mobile'}
FMT_LABEL = {'desktop': 'Ordinateur', 'mobile': 'Mobile'}
LANG_LABEL = {'fr': 'Français', 'en': 'English'}
GROUPS = [('entry', 'Entrée'), ('explore', 'Explorer'), ('projects', 'Projets'), ('people', 'Profils'), ('journal', 'Chroniques'),
          ('shared', 'Fenêtres communes'), ('global', 'Recherche'), ('awards', '42 Awards'), ('account', 'Compte'), ('member', 'Parcours membre')]
# member screens captured on 18 Oct. (dom/shell/member-*), and the visitor screen whose links they share
MEMBER = {'member-explore': 'explore', 'member-projects': 'projects', 'member-project': 'project', 'member-people': 'people',
          'member-profile': 'profile', 'member-journal': 'journal', 'member-article': 'article', 'member-awards': 'awards',
          'member-account': None}
MEMBER_OF = {v: k for k, v in MEMBER.items() if v}
# 19 Oct.: the screen whose links a member screen shares; the account page is Leïla Mansour's profile (welcome.mjs, onAccount)
MEMBER_BASE = dict(MEMBER, **{'member-account': 'profile'})
MEMBER_NAMES = {'member-explore': 'Explorer · Monde', 'member-projects': 'Liste des projets', 'member-project': 'Fiche projet',
                'member-people': 'Liste des profils', 'member-profile': 'Fiche profil', 'member-journal': 'Liste des chroniques',
                'member-article': 'Chronique', 'member-awards': 'Page 42 Awards', 'member-account': 'Compte de Leïla Mansour'}
# entrance: the animation steps shown one after the other (« après un délai »); delays from entrance.mjs where it has them
# (LANGUAGE_INTERVAL_MS 4 s, logo 0.6 s, ring 0.8 s, decryption 1.3 s, member fade 0.45 s), others indicative
ARRIVAL = [('arrival-scan-binary', 'arrival-scan-hex', 1.0), ('arrival-scan-hex', 'arrival-scan-return', 1.0),
           ('arrival-scan-return', 'arrival-encrypted', 1.0), ('arrival-encrypted', 'arrival-labels-en', 4.0),
           ('arrival-labels-en', 'arrival-labels-ar', 4.0), ('arrival-labels-ar', 'arrival-encrypted', 4.0)]
# 19 Oct.: in English the message starts in English (arrival-encrypted, captured in English); the frames of the other labels
# were captured in French only: English and Arabic alternate (the French labels, third on the site, have no English flow frame)
ARRIVAL_EN = ARRIVAL[:3] + [('arrival-encrypted', 'arrival-labels-ar', 4.0), ('arrival-labels-ar', 'arrival-labels-en', 4.0),
                            ('arrival-labels-en', 'arrival-labels-ar', 4.0)]
OPENING = ['opening-logo', 'opening-ring-drawing', 'opening-ring', 'reveal-mid', 'reveal-end']
OPENING_DELAYS = [0.6, 0.8, 0.6, 0.6, 0.5]
VISITOR_PATH = [('visitor-transition', 'opening-logo', 0.6)]
MEMBER_PATH = [('decrypt-mid', 'decrypt-final', 1.3), ('decrypt-final', 'member-transition', 0.8), ('member-transition', 'opening-logo', 0.45)]
# not in the flows: branches Figma cannot choose by itself (globe not ready, error), narrow screens, a sheet without entry
EXCLUDED = {'world-wait', 'entry-error', 'entry-signup', 'campus-sheet-mulhouse', 'explore-noglobe', 'back-to-top', 'dock-300', 'dock-320'}
EXCLUDED_NAME = re.compile(r'· (300|320) px')
TABS = {'projects': {None: 'project', 'implementation': 'project-implementation', 'media': 'project-media', 'test': 'project-test',
                     'comments': 'project-comments'},
        'people': {None: 'profile', 'projects': 'profile-projects', 'journey': 'profile-journey', 'contribution': 'profile-contribution'},
        'journal': {None: 'article', 'media': 'article-media', 'authors': 'article-authors', 'comments': 'article-comments'}}
DIE = {'explore': 'explore-campus', 'projects': 'project', 'people': 'profile', 'journal': 'article'}
LISTS = {'explore': 'explore', 'projects': 'projects', 'people': 'people', 'journal': 'journal', 'awards': 'awards'}
GRID = {'desktop': 4, 'mobile': 10}
GAP_X, GAP_Y, TOP = 160, 200, 260


def jload(p):
    return json.loads(p.read_text())


_D = {}


def dump(area, state, fmt, lang):
    k = (area, state, fmt, lang)
    if k not in _D:
        p = DOM / area / f'{state}--{fmt}--{lang}-light.json.gz'
        dd = json.loads(gzip.decompress(p.read_bytes())) if p.exists() else None
        if dd:
            dd['byI'] = {n['i']: n for n in dd['nodes']}
            dd['byK'] = {n['k']: n for n in dd['nodes'] if n.get('k')}
        _D[k] = dd
    return _D[k]


def text_of(dd, n):
    kids = dd.setdefault('kids', {})
    if not kids:
        for m in dd['nodes']:
            kids.setdefault(m.get('p'), []).append(m)
    t = ''.join(r.get('t', '') for r in n.get('runs') or [])
    for c in kids.get(n['i'], []):
        t += text_of(dd, c)
    return t


def pinned(dd, n):
    """'fixed' when the element or an ancestor is position: fixed, or sticky at the top of the page (the header), else None."""
    q = n
    while q is not None:
        pos = (q.get('s') or {}).get('position')
        if pos == 'fixed' or (pos == 'sticky' and q['y'] - float((dd.get('scroll') or [0, 0])[1] or 0) < 2):
            return 'fixed'
        q = dd['byI'].get(q.get('p'))
    return None


class Box(list):
    """A zone box; inside: the inner scroll container it lies in ({'path', 'x', 'y'} of its layer in the frame), its box
    then being in the coordinates of that layer."""
    inside = None


def scroller(dd, n):
    """The inner scroll container of the element n (overflow auto or scroll, smaller than the page), or None."""
    q = dd['byI'].get(n.get('p'))
    while q is not None:
        if (q.get('s') or {}).get('overflow') in ('auto', 'scroll') and q['h'] < 0.9 * float(dd['doc'][1]):
            return q
        if (q.get('s') or {}).get('position') == 'fixed':
            return None
        q = dd['byI'].get(q.get('p'))
    return None


def seen(dd, n, upto=None):
    """The visible part of the element n in the page, (x, y, w, h), or None: clipped by the ancestors that hide their overflow
    and clip it (the containing blocks of an absolute box, never the ancestors of a fixed one), hidden by an opacity of 0;
    with upto, only by the ancestors inside that scroll container, which Figma scrolls and clips itself.
    19 Oct.: the last options of a menu that scrolls inside got a zone over the search and the die."""
    x0, y0, x1, y1 = n['x'], n['y'], n['x'] + n['w'], n['y'] + n['h']
    s = n.get('s') or {}
    if s.get('opacity') == '0':
        return None
    if s.get('position') == 'fixed':
        return (x0, y0, x1 - x0, y1 - y0)
    escaping = s.get('position') == 'absolute'
    q = dd['byI'].get(n.get('p'))
    while q is not None:
        if q is upto:
            break
        qs = q.get('s') or {}
        pos = qs.get('position')
        if qs.get('opacity') == '0':
            return None
        if escaping and (pos in ('relative', 'absolute', 'sticky', 'fixed') or (qs.get('transform') or 'none') != 'none'):
            escaping = False
        if not escaping and qs.get('overflow') in ('hidden', 'clip', 'auto', 'scroll'):
            x0, y0, x1, y1 = max(x0, q['x']), max(y0, q['y']), min(x1, q['x'] + q['w']), min(y1, q['y'] + q['h'])
            if x1 - x0 < 2 or y1 - y0 < 2:
                return None
        if pos == 'fixed':
            break
        if pos == 'absolute':
            escaping = True
        q = dd['byI'].get(q.get('p'))
    return (x0, y0, x1 - x0, y1 - y0)


def hash_of(href):
    """The route of a link of the prototype: its hash, also for a full address of the page (the mentions « @… » of the
    comments, 19 Oct.); None for another site."""
    h = href or ''
    if h.startswith('#'):
        return h
    if '#' in h and re.search(r'//(127\.0\.0\.1|localhost)[:/].*horizon-welcome/', h):
        return '#' + h.split('#', 1)[1]
    return None


def route_of(dd):
    """Route of a capture: the hash of its address, with only the parameters that change the screen."""
    u = dd.get('url') or ''
    return norm_route('#' + u.split('#', 1)[1] if '#' in u else ((dd.get('meta') or {}).get('routeOpened') or ''))


def norm_route(r):
    """A tab, a page of a list, the country and the campus of Explorer; not the place a link focuses (?focus=team), the page 1
    of a list, nor the scope that a fiche keeps in its address (the account page: #people/…?country=FRA&campus=paris)."""
    path, _, q = (r or '').partition('?')
    keys = ('tab', 'page', 'country', 'campus') if path.startswith('#explore') else ('tab', 'page')
    keep = [p for p in q.split('&') if p.split('=')[0] in keys and p != 'page=1'] if q else []
    return path + ('?' + '&'.join(keep) if keep else '')


def minus(b, o):
    """The parts of the box b outside the box o: at most four boxes (above, below, left, right)."""
    x0, y0, x1, y1 = b[0], b[1], b[0] + b[2], b[1] + b[3]
    ox0, oy0, ox1, oy1 = o[0], o[1], o[0] + o[2], o[1] + o[3]
    if ox0 >= x1 or ox1 <= x0 or oy0 >= y1 or oy1 <= y0:
        return [b]
    my0, my1 = max(y0, oy0), min(y1, oy1)
    parts = [[x0, y0, x1 - x0, oy0 - y0] if oy0 > y0 else None, [x0, oy1, x1 - x0, y1 - oy1] if oy1 < y1 else None,
             [x0, my0, ox0 - x0, my1 - my0] if ox0 > x0 else None, [ox1, my0, x1 - ox1, my1 - my0] if ox1 < x1 else None]
    return [[round(v, 1) for v in p] for p in parts if p]


def frames():
    """Light frames of the plans: {(state, fmt, lang): frame} with area and page."""
    out = {}
    for p in LAYOUTS.glob('*.json'):
        if p.stem == 'parcours':
            continue
        lay = jload(p)
        for s in lay['sections']:
            for r in s['rows']:
                for f in r:
                    if f['theme'] == 'light' and f['lang'] in ('fr', 'en'):
                        out[(f['state'], f['fmt'], f['lang'])] = dict(f, area=lay.get('area', lay['key']), page=lay['page'], section=s['id'])
    return out


class Plan:
    def __init__(self):
        self.map = jload(PARC / 'correspondance-fr.json')
        self.src = frames()
        self.led = jload(LEDGER)
        self.problems = []
        self._scenes, self._titles = {}, {}
        self.state_screen, self.state_group, self.overlay = {}, {}, set()
        for sid, sc in self.map['screens'].items():
            for fmt in ('desktop', 'mobile'):
                for f in sc.get(fmt) or []:
                    self.state_screen.setdefault(f['state'], sid)
                    self.state_group.setdefault(f['state'], sc['group'])
                    if sc['kind'] == 'overlay':
                        self.overlay.add(f['state'])

    # ------------------------------------------------------------ frames of the flows
    def flow_frames(self):
        """{(fmt, lang, flow, state): entry}; flow 'v' (visitor, default) or 'm' (member path through the entrance)."""
        self.F = {}
        ids = self.led['frames']
        for fmt in ('desktop', 'mobile'):
            fr = {st for (st, f, l) in self.src if f == fmt and l == 'fr'}
            for lang in ('fr', 'en'):
                for st in sorted(fr):
                    if st in EXCLUDED or EXCLUDED_NAME.search(self.src[(st, fmt, 'fr')]['name']):
                        continue
                    if st not in self.state_screen and not st.startswith(('arrival', 'decrypt', 'opening', 'reveal', 'visitor-', 'member-')):
                        continue
                    srcf = self.src.get((st, fmt, lang)) or self.src[(st, fmt, 'fr')]
                    shared = srcf['lang'] != lang   # an entrance step drawn without words, copied from the French frame
                    self._add(fmt, lang, 'v', st, srcf, ids, shared)
                    if st in OPENING:
                        self._add(fmt, lang, 'm', st, srcf, ids, shared)
                for st, name in MEMBER_NAMES.items():
                    if dump('shell', st, fmt, lang) is None:
                        self.problems.append('relevé membre absent : %s %s %s' % (st, fmt, lang))
                        continue
                    dd = dump('shell', st, fmt, lang)
                    h = max(dd['doc'][1], VH[fmt])
                    self.F[(fmt, lang, 'v', st)] = {'fmt': fmt, 'lang': lang, 'flow': 'v', 'state': st, 'area': 'shell', 'member': True,
                                                     'name': '%s · membre — %s · Clair%s' % (name, FMT_LABEL[fmt], '' if lang == 'fr' else ' · English'),
                                                     'w': VW[fmt], 'h': h, 'group': 'member', 'source': None, 'srcLang': lang}
        return self.F

    def _add(self, fmt, lang, flow, st, srcf, ids, shared):
        name = srcf['name'] + (' · parcours membre' if flow == 'm' else '') + (' · parcours English' if shared else '')
        fid = (ids.get(srcf['page']) or {}).get(srcf['name'])
        if not fid:
            self.problems.append('cadre sans identifiant au registre : ' + srcf['name'])
        self.F[(fmt, lang, flow, st)] = {'fmt': fmt, 'lang': lang, 'flow': flow, 'state': st, 'area': srcf['area'], 'member': flow == 'm',
                                         'name': name, 'w': srcf['w'], 'h': srcf['h'], 'group': 'entry' if flow == 'm' else self.state_group.get(st, 'entry'),
                                         'source': {'id': fid, 'page': srcf['page'], 'name': srcf['name']}, 'srcLang': srcf['lang']}

    @staticmethod
    def retarget(state, text):
        """19 Oct.: the fiches captured for one project or profile: minishell (« projet à campus unique »), Inès Morel
        (Alumni) and Noé Laurent (Transcender); every other card leads to the fiche of the base frame."""
        if state == 'project' and 'minishell' in text:
            return 'project-single'
        if state == 'profile' and 'Inès Morel' in text:
            return 'profile-alumni'
        if state == 'profile' and 'Noé Laurent' in text:
            return 'profile-transcender'
        return state

    def member_ctx(self, F):
        return F['member'] or F['state'] in ('account-member', 'messages', 'notifications', 'decrypt-mid', 'decrypt-final', 'member-transition')

    def target(self, F, state, flow=None):
        """Key of the frame a link of F leads to: same format and language; the member version of a screen in the member flow."""
        fmt, lang = F['fmt'], F['lang']
        if self.member_ctx(F) and state in MEMBER_OF and (fmt, lang, 'v', MEMBER_OF[state]) in self.F:
            return (fmt, lang, 'v', MEMBER_OF[state])
        fl = flow or ('m' if F['flow'] == 'm' and state in OPENING else 'v')
        k = (fmt, lang, fl, state)
        return k if k in self.F else None

    # ------------------------------------------------------------ geometry
    def full(self, F):
        return F['h'] > VH[F['fmt']] + 4

    def box(self, F, dd, n):
        """Box of the element n in the flow frame: the page from its top in a frame taller than the screen (the frame keeps its
        page, only its height changes), the screen as captured otherwise; a fixed element at its place on the screen."""
        sy = float((dd.get('scroll') or [0, 0])[1] or 0)
        fx = pinned(dd, n)
        # 19 Oct.: a button the site leaves inert (cursor by default): the scope pill of a fiche being read (reading-scope.mjs);
        # among the 1 320 buttons with a zone, the only ones (52)
        if n['tag'] == 'button' and (n.get('s') or {}).get('cursor') == 'default':
            return None, fx
        # 19 Oct.: in a screen-high frame, an element of a menu, a panel or a sheet that scrolls inside gets its zone in the
        # layer of that container, which the links call makes scroll (« Commentaires » of « Dans ce projet », the people
        # found by the search)
        sc = scroller(dd, n) if not self.full(F) else None
        lay = self.layer_of(F, dd, sc) if sc is not None else None
        v = seen(dd, n, sc if lay else None)
        if v is None:
            return None, fx
        # 19 Oct.: mostly hidden by an ancestor (a result of the search under the edge of its panel, which does not scroll in
        # Figma): no zone on the strip that remains
        if v[3] < min(20, 0.5 * n['h']) or v[2] < min(20, 0.5 * n['w']):
            return None, fx
        if n['tag'] in ('a', 'button'):
            # 19 Oct.: a button or a link reacts on all it draws: the label « 42 Paris » above the crosshair of the campus
            kids = dd.setdefault('kids', {})
            if not kids:
                for m in dd['nodes']:
                    kids.setdefault(m.get('p'), []).append(m)
            x0, y0, x1, y1 = v[0], v[1], v[0] + v[2], v[1] + v[3]
            stack = list(kids.get(n['i'], []))
            while stack:
                m = stack.pop()
                stack += kids.get(m['i'], [])
                u = seen(dd, m, sc if lay else None) if m['w'] > 1 and m['h'] > 1 and (m.get('s') or {}).get('position') != 'fixed' else None
                if u:
                    x0, y0, x1, y1 = min(x0, u[0]), min(y0, u[1]), max(x1, u[0] + u[2]), max(y1, u[1] + u[3])
            v = (x0, y0, x1 - x0, y1 - y0)
        if lay:
            b = Box([round(v[0] - sc['x'], 1), round(v[1] - sc['y'], 1), round(v[2], 1), round(v[3], 1)])
            b.inside = lay
            return b, fx
        # 19 Oct.: the content of a closed <details> (the selector « Dans ce … » of a phone) is laid out, not drawn (dom2fig)
        if (MEMBER_BASE.get(F['state']) or F['state']) not in OPEN_DETAILS_STATES:
            q = n
            while q is not None and q['tag'] != 'summary':
                if q['tag'] == 'details' and q is not n:
                    return None, fx
                q = dd['byI'].get(q.get('p'))
        x, y, w, h = v
        if fx or not self.full(F):
            y -= sy
        W, H = F['w'], (VH[F['fmt']] if (fx or not self.full(F)) else F['h'])
        x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
        if x1 - x0 < 2 or y1 - y0 < 2:
            return None, fx
        return [round(x0, 1), round(y0, 1), round(x1 - x0, 1), round(y1 - y0, 1)], fx

    def dd(self, F):
        return dump('shell' if F['state'] in MEMBER else F['area'], F['state'], F['fmt'], F['srcLang'])

    # ------------------------------------------------------------ hotspots
    def hotspots(self):
        self.H = {k: [] for k in self.F}
        self.auto = {}
        self.missing = []
        self._routes()
        self.OV, self.CUT = {}, {}
        for k, F in self.F.items():
            dd = self.dd(F)
            if dd is None:
                self.problems.append('relevé absent : ' + F['name'])
                continue
            self.OV[k] = self._overlays(k, F, dd)
            modal = any(o['modal'] for o in self.OV[k])
            # 19 Oct.: what covers the page beyond the windows and menus: the header of a screen-high frame (a capture scrolled
            # under it) and the favourite hearts of the cards, which do not open them
            head = next((n for n in dd['nodes'] if n['tag'] == 'header' and pinned(dd, n)), None)
            hb = self.box(F, dd, head)[0] if head is not None and not self.full(F) else None
            hearts = [self.box(F, dd, n)[0] for n in dd['nodes'] if n['tag'] == 'button' and 'cp-favorite' in (n.get('cls') or '').split()]
            self.CUT[k] = {'head': list(hb) if hb else None, 'inert': [list(x) for x in hearts if x and not getattr(x, 'inside', None)]}
            self._variants(k, F, dd)   # first: the dedicated captures win over the links of the mapping on the same element
            self._links(k, F, dd)
            self._inherit(k, F, dd)
            # 19 Oct.: beside a menu or a panel that does not cover the page, the page and the bottom menu still react
            if F['group'] != 'entry' and not modal and (F['state'] not in self.overlay or self.OV[k]):
                self._globals(k, F, dd)
            self._close(k, F, dd)
            self._tabs(k, F, dd)
            self._panels(k, F, dd)
            self._extra(k, F, dd)
        self._sequences()
        for k in self.H:
            self.H[k] = self._dedupe(self.H[k])
        self._closing()
        for k in self.H:
            self.H[k] = self._layers(k)

    def add(self, k, box, fx, action, label, key=None, close=False):
        # 19 Oct.: never a zone that leads to its own frame (the open search covered its results with one)
        if box and action and action.get('nav') != k:
            h = {'box': list(box), 'fixed': bool(fx), 'act': action, 'label': label, 'key': key}
            if getattr(box, 'inside', None):
                h['in'] = box.inside
            if close:
                h['close'] = True
            self.H[k].append(h)

    def layer_of(self, F, dd, sc):
        """The layer drawn for the DOM element sc in a screen-high frame, from the scene of the frame: {'path' of names from the
        frame, 'x', 'y'} of the deepest clipping frame with its box, or None."""
        sk = '%s--%s--%s--%s' % ('shell' if F['state'] in MEMBER else F['area'], F['state'], F['fmt'], F['srcLang'])
        if sk not in self._scenes:
            p = SCENES / f'{sk}.json'
            self._scenes[sk] = jload(p) if p.exists() else None
        scn = self._scenes[sk]
        if scn is None:
            return None
        sy = float((dd.get('scroll') or [0, 0])[1] or 0)
        want = (sc['x'], sc['y'] - sy, sc['w'], sc['h'])
        best = None

        def walk(n, ox, oy, path, depth):
            nonlocal best
            x, y = ox + (n.get('x') or 0), oy + (n.get('y') or 0)
            if n.get('t') == 'F' and n.get('c') and all(abs(a - b) < 1.5 for a, b in zip((x, y, n.get('w') or 0, n.get('h') or 0), want)):
                if best is None or depth > best[0]:
                    best = (depth, path + [n.get('n') or ''], x, y)
            for c in n.get('ch') or []:
                walk(c, x, y, path + [n.get('n') or ''], depth + 1)
        for c in scn['ch']:
            walk(c, 0, 0, [], 0)
        # 19 Oct.: names as the renderer leaves them in Figma: the marker of a glass (« ⟨verre r⟩ », removed by glassCopies)
        # or of a placeholder (« ⟨pN⟩ ») is gone (the window of the filters had lost the zones of its body, 1912)
        path = [re.sub(r' ⟨(p\d+|verre [\d.]+)⟩$', '', p) for p in best[1]] if best else None
        return {'path': path, 'x': round(best[2], 1), 'y': round(best[3], 1), 'w': round(want[2], 1), 'h': round(want[3], 1)} if best else None

    def search_target(self, F, text):
        """19 Oct.: a result of the search (a button, without address): the captured fiche whose title begins the result
        (ft_transcendence, minishell, Leïla Mansour…), else the screen of its kind captured for the base frame, as the
        other cards."""
        key = (F['fmt'], F['lang'])
        if key not in self._titles:
            tt = {}
            for st in ('project', 'project-single', 'profile', 'profile-alumni', 'profile-transcender', 'article'):
                sf = self.src.get((st, F['fmt'], F['srcLang'])) or self.src.get((st, F['fmt'], 'fr'))
                d = dump(sf['area'], st, F['fmt'], sf['lang']) if sf else None
                h1 = next((n for n in (d or {}).get('nodes', []) if n['tag'] == 'h1'), None)
                if h1:
                    tt[re.sub(r'\s+', ' ', text_of(d, h1)).strip()] = st
            self._titles[key] = tt
        st = next((s for title, s in self._titles[key].items() if title and text.startswith(title)), None)
        st = st or next((s for w, s in (('Campus', 'explore-campus'), ('Projet', 'project'), ('Project', 'project'), ('Profil', 'profile'),
                                        ('Profile', 'profile'), ('Chroniques', 'article'), ('Chronicles', 'article'), ('Chronicle', 'article')) if text.endswith(w)), None)
        return self.target(F, st) if st else None

    # ------------------------------------------------------------ routes, windows and menus (19 Oct.)
    def _routes(self):
        """Route of every flow frame and, for every route, the screen under its windows and menus: the one state of the route
        that is not a window, or the one named like its screen of the site map (projects, not projects-sort-open)."""
        self.route, cand = {}, {}
        for k, F in self.F.items():
            dd = self.dd(F)
            if dd is None:
                continue
            r = self.route[k] = route_of(dd)
            st = F['state']
            if F['flow'] != 'v' or st in MEMBER or st in self.overlay or F['group'] == 'entry':
                continue
            cand.setdefault((F['fmt'], F['lang'], r), []).append(st)
        self.base = {key: ([s for s in sts if self.state_screen.get(s) == s] or sorted(sts, key=len))[0] for key, sts in cand.items()}

    def by_route(self, F, href):
        """Key of the captured screen of an address (same format and language; its member version in the member flow)."""
        st = self.base.get((F['fmt'], F['lang'], norm_route(href)))
        return self.target(F, st) if st else None

    def beneath(self, k):
        """Key of the screen under the window or the menu of the frame k (its route), or None."""
        F = self.F[k]
        st = self.base.get((F['fmt'], F['lang'], self.route.get(k)))
        return self.target(F, st) if st and st != (MEMBER_BASE.get(F['state']) or F['state']) else None

    @staticmethod
    def href_of(dd, n):
        """The address an element leads to: its own, the link it is in, or the first link of its card."""
        q = n
        while q is not None:
            if q['tag'] == 'a' and hash_of(q.get('href')):
                return hash_of(q['href'])
            if 'cp-card' in (q.get('cls') or '').split():
                kids = dd.setdefault('kids', {})
                if not kids:
                    for m in dd['nodes']:
                        kids.setdefault(m.get('p'), []).append(m)
                stack = list(kids.get(q['i'], []))
                while stack:
                    m = stack.pop(0)
                    if m['tag'] == 'a' and hash_of(m.get('href')):
                        return hash_of(m['href'])
                    stack[:0] = kids.get(m['i'], [])
                return None
            q = dd['byI'].get(q.get('p'))
        return None

    def no_op(self, k, dd, n):
        """19 Oct.: a link to the address of the page itself (the active tab, the current page of a list): 'skip', the site
        changes nothing; 'close' beside a menu or a panel open, which the click closes; None for any other element."""
        h = self.href_of(dd, n)
        if not h or norm_route(h) != self.route.get(k):
            return None
        ov = self.OV.get(k) or []
        if not ov:
            return 'skip'
        key = n.get('k') or ''
        return None if any(key == o['key'] or key.startswith(o['key'] + '>') for o in ov) else 'close'

    OVERLAY_ROOT = re.compile(r'(^|\s)(cp-control-panel|account-menu|scope-popover|dock-search-panel|dock-search-form|cp-mention-picker|'
                              r'cp-comment-owner-menu|cp-project-switch-panel|cp-profile-switch-panel)(\s|$)')

    def _overlays(self, k, F, dd):
        """Windows and menus open in the capture: the elements it has and the screen under it (same route) has not, or a
        selector « Dans ce … » opened in place. modal: a <dialog> (all are opened with showModal, the page under the veil does
        not react); outside: a click beside it closes it (every menu, welcome.mjs and the modules of the controls; every window
        but « Envoyer un message », profile-ui.mjs)."""
        st = MEMBER_BASE.get(F['state']) or F['state']
        b = self.base.get((F['fmt'], F['lang'], self.route.get(k)))
        if F['state'] in MEMBER or b is None or b == st or F['group'] == 'entry' and st not in self.overlay:
            return []
        bf = self.src.get((b, F['fmt'], F['srcLang'])) or self.src.get((b, F['fmt'], 'fr'))
        bd = dump(bf['area'], b, F['fmt'], bf['lang']) if bf else None
        if bd is None:
            return []
        new = {n['k'] for n in dd['nodes'] if n.get('k') and n['k'] not in bd['byK']}
        # 19 Oct.: the outermost window or menu among the new elements, even inside a new subtree (the menu ⋮ of a comment
        # that the screen under it does not have)
        cand = [n for n in dd['nodes'] if n.get('k') in new and (n['tag'] == 'dialog' or self.OVERLAY_ROOT.search(n.get('cls') or ''))]
        ck = {n['k'] for n in cand}
        roots = [n for n in cand if not any(n['k'].startswith(k + '>') for k in ck)]
        if st in OPEN_DETAILS_STATES:
            roots += [n for n in dd['nodes'] if re.search(r'cp-(project|profile)-switch-panel', n.get('cls') or '')]
        out = []
        for n in roots:
            cls = n.get('cls') or ''
            if n['w'] < 3 or n['h'] < 3:
                continue
            bx, fx = self.box(F, dd, n)
            if bx:
                out.append({'key': n['k'], 'box': bx, 'fixed': bool(fx), 'modal': n['tag'] == 'dialog',
                            'outside': 'cp-profile-message-dialog' not in cls, 'what': n['tag'] + '.' + (cls.split() or [''])[0]})
        return out

    # 19 Oct. (second reading of the boards): the windows the site closes together with the window they open from — the
    # sub-panels of the account (its « × » closes the whole menu, account-menu.mjs), the deployed filters and campus sheet
    # (their « × » closes them), the windows of sign-in and account creation (the account panel closed when they opened);
    # a first rule, « every window reachable from another one », sent Signaler, the viewer, « Autour du campus » or the
    # account panel itself to one fixed screen whatever the page they were opened from
    CLOSE_BENEATH = {'account-settings', 'account-theme', 'account-language', 'filter-projects-expanded', 'filter-people-expanded',
                     'campus-sheet-expanded', 'signin-dialog', 'signup-dialog'}

    def _closing(self):
        """Closing a window or a menu (its close and cancel controls, a click beside it): back to the previous screen; to the
        screen under it for the windows of CLOSE_BENEATH, where the previous screen would be the window they opened from."""
        windowish = lambda s: bool(self.OV.get(s)) or self.F[s]['state'] in self.overlay
        self.closer = {}
        for k, F in self.F.items():
            if not windowish(k):
                continue
            under = self.beneath(k) if F['state'] in self.CLOSE_BENEATH else None
            self.closer[k] = {'nav': under} if under else {'back': 1}
            for h in self.H[k]:
                if h.get('close'):
                    h['act'] = dict(self.closer[k])

    def _layers(self, k):
        """Zones of a frame with a window or a menu open: under a window (modal) the page does not react and its veil closes
        it; a menu or a panel covers what it hides (the zones of the page are cut around it), and a click beside it closes
        it. Then the order of the zones, from the bottom: beside the menu, the page, what stays on the screen (header, bottom
        menu), the veil, the window or the menu; the larger first, so a small zone stays above a large one."""
        F, hs, ov = self.F[k], self.H[k], self.OV.get(k) or []
        inside = lambda h: bool(h.get('key')) and any(h['key'] == o['key'] or h['key'].startswith(o['key'] + '>') for o in ov)
        cut = self.CUT.get(k) or {}

        def trim(h, boxes):
            rest = [h['box']]
            for o in boxes:
                rest = [p for r in rest for p in minus(r, o)]
            return [dict(h, box=r) for r in rest if r[2] >= 8 and r[3] >= 8]
        meets = lambda a, b: a[0] < b[0] + b[2] and b[0] < a[0] + a[2] and a[1] < b[1] + b[3] and b[1] < a[1] + a[3]
        out = []
        modal = any(o['modal'] for o in ov)
        for h in hs:
            if h.get('in'):
                out.append(h)
                continue
            if ov and inside(h):
                parts = [h]
            elif modal:
                continue
            else:
                # a menu or a panel covers what it hides; the header and the bottom menu stay above a menu drawn in the page
                # (19 Oct.: the mention list had taken the search and the die away)
                parts = trim(h, [o['box'] for o in ov if not (h['fixed'] and not o['fixed'])])
                if cut.get('head') and not h['fixed']:
                    parts = [p for q in parts for p in trim(q, [cut['head']])]
            hearts = [b for b in cut.get('inert') or [] if any(meets(q['box'], b) for q in parts)]
            out += [p for q in parts for p in (trim(q, hearts) if hearts else [q])]
        if ov:
            if all(o['outside'] for o in ov) and k in self.closer and not self.full(F):   # every window and menu frame is screen-high
                bands = [[0, 0, F['w'], VH[F['fmt']]]]
                for o in ov:
                    bands = [p for r in bands for p in minus(r, o['box'])]
                for r in bands:
                    if r[2] >= 4 and r[3] >= 4:
                        out.append({'box': r, 'fixed': True, 'act': dict(self.closer[k]), 'label': 'À côté de la fenêtre' if modal else 'À côté du menu',
                                    'key': None, 'layer': 'veil' if modal else 'beside'})

        def rank(h):
            if h.get('layer') == 'beside':
                return 0
            if h.get('layer') == 'veil':
                return 3
            if ov and inside(h):
                return 4
            return 2 if h['fixed'] else 1
        return sorted(out, key=lambda h: (rank(h), -h['box'][2] * h['box'][3]))

    def _links(self, k, F, dd):
        for l, d in self._mapped(F['fmt'], MEMBER_BASE.get(F['state']) or F['state']):
            n = dd['byK'].get((d or {}).get('key'))
            if n is None:
                if d:
                    self.missing.append((F['name'], l['via'], d.get('key')))
                continue
            self._link_zone(k, F, dd, l, n)
        # the search opener is found by its structure in _globals()

    def _mapped(self, fmt, state):
        """(link, DOM evidence) of the mapping for the elements of a screen, alternative hotspots included; the links of the
        elements present everywhere are found by _globals()."""
        for l in self.map['links']:
            if l['fmt'] != fmt or l.get('fromScreen') or l.get('status') in ('sans zone', 'sans cadre de départ', 'grisé', 'automatique'):
                continue
            if state not in [(l.get('fromFrame') or {}).get('state')] + [a.get('state') for a in l.get('alsoFrom') or []]:
                continue
            for d in [(l.get('evidence') or {}).get('dom')] + [a.get('dom') for a in l.get('altHotspots') or []]:
                yield l, d

    def _link_zone(self, k, F, dd, l, n):
        b, fx = self.box(F, dd, n)
        if l.get('kind') == 'out' and l.get('url'):
            self.add(k, b, fx, {'url': l['url']}, l['via'], n.get('k'))
        elif l.get('kind') == 'back' or l.get('status') == 'libellé différent':
            self.add(k, b, fx, self.back_target(F, dd, n), l['via'], n.get('k'))
        else:
            to = (l.get('toFrame') or {}).get('state')
            # 19 Oct.: « Continuer avec le profil, puis l'avatar »: the site closes the window and leaves the page in member
            # mode (welcome.mjs, requestAccountAccess); the avatar of that page opens the account panel
            if to == 'account-member' and F['state'] in ('signin-dialog', 'signup-dialog'):
                t = self.member_page(k)
            elif self.no_op(k, dd, n) == 'skip':
                return
            elif self.no_op(k, dd, n) == 'close':
                self.add(k, b, fx, {'back': 1}, l['via'] + ' · fermer le menu', n.get('k'), close=True)
                return
            else:
                t = self.link_target(F, dd, n, to) if to else None
            if t:
                self.add(k, b, fx, {'nav': t}, l['via'], n.get('k'))
            elif to:
                self.missing.append((F['name'], l['via'], 'arrivée hors parcours : ' + to))

    def link_target(self, F, dd, n, to):
        """19 Oct.: the captured screen of the element's address when it is of the kind the mapping expects (the card of
        minishell and its « +1 », Noé Laurent in a team, the last page of a list); else the screen of the mapping: the
        fiche captured for the name of the card (retarget), or the fiche of the base frame."""
        fam = lambda s: self.state_screen.get(MEMBER_BASE.get(s) or s)
        href = self.href_of(dd, n)
        t = self.by_route(F, href) if href else None
        if t and fam(self.F[t]['state']) == fam(to):
            return t
        return self.target(F, self.retarget(to, text_of(dd, n))) or self.target(F, to)

    def back_target(self, F, dd, n):
        """19 Oct.: where a « back » control of the site leads (welcome.mjs): the scope bar to the world or the country (« ← »
        to the level above, « Revenir au monde » and « Monde » to the world, the country to the country), « Retour aux … » to
        the list it names (returnFromContent goes back to the list, over the tabs); else the previous screen."""
        nid = n.get('id') or ''
        if nid in ('reset', 'scope-world') or (nid == 'scope-back' and F['state'].endswith('country')):
            t = self.target(F, 'explore')
        elif nid in ('scope-back', 'scope-country'):
            t = self.target(F, 'explore-country')
        else:
            s = re.sub(r'\s+', ' ', text_of(dd, n)).strip().lower()
            lst = next((v for w, v in (('projet', 'projects'), ('project', 'projects'), ('profil', 'people'), ('chroniques', 'journal'), ('chronicles', 'journal')) if s.startswith(('retour aux ' + w, 'back to ' + w))), None)
            t = self.target(F, lst) if lst else None
        return {'nav': t} if t else {'back': 1}

    def member_page(self, k):
        """The member version of the page under the window of k."""
        F = self.F[k]
        m = MEMBER_OF.get(self.base.get((F['fmt'], F['lang'], self.route.get(k))))
        return (F['fmt'], F['lang'], 'v', m) if m and (F['fmt'], F['lang'], 'v', m) in self.F else None

    @staticmethod
    def same_element(sd, sn, dd, n):
        """The element n of a capture is the element sn of another one: same tag, about the same size, and the same text or a
        link to the same kind of address (a card of the list, a member of the team)."""
        if sn['tag'] != n['tag'] or abs(sn['w'] - n['w']) > max(8, 0.25 * sn['w']) or abs(sn['h'] - n['h']) > max(8, 0.25 * sn['h']):
            return False
        norm = lambda d, m: re.sub(r'\s+', ' ', text_of(d, m)).strip()
        if norm(sd, sn) == norm(dd, n):
            return True
        if 'cp-card' in (sn.get('cls') or '').split() and 'cp-card' in (n.get('cls') or '').split():
            return True   # 19 Oct.: a card of a list at the same place (the profile cards have no link: the site opens them)
        kind = lambda h: (re.match(r'#\w+/', h or '') or [None])[0]
        a, b = kind(Plan.href_of(sd, sn)), kind(Plan.href_of(dd, n))
        return bool(a) and a == b

    def _inherit(self, k, F, dd):
        """19 Oct.: links of the screens whose elements a frame shares, where the mapping did not list the frame: the header of
        a fiche in its tabs (« Retour aux … », Signaler, the campus, the team), the list in its variants (cards), the shell of
        Explorer in the country and the campus (« Exploration · 42 Horizon »), the page beside a menu or a panel. An element
        is taken when the capture has it at the same place of the page structure (same_element)."""
        if any(o['modal'] for o in self.OV.get(k) or []) or F['group'] == 'entry':
            return
        st = MEMBER_BASE.get(F['state']) or F['state']

        def family(s):
            scr = self.state_screen.get(s or '', '')
            if scr == 'project' or scr.startswith('project-'):
                return ['project', 'project-single']
            if scr == 'profile' or scr.startswith('profile-'):
                return ['profile']
            if scr == 'article' or scr.startswith('article-'):
                return ['article']
            if scr in ('projects', 'people'):
                return [scr]
            return ['explore'] if s in ('explore-country', 'explore-campus') else []
        under = self.base.get((F['fmt'], F['lang'], self.route.get(k)))
        # a menu or a panel open over a page: the family of that page too (the menu ⋮ over the comments of minishell)
        srcs = family(st) or (family(under) if self.OV.get(k) else [])
        if under and self.OV.get(k):
            srcs = srcs + [under]
        own = {h.get('key') for h in self.H[k]}
        for s in dict.fromkeys(srcs):
            if s == st:
                continue
            sf = self.src.get((s, F['fmt'], F['srcLang'])) or self.src.get((s, F['fmt'], 'fr'))
            sd = dump(sf['area'], s, F['fmt'], sf['lang']) if sf else None
            if sd is None:
                continue
            for l, d in self._mapped(F['fmt'], s):
                key = (d or {}).get('key')
                sn, n = sd['byK'].get(key), dd['byK'].get(key)
                if sn is None or n is None or key in own or not self.same_element(sd, sn, dd, n):
                    continue
                self._link_zone(k, F, dd, l, n)
                own.add(key)

    def _extra(self, k, F, dd):
        """19 Oct.: controls the mapping has no link for (relecture des planches), found by their structure; each one only
        where a captured screen shows its result."""
        ov = self.OV.get(k) or []
        if F['group'] == 'entry' and not ov:
            return
        st = MEMBER_BASE.get(F['state']) or F['state']
        in_ov = lambda n: bool(n.get('k')) and any(n['k'] == o['key'] or n['k'].startswith(o['key'] + '>') for o in ov)
        txt = lambda n: re.sub(r'\s+', ' ', text_of(dd, n)).strip()
        lab = lambda n: n.get('aria-label') or ''
        opened = [n for n in dd['nodes'] if n['tag'] == 'button' and n.get('aria-expanded') == 'true' and re.search(r'cp-control-trigger|cp-comments-sort', n.get('cls') or '')]
        current = {lab(n).split(' · ', 1)[1] for n in opened if ' · ' in lab(n)}
        for n in dd['nodes']:
            if n['tag'] not in ('a', 'button'):
                continue
            cls, s, t, close, label = n.get('cls') or '', txt(n), None, False, None
            if in_ov(n) and s in ('Annuler', 'Cancel', 'Appliquer', 'Apply'):
                close, label = True, s   # Appliquer: nothing is selected in the captured filters, the list stays as it is
            elif n in opened or (in_ov(n) and n.get('role') == 'menuitemradio' and s in current):
                close, label = True, s or lab(n)   # the open control and the current option close their menu
            elif 'dock-search-result' in cls:
                t, label = self.search_target(F, s), 'Résultat · ' + s[:32]
            elif n['tag'] == 'a' and self.no_op(k, dd, n) == 'skip':
                continue
            elif n['tag'] == 'a' and self.no_op(k, dd, n) == 'close':
                close, label = True, (s or lab(n))[:40] + ' · fermer le menu'   # beside an open menu: the click closes it
            elif 'cp-project-campus-choice' in cls:
                t, label = self.target(F, 'campus-window'), 'Campus · ' + s[:24]   # the window was captured for 42 Paris
            elif n['tag'] == 'a' and 'cp-pagination-link' in cls:
                t, label = self.by_route(F, n.get('href') or ''), 'Page ' + (s or lab(n))
            elif 'cp-control-trigger' in cls and st in ('projects-list', 'people-list') and s.startswith(('Affichage', 'View')):
                t, label = self.target(F, st.split('-')[0]), 'Affichage · Grille'
            elif s in ('Afficher tous les contenus', 'Show all content'):
                t, label = self.target(F, 'people' if st.startswith('people') else 'projects'), s
            elif st == 'project-test-saved' and s in ('Modifier le lien', 'Edit link'):
                t, label = self.target(F, 'project-test'), s
            elif n.get('id') == 'scope-picker' and not st.startswith('explore'):
                t, label = self.target(F, 'scope-popover'), 'Portée'
            elif F['state'] in ('account-settings', 'account-theme', 'account-language') and lab(n) in ('Retour', 'Back'):
                # « ‹ »: the first panel of the account, in the language of the panel (these panels were captured as a visitor)
                t, label = self.target(F, 'account-visitor'), 'Retour'
            elif lab(n) in ('Se déconnecter', 'Sign out'):
                under = self.base.get((F['fmt'], F['lang'], self.route.get(k)))
                t, label = ((F['fmt'], F['lang'], 'v', under) if under else None), lab(n)   # the page, back in visitor mode
            elif n['tag'] == 'a' and re.match(r'https?://', n.get('href') or '') and not hash_of(n.get('href')):
                b, fx = self.box(F, dd, n)   # 19 Oct.: a link to another site (credits of the map, sources): opened aside
                self.add(k, b, fx, {'url': n['href']}, 'Lien externe · ' + (s or lab(n))[:32], n.get('k'))
                continue
            elif n['tag'] == 'a' and re.match(r'#(people|projects|journal)/', hash_of(n.get('href')) or ''):
                t, label = self.by_route(F, hash_of(n['href'])), 'Lien · ' + (s or lab(n))[:40]   # only a fiche that was captured
            else:
                continue
            if close or t:
                b, fx = self.box(F, dd, n)
                self.add(k, b, fx, {'back': 1} if close else {'nav': t}, label, n.get('k'), close=close)

    def _globals(self, k, F, dd):
        member = self.member_ctx(F)
        section = self.state_group.get(MEMBER_BASE.get(F['state']) or F['state'], '')
        # 19 Oct.: over a page, a window or a menu leaves the page's bottom menu and die as they are (the die beside the
        # account panels draws a project; the current section does nothing)
        under = self.base.get((F['fmt'], F['lang'], self.route.get(k)))
        if (self.OV.get(k) or F['state'] in self.overlay) and under:
            section = self.state_group.get(under, section)
        for n in dd['nodes']:
            c = (n.get('cls') or '').split()
            act = label = None
            if n['tag'] == 'a' and 'brand' in c and section != 'explore':
                act, label = self.target(F, 'explore'), 'Logo'
            elif n['tag'] == 'button' and n.get('data-section') and dd['byI'].get(n.get('p')) is not None:
                sec = n['data-section']
                if sec != section and sec in LISTS:
                    act, label = self.target(F, LISTS[sec]), 'Menu du bas · ' + sec
            elif n['tag'] == 'button' and 'dock-search-toggle' in c:
                act, label = self.target(F, 'search-open'), 'Recherche'
            elif n.get('id') == 'random-campus' and section in DIE:
                # 19 Oct.: greyed when no content matches (« · Aucun contenu avec ces filtres », opacity 0.42): it does nothing
                if float((n.get('s') or {}).get('opacity') or 1) < 0.5:
                    continue
                act, label = self.target(F, DIE[section]), 'Dé'
                # on a fiche or its tabs it draws another subject, not captured (second reading: it led to the same fiche)
                here, there = self.route.get(k, '').split('?')[0], self.route.get(act, '').split('?')[0] if act else ''
                if '/' in here and here == there:
                    continue
            elif n.get('id') == 'profile':
                act, label = self.target(F, 'account-member' if member else 'account-visitor'), 'Compte'
            elif n.get('id') == 'account-messages':
                act, label = self.target(F, 'messages'), 'Messagerie'
            elif n.get('id') == 'account-notifications':
                act, label = self.target(F, 'notifications'), 'Notifications'
            elif n.get('id') == 'back-to-top':
                b, fx = self.box(F, dd, n)
                self.add(k, b, fx, {'top': 1}, 'Remonter en haut', n.get('k'))
                continue
            if (act == k and (n.get('id') == 'profile' or 'dock-search-toggle' in c)) or (n.get('id') == 'profile' and F['state'] in ('account-settings', 'account-theme', 'account-language')):
                # 19 Oct.: the button of the open panel or search closes it (account-menu.mjs: a second click closes the
                # menu, whatever panel it shows)
                b, fx = self.box(F, dd, n)
                self.add(k, b, fx, {'back': 1}, label + ' · fermer', n.get('k'), close=True)
            elif act:
                b, fx = self.box(F, dd, n)
                self.add(k, b, fx, {'nav': act}, label, n.get('k'))

    def _close(self, k, F, dd):
        sc = self.map['screens'].get(self.state_screen.get(F['state'], ''), {})
        for e in (sc.get('close') or {}).get(F['fmt']) or []:
            if e['frame']['state'] != F['state']:
                continue
            for z in [e.get('close')] + (e.get('other') or []):
                n = dd['byK'].get(((z or {}).get('dom') or {}).get('key'))
                if n is not None:
                    b, fx = self.box(F, dd, n)
                    self.add(k, b, fx, {'back': 1}, (z or {}).get('label') or 'Fermer', n.get('k'), close=True)

    def _tabs(self, k, F, dd):
        st = MEMBER_BASE.get(F['state']) or F['state']
        m = None
        for n in dd['nodes']:
            if n['tag'] != 'a' or not n.get('href'):
                continue
            m = re.match(r'^#(projects|people|journal)/([^?]+)(?:\?tab=(\w+))?$', n['href'])
            if not m or m.group(1) not in TABS:
                continue
            slug = m.group(2)
            here = re.match(r'^#(projects|people|journal)/([^?]+)', (dd.get('route') or dd.get('hash') or (dd.get('meta') or {}).get('routeOpened') or ''))
            if here and here.group(2) != slug:
                continue
            tab = TABS[m.group(1)].get(m.group(3))
            if tab is None or tab == st or not self.state_screen.get(st, '').startswith(('project', 'profile', 'article')):
                continue
            anc, q = [], dd['byI'].get(n.get('p'))
            while q is not None:
                anc.append(q); q = dd['byI'].get(q.get('p'))
            if not any('sidebar-nav' in (a.get('cls') or '') or 'switch-panel' in (a.get('cls') or '') for a in anc):
                continue   # only the tab bar of the fiche: its sidebar, or the selector « Dans ce … » on a phone
            if any(a['tag'] == 'details' for a in anc) and st not in OPEN_DETAILS_STATES:
                continue   # a closed selector: laid out, not drawn
            # 19 Oct.: the tab of the same address when it was captured (minishell's tabs, its overview); the tabs of the other
            # fiches lead to the tabs captured for minishell, as the other cards lead to the fiche of the base frame; the
            # active tab does nothing (a published comment, a saved link stay)
            if norm_route(n['href']) == self.route.get(k):
                continue
            t = self.by_route(F, n['href']) or self.target(F, tab)
            if t:
                b, fx = self.box(F, dd, n)
                self.add(k, b, fx, {'nav': t}, 'Onglet · ' + (m.group(3) or 'vue d’ensemble'), n.get('k'))

    def _variants(self, k, F, dd):
        """Entries of the states that are not screens of the site map (sort open, list view, last page…), found in the
        capture of the screen they open from; on a member screen, those of its visitor screen (its windows and variants were
        captured as a visitor)."""
        st = MEMBER_BASE.get(F['state']) or F['state']
        find = lambda pred: next((n for n in dd['nodes'] if pred(n)), None)
        txt = lambda n: text_of(dd, n).strip()
        rules = []
        under = self.base.get((F['fmt'], F['lang'], self.route.get(k)))
        lists = ('projects', 'people', 'projects-list', 'people-list', 'projects-last-page', 'people-last-page')
        # 19 Oct.: also from the list view and the last page (the sort menu and the list view were captured from the grid),
        # and beside a menu or a panel open over a list (the open search, the account panels, the sort menu itself)
        lst = st if st in lists else (under if self.OV.get(k) and under in lists else None)
        if lst:
            base = lst.split('-')[0]
            rules += [(lambda n: n['tag'] == 'button' and 'cp-control-trigger' in (n.get('cls') or '') and 'sort' in (n.get('id') or '') + (n.get('aria-label') or '').lower() + txt(n).lower() or (n['tag'] == 'button' and txt(n) in ('Trier', 'Sort')), base + '-sort-open', 'Trier'),
                      (lambda n: n['tag'] == 'button' and 'cp-control-trigger' in (n.get('cls') or '') and txt(n).startswith(('Affichage', 'View')), base + '-list', 'Affichage · Liste'),
                      (lambda n: n['tag'] == 'a' and 'cp-pagination-link' in (n.get('cls') or '') and re.search(r'page=(4|7)$', n.get('href') or ''), base + '-last-page', 'Dernière page')]
        if st in ('projects-sort-open',):
            rules.append((lambda n: n['tag'] in ('button', 'label', 'input') and txt(n).startswith(('Mes favoris', 'My favourites', 'My favorites')), 'projects-empty', 'Mes favoris uniquement'))
        if st in ('filter-projects', 'filter-people'):
            rules.append((lambda n: n['tag'] == 'button' and 'cp-project-filter-toggle' in (n.get('cls') or ''), st + '-expanded', 'Déplier une catégorie'))
        if st == 'project-comments':
            rules.append((lambda n: n['tag'] == 'textarea', 'mention-picker', 'Écrire un commentaire'))
        if st == 'mention-picker':
            rules.append((lambda n: n['tag'] in ('button', 'li') and 'mention' in (n.get('cls') or '') and n['h'] > 20, 'project-comments-thread', 'Choisir une mention, publier'))
        if st == 'article-comments':
            rules.append((lambda n: n['tag'] == 'textarea', 'article-comments-thread', 'Écrire et publier un commentaire'))
        if st in ('project-comments-thread', 'comment-menu'):
            rules.append((lambda n: n['tag'] == 'button' and 'cp-comments-sort' in (n.get('cls') or ''), 'comments-sort-open', 'Trier les commentaires'))
        if st == 'campus-sheet' and F['fmt'] == 'mobile':
            rules.append((lambda n: 'campus-sheet-handle' in (n.get('cls') or ''), 'campus-sheet-expanded', 'Déployer la fiche'))
        if st == 'campus-sheet-expanded' and F['fmt'] == 'mobile':   # 19 Oct.: its handle folds it back
            rules.append((lambda n: 'campus-sheet-handle' in (n.get('cls') or ''), 'campus-sheet', 'Replier la fiche'))
        if st == 'people':
            rules += [(lambda n: 'cp-card' in (n.get('cls') or '').split() and 'Inès Morel' in txt(n), 'profile-alumni', 'Inès Morel'),
                      (lambda n: 'cp-card' in (n.get('cls') or '').split() and 'Noé Laurent' in txt(n), 'profile-transcender', 'Noé Laurent')]
        if st == 'project-test':
            rules.append((lambda n: n['tag'] == 'button' and txt(n) in ('Enregistrer', 'Save'), 'project-test-saved', 'Enregistrer'))
        if st == 'account-member':
            rules.append((lambda n: n['tag'] == 'button' and (n.get('aria-label') or '') in ('Compte', 'Account'), 'member-account', 'Compte'))
        if st == 'profile-projects':
            rules.append((lambda n: n['tag'] == 'button' and 'cp-control-trigger' in (n.get('cls') or '') and txt(n).startswith(('Filtrer', 'Filter')), 'profile-projects-filter', 'Filtrer'))
        if st == 'profile':
            rules.append((lambda n: n['tag'] == 'button' and 'cp-report-trigger' in (n.get('cls') or ''), 'report-profile', 'Signaler'))
        # « Dans ce … » of a phone: the open selector captured for the fiche of its family (ft_transcendence, Leïla Mansour), 19
        # Oct. also from the tabs, minishell and the other profiles (second reading), and under a menu open over them; none was
        # captured for a chronicle
        def family(s):
            scr = self.state_screen.get(s or '', '')
            return 'project' if scr == 'project' or scr.startswith('project-') else 'profile' if scr == 'profile' or scr.startswith('profile-') else None
        fam = family(st) or (family(under) if self.OV.get(k) else None)
        if F['fmt'] == 'mobile' and fam:
            rules.append((lambda n: n['tag'] == 'summary', fam + '-local-menu', 'Dans ce …'))
        for pred, to, label in rules:
            t = self.target(F, to)
            if not t:
                continue
            n = find(pred)
            if n is None:
                self.missing.append((F['name'], label, 'entrée de variante introuvable : ' + to))
                continue
            b, fx = self.box(F, dd, n)
            self.add(k, b, fx, {'nav': t}, label, n.get('k'))

    def _panels(self, k, F, dd):
        """The choices of the Theme and Language panels, and of Settings, which has both (19 Oct.): a theme sets the mode of
        « 42 · Couleurs » (Système: the light one), a language leads to the same panel in that language."""
        st = F['state']
        if st not in ('account-theme', 'account-language', 'account-settings'):
            return
        for n in dd['nodes']:
            if 'account-choice' not in (n.get('cls') or '').split():
                continue
            t = text_of(dd, n).strip()
            b, fx = self.box(F, dd, n)
            if t in ('Clair', 'Sombre', 'Système', 'Light', 'Dark', 'System'):
                self.add(k, b, fx, {'mode': 'Sombre' if t in ('Sombre', 'Dark') else 'Clair'}, t, n.get('k'))
            elif t in ('Français', 'English'):
                other = 'fr' if t == 'Français' else 'en'
                if other != F['lang'] and (F['fmt'], other, 'v', st) in self.F:
                    self.add(k, b, fx, {'nav': (F['fmt'], other, 'v', st)}, t, n.get('k'))

    def _sequences(self):
        for fmt in ('desktop', 'mobile'):
            for lang in ('fr', 'en'):
                chain = [(a, b, s, 'v', 'v') for a, b, s in (ARRIVAL if lang == 'fr' else ARRIVAL_EN) + VISITOR_PATH]
                chain += [(a, b, s, 'v', 'v') for a, b, s in zip(OPENING, OPENING[1:], OPENING_DELAYS)]
                chain += [('reveal-end', 'explore', OPENING_DELAYS[-1], 'v', 'v')]
                chain += [(a, b, s, 'v', 'm' if b in OPENING else 'v') for a, b, s in MEMBER_PATH]
                chain += [(a, b, s, 'm', 'm') for a, b, s in zip(OPENING, OPENING[1:], OPENING_DELAYS)]
                chain += [('reveal-end', 'member-explore', OPENING_DELAYS[-1], 'm', 'v')]
                for a, b, s, fa, fb in chain:
                    ka, kb = (fmt, lang, fa, a), (fmt, lang, fb, b)
                    if ka in self.F and kb in self.F:
                        self.auto[ka] = {'nav': kb, 'after': s}
                    else:
                        self.problems.append('enchaînement incomplet : %s %s %s → %s' % (fmt, lang, a, b))

    def _dedupe(self, hs):
        out = []
        for h in hs:
            same = next((o for o in out if o.get('in') == h.get('in') and all(abs(a - b) < 2 for a, b in zip(o['box'], h['box']))), None)
            if same is None:
                out.append(h)
            elif same['act'] != h['act']:
                # 19 Oct.: the lists of « Où veux-tu aller ? » lead to a country or a campus, not to the current « Tous les … »
                if h['label'].startswith('Choisir') and not same['label'].startswith('Choisir'):
                    out[out.index(same)] = h
                self.problems.append('zones confondues : %s / %s' % (same['label'], h['label']))
        return out

    # ------------------------------------------------------------ fixed layers of the copies
    def fixed_layers(self, F):
        """Layers to make fixed children of a frame taller than the screen: the fixed layers of the scene (n.fx) and the
        header sticky at the top, but the background that covers the page; a layer of the lower half was put at the bottom of
        the frame by dom2fig.fixed_y and goes back to its place on the screen."""
        if not self.full(F):
            return []
        sk = '%s--%s--%s--%s' % ('shell' if F['state'] in MEMBER else F['area'], F['state'], F['fmt'], F['srcLang'])
        p = SCENES / f'{sk}.json'
        if not p.exists():
            self.problems.append('scène absente : ' + sk)
            return []
        sc = jload(p)
        H, vh = sc['h'], VH[F['fmt']]
        delta = H - vh
        out = []

        def walk(n, ox, oy, path):
            x, y = ox + (n.get('x') or 0), oy + (n.get('y') or 0)
            name = n.get('n') or ''
            if (n.get('fx') or (n.get('sk') and y < 2)) and (n.get('h') or 0) < 0.9 * H:
                bb = [x, y, x + (n.get('w') or 0), y + (n.get('h') or 0)]

                def grow(m, ox, oy):   # descendants drawn outside the layer (the search and the die above the bottom menu)
                    for c in m.get('ch') or []:
                        cx, cy = ox + (c.get('x') or 0), oy + (c.get('y') or 0)
                        bb[0], bb[1] = min(bb[0], cx), min(bb[1], cy)
                        bb[2], bb[3] = max(bb[2], cx + (c.get('w') or 0)), max(bb[3], cy + (c.get('h') or 0))
                        grow(c, cx, cy)
                grow(n, x, y)
                dy = -round(delta, 2) if n.get('fx') and y > delta + vh / 2 - 1 else 0
                out.append({'path': path + [name], 'x': round(x, 1), 'y': round(y, 1), 'w': round(n.get('w') or 0, 1), 'h': round(n.get('h') or 0, 1),
                            'dy': dy, 'bbox': [round(bb[0], 1), round(bb[1] + dy, 1), round(bb[2] - bb[0], 1), round(bb[3] - bb[1], 1)]})
                return
            for c in n.get('ch') or []:
                walk(c, x, y, path + [name])
        for c in sc['ch']:
            walk(c, 0, 0, [])
        return out

    # ------------------------------------------------------------ layout of the pages
    def place(self):
        self.sections = {}
        for fmt in ('desktop', 'mobile'):
            y = 0
            for lang in ('fr', 'en'):
                for g, glabel in GROUPS:
                    ks = sorted([k for k in self.F if k[0] == fmt and k[1] == lang and self.F[k]['group'] == g],
                                key=lambda k: (k[2], self.F[k]['name']))
                    if not ks:
                        continue
                    cols = GRID[fmt]
                    w, h = VW[fmt], VH[fmt]
                    rows = (len(ks) + cols - 1) // cols
                    sw = 80 * 2 + cols * w + (cols - 1) * GAP_X
                    sh = TOP + rows * h + (rows - 1) * GAP_Y + 120
                    sid = '%s-%s-%s' % (fmt, lang, g)
                    self.sections[sid] = {'fmt': fmt, 'name': 'Parcours · %s · %s' % (LANG_LABEL[lang], glabel), 'lang': lang, 'group': g,
                                          'x': 0, 'y': y, 'w': sw, 'h': sh, 'frames': [self.F[k]['name'] for k in ks]}
                    for i, k in enumerate(ks):
                        self.F[k]['section'] = sid
                        self.F[k]['at'] = [80 + (i % cols) * (w + GAP_X), TOP + (i // cols) * (h + GAP_Y)]
                    y += sh + 400
            # 19 Oct.: the member screens are rendered at their full height here, one row, before their conversion moves them
            mem = sorted([k for k in self.F if k[0] == fmt and self.F[k]['state'] in MEMBER], key=lambda k: (k[1], self.F[k]['name']))
            if mem:
                hmax = max(self.F[k]['h'] for k in mem)
                sid = '%s-staging' % fmt
                self.sections[sid] = {'fmt': fmt, 'name': 'Parcours · écrans membre en cours de rendu', 'lang': 'fr', 'group': 'staging', 'staging': True,
                                      'x': 0, 'y': y, 'w': 160 + len(mem) * VW[fmt] + (len(mem) - 1) * GAP_X, 'h': TOP + hmax + 120,
                                      'frames': [self.F[k]['name'] for k in mem]}
                for i, k in enumerate(mem):
                    self.F[k]['staging'] = [80 + i * (VW[fmt] + GAP_X), TOP]

    def build(self):
        self.flow_frames()
        self.hotspots()
        for F in self.F.values():
            F['fixed'] = self.fixed_layers(F) if not F['member'] or F['state'] in MEMBER or F['flow'] == 'm' else []
        self.place()
        return self

    def save(self):
        key = lambda k: '|'.join(k)
        out = {'frames': {key(k): F for k, F in self.F.items()},
               'hotspots': {key(k): [dict(h, act={a: (key(v) if a == 'nav' else v) for a, v in h['act'].items()}) for h in hs] for k, hs in self.H.items()},
               'auto': {key(k): {'nav': key(v['nav']), 'after': v['after']} for k, v in self.auto.items()},
               'sections': self.sections, 'problems': self.problems, 'missing': self.missing}
        PARC.mkdir(exist_ok=True)
        (PARC / 'plan.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
        return out


def report(out):
    import collections
    fr = out['frames']
    by = collections.Counter((F['fmt'], F['lang']) for F in fr.values())
    print('cadres :', dict(by), '| membre :', sum(1 for F in fr.values() if F['state'] in MEMBER))
    hs = out['hotspots']
    print('zones :', sum(len(v) for v in hs.values()), '| fixes :', sum(1 for v in hs.values() for h in v if h['fixed']),
          '| cadres sans zone :', sum(1 for k, v in hs.items() if not v and k not in out['auto']))
    acts = collections.Counter(next(iter(h['act'])) for v in hs.values() for h in v)
    print('actions :', dict(acts), '| enchaînements automatiques :', len(out['auto']))
    print('calques fixes à sortir :', sum(len(F['fixed']) for F in fr.values()), 'dans', sum(1 for F in fr.values() if F['fixed']), 'cadres')
    print('sections :', len(out['sections']))
    print('problèmes :', len(out['problems']))
    for p in out['problems'][:30]:
        print('  ', p)
    print('zones introuvables :', len(out['missing']))
    for m in out['missing'][:30]:
        print('  ', m)
    # 19 Oct.: in a frame that scrolls, a fixed zone must lie on a fixed layer the conversion takes out of « Application »
    # (at its place on the screen), a scrolling one must not
    bad = []
    for k, F in fr.items():
        if F['h'] <= VH[F['fmt']] + 4 or not F['fixed']:
            continue
        boxes = [tuple(L['bbox']) for L in F['fixed']]
        inside = lambda b: any(x - 1 <= b[0] and b[0] + b[2] <= x + w + 1 and y - 1 <= b[1] and b[1] + b[3] <= y + h + 1 for x, y, w, h in boxes)
        for h in hs.get(k, []):
            if not h.get('in') and h['fixed'] != inside(h['box']):
                bad.append((F['name'], h['label'], 'fixe' if h['fixed'] else 'défile', h['box']))
    print('zones dont le défilement ne suit pas leur calque :', len(bad))
    for x in bad[:25]:
        print('  ', x)
    # frames that nothing leads to
    reached = {h['act']['nav'] for v in hs.values() for h in v if 'nav' in h['act']} | {v['nav'] for v in out['auto'].values()}
    orphans = [k for k in fr if k not in reached]
    print('cadres que rien n’atteint :', len(orphans))
    for k in orphans[:40]:
        print('  ', k)


# ------------------------------------------------------------------ calls
PAGES_CALL = r"""// 42 Horizon — parcours cliquables : pages « 09 · Parcours · ordinateur » et « 10 · Parcours · mobile », leurs sections et leurs notes (refonte Figma, 19 oct. 2026) ; rien d'autre n'est modifié
await Promise.all([{family:'Jost',style:'Medium'},{family:'Jost',style:'Regular'}].map(f => figma.loadFontAsync(f)));
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const paint = n => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[n]);
const TOK = new RegExp(String.fromCodePoint(0x27e6) + '(202f|00a0)' + String.fromCodePoint(0x27e7), 'g');
const UN = s => s.replace(TOK, (_, h) => String.fromCodePoint(parseInt(h, 16)));
const P = %(pages)s;
const after = await figma.getNodeByIdAsync('%(after)s');
const out = { pages: {}, sections: {} };
let at = figma.root.children.indexOf(after) + 1;
for (const [fmt, name, sections] of P) {
  let page = figma.root.children.find(p => p.name === name);
  if (!page) { page = figma.createPage(); page.name = name; figma.root.insertChild(at, page); }
  at = figma.root.children.indexOf(page) + 1;
  out.pages[fmt] = page.id;
  await page.loadAsync();
  for (const s of sections) {
    let sec = page.children.find(n => n.type === 'SECTION' && n.name === s.name);
    if (!sec) { sec = figma.createSection(); page.appendChild(sec); sec.name = s.name; }
    sec.x = s.x; sec.y = s.y; sec.resizeWithoutConstraints(s.w, s.h);
    for (const old of sec.children.filter(n => n.type === 'TEXT' && n.name.startsWith('Note · '))) old.remove();
    const t = figma.createText(); sec.appendChild(t); t.name = 'Note · titre';
    t.fontName = { family: 'Jost', style: 'Medium' }; t.fontSize = 40; t.characters = UN(s.name); t.fills = [paint('Rôles/text')]; t.x = 80; t.y = 64;
    const d = figma.createText(); sec.appendChild(d); d.name = 'Note · description';
    d.fontName = { family: 'Jost', style: 'Regular' }; d.fontSize = 18; d.lineHeight = { value: 28, unit: 'PIXELS' };
    d.characters = UN(s.desc); d.fills = [paint('Rôles/muted')]; d.textAutoResize = 'HEIGHT'; d.resize(Math.min(1400, s.w - 160), d.height); d.x = 80; d.y = 124;
    out.sections[s.id] = sec.id;
  }
}
return out;"""

# copies of verified frames into a flow page, turned into screen-high frames that scroll (see the docstring)
COPY_CALL = r"""// 42 Horizon — parcours cliquables : copies de cadres vérifiés des pages 01 à 08 dans « %(dest)s », à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026) ; les cadres d'origine ne changent pas
const dest = await figma.getNodeByIdAsync('%(destPage)s');
await figma.setCurrentPageAsync(dest);
const src = await figma.getNodeByIdAsync('%(srcPage)s');
const colors = await figma.variables.getVariableCollectionByIdAsync('%(colors)s');
const J = %(jobs)s;
const out = { ids: {}, missing: [], fixed: {}, notFound: {}, kept: 0 };
%(convert)s
let loaded = src.id === dest.id;
for (const j of J) {
  const sec = await figma.getNodeByIdAsync(j.section);
  if (!sec) { out.missing.push(j.key); continue; }
  // 19 Oct.: the copy made by a run whose answer was lost or that was cut short (the heaviest screens of Projets) is kept,
  // its conversion finished; the source page is loaded only for a copy still to make
  const there = sec.children.filter(n => n.name === j.name);
  let c = there.length === 1 && there[0].type === 'FRAME' ? there[0] : null;
  if (c) out.kept++;
  else {
    if (!loaded) { await src.loadAsync(); loaded = true; }
    const s = await figma.getNodeByIdAsync(j.src);
    if (!s) { out.missing.push(j.key); continue; }
    for (const old of there) old.remove();
    c = s.clone(); sec.appendChild(c); c.name = j.name;
  }
  c.x = j.at[0]; c.y = j.at[1];
  // 19 Oct.: the heaviest copy (1899) is made in two calls: the copy alone, then its conversion, which keeps it
  if (!j.copyOnly) convert(c, j);
  out.ids[j.key] = c.id;
}
return out;"""

CONVERT_FN = r"""// a layer of the scene found again in the frame: the path of names from the frame, the last step by its position
function locate(c, path, x, y) {
  let cur = c;
  const T0 = c.absoluteTransform;
  for (let i = 0; i < path.length; i++) {
    const kids = ('children' in cur ? cur.children : []).filter(n => n.name === path[i]);
    if (!kids.length) return null;
    if (i < path.length - 1) { cur = kids[0]; continue; }
    let best = null, bd = 1e9;
    for (const k of kids) { const t = k.absoluteTransform, d = Math.abs(t[0][2] - T0[0][2] - x) + Math.abs(t[1][2] - T0[1][2] - y); if (d < bd) { bd = d; best = k; } }
    return bd < 2 ? best : null;
  }
  return null;
}
function convert(c, j) {
  c.clearExplicitVariableModeForCollection(colors);
  if (!j.full) return;
  // converted by an earlier run: left as it is
  if (Math.round(c.height) === j.vh && c.overflowDirection === 'VERTICAL' && (c.numberOfFixedChildren > 0 || !j.fixed.length)) { out.fixed[j.key] = c.numberOfFixedChildren; return; }
  const T0 = c.absoluteTransform;
  let moved = 0;
  const lost = [];
  for (const f of j.fixed) {
    // 19 Oct.: already moved to the top of the frame by a run cut short (before the copy only has « Application »
    // there): appended again, in the same order, and put back in place if the run stopped before it was
    const top = c.children.find(n => n.name === f.path[f.path.length - 1] && n.name !== 'Application');
    if (top) {
      c.appendChild(top);
      if (Math.abs(top.x - f.x) + Math.abs(top.y - f.y - f.dy) >= 2) { top.x = f.x; top.y = f.y + f.dy; }
      moved++; continue;
    }
    const n = locate(c, f.path, f.x, f.y);
    if (!n) { lost.push(f.path.join(' > ')); continue; }
    const t = n.absoluteTransform, ax = t[0][2] - T0[0][2], ay = t[1][2] - T0[1][2];
    c.appendChild(n); n.x = ax; n.y = ay + f.dy; moved++;
  }
  if (Math.round(c.height) !== j.vh) c.resizeWithoutConstraints(c.width, j.vh);
  c.clipsContent = true; c.overflowDirection = 'VERTICAL';
  c.numberOfFixedChildren = moved;
  out.fixed[j.key] = moved;
  if (lost.length) out.notFound[j.key] = lost;
}"""

# member screens rendered by layout.scenes('parcours-…'), then converted in place
CONVERT_CALL = r"""// 42 Horizon — parcours cliquables : écrans membre rendus dans « %(dest)s », mis à la hauteur de l'écran avec la page qui défile ; les calques fixes du site deviennent des enfants fixes du cadre ; le thème suit le mode du prototype (refonte Figma, 19 oct. 2026)
const dest = await figma.getNodeByIdAsync('%(destPage)s');
await figma.setCurrentPageAsync(dest);
const colors = await figma.variables.getVariableCollectionByIdAsync('%(colors)s');
const J = %(jobs)s;
const out = { ids: {}, missing: [], fixed: {}, notFound: {} };
%(convert)s
for (const j of J) {
  const stage = await figma.getNodeByIdAsync(j.staging), sec = await figma.getNodeByIdAsync(j.section);
  const done = sec && sec.children.find(n => n.name === j.name && n.type === 'FRAME');
  if (done) { out.ids[j.key] = done.id; out.fixed[j.key] = done.numberOfFixedChildren; continue; }   // converted by an earlier run
  const c = stage && stage.children.find(n => n.name === j.name && n.type === 'FRAME');
  if (!c || !sec) { out.missing.push(j.key); continue; }
  convert(c, j);
  sec.appendChild(c); c.x = j.at[0]; c.y = j.at[1];
  out.ids[j.key] = c.id;
}
const stages = [...new Set(J.map(j => j.staging))];
for (const id of stages) { const s = await figma.getNodeByIdAsync(id); if (s && !s.children.some(n => n.type === 'FRAME')) { s.remove(); out.stagingRemoved = (out.stagingRemoved || 0) + 1; } }
return out;"""

LINKS_CALL = r"""// 42 Horizon — parcours cliquables : zones cliquables et interactions des cadres de « %(dest)s » (lot %(lot)s) ; chaque zone est un cadre transparent posé sur l'élément du site ; seuls ces zones, les interactions et les points de départ changent (refonte Figma, 19 oct. 2026)
const dest = await figma.getNodeByIdAsync('%(destPage)s');
await figma.setCurrentPageAsync(dest);
const colors = await figma.variables.getVariableCollectionByIdAsync('%(colors)s');
const MODE = {}; for (const m of colors.modes) MODE[m.name] = m.modeId;
const TOK = new RegExp(String.fromCodePoint(0x27e6) + '(202f|00a0)' + String.fromCodePoint(0x27e7), 'g');
const UN = s => s.replace(TOK, (_, h) => String.fromCodePoint(parseInt(h, 16)));
const J = %(jobs)s;
const out = { zones: 0, fixedZones: 0, inner: 0, auto: 0, missing: [], badTarget: [], lostLayer: [] };
// 19 Oct.: the layer of a menu, a panel or a sheet that scrolls inside (path of names from the frame, the last step by its
// position): its zones go in it, and it scrolls
function locate(c, path, x, y) {
  let cur = c;
  const T0 = c.absoluteTransform;
  for (let i = 0; i < path.length; i++) {
    const kids = ('children' in cur ? cur.children : []).filter(n => n.name === path[i]);
    if (!kids.length) return null;
    if (i < path.length - 1) { cur = kids[0]; continue; }
    let best = null, bd = 1e9;
    for (const k of kids) { const t = k.absoluteTransform, d = Math.abs(t[0][2] - T0[0][2] - x) + Math.abs(t[1][2] - T0[1][2] - y); if (d < bd) { bd = d; best = k; } }
    return bd < 2 ? best : null;
  }
  return null;
}
const inKey = h => h.in.path.join('>') + '@' + h.in.x + ',' + h.in.y;
const act = (a, f) => {
  if (a.nav) return { type: 'NODE', destinationId: a.nav, navigation: 'NAVIGATE', transition: null, resetScrollPosition: true };
  if (a.back) return { type: 'BACK' };
  if (a.url) return { type: 'URL', url: a.url, openInNewTab: true };
  if (a.mode) return { type: 'SET_VARIABLE_MODE', variableCollectionId: colors.id, variableModeId: MODE[a.mode] };
  if (a.top) { const app = f.children.find(n => n.name === 'Application'); return app ? { type: 'NODE', destinationId: app.id, navigation: 'SCROLL_TO', transition: null } : null; }
  return null;
};
for (const j of J) {
  const f = await figma.getNodeByIdAsync(j.id);
  if (!f) { out.missing.push(j.id); continue; }
  // again from scratch: zones of an earlier run removed, the fixed layers of the copy kept fixed. 19 Oct.: on a page that
  // scrolls they are every child but « Application » once the zones are gone (the conversion took them out), which stays
  // true after a run cut short before it counted its fixed zones
  for (const old of f.children.filter(n => n.name.startsWith('Zone · '))) old.remove();
  const conts = new Map();
  for (const h of j.zones) {
    if (!h.in || conts.has(inKey(h))) continue;
    const c = locate(f, h.in.path, h.in.x, h.in.y);
    conts.set(inKey(h), c);
    if (c) for (const old of c.children.filter(n => n.name.startsWith('Zone · '))) old.remove();
  }
  let fixedCount = j.scrolls ? f.children.filter(n => n.name !== 'Application').length : f.numberOfFixedChildren;
  f.numberOfFixedChildren = fixedCount;
  let fz = 0;
  for (const h of j.zones) {
    const a = act(h.act, f);
    if (!a || (h.act.nav && !(await figma.getNodeByIdAsync(h.act.nav)))) { out.badTarget.push(j.id + ' ' + h.label); continue; }
    const cont = h.in ? conts.get(inKey(h)) : null;
    if (h.in && !cont) { out.lostLayer.push(j.id + ' ' + h.label); continue; }
    const z = figma.createFrame(); z.name = UN('Zone · ' + h.label); z.fills = []; z.clipsContent = false;
    if (cont) {
      cont.appendChild(z);
      if ('layoutMode' in cont && cont.layoutMode !== 'NONE') z.layoutPositioning = 'ABSOLUTE';
      if (cont.overflowDirection !== 'VERTICAL') cont.overflowDirection = 'VERTICAL';
      out.inner++;
    } else if (h.fixed && fixedCount + fz >= 0 && j.scrolls) { f.appendChild(z); fz++; } else { f.insertChild(f.children.length - fixedCount - fz, z); }
    z.resize(Math.max(1, h.box[2]), Math.max(1, h.box[3])); z.x = h.box[0]; z.y = h.box[1];
    await z.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [a] }]);
    out.zones++;
  }
  f.numberOfFixedChildren = fixedCount + fz; out.fixedZones += fz;
  if (j.auto) { await f.setReactionsAsync([{ trigger: { type: 'AFTER_TIMEOUT', timeout: j.auto.after }, actions: [act(j.auto, f)] }]); out.auto++; }
  else await f.setReactionsAsync([]);
}
%(flows)s
return out;"""


# 19 Oct.: read-only check of a flow page after the links: every frame of its sections, its size, fixed children, scroll, the
# zones at the top of the frame and in the containers that scroll (by the paths of the plan), their reactions, the timer of
# the frame, and the starting points of the page
CHECK_CALL = r"""// 42 Horizon — lecture seule (19 oct. 2026) : cadres, zones, interactions et points de départ de « %(dest)s » ; rien n'est modifié
const page = await figma.getNodeByIdAsync('%(destPage)s');
await figma.setCurrentPageAsync(page);
const S = %(sections)s, IN = %(inner)s;
function locate(c, path, x, y) {
  let cur = c;
  const T0 = c.absoluteTransform;
  for (let i = 0; i < path.length; i++) {
    const kids = ('children' in cur ? cur.children : []).filter(n => n.name === path[i]);
    if (!kids.length) return null;
    if (i < path.length - 1) { cur = kids[0]; continue; }
    let best = null, bd = 1e9;
    for (const k of kids) { const t = k.absoluteTransform, d = Math.abs(t[0][2] - T0[0][2] - x) + Math.abs(t[1][2] - T0[1][2] - y); if (d < bd) { bd = d; best = k; } }
    return bd < 2 ? best : null;
  }
  return null;
}
const zoneInfo = z => { const r = z.reactions || []; const a = r.length && r[0].actions && r[0].actions[0]; return a ? (a.type === 'NODE' ? a.destinationId : a.type === 'BACK' ? 'BACK' : a.type === 'URL' ? 'URL' : a.type) : null; };
const out = { sections: {}, flows: page.flowStartingPoints.map(p => [p.name, p.nodeId]) };
for (const [sid, id] of Object.entries(S)) {
  const s = await figma.getNodeByIdAsync(id);
  if (!s) { out.sections[sid] = 'absente'; continue; }
  out.sections[sid] = s.children.filter(n => n.type === 'FRAME').map(f => {
    const top = f.children.filter(c => c.name.startsWith('Zone · '));
    const inner = (IN[f.id] || []).map(p => { const c = locate(f, p.path, p.x, p.y); return c ? [c.overflowDirection, c.children.filter(z => z.name.startsWith('Zone · ')).map(zoneInfo)] : null; });
    const fr = (f.reactions || [])[0];
    return { name: f.name, id: f.id, w: Math.round(f.width), h: Math.round(f.height), fixed: f.numberOfFixedChildren, scroll: f.overflowDirection,
             zones: top.map(zoneInfo), lastFixed: f.children.slice(f.children.length - f.numberOfFixedChildren).map(c => c.name.startsWith('Zone · ') ? 'Z' : c.name).filter(n => n !== 'Z'),
             inner, auto: fr ? [fr.trigger && fr.trigger.type, fr.trigger && fr.trigger.timeout, fr.actions && fr.actions[0] && fr.actions[0].destinationId] : null };
  });
}
return out;"""


def check_calls(plan):
    """calls/<n>-parcours-controle-<fmt>.js: the read-only check of each flow page (CHECK_CALL)."""
    ids = _ids()
    for fmt in ('desktop', 'mobile'):
        inner = {}
        for k, hs in plan['hotspots'].items():
            fid = ids['frames'].get(k)
            if not fid or plan['frames'][k]['fmt'] != fmt:
                continue
            paths = []
            for h in hs:
                if h.get('in') and h['in'] not in paths:
                    paths.append({'path': h['in']['path'], 'x': h['in']['x'], 'y': h['in']['y']})
            if paths:
                inner[fid] = [dict(t) for t in {json.dumps(p, sort_keys=True): p for p in paths}.values()]
        secs = {sid: sec for sid, sec in ids['sections'].items() if sid.startswith(fmt) and 'staging' not in sid}
        code = guard_spaces(CHECK_CALL % {'dest': PAGES[fmt], 'destPage': ids['pages'][fmt], 'sections': json.dumps(secs), 'inner': json.dumps(inner, ensure_ascii=False)})
        f = CALLS / ('%03d-parcours-controle-%s.js' % (next_index(), fmt)); f.write_text(code); print(f.name, len(code))


def verify(paths):
    """Compares the read-only checks (call-results of CHECK_CALL) with the plan: every frame at its place, its zones (top and
    in the containers that scroll) with their arrivals, its fixed children, its timer, the starting points."""
    plan, ids = jload(PARC / 'plan.json'), _ids()
    byid = {v: k for k, v in ids['frames'].items()}
    seen_frames, bad = set(), []
    for p in paths:
        r = jload(pathlib.Path(p))
        for sid, frs in r['sections'].items():
            if frs == 'absente':
                bad.append(('section absente', sid)); continue
            for fr in frs:
                k = byid.get(fr['id'])
                if k is None:
                    bad.append(('cadre hors plan', sid, fr['name'], fr['id'])); continue
                if k in seen_frames:
                    bad.append(('cadre en double', k))
                seen_frames.add(k)
                F, hs = plan['frames'][k], plan['hotspots'].get(k, [])
                if F['section'] != sid:
                    bad.append(('autre section', k, sid))
                exp_top = [h for h in hs if not h.get('in')]
                exp_in = [h for h in hs if h.get('in')]
                want = lambda h: ids['frames'].get(h['act']['nav']) if 'nav' in h['act'] else ('BACK' if 'back' in h['act'] else 'URL' if 'url' in h['act'] else 'SET_VARIABLE_MODE' if 'mode' in h['act'] else 'NODE')
                got_top = fr['zones']
                if sorted(map(str, got_top)) != sorted(str(want(h)) for h in exp_top):
                    bad.append(('zones', k, len(got_top), len(exp_top)))
                got_in = [z for c in fr['inner'] if c for z in c[1]]
                if any(c is None for c in fr['inner']) or sorted(map(str, got_in)) != sorted(str(want(h)) for h in exp_in):
                    bad.append(('zones dans un conteneur', k, len(got_in), len(exp_in)))
                if any(c and c[0] != 'VERTICAL' for c in fr['inner']):
                    bad.append(('conteneur qui ne défile pas', k))
                full = F['h'] > VH[F['fmt']] + 4
                if full and (fr['scroll'] != 'VERTICAL' or fr['h'] != VH[F['fmt']]):
                    bad.append(('défilement', k, fr['scroll'], fr['h']))
                if full and not fr['lastFixed'] and F['fixed']:
                    bad.append(('calques fixes', k))
                a = plan['auto'].get(k)
                if a and (not fr['auto'] or fr['auto'][0] != 'AFTER_TIMEOUT' or fr['auto'][2] != ids['frames'].get(a['nav'])):
                    bad.append(('enchaînement', k, fr['auto']))
                if not a and fr['auto']:
                    bad.append(('enchaînement en trop', k, fr['auto']))
        print(pathlib.Path(p).name, 'points de départ :', len(r.get('flows') or []), [f[0] for f in r.get('flows') or []])
    missing = [k for k in plan['frames'] if k not in seen_frames and any(pathlib.Path(p).name.find(plan['frames'][k]['fmt']) >= 0 for p in paths)]
    print('cadres lus :', len(seen_frames), '| absents :', len(missing), missing[:10])
    print('écarts :', len(bad))
    for b in bad[:60]:
        print('  ', b)


def _ids():
    p = PARC / 'ids.json'
    return jload(p) if p.exists() else {'pages': {}, 'sections': {}, 'frames': {}}


def _key(k):
    return '|'.join(k)


def section_desc(s):
    lang = 'en' if s['lang'] == 'en' else 'fr'
    base = {'entry': 'Arrivée, connexion simulée, déchiffrement, puis logo, cercle et globe : les étapes s’enchaînent seules, aux durées du site quand le code en donne.',
            'member': 'Écrans relevés en membre (Leïla Mansour), après la connexion simulée : Explorer, listes, fiches, 42 Awards et la fiche Compte. Les fenêtres et onglets que le relevé n’a pas en membre mènent à leur écran relevé en visiteur.'}
    common = ('Chaque cadre est une copie d’un cadre vérifié des pages 01 à 08 (ou un écran membre rendu par le même moteur), à la hauteur de '
              'l’écran : la page défile, l’en-tête et le menu du bas restent fixes. Les zones cliquables reprennent les éléments du site ; une '
              'fenêtre ou un panneau mène à l’écran relevé exact, Fermer et Retour reviennent à l’écran précédent. Le thème Sombre se choisit '
              'dans Compte → Thème (mode « Sombre » de « 42 · Couleurs ») ; Compte → Langue → %s passe au parcours %s.') % (
        ('English', 'anglais') if lang == 'fr' else ('Français', 'français'))
    return (base.get(s['group'], '') + ' ' + common).strip()


def pages_call(plan):
    led = jload(LEDGER)
    pages = []
    for fmt in ('desktop', 'mobile'):
        secs = [dict(s, id=sid, desc=section_desc(s)) for sid, s in plan['sections'].items() if s['fmt'] == fmt]
        pages.append([fmt, PAGES[fmt], [{k: s[k] for k in ('id', 'name', 'desc', 'x', 'y', 'w', 'h')} for s in secs]])
    from docs_pages import fr_spaces
    for p in pages:
        for s in p[2]:
            s['desc'] = fr_spaces(s['desc'])
    code = guard_spaces(PAGES_CALL % {'pages': json.dumps(pages, ensure_ascii=False), 'after': led['pages']['08 · Éléments communs']})
    f = CALLS / ('%03d-parcours-pages.js' % next_index()); f.write_text(code); print(f.name, len(code))


def copies_calls(plan, limit=12):
    led, ids = jload(LEDGER), _ids()
    groups = {}
    for key, F in plan['frames'].items():
        if F['state'] in MEMBER:
            continue
        groups.setdefault((F['fmt'], F['source']['page']), []).append((key, F))
    for (fmt, spage), items in sorted(groups.items()):
        heavy = lambda F: F['state'].startswith(('filter-', 'project-comments', 'comments-', 'mention-', 'article-comments'))
        batch, n = [], 0
        def flush(batch):
            if not batch:
                return
            jobs = [{'key': k, 'src': F['source']['id'], 'name': F['name'], 'section': ids['sections'][F['section']], 'at': F['at'],
                     'full': F['h'] > VH[F['fmt']] + 4, 'vh': VH[F['fmt']], 'fixed': F['fixed']} for k, F in batch]
            code = COPY_CALL % {'dest': PAGES[fmt], 'destPage': ids['pages'][fmt], 'srcPage': led['pages'][spage],
                                'colors': led['collections']['42 · Couleurs']['id'], 'jobs': json.dumps(jobs, ensure_ascii=False), 'convert': CONVERT_FN}
            code = guard_spaces(code)
            f = CALLS / ('%03d-parcours-copies-%s-%s.js' % (next_index(), fmt, re.sub(r'[^a-z0-9]+', '-', spage.lower()).strip('-')[:24]))
            f.write_text(code); print(f.name, len(code), len(jobs), 'copies')
        for k, F in items:
            if heavy(F):
                flush([(k, F)])
                continue
            batch.append((k, F))
            if len(batch) >= limit:
                flush(batch); batch = []
        flush(batch)


def member_layouts(plan):
    """layouts/parcours-ordinateur.json and parcours-mobile.json: the member screens of the flows, in one row per section (a
    frame is rendered at its full height before its conversion), for layout.scenes()."""
    ids = _ids()
    for fmt in ('desktop', 'mobile'):
        secs = {}
        for key, F in plan['frames'].items():
            if F['fmt'] != fmt or F['state'] not in MEMBER:
                continue
            sid = '%s-staging' % fmt
            s = plan['sections'][sid]
            secs.setdefault(sid, {'id': sid, 'title': s['name'], 'note': '', 'route': '', 'main': False,
                                  'y': s['y'], 'w': s['w'], 'h': s['h'], 'rows': [[]]})
            secs[sid]['rows'][0].append({'state': F['state'], 'fmt': fmt, 'lang': F['lang'], 'theme': 'light', 'name': F['name'],
                                         'w': F['w'], 'h': F['h'], 'x': F['staging'][0], 'y': F['staging'][1]})
        name = 'parcours-ordinateur' if fmt == 'desktop' else 'parcours-mobile'
        lay = {'area': 'shell', 'key': name, 'page': PAGES[fmt], 'sections': list(secs.values())}
        (LAYOUTS / f'{name}.json').write_text(json.dumps(lay, ensure_ascii=False, indent=1))
        print(name, sum(len(s['rows'][0]) for s in secs.values()), 'écrans membre')


def convert_calls(plan, fmts=('desktop', 'mobile')):
    led, ids = jload(LEDGER), _ids()
    P = Plan()
    for fmt in fmts:
        jobs = []
        for key, F in plan['frames'].items():
            if F['fmt'] != fmt or F['state'] not in MEMBER:
                continue
            fixed = P.fixed_layers(F)
            jobs.append({'key': key, 'name': F['name'], 'staging': ids['sections']['%s-staging' % fmt], 'section': ids['sections'][F['section']],
                         'at': F['at'], 'full': F['h'] > VH[fmt] + 4, 'vh': VH[fmt], 'fixed': fixed})
        for i in range(0, len(jobs), 9):
            code = guard_spaces(CONVERT_CALL % {'dest': PAGES[fmt], 'destPage': ids['pages'][fmt], 'colors': led['collections']['42 · Couleurs']['id'],
                                                'jobs': json.dumps(jobs[i:i + 9], ensure_ascii=False), 'convert': CONVERT_FN})
            f = CALLS / ('%03d-parcours-conversion-%s-%d.js' % (next_index(), fmt, i // 9 + 1)); f.write_text(code); print(f.name, len(code))
        for p in P.problems:
            print('  ', p)


def links_calls(plan, limit=26000, fmts=('desktop', 'mobile'), only=None, tag=''):
    """calls/<n>-parcours-liens-<fmt>-<lot>.js; with only (keys of frames), the lots of these frames alone, without the
    starting points (19 Oct.: a correction of some frames after the lots were sent; tag names the call)."""
    led, ids = jload(LEDGER), _ids()
    fids = ids['frames']
    from docs_pages import fr_spaces
    for fmt in fmts:
        jobs, size, lot = [], 0, 1
        keys = [k for k, F in plan['frames'].items() if F['fmt'] == fmt and (only is None or k in only)]
        if not keys:
            continue

        def flush(jobs, lot, last):
            flows = ''
            if last and only is None:
                st = []
                for lang, label in (('fr', 'Français'), ('en', 'English')):
                    for state, what in zip(('arrival-scan-binary', 'member-explore', 'projects'), ('arrivée', 'membre', 'aperçu direct') if lang == 'fr' else ('arrival', 'member', 'direct preview')):
                        k = '|'.join((fmt, lang, 'v', state))
                        if k in fids:
                            st.append({'nodeId': fids[k], 'name': '%s · %s' % (label, what)})
                flows = 'dest.flowStartingPoints = %s;\nout.flows = dest.flowStartingPoints.length;' % json.dumps(st, ensure_ascii=False)
            code = guard_spaces(LINKS_CALL % {'dest': PAGES[fmt], 'destPage': ids['pages'][fmt], 'lot': lot, 'colors': led['collections']['42 · Couleurs']['id'],
                                              'jobs': json.dumps(jobs, ensure_ascii=False), 'flows': flows})
            f = CALLS / ('%03d-parcours-liens-%s%s-%d.js' % (next_index(), fmt, tag, lot)); f.write_text(code); print(f.name, len(code), len(jobs), 'cadres')
        for i, k in enumerate(keys):
            F = plan['frames'][k]
            if k not in fids:
                print('   cadre sans identifiant :', k); continue
            zones = []
            for h in plan['hotspots'].get(k, []):
                a = dict(h['act'])
                if 'nav' in a:
                    if a['nav'] not in fids:
                        print('   arrivée sans identifiant :', k, '→', a['nav']); continue
                    a['nav'] = fids[a['nav']]
                lab = h['label'] + (' → ' + plan['frames'][h['act']['nav']]['name'] if 'nav' in h['act'] else '')
                zones.append(dict({'box': h['box'], 'fixed': h['fixed'], 'label': fr_spaces(lab), 'act': a}, **({'in': h['in']} if h.get('in') else {})))
            auto = plan['auto'].get(k)
            if auto and auto['nav'] in fids:
                auto = {'nav': fids[auto['nav']], 'after': auto['after']}
            elif auto:
                print('   enchaînement sans identifiant :', k); auto = None
            job = {'id': fids[k], 'zones': zones, 'auto': auto, 'scrolls': F['h'] > VH[fmt] + 4}
            s = len(json.dumps(job, ensure_ascii=False))
            if jobs and size + s > limit:
                flush(jobs, lot, False); jobs, size, lot = [], 0, lot + 1
            jobs.append(job); size += s
        flush(jobs, lot, True)


def record():
    """../parcours/ids.json from the results of the parcours calls (pages, copies, conversions) and of the member screens."""
    ids = _ids()
    res = BASE / 'call-results'
    for p in sorted(res.glob('*-parcours-*.json'), key=lambda p: int(re.match(r'\d+', p.name).group())):
        try:
            r = jload(p)
        except ValueError:
            continue
        if not isinstance(r, dict) or r.get('is_error'):
            continue
        if 'pages' in r and 'sections' in r:
            ids['pages'].update(r['pages']); ids['sections'].update(r['sections'])
        ids['frames'].update(r.get('ids') or {})
    (PARC / 'ids.json').write_text(json.dumps(ids, ensure_ascii=False, indent=1))
    # the flow pages and the sections of the member screens in the ledger, for layout.scenes('parcours-…')
    if ids['pages']:
        led = jload(LEDGER)
        plan = jload(PARC / 'plan.json')
        for fmt, pid in ids['pages'].items():
            led['pages'][PAGES[fmt]] = pid
            key = 'parcours-ordinateur' if fmt == 'desktop' else 'parcours-mobile'
            led.setdefault('sections', {})[key] = {sid: ids['sections'][sid] for sid, s in plan['sections'].items() if s['fmt'] == fmt and sid in ids['sections']}
        LEDGER.write_text(json.dumps(led, ensure_ascii=False, indent=1))
    print('pages', len(ids['pages']), 'sections', len(ids['sections']), 'cadres', len(ids['frames']))


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'plan':
        report(Plan().build().save())
    elif cmd == 'verify':
        verify(sys.argv[2:])
    elif cmd == 'check':
        check_calls(jload(PARC / 'plan.json'))
    else:
        plan = jload(PARC / 'plan.json')
        {'pages': pages_call, 'copies': copies_calls, 'layout': member_layouts, 'convert': lambda p: convert_calls(p, tuple(sys.argv[2:]) or ('desktop', 'mobile')),
         'links': lambda p: links_calls(p, fmts=tuple(sys.argv[2:]) or ('desktop', 'mobile')),
         # python3 parcours.py correct <tag> <frame key>…: the lots of these frames alone
         'correct': lambda p: links_calls(p, only=set(sys.argv[3:]), tag='-' + sys.argv[2])}.get(cmd, lambda p: record())(plan) if cmd != 'record' else record()
