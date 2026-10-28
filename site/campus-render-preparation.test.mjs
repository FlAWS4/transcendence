import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { campusTiles } from './campus-preload.mjs';
import { createCampusRenderPreparation } from './campus-render-preparation.mjs';

const campus = { id: 'paris', coordinates: [2.31838649, 48.896685275] };
const next = () => new Promise(resolve => setImmediate(resolve));
class MapFixture extends EventEmitter {
  camera = { center: [...campus.coordinates], zoom: 17.8, pitch: 34, bearing: 7, roll: 0, padding: { top: 4, right: 5, bottom: 6, left: 70 } };
  jumps = []; loaded = true; sourceLoaded = true; moving = false; autoRender = false; onJump = null;
  getCenter() { return { toArray: () => [...this.camera.center] }; }
  getZoom() { return this.camera.zoom; }
  getPitch() { return this.camera.pitch; }
  getBearing() { return this.camera.bearing; }
  getRoll() { return this.camera.roll; }
  getPadding() { return { ...this.camera.padding }; }
  jumpTo(camera) { this.camera = structuredClone(camera); this.jumps.push(structuredClone(camera)); this.onJump?.(camera); }
  triggerRepaint() { if (this.autoRender) queueMicrotask(() => this.emit('render')); }
  areTilesLoaded() { return this.loaded; }
  isSourceLoaded(id) { assert.equal(id, 'openmaptiles'); return this.sourceLoaded; }
  isMoving() { return this.moving; }
}
function fixture(options = {}) {
  const map = new MapFixture(), hooks = [], states = [], origin = structuredClone(map.camera);
  const controller = createCampusRenderPreparation(map, {
    freeze: () => hooks.push(['freeze', structuredClone(map.camera)]),
    thaw: () => hooks.push(['thaw', structuredClone(map.camera)]),
    setOpaque: opaque => hooks.push(['opaque', opaque]), onChange: state => states.push(state), ...options,
  });
  return { map, controller, hooks, states, origin };
}
function enableBatch(map) {
  const container = { style: { width: '', height: '' } };
  let ratio = 2;
  map.viewportChanges = [];
  map.getContainer = () => container;
  map.getPixelRatio = () => ratio;
  map.resize = () => map.viewportChanges.push({ width: container.style.width, height: container.style.height, ratio });
  map.setPixelRatio = value => { ratio = value; map.resize(); map.onRatio?.(value); };
  return container;
}

test('the same hidden renderer prepares intermediate approach zooms before restoring the safe view', async()=>{
 const {map,controller,hooks}=fixture();enableBatch(map);
 map.camera.zoom=14.5;map.camera.pitch=0;const safe=structuredClone(map.camera);
 const pending=controller.run(campus,{approachZooms:[15,16,17]});await next();
 assert.equal(map.camera.zoom,17.8);map.emit('render');await next();
 for(const zoom of [15,16,17]){
  assert.equal(map.camera.zoom,zoom);assert.deepEqual(map.camera.center,campus.coordinates);
  assert.equal(map.camera.pitch,34);assert.equal(controller.getState().phase,'preparing');
  assert.ok(!hooks.some(([name])=>name==='thaw'));
  map.emit('render');await next();
 }
 assert.deepEqual(map.camera,safe);map.emit('render');
 const result=await pending;assert.equal(result.phase,'ready');assert.deepEqual(result.approachZooms,[15,16,17]);
 assert.deepEqual(hooks.at(-1),['thaw',safe]);controller.destroy();
});

test('cancelling an intermediate zoom restores the safe camera and prevents later poses',async()=>{
 const {map,controller,hooks}=fixture();enableBatch(map);map.camera.zoom=14.5;map.camera.pitch=0;
 const safe=structuredClone(map.camera),pending=controller.run(campus,{approachZooms:[15,16,17]});await next();
 map.emit('render');await next();assert.equal(map.camera.zoom,15);
 controller.cancel();assert.equal((await pending).phase,'cancelled');assert.deepEqual(map.camera,safe);
 const count=map.jumps.length;map.emit('render');await next();assert.equal(map.jumps.length,count);
 assert.deepEqual(hooks.at(-1),['thaw',safe]);controller.destroy();
});

