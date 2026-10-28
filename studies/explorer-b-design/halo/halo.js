// Halo et lumière — design study for the Explorer of version B (studies/explorer-b-design/halo).
// Read-only use of site/ (version A) and site-b/ (version B being built). Nothing here is the site:
// the frame is redrawn statically, the selector and the campus sheet are the proposal.

const ROOT = new URL('../../../', import.meta.url);
const SITE = new URL('site/', ROOT);
const SITE_B = new URL('site-b/', ROOT);
const FLAG_CDN = 'https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/flags/4x3/';
const doc = document, $ = id => doc.getElementById(id);
const SVGNS = 'http://www.w3.org/2000/svg';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const motionOK = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;
let uid = 0;

/* ---- Continents: site-b/continents.mjs when it loads, else the same table ------------------------------ */
const FALLBACK_CONTINENTS = [
  {id: 'africa', names: {fr: 'Afrique', en: 'Africa', ar: 'أفريقيا'}, countries: ['AGO', 'MAR', 'MDG']},
  {id: 'americas', names: {fr: 'Amériques', en: 'Americas', ar: 'الأمريكتان'}, countries: ['BRA', 'CAN']},
  {id: 'asia', names: {fr: 'Asie', en: 'Asia', ar: 'آسيا'}, countries: ['ARE', 'ARM', 'JOR', 'JPN', 'KOR', 'LBN', 'MYS', 'PSE', 'SGP', 'THA', 'TUR']},
  {id: 'europe', names: {fr: 'Europe', en: 'Europe', ar: 'أوروبا'}, countries: ['ALB', 'AUT', 'BEL', 'CHE', 'CZE', 'DEU', 'ESP', 'FRA', 'GBR', 'ITA', 'LUX', 'NLD', 'POL', 'PRT']},
];
const FALLBACK_WORLD = {fr: 'Monde', en: 'World', ar: 'العالم'};

/* ---- Copy ------------------------------------------------------------------------------------------------ */
const FRAME = {
  fr: {nav: 'Navigation principale', explore: 'Explorer', projects: 'Projets', people: 'Profils', journal: 'Chroniques', awards: '42 Awards', capsule: 'Chercher dans Horizon', search: 'Rechercher dans Horizon', dice: 'Visiter un campus', prototype: 'Exploration · 42 Horizon', account: 'Menu du compte', back: 'Revenir au niveau précédent', reset: 'Revenir au monde', path: 'Chemin géographique', choose: 'Choisir un pays ou un campus'},
  en: {nav: 'Main navigation', explore: 'Explore', projects: 'Projects', people: 'Profiles', journal: 'Chronicles', awards: '42 Awards', capsule: 'Search Horizon', search: 'Search Horizon', dice: 'Visit a campus', prototype: 'Exploration · 42 Horizon', account: 'Account menu', back: 'Back to the previous level', reset: 'Back to the world', path: 'Location path', choose: 'Choose a country or campus'},
  ar: {nav: 'التنقل الرئيسي', explore: 'استكشف', projects: 'المشاريع', people: 'الأعضاء', journal: 'حكايات', awards: 'جوائز 42', capsule: 'ابحث في أفق', search: 'البحث في أفق', dice: 'زيارة فرع', prototype: 'تصوّر أولي · 42 Horizon', account: 'قائمة الحساب', back: 'العودة إلى المستوى السابق', reset: 'العودة إلى العالم', path: 'مسار الموقع', choose: 'اختر دولة أو فرعًا'},
};
const COPY = {
  fr: {
    title: 'Explorer', prompt: {continents: 'Où veux-tu aller ?', countries: 'Choisir un pays', campuses: 'Choisir un campus'},
    step: i => `Étape ${i} sur 3`, go: 'Valider', prev: 'Précédent', next: 'Suivant', of: (i, n) => `${i} sur ${n}`, roledesc: 'carrousel',
    keys: ['Flèches', 'pour choisir', 'Entrée', 'pour valider', 'Échap', 'pour revenir'], touch: 'Glisse pour choisir · Touche le centre pour valider',
    address: 'Adresse', copy: 'Copier l’adresse', copied: 'Adresse copiée.', directions: 'Itinéraire', directionsLabel: 'Itinéraire dans Google Maps',
    contacts: 'Contacts', website: 'Site officiel du campus', profile: 'Fiche officielle · 42 Network', newTab: 'S’ouvre dans un nouvel onglet',
    photos: 'Photos', enlarge: 'Agrandir la photo', prevPhoto: 'Photo précédente', nextPhoto: 'Photo suivante',
    opening: 'Ouverture', students: 'Étudiants', cohorts: 'promotions', alumni: 'alumni', asOf: y => `en ${y}`,
    piscines: 'Prochaines Piscines', upcoming: 'Prochaine', checkDates: 'Les dates des Piscines sont publiées sur le site officiel du campus.', officialDates: 'Consulter les dates officielles',
    source: 'Source', verified: 'Dernière vérification : ', missingIntro: 'Pas encore renseignés ici : ',
    missing: {photos: 'photos', contacts: 'contacts', opening: 'date d’ouverture', figures: 'chiffres', cohorts: 'promotions', alumni: 'alumni'},
    and: ' et ', locator: name => `Où se trouve ${name}`, siblings: c => `Tous les campus · ${c}`, backTo: c => `Revenir aux campus · ${c}`,
    campusEyebrow: c => `Campus · ${c}`,
  },
  en: {
    title: 'Explore', prompt: {continents: 'Where would you like to go?', countries: 'Choose a country', campuses: 'Choose a campus'},
    step: i => `Step ${i} of 3`, go: 'Select', prev: 'Previous', next: 'Next', of: (i, n) => `${i} of ${n}`, roledesc: 'carousel',
    keys: ['Arrows', 'to choose', 'Enter', 'to select', 'Esc', 'to go back'], touch: 'Swipe to choose · Tap the centre to select',
    address: 'Address', copy: 'Copy address', copied: 'Address copied.', directions: 'Directions', directionsLabel: 'Directions in Google Maps',
    contacts: 'Contacts', website: 'Official campus website', profile: 'Official profile · 42 Network', newTab: 'Opens in a new tab',
    photos: 'Photos', enlarge: 'Enlarge photo', prevPhoto: 'Previous photo', nextPhoto: 'Next photo',
    opening: 'Opened', students: 'Students', cohorts: 'cohorts', alumni: 'alumni', asOf: y => `in ${y}`,
    piscines: 'Upcoming Piscines', upcoming: 'Next', checkDates: 'Piscine dates are published on the official campus website.', officialDates: 'Check official dates',
    source: 'Source', verified: 'Last checked: ', missingIntro: 'Not provided here yet: ',
    missing: {photos: 'photos', contacts: 'contacts', opening: 'opening date', figures: 'figures', cohorts: 'cohorts', alumni: 'alumni'},
    and: ' and ', locator: name => `Where ${name} is`, siblings: c => `All campuses · ${c}`, backTo: c => `Back to campuses · ${c}`,
    campusEyebrow: c => `Campus · ${c}`,
  },
  ar: {
    title: 'استكشف', prompt: {continents: 'إلى أين تريد الذهاب؟', countries: 'اختر دولة', campuses: 'اختر فرعًا'},
    step: i => `المرحلة ${i} من 3`, go: 'تأكيد', prev: 'السابق', next: 'التالي', of: (i, n) => `${i} من ${n}`, roledesc: 'عرض دوّار',
    keys: ['الأسهم', 'للاختيار', 'Enter', 'للتأكيد', 'Esc', 'للرجوع'], touch: 'اسحب للاختيار · المس العنصر في الوسط للتأكيد',
    address: 'العنوان', copy: 'نسخ العنوان', copied: 'تم نسخ العنوان.', directions: 'الاتجاهات', directionsLabel: 'الاتجاهات في خرائط Google',
    contacts: 'التواصل', website: 'الموقع الرسمي للفرع', profile: 'الصفحة الرسمية · 42 Network', newTab: 'يفتح في علامة تبويب جديدة',
    photos: 'الصور', enlarge: 'تكبير الصورة', prevPhoto: 'الصورة السابقة', nextPhoto: 'الصورة التالية',
    opening: 'الافتتاح', students: 'الطلاب', cohorts: 'الدفعات', alumni: 'الخريجون', asOf: y => `في ${y}`,
    piscines: 'فترات البيسين القادمة', upcoming: 'القادمة', checkDates: 'تُنشر مواعيد البيسين على الموقع الرسمي للفرع.', officialDates: 'الاطلاع على المواعيد الرسمية',
    source: 'المصدر', verified: 'آخر تحقق: ', missingIntro: 'لم تُضف هنا بعد: ',
    missing: {photos: 'الصور', contacts: 'جهات التواصل', opening: 'تاريخ الافتتاح', figures: 'الأرقام', cohorts: 'الدفعات', alumni: 'الخريجون'},
    and: ' و', locator: name => `موقع ${name}`, siblings: c => `جميع فروع ${c}`, backTo: c => `العودة إلى فروع ${c}`,
    campusEyebrow: c => `الفرع · ${c}`,
  },
};
const localeTag = lang => lang === 'ar' ? 'ar-u-nu-latn' : lang;
const num = (n, lang) => new Intl.NumberFormat(localeTag(lang)).format(n);

// Count labels: B's specification (explorer-model.mjs countLabel).
function countLabel({campuses, countries}, lang) {
  const parts = [];
  const f = n => num(n, lang);
  if (lang === 'fr') {
    parts.push(`${f(campuses)} campus`); if (countries !== undefined) parts.push(`${f(countries)} pays`);
  } else if (lang === 'en') {
    parts.push(campuses === 1 ? '1 campus' : `${f(campuses)} campuses`);
    if (countries !== undefined) parts.push(countries === 1 ? '1 country' : `${f(countries)} countries`);
  } else {
    const rules = new Intl.PluralRules('ar');
    const campus = {zero: n => `${n} فرع`, one: () => 'فرع واحد', two: () => 'فرعان', few: n => `${n} فروع`, many: n => `${n} فرعًا`, other: n => `${n} فرع`};
    const country = {zero: n => `${n} دولة`, one: () => 'دولة واحدة', two: () => 'دولتان', few: n => `${n} دول`, many: n => `${n} دولة`, other: n => `${n} دولة`};
    parts.push((campus[rules.select(campuses)] || campus.other)(f(campuses)));
    if (countries !== undefined) parts.push((country[rules.select(countries)] || country.other)(f(countries)));
  }
  return parts.join(' · ');
}

