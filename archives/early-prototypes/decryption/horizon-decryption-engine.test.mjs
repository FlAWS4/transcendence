import test from 'node:test';
import assert from 'node:assert/strict';
import { PHRASE, KEY, ALPHABET, MOTION, encrypt, decrypt, encode, decode, createTimeline } from './horizon-decryption-engine.mjs';

test('rotation 42 produces the exact fifteen-character ciphertext, including digits and a symbol', () => {
  assert.equal(PHRASE.length, 15);
  assert.equal(KEY, 42);
  assert.equal(ALPHABET.length, 76);
  assert.equal(new Set(ALPHABET).size, 76);
  assert.equal(encrypt('B'), 'r');
  assert.equal(encrypt('E'), 'u');
  assert.equal(encrypt('Y'), '%');
  assert.equal(encrypt(PHRASE), 'ru%43t 9xu s4tu');
  assert.equal(decrypt('ru%43t 9xu s4tu'), PHRASE);
  const bytes = [114, 117, 37, 52, 51, 116, 32, 57, 120, 117, 32, 115, 52, 116, 117];
  assert.deepEqual(encode(PHRASE), bytes);
  assert.equal(decode(bytes), PHRASE);
  assert.equal(decode(new Uint8Array(bytes)), PHRASE);
});

test('rotation is reversible across every ASCII character and preserves characters outside ALPHABET', () => {
  const allAscii = String.fromCharCode(...Array.from({ length: 128 }, (_, index) => index));
  for (const key of [0, 1, 42, 75, 76, 255]) {
    assert.equal(decrypt(encrypt(allAscii, key), key), allAscii);
    assert.equal(decode(encode(allAscii, key), key), allAscii);
  }
  assert.equal(encrypt(' \t\n\r[](){}.,:;'), ' \t\n\r[](){}.,:;');
  assert.equal(encrypt(ALPHABET, 76), ALPHABET);
});

test('binary, hexadecimal, and ciphertext phases retain exactly the same underlying octets', () => {
  const timeline = createTimeline();
  for (const [time, phase] of [[0, 'binary'], [1700, 'hex'], [3100, 'cipher']]) {
    const states = timeline.sample(time);
    assert.ok(states.every(state => state.phase === phase));
    assert.equal(states.map(state => state.character).join(''), 'ru%43t 9xu s4tu');
    assert.deepEqual(states.map(state => state.byte), timeline.bytes);
    assert.ok(states.every(state => Number.parseInt(state.hex, 16) === state.byte));
  }
  assert.equal(timeline.sample(1700)[0].hex, '72');
  assert.equal(timeline.sample(1700)[2].hex, '25');
  assert.equal(timeline.sample(1700)[6].hex, '20');
  assert.equal(timeline.sample(1700)[10].hex, '20');
  assert.equal(timeline.sample(1600)[0].phase, 'hex');
  assert.equal(timeline.sample(1600).at(-1).phase, 'binary');
});

test('both representation transformations are continuous, bounded, and duration-scaled', () => {
  const timeline = createTimeline();
  const slower = createTimeline(PHRASE, { durationMs: MOTION.durationMs * 2 });
  for (const index of [0, PHRASE.length - 1]) {
    for (const name of ['binaryToHex', 'hexToCipher']) {
      const motion = MOTION[name];
      const start = motion.startMs + MOTION.representationStaggerMs * index / (PHRASE.length - 1);
      const end = start + motion.durationMs;
      assert.equal(timeline.sample(start - 1)[index][name], 0);
      assert.equal(timeline.sample(start)[index][name], 0);
      assert.equal(timeline.sample(start + motion.durationMs / 2)[index][name], 0.5);
      assert.equal(timeline.sample(end)[index][name], 1);
      assert.equal(timeline.sample(end + 1)[index][name], 1);
      let previous = 0;
      for (let time = start - 16; time <= end + 16; time += 16) {
        const progress = timeline.sample(time)[index][name];
        assert.ok(progress >= 0 && progress <= 1);
        assert.ok(progress >= previous);
        assert.ok(progress - previous <= 16 / motion.durationMs + 1e-12);
        assert.equal(slower.sample(time * 2)[index][name], progress);
        previous = progress;
      }
    }
  }
});

