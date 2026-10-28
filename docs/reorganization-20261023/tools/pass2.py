import json, os, re, sys
R = '/home/le-rif/Bureau/Transcendence'
plan = json.load(open('plan.json'))
rules = plan['rules']; keys = sorted(rules, key=len, reverse=True)
SPLIT = {'work', 'work/visualizations', 'work/figma'}
old_files = set(plan['moves'])
old_dirs = set()
for f in old_files:
    p = os.path.dirname(f)
    while p:
        old_dirs.add(p); p = os.path.dirname(p)
def exists_old(p): return p in old_files or p in old_dirs
def mp(p):
    for k in keys:
        if p == k or p.startswith(k + '/'): return rules[k] + p[len(k):]
    return p
TOK = re.compile(r'''work/(?:visualizations|figma|reviews)(?:/[^\s"'`()<>\[\]{}|,;\\*]*)?''')
files = sys.argv[1:]
log = {}
for f in files:
    s = open(os.path.join(R, f), encoding='utf-8').read()
    out, pos, reps = [], 0, []
    for m in TOK.finditer(s):
        tok = m.group(0)
        path = tok.split('?', 1)[0].split('#', 1)[0]
        suffix = tok[len(path):]
        core = path.rstrip('.:,;!')
        tail = path[len(core):]
        bare = core.rstrip('/')
        if bare in SPLIT:
            continue
        t = os.path.normpath(bare)
        while t and not exists_old(t): t = os.path.dirname(t)
        if not t or t in SPLIT:
            continue
        new = mp(t) + bare[len(t):] + ('/' if core.endswith('/') else '') + tail + suffix
        out.append(s[pos:m.start()]); out.append(new); pos = m.end()
        reps.append([m.start(), tok, new])
    out.append(s[pos:])
    if reps:
        open(os.path.join(R, f), 'w', encoding='utf-8').write(''.join(out))
        log[f] = reps
        for r in reps: print(f, '|', r[1][:90], '->', r[2][:90])
json.dump(log, open('pass2.json', 'w'), indent=1, ensure_ascii=False)
