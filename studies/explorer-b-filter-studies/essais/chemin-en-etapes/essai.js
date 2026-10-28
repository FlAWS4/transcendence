// Manifest of the trial « Le chemin en étapes », read by the study's loader (essais/boot.js) before the copy loads, and by
// the gallery (its card). Declare here the files this folder provides: see NOTES.md, « Le chargeur des essais ».
horizonEssais.declare({
 id: 'chemin-en-etapes',
 titre: 'Le chemin en étapes',
 // One line, shown on the gallery card.
 resume: 'Le filtre montre tout le chemin, les étapes encore à choisir en grisé (« Monde › Continent › Pays › Campus », puis « Europe › France › Campus »…) ; largeur fixe, centré sur l’axe ; sur téléphone, l’étape actuelle et la suivante.',
 // true once styles.css exists in this folder: loaded after every stylesheet of the copy.
 styles: true,
 // true once module.mjs exists in this folder: its default export is started with the hook to the pill.
 module: false,
 // Modules of the copy replaced by a copy of the same path in this folder, for example ['scope-pill.mjs'].
 remplace: ['scope-pill.mjs'],
 // Optional views offered first in the gallery's « Page » list, for example
 // [{ libelle: 'Explorer · France', page: 'content-preview.html', route: 'explore?country=FRA', format: 'mobile' }].
 // « Monde » first (the emptiest state of the copy), then the example path of the request, then the phone's short form.
 vues: [
  { libelle: 'Explorer · Monde', page: 'content-preview.html', route: 'explore' },
  { libelle: 'Explorer · 42 Paris', page: 'content-preview.html', route: 'explore?campus=paris' },
  { libelle: 'Explorer · France (téléphone, forme courte)', page: 'content-preview.html', route: 'explore?country=FRA', format: 'mobile' },
 ],
});
