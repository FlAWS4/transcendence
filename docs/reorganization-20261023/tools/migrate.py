#!/usr/bin/env python3
"""Restructure the Transcendence repository into explicit top-level folders.

    python3 -I migrate.py REPO plan   PLAN.json              # nothing changes on disk
    python3 -I migrate.py REPO apply  PLAN.json LEDGER.json  # moves files, rewrites live paths
    python3 -I migrate.py REPO verify PLAN.json LEDGER.json  # after apply

Only references that resolve today (live links) are rewritten. Frozen copies
(originals/, baseline/, _superseded/, source-documents/, note copies inside site
archives), evidence data (JSON under checks, verification, call results, proofs,
manifests, results) and archive generators (snapshot.py) are never rewritten.
In BOARDING_JOURNAL.md and CONVERSATION.md only link targets change.
Every rewritten file is recorded in the ledger with its exact replacements and
its SHA-256 before and after, so the previous bytes can be rebuilt exactly.
"""
import hashlib, json, os, re, subprocess, sys
from collections import Counter, defaultdict
from urllib.parse import unquote

REPO = os.path.abspath(sys.argv[1])
MODE = sys.argv[2]
PLAN = sys.argv[3]
LEDGER = sys.argv[4] if len(sys.argv) > 4 else None

V = 'work/visualizations'
F = 'work/figma'
HW = f'{V}/horizon-welcome'
STUDIES = ['awards-studies', 'brand-transition-studies', 'connected-experience-studies', 'decryption-examples',
           'design-review-studies', 'glass-studies', 'globe-control-placement', 'globe-gesture-studies',
           'menu-studies', 'navigation-studies', 'profile-navigation-studies', 'search-studies', 'research-archive']
FROZEN_STUDY_STATES = {
    'brand-transition-studies-initial-20261008': 'brand-transition-studies/archive/initial-20261008',
    'connected-experience-studies-bounded-scroll-20261007': 'connected-experience-studies/archive/bounded-scroll-20261007',
    'connected-experience-studies-full-sidebar-scroll-20261007': 'connected-experience-studies/archive/full-sidebar-scroll-20261007',
    'profile-navigation-studies-initial-20261007': 'profile-navigation-studies/archive/initial-20261007',
    'profile-navigation-studies-pre-group-selection-20261007': 'profile-navigation-studies/archive/pre-group-selection-20261007',
    'profile-navigation-studies-pre-project-filters-20261007': 'profile-navigation-studies/archive/pre-project-filters-20261007',
    'profile-navigation-studies-pre-underlined-tabs-20261007': 'profile-navigation-studies/archive/pre-underlined-tabs-20261007',
}
EARLY = 'archives/early-prototypes'
LOOSE = {
    'horizon-decryption.html': 'decryption', 'horizon-decryption.css': 'decryption', 'horizon-decryption.mjs': 'decryption',
    'horizon-decryption-morph.mjs': 'decryption', 'horizon-decryption-engine.mjs': 'decryption',
    'horizon-decryption-engine.test.mjs': 'decryption', 'decryption-notes.md': 'decryption',
    'horizon-globe.html': 'globe-explorer', 'horizon-globe.template.html': 'globe-explorer', 'globe-engine.js': 'globe-explorer',
    'horizon-scene.css': 'globe-explorer', 'build_horizon.py': 'globe-explorer', 'explorer-campus.html': 'globe-explorer',
    'explorer-campus-preview.html': 'globe-explorer',
    'content-first-proposal.html': 'content-first-proposal', 'content-first-proposal-preview.html': 'content-first-proposal',
}
ROOT_DOCS = ['DOCUMENTATION.md', 'DOCUMENTATION.en.md', 'CONVERSATION.md', 'en.subject.pdf', '42 - Charte graphique 2024.pdf']
LINK_ONLY = {'BOARDING_JOURNAL.md', 'CONVERSATION.md'}   # journal and old export: link targets only
NOTE_NAMES = {n for n in os.listdir(os.path.join(REPO, HW)) if n.endswith('.md')} if os.path.isdir(os.path.join(REPO, HW)) else set()
DOC_COPY_NAMES = NOTE_NAMES | {'PROJECT_CONTEXT.md', 'BOARDING_JOURNAL.md', 'AGENTS.md', 'IDEA.md', 'VERSIONING.md',
                               'DOCUMENTATION.md', 'DOCUMENTATION.en.md', 'CONVERSATION.md', 'README.md'}


