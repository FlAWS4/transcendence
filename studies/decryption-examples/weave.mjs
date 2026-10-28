import { decode } from '../../archives/early-prototypes/decryption/horizon-decryption-engine.mjs';

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
const mix = (a, b, p) => a + (b - a) * p;
const BASE_FONT = 144;
const BANDS = 12;

/** Two strands carry each byte, then progressively weave the decoded letters. */
export function mount({ root, model }) {
  const initial = model.sample(0);
  const bytes = initial.map(state => state.encryptedByte);
  const plain = decode(bytes, model.KEY);
  const encrypted = bytes.map(byte => String.fromCharCode(byte)).join('');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;min-height:180px';
  canvas.setAttribute('aria-hidden', 'true');
  root.replaceChildren(canvas);
  const ctx = canvas.getContext('2d');
  const measure = document.createElement('canvas').getContext('2d');
  const cells = bytes.map((byte, index) => ({
    index, binary: byte.toString(2).padStart(8, '0'), hex: byte.toString(16).padStart(2, '0').toUpperCase(),
    cipher: encrypted[index], clear: plain[index], space: plain[index] === ' ', x: 0, y: 0, highX: 0, highY: 0, lowX: 0, lowY: 0,
    p1: 0, p2: 0, p3: 0, local: 0, row: 0, fraction: 0, startX: 0, targetX: 0, targetWidth: 0,
  }));
  const cache = new Map();
  const rows = [];
  let width = 0, height = 0, font = 0, mobile = false, gap = 0;
  let lastTime = 0, disposed = false, theme = null, ratio = 1;
  let ink = '#1b1b1b', border = '#e3e3e3', accent = '#00babc';

  function glyph(text, monospace = false) {
    const key = `${monospace ? 'm' : 'j'}:${text}`;
    if (cache.has(key)) return cache.get(key);
    const face = monospace ? 'ui-monospace, SFMono-Regular, monospace' : 'Jost, sans-serif';
    const weight = monospace ? 400 : 500;
    measure.font = `${weight} ${BASE_FONT}px ${face}`;
    const textWidth = Math.max(1, measure.measureText(text).width);
    const bitmap = document.createElement('canvas');
    bitmap.width = Math.ceil(textWidth + BASE_FONT * .25);
    bitmap.height = Math.ceil(BASE_FONT * 1.5);
    const paint = bitmap.getContext('2d');
    paint.fillStyle = ink;
    paint.font = `${weight} ${BASE_FONT}px ${face}`;
    paint.textAlign = 'center';
    paint.textBaseline = 'middle';
    paint.fillText(text, bitmap.width / 2, bitmap.height / 2 + BASE_FONT * .045);
    const result = { bitmap, textWidth };
    cache.set(key, result);
    return result;
  }

  function prepareGlyphs() {
    cache.clear();
    for (const cell of cells) {
      cell.highBits = glyph(cell.binary.slice(0, 4), true);
      cell.lowBits = glyph(cell.binary.slice(4), true);
      cell.highHex = glyph(cell.hex[0], true);
      cell.lowHex = glyph(cell.hex[1], true);
      cell.hexPair = glyph(cell.hex, true);
      cell.cipherGlyph = glyph(cell.cipher);
      cell.clearGlyph = glyph(cell.clear);
    }
  }

  function refresh() {
    const nextWidth = root.clientWidth || 800;
    const nextHeight = root.clientHeight || 400;
    const nextRatio = Math.min(window.devicePixelRatio || 1, 2);
    const nextTheme = document.documentElement.dataset.theme || 'light';
    if (nextTheme !== theme) {
      theme = nextTheme;
      const css = getComputedStyle(root);
      ink = css.getPropertyValue('--h42-color-text').trim() || '#1b1b1b';
      border = css.getPropertyValue('--h42-color-border').trim() || '#e3e3e3';
      accent = css.getPropertyValue('--h42-color-accent').trim() || '#00babc';
      prepareGlyphs();
    }
    if (width === nextWidth && height === nextHeight && ratio === nextRatio) return;
    width = nextWidth; height = nextHeight; ratio = nextRatio;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    mobile = width < 700;
    font = mobile ? Math.min(47, width / 7.1) : Math.min(84, width / 11.2);
    gap = mobile ? Math.min(136, height * .43) : 0;
    rows.length = 0;
    const groups = mobile ? [[0, 7], [7, cells.length]] : [[0, cells.length]];
    measure.font = `500 ${font}px Jost, sans-serif`;
    groups.forEach(([start, end], rowIndex) => {
      let total = 0;
      for (let i = start; i < end; i++) {
        cells[i].targetWidth = measure.measureText(plain[i]).width + font * .02;
        // The line break replaces the first space in the final mobile phrase.
        if (!(mobile && i === 6)) total += cells[i].targetWidth;
      }
      let cursor = (width - total) / 2;
      const spread = mobile ? width * .94 : Math.min(width * .84, 1320);
      const pitch = spread / (end - start);
      rows.push({ start, end, row: rowIndex });
      for (let i = start; i < end; i++) {
        const cell = cells[i];
        cell.row = rowIndex;
        cell.fraction = (i - start + .5) / (end - start);
        cell.startX = (width - spread) / 2 + pitch * (i - start + .5);
        cell.targetX = cursor + cell.targetWidth / 2;
        if (!(mobile && i === 6)) cursor += cell.targetWidth;
      }
    });
  }

  function draw(sprite, x, y, size, maxWidth = Infinity, offset = 0) {
    const scale = size / BASE_FONT;
    const squash = Math.min(1, maxWidth / (sprite.textWidth * scale));
    const w = sprite.bitmap.width * scale * squash;
    const h = sprite.bitmap.height * scale;
    ctx.drawImage(sprite.bitmap, x - w / 2 + offset, y - h / 2, w, h);
  }

  // Alternating horizontal threads replace ink spatially; there is no crossfade.
  function weaveSwap(from, to, progress, x, y, fromSize, toSize, fromMaxWidth = Infinity, toMaxWidth = fromMaxWidth) {
    if (progress <= 0) { draw(from, x, y, fromSize, fromMaxWidth); return; }
    if (progress >= 1) { draw(to, x, y, toSize, toMaxWidth); return; }
    const halfWidth = Math.max(from.bitmap.width * fromSize, to.bitmap.width * toSize) / BASE_FONT / 2 + 4;
    const h = Math.max(fromSize, toSize) * 1.5;
    const top = y - h / 2;
    for (let band = 0; band < BANDS; band++) {
      const direction = band % 2 === 0 ? 1 : -1;
      const p = smooth((progress - band / BANDS * .12) / .88);
      const edge = x - halfWidth + p * halfWidth * 2;
      const rowY = top + band * h / BANDS;
      const rowH = h / BANDS + .35;
      const incomingOffset = Math.sin(p * Math.PI) * direction * Math.min(14, toSize * .19);
      ctx.save();
      ctx.beginPath();
      if (direction === 1) ctx.rect(x - halfWidth, rowY, Math.max(0, edge - x + halfWidth), rowH);
      else ctx.rect(x + halfWidth - (edge - x + halfWidth), rowY, Math.max(0, edge - x + halfWidth), rowH);
      ctx.clip();
      draw(to, x, y, toSize, toMaxWidth, incomingOffset);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      if (direction === 1) ctx.rect(edge, rowY, Math.max(0, x + halfWidth - edge), rowH);
      else ctx.rect(x - halfWidth, rowY, Math.max(0, x + halfWidth - edge), rowH);
      ctx.clip();
      draw(from, x, y, fromSize, fromMaxWidth, -incomingOffset * .35);
      ctx.restore();
    }
  }

  function render(ms) {
    if (disposed) return;
    lastTime = ms;
    refresh();
    const time = clamp(ms / model.durationMs) * 6800;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const gather = smooth((time - 300) / 6150);
    const amplitude = (mobile ? 27 : 48) * (1 - smooth((time - 350) / 5600));
    const currentGap = mix(gap, font * 1.32, smooth((time - 2450) / 3700));
    const bitSize = mobile ? 8.4 : 12;
    const hexSize = mobile ? 22 : 30;

    for (const cell of cells) {
      const delay = cell.index / Math.max(1, cells.length - 1) * 250;
      cell.local = time - delay;
      cell.p1 = clamp((cell.local - 350) / 1700);
      cell.p2 = clamp((cell.local - 2100) / 1750);
      cell.p3 = clamp((cell.local - 3900) / 2400);
      const phase = cell.fraction * Math.PI * 4 + time / 1500 + cell.row * .7;
      cell.x = mix(cell.startX, cell.targetX, gather);
      cell.y = height / 2 + (cell.row - (rows.length - 1) / 2) * currentGap
        + Math.sin(phase + .35) * amplitude * .28;
      const crossing = Math.sin(phase) * amplitude * (1 - smooth(cell.p1));
      const nibbleGap = mix(mobile ? 10 : 18, hexSize * .30, smooth(cell.p1));
      cell.highX = cell.x - nibbleGap;
      cell.lowX = cell.x + nibbleGap;
      cell.highY = cell.y - crossing;
      cell.lowY = cell.y + crossing;
    }

    // Short joining ribbons keep negative space between groups. Their length
    // retracts into the glyphs instead of fading when the weave is complete.
    ctx.lineWidth = 1;
    for (const row of rows) {
      for (let i = row.start; i < row.end - 1; i++) {
        const a = cells[i], b = cells[i + 1];
        if (a.space || b.space) continue;
        const ribbon = 1 - smooth((time - 2750) / 3000);
        if (ribbon <= 0) break;
        for (let strand = 0; strand < 2; strand++) {
          const ax = strand ? a.lowX : a.highX;
          const ay = strand ? a.lowY : a.highY;
          const bx = strand ? b.lowX : b.highX;
          const by = strand ? b.lowY : b.highY;
          const centre = (ax + bx) / 2;
          const extent = (bx - ax) * .37 * ribbon;
          ctx.strokeStyle = strand === 0 && i % 3 === 1 ? accent : border;
          ctx.beginPath();
          ctx.moveTo(centre - extent, mix(ay, by, .13));
          ctx.bezierCurveTo(centre - extent * .35, ay, centre + extent * .35, by,
            centre + extent, mix(ay, by, .87));
          ctx.stroke();
        }
      }
    }

    for (const cell of cells) {
      if (cell.space) continue;
      if (cell.p1 < 1) {
        weaveSwap(cell.highBits, cell.highHex, cell.p1, cell.highX, cell.highY, bitSize, hexSize);
        weaveSwap(cell.lowBits, cell.lowHex, cell.p1, cell.lowX, cell.lowY, bitSize, hexSize);
      } else if (cell.p2 < 1) {
        const size = mix(hexSize, font * .8, smooth(cell.p2));
        weaveSwap(cell.hexPair, cell.cipherGlyph, cell.p2, cell.x, cell.y, hexSize, size,
          Infinity, cell.targetWidth * .98);
      } else {
        const size = mix(font * .8, font, smooth(cell.p3));
        weaveSwap(cell.cipherGlyph, cell.clearGlyph, cell.p3, cell.x, cell.y, size, size,
          cell.targetWidth * .98);
      }
    }
    root.dataset.phase = time >= 6800 ? 'letter' : time < 2100 ? 'binary-to-hex' : time < 3900 ? 'hex-to-cipher' : 'weaving-plaintext';
    root.dataset.renderedText = time >= 6800 ? plain : encrypted;
    root.dataset.ciphertext = encrypted;
  }

  const observer = new ResizeObserver(() => render(lastTime));
  observer.observe(root);
  document.fonts.ready.then(() => {
    if (disposed) return;
    width = 0;
    theme = null;
    render(lastTime);
  });
  render(0);
  return { render, destroy() {
    disposed = true;
    observer.disconnect();
    cache.clear();
    canvas.remove();
    delete root.dataset.phase;
    delete root.dataset.renderedText;
    delete root.dataset.ciphertext;
  } };
}
