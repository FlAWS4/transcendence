import test from 'node:test';
import assert from 'node:assert/strict';
import { attachPressGesture } from './press-gesture.mjs';

// Petit arbre d'événements : capture document → surface, puis listeners natifs.
class Target {
  listeners = new Map();
  captures = new Set();
  addEventListener(type, callback, options = {}) {
    const list = this.listeners.get(type) ?? [];
    list.push({ callback, capture: options.capture === true });
    this.listeners.set(type, list);
  }
  removeEventListener(type, callback, options = {}) {
    const list = this.listeners.get(type) ?? [];
    this.listeners.set(type, list.filter(item => item.callback !== callback || item.capture !== (options.capture === true)));
  }
  setPointerCapture(id) { this.captures.add(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
  count() { return [...this.listeners.values()].reduce((total, items) => total + items.length, 0); }
}

function send(target, type, properties = {}) {
  const event = {
    type, target, pointerId: 1, pointerType: 'touch', isPrimary: true,
    button: 0, buttons: 1, clientX: 100, clientY: 150, detail: 1,
    cancelable: true, defaultPrevented: false, stopped: false,
    preventDefault() { this.defaultPrevented = true; },
    stopImmediatePropagation() { this.stopped = true; },
    ...properties,
  };
  const ancestors = target.ownerDocument ? [target.ownerDocument, target] : [target];
  for (const capture of [true, false]) {
    const path = capture ? ancestors : [...ancestors].reverse();
    for (const current of path) {
      for (const listener of current.listeners.get(type) ?? []) {
        if (event.stopped) return event;
        if (listener.capture === capture) listener.callback(event);
      }
    }
  }
  return event;
}

function setup(t, options = {}) {
  let now = 0;
  let serial = 0;
  const scheduled = new Map();
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    const id = ++serial;
    scheduled.set(id, { at: now + delay, callback });
    return id;
  });
  t.mock.method(globalThis, 'clearTimeout', id => scheduled.delete(id));
  const clock = {
    tick(amount) {
      const end = now + amount;
      while (true) {
        const due = [...scheduled.entries()].filter(([, job]) => job.at <= end)
          .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!due) break;
        scheduled.delete(due[0]);
        now = due[1].at;
        due[1].callback();
      }
      now = end;
    },
    pending: () => scheduled.size,
  };
  const window = new Target();
  const document = new Target();
  document.defaultView = window;
  document.visibilityState = 'visible';
  const surface = new Target();
  surface.ownerDocument = document;
  const outside = new Target();
  outside.ownerDocument = document;
  const calls = { open: [], move: [], commit: [], cancel: [] };
  const api = attachPressGesture({
    surface,
    onOpen: value => calls.open.push(value),
    onMove: value => calls.move.push(value),
    onCommit: value => calls.commit.push(value),
    onCancel: value => calls.cancel.push(value),
    ...options,
  });
  t.after(() => api.destroy());
  return { surface, outside, document, window, calls, api, clock };
}

test('un clic court garde tous les événements natifs et ne déclenche rien plus tard', t => {
  const { surface, calls, clock } = setup(t);
  const events = [send(surface, 'pointerdown')];
  clock.tick(180);
  events.push(send(surface, 'pointerup'), send(surface, 'click'));
  clock.tick(1000);
  assert.deepEqual(events.map(event => event.defaultPrevented), [false, false, false]);
  assert.deepEqual(calls, { open: [], move: [], commit: [], cancel: [] });
  assert.equal(surface.captures.size, 0);
});

test('une rotation de plus de 10 px, même diagonale, reste native jusqu’au relâchement', t => {
  const { surface, calls, clock } = setup(t);
  let nativeMoves = 0;
  surface.addEventListener('pointermove', () => nativeMoves++);
  send(surface, 'pointerdown');
  const first = send(surface, 'pointermove', { clientX: 108, clientY: 158 });
  clock.tick(1000);
  const second = send(surface, 'pointermove', { clientX: 150 });
  send(surface, 'pointerup');
  assert.equal(first.defaultPrevented || second.defaultPrevented, false);
  assert.equal(nativeMoves, 2);
  assert.equal(calls.open.length, 0);
  assert.equal(surface.captures.size, 0);
});

