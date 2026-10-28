// Componentisation pass for the rebuilt screens (Figma rebuild of 15 October 2026).
// Body of an AsyncFunction(figma, X):
//   X.page       page holding the screens (one call per page)
//   X.lib        page receiving the main components (« Composants »)
//   X.patterns   [{ match: '^Menu du bas', component: 'Navigation/Menu du bas', label: 'active' | 'text' | null, within?: 'frame name regex' }]
// For each pattern: frames whose name matches are grouped by visual signature (structure, sizes, paints, effects;
// texts and nested instances excluded). Each group gets one main component (a clone of its first occurrence moved to
// the library page); groups of one pattern are combined as variants. Every occurrence is replaced in place by an
// instance with its own texts (and bound FR/EN/AR variables) and its own nested assets swapped in.
// Returns { patterns: [{ component, variants, replaced }], errors }.
const page = await figma.getNodeByIdAsync(X.page);
await figma.setCurrentPageAsync(page);
const lib = await figma.getNodeByIdAsync(X.lib);
const fams = ['Jost', 'Noto Sans Arabic', 'IBM Plex Mono'];
const avail = (await figma.listAvailableFontsAsync()).map(f => f.fontName).filter(f => fams.includes(f.family) && !/Condensed|Display/.test(f.style));
await Promise.all(avail.map(f => figma.loadFontAsync(f)));
const r1 = v => Math.round(v);
function paintSig(list) { return (list || []).map(p => p.type + ':' + (p.boundVariables && p.boundVariables.color ? p.boundVariables.color.id : (p.color ? [p.color.r, p.color.g, p.color.b].map(v => v.toFixed(2)).join(',') + '/' + (p.opacity ?? 1).toFixed(2) : ''))).join('|'); }
function sig(node, ox, oy) {
  const parts = [];
  (function walk(n, depth) {
    const base = [depth, n.type, r1(n.x - (depth ? 0 : n.x)), r1(n.y - (depth ? 0 : n.y)), r1(n.width), r1(n.height)];
    if (n.type === 'TEXT') { parts.push(base.concat(['T', paintSig(n.fills), n.textStyleId || '']).join(';')); return; }
    if (n.type === 'INSTANCE') { parts.push(base.concat(['I']).join(';')); return; }
    parts.push(base.concat([paintSig(n.fills), paintSig(n.strokes), (n.effects || []).map(e => e.type).join(','), String(n.cornerRadius), n.opacity]).join(';'));
    if ('children' in n) for (const c of n.children) walk(c, depth + 1);
  })(node, 0);
  return parts.join('\n');
}
function label(node, how, i) {
  if (how === 'active') {
    const act = node.findOne(n => n !== node && n.type === 'FRAME' && n.fills && n.fills.length && n.findOne(t => t.type === 'TEXT'));
    const t = act && act.findOne(t => t.type === 'TEXT');
    return t ? t.characters : 'Variante ' + (i + 1);
  }
  if (how === 'text') { const t = node.findOne(t => t.type === 'TEXT'); return t ? t.characters.slice(0, 40) : 'Variante ' + (i + 1); }
  return 'Variante ' + (i + 1);
}
function texts(n) { return n.findAllWithCriteria({ types: ['TEXT'] }); }
function insts(n) { return n.findAllWithCriteria({ types: ['INSTANCE'] }).filter(k => !k.parent || k.parent.type !== 'INSTANCE' || k === n); }
const report = [], errors = [];
let shelfY = 0; for (const c of lib.children) shelfY = Math.max(shelfY, c.y + c.height);
for (const pat of X.patterns) {
  const re = new RegExp(pat.match);
  const within = pat.within ? new RegExp(pat.within) : null;
  const occ = page.findAll(n => n.type === 'FRAME' && re.test(n.name))
    .filter(n => { let p = n.parent; while (p && p.type !== 'PAGE') { if (p.type === 'INSTANCE' || p.type === 'COMPONENT') return false; if (re.test(p.name) && p.type === 'FRAME') return false; p = p.parent; } return true; })
    .filter(n => !within || (n.parent && within.test(n.parent.name)) || (() => { let p = n.parent; while (p && p.type !== 'PAGE') { if (within.test(p.name)) return true; p = p.parent; } return false; })());
  if (!occ.length) { report.push({ component: pat.component, variants: 0, replaced: 0 }); continue; }
  const groups = new Map();
  for (const o of occ) { const s = sig(o); if (!groups.has(s)) groups.set(s, []); groups.get(s).push(o); }
  // too many visual variants (content-driven sizes): keep the frames, report it
  if (groups.size > (pat.maxVariants || 6)) { report.push({ component: pat.component, skipped: 'variants ' + groups.size + ' > ' + (pat.maxVariants || 6), occurrences: occ.length }); continue; }
  // reuse the library: an existing component (set) with this name keeps its variants; new looks become new variants
  let existing = lib.findOne(n => (n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && (!n.parent || n.parent.type !== 'COMPONENT_SET'))) && n.name === pat.component);
  const known = new Map();
  if (existing) for (const v of (existing.type === 'COMPONENT_SET' ? existing.children : [existing])) known.set(sig(v), v);
  let sec = existing ? existing.parent : null;
  if (!sec || sec.type !== 'SECTION') { sec = figma.createSection(); lib.appendChild(sec); sec.name = pat.component; sec.x = 0; sec.y = shelfY + 120; }
  const mains = [], fresh = [];
  let gi = existing ? (existing.type === 'COMPONENT_SET' ? existing.children.length : 1) : 0;
  let cx = 80;
  for (const [s, list] of groups) {
    if (known.has(s)) { mains.push({ main: known.get(s), list }); continue; }
    const first = list[0];
    const clone = first.clone(); sec.appendChild(clone); clone.x = cx; clone.y = 120;
    const main = figma.createComponentFromNode(clone);
    main.name = (pat.label ? 'État=' + label(first, pat.label, gi) : 'Variante=' + (gi + 1));
    cx += main.width + 80;
    mains.push({ main, list }); fresh.push(main);
    gi++;
  }
  let setNode = existing && existing.type === 'COMPONENT_SET' ? existing : null;
  const all = (existing ? [existing.type === 'COMPONENT_SET' ? null : existing] : []).filter(Boolean).concat(fresh);
  if (setNode && fresh.length) { for (const m of fresh) setNode.appendChild(m); }
  else if (!setNode && all.length > 1) {
    if (all[0] === existing && !/=/.test(existing.name)) existing.name = (pat.label ? 'État=' + label(existing, pat.label, 0) : 'Variante=1');
    setNode = figma.combineAsVariants(all, sec); setNode.name = pat.component;
  } else if (!setNode && all.length === 1 && all[0] !== existing) { all[0].name = pat.component; all[0].x = 80; all[0].y = 120; }
  if (setNode) {
    const seen = {};
    for (const c of setNode.children) { let nm = c.name; seen[nm] = (seen[nm] || 0) + 1; if (seen[nm] > 1) c.name = nm + ' ' + seen[nm]; }
    let x = 40; for (const c of setNode.children) { c.x = x; c.y = 40; x += c.width + 60; }
    let mw = 0, mh = 0; for (const c of setNode.children) { mw = Math.max(mw, c.x + c.width); mh = Math.max(mh, c.y + c.height); }
    setNode.resizeWithoutConstraints(mw + 40, mh + 40); setNode.x = 80; setNode.y = 120;
  }
  if (pat.description) (setNode || mains[0].main).description = pat.description;
  let replaced = 0;
  for (const { main, list } of mains) {
    for (const o of list) {
      try {
        const parent = o.parent, idx = parent.children.indexOf(o);
        const inst = main.createInstance();
        parent.insertChild(idx, inst);
        inst.x = o.x; inst.y = o.y;
        if (Math.abs(inst.width - o.width) > 0.5 || Math.abs(inst.height - o.height) > 0.5) inst.resize(o.width, o.height);
        const ot = texts(o), it = texts(inst);
        for (let i = 0; i < Math.min(ot.length, it.length); i++) {
          const b = ot[i].boundVariables && ot[i].boundVariables.characters;
          if (b) { const v = await figma.variables.getVariableByIdAsync(b.id); if (v) { it[i].setBoundVariable('characters', v); continue; } }
          if (it[i].characters !== ot[i].characters) it[i].characters = ot[i].characters;
        }
        const oi = insts(o), ii = insts(inst);
        for (let i = 0; i < Math.min(oi.length, ii.length); i++) {
          const om = await oi[i].getMainComponentAsync(), im = await ii[i].getMainComponentAsync();
          if (om && im && om.id !== im.id) ii[i].swapComponent(om);
        }
        inst.name = o.name;
        o.remove(); replaced++;
      } catch (e) { errors.push(pat.component + ': ' + e.message); }
    }
  }
  let w = 0, h = 0; for (const c of sec.children) { w = Math.max(w, c.x + c.width); h = Math.max(h, c.y + c.height); }
  sec.resizeWithoutConstraints(Math.max(800, w + 80), h + 80);
  shelfY = sec.y + sec.height;
  report.push({ component: pat.component, id: (setNode || mains[0].main).id, variants: mains.length, replaced });
}
return { patterns: report, errors };
