import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setMaxListeners } from 'node:events';
import { campusCoverageRadius, campusTiles, createCampusPreloader } from './campus-preload.mjs';

// A selected disk deliberately shares one signal across 10–25 tile consumers.
// Each listener is removed on settlement; browser EventTargets have no limit.
setMaxListeners(0);

const metadataUrl = 'https://tiles.openfreemap.org/planet';
const template = `${metadataUrl}/test/{z}/{x}/{y}.pbf`;
const metadata = { maxzoom: 14, minzoom: 0, tiles: [template] };
const campus = { id: 'paris', coordinates: [2.31838649, 48.896685275] };
const next = () => new Promise(resolve => setImmediate(resolve));
const urlFor = ({ z, x, y }) => template.replace('{z}', z).replace('{x}', x).replace('{y}', y);
const response = (data, status = 200) => ({ ok: status === 200, status, headers: new Headers(),
  json: async () => structuredClone(data), arrayBuffer: async () => data });
function fixture(options = {}) {
  const handlers = new Map(), states = [], calls = [];
  const maplibre = { addProtocol: (name, handler) => handlers.set(name, handler), removeProtocol: name => handlers.delete(name) };
  const fetchImpl = options.fetchImpl ?? (async url => response(url === metadataUrl ? metadata : new Uint8Array([1, 2, 3, 4]).buffer));
  const loader = createCampusPreloader(maplibre, { ...options,
    fetchImpl: (url, init) => { calls.push({ url, init }); return fetchImpl(url, init); }, onChange: state => states.push(state) });
  const render = (url, kind = 'Tile', signal = new AbortController().signal) => {
    const { url: transformed } = loader.transformRequest(url, kind);
    return handlers.get(transformed.split('://')[0])({ url: transformed }, { signal });
  };
  return { loader, handlers, calls, states, render };
}

test('spherical footprint matches all 58 independently estimated campus counts and centre tiles', async () => {
  const estimate = JSON.parse(await readFile(new URL('./PRELOAD_ESTIMATE.json', import.meta.url)));
  assert.equal(estimate.counts.campuses.length, 58);
  for (const entry of estimate.counts.campuses) {
    const tiles = campusTiles(entry.coordinates);
    assert.equal(tiles.length, entry.circleTiles, entry.id);
    assert.ok(tiles.some(tile => tile.key === entry.centerTile.join('/')), entry.id);
    assert.equal(new Set(tiles.map(tile => tile.key)).size, tiles.length);
  }
});

test('footprint crosses the antimeridian without a world-size download and rejects oversized polar requests', () => {
  const tiles = campusTiles([179.99, 0]);
  assert.ok(tiles.some(tile => tile.x === 0)); assert.ok(tiles.some(tile => tile.x === 16383));
  assert.ok(tiles.length < 20); assert.ok(tiles.every(tile => tile.x >= 0 && tile.x < 16384));
  assert.throws(() => campusTiles([0, 90]), RangeError);
  assert.throws(() => campusTiles([0, 85], { radiusKm: 10 }), /budget/);
});

test('coverage includes camera displacement and the worst visible corner on desktop and mobile', () => {
  const u = (14.5 - 12) / 5.8, maxPitch = 34 * u * u * (3 - 2 * u);
  const desktop = campusCoverageRadius(campus.coordinates, { width: 1387, height: 772, padding: { left: 138.7 }, maxPitch });
  const mobile = campusCoverageRadius(campus.coordinates, { width: 390, height: 429, maxPitch });
  assert.ok(desktop > 5.09 && desktop < 5.11); assert.equal(campusTiles(campus.coordinates, { radiusKm: desktop }).length, 45);
  assert.ok(mobile > 3.71 && mobile < 3.73); assert.equal(campusTiles(campus.coordinates, { radiusKm: mobile }).length, 26);
  assert.equal(campusCoverageRadius(campus.coordinates, { width: 1387, height: 772, padding: { right: 138.7 }, maxPitch }), desktop);
  assert.ok(campusCoverageRadius(campus.coordinates, { width: 1387, height: 772, padding: { left: 499.32 }, maxPitch }) > desktop);
  // A bound of 34° throughout the range deliberately fetches more than the
  // current zoom-dependent 13.5° limit at the smallest Campus zoom.
  assert.ok(campusCoverageRadius(campus.coordinates, { width: 1387, height: 772, padding: { left: 138.7 } }) > desktop);
});

