// Parser-inserted so active trial styles block rendering and come after every baseline sheet.
// Trials listed in horizonEssais.early also get their early.js before the baseline modules run.
(() => {
 const study = window.horizonEssais;
 if (!study) return;
 for (const id of study.active) document.write(`<link rel="stylesheet" href="../essais/${id}/essai.css?v=${study.version}" data-essai="${id}">`);
 for (const id of study.active) if (study.early.includes(id)) document.write(`<script src="../essais/${id}/early.js?v=${study.version}" data-essai="${id}"><\/script>`);
})();
