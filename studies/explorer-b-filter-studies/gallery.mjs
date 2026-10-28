// Gallery of the version B filter study: four cards read from the trials' manifests (essais/<id>/essai.js) and a
// side-by-side comparator, the frozen copy on the left and the copy with the trial on the right, both opened with the
// same page, theme and language (?theme= and ?lang= of the study's loader) in a frame of the chosen format.
const IDS = ['chiffres-dans-le-filtre', 'filtre-plus-court', 'chemin-en-etapes', 'texte-centre'];
const FORMATS = { ordinateur: [1440, 900], portable: [1280, 720], mobile: [390, 844], paysage: [667, 375] };
// States where the filter shows: the Explorer at each level (the longest indication is « Émirats arabes unis ›
// 42 Abu Dhabi »), a content section, a content section filtered on a campus, the reading mode, and the entrance.
const VIEWS = [
 { libelle: 'Explorer · Monde', page: 'content-preview.html', route: 'explore' },
 { libelle: 'Explorer · Europe', page: 'content-preview.html', route: 'explore?continent=europe' },
 { libelle: 'Explorer · France', page: 'content-preview.html', route: 'explore?country=FRA' },
 { libelle: 'Explorer · Émirats arabes unis', page: 'content-preview.html', route: 'explore?country=ARE' },
 { libelle: 'Explorer · 42 Abu Dhabi', page: 'content-preview.html', route: 'explore?campus=abu-dhabi' },
 { libelle: 'Projets · Monde', page: 'content-preview.html', route: 'projects' },
 { libelle: 'Projets · 42 Paris', page: 'content-preview.html', route: 'projects?campus=paris' },
 { libelle: 'Fiche projet (mode lecture)', page: 'content-preview.html', route: 'projects/ft-transcendence-building-together' },
 { libelle: 'Arrivée (index.html)', page: 'index.html', route: '' },
];
const $ = id => document.getElementById(id);
const trials = new Map();
let compared = null, views = VIEWS;

function element(tag, className, text) {
 const node = document.createElement(tag);
 if (className) node.className = className;
 if (text !== undefined) node.textContent = text;
 return node;
}

function pageURL(view, { essais = [], theme, lang }) {
 const params = new URLSearchParams();
 if (essais.length) params.set('essais', essais.join(','));
 params.set('theme', theme); params.set('lang', lang);
 return `baseline/${view.page}?${params}${view.route ? '#' + view.route : ''}`;
}
const settings = () => ({ theme: $('theme-select').value, lang: $('lang-select').value, format: $('format-select').value });
const currentView = () => views[Number($('view-select').value) || 0] || VIEWS[0];

// Each manifest is a classic script calling horizonEssais.declare(); here the call only collects the card's fields.
function readManifests() {
 window.horizonEssais = { declare(manifest) { if (IDS.includes(manifest?.id)) trials.set(manifest.id, manifest); } };
 return Promise.all(IDS.map(id => new Promise(resolve => {
  const script = document.createElement('script');
  script.src = `essais/${id}/essai.js?v=${Date.now().toString(36)}`;
  script.onload = script.onerror = () => { script.remove(); resolve(); };
  document.head.append(script);
 })));
}

function fillViews(list) {
 const select = $('view-select'), previous = currentView();
 views = list; select.replaceChildren();
 list.forEach((view, index) => { const option = element('option', '', view.libelle); option.value = String(index); select.append(option); });
 const kept = list.findIndex(view => view.page === previous.page && view.route === previous.route);
 select.value = String(Math.max(0, kept));
}

function applyView(view) {
 if (view.format && FORMATS[view.format]) $('format-select').value = view.format;
 if (view.theme) $('theme-select').value = view.theme;
 if (view.lang) $('lang-select').value = view.lang;
}

