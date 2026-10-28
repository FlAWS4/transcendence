// Direct review entry, sharing the active site's routing and interactions.
// Explicit preview links keep both comparisons accessible; the active default
// now uses the selected full-menu fade.
const menuScrollStudy = new URLSearchParams(window.location.search).get('menu-scroll');
const app = document.getElementById('app');
if (app && (menuScrollStudy === 'background' || menuScrollStudy === 'all')) {
  app.dataset.menuScrollStudy = menuScrollStudy;
  document.title = menuScrollStudy === 'background' ? '42 Horizon — Essai 1 · Fond transparent' : '42 Horizon — Essai 2 · Menu effacé';
}
await import('./welcome.mjs?v=b8');
