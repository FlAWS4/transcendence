import { decode } from '../../archives/early-prototypes/decryption/horizon-decryption-engine.mjs';

// Three refractions share one speed and overlap rather than stopping between
// representations. The key is applied to data once, not animated as 42 blinks.
const DURATION = 6800;
const PASS_DURATION = 2800;
const STARTS = [100, 1700, 3300];

function bitmap(width, height, ratio) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(width * ratio));
  canvas.height = Math.max(1, Math.ceil(height * ratio));
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { canvas, context };
}

export function mount({ root, model }) {
  const encrypted = model.sample(0).map(state => state.encryptedByte);
  const plaintext = decode(encrypted, model.KEY);
  if (plaintext !== model.PHRASE) throw new Error('The encrypted bytes do not decode to the expected phrase.');
  const ciphertext = encrypted.map(byte => String.fromCharCode(byte));
  const canvas = document.createElement('canvas');
  canvas.className = 'lens-canvas';
  canvas.style.cssText = 'display:block;width:100%;height:100%;min-height:240px';
  canvas.setAttribute('aria-hidden', 'true');
  root.append(canvas);
  const ctx = canvas.getContext('2d');
  const measure = document.createElement('canvas').getContext('2d');
  let cache;
  let cacheKey = '';
  let lastTime = 0;
  let destroyed = false;

  function makeRow(start, end, fontSize, ratio, family, ink) {
    measure.font = `500 ${fontSize}px ${family}`;
    const units = Array.from(plaintext.slice(start, end), character =>
      character === ' ' ? fontSize * 0.32 : Math.max(fontSize * 0.35, measure.measureText(character).width) + fontSize * 0.024);
    const padding = fontSize * 0.78;
    const width = units.reduce((sum, unit) => sum + unit, 0) + padding * 2;
    const height = Math.ceil(fontSize * 1.9);
    const layers = Array.from({ length: 4 }, () => bitmap(width, height, ratio));
    const centers = [];
    let cursor = padding;
    units.forEach((unit, local) => {
      const index = start + local;
      const x = cursor + unit / 2;
      cursor += unit;
      centers.push(x);
      // Whitespace is retained as whitespace in all four representations.
      if (plaintext[index] === ' ') return;
      layers.forEach(({ context }, type) => {
        context.fillStyle = ink;
        context.textAlign = 'center';
        context.textBaseline = 'alphabetic';
        if (type === 0) {
          const size = fontSize * 0.205;
          context.font = `500 ${size}px ${family}`;
          const metrics = context.measureText('0');
          const offset = (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
          const bits = encrypted[index].toString(2).padStart(8, '0');
          for (let bit = 0; bit < 8; bit += 1) {
            context.fillText(bits[bit], x + (Math.floor(bit / 4) - 0.5) * fontSize * 0.145,
              height / 2 + (bit % 4 - 1.5) * fontSize * 0.23 + offset);
          }
        } else {
          const text = type === 1 ? encrypted[index].toString(16).padStart(2, '0').toUpperCase() : type === 2 ? ciphertext[index] : plaintext[index];
          const size = fontSize * (type === 1 ? 0.43 : 1);
          context.font = `500 ${size}px ${family}`;
          const metrics = context.measureText(type === 1 ? '0' : 'H');
          const baseline = height / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
          context.fillText(text, x, baseline, unit - fontSize * (type === 1 ? 0.15 : 0.025));
        }
      });
    });
    return { width, height, layers, composite: bitmap(width, height, ratio), centers, fontSize };
  }

  function prepare(width, height, ratio, family, ink) {
    const mobile = width < 700;
    const ranges = mobile ? [[0, 6], [7, plaintext.length]] : [[0, plaintext.length]];
    let size = mobile ? 48 : 92;
    // Fit the eventual phrase plus the optical margin, with fixed positions
    // shared by all four cached representations.
    measure.font = `500 ${size}px ${family}`;
    const widest = Math.max(...ranges.map(([start, end]) => {
      const units = Array.from(plaintext.slice(start, end), character => character === ' ' ? size * 0.32 : Math.max(size * 0.35, measure.measureText(character).width) + size * 0.024);
      return units.reduce((sum, unit) => sum + unit, 0) + size * 1.56;
    }));
    size *= Math.min(1, Math.max(1, width - 24) / widest);
    const rows = ranges.map(([start, end], index) => {
      const row = makeRow(start, end, size, ratio, family, ink);
      row.x = (width - row.width) / 2;
      row.y = height / 2 + (index - (ranges.length - 1) / 2) * size * 1.72;
      row.radius = size * 1.23;
      return row;
    });
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    cache = { rows, width, height, ratio, mobile };
  }

  function frontsAt(row, time) {
    return STARTS.map(start => -row.radius + (time - start) / PASS_DURATION * (row.width + row.radius * 2));
  }

  function compose(row, fronts) {
    const target = row.composite.context;
    target.clearRect(0, 0, row.width, row.height);
    target.drawImage(row.layers[0].canvas, 0, 0, row.width, row.height);
    fronts.forEach((front, index) => {
      const bow = row.radius * 0.16;
      if (front < -bow) return;
      target.save();
      if (front < row.width + bow) {
        // A curved conversion boundary sits within the refracting field.
        target.beginPath();
        target.moveTo(-2, -2);
        target.lineTo(front - bow, -2);
        target.bezierCurveTo(front + bow, row.height * 0.24,
          front + bow, row.height * 0.76, front - bow, row.height + 2);
        target.lineTo(-2, row.height + 2);
        target.closePath();
        target.clip();
      }
      target.clearRect(0, 0, row.width, row.height);
      target.drawImage(row.layers[index + 1].canvas, 0, 0, row.width, row.height);
      target.restore();
    });
  }

  function opticsAt(x, row, active) {
    let shift = 0;
    let bulge = 0;
    for (const center of active) {
      const d = (x - center) / row.radius;
      if (Math.abs(d) >= 1) continue;
      const envelope = (1 - d * d) ** 2;
      shift += row.radius * 0.3 * d * envelope;
      bulge += 0.2 * envelope;
    }
    return { x: x + shift, vertical: 1 + bulge };
  }

  function drawRow(row, fronts, accent) {
    compose(row, fronts);
    const active = fronts.filter(front => front > -row.radius && front < row.width + row.radius);
    if (!active.length) {
      ctx.drawImage(row.composite.canvas, row.x, row.y - row.height / 2, row.width, row.height);
      return;
    }
    const step = cache.mobile ? 1.6 : 2.4;
    // Refract cached strips. No pixel readback, glyph rasterisation, or random
    // substitutions occur in this frame loop.
    for (let source = 0; source < row.width; source += step) {
      const span = Math.min(step, row.width - source);
      const a = opticsAt(source, row, active);
      const b = opticsAt(source + span, row, active);
      const middle = opticsAt(source + span / 2, row, active);
      const height = row.height * middle.vertical;
      // Seam coverage follows the local optical envelope: untouched strips
      // keep their exact width, with a smooth return to zero at the field edge.
      const overlap = 0.4 * Math.min(1, (middle.vertical - 1) / 0.2);
      ctx.drawImage(row.composite.canvas,
        source * cache.ratio, 0, span * cache.ratio, row.height * cache.ratio,
        row.x + a.x, row.y - height / 2, b.x - a.x + overlap, height);
    }
    // Restrained optical highlights make the moving field legible without a
    // scanner bar, a global fade, or a decorative glass panel.
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 0.85;
    ctx.globalAlpha = 0.13;
    for (const center of active) {
      ctx.beginPath();
      ctx.ellipse(row.x + center - row.radius * 0.36, row.y,
        row.radius * 0.66, row.height * 0.48, 0, -1.02, 1.02);
      ctx.stroke();
    }
    ctx.restore();
  }

  function render(ms) {
    if (destroyed) return;
    lastTime = Math.max(0, Math.min(model.durationMs, ms));
    const time = lastTime / model.durationMs * DURATION;
    const width = root.clientWidth;
    const height = root.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const css = getComputedStyle(root);
    const ink = css.getPropertyValue('--h42-color-text').trim() || '#1b1b1b';
    const accent = css.getPropertyValue('--h42-color-accent').trim() || '#00babc';
    const family = `${css.getPropertyValue('--h42-font-family').trim() || 'Jost'}, sans-serif`;
    const key = `${width}:${height}:${ratio}:${family}:${ink}`;
    if (key !== cacheKey) { prepare(width, height, ratio, family, ink); cacheKey = key; }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    for (const row of cache.rows) drawRow(row, frontsAt(row, time), accent);
    root.dataset.lensFronts = cache.rows.map(row => frontsAt(row, time).map(x => (x / row.width).toFixed(3)).join(',')).join(';');
    root.dataset.renderedText = time >= STARTS[2] + PASS_DURATION ? plaintext : '';
    root.dataset.phase = time >= STARTS[2] + PASS_DURATION ? 'letter' : 'refracting';
  }

  function invalidate() { if (!destroyed) { cacheKey = ''; render(lastTime); } }
  const observer = new ResizeObserver(() => render(lastTime));
  observer.observe(root);
  document.fonts.ready.then(invalidate);
  render(0);
  return {
    render,
    destroy() {
      destroyed = true;
      observer.disconnect();
      canvas.remove();
      delete root.dataset.lensFronts;
      delete root.dataset.renderedText;
      delete root.dataset.phase;
      cache = undefined;
    },
  };
}
