import test from 'node:test';
import assert from 'node:assert/strict';
import {openMediaViewer} from '../media-viewer.mjs';

class Element extends EventTarget {
 constructor(tag, doc) {
  super(); this.tagName = tag; this.ownerDocument = doc; this.nodeType = 1;
  this.children = []; this.attributes = {}; this.isConnected = false; this.open = false;
  this.pauseCount = 0; this.loadCount = 0; this.currentTime = 0;
 }
 append(...nodes) { for (const node of nodes) { node.parentElement = this; node.isConnected = this.isConnected; this.children.push(node); } }
 replaceChildren(...nodes) { for (const child of this.children) { child.isConnected = false; child.parentElement = null; } this.children = []; this.append(...nodes); }
 setAttribute(name, value) { this.attributes[name] = String(value); }
 getAttribute(name) { return this.attributes[name] ?? null; }
 removeAttribute(name) { delete this.attributes[name]; if (name === 'src' || name === 'poster') delete this[name]; }
 querySelectorAll(selector) { return descendants(this).slice(1).filter(node => selector.split(',').includes(node.tagName)); }
 contains(node) { return descendants(this).includes(node); }
 closest(selector) { return selector.split(',').map(part => part.trim()).includes(this.tagName) ? this : this.parentElement?.closest(selector); }
 cloneNode(deep) { const clone = new Element(this.tagName, this.ownerDocument); clone.attributes = {...this.attributes}; if (deep) clone.append(...this.children.map(child => child.cloneNode(true))); return clone; }
 showModal() { this.open = true; this.showCount = (this.showCount || 0) + 1; }
 close() { this.open = false; this.ownerDocument.closeEvents.push(() => this.dispatchEvent(new Event('close'))); }
 focus() { this.ownerDocument.activeElement = this; this.focusCount = (this.focusCount || 0) + 1; }
 getBoundingClientRect() { return {left:10,right:310,top:10,bottom:610}; }
 pause() { this.pauseCount++; }
 load() { this.loadCount++; }
 remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.isConnected = false; this.parentElement = null; }
}
const descendants = root => [root,...root.children.flatMap(descendants)];
const byClass = (root, name) => descendants(root).find(node => node.className?.split(' ').includes(name));
const image = suffix => ({type:'image',src:'./' + suffix + '.jpg',alt:'Photo ' + suffix,caption:'Caption ' + suffix});
function fixture() {
 const doc = {baseURI:'https://horizon.example/prototype/',closeEvents:[],createElement(tag) { return new Element(tag, this); }};
 doc.body = doc.createElement('body'); doc.body.isConnected = true;
 const trigger = doc.createElement('button'); doc.body.append(trigger); trigger.focus();
 return {doc,trigger,open(options = {}) { return openMediaViewer({trigger,items:[image('first')],...options}); }};
}
function key(dialog, value, target = dialog) {
 const event = new Event('keydown', {cancelable:true});
 Object.defineProperty(event, 'key', {value});
 Object.defineProperty(event, 'target', {value:target});
 let stopped = false; const original = event.stopPropagation.bind(event);
 event.stopPropagation = () => { stopped = true; original(); };
 dialog.dispatchEvent(event); return {event,stopped};
}

test('module is safe without a document and creates one modal per document only when opened', () => {
 assert.equal(openMediaViewer(), null);
 const {doc,trigger,open} = fixture();
 assert.equal(doc.body.children.length, 1);
 const first = open(), second = open({items:[image('second')]});
 assert.equal(first.element, second.element); assert.equal(doc.body.children.length, 2);
 assert.equal(second.element.showCount, 1); assert.equal(second.element.open, true);
 assert.equal(doc.activeElement, byClass(second.element, 'media-viewer-close'));
 first.close(); assert.equal(second.element.open, true, 'an obsolete handle must not close a new session');
 second.close(); assert.equal(second.element.open, false); assert.equal(doc.activeElement, trigger);
 const other = fixture().open(); assert.notEqual(other.element, second.element); other.close();
});

