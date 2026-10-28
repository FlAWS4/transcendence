// Study "atlas" (24 Oct 2026): Explorer B as a warm travel atlas. A mock-up, not the site:
// it reads A/B data read-only and reuses B's pure model (buildExplorerView, countLabel).
import {ATLAS_META, ATLAS_GLOBE} from './atlas-meta.mjs';
import {CONTINENTS, continentOfCountry, continentName} from '../../../site-b/continents.mjs';
import {buildExplorerView, countLabel} from '../../../site-b/explorer-model.mjs';
import {resolveCampusWebsite} from '../../../site/campus-website.mjs';

const ROOT = '../../../';
const params = new URLSearchParams(location.search);
const doc = document, html = doc.documentElement;
const $ = id => doc.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

// ---------------------------------------------------------------- copy (FR/EN/AR)
const COPY = {
 fr: {
  nav: {explore: 'Explorer', projects: 'Projets', people: 'Profils', journal: 'Chroniques', awards: '42 Awards'},
  search: 'Chercher dans Horizon', dice: 'Visiter un campus', account: 'Mon compte', about: 'Exploration · 42 Horizon', back: 'Revenir au niveau précédent',
  path: 'Chemin géographique', choose: 'Choisir un pays ou un campus', title: 'Explorer',
  words: ['Continent', 'Pays', 'Campus'], chip: 'Valider', prev: 'Précédent', next: 'Suivant', of: (i, n) => `${i} sur ${n}`, carousel: 'carrousel',
  hint: [['arrows', 'pour choisir'], ['Entrée', 'pour valider'], ['Échap', 'pour revenir']], touch: 'Glisse pour choisir · Touche le centre pour valider',
  campusBack: c => `Revenir aux campus · ${c}`, strip: c => `Tous les campus · ${c}`, campusEyebrow: c => `Campus · ${c}`,
  glance: 'En bref', address: 'Adresse', copy: 'Copier l’adresse', directions: 'Itinéraire', website: 'Site officiel du campus', profile: 'Fiche officielle · 42 Network',
  contacts: 'Contacts', opening: 'Ouverture', students: 'Étudiants', cohorts: 'Promotions', alumni: 'Alumni', asOf: 'en',
  missingStats: 'Les chiffres non renseignés sont indiqués par un tiret.', dashLegend: '— non renseigné', piscines: 'Prochaines Piscines', checkDates: 'Dates à consulter sur le site officiel.',
  officialDates: 'Consulter les dates officielles', datesShort: 'Dates officielles', verified: 'Dernière vérification : ', photos: 'Photos', photo: (i, n) => `${i} / ${n}`, prevPhoto: 'Photo précédente', nextPhoto: 'Photo suivante',
  source: 'Source', newTab: 'S’ouvre dans un nouvel onglet', siteIn: l => `Site en ${l}`,
  wait: list => `Cette fiche attend encore ${list}.`, waitItems: {photos: 'ses photos', contacts: 'ses contacts', opening: 'sa date d’ouverture', stats: 'ses chiffres'}, and: ' et ',
  locator: 'Pas encore de photos : voici où se trouve le campus.',
 },
 en: {
  nav: {explore: 'Explore', projects: 'Projects', people: 'Profiles', journal: 'Chronicles', awards: '42 Awards'},
  search: 'Search Horizon', dice: 'Visit a campus', account: 'My account', about: 'Exploration · 42 Horizon', back: 'Back to the previous level',
  path: 'Geographic path', choose: 'Choose a country or a campus', title: 'Explore',
  words: ['Continent', 'Country', 'Campus'], chip: 'Select', prev: 'Previous', next: 'Next', of: (i, n) => `${i} of ${n}`, carousel: 'carousel',
  hint: [['arrows', 'to choose'], ['Enter', 'to select'], ['Esc', 'to go back']], touch: 'Swipe to choose · Tap the centre to select',
  campusBack: c => `Back to campuses · ${c}`, strip: c => `All campuses · ${c}`, campusEyebrow: c => `Campus · ${c}`,
  glance: 'At a glance', address: 'Address', copy: 'Copy address', directions: 'Directions', website: 'Official campus website', profile: 'Official profile · 42 Network',
  contacts: 'Contacts', opening: 'Opening', students: 'Students', cohorts: 'Cohorts', alumni: 'Alumni', asOf: 'in',
  missingStats: 'Figures that are not provided are shown as a dash.', dashLegend: '— not provided', piscines: 'Upcoming Piscines', checkDates: 'Check the official website for dates.',
  officialDates: 'Check official dates', datesShort: 'Official dates', verified: 'Last checked: ', photos: 'Photos', photo: (i, n) => `${i} / ${n}`, prevPhoto: 'Previous photo', nextPhoto: 'Next photo',
  source: 'Source', newTab: 'Opens in a new tab', siteIn: l => `Website in ${l}`,
  wait: list => `This entry is still waiting for ${list}.`, waitItems: {photos: 'its photos', contacts: 'its contacts', opening: 'its opening date', stats: 'its figures'}, and: ' and ',
  locator: 'No photos yet: here is where the campus is.',
 },
 ar: {
  nav: {explore: 'استكشف', projects: 'المشاريع', people: 'الأعضاء', journal: 'حكايات', awards: 'جوائز 42'},
  search: 'ابحث في أفق', dice: 'زيارة فرع', account: 'حسابي', about: 'تصوّر أولي · Horizon 42', back: 'العودة إلى المستوى السابق',
  path: 'المسار الجغرافي', choose: 'اختر دولة أو فرعًا', title: 'استكشف',
  words: ['القارة', 'الدولة', 'الفرع'], chip: 'تأكيد', prev: 'السابق', next: 'التالي', of: (i, n) => `${i} من ${n}`, carousel: 'عرض دوّار',
  hint: [['arrows', 'للاختيار'], ['Enter', 'للتأكيد'], ['Esc', 'للرجوع']], touch: 'اسحب للاختيار · المس العنصر الأوسط للتأكيد',
  campusBack: c => `العودة إلى فروع ${c}`, strip: c => `جميع فروع ${c}`, campusEyebrow: c => `الفرع · ${c}`,
  glance: 'لمحة', address: 'العنوان', copy: 'نسخ العنوان', directions: 'الاتجاهات', website: 'الموقع الرسمي للفرع', profile: 'الصفحة الرسمية · 42 Network',
  contacts: 'التواصل', opening: 'الافتتاح', students: 'الطلاب', cohorts: 'الدفعات', alumni: 'الخريجون', asOf: 'في',
  missingStats: 'تشير الشرطة إلى الأرقام غير المتوفرة.', dashLegend: '— غير متوفر', piscines: 'فترات البيسين القادمة', checkDates: 'راجع الموقع الرسمي للاطلاع على المواعيد.',
  officialDates: 'الاطلاع على المواعيد الرسمية', datesShort: 'المواعيد الرسمية', verified: 'آخر تحقق: ', photos: 'الصور', photo: (i, n) => `${i} / ${n}`, prevPhoto: 'الصورة السابقة', nextPhoto: 'الصورة التالية',
  source: 'المصدر', newTab: 'يفتح في علامة تبويب جديدة', siteIn: l => `الموقع باللغة ${l}`,
  wait: list => `ما زالت هذه البطاقة تنتظر ${list}.`, waitItems: {photos: 'صورها', contacts: 'جهات التواصل', opening: 'تاريخ افتتاحها', stats: 'أرقامها'}, and: ' و',
  locator: 'لا صور بعد: هنا يقع الفرع.',
 },
};

