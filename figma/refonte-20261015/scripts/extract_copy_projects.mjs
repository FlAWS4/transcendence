// Interface copy of the Projects zone, read from the prototype's source (read-only), for the Figma rebuild of 15 Oct 2026.
// Writes ../copy-projects.json as {"key": {"fr": "…", "en": "…", "ar": "…", "where": "…"}}.
// Named literals (copy dictionaries) are located in each module and evaluated alone in an empty VM context; inline
// strings of welcome.mjs / profile-ui.mjs that are not in a dictionary are located by an exact source excerpt, so a
// changed prototype makes this script fail instead of writing stale text.
// Usage: node figma/refonte-20261015/scripts/extract_copy_projects.mjs
import {readFileSync, writeFileSync} from 'node:fs';
import vm from 'node:vm';

const proto = new URL('../../../site/', import.meta.url);
const out = new URL('../copy-projects.json', import.meta.url);
const sources = new Map();
const source = file => {
 if (!sources.has(file)) sources.set(file, readFileSync(new URL(file, proto), 'utf8'));
 return sources.get(file);
};

// Balanced extraction of the literal that follows `const NAME=` (strings, template literals and escapes respected).
function literal(file, name) {
 const src = source(file);
 const match = new RegExp('(?:^|[\\s;,(])(?:export\\s+)?(?:const|let|var)\\s+' + name + '\\s*=\\s*').exec(src);
 if (!match) throw new Error(`${file}: literal ${name} not found`);
 let start = match.index + match[0].length;
 const wrapper = src.startsWith('Object.freeze(', start) ? 'Object.freeze(' : '';
 const open = start + wrapper.length;
 if (!'{['.includes(src[open])) throw new Error(`${file}: ${name} is not an object or array literal`);
 let depth = 0, quote = null;
 for (let i = open; i < src.length; i++) {
  const c = src[i];
  if (quote) { if (c === '\\') { i++; continue; } if (c === quote) quote = null; continue; }
  if (c === '\'' || c === '"' || c === '`') { quote = c; continue; }
  if (c === '{' || c === '[') depth++;
  else if (c === '}' || c === ']') { depth--; if (depth === 0) return vm.runInNewContext('(' + wrapper + src.slice(open, i + 1) + (wrapper ? ')' : '') + ')', {Object}); }
 }
 throw new Error(`${file}: unbalanced literal ${name}`);
}

// Exact inline strings: the excerpt must be present verbatim in the source.
function present(file, excerpt) {
 if (!source(file).includes(excerpt)) throw new Error(`${file}: excerpt not found: ${excerpt.slice(0, 80)}`);
 return true;
}
function inline(file, excerpt) {
 if (!source(file).includes(excerpt)) throw new Error(`${file}: excerpt not found: ${excerpt.slice(0, 80)}`);
 return vm.runInNewContext('(' + excerpt + ')', {});
}

const entries = {};
const add = (key, value, where) => {
 if (entries[key]) throw new Error('duplicate key ' + key);
 entries[key] = {fr: value.fr ?? '', en: value.en ?? '', ar: value.ar ?? '', where};
};
// {fr:{k:…},en:{k:…},ar:{k:…}} → one entry per key (nested objects flattened with a dot).
function byLocale(prefix, dictionary, where, {only, describe = {}} = {}) {
 const keys = new Set(Object.keys(dictionary.fr || {}).concat(Object.keys(dictionary.en || {}), Object.keys(dictionary.ar || {})));
 for (const key of keys) {
  if (only && !only.includes(key)) continue;
  const values = {fr: dictionary.fr?.[key], en: dictionary.en?.[key], ar: dictionary.ar?.[key]};
  if ([values.fr, values.en, values.ar].some(value => value && typeof value === 'object')) {
   const inner = {fr: values.fr || {}, en: values.en || {}, ar: values.ar || {}};
   byLocale(prefix + '.' + key, inner, where, {describe: describe[key] || {}});
   continue;
  }
  add(prefix + '.' + key, values, where + (describe[key] ? ' — ' + describe[key] : ''));
 }
}

