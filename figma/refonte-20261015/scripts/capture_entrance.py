"""Zone « Arrivée et décryptage » (entrance) — captures, layout dumps and canvas command lists for the Figma
rebuild of 15 October 2026.

Read-only on the prototype: loads http://127.0.0.1:8765/site/index.html through
capture_lib.py (one headless Chrome from helper.py: shared slots, memory cap, profile outside /tmp). Nothing of the
prototype is modified: the hooks below are injected in the captured page only (Page.addScriptToEvaluateOnNewDocument).

1. Time is driven deterministically (same method as horizon-welcome/checks/20261013-scanner-dark-browser.py):
   * the entrance's own requestAnimationFrame callbacks (scan/decryption `tick`, reveal `update`) are queued and
     played by qaFrame/qaAdvance (16 ms steps of the entrance clock) and qaReveal(t) (t = linear 0..1 of the 1.2 s
     reveal, eased by the prototype with smoothstep);
   * the 4 s timer of the arrival labels is held and played on demand by qaLabelTick();
   * when qaHold is on, every new element.animate() (slogan hold, logo, phrase fade, ring) starts paused at 0 and is
     positioned with qaSeek(ms), then released with qaPlay().
2. Canvas interception (CANVAS_HOOK): every CanvasRenderingContext2D call and property assignment is logged per
   canvas, with the full drawing state at each drawing call (transform, font, colours, alpha, alignment, baseline,
   filter, shadow, composite, letter spacing, rectangular clip). The log of the entrance canvas restarts at each
   full-frame clearRect (the renderer clears the whole canvas at the start of every frame), so a dump holds only the
   last rendered frame. Offscreen sprite canvases (one glyph, one byte in binary or hex) keep their own drawing
   commands, which are exported for the sprites drawn by that frame. Gradients and their colour stops are logged too.
   Each dump is replayed in the same page onto a fresh canvas and compared byte for byte with the real canvas.
3. Theme: the saved preference (localStorage horizon-theme-preference-v1) is written before the page scripts run.
   Globe: 'blocked' (Network.setBlockedURLs → error screen), 'held' (Fetch interception never answered → the world
   stays « en préparation »), 'real' (WebGL globe, for the reveal).

Usage (one lot per run, each well under 9 minutes; never two capture scripts at once):
  cd /home/le-rif/Bureau/Transcendence && timeout 580 python3 figma/refonte-20261015/scripts/capture_entrance.py <lot> [variants]
Lots: fonts, scan, labels, dialogs, decrypt, opening, wait, error, languages, reveal, then offline: sheets, index
Variants (optional, scan/labels/dialogs/decrypt/opening/wait/error/reveal): desktop-light mobile-dark …
Outputs: ../reference/entrance/*.png + index.json (versioned); ../dom/entrance/*.json.gz (DOM), *.canvas.json
(canvas frames), _fonts.json, _sheets/*.png (not versioned).
"""
import gzip, hashlib, json, math, pathlib, re, sys, time

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from capture_lib import *  # noqa: E402,F401  (start, open_app, snap, write_index, contact_sheet, DESKTOP, MOBILE, BASE, REF, DOM)
import capture_lib  # noqa: E402

AREA = 'entrance'
FORMATS = {'desktop': DESKTOP, 'mobile': MOBILE}
VARIANTS = [('desktop', 'light'), ('desktop', 'dark'), ('mobile', 'light'), ('mobile', 'dark')]
RECORDS = []
PROTO = capture_lib.REPO / 'site'
WATCHED = ['index.html', 'welcome.mjs', 'entrance.mjs', 'entrance.css', 'welcome.css', 'design-review-selection.css',
           'design-review-selection.mjs', 'account-menu.mjs', 'account-menu.css', 'theme-bootstrap.js',
           '../decryption-examples/scanner-return-random.mjs', '../decryption-examples/scanner-return-together.mjs',
           '../decryption-examples/shared.mjs', '../horizon-decryption-engine.mjs', '../../figma/tokens.css',
           '../../figma/logo-42.svg', '../assets/jost.css', '../assets/jost-1.ttf']
PHRASE = 'BEYOND THE CODE'


def sources():
    """sha256 (12 hex) of the prototype files that define this zone, to detect a concurrent change."""
    out = {}
    for name in WATCHED:
        path = (PROTO / name).resolve()
        out[name] = hashlib.sha256(path.read_bytes()).hexdigest()[:12] if path.exists() else None
    return out


SOURCES_AT_START = sources()

QA_HOOK = r'''(() => {
  if (window.__qaEntranceHook) return; window.__qaEntranceHook = true;
  // 1. Entrance clock: only the entrance's own frame callbacks are queued (scan/decryption tick, reveal update).
  const nativeFrame = window.requestAnimationFrame.bind(window), nativeCancel = window.cancelAnimationFrame.bind(window);
  const frames = new Map(); let nextFrame = -1;
  const kindOf = cb => typeof cb !== 'function' ? null
    : cb.name === 'tick' && String(cb).includes('elapsed') ? 'tick'
    : cb.name === 'update' && String(cb).includes('3-2*t') ? 'update' : null;
  window.requestAnimationFrame = cb => { const kind = kindOf(cb); if (!kind) return nativeFrame(cb); const id = nextFrame--; frames.set(id, {cb, kind, queuedAt: performance.now()}); return id; };
  window.cancelAnimationFrame = id => { if (frames.delete(id)) return; nativeCancel(id); };
  const take = kind => { for (const [id, f] of frames) if (f.kind === kind) { frames.delete(id); return f; } return null; };
  window.qaNow = 0;
  window.qaPending = kind => [...frames.values()].filter(f => !kind || f.kind === kind).length;
  window.qaFrame = time => { const f = take('tick'); if (!f) throw Error('No entrance frame'); window.qaNow = time; f.cb(time); return true; };
  window.qaAdvance = target => {
    while (window.qaNow < target && window.qaPending('tick')) window.qaFrame(Math.min(target, window.qaNow + 16));
    const scene = document.querySelector('#entrance-scene');
    return {time: window.qaNow, entry: document.body.dataset.entry, phase: scene && scene.dataset.phase, text: scene && scene.dataset.renderedText};
  };
  window.qaRevealStart = null; window.qaRevealT = null;
  window.qaReveal = t => { const f = take('update'); if (!f) throw Error('No reveal frame'); if (window.qaRevealStart === null) window.qaRevealStart = f.queuedAt; window.qaRevealT = t; f.cb(window.qaRevealStart + t * 1200); return {t, entry: document.body.dataset.entry}; };
  // 2. Arrival labels: the 4 s rotation timer is held; qaLabelTick() plays one change.
  const nativeSetTimeout = window.setTimeout.bind(window), nativeClearTimeout = window.clearTimeout.bind(window);
  const labelTimers = new Map(); let nextTimer = -1;
  window.setTimeout = function (fn, delay, ...args) {
    if (delay === 4000 && typeof fn === 'function' && String(fn).includes('canCycleLanguage')) { const id = nextTimer--; labelTimers.set(id, () => fn(...args)); return id; }
    return nativeSetTimeout(fn, delay, ...args);
  };
  window.clearTimeout = id => { if (labelTimers.delete(id)) return; nativeClearTimeout(id); };
  window.qaLabelPending = () => labelTimers.size;
  window.qaLabelTick = () => { for (const [id, fn] of labelTimers) { labelTimers.delete(id); fn(); return true; } return false; };
  // 3. Web Animations: with qaHold on, each new element.animate() starts paused at 0 (qaSeek / qaPlay).
  const nativeAnimate = Element.prototype.animate;
  window.qaHold = false; window.qaHeld = [];
  Element.prototype.animate = function (...args) { const a = nativeAnimate.apply(this, args); if (window.qaHold) { a.pause(); a.currentTime = 0; window.qaHeld.push(a); } return a; };
  const label = a => { const t = a.effect && a.effect.target; if (!t) return '?'; const c = typeof t.className === 'string' ? t.className : (t.getAttribute && t.getAttribute('class')); return t.id || c || t.tagName; };
  window.qaHeldInfo = () => window.qaHeld.map(a => { const k = a.effect.getKeyframes(), tm = a.effect.getTiming(); return {target: label(a), currentTime: a.currentTime, end: a.effect.getComputedTiming().endTime, progress: a.effect.getComputedTiming().progress, playState: a.playState, duration: tm.duration, easing: tm.easing, fill: tm.fill, keyframes: k}; });
  window.qaSeek = ms => window.qaHeld.map(a => { const end = a.effect.getComputedTiming().endTime; a.currentTime = Math.min(ms, end); return [label(a), a.currentTime, end]; });
  window.qaPlay = () => { const list = window.qaHeld.splice(0); list.forEach(a => a.play()); return list.length; };
})();'''

