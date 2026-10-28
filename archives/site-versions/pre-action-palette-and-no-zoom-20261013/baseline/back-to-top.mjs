const labels={fr:'Remonter en haut',en:'Back to top',ar:'العودة إلى الأعلى'};

/** A document-scroll shortcut for the existing mobile layout, outside the dock. */
export function mountBackToTop({app,getLocale=()=>app.ownerDocument.documentElement.lang}){
 const doc=app.ownerDocument,view=doc.defaultView,abort=new view.AbortController(),signal=abort.signal;
 const mobile=view.matchMedia('(max-width: 840px)'),motion=view.matchMedia('(prefers-reduced-motion: reduce)');
 const button=doc.createElement('button');button.id='back-to-top';button.className='back-to-top';button.type='button';button.hidden=true;
 const icon=doc.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');
 const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M12 19V5m-6 6 6-6 6 6');icon.append(path);button.append(icon);app.append(button);
 let frame=0,destroyed=false,buttonFocused=false;
 function target(){return [...app.querySelectorAll('#content-sheet h1')].find(element=>!element.closest('[hidden]'));}
 function focusTop(){target()?.focus({preventScroll:true});}
 function refresh(){
  if(destroyed)return;
  const label=labels[getLocale()]||labels.fr;button.setAttribute('aria-label',label);button.title=label;
  const blocked=doc.querySelector('dialog[open],.dock-shell[data-search-open=true],#main-nav[data-search-open=true],#scope-popover:not([hidden]),#account-menu:not([hidden])');
  const visible=mobile.matches&&doc.body.dataset.entry==='welcome'&&['projects','people','journal'].includes(app.dataset.section)&&view.scrollY>=Math.max(360,view.innerHeight*.75)&&!blocked;
  // The desktop CSS can hide the control before matchMedia dispatches change.
  if(!visible&&(doc.activeElement===button||buttonFocused)&&!blocked)focusTop();
  if(button.hidden===visible)button.hidden=!visible;
  if(!visible)return;
  // Search and the discovery die sit above the nav. Reserve their real bounds
  // even during the dock's temporary scroll fade so its return cannot overlap.
  const controls=[...app.querySelectorAll('.dock-shell,.dock-search-toggle,.dock-random-toggle')].filter(element=>element.getClientRects().length);
  const top=Math.min(view.innerHeight,...controls.map(element=>element.getBoundingClientRect().top));
  button.style.bottom=Math.max(16,view.innerHeight-top+12)+'px';
 }
 function schedule(){if(!frame&&!destroyed)frame=view.requestAnimationFrame(()=>{frame=0;refresh();});}
 button.addEventListener('click',()=>{
  focusTop();
  view.scrollTo({top:0,behavior:motion.matches?'instant':'smooth'});
 },{signal});
 doc.addEventListener('focusin',event=>{buttonFocused=event.target===button;},{signal});
 doc.addEventListener('pointerdown',event=>{if(!button.contains(event.target))buttonFocused=false;},{signal});
 view.addEventListener('scroll',event=>{if(event.target===doc||event.target===view)schedule();},{signal,passive:true});
 view.addEventListener('resize',schedule,{signal,passive:true});
 view.visualViewport?.addEventListener('resize',schedule,{signal,passive:true});
 mobile.addEventListener('change',schedule,{signal});
 const observer=new view.MutationObserver(schedule);
 observer.observe(doc.documentElement,{subtree:true,attributes:true,attributeFilter:['lang','data-entry','data-section','data-search-open','open','hidden']});
 const sizes=new view.ResizeObserver(schedule);
 app.querySelectorAll('.dock-shell,.dock-search-toggle,.dock-random-toggle').forEach(element=>sizes.observe(element));
 doc.fonts?.ready.then(schedule);refresh();
 return {refresh,destroy(){destroyed=true;abort.abort();observer.disconnect();sizes.disconnect();view.cancelAnimationFrame(frame);button.remove();}};
}
