#!/usr/bin/env python3
"""Explorer zone of the Figma rebuild (15 October 2026): reference screenshots, layout dumps and globe assets.

Read-only on the prototype (http://127.0.0.1:8765/work/visualizations/horizon-welcome/). Every state is a
fresh page load (about:blank in between, storage cleared) because two routes of the same page differ only
by their hash and would otherwise not reload. One lot per run, never two capture scripts at once:

    cd /home/le-rif/Bureau/Transcendence && timeout 580 python3 work/figma/refonte-20261015/scripts/capture_explorer.py <lot>

Lots (each well under 9 minutes, Chrome slot wait included):
    world        Explorer · Monde au repos : ordinateur/mobile FR clair+sombre, ordinateur EN clair
    world-ar     Explorer · Monde en arabe : ordinateur/mobile, clair+sombre
    country      Explorer · Pays (France) : ordinateur/mobile, clair+sombre
    campus       Explorer · Campus (42 Paris, rues chargées) : ordinateur/mobile, clair+sombre ; flèche de bord
    sheet-paris  Fiche campus Paris : ordinateur FR clair+sombre, ordinateur AR sombre (+ contenu complet)
    sheet-others Fiche campus Mulhouse (4 photos) et Lyon (sans données) : ordinateur FR clair (+ contenu complet)
    sheet-mobile Fiche campus Paris mobile : repliée et déployée, clair+sombre (+ contenu complet déployé)
    scope        « Où veux-tu aller ? » : ordinateur/mobile clair+sombre, ordinateur AR clair, France choisie,
                 listes natives ouvertes (ordinateur)
    about        « Une nouvelle façon d’explorer » : ordinateur/mobile clair ; Explorer sans le globe (arrivée,
                 module bloqué, Continuer sans le globe) : ordinateur/mobile clair
    window       « Autour du campus » depuis la fiche projet Minishell (Explorer 42 Paris) : ordinateur/mobile,
                 clair+sombre
    assets       PNG transparents 2x : globe Monde (ordinateur/mobile, clair/sombre), globe Pays France
                 (ordinateur clair/sombre), médaillon de contexte des rubriques (clair/sombre)
"""
import base64, io, json, pathlib, signal, sys, time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from capture_lib import *  # noqa: E402,F401  (start, open_app, snap, write_index, contact_sheet, DESKTOP, MOBILE, BASE, REF, DOM)

AREA = 'explorer'
FORMATS = {'desktop': DESKTOP, 'mobile': MOBILE}
ASSETS = BASE / 'assets' / 'globe'
SHEETS = DOM / AREA / '_sheets'
EXPECTED_VERSION = {'content-preview.html': 'design-review-selection.css?v=1 content-preview.mjs?v=113 design-review-selection.mjs?v=1',
                    'index.html': 'design-review-selection.css?v=1 welcome.mjs?v=audit-fixes-146 design-review-selection.mjs?v=1'}
COUNTRY_HINT = {'fr': 'Choisis un campus pour t’en approcher.', 'en': 'Choose a campus to explore up close.', 'ar': 'اختر فرعًا لاستكشافه عن قرب.'}
CAMPUS_HINT = {'fr': 'Explore les alentours du campus.', 'en': 'Explore around the campus.', 'ar': 'استكشف محيط الفرع.'}
WORLD_HINT = {'fr': '58 campus · 30 pays', 'en': '58 campuses · 30 countries', 'ar': '58 فرعًا · 30 دولة'}
GLOBE_ERROR = {'fr': 'Le globe n’a pas pu se charger. Recharge la page pour réessayer.'}

# A capture killed by `timeout` must still close its Chrome (finally blocks run on SystemExit).
signal.signal(signal.SIGTERM, lambda *_: sys.exit(143))


def state(screen, fmt, lang, theme):
    return f'{screen}--{fmt}--{lang}-{theme}'


def fresh(s):
    """Leave the current page through about:blank after clearing its storage, so the next open is a real load."""
    try:
        s.js('(()=>{try{localStorage.clear();sessionStorage.clear()}catch(e){};return true})()')
    except Exception:
        pass
    s.c.call('Page.navigate', {'url': 'about:blank'})
    time.sleep(.6)