test('coverage rejects an unbounded or oversized view without clipping its radius', () => {
  assert.throws(() => campusCoverageRadius(campus.coordinates, { width: 0, height: 429 }), /viewport/);
  assert.throws(() => campusCoverageRadius(campus.coordinates, { width: 390, height: 429, padding: 220 }), /padding/);
  assert.throws(() => campusCoverageRadius(campus.coordinates, { width: 390, height: 429, maxPitch: 85 }), /horizon/);
  assert.throws(() => campusCoverageRadius(campus.coordinates, { width: 20000, height: 772 }), /budget/);
});

test('changing the selected radius extends the existing footprint and only fetches missing tiles', async () => {
  const { loader, calls } = fixture();
  assert.equal((await loader.select(campus)).total, 21);
  const extension = loader.select(campus, { radiusKm: 5.1 });
  assert.equal(loader.select(campus, { radiusKm: 5.1 }), extension);
  const enlarged = await extension;
  assert.equal(enlarged.radiusKm, 5.1); assert.equal(enlarged.total, 45); assert.equal(enlarged.ready, true);
  assert.equal(enlarged.cacheLimitBytes, 48 * 1024 * 1024); assert.equal(calls.length, 46);
  const restored = await loader.select(campus);
  assert.equal(restored.radiusKm, 3); assert.equal(restored.total, 21); assert.equal(restored.ready, true);
  assert.equal(calls.length, 46); loader.destroy();
});

test('disk is fetched once, reused by MapLibre, and cached buffers survive worker transfer', async () => {
  const { loader, render, calls } = fixture();
  const promise = loader.select(campus); assert.equal(loader.select(campus), promise);
  assert.equal((await promise).ready, true); assert.equal(loader.getState().total, 21);
  const source = await render(metadataUrl, 'Source'); assert.equal(source.data.maxzoom, 14);
  assert.equal(source.data.minzoom, 14, 'the source must not request intermediate flight zooms');
  const tileUrl = urlFor(campusTiles(campus.coordinates)[0]);
  const first = await render(tileUrl);
  structuredClone(first.data, { transfer: [first.data] }); assert.equal(first.data.byteLength, 0);
  const second = await render(tileUrl); assert.deepEqual([...new Uint8Array(second.data)], [1, 2, 3, 4]);
  assert.equal(calls.length, 22); assert.equal(calls.filter(call => call.url === metadataUrl).length, 1);
  assert.equal(loader.getState().rendererCacheHits, 2);
  assert.deepEqual(loader.transformRequest('https://tiles.openfreemap.org/fonts/a.pbf', 'Glyphs'), { url: 'https://tiles.openfreemap.org/fonts/a.pbf' });
  loader.destroy();
});

test('renderer and select share the in-flight TileJSON and tile requests', async () => {
  const deferred = new Map();
  const { loader, render, calls } = fixture({ fetchImpl: (url, { signal }) => new Promise((resolve, reject) => {
    deferred.set(url, resolve); signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }) });
  const selected = loader.select(campus), source = render(metadataUrl, 'Source');
  await next(); assert.equal(calls.length, 1); deferred.get(metadataUrl)(response(metadata));
  await source; await next();
  const tileUrl = urlFor(campusTiles(campus.coordinates)[0]), visible = render(tileUrl);
  await next(); assert.equal(calls.filter(call => call.url === tileUrl).length, 1);
  // Cancelling the prefetch keeps this renderer consumer alive.
  loader.cancel(); assert.equal(calls.find(call => call.url === tileUrl).init.signal.aborted, false);
  deferred.get(tileUrl)(response(new Uint8Array([9]).buffer));
  assert.equal((await visible).data.byteLength, 1); assert.equal((await selected).phase, 'cancelled');
  loader.destroy();
});

test('queued renderer work gets priority and prefetch concurrency leaves renderer capacity', async () => {
  const deferred = new Map();
  const { loader, render, calls } = fixture({ concurrency: 3, preloadConcurrency: 2,
    fetchImpl: (url, { signal }) => url === metadataUrl ? Promise.resolve(response(metadata)) : new Promise((resolve, reject) => {
      deferred.set(url, resolve); signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    }) });
  const selected = loader.select(campus); await next();
  assert.equal(calls.filter(call => call.url.endsWith('.pbf')).length, 2);
  const outside = `${metadataUrl}/test/13/1/1.pbf`, visible = render(outside);
  await next(); assert.ok(deferred.has(outside));
  deferred.get(outside)(response(new Uint8Array([1]).buffer)); await visible;
  loader.cancel(); await selected;
  assert.ok(calls.filter(call => call.url !== metadataUrl && call.url !== outside).every(call => call.init.signal.aborted));
  loader.destroy();
});

