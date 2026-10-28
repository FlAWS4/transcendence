#!/usr/bin/env python3
"""Shell zone of the Figma rebuild (15 October 2026), variants pass: search, account (visitor, settings, theme,
language, sign-in and sign-up dialogs, member, messages, notifications), 42 Awards, back to top and the bottom
menu on small phones, in FR/EN/AR x light/dark, desktop 1440x960 and mobile 390x844 DPR 2 (globe module blocked).

Read-only on the prototype (content-preview.html, same controller as index.html). One lot per run, never two
capture scripts at once; a run resumes where the previous one stopped:
    cd /home/le-rif/Bureau/Transcendence && timeout 580 python3 work/figma/refonte-20261015/scripts/capture_shell.py <lot>
Options: --force, formats=desktop|mobile, variants=fr-light,ar-dark, only=<state,...>; "list" and "sheets" need no Chrome.

Account panels and the search close when focus leaves them: they are captured with their focus kept.
All of them are opened from the Projects list (#projects), visitor unless "account-member" (simulated sign-in).
"""
import json, pathlib, sys, time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from variants import Runner, StateError, STAR, BASIC, main  # noqa: E402

ZONE = 'shell'
SMALL = (320, 640, True)   # small phone: the bottom menu keeps only the current label
TINY = (300, 640, True)    # very small window: icons only
READY = 'Boolean(document.querySelector(".dock-shell .dock-search-toggle-label")?.textContent&&document.getElementById("account-menu")&&document.querySelector("#profile svg, #profile img"))'
MENU_OPEN = '!document.getElementById("account-menu").hidden'
ACCOUNT_JS = ('({title:document.getElementById("account-menu-title")?.textContent||null,items:[...document.querySelectorAll("#account-menu button")].map(b=>(b.dataset.accountAction||b.dataset.accountTheme||b.dataset.accountLocale||"")+":"+b.textContent.trim()),'
              'checked:[...document.querySelectorAll("#account-menu [aria-checked=true],#account-menu [aria-pressed=true]")].map(b=>b.textContent.trim())})')


def open_projects(ctx, route='projects'):
    ctx.open(route)
    ctx.need(READY, 'application ready (dock and account)', 25)
    ctx.need('document.querySelectorAll("#content-list .cp-card").length>0', 'project list', 20)
    ctx.s.wait('[...document.images].every(i=>i.complete)', 8)
    time.sleep(.4)
    ctx.act('attendre la liste des projets, le menu du bas et le compte')


def account_panel(ctx, key, state, node, label):
    ctx.s.click(f'[data-account-action={key}]')
    ctx.need(MENU_OPEN + '&&Boolean(document.querySelector("[data-account-action=back]"))', key + ' panel', 6); time.sleep(.4)
    ctx.act(f'cliquer « {label} » dans le panneau du compte')
    ctx.capture(state, [node], keep_focus=True, expect=MENU_OPEN, checks={'panel': ctx.s.js(ACCOUNT_JS)})
    ctx.s.click('[data-account-action=back]')
    ctx.need('Boolean(document.querySelector("[data-account-action=signin]"))', 'back to the panel home', 6); time.sleep(.3)
    ctx.act('Retour : accueil du panneau')


def job_visitor(ctx):
    open_projects(ctx)
    ctx.s.click('#profile')
    ctx.need(MENU_OPEN + '&&Boolean(document.querySelector("[data-account-action=signin]"))', 'visitor panel', 6); time.sleep(.4)
    ctx.act('cliquer l’icône du compte : panneau visiteur')
    ctx.capture('account-visitor', ['account-visitor', 'g-account'], keep_focus=True, expect=MENU_OPEN, checks={'panel': ctx.s.js(ACCOUNT_JS)})
    account_panel(ctx, 'settings', 'account-settings', 'settings', 'Paramètres')
    account_panel(ctx, 'theme', 'account-theme', 'theme', 'Thème')
    account_panel(ctx, 'language', 'account-language', 'language', 'Langue')


DIALOG_OPEN = 'document.querySelector("#dialog[open]")?.dataset.kind==="{kind}"'


