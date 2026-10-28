const page = await figma.getNodeByIdAsync('158:7');
await figma.setCurrentPageAsync(page);
await Promise.all([{family:'Jost',style:'Medium'},{family:'Jost',style:'Regular'}].map(f => figma.loadFontAsync(f)));
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const paint = n => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[n]);
const L = [{"id": "g-search", "name": "Recherche · g-search", "title": "Recherche", "desc": "Cherche dans tout Horizon : campus, projets, profils, chroniques, 8 résultats à la fois puis Voir plus. Masquée sur 42 Awards.\nÉcran du plan du site : g-search. Relevé du prototype actif (audit-fixes-146 + sélection du 15 octobre 2026). Le mode sombre est le mode « Sombre » de 42 · Couleurs ; chaque état relevé en anglais a sa rangée « English » (décision du 18 octobre), les textes étant liés aux variables FR/EN/AR de 42 · Textes.", "y": 0, "w": 4180, "h": 2420}, {"id": "g-dock", "name": "Menu du bas · g-dock", "title": "Menu du bas", "desc": "Présent sur chaque page, fiches et 42 Awards compris. Ouvre toujours la liste de la rubrique, page 1, en gardant le filtre Pays / Campus. Le bouton de la rubrique en cours ne fait rien, même depuis une fiche : on en sort par Retour.\nÉcran du plan du site : g-dock. Relevé du prototype actif (audit-fixes-146 + sélection du 15 octobre 2026). Le mode sombre est le mode « Sombre » de 42 · Couleurs ; chaque état relevé en anglais a sa rangée « English » (décision du 18 octobre), les textes étant liés aux variables FR/EN/AR de 42 · Textes.", "y": 2620, "w": 1600, "h": 3380}, {"id": "g-back-top", "name": "Remonter en haut · g-back-top", "title": "Remonter en haut", "desc": "Remonte en haut de la même page : aucun changement d’écran.\nÉcran du plan du site : g-back-top. Relevé du prototype actif (audit-fixes-146 + sélection du 15 octobre 2026). Le mode sombre est le mode « Sombre » de 42 · Couleurs ; chaque état relevé en anglais a sa rangée « English » (décision du 18 octobre), les textes étant liés aux variables FR/EN/AR de 42 · Textes.", "y": 6200, "w": 1600, "h": 2188}];
const out = {};
for (const s of L) {
  let sec = page.children.find(n => n.type === 'SECTION' && n.name === s.name);
  if (!sec) { sec = figma.createSection(); page.appendChild(sec); sec.name = s.name; }
  sec.x = 0; sec.y = s.y; sec.resizeWithoutConstraints(s.w, s.h);
  for (const old of sec.children.filter(n => n.type === 'TEXT' && n.name.startsWith('Note · '))) old.remove();
  const t = figma.createText(); sec.appendChild(t); t.name = 'Note · titre';
  t.fontName = { family: 'Jost', style: 'Medium' }; t.fontSize = 40; t.characters = s.title; t.fills = [paint('Rôles/text')]; t.x = 80; t.y = 64;
  const d = figma.createText(); sec.appendChild(d); d.name = 'Note · description';
  d.fontName = { family: 'Jost', style: 'Regular' }; d.fontSize = 18; d.lineHeight = { value: 28, unit: 'PIXELS' };
  d.characters = s.desc; d.fills = [paint('Rôles/muted')]; d.textAutoResize = 'HEIGHT'; d.resize(Math.min(1400, s.w - 160), d.height); d.x = 80; d.y = 124;
  out[s.id] = sec.id;
}
return { sections: out };