import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {constrainNavigation,getNavigationZoomRange} from './navigation-policy.mjs';
import {createRandomCampusCandidate,campusJourneyDuration,campusJourneyEasing} from './random-campus.mjs';

// Exercise the actual factory-local session against synchronous MapLibre
// moveend notifications. A popup changes its DOM viewport between API calls.
const source=readFileSync(new URL('./integrated-globe.mjs',import.meta.url),'utf8');
const extract=(first,last)=>source.slice(source.indexOf(` function ${first}(`),source.indexOf(` function ${last}(`));
const code=extract('navigationPolicy','getNavigationState')
 +extract('emitScope','setGestures')+extract('moveCamera','coverageRadius')
 +extract('scheduleRandomAnticipation','preloadCampus')
 +extract('beginCampusDescent','countryAt')+extract('refreshLayout','setTheme')
 +extract('keyDown','motionChanged');
const paris={id:'paris',name:'42 Paris',country:'FRA',coordinates:[2.318,48.897]};
const tokyo={id:'tokyo',name:'42 Tokyo',country:'JPN',coordinates:[139.7,35.6]};
const copy=value=>structuredClone(value);
function fixture({level='campus',campusId='paris',reduced=false,pending=null}={}){
 const calls=[],views=[],scopes=[],timers=new Map();let timer=0,phase='detail',cameraPending=null;
 const original={center:[2.3196,48.8992],zoom:16.8,pitch:29,bearing:0,padding:{top:0,right:0,bottom:0,left:100}};
 if(level==='world')Object.assign(original,{center:[15,22],zoom:2.3,pitch:0});
 if(pending)Object.assign(original,{center:[60,30],zoom:8,pitch:0});
 const state=copy(original),container={clientWidth:1000,clientHeight:700,dataset:{}};
 const randomCandidate=createRandomCampusCandidate([paris,tokyo],{random:()=>0});randomCandidate.setCurrent(level==='campus'?campusId:null);
 const ctx=vm.createContext({destroyed:false,ready:true,worldPreparing:false,worldRender:{phase:'ready'},campusPreview:null,
  navigating:false,flight:Boolean(pending),flightTarget:pending,detailVisible:true,detailError:false,reduced,navigationId:0,
  scope:{level,country:level==='world'?null:campusId==='paris'?'FRA':'JPN',campus:level==='campus'?campusId:null},
  width:1000,height:700,worldZoom:2,centerPoint:[550,350],padding:copy(original.padding),layoutKey:'1000:700:550,350:2',lastView:'',markersDirty:false,
  randomPreloadTimer:0,resizeFrame:0,container,randomCandidate,options:{},
  campusById:new Map([['paris',paris],['tokyo',tokyo]]),
  countries:new Map([['FRA',{name:'France',center:paris.coordinates,bounds:[[0,43],[8,51]],members:[paris]}],['JPN',{name:'Japan',center:tokyo.coordinates,bounds:[[130,30],[146,44]],members:[tokyo]}]]),
  countryZoom:()=>4,getNavigationZoomRange,constrainNavigation,campusJourneyDuration,campusJourneyEasing,
  clamp:(value,min,max)=>Math.max(min,Math.min(max,value)),
  performance:{now:()=>1000},cancelAnimationFrame:()=>{},
  clearTimeout:id=>timers.delete(id),setTimeout:fn=>{timers.set(++timer,fn);return timer;},
  d3:{geoDistance:(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])*.01745},
  getGlobeDetailOpacity:()=>ctx.detailVisible?1:0,
  setGestures:enabled=>calls.push(['gestures',enabled]),
  onScopeChange:scope=>scopes.push(copy(scope)),onViewChange:view=>views.push(copy(view)),onStatus:status=>calls.push(['status',status]),
  syncMarkers:()=>calls.push(['markers']),renderMarkers:()=>{},refreshFade:()=>{},
  prepareCampusDetail:options=>{calls.push(['detail',options]);phase='waiting';},
  preloadCampus:campus=>{calls.push(['preload',campus.id]);return Promise.resolve({ready:true});},preloadRadius:()=>3,
  campusPreloader:{cancel:()=>calls.push(['cancel-raw']),cancelAnticipation:()=>calls.push(['cancel-random']),getState:()=>({ready:true}),anticipate:campus=>calls.push(['anticipate',campus.id])},
  campusOutbound:{cancel:()=>calls.push(['cancel-outbound']),finishForLayout:()=>calls.push(['finish-outbound'])},
  detailGate:{hide(){calls.push(['hide']);phase='local';ctx.detailVisible=false;},defer(){},getState:()=>({phase}),refresh(){calls.push(['refresh-detail']);},finishZoomFade(){phase='detail';}},
  readLayout(){ctx.width=container.clientWidth;ctx.height=container.clientHeight;ctx.centerPoint=[ctx.width/2+(ctx.width===1000?50:0),ctx.height/2];ctx.padding={top:0,right:0,bottom:0,left:ctx.width===1000?100:0};ctx.worldZoom=ctx.width===1000?2:1;},
 });
 function apply(options){for(const key of ['center','zoom','pitch','bearing','padding'])if(options[key]!==undefined)state[key]=copy(options[key]);}
 function camera(name,options){calls.push([name,options]);cameraPending=options;ctx.finishFlight();}
 ctx.map={
  getCenter:()=>({lng:state.center[0],lat:state.center[1],toArray:()=>[...state.center]}),getZoom:()=>state.zoom,getPitch:()=>state.pitch,getBearing:()=>state.bearing,getPadding:()=>copy(state.padding),isMoving:()=>Boolean(cameraPending),
  stop(){calls.push(['stop']);cameraPending=null;ctx.finishFlight();},
  resize(){calls.push(['resize']);ctx.finishFlight();},redraw:()=>calls.push(['redraw']),
  jumpTo(options){apply(options);calls.push(['jump',copy(options)]);ctx.finishFlight();},
  flyTo:options=>camera('fly',options),easeTo:options=>camera('ease',options),
  panBy:(...args)=>calls.push(['pan',...args]),
  fire:name=>calls.push(['event',name,{inFlight:ctx.flight,flightTarget:ctx.flightTarget,level:ctx.scope.level}]),
 };
 vm.runInContext(code,ctx);
 return {ctx,calls,views,scopes,state,original,container,timers,
  arrive(){const next=cameraPending;cameraPending=null;if(next)apply(next);ctx.finishFlight();},
  resize(width,height){container.clientWidth=width;container.clientHeight=height;},
  key(key){const event={key,target:container,prevented:false,preventDefault(){this.prevented=true;}};ctx.keyDown(event);return event;},
 };
}

