import { transitionAt } from './shared.mjs';

// The strip accelerates into each turn and brakes before the next character.
// This is evaluated from the supplied time, so seeking never needs a CSS timer.
const smootherStep = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

function stylesheet() {
  const href = new URL('./rollers.css', import.meta.url).href;
  let link = [...document.querySelectorAll('link[rel="stylesheet"]')].find(node => node.href === href);
  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.append(link);
  }
  return link;
}

function face() {
  const element = document.createElement('div');
  element.className = 'roller-face';
  return { element, key: '', type: '', text: '', glyph: null };
}

function setFace(view, representation) {
  const key = `${representation.type}:${representation.text}`;
  if (view.key === key) return;
  view.key = key;
  view.type = representation.type;
  view.text = representation.text;
  view.glyph = null;
  view.element.className = `roller-face roller-${representation.type}`;
  view.element.replaceChildren();

  if (representation.type === 'binary') {
    const pair = document.createElement('span');
    pair.className = 'roller-bit-pair';
    for (let column = 0; column < 2; column += 1) {
      const nibble = document.createElement('span');
      nibble.className = 'roller-bit-column';
      for (const bit of representation.text.slice(column * 4, column * 4 + 4)) {
        const digit = document.createElement('span');
        digit.textContent = bit;
        nibble.append(digit);
      }
      pair.append(nibble);
    }
    view.element.append(pair);
  } else {
    const glyph = document.createElement('span');
    glyph.className = 'roller-glyph-ink';
    glyph.textContent = representation.text === ' ' ? '\u00a0' : representation.text;
    view.element.append(glyph);
    view.glyph = glyph;
  }
}

export function mount({ root, model }) {
  const css = stylesheet();
  const container = document.createElement('div');
  container.className = 'horizon-rollers';
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', 'Animation à rouleaux — message chiffré');
  const bank = document.createElement('div');
  bank.className = 'rollers-bank';
  bank.setAttribute('aria-hidden', 'true');
  const first = document.createElement('div');
  first.className = 'rollers-group rollers-first';
  const second = document.createElement('div');
  second.className = 'rollers-group rollers-second';
  bank.append(first, second);
  container.append(bank);
  root.append(container);

  const cells = Array.from(model.PHRASE, (character, index) => {
    const reel = document.createElement('div');
    reel.className = `roller-reel${character === ' ' ? ' roller-space' : ''}${index === 6 ? ' roller-line-space' : ''}`;
    reel.dataset.index = index;
    const window = document.createElement('div');
    window.className = 'roller-window';
    const outgoing = face();
    const incoming = face();
    window.append(outgoing.element, incoming.element);
    reel.append(window);
    (index <= 6 ? first : second).append(reel);
    return { reel, window, outgoing, incoming, width: 0 };
  });

  const context = document.createElement('canvas').getContext('2d');
  const widths = new Map();
  let lastMs = 0;
  let destroyed = false;

  function fit(view, availableWidth) {
    if (!view.glyph || view.type !== 'glyph') return;
    let width = widths.get(view.text);
    if (width === undefined) {
      width = context.measureText(view.text).width;
      widths.set(view.text, width);
    }
    view.glyph.style.transform = `scaleX(${width > 0 && availableWidth > 0 ? Math.min(1, availableWidth / width) : 1})`;
  }

  function render(ms) {
    if (destroyed) return;
    lastMs = Math.max(0, Math.min(model.durationMs, ms));
    const states = model.sample(lastMs);
    for (const [index, cell] of cells.entries()) {
      const transition = transitionAt(lastMs, index);
      setFace(cell.outgoing, transition.from);
      setFace(cell.incoming, transition.to);
      fit(cell.outgoing, cell.width);
      fit(cell.incoming, cell.width);
      const same = transition.from.type === transition.to.type && transition.from.text === transition.to.text;
      const progress = same ? 0 : smootherStep(transition.progress);
      cell.outgoing.element.style.transform = `translateY(${-100 * progress}%)`;
      cell.incoming.element.style.transform = `translateY(${100 * (1 - progress)}%)`;
      cell.reel.dataset.phase = states[index].phase;
      cell.reel.dataset.rolling = String(!same && progress > 0 && progress < 1);
      cell.reel.dataset.progress = progress.toFixed(4);
    }
    const complete = states.every(state => state.phase === 'letter');
    container.dataset.complete = String(complete);
    container.setAttribute('aria-label', complete ? model.PHRASE : 'Animation à rouleaux — message chiffré');
  }

  function resize() {
    if (destroyed) return;
    const style = getComputedStyle(bank);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    widths.clear();
    cells.forEach(cell => { cell.width = Math.max(0, cell.window.getBoundingClientRect().width - 4); });
    render(lastMs);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(bank);
  css.addEventListener('load', resize);
  document.fonts.ready.then(resize);
  resize();

  return {
    render,
    destroy() {
      destroyed = true;
      observer.disconnect();
      css.removeEventListener('load', resize);
      container.remove();
    },
  };
}
