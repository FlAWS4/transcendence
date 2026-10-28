from pathlib import Path
exec((Path(__file__).resolve().parent/'20261013-action-palette-browser.py').read_text().split('\ntry:\n')[0])
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)))'})
 c.call('Network.enable');c.call('Network.setBlockedURLs',{'urls':['*integrated-globe.mjs*']})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.call('Page.navigate',{'url':base+'content-preview.html#people/profile-leila-mansour'});wait('Boolean(document.querySelector(".cp-profile-message"))')
 for locale in ['fr','en','ar']:
  c.width(320 if locale=='ar' else 1280,640 if locale=='ar' else 900);settings(locale,'dark' if locale=='ar' else 'light');key('Escape')
  c.js('location.hash="people/profile-leila-mansour"');wait('Boolean(document.querySelector(".cp-profile-message"))');click('.cp-profile-message');clean('message-dialog-'+locale);shot('message-'+locale);click('.cp-profile-message-close')
  click('.cp-report-trigger');clean('report-dialog-'+locale);shot('report-'+locale);click('.cp-report-close')
  c.js('location.hash="projects/minishell-under-the-prompt?tab=comments"');wait('Boolean(document.querySelector(".cp-comments"))');c.js('document.querySelector(".cp-comments").scrollIntoView({block:"center"})');time.sleep(.5);clean('comments-form-'+locale);shot('comments-form-'+locale)
  c.js('location.hash="projects/minishell-under-the-prompt?tab=test"');wait('Boolean(document.querySelector(".cp-project-repository-edit"))');click('.cp-project-repository-edit');clean('repository-editor-'+locale);shot('repository-'+locale);click('.cp-project-repository-actions button:nth-child(2)')
 assert hashes()==initial
 passed=True
finally:
 if not passed:
  try:shot('content-copy-failure');record('failure',c.js('({errors:qaErrors,text:document.body.innerText.slice(-1000)})'))
  except:pass
 (out/'content-copy-results.json').write_text(json.dumps({'passed':passed,'cases':results,'sourcesBefore':initial,'sourcesAfter':hashes(),'limits':'Map blocked; no message/report/comment sent to any external service.'},ensure_ascii=False,indent=2)+'\n');c.close()
