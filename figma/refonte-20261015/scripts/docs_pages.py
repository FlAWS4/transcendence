"""Cover and reading-guide pages of the rebuilt Figma file (15 October 2026).

  python3 docs_pages.py cover   → calls/<n>-couverture.js
  python3 docs_pages.py guide   → calls/<n>-guide.js
Texts are French (project language); colours are bound to the « 42 · Couleurs » roles so both pages follow the theme.
"""
import json, pathlib, re, sys
from make_call import CALLS, LEDGER, next_index, guard_spaces


def fr_spaces(s):
    """19 Oct.: French typography of the texts of these pages: a no-break space before : ; ! ? and », after «, so that a line
    never starts with a colon or a closing guillemet (the typography board of 1750 broke « Figma / : Details »)."""
    return re.sub(r'« ', '«\u00a0', re.sub(r' ([:;!?»])', '\u00a0\\1', s))

COMMON = r"""await Promise.all([{family:'Jost',style:'Medium'},{family:'Jost',style:'Regular'},{family:'Jost',style:'SemiBold'},{family:'Noto Sans Arabic',style:'Regular'}].map(f => figma.loadFontAsync(f)));
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
// 19 Oct.: U+00A0 and U+202F travel as visible tokens (make_call.guard_spaces), turned back here
const TOK = new RegExp(String.fromCodePoint(0x27e6) + '(202f|00a0)' + String.fromCodePoint(0x27e7), 'g');
const UN = s => s.replace(TOK, (_, h) => String.fromCodePoint(parseInt(h, 16)));
const paint = n => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[n]);
function text(parent, s, size, style, role, w, lh) {
  const t = figma.createText(); parent.appendChild(t);
  t.fontName = { family: 'Jost', style }; t.fontSize = size; if (lh) t.lineHeight = { value: lh, unit: 'PIXELS' };
  t.characters = UN(s); t.fills = [paint(role)];
  if (w) { t.textAutoResize = 'HEIGHT'; t.resize(w, t.height); }
  return t;
}
function column(parent, gap) { const f = figma.createAutoLayout('VERTICAL', { itemSpacing: gap }); f.fills = []; parent.appendChild(f); return f; }
"""

COVER = COMMON + r"""const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
for (const old of page.children.filter(n => n.name === 'Couverture')) old.remove();
const f = figma.createFrame(); page.appendChild(f); f.name = 'Couverture'; f.resize(1920, 1080); f.x = 0; f.y = 0;
f.fills = [paint('Rôles/bg')];
const logo = (await figma.getNodeByIdAsync('%(logo)s')).createInstance(); f.appendChild(logo); logo.rescale(2.2); logo.x = 160; logo.y = 160;
const word = (await figma.getNodeByIdAsync('%(word)s')).createInstance(); f.appendChild(word); word.rescale(2.2); word.x = 160 + logo.width + 48; word.y = 160 + (logo.height - word.height) / 2;
const col = column(f, 28); col.x = 160; col.y = 420; col.resize(1400, 10); col.counterAxisSizingMode = 'FIXED'; col.primaryAxisSizingMode = 'AUTO'; // resize() fixes both axes: let the column hug its texts
text(col, 'Maquettes du site — octobre 2026', 64, 'Medium', 'Rôles/text', 1400, 76);
text(col, %(subtitle)s, 28, 'Regular', 'Rôles/muted', 1400, 42);
const meta = column(f, 12); meta.x = 160; meta.y = 760;
for (const line of %(meta)s) text(meta, line, 22, 'Regular', 'Rôles/text', 1500, 34);
const band = figma.createFrame(); f.appendChild(band); band.resize(1920, 16); band.x = 0; band.y = 1064; band.fills = [paint('Rôles/access-accent')];
return { id: f.id };"""

GUIDE = COMMON + r"""const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
for (const old of page.children.filter(n => n.name === 'Guide de lecture')) old.remove();
const f = figma.createAutoLayout('VERTICAL', { itemSpacing: 56 }); page.appendChild(f); f.name = 'Guide de lecture';
f.paddingTop = f.paddingBottom = 120; f.paddingLeft = f.paddingRight = 160; f.fills = [paint('Rôles/bg')];
f.resize(1920, 100); f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
text(f, 'Guide de lecture', 56, 'Medium', 'Rôles/text', 1600, 68);
for (const [title, body] of %(blocks)s) {
  const b = column(f, 16); b.layoutSizingHorizontal = 'FILL';
  text(b, title, 30, 'Medium', 'Rôles/text', 1600, 40);
  text(b, body, 20, 'Regular', 'Rôles/muted', 1600, 32);
}
return { id: f.id };"""


