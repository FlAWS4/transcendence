#!/usr/bin/env python3
"""Profiles zone (« Profils ») of the Figma rebuild (15 October 2026), variants pass: every state in FR/EN/AR x
light/dark, desktop 1440x960 and mobile 390x844 DPR 2. The globe module is blocked (not needed by these screens).

Read-only on the prototype (content-preview.html, same controller as index.html). One lot per run, never two
capture scripts at once; a run resumes where the previous one stopped:
    cd /home/le-rif/Bureau/Transcendence && timeout 580 python3 figma/refonte-20261015/scripts/capture_profiles.py <lot>
Options: --force, formats=desktop|mobile, variants=fr-light,ar-dark, only=<state,...>; "list" and "sheets" need no Chrome.

Profile page: Leïla Mansour (lmansour, Cadet, 42 Paris). Status examples: Inès Morel (Alumni, 42 Lyon) and
Noé Laurent (Transcender, 42 Paris). Panels that close when focus leaves them (sort) keep their focus.
"""
import json, pathlib, sys, time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from variants import Runner, StateError, STAR, BASIC, main  # noqa: E402

ZONE = 'profiles'
LEILA, NOE, INES = 'profile-leila-mansour', 'profile-noe-laurent', 'profile-ines-morel'
PROFILE = 'people/' + LEILA
FILTER_OPEN = 'Boolean(document.querySelector("#content-category-dialog[open]"))'
LIST_JS = ('({view:document.getElementById("content-index")?.dataset.view||null,count:document.getElementById("content-count")?.textContent||null,'
           'cards:document.querySelectorAll(".cp-profile-card").length,page:document.querySelector(".cp-pagination-link[aria-current=page]")?.textContent||null})')
DETAIL_JS = ('({section:document.getElementById("profile-detail")?.dataset.profileSection||null,name:document.querySelector("#profile-detail h1")?.textContent||null,'
             'density:document.querySelector(".cp-profile-sidebar")?.dataset.detailDensity||null})')


def wait_images(ctx):
    ctx.s.wait('[...document.images].every(i=>i.complete)', 8)
    time.sleep(.5)


def open_people(ctx, route='people', cards=24):
    ctx.open(route)
    ctx.need(f'document.querySelectorAll(".cp-profile-card").length==={cards}', f'{cards} profile cards', 20)
    wait_images(ctx)
    ctx.act(f'attendre l’annuaire ({cards} cartes, portraits chargés)')


def set_view(ctx, view):
    s = ctx.s
    if s.js('document.querySelector("#content-index")?.dataset.view') == view:
        return
    s.click('#content-layout-button')
    ctx.need('!document.querySelector("#content-layout-menu").hidden', 'layout menu', 5)
    s.click(f'#content-layout-menu [data-value={view}]')
    ctx.need(f'document.querySelector("#content-index")?.dataset.view==="{view}"', 'view ' + view, 6)
    time.sleep(.8)
    ctx.act('Affichage ▾ puis ' + {'list': 'Liste', 'grid': 'Grille'}[view])


def open_profile(ctx, who=LEILA, tab=None):
    ctx.open('people/' + who + (f'?tab={tab}' if tab else ''))
    ctx.need('Boolean(document.querySelector("#profile-detail:not([hidden]) .cp-profile-workspace"))', 'profile page', 20)
    ctx.need(f'document.querySelector("#profile-detail").dataset.profileSection==="{tab or "overview"}"', 'tab ' + (tab or 'overview'), 8)
    wait_images(ctx)
    ctx.act('attendre la fiche profil (portrait chargé)')


# ------------------------------------------------------------------------------------------------ directory

def job_people(ctx):
    open_people(ctx)
    ctx.capture('people', ['people'], full=True, expect='document.querySelector("#content-index").dataset.view==="grid"', checks={'list': ctx.s.js(LIST_JS)})


