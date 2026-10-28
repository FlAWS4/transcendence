#!/usr/bin/env python3
"""Projects zone (« Projets ») of the Figma rebuild of 15 October 2026 — reference captures and layout dumps.

Read-only on the prototype: every state is opened on the active prototype (content-preview.html, same controller
as index.html) through capture_lib.py, one headless Chrome per run, closed in a finally block.

Usage, one batch per run (each run stays under the 9-minute budget of the rebuild):
    cd /home/le-rif/Bureau/Transcendence
    timeout 580 python3 work/figma/refonte-20261015/scripts/capture_projects.py <batch> [state-name ...]
    python3 work/figma/refonte-20261015/scripts/capture_projects.py --list
    python3 work/figma/refonte-20261015/scripts/capture_projects.py --sheets      (contact sheets only, no Chrome)
    python3 work/figma/refonte-20261015/scripts/capture_projects.py --assets      (SVG exports, no Chrome)

Rules followed here:
- each state starts from a fresh document: local/session storage of the prototype origin cleared, about:blank,
  then open_app(); theme and language are checked after loading and set again through the account menu if needed;
- the real globe is blocked (block_globe=True) except in the 'globe' batch, which documents the medallion;
- states whose panel closes when focus leaves it (sort, view, comment menus, @ suggestions) are captured with
  focus kept on the opened control: snap() would otherwise blur it; the session's blur is restored right after;
- prefers-reduced-motion is emulated by helper.Session (no animation caught mid-way); durations are documented
  from the source code in spec-projects.md.
"""
import gzip, hashlib, json, pathlib, sys, time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from capture_lib import *  # noqa: F401,F403  (start, open_app, snap, write_index, contact_sheet, DESKTOP, MOBILE)
from capture_lib import BASE, REF, DOM, REPO

AREA = 'projects'
FT = 'ft-transcendence-building-together'   # 4 campuses, 5 authors, lead: Luiza Costa
MS = 'minishell-under-the-prompt'           # 1 campus (42 Paris), 2 authors, inline media in Réalisation
ORIGIN = 'http://127.0.0.1:8765'
PROTO = REPO / 'work' / 'visualizations' / 'horizon-welcome'
WATCHED = ['content-preview.html', 'index.html', 'welcome.mjs', 'project-ui.mjs', 'projects.css', 'content-preview.css',
           'content-layout.css', 'responsive-content.css', 'content-controls.mjs', 'content-controls.css',
           'project-filter-dialog.mjs', 'project-filter-dialog.css', 'content-pagination-ui.mjs', 'content-pagination.css',
           'comments.mjs', 'comments.css', 'content-report.mjs', 'content-report.css', 'media-viewer.mjs', 'media-viewer.css',
           'project-trial.mjs', 'detail-scroll.mjs', 'detail-scroll.css', 'design-review-selection.css',
           'design-review-selection.mjs', 'profiles.css', 'content-preview-data.mjs']
SAMPLE_REPOSITORY = 'https://example.org/horizon-demo/minishell'
SAMPLE_INSTRUCTIONS = 'make\n./minishell'


def sources_fingerprint():
    return {name: hashlib.sha256((PROTO / name).read_bytes()).hexdigest()[:16] for name in WATCHED if (PROTO / name).exists()}


# ---------------------------------------------------------------------------------------------------------------
# Session helpers
def fresh(s, route, vp, theme='light', lang='fr', globe=False, settle=1.2):
    """Load a route in a clean document: storage cleared, then about:blank, then open_app()."""
    try:
        s.js('(()=>{if(location.origin===' + json.dumps(ORIGIN) + '){try{localStorage.clear();sessionStorage.clear()}catch(e){}}return true})()')
    except Exception:
        pass
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.35)
    open_app(s, route, vp, theme=theme, lang=lang, block_globe=not globe, settle=settle)
    state = page_state(s)
    if state['theme'] != theme or state['lang'] != lang:
        s.settings(lang, theme); time.sleep(.6)
        state = page_state(s)
    if state['theme'] != theme or state['lang'] != lang:
        raise RuntimeError(f'theme/lang not applied: wanted {theme}/{lang}, got {state}')
    return state


def page_state(s):
    return s.js('({theme:document.documentElement.dataset.theme,lang:document.documentElement.lang,dir:document.documentElement.dir,'
                'section:document.getElementById("app")?.dataset.section,reading:document.getElementById("app")?.dataset.reading||null,'
                'hash:location.hash,scrollY:scrollY})')


