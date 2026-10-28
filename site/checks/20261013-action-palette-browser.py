"""Targeted visual and interaction checks; run with Chrome and localhost:8765."""
from pathlib import Path
import json,time,base64,hashlib
root=Path(__file__).resolve().parent.parent
exec((root/'checks/20261012-multi-campus-browser.py').read_text().split('from pathlib import Path')[0])
out=root/'checks/20261013-action-palette';out.mkdir(exist_ok=True)
c=Chrome();results=[];passed=False
base='http://127.0.0.1:8765/site/'
files=['index.html','content-preview.html','welcome.mjs','entrance.mjs','entrance.css','dock-navigation.css','account-menu.mjs','comments.mjs','content-report.mjs','content-preview-data.mjs','project-trial.mjs','profile-ui.mjs','project-ui.mjs','journal-ui.mjs','content-controls.mjs']
hashes=lambda:{name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in files if (root/name).exists()}
initial=hashes()
def wait(expression,seconds=30):
 end=time.time()+seconds
 while time.time()<end:
  if c.js(expression):return
  time.sleep(.1)
 raise AssertionError(expression+' '+str(c.js('({errors:qaErrors,text:document.body.innerText.slice(-700)})')))
def click(selector):
 pos=c.js('(()=>{const e=document.querySelector('+json.dumps(selector)+');if(!e)throw Error("Missing target");e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error("Hidden target");return{x:r.x+r.width/2,y:r.y+r.height/2}})()')
 for kind in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':kind,**pos,'button':'left','clickCount':1})
 time.sleep(.12)
def key(name):
 for kind in ['keyDown','keyUp']:c.call('Input.dispatchKeyEvent',{'type':kind,'key':name,'code':name,'windowsVirtualKeyCode':{'Escape':27,'Tab':9,'Enter':13}[name],**({'text':'\r','unmodifiedText':'\r'} if name=='Enter' and kind=='keyDown' else {})})
 time.sleep(.12)
def shot(name):(out/(name+'.png')).write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['data']))
def record(name,value=True):results.append({'case':name,'result':value});print(name,json.dumps(value,ensure_ascii=False),flush=True)
def clean(name):
 r=c.js("({text:document.body.innerText,overflow:document.documentElement.scrollWidth>innerWidth,errors:qaErrors})")
 import re
 found=re.findall(r'de démonstration|à la démonstration|Démonstration\s*:|\(démo\)|demo profile|\(demo\)|sample content|fictional|ficti[fsve]+|simul[éa-z]+|تجريبي|تجريبية|وهمي|وهمية',r['text'],re.I)
 assert not found,(name,found);assert not r['overflow'],name;assert not r['errors'],r['errors']
 record(name,{'noDemoLabels':True,'noOverflow':True})
def style(selector):
 return c.js('(()=>{const s=getComputedStyle(document.querySelector('+json.dumps(selector)+'));return Object.fromEntries(["backgroundColor","color","borderColor","borderRadius","fontSize","padding","minHeight","outlineColor","outlineStyle","outlineWidth"].map(k=>[k,s[k]]))})()')
def settings(locale,theme):
 click('#profile');click('[data-account-action=settings]');click('[data-account-locale='+locale+']');click('[data-account-theme='+theme+']');click('[data-account-action=back]')
def dialog(name,title):
 wait('document.querySelector("#dialog").open')
 r=c.js('({title:document.querySelector("#dialog-title").textContent,actions:[...document.querySelectorAll("#dialog-content button")].map(e=>({text:e.textContent,cls:e.className})),paragraphs:document.querySelectorAll("#dialog-content p").length})')
 assert r['title']==title,(name,r);assert len(r['actions'])==2 and all('entrance-action' in a['cls'] for a in r['actions']);assert r['paragraphs']==0
 clean(name);record(name+'-structure',r)
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)))'})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 labels={'fr':('Connexion','Créer un compte'),'en':('Sign in','Create an account'),'ar':('تسجيل الدخول','إنشاء حساب')}
 for locale,theme,width in [('fr','light',1280),('fr','dark',1280),('en','light',390),('en','dark',390),('ar','light',320),('ar','dark',320)]:
  c.width(width,900 if width==1280 else 640);c.call('Page.navigate',{'url':base+'index.html?qa=palette'});wait('Boolean(document.querySelector("#entry-login"))')
  settings(locale,theme);c.call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':0,'y':0});time.sleep(.25)
  a,b=style('#entry-login'),style('[data-account-action=signin]')
  assert a==b,(a,b);clean('entry-account-'+locale+'-'+theme);record('matching-signin-'+locale+'-'+theme,a)
  if locale in ['fr','ar']:shot('account-'+locale+'-'+theme)
  click('[data-account-action=signin]');dialog('entry-signin-'+locale+'-'+theme,labels[locale][0]);
  if locale=='fr':shot('signin-'+theme)
  key('Tab');focus=c.js('(()=>{const e=document.activeElement,s=getComputedStyle(e);return {class:e.className,visible:e.matches(":focus-visible"),outline:s.outlineStyle,width:s.outlineWidth,color:s.outlineColor}})()')
  assert focus['visible'] and focus['outline']!='none' and focus['width']=='2px',focus;record('keyboard-focus-'+locale+'-'+theme,focus)
  click('#dialog-content button:last-child');click('#profile');click('[data-account-action=signup]');dialog('entry-signup-'+locale+'-'+theme,labels[locale][1]);click('#dialog-content button:last-child')
  if locale=='fr':shot('entrance-'+theme)
 # Main sign-in reaches the existing error fallback when the map is blocked.
 c.width(1280,900);settings('fr','light');click('[data-account-action=signin]');click('#dialog-content button');wait('document.body.dataset.entry==="error"');click('#entrance-access button:last-child');wait('document.body.dataset.entry==="welcome"');click('#profile');assert c.js('Boolean(document.querySelector("#profile img"))');clean('main-signin-member')
 click('[data-account-action=signout]');click('#profile');click('[data-account-action=signup]');dialog('after-entry-signup','Créer un compte');shot('after-entry-signup');click('#dialog-content button:last-child')
 click('#profile');click('[data-account-action=signin]');dialog('after-entry-signin','Connexion');click('#dialog-content button');click('#profile');assert c.js('Boolean(document.querySelector("#profile img"))');clean('after-entry-member');click('[data-account-action=close]')
 for locale in ['fr','en','ar']:
  c.width(320 if locale=='ar' else 1280,640 if locale=='ar' else 900);settings(locale,'dark' if locale=='ar' else 'light');key('Escape')
  for path in ['projects','people','journal','people/profile-leila-mansour','projects/minishell-under-the-prompt','projects/minishell-under-the-prompt?tab=comments']:
   c.js('location.hash='+json.dumps(path));time.sleep(.25);clean(locale+'-'+path)
   if 'comments' in path:shot('comments-'+locale)
 assert initial==hashes(),'Sources changed during browser checks'
 passed=True
finally:
 if not passed:
  try:shot('auth-failure');record('failure',c.js('({errors:qaErrors,text:document.body.innerText.slice(-1500)})'))
  except:pass
 (out/'auth-results.json').write_text(json.dumps({'passed':passed,'cases':results,'sourcesBefore':initial,'sourcesAfter':hashes(),'limits':'Map import deliberately blocked for account/copy checks; real globe interactions verified separately.'},ensure_ascii=False,indent=2)+'\n')
 c.close()
