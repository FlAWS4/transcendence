// Essai pseudo-manquant: essai.css hides every pending Intra login line. In the directory grid
// a hidden line keeps its height while another card of its row shows a real login; this script
// marks the lines of rows without any real login so they collapse. It follows re-renders, view
// switches, resizes and returns from a profile page, and writes nothing else.
const PENDING = '.cp-card-copy > .cp-profile-login:not([dir])';
const REAL = '.cp-card-copy > .cp-profile-login[dir]';
let installed = false;

export default function install() {
 const index = document.getElementById('content-index');
 if (installed || !index) return;
 installed = true;
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
   if (!rowsWithLogin.has(tops[i])) { if (line.dataset.pseudoManquant !== 'replie') line.dataset.pseudoManquant = 'replie'; }
   else if ('pseudoManquant' in line.dataset) delete line.dataset.pseudoManquant;
  });
 };
 let frame = 0;
 // Size changes are handled on the next frame so this script never feeds a ResizeObserver loop.
 const later = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; sync(); }); };
 new MutationObserver(sync).observe(index, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-view', 'hidden'] });
 new ResizeObserver(later).observe(index);
 sync();
}
