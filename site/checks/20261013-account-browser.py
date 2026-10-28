from pathlib import Path
import json,time,base64,hashlib
root=Path('/home/le-rif/Bureau/Transcendence');folder=root/'site';out=folder/'checks'
exec((out/'20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
c=Chrome();results=[];files=['account-menu.mjs','account-menu.css','welcome.mjs','entrance.mjs','entrance.css','index.html','content-preview.html']
hashes=lambda:{name:hashlib.sha256((folder/name).read_bytes()).hexdigest() for name in files}
initial=hashes()
def click(selector):
 pos=c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');if(!e)throw Error("Missing target");e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error("Hidden target");return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
 for event in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':event,**pos,'button':'left','clickCount':1})
 time.sleep(.2)
def key(name):
 c.call('Input.dispatchKeyEvent',{'type':'keyDown','key':name,'code':name,'windowsVirtualKeyCode':27 if name=='Escape' else 40});time.sleep(.15)
def record(name):
 value=c.js("""(()=>{const p=document.querySelector('#account-menu'),r=p.getBoundingClientRect();return {lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,preference:document.documentElement.dataset.themePreference,phase:document.body.dataset.entry,hash:location.hash,visible:[...document.querySelectorAll('.utilities button')].filter(e=>e.offsetWidth&&e.offsetHeight&&getComputedStyle(e).visibility==='visible').map(e=>e.id||e.dataset.accountAction||e.dataset.accountTheme||e.dataset.accountLocale),avatar:document.querySelector('#profile img')?.getAttribute('src'),imageLoaded:document.querySelector('#profile img')?.naturalWidth,open:!p.hidden,text:p.innerText,bounds:[r.left,r.top,r.right,r.bottom],focus:document.activeElement.id||document.activeElement.dataset.accountAction||document.activeElement.dataset.accountTheme||document.activeElement.dataset.accountLocale,overflow:document.documentElement.scrollWidth>innerWidth}})()""")
 results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True);assert not value['overflow'];return value
def shot(name): (out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def openSettings():click('#profile');click('[data-account-action="settings"]')
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]});
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/index.html?qa=account'});time.sleep(2)
 state=record('entrance-guest');assert 'profile' in state['visible'] and 'account-messages' not in state['visible'] and 'language' not in state['visible']
 click('#profile');state=record('entrance-guest-panel');assert state['open'] and 'Paramètres' in state['text'] and 'Se connecter' in state['text'];shot('20261013-account-entrance-fr')
 click('[data-account-action="theme"]');click('[data-account-theme="dark"]');assert record('guest-dark')['theme']=='dark'
 click('[data-account-locale="ar"]');c.width(320,640);state=record('guest-settings-ar320');assert state['open'] and state['lang']=='ar' and state['bounds'][0]>=0 and state['bounds'][2]<=320;shot('20261013-account-settings-ar')
 key('Escape');assert record('guest-escape')['focus']=='profile'
 openSettings();click('[data-account-theme="system"]');assert record('guest-system')['preference']=='system';click('[data-account-locale="fr"]');key('Escape');c.width(1280,900)
 # Sign-in from the encrypted entrance reuses its existing simulated journey.
 click('#profile');click('[data-account-action="signin"]');assert c.js("document.querySelector('#dialog').open");record('entrance-signin-dialog');shot('20261013-account-signin')
 click('#dialog-content button');time.sleep(2);state=record('entrance-signin-globe-failed');assert state['phase']=='error'
 c.js("[...document.querySelectorAll('#entrance-access button')].find(e=>e.textContent.includes('sans le globe')).click()");time.sleep(.5)
 state=record('member-entered-without-globe');assert state['avatar'] and state['imageLoaded']>0 and 'account-messages' in state['visible'] and 'account-notifications' in state['visible']
 click('#profile');state=record('member-panel');assert 'Compte' in state['text'] and 'Se déconnecter' in state['text'];shot('20261013-account-member-fr')
 click('[data-account-action="account"]');state=record('member-account');assert 'profile-leila-mansour' in state['hash'] and not state['open']
 click('#account-messages');state=record('messages');assert state['open'] and 'Aucune conversation' in state['text'];key('Escape');assert record('messages-escape')['focus']=='account-messages'
 click('#account-notifications');state=record('notifications');assert state['open'] and 'Aucune notification' in state['text'];key('Escape')
 openSettings();click('[data-account-theme="dark"]');click('[data-account-locale="ar"]');key('Escape');c.width(320,640);click('#profile');state=record('member-panel-ar320');assert state['bounds'][0]>=0 and state['bounds'][2]<=320 and state['bounds'][3]<=640;shot('20261013-account-member-ar')
 click('[data-account-action="signout"]');state=record('signout');assert not state.get('avatar') and 'account-messages' not in state['visible'] and 'account-notifications' not in state['visible']
 openSettings();click('[data-account-locale="en"]');state=record('guest-settings-en');assert state['lang']=='en';key('Escape')
 # Same controls in the direct list preview; use its sign-in simulation as well.
 c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=account#projects'});time.sleep(1.2)
 click('#profile');click('[data-account-action="signin"]');assert c.js("document.querySelector('#dialog').open");click('#dialog-content button');state=record('preview-member');assert state['avatar']
 click('#profile');key('Escape');click('#profile');c.call('Input.dispatchMouseEvent',{'type':'mousePressed','x':10,'y':350,'button':'left','clickCount':1});c.call('Input.dispatchMouseEvent',{'type':'mouseReleased','x':10,'y':350,'button':'left','clickCount':1});assert not record('outside-closes')['open']
finally:
 (out/'20261013-account-browser.json').write_text(json.dumps({'sourcesBefore':initial,'sourcesAfter':hashes(),'cases':results},ensure_ascii=False,indent=2)+'\n');c.close()
