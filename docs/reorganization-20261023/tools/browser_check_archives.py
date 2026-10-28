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
PAGES = [('archives/site-versions/campus-full-width-directions-20261008/preview.html', 6), ('archives/site-versions/campus-logo-placeholder-20261008/preview.html', 6), ('archives/site-versions/pre-about-corpus-copy-20261013/preview.html', 6), ('archives/site-versions/pre-account-identity-actions-20261013/preview.html', 6), ('archives/site-versions/pre-account-menu-20261013/preview.html', 6), ('archives/site-versions/pre-account-preference-panels-20261013/preview.html', 6), ('archives/site-versions/pre-action-palette-and-no-zoom-20261013/baseline/content-preview.html', 6), ('archives/site-versions/pre-action-palette-and-no-zoom-20261013/baseline/index.html', 6), ('archives/site-versions/pre-animated-button-labels-20261013/baseline/content-preview.html', 6), ('archives/site-versions/pre-animated-button-labels-20261013/baseline/index.html', 6), ('archives/site-versions/pre-audit-fixes-refinement-20261015/baseline/content-preview.html', 6), ('archives/site-versions/pre-audit-fixes-refinement-20261015/baseline/index.html', 6), ('archives/site-versions/pre-back-to-top-focus-fix-20261013/preview.html', 6), ('archives/site-versions/pre-back-to-top-scroll-hide-20261013/preview.html', 6), ('archives/site-versions/pre-campus-logo-sheet-20261008/preview-before-dependency-pin-20261008.html', 6), ('archives/site-versions/pre-campus-logo-sheet-20261008/preview-before-history-url-fix-20261008.html', 6), ('archives/site-versions/pre-campus-logo-sheet-20261008/preview.html', 6), ('archives/site-versions/pre-cascade-wordmark-20261008/preview.html', 6), ('archives/site-versions/pre-chronicles-label-20261008/preview-before-history-url-fix-20261008.html', 6), ('archives/site-versions/pre-chronicles-label-20261008/preview.html', 6), ('archives/site-versions/pre-clickable-media-20261008/preview.html', 6), ('archives/site-versions/pre-codex-audit-fixes-20261015/baseline/content-preview.html', 6), ('archives/site-versions/pre-codex-audit-fixes-20261015/baseline/index.html', 6), ('archives/site-versions/pre-comments-20261010/preview.html', 6), ('archives/site-versions/pre-compact-editorial-grids-20261008/preview-before-dependency-pin-20261008.html', 6), ('archives/site-versions/pre-compact-editorial-grids-20261008/preview-before-history-url-fix-20261008.html', 6), ('archives/site-versions/pre-compact-editorial-grids-20261008/preview.html', 6), ('archives/site-versions/pre-compact-pagination-20261013/preview.html', 6), ('archives/site-versions/pre-content-pagination-20261013/preview.html', 6), ('archives/site-versions/pre-cycling-entrance-20261013/baseline/content-preview.html', 6), ('archives/site-versions/pre-cycling-entrance-20261013/baseline/index.html', 6), ('archives/site-versions/pre-dark-secondary-text-20261015/baseline/content-preview.html', 6), ('archives/site-versions/pre-dark-secondary-text-20261015/baseline/index.html', 6), ('archives/site-versions/pre-design-review-selection-20261015/baseline/content-preview.html', 6), ('archives/site-versions/pre-design-review-selection-20261015/baseline/index.html', 6), ('archives/site-versions/pre-explicit-scope-rollback-20261013/baseline/content-preview.html', 6), ('archives/site-versions/pre-explicit-scope-rollback-20261013/baseline/index.html', 6), ('archives/site-versions/pre-fixed-pagination-row-20261013/preview.html', 6), ('archives/site-versions/pre-four-stage-dock-20261007/preview-before-dependency-pin-20261008.html', 6), ('archives/site-versions/pre-four-stage-dock-20261007/preview-before-history-url-fix-20261008.html', 6), ('archives/site-versions/pre-four-stage-dock-20261007/preview.html', 6), ('archives/site-versions/pre-illustration-consistency-20261017/baseline/content-preview.html', 6), ('archives/site-versions/pre-illustration-consistency-20261017/baseline/index.html', 6), ('archives/site-versions/pre-inline-article-media-20261010/preview.html', 6), ('archives/site-versions/pre-list-heading-removal-20261013/preview.html', 6), ('archives/site-versions/pre-longer-second-dock-stage-20261011/preview-second-stage-only.html', 6), ('archives/site-versions/pre-longer-second-dock-stage-20261011/preview-third-stage-260.html', 6), ('archives/site-versions/pre-multi-campus-projects-20261012/preview.html', 6), ('archives/site-versions/pre-pagination-arrows-20261013/preview.html', 6), ('archives/site-versions/pre-profile-campus-isolation-20261018/baseline/content-preview.html', 6), ('archives/site-versions/pre-profile-campus-isolation-20261018/baseline/index.html', 6), ('archives/site-versions/pre-project-repository-link-20261011/preview.html', 6), ('archives/site-versions/pre-seven-page-demo-content-20261013/preview.html', 6), ('archives/site-versions/pre-targeted-button-colors-20261013/baseline/content-preview.html', 6), ('archives/site-versions/pre-targeted-button-colors-20261013/baseline/index.html', 6), ('archives/site-versions/pre-top-world-control-20261013/baseline/content-preview.html', 6), ('archives/site-versions/pre-top-world-control-20261013/baseline/index.html', 6)]
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
