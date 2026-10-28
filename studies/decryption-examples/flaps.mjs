import { transitionAt } from './shared.mjs';

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

function stylesheet() {
  const href = new URL('./flaps.css', import.meta.url).href;
  if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === href)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.append(link);
}

function half(position, moving = false) {
  const element = document.createElement('div');
  element.className = `flap-half flap-${position}${moving ? ' flap-moving' : ' flap-base'}`;
  const ink = document.createElement('div');
  ink.className = 'flap-ink';
  const shade = document.createElement('div');
  shade.className = 'flap-shade';
  element.append(ink, shade);
  return { element, ink, shade, key: '' };
}

function setFace(face, representation) {
  const key = `${representation.type}:${representation.text}`;
  if (face.key === key) return;
  face.key = key;
  face.ink.className = `flap-ink flap-${representation.type}`;
  face.ink.replaceChildren();
  if (representation.type === 'binary') {
    const bits = document.createElement('span');
    bits.className = 'flap-bits';
    for (let column = 0; column < 2; column += 1) {
      const quartet = document.createElement('span');
      quartet.className = 'flap-quartet';
      for (const bit of representation.text.slice(column * 4, column * 4 + 4)) {
        const digit = document.createElement('span');
        digit.textContent = bit;
        quartet.append(digit);
      }
      bits.append(quartet);
    }
    face.ink.append(bits);
  } else {
    const symbol = document.createElement('span');
    symbol.className = 'flap-symbol';
    symbol.textContent = representation.text === ' ' ? '\u00a0' : representation.text;
    face.ink.append(symbol);
  }
}

function makeCell(character, index) {
  const element = document.createElement('div');
  element.className = `flap-cell${character === ' ' ? ' flap-space' : ''}${index === 6 ? ' flap-line-space' : ''}`;
  element.dataset.index = String(index);
  const upper = half('upper');
  const lower = half('lower');
  const movingUpper = half('upper', true);
  const movingLower = half('lower', true);
  const hinge = document.createElement('span');
  hinge.className = 'flap-hinge';
  element.append(upper.element, lower.element, movingUpper.element, movingLower.element, hinge);
  return { element, upper, lower, movingUpper, movingLower };
}

export function mount({ root, model }) {
  stylesheet();
  const container = document.createElement('div');
  container.className = 'horizon-flaps';
  container.setAttribute('role', 'img');
  const board = document.createElement('div');
  board.className = 'flaps-board';
  board.setAttribute('aria-hidden', 'true');
  const first = document.createElement('div');
  const second = document.createElement('div');
  first.className = 'flaps-group flaps-first';
  second.className = 'flaps-group flaps-second';
  board.append(first, second);
  container.append(board);
  root.append(container);

  const cells = Array.from(model.PHRASE, (character, index) => {
    const cell = makeCell(character, index);
    (index <= 6 ? first : second).append(cell.element);
    return cell;
  });
  let destroyed = false;

  function render(ms) {
    if (destroyed) return;
    const time = Math.max(0, Math.min(model.durationMs, Number.isFinite(ms) ? ms : 0));
    const states = model.sample(time);
    cells.forEach((cell, index) => {
      const transition = transitionAt(time, index);
      const same = transition.from.type === transition.to.type && transition.from.text === transition.to.text;
      const progress = same ? 1 : clamp(transition.progress);
      const still = same || progress === 0 || progress === 1;
      const current = progress === 1 ? transition.to : transition.from;
      cell.element.dataset.phase = states[index].phase;
      cell.element.dataset.progress = progress.toFixed(4);
      cell.element.dataset.flipping = String(!still);

      // A stationary face is reconstructed from the same two half-panels.
      // While turning, the future upper half sits behind the falling old half;
      // the future lower half unfolds over the stationary old lower half.
      setFace(cell.upper, still ? current : transition.to);
      setFace(cell.lower, still ? current : transition.from);
      cell.movingUpper.element.hidden = still || progress >= 0.5;
      cell.movingLower.element.hidden = still || progress < 0.5;
      if (!still) {
        setFace(cell.movingUpper, transition.from);
        setFace(cell.movingLower, transition.to);
        const firstHalf = ease(progress * 2);
        const secondHalf = ease((progress - 0.5) * 2);
        cell.movingUpper.element.style.transform = `rotateX(${-90 * firstHalf}deg)`;
        cell.movingLower.element.style.transform = `rotateX(${90 * (1 - secondHalf)}deg)`;
        cell.movingUpper.shade.style.opacity = String(0.42 * firstHalf);
        cell.movingLower.shade.style.opacity = String(0.42 * (1 - secondHalf));
        cell.lower.shade.style.opacity = String(0.2 * Math.sin(progress * Math.PI));
      } else {
        cell.lower.shade.style.opacity = '0';
      }
    });
    const complete = states.every(state => state.phase === 'letter');
    container.dataset.complete = String(complete);
    container.setAttribute('aria-label', complete ? model.PHRASE : 'Animation à panneaux basculants — message chiffré');
  }

  render(0);
  return {
    render,
    destroy() {
      destroyed = true;
      container.remove();
    },
  };
}
