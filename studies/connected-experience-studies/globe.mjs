// Lightweight, local SVG illustration for the separate navigation studies.
// Dependencies frozen locally in ./assets for this comparison.
const DATA_URL=new URL('./assets/world.json',import.meta.url);
const SVG_NS='http://www.w3.org/2000/svg';
const SIZE=600,CENTER=SIZE/2,RADIUS=252;
const INITIAL_ROTATION=[-12,-17,0];
const CAMPUS=[
 {id:'paris',name:'42 Paris',coordinates:[2.3192,48.89704]},
 {id:'khouribga',name:'1337 Khouribga',coordinates:[-6.897858,32.882134]},
 {id:'luanda',name:'42 Luanda',coordinates:[13.184199,-8.924652]},
 {id:'rio',name:'42 Rio',coordinates:[-43.198063189,-22.909956499]},
 {id:'tokyo',name:'42 Tokyo',coordinates:[139.688131871,35.690448414]},
];
const VIEWS={
 world:{rotation:INITIAL_ROTATION,label:'Globe du réseau de campus'},
 france:{rotation:[-2.4,-46.6,0],label:'Globe centré sur la France'},
 paris:{rotation:[-2.3192,-48.89704,0],label:'Globe centré sur le campus 42 Paris'},
};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const wrap=value=>((value+180)%360+360)%360-180;
let nextId=0,worldPromise;
function loadWorld(){
 if(!worldPromise)worldPromise=fetch(DATA_URL).then(response=>{
  if(!response.ok)throw new Error('Impossible de charger les contours du globe.');
  return response.json();
 }).catch(error=>{worldPromise=null;throw error;});
 return worldPromise;
}
function element(name,attributes={},parent){
 const node=document.createElementNS(SVG_NS,name);
 for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));
 if(parent)parent.append(node);
 return node;
}

