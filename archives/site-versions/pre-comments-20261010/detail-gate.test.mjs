import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createGlobeDetailGate} from './detail-gate.mjs';

function fixture({reduced = true, onOpacity, onVisible, onChange, isPrepared,isZoomApproach} = {}) {
 class FakeMap extends EventEmitter {
  zoom=14.5;getZoom(){return this.zoom;}
  moving = false;tilesLoaded = true;sourceLoaded = true;repaints = 0;
  isMoving(){return this.moving;}
  areTilesLoaded(){return this.tilesLoaded;}
  isSourceLoaded(id){assert.equal(id,'openmaptiles');return this.sourceLoaded;}
  triggerRepaint(){this.repaints++;}
 }
 const map = new FakeMap(),calls = [],changes = [];
 const gate = createGlobeDetailGate(map,{
  setVisible:visible => {calls.push(['visible',visible]);onVisible?.(visible);},
  setOpacity:(opacity,options) => {calls.push(['opacity',opacity,options.duration]);onOpacity?.(opacity,options);},
  reducedMotion:() => typeof reduced === 'function' ? reduced() : reduced,
  isPrepared,isZoomApproach,
  onChange:state => {changes.push(state);onChange?.(state);},
 });
 return {map,calls,changes,gate};
}
const ready = map => {map.emit('render');map.emit('idle');};
const wait = ms => new Promise(resolve => setTimeout(resolve,ms));

test('a prepared zoom fade remains camera-driven until explicit completion, with no timed reveal',async()=>{
 const paints=[],{map,gate}=fixture({reduced:false,onOpacity:(value,options)=>paints.push([value,options])});
 gate.prepare();
 assert.equal(gate.beginZoomFade({from:14.5,to:17.8}),true);
 assert.deepEqual(paints.at(-1),[1,{duration:0,zoomRange:{from:14.5,to:17.8}}]);
 ready(map);await wait(5);
 assert.deepEqual(gate.getState(),{phase:'moving',opacityTarget:1});
 const count=paints.length;gate.defer({preserveMoving:true});assert.equal(paints.length,count);
 assert.equal(gate.finishZoomFade(),true);
 assert.deepEqual(paints.at(-1),[1,{duration:0}]);assert.equal(gate.getState().phase,'detail');gate.destroy();
});

test('cancellation or source error cannot complete or revive a zoom-driven approach',()=>{
 for(const action of ['hide','defer','destroy','error']){
  const {map,gate,calls}=fixture();gate.beginZoomFade({from:14.5,to:17.8},{opacity:.4});
  if(action==='error')map.emit('error',{sourceId:'openmaptiles'});else gate[action]();
  const count=calls.length;
  assert.equal(gate.finishZoomFade(),false,action);ready(map);assert.equal(calls.length,count,action);
  if(action==='error')assert.equal(gate.beginZoomFade({from:14.5,to:17.8}),false);
  gate.destroy();
 }
});

test('preparation hides opacity before enabling layers; idle alone cannot reveal stale cache',()=>{
 const {map,calls,gate} = fixture();
 gate.prepare();
 assert.deepEqual(calls,[['opacity',0,0],['visible',true]]);
 assert.deepEqual(gate.getState(),{phase:'waiting',opacityTarget:0});
 assert.equal(map.repaints,1);
 map.emit('idle');assert.equal(gate.getState().phase,'waiting');
 ready(map);
 assert.deepEqual(gate.getState(),{phase:'detail',opacityTarget:1});
 assert.deepEqual(calls.at(-1),['opacity',1,0]);
 gate.destroy();
});

test('render reveals without waiting for idle only after movement, tile and source loading complete',()=>{
 const {map,calls,gate} = fixture();map.moving = true;gate.prepare();
 map.emit('render');assert.equal(gate.getState().phase,'waiting');
 map.moving = false;map.tilesLoaded = false;map.emit('render');assert.equal(gate.getState().phase,'waiting');
 map.tilesLoaded = true;map.sourceLoaded = false;map.emit('render');assert.equal(gate.getState().phase,'waiting');
 map.sourceLoaded = true;map.emit('render');assert.equal(gate.getState().phase,'detail');
 assert.equal(calls.filter(call => call[0] === 'opacity' && call[1] === 1).length,1);
 gate.destroy();
});

