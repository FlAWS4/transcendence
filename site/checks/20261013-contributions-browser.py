from pathlib import Path
import json,time,base64,hashlib
root=Path('/home/le-rif/Bureau/Transcendence');folder=root/'site';out=folder/'checks'
exec((out/'20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
c=Chrome();results=[]
def click(selector):c.js('document.querySelector('+json.dumps(selector)+').click()');time.sleep(.2)
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]});c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=contributions#people/profile-ines-morel?tab=contribution'});time.sleep(1.5)
 for lang,w in [('fr',1280),('en',390),('ar',320)]:
  c.width(w,900 if w==1280 else 640);click('#profile');click('[data-account-action="settings"]');click('[data-account-locale="'+lang+'"]');click('[data-account-action="close"]')
  c.js("location.hash='#people/profile-ines-morel?tab=contribution'");time.sleep(.3)
  value=c.js("({cards:[...document.querySelectorAll('.cp-profile-related-link')].map(e=>({text:e.innerText,href:e.getAttribute('href')})),cta:document.querySelectorAll('.cp-card-link').length,overflow:document.documentElement.scrollWidth>innerWidth,hash:location.hash,headings:[...document.querySelectorAll('#profile-detail h2')].map(e=>e.innerText)})")
  if not value['cards']:value['cards']=c.js("[...document.querySelectorAll('#profile-detail a.cp-card')].map(e=>({text:e.innerText,href:e.getAttribute('href')}))")
  assert value['cta']==0 and not value['overflow'];assert value['cards'];results.append({'case':lang,'result':value})
  (out/('20261013-contributions-'+lang+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
  destination=value['cards'][0]['href'];c.js('document.querySelector('+json.dumps('#profile-detail a[href="'+destination+'"]')+').click()');time.sleep(.3);assert c.js('location.hash')==destination
  results.append({'case':'open-'+lang,'hash':c.js('location.hash')})
finally:
 (out/'20261013-contributions-browser.json').write_text(json.dumps({'sources':{n:hashlib.sha256((folder/n).read_bytes()).hexdigest() for n in ['profile-ui.mjs','profile-data.mjs']},'cases':results},ensure_ascii=False,indent=2)+'\n');c.close()
