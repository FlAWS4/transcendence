# Mise à jour en place des ressources — 17 octobre 2026

**État : préparé et contrôlé hors ligne, rien n'est envoyé à Figma.** Ces appels ne sont pas dans `calls/` ; leur envoi reste à décider.

## Objet

Corriger, sans les recréer, les composants « Illustration » et le schéma de minishell de la page « Icônes et marque », qui présentaient deux défauts confirmés contre le site :

1. **Contours absents** : la règle globale `svg { fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round }` (`welcome.css`, ligne 3) n'était pas reproduite. Le balisage brut était importé : aucun trait hérité, bouts et jonctions carrés.
2. **Polices génériques des `<text>`** : Figma ne résout ni « monospace » ni « Georgia, serif ». Chaque texte concerné est remplacé par les contours vectoriels de la police que Chrome dessine ici (relevé `CSS.getPlatformFontsForNode`) :
   - « monospace » en DejaVu Sans Mono Book ;
   - « monospace » 700 en DejaVu Sans Mono Bold ;
   - « Georgia, serif » en **Liberation Serif Regular** : Georgia est absente, et la police serif par défaut de Chrome, Times New Roman, se résout en Liberation Serif. Ce n'est pas Noto Serif, la police que renvoie `fc-match serif`.

## Fichiers

| Fichier | Contenu |
| --- | --- |
| `01-illustrations.js` (20 757 caractères) | 6 illustrations : `5:161`, `5:122`, `171:31`, `5:223`, `5:42`, `48:118` |
| `02-minishell-flow-demo.js` (18 190 caractères) | Schéma `48:93` (9 textes en contours) |
| `svg/*.svg` | SVG corrigés, tels qu'ils sont envoyés |
| `manifest.json` | Décisions par composant : trait, variable liée, textes vectorisés, captures dessinées autrement |

Régénérer : `python3 scripts/assets.py update`.

## Ce que fait chaque appel

Chaque appel est autonome. Il ne stocke ni n'évalue rien dans le document.

- Il retrouve chaque composant par son identifiant, avec des garde-fous :
  - il doit s'agir d'un composant de la page « Icônes et marque » ;
  - sa taille doit être celle attendue ;
  - sa description doit citer l'identifiant de relevé, ou son nom commencer par « Illustration/ » ou « Image SVG/ ».
- Il importe le SVG corrigé (`createNodeFromSvg`), déplace les nouveaux enfants dans le composant, puis retire les anciens et le cadre temporaire.
- Il ne change ni l'identifiant, ni le nom, ni la position, ni la taille. Les instances, sans surcharge sur ces enfants, doivent suivre ; ce n'est pas vérifié dans Figma.
- Il pose des contraintes SCALE, comme l'appel de création. Les nouveaux enfants sont ajoutés avant le retrait des anciens. Si une étape échoue avant ce retrait, ils sont ôtés et le composant reste tel quel.
- Seule la visionneuse (`48:118`) a un trait thématique : ses 15 traits hérités #1B1B1B sont liés à `Rôles/logo` (#1B1B1B en clair, #FFFFFF en sombre ; correspondance de `palette.json`).

## Contrôles

- **Simulation** : `node scripts/sim_figma.mjs $PWD/assets-update/01-illustrations.js $PWD/assets-update/02-minishell-flow-demo.js`. Résultat : 7/7 composants mis à jour, aucun calque texte restant, 15 traits liés, aucun cadre temporaire laissé.
  - Le simulateur lit maintenant le SVG : syntaxe, grammaire des tracés, peintures non résolubles.
- **Glyphes** : `python3 scripts/svg_text_outlines.py`. Les 34 glyphes, rastérisés à 2 048 px et comparés à FreeType, n'ont aucun pixel intérieur différent. Le témoin en Noto Serif en a 121 839.
- **Rendu** : `python3 scripts/check_assets_update.py` compare chaque SVG dessiné par Chrome aux captures du site, dans 18 cas. Résultats dans `verification/assets-update/results.json`, planches PNG à côté.

## Points ouverts, à trancher

1. **Traits « mixtes »** : une même illustration n'a aucun trait dans les cartes (`div.cp-art`, `.cp-art > svg { stroke: none }`). Elle a en revanche un trait de 1,6 en couleur courante (#1B1B1B en clair, #FFFFFF en sombre) dans l'image en tête des fiches et dans la galerie Médias (`button.cp-project-media-art.cp-project-media-open > div`, dans `figure.cp-project-media`). Le composant partagé garde le dessin des cartes. Cadres concernés :
   - `5:42` (ft_transcendence) : Projets · Fiche projet, Choisir un campus, Signaler, et le sélecteur « Dans ce projet » ouvert sur mobile ;
   - `5:122` (minishell) :
     - Projets · Fiche projet à campus unique, Médias, Visionneuse de médias (fiche sous le voile) ;
     - Explorer · Fenêtre « Autour du campus » ;
   - `171:31` (chronique) : Chroniques · Chronique et Médias.

   Dans ces en-têtes, le texte « $ ./minishell » prend lui aussi ce contour sombre. C'est probablement involontaire côté site.
2. **Arabe** : les `<text>` héritent `direction: rtl`. `text-anchor: start` s'ancre alors au bord droit, et « $ ./minishell » s'affiche « minishell/. $ ». Les composants gardent l'ancrage gauche des pages FR et EN. L'écart est mesuré, sans variante créée. Il est probablement involontaire côté site.
3. **Noms** : ceux des composants du 15 octobre (`5:42`, `5:122`, `5:161`, `5:223`) ne sont pas archivés. Le manifeste les reconstitue ; l'appel renvoie les vrais noms.

## Limites

- Rien n'a été contrôlé dans Figma : ni l'import réel, ni la propagation aux instances réduites par `rescale`. Après l'envoi, une capture d'une carte, d'un en-tête de fiche et de la visionneuse suffira à le confirmer.
- Les petits textes (10 à 20 px) restent un peu différents des captures. Chrome dessine son texte avec hinting et anticrénelage sous-pixel, alors que les contours suivent le dessin exact de la police, comme Figma le fera.
