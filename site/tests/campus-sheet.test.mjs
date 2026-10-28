import test from 'node:test';
import assert from 'node:assert/strict';
import {mountCampusSheet} from '../campus-sheet.mjs';

const HEIGHT = '--campus-sheet-drag-height';
function fixture({expanded = false, scrollTop = 0, mobile = true, min = 592, max = 780} = {}) {
 const media = Object.assign(new EventTarget(), {matches: mobile});
 const properties = new Map(), timers = new Map(), captured = new Set();
 let nextTimer = 0;
 const view = Object.assign(new EventTarget(), {
  innerHeight: 800,
  setTimeout(callback) { const id=++nextTimer; timers.set(id,callback); return id; },
  clearTimeout(id) { timers.delete(id); },
  matchMedia(query) { assert.equal(query, '(max-width: 700px)'); return media; },
  getComputedStyle() { return {minHeight: `${min}px`, maxHeight: `${max}px`}; },
 });
 const dialog = Object.assign(new EventTarget(), {
  ownerDocument: {defaultView: view}, dataset: {expanded: String(expanded)}, scrollTop,
  style: {setProperty: (key, value) => properties.set(key, value), removeProperty: key => properties.delete(key)},
  setPointerCapture(id) { captured.add(id); },
  hasPointerCapture(id) { return captured.has(id); },
  releasePointerCapture(id) { captured.delete(id); },
  getBoundingClientRect() { return {height: Number.parseFloat(properties.get(HEIGHT)) || (this.dataset.expanded === 'true' ? max : min)}; },
 });
 const controller = mountCampusSheet({dialog});
 function target(kind = 'content') {
  return {closest(selector) {
   if (selector === '[data-campus-sheet-handle]') return kind === 'handle' ? this : null;
   if (selector === '[data-campus-sheet-swipe]') return kind === 'media' ? this : null;
   if (selector.startsWith('input,')) return ['input','video'].includes(kind) ? this : null;
   return ['a','button','input','media'].includes(kind) ? this : null;
  }};
 }
 function emit(type, {x = 100, y = 400, count = type === 'touchend' || type === 'touchcancel' ? 0 : 1, id = 1, kind = 'content', cancelable = true} = {}) {
  const event = new Event(type, {cancelable});
  Object.defineProperties(event, {
   target: {value: target(kind)},
   touches: {value: Array.from({length: count}, (_, i) => ({identifier: id + i, clientX: x + i, clientY: y}))},
  });
  dialog.dispatchEvent(event);
  return event;
 }
 function input(type, options = {}) {
  const {kind = 'content', cancelable = true, ...fields} = options;
  const event = new Event(type, {cancelable});
  for (const [key,value] of Object.entries({target:target(kind),deltaX:0,deltaY:0,deltaMode:0,ctrlKey:false,pointerId:1,pointerType:'mouse',button:0,isPrimary:true,clientX:100,clientY:400,...fields})) Object.defineProperty(event,key,{value});
  dialog.dispatchEvent(event);return event;
 }
 function flushWheel() { const callbacks=[...timers.values()];timers.clear();callbacks.forEach(callback=>callback()); }
 return {dialog, properties, media, view, emit, input, flushWheel, timers, captured, ...controller};
}
const clean = f => {assert.equal(f.dialog.dataset.dragging, undefined); assert.equal(f.properties.has(HEIGHT), false);};

test('an upward mobile drag follows the finger, stays bounded and expands on release', () => {
 const f = fixture();
 f.emit('touchstart');
 assert.equal(f.emit('touchmove', {y: 350}).defaultPrevented, true);
 assert.equal(f.properties.get(HEIGHT), '642px');
 assert.equal(f.dialog.dataset.dragging, 'true');
 assert.equal(f.dialog.dataset.expanded, 'false');
 f.emit('touchmove', {y: 50});
 assert.equal(f.properties.get(HEIGHT), '780px');
 f.emit('touchend');
 assert.equal(f.dialog.dataset.expanded, 'true');
 clean(f);
 f.destroy();
});

