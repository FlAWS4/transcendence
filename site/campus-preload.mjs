/**
 * Selected-campus and next-candidate vector preload. MapLibre uses the SAME
 * protocol/cache: this does not rely on fetch warming a browser HTTP cache.
 * API used: MapLibre GL JS 5.24 addProtocol + Map#transformRequest.
 * https://maplibre.org/maplibre-gl-js/docs/API/functions/addProtocol/
 * https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/src/util/ajax.ts
 */
const TILEJSON = 'https://tiles.openfreemap.org/planet';
const EARTH_KM = 6371.0088, DEG = Math.PI / 180, MAX_LAT = 85.0511287798066;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const wrap = (value, width) => ((value % width) + width) % width;
const abortError = () => new DOMException('The campus request was cancelled.', 'AbortError');
let nextProtocol = 0;

/**
 * Conservative fetch radius for a 3 km camera-centre disk plus the complete
 * viewport. Width/height and padding are CSS pixels, never device pixels.
 * Assumptions: flat Mercator ground, no terrain/roll, 512px tiles and the pinned
 * GL 5.24 default vertical FOV (0.6435011087932844rad, camera distance = 1.5h).
 * maxPitch must bound the pitch throughout the zoom range being covered.
 * Bearing is immaterial because the result encloses every corner in a circle.
 * Source: https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/src/geo/transform_helper.ts
 * and src/geo/projection/mercator_transform.ts (perspective + padding matrices).
 * Reject footprints beyond the budget rather than silently under-covering them.
 */
export function campusCoverageRadius(coordinates, {
  width, height, padding = {}, minZoom = 14.5, maxPitch = 34,
} = {}) {
  if (!Array.isArray(coordinates) || coordinates.length !== 2 || !coordinates.every(Number.isFinite)
    || Math.abs(coordinates[1]) > MAX_LAT || !Number.isFinite(width) || width <= 0
    || !Number.isFinite(height) || height <= 0 || !Number.isFinite(minZoom) || minZoom < 0 || minZoom > 24
    || !Number.isFinite(maxPitch) || maxPitch < 0 || maxPitch >= 90) throw new RangeError('Invalid campus viewport.');
  const insets = typeof padding === 'number' ? { top: padding, right: padding, bottom: padding, left: padding } : padding;
  const { top = 0, right = 0, bottom = 0, left = 0 } = insets ?? {};
  if (![top, right, bottom, left].every(value => Number.isFinite(value) && value >= 0)
    || left + right >= width || top + bottom >= height) throw new RangeError('Invalid campus viewport padding.');
  const cx = (width + left - right) / 2, cy = (height + top - bottom) / 2, cameraDistance = 1.5 * height;
  let farthestPixels = 0;
  // A far corner grows monotonically with pitch; a near corner can attain a
  // minimum inside the interval, so testing both endpoints bounds either case.
  for (const pitch of [0, maxPitch * DEG]) for (const x of [0, width]) for (const y of [0, height]) {
    const dx = x - cx, dy = cy - y, denominator = Math.cos(pitch) - dy / cameraDistance * Math.sin(pitch);
    if (denominator <= 0) throw new RangeError('Campus viewport reaches the horizon.');
    farthestPixels = Math.max(farthestPixels, Math.hypot(dx * Math.cos(pitch) / denominator, dy / denominator));
  }
  // Use the largest Mercator ground scale within the entire allowed 10 km
  // footprint, including a camera moved towards the equator. This is slightly
  // more conservative than using only the campus latitude, plus a 1% guard.
  const nearestEquator = Math.max(0, Math.abs(coordinates[1]) - 10 / EARTH_KM / DEG);
  const kmPerPixel = 2 * Math.PI * EARTH_KM * Math.cos(nearestEquator * DEG) / (512 * 2 ** minZoom);
  const radiusKm = 3 + farthestPixels * kmPerPixel * 1.01;
  if (radiusKm > 10) throw new RangeError('Campus viewport exceeds the 10 km footprint budget.');
  return radiusKm;
}

