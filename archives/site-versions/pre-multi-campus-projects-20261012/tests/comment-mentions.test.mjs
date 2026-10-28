import test from 'node:test';
import assert from 'node:assert/strict';
import {profiles, profileById} from '../profile-data.mjs';
import {
  findMentionToken, searchMentionProfiles, insertCommentMention,
  normalizeCommentMentions, updateCommentMentions, trimCommentMentions
} from '../comment-mentions.mjs';

const ines = profileById.get('profile-ines-morel');
const noe = profileById.get('profile-noe-laurent');
const range = (value, label, profileId = ines.id, from = 0) => {
  const start = value.indexOf(`@${label}`, from);
  return {profileId, start, end: start + label.length + 1, label};
};

test('progressive login and accented or unaccented hyphenated names find the same real sample profile', () => {
  for (const query of ['i', 'im', 'imo', 'imorel', 'IMOREL', 'ines-', 'ines-morel', 'inès-morel', 'INE\u0300S-MOREL', 'morel']) {
    assert.equal(searchMentionProfiles(profiles, query)[0], ines, query);
  }
  for (const query of ['imorel', 'ines-morel', 'inès-morel']) {
    const value = `Merci @${query}`, token = findMentionToken(value, value.length);
    const result = insertCommentMention(value, searchMentionProfiles(profiles, token.query)[0], token);
    assert.equal(result.value, 'Merci @Inès Morel ');
    assert.deepEqual(result.mentions, [{profileId: ines.id, start: 6, end: 17, label: 'Inès Morel'}]);
    assert.equal(result.caret, 18);
    assert.equal(result.inserted, true);
  }
});

test('search spans localized names and explicit aliases, orders matches, limits and never mutates records', () => {
  const alias = {id: 'alternate', intraLogin: 'different', title: {fr: 'Autre personne', ar: 'شخص آخر'},
    aliases: ['Inès-Morel'], alternateNames: {fr: ['Ancien Nom'], en: 'Earlier Name'}};
  const source = [alias, ines, null, {...ines}, {id: 'bad', title: '\n'}];
  const snapshot = structuredClone(source);
  assert.deepEqual(searchMentionProfiles(source, 'imorel'), [ines]);
  assert.deepEqual(searchMentionProfiles(source, 'ancien-n'), [alias]);
  assert.deepEqual(searchMentionProfiles(source, 'earlier', {locale: 'ar'}), [alias]);
  assert.deepEqual(searchMentionProfiles(source, 'إِيناس-موريل', {locale: 'fr'}), [ines]);
  assert.deepEqual(searchMentionProfiles(source, '', {limit: 1}), [alias]);
  assert.deepEqual(searchMentionProfiles(source, '', {limit: 0}), []);
  assert.deepEqual(searchMentionProfiles(source, 'personne-inconnue'), []);
  assert.deepEqual(source, snapshot);
});

test('token detection respects caret, Unicode names, delimiters and selection without capturing emails or URLs', () => {
  for (const value of ['@', 'Salut @inès-morel', '(@imorel)', 'مرحبا،@إِيناس-موريل', '🙂 @noe-laurent']) {
    const caret = value.endsWith(')') ? value.length - 1 : value.length;
    const token = findMentionToken(value, caret);
    assert.ok(token, value);
    assert.equal(value[token.start], '@');
    assert.equal(token.end, caret);
  }
  assert.deepEqual(findMentionToken('Avec @ines-morel, merci', 9), {start: 5, end: 16, query: 'ine'});
  for (const value of ['a@imorel', 'a.@imorel', 'name+@imorel', 'https://horizon.test/@imorel', '@@imorel', 'Salut @ines.', 'Salut @ines ', 'Salut @ines/morel']) {
    assert.equal(findMentionToken(value, value.length), null, value);
  }
  assert.equal(findMentionToken('@ines', 2, 4), null);
  assert.equal(findMentionToken('@ines', -1), null);
  assert.equal(findMentionToken('@ines', 40), null);
});