def cover():
    led = json.loads(LEDGER.read_text())
    subtitle = ('Reconstruction complète, en calques Figma, du prototype actif de 42 Horizon : arrivée et décryptage, Explorer, '
                'Projets, Profils, puis Chroniques, 42 Awards et Compte. Chaque écran est relevé dans le site puis redessiné '
                'avec les couleurs, textes, icônes et styles du projet.')
    meta = ['Source : prototype actif site/ — état audit-fixes-146 et sélection du 15 octobre 2026.',
            'Version du projet : 0.0.1 pré-alpha. Maquettes de travail : elles ne valent ni site implémenté ni design accepté.',
            'Explorations précédentes : fichier « 42 Horizon — Explorations · Accueils par rôle », conservé intact (voir la page Archives).']
    code = COVER % {'page': led['pages']['Couverture'], 'logo': led['components']['brand']['Marque/Logo 42'],
                    'word': led['components']['brand']['Marque/Horizon'], 'subtitle': json.dumps(subtitle, ensure_ascii=False),
                    'meta': json.dumps(meta, ensure_ascii=False)}
    f = CALLS / ('%03d-couverture.js' % next_index()); f.write_text(code); print(f.name, len(code))


def guide():
    """19 Oct.: the guide of the finished file (pages 09 and 10, library documented, typography, English rows); the
    guide of 17 Oct. described the English by the « English » mode and the windows over the whole page."""
    led = json.loads(LEDGER.read_text())
    blocks = [
        ['Ce que contient ce fichier', "Les maquettes à jour du site 42 Horizon, refaites à partir du prototype actif du 15 au 19 octobre 2026 : chaque écran est relevé dans le site (boîtes, couleurs, textes, images) puis redessiné en calques Figma modifiables, et comparé au site cadre par cadre. Ce sont des maquettes de travail du projet en 0.0.1 pré-alpha : elles ne valent ni site implémenté ni design accepté. Les anciennes pistes restent dans le fichier d’explorations, conservé intact."],
        ['Organisation des pages', "Fondations (couleurs et typographie), Icônes et marque, Composants, puis une page par partie du site : 01 Arrivée et décryptage, 02 Explorer, 03 Projets, 04 Profils, 05 Chroniques, 06 42 Awards, 07 Compte et réglages, 08 Éléments communs (recherche, menu du bas des petits écrans, bouton « remonter en haut »). Les pages 09 et 10 sont les parcours cliquables, sur ordinateur et sur mobile. La page Archives garde les essais remplacés. Chaque page d’écrans contient une section par écran du plan du site (son identifiant figure dans le nom de la section) avec une note qui le décrit ; Maj + 1 affiche toute la page."],
        ['Lire une section', "Chaque ligne montre un état de l’écran, dans l’ordre du parcours : Ordinateur · Clair, Ordinateur · Sombre, Mobile · Clair, Mobile · Sombre. Sous la ligne française, une ligne English reprend l’état relevé en anglais, et les écrans principaux ont une ligne en arabe, en miroir. Une page est dessinée sur toute sa hauteur : l’en-tête, la pastille « Monde » et les colonnes fixes restent en haut, le menu du bas, la recherche et le dé sont posés en bas du cadre. Un menu, un panneau ou une fenêtre ouverts sont montrés à la hauteur de l’écran (1440 × 960 ou 390 × 844), comme le site les montre."],
        ['Thèmes', "Toutes les couleurs sont liées aux variables de la collection « 42 · Couleurs », reprises des propriétés CSS du site ; les mélanges sans propriété dédiée sont dans « dérivées/… ». Un cadre sombre est le cadre clair avec le mode « Sombre ». Exceptions, dessinées d’après le site en sombre : les panneaux du compte, des paramètres et du thème (l’option cochée change), les fenêtres de connexion et de création de compte, et les suggestions de mention. Les plans des rues ont une image claire et une image sombre."],
        ['Langues', "Les textes sont liés aux variables de « 42 · Textes » (Français, English, العربية). Depuis le 18 octobre, l’anglais a ses propres cadres, relevés sur le site en anglais, parce que l’anglais déplace des boîtes : lire la ligne English plutôt que changer le mode d’un cadre français. L’arabe a aussi ses cadres, en miroir."],
        ['Typographie', "Jost (Regular et Medium) comme sur le site, Noto Sans Arabic pour l’arabe ; l’espace fine des milliers est posée en Noto Sans, Jost n’ayant pas ce caractère. Les 158 styles de texte, rangés en Titres, Sous-titres, Corps, Libellés, Petits et Arabe, sont nommés par leurs valeurs, par exemple « Corps/16 · Regular · 26 » ; la page Fondations les montre tous. Les 11 styles dont le nom finit par « chiffres tabulaires » donnent à tous les chiffres la même largeur, comme le site (option « Monospace » des chiffres dans Figma). Les chiffres du scan de l’arrivée reprennent les contours de DejaVu Sans Mono, la police que Chrome affiche pour ce canvas : ce sont des composants de la page Icônes et marque."],
        ['Composants', "La page Composants réunit les éléments répétés du site : 22 familles et 913 variantes (logo, bouton du compte, menu du bas, recherche, dé, fil géographique, boutons, paginations, cartes). Chaque famille a une note et une description qui disent son rôle, son sélecteur CSS et ses propriétés. Dans un écran, un élément devient une instance seulement s’il est identique à une variante, au dixième de pixel près ; sinon il reste en calques à plat."],
        ['Parcours cliquables', "Les pages 09 (ordinateur) et 10 (mobile) se parcourent en mode Présentation : choisir un point de départ, Français ou English, à l’arrivée, en membre ou en aperçu direct (liste des projets). Chaque écran y est une copie d’un cadre vérifié, à la hauteur de l’écran : la page défile, l’en-tête et le menu du bas restent fixes ; un menu qui défile sur le site (« Dans ce projet » sur mobile) défile aussi. Les zones cliquables reprennent les éléments du site et leurs destinations. Une fenêtre ou un panneau mène à l’écran relevé exact ; Fermer, Annuler ou un clic à côté reviennent à l’écran précédent, ou à la page sous la fenêtre quand elle s’ouvre depuis une autre. « Retour aux … » mène à la liste, « ← », « Revenir au monde » et le nom du pays au monde ou au pays. Sous une fenêtre, la page ne réagit pas ; à côté d’un menu, elle réagit. Les étapes de l’arrivée s’enchaînent seules. Compte → Thème → Sombre passe le parcours en mode sombre (les photos et les plans gardent leur image claire) ; Compte → Langue fait passer du parcours français au parcours anglais. « Se connecter » puis « Simuler une connexion réussie » mène au parcours membre (Leïla Mansour) ; dans une page, « Continuer avec le profil » la laisse en membre."],
        ['Limites des parcours', "Seuls certains sujets ont été relevés : un auteur, un membre d’équipe, une mention ou un résultat d’un autre sujet ouvre la fiche relevée de sa rubrique (sur mobile, seule la fiche de Leïla Mansour l’a été parmi les personnes) ; dans les listes, seules les cartes des sujets relevés ont une zone, sauf sur la dernière page, où les cartes placées comme elles ouvrent la fiche relevée ; les rubriques de ft_transcendence ouvrent celles de minishell, celles d’Inès Morel et de Noé Laurent celles de Leïla Mansour. Une fenêtre n’a été relevée que sur une page : ouverte ailleurs, elle montre cette page en dessous (Signaler, Envoyer un message, Autour du campus, la visionneuse, la recherche) ; « Où veux-tu aller ? », relevé sur Explorer, mène à Explorer même depuis une liste, que le site filtre. Les fenêtres et onglets que le relevé n’a pas en membre ouvrent leur écran relevé en visiteur. Sur mobile, les rubriques Médias et Commentaires d’une chronique n’ont pas d’entrée : le sélecteur ouvert n’a pas été relevé. Le dé d’une fiche mène à l’autre fiche relevée de sa rubrique (ft_transcendence et minishell ; sur ordinateur, aussi les fiches profil relevées), et n’a pas de zone s’il n’y en a pas. Seules l’option de tri en cours et « Mes favoris uniquement » (projets) ont une zone ; « Affichage » passe directement à l’autre vue ; l’affichage, le tri et la pagination des chroniques n’en ont pas. Le panneau de la recherche ne défile pas. Dans le parcours anglais, les étapes de scan et l’ouverture du globe reprennent les cadres français, et l’arrivée alterne anglais et arabe. L’attente du globe, l’écran d’erreur et l’aperçu « sans globe » restent hors des parcours, Figma ne choisissant pas seul entre deux suites, ainsi que la fiche campus de 42 Mulhouse, dont l’entrée n’a pas été relevée."],
        ['Ce que Figma ne reproduit pas', "Le globe est une image vectorielle figée : rotation, zoom Monde → Pays → Campus, vols et rues détaillées restent propres au site. Les animations sont montrées par étapes. La saturation du verre (saturate(1.15)) n’a pas d’équivalent : le shader préparé reste refusé par Figma. Le lissage des lettres, l’anticrénelage, le flou un peu moins étalé que celui de Chrome et le tramage des dégradés laissent de petits écarts, mesurés lors des comparaisons au site. Les connexions, publications et votes restent simulés, comme dans le prototype."],
        ['Conservation', "Rien n’est supprimé des explorations précédentes : la page Archives garde les essais remplacés, et le fichier d’explorations reste intact. Ce fichier donne l’état actuel du site, rangé."],
    ]
    code = GUIDE % {'page': led['pages']['Guide de lecture'], 'blocks': json.dumps([[fr_spaces(a), fr_spaces(b)] for a, b in blocks], ensure_ascii=False)}
    code = guard_spaces(code)
    f = CALLS / ('%03d-guide.js' % next_index()); f.write_text(code); print(f.name, len(code))


