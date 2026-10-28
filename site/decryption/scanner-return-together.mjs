import { decode } from './horizon-decryption-engine.mjs';

const clamp = value => Math.max(0, Math.min(1, value));
const BASE_FONT = 192;
const DURATION = 6800;
const SCAN_START = 600;
const SCAN_TURN = 2000;
const SCAN_END = 3400;
const DECRYPT_START = 3650;
const FIRST_SETTLE = 6050;
const SETTLE_SPREAD = 600;

export function scannerTogetherPhase(time) {
  if (time < SCAN_START) return 'binary';
  if (time < SCAN_TURN) return 'scan-down';
  if (time < SCAN_END) return 'scan-up';
  if (time < DECRYPT_START) return 'cipher';
  if (time < FIRST_SETTLE + SETTLE_SPREAD) return 'decrypting';
  return 'complete';
}

/** One continuous journey: top → bottom → top, with a smooth reversal. */
export function scannerReturnPosition(time) {
  const progress = clamp((time - SCAN_START) / (SCAN_END - SCAN_START));
  return (1 - Math.cos(progress * Math.PI * 2)) / 2;
}

/** Rank only visible letters; spaces never consume a resolution slot.
 * Seed 42 gives the random variant a stable, non-spatial order for scrubbing,
 * replay, theme changes and responsive layout.
 */
export function resolutionOrder(text, mode = 'ordered') {
  const order = Array.from(text, (character, index) => character === ' ' ? -1 : index)
    .filter(index => index >= 0);
  if (mode === 'random') {
    let seed = 42;
    for (let index = order.length - 1; index > 0; index--) {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      const other = Math.floor((seed >>> 0) / 4294967296 * (index + 1));
      [order[index], order[other]] = [order[other], order[index]];
    }
  }
  return order;
}

export function resolutionTime(rank, count = 13) {
  return FIRST_SETTLE + rank / Math.max(1, count - 1) * SETTLE_SPREAD;
}

/** Every letter starts together; only its finish time varies. */
export function scannerTogetherProgress(time, rank = 0, count = 13) {
  const end = resolutionTime(rank, count);
  if (time >= end) return 1;
  return clamp((time - DECRYPT_START) / (end - DECRYPT_START));
}

