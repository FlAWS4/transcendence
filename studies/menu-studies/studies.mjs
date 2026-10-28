const sections = [
  ['explore', 'Explorer', 'compass'],
  ['projects', 'Projets', 'projects'],
  ['people', 'Parcours', 'people'],
  ['journal', 'Journal', 'journal'],
];
const icon = name => '<svg aria-hidden="true"><use href="#i-' + name + '"/></svg>';
const announce = text => { document.getElementById('announcement').textContent = text; };

for (const study of document.querySelectorAll('.study')) {
  const variant = study.dataset.variant;
  const title = study.querySelector('h2').textContent;
  study.querySelector('.menu-stage').innerHTML = `
    <div class="menu-shell" data-search="false">
      <nav class="menu" aria-label="${title}">
        <span class="indicator" aria-hidden="true"></span>
        <div class="menu-items">${sections.map(([key, label, symbol], order) => `
          <button class="nav-item" type="button" data-section="${key}" data-label="${label}" aria-label="${label}" ${order === 0 ? 'aria-current="page"' : ''} style="--order:${order}">
            ${icon(symbol)}<span class="nav-label" aria-hidden="true">${label}</span>
          </button>`).join('')}</div>
        <form class="search-form" role="search" aria-label="Recherche de démonstration — ${title}" id="search-${variant}" inert>
          <span class="search-icon">${icon('search')}</span>
          <input class="search-input" type="search" aria-label="Rechercher dans Horizon" placeholder="Rechercher dans Horizon…" autocomplete="off">
          <button class="search-close" type="button" aria-label="Fermer la recherche">${icon('close')}</button>
        </form>
      </nav>
      <button class="search-toggle" type="button" aria-label="Ouvrir la recherche — ${title}" aria-expanded="false" aria-controls="search-${variant}">${icon('search')}</button>
    </div>`;
  const shell = study.querySelector('.menu-shell');
  const menu = study.querySelector('.menu');
  const items = study.querySelector('.menu-items');
  const buttons = [...study.querySelectorAll('.nav-item')];
  const indicator = study.querySelector('.indicator');
  const form = study.querySelector('.search-form');
  const input = study.querySelector('.search-input');
  const toggle = study.querySelector('.search-toggle');
  let selected = buttons[0];
  let positionFrame = 0;
  let focusFrame = 0;
  function position() {
    cancelAnimationFrame(positionFrame);
    positionFrame = requestAnimationFrame(() => {
      const offset = parseFloat(getComputedStyle(indicator).left) || 0;
      indicator.style.setProperty('--indicator-x', selected.offsetLeft - offset + 'px');
      indicator.style.width = selected.offsetWidth + 'px';
    });
  }
  function select(button) {
    selected.removeAttribute('aria-current');
    selected = button;
    selected.setAttribute('aria-current', 'page');
    position();
    announce(title + ' : ' + selected.dataset.label);
  }
  function search(open, restoreFocus = true) {
    cancelAnimationFrame(focusFrame);
    shell.dataset.search = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    items.inert = open;
    toggle.inert = open;
    form.inert = !open;
    if (open) {
      // The field exists immediately; wait one frame for visibility before focusing.
      focusFrame = requestAnimationFrame(() => input.focus({preventScroll: true}));
    } else if (restoreFocus) toggle.focus({preventScroll: true});
  }
  buttons.forEach(button => button.addEventListener('click', () => select(button)));
  items.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const index = buttons.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus();
    select(buttons[next]);
  });
  toggle.addEventListener('click', () => search(true));
  study.querySelector('.search-close').addEventListener('click', () => search(false));
  shell.addEventListener('keydown', event => {
    if (event.key === 'Escape' && shell.dataset.search === 'true') {
      event.preventDefault();
      search(false);
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    announce('Champ de démonstration. La recherche du site reste inchangée.');
  });
  const observer = new ResizeObserver(position);
  observer.observe(menu);
  document.fonts.ready.then(position);
  position();
}

const themeButton = document.getElementById('theme-toggle');
themeButton.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? 'Activer le thème clair' : 'Activer le thème sombre');
  themeButton.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
});
