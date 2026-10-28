// Pure helpers for textarea mentions. All offsets use UTF-16 code units, like
// selectionStart/selectionEnd and maxlength. Only a selected profile creates a
// mention; matching visible text never creates or moves an identity by itself.
const QUERY_CHARACTER = /^[\p{L}\p{M}\p{N}_-]$/u;
const BOUNDARY = /[\s()[\]{}«»‹›"'“”‘’!?;:,،؛؟]/u;
const INVALID_LABEL = /[@\p{Cc}\p{Cf}]/u;
const textValue = value => typeof value === 'string' ? value : '';
const validPosition = (value, position) => Number.isInteger(position) && position >= 0 && position <= value.length;
const boundaryBefore = (value, start) => start === 0 || BOUNDARY.test(value[start - 1]);
const characterAt = (value, index) => index < value.length ? String.fromCodePoint(value.codePointAt(index)) : '';
const validLabel = label => typeof label === 'string' && label.length > 0 && label === label.trim() && !INVALID_LABEL.test(label);

function strings(value, depth = 0) {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object' || depth > 2) return [];
  return Object.values(value).flatMap(item => strings(item, depth + 1));
}

function profileLabel(profile, locale) {
  const title = profile?.title;
  const candidates = typeof title === 'string' ? [title] :
    [title?.[locale], title?.fr, title?.en, title?.ar, ...strings(title)];
  return candidates.find(validLabel) || '';
}

function validProfileId(id) {
  return typeof id === 'string' && id.length > 0 && id.length <= 200 && !/[\s\p{Cc}\p{Cf}]/u.test(id);
}

function searchKey(value) {
  return textValue(value).normalize('NFKD').toLowerCase().replace(/\p{M}/gu, '')
    .trim().replace(/^@/, '').replace(/[\s‐‑‒–—−]+/gu, '-').replace(/-+/g, '-');
}

/** Find the unfinished @login or @hyphenated-name at a collapsed caret.
 * Whitespace/opening punctuation may precede it, but email/URL fragments may
 * not. `query` ends at the caret; `end` includes the rest of the same token so a
 * choice made in the middle replaces that token, preserving its punctuation.
 */
export function findMentionToken(value, selectionStart, selectionEnd = selectionStart, mentions = []) {
  value = textValue(value);
  if (!validPosition(value, selectionStart) || selectionStart !== selectionEnd) return null;
  const before = value.slice(0, selectionStart);
  const match = /@([\p{L}\p{M}\p{N}_-]*)$/u.exec(before);
  if (!match || !boundaryBefore(value, match.index)) return null;
  let end = selectionStart;
  while (end < value.length && QUERY_CHARACTER.test(characterAt(value, end))) end += characterAt(value, end).length;
  const start = match.index;
  if (normalizeCommentMentions(value, mentions).some(mention => start < mention.end && end > mention.start)) return null;
  return {start, end, query: match[1]};
}

/** Search all localized titles, the Intra login, and optional aliases or
 * alternateNames (strings, lists or localized objects). Return original profile
 * records, ordered exact match, leading match, word match, then substring match.
 */
export function searchMentionProfiles(profiles, query, {locale = 'fr', limit = 6} = {}) {
  if (!Array.isArray(profiles)) return [];
  const key = searchKey(query), seen = new Set();
  const count = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 6;
  return profiles.flatMap((profile, order) => {
    if (!validProfileId(profile?.id) || !profileLabel(profile, locale) || seen.has(profile.id)) return [];
    seen.add(profile.id);
    const names = [profile.intraLogin, ...strings(profile.title), ...strings(profile.aliases), ...strings(profile.alternateNames)]
      .filter(item => typeof item === 'string').map(searchKey).filter(Boolean);
    let score = key ? Infinity : 0;
    for (const name of names) {
      if (name === key) score = Math.min(score, 0);
      else if (name.startsWith(key)) score = Math.min(score, 1);
      else if (name.split('-').some(part => part.startsWith(key))) score = Math.min(score, 2);
      else if (name.includes(key)) score = Math.min(score, 3);
    }
    return Number.isFinite(score) ? [{profile, score, order}] : [];
  }).sort((a, b) => a.score - b.score || a.order - b.order).slice(0, count).map(item => item.profile);
}

/** Validate stored ranges without consulting a profile catalog. `label` is the
 * exact visible name WITHOUT @, retained when the interface language changes.
 * Conflicting/overlapping ranges are discarded rather than choosing an identity.
 */
export function normalizeCommentMentions(value, mentions) {
  value = textValue(value);
  if (!Array.isArray(mentions)) return [];
  const seen = new Set();
  const ranges = mentions.flatMap(mention => {
    if (!mention || !validProfileId(mention.profileId) || !validLabel(mention.label) ||
      !validPosition(value, mention.start) || !validPosition(value, mention.end) || mention.end <= mention.start ||
      value.slice(mention.start, mention.end) !== `@${mention.label}` ||
      QUERY_CHARACTER.test(characterAt(value, mention.end))) return [];
    const range = {profileId: mention.profileId, start: mention.start, end: mention.end, label: mention.label};
    const key = JSON.stringify(range);
    if (seen.has(key)) return [];
    seen.add(key);
    return [range];
  }).sort((a, b) => a.start - b.start || a.end - b.end);
  const result = [];
  for (let index = 0; index < ranges.length;) {
    let next = index + 1, end = ranges[index].end;
    while (next < ranges.length && ranges[next].start < end) end = Math.max(end, ranges[next++].end);
    if (next === index + 1) result.push(ranges[index]);
    index = next;
  }
  return result;
}

function validEdit(previous, value, edit) {
  if (!edit || !validPosition(previous, edit.start) || !validPosition(previous, edit.end) || edit.end < edit.start) return null;
  const insertedLength = value.length - (previous.length - (edit.end - edit.start));
  if (insertedLength < 0 || previous.slice(0, edit.start) !== value.slice(0, edit.start) ||
    previous.slice(edit.end) !== value.slice(edit.start + insertedLength)) return null;
  return {start: edit.start, end: edit.end};
}

function movedRange(mention, edit, delta) {
  // An insertion at the start belongs before the mention; one at the end is
  // outside it. Final normalization rejects letters appended to its name.
  if (mention.end <= edit.start) return {...mention};
  if (mention.start >= edit.end) return {...mention, start: mention.start + delta, end: mention.end + delta};
  return null;
}

/** Adjust ranges after one input operation. Supply the old replaced selection as
 * edit={start,end} when available (beforeinput, emoji insertion, paste). Without
 * it, only ranges whose mapping is certain across all equally minimal contiguous
 * edits survive. This prevents one duplicate name inheriting another's identity.
 */
export function updateCommentMentions(previousValue, value, mentions, edit) {
  const previous = textValue(previousValue);
  value = textValue(value);
  const ranges = normalizeCommentMentions(previous, mentions);
  if (previous === value || !ranges.length) return ranges;
  const delta = value.length - previous.length;
  const known = validEdit(previous, value, edit);
  if (known) return normalizeCommentMentions(value, ranges.map(mention => movedRange(mention, known, delta)).filter(Boolean));
  let prefix = 0, suffix = 0;
  const shortest = Math.min(previous.length, value.length);
  while (prefix < shortest && previous[prefix] === value[prefix]) prefix++;
  while (suffix < shortest && previous[previous.length - 1 - suffix] === value[value.length - 1 - suffix]) suffix++;
  const preserved = Math.min(shortest, prefix + suffix);
  const firstStart = Math.max(0, preserved - suffix), lastStart = Math.min(prefix, preserved);
  const firstEdit = {start: firstStart, end: previous.length - preserved + firstStart};
  const lastEdit = {start: lastStart, end: previous.length - preserved + lastStart};
  const stable = ranges.flatMap(mention => {
    const first = movedRange(mention, firstEdit, delta), last = movedRange(mention, lastEdit, delta);
    return first && last && first.start === last.start && first.end === last.end ? [first] : [];
  });
  return normalizeCommentMentions(value, stable);
}

/** Trim at submission without losing positional metadata or inferring mentions. */
export function trimCommentMentions(value, mentions) {
  value = textValue(value);
  const trimmed = value.trim(), offset = value.length - value.trimStart().length;
  const ranges = normalizeCommentMentions(value, mentions).map(mention => ({...mention, start: mention.start - offset, end: mention.end - offset}));
  return {value: trimmed, mentions: normalizeCommentMentions(trimmed, ranges)};
}

/** Replace a current unfinished token with the selected localized display name.
 * Reject an over-limit insertion atomically; never truncate surrounding text or
 * the name. A space is added at the very end if it fits, otherwise insertion still
 * succeeds at the exact limit. Existing whitespace/punctuation stays untouched.
 */
export function insertCommentMention(value, profile, token, {locale = 'fr', mentions = [], limit = 2000} = {}) {
  value = textValue(value);
  const ranges = normalizeCommentMentions(value, mentions), label = profileLabel(profile, locale);
  const caret = validPosition(value, token?.end) ? token.end : value.length;
  const failure = {value, mentions: ranges, caret, inserted: false};
  if (!validProfileId(profile?.id) || !label || !token || !validPosition(value, token.start) || !validPosition(value, token.end)) return failure;
  const actual = findMentionToken(value, token.end, token.end, ranges);
  if (!actual || actual.start !== token.start || actual.end !== token.end || !Number.isInteger(limit) || limit < 0) return failure;
  const name = `@${label}`, tail = value.slice(token.end);
  let result = value.slice(0, token.start) + name + tail;
  if (result.length > limit) return failure;
  const end = token.start + name.length;
  if (!tail && result.length < limit) result += ' ';
  const shifted = updateCommentMentions(value, result, ranges, {start: token.start, end: token.end});
  const nextRanges = normalizeCommentMentions(result, [...shifted, {profileId: profile.id, start: token.start, end, label}]);
  if (!nextRanges.some(mention => mention.start === token.start && mention.end === end && mention.profileId === profile.id)) return failure;
  return {value: result, mentions: nextRanges, caret: end + (result[end] === ' ' ? 1 : 0), inserted: true};
}
