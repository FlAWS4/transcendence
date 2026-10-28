"""Vérification v3 des éléments communs, 18 oct. 2026 (lecture seule, rien n'est écrit hors de ce dossier).
Read-only: effect of dom2fig.hoist_z (current file) on every frame of the layouts: conversions in memory with and
without hoist_z; reports removed frames, geometry changes and paint-order flips of overlapping layers."""
import sys, json, glob, collections, hashlib, pathlib
sys.dont_write_bytecode = True
S = '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts'
sys.path.insert(0, S)
import dom2fig, layout
print('dom2fig sha1', hashlib.sha1(open(S + '/dom2fig.py', 'rb').read()).hexdigest()[:12])
REAL = dom2fig.hoist_z
def flat(nodes):
    out = []
    def rec(nodes, ox, oy, path):
        for t in nodes:
            ax, ay = ox + float(t.get('x', 0)), oy + float(t.get('y', 0))
            props = json.dumps({k: v for k, v in t.items() if k not in ('ch', 'x', 'y')}, sort_keys=True, ensure_ascii=False)
            idx = len(out)
            out.append({'n': t.get('n'), 'k': (t.get('n'), t.get('t'), round(ax, 1), round(ay, 1), props), 'box': (ax, ay, float(t.get('w', 0) or 0), float(t.get('h', 0) or 0)),
                        'path': path, 'order': idx, 'dom': t.get('dom')})
            if t.get('ch'):
                rec(t['ch'], ax, ay, path + (idx,))
    rec(nodes, 0, 0, ())
    return out
def keyed(fl):
    seen = collections.Counter(); d = {}
    for e in fl:
        seen[e['k']] += 1
        d[e['k'] + (seen[e['k']],)] = e
    return d
def overlap(a, b):
    ax, ay, aw, ah = a; bx, by, bw, bh = b
    return min(ax + aw, bx + bw) - max(ax, bx) > 0.5 and min(ay + ah, by + bh) - max(ay, by) > 0.5
res = collections.OrderedDict()
removed_all = collections.Counter(); flips_all = collections.Counter(); scenes_changed = 0; n = 0
for lf in sorted(glob.glob('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/layouts/*.json')):
    lay = json.load(open(lf)); area = lay.get('area', lay['key'] if 'key' in lay else lf.split('/')[-1][:-5])
    for s in lay['sections']:
        for row in s['rows']:
            for f in row:
                if f['theme'] != 'light' and (area, f['state']) not in layout.DARK_RENDER:
                    continue
                full = f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4
                try:
                    dom2fig.hoist_z = REAL
                    a, _ = dom2fig.convert(area, f['state'], f['fmt'], f['lang'], full, theme=f['theme'])
                    dom2fig.hoist_z = lambda nodes: nodes
                    b, _ = dom2fig.convert(area, f['state'], f['fmt'], f['lang'], full, theme=f['theme'])
                finally:
                    dom2fig.hoist_z = REAL
                n += 1
                fa, fb = flat(a['ch']), flat(b['ch'])
                ka, kb = keyed(fa), keyed(fb)
                only_b = [kb[k] for k in kb if k not in ka]
                only_a = [ka[k] for k in ka if k not in kb]
                common = [k for k in ka if k in kb]
                # moved nodes: same key, different parent chain (compare parent's key)
                def pkey(fl, e):
                    return fl[e['path'][-1]]['k'] if e['path'] else None
                moved = [k for k in common if pkey(fa, ka[k]) != pkey(fb, kb[k])]
                flips = []
                mset = set(moved)
                # descendants of moved nodes move with them: test moved roots only against non-related nodes
                for k in moved:
                    ea, eb = ka[k], kb[k]
                    for k2 in common:
                        if k2 == k: continue
                        ea2, eb2 = ka[k2], kb[k2]
                        if ea['order'] in ea2['path'] or ea2['order'] in ea['path']: continue
                        if eb['order'] in eb2['path'] or eb2['order'] in eb['path']: continue
                        if not overlap(ea['box'], ea2['box']): continue
                        if (ea['order'] < ea2['order']) != (eb['order'] < eb2['order']):
                            flips.append((ea['n'], ea2['n'], 'au-dessus' if ea['order'] > ea2['order'] else 'au-dessous'))
                if only_b or only_a or flips:
                    scenes_changed += 1
                    key = f"{area}/{f['state']}/{f['fmt']}/{f['lang']}/{f['theme']}"
                    res[key] = {'removed': [e['n'] for e in only_b], 'added': [e['n'] for e in only_a], 'moved': [ka[k]['n'] for k in moved],
                                'flips': sorted(set(flips))}
                    for e in only_b: removed_all[e['n']] += 1
                    for fl in set(flips): flips_all[fl] += 1
print('frames converted', n, 'changed', scenes_changed)
print('removed frames:', removed_all.most_common(10))
print('flips (layer, other, now):')
for k, v in flips_all.most_common(40): print('  ', v, k)
moved_all = collections.Counter()
for k, v in res.items():
    for m in set(v['moved']): moved_all[m] += 1
print('moved layers:', moved_all.most_common(25))
print('added (should be none):', sum(len(v['added']) for v in res.values()))
json.dump(res, open(pathlib.Path(__file__).with_suffix('.json'), 'w'), ensure_ascii=False, indent=1)