// Snapshot of the n°20 scanner/layout: the archived renderer stays untouched.
export function mount({ root, model, resolution = 'ordered' }) {
  const bytes = model.sample(0).map(state => state.encryptedByte);
  const plain = decode(bytes, model.KEY);
  const order = resolutionOrder(plain, resolution);
  const ranks = new Map(order.map((index, rank) => [index, rank]));
  const alphabet = model.ALPHABET;
  const cipher = bytes.map(byte => String.fromCharCode(byte)).join('');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;min-height:180px';
  canvas.setAttribute('aria-hidden', 'true');
  root.replaceChildren(canvas);
  const ctx = canvas.getContext('2d');
  const measure = document.createElement('canvas').getContext('2d');
  const glyphs = new Map();
  const cells = bytes.map((byte, index) => ({
    index, rank: ranks.get(index), byte, cipher: cipher[index], clear: plain[index], space: plain[index] === ' ',
    origin: alphabet.indexOf(cipher[index]), x: 0, y: 0, width: 0,
    binarySprite: null, hexSprite: null, cipherSprite: null,
  }));
  let width = 0, height = 0, ratio = 1, size = 0;
  let left = 0, right = 0, top = 0, bottom = 0;
  let lastTime = 0, disposed = false, theme = null;
  let ink = '#1b1b1b', accent = '#00babc';

  function glyph(character, active = false) {
    const key = `${active ? 'accent' : 'ink'}:${character}`;
    if (glyphs.has(key)) return glyphs.get(key);
    measure.font = `500 ${BASE_FONT}px Jost, sans-serif`;
    const inkWidth = Math.max(1, measure.measureText(character).width);
    const bitmap = document.createElement('canvas');
    bitmap.width = Math.ceil(inkWidth + BASE_FONT * .2);
    bitmap.height = Math.ceil(BASE_FONT * 1.5);
    const paint = bitmap.getContext('2d');
    paint.font = `500 ${BASE_FONT}px Jost, sans-serif`;
    paint.fillStyle = active ? accent : ink;
    paint.textAlign = 'center';
    paint.textBaseline = 'middle';
    paint.fillText(character, bitmap.width / 2, bitmap.height / 2 + BASE_FONT * .045);
    const sprite = { bitmap, inkWidth };
    glyphs.set(key, sprite);
    return sprite;
  }

  function encodedSprite(byte, binary) {
    const bitmap = document.createElement('canvas');
    bitmap.width = Math.ceil(BASE_FONT * .66);
    bitmap.height = Math.ceil(BASE_FONT * 1.2);
    const paint = bitmap.getContext('2d');
    paint.fillStyle = ink;
    paint.textAlign = 'center';
    paint.textBaseline = 'middle';
    if (binary) {
      paint.font = `400 ${BASE_FONT * .23}px ui-monospace, SFMono-Regular, monospace`;
      const bits = byte.toString(2).padStart(8, '0');
      for (let bit = 0; bit < 8; bit++) {
        paint.fillText(bits[bit], bitmap.width / 2 + ((bit % 2) - .5) * BASE_FONT * .21,
          bitmap.height / 2 + (Math.floor(bit / 2) - 1.5) * BASE_FONT * .24);
      }
    } else {
      paint.font = `400 ${BASE_FONT * .43}px ui-monospace, SFMono-Regular, monospace`;
      paint.fillText(byte.toString(16).padStart(2, '0').toUpperCase(), bitmap.width / 2, bitmap.height / 2 + BASE_FONT * .025);
    }
    return { bitmap, inkWidth: BASE_FONT * (binary ? .35 : .53) };
  }

  function prepareSprites() {
    glyphs.clear();
    for (const character of alphabet) { glyph(character); glyph(character, true); }
    for (const cell of cells) {
      cell.binarySprite = encodedSprite(cell.byte, true);
      cell.hexSprite = encodedSprite(cell.byte, false);
      cell.cipherSprite = glyph(cell.cipher);
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
      accent = css.getPropertyValue('--h42-color-accent').trim() || '#00babc';
      prepareSprites();
    }
    if (nextWidth === width && nextHeight === height && nextRatio === ratio) return;
    width = nextWidth; height = nextHeight; ratio = nextRatio;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const mobile = width < 700;
    size = mobile ? Math.min(48, width / 7) : Math.min(86, width / 11.2);
    const groups = mobile ? [[0, 6], [7, cells.length]] : [[0, cells.length]];
    measure.font = `500 ${size}px Jost, sans-serif`;
    const rows = groups.map(([start, end]) => {
      let rowWidth = 0;
      for (let i = start; i < end; i++) {
        cells[i].width = measure.measureText(cells[i].clear).width + size * .02;
        rowWidth += cells[i].width;
      }
      return { start, end, rowWidth };
    });
    left = width; right = 0; top = height; bottom = 0;
    rows.forEach(({ start, end, rowWidth }, row) => {
      const rowX = (width - rowWidth) / 2;
      let x = rowX;
      const y = height / 2 + (row - (rows.length - 1) / 2) * size * 1.38;
      left = Math.min(left, x);
      right = Math.max(right, x + rowWidth);
      top = Math.min(top, y - size * .65);
      bottom = Math.max(bottom, y + size * .65);
      for (let i = start; i < end; i++) {
        cells[i].x = x + cells[i].width / 2;
        cells[i].y = y;
        x += cells[i].width;
      }
    });
  }

  function drawSprite(sprite, cell) {
    const scale = size / BASE_FONT;
    const fit = Math.min(1, cell.width * .98 / (sprite.inkWidth * scale));
    const w = sprite.bitmap.width * scale * fit;
    const h = sprite.bitmap.height * scale;
    ctx.drawImage(sprite.bitmap, cell.x - w / 2, cell.y - h / 2, w, h);
  }

  function drawRepresentation(type) {
    for (const cell of cells) {
      if (cell.space) continue;
      drawSprite(type === 'binary' ? cell.binarySprite : type === 'hex' ? cell.hexSprite : cell.cipherSprite, cell);
    }
  }

  function scan(time, returning) {
    const padding = size * .24;
    const y = top - padding + (bottom - top + padding * 2) * scannerReturnPosition(time);
    const from = returning ? 'hex' : 'binary';
    const to = returning ? 'cipher' : 'hex';
    // The lower half is unscanned on the way down and revealed on the way up.
    ctx.save();
    ctx.beginPath(); ctx.rect(0, y, width, Math.max(0, height - y)); ctx.clip();
    drawRepresentation(returning ? to : from);
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, width, Math.max(0, y)); ctx.clip();
    drawRepresentation(returning ? from : to);
    ctx.restore();

    // A single horizontal beam stays visible through the turnaround.
    // Only its first appearance and final departure fade, never the text.
    const progress = clamp((time - SCAN_START) / (SCAN_END - SCAN_START));
    const enter = clamp(progress / .05);
    const leave = clamp((1 - progress) / .05);
    const opacity = enter * enter * (3 - 2 * enter) * leave * leave * (3 - 2 * leave);
    const x = left - padding;
    const span = right - left + padding * 2;
    ctx.save();
    ctx.fillStyle = accent;
    ctx.globalAlpha = .07 * opacity;
    ctx.fillRect(x, y - size * .15, span, size * .3);
    ctx.globalAlpha = .16 * opacity;
    ctx.fillRect(x, y - 3, span, 6);
    ctx.globalAlpha = opacity;
    ctx.fillRect(x, y - .75, span, 1.5);
    ctx.fillRect(x, y - 3, 1.5, 6);
    ctx.fillRect(x + span - 1.5, y - 3, 1.5, 6);
    ctx.restore();
  }

  function decryptTogether(time) {
    const rendered = [];
    for (const cell of cells) {
      if (cell.space) { rendered.push(' '); continue; }
      const local = scannerTogetherProgress(time, cell.rank, order.length);
      const steps = Math.floor(local * model.KEY);
      const active = local > 0 && local < 1;
      const currentIndex = (cell.origin - steps + alphabet.length) % alphabet.length;
      const character = steps === model.KEY ? cell.clear : alphabet[currentIndex];
      // All letters change in place from the same start; their finishes follow rank.
      drawSprite(glyph(character, active), cell);
      rendered.push(character);
    }
    return rendered.join('');
  }

  function render(ms) {
    if (disposed) return;
    lastTime = ms;
    refresh();
    const time = clamp(ms / model.durationMs) * DURATION;
    const phase = scannerTogetherPhase(time);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    let rendered = '';
    if (phase === 'binary') drawRepresentation('binary');
    else if (phase === 'scan-down' || phase === 'scan-up') scan(time, phase === 'scan-up');
    else if (phase === 'cipher') drawRepresentation('cipher');
    else rendered = decryptTogether(time);
    root.dataset.phase = phase;
    root.dataset.ciphertext = cipher;
    root.dataset.renderedText = phase === 'complete' ? plain : phase === 'cipher' ? cipher : rendered;
    root.dataset.scan = phase === 'scan-down' ? 'down' : phase === 'scan-up' ? 'up' : '0';
    root.dataset.beamPosition = String(scannerReturnPosition(time));
    root.dataset.reveal = resolution;
    root.dataset.resolutionOrder = order.join(',');
  }

  const observer = new ResizeObserver(() => render(lastTime));
  observer.observe(root);
  document.fonts.ready.then(() => { if (!disposed) { width = 0; theme = null; render(lastTime); } });
  render(0);
  return { render, destroy() {
    disposed = true;
    observer.disconnect();
    glyphs.clear();
    canvas.remove();
    delete root.dataset.phase;
    delete root.dataset.ciphertext;
    delete root.dataset.renderedText;
    delete root.dataset.scan;
    delete root.dataset.beamPosition;
    delete root.dataset.reveal;
    delete root.dataset.resolutionOrder;
  } };
}
