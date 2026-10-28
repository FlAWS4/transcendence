"""Trusted CDP touch input on the isolated long-press study, not synthetic DOM input."""
from pathlib import Path
import json, time, base64, hashlib

folder = Path(__file__).resolve().parent.parent
repo = folder.parents[2]
exec((repo / 'site/checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out = folder / 'checks'
c = Chrome()
results = []
passed = False
base = 'http://127.0.0.1:8765/studies/globe-gesture-studies/'

def wait(expression, seconds=45):
    end = time.time() + seconds
    while time.time() < end:
        value = c.js(expression)
        if value:
            return value
        time.sleep(.15)
    raise AssertionError('Timeout: ' + expression + ' ' + str(c.js('window.horizonControlsStudy?.state')))

def record(name, value=True):
    results.append({'case': name, 'result': value})
    print(name, json.dumps(value, ensure_ascii=False), flush=True)

def shot(name):
    (out / (name + '.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot', {'format': 'png'})['data']))

def state():
    return c.js('({controls:horizonControlsStudy.state,map:horizonStudy.globe.getNavigationState(),active:document.activeElement.id})')

def touch(kind, *points):
    c.call('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [dict(id=p[0], x=p[1], y=p[2], radiusX=2, radiusY=2, force=1) for p in points]})

def key(name):
    for kind in ['keyDown', 'keyUp']:
        c.call('Input.dispatchKeyEvent', {'type': kind, 'key': name, 'code': name, 'windowsVirtualKeyCode': {'Escape': 27, 'Enter': 13, 'Tab': 9}.get(name, 0)})
    time.sleep(.2)

def tap(selector):
    pos = c.js('(()=>{const r=document.querySelector(' + json.dumps(selector) + ').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
    touch('touchStart', (0, pos['x'], pos['y']))
    touch('touchEnd')
    time.sleep(.25)

def ready():
    wait('window.horizonControlsStudy&&window.horizonStudy.globe?.getNavigationState().worldRender.phase==="ready"', 55)
    wait('!horizonStudy.globe.getNavigationState().inFlight')
    time.sleep(.4)

try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': '''
window.qaErrors=[];window.qaInput=[];window.qaLifecycle=[];window.qaInstance=crypto.randomUUID();
addEventListener('error',e=>qaErrors.push(e.message));
addEventListener('unhandledrejection',e=>qaErrors.push(String(e.reason)));
for(const type of ['pageshow','pagehide'])addEventListener(type,e=>qaLifecycle.push({type,persisted:e.persisted}));
for(const type of ['pointerdown','pointermove','pointerup','pointercancel','gotpointercapture','lostpointercapture','contextmenu','click'])addEventListener(type,e=>{qaInput.push({type,pointerType:e.pointerType,id:e.pointerId,x:e.clientX,y:e.clientY,target:e.target.id||e.target.className?.baseVal||e.target.className,trusted:e.isTrusted,time:Math.round(performance.now())});if(qaInput.length>160)qaInput.shift();},true);
'''})
    c.call('Emulation.setDeviceMetricsOverride', {'width': 390, 'height': 844, 'deviceScaleFactor': 1, 'mobile': True})
    c.call('Emulation.setTouchEmulationEnabled', {'enabled': True, 'maxTouchPoints': 5})
    c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'reduce'}]})
    c.call('Page.navigate', {'url': base + 'baseline/content-preview.html?variant=3#explore'})
    ready()
    record('ready-touch-mobile', state())

    before = state()['map']
    touch('touchStart', (0, 100, 410))
    time.sleep(.75)
    opened = state()
    record('held-touch-observation', opened)
    assert opened['controls']['open'] and opened['controls']['hold'], opened
    shot('touch-held-mobile')
    touch('touchEnd')
    time.sleep(.35)
    after = state()
    assert after['controls']['open'] and not after['controls']['hold'], after
    assert after['map']['zoom'] == before['zoom'] and after['map']['center'] == before['center'], (before, after)
    record('touch-release-without-action', after)
    key('Escape')
    assert not state()['controls']['open']

    # Repeating the exact point catches stale capture/touch IDs after the first release.
    touch('touchStart', (0, 100, 410))
    time.sleep(.75)
    repeated = state()
    record('repeated-hold-observation', repeated)
    assert repeated['controls']['open'] and repeated['controls']['hold'], repeated
    touch('touchEnd')
    key('Escape')
    record('repeated-touch-hold')

    before = state()['map']['center']
    touch('touchStart', (0, 100, 410))
    for x in [112, 132, 155, 180]:
        touch('touchMove', (0, x, 410))
        time.sleep(.06)
    time.sleep(.65)
    touch('touchEnd')
    time.sleep(.35)
    after = state()
    assert not after['controls']['open'] and after['map']['center'] != before, (before, after)
    record('ordinary-touch-drag-rotates', {'before': before, 'after': after['map']['center']})

    touch('touchStart', (0, 100, 410))
    time.sleep(.15)
    touch('touchStart', (0, 100, 410), (1, 220, 410))
    time.sleep(.7)
    before_cancel = state()
    touch('touchMove', (0, 90, 410), (1, 230, 410))
    touch('touchEnd')
    time.sleep(.35)
    assert not before_cancel['controls']['open'] and not state()['controls']['open'], before_cancel
    record('second-touch-before-threshold-cancels', before_cancel)

    touch('touchStart', (0, 100, 410))
    time.sleep(.75)
    assert state()['controls']['hold'], state()
    touch('touchStart', (0, 100, 410), (1, 225, 410))
    time.sleep(.2)
    after_cancel = state()
    touch('touchEnd')
    time.sleep(.2)
    assert not after_cancel['controls']['open'] and not after_cancel['controls']['hold'], after_cancel
    record('second-touch-after-open-cancels', after_cancel)

    tap('#study-trigger')
    assert state()['controls']['open'], state()
    before = state()['map']['zoom']
    tap('#zoom-in')
    wait('!horizonStudy.globe.getNavigationState().inFlight')
    assert state()['map']['zoom'] > before, state()
    record('touch-single-click-alternative-zooms')
    key('Escape')
    assert state()['active'] == 'study-trigger', state()
    c.js('document.querySelector("#globe").focus()')
    key('Enter')
    assert state()['controls']['open'] and c.js('document.querySelector("#study-palette").contains(document.activeElement)'), state()
    key('Escape')
    assert state()['active'] == 'study-trigger' and not state()['controls']['open'], state()
    record('keyboard-alternative-and-return-focus')

    # Navigate with a recognized press still active, then back to the saved entry.
    before_instance = c.js('qaInstance')
    touch('touchStart', (0, 100, 410))
    time.sleep(.75)
    assert state()['controls']['hold'], state()
    history = c.call('Page.getNavigationHistory')
    entry = history['entries'][history['currentIndex']]['id']
    c.call('Page.navigate', {'url': base})
    wait('document.querySelectorAll("a.try").length===3')
    touch('touchEnd')
    c.call('Page.navigateToHistoryEntry', {'entryId': entry})
    ready()
    restored = state()
    life = c.js('({instance:qaInstance,events:qaLifecycle})')
    assert not restored['controls']['hold'] and not restored['controls']['open'], restored
    touch('touchStart', (0, 100, 410))
    time.sleep(.75)
    assert state()['controls']['hold'] and state()['controls']['open'], state()
    touch('touchEnd')
    key('Escape')
    record('gallery-back-press-remains-functional', {'sameInstance': life['instance'] == before_instance, 'lifecycle': life['events'], 'state': state()})
    record('trusted-touch-events', c.js('qaInput.filter(e=>e.type==="pointerdown")'))
    assert not c.js('qaErrors'), c.js('qaErrors')
    passed = True
finally:
    if not passed:
        try:
            shot('touch-failure')
            record('failure', c.js('({errors:qaErrors,input:qaInput,lifecycle:qaLifecycle,study:window.horizonControlsStudy?.state,map:window.horizonStudy?.globe?.getNavigationState(),target:document.elementFromPoint(100,410)?.outerHTML})'))
        except Exception as error:
            record('failure-capture-error', str(error))
    (out / 'touch-results.json').write_text(json.dumps({'passed': passed, 'input': 'Chrome CDP trusted touch, mobile 390×844 emulation, reduced motion', 'cases': results, 'sources': {name: hashlib.sha256((folder / name).read_bytes()).hexdigest() for name in ['study.mjs', 'study.css', 'press-gesture.mjs']}}, ensure_ascii=False, indent=2) + '\n')
    c.close()
