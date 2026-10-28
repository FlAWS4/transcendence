#!/usr/bin/env python3
"""Explorer zone of the Figma rebuild (15 October 2026), variants pass: every state in FR/EN/AR x light/dark,
desktop 1440x960 and mobile 390x844 DPR 2, with the real globe (WebGL) unless stated.

Read-only on the prototype (http://127.0.0.1:8765/site/content-preview.html).
One lot per run, never two capture scripts at once; a run resumes where the previous one stopped:
    cd /home/le-rif/Bureau/Transcendence && timeout 580 python3 figma/refonte-20261015/scripts/capture_explorer.py <lot>
Options: --force (redo captured states), formats=desktop|mobile, variants=fr-light,ar-dark, only=<state,...>
    python3 .../capture_explorer.py list      (lots and progress, no Chrome)
    python3 .../capture_explorer.py sheets    (contact sheets of every state, no Chrome)

States (site-map ids of docs/site-map/site-map-data.js):
    explore ★            Monde au repos (#explore)
    explore-country      France (#explore?country=FRA)
    explore-campus       42 Paris, rues chargées (#explore?country=FRA&campus=paris)
    campus-sheet         fiche de 42 Paris (clic sur le repère du campus) ; mobile : repliée, puis
    campus-sheet-expanded  déployée par la molette (ou un glissé tactile sur la poignée)
    campus-sheet-mulhouse  fiche de 42 Mulhouse, ordinateur, FR clair et sombre
    scope-popover        « Où veux-tu aller ? » ouvert sur le Monde (+ scope-popover-list, ordinateur seulement :
                         liste native des pays, capture d’écran seule ; le sélecteur tactile mobile n’est pas dessiné)
    about-dialog         « Une nouvelle façon d’explorer »
    explore-noglobe      module du globe bloqué : message d’erreur, filtre utilisable, dé grisé
    campus-window        « Autour du campus » depuis la fiche projet Minishell (Explorer 42 Paris)
"""
import base64, json, pathlib, sys, time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from variants import Runner, StateError, STAR, BASIC, PASS, LIB, main, REF, BASE  # noqa: E402
from capture_lib import version  # noqa: E402

ZONE = 'explorer'
WORLD_HINT = {'fr': '58 campus · 30 pays', 'en': '58 campuses · 30 countries', 'ar': '58 فرعًا · 30 دولة'}
COUNTRY_HINT = {'fr': 'Choisis un campus pour t’en approcher.', 'en': 'Choose a campus to explore up close.', 'ar': 'اختر فرعًا لاستكشافه عن قرب.'}
CAMPUS_HINT = {'fr': 'Explore les alentours du campus.', 'en': 'Explore around the campus.', 'ar': 'استكشف محيط الفرع.'}
GLOBE_ERROR = {'fr': 'Le globe n’a pas pu se charger. Recharge la page pour réessayer.', 'en': 'The globe could not load. Refresh the page to try again.',
               'ar': 'تعذّر تحميل الكرة الأرضية. أعد تحميل الصفحة للمحاولة مجددًا.'}
MARKERS_JS = '[...document.querySelectorAll(".hg-marker:not([hidden])")].map(m=>m.textContent+(m.classList.contains("hg-compact")?" (point)":"")).join(" | ")'
SCOPE_JS = ('({level:document.getElementById("scope-bar")?.dataset.level||null,name:document.getElementById("scope-name")?.textContent||null,'
            'back:!document.getElementById("scope-back")?.disabled,die:document.getElementById("random-campus")?.disabled,'
            'dieTitle:document.getElementById("random-campus")?.title||null})')


def open_globe(ctx, route):
    """Real globe; a cold headless GPU occasionally fails the first preparation, so one reload is allowed."""
    for attempt in range(2):
        ctx.open(route, globe=True)
        if ctx.s.globe_ready(45):
            break
        ctx.facts['globeRetries'] = attempt + 1
        print('  globe not ready, reload', flush=True)
    else:
        raise StateError('globe never ready')
    ctx.need('document.querySelectorAll(".hg-marker:not([hidden])").length>0', 'visible markers', 25)
    ctx.act('attendre le globe prêt (canvas affiché, « Le monde se prépare… » masqué) et les repères visibles')


