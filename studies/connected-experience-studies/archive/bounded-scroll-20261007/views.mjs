import { icon, escapeHTML as esc } from './icons.mjs';

// All records are fictional. Mutations stay in this study's local browser state.
export function createState() {
  return {
    version: 1,
    profile: { name: 'Leïla Mansour', login: 'lmansour', campus: '42 Paris', status: 'Cadet', arrival: '2024', promotion: '23', bio: 'J’aime comprendre ce qui se cache derrière les outils du quotidien. Je construis des projets qui mêlent systèmes, interfaces et apprentissage collectif.', skills: 'C, Unix, JavaScript, Interfaces', link: '', bioVisibility: 'public', skillsVisibility: 'public', socialVisibility: 'public', socialLinks: [], contact: true },
    projects: [
      { id: 'minishell', title: 'Minishell', summary: 'Un petit shell, une grande exploration des systèmes Unix.', content: 'Un interpréteur de commandes construit à deux pour comprendre le fonctionnement d’un shell.\n\nNous avons travaillé sur le parsing, les redirections et la coordination des processus. Le projet nous a appris à décomposer un problème complexe et à documenter nos décisions.', technologies: 'C, Unix, Bash', team: 'Leïla Mansour, Adam Benali', link: '', visibility: 'public', status: 'published', art: 'terminal' },
      { id: 'common-ground', title: 'Common Ground', summary: 'Un espace pour retrouver les ressources partagées au campus.', content: 'Une première exploration des échanges de ressources entre étudiants. L’objectif : rendre les petites découvertes plus faciles à retrouver.', technologies: 'JavaScript, CSS', team: 'Leïla Mansour', link: '', visibility: 'public', status: 'draft', art: 'grid' }
    ],
    articles: [{ id: 'learning-together', title: 'Ce qu’on apprend en construisant à deux', summary: 'Du premier désaccord à une méthode de travail commune.', content: 'On pense souvent que le plus difficile est d’écrire le code. Sur notre premier projet en binôme, nous avons surtout appris à expliquer ce que nous voulions faire.\n\nPrendre le temps de nommer les choses et de dessiner les étapes a changé notre façon de collaborer.', technologies: 'Apprentissage, Communauté', team: 'Leïla Mansour', link: '', visibility: 'public', status: 'draft', art: 'journal' }],
    conversations: [
      { id: 'adam', name: 'Adam Benali', initials: 'AB', login: 'abenali', unread: 1, messages: [{ mine: false, text: 'Salut Leïla ! J’ai parcouru la présentation de Minishell. La partie sur les processus est super claire.', time: '10:24' }, { mine: true, text: 'Merci ! J’ai ajouté le schéma qu’on avait dessiné ensemble.', time: '10:28' }, { mine: false, text: 'On pourrait aussi raconter comment on a organisé le travail à deux ?', time: '10:32' }] },
      { id: 'ines', name: 'Inès Laurent', initials: 'IL', login: 'ilaurent', unread: 1, messages: [{ mine: false, text: 'Bonjour Leïla, ton retour d’expérience m’intéresse pour le Journal. On en parle ici quand tu veux ?', time: 'Hier' }] }
    ],
    notifications: [
      { id: 'n1', title: 'Adam vous a écrit', text: 'Une idée pour compléter la présentation de Minishell.', kind: 'message', time: 'Il y a 12 min', read: false, route: 'messages/adam' },
      { id: 'n2', title: 'Les 42 Awards vous attendent', text: 'Découvrez l’édition et les candidatures de démonstration.', kind: 'award', time: 'Il y a 1 h', read: false, route: 'awards' },
      { id: 'n3', title: 'Votre brouillon est à portée de main', text: '« Ce qu’on apprend en construisant à deux »', kind: 'journal', time: 'Hier', read: false, route: 'article-edit/learning-together' },
      { id: 'n4', title: 'Bienvenue dans votre espace', text: 'Prenez un moment pour personnaliser votre présentation.', kind: 'user', time: 'Hier', read: true, route: 'profile' }
    ],
    participations: [], votes: {}, voteDraft: { category: 'interface', candidate: '' },
    settings: { messages: true, awards: true, editorial: false, emailDigest: false, online: true, discoverable: true },
    tickets: [], notificationFilter: 'all', selectedConversation: 'adam'
  };
}

