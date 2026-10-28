// Fictional Awards data for the three independent interface studies.
// Campus names alone come from the existing local catalogue; no live Awards data.
export const campusCatalogueSource = '../../site/campuses.json';

export const campuses = [
  ['luanda', '42 Luanda', 'AGO'], ['tirana', '42 Tirana', 'ALB'],
  ['abu-dhabi', '42 Abu Dhabi', 'ARE'], ['yerevan', '42 Yerevan', 'ARM'],
  ['vienna', '42 Vienna', 'AUT'], ['wels', '42 Wels', 'AUT'],
  ['antwerp', '42 Antwerp', 'BEL'], ['brussels', '42 Brussels', 'BEL'],
  ['belo-horizonte', '42 Belo Horizonte', 'BRA'], ['rio', '42 Rio', 'BRA'],
  ['sao', '42 São Paulo', 'BRA'], ['quebec', '42 Québec', 'CAN'],
  ['lausanne', '42 Lausanne', 'CHE'], ['zurich', '42 Zürich', 'CHE'],
  ['prague', '42 Prague', 'CZE'], ['berlin', '42 Berlin', 'DEU'],
  ['heilbronn', '42 Heilbronn', 'DEU'], ['wolfsburg', '42 Wolfsburg', 'DEU'],
  ['barcelona', '42 Barcelona', 'ESP'], ['madrid', '42 Madrid', 'ESP'],
  ['malaga', '42 Málaga', 'ESP'], ['urduliz', '42 Urduliz', 'ESP'],
  ['angouleme', '42 Angoulême', 'FRA'], ['le-havre', '42 Le Havre', 'FRA'],
  ['lyon', '42 Lyon', 'FRA'], ['marseille', '42 Marseille', 'FRA'],
  ['mulhouse', '42 Mulhouse', 'FRA'], ['nice', '42 Nice', 'FRA'],
  ['paris', '42 Paris', 'FRA'], ['perpignan', '42 Perpignan', 'FRA'],
  ['london', '42 London', 'GBR'], ['firenze', '42 Firenze', 'ITA'],
  ['milano', '42 Milano', 'ITA'], ['roma', '42 Roma', 'ITA'],
  ['amman', '42 Amman', 'JOR'], ['irbid', '42 Irbid', 'JOR'],
  ['tokyo', '42 Tokyo', 'JPN'], ['gyeongsan', '42 Gyeongsan', 'KOR'],
  ['seoul', '42 Seoul', 'KOR'], ['beirut', '42 Beirut', 'LBN'],
  ['luxembourg', '42 Luxembourg', 'LUX'], ['1337-ben-guerir', '1337 Ben Guérir', 'MAR'],
  ['1337-khouribga', '1337 Khouribga', 'MAR'], ['1337-med', '1337 Med', 'MAR'],
  ['1337-rabat', '1337 – Rabat', 'MAR'], ['antananarivo', '42 Antananarivo', 'MDG'],
  ['iskandar-puteri', '42 Iskandar Puteri', 'MYS'], ['kuala-lumpur', '42 Kuala Lumpur', 'MYS'],
  ['penang', '42 Penang', 'MYS'], ['codam', 'Codam', 'NLD'],
  ['warsaw', '42 Warsaw', 'POL'], ['lisboa', '42 Lisboa', 'PRT'],
  ['porto', '42 Porto', 'PRT'], ['nablus', '42 Nablus', 'PSE'],
  ['singapore', '42 Singapore', 'SGP'], ['bangkok', '42 Bangkok', 'THA'],
  ['istanbul', '42 Istanbul', 'TUR'], ['kocaeli', '42 Kocaeli', 'TUR'],
].map(([id, name, country]) => ({ id, name, country }));

export const demoUser = { id: 'demo', connected: true, campusId: 'paris' };
export const defaultScenario = 'candidatures';
export const scenarios = [
  { id: 'candidatures', label: '8 octobre · candidatures', now: '2026-10-08T12:00:00Z' },
  { id: 'votes', label: '22 octobre · votes', now: '2026-10-22T12:00:00Z' },
  { id: 'attente', label: '2 novembre · attente', now: '2026-11-02T12:00:00Z' },
  { id: 'results', label: '8 novembre · résultats', now: '2026-11-08T12:00:00Z' },
];

