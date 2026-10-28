"""Correspondance plan du site -> cadres Figma FR clairs -> zones cliquables (lecture seule, hors ligne).

python3 -I build.py  -> ../parcours-correspondance.json (+ statistiques sur la sortie standard)
"""
import sys, json, re, unicodedata, pathlib, collections

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import plib

OUT = pathlib.Path(__file__).resolve().parent.parent
FMTS = ('desktop', 'mobile')
SM = plib.site_map()
NODES = {n['id']: n for n in SM['nodes']}
GROUP = {n['id']: n['group'] for n in SM['nodes']}
FRAMES = {(f['state'], f['fmt']): f for f in plib.frames()}
LEDGER = plib.ledger_ids()
_FC, _SC = {}, {}


def frame(state, fmt):
    if (state, fmt) not in FRAMES:
        return None
    if (state, fmt) not in _FC:
        _FC[(state, fmt)] = plib.Frame(FRAMES[(state, fmt)])
    return _FC[(state, fmt)]


def scene(F):
    k = (F.area, F.state, F.fmt)
    if k not in _SC:
        _SC[k] = plib.Scene(*k)
    return _SC[k]


def norm(s):
    s = (s or '').replace('’', "'").replace(' ', ' ').replace(' ', ' ')
    return re.sub(r'\s+', ' ', s).strip().lower()


def slug(s):
    s = unicodedata.normalize('NFKD', s or '')
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


# ------------------------------------------------------------------ screens -> frames
# (state, role, note): the first state present in a format is the base frame of the screen in that format.
B, V, Q, O = 'base', 'variante', 'étape', 'origine'
SCREEN_STATES = {
    'arrival': [('arrival-encrypted', B, 'message chiffré au repos : état stable, boutons Se connecter et Visiter'),
                ('arrival-scan-binary', Q, 'scan binaire : premier état affiché par le site'),
                ('arrival-scan-hex', Q, 'scan hexadécimal'), ('arrival-scan-return', Q, 'remontée du scan'),
                ('arrival-labels-en', V, 'libellés des boutons en anglais (alternance FR, EN, AR sans changer la langue)'),
                ('arrival-labels-ar', V, 'libellés des boutons en arabe (même alternance)')],
    'entry-signin': [('entry-signin', B, '')], 'entry-signup': [('entry-signup', B, '')],
    'decrypt': [('decrypt-mid', B, 'à mi-parcours : premier cadre de l’étape'), ('decrypt-final', Q, 'phrase finale'),
                ('member-transition', Q, 'vers le logo (membre) : dernier cadre avant l’ouverture')],
    'opening': [('opening-logo', B, 'logo seul, commun aux deux accès'),
                ('visitor-transition', Q, 'parcours visiteur : du message chiffré au logo (premier cadre après Visiter)'),
                ('opening-ring-drawing', Q, 'tracé du cercle'), ('opening-ring', Q, 'cercle complet')],
    'world-wait': [('world-wait', B, '')],
    'reveal': [('reveal-mid', B, 'à mi-parcours'), ('reveal-end', Q, 'fin, juste avant Explorer')],
    'entry-error': [('entry-error', B, '')],
    'content-preview': [],
    'g-logo': [], 'g-die': [], 'g-account': [],
    'g-dock': [('dock-300', V, 'menu du bas dans une fenêtre de 300 px (liste des projets)'),
               ('dock-320', V, 'menu du bas sur un téléphone de 320 px (liste des projets)')],
    'g-search': [('search-open', B, 'recherche ouverte sur la liste des projets')],
    'g-back-top': [('back-to-top', B, 'liste des projets défilée de 1 400 px, bouton visible')],
    'explore': [('explore', B, '')], 'explore-country': [('explore-country', B, 'France')],
    'explore-campus': [('explore-campus', B, '42 Paris')],
    'campus-sheet': [('campus-sheet', B, '42 Paris'), ('campus-sheet-expanded', V, 'feuille déployée (mobile)'),
                     ('campus-sheet-mulhouse', V, '42 Mulhouse (ordinateur)')],
    'campus-website': [], 'campus-directions': [], 'campus-contacts': [],
    'scope-popover': [('scope-popover', B, 'ouverte sur Explorer · Monde')],
    'about-dialog': [('about-dialog', B, '')], 'campus-source': [],
    'explore-noglobe': [('explore-noglobe', B, '')],
    'campus-window': [('campus-window', B, 'ouverte sur la fiche de minishell (42 Paris)')],
    'viewer': [('viewer', B, 'ouverte sur l’illustration de minishell')],
    'report': [('report', B, 'depuis la fiche de ft_transcendence'), ('report-profile', O, 'depuis la fiche de Leïla Mansour')],
    'comment-menu': [('comment-menu', B, 'commentaires de minishell, après publication')],
    'projects': [('projects', B, 'page 1, vue Grille'), ('projects-list', V, 'vue Liste'), ('projects-sort-open', V, 'tri ouvert'),
                 ('projects-last-page', V, 'dernière page (?page=7)'), ('projects-empty', V, 'état vide')],
    'filter-projects': [('filter-projects', B, 'sur la liste des projets'), ('filter-projects-expanded', V, 'catégories déployées'),
                        ('profile-projects-filter', O, 'filtre local de l’onglet Projets d’un profil')],
    'project': [('project', B, 'ft_transcendence : plusieurs campus'),
                ('project-single', V, 'minishell : campus unique, même projet que les onglets relevés'),
                ('project-local-menu', V, 'sélecteur « Dans ce projet » ouvert (mobile, ft_transcendence)')],
    'project-overview': [('project', B, 'onglet ouvert par défaut de la fiche'), ('project-single', V, 'minishell')],
    'project-implementation': [('project-implementation', B, 'minishell')],
    'project-media': [('project-media', B, 'minishell')],
    'project-test': [('project-test', B, 'minishell, formulaire du lien'), ('project-test-saved', V, 'lien enregistré')],
    'project-comments': [('project-comments', B, 'minishell, liste vide'), ('project-comments-thread', V, 'avec un fil, après publication'),
                         ('comments-sort-open', V, 'tri ouvert'), ('mention-picker', V, 'suggestions de mention')],
    'campus-choice': [('campus-choice', B, 'ft_transcendence')], 'repo-link': [],
    'people': [('people', B, 'page 1, vue Grille'), ('people-list', V, 'vue Liste'), ('people-sort-open', V, 'tri ouvert'),
               ('people-last-page', V, 'dernière page (?page=4)')],
    'filter-people': [('filter-people', B, ''), ('filter-people-expanded', V, 'catégories déployées')],
    'profile': [('profile', B, 'Leïla Mansour'), ('profile-alumni', V, 'Inès Morel, statut Alumni'),
                ('profile-transcender', V, 'Noé Laurent, statut Transcender'),
                ('profile-local-menu', V, 'sélecteur « Dans ce profil » ouvert (mobile)')],
    'profile-overview': [('profile', B, 'onglet ouvert par défaut de la fiche'), ('profile-alumni', V, 'Inès Morel'),
                         ('profile-transcender', V, 'Noé Laurent')],
    'profile-projects': [('profile-projects', B, 'Leïla Mansour'), ('profile-projects-filter', V, 'filtre local ouvert')],
    'profile-journey': [('profile-journey', B, 'Leïla Mansour')],
    'profile-contribution': [('profile-contribution', B, 'Leïla Mansour : « Pas encore de contribution aux chroniques. »')],
    'message-dialog': [('message-dialog', B, 'vers Leïla Mansour')], 'social-links': [],
    'journal': [('journal', B, 'page 1, vue Grille')],
    'article': [('article', B, 'Montrer ce qui n’est pas encore fini')],
    'article-article': [('article', B, 'onglet ouvert par défaut de la chronique')],
    'article-media': [('article-media', B, '')], 'article-authors': [('article-authors', B, '')],
    'article-comments': [('article-comments', B, 'liste vide'), ('article-comments-thread', V, 'avec un fil, après publication')],
    'awards': [('awards', B, '')],
    'account-visitor': [('account-visitor', B, 'ouvert sur la liste des projets')],
    'settings': [('account-settings', B, '')], 'theme': [('account-theme', B, '')], 'language': [('account-language', B, '')],
    'signin-dialog': [('signin-dialog', B, '')], 'signup-dialog': [('signup-dialog', B, '')],
    'account-member': [('account-member', B, 'Leïla Mansour, ouvert sur la liste des projets')],
    'messages': [('messages', B, '')], 'notifications': [('notifications', B, '')],
}
NO_FRAME_REASON = {
    'content-preview': 'point d’entrée séparé, content-preview.html : il ouvre directement la liste des projets, dont le cadre sert de départ',
    'g-logo': 'élément toujours présent : zone donnée dans chaque cadre, voir globals',
    'g-die': 'élément toujours présent : zone donnée dans chaque cadre, voir globals',
    'g-account': 'élément toujours présent : zone donnée dans chaque cadre, voir globals',
    'campus-website': 'site externe', 'campus-directions': 'site externe, Google Maps', 'campus-contacts': 'liens externes : courriel, téléphone, sources',
    'campus-source': 'site externe', 'repo-link': 'site externe : dépôt', 'social-links': 'liens externes ; aucun profil fictif n’en a',
}
SEQUENCES = {   # automatic order of the frames of a step screen (one format = same order)
    'arrival': ['arrival-scan-binary', 'arrival-scan-hex', 'arrival-scan-return', 'arrival-encrypted', 'arrival-labels-en', 'arrival-labels-ar'],
    'decrypt': ['decrypt-mid', 'decrypt-final', 'member-transition'],
    'opening': ['visitor-transition', 'opening-logo', 'opening-ring-drawing', 'opening-ring'],
    'reveal': ['reveal-mid', 'reveal-end'],
}



def frame_ref(state, fmt, role=None, note=None, node=None):
    f = FRAMES[(state, fmt)]
    r = {'name': f['name'], 'page': f['page'], 'state': state, 'w': f['w'], 'h': f['h'],
         'height': 'pleine' if f['h'] > (844 if fmt == 'mobile' else 960) + 4 else 'écran'}
    if role:
        r['role'] = role
    if note:
        r['note'] = note
    nid = LEDGER.get((f['page'], f['name']))
    if nid:
        r['figmaId'] = nid
    return r


