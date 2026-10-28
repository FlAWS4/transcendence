const page = await figma.getNodeByIdAsync('1:9');
await figma.setCurrentPageAsync(page);
const fams = ['Jost', 'Noto Sans Arabic', 'IBM Plex Mono'];
const avail = (await figma.listAvailableFontsAsync()).map(f => f.fontName).filter(f => fams.includes(f.family) && !/Condensed|Display|Italic/.test(f.style));
await Promise.all(avail.map(f => figma.loadFontAsync(f)));
const cc = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const dark = cc.modes.find(m => m.name === 'Sombre').modeId;
const J = [["34:16", "Fiche campus — Ordinateur · Clair", "Fiche campus — Ordinateur · Sombre", 1640, 260], ["34:16", "Fiche campus — Mobile · Clair", "Fiche campus — Mobile · Sombre", 3710, 260], ["34:16", "Fiche campus · déployée — Mobile · Clair", "Fiche campus · déployée — Mobile · Sombre", 590, 1380], ["34:16", "Fiche campus · 42 Mulhouse — Ordinateur · Clair", "Fiche campus · 42 Mulhouse — Ordinateur · Sombre", 1640, 2384], ["34:22", "« Une nouvelle façon d’explorer » — Ordinateur · Clair", "« Une nouvelle façon d’explorer » — Ordinateur · Sombre", 1640, 260], ["34:22", "« Une nouvelle façon d’explorer » — Mobile · Clair", "« Une nouvelle façon d’explorer » — Mobile · Sombre", 3710, 260], ["34:28", "Fenêtre « Autour du campus » — Ordinateur · Clair", "Fenêtre « Autour du campus » — Ordinateur · Sombre", 1640, 260], ["34:28", "Fenêtre « Autour du campus » — Mobile · Clair", "Fenêtre « Autour du campus » — Mobile · Sombre", 3710, 260]];
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