test('preflight restoration conceals the remote source before returning to the departure camera',async()=>{
 const {map,controller,hooks}=fixture();enableBatch(map);map.camera.center=[6,18];map.camera.zoom=2;map.camera.pitch=0;
 const origin=structuredClone(map.camera);let restored=false;
 map.onJump=camera=>{if(camera.zoom===2){restored=true;assert.deepEqual(hooks.at(-1),['opaque',false]);}};
 map.autoRender=true;
 const result=await controller.run(campus,{approachZooms:[14.5,15,16,17],concealBeforeRestore:true});
 assert.equal(result.phase,'ready');assert.equal(restored,true);assert.deepEqual(map.camera,origin);
 assert.equal(hooks.filter(([name,value])=>name==='opaque'&&value===false).length,1);
 assert.deepEqual(hooks.at(-1),['thaw',origin]);controller.destroy();
});

test('batch prepares the complete disk with two loaded frames and a <=1024px backing buffer', async () => {
  const { map, controller, origin, hooks } = fixture(), container = enableBatch(map);
  const result = controller.run(campus, { radiusKm: 3.5 }); await next();
  const side = parseFloat(container.style.width);
  assert.ok(side > 25000 && side < 40000); assert.equal(container.style.height, container.style.width);
  assert.ok(side * map.getPixelRatio() <= 1024.000001);
  assert.equal(controller.getState().mode, 'batch'); assert.equal(map.jumps.length, 1);
  assert.deepEqual(map.camera.center, campus.coordinates); assert.equal(map.camera.pitch, 0);
  assert.equal(controller.getState().completed, 0);
  map.emit('render'); await next();
  assert.equal(controller.getState().completed, campusTiles(campus.coordinates, { radiusKm: 3.5 }).length);
  assert.equal(controller.getState().phase, 'preparing'); assert.equal(map.jumps.length, 2);
  assert.deepEqual(container.style, { width: '', height: '' }); assert.equal(map.getPixelRatio(), 2);
  assert.deepEqual(map.camera, origin); assert.equal(hooks.at(-1)[0], 'opaque');
  map.emit('render'); assert.equal((await result).phase, 'ready');
  assert.equal(map.viewportChanges.length, 2); assert.deepEqual(hooks.at(-1), ['thaw', origin]);
  assert.equal(map.listenerCount('render'), 0); assert.equal(map.listenerCount('error'), 0); controller.destroy();
});

test('batch cancellation restores inline dimensions, ratio and camera before uncovering', async () => {
  let thawState; const { map, controller, origin } = fixture({ thaw: () => {
    thawState = { camera: structuredClone(map.camera), style: { ...map.getContainer().style }, ratio: map.getPixelRatio() };
  } });
  const container = enableBatch(map); container.style.width = '100%'; container.style.height = '480px';
  const result = controller.run(campus); await next(); controller.cancel();
  assert.deepEqual(thawState, { camera: origin, style: { width: '100%', height: '480px' }, ratio: 2 });
  assert.equal((await result).phase, 'cancelled');
  map.emit('render'); await next(); assert.equal(map.jumps.length, 2);
  assert.equal(map.listenerCount('render'), 0); assert.equal(map.listenerCount('error'), 0); controller.destroy();
});

test('batch timeout restores viewport and reports an error instead of prepared data', async () => {
  const { map, controller, origin } = fixture({ timeoutMs: 5, frameTimeoutMs: 100 }), container = enableBatch(map);
  const result = await controller.run(campus);
  assert.equal(result.phase, 'error'); assert.equal(result.completed, 0);
  assert.deepEqual(container.style, { width: '', height: '' }); assert.equal(map.getPixelRatio(), 2); assert.deepEqual(map.camera, origin);
  assert.equal(map.listenerCount('render'), 0); assert.equal(map.listenerCount('error'), 0); controller.destroy();
});

