const MOBILE_QUERY = '(max-width: 700px)';
const DRAG_HEIGHT = '--campus-sheet-drag-height';
const HANDLE = '[data-campus-sheet-handle]';
const SWIPE_MEDIA = '[data-campus-sheet-swipe]';
const INTERACTIVE = 'a, button, input, select, textarea, summary, [role="button"], [role="slider"], [contenteditable]:not([contenteditable="false"])';
const NATIVE_WHEEL = 'input, select, textarea, video, [role="slider"], [contenteditable]:not([contenteditable="false"])';
const WHEEL_IDLE = 180;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** The dialog is the native vertical scroller. A fresh downward gesture may
 * collapse it only when reading starts at the top; the handle is always usable.
 * CSS owns the two resting heights and the snap animation. */
export function mountCampusSheet({dialog}) {
 const view = dialog?.ownerDocument?.defaultView;
 if (!dialog?.addEventListener || !view?.matchMedia) return {destroy() {}};
 const mobile = view.matchMedia(MOBILE_QUERY);
 let gesture = null, wheelGesture = null, wheelTimer = null;
 let destroyed = false, suppressMediaClickUntil = 0;
 const targetOf = event => event.target?.closest ? event.target : event.target?.parentElement;
 const later = view.setTimeout?.bind(view) || setTimeout;
 const cancelLater = view.clearTimeout?.bind(view) || clearTimeout;

 function clearHeight() {
  delete dialog.dataset.dragging;
  dialog.style.removeProperty(DRAG_HEIGHT);
 }
 function clearGesture() {
  const pointer = gesture?.pointerId;
  gesture = null;
  if (pointer != null && dialog.hasPointerCapture?.(pointer)) dialog.releasePointerCapture(pointer);
  clearHeight();
 }
 function clearWheel() {
  if (wheelTimer != null) cancelLater(wheelTimer);
  wheelTimer = null; wheelGesture = null;
  clearHeight();
 }
 function cancelInteraction() { clearGesture(); clearWheel(); }

 function bounds() {
  const style = view.getComputedStyle(dialog);
  // Browsers resolve viewport lengths to px. The viewport fallback also makes
  // the controller safe if it is mounted before its stylesheet has arrived.
  const viewport = view.innerHeight || dialog.getBoundingClientRect().height;
  const readPixels = value => /^\d+(?:\.\d+)?px$/.test(value) ? Number.parseFloat(value) : NaN;
  const computedMax = readPixels(style.maxHeight);
  const max = Number.isFinite(computedMax) ? computedMax : Math.max(0, viewport - 20);
  const computedMin = readPixels(style.minHeight);
  const min = Number.isFinite(computedMin) && computedMin > 0 ? Math.min(computedMin, max) : Math.min(viewport * .74, max);
  return {min, max};
 }
 function initialGesture(target, x, y) {
  const handle = target?.closest?.(HANDLE);
  const expanded = dialog.dataset.expanded === 'true';
  // Never seize reading midway, even if the same gesture reaches scrollTop 0.
  if (expanded && !handle && dialog.scrollTop > 1) return null;
  const {min, max} = bounds();
  if (max - min < 1) return null;
  return {x, y, min, max, expanded, active: false, delta: 0,
   media: Boolean(target?.closest?.(SWIPE_MEDIA)),
   height: clamp(dialog.getBoundingClientRect().height, min, max)};
 }
 function moveGesture(event, x, y) {
  const dx = x - gesture.x, dy = y - gesture.y;
  if (!gesture.active) {
   if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
   if (Math.abs(dx) >= Math.abs(dy) || (gesture.expanded ? dy <= 0 : dy >= 0)) {
    clearGesture(); return;
   }
   gesture.active = true;
   dialog.dataset.dragging = 'true';
  }
  event.preventDefault();
  gesture.delta = -dy;
  dialog.style.setProperty(DRAG_HEIGHT, `${clamp(gesture.height - dy, gesture.min, gesture.max)}px`);
 }
 function settle(state) {
  const threshold = Math.min(48, (state.max - state.min) * .2);
  const distance = state.expanded ? -state.delta : state.delta;
  dialog.dataset.expanded = String(distance >= threshold ? !state.expanded : state.expanded);
 }
 function finishGesture() {
  if (gesture?.active) {
   settle(gesture);
   if (gesture.media) suppressMediaClickUntil = Date.now() + 600;
  }
  clearGesture();
 }

 function start(event) {
  cancelInteraction(); suppressMediaClickUntil = 0;
  if (destroyed || !mobile.matches || event.touches.length !== 1) return;
  const target = targetOf(event);
  if (target?.closest?.(INTERACTIVE) && !target.closest(SWIPE_MEDIA)) return;
  const touch = event.touches[0];
  gesture = initialGesture(target, touch.clientX, touch.clientY);
  if (gesture) gesture.id = touch.identifier;
 }
 function move(event) {
  if (!gesture || gesture.pointerId != null) return;
  const touch = event.touches[0];
  if (!mobile.matches || event.touches.length !== 1 || touch.identifier !== gesture.id || !event.cancelable) {
   clearGesture(); return;
  }
  moveGesture(event, touch.clientX, touch.clientY);
 }
 function end(event) {
  if (!gesture || gesture.pointerId != null) return;
  if (event.touches.length) { clearGesture(); return; }
  finishGesture();
 }
 function preventDraggedMediaClick(event) {
  if (Date.now() > suppressMediaClickUntil || !targetOf(event)?.closest?.(SWIPE_MEDIA)) return;
  suppressMediaClickUntil = 0;
  event.preventDefault(); event.stopPropagation();
 }

 function pointerStart(event) {
  // Touch has its own path so native reading and pinch gestures stay available.
  if (event.pointerType === 'touch' || event.isPrimary === false || event.button !== 0 ||
      destroyed || !mobile.matches || !targetOf(event)?.closest?.(HANDLE)) return;
  cancelInteraction();
  gesture = initialGesture(targetOf(event), event.clientX, event.clientY);
  if (!gesture) return;
  gesture.pointerId = event.pointerId;
  dialog.setPointerCapture?.(event.pointerId);
  event.preventDefault();
 }
 function pointerMove(event) {
  if (!gesture || gesture.pointerId !== event.pointerId) return;
  if (!mobile.matches || !event.cancelable) { clearGesture(); return; }
  moveGesture(event, event.clientX, event.clientY);
 }
 function pointerEnd(event) {
  if (gesture?.pointerId === event.pointerId) finishGesture();
 }
 function pointerCancel(event) {
  if (gesture?.pointerId === event.pointerId) clearGesture();
 }

 function wheel(event) {
  if (destroyed || !mobile.matches || gesture) return;
  // A burst is classified once: returning to the top while reading must not
  // collapse the sheet until the user starts a new wheel/trackpad gesture.
  if (wheelTimer != null) cancelLater(wheelTimer);
  if (!wheelGesture) {
   const expanded = dialog.dataset.expanded === 'true';
   const native = event.ctrlKey || !event.cancelable || Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
    targetOf(event)?.closest?.(NATIVE_WHEEL) || (expanded ? event.deltaY >= 0 || dialog.scrollTop > 1 : event.deltaY <= 0);
   const {min, max} = bounds();
   wheelGesture = {native: Boolean(native || max - min < 1), expanded, min, max, delta: 0,
    height: clamp(dialog.getBoundingClientRect().height, min, max)};
  }
  wheelTimer = later(() => {
   if (wheelGesture && !wheelGesture.native) settle(wheelGesture);
   clearWheel();
  }, WHEEL_IDLE);
  if (wheelGesture.native) return;
  if (event.ctrlKey || !event.cancelable || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
   wheelGesture.native = true; clearHeight(); return;
  }
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? dialog.clientHeight || view.innerHeight : 1;
  wheelGesture.delta += event.deltaY * unit;
  const height = clamp(wheelGesture.height + wheelGesture.delta, wheelGesture.min, wheelGesture.max);
  event.preventDefault(); dialog.dataset.dragging = 'true';
  dialog.style.setProperty(DRAG_HEIGHT, `${height}px`);
  if ((!wheelGesture.expanded && height === wheelGesture.max) || (wheelGesture.expanded && height === wheelGesture.min)) {
   dialog.dataset.expanded = String(!wheelGesture.expanded);
   wheelGesture.native = true; clearHeight();
  }
 }

 function viewportChanged() {
  cancelInteraction();
  if (!mobile.matches) dialog.dataset.expanded = 'false';
 }
 const passive = {passive: true}, blocking = {passive: false};
 const listeners = [
  ['touchstart', start, passive], ['touchmove', move, blocking], ['touchend', end, passive],
  ['touchcancel', clearGesture, passive], ['pointerdown', pointerStart, blocking],
  ['pointermove', pointerMove, blocking], ['pointerup', pointerEnd, passive],
  ['pointercancel', pointerCancel, passive], ['lostpointercapture', pointerCancel, passive],
  ['wheel', wheel, blocking], ['click', preventDraggedMediaClick, true], ['close', cancelInteraction],
 ];
 for (const args of listeners) dialog.addEventListener(...args);
 view.addEventListener('resize', viewportChanged);
 if (mobile.addEventListener) mobile.addEventListener('change', viewportChanged);
 else mobile.addListener?.(viewportChanged);

 return {destroy() {
  if (destroyed) return;
  destroyed = true; cancelInteraction(); suppressMediaClickUntil = 0;
  for (const args of listeners) dialog.removeEventListener(...args);
  view.removeEventListener('resize', viewportChanged);
  if (mobile.removeEventListener) mobile.removeEventListener('change', viewportChanged);
  else mobile.removeListener?.(viewportChanged);
 }};
}
