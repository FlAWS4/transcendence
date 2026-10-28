"""Vérification v3, 18 oct. 2026 (lecture seule) : premiers niveaux des scènes des 5 états communs, convertis en mémoire."""
import sys, json
sys.dont_write_bytecode = True
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
import dom2fig
def walk(nodes, d=0, maxd=2, out=None):
    for t in nodes:
        print(f"{'  '*d}{t.get('t')} {t.get('n')!r} x={t.get('x')} y={t.get('y')} w={t.get('w')} h={t.get('h')}" + (' fx' if t.get('fx') else '') + (' sk' if t.get('sk') else '') + (f" dom={t['dom']}" if t.get('dom') else ''))
        if t.get('ch') and d < maxd:
            walk(t['ch'], d+1, maxd)
for state, fmt, h in [('search-open','mobile',2826),('search-open','desktop',2566),('dock-300','mobile',5138),('dock-320','mobile',5241),('back-to-top','mobile',2826)]:
    full = h > (844 if fmt=='mobile' else 960) + 4
    scene, svgs = dom2fig.convert('shell', state, fmt, 'fr', full)
    print('==', state, fmt, scene['w'], scene['h'])
    walk(scene['ch'], 0, int(sys.argv[1]) if len(sys.argv) > 1 else 1)
