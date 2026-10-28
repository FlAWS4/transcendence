"""Read-only look at partial results (does not write)."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import listes as L
data = json.loads((L.HERE / 'listes.json').read_text())
for case in L.CASES:
    e = data.get(case[0])
    if not e or 'combo' not in e or 'base' not in e: continue
    c = e['combo']; cas = c['cascade']
    print('==', case[0], 'cols', e['base']['probe']['columns'], '->', c['probe']['columns'])
    print('  new:', json.dumps(L.new_in(e['base'], c), ensure_ascii=False)[:1500])
    print('  attentes:', L.expectations(case, c)[:8])
    print('  changed', cas['changed'], 'kept', cas['kept'])
    for i in cas['issues'][:6]: print('  ISSUE', json.dumps(i, ensure_ascii=False)[:300])
    for m in cas['multi'][:12]: print('  MULTI', m['p'], m['by'], m['vals'], 'base', m['base'], 'combo', m['combo'], 'n', m['n'], m['sample'][:2])