def screen_frames(nid, fmt):
    return [(s, role, note) for (s, role, note) in SCREEN_STATES.get(nid, []) if (s, fmt) in FRAMES]


def base_state(nid, fmt):
    for s, role, _ in screen_frames(nid, fmt):
        if role == B:
            return s
    return None


def route_of(F):
    return F.meta.get('routeOpened') if isinstance(F.meta, dict) else None


def route_key(r):
    """'#projects/x?tab=media&y' -> ('#projects/x', 'media'); tab None for the default tab."""
    if not r:
        return (None, None)
    r = r.split('#', 1)[1] if '#' in r and not r.startswith('#') else r
    r = r if r.startswith('#') else '#' + r
    path, _, q = r.partition('?')
    params = dict(p.split('=', 1) for p in q.split('&') if '=' in p)
    if path.startswith('#explore'):
        return (path + ('?' + '&'.join(f'{k}={params[k]}' for k in ('country', 'campus') if k in params) if params else ''), None)
    return (path, params.get('tab'))


# ------------------------------------------------------------------ element helpers
def T(F, n):
    return norm(F.deep_text(n, 600))


def A(n):
    return norm(n.get('aria-label'))


def C(n, c):
    return c in (n.get('cls') or '').split()


def href_key(n):
    h = n.get('href') or ''
    if '#' not in h:
        return None
    return route_key('#' + h.split('#', 1)[1])


def opacity_dim(F, n):
    for a in [n] + F.ancestors(n):
        try:
            if float(a.get('s', {}).get('opacity', '1')) < 0.6:
                return True
        except ValueError:
            pass
    return False


def describe(F, n):
    d = {'tag': n['tag']}
    for k in ('id', 'cls', 'aria-label', 'href', 'role'):
        if n.get(k):
            d[k] = n[k][:120]
    t = F.deep_text(n, 120)
    if t:
        d['text'] = t
    d['key'] = n['k']
    return d


def scene_evidence(F, n, box):
    S = scene(F)
    if not S.ok:
        return None
    full = F.box(n)
    m = S.match(full) or S.match(box)
    if m:
        it = m[0]
        return {'match': 'exacte', 'node': it['n'] or it['tx'], 'type': it['t'], 'path': ' > '.join(p for p in it['path'][-3:] if p)}
    x, y, w, h = box
    best = None
    for it in S.items:
        if it['t'] == 'T' or it['w'] <= 0 or it['h'] <= 0:
            continue
        if it['x'] <= x + 1.5 and it['y'] <= y + 1.5 and it['x'] + it['w'] >= x + w - 1.5 and it['y'] + it['h'] >= y + h - 1.5:
            if best is None or it['w'] * it['h'] < best['w'] * best['h']:
                best = it
    if best:
        return {'match': 'contenue', 'node': best['n'] or best['tx'], 'type': best['t'], 'box': [round(best['x'], 2), round(best['y'], 2), best['w'], best['h']],
                'path': ' > '.join(p for p in best['path'][-3:] if p)}
    return {'match': 'aucune'}


CLICKABLE_ROLES = {'button', 'tab', 'link', 'menuitem', 'option', 'combobox'}


def clickable(F, n):
    return (n['tag'] in ('a', 'button', 'summary', 'select', 'input', 'textarea') or n.get('role') in CLICKABLE_ROLES
            or (n['tag'] == 'article' and C(n, 'cp-card')))


def z_path(F, n):
    out = []
    for a in reversed([n] + F.ancestors(n)):
        st = a.get('s', {})
        z = st.get('z')
        if st.get('position') in ('relative', 'absolute', 'fixed', 'sticky') and z not in (None, 'auto'):
            try:
                out.append(int(z))
            except ValueError:
                pass
    return out


def top_layer(F, n):
    """Index of the open modal <dialog> holding n (the top layer, above any z-index), else None."""
    for a in [n] + F.ancestors(n):
        if a['tag'] == 'dialog' and 'backdrop' in a:
            return a['i']
    return None


def painted_above(F, m, n):
    """Approximate paint order: modal dialogs (top layer) first, then z-index of the positioned ancestors
    (outermost first), then document order."""
    tm, tn = top_layer(F, m), top_layer(F, n)
    if tm != tn:
        if tm is None:
            return False
        if tn is None:
            return True
        return tm > tn
    zm, zn = z_path(F, m), z_path(F, n)
    for a, b in zip(zm, zn):
        if a != b:
            return a > b
    if len(zm) != len(zn):
        return len(zm) > len(zn) if (zm[len(zn):] or [0])[0] > 0 else False
    return m['i'] > n['i']


def covered_by(F, n, hs):
    """Clickable elements painted above n (z-index of their positioned ancestors, then document order), outside its
    subtree, that cover most of its zone."""
    if not hs:
        return []
    anc = {a['i'] for a in F.ancestors(n)}
    out = []
    area = hs['w'] * hs['h']
    for m in F.nodes:
        if m['i'] == n['i'] or m['i'] in anc or not clickable(F, m) or not painted_above(F, m, n):
            continue
        if n['i'] in {a['i'] for a in F.ancestors(m)}:
            continue
        cb = F.clip_box(m)
        if not cb:
            continue
        ix = max(0, min(hs['x'] + hs['w'], cb[0] + cb[2]) - max(hs['x'], cb[0]))
        iy = max(0, min(hs['y'] + hs['h'], cb[1] + cb[3]) - max(hs['y'], cb[1]))
        if area and ix * iy / area >= 0.5:
            out.append({'label': (m.get('aria-label') or F.deep_text(m, 50) or m['tag'])[:60], 'box': cb})
    return out[:3]


def candidates(F, pred):
    out = []
    for n in F.nodes:
        if n['tag'] in ('use', 'svg', 'path'):
            continue
        try:
            ok = pred(F, n)
        except Exception:
            ok = False
        if ok:
            out.append(n)
    return out


def visible(F, n, ratio=0.3):
    """Drawn in the frame: a visible part of at least 30 % of the element (a result cut by the bottom of a scrolling
    list, or a tab hidden by the scroll of a picker, does not count)."""
    cb = F.clip_box(n)
    if not cb:
        return False
    full = F.box(n)
    a = full[2] * full[3]
    return a <= 0 or cb[2] * cb[3] / a >= ratio


def hotspot(F, n):
    cb = F.clip_box(n)
    if not cb:
        return None
    full = F.box(n)
    h = {'x': cb[0], 'y': cb[1], 'w': cb[2], 'h': cb[3]}
    if abs(cb[2] - full[2]) > 0.5 or abs(cb[3] - full[3]) > 0.5:
        h['clipped'] = True
        h['full'] = {'x': full[0], 'y': full[1], 'w': full[2], 'h': full[3]}
    return h


# ------------------------------------------------------------------ global elements
def g_logo(F, n):
    return n['tag'] == 'a' and C(n, 'brand')


def g_dock(section):
    def p(F, n):
        if n['tag'] != 'button' or n.get('data-section') != section:
            return False
        par = F.byI.get(n['p'])
        return par is not None and C(par, 'main-nav')
    return p


def g_search(F, n):
    return n['tag'] == 'button' and C(n, 'dock-search-toggle')


def g_die(F, n):
    return n['tag'] == 'button' and n.get('id') == 'random-campus'


def g_account(F, n):
    return n['tag'] == 'button' and n.get('id') == 'profile'


def g_messages(F, n):
    return n['tag'] == 'button' and n.get('id') == 'account-messages'


def g_notifications(F, n):
    return n['tag'] == 'button' and n.get('id') == 'account-notifications'


def g_back_top(F, n):
    return n['tag'] == 'button' and n.get('id') == 'back-to-top'


GLOBAL_PRED = [('g-logo', 'Logo', g_logo)] + [('g-dock', s, g_dock(s)) for s in ('explore', 'projects', 'people', 'journal', 'awards')] + [
    ('g-search', 'Chercher dans Horizon', g_search), ('g-die', 'Dé', g_die), ('g-account', 'Compte', g_account),
    ('g-account', 'Messagerie', g_messages), ('g-account', 'Notifications', g_notifications), ('g-back-top', 'Remonter en haut', g_back_top)]

# ------------------------------------------------------------------ edge matchers
# key: (from, to, via.fr) -> spec. pred(F, n); label: wording shown on the site for this exact link (status);
# from_states / to_states: frames to try, in order; pick: 'route' chooses, among candidates, the one whose target
# (href or text) is shown by a frame of the destination; alt: extra zones of the same link (pred).


def by_id(i):
    return lambda F, n: n.get('id') == i


def by_text(t, tags=('button', 'a', 'summary')):
    t = norm(t)
    return lambda F, n: n['tag'] in tags and T(F, n) == t


def by_aria(t, start=False):
    t = norm(t)
    return lambda F, n: (A(n).startswith(t) if start else A(n) == t)


def by_cls(c, tag=None):
    return lambda F, n: C(n, c) and (tag is None or n['tag'] == tag)


def both(*ps):
    return lambda F, n: all(p(F, n) for p in ps)


def either(*ps):
    return lambda F, n: any(p(F, n) for p in ps)


