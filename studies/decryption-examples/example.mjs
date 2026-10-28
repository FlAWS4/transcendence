import { model } from './shared.mjs';
import { variants } from './variants.mjs';

const variant = document.body.dataset.variant;
const item = variants[variant];
document.title = `${item.number} · ${item.title} — Essai Horizon`;
document.body.innerHTML = `
<header class="example-header"><div><p class="eyebrow"><a href="index.html">Tous les essais</a> · ${item.number} / ${Object.keys(variants).length}</p><h1>${item.title}</h1><p class="description">${item.description}</p></div>
<nav class="navigation" aria-label="Choisir un exemple"><select id="variant" aria-label="Choisir un exemple">${Object.entries(variants).map(([key, data]) => `<option value="${key}" ${key === variant ? 'selected' : ''}>${data.number}. ${data.title}</option>`).join('')}</select><button id="theme" aria-label="Activer le thème sombre" aria-pressed="false"><span class="moon" aria-hidden="true"></span></button></nav></header>
<main><div id="scene" class="scene" role="img" aria-label="Message chiffré"></div>
<div class="transport"><div class="transport-actions"><button id="play">Lire</button><button id="restart">Recommencer</button><label>Vitesse <select id="speed" aria-label="Vitesse de lecture"><option value="0.5">× 0,5</option><option value="1" selected>× 1</option></select></label></div><div class="timeline"><label class="sr-only" for="position">Position dans l’animation</label><input id="position" type="range" min="0" max="6800" step="10" value="0"><output id="time" for="position">0,0 / 6,8 s</output></div></div><p id="announcement" class="sr-only" aria-live="polite"></p></main>`;
const byId = id => document.getElementById(id);
byId('variant').addEventListener('change', event => { location.href = `${event.target.value}.html`; });
const { mount } = await import(`./${variant}.mjs`);
await document.fonts.ready;
const renderer = mount({ root: byId('scene'), model });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let elapsed = 0;
let lastTime = 0;
let playing = false;
let frame = 0;

function paint() {
  renderer.render(elapsed);
  byId('position').value = elapsed;
  byId('time').textContent = `${(elapsed / 1000).toFixed(1).replace('.', ',')} / 6,8 s`;
  byId('scene').dataset.time = Math.round(elapsed);
  byId('scene').setAttribute('aria-label', elapsed >= model.durationMs ? model.PHRASE : 'Message chiffré');
}
function pause() { playing = false; cancelAnimationFrame(frame); byId('play').textContent = elapsed >= model.durationMs ? 'Rejouer' : 'Lire'; }
function tick(now) {
  if (!playing) return;
  elapsed = Math.min(model.durationMs, elapsed + (now - lastTime) * Number(byId('speed').value));
  lastTime = now;
  paint();
  if (elapsed >= model.durationMs) { pause(); byId('announcement').textContent = model.PHRASE; }
  else frame = requestAnimationFrame(tick);
}
function play() {
  if (elapsed >= model.durationMs) elapsed = 0;
  byId('announcement').textContent = '';
  if (reduced.matches) { elapsed = model.durationMs; paint(); pause(); byId('announcement').textContent = model.PHRASE; return; }
  playing = true;
  lastTime = performance.now();
  byId('play').textContent = 'Pause';
  frame = requestAnimationFrame(tick);
}
byId('play').addEventListener('click', () => playing ? pause() : play());
byId('restart').addEventListener('click', () => { pause(); elapsed = 0; paint(); play(); });
byId('position').addEventListener('input', event => { pause(); byId('announcement').textContent = ''; elapsed = Number(event.target.value); paint(); byId('play').textContent = elapsed >= model.durationMs ? 'Rejouer' : 'Lire'; });
byId('theme').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  byId('theme').setAttribute('aria-pressed', String(dark));
  byId('theme').setAttribute('aria-label', dark ? 'Activer le thème clair' : 'Activer le thème sombre');
  paint();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
reduced.addEventListener('change', () => { if (reduced.matches && playing) { pause(); elapsed = model.durationMs; paint(); } });
paint();