/* ---- Data -------------------------------------------------------------------------------------------------- */
const DATA = {};
async function json(url) { const r = await fetch(url); if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }
async function loadData() {
  const [campusData, profiles, websites, logos, continentsModule, shapes] = await Promise.all([
    json(new URL('campuses.json', SITE)),
    json(new URL('campus-profiles.json', SITE)).catch(() => ({campuses: {}})),
    json(new URL('campus-websites.json', SITE)).catch(() => ({campuses: {}})),
    json(new URL('campus-logos.json', SITE_B)).catch(() => ({campuses: {}})),
    import(new URL('continents.mjs', SITE_B).href).catch(() => null),
    loadShapes(),
  ]);
  DATA.countries = new Map(campusData.countries.map(c => [c.id, c]));
  DATA.campuses = campusData.campuses.map(c => ({...c, website: websites.campuses?.[c.id]?.url || null, websiteKind: websites.campuses?.[c.id]?.kind || null, profile: profiles.campuses?.[c.id] || null, logo: logos.campuses?.[c.id] || null}));
  DATA.campusById = new Map(DATA.campuses.map(c => [c.id, c]));
  DATA.continents = continentsModule?.CONTINENTS || FALLBACK_CONTINENTS;
  DATA.worldNames = continentsModule?.WORLD_NAMES || FALLBACK_WORLD;
  DATA.continentSource = continentsModule ? 'site-b/continents.mjs' : 'copie locale';
  DATA.shapes = shapes.shapes; DATA.shapeSource = shapes.source;
  DATA.logoSource = Object.keys(logos.campuses || {}).length ? 'site-b/campus-logos.json' : 'aucun logo';
}
async function loadShapes() {
  // site-b/explorer-shapes.mjs gives {viewBox, d} only. The study needs two more facts per shape, the campus
  // positions (pink dots) and the label anchor, so its own stand-in stays the default; ?shapes=b shows B's file.
  if (new URLSearchParams(location.search).get('shapes') === 'b') {
    try {
      const m = await import(new URL('explorer-shapes.mjs', SITE_B).href);
      if (m.SHAPES?.countries && m.SHAPES?.continents) return {shapes: m.SHAPES, source: 'site-b/explorer-shapes.mjs (sans points de campus)'};
    } catch { /* not available */ }
  }
  const m = await import('./shapes-standin.js');
  return {shapes: m.SHAPES, source: 'étude (shapes-standin.js)'};
}

