#!/usr/bin/env python3
"""Projects zone (« Projets ») of the Figma rebuild (15 October 2026), variants pass: every state in FR/EN/AR x
light/dark, desktop 1440x960 and mobile 390x844 DPR 2. The globe module is blocked (not needed by these screens).

Read-only on the prototype (content-preview.html, same controller as index.html). One lot per run, never two
capture scripts at once; a run resumes where the previous one stopped:
    cd /home/le-rif/Bureau/Transcendence && timeout 580 python3 figma/refonte-20261015/scripts/capture_projects.py <lot>
Options: --force, formats=desktop|mobile, variants=fr-light,ar-dark, only=<state,...>; "list" and "sheets" need no Chrome.

Content used: ft_transcendence (4 campus, 5 auteurs) for the project page, its campus choice and report;
Minishell (one campus, 42 Paris, media in Réalisation) for the single-campus page, the tabs and the viewer.
Typed content (repository link, comments) is the same in every language: it is user content, not interface copy.
States whose panel closes when focus leaves it (sort, comment menu, comment sort, @ suggestions) keep their focus.
"""
import json, pathlib, sys, time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from variants import Runner, StateError, STAR, BASIC, main, tap  # noqa: E402

ZONE = 'projects'
FT = 'projects/ft-transcendence-building-together'
MS = 'projects/minishell-under-the-prompt'
REPOSITORY = 'https://example.org/horizon-demo/minishell'
INSTRUCTIONS = 'make\n./minishell'
COMMENT = ('Très clair, merci ', '@ines', 'pour le découpage des redirections.')
REPLY = 'Merci ! Les cas de test sont dans le dépôt.'

LIST_READY = 'document.querySelectorAll("#content-list .cp-card").length>0||Boolean(document.querySelector("#content-list .content-empty"))'
DETAIL_READY = 'Boolean(document.querySelector("#project-detail:not([hidden]) .cp-project-workspace"))'
FILTER_OPEN = 'Boolean(document.querySelector("dialog.cp-project-filter-dialog[open]"))'
LIST_JS = ('({view:document.getElementById("content-index")?.dataset.view||null,count:document.getElementById("content-count")?.textContent||null,'
           'cards:document.querySelectorAll("#content-list .cp-card").length,page:document.querySelector(".cp-pagination-link[aria-current=page]")?.textContent||null,'
           'empty:document.querySelector("#content-list .content-empty")?.textContent||null})')
DETAIL_JS = ('({title:document.querySelector("#project-detail h1")?.textContent||null,'
             'tab:document.querySelector("#project-detail .cp-project-sidebar-nav [aria-current]")?.textContent||null,'
             'campus:document.querySelector("#project-detail .cp-project-campus")?.textContent||null,'
             'section:document.querySelector("#project-detail .cp-project-active-section")?.getAttribute("aria-labelledby")||null})')


def wait_images(ctx):
    ctx.s.wait('[...document.images].every(i=>i.complete)', 8)
    time.sleep(.5)


def open_list(ctx, route='projects'):
    ctx.open(route)
    ctx.need(LIST_READY, 'project list', 20)
    wait_images(ctx)
    ctx.act('attendre la liste des projets (cartes et images chargées)')


def open_detail(ctx, route):
    ctx.open(route)
    ctx.need(DETAIL_READY, 'project page', 20)
    wait_images(ctx)
    ctx.act('attendre la fiche projet (images chargées)')


def must(ctx, selector, what, seconds=8):
    ctx.need('(()=>{const e=document.querySelector(' + json.dumps(selector) + ');if(!e)return false;const r=e.getBoundingClientRect();'
             'return r.width>0&&r.height>0&&!e.closest("[hidden]")})()', what, seconds)


def type_text(ctx, selector, text):
    tap(ctx.s, selector); time.sleep(.2)
    ctx.s.c.call('Input.insertText', {'text': text}); time.sleep(.3)


def scroll_to(ctx, selector, offset=140):
    ctx.s.js('(()=>{const e=document.querySelector(' + json.dumps(selector) + ');if(!e)return false;scrollTo(0,Math.max(0,e.getBoundingClientRect().top+scrollY-' + str(offset) + '));return true})()')
    time.sleep(1.2)