test('image navigation wraps, clamps the initial position, keeps captions and translates controls', () => {
 for (const [locale,previousLabel,nextLabel] of [['fr','Média précédent','Média suivant'],['en','Previous media','Next media'],['ar','الوسيط السابق','الوسيط التالي']]) {
  const {open} = fixture(), items = [image('one'),image('two'),image('three')];
  const {element:dialog,close} = open({items,index:99,locale});
  assert.equal(dialog.lang, locale); assert.equal(dialog.dir, locale === 'ar' ? 'rtl' : 'ltr');
  assert.equal(byClass(dialog,'media-viewer-count').textContent, new Intl.NumberFormat(locale).format(3) + ' / ' + new Intl.NumberFormat(locale).format(3));
  assert.equal(byClass(dialog,'media-viewer-caption').textContent, 'Caption three');
  assert.equal(byClass(dialog,'media-viewer-previous').getAttribute('aria-label'), previousLabel);
  assert.equal(byClass(dialog,'media-viewer-next').getAttribute('aria-label'), nextLabel);
  byClass(dialog,'media-viewer-next').dispatchEvent(new Event('click'));
  assert.equal(byClass(dialog,'media-viewer-image').src, 'https://horizon.example/prototype/one.jpg');
  byClass(dialog,'media-viewer-previous').dispatchEvent(new Event('click'));
  assert.equal(byClass(dialog,'media-viewer-image').alt, 'Photo three');
  const result = key(dialog, locale === 'ar' ? 'ArrowLeft' : 'ArrowRight');
  assert.equal(result.event.defaultPrevented, true); assert.equal(result.stopped, true);
  assert.equal(byClass(dialog,'media-viewer-image').alt, 'Photo one');
  assert.deepEqual(items.map(item => item.src), ['./one.jpg','./two.jpg','./three.jpg']);
  close();
 }
});

test('Escape and native cancel close only the viewer; queued close cannot destroy a reopened session', () => {
 const {doc,trigger,open} = fixture();
 const campus = doc.createElement('dialog'); doc.body.append(campus); campus.showModal();
 const first = open(); const escaped = key(first.element, 'Escape');
 assert.equal(escaped.event.defaultPrevented, true); assert.equal(escaped.stopped, true);
 assert.equal(first.element.open, false); assert.equal(campus.open, true); assert.equal(doc.activeElement, trigger);
 const reopened = open({items:[image('again')]});
 for (const queued of doc.closeEvents.splice(0)) queued();
 assert.equal(reopened.element.open, true); assert.equal(byClass(reopened.element,'media-viewer-image').alt, 'Photo again');
 const cancel = new Event('cancel', {cancelable:true}); reopened.element.dispatchEvent(cancel);
 assert.equal(cancel.defaultPrevented, true); assert.equal(reopened.element.open, false); assert.equal(campus.open, true);
});

test('backdrop clicks close the viewer while interior whitespace does not, and disconnected triggers are not focused', () => {
 const {trigger,open} = fixture(), {element:dialog} = open();
 const click = (x,y) => { const event = new Event('click'); Object.defineProperties(event,{clientX:{value:x},clientY:{value:y}}); dialog.dispatchEvent(event); };
 click(100,100); assert.equal(dialog.open, true);
 trigger.remove(); const focusCount = trigger.focusCount;
 click(0,0); assert.equal(dialog.open, false); assert.equal(trigger.focusCount, focusCount);
});

