/**
 * 42 Horizon — one vector map, from the globe to the campus neighbourhood.
 * Data: https://tiles.openfreemap.org/planet (OpenMapTiles / OpenStreetMap).
 * Schema: https://openmaptiles.org/docs/schema/
 * Glyph endpoint and font family: https://tiles.openfreemap.org/styles/liberty
 * Projection: https://maplibre.org/maplibre-style-spec/types/#projectiondefinition
 *
 * No raster basemap, commercial POIs, sprite dependency, or generated geometry.
 * Building heights come from render_height: OMT may derive them from OSM levels.
 */

const SOURCE = 'openmaptiles';
const WORLD_SOURCE = 'world';
const BORDER_SOURCE = 'world-borders';
const TEAL = '#00BABC';
const PINK = '#EC3391';
const zoom = (...stops) => ['interpolate', ['linear'], ['zoom'], ...stops];
const classes = (...values) => ['in', ['get', 'class'], ['literal', values]];
const surfaceLine = ['all', ['==', ['geometry-type'], 'LineString'], ['!=', ['get', 'brunnel'], 'tunnel']];
const nativeName = ['coalesce', ['get', 'name'], ['get', 'name:en'], ['get', 'name_en'], ''];
const opacityProperties = Object.freeze({
  background: ['background-opacity'], fill: ['fill-opacity'], line: ['line-opacity'],
  symbol: ['text-opacity', 'icon-opacity'], 'fill-extrusion': ['fill-extrusion-opacity'],
});
const detailOpacityStates = new WeakMap();

// All IDs are stable across themes. Integration may replace text-field for FR/EN/AR.
export const GLOBE_LABEL_LAYER_IDS = Object.freeze([
  'h42-country-label', 'h42-city-label', 'h42-neighbourhood-label', 'h42-road-label',
]);

const palettes = {
  light: {
    landWorld: '#19B8B5', landCountry: '#96D8CE', landLocal: '#EDF2F0',
    waterWorld: '#D9EEEE', waterLocal: '#AADFE1', waterLine: '#4CADB3',
    green: '#8FCFBA', urban: '#DCE9E5', campus: PINK,
    border: '#C4F3EF', region: '#4C9590',
    road: '#FFFFFF', major: '#FFFFFF', roadEdge: '#B2C4C2', path: '#899E9A',
    rail: '#809493', building: '#A6CFC8', buildingEdge: '#579F98',
    extrusion: '#7ABBB3', text: '#234B49', textSecondary: '#566E6B', halo: '#FFFFFF',
    light: '#FFFFFF', lightIntensity: 0.26,
  },
  dark: {
    landWorld: '#256967', landCountry: '#245755', landLocal: '#203B3D',
    waterWorld: '#25232B', waterLocal: '#20232C', waterLine: '#387A7F',
    green: '#27685B', urban: '#684B62', campus: PINK,
    border: '#A5DBD2', region: '#578C87',
    road: '#71948F', major: '#B6B1B5', roadEdge: '#533C50', path: '#AD7D9B',
    rail: '#748A90', building: '#408883', buildingEdge: '#65A8A2',
    extrusion: '#559F96', text: '#D7EAE4', textSecondary: '#A8C5BF', halo: '#203B3D',
    light: '#E6F4F1', lightIntensity: 0.2,
  },
};

function layer(id, type, sourceLayer, options = {}) {
  return { id, type, source: SOURCE, 'source-layer': sourceLayer, ...options };
}

/**
 * Fresh MapLibre GL 5 style, without camera state. Optional decoded world
 * features add the common world/country base. deferDetail omits all remote
 * sources, glyph URLs and detail layers until the first campus is selected.
 */
