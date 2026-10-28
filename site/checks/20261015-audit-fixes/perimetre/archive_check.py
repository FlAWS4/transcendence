"""Read-only check that the pre-codex-audit-fixes archive matches its README.

Recomputes every claim of archive/pre-codex-audit-fixes-20261015/README.md and
snapshot-verification.json from the archive bytes (hashes, adaptations, test
originals, local references, storage isolation, cache identifiers of 144,
links, HTTP 200 of the entry files). Writes only archive.json next to itself.
"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
from urllib.request import urlopen
from urllib.error import HTTPError
import hashlib, json, re

root = Path('/home/le-rif/Bureau/Transcendence')
arch = root / 'archives/site-versions/pre-codex-audit-fixes-20261015'
here = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = json.loads((arch / 'snapshot-manifest.json').read_text())
tests = json.loads((arch / 'test-source-manifest.json').read_text())
readme = (arch / 'README.md').read_text()
verification = json.loads((arch / 'snapshot-verification.json').read_text())

runtime_ok = [r['runtime'] for r in manifest['files'] if sha((arch / r['runtime']).read_bytes()) == r['runtimeSha256'] and len((arch / r['runtime']).read_bytes()) == r['runtimeBytes']]
originals = [r for r in manifest['files'] if 'original' in r]
originals_ok = [r['original'] for r in originals if sha((arch / r['original']).read_bytes()) == r['sourceSha256']]
unadapted_ok = [r['runtime'] for r in manifest['files'] if 'original' not in r and r['runtimeSha256'] == r['sourceSha256']]
change_kinds = sorted({c['kind'] for r in originals for c in r['changes']})
tests_ok = [t['original'] for t in tests['files'] if sha((arch / t['original']).read_bytes()) == t['sha256'] and len((arch / t['original']).read_bytes()) == t['bytes']]
files_on_disk = sorted(p.relative_to(arch).as_posix() for p in (arch / 'baseline').rglob('*') if p.is_file())
manifest_runtime = sorted(r['runtime'] for r in manifest['files'])
originals_on_disk = sorted(p.relative_to(arch).as_posix() for p in (arch / 'originals').rglob('*') if p.is_file())

# Local references inside the archive, with the snapshot script's own patterns.
EXTENSIONS = r'(?:mjs|js|css|json(?:\.gz)?|svg|png|jpg|jpeg|webp|ttf|html)'
QUOTED = re.compile(r'''["']([a-zA-Z0-9_./-]+\.''' + EXTENSIONS + r'''(?:\?[^"']*)?)["']''')
CSS_URL = re.compile(r'''url\(\s*["']?([^\s)"']+)["']?\s*\)''')
references, outside, unresolved = [], [], []
for path in sorted((arch / 'baseline').rglob('*')):
    if not path.is_file() or path.suffix not in {'.html', '.mjs', '.js', '.css', '.json'} or path.name.endswith('.min.js') or path.parent.name == 'vendor':
        continue
    data = path.read_text(errors='replace')
    found = QUOTED.findall(data) + (CSS_URL.findall(data) if path.suffix == '.css' else [])
    for ref in found:
        if ref.startswith(('http:', 'https:', 'data:', '#')):
            continue
        target = (path.parent / unquote(ref.split('?')[0])).resolve()
        if target.is_file():
            row = {'from': path.relative_to(arch).as_posix(), 'ref': ref, 'target': str(target)}
            references.append(row)
            if not target.is_relative_to(arch):
                outside.append(row)
        else:
            unresolved.append({'from': path.relative_to(arch).as_posix(), 'ref': ref})
# Import-graph walk from the two baseline entries (same rules as the reference check of the active state).
def walk(entries):
    queue = list(entries); seen = set(); refs = []; missing = []
    while queue:
        p = queue.pop()
        if p in seen:
            continue
        seen.add(p)
        if not p.exists():
            missing.append(str(p)); continue
        if p.suffix not in ['.html', '.mjs', '.css']:
            continue
        s = p.read_text(); values = []
        if p.suffix == '.html':
            values += re.findall(r'(?:href|src)=["\']([^"\']+)', s)
        elif p.suffix == '.css':
            values += re.findall(r'url\(["\']?([^"\')]+)', s)
        else:
            values += re.findall(r'\b(?:from|import)\s*["\']([^"\']+)["\']', s)
            values += re.findall(r'\bimport\(\s*["\']([^"\']+)["\']', s)
        for value in values:
            url = urlsplit(value)
            if url.scheme or url.netloc or not url.path or '${' in value:
                continue
            target = (p.parent / unquote(url.path)).resolve(); refs.append((str(p), value, str(target))); queue.append(target)
    return seen, refs, missing
graph_seen, graph_refs, graph_missing = walk([arch / 'baseline/index.html', arch / 'baseline/content-preview.html'])
graph_outside = [r for r in graph_refs if not Path(r[2]).is_relative_to(arch)]

# Storage isolation: no original key left, prefixed keys present.
keys = list(manifest['storageReplacements'])
leftover = []
for path in (arch / 'baseline').rglob('*'):
    if path.is_file() and path.suffix in {'.html', '.mjs', '.js'}:
        text = path.read_text(errors='replace')
        for key in keys:
            # The prefixed replacement never contains the original key, so any remaining occurrence is unisolated.
            if key in text.replace(manifest['storageReplacements'][key], ''):
                leftover.append({'file': path.relative_to(arch).as_posix(), 'key': key})

# Cache identifiers of 144 as stated by the README.
base = (arch / 'baseline')
cache = {
    'controller 144 (index.html → welcome.mjs?v=animated-entry-144)': 'welcome.mjs?v=animated-entry-144' in (base / 'index.html').read_text(),
    'content-preview.mjs?v=111 (content-preview.html)': 'content-preview.mjs?v=111' in (base / 'content-preview.html').read_text(),
    'content-preview.mjs → welcome.mjs?v=animated-entry-144': 'welcome.mjs?v=animated-entry-144' in (base / 'content-preview.mjs').read_text(),
    'entrance.mjs?v=animated-labels-13 (welcome.mjs)': 'entrance.mjs?v=animated-labels-13' in (base / 'welcome.mjs').read_text(),
    'entrance.css?v=animated-labels-23 (index.html, content-preview.html)': all('entrance.css?v=animated-labels-23' in (base / n).read_text() for n in ['index.html', 'content-preview.html']),
    'comments.mjs?v=15 (project-ui.mjs)': 'comments.mjs?v=15' in (base / 'project-ui.mjs').read_text(),
    'comments.css?v=9 (index.html)': 'comments.css?v=9' in (base / 'index.html').read_text(),
    'project-ui.mjs?v=39 (welcome.mjs, journal-ui.mjs)': all('project-ui.mjs?v=39' in (base / n).read_text() for n in ['welcome.mjs', 'journal-ui.mjs']),
    'journal-ui.mjs?v=38 (welcome.mjs)': 'journal-ui.mjs?v=38' in (base / 'welcome.mjs').read_text(),
}
# The archived entrance is the 144 code (no cycleLabels option, keydown without filter).
entrance144 = (base / 'entrance.mjs').read_text()
code144 = {'noCycleLabelsOption': 'cycleLabels' not in entrance144, 'noModifierFilter': 'MODIFIER_KEYS' not in entrance144,
           'commentsSortAlwaysDown': 'down=menu.sort||' in (base / 'comments.mjs').read_text(),
           'accountHiddenOnError': 'body:not([data-entry=welcome]) .account-switcher{display:none}' in (base / 'entrance.css').read_text(),
           'noDarkSignupInk': '[data-account-action=signup]{background' not in (base / 'entrance.css').read_text()}

# README links and HTTP 200 of the entries.
links = re.findall(r'\]\(([^)]+)\)', readme)
link_rows = [{'link': link, 'exists': (arch / unquote(urlsplit(link).path)).exists()} for link in links if not urlsplit(link).scheme]
http = []
for value in ['baseline/index.html', 'baseline/content-preview.html', 'baseline/welcome.mjs?v=animated-entry-144', 'baseline/content-preview.mjs?v=111',
              'baseline/entrance.mjs?v=animated-labels-13', 'baseline/entrance.css?v=animated-labels-23', 'baseline/comments.mjs?v=15', 'README.md']:
    try:
        with urlopen('http://127.0.0.1:8765/archives/site-versions/pre-codex-audit-fixes-20261015/' + value) as response:
            data = response.read(); status = response.status
    except HTTPError as error:
        data = b''; status = error.code
    http.append({'url': value, 'status': status, 'identical': data == (arch / urlsplit(value).path).read_bytes()})

claims = {
    '137 runtime sources (manifest)': manifest['sourceCount'] == 137 == len(manifest['files']),
    '137 runtime hashes match': len(runtime_ok) == 137,
    'baseline holds exactly the 137 manifest files': files_on_disk == manifest_runtime,
    'eleven adaptations with originals': len(originals) == 11 and len(originals_ok) == 11,
    'adaptations limited to dependency paths or isolated storage': set(change_kinds) <= {'dependency-url', 'isolated-storage'},
    'non-adapted baseline files equal their source bytes': len(unadapted_ok) == 137 - 11,
    'two test originals match': len(tests_ok) == 2,
    'originals/ holds 11 runtime + 2 test originals only': originals_on_disk == sorted([r['original'] for r in originals] + [t['original'] for t in tests['files']]),
    'no local reference resolves outside the archive': not outside and not graph_outside,
    'entry import graph has no missing file': not graph_missing,
    'storage keys isolated (no unprefixed key left)': not leftover,
    'README states 192 references': '192 local references' in readme,
    # Same quoted-reference rule over the .html/.mjs/.js/.css files of baseline/ (JSON data files excluded).
    '192 references reproduced (html/mjs/js/css sources)': sum(1 for row in references if not row['from'].endswith('.json')) == 192,
    'verification json states 192 references': verification.get('references') == 192,
    'README cache identifiers present in baseline': all(cache.values()),
    'README links resolve': all(row['exists'] for row in link_rows),
    'entry files answer HTTP 200 with archive bytes': all(row['status'] == 200 and row['identical'] for row in http),
    'archived code is the 144 code (five defects present)': all(code144.values()),
}
result = {
    'date': '2026-10-15',
    'scope': 'Contrôle en lecture seule de l’archive pre-codex-audit-fixes-20261015 contre son README et snapshot-verification.json ; écrit seulement ce fichier.',
    'claims': claims,
    'allClaimsHold': all(claims.values()),
    'referenceCounts': {'quotedReferencesResolvedInsideArchive': len(references), 'importGraphReferences': len(graph_refs), 'importGraphFiles': len(graph_seen),
                        'unresolvedQuotedCandidates': len(unresolved), 'statedInReadme': 192},
    'changeKinds': change_kinds,
    'cacheIdentifiers144': cache,
    'code144': code144,
    'readmeLinks': link_rows,
    'http': http,
    'storageLeftover': leftover,
    'outside': outside[:20],
    'unresolvedSample': unresolved[:30],
    'verificationJson': verification,
}
(here / 'archive.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: result[k] for k in ['claims', 'allClaimsHold', 'referenceCounts', 'changeKinds', 'http']}, ensure_ascii=False, indent=1))
