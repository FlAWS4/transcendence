// Figma renderer for the scenes written by dom2fig.py (Figma rebuild of 15 October 2026).
// Body of an AsyncFunction(figma, S, X): S = scene or chunk, X = context
//   X.page        target page id
//   X.parent      id of an existing frame to append into (chunks), else a new top-level frame is created
//   X.at          [x, y] position of a new top-level frame on the page
//   X.name        name of the new frame
//   X.icons       { 'i-compass': componentId, … }   sprite icons
//   X.assets      { svgRef: componentId, … }          illustrations, portraits, logos
//   X.texts       id of the « 42 · Textes » collection (FR/EN/AR) — strings are bound when present
//   X.target      optional name marker of a placeholder frame inside X.parent to fill (chunked scenes)
// Returns { id, created, stats, missing }.
const page = await figma.getNodeByIdAsync(X.page);
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const V = {}; for (const v of vars) V[v.name] = v;
const missing = { vars: {}, icons: {}, assets: {}, fonts: {}, components: {}, strings: {} };
const stats = { frames: 0, texts: 0, icons: 0, svgs: 0, placeholders: 0, strings: 0, newStrings: 0 };
// 18 Oct.: U+202F (narrow no-break space) kept by the capture: « 0 / 1 000 » (Intl.NumberFormat('fr'), report form) and
// « 5 000+ » (42 Paris). Jost has no glyph for it: Chrome (HarfBuzz, SPACE_NARROW) gives it half of Jost's own space,
// 0.15 em, without another font; Figma would take a Noto font of its choosing. The character is set in Noto Sans Regular
// and its own letter spacing brings its advance back to half of Jost's space, both measured in Figma (narrowFix).
// (String.fromCodePoint: esbuild would write String.fromCharCode as the invisible character itself, which the couriers
// must then copy exactly; the renderer holds no invisible character)
const NNBSP = String.fromCodePoint(0x202f), NARROW_FONT = { family: 'Noto Sans', style: 'Regular' }, RLM_MARK = String.fromCodePoint(0x200f);
const NOBREAK = new RegExp('[' + String.fromCodePoint(0xa0, 0x202f) + ']', 'g'), plainSpaces = s => String(s).replace(NOBREAK, ' ');
// 18 Oct. (evening): U+202F and U+00A0 travel in the call data as the visible tokens ⟦202f⟧ and ⟦00a0⟧ (make_call.py
// guard_spaces): a courier had copied U+202F as an ordinary space (call 1236). Put back before any use of S and X.
const SPACE_TOKEN = new RegExp(String.fromCodePoint(0x27e6) + '(202f|00a0)' + String.fromCodePoint(0x27e7), 'g');
(function unspace(o) { for (const k in o) { const v = o[k]; if (typeof v === 'string') { if (v.indexOf(String.fromCodePoint(0x27e6)) >= 0) o[k] = v.replace(SPACE_TOKEN, (_, h) => String.fromCodePoint(parseInt(h, 16))); } else if (v && typeof v === 'object') unspace(v); } })([S, X]);

const hex = h => { const n = h.replace('#', ''); return { r: parseInt(n.slice(0, 2), 16) / 255, g: parseInt(n.slice(2, 4), 16) / 255, b: parseInt(n.slice(4, 6), 16) / 255, a: n.length > 6 ? parseInt(n.slice(6, 8), 16) / 255 : 1 }; };
function varOf(ref) {
  const name = ref && (typeof ref.v === 'number' ? S.VN[ref.v] : ref.v);
  return name && V[name] ? V[name] : null;
}
function solid(ref) {
  if (!ref) return null;
  if (typeof ref.v === 'number') ref = { v: S.VN[ref.v] };
  if (ref.v && V[ref.v]) return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[ref.v]);
  if (ref.v) missing.vars[ref.v] = 1;
  const c = hex(ref.h || '#FF00FF');
  return { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a };
}
let bindStops = true;
function gradient(g, w, h) {
  const stops = g.st.map(([p, h2, vn]) => {
    const c = hex(h2); const s = { position: Math.max(0, Math.min(1, p)), color: { r: c.r, g: c.g, b: c.b, a: c.a } };
    const name = typeof vn === 'number' ? S.VN[vn] : vn;
    if (bindStops && name && V[name]) s.boundVariables = { color: figma.variables.createVariableAlias(V[name]) };
    else if (name && !V[name]) missing.vars[name] = 1;
    return s;
  });
  if (g.g === 'L') {
    // CSS: 0deg points up, clockwise; gradient line through the centre, length |w·sinθ| + |h·cosθ|.
    const a0 = (g.a === undefined ? 180 : g.a) * Math.PI / 180;
    const L = Math.abs(w * Math.sin(a0)) + Math.abs(h * Math.cos(a0)) || 1;
    const A = w * Math.sin(a0) / L, B = -h * Math.cos(a0) / L;
    return { type: 'GRADIENT_LINEAR', gradientStops: stops, gradientTransform: [[A, B, 0.5 - 0.5 * A - 0.5 * B], [-B, A, 0.5 + 0.5 * B - 0.5 * A]] };
  }
  // CSS default ellipse, farthest-corner: farthest-side radii scaled by √2. 18 Oct.: g.sz « cs » for an ellipse
  // closest-side (mask of the globe's blurred edge, globe-framing.css)
  const [cx, cy] = g.c || [0.5, 0.5];
  const rx = (g.sz === 'cs' ? Math.min(cx, 1 - cx) * w : Math.max(cx, 1 - cx) * w * Math.SQRT2) || 1;
  const ry = (g.sz === 'cs' ? Math.min(cy, 1 - cy) * h : Math.max(cy, 1 - cy) * h * Math.SQRT2) || 1;
  return { type: 'GRADIENT_RADIAL', gradientStops: stops, gradientTransform: [[w / (2 * rx), 0, 0.5 - cx * w / (2 * rx)], [0, h / (2 * ry), 0.5 - cy * h / (2 * ry)]] };
}
function paints(list, w, h) {
  const out = [];
  for (const p of list || []) {
    if (p.g) { try { out.push(gradient(p, w, h)); } catch (e) { } }
    else if (p.url) { }
    else { const s = solid(p); if (s) out.push(s); }
  }
  return out;
}
// 18 Oct.: scene keys of the shadow fields that change with the theme (dom2fig.effect_vars) → VariableBindableEffectField
const EF = { x: 'offsetX', y: 'offsetY', b: 'radius', s: 'spread' };
function effects(list) {
  const out = [];
  for (const e of list || []) {
    if (e.t === 'B') { out.push({ type: 'BACKGROUND_BLUR', radius: e.b, visible: true }); continue; }
    if (e.t === 'L') { out.push({ type: 'LAYER_BLUR', radius: e.b, visible: true }); continue; }
    const c = e.c && e.c.h ? hex(e.c.h) : (e.c && e.c.v && V[e.c.v] ? { r: 0, g: 0, b: 0, a: 0.2 } : { r: 0, g: 0, b: 0, a: 0.2 });
    let fx = { type: e.t === 'I' ? 'INNER_SHADOW' : 'DROP_SHADOW', color: c, offset: { x: e.x, y: e.y }, radius: e.b, spread: e.s || 0, visible: true, blendMode: 'NORMAL' };
    if (e.t !== 'I') fx.showShadowBehindNode = false;  // only drop shadows accept this key
    const ev = e.c && (typeof e.c.v === 'number' ? S.VN[e.c.v] : e.c.v);
    if (ev && V[ev]) { try { fx = figma.variables.setBoundVariableForEffect(fx, 'color', V[ev]); } catch (err) { } }
    // 18 Oct.: offset, blur or spread of the dark theme: FLOAT variable Clair / Sombre of « 42 · Couleurs », resolved
    // in the mode of the frame (the clones in « Sombre » take the dark geometry). A missing or refused variable is
    // reported (missing.vars, stats.effectVarErrors), never silently left at the light value.
    for (const k in e.gv || {}) {
      const name = typeof e.gv[k].v === 'number' ? S.VN[e.gv[k].v] : e.gv[k].v;
      if (!V[name]) { missing.vars[name] = 1; continue; }
      try { fx = figma.variables.setBoundVariableForEffect(fx, EF[k], V[name]); stats.effectVars = (stats.effectVars || 0) + 1; }
      catch (err) { missing.vars[name] = 1; stats.effectVarErrors = (stats.effectVarErrors || 0) + 1; }
    }
    out.push(fx);
  }
  return out;
}