/** All XYZ rectangles intersecting a closed spherical disk, nearest first. */
export function campusTiles(coordinates, { radiusKm = 3, zoom = 14, maxTiles = 512 } = {}) {
  if (!Array.isArray(coordinates) || coordinates.length !== 2 || !coordinates.every(Number.isFinite)
    || Math.abs(coordinates[1]) > MAX_LAT || !Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 10
    || !Number.isInteger(zoom) || zoom < 0 || zoom > 14) throw new RangeError('Invalid campus footprint.');
  const longitude = wrap(coordinates[0] + 180, 360) - 180, latitude = coordinates[1];
  const count = 2 ** zoom, phi = latitude * DEG, delta = radiusKm / EARTH_KM;
  const south = Math.max(-MAX_LAT, latitude - delta / DEG), north = Math.min(MAX_LAT, latitude + delta / DEG);
  const longitudeSpan = Math.abs(phi) + delta >= Math.PI / 2 ? 180 : Math.asin(Math.sin(delta) / Math.cos(phi)) / DEG;
  const tileX = lon => (lon + 180) / 360 * count;
  const tileY = lat => (1 - Math.asinh(Math.tan(lat * DEG)) / Math.PI) / 2 * count;
  const tileLatitude = y => Math.atan(Math.sinh(Math.PI * (1 - 2 * y / count)));
  const minX = Math.floor(tileX(longitude - longitudeSpan) - 1e-10), maxX = Math.floor(tileX(longitude + longitudeSpan) + 1e-10);
  const minY = clamp(Math.floor(tileY(north) - 1e-10), 0, count - 1), maxY = clamp(Math.floor(tileY(south) + 1e-10), 0, count - 1);
  if ((maxX - minX + 1) * (maxY - minY + 1) > maxTiles * 2) throw new RangeError('Campus footprint exceeds the tile budget.');
  const tiles = new Map();
  for (let x = minX; x <= maxX; x++) for (let y = minY; y <= maxY; y++) {
    const west = x / count * 360 - 180, east = (x + 1) / count * 360 - 180;
    const dlambda = (longitude - clamp(longitude, west, east)) * DEG;
    // On a meridian, the nearest latitude maximises the spherical dot product.
    const nearestPhi = clamp(Math.atan2(Math.sin(phi), Math.cos(phi) * Math.cos(dlambda)), tileLatitude(y + 1), tileLatitude(y));
    const cosine = Math.sin(phi) * Math.sin(nearestPhi) + Math.cos(phi) * Math.cos(nearestPhi) * Math.cos(dlambda);
    if (cosine < Math.cos(delta) - 1e-14) continue;
    const normalizedX = wrap(x, count), key = `${zoom}/${normalizedX}/${y}`;
    const tilePhi = tileLatitude(y + .5), tileLambda = ((x + .5) / count * 360 - 180 - longitude) * DEG;
    const centerDistanceKm = EARTH_KM * Math.acos(clamp(Math.sin(phi) * Math.sin(tilePhi) + Math.cos(phi) * Math.cos(tilePhi) * Math.cos(tileLambda), -1, 1));
    tiles.set(key, { z: zoom, x: normalizedX, y, key, centerDistanceKm });
  }
  if (tiles.size > maxTiles) throw new RangeError('Campus footprint exceeds the tile budget.');
  return [...tiles.values()].sort((a, b) => a.centerDistanceKm - b.centerDistanceKm);
}

/**
 * Construct before new Map. Pass transformRequest to the Map options, then
 * select(campus, {radiusKm}) immediately on selection, cancel() on leaving Campus, and
 * destroy() after map.remove(). getState().ready is true only while every
 * selected disk tile is retained. onChange may request a render for the gate.
 * anticipate(campus, {radiusKm}) owns one separate, low-priority job, with at
 * most one request in flight. getAnticipationState/onAnticipationChange never
 * replace selected state. select promotes a matching job without aborting its
 * shared requests. Both footprints share maxBytes; the selected disk wins
 * when the two neighbourhoods cannot both fit. cancelAnticipation is separate.
 */
