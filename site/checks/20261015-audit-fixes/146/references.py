"""Read-only HTTP/source and reference check for the audit-fixes-146 state (15 October 2026).

Walks the local references of both entries, confirms that every cached URL
serves exactly the local bytes, and that the expected cache identifiers of
this state are the ones loaded. Writes only its evidence file.
"""
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
# Cache identifiers of the state under verification (controller 144 and its dependencies).
expected={'index.html':'welcome.mjs?v=audit-fixes-146','content-preview.html':'content-preview.mjs?v=113'}
expected_uses={'entrance.mjs?v=audit-fixes-15','entrance.css?v=audit-fixes-24','globe-framing.css?v=recentered-15','comments.mjs?v=17','comments.css?v=9','project-ui.mjs?v=41','journal-ui.mjs?v=40','dock-navigation.css?v=world-icon-8','account-menu.mjs?v=5','content-controls.mjs?v=17'}
uses={r['url'] for r in refs}
cache_missing=sorted(u for u in expected_uses if u not in {u.split('/')[-1] for u in uses})
entry_ok={name:expected[name] in (folder/name).read_text() for name in expected}
urls=['index.html','content-preview.html','welcome.mjs?v=audit-fixes-146','content-preview.mjs?v=113','entrance.mjs?v=audit-fixes-15','entrance.css?v=audit-fixes-24','globe-framing.css?v=recentered-15','comments.mjs?v=17','comments.css?v=9','project-ui.mjs?v=41','journal-ui.mjs?v=40','dock-navigation.css?v=world-icon-8','account-menu.mjs?v=5','content-controls.mjs?v=17','content-controls.css?v=14','welcome-panels.html','welcome-panels.mjs']
http=[]
for value in urls:
 with urlopen('http://127.0.0.1:8765/site/'+value) as response:data=response.read();status=response.status
 path=folder/urlsplit(value).path;identical=data==path.read_bytes()
 http.append({'url':value,'status':status,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'identical':identical})
proof={'date':'2026-10-14','scope':'Read-only HTTP/source and cache check for the audit-fixes-146 state; writes only this evidence file.','filesVisited':len(seen),'referenceCount':len(refs),'missing':missing,'entryCaches':entry_ok,'expectedCacheUses':sorted(expected_uses),'cacheUsesMissing':cache_missing,'http':http,'httpAllIdentical':all(h['identical'] and h['status']==200 for h in http),'references':refs}
(folder/'checks/20261015-audit-fixes/146/references.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
assert not missing,missing;assert all(entry_ok.values()),entry_ok;assert not cache_missing,cache_missing;assert proof['httpAllIdentical'],http
print('PASS',len(seen),'files',len(refs),'references',len(http),'HTTP200 matching sources; caches',sorted(expected_uses))
