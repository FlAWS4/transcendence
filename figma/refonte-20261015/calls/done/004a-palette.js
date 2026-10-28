const col = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const light = col.modes.find(m => m.name === 'Clair').modeId, dark = col.modes.find(m => m.name === 'Sombre').modeId;
const have = new Set((await figma.variables.getLocalVariablesAsync('COLOR')).map(v => v.name));
const hex = h => { const n = h.replace('#', ''); return { r: parseInt(n.slice(0, 2), 16) / 255, g: parseInt(n.slice(2, 4), 16) / 255, b: parseInt(n.slice(4, 6), 16) / 255, a: n.length > 6 ? parseInt(n.slice(6, 8), 16) / 255 : 1 }; };
const ROWS = [["dérivées/dégradé/00000000-00000000","#00000000","#00000000","dégradé"],["dérivées/dégradé/F7FAFAD1-1B1B1BD1","#F7FAFAD1","#1B1B1BD1","dégradé"],["dérivées/dégradé/FFFFFF-00000000","#FFFFFF","#00000000","dégradé"],["dérivées/dégradé/00BABC12-ED349112","#00BABC12","#ED349112","dégradé"],["dérivées/dégradé/EC33910B-00BABC14","#EC33910B","#00BABC14","dégradé"],["dérivées/dégradé/F7FAFA-00000000","#F7FAFA","#00000000","dégradé"],["dérivées/dégradé/00BABC14-ED349114","#00BABC14","#ED349114","dégradé"],["dérivées/dégradé/EC33910D-00BABC17","#EC33910D","#00BABC17","dégradé"],["dérivées/dégradé/F4F8F8-00000000","#F4F8F8","#00000000","dégradé"],["dérivées/bordure/1B1B1B-00BABC","#1B1B1B","#00BABC","bordure"],["dérivées/texte/1B1B1B-00BABC","#1B1B1B","#00BABC","texte"],["dérivées/fond/1B1B1B-00BABC","#1B1B1B","#00BABC","fond"],["dérivées/ombre/FFFFFF14-FFFFFF14","#FFFFFF14","#FFFFFF14","ombre"],["dérivées/ombre/183D3C06-00000022","#183D3C06","#00000022","ombre"]];
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