test('defer and hide invalidate a waiting reveal; a new prepare needs a fresh render',()=>{
 const {map,calls,gate} = fixture();map.tilesLoaded = false;gate.prepare();map.emit('render');
 gate.defer();map.emit('idle');
 assert.deepEqual(gate.getState(),{phase:'local',opacityTarget:0});
 assert.deepEqual(calls.slice(-2),[['opacity',0,0],['visible',false]]);
 gate.prepare();map.emit('idle');assert.equal(gate.getState().phase,'waiting');
 gate.hide();ready(map);assert.equal(gate.getState().phase,'local');
 map.tilesLoaded = true;gate.prepare();ready(map);assert.equal(gate.getState().phase,'detail');
 gate.destroy();
});

test('repeated prepare cancels the prior readiness generation without losing the next render',()=>{
 const {map,gate} = fixture();map.tilesLoaded = false;gate.prepare();map.emit('render');
 gate.prepare();map.emit('idle');assert.equal(gate.getState().phase,'waiting');
 assert.equal(map.repaints,2);map.tilesLoaded = true;ready(map);assert.equal(gate.getState().phase,'detail');
 gate.destroy();
});

test('source errors keep the local view and stay sticky even when errored tiles report loaded',()=>{
 const {map,calls,gate} = fixture();map.tilesLoaded = false;gate.prepare();map.emit('render');
 map.emit('error',{sourceId:'openmaptiles',error:new Error('tile failed')});
 assert.deepEqual(gate.getState(),{phase:'error',opacityTarget:0});
 map.tilesLoaded = true;ready(map);gate.prepare();assert.equal(gate.getState().phase,'error');
 gate.hide();assert.equal(gate.getState().phase,'local');
 gate.prepare();ready(map);assert.equal(gate.getState().phase,'error');
 assert.ok(!calls.some(call => call[0] === 'opacity' && call[1] === 1));
 gate.destroy();
});

test('metadata/glyph errors without sourceId are remembered before preparation',()=>{
 const {map,calls,gate} = fixture();
 map.emit('error',{error:new Error('glyph request failed')});
 gate.prepare();ready(map);
 assert.deepEqual(gate.getState(),{phase:'error',opacityTarget:0});
 assert.ok(!calls.some(call => call[0] === 'visible' && call[1]));
 gate.destroy();
});

test('an explicitly unrelated source error does not block remote detail',()=>{
 const {map,gate} = fixture();gate.prepare();
 map.emit('error',{sourceId:'world',error:new Error('other source')});
 ready(map);assert.equal(gate.getState().phase,'detail');gate.destroy();
});

test('an already detailed view survives prepare/defer without opacity reset',()=>{
 const {map,calls,gate} = fixture();gate.prepare();ready(map);
 const before = calls.length;gate.defer();gate.prepare();ready(map);
 assert.equal(calls.length,before);assert.equal(gate.getState().phase,'detail');
 gate.hide();assert.deepEqual(gate.getState(),{phase:'local',opacityTarget:0});gate.destroy();
});

test('a 450 ms reveal continues across defer/prepare, while hide cancels its final state',async()=>{
 const first = fixture({reduced:false}),second = fixture({reduced:false});
 first.gate.prepare();ready(first.map);second.gate.prepare();ready(second.map);
 assert.deepEqual(first.calls.at(-1),['opacity',1,450]);
 assert.equal(first.gate.getState().phase,'revealing');
 const count = first.calls.length;first.gate.defer();first.gate.prepare();
 assert.equal(first.calls.length,count);
 second.gate.hide();
 await wait(480);
 assert.equal(first.gate.getState().phase,'detail');
 assert.deepEqual(second.gate.getState(),{phase:'local',opacityTarget:0});
 first.gate.destroy();second.gate.destroy();
});

