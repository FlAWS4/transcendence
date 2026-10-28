"""Profiles zone (Profils) of the Figma rebuild of 15 October 2026 — read-only captures of the active prototype.

Screens of the site map covered (work/visualizations/site-map/site-map-data.js): people, filter-people, profile,
profile-overview, profile-projects, profile-journey, profile-contribution, message-dialog, social-links (empty block
only: no fictional profile has links), plus report (from a profile), viewer (portrait) and filter-projects (opened
from a profile's Projects tab).

Usage (one lot per run, each run stays under 9 minutes; never run two capture scripts at the same time):
    cd /home/le-rif/Bureau/Transcendence
    timeout 580 python3 work/figma/refonte-20261015/scripts/capture_profiles.py <lot> [--only name1,name2]
    python3 work/figma/refonte-20261015/scripts/capture_profiles.py crops     # card crops, no Chrome
    python3 work/figma/refonte-20261015/scripts/capture_profiles.py sheets    # contact sheets, no Chrome
Lots: annuaire, controles, filtre, fiche, onglets, fenetres, statuts, extra (see LOTS below).

Every state is opened on a fresh document (storage cleared, about:blank in between), then theme and language are
checked on <html> and corrected through the account menu (Session.settings) if needed. A state whose expected
condition is not met is not recorded as good: the run stops with the reason, so it can be fixed and run again.
"""
import gzip, json, pathlib, sys, time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from capture_lib import *  # noqa: F401,F403  (start, open_app, snap, write_index, contact_sheet, DESKTOP, MOBILE, REF, DOM)
from capture_lib import REF, DOM, BASE

AREA = 'profiles'
LEILA, NOE, INES = 'profile-leila-mansour', 'profile-noe-laurent', 'profile-ines-morel'
PROFILE = 'people/' + LEILA


# -- helpers --------------------------------------------------------------------------------------------------
def current(s):
    return s.js('({lang:document.documentElement.lang,theme:document.documentElement.dataset.theme||null,'
                'dir:document.documentElement.dir||"ltr",route:location.hash,'
                'controller:[...document.querySelectorAll("script[src]")].map(e=>e.getAttribute("src")).filter(u=>/content-preview|design-review/.test(u)).join(" ")})')


def fresh(s):
    """Clear the prototype's storage (favorites, view, theme preference) and leave the document."""
    try:
        s.js('(()=>{try{localStorage.clear();sessionStorage.clear()}catch(e){};return true})()', 5)
    except Exception:
        pass
    s.c.call('Page.navigate', {'url': 'about:blank'})
    time.sleep(.4)


def go(s, route, vp, theme='light', lang='fr', view=None):
    fresh(s)
    open_app(s, route, vp, theme=theme, lang=lang)
    cur = current(s)
    if cur['lang'] != lang or cur['theme'] != theme:
        s.settings(lang, theme)
        cur = current(s)
    if cur['lang'] != lang or cur['theme'] != theme:
        raise RuntimeError(f'theme/lang mismatch: {cur} instead of {theme}/{lang}')
    if view:
        set_view(s, view)
    s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.5)


def set_view(s, view):
    if s.js('document.querySelector("#content-index")?.dataset.view') == view:
        return
    s.click('#content-layout-button')
    if not s.wait('!document.querySelector("#content-layout-menu").hidden', 5):
        raise RuntimeError('layout menu did not open')
    s.click(f'#content-layout-menu [data-value={view}]')
    if not s.wait(f'document.querySelector("#content-index")?.dataset.view==="{view}"', 6):
        raise RuntimeError('view not applied: ' + view)
    time.sleep(.6)


def need(s, expr, what, seconds=8):
    if not s.wait(expr, seconds):
        raise RuntimeError('expected state not reached: ' + what)


RECORDS, VERSIONS = [], set()