const categories = [{ id: 'interface', title: 'Interface & expérience', text: 'Les idées qui rendent un outil agréable à utiliser.' }, { id: 'documentation', title: 'Documentation', text: 'Les explications qui donnent envie de comprendre.' }, { id: 'collectif', title: 'Création collective', text: 'Ce que l’on réussit à construire ensemble.' }];
const candidates = [
  { id: 'atlas', title: 'Atlas', summary: 'Une bibliothèque visuelle pour mieux explorer les connaissances.', team: 'Inès Laurent · 42 Lyon', art: 'atlas', content: 'Atlas propose une navigation visuelle entre des ressources d’apprentissage. Cette candidature fictive sert à explorer la consultation et le parcours de vote.', technologies: 'TypeScript, Design, Accessibilité' },
  { id: 'echo', title: 'Echo', summary: 'Une interface musicale qui invite à expérimenter à plusieurs.', team: 'Adam Benali · 42 Paris', art: 'echo', content: 'Echo met les petites expériences sonores à portée de tous. Cette candidature fictive illustre un second projet pour comparer les présentations avant de voter.', technologies: 'Web Audio, JavaScript, CSS' }
];
const publicArticle = { id: 'public-learning', title: 'Apprendre, puis transmettre', summary: 'Ces petites habitudes qui font grandir une communauté.', content: 'Une question posée au bon moment peut débloquer plusieurs heures de recherche. Sur un campus, les connaissances circulent entre les personnes autant qu’entre les lignes de code.\n\nPartager son cheminement, y compris les impasses, permet à d’autres de commencer un peu plus loin. Ce récit fictif illustre la place du Journal dans Horizon.', team: 'Inès Laurent', technologies: 'Communauté, Transmission', art: 'journal', status: 'published', visibility: 'public' };
const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const link = (route, label, symbol, type = '') => `<a class="button ${type}" href="#${esc(route)}" data-route="${esc(route)}">${symbol ? icon(symbol) : ''}<span>${esc(label)}</span></a>`;
const button = (action, label, symbol, type = '', data = '') => `<button type="button" class="button ${type}" data-action="${action}" ${data}>${symbol ? icon(symbol) : ''}<span>${esc(label)}</span></button>`;
const tag = (value, type = '') => `<span class="tag ${type}">${esc(value)}</span>`;
const heading = (eyebrow, title, text = '', actions = '') => `<header class="page-heading"><div><p class="eyebrow">${esc(eyebrow)}</p><h1 class="page-title" tabindex="-1">${esc(title)}</h1>${text ? `<p class="muted">${esc(text)}</p>` : ''}</div>${actions ? `<div class="row">${actions}</div>` : ''}</header>`;
const paragraphs = text => String(text || '').split(/\n\s*\n/).map(p => `<p>${esc(p).replaceAll('\n', '<br>')}</p>`).join('');
const status = item => `<span class="status ${item.status === 'published' ? 'published' : 'draft'}">${item.status === 'published' ? 'Publié' : 'Brouillon'}</span>`;
const avatar = (name, image = false) => image ? '<img class="avatar" src="assets/leila-mansour.svg" alt="Portrait illustré de Leïla">' : `<span class="avatar" aria-hidden="true">${esc(name)}</span>`;
const art = item => `<div class="card-art art-${esc(item.art || 'grid')}" aria-hidden="true"><span>${item.art === 'terminal' ? '&gt;_ ' : item.art === 'journal' ? 'Aa' : '◌'}</span><strong>${esc(item.title)}</strong><span>${item.art === 'terminal' ? 'a little shell / a lot to learn' : 'made together'}</span></div>`;
const field = (label, name, value, options = {}) => `<label class="field ${options.wide ? 'wide' : ''}"><span>${esc(label)}</span>${options.textarea ? `<textarea name="${name}" rows="${options.rows || 4}" maxlength="${options.max || 8000}" ${options.required ? 'required' : ''}>${esc(value || '')}</textarea>` : `<input name="${name}" type="${options.type || 'text'}" value="${esc(value || '')}" maxlength="${options.max || 200}" ${options.required ? 'required' : ''} ${options.placeholder ? `placeholder="${esc(options.placeholder)}"` : ''}>`}${options.hint ? `<small class="muted">${esc(options.hint)}</small>` : ''}</label>`;
const select = (label, name, value, options) => `<label class="field"><span>${esc(label)}</span><select name="${name}">${options.map(([id, title]) => `<option value="${esc(id)}" ${id === value ? 'selected' : ''}>${esc(title)}</option>`).join('')}</select></label>`;
const platforms = ['GitHub', 'Facebook', 'X', 'Instagram', 'LinkedIn', 'Site web', 'Autre'];
const safeURL = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; } };
const socialRow = (entry = {}) => `<div class="social-entry" data-social-row>${select('Réseau', 'socialPlatform', entry.platform || 'GitHub', platforms.map(p => [p, p]))}${field('Adresse du profil', 'socialURL', entry.url, { type: 'url', max: 1000, placeholder: 'https://…', required: true, hint: 'Adresse complète en https:// ou http://.' })}${field('Libellé (facultatif)', 'socialLabel', entry.label, { max: 70, placeholder: 'Mon portfolio, mon compte…' })}<button class="icon-button" type="button" data-action="remove-social" aria-label="Retirer ce lien">${icon('close')}</button></div>`;
const empty = (title, text, action = '') => `<div class="empty-state">${icon('projects')}<h2>${esc(title)}</h2><p class="muted">${esc(text)}</p>${action}</div>`;

