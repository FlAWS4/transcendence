import { decode } from '../../archives/early-prototypes/decryption/horizon-decryption-engine.mjs';

const clamp = value => Math.max(0, Math.min(1, value));
const BASE_FONT = 192;
const DURATION = 6800;
const FIRST_START = 600;
const FIRST_END = 1850;
const SECOND_START = 2150;
const SECOND_END = 3400;
const CHANGE_START = 3800;
const CHANGE_STAGGER = 200;
const CHANGE_DURATION = 2500;

export function scannerScramblePhase(time) {
  if (time < FIRST_START) return 'binary';
  if (time < FIRST_END) return 'scan-binary-hex';
  if (time < SECOND_START) return 'hex';
  if (time < SECOND_END) return 'scan-hex-cipher';
  if (time < CHANGE_START) return 'cipher';
  if (time < CHANGE_START + CHANGE_STAGGER + CHANGE_DURATION) return 'hacker';
  return 'complete';
}

/** A 42-position substitution schedule, accelerating once then slowing to rest. */
export function scannerChangePosition(time, index, count = 15, key = 42) {
  const delay = index / Math.max(1, count - 1) * CHANGE_STAGGER;
  const q = clamp((time - CHANGE_START - delay) / CHANGE_DURATION);
  // Integral of 12q(1-q)^2: velocity is zero at both ends and peaks at q=1/3.
  return key * q * q * (6 - 8 * q + 3 * q * q);
}

export function mount({ root, model }) {
  const bytes = model.sample(0).map(state => state.encryptedByte);
  const plain = decode(bytes, model.KEY);
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
    index, byte, cipher: cipher[index], clear: plain[index], space: plain[index] === ' ',
    origin: alphabet.indexOf(cipher[index]), x: 0, y: 0, width: 0,
    binarySprite: null, hexSprite: null, cipherSprite: null,
  }));
  let width = 0, height = 0, ratio = 1, size = 0;
  let left = 0, right = 0, top = 0, bottom = 0;
  let lastTime = 0, disposed = false, theme = null;
  let ink = '#1b1b1b', accent = '#00babc';

  function glyph(character) {
    if (glyphs.has(character)) return glyphs.get(character);
    measure.font = `500 ${BASE_FONT}px Jost, sans-serif`;
    const inkWidth = Math.max(1, measure.measureText(character).width);
    const bitmap = document.createElement('canvas');
    bitmap.width = Math.ceil(inkWidth + BASE_FONT * .2);
    bitmap.height = Math.ceil(BASE_FONT * 1.5);
    const paint = bitmap.getContext('2d');
    paint.font = `500 ${BASE_FONT}px Jost, sans-serif`;
    paint.fillStyle = ink;
    paint.textAlign = 'center';
    paint.textBaseline = 'middle';
    paint.fillText(character, bitmap.width / 2, bitmap.height / 2 + BASE_FONT * .045);
    const sprite = { bitmap, inkWidth };
    glyphs.set(character, sprite);
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
    for (const character of alphabet) glyph(character);
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
    left = width; right = 0; top = height; bottom = 0;
    for (let row = 0; row < groups.length; row++) {
      const [start, end] = groups[row];
      let rowWidth = 0;
      for (let i = start; i < end; i++) {
        cells[i].width = measure.measureText(cells[i].clear).width + size * .02;
        rowWidth += cells[i].width;
      }
      let x = (width - rowWidth) / 2;
      const y = height / 2 + (row - (groups.length - 1) / 2) * size * 1.38;
      left = Math.min(left, x);
      right = Math.max(right, x + rowWidth);
      top = Math.min(top, y - size * .65);
      bottom = Math.max(bottom, y + size * .65);
      for (let i = start; i < end; i++) {
        cells[i].x = x + cells[i].width / 2;
        cells[i].y = y;
        x += cells[i].width;
      }
    }
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

  function scan(from, to, progress) {
    const padding = size * .24;
    const x = left - padding + (right - left + padding * 2) * progress;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, top, Math.max(0, width - x), bottom - top); ctx.clip();
    drawRepresentation(from);
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.rect(0, top, Math.max(0, x), bottom - top); ctx.clip();
    drawRepresentation(to);
    ctx.restore();
    // A single line spans both mobile rows: each pass is one left-to-right scan.
    // Only the beam ramps at its ends; the text replacement stays spatial.
    const enter = clamp(progress / .07);
    const leave = clamp((1 - progress) / .07);
    const beamOpacity = enter * enter * (3 - 2 * enter) * leave * leave * (3 - 2 * leave);
    ctx.save();
    ctx.fillStyle = accent;
    ctx.globalAlpha = .07 * beamOpacity;
    ctx.fillRect(x - size * .22, top, size * .22, bottom - top);
    ctx.globalAlpha = .16 * beamOpacity;
    ctx.fillRect(x - 5, top, 5, bottom - top);
    ctx.globalAlpha = beamOpacity;
    ctx.fillRect(x - .75, top, 1.5, bottom - top);
    ctx.fillRect(x - 3, top, 6, 1.5);
    ctx.fillRect(x - 3, bottom - 1.5, 6, 1.5);
    ctx.restore();
  }

  function scramble(time) {
    for (const cell of cells) {
      if (cell.space) continue;
      const position = scannerChangePosition(time, cell.index, cells.length, model.KEY);
      const steps = Math.min(model.KEY, Math.floor(position));
      const currentIndex = (cell.origin - steps + alphabet.length) % alphabet.length;
      // Rapid substitutions keep the same centre and baseline. No vertical
      // offset, incoming/outgoing pair, or clipping window moves the letters.
      const character = steps === model.KEY ? cell.clear : alphabet[currentIndex];
      drawSprite(glyph(character), cell);
    }
  }

  function render(ms) {
    if (disposed) return;
    lastTime = ms;
    refresh();
    const time = clamp(ms / model.durationMs) * DURATION;
    const phase = scannerScramblePhase(time);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (phase === 'binary') drawRepresentation('binary');
    else if (phase === 'scan-binary-hex') scan('binary', 'hex', (time - FIRST_START) / (FIRST_END - FIRST_START));
    else if (phase === 'hex') drawRepresentation('hex');
    else if (phase === 'scan-hex-cipher') scan('hex', 'cipher', (time - SECOND_START) / (SECOND_END - SECOND_START));
    else if (phase === 'cipher') drawRepresentation('cipher');
    else scramble(time);
    root.dataset.phase = phase;
    root.dataset.ciphertext = cipher;
    root.dataset.renderedText = phase === 'complete' ? plain : phase === 'cipher' ? cipher : '';
    root.dataset.scan = phase === 'scan-binary-hex' ? '1' : phase === 'scan-hex-cipher' ? '2' : '0';
    root.dataset.reveal = 'substitution';
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
    delete root.dataset.reveal;
  } };
}