def job_dialogs(ctx):
    open_projects(ctx)
    for key, kind, state in [('signin', 'login', 'signin-dialog'), ('signup', 'signup', 'signup-dialog')]:
        ctx.s.click('#profile')
        ctx.need(MENU_OPEN, 'visitor panel', 6)
        ctx.s.click(f'[data-account-action={key}]')
        ctx.need(DIALOG_OPEN.format(kind=kind), kind + ' dialog', 6); time.sleep(.5)
        ctx.act(f'icône du compte puis « {"Se connecter" if key == "signin" else "Créer un compte"} » : fenêtre de {"connexion" if key == "signin" else "création de compte"} simulée')
        info = ctx.s.js('({title:document.getElementById("dialog-title")?.textContent||null,text:[...document.querySelectorAll("#dialog .dialog-text")].map(p=>p.textContent),'
                        'options:[...document.querySelectorAll("#dialog-content > button")].map(b=>b.textContent)})')
        ctx.capture(state, [state], expect=DIALOG_OPEN.format(kind=kind), checks={'dialog': info})
        ctx.s.key('Escape')
        ctx.need('!document.querySelector("#dialog[open]")', 'dialog closed', 6); time.sleep(.3)
        ctx.act('Échap : fenêtre fermée')


def sign_in(ctx):
    s = ctx.s
    s.click('#profile')
    ctx.need(MENU_OPEN, 'visitor panel', 6)
    s.click('[data-account-action=signin]')
    ctx.need(DIALOG_OPEN.format(kind='login'), 'login dialog', 6)
    s.click('#dialog-content > button.dialog-option')
    ctx.need('!document.querySelector("#dialog[open]")&&document.querySelector("#profile.account-has-avatar img")?.complete&&document.querySelector("#profile img").naturalWidth>0', 'member avatar', 10)
    time.sleep(.4)
    ctx.act('icône du compte, « Se connecter », « Continuer avec le profil » : membre simulé (Leïla Mansour)')


def job_member(ctx):
    s = ctx.s
    open_projects(ctx)
    sign_in(ctx)
    s.click('#profile')
    ctx.need(MENU_OPEN + '&&Boolean(document.querySelector(".account-identity"))', 'member panel', 6); time.sleep(.4)
    ctx.act('cliquer l’avatar : panneau du compte membre')
    ctx.capture('account-member', ['account-member', 'g-account'], keep_focus=True, expect=MENU_OPEN, checks={'panel': ctx.s.js(ACCOUNT_JS)})
    s.key('Escape'); ctx.need('document.getElementById("account-menu").hidden', 'panel closed', 6); time.sleep(.3)
    ctx.act('Échap : panneau fermé')
    for trigger, state, label in [('#account-messages', 'messages', 'Messagerie'), ('#account-notifications', 'notifications', 'Notifications')]:
        s.click(trigger)
        ctx.need(MENU_OPEN + '&&Boolean(document.querySelector(".account-empty"))', state + ' panel', 6); time.sleep(.4)
        ctx.act(f'cliquer {label} dans l’en-tête : panneau vide')
        ctx.capture(state, [state], keep_focus=True, expect=MENU_OPEN, checks={'panel': ctx.s.js(ACCOUNT_JS)})
        s.key('Escape'); ctx.need('document.getElementById("account-menu").hidden', 'panel closed', 6); time.sleep(.3)
        ctx.act('Échap : panneau fermé')


