// Real street/building data; no simulated satellite imagery or campus buildings.
const LEAFLET_URL = new URL('./vendor/leaflet.js', import.meta.url).href;
const MIN_ZOOM = 11;
const MAX_ZOOM = 19;
const ARRIVAL_ZOOM = 18;
const COPY = {
  fr: {view:'Vue du quartier', loading:'La ville se dessine…', error:'La carte ne peut pas se charger pour le moment.', retry:'Réessayer', back:'Revenir au pays', position:'Repère publié par le réseau 42', positionCampus:'Emplacement cartographié du campus', positionAddress:'Repère de l’adresse du campus', label:'Carte du quartier de {name}. Flèches pour se déplacer, plus et moins pour zoomer. Échap revient au pays.', ready:'Vue rapprochée de {name}.'},
  en: {view:'Neighbourhood view', loading:'Bringing the city into view…', error:'The map cannot load right now.', retry:'Try again', back:'Back to the country', position:'Location published by the 42 network', positionCampus:'Mapped campus location', positionAddress:'Campus address location', label:'Neighbourhood map of {name}. Use arrows to move, plus and minus to zoom. Escape returns to the country.', ready:'Close-up view of {name}.'},
  ar: {view:'خريطة الحي', loading:'تظهر المدينة تدريجيًا…', error:'يتعذّر تحميل الخريطة حاليًا.', retry:'أعد المحاولة', back:'العودة إلى الدولة', position:'الموقع المنشور من شبكة 42', positionCampus:'موقع الفرع على الخريطة', positionAddress:'موقع عنوان الفرع', label:'خريطة الحي حول {name}. استخدم الأسهم للتنقل وعلامتي الجمع والطرح للتكبير والتصغير. اضغط Escape للعودة إلى الدولة.', ready:'عرض مقرّب لـ {name}.'}
};
let leafletPromise;

function loadLeaflet() {
  if (window.L?.version === '1.9.4') return Promise.resolve(window.L);
  if (!leafletPromise) {
    leafletPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = LEAFLET_URL;
      script.onload = () => window.L ? resolve(window.L) : reject(new Error('Leaflet unavailable'));
      script.onerror = () => { script.remove(); reject(new Error('Leaflet unavailable')); };
      document.head.append(script);
    }).catch(error => { leafletPromise = undefined; throw error; });
  }
  return leafletPromise;
}

/**
 * Dedicated campus view. Coordinates follow GeoJSON [longitude, latitude].
 * The caller positions container and handles onExit by selecting the country.
 * onZoomChange receives {zoom, minZoom, maxZoom}; open() resolves after setup.
 */
