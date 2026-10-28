import { drawInk } from './graphic-stage.mjs';

// Extract connected outlines from the actual local font, then resample the
// closed contours. The renderer moves continuous paths, not a cloud of dots.
export function contourLibrary() {
  const cache = new Map();
  const mask = document.createElement('canvas'); mask.width = 100; mask.height = 140;
  const ctx = mask.getContext('2d', { willReadFrequently: true });

  function resample(loop, count = 96) {
    const lengths = [0];
    for (let i = 0; i < loop.length; i++) {
      const a = loop[i], b = loop[(i + 1) % loop.length];
      lengths.push(lengths.at(-1) + Math.hypot(b.x - a.x, b.y - a.y));
    }
    let edge = 0;
    return Array.from({length: count}, (_, i) => {
      const distance = lengths.at(-1) * i / count;
      while (edge < loop.length - 1 && lengths[edge + 1] < distance) edge++;
      const a = loop[edge], b = loop[(edge + 1) % loop.length];
      const t = (distance - lengths[edge]) / (lengths[edge + 1] - lengths[edge] || 1);
      return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t};
    });
  }

  function get(representation) {
    const key = `${representation.type}:${representation.text}`;
    if (cache.has(key)) return cache.get(key);
    ctx.clearRect(0, 0, 100, 140); ctx.fillStyle = '#000'; drawInk(ctx, representation);
    const data = ctx.getImageData(0, 0, 100, 140).data;
    const filled = (x, y) => x >= 0 && y >= 0 && x < 100 && y < 140 && data[(y * 100 + x) * 4 + 3] > 100;
    const edges = new Map();
    const add = (x1, y1, x2, y2) => {
      const key = `${x1},${y1}`;
      if (!edges.has(key)) edges.set(key, []);
      edges.get(key).push({x:x2, y:y2});
    };
    for (let y = 0; y < 140; y++) for (let x = 0; x < 100; x++) {
      if (!filled(x, y)) continue;
      if (!filled(x, y - 1)) add(x, y, x + 1, y);
      if (!filled(x + 1, y)) add(x + 1, y, x + 1, y + 1);
      if (!filled(x, y + 1)) add(x + 1, y + 1, x, y + 1);
      if (!filled(x - 1, y)) add(x, y + 1, x, y);
    }
    const loops = [];
    while (edges.size) {
      const start = edges.keys().next().value;
      let current = start;
      const loop = [];
      do {
        const [x, y] = current.split(',').map(Number);
        loop.push({x,y});
        const available = edges.get(current);
        if (!available?.length) break;
        const next = available.pop();
        if (!available.length) edges.delete(current);
        current = `${next.x},${next.y}`;
      } while (current !== start && loop.length < 20000);
      if (loop.length > 8) loops.push(resample(loop));
    }
    const center = loop => loop.reduce((sum, point) => sum + point.y * 100 + point.x, 0) / loop.length;
    loops.sort((a,b) => center(a) - center(b));
    cache.set(key, loops);
    return loops;
  }
  return get;
}

export function contourPairs(source, target) {
  const count = Math.max(source.length, target.length);
  const dot = Array.from({length:96}, () => ({x:50,y:70}));
  return Array.from({length:count}, (_, i) => {
    const from = source[Math.floor(i * source.length / count)] || dot;
    let to = target[Math.floor(i * target.length / count)] || dot;
    const average = points => points.reduce((c,p) => ({x:c.x+p.x/points.length,y:c.y+p.y/points.length}), {x:0,y:0});
    const a = average(from), b = average(to);
    let best = 0, distance = Infinity;
    to.forEach((point, index) => {
      const candidate = Math.hypot(from[0].x-a.x-point.x+b.x, from[0].y-a.y-point.y+b.y);
      if (candidate < distance) { distance = candidate; best = index; }
    });
    to = to.map((_,index) => to[(index + best) % to.length]);
    return {from,to};
  });
}