export function createCampusPreloader(maplibregl, {
  fetchImpl = (...args) => fetch(...args), onChange = () => {}, onAnticipationChange = () => {},
  maxBytes = 48 * 1024 * 1024, concurrency = 6, preloadConcurrency = 4,
  timeoutMs = 20000, radiusKm = 3,
} = {}) {
  if (!maplibregl?.addProtocol || !maplibregl?.removeProtocol) throw new Error('MapLibre custom protocol support is required.');
  if (!Number.isFinite(maxBytes) || maxBytes < 1 || !Number.isInteger(concurrency) || concurrency < 1
    || !Number.isInteger(preloadConcurrency) || preloadConcurrency < 1 || preloadConcurrency > concurrency
    || !Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new RangeError('Invalid campus request budget.');
  const protocol = `h42-campus-${++nextProtocol}`, prefix = `${protocol}://`;
  const cache = new Map(), pending = new Map(), queue = [];
  const stats = { networkTiles: 0, networkBytes: 0, rendererRequests: 0, rendererCacheHits: 0, sharedRequests: 0 };
  let bytes = 0, running = 0, preloadRunning = 0, anticipationRunning = 0, destroyed = false, metadata = null, active = null, anticipated = null;
  let lastState = { phase: 'idle', campusId: null, radiusKm, total: 0, completed: 0, available: 0, failed: 0, ready: false };
  let lastAnticipation = { ...lastState };
  const isTile = url => /^https:\/\/tiles\.openfreemap\.org\/planet\/(?:[^/]+\/)?\d+\/\d+\/\d+\.pbf(?:\?.*)?$/.test(url);
  function snapshot(job, fallback) {
    return { ...(job ? job.state : fallback), ...(job ? { available: job.urls.filter(url => cache.has(url)).length } : {}),
      cacheBytes: bytes, cacheLimitBytes: maxBytes, cacheTiles: cache.size, ...stats };
  }
  const getState = () => snapshot(active, lastState);
  const getAnticipationState = () => snapshot(anticipated, lastAnticipation);
  const current = job => !destroyed && (active === job || anticipated === job);
  function notify() { onChange(getState()); }
  function notifyJob(job) { if (active === job) notify(); else if (anticipated === job) onAnticipationChange(getAnticipationState()); }
  function refreshReady() {
    for (const job of [active, anticipated]) {
      if (!job) continue;
      const available = job.urls.filter(url => cache.has(url)).length;
      const ready = job.urls.length > 0 && available === job.urls.length;
      if (job.state.ready && !ready) job.state.phase = 'partial';
      job.state.ready = ready;
      if (ready) job.state.phase = 'ready';
    }
  }
  function store(url, result) {
    if (result.data.byteLength > maxBytes) return;
    if (cache.has(url)) { bytes -= cache.get(url).data.byteLength; cache.delete(url); }
    cache.set(url, result); bytes += result.data.byteLength;
    while (bytes > maxBytes) {
      // Prefer keeping the selected disk. The hard cap still wins if a very
      // dense neighbourhood exceeds the budget: ready becomes false, not fake.
      const keys = [...cache.keys()];
      const victim = keys.find(key => !active?.urlSet.has(key) && !anticipated?.urlSet.has(key))
        ?? keys.find(key => !active?.urlSet.has(key)) ?? keys[0];
      bytes -= cache.get(victim).data.byteLength; cache.delete(victim);
    }
    refreshReady();
  }
  function cached(url) {
    const result = cache.get(url);
    if (result) { cache.delete(url); cache.set(url, result); }
    return result;
  }
  function schedule() {
    if (destroyed) return;
    queue.sort((a, b) => a.priority - b.priority);
    while (running < concurrency) {
      const index = queue.findIndex(item => item.priority === 0
        || (preloadRunning < preloadConcurrency && (item.priority === 1 || anticipationRunning < 1)));
      if (index < 0) return;
      const item = queue.splice(index, 1)[0];
      if (item.settled || !item.consumers.size) continue;
      item.started = true; item.wasPreload = item.priority > 0; item.wasAnticipation = item.priority > 1;
      running++; if (item.wasPreload) preloadRunning++; if (item.wasAnticipation) anticipationRunning++;
      const timer = setTimeout(() => item.controller.abort(new Error('Campus tile request timed out.')), timeoutMs);
      Promise.resolve().then(async () => {
        const response = await fetchImpl(item.url, { signal: item.controller.signal, credentials: 'omit', ...(item.priority > 1 ? { priority: 'low' } : {}) });
        if (!response.ok) {
          const error = new Error(`Campus map request failed (${response.status}).`); error.status = response.status; throw error;
        }
        const data = item.url === TILEJSON ? await response.json() : await response.arrayBuffer();
        if (item.controller.signal.aborted) throw item.controller.signal.reason ?? abortError();
        const result = { data, cacheControl: response.headers?.get('Cache-Control'), expires: response.headers?.get('Expires') };
        if (item.url === TILEJSON) {
          if (!Array.isArray(data.tiles) || !data.tiles.length || data.tiles.some(url => !/^https:\/\/tiles\.openfreemap\.org\/planet\//.test(url))) throw new Error('Unsupported campus tile metadata.');
          // Bound anticipation to z14; renderer and preloader see the same cap.
          data.maxzoom = Number.isFinite(Number(data.maxzoom)) ? clamp(Math.floor(Number(data.maxzoom)), 0, 14) : 14;
          // World/Country already have their local base, while the interactive
          // Campus range starts at 14.5. Do not fetch invisible z0–13 flight
          // tiles: the same native level covers the full neighbourhood and
          // is overscaled by MapLibre above it. TileJSON min/max semantics:
          // https://maplibre.org/maplibre-style-spec/sources/#minzoom
          data.minzoom = data.maxzoom;
          metadata = result;
        } else {
          stats.networkTiles++; stats.networkBytes += data.byteLength; store(item.url, result);
        }
        finish(item, null, result);
      }).catch(error => finish(item, error)).finally(() => {
        clearTimeout(timer); running--; if (item.wasPreload) preloadRunning--; if (item.wasAnticipation) anticipationRunning--; schedule();
      });
    }
  }
  function finish(item, error, result) {
    if (item.settled) return;
    item.settled = true;
    if (pending.get(item.url) === item) pending.delete(item.url);
    for (const consumer of item.consumers) {
      consumer.signal?.removeEventListener('abort', consumer.abort);
      error ? consumer.reject(error) : consumer.resolve(result);
    }
    item.consumers.clear();
  }
  function request(url, { signal, priority = 0 } = {}) {
    if (destroyed || signal?.aborted) return Promise.reject(abortError());
    const hit = url === TILEJSON ? metadata : cached(url);
    if (hit) return Promise.resolve(hit);
    let item = pending.get(url);
    if (item) { stats.sharedRequests++; item.priority = Math.min(item.priority, priority); }
    else {
      item = { url, priority, controller: new AbortController(), consumers: new Set(), settled: false, started: false };
      pending.set(url, item); queue.push(item);
    }
    const promise = new Promise((resolve, reject) => {
      const consumer = { resolve, reject, signal, abort: null };
      consumer.abort = () => {
        if (!item.consumers.delete(consumer)) return;
        signal?.removeEventListener('abort', consumer.abort); reject(abortError());
        // A cancelled prefetch must not abort the renderer's shared request.
        if (!item.consumers.size) {
          if (pending.get(url) === item) pending.delete(url);
          item.controller.abort(abortError());
          if (!item.started) { item.settled = true; const index = queue.indexOf(item); if (index >= 0) queue.splice(index, 1); }
        }
      };
      item.consumers.add(consumer); signal?.addEventListener('abort', consumer.abort, { once: true });
    });
    schedule(); return promise;
  }
  function transformRequest(url, resourceType) {
    if ((resourceType === 'Source' && url === TILEJSON) || (resourceType === 'Tile' && isTile(url))) return { url: prefix + url };
    return { url };
  }
  async function loadProtocol(parameters, controller) {
    const url = parameters.url.slice(prefix.length);
    if (url !== TILEJSON && !isTile(url)) throw new Error('Unsupported campus resource.');
    if (url !== TILEJSON) {
      stats.rendererRequests++; if (cache.has(url)) stats.rendererCacheHits++;
    }
    const result = await request(url, { signal: controller?.signal, priority: 0 });
    if (controller?.signal.aborted) throw abortError();
    // GL transfers tile data to its worker. Return a distinct buffer so that
    // the cached original cannot be detached by a subsequent postMessage.
    notify();
    return { ...result, data: url === TILEJSON ? structuredClone(result.data) : result.data.slice(0) };
  }
  function cancel() {
    if (!active) return;
    const previous = active; active = null;
    previous.controller.abort();
    lastState = { ...previous.state, phase: 'cancelled', ready: false, available: 0 };
    notify();
  }
  function cancelAnticipation() {
    if (!anticipated) return;
    const previous = anticipated; anticipated = null;
    previous.controller.abort();
    lastAnticipation = { ...previous.state, phase: 'cancelled', ready: false, available: 0 };
    onAnticipationChange(getAnticipationState());
  }
  const keyFor = (campus, size) => `${campus?.id}:${campus?.coordinates?.join(',')}:${size}`;
  function startJob(campus, selectedRadiusKm, kind) {
    const key = keyFor(campus, selectedRadiusKm);
    const job = { key, controller: new AbortController(), urls: [], urlSet: new Set(), state: {
      phase: 'metadata', campusId: campus?.id ?? null, radiusKm: selectedRadiusKm, total: 0, completed: 0, available: 0, failed: 0, ready: false,
    } };
    if (kind === 'selected') active = job; else anticipated = job;
    const previousAnticipation = kind === 'selected' ? anticipated : null;
    const priority = () => active === job ? 1 : 2;
    // Defer body one microtask so repeated calls can already reuse the promise.
    job.promise = Promise.resolve().then(async () => {
      try {
        const { data } = await request(TILEJSON, { signal: job.controller.signal, priority: priority() === 1 ? 0 : 2 });
        if (!current(job)) return { ...job.state, phase: 'cancelled', ready: false };
        const tiles = campusTiles(campus.coordinates, { radiusKm: selectedRadiusKm, zoom: data.maxzoom });
        job.urls = tiles.map(({ z, x, y }) => data.tiles[(x + y) % data.tiles.length]
          .replace('{z}', z).replace('{x}', x).replace('{y}', data.scheme === 'tms' ? 2 ** z - y - 1 : y));
        job.urlSet = new Set(job.urls); job.state.total = job.urls.length; job.state.zoom = data.maxzoom; job.state.phase = 'loading';
        refreshReady(); notifyJob(job);
        const requests = job.urls.map(async url => {
          try { await request(url, { signal: job.controller.signal, priority: priority() }); }
          catch (error) { if (!job.controller.signal.aborted) { job.state.failed++; job.state.error = error.message; } }
          finally {
            if (current(job)) { job.state.completed++; refreshReady(); notifyJob(job); }
          }
        });
        // Attach selected consumers before cancelling anticipation. Even a
        // viewport change then reuses overlapping in-flight buffers.
        if (active === job && anticipated === previousAnticipation) cancelAnticipation();
        await Promise.all(requests);
        if (!current(job)) return { ...job.state, phase: 'cancelled', ready: false };
        refreshReady();
        if (!job.state.ready) job.state.phase = job.state.failed ? 'error' : 'partial';
        notifyJob(job); return snapshot(job, job.state);
      } catch (error) {
        if (!current(job)) return { ...job.state, phase: 'cancelled', ready: false };
        if (active === job && anticipated === previousAnticipation) cancelAnticipation();
        job.state.phase = 'error'; job.state.error = error.message; notifyJob(job); return snapshot(job, job.state);
      }
    });
    notifyJob(job); return job.promise;
  }
  function select(campus, { radiusKm: selectedRadiusKm = radiusKm } = {}) {
    if (destroyed) return Promise.resolve({ ...lastState, phase: 'cancelled', ready: false });
    const key = keyFor(campus, selectedRadiusKm);
    if (active?.key === key && !['error', 'partial'].includes(active.state.phase)) return active.promise;
    cancel();
    if (anticipated?.key === key && !['error', 'partial'].includes(anticipated.state.phase)) {
      // Promote the same job and the same AbortSignal: no abort/re-fetch gap.
      active = anticipated; anticipated = null;
      lastAnticipation = { ...active.state, phase: 'consumed', ready: false };
      for (const item of pending.values()) if ([...item.consumers].some(c => c.signal === active.controller.signal)) item.priority = Math.min(item.priority, item.url === TILEJSON ? 0 : 1);
      onAnticipationChange(getAnticipationState()); notify(); schedule();
      return active.promise;
    }
    return startJob(campus, selectedRadiusKm, 'selected');
  }
  function anticipate(campus, { radiusKm: selectedRadiusKm = radiusKm } = {}) {
    if (destroyed) return Promise.resolve({ ...lastAnticipation, phase: 'cancelled', ready: false });
    const key = keyFor(campus, selectedRadiusKm);
    if (anticipated?.key === key) return anticipated.promise;
    cancelAnticipation();
    return startJob(campus, selectedRadiusKm, 'anticipated');
  }
  function destroy() {
    if (destroyed) return;
    cancel(); cancelAnticipation(); destroyed = true;
    for (const item of pending.values()) { item.controller.abort(); finish(item, abortError()); }
    pending.clear(); queue.length = 0; cache.clear(); bytes = 0; metadata = null;
    maplibregl.removeProtocol(protocol);
  }
  maplibregl.addProtocol(protocol, loadProtocol);
  return { transformRequest, select, cancel, anticipate, cancelAnticipation, getAnticipationState, getState, destroy };
}
