/* Offline orthographic campus globe. Requires the bundled d3 and topojson globals. */
(function () {
  'use strict';
  const COUNTRIES = {
    FRA: { name: 'France', center: [2.4, 46.6], zoom: 3.5, representative: 'paris' },
    BRA: { name: 'Brésil', center: [-50, -15], zoom: 2.15, representative: 'sao' },
    JPN: { name: 'Japon', center: [137.5, 37], zoom: 3.3, representative: 'tokyo' }
  };
  const CAMPUS = {
    paris: { name: 'Paris', country: 'FRA', city: 'Paris', fallback: [2.352992, 48.858092] },
    lyon: { name: 'Lyon', country: 'FRA', city: 'Lyon', fallback: [4.828085, 45.771954] },
    tokyo: { name: 'Tokyo', country: 'JPN', city: 'Tokyo', fallback: [139.749462, 35.686963] },
    rio: { name: 'Rio de Janeiro', country: 'BRA', city: 'Rio de Janeiro', fallback: [-43.212117, -22.907308] },
    sao: { name: 'São Paulo', country: 'BRA', city: 'São Paulo', fallback: [-46.626966, -23.556734] }
  };
  const INITIAL_ROTATION = [-6, -18, 0];
  const CAMPUS_ZOOM = 6.2;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const wrap = value => ((value + 180) % 360 + 360) % 360 - 180;
  let instance = 0;

  window.createCampusGlobe = function createCampusGlobe(options) {
    const { container, world, cities = [], onScopeChange = () => {}, onViewChange = () => {} } = options;
    if (!container || !window.d3 || !window.topojson) throw new Error('Le globe requiert un conteneur, D3 et TopoJSON.');
    const d3 = window.d3;
    const prefix = `hg-${++instance}`;
    const features = world.type === 'Topology'
      ? window.topojson.feature(world, world.objects.features || Object.values(world.objects)[0]).features
      : world.features;
    const data = Object.fromEntries(Object.entries(CAMPUS).map(([id, campus]) => {
      const city = cities.find(item => item.name === campus.city || item.id === id);
      return [id, { ...campus, id, coordinates: city?.coordinates || campus.fallback }];
    }));
    let width = 600, height = 500, centerX = 300, centerY = 250, baseRadius = 207.5, zoom = 1;
    let rotation = [...INITIAL_ROTATION];
    let scope = { country: null, campus: null, countryName: null, campusName: null, level: 'world' };
    let dark = false, destroyed = false, animFrame = 0, inertiaFrame = 0, layoutFrame = 0;
    let moved = false, pointerStart = null, lastMove = 0, velocity = [0, 0], pinchDistance = 0, downCountry = null;
    let lastView = '';
    const pointers = new Map();
    const previousPosition = container.style.position;
    const previousTouch = container.style.touchAction;
    const previousRole = container.getAttribute('role');
    const previousLabel = container.getAttribute('aria-label');
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
    container.style.touchAction = 'none';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Globe interactif des campus. Faites glisser pour tourner, utilisez la molette pour zoomer. Flèches pour tourner, plus et moins pour zoomer, Échap pour revenir.');
    container.classList.add('hg-container');
    const style = document.createElement('style');
    style.textContent = `
      .hg-container { isolation:isolate; outline:none; }
      .hg-container:focus-visible { outline:2px solid #8279f7; outline-offset:5px; border-radius:24px; }
      .hg-globe { position:absolute; inset:0; width:100%; height:100%; overflow:hidden; cursor:grab; touch-action:none; }
      .hg-container.hg-dragging .hg-globe { cursor:grabbing; }
      .hg-country { transition:fill .22s ease,fill-opacity .22s ease; }
      .hg-country[data-active="true"] { cursor:pointer; }
      .hg-country[data-active="true"]:hover { fill:#9188f8!important; fill-opacity:.7!important; }
      .hg-markers { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
      .hg-marker { position:absolute; display:flex; align-items:center; gap:7px; padding:6px 10px 6px 7px; border:1px solid rgba(104,116,141,.17); border-radius:999px; background:rgba(255,255,255,.93); color:#263347; box-shadow:0 4px 16px rgba(45,65,90,.08); font:600 11px/1.2 inherit; font-family:inherit; font-size:11px; line-height:1.2; font-weight:600; white-space:nowrap; pointer-events:auto; cursor:pointer; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); transition:background .2s,box-shadow .2s; transform:translate(-12px,-50%); }
      .hg-marker:hover,.hg-marker:focus-visible { outline:none; background:#fff; box-shadow:0 0 0 3px rgba(98,90,245,.15),0 5px 20px rgba(45,65,90,.1); z-index:3; }
      .hg-marker-dot { flex-shrink:0; width:7px; height:7px; border-radius:50%; background:#625af5; box-shadow:0 0 0 3px rgba(98,90,245,.10); }
      .hg-marker.hg-selected { background:#625af5; border-color:#625af5; color:#fff; }
      .hg-marker.hg-selected .hg-marker-dot { background:#fff; box-shadow:0 0 0 3px rgba(255,255,255,.2); }
      .hg-marker.hg-country-marker { letter-spacing:.015em; }
      .hg-marker.hg-selected:hover { background:#554be2; }
      .hg-container.hg-dark .hg-marker { background:rgba(30,40,59,.94); border-color:rgba(150,168,199,.24); color:#e3e8f3; box-shadow:0 5px 18px rgba(0,0,0,.2); }
      .hg-container.hg-dark .hg-marker-dot { background:#a59aff; box-shadow:0 0 0 3px rgba(165,154,255,.13); }
      .hg-container.hg-dark .hg-marker.hg-selected { background:#a59aff; color:#14172c; border-color:#a59aff; }
      .hg-container.hg-dark .hg-marker.hg-selected .hg-marker-dot { background:#292047; }
      @media (prefers-reduced-motion:reduce) { .hg-marker,.hg-country { transition:none; } }
    `;
    container.append(style);
    const svg = d3.select(container).append('svg').attr('class', 'hg-globe').attr('aria-hidden', 'true');
    const defs = svg.append('defs');
    const oceanGradient = defs.append('radialGradient').attr('id', `${prefix}-ocean`).attr('cx', '29%').attr('cy', '23%').attr('r', '83%');
    oceanGradient.append('stop').attr('offset', '0%');
    oceanGradient.append('stop').attr('offset', '68%');
    oceanGradient.append('stop').attr('offset', '100%');
    const landGradient = defs.append('linearGradient').attr('id', `${prefix}-land`).attr('gradientUnits', 'userSpaceOnUse');
    landGradient.append('stop').attr('offset', '0%');
    landGradient.append('stop').attr('offset', '53%');
    landGradient.append('stop').attr('offset', '100%');
    const atmosphere = defs.append('radialGradient').attr('id', `${prefix}-atmosphere`);
    atmosphere.append('stop').attr('offset', '50%').attr('stop-opacity', .11);
    atmosphere.append('stop').attr('offset', '77%').attr('stop-opacity', .055);
    atmosphere.append('stop').attr('offset', '100%').attr('stop-opacity', 0);
    const shade = defs.append('radialGradient').attr('id', `${prefix}-shade`).attr('cx', '32%').attr('cy', '25%').attr('r', '79%');
    shade.append('stop').attr('offset', '42%').attr('stop-opacity', 0);
    shade.append('stop').attr('offset', '78%').attr('stop-opacity', .045);
    shade.append('stop').attr('offset', '100%').attr('stop-opacity', .24);
    const light = defs.append('radialGradient').attr('id', `${prefix}-light`).attr('cx', '11%').attr('cy', '32%').attr('r', '69%');
    light.append('stop').attr('offset', '0%');
    light.append('stop').attr('offset', '45%');
    light.append('stop').attr('offset', '100%').attr('stop-opacity', 0);
    const halo = svg.append('ellipse').attr('fill', `url(#${prefix}-atmosphere)`).attr('pointer-events', 'none');
    const ocean = svg.append('path').datum({ type: 'Sphere' }).attr('fill', `url(#${prefix}-ocean)`);
    const projection = d3.geoOrthographic().precision(.25).clipAngle(90);
    const path = d3.geoPath(projection);
    const graticule = svg.append('path').datum(d3.geoGraticule().step([20,20])()).attr('fill', 'none').attr('stroke-width', .55).attr('pointer-events', 'none');
    const countries = svg.append('g').selectAll('path').data(features).join('path')
      .attr('class', 'hg-country').attr('data-country', feature => feature.properties?.id || feature.id)
      .attr('data-active', feature => Boolean(COUNTRIES[feature.properties?.id || feature.id]))
      .attr('stroke-width', .6).attr('stroke-linejoin', 'round');
    const shading = svg.append('path').datum({ type: 'Sphere' }).attr('fill', `url(#${prefix}-shade)`).attr('pointer-events', 'none');
    const lighting = svg.append('path').datum({ type: 'Sphere' }).attr('fill', `url(#${prefix}-light)`).attr('pointer-events', 'none');
    const locatorLayer = svg.append('g').attr('pointer-events', 'none');
    const markerLayer = document.createElement('div');
    markerLayer.className = 'hg-markers';
    container.append(markerLayer);
    const markers = new Map();
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    function emitScope() { onScopeChange({ ...scope }); emitView(); }
    function emitView() {
      const key = `${zoom.toFixed(3)}:${scope.level}`;
      if (key !== lastView) { lastView = key; onViewChange({ zoom, canBack: scope.level !== 'world' || zoom > 1.015 }); }
    }
    function updateColors() {
      container.classList.toggle('hg-dark', dark);
      const stops = dark ? ['#26384c','#172435','#0e1725'] : ['#fff','#f1f6f8','#d6e1ed'];
      oceanGradient.selectAll('stop').attr('stop-color', (_, i) => stops[i]);
      const landStops = dark ? ['#566d83','#3c5067','#293b52'] : ['#d3e1e5','#c5d4dd','#aebfcf'];
      landGradient.selectAll('stop').attr('stop-color', (_, i) => landStops[i]);
      atmosphere.selectAll('stop').attr('stop-color', dark ? '#000a17' : '#48647f');
      shade.selectAll('stop').attr('stop-color', dark ? '#030b1c' : '#3d5b7c');
      light.selectAll('stop').attr('stop-color', dark ? '#93eee9' : '#d3fff9')
        .attr('stop-opacity', (_, i) => i === 0 ? (dark ? .105 : .25) : i === 1 ? (dark ? .026 : .06) : 0);
      graticule.attr('stroke', dark ? '#8ba3b5' : '#aabfcc').attr('stroke-opacity', dark ? .13 : .23);
      countries.attr('stroke', dark ? '#1c2d40' : '#f4f8fa').attr('fill', feature => {
        const id = feature.properties?.id || feature.id;
        if (scope.country === id) return dark ? '#8c81e5' : '#a79df7';
        if (COUNTRIES[id]) return dark ? '#607289' : '#b5c8d8';
        return `url(#${prefix}-land)`;
      });
    }
    function syncMarkers() {
      markerLayer.replaceChildren();
      markers.clear();
      let entries;
      if (scope.country) entries = Object.values(data).filter(campus => campus.country === scope.country).map(campus => ({ ...campus, type: 'campus' }));
      else entries = Object.entries(COUNTRIES).map(([id, country]) => ({ id, name: country.name, coordinates: data[country.representative].coordinates, type: 'country' }));
      for (const entry of entries) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `hg-marker${entry.type === 'country' ? ' hg-country-marker' : ''}${scope.campus === entry.id ? ' hg-selected' : ''}`;
        button.setAttribute('aria-label', entry.type === 'country' ? `Explorer les campus : ${entry.name}` : `Explorer le campus de ${entry.name}`);
        if (scope.campus === entry.id) button.setAttribute('aria-current', 'true');
        const dot = document.createElement('span'); dot.className = 'hg-marker-dot'; dot.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span'); label.textContent = entry.name;
        button.append(dot, label);
        button.addEventListener('click', () => entry.type === 'country' ? selectCountry(entry.id) : selectCampus(entry.id));
        markerLayer.append(button);
        markers.set(entry.id, { ...entry, button });
      }
      locatorLayer.selectAll('*').remove();
    }
    function render() {
      if (destroyed) return;
      const radius = baseRadius * zoom;
      projection.translate([centerX, centerY]).scale(radius).rotate(rotation);
      landGradient.attr('x1', centerX - radius * .7).attr('y1', centerY - radius * .7)
        .attr('x2', centerX + radius).attr('y2', centerY + radius * .8);
      ocean.attr('d', path); graticule.attr('d', path); countries.attr('d', path); shading.attr('d', path); lighting.attr('d', path);
      halo.attr('cx', centerX + radius * .085).attr('cy', centerY + radius * .12)
        .attr('rx', radius * 1.23).attr('ry', radius * 1.17);
      const center = projection.invert([centerX, centerY]);
      const occupied = [];
      const connectors = [];
      for (const marker of markers.values()) {
        const point = projection(marker.coordinates);
        const visible = d3.geoDistance(marker.coordinates, center) < Math.PI / 2 - .045 && point && point[0] > 8 && point[0] < width - 8 && point[1] > 10 && point[1] < height - 10;
        marker.button.hidden = !visible;
        marker.button.style.display = visible ? 'flex' : 'none';
        if (!visible) continue;
        const bw = marker.button.offsetWidth || 92;
        const bh = marker.button.offsetHeight || 29;
        let x = clamp(point[0], 14, width - bw + 10);
        let y = clamp(point[1], 20, height - 20);
        let shifts = 0;
        while (occupied.some(box => Math.abs(y - box.y) < (bh + box.h) / 2 + 5 && x - 12 < box.x - 12 + box.w + 5 && x - 12 + bw + 5 > box.x - 12) && shifts < 8) {
          y += 34; shifts++;
          if (y > height - 20) y = point[1] - 34 * shifts;
        }
        occupied.push({x, y, w: bw, h: bh});
        marker.button.style.left = `${x}px`; marker.button.style.top = `${y}px`;
        if (Math.hypot(x - point[0], y - point[1]) > 10) connectors.push({point, end:[x, y]});
      }
      locatorLayer.selectAll('line').data(connectors).join('line').attr('x1', d => d.point[0]).attr('y1', d => d.point[1]).attr('x2', d => d.end[0]).attr('y2', d => d.end[1]).attr('stroke', dark ? '#a59aff' : '#625af5').attr('stroke-width', .8).attr('stroke-opacity', .55);
      locatorLayer.selectAll('circle').data(connectors).join('circle').attr('cx', d => d.point[0]).attr('cy', d => d.point[1]).attr('r', 2.6).attr('fill', dark ? '#a59aff' : '#625af5');
      emitView();
    }
    // Read layout only on resize or on explicit refresh; rotation frames avoid style reads.
    // CSS fractions may also be percentages, e.g. --hg-center-x: 63%.
    function refreshLayout({ animate = true } = {}) {
      if (destroyed) return;
      cancelAnimationFrame(layoutFrame);
      const styles = getComputedStyle(container);
      function fraction(name, fallback, min, max) {
        const raw = styles.getPropertyValue(name).trim();
        const parsed = parseFloat(raw);
        return Number.isFinite(parsed) ? clamp(parsed / (raw.endsWith('%') ? 100 : 1), min, max) : fallback;
      }
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      const target = [
        width * fraction('--hg-center-x', .5, 0, 1),
        height * fraction('--hg-center-y', .5, 0, 1),
        Math.min(width, height) * fraction('--hg-radius', .415, .1, 2)
      ];
      svg.attr('viewBox', `0 0 ${width} ${height}`);
      if (!animate || reducedMotion) {
        [centerX, centerY, baseRadius] = target;
        render();
        return;
      }
      const start = [centerX, centerY, baseRadius];
      const started = performance.now();
      function step(time) {
        const progress = clamp((time - started) / 650, 0, 1);
        const eased = d3.easeCubicInOut(progress);
        [centerX, centerY, baseRadius] = target.map((value, index) => start[index] + (value - start[index]) * eased);
        render();
        if (progress < 1) layoutFrame = requestAnimationFrame(step); else layoutFrame = 0;
      }
      layoutFrame = requestAnimationFrame(step);
    }
    function cancelMotion() { cancelAnimationFrame(animFrame); cancelAnimationFrame(inertiaFrame); animFrame = inertiaFrame = 0; }
    function animateTo(targetRotation, targetZoom) {
      cancelMotion();
      const fromRotation = [...rotation], fromZoom = zoom;
      const deltaLongitude = wrap(targetRotation[0] - fromRotation[0]);
      const started = performance.now();
      const duration = reducedMotion ? 0 : 900;
      function step(time) {
        const progress = duration ? clamp((time - started) / duration, 0, 1) : 1;
        const eased = d3.easeCubicInOut(progress);
        rotation = [wrap(fromRotation[0] + deltaLongitude * eased), fromRotation[1] + (targetRotation[1] - fromRotation[1]) * eased, 0];
        zoom = fromZoom + (targetZoom - fromZoom) * eased;
        render();
        if (progress < 1) animFrame = requestAnimationFrame(step); else animFrame = 0;
      }
      animFrame = requestAnimationFrame(step);
    }
    function selectCountry(id) {
      if (!COUNTRIES[id] || destroyed) return;
      const country = COUNTRIES[id];
      scope = { country: id, campus: null, countryName: country.name, campusName: null, level: 'country' };
      syncMarkers(); updateColors(); emitScope();
      animateTo([-country.center[0], -country.center[1], 0], country.zoom);
    }
    function selectCampus(id) {
      const campus = data[id];
      if (!campus || destroyed) return;
      scope = { country: campus.country, campus: id, countryName: COUNTRIES[campus.country].name, campusName: campus.name, level: 'campus' };
      syncMarkers(); updateColors(); emitScope();
      animateTo([-campus.coordinates[0], -campus.coordinates[1], 0], CAMPUS_ZOOM);
    }
    function reset() {
      scope = { country: null, campus: null, countryName: null, campusName: null, level: 'world' };
      syncMarkers(); updateColors(); emitScope();
      animateTo(INITIAL_ROTATION, 1);
    }
    function back() { if (scope.campus) selectCountry(scope.country); else reset(); }
    function updateZoom(value) {
      const previousZoom = zoom;
      zoom = clamp(value, 1, 8);
      if (zoom < previousZoom) {
        let changed = false;
        if (scope.campus && zoom < COUNTRIES[scope.country].zoom + .35) {
          scope = { ...scope, campus: null, campusName: null, level: 'country' }; changed = true;
        }
        if (scope.country && zoom < 1.42) {
          scope = { country: null, campus: null, countryName: null, campusName: null, level: 'world' }; changed = true;
        }
        if (changed) { syncMarkers(); updateColors(); emitScope(); }
      }
      render();
    }
    function zoomBy(factor) { if (Number.isFinite(factor) && factor > 0) { cancelMotion(); updateZoom(zoom * factor); } }
    function point(event) { return [event.clientX, event.clientY]; }
    function distance() { const p = [...pointers.values()]; return p.length > 1 ? Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]) : 0; }
    const svgNode = svg.node();
    function pointerDown(event) {
      if (event.button !== 0 && event.pointerType !== 'touch') return;
      cancelMotion();
      pointers.set(event.pointerId, point(event));
      svgNode.setPointerCapture(event.pointerId);
      if (pointers.size === 1) { moved = false; pointerStart = point(event); velocity = [0,0]; downCountry = event.target.closest('.hg-country')?.getAttribute('data-country') || null; }
      else { moved = true; pinchDistance = distance(); }
      lastMove = performance.now();
      container.classList.add('hg-dragging');
    }
    function pointerMove(event) {
      if (!pointers.has(event.pointerId)) return;
      const oldPoint = pointers.get(event.pointerId);
      const newPoint = point(event);
      pointers.set(event.pointerId, newPoint);
      const now = performance.now();
      if (pointers.size > 1) {
        const nextDistance = distance();
        if (pinchDistance > 0) updateZoom(zoom * nextDistance / pinchDistance);
        pinchDistance = nextDistance; moved = true;
      } else {
        const dx = newPoint[0] - oldPoint[0], dy = newPoint[1] - oldPoint[1];
        if (pointerStart && Math.hypot(newPoint[0]-pointerStart[0],newPoint[1]-pointerStart[1]) > 5) moved = true;
        if (moved) {
          const sensitivity = 180 / (Math.PI * baseRadius * zoom);
          rotation = [wrap(rotation[0] + dx * sensitivity), clamp(rotation[1] - dy * sensitivity,-85,85),0];
          const deltaTime = Math.max(8, now-lastMove);
          velocity = [dx * sensitivity / deltaTime, -dy * sensitivity / deltaTime];
          render();
        }
      }
      lastMove = now;
    }
    function pointerUp(event) {
      if (!pointers.has(event.pointerId)) return;
      pointers.delete(event.pointerId);
      if (svgNode.hasPointerCapture(event.pointerId)) svgNode.releasePointerCapture(event.pointerId);
      if (pointers.size) { pinchDistance = 0; velocity = [0,0]; return; }
      container.classList.remove('hg-dragging');
      if (!moved && event.type !== 'pointercancel' && COUNTRIES[downCountry]) selectCountry(downCountry);
      if (moved && !reducedMotion && event.type !== 'pointercancel' && performance.now()-lastMove < 90) {
        let last = performance.now();
        function drift(time) {
          const dt = Math.min(time-last,32); last = time;
          velocity = velocity.map(v => v * Math.pow(.88, dt/16.7));
          rotation = [wrap(rotation[0] + velocity[0]*dt),clamp(rotation[1]+velocity[1]*dt,-85,85),0];
          render();
          if (Math.hypot(...velocity) > .002) inertiaFrame = requestAnimationFrame(drift); else inertiaFrame = 0;
        }
        inertiaFrame = requestAnimationFrame(drift);
      }
    }
    function wheel(event) {
      event.preventDefault(); cancelMotion();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1);
      updateZoom(zoom * Math.exp(-clamp(delta,-250,250) * .002));
    }
    function keyDown(event) {
      if (event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
      const rotations = {ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,8],ArrowDown:[0,-8]};
      if (rotations[event.key]) { event.preventDefault(); cancelMotion(); const [dx,dy] = rotations[event.key]; rotation = [wrap(rotation[0]+dx/zoom),clamp(rotation[1]+dy/zoom,-85,85),0]; render(); }
      else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomBy(1.25); }
      else if (event.key === '-') { event.preventDefault(); zoomBy(.8); }
      else if (event.key === 'Escape') { event.preventDefault(); back(); }
      else if (event.key === 'Home') { event.preventDefault(); reset(); }
    }
    svgNode.addEventListener('pointerdown', pointerDown);
    svgNode.addEventListener('pointermove', pointerMove);
    svgNode.addEventListener('pointerup', pointerUp);
    svgNode.addEventListener('pointercancel', pointerUp);
    container.addEventListener('wheel', wheel, { passive: false });
    container.addEventListener('keydown', keyDown);
    const resize = new ResizeObserver(() => refreshLayout({ animate: false }));
    resize.observe(container);
    syncMarkers(); updateColors(); emitScope(); refreshLayout({ animate: false });
    return {
      selectCountry, selectCampus, back, reset, zoomBy, refreshLayout,
      setTheme(isDark) { dark = Boolean(isDark); updateColors(); render(); },
      destroy() {
        destroyed = true; cancelMotion(); cancelAnimationFrame(layoutFrame); resize.disconnect();
        container.removeEventListener('wheel',wheel); container.removeEventListener('keydown',keyDown);
        svg.remove(); markerLayer.remove(); style.remove();
        container.classList.remove('hg-container','hg-dark','hg-dragging');
        container.style.position = previousPosition; container.style.touchAction = previousTouch;
        for (const [key,value] of [['role',previousRole],['aria-label',previousLabel]]) {
          if (value === null) container.removeAttribute(key); else container.setAttribute(key,value);
        }
      }
    };
  };
}());
