#!/usr/bin/env python3
"""Read-only inventory of every page that loads one of the seven files changed by audit-fixes-145.

Walks every HTML page of work/ (archives, studies and checks included), honouring
<base href> for the page's own href/src attributes, then follows module imports
(static and literal dynamic) relative to each module and url()/@import relative to
each stylesheet. For every page whose graph reaches one of the changed ACTIVE files
(entrance.mjs, entrance.css, comments.mjs, project-ui.mjs, journal-ui.mjs,
welcome.mjs, content-preview.mjs of site), records
the identifier used, whether the page starts on the arrival (body data-entry), whether
its markup has #entry-theme-toggle, and whether a loaded module calls mountEntrance
with cycleLabels. Writes only consumers.json next to itself.
"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json, re

ROOT = Path('/home/le-rif/Bureau/Transcendence')
WORK = ROOT / 'work'
ACTIVE = ROOT / 'site'
HERE = Path(__file__).resolve().parent
CHANGED = {name: (ACTIVE / name).resolve() for name in
           ['entrance.mjs', 'entrance.css', 'comments.mjs', 'project-ui.mjs', 'journal-ui.mjs', 'welcome.mjs', 'content-preview.mjs']}
BY_PATH = {path: name for name, path in CHANGED.items()}
NEW_ID = {'entrance.mjs': 'v=audit-fixes-14', 'entrance.css': 'v=audit-fixes-24', 'comments.mjs': 'v=16', 'project-ui.mjs': 'v=40',
          'journal-ui.mjs': 'v=39', 'welcome.mjs': 'v=audit-fixes-145', 'content-preview.mjs': 'v=112'}

ATTR = re.compile(r'''<(?:script|link|img|iframe|source)\b[^>]*?\b(?:href|src)\s*=\s*["']([^"']+)["']''', re.I)
BASE = re.compile(r'''<base\b[^>]*\bhref\s*=\s*["']([^"']+)["']''', re.I)
STATIC_IMPORT = re.compile(r'''\b(?:import|export)\s*(?:[^'";]*?\bfrom\s*)?["']([^"']+)["']''')
DYNAMIC_IMPORT = re.compile(r'''\bimport\(\s*["']([^"'$`]+)["']\s*\)''')
CSS_REF = re.compile(r'''(?:@import\s+(?:url\()?\s*["']?|url\(\s*["']?)([^"')\s]+)''')


def local(base_dir, value):
    url = urlsplit(value)
    if url.scheme or url.netloc or not url.path or value.startswith(('#', 'data:')):
        return None, None
    return (base_dir / unquote(url.path)).resolve(), url.query


def walk_page(page):
    text = page.read_text(errors='replace')
    base_match = BASE.search(text)
    base_dir = (page.parent / base_match.group(1)).resolve() if base_match else page.parent
    pending = []
    for value in ATTR.findall(text):
        target, query = local(base_dir, value)
        if target is not None:
            pending.append((target, query, str(page.relative_to(ROOT))))
    seen, hits, missing = set(), [], []
    while pending:
        target, query, origin = pending.pop()
        if target in BY_PATH:
            hits.append({'file': BY_PATH[target], 'identifier': query, 'from': origin})
        key = target
        if key in seen:
            continue
        seen.add(key)
        if not target.is_file():
            missing.append({'file': str(target), 'from': origin})
            continue
        if target.suffix in {'.mjs', '.js'} and not target.name.endswith('.min.js') and target.parent.name != 'vendor':
            source = target.read_text(errors='replace')
            for value in STATIC_IMPORT.findall(source) + DYNAMIC_IMPORT.findall(source):
                if not value.startswith(('.', '/')):
                    continue
                child, child_query = local(target.parent, value)
                if child is not None:
                    pending.append((child, child_query, str(target.relative_to(ROOT)) if target.is_relative_to(ROOT) else str(target)))
        elif target.suffix == '.css':
            for value in CSS_REF.findall(target.read_text(errors='replace')):
                child, child_query = local(target.parent, value)
                if child is not None and child.suffix == '.css':
                    pending.append((child, child_query, str(target.relative_to(ROOT))))
    return text, base_match.group(1) if base_match else None, seen, hits, missing


rows = []
for page in sorted(WORK.rglob('*.html')):
    if '.git' in page.parts or 'node_modules' in page.parts:
        continue
    text, base, seen, hits, missing = walk_page(page)
    if not hits:
        continue
    entry = re.search(r'<body\b[^>]*\bdata-entry\s*=\s*["\']([^"\']+)["\']', text)
    mounts = []
    for module in sorted(p for p in seen if p.suffix == '.mjs' and p.is_file()):
        source = module.read_text(errors='replace')
        for match in re.finditer(r'(?<!function )mountEntrance\(\{', source):
            call = source[match.start():match.start() + 400]
            mounts.append({'module': str(module.relative_to(ROOT)), 'cycleLabels': 'cycleLabels:true' in call.replace(' ', '')})
    relative = page.relative_to(ROOT).as_posix()
    zone = 'archive' if '/archive/' in relative else 'checks' if '/checks/' in relative else 'active'
    rows.append({
        'page': relative, 'zone': zone, 'base': base,
        'bodyDataEntry': entry.group(1) if entry else None,
        'startsOnArrival': (entry.group(1) if entry else None) != 'welcome',
        'hasEntryThemeToggle': 'id="entry-theme-toggle"' in text,
        'changedFilesLoaded': sorted({(hit['file'], hit['identifier']) for hit in hits}),
        'usesCurrentIdentifiers': all(hit['identifier'] == NEW_ID[hit['file']] for hit in hits),
        'mountEntranceCalls': mounts,
        'hasAccountSignupCode': any('signup' in p.read_text(errors='replace') and 'accountAction' in p.read_text(errors='replace')
                                    for p in seen if p.suffix == '.mjs' and p.is_file()),
        'hasCommentSortCode': any('cp-comments-sort' in p.read_text(errors='replace') for p in seen if p.suffix == '.mjs' and p.is_file()),
        'missingLocalFiles': missing[:10],
    })

summary = {
    'pagesLoadingChangedFiles': len(rows),
    'byZone': {zone: [row['page'] for row in rows if row['zone'] == zone] for zone in ['active', 'checks', 'archive']},
    'pagesWithStaleIdentifiers': [{'page': row['page'], 'loaded': row['changedFilesLoaded']} for row in rows if not row['usesCurrentIdentifiers']],
    'pagesMountingEntranceWithoutCycleLabels': [row['page'] for row in rows if any(not call['cycleLabels'] for call in row['mountEntranceCalls'])],
}
result = {'date': '2026-10-15',
          'scope': 'Inventaire en lecture seule des pages qui chargent un des sept fichiers actifs modifiés par audit-fixes-145 (base href respecté). Écrit seulement ce fichier.',
          'summary': summary, 'pages': rows}
(HERE / 'consumers.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(summary, ensure_ascii=False, indent=1))
for row in rows:
    print(row['zone'], row['page'], 'entry=', row['bodyDataEntry'], 'toggle=', row['hasEntryThemeToggle'], 'files=', row['changedFilesLoaded'],
          'mount=', [(c['module'].split('/')[-1], c['cycleLabels']) for c in row['mountEntranceCalls']], 'signup=', row['hasAccountSignupCode'],
          'sort=', row['hasCommentSortCode'])