/* ---- Flags: the 4x3 flag-icons files inlined as nested SVG so the fit can be chosen per flag ------------- */
const flagRequests = new Map();
let flagSource = '';
function loadFlag(iso2) {
  iso2 = iso2.toLowerCase();
  if (!flagRequests.has(iso2)) flagRequests.set(iso2, (async () => {
    for (const url of [new URL(`assets/flags/${iso2}.svg`, SITE_B).href, FLAG_CDN + iso2 + '.svg']) {
      try {
        const r = await fetch(url); if (!r.ok) continue;
        const svg = new DOMParser().parseFromString(await r.text(), 'image/svg+xml').documentElement;
        if (svg.nodeName !== 'svg') continue;
        // Defensive: the files are verified upstream, but never inline anything active.
        svg.querySelectorAll('script,foreignObject,animate,set,animateTransform').forEach(n => n.remove());
        for (const n of [svg, ...svg.querySelectorAll('*')]) for (const a of [...n.attributes]) if (/^on/i.test(a.name)) n.removeAttribute(a.name);
        flagSource = url.startsWith('http') && !url.includes('127.0.0.1') ? 'CDN flag-icons 7.5.0' : 'site-b/assets/flags';
        return svg;
      } catch { /* next */ }
    }
    return null;
  })());
  return flagRequests.get(iso2);
}
// Band flags keep their bands when stretched over the silhouette; emblems are covered without distortion.
const STRETCH = new Set(['fr', 'it', 'be', 'de', 'nl', 'at', 'lu', 'pl', 'cz', 'am', 'ae', 'th', 'co', 'ie', 'ru']);
function nestedFlag(source, iso2, box) {
  // A <g> scaled from the flag's 640×480 viewBox (a nested <svg> would be resized by the site's global svg rule).
  const prefix = `fl${++uid}-`;
  const g = doc.createElementNS(SVGNS, 'g');
  for (const a of [...source.attributes]) if (!/^(xmlns|id|viewBox|width|height|version|xml:space)/i.test(a.name)) g.setAttribute(a.name, a.value);
  for (const child of source.childNodes) g.append(doc.importNode(child, true));
  for (const n of g.querySelectorAll('*')) {
    if (n.id) n.id = prefix + n.id;
    for (const a of [...n.attributes]) {
      if (a.value.includes('url(#')) a.value = a.value.replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`);
      if (/href$/i.test(a.name) && a.value.startsWith('#')) a.value = '#' + prefix + a.value.slice(1);
    }
  }
  const [vx = 0, vy = 0, vw = 640, vh = 480] = (source.getAttribute('viewBox') || '0 0 640 480').split(/[ ,]+/).map(Number);
  const stretch = STRETCH.has(iso2.toLowerCase());
  let {x, y, w, h} = box, sx = w / vw, sy = h / vh;
  if (!stretch) { const k = Math.max(sx, sy); x += (w - vw * k) / 2; y += (h - vh * k) / 2; sx = sy = k; }
  g.setAttribute('transform', `translate(${x} ${y}) scale(${sx} ${sy}) translate(${-vx} ${-vy})`);
  g.setAttribute('class', 'hx-flag');
  return g;
}

/* ---- Logos: official files, unmodified; their white margins are trimmed at display time ----------------- */
const inkBoxes = new Map();
function logoURL(campus) { return campus.logo?.src ? new URL(campus.logo.src, SITE_B).href : null; }
function inkBox(url) {
  if (!inkBoxes.has(url)) inkBoxes.set(url, new Promise(resolve => {
    const img = new Image(); img.decoding = 'async';
    img.onload = () => {
      try {
        const w = Math.max(1, Math.round(img.naturalWidth || 400)), h = Math.max(1, Math.round(img.naturalHeight || 150));
        const scale = Math.min(1, 480 / w), cw = Math.round(w * scale), ch = Math.round(h * scale);
        const c = doc.createElement('canvas'); c.width = cw; c.height = ch;
        const g = c.getContext('2d', {willReadFrequently: true}); g.drawImage(img, 0, 0, cw, ch);
        const px = g.getImageData(0, 0, cw, ch).data;
        let x0 = cw, y0 = ch, x1 = -1, y1 = -1;
        const edge = 2; // resampled files can carry a faint line on their outer pixels
        for (let y = edge; y < ch - edge; y++) for (let x = edge; x < cw - edge; x++) {
          const i = (y * cw + x) * 4, a = px[i + 3];
          if (a < 40) continue;
          const l = (px[i] * .2126 + px[i + 1] * .7152 + px[i + 2] * .0722) / 255;
          if (l > .72) continue; // white plate and its anti-aliasing
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
        if (x1 < 0) return resolve({w, h, t: 0, r: 0, b: 0, l: 0, ratio: w / h});
        const m = Math.round((y1 - y0) * .06);
        const box = {t: Math.max(0, y0 - m) / ch, b: Math.max(0, ch - 1 - y1 - m) / ch, l: Math.max(0, x0 - m) / cw, r: Math.max(0, cw - 1 - x1 - m) / cw};
        const iw = (1 - box.l - box.r) * w, ih = (1 - box.t - box.b) * h;
        // An alpha mask of the ink only: the white plate, faint frames and the resampling line on the
        // outer pixels drop out, anti-aliasing is kept. The file itself is never changed.
        const out = g.createImageData(cw, ch);
        for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
          const i = (y * cw + x) * 4; if (x < edge || y < edge || x >= cw - edge || y >= ch - edge) continue;
          const l = (px[i] * .2126 + px[i + 1] * .7152 + px[i + 2] * .0722) / 255;
          out.data[i + 3] = Math.round(clamp((.78 - l) / .5, 0, 1) * px[i + 3]);
        }
        g.putImageData(out, 0, 0);
        resolve({...box, w, h, ratio: iw / ih, mask: c.toDataURL('image/png')});
      } catch { resolve({w: img.naturalWidth, h: img.naturalHeight, t: 0, r: 0, b: 0, l: 0, ratio: (img.naturalWidth || 3) / (img.naturalHeight || 1)}); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  }));
  return inkBoxes.get(url);
}
// Fit the inked part into a halo of diameter d: at most 76 % wide and `tall` high.
// Monochrome logos are drawn in the theme's ink through a CSS mask made from their dark pixels (the official
// file stays untouched and its white plate disappears), so they rest directly on the page in both themes. A coloured logo (ink !== 'dark')
// keeps its colours on a small light plate.
function logoImage(campus, d, ink, {tall = .3} = {}) {
  const url = logoURL(campus); if (!url || !ink) return null;
  const maxW = d * .76, maxH = d * tall; let w = maxW, h = w / ink.ratio; if (h > maxH) { h = maxH; w = h * ink.ratio; }
  w = Math.round(w); h = Math.round(h);
  const meta = campus.logo || {};
  if (meta.ink && meta.ink !== 'dark') {
    const img = doc.createElement('img'); img.src = url; img.alt = ''; img.decoding = 'async'; img.width = w; img.height = h; img.className = 'hx-logo-plate';
    img.style.setProperty('object-view-box', `inset(${(ink.t * 100).toFixed(2)}% ${(ink.r * 100).toFixed(2)}% ${(ink.b * 100).toFixed(2)}% ${(ink.l * 100).toFixed(2)}%)`);
    return img;
  }
  const span = doc.createElement('span'); span.className = 'hx-logo'; span.setAttribute('aria-hidden', 'true');
  const iw = w / (1 - ink.l - ink.r), ih = h / (1 - ink.t - ink.b), x = -ink.l * iw, y = -ink.t * ih;
  Object.assign(span.style, {width: w + 'px', height: h + 'px'});
  span.style.setProperty('mask', `url("${ink.mask || url}") ${x}px ${y}px / ${iw}px ${ih}px no-repeat alpha`);
  return span;
}

/* ---- Model ------------------------------------------------------------------------------------------------- */
const S = {lang: 'fr', theme: 'light', view: null, cursor: new Map()};
const regionNames = {};
function countryName(id, lang = S.lang) {
  const c = DATA.countries.get(id); if (!c) return id;
  regionNames[lang] ||= new Intl.DisplayNames([lang], {type: 'region'});
  return regionNames[lang].of(c.iso2) || c.name;
}
const continentOf = iso3 => DATA.continents.find(c => c.countries.includes(iso3))?.id || null;
const continentLabel = (id, lang = S.lang) => DATA.continents.find(c => c.id === id)?.names[lang] || id;
const collator = () => new Intl.Collator(S.lang);
function items(view) {
  const lang = S.lang, sort = (a, b) => collator().compare(a.name, b.name);
  if (view.level === 'continents') {
    const all = DATA.campuses.length, countries = DATA.countries.size;
    const world = {kind: 'world', id: 'world', name: DATA.worldNames[lang], campuses: all, countries};
    const list = DATA.continents.map(c => {
      const campuses = DATA.campuses.filter(k => c.countries.includes(k.country)).length;
      return {kind: 'continent', id: c.id, name: c.names[lang] || c.names.fr, campuses, countries: c.countries.length};
    }).sort(sort);
    return [world, ...list].map(i => ({...i, countText: countLabel({campuses: i.campuses, countries: i.countries}, lang)}));
  }
  if (view.level === 'countries') {
    const ids = view.parent === 'world' ? [...DATA.countries.keys()] : DATA.continents.find(c => c.id === view.parent).countries;
    return ids.map(id => {
      const campuses = DATA.campuses.filter(k => k.country === id).length;
      return {kind: 'country', id, name: countryName(id), campuses, iso2: DATA.countries.get(id).iso2, countText: countLabel({campuses}, lang)};
    }).sort(sort);
  }
  if (view.level === 'campuses') {
    return DATA.campuses.filter(k => k.country === view.parent).map(k => ({kind: 'campus', id: k.id, name: k.name, campus: k, countText: countryName(k.country)})).sort(sort);
  }
  return [];
}
const viewKey = v => v.level === 'campus' ? 'campus:' + v.campus : v.level + ':' + (v.parent || '');
const PRESETS = {
  l1: {view: {level: 'continents', parent: null}, cursor: 'europe'},
  l2: {view: {level: 'countries', parent: 'europe'}, cursor: 'FRA'},
  l3: {view: {level: 'campuses', parent: 'FRA'}, cursor: 'paris'},
  paris: {view: {level: 'campus', campus: 'paris'}},
  lyon: {view: {level: 'campus', campus: 'lyon'}},
  mulhouse: {view: {level: 'campus', campus: 'mulhouse'}},
  monde: {view: {level: 'countries', parent: 'world'}, cursor: 'FRA'},
  l2am: {view: {level: 'countries', parent: 'americas'}, cursor: 'BRA'},
  l2af: {view: {level: 'countries', parent: 'africa'}, cursor: 'MAR'},
  l3mar: {view: {level: 'campuses', parent: 'MAR'}, cursor: '1337-khouribga'},
  l1w: {view: {level: 'continents', parent: null}, cursor: 'world'},
  l1a: {view: {level: 'continents', parent: null}, cursor: 'americas'},
  asie: {view: {level: 'countries', parent: 'asia'}, cursor: 'JPN'},
};

/* ---- Frame: header, scope bar, dock (static copy of the real frame) --------------------------------------- */
function applyFrame() {
  const f = FRAME[S.lang], root = doc.documentElement;
  root.lang = S.lang; root.dir = S.lang === 'ar' ? 'rtl' : 'ltr'; root.dataset.theme = S.theme; root.dataset.themePreference = S.theme;
  root.style.colorScheme = S.theme;
  $('main-nav').setAttribute('aria-label', f.nav);
  for (const key of ['explore', 'projects', 'people', 'journal', 'awards']) doc.querySelector(`[data-copy=${key}]`).textContent = f[key];
  doc.querySelector('[data-copy=capsule]').textContent = f.capsule;
  const toggle = doc.querySelector('.dock-search-toggle'); toggle.setAttribute('aria-label', f.search); toggle.title = f.search;
  const dice = $('random-campus'); dice.setAttribute('aria-label', f.dice); dice.title = f.dice;
  $('about').textContent = f.prototype;
  $('profile').setAttribute('aria-label', f.account); $('profile').title = f.account;
  $('scope-back').setAttribute('aria-label', f.back); $('reset').setAttribute('aria-label', f.reset); $('reset').title = f.reset;
  $('scope-path').setAttribute('aria-label', f.path);
  $('scope-world-name').textContent = DATA.worldNames[S.lang];
  $('hx-title').textContent = COPY[S.lang].title;
  placeIndicator();
}
function placeIndicator() {
  const nav = $('main-nav'), btn = nav.querySelector('[aria-current=page]'), ind = nav.querySelector('.nav-indicator');
  if (!btn) return;
  ind.style.width = btn.offsetWidth + 'px'; ind.style.height = btn.offsetHeight + 'px';
  ind.style.transform = `translate(${btn.offsetLeft}px, -50%)`;
}
function applyScope(view) {
  const f = FRAME[S.lang], bar = $('scope-bar'), lang = S.lang;
  let level = 'world', name = DATA.worldNames[lang], hint = countLabel({campuses: DATA.campuses.length, countries: DATA.countries.size}, lang), country = null, back = true;
  if (view.level === 'continents') back = false;
  else if (view.level === 'countries' && view.parent !== 'world') {
    level = 'continent'; name = continentLabel(view.parent);
    const c = DATA.continents.find(x => x.id === view.parent);
    hint = countLabel({campuses: DATA.campuses.filter(k => c.countries.includes(k.country)).length, countries: c.countries.length}, lang);
  } else if (view.level === 'campuses') {
    level = 'country'; name = countryName(view.parent); hint = countLabel({campuses: DATA.campuses.filter(k => k.country === view.parent).length}, lang);
  } else if (view.level === 'campus') {
    const k = DATA.campusById.get(view.campus); level = 'campus'; name = k.name; country = countryName(k.country);
  }
  bar.dataset.level = level;
  $('scope-back').disabled = !back;
  $('scope-name').textContent = name; $('scope-picker').setAttribute('aria-label', `${name} · ${f.choose}`); $('scope-picker').title = name;
  $('scope-country-item').hidden = !country; $('scope-country-name').textContent = country || '';
  const status = $('globe-status'); status.hidden = level === 'campus'; $('globe-hint').textContent = hint;
}

/* ---- Band: from the status line (or the scope bar) to the "Exploration" note, as in B --------------------- */
const stage = () => $('hx-stage');
function visible(el) { if (!el || el.hidden) return false; const s = getComputedStyle(el), r = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.height > 0; }
function measureBand() {
  const st = stage(), status = $('globe-status'), bar = $('scope-bar');
  const topEl = visible(status) ? status : bar;
  const below = [$('about'), doc.querySelector('.dock-search-toggle'), doc.querySelector('.dock-random-toggle')].find(visible);
  const nav = $('main-nav');
  let top = topEl.getBoundingClientRect().bottom + 16;
  let bottom = (below ? below.getBoundingClientRect().top : nav.getBoundingClientRect().top) - 12;
  let mode = 'normal';
  const isCampus = S.view?.level === 'campus';
  if (bottom - top < 250) mode = 'compact';
  // A campus sheet in a very short band may scroll beneath the floating search capsule, as content pages do.
  if (isCampus && bottom - top < 200) { bottom = nav.getBoundingClientRect().top - 8; mode = 'scroll'; }
  st.style.setProperty('--hx-top', top + 'px');
  st.style.setProperty('--hx-bottom', (innerHeight - bottom) + 'px');
  st.style.setProperty('--band-h', (bottom - top) + 'px');
  st.dataset.band = mode;
  st.toggleAttribute('data-short', bottom - top < (isCampus ? 480 : 420));
  const capsule = below && below !== $('about') ? below : doc.querySelector('.dock-search-toggle');
  if (mode === 'scroll' && capsule) st.style.setProperty('--hx-under', Math.max(24, bottom - capsule.getBoundingClientRect().top + 16) + 'px');
}

/* ---- Shapes ------------------------------------------------------------------------------------------------ */
function svg(tag, attrs = {}, parent) { const n = doc.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (parent) parent.append(n); return n; }
function sharedDefs() {
  if ($('hx-defs')) return;
  const s = svg('svg', {id: 'hx-defs', width: 0, height: 0, 'aria-hidden': 'true', style: 'position:absolute;width:0;height:0;overflow:hidden'});
  const d = svg('defs', {}, s);
  const lin = (id, stops, attrs = {}) => { const g = svg('linearGradient', {id, ...attrs}, d); for (const [o, c, a = 1] of stops) svg('stop', {offset: o, style: `stop-color:${c};stop-opacity:${a}`}, g); return g; };
  lin('hx-land', [['0', 'var(--hx-land-a)'], ['.55', 'var(--hx-land-b)'], ['1', 'var(--hx-land-c)']], {x1: '0', y1: '0', x2: '1', y2: '1'});
  lin('hx-land-soft', [['0', 'var(--hx-land-b)'], ['1', 'var(--hx-land-c)']], {x1: '0', y1: '0', x2: '1', y2: '1'});
  lin('hx-sheen', [['0', '#fff', .55], ['.45', '#fff', 0], ['1', '#000', .18]], {x1: '0', y1: '0', x2: '.6', y2: '1'});
  const sea = svg('radialGradient', {id: 'hx-sea', cx: '.38', cy: '.32', r: '.75'}, d);
  for (const [o, c] of [['0', 'var(--hx-sea-a)'], ['1', 'var(--hx-sea-b)']]) svg('stop', {offset: o, style: `stop-color:${c}`}, sea);
  lin('hx-horizon-line', [['0', 'var(--hx-teal)', 0], ['.3', 'var(--hx-teal)', .55], ['.5', 'var(--hx-pink)', .5], ['.7', 'var(--hx-teal)', .55], ['1', 'var(--hx-teal)', 0]], {x1: '0', y1: '0', x2: '1', y2: '0'});
  lin('hx-horizon-glow', [['0', 'var(--hx-teal)', 0], ['.35', 'var(--hx-teal)', .5], ['.5', 'var(--hx-pink)', .45], ['.65', 'var(--hx-teal)', .5], ['1', 'var(--hx-teal)', 0]], {x1: '0', y1: '0', x2: '1', y2: '0'});
  doc.body.prepend(s);
}
function shapeFor(item) {
  const sh = DATA.shapes;
  if (item.kind === 'world') return sh.world;
  if (item.kind === 'continent') return sh.continents[item.id];
  if (item.kind === 'country') return sh.countries[item.id];
  return null;
}
function pathRings(d) { // absolute M/L/Z paths, implicit line-tos allowed
  const rings = []; let ring = null;
  for (const [, cmd, args] of d.matchAll(/([MLZmlz])([^MLZmlz]*)/g)) {
    if (/z/i.test(cmd)) { if (ring?.length) rings.push(ring); ring = null; continue; }
    const n = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (/m/i.test(cmd)) { if (ring?.length) rings.push(ring); ring = []; }
    for (let i = 0; i + 1 < n.length; i += 2) ring?.push([n[i], n[i + 1]]);
  }
  if (ring?.length) rings.push(ring);
  return rings;
}
const ringArea = r => r.reduce((a, [x1, y1], i) => { const [x2, y2] = r[(i + 1) % r.length]; return a + x1 * y2 - x2 * y1; }, 0) / 2;
function inRing(x, y, r) { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
function edgeDistance(x, y, r) { let m = Infinity; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [ax, ay] = r[j], [bx, by] = r[i], dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1e-9; const t = clamp(((x - ax) * dx + (y - ay) * dy) / l, 0, 1); m = Math.min(m, Math.hypot(x - ax - t * dx, y - ay - t * dy)); } return m; }
const anchors = new WeakMap();
function labelAnchor(shape) {
  if (shape.label) return shape.label;
  if (anchors.has(shape)) return anchors.get(shape);
  const vb = parseViewBox(shape.viewBox), ring = pathRings(shape.d).sort((a, b) => Math.abs(ringArea(b)) - Math.abs(ringArea(a)))[0];
  let best = [vb.w / 2, vb.h / 2], bestD = -1;
  if (ring) {
    const xs = ring.map(p => p[0]), ys = ring.map(p => p[1]);
    const scan = (x0, y0, x1, y1, n) => { for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * j / n; if (!inRing(x, y, ring)) continue; const d = edgeDistance(x, y, ring); if (d > bestD) { bestD = d; best = [x, y]; } } };
    scan(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), 28);
    const w = (Math.max(...xs) - Math.min(...xs)) / 14, h = (Math.max(...ys) - Math.min(...ys)) / 14; scan(best[0] - w, best[1] - h, best[0] + w, best[1] + h, 14);
  }
  const out = [best[0] / vb.w * 100, best[1] / vb.h * 100]; anchors.set(shape, out); return out;
}
const parseViewBox = vb => { const [x, y, w, h] = String(vb).split(/[ ,]+/).map(Number); return {x, y, w, h}; };
function pathBox(d) { // bounding box of an absolute path (M/L/H/V/C/Q/Z, numbers only)
  const nums = d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number) || [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) { const x = nums[i], y = nums[i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return {x: x0, y: y0, w: x1 - x0, h: y1 - y0};
}
async function shapeSVG(item, {dots = true, lit = false} = {}) {
  const shape = shapeFor(item); if (!shape) return null;
  const vb = parseViewBox(shape.viewBox);
  const s = svg('svg', {viewBox: shape.viewBox, 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'xMidYMid meet'});
  const clipId = `hxc${++uid}`;
  if (item.kind === 'world' && shape.sphere) {
    const sp = shape.sphere || {cx: vb.w / 2, cy: vb.h / 2, r: Math.min(vb.w, vb.h) / 2 - 4};
    svg('circle', {cx: sp.cx, cy: sp.cy, r: sp.r, class: 'hx-sea'}, s);
    svg('path', {d: shape.d, class: 'hx-land'}, s);
    svg('circle', {cx: sp.cx, cy: sp.cy, r: sp.r, class: 'hx-sea-rim'}, s);
    const shine = svg('circle', {cx: sp.cx, cy: sp.cy, r: sp.r, fill: 'url(#hx-sheen)', opacity: '.5'}, s); shine.style.mixBlendMode = 'soft-light';
  } else if (item.kind === 'continent' || item.kind === 'world') {
    const g = svg('g', {}, s);
    if (shape.fade) { // the land dissolves into the light where a continent is cut by a meridian
      const defs = svg('defs', {}, s), id = `hxf${++uid}`, mask = svg('mask', {id, maskContentUnits: 'objectBoundingBox'}, defs);
      const grad = svg('linearGradient', {id: id + 'g', x1: shape.fade.x1, y1: shape.fade.y1, x2: shape.fade.x2, y2: shape.fade.y2}, defs);
      svg('stop', {offset: 0, style: 'stop-color:#fff'}, grad); svg('stop', {offset: 1, style: 'stop-color:#000'}, grad);
      svg('rect', {x: 0, y: 0, width: 1, height: 1, fill: `url(#${id}g)`}, mask); g.setAttribute('mask', `url(#${id})`);
    }
    svg('path', {d: shape.d, class: 'hx-land'}, g);
    svg('path', {d: shape.d, class: 'hx-sheen'}, g);
    svg('path', {d: shape.d, class: 'hx-edge'}, g);
  } else {
    const defs = svg('defs', {}, s), clip = svg('clipPath', {id: clipId}, defs); svg('path', {d: shape.d}, clip);
    const g = svg('g', {'clip-path': `url(#${clipId})`}, s);
    svg('path', {d: shape.d, class: 'hx-land'}, g); // shows while the flag loads, or if it cannot load
    const flag = await loadFlag(item.iso2);
    const box = pathBox(shape.d);
    if (flag) g.append(nestedFlag(flag, item.iso2, box));
    const sheen = svg('rect', {x: box.x, y: box.y, width: box.w, height: box.h, fill: 'url(#hx-sheen)'}, g); sheen.style.mixBlendMode = 'soft-light';
    svg('path', {d: shape.d, class: 'hx-flag-edge'}, s);
  }
  if (dots && shape.dots?.length) {
    const g = svg('g', {class: 'hx-dots'}, s), r = Math.max(vb.w, vb.h) / 300 * (item.kind === 'country' ? 4.2 : 3.4);
    for (const [x, y] of shape.dots) svg('circle', {cx: x, cy: y, r}, g);
  }
  return {svg: s, ratio: vb.w / vb.h, label: item.kind === 'world' && shape.sphere ? [50, 50] : labelAnchor(shape)};
}

/* ---- Carousel ------------------------------------------------------------------------------------------------ */
function levelPrompt(view) { return COPY[S.lang].prompt[view.level]; }
function stepIndex(view) { return {continents: 1, countries: 2, campuses: 3}[view.level]; }
function cursorIndex(view, list) {
  const id = S.cursor.get(viewKey(view)); const i = list.findIndex(x => x.id === id); return i < 0 ? 0 : i;
}
async function renderLevel(view) {
  const c = COPY[S.lang], list = items(view), level = doc.createElement('div');
  level.className = 'hx-level'; level.dataset.key = viewKey(view);
  const n = stepIndex(view), promptId = `hx-prompt-${++uid}`, hintId = `hx-hint-${uid}`;
  const head = doc.createElement('div'); head.className = 'hx-head';
  const steps = doc.createElement('div'); steps.className = 'hx-steps'; steps.setAttribute('aria-hidden', 'true');
  for (let i = 1; i <= 3; i++) {
    if (i > 1) { const l = doc.createElement('span'); l.className = 'hx-step-line'; steps.append(l); }
    const d = doc.createElement('span'); d.className = 'hx-step'; d.dataset.state = i < n ? 'done' : i === n ? 'current' : 'todo'; steps.append(d);
  }
  const prompt = doc.createElement('p'); prompt.className = 'hx-prompt'; prompt.id = promptId; prompt.textContent = levelPrompt(view);
  const stepText = doc.createElement('span'); stepText.className = 'sr-only'; stepText.textContent = ` · ${c.step(n)}`; prompt.append(stepText);
  head.append(steps, prompt);

  const car = doc.createElement('div'); car.className = 'hx-carousel'; car.setAttribute('role', 'group');
  car.setAttribute('aria-roledescription', c.roledesc); car.setAttribute('aria-labelledby', promptId); car.setAttribute('aria-describedby', hintId);
  const track = doc.createElement('div'); track.className = 'hx-track'; car.append(track);
  const horizon = svg('svg', {class: 'hx-horizon', 'aria-hidden': 'true'}); track.append(horizon);
  const pool = doc.createElement('div'); pool.className = 'hx-pool'; pool.setAttribute('aria-hidden', 'true'); track.append(pool);
  const nodes = [];
  for (const item of list) {
    const b = doc.createElement('button'); b.type = 'button'; b.className = 'hx-item'; b.dataset.kind = item.kind; b.dataset.id = item.id; b.dataset.off = 'out';
    const glow = doc.createElement('span'); glow.className = 'hx-glow'; glow.setAttribute('aria-hidden', 'true');
    const box = doc.createElement('span'); box.className = 'hx-box'; box.setAttribute('aria-hidden', 'true'); box.append(glow);
    const fig = doc.createElement('span'); fig.className = 'hx-figure'; box.append(fig);
    const name = doc.createElement('span'); name.className = 'hx-name'; name.dir = 'auto'; name.textContent = item.name; name.setAttribute('aria-hidden', 'true');
    b.append(box);
    if (item.kind === 'campus') {
      const lantern = doc.createElement('span'); lantern.className = 'hx-lantern'; fig.append(lantern); b.append(name);
      b._lantern = lantern;
    } else { fig.append(name); }
    if (item.kind !== 'campus') { const meta = doc.createElement('span'); meta.className = 'hx-meta'; meta.textContent = item.countText; meta.setAttribute('aria-hidden', 'true'); b.append(meta); }
    const go = doc.createElement('span'); go.className = 'hx-go'; go.setAttribute('aria-hidden', 'true');
    go.innerHTML = '<svg aria-hidden="true"><use href="#i-enter"/></svg>'; go.append(c.go); b.append(go);
    b._item = item; b._fig = fig; b._name = name; nodes.push(b); track.append(b);
  }
  const foot = doc.createElement('div'); foot.className = 'hx-foot';
  const pager = doc.createElement('div'); pager.className = 'hx-pager';
  const prev = doc.createElement('button'); prev.type = 'button'; prev.className = 'hx-nav'; prev.dataset.dir = 'prev'; prev.setAttribute('aria-label', c.prev); prev.innerHTML = '<svg aria-hidden="true"><use href="#i-prev"/></svg>';
  const next = doc.createElement('button'); next.type = 'button'; next.className = 'hx-nav'; next.dataset.dir = 'next'; next.setAttribute('aria-label', c.next); next.innerHTML = '<svg aria-hidden="true"><use href="#i-next"/></svg>';
  const dots = doc.createElement('span'); dots.className = 'hx-dotsbar'; dots.setAttribute('aria-hidden', 'true'); if (list.length > 16) dots.dataset.dense = '';
  for (let i = 0; i < list.length; i++) dots.append(doc.createElement('i'));
  const count = doc.createElement('span'); count.className = 'hx-count'; count.dir = 'ltr'; count.setAttribute('aria-hidden', 'true');
  pager.append(prev, dots, count, next);
  const hint = doc.createElement('p'); hint.className = 'hx-hint'; hint.id = hintId;
  const [k1, t1, k2, t2, k3, t3] = c.keys;
  hint.innerHTML = `<span data-keys><kbd></kbd> <span></span> · <kbd></kbd> <span></span> · <kbd></kbd> <span></span></span><span data-touch></span>`;
  const parts = hint.querySelectorAll('[data-keys] > *'); [k1, t1, k2, t2, k3, t3].forEach((v, i) => parts[i].textContent = v);
  hint.querySelector('[data-touch]').textContent = c.touch;
  foot.append(pager, hint);
  level.append(head, car, foot);
  level._view = view; level._list = list; level._nodes = nodes; level._car = car; level._track = track; level._pool = pool; level._horizon = horizon;
  level._dots = dots; level._count = count; level._prev = prev; level._next = next;
  // Silhouettes and logos (asynchronous: flags and ink boxes).
  await Promise.all(nodes.map(async node => {
    const item = node._item;
    if (item.kind === 'campus') {
      const url = logoURL(item.campus); node._ink = url ? await inkBox(url) : null;
    } else {
      const s = await shapeSVG(item); if (!s) return;
      node._fig.prepend(s.svg); node._ratio = s.ratio;
      node._name.style.setProperty('--lx', s.label[0] + '%'); node._name.style.setProperty('--ly', s.label[1] + '%');
    }
  }));
  wireLevel(level);
  return level;
}

const BLEED = 170; // the track reaches above and below the carousel so that halos are never cut
function geometry(level) {
  const car = level._car, W = car.clientWidth, H = car.clientHeight, band = stage().dataset.band;
  const phone = W < 700, campus = level._view.level === 'campuses';
  if (band === 'compact') {
    const bh = clamp(H - 16, 28, 60), bw = bh * 1.5;
    return {W, H, phone, compact: true, campus, bw, bh, top: (H - bh) / 2, slots: [{s: 1}, {s: .8}, {s: .8}], floor: () => 0, R: 0};
  }
  const below = campus ? 12 + 26 + 12 + 36 : 10 + 20 + 12 + 36; // name or count, then the Select chip
  const bh = clamp(H - below - 30, 84, campus ? 200 : 250);
  const bw = campus ? bh : clamp(Math.min(W * (phone ? .64 : .25), bh * 1.42), 110, 340);
  const s1 = phone ? .56 : .58, s2 = .42;
  const x1 = phone ? W / 2 + bw * s1 / 2 - 46 : Math.max(bw * .5 + bw * s1 * .5 + 60, Math.min(W * .23, 360));
  const x2 = phone ? x1 + 400 : x1 + bw * (s1 + s2) / 2 + 64;
  const top = Math.max(8, (H - bh - below) / 2 - 2);
  const floor0 = top + bh, d1 = bh * (phone ? .09 : .12);
  const R = (x1 * x1 + d1 * d1) / (2 * d1);
  const floor = x => floor0 + R - Math.sqrt(Math.max(0, R * R - x * x)); // the horizon: a circle through the cursor's feet
  return {W, H, phone, campus, bw, bh, top, below, R, floor0, floor, slots: [{s: 1, x: 0}, {s: s1, x: x1}, {s: s2, x: x2}]};
}
function layoutLevel(level, {instant = false} = {}) {
  const g = geometry(level), list = level._list, cur = cursorIndex(level._view, list), rtl = doc.documentElement.dir === 'rtl';
  level._geo = g; level.toggleAttribute('data-phone', g.phone);
  const sizeOf = (node, s) => {
    const bh = g.bh * s, bwBase = g.campus ? bh : g.bw * s;
    let fw, fh;
    if (g.campus) { fw = fh = bh; } else { const r = node._ratio || 1.2; if (bwBase / bh > r) { fh = bh; fw = bh * r; } else { fw = bwBase; fh = bwBase / r; } }
    return {bh, bwBase, fw, fh};
  };
  for (const [i, node] of level._nodes.entries()) {
    const o = i - cur, a = Math.abs(o), out = a > (g.compact ? 1 : 2), slot = g.slots[Math.min(a, 2)];
    const s = out ? g.slots[2].s * .8 : slot.s, {bh, bwBase, fw, fh} = sizeOf(node, s);
    node.dataset.off = out ? 'out' : String(o === 0 ? 0 : Math.sign(o) * a);
    node.style.setProperty('--h', bh + 'px'); node.style.setProperty('--fw', fw + 'px'); node.style.setProperty('--fh', fh + 'px');
    const itemW = Math.max(bwBase, a === 0 ? 220 : 120);
    node.style.setProperty('--w', g.compact ? 'auto' : itemW + 'px');
    const fs = g.compact ? (a === 0 ? 15 : 13) : a === 0 ? (g.campus ? clamp(g.bh * .11, 18, 22) : clamp(g.bh * .13, 22, 32)) : a === 1 ? 16 : 13;
    node.style.setProperty('--fs', fs + 'px');
    if (!g.compact) {
      const dist = out ? g.slots[2].x + (a - 2) * 150 : slot.x;
      const dx = dist * Math.sign(o) * (rtl ? -1 : 1);
      node.style.setProperty('--x', (g.W / 2 + dx - itemW / 2) + 'px');
      node.style.setProperty('--y', (BLEED + g.floor(dist) - bh) + 'px'); // feet on the horizon
    }
    if (g.campus && node._lantern) {
      node._lantern.style.setProperty('--d', bh + 'px');
      const img = node._lantern.querySelector('img,.hx-logo,.hx-logo-text'), want = String(Math.round(bh));
      if (!img || img.dataset.d !== want) {
        node._lantern.replaceChildren();
        const im = logoImage(node._item.campus, bh, node._ink) || el('span', 'hx-logo-text', node._item.name);
        im.dataset.d = want; node._lantern.append(im);
      }
    }
    node.tabIndex = o === 0 ? 0 : -1;
    const pos = COPY[S.lang].of(num(i + 1, S.lang), num(list.length, S.lang));
    const label = node._item.kind === 'campus' ? node._item.name : `${node._item.name} · ${node._item.countText}`;
    node.setAttribute('aria-label', o === 0 ? `${label} · ${pos} · ${COPY[S.lang].go}` : `${label} · ${pos}`);
    if (instant) node.style.transition = 'none';
  }
  if (g.compact) { // one row: the cursor in the middle, its neighbours right after it
    const curNode = level._nodes[cur], cw = curNode.offsetWidth, gap = 26, dir = rtl ? -1 : 1;
    curNode.style.setProperty('--x', (g.W / 2 - cw / 2) + 'px');
    for (const side of [-1, 1]) {
      let edge = g.W / 2 + side * dir * (cw / 2 + gap);
      for (let i = cur + side; i >= 0 && i < level._nodes.length; i += side) {
        const n = level._nodes[i], w = n.offsetWidth;
        n.style.setProperty('--x', (side * dir > 0 ? edge : edge - w) + 'px');
        edge += side * dir * (w + gap);
      }
    }
    for (const n of level._nodes) n.style.setProperty('--y', BLEED + (g.H - n.offsetHeight) / 2 + 'px');
  }
  if (instant) requestAnimationFrame(() => level._nodes.forEach(n => n.style.transition = ''));
  // The pool of light at the cursor's feet, and the horizon.
  const poolW = g.bw * (g.campus ? 1.35 : 1.25);
  Object.assign(level._pool.style, {left: (g.W / 2 - poolW / 2) + 'px', top: (BLEED + (g.floor0 || 0) - 15) + 'px', width: poolW + 'px', height: '30px', display: g.compact ? 'none' : ''});
  drawHorizon(level, g);
  const total = list.length;
  [...level._dots.children].forEach((d, i) => d.toggleAttribute('data-current', i === cur));
  level._count.textContent = `${num(cur + 1, S.lang)} / ${num(total, S.lang)}`;
  level._prev.setAttribute('aria-disabled', String(cur === 0));
  level._next.setAttribute('aria-disabled', String(cur === total - 1));
}
function drawHorizon(level, g) {
  const h = level._horizon; h.replaceChildren();
  if (g.compact) return;
  const W = g.W, half = W / 2 + 40, pts = [];
  for (let i = 0; i <= 64; i++) { const x = -half + 2 * half * i / 64; pts.push(`${(W / 2 + x).toFixed(1)} ${(BLEED + g.floor(x)).toFixed(1)}`); }
  const d = 'M' + pts.join('L');
  h.setAttribute('viewBox', `0 0 ${W} ${g.H + 2 * BLEED}`); h.setAttribute('preserveAspectRatio', 'none');
  svg('path', {d, class: 'hx-horizon-glow'}, h);
  svg('path', {d, class: 'hx-horizon-line'}, h);
}

/* ---- Interaction (enough to feel the design: arrows, Enter, Escape, clicks, swipe) --------------------------- */
function setCursor(level, index, {focus = true, announce = true} = {}) {
  const list = level._list; index = clamp(index, 0, list.length - 1);
  S.cursor.set(viewKey(level._view), list[index].id); layoutLevel(level);
  if (focus) level._nodes[index].focus({preventScroll: true});
  if (announce) live(`${list[index].name} · ${COPY[S.lang].of(num(index + 1, S.lang), num(list.length, S.lang))}`);
  writeURL();
}
function wireLevel(level) {
  level._prev.addEventListener('click', () => setCursor(level, cursorIndex(level._view, level._list) - 1, {focus: false}));
  level._next.addEventListener('click', () => setCursor(level, cursorIndex(level._view, level._list) + 1, {focus: false}));
  let downCursor = null, drag = null;
  for (const [i, node] of level._nodes.entries()) {
    node.addEventListener('pointerdown', () => { downCursor = cursorIndex(level._view, level._list); });
    node.addEventListener('click', e => {
      if (level._swallow) { level._swallow = false; return; }
      const cur = cursorIndex(level._view, level._list);
      if (e.detail === 0 || (i === cur && downCursor === cur)) validate(level._list[i]);
      else setCursor(level, i);
    });
  }
  level.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return;
    const onCard = e.target.closest?.('.hx-item'); const rtl = doc.documentElement.dir === 'rtl';
    const cur = cursorIndex(level._view, level._list);
    if (onCard && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); setCursor(level, cur + ((e.key === 'ArrowRight') !== rtl ? 1 : -1)); }
    else if (onCard && e.key === 'Home') { e.preventDefault(); setCursor(level, 0); }
    else if (onCard && e.key === 'End') { e.preventDefault(); setCursor(level, level._list.length - 1); }
    else if (onCard && (e.key === 'Enter' || e.key === ' ') && e.repeat) e.preventDefault();
  });
  const car = level._car;
  car.addEventListener('pointerdown', e => { if (!e.isPrimary || e.button !== 0) return; drag = {x: e.clientX, y: e.clientY, active: false}; });
  car.addEventListener('pointermove', e => {
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.active && Math.abs(dx) >= 8 && Math.abs(dx) > Math.abs(dy)) { drag.active = true; car.setPointerCapture(e.pointerId); }
  });
  car.addEventListener('pointerup', e => {
    if (drag?.active) {
      const dx = e.clientX - drag.x, rtl = doc.documentElement.dir === 'rtl', step = Math.round(-dx * (rtl ? -1 : 1) / Math.max(80, level._geo.slots[1].x * .6));
      level._swallow = true; setTimeout(() => level._swallow = false, 0);
      if (step) setCursor(level, cursorIndex(level._view, level._list) + step, {focus: false});
    }
    drag = null;
  });
  car.addEventListener('pointercancel', () => { drag = null; });
}
function live(text) { const l = $('hx-live'); l.textContent = ''; requestAnimationFrame(() => l.textContent = text); }
function validate(item) {
  const v = S.view;
  if (item.kind === 'world') show({level: 'countries', parent: 'world'}, 'descend');
  else if (item.kind === 'continent') show({level: 'countries', parent: item.id}, 'descend');
  else if (item.kind === 'country') show({level: 'campuses', parent: item.id, via: v.parent === 'world' ? 'world' : null}, 'descend');
  else if (item.kind === 'campus') show({level: 'campus', campus: item.id, via: v.via}, 'descend');
}
function ascend() {
  const v = S.view;
  if (v.level === 'campus') { const k = DATA.campusById.get(v.campus); S.cursor.set(viewKey({level: 'campuses', parent: k.country}), k.id); show({level: 'campuses', parent: k.country, via: v.via}, 'ascend'); }
  else if (v.level === 'campuses') { const parent = v.via === 'world' ? 'world' : continentOf(v.parent); S.cursor.set(viewKey({level: 'countries', parent}), v.parent); show({level: 'countries', parent}, 'ascend'); }
  else if (v.level === 'countries') { S.cursor.set(viewKey({level: 'continents', parent: null}), v.parent === 'world' ? 'world' : v.parent); show({level: 'continents', parent: null}, 'ascend'); }
}

