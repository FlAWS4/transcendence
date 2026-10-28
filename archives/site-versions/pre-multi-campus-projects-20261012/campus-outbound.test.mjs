import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createCampusOutbound} from './campus-outbound.mjs';
import {campusCoverageRadius} from './campus-preload.mjs';
import {createGlobeStyle,setGlobeDetailOpacity,getGlobeDetailOpacity} from './globe-style.mjs';

function fixture({zoom=17.8,reduced=false,opacity=1}={}){
 const calls=[],map=new EventEmitter();map.getZoom=()=>zoom;
 const style=createGlobeStyle(false,[]);
 map.getLayer=id=>style.layers.find(layer=>layer.id===id);
 map.getPaintProperty=(id,key)=>map.getLayer(id).paint?.[key];
 map.setPaintProperty=(id,key,value)=>{map.getLayer(id).paint[key]=value;};
 map.easeTo=camera=>{calls.push(['camera',camera]);map.emit('move');};
 const gate={beginZoomFade:(range,options)=>{calls.push(['zoom-fade',range,options.opacity]);return setGlobeDetailOpacity(map,options.opacity,{zoomRange:range});},
  hide:()=>calls.push(['hide']),defer:()=>calls.push(['defer'])};
 const outbound=createCampusOutbound(map,{detailGate:gate,reducedMotion:()=>reduced,getOpacity:()=>opacity});
 return {map,gate,calls,outbound,move(nextZoom){zoom=nextZoom;map.emit('move');}};
}
const flush=()=>Promise.resolve();