def wait_list(s):
    ok = s.wait('document.querySelectorAll("#content-list .cp-card").length>0||Boolean(document.querySelector("#content-list .content-empty"))', 20)
    s.wait('[...document.images].every(i=>i.complete)', 8); time.sleep(.5)
    return ok


def wait_detail(s):
    ok = s.wait('Boolean(document.querySelector("#project-detail:not([hidden]) .cp-project-workspace"))', 20)
    s.wait('[...document.images].every(i=>i.complete)', 8); time.sleep(.6)
    return ok


def visible(s, selector):
    return s.js('(()=>{const e=document.querySelector(' + json.dumps(selector) + ');if(!e)return false;const r=e.getBoundingClientRect();'
                'return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=="hidden"&&!e.closest("[hidden]")})()')


def must(s, selector, what):
    if not s.wait('(()=>{const e=document.querySelector(' + json.dumps(selector) + ');if(!e)return false;const r=e.getBoundingClientRect();'
                  'return r.width>0&&r.height>0&&!e.closest("[hidden]")})()', 8):
        raise RuntimeError(f'{what}: {selector} not visible')


def type_text(s, selector, text):
    """Focus a field by a real click, then insert text like a keyboard would (beforeinput/input events)."""
    s.click(selector); time.sleep(.2)
    s.c.call('Input.insertText', {'text': text}); time.sleep(.3)


def platform_fonts(s, selector):
    """Fonts Chrome actually used for the text of a node (Jost, or the Arabic fallback of this machine)."""
    try:
        s.c.call('DOM.enable'); s.c.call('CSS.enable')
        root = s.c.call('DOM.getDocument', {'depth': 0})['root']['nodeId']
        node = s.c.call('DOM.querySelector', {'nodeId': root, 'selector': selector}).get('nodeId')
        if not node:
            return None
        return s.c.call('CSS.getPlatformFontsForNode', {'nodeId': node}).get('fonts')
    except Exception as error:
        return f'unreadable: {error}'


class keep_focus:
    """snap() blurs the active element before shooting; menus that close on focusout must keep their focus."""
    def __init__(self, s): self.s = s
    def __enter__(self): self.saved = self.s.blur; self.s.blur = lambda: None
    def __exit__(self, *exc): self.s.blur = self.saved


# ---------------------------------------------------------------------------------------------------------------
# Interactions
def open_view_menu(s):
    s.click('#content-layout-button'); must(s, '#content-layout-menu', 'view menu')


def choose_list(s):
    open_view_menu(s); s.click('#content-layout-menu [data-value=list]')
    s.wait('document.getElementById("content-index").dataset.view==="list"', 5); time.sleep(.6)


def open_sort(s):
    s.click('#content-sort-button'); must(s, '#content-sort-menu', 'sort menu'); time.sleep(.3)


def open_filter(s):
    s.click('#content-category-button'); must(s, 'dialog.cp-project-filter-dialog[open]', 'filter dialog'); time.sleep(.5)


def expand_filter_partial(s):
    """Projets unfolded, Tronc commun unfolded, two of its seven types checked: both bulk buttons are 'mixed'."""
    open_filter(s)
    s.click('dialog.cp-project-filter-dialog [data-facet=projects] > .cp-project-filter-category .cp-project-filter-toggle'); time.sleep(.3)
    s.click('dialog.cp-project-filter-dialog [data-group=common-core] .cp-project-filter-toggle'); time.sleep(.3)
    s.click('dialog.cp-project-filter-dialog input[value=minishell]'); time.sleep(.2)
    s.click('dialog.cp-project-filter-dialog input[value=ft_transcendence]'); time.sleep(.2)
    s.js('(()=>{const b=document.querySelector("dialog.cp-project-filter-dialog .cp-project-filter-body");if(b)b.scrollTop=0;return true})()')
    return s.js('[...document.querySelectorAll("dialog.cp-project-filter-dialog .cp-project-filter-all")].map(b=>b.getAttribute("aria-pressed"))')


def apply_filter_partial(s):
    expand_filter_partial(s)
    s.click('dialog.cp-project-filter-dialog .cp-project-filter-apply')
    s.wait('!document.querySelector("dialog.cp-project-filter-dialog[open]")', 5); wait_list(s)


def favorites_only(s):
    open_sort(s); s.click('#content-sort-menu [data-value=favoritesOnly]'); time.sleep(.6)
    must(s, '#content-list .content-empty', 'empty favorites state')


def favorite_first(s):
    s.click('#content-list .cp-card .cp-favorite'); time.sleep(.6)
    return s.js('document.querySelector("#content-list .cp-card .cp-favorite")?.getAttribute("aria-pressed")')


