"""Contrôle de code (sans navigateur) pour la zone « arrivée » — 15 octobre 2026.

1. Les 137 sources du manifeste de l'archive 144 comparées aux fichiers actifs : liste exacte des
   fichiers modifiés entre 144 et 145.
2. Pour entrance.mjs, entrance.css et welcome.mjs : lignes ajoutées/retirées entre l'original 144
   (originals/ si adapté, sinon baseline/) et l'actif, comparées au diff fourni (audit-fixes.diff).
3. welcome-panels.html / welcome-panels.mjs : inchangés dans git et absents du diff.
Lecture seule ; écrit uniquement controle-code.json dans ce dossier.
"""
import json, hashlib, subprocess, difflib, re
from pathlib import Path
HW = Path('/home/le-rif/Bureau/Transcendence/site')
REPO = Path('/home/le-rif/Bureau/Transcendence')
ARCH = HW / 'archive/pre-codex-audit-fixes-20261015'
DIFF = Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/audit-fixes.diff')
OUT = HW / 'checks/20261015-audit-fixes/arrivee/controle-code.json'
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
man = json.loads((ARCH / 'snapshot-manifest.json').read_text())
changed, missing = [], []
for f in man['files']:
    src = REPO / f['source']
    if not src.exists(): missing.append(f['source']); continue
    if sha(src) != f['sourceSha256']: changed.append(f['source'])
# Lines of the provided diff, per file.
given = {}
cur = None
for line in DIFF.read_text().splitlines():
    m = re.match(r'^\+\+\+ 145/(.+)$', line)
    if m: cur = m.group(1); given.setdefault(cur, {'+': [], '-': []}); continue
    if line.startswith('--- ') or line.startswith('@@'): continue
    if cur and line[:1] in '+-': given[cur][line[0]].append(line[1:])
def original(name):
    o = ARCH / 'originals' / name
    return o if o.exists() else ARCH / 'baseline' / name
actual = {}
for name in sorted(given):
    a = original(name).read_text().splitlines(); b = (HW / name).read_text().splitlines()
    plus, minus = [], []
    for line in difflib.unified_diff(a, b, lineterm='', n=0):
        if line.startswith('+++') or line.startswith('---') or line.startswith('@@'): continue
        if line[:1] == '+': plus.append(line[1:])
        elif line[:1] == '-': minus.append(line[1:])
    actual[name] = {'matchesGivenDiff': plus == given[name]['+'] and minus == given[name]['-'], 'added': len(plus), 'removed': len(minus), 'original': str(original(name).relative_to(HW))}
git = subprocess.run(['git', '-C', str(REPO), 'status', '--short', '--', 'archives/early-prototypes/welcome-panels/welcome-panels.html', 'archives/early-prototypes/welcome-panels/welcome-panels.mjs'], capture_output=True, text=True).stdout
log = subprocess.run(['git', '-C', str(REPO), 'log', '-1', '--format=%h %ad %s', '--date=short', '--', 'archives/early-prototypes/welcome-panels/welcome-panels.html'], capture_output=True, text=True).stdout.strip()
panels_imports = [l.strip() for l in (HW / 'welcome-panels.mjs').read_text().splitlines() if 'entrance.mjs' in l or 'mountEntrance(' in l]
result = {
    'manifestSources': len(man['files']), 'missingActiveSources': missing,
    'changedSources144to145': sorted(changed),
    'givenDiffFiles': sorted(given),
    'changedEqualsDiffFiles': sorted(c.split('horizon-welcome/', 1)[-1] for c in changed) == sorted(given),
    'perFile': actual,
    'welcomePanels': {'gitStatus': git.strip() or 'inchangé (aucune modification par rapport à HEAD)', 'lastCommit': log,
                      'sha256': {n: sha(HW / n) for n in ['welcome-panels.html', 'welcome-panels.mjs']}, 'inGivenDiff': any(n.startswith('welcome-panels') for n in given),
                      'entranceImportAndCall': panels_imports},
    'welcomeMjsCycleLabelsCalls': [l.strip()[:160] for l in (HW / 'welcome.mjs').read_text().splitlines() if 'cycleLabels' in l],
    'otherCallersOfMountEntrance': sorted(str(p.relative_to(HW)) for p in HW.glob('*.mjs') if 'mountEntrance(' in p.read_text() and p.name not in ('entrance.mjs',)),
}
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1) + '\n')
print(json.dumps(result, ensure_ascii=False, indent=1))
