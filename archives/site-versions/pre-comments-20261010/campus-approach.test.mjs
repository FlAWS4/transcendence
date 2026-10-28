import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {campusJourneyEasing} from './random-campus.mjs';

const source=readFileSync(new URL('./integrated-globe.mjs',import.meta.url),'utf8');
const slice=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end));
const functions=slice(' function moveCamera(',' function coverageRadius(')
 +slice(' function beginCampusDescent(',' function selectCountry(');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const campus={id:'paris',country:'FRA',coordinates:[2.318,48.897]};
function fixture({reduced=false}={}){
 const calls=[];let zoom=2,pendingCamera=null,resolveRaw,phase='waiting';
 const raw=new Promise(resolve=>{resolveRaw=resolve;});
 const ctx=vm.createContext({destroyed:false,navigating:false,navigationId:0,worldPreparing:false,
  flight:false,flightTarget:null,detailVisible:false,reduced,randomPreloadTimer:0,padding:{left:40},markersDirty:false,
  performance:{now:()=>1000},clearTimeout:()=>{},getGlobeDetailOpacity:()=>0,campusJourneyEasing,
  scope:{level:'country',country:'FRA',campus:null},campusById:new Map([['paris',campus]]),
  campusOutbound:{cancel:()=>{}},campusPreloader:{cancel:()=>{},cancelAnticipation:()=>{}},
  detailGate:{defer:()=>calls.push(['defer']),getState:()=>({phase}),hide:()=>calls.push(['hide']),
   refresh:()=>calls.push(['refresh']),finishZoomFade:()=>{calls.push(['finish-fade']);phase='detail';return true;}},
  setGestures:enabled=>calls.push(['gestures',enabled]),
  setScope(country,campus){ctx.scope={level:campus?'campus':country?'country':'world',country,campus};},
  onStatus:status=>calls.push(['status',status]),preloadCampus:()=>{calls.push(['raw']);return raw;},
  prepareCampusDetail:()=>calls.push(['prepare-detail']),
  emitView:()=>{},renderMarkers:()=>{},refreshFade:()=>{},scheduleRandomAnticipation:()=>{},
 });
 const camera=(name,options)=>{calls.push([name,options]);pendingCamera=options;ctx.finishFlight();};
 ctx.map={getZoom:()=>zoom,stop:()=>ctx.finishFlight(),
  flyTo:options=>camera('fly',options),easeTo:options=>camera('ease',options),
  jumpTo:options=>{zoom=options.zoom;camera('jump',options);}};
 vm.runInContext(functions,ctx);
 return {ctx,calls,setPhase(value){phase=value;},resolveRaw,
  start(){ctx.moveCamera({center:campus.coordinates,zoom:17.8,pitch:34},2800,'FRA','paris');},
  arrive(){zoom=pendingCamera.zoom;ctx.finishFlight();}};
}

test('the click launches its camera synchronously while the raw radius remains pending',()=>{
 const f=fixture();f.start();
 assert.equal(f.ctx.flightTarget.stage,'travel');
 const first=f.calls.find(([name])=>name==='fly')[1];assert.equal(first.zoom,14.5);assert.equal(first.pitch,0);
 assert.equal(first.easing(.5),.5);assert.equal(f.calls.filter(([name])=>name==='raw').length,1);
 f.arrive();
 const ease=f.calls.find(([name])=>name==='ease')[1];
 assert.equal(ease.zoom,17.8);assert.equal(ease.pitch,34);assert.equal(ease.duration,2200);
 assert.ok(ease.easing(.001)>.001);assert.equal(ease.easing(1),1);
 assert.equal(f.ctx.flightTarget.stage,'approach');
 assert.ok(!f.calls.some(([name,value])=>name==='gestures'&&value===true));
 f.arrive();assert.equal(f.ctx.flight,false);assert.equal(f.ctx.flightTarget,null);
 assert.equal(f.calls.filter(([name])=>name==='finish-fade').length,0);
 assert.equal(f.calls.filter(([name])=>name==='refresh').length,1);
 assert.ok(!f.calls.some(([name,value])=>name==='status'&&value==='error'));
});

test('a late raw completion cannot revive the previous destination or replay its descent',async()=>{
 const f=fixture();f.start();f.ctx.moveCamera({center:[6,18],zoom:2,pitch:0},2000,null,null);
 const cameras=f.calls.filter(([name])=>['fly','ease','jump'].includes(name)).length;
 f.resolveRaw({ready:true});await tick();
 assert.equal(f.ctx.scope.level,'world');assert.equal(f.ctx.flightTarget.stage,'travel');
 assert.equal(f.calls.filter(([name])=>['fly','ease','jump'].includes(name)).length,cameras);
 assert.ok(!f.calls.some(([name])=>name==='ease'));
});

