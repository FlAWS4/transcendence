"""Synthèse v5 des Chroniques (18 octobre 2026) : conversion à blanc, en mémoire, avec une copie figée de dom2fig.py.

  python3 -B controle_hoist.py <copie de dom2fig.py> [clé de mise en page …]

Pour chaque cadre clair des mises en page (et les cadres sombres de DARK_RENDER), compare la scène produite par la
copie à la scène sur disque (scenes/) :
  - barre de périmètre peinte sous un fondu « Après · » qui la suit (avant / après) ;
  - ordre des calques de premier niveau de « Application » ;
  - hauteur du calque « Fond » ;
  - nombre de nœuds, de textes et d'auto-layouts.
Rien n'est écrit hors de ce dossier : resultat_hoist.json.
"""
import importlib.util, json, pathlib, sys, time

HERE = pathlib.Path(__file__).resolve().parent
BASE = HERE.parents[3]
SCRIPTS = BASE / 'scripts'
sys.dont_write_bytecode = True
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location('dom2fig_copie', sys.argv[1])
d = importlib.util.module_from_spec(spec)
sys.modules['dom2fig_copie'] = d
spec.loader.exec_module(d)
DARK_RENDER = {('shell', 'account-visitor'), ('shell', 'account-member'), ('shell', 'account-settings'), ('shell', 'account-theme'),
               ('projects', 'mention-picker')}
keys = sys.argv[2:] or [p.stem for p in sorted((BASE / 'layouts').glob('*.json'))]


def scope_covered(scene):
    def find(t, path):
        for i, c in enumerate(t.get('ch', [])):
            if c.get('dom') == 'scope-bar':
                return path + [(t, i)]
            r = find(c, path + [(t, i)])
            if r:
                return r
        return None
    p = find(scene, [])
    if not p:
        return None
    return any(str(later.get('n', '')).startswith('Après ·') for parent, i in p for later in parent.get('ch', [])[i + 1:])


def stats(scene):
    n = t = a = 0
    stack = list(scene.get('ch', []))
    while stack:
        c = stack.pop()
        n += 1
        t += c.get('t') == 'T'
        a += c.get('t') == 'F' and isinstance(c.get('al'), dict)
        stack.extend(c.get('ch', []))
    return {'nœuds': n, 'textes': t, 'autolayouts': a}


def top(scene):
    app = scene['ch'][0] if len(scene.get('ch', [])) == 1 else scene
    return [str(c.get('n')) for c in app.get('ch', [])]


def fond_h(scene):
    app = scene['ch'][0] if len(scene.get('ch', [])) == 1 else scene
    f = next((c for c in app.get('ch', []) if c.get('n') == 'Fond'), None)
    return f and f.get('h')


rows = []
t0 = time.time()
for key in keys:
    lay = json.loads((BASE / 'layouts' / f'{key}.json').read_text())
    area = lay.get('area', key)
    for s in lay['sections']:
        for row in s['rows']:
            for f in row:
                if f['theme'] != 'light' and (area, f['state']) not in DARK_RENDER:
                    continue
                skey = f'{area}--{f["state"]}--{f["fmt"]}--{f["lang"]}' + ('--dark' if f['theme'] == 'dark' else '')
                disk_p = BASE / 'scenes' / f'{skey}.json'
                full = f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4
                r = {'cadre': f['name'], 'clé': key, 'scène': skey}
                try:
                    new, _ = d.convert(area, f['state'], f['fmt'], f['lang'], full, theme=f['theme'])
                except Exception as e:   # noqa: BLE001
                    r['erreur'] = repr(e)[:200]
                    rows.append(r)
                    continue
                disk = json.loads(disk_p.read_text()) if disk_p.exists() else None
                r.update({'barre sous le fondu (disque)': scope_covered(disk) if disk else None,
                          'barre sous le fondu (copie)': scope_covered(new),
                          'premier niveau (disque)': top(disk) if disk else None, 'premier niveau (copie)': top(new),
                          'Fond h (disque)': fond_h(disk) if disk else None, 'Fond h (copie)': fond_h(new), 'H': new['h'],
                          'stats (disque)': stats(disk) if disk else None, 'stats (copie)': stats(new)})
                rows.append(r)
summary = {
    'copie': sys.argv[1], 'cadres': len(rows), 'erreurs': sum('erreur' in r for r in rows),
    'barre sous le fondu, disque': sum(bool(r.get('barre sous le fondu (disque)')) for r in rows),
    'barre sous le fondu, copie': sum(bool(r.get('barre sous le fondu (copie)')) for r in rows),
    'nœuds différents': sum(r.get('stats (disque)') is not None and r.get('stats (disque)') != r.get('stats (copie)') for r in rows),
    'durée s': round(time.time() - t0, 1)}
(HERE / 'resultat_hoist.json').write_text(json.dumps({'résumé': summary, 'cadres': rows}, ensure_ascii=False, indent=1))
print(json.dumps(summary, ensure_ascii=False))