def build_rules():
    r = {
        HW: 'site',
        f'{HW}/archive': 'archives/site-versions',
        f'{HW}/welcome-panels.html': f'{EARLY}/welcome-panels/welcome-panels.html',
        f'{HW}/welcome-panels.mjs': f'{EARLY}/welcome-panels/welcome-panels.mjs',
        f'{V}/site-map': 'docs/site-map',
        f'{V}/assets': 'shared/assets',
        f'{V}/map-data': 'shared/map-data',
        f'{V}/horizon-welcome-separate-city': f'{EARLY}/separate-city-map',
        f'{F}/logo-42.svg': 'shared/brand/logo-42.svg',
        f'{F}/tokens.css': 'shared/brand/tokens.css',
        f'{F}/refonte-20261015': 'figma/refonte-20261015',
        F: 'figma/explorations-2026-09',
        'work/reviews': 'docs/reviews',
    }
    for name in NOTE_NAMES:
        r[f'{HW}/{name}'] = f'site/notes/{name}'
    for s in STUDIES:
        r[f'{V}/{s}'] = f'studies/{s}'
    for old, new in FROZEN_STUDY_STATES.items():
        r[f'{V}/{old}'] = f'studies/{new}'
    for name, group in LOOSE.items():
        r[f'{V}/{name}'] = f'{EARLY}/{group}/{name}'
    for name in ROOT_DOCS:
        r[name] = f'docs/{name}'
    return r


RULES = build_rules()
RULE_KEYS = sorted(RULES, key=len, reverse=True)
SPLIT = {'work', V, F}   # split across several destinations: human wording needed


def map_path(p):
    if p in SPLIT:
        return None
    for k in RULE_KEYS:
        if p == k or p.startswith(k + '/'):
            return RULES[k] + p[len(k):]
    return p


def git_files():
    out = subprocess.run(['git', '-C', REPO, 'ls-files', '-z'], capture_output=True, check=True).stdout.decode()
    return [f for f in out.split('\0') if f]


def disk_files():
    res = []
    for root, ds, fs in os.walk(REPO):
        if root == REPO:
            ds[:] = [d for d in ds if d != '.git']
        for f in fs:
            res.append(os.path.relpath(os.path.join(root, f), REPO))
    return sorted(res)


def sha(data):
    return hashlib.sha256(data).hexdigest()


# ---------------------------------------------------------------- classification
CODE_EXT = {'.html', '.htm', '.mjs', '.js', '.cjs', '.css'}
EVIDENCE_DIRS = re.compile(r'(^|/)(checks|verification|call-results|calls|results|reference|dom|[^/]*-proof|relectures|captures)(/|$)')
FROZEN_DIRS = re.compile(r'(^|/)(originals|baseline|_superseded|source-documents)(/|$)')
SITE_ARCHIVE = re.compile(r'^' + re.escape(HW) + r'/archive/[^/]+/(.+)$')


def category(path):
    ext = os.path.splitext(path)[1].lower()
    if FROZEN_DIRS.search(path) or re.search(r'(^|/)snapshot\.py$', path):
        return 'frozen'
    m = SITE_ARCHIVE.match(path)
    if m and ext == '.md' and m.group(1) != 'README.md' and os.path.basename(path) in DOC_COPY_NAMES:
        return 'frozen'   # copy of a site note kept as evidence of its state
    if ext in CODE_EXT:
        return 'code'
    if ext == '.md':
        return 'doc'
    if ext in ('.py', '.sh'):
        return 'script'
    if ext == '.json':
        if EVIDENCE_DIRS.search(path) or re.search(r'(manifest|results?|verification|evidence|report)[^/]*\.json$', path, re.I):
            return 'evidence'
        return 'data'
    return 'other'


