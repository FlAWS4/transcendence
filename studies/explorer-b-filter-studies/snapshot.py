"""Frozen copy of version B for the filter study (26 Oct 2026): build it once, then verify it.

    python3 -I -B studies/explorer-b-filter-studies/snapshot.py --source <site-b exported at 46279b0> --output <new folder>
    python3 -I -B studies/explorer-b-filter-studies/snapshot.py --verify

The copy is version B (site-b/) as committed in 46279b0, before the side rail's restyle (refinements X) that was in
progress: only the files its two pages load (index.html, content-preview.html, their modules, styles, data and
assets, with the licence and provenance notes of the copied assets), never notes/, tests/ or tools/. Three kinds of
adaptation, all listed in ADAPTATIONS and recorded in snapshot-manifest.json: the relative links that would break one
folder deeper (../shared/ becomes ../../../shared/), the browser storage keys (a prefix of the study's own, so that
the copy never reads or writes site-b's theme, preferences, favourites, comments, reports or repository links), and
the three lines that load the trial loader (essais/boot.js, essais/styles.js, essais/modules.mjs).

--verify checks the copy against git (every file not adapted is byte-identical to 46279b0, every adapted file is the
committed file with exactly the recorded adaptations), the fingerprints of the manifest, that every relative
reference stays inside the study or the repository's shared/, and that the import specifiers listed in
essais/styles.js match the copy's imports. It only reads; it writes snapshot-verification.json.
"""
import argparse, hashlib, json, os, re, shutil, subprocess, sys
from pathlib import Path

STUDY = Path(__file__).resolve().parent
REPO = STUDY.parent.parent
BASELINE = STUDY / 'baseline'
MANIFEST = STUDY / 'snapshot-manifest.json'
VERIFICATION = STUDY / 'snapshot-verification.json'
COMMIT = '46279b0'
SOURCE = 'site-b'
ENTRIES = ('index.html', 'content-preview.html')
STORAGE_PREFIX = 'horizon-explorer-b-filter-studies-20261026-'
# Folders whose files are named in code (flagHref builds 'assets/flags/' + iso2 + '.svg', the demo content
# './assets/profile-avatars/' + a name): copied whole.
DIRECTORIES = ('assets/flags', 'assets/profile-avatars')
# Licence and provenance notes travel with the assets they describe.
NOTES = re.compile(r'^(LICENSE|PROVENANCE)')


def storage(key):
    return (f"'{key}'", f"'{STORAGE_PREFIX}{key[len('horizon-'):]}'", 1)


def loader(page_module):
    return [
        ('loader', '  <script src="theme-bootstrap.js?v=1"></script>\n',
         '  <script src="../essais/boot.js?v=1"></script>\n  <script src="theme-bootstrap.js?v=1"></script>\n', 1),
        ('loader', f'  <script src="{page_module}?v=b7" type="module"></script>\n',
         f'  <script src="../essais/styles.js?v=1"></script>\n  <script src="{page_module}?v=b7" type="module"></script>\n', 1),
        ('loader', '  <script src="design-review-selection.mjs?v=1" type="module"></script>\n',
         '  <script src="design-review-selection.mjs?v=1" type="module"></script>\n  <script src="../essais/modules.mjs?v=1" type="module"></script>\n', 1),
    ]


# (kind, exact text, replacement, expected occurrences); applied in order to the committed bytes.
ADAPTATIONS = {
    'index.html': [('link', '"../shared/', '"../../../shared/', 5), *loader('welcome.mjs')],
    'content-preview.html': [('link', '"../shared/', '"../../../shared/', 5), *loader('content-preview.mjs')],
    'theme-bootstrap.js': [('storage', *storage('horizon-theme-preference-v1'))],
    'theme-preferences.mjs': [('storage', *storage('horizon-theme-preference-v1'))],
    'content-preferences.mjs': [('storage', *storage('horizon-content-preferences-v2')),
                                ('storage', *storage('horizon-content-preferences-v1')),
                                ('storage', *storage('horizon-content-view'))],
    'comments.mjs': [('storage', *storage('horizon-comments-demo-v1:'))],
    'content-report.mjs': [('storage', *storage('horizon-content-reports-v1'))],
    'project-trial.mjs': [('storage', *storage('horizon-project-repository-v1:'))],
}

HTML_REF = re.compile(r'''(?:src|href)\s*=\s*["']([^"'#]+)["']''')
IMPORTS = [re.compile(p) for p in (r'''\bfrom\s*['"]([^'"]+)['"]''', r'''\bimport\s*['"]([^'"]+)['"]''',
                                   r'''\bimport\(\s*['"]([^'"]+)['"]\s*\)''')]
# fetch()/json()/optional() resolve against the document (the copy's folder), imports against the module.
FETCHES = re.compile(r'''\b(?:json|optional|fetch)\(\s*['"]([^'"]+)['"]''')
CSS_URL = re.compile(r'''url\(\s*['"]?([^'")]+)['"]?\s*\)''')
DATA_ASSET = re.compile(r'''["'`]((?:\./)?assets/[^"'`\s]+?)["'`]''')