CANVAS_HOOK = r'''(() => {
  if (window.__qaCanvasHook) return; window.__qaCanvasHook = true;
  const P = CanvasRenderingContext2D.prototype;
  const ids = new WeakMap(), logs = new Map(), states = new WeakMap(), gradIds = new WeakMap(), gradDefs = new Map(), contexts = new WeakMap();
  let nextId = 1, nextGrad = 1;
  const CAP = 400, MAIN_CAP = 20000, r3 = v => Math.round(v * 1000) / 1000;
  const PROPS = ['font','fillStyle','strokeStyle','lineWidth','lineCap','lineJoin','lineDashOffset','globalAlpha','globalCompositeOperation','textAlign','textBaseline','direction','letterSpacing','wordSpacing','fontKerning','fontStretch','fontVariantCaps','textRendering','filter','shadowBlur','shadowColor','shadowOffsetX','shadowOffsetY','imageSmoothingEnabled','imageSmoothingQuality'];
  const desc = {};
  for (const p of PROPS) { const d = Object.getOwnPropertyDescriptor(P, p); if (d && d.get && d.set) desc[p] = d; }
  const off = () => window.__qaReplaying === true;
  const idOf = c => { if (!c) return null; let id = ids.get(c); if (!id) { id = nextId++; ids.set(c, id); } return id; };
  const isMain = ctx => { const c = ctx.canvas; return !!(c && c.parentElement && c.parentElement.id === 'entrance-scene'); };
  const logOf = ctx => { const id = idOf(ctx.canvas); let l = logs.get(id); if (!l) { l = {id, commands: [], frame: 0, total: 0, initialState: null}; logs.set(id, l); } return l; };
  const fresh = () => ({clip: null, path: [], stack: []});
  const stOf = ctx => { let m = states.get(ctx); if (!m) { m = fresh(); states.set(ctx, m); } return m; };
  const style = v => {
    if (v && typeof v === 'object') { const g = gradIds.get(v); if (g) return Object.assign({gradient: g}, gradDefs.get(g)); return {object: Object.prototype.toString.call(v)}; }
    return v;
  };
  const snapshot = ctx => {
    const t = ctx.getTransform(), o = {m: [t.a, t.b, t.c, t.d, t.e, t.f], clip: stOf(ctx).clip, lineDash: ctx.getLineDash()};
    for (const p in desc) o[p] = style(desc[p].get.call(ctx));
    return o;
  };
  const ser = v => {
    if (v instanceof HTMLCanvasElement) return {canvas: idOf(v), w: v.width, h: v.height};
    if (typeof HTMLImageElement !== 'undefined' && v instanceof HTMLImageElement) return {img: v.currentSrc || v.src, w: v.naturalWidth, h: v.naturalHeight};
    if (typeof OffscreenCanvas !== 'undefined' && v instanceof OffscreenCanvas) return {offscreen: true, w: v.width, h: v.height};
    if (typeof ImageBitmap !== 'undefined' && v instanceof ImageBitmap) return {bitmap: true, w: v.width, h: v.height};
    if (typeof ImageData !== 'undefined' && v instanceof ImageData) return {imageData: true, w: v.width, h: v.height};
    if (typeof Path2D !== 'undefined' && v instanceof Path2D) return {path2d: true};
    if (v && typeof v === 'object') return style(v);
    return v;
  };
  const push = (ctx, entry) => {
    const l = logOf(ctx); l.total++;
    if (isMain(ctx)) { l.main = true; if (l.commands.length < MAIN_CAP) l.commands.push(entry); }
    else if (l.commands.length < CAP) l.commands.push(entry);
  };
  const devRect = (ctx, x, y, w, h) => { const t = ctx.getTransform(), xs = [], ys = []; for (const [px, py] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) { xs.push(t.a * px + t.c * py + t.e); ys.push(t.b * px + t.d * py + t.f); } return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map(r3); };
  const DRAW = new Set(['fillText','strokeText','fillRect','strokeRect','clearRect','drawImage','fill','stroke','putImageData']);
  const wrap = (name, before) => {
    const orig = P[name]; if (typeof orig !== 'function') return;
    P[name] = function (...args) {
      if (!off()) try {
        const entry = {op: name, args: args.map(ser)};
        if (before) before.call(this, entry, args);
        if (DRAW.has(name)) entry.st = snapshot(this);
        push(this, entry);
      } catch (error) { (window.__qaCanvasErrors = window.__qaCanvasErrors || []).push(name + ': ' + error); }
      return orig.apply(this, args);
    };
  };
  // A full-frame clearRect on the entrance canvas starts a new frame: only the last frame is kept.
  wrap('clearRect', function (entry, [x, y, w, h]) {
    entry.dev = devRect(this, x, y, w, h);
    const c = this.canvas, r = entry.dev;
    if (isMain(this) && r[0] <= .5 && r[1] <= .5 && r[2] >= c.width - .5 && r[3] >= c.height - .5) {
      const l = logOf(this); l.commands = []; l.frame++; l.frameAt = performance.now(); l.frameClock = window.qaNow; l.initialState = snapshot(this); entry.frameStart = l.frame;
    }
  });
  wrap('beginPath', function () { stOf(this).path = []; });
  wrap('closePath');
  for (const n of ['moveTo','lineTo','arc','arcTo','ellipse','bezierCurveTo','quadraticCurveTo']) wrap(n, function () { stOf(this).path.push({other: n}); });
  wrap('rect', function (entry, [x, y, w, h]) { entry.dev = devRect(this, x, y, w, h); stOf(this).path.push({rect: entry.dev}); });
  wrap('roundRect', function (entry, [x, y, w, h]) { entry.dev = devRect(this, x, y, w, h); stOf(this).path.push({other: 'roundRect', box: entry.dev}); });
  wrap('clip', function (entry, args) {
    const m = stOf(this);
    if (args.length && args[0] && typeof args[0] === 'object') { m.clip = 'path2d'; entry.clip = 'path2d'; return; }
    const rects = m.path.filter(p => p.rect).map(p => p.rect);
    if (rects.length && rects.length === m.path.length) {
      let r = [Math.min(...rects.map(q => q[0])), Math.min(...rects.map(q => q[1])), Math.max(...rects.map(q => q[2])), Math.max(...rects.map(q => q[3]))];
      if (Array.isArray(m.clip)) r = [Math.max(r[0], m.clip[0]), Math.max(r[1], m.clip[1]), Math.min(r[2], m.clip[2]), Math.min(r[3], m.clip[3])];
      m.clip = r; entry.clip = r; entry.clipExact = rects.length === 1;
    } else { m.clip = 'path'; entry.clip = 'path'; }
  });
  wrap('save', function () { const m = stOf(this); m.stack.push(m.clip); });
  wrap('restore', function () { const m = stOf(this); m.clip = m.stack.length ? m.stack.pop() : null; });
  wrap('reset', function () { states.set(this, fresh()); });
  for (const n of ['setTransform','resetTransform','translate','scale','rotate','transform','setLineDash']) wrap(n);
  wrap('fillRect', function (entry, [x, y, w, h]) { entry.dev = devRect(this, x, y, w, h); });
  wrap('strokeRect', function (entry, [x, y, w, h]) { entry.dev = devRect(this, x, y, w, h); });
  wrap('fill'); wrap('stroke'); wrap('putImageData');
  wrap('drawImage', function (entry, args) {
    const n = args.length, src = args[0];
    const b = n === 3 ? [args[1], args[2], src.width, src.height] : n === 5 ? args.slice(1, 5) : args.slice(5, 9);
    entry.dev = devRect(this, ...b);
  });
  const text = function (entry, [value]) {
    const pick = m => ({width: m.width, left: m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight, ascent: m.actualBoundingBoxAscent, descent: m.actualBoundingBoxDescent,
      fontAscent: m.fontBoundingBoxAscent, fontDescent: m.fontBoundingBoxDescent, emAscent: m.emHeightAscent, emDescent: m.emHeightDescent,
      alphabetic: m.alphabeticBaseline, hanging: m.hangingBaseline, ideographic: m.ideographicBaseline});
    const measured = P.measureText.call(this, value);
    entry.metrics = pick(measured);
    const baseline = desc.textBaseline.get.call(this);
    if (baseline === 'alphabetic') entry.alphabeticOffset = 0;
    else { desc.textBaseline.set.call(this, 'alphabetic'); const a = P.measureText.call(this, value); desc.textBaseline.set.call(this, baseline); entry.alphabeticOffset = a.fontBoundingBoxAscent - measured.fontBoundingBoxAscent; }
    try { entry.fontLoaded = document.fonts.check(desc.font.get.call(this), value); } catch (error) {}
  };
  wrap('fillText', text); wrap('strokeText', text);
  for (const p in desc) {
    const d = desc[p];
    Object.defineProperty(P, p, {configurable: true, enumerable: d.enumerable, get() { return d.get.call(this); },
      set(v) { if (!off()) try { push(this, {op: 'set', prop: p, value: ser(v)}); } catch (e) {} d.set.call(this, v); }});
  }
  for (const n of ['createLinearGradient','createRadialGradient','createConicGradient']) {
    const orig = P[n]; if (typeof orig !== 'function') continue;
    P[n] = function (...args) {
      const g = orig.apply(this, args);
      if (!off()) { const id = nextGrad++; gradIds.set(g, id); gradDefs.set(id, {type: n.slice(6, -8).toLowerCase(), args, stops: [], canvas: idOf(this.canvas)}); try { push(this, {op: n, args, gradient: id}); } catch (e) {} }
      return g;
    };
  }
  const addStop = CanvasGradient.prototype.addColorStop;
  CanvasGradient.prototype.addColorStop = function (offset, color) { const id = gradIds.get(this); if (id && !off()) gradDefs.get(id).stops.push([offset, color]); return addStop.call(this, offset, color); };
  // Resizing a canvas resets its drawing state: the clip tracker follows.
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) { const ctx = getContext.call(this, type, ...rest); if (ctx && type === '2d') contexts.set(this, ctx); return ctx; };
  for (const dim of ['width', 'height']) {
    const d = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, dim);
    Object.defineProperty(HTMLCanvasElement.prototype, dim, {configurable: true, enumerable: d.enumerable, get() { return d.get.call(this); },
      set(v) { d.set.call(this, v); const ctx = contexts.get(this); if (ctx && !off()) { states.set(ctx, fresh()); try { push(ctx, {op: 'resize', prop: dim, value: v}); } catch (e) {} } }});
  }
  const box = e => { const r = e.getBoundingClientRect(); return {x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height}; };
  window.qaCanvasFrame = (selector = '#entrance-scene canvas') => { const c = document.querySelector(selector); const l = c && logs.get(ids.get(c)); return l ? l.frame : null; };
  window.qaCanvasDump = (selector = '#entrance-scene canvas') => {
    const canvas = document.querySelector(selector); if (!canvas) return null;
    const id = ids.get(canvas), l = id ? logs.get(id) : null, scene = canvas.parentElement;
    const cs = getComputedStyle(canvas), ss = scene && getComputedStyle(scene);
    const used = new Set(); for (const c of (l && l.commands) || []) for (const a of c.args || []) if (a && typeof a === 'object' && a.canvas) used.add(a.canvas);
    const sprites = {}; for (const sid of used) { const sl = logs.get(sid); sprites[sid] = sl ? {commands: sl.commands, total: sl.total} : null; }
    return {canvasId: id, width: canvas.width, height: canvas.height, css: box(canvas), client: [canvas.clientWidth, canvas.clientHeight], dpr: devicePixelRatio,
      canvasStyle: {width: cs.width, height: cs.height, opacity: cs.opacity, transform: cs.transform, filter: cs.filter, display: cs.display, minHeight: cs.minHeight},
      scene: scene ? {id: scene.id, hidden: scene.hidden, box: box(scene), opacity: ss.opacity, transform: ss.transform, filter: ss.filter, visibility: ss.visibility, display: ss.display, zIndex: ss.zIndex, direction: ss.direction,
        dataset: Object.assign({}, scene.dataset), ink: ss.getPropertyValue('--h42-color-text').trim(), accent: ss.getPropertyValue('--h42-color-accent').trim()} : null,
      entranceClock: window.qaNow, frame: l ? {index: l.frame, startedAt: l.frameAt, clock: l.frameClock, initialState: l.initialState, count: l.commands.length, total: l.total, commands: l.commands} : null,
      sprites, gradients: Object.fromEntries(gradDefs), hookErrors: window.__qaCanvasErrors || []};
  };
  // Replays a dump on fresh canvases (sprites first) and compares the result with the live canvas, byte for byte.
  window.qaCanvasReplay = (dump, selector = '#entrance-scene canvas') => {
    const live = document.querySelector(selector); if (!live || !dump || !dump.frame) return null;
    window.__qaReplaying = true;
    try {
      const made = {};
      const value = (ctx, v) => {
        if (v && typeof v === 'object') {
          if (v.canvas) return make(v);
          if (v.gradient) { const g = v.type === 'linear' ? ctx.createLinearGradient(...v.args) : v.type === 'radial' ? ctx.createRadialGradient(...v.args) : ctx.createConicGradient(...v.args); for (const [o, col] of v.stops) g.addColorStop(o, col); return g; }
        }
        return v;
      };
      const run = (ctx, commands, init) => {
        if (init) for (const [k, v] of Object.entries(init)) { if (k === 'm') ctx.setTransform(...v); else if (k === 'lineDash') ctx.setLineDash(v); else if (k !== 'clip' && v !== null && v !== undefined) { try { ctx[k] = value(ctx, v); } catch (e) {} } }
        for (const c of commands) {
          if (c.op === 'set') { try { ctx[c.prop] = value(ctx, c.value); } catch (e) {} continue; }
          if (c.op === 'resize' || /^create/.test(c.op) || typeof ctx[c.op] !== 'function') continue;
          ctx[c.op](...(c.args || []).map(a => value(ctx, a)));
        }
      };
      const make = ref => {
        if (made[ref.canvas]) return made[ref.canvas];
        const c = document.createElement('canvas'); c.width = ref.w; c.height = ref.h; made[ref.canvas] = c;
        const sprite = dump.sprites[ref.canvas]; if (sprite) run(c.getContext('2d'), sprite.commands.filter(x => x.op !== 'resize'), null);
        return c;
      };
      const out = document.createElement('canvas'); out.width = live.width; out.height = live.height;
      run(out.getContext('2d'), dump.frame.commands, dump.frame.initialState);
      const a = live.getContext('2d').getImageData(0, 0, live.width, live.height).data, b = out.getContext('2d').getImageData(0, 0, out.width, out.height).data;
      let differing = 0, max = 0, painted = 0;
      for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); if (d) { differing++; if (d > max) max = d; } }
      for (let i = 3; i < a.length; i += 4) if (a[i]) painted++;
      return {identical: differing === 0, differingBytes: differing, maxDelta: max, bytes: a.length, paintedPixels: painted, sprites: Object.keys(made).length};
    } finally { window.__qaReplaying = false; }
  };
})();'''