# ------------------------------------------------------------------------------------------------ list states

def job_projects(ctx):
    open_list(ctx)
    ctx.capture('projects', ['projects'], full=True, expect='document.querySelectorAll("#content-list .cp-card").length===12', checks={'list': ctx.s.js(LIST_JS)})


def job_list(ctx):
    open_list(ctx)
    ctx.s.click('#content-layout-button'); must(ctx, '#content-layout-menu', 'view menu')
    ctx.s.click('#content-layout-menu [data-value=list]')
    ctx.need('document.getElementById("content-index").dataset.view==="list"', 'list view', 6)
    time.sleep(.8)
    ctx.act('Affichage ▾ puis Liste')
    ctx.capture('projects-list', ['projects'], full=True, expect='document.getElementById("content-index").dataset.view==="list"', checks={'list': ctx.s.js(LIST_JS)})


SORT_OPEN = '!document.querySelector("#content-sort-menu").hidden'


def job_sort(ctx):
    open_list(ctx)
    ctx.s.click('#content-sort-button'); must(ctx, '#content-sort-menu', 'sort menu'); time.sleep(.4)
    ctx.act('cliquer Trier : le panneau s’ouvre (focus sur le choix courant, conservé pendant la capture)')
    ctx.capture('projects-sort-open', ['projects'], keep_focus=True, expect=SORT_OPEN,
                checks={'options': ctx.s.js('[...document.querySelectorAll("#content-sort-menu [data-value]")].map(b=>b.dataset.value+":"+b.getAttribute("aria-checked"))')})


def job_filter(ctx):
    open_list(ctx)
    ctx.s.click('#content-category-button'); ctx.need(FILTER_OPEN, 'filter dialog'); time.sleep(.6)
    ctx.act('cliquer Filtrer : la fenêtre s’ouvre, catégories repliées')
    ctx.capture('filter-projects', ['filter-projects'], expect=FILTER_OPEN, checks={'list': ctx.s.js(LIST_JS)})
    # Same document: Projets, then Tronc commun unfolded; minishell and ft_transcendence checked (mixed state).
    d = 'dialog.cp-project-filter-dialog'
    ctx.s.click(f'{d} [data-facet=projects] > .cp-project-filter-category .cp-project-filter-toggle'); time.sleep(.3)
    ctx.s.click(f'{d} [data-group=common-core] .cp-project-filter-toggle'); time.sleep(.3)
    ctx.s.click(f'{d} input[value=minishell]'); time.sleep(.2)
    ctx.s.click(f'{d} input[value=ft_transcendence]'); time.sleep(.2)
    ctx.s.js('(()=>{const b=document.querySelector("dialog.cp-project-filter-dialog .cp-project-filter-body");if(b)b.scrollTop=0;return true})()'); time.sleep(.4)
    ctx.act('déplier Projets puis Tronc commun ; cocher minishell et ft_transcendence (sélection partielle, non appliquée)')
    pressed = ctx.s.js(f'[...document.querySelectorAll("{d} .cp-project-filter-all")].map(b=>b.getAttribute("aria-pressed"))')
    checked = ctx.s.js(f'[...document.querySelectorAll("{d} input:checked")].map(i=>i.value)')
    if sorted(checked) != ['ft_transcendence', 'minishell']:
        raise StateError(f'unexpected selection {checked}')
    ctx.capture('filter-projects-expanded', ['filter-projects'], expect=FILTER_OPEN, checks={'bulkButtons': pressed, 'checked': checked})


def job_last_page(ctx):
    open_list(ctx, 'projects?page=7')
    ctx.capture('projects-last-page', ['projects'], full=True, expect='document.querySelector(".cp-pagination-link[aria-current=page]")?.textContent==="7"',
                checks={'list': ctx.s.js(LIST_JS)})


def job_empty(ctx):
    open_list(ctx)
    ctx.s.click('#content-sort-button'); must(ctx, '#content-sort-menu', 'sort menu')
    ctx.s.click('#content-sort-menu [data-value=favoritesOnly]'); time.sleep(.8)
    must(ctx, '#content-list .content-empty', 'empty favorites state')
    ctx.act('Trier ▾ puis « Mes favoris uniquement » sans aucun favori : état vide')
    ctx.capture('projects-empty', ['projects'], full=True, expect='Boolean(document.querySelector("#content-list .content-empty"))', checks={'list': ctx.s.js(LIST_JS)})


