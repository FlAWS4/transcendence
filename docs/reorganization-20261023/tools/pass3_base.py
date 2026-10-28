#!/usr/bin/env python3
"""Redo the path rewrite of HTML pages that use <base href>, from their HEAD bytes.

Every attribute / CSS url() / inline-module literal is resolved against the page's
old base; when it existed in the old tree, it is re-expressed against the new base
(the mapped old base), so the page keeps loading exactly the same files.
    python3 -I pass3_base.py REPO PLAN.json OUT.json FILE...   (FILE = new paths)
"""
import json, os, re, subprocess, sys
from urllib.parse import unquote

REPO, PLAN, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
files = sys.argv[4:]
plan = json.load(open(PLAN))
rules = plan['rules']; keys = sorted(rules, key=len, reverse=True)
moves = plan['moves']
back = {v: k for k, v in moves.items()}
old_files = set(moves) | set(subprocess.run(['git', '-C', REPO, 'ls-tree', '-r', '--name-only', 'HEAD'], capture_output=True, text=True).stdout.split('\n'))
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


BASE = re.compile(r'''(<base\s+href\s*=\s*)(["'])([^"']*)\2''', re.I)
ATTR = re.compile(r'''(?:\b(?:src|href|data|poster)\s*=\s*)(["'])([^"'#\n][^"'\n]*)\1''', re.I)
CSS_URL = re.compile(r'''url\(\s*(["']?)([^"')\s]+)\1\s*\)''')
JS = re.compile(r'''(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|new\s+URL\(\s*|fetch\(\s*)(["'`])([^"'`\n$]+)\1''')
log = {}
for new_path in files:
    old_path = back.get(new_path, new_path)
    text = subprocess.run(['git', '-C', REPO, 'show', f'HEAD:{old_path}'], capture_output=True, check=True).stdout.decode('utf-8')
    m = BASE.search(text)
    old_dir, new_dir = os.path.dirname(old_path), os.path.dirname(new_path)
    b_old = os.path.normpath(os.path.join(old_dir, m.group(3)))
    b_new = mp(b_old)
    base_new = os.path.relpath(os.path.join(REPO, b_new), os.path.join(REPO, new_dir)) + '/'
    edits = [(m.start(3), m.end(3), m.group(3), base_new)]
    spans = []
    for rx, g in ((ATTR, 2), (CSS_URL, 2), (JS, 2)):
        for mm in rx.finditer(text):
            if m.start() <= mm.start(g) < m.end():
                continue
            spans.append((mm.start(g), mm.end(g), mm.group(g)))
    spans.sort()
    last = -1
    for s, e, raw in spans:
        if s < last:
            continue
        last = e
        if re.match(r'^[a-z][a-z0-9+.-]*:', raw, re.I) or raw.startswith(('/', '#', '{', '$')):
            continue
        path = raw.split('#', 1)[0].split('?', 1)[0]
        suffix = raw[len(path):]
        if not path:
            continue
        t_old = os.path.normpath(os.path.join(b_old, unquote(path)))
        if t_old.startswith('..') or not exists_old(t_old):
            continue
        t_new = mp(t_old)
        rel = os.path.relpath(os.path.join(REPO, t_new), os.path.join(REPO, b_new))
        if path.endswith('/') and not rel.endswith('/'):
            rel += '/'
        if path.startswith('./') and not rel.startswith('.'):
            rel = './' + rel
        new = rel + suffix
        if new != raw:
            edits.append((s, e, raw, new))
    edits.sort()
    out, pos = [], 0
    for s, e, old, new in edits:
        out.append(text[pos:s]); out.append(new); pos = e
    out.append(text[pos:])
    open(os.path.join(REPO, new_path), 'w', encoding='utf-8').write(''.join(out))
    log[new_path] = {'old_path': old_path, 'old_base': b_old, 'new_base': b_new, 'edits': [[s, o, n] for s, e, o, n in edits]}
    print(new_path, 'base', m.group(3), '->', base_new, '|', len(edits) - 1, 'refs re-expressed')
json.dump(log, open(OUT, 'w'), indent=1, ensure_ascii=False)
