import { canvasMount, clamp, ease, mix, drawValue, valueFor } from './composition-canvas.mjs';

function bezier(a, b, c, d, p) {
  const q = 1 - p;
  return { x: q ** 3 * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p ** 3 * d.x,
    y: q ** 3 * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p ** 3 * d.y };
}

export function mount(options) {
  return canvasMount(options, ({ ctx, width, height, time, states, colors, layout }) => {
    const { font, mobile, targets } = layout;
    const cx = width / 2;
    const cy = height / 2;
    const baseX = Math.min(width * (mobile ? .36 : .40), 420);
    const baseY = Math.min(height * .36, 170);
    const reducedRadius = mix(1, .77, ease((time - 600) / 2400));
    const ringGone = ease((time - 3500) / 1200);
    const positions = (index, t) => {
      const ring = index % 3;
      const slot = Math.floor(index / 3);
      const direction = ring === 1 ? -1 : 1;
      const angle = slot / 5 * Math.PI * 2 + ring * .55 + t / 1800 * direction;
      const radius = mix(1, .77, ease((t - 600) / 2400));
      const rx = baseX * (.54 + ring * .22) * radius;
      const ry = baseY * (.58 + ring * .20) * radius;
      return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry,
        tangentX: -Math.sin(angle) * rx * direction, tangentY: Math.cos(angle) * ry * direction };
    };
    if (ringGone < 1) {
      ctx.save();
      ctx.globalAlpha = (1 - ringGone) * .65;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, baseX * (.54 + ring * .22) * reducedRadius,
          baseY * (.58 + ring * .20) * reducedRadius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    states.forEach((state, index) => {
      const launch = 3420 + index / (states.length - 1) * 480;
      const travel = clamp((time - launch) / 2200);
      let location = positions(index, time);
      if (travel > 0) {
        const start = positions(index, launch);
        const target = targets[index];
        const normal = (index % 2 ? 1 : -1);
        const controlA = { x: start.x + start.tangentX * .8, y: start.y + start.tangentY * .8 };
        const controlB = { x: target.x + normal * Math.min(width * .1, 120), y: target.y - normal * Math.min(height * .28, 140) };
        location = bezier(start, controlA, controlB, target, ease(travel));
      }
      const item = valueFor(state);
      const orbitSize = mobile ? Math.min(36, width / 8.5) : 42;
      const size = item.type === 'glyph' ? mix(orbitSize, font, ease(travel)) : orbitSize;
      const color = travel > 0 && travel < 1 ? colors.accent : colors.ink;
      // Small opaque plates keep bytes legible when two rings cross.
      if (item.type !== 'glyph') {
        ctx.fillStyle = colors.surface;
        ctx.fillRect(location.x - orbitSize * .42, location.y - orbitSize * .42, orbitSize * .84, orbitSize * .84);
      }
      drawValue(ctx, item, location.x, location.y, size, color, travel === 1 ? targets[index].width * .98 : undefined);
    });
  });
}
