// Offline counter-check of illustrations-variees (no browser): replays the trial's palette
// rule on the baseline data, then lists identical neighbours on every page of Projets and
// Chroniques for the newest and oldest orders, in 1, 2 and 3 columns (all layouts used).
// Run: node studies/design-review-studies/checks/illustrations-variees/palettes-exhaustif.mjs
import {readFileSync, writeFileSync} from 'node:fs';
import {previewEntries} from '../../baseline/content-preview-data.mjs?v=11';
import {sortContentEntries} from '../../baseline/content-preferences.mjs?v=13';
import {createDiscoveryEntries} from '../../baseline/profile-data.mjs';
import {CONTENT_PAGE_SIZE} from '../../baseline/content-pagination.mjs';

// Rule copied from essais/illustrations-variees/essai.mjs; the source is compared below so
// a later edit of the trial cannot silently diverge from this replay.
const COUNTS = {network: 3, garden: 3, journal: 4};
const source = readFileSync(new URL('../../essais/illustrations-variees/essai.mjs', import.meta.url), 'utf8');
const sameRule = source.includes("const COUNTS = Object.freeze({network: 3, garden: 3, journal: 4});")
 && source.includes("for (const entry of sortContentEntries(entries, {sort: 'newest'}))")
 && source.includes('if (ranks[entry.cover] % count) byId.set(entry.id, ranks[entry.cover] % count);');
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
const byId = palettes();
// The list itself is built from createDiscoveryEntries(previewEntries), as in welcome.mjs.
const discovery = createDiscoveryEntries(previewEntries);
const key = entry => entry.cover + ':' + (byId.get(entry.id) || 0);
const out = {sameRuleAsTrial: sameRule, duplicateIds: {}, cases: [], originals: {}};
for (const section of ['projects', 'journal']) {
 const list = discovery.filter(entry => entry.section === section);
 out.duplicateIds[section] = list.length - new Set(list.map(entry => entry.id)).size;
 for (const sort of ['newest', 'oldest']) {
  const sorted = sortContentEntries(list, {sort});
  for (const columns of [1, 2, 3]) {
   const pages = Math.ceil(sorted.length / CONTENT_PAGE_SIZE), identical = [];
   let pairs = 0, baselinePairs = 0;
   for (let page = 0; page < pages; page++) {
    const items = sorted.slice(page * CONTENT_PAGE_SIZE, (page + 1) * CONTENT_PAGE_SIZE);
    items.forEach((entry, i) => {
     for (const j of [i % columns < columns - 1 ? i + 1 : -1, i + columns]) {
      if (j < 0 || j >= items.length) continue;
      pairs++;
      if (items[j].cover === entry.cover) baselinePairs++;
      if (key(items[j]) === key(entry)) identical.push([page + 1, entry.id, items[j].id]);
     }
    });
   }
   out.cases.push({section, sort, columns, entries: sorted.length, pages, pairs, baselineIdenticalPairs: baselinePairs, trialIdenticalPairs: identical.length, identical: identical.slice(0, 12)});
  }
 }
}
// The nine hand-written entries (first in previewEntries) and the palette they receive.
for (const entry of previewEntries.slice(0, 9)) out.originals[entry.id] = entry.section === 'people' ? 'profil (non concerné)' : (byId.get(entry.id) || 0);
out.palettesUsed = Object.fromEntries(['network', 'garden', 'journal', 'shell', 'raycast'].map(cover => [cover, [...new Set(discovery.filter(e => e.cover === cover && e.section !== 'people').map(e => byId.get(e.id) || 0))].sort()]));
out.passedNewestOldest = out.sameRuleAsTrial && out.cases.every(c => c.trialIdenticalPairs === 0);
writeFileSync(new URL('./palettes-exhaustif.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({sameRule, duplicateIds: out.duplicateIds, passed: out.passedNewestOldest,
 cases: out.cases.map(c => `${c.section} ${c.sort} ${c.columns}col: baseline ${c.baselineIdenticalPairs}/${c.pairs}, trial ${c.trialIdenticalPairs}`), originals: out.originals, palettesUsed: out.palettesUsed}, null, 1));