export function createGlobeStyle(dark = false, worldFeatures = null, { deferDetail = false, borders = null } = {}) {
  const p = dark ? palettes.dark : palettes.light;
  const minorRoad = ['all', ...surfaceLine.slice(1), classes('minor', 'service')];
  const majorRoad = ['all', ...surfaceLine.slice(1), classes('motorway', 'trunk', 'primary', 'secondary', 'tertiary')];
  const labelPaint = (secondary = false) => ({
    'text-color': secondary ? p.textSecondary : p.text,
    'text-halo-color': p.halo,
    'text-halo-width': 1.1,
    'text-halo-blur': 0.5,
  });

  const style = {
    version: 8,
    name: `42 Horizon · ${dark ? 'Night' : 'Day'}`,
    metadata: {
      'h42:theme': dark ? 'dark' : 'light',
      'h42:palette': { teal: TEAL, pink: PINK, white: '#FFFFFF', ink: '#1B1B1B' },
      'h42:source': 'OpenFreeMap / OpenMapTiles / OpenStreetMap',
    },
    projection: { type: 'globe' },
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    transition: { duration: 450, delay: 0 },
    light: { anchor: 'viewport', color: p.light, intensity: p.lightIntensity, position: [1.2, 210, 45] },
    sources: {
      [SOURCE]: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
        attribution: '<a href="https://openfreemap.org/">OpenFreeMap</a> · <a href="https://www.openmaptiles.org/">© OpenMapTiles</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',
      },
    },
    layers: [
      // Water polygons cut the oceans out of this land-coloured globe surface.
      // No sky is specified: the canvas outside the sphere remains transparent.
      { id: 'h42-land', type: 'background', paint: {
        'background-color': zoom(0, p.landWorld, 5, p.landWorld, 9, p.landCountry, 13, p.landLocal),
      } },
      layer('h42-landcover', 'fill', 'landcover', {
        minzoom: 5,
        filter: classes('wood', 'grass', 'wetland'),
        paint: { 'fill-color': p.green, 'fill-opacity': zoom(5, 0, 9, 0.24, 14, 0.5) },
      }),
      layer('h42-urban', 'fill', 'landuse', {
        minzoom: 6,
        filter: classes('residential', 'commercial', 'retail', 'industrial', 'suburb', 'quarter', 'neighbourhood'),
        paint: { 'fill-color': p.urban, 'fill-opacity': zoom(6, 0, 11, 0.2, 15, 0.4) },
      }),
      layer('h42-park', 'fill', 'park', {
        minzoom: 8,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': p.green, 'fill-opacity': zoom(8, 0, 12, 0.28, 16, 0.55) },
      }),
      layer('h42-education', 'fill', 'landuse', {
        minzoom: 12,
        filter: classes('university', 'college', 'school', 'library'),
        paint: { 'fill-color': p.campus, 'fill-opacity': zoom(12, 0, 15, dark ? 0.1 : 0.055, 17, dark ? 0.14 : 0.085) },
      }),
      layer('h42-water', 'fill', 'water', {
        filter: ['!=', ['get', 'brunnel'], 'tunnel'],
        paint: { 'fill-color': zoom(0, p.waterWorld, 8, p.waterWorld, 13, p.waterLocal) },
      }),
      layer('h42-waterway', 'line', 'waterway', {
        minzoom: 8,
        filter: ['!=', ['get', 'brunnel'], 'tunnel'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': p.waterLine,
          'line-opacity': zoom(8, 0, 11, 0.65, 16, 0.9),
          'line-width': zoom(8, 0.3, 13, 1.4, 18, 5),
        },
      }),
      layer('h42-region-border', 'line', 'boundary', {
        minzoom: 5, maxzoom: 13,
        filter: ['all', ['==', ['get', 'admin_level'], 4], ['!=', ['get', 'maritime'], 1]],
        paint: {
          'line-color': p.region,
          'line-width': 0.6,
          'line-opacity': zoom(5, 0, 7, 0.28, 10, 0.25, 13, 0),
          'line-dasharray': [2, 3],
        },
      }),
      layer('h42-country-border', 'line', 'boundary', {
        maxzoom: 14,
        filter: ['all', ['==', ['get', 'admin_level'], 2], ['!=', ['get', 'maritime'], 1], ['!=', ['get', 'disputed'], 1]],
        layout: { 'line-join': 'round' },
        paint: {
          'line-color': p.border,
          'line-width': zoom(0, 0.4, 5, 0.75, 10, 1.1),
          'line-opacity': zoom(0, 0.72, 7, 0.75, 11, 0.25, 14, 0),
        },
      }),
      layer('h42-disputed-border', 'line', 'boundary', {
        maxzoom: 14,
        filter: ['all', ['==', ['get', 'admin_level'], 2], ['!=', ['get', 'maritime'], 1], ['==', ['get', 'disputed'], 1]],
        paint: {
          'line-color': p.border,
          'line-width': zoom(0, 0.4, 5, 0.75, 10, 1.1),
          'line-opacity': zoom(0, 0.6, 7, 0.6, 11, 0.2, 14, 0),
          'line-dasharray': [2, 3],
        },
      }),
      layer('h42-road-edge', 'line', 'transportation', {
        minzoom: 12,
        filter: majorRoad,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': p.roadEdge,
          'line-opacity': zoom(12, 0, 15, 0.45, 18, 0.65),
          'line-width': zoom(12, 1.5, 15, 5, 18, 19),
        },
      }),
      layer('h42-road-minor', 'line', 'transportation', {
        minzoom: 12,
        filter: minorRoad,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': p.road,
          'line-opacity': zoom(12, 0, 14, 0.58, 17, 0.94),
          'line-width': zoom(12, 0.4, 14, 1.2, 17, 5, 20, 22),
        },
      }),
      layer('h42-road-major', 'line', 'transportation', {
        minzoom: 9,
        filter: majorRoad,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': p.major,
          'line-opacity': zoom(9, 0, 12, 0.42, 15, 0.88, 17, 1),
          'line-width': zoom(9, 0.25, 12, 0.65, 15, 3.5, 18, 16),
        },
      }),
      layer('h42-path', 'line', 'transportation', {
        minzoom: 14,
        filter: ['all', ...surfaceLine.slice(1), classes('path', 'track')],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': p.path,
          'line-opacity': zoom(14, 0, 16, 0.45, 18, 0.65),
          'line-width': zoom(14, 0.5, 17, 1.2, 20, 3.5),
          'line-dasharray': [2, 2],
        },
      }),
      layer('h42-rail', 'line', 'transportation', {
        minzoom: 13,
        filter: ['all', ...surfaceLine.slice(1), classes('rail')],
        paint: {
          'line-color': p.rail,
          'line-opacity': zoom(13, 0, 16, 0.42),
          'line-width': zoom(13, 0.5, 18, 2),
          'line-dasharray': [3, 2],
        },
      }),
      layer('h42-building', 'fill', 'building', {
        minzoom: 13,
        paint: { 'fill-color': p.building, 'fill-opacity': zoom(13, 0, 15, 0.32, 17, 0.52) },
      }),
      layer('h42-building-edge', 'line', 'building', {
        minzoom: 15,
        paint: {
          'line-color': p.buildingEdge,
          'line-width': zoom(15, 0.3, 18, 0.75),
          'line-opacity': zoom(15, 0, 17, 0.58),
        },
      }),
      layer('h42-building-relief', 'fill-extrusion', 'building', {
        minzoom: 16,
        filter: ['all', ['!=', ['get', 'hide_3d'], true], ['>', ['coalesce', ['get', 'render_height'], 0], 0]],
        paint: {
          'fill-extrusion-color': p.extrusion,
          // Opaque relief uses one geometry pass once the approach completes.
          'fill-extrusion-opacity': zoom(16, 0, 17.4, 1),
          'fill-extrusion-height': zoom(16, 0, 17.4, ['coalesce', ['get', 'render_height'], 0]),
          'fill-extrusion-base': zoom(16, 0, 17.4, ['coalesce', ['get', 'render_min_height'], 0]),
          'fill-extrusion-vertical-gradient': true,
        },
      }),
      layer('h42-country-label', 'symbol', 'place', {
        minzoom: 2.5, maxzoom: 8,
        filter: ['==', ['get', 'class'], 'country'],
        layout: {
          'text-field': nativeName, 'text-font': ['Noto Sans Regular'],
          'text-size': zoom(2.5, 10, 6, 13), 'text-letter-spacing': 0.08,
          'text-max-width': 7, 'text-padding': 12,
        },
        paint: { ...labelPaint(), 'text-opacity': zoom(2.5, 0, 3.5, 0.65, 6.5, 0.65, 8, 0) },
      }),
      layer('h42-city-label', 'symbol', 'place', {
        minzoom: 5, maxzoom: 15,
        filter: classes('city', 'town', 'village'),
        layout: {
          'text-field': nativeName, 'text-font': ['Noto Sans Regular'],
          'text-size': zoom(5, 10, 10, 12, 14, 14), 'text-padding': 18,
          'symbol-sort-key': ['coalesce', ['get', 'rank'], 20],
          'text-max-width': 9,
        },
        paint: { ...labelPaint(), 'text-opacity': zoom(5, 0, 7, 0.72, 12.5, 0.8, 15, 0) },
      }),
      layer('h42-neighbourhood-label', 'symbol', 'place', {
        minzoom: 12.5, maxzoom: 18,
        filter: classes('suburb', 'quarter', 'neighbourhood'),
        layout: {
          'text-field': nativeName, 'text-font': ['Noto Sans Regular'],
          'text-size': 10, 'text-letter-spacing': 0.08,
          'text-padding': 20, 'text-max-width': 10,
        },
        paint: { ...labelPaint(true), 'text-opacity': zoom(12.5, 0, 14.5, 0.75, 17, 0.65, 18, 0) },
      }),
      layer('h42-road-label', 'symbol', 'transportation_name', {
        minzoom: 14,
        filter: classes('minor', 'service', 'primary', 'secondary', 'tertiary', 'trunk', 'motorway'),
        layout: {
          'symbol-placement': 'line', 'symbol-spacing': 280,
          'text-field': nativeName, 'text-font': ['Noto Sans Regular'],
          'text-size': zoom(14, 9, 17, 11),
          'text-max-angle': 25, 'text-padding': 5,
          'text-rotation-alignment': 'map', 'text-pitch-alignment': 'viewport',
        },
        paint: { ...labelPaint(true), 'text-opacity': zoom(14, 0, 16, 0.74, 18, 0.86) },
      }),
    ],
  };

  // Explicit defaults also let theme changes restore the complete base opacity
  // before the per-map detail multiplier is applied (water/background included).
  for (const detail of style.layers) {
    for (const property of opacityProperties[detail.type] ?? []) {
      detail.paint[property] ??= 1;
    }
  }

  if (worldFeatures !== null) {
    const data = Array.isArray(worldFeatures)
      ? { type: 'FeatureCollection', features: worldFeatures }
      : worldFeatures;
    style.sources[WORLD_SOURCE] = {
      type: 'geojson', data, maxzoom: 10, tolerance: 0.2,
      attribution: '<a href="https://www.naturalearthdata.com/">Natural Earth</a>',
    };
    // Optional TopoJSON mesh supplied by the loader: every shared boundary is
    // drawn once. Without it, retain compatibility with country-only GeoJSON.
    if (borders) style.sources[BORDER_SOURCE] = {
      type: 'geojson', data: { type: 'Feature', properties: {}, geometry: borders },
      maxzoom: 10, tolerance: 0.2,
    };
    // Keep the original ring ordering intact: D3 also uses these features for
    // spherical hit testing. MapLibre's polygon classifier accepts either outer
    // ring orientation, with oppositely wound holes. No coastline is invented.
    const localLayers = [
      { id: 'h42-world-water', type: 'background', paint: {
        'background-color': zoom(0, p.waterWorld, 8, p.waterWorld, 13, p.waterLocal),
      } },
      { id: 'h42-world-land', type: 'fill', source: WORLD_SOURCE, paint: {
        'fill-color': zoom(0, p.landWorld, 5, p.landWorld, 9, p.landCountry, 13, p.landLocal),
      } },
      { id: 'h42-world-border', type: 'line', source: borders ? BORDER_SOURCE : WORLD_SOURCE,
        layout: { 'line-join': 'round' },
        paint: {
          'line-color': p.border,
          'line-width': zoom(0, 0.4, 5, 0.75, 10, 1.1),
          'line-opacity': zoom(0, 0.72, 7, 0.75, 11, 0.25, 14, 0),
        },
      },
    ];
    for (const detail of style.layers) detail.layout = { ...detail.layout, visibility: 'none' };
    // GL 5.24 draws background layers at their normal style/depth position.
    // The opaque h42-land background, when enabled above these local layers,
    // therefore covers the coarse land/coastlines before OMT water is drawn.
    if (deferDetail) {
      delete style.sources[SOURCE];
      delete style.glyphs;
      style.layers = localLayers;
    } else style.layers = [...localLayers, ...style.layers];
  }

  return style;
}