test('a downward drag from the reading start collapses without dismissing the dialog', () => {
 const f = fixture({expanded: true});
 f.emit('touchstart');
 assert.equal(f.emit('touchmove', {y: 470}).defaultPrevented, true);
 assert.equal(f.properties.get(HEIGHT), '710px');
 f.emit('touchend');
 assert.equal(f.dialog.dataset.expanded, 'false');
 clean(f);
 f.destroy();
});

test('reading stays native at full height and reaching the top requires a fresh collapse gesture', () => {
 const f = fixture({expanded: true, scrollTop: 160});
 f.emit('touchstart');
 assert.equal(f.emit('touchmove', {y: 500}).defaultPrevented, false);
 f.dialog.scrollTop = 0;
 assert.equal(f.emit('touchmove', {y: 650}).defaultPrevented, false);
 f.emit('touchend');
 assert.equal(f.dialog.dataset.expanded, 'true');
 clean(f);
 f.emit('touchstart');
 assert.equal(f.emit('touchmove', {y: 450}).defaultPrevented, true);
 f.emit('touchend');
 assert.equal(f.dialog.dataset.expanded, 'false');
 f.destroy();
});

test('the handle collapses from any reading position without resetting the scroll', () => {
 const f = fixture({expanded: true, scrollTop: 500});
 f.emit('touchstart', {kind: 'handle'});
 assert.equal(f.emit('touchmove', {kind: 'handle', y: 470}).defaultPrevented, true);
 f.emit('touchend');
 assert.equal(f.dialog.dataset.expanded, 'false');
 assert.equal(f.dialog.scrollTop, 500);
 f.destroy();
});

test('an upward gesture at full height is native even when reading starts at the top', () => {
 const f = fixture({expanded: true});
 f.emit('touchstart');
 assert.equal(f.emit('touchmove', {y: 300}).defaultPrevented, false);
 f.emit('touchend');
 assert.equal(f.dialog.dataset.expanded, 'true');
 clean(f);
 f.destroy();
});

test('links, photo buttons and fields retain native taps and touch gestures', () => {
 for (const kind of ['a', 'button', 'input']) {
  const f = fixture();
  assert.equal(f.emit('touchstart', {kind}).defaultPrevented, false);
  assert.equal(f.emit('touchmove', {kind, y: 300}).defaultPrevented, false);
  assert.equal(f.emit('touchend', {kind}).defaultPrevented, false);
  assert.equal(f.dialog.dataset.expanded, 'false');
  clean(f);
  f.destroy();
 }
});

test('horizontal and multitouch gestures are never taken over after changing direction', () => {
 const f = fixture();
 f.emit('touchstart');
 assert.equal(f.emit('touchmove', {x: 180, y: 390}).defaultPrevented, false);
 assert.equal(f.emit('touchmove', {x: 180, y: 200}).defaultPrevented, false);
 f.emit('touchend');
 f.emit('touchstart', {count: 2});
 assert.equal(f.emit('touchmove', {y: 200}).defaultPrevented, false);
 f.emit('touchend');
 f.emit('touchstart');
 f.emit('touchmove', {y: 350});
 assert.equal(f.emit('touchmove', {count: 2, y: 320}).defaultPrevented, false);
 assert.equal(f.emit('touchmove', {count: 1, y: 200}).defaultPrevented, false);
 f.emit('touchend');
 assert.equal(f.dialog.dataset.expanded, 'false');
 clean(f);
 f.destroy();
});

test('short or reversed drags snap back to their initial resting height', () => {
 for (const expanded of [false, true]) {
  const f = fixture({expanded});
  f.emit('touchstart');
  f.emit('touchmove', {y: expanded ? 420 : 380});
  f.emit('touchend');
  assert.equal(f.dialog.dataset.expanded, String(expanded));
  f.emit('touchstart');
  f.emit('touchmove', {y: expanded ? 500 : 300});
  f.emit('touchmove', {y: 400});
  f.emit('touchend');
  assert.equal(f.dialog.dataset.expanded, String(expanded));
  clean(f);
  f.destroy();
 }
});

