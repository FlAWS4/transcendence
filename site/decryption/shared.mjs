import { PHRASE, KEY, ALPHABET, MOTION, createTimeline } from './horizon-decryption-engine.mjs';

const timeline = createTimeline();
export const model = Object.freeze({ PHRASE, KEY, ALPHABET, durationMs: timeline.durationMs, sample: time => timeline.sample(time) });
const value = (type, text) => ({ type, text });
const still = item => ({ from: item, to: item, progress: 1, settled: true });

export function representation(state) {
  const binary = value('binary', state.encryptedByte.toString(2).padStart(8, '0'));
  const hex = value('hex', state.encryptedByte.toString(16).padStart(2, '0').toUpperCase());
  const cipher = value('glyph', state.encryptedCharacter);
  if (state.binaryToHex === 0) return still(binary);
  if (state.binaryToHex < 1) return { from: binary, to: hex, progress: state.binaryToHex, settled: false };
  if (state.hexToCipher === 0) return still(hex);
  if (state.hexToCipher < 1) return { from: hex, to: cipher, progress: state.hexToCipher, settled: false };
  return still(value('glyph', state.character));
}

let cachedTime = -1;
let cachedStates;
export function transitionAt(time, index) {
  if (time !== cachedTime) { cachedStates = timeline.sample(time); cachedTime = time; }
  const state = cachedStates[index];
  const start = MOTION.decryption.startMs + MOTION.decryption.staggerMs * index / (PHRASE.length - 1);
  if (time < start) return representation(state);
  const cipherIndex = ALPHABET.indexOf(state.encryptedCharacter);
  if (cipherIndex < 0 || time >= start + MOTION.decryption.durationMs) return still(value('glyph', PHRASE[index]));
  const progress = Math.max(0, Math.min(1, (time - start) / MOTION.decryption.durationMs));
  // All 42 positions are visited, with a progressively slower mechanical stop.
  const turns = KEY * (1 - (1 - progress) ** 2);
  const step = Math.min(KEY - 1, Math.floor(turns));
  const characterAt = offset => ALPHABET[(cipherIndex - offset + ALPHABET.length) % ALPHABET.length];
  return { from: value('glyph', characterAt(step)), to: value('glyph', characterAt(step + 1)), progress: turns - step, settled: false };
}
