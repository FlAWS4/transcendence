// Trial awards-a-venir: one localised note appended to #main; essai.css shows it only on the Awards section.
// The Arabic wording reuses the dock's own name for the page (جوائز 42); the icon is the dock's #i-awards symbol.
const COPY = Object.freeze({
 fr: 'Les 42 Awards arrivent bientôt.',
 en: '42 Awards are coming soon.',
 ar: 'جوائز 42 قادمة قريبًا.',
});

export default function install({root}) {
 const main = document.getElementById('main');
 if (!main || main.querySelector(':scope > .essai-awards-a-venir')) return;
 const note = document.createElement('div');
 note.className = 'essai-awards-a-venir';
 note.innerHTML = '<svg aria-hidden="true"><use href="#i-awards"/></svg><p></p>';
 const text = note.querySelector('p');
 const sync = () => {
  const lang = Object.hasOwn(COPY, root.lang) ? root.lang : 'fr';
  if (text.lang === lang) return;
  text.textContent = COPY[lang];
  text.lang = lang;
  text.dir = lang === 'ar' ? 'rtl' : 'ltr';
 };
 sync();
 main.append(note);
 // The baseline switches language on <html lang>; theme changes only swap the tokens used in essai.css.
 new MutationObserver(sync).observe(root, {attributes: true, attributeFilter: ['lang']});
 // Put the note back if a baseline render ever replaces the children of #main.
 new MutationObserver(() => { if (!note.isConnected) main.append(note); }).observe(main, {childList: true});
}