// Derived from the unchanged detail-only style, never from an application's
// additional campus layers. Avoid serializing map.getStyle() on scope changes.
const detailLayerDefinitions = createGlobeStyle().layers;
export const GLOBE_DETAIL_LAYER_IDS = Object.freeze(detailLayerDefinitions.map(({ id }) => id));
const detailLayerIds = new Set(GLOBE_DETAIL_LAYER_IDS);

/** Install campus detail once, hidden and transparent; retain the local map. */
export function ensureGlobeDetail(map, dark = false) {
  if (map.getLayer('h42-land')) return true;
  if (!map.getLayer('h42-world-land')) return false;
  const detail = createGlobeStyle(dark);
  map.setGlyphs(detail.glyphs);
  if (!map.getSource(SOURCE)) map.addSource(SOURCE, detail.sources[SOURCE]);
  for (const layer of detail.layers) {
    layer.layout = { ...layer.layout, visibility: 'none' };
    map.addLayer(layer);
  }
  // Capture the unmodified theme bases before hiding their paint. Subsequent
  // prepare() can enable layout without a frame of opaque, incomplete detail.
  return setGlobeDetailOpacity(map, 0);
}

// A zoom expression must stay at the top-level step/interpolate, never become
// ['*', ['interpolate', ..., ['zoom'], ...], amount], which GL rejects.
function scaledOpacity(value, amount) {
  if (amount === 0) return 0;
  if (amount === 1) return value;
  if (typeof value === 'number') return value * amount;
  if (Array.isArray(value) && value[0] === 'interpolate' && value[2]?.[0] === 'zoom') {
    return value.map((part, index) => index >= 4 && index % 2 === 0 ? scaledOpacity(part, amount) : part);
  }
  if (Array.isArray(value) && value[0] === 'step' && value[1]?.[0] === 'zoom') {
    return value.map((part, index) => index >= 2 && index % 2 === 0 ? scaledOpacity(part, amount) : part);
  }
  return ['*', value, amount];
}

