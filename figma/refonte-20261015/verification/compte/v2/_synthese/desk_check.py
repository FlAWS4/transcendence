"""Conversion à blanc, en mémoire, des 7 cadres « Ordinateur · Clair » du compte jamais régénérés depuis le 16 octobre."""
import json, sys
sys.dont_write_bytecode = True
sys.path.insert(0, sys.argv[1])
import dom2fig as D
base = sys.argv[2]
out = {}
for st in ('account-visitor', 'account-settings', 'account-theme', 'account-language', 'account-member', 'messages', 'notifications'):
    sc, _ = D.convert('shell', st, 'desktop', 'fr', True)
    old = json.load(open(f'{base}/scenes/shell--{st}--desktop--fr.json'))
    def top(s):
        app = next(c for c in s['ch'] if c.get('n') == 'Application')
        return [(c.get('n'), round(c.get('x', 0), 1), round(c.get('y', 0), 1), round(c.get('w', 0), 1), round(c.get('h', 0), 1)) for c in app['ch']]
    out[st] = {'new': top(sc), 'old': top(old)}
    print('==', st)
    print('   avant :', [t[0] + (' h=%s' % t[4] if t[0] == 'Après · Application' else '') for t in out[st]['old']])
    print('   après :', [t[0] + (' h=%s' % t[4] if t[0] == 'Après · Application' else '') + (' y=%s' % t[2] if t[0] == 'Barre de périmètre' else '') for t in out[st]['new']])
json.dump(out, open('desk_check.json', 'w'), ensure_ascii=False, indent=1)
