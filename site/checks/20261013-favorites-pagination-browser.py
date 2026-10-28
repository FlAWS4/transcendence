from pathlib import Path
import json,time,hashlib
root=Path('/home/le-rif/Bureau/Transcendence');folder=root/'site';out=folder/'checks'
exec((out/'20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
c=Chrome();results=[]
def click(s):c.js('document.querySelector('+json.dumps(s)+').click()');time.sleep(.3)
def state():return c.js("({hash:location.hash,page:document.querySelector('.cp-pagination-summary')?.innerText,scroll:scrollY,count:document.querySelectorAll('#content-list .cp-card').length,history:history.state})")
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]});c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=favorites-page#projects'});time.sleep(1.2)
 c.js("(async()=>{const {previewEntries}=await import('./content-preview-data.mjs?v=9');const ids=previewEntries.filter(e=>e.section==='projects').slice(0,26).map(e=>e.id);localStorage.setItem('horizon-content-preferences-v2',JSON.stringify({favoritesOnly:true,favorites:ids,sort:'newest'}));location.hash='#projects?page=2';location.reload()})()");time.sleep(1.2)
 c.js('scrollTo({top:250,behavior:"instant"})');before=state();assert 'page=2' in before['hash'];results.append({'case':'favorite-list-page2','result':before})
 click('#content-list .cp-card-title-link');click('#project-detail .cp-favorite');c.js('history.back()');time.sleep(.5);after=state();assert after['hash']=='#projects' and after['scroll']==0 and after['count']==12,after;results.append({'case':'changed-favorite-back-page1','result':after})
 c.js("location.hash='#projects?page=2'");time.sleep(.3);c.js('scrollTo({top:180,behavior:"instant"})');click('#content-list .cp-card-title-link');c.js('history.back()');time.sleep(.5);normal=state();assert 'page=2' in normal['hash'] and normal['scroll']==180,normal;results.append({'case':'unchanged-back-page2','result':normal})
 print('PASS',len(results))
finally:
 (out/'20261013-favorites-pagination-browser.json').write_text(json.dumps({'source':hashlib.sha256((folder/'welcome.mjs').read_bytes()).hexdigest(),'cases':results},ensure_ascii=False,indent=2)+'\n');c.close()
