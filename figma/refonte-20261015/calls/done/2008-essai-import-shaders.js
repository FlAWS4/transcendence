// 42 Horizon — essai (23 oct. 2026) : shaders que l'API des greffons propose, et import de « Color adjust » (shader de Figma, déjà construit) pour la saturation du verre ; aucun calque n'est modifié
const list = await figma.listAvailableShaders();
const out = { available: list.map(s => ({ id: s.id, name: s.name, type: s.type, imported: s.imported })) };
for (const id of ['d22a8814-e106-4808-82c1-d1046f3c93ef/a30ea6d1409b7587bcbd16cf97a8ba380ba0ac37', 'd22a8814-e106-4808-82c1-d1046f3c93ef']) {
  try {
    const sh = await figma.importShaderById(id);
    out.imported = { tried: id, id: sh.id, name: sh.name, props: Object.fromEntries(Object.entries(sh.propertyDefinitions || {}).map(([k, d]) => [k, [d.name, d.type, d.defaultValue]])) };
    break;
  } catch (e) { (out.errors = out.errors || []).push([id, String((e && e.message) || e).slice(0, 200)]); }
}
return out;
