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
"""
import gzip, json, re, sys
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
MEMBER_NAMES = {'member-explore': 'Explorer · Monde', 'member-projects': 'Liste des projets', 'member-project': 'Fiche projet',
                'member-people': 'Liste des profils', 'member-profile': 'Fiche profil', 'member-journal': 'Liste des chroniques',
                'member-article': 'Chronique', 'member-awards': 'Page 42 Awards', 'member-account': 'Compte de Leïla Mansour'}
# entrance: the animation steps shown one after the other (« après un délai »); delays from entrance.mjs where it has them
# (LANGUAGE_INTERVAL_MS 4 s, logo 0.6 s, ring 0.8 s, decryption 1.3 s, member fade 0.45 s), others indicative
ARRIVAL = [('arrival-scan-binary', 'arrival-scan-hex', 1.0), ('arrival-scan-hex', 'arrival-scan-return', 1.0),
           ('arrival-scan-return', 'arrival-encrypted', 1.0), ('arrival-encrypted', 'arrival-labels-en', 4.0),
           ('arrival-labels-en', 'arrival-labels-ar', 4.0), ('arrival-labels-ar', 'arrival-encrypted', 4.0)]
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
        x, y, w, h = n['x'], n['y'], n['w'], n['h']
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
        for k, F in self.F.items():
            dd = self.dd(F)
            if dd is None:
                self.problems.append('relevé absent : ' + F['name'])
                continue
            self._variants(k, F, dd)   # first: the dedicated captures win over the links of the mapping on the same element
            self._links(k, F, dd)
            if F['state'] not in self.overlay and F['group'] != 'entry':
                self._globals(k, F, dd)
            self._close(k, F, dd)
            self._tabs(k, F, dd)
            self._panels(k, F, dd)
        self._sequences()
        for k in self.H:
            self.H[k] = self._dedupe(self.H[k])

    def add(self, k, box, fx, action, label, key=None):
        if box:
            self.H[k].append({'box': box, 'fixed': bool(fx), 'act': action, 'label': label, 'key': key})

    def _links(self, k, F, dd):
        fmt = F['fmt']
        base_state = MEMBER.get(F['state']) if F['state'] in MEMBER else F['state']
        for l in self.map['links']:
            if l['fmt'] != fmt or l.get('fromScreen'):
                continue   # links of the elements present everywhere: _globals()
            states = [((l.get('fromFrame') or {}).get('state'), (l.get('evidence') or {}).get('dom'))]
            states += [(a.get('state'), (l.get('evidence') or {}).get('dom')) for a in l.get('alsoFrom') or []]
            alts = [a.get('dom') for a in l.get('altHotspots') or []]
            for st, dom in states:
                if st != base_state or l.get('status') in ('sans zone', 'sans cadre de départ', 'grisé', 'automatique'):
                    continue
                for d in [dom] + alts:
                    n = dd['byK'].get((d or {}).get('key'))
                    if n is None:
                        if d:
                            self.missing.append((F['name'], l['via'], d.get('key')))
                        continue
                    b, fx = self.box(F, dd, n)
                    if l.get('kind') == 'out' and l.get('url'):
                        self.add(k, b, fx, {'url': l['url']}, l['via'], d.get('key'))
                    elif l.get('kind') == 'back' or l.get('status') == 'libellé différent':
                        self.add(k, b, fx, {'back': 1}, l['via'], d.get('key'))
                    else:
                        to = (l.get('toFrame') or {}).get('state')
                        t = self.target(F, self.retarget(to, text_of(dd, n))) if to else None
                        t = t or (self.target(F, to) if to else None)
                        if t:
                            self.add(k, b, fx, {'nav': t}, l['via'], d.get('key'))
                        elif to:
                            self.missing.append((F['name'], l['via'], 'arrivée hors parcours : ' + to))
        for l in self.map['implicitLinks'].get('searchOpener', []):
            pass   # the search opener is found by its structure in _globals()

    def _globals(self, k, F, dd):
        member = self.member_ctx(F)
        section = self.state_group.get(MEMBER.get(F['state']) or F['state'], '')
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
                act, label = self.target(F, DIE[section]), 'Dé'
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
            if act:
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
                    self.add(k, b, fx, {'back': 1}, (z or {}).get('label') or 'Fermer', n.get('k'))

    def _tabs(self, k, F, dd):
        st = MEMBER.get(F['state']) or F['state']
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
            t = self.target(F, tab)
            if t:
                b, fx = self.box(F, dd, n)
                self.add(k, b, fx, {'nav': t}, 'Onglet · ' + (m.group(3) or 'vue d’ensemble'), n.get('k'))

    def _variants(self, k, F, dd):
        """Entries of the states that are not screens of the site map (sort open, list view, last page…), found in the
        capture of the screen they open from."""
        st = F['state']
        find = lambda pred: next((n for n in dd['nodes'] if pred(n)), None)
        txt = lambda n: text_of(dd, n).strip()
        rules = []
        if st in ('projects', 'people'):
            rules += [(lambda n: n['tag'] == 'button' and 'cp-control-trigger' in (n.get('cls') or '') and 'sort' in (n.get('id') or '') + (n.get('aria-label') or '').lower() + txt(n).lower() or (n['tag'] == 'button' and txt(n) in ('Trier', 'Sort')), st + '-sort-open', 'Trier'),
                      (lambda n: n['tag'] == 'button' and 'cp-control-trigger' in (n.get('cls') or '') and txt(n).startswith(('Affichage', 'View')), st + '-list', 'Affichage · Liste'),
                      (lambda n: n['tag'] == 'a' and 'cp-pagination-link' in (n.get('cls') or '') and re.search(r'page=(4|7)$', n.get('href') or ''), st + '-last-page', 'Dernière page')]
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
        if st == 'project-comments-thread':
            rules.append((lambda n: n['tag'] == 'button' and 'cp-comments-sort' in (n.get('cls') or ''), 'comments-sort-open', 'Trier les commentaires'))
        if st == 'campus-sheet' and F['fmt'] == 'mobile':
            rules.append((lambda n: 'campus-sheet-handle' in (n.get('cls') or ''), 'campus-sheet-expanded', 'Déployer la fiche'))
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
        if F['fmt'] == 'mobile' and st in ('project', 'profile', 'article'):
            rules.append((lambda n: n['tag'] == 'summary', None, 'Dans ce …'))
        for pred, to, label in rules:
            if to is None:
                sel = [s for (s, f, l) in self.src if f == 'mobile' and l == 'fr' and s.startswith(st) and 'selector' in s or (s, f, l) == (st + '-sections-open', 'mobile', 'fr')]
                to = next((s for s in sel), None)
                if to is None:
                    sel = [s for (s, f, l), fr in self.src.items() if f == 'mobile' and l == 'fr' and 'sélecteur' in fr['name'] and self.state_screen.get(s, '').startswith(st)]
                    to = sel[0] if sel else None
                if to is None:
                    continue
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
        st = F['state']
        if st not in ('account-theme', 'account-language'):
            return
        choices = [n for n in dd['nodes'] if 'account-choice' in (n.get('cls') or '').split()]
        for i, n in enumerate(choices):
            b, fx = self.box(F, dd, n)
            if st == 'account-theme':
                self.add(k, b, fx, {'mode': ['Clair', 'Sombre', 'Clair'][i] if i < 3 else 'Clair'}, ['Clair', 'Sombre', 'Système'][min(i, 2)], n.get('k'))
            else:
                other = {1: 'en', 0: 'fr'}.get(i)
                if other and other != F['lang']:
                    t = (F['fmt'], other, 'v', st)
                    if t in self.F:
                        self.add(k, b, fx, {'nav': t}, ['Français', 'English'][i], n.get('k'))

    def _sequences(self):
        for fmt in ('desktop', 'mobile'):
            for lang in ('fr', 'en'):
                chain = [(a, b, s, 'v', 'v') for a, b, s in ARRIVAL + VISITOR_PATH]
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
            same = next((o for o in out if all(abs(a - b) < 2 for a, b in zip(o['box'], h['box']))), None)
            if same is None:
                out.append(h)
            elif same['act'] != h['act']:
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
            if h['fixed'] != inside(h['box']):
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
if (src.id !== dest.id) await src.loadAsync();
const colors = await figma.variables.getVariableCollectionByIdAsync('%(colors)s');
const J = %(jobs)s;
const out = { ids: {}, missing: [], fixed: {}, notFound: {} };
%(convert)s
for (const j of J) {
  const s = await figma.getNodeByIdAsync(j.src);
  const sec = await figma.getNodeByIdAsync(j.section);
  if (!s || !sec) { out.missing.push(j.key); continue; }
  for (const old of sec.children.filter(n => n.name === j.name)) old.remove();
  const c = s.clone(); sec.appendChild(c); c.name = j.name; c.x = j.at[0]; c.y = j.at[1];
  convert(c, j);
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
  const T0 = c.absoluteTransform;
  let moved = 0;
  const lost = [];
  for (const f of j.fixed) {
    const n = locate(c, f.path, f.x, f.y);
    if (!n) { lost.push(f.path.join(' > ')); continue; }
    const t = n.absoluteTransform, ax = t[0][2] - T0[0][2], ay = t[1][2] - T0[1][2];
    c.appendChild(n); n.x = ax; n.y = ay + f.dy; moved++;
  }
  c.resizeWithoutConstraints(c.width, j.vh); c.clipsContent = true; c.overflowDirection = 'VERTICAL';
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
const out = { zones: 0, fixedZones: 0, auto: 0, missing: [], badTarget: [] };
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
  // again from scratch: zones of an earlier run removed, the fixed layers of the copy kept fixed
  const kids = f.children, nf = f.numberOfFixedChildren;
  const oldFixedZones = kids.slice(kids.length - nf).filter(n => n.name.startsWith('Zone · ')).length;
  for (const old of kids.filter(n => n.name.startsWith('Zone · '))) old.remove();
  let fixedCount = nf - oldFixedZones;
  f.numberOfFixedChildren = fixedCount;
  let fz = 0;
  for (const h of j.zones) {
    const a = act(h.act, f);
    if (!a || (h.act.nav && !(await figma.getNodeByIdAsync(h.act.nav)))) { out.badTarget.push(j.id + ' ' + h.label); continue; }
    const z = figma.createFrame(); z.name = UN('Zone · ' + h.label); z.fills = []; z.clipsContent = false;
    if (h.fixed && fixedCount + fz >= 0 && j.scrolls) { f.appendChild(z); fz++; } else { f.insertChild(f.children.length - fixedCount - fz, z); }
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


def convert_calls(plan):
    led, ids = jload(LEDGER), _ids()
    P = Plan()
    for fmt in ('desktop', 'mobile'):
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


def links_calls(plan, limit=26000):
    led, ids = jload(LEDGER), _ids()
    fids = ids['frames']
    from docs_pages import fr_spaces
    for fmt in ('desktop', 'mobile'):
        jobs, size, lot = [], 0, 1
        keys = [k for k, F in plan['frames'].items() if F['fmt'] == fmt]

        def flush(jobs, lot, last):
            flows = ''
            if last:
                st = []
                for lang, label in (('fr', 'Français'), ('en', 'English')):
                    for state, what in zip(('arrival-scan-binary', 'member-explore', 'projects'), ('arrivée', 'membre', 'aperçu direct') if lang == 'fr' else ('arrival', 'member', 'direct preview')):
                        k = '|'.join((fmt, lang, 'v', state))
                        if k in fids:
                            st.append({'nodeId': fids[k], 'name': '%s · %s' % (label, what)})
                flows = 'dest.flowStartingPoints = %s;\nout.flows = dest.flowStartingPoints.length;' % json.dumps(st, ensure_ascii=False)
            code = guard_spaces(LINKS_CALL % {'dest': PAGES[fmt], 'destPage': ids['pages'][fmt], 'lot': lot, 'colors': led['collections']['42 · Couleurs']['id'],
                                              'jobs': json.dumps(jobs, ensure_ascii=False), 'flows': flows})
            f = CALLS / ('%03d-parcours-liens-%s-%d.js' % (next_index(), fmt, lot)); f.write_text(code); print(f.name, len(code), len(jobs), 'cadres')
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
                zones.append({'box': h['box'], 'fixed': h['fixed'], 'label': fr_spaces(lab), 'act': a})
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
    else:
        plan = jload(PARC / 'plan.json')
        {'pages': pages_call, 'copies': copies_calls, 'layout': member_layouts, 'convert': convert_calls, 'links': links_calls}.get(cmd, lambda p: record())(plan) if cmd != 'record' else record()
