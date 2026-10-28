import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {prepareWorldRender} from './world-render-preparation.mjs';

class FakeMap extends EventEmitter {
 views=[];repaints=0;moving=false;tiles=true;loaded=true;
 getSource(id){return ['world','world-borders'].includes(id)?{}:undefined;}
 jumpTo(view){this.views.push(view);}
 triggerRepaint(){this.repaints++;}
 isMoving(){return this.moving;}
 areTilesLoaded(){return this.tiles;}
 isSourceLoaded(){return this.loaded;}
}
const view=()=>({center:[6,18],zoom:2.28,pitch:0,bearing:0,padding:{left:80,right:0,top:0,bottom:0}});
const next=()=>new Promise(resolve=>setImmediate(resolve));
const noListeners=map=>['render','idle','error'].every(name=>map.listenerCount(name)===0);

test('parents, opposite hemisphere and final view each need a fresh rendered and loaded frame',async()=>{
 const map=new FakeMap();const result=prepareWorldRender(map,{getView:view});
 assert.deepEqual(map.views.map(item=>item.zoom),[0]);
 map.emit('idle');await next();assert.equal(map.views.length,1);
 map.tiles=false;map.emit('render');await next();assert.equal(map.views.length,1);
 map.tiles=true;map.emit('idle');await next();assert.deepEqual(map.views.map(item=>item.zoom),[0,1]);
 map.emit('idle');await next();assert.equal(map.views.length,2);
 map.emit('render');await next();assert.deepEqual(map.views.map(item=>item.zoom),[0,1,2.28]);
 assert.deepEqual(map.views.at(-1).center,[-174,-18]);
 map.emit('render');await next();assert.deepEqual(map.views.at(-1).center,[6,18]);
 let done=false;result.then(()=>{done=true;});await next();assert.equal(done,false);
 map.emit('render');assert.deepEqual(await result,{preparedZooms:[0,1],zoom:2.28});
 assert.equal(map.repaints,4);assert.ok(noListeners(map));
});

test('movement and source readiness still block after rendering',async()=>{
 const map=new FakeMap(),controller=new AbortController();
 const result=prepareWorldRender(map,{getView:view,signal:controller.signal});
 map.moving=true;map.emit('render');await next();assert.equal(map.views.length,1);
 map.moving=false;map.loaded=false;map.emit('render');await next();assert.equal(map.views.length,1);
 map.loaded=true;map.emit('render');await next();assert.equal(map.views.length,2);
 controller.abort();await assert.rejects(result,{name:'AbortError'});assert.ok(noListeners(map));
});

test('final camera is read again after parents so a resized layout is restored',async()=>{
 const map=new FakeMap();let zoom=2;
 const result=prepareWorldRender(map,{getView:()=>({...view(),zoom})});
 map.emit('render');await next();zoom=1.3;map.emit('render');await next();
 assert.equal(map.views.at(-1).zoom,1.3);map.emit('render');await next();map.emit('render');await result;
 assert.ok(noListeners(map));
});

test('camera writes use the supplied navigation guard and never another map',async()=>{
 const map=new FakeMap();let guarded=0;
 const result=prepareWorldRender(map,{getView:view,moveView:camera=>{guarded++;map.jumpTo(camera);}});
 for(let i=0;i<4;i++){map.emit('render');await next();}
 await result;assert.equal(guarded,4);assert.equal(map.views.length,4);
});

test('a resize during the final render prepares the new camera before ready',async()=>{
 const map=new FakeMap();let zoom=2;
 const result=prepareWorldRender(map,{getView:()=>({...view(),zoom})});
 map.emit('render');await next();map.emit('render');await next();
 map.emit('render');await next();
 assert.equal(map.views.at(-1).zoom,2);
 zoom=1.4;map.emit('render');await next();
 assert.equal(map.views.at(-1).zoom,1.4);
 let done=false;result.then(()=>{done=true;});await next();assert.equal(done,false);
 map.emit('render');assert.equal((await result).zoom,1.4);
 assert.ok(noListeners(map));
});

test('abort, local error and timeout clean every listener without advancing',async()=>{
 for(const mode of ['abort','error','timeout']){
  const map=new FakeMap(),controller=new AbortController();
  const result=prepareWorldRender(map,{getView:view,signal:controller.signal,timeoutMs:10});
  if(mode==='abort')controller.abort();
  if(mode==='error')map.emit('error',{sourceId:'world',error:new Error('geometry failed')});
  await assert.rejects(result);assert.ok(noListeners(map));
  map.emit('render');map.emit('idle');assert.equal(map.views.length,1);
 }
});

test('an unrelated source error does not fail local preparation',async()=>{
 const map=new FakeMap();const result=prepareWorldRender(map,{getView:view});
 map.emit('error',{sourceId:'openmaptiles',error:new Error('unrelated')});
 for(let i=0;i<4;i++){map.emit('render');await next();}
 await result;assert.ok(noListeners(map));
});

test('camera exceptions and synchronous readiness errors reject rather than publish ready',async()=>{
 const map=new FakeMap();
 await assert.rejects(prepareWorldRender(map,{getView:view,moveView:()=>{throw new Error('removed');}}),/removed/);
 assert.ok(noListeners(map));
 const second=new FakeMap();second.isSourceLoaded=()=>{second.emit('error',{sourceId:'world'});return true;};
 const result=prepareWorldRender(second,{getView:view});second.emit('render');
 await assert.rejects(result);assert.ok(noListeners(second));assert.equal(second.views.length,1);
});