export const demoRules = {
  disclaimer: 'Projets, équipes, éditions, candidatures, dates et palmarès fictifs. Ces essais ne constituent pas un règlement officiel.',
  participation: 'Pour cet essai : compte simulé de Paris, projet de son portfolio, une ou plusieurs catégories compatibles et une présentation. Aucun dépôt direct au Monde.',
  vote: 'Pour cet essai : un choix par catégorie renseignée, au moins une catégorie. Le bulletin peut être incomplet. Aucun barème définitif ni comptage réel.',
  results: 'Les palmarès sont des exemples préparés, révélés à la date simulée annoncée. Les votes locaux ne les modifient pas.',
  qualification: 'Le Monde 2026 rassemble ici les lauréats fictifs des éditions campus du printemps 2026, déjà terminées. Les éditions locales de cet automne ne le qualifient pas rétroactivement.',
  unresolved: 'Électorat, catégories finales, auto-vote, équipes de plusieurs campus, barème, égalités, limites et modification des candidatures ou votes restent à définir.',
};

export const categories = [
  { id: 'project', name: 'Meilleur projet', description: 'Une réalisation complète, utile et soignée.' },
  { id: 'interface', name: 'Interface & expérience', description: 'Une expérience claire et agréable à utiliser.' },
  { id: 'innovation', name: 'Innovation technique', description: 'Une approche technique inventive et maîtrisée.' },
  { id: 'documentation', name: 'Documentation & transmission', description: 'Des explications qui aident les autres à apprendre.' },
];

export const projects = [
  {
    id: 'minishell', title: 'Minishell Atlas', campusId: 'paris', owned: true,
    team: ['Leïla Mansour', 'Sami Lenoir'], art: 'terminal', tags: ['C', 'Unix', 'Équipe'],
    description: 'Un interpréteur de commandes accompagné de schémas pour comprendre les processus et les redirections.',
    eligibleCategories: ['project', 'innovation', 'documentation'],
  },
  {
    id: 'ecoroute', title: 'Écoroute', campusId: 'paris', owned: true,
    team: ['Leïla Mansour', 'Lina Morel', 'Noé Garnier'], art: 'waves', tags: ['Web', 'Mobilité', 'UX'],
    description: 'Comparer les trajets du quotidien avec une interface accessible et des données compréhensibles.',
    eligibleCategories: ['project', 'interface', 'documentation'],
  },
  {
    id: 'lumen', title: 'Lumen', campusId: 'paris', owned: false,
    team: ['Inès Mercier', 'Adam Perrin'], art: 'orbit', tags: ['WebGL', 'Lumière', 'Création'],
    description: 'Un atelier visuel pour expérimenter la lumière et apprendre les bases du rendu en temps réel.',
    eligibleCategories: ['project', 'interface', 'innovation'],
  },
  {
    id: 'cortex', title: 'Cortex', campusId: 'paris', owned: false,
    team: ['Alice Delcourt', 'Malik Roux'], art: 'grid', tags: ['Algorithmes', 'Pédagogie'],
    description: 'Explorer les algorithmes pas à pas grâce à des visualisations et un carnet d’expériences annoté.',
    eligibleCategories: ['project', 'interface', 'documentation'],
  },
  {
    id: 'pulse', title: 'Pulse', campusId: 'mulhouse', owned: false,
    team: ['Jules Aubry', 'Nora Vidal'], art: 'waves', tags: ['Audio', 'C++', 'Temps réel'],
    description: 'Un petit synthétiseur pour créer et visualiser ses sons avec un moteur audio écrit en C++.',
    eligibleCategories: ['project', 'interface', 'innovation'],
  },
  {
    id: 'relay', title: 'Relay', campusId: 'mulhouse', owned: false,
    team: ['Élise Laurent', 'Tom Vasseur'], art: 'terminal', tags: ['Réseau', 'Open source'],
    description: 'Une exploration des échanges réseau, documentée pour rendre les protocoles plus faciles à comprendre.',
    eligibleCategories: ['project', 'innovation', 'documentation'],
  },
  {
    id: 'komorebi', title: 'Komorebi', campusId: 'tokyo', owned: false,
    team: ['Aoi Mizuno', 'Ren Takeda'], art: 'orbit', tags: ['Création', 'Simulation'],
    description: 'Une forêt générative qui transforme de petites règles de croissance en paysages interactifs.',
    eligibleCategories: ['project', 'interface', 'innovation'],
  },
  {
    id: 'flow', title: 'Flow Notes', campusId: 'tokyo', owned: false,
    team: ['Yuna Mori', 'Haru Sato'], art: 'grid', tags: ['Accessibilité', 'Documentation'],
    description: 'Relier ses notes de recherche, expliquer ses décisions et partager un chemin d’apprentissage.',
    eligibleCategories: ['project', 'interface', 'documentation'],
  },
];

