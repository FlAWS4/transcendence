import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {getNavigationZoomRange} from './navigation-policy.mjs';

// Exercise the real factory-local lifecycle functions with observable public
// MapLibre calls. resize clears a fake backing buffer; camera changes emit the
// synchronous moveend events that previously restarted detail preparation.
const source=readFileSync(new URL('./integrated-globe.mjs',import.meta.url),'utf8');
const extract=(name,next)=>source.slice(source.indexOf(` function ${name}(`),source.indexOf(` function ${next}(`));
const code=extract('finishFlight','selectCountry')+extract('refreshLayout','setTheme');
function fixture({level='world',zoom=3,worldZoom=2,countryFit=4,pending=null,reduced=false,preparing=false}={}){
 const calls=[];
 const initialPadding={top:0,right:0,bottom:0,left:0};
 const state={zoom,center:{lng:6,lat:18},padding:{...initialPadding},blank:false};
 const context=vm.createContext({
  releasePreparationFrame:()=>{},holdPreparationFrame:false,destroyed:false,navigating:false,flight:Boolean(pending),flightTarget:pending,ready:true,reduced,preparing,worldPreparing:false,preparationId:0,
  scope:{level,country:level==='world'?null:'FRA',campus:level==='campus'?'paris':null},
  width:1000,height:800,centerPoint:[500,400],worldZoom,padding:{...initialPadding},
  layoutKey:`1000:800:500,400:${worldZoom}`,markersDirty:false,
  countries:new Map([['FRA',{}]]),campusById:new Map([['paris',{id:'paris',coordinates:[2.318,48.897]}]]),countryFit,
  nextLayout:{width:1000,height:800,worldZoom,countryFit,padding:{...initialPadding}},
  now:1000,performance:{now:()=>context.now},getNavigationZoomRange,
  clamp:(value,minimum,maximum)=>Math.max(minimum,Math.min(maximum,value)),
  countryZoom:()=>context.countryFit,
  navigationPolicy:()=>({level:context.scope.level,worldZoom:context.worldZoom,countryZoom:context.countryFit,inFlight:context.flight}),
  readLayout(){
   const next=context.nextLayout;
   Object.assign(context,{width:next.width,height:next.height,worldZoom:next.worldZoom,countryFit:next.countryFit,padding:{...next.padding},centerPoint:[next.width/2,next.height/2]});
  },
  setGestures:value=>calls.push(['gestures',value]),
  detailGate:{hide:()=>calls.push(['hide']),getState:()=>({phase:'waiting'}),refresh:()=>calls.push(['refresh-ready'])},prepareCampusDetail:()=>calls.push(['prepare']),
  beginCampusDescent(){calls.push(['descent']);context.flightTarget={...context.flightTarget,stage:'approach',travelZoom:17.8,deadline:context.now+2200};},
  campusOutbound:{finishForLayout:()=>calls.push(['outbound-hide'])},
  preloadCampus:campus=>{calls.push(['preload',campus.id]);return Promise.resolve({ready:true});},
  scheduleRandomAnticipation:()=>calls.push(['schedule-random']),
  prepareCampusRendering(){
   context.preparationId++;
   calls.push(['render-prepare']);context.flightTarget={...context.flightTarget,stage:'preparation'};
   context.preloadCampus(context.campusById.get(context.scope.campus));
  },
  // Resolve the separate, asynchronous renderer lifecycle when the test asks;
  // finishFlight alone must not release the controls before preparation ends.
  completePreparation(){
   context.flight=false;context.flightTarget=null;context.preparing=false;
   context.setGestures(true);context.prepareCampusDetail();
  },
  renderPreparation:{
   cancel(){
    calls.push(['render-cancel']);
    if(context.preparing){
     context.map.jumpTo({center:pending.center,zoom:pending.zoom,pitch:pending.pitch,padding:initialPadding});
     context.preparing=false;
    }
   },
  },
  renderMarkers:()=>calls.push(['markers']),emitView:()=>calls.push(['view']),refreshFade:()=>calls.push(['fade']),
  // A resize must never reuse the selection/loading pipeline.
  moveCamera:()=>{throw new Error('Resize restarted destination selection');},
 });
 const apply=options=>{
  if(options.zoom!==undefined)state.zoom=options.zoom;
  if(options.padding)state.padding={...options.padding};
  if(options.center)state.center={lng:options.center[0],lat:options.center[1]};
 };
 context.map={
  getZoom:()=>state.zoom,getCenter:()=>({...state.center}),getPadding:()=>({...state.padding}),
  resize(){calls.push(['resize']);state.blank=true;context.finishFlight();},
  jumpTo(options){calls.push(['jump',structuredClone(options)]);apply(options);context.finishFlight();},
  easeTo(options){const {easing,...camera}=options;calls.push(['ease',{...structuredClone(camera),...(easing?{easing}:{})}]);if(!context.flight)apply(options);context.finishFlight();},
  flyTo(options){const {easing,...camera}=options;calls.push(['fly',{...structuredClone(camera),...(easing?{easing}:{})}]);context.finishFlight();},
  redraw(){calls.push(['redraw',{zoom:state.zoom,padding:{...state.padding}}]);state.blank=false;},
 };
 vm.runInContext(code,context);
 return {context,calls,state,refresh:options=>context.refreshLayout(options)};
}
const operations=calls=>calls.filter(([name])=>['resize','jump','ease','fly','redraw'].includes(name));