# 18 Oct., decision of the user (« relever les écrans membre »): the main screens of the member journey, after the
# simulated sign-in. The identity lives in the page's memory only, so the screens are reached inside the application
# (location.hash), never by a new page load, which would bring the visitor back.
MEMBER_SCREENS = [
    ('member-projects', 'projects', 'document.querySelectorAll("#content-list .cp-card").length===12', ['projects'], 'Liste des projets, membre'),
    ('member-project', 'projects/ft-transcendence-building-together', 'Boolean(document.querySelector("#project-detail:not([hidden]) .cp-project-workspace"))', ['project', 'project-overview'], 'ft_transcendence, membre'),
    ('member-people', 'people', 'document.querySelectorAll("#content-list .cp-card").length>0', ['people'], 'Liste des profils, membre'),
    ('member-profile', 'people/profile-leila-mansour', 'Boolean(document.querySelector("#profile-detail:not([hidden]) .cp-profile-workspace"))', ['profile', 'profile-overview'], 'Leïla Mansour, membre'),
    ('member-journal', 'journal', 'document.querySelectorAll("#content-list .cp-card").length===12', ['journal'], 'Chroniques, membre'),
    ('member-article', 'journal/journal-share-the-unfinished', 'Boolean(document.querySelector("#journal-detail .cp-project-active-section .cp-project-lead-media"))', ['article', 'article-article'], 'Chronique, membre'),
    ('member-awards', 'awards', 'document.getElementById("app").dataset.section==="awards"&&Boolean(document.querySelector(".awards-coming-soon"))', ['awards'], '42 Awards, membre'),
]


def job_member_screens(ctx):
    s = ctx.s
    open_projects(ctx)
    sign_in(ctx)
    for state, route, ready, nodes, note in MEMBER_SCREENS:
        if route != 'projects':
            s.js('location.hash=' + json.dumps('#' + route) + ';true')
        ctx.need(ready + '&&Boolean(document.querySelector("#profile.account-has-avatar img"))', state, 20)
        s.wait('[...document.images].every(i=>i.complete)', 8); s.js('window.scrollTo(0,0);true'); time.sleep(.8)
        ctx.act(f'aller à #{route} dans l’application (identité de membre conservée)')
        ctx.capture(state, nodes, full=True, checks={'member': s.js('Boolean(document.querySelector("#profile.account-has-avatar img"))')}, note=note)
    s.js('location.hash="#explore";true')
    if not s.globe_ready(60):
        raise StateError('globe not ready: explore (member)')
    ctx.need('document.getElementById("app")?.dataset.section==="explore"&&Boolean(document.querySelector("#profile.account-has-avatar img"))', 'member-explore', 20)
    time.sleep(1.5)
    ctx.act('aller à #explore dans l’application (globe, identité de membre conservée)')
    ctx.capture('member-explore', ['explore'], checks={'member': s.js('Boolean(document.querySelector("#profile.account-has-avatar img"))')}, note='Explorer · Monde, membre')


SEARCH_OPEN = 'document.querySelector(".dock-shell")?.dataset.searchOpen==="true"'


def job_search(ctx):
    s = ctx.s
    open_projects(ctx)
    s.click('.dock-search-toggle'); s.away()
    ctx.need(SEARCH_OPEN + '&&document.activeElement?.classList.contains("dock-search-input")', 'search open', 8)
    s.c.call('Input.insertText', {'text': 'Paris'})
    ctx.need('document.querySelector(".dock-search-input").value==="Paris"&&document.querySelectorAll(".dock-search-result").length>0', 'search results', 10)
    time.sleep(1.0)
    ctx.act('cliquer « Chercher dans Horizon », taper « Paris » : résultats (focus conservé dans le champ)')
    info = s.js('({count:document.querySelectorAll(".dock-search-result").length,status:document.querySelector(".dock-search-status")?.textContent||"",'
                'results:[...document.querySelectorAll(".dock-search-result")].map(r=>(r.querySelector(".dock-search-result-type")?.textContent||"")+" | "+(r.querySelector(".dock-search-result-title")?.textContent||"")),'
                'more:Boolean(document.querySelector(".dock-search-more:not([hidden])"))})')
    ctx.capture('search-open', ['g-search'], keep_focus=True, expect=SEARCH_OPEN, checks={'search': info})


def job_awards(ctx):
    ctx.open('awards')
    ctx.need('document.getElementById("app").dataset.section==="awards"&&Boolean(document.querySelector(".awards-coming-soon"))', 'awards page', 15)
    time.sleep(.6)
    ctx.act('attendre la page 42 Awards (mot AWARDS dans l’en-tête, message « à venir »)')
    ctx.capture('awards', ['awards'], full=True, checks={'note': ctx.s.js('document.querySelector(".awards-coming-soon")?.textContent||null'),
                                                          'wordmark': ctx.s.js('document.getElementById("brand-wordmark")?.dataset.wordmarkText||null')})