test('the retreat preserves full detail through zoom16.6 and only hands off after the fade reaches zero at14.5',async()=>{
 const f=fixture(),result=f.outbound.start();
 assert.deepEqual(f.calls[0],['zoom-fade',{from:14.5,to:16.6},1]);
 const camera=f.calls[1][1];assert.equal(camera.zoom,14.5);assert.equal(camera.pitch,0);assert.equal(camera.duration,2200);
 assert.ok(!('center'in camera));
 for(const zoom of[17.7,17,16,15.5,15]){f.move(zoom);assert.equal(f.calls.length,2);}
 let done=false;result.then(()=>{done=true;});await flush();assert.equal(done,false);
 f.move(14.5);assert.equal(await result,true);assert.deepEqual(f.calls.at(-1),['hide']);
 assert.equal(f.map.listenerCount('move'),0);assert.equal(f.map.listenerCount('moveend'),0);f.outbound.destroy();
});
test('elapsed time alone cannot fade a stalled view, and a cancelled approach keeps its current partial opacity',async()=>{
 const f=fixture({opacity:.4}),result=f.outbound.start();
 assert.equal(f.calls[0][2],.4);
 f.move(17.7);f.map.emit('moveend');await flush();assert.equal(f.calls.length,2);
 f.move(14.5);assert.equal(await result,true);f.outbound.destroy();
});
test('a low retreat without a valid origin keeps the conservative existing limit',async()=>{
 const f=fixture({zoom:14.8}),result=f.outbound.start();
 assert.deepEqual(f.calls[0][1],{from:14.5,to:14.8});assert.equal(f.calls[1][1].zoom,14.5);
 f.move(14.6);assert.equal(f.calls.length,2);f.move(14.5);assert.equal(await result,true);f.outbound.destroy();
});
test('the manual minimum still retreats with full detail initially, recentres and stays above source zoom14',async()=>{
 const center=[2.31838649,48.896685275],f=fixture({zoom:14.5}),result=f.outbound.start({center});
 assert.deepEqual(f.calls[0],['zoom-fade',{from:14.01,to:14.5},1]);
 const camera=f.calls[1][1];assert.equal(camera.zoom,14.01);assert.equal(camera.pitch,0);
 assert.equal(camera.duration,2200);assert.deepEqual(camera.center,center);
 assert.equal(getGlobeDetailOpacity(f.map),1,'the start frame retains fully visible streets');
 assert.ok(!f.calls.some(([name])=>name==='hide'));
 f.move(14.255);assert.ok(Math.abs(getGlobeDetailOpacity(f.map)-.5)<1e-10);
 assert.ok(!f.calls.some(([name])=>name==='hide'));
 f.move(14.01);assert.equal(getGlobeDetailOpacity(f.map),0);assert.equal(await result,true);
 assert.ok(2**(14.5-camera.zoom)>1.4);assert.equal(f.calls.at(-1)[0],'hide');f.outbound.destroy();
});
test('relative low-zoom retreat retains the shorter campus duration and high-zoom framing remains unchanged',async()=>{
 const f=fixture({zoom:14.8}),result=f.outbound.start({duration:1400,center:[2.3,48.9]});
 assert.equal(f.calls[1][1].zoom,14.05);assert.equal(f.calls[1][1].duration,1400);
 assert.equal(getGlobeDetailOpacity(f.map),1);f.move(14.05);assert.equal(await result,true);f.outbound.destroy();
 const high=fixture(),pending=high.outbound.start({center:[2.3,48.9]});
 assert.equal(high.calls[1][1].zoom,14.5);assert.ok(!('center' in high.calls[1][1]));
 high.move(14.5);assert.equal(await pending,true);high.outbound.destroy();
});
test('recentring low retreats fits inside the existing raw disk even when starting at its 3km navigation edge',()=>{
 const campuses=JSON.parse(readFileSync(new URL('./PRELOAD_ESTIMATE.json',import.meta.url),'utf8')).counts.campuses;
 const viewports=[
  {width:1051.2,height:668,padding:{left:105.12}},
  {width:1051.2,height:668,padding:{right:105.12}},
  {width:1387,height:772,padding:{left:138.7}},
  {width:390,height:429,padding:{}},
 ];
 for(const campus of campuses)for(const viewport of viewports){
  const cachedRadius=campusCoverageRadius(campus.coordinates,{...viewport,minZoom:14.5,maxPitch:34});
  for(const startZoom of[14.5,14.8,15.2]){
   const f=fixture({zoom:startZoom});f.outbound.start({center:campus.coordinates});
   const endZoom=f.calls[1][1].zoom,finalScale=2**(endZoom-startZoom);
   // MapLibre 5.24 MercatorCameraHelper.handleEaseTo recentres by
   // k * base^(1-k), not linearly. k is the eased camera progress.
   for(let step=0;step<=100;step++){
    const k=step/100,remainingOffset=3*(1-k*Math.max(.5,finalScale)**(1-k));
    const footprint=campusCoverageRadius(campus.coordinates,{...viewport,
     minZoom:startZoom+(endZoom-startZoom)*k,maxPitch:34*(1-k)})-3;
    assert.ok(remainingOffset+footprint<=cachedRadius+1e-8,`${campus.id} ${viewport.width}px z${startZoom}, progress ${k}`);
   }
   f.outbound.destroy();
  }
 }
});
test('replacement removes all old listeners and no late move can resume the old destination',async()=>{
 const f=fixture(),first=f.outbound.start();f.move(17.2);f.outbound.cancel();assert.equal(await first,false);
 const before=f.calls.length;f.move(14.5);f.map.emit('moveend');assert.equal(f.calls.length,before);
 f.move(17.8);const second=f.outbound.start();f.outbound.cancel();assert.equal(await second,false);f.outbound.destroy();
});
test('resize conceals synchronously before handing control back without extending preload radius',async()=>{
 const f=fixture(),result=f.outbound.start();f.move(17.7);
 f.outbound.finishForLayout();assert.equal(f.calls.at(-1)[0],'hide');assert.equal(await result,true);
 assert.equal(f.calls.filter(([name])=>name==='camera').length,1);
 f.map.emit('moveend');assert.equal(f.calls.at(-1)[0],'hide');f.outbound.destroy();
});
test('reduced motion hides before returning and destruction never leaves a delayed callback',async()=>{
 const reduced=fixture({reduced:true});assert.equal(await reduced.outbound.start(),true);
 assert.deepEqual(reduced.calls,[['hide']]);reduced.outbound.destroy();
 const f=fixture(),result=f.outbound.start();f.outbound.destroy();assert.equal(await result,false);
 const before=f.calls.length;f.move(14.5);f.map.emit('moveend');assert.equal(f.calls.length,before);
 assert.equal(await f.outbound.start(),false);
});
test('campus-to-campus may use a shorter retreat without changing the accepted filter return',async()=>{
 const f=fixture(),pending=f.outbound.start({duration:1400});
 assert.equal(f.calls.find(([name])=>name==='camera')[1].duration,1400);
 assert.deepEqual(f.calls[0][1],{from:14.5,to:16.6});f.move(14.5);assert.equal(await pending,true);f.outbound.destroy();
 const back=fixture(),returning=back.outbound.start();assert.equal(back.calls.find(([name])=>name==='camera')[1].duration,2200);
 back.move(14.5);assert.equal(await returning,true);back.outbound.destroy();
});

