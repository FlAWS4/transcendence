"""Final ledger: every pre-existing file whose bytes changed (HEAD 5466285 -> working tree)."""
import difflib, hashlib, json, os, subprocess, sys
R = '/home/le-rif/Bureau/Transcendence'
OUT = sys.argv[1]
plan = json.load(open('plan.json'))
moves = plan['moves']
back = {v: k for k, v in moves.items()}
head = {}
for line in subprocess.run(['git', '-C', R, 'ls-tree', '-r', 'HEAD'], capture_output=True, text=True).stdout.splitlines():
    meta, path = line.split('\t', 1)
    head[path] = meta.split()[2]
current = subprocess.run(['git', '-C', R, 'ls-files', '-co', '--exclude-standard'], capture_output=True, text=True).stdout.splitlines()
hashes = subprocess.run(['git', '-C', R, 'hash-object', '--stdin-paths'], input='\n'.join(current), capture_output=True, text=True).stdout.split()
sha = lambda b: hashlib.sha256(b).hexdigest()
files, added = [], []
for path, blob in zip(current, hashes):
    old = back.get(path, path)
    if old not in head:
        added.append(path); continue
    if head[old] == blob:
        continue
    before = subprocess.run(['git', '-C', R, 'cat-file', 'blob', head[old]], capture_output=True).stdout
    after = open(os.path.join(R, path), 'rb').read()
    a, b = before.decode('utf-8'), after.decode('utf-8')
    al, bl = a.splitlines(keepends=True), b.splitlines(keepends=True)
    offs = [0]
    for l in al: offs.append(offs[-1] + len(l))
    changes = []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, al, bl, autojunk=False).get_opcodes():
        if tag == 'equal': continue
        oa, ob = ''.join(al[i1:i2]), ''.join(bl[j1:j2])
        base = offs[i1]
        if tag == 'replace':
            sm = difflib.SequenceMatcher(None, oa, ob, autojunk=False)
            for t2, x1, x2, y1, y2 in sm.get_opcodes():
                if t2 != 'equal':
                    changes.append({'offset': base + x1, 'old': oa[x1:x2], 'new': ob[y1:y2]})
        else:
            changes.append({'offset': base, 'old': oa, 'new': ob})
    # check: applying the changes to the old text gives the new text
    out, pos = [], 0
    for ch in changes:
        out.append(a[pos:ch['offset']]); out.append(ch['new']); pos = ch['offset'] + len(ch['old'])
    out.append(a[pos:])
    assert ''.join(out) == b, path
    files.append({'old_path': old, 'new_path': path, 'sha256_before': sha(before), 'sha256_after': sha(after), 'changes': changes})
ledger = {'from_commit': '5466285991646159707bbd59849752ace267fd17', 'date': '2026-10-23',
          'how_to_rebuild': 'Apply each change in reverse (offsets refer to the previous text, in ascending order): replace "new" by "old". The previous bytes are also in Git at from_commit.',
          'modified_files': len(files), 'added_files': sorted(added), 'files': files}
json.dump(ledger, open(OUT, 'w'), indent=1, ensure_ascii=False)
print('modified', len(files), 'added', len(added), 'changes', sum(len(f['changes']) for f in files))