def take(s, name, screen, desc, full=False, expect=None, keep_focus=False, extra=None):
    """snap() of capture_lib with checks before and after. keep_focus keeps the focused element (menus that close
    when focus leaves them: the sort panel)."""
    if expect:
        need(s, expect, name + ' / ' + expect)
    cur = current(s)
    meta = {'screen': screen, 'state': desc, 'route': cur['route'], 'lang': cur['lang'], 'theme': cur['theme'],
            'dir': cur['dir'], 'viewport': list(s.vp), 'controller': cur['controller']}
    if extra:
        meta.update(extra)
    original = s.blur
    if keep_focus:
        s.blur = lambda: None
    try:
        rec = snap(s, AREA, name, full=full, meta=meta)
    finally:
        s.blur = original
    if expect and not s.js(expect):
        raise RuntimeError(f'{name}: state changed during the capture ({expect})')
    after = current(s)
    if after['lang'] != cur['lang'] or after['theme'] != cur['theme']:
        raise RuntimeError(f'{name}: theme/lang changed during the capture')
    rec.update({'screen': screen, 'state': desc, 'route': cur['route'], 'lang': cur['lang'], 'theme': cur['theme'],
                'format': 'desktop' if s.vp == DESKTOP else 'mobile', 'size': f'{s.vp[0]}x{s.vp[1]}' + (' DPR2' if s.vp[2] else ''),
                'capturedAt': time.strftime('%Y-%m-%d %H:%M:%S')})
    if extra:
        rec.update(extra)
    VERSIONS.add(rec.get('version'))
    if len(VERSIONS) > 1:
        print('WARNING: loaded version changed during the run:', VERSIONS, flush=True)
    if rec.get('errors'):
        print('  page errors:', rec['errors'][:3], flush=True)
    RECORDS.append(rec)
    print(f"ok {name}  doc={rec.get('doc')} nodes={rec.get('nodes')} overflow={rec.get('overflow')}", flush=True)
    return rec


def fmt(vp):
    return 'desktop' if vp == DESKTOP else 'mobile'


# -- states ---------------------------------------------------------------------------------------------------
def directory(vp, theme, lang, view='grid'):
    def run(s):
        go(s, 'people', vp, theme, lang, view=view)
        need(s, 'document.querySelectorAll(".cp-profile-card").length===24', '24 profile cards')
        screen = 'people' if view == 'grid' else 'people-list'
        take(s, f'{screen}--{fmt(vp)}--{lang}-{theme}', 'people',
             f'Annuaire des profils, vue {"Grille" if view == "grid" else "Liste"}, page 1 sur 4 (24 profils), Monde',
             full=True, expect=f'document.querySelector("#content-index").dataset.view==="{view}"')
    return run


def sort_open(vp):
    def run(s):
        go(s, 'people', vp, 'light', 'fr', view='grid')
        s.click('#content-sort-button')
        take(s, f'people-sort-open--{fmt(vp)}--fr-light', 'people', 'Panneau Trier ouvert (choix courant : du plus récent au plus ancien)',
             expect='!document.querySelector("#content-sort-menu").hidden', keep_focus=True)
    return run


def layout_open(vp):
    def run(s):
        go(s, 'people', vp, 'light', 'fr', view='grid')
        s.click('#content-layout-button')
        take(s, f'people-layout-open--{fmt(vp)}--fr-light', 'people', 'Menu Affichage ouvert (Grille sélectionnée)',
             expect='!document.querySelector("#content-layout-menu").hidden', keep_focus=True)
    return run


def favorite_active(vp):
    def run(s):
        go(s, 'people', vp, 'light', 'fr', view='grid')
        s.click(f'.cp-profile-card[data-profile-id="{LEILA}"] > .cp-favorite')
        need(s, f'document.querySelector(\'.cp-profile-card[data-profile-id="{LEILA}"] > .cp-favorite\')?.getAttribute("aria-pressed")==="true"', 'heart pressed')
        s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.4)
        take(s, f'people-favorite-active--{fmt(vp)}--fr-light', 'people', 'Cœur Favoris actif sur la carte de Leïla Mansour (aria-pressed=true)',
             expect=f'document.querySelector(\'.cp-profile-card[data-profile-id="{LEILA}"] > .cp-favorite\').getAttribute("aria-pressed")==="true"')
    return run


def favorites_only_empty(s):
    go(s, 'people', DESKTOP, 'light', 'fr', view='grid')
    s.click('#content-sort-button')
    need(s, '!document.querySelector("#content-sort-menu").hidden', 'sort menu')
    s.click('#content-sort-menu [data-value=favoritesOnly]')
    need(s, 'Boolean(document.querySelector("#content-list .content-empty"))', 'favorites empty state')
    take(s, 'people-favorites-empty--desktop--fr-light', 'people', 'Mes favoris uniquement, sans favori : état vide « Aucun favori dans ce périmètre »',
         expect='Boolean(document.querySelector("#content-list .content-empty"))')