export function mountView(host, { route, state, navigate, notify, onChange }) {
  let currentRoute = route;
  const listeners = new AbortController();
  const changed = () => onChange?.();
  const render = () => { host.innerHTML = view(currentRoute); };
  const rerenderFocus = selector => { render(); host.querySelector(selector)?.focus(); };
  const getItem = (kind, id) => state[kind].find(item => item.id === id);
  const categoryName = id => categories.find(c => c.id === id)?.title || 'Catégorie';
  const notification = (title, text, destination, kind = 'bell') => state.notifications.unshift({ id: uid('notification'), title, text, route: destination, kind, read: false, time: 'À l’instant' });
  const readConversation = conversation => {
    if (!conversation) return;
    const unread = conversation.unread;
    conversation.unread = 0;
    state.selectedConversation = conversation.id;
    const linked = state.notifications.filter(n => n.route === `messages/${conversation.id}` && !n.read);
    linked.forEach(n => { n.read = true; });
    if (unread || linked.length) changed();
  };

  function dashboard() {
    const drafts = [...state.projects.map(p => ({ ...p, kind: 'project' })), ...state.articles.map(a => ({ ...a, kind: 'article' }))].filter(p => p.status === 'draft');
    const unreadMessages = state.conversations.reduce((n, c) => n + c.unread, 0);
    return heading('Mon espace', `Bonjour ${state.profile.name.split(' ')[0]}.`, 'Vos idées, vos échanges, votre prochain pas.', link('profile/preview', 'Voir mon profil', 'eye', 'quiet')) +
      `<div class="stat-grid">${[
        ['projects', state.projects.length, state.projects.length > 1 ? 'projets' : 'projet', 'projects'], ['journal', state.articles.length, state.articles.length > 1 ? 'articles' : 'article', 'articles'], ['message', unreadMessages, unreadMessages > 1 ? 'messages non lus' : 'message non lu', 'messages'], ['award', state.participations.length, state.participations.length > 1 ? 'participations' : 'participation', 'participations']
      ].map(([symbol, count, name, destination]) => `<a class="stat" href="#${destination}" data-route="${destination}">${icon(symbol)}<strong>${count}</strong><span>${name}</span>${icon('arrow')}</a>`).join('')}</div>
      <div class="split"><section class="panel"><div class="row spread"><div><p class="eyebrow">Continuer à créer</p><h2>Vos idées prennent forme</h2></div>${tag(`${drafts.length} brouillons`)}</div><div class="stack">${drafts.map(item => `<a class="list-row" href="#${item.kind}-edit/${item.id}" data-route="${item.kind}-edit/${item.id}">${icon(item.kind === 'project' ? 'projects' : 'journal')}<div><strong>${esc(item.title)}</strong><p class="muted">${item.kind === 'project' ? 'Projet' : 'Article'} · Brouillon personnel</p></div>${icon('arrow')}</a>`).join('') || '<p class="muted">Toutes vos publications sont à jour.</p>'}</div><div class="form-actions">${link('project-new', 'Nouveau projet', 'plus', 'primary')}${link('article-new', 'Écrire un article', 'journal', 'quiet')}</div></section>
      <section class="panel award-teaser"><p class="eyebrow">42 Awards · Édition démo</p><h2>Faites rayonner ce que vous créez.</h2><p class="muted">Découvrez les projets de la communauté ou préparez votre candidature.</p><div class="form-actions">${link('awards', 'Explorer les Awards', 'arrow', 'quiet')}${link('participations/new', 'Participer', 'award', 'primary')}</div></section></div>
      <section class="panel"><div class="row spread"><h2>À ne pas manquer</h2>${link('notifications', 'Toute l’activité', 'arrow', 'quiet small')}</div>${state.notifications.slice(0, 2).map(n => `<a class="list-row" href="#${n.route}" data-open-notification="${n.id}">${icon(n.kind)}<div><strong>${esc(n.title)}</strong><p class="muted">${esc(n.text)}</p></div>${!n.read ? '<span class="unread-dot" aria-label="Non lu"></span>' : ''}</a>`).join('')}</section>`;
  }

  function profile(preview = false) {
    const p = state.profile;
    if (preview) return heading('Votre profil', 'Aperçu public', 'Voici ce que vos réglages rendent visible dans cet essai.', link('profile', 'Modifier mon profil', 'edit', 'quiet')) +
      `<div class="profile-banner">${avatar('', true)}<div><p class="eyebrow">${esc(p.status)} · ${esc(p.campus)}</p><h2>${esc(p.name)}</h2><p class="muted">@${esc(p.login)} · Arrivée ${esc(p.arrival)} · Promotion ${esc(p.promotion)}</p></div></div>
      <div class="split"><section class="panel"><h2>À propos</h2>${p.bioVisibility === 'public' ? paragraphs(p.bio) : '<p class="muted">Cette présentation est privée.</p>'}${p.skillsVisibility === 'public' ? `<h3>Compétences</h3><div class="row">${p.skills.split(',').filter(Boolean).map(s => tag(s.trim())).join('')}</div>` : '<p class="muted">Les compétences sont privées.</p>'}<h3>Retrouvez-moi ailleurs</h3>${p.socialVisibility === 'private' ? '<p class="muted">Ces liens sont privés.</p>' : p.socialLinks?.filter(s => safeURL(s.url)).length ? `<div class="row social-links">${p.socialLinks.filter(s => safeURL(s.url)).map(s => `<a class="button quiet small" href="${esc(safeURL(s.url))}" target="_blank" rel="noopener noreferrer">${icon('globe')}<span>${esc(s.label || s.platform)}</span>${icon('arrow')}<span class="sr-only"> · Nouvel onglet</span></a>`).join('')}</div>` : '<p class="muted">Aucun lien renseigné.</p>'}</section><section class="panel"><h2>Mes projets publics</h2>${state.projects.filter(i => i.status === 'published' && i.visibility === 'public').map(i => `<a class="list-row" href="#project-read/${i.id}" data-route="project-read/${i.id}">${icon('projects')}<strong>${esc(i.title)}</strong>${icon('arrow')}</a>`).join('') || '<p class="muted">Aucun projet public.</p>'}<h3>Distinctions</h3><p class="muted">Aucune distinction dans cet exemple.</p>${link('awards', 'Découvrir les 42 Awards', 'award', 'quiet small')}</section></div>`;
    return heading('Mon espace', 'Mon profil', 'Racontez votre parcours, choisissez ce que vous partagez.', link('profile/preview', 'Aperçu public', 'eye', 'quiet')) +
      `<div class="profile-banner">${avatar('', true)}<div><h2>${esc(p.name)}</h2><p class="muted">@${esc(p.login)} · ${esc(p.campus)} · ${esc(p.status)}</p><span class="tag">Identité Intra · exemple</span></div></div>
      <form data-form="profile" class="editor"><section class="panel"><div class="row spread"><h2>Votre présentation</h2>${tag('Modifiable par vous')}</div><div class="form-grid">${field('À propos de moi', 'bio', p.bio, { textarea: true, wide: true, max: 1000 })}${select('Qui peut voir ma présentation ?', 'bioVisibility', p.bioVisibility, [['public', 'Tout le monde'], ['private', 'Moi uniquement']])}${field('Compétences', 'skills', p.skills, { hint: 'Séparez les compétences par des virgules.' })}${select('Qui peut voir mes compétences ?', 'skillsVisibility', p.skillsVisibility, [['public', 'Tout le monde'], ['private', 'Moi uniquement']])}</div><label class="checks"><input name="contact" type="checkbox" ${p.contact ? 'checked' : ''}><span>Afficher la possibilité de me contacter</span></label></section>
      <section class="panel"><div class="row spread"><div><h2>Réseaux & liens</h2><p class="muted">GitHub, Facebook, X, Instagram, LinkedIn, site personnel… Ajoutez uniquement ce que vous souhaitez partager.</p></div>${button('add-social', 'Ajouter un lien', 'plus', 'quiet small')}</div><div class="stack" data-social-list>${(p.socialLinks || []).map(socialRow).join('')}</div><p class="muted" data-social-empty ${p.socialLinks?.length ? 'hidden' : ''}>Aucun lien renseigné. Tous les réseaux sont facultatifs.</p>${select('Qui peut voir mes liens ?', 'socialVisibility', p.socialVisibility || 'public', [['public', 'Tout le monde'], ['private', 'Moi uniquement']])}</section>
      <section class="panel"><h2>Informations rattachées au compte</h2><p class="muted">Dans cet essai, ces champs représentent des données issues de l’Intra. Ils ne se modifient pas ici ; leur source et les droits réels restent à définir.</p><dl class="identity-details"><div><dt>Identifiant</dt><dd>@${esc(p.login)}</dd></div><div><dt>Campus</dt><dd>${esc(p.campus)}</dd></div><div><dt>Arrivée</dt><dd>${esc(p.arrival)}</dd></div><div><dt>Promotion</dt><dd>${esc(p.promotion)}</dd></div></dl></section><div class="form-actions"><button class="button primary" type="submit">${icon('check')}Enregistrer le profil</button>${link('home', 'Retour à mon espace', 'back', 'quiet')}</div></form>`;
  }

  function publications(kind) {
    const project = kind === 'projects';
    const singular = project ? 'project' : 'article';
    return heading('Mon espace', project ? 'Mes projets' : 'Mes articles', 'Du premier brouillon à la publication.', link(`${singular}-new`, project ? 'Nouveau projet' : 'Écrire un article', 'plus', 'primary')) +
      `<div class="tabs" aria-label="État des publications">${['all', 'draft', 'published'].map(value => `<button class="button quiet small ${state[`${kind}Filter`] === value || (!state[`${kind}Filter`] && value === 'all') ? 'active' : ''}" data-action="publication-filter" data-kind="${kind}" data-value="${value}" aria-pressed="${(state[`${kind}Filter`] || 'all') === value}">${value === 'all' ? 'Tout' : value === 'draft' ? 'Brouillons' : 'Publiés'}</button>`).join('')}</div><div class="card-grid">${state[kind].filter(item => !state[`${kind}Filter`] || state[`${kind}Filter`] === 'all' || item.status === state[`${kind}Filter`]).map(item => `<article class="card">${art(item)}<div class="card-body"><div class="row spread">${status(item)}${tag(item.visibility === 'public' ? 'Public' : 'Privé')}</div><h2>${esc(item.title)}</h2><p class="muted">${esc(item.summary)}</p><div class="form-actions">${link(`${singular}-edit/${item.id}`, item.status === 'draft' ? 'Reprendre' : 'Modifier', 'edit', 'quiet small')}${link(`${singular}-preview/${item.id}`, 'Aperçu', 'eye', 'quiet small')}${project && item.status === 'published' ? link(`participations/new/${item.id}`, 'Awards', 'award', 'quiet small') : ''}</div></div></article>`).join('') || empty('Rien ici pour le moment', 'Changez le filtre ou commencez une nouvelle publication.')}</div>`;
  }

  function editor(kind, id) {
    const project = kind === 'projects';
    const singular = project ? 'project' : 'article';
    const saved = getItem(kind, id);
    const item = saved ? { ...saved, ...(state.editing?.[`${kind}:${id}`] || {}) } : null;
    if (!item) return missing();
    return heading(project ? 'Mes projets' : 'Mes articles', item.title || (project ? 'Nouveau projet' : 'Nouvel article'), item.status === 'published' ? 'Préparez les modifications, puis republiez depuis l’aperçu.' : 'Commencez par l’essentiel. Votre brouillon reste personnel.', link(kind, 'Mes publications', 'back', 'quiet')) +
      `<form data-form="editor" data-kind="${kind}" data-id="${item.id}" class="editor"><section class="panel"><div class="row spread"><h2>${project ? 'Présenter votre projet' : 'Raconter votre histoire'}</h2>${status(item)}</div><div class="form-grid">${field('Titre', 'title', item.title, { required: true, max: 100, wide: true })}${field(project ? 'Le projet en quelques mots' : 'Chapeau', 'summary', item.summary, { textarea: true, rows: 2, max: 400, required: true, wide: true })}${field(project ? 'Réalisation et apprentissages' : 'Votre article', 'content', item.content, { textarea: true, rows: 8, required: true, wide: true })}${field(project ? 'Technologies' : 'Thèmes', 'technologies', item.technologies, { hint: 'Séparez les éléments par des virgules.' })}${field(project ? 'Équipe' : 'Auteurs', 'team', item.team, { hint: 'Noms d’exemple dans cette étude ; aucune invitation envoyée.' })}${field(project ? 'Lien du projet (facultatif)' : 'Source ou lien (facultatif)', 'link', item.link, { type: 'url', placeholder: 'https://…' })}${select('Visibilité après publication', 'visibility', item.visibility, [['public', 'Public · visible dans Horizon'], ['private', 'Privé · moi uniquement']])}</div></section><div class="form-actions"><button type="submit" name="intent" value="save" formnovalidate class="button quiet">${icon('check')}Enregistrer le brouillon</button><button type="submit" name="intent" value="preview" class="button primary">${icon('eye')}Prévisualiser</button></div><p class="muted editor-hint">${item.status === 'published' ? 'La version publiée reste visible pendant la préparation de vos changements.' : 'Aucune publication avant votre confirmation dans l’aperçu.'}</p></form>`;
  }

  function publicationPreview(kind, id, reading = false) {
    const project = kind === 'projects';
    const singular = project ? 'project' : 'article';
    let item = getItem(kind, id);
    if (id === 'public-learning') item = publicArticle;
    if (!item) return missing();
    const own = id !== 'public-learning';
    const shown = !reading && state.editing?.[`${kind}:${id}`] ? { ...item, ...state.editing[`${kind}:${id}`] } : item;
    const returnRoute = reading ? (own && (item.visibility !== 'public' || item.status !== 'published') ? kind : project ? 'public-projects' : 'public-journal') : `${singular}-edit/${id}`;
    return heading(reading ? (project ? 'Projet' : 'Le journal') : 'Aperçu avant publication', shown.title, shown.summary, link(returnRoute, reading ? 'Retour' : 'Continuer à modifier', 'back', 'quiet')) +
      `${!reading ? `<div class="notice">${icon('eye')}<span>${shown.visibility === 'private' ? 'Cette publication sera visible uniquement par vous.' : 'Cette publication sera visible dans la découverte publique de cet essai.'}</span></div>` : ''}
      <article class="panel reading content-preview">${art(shown)}<div class="row">${tag(shown.team || 'Leïla Mansour')}${tag('42 Paris')}${tag('Exemple fictif')}</div><h2>${project ? 'La réalisation' : 'Le récit'}</h2>${paragraphs(shown.content)}<div class="row">${String(shown.technologies || '').split(',').filter(Boolean).map(t => tag(t.trim())).join('')}</div>${shown.link ? `<p class="muted">Lien renseigné : ${esc(shown.link)}</p>` : ''}</article>
      ${!reading ? `<div class="form-actions">${button('publish', item.status === 'published' ? 'Publier les modifications' : (project ? 'Publier le projet' : 'Publier l’article'), 'check', 'primary', `data-kind="${kind}" data-id="${id}"`)}${link(kind, 'Retrouver mes publications', 'arrow', 'quiet')}</div>` : own ? `<div class="form-actions">${link(`${singular}-edit/${id}`, 'Modifier', 'edit', 'quiet')}${project ? link(`participations/new/${id}`, 'Participer aux Awards', 'award', 'primary') : ''}</div>` : link('messages/ines', 'Écrire à Inès', 'message', 'quiet')}`;
  }

  function messages(id) {
    const conversation = state.conversations.find(c => c.id === (id || state.selectedConversation)) || state.conversations[0];
    readConversation(conversation);
    return heading('Échanger', 'Messages', 'Des conversations privées, à l’échelle de votre communauté.') +
      `<div class="message-layout panel"><nav class="conversation-list" aria-label="Conversations">${state.conversations.map(c => `<a class="conversation-link ${c.id === conversation.id ? 'active' : ''}" href="#messages/${c.id}" data-route="messages/${c.id}" ${c.id === conversation.id ? 'aria-current="page"' : ''}>${avatar(c.initials)}<div><strong>${esc(c.name)}</strong><p class="muted">${esc(c.messages.at(-1).text)}</p></div>${c.unread ? `<span class="count-badge">${c.unread}</span>` : ''}</a>`).join('')}</nav><section class="conversation"><header class="conversation-heading">${avatar(conversation.initials)}<div><h2>${esc(conversation.name)}</h2><p class="muted">@${esc(conversation.login)} · Compte fictif</p></div></header><div class="message-thread" role="log" aria-label="Fil de conversation">${conversation.messages.map(m => `<div class="bubble ${m.mine ? 'mine' : ''}"><p>${esc(m.text)}</p><time>${esc(m.time)}</time></div>`).join('')}</div><form class="message-compose" data-form="message" data-id="${conversation.id}"><label class="field"><span class="sr-only">Votre message</span><textarea name="message" rows="2" maxlength="1500" required placeholder="Écrire un message…"></textarea></label><button class="button primary" type="submit" aria-label="Envoyer le message">${icon('send')}<span>Envoyer</span></button></form><p class="muted message-note">Simulation locale · Aucun message n’est transmis.</p></section></div>`;
  }

  function notifications() {
    const unread = state.notifications.filter(n => !n.read).length;
    const items = state.notifications.filter(n => state.notificationFilter !== 'unread' || !n.read);
    return heading('Mon activité', 'Notifications', `${unread} notification${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}.`, button('read-all', 'Tout marquer comme lu', 'check', 'quiet')) +
      `<div class="tabs">${['all', 'unread'].map(value => `<button class="button quiet small ${state.notificationFilter === value ? 'active' : ''}" data-action="notification-filter" data-value="${value}" aria-pressed="${state.notificationFilter === value}">${value === 'all' ? 'Toute l’activité' : 'Non lues'}</button>`).join('')}</div><section class="panel notification-list">${items.map(n => `<article class="notification-item ${n.read ? 'is-read' : 'is-unread'}">${icon(n.kind)}<a href="#${n.route}" data-open-notification="${n.id}"><strong>${esc(n.title)}</strong><p>${esc(n.text)}</p><span class="muted">${esc(n.time)}</span></a><button class="icon-button" type="button" data-action="toggle-read" data-id="${n.id}" aria-label="${n.read ? 'Marquer comme non lue' : 'Marquer comme lue'} : ${esc(n.title)}" title="${n.read ? 'Marquer comme non lue' : 'Marquer comme lue'}">${icon(n.read ? 'bell' : 'check')}</button></article>`).join('') || empty('Vous êtes à jour', 'Aucune notification non lue pour le moment.')}</section><div class="form-actions">${link('settings', 'Mes préférences de notification', 'settings', 'quiet')}</div>`;
  }

  function awards(subroute) {
    if (subroute === 'vote' || subroute === 'review') return vote(subroute === 'review');
    return heading('La communauté en lumière', '42 Awards', 'Des projets, des idées et le chemin parcouru.', link('participations', 'Mes participations', 'user', 'quiet')) +
      `<section class="award-hero"><div><p class="eyebrow">Édition de démonstration · 42 Paris</p><h2>Il y a du talent<br>derrière chaque ligne.</h2><p>Découvrez les créations, échangez avec leurs auteurs et essayez les parcours de participation et de vote.</p><div class="form-actions">${link('awards/vote', 'Découvrir & voter', 'award', 'primary')}${link('participations/new', 'Présenter mon projet', 'plus', 'quiet')}</div></div><div class="award-emblem" aria-hidden="true">${icon('award')}<span>42<br>AWARDS</span></div></section>
      <p class="notice">Édition, catégories et candidatures fictives. Le calendrier, l’éligibilité et les modalités de vote restent à définir.</p><section><div class="row spread"><h2>Des façons différentes de se distinguer</h2>${tag('3 catégories d’exemple')}</div><div class="award-grid">${categories.map((c, index) => `<article class="card category-card"><span class="category-number">0${index + 1}</span><h3>${esc(c.title)}</h3><p class="muted">${esc(c.text)}</p>${button('category-vote', 'Voir les candidatures', 'arrow', 'quiet small', `data-category="${c.id}"`)}</article>`).join('')}</div></section><section><div class="row spread"><h2>À découvrir</h2>${link('awards/vote', 'Toutes les candidatures', 'arrow', 'quiet small')}</div><div class="card-grid">${candidates.map(candidateCard).join('')}</div></section>`;
  }

  function candidateCard(item) {
    return `<article class="card">${art(item)}<div class="card-body"><p class="eyebrow">Candidature de démonstration</p><h2>${esc(item.title)}</h2><p class="muted">${esc(item.summary)}</p><p class="muted">${esc(item.team)}</p>${link(`candidate/${item.id}`, 'Voir le projet', 'arrow', 'quiet small')}</div></article>`;
  }

  function vote(review = false) {
    const draft = state.voteDraft;
    const choice = candidates.find(c => c.id === draft.candidate);
    if (review && !choice) return missing('Choisissez d’abord une candidature.', 'awards/vote');
    if (review) return heading('42 Awards · Édition démo', 'Votre choix, en un regard', 'Vérifiez votre sélection avant de la confirmer.', link('awards/vote', 'Modifier mon choix', 'back', 'quiet')) +
      `<section class="panel vote-review"><p class="eyebrow">${esc(categoryName(draft.category))}</p>${art(choice)}<h2>${esc(choice.title)}</h2><p class="muted">${esc(choice.team)}</p><p class="notice">Ce vote est une simulation locale. Aucun classement réel ne sera modifié.</p>${button('confirm-vote', 'Confirmer mon vote de démo', 'check', 'primary')}</section>`;
    const recorded = state.votes[draft.category];
    return heading('42 Awards · Édition démo', 'Découvrir, comparer, voter', 'Prenez le temps de parcourir les projets.', link('awards', 'Les Awards', 'back', 'quiet')) +
      `${recorded ? `<div class="notice">${icon('check')}<span>Votre choix enregistré pour cette catégorie : <strong>${esc(candidates.find(c => c.id === recorded)?.title || '')}</strong>. Vous pouvez essayer un autre choix.</span></div>` : ''}<form data-form="vote"><div class="panel">${select('Catégorie de démonstration', 'category', draft.category, categories.map(c => [c.id, c.title]))}</div><div class="card-grid vote-grid">${candidates.map(c => `<article class="card">${art(c)}<div class="card-body"><h2>${esc(c.title)}</h2><p class="muted">${esc(c.summary)}</p><p class="muted">${esc(c.team)}</p>${link(`candidate/${c.id}`, 'Lire la présentation', 'eye', 'quiet small')}<label class="radio-card"><input type="radio" name="candidate" value="${c.id}" required ${draft.candidate === c.id ? 'checked' : ''}><span>Choisir ${esc(c.title)}</span></label></div></article>`).join('')}</div><p class="muted">Un choix simple pour tester l’interface ; le nombre et la pondération des votes ne sont pas fixés.</p><div class="form-actions"><button class="button primary" type="submit">${icon('arrow')}Vérifier mon choix</button></div></form>`;
  }

  function participations(subroute, projectId) {
    if (subroute === 'new') {
      const published = state.projects.filter(p => p.status === 'published');
      return heading('42 Awards · Édition démo', 'Présenter un projet', 'Une candidature commence avec ce que vous avez construit.', link('participations', 'Mes participations', 'back', 'quiet')) +
        (published.length ? `<form data-form="participation" class="panel editor"><h2>Votre candidature</h2><div class="form-grid">${select('Projet à présenter', 'project', published.some(p => p.id === projectId) ? projectId : published[0].id, published.map(p => [p.id, p.title]))}${select('Catégorie de démonstration', 'category', 'interface', categories.map(c => [c.id, c.title]))}${field('Ce que vous souhaitez mettre en avant', 'note', '', { textarea: true, wide: true, required: true, max: 700, placeholder: '' })}</div><p class="notice">Cet essai part de vos projets publiés. Règles d’éligibilité, calendrier et validation réelle restent à définir.</p><button class="button primary" type="submit">${icon('check')}Enregistrer cette candidature de démo</button></form>` : empty('Publiez votre premier projet', 'Vous pourrez ensuite essayer une candidature.', link('project-new', 'Créer un projet', 'plus', 'primary')));
    }
    return heading('Mon espace', 'Mes participations', 'Retrouvez vos candidatures et vos choix.', link('participations/new', 'Présenter un projet', 'plus', 'primary')) +
      `<section class="panel"><h2>Mes candidatures</h2>${state.participations.length ? state.participations.map(p => `<div class="list-row">${icon('award')}<div><strong>${esc(getItem('projects', p.project)?.title || 'Projet')}</strong><p class="muted">${esc(categoryName(p.category))} · Édition démo</p><p>${esc(p.note)}</p></div><span class="status published">Enregistrée localement</span></div>`).join('') : empty('Le premier pas vous appartient', 'Choisissez un projet dont vous avez envie de partager le chemin.', link('participations/new', 'Préparer une candidature', 'award', 'quiet'))}</section>
      <section class="panel"><h2>Mes votes</h2>${Object.entries(state.votes).length ? Object.entries(state.votes).map(([category, id]) => `<div class="list-row">${icon('check')}<div><strong>${esc(candidates.find(c => c.id === id)?.title || '')}</strong><p class="muted">${esc(categoryName(category))} · Vote local de démonstration</p></div>${button('category-vote', 'Revoir', 'arrow', 'quiet small', `data-category="${category}"`)}</div>`).join('') : '<p class="muted">Vous n’avez pas encore essayé le vote.</p>'}${link('awards/vote', 'Explorer les candidatures', 'arrow', 'quiet')}</section>`;
  }

  function settings() {
    const toggle = (name, title, text) => `<label class="settings-row"><span><strong>${title}</strong><small class="muted">${text}</small></span><input type="checkbox" name="${name}" role="switch" ${state.settings[name] ? 'checked' : ''}><span class="switch-track" aria-hidden="true"></span></label>`;
    return heading('Mon espace', 'Paramètres', 'Un espace qui respecte votre façon de participer.') +
      `<form data-form="settings" class="editor"><section class="panel"><p class="eyebrow">Compte & accès</p><h2>${esc(state.profile.name)}</h2><div class="list-row">${icon('lock')}<div><strong>Connexion Intra 42 · simulée</strong><p class="muted">@lmansour · Aucun mot de passe demandé dans cette étude.</p></div></div><p class="muted">Création et récupération d’accès dépendront du mode d’authentification retenu. Cet écran ne gère aucune session réelle.</p><div class="form-actions">${link('profile', 'Gérer mon profil', 'user', 'quiet small')}<button type="button" class="button quiet signout">${icon('logout')}Se déconnecter</button></div></section><section class="panel"><h2>Notifications</h2>${toggle('messages', 'Messages privés', 'Être informée des nouveaux échanges.')}${toggle('awards', '42 Awards', 'Suivre les participations et l’actualité des éditions.')}${toggle('editorial', 'Le journal', 'Retrouver l’activité liée à mes contributions.')}${toggle('emailDigest', 'Récapitulatif par e-mail', 'Préférence illustrée ; aucun e-mail ne sera envoyé.')}</section><section class="panel"><h2>Confidentialité</h2>${toggle('online', 'Présence dans la messagerie', 'Illustrer le partage de mon état de connexion.')}${toggle('discoverable', 'Apparaître dans la découverte', 'Rendre mon profil visible dans l’annuaire de cet essai.')}<p class="muted">Les réglages par information se trouvent dans Mon profil. Chaque publication possède aussi sa propre visibilité.</p></section><div class="form-actions"><button class="button primary" type="submit">${icon('check')}Enregistrer mes préférences</button>${link('home', 'Mon espace', 'back', 'quiet')}</div></form>`;
  }

  function help() {
    return heading('Horizon vous accompagne', 'Assistance', 'Une question, un problème ou quelque chose à signaler ?') +
      `<div class="split"><form class="panel" data-form="ticket"><h2>Ouvrir une demande</h2><div class="stack">${select('Sujet', 'topic', 'account', [['account', 'Compte et profil'], ['publication', 'Une publication'], ['awards', 'Les 42 Awards'], ['report', 'Signaler un contenu']])}${field('En quelques mots', 'title', '', { required: true })}${field('Votre message', 'message', '', { textarea: true, required: true, max: 1500 })}<p class="muted">Cette demande restera dans le prototype ; elle ne sera pas envoyée à une équipe.</p><button class="button primary" type="submit">${icon('send')}Créer la demande de démo</button></div></form><section class="panel"><h2>Mes demandes</h2>${state.tickets.length ? state.tickets.map(t => `<div class="list-row">${icon('help')}<div><strong>${esc(t.title)}</strong><p class="muted">${esc(t.message)}</p><span class="status draft">Créée localement</span></div></div>`).join('') : '<p class="muted">Vos demandes apparaîtront ici après leur création.</p>'}</section></div>`;
  }

  function publicContent(type) {
    if (type === 'projects') {
      const records = state.projects.filter(p => p.status === 'published' && p.visibility === 'public');
      return heading('Explorer Horizon', 'Projets', 'Des idées qui deviennent des réalisations.', link('project-new', 'Publier un projet', 'plus', 'primary')) + `<div class="card-grid">${records.map(p => `<article class="card">${art(p)}<div class="card-body"><h2>${esc(p.title)}</h2><p class="muted">${esc(p.summary)}</p>${link(`project-read/${p.id}`, 'Voir le projet', 'arrow', 'quiet small')}</div></article>`).join('')}${candidates.map(candidateCard).join('')}</div>`;
    }
    if (type === 'profiles') return heading('Explorer Horizon', 'Profils', 'Celles et ceux qui font la communauté.', link('profile', 'Gérer mon profil', 'edit', 'quiet')) + `<div class="card-grid profile-cards">${state.settings.discoverable ? `<article class="card"><div class="card-body">${avatar('', true)}${tag('Cadet')}<h2>${esc(state.profile.name)}</h2><p class="muted">@lmansour · 42 Paris</p>${link('profile/preview', 'Voir mon profil public', 'arrow', 'quiet small')}</div></article>` : ''}${state.conversations.map(c => `<article class="card"><div class="card-body">${avatar(c.initials)}${tag('Cadet')}<h2>${esc(c.name)}</h2><p class="muted">@${esc(c.login)} · ${c.id === 'ines' ? '42 Lyon' : '42 Paris'}</p>${link(`person/${c.id}`, 'Voir le profil', 'arrow', 'quiet small')}</div></article>`).join('')}</div>`;
    return heading('Explorer Horizon', 'Le journal', 'Les parcours se racontent aussi.', link('article-new', 'Écrire un article', 'plus', 'primary')) + `<div class="card-grid">${[publicArticle, ...state.articles.filter(a => a.status === 'published' && a.visibility === 'public')].map(a => `<article class="card">${art(a)}<div class="card-body"><h2>${esc(a.title)}</h2><p class="muted">${esc(a.summary)}</p>${link(`article-read/${a.id}`, 'Lire l’article', 'arrow', 'quiet small')}</div></article>`).join('')}</div>`;
  }

  function missing(text = 'Ce contenu n’est pas disponible dans cet essai.', destination = 'home') { return empty('Reprenons le fil', text, link(destination, 'Continuer', 'back', 'primary')); }

  function view(destination) {
    const [name, id, third] = destination.split('/');
    if (name === 'home') return dashboard();
    if (name === 'profile') return profile(id === 'preview');
    if (name === 'projects' || name === 'articles') return publications(name);
    if (name === 'project-new' || name === 'article-new') {
      const kind = name === 'project-new' ? 'projects' : 'articles';
      const singular = kind === 'projects' ? 'project' : 'article';
      const item = { id: uid(singular), title: '', summary: '', content: '', technologies: '', team: 'Leïla Mansour', link: '', visibility: 'public', status: 'draft', art: kind === 'projects' ? 'grid' : 'journal' };
      state[kind].unshift(item); changed();
      queueMicrotask(() => { if (!listeners.signal.aborted) navigate(`${singular}-edit/${item.id}`); });
      return editor(kind, item.id);
    }
    if (name === 'project-edit' || name === 'article-edit') return editor(name === 'project-edit' ? 'projects' : 'articles', id);
    if (name === 'project-preview' || name === 'article-preview' || name === 'project-read' || name === 'article-read') return publicationPreview(name.startsWith('project') ? 'projects' : 'articles', id, name.endsWith('read'));
    if (name === 'messages') return messages(id);
    if (name === 'notifications') return notifications();
    if (name === 'settings') return settings();
    if (name === 'help') return help();
    if (name === 'awards') return awards(id);
    if (name === 'participations') return participations(id, third);
    if (name.startsWith('public-')) return publicContent(name.slice(7));
    if (name === 'candidate') {
      const item = candidates.find(c => c.id === id); if (!item) return missing();
      return heading('42 Awards · Candidature démo', item.title, item.summary, link('awards/vote', 'Retour aux candidatures', 'back', 'quiet')) + `<article class="panel reading">${art(item)}<div class="row">${tag(item.team)}${tag('Exemple fictif')}</div><h2>À propos du projet</h2>${paragraphs(item.content)}<div class="row">${item.technologies.split(',').map(t => tag(t.trim())).join('')}</div></article><div class="form-actions">${button('choose-candidate', 'Choisir ce projet pour le vote', 'award', 'primary', `data-id="${item.id}"`)}</div>`;
    }
    if (name === 'person') {
      const person = state.conversations.find(c => c.id === id); if (!person) return missing();
      return heading('Profil de démonstration', person.name, `@${person.login} · ${person.id === 'ines' ? '42 Lyon' : '42 Paris'}`, link('public-profiles', 'Tous les profils', 'back', 'quiet')) + `<div class="profile-banner">${avatar(person.initials)}<div><h2>${esc(person.name)}</h2>${tag('Cadet')}${tag('Profil fictif')}</div></div><section class="panel"><h2>À propos</h2><p>Explorer, construire et partager les découvertes du parcours.</p><div class="form-actions">${link(`messages/${person.id}`, 'Contacter', 'message', 'primary')}${link(person.id === 'ines' ? 'article-read/public-learning' : 'candidate/echo', person.id === 'ines' ? 'Lire sa contribution' : 'Voir son projet', 'arrow', 'quiet')}</div></section>`;
    }
    return missing();
  }

  host.addEventListener('click', event => {
    const target = event.target.closest('a,button'); if (!target) return;
    if (target.tagName === 'A' && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    if (target.dataset.openNotification) {
      event.preventDefault(); const n = state.notifications.find(n => n.id === target.dataset.openNotification);
      if (n) { n.read = true; changed(); navigate(n.route); } return;
    }
    if (target.dataset.route) { event.preventDefault(); navigate(target.dataset.route); return; }
    const action = target.dataset.action;
    if (action === 'add-social') {
      const list = host.querySelector('[data-social-list]'); list.insertAdjacentHTML('beforeend', socialRow());
      host.querySelector('[data-social-empty]').hidden = true; list.lastElementChild.querySelector('select')?.focus();
    }
    if (action === 'remove-social') {
      target.closest('[data-social-row]')?.remove();
      host.querySelector('[data-social-empty]').hidden = Boolean(host.querySelector('[data-social-row]'));
      host.querySelector('[data-action="add-social"]')?.focus();
    }
    if (action === 'publication-filter') { state[`${target.dataset.kind}Filter`] = target.dataset.value; changed(); rerenderFocus(`[data-action="publication-filter"][data-value="${target.dataset.value}"]`); }
    if (action === 'notification-filter') { state.notificationFilter = target.dataset.value; changed(); rerenderFocus(`[data-action="notification-filter"][data-value="${target.dataset.value}"]`); }
    if (action === 'toggle-read') { const n = state.notifications.find(n => n.id === target.dataset.id); n.read = !n.read; changed(); rerenderFocus(state.notificationFilter === 'unread' ? '[data-action="notification-filter"][data-value="unread"]' : `[data-action="toggle-read"][data-id="${n.id}"]`); }
    if (action === 'read-all') { state.notifications.forEach(n => { n.read = true; }); changed(); rerenderFocus('[data-action="read-all"]'); notify('Toutes les notifications sont marquées comme lues.'); }
    if (action === 'publish') {
      const kind = target.dataset.kind; const item = getItem(kind, target.dataset.id);
      const edited = state.editing?.[`${kind}:${item.id}`]; const next = { ...item, ...(edited || {}) };
      if (!next.title.trim() || !next.summary.trim() || !next.content.trim()) { notify('Complétez le titre, la présentation et le contenu avant de publier.'); navigate(`${kind === 'projects' ? 'project' : 'article'}-edit/${item.id}`); return; }
      Object.assign(item, next);
      item.status = 'published'; if (state.editing) delete state.editing[`${kind}:${item.id}`];
      notification('Votre publication est prête', `« ${item.title} » est publiée dans cette démonstration.`, `${kind === 'projects' ? 'project' : 'article'}-read/${item.id}`, kind === 'projects' ? 'projects' : 'journal'); changed(); navigate(kind); notify('Publication enregistrée dans la démonstration.');
    }
    if (action === 'category-vote') { state.voteDraft.category = target.dataset.category; state.voteDraft.candidate = state.votes[state.voteDraft.category] || ''; changed(); navigate('awards/vote'); }
    if (action === 'choose-candidate') { state.voteDraft.candidate = target.dataset.id; changed(); navigate('awards/vote'); }
    if (action === 'confirm-vote') {
      if (!candidates.some(c => c.id === state.voteDraft.candidate)) return;
      state.votes[state.voteDraft.category] = state.voteDraft.candidate;
      notification('Votre vote de démo est enregistré', categoryName(state.voteDraft.category), 'participations', 'award'); changed(); navigate('participations'); notify('Vote de démonstration confirmé.');
    }
  }, { signal: listeners.signal });

  host.addEventListener('input', event => {
    if (event.target.name === 'socialURL') event.target.setCustomValidity(event.target.value && !safeURL(event.target.value) ? 'Utilisez une adresse complète en https:// ou http://.' : '');
  }, { signal: listeners.signal });

  host.addEventListener('change', event => {
    if (event.target.name === 'category' && event.target.closest('[data-form="vote"]')) {
      state.voteDraft.category = event.target.value; state.voteDraft.candidate = state.votes[event.target.value] || ''; changed(); rerenderFocus('[data-form="vote"] [name="category"]');
    }
    if (event.target.name === 'candidate' && event.target.closest('[data-form="vote"]')) { state.voteDraft.candidate = event.target.value; changed(); }
  }, { signal: listeners.signal });

  host.addEventListener('submit', event => {
    const form = event.target; if (!form.dataset.form) return; event.preventDefault();
    const data = new FormData(form); const values = Object.fromEntries(data.entries());
    if (form.dataset.form === 'profile') {
      const rows = [...form.querySelectorAll('[data-social-row]')];
      for (const row of rows) {
        const input = row.querySelector('[name="socialURL"]');
        if (!safeURL(input.value)) { input.setCustomValidity('Utilisez une adresse complète en https:// ou http://.'); input.reportValidity(); return; }
      }
      const socialLinks = rows.map(row => ({ platform: row.querySelector('[name="socialPlatform"]').value, url: safeURL(row.querySelector('[name="socialURL"]').value), label: row.querySelector('[name="socialLabel"]').value.trim() }));
      for (const key of ['bio', 'skills', 'bioVisibility', 'skillsVisibility', 'socialVisibility']) state.profile[key] = String(data.get(key) || '').trim();
      Object.assign(state.profile, { socialLinks, contact: data.has('contact') }); changed(); notify('Profil, liens et visibilité enregistrés.');
    }
    if (form.dataset.form === 'editor') {
      const kind = form.dataset.kind; const item = getItem(kind, form.dataset.id); const draft = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value).trim()]));
      if (item.status === 'published') { state.editing ||= {}; state.editing[`${kind}:${item.id}`] = draft; } else Object.assign(item, draft);
      changed();
      if (event.submitter?.value === 'preview') navigate(`${kind === 'projects' ? 'project' : 'article'}-preview/${item.id}`);
      else notify(item.status === 'published' ? 'Modifications conservées. Prévisualisez pour les publier.' : 'Brouillon enregistré.');
    }
    if (form.dataset.form === 'message') {
      const text = String(data.get('message') || '').trim(); if (!text) return;
      state.conversations.find(c => c.id === form.dataset.id).messages.push({ mine: true, text, time: 'À l’instant' }); changed(); render(); host.querySelector('[name="message"]')?.focus(); host.querySelector('.message-thread')?.scrollTo({ top: 100000 }); notify('Message ajouté localement. Aucun envoi réel.');
    }
    if (form.dataset.form === 'vote') { state.voteDraft = { category: values.category, candidate: values.candidate }; changed(); navigate('awards/review'); }
    if (form.dataset.form === 'participation') {
      state.participations.push({ id: uid('participation'), project: values.project, category: values.category, note: values.note.trim() });
      notification('Votre candidature de démo est enregistrée', getItem('projects', values.project)?.title || 'Votre projet', 'participations', 'award'); changed(); navigate('participations'); notify('Candidature enregistrée dans cette démonstration.');
    }
    if (form.dataset.form === 'settings') { Object.keys(state.settings).forEach(key => { state.settings[key] = data.has(key); }); changed(); notify('Préférences enregistrées pour cette démonstration.'); }
    if (form.dataset.form === 'ticket') { state.tickets.unshift({ id: uid('ticket'), ...values }); changed(); render(); notify('Demande créée localement, sans envoi à une équipe.'); }
  }, { signal: listeners.signal });

  render();
  return () => listeners.abort();
}
