import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {
  createGlobeStyle, GLOBE_DETAIL_LAYER_IDS, setGlobeDetailVisible,
  setGlobeDetailOpacity, applyGlobeTheme, ensureGlobeDetail, getGlobeDetailOpacity,
} from './globe-style.mjs';

const detailIds = new Set(GLOBE_DETAIL_LAYER_IDS);
const clone = value => structuredClone(value);
function fixture(dark = false, options = {}) {
  const style = createGlobeStyle(dark, [], options);
  return {
    style,
    getLayer(id) { return style.layers.find(layer => layer.id === id); },
    getSource(id) { return style.sources[id]; },
    addSource(id, source) { assert.ok(!style.sources[id]);style.sources[id] = clone(source); },
    addLayer(layer) { assert.ok(!this.getLayer(layer.id));style.layers.push(clone(layer)); },
    setGlyphs(url) { style.glyphs = url; },
    getPaintProperty(id, key) { return this.getLayer(id).paint?.[key]; },
    setPaintProperty(id, key, value) { this.getLayer(id).paint[key] = clone(value); },
    getLayoutProperty(id, key) { return this.getLayer(id).layout?.[key]; },
    setLayoutProperty(id, key, value) { (this.getLayer(id).layout ??= {})[key] = value; },
    setLight(light) { style.light = clone(light); },
  };
}
function opacities(style) {
  return style.layers.filter(layer => detailIds.has(layer.id)).flatMap(layer =>
    Object.entries(layer.paint).filter(([key]) => key.endsWith('-opacity'))
      .map(([key, value]) => ({ id: layer.id, key, value })));
}
function assertScaled(map, baseline, multiplier) {
  for (const { id, key, value } of opacities(baseline)) {
    const actual = map.getPaintProperty(id, key);
    if (multiplier === 0) assert.equal(actual, 0, `${id}/${key}`);
    else if (typeof value === 'number') assert.equal(actual, value * multiplier, `${id}/${key}`);
    else {
      assert.deepEqual(actual.slice(0, 3), value.slice(0, 3), `${id}: root zoom interpolation`);
      for (let index = 3; index < value.length; index++) {
        assert.equal(actual[index], index % 2 ? value[index] : value[index] * multiplier, `${id}: stop ${index}`);
      }
    }
  }
}

test('zero hides all detail paints instantly without changing layout, local base or source', () => {
  const map = fixture(), before = clone(map.style);
  assert.equal(setGlobeDetailOpacity(map, 0), true);
  assertScaled(map, before, 0);
  for (const layer of before.layers) {
    assert.deepEqual(map.getLayer(layer.id).layout, layer.layout);
    if (!detailIds.has(layer.id)) assert.deepEqual(map.getLayer(layer.id), layer);
  }
  assert.deepEqual(map.style.sources, before.sources);
  for (const { id, key } of opacities(before)) {
    assert.deepEqual(map.getPaintProperty(id, `${key}-transition`), { duration: 0, delay: 0 });
  }
});

test('partial opacity preserves every zoom stop and never compounds successive multipliers', () => {
  const map = fixture(), before = clone(map.style);
  for (const amount of [.5, .25, .75, 1]) {
    setGlobeDetailOpacity(map, amount);
    assertScaled(map, before, amount);
  }
});

test('native reveal transitions cover background, water, text, lines and extrusion', () => {
  const map = fixture(), before = clone(map.style);
  setGlobeDetailOpacity(map, 0);
  setGlobeDetailVisible(map, true);
  setGlobeDetailOpacity(map, 1, { duration: 500 });
  assertScaled(map, before, 1);
  for (const { id, key } of opacities(before)) {
    assert.deepEqual(map.getPaintProperty(id, `${key}-transition`), { duration: 500, delay: 0 });
  }
  assert.equal(map.getLayoutProperty('h42-water', 'visibility'), 'visible');
  setGlobeDetailOpacity(map, 0);
  assertScaled(map, before, 0);
  assert.equal(map.getLayoutProperty('h42-water', 'visibility'), 'visible');
});

test('theme changes keep hidden and partially revealed detail at its current multiplier', () => {
  const map = fixture();
  setGlobeDetailVisible(map, true);
  for (const multiplier of [0, .5, 1]) {
    setGlobeDetailOpacity(map, multiplier);
    for (const dark of [true, false]) {
      assert.equal(applyGlobeTheme(map, dark), true);
      const themed = createGlobeStyle(dark, []);
      assertScaled(map, themed, multiplier);
      assert.deepEqual(map.getPaintProperty('h42-water', 'fill-color'), themed.layers.find(layer => layer.id === 'h42-water').paint['fill-color']);
      assert.equal(map.getLayoutProperty('h42-water', 'visibility'), 'visible');
    }
  }
});