// ---- project-ui.mjs -------------------------------------------------------------------------------------------
byLocale('project.detail', literal('project-ui.mjs', 'copy'), 'project-ui.mjs `copy` — fiche projet', {describe: {
 test: 'onglet, sélecteur mobile', comments: 'onglet', overview: 'onglet (par défaut)', implementation: 'onglet', media: 'onglet',
 team: 'titre du bloc Équipe (Vue d’ensemble)', about: 'titre de bloc (Vue d’ensemble)', technologies: 'titre de bloc des étiquettes',
 sections: 'nom accessible de la navigation des onglets', inProject: 'légende du sélecteur mobile', back: 'bouton Retour (repli)',
 campus: 'bouton d’action, projet à un seul campus ({campus} = nom du campus)', mediaCaption: 'légende de l’illustration principale',
 mediaNote: 'texte sous la légende de l’illustration', teamIntro: 'non affiché pour les projets (onglet Auteurs des Chroniques)',
 authors: 'libellé au-dessus de l’équipe', noAuthors: 'équipe vide'}});
byLocale('project.mediaButton', literal('project-ui.mjs', 'mediaCopy'), 'project-ui.mjs `mediaCopy` — nom accessible des médias cliquables (suivi de « : titre »)');
byLocale('project.campusChoice', literal('project-ui.mjs', 'campusChoiceCopy'), 'project-ui.mjs `campusChoiceCopy` — écran campus-choice', {describe: {
 explore: 'bouton d’action d’un projet multicampus', title: 'titre de la fenêtre', close: 'bouton texte de fermeture'}});

// ---- content-controls.mjs ---------------------------------------------------------------------------------------
byLocale('list.controls', literal('content-controls.mjs', 'contentControlCopy'), 'content-controls.mjs `contentControlCopy` — barre Affichage/Trier, cœurs, état vide des favoris', {describe: {
 layout: 'bouton Affichage', grid: 'choix', list: 'choix', sort: 'bouton Trier', newest: 'choix de tri', oldest: 'choix de tri', favorites: 'choix de tri',
 favoritesOnly: 'case du panneau Trier', local: 'note du panneau Trier (1re partie)', dates: 'note du panneau Trier (2e partie) et infobulle des dates',
 add: 'nom accessible du cœur (non actif)', remove: 'nom accessible du cœur (actif)', saved: 'libellé du bouton Favoris actif (fiche)',
 save: 'libellé du bouton Favoris (fiche)', savedNotice: 'annonce lecteur d’écran', removedNotice: 'annonce lecteur d’écran',
 emptyTitle: 'titre de l’état vide « Mes favoris uniquement »', emptyText: 'texte de l’état vide', showAll: 'bouton de l’état vide'}});
add('list.controls.categorySelectionCount', {fr: '{n} sélections', en: '{n} selected', ar: '{n} اختيارات'},
 'content-controls.mjs refresh() — repli du libellé de sélection (mode menu, inutilisé par la fenêtre Filtrer)');
present('content-controls.mjs', "{fr:'sélections',en:'selected',ar:'اختيارات'}");

// ---- project-filter-dialog.mjs, content-filters.mjs ------------------------------------------------------------
byLocale('filter.dialog', literal('project-filter-dialog.mjs', 'copy'), 'project-filter-dialog.mjs `copy` — écran filter-projects', {describe: {
 filter: 'bouton de la barre (toujours « Filtrer »)', title: 'titre de la fenêtre', intro: 'texte sous le titre', projects: 'catégorie',
 technologies: 'catégorie (repli si le contrôleur ne fournit pas de libellé)', skills: 'catégorie (repli)', apply: 'bouton principal', cancel: 'bouton',
 reset: 'lien du pied', close: 'nom accessible de la croix', empty: 'catégorie sans choix', all: 'compteur du pied sans sélection',
 selected: 'compteur du pied ({count})', selectedOne: 'compteur du pied (1) — absent en arabe : le modèle {count} est utilisé',
 resetNotice: 'message après Réinitialiser', selectAll: 'bouton collectif', deselectAll: 'bouton collectif quand tout est coché'}});
