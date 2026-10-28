// Trial loader for the design-review studies (14 Oct 2026).
// Runs before the baseline's theme bootstrap. Nothing is active unless the URL
// lists trials: ?essais=id1,id2. Optional ?theme=light|dark|system and
// ?lang=fr|en|ar let the gallery open both sides of a comparison identically.
(() => {
 const VERSION = '1';
 // Canonical order = stylesheet order when several trials are combined.
 const ORDER = Object.freeze([
  // Explorer et globe
  'globe-espace-libre', 'textes-sur-pastilles', 'police-etiquettes-globe', 'titre-fiche-campus',
  // Pile flottante et petits écrans
  'recherche-repliee', 'voile-pile-basse', 'une-colonne-320', 'deux-colonnes-allegees',
  // Couleurs, thème sombre et illustrations
  'illustrations-sombres', 'illustrations-attenuees', 'roles-couleur', 'visiter-contour-sombre', 'illustrations-variees',
  // Typographie, lisibilité et pages
  'lisibilite-textes', 'titres-marque', 'titres-forts', 'echelle-unifiee', 'pseudo-manquant', 'awards-a-venir',
 ]);
 // Trials that must act before the baseline draws (fonts, canvas): they provide early.js,
 // a classic script inserted before the baseline modules run.
 const EARLY = Object.freeze(['titres-marque', 'titres-forts', 'echelle-unifiee']);
 // Alternatives to the same problem: the first one listed in the URL wins.
 const EXCLUSIVE = Object.freeze([
  ['une-colonne-320', 'deux-colonnes-allegees'],
  ['illustrations-sombres', 'illustrations-attenuees'],
 ]);
 const params = new URLSearchParams(location.search);
 const asked = (params.get('essais') || '').split(',').map(value => value.trim()).filter(Boolean);
 const ignored = [];
 let active = ORDER.filter(id => asked.includes(id));
 for (const group of EXCLUSIVE) {
  const present = asked.filter(id => group.includes(id));
  for (const id of present.slice(1)) { active = active.filter(item => item !== id); ignored.push(id); }
 }
 const root = document.documentElement;
 root.dataset.essais = active.join(' ');
 window.horizonEssais = Object.freeze({ version: VERSION, order: ORDER, early: EARLY, active: Object.freeze(active), ignored: Object.freeze(ignored), has: id => active.includes(id) });
 const theme = params.get('theme');
 if (['light', 'dark', 'system'].includes(theme)) {
  try { localStorage.setItem('horizon-design-review-studies-20261014-theme-preference-v1', theme); } catch { /* The study still opens with its saved theme. */ }
 }
})();