test('un appui stable ouvre à 550 ms puis capture seulement le pointeur reconnu', t => {
  const { surface, calls, clock } = setup(t);
  send(surface, 'pointerdown', { pointerId: 7, pointerType: 'pen' });
  send(surface, 'pointermove', { pointerId: 7, clientX: 103, clientY: 154 });
  clock.tick(549);
  assert.equal(calls.open.length, 0);
  assert.equal(surface.captures.size, 0);
  clock.tick(1);
  assert.deepEqual(calls.open, [{ x: 103, y: 154, pointerId: 7, pointerType: 'pen' }]);
  assert.deepEqual([...surface.captures], [7]);
});

test('pincement : le deuxième doigt hors du globe annule sans bloquer les deux doigts', t => {
  const { surface, outside, calls, clock } = setup(t);
  const first = send(surface, 'pointerdown');
  clock.tick(300);
  const second = send(outside, 'pointerdown', { pointerId: 2, isPrimary: false });
  const move = send(surface, 'pointermove', { clientX: 110 });
  clock.tick(1000);
  assert.equal(first.defaultPrevented || second.defaultPrevented || move.defaultPrevented, false);
  assert.equal(calls.open.length, 0);
  assert.equal(calls.cancel.length, 0);
});

test('un premier doigt déjà posé ailleurs interdit un nouvel appui sur le globe', t => {
  const { surface, outside, calls, clock } = setup(t);
  send(outside, 'pointerdown', { pointerId: 3 });
  send(surface, 'pointerdown', { pointerId: 4, isPrimary: false });
  clock.tick(1000);
  assert.equal(calls.open.length, 0);
  send(outside, 'pointerup', { pointerId: 3 });
  send(surface, 'pointerup', { pointerId: 4 });
  send(surface, 'pointerdown', { pointerId: 5 });
  clock.tick(550);
  assert.equal(calls.open.length, 1);
});

test('seul le bouton principal est candidat ; canStart exclut les commandes et rubriques', t => {
  let available = false;
  const { surface, calls, clock } = setup(t, { canStart: () => available });
  send(surface, 'pointerdown');
  clock.tick(1000);
  send(surface, 'pointerup');
  available = true;
  for (const button of [1, 2]) {
    send(surface, 'pointerdown', { pointerType: 'mouse', button });
    clock.tick(1000);
    send(surface, 'pointerup', { button });
  }
  assert.equal(calls.open.length, 0);
  send(surface, 'pointerdown');
  available = false;
  clock.tick(550);
  assert.equal(calls.open.length, 0);
});

test('après ouverture, déplacement et relâchement hors surface sélectionnent sans atteindre la carte', t => {
  const { surface, outside, calls, clock } = setup(t);
  let nativeMoves = 0;
  surface.addEventListener('pointermove', () => nativeMoves++);
  send(surface, 'pointerdown');
  clock.tick(550);
  const move = send(surface, 'pointermove', { clientX: 170, clientY: 90 });
  const up = send(outside, 'pointerup', { clientX: 175, clientY: 85 });
  assert.equal(move.defaultPrevented && up.defaultPrevented, true);
  assert.equal(nativeMoves, 0);
  assert.deepEqual(calls.move, [{ x: 170, y: 90, pointerId: 1, pointerType: 'touch' }]);
  assert.deepEqual(calls.commit, [{ x: 175, y: 85, pointerId: 1, pointerType: 'touch' }]);
  assert.equal(surface.captures.size, 0);
  assert.equal(calls.cancel.length, 0);
});

test('le menu système et le clic synthétique après appui long ne sélectionnent pas de pays', t => {
  const { surface, calls, clock } = setup(t);
  send(surface, 'pointerdown');
  clock.tick(550);
  assert.equal(send(surface, 'contextmenu').defaultPrevented, true);
  send(surface, 'pointerup');
  assert.equal(send(surface, 'contextmenu').defaultPrevented, true);
  assert.equal(send(surface, 'click').defaultPrevented, true);
  assert.equal(send(surface, 'click').defaultPrevented, false);
  assert.equal(calls.commit.length, 1);
});

test('le prochain clic court et les activations clavier ne sont jamais avalés', t => {
  const { surface, clock } = setup(t);
  send(surface, 'pointerdown');
  clock.tick(550);
  send(surface, 'pointerup');
  assert.equal(send(surface, 'click', { detail: 0 }).defaultPrevented, false);
  send(surface, 'pointerdown');
  send(surface, 'pointerup');
  assert.equal(send(surface, 'click').defaultPrevented, false);
});

