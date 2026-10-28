const page = await figma.getNodeByIdAsync('1:11');
await figma.setCurrentPageAsync(page);
const fams = ['Jost', 'Noto Sans Arabic', 'IBM Plex Mono'];
const avail = (await figma.listAvailableFontsAsync()).map(f => f.fontName).filter(f => fams.includes(f.family) && !/Condensed|Display|Italic/.test(f.style));
await Promise.all(avail.map(f => figma.loadFontAsync(f)));
await figma.loadFontAsync({ family: 'Noto Sans', style: 'Regular' });   // 18 Oct.: U+202F of the texts is set in Noto Sans (render.js narrowSpaces)
const cc = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const dark = cc.modes.find(m => m.name === 'Sombre').modeId;
const J = [["50:16", "Projets — Ordinateur · Clair", "Projets — Ordinateur · Sombre", 1640, 260], ["50:16", "Projets — Mobile · Clair", "Projets — Mobile · Sombre", 3710, 260], ["50:16", "Projets — Ordinateur · Clair · English", "Projets — Ordinateur · Sombre · English", 1640, 1996], ["50:16", "Projets — Mobile · Clair · English", "Projets — Mobile · Sombre · English", 3710, 1996], ["50:19", "Parcours — Ordinateur · Clair", "Parcours — Ordinateur · Sombre", 1640, 260], ["50:19", "Parcours — Mobile · Clair", "Parcours — Mobile · Sombre", 3710, 260], ["50:19", "Parcours — Ordinateur · Clair · English", "Parcours — Ordinateur · Sombre · English", 1640, 2365], ["50:19", "Parcours — Mobile · Clair · English", "Parcours — Mobile · Sombre · English", 3710, 2365], ["50:22", "Contribution — Ordinateur · Clair", "Contribution — Ordinateur · Sombre", 1640, 260], ["50:22", "Contribution — Mobile · Clair", "Contribution — Mobile · Sombre", 3710, 260], ["50:22", "Contribution — Ordinateur · Clair · English", "Contribution — Ordinateur · Sombre · English", 1640, 1468], ["50:22", "Contribution — Mobile · Clair · English", "Contribution — Mobile · Sombre · English", 3710, 1468]];
const SWAP = {"3186ecb0c93bd2b326a71bbbe7972d95de48becf": "71bed0a0238fcb386810c5b2d7496f2a1e2a06d6", "ee7cd7215fa0a2571f542c296bbe0189b2efbd1d": "2adf30507da1818472236620b05cf1b7ef83265a", "59e840a2a7574d30298f4fde61e7a61822039f9a": "cf7885f8a28ae52af75087c9adec8415001dfce9", "74482b4503a1d373dbd06ff174cfa32b4f64f19c": "c35cbd5dca8dd309a25cebec44de4ff14f6b4c70", "856fbbba6d45fc15e3aa54f928475162cdbaef5c": "4d1802bd15441076846fa6356c78e22862c8351b"};   // image of the light theme → same image in the dark theme (street maps, 16 Oct.)
const out = {}, missing = [];
let swapped = 0;
for (const [sec, light, darkName, x, y] of J) {
  const s = await figma.getNodeByIdAsync(sec);
  const src = s && s.children.find(n => n.name === light);
  if (!src) { missing.push(light); continue; }
  for (const old of s.children.filter(n => n.name === darkName)) old.remove();
  const c = src.clone(); s.appendChild(c); c.name = darkName; c.x = x; c.y = y;
  c.setExplicitVariableModeForCollection(cc, dark);
  for (const k of c.findAll(n => 'fills' in n && Array.isArray(n.fills) && n.fills.some(p => p.type === 'IMAGE' && SWAP[p.imageHash]))) {
    k.fills = k.fills.map(p => p.type === 'IMAGE' && SWAP[p.imageHash] ? Object.assign({}, p, { imageHash: SWAP[p.imageHash] }) : p);
    swapped++;
  }
  out[darkName] = c.id;
}
return { created: Object.keys(out).length, missing, swapped, ids: out };