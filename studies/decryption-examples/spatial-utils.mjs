// Private rendering helpers for the depth and prism comparisons.
export const ease = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function loadCss(file, base) {
  const href = new URL(file, base).href;
  let link = [...document.querySelectorAll('link[rel="stylesheet"]')].find(node => node.href === href);
  if (!link) {
    link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
    document.head.append(link);
  }
  return link;
}

export function wordGroups(parent, className) {
  const groups = [document.createElement('div'), document.createElement('div')];
  groups.forEach((group, index) => { group.className = `${className} ${index ? 'second' : 'first'}`; parent.append(group); });
  return groups;
}

export function textRenderer(bank) {
  const context = document.createElement('canvas').getContext('2d');
  const widths = new Map();
  const faces = [];
  function fit(face) {
    if (face.type !== 'glyph' || !face.ink) return;
    if (!widths.has(face.text)) widths.set(face.text, context.measureText(face.text).width);
    const width = widths.get(face.text);
    face.ink.style.transform = `scaleX(${width && face.width ? Math.min(1, face.width / width) : 1})`;
  }
  function create() {
    const node = document.createElement('div');
    node.className = 'spatial-text';
    const face = { node, key: '', type: '', text: '', width: 0, ink: null };
    faces.push(face);
    return face;
  }
  function set(face, { type, text }) {
    if (face.key === `${type}:${text}`) return;
    face.key = `${type}:${text}`;
    face.type = type;
    face.text = text;
    face.node.dataset.type = type;
    face.node.replaceChildren();
    face.ink = null;
    if (type === 'binary') {
      const pair = document.createElement('span');
      pair.className = 'spatial-bits';
      for (let column = 0; column < 2; column += 1) {
        const nibble = document.createElement('span');
        for (const bit of text.slice(column * 4, column * 4 + 4)) {
          const digit = document.createElement('span');
          digit.textContent = bit;
          nibble.append(digit);
        }
        pair.append(nibble);
      }
      face.node.append(pair);
    } else {
      face.ink = document.createElement('span');
      face.ink.className = 'spatial-ink';
      face.ink.textContent = text === ' ' ? '\u00a0' : text;
      face.node.append(face.ink);
      fit(face);
    }
  }
  function resize() {
    const style = getComputedStyle(bank);
    context.font = `${style.fontWeight} ${parseFloat(style.fontSize) * 0.9}px ${style.fontFamily}`;
    widths.clear();
    for (const face of faces) {
      face.width = Math.max(0, face.node.clientWidth - 4);
      fit(face);
    }
  }
  return { create, set, resize };
}