def last_page(vp):
    def run(s):
        go(s, 'people?page=4', vp, 'light', 'fr', view='grid')
        need(s, 'document.querySelectorAll(".cp-profile-card").length===6', '6 cards on page 4')
        take(s, f'people-last-page--{fmt(vp)}--fr-light', 'people', 'Dernière page de la pagination (page 4 sur 4, 6 profils)', full=True,
             expect='document.querySelector(".cp-pagination-link[aria-current=page]")?.textContent==="4"')
    return run


def open_filter(s):
    s.click('#content-category-button')
    need(s, 'Boolean(document.querySelector("#content-category-dialog[open]"))', 'filter dialog open')
    time.sleep(.5)


def filter_dialog(vp, theme, lang='fr', expanded=False):
    def run(s):
        go(s, 'people', vp, theme, lang, view='grid')
        open_filter(s)
        name = 'filter-people' + ('-expanded' if expanded else '')
        desc = 'Fenêtre Filtrer les profils, catégories repliées (aucun critère)'
        if expanded:
            for facet in ('status', 'arrival'):
                s.click(f'#content-category-dialog [data-facet={facet}] .cp-project-filter-toggle')
                need(s, f'document.querySelector("#content-category-dialog [data-facet={facet}] .cp-project-filter-toggle").getAttribute("aria-expanded")==="true"', facet + ' expanded')
            s.click('#content-category-dialog [data-facet=status] .cp-project-filter-all')
            s.click('#content-category-dialog input[value="arrival:2024"]')
            need(s, 'document.querySelector("#content-category-dialog [data-facet=arrival] .cp-project-filter-all").getAttribute("aria-pressed")==="mixed"', 'arrival mixed')
            s.js('(()=>{document.querySelector("#content-category-dialog .cp-project-filter-body").scrollTop=0;return true})()')
            desc = ('Fenêtre Filtrer dépliée : Statut tout sélectionné (Tout désélectionner, état complet), '
                    'Rentrée dépliée avec 2024 seul (état mixte) ; 4 critères en brouillon, non appliqués')
        take(s, f'{name}--{fmt(vp)}--{lang}-{theme}', 'filter-people', desc,
             expect='Boolean(document.querySelector("#content-category-dialog[open]"))')
    return run


def filtered_list(s):
    go(s, 'people', DESKTOP, 'light', 'fr', view='grid')
    open_filter(s)
    s.click('#content-category-dialog [data-facet=arrival] .cp-project-filter-toggle')
    s.click('#content-category-dialog input[value="arrival:2024"]')
    s.click('#content-category-dialog .cp-project-filter-apply')
    need(s, '!document.querySelector("#content-category-dialog")', 'dialog closed after Apply')
    need(s, 'document.querySelector("#content-category-button").dataset.filtered==="true"', 'trigger filtered')
    take(s, 'people-filtered--desktop--fr-light', 'people', 'Annuaire après Appliquer (Rentrée 2024) : bouton Filtrer marqué, liste réduite', full=True,
         expect='document.querySelector("#content-category-button").dataset.filtered==="true"')


def filter_empty(s):
    go(s, 'people', DESKTOP, 'light', 'fr', view='grid')
    open_filter(s)
    for facet in ('status', 'arrival'):
        s.click(f'#content-category-dialog [data-facet={facet}] .cp-project-filter-toggle')
    s.click('#content-category-dialog input[value="alumni"]')
    s.click('#content-category-dialog input[value="arrival:2024"]')
    s.click('#content-category-dialog .cp-project-filter-apply')
    need(s, 'Boolean(document.querySelector("#content-list .content-empty"))', 'filter empty state')
    take(s, 'people-filter-empty--desktop--fr-light', 'people', 'Aucun résultat (Alumni + Rentrée 2024) : état vide avec « Tous les profils »',
         expect='Boolean(document.querySelector("#content-list .content-empty"))')