test('a real resize redraws only after the final camera update and preserves world zoom offset',()=>{
 const {context,calls,state,refresh}=fixture();
 context.nextLayout={...context.nextLayout,width:1200,worldZoom:2.25,padding:{top:0,right:0,bottom:0,left:120}};
 refresh({animate:false});
 assert.deepEqual(operations(calls).map(([name])=>name),['resize','jump','redraw']);
 assert.equal(state.blank,false);assert.equal(state.zoom,3.25);
 assert.equal(operations(calls).at(-1)[1].padding.left,120);
 assert.ok(!calls.some(([name])=>['prepare','hide','gestures'].includes(name)));
});

test('same layout performs no work and padding-only changes never clear the canvas',()=>{
 const {context,calls,refresh}=fixture();refresh();assert.deepEqual(calls,[]);
 context.nextLayout.padding.left=100;
 // The real layout key includes the computed visual centre.
 context.readLayout=()=>{context.padding={...context.nextLayout.padding};context.centerPoint=[550,400];};
 refresh();assert.deepEqual(operations(calls).map(([name])=>name),['ease']);
 assert.ok(!calls.some(([name])=>['prepare','hide','gestures'].includes(name)));
});

test('campus resize keeps the explored zoom and ordinary moveend does not prepare it again',()=>{
 const {context,calls,state,refresh}=fixture({level:'campus',zoom:15.6});
 context.nextLayout.width=900;refresh({animate:false});context.finishFlight();
 assert.equal(state.zoom,15.6);assert.deepEqual(operations(calls).map(([name])=>name),['resize','redraw']);
 assert.ok(!calls.some(([name])=>['prepare','hide','gestures'].includes(name)));
 assert.deepEqual(calls.filter(([name])=>name==='preload'),[['preload','paris']]);
 assert.ok(!calls.some(([name])=>name==='render-prepare'));
});

test('a campus padding change extends raw coverage without clearing the backing buffer or restarting a flight',()=>{
 const {context,calls,state,refresh}=fixture({level:'campus',zoom:17.8});
 context.readLayout=()=>{context.padding={top:0,right:0,bottom:0,left:100};context.centerPoint=[550,400];};
 refresh();
 assert.deepEqual(operations(calls).map(([name])=>name),['ease']);assert.equal(state.blank,false);
 assert.deepEqual(calls.filter(([name])=>name==='preload'),[['preload','paris']]);
 assert.ok(!calls.some(([name])=>['render-prepare','prepare','gestures'].includes(name)));
});