test('destroy detaches events and cancels a pending reveal without further callbacks',async()=>{
 const {map,calls,changes,gate} = fixture({reduced:false});
 gate.prepare();ready(map);gate.destroy();
 const count = calls.length,changeCount = changes.length;
 assert.equal(map.listenerCount('render'),0);assert.equal(map.listenerCount('idle'),0);assert.equal(map.listenerCount('error'),0);
 ready(map);gate.prepare();gate.hide();gate.defer();
 await wait(480);
 assert.equal(calls.length,count);assert.equal(changes.length,changeCount);
});

test('fade to local waits before hiding an already revealed map and resolving true',async()=>{
 let reduced = true;
 const {map,calls,gate} = fixture({reduced:() => reduced});gate.prepare();ready(map);reduced = false;
 const before = calls.length;
 const result = gate.fadeToLocal({duration:25});
 assert.deepEqual(gate.getState(),{phase:'fading',opacityTarget:0});
 assert.deepEqual(calls.slice(before),[['opacity',0,25]]);
 let settled = false;result.then(() => {settled = true;});
 await Promise.resolve();assert.equal(settled,false);
 assert.equal(await result,true);
 assert.deepEqual(calls.slice(before),[['opacity',0,25],['visible',false]]);
 assert.deepEqual(gate.getState(),{phase:'local',opacityTarget:0});gate.destroy();
});

test('fade cancels an in-progress reveal; reduced motion exposes local immediately',async()=>{
 let reduced = false;
 const {map,calls,gate} = fixture({reduced:() => reduced});gate.prepare();ready(map);
 assert.equal(gate.getState().phase,'revealing');reduced = true;
 const result = gate.fadeToLocal();
 assert.deepEqual(calls.slice(-2),[['opacity',0,0],['visible',false]]);
 assert.deepEqual(gate.getState(),{phase:'local',opacityTarget:0});
 assert.equal(await result,true);gate.destroy();
});

test('local, waiting and error views hide immediately without waiting for fade duration',async()=>{
 for(const initial of ['local','waiting','error']){
  const {map,calls,gate} = fixture({reduced:false});
  if(initial !== 'local')gate.prepare();
  if(initial === 'error')map.emit('error',{sourceId:'openmaptiles'});
  const result = gate.fadeToLocal({duration:5000});
  assert.deepEqual(gate.getState(),{phase:'local',opacityTarget:0});
  assert.deepEqual(calls.slice(-2),[['opacity',0,0],['visible',false]]);
  assert.equal(await result,true);gate.destroy();
 }
});

test('prepare, defer, hide and destroy each settle an interrupted fade as false',async()=>{
 for(const interruption of ['prepare','defer','hide','destroy']){
  const {map,calls,gate} = fixture({reduced:false});gate.prepare();ready(map);
  const result = gate.fadeToLocal({duration:20});gate[interruption]();
  assert.equal(await result,false,interruption);
  const before = calls.length;await wait(30);assert.equal(calls.length,before,interruption);
  if(interruption === 'prepare'){
   assert.equal(gate.getState().phase,'waiting');
   assert.deepEqual(calls.at(-1),['visible',true]);
  }
  if(interruption === 'defer' || interruption === 'hide')assert.equal(gate.getState().phase,'local');
  gate.destroy();
 }
});

test('a newer fade settles the previous promise and alone completes the return',async()=>{
 const {map,gate} = fixture({reduced:false});gate.prepare();ready(map);
 const first = gate.fadeToLocal({duration:5000});
 const second = gate.fadeToLocal({duration:15});
 assert.equal(await first,false);assert.equal(await second,true);
 assert.equal(gate.getState().phase,'local');gate.destroy();
 assert.equal(await gate.fadeToLocal(),false);
});

test('reentrant opacity callbacks cancel registered timers without hiding a new preparation',async()=>{
 let armed = false,gate;
 const scene = fixture({reduced:false,onOpacity(value){
  if(armed && value === 0){armed = false;gate.prepare();}
 }});gate = scene.gate;gate.prepare();ready(scene.map);armed = true;
 const result = gate.fadeToLocal({duration:15});
 assert.equal(await result,false);
 assert.equal(gate.getState().phase,'waiting');
 assert.deepEqual(scene.calls.at(-1),['visible',true]);
 const before = scene.calls.length;await wait(25);assert.equal(scene.calls.length,before);gate.destroy();
});

