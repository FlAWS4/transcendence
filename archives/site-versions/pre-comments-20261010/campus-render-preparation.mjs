import { campusTiles } from './campus-preload.mjs';

const DEG = Math.PI / 180;
const EARTH_KM = 6371.0088;
const aborted = () => new DOMException('Campus render preparation cancelled.', 'AbortError');
const now = () => performance.now();

/**
 * Warm the SAME MapLibre instance through its public camera/render APIs.
 * Raw PBF preloading must already be started (including the batch square's
 * corners); renderer requests share that queue and may prepare concurrently.
 * This prepares the requested display zoom plus the explicit intermediate
 * approach poses: GL 5.24 reparses vector tiles at other overzoom levels. The caller must
 * retain enough decoded tiles (maxTileCacheSize) and suppress its normal camera
 * navigation callbacks while this controller is preparing.
 *
 * The batch path enlarges this map's CSS viewport while keeping its WebGL
 * backing buffer <=1024px, and restores both dimensions and pixel ratio.
 * freeze's cover MUST sit outside map.getContainer(), whose size changes.
 * freeze/thaw/setOpaque are synchronous hooks. freeze retains the displayed
 * scene before any probe; setOpaque(true) allows real geometry/GPU preparation
 * under that cover. Cancellation restores camera state before removing it.
 */