def profile_page(vp, theme, lang, who=LEILA, tab=None, name=None, desc=None):
    def run(s):
        route = 'people/' + who + (f'?tab={tab}' if tab else '')
        go(s, route, vp, theme, lang)
        need(s, 'Boolean(document.querySelector("#profile-detail:not([hidden]) .cp-profile-workspace"))', 'profile page')
        need(s, f'document.querySelector("#profile-detail").dataset.profileSection==="{tab or "overview"}"', 'tab ' + (tab or 'overview'))
        screen = 'profile-' + (tab or 'overview')
        take(s, (name or screen) + f'--{fmt(vp)}--{lang}-{theme}', screen, desc or f'Fiche de {who}, onglet {tab or "overview"}', full=True,
             extra={'profileId': who, 'detailDensity': s.js('document.querySelector(".cp-profile-sidebar")?.dataset.detailDensity||null')})
    return run


def profile_projects_filter(vp):
    def run(s):
        go(s, f'people/{LEILA}?tab=projects', vp, 'light', 'fr')
        need(s, 'Boolean(document.querySelector("#profile-project-category-button"))', 'local filter button')
        s.click('#profile-project-category-button')
        need(s, 'Boolean(document.querySelector("#profile-project-category-dialog[open]"))', 'local filter dialog')
        time.sleep(.5)
        take(s, f'profile-projects-filter--{fmt(vp)}--fr-light', 'filter-projects',
             'Onglet Projets de Leïla : Filtrer local ouvert (fenêtre Filtrer les projets, catégories repliées)',
             expect='Boolean(document.querySelector("#profile-project-category-dialog[open]"))', extra={'profileId': LEILA})
    return run


def profile_projects_empty(s):
    go(s, f'people/{LEILA}?tab=projects&project=cub3d', DESKTOP, 'light', 'fr')
    need(s, 'Boolean(document.querySelector("#profile-detail .cp-profile-empty"))', 'empty filtered projects')
    take(s, 'profile-projects-empty-filter--desktop--fr-light', 'profile-projects',
         'Onglet Projets filtré sans résultat (?project=cub3d) : message et bouton « Tous les projets »', full=True,
         expect='Boolean(document.querySelector("#profile-detail .cp-profile-empty"))', extra={'profileId': LEILA})


def section_picker(theme):
    def run(s):
        go(s, PROFILE, MOBILE, theme, 'fr')
        s.click('#profile-section-picker')
        need(s, 'document.querySelector(".cp-profile-section-switch").open', 'picker open')
        time.sleep(.5)
        take(s, f'profile-section-picker--mobile--fr-{theme}', 'profile', 'Mobile : sélecteur « Dans ce profil » ouvert (Vue d’ensemble courante)',
             expect='document.querySelector(".cp-profile-section-switch").open', extra={'profileId': LEILA})
    return run


def message_dialog(vp, theme, sent=False):
    def run(s):
        go(s, PROFILE, vp, theme, 'fr')
        s.click('#profile-detail .cp-profile-message')
        need(s, 'Boolean(document.querySelector("dialog.cp-profile-message-dialog[open]"))', 'message dialog')
        desc = 'Fenêtre Envoyer un message à Leïla Mansour, champ vide'
        if sent:
            s.js('(()=>{const t=document.querySelector("dialog.cp-profile-message-dialog textarea");t.value="Bonjour Leïla, ton shell m’a beaucoup aidé pour mes redirections. Merci !";t.dispatchEvent(new Event("input",{bubbles:true}));return true})()')
            s.click('dialog.cp-profile-message-dialog .cp-profile-message-send')
            need(s, '!document.querySelector("dialog.cp-profile-message-dialog .cp-profile-message-preview").hidden', 'preview shown')
            desc = 'Fenêtre Envoyer un message après Envoyer : confirmation « Message enregistré… » et aperçu « Votre dernier message » (texte de démonstration saisi par le script)'
        time.sleep(.4)
        take(s, ('message-dialog-sent' if sent else 'message-dialog') + f'--{fmt(vp)}--fr-{theme}', 'message-dialog', desc,
             expect='Boolean(document.querySelector("dialog.cp-profile-message-dialog[open]"))', extra={'profileId': LEILA})
    return run


def report_dialog(vp):
    def run(s):
        go(s, PROFILE, vp, 'light', 'fr')
        s.click('#profile-detail .cp-report-trigger')
        need(s, 'Boolean(document.querySelector("dialog.cp-report-dialog[open]"))', 'report dialog')
        time.sleep(.4)
        take(s, f'report-profile--{fmt(vp)}--fr-light', 'report', 'Fenêtre Signaler ce profil (depuis la fiche de Leïla Mansour)',
             expect='Boolean(document.querySelector("dialog.cp-report-dialog[open]"))', extra={'profileId': LEILA})
    return run