# ------------------------------------------------------------------------------------------------ project page

def job_project(ctx):
    open_detail(ctx, FT)
    ctx.capture('project', ['project', 'project-overview'], full=True, expect=DETAIL_READY, checks={'detail': ctx.s.js(DETAIL_JS)},
                note='ft_transcendence : quatre campus, cinq auteurs, Vue d’ensemble.')


def job_single(ctx):
    open_detail(ctx, MS)
    ctx.capture('project-single', ['project', 'project-overview'], full=True, expect=DETAIL_READY, checks={'detail': ctx.s.js(DETAIL_JS)},
                note='Minishell : un seul campus (Explorer 42 Paris).')


def tab_job(state, tab):
    def job(ctx):
        open_detail(ctx, f'{MS}?tab={tab}')
        ctx.capture(state, [state], full=True, expect=DETAIL_READY, checks={'detail': ctx.s.js(DETAIL_JS)})
    return job


def open_repository_form(ctx):
    open_detail(ctx, f'{MS}?tab=test')
    tap(ctx.s, '.cp-project-repository-edit'); must(ctx, '.cp-project-repository-form', 'repository form'); time.sleep(.3)
    ctx.s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.4)
    ctx.act('cliquer « Ajouter un lien » : formulaire de dépôt vide')


def job_test(ctx):
    open_repository_form(ctx)
    ctx.capture('project-test', ['project-test'], full=True, expect='Boolean(document.querySelector(".cp-project-repository-form"))', checks={'detail': ctx.s.js(DETAIL_JS)})


def job_test_saved(ctx):
    open_repository_form(ctx)
    type_text(ctx, '.cp-project-repository-input', REPOSITORY)
    type_text(ctx, '.cp-project-repository-textarea', INSTRUCTIONS)
    tap(ctx.s, '.cp-project-repository-actions button[type=submit]'); time.sleep(.6)
    ctx.s.js('(()=>{scrollTo(0,0);return true})()'); time.sleep(.4)
    must(ctx, '.cp-project-trial-open', 'saved repository link')
    ctx.act(f'saisir {REPOSITORY} et « make / ./minishell », puis Enregistrer')
    ctx.capture('project-test-saved', ['project-test', 'repo-link'], full=True, expect='Boolean(document.querySelector(".cp-project-trial-open"))',
                note='Adresse d’exemple example.org saisie pour la capture (aucun projet n’a de dépôt par défaut).')


COMMENTS = f'{MS}?tab=comments'
THREAD_OK = 'document.querySelectorAll(".cp-comments-list article.cp-comment").length===2'


def job_comments(ctx):
    open_detail(ctx, COMMENTS)
    ctx.capture('project-comments', ['project-comments'], full=True, expect=DETAIL_READY,
                checks={'comments': ctx.s.js('document.querySelectorAll(".cp-comments-list article.cp-comment").length')})


def make_thread(ctx):
    """One comment with an @mention, one reply and a like on the comment, through the real composer."""
    s = ctx.s
    open_detail(ctx, COMMENTS)
    tap(s, '#project-comment-input'); time.sleep(.2)
    s.c.call('Input.insertText', {'text': COMMENT[0]}); time.sleep(.2)
    s.c.call('Input.insertText', {'text': COMMENT[1]}); time.sleep(.6)
    must(ctx, '.cp-comments-form:not(.cp-comments-reply-form) .cp-mention-picker', 'mention picker')
    s.key('Enter'); time.sleep(.3)
    s.c.call('Input.insertText', {'text': COMMENT[2]}); time.sleep(.2)
    tap(s, '.cp-comments > .cp-comments-form .cp-comments-submit'); time.sleep(.6)
    must(ctx, '.cp-comments-list article.cp-comment', 'posted comment')
    tap(s, '.cp-comments-list article.cp-comment [data-comment-action=reply]'); time.sleep(.4)
    must(ctx, '.cp-comments-reply-form', 'reply form')
    tap(s, '.cp-comments-reply-form textarea'); time.sleep(.2)
    s.c.call('Input.insertText', {'text': REPLY}); time.sleep(.2)
    tap(s, '.cp-comments-reply-form .cp-comments-submit'); time.sleep(.6)
    must(ctx, '.cp-comment-replies article.cp-comment', 'posted reply')
    tap(s, '.cp-comments-list > li > article.cp-comment [data-comment-action=like]'); time.sleep(.4)
    s.js('scrollTo(0,0)'); time.sleep(.4)
    ctx.act('écrire « Très clair, merci @ines », choisir Inès Morel (Entrée), compléter, Publier ; Répondre : « ' + REPLY + ' », Publier ; J’aime sur le commentaire')
    info = s.js('({comments:document.querySelectorAll(".cp-comments-list article.cp-comment").length,mention:document.querySelector(".cp-comment-mention")?.textContent||null,'
                'liked:document.querySelector(".cp-comments-list > li > article [data-comment-action=like]")?.getAttribute("aria-pressed")})')
    if info['comments'] != 2 or not info['mention'] or info['liked'] != 'true':
        raise StateError(f'thread incomplete: {info}')
    return info