// ---------------------------------------------------------------- state
const STATES = {
 l1: {scope: {level: 'world'}, cursor: 'europe'},
 l2: {scope: {level: 'continent', continent: 'europe'}, cursor: 'FRA'},
 l3: {scope: {level: 'country', country: 'FRA'}, cursor: 'paris'},
 paris: {scope: {level: 'campus', country: 'FRA', campus: 'paris'}},
 lyon: {scope: {level: 'campus', country: 'FRA', campus: 'lyon'}},
 monde: {scope: {level: 'world'}, list: 'countries', cursor: 'FRA'},
};
const app = {
 lang: ['fr', 'en', 'ar'].includes(params.get('lang')) ? params.get('lang') : 'fr',
 theme: params.get('theme') === 'dark' ? 'dark' : 'light',
 stateKey: STATES[params.get('state')] ? params.get('state') : 'l1',
 scope: null, list: null, via: null, cursor: null, photo: 0,
};
Object.assign(app, structuredClone({scope: STATES[app.stateKey].scope, list: STATES[app.stateKey].list || null, cursor: STATES[app.stateKey].cursor || null}));
if (params.get('cursor')) app.cursor = params.get('cursor');
if (params.get('chrome') === '0') html.dataset.chrome = 'off';
if (params.get('static') === '1') html.dataset.static = 'on';
const showPlate = params.get('plate') === '1';

// ---------------------------------------------------------------- data (read-only)
const json = url => fetch(url).then(r => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
const [catalogue, profiles, websites, locales, logos] = await Promise.all([
 json(ROOT + 'site/campuses.json'), json(ROOT + 'site/campus-profiles.json'), json(ROOT + 'site/campus-websites.json'),
 json(ROOT + 'site/campus-website-locales.json'), json(ROOT + 'site-b/campus-logos.json').catch(() => ({campuses: {}})),
]);
const countries = catalogue.countries;
const campuses = catalogue.campuses.map(c => ({...c, websiteUrl: websites.campuses?.[c.id]?.url, websiteLocales: locales.campuses?.[c.id], profile: profiles.campuses?.[c.id] || {}, logo: logos.campuses?.[c.id] || null}));
const catalog = {countries, campuses};
const countryById = new Map(countries.map(c => [c.id, c]));
const campusById = new Map(campuses.map(c => [c.id, c]));
let regionNames = null;
const countryName = id => { const c = countryById.get(id); try { return (c && regionNames.of(c.iso2)) || c?.name || id; } catch { return c?.name || id; } };
const T = () => COPY[app.lang];
const numberFormat = () => new Intl.NumberFormat(app.lang, {numberingSystem: 'latn'});

// ---------------------------------------------------------------- silhouettes: site-b asset + aligned meta, or the stand-in
let SITE_B = null, STANDIN = null;
try { SITE_B = (await import('../../../site-b/explorer-shapes.mjs')).SHAPES; } catch { SITE_B = null; }
if (!SITE_B || !ATLAS_META) STANDIN = (await import('./atlas-standin.mjs')).ATLAS_STANDIN;
const shapeCache = new Map();
function shape(kind, id) {
 const key = kind + ':' + id; if (shapeCache.has(key)) return shapeCache.get(key);
 const group = kind === 'continent' ? 'continents' : 'countries';
 const base = STANDIN ? STANDIN[group][id] : {...SITE_B[group][id], ...ATLAS_META[group][id]};
 const [, , w, h] = base.viewBox.split(/\s+/).map(Number);
 const s = {...base, w, h}; shapeCache.set(key, s); return s;
}
const GLOBE = {...ATLAS_GLOBE, w: 1000, h: 1000};
html.dataset.shapes = STANDIN ? 'stand-in' : 'site-b';

// ---------------------------------------------------------------- logos: trimmed to their ink, mono or colour
const logoCache = new Map();
function logoInfo(campus) {
 const entry = campus.logo; if (!entry) return Promise.resolve(null);
 const src = ROOT + 'site-b/' + entry.src;
 if (logoCache.has(src)) return logoCache.get(src);
 const promise = new Promise(resolve => {
  const img = new Image(); img.decoding = 'async';
  img.onload = () => {
   try {
    const w = img.naturalWidth || entry.width || 600, h = img.naturalHeight || entry.height || 200;
    const scale = Math.min(1, 900 / w), cw = Math.round(w * scale), ch = Math.round(h * scale);
    const canvas = Object.assign(doc.createElement('canvas'), {width: cw, height: ch}), ctx = canvas.getContext('2d', {willReadFrequently: true});
    ctx.drawImage(img, 0, 0, cw, ch);
    const data = ctx.getImageData(0, 0, cw, ch).data;
    const bg = /^#[0-9a-f]{6}$/i.test(entry.background || '') ? [1, 3, 5].map(i => parseInt(entry.background.slice(i, i + 2), 16)) : null;
    let x0 = cw, y0 = ch, x1 = -1, y1 = -1; const chroma = [];
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
     const i = (y * cw + x) * 4, a = data[i + 3];
     if (a < 24) continue;
     const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
     if (bg && Math.abs(r - bg[0]) + Math.abs(g - bg[1]) + Math.abs(b - bg[2]) < 36) continue;
     if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
     if ((y * cw + x) % 7 === 0) chroma.push(Math.max(r, g, b) - Math.min(r, g, b));
    }
    chroma.sort((a, b) => a - b);
    const mono = !chroma.length || chroma[Math.floor(chroma.length * .95)] < 46;
    if (x1 < 0) { resolve({src, ratio: w / h, mono, surface: entry.surface, background: entry.background}); return; }
    const pad = Math.round(Math.max(x1 - x0, y1 - y0) * .02);
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(cw - 1, x1 + pad); y1 = Math.min(ch - 1, y1 + pad);
    const out = Object.assign(doc.createElement('canvas'), {width: x1 - x0 + 1, height: y1 - y0 + 1});
    const octx = out.getContext('2d');
    if (bg) { octx.fillStyle = entry.background; octx.fillRect(0, 0, out.width, out.height); }
    octx.drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
    // a monochrome logo becomes ink on a transparent ground: dark ink by day, light ink by night
    const inks = {};
    if (mono) {
     const src2 = octx.getImageData(0, 0, out.width, out.height), d2 = src2.data;
     const bgLum = bg ? .299 * bg[0] + .587 * bg[1] + .114 * bg[2] : 255;
     let inkLum = 255; for (let i = 0; i < d2.length; i += 4) if (d2[i + 3] > 200) inkLum = Math.min(inkLum, .299 * d2[i] + .587 * d2[i + 1] + .114 * d2[i + 2]);
     for (const [key, rgb] of [['dark', [27, 27, 27]], ['light', [255, 255, 255]]]) {
      const c3 = Object.assign(doc.createElement('canvas'), {width: out.width, height: out.height}), x3 = c3.getContext('2d'), img3 = x3.createImageData(out.width, out.height), d3 = img3.data;
      for (let i = 0; i < d2.length; i += 4) {
       const lum = .299 * d2[i] + .587 * d2[i + 1] + .114 * d2[i + 2];
       const a = Math.max(0, Math.min(1, (bgLum - lum) / Math.max(1, bgLum - inkLum))) * (bg ? 1 : d2[i + 3] / 255);
       d3[i] = rgb[0]; d3[i + 1] = rgb[1]; d3[i + 2] = rgb[2]; d3[i + 3] = Math.round(a * 255);
      }
      x3.putImageData(img3, 0, 0); inks[key] = c3.toDataURL('image/png');
     }
    }
    resolve({src: out.toDataURL('image/png'), inks, ratio: out.width / out.height, mono, surface: entry.surface, background: entry.background});
   } catch { resolve({src, ratio: (entry.aspectRatio || 3), mono: false, surface: entry.surface, background: entry.background}); }
  };
  img.onerror = () => resolve(null);
  img.src = src;
 });
 logoCache.set(src, promise); return promise;
}
// print = the logo's own white disappears into the page (multiply by day, inverted + screen by night)
function logoTreatment(info) {
 if (!info) return 'none';
 return info.mono && info.inks?.dark ? 'print' : 'sticker';
}
const logoSrc = (info, treat) => treat === 'print' ? info.inks[app.theme === 'dark' ? 'light' : 'dark'] : info.src;

