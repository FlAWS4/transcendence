"""Regenerate copy calls not yet sent with the current COPY_CALL (same jobs, same order), the old files archived."""
import re, sys, json, shutil
from pathlib import Path
BASE = Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sys.path.insert(0, str(BASE / 'scripts'))
import parcours as P
from make_call import next_index, guard_spaces
arch = BASE / '_superseded' / sys.argv[1]
olds = [BASE / 'calls' / a for a in sys.argv[2:]]
arch.mkdir(exist_ok=True)
for f in olds:
    t = f.read_text(encoding='utf-8')
    dest = re.search(r"^const dest = await figma.getNodeByIdAsync\('([^']+)'\);$", t, re.M).group(1)
    src = re.search(r"^const src = await figma.getNodeByIdAsync\('([^']+)'\);$", t, re.M).group(1)
    colors = re.search(r"getVariableCollectionByIdAsync\('([^']+)'\)", t).group(1)
    J = re.search(r'^const J = (.*);$', t, re.M).group(1)
    fmt = 'desktop' if dest == '760:7' else 'mobile'
    code = guard_spaces(P.COPY_CALL % {'dest': P.PAGES[fmt], 'destPage': dest, 'srcPage': src, 'colors': colors, 'jobs': J, 'convert': P.CONVERT_FN})
    shutil.move(str(f), arch / f.name)
    n = next_index()
    g = BASE / 'calls' / re.sub(r'^\d+', '%d' % n, f.name)
    g.write_text(code, encoding='utf-8')
    print(f.name, '→', g.name, len(code), [j['name'] for j in json.loads(J)])