test('state is independent per map and captures an initially dark theme', () => {
  const light = fixture(), dark = fixture(true), darkBaseline = clone(dark.style);
  setGlobeDetailOpacity(light, 0);
  setGlobeDetailOpacity(dark, .5);
  assertScaled(light, createGlobeStyle(), 0);
  assertScaled(dark, darkBaseline, .5);
  applyGlobeTheme(light, true);
  assertScaled(dark, darkBaseline, .5);
});

test('compatibility visibility setter leaves opacity and local world layers intact', () => {
  const map = fixture(), local = clone(map.getLayer('h42-world-land'));
  setGlobeDetailOpacity(map, .5);
  for (const visible of [true, false, true]) {
    assert.equal(setGlobeDetailVisible(map, visible), true);
    for (const id of detailIds) assert.equal(map.getLayoutProperty(id, 'visibility'), visible ? 'visible' : 'none');
    assertScaled(map, createGlobeStyle(), .5);
    assert.deepEqual(map.getLayer('h42-world-land'), local);
  }
});

test('out-of-range inputs stay bounded and unloaded styles return false', () => {
  const map = fixture();
  for (const [input, expected] of [[-1, 0], [2, 1], [NaN, 0]]) {
    setGlobeDetailOpacity(map, input, { duration: -10 });
    assertScaled(map, createGlobeStyle(), expected);
    assert.deepEqual(map.getPaintProperty('h42-land', 'background-opacity-transition'), { duration: 0, delay: 0 });
  }
  assert.equal(setGlobeDetailOpacity({ getLayer() { return undefined; } }, 0), false);
});

test('world and country initial style have no remote source, glyph URL or symbol layer', () => {
  const map = fixture(false, { deferDetail: true });
  assert.deepEqual(Object.keys(map.style.sources), ['world']);
  assert.equal(map.style.sources.world.type, 'geojson');
  assert.equal(map.style.sources.world.maxzoom, 10);
  assert.equal(map.style.sources.world.tolerance, .2);
  assert.equal(map.style.glyphs, undefined);
  assert.deepEqual(map.style.layers.map(layer => layer.id), ['h42-world-water', 'h42-world-land', 'h42-world-border']);
  assert.ok(map.style.layers.every(layer => layer.type !== 'symbol' && layer.source !== 'openmaptiles'));
});

test('theme changes before visiting a campus update the local map without installing remote detail', () => {
  const map = fixture(false, { deferDetail: true }), source = map.style.sources.world;
  for (const dark of [true, false, true]) {
    assert.equal(applyGlobeTheme(map, dark), true);
    const expected = createGlobeStyle(dark, [], { deferDetail: true });
    for (const layer of expected.layers) assert.deepEqual(map.getLayer(layer.id).paint, layer.paint);
    assert.equal(map.style.sources.world, source);
    assert.equal(map.style.sources.openmaptiles, undefined);
    assert.equal(map.style.glyphs, undefined);
    assert.equal(map.style.layers.length, 3);
  }
});

test('first campus installs hidden transparent detail once and keeps the loaded local source', () => {
  const map = fixture(true, { deferDetail: true }), localSource = map.style.sources.world;
  const localLayers = clone(map.style.layers);
  assert.equal(ensureGlobeDetail(map, true), true);
  assert.equal(map.style.sources.openmaptiles.url, 'https://tiles.openfreemap.org/planet');
  assert.equal(map.style.glyphs, createGlobeStyle(true).glyphs);
  assert.equal(map.style.sources.world, localSource);
  assert.deepEqual(map.style.layers.slice(0, 3), localLayers);
  assertScaled(map, createGlobeStyle(true), 0);
  for (const id of detailIds) assert.equal(map.getLayoutProperty(id, 'visibility'), 'none');
  const count = map.style.layers.length, source = map.style.sources.openmaptiles;
  assert.equal(ensureGlobeDetail(map, true), true);
  assert.equal(map.style.layers.length, count);assert.equal(map.style.sources.openmaptiles, source);
  applyGlobeTheme(map, false);assertScaled(map, createGlobeStyle(false), 0);
  setGlobeDetailVisible(map, true);assertScaled(map, createGlobeStyle(false), 0);
  setGlobeDetailOpacity(map, 1, { duration: 450 });assertScaled(map, createGlobeStyle(false), 1);
  setGlobeDetailVisible(map, false);assert.equal(map.style.sources.world, localSource);
});

