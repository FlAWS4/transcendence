#!/usr/bin/env python3
"""Inventory of path references between folders of the Transcendence repo.

Usage: python3 -I refscan.py REPO OUT_JSON
"""
import json, os, re, subprocess, sys
from collections import Counter, defaultdict
from urllib.parse import unquote

REPO = os.path.abspath(sys.argv[1])
OUT = sys.argv[2]
TEXT_EXT = {'.html', '.htm', '.mjs', '.js', '.cjs', '.css', '.md', '.json', '.py', '.sh', '.txt', '.svg', '.ts', '.yml', '.yaml', '.diff', '.orig', '.source', '.log', ''}

files = subprocess.run(['git', '-C', REPO, 'ls-files', '-z'], capture_output=True, check=True).stdout.decode().split('\0')
files = [f for f in files if f]
tracked = set(files)
dirs = set()
for f in files:
    p = os.path.dirname(f)
    while p:
        dirs.add(p)
        p = os.path.dirname(p)


def unit(path):
    """Coarse ownership unit of a repo-relative path."""
    parts = path.split('/')
    if parts[0] != 'work':
        return 'root:' + parts[0]
    if len(parts) < 3:
        return '/'.join(parts)
    top, sub = parts[1], parts[2]
    if top == 'visualizations':
        if sub == 'horizon-welcome':
            if len(parts) > 3 and parts[3] == 'archive':
                return 'site/archive'
            if len(parts) > 3 and parts[3] == 'checks':
                return 'site/checks'
            if len(parts) > 3 and parts[3] == 'tests':
                return 'site/tests'
            return 'site/active'
        if len(parts) == 3:
            return 'vis/loose-files'
        return 'vis/' + sub
    if top == 'figma':
        if sub == 'refonte-20261015':
            return 'figma/refonte'
        return 'figma/legacy'
    return top + '/' + sub


REL = re.compile(r'''(?<![A-Za-z0-9_:/.\-])((?:\.\.?/)+[^\s"'`()<>\[\]{}|,;\\]+)''')
LINKS = [
    re.compile(r'\]\(<([^>]+)>\)'),
    re.compile(r'\]\(([^)\s]+)\)'),
    re.compile(r'''(?:src|href|data|poster|action)\s*=\s*["']([^"'#][^"']*)["']'''),
    re.compile(r'''url\(\s*["']?([^"')]+)["']?\s*\)'''),
    re.compile(r'''(?:from|import)\s*\(?\s*["']([^"']+)["']'''),
    re.compile(r'''new URL\(\s*["']([^"']+)["']'''),
    re.compile(r'''fetch\(\s*["']([^"']+)["']'''),
]
ROOTREF = re.compile(r'''(?<![A-Za-z0-9_.\-])(work/(?:visualizations|figma|reviews)(?:/[^\s"'`()<>\[\]{}|,;\\]*)?)''')
ROOTDOC = re.compile(r'''(?<![A-Za-z0-9_./\-])((?:PROJECT_CONTEXT|BOARDING_JOURNAL|AGENTS|README|IDEA|VERSIONING|DOCUMENTATION(?:\.en)?|CONVERSATION)\.md|en\.subject\.pdf)''')

def clean(ref):
    ref = ref.split('#', 1)[0].split('?', 1)[0]
    ref = ref.rstrip('.:*')
    return unquote(ref)

def exists(p):
    return p in tracked or p in dirs or os.path.exists(os.path.join(REPO, p))

edges = Counter()
by_file = defaultdict(list)
missing = Counter()
stats = Counter()
for f in files:
    ext = os.path.splitext(f)[1].lower()
    if ext not in TEXT_EXT:
        continue
    full = os.path.join(REPO, f)
    try:
        if os.path.getsize(full) > 8_000_000:
            stats['skipped_big'] += 1
            continue
        text = open(full, encoding='utf-8', errors='replace').read()
    except OSError:
        continue
    stats['scanned'] += 1
    base = os.path.dirname(f)
    src_unit = unit(f)
    found = set()
    cands = set(m.group(1) for m in REL.finditer(text))
    for rx in LINKS:
        cands.update(m.group(1) for m in rx.finditer(text))
    for raw in cands:
        if re.match(r'^[a-z][a-z0-9+.-]*:', raw, re.I) or raw.startswith('/') or raw.startswith('data:'):
            continue
        r = clean(raw)
        if not r or r in ('.', '..'):
            continue
        target = os.path.normpath(os.path.join(base, r)) if base else os.path.normpath(r)
        if target.startswith('..'):
            continue
        if not exists(target):
            if r.startswith('../'):
                missing[(f, raw)] += 1
            continue
        found.add(('rel', raw, target))
    for m in ROOTREF.finditer(text):
        r = clean(m.group(1)).rstrip('/')
        target = os.path.normpath(r)
        # Shorten to the longest existing prefix (paths in prose may carry punctuation).
        t = target
        while t and not exists(t):
            t = os.path.dirname(t)
        if t:
            found.add(('root', m.group(1), t))
    for kind, raw, target in found:
        tu = unit(target)
        if tu != src_unit:
            edges[(src_unit, tu, kind)] += 1
            by_file[f].append([kind, raw, target])

matrix = defaultdict(dict)
for (a, b, k), n in edges.items():
    matrix[a][f'{b} [{k}]'] = n
json.dump({
    'stats': stats,
    'matrix': matrix,
    'files_with_cross_refs': len(by_file),
    'by_file': by_file,
    'missing_parent_refs_sample': [[f, r] for (f, r) in list(missing)[:200]],
    'missing_parent_refs_count': len(missing),
}, open(OUT, 'w'), indent=1, ensure_ascii=False, default=dict)
print(json.dumps(stats))
for a in sorted(matrix):
    print(a)
    for b, n in sorted(matrix[a].items(), key=lambda x: -x[1]):
        print(f'   -> {b}: {n}')
print('files with cross refs:', len(by_file))
print('missing ../ refs:', len(missing))