test('the portal replays the approach for the current campus and restores its exact explored camera',()=>{
 const f=fixture(),map=f.ctx.map,next=f.ctx.randomCandidate.peek().id;
 const session=f.ctx.beginCampusPreview('paris');assert.ok(session);
 assert.equal(f.calls.length,0,'capturing must not move the map before the DOM portal');
 f.resize(640,420);assert.equal(session.start(),true);assert.equal(session.start(),false);
 assert.ok(f.calls.some(([name,camera])=>name==='jump'&&camera.zoom===12.5));
 assert.equal(f.calls.find(([name])=>name==='fly')[1].zoom,14.5);
 f.arrive();assert.equal(f.calls.find(([name])=>name==='ease')[1].zoom,17.8);
 f.arrive();assert.equal(f.ctx.flight,false);assert.equal(f.ctx.scope.campus,'paris');
 assert.ok(f.views.every(view=>!view.canBack));assert.ok(f.scopes.every(scope=>!('previewCampus'in scope)));
 f.resize(1000,700);assert.equal(session.restore(),true);assert.equal(session.restore(),false);
 assert.deepEqual(f.state,f.original);assert.equal(f.ctx.scope.campus,'paris');assert.equal(f.ctx.scope.previewCampus,undefined);
 assert.equal(f.ctx.map,map);assert.equal(f.ctx.randomCandidate.peek().id,next);
 assert.equal(f.views.at(-1).canBack,true);
});

test('closing during either flight leg restores the world and late moveend cannot restart the campus descent',()=>{
 for(const stage of ['travel','approach']){
  const f=fixture({level:'world'}),session=f.ctx.beginCampusPreview('tokyo');f.resize(640,420);session.start();
  if(stage==='approach')f.arrive();
  assert.equal(f.ctx.flightTarget.stage,stage);const startedId=f.ctx.navigationId;
  f.resize(1000,700);session.restore();assert.ok(f.ctx.navigationId>startedId);
  const cameras=f.calls.filter(([name])=>['fly','ease','jump'].includes(name)).length;
  f.arrive();f.ctx.finishFlight();
  assert.equal(f.calls.filter(([name])=>['fly','ease','jump'].includes(name)).length,cameras);
  assert.equal(f.ctx.scope.level,'world');assert.deepEqual(f.state,f.original);assert.equal(f.ctx.flight,false);assert.equal(f.ctx.flightTarget,null);
  assert.deepEqual(f.calls.findLast(([name])=>name==='event'),['event','horizonpreload',{inFlight:false,flightTarget:null,level:'world'}]);
 }
});