def portrait_viewer(s):
    go(s, PROFILE, DESKTOP, 'light', 'fr')
    s.click('#profile-detail .cp-profile-portrait-open')
    need(s, 'Boolean(document.querySelector("dialog.media-viewer[open]"))', 'media viewer')
    time.sleep(.8)
    take(s, 'profile-portrait-viewer--desktop--fr-light', 'viewer', 'Portrait agrandi (visionneuse de médias) depuis la fiche de Leïla Mansour',
         expect='Boolean(document.querySelector("dialog.media-viewer[open]"))', extra={'profileId': LEILA})


S = lambda f: f  # noqa: E731  (readability in the table below)
LOTS = {
    'annuaire': [
        ('people--desktop--fr-light', directory(DESKTOP, 'light', 'fr')),
        ('people--desktop--fr-dark', directory(DESKTOP, 'dark', 'fr')),
        ('people--mobile--fr-light', directory(MOBILE, 'light', 'fr')),
        ('people--mobile--fr-dark', directory(MOBILE, 'dark', 'fr')),
        ('people--desktop--ar-light', directory(DESKTOP, 'light', 'ar')),
        ('people--mobile--ar-light', directory(MOBILE, 'light', 'ar')),
        ('people--desktop--en-light', directory(DESKTOP, 'light', 'en')),
        ('people-list--desktop--fr-light', directory(DESKTOP, 'light', 'fr', 'list')),
        ('people-list--mobile--fr-light', directory(MOBILE, 'light', 'fr', 'list')),
    ],
    'controles': [
        ('people-sort-open--desktop--fr-light', sort_open(DESKTOP)),
        ('people-sort-open--mobile--fr-light', sort_open(MOBILE)),
        ('people-layout-open--desktop--fr-light', layout_open(DESKTOP)),
        ('people-favorite-active--desktop--fr-light', favorite_active(DESKTOP)),
        ('people-favorite-active--mobile--fr-light', favorite_active(MOBILE)),
        ('people-last-page--desktop--fr-light', last_page(DESKTOP)),
        ('people-last-page--mobile--fr-light', last_page(MOBILE)),
        ('people-favorites-empty--desktop--fr-light', favorites_only_empty),
    ],
    'filtre': [
        ('filter-people--desktop--fr-light', filter_dialog(DESKTOP, 'light')),
        ('filter-people-expanded--desktop--fr-light', filter_dialog(DESKTOP, 'light', expanded=True)),
        ('filter-people--desktop--fr-dark', filter_dialog(DESKTOP, 'dark')),
        ('filter-people-expanded--desktop--fr-dark', filter_dialog(DESKTOP, 'dark', expanded=True)),
        ('filter-people--mobile--fr-light', filter_dialog(MOBILE, 'light')),
        ('filter-people-expanded--mobile--fr-light', filter_dialog(MOBILE, 'light', expanded=True)),
        ('filter-people--mobile--fr-dark', filter_dialog(MOBILE, 'dark')),
        ('filter-people-expanded--mobile--fr-dark', filter_dialog(MOBILE, 'dark', expanded=True)),
        ('people-filtered--desktop--fr-light', filtered_list),
        ('people-filter-empty--desktop--fr-light', filter_empty),
    ],
    'fiche': [
        ('profile-overview--desktop--fr-light', profile_page(DESKTOP, 'light', 'fr', desc='Fiche de Leïla Mansour, Vue d’ensemble')),
        ('profile-overview--desktop--fr-dark', profile_page(DESKTOP, 'dark', 'fr', desc='Fiche de Leïla Mansour, Vue d’ensemble')),
        ('profile-overview--mobile--fr-light', profile_page(MOBILE, 'light', 'fr', desc='Fiche de Leïla Mansour, Vue d’ensemble')),
        ('profile-overview--mobile--fr-dark', profile_page(MOBILE, 'dark', 'fr', desc='Fiche de Leïla Mansour, Vue d’ensemble')),
        ('profile-overview--desktop--ar-light', profile_page(DESKTOP, 'light', 'ar', desc='Fiche de Leïla Mansour, Vue d’ensemble')),
        ('profile-overview--mobile--ar-light', profile_page(MOBILE, 'light', 'ar', desc='Fiche de Leïla Mansour, Vue d’ensemble')),
        ('profile-overview--desktop--en-light', profile_page(DESKTOP, 'light', 'en', desc='Fiche de Leïla Mansour, Vue d’ensemble')),
    ],
    'onglets': [
        ('profile-projects--desktop--fr-light', profile_page(DESKTOP, 'light', 'fr', tab='projects', desc='Fiche de Leïla, onglet Projets (2 projets)')),
        ('profile-projects--mobile--fr-light', profile_page(MOBILE, 'light', 'fr', tab='projects', desc='Fiche de Leïla, onglet Projets (2 projets)')),
        ('profile-projects-filter--desktop--fr-light', profile_projects_filter(DESKTOP)),
        ('profile-projects-filter--mobile--fr-light', profile_projects_filter(MOBILE)),
        ('profile-journey--desktop--fr-light', profile_page(DESKTOP, 'light', 'fr', tab='journey', desc='Fiche de Leïla, onglet Parcours (3 étapes + récit)')),
        ('profile-journey--mobile--fr-light', profile_page(MOBILE, 'light', 'fr', tab='journey', desc='Fiche de Leïla, onglet Parcours (3 étapes + récit)')),
        ('profile-contribution--desktop--fr-light', profile_page(DESKTOP, 'light', 'fr', tab='contribution', desc='Fiche de Leïla, onglet Contribution (aucune chronique : état vide)')),
        ('profile-contribution--mobile--fr-light', profile_page(MOBILE, 'light', 'fr', tab='contribution', desc='Fiche de Leïla, onglet Contribution (aucune chronique : état vide)')),
        ('profile-contribution-cards--desktop--fr-light', profile_page(DESKTOP, 'light', 'fr', who=INES, tab='contribution', name='profile-contribution-cards', desc='Fiche d’Inès Morel, onglet Contribution (2 chroniques)')),
        ('profile-contribution-cards--mobile--fr-light', profile_page(MOBILE, 'light', 'fr', who=INES, tab='contribution', name='profile-contribution-cards', desc='Fiche d’Inès Morel, onglet Contribution (2 chroniques)')),
        ('profile-projects-empty-filter--desktop--fr-light', profile_projects_empty),
    ],
    'fenetres': [
        ('profile-section-picker--mobile--fr-light', section_picker('light')),
        ('profile-section-picker--mobile--fr-dark', section_picker('dark')),
        ('message-dialog--desktop--fr-light', message_dialog(DESKTOP, 'light')),
        ('message-dialog--desktop--fr-dark', message_dialog(DESKTOP, 'dark')),
        ('message-dialog--mobile--fr-light', message_dialog(MOBILE, 'light')),
        ('message-dialog--mobile--fr-dark', message_dialog(MOBILE, 'dark')),
        ('message-dialog-sent--desktop--fr-light', message_dialog(DESKTOP, 'light', sent=True)),
        ('report-profile--desktop--fr-light', report_dialog(DESKTOP)),
        ('profile-portrait-viewer--desktop--fr-light', portrait_viewer),
    ],
    'statuts': [
        ('profile-overview-alumni--desktop--fr-light', profile_page(DESKTOP, 'light', 'fr', who=INES, name='profile-overview-alumni', desc='Fiche d’Inès Morel (Alumni, 42 Lyon), Vue d’ensemble')),
        ('profile-overview-transcender--desktop--fr-light', profile_page(DESKTOP, 'light', 'fr', who=NOE, name='profile-overview-transcender', desc='Fiche de Noé Laurent (Transcender, 42 Paris), Vue d’ensemble')),
        ('profile-overview-alumni--mobile--fr-light', profile_page(MOBILE, 'light', 'fr', who=INES, name='profile-overview-alumni', desc='Fiche d’Inès Morel (Alumni, 42 Lyon), Vue d’ensemble')),
    ],
    'extra': [
        ('filter-people-expanded--desktop--ar-light', filter_dialog(DESKTOP, 'light', 'ar', expanded=True)),
        ('people-list--mobile--ar-light', directory(MOBILE, 'light', 'ar', 'list')),
        ('people-list--desktop--fr-dark', directory(DESKTOP, 'dark', 'fr', 'list')),
        ('report-profile--mobile--fr-light', report_dialog(MOBILE)),
    ],
}


