import { canvasMount, clamp, ease, mix, drawValue, valueFor } from './composition-canvas.mjs';

function orthogonal(from, to, progress, verticalFirst = false) {
  const p = clamp(progress);
  const first = ease(Math.min(1, p * 2));
  const second = ease(Math.max(0, (p - .5) * 2));
  return verticalFirst
    ? { x: mix(from.x, to.x, second), y: mix(from.y, to.y, first) }
    : { x: mix(from.x, to.x, first), y: mix(from.y, to.y, second) };
}

export function mount(options) {
  return canvasMount(options, ({ ctx, width, height, time, states, colors, layout, model }) => {
    const { font, mobile, targets } = layout;
    const gap = mobile ? Math.min(69, width / 4.7) : Math.min(104, height / 3.85);
    const columns = mobile ? 3 : 5;
    const nextColumns = mobile ? 5 : 3;
    const cellGap = Math.min(gap, height / (5 + .7));
    const cellSize = cellGap * .76;
    const gridPosition = (index, count = columns) => ({
      x: width / 2 + ((index % count) - (count - 1) / 2) * cellGap,
      y: height / 2 + (Math.floor(index / count) - (Math.ceil(states.length / count) - 1) / 2) * cellGap,
    });
    const wordFont = Math.min(mobile ? 34 : 50, cellGap * .74);
    ctx.font = `500 ${wordFont}px Jost, sans-serif`;
    const wordTargets = [];
    [[0, 6], [7, 10], [11, 15]].forEach(([start, end], row) => {
      const widths = Array.from(model.PHRASE.slice(start, end), character => ctx.measureText(character).width + wordFont * .05);
      let x = width / 2 - widths.reduce((a, b) => a + b, 0) / 2;
      for (let i = start; i < end; i++) {
        wordTargets[i] = { x: x + widths[i - start] / 2, y: height / 2 + (row - 1) * cellGap * .97, width: widths[i - start] };
        x += widths[i - start];
      }
    });
    // Spaces remain data in the first two representations, then become spacing.
    wordTargets[6] = { x: width / 2, y: height / 2 - cellGap * .47, width: wordFont * .25 };
    wordTargets[10] = { x: width / 2, y: height / 2 + cellGap * .47, width: wordFont * .25 };

    states.forEach((state, index) => {
      const order = index / Math.max(1, states.length - 1);
      const first = clamp((time - 600 - order * 160) / 900);
      const second = clamp((time - 1900 - order * 160) / 900);
      const assemble = clamp((time - 3450 - order * 460) / 1780);
      const a = gridPosition(index);
      const b = gridPosition(index, nextColumns);
      let position = orthogonal(a, b, first, index % 2 === 0);
      if (second > 0) position = orthogonal(b, wordTargets[index], second, index % 2 !== 0);
      if (assemble > 0) position = orthogonal(wordTargets[index], targets[index], assemble, false);

      const item = valueFor(state);
      const glyphSize = mix(wordFont, font, ease(assemble));
      const valueSize = item.type === 'glyph' ? glyphSize : cellSize * .78;
      const tile = cellSize * (1 - ease(second));
      if (tile > .5) {
        ctx.fillStyle = colors.surface;
        ctx.strokeStyle = first > 0 && first < 1 ? colors.accent : colors.border;
        ctx.lineWidth = 1;
        ctx.fillRect(position.x - tile / 2, position.y - tile / 2, tile, tile);
        ctx.strokeRect(position.x - tile / 2, position.y - tile / 2, tile, tile);
      }
      const currentColor = assemble > 0 && assemble < 1 ? colors.accent : colors.ink;
      drawValue(ctx, item, position.x, position.y, valueSize, currentColor,
        item.type === 'glyph' ? mix(wordTargets[index].width, targets[index].width, ease(assemble)) * .98 : undefined);
    });
  });
}
