"""Print the top levels of a scene with absolute positions (v5 verification helper, read-only, 18 Oct.).
  python3 scene_top.py <scene json> [depth] [name filter]"""
import json, sys
s = json.load(open(sys.argv[1]))
maxd = int(sys.argv[2]) if len(sys.argv) > 2 else 2
flt = sys.argv[3] if len(sys.argv) > 3 else ''
print({k: s[k] for k in ('name', 'fmt', 'lang', 'w', 'h', 'vh', 'rtl') if k in s})
def walk(n, depth=0, ox=0, oy=0):
    if isinstance(n, list):
        for c in n: yield from walk(c, depth, ox, oy)
        return
    x = ox + (n.get('x') or 0); y = oy + (n.get('y') or 0)
    yield depth, n, x, y
    for c in n.get('ch', []) or []:
        yield from walk(c, depth + 1, x, y)
for d, n, x, y in walk(s['ch']):
    nm = str(n.get('n'))
    if (d <= maxd and not flt) or (flt and (flt in nm or flt in str(n.get('tx', '')))):
        extra = {k: n[k] for k in n if k not in ('ch', 't', 'n', 'x', 'y', 'w', 'h', 'dom', 'e', 'st', 'runs')}
        print('  ' * d, n.get('t'), nm[:60], 'abs', round(x, 1), round(y, 1), 'wh', n.get('w'), n.get('h'), json.dumps(extra, ensure_ascii=False)[:300])
