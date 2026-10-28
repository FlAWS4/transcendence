"""Run the two changed test files against the archived 144 sources and the active 145 sources.

Builds three isolated copies in the scratchpad (never in the repository):
  old/    archived 144 entrance.mjs + comments.mjs (originals/) with the active 145 test files;
  new/    active 145 entrance.mjs + comments.mjs with the same test files (control);
  forced/ active 145 sources with the entrance harness forced to cycleLabels=true for every test,
          to check that the scan/decryption/failure tests, which now default to the panels path
          (cycleLabels=false), still pass on the main-entrance path as they did in 144.
Every copied byte is checked against the archive manifest or the active file. The
test files keep their relative imports through a mirrored directory layout.
Writes only fail-before.json next to itself; TAP logs stay in the scratchpad.
"""
from pathlib import Path
import hashlib, json, re, shutil, subprocess

REPO = Path('/home/le-rif/Bureau/Transcendence')
FOLDER = REPO / 'site'
ARCH = FOLDER / 'archive/pre-codex-audit-fixes-20261015'
TMP = Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/verif-perimetre')
HERE = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = {r['source']: r for r in json.loads((ARCH / 'snapshot-manifest.json').read_text())['files']}


def archived(source):
    record = manifest[source]
    data = (ARCH / record.get('original', record['runtime'])).read_bytes()
    assert sha(data) == record['sourceSha256'], source
    return data


def layout(target, code):
    if target.exists():
        shutil.rmtree(target)
    hw = target / 'horizon-welcome'
    (hw / 'tests').mkdir(parents=True)
    (target / 'decryption-examples').mkdir(parents=True)
    copied = {}
    # Unchanged dependencies: archive bytes (identical to the active files, checked in scope.json).
    for source, destination in [
        ('studies/decryption-examples/shared.mjs', target / 'decryption-examples/shared.mjs'),
        ('studies/decryption-examples/scanner-return-together.mjs', target / 'decryption-examples/scanner-return-together.mjs'),
        ('studies/decryption-examples/scanner-return-random.mjs', target / 'decryption-examples/scanner-return-random.mjs'),
        ('archives/early-prototypes/decryption/horizon-decryption-engine.mjs', target / 'horizon-decryption-engine.mjs'),
        ('site/comment-mentions.mjs', hw / 'comment-mentions.mjs'),
        ('site/comment-mention-picker.mjs', hw / 'comment-mention-picker.mjs'),
    ]:
        data = archived(source)
        assert data == (REPO / source).read_bytes(), source
        destination.write_bytes(data); copied[str(destination.relative_to(TMP))] = sha(data)
    for name in ['entrance.mjs', 'comments.mjs']:
        source = 'site/' + name
        data = archived(source) if code == '144' else (REPO / source).read_bytes()
        (hw / name).write_bytes(data); copied[str((hw / name).relative_to(TMP))] = sha(data)
    for name in ['entrance.test.mjs', 'tests/comments-actions.test.mjs']:
        data = (FOLDER / name).read_bytes()
        (hw / name).write_bytes(data); copied[str((hw / name).relative_to(TMP))] = sha(data)
    return hw, copied


def run(hw, label):
    files = [str(hw / 'entrance.test.mjs'), str(hw / 'tests/comments-actions.test.mjs')]
    out = subprocess.run(['node', '--test', '--test-reporter=tap', *files], capture_output=True, text=True, cwd=str(TMP), timeout=180)
    log = TMP / f'{label}.tap'
    log.write_text(out.stdout + '\n--- stderr ---\n' + out.stderr)
    results = {}
    for line in out.stdout.splitlines():
        match = re.match(r'^\s*(not ok|ok) \d+ - (.*?)(?: # .*)?$', line)
        if match and not match.group(2).startswith('/'):
            results[match.group(2).strip()] = match.group(1) == 'ok'
    summary = {key: int(value) for key, value in re.findall(r'^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$', out.stdout, re.M)}
    return {'exitCode': out.returncode, 'summary': summary, 'results': results, 'log': str(log)}


new_tests = json.loads((HERE / 'scope.json').read_text())['tests']
added = [name for row in new_tests for name in row['added']]
report = {'date': '2026-10-15', 'scope': 'Les 6 nouveaux tests contre les sources archivées 144 et actives 145, copies isolées hors dépôt ; variante cycleLabels forcé à true.', 'newTests': added}
for label, code in [('old', '144'), ('new', '145')]:
    hw, copied = layout(TMP / label, code)
    outcome = run(hw, label)
    outcome['copied'] = copied
    outcome['newTests'] = {name: outcome['results'].get(name) for name in added}
    outcome['otherFailures'] = [name for name, ok in outcome['results'].items() if not ok and name not in added]
    report[label] = outcome

# Variant: active code, harness default forced to the main-entrance path.
hw, copied = layout(TMP / 'forced', '145')
text = (hw / 'entrance.test.mjs').read_text()
needle = 'interactions=false,cycleLabels=interactions,'
assert text.count(needle) == 1
(hw / 'entrance.test.mjs').write_text(text.replace(needle, 'interactions=false,cycleLabels=true,'))
outcome = run(hw, 'forced')
outcome['adaptation'] = 'harness default cycleLabels=interactions replaced by cycleLabels=true'
outcome['failures'] = [name for name, ok in outcome['results'].items() if not ok]
report['forcedCycleLabels'] = outcome

(HERE / 'fail-before.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
for label in ['old', 'new']:
    print(label, report[label]['summary'], 'exit', report[label]['exitCode'])
    for name, ok in report[label]['newTests'].items():
        print('   ', 'PASS' if ok else ('FAIL' if ok is False else 'ABSENT'), name)
    print('    other failures:', report[label]['otherFailures'])
print('forced', report['forcedCycleLabels']['summary'], 'failures:', report['forcedCycleLabels']['failures'])