test('cancelling reentrantly during batch resize cannot subsequently move to a probe', async () => {
  const { map, controller } = fixture(), container = enableBatch(map);
  map.onRatio = value => { if (value < 1) controller.cancel(); };
  assert.equal((await controller.run(campus)).phase, 'cancelled');
  assert.deepEqual(container.style, { width: '', height: '' }); assert.equal(map.getPixelRatio(), 2);
  assert.equal(map.jumps.length, 0); assert.equal(map.listenerCount('render'), 0); assert.equal(map.listenerCount('error'), 0); controller.destroy();
});

test('waits for a fresh rendered, loaded pose and restores a rendered arrival before reveal', async () => {
  const { map, controller, hooks, origin } = fixture();
  const result = controller.run(campus);
  await next();
  assert.equal(map.jumps.length, 1); assert.equal(controller.getState().completed, 0);
  assert.deepEqual(hooks.slice(0, 2), [['freeze', origin], ['opaque', true]]);
  map.emit('idle'); await next(); assert.equal(map.jumps.length, 1);
  map.loaded = false; map.emit('render'); await next(); assert.equal(map.jumps.length, 1);
  map.loaded = true; map.sourceLoaded = false; map.emit('render'); await next(); assert.equal(map.jumps.length, 1);
  map.sourceLoaded = true;
  const tiles = campusTiles(campus.coordinates);
  for (let i = 0; i < tiles.length; i++) { map.emit('render'); await next(); }
  assert.equal(controller.getState().completed, 21); assert.equal(controller.getState().phase, 'preparing');
  assert.deepEqual(map.camera, origin); assert.equal(hooks.at(-1)[0], 'opaque');
  map.emit('render'); const ready = await result;
  assert.equal(ready.phase, 'ready'); assert.equal(ready.total, 21); assert.ok(ready.durationMs >= 0);
  assert.deepEqual(hooks.slice(-2), [['opaque', false], ['thaw', origin]]);
  assert.equal(map.listenerCount('render'), 0); assert.equal(map.listenerCount('error'), 0);
  for (let i = 0; i < tiles.length; i++) {
    const { x, y } = tiles[i], [longitude, latitude] = map.jumps[i].center;
    assert.equal(Math.floor((longitude + 180) / 360 * 16384), x);
    assert.equal(Math.floor((1 - Math.asinh(Math.tan(latitude * Math.PI / 180)) / Math.PI) / 2 * 16384), y);
    assert.equal(map.jumps[i].pitch, 0); assert.equal(map.jumps[i].padding, 0); assert.equal(map.jumps[i].zoom, 17.8);
  }
  controller.destroy();
});

test('cancel synchronously restores the camera before thaw and prevents stale frames reviving work', async () => {
  const { map, controller, hooks, origin } = fixture();
  const pending = controller.run(campus); await next();
  controller.cancel();
  assert.deepEqual(map.camera, origin); assert.deepEqual(hooks.at(-1), ['thaw', origin]);
  const jumps = map.jumps.length;
  map.emit('render'); map.emit('idle'); await next();
  assert.equal(map.jumps.length, jumps); assert.equal((await pending).phase, 'cancelled');
  assert.equal(map.listenerCount('render'), 0); assert.equal(map.listenerCount('error'), 0); controller.destroy();
});

test('deduplicates only a running preparation and retests completed cache on the next arrival', async () => {
  const { map, controller } = fixture();
  const first = controller.run(campus, { radiusKm: 3 });
  assert.equal(controller.run(campus, { radiusKm: 3 }), first);
  map.autoRender = true; assert.equal((await first).phase, 'ready');
  const firstCount = map.jumps.length;
  const second = controller.run(campus, { radiusKm: 3 }); assert.notEqual(second, first);
  assert.equal((await second).phase, 'ready'); assert.equal(map.jumps.length, firstCount * 2); controller.destroy();
});