def scroll_bottom(s):
    s.scroll(100000); time.sleep(.8)


def open_repository_form(s):
    s.click('.cp-project-repository-edit'); must(s, '.cp-project-repository-form', 'repository form'); time.sleep(.3)


def save_repository(s):
    open_repository_form(s)
    type_text(s, '.cp-project-repository-input', SAMPLE_REPOSITORY)
    type_text(s, '.cp-project-repository-textarea', SAMPLE_INSTRUCTIONS)
    s.click('.cp-project-repository-actions button[type=submit]'); time.sleep(.5)
    must(s, '.cp-project-trial-open', 'saved repository link')


def make_thread(s):
    """One comment with an @mention, one reply and a like on the comment: all through the real composer."""
    s.click('#project-comment-input'); time.sleep(.2)
    s.c.call('Input.insertText', {'text': 'Très clair, merci '}); time.sleep(.2)
    s.c.call('Input.insertText', {'text': '@ines'}); time.sleep(.5)
    must(s, '.cp-comments-form:not(.cp-comments-reply-form) .cp-mention-picker', 'mention picker')
    s.key('Enter'); time.sleep(.3)
    s.c.call('Input.insertText', {'text': 'pour le découpage des redirections.'}); time.sleep(.2)
    s.click('.cp-comments > .cp-comments-form .cp-comments-submit'); time.sleep(.6)
    must(s, '.cp-comments-list article.cp-comment', 'posted comment')
    s.click('.cp-comments-list article.cp-comment [data-comment-action=reply]'); time.sleep(.4)
    must(s, '.cp-comments-reply-form', 'reply form')
    s.click('.cp-comments-reply-form textarea'); time.sleep(.2)
    s.c.call('Input.insertText', {'text': 'Merci ! Les cas de test sont dans le dépôt.'}); time.sleep(.2)
    s.click('.cp-comments-reply-form .cp-comments-submit'); time.sleep(.6)
    must(s, '.cp-comment-replies article.cp-comment', 'posted reply')
    s.click('.cp-comments-list > li > article.cp-comment [data-comment-action=like]'); time.sleep(.4)
    s.js('scrollTo(0,0)'); time.sleep(.3)
    return s.js('({comments:document.querySelectorAll(".cp-comments-list article.cp-comment").length,mention:Boolean(document.querySelector(".cp-comment-mention")),'
                'liked:document.querySelector(".cp-comments-list > li > article [data-comment-action=like]")?.getAttribute("aria-pressed")})')


def scroll_to(s, selector, offset=140):
    s.js('(()=>{const e=document.querySelector(' + json.dumps(selector) + ');if(!e)return false;scrollTo(0,Math.max(0,e.getBoundingClientRect().top+scrollY-' + str(offset) + '));return true})()')
    time.sleep(1.2)


def open_comment_menu(s):
    scroll_to(s, '.cp-comments-list')
    s.click('.cp-comments-list > li > article.cp-comment .cp-comment-menu-toggle'); time.sleep(.4)
    must(s, '.cp-comment-owner-menu:not([hidden])', 'comment menu')


def open_comment_sort(s):
    scroll_to(s, '.cp-comments-toolbar', 220)
    s.click('.cp-comments-sort'); time.sleep(.4)
    must(s, '.cp-comments-toolbar .cp-control-panel:not([hidden])', 'comment sort panel')


def open_mention(s):
    s.click('#project-comment-input'); time.sleep(.2)
    s.c.call('Input.insertText', {'text': 'Bravo '}); time.sleep(.1)
    s.c.call('Input.insertText', {'text': '@in'}); time.sleep(.6)
    must(s, '.cp-comments > .cp-comments-form .cp-mention-picker', 'mention picker')
    return s.js('document.querySelectorAll(".cp-comments > .cp-comments-form .cp-mention-option").length')


def open_switch(s):
    s.click('#project-section-picker'); time.sleep(.6)
    must(s, '.cp-project-section-switch[open] .cp-project-switch-panel', 'section switch')


def open_campus_choice(s):
    s.click('#project-detail .cp-project-campus'); time.sleep(.4)
    must(s, 'dialog.cp-project-campus-dialog[open]', 'campus choice')


def open_report(s):
    s.click('#project-detail .cp-report-trigger'); time.sleep(.4)
    must(s, 'dialog.cp-report-dialog[open]', 'report dialog')


