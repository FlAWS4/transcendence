import { categories, projects, editions } from './data.mjs';

const categoryIds = new Set(categories.map(category => category.id));
const asTime = value => value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Date.parse(value);
const getEdition = id => editions.find(edition => edition.id === id);
const getProject = id => projects.find(project => project.id === id);
const result = errors => ({ ok: errors.length === 0, errors });

// Opening instants and the announced closing instants are included. The next
// millisecond enters the following phase; results appear at their exact date.
export function phase(edition, now) {
  const time = asTime(now);
  if (!edition?.dates || !Number.isFinite(time)) return 'upcoming';
  const d = Object.fromEntries(Object.entries(edition.dates).map(([key, value]) => [key, asTime(value)]));
  if (Object.values(d).some(value => !Number.isFinite(value))) return 'upcoming';
  if (time >= d.results) return 'results';
  if (time > d.votesClose) return 'awaiting';
  if (time >= d.votesOpen) return 'voting';
  if (time > d.submissionsClose) return 'review';
  if (time >= d.submissionsOpen) return 'submissions';
  return 'upcoming';
}

export function voteReason(edition, user, now) {
  if (!edition) return 'Cette édition est introuvable.';
  if (user?.connected !== true) return 'Connectez-vous pour voter. La consultation reste ouverte.';
  if (edition.scope === 'campus' && edition.campusId !== user.campusId) {
    return 'Consultation uniquement : le vote est réservé aux membres de ce campus.';
  }
  if (phase(edition, now) !== 'voting') {
    return ['awaiting', 'results'].includes(phase(edition, now))
      ? 'Le vote est terminé pour cette édition.' : 'Le vote n’est pas encore ouvert pour cette édition.';
  }
  return '';
}

export const canVote = (edition, user, now) => voteReason(edition, user, now) === '';

export function submissionReason(edition, user, now) {
  if (!edition) return 'Cette édition est introuvable.';
  if (edition.scope === 'world') return 'Les lauréats des campus sont qualifiés : aucune candidature directe aux Awards Monde.';
  if (user?.connected !== true) return 'Connectez-vous pour proposer un projet.';
  if (edition.campusId !== user.campusId) return 'Vous pouvez participer uniquement à l’édition de votre campus.';
  if (phase(edition, now) !== 'submissions') {
    return phase(edition, now) === 'upcoming' ? 'Les candidatures ne sont pas encore ouvertes.' : 'Les candidatures sont closes pour cette édition.';
  }
  return '';
}

export const canSubmit = (edition, user, now) => submissionReason(edition, user, now) === '';

export function validateSubmission(input = {}, user, now) {
  const { editionId, projectId, categoryIds: selectedCategories, pitch } = input;
  const errors = [];
  const edition = getEdition(editionId);
  const denied = submissionReason(edition, user, now);
  if (denied) errors.push(denied);
  const project = getProject(projectId);
  if (!project) errors.push('Choisissez un projet de votre portfolio.');
  else if (!project.owned || project.campusId !== user?.campusId) errors.push('Ce projet ne fait pas partie de votre portfolio dans ce campus.');
  if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) errors.push('Choisissez au moins une catégorie.');
  else {
    if (new Set(selectedCategories).size !== selectedCategories.length) errors.push('Une catégorie ne peut apparaître qu’une seule fois.');
    for (const id of selectedCategories) {
      if (!categoryIds.has(id)) errors.push('Cette catégorie est inconnue.');
      else if (project && !project.eligibleCategories.includes(id)) errors.push('Ce projet n’est pas proposé dans cette catégorie dans l’essai.');
    }
  }
  if (typeof pitch !== 'string' || !pitch.trim()) errors.push('Ajoutez une présentation du projet.');
  return result([...new Set(errors)]);
}

export function validateBallot(input = {}, user, now) {
  const { editionId, choices } = input;
  const errors = [];
  const edition = getEdition(editionId);
  const denied = voteReason(edition, user, now);
  if (denied) errors.push(denied);
  if (!choices || typeof choices !== 'object' || Array.isArray(choices)) {
    errors.push('Sélectionnez au moins un projet dans une catégorie.');
    return result(errors);
  }
  const entries = Object.entries(choices).filter(([, projectId]) => projectId !== '' && projectId != null);
  if (entries.length === 0) errors.push('Sélectionnez au moins un projet dans une catégorie.');
  for (const [categoryId, projectId] of entries) {
    if (!categoryIds.has(categoryId)) { errors.push('Cette catégorie est inconnue.'); continue; }
    const project = typeof projectId === 'string' ? getProject(projectId) : undefined;
    if (!project || !edition?.candidateIds.includes(projectId)) errors.push('Ce projet ne figure pas parmi les candidats de cette édition.');
    else if (!project.eligibleCategories.includes(categoryId)) errors.push('Ce projet ne concourt pas dans cette catégorie.');
  }
  return result([...new Set(errors)]);
}

export function filterHistory({ scope = 'all', year = 'all', category = 'all' } = {}, now) {
  return editions.filter(edition => {
    if (phase(edition, now) !== 'results') return false;
    if (scope === 'world' && edition.scope !== 'world') return false;
    if (scope !== 'all' && scope !== 'world' && (edition.scope !== 'campus' || edition.campusId !== scope)) return false;
    if (year !== 'all' && String(edition.year) !== String(year)) return false;
    if (category !== 'all' && !edition.winners[category]) return false;
    return true;
  }).sort((a, b) => asTime(b.dates.results) - asTime(a.dates.results));
}
