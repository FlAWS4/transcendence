// 42 Horizon — rendus antérieurs des cadres tenus pour les styles « chiffres tabulaires », placés à leur emplacement du nouveau plan en attendant leur remplacement : seule la position change (refonte Figma, 18 oct. 2026)
const page = await figma.getNodeByIdAsync('1:12');
await figma.setCurrentPageAsync(page);
const M = [["170:1344","Commentaires — Ordinateur · Clair",80,260],["170:1344","Commentaires — Ordinateur · Sombre",1640,260],["170:1344","Commentaires — Mobile · Clair",3200,260],["170:1344","Commentaires — Mobile · Sombre",3710,260],["170:1344","Commentaires — Ordinateur · Clair · English",80,1713],["170:1344","Commentaires — Ordinateur · Sombre · English",1640,1713],["170:1344","Commentaires — Mobile · Clair · English",3200,1713],["170:1344","Commentaires — Mobile · Sombre · English",3710,1713],["170:1344","Commentaires · avec un fil — Ordinateur · Clair",80,3160],["170:1344","Commentaires · avec un fil — Ordinateur · Sombre",1640,3160],["170:1344","Commentaires · avec un fil — Mobile · Clair",3200,3160],["170:1344","Commentaires · avec un fil — Mobile · Sombre",3710,3160],["170:1344","Commentaires · avec un fil — Ordinateur · Clair · English",80,4987],["170:1344","Commentaires · avec un fil — Ordinateur · Sombre · English",1640,4987],["170:1344","Commentaires · avec un fil — Mobile · Clair · English",3200,4987],["170:1344","Commentaires · avec un fil — Mobile · Sombre · English",3710,4987]];
const out = { moved: [], same: 0, absent: [] };
for (const [sid, name, x, y] of M) {
  const sec = await figma.getNodeByIdAsync(sid);
  const f = sec && sec.children.find(n => n.name === name);
  if (!f) { out.absent.push(name); continue; }
  if (Math.round(f.x) === x && Math.round(f.y) === y) { out.same++; continue; }
  f.x = x; f.y = y; out.moved.push(f.id);
}
return { moved: out.moved.length, same: out.same, absent: out.absent.length, movedIds: out.moved, absentNames: out.absent };