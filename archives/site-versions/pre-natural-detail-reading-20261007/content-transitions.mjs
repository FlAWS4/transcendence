/** Reversible page reveal, preserving the outgoing reading position. */
export function createContentTransitions({app,sheet,motion}){
 let active=null;
 const properties=['--cp-exit-left','--cp-exit-top','--cp-exit-width','--cp-exit-height'];
 function clearExit(){
  delete app.dataset.contentExiting;
  properties.forEach(name=>sheet.style.removeProperty(name));
 }
 function cancel(){
  const previous=active;active=null;
  previous?.cancel();clearExit();
 }
 function play(frames){
  const animation=sheet.animate(frames,{duration:360,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
  active=animation;
  const finish=()=>{if(active===animation)cancel();};
  animation.finished.then(finish,finish);
 }
 function captureExit(){
  if(motion.matches)return null;
  const rect=sheet.getBoundingClientRect();
  return {rect:{left:rect.left,top:rect.top,width:rect.width,...(Number.isFinite(rect.height)?{height:rect.height}:{})},opacity:getComputedStyle(sheet).opacity};
 }
 function enter(){
  cancel();if(motion.matches)return;
  play([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}]);
 }
 function exit(snapshot){
  cancel();if(!snapshot||motion.matches)return;
  const {rect,opacity}=snapshot;
  sheet.style.setProperty('--cp-exit-left',rect.left+'px');
  sheet.style.setProperty('--cp-exit-top',rect.top+'px');
  sheet.style.setProperty('--cp-exit-width',rect.width+'px');
  if(Number.isFinite(rect.height))sheet.style.setProperty('--cp-exit-height',rect.height+'px');
  app.dataset.contentExiting='true';
  // The rectangle already includes any in-progress entrance transform.
  play([{opacity,transform:'translateY(0px)'},{opacity:0,transform:'translateY(10px)'}]);
 }
 motion.addEventListener('change',()=>{if(motion.matches)cancel();});
 return {captureExit,enter,exit,cancel};
}