CARD_LINK = either(by_cls('cp-card-cover-link', 'a'), by_cls('cp-card-title-link', 'a'))
SPEC = {
    # entrance
    ('arrival', 'entry-signin', 'Se connecter'): dict(pred=by_id('entry-login'), label='Se connecter'),
    ('arrival', 'opening', 'Visiter'): dict(pred=by_id('entry-guest'), label='Visiter', to_states=['visitor-transition']),
    ('entry-signin', 'decrypt', 'Simuler une connexion réussie'): dict(pred=by_text('Simuler une connexion réussie'), label='Simuler une connexion réussie'),
    ('entry-signup', 'decrypt', 'Simuler la création du compte'): dict(pred=by_text('Simuler la création du compte'), label='Simuler la création du compte'),
    ('entry-error', 'opening', 'Réessayer'): dict(pred=by_text('Réessayer'), label='Réessayer', to_states=['opening-logo']),
    ('entry-error', 'arrival', 'Revenir au message'): dict(pred=by_text('Revenir au message'), label='Revenir au message'),
    ('entry-error', 'explore-noglobe', 'Continuer sans le globe'): dict(pred=by_text('Continuer sans le globe'), label='Continuer sans le globe'),
    ('entry-error', 'entry-signin', 'Compte, puis Se connecter'): dict(pred=g_account, label=None,
        note='2 actions sur le site (Compte, puis Se connecter dans le menu du compte de l’entrée) : ce menu n’a pas de cadre, la zone est l’icône du compte'),
    ('entry-error', 'entry-signup', 'Compte, puis Créer un compte'): dict(pred=g_account, label=None,
        note='2 actions sur le site (Compte, puis Créer un compte) : le menu du compte de l’entrée n’a pas de cadre ; même zone que le lien vers « Connexion — prototype »'),
    # explore
    ('explore', 'explore-country', 'Cliquer un pays'): dict(pred=both(by_cls('hg-marker'), by_aria('Explorer · France')), label=None,
        note='repère de la France sur le globe (14 × 14 px sur le site) ; le pays lui-même n’a pas de boîte dans le relevé'),
    ('explore-country', 'explore-campus', 'Cliquer un campus'): dict(pred=both(by_cls('hg-marker'), by_aria('Explorer · 42 Paris')), label='42 Paris'),
    ('explore-country', 'explore', '← ou Revenir au monde'): dict(pred=by_id('reset'), label=None, alt=[('←', by_id('scope-back'))],
        note='deux boutons : « Revenir au monde » (zone principale) et ← « Revenir au niveau précédent »'),
    ('explore-campus', 'explore-country', '← ou nom du pays'): dict(pred=by_id('scope-back'), label=None, alt=[('France', by_id('scope-country'))],
        note='deux boutons : ← « Revenir au niveau précédent » (zone principale) et la pastille du pays « France »'),
    ('explore-campus', 'explore', 'Revenir au monde'): dict(pred=by_id('reset'), label=None),
    ('explore-campus', 'campus-sheet', 'Nom du campus ou viseur'): dict(pred=both(by_cls('hg-selected'), by_aria('Explorer · 42 Paris')), label='42 Paris'),
    ('campus-sheet', 'campus-website', 'Site officiel du campus'): dict(pred=by_cls('campus-details-link', 'a'), label='Site officiel du campus',
        emptyNote='le lien est dans le relevé, plus bas dans le volet : hors de la partie visible (défilement interne) dans les cadres de la fiche campus'),
    ('campus-sheet', 'campus-directions', 'Itinéraire'): dict(pred=by_cls('campus-details-directions', 'a'), label='Itinéraire'),
    ('campus-sheet', 'viewer', 'Une photo'): dict(pred=by_cls('campus-details-photo-open', 'button'), label=None),
    ('explore', 'scope-popover', 'Pastille « Monde ▾ »'): dict(pred=by_id('scope-picker'), label='Monde'),
    ('explore-country', 'scope-popover', 'Pastille du pays ▾'): dict(pred=by_id('scope-picker'), label='France'),
    ('explore-campus', 'scope-popover', 'Pastille du campus ▾'): dict(pred=by_id('scope-picker'), label='42 Paris'),
    ('scope-popover', 'explore', 'Tous les pays'): dict(pred=by_id('scope-selectors-1-country'), label=None,
        note='liste native « Pays » (valeur affichée « Tous les pays ») : ses options ne sont pas dessinées dans le cadre'),
    ('scope-popover', 'explore-country', 'Choisir un pays'): dict(pred=by_id('scope-selectors-1-country'), label=None,
        note='même liste « Pays » que « Tous les pays » : ses options ne sont pas dessinées'),
    ('scope-popover', 'explore-campus', 'Choisir un campus'): dict(pred=by_id('scope-selectors-1-campus'), label=None,
        note='liste native « Campus » (valeur affichée « Tous les campus ») : ses options ne sont pas dessinées'),
    ('explore', 'about-dialog', 'Exploration · 42 Horizon'): dict(pred=by_id('about'), label='Exploration · 42 Horizon'),
    ('about-dialog', 'campus-source', 'Consulter la source officielle des campus'): dict(pred=by_cls('network-source', 'a'), label='Consulter la source officielle des campus'),
    ('campus-sheet', 'campus-contacts', 'Un contact, Source ou Consulter les dates officielles'): dict(
        pred=either(by_cls('campus-details-contact-value', 'a'), by_cls('campus-details-source', 'a')), label=None,
        note='premier lien visible parmi les contacts, « Source » et « Consulter les dates officielles »'),
    # shared windows
    ('campus-window', 'campus-sheet', 'Viseur du campus'): dict(pred=both(by_cls('hg-selected'), by_aria('Explorer · 42 Paris')), label='42 Paris'),
    ('comment-menu', 'report', 'Signaler'): dict(pred=by_cls('cp-comment-report', 'button'), label='Signaler'),
    # projects
    ('projects', 'filter-projects', 'Filtrer'): dict(pred=by_id('content-category-button'), label='Filtrer'),
    ('projects', 'project', 'Carte d’un projet'): dict(pred=by_cls('cp-card-cover-link', 'a'), label=None, pick='route',
        alt=[('titre de la carte', by_cls('cp-card-title-link', 'a'))], note='image de la carte (zone principale) et son titre'),
    ('projects', 'project-overview', '« +N » d’une carte (équipe)'): dict(pred=by_cls('cp-author-more', 'a'), label=None, pick='route',
        note='« + N » ouvre la fiche à l’équipe (?focus=team) ; le cadre montre la fiche entière'),
    ('projects', 'profile', 'Auteur d’une carte (« Créé par »)'): dict(pred=by_cls('cp-author-link', 'a'), label=None, pick='route'),
    ('project', 'projects', 'Retour aux projets'): dict(pred=by_cls('cp-back', 'button'), label='Retour aux projets'),
    ('project', 'profile', 'Retour au profil'): dict(pred=by_cls('cp-back', 'button'), label='Retour au profil'),
    ('project', 'campus-window', 'Explorer + nom du campus (« Explorer 42 Paris »)'): dict(
        pred=lambda F, n: C(n, 'cp-project-campus') and T(F, n).startswith('explorer 42'), label=None, from_states=['project-single', 'project'],
        fromWhy='seul cadre où « Explorer 42 Paris » existe (projet à campus unique) ; la fenêtre est relevée sur ce projet'),
    ('project', 'campus-choice', 'Explorer un campus'): dict(pred=lambda F, n: C(n, 'cp-project-campus') and T(F, n) == 'explorer un campus', label='Explorer un campus'),
    ('campus-choice', 'campus-window', 'Un campus de la liste'): dict(pred=lambda F, n: C(n, 'cp-project-campus-choice') and T(F, n).startswith('42 paris'), label=None,
        note='« 42 Paris » : la fenêtre relevée est celle de 42 Paris'),
    ('project', 'report', 'Signaler'): dict(pred=by_cls('cp-report-trigger', 'button'), label='Signaler'),
    ('project-overview', 'viewer', 'Illustration principale'): dict(pred=by_cls('cp-project-media-open', 'button'), label=None, from_states=['project-single', 'project'],
        fromWhy='la visionneuse est relevée sur l’illustration de minishell, que montre ce cadre'),
    ('project-overview', 'profile', 'Un membre de l’équipe'): dict(pred=by_cls('cp-author-link', 'a'), label=None, pick='route'),
    ('project-implementation', 'viewer', 'Image du récit'): dict(pred=by_cls('cp-project-media-open', 'button'), label=None),
    ('project-media', 'viewer', 'Une image de la galerie'): dict(pred=by_cls('cp-project-media-open', 'button'), label=None),
    ('project-test', 'repo-link', 'Voir le dépôt'): dict(pred=by_cls('cp-project-trial-open', 'a'), label='Voir le dépôt ↗', from_states=['project-test-saved', 'project-test'],
        fromWhy='« Voir le dépôt » n’existe qu’après « Enregistrer » (aucun projet n’a de dépôt par défaut)',
        pre=dict(state='project-test', pred=by_text('Enregistrer'), to='project-test-saved', label='Enregistrer')),
    ('project-comments', 'profile', 'Publier, puis l’auteur ou une mention @'): dict(pred=by_cls('cp-comment-author', 'a'), label=None, pick='route',
        fromWhy='les commentaires démarrent vides : l’auteur, la mention et les trois points n’existent qu’après publication (bouton « Ajouter »)', from_states=['project-comments-thread'], alt=[('mention @', by_cls('cp-comment-mention', 'a'))],
        pre=dict(state='project-comments', pred=by_cls('cp-comments-submit', 'button'), to='project-comments-thread', label='Ajouter')),
    ('project-comments', 'comment-menu', 'Publier, puis les trois points'): dict(pred=by_cls('cp-comment-menu-toggle', 'button'), label=None,
        fromWhy='les commentaires démarrent vides : l’auteur, la mention et les trois points n’existent qu’après publication (bouton « Ajouter »)', from_states=['project-comments-thread'],
        pre=dict(state='project-comments', pred=by_cls('cp-comments-submit', 'button'), to='project-comments-thread', label='Ajouter')),
    # profiles
    ('people', 'filter-people', 'Filtrer'): dict(pred=by_id('content-category-button'), label='Filtrer'),
    ('people', 'profile', 'Carte d’un profil'): dict(pred=both(by_cls('cp-profile-card'), lambda F, n: n['tag'] == 'article'), label=None, pick='route',
        note='la carte entière est cliquable (pas de lien dans le relevé)'),
    ('profile', 'people', 'Retour aux profils'): dict(pred=by_cls('cp-back', 'button'), label='Retour aux profils'),
    ('profile', 'projects', 'Retour aux projets'): dict(pred=by_cls('cp-back', 'button'), label='Retour aux projets'),
    ('profile', 'journal', 'Retour aux chroniques'): dict(pred=by_cls('cp-back', 'button'), label='Retour aux chroniques'),
    ('profile', 'project', 'Retour au projet'): dict(pred=by_cls('cp-back', 'button'), label='Retour au projet'),
    ('profile', 'article', 'Retour à l’article'): dict(pred=by_cls('cp-back', 'button'), label='Retour à l’article'),
    ('profile', 'viewer', 'Portrait'): dict(pred=by_cls('cp-profile-portrait-open', 'button'), label=None),
    ('profile', 'message-dialog', 'Envoyer un message'): dict(pred=by_cls('cp-profile-message', 'button'), label='Envoyer un message'),
    ('profile', 'report', 'Signaler'): dict(pred=by_cls('cp-report-trigger', 'button'), label='Signaler'),
    ('profile-overview', 'campus-window', 'Explorer + nom du campus, bloc « À 42 »'): dict(pred=by_cls('cp-profile-campus', 'button'), label=None),
    ('profile-overview', 'social-links', 'Un lien de « Réseaux et liens »'): dict(
        pred=lambda F, n: n['tag'] == 'a' and (n.get('href') or '').startswith('http') and any(C(a, c) for a in F.ancestors(n) for c in ('cp-profile-links', 'cp-profile-social')), label=None,
        emptyNote='aucun profil fictif n’a de réseaux (constat du plan) : aucun lien dans les cadres'),
    ('profile-projects', 'filter-projects', 'Filtrer'): dict(pred=by_id('profile-project-category-button'), label='Filtrer', to_states=['profile-projects-filter', 'filter-projects']),
    ('profile-projects', 'project', 'Carte d’un projet'): dict(pred=by_cls('cp-profile-related-link', 'a'), label=None, pick='route'),
    ('profile-contribution', 'article', 'Carte d’une chronique'): dict(
        pred=lambda F, n: n['tag'] == 'a' and (n.get('href') or '').startswith('#journal/') and F.box(n)[0] > 480, label=None,
        emptyNote='Leïla Mansour n’a écrit aucune chronique : le cadre affiche « Pas encore de contribution aux chroniques. »'),
    # chronicles
    ('journal', 'article', 'Carte d’une chronique'): dict(pred=by_cls('cp-card-cover-link', 'a'), label=None, pick='route',
        alt=[('titre de la carte', by_cls('cp-card-title-link', 'a'))], note='image de la carte (zone principale) et son titre'),
    ('journal', 'article-authors', '« +N » d’une carte'): dict(pred=by_cls('cp-author-more', 'a'), label=None, pick='route'),
    ('journal', 'profile', 'Auteur d’une carte (« Rédigé par »)'): dict(pred=by_cls('cp-author-link', 'a'), label=None, pick='route'),
    ('article', 'journal', 'Retour aux chroniques'): dict(pred=by_cls('cp-back', 'button'), label='Retour aux chroniques'),
    ('article', 'profile', 'Retour au profil'): dict(pred=by_cls('cp-back', 'button'), label='Retour au profil'),
    ('article', 'campus-window', 'Explorer + nom du campus'): dict(pred=by_cls('cp-project-campus', 'button'), label=None),
    ('article', 'report', 'Signaler'): dict(pred=by_cls('cp-report-trigger', 'button'), label='Signaler'),
    ('article-article', 'viewer', 'Illustration principale'): dict(pred=by_cls('cp-project-media-open', 'button'), label=None),
    ('article-media', 'viewer', 'Une image de la galerie'): dict(pred=by_cls('cp-project-media-open', 'button'), label=None),
    ('article-authors', 'profile', 'Un auteur'): dict(pred=by_cls('cp-author-link', 'a'), label=None, pick='route'),
    ('article-comments', 'profile', 'Publier, puis l’auteur ou une mention @'): dict(pred=by_cls('cp-comment-author', 'a'), label=None, pick='route',
        fromWhy='les commentaires démarrent vides : l’auteur, la mention et les trois points n’existent qu’après publication (bouton « Ajouter »)', from_states=['article-comments-thread'], alt=[('mention @', by_cls('cp-comment-mention', 'a'))],
        pre=dict(state='article-comments', pred=by_cls('cp-comments-submit', 'button'), to='article-comments-thread', label='Ajouter')),
    ('article-comments', 'comment-menu', 'Publier, puis les trois points'): dict(pred=by_cls('cp-comment-menu-toggle', 'button'), label=None,
        fromWhy='les commentaires démarrent vides : l’auteur, la mention et les trois points n’existent qu’après publication (bouton « Ajouter »)', from_states=['article-comments-thread'],
        pre=dict(state='article-comments', pred=by_cls('cp-comments-submit', 'button'), to='article-comments-thread', label='Ajouter')),
    # account
    ('account-visitor', 'signin-dialog', 'Se connecter'): dict(pred=both(by_cls('account-auth-action'), by_text('Se connecter')), label='Se connecter'),
    ('account-visitor', 'signup-dialog', 'Créer un compte'): dict(pred=both(by_cls('account-auth-action'), by_text('Créer un compte')), label='Créer un compte'),
    ('account-visitor', 'settings', 'Paramètres'): dict(pred=both(by_cls('account-option'), by_aria('Paramètres')), label='Paramètres'),
    ('account-visitor', 'theme', 'Thème'): dict(pred=both(by_cls('account-option'), by_aria('Thème', True)), label=None),
    ('account-visitor', 'language', 'Langue'): dict(pred=both(by_cls('account-option'), by_aria('Langue', True)), label=None),
    ('signin-dialog', 'account-member', 'Continuer avec le profil, puis l’avatar'): dict(pred=both(by_cls('dialog-option'), by_text('Continuer avec le profil')), label='Continuer avec le profil',
        note='2 actions sur le site (Continuer, puis l’avatar) : la page en membre qui les sépare n’a pas de cadre'),
    ('signup-dialog', 'account-member', 'Simuler la création du compte, puis l’avatar'): dict(pred=both(by_cls('dialog-option'), by_text('Simuler la création du compte')), label='Simuler la création du compte',
        note='2 actions sur le site (Simuler, puis l’avatar) : la page en membre qui les sépare n’a pas de cadre'),
    ('account-member', 'profile', 'Compte'): dict(pred=both(by_cls('account-option'), by_aria('Compte')), label='Compte',
        note='la fiche de Leïla Mansour en membre (relevé member-account) n’a pas de cadre : le cadre visiteur de la même fiche la remplace'),
    ('account-member', 'settings', 'Paramètres'): dict(pred=both(by_cls('account-option'), by_aria('Paramètres')), label='Paramètres'),
    ('account-member', 'theme', 'Thème'): dict(pred=both(by_cls('account-option'), by_aria('Thème', True)), label=None),
    ('account-member', 'language', 'Langue'): dict(pred=both(by_cls('account-option'), by_aria('Langue', True)), label=None),
    ('messages', 'people', 'Découvrir les profils'): dict(pred=both(by_cls('account-option'), by_aria('Découvrir les profils')), label='Découvrir les profils'),
}
GLOBAL_SPEC = {
    ('g-logo', 'explore'): (g_logo, None),
    ('g-dock', 'explore'): (g_dock('explore'), 'Explorer'), ('g-dock', 'projects'): (g_dock('projects'), 'Projets'),
    ('g-dock', 'people'): (g_dock('people'), 'Profils'), ('g-dock', 'journal'): (g_dock('journal'), 'Chroniques'),
    ('g-dock', 'awards'): (g_dock('awards'), '42 Awards'),
    ('g-die', 'explore-campus'): (both(g_die, by_aria('Visiter un campus')), None), ('g-die', 'project'): (both(g_die, by_aria('Découvrir un projet')), None),
    ('g-die', 'profile'): (both(g_die, by_aria('Découvrir un profil')), None), ('g-die', 'article'): (both(g_die, by_aria('Découvrir un article')), None),
    ('g-account', 'account-visitor'): (both(g_account, by_aria('Menu du compte')), None),
    ('g-account', 'account-member'): (both(g_account, by_aria('Compte ·', True)), None),
    ('g-account', 'messages'): (g_messages, None), ('g-account', 'notifications'): (g_notifications, None),
}
SEARCH_KIND = {'explore-campus': 'campus', 'project': 'projet', 'profile': 'profil', 'article': 'chroniques'}


