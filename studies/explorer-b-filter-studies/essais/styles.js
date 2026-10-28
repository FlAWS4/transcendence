// Trial loader of the version B filter study (26 Oct 2026), second part.
// Runs at the end of the copy's head: after its last stylesheet, before its module scripts. It settles the active
// trials (those whose manifest has run, in the canonical order), writes their styles.css after every stylesheet of the
// copy, and, when trials replace modules of the copy, one import map that sends the copy's imports of each replaced
// module to the trial's own copy (essais/<id>/<module path>). Written before any module loads, the map applies to
// every import of that module, static or dynamic, on both pages.
(() => {
 const study = window.horizonEssais;
 if (!study) return;
 // Every specifier under which the copy imports each of its modules, relative to baseline/. Generated from the copy
 // by snapshot.py (the « specifiers » of snapshot-manifest.json) and checked by `snapshot.py --verify`.
 const SPECIFIERS = /* specifiers:start */{
  "account-menu.mjs": ["account-menu.mjs?v=5"],
  "author-preview-fit.mjs": ["author-preview-fit.mjs?v=1"],
  "back-to-top.mjs": ["back-to-top.mjs?v=2"],
  "brand-wordmark.mjs": ["brand-wordmark.mjs?v=b7"],
  "campus-website.mjs": ["campus-website.mjs?v=1"],
  "comment-mention-picker.mjs": ["comment-mention-picker.mjs?v=3"],
  "comment-mentions.mjs": ["comment-mentions.mjs?v=2"],
  "comments.mjs": ["comments.mjs?v=17"],
  "content-controls.mjs": ["content-controls.mjs?v=17"],
  "content-filters.mjs": ["content-filters.mjs?v=11", "content-filters.mjs?v=12"],
  "content-geography.mjs": ["content-geography.mjs?v=1", "content-geography.mjs?v=b1"],
  "content-pagination-ui.mjs": ["content-pagination-ui.mjs?v=3"],
  "content-pagination.mjs": ["content-pagination.mjs?v=2"],
  "content-preferences.mjs": ["content-preferences.mjs?v=13"],
  "content-preview-art.mjs": ["content-preview-art.mjs?v=1"],
  "content-preview-data.mjs": ["content-preview-data.mjs?v=11"],
  "content-report.mjs": ["content-report.mjs?v=4"],
  "content-transitions.mjs": ["content-transitions.mjs?v=3"],
  "continents.mjs": ["continents.mjs?v=b1"],
  "decryption/horizon-decryption-engine.mjs": ["decryption/horizon-decryption-engine.mjs"],
  "decryption/scanner-return-random.mjs": ["decryption/scanner-return-random.mjs"],
  "decryption/scanner-return-together.mjs": ["decryption/scanner-return-together.mjs"],
  "decryption/shared.mjs": ["decryption/shared.mjs"],
  "demo-content-expanded.mjs": ["demo-content-expanded.mjs?v=1"],
  "demo-content-seed.mjs": ["demo-content-seed.mjs?v=1"],
  "detail-scroll.mjs": ["detail-scroll.mjs?v=4"],
  "dock-search-data.mjs": ["dock-search-data.mjs?v=8"],
  "dock-search.mjs": ["dock-search.mjs?v=b7"],
  "entrance.mjs": ["entrance.mjs?v=b7"],
  "explorer-art.mjs": ["explorer-art.mjs?v=b2"],
  "explorer-band.mjs": ["explorer-band.mjs?v=b7"],
  "explorer-campus.mjs": ["explorer-campus.mjs?v=b3"],
  "explorer-model.mjs": ["explorer-model.mjs?v=b6"],
  "explorer-selector.mjs": ["explorer-selector.mjs?v=b7"],
  "explorer-shapes.mjs": ["explorer-shapes.mjs?v=b2"],
  "journal-ui.mjs": ["journal-ui.mjs?v=42"],
  "media-viewer.mjs": ["media-viewer.mjs?v=1"],
  "profile-data.mjs": ["profile-data.mjs?v=11"],
  "profile-sections.mjs": ["profile-sections.mjs?v=6"],
  "profile-ui.mjs": ["profile-ui.mjs?v=35"],
  "project-filter-dialog.mjs": ["project-filter-dialog.mjs?v=3"],
  "project-trial.mjs": ["project-trial.mjs?v=4"],
  "project-ui.mjs": ["project-ui.mjs?v=43"],
  "random-campus.mjs": ["random-campus.mjs"],
  "random-discovery.mjs": ["random-discovery.mjs?v=2"],
  "reading-scope.mjs": ["reading-scope.mjs?v=b7"],
  "scope-pill.mjs": ["scope-pill.mjs?v=b7"],
  "scope-popover.mjs": ["scope-popover.mjs?v=2"],
  "scope-selectors.mjs": ["scope-selectors.mjs?v=1"],
  "theme-menu.mjs": ["theme-menu.mjs?v=1"],
  "theme-preferences.mjs": ["theme-preferences.mjs?v=1"],
  "welcome.mjs": ["welcome.mjs?v=b7"]
 }/* specifiers:end */;
 // welcome.mjs is index.html's own module script, which an import map cannot redirect: replacing it would only
 // change content-preview.html.
 const FIXED = Object.freeze(['welcome.mjs']);
 const active = study.requested.filter(id => study.manifests.has(id));
 for (const id of study.requested) if (!study.manifests.has(id)) console.error(`[essais] ${id}: essais/${id}/essai.js did not declare the trial`);
 const owners = new Map(), imports = {};
 for (const id of active) {
  for (const module of study.manifests.get(id).remplace) {
   if (!Object.hasOwn(SPECIFIERS, module) || FIXED.includes(module)) { console.error(`[essais] ${id}: ${module} is not a module the copy imports and can be replaced`); continue; }
   // Two trials replacing the same module: the first one in the canonical order keeps it.
   if (owners.has(module)) { study.conflicts.push({ module, kept: owners.get(module), ignored: id }); console.warn(`[essais] ${module}: replaced by ${owners.get(module)}, not by ${id}`); continue; }
   owners.set(module, id);
   const target = study.trialURL(id, module);
   for (const specifier of SPECIFIERS[module]) imports[new URL(specifier, document.baseURI).href] = target;
  }
 }
 study.active = Object.freeze(active);
 study.replacements = Object.freeze(Object.fromEntries(owners));
 document.documentElement.dataset.essais = active.join(' ');
 for (const id of active) {
  if (study.manifests.get(id).styles) document.write(`<link rel="stylesheet" href="${study.trialURL(id, 'styles.css')}" data-essai="${id}">`);
 }
 if (Object.keys(imports).length) {
  const map = JSON.stringify({ imports }).replace(/</g, '\\u003c');
  document.write(`<script type="importmap" data-essais="replacements">${map}<\/script>`);
 }
})();