test('cancel, native takeover, resize, close and destroy clear transient heights', () => {
 for (const action of ['cancel', 'native', 'resize', 'close', 'destroy']) {
  const f = fixture();
  f.emit('touchstart');
  f.emit('touchmove', {y: 300});
  if (action === 'cancel') f.emit('touchcancel');
  if (action === 'native') f.emit('touchmove', {y: 280, cancelable: false});
  if (action === 'resize') f.view.dispatchEvent(new Event('resize'));
  if (action === 'close') f.dialog.dispatchEvent(new Event('close'));
  if (action === 'destroy') f.destroy();
  f.emit('touchend');
  assert.equal(f.dialog.dataset.expanded, 'false', action);
  clean(f);
  f.destroy();
 }
});

test('desktop ignores gestures and leaving mobile cleans up expansion and event listeners', () => {
 const f = fixture({expanded: true});
 f.emit('touchstart');
 f.emit('touchmove', {y: 450});
 f.media.matches = false;
 f.media.dispatchEvent(new Event('change'));
 assert.equal(f.dialog.dataset.expanded, 'false');
 clean(f);
 f.emit('touchstart');
 assert.equal(f.emit('touchmove', {y: 300}).defaultPrevented, false);
 f.emit('touchend');
 assert.equal(f.dialog.dataset.expanded, 'false');
 f.destroy();
 f.media.matches = true;
 f.emit('touchstart');
 assert.equal(f.emit('touchmove', {y: 300}).defaultPrevented, false);
 clean(f);
});

test('wheel grows the whole sheet before handing subsequent movement to native reading', () => {
 const f=fixture({scrollTop:200});
 assert.equal(f.input('wheel',{deltaY:80}).defaultPrevented,true);
 assert.equal(f.properties.get(HEIGHT),'672px');
 assert.equal(f.dialog.scrollTop,200);
 assert.equal(f.input('wheel',{deltaY:140}).defaultPrevented,true);
 assert.equal(f.dialog.dataset.expanded,'true');
 clean(f);
 assert.equal(f.input('wheel',{deltaY:80}).defaultPrevented,false);
 f.flushWheel();f.destroy();
});

test('small wheel bursts snap, line/page deltas normalize and native controls keep their behavior', () => {
 const f=fixture();
 f.input('wheel',{deltaY:10});f.flushWheel();
 assert.equal(f.dialog.dataset.expanded,'false');clean(f);
 f.input('wheel',{deltaY:3,deltaMode:1});f.flushWheel();
 assert.equal(f.dialog.dataset.expanded,'true');clean(f);
 f.input('wheel',{deltaY:-1,deltaMode:2});
 assert.equal(f.dialog.dataset.expanded,'false');clean(f);f.flushWheel();
 for(const kind of ['input','video']) {
  assert.equal(f.input('wheel',{deltaY:200,kind}).defaultPrevented,false);
  f.flushWheel();assert.equal(f.dialog.dataset.expanded,'false');
 }
 f.destroy();
});

test('returning to the top within one wheel burst cannot collapse; a fresh burst can', () => {
 const f=fixture({expanded:true,scrollTop:200});
 assert.equal(f.input('wheel',{deltaY:-100}).defaultPrevented,false);
 f.dialog.scrollTop=0;
 assert.equal(f.input('wheel',{deltaY:-100}).defaultPrevented,false);
 assert.equal(f.dialog.dataset.expanded,'true');
 f.flushWheel();
 assert.equal(f.input('wheel',{deltaY:-100}).defaultPrevented,true);
 assert.equal(f.properties.get(HEIGHT),'680px');
 f.flushWheel();assert.equal(f.dialog.dataset.expanded,'false');clean(f);f.destroy();
});

