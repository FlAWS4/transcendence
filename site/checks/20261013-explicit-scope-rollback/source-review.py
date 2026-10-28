"""Compare final rollback sources with the preserved 139 source bytes.

Read-only for runtime sources. The proof permits cache version changes, the
declared copy removals, and the exact technical removal of Explorer zoom UI.
"""
from pathlib import Path
import difflib, hashlib, json, re

root = Path(__file__).resolve().parents[2]
repo = root.parent
out = Path(__file__).resolve().parent
archive = root.parent / 'archives/site-versions/pre-action-palette-and-no-zoom-20261013'
manifest = json.loads((archive/'snapshot-manifest.json').read_text())
copy = json.loads((out/'copy-changes.json').read_text())
canonical = lambda text: re.sub(r'(\?v=)[A-Za-z0-9_.-]+', r'\1CACHE', text)
sha = lambda data: hashlib.sha256(data).hexdigest()

zoom_changes = [
 (" document.querySelector('.globe-footer').inert=section!=='explore';\n", ''),
 ("const dataControls = ['scope-picker','scope-world','scope-country','reset','zoom-in','zoom-out'];", "const dataControls = ['scope-picker','scope-world','scope-country','reset'];"),
 (" onRestore(view){if(view)applyGlobeView(view);updateScope();updateCampusStatus();}", " onRestore(){updateScope();updateCampusStatus();}"),
 ("byId('zoom-in').addEventListener('click',()=>globe?.zoomBy(1.25));\n", ''),
 ("byId('zoom-out').addEventListener('click',()=>globe?.zoomBy(.8));\n", ''),
 ("'zoom-in':'zoomIn','zoom-out':'zoomOut',", ''),
 ("dataControls.filter(id=>!id.startsWith('zoom-')).forEach", 'dataControls.forEach'),
 ("function applyGlobeView({canZoomIn=false,canZoomOut=false}){\n byId('zoom-in').disabled=!canZoomIn;byId('zoom-out').disabled=!canZoomOut;\n}\n", ''),
 ("onViewChange(view){if(campusMap.ownsMap)campusMap.updateView(view);else{applyGlobeView(view);dockNavigation.sync();}}", "onViewChange(view){if(campusMap.ownsMap)campusMap.updateView(view);else dockNavigation.sync();}"),
 ("  applyGlobeView({});updateScope();", '  updateScope();'),
]
rows = []
diffs = []
copy_applied = []
old_by_name = {}
expected_by_name = {}

for entry in manifest['files']:
    source = repo/entry['source']
    historical = archive/entry.get('original',entry['runtime'])
    old = historical.read_bytes()
    current = source.read_bytes()
    assert sha(old) == entry['sourceSha256'], str(historical)
    name = source.name
    row = {'source':entry['source'],'historical':str(historical.relative_to(repo)),
           'source139Sha256':sha(old),'source141Sha256':sha(current),
           'exact139':old==current,'expectedDeltaOnly':old==current}
    if source.suffix in ['.css','.js','.mjs','.html','.json']:
        original = old.decode('utf-8')
        actual = current.decode('utf-8')
        old_by_name[name] = original
        expected = original
        for change in copy:
            if change['file'] != name:
                continue
            count = change['occurrences']
            assert expected.count(change['before']) >= count, change
            if change.get('scope') == 'Only the two empty-content messages; detailNote is preserved.':
                scopes = ['لم يُضف محتوى توضيحي لهذا النطاق من الشبكة بعد.', 'لا يطابق أي محتوى توضيحي هذا الجمع من المرشحات.']
                assert count == len(scopes),change
                for text in scopes:
                    assert expected.count(text) == 1,text
                    expected = expected.replace(text,text.replace(change['before'],change['after']),1)
            else:
                assert not change.get('scope'),change
                expected = expected.replace(change['before'],change['after'],count)
            copy_applied.append(change)
        if name in ['index.html','content-preview.html']:
            block = re.search(r'      <div class="globe-footer">\n        <div class="globe-controls">\n.*?\n        </div>\n      </div>\n',expected,re.S)
            assert block and 'id="zoom-in"' in block[0] and 'id="zoom-out"' in block[0],name
            die = re.search(r'<button[^\n]+id="random-campus"[^\n]+</button>',block[0])
            assert die,name
            expected = expected.replace(block[0],'      '+die[0]+'\n',1)
        if name == 'welcome.mjs':
            for before,after in zoom_changes:
                assert expected.count(before) == 1,before
                expected = expected.replace(before,after,1)
        expected_by_name[name] = expected
        row['canonical139'] = canonical(original)==canonical(actual)
        row['expectedDeltaOnly'] = canonical(expected)==canonical(actual)
        if not row['expectedDeltaOnly']:
            diffs.extend(difflib.unified_diff(canonical(expected).splitlines(True),canonical(actual).splitlines(True),fromfile='expected/'+name,tofile='actual/'+name))
    rows.append(row)

critical = ['entrance.css','dock-navigation.css','entrance.mjs','campus-map-dialog.mjs','campus-map-dialog.css','integrated-globe.mjs','project-trial.mjs']
checks = {
 'everyHistoricalSourceHashVerified':True,
 'all137RuntimeFilesMatch139PlusAllowedDelta':all(row['expectedDeltaOnly'] for row in rows),
 'criticalFilesExactly139':{name:(root/name).read_text()==old_by_name[name] for name in critical},
 'allStylesheetsExactly139':all(row['exact139'] for row in rows if row['source'].endswith('.css')),
 'noAddedAuthGridWrapper':all('account-access-actions' not in (root/name).read_text() for name in ['welcome.mjs','entrance.mjs','entrance.css']),
 'accountDialogRendering139ApartFromDeclaredCopy':canonical((root/'welcome.mjs').read_text().split('function requestAccountAccess(')[1].split('accountMenu=mountAccountMenu')[0])==canonical(expected_by_name['welcome.mjs'].split('function requestAccountAccess(')[1].split('accountMenu=mountAccountMenu')[0]),
 'explorerZoomControlsAbsent':all('id="zoom-in"' not in (root/name).read_text() and 'id="zoom-out"' not in (root/name).read_text() and 'class="globe-footer"' not in (root/name).read_text() for name in ['index.html','content-preview.html']),
}
passed=all(value if isinstance(value,bool) else all(value.values()) for value in checks.values())
report={'passed':passed,'baseline':'top-world-control-139','comparison':'Original source bytes; only ?v= cache values canonicalized.',
        'runtimeFileCount':len(rows),'exact139Count':sum(row['exact139'] for row in rows),
        'declaredCopyChangesVerified':len(copy_applied),'zoomTechnicalReplacements':len(zoom_changes),
        'checks':checks,'files':rows,
        'limits':'Source review only. No new browser interaction checks; declared copy mapping reviewed separately by the parent agent.'}
(out/'source-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(out/'source-review-unexpected.diff').write_text(''.join(diffs))
print(json.dumps({key:report[key] for key in ['passed','runtimeFileCount','exact139Count','declaredCopyChangesVerified','checks']},ensure_ascii=False,indent=2))
assert passed, 'See source-review.json and source-review-unexpected.diff'