byLocale('filter.categories', literal('content-filters.mjs', 'copy'), 'content-filters.mjs `copy` — libellés des groupes et options', {
 only: ['technologies', 'skills', 'allCommonCore', 'allSpecialization', 'commonCore', 'specialization', 'personalProjects', 'allProjects'],
 describe: {technologies: 'catégorie de la fenêtre', skills: 'catégorie de la fenêtre (« Savoir-faire »)', allCommonCore: 'libellé collectif (mode menu, non affiché dans la fenêtre)',
  allSpecialization: 'libellé collectif (mode menu, non affiché)', commonCore: 'sous-groupe de Projets', specialization: 'sous-groupe de Projets',
  personalProjects: 'choix direct dans Projets', allProjects: 'option « tous » (mode menu, non affichée)'}});
for (const [id, labels] of Object.entries(literal('content-filters.mjs', 'skillNames'))) add('filter.skill.' + id, labels, 'content-filters.mjs `skillNames` — choix de la catégorie Savoir-faire');
for (const [id, label] of Object.entries(literal('content-filters.mjs', 'technologyNames'))) add('filter.technology.' + id, {fr: label, en: label, ar: label}, 'content-filters.mjs `technologyNames` — choix de la catégorie Technologies (identiques dans les trois langues)');
for (const value of literal('content-filters.mjs', 'validProjectFilters').filter(value => !['all', 'personal'].includes(value))) {
 const label = value === 'born2beroot' ? 'Born2beroot' : value;
 add('filter.projectType.' + value, {fr: label, en: label, ar: label}, 'content-filters.mjs projectFilterOptions() — choix des sous-groupes Tronc commun / Spécialisation (identifiants 42, non traduits)');
}
add('filter.triggerLabel', inline('welcome.mjs', "{fr:'Filtrer',en:'Filter',ar:'تصفية'}"), 'welcome.mjs contentCategoryFilter() — nom de la facette passé au bouton');
add('filter.triggerSelection', {fr: '{n} filtres', en: '{n} filters', ar: '{n} مرشحات'}, 'welcome.mjs contentCategoryFilter() selectionLabel — fourni mais non affiché (le bouton garde « Filtrer »)');
present('welcome.mjs', "{fr:state.project.length+' filtres',en:state.project.length+' filters',ar:state.project.length+' مرشحات'}");

// ---- list page (welcome.mjs) ------------------------------------------------------------------------------------
present('welcome.mjs', "projects:'Projets'"); present('welcome.mjs', "projects:'Projects'"); present('welcome.mjs', "projects:'المشاريع'");
add('list.sectionTitle', {fr: 'Projets', en: 'Projects', ar: 'المشاريع'}, 'welcome.mjs `copy.*.projects` — titre accessible h1 #section-title (masqué visuellement) et libellé du menu du bas');
add('list.count', {fr: '{n} contenus (1 contenu)', en: '{count} stories', ar: 'عدد المحتويات: {count}'},
 'welcome.mjs renderContentView() #content-count — FR construit en code (`${total} contenu${total===1?\'\':\'s\'}`), EN/AR via editorialCopy.count');
