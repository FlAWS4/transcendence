"""Exercise active map input after removing the Explorer zoom buttons.

Uses a fresh Chrome profile and the project server on 127.0.0.1:8765.
The optional existing perf reader exposes settled camera state without a bridge.
"""
from pathlib import Path
import json, time, base64, hashlib

root = Path(__file__).resolve().parents[2]
exec((root / 'checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out = Path(__file__).resolve().parent
sources = ['index.html', 'content-preview.html', 'content-preview.mjs', 'welcome.mjs', 'entrance.css', 'dock-navigation.css', 'globe-framing.css']
hashes = {name: hashlib.sha256((root / name).read_bytes()).hexdigest() for name in sources}
c = Chrome()
results = []
passed = False

def record(name, value=True):
    results.append({'case': name, 'result': value})
    print(name, json.dumps(value, ensure_ascii=False), flush=True)

def wait(expression, seconds=45):
    deadline = time.time() + seconds
    while time.time() < deadline:
        value = c.js(expression)
        if value:
            return value
        time.sleep(.12)
    raise AssertionError(expression + ' ' + str(c.js('({errors:window.qaErrors,hash:location.hash,loading:document.querySelector("#loading")?.textContent})')))

def camera():
    return c.js('''(()=>{const s=JSON.parse(document.querySelector('#globe-navigation-state').textContent);return {level:s.level,country:s.country,campus:s.campus,zoom:s.zoom,minZoom:s.minZoom,maxZoom:s.maxZoom,center:s.center,inFlight:s.inFlight,worldReady:s.worldRender.phase}})()''')

def settle():
    wait("!!document.querySelector('#globe-navigation-state')?.textContent && !JSON.parse(document.querySelector('#globe-navigation-state').textContent).inFlight", 15)
    time.sleep(.55)

def click(selector):
    point = c.js('(()=>{const e=document.querySelector(' + json.dumps(selector) + '),r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()')
    for kind in ['mousePressed', 'mouseReleased']:
        c.call('Input.dispatchMouseEvent', {'type': kind, **point, 'button': 'left', 'clickCount': 1})
    time.sleep(.08)

def key(value):
    code, native = {'=': ('Equal',187), '-': ('Minus',189), 'ArrowRight': ('ArrowRight',39), 'Enter': ('Enter',13)}[value]
    for kind in ['keyDown', 'keyUp']:
        c.call('Input.dispatchKeyEvent', {'type': kind, 'key': value, 'code': code, 'windowsVirtualKeyCode': native})
    time.sleep(.6)

def shot(name):
    c.js("document.querySelector('#globe-perf-panel').style.visibility='hidden'")
    (out / (name + '.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot', {'format':'png'})['data']))
    c.js("document.querySelector('#globe-perf-panel').style.removeProperty('visibility')")

def surface():
    return c.js('''(()=>{
      const shown=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';
      const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,cx:r.x+r.width/2,cy:r.y+r.height/2}};
      const reset=document.querySelector('#reset'),anchor=document.querySelector('#scope-medallion'),die=document.querySelector('#random-campus');
      return {section:document.querySelector('#app').dataset.section,resetShown:shown(reset),resetHidden:reset.hidden,
        reset:rect(reset),anchor:rect(anchor),zoomIds:document.querySelectorAll('#zoom-in,#zoom-out').length,
        visibleFooter:shown(document.querySelector('#main>.globe-footer')),
        visibleMainCapsules:[...document.querySelectorAll('#main .globe-controls')].filter(shown).length,
        dieShown:shown(die),dieInDock:die.parentElement.classList.contains('dock-shell'),dieDisabled:die.disabled,
        docked:document.querySelector('#app').dataset.globeDocked,
        canvas:document.querySelectorAll('#globe canvas.maplibregl-canvas').length,
        overflow:document.documentElement.scrollWidth>innerWidth};
    })()''')

try:
    c.call('Page.addScriptToEvaluateOnNewDocument', {'source': 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push({type:"error",message:e.message,source:e.filename})});addEventListener("unhandledrejection",e=>qaErrors.push({type:"unhandledrejection",message:String(e.reason)}))'})
    c.width(1280,900)
    c.call('Page.navigate', {'url':'http://127.0.0.1:8765/site/content-preview.html?perf=1#explore'})
    wait("document.querySelector('#loading')?.hidden && !!document.querySelector('#globe-navigation-state')?.textContent && !document.querySelector('#reset').disabled")
    settle()
    state = surface()
    assert state['zoomIds'] == 0 and not state['visibleFooter'] and state['visibleMainCapsules'] == 0, state
    assert state['resetShown'] and state['reset']['w'] == 44 and state['anchor']['w'] == 32 and state['canvas'] == 1, state
    assert abs(state['reset']['cx']-state['anchor']['cx']) < 1 and abs(state['reset']['cy']-state['anchor']['cy']) < 1, state
    assert state['dieShown'] and state['dieInDock'] and not state['dieDisabled'] and not state['overflow'], state
    record('desktop-controls-and-empty-capsule-absence', state)
    shot('zoom-desktop-explorer')

    c.js("document.querySelector('#globe').focus({preventScroll:true})")
    assert c.js("document.activeElement.id==='globe'")
    before = camera(); key('='); after = camera()
    assert after['zoom'] > before['zoom'] + .05 and after['level'] == 'world', (before,after)
    record('keyboard-zoom-in', {'before':before, 'after':after})
    key('-'); back = camera()
    assert back['zoom'] < after['zoom'] - .05 and back['zoom'] >= back['minZoom'] - .01, (after,back)
    record('keyboard-zoom-out', {'before':after, 'after':back})
    before = camera(); key('ArrowRight'); after = camera()
    assert max(abs(a-b) for a,b in zip(before['center'],after['center'])) > .01, (before,after)
    record('keyboard-pan', {'before':before, 'after':after})

    # The left half of the globe stays clear of the optional diagnostic panel.
    point = {'x':420,'y':470}
    hit = c.js('document.elementFromPoint(420,470)?.className')
    assert 'maplibregl-canvas' in hit, hit
    before = camera()
    c.call('Input.dispatchMouseEvent', {'type':'mouseMoved',**point})
    c.call('Input.dispatchMouseEvent', {'type':'mouseWheel',**point,'deltaX':0,'deltaY':-120})
    wait("JSON.parse(document.querySelector('#globe-perf-panel').dataset.frame).zoom>"+str(before['zoom']+.03), 10)
    wait("JSON.parse(document.querySelector('#globe-navigation-state').textContent).zoom>"+str(before['zoom']+.03), 10)
    time.sleep(.25); after = camera()
    assert after['zoom'] > before['zoom'] + .03, (before,after)
    record('native-wheel-zoom-in', {'hit':hit,'before':before,'after':after})
    c.call('Input.dispatchMouseEvent', {'type':'mouseWheel',**point,'deltaX':0,'deltaY':120})
    wait("JSON.parse(document.querySelector('#globe-perf-panel').dataset.frame).zoom<"+str(after['zoom']-.03), 10)
    wait("JSON.parse(document.querySelector('#globe-navigation-state').textContent).zoom<"+str(after['zoom']-.03), 10)
    time.sleep(.25); back = camera()
    assert back['zoom'] < after['zoom'] - .03 and back['level']=='world', (after,back)
    record('native-wheel-zoom-out', {'before':after,'after':back})

    c.js("location.hash='explore?country=FRA'")
    wait("document.querySelector('#scope-bar').dataset.level==='country'"); settle()
    c.js("document.querySelector('#reset').focus({preventScroll:true})"); key('Enter')
    wait("document.querySelector('#scope-bar').dataset.level==='world'"); settle()
    assert camera()['country'] is None and c.js("document.activeElement.id==='reset'")
    record('keyboard-world-reset', camera())

    for section in ['projects','people','journal','awards']:
        click('[data-section='+section+']')
        wait("document.querySelector('#app').dataset.section==="+json.dumps(section))
        time.sleep(.85)
        state = surface()
        assert state['resetHidden'] and not state['resetShown'] and state['zoomIds']==0 and not state['visibleFooter'], state
        c.js("document.querySelector('#reset').focus()")
        assert c.js("document.activeElement.id!=='reset'")
        record('world-reset-hidden-'+section, state)
        if section=='projects':
            dock = c.js('''(()=>{const a=document.querySelector('#scope-medallion').getBoundingClientRect(),s=getComputedStyle(document.querySelector('#globe')),m=new DOMMatrix(s.transform);return {errorX:Math.abs(parseFloat(s.getPropertyValue('--dock-origin-x'))+m.e-a.x-a.width/2),errorY:Math.abs(parseFloat(s.getPropertyValue('--dock-origin-y'))+m.f-a.y-a.height/2),scale:m.a,expectedScale:parseFloat(s.getPropertyValue('--dock-scale'))}})()''')
            assert dock['errorX'] < 1 and dock['errorY'] < 1 and abs(dock['scale']-dock['expectedScale']) < .001, dock
            record('mini-globe-docking', dock); shot('zoom-projects-mini-globe')

    click('[data-section=projects]'); time.sleep(.3)
    before = c.js('location.hash'); click('#random-campus')
    wait("document.querySelector('#app').dataset.reading==='true'")
    assert c.js('location.hash') != before
    record('discovery-die-opens-project', {'before':before,'after':c.js('location.hash'),'resetHidden':surface()['resetHidden']})
    click('[data-section=explore]'); wait("document.querySelector('#app').dataset.section==='explore'"); settle(); time.sleep(.3)
    state = surface()
    assert state['resetShown'] and state['docked']=='false' and state['dieShown'] and not state['dieDisabled'], state
    record('world-reset-restored-after-reading', state)

    c.width(390,844); time.sleep(.8); settle()
    state = surface()
    assert not state['overflow'] and state['zoomIds']==0 and not state['visibleFooter'] and not state['visibleMainCapsules'], state
    assert state['resetShown'] and state['dieShown'] and state['canvas']==1, state
    record('mobile-controls-and-empty-capsule-absence', state); shot('zoom-mobile-explorer')
    c.js("document.querySelector('#globe').focus({preventScroll:true})")
    before = camera(); key('='); after = camera()
    assert after['zoom'] > before['zoom'] + .03, (before,after)
    record('mobile-viewport-keyboard-zoom', {'before':before,'after':after})
    # Confirm the Explorer die starts the real campus route, then reset before
    # the approach needs remote street detail; no street rendering claim.
    click('#random-campus')
    wait("document.querySelector('#scope-bar').dataset.level==='campus'", 5)
    record('explorer-die-starts-campus-navigation', {'hash':c.js('location.hash'),'campus':c.js("document.querySelector('#scope-name').textContent")})
    click('#reset'); wait("document.querySelector('#scope-bar').dataset.level==='world'"); settle()
    record('pointer-world-reset-interrupts-campus-approach', camera())
    errors = c.js('qaErrors')
    assert not errors, errors
    record('javascript-errors', errors)
    passed = True
finally:
    if not passed:
        try: shot('zoom-failure');record('failure',c.js('({errors:window.qaErrors,hash:location.hash,body:document.body.innerText.slice(-800)})'))
        except Exception: pass
    changed = [name for name in sources if hashlib.sha256((root/name).read_bytes()).hexdigest()!=hashes[name]]
    (out/'zoom-results.json').write_text(json.dumps({'passed':passed,'cases':results,'sources':hashes,'sourcesChangedDuringRun':changed,'limits':'Chrome isolated profile; emulated viewport; no physical device, screen reader or remote campus street rendering tested.'},ensure_ascii=False,indent=2)+'\n')
    c.close()
