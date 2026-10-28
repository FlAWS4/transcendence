const col = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const light = col.modes.find(m => m.name === 'Clair').modeId, dark = col.modes.find(m => m.name === 'Sombre').modeId;
const have = new Set((await figma.variables.getLocalVariablesAsync('COLOR')).map(v => v.name));
const hex = h => { const n = h.replace('#', ''); return { r: parseInt(n.slice(0, 2), 16) / 255, g: parseInt(n.slice(2, 4), 16) / 255, b: parseInt(n.slice(4, 6), 16) / 255, a: n.length > 6 ? parseInt(n.slice(6, 8), 16) / 255 : 1 }; };
const ROWS = [["dérivées/bordure/AFBFBE-FFFFFF40","#AFBFBE","#FFFFFF40","bordure"],["dérivées/fond/00000000-1B1B1B","#00000000","#1B1B1B","fond"],["dérivées/bordure/FFFFFF-FFFFFF40","#FFFFFF","#FFFFFF40","bordure"],["dérivées/fond/FFFFFF-202026CC","#FFFFFF","#202026CC","fond"]];
const made = [];
for (const [name, l, d, kinds] of ROWS) {
  if (have.has(name)) continue;
  const v = figma.variables.createVariable(name, col, 'COLOR');
  v.setValueForMode(light, hex(l)); v.setValueForMode(dark, hex(d));
  v.description = 'Couleur peinte par le prototype sans propriété CSS dédiée (souvent un mélange color-mix ou une ombre), relevée en clair et en sombre. Usages : ' + kinds + '.';
  v.scopes = kinds === 'dégradé' ? ['FRAME_FILL', 'SHAPE_FILL'] : kinds.includes('ombre') && !kinds.includes('fond') ? ['EFFECT_COLOR'] : (kinds.includes('texte') ? ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'] : (kinds.includes('bordure') ? ['STROKE_COLOR'] : ['FRAME_FILL', 'SHAPE_FILL']));
  made.push(name);
}
return { created: made.length, names: made };