test('lazy detail installation refuses an unloaded local style without mutations', () => {
  assert.equal(ensureGlobeDetail({ getLayer() { return undefined; } }), false);
});

test('optional topology mesh draws borders once without replacing country fill data or loading remote detail', () => {
  const borders = { type: 'MultiLineString', coordinates: [[[0,0],[0,1],[1,1]]] };
  const map = fixture(false, { deferDetail: true, borders });
  assert.equal(map.getLayer('h42-world-land').source, 'world');
  assert.equal(map.getLayer('h42-world-border').source, 'world-borders');
  assert.deepEqual(map.style.sources['world-borders'].data.geometry, borders);
  assert.equal(map.style.sources['world-borders'].maxzoom, 10);
  assert.equal(map.style.sources.openmaptiles, undefined);assert.equal(map.style.glyphs, undefined);
  applyGlobeTheme(map, true);
  assert.equal(map.getLayer('h42-world-border').source, 'world-borders');
  assert.deepEqual(map.style.sources['world-borders'].data.geometry, borders);
});

function evaluateZoom(value,z){
 if(typeof value==='number')return value;
 assert.deepEqual(value.slice(0,3),['interpolate',['linear'],['zoom']]);
 if(z<=value[3])return value[4];
 for(let i=5;i<value.length;i+=2)if(z<=value[i])return value[i-1]+(value[i+1]-value[i-1])*(z-value[i-2])/(value[i]-value[i-2]);
 return value.at(-1);
}
test('all detail paints reveal with camera height and preserve their base opacity without per-frame setters',()=>{
 const map=fixture(),baseline=clone(map.style);let z=14.5;map.getZoom=()=>z;
 setGlobeDetailOpacity(map,1,{zoomRange:{from:14.5,to:16.2}});
 const stored=clone(opacities(map.style));
 for(z=14.5;z<=18;z+=.1)for(const {id,key,value}of opacities(baseline)){
  const t=Math.max(0,Math.min(1,(z-14.5)/1.7)),expected=evaluateZoom(value,z)*t*t*(3-2*t);
  assert.ok(Math.abs(evaluateZoom(map.getPaintProperty(id,key),z)-expected)<.0015,`${id} at ${z}`);
 }
 assert.deepEqual(opacities(map.style),stored);
 z=14.5;assert.equal(getGlobeDetailOpacity(map),0);z=17.8;assert.equal(getGlobeDetailOpacity(map),1);
 setGlobeDetailOpacity(map,1);assertScaled(map,baseline,1);
});
test('the outgoing zoom curve is fully opaque down to16.6 and fades to zero at14.5, including theme changes',()=>{
 const map=fixture();map.getZoom=()=>15.55;
 setGlobeDetailOpacity(map,1,{zoomRange:{from:14.5,to:16.6}});
 for(const dark of[true,false]){
  applyGlobeTheme(map,dark);
  assert.equal(evaluateZoom(map.getPaintProperty('h42-land','background-opacity'),17.8),1);
  assert.equal(evaluateZoom(map.getPaintProperty('h42-land','background-opacity'),16.6),1);
  assert.ok(Math.abs(evaluateZoom(map.getPaintProperty('h42-land','background-opacity'),15.55)-.5)<1e-12);
  assert.equal(evaluateZoom(map.getPaintProperty('h42-land','background-opacity'),14.5),0);
  assert.ok(Math.abs(getGlobeDetailOpacity(map)-.5)<1e-12);
 }
 setGlobeDetailOpacity(map,0);assert.equal(getGlobeDetailOpacity(map),0);
});

// Exercise the pinned library's real Style, StyleLayer, TileManager and
// TileCache in Node. Only the source's network/worker entry points are stubs;
// no browser, GL context or copied implementation of cache invalidation.
const maplibre=createRequire(import.meta.url)('./vendor/maplibre-gl.js');
class CacheAuditSource extends maplibre.Evented{
 constructor(id){super();this.id=id;this.type='vector';this.minzoom=14;this.maxzoom=14;this.tileSize=512;}
 onAdd(){}loaded(){return true;}unloadTile(){}serialize(){return {type:'vector'};}
}
await maplibre.addSourceType('horizon-style-cache-audit',CacheAuditSource);
function actualCacheFixture(){
 const style=Object.create(maplibre.Style.prototype);style._setInitialValues();style._resetUpdates();style._loaded=true;
 style.map={_maxTileCacheSize:96,_maxTileCacheZoomLevels:5};style.dispatcher={broadcast(){return Promise.resolve([]);}};
 style.stylesheet=createGlobeStyle(false,[]);style.setGlobalState=()=>{};style._createLayers();
 style.addSource('openmaptiles',{type:'horizon-style-cache-audit'});
 const manager=style.tileManagers.openmaptiles,cache=manager._outOfViewCache,removed=[];
 manager._unloadTile=tile=>removed.push(tile);cache.setMaxSize(96);style._resetUpdates();
 const map={};for(const name of ['getLayer','getPaintProperty','setPaintProperty','getLayoutProperty','setLayoutProperty'])map[name]=style[name].bind(style);
 map.getZoom=()=>16;map.setLight=()=>{};
 function flush(){const pending=Object.keys(style._updatedSources);for(const id of pending)style._reloadSource(id);style._resetUpdates();return pending;}
 function prime(){for(const key of ['current-campus','decoded-parent','decoded-neighbour'])cache.add({wrapped:()=>({key})},{key},undefined);}
 return {style,map,manager,cache,removed,flush,prime};
}