// Keep ['zoom'] in the one top-level interpolation required by the style
// specification. The existing numeric, piecewise-linear base is sampled with
// the smooth fade at 32 intervals, plus every original stop. MapLibre evaluates
// the result itself: camera frames do not rewrite dozens of paint properties.
function zoomFadedOpacity(value, {from,to}) {
  const stops = typeof value === 'number' ? [] : value.slice(3).filter((_,index)=>index%2===0);
  const baseAt = z => {
    if(typeof value === 'number')return value;
    if(value[0]!=='interpolate'||value[1]?.[0]!=='linear'||value[2]?.[0]!=='zoom')throw new Error('Unsupported detail opacity expression.');
    if(z<=value[3])return value[4];
    for(let i=5;i<value.length;i+=2)if(z<=value[i]){
      const t=(z-value[i-2])/(value[i]-value[i-2]);return value[i-1]+(value[i+1]-value[i-1])*t;
    }
    return value.at(-1);
  };
  const samples=[...new Set([...stops,...Array.from({length:33},(_,i)=>from+(to-from)*i/32)])].sort((a,b)=>a-b);
  return zoom(...samples.flatMap(z=>{
    const t=Math.max(0,Math.min(1,(z-from)/(to-from)));
    return [z,baseAt(z)*t*t*(3-2*t)];
  }));
}
const detailPaintOpacity = (value,state) => scaledOpacity(state.zoomRange ? zoomFadedOpacity(value,state.zoomRange) : value,state.opacity);
export function getGlobeDetailOpacity(map) {
  const state=detailOpacityStates.get(map);if(!state)return 0;
  if(!state.zoomRange)return state.opacity;
  const {from,to}=state.zoomRange,t=Math.max(0,Math.min(1,(map.getZoom()-from)/(to-from)));
  return state.opacity*t*t*(3-2*t);
}

