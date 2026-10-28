/**
 * Raccourci facultatif par appui prolongé : les boutons accessibles restent
 * fournis par l'interface. Avant reconnaissance, aucun geste n'est capturé.
 * Toutes les coordonnées des callbacks sont relatives au viewport.
 * onCancel ne concerne qu'un appui déjà ouvert, jamais une rotation ordinaire.
 */
export function attachPressGesture({
  surface,
  onOpen = () => {},
  onMove = () => {},
  onCommit = () => {},
  onCancel = () => {},
  canStart = () => true,
  delay = 550,
  slop = 10,
} = {}) {
  if (!surface?.addEventListener) throw new TypeError('A pointer surface is required.');
  const document = surface.ownerDocument ?? surface;
  const window = document.defaultView;
  const options = { capture: true, passive: false };
  const listeners = [];
  const pointers = new Set();
  const wait = Number.isFinite(delay) && delay >= 0 ? delay : 550;
  const tolerance = Number.isFinite(slop) && slop >= 0 ? slop : 10;
  let gesture = null;
  let timer = null;
  let suppression = null;
  let suppressionTimer = null;
  let destroyed = false;

  function listen(target, name, callback) {
    if (!target?.addEventListener) return;
    target.addEventListener(name, callback, options);
    listeners.push(() => target.removeEventListener(name, callback, options));
  }

  function point(value) {
    return { x: value.x, y: value.y, pointerId: value.id, pointerType: value.type };
  }

  function consume(event) {
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
  }

  function clearTimer() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function clearSuppression() {
    if (suppressionTimer !== null) clearTimeout(suppressionTimer);
    suppressionTimer = null;
    suppression = null;
  }

  function suppressNextClick(value) {
    clearSuppression();
    suppression = point(value);
    // Une nouvelle pression efface aussi ce garde-fou, même au même endroit.
    suppressionTimer = setTimeout(clearSuppression, 800);
  }

  function release(value) {
    if (!value.captured) return;
    try {
      surface.releasePointerCapture?.(value.id);
    } catch {
      // Le navigateur peut déjà avoir libéré le pointeur (annulation/onglet).
    }
  }

  function cancel(reason = 'cancel') {
    const previous = gesture;
    gesture = null;
    clearTimer();
    if (!previous) return;
    if (previous.opened) suppressNextClick(previous);
    release(previous);
    if (previous.opened) onCancel({ ...point(previous), reason });
  }

  function observeDown(event) {
    if (destroyed) return;
    clearSuppression();
    pointers.add(event.pointerId);
    if (gesture && event.pointerId !== gesture.id) cancel('multiple-pointers');
  }

  function start(event) {
    if (destroyed || gesture || pointers.size > 1 || event.isPrimary === false
      || event.button !== 0 || !canStart(event)) return;
    const next = {
      id: event.pointerId,
      type: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      opened: false,
      captured: false,
    };
    gesture = next;
    timer = setTimeout(() => {
      timer = null;
      if (destroyed || gesture !== next) return;
      // La rubrique ou la disponibilité du globe peut changer pendant l'attente.
      if (!canStart(event)) return cancel('unavailable');
      next.opened = true;
      onOpen(point(next));
      if (destroyed || gesture !== next) return;
      try {
        surface.setPointerCapture?.(next.id);
        next.captured = typeof surface.setPointerCapture === 'function';
      } catch {
        // Les listeners document conservent la fin du geste hors de la surface.
      }
    }, wait);
  }

  function move(event) {
    const current = gesture;
    if (!current || event.pointerId !== current.id) return;
    current.x = event.clientX;
    current.y = event.clientY;
    if (!current.opened) {
      if (Math.hypot(current.x - current.startX, current.y - current.startY) > tolerance) {
        cancel('movement');
      }
      return;
    }
    consume(event);
    onMove(point(current));
  }

  function finish(event) {
    pointers.delete(event.pointerId);
    const current = gesture;
    if (!current || event.pointerId !== current.id) return;
    current.x = event.clientX;
    current.y = event.clientY;
    if (!current.opened) return cancel('short-press');
    consume(event);
    gesture = null;
    clearTimer();
    suppressNextClick(current);
    release(current);
    onCommit(point(current));
  }

  function pointerCancel(event) {
    pointers.delete(event.pointerId);
    if (gesture?.id === event.pointerId) cancel('pointercancel');
  }

  function lostCapture(event) {
    if (gesture?.opened && gesture.id === event.pointerId) cancel('lostcapture');
  }

  function suppressionMatches(event, value) {
    if (!value) return false;
    if (typeof event.pointerId === 'number' && event.pointerId >= 0 && event.pointerType) {
      return event.pointerId === value.pointerId;
    }
    return Math.hypot(event.clientX - value.x, event.clientY - value.y) <= 24;
  }

  function click(event) {
    // detail=0 est l'activation clavier/assistive : ne jamais la neutraliser.
    if (event.detail === 0 || !suppressionMatches(event, suppression)) return;
    consume(event);
    clearSuppression();
  }

  function contextMenu(event) {
    const held = gesture?.opened ? point(gesture) : null;
    if (suppressionMatches(event, held) || suppressionMatches(event, suppression)) consume(event);
  }

  function leave(reason) {
    pointers.clear();
    cancel(reason);
  }

  function keydown(event) {
    if (event.key !== 'Escape' || !gesture) return;
    if (gesture.opened) consume(event);
    cancel('escape');
  }

  // Le suivi global détecte aussi le second doigt qui touche hors du globe.
  listen(document, 'pointerdown', observeDown);
  listen(surface, 'pointerdown', start);
  listen(document, 'pointermove', move);
  listen(document, 'pointerup', finish);
  listen(document, 'pointercancel', pointerCancel);
  listen(document, 'lostpointercapture', lostCapture);
  listen(document, 'wheel', () => cancel('wheel'));
  listen(document, 'keydown', keydown);
  listen(document, 'click', click);
  listen(document, 'contextmenu', contextMenu);
  listen(document, 'visibilitychange', () => {
    if (document.visibilityState === 'hidden') leave('hidden');
  });
  listen(window, 'blur', event => {
    // En capture, window reçoit aussi le blur des éléments : cliquer le globe
    // depuis une commande focalisée ne signifie pas quitter la fenêtre.
    if (event.target === window) leave('blur');
  });

  return {
    cancel,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancel('destroy');
      clearSuppression();
      pointers.clear();
      for (const remove of listeners) remove();
      listeners.length = 0;
    },
  };
}