test('a country resize preserves zoom when legal and clamps it when its fit range changes',()=>{
 for(const [zoom,expected] of [[4.5,4.5],[6,5.1],[2,2.75]]){
  const {context,state,refresh}=fixture({level:'country',zoom,countryFit:4});
  context.nextLayout={...context.nextLayout,width:500,countryFit:3};refresh({animate:false});
  assert.equal(state.zoom,expected);
 }
});

test('resizing a flight keeps its destination and deadline without another loading lifecycle',()=>{
 const pending={center:[2.318,48.897],zoom:17.8,pitch:34,stage:'travel',duration:2800,deadline:1250};
 const {context,calls,refresh}=fixture({level:'campus',zoom:12,pending});
 context.nextLayout.width=900;refresh({animate:false});
 assert.equal(context.flightTarget.deadline,1250);assert.equal(context.flight,true);
 assert.equal(operations(calls).find(([name])=>name==='fly')[1].duration,250);
 context.now=1150;context.nextLayout.width=850;refresh({animate:false});
 assert.equal(operations(calls).filter(([name])=>name==='fly').at(-1)[1].duration,100);
 assert.equal(context.scope.campus,'paris');
 assert.ok(!calls.some(([name])=>['prepare','hide','gestures'].includes(name)));
});

test('an expired travel segment starts its approach immediately after resize without waiting for raw data',()=>{
 const pending={center:[2.318,48.897],zoom:17.8,travelZoom:14.5,pitch:34,stage:'travel',needsApproach:true,duration:2800,deadline:999};
 const {context,calls,state,refresh}=fixture({level:'campus',zoom:12,pending});
 context.nextLayout.width=900;refresh({animate:false});
 assert.deepEqual(operations(calls).map(([name])=>name),['resize','jump','redraw']);
 assert.equal(state.zoom,14.5);assert.equal(context.flight,true);assert.equal(context.flightTarget.stage,'approach');
 assert.equal(calls.filter(([name])=>name==='descent').length,1);
 assert.ok(!calls.some(([name])=>['prepare','gestures','render-prepare','preload'].includes(name)));
});

test('an expired approach releases controls even if its first detailed frame is still waiting',()=>{
 const pending={center:[2.318,48.897],zoom:17.8,travelZoom:17.8,pitch:34,stage:'approach',needsApproach:true,duration:2800,deadline:999};
 const {context,calls,state,refresh}=fixture({level:'campus',zoom:16.4,pending});
 context.nextLayout.width=900;refresh({animate:false});
 assert.equal(state.zoom,17.8);assert.equal(context.flight,false);assert.equal(context.flightTarget,null);
 assert.equal(calls.filter(([name])=>name==='refresh-ready').length,1);
 assert.deepEqual(calls.find(([name])=>name==='gestures'),['gestures',true]);
 assert.ok(!calls.some(([name])=>['prepare','render-prepare','hide'].includes(name)));
});

test('resizing during a departure fade leaves that phase and camera zoom intact',()=>{
 const pending={center:[6,18],zoom:2,pitch:0,stage:'departure',duration:2000,deadline:3200};
 const {context,calls,state,refresh}=fixture({zoom:17.8,pending});
 context.nextLayout={...context.nextLayout,width:1200,worldZoom:2.25,padding:{top:0,right:0,bottom:0,left:100}};
 refresh({animate:false});
 assert.equal(context.flightTarget.stage,'departure');assert.equal(context.flightTarget.zoom,2.25);
 assert.equal(context.flightTarget.deadline,3200);assert.equal(state.zoom,17.8);
 assert.ok(!calls.some(([name])=>['fly','prepare','hide','gestures'].includes(name)));
 assert.deepEqual(operations(calls).map(([name])=>name),['resize','jump','redraw']);
});

test('retargeting a cross-campus flight keeps its progressive easing and original deadline',()=>{
 const easing=t=>t*t*(3-2*t);
 const pending={center:[2.318,48.897],zoom:17.8,pitch:34,stage:'travel',duration:3300,deadline:2400,easing};
 const {context,calls,refresh}=fixture({level:'campus',zoom:9,pending});
 context.nextLayout.width=900;refresh({animate:false});
 const camera=calls.find(([name])=>name==='fly')[1];
 assert.equal(camera.easing,easing);assert.equal(camera.duration,1400);assert.equal(context.flightTarget.deadline,2400);
});

