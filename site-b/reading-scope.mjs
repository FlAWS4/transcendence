/** Keep the location context visible but inert while reading an entry. Version B, refinements of 26 Oct 2026: reset,
 * the world command, shows there too, inert like the other commands (§S); fit, when given, sets the pill's width for
 * the new form before its final place is read (§T: reading hides the chevron). */
export function mountReadingScope({app,bar,anchor,trail,back,reset=null,summary,motion,fit=()=>{}}){
 let active=null;
 function cancel(){const previous=active;active=null;previous?.cancel();}
 function setReading(reading){
  const changed=app.dataset.reading!==String(reading);
  const before=anchor.getBoundingClientRect();
  cancel();
  app.dataset.reading=String(reading);
  // Only commands are inert: the separate plain-text context stays accessible.
  bar.inert=false;bar.removeAttribute('aria-hidden');
  trail.inert=reading;back.inert=reading;if(reset)reset.inert=reading;summary.hidden=!reading;
  fit();
  if(!changed||motion.matches||!bar.animate)return;
  const after=anchor.getBoundingClientRect();
  const dx=before.left-after.left,dy=before.top-after.top;
  if(Math.abs(dx)+Math.abs(dy)<.1)return;
  const animation=bar.animate([{translate:dx+'px '+dy+'px'},{translate:'0px 0px'}],{duration:700,easing:'cubic-bezier(.22,1,.36,1)'});
  active=animation;
  const finish=()=>{if(active===animation)cancel();};
  animation.finished.then(finish,finish);
 }
 function getAnchorRect(){
  const rect=anchor.getBoundingClientRect();
  // The map must target the final layout, never chase the moving FLIP frame.
  const [x=0,y=0]=getComputedStyle(bar).translate.split(/\s+/).map(value=>parseFloat(value)||0);
  return {left:rect.left-x,top:rect.top-y,width:rect.width,height:rect.height};
 }
 motion.addEventListener('change',()=>{if(motion.matches)cancel();});
 window.addEventListener('resize',cancel);
 return {setReading,getAnchorRect};
}
