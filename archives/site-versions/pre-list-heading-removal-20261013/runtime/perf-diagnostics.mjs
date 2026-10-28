// Optional local diagnostics. The caller enables this module with ?perf=1.
export function attachGlobeDiagnostics(map, {container, reset, selectCampus, selectCountry, getNavigationState}) {
 const panel=document.createElement('aside');
 panel.id='globe-perf-panel';panel.setAttribute('aria-label','Mesures de fluidité du globe');
 Object.assign(panel.style,{position:'fixed',right:'12px',bottom:'90px',zIndex:'1000',width:'min(330px, calc(100vw - 24px))',boxSizing:'border-box',padding:'10px',borderRadius:'12px',border:'1px solid #779c9a',background:'rgba(245,252,250,.96)',color:'#203b3d',boxShadow:'0 4px 20px #0002',font:'11px/1.4 monospace',direction:'ltr'});
 const title=document.createElement('strong');title.textContent='Diagnostic local · perf=1';
 const actions=document.createElement('div');Object.assign(actions.style,{display:'flex',flexWrap:'wrap',gap:'6px',margin:'8px 0'});
 const rotationButton=document.createElement('button');rotationButton.type='button';rotationButton.textContent='Mesurer la rotation';
 const approachButton=document.createElement('button');approachButton.type='button';approachButton.textContent='Mesurer l’approche';
 const zoomOutButton=document.createElement('button');zoomOutButton.type='button';zoomOutButton.textContent='Vérifier le retour au monde';
 const limitsButton=document.createElement('button');limitsButton.type='button';limitsButton.textContent='Vérifier les limites';
 const campusButton=document.createElement('button');campusButton.type='button';campusButton.textContent='Vérifier le quartier';
 const buttons=[rotationButton,approachButton,zoomOutButton,limitsButton,campusButton];
 for(const button of buttons)Object.assign(button.style,{flex:'1 1 95px',font:'inherit',padding:'7px',border:'1px solid #8fb8b4',borderRadius:'7px',background:'#fff',color:'#203b3d',cursor:'pointer'});
 actions.append(...buttons);
 const status=document.createElement('div');status.setAttribute('role','status');status.textContent='Cadence et limites de navigation vérifiées séparément.';
 const output=document.createElement('pre');output.id='globe-perf-results';Object.assign(output.style,{margin:'8px 0 0',maxHeight:'min(32vh, 270px)',overflow:'auto',whiteSpace:'pre-wrap',overflowWrap:'anywhere',font:'10px/1.35 monospace'});
 const navigationOutput=document.createElement('pre');navigationOutput.id='globe-navigation-state';Object.assign(navigationOutput.style,{margin:'8px 0 0',maxHeight:'min(22vh, 170px)',overflow:'auto',whiteSpace:'pre-wrap',overflowWrap:'anywhere',font:'10px/1.35 monospace'});
 const collapse=document.createElement('button');collapse.type='button';collapse.textContent='Réduire';collapse.style.marginInlineStart='12px';collapse.addEventListener('click',()=>{const hidden=!actions.hidden;for(const el of [actions,status,navigationOutput,output])el.hidden=hidden;collapse.textContent=hidden?'Développer':'Réduire';});
 panel.append(title,collapse,actions,status,navigationOutput,output);document.body.append(panel);
 const results={version:5,renderer:rendererInfo(),runs:[],limits:[],campus:[]};output.textContent=JSON.stringify(results,null,2);
 let active=null,destroyed=false;
 const abortError=()=>new DOMException('Mesure annulée','AbortError');
 const round=value=>Math.round(value*100)/100;
 // Keep complete resource entries for these optional, repeated comparisons.
 performance.setResourceTimingBufferSize?.(5000);
 const workerTileResources=new Map();
 const detailTransitions=[];
 const localSources={};
 const surfaceEvents={resizes:0,contextLost:0,contextRestored:0};
 function sourceActivity(event){
  if(!event.sourceId)return;
  const item=localSources[event.sourceId]??={loading:0,content:0,tiles:[]};
  if(event.type==='sourcedataloading'){item.loading++;}
  if(event.type==='sourcedata'){
   item.content++;
   const id=event.tile?.tileID?.canonical;
   if(id){const key=`${event.tile.tileID.overscaledZ}:${id.z}/${id.x}/${id.y}`;if(!item.tiles.includes(key)){item.tiles.push(key);if(item.tiles.length>80)item.tiles.shift();}}
  }
 }
 function surfaceResize(){surfaceEvents.resizes++;}
 function contextLost(){surfaceEvents.contextLost++;}
 function contextRestored(){surfaceEvents.contextRestored++;}
 const transitionFrames={worldTravel:0,countryTravel:0,campusPreparation:0,stationaryFade:0,progressive:[],violations:[]};
 let fadeCamera=null;

 function navigationState(){return typeof getNavigationState==='function'?getNavigationState():null;}
 function isTileResource(entry){
  try{const url=new URL(entry.name);return url.hostname==='tiles.openfreemap.org'&&/^\/planet\/(?:[^/]+\/)?\d+\/\d+\/\d+\.pbf$/.test(url.pathname);}catch{return false;}
 }
 function resourceKey(entry){return `${entry.name}|${entry.startTime}|${entry.duration}`;}
 function collectWorkerResources(event){
  // Vector tiles are fetched in Web Workers, outside window.performance.
  // The map must enable collectResourceTiming when ?perf=1. GL 5.24 exposes
  // vector timings on event.tile; other source events may expose them directly.
  for(const entries of [event.resourceTiming,event.tile?.resourceTiming]){
   if(!Array.isArray(entries))continue;
   for(const entry of entries)if(isTileResource(entry))workerTileResources.set(resourceKey(entry),entry);
  }
 }
 function tileResources(){
  const entries=new Map(workerTileResources);
  for(const entry of performance.getEntriesByType('resource'))if(isTileResource(entry))entries.set(resourceKey(entry),entry);
  return [...entries.values()];
 }
 function showNavigationState(){
  if(destroyed)return;
  const resources=tileResources();
  const sized=resources.filter(entry=>entry.encodedBodySize>0);
  navigationOutput.textContent=JSON.stringify({...navigationState(),localSources,surfaceEvents,remoteTileRequests:resources.length,workerTileRequests:workerTileResources.size,
   remoteEncodedBytes:resources.length&&!sized.length?null:sized.reduce((sum,entry)=>sum+entry.encodedBodySize,0),resourcesWithKnownSize:sized.length,detailTransitions,transitionFrames,
   remoteTileRequestExamples:[...new Set(resources.map(entry=>entry.name))].slice(-3),requestMetric:'Requêtes de tuiles terminées observées (workers et fenêtre), cache inclus ; hors fontes et TileJSON. Tailles encodées lorsqu’elles sont exposées par le serveur.'},null,2);
 }
 function detailChanged(){
  const state=navigationState();
  detailTransitions.push({level:state.level,inFlight:state.inFlight,flightStage:state.flightStage,center:state.center,zoom:state.zoom,detail:state.detail,tilesLoaded:map.areTilesLoaded(),atMs:round(performance.now())});
  if(detailTransitions.length>12)detailTransitions.shift();showNavigationState();
 }
 function checkTransitionFrame(){
  const state=navigationState();if(!state)return;
  // Tiny DOM-readable live sample for visual QA. The full report is only
  // refreshed at milestones; it must not be mistaken for the current frame.
  panel.dataset.frame=JSON.stringify({stage:state.flightStage,zoom:round(state.zoom),opacity:round(state.detailOpacity),renderedDetail:state.renderedDetail});
  const problem=reason=>{if(transitionFrames.violations.length<8)transitionFrames.violations.push({reason,level:state.level,flightStage:state.flightStage,detail:state.detail});};
  if(state.flightStage==='travel'&&state.level==='world'){
   transitionFrames.worldTravel++;
   if(state.detailVisible||state.detail.opacityTarget!==0)problem('Detail visible during world return');
  }
  if(state.level==='country'&&!['departure','outbound'].includes(state.flightStage)){
   if(state.flightStage==='travel')transitionFrames.countryTravel++;
   if(state.detailVisible||state.detail.opacityTarget!==0)problem('Remote detail visible at country level');
  }
  if(state.flightStage==='travel'&&state.level==='campus'&&state.detail.phase==='waiting')transitionFrames.campusPreparation++;
  if(['approach','outbound'].includes(state.flightStage)){
   if(state.detailOpacity>.05&&state.renderedDetail){
    if(state.renderedDetail.covered||state.renderedDetail.canvasVisibility==='hidden')problem('Moving detail covered by preparation surface');
    const water=state.renderedDetail.paints?.['h42-water'];
    if(state.detail.phase==='moving'&&water&&(water.hidden||water.opacity===0))problem('Moving detail requested but evaluated paint invisible');
   }
   const previous=transitionFrames.progressive.at(-1);
   if(!previous||previous.stage!==state.flightStage||Math.abs(previous.zoom-state.zoom)>=.15){
    transitionFrames.progressive.push({stage:state.flightStage,atMs:round(performance.now()),zoom:round(state.zoom),opacity:round(state.detailOpacity),renderedDetail:state.renderedDetail,moving:map.isMoving(),tilesLoaded:map.areTilesLoaded()});
    if(transitionFrames.progressive.length>48)transitionFrames.progressive.shift();
   }
  }
  if(state.detail.phase==='fading'){
   transitionFrames.stationaryFade++;
   const camera=[...state.center,state.zoom,map.getPitch()];
   if(map.isMoving()||(fadeCamera&&camera.some((value,i)=>Math.abs(value-fadeCamera[i])>.00001)))problem('Camera moved before detail fade finished');
   fadeCamera=camera;
  }else fadeCamera=null;
 }

 function rendererInfo(){
  try{
   // Retrieve the existing context: no extra canvas, context attributes, or renderer.
   const canvas=map.getCanvas(),gl=canvas.getContext('webgl2')||canvas.getContext('webgl');
   if(!gl)return {available:false};
   const extension=gl.getExtension('WEBGL_debug_renderer_info');
   return {available:true,version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(gl.RENDERER),unmaskedVendor:extension?gl.getParameter(extension.UNMASKED_VENDOR_WEBGL):null,unmaskedRenderer:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):null,contextAttributes:gl.getContextAttributes()};
  }catch(error){return {available:false,reason:error.message};}
 }
 function cameraAssertions(){
  const canvas=map.getCanvas(),padding=map.getPadding(),point=map.project(map.getCenter());
  const expected={x:(canvas.clientWidth+padding.left-padding.right)/2,y:(canvas.clientHeight+padding.top-padding.bottom)/2};
  const errorPx=Math.hypot(point.x-expected.x,point.y-expected.y),epsilonPx=1,pitchToleranceDegrees=.01;
  const state=navigationState();
  return {pitchAtWorld:{pass:Math.abs(map.getPitch())<=pitchToleranceDegrees,actualDegrees:map.getPitch(),expectedDegrees:0,toleranceDegrees:pitchToleranceDegrees},cameraCenter:{pass:errorPx<=epsilonPx,actual:{x:round(point.x),y:round(point.y)},expected:{x:round(expected.x),y:round(expected.y)},padding,errorPx:round(errorPx),epsilonPx},...(state?{worldLevel:{pass:state.level==='world'&&!state.country&&!state.campus&&!state.inFlight,actual:state.level,inFlight:state.inFlight}}:{})};
 }

 function snapshot(){
  const canvas=map.getCanvas(),rect=canvas.getBoundingClientRect(),center=map.getCenter();
  return {viewport:{width:innerWidth,height:innerHeight},container:{width:container.clientWidth,height:container.clientHeight},canvas:{cssWidth:round(rect.width),cssHeight:round(rect.height),width:canvas.width,height:canvas.height},devicePixelRatio,configuredPixelRatio:map.getPixelRatio(),effectivePixelRatio:{x:round(canvas.width/Math.max(1,rect.width)),y:round(canvas.height/Math.max(1,rect.height))},camera:{center:[round(center.lng),round(center.lat)],zoom:round(map.getZoom()),pitch:round(map.getPitch()),bearing:round(map.getBearing())}};
 }
 function visible(signal){
  if(signal.aborted)return Promise.reject(abortError());
  if(!document.hidden)return Promise.resolve();
  return new Promise((resolve,reject)=>{
   const clear=()=>{document.removeEventListener('visibilitychange',change);signal.removeEventListener('abort',abort);};
   const change=()=>{if(!document.hidden){clear();resolve();}};
   const abort=()=>{clear();reject(abortError());};
   document.addEventListener('visibilitychange',change);signal.addEventListener('abort',abort,{once:true});
  });
 }
 function settle(signal,timeoutMs=3000){
  return new Promise((resolve,reject)=>{
   const start=performance.now();let stillSince=null,frame=0,completed=false;
   const cleanup=()=>{cancelAnimationFrame(frame);clearTimeout(timeout);signal.removeEventListener('abort',abort);};
   const finish=timedOut=>{if(completed)return;completed=true;cleanup();resolve({durationMs:round(performance.now()-start),timedOut,tilesLoaded:map.areTilesLoaded(),cameraMoving:map.isMoving()});};
   const abort=()=>{if(completed)return;completed=true;cleanup();reject(abortError());};
   const tick=now=>{
    const state=navigationState();
    if(!state?.inFlight&&!map.isMoving()&&map.areTilesLoaded()&&(state?.level!=='campus'||state.detail.phase==='detail'))stillSince??=now;else stillSince=null;
    if(stillSince!==null&&now-stillSince>=250)finish(false);else frame=requestAnimationFrame(tick);
   };
   const timeout=setTimeout(()=>finish(true),timeoutMs);
   signal.addEventListener('abort',abort,{once:true});
   if(signal.aborted)abort();else frame=requestAnimationFrame(tick);
  });
 }
 async function sample(kind,signal){
  const startedAt=performance.now(),startView=snapshot(),deltas=[],tasks=[];
  const mutations={records:0,attributes:0,style:0,class:0,hidden:0,otherAttributes:0,childList:0,addedNodes:0,removedNodes:0};
  let previous=null,frame=0,renderCount=0,endedAt=null,completion='moveend';
  const render=()=>{renderCount++;};
  const countMutations=records=>{for(const record of records){mutations.records++;if(record.type==='attributes'){mutations.attributes++;if(['style','class','hidden'].includes(record.attributeName))mutations[record.attributeName]++;else mutations.otherAttributes++;}else if(record.type==='childList'){mutations.childList++;mutations.addedNodes+=record.addedNodes.length;mutations.removedNodes+=record.removedNodes.length;}}};
  const observer=new MutationObserver(countMutations);observer.observe(container,{subtree:true,attributes:true,childList:true});
  let taskObserver=null;
  try{if(globalThis.PerformanceObserver?.supportedEntryTypes?.includes('longtask')){taskObserver=new PerformanceObserver(list=>tasks.push(...list.getEntries()));taskObserver.observe({type:'longtask'});}}catch{taskObserver=null;}
  const tick=now=>{if(previous!==null)deltas.push(now-previous);previous=now;frame=requestAnimationFrame(tick);};
  map.on('render',render);frame=requestAnimationFrame(tick);
  try{
   await new Promise((resolve,reject)=>{
    let finished=false;
    const clear=()=>{clearTimeout(timeout);map.off('moveend',end);signal.removeEventListener('abort',abort);};
    const end=()=>{if(finished)return;finished=true;clear();resolve();};
    const abort=()=>{if(finished)return;finished=true;clear();reject(abortError());};
    const timeout=setTimeout(()=>{completion='timeout';end();},kind==='approach'?6500:4800);
    map.on('moveend',end);signal.addEventListener('abort',abort,{once:true});
    if(signal.aborted){abort();return;}
    try{
     if(kind==='rotation')map.easeTo({center:[55,18],duration:3000,easing:t=>t,essential:false});
     // Scope changes are explicit now: wheel zoom intentionally stays bounded.
     else if(kind==='zoom-out')reset();
     else selectCampus('paris');
    }catch(error){finished=true;clear();reject(error);}
   });
   endedAt=performance.now();cancelAnimationFrame(frame);map.off('render',render);
   countMutations(observer.takeRecords());observer.disconnect();
   // Allow the final performance entry to be delivered, without counting this wait.
   await new Promise(resolve=>setTimeout(resolve,0));
   if(signal.aborted)throw abortError();
   if(taskObserver)tasks.push(...taskObserver.takeRecords());
   const sorted=[...deltas].sort((a,b)=>a-b);
   const percentile=p=>sorted.length?round(sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*p)-1)]):null;
   const relevantTasks=tasks.filter(entry=>entry.startTime<endedAt&&entry.startTime+entry.duration>startedAt);
   const motionPreference=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const durationMs=endedAt-startedAt,minimumIntervals=Math.max(30,Math.floor(durationMs/100));
   const enoughSamples=deltas.length>=minimumIntervals;
   const quality={usableForCadenceComparison:enoughSamples&&!motionPreference&&completion==='moveend',insufficientSamples:!enoughSamples,minimumIntervals,documentVisible:!document.hidden,documentFocused:document.hasFocus(),note:!enoughSamples?'Échantillonnage insuffisant (moins de 30 intervalles rAF par 3 s) : limitation de cadence possible, même si document.hidden vaut false ; aucun FPS déduit.':motionPreference?'Préférence de mouvement réduit active : déplacement potentiellement raccourci.':'Cadence observée via rAF, sans mesure du temps GPU ni preuve de performance sur téléphone.'};
   return {kind,recordedAt:new Date().toISOString(),completion,motionPreference,quality,timing:{durationMs:round(durationMs),rafIntervals:deltas.length,medianMs:percentile(.5),p95Ms:percentile(.95),maxMs:sorted.length?round(sorted.at(-1)):null,over33ms:deltas.filter(delta=>delta>33).length,over33Percent:deltas.length?round(deltas.filter(delta=>delta>33).length/deltas.length*100):null,mapRenderCount:renderCount},longTasks:{supported:Boolean(taskObserver),count:relevantTasks.length,totalDurationMs:round(relevantTasks.reduce((sum,entry)=>sum+entry.duration,0)),maxDurationMs:round(relevantTasks.reduce((max,entry)=>Math.max(max,entry.duration),0))},mutations,start:startView,end:snapshot(),...(kind==='zoom-out'?{assertions:cameraAssertions()}:{})};
  }finally{cancelAnimationFrame(frame);map.off('render',render);observer.disconnect();taskObserver?.disconnect();}
 }
 async function run(kind){
  if(active||destroyed)return;
  const controller=new AbortController();active=controller;
  for(const button of buttons)button.disabled=true;
  const hidden=()=>{if(document.hidden)controller.abort();};
  try{
   status.textContent=document.hidden?'En attente d’un onglet visible…':kind==='zoom-out'?'Approche de Paris avant le retour au monde…':'Retour au monde et stabilisation…';
   await visible(controller.signal);document.addEventListener('visibilitychange',hidden);
   if(kind==='zoom-out')selectCampus('paris');else reset();
   const preparation=await settle(controller.signal,kind==='zoom-out'?6000:3000);
   if(controller.signal.aborted)throw abortError();
   // A timed-out network must not leave the preceding flight moving underneath the benchmark.
   map.stop();if(kind!=='zoom-out')map.jumpTo({center:[6,18],pitch:0,bearing:0});
   status.textContent=kind==='rotation'?'Mesure de la rotation (3 s)…':kind==='zoom-out'?'Retour au monde via la navigation de l’application…':'Mesure de l’approche vers 42 Paris…';
   const result=await sample(kind,controller.signal);result.preparation=preparation;
   results.runs.push(result);if(results.runs.length>6)results.runs.shift();output.textContent=JSON.stringify(results,null,2);
   const name=kind==='rotation'?'Rotation':kind==='zoom-out'?'Retour au monde':'Approche';
   status.textContent=`${name} : médiane ${result.timing.medianMs??'—'} ms · p95 ${result.timing.p95Ms??'—'} ms.${result.quality.insufficientSamples?' Échantillonnage insuffisant.':''}${result.assertions?` Contrôles caméra : ${Object.values(result.assertions).every(check=>check.pass)?'réussis':'échec'}.`:''}`;
   if(kind==='rotation'){reset();await settle(controller.signal);}
  }catch(error){
   if(!destroyed)status.textContent=error.name==='AbortError'?'Mesure annulée : l’onglet a été masqué ou le diagnostic arrêté.':`Mesure interrompue : ${error.message}`;
   map.stop();
  }finally{document.removeEventListener('visibilitychange',hidden);active=null;if(!destroyed)for(const button of buttons)button.disabled=false;}
 }

 async function verifyLimits(){
  if(active||destroyed)return;
  if(typeof getNavigationState!=='function'||typeof selectCountry!=='function'){
   status.textContent='Le moteur ne fournit pas encore son état de navigation.';return;
  }
  const controller=new AbortController();active=controller;
  const hidden=()=>{if(document.hidden)controller.abort();};
  const report={recordedAt:new Date().toISOString(),kind:'navigation-limits',steps:[]};
  for(const button of buttons)button.disabled=true;
  const near=(actual,expected)=>Number.isFinite(actual)&&Number.isFinite(expected)&&Math.abs(actual-expected)<=.01;
  const stable=state=>({pass:state.inFlight===false&&!map.isMoving(),inFlight:state.inFlight,cameraMoving:map.isMoving()});
  const record=(name,settlement,assertions)=>{
   const state=navigationState();
   const checks={...assertions,settled:stable(state)};
   report.steps.push({name,settlement,state,assertions:checks,pass:Object.values(checks).every(check=>check.pass)});
  };
  const perform=async(action,timeoutMs)=>{
   if(controller.signal.aborted)throw abortError();action();
   const settlement=await settle(controller.signal,timeoutMs);
   if(controller.signal.aborted)throw abortError();
   return settlement;
  };
  try{
   await visible(controller.signal);document.addEventListener('visibilitychange',hidden);
   status.textContent='Limites : préparation du monde…';
   report.preparation=await perform(reset,3500);
   const world=navigationState();
   let settlement=await perform(()=>map.jumpTo({zoom:99}),1200),state=navigationState();
   record('world-maximum',settlement,{
    level:{pass:state.level==='world'&&!state.country&&!state.campus,actual:state.level},
    zoom:{pass:near(map.getZoom(),world.maxZoom),actual:map.getZoom(),expected:world.maxZoom},
    localBackground:{pass:state.detailVisible===false,detailVisible:state.detailVisible},
   });
   settlement=await perform(()=>map.jumpTo({zoom:-99}),1200);state=navigationState();
   record('world-minimum',settlement,{
    level:{pass:state.level==='world'&&!state.country&&!state.campus,actual:state.level},
    zoom:{pass:near(map.getZoom(),world.minZoom),actual:map.getZoom(),expected:world.minZoom},
   });

   status.textContent='Limites : pays sélectionné, déplacement et zoom extrêmes…';
   await perform(()=>selectCountry('FRA'),4500);
   const country=navigationState();
   settlement=await perform(()=>map.jumpTo({center:[139.7,35.7],zoom:99}),1500);state=navigationState();
   record('country-stays-selected',settlement,{
    level:{pass:state.level==='country'&&state.country==='FRA'&&!state.campus,actual:{level:state.level,country:state.country,campus:state.campus}},
    zoom:{pass:near(map.getZoom(),country.maxZoom),actual:map.getZoom(),expected:country.maxZoom},
    localBackground:{pass:state.detailVisible===false&&state.detail.opacityTarget===0,detailVisible:state.detailVisible,opacityTarget:state.detail.opacityTarget},
   });

   status.textContent='Limites : rayon de 3 km autour de 42 Paris…';
   await perform(()=>selectCampus('paris'),45000);
   const campus=navigationState(),origin=[...campus.center];
   settlement=await perform(()=>map.jumpTo({center:[origin[0]+1,origin[1]],zoom:-99}),1500);state=navigationState();
   record('campus-distance-and-minimum',settlement,{
    level:{pass:state.level==='campus'&&state.campus==='paris'&&state.country==='FRA',actual:{level:state.level,country:state.country,campus:state.campus}},
    zoom:{pass:near(map.getZoom(),campus.minZoom),actual:map.getZoom(),expected:campus.minZoom},
    radius:{pass:Number.isFinite(state.campusDistanceKm)&&state.campusDistanceKm<=3.001,actualKm:state.campusDistanceKm,maximumKm:3,toleranceKm:.001},
   });

   status.textContent='Limites : retour explicite au monde…';
   settlement=await perform(reset,3500);state=navigationState();
   record('return-to-world',settlement,{
    ...cameraAssertions(),
    localBackground:{pass:state.detailVisible===false,detailVisible:state.detailVisible},
   });
   report.pass=report.steps.every(step=>step.pass);
   status.textContent=`Limites de navigation : ${report.pass?'réussies':'échec — voir les assertions'}.`;
  }catch(error){
   report.pass=false;report.error={name:error.name,message:error.message};map.stop();
   if(!destroyed)status.textContent=error.name==='AbortError'?'Vérification annulée : l’onglet a été masqué.':`Vérification interrompue : ${error.message}`;
  }finally{
   document.removeEventListener('visibilitychange',hidden);active=null;
   if(!destroyed){results.limits.push(report);if(results.limits.length>3)results.limits.shift();output.textContent=JSON.stringify(results,null,2);for(const button of buttons)button.disabled=false;}
  }
 }
 async function verifyCampus(){
  if(active||destroyed)return;
  const controller=new AbortController();active=controller;
  const report={kind:'progressive-campus-pan',steps:[]};
  for(const button of buttons)button.disabled=true;
  try{
   status.textContent='Quartier : préparation de Paris…';selectCampus('paris');
   const initial=await settle(controller.signal,45000),state=navigationState();
   if(initial.timedOut||state.detail.phase!=='detail')throw new Error('Campus view not ready');
   report.initialPreparation={mode:state.campusRender?.mode??'unknown',rawRadiusReady:Boolean(state.campusPreload.ready)};
   const origin=[...state.center],start={...state.campusPreload};
   let incompleteFrames=0,frames=0;
   const rendered=()=>{frames++;if(!map.areTilesLoaded())incompleteFrames++;};
   map.on('render',rendered);
   try{
    for(let i=0;i<8;i++){
     status.textContent=`Quartier : déplacement ${i+1}/8…`;
     const a=i*Math.PI/4,d=2.8/111.195;
     map.easeTo({center:[origin[0]+Math.cos(a)*d/Math.cos(origin[1]*Math.PI/180),origin[1]+Math.sin(a)*d],duration:1200,essential:true});
     const settlement=await settle(controller.signal,5000);
     const after=navigationState();report.steps.push({center:after.center,distanceKm:after.campusDistanceKm,settlement,networkTiles:after.campusPreload.networkTiles,rendererRequests:after.campusPreload.rendererRequests});
    }
   }finally{map.off('render',rendered);}
   const end=navigationState().campusPreload;
   report.result={frames,incompleteFrames,newNetworkTiles:end.networkTiles-start.networkTiles,newRendererRequests:end.rendererRequests-start.rendererRequests};
   // Progressive mode guarantees neither a decoded full disk nor zero future
   // requests. Report both costs, independently from navigation correctness.
   report.pass=report.steps.every(step=>!step.settlement.timedOut&&step.distanceKm<=3.001);
   map.easeTo({center:origin,duration:700});await settle(controller.signal,3000);
   status.textContent=report.pass?`Quartier : huit déplacements dans les limites ; ${report.result.newNetworkTiles} téléchargements et ${report.result.newRendererRequests} demandes de rendu supplémentaires.`:'Quartier : navigation incomplète — voir les mesures.';
  }catch(error){report.pass=false;report.error=error.message;status.textContent=`Quartier : ${error.message}`;}
  finally{active=null;if(!destroyed){results.campus.push(report);if(results.campus.length>3)results.campus.shift();output.textContent=JSON.stringify(results,null,2);for(const button of buttons)button.disabled=false;showNavigationState();}}
 }
 const rotate=()=>run('rotation'),approach=()=>run('approach'),zoomOut=()=>run('zoom-out');
 rotationButton.addEventListener('click',rotate);approachButton.addEventListener('click',approach);zoomOutButton.addEventListener('click',zoomOut);limitsButton.addEventListener('click',verifyLimits);campusButton.addEventListener('click',verifyCampus);
 map.on('render',checkTransitionFrame);map.on('sourcedata',collectWorkerResources);map.on('moveend',showNavigationState);map.on('horizondetail',detailChanged);map.on('horizonpreload',showNavigationState);showNavigationState();
 map.on('sourcedataloading',sourceActivity);map.on('sourcedata',sourceActivity);map.on('resize',surfaceResize);map.on('webglcontextlost',contextLost);map.on('webglcontextrestored',contextRestored);
 return {measureRotation:rotate,measureApproach:approach,measureZoomOut:zoomOut,verifyLimits,cancel(){active?.abort();},destroy(){destroyed=true;active?.abort();rotationButton.removeEventListener('click',rotate);approachButton.removeEventListener('click',approach);zoomOutButton.removeEventListener('click',zoomOut);limitsButton.removeEventListener('click',verifyLimits);campusButton.removeEventListener('click',verifyCampus);map.off('render',checkTransitionFrame);map.off('sourcedata',collectWorkerResources);map.off('moveend',showNavigationState);map.off('horizondetail',detailChanged);map.off('horizonpreload',showNavigationState);map.off('sourcedataloading',sourceActivity);map.off('sourcedata',sourceActivity);map.off('resize',surfaceResize);map.off('webglcontextlost',contextLost);map.off('webglcontextrestored',contextRestored);workerTileResources.clear();panel.remove();}};
}