test('resize during outbound hides the old detail before clearing the buffer and never jumps to the far destination',()=>{
 const pending={center:[6,18],zoom:2,pitch:0,stage:'outbound',duration:2000,deadline:4000};
 const {context,calls,state,refresh}=fixture({zoom:16.5,pending});
 context.nextLayout={...context.nextLayout,width:1200,worldZoom:2.25,padding:{top:0,right:0,bottom:0,left:100}};
 refresh({animate:false});
 assert.ok(calls.findIndex(([name])=>name==='outbound-hide')<calls.findIndex(([name])=>name==='resize'));
 assert.equal(context.flightTarget.stage,'outbound');assert.equal(context.flightTarget.zoom,2.25);
 assert.equal(state.zoom,16.5);assert.equal(context.flight,true);
 assert.ok(!calls.some(([name])=>['fly','prepare','gestures','render-prepare','preload'].includes(name)));
 context.finishFlight();assert.equal(context.flight,true);
});

test('resize during a visible approach keeps the live view, ramp and remaining deadline',()=>{
 const pending={center:[2.318,48.897],zoom:17.8,pitch:34,stage:'approach',needsApproach:true,travelZoom:17.8,duration:2800,deadline:2600};
 const {context,calls,state,refresh}=fixture({level:'campus',zoom:16.4,pending});
 context.nextLayout.width=900;refresh({animate:false});
 assert.equal(state.zoom,16.4);assert.equal(context.flightTarget.stage,'approach');assert.equal(context.flight,true);
 const camera=calls.find(([name])=>name==='ease')[1];assert.equal(camera.zoom,17.8);assert.equal(camera.pitch,34);assert.equal(camera.duration,1600);
 assert.equal(context.flightTarget.deadline,2600);
 assert.ok(!calls.some(([name])=>['hide','render-prepare','prepare','preload','gestures','jump'].includes(name)));
 assert.deepEqual(operations(calls).map(([name])=>name),['resize','ease','redraw']);
});

test('entry geometry measures the public projected sphere in viewport CSS pixels, including padding',()=>{
 const code=extract('getWorldScreenGeometry','getRandomCampusState');
 for(const [x,y,left,top] of [[650,400,0,100],[180,170,24,150],[300,400,80,70]]){
  const radians=Math.PI/180,latitude=18*radians,longitude=6*radians;
  const ctx=vm.createContext({destroyed:false,ready:true,worldRender:{phase:'ready'},scope:{level:'world'},flight:false,
   map:{getPitch:()=>0,getCenter:()=>({lng:6,lat:18}),getCanvas:()=>({getBoundingClientRect:()=>({left,top,width:1000,height:800})}),
    project(point){
     const lon=(point.lng??point[0])*radians-longitude,lat=(point.lat??point[1])*radians;
     const a=Math.cos(lat)*Math.sin(lon),b=Math.cos(latitude)*Math.sin(lat)-Math.sin(latitude)*Math.cos(lat)*Math.cos(lon);
     const z=Math.sin(latitude)*Math.sin(lat)+Math.cos(latitude)*Math.cos(lat)*Math.cos(lon);
     return {x:x+400*a/(2-z),y:y-400*b/(2-z)};
    }}});
  vm.runInContext(code,ctx);const geometry=ctx.getWorldScreenGeometry();
  assert.ok(Math.abs(geometry.radius-400/Math.sqrt(3))<1e-6);
  assert.equal(geometry.center.x,x+left);assert.equal(geometry.center.y,y+top);
  ctx.flight=true;assert.equal(ctx.getWorldScreenGeometry(),null);
 }
});

test('the progressive engine has no hidden campus render preparation or temporary snapshot canvas',()=>{
 assert.ok(!source.includes('createCampusRenderPreparation'));
 assert.ok(!source.includes('capturePreparationFrame'));
 assert.ok(!source.includes("createElement('canvas')"));
});
