from pathlib import Path
from urllib.parse import urlsplit,unquote
from urllib.request import urlopen
import re,json,hashlib
root=Path('/home/le-rif/Bureau/Transcendence');folder=root/'site';queue=[folder/'index.html',folder/'content-preview.html'];seen=set();refs=[];missing=[]
while queue:
 p=queue.pop()
 if p in seen:continue
 seen.add(p)
 if not p.exists():missing.append(str(p.relative_to(root)));continue
 if p.suffix not in ['.html','.mjs','.css']:continue
 s=p.read_text();values=[]
 if p.suffix=='.html':values+=re.findall(r'(?:href|src)=[\"\']([^\"\']+)',s)
 elif p.suffix=='.css':values+=re.findall(r'url\([\"\']?([^\"\')]+)',s)
 else:
  values+=re.findall(r'\b(?:from|import)\s*[\"\']([^\"\']+)[\"\']',s)
  values+=re.findall(r'\bimport\(\s*[\"\']([^\"\']+)[\"\']',s)
 for value in values:
  url=urlsplit(value)
  if url.scheme or url.netloc or not url.path or '${' in value:continue
  target=(p.parent/unquote(url.path)).resolve();refs.append({'from':str(p.relative_to(root)),'url':value,'file':str(target.relative_to(root))});queue.append(target)
urls=['back-to-top.mjs?v=2','back-to-top.css?v=1','index.html','content-preview.html','content-preview.mjs?v=101','welcome.mjs?v=mobile-navigation-134','account-menu.mjs?v=1','account-menu.css?v=1','project-filter-dialog.mjs?v=3','project-filter-dialog.css?v=3','content-controls.mjs?v=15','content-preview-data.mjs?v=9','profile-data.mjs?v=11','demo-content-expanded.mjs?v=1','profile-ui.mjs?v=32','project-ui.mjs?v=36','journal-ui.mjs?v=35','content-pagination.mjs?v=2','content-pagination-ui.mjs?v=2','content-pagination.css?v=1','entrance.mjs?v=account-access-7','entrance.css?v=account-access-17']
http=[]
for value in urls:
 with urlopen('http://127.0.0.1:8765/site/'+value) as response:data=response.read();status=response.status
 path=folder/urlsplit(value).path;assert data==path.read_bytes(),value;http.append({'url':value,'status':status,'sha256':hashlib.sha256(data).hexdigest()})
proof={'date':'2026-10-13','filesVisited':len(seen),'referenceCount':len(refs),'missing':missing,'references':refs,'http':http};(folder/'checks/20261013-compact-mobile-references.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n');assert not missing,missing;print('PASS',len(seen),'files',len(refs),'references',len(http),'HTTP200 matching sources')
