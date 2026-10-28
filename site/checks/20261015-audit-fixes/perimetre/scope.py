#!/usr/bin/env python3
"""Read-only scope check of the 15 October audit fixes (state audit-fixes-145).

Compares every runtime source of the archived 144 state (snapshot manifest)
and the two archived test originals with the active files, classifies every
diff hunk (D1..D5, cache identifier, test) and lists anything else as a scope
violation. Also lists files changed today outside the manifest and confirms
the files that must stay unchanged. Writes only scope.json next to itself.
"""
from pathlib import Path
import hashlib, json, re, subprocess, os, datetime

HERE = Path(__file__).resolve().parent
REPO = Path('/home/le-rif/Bureau/Transcendence')
FOLDER = REPO / 'site'
ARCH = FOLDER / 'archive/pre-codex-audit-fixes-20261015'
PROVIDED_DIFF = Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/audit-fixes.diff')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def gnu_diff(old_path, new_path, name):
    out = subprocess.run(['diff', '-U0', '--label', '144/' + name, '--label', '145/' + name, str(old_path), str(new_path)],
                         capture_output=True, text=True)
    assert out.returncode in (0, 1), out.stderr
    return out.stdout


def hunks(diff_text):
    result, current = [], None
    for line in diff_text.splitlines():
        if line.startswith('@@'):
            current = {'header': line, 'removed': [], 'added': []}
            result.append(current)
        elif current is not None and line.startswith('-') and not line.startswith('---'):
            current['removed'].append(line[1:])
        elif current is not None and line.startswith('+') and not line.startswith('+++'):
            current['added'].append(line[1:])
    return result


VERSION = re.compile(r'\?v=[^"\')\s]*')


def only_cache(removed, added):
    """Same lines once every ?v= identifier is removed, and at least one identifier changed."""
    return (len(removed) == len(added) and removed != added
            and [VERSION.sub('?v=', line) for line in removed] == [VERSION.sub('?v=', line) for line in added])


def comments_only(lines):
    return all(line.strip().startswith(('//', '/*', '*')) or line.strip().endswith('*/') for line in lines)


