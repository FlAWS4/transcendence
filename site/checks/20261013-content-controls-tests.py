from pathlib import Path
import subprocess,concurrent.futures,re,json,hashlib,sys
root=Path('site');files=sorted([*root.glob('*.test.mjs'),*(root/'tests').glob('*.test.mjs')])
sourcefiles=sorted([p for p in root.iterdir() if p.is_file() and p.suffix in ['.mjs','.css','.html']]+[p for p in (root/'tests').iterdir() if p.suffix=='.mjs'])
hashes=lambda:{str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sourcefiles}
before=hashes()
def run(p):
 r=subprocess.run(['node',str(p)],capture_output=True,text=True);s=r.stdout+r.stderr
 values={key:int(re.search(r'^# '+key+r' (\d+)',s,re.M).group(1)) if re.search(r'^# '+key+r' (\d+)',s,re.M) else None for key in ['tests','pass','fail','skipped','cancelled']}
 result={'file':str(p.relative_to(root)),'returncode':r.returncode,**values,'warning': 'MaxListenersExceededWarning' in s}
 if r.returncode or values['fail']!=0:
  result['output']=s;print('FAILED',p,s,flush=True)
 return result
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(run,files))
after=hashes();output={'date':'2026-10-13','runner':'each active test file executed directly with Node, four workers','node':subprocess.check_output(['node','--version'],text=True).strip(),'files':len(files),'cases':sum(x['tests'] or 0 for x in results),'passed':sum(x['pass'] or 0 for x in results),'failed':sum(x['fail'] or 0 for x in results),'sourcesBefore':before,'sourcesAfter':after,'unchanged':before==after,'results':results}
(root/'checks/20261013-content-controls-tests.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({key:output[key] for key in ['files','cases','passed','failed','unchanged']}))
sys.exit(0 if output['failed']==0 and all(x['returncode']==0 for x in results) and output['unchanged'] else 1)