FOUNDATIONS = COMMON + r"""const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
for (const old of page.children.filter(n => ['Couleurs', 'Typographie'].includes(n.name))) old.remove();
const col = await figma.variables.getVariableCollectionByIdAsync('%(coll)s');
const light = col.modes.find(m => m.name === 'Clair').modeId, darkMode = col.modes.find(m => m.name === 'Sombre').modeId;
const CSS = %(css)s, ORDER = %(order)s;
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
text(f, %(intro)s, 20, 'Regular', 'Rôles/muted', 1600, 32);
let n = 0;
for (const g of keys) {
  const b = column(f, 20); b.layoutSizingHorizontal = 'FILL';
  text(b, (%(labels)s)[g] || g, 30, 'Medium', 'Rôles/text', 1600, 40);
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
const SG = %(style_order)s;
const gi = s => { const i = SG.indexOf(s.name.split('/')[0]); return i < 0 ? 99 : i; };
styles.sort((a, b) => gi(a) - gi(b) || b.fontSize - a.fontSize || a.name.localeCompare(b.name));
const ts = section('Typographie', sec.y + sec.height + 200);
const t = figma.createAutoLayout('VERTICAL', { itemSpacing: 36 }); ts.appendChild(t); t.name = 'Typographie';
t.paddingTop = t.paddingBottom = 120; t.paddingLeft = t.paddingRight = 160; t.fills = [paint('Rôles/bg')];
t.resize(1920, 100); t.counterAxisSizingMode = 'FIXED'; t.primaryAxisSizingMode = 'AUTO'; t.x = 80; t.y = 80;
text(t, 'Typographie', 56, 'Medium', 'Rôles/text', 1600, 68);
text(t, %(type_intro)s, 20, 'Regular', 'Rôles/muted', 1600, 32);
const SAMPLE = %(samples)s;
for (const s of styles) {
  const row = figma.createAutoLayout('HORIZONTAL', { itemSpacing: 40 }); t.appendChild(row); row.fills = []; row.name = s.name;
  row.layoutSizingHorizontal = 'FILL'; row.counterAxisAlignItems = 'CENTER';
  const meta = column(row, 6); meta.resize(360, 10); meta.counterAxisSizingMode = 'FIXED'; meta.primaryAxisSizingMode = 'AUTO';
  text(meta, s.name, 16, 'Medium', 'Rôles/text', 360, 22);
  const lh = s.lineHeight.unit === 'PIXELS' ? Math.round(s.lineHeight.value * 100) / 100 + ' px' : s.lineHeight.unit === 'PERCENT' ? Math.round(s.lineHeight.value) + ' %%' : 'auto';
  const ls = s.letterSpacing && s.letterSpacing.value ? ' · espacement ' + Math.round(s.letterSpacing.value * 100) / 100 + (s.letterSpacing.unit === 'PIXELS' ? ' px' : ' %%') : '';
  text(meta, s.fontName.family + ' ' + s.fontName.style + ' · ' + Math.round(s.fontSize * 100) / 100 + ' px · interligne ' + lh + ls, 13, 'Regular', 'Rôles/muted', 360, 18);
  const sp = figma.createText(); row.appendChild(sp); sp.fontName = { family: 'Jost', style: 'Regular' };
  sp.characters = SAMPLE[s.name.split('/')[0]] || SAMPLE[''];
  await sp.setTextStyleIdAsync(s.id); sp.fills = [paint('Rôles/text')];
  sp.textAutoResize = 'HEIGHT'; sp.resize(1200, sp.height); sp.name = 'Exemple';
}
ts.resizeWithoutConstraints(t.width + 160, t.height + 160);
return { colours: n, groups: keys.length, styles: styles.length, ids: { light: f.id, dark: d.id, type: t.id, sections: [sec.id, ts.id] } };"""


