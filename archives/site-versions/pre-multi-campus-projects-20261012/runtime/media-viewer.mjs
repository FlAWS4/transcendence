const viewers = new WeakMap();
const copy = {
 fr: {title:'Médias',close:'Fermer le média',previous:'Média précédent',next:'Média suivant',loading:'Chargement du média…',error:'Ce média ne peut pas être affiché.'},
 en: {title:'Media',close:'Close media',previous:'Previous media',next:'Next media',loading:'Loading media…',error:'This media could not be displayed.'},
 ar: {title:'الوسائط',close:'إغلاق الوسائط',previous:'الوسيط السابق',next:'الوسيط التالي',loading:'جارٍ تحميل الوسائط…',error:'تعذّر عرض هذا الوسيط.'},
};
const text = value => typeof value === 'string' ? value : '';
function mediaURL(value, doc) {
 if (!text(value).trim()) return null;
 try {
  const url = new URL(value, doc.baseURI);
  return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
 } catch { return null; }
}

function createViewer(doc) {
 const node = (tag, className) => {
  const element = doc.createElement(tag);
  if (className) element.className = className;
  return element;
 };
 const dialog = node('dialog', 'media-viewer');
 const header = node('header', 'media-viewer-header');
 const title = node('h2', 'media-viewer-title');
 const closeButton = node('button', 'media-viewer-close');
 closeButton.type = 'button'; closeButton.textContent = '×'; closeButton.autofocus = true;
 header.append(title, closeButton);
 const stage = node('div', 'media-viewer-stage');
 const status = node('p', 'media-viewer-status'); status.setAttribute('role', 'status');
 const content = node('div', 'media-viewer-content'); stage.append(content, status);
 const footer = node('footer', 'media-viewer-footer');
 const caption = node('p', 'media-viewer-caption'); caption.dir = 'auto';
 const credit = node('p', 'media-viewer-credit'); credit.dir = 'auto';
 const navigation = node('div', 'media-viewer-navigation');
 const previous = node('button', 'media-viewer-previous'); previous.type = 'button'; previous.textContent = '‹';
 const count = node('p', 'media-viewer-count'); count.dir = 'ltr'; count.setAttribute('aria-live', 'polite'); count.setAttribute('aria-atomic', 'true');
 const next = node('button', 'media-viewer-next'); next.type = 'button'; next.textContent = '›';
 navigation.append(previous, count, next); footer.append(caption, credit, navigation);
 dialog.append(header, stage, footer); doc.body.append(dialog);
 let session = null;
 let disposeMedia = () => {};
 let mediaGeneration = 0;

 function clearMedia() {
  mediaGeneration++;
  disposeMedia(); disposeMedia = () => {};
  content.replaceChildren(); status.hidden = true;
 }
 function release() {
  if (!session) return;
  const trigger = session.trigger;
  session = null;
  clearMedia(); caption.textContent = ''; credit.textContent = ''; count.textContent = '';
  if (trigger?.isConnected && typeof trigger.focus === 'function') trigger.focus({preventScroll:true});
 }
 function close() {
  if (dialog.open) dialog.close();
  release();
 }
 function render() {
  clearMedia();
  const {items,index,locale} = session;
  const words = copy[locale];
  const item = items[index];
  const generation = mediaGeneration;
  const number = new Intl.NumberFormat(locale);
  count.textContent = `${number.format(items.length ? index + 1 : 0)} / ${number.format(items.length)}`;
  previous.hidden = next.hidden = items.length < 2;
  caption.textContent = text(item?.caption); caption.hidden = !caption.textContent;
  credit.textContent = text(item?.credit); credit.hidden = !credit.textContent;
  const failed = () => {
   if (generation !== mediaGeneration || !session) return;
   clearMedia(); status.textContent = words.error; status.hidden = false;
  };
  const ready = () => {
   if (generation === mediaGeneration && session) status.hidden = true;
  };
  if (!item || !['image','video','illustration'].includes(item.type)) { failed(); return; }
  if (item.type === 'illustration') {
   // The caller supplies trusted, locally generated DOM, never HTML strings.
   if (item.content?.nodeType !== 1 || typeof item.content.cloneNode !== 'function') { failed(); return; }
   const frame = node('div', 'media-viewer-illustration');
   frame.setAttribute('role', 'img'); frame.setAttribute('aria-label', text(item.alt) || text(item.caption) || words.title);
   const clone = item.content.cloneNode(true);
   clone.setAttribute('aria-hidden', 'true'); clone.inert = true;
   const vectors = [...clone.querySelectorAll('svg')];
   if (clone.tagName?.toLowerCase() === 'svg') vectors.unshift(clone);
   for (const svg of vectors) svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
   frame.append(clone); content.append(frame); return;
  }
  const src = mediaURL(item.src, doc);
  if (!src) { failed(); return; }
  const media = node(item.type === 'video' ? 'video' : 'img', 'media-viewer-' + item.type);
  const readyEvent = item.type === 'video' ? 'loadedmetadata' : 'load';
  media.addEventListener('error', failed); media.addEventListener(readyEvent, ready);
  status.textContent = words.loading; status.hidden = false;
  disposeMedia = () => {
   media.removeEventListener('error', failed); media.removeEventListener(readyEvent, ready);
   if (item.type === 'video') {
    media.pause();
    try { media.currentTime = 0; } catch { /* An uninitialised resource cannot seek. */ }
    media.removeAttribute('src'); media.removeAttribute('poster');
    for (const source of media.querySelectorAll('source')) source.remove();
    media.load();
   } else media.removeAttribute('src');
  };
  if (item.type === 'video') {
   media.controls = true; media.playsInline = true; media.preload = 'metadata'; media.autoplay = false;
   media.setAttribute('aria-label', text(item.alt) || text(item.caption) || words.title);
   const poster = mediaURL(item.poster, doc); if (poster) media.poster = poster;
  } else {
   media.alt = text(item.alt); media.decoding = 'async';
  }
  content.append(media); media.src = src;
 }
 function step(delta) {
  if (!session || session.items.length < 2) return;
  session.index = (session.index + delta + session.items.length) % session.items.length;
  render();
 }
 closeButton.addEventListener('click', close);
 previous.addEventListener('click', () => step(-1)); next.addEventListener('click', () => step(1));
 dialog.addEventListener('keydown', event => {
  if (!session) return;
  if (event.key === 'Escape') {
   event.preventDefault(); event.stopPropagation(); close(); return;
  }
  // Keep native video seeking/volume and any text inputs under their own control.
  if (event.target?.closest?.('video, input, textarea, select, [contenteditable]')) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault(); event.stopPropagation();
  step((event.key === 'ArrowRight' ? 1 : -1) * (session.locale === 'ar' ? -1 : 1));
 }, true);
 dialog.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); close(); });
 dialog.addEventListener('close', () => { if (!dialog.open) release(); });
 dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
 });
 return {
  open({items,index,locale,trigger}) {
   const words = copy[locale];
   const active = doc.activeElement;
   const previousTrigger = session?.trigger;
   clearMedia();
   session = {items,index,locale,trigger:trigger || (dialog.contains(active) ? previousTrigger : active)};
   const opened = session;
   dialog.lang = locale; dialog.dir = locale === 'ar' ? 'rtl' : 'ltr';
   dialog.setAttribute('aria-label', words.title); title.textContent = words.title;
   for (const [button,label] of [[closeButton,words.close],[previous,words.previous],[next,words.next]]) {
    button.setAttribute('aria-label', label); button.title = label;
   }
   render();
   if (!dialog.open) dialog.showModal();
   closeButton.focus({preventScroll:true});
   return {element:dialog,close() { if (session === opened) close(); }};
  },
 };
}

/** Open one shared modal per document. Pass already-localized text and a trigger
 * for focus restoration. A returned close handle only affects its own session. */
export function openMediaViewer({items = [],index = 0,locale = 'fr',trigger} = {}) {
 const entries = Array.isArray(items) ? items.slice() : [];
 const doc = trigger?.ownerDocument || entries.find(item => item?.content?.ownerDocument)?.content.ownerDocument || globalThis.document;
 if (!doc?.body || !doc.createElement) return null;
 const language = Object.hasOwn(copy, locale) ? locale : 'fr';
 const current = Number.isFinite(index) ? Math.max(0, Math.min(Math.trunc(index), Math.max(0, entries.length - 1))) : 0;
 let viewer = viewers.get(doc);
 if (!viewer) { viewer = createViewer(doc); viewers.set(doc, viewer); }
 return viewer.open({items:entries,index:current,locale:language,trigger});
}
