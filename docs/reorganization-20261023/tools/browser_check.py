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
PAGES = [
    ('site/content-preview.html#projects', 7),
    ('site/content-preview.html#people/profile-leila-mansour', 6),
    ('archives/early-prototypes/welcome-panels/welcome-panels.html', 7),
    ('archives/site-versions/pre-profile-campus-isolation-20261018/baseline/content-preview.html#explore', 7),
    ('archives/site-versions/pre-content-pagination-20261013/preview.html', 7),
    ('archives/site-versions/pre-clickable-media-20261008/preview.html', 7),
    ('archives/site-versions/pre-project-repository-link-20261011/preview.html', 7),
    ('archives/early-prototypes/decryption/horizon-decryption.html', 3),
    ('archives/early-prototypes/separate-city-map/index.html', 5),
    ('archives/early-prototypes/globe-explorer/horizon-globe.html', 3),
    ('studies/research-archive/index.html', 2),
    ('studies/decryption-examples/index.html', 2),
    ('studies/decryption-examples/scanner-return-random.html', 3),
    ('studies/design-review-studies/index.html', 4),
    ('studies/profile-navigation-studies/index.html', 2),
    ('studies/profile-navigation-studies/archive/initial-20261007/index.html', 2),
    ('studies/profile-navigation-studies/demo.html?variant=4#profiles', 4),
    ('studies/brand-transition-studies/index.html', 2),
    ('studies/brand-transition-studies/archive/initial-20261008/index.html', 2),
    ('studies/connected-experience-studies/index.html', 2),
    ('studies/connected-experience-studies/archive/bounded-scroll-20261007/index.html', 2),
    ('studies/awards-studies/index.html', 2),
    ('studies/globe-gesture-studies/index.html', 6),
    ('studies/navigation-studies/index.html', 3),
    ('studies/glass-studies/index.html', 2),
    ('studies/menu-studies/index.html', 2),
    ('studies/search-studies/index.html', 2),
    ('studies/globe-control-placement/index.html', 2),
    ('docs/site-map/index.html', 3),
]
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
