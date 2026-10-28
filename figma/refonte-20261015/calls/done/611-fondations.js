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
for (const old of page.children.filter(n => ['Couleurs', 'Typographie'].includes(n.name))) old.remove();
const col = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const light = col.modes.find(m => m.name === 'Clair').modeId, darkMode = col.modes.find(m => m.name === 'Sombre').modeId;
const CSS = {"Contrôles/field-surface": "--control-field-surface", "Contrôles/glass-edge": "--control-glass-edge", "Contrôles/glass-selection": "--control-glass-selection", "Contrôles/glass-selection-edge": "--control-glass-selection-edge", "Contrôles/glass-surface": "--control-glass-surface", "Contenus/accent": "--cp-accent", "Contenus/line": "--cp-line", "Rôles/access-accent": "--h42-access-accent", "Primitives/cadet": "--h42-cadet", "Primitives/cerulean": "--h42-cerulean", "Primitives/charcoal": "--h42-charcoal", "Primitives/cobalt": "--h42-cobalt", "Rôles/accent": "--h42-color-accent", "Rôles/action-disabled": "--h42-color-action-disabled", "Rôles/action-hover": "--h42-color-action-hover", "Rôles/action-on-disabled": "--h42-color-action-on-disabled", "Rôles/action-on-hover": "--h42-color-action-on-hover", "Rôles/action-on-pressed": "--h42-color-action-on-pressed", "Rôles/action-on-primary": "--h42-color-action-on-primary", "Rôles/action-on-secondary": "--h42-color-action-on-secondary", "Rôles/action-pressed": "--h42-color-action-pressed", "Rôles/action-primary": "--h42-color-action-primary", "Rôles/action-quiet": "--h42-color-action-quiet", "Rôles/action-secondary": "--h42-color-action-secondary", "Rôles/bg": "--h42-color-bg", "Rôles/border": "--h42-color-border", "Rôles/card-background": "--h42-color-card-background", "Rôles/card-border": "--h42-color-card-border", "Rôles/error": "--h42-color-error", "Rôles/fade-clear": "--h42-color-fade-clear", "Rôles/fade-veil": "--h42-color-fade-veil", "Rôles/focus": "--h42-color-focus", "Rôles/grid": "--h42-color-grid", "Rôles/info": "--h42-color-info", "Rôles/input-background": "--h42-color-input-background", "Rôles/input-border": "--h42-color-input-border", "Rôles/input-placeholder": "--h42-color-input-placeholder", "Rôles/inverse": "--h42-color-inverse", "Rôles/journal": "--h42-color-journal", "Rôles/land": "--h42-color-land", "Rôles/link": "--h42-color-link", "Rôles/logo": "--h42-color-logo", "Rôles/muted": "--h42-color-muted", "Rôles/nav-active": "--h42-color-nav-active", "Rôles/nav-hover": "--h42-color-nav-hover", "Rôles/onAccent": "--h42-color-onAccent", "Rôles/onInverse": "--h42-color-onInverse", "Rôles/overlay": "--h42-color-overlay", "Rôles/people": "--h42-color-people", "Rôles/project": "--h42-color-project", "Rôles/soft": "--h42-color-soft", "Rôles/success": "--h42-color-success", "Rôles/surface": "--h42-color-surface", "Rôles/text": "--h42-color-text", "Rôles/warning": "--h42-color-warning", "Primitives/gradient-indigo": "--h42-gradient-indigo", "Primitives/graphite": "--h42-graphite", "Primitives/ink": "--h42-ink", "Primitives/ink-25": "--h42-ink-25", "Primitives/ink-5": "--h42-ink-5", "Primitives/ink-50": "--h42-ink-50", "Primitives/ink-75": "--h42-ink-75", "Primitives/ink-clear": "--h42-ink-clear", "Primitives/ink-veil": "--h42-ink-veil", "Primitives/line": "--h42-line", "Primitives/mist": "--h42-mist", "Primitives/muted": "--h42-muted", "Primitives/pale": "--h42-pale", "Primitives/pink": "--h42-pink", "Primitives/slate": "--h42-slate", "Primitives/teal": "--h42-teal", "Primitives/tealDeep": "--h42-tealDeep", "Primitives/ui-green": "--h42-ui-green", "Primitives/ui-orange": "--h42-ui-orange", "Primitives/ui-pink": "--h42-ui-pink", "Primitives/ui-slate": "--h42-ui-slate", "Primitives/ui-violet": "--h42-ui-violet", "Primitives/violet": "--h42-violet", "Primitives/white": "--h42-white", "Primitives/white-25": "--h42-white-25", "Primitives/white-5": "--h42-white-5", "Primitives/white-50": "--h42-white-50", "Primitives/white-75": "--h42-white-75", "Primitives/white-clear": "--h42-white-clear", "Primitives/white-veil": "--h42-white-veil", "Horizon/favorite-heart": "--horizon-favorite-heart", "Horizon/scroll-active": "--horizon-scroll-active", "Horizon/scroll-hover": "--horizon-scroll-hover", "Horizon/scroll-thumb": "--horizon-scroll-thumb", "Verre lisible/glass-accent": "--readable-glass-accent", "Verre lisible/glass-muted": "--readable-glass-muted", "Verre lisible/text-accent": "--readable-text-accent", "Chaleur/line": "--warm-line", "Chaleur/soft": "--warm-soft"}, ORDER = ["Rôles", "Primitives", "Contrôles", "Contenus", "Verre lisible", "Chaleur", "Horizon", "Autres", "Globe", "dérivées/fond", "dérivées/texte", "dérivées/icône", "dérivées/bordure", "dérivées/ombre", "dérivées/dégradé"];
const all = (await figma.variables.getLocalVariablesAsync('COLOR')).filter(v => v.variableCollectionId === col.id && !v.name.startsWith('_'));
const byId = {}; for (const v of all) byId[v.id] = v;
const hexOf = (v, mode, depth) => {
  let val = v.valuesByMode[mode];
  if (val && val.type === 'VARIABLE_ALIAS') { const t = byId[val.id]; return t && (depth || 0) < 5 ? hexOf(t, mode, (depth || 0) + 1) : '?'; }
  const h = x => Math.round(x * 255).toString(16).padStart(2, '0').toUpperCase();
  return '#' + h(val.r) + h(val.g) + h(val.b) + (val.a < 1 ? h(val.a) : '');
};
const groupOf = n => { const p = n.split('/'); return p[0] === 'dérivées' ? p[0] + '/' + p[1] : p[0]; };
const groups = {}; for (const v of all) (groups[groupOf(v.name)] = groups[groupOf(v.name)] || []).push(v);
const keys = Object.keys(groups).sort((a, b) => ((ORDER.indexOf(a) + 1) || 99) - ((ORDER.indexOf(b) + 1) || 99) || a.localeCompare(b));
function section(name, y) { const s = figma.createSection(); page.appendChild(s); s.name = name; s.x = 0; s.y = y; return s; }
// colours: one light board, its dark clone with the « Sombre » mode
const sec = section('Couleurs', 0);
const f = figma.createAutoLayout('VERTICAL', { itemSpacing: 48 }); sec.appendChild(f); f.name = 'Couleurs — Clair';
f.paddingTop = f.paddingBottom = 120; f.paddingLeft = f.paddingRight = 160; f.fills = [paint('Rôles/bg')];
f.resize(1920, 100); f.counterAxisSizingMode = 'FIXED'; f.primaryAxisSizingMode = 'AUTO'; f.x = 80; f.y = 80;
text(f, 'Couleurs', 56, 'Medium', 'Rôles/text', 1600, 68);
text(f, "Variables de la collection « 42 · Couleurs », en mode Clair à gauche et en mode Sombre à droite (le même cadre, mode changé). Les noms reprennent les propriétés CSS du prototype actif. « Dérivées » regroupe les couleurs peintes sans propriété dédiée (mélanges, ombres, arrêts de dégradé), nommées par leurs valeurs claire et sombre relevées sur le même élément.", 20, 'Regular', 'Rôles/muted', 1600, 32);
let n = 0;
for (const g of keys) {
  const b = column(f, 20); b.layoutSizingHorizontal = 'FILL';
  text(b, ({"Rôles": "Rôles du thème (--h42-color-…)", "Primitives": "Primitives de la marque (--h42-…)", "Contrôles": "Contrôles (--control-…)", "Contenus": "Contenus (--cp-…)", "Verre lisible": "Verre lisible (--readable-…)", "Chaleur": "Chaleur (--warm-…)", "Horizon": "Horizon (--horizon-…)", "Autres": "Autres propriétés CSS", "Globe": "Globe (codées dans globe-style.mjs)", "dérivées/fond": "Dérivées · fonds", "dérivées/texte": "Dérivées · textes", "dérivées/icône": "Dérivées · icônes", "dérivées/bordure": "Dérivées · bordures", "dérivées/ombre": "Dérivées · ombres", "dérivées/dégradé": "Dérivées · dégradés"})[g] || g, 30, 'Medium', 'Rôles/text', 1600, 40);
  const row = figma.createAutoLayout('HORIZONTAL', { itemSpacing: 24 }); b.appendChild(row); row.fills = [];
  row.layoutWrap = 'WRAP'; row.counterAxisSpacing = 32; row.layoutSizingHorizontal = 'FILL';
  for (const v of groups[g].sort((a, c) => a.name.localeCompare(c.name))) {
    const sw = column(row, 8); sw.name = v.name; sw.resize(176, 10); sw.counterAxisSizingMode = 'FIXED'; sw.primaryAxisSizingMode = 'AUTO';
    const r = figma.createRectangle(); sw.appendChild(r); r.resize(176, 80); r.cornerRadius = 12; r.name = 'Échantillon';
    r.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v)];
    r.strokes = [paint('Contenus/line')]; r.strokeWeight = 1; r.strokeAlign = 'INSIDE';
    text(sw, v.name.split('/').slice(g.includes('/') ? 2 : 1).join('/'), 14, 'Medium', 'Rôles/text', 176, 20);
    if (CSS[v.name]) text(sw, CSS[v.name], 12, 'Regular', 'Rôles/muted', 176, 18);
    text(sw, 'Clair ' + hexOf(v, light) + '\nSombre ' + hexOf(v, darkMode), 12, 'Regular', 'Rôles/muted', 176, 18);
    n++;
  }
}
const d = f.clone(); sec.appendChild(d); d.name = 'Couleurs — Sombre'; d.x = f.x + f.width + 120; d.y = f.y;
d.setExplicitVariableModeForCollection(col, darkMode);
sec.resizeWithoutConstraints(d.x + d.width + 80, Math.max(f.height, d.height) + 160);
// text styles created by the renderer, with a specimen in each style
const styles = await figma.getLocalTextStylesAsync();
const fonts = {}; for (const s of styles) fonts[JSON.stringify(s.fontName)] = s.fontName;
await Promise.all(Object.values(fonts).map(x => figma.loadFontAsync(x)));
const SG = ["Titres", "Sous-titres", "Corps", "Libellés", "Petits", "Arabe", "Code"];
const gi = s => { const i = SG.indexOf(s.name.split('/')[0]); return i < 0 ? 99 : i; };
styles.sort((a, b) => gi(a) - gi(b) || b.fontSize - a.fontSize || a.name.localeCompare(b.name));
const ts = section('Typographie', sec.y + sec.height + 200);
const t = figma.createAutoLayout('VERTICAL', { itemSpacing: 36 }); ts.appendChild(t); t.name = 'Typographie';
t.paddingTop = t.paddingBottom = 120; t.paddingLeft = t.paddingRight = 160; t.fills = [paint('Rôles/bg')];
t.resize(1920, 100); t.counterAxisSizingMode = 'FIXED'; t.primaryAxisSizingMode = 'AUTO'; t.x = 80; t.y = 80;
text(t, 'Typographie', 56, 'Medium', 'Rôles/text', 1600, 68);
text(t, "Styles de texte créés pendant la reconstruction, d’après les styles calculés du site : un style par combinaison de police, graisse, taille et interligne, rangé par rôle. Les textes des maquettes y sont liés.", 20, 'Regular', 'Rôles/muted', 1600, 32);
const SAMPLE = {"Arabe": "أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ", "Code": "0x2A · 101010 · 42", "": "Beyond the code — Explorer, Projets, Profils · 0123456789"};
for (const s of styles) {
  const row = figma.createAutoLayout('HORIZONTAL', { itemSpacing: 40 }); t.appendChild(row); row.fills = []; row.name = s.name;
  row.layoutSizingHorizontal = 'FILL'; row.counterAxisAlignItems = 'CENTER';
  const meta = column(row, 6); meta.resize(360, 10); meta.counterAxisSizingMode = 'FIXED'; meta.primaryAxisSizingMode = 'AUTO';
  text(meta, s.name, 16, 'Medium', 'Rôles/text', 360, 22);
  const lh = s.lineHeight.unit === 'PIXELS' ? Math.round(s.lineHeight.value * 100) / 100 + ' px' : s.lineHeight.unit === 'PERCENT' ? Math.round(s.lineHeight.value) + ' %' : 'auto';
  const ls = s.letterSpacing && s.letterSpacing.value ? ' · espacement ' + Math.round(s.letterSpacing.value * 100) / 100 + (s.letterSpacing.unit === 'PIXELS' ? ' px' : ' %') : '';
  text(meta, s.fontName.family + ' ' + s.fontName.style + ' · ' + Math.round(s.fontSize * 100) / 100 + ' px · interligne ' + lh + ls, 13, 'Regular', 'Rôles/muted', 360, 18);
  const sp = figma.createText(); row.appendChild(sp); sp.fontName = { family: 'Jost', style: 'Regular' };
  sp.characters = SAMPLE[s.name.split('/')[0]] || SAMPLE[''];
  await sp.setTextStyleIdAsync(s.id); sp.fills = [paint('Rôles/text')];
  sp.textAutoResize = 'HEIGHT'; sp.resize(1200, sp.height); sp.name = 'Exemple';
}
ts.resizeWithoutConstraints(t.width + 160, t.height + 160);
return { colours: n, groups: keys.length, styles: styles.length, ids: { light: f.id, dark: d.id, type: t.id, sections: [sec.id, ts.id] } };