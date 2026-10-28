"""Full test campaign of the active prototype, run from the repository root (README command), read-only.
Records the node --test summary, the failing tests and the hashes of the test files and of the two package files
and two entries, before and after the run (stable hashes expected).
python3 -I tests.py avant|apres  ->  tests-<mode>.json"""
import hashlib, json, re, subprocess, sys, time
from pathlib import Path

MODE = sys.argv[1] if len(sys.argv) > 1 else 'apres'
HERE = Path(__file__).resolve().parent
ACTIVE = HERE.parents[1]; REPO = ACTIVE.parent
TESTS = sorted(ACTIVE.glob('*.test.mjs')) + sorted((ACTIVE / 'tests').glob('*.test.mjs'))
WATCH = TESTS + [ACTIVE / n for n in ('index.html', 'content-preview.html', 'welcome.mjs', 'content-preview.mjs', 'design-review-selection.css', 'design-review-selection.mjs')]


def hashes():
    return {p.relative_to(REPO).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in WATCH if p.is_file()}


before = hashes(); start = time.time()
command = ['node', '--test', 'site/*.test.mjs', 'site/tests/*.test.mjs']
run = subprocess.run(' '.join(command), shell=True, cwd=REPO, capture_output=True, text=True, executable='/bin/bash')
duration = round(time.time() - start, 1); after = hashes()
summary = {k: int(v) for k, v in re.findall(r'^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)$', run.stdout, re.M)}
failing = re.findall(r'^not ok \d+ - (.+)$', run.stdout, re.M)
proof = {'date': '2026-10-15', 'mode': MODE,
         'scope': 'Full active Horizon test campaign ' + ('before' if MODE == 'avant' else 'after') + ' the integration of the design-review selection (state audit-fixes-146' + ('' if MODE == 'avant' else ' + design-review-selection CSS1/JS1') + ').',
         'command': ' '.join(command), 'files': len(TESTS), 'durationSeconds': duration, 'exitCode': run.returncode, 'summary': summary, 'failing': failing,
         'hashesStableDuringRun': before == after, 'hashes': after, 'stderrTail': run.stderr.strip().splitlines()[-20:]}
(HERE / f'tests-{MODE}.json').write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
(HERE / f'tests-{MODE}.tap.txt').write_text(run.stdout)
print(json.dumps({k: proof[k] for k in ('mode', 'files', 'durationSeconds', 'exitCode', 'summary', 'failing', 'hashesStableDuringRun', 'stderrTail')}, ensure_ascii=False, indent=1))
