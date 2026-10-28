from pathlib import Path
import json,time,base64,hashlib
root=Path('/home/le-rif/Bureau/Transcendence');folder=root/'site';out=folder/'checks'
exec((out/'20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
c=Chrome();results=[];passed=False
files=['account-menu.mjs','account-menu.css','welcome.mjs','index.html','content-preview.html']
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
def record(name,groups=None):
 value=c.js("""(()=>{const p=document.querySelector('#account-menu'),r=p.getBoundingClientRect();return {lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,preference:document.documentElement.dataset.themePreference,phase:document.body.dataset.entry,title:document.querySelector('#account-menu-title')?.textContent,themeCount:p.querySelectorAll('[data-account-theme]').length,localeCount:p.querySelectorAll('[data-account-locale]').length,visibleExtras:['account-messages','account-notifications'].filter(id=>!document.getElementById(id).hidden),avatar:!!document.querySelector('#profile img'),open:!p.hidden,bounds:[r.left,r.top,r.right,r.bottom],focus:document.activeElement.id||document.activeElement.dataset.accountAction||document.activeElement.dataset.accountTheme||document.activeElement.dataset.accountLocale,overflow:document.documentElement.scrollWidth>innerWidth,width:innerWidth}})()""")
 results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True);assert not value['overflow']
 if value['open']:assert value['bounds'][0]>=0 and value['bounds'][2]<=value['width']
 if groups:assert [value['themeCount'],value['localeCount']]==groups
 return value
def shot(name):(out/('20261013-account-panels-'+name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.call('Page.navigate',{'url':base+'index.html?qa=account-panels'});time.sleep(1.5)
 click('#profile');click('[data-account-action="theme"]');state=record('entry-visitor-theme',[3,0]);assert state['title']=='Thème' and not state['visibleExtras'];shot('theme-fr')
 click('[data-account-theme="dark"]');state=record('entry-visitor-dark',[3,0]);assert state['theme']=='dark' and state['focus']=='dark'
 key('Home');assert c.js("document.activeElement.dataset.accountAction==='back'");click('[data-account-action="back"]');assert record('back-to-theme')['focus']=='theme'
 click('[data-account-action="language"]');record('entry-visitor-language',[0,3]);click('[data-account-locale="en"]');state=record('entry-visitor-english',[0,3]);assert state['title']=='Language' and state['focus']=='en'
 click('[data-account-locale="ar"]');c.width(320,640);state=record('entry-visitor-ar320',[0,3]);assert state['title']=='اللغة' and not state['visibleExtras'];shot('language-ar320');key('Escape');assert record('escape-restores-trigger')['focus']=='profile'
 c.call('Page.navigate',{'url':base+'content-preview.html?qa=account-panels#projects'});time.sleep(1.3)
 click('#profile');click('[data-account-action="theme"]');state=record('theme-persists-after-navigation',[3,0]);assert state['theme']=='dark' and state['preference']=='dark'
 click('[data-account-theme="system"]');assert record('system-mode',[3,0])['preference']=='system';click('[data-account-theme="light"]');click('[data-account-action="back"]')
 click('[data-account-action="language"]');click('[data-account-locale="fr"]');click('[data-account-action="back"]');assert record('back-to-language')['focus']=='language'
 click('[data-account-action="signin"]');assert c.js("document.querySelector('#dialog').open");click('#dialog-content button');time.sleep(.2)
 click('#profile');click('[data-account-action="theme"]');state=record('mobile-member-theme',[3,0]);assert state['avatar'] and len(state['visibleExtras'])==2;shot('member-theme-mobile')
 click('[data-account-action="back"]');click('[data-account-action="language"]');click('[data-account-locale="ar"]');state=record('mobile-member-language',[0,3]);assert state['avatar'] and state['title']=='اللغة';shot('member-language-ar320')
 click('[data-account-action="back"]');click('[data-account-action="settings"]');record('settings-keeps-both',[3,3]);key('Escape')
 click('#profile');click('[data-account-action="signout"]');state=record('signout');assert not state['avatar'] and not state['visibleExtras']
 # Retained standalone reader reproduces the original combined panel.
 c.width(1280,900);c.call('Page.navigate',{'url':base+'archive/pre-account-preference-panels-20261013/preview.html'});time.sleep(.7)
 click('#profile');click('[data-account-action="theme"]');record('archived-theme-still-combined',[3,3]);shot('archive-before')
 assert initial==hashes();passed=True
finally:
 (out/'20261013-account-panels-browser.json').write_text(json.dumps({'passed':passed,'sourcesBefore':initial,'sourcesAfter':hashes(),'cases':results},ensure_ascii=False,indent=2)+'\n');c.close()
