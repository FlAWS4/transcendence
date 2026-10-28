await Promise.all([{family:'Jost',style:'Medium'},{family:'Jost',style:'Regular'},{family:'Jost',style:'SemiBold'},{family:'Noto Sans Arabic',style:'Regular'}].map(f => figma.loadFontAsync(f)));
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const paint = n => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[n]);
function text(parent, s, size, style, role, w, lh) {
  const t = figma.createText(); parent.appendChild(t);
  t.fontName = { family: 'Jost', style }; t.fontSize = size; if (lh) t.lineHeight = { value: lh, unit: 'PIXELS' };
  t.characters = s; t.fills = [paint(role)];
  if (w) { t.textAutoResize = 'HEIGHT'; t.resize(w, t.height); }
  return t;
}
function column(parent, gap) { const f = figma.createAutoLayout('VERTICAL', { itemSpacing: gap }); f.fills = []; parent.appendChild(f); return f; }
const page = await figma.getNodeByIdAsync('1:2');
await figma.setCurrentPageAsync(page);
for (const old of page.children.filter(n => n.name === 'Guide de lecture')) old.remove();
const f = figma.createAutoLayout('VERTICAL', { itemSpacing: 56 }); page.appendChild(f); f.name = 'Guide de lecture';
f.paddingTop = f.paddingBottom = 120; f.paddingLeft = f.paddingRight = 160; f.fills = [paint('Rôles/bg')];
f.resize(1920, 100); f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
text(f, 'Guide de lecture', 56, 'Medium', 'Rôles/text', 1600, 68);
for (const [title, body] of [["Ce que contient ce fichier", "Les maquettes à jour du site 42 Horizon, refaites le 15 octobre 2026 à partir du prototype actif : un relevé exact de chaque écran (boîtes, couleurs, textes) redessiné en calques Figma modifiables. Les anciennes pistes restent dans le fichier d’explorations, inchangé."], ["Organisation des pages", "Fondations, Icônes et marque, Composants, puis une page par partie du site : 01 Arrivée et décryptage, 02 Explorer, 03 Projets, 04 Profils, 05 Chroniques, 06 42 Awards, 07 Compte et réglages. Chaque page contient une section par écran du plan du site (son identifiant figure dans le nom de la section), avec une description de l’écran."], ["Lire une section", "Chaque ligne montre un état de l’écran, dans l’ordre du parcours, en quatre cadres : Ordinateur · Clair, Ordinateur · Sombre, Mobile · Clair, Mobile · Sombre. Les écrans principaux ont aussi une ligne en arabe (mise en page miroir, de droite à gauche). Les listes et fiches sont en pleine hauteur ; l’en-tête et le menu du bas y sont fixés au défilement."], ["Thèmes : mode « Sombre »", "Toutes les couleurs sont liées aux variables de la collection « 42 · Couleurs », reprises des propriétés CSS du site (les mélanges sans propriété dédiée sont dans « dérivées/… »). Les cadres sombres sont les cadres clairs avec le mode « Sombre » : changer le mode d’un cadre suffit pour passer d’un thème à l’autre."], ["Langues : mode « English »", "Les textes d’interface et de contenu sont liés aux variables de « 42 · Textes » (Français, English, العربية). Pour voir un écran en anglais, choisir le mode « English » de cette collection sur le cadre. L’arabe a ses propres cadres, parce que sa mise en page est inversée."], ["Typographie", "Jost (Regular, Medium, SemiBold) comme sur le site ; Noto Sans Arabic pour les passages arabes. Les chiffres du scan de l’arrivée reprennent les contours exacts de DejaVu Sans Mono, la police à chasse fixe que Chrome affiche pour le canvas du site ; ils sont des composants de la page « Icônes et marque ». Les styles de texte sont nommés par rôle et par valeur : Titres, Sous-titres, Corps, Libellés, Petits, Arabe, Code — par exemple « Corps/16 · Regular · 26 »."], ["Ce que Figma ne reproduit pas", "Le globe est une image vectorielle figée : rotation, zoom Monde → Pays → Campus, vols et rues détaillées restent propres au site. Les animations (scan, décryptage, cercle, transitions) sont montrées par étapes, avec leurs durées dans les descriptions. Les connexions, publications et votes restent simulés, comme dans le prototype."], ["Conservation", "Rien n’est supprimé des explorations précédentes. Ce fichier ne remplace pas leur historique : il donne l’état actuel du site, de façon rangée."]]) {
  const b = column(f, 16); b.layoutSizingHorizontal = 'FILL';
  text(b, title, 30, 'Medium', 'Rôles/text', 1600, 40);
  text(b, body, 20, 'Regular', 'Rôles/muted', 1600, 32);
}
return { id: f.id };