test('a captured original flight restores its legal destination instead of the intermediate camera',()=>{
 const pending={center:tokyo.coordinates,zoom:17.8,pitch:34,stage:'travel',travelZoom:14.5,duration:2800,deadline:2000};
 const f=fixture({campusId:'tokyo',pending}),session=f.ctx.beginCampusPreview('paris');f.resize(640,420);session.start();
 f.resize(1000,700);session.restore();
 assert.equal(f.ctx.scope.campus,'tokyo');assert.equal(f.state.zoom,17.8);assert.equal(f.state.pitch,34);
 assert.ok(f.state.center.every((value,index)=>Math.abs(value-tokyo.coordinates[index])<1e-10));
 assert.equal(f.ctx.flight,false);
});

test('world, country, other campuses, random and Home stay locked while Escape belongs to the dialog',()=>{
 const f=fixture(),session=f.ctx.beginCampusPreview('paris');session.start();f.arrive();f.arrive();
 const count=f.calls.length;
 f.ctx.selectCountry('JPN');f.ctx.selectCampus('tokyo');f.ctx.reset();f.ctx.back();
 assert.equal(f.ctx.visitRandomCampus(),null);assert.equal(f.key('Home').prevented,true);
 assert.equal(f.key('Escape').prevented,false);assert.equal(f.calls.length,count);
 f.ctx.scheduleRandomAnticipation();assert.equal(f.timers.size,0);
 f.ctx.zoomBy(.8);assert.ok(f.calls.some(([name])=>name==='ease'));
 assert.equal(f.ctx.scope.campus,'paris');
 session.restore();assert.equal(f.key('Escape').prevented,true);
});

test('capture/start failures leave a restorable session and concurrent sessions are refused',()=>{
 const f=fixture();assert.equal(f.ctx.beginCampusPreview('missing'),null);
 f.ctx.ready=false;assert.equal(f.ctx.beginCampusPreview('paris'),null);f.ctx.ready=true;
 f.ctx.worldPreparing=true;assert.equal(f.ctx.beginCampusPreview('paris'),null);f.ctx.worldPreparing=false;
 const session=f.ctx.beginCampusPreview('paris');assert.equal(f.ctx.beginCampusPreview('tokyo'),null);
 f.resize(0,0);assert.equal(session.start(),false);
 f.resize(1000,700);assert.equal(session.restore(),true);assert.deepEqual(f.state,f.original);
 assert.equal(session.start(),false);assert.ok(f.ctx.beginCampusPreview('tokyo'));
});

test('reduced motion uses the same bounded destination without an animated segment',()=>{
 const f=fixture({reduced:true}),session=f.ctx.beginCampusPreview('tokyo');f.resize(390,400);session.start();
 assert.equal(f.state.zoom,17.8);assert.equal(f.ctx.flight,false);
 assert.ok(!f.calls.some(([name])=>name==='fly'||name==='ease'));
 f.resize(1000,700);session.restore();assert.deepEqual(f.state,f.original);
});

test('a changed host viewport restores a legal world camera and the new layout padding',()=>{
 const f=fixture({level:'world'}),session=f.ctx.beginCampusPreview('paris');f.resize(640,420);session.start();
 f.resize(390,400);session.restore();
 assert.equal(f.ctx.scope.level,'world');assert.equal(f.state.padding.left,0);
 const range=getNavigationZoomRange({level:'world',worldZoom:1},f.state.center[1]);
 assert.ok(f.state.zoom>=range.min&&f.state.zoom<=range.max);
});

test('only the locked campus gets a marker, while its normal click still opens its information',()=>{
 const markers=new Map(),opened=[],buttons=[];
 const node=()=>({children:[],listeners:{},classList:{add(){},toggle(){}},setAttribute(){},append(...children){this.children.push(...children);},addEventListener(type,fn){this.listeners[type]=fn;},remove(){}});
 const ctx=vm.createContext({markers,scope:{level:'campus',country:'FRA',campus:'paris',previewCampus:'paris'},campusById:new Map([['paris',paris],['tokyo',tokyo]]),countries:new Map(),
  options:{onCampusDetails:campus=>opened.push(campus.id)},document:{createElement(tag){const element=node();if(tag==='button')buttons.push(element);return element;}},
  createCampusDirection:()=>({isOffscreen:()=>false}),maplibregl:{LngLat:{convert:value=>value}},map:{getCanvasContainer:()=>node()},
  renderMarkers(){},markersDirty:false,flight:false,worldPreparing:false,container:{focus(){throw new Error('Information popup owns focus');}},
 });
 vm.runInContext(extract('syncMarkers','renderMarkers'),ctx);ctx.syncMarkers();
 assert.deepEqual([...markers.keys()],['paris']);buttons[0].listeners.click({stopPropagation(){}});assert.deepEqual(opened,['paris']);
});