test('existing selected mentions never reopen suggestions while moving through their display name', () => {
  const value = 'Merci @Inès Morel et @noe', mentions = [range(value, 'Inès Morel')];
  for (let caret = mentions[0].start; caret <= mentions[0].end; caret++) {
    assert.equal(findMentionToken(value, caret, caret, mentions), null);
  }
  assert.equal(findMentionToken(value, value.length, value.length, mentions).query, 'noe');
});

test('insertion in the middle replaces the complete token and preserves punctuation, other ranges and Unicode offsets', () => {
  const value = '🙂 @ines-morel, merci @Noé Laurent !';
  const mentions = [range(value, 'Noé Laurent', noe.id)], before = structuredClone(mentions);
  const token = findMentionToken(value, 7);
  const result = insertCommentMention(value, ines, token, {mentions});
  assert.equal(result.value, '🙂 @Inès Morel, merci @Noé Laurent !');
  assert.equal(result.caret, 14);
  assert.deepEqual(result.mentions, [range(result.value, 'Inès Morel'), range(result.value, 'Noé Laurent', noe.id)]);
  assert.deepEqual(mentions, before);
  const arabic = insertCommentMention('@imorel', ines, findMentionToken('@imorel', 7), {locale: 'ar'});
  assert.equal(arabic.value, '@إيناس موريل ');
  assert.equal(arabic.mentions[0].profileId, ines.id);
  assert.equal(arabic.mentions[0].label, 'إيناس موريل');
});

test('insertion rejects overflow atomically but fits an exact 2000-unit name without a trailing space', () => {
  const name = '@Inès Morel', prefix = 'x'.repeat(2000 - name.length - 1) + ' ';
  const value = prefix + '@i', token = findMentionToken(value, value.length);
  const exact = insertCommentMention(value, ines, token);
  assert.equal(exact.inserted, true);
  assert.equal(exact.value.length, 2000);
  assert.equal(exact.caret, 2000);
  assert.equal(exact.mentions[0].end, 2000);
  const tooLong = `🙂 ${value}`;
  const rejected = insertCommentMention(tooLong, ines, findMentionToken(tooLong, tooLong.length));
  assert.equal(rejected.inserted, false);
  assert.equal(rejected.value, tooLong);
  assert.deepEqual(rejected.mentions, []);
  assert.equal(insertCommentMention('simple texte', ines, {start: 0, end: 6, query: 'simple'}).inserted, false);
});

test('normalization validates exact text and non-overlapping positional identities independently of the catalog', () => {
  const value = '@Inès Morel et @Inès Morel';
  const first = range(value, 'Inès Morel', 'unknown-yet'), second = range(value, 'Inès Morel', 'second', first.end);
  const input = [second, first, {...first}, {profileId: 'bad', start: -1, end: 10, label: 'Inès Morel'},
    {...first, start: 0.5}, {...first, label: 'Ines Morel'}, {...first, end: Infinity}, {...first, profileId: 'bad id'}];
  assert.deepEqual(normalizeCommentMentions(value, input), [first, second]);
  assert.deepEqual(normalizeCommentMentions(value, [first, {...first, profileId: 'conflict'}, second]), [second]);
  assert.deepEqual(normalizeCommentMentions('@Inès MorelX', [first]), []);
  assert.deepEqual(normalizeCommentMentions(value, [{...first, label: undefined}]), []);
});

test('editing outside ranges moves them while modification, partial deletion or name extension removes only the affected link', () => {
  const value = 'Bonjour @Inès Morel puis @Noé Laurent !';
  const mentions = [range(value, 'Inès Morel'), range(value, 'Noé Laurent', noe.id)];
  const prefixed = '🙂 ' + value;
  assert.deepEqual(updateCommentMentions(value, prefixed, mentions), mentions.map(item => ({...item, start: item.start + 3, end: item.end + 3})));
  const edited = value.replace('Inès', 'Ines');
  assert.deepEqual(updateCommentMentions(value, edited, mentions), [mentions[1]]);
  const deleted = value.replace('@Inès Morel ', '');
  assert.deepEqual(updateCommentMentions(value, deleted, mentions), [range(deleted, 'Noé Laurent', noe.id)]);
  const extended = value.replace('Morel', 'MorelX');
  assert.deepEqual(updateCommentMentions(value, extended, mentions), [range(extended, 'Noé Laurent', noe.id)]);
  const punctuation = value.replace('Morel', 'Morel,');
  assert.deepEqual(updateCommentMentions(value, punctuation, mentions), [mentions[0], range(punctuation, 'Noé Laurent', noe.id)]);
  assert.deepEqual(updateCommentMentions(value, value + ' Extra.', mentions), mentions);
});

