import { decode } from '../../archives/early-prototypes/decryption/horizon-decryption-engine.mjs';

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const ROOT_TWO = Math.SQRT2;
const TILE = 160;
const HALF = TILE / 2;

/**
 * One eased clock drives three representation changes. The diagonal fragments
 * keep travelling across their boundaries; only the complete gesture settles.
 * Decryption uses the actual bytes/key, without animating 42 separate stops.
 */
export function mount({ root, model }) {
  const encrypted = model.sample(0).map(state => state.encryptedByte);
  const plaintext = decode(encrypted, model.KEY);
  const glyphs = encrypted.map((byte, index) => [
    byte.toString(2).padStart(8, '0'),
    byte.toString(16).padStart(2, '0').toUpperCase(),
    String.fromCharCode(byte),
    plaintext[index],
  ]);
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  canvas.setAttribute('aria-hidden', 'true');
  root.append(canvas);
  const ctx = canvas.getContext('2d');
  const inkCanvas = document.createElement('canvas');
  inkCanvas.width = inkCanvas.height = TILE * 2;
  const measure = inkCanvas.getContext('2d');
  measure.font = '500 88px Jost, sans-serif';
  const capHeight = measure.measureText('H').actualBoundingBoxAscent;
  const widths = Array.from(plaintext, letter => letter === ' ' ? 36 : Math.max(42, measure.measureText(letter).width + 12));
  let cacheKey = '';
  let sprites = [];
  let elapsed = 0;
  let disposed = false;

  function cache(ink, accent, ratio) {
    const nextKey = `${ink}|${accent}|${ratio}`;
    if (cacheKey === nextKey) return;
    cacheKey = nextKey;
    function make(text, phase, color) {
      const tile = document.createElement('canvas');
      tile.width = tile.height = TILE * ratio;
      const brush = tile.getContext('2d');
      brush.scale(ratio, ratio);
      brush.translate(HALF, HALF);
      brush.fillStyle = color;
      brush.textAlign = 'center';
      if (phase === 0) {
        brush.font = '500 18px Jost, sans-serif';
        brush.textBaseline = 'middle';
        for (let bit = 0; bit < 8; bit++) {
          brush.fillText(text[bit], (Math.floor(bit / 4) - .5) * 16, (bit % 4 - 1.5) * 21);
        }
      } else if (phase === 1) {
        brush.font = '500 44px Jost, sans-serif';
        brush.textBaseline = 'alphabetic';
        const height = brush.measureText('H').actualBoundingBoxAscent;
        brush.fillText(text, 0, height / 2);
      } else {
        brush.font = '500 88px Jost, sans-serif';
        brush.textBaseline = 'alphabetic';
        brush.fillText(text, 0, capHeight / 2);
      }
      return tile;
    }
    // Cache glyph masks, not whole animation frames. No font rasterisation or
    // pixel readback occurs in the animation loop. Spaces remain word spacing.
    sprites = glyphs.map((forms, index) => plaintext[index] === ' ' ? null : forms.map((text, phase) => ({
      ink: make(text, phase, ink), accent: make(text, phase, accent),
    })));
  }

  // Coordinates u=(x+y)/sqrt(2), v=(x-y)/sqrt(2): each strip is parallel
  // to the rising diagonal. Its wipe travels along that same diagonal.
  function clipStrip(u0, u1, v0 = -180, v1 = 180) {
    const vertices = [[u0,v0],[u1,v0],[u1,v1],[u0,v1]];
    ctx.beginPath();
    vertices.forEach(([u,v], index) => {
      const x = (u + v) / ROOT_TWO, y = (u - v) / ROOT_TWO;
      if (index === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.clip();
  }

  function drawSprite(sprite, displacement) {
    ctx.drawImage(sprite, -HALF + displacement / ROOT_TWO, -HALF - displacement / ROOT_TWO, TILE, TILE);
  }

  function render(ms) {
    if (disposed) return;
    elapsed = Math.max(0, Math.min(model.durationMs, ms));
    const width = root.clientWidth, height = root.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * ratio), pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth; canvas.height = pixelHeight;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const css = getComputedStyle(root);
    const ink = css.getPropertyValue('--h42-color-text').trim();
    const accent = css.getPropertyValue('--h42-color-accent').trim();
    cache(ink, accent, Math.ceil(ratio));

    const mobile = width < 700;
    const rows = mobile ? [[0,6],[7,plaintext.length]] : [[0,plaintext.length]];
    const rowWidths = rows.map(([start,end]) => widths.slice(start,end).reduce((sum,value) => sum + value, 0));
    const scale = Math.min(mobile ? .64 : 1.05, (width - (mobile ? 16 : 90)) / Math.max(...rowWidths), height / (rows.length * 230));
    const normalTime = elapsed / model.durationMs;
    // 0.34 of phase offset distributes each transformation across the phrase.
    // The same velocity passes through binary/hex/cipher boundaries. No local
    // easing or stop/restart is applied to individual letters or key rotations.
    const gesture = smooth(normalTime / .96);
    const travel = 3.34 * gesture;
    const separation = Math.sin(Math.PI * gesture) ** 2;
    const cuts = [-180, -14, 14, 180];
    let completed = 0;
    let minimumPhase = 3;
    rows.forEach(([start,end], row) => {
      let cursor = (width - rowWidths[row] * scale) / 2;
      const baseline = height / 2 + (row - (rows.length - 1) / 2) * 165 * scale;
      for (let index = start; index < end; index++) {
        const x = cursor + widths[index] * scale / 2;
        cursor += widths[index] * scale;
        if (!sprites[index]) continue;
        const at = clamp((travel - .34 * index / Math.max(1, plaintext.length - 1)) / 3) * 3;
        const phase = Math.min(3, Math.floor(at));
        const p = at - phase;
        minimumPhase = Math.min(minimumPhase, phase);
        if (phase === 3) completed++;
        ctx.save(); ctx.translate(x,baseline); ctx.scale(scale,scale);
        // The resting states use one intact mask, avoiding antialiased seams
        // where complementary strips meet on a stationary letter.
        if (elapsed === 0 || gesture === 1) {
          drawSprite(sprites[index][gesture === 1 ? 3 : 0].ink, 0);
          ctx.restore();
          continue;
        }
        for (let strip = 0; strip < 3; strip++) {
          // One opening/closing gesture spans all three conversions. The bits
          // start intact, the slices separate, then reunite only at the end.
          const drift = (strip - 1) * 10 * separation;
          ctx.save(); clipStrip(cuts[strip],cuts[strip+1]);
          if (phase === 3) {
            drawSprite(sprites[index][3].ink, drift);
          } else {
            // Front starts/ends outside every glyph, including the moving
            // fragments. Complementary clips avoid opacity crossfades.
            const front = -66 + 132 * p;
            const lead = 8;
            const incomingSlide = lead * (phase === 2 ? (1 - p) ** 2 : 1 - p);
            const outgoingSlide = -lead * p;
            ctx.save(); clipStrip(-180,180,front,180);
            drawSprite(sprites[index][phase].ink, drift + outgoingSlide);
            ctx.restore();
            ctx.save(); clipStrip(-180,180,-180,front);
            drawSprite(sprites[index][phase+1].ink, drift + incomingSlide);
            ctx.restore();
            // A thin turquoise edge is confined to the incoming ink itself.
            ctx.save(); clipStrip(-180,180,front-1.3,front);
            drawSprite(sprites[index][phase+1].accent, drift + incomingSlide);
            ctx.restore();
          }
          ctx.restore();
        }
        ctx.restore();
      }
    });
    const final = completed === sprites.filter(Boolean).length;
    root.dataset.phase = final ? 'letter' : ['binary-to-hex','hex-to-cipher','decrypting'][minimumPhase];
    root.dataset.renderedText = final ? plaintext : '';
    root.dataset.diagonalTravel = travel.toFixed(5);
    root.dataset.diagonalSettled = String(gesture === 1);
  }

  const observer = new ResizeObserver(() => render(elapsed));
  observer.observe(root);
  render(0);
  return {
    render,
    destroy() {
      disposed = true;
      observer.disconnect();
      sprites = [];
      canvas.remove();
      for (const name of ['phase','renderedText','diagonalTravel','diagonalSettled']) delete root.dataset[name];
    },
  };
}
