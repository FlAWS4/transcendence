from pathlib import Path
import json,time,base64
root=Path('/home/le-rif/Bureau/Transcendence')
exec((root/'site/checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=root/'site/checks';c=Chrome();results=[]
def click(selector):
 c.js('document.querySelector('+json.dumps(selector)+').click()');time.sleep(.25)
def shot(name):
 (out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def record(name):
 value=c.js("""(()=>{const dialog=document.querySelector('#content-category-dialog'),rect=dialog?.getBoundingClientRect(),footer=dialog?.querySelector('.cp-project-filter-footer')?.getBoundingClientRect();return {hash:location.hash,label:document.querySelector('#content-category-button').textContent,filtered:document.querySelector('#content-category-button').dataset.filtered,results:document.querySelector('#content-count').textContent,kind:dialog?.dataset.kind,text:dialog?.innerText,checked:[...document.querySelectorAll('#content-category-dialog input:checked')].map(e=>e.value),bounds:rect&&[rect.left,rect.top,rect.right,rect.bottom],footerBottom:footer?.bottom,overflow:document.documentElement.scrollWidth>innerWidth||!!dialog&&dialog.scrollWidth>dialog.clientWidth,active:document.activeElement.id}})()""")
 results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True);return value
try:
 c.width(1280,900);c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']});c.call('Page.navigate',{'url':'http://127.0.0.1:8765/site/content-preview.html?qa=filter-dialog#projects'});time.sleep(2)
 click('#content-category-button');initial=record('projects-open');assert initial['kind']=='projects' and not initial['overflow'];shot('20261013-filter-projects-fr')
 click('#content-category-dialog input[value="tech:c"]');draft=record('projects-draft');assert draft['results']==initial['results']
 click('.cp-project-filter-cancel');assert record('projects-cancel')['filtered']=='false'
 click('#content-category-button');click('#content-category-dialog input[value="tech:c"]');click('.cp-project-filter-apply');assert record('projects-apply')['filtered']=='true'
 click('#content-category-button');click('.cp-project-filter-reset');click('.cp-project-filter-apply');assert record('projects-reset')['filtered']=='false'
 click('#main-nav [data-section="people"]');time.sleep(.5)
 click('#content-category-button');profile=record('profiles-open');assert profile['kind']=='people' and profile['label']=='Filtrer' and not profile['overflow'];shot('20261013-filter-profiles-fr')
 click('#content-category-dialog input[value="student"]');click('#content-category-dialog input[value="arrival:2024"]');assert record('profiles-draft')['results']==profile['results']
 click('.cp-project-filter-apply');applied=record('profiles-apply');assert applied['filtered']=='true' and applied['active']=='content-category-button'
 click('#content-category-button');click('.cp-project-filter-reset');click('.cp-project-filter-cancel');assert record('profiles-reset-cancel')['results']==applied['results']
 click('#content-category-button');click('.cp-project-filter-reset');click('.cp-project-filter-apply')
 c.width(320,640);click('#language');click('[data-locale="ar"]');click('#theme');click('[data-theme-choice="dark"]')
 for section in ['projects','people']:
  click('#main-nav [data-section="'+section+'"]');time.sleep(.5);click('#content-category-button');state=record(section+'-ar320');assert not state['overflow'] and state['bounds'][0]>=0 and state['bounds'][2]<=320 and state['footerBottom']<=640,state
  shot('20261013-filter-'+section+'-ar')
  c.call('Input.dispatchKeyEvent',{'type':'keyDown','key':'Escape','code':'Escape','windowsVirtualKeyCode':27});time.sleep(.2)
  assert c.js("!document.querySelector('#content-category-dialog')&&document.activeElement.id==='content-category-button'")
finally:
 (out/'20261013-filter-dialog-browser.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');c.close()
