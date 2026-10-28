"""Find dump nodes (v5 check helper, read-only): python3 find.py <dump name> <regex on key/id/cls/text> [max]"""
import gzip, json, re, sys
BASE = '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015'
name, rx = sys.argv[1], re.compile(sys.argv[2])
mx = int(sys.argv[3]) if len(sys.argv) > 3 else 30
d = json.loads(gzip.decompress(open(f'{BASE}/dom/projects/{name}.json.gz', 'rb').read()))
k = 0
for n in d['nodes']:
    txt = n.get('text') or n.get('t') or ''
    if isinstance(txt, (list, dict)): txt = json.dumps(txt, ensure_ascii=False)
    hay = ' '.join(str(n.get(a, '')) for a in ('k', 'id', 'cls', 'tag')) + ' ' + str(txt)
    if rx.search(hay):
        s = n.get('s') or {}
        print(n['i'], n['tag'], n.get('id', ''), n.get('cls', ''), 'box', round(n['x'], 1), round(n['y'], 1), round(n['w'], 1), round(n['h'], 1),
              'pos', s.get('position'), 'z', s.get('z'), '|', str(txt)[:80])
        k += 1
        if k >= mx: break
