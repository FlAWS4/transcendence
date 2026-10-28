// Design-review selection (15 Oct 2026): behaviour of the two trials of the user's nine-trial selection
// that are not pure CSS (pseudo-manquant, awards-a-venir); every style is in design-review-selection.css.
// Loaded by index.html and content-preview.html as a module of its own, after the controller's module.
// #main and #content-index are part of both pages, so it starts as soon as the document is parsed (the
// observers below follow the controller's renders, before or after its first one), and once per page.
const STARTED = Symbol.for('horizon.design-review-selection');

// pseudo-manquant: the stylesheet hides every pending Intra login line. In the directory grid a hidden line
// keeps its height while another card of its row shows a real login; this marks the lines of rows without
// any real login so they collapse. It follows re-renders, view switches, resizes and returns from a profile
// page, and writes nothing else.
const PENDING = '.cp-card-copy > .cp-profile-login:not([dir])';
const REAL = '.cp-card-copy > .cp-profile-login[dir]';

function collapsePendingLogins(index) {
 const sync = () => {
  // A hidden or list directory keeps its marks; list rows collapse in CSS anyway.
  if (index.dataset.view !== 'grid' || !index.getClientRects().length) return;
  const cards = [...index.querySelectorAll('.cp-profile-card')];
  // Read every row first (cards of one grid row share offsetTop), then write.
  const tops = cards.map(card => card.offsetTop);
  const rowsWithLogin = new Set(tops.filter((top, i) => cards[i].querySelector(REAL)));
  cards.forEach((card, i) => {
   const line = card.querySelector(PENDING);
   if (!line) return;
   if (!rowsWithLogin.has(tops[i])) { if (line.dataset.pendingLogin !== 'collapsed') line.dataset.pendingLogin = 'collapsed'; }
   else if ('pendingLogin' in line.dataset) delete line.dataset.pendingLogin;
  });
 };
 let frame = 0;
 // Size changes are handled on the next frame so this script never feeds a ResizeObserver loop.
 const later = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; sync(); }); };
 new MutationObserver(sync).observe(index, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-view', 'hidden'] });
 new ResizeObserver(later).observe(index);
 sync();
}

// awards-a-venir: one localised note appended to #main; the stylesheet shows it only on the Awards section.
// The Arabic wording reuses the dock's own name for the page (جوائز 42); the icon is the dock's #i-awards symbol.
const COPY = Object.freeze({
 fr: 'Les 42 Awards arrivent bientôt.',
 en: '42 Awards are coming soon.',
 ar: 'جوائز 42 قادمة قريبًا.',
});

function showAwardsNote(main, root) {
 if (main.querySelector(':scope > .awards-coming-soon')) return;
 const note = document.createElement('div');
 note.className = 'awards-coming-soon';
 note.innerHTML = '<svg aria-hidden="true"><use href="#i-awards"/></svg><p></p>';
 const text = note.querySelector('p');
 const sync = () => {
  const lang = Object.hasOwn(COPY, root.lang) ? root.lang : 'fr';
  if (text.lang === lang) return;
  text.textContent = COPY[lang];
  text.lang = lang;
  text.dir = lang === 'ar' ? 'rtl' : 'ltr';
 };
 sync();
 main.append(note);
 // The controller switches language on <html lang>; theme changes only swap the tokens used in the stylesheet.
 new MutationObserver(sync).observe(root, {attributes: true, attributeFilter: ['lang']});
 // Put the note back if a render ever replaces the children of #main.
 new MutationObserver(() => { if (!note.isConnected) main.append(note); }).observe(main, {childList: true});
}

function start() {
 if (globalThis[STARTED]) return true;
 const main = document.getElementById('main'), index = document.getElementById('content-index');
 if (!main || !index) return false;
 globalThis[STARTED] = true;
 collapsePendingLogins(index);
 showAwardsNote(main, document.documentElement);
 return true;
}

// Both elements are in the entries' markup; the wait only covers a page that would create them later.
if (!start()) {
 const waiting = new MutationObserver(() => { if (start()) waiting.disconnect(); });
 waiting.observe(document.documentElement, {childList: true, subtree: true});
}