# The renderer's own layout rules (decryption-examples/scanner-return-together.mjs), recomputed in the page with the
# same measuring font: glyph cells in canvas CSS coordinates, beam geometry, settle times of the n°22 order.
SCENE_META = r'''((elapsed) => {
  const scene = document.querySelector('#entrance-scene'); if (!scene) return null;
  const canvas = scene.querySelector('canvas'); if (!canvas) return null;
  const r = scene.getBoundingClientRect(), width = scene.clientWidth || 800, height = scene.clientHeight || 400;
  const mobile = width < 700, size = mobile ? Math.min(48, width / 7) : Math.min(86, width / 11.2);
  const plain = 'BEYOND THE CODE', cipher = scene.dataset.ciphertext || '';
  const m = document.createElement('canvas').getContext('2d'); m.font = `500 ${size}px Jost, sans-serif`;
  const groups = mobile ? [[0, 6], [7, plain.length]] : [[0, plain.length]];
  const cells = []; let left = width, right = 0, top = height, bottom = 0;
  groups.forEach(([s, e], row) => {
    const widths = []; let rowWidth = 0;
    for (let i = s; i < e; i++) { const w = m.measureText(plain[i]).width + size * .02; widths.push(w); rowWidth += w; }
    let x = (width - rowWidth) / 2; const y = height / 2 + (row - (groups.length - 1) / 2) * size * 1.38;
    left = Math.min(left, x); right = Math.max(right, x + rowWidth); top = Math.min(top, y - size * .65); bottom = Math.max(bottom, y + size * .65);
    for (let i = s; i < e; i++) { const w = widths[i - s]; cells.push({i, clear: plain[i], cipher: cipher[i], row, x0: x, cx: x + w / 2, cy: y, w}); x += w; }
  });
  const order = (scene.dataset.resolutionOrder || '').split(',').filter(Boolean).map(Number);
  for (const c of cells) {
    if (c.clear === ' ') { c.space = true; continue; }
    const rank = order.indexOf(c.i); c.rank = rank; c.settleMs = 6050 + rank / Math.max(1, order.length - 1) * 600;
  }
  const pos = parseFloat(scene.dataset.beamPosition || '0'), pad = size * .24, p = Math.max(0, Math.min(1, (elapsed - 600) / 2800));
  const sm = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
  const scanning = scene.dataset.scan && scene.dataset.scan !== '0';
  return {sceneBox: {x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height}, sceneClient: [width, height], mobile, elapsedMs: elapsed,
    fontSize: size, rows: groups.length, rowPitch: size * 1.38, rowCentres: groups.map((g, row) => height / 2 + (row - (groups.length - 1) / 2) * size * 1.38),
    textBox: {left, right, top, bottom}, beamPadding: pad,
    beam: scanning ? {y: top - pad + (bottom - top + pad * 2) * pos, x: left - pad, span: right - left + pad * 2, opacity: sm(p / .05) * sm((1 - p) / .05)} : null,
    resolutionOrder: order, cells};
})'''

SYMBOL_META = r'''(() => {
  const sym = document.querySelector('#entrance-symbol'); if (!sym || sym.hidden) return null;
  const logo = sym.querySelector('.entrance-logo'), img = sym.querySelector('img'), svg = sym.querySelector('svg.entrance-ring'), circle = svg.querySelector('circle');
  const cs = e => getComputedStyle(e), box = e => { const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; };
  return {symbol: box(sym), symbolTransform: cs(sym).transform, symbolStyleTransform: sym.style.transform, logo: box(logo), logoOpacity: cs(logo).opacity, logoFilter: cs(logo).filter,
    logoTransform: cs(logo).transform, logoClip: cs(logo).clipPath, img: box(img), imgFilter: cs(img).filter, imgOpacity: cs(img).opacity, imgSrc: img.getAttribute('src'),
    ring: box(svg), ringColor: cs(svg).color, ringTransform: cs(svg).transform, circleOpacity: cs(circle).opacity, circleStroke: cs(circle).stroke,
    dashoffset: cs(circle).strokeDashoffset, dasharray: cs(circle).strokeDasharray, strokeWidth: cs(circle).strokeWidth, r: circle.getAttribute('r'), pathLength: circle.getAttribute('pathLength'),
    held: window.qaHeldInfo ? window.qaHeldInfo() : null};
})()'''