def has_chrome(nid):
    n = NODES[nid]
    return n['kind'] in ('page', 'tab') and n['group'] != 'entry'


def in_rule(rule, nid):
    return GROUP[nid] in rule or nid in rule


def allowed(item, nid):
    return not (item.get('notFrom') and in_rule(item['notFrom'], nid)) and not (item.get('onlyFrom') and not in_rule(item['onlyFrom'], nid))


# ------------------------------------------------------------------ choosing frames
def target_states_for_key(to, key, fmt):
    """States of `to` whose route shows the page `key` (from an href or a route)."""
    out = []
    for s, role, _ in screen_frames(to, fmt):
        F = frame(s, fmt)
        rk = route_key(route_of(F))
        if key and rk[0] == key[0] and (key[1] or None) == (rk[1] or None):
            out.append(s)
    return out


def underlying(F):
    return route_key(route_of(F))


def pick_to_state(to, fmt, from_F, spec, hot_node):
    """Destination frame: explicit states, else the frame whose page matches the clicked link, else (overlay) the frame
    opened over the same page as the start, else the base frame."""
    opts = screen_frames(to, fmt)
    if not opts:
        return None, None
    names = [s for s, _, _ in opts]
    if spec and spec.get('to_states'):
        for s in spec['to_states']:
            if s in names:
                return s, 'imposé par la règle du lien'
    kind = NODES[to]['kind']
    if hot_node is not None and kind in ('page', 'tab'):
        hk = href_key(hot_node)
        if hk:
            m = target_states_for_key(to, hk, fmt)
            if m:
                return m[0], 'page du lien cliqué (%s)' % hk[0]
    if kind == 'overlay' and from_F is not None and from_F.area != 'entrance':
        fr = underlying(from_F)
        same = [s for s in names if underlying(frame(s, fmt)) == fr]
        if same:
            return same[0], 'fenêtre relevée sur la même page que le départ'
        same_page = [s for s in names if underlying(frame(s, fmt))[0] == fr[0]]
        if same_page:
            return same_page[0], 'fenêtre relevée sur la même fiche que le départ'
    return base_state(to, fmt), 'cadre de base'


def name_key(F, n):
    """Target page key of a candidate without href (profile cards, search results)."""
    hk = href_key(n)
    if hk:
        return hk
    t = T(F, n)
    return t


