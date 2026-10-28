// Manifest of the trial « Les chiffres dans le filtre », read by the study's loader (essais/boot.js) before the copy loads, and by
// the gallery (its card). Declare here the files this folder provides: see NOTES.md, « Le chargeur des essais ».
horizonEssais.declare({
 id: 'chiffres-dans-le-filtre',
 titre: 'Les chiffres dans le filtre',
 // One line, shown on the gallery card.
 resume: 'Les chiffres de la ligne sous le filtre passent dans le filtre, après le lieu (« Monde · 58 campus · 30 pays », « 42 Paris · France ») ; la ligne disparaît et le filtre, de largeur fixe, se centre sur l’axe de la page.',
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
  { libelle: 'Explorer · 42 Paris (le pays après le campus)', page: 'content-preview.html', route: 'explore?campus=paris' },
  { libelle: 'Explorer · 42 Abu Dhabi sur téléphone, en arabe (« … »)', page: 'content-preview.html', route: 'explore?campus=abu-dhabi', format: 'mobile', theme: 'dark', lang: 'ar' },
 ],
});
