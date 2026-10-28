#!/usr/bin/env python3
"""Chronicles zone (« Chroniques », route #journal) of the Figma rebuild (15 October 2026), variants pass: every state
in FR/EN/AR x light/dark, desktop 1440x960 and mobile 390x844 DPR 2. The globe module is blocked (not needed by these
screens).

Read-only on the prototype (content-preview.html, same controller as index.html). One lot per run, never two
capture scripts at once; a run resumes where the previous one stopped:
    cd /home/le-rif/Bureau/Transcendence && timeout 580 python3 figma/refonte-20261015/scripts/capture_journal.py <lot>
Options: --force, formats=desktop|mobile, variants=fr-light,ar-dark, only=<state,...>; "list" and "sheets" need no Chrome.

States are named after the site map (docs/site-map/site-map-data.js): journal (list), article (page,
default tab « Article » = site-map tab article-article), article-media, article-authors, article-comments.
Article used: « Montrer ce qui n’est pas encore fini » (journal-share-the-unfinished, 42 Tokyo), the site-map example.
It is the second card of page 1 (newest first) and the only chronicle with more than two authors (four: Inès Morel,
lead, Haru Mizuno, Luiza Costa, Caio Mendes); the first card (journal-an-evening-debugging) has a single author.
No chronicle has photos or videos: the Article and Médias tabs show the generated illustration (one item).
Comments start empty (they live in the browser tab): article-comments is that empty tab, and article-comments-thread
adds one comment with an @mention, one reply and a like through the real composer. Typed content is the same in every
language (user content, not interface copy), as in capture_projects.py.
"""
import json, pathlib, sys, time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from variants import Runner, StateError, STAR, BASIC, main, tap  # noqa: E402

ZONE = 'journal'
ARTICLE_ID = 'journal-share-the-unfinished'
ARTICLE = 'journal/' + ARTICLE_ID
COMMENT = ('Très parlant, merci ', '@ines', 'pour ce récit d’atelier.')
REPLY = 'Merci ! La prochaine démonstration arrive bientôt.'
TAB_FR = {'article': 'Article', 'media': 'Médias', 'authors': 'Auteurs', 'comments': 'Commentaires'}

LIST_READY = ('location.hash.split("?")[0]==="#journal"&&!document.getElementById("content-index")?.hidden&&'
              'document.querySelectorAll("#content-list .cp-card").length>0')
LIST_OK = ('location.hash.split("?")[0]==="#journal"&&document.querySelectorAll("#content-list .cp-card").length===12&&'
           '(document.querySelector("#content-list .cp-card a")?.getAttribute("href")||"").startsWith("#journal/")')
LIST_JS = ('({view:document.getElementById("content-index")?.dataset.view||null,count:document.getElementById("content-count")?.textContent||null,'
           'cards:document.querySelectorAll("#content-list .cp-card").length,page:document.querySelector(".cp-pagination-link[aria-current=page]")?.textContent||null,'
           'sort:document.querySelector("#content-sort-menu [aria-checked=true]")?.dataset.value||null,'
           'first:[...document.querySelectorAll("#content-list .cp-card")].slice(0,3).map(c=>c.querySelector("a")?.getAttribute("href")||null)})')
DETAIL_JS = ('(()=>{const c=document.getElementById("journal-detail"),a=c?.querySelector(".cp-project-active-section");return {'
             'title:c?.querySelector("h1")?.textContent||null,section:c?.dataset.journalSection||null,'
             'tab:c?.querySelector(".cp-project-sidebar-nav [aria-current]")?.textContent||null,'
             'facts:c?.querySelector(".cp-project-facts")?.textContent||null,campus:c?.querySelector(".cp-project-campus")?.textContent||null,'
             'figures:a?a.querySelectorAll("figure").length:0,media:a?[...a.querySelectorAll(".cp-project-media-open")].map(b=>b.dataset.mediaType):[],'
             'authors:a?[...a.querySelectorAll(".cp-author-link")].map(l=>l.title):[],'
             'comments:a?a.querySelectorAll(".cp-comments-list article.cp-comment").length:0}})()')


def on_tab(tab):
    """The chosen article is shown, on the given tab."""
    return ('Boolean(document.querySelector("#journal-detail:not([hidden]) .cp-project-workspace"))&&'
            f'location.hash.startsWith("#{ARTICLE}")&&document.getElementById("journal-detail").dataset.journalSection==="{tab}"')


ARTICLE_OK = 'Boolean(document.querySelector("#journal-detail .cp-project-active-section .cp-project-lead-media"))'
MEDIA_OK = 'document.querySelectorAll("#journal-detail .cp-project-active-section .cp-project-media-gallery figure").length>0'
AUTHORS_OK = 'document.querySelectorAll("#journal-detail .cp-project-active-section .cp-author-link").length===4'
COMMENTS_EMPTY = ('Boolean(document.querySelector("#journal-comment-input"))&&'
                  'Boolean(document.querySelector("#journal-detail .cp-comments-empty"))')
THREAD_OK = 'document.querySelectorAll("#journal-detail .cp-comments-list article.cp-comment").length===2'


def wait_images(ctx):
    ctx.s.wait('[...document.images].every(i=>i.complete)', 8)
    time.sleep(.5)


def must(ctx, selector, what, seconds=8):
    ctx.need('(()=>{const e=document.querySelector(' + json.dumps(selector) + ');if(!e)return false;const r=e.getBoundingClientRect();'
             'return r.width>0&&r.height>0&&!e.closest("[hidden]")})()', what, seconds)


