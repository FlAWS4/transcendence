from pathlib import Path
import json,time,base64,hashlib
root=Path('/home/le-rif/Bureau/Transcendence');folder=root/'site';out=folder/'checks'
exec((out/'20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
c=Chrome();results=[]
def click(selector):
 pos=c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');e.scrollIntoView({block:"center",behavior:"instant"});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
 for event in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':event,**pos,'button':'left','clickCount':1})
 time.sleep(.25)
def record(name):
 value=c.js('''(()=>{const p=document.querySelector('#content-pagination');return {hash:location.hash,current:p.querySelector('[aria-current]')?.dataset.page,previousDisabled:p.querySelector('.cp-pagination-previous').disabled===true,nextDisabled:p.querySelector('.cp-pagination-next').disabled===true,buttons:[...p.querySelectorAll('.cp-pagination-previous,.cp-pagination-next')].map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,label:e.getAttribute('aria-label'),title:e.title,svg:!!e.querySelector('svg'),transform:getComputedStyle(e.querySelector('svg')).transform,size:[r.width,r.height]}}),overflow:document.documentElement.scrollWidth>innerWidth}})()''')
 results.append({'case':name,'result':value});assert not value['overflow'];assert all(not b['text'] and b['svg'] and b['label']==b['title'] and min(b['size'])>=44 for b in value['buttons']);return value
try:
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]});c.width(1280,900);c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=pagination-arrows#projects'});time.sleep(1.3)
 for lang,w in [('fr',1280),('fr',320),('ar',320)]:
  c.width(w,900 if w==1280 else 640);click('#profile');click('[data-account-action="settings"]');click('[data-account-locale="'+lang+'"]');click('[data-account-theme="'+('dark' if lang=='ar' else 'light')+'"]');click('[data-account-action="close"]')
  c.js("location.hash='#projects'");time.sleep(.3);s=record(lang+str(w)+'-first');assert s['previousDisabled'] and not s['nextDisabled']
  assert all(b['transform'].startswith('matrix(-1') for b in s['buttons']) if lang=='ar' else all(b['transform']=='none' for b in s['buttons'])
  click('.cp-pagination-next');assert record(lang+str(w)+'-next')['current']=='2';click('.cp-pagination-previous');assert record(lang+str(w)+'-previous')['current']=='1'
  click('.cp-pagination-pages [data-page="7"]');s=record(lang+str(w)+'-last');assert s['nextDisabled'] and not s['previousDisabled']
  c.js("document.querySelector('#content-pagination').scrollIntoView({block:'center',behavior:'instant'})");time.sleep(.2);(out/('20261013-pagination-arrows-'+lang+'-'+str(w)+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  click('.cp-pagination-previous');assert record(lang+str(w)+'-last-previous')['current']=='6'
 print('PASS',len(results))
finally:
 (out/'20261013-pagination-arrows-browser.json').write_text(json.dumps({'date':'2026-10-13','sources':{n:hashlib.sha256((folder/n).read_bytes()).hexdigest() for n in ['content-pagination-ui.mjs','content-pagination.css','welcome.mjs']},'cases':results},ensure_ascii=False,indent=2)+'\n');c.close()