def save_report(s):
    open_report(s)
    s.js('(()=>{const r=document.querySelector("dialog.cp-report-dialog select");r.value="privacy";r.dispatchEvent(new Event("change",{bubbles:true}));return true})()')
    s.click('dialog.cp-report-dialog .cp-report-submit'); time.sleep(.4)
    must(s, 'dialog.cp-report-dialog .cp-report-result', 'saved report')


def open_viewer(s, index=0):
    if index == 0:
        s.click('#project-detail .cp-project-lead-media .cp-project-media-open')
    else:
        s.click(f'#project-detail .cp-project-media-gallery figure:nth-child({index + 1}) .cp-project-media-open')
    time.sleep(.6)
    must(s, 'dialog.media-viewer[open]', 'media viewer')
    s.wait('(()=>{const i=document.querySelector("dialog.media-viewer[open] img");return !i||i.complete})()', 6); time.sleep(.3)
    return s.js('document.querySelector("dialog.media-viewer .media-viewer-count")?.textContent')


# ---------------------------------------------------------------------------------------------------------------
# States: name -> (site-map id, viewport, theme, lang, route, options)
def st(name, screen, vp, theme, lang, route, kind='list', full=False, prep=None, focus=False, globe=False, note='', fonts=None):
    return dict(name=name, screen=screen, vp=vp, theme=theme, lang=lang, route=route, kind=kind, full=full, prep=prep,
                focus=focus, globe=globe, note=note, fonts=fonts)