STATE_META = r'''(() => {
  const q = s => document.querySelector(s), cs = (e, p) => getComputedStyle(e, p);
  const box = e => { if (!e) return null; const r = e.getBoundingClientRect(); return {x: +r.left.toFixed(2), y: +r.top.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2)}; };
  const buttons = [...document.querySelectorAll('#entrance-access button')].map(b => ({id: b.id || null, cls: b.className, text: (b.querySelector('.entrance-action-label') || b).textContent,
    lang: b.getAttribute('lang'), box: box(b), labelDir: b.querySelector('.entrance-action-label')?.getAttribute('dir') || null,
    measures: [...b.querySelectorAll('.entrance-action-measure')].map(m => ({lang: m.lang, text: m.textContent, box: box(m)})),
    outgoing: b.querySelectorAll('.entrance-action-label-outgoing').length}));
  const dialog = q('#dialog'), status = q('#entrance-status'), toggle = q('#entry-theme-toggle'), account = q('.account-switcher');
  const bd = dialog && dialog.open ? cs(dialog, '::backdrop') : null;
  return {entry: document.body.dataset.entry, lang: document.documentElement.lang, dir: document.documentElement.dir, theme: document.documentElement.dataset.theme,
    themePreference: document.documentElement.dataset.themePreference, entranceLabel: q('#entrance')?.getAttribute('aria-label'), sceneLabel: q('#entrance-scene')?.getAttribute('aria-label'),
    sceneHidden: q('#entrance-scene')?.hidden, accessHidden: q('#entrance-access')?.hidden, access: box(q('#entrance-access')), buttons,
    status: status && !status.hidden ? {text: status.textContent, box: box(status)} : null,
    themeToggle: toggle && !toggle.hidden ? {label: toggle.getAttribute('aria-label'), box: box(toggle)} : null,
    account: account ? {display: cs(account).display, trigger: box(q('#profile')), label: q('#profile')?.getAttribute('aria-label'), menuOpen: !q('#account-menu')?.hidden} : null,
    dialog: dialog && dialog.open ? {kind: dialog.dataset.kind, title: q('#dialog-title')?.textContent, box: box(dialog), text: q('#dialog-content .dialog-text')?.textContent,
      buttons: [...document.querySelectorAll('#dialog-content > button')].map(b => ({text: b.textContent, cls: b.className, box: box(b)})), close: box(q('#close-dialog')),
      backdrop: bd ? {background: bd.backgroundColor, backdropFilter: bd.backdropFilter} : null} : null,
    focus: document.activeElement ? (document.activeElement.id || document.activeElement.className || document.activeElement.tagName) : null,
    focusVisible: document.activeElement ? document.activeElement.matches(':focus-visible') : false,
    labelTimers: window.qaLabelPending ? window.qaLabelPending() : null, held: window.qaHeldInfo ? window.qaHeldInfo() : null};
})()'''

REVEAL_META = r'''(() => {
  const g = document.querySelector('#globe'), v = document.querySelector('#entrance-veil'), canvas = document.querySelector('#globe canvas');
  const box = e => { if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; };
  const vs = getComputedStyle(v);
  return {t: window.qaRevealT, entry: document.body.dataset.entry, globe: {transform: g.style.transform, clipPath: g.style.clipPath, opacity: g.style.opacity, origin: g.style.transformOrigin, box: box(g), canvas: box(canvas), canvasSize: canvas ? [canvas.width, canvas.height] : null},
    veil: {hidden: v.hidden, mask: v.style.maskImage, background: vs.backgroundImage !== 'none' ? vs.backgroundImage : vs.backgroundColor}, entranceBackground: document.querySelector('#entrance').style.background};
})()'''

FONT_PROBE = r'''(() => {
  const paint = (font, text, w = 900, h = 260) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.font = font; x.textBaseline = 'middle'; x.fillStyle = '#000'; x.fillText(text, 20, h / 2);
    const d = x.getImageData(0, 0, w, h).data; let hash = 2166136261; for (let i = 3; i < d.length; i += 4) { hash ^= d[i]; hash = Math.imul(hash, 16777619) >>> 0; }
    const m = x.measureText(text); return {font: x.font, hash, width: m.width, ascent: m.actualBoundingBoxAscent, descent: m.actualBoundingBoxDescent}; };
  const mono = '0123456789ABCDEF', monoFont = '400 44.160000000000004px ui-monospace, SFMono-Regular, monospace';
  const ref = paint(monoFont, mono);
  const families = ['DejaVu Sans Mono', 'Liberation Mono', 'Noto Sans Mono', 'Ubuntu Mono', 'Ubuntu Sans Mono', 'Nimbus Mono PS', 'Courier New', 'FreeMono', 'Noto Mono'];
  const candidates = families.map(f => ({family: f, ...paint('400 44.160000000000004px "' + f + '"', mono)})).map(c => ({...c, identical: c.hash === ref.hash && Math.abs(c.width - ref.width) < 1e-6}));
  const generic = paint('400 44.160000000000004px monospace', mono);
  const jost = paint('500 192px Jost, sans-serif', 'BEYOND', 1400), fallback = paint('500 192px sans-serif', 'BEYOND', 1400);
  const faces = [...document.fonts].map(f => ({family: f.family, weight: f.weight, style: f.style, status: f.status}));
  return {monospace: {fontString: monoFont, reference: ref, genericMonospace: {...generic, identical: generic.hash === ref.hash}, candidates},
    jost: {glyphs: jost, sansSerifFallback: fallback, differsFromFallback: jost.hash !== fallback.hash, check500: document.fonts.check('500 192px Jost', 'BEYOND THE CODE')}, faces,
    userAgent: navigator.userAgent};
})()'''


# ---------------------------------------------------------------------------------------------------------------
def parse_name(name):
    m = re.match(r'^(?P<state>.+?)--(?P<format>desktop|mobile)--(?P<lang>fr|en|ar)-(?P<theme>light|dark)$', name)
    return m.groupdict() if m else {}


def install(s):
    """QA hooks on every new document of this session (never on the prototype files)."""
    s.c.call('Page.addScriptToEvaluateOnNewDocument', {'source': QA_HOOK})
    s.c.call('Page.addScriptToEvaluateOnNewDocument', {'source': CANVAS_HOOK})
    s._theme_script = None
    return s


def set_theme(s, theme):
    if getattr(s, '_theme_script', None):
        s.c.call('Page.removeScriptToEvaluateOnNewDocument', {'identifier': s._theme_script})
    src = "try{localStorage.setItem('horizon-theme-preference-v1'," + json.dumps(theme) + ")}catch(e){}"
    s._theme_script = s.c.call('Page.addScriptToEvaluateOnNewDocument', {'source': src})['identifier']


def arrive(s, fmt, theme, globe='blocked', advance=None):
    """Load index.html with ordinary motion; the scan is armed and its first frame painted (entrance clock t = 0)."""
    set_theme(s, theme)
    s.reduced(False)
    if globe == 'held':
        s.c.call('Fetch.enable', {'patterns': [{'urlPattern': '*integrated-globe.mjs*', 'requestStage': 'Request'}]})
    else:
        try: s.c.call('Fetch.disable')
        except Exception: pass
    open_app(s, '', FORMATS[fmt], entrance=True, block_globe=(globe == 'blocked'), settle=0.4)
    if not s.wait('window.qaPending && qaPending("tick")>0', 20):
        raise RuntimeError('scan not armed')
    s.js('qaFrame(0)')
    got = s.js('document.documentElement.dataset.theme')
    if got != theme:
        raise RuntimeError(f'theme {got} instead of {theme}')
    if advance is not None:
        s.js(f'qaAdvance({advance})')
    return s


def entry(s):
    return s.js('document.body.dataset.entry')


def wait_entry(s, value, seconds=25):
    if not s.wait(f'document.body.dataset.entry==={json.dumps(value)}', seconds):
        raise RuntimeError(f'entry {entry(s)} instead of {value}')


def hold(s, on=True):
    s.js(f'window.qaHold={"true" if on else "false"};true')


def seek(s, ms):
    out = s.js(f'qaSeek({ms})'); time.sleep(.15); return out


def play(s):
    return s.js('qaPlay()')


def scene_meta(s):
    return s.js(SCENE_META + '(window.qaNow)')


def state_meta(s):
    return s.js(STATE_META)


def symbol_meta(s):
    return s.js(SYMBOL_META)


def platform_fonts(s, selectors):
    """Fonts actually used by Chrome for the text of visible elements (CSS.getPlatformFontsForNode)."""
    s.c.call('DOM.enable'); s.c.call('CSS.enable')
    doc = s.c.call('DOM.getDocument', {'depth': 0})['root']['nodeId']
    out = {}
    for sel in selectors:
        try:
            node = s.c.call('DOM.querySelector', {'nodeId': doc, 'selector': sel})['nodeId']
            out[sel] = s.c.call('CSS.getPlatformFontsForNode', {'nodeId': node})['fonts'] if node else None
        except Exception as error:
            out[sel] = f'error: {error}'
    return out