def route_pick(F, cands, to, fmt):
    """Order candidates: those whose target is shown by a frame of `to` first (base frame first)."""
    st_routes = []
    for s, role, _ in screen_frames(to, fmt):
        st_routes.append((s, role, route_key(route_of(frame(s, fmt)))))
    scored = []
    for i, n in enumerate(cands):
        hk = href_key(n)
        best = None
        for rank, (s, role, rk) in enumerate(st_routes):
            if hk:
                if rk[0] == hk[0]:
                    best = (rank, s)
                    break
            else:
                sl = slug(F.deep_text(n, 300))
                pid = (rk[0] or '').split('/')[-1]
                person = pid.replace('profile-', '')
                if person and person in sl:
                    best = (rank, s)
                    break
        scored.append((best[0] if best else 99, i, n, best[1] if best else None))
    scored.sort(key=lambda x: (x[0], x[1]))
    return scored


def label_status(F, n, label):
    if label is None:
        return 'retrouvée'
    shown = T(F, n) or A(n)
    return 'retrouvée' if norm(label) == shown or norm(label) in shown else 'libellé différent'


def link_entry(e, fmt):
    fr, to, via = e['from'], e['to'], e.get('via', {}).get('fr', '')
    base = {'from': fr, 'to': to, 'via': via, 'fmt': fmt, 'kind': e.get('kind', 'clic')}
    for k in ('when', 'requires', 'sets', 'cost'):
        if k in e:
            base[k] = e[k]['fr'] if isinstance(e[k], dict) else e[k]
    return base


def resolve_edge(e, fmt):
    """One entry (or several for always-present controls) of `links` for edge e in format fmt."""
    fr, to = e['from'], e['to']
    via = e.get('via', {}).get('fr', '')
    out = []
    if e.get('kind') == 'auto':
        ent = link_entry(e, fmt)
        ent['trigger'] = 'automatique (après un délai)'
        ent['hotspot'] = None
        seq_f = SEQUENCES.get(fr)
        from_s = None
        if fr == 'decrypt':
            from_s = 'member-transition'
        elif fr == 'opening':
            from_s = 'opening-ring'
        elif fr == 'reveal':
            from_s = 'reveal-end'
        elif seq_f:
            from_s = seq_f[-1]
        else:
            from_s = base_state(fr, fmt)
        to_s = {'opening': 'opening-logo', 'reveal': 'reveal-mid'}.get(to) or base_state(to, fmt)
        ent['fromFrame'] = frame_ref(from_s, fmt) if from_s and (from_s, fmt) in FRAMES else None
        ent['toFrame'] = frame_ref(to_s, fmt) if to_s and (to_s, fmt) in FRAMES else None
        ent['status'] = 'automatique' if ent['fromFrame'] and ent['toFrame'] else 'sans cadre de départ'
        ev = {'règle': 'dernier cadre de l’étape de départ, premier cadre de l’écran d’arrivée'}
        if fr == 'content-preview':
            ev['note'] = NO_FRAME_REASON['content-preview']
        if fr in ('opening', 'world-wait'):
            ev['note'] = 'deux suites automatiques partent de ce cadre (globe prêt ou non) : un seul « après un délai » possible par cadre dans Figma'
        ent['evidence'] = ev
        return [ent]
    if NODES[fr]['kind'] == 'global':
        return resolve_global(e, fmt)
    spec = SPEC.get((fr, to, via))
    ent = link_entry(e, fmt)
    if spec is None:
        ent.update(status='sans règle', hotspot=None, fromFrame=None, toFrame=None, evidence={'note': 'aucune règle de recherche écrite pour ce lien'})
        return [ent]
    states = spec.get('from_states') or [s for s, _, _ in screen_frames(fr, fmt)]
    states = [s for s in states if (s, fmt) in FRAMES]
    tried = []
    found = None
    for s in states:
        F = frame(s, fmt)
        cands = candidates(F, spec['pred'])
        vis = [n for n in cands if visible(F, n)]
        tried.append({'frame': FRAMES[(s, fmt)]['name'], 'candidats': len(cands), 'visibles': len(vis)})
        if not vis:
            continue
        if spec.get('pick') == 'route':
            order = route_pick(F, vis, to, fmt)
            n = order[0][2]
            extra = [(x[2], x[3]) for x in order[1:] if x[3] and x[3] != order[0][3]]
        else:
            n = vis[0]
            extra = []
        found = (s, F, n, extra)
        break
    if not found:
        ent['fromFrame'] = frame_ref(states[0], fmt) if states else None
        ent['toFrame'] = None
        s_to, why = pick_to_state(to, fmt, frame(states[0], fmt) if states else None, spec, None)
        if s_to:
            ent['toFrame'] = frame_ref(s_to, fmt)
        elif NODES[to]['kind'] == 'external':
            ent['toFrame'] = None
        ent['hotspot'] = None
        ent['status'] = 'sans zone' if states else 'sans cadre de départ'
        ent['evidence'] = {'cherché': tried}
        if spec.get('emptyNote') or spec.get('note'):
            ent['evidence']['note'] = spec.get('emptyNote') or spec.get('note')
        return [ent]
    s, F, n, extra = found
    hs = hotspot(F, n)
    ent['fromFrame'] = frame_ref(s, fmt)
    if NODES[to]['kind'] == 'external':
        ent['toFrame'] = None
        ent['url'] = n.get('href')
        why = 'site externe : action « ouvrir le lien »'
    else:
        s_to, why = pick_to_state(to, fmt, F, spec, n)
        ent['toFrame'] = frame_ref(s_to, fmt) if s_to else None
    ent['hotspot'] = hs
    ent['status'] = label_status(F, n, spec.get('label'))
    if opacity_dim(F, n):
        ent['status'] = 'grisé'
    ev = {'dom': describe(F, n), 'scene': scene_evidence(F, n, [hs['x'], hs['y'], hs['w'], hs['h']]),
          'cadre': 'pleine hauteur (document entier)' if F.full else 'hauteur de l’écran, défilement %g px' % F.sy,
          'arrivée': why}
    roles = {s_: (r_, n_) for s_, r_, n_ in screen_frames(fr, fmt)}
    if s in roles and roles[s][0] != B:
        ev['départ'] = '%s (%s) : %s' % (roles[s][0], roles[s][1], spec.get('fromWhy') or 'seul cadre du départ où la commande est visible')
    if spec.get('label') and ent['status'] == 'libellé différent':
        ev['libelléAffiché'] = F.deep_text(n, 80)
        if C(n, 'cp-back'):
            ev['note'] = ('même bouton Retour : son libellé et sa destination dépendent de l’origine de la visite ; le cadre, ouvert par un lien direct, '
                          'affiche « %s ». Piste : l’action « Back » de Figma reproduit ce retour selon l’origine' % F.deep_text(n, 80))
    if spec.get('note'):
        ev['note'] = spec['note']
    if len(tried) > 1 and tried[0]['visibles'] == 0:
        ev['cherché'] = tried
    mism = mismatch_note(F, ent['toFrame'], to, fmt) or href_mismatch(n, ent['toFrame'], fmt, to) or person_mismatch(F, n, ent['toFrame'], fmt, spec)
    if mism:
        ev['écart'] = mism
    cov = covered_by(F, n, hs)
    if cov:
        ev['recouvertPar'] = cov
    ent['evidence'] = ev
    # extra zones of the same link
    alts = []
    for lab, pred in spec.get('alt', []):
        cand = [m for m in candidates(F, pred) if m is not n and visible(F, m)]
        hk = href_key(n)
        same = [m for m in cand if hk and href_key(m) == hk]
        for m in (same or ([] if hk and spec.get('pick') == 'route' else cand))[:1]:
            alts.append({'label': lab, 'hotspot': hotspot(F, m), 'dom': describe(F, m)})
    for m, s2 in extra[:3]:
        h2 = hotspot(F, m)
        if h2:
            alts.append({'label': F.deep_text(m, 60) or m.get('aria-label') or m.get('href'), 'hotspot': h2, 'toFrame': frame_ref(s2, fmt), 'dom': describe(F, m)})
    if alts:
        ent['altHotspots'] = alts
    # same control on the other frames of the start screen
    also = []
    for s2, role, _ in screen_frames(fr, fmt):
        if s2 == s:
            continue
        F2 = frame(s2, fmt)
        c2 = [m for m in candidates(F2, spec['pred']) if visible(F2, m)]
        item = None
        if spec.get('pick') == 'route' and c2:
            best = route_pick(F2, c2, to, fmt)[0]
            if best[3]:
                item = {'hotspot': hotspot(F2, best[2]), 'toFrame': frame_ref(best[3], fmt)}
        elif c2:
            item = {'hotspot': hotspot(F2, c2[0])}
        if item:
            also.append(dict({'frame': FRAMES[(s2, fmt)]['name'], 'page': FRAMES[(s2, fmt)]['page'], 'state': s2}, **item))
    if also:
        ent['alsoFrom'] = also
    if spec.get('pre'):
        p = spec['pre']
        if (p['state'], fmt) in FRAMES:
            F0 = frame(p['state'], fmt)
            c0 = [m for m in candidates(F0, p['pred']) if visible(F0, m)]
            ent['before'] = {'fromFrame': frame_ref(p['state'], fmt), 'toFrame': frame_ref(p['to'], fmt) if (p['to'], fmt) in FRAMES else None,
                             'via': p['label'], 'hotspot': hotspot(F0, c0[0]) if c0 else None,
                             'note': 'action sur place qui précède ce lien (le plan compte %s actions)' % e.get('cost', 2)}
    return [ent]


def mismatch_note(F, to_ref, to, fmt):
    if not to_ref or F.area == 'entrance':
        return None
    T_ = frame(to_ref['state'], fmt)
    if NODES[to]['kind'] != 'overlay':
        return None
    a, b = underlying(F), underlying(T_)
    if a[0] != b[0]:
        return 'la fenêtre d’arrivée est relevée sur %s, le départ est %s' % (route_of(T_), route_of(F))
    return None