def classify(name, removed, added):
    code_added = [line for line in added if not comments_only([line])]
    if only_cache(removed, added):
        return 'identifiant de cache'
    if name == 'entrance.mjs':
        if not removed and added == ["const MODIFIER_KEYS=['Alt','AltGraph','CapsLock','Control','Meta','OS','Shift'];"]:
            return 'D1'
        if len(removed) == 1 and removed[0].startswith('export function mountEntrance(') and len(code_added) == 1 \
                and code_added[0].replace('cycleLabels=false,', '', 1) == removed[0] and comments_only(added[:-1]):
            return 'D5'
        if removed == [' const interactionEvents=new AbortController(),labelMotions=new Map();'] \
                and added == [' const interactionEvents=cycleLabels||themeToggle?new AbortController():null,labelMotions=new Map();']:
            return 'D5'
        if removed == ['  return choosing()&&!document.hidden&&!dialog?.open&&!accessHovered&&!access.contains(active)&&!(active===themeToggle&&keyboardFocus);'] \
                and code_added == ['  return cycleLabels&&choosing()&&!document.hidden&&!dialog?.open&&!accessHovered&&!((access.contains(active)||active===themeToggle)&&keyboardFocus);'] \
                and comments_only(added[:-1]):
            return 'D1+D5'
        if removed == ['   if(siteLocale!==getLocale()){siteLocale=getLocale();displayLocale=siteLocale;}', '   refreshLabels();'] \
                and added == ['   if(cycleLabels){', '    if(siteLocale!==getLocale()){siteLocale=getLocale();displayLocale=siteLocale;}', '    refreshLabels();',
                              "   }else for(const [id,key] of [['entry-login','login'],['entry-guest','guest']]){",
                              "    const button=document.getElementById(id);button.textContent=t(key);button.setAttribute('lang',getLocale());", '   }']:
            return 'D5'
        if len(removed) == 1 and len(added) == 1 and removed[0].replace("prepareLabel(login,'login');prepareLabel(guest,'guest');", "if(cycleLabels){prepareLabel(login,'login');prepareLabel(guest,'guest');}", 1) == added[0]:
            return 'D5'
        if removed == ["  document.addEventListener('keydown',()=>{keyboardFocus=true;syncLanguageCycle(true);},{...options,capture:true});"] \
                and code_added == ["  document.addEventListener('keydown',event=>{",
                                   '   if(event.ctrlKey||event.metaKey||event.altKey||MODIFIER_KEYS.includes(event.key))return;',
                                   '   keyboardFocus=true;syncLanguageCycle(true);', '  },{...options,capture:true});']:
            return 'D1'
    if name == 'entrance.css':
        if removed == ['/* Arrival has its own background theme control; the account returns after entry. */', 'body:not([data-entry=welcome]) .account-switcher{display:none}'] \
                and added[-1] == 'body:not([data-entry=welcome]):not([data-entry=error]) .account-switcher{display:none}' and comments_only(added[:-1]):
            return 'D4'
        if not removed and added[-1] == ':root[data-theme=dark] [data-account-action=signup]{background:var(--h42-ink)}' and comments_only(added[:-1]):
            return 'D3'
    if name == 'comments.mjs':
        if removed == ["  const dock=[doc.querySelector('.dock-search-toggle'),doc.getElementById('main-nav')].map(visibleRect).filter(Boolean);"] \
                and code_added == ["  const dock=[doc.querySelector('.dock-search-toggle'),doc.getElementById('main-nav'),menu.sort?doc.getElementById('back-to-top'):null].map(visibleRect).filter(Boolean);"] \
                and comments_only(added[:-1]):
            return 'D2'
        if len(removed) == 1 and len(code_added) == 1 and removed[0].replace('down=menu.sort||', 'down=', 1) == code_added[0] and comments_only(added[:-1]):
            return 'D2'
    if name == 'welcome.mjs':
        if len(removed) == 1 and len(added) == 1 and added[0].replace('cycleLabels:true,', '', 1) == removed[0] \
                and removed[0].lstrip().startswith('entrance=mountEntrance('):
            return 'D5'
    return 'HORS PÉRIMÈTRE'


manifest = json.loads((ARCH / 'snapshot-manifest.json').read_text())
tests_manifest = json.loads((ARCH / 'test-source-manifest.json').read_text())
rows, changed, archive_inconsistent = [], [], []
for record in manifest['files']:
    archived = ARCH / record.get('original', record['runtime'])
    archived_bytes = archived.read_bytes()
    active = REPO / record['source']
    active_bytes = active.read_bytes() if active.is_file() else None
    row = {
        'source': record['source'],
        'archiveBytesFrom': 'originals/' if 'original' in record else 'baseline/',
        'archiveMatchesSourceSha': sha(archived_bytes) == record['sourceSha256'],
        'activeExists': active_bytes is not None,
        'activeSha256': sha(active_bytes) if active_bytes is not None else None,
        'identicalTo144': active_bytes is not None and sha(active_bytes) == record['sourceSha256'],
    }
    if 'original' not in record:
        row['baselineUnadapted'] = record['runtimeSha256'] == record['sourceSha256']
    if not row['archiveMatchesSourceSha']:
        archive_inconsistent.append(record['source'])
    rows.append(row)
    if not row['identicalTo144']:
        name = record['source'].removeprefix('site/')
        text = gnu_diff(archived, active, name)
        hs = hunks(text)
        for h in hs:
            h['classification'] = classify(name, h['removed'], h['added'])
        changed.append({'file': name, 'archiveBytes': str(archived.relative_to(FOLDER)), 'diff': text, 'hunks': hs})

# The diff given to the verifiers must equal the computed one (no omitted hunk).
provided = PROVIDED_DIFF.read_text() if PROVIDED_DIFF.is_file() else ''
computed = ''.join(entry['diff'] for entry in sorted(changed, key=lambda e: e['file']))
provided_blocks = {m.group(1): m.group(0) for m in re.finditer(r'--- 144/(\S+)\n.*?(?=^--- 144/|\Z)', provided, re.S | re.M)}