BACK_TOP = ('getComputedStyle(document.getElementById("back-to-top")).display!=="none"&&!document.getElementById("back-to-top").hidden'
            '&&!document.querySelector(".dock-shell").dataset.documentScrolling&&getComputedStyle(document.getElementById("back-to-top")).opacity==="1"')


def job_back_top(ctx):
    open_projects(ctx)
    ctx.s.scroll(1400)
    ctx.need(BACK_TOP, 'back to top visible', 10); time.sleep(.6)
    ctx.act('faire défiler la liste de 1400 px : bouton Remonter en haut affiché au-dessus de la recherche et du menu')
    ctx.capture('back-to-top', ['g-back-top'], expect=BACK_TOP, checks={'scrollY': ctx.s.js('scrollY'),
                                                                        'label': ctx.s.js('document.getElementById("back-to-top").getAttribute("aria-label")')})


def dock_job(state, note):
    def job(ctx):
        open_projects(ctx)
        heights = ctx.s.js('[...document.querySelectorAll("#main-nav>button[data-section]>span")].map(e=>Math.round(e.getBoundingClientRect().height*10)/10)')
        ctx.capture(state, ['g-dock', 'projects'], checks={'dockLabelHeights': heights, 'compactScope': ctx.s.js('document.getElementById("app").dataset.compactScope||null')}, note=note)
    return job


def S(name, fn, produces=None, formats=('desktop', 'mobile'), variants=BASIC, cost=30, vp=None):
    return {'name': name, 'fn': fn, 'produces': produces or [name], 'formats': formats, 'variants': variants, 'cost': cost, 'vp': vp}


STATES = [
    S('search-open', job_search),
    # 18 Oct.: en-dark too: their dark frames are built from the dark capture (layout.DARK_RENDER), the English rows included
    S('account-visitor', job_visitor, produces=['account-visitor', 'account-settings', 'account-theme', 'account-language'], cost=40, variants=BASIC + ('en-dark',)),
    S('signin-dialog', job_dialogs, produces=['signin-dialog', 'signup-dialog'], variants=BASIC + ('en-dark',)),
    S('account-member', job_member, produces=['account-member', 'messages', 'notifications'], cost=40, variants=BASIC + ('en-dark',)),
    S('awards', job_awards, variants=BASIC + ('ar-dark',)),   # 18 Oct.: a reference for the dark Arabic frames
    S('back-to-top', job_back_top, formats=('mobile',)),
    S('dock-320', dock_job('dock-320', 'Fenêtre 320 × 640 (DPR 2) : seul le libellé de la rubrique active reste sous les icônes.'),
      formats=('mobile',), variants=('fr-light', 'fr-dark', 'en-light', 'ar-light'), vp={'mobile': SMALL}),   # 18 Oct.: fr-dark for the shadow geometry of the clones; en and ar to bind the texts
    S('dock-300', dock_job('dock-300', 'Fenêtre 300 × 640 (DPR 2) : icônes seules.'), formats=('mobile',), variants=('fr-light', 'fr-dark', 'en-light', 'ar-light'), vp={'mobile': TINY}),
    # 18 Oct.: member journey of the clickable prototype pages (French, light)
    S('member-screens', job_member_screens, produces=[m[0] for m in MEMBER_SCREENS] + ['member-explore'], variants=('fr-light',), cost=120),
]
LOTS = {
    'search': ['search-open'],
    'account': ['account-visitor', 'signin-dialog', 'account-member'],
    'pages': ['awards', 'back-to-top', 'dock-320', 'dock-300'],
    'member': ['member-screens'],
    'all': [s['name'] for s in STATES],
}

if __name__ == '__main__':
    main(Runner(ZONE, 'Éléments communs et compte', STATES, LOTS), __doc__)
