// Trial titres-marque, early part (runs before the baseline modules): the arrival slogan.
// The decryption canvas caches one 192 px Jost 500 sprite per character and colour, shared by
// cipher and clear letters. After a confirmed sign-in, settled clear letters are drawn in ink and
// the turning ones in the accent: only the ink sprites of clear letters drawn on the scene during
// the decryption and the slogan are replaced by a Jost 800 italic twin at the same glyph scale.
// The cipher kept on screen for a quarter second after the sign-in, the scan before it, the letter
// layout and the binary/hex sprites are untouched.
(() => {
 if (window.__essaiTitresMarque) return;
 window.__essaiTitresMarque = true;
 const proto = CanvasRenderingContext2D.prototype, { fillText, drawImage, clearRect } = proto;
 const SPRITE = /^500 192px Jost, sans-serif$/, HEAVY = 'italic 800 192px Jost, sans-serif';
 // Slanted heavy glyphs outgrow the upright sprite margins (Y by 7 px, T by 5 px at 192 px): twins get
 // a wider canvas, drawn over a proportionally wider rectangle so the glyph keeps its scale and centre.
 const PAD = 40;
 const PHASES = new Set(['decrypting', 'slogan', 'opening']);
 const sprites = new WeakMap(), twins = new Map(), drawn = new WeakMap(), probe = document.createElement('canvas').getContext('2d');
 let accent = { theme: null, value: null };
 const preload = () => document.fonts?.load(HEAVY, 'BEYOND THE CODE').then(faces => { if (faces.length) twins.clear(); }, () => {});
 preload();
 document.addEventListener('DOMContentLoaded', preload, { once: true });
 const onScene = context => context.canvas?.parentElement?.id === 'entrance-scene';
 function accentColour() {
  const theme = document.documentElement.dataset.theme;
  if (accent.theme !== theme) {
   const scene = document.getElementById('entrance-scene');
   probe.fillStyle = '#000';
   probe.fillStyle = (scene && getComputedStyle(scene).getPropertyValue('--h42-color-accent').trim()) || '#00babc';
   accent = { theme, value: probe.fillStyle };
  }
  return accent.value;
 }
 function twin(source, sprite) {
  const key = `${sprite.text}|${sprite.fill}|${source.width}x${source.height}|${sprite.x},${sprite.y}`;
  let canvas = twins.get(key);
  if (!canvas) {
   canvas = document.createElement('canvas');
   canvas.width = source.width + PAD * 2; canvas.height = source.height;
   const paint = canvas.getContext('2d');
   paint.font = HEAVY; paint.fillStyle = sprite.fill; paint.textAlign = sprite.align; paint.textBaseline = sprite.baseline;
   fillText.call(paint, sprite.text, sprite.x + PAD, sprite.y);
   twins.set(key, canvas);
  }
  return canvas;
 }
 proto.fillText = function (text, x, y, ...rest) {
  const canvas = this.canvas;
  if (canvas && !canvas.isConnected && SPRITE.test(this.font)) sprites.set(canvas, { text: String(text), x, y, fill: this.fillStyle, align: this.textAlign, baseline: this.textBaseline });
  return fillText.call(this, text, x, y, ...rest);
 };
 // Each frame clears the scene, then draws one sprite per letter in order (spaces skipped).
 proto.clearRect = function (...args) {
  if (onScene(this)) drawn.set(this, 0);
  return clearRect.apply(this, args);
 };
 proto.drawImage = function (image, ...rest) {
  const sprite = sprites.get(image);
  if (sprite && rest.length === 4 && onScene(this) && PHASES.has(document.body?.dataset.entry)) {
   const index = drawn.get(this) || 0;
   drawn.set(this, index + 1);
   // A sprite showing its cell's cipher letter is cipher text (no letter of the frozen phrase
   // equals its cipher letter), so only settled clear letters are replaced.
   const cipher = (this.canvas.parentElement.dataset.ciphertext || '').replace(/ /g, '');
   if (sprite.fill !== accentColour() && sprite.text !== cipher[index]) {
    const [x, y, width, height] = rest, scale = width / image.width;
    return drawImage.call(this, twin(image, sprite), x - PAD * scale, y, width + PAD * 2 * scale, height);
   }
  }
  return drawImage.call(this, image, ...rest);
 };
})();