// Exercise the real engine hand-off: MapLibre synchronously emits moveend
// when flyTo replaces the still-running outbound ease.
function engineFixture({zoom=17.8}={}){
 const source=readFileSync(new URL('./integrated-globe.mjs',import.meta.url),'utf8');
 const extract=(name,next)=>source.slice(source.indexOf(` function ${name}(`),source.indexOf(` function ${next}(`));
 const calls=[],outboundResolvers=[];let pendingFade;
 const context=vm.createContext({destroyed:false,navigating:false,navigationId:0,preparationId:0,preparing:false,worldPreparing:false,
  flight:false,flightTarget:null,detailVisible:true,reduced:false,randomPreloadTimer:0,padding:{},markersDirty:false,
  performance:{now:()=>1000},clearTimeout:()=>{},getGlobeDetailOpacity:()=>1,releasePreparationFrame:()=>{},capturePreparationFrame:()=>{},holdPreparationFrame:false,scope:{level:'campus',country:'FRA',campus:'paris'},
  campusById:new Map([['paris',{id:'paris',country:'FRA',coordinates:[2.3,48.9]}],['tokyo',{id:'tokyo',country:'JPN',coordinates:[139,35]}]]),
  campusOutbound:{cancel(){calls.push('outbound-cancel');outboundResolvers.at(-1)?.(false);},start(options){calls.push('outbound-start');calls.push(['outbound-duration',options.duration]);calls.push(['outbound-center',options.center]);return new Promise(resolve=>outboundResolvers.push(resolve));}},
  renderPreparation:{cancel:()=>calls.push('render-cancel')},
  preloadRadius:()=>4.5,campusPreloader:{getState:()=>({ready:true}),cancel:()=>calls.push('raw-cancel'),cancelAnticipation:()=>calls.push('random-cancel'),anticipate:campus=>calls.push(['anticipate',campus.id])},
  detailGate:{defer:()=>calls.push('defer'),getState:()=>({phase:'detail',opacityTarget:1}),hide:()=>calls.push('hide'),
   fadeToLocal(){calls.push('fade');return new Promise(resolve=>{pendingFade=resolve;});}},
  setGestures:enabled=>calls.push(['gestures',enabled]),
  setScope(country,campus){context.scope={level:campus?'campus':country?'country':'world',country,campus};},
  onStatus:status=>calls.push(['status',status]),preloadCampus:campus=>calls.push(['preload',campus.id]),prepareCampusDetail:()=>{},
  emitView:()=>{},renderMarkers:()=>{},refreshFade:()=>{},scheduleRandomAnticipation:()=>{},prepareCampusRendering:()=>calls.push('prepare-render'),
 });
 context.map={getZoom:()=>zoom,stop(){calls.push('stop');context.finishFlight();},
  flyTo(camera){calls.push(['fly',camera]);context.finishFlight();},jumpTo(camera){calls.push(['jump',camera]);context.finishFlight();}};
 vm.runInContext(extract('moveCamera','coverageRadius')+extract('finishFlight','selectCountry'),context);
 return {context,calls,complete:()=>outboundResolvers.at(-1)(true),completeFade:()=>pendingFade(true)};
}
test('engine keeps raw coverage protected during retreat and ignores the old moveend when onward flight begins',async()=>{
 const f=engineFixture();f.context.moveCamera({center:[6,18],zoom:2,pitch:0},2000,null,null);
 assert.equal(f.context.flightTarget.stage,'outbound');assert.ok(!f.calls.includes('raw-cancel'));assert.ok(!f.calls.includes('fade'));
 f.complete();await flush();
 assert.equal(f.context.flightTarget.stage,'travel');assert.equal(f.context.flight,true);
 assert.ok(f.calls.indexOf('raw-cancel')<f.calls.findIndex(call=>Array.isArray(call)&&call[0]==='fly'));
 assert.ok(!f.calls.some(call=>Array.isArray(call)&&call[0]==='gestures'&&call[1]===true));
 f.context.finishFlight();assert.equal(f.context.flight,false);
});
test('the real engine starts a retreat at minimum manual zoom with the departing campus coordinates',async()=>{
 const f=engineFixture({zoom:14.5});f.context.moveCamera({center:[139,35],zoom:17.8,pitch:34},3200,'JPN','tokyo');
 assert.equal(f.context.flightTarget.stage,'outbound');
 assert.deepEqual(f.calls.find(call=>Array.isArray(call)&&call[0]==='outbound-center'),['outbound-center',[2.3,48.9]]);
 assert.equal(f.context.scope.campus,'tokyo','scope changes must not replace the origin used by retreat');
 assert.ok(!f.calls.some(call=>Array.isArray(call)&&call[0]==='fly'));
 f.complete();await flush();assert.ok(f.calls.some(call=>Array.isArray(call)&&call[0]==='fly'));
});
test('a newly selected destination invalidates the old outbound continuation before its completion microtask',async()=>{
 const f=engineFixture();f.context.moveCamera({center:[6,18],zoom:2,pitch:0},2000,null,null);
 f.complete(); // Resolved, but its continuation has not executed yet.
 f.context.moveCamera({center:[139,35],zoom:17.8,pitch:34},3000,'JPN','tokyo');await flush();
 const flights=f.calls.filter(call=>Array.isArray(call)&&call[0]==='fly');
 assert.equal(flights.length,1);assert.deepEqual([...flights[0][1].center],[139,35]);
 assert.equal(flights[0][1].zoom,14.5);assert.equal(f.context.scope.campus,'tokyo');
 assert.ok(!f.calls.includes('prepare-render'));
});
test('a different campus starts its real retreat before any selected preload or renderer preparation',async()=>{
 const f=engineFixture();f.context.moveCamera({center:[139,35],zoom:17.8,pitch:34},3200,'JPN','tokyo');
 assert.equal(f.context.flightTarget.stage,'outbound');
 assert.ok(f.calls.includes('outbound-start'));assert.deepEqual(f.calls.find(call=>Array.isArray(call)&&call[0]==='outbound-duration'),['outbound-duration',1400]);
 assert.deepEqual(f.calls.find(call=>Array.isArray(call)&&call[0]==='anticipate'),['anticipate','tokyo']);
 assert.ok(!f.calls.includes('prepare-render'));assert.ok(!f.calls.includes('raw-cancel'));
 assert.ok(!f.calls.some(call=>Array.isArray(call)&&call[0]==='preload'));
 f.complete();await flush();
 assert.ok(!f.calls.includes('prepare-render'));
 assert.deepEqual(f.calls.find(call=>Array.isArray(call)&&call[0]==='preload'),['preload','tokyo']);
 const next=f.calls.find(call=>Array.isArray(call)&&call[0]==='fly');assert.equal(next[1].zoom,14.5);
});
