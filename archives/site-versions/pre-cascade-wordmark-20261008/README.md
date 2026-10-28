# Ancien brouillage HORIZON ↔ AWARDS

[Ouvrir le lecteur](preview.html) depuis le serveur local du projet. Deux boutons permettent les transitions et inversions, avec un thème clair ou sombre et les anciennes proportions de l’en-tête sur ordinateur/mobile.

Le 8 octobre 2026, l’utilisateur choisit la **Cascade de lettres — essai 08** pour remplacer le brouillage du mot de l’en-tête. Les fichiers `brand-wordmark.mjs`, `brand-wordmark.css`, `tests/brand-wordmark.test.mjs` et `BRAND_WORDMARK_NOTES.md` sont les copies exactes de l’état immédiatement précédent, avec empreintes dans `manifest.json`. Ils ne sont pas réécrits.

`viewer-wordmark.mjs` reprend le module historique en adaptant uniquement ses deux chemins d’import. Le lecteur charge la feuille de style historique ; `viewer.css` isole la présentation et reprend les proportions de marque depuis l’ancien en-tête. `tests/viewer-brand-wordmark.test.mjs` adapte uniquement les imports des tests conservés afin de les exécuter ici. Le moteur de déchiffrement, la permutation, les jetons, la police et le logo officiels restent partagés dans le dépôt. Ce dossier est un lecteur autonome du composant, pas une copie indépendante de toutes ces ressources ni de l’application entière.

Vérifications : intégrité des quatre sources, résolution des références locales, syntaxe et tests historiques adaptés. Aucun rejeu navigateur par l’agent qui prépare cette archive. Les liens relatifs du document historique conservé décrivent son emplacement original ; utiliser ce README pour l’accès au lecteur.

## Contrôle navigateur — 8 octobre 2026

L’agent principal a rejoué ce lecteur dans Chrome sur ordinateur : bouton AWARDS, capture intermédiaire montrant les glyphes brouillés, puis état **42 AWARDS** au repos ; bouton HORIZON et retour à **42 HORIZON** au repos. Aucun nouveau contrôle mobile du lecteur historique n’est revendiqué.
