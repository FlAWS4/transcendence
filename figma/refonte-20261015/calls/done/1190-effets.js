// 42 Horizon — variables de géométrie des ombres Clair / Sombre (refonte Figma, 18 oct. 2026)
const col = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const light = col.modes.find(m => m.name === 'Clair').modeId, dark = col.modes.find(m => m.name === 'Sombre').modeId;
const have = {}; for (const v of await figma.variables.getLocalVariablesAsync('FLOAT')) if (v.variableCollectionId === col.id) have[v.name] = v;
const ROWS = [["Effets/ombre-flou/12,24-17,68","radius",12.24,17.68,"Ombre portée : flou (px) en clair et en sombre, relevé dans le prototype pour le même élément (champ radius de l’effet)."],["Effets/ombre-flou/12,94-18,69","radius",12.94,18.69,"Ombre portée : flou (px) en clair et en sombre, relevé dans le prototype pour le même élément (champ radius de l’effet)."],["Effets/ombre-flou/18-26","radius",18.0,26.0,"Ombre portée : flou (px) en clair et en sombre, relevé dans le prototype pour le même élément (champ radius de l’effet)."],["Effets/ombre-flou/22-26","radius",22.0,26.0,"Ombre portée : flou (px) en clair et en sombre, relevé dans le prototype pour le même élément (champ radius de l’effet)."],["Effets/ombre-flou/64-48","radius",64.0,48.0,"Ombre portée : flou (px) en clair et en sombre, relevé dans le prototype pour le même élément (champ radius de l’effet)."],["Effets/ombre-y/22-16","offsetY",22.0,16.0,"Ombre portée : décalage vertical (px) en clair et en sombre, relevé dans le prototype pour le même élément (champ offsetY de l’effet)."],["Effets/ombre-y/3,4-5,44","offsetY",3.4,5.44,"Ombre portée : décalage vertical (px) en clair et en sombre, relevé dans le prototype pour le même élément (champ offsetY de l’effet)."],["Effets/ombre-y/3,59-5,75","offsetY",3.59,5.75,"Ombre portée : décalage vertical (px) en clair et en sombre, relevé dans le prototype pour le même élément (champ offsetY de l’effet)."],["Effets/ombre-y/5-8","offsetY",5.0,8.0,"Ombre portée : décalage vertical (px) en clair et en sombre, relevé dans le prototype pour le même élément (champ offsetY de l’effet)."],["Effets/ombre-y/9-12","offsetY",9.0,12.0,"Ombre portée : décalage vertical (px) en clair et en sombre, relevé dans le prototype pour le même élément (champ offsetY de l’effet)."]];
const made = [], kept = [], ids = {};
for (const [name, field, l, d, desc] of ROWS) {
  let v = have[name];
  if (!v) { v = figma.variables.createVariable(name, col, 'FLOAT'); made.push(name); } else kept.push(name);
  v.setValueForMode(light, l); v.setValueForMode(dark, d);
  v.scopes = ['EFFECT_FLOAT'];
  v.description = desc;
  ids[name] = v.id;
}
return { created: made.length, updated: kept.length, ids };