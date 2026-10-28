// Trial loader of the version B filter study (26 Oct 2026), first part.
// Runs at the top of the copy's head, before its theme bootstrap. Nothing is applied unless the URL lists trials:
// ?essais=id1,id2. Optional ?theme=light|dark|system and ?lang=fr|en|ar open the copy in that theme and language, so
// that the gallery opens both sides of a comparison identically (the language is applied by modules.mjs).
// Each asked trial's manifest (essais/<id>/essai.js) is written here, so that every manifest has run before
// styles.js, at the end of the head, writes the trial stylesheets and the import map of the replaced modules.
(() => {
 const VERSION = '1';
 // Canonical order: stylesheets, module replacements and modules of combined trials follow it.
 const ORDER = Object.freeze(['chiffres-dans-le-filtre', 'filtre-plus-court', 'chemin-en-etapes', 'texte-centre']);
 // Fixtures of the loader itself, never shown in the gallery (essais/_controle/README.md).
 const FIXTURES = Object.freeze(['_controle']);
 // The copy's storage keys all start with this prefix (snapshot.py): nothing is shared with site-b.
 const STORAGE_PREFIX = 'horizon-explorer-b-filter-studies-20261026-';
 const params = new URLSearchParams(location.search);
 const asked = (params.get('essais') || '').split(',').map(value => value.trim()).filter(Boolean);
 const known = [...ORDER, ...FIXTURES];
 const requested = Object.freeze(known.filter(id => asked.includes(id)));
 const ignored = Object.freeze(asked.filter(id => !known.includes(id)));
 // One token per page load keeps the trial files fresh while their authors edit them (the local server sends no
 // cache headers); the copy's own files keep their ?v= keys.
 const token = Date.now().toString(36);
 const manifests = new Map();
 const flag = value => value === true;
 const study = {
  version: VERSION, order: ORDER, fixtures: FIXTURES, storagePrefix: STORAGE_PREFIX, token, requested, ignored, manifests,
  // Filled by styles.js: the trials whose manifest has run, in the canonical order, and the replacements kept.
  active: Object.freeze([]), replacements: Object.freeze({}), conflicts: [],
  has: id => study.active.includes(id),
  // Absolute URL of a file of a trial folder, with this load's token.
  trialURL: (id, file) => new URL(`../essais/${id}/${file}?v=${token}`, document.baseURI).href,
  // Called once by each trial's essai.js; see NOTES.md, « Le chargeur des essais ».
  declare(manifest) {
   const id = manifest?.id;
   if (!requested.includes(id) || manifests.has(id)) return;
   manifests.set(id, Object.freeze({
    id, titre: String(manifest.titre || id), resume: String(manifest.resume || ''),
    styles: flag(manifest.styles), module: flag(manifest.module),
    remplace: Object.freeze(Array.isArray(manifest.remplace) ? manifest.remplace.filter(name => typeof name === 'string' && name) : []),
   }));
  },
 };
 window.horizonEssais = study;
 document.documentElement.dataset.essais = requested.join(' ');
 const theme = params.get('theme');
 if (['light', 'dark', 'system'].includes(theme)) {
  try { localStorage.setItem(STORAGE_PREFIX + 'theme-preference-v1', theme); } catch { /* The copy still opens with its saved theme. */ }
 }
 for (const id of requested) document.write(`<script src="../essais/${id}/essai.js?v=${token}"><\/script>`);
})();