def job_thread(ctx):
    info = make_thread(ctx)
    ctx.capture('project-comments-thread', ['project-comments'], full=True, expect=THREAD_OK, checks={'thread': info})


def job_comment_menu(ctx):
    info = make_thread(ctx)
    # Toggle placed at 42 % of the window height: on mobile the page is then scrolled past the back-to-top threshold
    # in every language (centred, the shorter French page stayed just under it and the Arabic one just over it).
    tap(ctx.s, '.cp-comments-list > li > article.cp-comment .cp-comment-menu-toggle', at=.42); time.sleep(.5)
    must(ctx, '.cp-comment-owner-menu:not([hidden])', 'comment menu')
    ctx.act('placer ⋮ à 42 % de la hauteur de la fenêtre puis le cliquer : menu Modifier / Supprimer / Signaler (focus conservé)')
    ctx.capture('comment-menu', ['comment-menu'], keep_focus=True, expect='Boolean(document.querySelector(".cp-comment-owner-menu:not([hidden])"))',
                checks={'thread': info, 'items': ctx.s.js('[...document.querySelectorAll(".cp-comment-owner-menu:not([hidden]) button")].map(b=>b.textContent)')})


def job_comment_sort(ctx):
    info = make_thread(ctx)
    tap(ctx.s, '.cp-comments-sort'); time.sleep(.5)
    must(ctx, '.cp-comments-toolbar .cp-control-panel:not([hidden])', 'comment sort panel')
    ctx.act('centrer puis cliquer le tri des commentaires : panneau ouvert (focus conservé)')
    ctx.capture('comments-sort-open', ['project-comments'], keep_focus=True, expect='Boolean(document.querySelector(".cp-comments-toolbar .cp-control-panel:not([hidden])"))',
                checks={'thread': info})


def job_mention(ctx):
    s = ctx.s
    open_detail(ctx, COMMENTS)
    tap(s, '#project-comment-input'); time.sleep(.2)
    s.c.call('Input.insertText', {'text': 'Bravo '}); time.sleep(.1)
    s.c.call('Input.insertText', {'text': '@in'}); time.sleep(.7)
    must(ctx, '.cp-comments > .cp-comments-form .cp-mention-picker', 'mention picker')
    ctx.act('cliquer le champ de commentaire, taper « Bravo @in » : suggestions de mention (focus conservé)')
    options = s.js('[...document.querySelectorAll(".cp-comments > .cp-comments-form .cp-mention-option")].map(o=>o.textContent)')
    ctx.capture('mention-picker', ['project-comments'], keep_focus=True, expect='Boolean(document.querySelector(".cp-comments > .cp-comments-form .cp-mention-picker:not([hidden])"))',
                checks={'options': options})


SWITCH_OPEN = 'Boolean(document.querySelector(".cp-project-section-switch[open] .cp-project-switch-panel"))'


def job_local_menu(ctx):
    open_detail(ctx, FT)
    ctx.s.click('#project-section-picker'); time.sleep(.6)
    ctx.need(SWITCH_OPEN, 'section switch open')
    ctx.act('cliquer « Dans ce projet » : sélecteur des onglets ouvert')
    ctx.capture('project-local-menu', ['project'], expect=SWITCH_OPEN)