# ---------------------------------------------------------------------------------------------------------------
# Canvas: dump, replay check and redraw list in page coordinates.
FONT_RE = re.compile(r'^(?P<pre>.*?)(?P<size>[\d.]+)px(?:\s*/\s*\S+)?\s+(?P<family>.+)$')


def font_parts(font):
    m = FONT_RE.match(font or '')
    if not m: return {'raw': font}
    pre = m.group('pre').split()
    weight = next((int(t) for t in pre if t.isdigit()), 700 if 'bold' in pre else 400)
    return {'raw': font, 'weight': weight, 'style': 'italic' if 'italic' in pre else 'normal', 'sizePx': float(m.group('size')), 'family': m.group('family')}


def hex_colour(value):
    """'#1b1b1b' or 'rgba(237, 52, 145, 0.5)' → ('#ED3491', alpha)."""
    if not isinstance(value, str): return None, None
    v = value.strip()
    if v.startswith('#') and len(v) == 7: return v.upper(), 1.0
    m = re.match(r'rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)', v)
    if m:
        r, g, b = (round(float(m.group(i))) for i in (1, 2, 3))
        return f'#{r:02X}{g:02X}{b:02X}', float(m.group(4)) if m.group(4) else 1.0
    return v, None


def r2(v):
    return None if v is None else round(v, 2)


def derive(raw):
    """Redraw list in page CSS px (viewport origin, scroll 0): every character with its font, size, horizontal
    scale, colour, opacity, anchor, alphabetic baseline, ink and clip; beam rectangles; text lines."""
    W, H, css = raw['width'], raw['height'], raw['css']
    kx, ky = W / css['w'], H / css['h']
    page = lambda xd, yd: (css['x'] + xd / kx, css['y'] + yd / ky)
    apply = lambda m, x, y: (m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5])
    rect_page = lambda r: None if not isinstance(r, list) else [r2(v) for v in (*page(r[0], r[1]), *page(r[2], r[3]))]
    cipher = (raw.get('scene') or {}).get('dataset', {}).get('ciphertext') or ''
    letters = [i for i, ch in enumerate(cipher or PHRASE) if ch != ' ']
    frame = raw['frame'] or {'commands': []}
    glyphs, beam, clips, passes = [], [], [], []
    pass_index, in_pass = 0, 0
    for k, c in enumerate(frame['commands']):
        op, st = c['op'], c.get('st') or {}
        if op == 'clip':
            pass_index += 1; in_pass = 0
            clips.append({'command': k, 'page': rect_page(c.get('clip')), 'exact': c.get('clipExact')})
            continue
        if op == 'restore':
            continue
        if op == 'fillRect':
            colour, a = hex_colour(st.get('fillStyle'))
            beam.append({'command': k, 'page': rect_page(c.get('dev')), 'color': colour, 'globalAlpha': r2(st.get('globalAlpha')) if st.get('globalAlpha', 1) >= .01 else st.get('globalAlpha'),
                         'cssArgs': [r2(v) for v in c['args']], 'composite': st.get('globalCompositeOperation')})
            continue
        if op != 'drawImage' or not isinstance(c['args'][0], dict) or not c['args'][0].get('canvas'):
            continue
        src = c['args'][0]; sid = str(src['canvas']); sw, sh = src['w'], src['h']; args = c['args']; n = len(args)
        if n == 3: sx0, sy0, sW, sH, dx, dy, dw, dh = 0, 0, sw, sh, args[1], args[2], sw, sh
        elif n == 5: sx0, sy0, sW, sH = 0, 0, sw, sh; dx, dy, dw, dh = args[1:5]
        else: sx0, sy0, sW, sH, dx, dy, dw, dh = args[1:9]
        m = st['m']
        sprite_to_page = lambda px, py: page(*apply(m, dx + (px - sx0) * dw / sW, dy + (py - sy0) * dh / sH))
        scale_x = (dw / sW) * m[0] / kx; scale_y = (dh / sH) * m[3] / ky
        sprite = (raw.get('sprites') or {}).get(sid) or {'commands': []}
        texts = [t for t in sprite['commands'] if t['op'] in ('fillText', 'strokeText')]
        fam = (texts[0]['st'].get('font') if texts else '') or ''
        kind = 'glyph' if 'Jost' in fam else ('binary' if len(texts) == 8 else 'hex')
        cell = letters[in_pass] if in_pass < len(letters) else None
        in_pass += 1
        x0, y0 = sprite_to_page(sx0, sy0); x1, y1 = sprite_to_page(sx0 + sW, sy0 + sH)
        for t in texts:
            tst = t['st']; f = font_parts(tst.get('font')); met = t.get('metrics') or {}
            ax, ay = sprite_to_page(t['args'][1], t['args'][2])
            adv = (met.get('width') or 0) * scale_x
            align = tst.get('textAlign')
            left = ax - adv / 2 if align == 'center' else (ax - adv if align in ('right', 'end') else ax)
            colour, alpha = hex_colour(tst.get('fillStyle'))
            glyphs.append({
                'command': k, 'pass': pass_index, 'phraseIndex': cell, 'plain': PHRASE[cell] if cell is not None and cell < len(PHRASE) else None,
                'cipher': cipher[cell] if cell is not None and cell < len(cipher) else None,
                'kind': kind, 'text': t['args'][0], 'font': tst.get('font'), 'fontWeight': f.get('weight'), 'fontFamilyList': f.get('family'),
                'fontSizePx': r2((f.get('sizePx') or 0) * scale_y), 'spriteFontPx': f.get('sizePx'), 'scaleX': round(scale_x / scale_y, 4) if scale_y else None,
                'color': colour, 'colorAlpha': alpha, 'opacity': round((st.get('globalAlpha') or 1) * (tst.get('globalAlpha') or 1), 4),
                'textAlign': align, 'textBaseline': tst.get('textBaseline'), 'anchor': [r2(ax), r2(ay)],
                'baselineY': r2(ay + (t.get('alphabeticOffset') or 0) * scale_y), 'advance': [r2(left), r2(left + adv)],
                'ink': [r2(ax - (met.get('left') or 0) * scale_x), r2(ay - (met.get('ascent') or 0) * scale_y), r2(ax + (met.get('right') or 0) * scale_x), r2(ay + (met.get('descent') or 0) * scale_y)],
                'clip': rect_page(st.get('clip')) if isinstance(st.get('clip'), list) else st.get('clip'),
                'spriteRect': [r2(x0), r2(y0), r2(x1), r2(y1)], 'sprite': int(sid), 'spriteSize': [sw, sh], 'fontLoaded': t.get('fontLoaded'),
                'smoothing': [st.get('imageSmoothingEnabled'), st.get('imageSmoothingQuality')]})
    lines = {}
    for g in glyphs:
        key = (g['pass'], g['kind'], g['baselineY'])
        lines.setdefault(key, []).append(g)
    line_list = []
    for (p, kind, y), items in sorted(lines.items(), key=lambda kv: (kv[0][0], kv[0][2], kv[0][1])):
        items.sort(key=lambda g: g['anchor'][0])
        line_list.append({'pass': p, 'kind': kind, 'baselineY': y, 'fontSizePx': items[0]['fontSizePx'], 'text': ' '.join(g['text'] for g in items) if kind != 'glyph' else ''.join(g['text'] for g in items),
                          'advanceLeft': min(g['advance'][0] for g in items), 'advanceRight': max(g['advance'][1] for g in items),
                          'inkTop': min(g['ink'][1] for g in items), 'inkBottom': max(g['ink'][3] for g in items),
                          'colors': sorted({g['color'] for g in items}), 'opacities': sorted({g['opacity'] for g in items}), 'count': len(items),
                          'clip': items[0]['clip']})
    beam_summary = None
    if beam:
        line = next((b for b in beam if b['globalAlpha'] and b['page'] and abs((b['page'][3] - b['page'][1]) - 1.5) < .01), None)
        if line:
            beam_summary = {'centreY': r2((line['page'][1] + line['page'][3]) / 2), 'left': line['page'][0], 'right': line['page'][2],
                            'width': r2(line['page'][2] - line['page'][0]), 'color': line['color'], 'opacity': line['globalAlpha'],
                            'layers': [{'role': role, 'page': b['page'], 'height': r2(b['page'][3] - b['page'][1]), 'width': r2(b['page'][2] - b['page'][0]), 'alpha': b['globalAlpha']}
                                       for role, b in zip(['halo (0,30 × corps)', 'cœur 6 px', 'ligne 1,5 px', 'butée gauche 1,5 × 6', 'butée droite 1,5 × 6'], beam)]}
    return {'coordinateSystem': 'CSS px of the page (viewport origin, no scroll); device px = CSS px × devicePixelRatio',
            'glyphs': glyphs, 'lines': line_list, 'beam': beam, 'beamSummary': beam_summary, 'clips': clips,
            'counts': {'glyphs': len(glyphs), 'drawImage': sum(1 for c in frame['commands'] if c['op'] == 'drawImage'), 'fillRect': len(beam), 'commands': len(frame['commands'])}}


