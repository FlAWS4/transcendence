import { PHRASE, createTimeline } from './horizon-decryption-engine.mjs';
import { createMorphRenderer } from './horizon-decryption-morph.mjs';

const byId = id => document.getElementById(id);
const timeline = createTimeline();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const copy = {
  fr: { login: 'Se connecter', guest: 'Explorer en visiteur', dialogTitle: 'Connexion — prototype', dialogDescription: 'Cette maquette simule la connexion pour montrer la révélation. Aucune authentification réelle n’est effectuée.', confirm: 'Simuler une connexion réussie', cancel: 'Annuler', replay: 'Rejouer', back: 'Revenir à l’entrée', encrypted: 'Message chiffré', decoding: 'Déchiffrement en cours', guestStatus: 'Parcours visiteur', dark: 'Activer le thème sombre', light: 'Activer le thème clair', language: 'Langue' },
  en: { login: 'Sign in', guest: 'Explore as a visitor', dialogTitle: 'Sign in — prototype', dialogDescription: 'This prototype simulates sign-in to show the reveal. No real authentication takes place.', confirm: 'Simulate a successful sign-in', cancel: 'Cancel', replay: 'Replay', back: 'Back to the entrance', encrypted: 'Encrypted message', decoding: 'Decrypting', guestStatus: 'Visitor path', dark: 'Enable dark theme', light: 'Enable light theme', language: 'Language' },
  ar: { login: 'تسجيل الدخول', guest: 'استكشف كزائر', dialogTitle: 'تسجيل الدخول — نموذج أولي', dialogDescription: 'يحاكي هذا النموذج تسجيل الدخول لإظهار الكشف. لا يتم إجراء مصادقة حقيقية.', confirm: 'محاكاة تسجيل دخول ناجح', cancel: 'إلغاء', replay: 'إعادة العرض', back: 'العودة إلى البداية', encrypted: 'رسالة مشفرة', decoding: 'جارٍ فك التشفير', guestStatus: 'مسار الزائر', dark: 'تفعيل المظهر الداكن', light: 'تفعيل المظهر الفاتح', language: 'اللغة' },
};
const preferencesLabel = { fr: 'Préférences', en: 'Preferences', ar: 'التفضيلات' };
const query = new URLSearchParams(location.search);
// This query parameter is a preview setting, never an IP lookup.
const region = query.get('region') === 'arab-world' ? 'arab-world' : 'other';
let language = Object.hasOwn(copy, query.get('lang')) ? query.get('lang') : 'fr';
let stage = 'encrypted';
let frame = 0;
let startedAt = 0;
let pausedAt = 0;
const cells = [];
const first = document.createElement('span');
const last = document.createElement('span');
first.className = last.className = 'phrase-group';
byId('phrase').append(first, last);

for (const [index, character] of Array.from(PHRASE).entries()) {
  const cell = document.createElement('span');
  cell.className = `cell${index === 6 ? ' separator' : ''}`;
  cell.dataset.index = index;
  const glyph = document.createElement('span');
  glyph.className = 'glyph';
  const measure = document.createElement('span');
  measure.className = 'measure';
  measure.textContent = character === ' ' ? '\u00a0' : character;
  const hex = document.createElement('span');
  hex.className = 'hex';
  const binary = document.createElement('span');
  binary.className = 'binary';
  const bits = Array.from({ length: 8 }, () => {
    const bit = document.createElement('span');
    bit.className = 'bit';
    binary.append(bit);
    return bit;
  });
  const canvas = document.createElement('canvas');
  canvas.className = 'morph';
  cell.append(measure, glyph, binary, hex, canvas);
  (index <= 6 ? first : last).append(cell);
  cells.push({ cell, measure, glyph, binary, hex, bits, canvas, width: 0, previous: '' });
}
const renderer = createMorphRenderer(cells, byId('phrase'));