CAMPUS_OPEN = 'Boolean(document.querySelector("dialog.cp-project-campus-dialog[open]"))'


def job_campus_choice(ctx):
    open_detail(ctx, FT)
    label = ctx.s.js('document.querySelector("#project-detail .cp-project-campus")?.textContent||null')
    ctx.s.click('#project-detail .cp-project-campus'); time.sleep(.5)
    ctx.need(CAMPUS_OPEN, 'campus choice')
    ctx.act(f'cliquer « {label} » dans la barre de la fiche : choix du campus')
    ctx.capture('campus-choice', ['campus-choice'], expect=CAMPUS_OPEN,
                checks={'items': ctx.s.js('[...document.querySelectorAll("dialog.cp-project-campus-dialog[open] button")].map(b=>b.textContent.trim())')})


REPORT_OPEN = 'Boolean(document.querySelector("dialog.cp-report-dialog[open]"))'


def job_report(ctx):
    open_detail(ctx, FT)
    ctx.s.click('#project-detail .cp-report-trigger'); time.sleep(.5)
    ctx.need(REPORT_OPEN, 'report dialog')
    ctx.act('cliquer Signaler dans la barre de la fiche')
    ctx.capture('report', ['report'], expect=REPORT_OPEN)


VIEWER_OPEN = 'Boolean(document.querySelector("dialog.media-viewer[open]"))'


def job_viewer(ctx):
    open_detail(ctx, MS)
    tap(ctx.s, '#project-detail .cp-project-lead-media .cp-project-media-open'); time.sleep(.6)
    ctx.need(VIEWER_OPEN, 'media viewer')
    ctx.s.wait('(()=>{const i=document.querySelector("dialog.media-viewer[open] img");return !i||i.complete})()', 6); time.sleep(.4)
    ctx.act('cliquer l’illustration principale de Minishell : visionneuse ouverte')
    ctx.capture('viewer', ['viewer'], expect=VIEWER_OPEN, checks={'count': ctx.s.js('document.querySelector("dialog.media-viewer .media-viewer-count")?.textContent||null')})


def S(name, fn, produces=None, formats=('desktop', 'mobile'), variants=BASIC, cost=30):
    return {'name': name, 'fn': fn, 'produces': produces or [name], 'formats': formats, 'variants': variants, 'cost': cost}


STATES = [
    S('projects', job_projects, variants=STAR),
    S('projects-list', job_list),
    S('projects-sort-open', job_sort),
    S('filter-projects', job_filter, produces=['filter-projects', 'filter-projects-expanded']),
    S('projects-last-page', job_last_page),
    S('projects-empty', job_empty),
    S('project', job_project, variants=STAR),
    S('project-single', job_single),
    S('project-implementation', tab_job('project-implementation', 'implementation')),
    S('project-media', tab_job('project-media', 'media')),
    S('project-test', job_test),
    S('project-test-saved', job_test_saved),
    S('project-comments', job_comments),
    S('project-comments-thread', job_thread, cost=40),
    S('comment-menu', job_comment_menu, cost=40),
    S('comments-sort-open', job_comment_sort, cost=40),
    S('mention-picker', job_mention, variants=BASIC + ('en-dark',)),   # 18 Oct.: layout.DARK_RENDER, English rows included
    S('project-local-menu', job_local_menu, formats=('mobile',)),
    S('campus-choice', job_campus_choice),
    S('report', job_report),
    S('viewer', job_viewer),
]
LOTS = {
    'list': ['projects', 'projects-list', 'projects-sort-open', 'filter-projects', 'projects-last-page', 'projects-empty'],
    'detail': ['project', 'project-single', 'project-implementation', 'project-media', 'project-test', 'project-test-saved'],
    'comments': ['project-comments', 'project-comments-thread', 'comment-menu', 'comments-sort-open', 'mention-picker'],
    'overlays': ['project-local-menu', 'campus-choice', 'report', 'viewer'],
    'all': [s['name'] for s in STATES],
}

if __name__ == '__main__':
    main(Runner(ZONE, 'Projets', STATES, LOTS), __doc__)
