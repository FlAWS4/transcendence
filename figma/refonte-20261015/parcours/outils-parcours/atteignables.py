"""Frames reachable from the starting points of the flows (arrival, member, direct preview) by zones and timers."""
import json, sys, collections
plan = json.load(open(sys.argv[1]))
fr, hs, auto = plan['frames'], plan['hotspots'], plan['auto']
for fmt in ('desktop', 'mobile'):
    for lang in ('fr', 'en'):
        starts = ['|'.join((fmt, lang, 'v', s)) for s in ('arrival-scan-binary', 'member-explore', 'projects')]
        seen, todo = set(), [s for s in starts if s in fr]
        while todo:
            k = todo.pop()
            if k in seen: continue
            seen.add(k)
            for h in hs.get(k, []):
                t = h['act'].get('nav')
                if t and t not in seen: todo.append(t)
            a = auto.get(k)
            if a and a['nav'] not in seen: todo.append(a['nav'])
        mine = [k for k in fr if k.startswith(fmt + '|' + lang + '|')]
        out = sorted(k for k in mine if k not in seen)
        print(fmt, lang, len(seen), '/', len(mine), 'atteints ; hors d’atteinte :', [fr[k]['name'].split(' — ')[0] for k in out])