def wait_hint(ctx, table, seconds, stable=0.0):
    """Wait for the level hint under the globe; with stable>0 it must stay unchanged that long (campus streets)."""
    s, expected = ctx.s, table[ctx.lang]
    end, since = time.time() + seconds, None
    hint = ''
    while time.time() < end:
        hint = s.js('document.querySelector("#globe-hint")?.textContent||""')
        if hint == expected:
            since = since or time.time()
            if time.time() - since >= stable:
                return hint
        else:
            since = None
        time.sleep(.4)
    raise StateError(f'hint {hint!r} instead of {expected!r}')


def element_full(ctx, name, selector, margin):
    """Whole content of a scrolling fixed panel: the window is made as tall as the panel's content, captured,
    then restored (the map behind is laid out again at that height: reference for the panel only)."""
    s = ctx.s
    vw, vh, dpr = s.js('[innerWidth, innerHeight, devicePixelRatio]')
    sh = s.js(f'(()=>{{const d=document.querySelector({json.dumps(selector)});d.scrollTop=0;return d.scrollHeight}})()')
    height = int(sh + margin + 8)
    s.c.call('Emulation.setDeviceMetricsOverride', {'width': vw, 'height': max(height, vh), 'deviceScaleFactor': dpr, 'mobile': ctx.vp[2]})
    time.sleep(1.6)
    s.away(); time.sleep(.3)
    data = s.c.call('Page.captureScreenshot', {'format': 'png'}, timeout=90)['data']
    path = REF / ZONE / (name + '--full.png')
    path.write_bytes(base64.b64decode(data))
    s.c.call('Emulation.setDeviceMetricsOverride', {'width': vw, 'height': vh, 'deviceScaleFactor': dpr, 'mobile': ctx.vp[2]})
    time.sleep(1.2)
    return path.relative_to(BASE).as_posix()


# ------------------------------------------------------------------------------------------------ jobs

def job_explore(ctx):
    open_globe(ctx, 'explore')
    hint = wait_hint(ctx, WORLD_HINT, 15)
    time.sleep(1.2)
    ctx.act('attendre l’indication du Monde « ' + hint + ' » (globe au repos, mouvements réduits)')
    ctx.capture('explore', ['explore'], checks={'hint': hint, 'visibleMarkers': ctx.s.js(MARKERS_JS), 'scope': ctx.s.js(SCOPE_JS)})


def job_country(ctx):
    open_globe(ctx, 'explore?country=FRA')
    hint = wait_hint(ctx, COUNTRY_HINT, 30, stable=1.0)
    time.sleep(1.2)
    ctx.act('attendre la fin du vol vers la France et l’indication du niveau Pays')
    ctx.capture('explore-country', ['explore-country'], checks={'hint': hint, 'visibleMarkers': ctx.s.js(MARKERS_JS), 'scope': ctx.s.js(SCOPE_JS)})


def open_campus(ctx, campus):
    open_globe(ctx, f'explore?country=FRA&campus={campus}')
    hint = wait_hint(ctx, CAMPUS_HINT, 75, stable=2.5)
    time.sleep(1.5)
    ctx.act(f'attendre les rues autour du campus ({campus}) : indication « {hint} » stable 2,5 s')
    return hint


def job_campus(ctx):
    hint = open_campus(ctx, 'paris')
    target = ctx.s.js('(()=>{const m=document.querySelector(".hg-marker.hg-target");return m?{cls:m.className,label:m.getAttribute("aria-label"),dir:m.dataset.campusDirection||null}:null})()')
    ctx.capture('explore-campus', ['explore-campus'], checks={'hint': hint, 'target': target, 'scope': ctx.s.js(SCOPE_JS)})


SHEET_JS = ('(()=>{const d=document.querySelector("#dialog");return {open:d.open,kind:d.dataset.kind||null,expanded:d.dataset.expanded||null,'
            'title:document.querySelector("#dialog-title")?.textContent||null,logo:Boolean(d.querySelector(".campus-details-logo-image:not([hidden])")),'
            'photos:d.querySelectorAll(".campus-details-photo").length,scrollHeight:d.scrollHeight,clientHeight:d.clientHeight,scrollTop:d.scrollTop}})()')