def foundations():
    from figlib import figma_var_name
    led = json.loads(LEDGER.read_text())
    css = {figma_var_name(c): c for c, _l, _d in json.loads((LEDGER.parent / 'css-color-vars.json').read_text())}
    order = ['Rôles', 'Primitives', 'Contrôles', 'Contenus', 'Verre lisible', 'Chaleur', 'Horizon', 'Autres', 'Globe',
             'dérivées/fond', 'dérivées/texte', 'dérivées/icône', 'dérivées/bordure', 'dérivées/ombre', 'dérivées/dégradé']
    labels = {'Rôles': 'Rôles du thème (--h42-color-…)', 'Primitives': 'Primitives de la marque (--h42-…)', 'Contrôles': 'Contrôles (--control-…)',
              'Contenus': 'Contenus (--cp-…)', 'Verre lisible': 'Verre lisible (--readable-…)', 'Chaleur': 'Chaleur (--warm-…)', 'Horizon': 'Horizon (--horizon-…)',
              'Autres': 'Autres propriétés CSS', 'Globe': 'Globe (codées dans globe-style.mjs)',
              'dérivées/fond': 'Dérivées · fonds', 'dérivées/texte': 'Dérivées · textes', 'dérivées/icône': 'Dérivées · icônes',
              'dérivées/bordure': 'Dérivées · bordures', 'dérivées/ombre': 'Dérivées · ombres', 'dérivées/dégradé': 'Dérivées · dégradés'}
    intro = ('Variables de la collection « 42 · Couleurs », en mode Clair à gauche et en mode Sombre à droite (le même cadre, mode changé). '
             'Les noms reprennent les propriétés CSS du prototype actif. « Dérivées » regroupe les couleurs peintes sans propriété dédiée '
             '(mélanges, ombres, arrêts de dégradé), nommées par leurs valeurs claire et sombre relevées sur le même élément.')
    type_intro = ('Styles de texte créés pendant la reconstruction, d’après les styles calculés du site : un style par combinaison de police, '
                  'graisse, taille et interligne, rangé par rôle. Les textes des maquettes y sont liés.')
    samples = {'Arabe': 'أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ', 'Code': '0x2A · 101010 · 42',
               '': 'Beyond the code — Explorer, Projets, Profils · 0123456789'}
    code = FOUNDATIONS % {'page': led['pages']['Fondations'], 'coll': led['collections']['42 · Couleurs']['id'],
                          'css': json.dumps(css, ensure_ascii=False), 'order': json.dumps(order, ensure_ascii=False),
                          'labels': json.dumps(labels, ensure_ascii=False), 'intro': json.dumps(intro, ensure_ascii=False),
                          'type_intro': json.dumps(type_intro, ensure_ascii=False),
                          'style_order': json.dumps(['Titres', 'Sous-titres', 'Corps', 'Libellés', 'Petits', 'Arabe', 'Code'], ensure_ascii=False),
                          'samples': json.dumps(samples, ensure_ascii=False)}
    f = CALLS / ('%03d-fondations.js' % next_index()); f.write_text(code); print(f.name, len(code))


