import { variants } from './variants.mjs';
const container = document.getElementById('examples');
const entries = Object.entries(variants);
const filters = {
  all: { label: 'Tous les essais', matches: () => true },
  archive: { label: 'Archive initiale', matches: item => item.number <= 12 },
  new: { label: 'Nouvelles pistes', matches: item => item.number > 12 },
};

function render(filter = 'all') {
  container.innerHTML = entries.filter(([, item]) => filters[filter].matches(item)).map(([key, item]) => {
    const previous = item.status === 'previous';
    const current = item.number > 12 && !previous;
    const badge = previous ? 'Version précédente' : current ? 'Recherche actuelle' : item.number > 4 ? 'Série 2' : '';
    return `<a class="example-card" href="${key}.html"${current ? ' data-current="true"' : ''}><small>${String(item.number).padStart(2, '0')}${badge ? `<span class="example-badge">${badge}</span>` : ''}</small><h2>${item.title}</h2><p>${item.description}</p><strong>Voir cet exemple →</strong></a>`;
  }).join('');
  for (const [id, definition] of Object.entries(filters)) {
    const button = document.getElementById(id);
    const count = entries.filter(([, item]) => definition.matches(item)).length;
    button.textContent = `${definition.label} · ${count}`;
    button.setAttribute('aria-pressed', String(id === filter));
  }
}

for (const id of Object.keys(filters)) {
  document.getElementById(id).addEventListener('click', () => render(id));
}
render();
