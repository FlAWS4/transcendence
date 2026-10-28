import { transitionAt } from './shared.mjs';
import { ease, loadCss, wordGroups, textRenderer } from './spatial-utils.mjs';

export function mount({ root, model }) {
  const css = loadCss('./prisms.css', import.meta.url);
  const scene = document.createElement('div');
  scene.className = 'horizon-prisms';
  scene.setAttribute('aria-hidden', 'true');
  const bank = document.createElement('div');
  bank.className = 'prisms-bank';
  const groups = wordGroups(bank, 'prisms-word-group');
  scene.append(bank);
  root.append(scene);
  const text = textRenderer(bank);
  const cells = Array.from(model.PHRASE, (character, index) => {
    const cell = document.createElement('div');
    cell.className = `prism-cell${character === ' ' ? ' space' : ''}${index === 6 ? ' line-space' : ''}`;
    const shadow = document.createElement('div');
    shadow.className = 'prism-shadow';
    const body = document.createElement('div');
    body.className = 'prism-body';
    const front = text.create();
    front.node.classList.add('prism-face', 'front');
    const side = text.create();
    side.node.classList.add('prism-face', 'side');
    body.append(front.node, side.node);
    cell.append(shadow, body);
    groups[index <= 6 ? 0 : 1].append(cell);
    return { cell, body, front, side, shadow };
  });
  let lastMs = 0;
  let destroyed = false;
  function render(ms) {
    if (destroyed) return;
    lastMs = Math.max(0, Math.min(model.durationMs, ms));
    const states = model.sample(lastMs);
    for (const [index, cell] of cells.entries()) {
      const transition = transitionAt(lastMs, index);
      const same = transition.from.type === transition.to.type && transition.from.text === transition.to.text;
      const progress = same ? 0 : ease(transition.progress);
      text.set(cell.front, transition.from);
      text.set(cell.side, transition.to);
      cell.body.style.transform = `translateZ(calc(var(--prism-depth) / -2)) rotateY(${-90 * progress}deg)`;
      cell.cell.dataset.phase = states[index].phase;
      cell.cell.dataset.rotation = (-90 * progress).toFixed(3);
      cell.shadow.style.transform = `scaleX(${1 + Math.sin(Math.PI * progress) * 0.35})`;
    }
  }
  function resize() { if (!destroyed) { text.resize(); render(lastMs); } }
  const observer = new ResizeObserver(resize);
  observer.observe(bank);
  css.addEventListener('load', resize);
  document.fonts.ready.then(resize);
  resize();
  return { render, destroy() { destroyed = true; observer.disconnect(); css.removeEventListener('load', resize); scene.remove(); } };
}