# 19 Oct.: the « Typographie » section alone, in place (the colours are not redrawn): every local text style, grouped by
# role, the 11 « chiffres tabulaires » styles with a specimen in figures
TYPOGRAPHY = COMMON + r"""const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
const old = page.children.find(n => n.type === 'SECTION' && n.name === 'Typographie');
const at = old ? { x: old.x, y: old.y } : { x: 0, y: Math.max(0, ...page.children.map(n => n.y + n.height)) + 200 };
if (old) old.remove();
const styles = await figma.getLocalTextStylesAsync();
const fonts = {}; for (const s of styles) fonts[JSON.stringify(s.fontName)] = s.fontName;
await Promise.all(Object.values(fonts).map(x => figma.loadFontAsync(x)));
const SG = %(style_order)s;
const groupOf = s => s.name.split('/')[0];
const gi = g => { const i = SG.indexOf(g); return i < 0 ? 99 : i; };
styles.sort((a, b) => gi(groupOf(a)) - gi(groupOf(b)) || groupOf(a).localeCompare(groupOf(b)) || b.fontSize - a.fontSize || a.name.localeCompare(b.name));
const ts = figma.createSection(); page.appendChild(ts); ts.name = 'Typographie'; ts.x = at.x; ts.y = at.y;
const t = figma.createAutoLayout('VERTICAL', { itemSpacing: 36 }); ts.appendChild(t); t.name = 'Typographie';
t.paddingTop = t.paddingBottom = 120; t.paddingLeft = t.paddingRight = 160; t.fills = [paint('Rôles/bg')];
t.resize(1920, 100); t.counterAxisSizingMode = 'FIXED'; t.primaryAxisSizingMode = 'AUTO'; t.x = 80; t.y = 80;
text(t, 'Typographie', 56, 'Medium', 'Rôles/text', 1600, 68);
text(t, %(type_intro)s.replace('%%n', String(styles.length)), 20, 'Regular', 'Rôles/muted', 1600, 32);
const SAMPLE = %(samples)s, TAB = %(tab_sample)s;
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
    const lh = s.lineHeight.unit === 'PIXELS' ? Math.round(s.lineHeight.value * 100) / 100 + ' px' : s.lineHeight.unit === 'PERCENT' ? Math.round(s.lineHeight.value) + ' %%' : 'auto';
    const ls = s.letterSpacing && s.letterSpacing.value ? ' · espacement ' + Math.round(s.letterSpacing.value * 100) / 100 + (s.letterSpacing.unit === 'PIXELS' ? ' px' : ' %%') : '';
    text(meta, s.fontName.family + ' ' + s.fontName.style + ' · ' + Math.round(s.fontSize * 100) / 100 + ' px · interligne ' + lh + ls + (isTab ? ' · chiffres tabulaires' : ''), 13, 'Regular', 'Rôles/muted', 360, 18);
    const sp = figma.createText(); row.appendChild(sp); sp.fontName = { family: 'Jost', style: 'Regular' };
    sp.characters = UN(isTab ? TAB : (SAMPLE[g] || SAMPLE['']));
    await sp.setTextStyleIdAsync(s.id); sp.fills = [paint('Rôles/text')];
    sp.textAutoResize = 'HEIGHT'; sp.resize(1200, sp.height); sp.name = 'Exemple';
    n++; if (isTab) tab++;
  }
}
ts.resizeWithoutConstraints(t.width + 160, t.height + 160);
return { styles: n, tabular: tab, groups: Object.keys(groups).map(g => g + ' ' + groups[g].length), ids: { section: ts.id, board: t.id }, at };"""