// Fonts: load everything the scene uses, plus the Arabic face for right-to-left runs.
const fonts = new Map();
const JOBS = S.library ? [] : (S.jobs || [S]);
function walkFonts(list) { for (const n of list || []) { if (n.t === 'T' && typeof n.fn === 'number') n.fn = S.FN[n.fn]; if (n.t === 'T' && n.sv && n.sv.en !== undefined && n.sv.fr === undefined) n.sv.fr = n.tx; if (n.t === 'T') { fonts.set(n.fn.join('|'), { family: n.fn[0], style: n.fn[1] }); if (n.rtl) fonts.set('Noto Sans Arabic|' + arStyle(n.fn[1]), { family: 'Noto Sans Arabic', style: arStyle(n.fn[1]) }); if ([n.tx, ...(n.sv ? [n.sv.fr, n.sv.en, n.sv.ar] : [])].some(s => typeof s === 'string' && s.includes(NNBSP))) fonts.set('Noto Sans|Regular', NARROW_FONT); } walkFonts(n.ch); } }
// shared styles (16 Oct.): nodes carrying k take their properties from the per-call table S.ST
function expand(list) { for (const n of list || []) { if (n.k !== undefined && S.ST) { Object.assign(n, S.ST[n.k]); delete n.k; } expand(n.ch); } }
for (const J of JOBS) for (const [, list] of (J.ops || [[null, J.ch]])) expand(list);
for (const J of JOBS) for (const [, list] of (J.ops || [[null, J.ch]])) walkFonts(list);
// 18 Oct.: a library call (components.py) carries the variants of component sets instead of screens
if (S.library) for (const fam of S.library) for (const v of fam.variants) { expand([v.node]); walkFonts([v.node]); }
// the browser only has Noto Sans Arabic Regular: weights up to 500 render Regular, heavier ones a synthetic bold
function arStyle(s) { const b = s.replace(' Italic', '').replace('Italic', 'Regular'); return ['SemiBold', 'Bold', 'ExtraBold', 'Black'].includes(b) ? 'Bold' : 'Regular'; }
await Promise.all([...fonts.values()].map(f => figma.loadFontAsync(f).catch(() => { missing.fonts[f.family + ' ' + f.style] = 1; })));

// Strings: one STRING variable per FR/EN/AR triple, modes Français / English / العربية.
let textColl = null, modes = null;
if (X.texts) { textColl = await figma.variables.getVariableCollectionByIdAsync(X.texts); modes = {}; for (const m of textColl.modes) modes[m.name] = m.modeId; }
// 18 Oct.: a value change lays out every text bound to the variable: a font Figma asks for is loaded first, as in bindText
async function setStringValues(v, sv) {
  for (const [m, val] of [['Français', sv.fr], ['English', sv.en], ['العربية', sv.ar]]) {
    if (v.valuesByMode[modes[m]] === val) continue;
    for (let i = 0; ; i++) {
      try { v.setValueForMode(modes[m], val); break; }
      catch (e) { const msg = String((e && e.message) || e); const f = i < 3 && (/family:\s*"([^"]+)",\s*style:\s*"([^"]+)"/.exec(msg) || /unloaded font "([^"]*) ([^" ]+)"/.exec(msg)); if (!f) throw e; await figma.loadFontAsync({ family: f[1], style: f[2] }); }
    }
  }
}
async function stringVar(sv) {
  if (!textColl) return null;
  // 18 Oct.: a text variable sent by name only must exist already (strings calls first): a miss is reported apart
  if (!('fr' in sv)) { const v = V[sv.n]; if (v && v.variableCollectionId === textColl.id) return v; missing.strings[sv.n] = 1; return null; }
  let name = sv.n, k = 1;
  while (V[name] && V[name].variableCollectionId === textColl.id) {
    const v = V[name];
    const same = v.valuesByMode[modes['Français']] === sv.fr && v.valuesByMode[modes['English']] === sv.en && v.valuesByMode[modes['العربية']] === sv.ar;
    if (same) return v;
    // 17 Oct.: the same triple whose Arabic text now opens with a right-to-left mark: updated in place (18 Oct.: through
    // setStringValues, which loads a font Figma asks for while laying out the texts bound to the variable)
    if (v.valuesByMode[modes['Français']] === sv.fr && v.valuesByMode[modes['English']] === sv.en && RLM_MARK + v.valuesByMode[modes['العربية']] === sv.ar) { await setStringValues(v, sv); stats.updatedStrings = (stats.updatedStrings || 0) + 1; return v; }
    // 18 Oct.: the same triple whose no-break spaces (U+00A0, U+202F) were ordinary spaces in an earlier capture (or the
    // reverse): updated in place, no « (2) » variable
    if (plainSpaces(v.valuesByMode[modes['Français']]) === plainSpaces(sv.fr) && plainSpaces(v.valuesByMode[modes['English']]) === plainSpaces(sv.en) && plainSpaces(v.valuesByMode[modes['العربية']]) === plainSpaces(sv.ar)) { await setStringValues(v, sv); stats.updatedStrings = (stats.updatedStrings || 0) + 1; return v; }
    k += 1; name = sv.n + ' (' + k + ')';
  }
  const v = figma.variables.createVariable(name, textColl, 'STRING');
  v.setValueForMode(modes['Français'], sv.fr); v.setValueForMode(modes['English'], sv.en); v.setValueForMode(modes['العربية'], sv.ar);
  v.scopes = ['TEXT_CONTENT'];
  V[name] = v; stats.newStrings++;
  return v;
}

const created = [];
// Text styles, created on demand and named by role: Titres / Sous-titres / Corps / Libellés / Petits / Arabe / Code.
const TS = {}; for (const s of await figma.getLocalTextStylesAsync()) TS[s.name] = s;
const r2 = v => Math.round(v * 100) / 100;
function tsName(fam, style, fs, lh, ls, tc) {
  const cat = fam === 'Noto Sans Arabic' ? 'Arabe' : (fam === 'IBM Plex Mono' || fam === 'Cousine') ? 'Code' : fs >= 24 ? 'Titres' : fs >= 18 ? 'Sous-titres' : fs >= 15 ? 'Corps' : fs >= 13 ? 'Libellés' : 'Petits';
  let n = cat + '/' + r2(fs) + ' · ' + style + (lh ? ' · ' + r2(lh) : '') + (ls ? ' · ' + (ls > 0 ? '+' : '') + r2(ls) : '') + (tc === 'UPPER' ? ' · capitales' : '');
  return n;
}
function textStyle(fam, style, fs, lh, ls, tc) {
  const name = tsName(fam, style, fs, lh, ls, tc);
  let s = TS[name];
  if (!s) {
    s = figma.createTextStyle(); s.name = name; s.fontName = { family: fam, style }; s.fontSize = fs;
    s.lineHeight = lh ? { value: lh, unit: 'PIXELS' } : { unit: 'AUTO' };
    s.letterSpacing = { value: ls || 0, unit: 'PIXELS' };
    if (tc) s.textCase = tc;
    TS[name] = s; stats.newStyles = (stats.newStyles || 0) + 1;
  }
  return s;
}
// Arabic ranges built with String.fromCodePoint: neither a literal Arabic character nor a \\u escape reaches the call
// (couriers wrote the escapes back as characters, call 980; invisible characters made one refuse, call 979)
const ARABIC = new RegExp('[' + String.fromCodePoint(0x0600) + '-' + String.fromCodePoint(0x06ff) + String.fromCodePoint(0x0750) + '-' + String.fromCodePoint(0x077f) + String.fromCodePoint(0x08a0) + '-' + String.fromCodePoint(0x08ff) + String.fromCodePoint(0xfb50) + '-' + String.fromCodePoint(0xfdff) + String.fromCodePoint(0xfe70) + '-' + String.fromCodePoint(0xfeff) + ']+', 'g');
function place(node, n) { node.x = n.x; node.y = n.y; }
// rotation or mirror of the element's CSS transform (16 Oct.): n.tf = [a, b, c, d] without the scale, about the centre
// of the measured box
function turn(node, n) {
  if (!n.tf) return;
  const [a, b, c, d] = n.tf, w = node.width, h = node.height, cx = n.x + n.w / 2, cy = n.y + n.h / 2;
  node.relativeTransform = [[a, c, cx - (a * w + c * h) / 2], [b, d, cy - (b * w + d * h) / 2]];
}
// a text that must keep the browser's number of lines (16 Oct.): width moved by 0.25 px steps between the longest
// measured line (n.wmin) and the box + 2 px (n.wmax) until Figma breaks it into n.nl lines
function fitLines(t, n) {
  let h1 = t.lineHeight && t.lineHeight.unit === 'PIXELS' ? t.lineHeight.value : 0;
  if (!h1) { const w = t.width; t.textAutoResize = 'WIDTH_AND_HEIGHT'; h1 = t.height; t.textAutoResize = 'HEIGHT'; t.resize(w, t.height); }
  if (!(h1 > 0)) return;
  const lines = () => Math.round(t.height / h1);
  let w = t.width, c = lines();
  if (c === n.nl) return;
  const step = c > n.nl ? 0.25 : -0.25, lo = n.wmin || w - 20, hi = n.wmax || w + 2;
  for (let i = 0; i < 80; i++) {
    const nw = w + step;
    if (nw > hi || nw < lo) break;
    t.resize(nw, t.height); w = nw; c = lines();
    if (step > 0 ? c <= n.nl : c >= n.nl) break;
  }
  stats.fitted = (stats.fitted || 0) + 1;
}

