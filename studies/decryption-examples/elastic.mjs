import { transitionAt } from './shared.mjs';
import { clamp, smooth, stage, phraseLayout } from './strand-helpers.mjs';

/** Values ride a flexible baseline. The whole cord settles; no scanning front. */
export function mount({ root, model }) {
  return stage({ root, model, label: 'ligne élastique' }, ({ ctx, width, height, colors, states, ms }) => {
    const mobile = width < 700;
    const { size, units, ranges } = phraseLayout(ctx, model.PHRASE, width, mobile, 88);
    const first = states.reduce((sum, state) => sum + state.binaryToHex, 0) / states.length;
    const second = states.reduce((sum, state) => sum + state.hexToCipher, 0) / states.length;
    const decoding = smooth((ms - 3400) / 3400);
    const amplitude = size * .58 * (1 - .65 * smooth(first)) * (1 - .66 * smooth(second)) * (1 - decoding);
    const turns = states.map((_, index) => transitionAt(ms, index));
    const rowGap = size * 2.14;
    const frequency = ms * .0034;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    function drawValue(representation, available) {
      ctx.fillStyle = colors.text;
      if (representation.type === 'binary') {
        const bitSize = Math.max(9, size * .19);
        ctx.font = `500 ${bitSize}px Jost, sans-serif`;
        for (let bit = 0; bit < 8; bit++) {
          ctx.fillText(representation.text[bit], (Math.floor(bit / 4) - .5) * bitSize * .86, (bit % 4 - 1.5) * bitSize * 1.04);
        }
      } else if (representation.type === 'hex') {
        ctx.font = `500 ${size * .45}px Jost, sans-serif`;
        ctx.fillText(representation.text, 0, 0, available * .95);
      } else {
        ctx.font = `500 ${size}px Jost, sans-serif`;
        ctx.fillText(representation.text, 0, 0, available * .97);
      }
    }

    ranges.forEach(([start, end], row) => {
      const length = units.slice(start, end).reduce((sum, unit) => sum + unit, 0);
      const left = (width - length) / 2;
      const baseline = height / 2 + size * .35 + (row - (ranges.length - 1) / 2) * rowGap;
      const extension = size * .23;
      const span = length + extension * 2;
      const wave = position => {
        const u = clamp(position);
        const envelope = Math.sin(Math.PI * u);
        return amplitude * envelope * (Math.sin(u * Math.PI * 2.7 - frequency + row * .6) + .24 * Math.sin(u * Math.PI * 5.2 + frequency * .72));
      };
      ctx.beginPath();
      for (let point = 0; point <= 120; point++) {
        const u = point / 120;
        const x = left - extension + u * span;
        const y = baseline + wave(u);
        if (point === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = .35 + .3 * (1 - decoding);
      ctx.stroke();
      ctx.globalAlpha = 1;
      for (const endpoint of [left - extension, left + length + extension]) {
        ctx.beginPath();
        ctx.arc(endpoint, baseline, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = colors.accent;
        ctx.fill();
      }

      let cursor = left;
      for (let index = start; index < end; index++) {
        const x = cursor + units[index] / 2;
        const u = (x - left + extension) / span;
        const slope = (wave(u + .001) - wave(u - .001)) / (.002 * span);
        const angle = Math.atan(slope);
        const y = baseline + wave(u);
        const transition = turns[index];
        const same = transition.from.type === transition.to.type && transition.from.text === transition.to.text;
        const p = same ? 1 : smooth(transition.progress);
        ctx.save();
        if (mobile) {
          // Rotate around each value's centre on narrow screens, so opposite
          // slopes cannot swing neighbouring byte groups into one another.
          ctx.translate(x, y - size * .48);
          ctx.rotate(Math.max(-.28, Math.min(.28, angle)));
        } else {
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.translate(0, -size * .48);
        }
        if (same) {
          drawValue(transition.to, units[index]);
        } else if (transition.from.type !== transition.to.type) {
          // Tension flattens the old encoding into the cord, then lifts the
          // new encoding out of it. Glyphs remain opaque throughout.
          const outgoing = p < .5;
          const stretch = Math.max(.015, Math.abs(1 - 2 * p));
          ctx.translate(0, size * .48 * (1 - stretch));
          ctx.scale(1 + .24 * Math.sin(p * Math.PI), stretch);
          drawValue(outgoing ? transition.from : transition.to, units[index]);
        } else {
          const outgoing = p < .5;
          ctx.scale(Math.max(.025, Math.abs(1 - 2 * p)), 1 + .08 * Math.sin(p * Math.PI));
          drawValue(outgoing ? transition.from : transition.to, units[index]);
        }
        ctx.restore();
        cursor += units[index];
      }
    });
    root.dataset.elasticAmplitude = amplitude.toFixed(3);
    root.dataset.elasticAnchor = mobile ? 'glyph-centre' : 'baseline';
    const text = second === 1 ? turns.map(item => item.progress < .5 ? item.from.text : item.to.text).join('') : '';
    return { text, phase: ms >= model.durationMs ? 'letter' : second === 1 ? 'decrypting' : first === 1 ? 'hex-to-cipher' : 'binary-to-hex' };
  });
}