SHEET_OPEN = 'document.querySelector("#dialog").open&&document.querySelector("#dialog").dataset.kind==="campus"'


def open_sheet(ctx, campus):
    hint = open_campus(ctx, campus)
    ctx.s.click('.hg-marker.hg-target')
    ctx.need(SHEET_OPEN, 'campus sheet open', 10)
    # Images: the logo replaces the written name once loaded; the first photo is eager.
    ctx.s.wait('[...document.querySelectorAll("#dialog img")].filter(i=>!i.closest("[hidden]")&&i.loading!=="lazy").every(i=>i.complete&&i.naturalWidth>0)', 15)
    time.sleep(1.2)
    ctx.act('cliquer le repère du campus (viseur) : la fiche s’ouvre ; attendre le logo et la première photo')
    return {'hint': hint, 'sheet': ctx.s.js(SHEET_JS)}


def job_sheet(ctx):
    checks = open_sheet(ctx, 'paris')
    if ctx.fmt == 'desktop':
        ctx.capture('campus-sheet', ['campus-sheet'], expect=SHEET_OPEN, checks=checks,
                    extra_full=lambda name: element_full(ctx, name, '#dialog', 48))
        return
    ctx.capture('campus-sheet', ['campus-sheet'], expect=SHEET_OPEN + '&&document.querySelector("#dialog").dataset.expanded!=="true"', checks=checks,
                note='Feuille mobile repliée (hauteur de repos).')
    how = expand_sheet(ctx)
    ctx.act(how)
    checks = dict(checks, sheet=ctx.s.js(SHEET_JS), expandedBy=how)
    ctx.capture('campus-sheet-expanded', ['campus-sheet'], expect=SHEET_OPEN + '&&document.querySelector("#dialog").dataset.expanded==="true"', checks=checks,
                note='Feuille mobile déployée (geste réel, sans attribut posé par script).', extra_full=lambda name: element_full(ctx, name, '#dialog', 20))