test('the actual MapLibre 5.24 layout visibility path reloads its source and clears decoded offscreen tiles',()=>{
 assert.equal(maplibre.getVersion(),'5.24.0','re-audit private cache behavior when changing the pinned renderer');
 const {style,map,cache,removed,flush,prime}=actualCacheFixture();
 prime();assert.equal(cache.order.length,3);
 setGlobeDetailVisible(map,true);
 assert.equal(style._updatedSources.openmaptiles,'reload');
 assert.deepEqual(flush(),['openmaptiles']);assert.equal(cache.order.length,0);assert.equal(removed.length,3);
 prime();setGlobeDetailOpacity(map,0);assert.deepEqual(flush(),[]);
 assert.equal(cache.order.length,3);assert.equal(removed.length,3);
});

test('the engine conceals and re-enters a campus without toggling layout or invalidating its actual decoded cache',async()=>{
 const source=await readFile(new URL('./integrated-globe.mjs',import.meta.url),'utf8');
 const start=source.indexOf(' function showDetail('),end=source.indexOf(' function prepareCampusDetail(',start);
 assert.ok(start>=0&&end>start,'extract the real engine visibility controller');
 const {style,map,manager,cache,removed,flush,prime}=actualCacheFixture();
 const local=Object.fromEntries(['h42-world-water','h42-world-land','h42-world-border'].map(id=>[id,clone(style.getLayer(id).serialize())]));
 const polar=[];const controller=vm.createContext({ready:true,detailVisible:false,map,setGlobeDetailVisible,polarCap:{setVisible:value=>polar.push(value)}});
 vm.runInContext(source.slice(start,end),controller);
 setGlobeDetailOpacity(map,0);controller.showDetail(true);assert.deepEqual(flush(),['openmaptiles']);
 const sourceIdentity=manager.getSource();prime();const retained=[...cache.order];
 for(let visit=0;visit<3;visit++){
  setGlobeDetailOpacity(map,0);controller.showDetail(false);
  assert.equal(controller.detailVisible,false);assert.equal(polar.at(-1),true);
  assert.deepEqual(flush(),[],'concealing paint must not queue a source reload');
  for(const id of detailIds)assert.equal(map.getLayoutProperty(id,'visibility'),'visible');
  controller.showDetail(true);setGlobeDetailOpacity(map,1,{zoomRange:{from:14.5,to:16.2}});
  assert.equal(controller.detailVisible,true);assert.equal(polar.at(-1),false);
  assert.deepEqual(flush(),[],'re-entering the already activated source must not relayout it');
  assert.deepEqual(cache.order,retained);assert.equal(removed.length,0);assert.equal(manager.getSource(),sourceIdentity);
  for(const [id,layer]of Object.entries(local))assert.deepEqual(style.getLayer(id).serialize(),layer);
 }
});

test('real constant and zoom-only paint changes retain decoded parent tiles across both themes',()=>{
 const {style,map,cache,removed,flush,prime}=actualCacheFixture();
 setGlobeDetailVisible(map,true);flush();prime();const retained=[...cache.order];
 const layouts=Object.fromEntries(GLOBE_DETAIL_LAYER_IDS.map(id=>[id,clone(style.getLayer(id).serialize().layout)]));
 for(const amount of [0,.35,1,0])for(const dark of [true,false]){
  setGlobeDetailOpacity(map,amount,{zoomRange:{from:14.5,to:16.2}});applyGlobeTheme(map,dark);
  assert.deepEqual(flush(),[],'the actual StyleLayer must not treat these opacity paints as feature-driven relayout');
  assert.deepEqual(cache.order,retained);assert.equal(removed.length,0);
  for(const [id,layout]of Object.entries(layouts))assert.deepEqual(style.getLayer(id).serialize().layout,layout);
 }
});
