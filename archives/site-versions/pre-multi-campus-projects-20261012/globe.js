/* Offline orthographic campus globe. Requires the bundled d3 and topojson globals. */
(function () {
  'use strict';
  const INITIAL_ROTATION = [-6, -18, 0];
  const CAMPUS_ZOOM = 6.2;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const wrap = value => ((value + 180) % 360 + 360) % 360 - 180;
  let instance = 0;

  window.createWelcomeGlobe = function createWelcomeGlobe(options) {
    const { container, world, campuses = [], countries:networkCountries = [], onScopeChange = () => {}, onViewChange = () => {} } = options;
    if (!container || !window.d3 || !window.topojson) throw new Error('Le globe requiert un conteneur, D3 et TopoJSON.');
    const d3 = window.d3;
    const prefix = `hg-${++instance}`;
    const features = world.type === 'Topology'
      ? window.topojson.feature(world, world.objects.features || Object.values(world.objects)[0]).features
      : world.features;
    const data = Object.fromEntries(campuses.map(campus => [campus.id, campus]));
    const COUNTRIES = Object.fromEntries(networkCountries.map(country => {
      const members = campuses.filter(campus => campus.country === country.id);
      if (!members.length) return null;
      const center = d3.geoCentroid({type:'MultiPoint',coordinates:members.map(campus => campus.coordinates)});
      const extent = Math.max(...members.map(campus => d3.geoDistance(center,campus.coordinates)));
      const representative = [...members].sort((a,b) => d3.geoDistance(center,a.coordinates)-d3.geoDistance(center,b.coordinates))[0].id;
      return [country.id,{...country,center,representative,zoom:clamp(.65/Math.sin(extent+.15),1.85,3.5)}];
    }).filter(Boolean));
    const countryFeatures = features.filter(feature => COUNTRIES[feature.properties?.id || feature.id]);
    const mappedCountries = new Set(countryFeatures.map(feature => feature.properties?.id || feature.id));
    let width = 600, height = 500, centerX = 300, centerY = 250, baseRadius = 207.5, zoom = 1;
    let rotation = [...INITIAL_ROTATION], motionTarget = null;
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
      .hg-container:focus-visible { outline:2px solid var(--h42-color-focus); outline-offset:-4px; border-radius:32px; }
      .hg-globe { position:absolute; inset:0; width:100%; height:100%; overflow:hidden; cursor:grab; touch-action:none; }
      .hg-globe {
        --hg-edge-fade-x:0px; --hg-edge-fade-y:0px;
        -webkit-mask-image:linear-gradient(to right,transparent,#000 var(--hg-edge-fade-x),#000 calc(100% - var(--hg-edge-fade-x)),transparent),linear-gradient(to bottom,transparent,#000 var(--hg-edge-fade-y),#000 calc(100% - var(--hg-edge-fade-y)),transparent);
        mask-image:linear-gradient(to right,transparent,#000 var(--hg-edge-fade-x),#000 calc(100% - var(--hg-edge-fade-x)),transparent),linear-gradient(to bottom,transparent,#000 var(--hg-edge-fade-y),#000 calc(100% - var(--hg-edge-fade-y)),transparent);
        -webkit-mask-composite:source-in;
        mask-composite:intersect;
      }
      .hg-container.hg-dragging .hg-globe { cursor:grabbing; }
      .hg-country { transition:fill .25s ease; }
      .hg-country[data-active="true"] { cursor:pointer; }
      .hg-country[data-active="true"]:hover { fill:var(--h42-pink)!important; }
      .hg-markers { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
      .hg-marker { direction:ltr; position:absolute; display:flex; align-items:center; gap:10px; min-height:44px; padding:10px 17px 10px 12px; border:1px solid color-mix(in srgb,var(--h42-pink) 12%,var(--h42-color-surface)); border-radius:99px; background:var(--h42-color-surface); color:var(--h42-color-text); box-shadow:0 8px 28px color-mix(in srgb,var(--h42-pink) 12%,transparent); font-family:inherit; font-size:14px; line-height:1.2; font-weight:500; white-space:nowrap; pointer-events:auto; cursor:pointer; transform:translate(-12px,-50%); transition:background .2s,box-shadow .2s; }
      .hg-marker:hover,.hg-marker:focus-visible { outline:2px solid var(--h42-color-focus); outline-offset:3px; z-index:3; }
      .hg-marker-dot { flex-shrink:0; width:8px; height:8px; border-radius:50%; background:var(--h42-pink); box-shadow:0 0 0 5px color-mix(in srgb,var(--h42-pink) 10%,transparent); }
      .hg-marker.hg-selected { background:var(--h42-color-text); color:var(--h42-color-bg); border-color:var(--h42-color-text); }
      .hg-marker.hg-selected .hg-marker-dot { background:var(--h42-teal); }
      .hg-marker { z-index:1; }
      .hg-marker.hg-compact { z-index:0;width:12px;min-height:12px;padding:0;justify-content:center;transform:translate(-50%,-50%);border-color:transparent;background:transparent;box-shadow:none; }
      .hg-marker.hg-compact:hover,.hg-marker.hg-compact:focus-visible { z-index:3; }
      .hg-marker.hg-compact>span:last-child { position:absolute;left:28px;top:50%;transform:translateY(-50%);padding:8px 12px;border-radius:20px;background:var(--h42-color-surface);color:var(--h42-color-text);box-shadow:0 4px 20px #0001;visibility:hidden;pointer-events:none; }
      .hg-marker.hg-compact:hover>span:last-child,.hg-marker.hg-compact:focus-visible>span:last-child { visibility:visible; }
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
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionPreference.matches;
    function motionChanged(event) {
      reducedMotion = event.matches;
      if (reducedMotion) {
        const destination = motionTarget;
        cancelMotion(); cancelAnimationFrame(layoutFrame);
        if (destination) { rotation = [...destination.rotation]; zoom = destination.zoom; }
        refreshLayout({animate:false});
      }
    }
    motionPreference.addEventListener('change', motionChanged);

    function emitScope() { onScopeChange({ ...scope }); emitView(); }
    function emitView() {
      const key = `${zoom.toFixed(3)}:${scope.level}`;
      if (key !== lastView) { lastView = key; onViewChange({ zoom, canBack: scope.level !== 'world' || zoom > 1.015 }); }
    }
    function updateColors() {
      container.classList.toggle('hg-dark', dark);
      const css = getComputedStyle(container);
      const token = name => css.getPropertyValue(name).trim();
      const white = token('--h42-white'), ink = token('--h42-ink');
      const teal = token('--h42-teal'), pink = token('--h42-pink');
      const mix = (a,b,t) => d3.interpolateRgb(a,b)(t);
      const base = dark ? ink : white;
      const stops = dark ? [mix(ink,pink,.12), mix(ink,pink,.075), mix(ink,pink,.2)]
        : [white, mix(white,pink,.035), mix(white,pink,.15)];
      oceanGradient.selectAll('stop').attr('stop-color', (_,i) => stops[i]);
      const landStops = dark ? [mix(ink,teal,.62), mix(ink,teal,.4), mix(ink,teal,.24)]
        : [mix(white,teal,.12), mix(white,teal,.32), mix(white,teal,.52)];
      landGradient.selectAll('stop').attr('stop-color', (_,i) => landStops[i]);
      atmosphere.selectAll('stop').attr('stop-color', pink);
      shade.selectAll('stop').attr('stop-color', token('--h42-cerulean'));
      shade.selectAll('stop').attr('stop-opacity', (_,i) => [0,.015,.11][i]);
      light.selectAll('stop').attr('stop-color', white).attr('stop-opacity', (_,i) => [dark?.045:.3,dark?.015:.07,0][i]);
      graticule.attr('stroke', dark ? teal : pink).attr('stroke-opacity', .09);
      countries.attr('stroke', mix(base,teal,dark?.17:.12)).attr('fill', feature => {
        const id = feature.properties?.id || feature.id;
        if(scope.country === id) return mix(base,pink,dark?.7:.42);
        if(COUNTRIES[id]) return mix(base,teal,dark?.62:.44);
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
        button.setAttribute('aria-label', options.markerLabel?.(entry) || (entry.type === 'country' ? `Explorer les campus : ${entry.name}` : `Explorer le campus de ${entry.name}`));
        if (scope.campus === entry.id) button.setAttribute('aria-current', 'true');
        const dot = document.createElement('span'); dot.className = 'hg-marker-dot'; dot.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span'); label.dir = 'auto'; label.textContent = options.formatPlace?.(entry.name, entry) || entry.name;
        button.append(dot, label);
        button.addEventListener('click', () => { if(entry.type === 'country') selectCountry(entry.id); else selectCampus(entry.id); container.focus({preventScroll:true}); });
        markerLayer.append(button);
        markers.set(entry.id, { ...entry, button });
      }
      locatorLayer.selectAll('*').remove();
    }
    function render() {
      if (destroyed) return;
      const radius = baseRadius * zoom;
      // Fade only the map into the page, keeping HTML markers and focus intact.
      // At world scale the zero-width fade preserves the globe's full silhouette.
      const fadeProgress = clamp((zoom - 1) / .55, 0, 1);
      const fadeStrength = fadeProgress * fadeProgress * (3 - 2 * fadeProgress);
      svg.style('--hg-edge-fade-x', `${Math.min(width * .14, 180) * fadeStrength}px`)
        .style('--hg-edge-fade-y', `${Math.min(height * .18, 150) * fadeStrength}px`);
      projection.translate([centerX, centerY]).scale(radius).rotate(rotation);
      landGradient.attr('x1', centerX - radius * .7).attr('y1', centerY - radius * .7)
        .attr('x2', centerX + radius).attr('y2', centerY + radius * .8);
      ocean.attr('d', path); graticule.attr('d', path); countries.attr('d', path); shading.attr('d', path); lighting.attr('d', path);
      halo.attr('cx', centerX + radius * .085).attr('cy', centerY + radius * .12)
        .attr('rx', radius * 1.23).attr('ry', radius * 1.17);
      const center = projection.invert([centerX, centerY]);
      const occupied = [];
      const connectors = [];
      const visiblePoints = [...markers.values()].map(marker => ({marker,point:projection(marker.coordinates)}))
        .filter(({marker,point}) => point && d3.geoDistance(marker.coordinates,center)<Math.PI/2-.045
          && point[0]>8 && point[0]<width-8 && point[1]>10 && point[1]<height-10);
      const orderedMarkers = [...markers.values()].sort((a,b) => Number(b.id===scope.campus)-Number(a.id===scope.campus)
        || d3.geoDistance(a.coordinates,center)-d3.geoDistance(b.coordinates,center));
      for (const marker of orderedMarkers) {
        const point = projection(marker.coordinates);
        const visible = d3.geoDistance(marker.coordinates, center) < Math.PI / 2 - .045 && point && point[0] > 8 && point[0] < width - 8 && point[1] > 10 && point[1] < height - 10;
        marker.button.hidden = !visible;
        marker.button.style.display = visible ? 'flex' : 'none';
        if (!visible) continue;
        if (!marker.width) {
          marker.button.classList.remove('hg-compact');
          marker.width = marker.button.offsetWidth || 92;
          marker.height = marker.button.offsetHeight || 44;
        }
        const bw = marker.width, bh = marker.height;
        let x = clamp(point[0], 14, width - bw + 10);
        let y = clamp(point[1], 20, height - 20);
        const compact = marker.id !== scope.campus && (occupied.length >= (width < 700 ? 5 : 8)
          || occupied.some(box => Math.abs(y-box.y)<(bh+box.h)/2+12 && x-12<box.x-12+box.w+12 && x-12+bw+12>box.x-12)
          || visiblePoints.some(other => other.marker.id!==marker.id && other.point[0]>x-20 && other.point[0]<x+bw
            && Math.abs(other.point[1]-y)<bh/2+8));
        if (compact) {
          marker.button.classList.add('hg-compact');
          marker.button.style.left = `${point[0]}px`; marker.button.style.top = `${point[1]}px`;
          continue;
        }
        marker.button.classList.remove('hg-compact');
        occupied.push({x, y, w: bw, h: bh});
        marker.button.style.left = `${x}px`; marker.button.style.top = `${y}px`;
        if (Math.hypot(x - point[0], y - point[1]) > 10) connectors.push({point, end:[x, y]});
      }
      locatorLayer.selectAll('line').data(connectors).join('line').attr('x1', d => d.point[0]).attr('y1', d => d.point[1]).attr('x2', d => d.end[0]).attr('y2', d => d.end[1]).attr('stroke', 'var(--h42-pink)').attr('stroke-width', .8).attr('stroke-opacity', .55);
      locatorLayer.selectAll('circle').data(connectors).join('circle').attr('cx', d => d.point[0]).attr('cy', d => d.point[1]).attr('r', 2.6).attr('fill', 'var(--h42-pink)');
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
    function cancelMotion() { cancelAnimationFrame(animFrame); cancelAnimationFrame(inertiaFrame); animFrame = inertiaFrame = 0; motionTarget = null; }
    function animateTo(targetRotation, targetZoom) {
      cancelMotion();
      motionTarget = { rotation: [...targetRotation], zoom: targetZoom };
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
        if (progress < 1) animFrame = requestAnimationFrame(step); else { animFrame = 0; motionTarget = null; }
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
    function geographicTarget(anchor) {
      if (anchor[0] < 0 || anchor[0] > width || anchor[1] < 0 || anchor[1] > height
        || Math.hypot(anchor[0] - centerX, anchor[1] - centerY) > baseRadius * zoom) return null;
      return projection.invert(anchor);
    }
    function nearbyCampus(anchor) {
      const center = projection.invert([centerX, centerY]);
      const reach = Math.max(56, Math.min(width, height) * .18);
      return Object.values(data).filter(campus => campus.country === scope.country)
        .map(campus => ({ campus, point: projection(campus.coordinates) }))
        .filter(({campus, point}) => point && d3.geoDistance(campus.coordinates, center) < Math.PI / 2 - .045
          && point[0] > 8 && point[0] < width - 8 && point[1] > 10 && point[1] < height - 10)
        .map(({campus, point}) => ({campus, distance:Math.hypot(point[0] - anchor[0], point[1] - anchor[1])}))
        .filter(entry => entry.distance <= reach).sort((a,b) => a.distance - b.distance)[0]?.campus;
    }
    function anchoredRotation(target, anchor, radius) {
      const rad = Math.PI/180, deg = 180/Math.PI;
      const lon = target[0]*rad, lat = target[1]*rad, cosLat = Math.cos(lat);
      const x = (anchor[0]-centerX)/radius, y = -(anchor[1]-centerY)/radius;
      if (x*x+y*y >= 1 || Math.abs(x)>cosLat) return null;
      const front = Math.sqrt(1-x*x-y*y), angle = Math.asin(clamp(x/cosLat,-1,1));
      return [angle,Math.PI-angle].map(lambda => {
        const next = [wrap((lambda-lon)*deg),wrap((Math.atan2(y,front)-Math.atan2(Math.sin(lat),cosLat*Math.cos(lambda)))*deg),0];
        return {rotation:next,distance:Math.hypot(wrap(next[0]-rotation[0]),next[1]-rotation[1])};
      }).filter(candidate => Math.abs(candidate.rotation[1])<=85)
        .sort((a,b)=>a.distance-b.distance)[0]?.rotation || null;
    }
    function updateZoom(value, anchor = [centerX, centerY], anchorView = false) {
      const previousZoom = zoom;
      // Resolve against the view before scaling. A gesture changes scope without
      // snapping the camera or replacing the user's requested zoom.
      const target = geographicTarget(anchor);
      const campus = target && scope.country ? nearbyCampus(anchor) : null;
      zoom = clamp(value, 1, 8);
      if (anchorView && target) rotation = anchoredRotation(target,anchor,baseRadius*zoom) || rotation;
      let changed = false;
      if (value < previousZoom) {
        if (scope.campus && zoom < COUNTRIES[scope.country].zoom + .35) {
          scope = { ...scope, campus: null, campusName: null, level: 'country' }; changed = true;
        }
        if (scope.country && zoom < 1.42) {
          scope = { country: null, campus: null, countryName: null, campusName: null, level: 'world' }; changed = true;
        }
      } else if (value > previousZoom && target) {
        if (!scope.country && zoom >= 1.75) {
          const feature = countryFeatures.find(feature => d3.geoContains(feature, target));
          // Tiny territories absent from this simplified basemap remain reachable
          // around their published campus location (e.g. Singapore and Nablus).
          const closestCampus = campuses.map(campus => ({campus,distance:d3.geoDistance(campus.coordinates,target)}))
            .filter(entry => entry.distance < .006).sort((a,b) => a.distance-b.distance)[0]?.campus;
          const smallCampus = closestCampus && (!feature || !mappedCountries.has(closestCampus.country)) ? closestCampus : null;
          const id = smallCampus?.country || (feature && (feature.properties?.id || feature.id));
          if (id) {
            scope = { country:id, campus:null, countryName:COUNTRIES[id].name, campusName:null, level:'country' };
            changed = true;
          }
        } else if (!scope.campus && campus && zoom >= Math.max(4.2, COUNTRIES[scope.country].zoom + 1)) {
          scope = { ...scope, campus:campus.id, campusName:campus.name, level:'campus' };
          changed = true;
        }
      }
      if (changed) { syncMarkers(); updateColors(); emitScope(); }
      render();
    }
    function zoomBy(factor) { if (Number.isFinite(factor) && factor > 0) { cancelMotion(); updateZoom(zoom * factor); } }
    function point(event) { return [event.clientX, event.clientY]; }
    function localAnchor(clientPoint, target) {
      const marker = [...markers.values()].find(marker => target && marker.button.contains(target));
      if (marker && !marker.button.classList.contains('hg-compact')) return projection(marker.coordinates);
      const bounds = container.getBoundingClientRect();
      return [clientPoint[0] - bounds.left, clientPoint[1] - bounds.top];
    }
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
        const [first, second] = [...pointers.values()];
        const midpoint = [(first[0]+second[0])/2, (first[1]+second[1])/2];
        if (pinchDistance > 0) updateZoom(zoom * nextDistance / pinchDistance, localAnchor(midpoint), true);
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
      updateZoom(zoom * Math.exp(-clamp(delta,-250,250) * .002), localAnchor(point(event), event.target), true);
    }
    function keyDown(event) {
      if (event.target !== container) return;
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
    document.fonts?.ready.then(() => {
      if (destroyed) return;
      for (const marker of markers.values()) marker.width = 0;
      render();
    });
    return {
      selectCountry, selectCampus, back, reset, zoomBy, refreshLayout,
      refreshLabels() { syncMarkers(); render(); },
      setTheme(isDark) { dark = Boolean(isDark); updateColors(); render(); },
      destroy() {
        destroyed = true; motionPreference.removeEventListener('change', motionChanged); cancelMotion(); cancelAnimationFrame(layoutFrame); resize.disconnect();
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
