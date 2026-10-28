"""Compare the real entrance canvas at identical frames, without altering its renderer."""
from pathlib import Path
import json,time,base64,hashlib
root=Path(__file__).resolve().parent.parent
exec((root/'checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=root/'checks/20261013-scanner-dark';out.mkdir(exist_ok=True)
base='http://127.0.0.1:8765/site/'
archive=root.parent / 'archives/site-versions/pre-targeted-button-colors-20261013'
c=Chrome();results=[];comparisons=[];passed=False
files=['entrance.css','entrance.mjs','index.html','content-preview.html','../decryption-examples/scanner-return-random.mjs','../decryption-examples/scanner-return-together.mjs','../decryption-examples/shared.mjs','../horizon-decryption-engine.mjs']
hashes=lambda:{name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in files}
initial=hashes()
setup=r'''
window.qaErrors=[];addEventListener('error',e=>{if(e.message)qaErrors.push(e.message)});addEventListener('unhandledrejection',e=>qaErrors.push(String(e.reason)));
const theme=new URL(location.href).searchParams.get('qaTheme')||'light';
for(const key of ['horizon-theme-preference-v1','horizon-archive-pre-targeted-button-colors-20261013-theme-preference-v1'])localStorage.setItem(key,theme);
// Queue only the entrance's named tick callback. Native layout, fonts and other
// rendering remain active. The original controller receives the same 16ms steps.
const nativeFrame=requestAnimationFrame,nativeCancel=cancelAnimationFrame;let next=-1;const frames=new Map();window.qaNow=0;
window.requestAnimationFrame=callback=>{if(callback.name!=='tick')return nativeFrame(callback);const id=next--;frames.set(id,callback);return id;};
window.cancelAnimationFrame=id=>frames.delete(id)||nativeCancel(id);
window.qaPending=()=>frames.size;
window.qaFrame=time=>{const first=frames.entries().next().value;if(!first)throw Error('No entrance frame');frames.delete(first[0]);qaNow=time;first[1](time);};
window.qaAdvance=target=>{while(qaNow<target&&frames.size)qaFrame(Math.min(target,qaNow+16));return {time:qaNow,entry:document.body.dataset.entry,phase:document.querySelector('#entrance-scene').dataset.phase};};
window.qaGeometry=[];
for(const name of ['clearRect','drawImage','fillRect','rect','clip','beginPath','save','restore']){
 const original=CanvasRenderingContext2D.prototype[name];
 CanvasRenderingContext2D.prototype[name]=function(...args){
  if(this.canvas.parentElement?.id==='entrance-scene'){
   if(name==='clearRect')qaGeometry=[];
   qaGeometry.push([name,...args.map(value=>value instanceof HTMLCanvasElement?{width:value.width,height:value.height}:value)]);
  }
  return original.apply(this,args);
 };
}
'''
snapshot=r'''(async()=>{
 const scene=document.querySelector('#entrance-scene'),canvas=scene.querySelector('canvas'),ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data,alpha=new Uint8Array(pixels.length/4),palette={};let count=0;
 for(let i=0;i<alpha.length;i++){const p=i*4;alpha[i]=pixels[p+3];if(alpha[i])count++;if(alpha[i]>=250){const key=[pixels[p],pixels[p+1],pixels[p+2]].join(',');palette[key]=(palette[key]||0)+1;}}
 const sha=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
 const css=getComputedStyle(scene),r=canvas.getBoundingClientRect();
 return {theme:document.documentElement.dataset.theme,phase:scene.dataset.phase,text:scene.dataset.renderedText,beamPosition:scene.dataset.beamPosition,resolutionOrder:scene.dataset.resolutionOrder,entry:document.body.dataset.entry,canvas:{width:canvas.width,height:canvas.height,cssWidth:r.width,cssHeight:r.height},accent:css.getPropertyValue('--h42-color-accent').trim(),ink:css.getPropertyValue('--h42-color-text').trim(),paintedPixels:count,alphaSha256:await sha(alpha),drawGeometrySha256:await sha(new TextEncoder().encode(JSON.stringify(qaGeometry))),drawOperationCount:qaGeometry.length,rgbaSha256:await sha(pixels),opaquePalette:Object.entries(palette).sort((a,b)=>b[1]-a[1]).slice(0,8),errors:qaErrors};
})()'''
def wait(expression):
 end=time.time()+25
 while time.time()<end:
  if c.js(expression):return
  time.sleep(.1)
 raise AssertionError(expression)
def click(selector):
 pos=c.js('(()=>{const r=document.querySelector('+json.dumps(selector)+').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()')
 for kind in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':kind,**pos,'button':'left','clickCount':1})
def capture(version,theme,width,label):
 value=c.js(snapshot);assert not value['errors'],value['errors'];assert value['theme']==theme
 name=f'{version}-{theme}-{width}-{label}';results.append({'case':name,'result':value})
 if version=='current' and (width==1280 or theme=='dark'):
  (out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
 print(name,value['phase'],value['opaquePalette'][:3],flush=True)
 return value
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':setup})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'no-preference'}]})
 states={}
 for width in [1280,390]:
  for theme in ['light','dark']:
   for version,entry in [('baseline','archive/pre-targeted-button-colors-20261013/baseline/index.html'),('current','index.html')]:
    c.width(width,900 if width==1280 else 844);c.call('Page.navigate',{'url':base+entry+'?qaTheme='+theme})
    wait('Boolean(window.qaPending?.()&&document.querySelector("#entry-login"))');c.js('qaFrame(0)')
    for moment,label in [(1800,'scan-down'),(2800,'scan-up')]:
     c.js('qaAdvance('+str(moment)+')');value=capture(version,theme,width,label);assert value['phase']==label;states[version,theme,width,label]=value
    c.js('qaAdvance(3650)');assert c.js('document.body.dataset.entry')=='encrypted'
    click('#entry-login');wait('document.querySelector("#dialog").open');click('#dialog-content button');wait('qaPending()>0');c.js('qaFrame(qaNow)')
    for moment,label in [(4700,'decrypting'),(6250,'settling')]:
     c.js('qaAdvance('+str(moment)+')');value=capture(version,theme,width,label);assert value['phase']=='decrypting';states[version,theme,width,label]=value
   for label in ['scan-down','scan-up','decrypting','settling']:
    a,b=states['baseline',theme,width,label],states['current',theme,width,label]
    preserved=['phase','text','beamPosition','resolutionOrder','entry','canvas','ink','drawGeometrySha256','drawOperationCount']
    assert all(a[key]==b[key] for key in preserved),(theme,width,label,a,b)
    if theme=='light':assert a['rgbaSha256']==b['rgbaSha256'],(width,label)
    else:
     assert a['rgbaSha256']!=b['rgbaSha256'],(width,label)
     assert b['accent'].replace(' ','')=='rgba(237,52,145,1)',b
     assert any(max(abs(int(channel)-expected) for channel,expected in zip(color.split(','),(237,52,145)))<=3 for color,count in b['opaquePalette']),b
     assert '0,186,188' not in dict(b['opaquePalette']),b
    comparisons.append({'theme':theme,'width':width,'frame':label,'sameDrawCoordinatesLayoutAndState':True,'lightPixelsExact':theme=='light','darkAccentPink':theme=='dark'})
 # Verify that the shared model and archived-study renderers were not changed.
 manifest=json.loads((archive/'snapshot-manifest.json').read_text())
 shared=[]
 for name in files[4:]:
  target=(root/name).resolve();row=next(row for row in manifest['files'] if Path(row['source']).resolve()==target)
  assert hashlib.sha256(target.read_bytes()).hexdigest()==row['sourceSha256'];shared.append({'file':name,'sameAs141':True,'sha256':row['sourceSha256']})
 assert initial==hashes(),'Sources changed during checks';passed=True
finally:
 if not passed:
  try:(out/'failure.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  except:pass
 (out/'browser-results.json').write_text(json.dumps({'passed':passed,'cases':results,'comparisons':comparisons,'sharedSources':shared if passed else [],'sourcesBefore':initial,'sourcesAfter':hashes(),'method':'Real entrance canvas/controller at deterministic frames by queuing only its requestAnimationFrame tick callback. Native layout and fonts remain active; original timeline, renderer, shapes and state are exercised. Exact canvas draw operation coordinates verify unchanged geometry; alpha hashes are recorded only, because color-dependent antialias rounding can change a few alpha bytes.','limits':'Map import deliberately blocked; no new unit tests, no physical device or screen reader check. Controls outside the scanner are verified separately.'},ensure_ascii=False,indent=2)+'\n')
 c.close()
