const root = document.documentElement;
const toggle = document.querySelector('#theme');
const key = 'horizon-connected-theme';
let storedTheme;
try { storedTheme = localStorage.getItem(key); } catch { /* Local storage may be unavailable. */ }

function applyTheme(theme) {
  const dark = theme === 'dark';
  root.dataset.theme = dark ? 'dark' : 'light';
  toggle.setAttribute('aria-pressed', String(dark));
  toggle.setAttribute('aria-label', `Activer le thème ${dark ? 'clair' : 'sombre'}`);
  toggle.querySelector('use').setAttribute('href', dark ? '#icon-sun' : '#icon-moon');
  for (const link of document.querySelectorAll('a.try')) {
    const url = new URL(link.href);
    url.searchParams.set('theme', root.dataset.theme);
    link.href = `${url.pathname.split('/').pop()}${url.search}${url.hash}`;
  }
}

applyTheme(new URLSearchParams(location.search).get('theme') || storedTheme || 'light');
toggle.addEventListener('click', () => {
  applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  try { localStorage.setItem(key, root.dataset.theme); } catch { /* Keep the current session usable. */ }
});
