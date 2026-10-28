"""Compare the requested rollback to its preserved 139 baseline, without source edits."""
from pathlib import Path
import json,time,base64,hashlib,re
root=Path(__file__).resolve().parent.parent
exec((root/'checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=root/'checks/20261013-explicit-scope-rollback';out.mkdir(exist_ok=True)
base='http://127.0.0.1:8765/site/'
c=Chrome();results=[];passed=False
files=['index.html','content-preview.html','welcome.mjs','entrance.mjs','entrance.css','dock-navigation.css','account-menu.mjs','comments.mjs','content-report.mjs','content-preview-data.mjs','project-trial.mjs','profile-ui.mjs','project-ui.mjs','journal-ui.mjs','content-controls.mjs']
hashes=lambda:{name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in files}
initial=hashes()
def wait(expression,seconds=25):
 end=time.time()+seconds
 while time.time()<end:
  if c.js(expression):return
  time.sleep(.1)
 raise AssertionError(expression+' '+str(c.js('({errors:qaErrors,text:document.body.innerText.slice(-800)})')))
def click(selector):
 pos=c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');if(!e)throw Error("Missing target");e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error("Hidden target");return{x:r.x+r.width/2,y:r.y+r.height/2}})()')
 for kind in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':kind,**pos,'button':'left','clickCount':1})
 time.sleep(.12)
def key(name):
 for kind in ['keyDown','keyUp']:c.call('Input.dispatchKeyEvent',{'type':kind,'key':name,'code':name,'windowsVirtualKeyCode':{'Escape':27,'Tab':9}[name]})
 time.sleep(.12)
def shot(name):(out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def record(name,value=True):results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def style(selector):
 return c.js('(()=>{const s=getComputedStyle(document.querySelector('+json.dumps(selector)+'));return Object.fromEntries(["backgroundColor","color","borderColor","borderRadius","fontSize","fontWeight","padding","minHeight","textAlign","outlineColor","outlineStyle","outlineWidth"].map(k=>[k,s[k]]))})()')
def settings(locale,theme):
 click('#profile');click('[data-account-action=settings]');click('[data-account-locale='+locale+']');click('[data-account-theme='+theme+']');click('[data-account-action=back]')
 c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':0,'y':0});time.sleep(.2)
def healthy():
 state=c.js('({overflow:document.documentElement.scrollWidth>innerWidth,errors:qaErrors})');assert not state['overflow'] and not state['errors'],state
def dialog():
 wait('document.querySelector("#dialog").open')
 return c.js('({title:document.querySelector("#dialog-title").textContent,paragraphs:[...document.querySelectorAll("#dialog-content p")].map(e=>e.textContent),classes:[...document.querySelectorAll("#dialog-content button")].map(e=>e.className),wrappers:document.querySelectorAll(".account-access-actions").length})')
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)))'})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 baselines={}
 for kind,prefix in [('139','archive/pre-action-palette-and-no-zoom-20261013/baseline/'),('141','')]:
  for locale,theme,width in [('fr','light',1280),('fr','dark',1280),('ar','dark',320)]:
   c.width(width,900 if width==1280 else 640)
   for page in ['index.html','content-preview.html']:
    c.call('Page.navigate',{'url':base+prefix+page+'?qa=rollback-141#explore'})
    wait('Boolean(document.querySelector("#entry-login"))' if page=='index.html' else 'document.body.dataset.entry==="welcome"')
    c.js('document.fonts.ready.then(()=>true)');time.sleep(.7)
    settings(locale,theme)
    for selector in (['#entry-login','#entry-guest','[data-account-action=signin]','[data-account-action=signup]'] if page=='index.html' else ['[data-account-action=signin]','[data-account-action=signup]','#reset']):
     name='-'.join([page,locale,theme,selector]);value=style(selector)
     if kind=='139':baselines[name]=value
     else:assert value==baselines[name],(name,baselines[name],value)
    if kind=='141' and page=='index.html' and locale=='fr' and theme=='light':shot('account-fr-light')
    for action in ['signin','signup']:
     click('[data-account-action='+action+']');value=dialog()
     value['buttonStyle']=style('#dialog-content button')
     key('Tab');value['keyboardFocus']=c.js('(()=>{const e=document.activeElement,s=getComputedStyle(e);return{cls:e.className,visible:e.matches(":focus-visible"),outline:s.outlineStyle,width:s.outlineWidth,color:s.outlineColor}})()')
     name='-'.join([page,locale,theme,action])
     if kind=='139':baselines[name]=value
     else:
      assert value==baselines[name],(name,baselines[name],value)
      assert value['wrappers']==0 and value['paragraphs'],value
      assert value['keyboardFocus']['visible'],value
      record(name,{'matches139':True,'dialog':value})
      if action=='signin' and ((locale=='fr' and theme=='dark' and page=='content-preview.html') or (locale=='ar' and page=='content-preview.html')):shot('signin-'+locale+'-'+theme)
     healthy();click('#dialog-content button:last-child')
     if action=='signin':click('#profile')
    if kind=='141':
     assert c.js('document.querySelectorAll("#zoom-in,#zoom-out,.globe-footer").length')==0
     record(page+'-'+locale+'-'+theme,{'buttonStylesMatch139':True,'zoomButtonsAbsent':True,'noOverflowOrScriptErrors':True})
  # No identity mutation: each preview continues as a visitor.
 # Inspect restored local notices alongside the requested removal of demo indicators.
 c.width(1280,900);c.call('Page.navigate',{'url':base+'content-preview.html?qa=rollback-copy#projects'});wait('document.body.dataset.entry==="welcome"');settings('fr','light');key('Escape')
 for path in ['projects','people','projects/minishell-under-the-prompt?tab=comments','people/profile-leila-mansour']:
  c.js('location.hash='+json.dumps(path));time.sleep(.3);healthy()
  text=c.js('document.body.innerText');assert not re.search(r'de démonstration|Démonstration\s*:|\(démo\)',text,re.I),(path,text)
  if path=='people':assert 'Profils et pseudos fictifs' in text
  if 'tab=comments' in path:assert 'cet onglet' in text and 'profil fictif' in text;shot('comments-fr-restored')
  record('copy-'+path,{'explicitDemoIndicatorsAbsent':True,'restoredNoticesRetained':True})
 # One final real-globe render verifies the top return control after restoring its CSS.
 c.call('Network.setBlockedURLs',{'urls':[]});c.call('Page.navigate',{'url':base+'content-preview.html?qa=rollback-real-globe#explore'})
 wait('document.body.dataset.entry==="welcome"');wait('document.querySelector("#loading").hidden',45);time.sleep(.4)
 state=c.js('(()=>{const e=document.querySelector("#reset"),r=e.getBoundingClientRect();return{hidden:e.hidden,width:r.width,height:r.height,zoomButtons:document.querySelectorAll("#zoom-in,#zoom-out").length,hintParent:document.querySelector("#globe-hint").parentElement.className}})()')
 assert not state['hidden'] and state['width']==44 and state['height']==44 and not state['zoomButtons'],state
 healthy();shot('explorer-fr-restored');record('real-globe-return',state)
 click('[data-section="projects"]');wait('document.querySelector("#reset").hidden');record('return-hidden-in-content')
 assert initial==hashes(),'Sources changed during browser checks';passed=True
finally:
 if not passed:
  try:shot('browser-failure');record('failure',c.js('({errors:qaErrors,text:document.body.innerText.slice(-1700)})'))
  except:pass
 (out/'browser-results.json').write_text(json.dumps({'passed':passed,'cases':results,'sourcesBefore':initial,'sourcesAfter':hashes(),'limits':'Isolated headless Chrome; reduced motion; 320px viewport emulation, no physical phone or screen reader. Map blocked for exact account comparison, then unblocked for Explorer render.'},ensure_ascii=False,indent=2)+'\n')
 c.close()
