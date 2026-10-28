import { transitionAt } from './shared.mjs';
import { clamp, mix, smooth, stage, phraseLayout } from './strand-helpers.mjs';

/** The byte strip gets physically shorter; all motion follows the supplied time. */
export function mount({ root, model }) {
  return stage({ root, model, label: 'ruban compacté' }, ({ ctx, width, height, colors, states, ms }) => {
    const mobile = width < 700;
    const layout = phraseLayout(ctx, model.PHRASE, width, mobile, 82);
    let size = layout.size;
    let finalUnits = layout.units;
    let hexUnits = finalUnits.map(unit => Math.max(unit * 1.2, size * .68));
    let binaryUnits = hexUnits.map(unit => unit * (mobile ? 1.14 : 1.5));
    const widest = Math.max(...layout.ranges.map(([start, end]) => binaryUnits.slice(start, end).reduce((a, b) => a + b, 0)));
    const fit = Math.min(1, (width - 32) / widest);
    size *= fit;
    finalUnits = finalUnits.map(unit => unit * fit);
    hexUnits = hexUnits.map(unit => unit * fit);
    binaryUnits = binaryUnits.map(unit => unit * fit);
    const first = states.reduce((sum, state) => sum + state.binaryToHex, 0) / states.length;
    const second = states.reduce((sum, state) => sum + state.hexToCipher, 0) / states.length;
    const widths = states.map((state, index) => mix(mix(binaryUnits[index], hexUnits[index], smooth(state.binaryToHex)), finalUnits[index], smooth(state.hexToCipher)));
    const bitSize = size * (mobile ? .31 : .185);
    const hexSize = size * .48;
    const bandHeight = mix(Math.max(34, bitSize * (mobile ? 3 : 2.7)), size * 1.32, smooth(second));
    const lineGap = Math.max(size * 1.7, bandHeight + 26);
    const transitions = states.map((_, index) => transitionAt(ms, index));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    function letter(text, x, y, fontSize, maxWidth) {
      ctx.font = `500 ${fontSize}px Jost, sans-serif`;
      ctx.fillStyle = colors.text;
      ctx.fillText(text, x, y, maxWidth);
    }

    function reveal(text, x, y, fontSize, fraction, maxWidth) {
      const opening = maxWidth * clamp(fraction);
      if (opening <= 0) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - opening / 2, y - bandHeight / 2 + 1, opening, bandHeight - 2);
      ctx.clip();
      ctx.fillStyle = colors.soft;
      ctx.fillRect(x - maxWidth, y - fontSize, maxWidth * 2, fontSize * 2);
      letter(text, x, y, fontSize, maxWidth);
      ctx.restore();
    }

    function byte(index, x, y, available) {
      const state = states[index];
      const bits = state.encryptedByte.toString(2).padStart(8, '0');
      const hex = state.encryptedByte.toString(16).padStart(2, '0').toUpperCase();
      const a = smooth(state.binaryToHex);
      const b = smooth(state.hexToCipher);
      if (a < 1) {
        for (let bit = 0; bit < 8; bit++) {
          const quartet = Math.floor(bit / 4);
          const startX = mobile ? (bit % 4 - 1.5) * bitSize * .65 : (bit - 3.5) * bitSize * .64;
          const startY = mobile ? (quartet - .5) * bitSize * 1.3 : 0;
          const destination = (quartet - .5) * hexSize * .65;
          letter(bits[bit], x + mix(startX, destination, a), y + mix(startY, 0, a), bitSize * mix(1, .25, a), bitSize);
        }
        for (let digit = 0; digit < 2; digit++) {
          reveal(hex[digit], x + (digit - .5) * hexSize * .65, y, hexSize, smooth((a - .42) / .58), hexSize * .7);
        }
      } else if (b < 1) {
        for (let digit = 0; digit < 2; digit++) {
          letter(hex[digit], x + (digit - .5) * hexSize * .65 * (1 - b), y, hexSize * mix(1, .2, b), available * .45);
        }
        reveal(state.encryptedCharacter, x, y, size, smooth((b - .3) / .7), available * .96);
      } else {
        const transition = transitions[index];
        const same = transition.from.text === transition.to.text;
        const p = same ? 1 : clamp(transition.progress);
        const displayed = p < .5 ? transition.from.text : transition.to.text;
        const squeeze = same ? 1 : Math.max(.025, Math.abs(1 - 2 * p));
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(squeeze, 1);
        letter(displayed, 0, 0, size, available * .96);
        ctx.restore();
      }
    }

    const rowWidths = [];
    layout.ranges.forEach(([start, end], row) => {
      const total = widths.slice(start, end).reduce((a, b) => a + b, 0);
      rowWidths.push(total);
      const x = (width - total) / 2;
      const y = height / 2 + (row - (layout.ranges.length - 1) / 2) * lineGap;
      ctx.fillStyle = colors.soft;
      ctx.fillRect(x - 10, y - bandHeight / 2, total + 20, bandHeight);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 10.5, y - bandHeight / 2 - .5, total + 21, bandHeight + 1);
      let position = x;
      for (let index = start; index < end; index++) {
        const unit = widths[index];
        byte(index, position + unit / 2, y, unit);
        if (index < end - 1) {
          ctx.strokeStyle = colors.border;
          ctx.globalAlpha = 1 - smooth(second) * .7;
          ctx.beginPath();
          ctx.moveTo(position + unit, y - bandHeight / 2);
          ctx.lineTo(position + unit, y - bandHeight / 2 + 5);
          ctx.moveTo(position + unit, y + bandHeight / 2 - 5);
          ctx.lineTo(position + unit, y + bandHeight / 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        position += unit;
      }
    });
    root.dataset.ribbonWidths = rowWidths.map(value => value.toFixed(2)).join(',');
    root.dataset.compaction = `${first.toFixed(3)},${second.toFixed(3)}`;
    const text = second === 1 ? transitions.map(item => item.progress < .5 ? item.from.text : item.to.text).join('') : '';
    return { text, phase: ms >= model.durationMs ? 'letter' : second === 1 ? 'decrypting' : first === 1 ? 'hex-to-cipher' : 'binary-to-hex' };
  });
}