/* ---- Campus sheet ------------------------------------------------------------------------------------------- */
function el(tag, cls, text) { const n = doc.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
function icon(id) { const s = svg('svg', {'aria-hidden': 'true'}); svg('use', {href: '#' + id}, s); return s; }
function external(a, label) { a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('aria-label', `${label}. ${COPY[S.lang].newTab}`); return a; }
const localized = (v, lang) => typeof v === 'string' ? v : v?.[lang] || v?.fr || v?.en || '';
function parseDay(v) { if (typeof v !== 'string') return null; const m = v.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/); if (!m) return null; return {date: new Date(Date.UTC(+m[1], (+m[2] || 1) - 1, +m[3] || 1)), precision: m[3] ? 'day' : m[2] ? 'month' : 'year'}; }
function dateText(v, lang, opts) {
  const p = parseDay(v); if (!p) return '';
  const o = opts || {year: 'numeric', ...(p.precision !== 'year' ? {month: 'long'} : {}), ...(p.precision === 'day' ? {day: 'numeric'} : {})};
  return new Intl.DateTimeFormat(localeTag(lang), {...o, timeZone: 'UTC'}).format(p.date);
}
async function renderCampus(view) {
  const k = DATA.campusById.get(view.campus), lang = S.lang, c = COPY[lang], profile = k.profile || {};
  const cname = countryName(k.country), titleId = `hx-campus-title-${++uid}`;
  const wrap = el('section', 'hx-campus'); wrap.setAttribute('aria-labelledby', titleId); wrap.dataset.key = viewKey(view);
  const sheet = el('div', 'hx-sheet'); wrap.append(sheet);
  const missing = [];

  // Heart: the logo on its lantern, the name, the country, key facts and the website.
  const heart = el('div', 'hx-heart'); sheet.append(heart);
  const lantern = el('div', 'hx-lantern'); heart.append(lantern);
  const h2 = el('h2', '', k.name); h2.id = titleId; h2.tabIndex = -1; h2.dir = 'auto'; heart.append(h2);
  const country = el('p', 'hx-country'); heart.append(country);
  const flag = await loadFlag(DATA.countries.get(k.country).iso2);
  if (flag) { const f = svg('svg', {viewBox: '0 0 640 480', 'aria-hidden': 'true', class: 'hx-miniflag'}); f.append(nestedFlag(flag, 'xx', {x: 0, y: 0, w: 640, h: 480})); country.append(f); }
  country.append(el('span', '', cname));
  const facts = el('dl', 'hx-facts');
  const opened = localized(profile.openedLabel, lang) || dateText(profile.openedOn, lang);
  if (opened) { const f = el('div', 'hx-fact'); f.append(el('dt', '', c.opening), el('dd', '', opened)); facts.append(f); } else missing.push('opening');
  const st = profile.stats?.students;
  if (st && (typeof st.value === 'number' || st.value)) {
    const f = el('div', 'hx-fact'); const v = typeof st.value === 'number' ? num(st.value, lang) : st.value;
    const dd = el('dd', '', v); dd.dir = 'ltr'; f.append(el('dt', '', `${c.students}${st.asOf ? ' · ' + c.asOf(st.asOf) : ''}`), dd); facts.append(f);
  } else missing.push('figures');
  if (st && !profile.stats?.cohorts && !profile.stats?.alumni) missing.push('cohorts', 'alumni');
  if (facts.children.length) heart.append(facts);
  if (k.website) {
    const label = k.websiteKind === 'campus-site' ? c.website : c.profile;
    const a = external(el('a', 'hx-cta'), `${label} · ${k.name}`); a.href = k.website; a.append(el('span', '', label), icon('i-external'));
    heart.append(a);
  }

  // Start wing: photos, or the campus's place in its country; then the Piscines.
  const start = el('div', 'hx-wing hx-wing-start'); sheet.append(start);
  const photos = (profile.photos || []).filter(p => p?.src);
  if (photos.length) {
    const sec = el('section', 'hx-section hx-photos'); sec.append(el('h3', '', c.photos));
    const stack = el('div', 'hx-photo-stack'); sec.append(stack);
    const figs = photos.map((p, i) => {
      const fig = el('figure', 'hx-photo'); fig.dataset.depth = String(Math.min(i, 2));
      const btn = el('button', 'hx-photo-open'); btn.type = 'button';
      const img = el('img'); img.src = new URL(p.src, SITE).href; img.alt = localized(p.alt, lang); img.decoding = 'async';
      btn.setAttribute('aria-label', `${c.enlarge} : ${img.alt}`); btn.setAttribute('aria-haspopup', 'dialog'); btn.append(img); fig.append(btn);
      if (i > 0) { fig.setAttribute('aria-hidden', 'true'); btn.tabIndex = -1; }
      return fig;
    });
    stack.append(...figs.slice().reverse());
    const bar = el('div', 'hx-photo-bar');
    if (photos.length > 1) {
      let active = 0;
      const prev = el('button', 'hx-nav'); prev.type = 'button'; prev.setAttribute('aria-label', c.prevPhoto); prev.append(icon('i-prev'));
      const next = el('button', 'hx-nav'); next.type = 'button'; next.setAttribute('aria-label', c.nextPhoto); next.append(icon('i-next'));
      const count = el('span', 'hx-count'); count.dir = 'ltr'; count.setAttribute('role', 'status');
      const turn = d => { active = (active + d + figs.length) % figs.length; figs.forEach((f, i) => { const depth = (i - active + figs.length) % figs.length; f.dataset.depth = String(Math.min(depth, 2)); f.style.zIndex = String(10 - depth); f.toggleAttribute('aria-hidden', depth !== 0); f.querySelector('button').tabIndex = depth ? -1 : 0; }); count.textContent = `${num(active + 1, lang)} / ${num(figs.length, lang)}`; };
      prev.addEventListener('click', () => turn(-1)); next.addEventListener('click', () => turn(1)); turn(0);
      bar.append(prev, count, next);
    }
    const credit = el('p', 'hx-credit'); const p0 = photos[0];
    credit.append(Object.assign(el('bdi', '', localized(p0.credit, lang) || ''), {dir: 'auto'}));
    if (p0.sourceUrl) { credit.append(' · '); const a = external(el('a', '', c.source), c.source); a.href = p0.sourceUrl; credit.append(a); }
    bar.append(credit); sec.append(bar); start.append(sec);
  } else {
    missing.unshift('photos');
    const shape = DATA.shapes.countries[k.country];
    const fig = el('figure', 'hx-section hx-locator');
    if (shape) {
      const vb = parseViewBox(shape.viewBox), s = svg('svg', {viewBox: shape.viewBox, 'aria-hidden': 'true'});
      svg('path', {d: shape.d, class: 'hx-land'}, s); svg('path', {d: shape.d, class: 'hx-edge'}, s);
      const dot = shape.dots?.find(d => d[2] === k.id);
      if (dot) { const r = Math.max(vb.w, vb.h) / 300 * 6; svg('circle', {cx: dot[0], cy: dot[1], r: r * 1.6, class: 'hx-locator-ring'}, s); svg('circle', {cx: dot[0], cy: dot[1], r, class: 'hx-locator-dot'}, s); }
      const holder = el('span', 'hx-figure'); const h = clamp((Number(getComputedStyle(stage()).getPropertyValue('--band-h').replace('px', '')) || 480) * .42, 130, 220);
      holder.style.setProperty('--fh', h + 'px'); holder.style.setProperty('--fw', h * vb.w / vb.h + 'px'); holder.append(s); fig.append(holder);
    }
    fig.append(el('figcaption', '', c.locator(k.name)));
    start.append(fig);
  }
  const end = el('div', 'hx-wing hx-wing-end'); sheet.append(end);
  const pis = el('section', 'hx-section hx-piscines'); pis.append(el('h3', '', c.piscines));
  const today = Date.UTC(2026, 9, 24);
  const upcoming = (profile.piscines || []).map(p => ({...p, s: parseDay(p.startsOn), e: parseDay(p.endsOn)})).filter(p => p.s?.precision === 'day' && (p.e?.date || p.s.date).getTime() >= today).sort((a, b) => a.s.date - b.s.date);
  if (upcoming.length) {
    const ul = el('ul');
    upcoming.forEach((p, i) => {
      const li = el('li'); const name = el('p', 'hx-piscine-name', localized(p.label, lang) || 'Piscine');
      if (i === 0) name.append(el('span', 'hx-next', c.upcoming));
      const fmt = new Intl.DateTimeFormat(localeTag(lang), {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
      const dates = el('p', 'hx-piscine-dates', p.e ? fmt.formatRange(p.s.date, p.e.date) : fmt.format(p.s.date));
      li.append(name, dates); ul.append(li);
    });
    pis.append(ul);
  } else pis.append(el('p', 'hx-note', c.checkDates));
  const pnote = localized(profile.piscinesNote, lang); if (pnote) pis.append(el('p', 'hx-note', pnote));
  const datesURL = profile.piscineSourceUrl || (!upcoming.length ? k.website : null);
  if (datesURL) { const a = external(el('a', 'hx-link'), c.officialDates); a.href = datesURL; a.append(el('span', '', c.officialDates), icon('i-external')); const p = el('p'); p.style.marginTop = '6px'; p.append(a); pis.append(p); }

  // End wing: address with its two actions, then the Piscines; the start wing also takes the contacts.
  const adr = el('section', 'hx-section hx-address'); adr.append(el('h3', '', c.address));
  const address = (k.address || '').trim();
  if (address) {
    const a = el('address', '', address); a.dir = 'auto'; adr.append(a);
    const actions = el('div', 'hx-actions');
    const copy = el('button', 'hx-pill'); copy.type = 'button'; copy.append(icon('i-copy'), el('span', '', c.copy));
    const status = el('p', 'hx-note'); status.setAttribute('role', 'status');
    copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(address); status.textContent = c.copied; } catch { status.textContent = ''; } });
    const url = new URL('https://www.google.com/maps/dir/'); url.searchParams.set('api', '1'); url.searchParams.set('destination', `${k.name}, ${address.replace(/\s+/g, ' ')}`);
    const dir = external(el('a', 'hx-pill'), c.directionsLabel); dir.href = url.href; dir.append(icon('i-route'), el('span', '', c.directions));
    actions.append(copy, dir); adr.append(actions, status);
  }
  end.append(adr, pis);
  const contacts = (profile.contacts || []).filter(x => localized(x?.value, lang));
  if (contacts.length) {
    const sec = el('section', 'hx-section hx-contacts'); sec.append(el('h3', '', c.contacts));
    const ul = el('ul');
    for (const x of contacts) {
      const li = el('li'); li.append(el('span', 'hx-label', localized(x.label, lang)));
      const a = el('a', 'hx-link', localized(x.value, lang)); a.href = x.href; a.dir = 'auto'; if (/^https?:/.test(x.href)) external(a, a.textContent);
      li.append(a); ul.append(li);
    }
    sec.append(ul);
    if (profile.contactSourceUrl) { const p = el('p', 'hx-source'); const a = external(el('a', '', c.source), c.source); a.href = profile.contactSourceUrl; p.append(a); sec.append(p); }
    start.append(sec);
  } else missing.splice(1, 0, 'contacts');
  if (missing.length) {
    const words = [...new Set(missing)].map(m => c.missing[m]);
    const list = words.length > 1 ? words.slice(0, -1).join(', ') + c.and + words.at(-1) : words[0];
    const q = el('p', 'hx-quiet'); q.append(icon('i-sparkle'), el('span', '', c.missingIntro + list + '.'));
    end.append(q);
  }
  const verified = dateText(profile.verifiedAt, lang);
  if (verified) heart.append(el('p', 'hx-note hx-verified', c.verified + verified));

  // Siblings: the other campuses of the country, to switch without going back.
  const sibs = DATA.campuses.filter(x => x.country === k.country).sort((a, b) => collator().compare(a.name, b.name));
  if (sibs.length > 1) {
    const nav = el('nav', 'hx-siblings'); nav.setAttribute('aria-label', c.siblings(cname));
    const back = el('button', 'hx-sib hx-sib-back'); back.type = 'button'; back.setAttribute('aria-label', c.backTo(cname)); back.append(icon('i-back'), el('span', '', cname));
    back.addEventListener('click', ascend); const list = el('div', 'hx-sib-list'); nav.append(back, list);
    for (const x of sibs) {
      const b = el('button', 'hx-sib'); b.type = 'button'; b.dir = 'auto'; b.append(el('span', '', x.name));
      if (x.id === k.id) { b.setAttribute('aria-current', 'true'); b.prepend(icon('i-check')); }
      b.addEventListener('click', () => { if (x.id !== k.id) show({level: 'campus', campus: x.id, via: view.via}, 'none'); });
      list.append(b);
    }
    wrap.append(nav);
  }
  // The logo (after layout: its size follows the band).
  const url = logoURL(k), ink = url ? await inkBox(url) : null;
  wrap._fillLantern = () => {
    const d = lantern.getBoundingClientRect().width || 160; lantern.replaceChildren();
    const img = logoImage(k, d, ink, {tall: .36}); if (img) lantern.append(img);
  };
  return wrap;
}