test('leaving campus cancels queued/running work and a replacement cannot be marked ready by stale completions', async () => {
  const outstanding = new Map();
  const { loader, calls } = fixture({ fetchImpl: (url, { signal }) => url === metadataUrl ? Promise.resolve(response(metadata)) : new Promise((resolve, reject) => {
    outstanding.set(url, resolve); signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }) });
  const first = loader.select(campus); await next();
  const second = loader.select({ id: 'tokyo', coordinates: [139.68813187116757, 35.69044841395869] });
  await first; await next();
  assert.equal(loader.getState().campusId, 'tokyo'); assert.equal(loader.getState().total, 14); assert.equal(loader.getState().ready, false);
  assert.ok(calls.slice(1, 5).every(call => call.init.signal.aborted));
  loader.cancel(); assert.equal((await second).phase, 'cancelled'); loader.destroy();
});

test('hard memory limit never reports full readiness for an evicted footprint', async () => {
  const { loader } = fixture({ maxBytes: 16 });
  const result = await loader.select(campus);
  assert.equal(result.phase, 'partial'); assert.equal(result.ready, false);
  assert.equal(result.completed, 21); assert.equal(result.available, 4); assert.ok(result.cacheBytes <= 16);
  loader.destroy();
});

test('failed tiles are reported and an explicit retry only fetches missing tiles', async () => {
  const failed = urlFor(campusTiles(campus.coordinates)[0]); let fail = true;
  const { loader, calls } = fixture({ fetchImpl: async url => url === metadataUrl ? response(metadata)
    : url === failed && fail ? response(null, 503) : response(new ArrayBuffer(4)) });
  let result = await loader.select(campus);
  assert.equal(result.phase, 'error'); assert.equal(result.failed, 1); assert.equal(result.ready, false);
  fail = false; result = await loader.select(campus);
  assert.equal(result.ready, true); assert.equal(calls.length, 23); loader.destroy();
});

test('stalled requests time out and destruction removes the protocol and frees the cache', async () => {
  const { loader, handlers } = fixture({ timeoutMs: 5, fetchImpl: (_, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }) });
  const result = await loader.select(campus);
  assert.equal(result.phase, 'error'); assert.match(result.error, /timed out/);
  loader.destroy(); assert.equal(handlers.size, 0); assert.equal(loader.getState().cacheBytes, 0);
});

test('anticipation is a distinct single-request queue and promotes the exact in-flight job without a duplicate', async () => {
  const deferred = new Map();
  const { loader, calls } = fixture({ fetchImpl: (url, { signal }) => url === metadataUrl ? Promise.resolve(response(metadata))
    : new Promise((resolve, reject) => { deferred.set(url, resolve); signal.addEventListener('abort', () => reject(signal.reason), { once: true }); }) });
  const future = loader.anticipate(campus); assert.equal(loader.anticipate(campus), future);
  await next();
  assert.equal(loader.getState().campusId, null);
  assert.equal(loader.getAnticipationState().campusId, campus.id);
  assert.equal(calls.filter(call => call.url.endsWith('.pbf')).length, 1);
  assert.equal(calls.at(-1).init.priority, 'low');
  const first = calls.at(-1);
  const selected = loader.select(campus);
  assert.equal(selected, future); assert.equal(first.init.signal.aborted, false);
  assert.equal(loader.getAnticipationState().phase, 'consumed');
  await next();assert.equal(calls.filter(call => call.url.endsWith('.pbf')).length, 4);
  for(let turns=0;turns<30&&loader.getState().phase!=='ready';turns++){
    for(const [url,resolve] of deferred){deferred.delete(url);resolve(response(new ArrayBuffer(4)));}
    await next();
  }
  assert.equal((await selected).ready,true);
  assert.equal(new Set(calls.map(call=>call.url)).size,calls.length);
  assert.equal(calls.length,22);loader.destroy();
});