const editorial = literal('welcome.mjs', 'editorialCopy');
add('list.countTemplate', {fr: editorial.fr.count, en: editorial.en.count, ar: editorial.ar.count}, 'welcome.mjs `editorialCopy.count` (le FR n’est pas utilisé pour Projets)');
add('list.emptyFiltered.title', inline('welcome.mjs', "{fr:'Aucun résultat avec ces filtres',en:'No results with these filters',ar:'لا توجد نتائج لهذه المرشحات'}"), 'welcome.mjs — état vide quand un filtre est actif');
add('list.emptyFiltered.text', inline('welcome.mjs', "{fr:'Aucun contenu ne correspond à cette combinaison. Essaie un autre choix ou élargis le pays ou le campus.',en:'No content matches this combination. Try another choice or broaden the country or campus.',ar:'لا يطابق أي محتوى هذا الجمع من المرشحات. جرّب اختيارًا آخر أو وسّع نطاق الدولة أو الحرم.'}"), 'welcome.mjs — état vide filtré (texte) ; bouton = libellé de l’option « tous » (filter.categories.allProjects)');
// emptyTitle/emptyText are added to copy.* by Object.assign blocks: read them by exact excerpt.
add('list.emptyScope.title', {fr: 'Pas encore de contenu dans cet aperçu', en: 'No content in this preview yet', ar: 'لا يوجد محتوى في هذا التصوّر بعد'}, 'welcome.mjs copy.emptyTitle — aucun projet dans le pays/campus choisi');
add('list.emptyScope.text', {fr: 'Aucun contenu n’a été ajouté pour ce périmètre du réseau.', en: 'No content has been added for this part of the network.', ar: 'لم يُضف محتوى لهذا النطاق من الشبكة بعد.'}, 'welcome.mjs copy.emptyText');
for (const excerpt of ["emptyTitle:'Pas encore de contenu dans cet aperçu', emptyText:'Aucun contenu n’a été ajouté pour ce périmètre du réseau.'",
 "emptyTitle:'No content in this preview yet', emptyText:'No content has been added for this part of the network.'",
 "emptyTitle:'لا يوجد محتوى في هذا التصوّر بعد', emptyText:'لم يُضف محتوى لهذا النطاق من الشبكة بعد.'"]) if (!source('welcome.mjs').includes(excerpt)) throw new Error('welcome.mjs empty-state excerpt changed');
const discovery = literal('welcome.mjs', 'discoveryCopy');
byLocale('list.discovery', discovery, 'welcome.mjs `discoveryCopy` — nom et infobulle du dé à côté de « Chercher dans Horizon »', {only: ['projects', 'empty', 'current', 'selected'], describe: {
 projects: 'libellé du dé dans Projets', empty: 'suffixe « · … » quand aucun résultat', current: 'suffixe quand le seul résultat est déjà ouvert', selected: 'annonce'}});
