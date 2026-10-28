/**
 * Deterministic representation/decryption model for the introduction.
 * Rotation by 42 over an extended alphabet is a visual puzzle, not a security
 * mechanism. This module has no DOM, scheduler, randomness, or authentication.
 */
export const PHRASE = 'BEYOND THE CODE';
export const KEY = 42;
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*?+-=/<>';
export const MOTION = Object.freeze({
  durationMs: 6800,
  binaryToHex: Object.freeze({ startMs: 600, durationMs: 900 }),
  hexToCipher: Object.freeze({ startMs: 1900, durationMs: 900 }),
  representationStaggerMs: 160,
  decryption: Object.freeze({ startMs: 3400, durationMs: 3000, staggerMs: 400 }),
});

function assertKey(key) {
  if (!Number.isInteger(key) || key < 0 || key > 255) {
    throw new RangeError('The key must be an integer between 0 and 255.');
  }
}

function asciiBytes(text) {
  if (typeof text !== 'string') throw new TypeError('Text must be a string.');
  return Array.from(text, character => {
    const byte = character.codePointAt(0);
    if (byte > 127) throw new RangeError('Text must contain only ASCII characters.');
    return byte;
  });
}

function rotate(character, offset) {
  const index = ALPHABET.indexOf(character);
  if (index < 0) return character;
  return ALPHABET[((index + offset) % ALPHABET.length + ALPHABET.length) % ALPHABET.length];
}

/** Rotate letters, numbers, and symbols from ALPHABET. Other ASCII stays equal. */
export function encrypt(text, key = KEY) {
  assertKey(key);
  return asciiBytes(text).map(byte => rotate(String.fromCharCode(byte), key)).join('');
}

export function decrypt(ciphertext, key = KEY) {
  assertKey(key);
  return asciiBytes(ciphertext).map(byte => rotate(String.fromCharCode(byte), -key)).join('');
}

/** Return the ASCII octets of the encrypted text. */
export function encode(text, key = KEY) {
  return asciiBytes(encrypt(text, key));
}

/** Convert ciphertext octets (Array or Uint8Array) to the decrypted text. */
export function decode(bytes, key = KEY) {
  assertKey(key);
  if (!Array.isArray(bytes) && !(bytes instanceof Uint8Array)) {
    throw new TypeError('Bytes must be an Array or Uint8Array.');
  }
  const ciphertext = Array.from(bytes, byte => {
    if (!Number.isInteger(byte) || byte < 0 || byte > 127) {
      throw new RangeError('Each ASCII byte must be an integer between 0 and 127.');
    }
    return String.fromCharCode(byte);
  }).join('');
  return decrypt(ciphertext, key);
}

/**
 * Create a stateless, seekable timeline with five ordered phases:
 * binary → hex → cipher → decrypting → letter.
 *
 * The two representation morphs expose continuous, linear 0–1 progress over
 * 900 ms each. The phase advances only once the corresponding morph finishes.
 * Binary initially holds for 600 ms; clear hex holds for 400 ms between morphs.
 * Decryption starts at 3400–3800 ms and takes 3000 ms per character, in 42
 * actual backward rotations through ALPHABET. The final character settles at
 * 6800 ms. MOTION is the shared timing source; all values scale with durationMs,
 * independently of frame rate. Renderers may ease the linear progress visually.
 */
export function createTimeline(text = PHRASE, { durationMs = MOTION.durationMs } = {}) {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new RangeError('Duration must be a finite positive number.');
  }
  const encrypted = encode(text);
  const scale = durationMs / MOTION.durationMs;
  const shift = KEY;

  return {
    durationMs,
    // Callers may inspect this copy without affecting subsequent samples.
    bytes: [...encrypted],
    sample(elapsedMs) {
      if (!Number.isFinite(elapsedMs)) {
        throw new RangeError('Elapsed time must be a finite number.');
      }
      const elapsed = Math.max(0, elapsedMs);
      return encrypted.map((encryptedByte, index) => {
        const position = index / Math.max(1, encrypted.length - 1);
        const representationDelay = MOTION.representationStaggerMs * position;
        const progress = motion => Math.max(0, Math.min(1,
          (elapsed - (motion.startMs + representationDelay) * scale) / (motion.durationMs * scale)));
        const binaryToHex = progress(MOTION.binaryToHex);
        const hexToCipher = progress(MOTION.hexToCipher);
        const decryptionStart = (MOTION.decryption.startMs + MOTION.decryption.staggerMs * position) * scale;
        const decryptionDuration = MOTION.decryption.durationMs * scale;
        const encryptedCharacter = String.fromCharCode(encryptedByte);
        let phase;
        let steps = 0;

        if (elapsed >= durationMs || elapsed >= decryptionStart + decryptionDuration) {
          phase = 'letter';
          steps = shift;
        } else if (elapsed >= decryptionStart) {
          // Whitespace and ASCII outside ALPHABET already have their final form.
          phase = ALPHABET.includes(encryptedCharacter) ? 'decrypting' : 'letter';
          steps = Math.min(shift - 1, Math.floor((elapsed - decryptionStart) / decryptionDuration * shift));
        } else if (hexToCipher === 1) {
          phase = 'cipher';
        } else if (binaryToHex === 1) {
          phase = 'hex';
        } else {
          phase = 'binary';
        }

        const character = rotate(encryptedCharacter, -steps);
        const byte = character.charCodeAt(0);
        return {
          index,
          encryptedCharacter,
          encryptedByte,
          byte,
          hex: byte.toString(16).padStart(2, '0').toUpperCase(),
          character,
          phase,
          binaryToHex,
          hexToCipher,
        };
      });
    },
  };
}