function layoutFrames() {
 const [width, height] = FORMATS[settings().format];
 for (const box of document.querySelectorAll('.frame-box')) {
  const frame = box.querySelector('iframe'), scale = Math.min(1, box.clientWidth / width);
  // A format narrower than its box (a phone beside another) stands in the box's middle.
  frame.style.left = Math.max(0, (box.clientWidth - width * scale) / 2) + 'px';
  frame.style.width = width + 'px'; frame.style.height = height + 'px'; frame.style.transform = `scale(${scale})`;
  box.style.height = Math.ceil(height * scale) + 'px';
 }
}

// Every comparison loads both pages afresh: a frame given the same address again would only follow its fragment, and
// the copy then handles a navigation (it focuses the Explorer) that the other frame, reloaded, does not. The extra
// ?chargement= parameter, ignored by the copy and the loader, makes each address new; the « Ouvrir » links keep the plain one.
let loads = 0;
const fresh = url => url.replace('?', `?chargement=${loads}&`);

function load() {
 if (!compared) return;
 const view = currentView(), state = settings();
 const current = pageURL(view, state), trial = pageURL(view, { ...state, essais: [compared] });
 layoutFrames();
 loads++;
 $('frame-current').src = fresh(current); $('frame-trial').src = fresh(trial);
 $('open-current').href = current; $('open-trial').href = trial;
 updateCardLinks();
}

function updateCardLinks() {
 const view = compared ? currentView() : VIEWS[0], state = settings();
 for (const link of document.querySelectorAll('a[data-open]')) link.href = pageURL(view, { ...state, essais: [link.dataset.open] });
}

function openComparison(id) {
 const trial = trials.get(id) || { id, titre: id }, own = Array.isArray(trial.vues) ? trial.vues.filter(view => view?.libelle && view.page) : [];
 compared = id;
 fillViews([...own, ...VIEWS.filter(view => !own.some(item => item.page === view.page && item.route === view.route))]);
 if (own[0]) { $('view-select').value = '0'; applyView(own[0]); }
 const number = String(IDS.indexOf(id) + 1).padStart(2, '0');
 $('comparer').dataset.ready = 'true';
 $('compare-subject').textContent = `${number} · ${trial.titre}`;
 $('trial-caption').textContent = `Avec l’essai « ${trial.titre} »`;
 $('frame-trial').title = `Avec l’essai « ${trial.titre} »`;
 for (const card of document.querySelectorAll('.card')) card.setAttribute('aria-current', String(card.dataset.essai === id));
 load();
 $('comparer').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

// Empty until its author declares a file: the trial's view then shows the copy as it is.
const isEmpty = trial => !trial.styles && !trial.module && !(trial.remplace || []).length;

function card(id, index) {
 const trial = trials.get(id) || { id, titre: id, resume: 'Fiche indisponible.' };
 const article = element('article', 'card'); article.id = 'essai-' + id; article.dataset.essai = id;
 const title = element('h3'); title.append(element('span', 'number', String(index + 1).padStart(2, '0')), element('span', '', trial.titre));
 article.append(title, element('p', 'resume', trial.resume || ''));
 if (isEmpty(trial)) article.append(element('p', 'badge empty', 'Vide pour l’instant : la vue de l’essai montre la copie'));
 const actions = element('div', 'card-actions');
 const compareButton = element('button', 'primary', 'Comparer'); compareButton.type = 'button';
 compareButton.addEventListener('click', () => openComparison(id));
 const open = element('a', '', 'Ouvrir l’essai'); open.dataset.open = id; open.target = '_blank'; open.rel = 'noopener';
 actions.append(compareButton, open);
 article.append(actions);
 return article;
}

async function start() {
 fillViews(VIEWS);
 await readManifests();
 $('cards').replaceChildren(...IDS.map(card));
 updateCardLinks();
 const wanted = new URLSearchParams(location.search).get('essai');
 if (IDS.includes(wanted)) openComparison(wanted);
}

$('view-select').addEventListener('change', () => { applyView(currentView()); load(); });
for (const id of ['format-select', 'theme-select', 'lang-select']) $(id).addEventListener('change', load);
$('reload-frames').addEventListener('click', load);
new ResizeObserver(layoutFrames).observe($('comparer'));
start();