test('source errors fail closed, unrelated source errors are ignored, and cleanup is complete', async () => {
  const { map, controller, origin, hooks } = fixture();
  const result = controller.run(campus); await next();
  map.emit('error', { sourceId: 'world', error: new Error('unrelated') });
  assert.equal(controller.getState().phase, 'preparing');
  map.emit('error', { sourceId: 'openmaptiles', error: new Error('tile failed') });
  assert.equal((await result).phase, 'error'); assert.match(controller.getState().error, /tile failed/);
  assert.deepEqual(map.camera, origin); assert.deepEqual(hooks.at(-1), ['thaw', origin]);
  assert.equal(map.listenerCount('render'), 0); assert.equal(map.listenerCount('error'), 0); controller.destroy();
});

test('per-pose and global timeouts restore camera without claiming readiness', async () => {
  for (const options of [{ timeoutMs: 100, frameTimeoutMs: 5 }, { timeoutMs: 5, frameTimeoutMs: 100 }]) {
    const { map, controller, origin } = fixture(options);
    const result = await controller.run(campus);
    assert.equal(result.phase, 'error'); assert.match(result.error, /timed out/); assert.equal(result.completed, 0);
    assert.deepEqual(map.camera, origin); assert.equal(map.listenerCount('render'), 0); assert.equal(map.listenerCount('error'), 0);
    controller.destroy();
  }
});

test('external abort and same-turn cancellation do not leave hooks or listeners attached', async () => {
  const { map, controller, hooks, origin } = fixture();
  const immediate = controller.run(campus); controller.cancel();
  assert.equal((await immediate).phase, 'cancelled'); await next(); assert.equal(hooks.length, 0); assert.equal(map.jumps.length, 0);
  const abort = new AbortController(), pending = controller.run(campus, { signal: abort.signal }); await next();
  abort.abort(); assert.deepEqual(map.camera, origin); assert.equal((await pending).phase, 'cancelled');
  assert.equal(map.listenerCount('render'), 0); assert.equal(map.listenerCount('error'), 0); controller.destroy();
});

test('reentrant freeze cancellation cannot enable opaque rendering or move the camera afterwards', async () => {
  let controller; const hooks = [], map = new MapFixture();
  controller = createCampusRenderPreparation(map, { freeze: () => { hooks.push('freeze'); controller.cancel(); },
    thaw: () => hooks.push('thaw'), setOpaque: value => hooks.push(value) });
  assert.equal((await controller.run(campus)).phase, 'cancelled');
  assert.deepEqual(hooks, ['freeze', 'thaw']); assert.equal(map.jumps.length, 0);
  assert.equal(map.listenerCount('render'), 0); assert.equal(map.listenerCount('error'), 0); controller.destroy();
});

test('a replacement run requested during thaw waits until previous camera cleanup has finished', async () => {
  const map = new MapFixture(), origin = structuredClone(map.camera); let controller, replacement, replaced = false;
  controller = createCampusRenderPreparation(map, { thaw: () => {
    if (!replaced) { replaced = true; replacement = controller.run(campus, { radiusKm: 3.8 }); }
  } });
  const first = controller.run(campus); await next(); map.autoRender = true; controller.cancel();
  assert.deepEqual(map.camera, origin); assert.equal((await first).phase, 'cancelled');
  const result = await replacement;
  assert.equal(result.phase, 'ready'); assert.ok(result.total > 21); assert.deepEqual(map.camera, origin); controller.destroy();
});

test('destroy inside a notification cancels cleanly and never notifies again', async () => {
  let controller; const map = new MapFixture(), states = [];
  controller = createCampusRenderPreparation(map, { onChange: state => { states.push(state); controller.destroy(); } });
  assert.equal((await controller.run(campus)).phase, 'cancelled'); assert.equal(states.length, 1);
  assert.equal(map.jumps.length, 0); assert.equal(map.listenerCount('render'), 0); assert.equal(map.listenerCount('error'), 0);
  assert.equal((await controller.run(campus)).phase, 'cancelled'); assert.equal(states.length, 1);
});
