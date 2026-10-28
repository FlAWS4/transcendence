/** A non-modal location chooser, positioned next to its existing trigger. */
export function mountScopePopover({trigger,panel,closeButton,onOpen}) {
 const doc=trigger.ownerDocument,win=doc.defaultView,abort=new win.AbortController(),signal=abort.signal;
 const viewport=win.visualViewport;let frame=0;
 function close({restoreFocus=false}={}) {
  if(panel.hidden)return;
  panel.hidden=true;trigger.setAttribute('aria-expanded','false');
  win.cancelAnimationFrame(frame);frame=0;
  if(restoreFocus)trigger.focus({preventScroll:true});
 }
 function position() {
  if(panel.hidden)return;
  const margin=12,gap=8,viewLeft=viewport?.offsetLeft||0,viewTop=viewport?.offsetTop||0;
  const viewWidth=Math.min(viewport?.width||doc.documentElement.clientWidth,doc.documentElement.clientWidth),viewHeight=viewport?.height||win.innerHeight;
  const anchor=trigger.getBoundingClientRect(),minLeft=viewLeft+margin,minTop=viewTop+margin;
  const maxRight=viewLeft+viewWidth-margin,maxBottom=viewTop+viewHeight-margin;
  if(anchor.bottom<minTop||anchor.top>maxBottom){close();return;}
  const width=Math.max(0,Math.min(320,viewWidth-margin*2));
  panel.style.width=width+'px';panel.style.maxHeight=Math.max(0,viewHeight-margin*2)+'px';
  const height=panel.getBoundingClientRect().height;
  const below=Math.max(0,maxBottom-anchor.bottom-gap),above=Math.max(0,anchor.top-gap-minTop);
  const upwards=height>below&&above>below,available=upwards?above:below;
  panel.style.maxHeight=available+'px';
  const left=doc.documentElement.dir==='rtl'?anchor.right-width:anchor.left;
  const top=upwards?anchor.top-gap-Math.min(height,available):anchor.bottom+gap;
  panel.style.left=Math.max(minLeft,Math.min(left,maxRight-width))+'px';
  panel.style.top=Math.max(minTop,Math.min(top,maxBottom-Math.min(height,available)))+'px';
  panel.dataset.side=upwards?'above':'below';
 }
 function schedule(){if(panel.hidden)return;win.cancelAnimationFrame(frame);frame=win.requestAnimationFrame(()=>{frame=0;position();});}
 function open(){
  if(!panel.hidden)return;
  const first=onOpen();if(first===false)return;
  panel.hidden=false;trigger.setAttribute('aria-expanded','true');position();
  if(!panel.hidden)(first||closeButton).focus({preventScroll:true});
 }
 trigger.addEventListener('click',()=>panel.hidden?open():close({restoreFocus:true}),{signal});
 trigger.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'){event.preventDefault();open();}
 },{signal});
 closeButton.addEventListener('click',()=>close({restoreFocus:true}),{signal});
 panel.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=[...panel.querySelectorAll('button:not(:disabled),select:not(:disabled)')];
  const boundary=event.shiftKey?controls[0]:controls.at(-1);
  if(doc.activeElement===boundary)close({restoreFocus:true});
 },{signal});
 doc.addEventListener('keydown',event=>{
  if(!panel.hidden&&event.key==='Escape'){event.preventDefault();event.stopPropagation();close({restoreFocus:true});}
 },{signal});
 doc.addEventListener('pointerdown',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!trigger.contains(event.target))close();},{signal});
 doc.addEventListener('focusin',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!trigger.contains(event.target))close();},{signal});
 win.addEventListener('resize',schedule,{signal});win.addEventListener('scroll',schedule,{passive:true,signal});
 viewport?.addEventListener('resize',schedule,{signal});viewport?.addEventListener('scroll',schedule,{signal});
 const observer=new win.ResizeObserver(schedule);observer.observe(trigger);
 return {close,position:schedule,destroy(){close();abort.abort();observer.disconnect();}};
}
