const page = await figma.getNodeByIdAsync('1:8');
await figma.setCurrentPageAsync(page);
const fams = ['Jost', 'Noto Sans Arabic', 'IBM Plex Mono'];
const avail = (await figma.listAvailableFontsAsync()).map(f => f.fontName).filter(f => fams.includes(f.family) && !/Condensed|Display|Italic/.test(f.style));
await Promise.all(avail.map(f => figma.loadFontAsync(f)));
const cc = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const dark = cc.modes.find(m => m.name === 'Sombre').modeId;
const J = [["19:20", "Le cercle devient le globe · à mi-parcours — Ordinateur · Clair", "Le cercle devient le globe · à mi-parcours — Ordinateur · Sombre", 1640, 260], ["19:20", "Le cercle devient le globe · à mi-parcours — Mobile · Clair", "Le cercle devient le globe · à mi-parcours — Mobile · Sombre", 3710, 260], ["19:20", "Le cercle devient le globe · fin — Ordinateur · Clair", "Le cercle devient le globe · fin — Ordinateur · Sombre", 1640, 1380], ["19:20", "Le cercle devient le globe · fin — Mobile · Clair", "Le cercle devient le globe · fin — Mobile · Sombre", 3710, 1380]];
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