const autumnDates = {
  submissionsOpen: '2026-10-01T09:00:00Z', submissionsClose: '2026-10-15T23:59:59Z',
  votesOpen: '2026-10-20T09:00:00Z', votesClose: '2026-10-30T23:59:59Z', results: '2026-11-05T18:00:00Z',
};
const springDates = {
  submissionsOpen: '2026-04-01T09:00:00Z', submissionsClose: '2026-04-15T23:59:59Z',
  votesOpen: '2026-04-20T09:00:00Z', votesClose: '2026-04-30T23:59:59Z', results: '2026-05-05T18:00:00Z',
};
const archiveDates = {
  submissionsOpen: '2025-09-01T09:00:00Z', submissionsClose: '2025-09-15T23:59:59Z',
  votesOpen: '2025-09-20T09:00:00Z', votesClose: '2025-09-30T23:59:59Z', results: '2025-10-05T18:00:00Z',
};
const campusProjects = { paris: ['lumen', 'cortex'], mulhouse: ['pulse', 'relay'], tokyo: ['komorebi', 'flow'] };
const campusWinners = {
  paris: { project: 'lumen', interface: 'lumen', innovation: 'lumen', documentation: 'cortex' },
  mulhouse: { project: 'pulse', interface: 'pulse', innovation: 'relay', documentation: 'relay' },
  tokyo: { project: 'komorebi', interface: 'flow', innovation: 'komorebi', documentation: 'flow' },
};

const campusEdition = (campusId, year, season, dates) => ({
  id: `${campusId}-${year}${season === 'Printemps' ? '-spring' : ''}`,
  name: `${campuses.find(c => c.id === campusId).name} · ${season} ${year}`,
  scope: 'campus', campusId, year, subtitle: `${season} · édition de démonstration`,
  dates: { ...dates }, candidateIds: [...campusProjects[campusId]], winners: { ...campusWinners[campusId] },
});

const qualificationSources = (year, suffix = '') => Object.fromEntries(
  Object.entries(campusWinners).flatMap(([campusId, winners]) => campusProjects[campusId].map(projectId => [projectId, {
    editionId: `${campusId}-${year}${suffix}`,
    categoryIds: Object.keys(winners).filter(categoryId => winners[categoryId] === projectId),
  }])),
);

export const editions = [
  campusEdition('paris', 2026, 'Automne', autumnDates),
  campusEdition('mulhouse', 2026, 'Automne', {
    submissionsOpen: '2026-09-10T09:00:00Z', submissionsClose: '2026-09-25T23:59:59Z',
    votesOpen: '2026-10-01T09:00:00Z', votesClose: '2026-10-25T23:59:59Z', results: '2026-11-04T18:00:00Z',
  }),
  campusEdition('tokyo', 2026, 'Automne', {
    submissionsOpen: '2026-10-01T00:00:00Z', submissionsClose: '2026-10-18T14:59:59Z',
    votesOpen: '2026-10-20T00:00:00Z', votesClose: '2026-10-30T14:59:59Z', results: '2026-11-06T09:00:00Z',
  }),
  {
    id: 'world-2026', name: 'Awards Monde · 2026', scope: 'world', campusId: null, year: 2026,
    subtitle: 'Les lauréats du printemps se retrouvent',
    // These first two dates represent qualification, never direct applications.
    dates: {
      submissionsOpen: '2026-09-01T09:00:00Z', submissionsClose: '2026-09-20T23:59:59Z',
      votesOpen: '2026-10-01T09:00:00Z', votesClose: '2026-10-31T23:59:59Z', results: '2026-11-07T18:00:00Z',
    },
    candidateIds: ['lumen', 'cortex', 'pulse', 'relay', 'komorebi', 'flow'],
    winners: { project: 'komorebi', interface: 'lumen', innovation: 'relay', documentation: 'flow' },
    qualifiedFrom: qualificationSources(2026, '-spring'),
  },
  ...['paris', 'mulhouse', 'tokyo'].map(id => campusEdition(id, 2026, 'Printemps', springDates)),
  ...['paris', 'mulhouse', 'tokyo'].map(id => campusEdition(id, 2025, 'Automne', archiveDates)),
  {
    id: 'world-2025', name: 'Awards Monde · 2025', scope: 'world', campusId: null, year: 2025,
    subtitle: 'Le palmarès mondial de démonstration',
    dates: {
      submissionsOpen: '2025-10-06T09:00:00Z', submissionsClose: '2025-10-20T23:59:59Z',
      votesOpen: '2025-11-01T09:00:00Z', votesClose: '2025-11-15T23:59:59Z', results: '2025-11-20T18:00:00Z',
    },
    candidateIds: ['lumen', 'cortex', 'pulse', 'relay', 'komorebi', 'flow'],
    winners: { project: 'lumen', interface: 'flow', innovation: 'pulse', documentation: 'cortex' },
    qualifiedFrom: qualificationSources(2025),
  },
];
