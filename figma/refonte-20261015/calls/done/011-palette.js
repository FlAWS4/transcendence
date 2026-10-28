const col = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const light = col.modes.find(m => m.name === 'Clair').modeId, dark = col.modes.find(m => m.name === 'Sombre').modeId;
const have = new Set((await figma.variables.getLocalVariablesAsync('COLOR')).map(v => v.name));
const hex = h => { const n = h.replace('#', ''); return { r: parseInt(n.slice(0, 2), 16) / 255, g: parseInt(n.slice(2, 4), 16) / 255, b: parseInt(n.slice(4, 6), 16) / 255, a: n.length > 6 ? parseInt(n.slice(6, 8), 16) / 255 : 1 }; };
const ROWS = [["dérivées/dégradé/00BABC00-ED349100","#00BABC00","#ED349100","dégradé"],["dérivées/dégradé/EC339100-00BABC00","#EC339100","#00BABC00","dégradé"],["dérivées/dégradé/F7FAFA00-1B1B1B00","#F7FAFA00","#1B1B1B00","dégradé"],["dérivées/dégradé/FFFFFF-00BABC00","#FFFFFF","#00BABC00","dégradé"],["dérivées/dégradé/F7FAFA-00BABC00","#F7FAFA","#00BABC00","dégradé"],["dérivées/dégradé/F4F8F8-00BABC00","#F4F8F8","#00BABC00","dégradé"],["dérivées/icône/2563EB-2563EB","#2563EB","#2563EB","icône"],["dérivées/texte/2563EB-2563EB","#2563EB","#2563EB","texte"],["dérivées/ombre/00000011-00000011","#00000011","#00000011","ombre"]];
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