test('explicit edit positions preserve the intended identity when duplicate display names occur', () => {
  const value = '@Inès Morel @Inès Morel';
  const first = range(value, 'Inès Morel', 'first-profile'), second = range(value, 'Inès Morel', 'second-profile', first.end);
  const remaining = '@Inès Morel';
  assert.deepEqual(updateCommentMentions(value, remaining, [first, second], {start: 0, end: second.start}),
    [{...second, start: 0, end: remaining.length}]);
  assert.deepEqual(updateCommentMentions(value, remaining, [first, second], {start: first.end, end: value.length}), [first]);
  assert.deepEqual(updateCommentMentions(value, remaining, [first, second]), []);
  assert.deepEqual(updateCommentMentions(value, remaining, [first, second], {start: 100, end: 101}), []);
});

test('unselected duplicate text never gains a link and uncertain edits cannot transfer a link to it', () => {
  const value = '@Inès Morel @Inès Morel', first = range(value, 'Inès Morel');
  assert.deepEqual(normalizeCommentMentions(value, [first]), [first]);
  const expanded = '@Inès Morel ' + value;
  assert.deepEqual(updateCommentMentions(value, expanded, [first]), []);
  assert.deepEqual(updateCommentMentions(value, expanded, [first], {start: 0, end: 0}), [{...first, start: 12, end: 23}]);
  const suffix = value + ' texte';
  assert.deepEqual(updateCommentMentions(value, suffix, [first]), [first]);
});

test('known emoji insertion and trim preserve correct UTF-16 positions and untouched literal text', () => {
  const value = '  @Inès Morel et <b>bonjour</b>  ', mentions = [range(value, 'Inès Morel')];
  const withEmoji = '🚀' + value;
  const moved = updateCommentMentions(value, withEmoji, mentions, {start: 0, end: 0});
  assert.equal(moved[0].start, 4);
  const adjacent = '@Inès Morel';
  assert.deepEqual(updateCommentMentions(adjacent, '🚀' + adjacent, [range(adjacent, 'Inès Morel')], {start: 0, end: 0}),
    [{profileId: ines.id, start: 2, end: 13, label: 'Inès Morel'}]);
  const trimmed = trimCommentMentions(value, mentions);
  assert.equal(trimmed.value, '@Inès Morel et <b>bonjour</b>');
  assert.deepEqual(trimmed.mentions, [{...mentions[0], start: 0, end: 11}]);
  assert.deepEqual(trimCommentMentions(' \n ', []), {value: '', mentions: []});
  assert.deepEqual(normalizeCommentMentions(JSON.parse(JSON.stringify(value)), JSON.parse(JSON.stringify(mentions))), mentions);
});

test('all known single-range replacements keep only unchanged, unambiguous selected names', () => {
  const value = 'A @Inès Morel B @Noé Laurent C';
  const mentions = [range(value, 'Inès Morel'), range(value, 'Noé Laurent', noe.id)];
  for (let start = 0; start <= value.length; start++) {
    for (let end = start; end <= value.length; end++) {
      for (const replacement of ['', '✨ ', 'changed']) {
        const next = value.slice(0, start) + replacement + value.slice(end);
        const result = updateCommentMentions(value, next, mentions, {start, end});
        for (const mention of result) {
          assert.equal(next.slice(mention.start, mention.end), `@${mention.label}`);
          const old = mentions.find(item => item.profileId === mention.profileId);
          if (next !== value) assert.ok(old.end <= start || old.start >= end,
            `An edited name kept its link for ${start}:${end} → ${replacement}`);
        }
      }
    }
  }
});
