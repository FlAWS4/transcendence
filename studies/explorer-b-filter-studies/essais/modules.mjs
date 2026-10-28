// Trial loader of the version B filter study (26 Oct 2026), last part.
// Once the copy's controller has started, applies ?lang=, then starts the module.mjs of each active trial that
// declares one, in the canonical order, with the hook to the live scope pill (pill.mjs). Each trial's default export
// receives { id, pill, study, root, page }. <html data-essais-ready="true"> marks the end, trials or not.
import { createPillHook } from './pill.mjs?v=1';

const study = window.horizonEssais;
const root = document.documentElement;
const page = location.pathname.split('/').pop() || 'index.html';

// The copy's controller hides the header's language switcher once its listeners are in place (welcome.mjs);
// content-preview.mjs loads it with a dynamic import, so it may start after this module.
function started(seconds = 20) {
 const switcher = document.getElementById('language-switcher');
 if (!switcher || switcher.hidden) return Promise.resolve();
 return new Promise((resolve, reject) => {
  const timer = setTimeout(() => { observer.disconnect(); reject(new Error('the copy did not start')); }, seconds * 1000);
  const observer = new MutationObserver(() => {
   if (switcher.hidden) { clearTimeout(timer); observer.disconnect(); resolve(); }
  });
  observer.observe(switcher, { attributes: true, attributeFilter: ['hidden'] });
 });
}

try {
 await started();
 // Version B keeps no language between visits: the copy's own language menu applies ?lang= (welcome.mjs localize()).
 const lang = new URLSearchParams(location.search).get('lang');
 if (['fr', 'en', 'ar'].includes(lang) && root.lang !== lang) document.querySelector(`#language-menu [data-locale="${lang}"]`)?.click();
 const trials = (study?.active || []).filter(id => study.manifests.get(id)?.module);
 const pill = trials.length ? createPillHook(document) : null;
 for (const id of trials) {
  try {
   const trial = await import(study.trialURL(id, 'module.mjs'));
   if (typeof trial.default === 'function') await trial.default({ id, pill, study, root, page });
  } catch (error) {
   console.error(`[essai ${id}]`, error);
  }
 }
} catch (error) {
 console.error('[essais]', error);
}
root.dataset.essaisReady = 'true';
