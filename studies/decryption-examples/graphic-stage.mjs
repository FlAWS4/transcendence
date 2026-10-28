export function graphicStage(root, model, paint) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;min-height:240px';
  canvas.setAttribute('aria-hidden', 'true');
  root.append(canvas);
  const ctx = canvas.getContext('2d');
  let time = 0;
  let disposed = false;
  function render(ms) {
    if (disposed) return;
    time = Math.max(0, Math.min(model.durationMs, ms));
    const width = root.clientWidth;
    const height = root.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const mobile = width < 700;
    const scale = mobile ? Math.min(.47, width / 800) : Math.min(.78, width / 1500);
    const rows = mobile ? [[0, 7], [7, 15]] : [[0, 15]];
    const cells = [];
    rows.forEach(([start, end], row) => {
      const count = mobile && row === 0 ? 6 : end - start;
      const left = (width - count * 100 * scale) / 2;
      const y = height / 2 + (row - (rows.length - 1) / 2) * 175 * scale;
      for (let index = start; index < end; index++) cells.push({index, x: left + (index - start + .5) * 100 * scale, y});
    });
    const css = getComputedStyle(root);
    const colors = {
      ink: css.getPropertyValue('--h42-color-text').trim(),
      accent: css.getPropertyValue('--h42-color-action-quiet').trim(),
      surface: css.getPropertyValue('--h42-color-surface').trim(),
      border: css.getPropertyValue('--h42-color-border').trim(),
    };
    paint({ctx, width, height, scale, cells, colors, time, states: model.sample(time)});
    root.dataset.phase = time >= model.durationMs ? 'letter' : 'working';
    root.dataset.renderedText = time >= model.durationMs ? model.PHRASE : '';
  }
  const observer = new ResizeObserver(() => render(time));
  observer.observe(root);
  render(0);
  return { render, destroy() { disposed = true; observer.disconnect(); canvas.remove(); } };
}

export function drawInk(ctx, representation) {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (representation.type === 'binary') {
    ctx.font = '500 18px monospace';
    for (let i = 0; i < 8; i++) ctx.fillText(representation.text[i], 50 + (i < 4 ? -13 : 13), 70 + ((i % 4) - 1.5) * 22);
  } else if (representation.type === 'hex') {
    ctx.font = '500 38px monospace'; ctx.fillText(representation.text, 50, 70);
  } else {
    ctx.font = '500 100px Jost, sans-serif';
    ctx.textBaseline = 'alphabetic';
    const metrics = ctx.measureText('H');
    ctx.fillText(representation.text, 50, 70 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2, 82);
  }
}