def html_state(s):
    return s.js('({theme:document.documentElement.dataset.theme,lang:document.documentElement.lang,dir:document.documentElement.dir,'
                'entry:document.body.dataset.entry,section:document.getElementById("app").dataset.section,hash:location.hash})')


def ensure_locale(s, theme, lang):
    got = html_state(s)
    if got['theme'] != theme or got['lang'] != lang:
        s.settings(lang, theme)
        time.sleep(1.0)
        got = html_state(s)
    return got


def resources(s):
    """Versions of the modules really loaded (the controller is imported by content-preview.mjs, not a tag)."""
    try:
        return s.js('performance.getEntriesByType("resource").map(e=>e.name.split("/").pop()).filter(n=>/^(welcome|integrated-globe|campus-details|campus-map-dialog|scope-popover|scope-selectors|globe-style|campus-direction|design-review-selection|entrance)\\.(mjs|css)/.test(n))')
    except Exception as error:
        return [f'unreadable: {error}']


def open_explore(s, route, fmt, theme, lang, tries=3):
    """Real globe (WebGL); retried on a cold headless GPU."""
    for attempt in range(tries):
        fresh(s)
        open_app(s, route, FORMATS[fmt], theme=theme, lang=lang, block_globe=False)
        if s.globe_ready(40):
            break
        print(f'  globe not ready, retry {attempt + 1}', flush=True)
    else:
        raise RuntimeError('globe never ready for ' + route)
    got = ensure_locale(s, theme, lang)
    s.wait('document.querySelectorAll(".hg-marker:not([hidden])").length>0', 25)
    time.sleep(1.0)
    return got


def wait_hint(s, expected, seconds=45):
    end = time.time() + seconds
    text = ''
    while time.time() < end:
        text = s.js('document.querySelector("#globe-hint")?.textContent||""')
        if text == expected:
            return True, text
        time.sleep(.5)
    return False, text


class Lot:
    def __init__(self, name):
        self.name = name
        self.records = []
        self.first_version = None

    def add(self, rec, screen, fmt, lang, theme, route, checks=None, notes=None, page='content-preview.html'):
        rec.update({'siteMapNode': screen, 'format': fmt, 'lang': lang, 'theme': theme, 'route': '#' + route if route else '',
                    'page': page, 'lot': self.name, 'capturedAt': time.strftime('%Y-%m-%d %H:%M:%S')})
        if checks:
            rec['checks'] = checks
        if notes:
            rec['notes'] = notes
        expected = EXPECTED_VERSION.get(page)
        if expected and rec.get('version') != expected:
            rec['versionChanged'] = True
            print(f'  ! VERSION CHANGED: {rec.get("version")} (expected {expected})', flush=True)
        self.records.append(rec)
        write_index(AREA, [rec], extra={'zone': 'Explorer', 'expectedVersion': EXPECTED_VERSION})
        print(f'  ok {rec["name"]} nodes={rec.get("nodes")} overflow={rec.get("overflow")} errors={len(rec.get("errors") or [])}', flush=True)
        return rec

    def sheet(self):
        paths = [REF / AREA / pathlib.Path(r['viewport']).name for r in self.records if r.get('viewport')]
        if paths:
            out = contact_sheet(paths, SHEETS / f'{self.name}.png', cols=3 if any('desktop' in p.name for p in paths) else 4)
            print('sheet', out, flush=True)


def snap_state(s, lot, screen, fmt, lang, theme, route, checks=None, notes=None, suffix='', page='content-preview.html', full=False):
    nm = state(screen + (('-' + suffix) if suffix else ''), fmt, lang, theme)
    meta = {'siteMapNode': screen, 'route': route, 'checks': checks, 'resources': resources(s)}
    rec = snap(s, AREA, nm, full=full, meta=meta)
    return lot.add(rec, screen, fmt, lang, theme, route, checks, notes, page)