def typography():
    led = json.loads(LEDGER.read_text())
    type_intro = ('Les %n styles de texte du fichier, créés pendant la reconstruction d’après les styles calculés du site : un style par '
                  'combinaison de police, graisse, taille, interligne et interlettrage, rangé par rôle. Les textes des maquettes y sont liés. Les styles '
                  'dont le nom finit par « chiffres tabulaires » reprennent « font-variant-numeric: tabular-nums » du site : leurs chiffres '
                  'ont tous la même largeur (dans Figma : Details → Numbers → « Monospace », option cochée à la main dans chacun, que '
                  'l’API de Figma ne sait pas activer).')
    samples = {'Arabe': 'أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ', 'Code': '0x2A · 101010 · 42',
               '': 'Beyond the code — Explorer, Projets, Profils · 0123456789'}
    code = TYPOGRAPHY % {'page': led['pages']['Fondations'],
                         'style_order': json.dumps(['Titres', 'Sous-titres', 'Corps', 'Libellés', 'Petits', 'Arabe', 'Code'], ensure_ascii=False),
                         'type_intro': json.dumps(fr_spaces(type_intro), ensure_ascii=False), 'samples': json.dumps(samples, ensure_ascii=False),
                         'tab_sample': json.dumps('2024 · 1111 · 0000 · 1 / 2 · 13 / 42', ensure_ascii=False)}
    code = guard_spaces(code)
    f = CALLS / ('%03d-typographie.js' % next_index()); f.write_text(code); print(f.name, len(code))


# 19 Oct.: documentation of the « Composants » page (user's choice: the 22 families documented, no new component): a note
# at the head of the page, a note in each section (title, description; the set moves under it), the description of each
# set, then the sections stacked again as 1423 / 1742 did (by category, then by name, 160 px apart, below the note)
COMPONENTS_DOC = COMMON + r"""const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
const F = %(families)s;
const out = { sections: {}, sets: {}, missing: [] };
const note = (sec, title, body, x) => {
  for (const old of sec.children.filter(n => n.type === 'TEXT' && n.name.startsWith('Note · '))) old.remove();
  const t = text(sec, title, 40, 'Medium', 'Rôles/text'); t.name = 'Note · titre'; t.x = x; t.y = 48;
  const d = text(sec, body, 18, 'Regular', 'Rôles/muted', 1200, 28); d.name = 'Note · description'; d.x = x; d.y = 108;
  return d.y + d.height;
};
let intro = page.children.find(n => n.type === 'SECTION' && n.name === 'À lire · Composants');
if (!intro) { intro = figma.createSection(); page.appendChild(intro); intro.name = 'À lire · Composants'; }
const ib = note(intro, 'Composants', %(intro)s, 40);
intro.resizeWithoutConstraints(1280, ib + 64);
for (const f of F) {
  const sec = await figma.getNodeByIdAsync(f.section), set = await figma.getNodeByIdAsync(f.set);
  if (!sec || !set) { out.missing.push(f.key); continue; }
  const bottom = note(sec, f.name, f.text, 40);
  set.x = 40; set.y = Math.ceil(bottom + 48);
  set.description = UN(f.text + '\n\n' + %(method)s);
  sec.resizeWithoutConstraints(Math.max(1280, set.x + set.width + 40), set.y + set.height + 40);
  out.sections[f.key] = [sec.id, Math.round(sec.height)]; out.sets[f.key] = set.id;
}
const ORDER = ['Marque/', 'En-tête/', 'Navigation/', 'Commandes/', 'Listes/', 'Cartes/'];
const rank = s => { const i = ORDER.findIndex(p => s.name.startsWith(p)); return i < 0 ? ORDER.length : i; };
const secs = page.children.filter(n => n.type === 'SECTION' && n !== intro).sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'fr'));
let y = 160;
intro.x = 0; intro.y = y; y += Math.ceil(intro.height) + 160;
const order = ['À lire · Composants @160'];
for (const s of secs) { s.x = 0; s.y = y; order.push(s.name + ' @' + y); y += Math.ceil(s.height) + 160; }
out.order = order; out.intro = intro.id;
out.others = page.children.filter(n => n.type !== 'SECTION').map(n => n.type + ' ' + n.id + ' ' + n.name);
return out;"""

