// 42 Horizon — lecture seule (23 oct. 2026) : calques d'image ajoutés par un dépôt upload_assets sans emplacement ? Premier niveau de la première page du fichier, cadres créés avec une image ; rien n'est modifié
const page = figma.root.children[0];
await page.loadAsync();
const kids = page.children;
return { page: page.name, count: kids.length, images: kids.filter(n => 'fills' in n && Array.isArray(n.fills) && n.fills.some(p => p.type === 'IMAGE')).map(n => [n.id, n.name, n.type, Math.round(n.width), Math.round(n.height)]), last: kids.slice(-5).map(n => [n.id, n.name, n.type]) };