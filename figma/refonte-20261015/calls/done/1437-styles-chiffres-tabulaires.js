// 42 Horizon — les 11 styles « chiffres tabulaires » de la refonte Figma (18 oct. 2026), créés à la demande de l'utilisateur avec les réglages des styles du moteur (render.js, textStyle : police, taille, interligne, interlettrage en px) ; l'API de Figma ne peut pas activer l'option « Tabular figures » : l'utilisateur la coche dans chaque style. Un style déjà présent sous ce nom n'est pas modifié.
const S = [["Corps/16 · Medium · 24 · chiffres tabulaires","Medium",16.0,24.0],["Libellés/13 · Medium · 21.45 · chiffres tabulaires","Medium",13.0,21.45],["Libellés/13 · Medium · chiffres tabulaires","Medium",13.0,null],["Libellés/13 · Regular · 20.8 · chiffres tabulaires","Regular",13.0,20.8],["Libellés/13 · Regular · chiffres tabulaires","Regular",13.0,null],["Libellés/14 · Medium · 19.6 · chiffres tabulaires","Medium",14.0,19.6],["Libellés/14 · Regular · 19.6 · chiffres tabulaires","Regular",14.0,19.6],["Libellés/14 · Regular · 22.4 · chiffres tabulaires","Regular",14.0,22.4],["Titres/25.8 · Medium · 28.38 · chiffres tabulaires","Medium",25.8,28.38],["Titres/27 · Medium · chiffres tabulaires","Medium",27.0,null],["Titres/28 · Medium · 30.8 · chiffres tabulaires","Medium",28.0,30.8]];
const fonts = await figma.listAvailableFontsAsync();
for (const st of ['Regular', 'Medium']) if (!fonts.some(f => f.fontName.family === 'Jost' && f.fontName.style === st)) throw new Error('Police Jost ' + st + ' indisponible');
await figma.loadFontAsync({ family: 'Jost', style: 'Regular' });
await figma.loadFontAsync({ family: 'Jost', style: 'Medium' });
const have = {}; for (const s of await figma.getLocalTextStylesAsync()) have[s.name] = s;
const DESC = "Chiffres tabulaires (font-variant-numeric: tabular-nums du site) : option « Tabular figures » des détails du texte (Numbers), cochée à la main, l'API de Figma ne pouvant pas l'activer. Appliqué par le moteur de la refonte aux nombres que le site affiche en chiffres tabulaires.";
const out = [];
for (const [name, style, fs, lh] of S) {
  let s = have[name];
  if (s) { out.push({ name, id: s.id, status: 'déjà présent, inchangé' }); continue; }
  s = figma.createTextStyle(); s.name = name; s.fontName = { family: 'Jost', style }; s.fontSize = fs;
  s.lineHeight = lh ? { value: lh, unit: 'PIXELS' } : { unit: 'AUTO' };
  s.letterSpacing = { value: 0, unit: 'PIXELS' };
  s.description = DESC;
  out.push({ name, id: s.id, status: 'créé', font: s.fontName.family + ' ' + s.fontName.style, size: s.fontSize, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing });
}
return { count: out.length, created: out.filter(o => o.status === 'créé').length, styles: out };