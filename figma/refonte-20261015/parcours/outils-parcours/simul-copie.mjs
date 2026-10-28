// mock of the few Figma calls used by the copy call: relative x/y kept on appendChild, absoluteTransform from the chain
import fs from 'fs';
let NEXT = 1;
class N {
  constructor(name, type = 'FRAME', x = 0, y = 0, w = 100, h = 100) { Object.assign(this, { name, type, x, y, width: w, height: h, children: [], parent: null, id: 'n' + NEXT++, overflowDirection: 'NONE', numberOfFixedChildren: 0, clipsContent: false }); }
  get absoluteTransform() { let x = 0, y = 0; for (let n = this; n; n = n.parent) { x += n.x; y += n.y; } return [[1, 0, x], [0, 1, y]]; }
  appendChild(c) { if (c.parent) c.parent.children.splice(c.parent.children.indexOf(c), 1); c.parent = this; this.children.push(c); }
  remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; }
  resizeWithoutConstraints(w, h) { this.width = w; this.height = h; }
  clearExplicitVariableModeForCollection() {}
  clone() { const c = new N(this.name, this.type, this.x, this.y, this.width, this.height); for (const k of this.children) c.appendChild(k.clone()); return c; }
  async loadAsync() { LOADS++; }
}
let LOADS = 0;
const code = fs.readFileSync(process.argv[2], 'utf8').replace(/^\(async \(\) => \{\n/, '').replace(/\n\}\)\(\);\n$/, '');
const J = JSON.parse(/^const J = (.*);$/m.exec(code)[1]);
const j = J[0];
// source frame: Application > Contenu > #project-detail > (.cp-project-sidebar, Back to projects), plus the other fixed layers
function source() {
  const f = new N(j.name, 'FRAME', 0, 0, 1440, 4000);
  const app = new N('Application'); f.appendChild(app);
  const byPath = {};
  for (const fx of j.fixed) {
    let cur = app;
    for (let i = 1; i < fx.path.length - 1; i++) { let k = cur.children.find(n => n.name === fx.path[i]); if (!k) { k = new N(fx.path[i]); cur.appendChild(k); } cur = k; }
    const ab = cur.absoluteTransform; const leaf = new N(fx.path.at(-1), 'FRAME', fx.x - ab[0][2] + f.absoluteTransform[0][2], fx.y - ab[1][2], fx.w, fx.h); cur.appendChild(leaf);
  }
  return f;
}
async function run(sec, src) {
  const nodes = { [j.section]: sec, [j.src]: src, 'DEST': DEST, 'SRC': SRCP };
  const figma = { getNodeByIdAsync: async id => nodes[id] || null, setCurrentPageAsync: async () => {}, variables: { getVariableCollectionByIdAsync: async () => ({}) } };
  const body = code.replace(/'760:7'/, "'DEST'").replace(/'1:10'/, "'SRC'");
  return await (new Function('figma', 'return (async () => {' + body + '})()'))(figma);
}
const DEST = new N('dest', 'PAGE'), SRCP = new N('src', 'PAGE'); DEST.id = 'DEST'; SRCP.id = 'SRC';
const report = (sec, out) => { const c = sec.children.find(n => n.name === j.name); return { kept: out.kept, loads: LOADS, copies: sec.children.filter(n => n.name === j.name).length, h: c.height, nf: c.numberOfFixedChildren, top: c.children.map(n => n.name + '@' + Math.round(n.x) + ',' + Math.round(n.y)), notFound: out.notFound }; };
// 1. fresh
let sec = new N('section', 'SECTION'); sec.id = j.section;
let src = source(); SRCP.appendChild(src);
let out = await run(sec, src); const fresh = report(sec, out); console.log('1 neuve', JSON.stringify(fresh));
// 2. kept, converted
LOADS = 0; out = await run(sec, src); const again = report(sec, out); console.log('2 gardée', JSON.stringify(again));
// 3. cut after two moves, the second before its position was set
LOADS = 0; sec = new N('section', 'SECTION'); sec.id = j.section;
let c = src.clone(); sec.appendChild(c); c.name = j.name;
const T0 = c.absoluteTransform;
function loc(path) { let cur = c; for (const p of path) cur = cur.children.find(n => n.name === p); return cur; }
let n0 = loc(j.fixed[0].path), t = n0.absoluteTransform; c.appendChild(n0); n0.x = t[0][2] - T0[0][2]; n0.y = t[1][2] - T0[1][2] + j.fixed[0].dy;
let n1 = loc(j.fixed[1].path); c.appendChild(n1);   // stopped here
out = await run(sec, src); const cut = report(sec, out); console.log('3 coupée', JSON.stringify(cut));
console.log('identique à la neuve :', JSON.stringify(cut.top) === JSON.stringify(fresh.top) && cut.nf === fresh.nf && cut.h === fresh.h, '| gardée identique :', JSON.stringify(again.top) === JSON.stringify(fresh.top) && again.loads === 0);