def href_mismatch(n, to_ref, fmt, to):
    hk = href_key(n)
    if not hk or not to_ref or NODES[to]['kind'] not in ('page', 'tab'):
        return None
    T_ = frame(to_ref['state'], fmt)
    rk = underlying(T_)
    if T_.area == 'entrance':
        return None
    if rk[0] != hk[0]:
        return 'le lien cliqué ouvre %s ; le cadre d’arrivée montre %s' % (hk[0], route_of(T_))
    return None


def person_mismatch(F, n, to_ref, fmt, spec):
    """Profile cards and search results carry no href: compare the person or title with the destination frame."""
    if href_key(n) or not to_ref or not spec or spec.get('pick') != 'route':
        return None
    T_ = frame(to_ref['state'], fmt)
    pid = (underlying(T_)[0] or '').split('/')[-1].replace('profile-', '')
    if pid and pid not in slug(F.deep_text(n, 300)):
        return 'l’élément cliqué (%s) ne correspond pas à la fiche du cadre d’arrivée (%s)' % (F.deep_text(n, 60), route_of(T_))
    return None


def start_frames(fmt):
    """Start frames for always-present controls: base frame of every page or tab after the entrance (one per screen),
    plus project-single (minishell), base of the tabs relevés."""
    out = []
    seen = set()
    for nid, n in NODES.items():
        if not has_chrome(nid):
            continue
        for s, role, _ in screen_frames(nid, fmt):
            if role == B or (nid == 'project' and s == 'project-single'):
                if s not in seen:
                    seen.add(s)
                    out.append((nid, s))
    return out


MEMBER_FRAMES = ['account-member', 'messages', 'notifications']


def resolve_global(e, fmt):
    fr, to = e['from'], e['to']
    via = e.get('via', {}).get('fr', '')
    g = NODES[fr]
    res = []
    if fr == 'g-search':
        F = frame('search-open', fmt)
        ent = link_entry(e, fmt)
        ent['fromFrame'] = frame_ref('search-open', fmt)
        kind = SEARCH_KIND[to]
        cands = [n for n in candidates(F, lambda F_, n: C(n, 'dock-search-result')) if T(F, n).endswith(kind) and visible(F, n)]
        if not cands:
            hidden = [n for n in candidates(F, lambda F_, n: C(n, 'dock-search-result')) if T(F, n).endswith(kind)]
            ent.update(hotspot=None, toFrame=frame_ref(base_state(to, fmt), fmt), status='sans zone',
                       evidence={'note': ('le résultat « %s » est sous la partie visible de la liste défilante' % F.deep_text(hidden[0], 60)) if hidden
                                 else 'aucun résultat « %s » dans la recherche relevée' % kind})
            return [ent]
        # prefer a result shown by a frame of the destination
        best = None
        for n in cands:
            t = slug(F.deep_text(n, 300))
            for s, role, _ in screen_frames(to, fmt):
                F2 = frame(s, fmt)
                h1 = [slug(F2.deep_text(m, 120)) for m in F2.nodes if m['tag'] == 'h1']
                rk = route_key(route_of(F2))
                if to == 'explore-campus' and 'campus=paris' in (rk[0] or '') and t.startswith('42-paris'):
                    best = best or (n, s)
                elif to != 'explore-campus' and h1 and h1[0] and t.startswith(h1[0]) and h1[0] not in ('projets', 'profils', 'chroniques'):
                    best = best or (n, s)
            if best:
                break
        n, s_to = best if best else (cands[0], base_state(to, fmt))
        hs = hotspot(F, n)
        ent.update(hotspot=hs, toFrame=frame_ref(s_to, fmt), status='retrouvée',
                   evidence={'dom': describe(F, n), 'scene': scene_evidence(F, n, [hs['x'], hs['y'], hs['w'], hs['h']]),
                             'cadre': 'hauteur de l’écran ; recherche relevée avec la saisie « Paris » (8 résultats)',
                             'arrivée': 'résultat qui ouvre le cadre relevé' if best else 'cadre de base (aucun résultat visible ne correspond au cadre relevé)'})
        if not best:
            ent['evidence']['écart'] = 'le résultat visible (%s) ouvre une autre fiche que celle du cadre relevé' % F.deep_text(n, 80)
        if hs.get('clipped'):
            ent['evidence']['note'] = 'résultat coupé par le bas de la liste défilante'
        return [ent]
    pred, label = GLOBAL_SPEC[(fr, to)]
    req = e.get('requires')
    if req == 'member':
        starts = [(None, s) for s in MEMBER_FRAMES if (s, fmt) in FRAMES]
    else:
        starts = [(nid, s) for nid, s in start_frames(fmt) if allowed(g, nid) and allowed(e, nid)]
    for nid, s in starts:
        F = frame(s, fmt)
        if req == 'member' and s == to.replace('account-member', 'account-member'):
            # the panel is already open on its own frame: skip the control that opened it
            if (to == 'account-member' and s == 'account-member') or (to == s):
                continue
        ent = link_entry(e, fmt)
        ent['fromScreen'] = nid or s
        ent['fromFrame'] = frame_ref(s, fmt)
        c = [n for n in candidates(F, pred) if visible(F, n)]
        if not c:
            ent.update(hotspot=None, toFrame=None, status='sans zone', evidence={'note': 'élément absent ou masqué dans ce cadre'})
            res.append(ent)
            continue
        n = c[0]
        hs = hotspot(F, n)
        s_to, why = pick_to_state(to, fmt, F, None, None)
        if fr == 'g-die' and to == 'project':
            s_to, why = base_state('project', fmt), 'cadre de base (tirage au sort)'
        ent['hotspot'] = hs
        ent['toFrame'] = frame_ref(s_to, fmt) if s_to else None
        ent['status'] = 'grisé' if opacity_dim(F, n) else label_status(F, n, label)
        ev = {'dom': describe(F, n), 'scene': scene_evidence(F, n, [hs['x'], hs['y'], hs['w'], hs['h']]),
              'cadre': 'pleine hauteur (document entier)' if F.full else 'hauteur de l’écran, défilement %g px' % F.sy, 'arrivée': why}
        mism = mismatch_note(F, ent['toFrame'], to, fmt)
        if mism:
            ev['écart'] = mism
        if req == 'member':
            ev['note'] = 'aucune page en membre n’a de cadre : seuls les panneaux du compte membre montrent l’avatar, la bulle et la cloche'
        ent['evidence'] = ev
        res.append(ent)
    if not res:
        ent = link_entry(e, fmt)
        ent.update(fromFrame=None, toFrame=frame_ref(base_state(to, fmt), fmt) if base_state(to, fmt) else None, hotspot=None,
                   status='sans cadre de départ', evidence={'note': 'aucun cadre de départ dans ce format pour cet élément'})
        res.append(ent)
    return res


# ------------------------------------------------------------------ search opener, closes, tabs
def search_opener(fmt):
    out = []
    g = NODES['g-search']
    for nid, s in start_frames(fmt):
        if not allowed(g, nid):
            continue
        F = frame(s, fmt)
        c = [n for n in candidates(F, g_search) if visible(F, n)]
        ent = {'from': nid, 'to': 'g-search', 'via': 'Chercher dans Horizon', 'fmt': fmt, 'kind': 'ouverture (élément à ouvrir d’abord)',
               'fromFrame': frame_ref(s, fmt), 'toFrame': frame_ref('search-open', fmt)}
        if c:
            hs = hotspot(F, c[0])
            ent.update(hotspot=hs, status='retrouvée', evidence={'dom': describe(F, c[0]), 'scene': scene_evidence(F, c[0], [hs['x'], hs['y'], hs['w'], hs['h']])})
            if underlying(F) != underlying(frame('search-open', fmt)):
                ent['evidence']['écart'] = 'la recherche est relevée ouverte sur %s' % route_of(frame('search-open', fmt))
        else:
            ent.update(hotspot=None, status='sans zone', evidence={'note': 'bouton de recherche absent ou masqué'})
        out.append(ent)
    return out


def close_pred(F, n):
    if n['tag'] != 'button':
        return False
    a, t = A(n), T(F, n)
    cls = n.get('cls') or ''
    return a.startswith('fermer') or t == 'fermer' or 'close' in cls or 'dismiss' in cls


def close_target(nid, s, fmt):
    """Screen under an overlay frame: the page or tab frame of the same address."""
    F = frame(s, fmt)
    if F.area == 'entrance':
        return 'arrival-encrypted'
    if nid == 'comment-menu':
        return 'project-comments-thread'
    if nid in ('settings', 'theme', 'language'):
        pass
    rk = underlying(F)
    best = None
    for pid, n in NODES.items():
        if n['kind'] not in ('page', 'tab') or n['group'] == 'entry':
            continue
        for s2, role, _ in screen_frames(pid, fmt):
            F2 = frame(s2, fmt)
            if underlying(F2) == rk and role == B:
                return s2
            if underlying(F2) == rk and best is None:
                best = s2
    return best


def overlay_closes(nid, fmt):
    out = []
    for s, role, note in screen_frames(nid, fmt):
        F = frame(s, fmt)
        c = [n for n in candidates(F, close_pred) if visible(F, n)]
        # keep the close buttons of the overlay itself (not of the page under it)
        c = [n for n in c if not (C(n, 'cp-project-filter-close') and nid not in ('filter-projects', 'filter-people'))]
        ent = {'frame': frame_ref(s, fmt)}
        if not c and nid == 'comment-menu':
            c = [n for n in candidates(F, by_cls('cp-comment-menu-toggle', 'button')) if visible(F, n) and n.get('aria-expanded') != 'false']
            if c:
                ent['note'] = 'pas de bouton Fermer : le bouton à trois points rebascule le menu (ou un clic à côté)'
        if c:
            n = c[-1] if nid not in ('campus-sheet',) else c[0]
            hs = hotspot(F, n)
            ent['close'] = {'hotspot': hs, 'label': n.get('aria-label') or F.deep_text(n, 40), 'dom': describe(F, n),
                            'scene': scene_evidence(F, n, [hs['x'], hs['y'], hs['w'], hs['h']])}
        else:
            ent['close'] = None
        tgt = close_target(nid, s, fmt)
        if not tgt and nid == 'campus-sheet':
            tgt = base_state('explore-campus', fmt)
            ent['noteCloseTo'] = 'aucun cadre « Explorer · Campus » pour ce campus : le cadre de 42 Paris le remplace'
        ent['closeTo'] = frame_ref(tgt, fmt) if tgt and (tgt, fmt) in FRAMES else None
        extra = []
        for lab, pred in (('Annuler', by_text('Annuler')), ('Retour', both(by_cls('account-option'), by_aria('Retour')))):
            for m in candidates(F, pred):
                if visible(F, m) and (not c or m is not c[-1]):
                    h2 = hotspot(F, m)
                    item = {'label': lab, 'hotspot': h2}
                    if lab == 'Retour':
                        item['to'] = frame_ref(base_state('account-visitor', fmt), fmt)
                        item['note'] = 'Retour ramène à l’accueil du panneau du compte'
                    else:
                        item['to'] = ent['closeTo']
                    extra.append(item)
                    break
        if extra:
            ent['other'] = extra
        if NODES[nid]['group'] == 'account' and s in MEMBER_FRAMES:
            ent['note'] = 'fermeture : la liste des projets en membre n’a pas de cadre ; le cadre visiteur la remplace'
        out.append(ent)
    return out