def canvas_dump(s):
    """Last frame of the entrance canvas + replay check, or None when the scene is hidden."""
    visible = s.js('(()=>{const e=document.querySelector("#entrance-scene");if(!e||e.hidden)return false;const c=getComputedStyle(e);return c.display!=="none"&&c.visibility!=="hidden"&&parseFloat(c.opacity)>0&&!!e.querySelector("canvas")})()')
    if not visible: return None
    return s.js('(()=>{const d=qaCanvasDump();if(!d)return null;d.replay=qaCanvasReplay(d);return d})()', 60)


def write_canvas(name, raw, node, instant):
    data = {'name': name, **parse_name(name), 'siteMapNode': node, 'capturedAt': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
            'instant': instant,
            'canvas': {'attributes': {'width': raw['width'], 'height': raw['height']}, 'cssBox': raw['css'], 'clientSize': raw['client'],
                       'devicePixelRatio': raw['dpr'], 'style': raw['canvasStyle'], 'scene': raw['scene']},
            'replay': raw.get('replay'), 'hookErrors': raw.get('hookErrors'),
            'redraw': derive(raw),
            'frame': raw['frame'], 'sprites': raw['sprites'], 'gradients': raw['gradients'],
            'prototypeSources': SOURCES_AT_START}
    if instant and instant.get('layoutFromRules'):
        data['layoutFromRules'] = instant.pop('layoutFromRules')
    path = DOM / AREA / (name + '.canvas.json'); path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False))
    return path


def cap(s, name, node, meta=None, facts=None, keep_pointer=False, keep_focus=False, instant=None):
    """snap() of capture_lib (screenshot + DOM dump) with the site-map node, plus the canvas frame when the
    entrance canvas is shown."""
    saved = (s.away, s.blur)
    if keep_pointer: s.away = lambda: None
    if keep_focus: s.blur = lambda: None
    frame_before = s.js('window.qaCanvasFrame?qaCanvasFrame():null')
    try:
        rec = snap(s, AREA, name, meta=meta)
    finally:
        s.away, s.blur = saved
    raw = canvas_dump(s)
    rec['siteMapNode'] = node
    rec.update({k: v for k, v in parse_name(name).items() if v})
    if facts: rec['facts'] = facts
    if raw:
        inst = dict(instant or {})
        inst.setdefault('entranceClockMs', raw.get('entranceClock'))
        inst['sceneDataset'] = (raw.get('scene') or {}).get('dataset')
        inst['frameIndexAtShot'] = frame_before
        inst['frameIndexAtDump'] = (raw.get('frame') or {}).get('index')
        try: inst['layoutFromRules'] = scene_meta(s)
        except Exception as error: inst['layoutFromRules'] = None; print('scene meta failed', error)
        path = write_canvas(name, raw, node, inst)
        rec['canvas'] = path.relative_to(BASE).as_posix()
        rec['canvasReplay'] = raw.get('replay')
        rec['canvasStable'] = frame_before == (raw.get('frame') or {}).get('index')
    if instant and not raw:
        rec['instant'] = instant
    RECORDS.append(rec)
    print('captured', name, '| entry', (facts or {}).get('entry'), '| canvas', 'replay ' + str((raw or {}).get('replay', {}).get('identical')) if raw else '-',
          '| errors', len(rec.get('errors') or []), '| overflow', rec.get('overflow'), flush=True)
    return rec


def flush(extra=None):
    if RECORDS:
        write_index(AREA, RECORDS, extra={'sources': SOURCES_AT_START, **(extra or {})})


def session():
    return install(start())


def check_sources():
    now = sources()
    if now != SOURCES_AT_START:
        changed = [k for k in now if now[k] != SOURCES_AT_START.get(k)]
        print('!! prototype sources changed during the lot:', changed, flush=True)
        return changed
    return []


# ---------------------------------------------------------------------------------------------------------------
# Lots
def lot_fonts():
    """Fonts actually used: canvas monospace (pixel identity against installed families), Jost 500 loaded for the
    glyph sprites, and Chrome's platform fonts for the FR/EN/AR labels (no capture written to reference/)."""
    s = session(); out = {}
    try:
        arrive(s, 'desktop', 'light', advance=3650)
        out['canvas'] = s.js(FONT_PROBE, 30)
        labels = {}
        for lang in ('fr', 'en', 'ar'):
            if lang != 'fr':
                s.js('qaLabelTick()'); time.sleep(.6)
            labels[lang] = {'texts': s.js('[...document.querySelectorAll("#entrance-access .entrance-action-label")].map(e=>[e.lang,e.textContent,getComputedStyle(e).fontFamily,getComputedStyle(e).fontWeight,getComputedStyle(e).fontSize])'),
                            'platform': platform_fonts(s, ['#entry-login .entrance-action-label', '#entry-guest .entrance-action-label'])}
        out['labels'] = labels
        s.click('#entry-login'); s.wait('document.querySelector("#dialog").open', 10); time.sleep(.4)
        out['dialog'] = platform_fonts(s, ['#dialog-title', '#dialog-content .dialog-text', '#dialog-content > button:first-of-type', '#dialog-content > button:last-of-type'])
        # The site language at load does not follow the browser language (welcome.mjs: let locale='fr').
        for locale in ('ar', 'en-US'):
            s.c.call('Emulation.setLocaleOverride', {'locale': locale})
            s.c.call('Network.setUserAgentOverride', {'userAgent': s.js('navigator.userAgent'), 'acceptLanguage': locale})
            arrive(s, 'desktop', 'light', advance=3650)
            out[f'localeOverride-{locale}'] = s.js('({lang:document.documentElement.lang,dir:document.documentElement.dir,navigatorLanguage:navigator.language,labels:[...document.querySelectorAll("#entrance-access .entrance-action-label")].map(e=>e.lang+":"+e.textContent)})')
        s.c.call('Emulation.setLocaleOverride', {})
    finally:
        s.close()
    out['sources'] = SOURCES_AT_START
    path = DOM / AREA / '_fonts.json'; path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(json.dumps(out, ensure_ascii=False)[:3000])


SCAN_STATES = [('arrival-scan-binary', 300, 'binaire au repos, avant le premier passage (le faisceau entre à 600 ms)'),
               ('arrival-scan-hex', 1300, 'descente : faisceau à mi-hauteur (position 0,5), hexadécimal au-dessus, binaire au-dessous'),
               ('arrival-scan-return', 2700, 'remontée : faisceau à mi-hauteur (position 0,5), hexadécimal au-dessus, texte chiffré au-dessous'),
               ('arrival-encrypted', 3650, 'fin du double scan : message chiffré au repos, Se connecter et Visiter (libellés FR)')]


def lot_scan(variants=VARIANTS):
    s = session()
    try:
        for fmt, theme in variants:
            arrive(s, fmt, theme)
            for state, t, what in SCAN_STATES:
                got = s.js(f'qaAdvance({t})')
                st = state_meta(s)
                cap(s, f'{state}--{fmt}--fr-{theme}', 'arrival', meta={'state': st},
                    facts={'entry': st['entry'], 'phase': got['phase'], 'labels': [b['lang'] for b in st['buttons']]},
                    instant={'entranceClockMs': t, 'rendererTimeMs': min(t, 3649.999) if t >= 3650 else t, 'phase': got['phase'], 'description': what})
            flush()
    finally:
        s.close()


def lot_labels(variants=VARIANTS):
    """Arrival labels shown in English then Arabic (site stays French), outside the cross-fade."""
    s = session()
    try:
        for fmt, theme in variants:
            arrive(s, fmt, theme, advance=3650)
            for lang in ('en', 'ar'):
                s.js('qaLabelTick()'); time.sleep(.7)
                st = state_meta(s)
                if [b['lang'] for b in st['buttons']] != [lang, lang] or any(b['outgoing'] for b in st['buttons']):
                    raise RuntimeError(f'labels {st["buttons"]}')
                cap(s, f'arrival-labels-{lang}--{fmt}--fr-{theme}', 'arrival', meta={'state': st},
                    facts={'entry': st['entry'], 'siteLang': st['lang'], 'siteDir': st['dir'], 'labels': lang, 'pair': [b['box'] for b in st['buttons']]},
                    instant={'entranceClockMs': 3650, 'phase': 'encrypted', 'description': f'libellés {lang.upper()} après {1 if lang == "en" else 2} changement(s) du cycle FR → EN → AR, fondu terminé (> 320 ms)'})
            flush()
    finally:
        s.close()


def lot_dialogs(variants=VARIANTS):
    """entry-signin (Connexion — prototype) on the encrypted message; entry-signup, reached only through the account
    of the error screen (the entrance first returns to the encrypted message, then opens the dialog)."""
    s = session()
    try:
        for fmt, theme in variants:
            arrive(s, fmt, theme, advance=3650)
            s.click('#entry-login'); s.wait('document.querySelector("#dialog").open', 10); time.sleep(.5)
            st = state_meta(s)
            cap(s, f'entry-signin--{fmt}--fr-{theme}', 'entry-signin', meta={'state': st},
                facts={'entry': st['entry'], 'dialog': st['dialog']}, instant={'entranceClockMs': 3650, 'phase': 'encrypted', 'description': 'Se connecter → fenêtre « Connexion — prototype »'})
            s.click('#dialog-content > button:last-of-type'); time.sleep(.4)
            s.click('#entry-guest'); wait_entry(s, 'error', 20); time.sleep(.4)
            s.click('#profile'); s.wait('!document.querySelector("#account-menu").hidden', 5); time.sleep(.3)
            s.click('[data-account-action=signup]'); s.wait('document.querySelector("#dialog").open', 10); time.sleep(.6)
            st = state_meta(s)
            cap(s, f'entry-signup--{fmt}--fr-{theme}', 'entry-signup', meta={'state': st},
                facts={'entry': st['entry'], 'dialog': st['dialog'], 'path': 'Visiter → écran d’erreur (globe bloqué) → compte → Créer un compte'},
                instant={'entranceClockMs': 3650, 'phase': 'encrypted', 'description': 'création de compte simulée, ouverte depuis le compte de l’écran d’erreur ; l’entrée revient d’abord au message chiffré'})
            flush()
    finally:
        s.close()


