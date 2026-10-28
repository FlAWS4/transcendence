"""Fingerprint of the active prototype (horizon-welcome without archive/ and checks/), read-only.
python3 -I fingerprint.py <output.json> [<previous.json>]  -> writes the hashes; with a previous file, prints the differences."""
import hashlib, json, sys
from pathlib import Path

ACTIVE = Path(__file__).resolve().parents[2]


def fingerprint():
    out = {}
    for path in sorted(ACTIVE.rglob('*')):
        rel = path.relative_to(ACTIVE)
        if not path.is_file() or rel.parts[0] in ('archive', 'checks') or '__pycache__' in rel.parts: continue
        out[rel.as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
    return out


if __name__ == '__main__':
    now = fingerprint()
    Path(sys.argv[1]).write_text(json.dumps({'root': str(ACTIVE), 'files': len(now), 'sha256': now}, indent=1) + '\n')
    if len(sys.argv) > 2:
        before = json.loads(Path(sys.argv[2]).read_text())['sha256']
        print(json.dumps({'files': [len(before), len(now)],
                          'added': sorted(set(now) - set(before)), 'removed': sorted(set(before) - set(now)),
                          'changed': sorted(k for k in set(now) & set(before) if now[k] != before[k])}, indent=1))
    else:
        print(len(now), 'files')
