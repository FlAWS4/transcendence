"""Chemin d'un nœud de scène et ses propriétés (vérification Chroniques v5).
  python3 scene_path.py <scene.json> <texte cherché dans n, dom ou tx> [profondeur des enfants]
"""
import json, sys
d = json.load(open(sys.argv[1])); q = sys.argv[2]; depth = int(sys.argv[3]) if len(sys.argv) > 3 else 0
def short(n):
    return {k: v for k, v in n.items() if k != 'ch'}
def walk(n, path):
    hit = q in str(n.get('n', '')) or q in str(n.get('dom', '')) or q in str(n.get('tx', ''))
    if hit:
        print('=' * 20)
        for i, p in enumerate(path + [n]):
            print('  ' * i, json.dumps(short(p), ensure_ascii=False)[:400])
        def kids(m, lvl):
            if lvl > depth: return
            for c in m.get('ch', []) or []:
                print('  ' * (len(path) + 1 + lvl), '>', json.dumps(short(c), ensure_ascii=False)[:300])
                kids(c, lvl + 1)
        kids(n, 0)
    for c in n.get('ch', []) or []:
        walk(c, path + [n])
walk(d, [])
