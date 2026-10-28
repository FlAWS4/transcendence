// Manifest of the trial « Seulement centrer le texte », read by the study's loader (essais/boot.js) before the copy loads, and by
// the gallery (its card). Declare here the files this folder provides: see NOTES.md, « Le chargeur des essais ».
horizonEssais.declare({
 id: 'texte-centre',
 titre: 'Seulement centrer le texte',
 // One line, shown on the gallery card.
 resume: 'Même largeur fixe qu’aujourd’hui : seul le texte est centré dans le filtre, et le filtre sur l’axe de la page, le bouton ← à une place fixe.',
 // true once styles.css exists in this folder: loaded after every stylesheet of the copy.
 styles: true,
 // true once module.mjs exists in this folder: its default export is started with the hook to the pill.
 module: false,
 // Modules of the copy replaced by a copy of the same path in this folder, for example ['scope-pill.mjs'].
 remplace: [],
 // Optional views offered first in the gallery's « Page » list, for example
 // [{ libelle: 'Explorer · France', page: 'content-preview.html', route: 'explore?country=FRA', format: 'mobile' }].
 // « Monde » stays the comparison's first view (the emptiest state). 42 Paris shows a campus after its country, centred;
 // the gallery's own campus view, 42 Abu Dhabi, is the longest indication, which starts after the globe in this trial.
 vues: [
  { libelle: 'Explorer · Monde', page: 'content-preview.html', route: 'explore' },
  { libelle: 'Explorer · 42 Paris', page: 'content-preview.html', route: 'explore?campus=paris' },
 ],
});