test('reentrant completion notification can cancel a fade without leaving its promise pending',async()=>{
 let armed = false,gate;
 const scene = fixture({reduced:false,onChange(state){
  if(armed && state.phase === 'local'){armed = false;gate.defer();}
 }});gate = scene.gate;gate.prepare();ready(scene.map);armed = true;
 assert.equal(await gate.fadeToLocal({duration:10}),false);
 assert.equal(gate.getState().phase,'local');gate.destroy();
});

test('idle remains a fallback after a fresh frame whose source was not ready yet',()=>{
 const {map,calls,gate} = fixture();map.sourceLoaded = false;gate.prepare();map.emit('render');
 assert.equal(gate.getState().phase,'waiting');map.sourceLoaded = true;map.emit('idle');
 assert.equal(gate.getState().phase,'detail');
 const count = calls.length;map.emit('render');map.emit('idle');assert.equal(calls.length,count);
 gate.destroy();
});

test('errors emitted while checking render readiness prevent revealing an errored source',()=>{
 const {map,calls,gate} = fixture();gate.prepare();
 map.isSourceLoaded = () => {map.emit('error',{sourceId:'openmaptiles'});return true;};
 map.emit('render');
 assert.deepEqual(gate.getState(),{phase:'error',opacityTarget:0});
 assert.ok(!calls.some(call => call[0] === 'opacity' && call[1] === 1));gate.destroy();
});

test('external area preparation blocks ready view until refresh and a fresh rendered frame',()=>{
 let prepared = false;
 const {map,calls,gate} = fixture({isPrepared:() => prepared});gate.prepare();ready(map);
 assert.deepEqual(gate.getState(),{phase:'waiting',opacityTarget:0});
 assert.ok(!calls.some(call => call[0] === 'opacity' && call[1] === 1));
 prepared = true;gate.refresh();
 assert.equal(map.repaints,2);assert.equal(gate.getState().phase,'waiting');
 map.emit('idle');assert.equal(gate.getState().phase,'waiting');
 map.emit('render');assert.equal(gate.getState().phase,'detail');gate.destroy();
});

test('external refresh before first render cannot reveal a stale cached view',()=>{
 const {map,gate} = fixture({isPrepared:() => true});gate.prepare();gate.refresh();
 map.emit('idle');assert.equal(gate.getState().phase,'waiting');
 map.emit('render');assert.equal(gate.getState().phase,'detail');gate.destroy();
});

test('late external completions cannot revive hidden, deferred or destroyed preparations',()=>{
 for(const interruption of ['hide','defer','destroy']){
  let prepared = false;
  const {map,calls,gate} = fixture({isPrepared:() => prepared});gate.prepare();map.emit('render');
  gate[interruption]();const repaints = map.repaints,before = calls.length;
  prepared = true;gate.refresh();ready(map);
  assert.equal(map.repaints,repaints,interruption);assert.equal(calls.length,before,interruption);
  gate.destroy();
 }
});

test('refresh from an older destination still tests the current destination preparation',()=>{
 let destination = 'first';const prepared = new Set();
 const {map,gate} = fixture({isPrepared:() => prepared.has(destination)});
 gate.prepare();map.emit('render');gate.defer();destination = 'second';gate.prepare();
 prepared.add('first');gate.refresh();ready(map);assert.equal(gate.getState().phase,'waiting');
 prepared.add('second');gate.refresh();map.emit('render');assert.equal(gate.getState().phase,'detail');
 gate.destroy();
});

test('reentrant external readiness cannot reveal a newly prepared destination from the old frame',()=>{
 let replace = true,gate;
 const scene = fixture({isPrepared:() => {
  if(replace){replace = false;gate.prepare();}
  return true;
 }});gate = scene.gate;gate.prepare();scene.map.emit('render');
 assert.equal(gate.getState().phase,'waiting');
 assert.ok(!scene.calls.some(call => call[0] === 'opacity' && call[1] === 1));
 scene.map.emit('render');assert.equal(gate.getState().phase,'detail');gate.destroy();
});

