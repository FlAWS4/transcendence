// 42 Horizon — rangement de la page « Composants » après l’ajout des familles « Carte · Profils » : sections empilées sans chevauchement, par catégorie puis par nom ; seules les positions des sections changent (refonte Figma, 19 oct. 2026)
const page = await figma.getNodeByIdAsync('1:6');
await figma.setCurrentPageAsync(page);
const ORDER = ['Marque/', 'En-tête/', 'Navigation/', 'Commandes/', 'Listes/', 'Cartes/'];
const rank = s => { const i = ORDER.findIndex(p => s.name.startsWith(p)); return i < 0 ? ORDER.length : i; };
const secs = page.children.filter(n => n.type === 'SECTION').sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'fr'));
let y = 160;
const moved = [], order = [];
for (const s of secs) {
  if (Math.round(s.x) !== 0 || Math.round(s.y) !== y) { s.x = 0; s.y = y; moved.push(s.id); }
  order.push(s.name + ' @' + y);
  y += Math.ceil(s.height) + 160;
}
const others = page.children.filter(n => n.type !== 'SECTION').map(n => n.type + ' ' + n.id + ' ' + n.name);
return { sections: secs.length, moved: moved.length, movedIds: moved, order, others };