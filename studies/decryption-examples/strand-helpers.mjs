export const clamp = value => Math.max(0, Math.min(1, value));
export const mix = (from, to, progress) => from + (to - from) * progress;
export const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

export function stage({ root, model, label }, paint) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;min-height:230px';
  canvas.setAttribute('aria-hidden', 'true');
  root.append(canvas);
  const context = canvas.getContext('2d');
  let current = 0;
  let disposed = false;

  function render(ms) {
    if (disposed) return;
    current = Math.max(0, Math.min(model.durationMs, Number.isFinite(ms) ? ms : 0));
    const width = root.clientWidth || 800;
    const height = root.clientHeight || 350;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const pixels = [Math.round(width * ratio), Math.round(height * ratio)];
    if (canvas.width !== pixels[0] || canvas.height !== pixels[1]) {
      canvas.width = pixels[0];
      canvas.height = pixels[1];
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    const css = getComputedStyle(root);
    const color = (name, fallback) => css.getPropertyValue(`--h42-color-${name}`).trim() || fallback;
    const colors = {
      text: color('text', '#1b1b1b'),
      background: color('bg', '#fff'),
      soft: color('soft', '#e6f4f1'),
      border: color('border', '#e3e3e3'),
      accent: color('action-quiet', '#173d7a'),
    };
    const states = model.sample(current);
    const result = paint({ ctx: context, width, height, colors, states, ms: current });
    root.dataset.renderedText = result?.text || '';
    root.dataset.phase = result?.phase || states[0].phase;
    root.dataset.renderer = label;
    canvas.dataset.time = String(current);
    canvas.setAttribute('aria-label', current >= model.durationMs ? model.PHRASE : `Message chiffré, ${label}`);
  }

  const observer = new ResizeObserver(() => render(current));
  observer.observe(root);
  document.fonts.ready.then(() => render(current));
  render(0);
  return {
    render,
    destroy() {
      disposed = true;
      observer.disconnect();
      canvas.remove();
      delete root.dataset.phase;
      delete root.dataset.renderedText;
      delete root.dataset.renderer;
      delete root.dataset.ribbonWidths;
      delete root.dataset.compaction;
      delete root.dataset.elasticAmplitude;
      delete root.dataset.elasticAnchor;
    },
  };
}

export function phraseLayout(ctx, phrase, width, mobile, maxSize = 82) {
  let size = mobile ? Math.min(50, width / 7.2) : Math.min(maxSize, width / 13);
  ctx.font = `500 ${size}px Jost, sans-serif`;
  const units = Array.from(phrase, character => Math.max(ctx.measureText(character).width, size * .28) + size * .028);
  const ranges = mobile ? [[0, 7], [7, phrase.length]] : [[0, phrase.length]];
  const widest = Math.max(...ranges.map(([start, end]) => units.slice(start, end).reduce((a, b) => a + b, 0)));
  const scale = Math.min(1, (width - 32) / widest);
  size *= scale;
  return { size, units: units.map(unit => unit * scale), ranges };
}
