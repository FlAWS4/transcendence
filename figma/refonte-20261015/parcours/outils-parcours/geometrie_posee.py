# 23 Oct.: offline check of the posed zones, geometry included. Regenerates, in <output folder>, the links lots that the final
# plan gives (parcours.links_calls, nothing written in calls/), then compares each frame with the last executed lot that
# holds it (calls/done): zones (box, label, arrival, container), timer and scrolling, then the starting points of each page.
# Usage: python3 parcours/outils-parcours/geometrie_posee.py <output folder>
import sys, json, re, glob, pathlib, shutil, os
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
sys.path.insert(0, str(BASE / 'scripts'))
os.chdir(BASE)
import parcours as P
S = pathlib.Path(sys.argv[1]); shutil.rmtree(S, ignore_errors=True); S.mkdir(parents=True)
n = [0]
def nxt():
    n[0] += 1; return n[0]
P.CALLS, P.next_index = S, nxt
P.links_calls(P.jload(P.PARC / 'plan.json'))
def lots(files):
    out, flows = {}, {}
    for f in files:
        t = open(f, encoding='utf-8').read()
        for e in json.loads(re.search(r'^const J = (.*);$', t, re.M).group(1)):
            out[e['id']] = (e, os.path.basename(f))
        m = re.search(r'^dest\.flowStartingPoints = (.*);$', t, re.M)
        if m:
            flows['desktop' if '-desktop' in f else 'mobile'] = (json.loads(m.group(1)), os.path.basename(f))
    return out, flows
num = lambda f: int(os.path.basename(f).split('-')[0])
exp, eflows = lots(sorted(glob.glob(str(S / '*-parcours-liens-*.js')), key=num))
act, aflows = lots(sorted(glob.glob('calls/done/*-parcours-liens-*.js'), key=num))
ids = json.load(open('parcours/ids.json')); byid = {v: k for k, v in ids['frames'].items()}
print('attendus :', len(exp), 'cadres ; posés :', len(act), 'cadres')
diff, never = [], []
for fid, (e, _) in exp.items():
    if fid not in act:
        never.append(byid.get(fid, fid)); continue
    a, f = act[fid]
    if json.dumps(e, sort_keys=True, ensure_ascii=False) != json.dumps(a, sort_keys=True, ensure_ascii=False):
        what = [k for k in ('zones', 'auto', 'scrolls') if json.dumps(e.get(k), sort_keys=True) != json.dumps(a.get(k), sort_keys=True)]
        ez = {json.dumps(z, sort_keys=True, ensure_ascii=False) for z in e['zones']}
        az = {json.dumps(z, sort_keys=True, ensure_ascii=False) for z in a['zones']}
        diff.append((byid.get(fid, fid), f, what, len(e['zones']), len(a['zones']), sorted(ez - az)[:3], sorted(az - ez)[:3]))
print('jamais posés :', len(never), never[:20])
print('différents du plan final :', len(diff))
for d in diff:
    print(' ', d[0], '| dernier lot', d[1], '|', d[2], '| zones attendues', d[3], 'posées', d[4])
    for z in d[5]: print('      manque :', z[:260])
    for z in d[6]: print('      en trop :', z[:260])
for fmt in ('desktop', 'mobile'):
    e, a = eflows.get(fmt), aflows.get(fmt)
    print('points de départ', fmt, ': attendus', len(e[0]) if e else None, '| derniers posés', (a[1], len(a[0])) if a else None, '| identiques' if e and a and e[0] == a[0] else '| DIFFÉRENTS')
