// Essai titre-fiche-campus (14 Oct 2026): when a campus sheet shows an official
// logo that does not spell the campus name (42 Paris: the bare 42 symbol), its
// text name (hidden by campus-details.mjs once the logo loads) is shown again as
// a heading between the logo and the country line. Campuses without a logo, or
// whose logo fails, already show the name inside the logo slot, and a logo that
// spells it already shows it: nothing is added there. The title is a copy of the
// existing heading, so it keeps its typography and stays a non-focusable h3.
const TITLE = 'essai-campus-title';
// Logo files whose artwork already reads as the campus name, classified by eye
// on the two logos of campus-profiles.json: Mulhouse reads "42 | MULHOUSE Grand
// Est", Paris is the bare symbol. An unlisted logo gets the title.
const NAMED_LOGOS = new Set(['mulhouse-logo-official-white.svg']);

function spellsName(logo) {
 try { return NAMED_LOGOS.has(new URL(logo.getAttribute('src') || '', document.baseURI).pathname.split('/').pop()); }
 catch { return false; }
}

function sync(hero) {
 const slot = hero.querySelector(':scope > .campus-details-logo-slot');
 const name = slot?.querySelector(':scope > .campus-details-name');
 const logo = slot?.querySelector(':scope > .campus-details-logo-image');
 let title = hero.querySelector(`:scope > .${TITLE}`);
 if (!(name && logo && !logo.hidden && name.hidden && !spellsName(logo))) { title?.remove(); return; }
 if (!title) {
  title = name.cloneNode(true);
  title.classList.add(TITLE);
  title.hidden = false;
  slot.after(title);
 }
 // Only write when needed: every write would wake the observer again.
 if (title.textContent !== name.textContent) title.textContent = name.textContent;
}

export default function install() {
 const dialog = document.getElementById('dialog');
 if (!dialog) return;
 const run = () => { for (const hero of dialog.querySelectorAll('.campus-details-hero')) sync(hero); };
 // The sheet is rebuilt on every opening and the logo reveals itself on load.
 new MutationObserver(run).observe(dialog, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
 run();
}
