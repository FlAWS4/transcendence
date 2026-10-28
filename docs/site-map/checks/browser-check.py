"""Browser check of the site map page (read-only on the prototype).

Renders index.html inside the same minimal skeleton the published page receives, then records
geometry, errors and screenshots on desktop and phone widths, light and dark, French and English.
Usage from the repository root, with the repository served on http://127.0.0.1:8765/:
    python3 docs/site-map/checks/browser-check.py <output-folder>
"""
import json, pathlib, sys, time

HERE = pathlib.Path(__file__).resolve().parent
SITE_MAP = HERE.parent
# Shared headless Chrome launcher: profiles outside /tmp, memory cap, shared slot lock.
sys.path.insert(0, str(SITE_MAP.parents[1] / 'studies/design-review-studies/checks'))
from helper import Session  # noqa: E402

out = pathlib.Path(sys.argv[1]).resolve()
out.mkdir(parents=True, exist_ok=True)
SKELETON = ('<!doctype html><html><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<base href="http://127.0.0.1:8765/docs/site-map/">'
            '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
            'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
            '</head><body>{content}</body></html>')
wrapper = out / 'published-skeleton.html'
wrapper.write_text(SKELETON.replace('{content}', (SITE_MAP / 'index.html').read_text()))

s = Session(out)
results = []


def media(dark):
    s.c.call('Emulation.setEmulatedMedia', {'features': [
        {'name': 'prefers-reduced-motion', 'value': 'reduce'},
        {'name': 'prefers-color-scheme', 'value': 'dark' if dark else 'light'}]})


def load(width, height, mobile, dark, lang):
    s.viewport(width, height, mobile)
    media(dark)
    s.c.call('Page.navigate', {'url': wrapper.as_uri()})
    s.wait('document.querySelectorAll(".node, .row").length > 0', 20)
    s.wait('document.fonts.status === "loaded"', 10)
    s.js(f'(()=>{{document.querySelector("[data-lang={lang}]").click();return true}})()')
    time.sleep(.6)


def state(name):
    info = s.js('''(()=>{
      const insp=document.getElementById("inspector"), wires=document.querySelectorAll("#wires path");
      const sel=document.querySelector(".node[data-rel=self]");
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        view: document.getElementById("board").hidden ? "list" : "map",
        nodes: document.querySelectorAll(".node").length, rows: document.querySelectorAll(".row").length,
        wires: wires.length, selected: sel ? sel.dataset.id : null,
        inspectorShown: !insp.hidden, inspectorHeading: insp.querySelector("h2")?.textContent || null,
        inspectorTitles: [...insp.querySelectorAll("h3")].map(x=>x.textContent),
        dimmed: document.getElementById("board-inner").classList.contains("has-selection"),
        pathSteps: insp.querySelectorAll(".path li").length,
        from: insp.querySelectorAll(".links.in li").length, to: insp.querySelectorAll(".links.out li").length,
        stats: document.getElementById("stats").textContent,
        bodyBg: getComputedStyle(document.body).backgroundColor, ink: getComputedStyle(document.body).color,
        lang: document.documentElement.lang, font: getComputedStyle(document.body).fontFamily,
        jostLoaded: document.fonts.check("16px Jost"),
        boardScroll: (()=>{const b=document.getElementById("board");return b.hidden?null:{scrollWidth:b.scrollWidth,clientWidth:b.clientWidth}})(),
      };})()''')
    info['errors'] = s.errors()
    results.append({'case': name, **info})
    print(name, json.dumps(info, ensure_ascii=False)[:400], flush=True)
    return info


def select(node_id):
    s.js(f'(()=>{{document.querySelector(\'.node[data-id="{node_id}"]\').click();return true}})()')
    time.sleep(.5)


def full_shot(name):
    metrics = s.c.call('Page.getLayoutMetrics')
    size = metrics['cssContentSize']
    data = s.c.call('Page.captureScreenshot', {'format': 'png', 'captureBeyondViewport': True,
                                                'clip': {'x': 0, 'y': 0, 'width': size['width'], 'height': size['height'], 'scale': 1}}, timeout=90)['data']
    import base64
    (out / f'{name}.png').write_bytes(base64.b64decode(data))


try:
    load(1440, 900, False, False, 'fr')
    state('desktop-fr-light-default'); s.shot('desktop-fr-light-default'); full_shot('desktop-fr-light-full')
    select('project'); state('desktop-fr-light-project'); s.shot('desktop-fr-light-project')
    select('profile'); state('desktop-fr-light-profile'); s.shot('desktop-fr-light-profile')
    select('g-dock'); state('desktop-fr-light-dock'); s.shot('desktop-fr-light-dock')
    select('messages'); state('desktop-fr-light-messages')
    select('comment-menu'); state('desktop-fr-light-comment-menu')
    load(1440, 900, False, True, 'en')
    select('article-authors'); state('desktop-en-dark-article-authors'); s.shot('desktop-en-dark-article-authors')
    load(1180, 820, False, True, 'fr')
    select('campus-window'); state('desktop1180-fr-dark-campus-window'); s.shot('desktop1180-fr-dark-campus-window')
    load(390, 844, True, False, 'fr')
    state('mobile-fr-light-list'); s.shot('mobile-fr-light-list')
    s.scroll(1500); s.shot('mobile-fr-light-list-rows')
    s.js('(()=>{document.getElementById("view-map").click();return true})()'); time.sleep(.6)
    select('project-media'); state('mobile-fr-light-map-sheet'); s.shot('mobile-fr-light-map-sheet')
    load(320, 640, True, True, 'en')
    state('mobile320-en-dark-list'); s.shot('mobile320-en-dark-list')
finally:
    (out / 'browser-results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n')
    s.close()
