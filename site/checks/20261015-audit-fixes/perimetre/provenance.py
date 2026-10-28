#!/usr/bin/env python3
"""Independent provenance of the archived 144 state (read-only).

Compares the archive manifests of pre-codex-audit-fixes-20261015 with records made
BEFORE today's corrections by other procedures:
  - design-review-studies/snapshot-manifest.json (frozen copy of the prototype, 14 Oct 09:49);
  - checks/20261013-animated-entry-references.json (HTTP bodies of 144, 14 Oct 19:54);
  - checks/20261014-full-tests-after-resumed-checks.json (test file hashes, 14 Oct).
Writes only provenance.json next to itself.
"""
from pathlib import Path
from urllib.parse import urlsplit
import json

VIS = Path('/home/le-rif/Bureau/Transcendence/work/visualizations')
HW = VIS / 'horizon-welcome'
ARCH = HW / 'archive/pre-codex-audit-fixes-20261015'
HERE = Path(__file__).resolve().parent

archive = {row['source']: row['sourceSha256'] for row in json.loads((ARCH / 'snapshot-manifest.json').read_text())['files']}
design = {row['source']: row['sourceSha256'] for row in json.loads((VIS / 'design-review-studies/snapshot-manifest.json').read_text())['files']}
design_cmp = {
    'record': 'studies/design-review-studies/snapshot-manifest.json (date 2026-10-14)',
    'archiveSources': len(archive), 'recordSources': len(design),
    'identical': sum(1 for key in archive if design.get(key) == archive[key]),
    'different': sorted(key for key in archive if key in design and design[key] != archive[key]),
    'onlyInArchive': sorted(set(archive) - set(design)), 'onlyInRecord': sorted(set(design) - set(archive)),
}

refs = json.loads((HW / 'checks/20261013-animated-entry-references.json').read_text())
http_rows = []
for row in refs['http']:
    url = row.get('url') or row.get('path')
    digest = row.get('sha256')
    if not url or not digest:
        continue
    # URLs of that record are relative to site/.
    source = 'site/' + urlsplit(url).path.lstrip('/')
    http_rows.append({'url': url, 'source': source, 'recorded': digest, 'archive': archive.get(source),
                      'identical': archive.get(source) == digest})

tests_record = json.loads((HW / 'checks/20261014-full-tests-after-resumed-checks.json').read_text())['testFileHashes']
tests_archive = json.loads((ARCH / 'test-source-manifest.json').read_text())['files']
test_rows = [{'source': row['source'], 'archive': row['sha256'], 'recorded20261014': tests_record.get(row['source']),
              'identical': tests_record.get(row['source']) == row['sha256']} for row in tests_archive]

result = {
    'date': '2026-10-15',
    'scope': 'Provenance indépendante de l’archive 144 : comparaison avec des relevés faits avant les corrections (14 octobre). Lecture seule.',
    'designReviewSnapshot': design_cmp,
    'http20261014': {'record': 'checks/20261013-animated-entry-references.json', 'compared': len(http_rows),
                     'identical': sum(row['identical'] for row in http_rows), 'rows': http_rows},
    'testOriginals': test_rows,
}
(HERE / 'provenance.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'designReviewSnapshot': design_cmp,
                  'http20261014': {k: v for k, v in result['http20261014'].items() if k != 'rows'},
                  'httpNotIdentical': [row for row in http_rows if not row['identical']],
                  'testOriginals': test_rows}, ensure_ascii=False, indent=1))
