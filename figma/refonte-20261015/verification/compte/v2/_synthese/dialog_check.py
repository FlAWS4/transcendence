"""Fenêtres de connexion et de création de compte construites depuis la capture sombre, à blanc, avec le cref corrigé."""
import json, sys
sys.dont_write_bytecode = True
sys.path.insert(0, sys.argv[1])
import importlib.util
spec = importlib.util.spec_from_file_location('cc', sys.argv[2])
import dom2fig as D
src = open(sys.argv[2]).read().split('\ndef refs(')[0]   # cref_fixed only
ns = {'__name__': 'cc'}
exec(compile(src.replace("import dom2fig as D", "import dom2fig as D"), 'cref_fixed', 'exec'), ns)
D.cref = ns['cref_fixed']
def find(t, pred, out):
    if pred(t): out.append(t)
    for c in t.get('ch') or []: find(c, pred, out)
    return out
def raw(t, out):
    for p in t.get('f') or []:
        if isinstance(p, dict) and 'h' in p: out.append((t.get('n'), 'f', p['h']))
        if isinstance(p, dict) and 'st' in p:
            out += [(t.get('n'), 'st', s[1]) for s in p['st'] if len(s) < 3]
    if isinstance(t.get('s'), dict) and 'h' in t['s']: out.append((t.get('n'), 's', t['s']['h']))
    for e in t.get('e') or []:
        if isinstance(e.get('c'), dict) and 'h' in e['c']: out.append((t.get('n'), 'e', e['c']['h']))
    for c in t.get('ch') or []: raw(c, out)
    return out
for st in ('signin-dialog', 'signup-dialog'):
    for fmt in ('desktop', 'mobile'):
        sc, _ = D.convert('shell', st, fmt, 'fr', True, theme='dark')
        dlg = [c for c in sc['ch'] if c.get('n') == '#dialog'][0]
        btn = find(dlg, lambda t: t.get('t') == 'F' and abs(t.get('h', 0) - 51) < 0.6, [])
        print(st, fmt, 'fenêtre y=%s h=%s' % (dlg['y'], dlg['h']), '| boutons de 51 px :', len(btn),
              '| contours :', [b.get('s') for b in btn], '| ombres internes :', [[e for e in (b.get('e') or []) if e['t'] == 'I'] for b in btn],
              '| couleurs brutes :', raw({'ch': sc['ch']}, []))
