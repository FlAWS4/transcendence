import fs from 'fs';
let NEXT = 1;
class N {
  constructor(name, type = 'FRAME', x = 0, y = 0, w = 100, h = 100) { Object.assign(this, { name, type, x, y, width: w, height: h, children: [], parent: null, id: 'n' + NEXT++, numberOfFixedChildren: 0, layoutMode: 'NONE', overflowDirection: 'NONE', reactions: [] }); }
  get absoluteTransform() { let x = 0, y = 0; for (let n = this; n && n.type !== 'PAGE'; n = n.parent) { x += n.x; y += n.y; } return [[1, 0, x], [0, 1, y]]; }
  appendChild(c) { if (c.parent) c.parent.children.splice(c.parent.children.indexOf(c), 1); c.parent = this; this.children.push(c); }
  insertChild(i, c) { if (c.parent) c.parent.children.splice(c.parent.children.indexOf(c), 1); c.parent = this; this.children.splice(i, 0, c); }
  remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; }
  resize(w, h) { this.width = w; this.height = h; }
  async setReactionsAsync(r) { if (CUT && --CUT === 0) throw new Error('coupure'); this.reactions = r; }
}
let CUT = 0;
const code = fs.readFileSync(process.argv[2], 'utf8');
const dest = new N('page', 'PAGE'); dest.id = 'DEST';
// F1: page that scrolls, converted: Application + 3 fixed layers
const F1 = new N('F1', 'FRAME', 0, 0, 1440, 960); F1.id = 'F1'; dest.appendChild(F1);
F1.appendChild(new N('Application')); for (const n of ['Globe', 'En-tête', 'Menu du bas']) F1.appendChild(new N(n)); F1.numberOfFixedChildren = 3;
// F2: screen-high, with a panel inside Application
const F2 = new N('F2', 'FRAME', 2000, 0, 390, 844); F2.id = 'F2'; dest.appendChild(F2);
const app = new N('Application'); F2.appendChild(app); const pan = new N('Panneau', 'FRAME', 24, 502, 342, 196); app.appendChild(pan); pan.appendChild(new N('Option 1')); pan.appendChild(new N('Option cachée'));
const nodes = { DEST: dest, F1, F2 };
const figma = { getNodeByIdAsync: async id => nodes[id] || null, setCurrentPageAsync: async () => {}, createFrame: () => { const f = new N('Frame'); dest.appendChild(f); return f; },
  variables: { getVariableCollectionByIdAsync: async () => ({ id: 'COL', modes: [{ name: 'Clair', modeId: '1' }, { name: 'Sombre', modeId: '2' }] }) } };
const run = async () => (new Function('figma', 'return (async () => {' + code + '})()'))(figma);
const show = () => ({ F1: F1.children.map(n => n.name).join(' | ') + ' ; fixes ' + F1.numberOfFixedChildren, F2: F2.children.map(n => n.name).join(' | '), panneau: pan.children.map(n => n.name + '@' + n.x + ',' + n.y).join(' | ') + ' ; défile ' + pan.overflowDirection, page: dest.children.length });
console.log('1', JSON.stringify(await run()), JSON.stringify(show()));
const ref = JSON.stringify(show());
CUT = 3; try { await run(); } catch (e) { console.log('2 coupée :', e.message, JSON.stringify(show())); }
CUT = 0; console.log('3', JSON.stringify(await run()), JSON.stringify(show()));
console.log('identique après reprise :', JSON.stringify(show()) === ref);