# ---------------------------------------------------------------- reference extraction
PATHCH = r'''[^\s"'`()<>\[\]{}|,;\\*]'''
MD_LINK_ANGLE = re.compile(r'\]\(<([^>\n]+)>')
MD_LINK = re.compile(r'\]\(([^)\s<][^)\s]*)')
MD_REFDEF = re.compile(r'^\s*\[[^\]]+\]:\s*(\S+)', re.M)
ATTR = re.compile(r'''(?:\b(?:src|href|data|poster|action)\s*=\s*)(["'])([^"'#\n][^"'\n]*)\1''', re.I)
CSS_URL = re.compile(r'''url\(\s*(["']?)([^"')\s]+)\1\s*\)''')
JS_STR = re.compile(r'''(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|new\s+URL\(\s*|fetch\(\s*|Worker\(\s*|importScripts\(\s*|readFileSync\(\s*|readFile\(\s*|resolve\(\s*|join\(\s*)(["'`])([^"'`\n$]+)\1''')
DOT_REL = re.compile(r'''(?<![A-Za-z0-9_:/.\-])((?:\.\.?/)+''' + PATHCH + r'''+)''')
ROOT_WORK = re.compile(r'''(?<![A-Za-z0-9_.\-])(work/(?:visualizations|figma|reviews)(?:/''' + PATHCH + r'''*)?|work/(?=\s|$|[`"')]))''')
BACKTICK = re.compile(r'`([^`\s]+)`')


def split_suffix(raw):
    m = re.match(r'^([^?#]*)(.*)$', raw, re.S)
    return m.group(1), m.group(2)


def strip_trailing(path):
    tail = ''
    while path and path[-1] in '.:,;!' and not path.endswith('..'):
        tail = path[-1] + tail
        path = path[:-1]
    return path, tail


class Tree:
    def __init__(self):
        self.all = disk_files()
        self.set = set(self.all)
        self.dirs = set()
        for f in self.all:
            p = os.path.dirname(f)
            while p:
                self.dirs.add(p)
                p = os.path.dirname(p)

    def exists(self, p):
        return p == '' or p in self.set or p in self.dirs


def resolve_rel(tree, file_dir, path):
    if not path or path.startswith('/') or re.match(r'^[a-z][a-z0-9+.-]*:', path, re.I):
        return None
    t = os.path.normpath(os.path.join(file_dir, unquote(path))) if file_dir else os.path.normpath(unquote(path))
    if t == '.':
        t = ''
    if t.startswith('..'):
        return None
    return t if tree.exists(t) else None


def longest_existing(tree, p):
    t = os.path.normpath(p)
    while t and t != '.' and not tree.exists(t):
        t = os.path.dirname(t)
    return '' if t == '.' else t


def candidates(path, text, cat):
    out = []
    ext = os.path.splitext(path)[1].lower()
    if cat == 'doc':
        for rx in (MD_LINK_ANGLE, MD_LINK):
            for m in rx.finditer(text):
                out.append((m.start(1), m.end(1), m.group(1), 'link'))
        for m in MD_REFDEF.finditer(text):
            out.append((m.start(1), m.end(1), m.group(1), 'link'))
        for m in ATTR.finditer(text):
            out.append((m.start(2), m.end(2), m.group(2), 'link'))
        for m in BACKTICK.finditer(text):
            out.append((m.start(1), m.end(1), m.group(1), 'prose'))
    if cat == 'code':
        for m in ATTR.finditer(text):
            out.append((m.start(2), m.end(2), m.group(2), 'link'))
        if ext in ('.css', '.html', '.htm'):
            for m in CSS_URL.finditer(text):
                out.append((m.start(2), m.end(2), m.group(2), 'link'))
        if ext in ('.mjs', '.js', '.cjs', '.html', '.htm'):
            for m in JS_STR.finditer(text):
                out.append((m.start(2), m.end(2), m.group(2), 'link'))
    if cat in ('doc', 'code'):
        for m in DOT_REL.finditer(text):
            out.append((m.start(1), m.end(1), m.group(1), 'dotrel'))
    for m in ROOT_WORK.finditer(text):
        out.append((m.start(1), m.end(1), m.group(1), 'root'))
    return out