const back = inline('welcome.mjs', "{fr:{projects:'Retour aux projets',people:'Retour aux profils',journal:'Retour aux chroniques'},en:{projects:'Back to projects',people:'Back to profiles',journal:'Back to Chronicles'},ar:{projects:'العودة إلى المشاريع',people:'العودة إلى الأعضاء',journal:'العودة إلى حكايات'}}");
add('detail.back.toList', {fr: back.fr.projects, en: back.en.projects, ar: back.ar.projects}, 'welcome.mjs contentBackLabel() — bouton Retour d’une fiche ouverte depuis la liste ou un lien direct');
add('detail.back.toProfileList', {fr: back.fr.people, en: back.en.people, ar: back.ar.people}, 'welcome.mjs contentBackLabel() — fiche projet ouverte depuis la carte d’un profil (« Créé par »)… puis retour');
const backDetail = inline('welcome.mjs', "{fr:{projects:'Retour au projet',people:'Retour au profil',journal:'Retour à l’article'},en:{projects:'Back to the project',people:'Back to the profile',journal:'Back to the article'},ar:{projects:'العودة إلى المشروع',people:'العودة إلى الملف الشخصي',journal:'العودة إلى المقال'}}");
add('detail.back.toProject', {fr: backDetail.fr.projects, en: backDetail.en.projects, ar: backDetail.ar.projects}, 'welcome.mjs contentBackLabel() — fiche ouverte depuis une autre fiche projet');
add('detail.back.toProfile', {fr: backDetail.fr.people, en: backDetail.en.people, ar: backDetail.ar.people}, 'welcome.mjs contentBackLabel() — fiche projet ouverte depuis un profil (onglet Projets)');
add('detail.back.fallback', {fr: editorial.fr.back, en: editorial.en.back, ar: editorial.ar.back}, 'welcome.mjs editorialCopy.back — repli');
present('profile-ui.mjs', "authors:'Créé par'"); present('profile-ui.mjs', "authors:'Created by'"); present('profile-ui.mjs', "authors:'من إعداد'");
add('card.authorsLabel', {fr: 'Créé par', en: 'Created by', ar: 'من إعداد'}, 'profile-ui.mjs copy.authors — libellé des auteurs sur les cartes (la fiche utilise project.detail.authors, même texte)');
const responsibility = literal('profile-ui.mjs', 'authorResponsibilityCopy');
add('card.leadRole', {fr: responsibility.fr.project, en: responsibility.en.project, ar: responsibility.ar.project}, 'profile-ui.mjs `authorResponsibilityCopy.project` — infobulle de la couronne et nom accessible');
add('card.moreAuthors', inline('profile-ui.mjs', "{fr:'Voir les {count} auteurs',en:'View all {count} authors',ar:'عرض جميع الكتّاب ({count})'}"), 'profile-ui.mjs createAuthorByline() — nom accessible et infobulle de la pastille « +N »');
add('card.datesTitle', {fr: literal('content-controls.mjs', 'contentControlCopy').fr.dates, en: literal('content-controls.mjs', 'contentControlCopy').en.dates, ar: literal('content-controls.mjs', 'contentControlCopy').ar.dates}, 'welcome.mjs dateElement() — infobulle (title) de la date des cartes et des fiches ; date au format Intl {day:numeric, month:short, year:numeric}');
present('content-preview.html', 'aria-label="Présentation des contenus"');
add('list.viewGroupLabel', {fr: 'Présentation des contenus', en: '', ar: ''}, 'content-preview.html / index.html — aria-label initial de #content-views, retiré par mountContentControls() (non traduit, n’apparaît plus)');

// ---- pagination ------------------------------------------------------------------------------------------------
byLocale('list.pagination', literal('content-pagination-ui.mjs', 'copy'), 'content-pagination-ui.mjs `copy` — rangée de pagination', {describe: {
 label: 'nom accessible de la navigation', previous: 'nom accessible/infobulle de la flèche', next: 'nom accessible/infobulle de la flèche',
 page: 'nom accessible d’un numéro', summary: 'texte au-dessus des numéros'}});

// ---- comments ---------------------------------------------------------------------------------------------------
byLocale('comments', literal('comments.mjs', 'copy'), 'comments.mjs `copy` — onglet Commentaires', {describe: {
 intro: 'phrase d’introduction', label: 'libellé du champ', placeholder: 'texte indicatif', hint: 'aide sous le champ (3e phrase)', add: 'bouton principal',
 empty: 'titre de l’état vide', first: 'texte de l’état vide', count: 'compteur sous le champ', list: 'nom accessible de la liste',
 reply: 'action sous un commentaire', sendReply: 'bouton du formulaire de réponse', replyTo: 'contexte « En réponse à … »',
 like: 'infobulle du pouce levé', dislike: 'infobulle du pouce baissé', emoji: 'bouton « ☺ Emoji »', draft: 'pastille sur Répondre'}});
byLocale('comments.edit', literal('comments.mjs', 'editingCopy'), 'comments.mjs `editingCopy` — édition et menu ⋮', {describe: {actions: 'nom du bouton ⋮ et du menu', edit: 'entrée du menu ⋮', editedMark: 'mention sous la date'}});
byLocale('comments.author', literal('comments.mjs', 'authorCopy'), 'comments.mjs `authorCopy` — identité locale et mentions', {describe: {
 using: 'aide sous le champ (1re phrase, {name} = Leïla Mansour)', own: '« (vous) » après son nom', mentionHint: 'aide sous le champ (2e phrase)'}});