/** Mount one freely rotatable globe; scope changes only orient the illustration. */
export function mountGlobe(host){
 const {d3,topojson}=window;
 if(!host||!d3?.geoOrthographic||!topojson?.feature)throw new Error('Le globe requiert un conteneur, D3 et topojson-client.');
 const id='study-globe-'+(++nextId),motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let destroyed=false,frame=0,pointer=null,rotation=[...INITIAL_ROTATION],scope='world';
 let land=null,borders=null,france=null;
 const projection=d3.geoOrthographic().translate([CENTER,CENTER]).scale(RADIUS).rotate(rotation).clipAngle(90).precision(.4);
 const path=d3.geoPath(projection),grid=d3.geoGraticule().step([30,30])();
 const svg=element('svg',{viewBox:'0 0 '+SIZE+' '+SIZE,class:'study-globe',role:'img',tabindex:'0','aria-label':VIEWS.world.label,'aria-describedby':id+'-description','data-load-state':'loading','data-scope':'world'});
 Object.assign(svg.style,{width:'100%',height:'100%',display:'block',overflow:'visible',touchAction:'none',cursor:'grab'});
 const desc=element('desc',{id:id+'-description'},svg);
 desc.textContent='Carte des campus sur un globe. Faire glisser pour le tourner, ou utiliser les touches fléchées lorsqu’il est sélectionné.';
 const defs=element('defs',{},svg);
 const ocean=element('radialGradient',{id:id+'-ocean',cx:'34%',cy:'26%',r:'78%'},defs);
 element('stop',{offset:'0%','stop-color':'var(--globe-ocean, #e3f3f0)'},ocean);
 element('stop',{offset:'75%','stop-color':'var(--globe-ocean, #e3f3f0)'},ocean);
 element('stop',{offset:'100%','stop-color':'var(--globe-grid, #71bdba)','stop-opacity':'.52'},ocean);
 const light=element('radialGradient',{id:id+'-light',cx:'27%',cy:'22%',r:'75%'},defs);
 element('stop',{offset:'0%','stop-color':'#fff','stop-opacity':'.22'},light);
 element('stop',{offset:'65%','stop-color':'#fff','stop-opacity':'0'},light);
 element('stop',{offset:'100%','stop-color':'var(--globe-line, #07999e)','stop-opacity':'.08'},light);
 // All geographic layers share the same orthographic projection and horizon.
 element('circle',{cx:CENTER,cy:CENTER,r:RADIUS+10,fill:'none',stroke:'var(--globe-grid, #71bdba)','stroke-width':'.8',opacity:'.2','aria-hidden':'true'},svg);
 element('circle',{cx:CENTER,cy:CENTER,r:RADIUS,fill:'url(#'+id+'-ocean)','aria-hidden':'true'},svg);
 const gridPath=element('path',{fill:'none',stroke:'var(--globe-grid, #71bdba)','stroke-width':'.75',opacity:'.36','aria-hidden':'true'},svg);
 const landPath=element('path',{fill:'var(--globe-land, #22babc)',stroke:'var(--globe-line, #07999e)','stroke-width':'.55','stroke-linejoin':'round','aria-hidden':'true'},svg);
 const borderPath=element('path',{fill:'none',stroke:'var(--globe-line, #07999e)','stroke-width':'.65',opacity:'.56','aria-hidden':'true'},svg);
 const francePath=element('path',{fill:'var(--accent, #008c91)',stroke:'var(--accent, #008c91)','stroke-width':'1',opacity:'0','aria-hidden':'true'},svg);
 element('circle',{cx:CENTER,cy:CENTER,r:RADIUS,fill:'url(#'+id+'-light)','pointer-events':'none','aria-hidden':'true'},svg);
 element('circle',{cx:CENTER,cy:CENTER,r:RADIUS,fill:'none',stroke:'var(--globe-line, #07999e)','stroke-width':'.7',opacity:'.28','aria-hidden':'true'},svg);
 const markerLayer=element('g',{'aria-hidden':'true','pointer-events':'none'},svg);
 const markers=CAMPUS.map(campus=>{
  const group=element('g',{},markerLayer);
  const title=element('title',{},group);title.textContent=campus.name;
  const halo=element('circle',{r:9,fill:'var(--pink, #ed3491)',opacity:'.12'},group);
  const ring=element('circle',{r:13,fill:'none',stroke:'var(--pink, #ed3491)','stroke-width':'1',opacity:'0'},group);
  const dot=element('circle',{r:3.4,fill:'var(--pink, #ed3491)',stroke:'#fff','stroke-width':'1.5'},group);
  return {...campus,group,halo,ring,dot};
 });
 host.append(svg);
 function draw(){
  if(destroyed)return;
  projection.rotate(rotation);
  gridPath.setAttribute('d',path(grid)||'');
  if(land)landPath.setAttribute('d',path(land)||'');
  if(borders)borderPath.setAttribute('d',path(borders)||'');
  if(france)francePath.setAttribute('d',path(france)||'');
  francePath.setAttribute('opacity',scope==='world'?'0':'.65');
  const center=projection.invert([CENTER,CENTER]);
  for(const marker of markers){
   const visible=d3.geoDistance(marker.coordinates,center)<Math.PI/2-.025;
   marker.group.setAttribute('display',visible?'inline':'none');
   if(!visible)continue;
   const point=projection(marker.coordinates),selected=scope==='paris'&&marker.id==='paris';
   marker.group.setAttribute('transform','translate('+point[0]+' '+point[1]+')');
   marker.dot.setAttribute('r',selected?'5':'3.4');
   marker.halo.setAttribute('r',selected?'10':'9');
   marker.ring.setAttribute('opacity',selected?'.65':'0');
  }
 }
 function stop(){cancelAnimationFrame(frame);frame=0;}
 function setScope(scopeId){
  if(destroyed)return;
  scope=Object.hasOwn(VIEWS,scopeId)?scopeId:'world';
  svg.setAttribute('aria-label',VIEWS[scope].label);svg.setAttribute('data-scope',scope);
  stop();
  const from=[...rotation],target=VIEWS[scope].rotation;
  const to=[from[0]+wrap(target[0]-from[0]),target[1],0];
  if(motion.matches){rotation=to;draw();return;}
  const start=performance.now();
  function animate(now){
   if(destroyed)return;
   const t=clamp((now-start)/950,0,1),eased=t*t*(3-2*t);
   rotation=from.map((value,index)=>value+(to[index]-value)*eased);draw();
   frame=t<1?requestAnimationFrame(animate):0;
  }
  frame=requestAnimationFrame(animate);
 }
 function pointerDown(event){
  if(pointer||event.isPrimary===false||event.button!==0)return;
  stop();pointer={id:event.pointerId,x:event.clientX,y:event.clientY};
  svg.setPointerCapture(event.pointerId);svg.style.cursor='grabbing';
 }
 function pointerMove(event){
  if(!pointer||event.pointerId!==pointer.id)return;
  const rect=svg.getBoundingClientRect(),sensitivity=190/Math.max(1,Math.min(rect.width,rect.height));
  rotation=[wrap(rotation[0]+(event.clientX-pointer.x)*sensitivity),clamp(rotation[1]-(event.clientY-pointer.y)*sensitivity,-75,75),0];
  pointer.x=event.clientX;pointer.y=event.clientY;draw();
 }
 function pointerUp(event){
  if(!pointer||event.pointerId!==pointer.id)return;
  if(svg.hasPointerCapture(event.pointerId))svg.releasePointerCapture(event.pointerId);
  pointer=null;svg.style.cursor='grab';
 }
 function keyDown(event){
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();stop();const step=event.shiftKey?16:8;
  if(event.key==='ArrowLeft')rotation[0]=wrap(rotation[0]-step);
  if(event.key==='ArrowRight')rotation[0]=wrap(rotation[0]+step);
  if(event.key==='ArrowUp')rotation[1]=clamp(rotation[1]+step,-75,75);
  if(event.key==='ArrowDown')rotation[1]=clamp(rotation[1]-step,-75,75);
  draw();
 }
 svg.addEventListener('pointerdown',pointerDown);
 svg.addEventListener('pointermove',pointerMove);
 svg.addEventListener('pointerup',pointerUp);
 svg.addEventListener('pointercancel',pointerUp);
 svg.addEventListener('lostpointercapture',pointerUp);
 svg.addEventListener('keydown',keyDown);
 draw();
 loadWorld().then(world=>{
  if(destroyed)return;
  const object=world.objects.features||Object.values(world.objects)[0];
  land=topojson.feature(world,object);
  borders=topojson.mesh(world,object,(a,b)=>a!==b);
  france=land.features.find(feature=>(feature.properties?.id||feature.id)==='FRA');
  svg.setAttribute('data-load-state','ready');draw();
 }).catch(()=>{if(!destroyed){svg.setAttribute('data-load-state','error');svg.setAttribute('aria-label','Les contours du globe n’ont pas pu être chargés.');}});
 return {setScope,destroy(){
  if(destroyed)return;
  destroyed=true;stop();
  if(pointer&&svg.hasPointerCapture(pointer.id))svg.releasePointerCapture(pointer.id);
  pointer=null;svg.remove();
 }};
}