def dedupe(cands):
    prio = {'link': 0, 'dotrel': 1, 'root': 2, 'prose': 3}
    cands = sorted(cands, key=lambda c: (c[0], -(c[1] - c[0]), prio[c[3]]))
    kept, end = [], -1
    for c in cands:
        if c[0] >= end:
            kept.append(c)
            end = c[1]
    return kept


def relpath_style(raw_path, new_target, new_dir):
    rel = os.path.relpath(os.path.join(REPO, new_target) if new_target else REPO, os.path.join(REPO, new_dir) if new_dir else REPO)
    if rel == '.':
        rel = './' if raw_path.endswith('/') else '.'
    if raw_path.startswith('./') and not rel.startswith('../') and not rel.startswith('./') and rel != '.':
        rel = './' + rel
    if raw_path.endswith('/') and not rel.endswith('/'):
        rel += '/'
    return rel


# ---------------------------------------------------------------- python path expressions
PY_BASE = r'(?:pathlib\.)?Path\(\s*__file__\s*\)(?:\.resolve\(\))?'
PY_CHAIN = r'(?:\.parent(?![s\w])|\.parents\[\d+\])'
PY_JOIN = r'''(?:\s*/\s*(?:"[^"\n]+"|'[^'\n]+'))'''
PY_EXPR = re.compile(r'(?P<expr>(?P<head>' + PY_BASE + r'|\b[A-Za-z_]\w*)(?P<chain>(?:' + PY_CHAIN + r')*)(?P<joins>(?:' + PY_JOIN + r')*))')


def py_walk(cur, chain, joins):
    for m in re.finditer(r'\.parent(?![s\w])|\.parents\[(\d+)\]', chain):
        n = 1 if m.group(1) is None else int(m.group(1)) + 1
        for _ in range(n):
            cur = os.path.dirname(cur)
    for m in re.finditer(r'''/\s*(?:"([^"\n]+)"|'([^'\n]+)')''', joins):
        cur = os.path.normpath(os.path.join(cur, m.group(1) or m.group(2)))
    return cur


def py_chain(ups):
    return '' if ups == 0 else '.parent' if ups == 1 else f'.parents[{ups - 1}]'


def plan_python(f, text, new_file):
    """Edits for Path(__file__)… expressions whose target moved relative to the script."""
    edits, manual = [], []
    file_old, file_new = os.path.join(REPO, f), os.path.join(REPO, new_file)
    env_old, env_new = {}, {}
    for m in PY_EXPR.finditer(text):
        head, chain, joins = m.group('head'), m.group('chain'), m.group('joins')
        is_file = '__file__' in head
        if not is_file and head not in env_old:
            continue
        if not chain and not joins:
            continue
        line_start = text.rfind('\n', 0, m.start()) + 1
        assign = re.match(r'^\s*([A-Za-z_]\w*)\s*=\s*$', text[line_start:m.start()])
        base_old = file_old if is_file else env_old[head]
        base_new = file_new if is_file else env_new[head]
        o = py_walk(base_old, chain, joins)
        rel_o = os.path.relpath(o, REPO)
        if rel_o.startswith('..'):
            if assign:
                env_old[assign.group(1)] = o
                env_new[assign.group(1)] = py_walk(base_new, chain, joins)
            continue
        want = map_path('' if rel_o == '.' else rel_o)
        if want is None:
            manual.append([f, m.group('expr'), f'python path to split directory {rel_o}'])
            continue
        want_abs = os.path.normpath(os.path.join(REPO, want)) if want else REPO
        n = py_walk(base_new, chain, joins)
        if n != want_abs:
            common = os.path.commonpath([base_new, want_abs])
            ups = len(os.path.relpath(base_new, common).split(os.sep)) if base_new != common else 0
            rest = os.path.relpath(want_abs, common)
            q = '"' if '"' in joins and "'" not in joins else "'"
            new_tail = py_chain(ups) + ('' if rest == '.' else f' / {q}{rest}{q}')
            old_tail = chain + joins
            s = m.start('chain')
            edits.append((s, m.end('joins'), old_tail, new_tail, 'pyexpr', rel_o, want))
        if assign:
            env_old[assign.group(1)] = o
            env_new[assign.group(1)] = want_abs
    return edits, manual