TAB_PARENTS = {'project': ['project-overview', 'project-implementation', 'project-media', 'project-test', 'project-comments'],
               'profile': ['profile-overview', 'profile-projects', 'profile-journey', 'profile-contribution'],
               'article': ['article-article', 'article-media', 'article-authors', 'article-comments']}
LOCAL_MENU = {'project': 'project-local-menu', 'profile': 'profile-local-menu', 'article': None}


def tab_link_pred(tab):
    n = NODES[tab]
    key = n.get('tabKey')

    def p(F, m):
        if m['tag'] != 'a':
            return False
        hk = href_key(m)
        if not hk:
            return False
        pf = route_key(route_of(F))[0] or ''
        if hk[0] != pf:
            return False
        return (hk[1] or 'default') == ('default' if n.get('isDefault') else key)
    return p


def tab_target(tab, fmt, F):
    """Tab frame of the same fiche as F when it exists, else the base frame of the tab."""
    pf = underlying(F)[0]
    for s, role, _ in screen_frames(tab, fmt):
        if underlying(frame(s, fmt))[0] == pf:
            return s, None
    s = base_state(tab, fmt)
    return s, ('l’onglet relevé est celui d’une autre fiche (%s)' % route_of(frame(s, fmt))) if s else None


def implicit_tabs(fmt):
    links, bars = [], []
    for parent, tabs in TAB_PARENTS.items():
        # frames of the fiche: parent frames + tab frames (base and variants)
        fiche = []
        for nid in [parent] + tabs:
            for s, role, _ in screen_frames(nid, fmt):
                if s not in [x[1] for x in fiche]:
                    fiche.append((nid, s))
        for nid, s in fiche:
            F = frame(s, fmt)
            row = []
            for tab in tabs:
                c = [m for m in candidates(F, tab_link_pred(tab)) if visible(F, m)]
                if not c:
                    continue
                s_to, mism = tab_target(tab, fmt, F)
                item = {'tab': tab, 'label': F.deep_text(c[0], 40), 'hotspot': hotspot(F, c[0]), 'toFrame': frame_ref(s_to, fmt) if s_to else None}
                if mism:
                    item['écart'] = mism
                if s_to == s:
                    item['current'] = True
                row.append(item)
            summ = [m for m in F.nodes if m['tag'] == 'summary' and 'section-trigger' in (m.get('cls') or '') and visible(F, m)]
            entry = {}
            if row:
                entry['tabs'] = row
            if summ:
                lm = LOCAL_MENU.get(parent)
                entry['picker'] = {'label': F.deep_text(summ[0], 60), 'hotspot': hotspot(F, summ[0]),
                                   'toFrame': frame_ref(lm, fmt) if lm and (lm, fmt) in FRAMES and lm != s else None}
                if lm and (lm, fmt) in FRAMES and lm != s and underlying(frame(lm, fmt))[0] != underlying(F)[0]:
                    entry['picker']['écart'] = 'le sélecteur ouvert est relevé sur %s' % route_of(frame(lm, fmt))
                if not lm or (lm, fmt) not in FRAMES:
                    entry['picker']['note'] = 'aucun cadre ne montre ce sélecteur ouvert'
            if entry:
                bars.append(dict(entry, screen=nid, frame=frame_ref(s, fmt)))
        # plan-style implicit links parent -> tab
        for tab in tabs:
            n = NODES[tab]
            ent = {'from': parent, 'to': tab, 'via': ('onglet ouvert par défaut' if n.get('isDefault') else 'Onglet « %s »' % n['name']['fr']),
                   'fmt': fmt, 'implicit': True}
            if n.get('isDefault'):
                b = base_state(parent, fmt)
                ent.update(kind='auto', fromFrame=frame_ref(b, fmt), toFrame=frame_ref(b, fmt), hotspot=None, status='même cadre',
                           evidence={'note': 'l’onglet par défaut est affiché par le cadre de la fiche'})
                links.append(ent)
                continue
            best = None
            order = [s for s, _, _ in screen_frames(parent, fmt)]
            # prefer the frame of the same fiche as the relevé of the tab
            tb = base_state(tab, fmt)
            tkey = underlying(frame(tb, fmt))[0] if tb else None
            order.sort(key=lambda s: 0 if underlying(frame(s, fmt))[0] == tkey else 1)
            for s in order:
                F = frame(s, fmt)
                c = [m for m in candidates(F, tab_link_pred(tab)) if visible(F, m)]
                if c:
                    best = (s, F, c[0])
                    break
            if best:
                s, F, m = best
                s_to, mism = tab_target(tab, fmt, F)
                hs = hotspot(F, m)
                ent.update(kind='clic', fromFrame=frame_ref(s, fmt), toFrame=frame_ref(s_to, fmt) if s_to else None, hotspot=hs, status='retrouvée',
                           evidence={'dom': describe(F, m), 'scene': scene_evidence(F, m, [hs['x'], hs['y'], hs['w'], hs['h']])})
                if mism:
                    ent['evidence']['écart'] = mism
                roles = {s_: (r_, n_) for s_, r_, n_ in screen_frames(parent, fmt)}
                if s in roles and roles[s][0] != B:
                    ent['evidence']['départ'] = '%s (%s) : choisie pour que l’onglet d’arrivée montre la même fiche, ou seul cadre où l’onglet est visible' % roles[s]
                if s.endswith('local-menu'):
                    ent['evidence']['note'] = 'sur mobile, les onglets sont dans le sélecteur « Dans ce … » : ouvrir d’abord le sélecteur (voir tabBars)'
                if hs.get('clipped'):
                    ent['evidence']['coupé'] = 'zone en partie masquée par le défilement du sélecteur'
            else:
                ent.update(kind='clic', fromFrame=frame_ref(base_state(parent, fmt), fmt), toFrame=frame_ref(base_state(tab, fmt), fmt) if base_state(tab, fmt) else None,
                           hotspot=None, status='sans zone',
                           evidence={'note': 'lien de l’onglet absent ou masqué dans les cadres de la fiche' + (' (sélecteur fermé, aucun cadre du sélecteur ouvert)' if fmt == 'mobile' else '')})
            links.append(ent)
    return links, bars


# ------------------------------------------------------------------ globals table
def globals_table(fmt):
    out = []
    starts = {s for _, s in start_frames(fmt)}
    for (state, f_), f in sorted(FRAMES.items()):
        if f_ != fmt or f['area'] == 'entrance':
            continue
        F = frame(state, fmt)
        row = {}
        for gid, lab, pred in GLOBAL_PRED:
            c = [n for n in candidates(F, pred) if visible(F, n)]
            if gid == 'g-search' and state == 'search-open':
                c = []   # the toggle is the open search panel there
            if not c:
                continue
            n = c[0]
            item = {'hotspot': hotspot(F, n)}
            if gid == 'g-dock':
                item['section'] = lab
                lab = {'explore': 'Explorer', 'projects': 'Projets', 'people': 'Profils', 'journal': 'Chroniques', 'awards': '42 Awards'}[lab]
            if n.get('aria-label'):
                item['aria'] = n['aria-label']
            if opacity_dim(F, n):
                item['grisé'] = True
            row.setdefault(gid, {})[lab] = item
        if state == 'entry-error':
            pass
        out.append({'frame': frame_ref(state, fmt), 'startFrame': state in starts, 'elements': row})
    # the account icon of the entrance error screen
    if ('entry-error', fmt) in FRAMES:
        F = frame('entry-error', fmt)
        c = [n for n in candidates(F, g_account) if visible(F, n)]
        if c:
            out.append({'frame': frame_ref('entry-error', fmt), 'startFrame': False,
                        'elements': {'g-account': {'Compte': {'hotspot': hotspot(F, c[0]), 'aria': c[0].get('aria-label')}}},
                        'note': 'seul état de l’entrée où l’icône du compte est visible'})
    return out


