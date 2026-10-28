import {createGlobeStyle, applyGlobeTheme, ensureGlobeDetail, setGlobeDetailVisible, setGlobeDetailOpacity,getGlobeDetailOpacity} from './globe-style.mjs?v=23';
import {constrainNavigation, getNavigationZoomRange} from './navigation-policy.mjs';
import {createGlobeDetailGate} from './detail-gate.mjs?v=27';
import {createCampusPreloader,campusCoverageRadius} from './campus-preload.mjs?v=18';
import {createRandomCampusCandidate,campusJourneyDuration,campusJourneyEasing} from './random-campus.mjs';
import {createCampusOutbound} from './campus-outbound.mjs?v=27';
import {prepareWorldRender} from './world-render-preparation.mjs?v=14';
import {createPolarCapLayer} from './polar-cap-layer.mjs?v=13';
import {createCampusDirection} from './campus-direction.mjs?v=1';
import {resolveGlobeCenter} from './globe-layout.mjs?v=2';

// One geographic scene and one camera, from the planet down to the campus.
export function createWelcomeGlobe(options) {
 const {container,world,campuses,countries:countryList,onScopeChange=()=>{},onViewChange=()=>{},onStatus=()=>{}}=options;
 const {d3,topojson,maplibregl}=window;
 if(!maplibregl)throw new Error('The map renderer could not load.');
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const features=world.type==='Topology'?topojson.feature(world,world.objects.features||Object.values(world.objects)[0]).features:world.features;
 const campusById=new Map(campuses.map(c=>[c.id,c]));
 const randomCandidate=createRandomCampusCandidate(campuses);
 randomCandidate.peek();
 const countries=new Map(countryList.map(country=>{
  const members=campuses.filter(c=>c.country===country.id);
  const center=d3.geoCentroid({type:'MultiPoint',coordinates:members.map(c=>c.coordinates)});
  const feature=features.find(f=>(f.properties?.id||f.id)===country.id);
  let bounds;
  if(feature){
   const parts=feature.geometry.type==='MultiPolygon'?feature.geometry.coordinates.map(coordinates=>({type:'Polygon',coordinates})):[feature.geometry];
   const part=parts.find(part=>d3.geoContains(part,center))||parts.sort((a,b)=>d3.geoArea(b)-d3.geoArea(a))[0];
   bounds=d3.geoBounds(part);
  }else bounds=[[center[0]-.7,center[1]-.7],[center[0]+.7,center[1]+.7]];
  return [country.id,{...country,center,bounds,members,type:'country'}];
 }));
 const mappedCountries=new Set(features.map(f=>f.properties?.id||f.id));
 const motion=matchMedia('(prefers-reduced-motion:reduce)');
 let reduced=motion.matches,dark=false,ready=false,destroyed=false,flight=false,flightTarget=null;
 let navigating=false,detailVisible=false,navigationId=0;
 let worldPreparing=false;
 const worldPreparationController=new AbortController();let worldRender={phase:'idle'};
 let width=container.clientWidth,height=container.clientHeight,worldZoom=1,centerPoint=[width/2,height/2],padding={top:0,right:0,bottom:0,left:0};
 let scope={level:'world',country:null,campus:null,countryName:null,campusName:null};
 let lastView='',resizeFrame=0,detailError=false,randomPreloadTimer=0;
 let campusPreview=null;
 let layoutKey='',fadeKey='',markersDirty=true,appliedDark=false;
 const markers=new Map();
 container.classList.add('hg-integrated');
 container.setAttribute('role','region');
 const mapHost=document.createElement('div');mapHost.className='hg-map';container.append(mapHost);
 const polarCap=createPolarCapLayer();
 const campusPreloader=createCampusPreloader(maplibregl,{onChange(state){
  if(destroyed)return;
  options.onCampusLoad?.(state);
  if(scope.level==='campus'&&state.campusId===scope.campus)detailGate.refresh();
  map.fire('horizonpreload');
  if(state.ready)scheduleRandomAnticipation();
 },onAnticipationChange(){
  if(!destroyed)options.onRandomCampusLoad?.(getRandomCampusState());
 }});
 const map=new maplibregl.Map({container:mapHost,style:createGlobeStyle(false,features,{deferDetail:true,borders:world.borders}),center:[6,18],zoom:1,
  transformRequest:campusPreloader.transformRequest,
  minZoom:-2,maxZoom:19,maxPitch:48,pitch:0,bearing:0,renderWorldCopies:false,
  attributionControl:false,maplibreLogo:false,keyboard:false,dragRotate:false,touchPitch:false,
  collectResourceTiming:new URLSearchParams(location.search).get('perf')==='1',
  // Keep the rounded globe edge smooth; cap only high-density backing buffers.
  pixelRatio:Math.min(devicePixelRatio||1,matchMedia('(max-width:700px)').matches?1.5:2),
  // Keep the selected neighbourhood's decoded tiles, not only its PBF bytes.
  maxTileCacheSize:96,maxTileCacheZoomLevels:24,
  canvasContextAttributes:{antialias:true,alpha:true},fadeDuration:0,trackResize:false,
  // Constrain the native requested camera, including wheel/pinch targets. A
  // render-only clamp would accumulate overshoot and delay the reverse gesture.
  transformConstrain(center,zoom){
   const next=constrainNavigation(navigationPolicy(),center,zoom);
   return {...next,center:new maplibregl.LngLat(next.center.lng,next.center.lat)};
  },
  transformCameraUpdate(next){
   // Once arrived, wheel, pinch and buttons use the same zoom/pitch relation
   // as the 14.5 → 17.8 approach, in both directions. Clamping the previous
   // pitch only would flatten permanently after the first zoom out.
   if(!flight&&!worldPreparing&&scope.level==='campus'){
    return {pitch:34*clamp((next.zoom-14.5)/(17.8-14.5),0,1)};
   }
   // Keep the existing flight/retreat choreography and flatten before the
   // globe becomes visible, without nested move/zoom events.
   const u=clamp((next.zoom-12)/5.8,0,1);
   return {pitch:Math.min(next.pitch,34*u*u*(3-2*u))};
  }});
 map.touchZoomRotate.disableRotation();
 const detailGate=createGlobeDetailGate(map,{
  setVisible:showDetail,
  setOpacity:(value,options)=>setGlobeDetailOpacity(map,value,options),
  reducedMotion:()=>reduced,
  // Readiness belongs to the visible destination, not the whole raw radius.
  isPrepared:()=>scope.level==='campus'&&map.getZoom()>=14.5&&(!flight||flightTarget?.stage==='approach'),
  isZoomApproach:()=>flight&&flightTarget?.stage==='approach',
  onChange:state=>{if(['moving','revealing','detail'].includes(state.phase))onStatus('ready');map.fire('horizondetail');},
 });
 const campusOutbound=createCampusOutbound(map,{detailGate,reducedMotion:()=>reduced,getOpacity:()=>getGlobeDetailOpacity(map)});
 map.getCanvas().tabIndex=-1;map.getCanvas().setAttribute('aria-hidden','true');
 const credits=document.createElement('div');credits.className='map-credit';credits.dir='ltr';
 credits.innerHTML='<a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a> · <a href="https://openfreemap.org/" target="_blank" rel="noreferrer">OpenFreeMap</a> · © <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';
 container.parentElement.append(credits);

 function readLayout(){
  width=Math.max(1,container.clientWidth);height=Math.max(1,container.clientHeight);
  const css=getComputedStyle(container);
  const fraction=(name,fallback)=>{const raw=css.getPropertyValue(name).trim(),n=parseFloat(raw);return Number.isFinite(n)?n/(raw.endsWith('%')?100:1):fallback;};
  const {x,y}=resolveGlobeCenter({width,height,style:css});
  container.style.setProperty('--hg-focus-y',`${y*100}%`);
  centerPoint=[width*x,height*y];
  padding={left:Math.max(0,(2*x-1)*width),right:Math.max(0,(1-2*x)*width),top:Math.max(0,(2*y-1)*height),bottom:Math.max(0,(1-2*y)*height)};
  worldZoom=Math.log2(Math.min(width,height)/600)+1.88+Math.log2(fraction('--hg-radius',.425)/.425);
 }
 function countryZoom(country){
  const [[west,south],[east,north]]=country.bounds;
  const span=Math.max(east-west,(north-south)/Math.max(.25,Math.cos(country.center[1]*Math.PI/180)),1.3);
  return clamp(Math.log2(Math.min(width,height)*.64*360/(512*(span+1))),worldZoom+1.35,6.7);
 }
 function navigationPolicy(){
  const country=countries.get(scope.country);
  return {level:scope.level,country,campus:campusById.get(scope.campus),worldZoom,countryZoom:country?countryZoom(country):null,inFlight:flight};
 }
 function getNavigationState(){
  const center=map.getCenter(),range=getNavigationZoomRange({...navigationPolicy(),inFlight:false},center.lat);
  const campus=campusById.get(scope.campus);
  return {...scope,worldRender,inFlight:flight,flightStage:flightTarget?.stage||null,center:center.toArray(),zoom:map.getZoom(),minZoom:range.min,maxZoom:range.max,
   campusDistanceKm:campus?d3.geoDistance(campus.coordinates,center.toArray())*6371:null,detailVisible,detail:detailGate.getState(),campusRender:{mode:'progressive',phase:detailGate.getState().phase,fullyPrepared:false},campusPreload:campusPreloader.getState(),
   randomCampus:getRandomCampusState(),flightDuration:flightTarget?.duration??null,detailOpacity:getGlobeDetailOpacity(map),renderedDetail:getRenderedDetail()};
 }
 function getRenderedDetail(){
  // Diagnostics only: read the paint values already evaluated by pinned GL5.24,
  // rather than reporting only our requested alpha formula as visual evidence.
  const paints={};
  for(const [id,property]of [['h42-land','background-opacity'],['h42-water','fill-opacity'],['h42-road-major','line-opacity'],['h42-building-relief','fill-extrusion-opacity']]){
   const layer=map.style?.getLayer(id),value=layer?.paint?.get(property);
   paints[id]={opacity:typeof value==='number'?value:value?.constantOr?.(null)??null,
    hidden:layer?.isHidden?.(map.getZoom())??true};
  }
  return {paints,evaluatedZoom:map.style?.z??null,covered:false,canvasVisibility:mapHost.style.visibility||'visible'};
 }
 function getWorldScreenGeometry(){
  if(destroyed||!ready||worldRender.phase!=='ready'||scope.level!=='world'||flight||Math.abs(map.getPitch())>.01)return null;
  // Public projection only: locate the apparent tangent of the current
  // perspective sphere along its eastward great circle. At zero pitch its
  // silhouette is circular; padding changes its screen centre, not its size.
  const center=map.getCenter(),point=map.project(center),radians=Math.PI/180;
  const lat=center.lat*radians,lng=center.lng*radians;
  const distance=angle=>{
   const phi=Math.asin(Math.sin(lat)*Math.cos(angle));
   const lambda=lng+Math.atan2(Math.sin(angle)*Math.cos(lat),Math.cos(angle)-Math.sin(lat)*Math.sin(phi));
   const projected=map.project([lambda/radians,phi/radians]);
   return Math.hypot(projected.x-point.x,projected.y-point.y);
  };
  let low=0,high=Math.PI/2;
  for(let i=0;i<28;i++){
   const first=low+(high-low)/3,second=high-(high-low)/3;
   if(distance(first)<distance(second))low=first;else high=second;
  }
  const radius=distance((low+high)/2),rect=map.getCanvas().getBoundingClientRect();
  if(!Number.isFinite(radius)||radius<=0)return null;
  return {center:{x:rect.left+point.x,y:rect.top+point.y},radius,
   rect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height}};
 }
 function getRandomCampusState(){
  const state=campusPreloader.getAnticipationState(),nextCampusId=randomCandidate.peek()?.id??null;
  if(state.campusId===nextCampusId&&!['cancelled','consumed','idle'].includes(state.phase))return {...state,nextCampusId};
  return {...state,nextCampusId,campusId:nextCampusId,phase:'scheduled',total:0,completed:0,available:0,failed:0,ready:false};
 }
 function emitScope(){const {previewCampus,...publicScope}=scope;onScopeChange(publicScope);emitView();}
 function emitView(){
  const zoom=map.getZoom(),canBack=!scope.previewCampus&&scope.level!=='world';
  const range=getNavigationZoomRange(navigationPolicy(),map.getCenter().lat);
  const canZoomIn=ready&&!flight&&zoom<range.max-.01,canZoomOut=ready&&!flight&&zoom>range.min+.01;
  const key=`${scope.level}:${canBack}:${canZoomIn}:${canZoomOut}`;
  if(container.dataset.level!==scope.level)container.dataset.level=scope.level;
  if(key!==lastView){lastView=key;onViewChange({zoom,canBack,canZoomIn,canZoomOut});}
 }
 function setScope(countryId=null,campusId=null){
  if(scope.country===countryId&&scope.campus===campusId)return;
  scope={level:campusId?'campus':countryId?'country':'world',country:countryId,campus:campusId,countryName:countries.get(countryId)?.name||null,campusName:campusById.get(campusId)?.name||null,...(scope.previewCampus?{previewCampus:scope.previewCampus}:{})};
  if(!scope.previewCampus)randomCandidate.setCurrent(campusId);
  options.onRandomCampusLoad?.(getRandomCampusState());
  syncMarkers();emitScope();
 }
 function setGestures(enabled){
  for(const handler of [map.dragPan,map.scrollZoom,map.touchZoomRotate,map.doubleClickZoom,map.boxZoom])handler[enabled?'enable':'disable']();
  map.touchZoomRotate.disableRotation();
 }
 function showDetail(visible){
  if(!ready)return;
  // GL5.24 reloads the vector source (and empties its decoded cache) on a
  // layout visibility change. Keep its layout enabled after first install;
  // every conceal caller has already set paint alpha to zero. The source's
  // minzoom14 prevents world/country tile requests while retaining the cache.
  if(visible&&!setGlobeDetailVisible(map,true))return;
  detailVisible=Boolean(visible);polarCap.setVisible(!visible);
 }
 function prepareCampusDetail({retry=false}={}){
  if(ready&&scope.level==='campus'&&ensureGlobeDetail(map,dark)){
   if(retry&&detailError){map.getSource('openmaptiles')?.setUrl('https://tiles.openfreemap.org/planet');detailError=false;}
   detailGate.prepare({retry,allowMoving:true,zoomRange:{from:14.5,to:16.2}});
  }
 }
 function moveCamera(camera,duration,countryId=scope.country,campusId=scope.campus){
  // stop() emits moveend synchronously. Ignore that event while replacing a
  // destination; breadcrumbs remain usable throughout the short flight.
  const current=++navigationId,previousScope=scope;
  const originCampus=campusById.get(previousScope.campus);
  clearTimeout(randomPreloadTimer);
  campusOutbound.cancel();
  const retreat=previousScope.level==='campus'&&previousScope.campus!==campusId&&detailVisible
   &&getGlobeDetailOpacity(map)>0&&!reduced&&map.getZoom()>14.01;
  const retreatDuration=campusId?1400:2200;
  navigating=true;flight=true;map.stop();setGestures(false);
  setScope(countryId,campusId);
  detailGate.defer({preserveMoving:retreat});
  if(campusId){
   onStatus('loading');
   const campus=campusById.get(campusId);
   if(retreat){
    // Keep the visible origin protected until its real retreat is complete.
    // The target uses the one background slot, then select() promotes it.
    try{campusPreloader.anticipate(campus,{radiusKm:preloadRadius(campus)});}catch{/* Selected loading reports errors after retreat. */}
   }else preloadCampus(campus);
  }
  else {if(!retreat)campusPreloader.cancel();campusPreloader.cancelAnticipation();}
  const sameApproach=scope.level==='campus'&&previousScope.country===scope.country&&(!previousScope.campus||previousScope.campus===scope.campus);
  const concealBeforeFlight=detailVisible&&!sameApproach;
  flightTarget={...camera,duration,fromCampus:previousScope.level==='campus',stage:retreat?'outbound':'departure',deadline:performance.now()+duration+(retreat?retreatDuration:concealBeforeFlight&&!reduced?200:0)};
  navigating=false;
  emitView();
  const depart=()=>{
   if(destroyed||current!==navigationId||!flightTarget)return;
   // A resize during departure updates this destination without moving the
   // camera while the old detail fades. Never revive an obsolete destination.
   const destination=flightTarget;
   const needsApproach=Boolean(campusId)&&!reduced;
   const travelZoom=needsApproach?14.5:destination.zoom;
   const travelDuration=needsApproach?Math.max(1200,destination.duration-1600):destination.duration;
   flightTarget={...destination,stage:'travel',needsApproach,travelZoom,deadline:performance.now()+travelDuration};
   if(!campusId)campusPreloader.cancel();
   else if(retreat)preloadCampus(campusById.get(campusId));
   // World and country share the local base. Only a campus journey installs
   // and prepares the selected campus neighbourhood, never all campuses.
   const retryDetail=previousScope.campus!==campusId||detailGate.getState().phase==='error';
   if(campusId)detailGate.hide();
   prepareCampusDetail({retry:retryDetail});
   const target={center:destination.center,zoom:travelZoom,pitch:needsApproach?0:destination.pitch,padding,bearing:0,duration:reduced?0:travelDuration,essential:false};
   // Replacing the still-moving outbound ease emits moveend synchronously.
   // It belongs to that old segment, not to the new country/world journey.
   navigating=true;
   try{
    if(reduced)map.jumpTo(target);
    else map.flyTo({...target,curve:1.15,...(needsApproach?{easing:t=>t}:destination.easing?{easing:destination.easing}:{})});
   }finally{navigating=false;}
   if(reduced)finishFlight();
  };
  // Returning starts over the already cached neighbourhood. Blend while
  // retreating, then leave its bounded footprint only after detail is hidden.
  if(retreat)campusOutbound.start({duration:retreatDuration,center:originCampus?.coordinates}).then(done=>{if(done)depart();});
  else if(concealBeforeFlight&&!campusId)detailGate.fadeToLocal({duration:200}).then(done=>{if(done)depart();});
  else depart();
 }
 function coverageRadius(campus,minZoom=14.5){
  // Worst legal pitch is conservative at the minimum zoom; include every
  // viewport corner outside the centre's 3 km navigation disk.
  return Math.ceil(campusCoverageRadius(campus.coordinates,{width,height,padding,minZoom,maxPitch:34})*4)/4;
 }
 function preloadRadius(campus){
  return Math.ceil(Math.max(coverageRadius(campus),coverageRadius(campus,17.8)*Math.SQRT2*1.02)*4)/4;
 }
 function scheduleRandomAnticipation(){
  if(scope.previewCampus)return;
  clearTimeout(randomPreloadTimer);
  if(destroyed||!ready||worldRender.phase!=='ready'||worldPreparing||flight)return;
  if(scope.level==='campus'&&!campusPreloader.getState().ready)return;
  // The world and the selected destination always finish first. This loads
  // only raw data; it never installs layers, moves the camera or creates WebGL.
  randomPreloadTimer=setTimeout(()=>{
   if(destroyed||flight||worldPreparing||map.isMoving()||(scope.level==='campus'&&!campusPreloader.getState().ready))return;
   const campus=randomCandidate.peek();if(!campus)return;
   try{campusPreloader.anticipate(campus,{radiusKm:preloadRadius(campus)});}
   catch(error){options.onRandomCampusLoad?.({nextCampusId:campus.id,campusId:campus.id,phase:'error',ready:false,error:error.message});}
  },160);
 }
 function preloadCampus(campus){
  try{
   return campusPreloader.select(campus,{radiusKm:preloadRadius(campus)});
  }
  catch(error){onStatus('error');return Promise.resolve({ready:false,error:error.message});}
 }
 function beginCampusDescent(){
  const campus=campusById.get(scope.campus);
  flightTarget={...flightTarget,stage:'approach',travelZoom:17.8,deadline:performance.now()+2200};
  // Nonzero initial velocity joins the incoming camera without another ease-in.
  // The last portion slows continuously to the final stationary neighbourhood.
  const easing=t=>t<=.6?1.25*t:(()=>{const u=(t-.6)/.4;return .75+.5*u-.25*u*u;})();
  navigating=true;
  try{map.easeTo({center:campus.coordinates,zoom:17.8,pitch:34,padding,bearing:0,duration:2200,easing,essential:false});}
  finally{navigating=false;}
 }
 function finishFlight(){
  if(navigating||worldPreparing||['departure','outbound'].includes(flightTarget?.stage))return;
  // Neither the raw-radius download nor GPU preparation blocks a camera leg.
  // Late visible tiles can reveal after arrival without replaying the journey.
  if(flight){
   if(scope.level==='campus'&&flightTarget?.needsApproach&&flightTarget.stage==='travel'){
    beginCampusDescent();return;
   }
   flight=false;flightTarget=null;setGestures(true);
   if(scope.level==='campus'){
    if(detailGate.getState().phase==='moving')detailGate.finishZoomFade();
    else detailGate.refresh();
   }else detailGate.hide();
  }
  markersDirty=true;renderMarkers();emitView();refreshFade();
  scheduleRandomAnticipation();
 }
 function selectCountry(id){
  if(scope.previewCampus)return;
  const country=countries.get(id);if(!country||destroyed)return;
  moveCamera({center:country.center,zoom:countryZoom(country),pitch:0},1500,id,null);
 }
 function selectCampus(id,{retry=false}={}){
  if(scope.previewCampus&&scope.previewCampus!==id)return;
  const campus=campusById.get(id);if(!campus||destroyed)return;
  if(retry&&scope.campus===id){
   // Retrying a failed/partial raw radius does not replay the journey. Only a
   // failed visible source needs a new transparent readiness gate.
   preloadCampus(campus);
   if(detailError||detailGate.getState().phase==='error'){
    onStatus('loading');detailGate.hide();prepareCampusDetail({retry:true});
   }
   return;
  }
  if(!reduced&&flight&&scope.campus===id)return;
  if(!flight&&scope.campus===id){
   // Selecting the already displayed campus is navigation within its cached
   // neighbourhood, not a new load. Preserve the user's zoom and inclination.
   if(d3.geoDistance(map.getCenter().toArray(),campus.coordinates)>1e-7){
    map.stop();map.easeTo({center:campus.coordinates,padding,duration:reduced?0:650,essential:false});
   }
   return;
  }
  const betweenCampuses=scope.level==='campus'&&scope.campus!==id;
  const duration=betweenCampuses?campusJourneyDuration(d3.geoDistance(map.getCenter().toArray(),campus.coordinates)*6371.0088):2800;
  moveCamera({center:campus.coordinates,zoom:17.8,pitch:34,...(betweenCampuses?{easing:campusJourneyEasing}:{})},duration,campus.country,id);
 }
 function visitRandomCampus(){
  if(scope.previewCampus)return null;
  if(destroyed||!ready||worldRender.phase!=='ready')return null;
  const campus=randomCandidate.take();
  if(campus)selectCampus(campus.id);
  return campus;
 }
 function reset(){if(!scope.previewCampus)moveCamera({center:[6,18],zoom:worldZoom,pitch:0},2000,null,null);}
 function back(){if(scope.previewCampus)return;if(scope.campus)selectCountry(scope.country);else reset();}
 function zoomBy(factor){
  if(flight||!ready||!Number.isFinite(factor)||factor<=0)return;
  map.stop();const range=getNavigationZoomRange(navigationPolicy(),map.getCenter().lat);
  map.easeTo({zoom:clamp(map.getZoom()+Math.log2(factor)*2,range.min,range.max),duration:reduced?0:320,padding,essential:false});
 }
 function countryAt(coords){
  const feature=features.find(f=>countries.has(f.properties?.id||f.id)&&d3.geoContains(f,coords));
  const closest=campuses.map(c=>({campus:c,d:d3.geoDistance(c.coordinates,coords)})).filter(c=>c.d<.006).sort((a,b)=>a.d-b.d)[0]?.campus;
  return closest&&(!feature||!mappedCountries.has(closest.country))?closest.country:feature&&(feature.properties?.id||feature.id);
 }
 function syncMarkers(){
  for(const marker of markers.values()){marker.direction?.destroy();marker.holder.remove();}markers.clear();
  const list=scope.previewCampus?[{...campusById.get(scope.previewCampus),type:'campus'}]:scope.country?countries.get(scope.country).members.map(c=>({...c,type:'campus'})):[...countries.values()].map(c=>({...c,coordinates:c.center}));
  for(const entry of list){
   const holder=document.createElement('div');holder.className='hg-pin';
   const button=document.createElement('button');button.className='hg-marker';button.type='button';
   button.setAttribute('aria-label',options.markerLabel?.(entry)||entry.name);
   const dot=document.createElement('span');dot.className='hg-marker-dot';
   const label=document.createElement('span');label.className='hg-marker-label';label.dir='auto';label.textContent=options.formatPlace?.(entry.name,entry)||entry.name;
   button.append(dot,label);holder.append(button);
   const direction=entry.type==='campus'?createCampusDirection({holder,button,label}):null;
   button.addEventListener('click',event=>{
    event.stopPropagation();
    if(direction?.isOffscreen()&&entry.id===scope.campus){
     if(!flight&&!worldPreparing){map.stop();map.easeTo({center:entry.coordinates,padding,duration:reduced?0:650,essential:false});}
    }else if(entry.type==='campus'&&entry.id===scope.campus&&!flight&&!worldPreparing&&typeof options.onCampusDetails==='function'){
     // The visible selected marker opens its information. Keep the edge arrow
     // reserved for recentering, and let the information view manage its focus.
     options.onCampusDetails(campusById.get(entry.id));
     return;
    }else entry.type==='country'?selectCountry(entry.id):selectCampus(entry.id);
    container.focus({preventScroll:true});
   });
   // A pill is wider than its geographic point. Feed its wheel gesture to the
   // native handler at that point so zooming its label keeps the campus anchored.
   button.addEventListener('wheel',event=>{
    event.preventDefault();event.stopPropagation();
    const point=map.project(entry.coordinates),canvas=map.getCanvas(),rect=canvas.getBoundingClientRect();
    canvas.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,
     clientX:rect.left+point.x,clientY:rect.top+point.y,
     deltaX:event.deltaX,deltaY:event.deltaY,deltaZ:event.deltaZ,deltaMode:event.deltaMode,
     ctrlKey:event.ctrlKey,shiftKey:event.shiftKey,altKey:event.altKey,metaKey:event.metaKey}));
   },{passive:false});
   // One overlay owns projection, occlusion and positioning. Native Marker
   // previously repeated this work and scheduled an opacity RAF for every pin.
   map.getCanvasContainer().append(holder);
   markers.set(entry.id,{...entry,lngLat:maplibregl.LngLat.convert(entry.coordinates),button,holder,label,direction,width:0,visible:true,compact:null,selected:null,close:null});
  }
  markersDirty=true;renderMarkers();
 }
 function renderMarkers(){
  if(destroyed)return;
  const center=map.getCenter().toArray(),zoom=map.getZoom();
  const declutter=markersDirty||!map.isMoving();
  // Read sizes together, before any per-frame DOM writes.
  for(const marker of markers.values()){
   if(!marker.width&&!marker.button.hidden)marker.width=marker.label.offsetWidth+42;
  }
  const entries=[...markers.values()].map(marker=>({marker,distance:d3.geoDistance(marker.coordinates,center)}));
  if(declutter)entries.sort((a,b)=>Number(b.marker.id===scope.campus)-Number(a.marker.id===scope.campus)||a.distance-b.distance);
  const boxes=[];
  for(const {marker,distance} of entries){
   let p=map.project(marker.coordinates);const margin=marker.visible?8:18;
   const selected=marker.id===scope.campus,close=selected&&scope.level==='campus'&&!flight&&!worldPreparing&&zoom>13;
   let indicator=null;
   if(close){
    indicator=marker.direction.update({point:p,width,height,insetX:Math.min(width*.14,180)+36,insetY:Math.min(height*.18,150)+36,
     locale:document.documentElement.lang,campusName:marker.label.textContent});
    if(indicator.mode!=='hidden')p=indicator;
   }else if(marker.close)marker.direction.reset();
   // Same horizon test as Marker in the pinned MapLibre 5.24 renderer. The
   // perspective globe can hide a location before it reaches 90° longitude.
   const visible=indicator?.mode==='edge'||(indicator?.mode!=='hidden'&&p.x>margin&&p.x<width-margin&&p.y>margin&&p.y<height-margin&&distance<Math.PI/2-(marker.visible?.07:.12)&&!map.transform.isLocationOccluded(marker.lngLat));
   if(marker.visible!==visible){marker.visible=visible;marker.button.hidden=!visible;}
   if(!visible)continue;
   const position=`translate(${Math.round(p.x*2)/2}px,${Math.round(p.y*2)/2}px)`;
   if(marker.position!==position){marker.position=position;marker.holder.style.transform=position;}
   if(marker.selected!==selected){marker.selected=selected;marker.button.classList.toggle('hg-selected',selected);}
   if(marker.close!==close){marker.close=close;marker.button.classList.toggle('hg-target',close);}
   // Keep label choices stable while dragging/zooming. Repack at rest, rather
   // than alternating labels at collision boundaries on successive frames.
   if(declutter||marker.compact===null){
    const w=marker.width||140;
    const compact=!selected&&(!declutter||boxes.length>=(width<700?4:7)||boxes.some(b=>Math.abs(p.y-b.y)<50&&p.x-12<b.x+b.w&&p.x+w>b.x-12));
    if(marker.compact!==compact){marker.compact=compact;marker.button.classList.toggle('hg-compact',compact);}
    if(!compact)boxes.push({x:p.x,y:p.y,w});
   }
  }
  markersDirty=false;
 }
 function refreshFade(){
  const minimum=getNavigationZoomRange({level:'world',worldZoom},map.getCenter().lat).min;
  const amount=clamp((map.getZoom()-minimum)/1.2,0,1);
  const x=Math.round(Math.min(width*.14,180)*amount),y=Math.round(Math.min(height*.18,150)*amount),key=`${x}:${y}`;
  if(key===fadeKey)return;fadeKey=key;
  mapHost.classList.toggle('hg-faded',x>0||y>0);
  mapHost.style.setProperty('--hg-edge-fade-x',`${x}px`);
  mapHost.style.setProperty('--hg-edge-fade-y',`${y}px`);
 }
 function refreshLayout({animate=true}={}){
  if(destroyed)return;const pending=flightTarget&&{...flightTarget};
  const oldWidth=width,oldHeight=height,oldZoom=map.getZoom();
  const oldWorldMin=getNavigationZoomRange({level:'world',worldZoom},map.getCenter().lat).min;
  const worldOffset=oldZoom-oldWorldMin;
  readLayout();
  const key=`${width}:${height}:${centerPoint}:${worldZoom}`;
  if(key===layoutKey)return;layoutKey=key;markersDirty=true;
  const sizeChanged=width!==oldWidth||height!==oldHeight;
  let completeFlight=false,paddingChanged=false;
  if(pending?.stage==='outbound')campusOutbound.finishForLayout();
  // resize/jumpTo/flyTo can emit moveend synchronously while replacing their
  // camera state. None of those intermediate events finishes the journey.
  navigating=true;
  try{
   // GL 5.24 resets its canvas backing buffer even for an unchanged size.
   // Padding-only changes (panels/RTL) do not need that reset.
   if(sizeChanged)map.resize({horizonLayout:true});
   const currentPadding=map.getPadding();
   paddingChanged=['top','right','bottom','left'].some(side=>Math.abs(currentPadding[side]-padding[side])>1e-6);
   if(worldPreparing){
    if(paddingChanged)map.jumpTo({padding},{horizonLayout:true});
   }else if(pending){
    const zoom=scope.level==='world'?worldZoom:scope.level==='country'?countryZoom(countries.get(scope.country)):pending.zoom;
    flightTarget={...pending,zoom};
    if(pending.stage==='departure'||pending.stage==='outbound'){
     // Outbound detail was concealed before the new viewport. Its promise
     // continues the journey after this destination/layout update completes.
     // A stationary departure retains its existing fade timer unchanged.
     if(paddingChanged)map.jumpTo({padding},{horizonLayout:true});
    }else{
     // Retarget the existing flight without a new selection, preload, gate
     // generation or deadline. Continuous resizing must not extend the trip.
     const remaining=Math.max(0,pending.deadline-performance.now());
     const target={center:pending.center,zoom:scope.level==='campus'?(pending.travelZoom??zoom):zoom,pitch:pending.stage==='approach'?34:pending.needsApproach?0:pending.pitch,padding,bearing:0,essential:false};
     if(reduced||remaining===0){map.jumpTo(target);completeFlight=true;}
     else if(pending.stage==='approach')map.easeTo({...target,duration:remaining,easing:t=>t*(2-t)});
     else map.flyTo({...target,duration:remaining,curve:1.15,...(pending.needsApproach?{easing:t=>t}:pending.easing?{easing:pending.easing}:{})});
    }
   }else if(!ready&&scope.level==='world'){
    map.jumpTo({center:[6,18],zoom:worldZoom,padding},{horizonLayout:true});
   }else{
    const range=getNavigationZoomRange(navigationPolicy(),map.getCenter().lat);
    // Preserve the world's relative magnification and the user's local zoom;
    // a changed country fit only clamps the latter to its new legal range.
    const zoom=clamp(scope.level==='world'?range.min+worldOffset:oldZoom,range.min,range.max);
    const zoomChanged=Math.abs(map.getZoom()-zoom)>1e-8;
    if(paddingChanged||zoomChanged){
     const next={padding,...(zoomChanged?{zoom}:{}),essential:false};
     if(animate&&!reduced&&!sizeChanged)map.easeTo({...next,duration:550},{horizonLayout:true});
     else map.jumpTo(next,{horizonLayout:true});
    }
   }
  }finally{navigating=false;}
  if(completeFlight)finishFlight();
  renderMarkers();emitView();refreshFade();
  // Match MapLibre's own ResizeObserver: draw synchronously after resizing
  // AND the final camera/padding update, so no cleared canvas reaches paint.
  if(sizeChanged)map.redraw();
  if((sizeChanged||paddingChanged)&&scope.level==='campus'&&!flight)preloadCampus(campusById.get(scope.campus));
  scheduleRandomAnticipation();
 }
 /** Borrow this scene for a bounded campus dialog, keeping its WebGL/cache alive.
  * Capture before moving the container; start after mounting it, and restore
  * only after returning it to its original DOM position and dimensions. */
 function beginCampusPreview(id){
  const campus=campusById.get(id);
  if(!campus||destroyed||!ready||worldPreparing||worldRender.phase!=='ready'||campusPreview)return null;
  const saved={scope:{...scope},center:map.getCenter().toArray(),zoom:map.getZoom(),pitch:map.getPitch(),bearing:map.getBearing(),padding:{...map.getPadding()},width,height,detailError,
   destination:flight&&flightTarget?{...flightTarget,center:[...flightTarget.center]}:null};
  const session={started:false,closed:false};campusPreview=session;
  // This internal flag is omitted from the scope callback and never changes
  // the global route. It also prevents future markers/shortcuts escaping.
  scope={...scope,previewCampus:id};
  function stopJourney(){
   navigationId++;clearTimeout(randomPreloadTimer);randomPreloadTimer=0;
   cancelAnimationFrame(resizeFrame);resizeFrame=0;
   navigating=true;
   try{
    campusOutbound.cancel();flight=false;flightTarget=null;map.stop();
    detailGate.hide();campusPreloader.cancel();campusPreloader.cancelAnticipation();
   }finally{navigating=false;}
  }
  return {
   start(){
    if(destroyed||campusPreview!==session||session.closed||session.started||container.clientWidth<44||container.clientHeight<44)return false;
    session.started=true;stopJourney();
    // A deliberate new approach also works when Explorer already showed this
    // campus. Ordinary repeated selections outside this session remain intact.
    navigating=true;flight=true;
    try{
     setScope(campus.country,null);refreshLayout({animate:false});
     map.jumpTo({center:campus.coordinates,zoom:12.5,pitch:0,bearing:0,padding});
    }finally{navigating=false;flight=false;}
    selectCampus(id);return true;
   },
   restore(){
    if(destroyed||campusPreview!==session||session.closed)return false;
    session.closed=true;stopJourney();
    const oldWidth=width,oldHeight=height;
    navigating=true;flight=true;
    try{
     scope={...saved.scope};detailError=saved.detailError;readLayout();
     layoutKey=`${width}:${height}:${centerPoint}:${worldZoom}`;
     if(width!==oldWidth||height!==oldHeight)map.resize({horizonLayout:true});
     // A captured in-flight position can be outside its destination's legal
     // bounds. Restore that destination, never a stranded intermediate frame.
     const camera=saved.destination?{center:saved.destination.center,zoom:saved.destination.zoom,pitch:saved.destination.pitch,bearing:0}:saved;
     const resized=width!==saved.width||height!==saved.height;
     const target=saved.destination||resized?constrainNavigation({...navigationPolicy(),inFlight:false},camera.center,camera.zoom):null;
     map.jumpTo({center:target?[target.center.lng,target.center.lat]:camera.center,zoom:target?.zoom??camera.zoom,pitch:camera.pitch,bearing:camera.bearing,padding:resized?padding:saved.padding},{horizonLayout:true});
    }finally{navigating=false;flight=false;flightTarget=null;campusPreview=null;}
    setGestures(true);syncMarkers();lastView='';emitScope();refreshFade();
    if(scope.campus){preloadCampus(campusById.get(scope.campus));prepareCampusDetail({retry:!detailError});}
    else onStatus(detailError?'error':'ready');
    map.redraw();scheduleRandomAnticipation();
    // jumpTo emits moveend while restoration still guards camera callbacks.
    // Publish the settled state after clearing that guard for diagnostics.
    map.fire('horizonpreload');return true;
   },
  };
 }
 function setTheme(value){dark=Boolean(value);polarCap.setTheme(dark,{duration:reduced?0:450});if(ready&&dark!==appliedDark){applyGlobeTheme(map,dark);appliedDark=dark;}}
 function keyDown(event){
  if(event.target!==container)return;
  const steps={ArrowLeft:[-70,0],ArrowRight:[70,0],ArrowUp:[0,-70],ArrowDown:[0,70]};
  if(steps[event.key]){event.preventDefault();if(!flight)map.panBy(steps[event.key],{duration:reduced?0:220});}
  else if(['+','=','-'].includes(event.key)){event.preventDefault();zoomBy(event.key==='-'?.8:1.25);}
  else if(event.key==='Escape'){if(scope.previewCampus)return;event.preventDefault();back();}
  else if(event.key==='Home'){event.preventDefault();reset();}
 }
 function motionChanged(){reduced=motion.matches;if(reduced){if(scope.campus)selectCampus(scope.campus);else if(scope.country)selectCountry(scope.country);else reset();}}
 // MapLibre load follows the first rendered, loaded local view. The entry
 // overlay can wait on this callback while retaining this same map instance.
 map.on('load',async()=>{
  ready=true;worldPreparing=true;flight=true;map.addLayer(polarCap,'h42-world-border');setTheme(dark);
  try{
   await prepareWorldRender(map,{
    getView:()=>({center:[6,18],zoom:worldZoom,pitch:0,bearing:0,padding}),
    moveView(view){navigating=true;try{map.jumpTo(view);}finally{navigating=false;}},
    signal:worldPreparationController.signal,
    onProgress(state){worldRender=state;},
   });
   if(destroyed)return;
   worldPreparing=false;flight=false;markersDirty=true;renderMarkers();emitView();refreshFade();
   map.fire('horizonpreload');
   onStatus(detailError?'error':'ready');
   scheduleRandomAnticipation();
  }catch(error){if(!destroyed){worldPreparing=false;flight=false;worldRender={phase:'error',error:error.message};onStatus('error');}}
 });
 map.on('zoom',()=>{emitView();refreshFade();});
 // The renderer updates its globe/Mercator transform after camera events.
 // Project overlays after that update, including jumpTo/restoration frames.
 map.on('render',renderMarkers);
 map.on('projectiontransition',()=>{markersDirty=true;renderMarkers();});
 map.on('moveend',finishFlight);
 map.on('click',event=>{if(!flight&&scope.level==='world'){const id=countryAt(event.lngLat.toArray());if(id){selectCountry(id);container.focus({preventScroll:true});}}});
 map.on('error',event=>{
  const sourceId=event.sourceId??event.source?.id;
  const urban=sourceId==='openmaptiles'||/openfreemap/.test(event.error?.message||'');
  if(urban&&scope.level!=='campus'&&worldRender.phase==='ready'){detailError=true;return;}
  console.warn('Horizon map:',event.error?.message||'Map data unavailable');
  if(!detailError){detailError=true;onStatus('error');}
 });
 container.addEventListener('keydown',keyDown);
 motion.addEventListener('change',motionChanged);
 const resize=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>refreshLayout({animate:false}));});resize.observe(container);
 refreshLayout({animate:false});syncMarkers();emitScope();
 options.onRandomCampusLoad?.(getRandomCampusState());
 document.fonts.ready.then(()=>{if(!destroyed){for(const marker of markers.values())marker.width=0;markersDirty=true;renderMarkers();}});
 if(new URLSearchParams(location.search).get('perf')==='1')import('./perf-diagnostics.mjs?v=19').then(({attachGlobeDiagnostics})=>{if(!destroyed)attachGlobeDiagnostics(map,{container,reset,selectCampus,selectCountry,refreshLayout,getNavigationState});});
 return {selectCountry,selectCampus,visitRandomCampus,reset,back,zoomBy,refreshLayout,setTheme,getWorldScreenGeometry,beginCampusPreview,
  refreshLabels(){syncMarkers();},
  destroy(){destroyed=true;clearTimeout(randomPreloadTimer);worldPreparationController.abort();navigationId++;campusOutbound.destroy();detailGate.destroy();resize.disconnect();cancelAnimationFrame(resizeFrame);motion.removeEventListener('change',motionChanged);container.removeEventListener('keydown',keyDown);for(const marker of markers.values()){marker.direction?.destroy();marker.holder.remove();}map.remove();campusPreloader.destroy();mapHost.remove();credits.remove();container.classList.remove('hg-integrated');}
 };
}
