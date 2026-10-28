const MOBILE_QUERY = '(max-width: 700px)';
const DRAG_HEIGHT = '--campus-sheet-drag-height';
const HANDLE = '[data-campus-sheet-handle]';
const INTERACTIVE = 'a, button, input, select, textarea, summary, [role="button"], [role="slider"], [contenteditable]:not([contenteditable="false"])';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** The dialog is the native vertical scroller. A fresh downward gesture may
 * collapse it only when reading starts at the top; the handle is always usable.
 * CSS owns the two resting heights and the snap animation. */
export function mountCampusSheet({dialog}) {
 const view = dialog?.ownerDocument?.defaultView;
 if (!dialog?.addEventListener || !view?.matchMedia) return {destroy() {}};
 const mobile = view.matchMedia(MOBILE_QUERY);
 let gesture = null;
 let destroyed = false;

 function clearGesture() {
  gesture = null;
  delete dialog.dataset.dragging;
  dialog.style.removeProperty(DRAG_HEIGHT);
 }

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

 function start(event) {
  clearGesture();
  if (destroyed || !mobile.matches || event.touches.length !== 1) return;
  const target = event.target?.closest ? event.target : event.target?.parentElement;
  if (target?.closest?.(INTERACTIVE)) return;
  const handle = target?.closest?.(HANDLE);
  const expanded = dialog.dataset.expanded === 'true';
  // Do not seize a native scroll midway, even if it reaches scrollTop 0 later.
  if (expanded && !handle && dialog.scrollTop > 1) return;
  const touch = event.touches[0];
  const {min, max} = bounds();
  if (max - min < 1) return;
  gesture = {
   id: touch.identifier, x: touch.clientX, y: touch.clientY,
   min, max, expanded, active: false, delta: 0,
   height: clamp(dialog.getBoundingClientRect().height, min, max),
  };
 }

 function move(event) {
  if (!gesture) return;
  const touch = event.touches[0];
  if (!mobile.matches || event.touches.length !== 1 || touch.identifier !== gesture.id || !event.cancelable) {
   clearGesture();
   return;
  }
  const dx = touch.clientX - gesture.x;
  const dy = touch.clientY - gesture.y;
  if (!gesture.active) {
   if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
   // A horizontal gesture stays native for its entire lifetime.
   if (Math.abs(dx) >= Math.abs(dy) || (gesture.expanded ? dy <= 0 : dy >= 0)) {
    clearGesture();
    return;
   }
   gesture.active = true;
   dialog.dataset.dragging = 'true';
  }
  event.preventDefault();
  gesture.delta = -dy;
  dialog.style.setProperty(DRAG_HEIGHT, `${clamp(gesture.height - dy, gesture.min, gesture.max)}px`);
 }

 function end(event) {
  if (!gesture) return;
  if (event.touches.length) {
   clearGesture();
   return;
  }
  if (gesture.active) {
   const threshold = Math.min(48, (gesture.max - gesture.min) * .2);
   const distance = gesture.expanded ? -gesture.delta : gesture.delta;
   dialog.dataset.expanded = String(distance >= threshold ? !gesture.expanded : gesture.expanded);
  }
  clearGesture();
 }

 function viewportChanged() {
  clearGesture();
  if (!mobile.matches) dialog.dataset.expanded = 'false';
 }

 const passive = {passive: true};
 const blocking = {passive: false};
 dialog.addEventListener('touchstart', start, passive);
 dialog.addEventListener('touchmove', move, blocking);
 dialog.addEventListener('touchend', end, passive);
 dialog.addEventListener('touchcancel', clearGesture, passive);
 dialog.addEventListener('close', clearGesture);
 view.addEventListener('resize', viewportChanged);
 if (mobile.addEventListener) mobile.addEventListener('change', viewportChanged);
 else mobile.addListener?.(viewportChanged);

 return {destroy() {
  if (destroyed) return;
  destroyed = true;
  clearGesture();
  dialog.removeEventListener('touchstart', start, passive);
  dialog.removeEventListener('touchmove', move, blocking);
  dialog.removeEventListener('touchend', end, passive);
  dialog.removeEventListener('touchcancel', clearGesture, passive);
  dialog.removeEventListener('close', clearGesture);
  view.removeEventListener('resize', viewportChanged);
  if (mobile.removeEventListener) mobile.removeEventListener('change', viewportChanged);
  else mobile.removeListener?.(viewportChanged);
 }};
}