/**
 * Modulate detail paint only; layout visibility and local-world layers stay
 * untouched. Set 0 with duration 0 before enabling detail layout for loading,
 * then 1 with duration 500 to reveal the loaded detail. Visible zero-opacity
 * layers still activate their source in MapLibre 5.24 (isHidden uses layout).
 * Base paint is captured once and refreshed by applyGlobeTheme, never multiplied
 * cumulatively. The current target multiplier survives a theme change.
 */
export function setGlobeDetailOpacity(map, amount, { duration = 0, zoomRange = null } = {}) {
  if (!map.getLayer('h42-land')) return false;
  if(zoomRange&&(!Number.isFinite(zoomRange.from)||!Number.isFinite(zoomRange.to)||zoomRange.to<=zoomRange.from))throw new RangeError('Invalid detail zoom range.');
  const opacity = Number.isFinite(amount) ? Math.max(0, Math.min(1, amount)) : 0;
  const milliseconds = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  let state = detailOpacityStates.get(map);
  if (!state) {
    state = { opacity: 1, basePaint: new Map() };
    for (const { id, type } of detailLayerDefinitions) {
      if (!map.getLayer(id)) continue;
      state.basePaint.set(id, Object.fromEntries((opacityProperties[type] ?? []).map(property =>
        [property, map.getPaintProperty(id, property) ?? 1])));
    }
    detailOpacityStates.set(map, state);
  }
  state.opacity = opacity;
  state.zoomRange = zoomRange ? {...zoomRange} : null;
  for (const [id, paint] of state.basePaint) {
    if (!map.getLayer(id)) continue;
    for (const [property, value] of Object.entries(paint)) {
      map.setPaintProperty(id, `${property}-transition`, { duration: milliseconds, delay: 0 });
      map.setPaintProperty(id, property, detailPaintOpacity(value, state));
    }
  }
  return true;
}