# ---------------------------------------------------------------- planning
def plan_file(tree, f):
    cat = category(f)
    ext = os.path.splitext(f)[1].lower()
    res = {'edits': [], 'manual': [], 'live': [], 'skipped': Counter()}
    if cat == 'other' and ext != '.txt':
        return res
    full = os.path.join(REPO, f)
    try:
        if os.path.getsize(full) > 8_000_000:
            res['skipped']['big'] += 1
            return res
        text = open(full, 'rb').read().decode('utf-8')
    except (OSError, UnicodeDecodeError):
        res['skipped']['undecodable'] += 1
        return res
    old_dir = os.path.dirname(f)
    new_file = map_path(f)
    new_dir = os.path.dirname(new_file)
    moved_base = map_path(old_dir) if old_dir else ''
    link_only = f in LINK_ONLY
    writable = cat in ('code', 'doc', 'script', 'data')
    for (s, e, raw, kind) in dedupe(candidates(f, text, cat)):
        if link_only and kind != 'link':
            continue
        path, suffix = split_suffix(raw)
        if kind == 'root':
            path, tail = strip_trailing(path)
            suffix = suffix if suffix else tail
            bare = path.rstrip('/')
            if bare in SPLIT:
                res['manual'].append([f, raw, 'split directory'])
                continue
            target = longest_existing(tree, bare)
            if not target:
                continue
            rest = bare[len(target):]
            new_target = map_path(target)
            if new_target is None:
                res['manual'].append([f, raw, 'split directory'])
                continue
            res['live'].append([f, kind, raw, target, new_target])
            if new_target == target:
                continue
            if not writable or cat == 'evidence':
                res['skipped'][f'root-in-{cat}'] += 1
                continue
            new = new_target + rest + ('/' if path.endswith('/') and not (new_target + rest).endswith('/') else '') + suffix
            res['edits'].append((s, e, raw, new, kind, target, new_target))
            continue
        if kind == 'prose' and '/' not in path.rstrip('/'):
            continue
        p2, tail = strip_trailing(path) if kind in ('dotrel', 'prose') else (path, '')
        target = resolve_rel(tree, old_dir, p2)
        if target is None:
            continue
        new_target = map_path(target)
        if new_target is None:
            res['manual'].append([f, raw, 'relative ref to split directory'])
            continue
        res['live'].append([f, kind, raw, target, new_target])
        same_from_file = os.path.normpath(os.path.join(new_dir, unquote(p2))) == os.path.normpath(new_target or '.')
        if kind == 'prose':
            same_from_base = moved_base is not None and os.path.normpath(os.path.join(moved_base, unquote(p2))) == os.path.normpath(new_target or '.')
            if same_from_file or same_from_base:
                continue
            new = new_target + ('/' if p2.endswith('/') else '') + tail + suffix
        else:
            if same_from_file:
                continue
            new = relpath_style(p2, new_target, new_dir) + tail + suffix
        if not writable or cat == 'evidence':
            res['skipped'][f'rel-in-{cat}'] += 1
            continue
        if cat == 'script':
            res['manual'].append([f, raw, 'relative path in script'])
            continue
        if kind == 'link' and ' ' in new and text[s - 1:s] != '<':
            new = new.replace(' ', '%20')
        res['edits'].append((s, e, raw, new, kind, target, new_target))
    if ext == '.py' and cat == 'script':
        pe, pm = plan_python(f, text, new_file)
        taken = [(a, b) for a, b, *_ in res['edits']]
        for ed in pe:
            if any(not (ed[1] <= a or ed[0] >= b) for a, b in taken):
                res['manual'].append([f, ed[2], 'python edit overlaps another edit'])
            else:
                res['edits'].append(ed)
        res['manual'].extend(pm)
    return res