// 18 Oct.: binding a string variable lays out the text of its mode; when a character lacks a glyph in the node's
// fonts, Figma may ask for its own fallback font (« Noto Sans Symbols2 », mobile project page in Arabic): that font
// is loaded and counted in stats.fallbackFonts, then the binding is made again
async function bindText(t, v) {
  for (let i = 0; ; i++) {
    try { t.setBoundVariable('characters', v); return true; }
    catch (e) {
      const msg = String((e && e.message) || e);
      const m = i < 3 && (/family:\s*"([^"]+)",\s*style:\s*"([^"]+)"/.exec(msg) || /unloaded font "([^"]*) ([^" ]+)"/.exec(msg));
      if (!m) throw e;
      await figma.loadFontAsync({ family: m[1], style: m[2] });
      const f = stats.fallbackFonts = stats.fallbackFonts || {}; f[m[1] + ' ' + m[2]] = (f[m[1] + ' ' + m[2]] || 0) + 1;
    }
  }
}

// 17 Oct.: an outlined icon filled in its active state (« J'aime » pressed): every shape takes the fill colour
function fillIcon(inst, n) {
  const fp = n.fc ? solid(n.fc) : null;
  if (fp) for (const v of inst.findAllWithCriteria({ types: ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'POLYGON', 'STAR', 'BOOLEAN_OPERATION'] })) v.fills = [fp];
}
// 18 Oct.: a fixed or sticky layer (n.fx, n.sk). scrollBehavior is not in the typings of the Plugin API 1.142 (only
// overflowDirection and numberOfFixedChildren): the assignment is kept, but one that throws or does not hold is counted
// (stats.scrollErrors), to be checked in Figma
function scrollWith(node, n) {
  const want = n.fx ? 'FIXED' : 'STICKY_SCROLLS';
  let ok = false;
  // 18 Oct.: scrollBehavior is not in the typings (1.142): only set where the node has it, the rest is counted
  try { if ('scrollBehavior' in node) { node.scrollBehavior = want; ok = node.scrollBehavior === want; } } catch (e) { }
  if (!ok) stats.scrollErrors = (stats.scrollErrors || 0) + 1;
}

