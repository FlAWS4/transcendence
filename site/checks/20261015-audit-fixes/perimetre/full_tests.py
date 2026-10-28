"""Run the full active Horizon test campaign (read-only) and compare test files with the 14 October campaign.

Command: node --test <folder>/*.test.mjs <folder>/tests/*.test.mjs (absolute paths).
Hashes every test file before and after the run, compares them with the hashes
recorded by checks/20261014-full-tests-after-resumed-checks.json (651/651 on
14 October) and lists which test files changed since. The TAP log stays in the
scratchpad. Writes only full-tests.json next to itself.
"""
from pathlib import Path
import hashlib, json, re, subprocess, time

REPO = Path('/home/le-rif/Bureau/Transcendence')
FOLDER = REPO / 'site'
TMP = Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/verif-perimetre')
HERE = Path(__file__).resolve().parent
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
files = sorted(FOLDER.glob('*.test.mjs')) + sorted((FOLDER / 'tests').glob('*.test.mjs'))
before = {str(p.relative_to(REPO)): sha(p) for p in files}
start = time.time()
out = subprocess.run(['node', '--test', '--test-reporter=tap', *map(str, files)], capture_output=True, text=True, cwd=str(REPO), timeout=230)
duration = round(time.time() - start, 1)
after = {str(p.relative_to(REPO)): sha(p) for p in files}
TMP.mkdir(parents=True, exist_ok=True)
(TMP / 'full-tests.tap').write_text(out.stdout + '\n--- stderr ---\n' + out.stderr)
summary = {key: int(value) for key, value in re.findall(r'^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)$', out.stdout, re.M)}
failing = [m.group(1) for m in re.finditer(r'^\s*not ok \d+ - (.*)$', out.stdout, re.M)]
recorded = json.loads((FOLDER / 'checks/20261014-full-tests-after-resumed-checks.json').read_text())
old = recorded['testFileHashes']
result = {
    'date': '2026-10-15',
    'scope': 'Campagne complète des tests actifs après les corrections audit-fixes-145 ; comparaison des fichiers de test avec la campagne du 14 octobre (651/651). Lecture seule.',
    'command': 'node --test --test-reporter=tap ' + ' '.join(map(str, files[:1])) + ' … (' + str(len(files)) + ' fichiers)',
    'files': len(files), 'durationSeconds': duration, 'exitCode': out.returncode, 'summary': summary, 'failing': failing,
    'testFilesStableDuringRun': before == after,
    'campaign20261014': recorded['summary'],
    'testFilesChangedSince20261014': sorted(name for name in after if old.get(name) != after[name]),
    'testFilesAddedSince20261014': sorted(name for name in after if name not in old),
    'testFilesRemovedSince20261014': sorted(name for name in old if name not in after),
    'hashes': after,
    'stderrTail': out.stderr[-2000:],
}
(HERE / 'full-tests.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: result[k] for k in ['files', 'durationSeconds', 'exitCode', 'summary', 'failing', 'testFilesStableDuringRun', 'campaign20261014',
                                        'testFilesChangedSince20261014', 'testFilesAddedSince20261014', 'testFilesRemovedSince20261014']}, ensure_ascii=False, indent=1))