def job_people_list(ctx):
    open_people(ctx)
    set_view(ctx, 'list')
    ctx.capture('people-list', ['people'], full=True, expect='document.querySelector("#content-index").dataset.view==="list"', checks={'list': ctx.s.js(LIST_JS)})


def job_sort(ctx):
    open_people(ctx)
    ctx.s.click('#content-sort-button')
    ctx.need('!document.querySelector("#content-sort-menu").hidden', 'sort menu', 6); time.sleep(.4)
    ctx.act('cliquer Trier : panneau ouvert (focus sur le choix courant, conservé pendant la capture)')
    ctx.capture('people-sort-open', ['people'], keep_focus=True, expect='!document.querySelector("#content-sort-menu").hidden')


def job_filter(ctx):
    open_people(ctx)
    ctx.s.click('#content-category-button'); ctx.need(FILTER_OPEN, 'filter dialog'); time.sleep(.6)
    ctx.act('cliquer Filtrer : la fenêtre s’ouvre, catégories repliées')
    ctx.capture('filter-people', ['filter-people'], expect=FILTER_OPEN)
    d = '#content-category-dialog'
    for facet in ('status', 'arrival'):
        ctx.s.click(f'{d} [data-facet={facet}] .cp-project-filter-toggle')
        ctx.need(f'document.querySelector("{d} [data-facet={facet}] .cp-project-filter-toggle").getAttribute("aria-expanded")==="true"', facet + ' expanded', 5)
    ctx.s.click(f'{d} [data-facet=status] .cp-project-filter-all'); time.sleep(.2)
    ctx.s.click(f'{d} input[value="arrival:2024"]'); time.sleep(.2)
    ctx.need(f'document.querySelector("{d} [data-facet=arrival] .cp-project-filter-all").getAttribute("aria-pressed")==="mixed"', 'arrival mixed', 5)
    ctx.s.js('(()=>{document.querySelector("#content-category-dialog .cp-project-filter-body").scrollTop=0;return true})()'); time.sleep(.4)
    ctx.act('déplier Statut et Rentrée ; Statut : Tout sélectionner ; Rentrée : cocher 2024 seulement (sélection partielle, non appliquée)')
    pressed = ctx.s.js(f'[...document.querySelectorAll("{d} .cp-project-filter-all")].map(b=>b.getAttribute("aria-pressed"))')
    checked = ctx.s.js(f'[...document.querySelectorAll("{d} input:checked")].map(i=>i.value)')
    ctx.capture('filter-people-expanded', ['filter-people'], expect=FILTER_OPEN, checks={'bulkButtons': pressed, 'checked': checked})


def job_last_page(ctx):
    open_people(ctx, 'people?page=4', cards=6)
    ctx.capture('people-last-page', ['people'], full=True, expect='document.querySelector(".cp-pagination-link[aria-current=page]")?.textContent==="4"',
                checks={'list': ctx.s.js(LIST_JS)})


# ------------------------------------------------------------------------------------------------ profile page

def job_profile(ctx):
    open_profile(ctx)
    ctx.capture('profile', ['profile', 'profile-overview'], full=True, checks={'detail': ctx.s.js(DETAIL_JS)}, note='Leïla Mansour (lmansour), Vue d’ensemble.')


def tab_job(state, tab):
    def job(ctx):
        open_profile(ctx, tab=tab)
        ctx.capture(state, [state], full=True, checks={'detail': ctx.s.js(DETAIL_JS)})
    return job


PFILTER_OPEN = 'Boolean(document.querySelector("#profile-project-category-dialog[open]"))'


def job_projects_filter(ctx):
    open_profile(ctx, tab='projects')
    ctx.need('Boolean(document.querySelector("#profile-project-category-button"))', 'local filter button', 6)
    ctx.s.click('#profile-project-category-button')
    ctx.need(PFILTER_OPEN, 'local filter dialog', 6); time.sleep(.6)
    ctx.act('onglet Projets : cliquer son Filtrer (fenêtre Filtrer les projets, catégories repliées)')
    ctx.capture('profile-projects-filter', ['profile-projects', 'filter-projects'], expect=PFILTER_OPEN)


