"""23 Oct.: frames whose links must be sent (again): those of the lots not executed in Figma, and those of the executed lots
whose zones or timer differ in the current plan from the plan that produced their lot.
python3 a_renvoyer.py <fmt> <plan of the sent lots> <executed lot numbers…> → one frame key per line on stdout"""
import glob, json, re, sys
from pathlib import Path
B = Path(__file__).resolve().parents[2]
fmt, sent = sys.argv[1], json.load(open(sys.argv[2]))
done = set(sys.argv[3:])
cur = json.load(open(B / 'parcours/plan.json'))
ids = json.load(open(B / 'parcours/ids.json'))
byid = {v: k for k, v in ids['frames'].items()}
linked = set()
for f in glob.glob(str(B / 'calls/done/*-parcours-liens-*.js')) + glob.glob(str(B / 'calls/*-parcours-liens-*.js')):
    if Path(f).name[:4] in done:
        t = open(f, encoding='utf-8').read()
        linked |= {byid[j['id']] for j in json.loads(re.search(r'^const J = (.*);$', t, re.M).group(1))}
norm = lambda hs: json.dumps([{k: h.get(k) for k in ('box', 'fixed', 'act', 'label', 'in')} for h in hs], sort_keys=True, ensure_ascii=False)
out = [k for k in cur['frames'] if k.startswith(fmt + '|') and (k not in linked or norm(sent['hotspots'].get(k, [])) != norm(cur['hotspots'].get(k, []))
                                                         or sent['auto'].get(k) != cur['auto'].get(k))]
print('\n'.join(sorted(out)))
print(len(out), 'cadres', file=sys.stderr)
