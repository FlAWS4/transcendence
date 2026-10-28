"""Complete the visual check after waiting for actual map readiness, not filter readiness."""
from pathlib import Path
exec(Path(__file__).with_name('20261013-explicit-scope-rollback-browser.py').read_text().split('\ntry:\n')[0])
try:
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)))'})
 c.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 c.width(1280,900);c.call('Page.navigate',{'url':base+'content-preview.html?qa=rollback-globe-ready#explore'})
 wait('document.body?.dataset.entry==="welcome"');wait('Boolean(document.querySelector("#loading")?.hidden)',45);time.sleep(.4)
 state=c.js('(()=>{const e=document.querySelector("#reset"),r=e.getBoundingClientRect();return{ready:document.querySelector("#loading").hidden,canvas:!!document.querySelector("#globe canvas"),hidden:e.hidden,width:r.width,height:r.height,zoomButtons:document.querySelectorAll("#zoom-in,#zoom-out").length}})()')
 assert state['ready'] and state['canvas'] and not state['hidden'] and state['width']==44 and state['height']==44 and not state['zoomButtons'],state
 healthy();shot('explorer-fr-map-ready');record('globe-ready-return',state)
 click('[data-section="projects"]');wait('document.querySelector("#reset").hidden');record('return-hidden-in-content',True)
 assert initial==hashes();passed=True
finally:
 (out/'globe-results.json').write_text(json.dumps({'passed':passed,'cases':results,'sourcesBefore':initial,'sourcesAfter':hashes(),'limits':'Isolated headless Chrome, desktop viewport, reduced motion. Completes the loading screenshot in the main account comparison without repeating unchanged account checks.'},ensure_ascii=False,indent=2)+'\n');c.close()
