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
const page = await figma.getNodeByIdAsync('0:1');
await figma.setCurrentPageAsync(page);
for (const old of page.children.filter(n => n.name === 'Couverture')) old.remove();
const f = figma.createFrame(); page.appendChild(f); f.name = 'Couverture'; f.resize(1920, 1080); f.x = 0; f.y = 0;
f.fills = [paint('Rôles/bg')];
const logo = (await figma.getNodeByIdAsync('2:112')).createInstance(); f.appendChild(logo); logo.rescale(2.2); logo.x = 160; logo.y = 160;
const word = (await figma.getNodeByIdAsync('2:117')).createInstance(); f.appendChild(word); word.rescale(2.2); word.x = 160 + logo.width + 48; word.y = 160 + (logo.height - word.height) / 2;
const col = column(f, 28); col.x = 160; col.y = 420; col.resize(1400, 10); col.layoutSizingHorizontal = 'FIXED';
text(col, 'Maquettes du site — octobre 2026', 64, 'Medium', 'Rôles/text', 1400, 76);
text(col, "Reconstruction complète, en calques Figma, du prototype actif de 42 Horizon : arrivée et décryptage, Explorer, Projets, Profils, puis Chroniques, 42 Awards et Compte. Chaque écran est relevé dans le site puis redessiné avec les couleurs, textes, icônes et styles du projet.", 28, 'Regular', 'Rôles/muted', 1400, 42);
const meta = column(f, 12); meta.x = 160; meta.y = 760;
for (const line of ["Source : prototype actif work/visualizations/horizon-welcome/ — état audit-fixes-146 et sélection du 15 octobre 2026.", "Version du projet : 0.0.1 pré-alpha. Maquettes de travail : elles ne valent ni site implémenté ni design accepté.", "Explorations précédentes : fichier « 42 Horizon — Explorations · Accueils par rôle », conservé intact (voir la page Archives)."]) text(meta, line, 22, 'Regular', 'Rôles/text', 1500, 34);
const band = figma.createFrame(); f.appendChild(band); band.resize(1920, 16); band.x = 0; band.y = 1064; band.fills = [paint('Rôles/access-accent')];
return { id: f.id };