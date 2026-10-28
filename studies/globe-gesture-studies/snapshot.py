#!/usr/bin/env python3
"""Freeze the globe study's local runtime; never replace an existing experiment.

python3 snapshot.py --verify
python3 snapshot.py --output /tmp/horizon-globe-snapshot-reproduction

New snapshots are made from the current Horizon sources. Recorded source hashes
identify the exact study baseline; original bytes of adapted files are retained.
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
STORAGE_PREFIX = 'horizon-globe-gesture-studies-20261013-'
EXTERNAL_PATHS = {
    '../../figma/': './shared/figma/',
    '../assets/': './shared/assets/',
    '../map-data/': './shared/map-data/',
    '../decryption-examples/': './shared/decryption-examples/',
}


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


def runtime_files():
    pending = [SOURCE / 'content-preview.html']
    # Keep the provenance of the two map libraries and geographic data.
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
        refs = QUOTED_REFERENCE.findall(data)
        if path.suffix == '.css':
            refs += CSS_REFERENCE.findall(data)
        for ref in refs:
            if ref.startswith(('http:', 'https:', 'data:', '#')):
                continue
            candidate = (path.parent / ref.split('?')[0]).resolve()
            if candidate.is_file():
                pending.append(candidate)
    return sorted(seen)


def adapt(path, data):
    changes = []
    if path.suffix not in TEXT_SUFFIXES or path.name.endswith('.min.js') or path.parent.name == 'vendor':
        return data, changes
    value = data.decode()
    # Only source-root modules use these shared paths. The shared subtree keeps
    # its original relative structure, including decryption -> engine imports.
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
    if path == SOURCE / 'content-preview.html':
        value = value.replace('</head>', '  <link rel="stylesheet" href="../study.css?v=1">\n  <script type="module" src="../study.mjs?v=1"></script>\n</head>')
        value = value.replace('<title>42 Horizon — Le contenu au premier plan</title>', '<title>42 Horizon — Essais des commandes du globe</title>')
        changes.append({'kind': 'study-entry', 'description': 'Load study.css and study.mjs after the baseline controller; study-specific document title.'})
    if path == SOURCE / 'welcome.mjs':
        needle = "let locale = 'fr', section = defaultSection, dark = false, globe, themeMenu, accountMenu;"
        if value.count(needle) != 1:
            raise ValueError('Welcome bridge insertion point changed')
        value = value.replace(needle, needle + "\n// Study-only bridge; no changes to the active prototype.\nwindow.horizonStudy = {get globe(){return globe;}, get locale(){return locale;}, get section(){return section;}};")
        value = value.replace("const defaultSection=hasEntrance?'explore':'projects';", "const defaultSection='explore'; // Study starts with the globe.")
        changes.append({'kind': 'study-bridge', 'description': 'Expose read-only getters for globe, locale and section; start the isolated review on Explorer.'})
    if path == SOURCE / 'integrated-globe.mjs':
        needle = 'return {selectCountry,selectCampus,visitRandomCampus,reset,back,zoomBy,refreshLayout,setTheme,getWorldScreenGeometry,beginCampusPreview,'
        if value.count(needle) != 1:
            raise ValueError('Globe bridge insertion point changed')
        value = value.replace(needle, needle + "\n  // These adapters belong only to the isolated control experiment.\n  getNavigationState,\n  beginControlGesture(){map.stop();setGestures(false);},\n  endControlGesture(){if(!flight&&!worldPreparing)setGestures(true);},")
        changes.append({'kind': 'study-globe-adapters', 'description': 'Expose existing navigation diagnostics and begin/endControlGesture for cancellable contextual controls.'})
    return value.encode(), changes


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
        'date': '2026-10-13',
        'purpose': 'Three isolated accessible control experiments, not an integration or a selected design.',
        'entry': 'baseline/content-preview.html?variant=1#explore',
        'localDependencies': 'Physical snapshots; no runtime references to the active horizon-welcome directory.',
        'externalServices': 'Campus vector tiles, glyphs and sprites still use the existing external map provider when a campus is explored.',
        'storagePrefix': STORAGE_PREFIX,
        'storageReplacements': {key: STORAGE_PREFIX + key.removeprefix('horizon-') for key in STORAGE_KEYS},
        'extensions': ['study.css', 'study.mjs'],
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
    print(json.dumps({'verified': len(manifest['files']), 'adaptedOriginals': sum('original' in row for row in manifest['files']), 'runtimeBytes': sum(row['runtimeBytes'] for row in manifest['files'])}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=HERE)
    parser.add_argument('--verify', action='store_true')
    args = parser.parse_args()
    if args.verify:
        verify(args.output)
    else:
        build(args.output)