test('la suppression du clic est limitée au pointeur reconnu et expire', t => {
  const { surface, clock } = setup(t);
  send(surface, 'pointerdown');
  clock.tick(550);
  send(surface, 'pointerup');
  assert.equal(send(surface, 'click', { pointerId: 8 }).defaultPrevented, false);
  assert.equal(send(surface, 'click', { pointerId: undefined, pointerType: undefined, clientX: 300 }).defaultPrevented, false);
  clock.tick(800);
  assert.equal(send(surface, 'click').defaultPrevented, false);
});

const cancellations = {
  wheel: state => send(state.surface, 'wheel'),
  pointercancel: state => send(state.surface, 'pointercancel'),
  blur: state => send(state.window, 'blur'),
  hidden: state => { state.document.visibilityState = 'hidden'; send(state.document, 'visibilitychange'); },
  escape: state => send(state.document, 'keydown', { key: 'Escape' }),
  cancel: state => state.api.cancel(),
  destroy: state => state.api.destroy(),
};

for (const [reason, action] of Object.entries(cancellations)) {
  test(`${reason} annule l’attente sans aucun déclenchement retardé`, t => {
    const state = setup(t);
    send(state.surface, 'pointerdown');
    state.clock.tick(400);
    action(state);
    state.clock.tick(2000);
    assert.equal(state.calls.open.length, 0);
    assert.equal(state.calls.cancel.length, 0);
    assert.equal(state.surface.captures.size, 0);
  });

  test(`${reason} annule un menu ouvert, libère la capture et ne valide aucune action`, t => {
    const state = setup(t);
    send(state.surface, 'pointerdown');
    state.clock.tick(550);
    action(state);
    send(state.surface, 'pointerup');
    state.clock.tick(2000);
    assert.equal(state.calls.cancel.length, 1);
    assert.equal(state.calls.cancel[0].reason, reason);
    assert.equal(state.calls.commit.length, 0);
    assert.equal(state.surface.captures.size, 0);
  });
}

test('la perte de capture ou un second doigt ferment un menu déjà ouvert', t => {
  const state = setup(t);
  send(state.surface, 'pointerdown');
  state.clock.tick(550);
  send(state.surface, 'lostpointercapture');
  assert.equal(state.calls.cancel[0].reason, 'lostcapture');
  send(state.surface, 'pointerup');
  send(state.surface, 'pointerdown');
  state.clock.tick(550);
  send(state.outside, 'pointerdown', { pointerId: 2, isPrimary: false });
  assert.equal(state.calls.cancel[1].reason, 'multiple-pointers');
  assert.equal(state.surface.captures.size, 0);
});

test('destroy retire tous les listeners, timers et captures ; il est idempotent', t => {
  const state = setup(t);
  send(state.surface, 'pointerdown');
  state.clock.tick(550);
  state.api.destroy();
  state.api.destroy();
  assert.equal(state.surface.count() + state.document.count() + state.window.count(), 0);
  assert.equal(state.clock.pending(), 0);
  assert.equal(state.surface.captures.size, 0);
  send(state.surface, 'pointerdown');
  state.clock.tick(1000);
  assert.equal(state.calls.open.length, 1);
  assert.equal(state.calls.cancel.length, 1);
});

test('une fermeture synchrone depuis onOpen ne rétablit pas la capture ensuite', t => {
  let controller;
  const state = setup(t, { onOpen: () => controller.destroy() });
  controller = state.api;
  send(state.surface, 'pointerdown');
  state.clock.tick(550);
  assert.equal(state.surface.captures.size, 0);
  assert.equal(state.clock.pending(), 0);
});

test('le geste peut se terminer même si setPointerCapture est indisponible', t => {
  const state = setup(t);
  state.surface.setPointerCapture = () => { throw new Error('Pointer no longer capturable'); };
  send(state.surface, 'pointerdown');
  state.clock.tick(550);
  send(state.outside, 'pointerup');
  assert.equal(state.calls.commit.length, 1);
  assert.equal(state.calls.cancel.length, 0);
});

test('le focus quittant une commande au mousedown ne cancelle pas le nouvel appui', t => {
  const state = setup(t);
  send(state.surface, 'pointerdown', { pointerType: 'mouse' });
  send(state.window, 'blur', { target: state.outside });
  state.clock.tick(550);
  assert.equal(state.calls.open.length, 1);
  send(state.window, 'blur', { target: state.surface });
  assert.equal(state.calls.cancel.length, 0);
  send(state.surface, 'pointerup', { pointerType: 'mouse' });
  assert.equal(state.calls.commit.length, 1);
});
