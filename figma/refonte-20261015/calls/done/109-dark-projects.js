const page = await figma.getNodeByIdAsync('1:10');
await figma.setCurrentPageAsync(page);
const fams = ['Jost', 'Noto Sans Arabic', 'IBM Plex Mono'];
const avail = (await figma.listAvailableFontsAsync()).map(f => f.fontName).filter(f => fams.includes(f.family) && !/Condensed|Display|Italic/.test(f.style));
await Promise.all(avail.map(f => figma.loadFontAsync(f)));
const cc = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const dark = cc.modes.find(m => m.name === 'Sombre').modeId;
const J = [["35:664", "Choisir un campus — Ordinateur · Clair", "Choisir un campus — Ordinateur · Sombre", 1640, 260], ["35:664", "Choisir un campus — Mobile · Clair", "Choisir un campus — Mobile · Sombre", 3710, 260], ["35:667", "Signaler — Ordinateur · Clair", "Signaler — Ordinateur · Sombre", 1640, 260], ["35:667", "Signaler — Mobile · Clair", "Signaler — Mobile · Sombre", 3710, 260], ["35:670", "Visionneuse de médias — Ordinateur · Clair", "Visionneuse de médias — Ordinateur · Sombre", 1640, 260], ["35:670", "Visionneuse de médias — Mobile · Clair", "Visionneuse de médias — Mobile · Sombre", 3710, 260]];
const out = {}, missing = [];
for (const [sec, light, darkName, x, y] of J) {
  const s = await figma.getNodeByIdAsync(sec);
  const src = s && s.children.find(n => n.name === light);
  if (!src) { missing.push(light); continue; }
  for (const old of s.children.filter(n => n.name === darkName)) old.remove();
  const c = src.clone(); s.appendChild(c); c.name = darkName; c.x = x; c.y = y;
  c.setExplicitVariableModeForCollection(cc, dark);
  out[darkName] = c.id;
}
return { created: Object.keys(out).length, missing, ids: out };