def do_plan():
    tree = Tree()
    edits, manual, live, skipped = {}, [], [], Counter()
    for f in tree.all:
        r = plan_file(tree, f)
        if r['edits']:
            edits[f] = sorted(r['edits'])
        manual += r['manual']
        live += r['live']
        skipped += r['skipped']
    moves = {f: map_path(f) for f in tree.all if map_path(f) != f}
    targets = Counter(moves.values())
    collisions = [n for n, c in targets.items() if c > 1] + [n for n in moves.values() if n in tree.set and n not in moves]
    report = {
        'rules': RULES, 'files_total': len(tree.all), 'files_moving': len(moves), 'collisions': collisions,
        'edit_files': len(edits), 'edit_count': sum(len(v) for v in edits.values()),
        'edits_by_kind': Counter(e[4] for v in edits.values() for e in v),
        'edits_by_category': Counter(category(f) for f in edits),
        'skipped': skipped, 'manual': manual, 'moves': moves, 'edits': edits, 'live': live,
    }
    json.dump(report, open(PLAN, 'w'), indent=1, ensure_ascii=False, default=dict)
    print(json.dumps({k: report[k] for k in ('files_total', 'files_moving', 'edit_files', 'edit_count', 'edits_by_kind', 'edits_by_category', 'skipped')}, default=dict))
    print('collisions', len(collisions), collisions[:5])
    print('manual', len(manual))


# ---------------------------------------------------------------- apply
def do_apply():
    plan = json.load(open(PLAN))
    status = subprocess.run(['git', '-C', REPO, 'status', '--porcelain'], capture_output=True, text=True).stdout
    if status.strip():
        sys.exit('working tree not clean: refusing to apply')
    ledger = {'date': '2026-10-23', 'rules': plan['rules'], 'files': []}
    new_contents = {}
    for f, eds in plan['edits'].items():
        data = open(os.path.join(REPO, f), 'rb').read()
        text = data.decode('utf-8')
        out, pos, reps = [], 0, []
        for s, e, old, new, kind, t, nt in sorted(eds):
            if text[s:e] != old:
                sys.exit(f'span mismatch in {f} at {s}: {text[s:e]!r} != {old!r}')
            out.append(text[pos:s]); out.append(new); pos = e
            reps.append({'offset': s, 'old': old, 'new': new, 'kind': kind})
        out.append(text[pos:])
        new_text = ''.join(out)
        new_bytes = new_text.encode('utf-8')
        ledger['files'].append({'old_path': f, 'new_path': plan['moves'].get(f, f), 'sha256_before': sha(data),
                                'sha256_after': sha(new_bytes), 'replacements': reps})
        new_contents[f] = new_bytes
    # moves (same filesystem: rename), then rewritten contents
    for old, new in sorted(plan['moves'].items()):
        src, dst = os.path.join(REPO, old), os.path.join(REPO, new)
        if os.path.exists(dst):
            sys.exit(f'destination exists: {new}')
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        os.rename(src, dst)
    for old, data in new_contents.items():
        with open(os.path.join(REPO, plan['moves'].get(old, old)), 'wb') as h:
            h.write(data)
    # remove now-empty old directories (bottom-up)
    for root, ds, fs in sorted(os.walk(REPO), key=lambda x: -x[0].count(os.sep)):
        if '/.git' in root or root == REPO:
            continue
        if not os.listdir(root):
            os.rmdir(root)
    json.dump(ledger, open(LEDGER, 'w'), indent=1, ensure_ascii=False)
    print(json.dumps({'moved': len(plan['moves']), 'rewritten': len(new_contents)}))


