// Essai illustrations-variees (14 Oct 2026): neighbouring cards no longer share an
// identical cover. Each fictional entry gets a fixed palette (essai.css): its rank
// among the same-motif entries of its section, in the default newest-first order,
// modulo the palettes of that motif. The corpus is fixed, so the choice is stable
// across reloads and identical in cards, profile grids, detail media and viewer.
// Same module URLs as welcome.mjs: the data modules are shared, not loaded twice.
import {previewEntries} from '../../baseline/content-preview-data.mjs?v=11';
import {sortContentEntries} from '../../baseline/content-preferences.mjs?v=13';

// Palettes per motif, original included. 3 and 4 are the largest numbers of
// same-motif entries found within four consecutive places (3 columns + 1).
const COUNTS = Object.freeze({network: 3, garden: 3, journal: 4});
const ENTRY = /#(projects|journal)\/([^?#/]+)/;

function palettes() {
 const byId = new Map();
 for (const section of ['projects', 'journal']) {
  const seen = new Set(), ranks = {};
  const entries = previewEntries.filter(entry => entry.section === section && !seen.has(entry.id) && seen.add(entry.id));
  for (const entry of sortContentEntries(entries, {sort: 'newest'})) {
   const count = COUNTS[entry.cover];
   if (!count) continue;
   ranks[entry.cover] = (ranks[entry.cover] ?? -1) + 1;
   if (ranks[entry.cover] % count) byId.set(entry.id, ranks[entry.cover] % count);
  }
 }
 return byId;
}

export default function install() {
 if (window.__essaiIllustrationsVariees) return;
 window.__essaiIllustrationsVariees = true;
 const byId = palettes();
 const entryOf = href => {const match = ENTRY.exec(href || ''); return match ? decodeURIComponent(match[2]) : null;};
 const mark = (element, id) => {
  const value = byId.get(id);
  if (value) {if (element.dataset.essaiPalette !== String(value)) element.dataset.essaiPalette = String(value);}
  else if (element.hasAttribute('data-essai-palette')) element.removeAttribute('data-essai-palette');
 };
 const scan = () => {
  // Cards and profile project links name their entry in their link.
  for (const card of document.querySelectorAll('article.cp-card[data-cover]')) mark(card, entryOf(card.querySelector('a[href]')?.getAttribute('href')));
  for (const cover of document.querySelectorAll('.cp-profile-related-link .cp-cover[data-cover]')) mark(cover, entryOf(cover.closest('a[href]')?.getAttribute('href')));
  // Detail media and the viewer show the routed entry.
  const current = entryOf(location.hash);
  for (const art of document.querySelectorAll('.cp-project-media-open > [data-cover], .media-viewer-illustration > [data-cover]')) mark(art, current);
 };
 scan();
 // Lists and details are rebuilt on navigation, theme and language changes.
 new MutationObserver(scan).observe(document.body, {childList: true, subtree: true});
}
