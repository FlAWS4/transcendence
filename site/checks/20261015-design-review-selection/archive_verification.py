"""Verification of archive/pre-design-review-selection-20261015 (state audit-fixes-146), read-only on the sources.

1. snapshot.py --verify (runtime and original hashes of the 137 files);
2. every recorded source hash equals the active file as read now (the archive is state 146, byte for byte);
3. relative references of the copied runtime resolve inside the archive (principle of check_references() in
   design-review-studies/snapshot.py, extended to the archive folder);
4. storage keys isolated with the archive prefix, cache identifiers of the captured state;
5. HTTP 200 of the main entries, served bytes identical to the archive files;
6. differences with the two earlier archives of the day (144, 145), by source path.
Writes the archive's snapshot-verification.json and a detailed copy next to this script.
python3 -I archive_verification.py"""
import hashlib, json, re, subprocess, sys
from pathlib import Path
from urllib.request import urlopen

HERE = Path(__file__).resolve().parent
ACTIVE = HERE.parents[1]
REPO = ACTIVE.parent
ARCHIVE = ACTIVE.parent / 'archives/site-versions/pre-design-review-selection-20261015'
EARLIER = {'144': ACTIVE.parent / 'archives/site-versions/pre-codex-audit-fixes-20261015', '145': ACTIVE.parent / 'archives/site-versions/pre-audit-fixes-refinement-20261015'}
PREFIX = 'horizon-archive-pre-design-review-selection-20261015-'
TEXT_SUFFIXES = {'.html', '.mjs', '.js', '.css', '.json'}
EXTENSIONS = r'(?:mjs|js|css|json(?:\.gz)?|svg|png|jpg|jpeg|webp|ttf|html)'
QUOTED_REFERENCE = re.compile(r'''["']([a-zA-Z0-9_./-]+\.''' + EXTENSIONS + r'''(?:\?[^"']*)?)["']''')
CSS_REFERENCE = re.compile(r'''url\(\s*["']?([^\s)"']+)["']?\s*\)''')
SERVER = 'http://127.0.0.1:8765/'
ENTRIES = ['baseline/index.html', 'baseline/content-preview.html', 'baseline/welcome.mjs', 'baseline/content-preview.mjs']


def sha(data): return hashlib.sha256(data).hexdigest()


def references(path, data):
    refs = QUOTED_REFERENCE.findall(data)
    if path.suffix == '.css': refs += CSS_REFERENCE.findall(data)
    return [ref for ref in refs if not ref.startswith(('http:', 'https:', 'data:', '#'))]


def check_references():
    missing, outside, count = [], [], 0
    for path in sorted((ARCHIVE / 'baseline').rglob('*')):
        if not path.is_file() or path.suffix not in TEXT_SUFFIXES or path.name.endswith('.min.js') or path.parent.name == 'vendor': continue
        for ref in references(path, path.read_text()):
            count += 1
            target = (path.parent / ref.split('?')[0]).resolve()
            if not target.is_relative_to(ARCHIVE.resolve()): outside.append(f'{path.relative_to(ARCHIVE)} -> {ref}')
            elif not target.is_file(): missing.append(f'{path.relative_to(ARCHIVE)} -> {ref}')
    return {'references': count, 'missing': missing, 'outsideArchive': outside}


def main():
    verify = subprocess.run([sys.executable, '-I', str(ARCHIVE / 'snapshot.py'), '--verify'], capture_output=True, text=True)
    assert verify.returncode == 0, verify.stderr
    manifest = json.loads((ARCHIVE / 'snapshot-manifest.json').read_text())
    rows = manifest['files']
    active_mismatch = [r['source'] for r in rows if sha((REPO / r['source']).read_bytes()) != r['sourceSha256']]
    refs = check_references()
    runtime_text = ''.join((ARCHIVE / r['runtime']).read_text(errors='replace') for r in rows if Path(r['runtime']).suffix in TEXT_SUFFIXES)
    keys = sorted(set(re.findall(re.escape(PREFIX) + r'[a-z0-9:-]+', runtime_text)))
    leftover = sorted(k for k in manifest['storageReplacements'] if re.search(r'''["'`]''' + re.escape(k), runtime_text))
    index = (ARCHIVE / 'baseline/index.html').read_text(); preview = (ARCHIVE / 'baseline/content-preview.html').read_text()
    caches = {'controller': re.search(r'welcome\.mjs\?v=([^"]+)"', index).group(1), 'preview': re.search(r'content-preview\.mjs\?v=([^"]+)"', preview).group(1),
              'entranceCss': re.search(r'entrance\.css\?v=([^"]+)"', index).group(1),
              'selectionPackageInArchive': 'design-review-selection' in index + preview}
    http = []
    for rel in ENTRIES:
        url = SERVER + (ARCHIVE / rel).relative_to(REPO).as_posix()
        with urlopen(url) as response: data = response.read(); status = response.status
        http.append({'url': url.replace(SERVER, '/'), 'status': status, 'bytes': len(data), 'identical': data == (ARCHIVE / rel).read_bytes()})
    earlier = {}
    for name, folder in EARLIER.items():
        old = {r['source']: r['sourceSha256'] for r in json.loads((folder / 'snapshot-manifest.json').read_text())['files']}
        new = {r['source']: r['sourceSha256'] for r in rows}
        earlier[name] = {'changed': sorted(k.split('horizon-welcome/')[-1] for k in set(old) & set(new) if old[k] != new[k]),
                         'added': sorted(set(new) - set(old)), 'removed': sorted(set(old) - set(new))}
    result = {'date': '2026-10-15', 'verified': len(rows), 'adaptedOriginals': sum('original' in r for r in rows),
              'runtimeBytes': sum(r['runtimeBytes'] for r in rows), 'sourcesMatchingActiveFiles': len(rows) - len(active_mismatch),
              'activeMismatches': active_mismatch, **refs, 'storagePrefix': PREFIX, 'isolatedStorageKeys': keys, 'unprefixedStorageKeys': leftover,
              'caches': caches, 'http': http, 'httpAllOk': all(h['status'] == 200 and h['identical'] for h in http), 'differencesWithEarlierArchives': earlier}
    passed = (not active_mismatch and not refs['missing'] and not refs['outsideArchive'] and len(keys) == 7 and not leftover
              and caches['controller'] == 'audit-fixes-146' and caches['preview'] == '113' and not caches['selectionPackageInArchive'] and result['httpAllOk'])
    result['passed'] = passed
    (HERE / 'step1' / 'archive-verification-detail.json').write_text(json.dumps(result, ensure_ascii=False, indent=1) + '\n')
    short = {k: result[k] for k in ('date', 'verified', 'adaptedOriginals', 'runtimeBytes', 'sourcesMatchingActiveFiles', 'references', 'missing', 'outsideArchive', 'storagePrefix', 'caches')}
    short['httpEntries'] = [{'path': h['url'].split('/archive/pre-design-review-selection-20261015/')[1], 'status': h['status'], 'identical': h['identical']} for h in http]
    short['passed'] = passed
    (ARCHIVE / 'snapshot-verification.json').write_text(json.dumps(short, ensure_ascii=False, indent=2) + '\n')
    print(verify.stdout.strip()); print(json.dumps({k: (v if not isinstance(v, list) or len(v) < 8 else len(v)) for k, v in result.items() if k != 'http'}, ensure_ascii=False, indent=1))
    assert passed


if __name__ == '__main__':
    main()