/* ---- Showing a view ----------------------------------------------------------------------------------------- */
let showing = 0;
async function show(view, direction = 'none', {focus = true} = {}) {
  const token = ++showing;
  const prevView = S.view; S.view = view;
  applyScope(view); measureBand();
  const st = stage(), old = st.querySelector('.hx-level, .hx-campus');
  const node = view.level === 'campus' ? await renderCampus(view) : await renderLevel(view);
  if (token !== showing) return;
  if (old) { old.inert = true; old.setAttribute('aria-hidden', 'true'); }
  st.append(node);
  if (view.level === 'campus') {
    node._fillLantern();
    const sheet = node.querySelector('.hx-sheet'); sheet.dataset.overflow = String(sheet.scrollHeight > sheet.clientHeight + 2);
    const sibs = node.querySelector('.hx-siblings');
    const list = node.querySelector('.hx-sib-list');
    if (list) { sibs.dataset.scroll = String(list.scrollWidth > list.clientWidth + 2); const cur = list.querySelector('[aria-current=true]'); if (sibs.dataset.scroll === 'true' && cur) list.scrollLeft += cur.getBoundingClientRect().left - list.getBoundingClientRect().left - list.clientWidth / 2 + cur.offsetWidth / 2; }
  } else layoutLevel(node, {instant: true});
  const done = () => { old?.remove(); };
  const fromLantern = old?.querySelector('.hx-item[data-off="0"] .hx-lantern');
  if (old && motionOK() && view.level === 'campus' && prevView?.level === 'campuses' && fromLantern) {
    // The validated logo stays the centre of attention: it glides into the heart, the sheet unfolds around it.
    const a = fromLantern.getBoundingClientRect();
    old.style.position = 'absolute'; old.style.inset = '0'; // the old level leaves the flow before the new heart is measured
    const to = node.querySelector('.hx-heart .hx-lantern'), b = to.getBoundingClientRect();
    const k = a.width / b.width, ease = 'cubic-bezier(.22,1,.36,1)', rtlSign = doc.documentElement.dir === 'rtl' ? -1 : 1;
    fromLantern.style.visibility = 'hidden';
    old.animate([{opacity: 1}, {opacity: 0}], {duration: 220, easing: 'linear', fill: 'forwards'}).finished.then(done, done);
    to.animate([{transform: `translate(${a.left + a.width / 2 - b.left - b.width / 2}px, ${a.top + a.height / 2 - b.top - b.height / 2}px) scale(${k})`}, {transform: 'none'}], {duration: 560, easing: ease});
    node.querySelectorAll('.hx-heart > :not(.hx-lantern)').forEach((n, i) => n.animate([{opacity: 0, transform: 'translateY(10px)'}, {opacity: 1, transform: 'none'}], {duration: 380, delay: 200 + i * 40, easing: ease, fill: 'backwards'}));
    node.querySelector('.hx-wing-start')?.animate([{opacity: 0, transform: `translateX(${28 * rtlSign}px)`}, {opacity: 1, transform: 'none'}], {duration: 460, delay: 260, easing: ease, fill: 'backwards'});
    node.querySelector('.hx-wing-end')?.animate([{opacity: 0, transform: `translateX(${-28 * rtlSign}px)`}, {opacity: 1, transform: 'none'}], {duration: 460, delay: 260, easing: ease, fill: 'backwards'});
    node.querySelector('.hx-siblings')?.animate([{opacity: 0, transform: 'translateY(12px)'}, {opacity: 1, transform: 'none'}], {duration: 360, delay: 340, easing: ease, fill: 'backwards'});
  } else if (old && motionOK() && direction !== 'none') {
    const sign = direction === 'descend' ? 1 : -1;
    old.style.position = 'absolute'; old.style.inset = '0';
    old.animate([{opacity: 1, transform: 'none'}, {opacity: 0, transform: `translateY(${sign * -18}px) scale(${sign > 0 ? 1.03 : .97})`}], {duration: 260, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards'}).finished.then(done, done);
    node.animate([{opacity: 0, transform: `translateY(${sign * 22}px)`}, {opacity: 1, transform: 'none'}], {duration: 420, delay: 80, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
  } else done();
  st.dataset.ready = 'true';
  if (focus && prevView) {
    if (view.level === 'campus') node.querySelector('h2')?.focus({preventScroll: true});
    else node.querySelector('.hx-item[data-off="0"]')?.focus({preventScroll: true});
  }
  writeURL();
  if (prevView) live(view.level === 'campus' ? DATA.campusById.get(view.campus).name : `${levelPrompt(view)} · ${$('scope-name').textContent}`);
}

/* ---- Study chrome: state switcher and device previews ---------------------------------------------------------- */
const params = new URLSearchParams(location.search);
function writeURL() {
  const p = new URLSearchParams(location.search);
  const preset = Object.entries(PRESETS).find(([, v]) => viewKey(v.view) === viewKey(S.view) && (!v.cursor || S.cursor.get(viewKey(S.view)) === v.cursor));
  p.set('v', preset ? preset[0] : 'free'); p.set('theme', S.theme); p.set('lang', S.lang);
  history.replaceState(null, '', '?' + p.toString());
  updatePanel();
}
const VIEWS = [['l1', 'Niveau 1'], ['l2', 'Niveau 2'], ['l3', 'Niveau 3'], ['paris', '42 Paris'], ['lyon', '42 Lyon'], ['mulhouse', 'Mulhouse']];
const DEVICES = [['1440×900', 1440, 900], ['1280×720', 1280, 720], ['390×844', 390, 844], ['320×640', 320, 640], ['667×375', 667, 375]];
function buildPanel() {
  const panel = $('study-panel'); if (params.get('panel') === '0') return;
  panel.hidden = false;
  panel.innerHTML = `<div class="study-top"><strong>Étude · Halo et lumière</strong><button type="button" data-collapse>Réduire</button></div>
  <div class="study-group"><span>État</span><div class="study-seg" data-group="v"></div></div>
  <div class="study-group"><span>Thème</span><div class="study-seg" data-group="theme"></div></div>
  <div class="study-group"><span>Langue</span><div class="study-seg" data-group="lang"></div></div>
  <div class="study-group"><span>Aperçu à la taille d’un écran</span><div class="study-seg" data-group="device"></div></div>
  <p class="study-note" data-sources></p>`;
  const seg = (g, entries, onPick) => { const box = panel.querySelector(`[data-group=${g}]`); for (const [value, label] of entries) { const b = doc.createElement('button'); b.type = 'button'; b.textContent = label; b.dataset.value = value; b.addEventListener('click', () => onPick(value)); box.append(b); } };
  seg('v', VIEWS, v => goPreset(v));
  seg('theme', [['light', 'Clair'], ['dark', 'Sombre']], t => { S.theme = t; applyFrame(); rerender(); });
  seg('lang', [['fr', 'FR'], ['en', 'EN'], ['ar', 'AR']], l => { S.lang = l; applyFrame(); rerender(); });
  seg('device', DEVICES.map(([n]) => [n, n]), n => openPreview(DEVICES.find(d => d[0] === n)));
  panel.querySelector('[data-collapse]').addEventListener('click', e => { const c = panel.dataset.collapsed !== 'true'; panel.dataset.collapsed = String(c); e.currentTarget.textContent = c ? 'Ouvrir' : 'Réduire'; });
  updatePanel();
}
function updatePanel() {
  const panel = $('study-panel'); if (panel.hidden) return;
  const v = new URLSearchParams(location.search).get('v');
  panel.querySelectorAll('[data-group=v] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === v)));
  panel.querySelectorAll('[data-group=theme] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === S.theme)));
  panel.querySelectorAll('[data-group=lang] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === S.lang)));
  panel.querySelector('[data-sources]').textContent = `Silhouettes : ${DATA.shapeSource}. Drapeaux : ${flagSource || 'site-b/assets/flags, repli CDN flag-icons 7.5.0'}. Logos : ${DATA.logoSource}. La maquette se joue au clavier (flèches, Entrée, Échap), à la souris et au doigt.`;
}
function openPreview([name, w, h]) {
  const box = $('study-preview'); box.hidden = false; box.replaceChildren();
  const p = new URLSearchParams(location.search); p.set('panel', '0');
  const frame = doc.createElement('iframe'); frame.title = `Aperçu ${name}`; frame.width = w; frame.height = h; frame.src = '?' + p.toString();
  const scale = Math.min(1, (innerWidth - 48) / w, (innerHeight - 96) / h); frame.style.transform = `scale(${scale})`;
  const close = doc.createElement('button'); close.type = 'button'; close.textContent = 'Fermer l’aperçu';
  close.addEventListener('click', () => { box.hidden = true; box.replaceChildren(); });
  box.append(frame, close); close.focus();
}
function goPreset(key) {
  const p = PRESETS[key] || PRESETS.l1;
  if (p.cursor) S.cursor.set(viewKey(p.view), p.cursor);
  return show(structuredClone(p.view), 'none', {focus: false});
}
function rerender() { if (S.view) show(S.view, 'none', {focus: false}); }

/* ---- Start ---------------------------------------------------------------------------------------------------------- */
async function start() {
  S.lang = ['fr', 'en', 'ar'].includes(params.get('lang')) ? params.get('lang') : 'fr';
  S.theme = params.get('theme') === 'dark' ? 'dark' : 'light';
  doc.documentElement.dataset.theme = S.theme;
  await loadData();
  sharedDefs(); applyFrame(); buildPanel();
  await doc.fonts.ready;
  await goPreset(PRESETS[params.get('v')] ? params.get('v') : 'l1');
  doc.addEventListener('keydown', e => {
    if (e.key !== 'Escape' && e.key !== 'Backspace') return;
    if (e.target.closest?.('input,textarea,[contenteditable],.study-panel')) return;
    if (!$('study-preview').hidden) { $('study-preview').hidden = true; return; }
    if (S.view && S.view.level !== 'continents') { e.preventDefault(); ascend(); }
  });
  $('scope-back').addEventListener('click', ascend);
  $('reset').addEventListener('click', () => { S.cursor.set(viewKey({level: 'continents', parent: null}), 'world'); show({level: 'continents', parent: null}, 'ascend'); });
  let raf = 0;
  addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { placeIndicator(); measureBand(); const n = stage().querySelector('.hx-level:not([inert])'); if (n) layoutLevel(n, {instant: true}); else { const c = stage().querySelector('.hx-campus:not([inert])'); c?._fillLantern?.(); } }); });
  doc.documentElement.dataset.studyReady = 'true';
}
start().catch(error => { console.error(error); const p = doc.createElement('p'); p.className = 'hx-prompt'; p.style.cssText = 'margin:auto;text-align:center'; p.textContent = 'L’étude n’a pas pu charger ses données : ' + error.message; stage().append(p); doc.documentElement.dataset.studyReady = 'error'; });