def shot_only(s, lot, nm, screen, fmt, lang, theme, route, checks=None, notes=None):
    """Screenshot without blur/away (a native list or a focus ring would be closed or hidden by snap)."""
    folder = REF / AREA
    folder.mkdir(parents=True, exist_ok=True)
    s.out = folder
    path = s.shot(nm)
    rec = {'name': nm, 'area': AREA, 'viewport': path.relative_to(BASE).as_posix(), 'overflow': s.overflow(),
           'errors': s.errors(), 'version': version(s)}
    return lot.add(rec, screen, fmt, lang, theme, route, checks, notes)


def element_full(s, nm, selector, margin):
    """Whole content of a scrolling fixed panel: the window is made as tall as the panel's content, captured,
    then restored. The map behind is laid out again at that height (reference for the panel only)."""
    vw, vh, dpr = s.js('[innerWidth, innerHeight, devicePixelRatio]')
    mobile = s.vp[2]
    sh = s.js(f'(()=>{{const d=document.querySelector({json.dumps(selector)});d.scrollTop=0;return d.scrollHeight}})()')
    height = int(sh + margin + 8)
    s.c.call('Emulation.setDeviceMetricsOverride', {'width': vw, 'height': max(height, vh), 'deviceScaleFactor': dpr, 'mobile': mobile})
    time.sleep(1.6)
    left = s.js(f'(()=>{{const d=document.querySelector({json.dumps(selector)});return d.scrollHeight-d.clientHeight}})()')
    s.away(); s.blur(); time.sleep(.3)
    data = s.c.call('Page.captureScreenshot', {'format': 'png'}, timeout=90)['data']
    path = REF / AREA / (nm + '--full.png')
    path.write_bytes(base64.b64decode(data))
    s.c.call('Emulation.setDeviceMetricsOverride', {'width': vw, 'height': vh, 'deviceScaleFactor': dpr, 'mobile': mobile})
    time.sleep(1.2)
    return path.relative_to(BASE).as_posix(), {'panelScrollHeight': sh, 'captureHeight': max(height, vh), 'remainingScroll': left}


# ---------------------------------------------------------------- lots

def lot_world(s, lot, combos):
    for fmt, lang, theme in combos:
        got = open_explore(s, 'explore', fmt, theme, lang)
        ok, hint = wait_hint(s, WORLD_HINT[lang], 10)
        markers = s.js('[...document.querySelectorAll(".hg-marker:not([hidden])")].map(m=>m.textContent+(m.classList.contains("hg-compact")?" (point)":"")).join(" | ")')
        snap_state(s, lot, 'explore', fmt, lang, theme, 'explore', checks={'html': got, 'hint': hint, 'hintOk': ok, 'visibleMarkers': markers})


def lot_country(s, lot):
    for fmt, theme in [('desktop', 'light'), ('desktop', 'dark'), ('mobile', 'light'), ('mobile', 'dark')]:
        got = open_explore(s, 'explore?country=FRA', fmt, theme, 'fr')
        ok, hint = wait_hint(s, COUNTRY_HINT['fr'], 20)
        time.sleep(1.0)
        markers = s.js('[...document.querySelectorAll(".hg-marker:not([hidden])")].map(m=>m.textContent+(m.classList.contains("hg-compact")?" (point)":"")).join(" | ")')
        snap_state(s, lot, 'explore-country', fmt, 'fr', theme, 'explore?country=FRA',
                   checks={'html': got, 'hint': hint, 'hintOk': ok, 'visibleMarkers': markers, 'backEnabled': s.js('!document.querySelector("#scope-back").disabled')})


def open_campus(s, campus, fmt, theme, lang):
    route = f'explore?country=FRA&campus={campus}'
    got = open_explore(s, route, fmt, theme, lang)
    ok, hint = wait_hint(s, CAMPUS_HINT[lang], 50)
    time.sleep(2.5)
    return route, got, ok, hint


