"""List the dump nodes of one state that intersect a box, with text (verification helper, read-only, 18 Oct. 2026).
  python3 nodes.py <dump name, e.g. filter-projects--mobile--fr-light> [x y w h] [--all]
Prints index, tag, id/class, box (CSS px), key styles and text lines. Reads only dom/projects/."""
import gzip, json, sys
BASE = '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015'
name = sys.argv[1]
d = json.loads(gzip.decompress(open(f'{BASE}/dom/projects/{name}.json.gz', 'rb').read()))
box = list(map(float, sys.argv[2:6])) if len(sys.argv) >= 6 else None
for nd in d['nodes']:
    if box:
        x, y, w, h = box
        if nd['x'] > x + w or nd['x'] + nd['w'] < x or nd['y'] > y + h or nd['y'] + nd['h'] < y:
            continue
    s = nd.get('s') or {}
    txt = ''
    if nd.get('lines'):
        txt = ' | '.join(l.get('t', '') if isinstance(l, dict) else str(l) for l in nd['lines'])[:120]
    elif nd.get('text'):
        txt = str(nd['text'])[:120]
    keys = {k: s[k] for k in ('position', 'bg', 'bgImage', 'border', 'radius', 'shadow', 'opacity', 'color', 'font', 'outline', 'filter', 'backdrop', 'z', 'transform', 'ls') if k in s}
    print(nd['i'], nd['p'], nd['tag'], nd.get('id', ''), (nd.get('cls') or '')[:40], [round(nd[k], 1) for k in ('x', 'y', 'w', 'h')], json.dumps(keys)[:300], '«' + txt + '»' if txt else '')
