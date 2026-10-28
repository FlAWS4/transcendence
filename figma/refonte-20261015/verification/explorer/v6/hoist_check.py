"""Contrôle à blanc de hoist_z() (dom2fig.py, 18 octobre 2026) — vérification Explorer v6, fenêtre campus.

  python3 -B hoist_check.py
Convertit tous les cadres des layouts (clairs, plus les cadres sombres de DARK_RENDER) avec le dom2fig.py du dépôt,
une fois avec hoist_z() et une fois sans, et relève les calques peints qui se recouvrent et dont l'ordre de peinture
s'inverse, ainsi que les cadres supprimés. Rien n'est écrit hors de ce dossier : ni scène, ni appel, ni __pycache__.
Sortie : hoist_check.json, à côté de ce fichier.
"""
import hashlib, importlib.util, json, pathlib, sys, time
from collections import Counter

sys.dont_write_bytecode = True
HERE = pathlib.Path(__file__).resolve().parent
BASE = HERE.parents[2]
SCRIPTS = BASE / 'scripts'
sys.path.insert(0, str(SCRIPTS))
from layout import DARK_RENDER   # noqa: E402  (aucun effet de bord à l'import)


def load(name):
    spec = importlib.util.spec_from_file_location(name, str(SCRIPTS / 'dom2fig.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


d_on, d_off = load('d_on'), load('d_off')
d_off.hoist_z = lambda nodes: nodes


def painted(c):
    return c.get('t') in ('T', 'I', 'S', 'P') or bool(c.get('f') or c.get('s') or c.get('e'))


def paint_seq(scene):
    out, seen = [], Counter()
    def walk(n, ox, oy):
        for c in n.get('ch', []):
            ax, ay = ox + c.get('x', 0), oy + c.get('y', 0)
            k = (c.get('t'), c.get('n') or c.get('tx') or c.get('id') or c.get('ref'), round(ax, 1), round(ay, 1))
            seen[k] += 1
            k = k + (seen[k],)
            if painted(c):
                out.append((k, (ax, ay, ax + (c.get('w') or 0), ay + (c.get('h') or 0))))
            if c.get('ch'):
                walk(c, ax, ay)
    walk(scene, 0, 0)
    return out


def frame_names(scene):
    out = Counter()
    def walk(n):
        for c in n.get('ch', []):
            if c.get('t') == 'F':
                out[c.get('n')] += 1
                walk(c)
    walk(scene)
    return out


def overlap(a, b):
    return a[0] < b[2] - 0.5 and b[0] < a[2] - 0.5 and a[1] < b[3] - 0.5 and b[1] < a[3] - 0.5


per_scene, flips_total, removed_total, jobs = {}, Counter(), Counter(), 0
for lay_path in sorted((BASE / 'layouts').glob('*.json')):
    lay = json.loads(lay_path.read_text())
    area = lay.get('area', lay_path.stem)
    for s in lay['sections']:
        for row in s['rows']:
            for f in row:
                if f['theme'] != 'light' and (area, f['state']) not in DARK_RENDER:
                    continue
                jobs += 1
                full = f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4
                on, _ = d_on.convert(area, f['state'], f['fmt'], f['lang'], full, theme=f['theme'])
                off, _ = d_off.convert(area, f['state'], f['fmt'], f['lang'], full, theme=f['theme'])
                so, sf = paint_seq(on), paint_seq(off)
                if [k for k, _ in so] == [k for k, _ in sf]:
                    continue
                rank_on = {k: i for i, (k, _) in enumerate(so)}
                items = [(k, b, rank_on.get(k), i) for i, (k, b) in enumerate(sf)]
                flips = set()
                for a in range(len(items)):
                    ka, ba, oa, fa = items[a]
                    if oa is None:
                        continue
                    for b in range(a + 1, len(items)):
                        kb, bb, ob, fb = items[b]
                        if ob is not None and (oa < ob) != (fa < fb) and overlap(ba, bb):
                            above = kb[1] if ob > oa else ka[1]
                            below = ka[1] if above == kb[1] else kb[1]
                            flips.add('%s passe au-dessus de %s' % (above, below))
                removed = frame_names(off) - frame_names(on)
                name = '%s/%s/%s/%s/%s' % (lay_path.stem, f['state'], f['fmt'], f['lang'], f['theme'])
                per_scene[name] = {'frame': f['name'], 'flips': sorted(flips), 'removedFrames': dict(removed)}
                flips_total.update(flips)
                removed_total.update(removed)

out = {
    'date': time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime()),
    'dom2fig_md5': hashlib.md5((SCRIPTS / 'dom2fig.py').read_bytes()).hexdigest(),
    'jobs': jobs,
    'scenesChanged': len(per_scene),
    'flips': dict(flips_total.most_common()),
    'removedFrames': dict(removed_total.most_common()),
    'perScene': per_scene,
}
(HERE / 'hoist_check.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
print(json.dumps({k: v for k, v in out.items() if k != 'perScene'}, ensure_ascii=False, indent=1))
