// 42 Horizon — rendus antérieurs des cadres tenus pour les styles « chiffres tabulaires », placés à leur emplacement du nouveau plan en attendant leur remplacement : seule la position change (refonte Figma, 18 oct. 2026)
const page = await figma.getNodeByIdAsync('1:9');
await figma.setCurrentPageAsync(page);
const M = [["34:16","Fiche campus — Ordinateur · Clair",80,260],["34:16","Fiche campus — Ordinateur · Sombre",1640,260],["34:16","Fiche campus — Mobile · Clair",3200,260],["34:16","Fiche campus — Mobile · Sombre",3710,260],["34:16","Fiche campus — Ordinateur · Clair · English",80,1380],["34:16","Fiche campus — Ordinateur · Sombre · English",1640,1380],["34:16","Fiche campus — Mobile · Clair · English",3200,1380],["34:16","Fiche campus — Mobile · Sombre · English",3710,1380],["34:16","Fiche campus · déployée — Mobile · Clair",80,2500],["34:16","Fiche campus · déployée — Mobile · Sombre",590,2500],["34:16","Fiche campus · déployée — Mobile · Clair · English",80,3504],["34:16","Fiche campus · déployée — Mobile · Sombre · English",590,3504],["34:16","Fiche campus · 42 Mulhouse — Ordinateur · Clair",80,4508],["34:16","Fiche campus · 42 Mulhouse — Ordinateur · Sombre",1640,4508],["34:16","Fiche campus · 42 Mulhouse — Ordinateur · Clair · English",80,5628],["34:16","Fiche campus · 42 Mulhouse — Ordinateur · Sombre · English",1640,5628]];
const out = { moved: [], same: 0, absent: [] };
for (const [sid, name, x, y] of M) {
  const sec = await figma.getNodeByIdAsync(sid);
  const f = sec && sec.children.find(n => n.name === name);
  if (!f) { out.absent.push(name); continue; }
  if (Math.round(f.x) === x && Math.round(f.y) === y) { out.same++; continue; }
  f.x = x; f.y = y; out.moved.push(f.id);
}
return { moved: out.moved.length, same: out.same, absent: out.absent.length, movedIds: out.moved, absentNames: out.absent };