export function createCityMap({container, onExit = () => {}, onZoomChange = () => {}, reducedMotion = false, locale = 'fr'}) {
  if (!(container instanceof HTMLElement)) throw new TypeError('A city map container is required');
  let map, layer, marker, campus, target, active = false, destroyed = false, serial = 0;
  let flightTimer = 0, loadTimer = 0, flightStarted = false, flying = false, loadedTiles = 0, tileErrors = 0;
  let language = COPY[locale] ? locale : 'fr';
  let state = 'idle';
  const timers = () => { clearTimeout(flightTimer); clearTimeout(loadTimer); flightTimer = loadTimer = 0; };
  const text = key => COPY[language][key];
  const name = () => campus?.name || campus?.label || campus?.id || '';
  const el = (tag, className, parent = container) => {
    const node = document.createElement(tag); node.className = className; parent.append(node); return node;
  };
  container.classList.add('city-map');
  container.hidden = true;
  const canvas = el('div', 'city-map-canvas');
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'region');
  const heading = el('div', 'city-map-heading');
  const headingTag = el('span', 'city-map-tag', heading);
  const headingName = el('strong', 'city-map-name', heading);
  headingName.dir = 'auto';
  const credit = el('div', 'city-map-position');
  const positionLabel = el('span', 'city-map-position-label', credit);
  const coordinates = el('span', 'city-map-coordinates', credit);
  coordinates.dir = 'ltr';
  const notice = el('div', 'city-map-notice');
  const noticeText = el('p', 'city-map-notice-text', notice);
  noticeText.setAttribute('role', 'status');
  const actions = el('div', 'city-map-notice-actions', notice);
  const retryButton = el('button', 'city-map-retry', actions);
  const returnButton = el('button', 'city-map-return', actions);
  retryButton.type = returnButton.type = 'button';
  const announcement = el('span', 'sr-only city-map-announcement');
  announcement.setAttribute('aria-live', 'polite');

  function syncText() {
    container.dir = language === 'ar' ? 'rtl' : 'ltr';
    canvas.setAttribute('aria-label', text('label').replace('{name}', name()));
    headingTag.textContent = text('view');
    headingName.textContent = name();
    const precision = campus?.locationSource?.precision;
    positionLabel.textContent = text(precision === 'campus' ? 'positionCampus' : precision === 'address' ? 'positionAddress' : 'position');
    retryButton.textContent = text('retry');
    returnButton.textContent = text('back');
    noticeText.textContent = state === 'error' ? text('error') : text('loading');
    if (marker) marker.getElement()?.setAttribute('aria-label', name());
  }
  function setState(next) {
    state = next;
    container.dataset.mapState = next;
    notice.hidden = next === 'ready' || next === 'idle';
    actions.hidden = next !== 'error';
    syncText();
  }
  function reportZoom() {
    if (!map || !active) return;
    const zoom = map.getZoom();
    container.dataset.zoom = zoom.toFixed(2);
    onZoomChange({zoom, minZoom:MIN_ZOOM, maxZoom:MAX_ZOOM});
  }
  function exit() {
    if (!active) return;
    const previous = campus;
    close();
    onExit(previous);
  }
  function startFlight() {
    if (!active || !map || flightStarted) return;
    flightStarted = true;
    flying = !reducedMotion;
    clearTimeout(flightTimer);
    if (reducedMotion) map.setView(target, ARRIVAL_ZOOM, {animate:false});
    else map.flyTo(target, ARRIVAL_ZOOM, {duration:3.2, easeLinearity:.2, animate:true});
  }
  function stopFlight() {
    clearTimeout(flightTimer);
    flightStarted = true;
    flying = false;
    map?.stop();
  }
  function watchLoad() {
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => { if (active && loadedTiles === 0) setState('error'); }, 10000);
  }
  function destroyMap() {
    timers();
    flying = false;
    if (map) { map.stop(); map.remove(); }
    map = layer = marker = undefined;
    canvas.replaceChildren();
  }
  async function open(nextCampus) {
    if (destroyed) return;
    const point = nextCampus?.coordinates || nextCampus?.coords;
    if (!Array.isArray(point) || point.length < 2 || !point.every(Number.isFinite) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 85.051129) {
      throw new TypeError('The campus requires valid [longitude, latitude] coordinates');
    }
    active = false;
    destroyMap();
    const attempt = ++serial;
    campus = nextCampus;
    target = [point[1], point[0]];
    active = true;
    flightStarted = false;
    loadedTiles = tileErrors = 0;
    container.hidden = false;
    container.dataset.campus = campus.id || name();
    coordinates.textContent = `${point[1].toFixed(5)}°, ${point[0].toFixed(5)}°`;
    announcement.textContent = '';
    setState('loading');
    try {
      const L = await loadLeaflet();
      if (!active || destroyed || attempt !== serial) return;
      const isCurrent = () => active && attempt === serial && Boolean(map);
      map = L.map(canvas, {
        zoomControl:false, attributionControl:true,
        minZoom:MIN_ZOOM, maxZoom:MAX_ZOOM, zoomSnap:.25, zoomDelta:.75,
        scrollWheelZoom:true, touchZoom:true, keyboard:true,
        bounceAtZoomLimits:false, inertia:!reducedMotion,
        zoomAnimation:!reducedMotion, fadeAnimation:!reducedMotion,
        markerZoomAnimation:!reducedMotion, worldCopyJump:true,
        wheelPxPerZoomLevel:90, wheelDebounceTime:50
      });
      map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
      map.setView(target, reducedMotion ? ARRIVAL_ZOOM : 13, {animate:false});
      // Browser-managed HTTP cache and Referer are retained. Only visible tiles
      // are fetched; no region downloads or intermediate zoom-stack prefetch.
      layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom:MIN_ZOOM, maxZoom:MAX_ZOOM, maxNativeZoom:19,
        attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
        updateWhenIdle:true, updateWhenZooming:false, keepBuffer:1,
        referrerPolicy:'strict-origin-when-cross-origin'
      });
      layer.on('loading', () => { if (isCurrent()) { loadedTiles = tileErrors = 0; watchLoad(); } });
      layer.on('tileload', () => { if (isCurrent()) { loadedTiles++; clearTimeout(loadTimer); setState('ready'); } });
      layer.on('tileerror', () => { if (isCurrent()) tileErrors++; });
      layer.on('load', () => {
        if (!isCurrent()) return;
        clearTimeout(loadTimer);
        if (!loadedTiles && tileErrors) setState('error');
        if (loadedTiles) setState('ready');
        if (!flightStarted) flightTimer = setTimeout(startFlight, 120);
      });
      layer.addTo(map);
      const pin = document.createElement('div');
      pin.className = 'city-map-pin';
      const ring = document.createElement('span'); ring.className = 'city-map-pin-ring';
      const dot = document.createElement('span'); dot.className = 'city-map-pin-dot';
      pin.append(ring, dot);
      marker = L.marker(target, {
        icon:L.divIcon({html:pin, className:'city-map-marker', iconSize:[56,56], iconAnchor:[28,28]}),
        keyboard:false, interactive:false, title:name(), zIndexOffset:1000
      }).addTo(map);
      L.control.scale({position:'bottomleft', imperial:false, maxWidth:90}).addTo(map);
      map.on('zoom', () => { if (isCurrent()) reportZoom(); });
      map.on('zoomend', () => {
        if (!isCurrent()) return;
        reportZoom();
        if (active && map.getZoom() <= MIN_ZOOM + .001 && flightStarted) exit();
      });
      map.on('moveend', () => {
        if (isCurrent() && flying && Math.abs(map.getZoom() - ARRIVAL_ZOOM) < .01) {
          flying = false;
          announcement.textContent = text('ready').replace('{name}', name());
        }
      });
      map.on('dragstart', () => { if (isCurrent()) stopFlight(); });
      reportZoom();
      map.invalidateSize({animate:false, pan:false});
      canvas.focus({preventScroll:true});
      if (reducedMotion) flightStarted = true;
      else flightTimer = setTimeout(startFlight, 900);
      watchLoad();
    } catch (error) {
      if (attempt === serial && active) setState('error');
    }
  }
  function close() {
    active = false;
    serial++;
    destroyMap();
    container.hidden = true;
    setState('idle');
    delete container.dataset.zoom;
    announcement.textContent = '';
  }
  function zoomBy(factor) {
    if (!active || !map || !Number.isFinite(factor) || factor <= 0 || factor === 1) return;
    stopFlight();
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, map.getZoom() + Math.log2(factor) * 2));
    if (next <= MIN_ZOOM + .001) { exit(); return; }
    map.setZoom(next, {animate:!reducedMotion});
  }
  function setReducedMotion(value) {
    reducedMotion = Boolean(value);
    container.classList.toggle('city-map-reduced-motion', reducedMotion);
    if (!map) return;
    map.options.inertia = !reducedMotion;
    // Leaflet caches zoom-animation support at construction; all movements
    // initiated here also pass animate:false when the preference is enabled.
    if (reducedMotion && (!flightStarted || flying)) {
      stopFlight();
      map.setView(target, ARRIVAL_ZOOM, {animate:false});
    }
  }
  const onKey = event => {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); exit(); }
    else if (['+', '-', '=', '_', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      stopFlight();
      // Leaflet's keyboard panning uses a JavaScript animation rather than a
      // CSS transition. Respect a live preference change for this path too.
      if (reducedMotion && map && canvas.contains(event.target)) {
        event.preventDefault(); event.stopImmediatePropagation();
        const distance = 80 * (event.shiftKey ? 3 : 1);
        const offset = {ArrowLeft:[-distance,0], ArrowRight:[distance,0], ArrowUp:[0,-distance], ArrowDown:[0,distance]}[event.key];
        if (offset) map.panBy(offset, {animate:false});
        else zoomBy(2 ** ((['-', '_'].includes(event.key) ? -.75 : .75) / 2));
      }
    }
  };
  const onGesture = event => { if (active && event.target.closest('.city-map-canvas')) stopFlight(); };
  container.addEventListener('keydown', onKey, true);
  canvas.addEventListener('wheel', onGesture, {passive:true, capture:true});
  canvas.addEventListener('pointerdown', onGesture, {passive:true});
  retryButton.addEventListener('click', () => { if (campus) open(campus); });
  returnButton.addEventListener('click', exit);
  const resize = new ResizeObserver(() => { if (active) map?.invalidateSize({animate:false, pan:false}); });
  resize.observe(container);
  setReducedMotion(reducedMotion);
  syncText();
  return {
    open, close, zoomBy, setReducedMotion,
    setLocale(value) { language = COPY[value] ? value : 'fr'; syncText(); },
    refreshLayout() { if (active) map?.invalidateSize({animate:false, pan:false}); },
    destroy() {
      close(); destroyed = true; resize.disconnect();
      container.removeEventListener('keydown', onKey, true);
      canvas.removeEventListener('wheel', onGesture, true);
      canvas.removeEventListener('pointerdown', onGesture);
      container.replaceChildren(); container.classList.remove('city-map');
    }
  };
}
