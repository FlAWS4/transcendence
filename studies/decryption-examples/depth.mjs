import { transitionAt } from './shared.mjs';
import { ease, loadCss, wordGroups, textRenderer } from './spatial-utils.mjs';

export function mount({ root, model }) {
  const css = loadCss('./depth.css', import.meta.url);
  const scene = document.createElement('div');
  scene.className = 'horizon-depth';
  scene.setAttribute('aria-hidden', 'true');
  const tunnel = document.createElement('div');
  tunnel.className = 'depth-tunnel';
  scene.append(tunnel);
  root.append(scene);
  const text = textRenderer(tunnel);
  const initial = model.sample(0);
  const planes = ['binary', 'hex', 'glyph'].map((type, level) => {
    const node = document.createElement('div');
    node.className = 'depth-plane';
    node.dataset.level = level;
    const words = document.createElement('div');
    words.className = 'depth-words';
    const groups = wordGroups(words, 'depth-word-group');
    const faces = initial.map(state => {
      const cell = document.createElement('div');
      cell.className = `depth-cell${state.encryptedCharacter === ' ' ? ' space' : ''}${state.index === 6 ? ' line-space' : ''}`;
      const face = text.create();
      cell.append(face.node);
      groups[state.index <= 6 ? 0 : 1].append(cell);
      text.set(face, { type, text: type === 'binary' ? state.encryptedByte.toString(2).padStart(8, '0') : type === 'hex' ? state.hex : state.encryptedCharacter });
      return { face, cell };
    });
    node.append(words);
    tunnel.append(node);
    return { node, faces };
  });
  let lastMs = 0;
  let destroyed = false;
  function render(ms) {
    if (destroyed) return;
    lastMs = Math.max(0, Math.min(model.durationMs, ms));
    const states = model.sample(lastMs);
    const center = states[Math.floor(states.length / 2)];
    const camera = ease(center.binaryToHex) + ease(center.hexToCipher);
    scene.dataset.camera = camera.toFixed(4);
    for (const [level, plane] of planes.entries()) {
      const relative = camera - level;
      const distance = relative * 360;
      // Passed planes enlarge beyond the frame; deeper planes retain a faint
      // outline and parallax until the camera actually reaches their surface.
      const opacity = relative > 0 ? 1 - ease(relative / 0.78) : Math.max(0.045, 1 + relative * 0.93);
      plane.node.style.transform = `translate(-50%, -50%) translateZ(${distance}px)`;
      plane.node.style.opacity = String(opacity);
      plane.node.style.visibility = relative > 0.8 ? 'hidden' : 'visible';
      plane.node.dataset.distance = distance.toFixed(2);
    }
    for (const state of states) {
      const { face, cell } = planes[2].faces[state.index];
      const transition = transitionAt(lastMs, state.index);
      const decrypting = state.phase === 'decrypting' || state.phase === 'letter';
      const current = decrypting ? (transition.progress < 0.5 ? transition.from.text : transition.to.text) : state.encryptedCharacter;
      text.set(face, { type: 'glyph', text: current });
      const pulse = decrypting && !transition.settled ? Math.sin(Math.PI * transition.progress) : 0;
      cell.style.transform = `translateZ(${pulse * 15}px)`;
      cell.dataset.phase = state.phase;
    }
  }
  function resize() { if (!destroyed) { text.resize(); render(lastMs); } }
  const observer = new ResizeObserver(resize);
  observer.observe(tunnel);
  css.addEventListener('load', resize);
  document.fonts.ready.then(resize);
  resize();
  return { render, destroy() { destroyed = true; observer.disconnect(); css.removeEventListener('load', resize); scene.remove(); } };
}