def lot_decrypt(variants=VARIANTS):
    """Simulated sign-in → n°22 decryption (mid-way), BEYOND THE CODE held 1.3 s, then (complement) the phrase fading
    into the 42 on the member path."""
    s = session()
    try:
        for fmt, theme in variants:
            arrive(s, fmt, theme, advance=3650)
            s.click('#entry-login'); s.wait('document.querySelector("#dialog").open', 10); time.sleep(.3)
            s.click('#dialog-content > button:first-of-type'); time.sleep(.3)
            wait_entry(s, 'decrypting', 10)
            s.wait('qaPending("tick")>0', 10); s.js('qaFrame(qaNow)')
            got = s.js('qaAdvance(5150)')
            st = state_meta(s)
            cap(s, f'decrypt-mid--{fmt}--fr-{theme}', 'decrypt', meta={'state': st},
                facts={'entry': st['entry'], 'phase': got['phase'], 'renderedText': got['text']},
                instant={'entranceClockMs': 5150, 'phase': got['phase'], 'description': 'déchiffrement n°22 à mi-parcours : (3 650 + 6 650) / 2 ms, les 13 lettres tournent encore (accent)'})
            hold(s, True)
            got = s.js('qaAdvance(6800)'); time.sleep(.2)
            wait_entry(s, 'slogan', 5); seek(s, 650)
            st = state_meta(s)
            cap(s, f'decrypt-final--{fmt}--fr-{theme}', 'decrypt', meta={'state': st},
                facts={'entry': st['entry'], 'renderedText': got['text']},
                instant={'entranceClockMs': 6800, 'phase': 'complete', 'sloganHoldMs': 650, 'description': 'BEYOND THE CODE lisible, au milieu du maintien de 1,3 s'})
            seek(s, 1300); play(s)
            wait_entry(s, 'opening', 5); time.sleep(.2); seek(s, 225)
            st = state_meta(s); sy = symbol_meta(s)
            scene_style = s.js('(()=>{const e=document.querySelector("#entrance-scene"),c=getComputedStyle(e);return{opacity:c.opacity,transform:c.transform,filter:c.filter}})()')
            cap(s, f'member-transition--{fmt}--fr-{theme}', 'opening', meta={'state': st, 'symbol': sy, 'sceneStyle': scene_style},
                facts={'entry': st['entry'], 'path': 'member', 'complement': True, 'scene': scene_style, 'logo': {k: sy[k] for k in ('logoOpacity', 'logoFilter', 'logoTransform', 'logoClip')}},
                instant={'openingMs': 225, 'description': 'complément : phrase qui s’efface (450 ms, ease-in) pendant l’apparition du 42 (600 ms), à 225 ms'})
            seek(s, 600); hold(s, False); play(s); time.sleep(1.5)
            flush()
    finally:
        s.close()


def lot_opening(variants=VARIANTS):
    """Visitor path (no decryption): logo appearing (visitor-transition), logo alone, ring half drawn, ring complete."""
    s = session()
    try:
        for fmt, theme in variants:
            arrive(s, fmt, theme, advance=3650)
            hold(s, True)
            s.click('#entry-guest'); wait_entry(s, 'opening', 5); time.sleep(.2)
            for state, t, what in [('visitor-transition', 79, 'Visiter : le 42 apparaît (600 ms, cubic-bezier(.22,1,.36,1)) ; à 79 ms la progression vaut 0,50'),
                                   ('opening-logo', 600, 'fin de l’apparition du 42, cercle pas encore tracé')]:
                seek(s, t); st = state_meta(s); sy = symbol_meta(s)
                cap(s, f'{state}--{fmt}--fr-{theme}', 'opening', meta={'state': st, 'symbol': sy},
                    facts={'entry': st['entry'], 'path': 'visitor', 'logo': {k: sy[k] for k in ('logoOpacity', 'logoFilter', 'logoTransform', 'logoClip')}, 'dashoffset': sy['dashoffset']},
                    instant={'logoMs': t, 'description': what})
            play(s); wait_entry(s, 'ring', 5); time.sleep(.2)
            for state, t, what in [('opening-ring-drawing', 105, 'cercle en cours de tracé : 105 ms sur 800 (cubic-bezier(.22,1,.36,1)), dashoffset ≈ 49,9 soit la moitié du cercle'),
                                   ('opening-ring', 800, 'cercle complet (dashoffset 0)')]:
                seek(s, t); st = state_meta(s); sy = symbol_meta(s)
                cap(s, f'{state}--{fmt}--fr-{theme}', 'opening', meta={'state': st, 'symbol': sy},
                    facts={'entry': st['entry'], 'path': 'visitor', 'dashoffset': sy['dashoffset']}, instant={'ringMs': t, 'description': what})
            hold(s, False); play(s)
            wait_entry(s, 'error', 20)
            flush()
    finally:
        s.close()


def lot_wait(variants=VARIANTS):
    """« Le monde se prépare… »: the globe module request is held (never answered), so the world stays in preparation."""
    s = session()
    try:
        for fmt, theme in variants:
            arrive(s, fmt, theme, globe='held', advance=3650)
            s.click('#entry-guest'); wait_entry(s, 'waiting', 10); time.sleep(.8)
            st = state_meta(s); sy = symbol_meta(s)
            cap(s, f'world-wait--{fmt}--fr-{theme}', 'world-wait', meta={'state': st, 'symbol': sy},
                facts={'entry': st['entry'], 'status': st['status']}, instant={'description': 'après le cercle complet, globe pas encore prêt (module retenu par le banc)'})
            flush()
        try: s.c.call('Fetch.disable')
        except Exception: pass
    finally:
        s.close()


def lot_error(variants=VARIANTS):
    """The world could not be prepared (globe module blocked): Réessayer, Revenir au message, Continuer sans le globe,
    account visible."""
    s = session()
    try:
        for fmt, theme in variants:
            arrive(s, fmt, theme, advance=3650)
            s.click('#entry-guest'); wait_entry(s, 'error', 20); time.sleep(.5)
            st = state_meta(s)
            cap(s, f'entry-error--{fmt}--fr-{theme}', 'entry-error', meta={'state': st},
                facts={'entry': st['entry'], 'status': st['status'], 'buttons': [b['text'] for b in st['buttons']], 'account': st['account']},
                instant={'description': 'Visiter → 42 → cercle → échec du module du globe (bloqué par le banc)'})
            flush()
    finally:
        s.close()


