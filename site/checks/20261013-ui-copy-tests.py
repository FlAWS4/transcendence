"""Targeted regression checks after neutral UI wording and Explorer zoom removal."""
from pathlib import Path
import subprocess, hashlib, json, re, concurrent.futures
folder=Path(__file__).resolve().parent.parent
names=['entrance.test.mjs','tests/account-menu.test.mjs','tests/comments.test.mjs','tests/comments-actions.test.mjs','tests/comment-mentions.test.mjs','tests/content-report.test.mjs','tests/content-preferences.test.mjs','tests/content-category-groups.test.mjs','tests/project-trial.test.mjs','tests/profile-data.test.mjs','tests/profile-sections.test.mjs','tests/project-sections.test.mjs','tests/journal-sections.test.mjs','tests/profile-social-links.test.mjs','tests/demo-content.test.mjs','tests/map-independent-filter.test.mjs','tests/reading-scope.test.mjs','tests/content-transitions.test.mjs']
sources=['welcome.mjs','entrance.mjs','account-menu.mjs','comments.mjs','content-report.mjs','content-controls.mjs','project-trial.mjs','content-preview-data.mjs','profile-ui.mjs','project-ui.mjs','journal-ui.mjs']
def digest(name):return hashlib.sha256((folder/name).read_bytes()).hexdigest()
initial={name:digest(name) for name in names+sources}
def run(name):
 result=subprocess.run(['node',str(folder/name)],capture_output=True,text=True)
 output=result.stdout+result.stderr
 counts={key:int(re.search(r'^# '+key+r' (\d+)$',output,re.M).group(1)) for key in ['tests','pass','fail'] if re.search(r'^# '+key+r' (\d+)$',output,re.M)}
 row={'file':name,'exitCode':result.returncode,**counts,'sha256':initial[name]}
 if result.returncode:row['output']=output
 return row
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(run,names))
final={name:digest(name) for name in names+sources}
proof={'date':'2026-10-13','passed':all(row['exitCode']==0 for row in results),'files':len(results),'tests':sum(row.get('tests',0) for row in results),'pass':sum(row.get('pass',0) for row in results),'fail':sum(row.get('fail',0) for row in results),'sourceChangedDuringChecks':[name for name in initial if initial[name]!=final[name]],'results':results,'sources':{name:initial[name] for name in sources}}
(folder/'checks/20261013-ui-copy-tests.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
for row in results:print(row['file'],row.get('tests'),row['exitCode'])
print(json.dumps({k:v for k,v in proof.items() if k not in ['results','sources']},ensure_ascii=False))
raise SystemExit(0 if proof['passed'] and not proof['sourceChangedDuringChecks'] else 1)
