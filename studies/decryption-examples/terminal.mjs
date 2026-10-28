export function mount({ root, model }) {
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = new URL('./terminal.css', import.meta.url).href;
  document.head.append(link);
  const frame = document.createElement('div');
  frame.className = 'terminal-window'; frame.setAttribute('aria-hidden', 'true');
  const prompt = document.createElement('span'); prompt.className = 'terminal-prompt'; prompt.textContent = '›';
  const phrase = document.createElement('div'); phrase.className = 'terminal-phrase';
  const groups = [0, 1].map(() => { const node = document.createElement('div'); node.className = 'terminal-group'; phrase.append(node); return node; });
  const cells = [...model.PHRASE].map((character, index) => {
    const cell = document.createElement('span');
    cell.className = `terminal-cell${index === 6 ? ' terminal-separator' : ''}`;
    const measure = document.createElement('span'); measure.className = 'terminal-measure'; measure.textContent = character === ' ' ? '\u00a0' : character;
    const ink = document.createElement('span'); ink.className = 'terminal-ink';
    cell.append(measure, ink); groups[index <= 6 ? 0 : 1].append(cell);
    return { cell, ink, width: 0 };
  });
  frame.append(prompt, phrase); root.append(frame);
  const initial = model.sample(0);
  const measure = document.createElement('canvas').getContext('2d');
  const words = [{ start: 3500, duration: 1000, indexes: [0, 1, 2, 3, 4, 5] }, { start: 4600, duration: 850, indexes: [7, 8, 9] }, { start: 5500, duration: 1150, indexes: [11, 12, 13, 14] }];
  const binary = byte => { const bits = byte.toString(2).padStart(8, '0'); return `${bits.slice(0, 4)}\n${bits.slice(4)}`; };
  let lastTime = 0;

  function render(ms) {
    lastTime = Math.max(0, Math.min(model.durationMs, ms));
    let renderedText = '';
    for (const state of initial) {
      const index = state.index;
      const hexAt = 600 + index * 72;
      const glyphAt = 2050 + index * 72;
      const view = cells[index];
      let type = 'binary';
      let text = binary(state.encryptedByte);
      let active = false;
      let reveal = 1;
      if (lastTime >= hexAt) {
        type = 'hex'; text = state.hex;
        active = lastTime < hexAt + 72;
        reveal = Math.min(1, (lastTime - hexAt) / 55);
      }
      if (lastTime >= glyphAt) {
        type = 'glyph'; text = state.encryptedCharacter;
        active = lastTime < glyphAt + 72;
        reveal = Math.min(1, (lastTime - glyphAt) / 55);
      }
      const word = words.find(item => item.indexes.includes(index));
      if (word && lastTime >= word.start) {
        const progress = Math.min(1, (lastTime - word.start) / word.duration);
        const steps = Math.min(model.KEY, Math.floor(progress * model.KEY));
        const position = model.ALPHABET.indexOf(state.encryptedCharacter);
        text = model.ALPHABET[(position - steps + model.ALPHABET.length) % model.ALPHABET.length];
        active = progress < 1;
        reveal = 1;
      }
      view.cell.dataset.type = type;
      view.cell.classList.toggle('is-active', active);
      view.ink.textContent = text === ' ' ? '\u00a0' : text;
      const inkWidth = type === 'glyph' ? measure.measureText(text).width : 0;
      view.ink.style.transform = `scaleX(${inkWidth && view.width ? Math.min(1, view.width / inkWidth) : 1})`;
      view.ink.style.clipPath = `inset(0 ${(1 - reveal) * 100}% 0 0)`;
      renderedText += text;
    }
    const done = lastTime >= 6650;
    frame.dataset.done = String(done);
    prompt.style.visibility = done ? 'hidden' : 'visible';
    root.dataset.phase = done ? 'letter' : lastTime >= 3500 ? 'decrypting' : lastTime >= 2050 ? 'cipher' : lastTime >= 600 ? 'hex' : 'binary';
    root.dataset.renderedText = done ? model.PHRASE : renderedText;
  }
  function resize() {
    const style = getComputedStyle(phrase);
    measure.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    cells.forEach(view => { view.width = view.cell.getBoundingClientRect().width; });
    render(lastTime);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(phrase);
  link.addEventListener('load', resize);
  render(0);
  return { render, destroy() { observer.disconnect(); link.removeEventListener('load', resize); frame.remove(); link.remove(); } };
}
