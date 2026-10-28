#!/usr/bin/env python3
"""Load pages of the reorganized repository in headless Chrome; report local
resources that failed (HTTP >= 400 or network error) and JavaScript errors.

    python3 -I browser_check.py REPO OUT.json
"""
import json, os, sys, time
REPO = sys.argv[1]
OUT = sys.argv[2]
sys.path.insert(0, os.path.join(REPO, 'studies/design-review-studies/checks'))
import helper  # noqa: E402

BASE = 'http://127.0.0.1:8765/'
PAGES = [('site/index.html', 12)]
COLLECT = r'''(() => {
  const bad = [];
  const scan = (w, where) => {
    try {
      for (const e of w.performance.getEntriesByType('resource')) {
        if (!e.name.startsWith(location.origin)) continue;
        if (e.responseStatus >= 400) bad.push([where, e.name.slice(location.origin.length), e.responseStatus]);
      }
      for (const f of w.document.querySelectorAll('iframe')) { try { scan(f.contentWindow, f.getAttribute('src')); } catch (err) {} }
    } catch (err) { bad.push([where, 'scan-error', String(err)]); }
  };
  scan(window, 'page');
  const nav = performance.getEntriesByType('navigation')[0];
  return {bad, errors: (window.qaErrors || []).slice(0, 12), status: nav ? nav.responseStatus : null,
          resources: performance.getEntriesByType('resource').filter(e => e.name.startsWith(location.origin)).length,
          title: document.title};
})()'''

results = []
BLOCK = ['*integrated-globe.mjs*', '*maplibre-gl.js*']
for page, settle in PAGES:
    heavy = page.startswith(('site/content-preview', 'archives/site-versions/', 'archives/early-prototypes/welcome-panels', 'studies/globe-gesture'))
    chrome = helper.Chrome()
    try:
        chrome.call('Page.addScriptToEvaluateOnNewDocument', {'source': 'window.qaErrors=[];addEventListener("error",e=>{qaErrors.push(e.message||("resource "+(e.target&&(e.target.src||e.target.href))))},true);addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'})
        chrome.call('Network.enable')
        if heavy:
            chrome.call('Network.setBlockedURLs', {'urls': BLOCK})
        chrome.call('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 800, 'deviceScaleFactor': 1, 'mobile': False})
        chrome.call('Page.navigate', {'url': BASE + page})
        time.sleep(settle)
        try:
            res = chrome.call('Runtime.evaluate', {'expression': COLLECT, 'returnByValue': True}, timeout=20)['result'].get('value')
        except Exception as err:
            res = {'evaluate-error': str(err)}
    except Exception as err:
        res = {'chrome-error': str(err)}
    finally:
        chrome.close()
    res['page'] = page
    res['blocked'] = BLOCK if heavy else []
    results.append(res)
    print(json.dumps(res, ensure_ascii=False)[:500], flush=True)
json.dump(results, open(OUT, 'w'), indent=1, ensure_ascii=False)