def expand_sheet(ctx):
    s = ctx.s
    box = s.rect('#dialog')
    s.c.call('Input.dispatchMouseEvent', {'type': 'mouseWheel', 'x': box['x'] + box['w'] / 2, 'y': box['y'] + 120, 'deltaX': 0, 'deltaY': 600})
    time.sleep(1.0)
    if s.js('document.querySelector("#dialog").dataset.expanded') == 'true':
        s.js('(()=>{document.querySelector("#dialog").scrollTop=0;return true})()'); time.sleep(.5)
        return 'molette de 600 px vers le bas sur la feuille : elle se déploie'
    handle = s.rect('[data-campus-sheet-handle]')
    x, y = handle['x'] + handle['w'] / 2, handle['y'] + handle['h'] / 2
    s.c.call('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
    for i in range(1, 13):
        s.c.call('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x, 'y': y - 30 * i}]}); time.sleep(.03)
    s.c.call('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    time.sleep(1.0)
    if s.js('document.querySelector("#dialog").dataset.expanded') == 'true':
        s.js('(()=>{document.querySelector("#dialog").scrollTop=0;return true})()'); time.sleep(.5)
        return 'glissé tactile de 360 px vers le haut depuis la poignée : la feuille se déploie'
    raise StateError('the mobile sheet did not expand (wheel and touch drag)')


def job_mulhouse(ctx):
    checks = open_sheet(ctx, 'mulhouse')
    ctx.capture('campus-sheet-mulhouse', ['campus-sheet'], expect=SHEET_OPEN, checks=checks,
                extra_full=lambda name: element_full(ctx, name, '#dialog', 48))


POPOVER_OPEN = '!document.querySelector("#scope-popover").hidden&&document.querySelectorAll("#scope-popover select").length===2'
POPOVER_JS = ('(()=>{const p=document.querySelector("#scope-popover");const sel=[...p.querySelectorAll("select")];return {open:!p.hidden,side:p.dataset.side||null,'
              'title:document.querySelector("#scope-popover-title")?.textContent||null,values:sel.map(x=>x.value),'
              'options:sel.map(x=>[...x.options].map(o=>o.textContent)),disabled:sel.map(x=>x.disabled)}})()')


def job_scope(ctx):
    open_globe(ctx, 'explore')
    wait_hint(ctx, WORLD_HINT, 15)
    time.sleep(.8)
    ctx.s.click('#scope-picker')
    ctx.need(POPOVER_OPEN, 'scope popover open', 8)
    time.sleep(.6)
    ctx.act('cliquer la pastille « Monde ▾ » de l’en-tête : la fenêtre « Où veux-tu aller ? » s’ouvre')
    info = ctx.s.js(POPOVER_JS)
    ctx.capture('scope-popover', ['scope-popover'], expect=POPOVER_OPEN, checks={'popover': info})
    if ctx.fmt != 'desktop':
        return  # the mobile (touch) picker of a native list is not drawn in a headless screenshot
    # The native list of the country field (drawn by Chrome itself, outside the DOM): screenshot only.
    s = ctx.s
    s.js('document.querySelector("#scope-popover select").focus()')
    r = s.rect('#scope-popover select')
    for kind in ['mousePressed', 'mouseReleased']:
        s.c.call('Input.dispatchMouseEvent', {'type': kind, 'x': r['x'] + min(24, r['w'] / 2), 'y': r['y'] + r['h'] / 2, 'button': 'left', 'clickCount': 1})
    time.sleep(1.0)
    name = f'scope-popover-list--{ctx.fmt}--{ctx.lang}-{ctx.theme}'
    s.out = REF / ZONE
    path = s.shot(name)
    rec = {'name': name, 'area': ZONE, 'viewport': path.relative_to(BASE).as_posix(), 'overflow': s.overflow(), 'errors': s.errors(),
           'state': 'scope-popover-list', 'siteMapNodes': ['scope-popover'], 'format': ctx.fmt, 'lang': ctx.lang, 'theme': ctx.theme,
           'viewportSize': list(ctx.vp), 'page': ctx.page, 'routeOpened': '#explore', 'route': s.js('location.hash'),
           'actions': ctx.actions + ['cliquer le champ Pays : Chrome ouvre sa liste native'], 'checks': {'popover': info, 'countryOptions': info['options'][0]},
           'note': 'Capture d’écran seule : la liste déroulante native est dessinée par Chrome hors du DOM (pas de relevé). '
                   'Contenu et ordre réels (voir checks.countryOptions) ; position et aspect dépendent du mode sans interface.',
           'dom': None, 'pass': PASS, 'sources': ctx.runner.sources, 'lib': LIB, 'version': version(s),
           'capturedAt': time.strftime('%Y-%m-%d %H:%M:%S')}
    s.key('Escape'); time.sleep(.3)
    ctx.runner.record(rec)


def job_about(ctx):
    open_globe(ctx, 'explore')
    wait_hint(ctx, WORLD_HINT, 15)
    time.sleep(.6)
    ctx.s.click('#about')
    ctx.need('document.querySelector("#dialog").open', 'about dialog open', 8)
    time.sleep(.8)
    ctx.act('cliquer « Exploration · 42 Horizon » : la fenêtre « Une nouvelle façon d’explorer » s’ouvre')
    info = ctx.s.js('(()=>{const d=document.querySelector("#dialog");return {kind:d.dataset.kind||"",title:document.querySelector("#dialog-title").textContent,'
                    'paragraphs:[...d.querySelectorAll(".dialog-text")].map(p=>p.textContent),link:d.querySelector("a")?.href||null}})()')
    ctx.capture('about-dialog', ['about-dialog'], expect='document.querySelector("#dialog").open', checks={'dialog': info})


def job_noglobe(ctx):
    ctx.open('explore', globe=False)
    ctx.need('!document.querySelector("#loading").hidden&&!document.querySelector("#globe canvas")&&document.querySelector("#loading").textContent===' + json.dumps(GLOBE_ERROR[ctx.lang]),
             'globe error message', 30)
    ctx.need('!document.querySelector("#scope-picker").disabled', 'scope filter usable', 15)
    time.sleep(.6)
    ctx.act('integrated-globe.mjs bloqué : attendre « ' + GLOBE_ERROR[ctx.lang] + ' » et le filtre Pays / Campus actif')
    info = ctx.s.js('({loading:document.querySelector("#loading").textContent,canvas:Boolean(document.querySelector("#globe canvas")),'
                    'die:document.querySelector("#random-campus").disabled,dieTitle:document.querySelector("#random-campus").title,picker:!document.querySelector("#scope-picker").disabled})')
    ctx.capture('explore-noglobe', ['explore-noglobe'], checks={'state': info, 'scope': ctx.s.js(SCOPE_JS)},
                note='Aperçu direct avec le module du globe bloqué : même message et même état que « Continuer sans le globe » depuis l’arrivée.')


WINDOW_OPEN = 'document.querySelector("#campus-map-dialog")?.open'


def job_window(ctx):
    route = 'projects/minishell-under-the-prompt'
    ctx.open(route, globe=True)
    if not ctx.s.globe_ready(60):
        raise StateError('globe not ready (the campus window reuses the map)')
    ctx.need('Boolean(document.querySelector("#project-detail:not([hidden]) .cp-project-campus"))', 'project page', 20)
    label = ctx.s.js('document.querySelector("#project-detail .cp-project-campus")?.textContent||null')
    ctx.s.click('#project-detail .cp-project-campus')
    ctx.need(WINDOW_OPEN, 'campus window open', 10)
    ctx.need('document.querySelector("#campus-map-status").hidden', 'neighbourhood ready', 75)
    time.sleep(2.5)
    ctx.act(f'attendre le globe prêt, cliquer « {label} » dans la barre de la fiche ; attendre les alentours chargés')
    info = ctx.s.js('(()=>{const d=document.querySelector("#campus-map-dialog");return {kicker:d.querySelector("#campus-map-kicker").textContent,'
                    'name:d.querySelector("#campus-map-name").textContent,hint:d.querySelector("#campus-map-hint")?.textContent||null,'
                    'buttons:[...d.querySelectorAll("button")].map(b=>(b.getAttribute("aria-label")||b.textContent)+(b.disabled?" (désactivé)":""))}})()')
    ctx.capture('campus-window', ['campus-window', 'project'], expect=WINDOW_OPEN, checks={'trigger': label, 'dialog': info})


def S(name, fn, produces=None, formats=('desktop', 'mobile'), variants=BASIC, cost=70):
    return {'name': name, 'fn': fn, 'produces': produces or [name], 'formats': formats, 'variants': variants, 'cost': cost}


STATES = [
    S('explore', job_explore, variants=STAR, cost=75),
    S('explore-country', job_country, variants=STAR, cost=80),   # 18 Oct.: STAR, a reference for the dark Arabic frames
    S('explore-campus', job_campus, variants=STAR, cost=110),
    S('campus-sheet', job_sheet, produces=lambda fmt: ['campus-sheet'] if fmt == 'desktop' else ['campus-sheet', 'campus-sheet-expanded'], cost=120),
    S('campus-sheet-mulhouse', job_mulhouse, formats=('desktop',), variants=('fr-light', 'fr-dark', 'en-light', 'ar-light'), cost=120),   # 18 Oct.: en and ar to bind the texts
    S('scope-popover', job_scope, produces=lambda fmt: ['scope-popover', 'scope-popover-list'] if fmt == 'desktop' else ['scope-popover'], cost=75),
    S('about-dialog', job_about, cost=75),
    S('explore-noglobe', job_noglobe, variants=STAR, cost=30),
    S('campus-window', job_window, cost=110),
]
LOTS = {
    'world': ['explore'], 'country': ['explore-country'], 'campus': ['explore-campus'],
    'sheet': ['campus-sheet', 'campus-sheet-mulhouse'], 'scope': ['scope-popover'], 'about': ['about-dialog'],
    'noglobe': ['explore-noglobe'], 'window': ['campus-window'],
    'all': [s['name'] for s in STATES],
}

if __name__ == '__main__':
    main(Runner(ZONE, 'Explorer', STATES, LOTS, restart_every=1), __doc__)
