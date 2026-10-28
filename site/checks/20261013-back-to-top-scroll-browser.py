from pathlib import Path
import json,time,hashlib,base64
root=Path('/home/le-rif/Bureau/Transcendence');folder=root/'site';out=folder/'checks'
exec((out/'20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
files=['back-to-top.mjs','back-to-top.css'];hashes=lambda:{name:hashlib.sha256((folder/name).read_bytes()).hexdigest() for name in files}
c=Chrome();report={'date':'2026-10-13','sourcesBefore':hashes(),'cases':[]}
def click(selector):c.js('document.querySelector('+json.dumps(selector)+').click()');time.sleep(.12)
def key(name,code):
 params={'type':'keyDown','key':name,'code':name,'windowsVirtualKeyCode':code}
 if code==13:params.update(text='\r',unmodifiedText='\r')
 c.call('Input.dispatchKeyEvent',params);c.call('Input.dispatchKeyEvent',{'type':'keyUp','key':name,'code':name,'windowsVirtualKeyCode':code});time.sleep(.05)
def snapshot():return c.js('''(()=>{const b=document.querySelector('#back-to-top'),d=document.querySelector('.dock-shell'),n=document.querySelector('#main-nav > button[data-section="projects"]'),s=getComputedStyle(b),m=getComputedStyle(n);return {scroll:scrollY,dockScrolling:d.dataset.documentScrolling==='true',buttonHidden:b.hidden,buttonOpacity:Number(s.opacity),menuOpacity:Number(m.opacity),buttonPointer:s.pointerEvents,menuPointer:m.pointerEvents,buttonVisible:!!b.offsetWidth&&!!b.offsetHeight,focus:document.activeElement.id,lang:document.documentElement.lang,hash:location.hash,overflow:document.documentElement.scrollWidth>innerWidth}})()''')
def record(name):
 value=snapshot();report['cases'].append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True);assert not value['overflow'];return value
def shot(name):(out/('20261013-back-to-top-scroll-'+name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def wheel():c.call('Input.dispatchMouseEvent',{'type':'mouseWheel','x':140,'y':250,'deltaY':95,'deltaX':0})
def begin_samples():c.js('''window.qaScrollSamples=[];window.qaSampling=true;function sample(){if(!qaSampling)return;const b=document.querySelector('#back-to-top'),n=document.querySelector('#main-nav > button[data-section="projects"]');qaScrollSamples.push({state:document.querySelector('.dock-shell').dataset.documentScrolling==='true',button:Number(getComputedStyle(b).opacity),menu:Number(getComputedStyle(n).opacity)});requestAnimationFrame(sample)}requestAnimationFrame(sample)''')
def end_samples():
 c.js('qaSampling=false');samples=c.js('qaScrollSamples');assert samples and any(s['state'] for s in samples);assert max(abs(s['button']-s['menu']) for s in samples)<.08,samples;return samples
def language(value):click('#profile');click('[data-account-action="language"]');click('[data-account-locale="'+value+'"]');key('Escape',27);time.sleep(.3)
try:
 c.width(390,844);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=back-to-top-scroll#projects'});time.sleep(1.3)
 for lang,width,height,reduced in [('fr',390,844,False),('ar',320,640,False),('fr',390,844,True),('ar',320,640,True)]:
  label=lang+('-reduced' if reduced else '-motion');c.width(width,height);c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce' if reduced else 'no-preference'}]});language(lang)
  c.js('document.activeElement.blur();scrollTo({top:900,behavior:"instant"})');time.sleep(.9);before=record(label+'-rest');assert before['buttonOpacity']==1 and before['menuOpacity']==1 and not before['dockScrolling'];begin_samples()
  for _ in range(5):wheel();time.sleep(.085)
  during=record(label+'-wheel-hides-both');assert during['dockScrolling'] and during['scroll']>before['scroll'];assert during['buttonOpacity']<.01 and during['menuOpacity']<.01;assert during['buttonPointer']=='none' and during['menuPointer']=='none'
  if not reduced:shot(label+'-hidden')
  time.sleep(.95);after=record(label+'-idle-restores-both');assert not after['dockScrolling'] and after['buttonOpacity']==1 and after['menuOpacity']==1 and after['buttonPointer']!='none';samples=end_samples();report['cases'][-1]['animationSamples']=samples
  if not reduced:shot(label+'-visible')
 # Keyboard access reveals the focused control immediately during a wheel burst.
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'no-preference'}]});c.js('document.activeElement.blur()');wheel();time.sleep(.25);key('Tab',9);c.js('document.querySelector("#main-nav > button[data-section=projects]").focus()');time.sleep(.03)
 value=record('keyboard-menu-focus-reveals-both-immediately');assert value['dockScrolling'] and value['buttonOpacity']==1 and value['menuOpacity']==1
 c.js('document.querySelector("#back-to-top").focus()');time.sleep(.03)
 value=record('keyboard-shortcut-remains-visible');assert value['buttonOpacity']==1 and value['buttonPointer']!='none';key('Enter',13);time.sleep(1.3);value=record('keyboard-return-keeps-title-focus');assert value['scroll']==0 and value['focus']=='section-title' and value['buttonHidden']
 # Reduced-motion return remains instant after the new visibility behavior.
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]});c.js('scrollTo({top:900,behavior:"instant"})');time.sleep(.6);click('#back-to-top');value=record('reduced-return-still-instant');assert value['scroll']==0 and value['focus']=='section-title'
 c.width(1280,900);c.js('scrollTo({top:900,behavior:"instant"})');time.sleep(.6);assert not record('desktop-stays-hidden')['buttonVisible'];wheel();time.sleep(.1);assert not record('desktop-wheel-stays-hidden')['buttonVisible']
 report['passed']=True
except Exception as error:
 report['passed']=False;report['error']=repr(error)
 try:record('failure');shot('failure')
 except Exception:pass
 raise
finally:
 report['sourcesAfter']=hashes();report['sourcesUnchanged']=report['sourcesBefore']==report['sourcesAfter'];(out/'20261013-back-to-top-scroll-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');c.close()
