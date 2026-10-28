// Gallery of the design-review trials: cards from essais/<id>/essai.json and a side-by-side comparator.
const IDS = [
 'globe-espace-libre', 'textes-sur-pastilles', 'police-etiquettes-globe', 'titre-fiche-campus',
 'recherche-repliee', 'voile-pile-basse', 'une-colonne-320', 'deux-colonnes-allegees', 'pseudo-manquant',
 'illustrations-sombres', 'illustrations-attenuees', 'roles-couleur', 'visiter-contour-sombre', 'illustrations-variees',
 'lisibilite-textes', 'titres-marque', 'titres-forts', 'echelle-unifiee', 'awards-a-venir',
];
const EXCLUSIVE = [['une-colonne-320', 'deux-colonnes-allegees'], ['illustrations-sombres', 'illustrations-attenuees']];
const VIEWPORTS = { ordinateur: [1440, 900], mobile: [390, 844], petit: [320, 640], paysage: [667, 375] };
const GENERIC_VIEWS = [
 { libelle: 'Explorer', page: 'content-preview.html', route: 'explore' },
 { libelle: 'Projets', page: 'content-preview.html', route: 'projects' },
 { libelle: 'Profils', page: 'content-preview.html', route: 'people' },
 { libelle: 'Chroniques', page: 'content-preview.html', route: 'journal' },
 { libelle: '42 Awards', page: 'content-preview.html', route: 'awards' },
 { libelle: 'Fiche projet', page: 'content-preview.html', route: 'projects/ft-transcendence-building-together' },
 { libelle: 'Fiche profil', page: 'content-preview.html', route: 'people/profile-leila-mansour' },
 { libelle: 'Article', page: 'content-preview.html', route: 'journal/journal-an-evening-debugging' },
 { libelle: 'Arrivée (connexion, visite)', page: 'index.html', route: '' },
];
const SELECTION_KEY = 'horizon-design-review-studies-20261014-gallery-selection';
const $ = id => document.getElementById(id);
const trials = new Map();
let selection = readSelection();
let compare = { essais: [], label: '', views: GENERIC_VIEWS };

function element(tag, className, text) {
 const node = document.createElement(tag);
 if (className) node.className = className;
 if (text !== undefined) node.textContent = text;
 return node;
}

function readSelection() {
 try { const saved = JSON.parse(localStorage.getItem(SELECTION_KEY) || '[]'); return Array.isArray(saved) ? saved.filter(id => IDS.includes(id)) : []; } catch { return []; }
}
function saveSelection() { try { localStorage.setItem(SELECTION_KEY, JSON.stringify(selection)); } catch { /* Selection still works for this visit. */ } }

function trialURL(view, { essais = [], theme, lang }) {
 const params = new URLSearchParams();
 if (essais.length) params.set('essais', essais.join(','));
 params.set('theme', theme); params.set('lang', lang);
 return `baseline/${view.page}?${params}${view.route ? '#' + view.route : ''}`;
}

function currentView() { return compare.views[Number($('view-select').value) || 0] || GENERIC_VIEWS[0]; }

function settings() { return { theme: $('theme-select').value, lang: $('lang-select').value, viewport: $('viewport-select').value }; }

function load() {
 const view = currentView(), state = settings();
 const current = trialURL(view, state), trial = trialURL(view, { ...state, essais: compare.essais });
 $('frame-current').src = current; $('frame-trial').src = trial;
 $('open-current').href = current; $('open-trial').href = trial;
 layoutFrames();
}

function layoutFrames() {
 const [width, height] = VIEWPORTS[settings().viewport];
 for (const box of document.querySelectorAll('.frame-box')) {
  const frame = box.querySelector('iframe'), scale = Math.min(1, box.clientWidth / width);
  frame.style.width = width + 'px'; frame.style.height = height + 'px'; frame.style.transform = `scale(${scale})`;
  box.style.height = Math.ceil(height * scale) + 'px';
 }
}

function fillViews(views) {
 const select = $('view-select'); select.replaceChildren();
 views.forEach((view, index) => { const option = element('option', '', view.libelle); option.value = String(index); select.append(option); });
}

