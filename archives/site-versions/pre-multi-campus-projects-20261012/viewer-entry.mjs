// Frozen archive entry before multi-campus projects and local navigation fix.
// Inline SVG symbols belong to this exact document URL, including its query.
const archiveEntryURL=new URL(location.pathname+location.search,location.origin).href;
document.querySelectorAll('a[href],use[href]').forEach(node=>{
 const reference=node.getAttribute('href');
 if(reference.startsWith('../archives/site-versions/pre-multi-campus-projects-20261012/preview.html#'))node.setAttribute('href',archiveEntryURL+reference.slice(reference.indexOf('#')));
});
// Direct review entry, sharing the active site's routing and interactions.
// Explicit preview links keep both comparisons accessible; the active default
// now uses the selected full-menu fade.
const menuScrollStudy = new URLSearchParams(window.location.search).get('menu-scroll');
const app = document.getElementById('app');
if (app && (menuScrollStudy === 'background' || menuScrollStudy === 'all')) {
  app.dataset.menuScrollStudy = menuScrollStudy;
  document.title = menuScrollStudy === 'background' ? '42 Horizon — Essai 1 · Fond transparent' : '42 Horizon — Essai 2 · Menu effacé';
}
await import('./viewer-welcome.mjs?v=archive-1');
