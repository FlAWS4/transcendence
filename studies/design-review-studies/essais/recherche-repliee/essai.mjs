// Essai recherche-repliee: adds a magnifier to the existing search toggle.
// essai.css shows it on content pages only; the toggle, its handlers, localized
// labels and the search itself remain the baseline's (no second search is created).
const NS = 'http://www.w3.org/2000/svg';
const MARK = 'recherche-repliee';

// Same drawing as the magnifier of the open search field (dock-search.mjs).
function magnifier(doc) {
 const svg = doc.createElementNS(NS, 'svg');
 svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
 svg.dataset.essai = MARK;
 const circle = doc.createElementNS(NS, 'circle');
 circle.setAttribute('cx', '10.5'); circle.setAttribute('cy', '10.5'); circle.setAttribute('r', '6.5');
 const path = doc.createElementNS(NS, 'path'); path.setAttribute('d', 'm16 16 4.5 4.5');
 svg.append(circle, path);
 return svg;
}

export default function install({root}) {
 const doc = root.ownerDocument;
 const observer = new MutationObserver(() => apply());
 function apply() {
  const shell = doc.querySelector('.dock-shell');
  const toggle = shell?.querySelector(':scope > .dock-search-toggle');
  if (toggle && !toggle.querySelector(`:scope > svg[data-essai="${MARK}"]`)) toggle.prepend(magnifier(doc));
  // The dock is mounted once; watch only its parent and itself in case it is remounted.
  observer.disconnect();
  const main = doc.getElementById('main');
  if (main) observer.observe(main, {childList: true});
  if (shell) observer.observe(shell, {childList: true});
 }
 apply();
}
