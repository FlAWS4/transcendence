import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('./integrated-globe.mjs',import.meta.url),'utf8');
const extract=(first,last)=>source.slice(source.indexOf(' function '+first+'('),source.indexOf(' function '+last+'('));
// Use the real overlay, popup restoration and event registrations. In pinned
// MapLibre 5.24, camera events precede _render's setTransitionState; automatic
// globe/Mercator changes do not emit the migration-only projectiontransition.
const code=extract('syncMarkers','refreshFade')+extract('beginCampusPreview','setTheme')
 +source.split('\n').filter(line=>/map\.on\('(move|render|projectiontransition)'/.test(line)).join('\n');
const copy=value=>structuredClone(value);
const near={id:'near-campus',name:'Near campus',country:'near',coordinates:[0,0]};
const horizon={id:'horizon-campus',name:'Horizon campus',country:'horizon',coordinates:[30,0]};
const noop=()=>{};
const node=()=>({style:{},offsetWidth:80,hidden:false,classList:{toggle:noop},setAttribute:noop,append:noop,addEventListener:noop,remove:noop});

function fixture(){
 const events=new Map(),markers=new Map(),container={clientWidth:1000,clientHeight:700,focus:noop};
 const original={center:[6,18],zoom:2.3,pitch:0,bearing:0,padding:{top:0,right:0,bottom:0,left:100}};
 const camera=copy(original);let projection='globe',draws=0,projectionEvents=0;
 const ctx=vm.createContext({
  destroyed:false,ready:true,worldPreparing:false,worldRender:{phase:'ready'},campusPreview:null,
  scope:{level:'world',country:null,campus:null},flight:false,flightTarget:null,navigating:false,navigationId:0,
  width:1000,height:700,worldZoom:2,centerPoint:[550,350],padding:copy(original.padding),layoutKey:'',
  detailError:false,randomPreloadTimer:0,resizeFrame:0,markersDirty:true,lastView:'',markers,container,options:{},
  campusById:new Map([[near.id,near],[horizon.id,horizon]]),
  countries:new Map([[near.country,{id:near.country,name:'Near country',type:'country',center:near.coordinates,members:[near]}],
   [horizon.country,{id:horizon.country,name:'Horizon country',type:'country',center:horizon.coordinates,members:[horizon]}]]),
  document:{createElement:node,documentElement:{lang:'en'}},maplibregl:{LngLat:{convert:([lng,lat])=>({lng,lat})}},
  // Both test points pass the coarse hemisphere gate. The farther one becomes
  // hidden only after MapLibre's perspective horizon has been updated.
  d3:{geoDistance:coordinates=>coordinates[0]===30?1.2:.2},
  createCampusDirection:()=>({update:point=>({...point.point,mode:'reticle'}),reset:noop,destroy:noop,isOffscreen:()=>false}),
  clearTimeout:noop,cancelAnimationFrame:noop,detailGate:{hide:noop},
  campusOutbound:{cancel:noop},campusPreloader:{cancel:noop,cancelAnticipation:noop},
  setGestures:noop,emitScope:noop,refreshFade:noop,onStatus:noop,preloadCampus:noop,prepareCampusDetail:noop,scheduleRandomAnticipation:noop,
  navigationPolicy:()=>({}),constrainNavigation:(_,center,zoom)=>({center:{lng:center[0],lat:center[1]},zoom}),
  readLayout(){ctx.width=container.clientWidth;ctx.height=container.clientHeight;ctx.centerPoint=[ctx.width/2,ctx.height/2];ctx.padding={top:0,right:0,bottom:0,left:0};},
  refreshLayout(){ctx.readLayout();},
  setScope(country,campus){ctx.scope={...ctx.scope,level:campus?'campus':country?'country':'world',country,campus};},
  selectCampus(id){const campus=ctx.campusById.get(id);ctx.setScope(campus.country,id);ctx.map.jumpTo({center:campus.coordinates,zoom:17.8,pitch:34});ctx.map.redraw();ctx.syncMarkers();},
 });
 function fire(name){if(name==='projectiontransition')projectionEvents++;for(const listener of events.get(name)||[])listener();}
 ctx.map={
  on(name,listener){events.set(name,[...(events.get(name)||[]),listener]);},fire,
  getCenter:()=>({lng:camera.center[0],lat:camera.center[1],toArray:()=>[...camera.center]}),
  getZoom:()=>camera.zoom,getPitch:()=>camera.pitch,getBearing:()=>camera.bearing,getPadding:()=>copy(camera.padding),
  isMoving:()=>false,getCanvasContainer:node,stop:noop,resize:noop,
  project:coordinates=>({x:projection==='globe'?(coordinates[0]===30?680:340):(coordinates[0]===30?920:80),y:220}),
  transform:{isLocationOccluded:lngLat=>projection==='globe'&&lngLat.lng===30},
  jumpTo(options){for(const key of ['center','zoom','pitch','bearing','padding'])if(options[key]!==undefined)camera[key]=copy(options[key]);fire('move');fire('moveend');},
  redraw(){draws++;projection=camera.zoom<6?'globe':'mercator';fire('render');},
 };
 vm.runInContext(code,ctx);ctx.syncMarkers();
 return {ctx,markers,camera,original,container,get projection(){return projection;},get draws(){return draws;},get projectionEvents(){return projectionEvents;},
  resize(width,height){container.clientWidth=width;container.clientHeight=height;},
 };
}

for(const resized of [false,true])test('campus popup restoration reprojects and clips markers after the globe render'+(resized?' with a changed host size':''),()=>{
 const f=fixture(),session=f.ctx.beginCampusPreview(near.id);
 f.resize(640,420);assert.equal(session.start(),true);
 assert.equal(f.projection,'mercator');assert.deepEqual([...f.markers.keys()],[near.id]);
 f.resize(resized?900:1000,resized?600:700);assert.equal(session.restore(),true);
 assert.equal(f.projection,'globe');assert.equal(f.projectionEvents,0,'automatic zoom projection changes emit no migration event');
 assert.equal(JSON.stringify(f.camera.center),JSON.stringify(f.original.center));assert.equal(f.camera.zoom,f.original.zoom);
 const visible=f.markers.get(near.country),occluded=f.markers.get(horizon.country);
 assert.equal(visible.button.hidden,false);
 assert.equal(visible.holder.style.transform,'translate(340px,220px)','the restored pin must use the rendered globe, not the previous Mercator view');
 assert.equal(occluded.button.hidden,true,'the perspective horizon must hide the far-side pin after restoration');
 const draws=f.draws;f.ctx.map.redraw();
 assert.equal(f.draws,draws+1,'updating HTML markers must not trigger recursive map rendering');
 assert.equal(visible.holder.style.transform,'translate(340px,220px)');
});