/** Toggle remote detail without replacing the style, sources, or camera. */
export function setGlobeDetailVisible(map, visible) {
  if (!map.getLayer('h42-land')) return false;
  const visibility = visible ? 'visible' : 'none';
  for (const id of GLOBE_DETAIL_LAYER_IDS) {
    if (map.getLayer(id) && map.getLayoutProperty(id, 'visibility') !== visibility) {
      map.setLayoutProperty(id, 'visibility', visibility);
    }
  }
  return true;
}

/**
 * Apply after style.load. Only touches this module's paint properties and light;
 * preserves the camera, selected feature state, campus layers, and source cache.
 * Returns false if the Horizon layers have not loaded yet.
 */
export function applyGlobeTheme(map, dark = false) {
  if (!map.getLayer('h42-land') && !map.getLayer('h42-world-land')) return false;
  // An empty local collection creates only the paint definitions we need;
  // sources and layout/visibility on the live map are never replaced here.
  const next = createGlobeStyle(dark, []);
  const state = detailOpacityStates.get(map);
  for (const { id, type, paint } of next.layers) {
    if (!map.getLayer(id)) continue;
    for (const [property, value] of Object.entries(paint ?? {})) {
      if (state && detailLayerIds.has(id) && opacityProperties[type]?.includes(property)) {
        if (!state.basePaint.has(id)) state.basePaint.set(id, {});
        state.basePaint.get(id)[property] = value;
        map.setPaintProperty(id, property, detailPaintOpacity(value, state));
      } else {
        map.setPaintProperty(id, property, value);
      }
    }
  }
  map.setLight(next.light);
  return true;
}