test('external readiness emitting a source error cannot reveal the errored view',()=>{
 let map;
 const scene = fixture({isPrepared:() => {map.emit('error',{sourceId:'openmaptiles'});return true;}});
 map = scene.map;scene.gate.prepare();map.emit('render');
 assert.deepEqual(scene.gate.getState(),{phase:'error',opacityTarget:0});
 assert.ok(!scene.calls.some(call => call[0] === 'opacity' && call[1] === 1));scene.gate.destroy();
});

test('explicit retry clears old source failure but still requires current external preparation and render',()=>{
 let prepared = false;
 const {map,gate} = fixture({isPrepared:() => prepared});gate.prepare();
 map.emit('error',{sourceId:'openmaptiles'});gate.prepare();
 assert.equal(gate.getState().phase,'error');
 gate.prepare({retry:true});assert.equal(gate.getState().phase,'waiting');
 map.emit('idle');assert.equal(gate.getState().phase,'waiting');
 ready(map);assert.equal(gate.getState().phase,'waiting');
 prepared = true;gate.refresh();map.emit('render');assert.equal(gate.getState().phase,'detail');gate.destroy();
});


test('progressive approach requires a fresh ready urban frame but does not wait for the world or raw radius',()=>{
 const paints=[];let targetReady=false;
 const {map,gate}=fixture({reduced:false,isPrepared:()=>targetReady,isZoomApproach:()=>true,onOpacity:(value,options)=>paints.push([value,options])});
 map.moving=true;map.tilesLoaded=false;map.sourceLoaded=false;
 gate.prepare({allowMoving:true,zoomRange:{from:14.5,to:16.2}});
 map.emit('render');assert.equal(gate.getState().phase,'waiting');
 map.sourceLoaded=true;map.emit('render');assert.equal(gate.getState().phase,'waiting');
 targetReady=true;map.emit('render');assert.equal(gate.getState().phase,'moving');
 assert.deepEqual(paints.at(-1),[1,{duration:0,zoomRange:{from:14.5,to:16.2}}]);
 gate.finishZoomFade();assert.equal(gate.getState().phase,'detail');gate.destroy();
});

test('a later ready frame starts at zero alpha at its actual approach zoom instead of popping',()=>{
 const paints=[],{map,gate}=fixture({reduced:false,isZoomApproach:()=>true,onOpacity:(value,options)=>paints.push([value,options])});
 map.moving=true;map.zoom=15.8;
 gate.prepare({allowMoving:true,zoomRange:{from:14.5,to:16.2}});map.emit('render');
 assert.equal(gate.getState().phase,'moving');assert.deepEqual(paints.at(-1),[1,{duration:0,zoomRange:{from:15.8,to:17}}]);
 gate.destroy();
});

test('a late view during a pan uses a timed fade instead of a zero-alpha zoom ramp that never advances',async()=>{
 const paints=[],{map,gate}=fixture({reduced:false,isZoomApproach:()=>false,onOpacity:(value,options)=>paints.push([value,options])});
 map.moving=true;map.zoom=15;
 gate.prepare({allowMoving:true,zoomRange:{from:14.5,to:16.2}});map.emit('render');
 assert.equal(gate.getState().phase,'revealing');assert.deepEqual(paints.at(-1),[1,{duration:450}]);
 await wait(480);assert.equal(gate.getState().phase,'detail');gate.destroy();
});

test('a cancelled streaming destination cannot reveal from a late render or source completion',()=>{
 const {map,gate,calls}=fixture({reduced:false,isZoomApproach:()=>true});map.moving=true;map.sourceLoaded=false;
 gate.prepare({allowMoving:true,zoomRange:{from:14.5,to:16.2}});map.emit('render');gate.hide();
 const count=calls.length;map.sourceLoaded=true;map.emit('render');map.emit('idle');
 assert.equal(calls.length,count);assert.equal(gate.getState().phase,'local');gate.destroy();
});