// ⟦espaces⟧ (only in the calls of scenes holding a U+202F: make_call.py, build_renderer.cjs --no-narrow)
// 18 Oct.: half of Figma's Jost space minus Figma's advance of U+202F set in Noto Sans: the letter spacing that gives the
// narrow space the 0.15 em Chrome draws (one measure per font and size, temporary texts removed at once)
const NARROW = {};
function narrowFix(fn, fs) {
  const key = fn.join('|') + '|' + fs;
  if (!(key in NARROW)) {
    const width = (s, at) => { const t = figma.createText(); t.fontName = { family: fn[0], style: fn[1] }; t.fontSize = fs; t.characters = s; t.textAutoResize = 'WIDTH_AND_HEIGHT'; if (at >= 0) t.setRangeFontName(at, at + 1, NARROW_FONT); const w = t.width; t.remove(); return w; };
    const w00 = width('00', -1);
    NARROW[key] = (width('0 0', -1) - w00) / 2 - (width('0' + NNBSP + '0', 1) - w00);
    stats.narrowFix = Object.assign(stats.narrowFix || {}, { [key]: Math.round(NARROW[key] * 1000) / 1000 });
  }
  return NARROW[key];
}
function narrowSpaces(t, n) {
  if (n.fn[0] !== 'Jost' || !n.tx.includes(NNBSP)) return;
  const d = narrowFix(n.fn, n.fs);
  for (let i = n.tx.indexOf(NNBSP); i >= 0; i = n.tx.indexOf(NNBSP, i + 1)) {
    t.setRangeFontName(i, i + 1, NARROW_FONT);
    t.setRangeLetterSpacing(i, i + 1, { value: (n.ls || 0) + d, unit: 'PIXELS' });
    stats.narrowSpaces = (stats.narrowSpaces || 0) + 1;
  }
}
// ⟦/espaces⟧
async function build(n, parent) {
  if (n.t === 'T' && n.fs < 1) {
    // 18 Oct.: a text below Figma's minimum size of 1 (labels of the markers of the docked globe: 14 px × 0.06): set Z
    // times larger (no text style), outlined, then scaled back by 1/Z about its measured position, its colour bound again.
    // 18 Oct.: Z is at most 100, rescale taking no factor below 0.01; a text under 0.01 px, which no size of Figma can
    // hold, is left out and counted (stats.tinySkipped). A glyph squeezed by n.sx comes back outlined already: it is
    // scaled back the same way. The outline takes the text's opacity again.
    const Z = Math.min(100, Math.ceil(8 / n.fs)), k = v => (typeof v === 'number' ? v * Z : v);
    if (!(n.fs * Z >= 1)) { stats.tinySkipped = (stats.tinySkipped || 0) + 1; return null; }
    const t = await build(Object.assign({}, n, { fs: n.fs * Z, lh: k(n.lh), ls: k(n.ls), w: k(n.w), wmin: k(n.wmin), wmax: k(n.wmax), sv: undefined, tiny: 1 }), parent);
    const outlined = t.type !== 'TEXT';
    const v = outlined ? t : figma.flatten([t], parent), vx = v.x, vy = v.y;
    v.rescale(1 / Z); v.x = n.x + (vx - n.x) / Z; v.y = n.y + (vy - n.y) / Z;
    if (!outlined) {
      const cv = varOf(n.col);
      if (cv) { try { const rv = cv.resolveForConsumer(v).value; v.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: rv.r, g: rv.g, b: rv.b } }, 'color', cv)]; } catch (e) { } }
      if (n.o !== undefined) v.opacity = n.o;
    }
    v.name = (outlined ? v.name : n.tx) + ' · vectorisé ×1/' + Z; stats.tinyTexts = (stats.tinyTexts || 0) + 1;
    return v;
  }
  if (n.t === 'T') {
    const t = figma.createText();
    parent.appendChild(t);
    t.fontName = { family: n.fn[0], style: n.fn[1] };
    t.fontSize = n.fs;
    t.characters = n.tx;
    if (n.lh) t.lineHeight = { value: n.lh, unit: 'PIXELS' };
    if (n.ls) t.letterSpacing = { value: n.ls, unit: 'PIXELS' };
    if (n.tc) t.textCase = n.tc;
    if (n.td) t.textDecoration = n.td;
    t.textAlignHorizontal = n.al || 'LEFT';
    const p = solid(n.col); if (p) t.fills = [p];
    let base = n.tiny ? null : textStyle(n.fn[0], n.fn[1], n.fs, n.lh, n.ls, n.tc);
    if (n.tn && base) {
      // 18 Oct.: tabular figures. The Plugin API cannot turn the OpenType feature on: the user made these styles by hand
      // (« … · chiffres tabulaires »); one that does not exist is reported, never created
      const tn = TS[tsName(n.fn[0], n.fn[1], n.fs, n.lh, n.ls, n.tc) + ' · chiffres tabulaires'];
      if (tn) { base = tn; stats.tabular = (stats.tabular || 0) + 1; } else missing.tabular = Object.assign(missing.tabular || {}, { [tsName(n.fn[0], n.fn[1], n.fs, n.lh, n.ls, n.tc) + ' · chiffres tabulaires']: 1 });
    }
    if (base) await t.setTextStyleIdAsync(base.id);
    if (n.rtl) { let m; ARABIC.lastIndex = 0; const st = arStyle(n.fn[1]); const ars = n.tiny ? null : textStyle('Noto Sans Arabic', st, n.fs, n.lh, 0, null); while ((m = ARABIC.exec(n.tx))) { if (ars) await t.setRangeTextStyleIdAsync(m.index, m.index + m[0].length, ars.id); else t.setRangeFontName(m.index, m.index + m[0].length, { family: 'Noto Sans Arabic', style: st }); } }
    if (typeof narrowSpaces === 'function') narrowSpaces(t, n);
    if (n.td) t.textDecoration = n.td;
    // 18 Oct.: decoration colour (bound to its variable: Figma keeps the binding, checked on a temporary text),
    // offset and thickness as on the site
    if (n.td && (n.tdc || n.tdo !== undefined || n.tdw !== undefined)) {
      const dp = n.tdc ? solid(n.tdc) : null;
      if (dp) t.textDecorationColor = { value: dp };
      if (n.tdo !== undefined) t.textDecorationOffset = { value: n.tdo, unit: 'PIXELS' };
      if (n.tdw !== undefined) t.textDecorationThickness = { value: n.tdw, unit: 'PIXELS' };
      stats.decorations = (stats.decorations || 0) + 1;
    }
    // 18 Oct.: an underline skips the descenders, as Chrome's text-decoration-skip-ink: auto (n.tsk = 0: none)
    if (n.td === 'UNDERLINE') { try { t.textDecorationSkipInk = n.tsk !== 0; } catch (e) { stats.skipInkErrors = (stats.skipInkErrors || 0) + 1; } }
    // n.aw (16 Oct.): one line that must never wrap; its box (x, w) is the measured line, the alignment places it
    if (n.w && !n.aw) { t.textAutoResize = 'HEIGHT'; t.resize(Math.max(1, n.w), t.height); }
    else t.textAutoResize = 'WIDTH_AND_HEIGHT';
    if (n.ml) { t.textTruncation = 'ENDING'; t.maxLines = n.ml; }
    if (n.sv) { const v = await stringVar(n.sv); if (v && await bindText(t, v)) stats.strings++; }
    if (n.nl && n.w && !n.aw && (!n.ml || n.nl < n.ml)) fitLines(t, n);   // 18 Oct.: also a clamped text on fewer lines than its clamp
    t.name = n.tx.length > 40 ? n.tx.slice(0, 40) + '…' : n.tx;
    if (n.o !== undefined) t.opacity = n.o;
    place(t, n); stats.texts++;
    if (n.aw && n.w) {
      if (t.textAlignHorizontal === 'CENTER') t.x = n.x + (n.w - t.width) / 2;
      else if (t.textAlignHorizontal === 'RIGHT') t.x = n.x + n.w - t.width;
    } else if (n.nl && n.w && Math.abs(t.width - n.w) > 0.01 && !n.tf) {
      // 17 Oct.: a paragraph widened by fitLines keeps its right edge (right-aligned) or its centre
      if (t.textAlignHorizontal === 'RIGHT') t.x = n.x + n.w - t.width;
      else if (t.textAlignHorizontal === 'CENTER') t.x = n.x + (n.w - t.width) / 2;
    }
    if (n.sx) {
      // glyph squeezed into its cell by the site's canvas (scaleX): outlined, then narrowed around the cell centre
      const cx = n.x + (n.w || t.width) / 2;
      const v = figma.flatten([t], parent);
      const x0 = v.x;
      v.resize(Math.max(0.01, v.width * n.sx), Math.max(0.01, v.height));
      v.x = cx + (x0 - cx) * n.sx;
      // the outline takes the colour variable again; its base colour is the value resolved in this frame's mode, so
      // the glyph keeps the right colour even where the vector shows the base colour (black in light frames, 16 Oct.)
      const cv = varOf(n.col);
      if (cv) { try { const rv = cv.resolveForConsumer(v).value; v.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: rv.r, g: rv.g, b: rv.b } }, 'color', cv)]; } catch (e) { if (p) v.fills = [p]; } }
      else if (p) v.fills = [p];
      if (n.o !== undefined) v.opacity = n.o;
      v.name = n.tx + ' · resserré ×' + n.sx;
      return v;
    }
    return t;
  }
  if (n.t === 'C') {
    // 18 Oct.: instance of a library variant (components.py). The occurrence was identical to the variant, the words
    // of its texts in the three languages included, so nothing is overridden: the instance keeps the variables of its
    // main component and reads the same in every mode of the frame
    const cid = X.components && X.components[n.c] && X.components[n.c][n.v];
    const comp = cid ? await figma.getNodeByIdAsync(cid) : null;
    if (!comp) { missing.components[n.c + ' · ' + n.v] = 1; const r = figma.createFrame(); parent.appendChild(r); r.resize(n.w, n.h); r.fills = []; r.name = (n.n || n.c) + ' (composant absent)'; place(r, n); return r; }
    const inst = comp.createInstance(); parent.appendChild(inst);
    if (Math.abs(inst.width - n.w) > 0.05 || Math.abs(inst.height - n.h) > 0.05) { stats.drift = (stats.drift || 0) + 1; inst.resize(n.w, n.h); }
    if (n.n) inst.name = n.n;
    if (n.fx || n.sk) scrollWith(inst, n);
    place(inst, n); turn(inst, n); stats.instances = (stats.instances || 0) + 1;
    return inst;
  }
  if (n.t === 'I') {
    const cid = X.icons && X.icons[n.id];
    const comp = cid ? await figma.getNodeByIdAsync(cid) : null;
    if (!comp) { missing.icons[n.id] = 1; const r = figma.createFrame(); parent.appendChild(r); r.resize(n.w, n.h); r.fills = []; r.name = n.n + ' (absente)'; place(r, n); return r; }
    const inst = comp.createInstance(); parent.appendChild(inst);
    inst.rescale(n.w / comp.width);
    if (Math.abs(inst.height - n.h) > 0.5) inst.resize(n.w, n.h);
    const p = solid(n.col);
    if (p) for (const v of inst.findAllWithCriteria({ types: ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'LINE', 'POLYGON', 'STAR', 'BOOLEAN_OPERATION'] })) {
      if (v.strokes && v.strokes.length) v.strokes = [p];
      if (v.fills && v.fills.length) v.fills = [p];
    }
    fillIcon(inst, n);
    if (n.o !== undefined) inst.opacity = n.o;
    inst.name = n.n; place(inst, n); turn(inst, n); stats.icons++;
    return inst;
  }
  if (n.t === 'V') {
    // 18 Oct.: a shape Chrome draws itself (the resize grip of a <textarea>, dom2fig.resizer_grip): its exact device
    // pixels as one vector (path data relative to the layer's top-left corner, commands M L Z), filled with its colour
    // variable, no stroke
    const v = figma.createVector(); parent.appendChild(v);
    v.vectorPaths = [{ windingRule: 'NONZERO', data: n.d }];
    const p = solid(n.col); v.fills = p ? [p] : []; v.strokes = [];
    if (n.o !== undefined) v.opacity = n.o;
    v.name = n.n; place(v, n); stats.vectors = (stats.vectors || 0) + 1;
    return v;
  }
  if (n.t === 'S' || n.t === 'P') {
    const key = n.t === 'S' ? n.ref : n.src;
    const cid = X.assets && (X.assets[key] || X.assets['file:' + key]);
    const comp = cid ? await figma.getNodeByIdAsync(cid) : null;
    if (comp) {
      const inst = comp.createInstance();
      const k = n.w / comp.width, kh = n.h / comp.height;
      let node = inst;
      // a rounded image (border-radius, e.g. the portraits of Profils, 16 Oct.) always goes through the clipping box
      if (Math.abs(k - kh) / Math.max(k, kh) < 0.02 && !n.r) { parent.appendChild(inst); inst.rescale(k); }
      else {
        // like preserveAspectRatio slice / object-fit cover: scale to cover, centre, clip; object-fit contain (n.fit,
        // 16 Oct.): scale to fit inside, centred
        const box = figma.createFrame(); parent.appendChild(box); box.resize(n.w, n.h); box.fills = []; box.clipsContent = true;
        box.appendChild(inst); const kk = n.fit === 'contain' ? Math.min(k, kh) : Math.max(k, kh); inst.rescale(kk);
        // 18 Oct.: an <svg> letterboxed by preserveAspectRatio meet shows what lies outside its viewBox up to its own
        // box (the circles of the viewer's illustration on mobile, Projets v5 P6): only the box clips
        if (n.t === 'S' && n.fit === 'contain') { try { inst.clipsContent = false; stats.unclipped = (stats.unclipped || 0) + 1; } catch (e) { stats.clipErrors = (stats.clipErrors || 0) + 1; } }
        inst.x = (n.w - inst.width) / 2; inst.y = (n.h - inst.height) / 2; node = box;
        if (n.r) { if (Array.isArray(n.r)) { box.topLeftRadius = n.r[0]; box.topRightRadius = n.r[1]; box.bottomRightRadius = n.r[2]; box.bottomLeftRadius = n.r[3]; } else box.cornerRadius = n.r; }
        if (n.s) {
          // the image's own border (avatars of the team, 16 Oct., evening), drawn inside the clipping box
          const sp = solid(n.s); if (sp) { box.strokes = [sp]; box.strokeAlign = 'INSIDE'; box.strokeWeight = Array.isArray(n.sw) ? Math.max(...n.sw) : (n.sw || 1); }
        }
      }
      if (n.col) { const p = solid(n.col); if (p) for (const v of inst.findAllWithCriteria({ types: ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'LINE', 'POLYGON', 'STAR', 'BOOLEAN_OPERATION'] })) { if (v.strokes && v.strokes.length) v.strokes = [p]; if (v.fills && v.fills.length) v.fills = [p]; } }
      fillIcon(inst, n);
      node.name = n.n; place(node, n); turn(node, n);
      if (n.o !== undefined) node.opacity = n.o;
      if (n.e) node.effects = effects(n.e);   // 18 Oct.: the blurred copy of the globe under the mask of its edge
      stats.svgs++; return node;
    }
    const r = figma.createFrame(); parent.appendChild(r); r.resize(Math.max(1, n.w), Math.max(1, n.h));
    // 16 Oct.: images already in the file (photos, street maps sent by upload_assets) are laid by their hash
    const ih = IMG[key] || IMG['file:' + key];
    if (ih) {
      r.fills = [{ type: 'IMAGE', imageHash: ih, scaleMode: n.fit === 'contain' ? 'FIT' : 'FILL' }];
      r.name = key === 'canvas' ? 'Plan du campus · carte du site' : n.n;
      stats.images = (stats.images || 0) + 1;
    } else {
      missing.assets[key] = 1;
      r.name = n.n + ' · à remplacer';
      let f; try { f = paints(n.f, n.w, n.h); r.fills = f.length ? f : [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 0.9 }, opacity: 0.6 }]; } catch (e) { bindStops = false; f = paints(n.f, n.w, n.h); r.fills = f.length ? f : []; }
    }
    if (n.r) { if (Array.isArray(n.r)) { [r.topLeftRadius, r.topRightRadius, r.bottomRightRadius, r.bottomLeftRadius] = n.r; } else r.cornerRadius = n.r; }
    place(r, n); stats.placeholders++;
    return r;
  }
  // frame
  const f = figma.createFrame();
  parent.appendChild(f);
  f.name = n.n || 'Bloc';
  f.resize(Math.max(0.01, n.w), Math.max(0.01, n.h));
  try { f.fills = paints(n.f, n.w, n.h); } catch (e) { bindStops = false; stats.unboundGradients = 1; f.fills = paints(n.f, n.w, n.h); }
  // Figma draws the spread of a shadow only on rectangles, ellipses, and frames that clip their content and have a
  // fill (16 Oct.): a leaf frame clips (nothing to cut); a frame with children gets a backing rectangle (below)
  const spread = (n.e || []).some(e => (e.t === 'D' || e.t === 'I') && e.s);
  const leaf = !(n.ch || []).length;
  f.clipsContent = !!n.c || (spread && leaf && f.fills.length > 0);
  if (n.s) {
    const p = solid(n.s); if (p) f.strokes = [p];
    f.strokeAlign = 'INSIDE';
    if (Array.isArray(n.sw)) { f.strokeTopWeight = n.sw[0]; f.strokeRightWeight = n.sw[1]; f.strokeBottomWeight = n.sw[2]; f.strokeLeftWeight = n.sw[3]; }
    else f.strokeWeight = n.sw;
    if (n.sd) f.dashPattern = n.sd === 'dotted' ? [1, 2] : [4, 4];
  }
  if (n.r) { if (Array.isArray(n.r)) { f.topLeftRadius = n.r[0]; f.topRightRadius = n.r[1]; f.bottomRightRadius = n.r[2]; f.bottomLeftRadius = n.r[3]; } else f.cornerRadius = n.r; }
  if (n.e) f.effects = effects(n.e);
  if (n.o !== undefined) f.opacity = n.o;
  if (n.hole && !n.al) {
    // background with a round hole (CSS mask of the entrance veil, of the scope path's glass): the paints move to a
    // rectangle minus a circle; the rectangle keeps the frame's radii (16 Oct.), so a pill keeps its round ends
    const [hx, hy, hr] = n.hole;
    const rect = figma.createRectangle(); f.appendChild(rect); rect.resize(Math.max(0.01, n.w), Math.max(0.01, n.h)); rect.x = 0; rect.y = 0;
    if (n.r) { if (Array.isArray(n.r)) { rect.topLeftRadius = n.r[0]; rect.topRightRadius = n.r[1]; rect.bottomRightRadius = n.r[2]; rect.bottomLeftRadius = n.r[3]; } else rect.cornerRadius = n.r; }
    const ell = figma.createEllipse(); f.appendChild(ell); ell.resize(Math.max(0.01, 2 * hr), Math.max(0.01, 2 * hr)); ell.x = hx - hr; ell.y = hy - hr;
    const veil = figma.subtract([rect, ell], f); veil.name = 'Voile percé (masque CSS)';
    veil.fills = f.fills; veil.effects = f.effects; f.fills = []; f.effects = [];
  }
  if (n.cm && !n.al) {
    // clip-path: circle(): an elliptic mask under the children
    const [mx, my, mr] = n.cm;
    const m = figma.createEllipse(); f.appendChild(m); m.resize(Math.max(0.01, 2 * mr), Math.max(0.01, 2 * mr)); m.x = mx - mr; m.y = my - mr;
    m.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; m.isMask = true; m.name = 'Masque · clip-path circle()';
  }
  if (n.mk) { f.isMask = true; f.maskType = n.mk; }   // 18 Oct.: a mask of its later siblings (ALPHA: by its alpha)
  if (n.ph) f.name = f.name + ' ⟨' + n.ph + '⟩';
  stats.frames++;
  const kids = n.ch || [];
  if (n.al) {
    f.layoutMode = n.al.d === 'H' ? 'HORIZONTAL' : 'VERTICAL';
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.itemSpacing = n.al.g || 0;
    [f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft] = n.al.p;
    f.primaryAxisAlignItems = n.al.pa; f.counterAxisAlignItems = n.al.ca;
    const ordered = n.al.d === 'H' ? [...kids].sort((a, b) => a.x - b.x) : [...kids].sort((a, b) => a.y - b.y);
    for (const k of ordered) { const c = await build(k, f); if (c && 'layoutSizingHorizontal' in c) { try { c.layoutSizingHorizontal = 'FIXED'; c.layoutSizingVertical = 'FIXED'; } catch (e) { } } }
    f.resize(Math.max(0.01, n.w), Math.max(0.01, n.h));
  } else {
    for (const k of kids) await build(k, f);
  }
  if (spread && !leaf && !n.c && !n.hole) {
    // backing rectangle (16 Oct.): background, border, shadows and glass blur of the element, under its children as in
    // CSS; the frame keeps only its layer blur
    const bk = figma.createRectangle(); f.insertChild(0, bk); bk.name = 'Fond, bordure et ombres';
    bk.resize(Math.max(0.01, n.w), Math.max(0.01, n.h));
    if (n.al) bk.layoutPositioning = 'ABSOLUTE';
    bk.x = 0; bk.y = 0;
    if (n.r) { if (Array.isArray(n.r)) { bk.topLeftRadius = n.r[0]; bk.topRightRadius = n.r[1]; bk.bottomRightRadius = n.r[2]; bk.bottomLeftRadius = n.r[3]; } else bk.cornerRadius = n.r; }
    bk.fills = f.fills; f.fills = [];
    if (f.strokes.length) {
      bk.strokes = f.strokes; bk.strokeAlign = 'INSIDE';
      if (Array.isArray(n.sw)) { bk.strokeTopWeight = n.sw[0]; bk.strokeRightWeight = n.sw[1]; bk.strokeBottomWeight = n.sw[2]; bk.strokeLeftWeight = n.sw[3]; }
      else bk.strokeWeight = n.sw;
      if (n.sd) bk.dashPattern = n.sd === 'dotted' ? [1, 2] : [4, 4];
      f.strokes = [];
    }
    bk.effects = f.effects.filter(e => e.type !== 'LAYER_BLUR'); f.effects = f.effects.filter(e => e.type === 'LAYER_BLUR');
    stats.backed = (stats.backed || 0) + 1;
  }
  if (!n.al) unclipMasked(f);
  if (GLASS_SPLIT) splitGlass(f, n);
  if (n.fx || n.sk) scrollWith(f, n);
  place(f, n); turn(f, n);
  return f;
}
// 18 Oct.: saturation of the site's glass (backdrop-filter: blur(26px) saturate(1.15)). A shader effect transforms the
// rendering of its own layer, so the background blur moves from the glass to a first child « Verre · flou » (a 0.1 %
// fill, the background blur, then the shader X.shader), under « Verre · surface » (the fill and inner shadows of the
// glass, or its backing rectangle « Fond, bordure et ombres »): blurred backdrop, then saturation, then the tint, as in
// Chrome; the content of the glass is not saturated. With X.glassSplit; the shader goes on « Verre · flou » when X.shader
// exists (else it is added in place later, by name).
let GLASS_SHADER = null, GLASS_SPLIT = !!X.glassSplit;   // 18 Oct.: the split also without the shader (added in place later)
// 18 Oct.: Figma lets a layer that clips its content (a frame with clipsContent, an instance of a clipping component)
// escape the mask under it: the blurred copy of the globe under the mask of its edge was drawn whole (test 986; the
// variants of Archives 476:45969 are masked once the copy is unclipped or put in a frame that does not clip). Each such
// later sibling of a mask goes into a frame of the same box that does not clip.
function unclipMasked(f) {
  let masked = false;
  for (const c of [...f.children]) {
    if (c.isMask) { masked = true; continue; }
    if (!masked || !('clipsContent' in c) || !c.clipsContent) continue;
    const w = figma.createFrame();
    f.insertChild(f.children.indexOf(c), w);
    // 18 Oct.: without the placeholder or glass marker of the wrapped layer (⟨pN⟩, ⟨verre r⟩), that later calls look up
    w.name = 'Sans rognage · ' + c.name.replace(/ ⟨(p\d+|verre [\d.]+)⟩$/, ''); w.fills = []; w.clipsContent = false;
    w.resizeWithoutConstraints(Math.max(0.01, c.width), Math.max(0.01, c.height));
    w.relativeTransform = c.relativeTransform;
    w.appendChild(c); c.relativeTransform = [[1, 0, 0], [0, 1, 0]];
    stats.maskUnclipped = (stats.maskUnclipped || 0) + 1;
  }
}
function splitGlass(f, n) {
  // 18 Oct.: a glass cut by a CSS mask (n.hole, the scope path) has its paints and blur on « Voile percé (masque CSS) »:
  // « Verre · flou » is then a copy of that boolean, just under it, so that the blurred backdrop keeps the hole
  const veil = n.hole && !n.al ? f.children.find(c => c.name === 'Voile percé (masque CSS)') : null;
  const holder = veil || (f.children.length && f.children[0].name === 'Fond, bordure et ombres' ? f.children[0] : f);
  const bb = holder.effects.find(e => e.type === 'BACKGROUND_BLUR');
  if (!bb) return;
  const auto = f.layoutMode && f.layoutMode !== 'NONE';
  let s;
  if (veil) { s = veil.clone(); f.insertChild(f.children.indexOf(veil), s); s.relativeTransform = veil.relativeTransform; s.name = 'Verre · flou'; }
  else {
    s = figma.createRectangle(); f.insertChild(0, s); if (auto) s.layoutPositioning = 'ABSOLUTE';
    s.name = 'Verre · flou'; s.resize(Math.max(0.01, f.width), Math.max(0.01, f.height)); s.x = 0; s.y = 0;
    if (n.r) { if (Array.isArray(n.r)) { s.topLeftRadius = n.r[0]; s.topRightRadius = n.r[1]; s.bottomRightRadius = n.r[2]; s.bottomLeftRadius = n.r[3]; } else s.cornerRadius = n.r; }
  }
  // an unbound paint: a tint bound to a colour variable keeps the variable's alpha (82 %) whatever its opacity, and the
  // glass was tinted twice (call 984)
  s.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.001 }];
  s.effects = GLASS_SHADER ? [bb, { type: 'SHADER', visible: true, id: GLASS_SHADER }] : [bb];
  holder.effects = holder.effects.filter(e => e.type !== 'BACKGROUND_BLUR');
  if (holder === f && (f.fills.length || f.effects.some(e => e.type === 'INNER_SHADOW'))) {
    const t = figma.createRectangle(); f.insertChild(1, t); if (auto) t.layoutPositioning = 'ABSOLUTE';
    t.name = 'Verre · surface'; t.resize(Math.max(0.01, f.width), Math.max(0.01, f.height)); t.x = 0; t.y = 0;
    if (n.r) { if (Array.isArray(n.r)) { t.topLeftRadius = n.r[0]; t.topRightRadius = n.r[1]; t.bottomRightRadius = n.r[2]; t.bottomLeftRadius = n.r[3]; } else t.cornerRadius = n.r; }
    t.fills = f.fills; f.fills = [];
    t.effects = f.effects.filter(e => e.type === 'INNER_SHADOW'); f.effects = f.effects.filter(e => e.type !== 'INNER_SHADOW');
  }
  stats.glassSplit = (stats.glassSplit || 0) + 1;
}