byLocale('comments.actions', literal('comments.mjs', 'actionCopy'), 'comments.mjs `actionCopy` — menu ⋮ et tri des commentaires', {describe: {
 report: 'entrée du menu ⋮', sort: 'libellé à gauche du tri et nom du bouton', newest: 'choix (affiché dans le bouton)', oldest: 'choix', popular: 'choix'}});
for (const [emoji, fr, en, ar] of literal('comments.mjs', 'emojiOptions')) add('comments.emoji.' + emoji, {fr, en, ar}, 'comments.mjs `emojiOptions` — nom accessible de l’emoji ' + emoji + ' de la palette');
byLocale('comments.mentions', literal('comment-mention-picker.mjs', 'copy'), 'comment-mention-picker.mjs `copy` — suggestions de mention @');

// ---- report, viewer, trial --------------------------------------------------------------------------------------
byLocale('report', literal('content-report.mjs', 'copy'), 'content-report.mjs `copy` — bouton Signaler et écran report', {describe: {
 action: 'libellé du bouton de la fiche', project: 'titre de la fenêtre et nom accessible du bouton', comment: 'titre depuis le menu ⋮',
 intro: 'texte sous le titre', reason: 'libellé du menu déroulant', choose: 'première option', details: 'libellé du champ', placeholder: 'texte indicatif',
 submit: 'bouton principal', saved: 'confirmation', already: 'confirmation d’un doublon'}});
byLocale('viewer', literal('media-viewer.mjs', 'copy'), 'media-viewer.mjs `copy` — écran viewer', {describe: {title: 'titre de la fenêtre', close: 'nom accessible de ×', previous: 'nom de ‹', next: 'nom de ›'}});
byLocale('test', literal('project-trial.mjs', 'copy'), 'project-trial.mjs `copy` — onglet Tester le projet', {describe: {
 repository: 'titre du bloc après enregistrement', open: 'bouton lien externe (+ « ↗ »)', newTab: 'complément du nom accessible', instructions: 'sous-titre h4',
 empty: 'titre de l’état vide', emptyHint: 'texte de l’état vide', add: 'bouton de l’état vide', edit: 'bouton après enregistrement',
 url: 'libellé du champ', urlHint: 'aide du champ', optional: 'libellé du champ', save: 'bouton principal', cancel: 'bouton', remove: 'bouton (si un lien existe)',
 note: 'note en tête du formulaire', invalid: 'erreur', tooLong: 'erreur'}});

// ---- shared -----------------------------------------------------------------------------------------------------
const scroll = inline('detail-scroll.mjs', "{fr:['Faire défiler les rubriques vers le haut','Faire défiler les rubriques vers le bas'],en:['Scroll sections up','Scroll sections down'],ar:['تمرير الأقسام إلى الأعلى','تمرير الأقسام إلى الأسفل']}");
add('detail.menuArrowUp', {fr: scroll.fr[0], en: scroll.en[0], ar: scroll.ar[0]}, 'detail-scroll.mjs — nom de la flèche ↑ du menu des onglets (fenêtres basses)');
add('detail.menuArrowDown', {fr: scroll.fr[1], en: scroll.en[1], ar: scroll.ar[1]}, 'detail-scroll.mjs — nom de la flèche ↓');

const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(out, JSON.stringify({
 _meta: {fr: 'Textes d’interface de la zone Projets, relevés dans le code source du prototype actif (non traduits par l’outil).', en: '', ar: '',
  where: 'figma/refonte-20261015/scripts/extract_copy_projects.mjs, 15 oct. 2026 ; contenus de démonstration (titres, résumés, noms) : voir spec-projects.md § Textes'},
 ...sorted,
}, null, 1) + '\n');
console.log(Object.keys(sorted).length + ' keys written to ' + out.pathname);