def lot_campus(s, lot):
    for fmt, theme in [('desktop', 'light'), ('desktop', 'dark'), ('mobile', 'light'), ('mobile', 'dark')]:
        route, got, ok, hint = open_campus(s, 'paris', fmt, theme, 'fr')
        target = s.js('(()=>{const m=document.querySelector(".hg-marker.hg-target");return m?{cls:m.className,dir:m.dataset.campusDirection||null}:null})()')
        snap_state(s, lot, 'explore-campus', fmt, 'fr', theme, route, checks={'html': got, 'hint': hint, 'streetsReady': ok, 'target': target},
                   notes=None if ok else 'Rues non prêtes au moment de la capture (statut affiché ci-dessus).')
    # Edge arrow: pan the map until the campus leaves the inner frame (keyboard arrows on the focused globe).
    route, got, ok, hint = open_campus(s, 'paris', 'desktop', 'light', 'fr')
    s.js('document.getElementById("globe").focus({preventScroll:true})')
    for _ in range(9):
        s.key('ArrowDown')
    time.sleep(1.2)
    target = s.js('(()=>{const m=document.querySelector(".hg-marker.hg-target");return m?{cls:m.className,dir:m.dataset.campusDirection||null,label:m.getAttribute("aria-label"),placement:m.dataset.labelPlacement||null}:null})()')
    snap_state(s, lot, 'explore-campus', 'desktop', 'fr', 'light', route, suffix='offscreen',
               checks={'html': got, 'streetsReady': ok, 'target': target},
               notes='Carte déplacée au clavier (9 × Flèche bas, 70 px chacun) jusqu’à la flèche de bord qui recentre le campus.')


def open_sheet(s, campus, fmt, theme, lang):
    route, got, ok, hint = open_campus(s, campus, fmt, theme, lang)
    s.click('.hg-marker.hg-target')
    opened = s.wait('document.querySelector("#dialog").open&&document.querySelector("#dialog").dataset.kind==="campus"', 10)
    # Wait for the images (logo hides the written name once loaded; first photo eager).
    s.wait('[...document.querySelectorAll("#dialog img")].filter(i=>!i.closest("[hidden]")).every(i=>i.complete&&i.naturalWidth>0)', 15)
    time.sleep(1.2)
    info = s.js('(()=>{const d=document.querySelector("#dialog");return {open:d.open,kind:d.dataset.kind,expanded:d.dataset.expanded||null,'
                'logo:Boolean(d.querySelector(".campus-details-logo-image:not([hidden])")),photos:d.querySelectorAll(".campus-details-photo").length,'
                'status:d.querySelector(".campus-details-photo-status")?.textContent||null,scrollHeight:d.scrollHeight,clientHeight:d.clientHeight}})()')
    return route, {'html': got, 'streetsReady': ok, 'hint': hint, 'sheet': info, 'opened': opened}


def lot_sheet(s, lot, combos, full=True):
    for campus, fmt, theme, lang in combos:
        route, checks = open_sheet(s, campus, fmt, theme, lang)
        suffix = '' if campus == 'paris' else campus
        rec = snap_state(s, lot, 'campus-sheet', fmt, lang, theme, route, checks=checks, suffix=suffix)
        if full:
            rel, info = element_full(s, rec['name'], '#dialog', 48)
            rec['full'] = rel
            rec.setdefault('checks', {})['full'] = info
            write_index(AREA, [rec])


def lot_sheet_mobile(s, lot):
    for theme in ['light', 'dark']:
        route, checks = open_sheet(s, 'paris', 'mobile', theme, 'fr')
        snap_state(s, lot, 'campus-sheet', 'mobile', 'fr', theme, route, checks=checks, suffix='collapsed')
        box = s.rect('#dialog')
        s.c.call('Input.dispatchMouseEvent', {'type': 'mouseWheel', 'x': box['x'] + box['w'] / 2, 'y': box['y'] + 120, 'deltaX': 0, 'deltaY': 600})
        time.sleep(.6)
        expanded = s.js('document.querySelector("#dialog").dataset.expanded')
        how = 'molette (600 px vers le bas), comme le geste réel'
        if expanded != 'true':
            s.js('document.querySelector("#dialog").dataset.expanded="true"')
            how = 'attribut data-expanded posé par script (la molette simulée n’a pas suffi)'
            time.sleep(.6)
        s.js('document.querySelector("#dialog").scrollTop=0')
        time.sleep(.6)
        checks2 = dict(checks, expandedBy=how, sheetBox=s.rect('#dialog'))
        rec = snap_state(s, lot, 'campus-sheet', 'mobile', 'fr', theme, route, checks=checks2, suffix='expanded')
        rel, info = element_full(s, rec['name'], '#dialog', 20)
        rec['full'] = rel
        rec['checks']['full'] = info
        write_index(AREA, [rec])