test('a ready moving reveal completes at arrival while the raw radius can still be pending',()=>{
 const f=fixture();f.start();f.arrive();f.setPhase('moving');f.arrive();
 assert.equal(f.calls.filter(([name])=>name==='finish-fade').length,1);
 assert.equal(f.ctx.flight,false);assert.deepEqual(f.calls.findLast(([name])=>name==='gestures'),['gestures',true]);
});

test('reduced motion jumps directly, releases controls and lets the actual view become ready later',()=>{
 const f=fixture({reduced:true});f.start();
 assert.equal(f.calls.find(([name])=>name==='jump')[1].zoom,17.8);
 assert.equal(f.ctx.flight,false);assert.equal(f.ctx.flightTarget,null);
 assert.ok(!f.calls.some(([name])=>name==='ease'||name==='fly'));
 assert.equal(f.calls.filter(([name])=>name==='refresh').length,1);
});

test('repeating the current in-flight destination keeps its flight while reduced motion can finish it directly',()=>{
 const calls=[],ctx=vm.createContext({campusById:new Map([['paris',campus]]),destroyed:false,reduced:false,flight:true,
  scope:{level:'campus',campus:'paris'},detailGate:{getState:()=>({phase:'error'})},moveCamera:(...args)=>calls.push(args)});
 vm.runInContext(slice(' function selectCampus(',' function visitRandomCampus('),ctx);
 ctx.selectCampus('paris');assert.equal(calls.length,0);
 ctx.reduced=true;ctx.selectCampus('paris');assert.equal(calls.length,1);
 ctx.reduced=false;ctx.selectCampus('paris');assert.equal(calls.length,1);
});

test('selecting the current campus recenters without reloading even while its raw radius is incomplete',()=>{
 const calls=[];let distance=.002;
 const ctx=vm.createContext({campusById:new Map([['paris',campus]]),destroyed:false,reduced:false,flight:false,padding:{},
  scope:{level:'campus',campus:'paris'},detailGate:{getState:()=>({phase:'waiting'})},campusPreloader:{getState:()=>({ready:false})},
  d3:{geoDistance:()=>distance},map:{getCenter:()=>({toArray:()=>[2.32,48.9]}),stop:()=>calls.push('stop'),easeTo:options=>calls.push(options)},
  moveCamera:()=>{throw new Error('A current campus click restarted preparation');}});
 vm.runInContext(slice(' function selectCampus(',' function visitRandomCampus('),ctx);ctx.selectCampus('paris');
 assert.equal(calls.length,2);assert.equal(calls[1].duration,650);assert.ok(!('zoom'in calls[1]));assert.ok(!('pitch'in calls[1]));
 distance=0;ctx.selectCampus('paris');assert.equal(calls.length,2);
 distance=.002;ctx.reduced=true;ctx.selectCampus('paris');assert.equal(calls.at(-1).duration,0);
});


test('an explicit retry resumes a partial raw radius without restarting a successful view or its camera',()=>{
 const calls=[],ctx=vm.createContext({campusById:new Map([['paris',campus]]),destroyed:false,reduced:false,flight:false,detailError:false,
  scope:{level:'campus',campus:'paris'},detailGate:{getState:()=>({phase:'detail'}),hide:()=>calls.push('hide')},
  preloadCampus:()=>calls.push('raw'),prepareCampusDetail:()=>calls.push('view'),moveCamera:()=>calls.push('camera')});
 vm.runInContext(slice(' function selectCampus(',' function visitRandomCampus('),ctx);
 ctx.selectCampus('paris',{retry:true});assert.deepEqual(calls,['raw']);
});

test('retrying a failed visible source refreshes its gate in place without another flight',()=>{
 const calls=[],ctx=vm.createContext({campusById:new Map([['paris',campus]]),destroyed:false,reduced:false,flight:false,detailError:true,
  scope:{level:'campus',campus:'paris'},detailGate:{getState:()=>({phase:'error'}),hide:()=>calls.push('hide')},
  preloadCampus:()=>calls.push('raw'),prepareCampusDetail:options=>calls.push(['view',options.retry]),onStatus:status=>calls.push(status),moveCamera:()=>calls.push('camera')});
 vm.runInContext(slice(' function selectCampus(',' function visitRandomCampus('),ctx);
 ctx.selectCampus('paris',{retry:true});assert.deepEqual(calls,['raw','loading','hide',['view',true]]);
});