D, M = DESKTOP, MOBILE
DETAIL_FT, DETAIL_MS = 'projects/' + FT, 'projects/' + MS
BATCHES = {
    'list': [
        st('projects-grid--desktop--fr-light', 'projects', D, 'light', 'fr', 'projects', full=True, note='Liste en Grille, page 1 (12 projets), globe bloqué.', fonts='#content-list .cp-card-title-link'),
        st('projects-grid--desktop--fr-dark', 'projects', D, 'dark', 'fr', 'projects', full=True),
        st('projects-grid--mobile--fr-light', 'projects', M, 'light', 'fr', 'projects', full=True),
        st('projects-grid--mobile--fr-dark', 'projects', M, 'dark', 'fr', 'projects', full=True),
    ],
    'locales': [
        st('projects-grid--desktop--ar-light', 'projects', D, 'light', 'ar', 'projects', fonts='#content-list .cp-card-title-link'),
        st('projects-grid--mobile--ar-light', 'projects', M, 'light', 'ar', 'projects'),
        st('projects-grid--desktop--en-light', 'projects', D, 'light', 'en', 'projects'),
        st('projects-favorite-active--desktop--fr-light', 'projects', D, 'light', 'fr', 'projects', prep=favorite_first, note='Cœur Favoris activé sur la première carte.'),
        st('projects-empty-favorites--desktop--fr-light', 'projects', D, 'light', 'fr', 'projects', prep=favorites_only, note='Trier → « Mes favoris uniquement » sans favori : état vide.'),
    ],
    'views': [
        st('projects-list--desktop--fr-light', 'projects', D, 'light', 'fr', 'projects', full=True, prep=choose_list, note='Affichage → Liste.'),
        st('projects-list--mobile--fr-light', 'projects', M, 'light', 'fr', 'projects', full=True, prep=choose_list),
        st('projects-list--desktop--fr-dark', 'projects', D, 'dark', 'fr', 'projects', prep=choose_list),
        st('projects-sort-open--desktop--fr-light', 'projects', D, 'light', 'fr', 'projects', prep=open_sort, focus=True, note='Panneau Trier ouvert (focus sur le choix courant).'),
        st('projects-sort-open--mobile--fr-light', 'projects', M, 'light', 'fr', 'projects', prep=open_sort, focus=True),
        st('projects-layout-open--desktop--fr-light', 'projects', D, 'light', 'fr', 'projects', prep=open_view_menu, focus=True, note='Panneau Affichage ouvert.'),
    ],
    'filter': [
        st('filter-projects--desktop--fr-light', 'filter-projects', D, 'light', 'fr', 'projects', prep=open_filter, note='Fenêtre Filtrer, catégories repliées.'),
        st('filter-projects-expanded--desktop--fr-light', 'filter-projects', D, 'light', 'fr', 'projects', prep=expand_filter_partial, note='Projets puis Tronc commun dépliés, minishell + ft_transcendence cochés (état mixte).'),
        st('filter-projects--desktop--fr-dark', 'filter-projects', D, 'dark', 'fr', 'projects', prep=open_filter),
        st('filter-projects-expanded--desktop--fr-dark', 'filter-projects', D, 'dark', 'fr', 'projects', prep=expand_filter_partial),
        st('filter-projects--mobile--fr-light', 'filter-projects', M, 'light', 'fr', 'projects', prep=open_filter),
        st('filter-projects-expanded--mobile--fr-light', 'filter-projects', M, 'light', 'fr', 'projects', prep=expand_filter_partial),
        st('filter-projects--mobile--fr-dark', 'filter-projects', M, 'dark', 'fr', 'projects', prep=open_filter),
        st('filter-projects-expanded--mobile--fr-dark', 'filter-projects', M, 'dark', 'fr', 'projects', prep=expand_filter_partial),
        st('projects-filtered--desktop--fr-light', 'projects', D, 'light', 'fr', 'projects', prep=apply_filter_partial, note='Après Appliquer : 2 critères, bouton Filtrer marqué, compteur réduit.'),
    ],
    'pages': [
        st('projects-last-page--desktop--fr-light', 'projects', D, 'light', 'fr', 'projects?page=7', full=True, note='Page 7 sur 7 (6 projets), flèche Suivant désactivée.'),
        st('projects-pagination--mobile--fr-light', 'projects', M, 'light', 'fr', 'projects', prep=scroll_bottom, note='Bas de la page 1 : rangée de pagination au-dessus du menu.'),
        st('projects-pagination--desktop--fr-light', 'projects', D, 'light', 'fr', 'projects', prep=scroll_bottom, note='Bas de la page 1 sur ordinateur.'),
    ],
    'overview': [
        st('project-overview--desktop--fr-light', 'project-overview', D, 'light', 'fr', DETAIL_FT, kind='detail', full=True, note='ft_transcendence : 4 campus, 5 auteurs, Vue d’ensemble avec Équipe.', fonts='#project-title'),
        st('project-overview--desktop--fr-dark', 'project-overview', D, 'dark', 'fr', DETAIL_FT, kind='detail', full=True),
        st('project-overview--mobile--fr-light', 'project-overview', M, 'light', 'fr', DETAIL_FT, kind='detail', full=True),
        st('project-overview--mobile--fr-dark', 'project-overview', M, 'dark', 'fr', DETAIL_FT, kind='detail', full=True),
    ],
    'overview2': [
        st('project-overview--desktop--ar-light', 'project-overview', D, 'light', 'ar', DETAIL_FT, kind='detail', full=True, fonts='#project-title'),
        st('project-overview--mobile--ar-light', 'project-overview', M, 'light', 'ar', DETAIL_FT, kind='detail', full=True),
        st('project-overview-minishell--desktop--fr-light', 'project-overview', D, 'light', 'fr', DETAIL_MS, kind='detail', full=True, note='Minishell : un seul campus, « Explorer 42 Paris ».'),
        st('project-section-switch--mobile--fr-light', 'project', M, 'light', 'fr', DETAIL_FT, kind='detail', prep=open_switch, note='Sélecteur « Dans ce projet » ouvert.'),
        st('project-section-switch--mobile--fr-dark', 'project', M, 'dark', 'fr', DETAIL_FT, kind='detail', prep=open_switch),
    ],
    'tabs': [
        st('project-implementation--desktop--fr-light', 'project-implementation', D, 'light', 'fr', DETAIL_MS + '?tab=implementation', kind='detail', full=True),
        st('project-implementation--mobile--fr-light', 'project-implementation', M, 'light', 'fr', DETAIL_MS + '?tab=implementation', kind='detail', full=True),
        st('project-media--desktop--fr-light', 'project-media', D, 'light', 'fr', DETAIL_MS + '?tab=media', kind='detail', full=True),
        st('project-test--desktop--fr-light', 'project-test', D, 'light', 'fr', DETAIL_MS + '?tab=test', kind='detail', note='Aucun dépôt renseigné.'),
        st('project-test-form--desktop--fr-light', 'project-test', D, 'light', 'fr', DETAIL_MS + '?tab=test', kind='detail', prep=open_repository_form, note='Formulaire de dépôt vide.'),
        st('project-test-saved--desktop--fr-light', 'project-test', D, 'light', 'fr', DETAIL_MS + '?tab=test', kind='detail', prep=save_repository, note='Lien enregistré (adresse d’exemple example.org saisie pour la capture).'),
        st('project-test--mobile--fr-light', 'project-test', M, 'light', 'fr', DETAIL_MS + '?tab=test', kind='detail'),
        st('project-test-form--mobile--fr-light', 'project-test', M, 'light', 'fr', DETAIL_MS + '?tab=test', kind='detail', prep=open_repository_form, full=True),
        st('project-test-saved--mobile--fr-light', 'project-test', M, 'light', 'fr', DETAIL_MS + '?tab=test', kind='detail', prep=save_repository, full=True),
    ],
    'comments': [
        st('project-comments--desktop--fr-light', 'project-comments', D, 'light', 'fr', DETAIL_MS + '?tab=comments', kind='detail', full=True, note='Liste vide au départ.'),
        st('project-comments-thread--desktop--fr-light', 'project-comments', D, 'light', 'fr', DETAIL_MS + '?tab=comments', kind='detail', full=True, prep=make_thread, note='Un commentaire avec mention, une réponse, un « J’aime ».'),
        st('comment-menu--desktop--fr-light', 'comment-menu', D, 'light', 'fr', DETAIL_MS + '?tab=comments', kind='detail', prep=lambda s: (make_thread(s), open_comment_menu(s)), focus=True, note='Menu ⋮ de son propre commentaire.'),
        st('project-comments-sort-open--desktop--fr-light', 'project-comments', D, 'light', 'fr', DETAIL_MS + '?tab=comments', kind='detail', prep=lambda s: (make_thread(s), open_comment_sort(s)), focus=True),
        st('project-comments-mention--desktop--fr-light', 'project-comments', D, 'light', 'fr', DETAIL_MS + '?tab=comments', kind='detail', prep=open_mention, focus=True, note='Saisie « Bravo @in » : suggestions de mention.'),
    ],
    'comments2': [
        st('project-comments--mobile--fr-light', 'project-comments', M, 'light', 'fr', DETAIL_MS + '?tab=comments', kind='detail', full=True),
        st('project-comments-thread--mobile--fr-light', 'project-comments', M, 'light', 'fr', DETAIL_MS + '?tab=comments', kind='detail', full=True, prep=make_thread),
        st('project-comments--desktop--fr-dark', 'project-comments', D, 'dark', 'fr', DETAIL_MS + '?tab=comments', kind='detail'),
        st('project-comments-thread--desktop--fr-dark', 'project-comments', D, 'dark', 'fr', DETAIL_MS + '?tab=comments', kind='detail', full=True, prep=make_thread),
        st('comment-menu--mobile--fr-light', 'comment-menu', M, 'light', 'fr', DETAIL_MS + '?tab=comments', kind='detail', prep=lambda s: (make_thread(s), open_comment_menu(s)), focus=True),
    ],
    'overlays': [
        st('campus-choice--desktop--fr-light', 'campus-choice', D, 'light', 'fr', DETAIL_FT, kind='detail', prep=open_campus_choice),
        st('campus-choice--mobile--fr-light', 'campus-choice', M, 'light', 'fr', DETAIL_FT, kind='detail', prep=open_campus_choice),
        st('report--desktop--fr-light', 'report', D, 'light', 'fr', DETAIL_FT, kind='detail', prep=open_report),
        st('report--mobile--fr-light', 'report', M, 'light', 'fr', DETAIL_FT, kind='detail', prep=open_report),
        st('report--desktop--fr-dark', 'report', D, 'dark', 'fr', DETAIL_FT, kind='detail', prep=open_report),
        st('report-saved--desktop--fr-light', 'report', D, 'light', 'fr', DETAIL_FT, kind='detail', prep=save_report, note='Motif « Atteinte à la vie privée » enregistré.'),
        st('viewer--desktop--fr-light', 'viewer', D, 'light', 'fr', DETAIL_MS, kind='detail', prep=open_viewer, note='Illustration principale de Minishell (1 / 2).'),
        st('viewer-image--desktop--fr-light', 'viewer', D, 'light', 'fr', DETAIL_MS + '?tab=media', kind='detail', prep=lambda s: open_viewer(s, 1), note='Schéma image de Minishell (2 / 2).'),
        st('viewer--mobile--fr-light', 'viewer', M, 'light', 'fr', DETAIL_MS, kind='detail', prep=open_viewer),
    ],
    'globe': [
        st('projects-grid-globe--desktop--fr-light', 'projects', D, 'light', 'fr', 'projects', globe=True, note='Vrai globe chargé : miniature dans le médaillon du filtre.'),
        st('project-overview-globe--desktop--fr-light', 'project-overview', D, 'light', 'fr', DETAIL_FT, kind='detail', globe=True, note='Vrai globe, contexte de lecture (filtre remonté dans l’en-tête).'),
    ],
}