// ---------------------------------------------------------------- silhouettes
let uidCounter = 0;
const r1 = v => Math.round(v * 100) / 100;
function shapeOf(item) {
 if (item.kind === 'world') return {kind: 'world', s: GLOBE};
 if (item.kind === 'continent') return {kind: 'continent', s: shape('continent', item.id)};
 if (item.kind === 'country') return {kind: 'country', s: shape('country', item.id), iso2: countryById.get(item.id)?.iso2?.toLowerCase()};
 return null;
}
// One SVG: water lines (masked rings), coast, lifted fill (flag clipped / land wash / globe), inner edge, pins.
function artSVG({kind, s, iso2}, k, opts = {}) {
 const u = 'a' + (++uidCounter), W = s.w, H = s.h, px = v => r1(v / k);
 const rings = opts.rings ?? [[5, .95], [11, .6], [18, .3]], line = opts.line ?? 1.15;
 const pinR = opts.pinR ?? 4.6, pinRing = opts.pinRing ?? 1.6;
 const big = `x="${-W}" y="${-H}" width="${3 * W}" height="${3 * H}"`;
 let defs = '', body = '';
 const pinsOf = pins => Object.entries(pins || {}).map(([id, [x, y]]) => {
  const hot = opts.hotPin === id;
  const rr = hot ? pinR * 1.55 : pinR;
  return (hot ? `<circle cx="${x}" cy="${y}" r="${px(rr * 2.6)}" class="pin-halo" style="fill:var(--pin-glow)"/>` : '') +
   `<circle cx="${x}" cy="${y}" r="${px(rr)}" style="fill:var(--pin);stroke:var(--pin-ring);stroke-width:${px(pinRing)}"/>`;
 }).join('');
 if (kind === 'world') {
  const {cx, cy, r} = s.sphere;
  const ringMarks = rings.map(([o, a]) => `<circle cx="${cx}" cy="${cy}" r="${r1(r + px(o))}" style="fill:none;stroke:var(--water);stroke-opacity:${a * .8};stroke-width:${px(line)}"/>`).join('');
  defs += `<radialGradient id="${u}o" cx=".36" cy=".3" r=".78"><stop offset="0" style="stop-color:var(--ocean-1)"/><stop offset="1" style="stop-color:var(--ocean-2)"/></radialGradient>
   <linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--land-1)"/><stop offset=".65" style="stop-color:var(--land-2)"/><stop offset="1" style="stop-color:var(--land-3)"/></linearGradient>
   <radialGradient id="${u}s" cx=".3" cy=".22" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
   <clipPath id="${u}c"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>`;
  body += `<g class="shape-lift"><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${u}o)"/></g>
   <g style="opacity:var(--water-strength)">${ringMarks}</g>
   <g clip-path="url(#${u}c)"><path d="${s.graticule}" style="fill:none;stroke:var(--graticule);stroke-width:${px(1)}"/><path d="${s.land}" fill="url(#${u}g)"/>
   <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${u}s)"/><rect ${big} filter="url(#atlas-grain)" opacity=".5"/></g>
   <circle cx="${cx}" cy="${cy}" r="${r}" style="fill:none;stroke:var(--coast);stroke-width:${px(1.2)}"/>`;
  return {svg: `<svg viewBox="${s.viewBox}" aria-hidden="true" focusable="false"><defs>${defs}</defs>${body}<g class="pins">${pinsOf(opts.pins === false ? {} : s.pins)}</g></svg>`};
 }
 defs += `<path id="${u}p" d="${s.d}"/><clipPath id="${u}c"><use href="#${u}p"/></clipPath>`;
 const maskRings = rings.slice().reverse().map(([o, a]) => {
  const gray = Math.round(a * 255);
  return `<use href="#${u}p" style="fill:none;stroke:rgb(${gray},${gray},${gray});stroke-width:${px(2 * (o + line / 2))};stroke-linejoin:round"/><use href="#${u}p" style="fill:none;stroke:#000;stroke-width:${px(2 * (o - line / 2))};stroke-linejoin:round"/>`;
 }).join('');
 defs += `<mask id="${u}w" maskUnits="userSpaceOnUse" ${big}>${maskRings}</mask>`;
 // a straight geographic cut (Asia at the Urals) fades instead of looking like a coast
 let cutMaskAttr = '';
 if (s.cut?.a) {
  const [ax, ay] = s.cut.a, [bx, by] = s.cut.b, [ix, iy] = s.cut.inner;
  const len = Math.hypot(bx - ax, by - ay), ang = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
  const unit = Math.max(W, H) / 1000, side = ((bx - ax) * (iy - ay) - (by - ay) * (ix - ax)) > 0 ? 1 : -1, depth = 46 * unit, out = 64 * unit;
  defs += `<linearGradient id="${u}fg" x1="0" y1="${side > 0 ? 0 : 1}" x2="0" y2="${side > 0 ? 1 : 0}"><stop offset="0" stop-color="#000"/><stop offset="${r1(out / (out + depth))}" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>
   <mask id="${u}f" maskUnits="userSpaceOnUse" ${big}><rect ${big} fill="#fff"/><rect x="${r1(14 * unit)}" y="${r1(side > 0 ? -out : -depth)}" width="${r1(len + 70 * unit)}" height="${r1(out + depth)}" fill="url(#${u}fg)" transform="translate(${ax} ${ay}) rotate(${r1(ang)})"/></mask>`;
  cutMaskAttr = ` mask="url(#${u}f)"`;
 }
 let fill;
 if (kind === 'country') {
  // flag box: 4:3, centred on the label anchor, covering the shape's bounding box
  const [bx, by, bw, bh] = s.bbox, onLand = ['jp', 'kr'].includes(iso2);
  const [lx, ly] = onLand ? s.label : [bx + bw / 2, by + bh / 2];
  const hw = Math.max(lx - bx, bx + bw - lx, (ly - by) * 4 / 3, (by + bh - ly) * 4 / 3) * 1.02;
  const flag = ROOT + `site-b/assets/flags/${iso2}.svg`;
  defs += `<radialGradient id="${u}s" cx=".32" cy=".2" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".55" stop-color="#fff" stop-opacity=".06"/><stop offset="1" style="stop-color:#000;stop-opacity:var(--sheen-edge)"/></radialGradient>`;
  fill = `<g clip-path="url(#${u}c)"><image href="${flag}" x="${r1(lx - hw)}" y="${r1(ly - hw * .75)}" width="${r1(2 * hw)}" height="${r1(1.5 * hw)}" preserveAspectRatio="none"/>
   <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#${u}s)"/><rect ${big} filter="url(#atlas-grain)" opacity=".55"/>
   <use href="#${u}p" style="fill:none;stroke:#000;stroke-opacity:.15;stroke-width:${px(1.6)}"/></g>`;
 } else {
  defs += `<linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--land-1)"/><stop offset=".6" style="stop-color:var(--land-2)"/><stop offset="1" style="stop-color:var(--land-3)"/></linearGradient>
   <radialGradient id="${u}s" cx=".3" cy=".2" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
  fill = `<use href="#${u}p" fill="url(#${u}g)"/><g clip-path="url(#${u}c)"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#${u}s)"/><rect ${big} filter="url(#atlas-grain)" opacity=".6"/>
   <use href="#${u}p" style="fill:none;stroke:#063F3F;stroke-opacity:.22;stroke-width:${px(2)}"/></g>`;
 }
 // the lift's shadow is cast by the already-faded shape, so a cut fades without a hard shadow edge
 body = `<g class="shape-lift"><g${cutMaskAttr}><use href="#${u}p" style="fill:var(--paper)"/></g></g>
  <g${cutMaskAttr}>
  <rect ${big} style="fill:var(--water);opacity:var(--water-strength)" mask="url(#${u}w)"/>
  <use href="#${u}p" style="fill:none;stroke:var(--coast);stroke-width:${px(2 * .9)};stroke-linejoin:round"/>
  ${fill}</g>`;
 return {svg: `<svg viewBox="${s.viewBox}" aria-hidden="true" focusable="false"><defs>${defs}</defs>${body}<g class="pins">${pinsOf(opts.pins === false ? {} : s.pins)}</g></svg>`};
}

// The validated country as a pencil plate: coast, water lines and every campus, the cursor's pin lit.
function outlineSVG(s, k, hot) {
 const u = 'o' + (++uidCounter), px = v => r1(v / k), W = s.w, H = s.h, big = `x="${-W}" y="${-H}" width="${3 * W}" height="${3 * H}"`;
 const rings = [[7, .6], [15, .3]], line = 1;
 const mask = rings.slice().reverse().map(([o, a]) => { const g = Math.round(a * 255); return `<use href="#${u}p" style="fill:none;stroke:rgb(${g},${g},${g});stroke-width:${px(2 * (o + line / 2))};stroke-linejoin:round"/><use href="#${u}p" style="fill:none;stroke:#000;stroke-width:${px(2 * (o - line / 2))};stroke-linejoin:round"/>`; }).join('');
 const pins = Object.entries(s.pins || {}).map(([id, [x, y]]) => id === hot
  ? `<circle cx="${x}" cy="${y}" r="${px(13)}" style="fill:var(--pin-glow);opacity:.55"/><circle cx="${x}" cy="${y}" r="${px(6)}" style="fill:var(--pin);stroke:var(--pin-ring);stroke-width:${px(2)}"/>`
  : `<circle cx="${x}" cy="${y}" r="${px(3.6)}" style="fill:var(--bg);stroke:var(--pin);stroke-width:${px(1.6)}"/>`).join('');
 return `<svg viewBox="${s.viewBox}" aria-hidden="true" focusable="false"><defs><path id="${u}p" d="${s.d}"/><mask id="${u}w" maskUnits="userSpaceOnUse" ${big}>${mask}</mask></defs>
  <rect ${big} style="fill:var(--water);opacity:var(--water-strength)" mask="url(#${u}w)"/>
  <use href="#${u}p" style="fill:color-mix(in srgb,var(--paper) 70%,transparent);stroke:var(--coast);stroke-width:${px(1.4)};stroke-linejoin:round"/>${pins}</svg>`;
}

// ---------------------------------------------------------------- frame
const iconUse = (id, cls = '') => `<svg aria-hidden="true"${cls ? ` class="${cls}"` : ''}><use href="#${id}"/></svg>`;
function scopeLabel(scope) {
 if (scope.level === 'continent') return continentName(scope.continent, app.lang);
 if (scope.level === 'country') return countryName(scope.country);
 if (scope.level === 'campus') return campusById.get(scope.campus)?.name;
 return {fr: 'Monde', en: 'World', ar: 'العالم'}[app.lang];
}
function renderFrame() {
 const t = T();
 html.lang = app.lang; html.dir = app.lang === 'ar' ? 'rtl' : 'ltr'; html.dataset.theme = app.theme;
 doc.title = 'Atlas chaleureux · Explorer B';
 doc.querySelectorAll('[data-copy]').forEach(el => { el.textContent = t.nav[el.dataset.copy]; });
 $('search-label').textContent = t.search; $('dice').setAttribute('aria-label', t.dice); $('profile').setAttribute('aria-label', t.account);
 $('about').textContent = t.about; $('explorer-title').textContent = t.title;
 $('scope-back').setAttribute('aria-label', t.back);
 doc.querySelector('.scope-path').setAttribute('aria-label', t.path);
 const s = app.scope, label = scopeLabel(s);
 const picker = `<li><button type="button" aria-current="page" aria-label="${esc(label)} · ${esc(t.choose)}"><span dir="auto">${esc(label)}</span>${iconUse('i-down', 'chevron')}</button></li>`;
 $('scope-trail').innerHTML = s.level === 'campus'
  ? `<li class="ancestor"><button type="button"><span dir="auto">${esc(countryName(s.country))}</span></button>${iconUse('i-down', 'sep')}</li>${picker}` : picker;
 $('scope-back').hidden = s.level === 'world' && app.list !== 'countries';
 const status = $('scope-status');
 status.hidden = s.level === 'campus';
 const inContinent = id => campuses.filter(c => continentOfCountry(c.country) === id);
 status.textContent = s.level === 'world' ? countLabel({campuses: campuses.length, countries: countries.length}, app.lang)
  : s.level === 'continent' ? countLabel({campuses: inContinent(s.continent).length, countries: countries.filter(c => continentOfCountry(c.id) === s.continent).length}, app.lang)
  : s.level === 'country' ? countLabel({campuses: campuses.filter(c => c.country === s.country).length}, app.lang) : '';
 doc.querySelectorAll('[data-group=state] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.state === app.stateKey)));
 doc.querySelectorAll('[data-group=theme] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeChoice === app.theme)));
 doc.querySelectorAll('[data-group=lang] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === app.lang)));
}
// The free band, as site-b/explorer-band.mjs measures it.
function measureBand() {
 const status = $('scope-status'), row = doc.querySelector('.scope-row');
 const topEl = !status.hidden && status.textContent ? status : row;
 const about = $('about'), aboutVisible = getComputedStyle(about).display !== 'none';
 const bottomEl = aboutVisible ? about : doc.querySelector('.dock-tools');
 const top = topEl.getBoundingClientRect().bottom + 16, bottom = innerHeight - bottomEl.getBoundingClientRect().top + 16;
 const stage = $('explorer');
 stage.style.setProperty('--band-top', Math.round(top) + 'px'); stage.style.setProperty('--band-bottom', Math.round(bottom) + 'px');
 return {top, bottom, height: innerHeight - top - bottom, width: innerWidth - 32};
}

// ---------------------------------------------------------------- level view
function currentView() {
 return buildExplorerView({scope: app.scope, list: app.list, catalog, locale: app.lang, countryName, cursorId: app.cursor});
}
function eyebrowText(view) {
 const t = T(), parent = view.parent?.kind === 'world' ? null : view.parent?.name;
 return `${view.step.index} · ${t.words[view.step.index - 1]}${parent ? ` · ${parent}` : ''}`;
}
function hintHTML() {
 const t = T();
 const key = k => k === 'arrows' ? `<span class="key">${iconUse('i-key-left')}</span><span class="key">${iconUse('i-key-right')}</span>` : `<span class="key">${esc(k)}</span>`;
 return `<span class="atlas-hint-keys">${t.hint.map(([k, txt], i) => `${i ? '<span class="sep" aria-hidden="true">·</span>' : ''}${key(k)}<span>${esc(txt)}</span>`).join('')}</span>
  <span class="atlas-hint-touch">${esc(t.touch)}</span>`;
}
function routeSVG(n, index, narrow = false) {
 const gap = narrow ? (n <= 8 ? 13 : n <= 16 ? 9 : 6) : (n <= 8 ? 18 : n <= 16 ? 13 : 9), w = (n - 1) * gap + 14, y = 7;
 let out = `<svg viewBox="0 0 ${w} 14" width="${w}" height="14"><line class="atlas-route-line" x1="7" y1="${y}" x2="${w - 7}" y2="${y}"/>`;
 for (let i = 0; i < n; i++) out += i === index ? '' : `<circle class="atlas-route-stop${i < index ? ' passed' : ''}" cx="${7 + i * gap}" cy="${y}" r="2.6"/>`;
 out += `<circle class="atlas-route-here" cx="${7 + index * gap}" cy="${y}" r="5.2"/></svg>`;
 return out;
}

function sizing(band, view) {
 const W = band.width, H = band.height, phone = innerWidth <= 700;
 const density = H < 200 ? 'compact' : H < 300 ? 'tight' : H < 440 ? 'medium' : 'full';
 const eyebrow = density === 'full' ? 33 : 27;
 const caption = density === 'full' ? 72 : 42;
 const footer = density === 'full' ? 96 : density === 'medium' ? 66 : 52;
 const maxS = phone ? Math.min(innerWidth - 118, 300) : 330;
 const S = Math.max(96, Math.min(maxS, H - eyebrow - caption - footer - 6));
 const wide = !phone && W >= 1100, mid = !phone && !wide;
 return {W, H, phone, density, S, caption, wide, mid, captionInline: density !== 'full', hideHint: density === 'tight' || (phone && density !== 'full'),
  ranks: view.level === 'campuses' ? {cursor: 1, near: phone ? .62 : .72, far: .5} : {cursor: 1, near: phone ? .5 : .56, far: .38}, gap: phone ? Math.max(14, S * .07) : Math.max(28, S * .17)};
}

async function renderLevel(view, band) {
 const t = T(), m = sizing(band, view), rtl = app.lang === 'ar';
 const cursorIndex = Math.max(0, view.items.findIndex(i => i.id === view.cursorId));
 const level = doc.createElement('div');
 level.className = 'atlas-level'; level.dataset.level = view.level; level.dataset.density = m.density;
 level.dataset.caption = m.captionInline ? 'inline' : 'stack'; if (m.hideHint) level.dataset.hint = 'hidden';
 const eyebrowId = 'atlas-eyebrow-' + view.key.replace(/[^a-z0-9]/gi, '-'), hintId = eyebrowId + '-hint';
 const isCampus = view.level === 'campuses';
 const logoInfos = isCampus ? await Promise.all(view.items.map(item => logoInfo(campusById.get(item.id)))) : [];

 // geometry of every item: rank, art size, x
 const rankOf = off => { const a = Math.abs(off); return a === 0 ? 'cursor' : a === 1 ? 'near' : a === 2 && m.wide ? 'far' : 'hidden'; };
 const geo = view.items.map((item, i) => {
  const off = i - cursorIndex, rank = rankOf(off), f = m.ranks[rank] ?? m.ranks.far, Sr = m.S * f;
  if (isCampus) {
   const info = logoInfos[i], ratio = info?.ratio || 3;
   const boxW = Sr * (m.phone ? 1.02 : 1.1), boxH = Sr * .36, area = Sr * Sr * .125;
   const ah = Math.min(boxH, boxW / ratio, Math.sqrt(area / ratio)), aw = ah * ratio;
   return {item, i, off, rank, Sr, aw, ah, w: Math.max(aw, Sr * .9)};
  }
  const sh = shapeOf(item), s = sh.s, aspectMax = m.phone ? 1.12 : 1.3;
  const k = Math.min(Sr * aspectMax / s.w, Sr / s.h);
  return {item, i, off, rank, Sr, sh, k, aw: s.w * k, ah: s.h * k, w: Math.max(s.w * k, Sr * .78)};
 });
 // x positions from the cursor outwards (mirrored in RTL)
 const dir = rtl ? -1 : 1;
 geo[cursorIndex].x = 0;
 for (let i = cursorIndex + 1; i < geo.length; i++) geo[i].x = geo[i - 1].x + dir * (geo[i - 1].w / 2 + m.gap + geo[i].w / 2);
 for (let i = cursorIndex - 1; i >= 0; i--) geo[i].x = geo[i + 1].x - dir * (geo[i + 1].w / 2 + m.gap + geo[i].w / 2);
 // phones: each neighbour shows a recognisable 46 px slice at the edge of the screen
 if (m.phone) for (const g of geo) if (g.rank === 'near') g.x = Math.sign(g.x) * (m.W / 2 + 16 - (isCampus ? 70 : 46) + g.w / 2);

 const figH = isCampus ? Math.round(m.S * .66) : m.S;
 const captionH = isCampus ? (m.captionInline ? 62 : 112) : m.caption;
 const trackH = figH + (m.density === 'compact' ? 0 : captionH);
 level.style.cssText = `--name-size:${r1(Math.max(18, Math.min(28, m.S * .1)))}px;--S:${figH}px;--track-h:${trackH}px;--caption-h:${isCampus ? captionH - 16 : m.captionInline ? 26 : 56}px;--caption-gap:${m.density === 'full' ? 16 : 12}px;--eyebrow-gap:${m.density === 'full' ? 14 : 8}px;--footer-gap:${m.density === 'full' ? 18 : 10}px;--edge-fade:${m.phone ? 14 : 120}px;--nav-spread:${Math.min(m.W / 2, (m.wide ? 1.78 : 1.4) * m.S + 30)}px`;

 const items = geo.map(g => {
  const {item, rank} = g, cursor = rank === 'cursor';
  const position = t.of(g.i + 1, view.items.length);
  const label = `${item.ariaLabel} · ${position}${cursor ? ` · ${t.chip}` : ''}`;
  let art = '', name = '';
  if (isCampus) {
   const info = logoInfos[g.i], treat = logoTreatment(info);
   art = `<span class="atlas-art" data-logo="${treat}" style="--aw:${r1(g.aw)}px;--ah:${r1(g.ah)}px;${info?.background ? `--logo-bg:${info.background}` : ''}">${info ? `<img class="atlas-logo" src="${logoSrc(info, treat)}" alt="">` : ''}</span>`;
   name = `<span class="atlas-name" dir="auto">${esc(item.name)}</span>`;
  } else {
   const s = g.sh.s;
   const opts = rank === 'cursor' ? {} : rank === 'near' ? {rings: [[4, .8], [9, .45]], pinR: 3.4, pinRing: 1.2} : {rings: [[4, .6]], pins: false};
   if (rank === 'cursor' && (item.kind === 'continent' || item.kind === 'world')) Object.assign(opts, {pinR: Object.keys(s.pins || {}).length > 12 ? 3.4 : 4.6, pinRing: 1.2});
   art = `<span class="atlas-art" style="--aw:${r1(g.aw)}px;--ah:${r1(g.ah)}px;--lift:${rank === 'cursor' ? 14 : 8}px">${artSVG(g.sh, g.k, opts).svg}</span>`;
   const lx = s.label[0] * g.k + (g.w - g.aw) / 2, ly = s.label[1] * g.k + (m.S - g.ah) / 2;
   const long = item.name.length > 14;
   name = `<span class="atlas-name${long ? ' is-long' : ''}" dir="auto" style="--lx:${r1(lx)}px;--ly:${r1(ly)}px">${esc(item.name)}</span>`;
  }
  // campuses: a tiny locator (the country with this campus pinned) replaces the pin icon
  let locator = '';
  if (isCampus && cursor) {
   const country = campusById.get(item.id).country, cs = shape('country', country), kk = (m.phone ? 48 : 58) / Math.max(cs.w, cs.h);
   locator = `<span class="atlas-locator" aria-hidden="true" style="--lw:${r1(cs.w * kk)}px;--lh:${r1(cs.h * kk)}px">${artSVG({kind: 'country', s: cs, iso2: countryById.get(country).iso2.toLowerCase()}, kk, {rings: [[2.5, .75]], line: .8, pinR: 1.5, pinRing: .7, hotPin: item.id}).svg}</span>`;
  }
  const count = isCampus ? `<span class="atlas-count">${locator || iconUse('i-pin')}${esc(item.countText)}</span>` : `<span class="atlas-count">${esc(item.countText)}</span>`;
  return `<button class="atlas-item" type="button" data-id="${esc(item.id)}" data-kind="${item.kind}" data-rank="${rank}" ${cursor ? 'data-cursor="true" tabindex="0"' : 'tabindex="-1"'}
    aria-label="${esc(label)}" style="--x:${r1(g.x - g.w / 2)}px;--w:${r1(g.w)}px">
    <span class="atlas-figure">${art}${isCampus ? '' : name}${isCampus ? name : ''}</span>
    <span class="atlas-caption">${count}<span class="atlas-chip" aria-hidden="true">${esc(t.chip)}${iconUse('i-enter')}</span></span></button>`;
 }).join('');

 // the validated country, faint, behind its campuses
 let plate = '';
 if (isCampus && showPlate && m.density !== 'compact') {
  const country = app.scope.country, s = shape('country', country);
  const ph = Math.min((figH + captionH) * 1.06, m.H - 70), k = Math.min(ph / s.h, (m.W * .9) / s.w);
  const hot = view.items[cursorIndex]?.id;
  plate = `<div class="atlas-plate" style="--plate-w:${r1(s.w * k)}px;--plate-h:${r1(s.h * k)}px;--plate-y:${r1((figH + captionH) / 2)}px">${outlineSVG(s, k, hot)}</div>`;
 }
 const lamp = m.density === 'compact' ? '' : `<div class="atlas-lamp" style="--lamp-x:50%;--lamp-y:${r1(figH / 2)}px;--lamp-w:${r1(m.S * (m.phone ? 2.3 : 3.1))}px;--lamp-h:${r1(m.S * 2)}px"></div>`;
 const navs = `<button class="atlas-nav" type="button" data-dir="prev" aria-label="${esc(t.prev)}" ${cursorIndex === 0 ? 'aria-disabled="true"' : ''}>${iconUse('i-prev')}</button>
  <button class="atlas-nav" type="button" data-dir="next" aria-label="${esc(t.next)}" ${cursorIndex === view.items.length - 1 ? 'aria-disabled="true"' : ''}>${iconUse('i-next')}</button>`;
 level.innerHTML = `<p class="atlas-eyebrow" id="${eyebrowId}"><span>${esc(eyebrowText(view))}</span></p>
  <div class="atlas-carousel" role="group" aria-roledescription="${esc(t.carousel)}" aria-labelledby="${eyebrowId}" aria-describedby="${hintId}">
   ${plate}${lamp}<div class="atlas-viewport"><div class="atlas-track">${items}</div></div></div>
  <div class="atlas-footer"><div class="atlas-route-row">${navs.split('</button>')[0]}</button>
   <div class="atlas-route" aria-hidden="true">${routeSVG(view.items.length, cursorIndex, innerWidth < 380)}<span class="atlas-route-count">${cursorIndex + 1} / ${view.items.length}</span></div>${navs.split('</button>')[1].trim()}</button></div>
   <p class="atlas-hint" id="${hintId}">${hintHTML()}</p></div>`;
 if (m.density === 'compact') {
  // compact row: every item small, in order, the cursor scrolled to the centre
  level.querySelectorAll('.atlas-item').forEach((el, i) => {
   const g = geo[i];
   el.style.cssText = ''; el.dataset.rank = g.rank === 'cursor' ? 'cursor' : 'near';
   const art = el.querySelector('.atlas-art');
   if (!isCampus) {
    const s = g.sh.s, k = Math.min(40 / s.w, 40 / s.h);
    art.style.cssText = `--aw:${r1(s.w * k)}px;--ah:${r1(s.h * k)}px;--lift:3px`;
    art.innerHTML = artSVG(g.sh, k, {rings: [[2.5, .7]], pinR: 1.6, pinRing: .6, line: .8}).svg;
   } else art.style.cssText = `--aw:56px;--ah:${r1(56 / (logoInfos[i]?.ratio || 3))}px`;
  });
 }
 return {level, cursorIndex, m};
}

// ---------------------------------------------------------------- campus entry (fiche d'atlas)
const dateText = (value, opts) => {
 const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(value || ''); if (!m) return '';
 const d = new Date(Date.UTC(+m[1], (+m[2] || 1) - 1, +m[3] || 1));
 const precision = m[3] ? 'day' : m[2] ? 'month' : 'year';
 return new Intl.DateTimeFormat(app.lang, {numberingSystem: 'latn', timeZone: 'UTC', year: 'numeric', ...(precision !== 'year' ? {month: 'long'} : {}), ...(precision === 'day' ? {day: 'numeric'} : {}), ...opts}).format(d);
};
const loc = (v) => typeof v === 'string' ? v : v?.[app.lang] || v?.fr || v?.en || '';
const ext = (href, label, cls, inner) => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(label)}. ${esc(T().newTab)}">${inner ?? esc(label)}</a>`;
function listJoin(items) { const t = T(); return items.length < 2 ? items.join('') : items.slice(0, -1).join(app.lang === 'ar' ? '، ' : ', ') + t.and + items.at(-1); }

async function renderSheet(campus, band) {
 const t = T(), p = campus.profile || {}, country = countryName(campus.country);
 const headWith = (title, link) => `<h3 class="sheet-h"><span>${esc(title)}</span>${link ? `<span class="sheet-h-link">${link}</span>` : ''}</h3>`;
 const info = await logoInfo(campus), treat = logoTreatment(info);
 const photos = (p.photos || []).filter(ph => ph?.src);
 const contacts = (p.contacts || []).filter(c => loc(c.value));
 const openingLabel = loc(p.openedLabel) || dateText(p.openedOn);
 const stats = ['students', 'cohorts', 'alumni'].map(key => { const stat = p.stats?.[key]; return {key, value: typeof stat?.value === 'number' ? numberFormat().format(stat.value) : (stat?.value || '').trim(), asOf: stat?.asOf}; });
 const hasStats = stats.some(s => s.value), sparse = !photos.length && !contacts.length && !openingLabel && !hasStats;
 const website = resolveCampusWebsite(campus, app.lang);
 const siblings = campuses.filter(c => c.country === campus.country).sort((a, b) => new Intl.Collator(app.lang).compare(a.name, b.name));
 const cshape = shape('country', campus.country), iso2 = countryById.get(campus.country).iso2.toLowerCase();

 // identity column: back, eyebrow with the country stamp, printed logo, name, almanac facts, website
 const stampK = 36 / Math.max(cshape.w, cshape.h);
 const stamp = `<span class="sheet-stamp" aria-hidden="true">${artSVG({kind: 'country', s: cshape, iso2}, stampK, {rings: [[2.5, .8]], line: .8, pinR: 2.2, pinRing: .8, pins: false}).svg}</span>`;
 let facts = '';
 if (!sparse) {
  const rows = [[t.opening, openingLabel ? `<dd>${esc(openingLabel)}</dd>` : '<dd class="missing">—</dd>'],
   ...stats.map(s => [t[s.key], s.value ? `<dd>${esc(s.value)}${s.asOf ? `<small>${esc(t.asOf)} ${esc(dateText(s.asOf))}</small>` : ''}</dd>` : '<dd class="missing">—</dd>'])];
  facts = `<h3 class="sheet-h sheet-h-glance">${esc(t.glance)}</h3><dl class="sheet-facts">${rows.map(([dt, dd]) => `<div><dt>${esc(dt)}</dt><span class="leader" aria-hidden="true"></span>${dd}</div>`).join('')}</dl>
   ${stats.some(s => !s.value) ? `<p class="sheet-fact-note" title="${esc(t.missingStats)}">${esc(t.dashLegend)}</p>` : ''}`;
 }
 const waiting = [!photos.length && 'photos', !contacts.length && 'contacts', !openingLabel && 'opening', !hasStats && 'stats'].filter(Boolean).map(k => t.waitItems[k]);
 const siteLabel = website ? (website.kind === 'campus-site' ? t.website : t.profile) : '';
 const siteLink = website ? `${ext(website.url, siteLabel + ' · ' + campus.name, 'sheet-site', `${esc(siteLabel)}${iconUse('i-external')}`)}
   ${website.isFallback && website.language ? `<p class="sheet-site-note">${esc(t.siteIn(new Intl.DisplayNames(app.lang, {type: 'language'}).of(website.language)))}</p>` : ''}` : '';
 const verified = p.verifiedAt ? `<p class="sheet-verified">${esc(t.verified)}<time datetime="${p.verifiedAt}">${esc(dateText(p.verifiedAt))}</time></p>` : '';
 const id = `<div class="sheet-head" style="--i:0">
   <button class="sheet-back" type="button" aria-label="${esc(t.campusBack(country))}">${iconUse('i-back')}${stamp}<span dir="auto">${esc(country)}</span></button>
   <p class="sr-only">${esc(t.campusEyebrow(country))}</p>
   <div class="sheet-logo" data-logo="${treat}" style="--logo-bg:${info?.background || '#fff'}">${info ? `<img src="${logoSrc(info, treat)}" alt="${esc(loc(p.logo?.alt) || campus.name)}">` : ''}</div>
   <h2 class="sheet-title" id="sheet-title" tabindex="-1"><bdi>${esc(campus.name)}</bdi></h2></div>
   <div class="sheet-body" style="--i:1">${facts}
   ${sparse ? `<p class="sheet-wait">${iconUse('i-calendar')}<span>${esc(t.wait(listJoin(waiting)))}</span></p>` : ''}
   ${siteLink}${verified}</div>`;

 // photos: prints in the atlas; without photos, the country plate with the campus pinned
 let photosHTML;
 if (photos.length) {
  const i = Math.min(app.photo, photos.length - 1), ph = photos[i], next = photos[(i + 1) % photos.length];
  const src = v => ROOT + 'site/' + v.replace(/^\.\//, '');
  photosHTML = `<div class="sheet-photos" style="--i:1"><h3 class="sr-only">${esc(t.photos)}</h3>
   <div class="sheet-print-stack">${photos.length > 1 ? `<figure class="sheet-print back" aria-hidden="true"><img src="${esc(src(next.src))}" alt=""></figure>` : ''}
    <figure class="sheet-print"><img src="${esc(src(ph.src))}" alt="${esc(loc(ph.alt))}"></figure></div>
   <div class="sheet-print-bar"><p class="sheet-credit">© ${esc(loc(ph.credit))}${ph.sourceUrl ? ` · ${ext(ph.sourceUrl, t.source, '', esc(t.source))}` : ''}</p>
    ${photos.length > 1 ? `<div class="sheet-pager"><button type="button" data-photo="-1" aria-label="${esc(t.prevPhoto)}">${iconUse('i-prev')}</button><span>${numberFormat().format(i + 1)} / ${numberFormat().format(photos.length)}</span><button type="button" data-photo="1" aria-label="${esc(t.nextPhoto)}">${iconUse('i-next')}</button></div>` : ''}</div></div>`;
 } else {
  const k = 520 / Math.max(cshape.w, cshape.h);
  photosHTML = `<div class="sheet-photos sheet-photos-empty" style="--i:1"><figure class="sheet-locator">${artSVG({kind: 'country', s: cshape, iso2}, k, {rings: [[5, .9], [11, .55], [18, .28]], pinR: 3.6, pinRing: 1.3, hotPin: campus.id}).svg}
   <figcaption>${esc(t.locator)}</figcaption></figure></div>`;
 }
 // address
 const address = (campus.address || '').trim().replace(/\r/g, '');
 const directions = new URL('https://www.google.com/maps/dir/'); directions.searchParams.set('api', '1'); directions.searchParams.set('destination', campus.name + ', ' + address.replace(/\s+/g, ' '));
 const where = `<div class="sheet-where" style="--i:2">${headWith(t.address)}${address ? `<address dir="auto">${esc(address)}</address>
   <div class="sheet-actions"><button class="pill-quiet" type="button">${iconUse('i-copy')}${esc(t.copy)}</button>${ext(directions.href, t.directions, 'pill-quiet', `${iconUse('i-route')}${esc(t.directions)}`)}</div>` : '<p class="sheet-empty-line">—</p>'}</div>`;
 // contacts: only when there are some (the sparse line already says what is missing)
 const iconFor = c => /^tel:/.test(c.href || '') ? 'i-phone' : /^mailto:/.test(c.href || '') ? 'i-mail' : 'i-form';
 const who = contacts.length ? `<div class="sheet-who" style="--i:3">${headWith(t.contacts, p.contactSourceUrl ? ext(p.contactSourceUrl, t.source, '', `${esc(t.source)}${iconUse('i-external')}`) : '')}<ul class="sheet-contacts">${contacts.map(c => `<li>${iconUse(iconFor(c))}<span class="label">${esc(loc(c.label))}</span>${c.href ? (/^https?:/.test(c.href) ? ext(c.href, loc(c.value), '', esc(loc(c.value))) : `<a href="${esc(c.href)}" dir="auto">${esc(loc(c.value))}</a>`) : `<span dir="auto">${esc(loc(c.value))}</span>`}</li>`).join('')}</ul>
   </div>` : '';
 // Piscines: calendar leaves, or the official link
 const today = Date.UTC(2026, 9, 24);
 const pis = (p.piscines || []).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.startsOn || '') && Date.parse((x.endsOn || x.startsOn) + 'T00:00:00Z') >= today);
 const leafMonth = d => new Intl.DateTimeFormat(app.lang, {month: 'short', timeZone: 'UTC'}).format(new Date(d + 'T00:00:00Z')).replace('.', '');
 const leafDay = d => numberFormat().format(+d.slice(8, 10));
 const datesHref = p.piscineSourceUrl || (!pis.length && website?.url);
 const piscines = `<div class="sheet-piscines" style="--i:4">${headWith(t.piscines, datesHref ? ext(datesHref, t.officialDates, '', `${esc(t.datesShort)}${iconUse('i-external')}`) : '')}${pis.length ? `<ul class="sheet-piscine-list">${pis.map(x => `<li><span class="leaf" aria-hidden="true"><b>${esc(leafMonth(x.startsOn))}</b><span>${leafDay(x.startsOn)}</span></span>
   <div><p class="sheet-piscine-label">${esc(loc(x.label))}</p><p class="sheet-piscine-dates"><time datetime="${x.startsOn}">${esc(dateText(x.startsOn))}</time>${x.endsOn ? ` — <time datetime="${x.endsOn}">${esc(dateText(x.endsOn))}</time>` : ''}</p></div></li>`).join('')}</ul>`
   : `<p class="sheet-empty-line">${esc(t.checkDates)}</p>`}
   ${loc(p.piscinesNote) ? `<p class="sheet-piscine-note">${esc(loc(p.piscinesNote))}</p>` : ''}
   </div>`;

 const routeButtons = siblings.map(c => `<button type="button" data-sibling="${esc(c.id)}" ${c.id === campus.id ? 'aria-current="true"' : ''}><span class="stop" aria-hidden="true"></span><span dir="auto">${esc(c.name)}</span></button>`).join('');
 const short = band.height < 480;
 const sheet = doc.createElement('section');
 sheet.className = 'atlas-sheet'; sheet.setAttribute('aria-labelledby', 'sheet-title'); sheet.dataset.band = band.height < 170 ? 'tiny' : short ? 'short' : 'normal';
 $('explorer').dataset.band = sheet.dataset.band;
 const strip = siblings.length > 1 ? `<nav class="sheet-siblings" aria-label="${esc(t.strip(country))}"><p>${esc(t.strip(country))}</p><div class="sheet-route">${routeButtons}</div></nav>` : '';
 sheet.innerHTML = `<div class="sheet-lamp" aria-hidden="true"></div>
  <div class="sheet-scroller"><div class="sheet-grid" data-sparse="${sparse}" data-contacts="${contacts.length > 0}">${id}${photosHTML}${where}${who}${piscines}
   ${short ? strip.replace('class="sheet-siblings"', 'class="sheet-siblings sheet-siblings-inline"') : ''}</div></div>
  ${short ? '' : strip}`;
 return sheet;
}

// ---------------------------------------------------------------- render + interactions
let lastLevel = null, rendering = Promise.resolve();
let renderDir = 'none';
function render({focus = false, dir = 'none'} = {}) {
 rendering = rendering.then(() => { renderDir = dir; return doRender(focus); }).catch(error => console.error(error));
 return rendering;
}
async function doRender(focus) {
 regionNames = new Intl.DisplayNames(app.lang, {type: 'region'});
 renderFrame();
 const band = measureBand();
 const host = $('atlas-view');
 let node;
 if (app.scope.level === 'campus') node = await renderSheet(campusById.get(app.scope.campus), band);
 else {
  const view = currentView(); app.cursor = view.cursorId;
  const out = await renderLevel(view, band); node = out.level; $('explorer').dataset.band = out.m.density;
  // same level, cursor moved: patch the existing nodes so the track glides instead of being rebuilt
  const current = host.querySelector('.atlas-level');
  if (renderDir === 'move' && current && current.dataset.key === view.key) {
   current.style.cssText = node.style.cssText;
   for (const sel of ['.atlas-footer', '.atlas-plate', '.atlas-lamp']) { const a = current.querySelector(sel), b = node.querySelector(sel); if (a && b) a.replaceWith(b); }
   const fresh = new Map([...node.querySelectorAll('.atlas-item')].map(el => [el.dataset.id, el]));
   current.querySelectorAll('.atlas-item').forEach(el => {
    const b = fresh.get(el.dataset.id); if (!b) return;
    for (const name of ['data-rank', 'aria-label', 'style', 'tabindex']) b.hasAttribute(name) ? el.setAttribute(name, b.getAttribute(name)) : el.removeAttribute(name);
    b.hasAttribute('data-cursor') ? el.setAttribute('data-cursor', 'true') : el.removeAttribute('data-cursor');
    el.innerHTML = b.innerHTML;
   });
   lastLevel = {view, ...out};
   if (focus) current.querySelector('[data-rank=cursor]')?.focus({preventScroll: true});
   html.dataset.ready = '1';
   return;
  }
  node.dataset.key = view.key; node.dataset.dir = renderDir;
  lastLevel = {view, ...out};
 }
 host.replaceChildren(node);
 // compact row: bring the cursor to the centre
 const compactCursor = node.querySelector('[data-density=compact] [data-rank=cursor]');
 if (compactCursor) compactCursor.scrollIntoView({block: 'nearest', inline: 'center'});
 node.querySelectorAll('.sheet-route').forEach(route => { const here = route.querySelector('[aria-current=true]'); if (here) route.scrollLeft = here.offsetLeft - route.clientWidth / 2 + here.offsetWidth / 2 * (html.dir === 'rtl' ? -1 : 1); });
 if (focus) (node.querySelector('[data-rank=cursor]') || node.querySelector('#sheet-title'))?.focus({preventScroll: true});
 html.dataset.ready = '1';
}
function announce(text) { $('announce').textContent = text; }
function moveCursor(delta, {focus = true} = {}) {
 const view = lastLevel?.view; if (!view) return;
 const i = view.items.findIndex(x => x.id === app.cursor), j = Math.max(0, Math.min(view.items.length - 1, i + delta));
 if (i === j) return;
 app.cursor = view.items[j].id; announce(`${view.items[j].name} · ${T().of(j + 1, view.items.length)}`);
 render({focus, dir: 'move'});
}
function validate(id) {
 const view = lastLevel?.view, item = view?.items.find(x => x.id === id); if (!item) return;
 app.stateKey = null; app.photo = 0;
 if (item.kind === 'world') { app.list = 'countries'; app.cursor = null; }
 else if (item.kind === 'continent') { app.scope = {level: 'continent', continent: id}; app.list = null; app.cursor = null; }
 else if (item.kind === 'country') { app.via = app.list === 'countries' ? 'world' : null; app.scope = {level: 'country', country: id}; app.list = null; app.cursor = null; }
 else if (item.kind === 'campus') { app.scope = {level: 'campus', country: campusById.get(id).country, campus: id}; }
 render({focus: true, dir: 'descend'});
}
function ascend() {
 const s = app.scope; app.stateKey = null; app.photo = 0;
 if (s.level === 'campus') { app.cursor = s.campus; app.scope = {level: 'country', country: s.country}; }
 else if (s.level === 'country') { app.cursor = s.country; if (app.via === 'world') { app.scope = {level: 'world'}; app.list = 'countries'; } else app.scope = {level: 'continent', continent: continentOfCountry(s.country)}; app.via = null; }
 else if (s.level === 'continent') { app.cursor = s.continent; app.scope = {level: 'world'}; }
 else if (app.list === 'countries') { app.cursor = 'world'; app.list = null; }
 else return false;
 render({focus: true, dir: 'ascend'}); return true;
}
$('atlas-view').addEventListener('click', event => {
 const item = event.target.closest('.atlas-item');
 if (item) { if (item.dataset.rank === 'cursor') validate(item.dataset.id); else { app.cursor = item.dataset.id; render({focus: true, dir: 'move'}); } return; }
 const nav = event.target.closest('.atlas-nav'); if (nav && nav.getAttribute('aria-disabled') !== 'true') { moveCursor(nav.dataset.dir === 'next' ? 1 : -1, {focus: false}); return; }
 if (event.target.closest('.sheet-back')) { ascend(); return; }
 const sib = event.target.closest('[data-sibling]'); if (sib) { app.scope = {...app.scope, campus: sib.dataset.sibling}; app.photo = 0; render(); return; }
 const ph = event.target.closest('[data-photo]'); if (ph) { const n = (campusById.get(app.scope.campus).profile.photos || []).length; app.photo = (app.photo + Number(ph.dataset.photo) + n) % n; render(); }
});
doc.addEventListener('keydown', event => {
 if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest?.('.study-switcher')) return;
 const rtl = app.lang === 'ar';
 if (event.key === 'Escape' || event.key === 'Backspace') { if (ascend()) event.preventDefault(); return; }
 if (app.scope.level === 'campus') return;
 const map = {ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1};
 if (event.key in map) { event.preventDefault(); moveCursor(map[event.key]); }
 else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); const n = lastLevel.view.items.length; moveCursor(event.key === 'Home' ? -n : n); }
 else if (event.key === 'Enter' && !event.target.closest?.('.atlas-item')) { event.preventDefault(); validate(app.cursor); }
});
$('scope-back').addEventListener('click', () => ascend());
$('switcher').addEventListener('click', event => {
 const b = event.target.closest('button'); if (!b) return;
 if (b.dataset.state) { app.stateKey = b.dataset.state; const st = structuredClone(STATES[b.dataset.state]); app.scope = st.scope; app.list = st.list || null; app.cursor = st.cursor || null; app.via = null; app.photo = 0; }
 if (b.dataset.themeChoice) app.theme = b.dataset.themeChoice;
 if (b.dataset.lang) app.lang = b.dataset.lang;
 render();
});
let resizeTimer = 0;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => render(), 120); });

// shared grain filter (one per document)
doc.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="atlas-grain" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" values="0 0 0 0 .5  0 0 0 0 .42  0 0 0 0 .38  0 0 0 .16 0"/></filter></svg>`);
await doc.fonts.ready;
await render();
