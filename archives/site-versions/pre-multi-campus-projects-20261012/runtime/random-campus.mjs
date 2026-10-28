/** One stable draw in advance; reading or retrying the cache never redraws it. */
export function createRandomCampusCandidate(campuses, { random = Math.random } = {}) {
 const byId = new Map(campuses.map(campus => [campus.id, campus]));
 const choices = [...byId.values()];
 let currentId = null, candidate = null;
 function choose() {
  const eligible = choices.filter(campus => campus.id !== currentId);
  if (!eligible.length) return null;
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('Random sample must be in [0, 1).');
  return eligible[Math.floor(value * eligible.length)];
 }
 function peek() { return candidate ??= choose(); }
 function setCurrent(id) {
  currentId = id;
  if (candidate?.id === id) candidate = null;
  return peek();
 }
 function take() {
  const selected = peek();
  if (!selected) return null;
  currentId = selected.id; candidate = choose();
  return selected;
 }
 return { peek, setCurrent, take };
}

/** Slightly longer cross-campus travel, without an arbitrary long wait. */
export function campusJourneyDuration(distanceKm) {
 if (!Number.isFinite(distanceKm) || distanceKm < 0) throw new RangeError('Invalid campus distance.');
 return Math.round(3000 + 400 * Math.min(1, Math.log1p(distanceKm) / Math.log1p(20020)));
}
// Zero velocity and acceleration at both ends of the camera journey.
export const campusJourneyEasing = t => t * t * t * (t * (t * 6 - 15) + 10);
