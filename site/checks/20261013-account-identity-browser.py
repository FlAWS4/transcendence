from pathlib import Path
import json,time,base64,hashlib
root=Path('/home/le-rif/Bureau/Transcendence');folder=root/'site';out=folder/'checks'
exec((out/'20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
c=Chrome();results=[];passed=False
files=['account-menu.mjs','account-menu.css','welcome.mjs','entrance.mjs','index.html','content-preview.html']
hashes=lambda:{name:hashlib.sha256((folder/name).read_bytes()).hexdigest() for name in files}
initial=hashes();base='http://127.0.0.1:8765/site/'
def click(selector):
 pos=c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');if(!e)throw Error("Missing target "+'+json.dumps(selector)+');e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error("Hidden target");return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
 for event in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':event,**pos,'button':'left','clickCount':1})
 time.sleep(.15)
def key(name):
 code={'Escape':27,'Home':36,'End':35}.get(name,40)
 for kind in ['keyDown','keyUp']:c.call('Input.dispatchKeyEvent',{'type':kind,'key':name,'code':name,'windowsVirtualKeyCode':code})
 time.sleep(.12)
def record(name,member=False):
 value=c.js("""(()=>{const p=document.querySelector('#account-menu'),h=p.querySelector('h2'),n=p.querySelector('.account-identity strong'),u=p.querySelector('.account-username');return {name:n?.textContent,username:u?.textContent,usernameDirection:u?getComputedStyle(u.firstChild).direction:null,belowName:u?u.getBoundingClientRect().top>=n.getBoundingClientRect().bottom:false,headingClipped:getComputedStyle(h).clipPath==='inset(50%)',identity:!!p.querySelector('.account-identity'),actions:[...p.querySelectorAll('[data-account-action]')].map(e=>e.dataset.accountAction),lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,avatar:!!document.querySelector('#profile img'),overflow:document.documentElement.scrollWidth>innerWidth,bounds:[p.getBoundingClientRect().left,p.getBoundingClientRect().right,innerWidth]}})()""")
 results.append({'case':name,'result':value});assert value['headingClipped'] and not value['overflow'] and value['bounds'][0]>=0 and value['bounds'][1]<=value['bounds'][2],value
 if member:assert value['username']=='@lmansour' and value['belowName'] and value['usernameDirection']=='ltr' and 'signin' not in value['actions'] and 'signup' not in value['actions'],value
 else:assert not value['identity'] and value['actions'].index('signin')<value['actions'].index('signup')<value['actions'].index('settings'),value
 return value
def shot(name):(out/('20261013-account-identity-'+name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def dialog(name):
 value=c.js("({open:document.querySelector('#dialog').open,text:document.querySelector('#dialog-content').textContent})");assert value['open'];results.append({'case':name,'result':value});return value
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.call('Page.navigate',{'url':base+'index.html?qa=account-identity'});time.sleep(1.2);click('#profile');record('entry-guest-fr');shot('guest-fr')
 c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':0,'y':0});time.sleep(.25)
 styles=c.js("""(()=>{const style=id=>{const s=getComputedStyle(document.querySelector(id));return Object.fromEntries(['backgroundColor','color','borderRadius','padding','fontSize','minHeight','boxShadow'].map(k=>[k,s[k]]))};return [style('#entry-login'),style('[data-account-action=signin]')]})()""");assert styles[0]==styles[1],styles;results.append({'case':'sign-in-style-equals-entrance','styles':styles})
 click('[data-account-action="signup"]');assert 'Aucun compte réel n’est créé' in dialog('entry-create-account')['text'];click('#dialog-content button:last-child');assert not c.js("document.querySelector('#dialog').open")
 click('#profile');click('[data-account-action="signup"]');click('#dialog-content button')
 for i in range(50):
  if c.js("document.body.dataset.entry==='error'"):break
  time.sleep(.1)
 assert c.js("document.body.dataset.entry==='error'");click('#entrance-access button:last-child');time.sleep(.25);click('#profile');record('entry-created-demo-member',True);shot('member-fr')
 click('[data-account-action="signout"]');click('#profile');record('signed-out');click('[data-account-action="close"]')
 c.call('Page.navigate',{'url':base+'content-preview.html?qa=account-identity#projects'});time.sleep(1)
 c.width(320,640);click('#profile');click('[data-account-action="settings"]');click('[data-account-locale="ar"]');click('[data-account-theme="dark"]');click('[data-account-action="back"]');record('guest-ar320-dark');shot('guest-ar320')
 click('[data-account-action="signup"]');assert 'لا يتم إنشاء أي حساب حقيقي' in dialog('preview-create-account-ar')['text'];click('#dialog-content button');click('#profile');record('member-ar320-dark',True);shot('member-ar320')
 click('[data-account-action="signout"]');click('#profile');click('[data-account-action="language"]');click('[data-account-locale="en"]');click('[data-account-action="back"]');record('guest-en320');click('[data-account-action="signin"]');dialog('existing-sign-in-en');click('#dialog-content button');click('#profile');record('member-en320',True)
 assert initial==hashes();passed=True;print('PASS',len(results),'states; identity, guest actions, signup/cancel, signin, matching entrance style')
finally:
 (out/'20261013-account-identity-browser.json').write_text(json.dumps({'passed':passed,'sourcesBefore':initial,'sourcesAfter':hashes(),'cases':results},ensure_ascii=False,indent=2)+'\n');c.close()
