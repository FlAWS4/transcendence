#!/usr/bin/env python3
"""Run the archive's own verification and an out-of-tree reproduction, without touching the archive.

1. Hashes every file of archive/pre-codex-audit-fixes-20261015 before and after.
2. Runs `python3 -I snapshot.py --verify` (read-only; prints a summary).
3. Runs `python3 -I snapshot.py --output <scratchpad>/verif-perimetre/reproduction`:
   with the manifest present, the script reads only the archive's preserved bytes,
   so the reproduction must be byte-identical to baseline/, originals/ (runtime part)
   and snapshot-manifest.json.
Writes only archive-verify.json next to itself; the reproduction stays in the scratchpad.
"""
from pathlib import Path
import hashlib, json, shutil, subprocess

ARCH = Path('/home/le-rif/Bureau/Transcendence/archives/site-versions/pre-codex-audit-fixes-20261015')
TMP = Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/verif-perimetre')
OUT = TMP / 'reproduction'
HERE = Path(__file__).resolve().parent


def tree(root):
    return {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(root.rglob('*')) if p.is_file()}


before = tree(ARCH)
verify = subprocess.run(['python3', '-I', str(ARCH / 'snapshot.py'), '--verify'], capture_output=True, text=True, cwd=str(TMP), timeout=120)
if OUT.exists():
    shutil.rmtree(OUT)
build = subprocess.run(['python3', '-I', str(ARCH / 'snapshot.py'), '--output', str(OUT)], capture_output=True, text=True, cwd=str(TMP), timeout=180)
after = tree(ARCH)
reproduction = tree(OUT) if OUT.exists() else {}
archived_runtime = {k: v for k, v in before.items() if k.startswith(('baseline/', 'originals/')) or k == 'snapshot-manifest.json'}
# originals/ of the archive also holds the two test originals, which the snapshot script does not produce.
tests_manifest = json.loads((ARCH / 'test-source-manifest.json').read_text())
test_originals = {row['original'] for row in tests_manifest['files']}
expected = {k: v for k, v in archived_runtime.items() if k not in test_originals}
differences = sorted(k for k in set(expected) | set(reproduction) if expected.get(k) != reproduction.get(k))
result = {
    'date': '2026-10-15',
    'scope': 'Vérification propre de l’archive (snapshot.py --verify) et reproduction hors dépôt depuis ses octets conservés ; empreintes de l’archive avant/après. Écrit seulement ce fichier.',
    'verifyCommand': 'python3 -I ' + str(ARCH / 'snapshot.py') + ' --verify',
    'verifyExitCode': verify.returncode, 'verifyStdout': verify.stdout.strip(), 'verifyStderr': verify.stderr.strip()[-2000:],
    'reproductionCommand': 'python3 -I ' + str(ARCH / 'snapshot.py') + ' --output ' + str(OUT),
    'reproductionExitCode': build.returncode, 'reproductionStdout': build.stdout.strip(), 'reproductionStderr': build.stderr.strip()[-2000:],
    'archiveFiles': len(before), 'archiveUnchangedByTheseCommands': before == after,
    'reproducedFiles': len(reproduction), 'expectedFiles': len(expected),
    'reproductionByteIdentical': not differences and len(reproduction) == len(expected),
    'differences': differences[:50],
    'testOriginalsNotProducedByScript': sorted(test_originals),
}
(HERE / 'archive-verify.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(result, ensure_ascii=False, indent=1))