def capture(s, spec, fingerprint):
    t0 = time.time()
    state = fresh(s, spec['route'], spec['vp'], spec['theme'], spec['lang'], globe=spec['globe'])
    ok = wait_list(s) if spec['kind'] == 'list' else wait_detail(s)
    if not ok:
        raise RuntimeError('content not rendered for ' + spec['name'])
    globe_ready = None
    if spec['globe']:
        globe_ready = s.globe_ready(50); time.sleep(2.5)
    result = spec['prep'](s) if spec['prep'] else None
    meta = {'screen': spec['screen'], 'route': '#' + spec['route'], 'theme': spec['theme'], 'lang': spec['lang'],
            'viewport': list(spec['vp']), 'globe': 'real' if spec['globe'] else 'blocked', 'note': spec['note'],
            'page_state': page_state(s), 'interaction': repr(result) if result is not None else None,
            'focus_kept': spec['focus'], 'reduced_motion': True, 'globe_ready': globe_ready, 'sources': fingerprint}
    if spec['fonts']:
        meta['platform_fonts'] = platform_fonts(s, spec['fonts'])
    if spec['focus']:
        with keep_focus(s):
            rec = snap(s, AREA, spec['name'], full=False, meta=meta)
    else:
        rec = snap(s, AREA, spec['name'], full=spec['full'], meta=meta)
    rec.update({'screen': spec['screen'], 'route': meta['route'], 'theme': spec['theme'], 'lang': spec['lang'],
                'format': 'mobile' if spec['vp'] == MOBILE else 'desktop', 'globe': meta['globe'], 'note': spec['note'],
                'checked': {'theme': meta['page_state']['theme'], 'lang': meta['page_state']['lang'], 'dir': meta['page_state']['dir']},
                'interaction': meta['interaction'], 'seconds': round(time.time() - t0, 1)})
    if spec['fonts']:
        rec['platform_fonts'] = meta['platform_fonts']
    write_index(AREA, [rec], extra={'zone': 'Projets', 'sources_last_run': fingerprint,
                                    'site_map_ids': ['projects', 'filter-projects', 'project', 'project-overview', 'project-implementation',
                                                     'project-media', 'project-test', 'project-comments', 'campus-choice', 'repo-link',
                                                     'viewer', 'report', 'comment-menu']})
    print(f"{spec['name']}: {rec['seconds']}s nodes={rec.get('nodes')} overflow={rec['overflow']} errors={len(rec['errors'])} version={rec['version']}", flush=True)
    return rec