test('promotion after a viewport change shares overlapping requests before cancelling the previous footprint', async () => {
  const deferred = new Map();
  const { loader, calls } = fixture({ fetchImpl: (url, { signal }) => url === metadataUrl ? Promise.resolve(response(metadata))
    : new Promise((resolve, reject) => { deferred.set(url, resolve); signal.addEventListener('abort', () => reject(signal.reason), { once: true }); }) });
  const anticipated = loader.anticipate(campus); await next();const first=calls.at(-1);
  const selected = loader.select(campus,{radiusKm:5.1});await next();
  assert.equal(first.init.signal.aborted,false);
  assert.equal((await anticipated).phase,'cancelled');
  for(let turns=0;turns<60&&loader.getState().phase!=='ready';turns++){
    for(const [url,resolve] of deferred){deferred.delete(url);resolve(response(new ArrayBuffer(4)));}
    await next();
  }
  assert.equal((await selected).ready,true);assert.equal(calls.length,46);
  assert.equal(new Set(calls.map(call=>call.url)).size,calls.length);loader.destroy();
});

test('replacement anticipation cancels obsolete work and cannot overwrite the selected state', async () => {
  const { loader, calls } = fixture({ fetchImpl: (url, { signal }) => url === metadataUrl ? Promise.resolve(response(metadata))
    : new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true})) });
  const first=loader.anticipate(campus);await next();const old=calls.at(-1);
  const second=loader.anticipate({id:'tokyo',coordinates:[139.6881,35.6904]});
  assert.equal(old.init.signal.aborted,true);assert.equal((await first).phase,'cancelled');await next();
  assert.equal(loader.getAnticipationState().campusId,'tokyo');assert.equal(loader.getState().campusId,null);
  loader.cancelAnticipation();assert.equal((await second).phase,'cancelled');loader.destroy();
});

test('background caching never evicts the selected footprint to pretend that two dense campuses fit', async () => {
  const { loader, calls }=fixture({maxBytes:21*4});
  assert.equal((await loader.select(campus)).ready,true);
  const future=await loader.anticipate({id:'tokyo',coordinates:[139.6881,35.6904]});
  assert.equal(future.ready,false);assert.equal(future.phase,'partial');
  assert.equal(loader.getState().ready,true);assert.equal(loader.getState().available,21);
  assert.equal(loader.getState().cacheBytes,84);
  const before=calls.length;assert.equal((await loader.select(campus)).ready,true);assert.equal(calls.length,before);
  loader.destroy();
});

test('a completed candidate uses only cached data after selection and can be replaced by the next candidate', async () => {
  const { loader, calls, render }=fixture();
  assert.equal((await loader.anticipate(campus)).ready,true);const before=calls.length;
  assert.equal((await loader.select(campus)).ready,true);
  await render(urlFor(campusTiles(campus.coordinates)[0]));assert.equal(calls.length,before);
  assert.equal((await loader.anticipate({id:'tokyo',coordinates:[139.6881,35.6904]})).ready,true);
  assert.equal(loader.getState().campusId,'paris');assert.equal(loader.getState().ready,true);
  assert.equal(loader.getAnticipationState().campusId,'tokyo');loader.destroy();
});

test('manual destination takes priority over another candidate and next-candidate cancellation cannot abort a promoted request',async()=>{
  const { loader,calls }=fixture({fetchImpl:(url,{signal})=>url===metadataUrl?Promise.resolve(response(metadata))
    :new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}))});
  const anticipated=loader.anticipate(campus);await next();const parisRequest=calls.at(-1);
  const selected=loader.select({id:'tokyo',coordinates:[139.6881,35.6904]});await next();
  assert.equal(parisRequest.init.signal.aborted,true);assert.equal((await anticipated).phase,'cancelled');
  assert.equal(loader.getState().campusId,'tokyo');assert.equal(loader.getAnticipationState().phase,'cancelled');
  loader.cancel();await selected;
  const promoted=loader.anticipate(campus);await next();const shared=calls.at(-1);
  assert.equal(loader.select(campus),promoted);
  const nextCandidate=loader.anticipate({id:'tokyo',coordinates:[139.6881,35.6904]});
  loader.cancelAnticipation();await nextCandidate;
  assert.equal(shared.init.signal.aborted,false,'the promoted consumer belongs to the selected campus');
  assert.equal(loader.getState().campusId,'paris');loader.cancel();await promoted;loader.destroy();
});