# what each family is on the site (19 Oct.): the role, from the site map (site-map-data.js) and the CSS of the active
# prototype; the properties and the number of uses are added by components_doc()
FAMILY_ROLES = {
    'marque': 'Marque 42 Horizon : le logo de l’en-tête ({sel}). Il ramène à Explorer en gardant le filtre ; sur 42 Awards, le mot HORIZON devient AWARDS.',
    'bouton-compte': 'Bouton du compte : en haut à droite ({sel}), une icône en visiteur, l’avatar en membre. Il ouvre le panneau du compte.',
    'capsule-recherche': 'Capsule de recherche : le bouton posé au-dessus du menu du bas qui ouvre la recherche ({sel}). La recherche porte sur tout Horizon (campus, projets, profils, chroniques) ; elle est masquée sur 42 Awards.',
    'de': 'Dé : à côté de la recherche ({sel}), il tire au sort dans la rubrique en cours en respectant le filtre et les favoris ; grisé s’il n’y a rien d’autre à tirer, masqué sur 42 Awards.',
    'fil': 'Fil géographique : la barre de portée ({sel}), sur Explorer et en tête des listes. Elle montre le filtre en cours (Monde, pays, campus) et ouvre « Où veux-tu aller ? ».',
    'menu-du-bas': 'Menu du bas : la navigation principale ({sel}), présente sur chaque page après l’entrée, fiches et 42 Awards compris. Ses cinq boutons (Explorer, Projets, Profils, Chroniques, 42 Awards) ouvrent la liste de la rubrique, page 1, en gardant le filtre Pays / Campus ; celui de la rubrique en cours ne fait rien.',
    'remonter': 'Remonter en haut : le bouton des petits écrans, 840 px et moins ({sel}), qui ramène en haut de la même page.',
    'retour': 'Bouton Retour : en tête des fiches ({sel}), il ramène à la liste. Les fiches relevées ont été ouvertes par un lien direct : leur bouton affiche « Retour aux projets », « Retour aux profils » ou « Retour aux chroniques » ; sur le site, d’autres libellés dépendent de l’origine de la visite (« Retour au profil »…).',
    'declencheur': 'Bouton de la barre d’outils : les commandes au-dessus des listes et des commentaires, comme Trier, Filtrer ou Affichage ({sel}).',
    'favori': 'Favori : le bouton qui ajoute un projet, un profil ou une chronique aux favoris ({sel}). Style Compact : l’icône seule ; Libellé : avec le mot.',
    'signaler': 'Signaler : le bouton des fiches qui ouvre la fenêtre « Signaler » ({sel}).',
    'pagination-lien': 'Lien de pagination : un bouton de la pagination des listes ({sel}), numéro de page, Précédent ou Suivant.',
    'pagination': 'Pagination : la barre de pages au bas des listes de projets, de profils et de chroniques ({sel}). Ses boutons sont des instances de « Listes/Lien de pagination ».',
    'autres-auteurs': 'Autres auteurs (+N) : la pastille qui compte les auteurs supplémentaires d’une carte ({sel}).',
    'carte|Projets': 'Carte de projet ({sel}) : une variante par projet et par langue ; « Carte » reprend son titre.',
    'carte|Profils': 'Carte de profil ({sel}) : une variante par profil fictif et par langue. Ses années et ses nombres sont en chiffres tabulaires (styles « … · chiffres tabulaires »).',
    'carte|Chroniques': 'Carte de chronique ({sel}) : une variante par chronique et par langue. Le nom d’une variante ne peut pas contenir de virgule : « Autour d’un bug, une conversation » y devient « Autour d’un bug  une conversation ».',
}