function render(elapsed) {
  const states = timeline.sample(elapsed);
  for (const state of states) {
    const view = cells[state.index];
    view.cell.dataset.binaryToHex = state.binaryToHex.toFixed(3);
    view.cell.dataset.hexToCipher = state.hexToCipher.toFixed(3);
    const signature = `${state.phase}:${state.byte}`;
    if (view.previous === signature) continue;
    view.previous = signature;
    view.cell.dataset.phase = state.phase;
    view.glyph.textContent = state.character === ' ' ? '\u00a0' : state.character;
    view.hex.textContent = state.hex;
    const bits = state.encryptedByte.toString(2).padStart(8, '0');
    view.bits.forEach((bit, index) => {
      bit.textContent = bits[index];
    });
  }
  renderer.render(states);
}

function setStage(next) {
  stage = next;
  document.body.dataset.stage = next;
  byId('access').hidden = next !== 'encrypted';
  byId('message').hidden = next === 'guest';
  byId('guest-scene').hidden = next !== 'guest';
  byId('replay-area').hidden = !['decoded', 'guest'].includes(next);
  translate();
}

function translate() {
  const t = copy[language];
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-copy]').forEach(node => { node.textContent = t[node.dataset.copy]; });
  byId('language').value = language;
  byId('language').setAttribute('aria-label', t.language);
  byId('utilities').setAttribute('aria-label', preferencesLabel[language]);
  byId('replay').textContent = stage === 'guest' ? t.back : t.replay;
  byId('arabic-name').hidden = !(language === 'ar' || (language === 'en' && region === 'arab-world'));
  byId('theme').setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? t.light : t.dark);
  byId('message').setAttribute('aria-label', stage === 'decoded' ? PHRASE : stage === 'decrypting' ? t.decoding : t.encrypted);
}

function reset() {
  cancelAnimationFrame(frame);
  frame = 0;
  pausedAt = 0;
  render(0);
  byId('announcement').textContent = '';
  setStage('encrypted');
}

function finish() {
  render(timeline.durationMs);
  frame = 0;
  setStage('decoded');
  byId('announcement').textContent = PHRASE;
  if (!byId('utilities').contains(document.activeElement)) {
    byId('replay').focus({ preventScroll: true });
  }
}

function tick(now) {
  if (stage !== 'decrypting') return;
  const elapsed = now - startedAt;
  render(elapsed);
  if (elapsed >= timeline.durationMs) finish();
  else frame = requestAnimationFrame(tick);
}

function start() {
  reset();
  setStage('decrypting');
  byId('announcement').textContent = copy[language].decoding;
  if (reducedMotion.matches) return finish();
  startedAt = performance.now();
  frame = requestAnimationFrame(tick);
}

byId('login').addEventListener('click', () => byId('connection').showModal());
byId('cancel').addEventListener('click', () => byId('connection').close());
byId('confirm').addEventListener('click', () => { byId('connection').close(); start(); });
byId('guest').addEventListener('click', () => {
  cancelAnimationFrame(frame);
  setStage('guest');
  byId('announcement').textContent = copy[language].guestStatus;
  byId('replay').focus({ preventScroll: true });
});
byId('replay').addEventListener('click', () => {
  if (stage === 'guest') { reset(); byId('login').focus(); }
  else start();
});
byId('language').addEventListener('change', event => { language = event.target.value; translate(); });
byId('theme').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  byId('theme').setAttribute('aria-pressed', String(dark));
  translate();
  renderer.repaint();
});
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches && stage === 'decrypting') { cancelAnimationFrame(frame); finish(); } });
document.addEventListener('visibilitychange', () => {
  if (stage !== 'decrypting') return;
  if (document.hidden) { pausedAt = performance.now(); cancelAnimationFrame(frame); }
  else if (pausedAt) { startedAt += performance.now() - pausedAt; pausedAt = 0; frame = requestAnimationFrame(tick); }
});
reset();
new ResizeObserver(renderer.resize).observe(byId('phrase'));
document.fonts.ready.then(renderer.resize);