# -- post-processing (no Chrome) ------------------------------------------------------------------------------
def load_dump(name):
    return json.loads(gzip.decompress((DOM / AREA / (name + '.json.gz')).read_bytes()))


def card_box(data, title):
    """Box of the directory card whose h2 reads `title` (document px)."""
    nodes = data['nodes']
    for n in nodes:
        if n['tag'] == 'h2' and n.get('text') == title:
            p = n['p']
            while p >= 0 and 'cp-profile-card' not in nodes[p].get('cls', ''):
                p = nodes[p]['p']
            if p >= 0:
                return nodes[p]
    return None


def crops():
    """Directory cards of each status, cut from the captured screenshots with the boxes of the dumps."""
    from PIL import Image
    out = REF / AREA / 'components'; out.mkdir(parents=True, exist_ok=True)
    made = []
    for state in ['people--desktop--fr-light', 'people--mobile--fr-light', 'people-list--desktop--fr-light', 'people-list--mobile--fr-light',
                  'people--desktop--fr-dark', 'people--mobile--fr-dark']:
        try:
            data = load_dump(state)
        except FileNotFoundError:
            continue
        dpr = data['dpr']; vw, vh = data['viewport']
        for who, status in [('Leïla Mansour', 'cadet'), ('Noé Laurent', 'transcender'), ('Inès Morel', 'alumni')]:
            box = card_box(data, who)
            if not box:
                print('no card for', who, 'in', state); continue
            pad = 8
            x0, y0, x1, y1 = box['x'] - pad, box['y'] - pad, box['x'] + box['w'] + pad, box['y'] + box['h'] + pad
            inside = y1 <= vh
            src = REF / AREA / (state + ('.png' if inside else '--full.png'))
            im = Image.open(src)
            crop = im.crop(tuple(int(round(v * dpr)) for v in (max(0, x0), max(0, y0), min(vw, x1), y1)))
            target = out / f'card-{status}--{state}.png'
            crop.save(target); made.append(target.relative_to(BASE).as_posix())
            print('crop', target.name, 'from', src.name, [box['x'], box['y'], box['w'], box['h']])
    return made