def open_list(ctx):
    ctx.open('journal')
    ctx.need(LIST_READY, 'chronicle list', 20)
    wait_images(ctx)
    ctx.act('attendre la liste des chroniques (cartes et portraits chargés)')


def open_article(ctx, tab='article'):
    ctx.open(ARTICLE + ('' if tab == 'article' else f'?tab={tab}'))
    ctx.need(on_tab(tab), f'article page, tab {tab}', 20)
    wait_images(ctx)
    ctx.act('attendre la chronique « Montrer ce qui n’est pas encore fini » (onglet ' + TAB_FR[tab] + ', images chargées)')


# ------------------------------------------------------------------------------------------------ list

def job_journal(ctx):
    open_list(ctx)
    ctx.capture('journal', ['journal'], full=True, expect=LIST_OK, checks={'list': ctx.s.js(LIST_JS)},
                note='Page 1, tri par défaut (plus récentes d’abord), vue Grille.')


# ------------------------------------------------------------------------------------------------ article page

def job_article(ctx):
    open_article(ctx)
    ctx.capture('article', ['article', 'article-article'], full=True, expect=on_tab('article') + '&&' + ARTICLE_OK,
                checks={'detail': ctx.s.js(DETAIL_JS)},
                note='« Montrer ce qui n’est pas encore fini » (42 Tokyo, quatre auteurs), onglet Article.')


def tab_job(state, tab, ready):
    def job(ctx):
        open_article(ctx, tab)
        ctx.capture(state, [state], full=True, expect=on_tab(tab) + '&&' + ready, checks={'detail': ctx.s.js(DETAIL_JS)})
    return job


def job_thread(ctx):
    """One comment with an @mention, one reply and a like on the comment, through the real composer."""
    s = ctx.s
    open_article(ctx, 'comments')
    d = '#journal-detail '
    tap(s, '#journal-comment-input'); time.sleep(.2)
    s.c.call('Input.insertText', {'text': COMMENT[0]}); time.sleep(.2)
    s.c.call('Input.insertText', {'text': COMMENT[1]}); time.sleep(.6)
    must(ctx, d + '.cp-comments-form:not(.cp-comments-reply-form) .cp-mention-picker', 'mention picker')
    s.key('Enter'); time.sleep(.3)
    s.c.call('Input.insertText', {'text': COMMENT[2]}); time.sleep(.2)
    tap(s, d + '.cp-comments > .cp-comments-form .cp-comments-submit'); time.sleep(.6)
    must(ctx, d + '.cp-comments-list article.cp-comment', 'posted comment')
    tap(s, d + '.cp-comments-list article.cp-comment [data-comment-action=reply]'); time.sleep(.4)
    must(ctx, d + '.cp-comments-reply-form', 'reply form')
    tap(s, d + '.cp-comments-reply-form textarea'); time.sleep(.2)
    s.c.call('Input.insertText', {'text': REPLY}); time.sleep(.2)
    tap(s, d + '.cp-comments-reply-form .cp-comments-submit'); time.sleep(.6)
    must(ctx, d + '.cp-comment-replies article.cp-comment', 'posted reply')
    tap(s, d + '.cp-comments-list > li > article.cp-comment [data-comment-action=like]'); time.sleep(.4)
    s.js('scrollTo(0,0)'); time.sleep(.4)
    ctx.act('écrire « Très parlant, merci @ines », choisir Inès Morel (Entrée), compléter, Publier ; Répondre : « ' + REPLY + ' », Publier ; J’aime sur le commentaire')
    info = s.js('({comments:document.querySelectorAll("#journal-detail .cp-comments-list article.cp-comment").length,'
                'mention:document.querySelector("#journal-detail .cp-comment-mention")?.textContent||null,'
                'liked:document.querySelector("#journal-detail .cp-comments-list > li > article [data-comment-action=like]")?.getAttribute("aria-pressed")})')
    if info['comments'] != 2 or not info['mention'] or info['liked'] != 'true':
        raise StateError(f'thread incomplete: {info}')
    ctx.capture('article-comments-thread', ['article-comments'], full=True, expect=on_tab('comments') + '&&' + THREAD_OK,
                checks={'thread': info, 'detail': ctx.s.js(DETAIL_JS)},
                note='Commentaire, réponse et J’aime ajoutés pour la capture : les commentaires démarrent vides.')


def S(name, fn, produces=None, formats=('desktop', 'mobile'), variants=BASIC, cost=30):
    return {'name': name, 'fn': fn, 'produces': produces or [name], 'formats': formats, 'variants': variants, 'cost': cost}


STATES = [
    S('journal', job_journal, variants=STAR),
    S('article', job_article, variants=STAR),
    S('article-media', tab_job('article-media', 'media', MEDIA_OK)),
    S('article-authors', tab_job('article-authors', 'authors', AUTHORS_OK)),
    S('article-comments', tab_job('article-comments', 'comments', COMMENTS_EMPTY)),
    S('article-comments-thread', job_thread, cost=40),
]
LOTS = {
    'list': ['journal'],
    'article': ['article', 'article-media', 'article-authors', 'article-comments'],
    'thread': ['article-comments-thread'],
    'all': [s['name'] for s in STATES],
}

if __name__ == '__main__':
    main(Runner(ZONE, 'Chroniques', STATES, LOTS), __doc__)
