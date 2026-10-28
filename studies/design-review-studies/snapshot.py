#!/usr/bin/env python3
"""Freeze the design-review study's local runtime; never replace an existing experiment.

python3 snapshot.py --verify
python3 snapshot.py --output /tmp/horizon-design-review-snapshot-reproduction

Copies the current Horizon prototype (both entries: index.html with the arrival
and content-preview.html) into baseline/. The copy only gains a trial loader
(../essais/*) and a read-only study bridge; trials stay inactive unless the URL
asks for them with ?essais=id1,id2. Original bytes of adapted files are kept in
originals/ and every file is recorded with its hash in snapshot-manifest.json.
"""
from pathlib import Path
import argparse
import hashlib
import json
import re

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
VISUALIZATIONS = REPO / 'work/visualizations'
SOURCE = VISUALIZATIONS / 'horizon-welcome'
TEXT_SUFFIXES = {'.html', '.mjs', '.js', '.css', '.json'}
EXTENSIONS = r'(?:mjs|js|css|json(?:\.gz)?|svg|png|jpg|jpeg|webp|ttf|html)'
QUOTED_REFERENCE = re.compile(r'''["']([a-zA-Z0-9_./-]+\.''' + EXTENSIONS + r'''(?:\?[^"']*)?)["']''')
CSS_REFERENCE = re.compile(r'''url\(\s*["']?([^\s)"']+)["']?\s*\)''')
STORAGE_KEYS = (
    'horizon-theme-preference-v1',
    'horizon-content-preferences-v2',
    'horizon-content-preferences-v1',
    'horizon-content-view',
    'horizon-comments-demo-v1:',
    'horizon-content-reports-v1',
    'horizon-project-repository-v1:',
)
STORAGE_PREFIX = 'horizon-design-review-studies-20261014-'
EXTERNAL_PATHS = {
    '../../figma/': './shared/figma/',
    '../assets/': './shared/assets/',
    '../map-data/': './shared/map-data/',
    '../decryption-examples/': './shared/decryption-examples/',
}
ENTRIES = ('content-preview.html', 'index.html')
STUDY_TITLE = '42 Horizon — Essais issus de l’avis sur le design'
LOADER_HEAD = '  <script src="../essais/boot.js?v=1"></script>\n'
LOADER_TAIL = '  <script src="../essais/styles.js?v=1"></script>\n  <script type="module" src="../essais/modules.mjs?v=1"></script>\n</head>'
BRIDGE = """
// Study-only bridge (design-review-studies, 14 Oct 2026); absent from the active prototype.
window.horizonStudy = Object.freeze({
 get globe(){return globe;}, get locale(){return locale;}, get section(){return section;},
 setLocale(value){if(['fr','en','ar'].includes(value)&&value!==locale){locale=value;localize();}},
});
"""


def digest(data):
    return hashlib.sha256(data).hexdigest()


def destination(path):
    if path.is_relative_to(SOURCE):
        return path.relative_to(SOURCE)
    if path.is_relative_to(REPO / 'work/figma'):
        return Path('shared/figma') / path.relative_to(REPO / 'work/figma')
    if path.is_relative_to(VISUALIZATIONS):
        return Path('shared') / path.relative_to(VISUALIZATIONS)
    raise ValueError(f'Unmapped dependency: {path}')


def references(path, data):
    refs = QUOTED_REFERENCE.findall(data)
    if path.suffix == '.css':
        refs += CSS_REFERENCE.findall(data)
    return [ref for ref in refs if not ref.startswith(('http:', 'https:', 'data:', '#'))]


def runtime_files():
    pending = [SOURCE / name for name in ENTRIES]
    pending += [SOURCE / 'vendor/maplibre-LICENSE.txt', SOURCE / 'vendor/maplibre-PROVENANCE.md', SOURCE / 'geography/PROVENANCE.md']
    seen = set()
    while pending:
        path = pending.pop().resolve()
        if path in seen:
            continue
        if not path.is_file():
            raise FileNotFoundError(path)
        seen.add(path)
        if path.suffix not in TEXT_SUFFIXES or path.name.endswith('.min.js') or path.parent.name == 'vendor':
            continue
        data = path.read_text()
        for ref in references(path, data):
            candidate = (path.parent / ref.split('?')[0]).resolve()
            if candidate.is_file():
                pending.append(candidate)
    return sorted(seen)