def adapt(path, data):
    changes = []
    if path not in ADAPTATIONS: return data, changes
    text = data.decode('utf-8')
    for kind, old, new, count in ADAPTATIONS[path]:
        found = text.count(old)
        if found != count: raise SystemExit(f'{path}: expected {count} × {old!r}, found {found}')
        text = text.replace(old, new)
        changes.append({'kind': kind, 'from': old, 'to': new, 'count': count})
    return text.encode('utf-8'), changes


def local(ref):
    return not re.match(r'^(?:[a-z][a-z0-9+.-]*:|//|#)', ref, re.I)


def references(root, rel):
    """Local references of one file, as (written, resolved path relative to root)."""
    path = root / rel
    if not rel.endswith(('.html', '.mjs', '.js', '.css', '.json')): return []
    text = path.read_text(encoding='utf-8', errors='replace')
    here = os.path.dirname(rel)
    found = []
    if rel.endswith('.html'): found += [(ref, here) for ref in HTML_REF.findall(text)]
    if rel.endswith(('.mjs', '.js')):
        for pattern in IMPORTS: found += [(ref, here) for ref in pattern.findall(text)]
        found += [(ref, '') for ref in FETCHES.findall(text)]
    if rel.endswith('.css'): found += [(ref, here) for ref in CSS_URL.findall(text) if not ref.startswith('#')]
    if rel.endswith(('.json', '.mjs')): found += [(ref, '') for ref in DATA_ASSET.findall(text)]
    out = []
    for ref, base in found:
        if not local(ref): continue
        out.append((ref, os.path.normpath(os.path.join(base, ref.split('?')[0].split('#')[0]))))
    return out


def closure(root):
    """Every file the two pages reach (static analysis), plus the folders named in code and the notes of copied assets."""
    seen, outside, queue = set(), {}, list(ENTRIES)
    while queue:
        rel = queue.pop()
        if rel in seen: continue
        seen.add(rel)
        if not (root / rel).is_file(): continue
        for ref, target in references(root, rel):
            if target.startswith('..'): outside.setdefault(target, set()).add(f'{rel}: {ref}')
            else: queue.append(target)
    files = {rel for rel in seen if (root / rel).is_file()}
    for folder in DIRECTORIES: files |= {f'{folder}/{p.name}' for p in (root / folder).iterdir() if p.is_file()}
    for folder in {os.path.dirname(rel) for rel in files if rel.startswith('assets/')}:
        files |= {f'{folder}/{p.name}' for p in (root / folder).iterdir() if p.is_file() and NOTES.match(p.name)}
    missing = sorted(rel for rel in seen - files if not any(rel == folder or rel.startswith(folder + '/') for folder in DIRECTORIES)
                     and not (root / rel).is_dir())
    return sorted(files), missing, {key: sorted(value) for key, value in outside.items()}


def specifiers(root, files):
    """Every specifier under which a module of the copy is imported, by module path (relative to the copy)."""
    table = {}
    for rel in files:
        if not rel.endswith(('.mjs', '.js')): continue
        text = (root / rel).read_text(encoding='utf-8')
        for pattern in IMPORTS:
            for ref in pattern.findall(text):
                if not ref.startswith('.'): continue
                path, _, query = ref.partition('?')
                target = os.path.normpath(os.path.join(os.path.dirname(rel), path))
                table.setdefault(target, set()).add(target + ('?' + query if query else ''))
    return {key: sorted(value) for key, value in sorted(table.items())}


def sha256(data): return hashlib.sha256(data).hexdigest()
def git_blob(data): return hashlib.sha1(b'blob %d\0' % len(data) + data).hexdigest()


def git(*args, binary=False):
    out = subprocess.run(['git', '-C', str(REPO), *args], check=True, capture_output=True)
    return out.stdout if binary else out.stdout.decode()


def committed():
    """{path relative to site-b: blob id} at COMMIT."""
    tree = {}
    for line in git('ls-tree', '-r', COMMIT, SOURCE).splitlines():
        meta, path = line.split('\t', 1)
        tree[path[len(SOURCE) + 1:]] = meta.split()[2]
    return tree


