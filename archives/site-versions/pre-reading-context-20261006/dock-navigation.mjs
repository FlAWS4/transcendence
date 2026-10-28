/**
 * Move the existing scene into its context badge without resizing its canvas.
 * The selectors apply only while the scene belongs to the welcome app, so the
 * campus dialog can borrow it with its normal geometry and restore it unchanged.
 */
export function mountDockNavigation({app,stage,anchor,getWorldGeometry}){
 if(app.dataset.navigation!=='dock'||!anchor)return {sync(){}};
 let frame=0;
 function sync(){
  if(!app.contains(stage))return;
  const width=stage.clientWidth,height=stage.clientHeight;
  if(!width||!height)return;
  const css=getComputedStyle(stage),fraction=name=>parseFloat(css.getPropertyValue(name))||.5;
  const x=width*fraction('--hg-center-x'),y=height*fraction('--hg-center-y');
  const target=anchor.getBoundingClientRect();
  // A fixed scene and fixed filter share viewport coordinates even after the
  // document has scrolled. Absolute historical layouts still use the app box.
  const parent=css.position==='fixed'?{left:0,top:0}:app.getBoundingClientRect();
  // Radius is in the unscaled MapLibre viewport; only its screen position is
  // transformed. At country/campus level, crop the centre of the saved view.
  const compact=app.dataset.section!=='explore';
  const world=compact?getWorldGeometry?.():null;
  const radius=world?.radius||Math.min(width,height)*.45;
  const values={
   '--dock-origin-x':x+'px','--dock-origin-y':y+'px',
   '--dock-translate-x':(target.left-parent.left+target.width/2-stage.offsetLeft-x)+'px',
   '--dock-translate-y':(target.top-parent.top+target.height/2-stage.offsetTop-y)+'px',
   '--dock-scale':String(target.width/(2*radius)),
   '--dock-clip-radius':radius+'px',
   '--dock-full-radius':Math.hypot(width,height)+'px',
  };
  for(const [key,value]of Object.entries(values))stage.style.setProperty(key,value);
  app.dataset.globeDocked=String(compact);
 }
 function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(sync);}
 const observer=new ResizeObserver(schedule);
 observer.observe(stage);observer.observe(anchor);observer.observe(document.getElementById('scope-bar'));
 window.addEventListener('resize',schedule);
 document.fonts.ready.then(schedule);
 return {sync:schedule};
}
