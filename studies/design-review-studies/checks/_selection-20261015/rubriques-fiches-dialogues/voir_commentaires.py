"""Readable table of commentaires.json (read-only)."""
import json, sys
from pathlib import Path
d = json.loads((Path(__file__).resolve().parent / 'commentaires.json').read_text())
screens = sys.argv[1:] or [k for k in d if k != 'bilan']
for name in screens:
    e = d.get(name, {})
    if 'combo' not in e: continue
    print('#####', name, 'erreurs', e['combo'].get('erreurs'), 'debordement', e['combo'].get('debordement'))
    for state, c in e['combo'].items():
        if state in ('erreurs', 'debordement') or not isinstance(c, dict) or c.get('absent') or 'boutons' not in c: continue
        b = e.get('base', {}).get(state, {})
        print('==', state, 'surface base', (b.get('surface') or [{}])[0].get('radius'), '-> combo', c['surface'][0].get('radius') if c.get('surface') else None)
        for i, x in enumerate(c['boutons']):
            if not x.get('found'): print('   absent', x['name']); continue
            y = b['boutons'][i] if b and b.get('boutons') else {}
            cut = x['overflowX'] or x['textOut'] > 1 or x['clippedBy']
            print(f"   {x['name'][:24]:24s} {y.get('w')}x{y.get('h')} {y.get('fs')} -> {x['w']}x{x['h']} {x['fs']} r {y.get('radius','').split(' ')[0]}->{x['radius'].split(' ')[0]} bg {y.get('fondPeint')}->{x['fondPeint']} C {y.get('contraste')}->{x['contraste']} Cb {x['contrasteBordure']} lignes {y.get('labelLines')}->{x['labelLines']} {'COUPE' if cut else ''} {'' if x['focus']['visible'] and 'none' not in x['focus']['outline'] else 'FOCUS?'} vp={x['inViewport']}")
        cas = c.get('cascade', {})
        bad = [i for i in cas.get('issues', []) if i['p'] != 'grid-template-columns']
        if bad: print('   surcharges', json.dumps(bad[:6], ensure_ascii=False)[:700])
        for m in cas.get('multi', [])[:10]:
            if m['p'] in ('grid-template-columns',): continue
            print('   plusieurs', m['p'], m['by'], m['vals'], 'base', m['base'], 'combo', m['combo'], m['n'], m['sample'][:2])
        tb = c.get('toggle', {}).get('boutons', {})
        nb = {k: v for k, v in (('clips', [z for z in c['clips'] if (z['k'], z['t']) not in {(w['k'], w['t']) for w in (b.get('clips') or [])}]),
                                 ('boxClips', [z for z in c['shapes']['boxClips'] if (z['k'], z['t']) not in {(w['k'], w['t']) for w in ((b.get('shapes') or {}).get('boxClips') or [])}]),
                                 ('spills', [z for z in c['spill']['spills'] if (z['k'], z['a'], z['t']) not in {(w['k'], w['a'], w['t']) for w in ((b.get('spill') or {}).get('spills') or [])}]),
                                 ('collisions', [z for z in c['spill']['collisions'] if (z['a'], z['b'], z['ta'], z['tb']) not in {(w['a'], w['b'], w['ta'], w['tb']) for w in ((b.get('spill') or {}).get('collisions') or [])}])) if v}
        if nb: print('   NOUVEAU', json.dumps(nb, ensure_ascii=False)[:900])