def build(source, output):
    source, output = Path(source).resolve(), Path(output).resolve()
    if output.exists() and any(output.iterdir()): raise SystemExit(f'{output} is not empty: build into a new folder')
    tree = committed()
    files, missing, outside = closure(source)
    if missing: raise SystemExit(f'missing in the source: {missing}')
    entries, adapted = [], []
    for rel in files:
        data = (source / rel).read_bytes()
        if tree.get(rel) != git_blob(data): raise SystemExit(f'{rel} differs from {COMMIT}:{SOURCE}/{rel}')
        out, changes = adapt(rel, data)
        target = output / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(out)
        entries.append({'path': rel, 'bytes': len(out), 'sha256': sha256(out), 'sourceBlob': tree[rel]})
        if changes: adapted.append({'path': rel, 'sha256Before': sha256(data), 'sha256After': sha256(out), 'changes': changes})
    excluded = sorted(set(tree) - set(files))
    reason = lambda rel: ('notes, tests or tools' if rel.split('/')[0] in ('notes', 'tests', 'tools') or rel.endswith('.test.mjs')
                          else 'not loaded by index.html or content-preview.html')
    manifest = {
        'date': '2026-10-26',
        'purpose': 'Frozen copy of version B for the trials of its filter (scope pill); not an integration or a selected design.',
        'source': f'git {COMMIT}:{SOURCE}/ (pushed on rel-hass), before the side rail restyle (refinements X) then in progress',
        'entries': [f'baseline/{entry}' for entry in ENTRIES],
        'trialParameter': '?essais=id1,id2 (none active by default); optional ?theme=light|dark|system and ?lang=fr|en|ar',
        'localDependencies': '../../../shared/ (the repository\'s shared/ folder, not copied); everything else is inside the study',
        'storagePrefix': STORAGE_PREFIX,
        'files': entries,
        'adapted': adapted,
        'outsideReferences': outside,
        'excluded': [{'path': rel, 'reason': reason(rel)} for rel in excluded],
        'specifiers': specifiers(output, files),
    }
    MANIFEST.write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps({'copied': len(entries), 'adapted': [item['path'] for item in adapted], 'excluded': len(excluded),
                      'outside': sorted(outside)}, indent=1, ensure_ascii=False))


def verify():
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    tree = committed()
    problems = []
    listed = {entry['path']: entry for entry in manifest['files']}
    present = {str(p.relative_to(BASELINE)) for p in BASELINE.rglob('*') if p.is_file()}
    problems += [f'not in the manifest: {rel}' for rel in sorted(present - set(listed))]
    problems += [f'missing: {rel}' for rel in sorted(set(listed) - present)]
    adapted = {item['path'] for item in manifest['adapted']}
    if adapted != set(ADAPTATIONS): problems.append(f'adapted files {sorted(adapted)} differ from {sorted(ADAPTATIONS)}')
    for rel in sorted(present & set(listed)):
        data = (BASELINE / rel).read_bytes()
        if sha256(data) != listed[rel]['sha256']: problems.append(f'fingerprint changed: {rel}')
        if rel not in tree: problems.append(f'not in {COMMIT}: {rel}'); continue
        if rel in ADAPTATIONS:
            original = git('cat-file', 'blob', tree[rel], binary=True)
            if adapt(rel, original)[0] != data: problems.append(f'adapted file differs from {COMMIT} + its adaptations: {rel}')
        elif git_blob(data) != tree[rel]: problems.append(f'differs from {COMMIT}: {rel}')
    # Every relative reference of the copy stays in the study or in the repository's shared/.
    references_checked, outside = 0, []
    for rel in sorted(present):
        for ref, target in references(BASELINE, rel):
            references_checked += 1
            absolute = (BASELINE / target).resolve()
            inside_study, in_shared = STUDY in absolute.parents, (REPO / 'shared') in absolute.parents
            if not (inside_study or in_shared): outside.append(f'{rel}: {ref}')
            # A folder written in code (« 'assets/flags/' + iso2 + '.svg' ») is copied whole: it must exist.
            elif not (absolute.is_file() or absolute.is_dir() and target in DIRECTORIES):
                problems.append(f'broken reference {rel}: {ref}')
    problems += [f'reference outside the study and shared/: {item}' for item in outside]
    # The table of essais/styles.js (import map keys) matches the copy's imports.
    styles = (STUDY / 'essais' / 'styles.js').read_text(encoding='utf-8')
    block = re.search(r'/\* specifiers:start \*/(.*?)/\* specifiers:end \*/', styles, re.S)
    table = json.loads(block.group(1)) if block else None
    expected = specifiers(BASELINE, sorted(present))
    if table != expected: problems.append('essais/styles.js: the specifier table does not match the copy\'s imports')
    if manifest['specifiers'] != expected: problems.append('snapshot-manifest.json: the specifier table does not match the copy\'s imports')
    for name in ('boot.js', 'styles.js', 'modules.mjs', 'pill.mjs'):
        if not (STUDY / 'essais' / name).is_file(): problems.append(f'loader file missing: essais/{name}')
    result = {'commit': COMMIT, 'verified': len(present & set(listed)), 'adapted': sorted(adapted),
              'identicalToCommit': len(present & set(listed)) - len(adapted), 'references': references_checked,
              'specifiers': len(expected), 'problems': problems}
    VERIFICATION.write_text(json.dumps(result, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps(result, indent=1, ensure_ascii=False))
    return not problems


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--source'); parser.add_argument('--output'); parser.add_argument('--verify', action='store_true')
    args = parser.parse_args()
    if args.verify: sys.exit(0 if verify() else 1)
    if not (args.source and args.output): parser.error('--source and --output, or --verify')
    build(args.source, args.output)
