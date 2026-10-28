#!/usr/bin/env python3
"""Read-only classification of the documentation files changed today (outside the runtime manifest).

For the three notes of horizon-welcome modified on 15 October: modification time,
every line mentioning 15 October, forward references ("voir plus bas", "ci-dessous")
and whether a 15 October section exists after them; Git insertions/deletions for the
tracked notes against HEAD. For the root documents: whether they mention the audit
fixes yet. Writes only docs.json next to itself.
"""
from pathlib import Path
import datetime, json, re, subprocess

REPO = Path('/home/le-rif/Bureau/Transcendence')
HW = REPO / 'site'
HERE = Path(__file__).resolve().parent
NOTES = ['ACTION_AND_COPY_NOTES.md', 'COMMENTS_NOTES.md', 'INTERFACE_POLISH_NOTES.md']
FORWARD = re.compile(r'voir plus bas|ci-dessous|suite ci-dessous')

rows = []
for name in NOTES:
    path = HW / name
    lines = path.read_text().splitlines()
    headings = [(index + 1, line) for index, line in enumerate(lines) if line.startswith('#')]
    dated = [{'line': index + 1, 'excerpt': line[max(0, line.find('15 octobre') - 160):line.find('15 octobre') + 60]}
             for index, line in enumerate(lines) if '15 octobre' in line]
    forward = []
    for index, line in enumerate(lines):
        for match in FORWARD.finditer(line):
            if '15 octobre' not in line[max(0, match.start() - 80):match.end()]:
                continue
            later = [heading for number, heading in headings if number > index + 1]
            forward.append({'line': index + 1, 'text': line[max(0, match.start() - 90):match.end() + 2],
                            'headingsAfter': later, 'fifteenthSectionAfter': any('15 octobre' in heading for heading in later)})
    status = subprocess.run(['git', '-C', str(REPO), 'ls-files', '--error-unmatch', str(path.relative_to(REPO))], capture_output=True, text=True)
    tracked = status.returncode == 0
    numstat = subprocess.run(['git', '-C', str(REPO), 'diff', '--numstat', 'HEAD', '--', str(path.relative_to(REPO))], capture_output=True, text=True).stdout.split() if tracked else []
    rows.append({
        'file': str(path.relative_to(REPO)),
        'mtime': datetime.datetime.fromtimestamp(path.stat().st_mtime).isoformat(timespec='seconds'),
        'lines': len(lines), 'lastHeading': headings[-1][1] if headings else None,
        'trackedByGit': tracked,
        'gitInsertionsSinceHead': int(numstat[0]) if numstat else None, 'gitDeletionsSinceHead': int(numstat[1]) if numstat else None,
        'linesMentioning15October': dated,
        'forwardReferencesTo15OctoberText': forward,
        'danglingForwardReferences': [ref['line'] for ref in forward if not ref['fifteenthSectionAfter']],
    })

root_docs = []
for name in ['PROJECT_CONTEXT.md', 'BOARDING_JOURNAL.md', 'README.md']:
    text = (REPO / name).read_text()
    root_docs.append({'file': name, 'mtime': datetime.datetime.fromtimestamp((REPO / name).stat().st_mtime).isoformat(timespec='seconds'),
                      'mentionsAuditFixes': bool(re.search(r'audit-fixes|pre-codex-audit|cinq défauts|five defects|Corrige ce qui est faux', text, re.I))})

result = {'date': '2026-10-15',
          'scope': 'Fichiers de documentation modifiés aujourd’hui hors manifeste (notes de horizon-welcome) et état des documents racine ; lecture seule.',
          'notes': rows, 'rootDocuments': root_docs}
(HERE / 'docs.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(result, ensure_ascii=False, indent=1))
