const col = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const light = col.modes.find(m => m.name === 'Clair').modeId, dark = col.modes.find(m => m.name === 'Sombre').modeId;
const have = new Set((await figma.variables.getLocalVariablesAsync('COLOR')).map(v => v.name));
const hex = h => { const n = h.replace('#', ''); return { r: parseInt(n.slice(0, 2), 16) / 255, g: parseInt(n.slice(2, 4), 16) / 255, b: parseInt(n.slice(4, 6), 16) / 255, a: 1 }; };
const made = [];
for (const [name, l, d, src] of [["Globe/océan","#D9EEEE","#25232B","globe-style.mjs palettes.*.waterWorld (fond de la sphère)"],["Globe/terres","#19B8B5","#256967","globe-style.mjs palettes.*.landWorld (terres, uniformes jusqu’au zoom 5)"],["Globe/frontières","#C4F3EF","#A5DBD2","globe-style.mjs palettes.*.border (frontières et côtes, opacité ≈ 0,73)"]]) {
  if (have.has(name)) continue;
  const v = figma.variables.createVariable(name, col, 'COLOR');
  v.setValueForMode(light, hex(l)); v.setValueForMode(dark, hex(d));
  v.description = 'Couleur du globe codée dans ' + src + ' — pas de propriété CSS.';
  v.scopes = ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR'];
  made.push(name);
}
return { created: made.length, names: made };