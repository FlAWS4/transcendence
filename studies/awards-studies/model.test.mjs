import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { campuses, projects, categories, editions, scenarios, demoUser } from './data.mjs';
import { phase, canVote, voteReason, canSubmit, submissionReason, validateSubmission, validateBallot, filterHistory } from './model.mjs';

const find = id => editions.find(edition => edition.id === id);
const paris = find('paris-2026');
const mulhouse = find('mulhouse-2026');
const world = find('world-2026');
const before = value => new Date(Date.parse(value) - 1);
const after = value => new Date(Date.parse(value) + 1);
const open = scenarios.find(scenario => scenario.id === 'candidatures').now;
const votes = scenarios.find(scenario => scenario.id === 'votes').now;
const guest = { connected: false, campusId: 'paris' };
const submission = { editionId: 'paris-2026', projectId: 'minishell', categoryIds: ['project', 'documentation'], pitch: 'Un shell et son carnet de recherche.' };
const ballot = { editionId: 'paris-2026', choices: { project: 'lumen' } };

test('campus filters retain the exact 58 local catalogue identities', () => {
  const catalogue = JSON.parse(readFileSync(new URL('../../site/campuses.json', import.meta.url), 'utf8'));
  assert.equal(campuses.length, 58);
  assert.deepEqual(campuses, catalogue.campuses.map(({ id, name, country }) => ({ id, name, country })));
});

test('edition phases change at their actual boundaries, independently of the scenario label', () => {
  const cases = [
    [before(paris.dates.submissionsOpen), 'upcoming'],
    [paris.dates.submissionsOpen, 'submissions'],
    [paris.dates.submissionsClose, 'submissions'],
    [after(paris.dates.submissionsClose), 'review'],
    [before(paris.dates.votesOpen), 'review'],
    [paris.dates.votesOpen, 'voting'],
    [paris.dates.votesClose, 'voting'],
    [after(paris.dates.votesClose), 'awaiting'],
    [before(paris.dates.results), 'awaiting'],
    [paris.dates.results, 'results'],
  ];
  for (const [now, expected] of cases) assert.equal(phase(paris, now), expected);
  assert.equal(phase(paris, open), 'submissions');
  assert.equal(phase(mulhouse, open), 'voting');
  assert.equal(phase(world, open), 'voting');
  assert.equal(phase(paris, 'invalid'), 'upcoming');
});

test('campus viewed does not confer membership or a local vote', () => {
  assert.equal(canVote(paris, demoUser, votes), true);
  assert.equal(canVote(mulhouse, demoUser, votes), false);
  assert.match(voteReason(mulhouse, demoUser, votes), /réservé aux membres/);
  assert.equal(canVote(world, demoUser, votes), true);
  assert.equal(demoUser.campusId, 'paris');
  assert.equal(canVote(paris, { connected: true, campusId: 'mulhouse' }, votes), false);
});

test('guests cannot vote or submit even during an open period', () => {
  for (const edition of [paris, mulhouse, world]) assert.equal(canVote(edition, guest, votes), false);
  assert.equal(canSubmit(paris, guest, open), false);
  assert.match(voteReason(world, guest, votes), /Connectez-vous/);
  assert.equal(canVote(paris, undefined, votes), false);
  assert.equal(canSubmit(paris, undefined, open), false);
});

test('only the owned campus has a submission path, never the world', () => {
  assert.equal(canSubmit(paris, demoUser, open), true);
  assert.equal(canSubmit(find('tokyo-2026'), demoUser, open), false);
  assert.equal(canSubmit(world, demoUser, world.dates.submissionsOpen), false);
  assert.match(submissionReason(world, demoUser, world.dates.submissionsOpen), /aucune candidature directe/);
  assert.equal(canSubmit(paris, demoUser, votes), false);
  assert.equal(canVote(paris, demoUser, open), false);
  assert.equal(canVote(world, demoUser, after(world.dates.votesClose)), false);
});

test('candidature validates portfolio ownership, categories and a presentation', () => {
  assert.deepEqual(validateSubmission(submission, demoUser, open), { ok: true, errors: [] });
  for (const changes of [
    { editionId: 'world-2026' }, { editionId: 'missing' },
    { projectId: 'pulse' }, { projectId: 'lumen' }, { projectId: 'unknown' },
    { categoryIds: [] }, { categoryIds: ['unknown'] }, { categoryIds: ['interface'] },
    { categoryIds: ['project', 'project'] }, { categoryIds: 'project' }, { pitch: '  ' },
  ]) assert.equal(validateSubmission({ ...submission, ...changes }, demoUser, open).ok, false, JSON.stringify(changes));
  assert.equal(validateSubmission(submission, guest, open).ok, false);
  assert.equal(validateSubmission(submission, demoUser, votes).ok, false);
});

