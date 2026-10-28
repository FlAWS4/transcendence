/** Archived exploration: a scanning line changes one representation at a time. */
const clamp = value => Math.max(0, Math.min(1, value));

export function mount({ root, model }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'scanner-canvas';
  canvas.style.cssText = 'display:block;width:100%;height:100%;min-height:240px';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Message chiffré, onde de déchiffrement');
  root.replaceChildren(canvas);
  const ctx = canvas.getContext('2d');
  const initial = model.sample(0);
  const phrase = model.PHRASE;
  const alphabet = model.ALPHABET;
  const duration = model.durationMs;
  let lastTime = 0;
  let disposed = false;

  function render(ms) {
    if (disposed) return;
    lastTime = ms;
    const t = clamp(ms / duration) * 6800;
    const width = root.clientWidth || 800;
    const height = root.clientHeight || 400;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const bitmapWidth = Math.round(width * ratio);
    const bitmapHeight = Math.round(height * ratio);
    if (canvas.width !== bitmapWidth || canvas.height !== bitmapHeight) {
      canvas.width = bitmapWidth;
      canvas.height = bitmapHeight;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const css = getComputedStyle(root);
    const ink = css.getPropertyValue('--h42-color-text').trim() || '#1b1b1b';
    const accent = css.getPropertyValue('--h42-color-accent').trim() || '#00babc';
    const mobile = width < 700;
    let size = mobile ? Math.min(52, width / 6.8) : Math.min(92, width / 10.8);
    ctx.font = `500 ${size}px Jost, sans-serif`;
    const units = Array.from(phrase, char => Math.max(ctx.measureText(char).width, size * .28) + size * .018);
    const groups = mobile ? [[0, 7], [7, phrase.length]] : [[0, phrase.length]];
    const rows = groups.map(([start, end]) => ({ start, end, width: units.slice(start, end).reduce((a, b) => a + b, 0) }));
    const total = rows.reduce((sum, row) => sum + row.width, 0);
    const rowHeight = size * 1.42;
    let offset = 0;
    const glyphs = [];
    rows.forEach((row, rowIndex) => {
      row.offset = offset;
      row.x = (width - row.width) / 2;
      row.y = height / 2 + (rowIndex - (rows.length - 1) / 2) * rowHeight;
      let x = row.x;
      for (let index = row.start; index < row.end; index++) {
        glyphs.push({ index, x: x + units[index] / 2, y: row.y, position: (offset + x - row.x + units[index] / 2) / total });
        x += units[index];
      }
      offset += row.width;
    });

    const first = clamp((t - 600) / 1250);
    const second = clamp((t - 2150) / 1250);
    const third = clamp((t - 3650) / 2400);
    const pass = t < 1900 ? 0 : t < 3450 ? 1 : 2;
    const progress = pass === 0 ? first : pass === 1 ? second : third;
    const front = progress * (total + size * .5) - size * .25;
    const active = pass === 0 ? t >= 600 && t <= 1850 : pass === 1 ? t >= 2150 && t <= 3400 : t >= 3650 && t <= 6050;
    const rendered = [];

    function drawValue(glyph, representation, color = ink) {
      const state = initial[glyph.index];
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (representation === 'binary') {
        const bits = state.encryptedByte.toString(2).padStart(8, '0');
        ctx.font = `400 ${size * .155}px ui-monospace, SFMono-Regular, monospace`;
        for (let bit = 0; bit < 8; bit++) {
          ctx.fillText(bits[bit], glyph.x + ((bit % 2) - .5) * size * .145, glyph.y + (Math.floor(bit / 2) - 1.5) * size * .178);
        }
      } else if (representation === 'hex') {
        ctx.font = `400 ${size * .35}px ui-monospace, SFMono-Regular, monospace`;
        ctx.fillText(state.encryptedByte.toString(16).padStart(2, '0').toUpperCase(), glyph.x, glyph.y + size * .025);
      } else {
        ctx.font = `500 ${size}px Jost, sans-serif`;
        ctx.fillText(representation === 'cipher' ? state.encryptedCharacter : representation, glyph.x, glyph.y + size * .042, units[glyph.index] * .97);
      }
    }

    for (const row of rows) {
      const localFront = row.x + front - row.offset;
      const rowGlyphs = glyphs.filter(glyph => glyph.index >= row.start && glyph.index < row.end);
      if (pass < 2) {
        const from = pass === 0 ? 'binary' : 'hex';
        const to = pass === 0 ? 'hex' : 'cipher';
        // Geometry reveals the new value behind the beam. No opacity crossfade.
        ctx.save();
        ctx.beginPath();
        ctx.rect(Math.max(0, localFront), row.y - rowHeight / 2, Math.max(0, width - localFront), rowHeight);
        ctx.clip();
        rowGlyphs.forEach(glyph => drawValue(glyph, from));
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, row.y - rowHeight / 2, Math.max(0, localFront), rowHeight);
        ctx.clip();
        rowGlyphs.forEach(glyph => drawValue(glyph, to));
        ctx.restore();
        rowGlyphs.forEach(glyph => rendered[glyph.index] = glyph.position < progress ? to : from);
      } else {
        rowGlyphs.forEach(glyph => {
          const local = clamp((t - (3650 + glyph.position * 2400)) / 650);
          const steps = t >= 6800 ? model.KEY : Math.floor(local * model.KEY);
          const origin = alphabet.indexOf(initial[glyph.index].encryptedCharacter);
          const char = origin < 0 ? initial[glyph.index].encryptedCharacter : alphabet[(origin - steps + alphabet.length) % alphabet.length];
          const engaged = local > 0 && local < 1;
          drawValue(glyph, char, engaged ? accent : ink);
          if (engaged) {
            // A short horizontal pulse moves within each active glyph's baseline.
            // Its phase follows the actual 42 rotations, with no random data.
            const tick = (local * model.KEY) % 1;
            ctx.fillStyle = accent;
            ctx.fillRect(glyph.x - units[glyph.index] * .35, glyph.y + size * .58, units[glyph.index] * .7 * (1 - tick), 1);
          }
          rendered[glyph.index] = char;
        });
      }

      if (active && localFront >= row.x - size * .18 && localFront <= row.x + row.width + size * .18) {
        const top = row.y - size * .65;
        const beamHeight = size * 1.3;
        ctx.save();
        ctx.fillStyle = accent;
        ctx.globalAlpha = .065;
        ctx.fillRect(localFront - size * .25, top, size * .25, beamHeight);
        ctx.globalAlpha = .15;
        ctx.fillRect(localFront - size * .075, top, size * .075, beamHeight);
        ctx.globalAlpha = 1;
        ctx.fillRect(localFront - .75, top, 1.5, beamHeight);
        ctx.fillRect(localFront - 3, top, 6, 1.5);
        ctx.fillRect(localFront - 3, top + beamHeight - 1.5, 6, 1.5);
        ctx.restore();
      }
    }
    const complete = t >= 6800;
    root.dataset.phase = complete ? 'letter' : t < 600 ? 'binary' : t < 1850 ? 'binary-to-hex' : t < 2150 ? 'hex' : t < 3400 ? 'hex-to-cipher' : t < 3650 ? 'cipher' : 'decrypting';
    root.dataset.renderedText = pass === 2 ? rendered.join('') : '';
    canvas.setAttribute('aria-label', complete ? phrase : 'Message chiffré, onde de déchiffrement');
  }

  const observer = new ResizeObserver(() => render(lastTime));
  observer.observe(root);
  document.fonts.ready.then(() => render(lastTime));
  render(0);
  return {
    render,
    destroy() {
      disposed = true;
      observer.disconnect();
      canvas.remove();
      delete root.dataset.phase;
      delete root.dataset.renderedText;
    },
  };
}
