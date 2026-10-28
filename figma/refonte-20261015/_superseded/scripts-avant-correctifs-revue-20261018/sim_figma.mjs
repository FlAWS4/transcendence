// Offline dry run of queued use_figma calls against a small mock of the Figma Plugin API (no network, no Figma).
// Usage: node sim_figma.mjs <call files in order…>   (paths relative to ../calls/ or absolute)
// 17 Oct.: also the in-place asset updates of ../assets-update/ (createNodeFromSvg mocked, see svgNode).
// The renderer is taken from the latest *-renderer.js call found among the arguments (or calls/done/).
// State (pages, frames, variables, styles) persists across the calls of one run, like in the real file.
import fs from 'node:fs';
import path from 'node:path';
const CALLS = new URL('../calls/', import.meta.url).pathname;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let idc = 1;
// 18 Oct.: SIM_FALLBACK="Noto Sans Symbols2|Regular" makes every text binding fail, as in Figma, until that font is loaded
const SIM_FALLBACK = process.env.SIM_FALLBACK || '', LOADED = new Set();
const EFFECT_KEYS = { DROP_SHADOW: ['type','color','offset','radius','spread','visible','blendMode','showShadowBehindNode','boundVariables'], INNER_SHADOW: ['type','color','offset','radius','spread','visible','blendMode','boundVariables'], BACKGROUND_BLUR: ['type','radius','visible','boundVariables'], LAYER_BLUR: ['type','radius','visible','boundVariables'], SHADER: ['type','visible','id','properties'] };
const SHADERS = new Set();   // 18 Oct.: shaders imported by figma.importShaderById (a SHADER effect needs it first)
const PAINT_KEYS = { SOLID: ['type','color','opacity','visible','blendMode','boundVariables'], GRADIENT_LINEAR: ['type','gradientStops','gradientTransform','opacity','visible','blendMode'], GRADIENT_RADIAL: ['type','gradientStops','gradientTransform','opacity','visible','blendMode'], IMAGE: ['type','imageHash','scaleMode','opacity','visible','blendMode','imageTransform','scalingFactor','rotation','filters'] };
function checkKeys(list, table, what) { (list || []).forEach((o, i) => { const ok = table[o.type]; if (!ok) throw new Error(what + ': unknown type ' + o.type); for (const k of Object.keys(o)) if (!ok.includes(k)) throw new Error('in set_' + what + ': Unrecognized key(s) in object: \'' + k + '\' at index ' + i); if (o.color && 'a' in o.color && what !== 'effects' && o.type === 'SOLID') throw new Error(what + ': paint color must not have a'); }); }
class Node {
  set effects(v) { checkKeys(v, EFFECT_KEYS, 'effects'); for (const e of v || []) if (e.type === 'SHADER' && !SHADERS.has(e.id)) throw new Error('Shader not imported. Call figma.importShaderById(id) first.'); this._e = v; }
  get effects() { return this._e || []; }
  set fills(v) { checkKeys(v, PAINT_KEYS, 'fills'); this._f = v; }
  get fills() { return this._f || []; }
  set strokes(v) { checkKeys(v, PAINT_KEYS, 'strokes'); this._s = v; }
  get strokes() { return this._s || []; }
  constructor(type) { this.type = type; this.id = 's:' + (idc++); this.children = []; this.name = ''; this.x = 0; this.y = 0; this.width = 100; this.height = 20; this.parent = null; this.visible = true; }
  // 18 Oct.: geometry read by the glass copies (render.js glassCopies): transforms composed up to the page
  get absoluteTransform() { const r = this.relativeTransform; if (!this.parent || this.parent.type === 'PAGE') return r; const A = this.parent.absoluteTransform; return [[A[0][0] * r[0][0] + A[0][1] * r[1][0], A[0][0] * r[0][1] + A[0][1] * r[1][1], A[0][0] * r[0][2] + A[0][1] * r[1][2] + A[0][2]], [A[1][0] * r[0][0] + A[1][1] * r[1][0], A[1][0] * r[0][1] + A[1][1] * r[1][1], A[1][0] * r[0][2] + A[1][1] * r[1][2] + A[1][2]]]; }
  get absoluteBoundingBox() { const a = this.absoluteTransform; return { x: a[0][2], y: a[1][2], width: this.width, height: this.height }; }
  get absoluteRenderBounds() { return this.visible ? this.absoluteBoundingBox : null; }
  getRangeAllFontNames(a, b) { if (this.type !== 'TEXT') throw new Error('getRangeAllFontNames on a ' + this.type); if (!(b > a)) throw new Error('getRangeAllFontNames: empty range'); if (!this.fontName) throw new Error('getRangeAllFontNames: no font'); return [this.fontName]; }
  appendChild(c) { if (c.parent) c.parent.children = c.parent.children.filter(k => k !== c); c.parent = this; this.children.push(c); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(k => k !== this); this.parent = null; this.removed = true; }
  resize(w, h) { if (!(w > 0) || !(h > 0)) throw new Error('resize: invalid size ' + w + 'x' + h + ' on ' + this.name); this.width = w; this.height = h; }
  resizeWithoutConstraints(w, h) { this.resize(w, h); }
  rescale(k) { if (!(k > 0)) throw new Error('rescale: invalid factor ' + k); this.width *= k; this.height *= k; }
  findOne(fn) { for (const c of this.children) { if (fn(c)) return c; const r = c.findOne(fn); if (r) return r; } return null; }
  findAll(fn) { const out = []; for (const c of this.children) { if (!fn || fn(c)) out.push(c); out.push(...c.findAll(fn)); } return out; }
  findAllWithCriteria({ types }) { return this.findAll(n => types.includes(n.type)); }
  createInstance() { const n = new Node('INSTANCE'); n.width = this.width; n.height = this.height; n.mainComponent = this; const copy = (src, dst) => { for (const c of src.children) { const k = new Node(c.type); k.name = c.name; k.width = c.width; k.height = c.height; k.x = c.x; k.y = c.y; if (c._f) k._f = c._f; if (c._s) k._s = c._s; if (c.fontName) k.fontName = c.fontName; if (c._c !== undefined) k._c = c._c; if (c.mainComponent) k.mainComponent = c.mainComponent; dst.appendChild(k); copy(c, k); } }; copy(this, n); return n; }
  setExplicitVariableModeForCollection(c, m) { if (!c || !m) throw new Error('explicit mode: missing collection or mode'); this.modes = { ...(this.modes || {}), [c.id]: m }; }
  // 18 Oct.: the nearest explicit mode up the tree, else the first mode of the collection (Clair, Français)
  get resolvedVariableModes() { const out = { 'VariableCollectionId:3:2': '3:0', 'VariableCollectionId:3:97': 'fr' }; const chain = []; for (let a = this; a; a = a.parent) chain.unshift(a); for (const a of chain) Object.assign(out, a.modes || {}); return out; }
  clone() { const n = new Node(this.type); Object.assign(n, { ...this, id: 's:' + (idc++), parent: null, children: [] }); for (const c of this.children) n.appendChild(c.clone()); return n; }
  insertChild(i, c) { if (c.parent) c.parent.children = c.parent.children.filter(k => k !== c); c.parent = this; this.children.splice(i, 0, c); }
  async getMainComponentAsync() { return this.mainComponent || null; }
  swapComponent(c) { this.mainComponent = c; }
  setRangeFontName(a, b, f) { if (!(b > a)) throw new Error('setRangeFontName: range'); if (f && !LOADED.has(f.family + '|' + f.style)) throw new Error('in setRangeFontName: unloaded font "' + f.family + ' ' + f.style + '"'); } setRangeLetterSpacing(a, b, v) { if (!(b > a)) throw new Error('setRangeLetterSpacing: range'); if (!v || typeof v.value !== 'number' || !Number.isFinite(v.value) || !['PIXELS', 'PERCENT'].includes(v.unit)) throw new Error('setRangeLetterSpacing: bad value ' + JSON.stringify(v)); } setBoundVariable(prop, v) { if (!v) throw new Error('setBoundVariable: no variable for ' + prop); if (prop === 'characters' && SIM_FALLBACK && !LOADED.has(SIM_FALLBACK)) { const [fam, st] = SIM_FALLBACK.split('|'); throw new Error('in setBoundVariable: unloaded font "' + fam + ' ' + st + '". Please call figma.loadFontAsync({ family: "' + fam + '", style: "' + st + '" }) and await the returned promise first.'); } this.bound = (this.bound || 0) + 1; }
  async setTextStyleIdAsync(id) { if (!id) throw new Error('setTextStyleIdAsync: empty id'); this.textStyleId = id; }
  async setRangeTextStyleIdAsync(a, b, id) { if (!(b > a)) throw new Error('range'); }
  // 18 Oct.: mask types of Figma
  set maskType(v) { if (!['ALPHA', 'VECTOR', 'LUMINANCE'].includes(v)) throw new Error('in set_maskType: unknown mask type ' + v); this._mt = v; }
  get maskType() { return this._mt || 'ALPHA'; }
  // 18 Oct.: Figma refuses a font size below 1 (typings: « Has minimum value of 1 »)
  set fontSize(v) { if (this.type === 'TEXT' && !(v >= 1)) throw new Error('in set_fontSize: Expected fontSize to be >= 1, got ' + v); this._fsz = v; }
  get fontSize() { return this._fsz; }
  set characters(v) { if (typeof v !== 'string') throw new Error('characters must be a string'); if (this.type === 'TEXT' && !this.fontName) throw new Error('font not set before characters'); this._c = v; }
  get characters() { return this._c; }
  // 16 Oct.: transforms of rotated or mirrored icons, absolute children of auto-layout frames
  set relativeTransform(m) { if (!Array.isArray(m) || m.length !== 2 || m.some(r => !Array.isArray(r) || r.length !== 3 || r.some(v => !Number.isFinite(v)))) throw new Error('relativeTransform: bad matrix ' + JSON.stringify(m)); this._rt = m; this.x = m[0][2]; this.y = m[1][2]; }
  get relativeTransform() { return this._rt && this._rt[0][2] === this.x && this._rt[1][2] === this.y ? this._rt : (this._rt ? [[this._rt[0][0], this._rt[0][1], this.x], [this._rt[1][0], this._rt[1][1], this.y]] : [[1, 0, this.x], [0, 1, this.y]]); }
  set layoutPositioning(v) { if (v === 'ABSOLUTE' && !(this.parent && ['HORIZONTAL', 'VERTICAL'].includes(this.parent.layoutMode))) throw new Error('layoutPositioning ABSOLUTE outside an auto-layout frame: ' + this.name); this._lp = v; }
  get layoutPositioning() { return this._lp || 'AUTO'; }
  // 18 Oct.: vectors drawn from path data (the textarea grip): Figma's subset of the SVG grammar, M L Q C Z in absolute
  // coordinates separated by single spaces, the first command M
  set vectorPaths(v) {
    if (!Array.isArray(v) || !v.length) throw new Error('vectorPaths: empty');
    const num = '-?\\d+(?:\\.\\d+)?', re = new RegExp('^M ' + num + ' ' + num + '(?: (?:[ML] ' + num + ' ' + num + '|Q(?: ' + num + '){4}|C(?: ' + num + '){6}|Z))*$');
    for (const p of v) { if (!['NONZERO', 'EVENODD', 'NONE'].includes(p.windingRule)) throw new Error('vectorPaths: windingRule ' + p.windingRule); if (!re.test(p.data)) throw new Error('in set_vectorPaths: invalid path data ' + String(p.data).slice(0, 60)); }
    const xs = [], ys = []; for (const p of v) { const t = p.data.split(' ').filter(s => !/^[A-Z]$/.test(s)).map(Number); for (let i = 0; i + 1 < t.length; i += 2) { xs.push(t[i]); ys.push(t[i + 1]); } }
    this.width = Math.max(...xs) - Math.min(...xs); this.height = Math.max(...ys) - Math.min(...ys); this._vp = v;
  }
  get vectorPaths() { return this._vp || []; }
}
// a resolved colour for every variable (16 Oct.: the outlined glyphs take the value resolved in their frame's mode)
const resolvable = v => Object.assign(v, { resolveForConsumer(n) { if (!n) throw new Error('resolveForConsumer: no consumer'); return { value: { r: 0.1, g: 0.2, b: 0.3, a: 1 }, resolvedType: 'COLOR' }; } });
// shadows whose spread Figma would ignore: on a frame that does not clip its content, or that has no fill
function spreadIgnored(root) { return root.findAll(n => n.type === 'FRAME' && n.effects.some(e => (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') && e.spread) && (!n.clipsContent || !n.fills.length)).length; }
// 17 Oct.: figma.createNodeFromSvg for the in-place asset updates (assets.py update). A small SVG reader: well-formed
// markup, sizes of the root, path data grammar, paints resolved with inheritance (an unresolvable paint such as
// currentColor is refused: Figma would paint it black), one node per element like Figma's import (g → GROUP, rect →
// RECTANGLE, circle/ellipse → ELLIPSE, other shapes → VECTOR, text → TEXT), CENTER-free MIN constraints by default.
const PATH_ARGS = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
function checkPathData(d) {
  const toks = d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [];
  if (toks.join('').length !== d.replace(/[\s,]/g, '').length) throw new Error('in createNodeFromSvg: unreadable path data ' + d.slice(0, 60));
  let cmd = null, count = 0;
  const close = () => { if (cmd && (PATH_ARGS[cmd] ? count === 0 || count % PATH_ARGS[cmd] : count)) throw new Error('in createNodeFromSvg: ' + count + ' numbers after ' + cmd + ' in ' + d.slice(0, 60)); };
  for (const t of toks) {
    if (/[a-zA-Z]/.test(t)) { if (!(t.toLowerCase() in PATH_ARGS)) throw new Error('in createNodeFromSvg: path command ' + t); close(); cmd = t.toLowerCase(); count = 0; }
    else { if (!cmd) throw new Error('in createNodeFromSvg: path data must start with a command'); count++; }
  }
  close();
  if (!toks.length || !/^[mM]$/.test(toks[0])) throw new Error('in createNodeFromSvg: path data must start with M');
}
const NAMED = { white: '#ffffff', black: '#000000' };
function svgPaint(v) {
  if (v === undefined || v === 'none' || v === 'transparent') return [];
  const h = (NAMED[v] || v).trim();
  let m = /^#([0-9a-f]{6})$/i.exec(h) || /^#([0-9a-f]{3})$/i.exec(h);
  if (!m) throw new Error('in createNodeFromSvg: paint Figma would not resolve: ' + v);
  const x = m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1];
  return [{ type: 'SOLID', color: { r: parseInt(x.slice(0, 2), 16) / 255, g: parseInt(x.slice(2, 4), 16) / 255, b: parseInt(x.slice(4, 6), 16) / 255 } }];
}
function svgNode(svg) {
  const re = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<(\/?)([a-zA-Z][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g;
  const stack = []; let root = null, m, last = 0;
  const KIND = { g: 'GROUP', rect: 'RECTANGLE', circle: 'ELLIPSE', ellipse: 'ELLIPSE', path: 'VECTOR', line: 'VECTOR', polyline: 'VECTOR', polygon: 'VECTOR', text: 'TEXT' };
  while ((m = re.exec(svg))) {
    const between = svg.slice(last, m.index); last = re.lastIndex;
    if (/<|>/.test(between)) throw new Error('in createNodeFromSvg: malformed markup near ' + between.slice(0, 40));
    if (!m[2]) continue;
    const [, closing, tag, attrText, selfClosing] = m;
    if (closing) { const top = stack.pop(); if (!top || top.tag !== tag) throw new Error('in createNodeFromSvg: </' + tag + '> does not close <' + (top ? top.tag : '') + '>'); continue; }
    const attrs = {}; for (const a of attrText.matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attrs[a[1]] = a[2] !== undefined ? a[2] : a[3];
    const parent = stack.length ? stack[stack.length - 1] : null;
    const inh = parent ? { ...parent.inh } : { fill: '#000000', stroke: 'none', 'stroke-width': '1' };
    for (const k of ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin']) if (k in attrs) inh[k] = attrs[k];
    const el = { tag, attrs, inh, node: null };
    if (!parent) {
      if (tag !== 'svg') throw new Error('in createNodeFromSvg: root is <' + tag + '>');
      const vb = (attrs.viewBox || '').split(/[\s,]+/).map(Number);
      const w = parseFloat(attrs.width || vb[2]), h = parseFloat(attrs.height || vb[3]);
      if (!(w > 0) || !(h > 0)) throw new Error('in createNodeFromSvg: no size');
      el.node = root = new Node('FRAME'); root.width = w; root.height = h; root.name = 'svg';
    } else if (KIND[tag] && parent.node) {
      const n = new Node(KIND[tag]); n.name = attrs.id || tag;
      if (tag === 'path') checkPathData(attrs.d || '');
      if (tag !== 'g') {
        n.fills = svgPaint(inh.fill); n.strokes = svgPaint(inh.stroke); n.strokeWeight = parseFloat(inh['stroke-width']);
        n.strokeCap = (inh['stroke-linecap'] || 'butt').toUpperCase(); n.strokeJoin = (inh['stroke-linejoin'] || 'miter').toUpperCase();
        n.constraints = { horizontal: 'MIN', vertical: 'MIN' };
      }
      parent.node.appendChild(n); el.node = n;
    }
    if (!selfClosing) stack.push(el);
  }
  if (stack.length || !root) throw new Error('in createNodeFromSvg: unclosed <' + (stack.length ? stack[stack.length - 1].tag : 'svg') + '>');
  (figma.currentPage || scratchPage).appendChild(root);
  return root;
}
const scratchPage = new Node('PAGE');
const pages = {}; const vars = []; const styles = []; const comps = {};
const figma = {
  root: { children: [] },
  mixed: Symbol('mixed'),
  async importShaderById(id) { if (!id) throw new Error('importShaderById: no id'); SHADERS.add(id); return { id, name: 'mock shader', type: 'effect', imported: true, propertyDefinitions: {} }; },
  async getNodeByIdAsync(id) {
    if (pages[id]) return pages[id];
    if (comps[id]) return comps[id];
    const c = new Node('COMPONENT'); c.width = 24; c.height = 24; c.name = 'mock ' + id;
    const v = new Node('VECTOR'); v.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; c.appendChild(v); comps[id] = c; return c;
  },
  async setCurrentPageAsync(p) { if (p) figma.currentPage = p; },   // 17 Oct.: createNodeFromSvg adds to the current page
  createNodeFromSvg(svg) { if (typeof svg !== 'string') throw new Error('createNodeFromSvg: not a string'); return svgNode(svg); },
  async loadFontAsync(f) { if (!f || !f.family || !f.style) throw new Error('loadFontAsync: bad font'); LOADED.add(f.family + '|' + f.style); },
  createText() { return new Node('TEXT'); },
  createFrame() { return new Node('FRAME'); },
  createSection() { return new Node('SECTION'); },
  createRectangle() { return new Node('RECTANGLE'); },
  createEllipse() { return new Node('ELLIPSE'); },
  createVector() { return new Node('VECTOR'); },
  flatten(nodes, parent) { if (!nodes.length) throw new Error('flatten: empty'); const p = parent || nodes[0].parent; const i = p.children.indexOf(nodes[0]); const v = new Node('VECTOR'); Object.assign(v, { x: nodes[0].x, y: nodes[0].y, width: nodes[0].width, height: nodes[0].height }); for (const n of nodes) n.remove(); p.insertChild(Math.max(0, i), v); return v; },
  subtract(nodes, parent) { if (!nodes || nodes.length < 2) throw new Error('subtract: needs two nodes'); const b = new Node('BOOLEAN_OPERATION'); b.width = nodes[0].width; b.height = nodes[0].height; parent.appendChild(b); for (const n of nodes) b.appendChild(n); return b; },
  // 18 Oct.: the component keeps the node's properties (explicit modes included) but is a COMPONENT; a node inside
  // another component or an instance is refused, as in Figma
  createComponentFromNode(n) { for (let a = n.parent; a; a = a.parent) if (a.type === 'INSTANCE' || a.type === 'COMPONENT') throw new Error('createComponentFromNode: node inside ' + a.type); const c = new Node('COMPONENT'); Object.assign(c, { ...n, type: 'COMPONENT', id: 's:' + (idc++), parent: null, children: [] }); const p = n.parent, i = p ? p.children.indexOf(n) : -1; for (const k of [...n.children]) c.appendChild(k); if (p) { p.children[i] = c; c.parent = p; } n.parent = null; comps[c.id] = c; return c; },
  // 18 Oct.: Figma derives the variant properties from the names « Prop=Value, … »: every component must carry the
  // same properties, and two variants the same values would conflict
  combineAsVariants(list, parent) {
    if (!list.length) throw new Error('combineAsVariants: empty list');
    const seen = new Set(); let keys = null;
    for (const c of list) {
      if (c.type !== 'COMPONENT') throw new Error('combineAsVariants: not a component: ' + c.type + ' ' + c.name);
      const props = c.name.split(', ').map(s => s.split('='));
      if (props.some(p => p.length !== 2 || !p[0] || !p[1])) throw new Error('combineAsVariants: bad variant name ' + c.name);
      const k = props.map(p => p[0]).join('|');
      if (keys === null) keys = k; else if (k !== keys) throw new Error('combineAsVariants: properties ' + k + ' instead of ' + keys);
      const id = props.map(p => p.join('=')).join(', ');
      if (seen.has(id)) throw new Error('combineAsVariants: two variants named ' + id); seen.add(id);
    }
    const set = new Node('COMPONENT_SET'); for (const c of list) set.appendChild(c); parent.appendChild(set); comps[set.id] = set; return set;
  },
  async listAvailableFontsAsync() { return ['Regular', 'Medium', 'SemiBold'].map(style => ({ fontName: { family: 'Jost', style } })).concat([{ fontName: { family: 'Noto Sans Arabic', style: 'Regular' } }]); },
  createTextStyle() { const s = { id: 'S:' + (idc++), name: '' }; styles.push(s); return s; },
  async getLocalTextStylesAsync() { return styles; },
  variables: {
    async getLocalVariablesAsync(type) { return type ? vars.filter(v => (v.resolvedType || 'COLOR') === type) : vars; },
    async getVariableByIdAsync(id) { return vars.find(v => v.id === id) || null; },
    setBoundVariableForPaint(p, f, v) { if (!v) throw new Error('setBoundVariableForPaint: no variable'); return { ...p, boundVariables: { color: v.id } }; },
    createVariableAlias(v) { return { type: 'VARIABLE_ALIAS', id: v.id }; },
    // 18 Oct.: fields of VariableBindableEffectField (shadows: color, radius, spread, offsetX, offsetY; blurs: radius),
    // FLOAT variables for the geometry; the binding is kept on the returned copy, like Figma
    setBoundVariableForEffect(fx, f, v) { if (!v) throw new Error('setBoundVariableForEffect: no variable'); const ok = /SHADOW/.test(fx.type) ? ['color', 'radius', 'spread', 'offsetX', 'offsetY'] : ['radius']; if (!ok.includes(f)) throw new Error('setBoundVariableForEffect: field ' + f + ' not bindable on ' + fx.type); if (f !== 'color' && v.resolvedType && v.resolvedType !== 'FLOAT') throw new Error('setBoundVariableForEffect: ' + f + ' needs a FLOAT variable, not ' + v.resolvedType + ' (' + v.name + ')'); return { ...fx, boundVariables: { ...(fx.boundVariables || {}), [f]: { type: 'VARIABLE_ALIAS', id: v.id } } }; },
    async getVariableCollectionByIdAsync(id) { return id.endsWith(':3:2') ? { id, modes: [{ name: 'Clair', modeId: '3:0' }, { name: 'Sombre', modeId: '3:1' }] } : { id, modes: [{ name: 'Français', modeId: 'fr' }, { name: 'English', modeId: 'en' }, { name: 'العربية', modeId: 'ar' }] }; },
    createVariable(name, coll, type) { if (/[.{}]/.test(name) || !name.trim()) throw new Error('in createVariable: invalid variable name ' + name); if (vars.some(v => v.name === name && v.variableCollectionId === coll.id)) throw new Error('duplicate variable ' + name); const v = resolvable({ id: 'V:' + (idc++), name, resolvedType: type, variableCollectionId: coll.id, valuesByMode: {}, setValueForMode(m, x) { if (type === 'FLOAT' && typeof x !== 'number') throw new Error('setValueForMode: FLOAT value expected for ' + name); this.valuesByMode[m] = x; }, scopes: [] }); vars.push(v); return v; },
  },
};
// seed colour variables known to the real file so bindings are exercised
const pal = JSON.parse(fs.readFileSync(new URL('../css-color-vars.json', import.meta.url)));
for (const [css] of pal) vars.push(resolvable({ id: 'V:' + (idc++), name: 'seed:' + css, variableCollectionId: 'C', valuesByMode: {} }));
// 18 Oct.: the shadow geometry variables registered for the scenes (../effect-vars.json), as created by make_call.py effects
const EFX = new URL('../effect-vars.json', import.meta.url);
if (fs.existsSync(EFX)) for (const [name, e] of Object.entries(JSON.parse(fs.readFileSync(EFX)))) vars.push(resolvable({ id: 'V:' + (idc++), name, resolvedType: 'FLOAT', variableCollectionId: 'VariableCollectionId:3:2', valuesByMode: { '3:0': e.light, '3:1': e.dark } }));
// 18 Oct.: SIM_STRINGS=1 also seeds the text variables already sent (calls/strings-sent.json), so text bindings are exercised
if (process.env.SIM_STRINGS) { const tc = JSON.parse(fs.readFileSync(new URL('../figma-ledger.json', import.meta.url))).collections['42 · Textes'].id; for (const [name, [fr, en, ar]] of Object.entries(JSON.parse(fs.readFileSync(CALLS + 'strings-sent.json', 'utf8')))) vars.push(resolvable({ id: 'V:' + (idc++), name, variableCollectionId: tc, valuesByMode: { fr, en, ar }, setValueForMode(m, x) { this.valuesByMode[m] = x; }, scopes: ['TEXT_CONTENT'] })); }
let rendererSrc = null;
const files = process.argv.slice(2);
const done = fs.existsSync(CALLS + 'done') ? fs.readdirSync(CALLS + 'done').filter(f => f.endsWith('-renderer.js')).sort() : [];
if (done.length) rendererSrc = JSON.parse(fs.readFileSync(CALLS + 'done/' + done.at(-1), 'utf8').split('\n')[2].slice('t.characters = '.length, -1));
for (const f of files) {
  const p = path.isAbsolute(f) ? f : CALLS + f;
  const text = fs.readFileSync(p, 'utf8');
  if (/-renderer\.js$/.test(f)) { rendererSrc = JSON.parse(text.split('\n')[2].slice('t.characters = '.length, -1)); console.log('renderer loaded from', f); continue; }
  if (text.startsWith('// COMPONENTIZE')) {
    const body = text.split('\n').slice(1).join('\n');
    const X2 = JSON.parse(body.split('\n')[0].replace(/^const X = /, '').replace(/;$/, ''));
    pages[X2.page] = pages[X2.page] || Object.assign(new Node('PAGE'), { name: 'page ' + X2.page });
    pages[X2.lib] = pages[X2.lib] || Object.assign(new Node('PAGE'), { name: 'lib ' + X2.lib });
    try { const res = await new AsyncFunction('figma', body)(figma); console.log('OK', f, JSON.stringify(res).slice(0, 400)); } catch (e) { console.log('ERROR', f, e.message); process.exitCode = 1; break; }
    continue;
  }
  if (text.startsWith('// 42 Horizon — appel autonome')) {
    // self-contained call (16 Oct.): data then renderer in the same code
    const X = JSON.parse(text.split('\n')[2].slice('const X = '.length, -1));
    pages[X.page] = pages[X.page] || Object.assign(new Node('PAGE'), { name: 'page ' + X.page });
    if (text.length > 50000) { console.log('ERROR', f, 'code longer than 50 000 characters:', text.length); process.exitCode = 1; break; }
    // 18 Oct.: instances of library variants (nodes « C »): an id not created by an earlier library call of this run is
    // seeded with the size of its variant in ../components/library.json, so a size drift is still detected
    if (X.components) {
      const LIB = JSON.parse(fs.readFileSync(process.env.SIM_LIBRARY || new URL('../components/library.json', import.meta.url)));
      for (const [fam, vs] of Object.entries(X.components)) for (const [vn, id] of Object.entries(vs)) {
        if (comps[id]) continue;
        const v = LIB[fam] && LIB[fam].variants[vn];
        if (!v) { console.log('ERROR', f, 'variant unknown to library.json:', fam, vn); process.exitCode = 1; break; }
        comps[id] = Object.assign(new Node('COMPONENT'), { id, name: vn, width: v.frame.w, height: v.frame.h });
      }
      if (process.exitCode) break;
    }
    try {
      const res = await new AsyncFunction('figma', text)(figma);
      if (res.library) {
        // 18 Oct.: library call: sets combined with all their variants, nothing left in the sections but sets and
        // components, every component in the modes of its scene
        const problems = [...(res.stats.modeMismatchNames || []).map(n => 'modes of ' + n)];
        const S = JSON.parse(text.split('\n')[1].slice('const S = '.length, -1));
        for (const fam of S.library) {
          const r = res.library[fam.key], sec = comps[r.section] || pages[X.page].findOne(n => n.id === r.section);
          if (!sec) { problems.push(fam.key + ': no section'); continue; }
          if (sec.children.some(n => !['COMPONENT', 'COMPONENT_SET'].includes(n.type))) problems.push(fam.key + ': temporary node left in the section');
          if (fam.combine) {
            const set = comps[r.set];
            if (!set || set.children.length !== fam.names.length) problems.push(fam.key + ': set of ' + (set ? set.children.length : 0) + ' variants instead of ' + fam.names.length);
            if (set && set.children.some(c => c.x < 0 || c.y < 0 || c.x + c.width > set.width + 0.01 || c.y + c.height > set.height + 0.01)) problems.push(fam.key + ': variant outside its set');
          }
          for (const v of fam.variants) {
            const c = comps[r.made[v.name]];
            if (!c) { problems.push(fam.key + ': ' + v.name + ' not made'); continue; }
            if (Math.abs(c.width - v.node.w) > 0.05 || Math.abs(c.height - v.node.h) > 0.05) problems.push(fam.key + ': ' + v.name + ' is ' + c.width + '×' + c.height + ' instead of ' + v.node.w + '×' + v.node.h);
            const want = (v.pinLang ? 1 : 0) + (v.pinTheme ? 1 : 0), got = Object.keys(c.modes || {}).length;
            if (want !== got) problems.push(fam.key + ': ' + v.name + ' has ' + got + ' explicit modes instead of ' + want);
          }
        }
        const counts = Object.fromEntries(Object.entries(res.library).map(([k, r]) => [k, Object.keys(r.made).length + (r.set ? ' + set' : '')]));
        console.log(problems.length ? 'ERROR' : 'OK', f, text.length, JSON.stringify(res.stats), 'library', JSON.stringify(counts), 'missing', JSON.stringify({ ...res.missing, vars: res.missing.vars.length }), problems.length ? JSON.stringify(problems.slice(0, 12)) : '');
        if (problems.length) { process.exitCode = 1; break; }
        continue;
      }
      const ign = spreadIgnored(pages[X.page]);
      console.log('OK', f, text.length, JSON.stringify(res.stats), 'missing', JSON.stringify({ ...res.missing, vars: res.missing.vars.length }), 'name', JSON.stringify(res.name), ign ? 'WARNING spread ignored by Figma on ' + ign + ' frames' : '');
    } catch (e) { console.log('ERROR', f, e.message); process.exitCode = 1; break; }
    continue;
  }
  if (text.startsWith('// 42 Horizon — mise à jour en place des ressources')) {
    // 17 Oct.: in-place update of asset components (assets.py update). The components of the call are seeded as they
    // were imported (a text layer and a vector, description naming the capture ref) on the page « Icônes et marque »;
    // after the call: same ids, no text left, new children with SCALE constraints, theme strokes bound.
    const bad = ['loadAllPagesAsync', 'setPluginData', 'setSharedPluginData', 'createImageAsync', 'eval(', 'new Function'].filter(t => text.includes(t));
    if (bad.length || text.length >= 49500) { console.log('ERROR', f, 'refused:', bad.join(', ') || 'code of ' + text.length + ' characters'); process.exitCode = 1; break; }
    const U = JSON.parse(text.split('\n').find(l => l.startsWith('const U = ')).slice('const U = '.length, -1));
    const pid = /getNodeByIdAsync\('([^']+)'\)/.exec(text)[1];
    const page = pages[pid] = pages[pid] || Object.assign(new Node('PAGE'), { id: pid, name: 'Icônes et marque' });
    for (const u of U) {
      if (comps[u.id]) continue;
      const c = Object.assign(new Node('COMPONENT'), { id: u.id, width: u.w, height: u.h, name: u.prefix + 'mock', description: 'Ressource du prototype, identifiant de relevé ' + u.ref + '.' });
      const t = new Node('TEXT'); t.fontName = { family: 'Mock', style: 'Regular' }; t.characters = 'ancien texte'; c.appendChild(t);
      const v = new Node('VECTOR'); v.strokes = []; c.appendChild(v); page.appendChild(c); c._old = [t, v]; comps[u.id] = c;
    }
    for (const p of JSON.parse(fs.readFileSync(new URL('../palette.json', import.meta.url))).vars) if (!vars.some(v => v.name === p.name)) vars.push(resolvable({ id: 'V:' + (idc++), name: p.name, variableCollectionId: 'VariableCollectionId:3:2', valuesByMode: {} }));
    const before = page.children.length;
    try {
      const res = await new AsyncFunction('figma', text)(figma);
      const problems = [...res.errors];
      for (const u of U) {
        const c = comps[u.id], r = res.updated.find(x => x.ref === u.ref);
        if (!r) continue;
        if (r.id !== u.id) problems.push(u.ref + ': id changed');
        if (c.findAll(n => n.type === 'TEXT').length) problems.push(u.ref + ': text layer left');
        if ((c._old || []).some(o => !o.removed || c.children.includes(o)) || c.children.some(n => n.removed)) problems.push(u.ref + ': old child kept');
        if (c.children.some(n => n.type !== 'GROUP' && n.constraints && (n.constraints.horizontal !== 'SCALE' || n.constraints.vertical !== 'SCALE'))) problems.push(u.ref + ': constraint not SCALE');
        if (u.bind && !r.bound) problems.push(u.ref + ': no stroke bound to ' + u.bind.v);
        if (!u.bind && r.bound) problems.push(u.ref + ': unexpected binding');
      }
      if (page.children.length !== before) problems.push('page children ' + before + ' → ' + page.children.length + ' (temporary frame left?)');
      console.log(problems.length ? 'ERROR' : 'OK', f, text.length, 'updated', res.updated.length + '/' + U.length, JSON.stringify(res.updated.map(r => [r.ref, r.children, r.shapes, r.texts, r.bound])), problems.length ? JSON.stringify(problems) : '');
      if (problems.length) { process.exitCode = 1; break; }
    } catch (e) { console.log('ERROR', f, e.message); process.exitCode = 1; break; }
    continue;
  }
  if (text.startsWith('// 42 Horizon — symboles redessinés sur place')) {
    // 18 Oct.: symbol components redrawn in place (symbols_call.py update). The components are seeded in their section
    // (title 32 px and note 16 px texts, one vector each); after the call: same ids, one new vector with SCALE
    // constraints, the new size, the new name, no temporary node left in the section.
    const A = JSON.parse(text.split('\n').find(l => l.startsWith('const A = ')).slice('const A = '.length, -1));
    const pid = /getNodeByIdAsync\('([^']+)'\)/.exec(text)[1];
    const page = pages[pid] = pages[pid] || Object.assign(new Node('PAGE'), { id: pid, name: 'Icônes et marque' });
    const sec = new Node('SECTION'); sec.name = 'Symboles (DejaVu Sans)'; page.appendChild(sec);
    for (const [size, s] of [[32, 'Symboles (DejaVu Sans)'], [16, 'ancienne note']]) { const tx = new Node('TEXT'); tx.fontName = { family: 'Jost', style: 'Regular' }; tx.fontSize = size; tx.characters = s; sec.appendChild(tx); }
    for (const a of A) {
      const c = Object.assign(new Node('COMPONENT'), { id: a.id, width: 104.2, height: 116.4, name: 'Symbole/DejaVu Sans · mock' });
      c.getInstancesAsync = async () => [];
      const v = new Node('VECTOR'); c.appendChild(v); c._old = [v]; sec.appendChild(c); comps[a.id] = c;
    }
    for (const p of JSON.parse(fs.readFileSync(new URL('../palette.json', import.meta.url))).vars) if (!vars.some(v => v.name === p.name)) vars.push(resolvable({ id: 'V:' + (idc++), name: p.name, variableCollectionId: 'VariableCollectionId:3:2', valuesByMode: {} }));
    const before = sec.children.length;
    try {
      const res = await new AsyncFunction('figma', text)(figma);
      const problems = res.missing.map(m => 'missing ' + m);
      for (const a of A) {
        const c = comps[a.id], r = res.updated[a.ref];
        if (!r) { problems.push(a.ref + ': not updated'); continue; }
        if (r.id !== a.id) problems.push(a.ref + ': id changed');
        if (c._old.some(o => !o.removed || c.children.includes(o))) problems.push(a.ref + ': old vector kept');
        if (!c.children.length) problems.push(a.ref + ': empty component');
        if (c.children.some(n => n.constraints && (n.constraints.horizontal !== 'SCALE' || n.constraints.vertical !== 'SCALE'))) problems.push(a.ref + ': constraint not SCALE');
        if (c.name !== a.name) problems.push(a.ref + ': name ' + c.name);
      }
      if (sec.children.length !== before) problems.push('section children ' + before + ' → ' + sec.children.length + ' (temporary node left?)');
      if (sec.name !== 'Symboles (polices de secours de Chrome)') problems.push('section not renamed');
      console.log(problems.length ? 'ERROR' : 'OK', f, text.length, JSON.stringify(res.updated), problems.length ? JSON.stringify(problems) : '');
      if (problems.length) { process.exitCode = 1; break; }
    } catch (e) { console.log('ERROR', f, e.message); process.exitCode = 1; break; }
    continue;
  }
  if (!text.startsWith('const R = new')) { console.log('skip (not a scene call):', f); continue; }
  const line = text.split('\n')[1];
  const [S, X] = JSON.parse('[' + line.slice('return await R(figma, '.length, -2) + ']');
  pages[X.page] = pages[X.page] || Object.assign(new Node('PAGE'), { name: 'page ' + X.page });
  const R = new AsyncFunction('figma', 'S', 'X', rendererSrc);
  try {
    const res = await R(figma, S, X);
    const top = pages[X.page].children.find(n => n.id === res.id);
    console.log('OK', f, JSON.stringify(res.stats), 'missing', JSON.stringify(res.missing), 'name', JSON.stringify(res.name), 'markers left', top ? top.findAll(n => /⟨p\d+⟩/.test(n.name)).length : '?');
  } catch (e) { console.log('ERROR', f, e.message); process.exitCode = 1; break; }
}
console.log('page frames:', Object.values(pages).map(p => p.children.map(c => c.name)));