test('horizontal wheel, pinch, non-cancelable and desktop input remain native for their burst', () => {
 for(const options of [{deltaY:40,deltaX:80},{deltaY:80,ctrlKey:true},{deltaY:80,cancelable:false}]) {
  const f=fixture();
  assert.equal(f.input('wheel',options).defaultPrevented,false);
  assert.equal(f.input('wheel',{deltaY:150}).defaultPrevented,false);
  f.flushWheel();assert.equal(f.dialog.dataset.expanded,'false');clean(f);f.destroy();
 }
 const f=fixture({mobile:false});
 assert.equal(f.input('wheel',{deltaY:200}).defaultPrevented,false);clean(f);f.destroy();
});

test('mouse and pen drag only the handle, follow height and release pointer capture', () => {
 for(const pointerType of ['mouse','pen']) {
  const f=fixture();
  assert.equal(f.input('pointerdown',{pointerType}).defaultPrevented,false);
  assert.equal(f.input('pointermove',{clientY:300,pointerType}).defaultPrevented,false);
  assert.equal(f.input('pointerdown',{kind:'handle',pointerType}).defaultPrevented,true);
  assert.equal(f.captured.has(1),true);
  assert.equal(f.input('pointermove',{clientY:300,pointerType}).defaultPrevented,true);
  assert.equal(f.properties.get(HEIGHT),'692px');
  f.input('pointerup',{pointerType});
  assert.equal(f.dialog.dataset.expanded,'true');assert.equal(f.captured.size,0);clean(f);
  f.dialog.scrollTop=200;
  f.input('pointerdown',{kind:'handle',pointerType});f.input('pointermove',{clientY:470,pointerType});f.input('pointerup',{pointerType});
  assert.equal(f.dialog.dataset.expanded,'false');assert.equal(f.dialog.scrollTop,200);f.destroy();
 }
});

test('touch pointer events are ignored to avoid duplicate touch handling, and pointer cancellation snaps back', () => {
 const f=fixture();
 assert.equal(f.input('pointerdown',{kind:'handle',pointerType:'touch'}).defaultPrevented,false);
 f.input('pointermove',{clientY:300,pointerType:'touch'});clean(f);
 f.input('pointerdown',{kind:'handle'});f.input('pointermove',{clientY:300});f.input('pointercancel');
 assert.equal(f.dialog.dataset.expanded,'false');assert.equal(f.captured.size,0);clean(f);f.destroy();
});

test('marked media buttons accept vertical swipes without opening, but taps still activate', () => {
 const f=fixture();
 f.emit('touchstart',{kind:'media'});f.emit('touchend',{kind:'media'});
 assert.equal(f.input('click',{kind:'media'}).defaultPrevented,false);
 f.emit('touchstart',{kind:'media'});
 assert.equal(f.emit('touchmove',{kind:'media',y:300}).defaultPrevented,true);
 f.emit('touchend',{kind:'media'});
 assert.equal(f.dialog.dataset.expanded,'true');
 assert.equal(f.input('click',{kind:'media'}).defaultPrevented,true);
 f.emit('touchstart',{kind:'media'});f.emit('touchend',{kind:'media'});
 assert.equal(f.input('click',{kind:'media'}).defaultPrevented,false);f.destroy();
});

test('wheel timers and pointer capture cannot change the sheet after resize, close or destroy', () => {
 for(const action of ['resize','close','destroy']) {
  const f=fixture();f.input('wheel',{deltaY:80});
  if(action==='resize')f.view.dispatchEvent(new Event('resize'));
  if(action==='close')f.dialog.dispatchEvent(new Event('close'));
  if(action==='destroy')f.destroy();
  assert.equal(f.timers.size,0);f.flushWheel();assert.equal(f.dialog.dataset.expanded,'false');clean(f);f.destroy();
 }
 const f=fixture();f.input('pointerdown',{kind:'handle'});f.input('pointermove',{clientY:300});f.destroy();
 assert.equal(f.captured.size,0);clean(f);
 assert.equal(f.input('wheel',{deltaY:200}).defaultPrevented,false);
});
