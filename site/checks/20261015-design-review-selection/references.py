"""Read-only HTTP/source and reference check for the integration of the design-review selection (15 October 2026).

Model: checks/20261015-audit-fixes/146/references.py. Walks the local references of both entries, confirms that
every listed URL serves exactly the local bytes and that the expected cache identifiers are the ones loaded.
"avant" describes state 146 before the integration, "apres" the integrated state (146 + the two package files,
each referenced by both entries). Writes only its evidence file.
python3 -I references.py avant|apres  ->  references-<mode>.json"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
from urllib.request import urlopen
import hashlib, json, re, sys

MODE = sys.argv[1] if len(sys.argv) > 1 else 'apres'
assert MODE in ('avant', 'apres'), MODE
here = Path(__file__).resolve().parent
folder = here.parents[1]; root = folder.parent
queue = [folder / 'index.html', folder / 'content-preview.html']; seen = set(); refs = []; missing = []
while queue:
    p = queue.pop()
    if p in seen: continue
    seen.add(p)
    if not p.exists(): missing.append(str(p.relative_to(root))); continue
    if p.suffix not in ['.html', '.mjs', '.css']: continue
    s = p.read_text(); values = []
    if p.suffix == '.html': values += re.findall(r'(?:href|src)=[\"\']([^\"\']+)', s)
    elif p.suffix == '.css': values += re.findall(r'url\([\"\']?([^\"\')]+)', s)
    else:
        values += re.findall(r'\b(?:from|import)\s*[\"\']([^\"\']+)[\"\']', s)
        values += re.findall(r'\bimport\(\s*[\"\']([^\"\']+)[\"\']', s)
    for value in values:
        url = urlsplit(value)
        if url.scheme or url.netloc or not url.path or '${' in value: continue
        target = (p.parent / unquote(url.path)).resolve(); refs.append({'from': str(p.relative_to(root)), 'url': value, 'file': str(target.relative_to(root))}); queue.append(target)
# Cache identifiers: controller audit-fixes-146 and its dependencies, unchanged by the integration.
expected = {'index.html': ['welcome.mjs?v=audit-fixes-146'], 'content-preview.html': ['content-preview.mjs?v=113']}
package = ['design-review-selection.css?v=1', 'design-review-selection.mjs?v=1']
if MODE == 'apres':
    for name in expected: expected[name] += package
expected_uses = {'entrance.mjs?v=audit-fixes-15', 'entrance.css?v=audit-fixes-24', 'globe-framing.css?v=recentered-15', 'comments.mjs?v=17', 'comments.css?v=9',
                 'project-ui.mjs?v=41', 'journal-ui.mjs?v=40', 'dock-navigation.css?v=world-icon-8', 'account-menu.mjs?v=5', 'content-controls.mjs?v=17', 'content-report.css?v=3'}
if MODE == 'apres': expected_uses |= set(package)
uses = {r['url'] for r in refs}
cache_missing = sorted(u for u in expected_uses if u not in {u.split('/')[-1] for u in uses})
entry_ok = {name: all(v in (folder / name).read_text() for v in values) for name, values in expected.items()}
package_refs = [r for r in refs if 'design-review-selection' in r['url']]
# Position in each entry: the stylesheet right after content-report.css (last stylesheet), the module right after the main module.
order = {}
for name, main in (('index.html', 'welcome.mjs?v=audit-fixes-146'), ('content-preview.html', 'content-preview.mjs?v=113')):
    lines = (folder / name).read_text().splitlines()
    sheets = [l.strip() for l in lines if 'rel="stylesheet"' in l]
    scripts = [l.strip() for l in lines if '<script' in l]
    order[name] = {'lastStylesheet': sheets[-1] if sheets else None, 'stylesheets': len(sheets), 'scripts': scripts,
                   'packageSheetAfterContentReport': MODE == 'avant' or (len(sheets) > 1 and 'content-report.css?v=3' in sheets[-2] and 'design-review-selection.css?v=1' in sheets[-1]),
                   'packageModuleAfterMain': MODE == 'avant' or (main in ' '.join(scripts) and scripts.index(next(s for s in scripts if main in s)) + 1 < len(scripts)
                                                                  and 'design-review-selection.mjs?v=1' in scripts[scripts.index(next(s for s in scripts if main in s)) + 1])}
urls = ['index.html', 'content-preview.html', 'welcome.mjs?v=audit-fixes-146', 'content-preview.mjs?v=113', 'entrance.mjs?v=audit-fixes-15', 'entrance.css?v=audit-fixes-24',
        'globe-framing.css?v=recentered-15', 'comments.mjs?v=17', 'comments.css?v=9', 'project-ui.mjs?v=41', 'journal-ui.mjs?v=40', 'dock-navigation.css?v=world-icon-8',
        'account-menu.mjs?v=5', 'content-controls.mjs?v=17', 'content-controls.css?v=14', 'content-report.css?v=3', 'welcome-panels.html', 'welcome-panels.mjs']
if MODE == 'apres': urls += package
http = []
for value in urls:
    with urlopen('http://127.0.0.1:8765/site/' + value) as response: data = response.read(); status = response.status
    path = folder / urlsplit(value).path; identical = data == path.read_bytes()
    http.append({'url': value, 'status': status, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'identical': identical})
panels = (folder.parent / 'archives/early-prototypes/welcome-panels/welcome-panels.html').read_text()
proof = {'date': '2026-10-15', 'mode': MODE,
         'scope': 'Read-only HTTP/source and cache check of the two entries ' + ('before' if MODE == 'avant' else 'after') + ' the integration of the design-review selection; writes only this evidence file.',
         'filesVisited': len(seen), 'referenceCount': len(refs), 'missing': missing, 'entryCaches': entry_ok, 'expectedCacheUses': sorted(expected_uses),
         'cacheUsesMissing': cache_missing, 'packageReferences': package_refs, 'entryOrder': order, 'welcomePanelsLoadsPackage': 'design-review-selection' in panels,
         'http': http, 'httpAllIdentical': all(h['identical'] and h['status'] == 200 for h in http), 'references': refs}
(here / f'references-{MODE}.json').write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
assert not missing, missing; assert all(entry_ok.values()), entry_ok; assert not cache_missing, cache_missing; assert proof['httpAllIdentical'], http
assert all(o['packageSheetAfterContentReport'] and o['packageModuleAfterMain'] for o in order.values()), order
assert not proof['welcomePanelsLoadsPackage']
assert len(package_refs) == (4 if MODE == 'apres' else 0), package_refs
print('PASS', MODE, len(seen), 'files', len(refs), 'references', len(http), 'HTTP200 matching sources;', len(package_refs), 'package references')