export function createCampusRenderPreparation(map, {
  onChange = () => {}, freeze = () => {}, thaw = () => {}, setOpaque = () => {},
  timeoutMs = 25000, frameTimeoutMs = 12000, batch = true, maxBackingPixels = 1024,
} = {}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || !Number.isFinite(frameTimeoutMs) || frameTimeoutMs <= 0) {
    throw new RangeError('Invalid campus render preparation timeout.');
  }
  if (!Number.isInteger(maxBackingPixels) || maxBackingPixels < 64 || maxBackingPixels > 1024) {
    throw new RangeError('Invalid campus render backing-buffer budget.');
  }
  let active = null, destroyed = false;
  let lastState = { phase: 'idle', campusId: null, total: 0, completed: 0, durationMs: 0 };
  const current = job => !destroyed && active === job && !job.finished;
  const snapshot = job => ({ ...job.state, durationMs: Math.max(0, now() - job.startedAt) });
  const getState = () => active ? snapshot(active) : { ...lastState };
  const notify = () => { if (!destroyed) onChange(getState()); };

  function saveCamera() {
    const center = map.getCenter();
    return {
      center: typeof center.toArray === 'function' ? center.toArray() : [center.lng, center.lat],
      zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing(),
      padding: { ...map.getPadding() },
      ...(typeof map.getRoll === 'function' ? { roll: map.getRoll() } : {}),
    };
  }

  function enlargeViewport(job, coordinates, radiusKm, zoom) {
    const container = map.getContainer(), latitude = coordinates[1] * DEG, delta = radiusKm / EARTH_KM;
    const mercatorY = phi => (1 - Math.asinh(Math.tan(phi)) / Math.PI) / 2;
    const centreY = mercatorY(latitude);
    const longitudeSpan = Math.asin(Math.sin(delta) / Math.cos(latitude));
    const halfSpan = Math.max(longitudeSpan / (2 * Math.PI),
      Math.abs(mercatorY(latitude - delta) - centreY), Math.abs(mercatorY(latitude + delta) - centreY));
    // The axis-aligned Mercator square encloses the entire spherical disk.
    // Four extra CSS pixels guard floating point/tile-edge rounding.
    const side = Math.ceil(halfSpan * 2 * 512 * 2 ** zoom) + 4;
    if (!Number.isFinite(side) || side < 1 || side > 1000000) throw new RangeError('Campus render viewport is too large.');
    const originalRatio = map.getPixelRatio();
    if (!Number.isFinite(originalRatio) || originalRatio <= 0) throw new RangeError('Invalid map pixel ratio.');
    job.viewport = { container, width: container.style.width, height: container.style.height, pixelRatio: originalRatio };
    const pixelRatio = Math.min(originalRatio, maxBackingPixels / side);
    container.style.width = `${side}px`; container.style.height = `${side}px`;
    job.state.viewportCssPixels = side; job.state.backingPixels = Math.ceil(side * pixelRatio);
    // Public setPixelRatio() already calls resize() in pinned GL5.24.
    // https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/src/ui/map.ts
    map.setPixelRatio(pixelRatio);
  }

  function restoreViewport(job) {
    const viewport = job.viewport; if (!viewport) return;
    job.viewport = null;
    viewport.container.style.width = viewport.width; viewport.container.style.height = viewport.height;
    map.setPixelRatio(viewport.pixelRatio);
  }

  function finish(job, phase, error) {
    if (job.finished) return;
    job.finished = true;
    if (active === job) active = null;
    clearTimeout(job.timer);
    job.signal?.removeEventListener('abort', job.onAbort);
    if (job.onError) map.off('error', job.onError);
    job.abortProbe?.(aborted());
    // Hooks can synchronously request another run. New runs start in a
    // microtask, after this cleanup has restored the camera and removed cover.
    let failure = error;
    try { restoreViewport(job); } catch (viewportError) { failure ??= viewportError; }
    if (job.cameraChanged && job.origin) {
      try { map.jumpTo(job.origin); map.triggerRepaint(); }
      catch (restoreError) { failure ??= restoreError; }
      job.cameraChanged = false;
    }
    if (job.opaque) {
      job.opaque = false;
      try { setOpaque(false); } catch (opacityError) { failure ??= opacityError; }
    }
    if (job.frozen) {
      job.frozen = false;
      try { thaw(); } catch (thawError) { failure ??= thawError; }
    }
    const result = { ...snapshot(job), phase: failure && phase !== 'cancelled' ? 'error' : phase,
      ...(failure ? { error: failure.message ?? String(failure) } : {}) };
    lastState = result;
    // Do not emit an obsolete completion over a reentrant, newer preparation.
    if (!active && !destroyed) {
      try { notify(); } catch { /* Consumer notification must not strand cleanup. */ }
    }
    job.resolve({ ...result });
  }

  function renderPose(job, camera, { allSources = true, label = 'detail' } = {}) {
    return new Promise((resolve, reject) => {
      let settled = false, requested = false, timer,frames=0;const startedAt=now();
      const cleanup = () => {
        clearTimeout(timer); map.off('render', onRender);
        if (job.abortProbe === fail) job.abortProbe = null;
      };
      const fail = error => {
        if (settled) return;
        settled = true; cleanup(); reject(error);
      };
      const onRender = () => {
        if (!requested || settled || !current(job)) return;
        frames++;
        try {
          // Checking only source readiness before a fresh render would accept
          // the previous pose. Readiness also may synchronously emit an error.
          if (map.isMoving?.() || (allSources&&!map.areTilesLoaded()) || !map.isSourceLoaded('openmaptiles')) return;
          if (!current(job) || settled) return;
          job.state.poses.push({label,zoom:camera.zoom,pitch:camera.pitch,durationMs:Math.max(0,now()-startedAt),frames,allSources});
          settled = true; cleanup(); resolve();
        } catch (error) { fail(error); }
      };
      job.abortProbe = fail;
      map.on('render', onRender);
      timer = setTimeout(() => fail(new Error('Campus render pose timed out.')), frameTimeoutMs);
      try {
        requested = true; job.cameraChanged = true;
        map.jumpTo(camera);
        if (current(job)) map.triggerRepaint();
        else fail(aborted());
      } catch (error) { fail(error); }
    });
  }

  function cancel() {
    if (active) finish(active, 'cancelled');
  }

  function run(campus, { radiusKm = 3, zoom = 17.8, pitch = 34, padding = {}, approachZooms = [], concealBeforeRestore = false, signal } = {}) {
    if (destroyed) return Promise.resolve({ ...lastState, phase: 'cancelled' });
    const key = JSON.stringify([campus?.id, campus?.coordinates, radiusKm, zoom, pitch, padding, approachZooms, concealBeforeRestore]);
    if (active?.key === key && !signal?.aborted) return active.promise;
    cancel();
    const job = { key, origin: null, viewport: null, frozen: false, opaque: false, cameraChanged: false, finished: false,
      timer: null, abortProbe: null, onError: null, signal, startedAt: now(), state: {
        phase: 'preparing', campusId: campus?.id ?? null, radiusKm, zoom, total: 0, completed: 0, durationMs: 0,poses:[],
      } };
    job.promise = new Promise(resolve => { job.resolve = resolve; });
    active = job;
    job.onAbort = () => { if (active === job) finish(job, 'cancelled'); };
    signal?.addEventListener('abort', job.onAbort, { once: true });
    if (signal?.aborted) { finish(job, 'cancelled'); return job.promise; }
    // A run requested by cleanup hooks starts only after the old cover/camera
    // has been restored. This also makes a same-turn cancellation side-effect free.
    Promise.resolve().then(async () => {
      if (!current(job)) return;
      try {
        if (!Number.isFinite(zoom) || zoom < 14 || zoom > 19 || !Number.isFinite(pitch) || pitch < 0 || pitch >= 90) {
          throw new RangeError('Invalid campus render preparation camera.');
        }
        if(!Array.isArray(approachZooms)||approachZooms.length>4||approachZooms.some(value=>!Number.isFinite(value)||value<14.5||value>zoom))throw new RangeError('Invalid campus approach preparation.');
        const tiles = campusTiles(campus.coordinates, { radiusKm, zoom: 14 });
        const useBatch = batch && ['getContainer', 'getPixelRatio', 'setPixelRatio', 'resize'].every(name => typeof map[name] === 'function')
          && map.getContainer()?.style;
        job.state.mode = useBatch ? 'batch' : 'sequential';
        job.state.total = tiles.length; job.origin = saveCamera();
        job.timer = setTimeout(() => finish(job, 'error', new Error('Campus render preparation timed out.')), timeoutMs);
        job.onError = event => {
          const sourceId = event?.sourceId ?? event?.source?.id;
          if (current(job) && (!sourceId || sourceId === 'openmaptiles')) {
            finish(job, 'error', event?.error ?? new Error('Campus rendering failed.'));
          }
        };
        map.on('error', job.onError);
        notify(); if (!current(job)) return;
        job.frozen = true; freeze(); if (!current(job)) return;
        job.opaque = true; setOpaque(true); if (!current(job)) return;
        if (useBatch) {
          enlargeViewport(job, campus.coordinates, radiusKm, zoom);
          if (!current(job)) return;
          await renderPose(job, { center: [...campus.coordinates], zoom, pitch: 0, bearing: 0, roll: 0, padding: 0 },{label:'neighbourhood'});
          if (!current(job)) return;
          job.state.completed = tiles.length; notify(); if (!current(job)) return;
          restoreViewport(job); if (!current(job)) return;
        } else {
          for (const tile of tiles) {
            const count = 2 ** tile.z;
            const center = [(tile.x + .5) / count * 360 - 180,
              Math.atan(Math.sinh(Math.PI * (1 - 2 * (tile.y + .5) / count))) / DEG];
            await renderPose(job, { center, zoom, pitch: 0, bearing: 0, roll: 0, padding: 0 });
            if (!current(job)) return;
            job.state.completed++; notify(); if (!current(job)) return;
          }
        }
        // Prepare the visible approach at the start of each overscaled source
        // level. This reuses the already fetched minimum-zoom footprint; the
        // same map is covered, and its full-neighbourhood final level remains
        // in the decoded cache. No extra geographic radius is requested.
        job.state.approachZooms=[...approachZooms];
        for(const approachZoom of approachZooms){
          await renderPose(job,{center:[...campus.coordinates],zoom:approachZoom,pitch,bearing:0,roll:0,padding},{label:'approach'});
          if(!current(job))return;
        }
        // A preflight preparation restores its origin on the local base. Hide
        // the remote source before moving back, so an old, evicted campus does
        // not start loading again merely to restore the camera under the cover.
        if(concealBeforeRestore){job.opaque=false;setOpaque(false);if(!current(job))return;}
        // Keep the cover until the restored arrival camera has also produced a
        // ready frame. A cancellation during this last wait still restores it.
        await renderPose(job, job.origin,{allSources:true,label:'origin'});
        if (!current(job)) return;
        job.cameraChanged = false;
        finish(job, 'ready');
      } catch (error) {
        if (!job.finished) finish(job, signal?.aborted ? 'cancelled' : 'error', error);
      }
    });
    return job.promise;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true; cancel();
  }
  return { run, cancel, getState, destroy };
}