def run(batch, only=()):
    specs = [spec for spec in BATCHES[batch] if not only or spec['name'] in only]
    fingerprint = sources_fingerprint()
    s = start()
    done = []
    try:
        for spec in specs:
            try:
                done.append(capture(s, spec, fingerprint))
            except Exception as error:  # keep going: a failed state is reported, never documented as good
                print(f"FAILED {spec['name']}: {error}", flush=True)
    finally:
        s.close()
    after = sources_fingerprint()
    changed = sorted(k for k in after if after[k] != fingerprint.get(k))
    if changed:
        print('WARNING prototype sources changed during the run:', changed, flush=True)
    return done


# ---------------------------------------------------------------------------------------------------------------
# Offline helpers: contact sheets and SVG assets (no Chrome)
SHEETS = {
    'list': ['projects-grid--desktop--fr-light', 'projects-grid--desktop--fr-dark', 'projects-grid--desktop--en-light', 'projects-grid--desktop--ar-light',
             'projects-favorite-active--desktop--fr-light', 'projects-empty-favorites--desktop--fr-light'],
    'list-mobile': ['projects-grid--mobile--fr-light', 'projects-grid--mobile--fr-dark', 'projects-grid--mobile--ar-light',
                    'projects-list--mobile--fr-light', 'projects-sort-open--mobile--fr-light', 'projects-pagination--mobile--fr-light'],
    'views': ['projects-list--desktop--fr-light', 'projects-list--desktop--fr-dark', 'projects-sort-open--desktop--fr-light',
              'projects-layout-open--desktop--fr-light', 'projects-last-page--desktop--fr-light', 'projects-pagination--desktop--fr-light'],
    'filter': ['filter-projects--desktop--fr-light', 'filter-projects-expanded--desktop--fr-light', 'filter-projects--desktop--fr-dark',
               'filter-projects-expanded--desktop--fr-dark', 'projects-filtered--desktop--fr-light'],
    'filter-mobile': ['filter-projects--mobile--fr-light', 'filter-projects-expanded--mobile--fr-light', 'filter-projects--mobile--fr-dark',
                      'filter-projects-expanded--mobile--fr-dark'],
    'overview': ['project-overview--desktop--fr-light', 'project-overview--desktop--fr-dark', 'project-overview--desktop--ar-light',
                 'project-overview-minishell--desktop--fr-light'],
    'overview-mobile': ['project-overview--mobile--fr-light', 'project-overview--mobile--fr-dark', 'project-overview--mobile--ar-light',
                        'project-section-switch--mobile--fr-light', 'project-section-switch--mobile--fr-dark'],
    'tabs': ['project-implementation--desktop--fr-light', 'project-media--desktop--fr-light', 'project-test--desktop--fr-light',
             'project-test-form--desktop--fr-light', 'project-test-saved--desktop--fr-light'],
    'tabs-mobile': ['project-implementation--mobile--fr-light', 'project-test--mobile--fr-light', 'project-test-form--mobile--fr-light',
                    'project-test-saved--mobile--fr-light'],
    'comments': ['project-comments--desktop--fr-light', 'project-comments-thread--desktop--fr-light', 'comment-menu--desktop--fr-light',
                 'project-comments-sort-open--desktop--fr-light', 'project-comments-mention--desktop--fr-light', 'project-comments--desktop--fr-dark',
                 'project-comments-thread--desktop--fr-dark'],
    'comments-mobile': ['project-comments--mobile--fr-light', 'project-comments-thread--mobile--fr-light', 'comment-menu--mobile--fr-light'],
    'overlays': ['campus-choice--desktop--fr-light', 'report--desktop--fr-light', 'report--desktop--fr-dark', 'report-saved--desktop--fr-light',
                 'viewer--desktop--fr-light', 'viewer-image--desktop--fr-light'],
    'overlays-mobile': ['campus-choice--mobile--fr-light', 'report--mobile--fr-light', 'viewer--mobile--fr-light'],
    'globe': ['projects-grid-globe--desktop--fr-light', 'project-overview-globe--desktop--fr-light', 'projects-grid--desktop--fr-light'],
}


