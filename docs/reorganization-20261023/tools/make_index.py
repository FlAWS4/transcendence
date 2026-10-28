import os, re, sys
R = '/home/le-rif/Bureau/Transcendence'
D = os.path.join(R, 'archives/site-versions')
rows = []
for name in sorted(os.listdir(D)):
    p = os.path.join(D, name)
    if not os.path.isdir(p):
        continue
    m = re.search(r'(\d{4})(\d{2})(\d{2})$', name)
    date = f'{m.group(1)}-{m.group(2)}-{m.group(3)}' if m else ''
    title, from_readme = None, False
    readme = os.path.join(p, 'README.md')
    if os.path.isfile(readme):
        for line in open(readme, encoding='utf-8'):
            if line.startswith('#'):
                title = line.lstrip('#').strip(); from_readme = True; break
    if not title:
        stem = re.sub(r'-?\d{8}$', '', name)
        words = stem.replace('-', ' ')
        title = ('Before: ' + words[4:]) if stem.startswith('pre-') else words
    if os.path.isdir(os.path.join(p, 'baseline')):
        kind = 'self-contained snapshot'
        entry = 'baseline/content-preview.html' if os.path.isfile(os.path.join(p, 'baseline/content-preview.html')) else 'baseline/index.html'
    elif any(f.startswith('preview') and f.endswith('.html') for f in os.listdir(p)):
        kind = 'viewer'
        entry = 'preview.html' if os.path.isfile(os.path.join(p, 'preview.html')) else sorted(f for f in os.listdir(p) if f.startswith('preview') and f.endswith('.html'))[0]
    else:
        kind = 'source copy'
        entry = 'README.md' if from_readme else ''
    rows.append((date, name, title.replace('|', '\\|'), from_readme, kind, entry))
rows.sort(key=lambda r: (r[0], r[1]))
counts = {}
for r in rows:
    counts[r[4]] = counts.get(r[4], 0) + 1
out = ['# Site versions — index', '',
       f'Every folder here is one preserved state of the active site, `site/` (named `work/visualizations/horizon-welcome/` until 23 October 2026), captured just before a change. A folder named `pre-<change>-<date>` holds the state **before** that change. {len(rows)} states, from {rows[0][0]} to {rows[-1][0]}. Cache numbers quoted in the notes (`welcome.mjs?v=…`) identify iterations, not project releases.', '',
       'Three formats exist, depending on the date of the archive:', '',
       f'- **self-contained snapshot** ({counts.get("self-contained snapshot", 0)}): a complete copy in `baseline/`, with isolated browser storage. `python3 archives/site-versions/<folder>/snapshot.py --verify` checks its hashes.',
       f'- **viewer** ({counts.get("viewer", 0)}): `preview.html` replays the archived files; it still loads the unchanged files from the current `site/` and `shared/` folders.',
       f'- **source copy** ({counts.get("source copy", 0)}): the replaced source files only. They are not standalone pages; to replay one, copy them over a copy of `site/` (the "original directory" mentioned in their notes).', '',
       'Open pages through the local server started at the repository root (`python3 -m http.server 8765 --bind 127.0.0.1`), for example `http://127.0.0.1:8765/archives/site-versions/<folder>/preview.html`. Titles come from each folder\'s README; *italic* titles are derived from the folder name because the folder has no README.', '',
       '| Date | State | Format | Open |', '| --- | --- | --- | --- |']
for date, name, title, from_readme, kind, entry in rows:
    t = title if from_readme else f'*{title}*'
    link = f'[{entry}]({name}/{entry})' if entry else f'[folder]({name}/)'
    out.append(f'| {date} | **{name}** — {t} | {kind} | {link} |')
out.append('')
open(os.path.join(D, 'INDEX.md'), 'w', encoding='utf-8').write('\n'.join(out))
print(len(rows), counts)