test('safe image URLs load; unsafe URLs, HTML strings, unsupported formats and empty items render a translated error', () => {
 const {open} = fixture();
 for (const src of ['javascript:alert(1)','data:image/svg+xml,<svg/>','blob:https://horizon.example/id','file:///tmp/image.jpg','']) {
  const {element:dialog,close} = open({items:[{type:'image',src}],locale:'en'});
  assert.equal(byClass(dialog,'media-viewer-image'), undefined);
  assert.equal(byClass(dialog,'media-viewer-status').textContent, 'This media could not be displayed.'); close();
 }
 for (const items of [[],[{type:'illustration',content:'<svg/>'}],[{type:'iframe',src:'https://example.org/'}]]) {
  const {element:dialog,close} = open({items,locale:'ar'});
  assert.equal(byClass(dialog,'media-viewer-status').textContent, 'تعذّر عرض هذا الوسيط.'); close();
 }
 const {element:dialog,close} = open({items:[image('safe')],index:-4,locale:'unknown'});
 const img = byClass(dialog,'media-viewer-image'); assert.equal(img.src, 'https://horizon.example/prototype/safe.jpg');
 assert.equal(byClass(dialog,'media-viewer-previous').hidden, true); assert.equal(byClass(dialog,'media-viewer-next').hidden, true);
 img.dispatchEvent(new Event('error')); assert.equal(byClass(dialog,'media-viewer-image'), undefined);
 assert.equal(byClass(dialog,'media-viewer-status').hidden, false); close();
});

test('video has native controls without autoplay and releases playback and resources on navigation and close', () => {
 const {open} = fixture();
 const videoItem = {type:'video',src:'/clip.mp4',poster:'/poster.jpg',alt:'Demonstration',caption:'A clip',credit:'Campus'};
 const {element:dialog,close} = open({items:[videoItem,image('next')]});
 const video = byClass(dialog,'media-viewer-video');
 assert.equal(video.src, 'https://horizon.example/clip.mp4'); assert.equal(video.poster, 'https://horizon.example/poster.jpg');
 assert.equal(video.controls, true); assert.equal(video.playsInline, true); assert.equal(video.preload, 'metadata'); assert.equal(video.autoplay, false);
 assert.equal(byClass(dialog,'media-viewer-credit').textContent, 'Campus');
 video.dispatchEvent(new Event('loadedmetadata')); assert.equal(byClass(dialog,'media-viewer-status').hidden, true);
 const arrow = key(dialog,'ArrowRight',video); assert.equal(arrow.event.defaultPrevented, false);
 assert.equal(byClass(dialog,'media-viewer-video'), video, 'video controls retain native seeking');
 video.currentTime = 12;
 byClass(dialog,'media-viewer-next').dispatchEvent(new Event('click'));
 assert.equal(video.pauseCount, 1); assert.equal(video.currentTime, 0); assert.equal(video.src, undefined); assert.equal(video.poster, undefined); assert.equal(video.loadCount, 1);
 video.dispatchEvent(new Event('error')); assert.equal(byClass(dialog,'media-viewer-image').alt, 'Photo next', 'late resource events are ignored');
 byClass(dialog,'media-viewer-previous').dispatchEvent(new Event('click'));
 const reopenedVideo = byClass(dialog,'media-viewer-video'); reopenedVideo.currentTime = 5; close();
 assert.equal(reopenedVideo.pauseCount, 1); assert.equal(reopenedVideo.currentTime, 0); assert.equal(reopenedVideo.src, undefined); assert.equal(reopenedVideo.loadCount, 1);
 assert.equal(byClass(dialog,'media-viewer-content').children.length, 0);
});

test('illustration DOM is cloned and contained without altering the original or accepting markup strings', () => {
 const {doc,open} = fixture(); const source = doc.createElement('div'), svg = doc.createElement('svg');
 svg.setAttribute('preserveAspectRatio','xMidYMid slice'); source.append(svg);
 const {element:dialog,close} = open({items:[{type:'illustration',content:source,alt:'Project illustration',caption:'Project'}]});
 const frame = byClass(dialog,'media-viewer-illustration');
 assert.equal(frame.getAttribute('role'),'img'); assert.equal(frame.getAttribute('aria-label'),'Project illustration');
 assert.notEqual(frame.children[0],source); assert.equal(frame.children[0].getAttribute('aria-hidden'),'true');
 assert.equal(frame.querySelectorAll('svg')[0].getAttribute('preserveAspectRatio'),'xMidYMid meet');
 assert.equal(svg.getAttribute('preserveAspectRatio'),'xMidYMid slice'); close();
});