# Tests changed by the fix.
test_rows = []
TEST_NAME = re.compile(r"^test\('((?:[^'\\]|\\.)*)'", re.M)


def test_bodies(text):
    marks = [(m.start(), m.group(1)) for m in TEST_NAME.finditer(text)]
    bodies = {}
    for index, (start, name) in enumerate(marks):
        end = marks[index + 1][0] if index + 1 < len(marks) else len(text)
        bodies[name] = text[start:end].rstrip()
    return bodies, text[:marks[0][0]] if marks else text


for record in tests_manifest['files']:
    original = ARCH / record['original']
    active = REPO / record['source']
    old_text, new_text = original.read_text(), active.read_text()
    old_bodies, old_head = test_bodies(old_text)
    new_bodies, new_head = test_bodies(new_text)
    name = record['source'].removeprefix('site/')
    text = gnu_diff(original, active, name)
    test_rows.append({
        'file': name,
        'originalMatchesManifest': sha(original.read_bytes()) == record['sha256'] and len(original.read_bytes()) == record['bytes'],
        'activeSha256': sha(active.read_bytes()),
        'changed': old_text != new_text,
        'testsBefore': len(old_bodies), 'testsAfter': len(new_bodies),
        'added': [n for n in new_bodies if n not in old_bodies],
        'removed': [n for n in old_bodies if n not in new_bodies],
        'modifiedExisting': [n for n in old_bodies if n in new_bodies and old_bodies[n] != new_bodies[n]],
        'harnessChanged': old_head != new_head,
        'hunks': [{**h, 'classification': 'test'} for h in hunks(text)],
        'diff': text,
    })

# Files changed today in the folder (outside checks/ and archive/).
find = subprocess.run(['find', str(FOLDER), '-newermt', '2026-10-15 11:00', '-type', 'f', '-not', '-path', '*/checks/*', '-not', '-path', '*/archive/*'],
                      capture_output=True, text=True).stdout.split()
manifest_sources = {record['source'] for record in manifest['files']}
test_sources = {record['source'] for record in tests_manifest['files']}
today = []
for path in sorted(find):
    relative = str(Path(path).relative_to(REPO))
    today.append({'file': relative, 'mtime': datetime.datetime.fromtimestamp(os.stat(path).st_mtime).isoformat(),
                  'inRuntimeManifest': relative in manifest_sources, 'inTestManifest': relative in test_sources})
# Same check over the whole repository, to catch shared dependencies or docs touched today.
repo_today = subprocess.run(['find', str(REPO), '-newermt', '2026-10-15 11:00', '-type', 'f', '-not', '-path', '*/.git/*',
                             '-not', '-path', str(FOLDER / 'checks') + '/*', '-not', '-path', str(FOLDER / 'archive') + '/*'],
                            capture_output=True, text=True).stdout.split()
repo_today = sorted(str(Path(p).relative_to(REPO)) for p in repo_today)

# git status of the folder.
status = subprocess.run(['git', '-C', str(REPO), 'status', '--short', '--', 'site'], capture_output=True, text=True).stdout.splitlines()
git_rows = []
by_source = {row['source']: row for row in rows}
for line in status:
    code, path = line[:2], line[3:]
    if code.strip() != 'M':
        continue
    full = REPO / path
    git_rows.append({'file': path, 'inRuntimeManifest': path in by_source, 'identicalTo144': by_source.get(path, {}).get('identicalTo144'),
                     'inTestManifest': path in test_sources,
                     'mtime': datetime.datetime.fromtimestamp(full.stat().st_mtime).isoformat(),
                     'changedToday': full.stat().st_mtime >= datetime.datetime(2026, 10, 15, 11, 0).timestamp()})

# Files that must stay unchanged.
must_keep = ['site/' + n for n in [
    'account-menu.css', 'account-menu.mjs', 'dock-navigation.css', 'dock-navigation.mjs', 'globe-framing.css',
    'back-to-top.css', 'back-to-top.mjs', 'content-controls.css', 'content-controls.mjs', 'comments.css']] + [
    'shared/brand/tokens.css', 'studies/decryption-examples/scanner-return-random.mjs',
    'studies/decryption-examples/scanner-return-together.mjs', 'studies/decryption-examples/shared.mjs',
    'archives/early-prototypes/decryption/horizon-decryption-engine.mjs']
