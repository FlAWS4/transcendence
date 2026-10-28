from pathlib import Path
import json, time, base64
root=Path('/home/le-rif/Bureau/Transcendence')
source=(root/'site/checks/20261012-multi-campus-browser.py').read_text()
exec(source.split('from pathlib import Path')[0])
out=root/'site/checks'
base='http://127.0.0.1:8765/site/'
c=Chrome();results=[]
def click(selector):
 c.js('document.querySelector('+json.dumps(selector)+').click()');time.sleep(.2)
try:
 c.width(1280,900)
 c.call('Page.navigate',{'url':base+'content-preview.html?qa=clean-list-headings-126#projects'})
 time.sleep(2)
 for lang,theme,width,height in [('fr','light',1280,900),('en','light',390,844),('ar','dark',320,640)]:
  c.width(width,height)
  click('#language');click('[data-locale="'+lang+'"]')
  click('#theme');click('[data-theme-choice="'+theme+'"]')
  click('#main-nav [data-section="people"]');time.sleep(.6)
  for route in ['projects','people','journal']:
   click('#main-nav [data-section="'+route+'"]');time.sleep(.6)
   state=c.js("""(()=>{const title=document.querySelector('#section-title'),toolbar=document.querySelector('.cp-toolbar'),list=document.querySelector('#content-list'),style=getComputedStyle(title),bar=getComputedStyle(toolbar);return {route:location.hash,title:title.textContent,active:document.activeElement.id,headingRect:[title.offsetWidth,title.offsetHeight],clip:style.clipPath,obsolete:!!document.querySelector('.cp-heading,#section-intro,#content-eyebrow'),toolbarTop:toolbar.getBoundingClientRect().top,marginTop:bar.marginTop,paddingTop:bar.paddingTop,borderTop:bar.borderTopWidth,count:list.children.length,overflow:document.documentElement.scrollWidth>innerWidth,controls:[...document.querySelectorAll('#content-views button')].filter(e=>e.offsetWidth).map(e=>e.textContent.trim())}})()""")
   assert not state['obsolete'] and not state['overflow'],state
   assert state['headingRect']==[1,1] and state['clip']=='inset(50%)',state
   assert state['marginTop']==state['paddingTop']==state['borderTop']=='0px',state
   assert state['count']>0 and state['active']=='section-title',state
   results.append({'language':lang,'width':width,**state})
   if lang in ['fr','ar']:
    (out/('20261013-heading-'+route+'-'+lang+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
 print(json.dumps(results,ensure_ascii=False))
finally:
 (out/'20261013-heading-checks.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
 c.close()