def components_doc():
    """calls/<n>-composants-documentation.js: notes and descriptions of the 22 families (19 Oct.)."""
    import glob, os
    from components import SELECTORS, base_key
    led = json.loads(LEDGER.read_text())
    lib = led['components']['library']
    base = LEDGER.parent
    # uses: instances (« C » nodes at any depth outside the main components) in the scenes of the light frames of the plans
    key2page = {}
    for p in glob.glob(str(base / 'layouts' / '*.json')):
        lay = json.loads(pathlib.Path(p).read_text())
        for s in lay['sections']:
            for r in s['rows']:
                for f in r:
                    if f['theme'] == 'light':
                        key2page[(lay.get('area', lay['key']), f['state'], f['fmt'], f['lang'])] = lay['page']
    uses, frames = {}, {}
    def walk(n, fk):
        if n.get('t') == 'C':
            uses[n['c']] = uses.get(n['c'], 0) + 1; frames.setdefault(n['c'], set()).add(fk)
        for c in n.get('ch') or []:
            walk(c, fk)
    for fk in key2page:
        sp = base / 'scenes' / ('%s--%s--%s--%s.json' % fk)
        if sp.exists():
            for c in json.loads(sp.read_text()).get('ch') or []:
                walk(c, fk)
    nested = {'autres-auteurs': 'les cartes de projets et de chroniques', 'pagination-lien': 'les variantes de « Listes/Pagination »'}
    fams = []
    for key, v in lib.items():
        role_key = key if key in FAMILY_ROLES else 'carte|' + key.split('|', 1)[1].split(' · ')[0]
        text = FAMILY_ROLES[role_key].format(sel=SELECTORS[base_key(key)])
        if key in ('carte|Projets · Mobile', 'carte|Projets · Ordinateur'):
            text += ' Quatre titres y sont coupés à 40 caractères (components.py).'
        n = len(v['variants'])
        if key in nested:
            use = 'Employé%s dans %s, en instances imbriquées.' % ('e' if key == 'autres-auteurs' else '', nested[key])
        else:
            pages = sorted({key2page[fk] for fk in frames.get(key, ())})
            use = '%d occurrence%s dans %d cadre%s clair%s (%s) et dans leurs cadres sombres.' % (
                uses.get(key, 0), 's' if uses.get(key, 0) > 1 else '', len(frames.get(key, ())), 's' if len(frames.get(key, ())) > 1 else '',
                's' if len(frames.get(key, ())) > 1 else '', ', '.join(p.split(' · ', 1)[1] for p in pages))
        fams.append({'key': key, 'name': v['name'], 'set': v['set'], 'section': v['section'],
                     'text': '%s\n%d variante%s. %s' % (text, n, 's' if n > 1 else '', use)})
    intro = ('Les éléments répétés du site, rangés par catégorie : Marque, En-tête, Navigation, Commandes, Listes, Cartes. %d familles, %d variantes. '
             'Chaque famille reprend un élément du prototype actif ; son sélecteur CSS figure dans sa note et dans la description du composant.\n'
             'Chaque variante est une occurrence relevée telle quelle sur un écran et construite par le même moteur que les écrans. Dans un écran, '
             'une occurrence devient une instance seulement si elle est identique à une variante, au dixième de pixel près, couleurs, effets et textes '
             'des trois langues compris. Sinon, elle reste en calques à plat ; c’est le cas, par exemple, d’un verre placé sous le voile flouté d’une fenêtre.\n'
             'Propriétés communes : Format (Ordinateur, Mobile, et les petits écrans de 320 et 300 px), Direction (LTR ; RTL pour l’arabe) et Version '
             '(occurrences d’un même élément qui diffèrent légèrement, numérotées dans l’ordre des écrans relevés). Les couleurs suivent le mode de '
             '« 42 · Couleurs » (Clair, Sombre), les textes celui de « 42 · Textes » (Français, English, العربية) : une variante prend le thème et la '
             'langue du cadre où elle est posée, sauf celles relevées sur un écran arabe ou sur une capture sombre, qui gardent les leurs.\n'
             'Les emplois sont comptés dans les cadres clairs des pages 01 à 08.') % (len(fams), sum(len(v['variants']) for v in lib.values()))
    method = ('Variantes : occurrences relevées telles quelles sur les écrans et construites par le même moteur ; dans un écran, une occurrence '
              'devient une instance seulement si elle est identique à une variante (au 0,1 px près, couleurs, effets et textes des trois langues '
              'compris), sinon elle reste à plat.')
    code = COMPONENTS_DOC % {'page': led['pages']['Composants'], 'families': json.dumps([dict(x, text=fr_spaces(x['text'])) for x in fams], ensure_ascii=False),
                             'intro': json.dumps(fr_spaces(intro), ensure_ascii=False), 'method': json.dumps(fr_spaces(method), ensure_ascii=False)}
    code = guard_spaces(code)
    f = CALLS / ('%03d-composants-documentation.js' % next_index()); f.write_text(code); print(f.name, len(code), len(fams), 'familles')


if __name__ == '__main__':
    {'cover': cover, 'guide': guide, 'foundations': foundations, 'typography': typography, 'components': components_doc}[sys.argv[1]]()
