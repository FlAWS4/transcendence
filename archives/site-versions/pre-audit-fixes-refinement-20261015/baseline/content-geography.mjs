// Publications keep their own geographic associations. Authors' current campus,
// author order and responsibility never move an existing project between places.
export function getContentCampusIds(entry) {
  const values = entry?.section === 'projects' && Array.isArray(entry.campusIds)
    ? entry.campusIds : [entry?.campus];
  return [...new Set(values.filter(value => typeof value === 'string').map(value => value.trim()).filter(Boolean))];
}

export function contentCampusNames(entry, getCampusName = id => id) {
  return [...new Set(getContentCampusIds(entry).map(id => getCampusName(id) || id))];
}

// A country contains the union of its campuses: one publication still represents
// one record even when two participating campuses belong to that same country.
export function matchesContentScope(entry, scope = {}, campuses = []) {
  const {country, campus} = scope || {};
  if (!country && !campus) return true;
  const ids = getContentCampusIds(entry);
  if (campus && !ids.includes(campus)) return false;
  if (!country) return true;
  const campusById = new Map(campuses.map(place => [place.id, place]));
  return (campus ? [campus] : ids).some(id => campusById.get(id)?.country === country);
}
