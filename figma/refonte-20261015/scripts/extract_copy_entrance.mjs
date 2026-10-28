// Interface copy of the « Arrivée et décryptage » zone (entrance), read from the prototype's source (read-only), for the
// Figma rebuild of 15 Oct 2026. Writes ../copy-entrance.json as {"key": {"fr": "…", "en": "…", "ar": "…", "where": "…"}}.
// Same method as extract_copy_projects.mjs: named literals are located in each module and evaluated alone in an empty VM
// context; inline strings are located by an exact source excerpt, so a changed prototype makes this script fail instead
// of writing stale text.
// Usage: node figma/refonte-20261015/scripts/extract_copy_entrance.mjs
import {readFileSync, writeFileSync} from 'node:fs';
import vm from 'node:vm';

const proto = new URL('../../../site/', import.meta.url);
const out = new URL('../copy-entrance.json', import.meta.url);
const sources = new Map();
const source = file => {
 if (!sources.has(file)) sources.set(file, readFileSync(new URL(file, proto), 'utf8'));
 return sources.get(file);
};

// Balanced extraction of the literal that follows `const NAME=` (strings, template literals and escapes respected).
function literal(file, name) {
 const src = source(file);
 const match = new RegExp('(?:^|[\\s;,(])(?:export\\s+)?(?:const|let|var)\\s+' + name + '\\s*=\\s*').exec(src);
 if (!match) throw new Error(`${file}: literal ${name} not found`);
 const open = match.index + match[0].length;
 if (!'{[\'"'.includes(src[open])) throw new Error(`${file}: ${name} is not a literal`);
 if (src[open] === '\'' || src[open] === '"') {
  const end = src.indexOf(src[open], open + 1);
  return vm.runInNewContext(src.slice(open, end + 1), {});
 }
 let depth = 0, quote = null;
 for (let i = open; i < src.length; i++) {
  const c = src[i];
  if (quote) { if (c === '\\') { i++; continue; } if (c === quote) quote = null; continue; }
  if (c === '\'' || c === '"' || c === '`') { quote = c; continue; }
  if (c === '{' || c === '[') depth++;
  else if (c === '}' || c === ']') { depth--; if (depth === 0) return vm.runInNewContext('(' + src.slice(open, i + 1) + ')', {}); }
 }
 throw new Error(`${file}: unbalanced literal ${name}`);
}
function present(file, excerpt) {
 if (!source(file).includes(excerpt)) throw new Error(`${file}: excerpt not found: ${excerpt.slice(0, 80)}`);
 return true;
}
function inline(file, excerpt) {
 present(file, excerpt);
 return vm.runInNewContext('(' + excerpt + ')', {});
}

const entries = {};
const add = (key, value, where) => {
 if (entries[key]) throw new Error('duplicate key ' + key);
 entries[key] = {fr: value.fr ?? '', en: value.en ?? '', ar: value.ar ?? '', where};
};
const pick = (dictionary, key) => ({fr: dictionary.fr?.[key], en: dictionary.en?.[key], ar: dictionary.ar?.[key]});
const same = text => ({fr: text, en: text, ar: text});

// ---- entrance.mjs ------------------------------------------------------------------------------------------------
const copy = literal('entrance.mjs', 'copy');
const signup = literal('entrance.mjs', 'signupCopy');
const interaction = literal('entrance.mjs', 'interactionCopy');
const where = 'entrance.mjs';
add('arrival.login', pick(copy, 'login'), `${where} copy.login — bouton principal de l’arrivée (#entry-login). Sur un site FR, son libellé alterne FR → EN → AR toutes les 4 s sans changer la langue du site ; dans la fenêtre de connexion ouverte depuis le compte, voir account.signin`);
add('arrival.guest', pick(copy, 'guest'), `${where} copy.guest — bouton secondaire de l’arrivée (#entry-guest), même alternance`);
add('arrival.labelsDescription', pick(interaction, 'languages'), `${where} interactionCopy.languages — aria-description des deux boutons (non affichée)`);
add('arrival.backgroundToDark', pick(interaction, 'dark'), `${where} interactionCopy.dark — nom accessible du fond cliquable (#entry-theme-toggle) en thème clair`);
add('arrival.backgroundToLight', pick(interaction, 'light'), `${where} interactionCopy.light — nom accessible du fond cliquable en thème sombre`);
add('arrival.region', inline('entrance.mjs', "{fr:'Entrée',en:'Entrance',ar:'الدخول'}"), `${where} refresh() — aria-label de la section #entrance`);
add('arrival.sceneEncrypted', pick(copy, 'encrypted'), `${where} copy.encrypted — aria-label de #entrance-scene (rôle img) pendant le scan et au repos`);
add('arrival.sceneDecoding', pick(copy, 'decoding'), `${where} copy.decoding — aria-label de #entrance-scene pendant le déchiffrement`);
add('signin.title', pick(copy, 'title'), `${where} copy.title — titre de la fenêtre entry-signin (#dialog-title, data-kind=login)`);
add('signin.description', pick(copy, 'description'), `${where} copy.description — paragraphe .dialog-text`);
add('signin.confirm', pick(copy, 'confirm'), `${where} copy.confirm — bouton principal (lance le déchiffrement)`);
add('signin.cancel', pick(copy, 'cancel'), `${where} copy.cancel — bouton secondaire (même texte dans entry-signup)`);
add('signup.title', pick(signup, 'title'), `${where} signupCopy.title — titre de la fenêtre entry-signup (data-kind=signup)`);
add('signup.description', pick(signup, 'description'), `${where} signupCopy.description — paragraphe .dialog-text`);
add('signup.confirm', pick(signup, 'confirm'), `${where} signupCopy.confirm — bouton principal (lance le déchiffrement) ; bouton secondaire = signin.cancel`);
add('worldWait.status', pick(copy, 'waiting'), `${where} copy.waiting — #entrance-status sous le cercle (world-wait)`);
add('error.status', pick(copy, 'error'), `${where} copy.error — #entrance-status de l’écran entry-error`);
add('error.retry', pick(copy, 'retry'), `${where} copy.retry — 1er bouton de l’écran entry-error (principal, focus à l’ouverture)`);
add('error.back', pick(copy, 'back'), `${where} copy.back — 2e bouton (secondaire) : retour au message chiffré`);
add('error.continue', pick(copy, 'continue'), `${where} copy.continue — 3e bouton (secondaire) : Explorer sans le globe`);

