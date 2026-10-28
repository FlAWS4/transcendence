const page = await figma.getNodeByIdAsync('1:13');
await figma.setCurrentPageAsync(page);
await Promise.all([{family:'Jost',style:'Medium'},{family:'Jost',style:'Regular'}].map(f => figma.loadFontAsync(f)));
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const paint = n => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[n]);
const L = [{"id": "awards", "name": "Page 42 Awards · awards", "title": "Page 42 Awards", "desc": "Page d’attente : sous l’icône du trophée, une phrase centrée « Les 42 Awards arrivent bientôt. », sans lien. En-tête, compte et menu du bas ; recherche, dé et filtre y sont masqués.\nÉcran du plan du site : awards · adresse #awards. Relevé du prototype actif (audit-fixes-146 + sélection du 15 octobre 2026). Le mode sombre est le mode « Sombre » de 42 · Couleurs ; l'anglais, le mode « English » de 42 · Textes.", "y": 0, "w": 4180, "h": 2420}];
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