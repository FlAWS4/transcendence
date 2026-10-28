// Campus guidance in CSS screen coordinates. The map remains responsible for
// projection and camera navigation; this module never moves or renders a map.
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const finite=Number.isFinite;

/** Keep the selected campus on screen, preserving its bearing from the view
 * centre. Insets are the opaque map margins plus the indicator's safe space.
 * `wasOffscreen` adds a small re-entry band to avoid flicker at the boundary.
 * The angle rotates an upward-pointing SVG (right=90°, down=180°).
 */
export function projectCampusIndicator(point,{width,height,insetX=40,insetY=insetX,wasOffscreen=false,hysteresis=6}={}){
 if(!finite(point?.x)||!finite(point?.y)||!finite(width)||!finite(height)||width<44||height<44)return {mode:'hidden'};
 const mx=clamp(finite(insetX)?insetX:40,22,width/2),my=clamp(finite(insetY)?insetY:40,22,height/2);
 const left=mx,right=width-mx,top=my,bottom=height-my;
 const band=wasOffscreen?clamp(finite(hysteresis)?hysteresis:6,0,Math.min((right-left)/2,(bottom-top)/2)):0;
 const inside=point.x>=left+band&&point.x<=right-band&&point.y>=top+band&&point.y<=bottom-band;
 if(inside)return {mode:'reticle',x:point.x,y:point.y,angle:0};
 const cx=width/2,cy=height/2,dx=point.x-cx,dy=point.y-cy;
 // One ray/rectangle intersection, rather than separately clamping x and y,
 // keeps the arrow aimed at the actual projected location near the corners.
 const tx=dx===0?Infinity:(dx>0?right-cx:left-cx)/dx;
 const ty=dy===0?Infinity:(dy>0?bottom-cy:top-cy)/dy;
 const distance=Math.min(tx,ty);
 const angle=Math.atan2(dy,dx)*180/Math.PI+90;
 return {mode:'edge',x:cx+dx*distance,y:cy+dy*distance,angle:angle>180?angle-360:angle};
}

/** Continuous CSS rotation through the shortest arc, including ±180°. */
export function continuousBearing(previous,next){
 if(!finite(previous))return next;
 return previous+((next-previous+180)%360+360)%360-180;
}

const copy={
 fr:name=>`${name} hors champ. Recentrer sur le campus.`,
 en:name=>`${name} is off screen. Recenter on campus.`,
 ar:name=>`${name} خارج نطاق العرض. إعادة التمركز على الفرع.`,
};

/** Augment the existing marker button so focus, campus identity and click
 * remain stable when it changes between reticle and edge arrow.
 */
export function createCampusDirection({holder,button,label}){
 const doc=button.ownerDocument;
 if(!doc.querySelector('link[data-campus-direction-style]')){
  const style=doc.createElement('link');style.rel='stylesheet';style.href=new URL('../../../../site/campus-direction.css?v=1',import.meta.url).href;style.dataset.campusDirectionStyle='';doc.head.append(style);
 }
 const arrow=doc.createElement('span');arrow.className='hg-campus-arrow';arrow.setAttribute('aria-hidden','true');
 const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('focusable','false');
 const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','m5 11 7-7 7 7M12 4v16');svg.append(path);arrow.append(svg);button.append(arrow);
 const originalAria=button.getAttribute('aria-label'),originalTitle=button.getAttribute('title');
 let edge=false,angle=null,lastLabel='',placement='',labelWidth='';
 const restore=(name,value)=>value===null?button.removeAttribute(name):button.setAttribute(name,value);
 function reset(){
  if(edge){button.classList.remove('hg-offscreen');holder.classList.remove('hg-offscreen-pin');restore('aria-label',originalAria);restore('title',originalTitle);}
  edge=false;angle=null;lastLabel='';placement='';labelWidth='';
  delete button.dataset.campusDirection;delete button.dataset.labelPlacement;
  button.style.removeProperty('--hg-campus-bearing');button.style.removeProperty('--hg-campus-label-width');
 }
 function update({point,width,height,insetX,insetY,locale='fr',campusName=label.textContent}){
  const result=projectCampusIndicator(point,{width,height,insetX,insetY,wasOffscreen:edge});
  if(result.mode!=='edge'){
   if(edge||result.mode==='hidden')reset();
   if(result.mode==='reticle')button.dataset.campusDirection='reticle';
   return result;
  }
  if(!edge){edge=true;button.classList.add('hg-offscreen');holder.classList.add('hg-offscreen-pin');button.dataset.campusDirection='edge';}
  const bearing=continuousBearing(angle,result.angle);
  if(angle===null||Math.abs(bearing-angle)>.05){angle=bearing;button.style.setProperty('--hg-campus-bearing',`${angle.toFixed(2)}deg`);}
  // Keep long campus names inside the viewport without rotating their text.
  let nextPlacement=placement==='above'&&result.y>=height/2-12?'above':placement==='below'&&result.y<=height/2+12?'below':result.y>height/2?'above':'below';
  const above=result.y-34,below=height-result.y-34;
  if(Math.max(above,below)<32)nextPlacement='hidden';
  else if(nextPlacement==='above'&&above<32)nextPlacement='below';
  else if(nextPlacement==='below'&&below<32)nextPlacement='above';
  if(placement!==nextPlacement){placement=nextPlacement;button.dataset.labelPlacement=placement;}
  const nextWidth=`${Math.max(20,Math.floor(Math.min(200,(Math.min(result.x,width-result.x)-12)*2)))}px`;
  if(labelWidth!==nextWidth){labelWidth=nextWidth;button.style.setProperty('--hg-campus-label-width',labelWidth);}
  const text=(copy[locale.split('-')[0]]||copy.fr)(campusName);
  if(lastLabel!==text){lastLabel=text;button.setAttribute('aria-label',text);button.setAttribute('title',text);}
  return {...result,angle};
 }
 return {update,reset,isOffscreen:()=>edge,destroy(){reset();arrow.remove();}};
}
