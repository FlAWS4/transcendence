"""Read-only integrity check of the frozen copy against snapshot-manifest.json (same hashes as
snapshot.py --verify, without writing snapshot-verification.json at the study root).
python3 -I copie-intacte.py"""
import hashlib, json
from pathlib import Path
STUDY = Path(__file__).resolve().parents[3]
manifest = json.loads((STUDY / 'snapshot-manifest.json').read_text())
digest = lambda data: hashlib.sha256(data).hexdigest()
bad = []
for record in manifest['files']:
    data = (STUDY / record['runtime']).read_bytes()
    if digest(data) != record['runtimeSha256'] or len(data) != record['runtimeBytes']: bad.append(record['runtime'])
    original = (STUDY / record.get('original', record['runtime'])).read_bytes()
    if digest(original) != record['sourceSha256']: bad.append(record.get('original', record['runtime']))
result = {'fichiers': len(manifest['files']), 'differents': bad}
(Path(__file__).resolve().parent / 'copie-intacte.json').write_text(json.dumps(result, ensure_ascii=False, indent=1) + '\n')
print(result)