function applyView(view) {
 if (view.viewport && VIEWPORTS[view.viewport]) $('viewport-select').value = view.viewport;
 if (view.theme) $('theme-select').value = view.theme;
 if (view.lang) $('lang-select').value = view.lang;
}

function openComparison(essais, label, ownViews = []) {
 compare = { essais, label, views: [...ownViews, ...GENERIC_VIEWS.filter(view => !ownViews.some(own => own.page === view.page && own.route === view.route))] };
 fillViews(compare.views);
 if (ownViews[0]) applyView(ownViews[0]);
 $('comparer').dataset.ready = 'true';
 $('compare-subject').textContent = label;
 $('trial-caption').textContent = essais.length > 1 ? `Avec ${essais.length} essais` : 'Avec l’essai';
 load();
 $('comparer').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

function conflicts(ids) {
 return EXCLUSIVE.filter(group => group.filter(id => ids.includes(id)).length > 1).map(group => group.map(id => trials.get(id)?.titre || id));
}

function renderSelection() {
 const list = $('selection-list'); list.replaceChildren();
 const ordered = IDS.filter(id => selection.includes(id));
 for (const id of ordered) {
  const item = element('li'), remove = element('button', 'remove', '×');
  remove.type = 'button'; remove.setAttribute('aria-label', `Retirer « ${trials.get(id)?.titre || id} » de la sélection`);
  remove.addEventListener('click', () => toggleSelection(id, false));
  item.append(element('span', '', trials.get(id)?.titre || id), remove); list.append(item);
 }
 $('selection-empty').hidden = ordered.length > 0;
 $('compare-selection').disabled = !ordered.length; $('clear-selection').disabled = !ordered.length;
 const open = $('open-selection');
 if (ordered.length) { open.href = trialURL(GENERIC_VIEWS[1], { essais: ordered, ...settings() }); open.removeAttribute('aria-disabled'); }
 else { open.removeAttribute('href'); open.setAttribute('aria-disabled', 'true'); }
 const clash = conflicts(ordered);
 $('selection-warning').hidden = !clash.length;
 $('selection-warning').textContent = clash.length ? 'Alternatives au même problème : ' + clash.map(pair => pair.join(' / ')).join(' ; ') + '. Seule la première de chaque paire s’applique.' : '';
 for (const box of document.querySelectorAll('input[data-select]')) box.checked = selection.includes(box.dataset.select);
}

function toggleSelection(id, on) {
 selection = on ? [...new Set([...selection, id])] : selection.filter(item => item !== id);
 saveSelection(); renderSelection();
}

function captureFigure(capture, label) {
 const figure = element('figure', 'shot');
 const image = element('img'); image.src = capture; image.alt = label; image.loading = 'lazy';
 figure.append(image, element('figcaption', '', label));
 return figure;
}

function card(trial, number) {
 const article = element('article', 'trial'); article.id = 'essai-' + trial.id;
 const head = element('div', 'trial-head');
 head.append(element('span', 'number', String(number).padStart(2, '0')));
 if (trial.decisionConcernee) { const badge = element('span', 'badge decision', 'Revient sur une décision'); badge.title = trial.decisionConcernee; head.append(badge); }
 else head.append(element('span', 'badge', 'Compatible avec vos choix'));
 article.append(head, element('h3', '', trial.titre), element('p', 'resume', trial.resume));
 if (trial.captures?.length) {
  const shots = element('div', 'shots'), first = trial.captures[0];
  if (first.avant) shots.append(captureFigure(first.avant, `Avant · ${first.vue}`));
  if (first.apres) shots.append(captureFigure(first.apres, `Essai · ${first.vue}`));
  article.append(shots);
 }
 const details = element('details');
 details.append(element('summary', '', 'Problème, changement et vérifications'));
 const add = (label, text) => { if (text && (!Array.isArray(text) || text.length)) { details.append(element('h4', '', label)); if (Array.isArray(text)) { const list = element('ul'); text.forEach(line => list.append(element('li', '', line))); details.append(list); } else details.append(element('p', '', text)); } };
 add('Problème', trial.probleme); add('Changement', trial.changement); add('Décision concernée', trial.decisionConcernee);
 add('Vérifications', trial.verifications); add('Limites', trial.limites);
 article.append(details);
 if (trial.alternativeDe) {
  const alt = element('p', 'alternative'); const link = element('a', '', trials.get(trial.alternativeDe)?.titre || trial.alternativeDe);
  link.href = '#essai-' + trial.alternativeDe; alt.append('Alternative : ', link); article.append(alt);
 }
 const actions = element('div', 'actions');
 const compareButton = element('button', 'primary', 'Comparer'); compareButton.type = 'button';
 compareButton.addEventListener('click', () => openComparison([trial.id], `${String(number).padStart(2, '0')} · ${trial.titre}`, trial.vues || []));
 const pick = element('label', 'pick'), box = element('input'); box.type = 'checkbox'; box.dataset.select = trial.id;
 box.addEventListener('change', () => toggleSelection(trial.id, box.checked));
 pick.append(box, ' Ajouter à ma sélection');
 actions.append(compareButton, pick);
 article.append(actions);
 return article;
}

async function start() {
 const loaded = await Promise.allSettled(IDS.map(id => fetch(`essais/${id}/essai.json`, { cache: 'no-cache' }).then(response => response.ok ? response.json() : Promise.reject(response.status))));
 loaded.forEach((result, index) => trials.set(IDS[index], result.status === 'fulfilled' ? result.value : { id: IDS[index], titre: IDS[index], groupe: 'Autres', resume: 'Fiche indisponible.' }));
 const groups = new Map();
 IDS.forEach(id => { const trial = trials.get(id); if (!groups.has(trial.groupe)) groups.set(trial.groupe, []); groups.get(trial.groupe).push(trial); });
 const container = $('groups'); container.replaceChildren();
 let number = 0;
 for (const [title, items] of groups) {
  const section = element('section', 'group'); const heading = element('h2', '', title); section.append(heading);
  const grid = element('div', 'trials');
  items.forEach(trial => grid.append(card(trial, ++number)));
  section.append(grid); container.append(section);
 }
 renderSelection();
 const wanted = new URLSearchParams(location.search).get('essai');
 if (wanted && trials.has(wanted)) { const index = IDS.indexOf(wanted) + 1; const trial = trials.get(wanted); openComparison([wanted], `${String(index).padStart(2, '0')} · ${trial.titre}`, trial.vues || []); }
 else { fillViews(compare.views); }
}

$('view-select').addEventListener('change', () => { const view = currentView(); applyView(view); load(); });
for (const id of ['viewport-select', 'theme-select', 'lang-select']) $(id).addEventListener('change', load);
$('reload-frames').addEventListener('click', load);
$('mode-select').addEventListener('change', () => {
 const toggle = $('mode-select').value === 'bascule';
 $('frames').dataset.mode = toggle ? 'bascule' : 'cote'; $('frames').dataset.showing = 'trial';
 $('swap-frames').hidden = !toggle; $('swap-frames').textContent = 'Voir la copie du 14 octobre'; $('swap-frames').setAttribute('aria-pressed', 'false');
 requestAnimationFrame(layoutFrames);
});
$('swap-frames').addEventListener('click', () => {
 const showCurrent = $('frames').dataset.showing === 'trial';
 $('frames').dataset.showing = showCurrent ? 'current' : 'trial';
 $('swap-frames').textContent = showCurrent ? 'Voir l’essai' : 'Voir la copie du 14 octobre';
 $('swap-frames').setAttribute('aria-pressed', String(showCurrent));
 requestAnimationFrame(layoutFrames);
});
$('compare-selection').addEventListener('click', () => {
 const ordered = IDS.filter(id => selection.includes(id));
 openComparison(ordered, `Ma sélection · ${ordered.length} essai${ordered.length > 1 ? 's' : ''}`, []);
});
$('clear-selection').addEventListener('click', () => { selection = []; saveSelection(); renderSelection(); });
new ResizeObserver(layoutFrames).observe($('comparer'));
start();
