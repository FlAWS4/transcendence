import json, os, sys, time
REPO = sys.argv[1]
sys.path.insert(0, os.path.join(REPO, 'studies/design-review-studies/checks'))
import helper
c = helper.Chrome()
try:
    c.call('Network.enable')
    c.call('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 800, 'deviceScaleFactor': 1, 'mobile': False})
    c.call('Page.navigate', {'url': 'http://127.0.0.1:8765/site/index.html'})
    time.sleep(14)
    expr = r'''(() => ({
      names: performance.getEntriesByType('resource').map(e => e.name.replace(location.origin, '')).filter(n => /globe|maplibre|d3|topo|geography|decryption/.test(n)),
      canvases: document.querySelectorAll('canvas').length,
      maplibre: Boolean(document.querySelector('.maplibregl-canvas, .maplibregl-map')),
      errorVisible: [...document.querySelectorAll('[class*=error],[data-state*=error]')].filter(e => e.offsetParent).map(e => e.className).slice(0, 5),
      bodyState: document.body.className.slice(0, 200)
    }))()'''
    r = c.call('Runtime.evaluate', {'expression': expr, 'returnByValue': True}, timeout=20)['result']['value']
    print(json.dumps(r, indent=1))
finally:
    c.close()