def open_popover(s):
    s.click('#scope-picker')
    s.wait('!document.querySelector("#scope-popover").hidden&&document.querySelectorAll("#scope-popover select").length===2', 8)
    time.sleep(.5)
    return s.js('(()=>{const p=document.querySelector("#scope-popover");const sel=[...p.querySelectorAll("select")];return {open:!p.hidden,side:p.dataset.side||null,'
                'values:sel.map(x=>x.value),options:sel.map(x=>x.options.length),focused:document.activeElement?.id||document.activeElement?.tagName}})()')


def click_center(s, selector):
    r = s.rect(selector)
    for kind in ['mousePressed', 'mouseReleased']:
        s.c.call('Input.dispatchMouseEvent', {'type': kind, 'x': r['x'] + min(24, r['w'] / 2), 'y': r['y'] + r['h'] / 2, 'button': 'left', 'clickCount': 1})
    time.sleep(1.0)


def lot_scope(s, lot):
    for fmt, theme, lang in [('desktop', 'light', 'fr'), ('desktop', 'dark', 'fr'), ('mobile', 'light', 'fr'), ('mobile', 'dark', 'fr'), ('desktop', 'light', 'ar')]:
        got = open_explore(s, 'explore', fmt, theme, lang)
        info = open_popover(s)
        snap_state(s, lot, 'scope-popover', fmt, lang, theme, 'explore', checks={'html': got, 'popover': info})
        if fmt == 'desktop' and lang == 'fr':
            # Native list of the country field, as drawn by headless Chrome (position is an artefact, see spec).
            s.js('document.querySelector("#scope-popover select").focus()')
            click_center(s, '#scope-popover select')
            shot_only(s, lot, state('scope-popover-list-pays', fmt, lang, theme), 'scope-popover', fmt, lang, theme, 'explore',
                      checks={'html': got}, notes='Liste native du champ Pays dessinée par Chrome sans interface : contenu et ordre réels ; '
                      'sa position (collée en haut de la fenêtre, au-dessus du champ) vient de l’écran virtuel 800 × 600 du mode sans interface.')
            s.key('Escape'); time.sleep(.4)
    # France chosen in the first field: the second field lists the French campuses, the globe flies to France.
    got = open_explore(s, 'explore', 'desktop', 'light', 'fr')
    open_popover(s)
    s.js('(()=>{const sel=document.querySelector("#scope-popover select");sel.value="FRA";sel.dispatchEvent(new Event("change",{bubbles:true}));return true})()')
    ok, hint = wait_hint(s, COUNTRY_HINT['fr'], 20)
    time.sleep(1.5)
    info = s.js('(()=>{const p=document.querySelector("#scope-popover");const sel=[...p.querySelectorAll("select")];return {open:!p.hidden,values:sel.map(x=>x.value),campusOptions:[...sel[1].options].map(o=>o.textContent)}})()')
    snap_state(s, lot, 'scope-popover', 'desktop', 'fr', 'light', 'explore?country=FRA', suffix='france', checks={'html': got, 'hint': hint, 'popover': info},
               notes='Pays choisi par le premier champ (événement change, comme une sélection) : la fenêtre reste ouverte, le globe rejoint la France.')
    s.js('document.querySelectorAll("#scope-popover select")[1].focus()')
    click_center(s, '#scope-popover .scope-field:nth-child(2) select')
    shot_only(s, lot, state('scope-popover-list-campus', 'desktop', 'fr', 'light'), 'scope-popover', 'desktop', 'fr', 'light', 'explore?country=FRA',
              checks={'popover': info}, notes='Liste native du champ Campus (France choisie) dessinée par Chrome sans interface ; même réserve de position.')
    s.key('Escape')