// ---- decryption model --------------------------------------------------------------------------------------------
// The engine is a pure module (no DOM): it is imported to compute the ciphertext exactly as the renderer does.
const engine = await import(new URL('../horizon-decryption-engine.mjs', proto).href);
const phrase = literal('../horizon-decryption-engine.mjs', 'PHRASE');
if (phrase !== engine.PHRASE) throw new Error('PHRASE mismatch');
add('decrypt.phrase', same(phrase), 'horizon-decryption-engine.mjs PHRASE — texte final du canvas (decrypt-final), identique dans les trois langues ; aussi aria-label de la scène et annonce #announcement');
add('arrival.ciphertext', same(engine.encrypt(engine.PHRASE)), `horizon-decryption-engine.mjs encrypt(PHRASE) — rotation de ${engine.KEY} positions dans ALPHABET (${engine.ALPHABET.length} caractères) ; texte du canvas au repos (arrival-encrypted), identique dans les trois langues`);
add('opening.symbol', same('42'), 'index.html — aria-label de #entrance-symbol et alt de l’image du logo (logo-42.svg)');

// ---- shared shell visible on these screens -------------------------------------------------------------------------
const welcome = literal('welcome.mjs', 'copy');
add('dialog.close', pick(welcome, 'close'), 'welcome.mjs copy.close — nom accessible de la croix #close-dialog (fenêtres entry-signin / entry-signup)');
const account = literal('account-menu.mjs', 'copy');
add('account.trigger', pick(account, 'menu'), 'account-menu.mjs copy.menu — nom accessible du bouton du compte (#profile), visible seulement sur l’écran entry-error de l’entrée');
add('account.signin', pick(account, 'signin'), 'account-menu.mjs copy.signin — accès du panneau du compte (écran entry-error) ; revient d’abord au message chiffré puis ouvre entry-signin');
add('account.signup', literal('account-menu.mjs', 'signUpLabel'), 'account-menu.mjs signUpLabel — accès du panneau du compte (écran entry-error) ; revient d’abord au message chiffré puis ouvre entry-signup');
add('welcome.loading', pick(welcome, 'loading'), 'welcome.mjs copy.loading — #loading de l’accueil (caché derrière l’entrée ; mêmes textes que worldWait.status, définis séparément)');
add('welcome.error', pick(welcome, 'error'), 'welcome.mjs copy.error — #loading en cas d’échec (caché derrière l’entrée)');
present('index.html', '<title>42 Horizon — Un monde à explorer</title>');
add('page.title', {fr: '42 Horizon — Un monde à explorer', en: '', ar: ''}, 'index.html <title> — fixe, non traduit');

const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(out, JSON.stringify({
 _meta: {fr: 'Textes d’interface de la zone Arrivée et décryptage, relevés dans le code source du prototype actif (non traduits par l’outil). Le site charge toujours en français ; l’anglais et l’arabe s’atteignent à l’arrivée par le compte de l’écran d’erreur.', en: '', ar: '',
  where: 'figma/refonte-20261015/scripts/extract_copy_entrance.mjs, 15 oct. 2026 ; géométrie et polices : spec-entrance.md'},
 ...sorted,
}, null, 1) + '\n');
console.log(Object.keys(sorted).length + ' keys written to ' + out.pathname);
