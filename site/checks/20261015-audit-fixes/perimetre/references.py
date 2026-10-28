"""Read-only HTTP/source and reference check for the audit-fixes-145 state.

Adapted from checks/20261013-animated-entry-references.py (state 144): walks the
local references of both entries, confirms that the expected cache identifiers
of state 145 are the ones loaded and that no 144 identifier remains, that each
changed module is loaded under a single identifier, and that every referenced
URL (with its query string) answers 200 with exactly the local bytes. Also
checks the legacy panels page, which keeps its own older identifiers.
Writes only references.json next to itself.
"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
from urllib.request import urlopen
from urllib.error import HTTPError
import re, json, hashlib

root = Path('/home/le-rif/Bureau/Transcendence')
folder = root / 'site'
here = Path(__file__).resolve().parent
base = 'http://127.0.0.1:8765/'


def walk(entries):
    queue = list(entries); seen = set(); refs = []; missing = []
    while queue:
        p = queue.pop()
        if p in seen:
            continue
        seen.add(p)
        if not p.exists():
            missing.append(str(p.relative_to(root))); continue
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
            target = (p.parent / unquote(url.path)).resolve()
            refs.append({'from': str(p.relative_to(root)), 'url': value, 'file': str(target.relative_to(root)),
                         'query': url.query})
            queue.append(target)
    return seen, refs, missing


# Broad graph as in the archive snapshot script: any quoted local path with a known extension.
EXTENSIONS = r'(?:mjs|js|css|json(?:\.gz)?|svg|png|jpg|jpeg|webp|ttf|html)'
QUOTED = re.compile(r'''["']([a-zA-Z0-9_./-]+\.''' + EXTENSIONS + r'''(?:\?[^"']*)?)["']''')
CSS_URL = re.compile(r'''url\(\s*["']?([^\s)"']+)["']?\s*\)''')


def broad(entries):
    pending = list(entries); seen = set(); unresolved = set()
    while pending:
        path = pending.pop().resolve()
        if path in seen:
            continue
        seen.add(path)
        if path.suffix not in {'.html', '.mjs', '.js', '.css'} or path.name.endswith('.min.js') or path.parent.name == 'vendor':
            continue
        data = path.read_text()
        found = QUOTED.findall(data) + (CSS_URL.findall(data) if path.suffix == '.css' else [])
        for ref in found:
            if ref.startswith(('http:', 'https:', 'data:', '#')):
                continue
            candidate = (path.parent / ref.split('?')[0]).resolve()
            if candidate.is_file():
                pending.append(candidate)
            else:
                unresolved.add((str(path.relative_to(root)), ref))
    return seen, sorted(unresolved)


entries = [folder / 'index.html', folder / 'content-preview.html']
seen, refs, missing = walk(entries)
broad_seen, broad_unresolved = broad(entries)

# Cache identifiers of state 145 (audit fixes) and their stale 144 values.
expected_entries = {
    'index.html': ['welcome.mjs?v=audit-fixes-145', 'entrance.css?v=audit-fixes-24'],
    'content-preview.html': ['content-preview.mjs?v=112', 'entrance.css?v=audit-fixes-24'],
}
changed_new = {'welcome.mjs': 'v=audit-fixes-145', 'content-preview.mjs': 'v=112', 'entrance.mjs': 'v=audit-fixes-14',
               'entrance.css': 'v=audit-fixes-24', 'comments.mjs': 'v=16', 'project-ui.mjs': 'v=40', 'journal-ui.mjs': 'v=39'}
stale_144 = {'welcome.mjs': 'v=animated-entry-144', 'content-preview.mjs': 'v=111', 'entrance.mjs': 'v=animated-labels-13',
             'entrance.css': 'v=animated-labels-23', 'comments.mjs': 'v=15', 'project-ui.mjs': 'v=39', 'journal-ui.mjs': 'v=38'}
unchanged_kept = {'globe-framing.css?v=recentered-15', 'comments.css?v=9', 'dock-navigation.css?v=world-icon-8',
                  'account-menu.mjs?v=5', 'content-controls.mjs?v=17', 'content-controls.css?v=14', 'account-menu.css?v=2',
                  'back-to-top.mjs?v=2', 'back-to-top.css?v=2'}
uses = {}
for ref in refs:
    name = Path(urlsplit(ref['url']).path).name
    uses.setdefault(name, set()).add(ref['query'])
entry_ok = {name: {value: value in (folder / name).read_text() for value in values} for name, values in expected_entries.items()}
changed_ids = {name: sorted(uses.get(name, [])) for name in changed_new}
changed_single_new = {name: changed_ids[name] == [changed_new[name]] for name in changed_new}
stale_found = sorted(f'{name}?{stale_144[name]}' for name in stale_144 if stale_144[name] in uses.get(name, set()))
kept_found = {value: Path(value.split('?')[0]).name in uses and value.split('?')[1] in uses[Path(value.split('?')[0]).name] for value in unchanged_kept}
# A stale identifier must not remain in any active source either (archives and checks excluded).
stale_text = []
for path in sorted(folder.rglob('*')):
    if not path.is_file() or path.suffix not in {'.html', '.mjs', '.js', '.css'}:
        continue
    relative = path.relative_to(folder).as_posix()
    if relative.startswith(('archive/', 'checks/')):
        continue
    text = path.read_text(errors='replace')
    for name, value in stale_144.items():
        if f'{name}?{value}' in text:
            stale_text.append({'file': relative, 'identifier': f'{name}?{value}'})

# HTTP: every distinct referenced URL of both entries, plus the two entries and the legacy panels page.
urls = sorted({str((Path(ref['from']).parent / urlsplit(ref['url']).path)) + ('?' + ref['query'] if ref['query'] else '') for ref in refs})
urls = ['site/index.html', 'site/content-preview.html'] + urls
panels = ['archives/early-prototypes/welcome-panels/welcome-panels.html', 'archives/early-prototypes/welcome-panels/welcome-panels.mjs?v=35',
          'site/entrance.mjs?v=visible-scan-5', 'site/entrance.css?v=circle-globe-15']
http = []
for value in dict.fromkeys(urls + panels):
    clean = str(Path(urlsplit(value).path))
    local = (root / clean).resolve()
    try:
        with urlopen(base + value) as response:
            data = response.read(); status = response.status; headers = dict(response.headers)
    except HTTPError as error:
        data = b''; status = error.code; headers = {}
    identical = local.is_file() and data == local.read_bytes()
    http.append({'url': value, 'status': status, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'identical': identical,
                 'cacheControl': headers.get('Cache-Control'), 'lastModified': headers.get('Last-Modified')})
changed_http = [row for row in http if Path(urlsplit(row['url']).path).name in changed_new and urlsplit(row['url']).query == changed_new[Path(urlsplit(row['url']).path).name]]

proof = {
    'date': '2026-10-15',
    'scope': 'Contrôle HTTP/source et caches de l’état audit-fixes-145 (lecture seule ; écrit seulement ce fichier). Adapté de checks/20261013-animated-entry-references.py.',
    'filesVisited': len(seen), 'referenceCount': len(refs), 'missing': missing,
    'broadGraphFiles': len(broad_seen), 'broadGraphUnresolvedCandidates': broad_unresolved,
    'entryCaches': entry_ok,
    'changedModuleIdentifiersInGraph': changed_ids, 'changedModulesLoadedOnlyWithNewIdentifier': changed_single_new,
    'stale144IdentifiersInGraph': stale_found, 'stale144IdentifiersInActiveSources': stale_text,
    'unchangedIdentifiersStillLoaded': kept_found,
    'httpChecked': len(http), 'httpAll200Identical': all(row['status'] == 200 and row['identical'] for row in http),
    'httpChangedUrls': changed_http,
    'httpFailures': [row for row in http if not (row['status'] == 200 and row['identical'])],
    'serverCacheControlHeaders': sorted({str(row['cacheControl']) for row in http}),
    'legacyPanelsPage': [row for row in http if row['url'] in panels],
    'http': http,
    'references': refs,
}
(here / 'references.json').write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: proof[k] for k in ['filesVisited', 'referenceCount', 'missing', 'broadGraphFiles', 'entryCaches', 'changedModuleIdentifiersInGraph',
                                        'changedModulesLoadedOnlyWithNewIdentifier', 'stale144IdentifiersInGraph', 'stale144IdentifiersInActiveSources',
                                        'unchangedIdentifiersStillLoaded', 'httpChecked', 'httpAll200Identical', 'httpFailures', 'serverCacheControlHeaders']},
                 ensure_ascii=False, indent=1))
print('broad unresolved (info):', len(broad_unresolved))
for row in changed_http:
    print('changed', row['url'], row['status'], row['bytes'], row['identical'])
for row in proof['legacyPanelsPage']:
    print('panels', row['url'], row['status'], row['bytes'], row['identical'])