def lot_about(s, lot):
    for fmt in ['desktop', 'mobile']:
        got = open_explore(s, 'explore', fmt, 'light', 'fr')
        s.click('#about')
        opened = s.wait('document.querySelector("#dialog").open', 8)
        time.sleep(.8)
        info = s.js('(()=>{const d=document.querySelector("#dialog");return {open:d.open,kind:d.dataset.kind||"",title:document.querySelector("#dialog-title").textContent,'
                    'paragraphs:[...d.querySelectorAll(".dialog-text")].map(p=>p.textContent),link:d.querySelector(".network-source")?.href||null}})()')
        snap_state(s, lot, 'about-dialog', fmt, 'fr', 'light', 'explore', checks={'html': got, 'dialog': info, 'opened': opened})
    for fmt in ['desktop', 'mobile']:
        fresh(s)
        open_app(s, 'explore', FORMATS[fmt], entrance=True, block_globe=True)
        time.sleep(1.0)
        s.click('#entry-guest')
        error = s.wait('document.body.dataset.entry==="error"', 45)
        buttons = s.js('[...document.querySelectorAll("#entrance-access button")].map(b=>b.textContent)')
        s.click('#entrance-access button:nth-of-type(3)')
        opened = s.wait('document.body.dataset.entry==="welcome"', 20)
        time.sleep(1.5)
        info = s.js('({loading:document.querySelector("#loading").textContent,loadingHidden:document.querySelector("#loading").hidden,'
                    'canvas:Boolean(document.querySelector("#globe canvas")),die:document.querySelector("#random-campus").disabled,'
                    'pickerDisabled:document.querySelector("#scope-picker").disabled})')
        snap_state(s, lot, 'explore-noglobe', fmt, 'fr', 'light', 'explore', page='index.html',
                   checks={'html': html_state(s), 'errorPhase': error, 'errorButtons': buttons, 'welcome': opened, 'state': info},
                   notes='Arrivée (index.html) avec integrated-globe.mjs bloqué : Visiter → « Le monde n’a pas pu se préparer. » → Continuer sans le globe.')


def lot_window(s, lot):
    route = 'projects/minishell-under-the-prompt'
    for fmt, theme in [('desktop', 'light'), ('desktop', 'dark'), ('mobile', 'light'), ('mobile', 'dark')]:
        fresh(s)
        open_app(s, route, FORMATS[fmt], theme=theme, lang='fr', block_globe=False)
        ready = s.globe_ready(50)
        got = ensure_locale(s, theme, 'fr')
        label = s.js('document.querySelector(".cp-project-campus")?.textContent||null')
        s.click('.cp-project-campus')
        opened = s.wait('document.querySelector("#campus-map-dialog")?.open', 10)
        arrived = s.wait('document.querySelector("#campus-map-status").hidden', 50)
        time.sleep(2.5)
        info = s.js('(()=>{const d=document.querySelector("#campus-map-dialog");return {open:d.open,kicker:d.querySelector("#campus-map-kicker").textContent,'
                    'name:d.querySelector("#campus-map-name").textContent,hint:d.querySelector("#campus-map-hint").textContent,'
                    'status:d.querySelector("#campus-map-status").hidden?"ready":d.querySelector("#campus-map-status").textContent,'
                    'buttons:[...d.querySelectorAll(".globe-controls button")].map(b=>b.getAttribute("aria-label")+(b.disabled?" (désactivé)":""))}})()')
        snap_state(s, lot, 'campus-window', fmt, 'fr', theme, route, checks={'html': got, 'globeReady': ready, 'trigger': label, 'opened': opened, 'arrived': arrived, 'dialog': info},
                   notes=None if arrived else 'Quartier non prêt au moment de la capture (statut visible).')


# ---------------------------------------------------------------- globe assets

