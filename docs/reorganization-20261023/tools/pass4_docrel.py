#!/usr/bin/env python3
"""Archive viewer modules that build URLs against the document base (<base href>).

For each page with <base href>, take the modules of its own archive that the page
actually loads (crawl graph), and re-express string literals that resolved against
the OLD document base (and not against the module itself) relative to the NEW base.
    python3 -I pass4_docrel.py REPO PLAN.json CRAWL_AFTER.json PASS3.json OUT.json [--write]
"""
import json, os, re, subprocess, sys
from collections import defaultdict
from urllib.parse import unquote

REPO, PLAN, CRAWL, PASS3, OUT = sys.argv[1:6]
WRITE = '--write' in sys.argv
plan = json.load(open(PLAN))
rules = plan['rules']; keys = sorted(rules, key=len, reverse=True)
back = {v: k for k, v in plan['moves'].items()}
old_files = set(plan['moves']) | set(subprocess.run(['git', '-C', REPO, 'ls-tree', '-r', '--name-only', 'HEAD'], capture_output=True, text=True).stdout.split('\n'))
old_dirs = set()
for f in old_files:
    p = os.path.dirname(f)
    while p:
        old_dirs.add(p); p = os.path.dirname(p)


def mp(p):
    for k in keys:
        if p == k or p.startswith(k + '/'):
            return rules[k] + p[len(k):]
    return p


def exists_old(p):
    return p == '' or p in old_files or p in old_dirs


edges = defaultdict(set)
for f, raw, t, ok in json.load(open(CRAWL))['edges']:
    if ok:
        edges[f].add(t)
pass3 = json.load(open(PASS3))
LIT = re.compile(r'''(["'`])((?:\.\.?/|archive/)[^"'`\n$]*)\1''')
todo = defaultdict(lambda: {'bases': set()})
for page, info in pass3.items():
    archive_dir = '/'.join(page.split('/')[:3]) if page.startswith('archives/site-versions/') else None
    if not archive_dir:
        continue
    seen, stack = set(), [page]
    while stack:
        f = stack.pop()
        if f in seen:
            continue
        seen.add(f)
        for t in edges.get(f, ()):
            if t.endswith(('.mjs', '.js')) and t.startswith(archive_dir + '/'):
                stack.append(t)
    for mod in seen:
        if mod.endswith(('.mjs', '.js')):
            todo[mod]['bases'].add((info['old_base'], info['new_base']))
report = {}
for mod, data in sorted(todo.items()):
    if len(data['bases']) != 1:
        print('SKIP several bases', mod); continue
    (b_old, b_new), = data['bases']
    old_mod = back.get(mod, mod)
    text = open(os.path.join(REPO, mod), encoding='utf-8').read()
    edits = []
    for m in LIT.finditer(text):
        raw = m.group(2)
        path = raw.split('#', 1)[0].split('?', 1)[0]
        suffix = raw[len(path):]
        if not path:
            continue
        t_mod = os.path.normpath(os.path.join(os.path.dirname(old_mod), unquote(path)))
        t_doc = os.path.normpath(os.path.join(b_old, unquote(path)))
        if exists_old(t_mod) and not t_mod.startswith('..'):
            continue   # module-relative (imports, new URL(…, import.meta.url))
        if t_doc.startswith('..') or not exists_old(t_doc):
            continue
        rel = os.path.relpath(os.path.join(REPO, mp(t_doc)), os.path.join(REPO, b_new))
        if path.endswith('/') and not rel.endswith('/'):
            rel += '/'
        if path.startswith('./') and not rel.startswith('.'):
            rel = './' + rel
        new = rel + suffix
        if new != raw:
            edits.append((m.start(2), m.end(2), raw, new))
    if edits:
        report[mod] = {'old_base': b_old, 'new_base': b_new, 'edits': [[s, o, n] for s, e, o, n in edits]}
        for s, e, o, n in edits:
            print(mod, '|', o, '->', n)
        if WRITE:
            out, pos = [], 0
            for s, e, o, n in edits:
                out.append(text[pos:s]); out.append(n); pos = e
            out.append(text[pos:])
            open(os.path.join(REPO, mod), 'w', encoding='utf-8').write(''.join(out))
json.dump(report, open(OUT, 'w'), indent=1, ensure_ascii=False)
print('modules with edits:', len(report), 'write' if WRITE else 'dry-run')