def sheets():
    folder = REF / AREA
    names = sorted(p for p in folder.glob('*.png'))
    groups = {}
    for p in names:
        key = p.stem.split('--')[0]
        groups.setdefault(key, []).append(p)
    out = []
    for key, paths in groups.items():
        viewport = [p for p in paths if not p.stem.endswith('--full')]
        full = [p for p in paths if p.stem.endswith('--full')]
        if viewport:
            out.append(contact_sheet(viewport, DOM / AREA / '_sheets' / f'{key}.png', cols=4 if len(viewport) > 3 else len(viewport)))
        if full:
            out.append(contact_sheet(full, DOM / AREA / '_sheets' / f'{key}--full.png', cols=min(4, len(full)), thumb_w=300))
    for o in out:
        print(o)


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__); return
    lot = args[0]
    if lot == 'crops':
        print(crops()); return
    if lot == 'sheets':
        sheets(); return
    only = None
    if '--only' in args:
        only = set(args[args.index('--only') + 1].split(','))
    states = [(n, f) for n, f in LOTS[lot] if not only or n in only]
    started = time.time()
    s = start()
    failures = []
    try:
        for name, run in states:
            if time.time() - started > 500:
                print('time budget reached, stopping before', name, flush=True); failures.append((name, 'not run (time)')); break
            try:
                run(s)
            except Exception as error:  # a failed state is reported, never recorded as good
                print('FAILED', name, repr(error)[:300], flush=True); failures.append((name, repr(error)[:300]))
    finally:
        s.close()
        if RECORDS:
            write_index(AREA, RECORDS, extra={'zone': 'Profils', 'site': 'http://127.0.0.1:8765/work/visualizations/horizon-welcome/content-preview.html',
                                              'script': 'scripts/capture_profiles.py'})
        print(f'{len(RECORDS)} state(s) recorded in {time.time() - started:.0f} s; versions {sorted(v for v in VERSIONS if v)}', flush=True)
        if failures:
            print('failures:', json.dumps(failures, ensure_ascii=False, indent=1), flush=True)


if __name__ == '__main__':
    main()
