// Manifest of the trial « Un filtre plus court », read by the study's loader (essais/boot.js) before the copy loads, and by
// the gallery (its card). Declare here the files this folder provides: see NOTES.md, « Le chargeur des essais ».
horizonEssais.declare({
 id: 'filtre-plus-court',
 titre: 'Un filtre plus court',
 // One line, shown on the gallery card.
 resume: 'Le filtre ne montre que le lieu choisi, centré, à la largeur du plus long nom ; au niveau campus, le pays passe sur la ligne sous le filtre, d’où il ramène toujours au pays.',
 // true once styles.css exists in this folder: loaded after every stylesheet of the copy.
 styles: true,
 // true once module.mjs exists in this folder: its default export is started with the hook to the pill.
 module: false,
 // Modules of the copy replaced by a copy of the same path in this folder, for example ['scope-pill.mjs'].
 remplace: ['scope-pill.mjs'],
 // Optional views offered first in the gallery's « Page » list, for example
 // [{ libelle: 'Explorer · France', page: 'content-preview.html', route: 'explore?country=FRA', format: 'mobile' }].
 vues: [
  { libelle: 'Explorer · Monde', page: 'content-preview.html', route: 'explore' },
  { libelle: 'Explorer · 42 Paris (le pays sous le filtre)', page: 'content-preview.html', route: 'explore?campus=paris' },
 ],
});