// ⟦verre⟧ (only in the calls of scenes holding a marked glass: make_call.py, build_renderer.cjs --no-glass)
// 18 Oct.: a glass under a weaker later blur (dom2fig.glass_under_blur, name « … ⟨verre r⟩ »). Figma ignores its
// background blur when it blurs the later layer (the ::backdrop veil of a window), so the glass gets an explicit copy of
// what is painted before it, blurred as a layer. Chrome blurs the backdrop inside the border box of the element, its
// edges mirrored (tile mode kMirror of backdrop-filter): the layers painted before the glass (the own paints of its
// ancestors, then their earlier children) are copied where they cross the box, in a tile clipped to it; the tile is
// mirrored around until the blur reaches no further (1.5 r, the blur radius of Figma being twice the CSS σ). The
// saturation of the site's glass (saturate(1.15)) is the shader X.shader on the clipped copy, after the blur. The fill,
// stroke and inner shadows of the glass go above the copy, like the background of the element over its filtered
// backdrop. Run once the whole frame exists (last call of the frame), glasses in paint order: a later glass copies an
// earlier one with its copy.
const MUL = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1], A[0][0] * B[0][2] + A[0][1] * B[1][2] + A[0][2]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1], A[1][0] * B[0][2] + A[1][1] * B[1][2] + A[1][2]]];
const INV = M => { const [a, c, e] = M[0], [b, d, f] = M[1], k = a * d - b * c; return [[d / k, -c / k, (c * f - d * e) / k], [-b / k, a / k, (b * e - a * f) / k]]; };
function radiiOf(dst, src) {
  if (!('cornerRadius' in src)) return;
  if (src.cornerRadius !== figma.mixed) { dst.cornerRadius = src.cornerRadius; return; }
  dst.topLeftRadius = src.topLeftRadius; dst.topRightRadius = src.topRightRadius; dst.bottomRightRadius = src.bottomRightRadius; dst.bottomLeftRadius = src.bottomLeftRadius;
}
function strokesOf(dst, src) {
  if (!('strokes' in src) || !src.strokes.length) return;
  dst.strokes = src.strokes; dst.strokeAlign = src.strokeAlign;
  if (src.strokeWeight !== figma.mixed) dst.strokeWeight = src.strokeWeight;
  else { dst.strokeTopWeight = src.strokeTopWeight; dst.strokeRightWeight = src.strokeRightWeight; dst.strokeBottomWeight = src.strokeBottomWeight; dst.strokeLeftWeight = src.strokeLeftWeight; }
  if (src.dashPattern && src.dashPattern.length) dst.dashPattern = src.dashPattern;
}
async function glassCopies(top) {
  const re = / ⟨verre ([\d.]+)⟩$/;
  const glasses = top.findAll(n => re.test(n.name));
  if (!glasses.length) return;
  // fonts of every text that may be copied (texts made by an earlier call of this frame are not loaded in this one)
  const fset = new Map();
  for (const t of top.findAllWithCriteria({ types: ['TEXT'] })) if (t.characters.length) for (const f of t.getRangeAllFontNames(0, t.characters.length)) fset.set(f.family + '|' + f.style, f);
  await Promise.all([...fset.values()].map(f => figma.loadFontAsync(f).catch(() => { missing.fonts[f.family + ' ' + f.style] = 1; })));
  let shader = null;
  if (X.shader) { try { await figma.importShaderById(X.shader); shader = X.shader; } catch (e) { stats.shaderError = String((e && e.message) || e).slice(0, 160); } }
  const T0 = INV(top.absoluteTransform), tx = top.absoluteTransform[0][2], ty = top.absoluteTransform[1][2];
  for (const g of glasses) {
    const r = parseFloat(re.exec(g.name)[1]); g.name = g.name.replace(re, '');
    const G = MUL(T0, g.absoluteTransform), gx = G[0][2], gy = G[1][2], w = g.width, h = g.height;
    const box = n => { const b = n.absoluteRenderBounds || n.absoluteBoundingBox; return b ? [b.x - tx, b.y - ty, b.x - tx + b.width, b.y - ty + b.height] : null; };
    const crosses = n => { const b = box(n); return !!b && b[0] < gx + w && gx < b[2] && b[1] < gy + h && gy < b[3]; };
    const inside = n => { const b = box(n); return !!b && b[0] >= gx && b[2] <= gx + w && b[1] >= gy && b[3] <= gy + h; };
    const shell = (src, dst, identity) => {
      const f = figma.createFrame(); dst.appendChild(f); f.name = src.name;
      f.relativeTransform = identity ? [[1, 0, 0], [0, 1, 0]] : src.relativeTransform;
      f.resize(Math.max(0.01, src.width), Math.max(0.01, src.height));
      f.fills = 'fills' in src && src.fills !== figma.mixed ? src.fills : []; strokesOf(f, src); radiiOf(f, src);
      f.effects = (src.effects || []).filter(e => e.type !== 'BACKGROUND_BLUR');
      f.opacity = src.opacity; if ('blendMode' in src) f.blendMode = src.blendMode;
      f.clipsContent = 'clipsContent' in src ? src.clipsContent : false;
      return f;
    };
    const copy = (src, dst) => {
      // 18 Oct.: a mask is copied whole wherever it lies: it draws nothing, and the later siblings copied after it stay
      // masked (a mask outside the box hides them inside it)
      if (src.isMask && src.visible) { const c = src.clone(); dst.appendChild(c); c.relativeTransform = src.relativeTransform; stats.glassCopies = (stats.glassCopies || 0) + 1; return; }
      if (!src.visible || !crosses(src)) return;
      if (src.type === 'FRAME' && src.children.length && !inside(src)) { const f = shell(src, dst, false); for (const c of src.children) copy(c, f); return; }
      const c = src.clone(); dst.appendChild(c); c.relativeTransform = src.relativeTransform; stats.glassCopies = (stats.glassCopies || 0) + 1;
    };
    const auto = g.layoutMode && g.layoutMode !== 'NONE', leaf = !g.children.length;
    const clip = figma.createFrame(); g.insertChild(0, clip); if (auto) clip.layoutPositioning = 'ABSOLUTE';
    clip.name = 'Arrière-plan flouté (copie du fond en miroir, flou de calque ' + r + (shader ? ', saturation' : '') + ')';
    clip.x = 0; clip.y = 0; clip.resize(w, h); clip.fills = []; clip.clipsContent = true; radiiOf(clip, g);
    // 18 Oct.: a glass cut by a CSS mask (n.hole) cuts its backdrop too: the copy is masked by the shape of the boolean
    // « Voile percé (masque CSS) », and the hole shows the layers under the glass unblurred, as in Chrome
    const veil = g.children.find(c => c.name === 'Voile percé (masque CSS)');
    if (veil) { const m = veil.clone(); clip.appendChild(m); m.relativeTransform = veil.relativeTransform; m.name = 'Masque · trou du voile'; m.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; m.effects = []; m.isMask = true; }
    const mosaic = figma.createFrame(); clip.appendChild(mosaic); mosaic.name = 'Mosaïque en miroir'; mosaic.fills = []; mosaic.clipsContent = false;
    mosaic.x = 0; mosaic.y = 0; mosaic.resize(w, h); mosaic.effects = [{ type: 'LAYER_BLUR', radius: r, visible: true }];
    const tile = figma.createFrame(); mosaic.appendChild(tile); tile.name = 'Fond sous le verre'; tile.fills = []; tile.clipsContent = true; tile.x = 0; tile.y = 0; tile.resize(w, h);
    const holder = figma.createFrame(); tile.appendChild(holder); holder.name = 'Calques peints avant le verre'; holder.fills = []; holder.clipsContent = false;
    holder.x = -gx; holder.y = -gy; holder.resize(top.width, top.height);
    let dst = shell(top, holder, true), src = top;
    // 19 Oct.: the copy took the name the frame had then, its build name « ⟦build …⟧ » (renamed only after glassCopies)
    dst.name = 'Écran (copie sous le verre)';
    const path = []; for (let a = g; a && a !== top; a = a.parent) path.unshift(a);
    for (const a of path) {
      for (const c of src.children) { if (c === a) break; copy(c, dst); }
      if (a === g) break;
      dst = shell(a, dst, false); src = a;
    }
    const nx = Math.ceil(1.5 * r / Math.max(1, w)), ny = Math.ceil(1.5 * r / Math.max(1, h));
    for (let i = -nx; i <= nx; i++) for (let j = -ny; j <= ny; j++) {
      if (!i && !j) continue;
      const sx = i % 2 ? -1 : 1, sy = j % 2 ? -1 : 1;
      const m = tile.clone(); mosaic.appendChild(m);
      m.relativeTransform = [[sx, 0, sx === 1 ? i * w : (i + 1) * w], [0, sy, sy === 1 ? j * h : (j + 1) * h]];
    }
    if (shader) clip.effects = [{ type: 'SHADER', visible: true, id: shader }];
    // 18 Oct.: a shadow with a spread, which Figma draws only on rectangles, ellipses and frames that clip their content
    // and have a fill (as in build): the surface is then a rectangle. A glass without children, which clipped only for
    // that spread and has no fill any more, also hands it its drop shadows, and clips no more so that they show around it
    const fill = g.fills !== figma.mixed && g.fills.length > 0;
    const drop = leaf && fill && (g.effects || []).some(e => e.type === 'DROP_SHADOW' && e.spread);
    const moves = e => e.type === 'INNER_SHADOW' || (drop && e.type === 'DROP_SHADOW');
    const moved = (g.effects || []).filter(moves);
    if (fill || g.strokes.length || moved.length) {
      const spread = moved.some(e => e.spread);
      const s = spread ? figma.createRectangle() : figma.createFrame(); g.insertChild(1, s); if (auto) s.layoutPositioning = 'ABSOLUTE';
      s.name = 'Surface du verre'; s.x = 0; s.y = 0; s.resize(w, h); if (!spread) s.clipsContent = false;
      s.fills = g.fills; strokesOf(s, g); radiiOf(s, g); s.effects = moved;
      g.fills = []; g.strokes = []; g.effects = g.effects.filter(e => !moves(e));
      if (drop) g.clipsContent = false;
    }
    stats.glasses = (stats.glasses || 0) + 1;
  }
}
// ⟦/verre⟧
let IMG = {};   // image hashes of the job being built (X.images, or the job's own with its street map)
async function runJob(J, XJ) {
IMG = XJ.images || X.images || {};
let top;
const host = XJ.section ? await figma.getNodeByIdAsync(XJ.section) : page;
if (!host) throw new Error('Section not found: ' + XJ.section);
if (XJ.find) {
  top = host.children.find(n => n.name === XJ.find);
  if (!top) throw new Error('Build frame not found: ' + XJ.find);
} else {
  if (XJ.name && XJ.name.startsWith('⟦build')) for (const old of host.children.filter(n => n.name === XJ.name)) old.remove();
  top = figma.createFrame();
  host.appendChild(top);
  top.name = XJ.name || J.name;
  top.resize(J.w, J.h);
  top.x = XJ.at ? XJ.at[0] : 0; top.y = XJ.at ? XJ.at[1] : 0;
  const bg = solid(J.bg); top.fills = bg ? [bg] : [];
  top.clipsContent = true;
  if (XJ.colors && XJ.theme) { const cc = await figma.variables.getVariableCollectionByIdAsync(XJ.colors); const m = cc.modes.find(m => m.name === XJ.theme); if (m) top.setExplicitVariableModeForCollection(cc, m.modeId); }
  if (textColl && XJ.lang) { const ln = { fr: 'Français', en: 'English', ar: 'العربية' }[XJ.lang]; if (modes[ln]) top.setExplicitVariableModeForCollection(textColl, modes[ln]); }
}
for (const [target, list] of (J.ops || [[null, J.ch]])) {
  let box = top;
  if (target) { box = top.findOne(n => n.name.endsWith('⟨' + target + '⟩')); if (!box) throw new Error('Placeholder not found: ' + target); }
  for (const n of list) await build(n, box);
  // 18 Oct.: children deferred to this call (⟨pN⟩) under a mask of their container go into a frame that does not clip,
  // like the others (build() runs unclipMasked only on the children built with their frame)
  if (!(box.layoutMode && box.layoutMode !== 'NONE')) unclipMasked(box);
}
if (XJ.final && typeof glassCopies === 'function') await glassCopies(top);   // 18 Oct.: glass under a weaker blur
// a rebuilt screen replaces the previous frame of the same name (16 Oct.)
if (XJ.final) { for (const old of host.children.filter(n => n.name === XJ.final && n !== top)) old.remove(); top.name = XJ.final; for (const n of top.findAll(n => / ⟨p\d+⟩$/.test(n.name))) n.name = n.name.replace(/ ⟨p\d+⟩$/, ''); }
return { id: top.id, name: top.name };
}
// 18 Oct.: the saturation shader of the glass, imported once for the screens and the library variants
if (X.shader && X.glassSplit) { try { await figma.importShaderById(X.shader); GLASS_SHADER = X.shader; } catch (e) { stats.shaderError = String((e && e.message) || e).slice(0, 160); } }
// ⟦bibliothèque⟧ (removed from the renderer of the screen calls by build_renderer.cjs --screens)
// 18 Oct.: library variants, built by build() like the screens so that an instance draws exactly the flat layers it
// replaces; each becomes a component in the section of its family on the page « Composants ». The last call of a
// family (fam.combine) gathers every component of the section into one set, laid out in a grid. A set already made is
// never rebuilt here (its instances would be lost): such a family is refused, unless the set comes from this very call,
// interrupted and sent again (18 Oct., below).
if (S.library) {
  // 18 Oct.: what refuses a call is checked before anything is made, so that a refused call changes nothing in the file
  // and can be sent again once its cause is gone. First the « chiffres tabulaires » styles, made by hand by the user (the
  // API cannot turn the feature on): a variant built without its style would show proportional figures, and the
  // instances of the screens, whose texts the screen calls never build, would carry the difference unreported.
  const lackTab = new Set();
  const tabWalk = list => { for (const n of list || []) { if (n.t === 'T' && n.tn && n.fs >= 1) { const name = tsName(n.fn[0], n.fn[1], n.fs, n.lh, n.ls, n.tc) + ' · chiffres tabulaires'; if (!TS[name]) lackTab.add(name); } tabWalk(n.ch); } };
  for (const fam of S.library) for (const v of fam.variants) tabWalk([v.node]);
  if (lackTab.size) throw new Error('Tabular figure styles missing (made by hand in Figma): ' + [...lackTab].join(' | '));
  const out = {};
  const colColl = X.colors ? await figma.variables.getVariableCollectionByIdAsync(X.colors) : null;
  const THEME = { light: 'Clair', dark: 'Sombre' }, LANG = { fr: 'Français', en: 'English', ar: 'العربية' };
  // the modes of the scene the variant comes from: its texts resolve to the words of that scene while it is built, so
  // the layout of each text, its Arabic runs and fitLines are those of the screens. The component itself keeps an
  // explicit mode only where its scene differs from this page (French, light): the language of an Arabic scene
  // (v.pinLang, or its texts would be laid out again in French here), the theme of a dark capture (v.pinTheme).
  // Instances inherit these modes; everywhere else they follow the language and theme of their frame (English mode,
  // dark clones).
  function setModes(node, v, lang, theme) {
    if (theme && colColl) { const m = colColl.modes.find(m => m.name === THEME[v.theme || 'light']); if (m) node.setExplicitVariableModeForCollection(colColl, m.modeId); }
    if (lang && textColl && modes[LANG[v.lang || 'fr']]) node.setExplicitVariableModeForCollection(textColl, modes[LANG[v.lang || 'fr']]);
  }
  // X.libParent: name of a section of the page that holds the family sections (a test kept in « Archives »)
  let host = X.libParent ? page.children.find(n => n.type === 'SECTION' && n.name === X.libParent) : page;
  // 18 Oct.: then the sets. A set already made with exactly the variants of this call (their names, and their
  // descriptions, which hold the signatures) comes from this call, interrupted after it (a later family failed) and sent
  // again: its ids are returned as they are, nothing is rebuilt (res.reused). Any other set is refused. A family
  // combined here also needs the variants made by its earlier calls.
  const ready = {};
  for (const fam of S.library) {
    const sec = host && host.children.find(n => n.type === 'SECTION' && n.name === fam.setName);
    const set = sec && sec.children.find(n => n.type === 'COMPONENT_SET');
    if (set) {
      const names = set.children.map(c => c.name), want = fam.combine ? (fam.names || fam.variants.map(v => v.name)) : null;
      const same = set.name === fam.setName && fam.variants.every(v => set.children.some(c => c.name === v.name && c.description === (v.desc || ''))) && (!want || (names.length === want.length && want.every(w => names.includes(w))));
      if (!same) throw new Error('Set already built: ' + fam.setName);
      ready[fam.key] = { sec, set };
    } else if (fam.combine && fam.names) {
      const here = new Set(fam.variants.map(v => v.name));
      const lack = fam.names.filter(w => !here.has(w) && !(sec && sec.children.some(c => c.type === 'COMPONENT' && c.name === w)));
      if (lack.length) throw new Error('Variants missing in ' + fam.setName + ': ' + lack.join(' | '));
    }
  }
  if (!host) { let b = 0; for (const s of page.children) b = Math.max(b, s.y + s.height); host = figma.createSection(); page.appendChild(host); host.name = X.libParent; host.x = 0; host.y = b + 200; host.resizeWithoutConstraints(1400, 400); }
  const fit = () => { if (host === page) return; let w = 0, h = 0; for (const c of host.children) { w = Math.max(w, c.x + c.width); h = Math.max(h, c.y + c.height); } host.resizeWithoutConstraints(Math.max(1400, w + 80), h + 80); };
  let bottom = 0; for (const s of host.children) bottom = Math.max(bottom, s.y + s.height);
  const HOLD = '⟦variante en construction⟧';   // 18 Oct.: the temporary frame of a variant, removed if a call stopped in it
  for (const fam of S.library) {
    IMG = X.images || {};
    // 18 Oct.: signature of each variant of the call (components.py records the sets by signature; older entries have none)
    const sigs = {}; for (const v of fam.variants) if (v.sig) sigs[v.name] = v.sig;
    if (ready[fam.key]) {
      const { sec, set } = ready[fam.key], res = { section: sec.id, made: {}, sigs, reused: true };
      for (const v of fam.variants) res.made[v.name] = set.children.find(c => c.name === v.name).id;
      if (fam.combine) { res.set = set.id; res.variants = {}; for (const c of set.children) res.variants[c.name] = c.id; }
      out[fam.key] = res;
      continue;
    }
    let sec = host.children.find(n => n.type === 'SECTION' && n.name === fam.setName);
    if (!sec) { sec = figma.createSection(); host.appendChild(sec); sec.name = fam.setName; sec.x = host === page ? 0 : 80; sec.y = bottom + (host === page ? 160 : 120); sec.resizeWithoutConstraints(1200, 400); }
    for (const old of sec.children.filter(n => n.type === 'FRAME' && n.name === HOLD)) old.remove();
    const made = {};
    for (const v of fam.variants) {
      for (const old of sec.children.filter(n => n.type === 'COMPONENT' && n.name === v.name)) old.remove();
      const holder = figma.createFrame(); sec.appendChild(holder); holder.name = HOLD; holder.fills = []; holder.clipsContent = false; holder.resize(Math.max(1, v.node.w), Math.max(1, v.node.h));
      setModes(holder, v, true, true);
      const node = await build(Object.assign({}, v.node, { x: 0, y: 0 }), holder);
      setModes(node, v, v.pinLang, v.pinTheme);
      const comp = figma.createComponentFromNode(node);
      sec.appendChild(comp); holder.remove();
      comp.name = v.name;
      comp.description = v.desc || '';
      made[v.name] = comp.id;
      // every component must now resolve to the modes of its scene on this page (pinned or page default)
      const rm = comp.resolvedVariableModes || {};
      const wantT = colColl && colColl.modes.find(m => m.name === THEME[v.theme || 'light']), wantL = textColl && modes[LANG[v.lang || 'fr']];
      if ((wantT && rm[colColl.id] && rm[colColl.id] !== wantT.modeId) || (wantL && rm[textColl.id] && rm[textColl.id] !== wantL)) { stats.modeMismatch = (stats.modeMismatch || 0) + 1; (stats.modeMismatchNames = stats.modeMismatchNames || []).push(v.name); }
    }
    const res = { section: sec.id, made, sigs };
    if (fam.combine) {
      const want = new Set(fam.names || []);
      const comps = sec.children.filter(n => n.type === 'COMPONENT' && (!fam.names || want.has(n.name)));
      const extra = sec.children.filter(n => n.type === 'COMPONENT' && fam.names && !want.has(n.name)).map(n => n.name);
      if (fam.names && comps.length !== want.size) throw new Error('Variants missing in ' + fam.setName + ': ' + [...want].filter(w => !comps.some(c => c.name === w)).join(' | '));
      const set = figma.combineAsVariants(comps, sec);
      if (extra.length) res.extra = extra;
      set.name = fam.setName; set.description = fam.desc || '';
      const gap = 32, maxW = Math.max(1200, ...set.children.map(c => c.width + 2 * gap));
      let x = gap, y = gap, rowH = 0;
      for (const c of set.children) {
        if (x + c.width + gap > maxW && x > gap) { x = gap; y += rowH + gap; rowH = 0; }
        c.x = x; c.y = y; x += c.width + gap; rowH = Math.max(rowH, c.height);
      }
      set.resizeWithoutConstraints(maxW, y + rowH + gap);
      set.x = 40; set.y = 100;
      sec.resizeWithoutConstraints(set.width + 80, set.height + 140);
      res.set = set.id; res.variants = {};
      for (const c of set.children) res.variants[c.name] = c.id;
    }
    bottom = Math.max(bottom, sec.y + sec.height);
    fit();
    out[fam.key] = res;
  }
  return { library: out, stats, missing: { vars: Object.keys(missing.vars), icons: Object.keys(missing.icons), assets: Object.keys(missing.assets), fonts: Object.keys(missing.fonts), components: Object.keys(missing.components), tabular: Object.keys(missing.tabular || {}), strings: Object.keys(missing.strings) } };
}
// ⟦/bibliothèque⟧
const done = [];
for (const J of JOBS) done.push(await runJob(J, J.X ? Object.assign({}, X, J.X) : X));
const root = { id: done[done.length - 1].id, name: done[done.length - 1].name };
return { id: root.id, name: root.name, frames: done, stats, missing: { vars: Object.keys(missing.vars), icons: Object.keys(missing.icons), assets: Object.keys(missing.assets), fonts: Object.keys(missing.fonts), components: Object.keys(missing.components), tabular: Object.keys(missing.tabular || {}), strings: Object.keys(missing.strings) } };
