"""Zones of some frames of plan.json, readable: python3 voir_zones.py <plan.json> <fmt> <lang> <state> [<state>…]"""
import json, sys
plan = json.load(open(sys.argv[1]))
fmt, lang = sys.argv[2], sys.argv[3]
name = lambda k: plan['frames'][k]['name'].split(' — ')[0] if k in plan['frames'] else k
for st in sys.argv[4:]:
    k = '|'.join((fmt, lang, 'v', st))
    hs = plan['hotspots'].get(k)
    if hs is None:
        print('##', st, 'absent'); continue
    print('##', name(k), len(hs), 'zones')
    for h in hs:
        a = h['act']
        to = ('→ ' + name(a['nav'])) if 'nav' in a else ('← RETOUR' if 'back' in a else str(a))
        print('   %-38s %-24s %s %s' % (h['label'][:38], str([round(v) for v in h['box']]), to[:60], ('[' + h['layer'] + ']') if h.get('layer') else ''))
