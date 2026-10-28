// Morph the ink itself: four bits become one hex digit, then the two digits
// become the left and right parts of a character. No opacity crossfade.
const ease = value => value * value * (3 - 2 * value);
const mix = (a, b, amount) => a + (b - a) * amount;

function textAt(context, text, x, y, font, maxWidth = Infinity, reference = text) {
  context.font = font;
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  const metrics = context.measureText(reference);
  const width = context.measureText(text).width;
  context.save();
  context.translate(x, y);
  context.scale(Math.min(1, maxWidth / (width || 1)), 1);
  context.fillText(text, 0, (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2);
  context.restore();
}

function pairPoints(source, target, order) {
  const sort = order === 'vertical' ? (a, b) => a.y - b.y || a.x - b.x : (a, b) => a.x - b.x || a.y - b.y;
  source.sort(sort);
  target.sort(sort);
  const count = Math.max(source.length, target.length);
  return Array.from({ length: count }, (_, index) => ({
    from: source[Math.floor(index * source.length / count)] || { x: 0, y: 0 },
    to: target[Math.floor(index * target.length / count)] || { x: 0, y: 0 },
  }));
}

export function createMorphRenderer(cells, phrase) {
  const raster = document.createElement('canvas');
  const mask = raster.getContext('2d', { willReadFrequently: true });
  let settings;
  let lastStates;

  function drawText(context, view, kind, text, nibble) {
    const centerX = view.canvasWidth / 2;
    const centerY = settings.height / 2;
    if (kind === 'glyph') {
      textAt(context, text, centerX, centerY, settings.font, view.width, 'H');
      return;
    }
    const nibbles = nibble === undefined ? [0, 1] : [nibble];
    for (const column of nibbles) {
      const x = centerX + (column ? 1 : -1) * (kind === 'binary' ? settings.bitColumn : settings.hexColumn);
      if (kind === 'binary') {
        for (let row = 0; row < 4; row += 1) {
          textAt(context, text[column * 4 + row], x, centerY + (row - 1.5) * settings.bitLine, settings.bitFont, Infinity, '0');
        }
      } else {
        textAt(context, text[column], x, centerY, settings.hexFont, Infinity, '0');
      }
    }
  }

  function points(view, kind, text, nibble) {
    raster.width = Math.ceil(view.canvasWidth * 2);
    raster.height = Math.ceil(settings.height * 2);
    mask.setTransform(2, 0, 0, 2, 0, 0);
    mask.fillStyle = '#000';
    drawText(mask, view, kind, text, nibble);
    const { data, width, height } = mask.getImageData(0, 0, raster.width, raster.height);
    const result = [];
    // Sample a dense one-pixel mesh, keeping glyphs solid during the morph.
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        if (data[(y * width + x) * 4 + 3] > 96) {
          result.push({ x: x / 2 - view.canvasWidth / 2, y: y / 2 - settings.height / 2 });
        }
      }
    }
    return result;
  }

  function build(view, state) {
    const binary = state.encryptedByte.toString(2).padStart(8, '0');
    const hex = state.encryptedByte.toString(16).padStart(2, '0').toUpperCase();
    const target = points(view, 'glyph', state.encryptedCharacter);
    view.morphs = [0, 1].map(nibble => {
      const digit = points(view, 'hex', hex, nibble);
      const half = target.filter(point => nibble ? point.x >= 0 : point.x < 0);
      return {
        binaryToHex: pairPoints(points(view, 'binary', binary, nibble), [...digit], 'vertical'),
        hexToCipher: pairPoints(digit, half, 'horizontal'),
      };
    });
    view.blank = !state.encryptedCharacter.trim();
  }

  function morph(context, view, name, progress) {
    const amount = ease(progress);
    const curve = Math.sin(Math.PI * amount);
    const size = name === 'hexToCipher' && view.blank ? 1.15 * (1 - amount) : 1.15;
    context.beginPath();
    for (const [nibble, pairs] of view.morphs.entries()) {
      for (const { from, to } of pairs[name]) {
        const bend = name === 'binaryToHex' ? (nibble ? 1 : -1) * (from.y - to.y) * .12 * curve : 0;
        const x = view.canvasWidth / 2 + mix(from.x, to.x, amount) + bend;
        const y = settings.height / 2 + mix(from.y, to.y, amount);
        context.rect(x - size / 2, y - size / 2, size, size);
      }
    }
    context.fill();
  }

  function render(states) {
    lastStates = states;
    if (!settings) return;
    const style = getComputedStyle(phrase);
    const color = style.color;
    const accent = style.getPropertyValue('--h42-color-action-quiet').trim();
    for (const state of states) {
      const view = cells[state.index];
      if (!view.morphs) build(view, state);
      const context = view.canvas.getContext('2d');
      context.clearRect(0, 0, view.canvasWidth, settings.height);
      context.fillStyle = state.phase === 'decrypting' ? accent : color;
      if (state.binaryToHex > 0 && state.binaryToHex < 1) {
        morph(context, view, 'binaryToHex', state.binaryToHex);
      } else if (state.hexToCipher > 0 && state.hexToCipher < 1) {
        morph(context, view, 'hexToCipher', state.hexToCipher);
      } else if (state.binaryToHex === 0) {
        drawText(context, view, 'binary', state.encryptedByte.toString(2).padStart(8, '0'));
      } else if (state.hexToCipher === 0) {
        drawText(context, view, 'hex', state.encryptedByte.toString(16).padStart(2, '0').toUpperCase());
      } else {
        drawText(context, view, 'glyph', state.character);
      }
    }
  }

  function resize() {
    const style = getComputedStyle(phrase);
    const bitSize = parseFloat(style.getPropertyValue('--bit-size'));
    const hexSize = parseFloat(style.getPropertyValue('--hex-size'));
    settings = {
      height: parseFloat(style.lineHeight) + 12,
      font: `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
      bitFont: `500 ${bitSize}px monospace`,
      bitLine: parseFloat(style.getPropertyValue('--bit-line')),
      bitColumn: bitSize * .48,
      hexFont: `500 ${hexSize}px monospace`,
      hexColumn: hexSize * .3,
    };
    const ratio = Math.min(devicePixelRatio || 1, 2);
    for (const view of cells) {
      view.width = view.measure.getBoundingClientRect().width;
      view.canvasWidth = Math.max(view.width + 18, 40);
      view.canvas.width = Math.ceil(view.canvasWidth * ratio);
      view.canvas.height = Math.ceil(settings.height * ratio);
      view.canvas.style.width = `${view.canvasWidth}px`;
      view.canvas.style.height = `${settings.height}px`;
      view.canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
      view.morphs = null;
    }
    if (lastStates) render(lastStates);
  }

  return { render, resize, repaint: () => lastStates && render(lastStates) };
}