def sheets(names=None):
    out = []
    for key, states in SHEETS.items():
        if names and key not in names:
            continue
        paths = [REF / AREA / (n + '.png') for n in states if (REF / AREA / (n + '.png')).exists()]
        if paths:
            out.append(contact_sheet(paths, DOM / AREA / '_sheets' / (key + '.png'), cols=3 if 'mobile' not in key else 5,
                                     thumb_w=440 if 'mobile' not in key else 260))
    return out


def export_assets():
    """Project covers serialised exactly as coverArt() returns them, the Minishell diagram, and the six portraits."""
    import re, shutil, subprocess
    art = (PROTO / 'content-preview-art.mjs').read_text()
    script = ("import {coverArt} from " + json.dumps((PROTO / 'content-preview-art.mjs').as_uri()) + ";"
              "const out={};for(const k of ['shell','raycast','network','garden'])out[k]=coverArt(k);console.log(JSON.stringify(out));")
    data = json.loads(subprocess.run(['node', '--input-type=module', '-e', script], capture_output=True, text=True, check=True).stdout)
    folder = BASE / 'assets' / 'illustrations'; folder.mkdir(parents=True, exist_ok=True)
    written = []
    for key, svg in data.items():
        target = folder / f'project-cover-{key}.svg'
        target.write_text('<?xml version="1.0" encoding="UTF-8"?>\n<!-- Serialised from coverArt("' + key + '") in work/visualizations/horizon-welcome/content-preview-art.mjs (15 Oct 2026). '
                          'Used as data-cover="' + key + '" by project cards, detail lead media and the media viewer. -->\n' + svg + '\n')
        written.append(target)
    diagram = folder / 'minishell-flow-demo.svg'
    shutil.copyfile(PROTO / 'assets' / 'minishell-flow-demo.svg', diagram); written.append(diagram)
    portraits = BASE / 'assets' / 'portraits'; portraits.mkdir(parents=True, exist_ok=True)
    for path in sorted((PROTO / 'assets' / 'profile-avatars').glob('*.svg')):
        target = portraits / ('profile-' + path.name)
        if target.exists() and target.read_bytes() != path.read_bytes():
            print('kept existing different file', target); continue
        if not target.exists():
            shutil.copyfile(path, target)
        written.append(target)
    return written


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args or args[0] == '--list':
        for batch, specs in BATCHES.items():
            print(batch + ':', ', '.join(spec['name'] for spec in specs))
    elif args[0] == '--sheets':
        for path in sheets(args[1:]):
            print(path)
    elif args[0] == '--assets':
        for path in export_assets():
            print(path)
    else:
        run(args[0], set(args[1:]))