SWITCH_OPEN = 'document.querySelector(".cp-profile-section-switch")?.open===true'


def job_local_menu(ctx):
    open_profile(ctx)
    ctx.s.click('#profile-section-picker')
    ctx.need(SWITCH_OPEN, 'section picker open', 6); time.sleep(.5)
    ctx.act('cliquer « Dans ce profil » : sélecteur des rubriques ouvert')
    ctx.capture('profile-local-menu', ['profile'], expect=SWITCH_OPEN)


MESSAGE_OPEN = 'Boolean(document.querySelector("dialog.cp-profile-message-dialog[open]"))'


def job_message(ctx):
    open_profile(ctx)
    ctx.s.click('#profile-detail .cp-profile-message')
    ctx.need(MESSAGE_OPEN, 'message dialog', 6); time.sleep(.5)
    ctx.act('cliquer « Envoyer un message » : fenêtre ouverte, champ vide')
    ctx.capture('message-dialog', ['message-dialog'], expect=MESSAGE_OPEN)


REPORT_OPEN = 'Boolean(document.querySelector("dialog.cp-report-dialog[open]"))'


def job_report(ctx):
    open_profile(ctx)
    ctx.s.click('#profile-detail .cp-report-trigger')
    ctx.need(REPORT_OPEN, 'report dialog', 6); time.sleep(.5)
    ctx.act('cliquer Signaler dans la barre de la fiche')
    ctx.capture('report-profile', ['report'], expect=REPORT_OPEN)


def status_job(state, who, note):
    def job(ctx):
        open_profile(ctx, who=who)
        ctx.capture(state, ['profile', 'profile-overview'], full=True, checks={'detail': ctx.s.js(DETAIL_JS)}, note=note)
    return job


def S(name, fn, produces=None, formats=('desktop', 'mobile'), variants=BASIC, cost=30):
    return {'name': name, 'fn': fn, 'produces': produces or [name], 'formats': formats, 'variants': variants, 'cost': cost}


STATES = [
    S('people', job_people, variants=STAR),
    S('people-list', job_people_list),
    S('people-sort-open', job_sort),
    S('filter-people', job_filter, produces=['filter-people', 'filter-people-expanded']),
    S('people-last-page', job_last_page),
    S('profile', job_profile, variants=STAR),
    S('profile-projects', tab_job('profile-projects', 'projects')),
    S('profile-projects-filter', job_projects_filter),
    S('profile-journey', tab_job('profile-journey', 'journey')),
    S('profile-contribution', tab_job('profile-contribution', 'contribution')),
    S('profile-local-menu', job_local_menu, formats=('mobile',)),
    S('message-dialog', job_message),
    S('report-profile', job_report),
    S('profile-alumni', status_job('profile-alumni', INES, 'Inès Morel : statut Alumni (42 Lyon).'), formats=('desktop',), variants=('fr-light', 'fr-dark', 'en-light', 'ar-light')),   # 18 Oct.: en and ar to bind the texts
    S('profile-transcender', status_job('profile-transcender', NOE, 'Noé Laurent : statut Transcender (42 Paris).'), formats=('desktop',), variants=('fr-light', 'fr-dark', 'en-light', 'ar-light')),
]
LOTS = {
    'directory': ['people', 'people-list', 'people-sort-open', 'filter-people', 'people-last-page'],
    'profile': ['profile', 'profile-projects', 'profile-projects-filter', 'profile-journey', 'profile-contribution'],
    'windows': ['profile-local-menu', 'message-dialog', 'report-profile', 'profile-alumni', 'profile-transcender'],
    'all': [s['name'] for s in STATES],
}

if __name__ == '__main__':
    main(Runner(ZONE, 'Profils', STATES, LOTS), __doc__)