def adapt(path, data):
    changes = []
    if path.suffix not in TEXT_SUFFIXES or path.name.endswith('.min.js') or path.parent.name == 'vendor':
        return data, changes
    value = data.decode()
    if path.parent == SOURCE:
        for before, after in EXTERNAL_PATHS.items():
            if before in value:
                count = value.count(before)
                value = value.replace(before, after)
                changes.append({'kind': 'dependency-url', 'from': before, 'to': after, 'count': count})
    for before in STORAGE_KEYS:
        if before in value:
            after = STORAGE_PREFIX + before.removeprefix('horizon-')
            count = value.count(before)
            value = value.replace(before, after)
            changes.append({'kind': 'isolated-storage', 'from': before, 'to': after, 'count': count})
    if path.parent == SOURCE and path.name in ENTRIES:
        needle = '  <script src="theme-bootstrap.js?v=1"></script>\n'
        if value.count(needle) != 1 or value.count('</head>') != 1:
            raise ValueError(f'Loader insertion points changed in {path.name}')
        value = value.replace(needle, LOADER_HEAD + needle).replace('</head>', LOADER_TAIL)
        value, titles = re.subn(r'<title>[^<]*</title>', f'<title>{STUDY_TITLE}</title>', value, count=1)
        if titles != 1:
            raise ValueError(f'Title changed in {path.name}')
        changes.append({'kind': 'study-entry', 'description': 'Boot the trial loader before theme-bootstrap.js, load active trial styles/modules last; study-specific title. No trial is active without ?essais=.'})
    if path == SOURCE / 'welcome.mjs':
        value = value.rstrip('\n') + '\n' + BRIDGE
        changes.append({'kind': 'study-bridge', 'description': 'Append read-only getters (globe, locale, section) and setLocale() used by ?lang=; defined after the controller finished initialising.'})
    return value.encode(), changes


def check_references(output):
    """Every relative reference of the copied runtime must resolve inside the study."""
    baseline = output / 'baseline'
    missing, outside, count = [], [], 0
    for path in sorted(baseline.rglob('*')):
        if not path.is_file() or path.suffix not in TEXT_SUFFIXES or path.name.endswith('.min.js') or path.parent.name == 'vendor':
            continue
        for ref in references(path, path.read_text()):
            count += 1
            target = (path.parent / ref.split('?')[0]).resolve()
            if not target.is_relative_to(output.resolve()):
                outside.append(f'{path.relative_to(output)} -> {ref}')
            elif not target.is_file() and not ref.startswith('../essais/'):
                missing.append(f'{path.relative_to(output)} -> {ref}')
    return {'references': count, 'missing': missing, 'outsideStudy': outside}


def build(output):
    baseline = output / 'baseline'
    if baseline.exists() or (output / 'snapshot-manifest.json').exists():
        raise SystemExit('Refusing to replace an existing study snapshot. Choose a new --output directory.')
    output.mkdir(parents=True, exist_ok=True)
    records = []
    for source in runtime_files():
        relative = destination(source)
        original = source.read_bytes()
        result, changes = adapt(source, original)
        target = baseline / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(result)
        record = {
            'source': source.relative_to(REPO).as_posix(),
            'sourceBytes': len(original), 'sourceSha256': digest(original),
            'runtime': target.relative_to(output).as_posix(),
            'runtimeBytes': len(result), 'runtimeSha256': digest(result),
        }
        if changes:
            preserved = output / 'originals' / relative
            preserved.parent.mkdir(parents=True, exist_ok=True)
            preserved.write_bytes(original)
            record.update({'original': preserved.relative_to(output).as_posix(), 'changes': changes})
        records.append(record)
    manifest = {
        'date': '2026-10-14',
        'purpose': 'Isolated trials of the changes proposed in the 14 Oct design review; not an integration or a selected design.',
        'entries': ['baseline/index.html', 'baseline/content-preview.html'],
        'trialParameter': '?essais=id1,id2 (none active by default); optional ?theme=light|dark and ?lang=fr|en|ar',
        'localDependencies': 'Physical snapshots; no runtime references to the active horizon-welcome directory.',
        'externalServices': 'Campus vector tiles, glyphs and sprites still use the existing external map provider when a campus is explored.',
        'storagePrefix': STORAGE_PREFIX,
        'storageReplacements': {key: STORAGE_PREFIX + key.removeprefix('horizon-') for key in STORAGE_KEYS},
        'extensions': ['essais/boot.js', 'essais/styles.js', 'essais/modules.mjs', 'essais/<id>/essai.css', 'essais/<id>/essai.mjs'],
        'sourceCount': len(records),
        'files': records,
    }
    (output / 'snapshot-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    verify(output)


def verify(output):
    manifest = json.loads((output / 'snapshot-manifest.json').read_text())
    for record in manifest['files']:
        data = (output / record['runtime']).read_bytes()
        assert digest(data) == record['runtimeSha256'], record['runtime']
        assert len(data) == record['runtimeBytes'], record['runtime']
        original = (output / record.get('original', record['runtime'])).read_bytes()
        assert digest(original) == record['sourceSha256'], record['source']
    refs = check_references(output)
    result = {'verified': len(manifest['files']), 'adaptedOriginals': sum('original' in row for row in manifest['files']),
              'runtimeBytes': sum(row['runtimeBytes'] for row in manifest['files']), **refs}
    (output / 'snapshot-verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: (v if not isinstance(v, list) else len(v)) for k, v in result.items()}))
    assert not refs['missing'] and not refs['outsideStudy'], refs


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=HERE)
    parser.add_argument('--verify', action='store_true')
    args = parser.parse_args()
    if args.verify:
        verify(args.output)
    else:
        build(args.output)