keep_rows = [{'file': path, 'identicalTo144': by_source[path]['identicalTo144']} for path in must_keep]
for path in ['archives/early-prototypes/welcome-panels/welcome-panels.html', 'archives/early-prototypes/welcome-panels/welcome-panels.mjs']:
    head = subprocess.run(['git', '-C', str(REPO), 'rev-parse', 'HEAD:' + path], capture_output=True, text=True).stdout.strip()
    work = subprocess.run(['git', '-C', str(REPO), 'hash-object', path], capture_output=True, text=True).stdout.strip()
    full = REPO / path
    older = FOLDER / 'archive/pre-account-preference-panels-20261013/runtime-originals' / Path(path).name
    keep_rows.append({'file': path, 'inRuntimeManifest': path in by_source, 'gitHeadBlob': head, 'workingBlob': work,
                      'identicalToGitHead': bool(head) and head == work,
                      'identicalToArchive20261013': older.is_file() and older.read_bytes() == full.read_bytes(),
                      'mtime': datetime.datetime.fromtimestamp(full.stat().st_mtime).isoformat()})

violations = [{'file': entry['file'], 'header': h['header']} for entry in changed for h in entry['hunks'] if h['classification'] == 'HORS PÉRIMÈTRE']
result = {
    'date': '2026-10-15',
    'scope': 'Périmètre des corrections audit-fixes-145 : comparaison octet par octet avec l’archive 144 (manifeste), classement de chaque bloc de diff, fichiers modifiés aujourd’hui, fichiers devant rester inchangés. Lecture seule ; écrit seulement ce fichier.',
    'manifestFiles': len(rows),
    'archiveInconsistent': archive_inconsistent,
    'unchangedRuntimeFiles': sum(row['identicalTo144'] for row in rows),
    'changedRuntimeFiles': [entry['file'] for entry in changed],
    'missingActiveFiles': [row['source'] for row in rows if not row['activeExists']],
    'hunkCount': sum(len(entry['hunks']) for entry in changed),
    'classificationCounts': {label: sum(1 for entry in changed for h in entry['hunks'] if h['classification'] == label)
                             for label in sorted({h['classification'] for entry in changed for h in entry['hunks']})},
    'scopeViolations': violations,
    'computedDiffEqualsProvidedDiff': computed == provided,
    'providedDiffFiles': sorted(provided_blocks),
    'changed': [{k: v for k, v in entry.items() if k != 'diff'} for entry in changed],
    'tests': [{k: v for k, v in row.items() if k != 'diff'} for row in test_rows],
    'changedTodayInFolder': today,
    'changedTodayOutsideManifests': [row['file'] for row in today if not row['inRuntimeManifest'] and not row['inTestManifest']],
    'changedTodayInRepositoryOutsideChecksAndArchive': repo_today,
    'gitModifiedInFolder': git_rows,
    'mustStayUnchanged': keep_rows,
    'rows': rows,
}
(HERE / 'scope.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: result[k] for k in ['manifestFiles', 'archiveInconsistent', 'unchangedRuntimeFiles', 'changedRuntimeFiles', 'missingActiveFiles',
                                          'hunkCount', 'classificationCounts', 'scopeViolations', 'computedDiffEqualsProvidedDiff',
                                          'changedTodayOutsideManifests', 'changedTodayInRepositoryOutsideChecksAndArchive']}, ensure_ascii=False, indent=1))
for row in test_rows:
    print(row['file'], 'before', row['testsBefore'], 'after', row['testsAfter'], 'added', len(row['added']), 'removed', row['removed'],
          'modifiedExisting', row['modifiedExisting'], 'harnessChanged', row['harnessChanged'], 'originalOK', row['originalMatchesManifest'])
for row in keep_rows:
    print(row)
for row in git_rows:
    print('git M', row['file'], 'manifest', row['inRuntimeManifest'], 'id144', row['identicalTo144'], 'today', row['changedToday'])
