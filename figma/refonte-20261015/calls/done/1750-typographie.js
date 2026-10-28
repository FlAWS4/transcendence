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
const page = await figma.getNodeByIdAsync('1:4');
await figma.setCurrentPageAsync(page);
const old = page.children.find(n => n.type === 'SECTION' && n.name === 'Typographie');
const at = old ? { x: old.x, y: old.y } : { x: 0, y: Math.max(0, ...page.children.map(n => n.y + n.height)) + 200 };
if (old) old.remove();
const styles = await figma.getLocalTextStylesAsync();
const fonts = {}; for (const s of styles) fonts[JSON.stringify(s.fontName)] = s.fontName;
await Promise.all(Object.values(fonts).map(x => figma.loadFontAsync(x)));
const SG = ["Titres", "Sous-titres", "Corps", "Libellés", "Petits", "Arabe", "Code"];
const groupOf = s => s.name.split('/')[0];
const gi = g => { const i = SG.indexOf(g); return i < 0 ? 99 : i; };
styles.sort((a, b) => gi(groupOf(a)) - gi(groupOf(b)) || groupOf(a).localeCompare(groupOf(b)) || b.fontSize - a.fontSize || a.name.localeCompare(b.name));
const ts = figma.createSection(); page.appendChild(ts); ts.name = 'Typographie'; ts.x = at.x; ts.y = at.y;
const t = figma.createAutoLayout('VERTICAL', { itemSpacing: 36 }); ts.appendChild(t); t.name = 'Typographie';
t.paddingTop = t.paddingBottom = 120; t.paddingLeft = t.paddingRight = 160; t.fills = [paint('Rôles/bg')];
t.resize(1920, 100); t.counterAxisSizingMode = 'FIXED'; t.primaryAxisSizingMode = 'AUTO'; t.x = 80; t.y = 80;
text(t, 'Typographie', 56, 'Medium', 'Rôles/text', 1600, 68);
text(t, "Les %n styles de texte du fichier, créés pendant la reconstruction d’après les styles calculés du site : un style par combinaison de police, graisse, taille et interligne, rangé par rôle. Les textes des maquettes y sont liés. Les styles dont le nom finit par « chiffres tabulaires » reprennent « font-variant-numeric: tabular-nums » du site : leurs chiffres ont tous la même largeur (dans Figma : Details → Numbers → « Monospace », option cochée à la main dans chacun, que l’API de Figma ne sait pas activer).".replace('%n', String(styles.length)), 20, 'Regular', 'Rôles/muted', 1600, 32);
const SAMPLE = {"Arabe": "أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ", "Code": "0x2A · 101010 · 42", "": "Beyond the code — Explorer, Projets, Profils · 0123456789"}, TAB = "2024 · 1111 · 0000 · 5 000+ · 1 / 2 · 0 / 2 000 caractères";
const groups = {}; for (const s of styles) (groups[groupOf(s)] = groups[groupOf(s)] || []).push(s);
let n = 0, tab = 0;
for (const g of Object.keys(groups)) {
  const b = column(t, 24); b.layoutSizingHorizontal = 'FILL'; b.name = g;
  text(b, g + ' · ' + groups[g].length + (groups[g].length > 1 ? ' styles' : ' style'), 30, 'Medium', 'Rôles/text', 1600, 40);
  for (const s of groups[g]) {
    const isTab = s.name.endsWith('chiffres tabulaires');
    const row = figma.createAutoLayout('HORIZONTAL', { itemSpacing: 40 }); b.appendChild(row); row.fills = []; row.name = s.name;
    row.layoutSizingHorizontal = 'FILL'; row.counterAxisAlignItems = 'CENTER';
    const meta = column(row, 6); meta.resize(360, 10); meta.counterAxisSizingMode = 'FIXED'; meta.primaryAxisSizingMode = 'AUTO';
    text(meta, s.name.split('/').slice(1).join('/') || s.name, 16, 'Medium', 'Rôles/text', 360, 22);
    const lh = s.lineHeight.unit === 'PIXELS' ? Math.round(s.lineHeight.value * 100) / 100 + ' px' : s.lineHeight.unit === 'PERCENT' ? Math.round(s.lineHeight.value) + ' %' : 'auto';
    const ls = s.letterSpacing && s.letterSpacing.value ? ' · espacement ' + Math.round(s.letterSpacing.value * 100) / 100 + (s.letterSpacing.unit === 'PIXELS' ? ' px' : ' %') : '';
    text(meta, s.fontName.family + ' ' + s.fontName.style + ' · ' + Math.round(s.fontSize * 100) / 100 + ' px · interligne ' + lh + ls + (isTab ? ' · chiffres tabulaires' : ''), 13, 'Regular', 'Rôles/muted', 360, 18);
    const sp = figma.createText(); row.appendChild(sp); sp.fontName = { family: 'Jost', style: 'Regular' };
    sp.characters = isTab ? TAB : (SAMPLE[g] || SAMPLE['']);
    await sp.setTextStyleIdAsync(s.id); sp.fills = [paint('Rôles/text')];
    sp.textAutoResize = 'HEIGHT'; sp.resize(1200, sp.height); sp.name = 'Exemple';
    n++; if (isTab) tab++;
  }
}
ts.resizeWithoutConstraints(t.width + 160, t.height + 160);
return { styles: n, tabular: tab, groups: Object.keys(groups).map(g => g + ' ' + groups[g].length), ids: { section: ts.id, board: t.id }, at };