def lot_languages():
    """Site language EN/AR at the arrival: only reachable after the error screen (account → Paramètres → language,
    then Revenir au message); the language is 'fr' at every load (no browser-locale detection, no stored choice)."""
    s = session()
    try:
        for fmt in ('desktop', 'mobile'):
            for lang, theme in (('en', 'light'), ('ar', 'light'), ('ar', 'dark')):
                arrive(s, fmt, theme, advance=3650)
                s.click('#entry-guest'); wait_entry(s, 'error', 20); time.sleep(.3)
                s.settings(lang, theme); time.sleep(.4)
                st = state_meta(s)
                if st['lang'] != lang: raise RuntimeError(f'site in {st["lang"]}, not {lang}')
                fonts = platform_fonts(s, ['#entrance-status', '#entrance-access button:first-of-type']) if lang == 'ar' else None
                cap(s, f'entry-error--{fmt}--{lang}-{theme}', 'entry-error', meta={'state': st, 'platformFonts': fonts},
                    facts={'entry': st['entry'], 'dir': st['dir'], 'status': st['status'], 'buttons': [b['text'] for b in st['buttons']], 'platformFonts': fonts},
                    instant={'description': f'écran d’erreur après passage du site en {lang.upper()} par le compte'})
                s.click('#entrance-access button:nth-of-type(2)'); wait_entry(s, 'encrypted', 10); time.sleep(.6)
                st = state_meta(s)
                fonts = platform_fonts(s, ['#entry-login .entrance-action-label', '#entry-guest .entrance-action-label']) if lang == 'ar' else None
                cap(s, f'arrival-encrypted--{fmt}--{lang}-{theme}', 'arrival', meta={'state': st, 'platformFonts': fonts},
                    facts={'entry': st['entry'], 'dir': st['dir'], 'labels': [b['lang'] for b in st['buttons']], 'pair': [b['box'] for b in st['buttons']], 'platformFonts': fonts},
                    instant={'entranceClockMs': 3650, 'phase': 'encrypted', 'description': f'Revenir au message depuis l’écran d’erreur, site en {lang.upper()} (le scan n’est pas rejoué)'})
                s.click('#entry-login'); s.wait('document.querySelector("#dialog").open', 10); time.sleep(.5)
                st = state_meta(s)
                fonts = platform_fonts(s, ['#dialog-title', '#dialog-content .dialog-text', '#dialog-content > button:first-of-type']) if lang == 'ar' else None
                cap(s, f'entry-signin--{fmt}--{lang}-{theme}', 'entry-signin', meta={'state': st, 'platformFonts': fonts},
                    facts={'entry': st['entry'], 'dir': st['dir'], 'dialog': st['dialog'], 'platformFonts': fonts},
                    instant={'entranceClockMs': 3650, 'phase': 'encrypted', 'description': f'Se connecter, site en {lang.upper()}'})
                # 18 Oct.: Création de compte simulée in this language too (texts of the English and Arabic modes of the
                # French frames), by the same path as lot_dialogs: Annuler, Visiter → error screen → account → Créer un compte
                s.click('#dialog-content > button:last-of-type'); time.sleep(.4)
                s.click('#entry-guest'); wait_entry(s, 'error', 20); time.sleep(.4)
                # 18 Oct. (review): the account menu, then the window of Création de compte (kind "signup"), must really be
                # open: another window or the encrypted message would be recorded as entry-signup otherwise
                s.click('#profile')
                if not s.wait('!document.querySelector("#account-menu").hidden', 5): raise RuntimeError('account menu not open')
                time.sleep(.3)
                s.click('[data-account-action=signup]')
                if not s.wait('document.querySelector("#dialog[open]")?.dataset.kind==="signup"', 10): raise RuntimeError('signup dialog not open')
                time.sleep(.6)
                st = state_meta(s)
                if st['lang'] != lang: raise RuntimeError(f'site in {st["lang"]}, not {lang}')
                cap(s, f'entry-signup--{fmt}--{lang}-{theme}', 'entry-signup', meta={'state': st},
                    facts={'entry': st['entry'], 'dir': st['dir'], 'dialog': st['dialog'], 'path': 'Visiter → écran d’erreur → compte → Créer un compte, site en ' + lang.upper()},
                    instant={'entranceClockMs': 3650, 'phase': 'encrypted', 'description': f'création de compte simulée, site en {lang.upper()}'})
                flush()
    finally:
        s.close()


def reveal_progress(rv, fmt):
    """Eased progress p of the reveal, from the globe transform (scale = r / R) and clip radius R."""
    try:
        R = float(re.search(r'circle\(([\d.]+)px', rv['globe']['clipPath']).group(1))
        scale = float(re.search(r'scale\(([\d.]+)\)', rv['globe']['transform']).group(1))
        r0 = (200 if fmt == 'desktop' else 174) * .48
        return round((scale * R - r0) / (R - r0), 5), R
    except Exception:
        return None, None


def responsive(s, seconds=240):
    """Waits until the page answers again, then until two frames have been produced. In headless Chrome the first
    frames of the reveal (WebGL globe under clip-path, transform and a masked veil) can block the page for about a
    minute; a capture taken before would show a stale frame."""
    end = time.time() + seconds; blocked = 0.0; t0 = time.time()
    while time.time() < end:
        try:
            s.c.call('Runtime.evaluate', {'expression': 'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(1))))', 'awaitPromise': True, 'returnByValue': True}, timeout=30)
            return round(time.time() - t0, 1)
        except TimeoutError:
            blocked = time.time() - t0
            print(f'  page busy for {blocked:.0f} s…', flush=True)
    raise TimeoutError('page still busy')


def lot_reveal(variants=VARIANTS):
    """Real WebGL globe: the circle moves and grows to the sphere (1.2 s, smoothstep), then Explore."""
    s = session()
    try:
        for fmt, theme in variants:
            ok = False
            for attempt in (1, 2):
                arrive(s, fmt, theme, globe='real', advance=3650)
                ready = s.wait('document.querySelector("#loading")?.hidden===true && Boolean(document.querySelector("#globe canvas"))', 90)
                s.click('#entry-guest')
                if s.wait('document.body.dataset.entry==="revealing" && qaPending("update")>0', 60):
                    ok = True; break
                print(f'reveal not reached (entry {entry(s)}, globe ready {ready}), attempt {attempt}', flush=True)
            if not ok:
                raise RuntimeError(f'no reveal for {fmt}-{theme}')
            time.sleep(.3)
            for state, t in [('reveal-mid', 0.5), ('reveal-end', 0.99)]:
                s.js(f'qaReveal({t})'); time.sleep(.6)
                waited = responsive(s); time.sleep(.5); responsive(s)
                print(f'  {state}: page answered after {waited} s', flush=True)
                rv = s.js(REVEAL_META); sy = symbol_meta(s); st = state_meta(s)
                p, R = reveal_progress(rv, fmt)
                cap(s, f'{state}--{fmt}--fr-{theme}', 'reveal', meta={'reveal': rv, 'symbol': sy, 'state': st},
                    facts={'entry': st['entry'], 't': t, 'progress': p, 'globeRadius': R, 'globe': rv['globe'], 'veil': rv['veil'],
                           'logoOpacity': sy['imgOpacity'] if sy else None, 'ringOpacity': sy['circleOpacity'] if sy else None},
                    instant={'revealT': t, 'revealProgress': p, 'description': f't = {t} du révélé de 1,2 s (smoothstep)'})
            s.js('qaReveal(1)'); wait_entry(s, 'welcome', 10)
            flush()
    finally:
        s.close()


def lot_sheets():
    """Contact sheets of every captured state, for visual checking (dom/entrance/_sheets, not versioned)."""
    index = json.loads((REF / AREA / 'index.json').read_text())
    groups = {}
    for rec in index['states']:
        fmt = rec['name'].split('--')[1]
        lang_theme = rec['name'].split('--')[2]
        key = ('lang-' if not lang_theme.startswith('fr-') else '') + rec['siteMapNode'] + '--' + fmt
        groups.setdefault(key, []).append(BASE / rec['viewport'])
    out = []
    for key, paths in sorted(groups.items()):
        cols = 4 if 'mobile' in key else 3
        out.append(contact_sheet(sorted(paths), DOM / AREA / '_sheets' / (key + '.png'), cols=cols, thumb_w=300 if 'mobile' in key else 440))
    print('\n'.join(str(p) for p in out))


def lot_index():
    """Copies into reference/entrance/index.json the instant and a short summary of each canvas frame (no browser)."""
    path = REF / AREA / 'index.json'
    index = json.loads(path.read_text())
    for rec in index['states']:
        if not rec.get('canvas'): continue
        data = json.loads((BASE / rec['canvas']).read_text())
        instant = dict(data.get('instant') or {})
        dataset = instant.pop('sceneDataset', None) or {}
        instant.update({'rendererPhase': dataset.get('phase'), 'renderedText': dataset.get('renderedText'), 'beamPosition': dataset.get('beamPosition')})
        rec['instant'] = instant
        redraw = data['redraw']
        rec['canvasSummary'] = {'size': data['canvas']['attributes'], 'cssBox': data['canvas']['cssBox'], 'devicePixelRatio': data['canvas']['devicePixelRatio'],
                                'lines': [{k: l[k] for k in ('kind', 'baselineY', 'fontSizePx', 'text', 'advanceLeft', 'advanceRight', 'colors', 'clip')} for l in redraw['lines']],
                                'beam': redraw.get('beamSummary'), 'counts': redraw['counts']}
    index['files'] = {'png': 'reference/entrance/<état>--<desktop|mobile>--<fr|en|ar>-<light|dark>.png',
                      'dom': 'dom/entrance/<même nom>.json.gz (relevé DOM capture_lib.EXTRACT_JS ; non versionné)',
                      'canvas': 'dom/entrance/<même nom>.canvas.json (dernière image du canvas, sprites, liste de redessin ; non versionné)'}
    path.write_text(json.dumps(index, ensure_ascii=False, indent=1))
    print('index enriched:', sum(1 for r in index['states'] if r.get('canvas')), 'canvas states')


LOTS = {'fonts': lot_fonts, 'scan': lot_scan, 'labels': lot_labels, 'dialogs': lot_dialogs, 'decrypt': lot_decrypt,
        'opening': lot_opening, 'wait': lot_wait, 'error': lot_error, 'languages': lot_languages, 'reveal': lot_reveal, 'sheets': lot_sheets,
        'index': lot_index}
OFFLINE = {'sheets', 'index'}
WITH_VARIANTS = {'scan', 'labels', 'dialogs', 'decrypt', 'opening', 'wait', 'error', 'reveal'}

if __name__ == '__main__':
    lot = sys.argv[1] if len(sys.argv) > 1 else 'fonts'
    started = time.time()
    try:
        if lot in WITH_VARIANTS and len(sys.argv) > 2:
            LOTS[lot]([tuple(v.split('-')) for v in sys.argv[2:]])
        else:
            LOTS[lot]()
    finally:
        if lot not in OFFLINE:
            changed = check_sources()
            flush({'lastLot': lot, **({'sourcesChangedDuring': changed} if changed else {})})
        print(f'lot {lot} done in {time.time() - started:.0f} s, {len(RECORDS)} states', flush=True)
