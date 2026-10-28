#!/usr/bin/env python3
"""Static reference crawl from every HTML page, honouring <base href>.

    python3 -I crawl2.py REPO git REV OUT.json   # old tree, read from git objects
    python3 -I crawl2.py REPO fs  -   OUT.json   # working tree (tracked + untracked, not ignored)
"""
import json, os, re, subprocess, sys
from urllib.parse import unquote

REPO, MODE, REV, OUT = sys.argv[1:5]
if MODE == 'git':
    names = subprocess.run(['git', '-C', REPO, 'ls-tree', '-r', '--name-only', REV], capture_output=True, text=True, check=True).stdout.split('\n')
else:
    names = subprocess.run(['git', '-C', REPO, 'ls-files', '-co', '--exclude-standard'], capture_output=True, text=True, check=True).stdout.split('\n')
names = [n for n in names if n]
files = set(names)
dirs = set()
for f in files:
    p = os.path.dirname(f)
    while p:
        dirs.add(p); p = os.path.dirname(p)

cat = None
if MODE == 'git':
    cat = subprocess.Popen(['git', '-C', REPO, 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)


def read(path):
    if MODE == 'fs':
        return open(os.path.join(REPO, path), 'rb').read()
    cat.stdin.write(f'{REV}:{path}\n'.encode()); cat.stdin.flush()
    header = cat.stdout.readline().split()
    if header[-1] == b'missing':
        return b''
    size = int(header[2]); data = cat.stdout.read(size); cat.stdout.read(1)
    return data


def exists(p):
    return p in files or p in dirs


BASE = re.compile(r'''<base\s+href\s*=\s*["']([^"']*)["']''', re.I)
ATTR = re.compile(r'''\b(?:src|href|data|poster)\s*=\s*(["'])([^"'#\n][^"'\n]*)\1''', re.I)
CSS_URL = re.compile(r'''url\(\s*(["']?)([^"')\s]+)\1\s*\)''')
JS = re.compile(r'''(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|new\s+URL\(\s*|fetch\(\s*|Worker\(\s*|importScripts\(\s*)(["'`])([^"'`\n$]+)\1''')
FOLLOW = ('.html', '.htm', '.mjs', '.js', '.css')

pages = [f for f in names if f.endswith(('.html', '.htm'))]
edges, seen, stack = set(), set(), list(pages)
while stack:
    f = stack.pop()
    if f in seen:
        continue
    seen.add(f)
    text = read(f).decode('utf-8', 'replace')
    base = os.path.dirname(f)
    ext = os.path.splitext(f)[1].lower()
    refs = []
    if ext in ('.html', '.htm'):
        m = BASE.search(text)
        if m:
            base = os.path.normpath(os.path.join(base, m.group(1)))
        refs += [x.group(2) for x in ATTR.finditer(text) if not (m and x.start() >= m.start() and x.end() <= m.end())]
        refs += [x.group(2) for x in CSS_URL.finditer(text)] + [x.group(2) for x in JS.finditer(text)]
    elif ext == '.css':
        refs += [x.group(2) for x in CSS_URL.finditer(text)]
    else:
        refs += [x.group(2) for x in JS.finditer(text)]
    for raw in refs:
        if re.match(r'^[a-z][a-z0-9+.-]*:', raw, re.I) or raw.startswith(('/', '#', '{', '$')):
            continue
        p = raw.split('#', 1)[0].split('?', 1)[0]
        if not p:
            continue
        t = os.path.normpath(os.path.join(base, unquote(p)))
        ok = not t.startswith('..') and exists(t)
        edges.add((f, raw, t, ok))
        if ok and t in files and t.endswith(FOLLOW):
            stack.append(t)
json.dump({'pages': len(pages), 'files_seen': len(seen), 'edges': sorted(edges)}, open(OUT, 'w'), ensure_ascii=False)
print(json.dumps({'pages': len(pages), 'files_seen': len(seen), 'edges': len(edges), 'ok': sum(1 for e in edges if e[3]), 'missing': sum(1 for e in edges if not e[3])}))
