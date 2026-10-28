"""Trial echelle-unifiee: static count of the font-size and border-radius values the baseline declares
(no Chrome). Comments are stripped and whitespace normalised; a value is the declared text (12px,
clamp(...), var(...), 50%). Run: python3 -I .../checks/echelle-unifiee/compte-statique.py"""
import json, re
from pathlib import Path
HERE = Path(__file__).resolve().parent
BASE = HERE.parent.parent / 'baseline'
linked = [f[2:] if f.startswith('./') else f for f in re.findall(r'href="([^"?]+\.css)', (BASE / 'index.html').read_text())]
own = [f for f in linked if not f.startswith('vendor/') and not f.endswith('jost.css')]
# comments.css imports comment-mention-picker.css; campus-direction.mjs inserts campus-direction.css.
extra = ['comment-mention-picker.css', 'campus-direction.css']


def count(files):
    sizes, radii, decl, imp, imp_on = set(), set(), [0, 0], 0, set()
    for name in files:
        text = re.sub(r'/\*.*?\*/', '', (BASE / name).read_text(), flags=re.S)
        norm = lambda v: re.sub(r'\s+', ' ', v.strip())
        found = [norm(m) for m in re.findall(r'(?<![-\w])font-size\s*:\s*([^;}]+)', text)]
        rad = [norm(m) for m in re.findall(r'(?<![-\w])border(?:-[a-z]+)*-radius\s*:\s*([^;}]+)', text)]
        sizes |= set(found); radii |= set(rad); decl[0] += len(found); decl[1] += len(rad)
        for prop, value in re.findall(r'([-\w]+)\s*:\s*([^;{}]*!\s*important)', text):
            imp += 1; imp_on.add(prop)
    return {'files': len(files), 'fontSizeValues': len(sizes), 'fontSizeDeclarations': decl[0], 'radiusValues': len(radii),
            'radiusDeclarations': decl[1], 'important': imp, 'importantProperties': sorted(imp_on)}


out = {'own35': count(own), 'own35+2': count(own + extra), 'withMapLibre': count(own + extra + ['vendor/maplibre-gl.css'])}
(HERE / 'compte-statique.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
print(json.dumps(out, ensure_ascii=False, indent=1))
