/** Shared drawing lifecycle for the archived grid and orbit examples. */
export const clamp = value => Math.max(0, Math.min(1, value));
export const ease = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
export const mix = (a, b, p) => a + (b - a) * p;
export const pointMix = (a, b, p) => ({ x: mix(a.x, b.x, p), y: mix(a.y, b.y, p) });

export function valueFor(state) {
  if (state.binaryToHex < .5) return { type: 'binary', text: state.encryptedByte.toString(2).padStart(8, '0') };
  if (state.hexToCipher < .5) return { type: 'hex', text: state.encryptedByte.toString(16).padStart(2, '0').toUpperCase() };
  return { type: 'glyph', text: state.character };
}

export function phraseLayout(ctx, width, height, phrase) {
  const mobile = width < 700;
  const font = mobile ? Math.min(49, width / 6.9) : Math.min(84, width / 10.9);
  ctx.font = `500 ${font}px Jost, sans-serif`;
  const widths = Array.from(phrase, char => ctx.measureText(char).width + font * .016);
  const groups = mobile ? [[0, 6], [7, phrase.length]] : [[0, phrase.length]];
  const targets = [];
  groups.forEach(([start, end], row) => {
    const rowWidth = widths.slice(start, end).reduce((sum, width) => sum + width, 0);
    let left = (width - rowWidth) / 2;
    const y = height / 2 + (row - (groups.length - 1) / 2) * font * 1.32;
    for (let i = start; i < end; i++) {
      targets[i] = { x: left + widths[i] / 2, y, width: widths[i] };
      left += widths[i];
    }
  });
  if (mobile) targets[6] = { x: width / 2, y: height / 2, width: widths[6] };
  return { font, mobile, targets, widths };
}

export function drawValue(ctx, item, x, y, size, color, maxWidth) {
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (item.type === 'binary') {
    ctx.font = `400 ${size * .235}px ui-monospace, SFMono-Regular, monospace`;
    ctx.fillText(item.text.slice(0, 4), x, y - size * .17);
    ctx.fillText(item.text.slice(4), x, y + size * .17);
  } else if (item.type === 'hex') {
    ctx.font = `400 ${size * .47}px ui-monospace, SFMono-Regular, monospace`;
    ctx.fillText(item.text, x, y + size * .02);
  } else {
    ctx.font = `500 ${size}px Jost, sans-serif`;
    if (maxWidth) ctx.fillText(item.text, x, y + size * .045, maxWidth);
    else ctx.fillText(item.text, x, y + size * .045);
  }
}

export function canvasMount({ root, model }, draw) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;min-height:180px';
  canvas.setAttribute('aria-hidden', 'true');
  root.replaceChildren(canvas);
  const ctx = canvas.getContext('2d');
  let lastTime = 0;
  let disposed = false;
  function render(ms) {
    if (disposed) return;
    lastTime = ms;
    const width = root.clientWidth || 800;
    const height = root.clientHeight || 400;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const css = getComputedStyle(root);
    const colors = {
      ink: css.getPropertyValue('--h42-color-text').trim() || '#1b1b1b',
      accent: css.getPropertyValue('--h42-color-accent').trim() || '#00babc',
      border: css.getPropertyValue('--h42-color-border').trim() || '#e3e3e3',
      surface: css.getPropertyValue('--h42-color-surface').trim() || '#fff',
    };
    const time = clamp(ms / model.durationMs) * 6800;
    const states = model.sample(clamp(ms / model.durationMs) * model.durationMs);
    draw({ ctx, width, height, time, states, colors, layout: phraseLayout(ctx, width, height, model.PHRASE), model });
    root.dataset.renderedText = states.map(state => state.character).join('');
    root.dataset.phase = time >= 6800 ? 'letter' : states[0].phase;
  }
  const observer = new ResizeObserver(() => render(lastTime));
  observer.observe(root);
  document.fonts.ready.then(() => render(lastTime));
  render(0);
  return { render, destroy() { disposed = true; observer.disconnect(); canvas.remove(); delete root.dataset.phase; delete root.dataset.renderedText; } };
}
