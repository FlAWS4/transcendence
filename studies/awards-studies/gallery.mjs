const themeKey = 'horizon-awards-studies-theme';
const button = document.querySelector('#theme');

function setTheme(theme, persist = false) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  button.setAttribute('aria-pressed', String(dark));
  button.setAttribute('aria-label', `Activer le thème ${dark ? 'clair' : 'sombre'}`);
  button.querySelector('use').setAttribute('href', `#icon-${dark ? 'sun' : 'moon'}`);
  if (persist) {
    try { localStorage.setItem(themeKey, dark ? 'dark' : 'light'); } catch { /* Private storage may be unavailable. */ }
  }
}

let storedTheme = 'light';
try { storedTheme = localStorage.getItem(themeKey) || 'light'; } catch { /* Keep the light default. */ }
setTheme(storedTheme);
button.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true));
window.addEventListener('storage', event => {
  if (event.key === themeKey) setTheme(event.newValue || 'light');
});