# ---------------------------------------------------------------- verify
def do_verify():
    plan = json.load(open(PLAN))
    ledger = json.load(open(LEDGER))
    tree = Tree()
    problems = Counter()
    examples = defaultdict(list)
    # 1. every moved file exists at its destination, none left behind
    for old, new in plan['moves'].items():
        if not tree.exists(new):
            problems['missing-destination'] += 1; examples['missing-destination'].append(new)
        if os.path.exists(os.path.join(REPO, old)) and old not in plan['moves'].values():
            problems['left-behind'] += 1; examples['left-behind'].append(old)
    # 2. rewritten files: bytes match the ledger, and the ledger rebuilds the previous bytes exactly
    for row in ledger['files']:
        data = open(os.path.join(REPO, row['new_path']), 'rb').read()
        if sha(data) != row['sha256_after']:
            problems['ledger-after-mismatch'] += 1; examples['ledger-after-mismatch'].append(row['new_path'])
            continue
        text = data.decode('utf-8')
        delta, rebuilt, pos = 0, [], 0
        for rep in sorted(row['replacements'], key=lambda r: r['offset']):
            s = rep['offset'] + delta
            assert text[s:s + len(rep['new'])] == rep['new'], (row['new_path'], rep)
            rebuilt.append(text[pos:s]); rebuilt.append(rep['old']); pos = s + len(rep['new'])
            delta += len(rep['new']) - len(rep['old'])
        rebuilt.append(text[pos:])
        if sha(''.join(rebuilt).encode('utf-8')) != row['sha256_before']:
            problems['ledger-rebuild-mismatch'] += 1; examples['ledger-rebuild-mismatch'].append(row['new_path'])
    # 3. every live reference of a writable file still lands on the mapped target
    rewritten = {row['old_path']: row for row in ledger['files']}
    by_file = defaultdict(list)
    for f, kind, raw, t, nt in plan['live']:
        by_file[f].append((kind, raw, t, nt))
    checked = 0
    for f, refs in by_file.items():
        cat = category(f)
        if cat not in ('code', 'doc', 'script', 'data') or f in LINK_ONLY and False:
            continue
        nf = plan['moves'].get(f, f)
        reps = {}
        if f in rewritten:
            for rep in rewritten[f]['replacements']:
                reps.setdefault(rep['old'], set()).add(rep['new'])
        for kind, raw, t, nt in refs:
            if f in LINK_ONLY and kind != 'link':
                continue
            if cat == 'evidence':
                continue
            candidates_ = reps.get(raw, set()) | ({raw} if raw not in reps else set())
            ok = False
            for c in candidates_:
                p, _ = split_suffix(c)
                if kind == 'root':
                    p, _ = strip_trailing(p)
                    pn = os.path.normpath(p.rstrip('/'))
                    if tree.exists(nt) and (pn == nt or pn.startswith(nt + '/')):
                        ok = True
                elif kind == 'prose':
                    p2, _ = strip_trailing(p)
                    base = os.path.dirname(nf)
                    mb = map_path(os.path.dirname(f)) or ''
                    if any(os.path.normpath(os.path.join(b, unquote(p2))) == os.path.normpath(nt or '.') for b in (base, mb, '')):
                        ok = True
                else:
                    p2 = strip_trailing(p)[0] if kind == 'dotrel' else p
                    tgt = os.path.normpath(os.path.join(os.path.dirname(nf), unquote(p2)))
                    if tgt == os.path.normpath(nt or '.'):
                        ok = True
            checked += 1
            if not ok:
                problems[f'unresolved-{kind}-{cat}'] += 1
                if len(examples[f'unresolved-{kind}-{cat}']) < 40:
                    examples[f'unresolved-{kind}-{cat}'].append([nf, raw, nt, sorted(candidates_)])
    print(json.dumps({'checked_refs': checked, 'problems': problems}, indent=1))
    json.dump(examples, open(PLAN + '.verify.json', 'w'), indent=1, ensure_ascii=False)


if __name__ == '__main__':
    {'plan': do_plan, 'apply': do_apply, 'verify': do_verify}[MODE]()
