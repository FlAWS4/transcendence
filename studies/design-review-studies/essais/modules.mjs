// Starts optional trial behaviours once the baseline controller has finished initialising.
// Each trial folder provides essai.mjs; its default export (if any) receives the context below.
const study = window.horizonEssais;
const params = new URLSearchParams(location.search);

function bridge() {
 return new Promise(resolve => {
  const check = () => (window.horizonStudy ? resolve(window.horizonStudy) : requestAnimationFrame(check));
  check();
 });
}

const horizon = await bridge();
const lang = params.get('lang');
if (['fr', 'en', 'ar'].includes(lang)) horizon.setLocale(lang);
for (const id of study?.active || []) {
 try {
  const trial = await import(`../essais/${id}/essai.mjs?v=${study.version}`);
  if (typeof trial.default === 'function') await trial.default({ id, horizon, root: document.documentElement, has: study.has });
 } catch (error) {
  console.error(`[essai ${id}]`, error);
 }
}
document.documentElement.dataset.essaisReady = 'true';