HIDE_CSS = ('html,body{background:transparent!important}body *{visibility:hidden!important}'
            '#globe,#globe *{visibility:visible!important}#globe .hg-pin{display:none!important}'
            '#globe>.hg-map::after{display:none!important;content:none!important}.atmosphere{display:none!important}')


def force_dpr2(s):
    def viewport(w, h, mobile=False):
        s.c.call('Emulation.setDeviceMetricsOverride', {'width': w, 'height': h, 'deviceScaleFactor': 2, 'mobile': mobile})
        s.c.call('Emulation.setTouchEmulationEnabled', {'enabled': mobile, 'maxTouchPoints': 5 if mobile else 1})
    s.viewport = viewport


def export_png(s, name, clip=None):
    """Only the WebGL canvas, on a transparent page; cropped to its opaque pixels (or to clip, in CSS px)."""
    from PIL import Image
    s.js('(()=>{const st=document.createElement("style");st.id="figma-globe-export";st.textContent=' + json.dumps(HIDE_CSS) + ';document.head.append(st);return true})()')
    s.c.call('Emulation.setDefaultBackgroundColorOverride', {'color': {'r': 0, 'g': 0, 'b': 0, 'a': 0}})
    s.away(); time.sleep(1.2)
    params = {'format': 'png'}
    if clip:
        params['clip'] = {**clip, 'scale': 1}
    data = s.c.call('Page.captureScreenshot', params, timeout=90)['data']
    s.c.call('Emulation.setDefaultBackgroundColorOverride', {})
    s.js('(()=>{document.getElementById("figma-globe-export")?.remove();return true})()')
    im = Image.open(io.BytesIO(base64.b64decode(data))).convert('RGBA')
    dpr = s.js('devicePixelRatio')
    alpha = im.getchannel('A')
    full_hist = alpha.histogram()
    transparent_share = full_hist[0] / (im.width * im.height)
    box = alpha.getbbox() if not clip else (0, 0, im.width, im.height)
    if not box:
        raise RuntimeError('empty export ' + name)
    pad = 4 if not clip else 0
    box = (max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad))
    crop = im.crop(box)
    ASSETS.mkdir(parents=True, exist_ok=True)
    path = ASSETS / (name + '.png')
    crop.save(path, optimize=True)
    a = crop.getchannel('A')
    w, h = crop.size
    corners = [a.getpixel((0, 0)), a.getpixel((w - 1, 0)), a.getpixel((0, h - 1)), a.getpixel((w - 1, h - 1))]
    hist = a.histogram()
    info = {'file': path.relative_to(BASE).as_posix(), 'pixels': [w, h], 'devicePixelRatio': dpr,
            'cssBox': [round((box[0] + (clip or {}).get('x', 0) * dpr) / dpr, 2), round((box[1] + (clip or {}).get('y', 0) * dpr) / dpr, 2), round(w / dpr, 2), round(h / dpr, 2)],
            'corners_alpha': corners, 'center_alpha': a.getpixel((w // 2, h // 2)),
            'share_transparent_in_crop': round(hist[0] / (w * h), 4), 'share_opaque_in_crop': round(hist[255] / (w * h), 4),
            'share_transparent_in_frame': round(transparent_share, 4), 'bytes': path.stat().st_size}
    print('  asset', json.dumps(info), flush=True)
    return info


def lot_assets(s, lot):
    force_dpr2(s)
    out = {}
    for fmt, theme in [('desktop', 'light'), ('desktop', 'dark'), ('mobile', 'light'), ('mobile', 'dark')]:
        got = open_explore(s, 'explore', fmt, theme, 'fr')
        time.sleep(1.0)
        info = export_png(s, f'globe-monde--{fmt}--{theme}')
        info.update({'route': '#explore', 'viewport': list(FORMATS[fmt][:2]), 'html': got,
                     'mapPixelRatio': 1.5 if fmt == 'mobile' else 2,
                     'note': 'Canvas WebGL seul (repères, voile flou des bords et interface masqués) ; position = cssBox dans la fenêtre.'})
        out[f'globe-monde--{fmt}--{theme}'] = info
    for theme in ['light', 'dark']:
        got = open_explore(s, 'explore?country=FRA', 'desktop', theme, 'fr')
        wait_hint(s, COUNTRY_HINT['fr'], 20)
        time.sleep(1.5)
        info = export_png(s, f'globe-pays-france--desktop--{theme}')
        info.update({'route': '#explore?country=FRA', 'viewport': [1440, 960], 'html': got, 'mapPixelRatio': 2,
                     'note': 'Vue Pays : le canvas occupe toute la fenêtre ; ses bords s’effacent (masque linéaire --hg-edge-fade-x/y).'})
        out[f'globe-pays-france--desktop--{theme}'] = info
    for theme in ['light', 'dark']:
        fresh(s)
        open_app(s, 'projects', DESKTOP, theme=theme, lang='fr', block_globe=False)
        s.globe_ready(50)
        got = ensure_locale(s, theme, 'fr')
        s.wait('document.getElementById("app").dataset.globeDocked==="true"', 10)
        time.sleep(1.5)
        r = s.rect('#scope-medallion')
        clip = {'x': r['x'] - 2, 'y': r['y'] - 2, 'width': r['w'] + 4, 'height': r['h'] + 4}
        info = export_png(s, f'medaillon-contexte--desktop--{theme}', clip=clip)
        info.update({'route': '#projects', 'viewport': [1440, 960], 'html': got, 'medallion': r,
                     'note': 'Globe Monde ancré dans le siège de 32 px du filtre (rubriques) ; anneau 1 px --warm-line non inclus.'})
        out[f'medaillon-contexte--desktop--{theme}'] = info
    index = ASSETS / 'index.json'
    old = json.loads(index.read_text()) if index.exists() else {}
    old.update(out)
    index.write_text(json.dumps(old, ensure_ascii=False, indent=1))
    from PIL import Image
    previews = []
    for key, info in out.items():
        src = Image.open(BASE / info['file'])
        board = Image.new('RGBA', src.size, (255, 0, 255, 255))  # magenta behind: transparency is visible on the sheet
        board.alpha_composite(src)
        p = SHEETS / f'asset-{key}.png'
        SHEETS.mkdir(parents=True, exist_ok=True)
        board.convert('RGB').save(p)
        previews.append(p)
    print('sheet', contact_sheet(previews, SHEETS / 'assets.png', cols=4, thumb_w=360), flush=True)


LOTS = {
    'world': lambda s, lot: lot_world(s, lot, [('desktop', 'fr', 'light'), ('desktop', 'fr', 'dark'), ('mobile', 'fr', 'light'), ('mobile', 'fr', 'dark'), ('desktop', 'en', 'light')]),
    'world-ar': lambda s, lot: lot_world(s, lot, [('desktop', 'ar', 'light'), ('desktop', 'ar', 'dark'), ('mobile', 'ar', 'light'), ('mobile', 'ar', 'dark')]),
    'country': lot_country,
    'campus': lot_campus,
    'sheet-paris': lambda s, lot: lot_sheet(s, lot, [('paris', 'desktop', 'light', 'fr'), ('paris', 'desktop', 'dark', 'fr'), ('paris', 'desktop', 'dark', 'ar')]),
    'sheet-others': lambda s, lot: lot_sheet(s, lot, [('mulhouse', 'desktop', 'light', 'fr'), ('lyon', 'desktop', 'light', 'fr')]),
    'sheet-mobile': lot_sheet_mobile,
    'scope': lot_scope,
    'about': lot_about,
    'window': lot_window,
    'assets': lot_assets,
}


def main(names):
    unknown = [n for n in names if n not in LOTS]
    if not names or unknown:
        print(__doc__)
        sys.exit(2)
    for name in names:
        lot = Lot(name)
        started = time.time()
        print(f'== lot {name}', flush=True)
        s = start()
        try:
            LOTS[name](s, lot)
        finally:
            s.close()
            lot.sheet()
            print(f'== lot {name} done in {time.time() - started:.0f}s, {len(lot.records)} states', flush=True)


if __name__ == '__main__':
    main(sys.argv[1:])
