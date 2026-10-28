from pathlib import Path
import json,time,base64,hashlib
p=Path(__file__).resolve().parent.parent
exec((p/'checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
c=Chrome();out=p/'checks/20261013-top-world';result={}
try:
 c.width(667,390);c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]});c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html#explore'})
 deadline=time.time()+55
 while time.time()<deadline:
  if c.js('Boolean(document.querySelector("#loading")?.hidden)'):break
  time.sleep(.2)
 result=c.js('(()=>{const p=document.querySelector("#globe-hint"),r=p.getBoundingClientRect(),f=document.querySelector("#scope-bar").getBoundingClientRect(),b=document.querySelector("#reset").getBoundingClientRect();return {loaded:document.querySelector("#loading").hidden,background:getComputedStyle(p).backgroundColor,hint:r.toJSON(),filter:f.toJSON(),button:b.toJSON(),overflow:document.documentElement.scrollWidth>innerWidth}})()')
 assert result['loaded'] and not result['overflow'];assert result['hint']['top']>=result['filter']['bottom']+9;assert result['button']['width']==44;assert result['background']!='rgba(0, 0, 0, 0)'
 (out/'landscape-final.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']));result['passed']=True
finally:
 result['source']=hashlib.sha256((p/'globe-framing.css').read_bytes()).hexdigest();(out/'landscape-final.json').write_text(json.dumps(result,indent=2)+'\n');c.close()