test('ballots allow partial selection while rejecting out-of-edition and incompatible candidates', () => {
  assert.deepEqual(validateBallot(ballot, demoUser, votes), { ok: true, errors: [] });
  assert.equal(validateBallot({ ...ballot, choices: { project: 'lumen', interface: '', documentation: null } }, demoUser, votes).ok, true);
  for (const choices of [
    {}, [], null, { project: '' }, { project: 'pulse' }, { project: 'minishell' },
    { missing: 'lumen' }, { documentation: 'lumen' }, { project: ['lumen', 'cortex'] },
  ]) assert.equal(validateBallot({ ...ballot, choices }, demoUser, votes).ok, false, JSON.stringify(choices));
  assert.equal(validateBallot(ballot, guest, votes).ok, false);
  assert.equal(validateBallot(ballot, demoUser, open).ok, false);
  assert.equal(validateBallot({ editionId: 'mulhouse-2026', choices: { project: 'pulse' } }, demoUser, votes).ok, false);
  assert.equal(validateBallot({ editionId: 'world-2026', choices: { project: 'komorebi' } }, demoUser, votes).ok, true);
  assert.equal(validateBallot({ editionId: 'missing', choices: { project: 'lumen' } }, demoUser, votes).ok, false);
});

test('archives keep world and individual campuses separate and never expose future results', () => {
  assert.deepEqual(filterHistory({ scope: 'world' }, open).map(e => e.id), ['world-2025']);
  assert.deepEqual(filterHistory({ scope: 'paris', year: '2025' }, open).map(e => e.id), ['paris-2025']);
  assert.deepEqual(filterHistory({ scope: 'paris', year: '2026' }, open).map(e => e.id), ['paris-2026-spring']);
  assert.deepEqual(filterHistory({ scope: 'lyon' }, open), []);
  assert.deepEqual(filterHistory({ category: 'missing' }, open), []);
  assert.equal(filterHistory({ scope: 'all', year: '2025', category: 'documentation' }, open).length, 4);
  assert.equal(filterHistory({ scope: 'paris' }, before(paris.dates.results)).some(e => e.id === 'paris-2026'), false);
  assert.equal(filterHistory({ scope: 'paris' }, paris.dates.results).some(e => e.id === 'paris-2026'), true);
  assert.deepEqual(filterHistory({ scope: 'world' }, 'invalid'), []);
});

test('every world candidate is a previous campus laureate before qualification begins', () => {
  for (const edition of editions.filter(edition => edition.scope === 'world')) {
    assert.deepEqual(Object.keys(edition.qualifiedFrom).sort(), [...edition.candidateIds].sort());
    for (const [projectId, qualification] of Object.entries(edition.qualifiedFrom)) {
      const source = find(qualification.editionId);
      assert.equal(source.scope, 'campus');
      assert.ok(Date.parse(source.dates.results) < Date.parse(edition.dates.submissionsOpen));
      assert.ok(qualification.categoryIds.length > 0);
      for (const categoryId of qualification.categoryIds) assert.equal(source.winners[categoryId], projectId);
    }
  }
});

test('all fictional editions have coherent dates, candidates and eligible winners', () => {
  assert.equal(new Set(editions.map(e => e.id)).size, editions.length);
  assert.equal(projects.filter(p => p.owned && p.campusId === demoUser.campusId).length, 2);
  for (const edition of editions) {
    const dates = ['submissionsOpen', 'submissionsClose', 'votesOpen', 'votesClose', 'results'].map(key => Date.parse(edition.dates[key]));
    assert.ok(dates.every(Number.isFinite));
    assert.ok(dates.every((date, index) => index === 0 || date > dates[index - 1]));
    for (const [categoryId, projectId] of Object.entries(edition.winners)) {
      const project = projects.find(project => project.id === projectId);
      assert.ok(categories.some(category => category.id === categoryId));
      assert.ok(edition.candidateIds.includes(projectId));
      assert.ok(project.eligibleCategories.includes(categoryId));
      if (edition.scope === 'campus') assert.equal(project.campusId, edition.campusId);
    }
  }
});