test('decryption makes 42 actual backward rotations, including wraparound through symbols', () => {
  const timeline = createTimeline();
  for (let step = 0; step <= 42; step += 1) {
    const state = timeline.sample(3400 + step * 3000 / 42 + 0.001)[0];
    assert.equal(state.character, ALPHABET[43 - step]);
    assert.equal(state.encryptedCharacter, 'r');
    assert.equal(state.encryptedByte, 114);
    assert.equal(state.byte, state.character.charCodeAt(0));
    assert.equal(state.phase, step === 42 ? 'letter' : 'decrypting');
  }
  // z (index 51) encrypts to R (index 17); walking back crosses index zero.
  const wrapped = createTimeline('z');
  assert.equal(wrapped.sample(0)[0].encryptedCharacter, 'R');
  assert.equal(wrapped.sample(3400 + 17 * 3000 / 42 + 0.001)[0].character, 'A');
  assert.equal(wrapped.sample(3400 + 18 * 3000 / 42 + 0.001)[0].character, '>');
  assert.equal(wrapped.sample(6400)[0].character, 'z');
  assert.equal(timeline.sample(3500)[0].phase, 'decrypting');
  assert.equal(timeline.sample(3500).at(-1).phase, 'cipher');
});

test('phases are ordered and the final sample contains only the exact plaintext', () => {
  const timeline = createTimeline();
  const phases = ['binary', 'hex', 'cipher', 'decrypting', 'letter'];
  let previous = timeline.sample(0);
  assert.deepEqual(timeline.sample(-100), previous);
  assert.equal(timeline.durationMs, 6800);
  for (let time = 0; time <= timeline.durationMs; time += 16) {
    const current = timeline.sample(time);
    for (const [index, state] of current.entries()) {
      assert.ok(phases.indexOf(state.phase) >= phases.indexOf(previous[index].phase));
      if (index === 6 || index === 10) {
        assert.equal(state.character, ' ');
        assert.equal(state.byte, 32);
      }
    }
    previous = current;
  }
  const final = timeline.sample(timeline.durationMs);
  assert.ok(final.every(state => state.phase === 'letter'));
  assert.equal(final.map(state => state.character).join(''), PHRASE);
  assert.equal(String.fromCharCode(...final.map(state => state.byte)), PHRASE);
  assert.deepEqual(timeline.sample(timeline.durationMs + 100), final);
});

test('sampling is seekable, duration-scaled, and unaffected by external mutations', () => {
  const timeline = createTimeline();
  const snapshot = timeline.sample(3800);
  timeline.sample(5000);
  timeline.bytes.fill(0);
  const other = timeline.sample(3800);
  other[0].byte = 0;
  assert.deepEqual(timeline.sample(3800), snapshot);
  assert.deepEqual(createTimeline(PHRASE, { durationMs: 13600 }).sample(7600), snapshot);
  assert.deepEqual(createTimeline('').sample(0), []);
  assert.equal(createTimeline('B').sample(6800)[0].character, 'B');
});

test('invalid ASCII, keys, bytes, and timeline arguments are rejected', () => {
  for (const text of ['أفق', 'é', '🌍']) {
    assert.throws(() => encrypt(text), RangeError);
    assert.throws(() => decrypt(text), RangeError);
    assert.throws(() => encode(text), RangeError);
  }
  assert.throws(() => encode(42), TypeError);
  for (const key of [-1, 256, 2.5, NaN, '42']) {
    assert.throws(() => encode('B', key), RangeError);
    assert.throws(() => decode([114], key), RangeError);
  }
  for (const bytes of [[-1], [128], [256], [1.5], [NaN], ['114']]) {
    assert.throws(() => decode(bytes), RangeError);
  }
  assert.throws(() => decode('114'), TypeError);
  for (const durationMs of [0, -1, Infinity, NaN, '5200']) {
    assert.throws(() => createTimeline(PHRASE, { durationMs }), RangeError);
  }
  for (const elapsed of [NaN, Infinity, '0']) {
    assert.throws(() => createTimeline().sample(elapsed), RangeError);
  }
});
