// Hook to the copy's live scope pill, for the trials of the version B filter study (26 Oct 2026).
// The copy keeps its own controller (welcome.mjs updateScope(), scope-pill.mjs fit(), reading-scope.mjs): a trial reads
// the pill's elements and its state here, and re-runs its own adjustments through onChange(), which calls back after
// the copy has finished each update (a filter change, a language, theme, size or form change, the fonts), before the
// frame is painted. API documented in NOTES.md, « Le crochet du filtre ».

// The pill and the line under it, as the copy's two pages define them (identical markup on both).
const SELECTORS = Object.freeze({
 app: '#app', bar: '#scope-bar', back: '#scope-back', path: '#scope-path', medallion: '#scope-medallion', reset: '#reset',
 summary: '#scope-reading-summary', trail: '#scope-path .scope-trail', worldItem: '#scope-world-item', world: '#scope-world',
 countryItem: '#scope-country-item', country: '#scope-country', countryName: '#scope-country-name', current: '#scope-path .scope-current',
 picker: '#scope-picker', name: '#scope-name', status: '#globe-status', hint: '#globe-hint', popover: '#scope-popover',
});
// The copy's side rail query (welcome.mjs DOCK_RAIL, responsive-dock.css).
const DOCK_RAIL = '(orientation:landscape) and (max-height:720px)';

export function createPillHook(doc = document) {
 const win = doc.defaultView, root = doc.documentElement;
 const el = Object.freeze(Object.fromEntries(Object.entries(SELECTORS).map(([key, selector]) => [key, doc.querySelector(selector)])));
 const missing = Object.keys(el).filter(key => !el[key]);
 if (missing.length) throw new Error(`[essais] pill: missing ${missing.join(', ')}`);
 const rail = win.matchMedia(DOCK_RAIL);
 const listeners = new Set();
 let pending = new Set(), frame = 0, lastFilter = null, fonts = 0;

 const shown = element => !element.hidden && element.getClientRects().length > 0;
 function state() {
  const width = parseFloat(el.path.style.width);
  return {
   level: el.bar.dataset.level || 'world',
   name: el.name.textContent,
   crumb: el.countryItem.hidden ? '' : el.countryName.textContent,
   hint: el.hint.textContent,
   hintShown: shown(el.status),
   backDisabled: el.back.disabled,
   section: el.app.dataset.section || '',
   reading: el.app.dataset.reading === 'true',
   compact: el.app.dataset.compactScope === 'true',
   rail: rail.matches,
   lang: root.lang, dir: root.dir || 'ltr', theme: root.dataset.theme || 'light',
   viewport: { width: win.innerWidth, height: win.innerHeight },
   width: Number.isFinite(width) ? width : null,
   fonts,
  };
 }
 // What the copy itself writes on a filter change: a mutation that changes none of it (the copy's measuring copies,
 // a trial's own nodes) is not a new change.
 const filterKey = () => JSON.stringify([el.bar.dataset.level, el.name.textContent, el.countryItem.hidden, el.countryName.textContent,
  el.hint.textContent, el.status.hidden, el.back.disabled, el.picker.getAttribute('aria-label'), el.summary.textContent, el.path.style.width]);

 function call(callbacks, reasons) {
  const snapshot = state();
  for (const callback of callbacks) {
   try { callback(snapshot, reasons); } catch (error) { console.error('[essais] pill.onChange', error); }
  }
  // The callbacks' own DOM changes do not call them again.
  observer.takeRecords();
  lastFilter = filterKey();
 }
 function flush() {
  frame = 0;
  const reasons = pending; pending = new Set();
  if (reasons.size === 1 && reasons.has('filter') && filterKey() === lastFilter) return;
  if (listeners.size) call([...listeners], reasons);
  else lastFilter = filterKey();
 }
 function schedule(reason) {
  pending.add(reason);
  if (!frame) frame = win.requestAnimationFrame(flush);
 }
 const observer = new win.MutationObserver(records => {
  for (const record of records) {
   if (record.target === root) schedule(record.attributeName === 'data-theme' ? 'theme' : 'language');
   else if (record.target === el.app) schedule(record.attributeName === 'data-compact-scope' ? 'form' : 'page');
   else schedule('filter');
  }
 });
 observer.observe(el.bar, { subtree: true, childList: true, characterData: true, attributes: true });
 observer.observe(el.app, { attributes: true, attributeFilter: ['data-section', 'data-reading', 'data-compact-scope'] });
 observer.observe(root, { attributes: true, attributeFilter: ['lang', 'dir', 'data-theme'] });
 // Registered after the copy's own listeners: the copy refits the pill first.
 win.addEventListener('resize', () => schedule('size'));
 rail.addEventListener('change', () => schedule('form'));
 doc.fonts?.addEventListener?.('loadingdone', () => { fonts++; schedule('fonts'); });
 lastFilter = filterKey();

 return Object.freeze({
  el,
  state,
  /** Calls callback(state, reasons) now (reasons = {'start'}) unless immediate is false, then once per frame after
   * every change: reasons is a Set of 'filter', 'page', 'form', 'language', 'theme', 'size', 'fonts'.
   * Returns a function that stops the calls. */
  onChange(callback, { immediate = true } = {}) {
   if (typeof callback !== 'function') throw new TypeError('onChange(callback)');
   listeners.add(callback);
   if (immediate) call([callback], new Set(['start']));
   return () => listeners.delete(callback);
  },
 });
}