# ------------------------------------------------------------------ main
def main():
    data = {'meta': {
        'date': '2026-10-19',
        'sources': {'plan': str(plib.SITEMAP), 'layouts': str(plib.REF / 'layouts'), 'releves': str(plib.REF / 'dom'), 'scenes': str(plib.REF / 'scenes'),
                    'registre': str(plib.REF / 'figma-ledger.json')},
        'planSurvey': SM['meta']['surveyed']['fr'] + ' · ' + SM['meta']['version']['fr'],
        'perimetre': 'cadres FR clairs des plans (layouts/*.json) ; aucun appel Figma ; identifiants Figma tirés du registre, non relus dans le fichier',
        'figmaFile': json.loads((plib.REF / 'figma-ledger.json').read_text())['file']['key'],
        'pagesParcours': {'desktop': '09 · Parcours · ordinateur', 'mobile': '10 · Parcours · mobile'},
        'coordonnees': 'pixels du cadre (origine en haut à gauche). Cadre à la hauteur de l’écran (h ≤ 964 ordinateur, ≤ 848 mobile) : page vue depuis scroll[1], '
                       'y = y_document − scroll[1]. Cadre pleine hauteur : document entier ; couches fixes dont le haut est sous la mi-hauteur de l’écran '
                       'déplacées en bas du cadre (y + hauteur du cadre − hauteur de l’écran), comme dom2fig.fixed_y. Zone = partie visible '
                       '(découpée par les ancêtres overflow et le cadre).',
        'statuts': {'retrouvée': 'élément trouvé et visible ; libellé conforme quand le plan en donne un',
                    'libellé différent': 'même commande trouvée, mais le cadre affiche un autre libellé (bouton Retour selon l’origine)',
                    'grisé': 'commande visible mais désactivée dans ce cadre', 'sans zone': 'aucun élément visible ne correspond dans les cadres du départ',
                    'automatique': 'enchaînement sans clic (« après un délai » dans Figma)', 'sans cadre de départ': 'l’écran de départ n’a pas de cadre dans ce format',
                    'même cadre': 'onglet par défaut : affiché par le cadre de la fiche'},
    }}
    screens = {}
    for nid, n in NODES.items():
        ent = {'kind': n['kind'], 'name': n['name']['fr'], 'group': n['group']}
        for fmt in FMTS:
            lst = []
            for s, role, note in screen_frames(nid, fmt):
                r = frame_ref(s, fmt, role, note)
                if NODES[nid]['kind'] == 'overlay':
                    pass
                lst.append(r)
            ent[fmt] = lst
        if not ent['desktop'] and not ent['mobile']:
            ent['noFrame'] = NO_FRAME_REASON.get(nid, 'aucun cadre')
        elif nid in NO_FRAME_REASON:
            ent['noteFrames'] = NO_FRAME_REASON[nid]
        ent['base'] = {fmt: (frame_ref(base_state(nid, fmt), fmt)['name'] if base_state(nid, fmt) else None) for fmt in FMTS}
        if nid in SEQUENCES:
            ent['sequence'] = SEQUENCES[nid]
        if nid in ('project-overview', 'profile-overview', 'article-article'):
            ent['sharedWith'] = NODES[nid]['parent']
        if n['kind'] == 'overlay':
            ent['close'] = {fmt: overlay_closes(nid, fmt) for fmt in FMTS}
        if nid == 'g-search':
            ent['close'] = {fmt: overlay_closes(nid, fmt) for fmt in FMTS}
        screens[nid] = ent
    data['screens'] = screens
    links = []
    for e in SM['edges']:
        for fmt in FMTS:
            links.extend(resolve_edge(e, fmt))
    data['links'] = links
    opener = []
    for fmt in FMTS:
        opener.extend(search_opener(fmt))
    imp, bars = [], []
    for fmt in FMTS:
        l, b = implicit_tabs(fmt)
        imp.extend(l)
        bars.extend(b)
    seq = []
    for nid, states in SEQUENCES.items():
        for fmt in FMTS:
            st = [s for s in states if (s, fmt) in FRAMES]
            for a, b in zip(st, st[1:]):
                if nid == 'opening' and a == 'visitor-transition':
                    pass
                seq.append({'screen': nid, 'fmt': fmt, 'fromFrame': frame_ref(a, fmt), 'toFrame': frame_ref(b, fmt), 'trigger': 'automatique (après un délai)'})
            if nid == 'arrival' and len(st) >= 2 and st[-1] == 'arrival-labels-ar':
                seq.append({'screen': nid, 'fmt': fmt, 'fromFrame': frame_ref('arrival-labels-ar', fmt), 'toFrame': frame_ref('arrival-encrypted', fmt),
                            'trigger': 'automatique (après un délai)', 'note': 'boucle des libellés des boutons : français, anglais, arabe, puis de nouveau français'})
    btt = []
    for fmt in FMTS:
        for (state, f_), f in sorted(FRAMES.items()):
            if f_ != fmt or f['area'] == 'entrance':
                continue
            F = frame(state, fmt)
            c = [n for n in candidates(F, g_back_top) if visible(F, n)]
            if not c:
                continue
            tgt = 'project-comments-thread' if state == 'comment-menu' else close_target('g-back-top', state, fmt)
            hs = hotspot(F, c[0])
            btt.append({'from': 'g-back-top', 'to': None, 'via': 'Remonter en haut', 'fmt': fmt, 'fromFrame': frame_ref(state, fmt),
                        'toFrame': frame_ref(tgt, fmt) if tgt else None, 'hotspot': hs, 'status': 'retrouvée',
                        'evidence': {'dom': describe(F, c[0]), 'scene': scene_evidence(F, c[0], [hs['x'], hs['y'], hs['w'], hs['h']]),
                                     'note': 'aucun lien du plan (même page, remontée en haut) : le cadre pleine hauteur de la même page montre le haut'}})
    data['implicitLinks'] = {'searchOpener': opener, 'tabs': imp, 'sequences': seq, 'backToTop': btt,
                             'note': 'liens que le plan ne liste pas comme liens mais qu’il implique : ouverture de la recherche (élément « à ouvrir »), '
                                     'onglets (lien implicite fiche → onglet, comme la page du plan), enchaînements des étapes de l’entrée'}
    data['tabBars'] = bars
    data['globals'] = {fmt: globals_table(fmt) for fmt in FMTS}
    data['unmatched'] = unmatched(screens)
    data['conflicts'] = conflicts(links + imp)
    (OUT / 'parcours-correspondance.json').write_text(json.dumps(data, ensure_ascii=False, indent=1))
    stats(data)


def unmatched(screens):
    out = {'screensWithoutFrame': {}, 'variantFrames': [], 'framesNotInPlan': [], 'releveSansCadre': []}
    for fmt in FMTS:
        out['screensWithoutFrame'][fmt] = [{'id': nid, 'kind': NODES[nid]['kind'], 'name': NODES[nid]['name']['fr'],
                                            'reason': NO_FRAME_REASON.get(nid) or ('n’existe qu’en mobile, à 840 px et moins' if nid == 'g-back-top' else
                                                                                    'présent dans les cadres des pages ; cadres dédiés seulement en mobile étroit' if nid == 'g-dock' else 'aucun cadre')}
                                           for nid in NODES if not screens[nid][fmt]]
    assigned = collections.defaultdict(list)
    for nid, lst in SCREEN_STATES.items():
        for s, role, note in lst:
            assigned[s].append((nid, role, note))
    for (s, fmt), f in sorted(FRAMES.items(), key=lambda x: (x[1]['page'], x[0])):
        roles = assigned.get(s)
        if not roles:
            out['framesNotInPlan'].append({'name': f['name'], 'page': f['page'], 'state': s, 'fmt': fmt})
            continue
        if not any(r == B for _, r, _ in roles):
            nid, role, note = roles[0]
            out['variantFrames'].append({'name': f['name'], 'page': f['page'], 'state': s, 'fmt': fmt, 'screen': nid, 'nature': role, 'note': note})
    # surveys of the DOM without a Figma frame
    import gzip
    for p in sorted((plib.REF / 'dom').glob('*/*--fr-light.json.gz')):
        area = p.parent.name
        st, fmt = p.name.split('--')[0], p.name.split('--')[1]
        if area == '_pipeline':
            continue
        if (st, fmt) in FRAMES:
            continue
        d = json.loads(gzip.decompress(p.read_bytes()))
        m = d.get('meta') or {}
        out['releveSansCadre'].append({'file': str(p.relative_to(plib.REF)), 'state': st, 'fmt': fmt, 'siteMapNodes': m.get('siteMapNodes'),
                                       'route': m.get('routeOpened'), 'actions': m.get('actions')})
    return out


def conflicts(links):
    by = collections.defaultdict(list)
    for l in links:
        if l.get('hotspot') and l.get('fromFrame'):
            by[(l['fromFrame']['page'], l['fromFrame']['name'], l['fmt'])].append(l)
    out = []
    for name, ls in by.items():
        for i in range(len(ls)):
            for j in range(i + 1, len(ls)):
                a, b = ls[i]['hotspot'], ls[j]['hotspot']
                ix = max(0, min(a['x'] + a['w'], b['x'] + b['w']) - max(a['x'], b['x']))
                iy = max(0, min(a['y'] + a['h'], b['y'] + b['h']) - max(a['y'], b['y']))
                inter = ix * iy
                if inter <= 0:
                    continue
                small = min(a['w'] * a['h'], b['w'] * b['h'])
                ta, tb = (ls[i].get('toFrame') or {}).get('name'), (ls[j].get('toFrame') or {}).get('name')
                if inter / small > 0.5 and ta != tb:
                    out.append({'frame': {'page': name[0], 'name': name[1]}, 'fmt': name[2], 'a': {'from': ls[i]['from'], 'to': ls[i]['to'], 'via': ls[i]['via'], 'toFrame': ta},
                                'b': {'from': ls[j]['from'], 'to': ls[j]['to'], 'via': ls[j]['via'], 'toFrame': tb}, 'recouvrement': round(inter / small, 2)})
    return out


def stats(data):
    c = collections.Counter()
    for l in data['links']:
        c[(l['fmt'], l['status'])] += 1
    print('links by status', dict(c))
    pe = collections.defaultdict(lambda: collections.Counter())
    for l in data['links']:
        pe[(l['from'], l['to'], l['via'], l['fmt'])][l['status']] += 1
    agg = collections.Counter()
    for (fr, to, via, fmt), cc in pe.items():
        if 'retrouvée' in cc or 'libellé différent' in cc:
            k = 'zone' if 'retrouvée' in cc else 'zone, libellé différent'
        elif 'automatique' in cc:
            k = 'automatique'
        elif 'grisé' in cc:
            k = 'grisé'
        else:
            k = list(cc)[0]
        agg[(fmt, k)] += 1
    print('edges x fmt', dict(agg))
    for fmt in FMTS:
        n = sum(1 for s in data['screens'].values() if s[fmt])
        print(fmt, 'screens with frames', n, '/', len(data['screens']))
    print('implicit', collections.Counter((l['fmt'], l['status']) for l in data['implicitLinks']['tabs']))
    print('opener', collections.Counter((l['fmt'], l['status']) for l in data['implicitLinks']['searchOpener']))
    print('conflicts', len(data['conflicts']))
    print('variant frames', len(data['unmatched']['variantFrames']), 'not in plan', len(data['unmatched']['framesNotInPlan']), 'dom without frame', len(data['unmatched']['releveSansCadre']))


if __name__ == '__main__':
    main()
