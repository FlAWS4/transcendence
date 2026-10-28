# Prototype de déchiffrement — 42 Horizon

Dernière mise à jour : **27 septembre 2026**.

Parcours de recherche : les [exemples séparés](../../../studies/decryption-examples/index.html) sont conservés durablement sur décision explicite de l’utilisateur du 14 septembre 2026, en remplacement de la suppression initialement prévue. La galerie compte désormais **vingt-deux essais**, avec les filtres **Tous · 22**, **Archive initiale · 12** et **Nouvelles pistes · 10**.

**Animation retenue — 27 septembre 2026 :** l’utilisateur choisit explicitement le [n°22 — résolution aléatoire](../../../studies/decryption-examples/scanner-return-random.html), dans son état courant décrit ci-dessous. Ce choix remplace la sélection du n°20 du 16 septembre. Les vingt-deux essais restent conservés. La décision concerne l’animation visuelle ; son intégration au prototype principal, au parcours complet et à Figma reste à réaliser. L’enregistrement de cette sélection est documentaire, sans modification du code ni nouveau test.

**Sélection historique du 16 septembre, état conservé :** le [scanner n°19](../../../studies/decryption-examples/scanner-sync.html) garde ses deux balayages horizontaux ; le [scanner vertical aller-retour n°20](../../../studies/decryption-examples/scanner-return.html) descend du binaire vers l’hexadécimal puis remonte vers les caractères chiffrés. Le **15 septembre**, après un allongement de la finale simultanée à 1,8 s, l’utilisateur précise qu’il veut une onde progressive. Les pages n°19 et 20 réalisent 42 changements sur place en **1,2 s par lettre**, avec **1,8 s d’étalement des départs** de gauche à droite : la vague complète va de **3,65 à 6,65 s**, sans traits sous les lettres. La scène dure toujours 6,8 s. **Contrôles ciblés de cette onde terminés :** n°19 sur ordinateur, n°20 sur mobile sombre, résultat exact et bornes des quinze positions vérifiées dans les deux rendus. Les sources des étapes simultanées à 650 ms et 1,8 s restent archivées sans ajouter de numéro. **Le n°20 avait été retenu le 16 septembre ; cette sélection est remplacée par celle du n°22 le 27 septembre.** Il reste intact comme base de comparaison, sans intégration au prototype principal ou à Figma.

**Comparaison du 27 septembre, suivie du choix du n°22 :** les [n°21 — résolution de gauche à droite](../../../studies/decryption-examples/scanner-return-ordered.html) et [n°22 — résolution aléatoire](../../../studies/decryption-examples/scanner-return-random.html) conservent les scans du n°20 et font démarrer les treize lettres ensemble à **3 650 ms**. Elles se fixent ensuite de **6 050 à 6 650 ms**, toutes les **50 ms**, soit des durées individuelles de **2 400 à 3 000 ms**. Les espaces restent vides, les lettres actives turquoise et les positions fixes, sans traits dessous. La phrase exacte reste affichée jusqu’à 6 800 ms. Le n°22 utilise une permutation déterministe de graine 42, stable au curseur, au rejeu et aux changements de présentation ; le déchiffrement conserve les mêmes 42 rotations inverses. Le rendu commun [scanner-return-together.mjs](../../../studies/decryption-examples/scanner-return-together.mjs) est appelé par les modules `scanner-return-ordered.mjs` et `scanner-return-random.mjs`. **Le n°22 est choisi dans cet état ; le n°21 reste conservé comme variante de comparaison.**

**Contrôles du 27 septembre, avant la sélection :** départ commun, treize bornes de fin et permutation vérifiés numériquement ; phases et positions du scanner comparées à celles du n°20 avant le déchiffrement. La revue ciblée confirme la conservation du scanner, des glyphes, du layout et de la gestion du thème/redimensionnement ; les 58 fichiers historiques contrôlés sont inchangés. Dans le navigateur, toutes les lettres actives à 3 900 ms et les deux ordres de résolution à 6 300 ms ont été examinés. Les deux variantes ont été jouées intégralement sur ordinateur clair et mobile sombre **390 × 844**, jusqu’à la phrase finale exacte ; aucun débordement horizontal mobile relevé. Le n°22 conserve son texte intermédiaire et son ordre après retour arrière du curseur, changement de thème et passage à l’ordinateur. Galerie **22/12/10**, filtre des dix nouvelles pistes et navigation contrôlés ; consoles sans erreur ni avertissement. Pas de mesure de FPS ni de nouveau contrôle du mode de réduction des mouvements. L’[historique et les contrôles détaillés](../../../studies/decryption-examples/NOTES.md) distinguent les étapes et leurs vérifications datées. Ces preuves techniques sont distinctes du choix explicite du n°22 exprimé ensuite par l’utilisateur. Le prototype principal décrit ci-dessous conserve son comportement et ses vérifications du 14 septembre ; la comparaison et la sélection ne modifient ni ce prototype ni Figma.

Statut du prototype principal : **transformation géométrique réalisée, huit tests moteur passés et contrôles Chrome ciblés terminés**. La séquence demandée est réalisée ; l'algorithme proposé n'a pas reçu d'acceptation finale de l'utilisateur.

## Séquence et calcul

L'utilisateur demande **binaire → hexadécimal → texte encore chiffré → langage naturel**, avec des symboles dans le texte brouillé. La cible reste **BEYOND THE CODE** dans les trois langues de l'interface.

La proposition retenue pour cet essai est une **rotation de 42 positions sur un alphabet de 76 caractères**, comprenant lettres majuscules/minuscules, chiffres et symboles :

```text
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*?+-=/<>
```

Le texte chiffré exact est **`ru%43t 9xu s4tu`**. Les espaces sont conservés. Les quinze octets ASCII de ce texte, espaces compris, sont d'abord affichés en binaire, puis en hexadécimal : ces deux phases représentent les mêmes données chiffrées. Les caractères chiffrés apparaissent ensuite, puis effectuent **42 rotations inverses réelles** pour retrouver la phrase finale. Le moteur ne tire pas de caractères aléatoires.

La chronologie logique dure **6,8 secondes**. Les deux transformations de représentation durent **900 ms chacune**, avec jusqu'à 160 ms de décalage entre caractères :

| Phase | Début et comportement |
| --- | --- |
| Binaire initial | Maintenu au moins 600 ms |
| Binaire → hexadécimal | De 600 à 1 500 ms pour le premier caractère ; chaque quartet de bits se regroupe vers son chiffre hexadécimal |
| Hexadécimal stable | Pause de 400 ms par caractère |
| Hexadécimal → caractère chiffré | De 1 900 à 2 800 ms pour le premier caractère ; les deux chiffres se recomposent en un caractère |
| Déchiffrement | Débute entre 3 400 et 3 800 ms ; 42 rotations inverses en 3 000 ms par caractère concerné |
| Phrase finale | Tous les caractères sont stabilisés à 6 800 ms |

L'utilisateur a demandé une transformation continue des formes pour rendre les deux premières transitions plus progressives. Le rendu utilise maintenant **Canvas 2D** : l'encre des glyphes est échantillonnée en un maillage dense de points. Les positions des points de chaque quartet évoluent vers son chiffre hexadécimal, puis celles des deux chiffres vers les moitiés gauche/droite du caractère chiffré. L'interpolation est lissée ; ces deux transitions ne reposent pas sur un fondu d'opacité.

`requestAnimationFrame` suit les progressions continues `binaryToHex` et `hexToCipher` fournies par le moteur. Les timings sont centralisés dans `MOTION` et s'adaptent à une autre durée logique. Les cellules gardent leur place ; le mobile utilise deux lignes. La rotation 42 et le texte chiffré sont inchangés.

XOR 42 et une rotation sur les seules 26 lettres ont été explorés puis remplacés pour répondre à la séquence et à l'inclusion de symboles. La clé fixe et publique sert ici à la mise en scène ; ce prototype ne constitue pas un mécanisme de sécurité.

## Parcours et limites fonctionnelles

L'entrée reprend V9 : aucun logo ni accroche, seulement le message, les accès connexion/visiteur et langue/thème.

- **Connexion** ouvre une boîte qui indique la simulation. Confirmer lance la séquence. La phrase finale reste affichée pour examen, avec **Rejouer**.
- **Annuler** ferme la boîte et conserve le binaire.
- **Visiteur** cache la phrase et affiche le symbole 42, sans déchiffrement. Le retour remet l'entrée.
- Français, anglais, arabe et thèmes clair/sombre sont disponibles. L'interface arabe est RTL ; les représentations du message et le slogan gardent leur ordre LTR.

La ligne arabe du nom apparaît uniquement dans la boîte de connexion, selon V8 : toujours en AR, en EN pour la région simulée `arab-world`, jamais en FR. Le paramètre `region` est un réglage d'aperçu : **aucune IP n'est détectée**.

Le prototype n'implémente **ni globe, ni accueil complet, ni authentification réelle, ni géolocalisation IP**. L'arrêt sur la phrase finale est volontaire pour son examen. **Figma V9 conserve son ancien message crypté et ses cadres de révélation** : cette nouvelle animation existe seulement dans le prototype web.

## Fichiers et ressources

| Fichier | Rôle |
| --- | --- |
| [horizon-decryption.html](horizon-decryption.html) | Structure de la page et boîte de connexion simulée |
| [horizon-decryption.css](horizon-decryption.css) | Composition, représentations, transitions, mobile et RTL |
| [horizon-decryption.mjs](horizon-decryption.mjs) | Animation et interactions |
| [horizon-decryption-morph.mjs](horizon-decryption-morph.mjs) | Transformation continue de l’encre des glyphes en Canvas 2D |
| [horizon-decryption-engine.mjs](horizon-decryption-engine.mjs) | Chiffrement, déchiffrement et chronologie déterministe sans DOM |
| [horizon-decryption-engine.test.mjs](horizon-decryption-engine.test.mjs) | Huit tests du moteur |

Les couleurs et mesures réutilisent [tokens.css](../../../shared/brand/tokens.css), et le symbole provient de [logo-42.svg](../../../shared/brand/logo-42.svg). La lune [assets/moon.svg](../../../shared/assets/moon.svg) reprend l'icône Figma `47:132`. Jost **400, 500 et 600** est auto-hébergée par [assets/jost.css](../../../shared/assets/jost.css), avec sa [licence SIL OFL 1.1](../../../shared/assets/Jost-OFL.txt). Aucun remplacement par Futura n'est réalisé. La CSS demande Noto Sans Arabic pour les textes arabes ; cette police n'est pas incluse dans les ressources locales à ce relevé.

## Lancer et vérifier localement

Depuis la racine du projet :

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Ouvrir ensuite `http://127.0.0.1:8765/archives/early-prototypes/decryption/horizon-decryption.html`. Le port 8765 est un exemple local ; ces notes ne supposent aucun serveur permanent.

Paramètres d'aperçu : `?lang=fr`, `?lang=en` ou `?lang=ar` ; ajouter `&region=arab-world` pour simuler cette région. Toute autre valeur suit le comportement « autre ou inconnue ».

Tests moteur et contrôle de syntaxe du contrôleur :

```sh
node --test archives/early-prototypes/decryption/horizon-decryption-engine.test.mjs
node --check archives/early-prototypes/decryption/horizon-decryption.mjs
node --check archives/early-prototypes/decryption/horizon-decryption-morph.mjs
```

## Niveau de preuve

**Huit tests moteur passés.** Ils couvrent le texte chiffré exact, la réversibilité ASCII, les octets communs aux représentations, la continuité et les bornes des deux transformations, les 42 rotations inverses avec symboles, l'ordre des phases et la phrase finale, l'échantillonnage indépendant et la durée configurable, ainsi que le rejet des arguments invalides.

**Syntaxe du contrôleur et du rendu géométrique vérifiée.** Une revue indépendante du rendu, du redimensionnement, du thème et du chemin de réduction des mouvements n'a relevé aucun défaut concret.

**Chrome, correction géométrique :**

- Ordinateur **1 920 × 991** : captures d'instants figés du même moteur et du même rendu inspectées à **1 050 ms** (bits en regroupement), **1 700 ms** (hexadécimal), **2 400 ms** (recomposition) et **6 800 ms** (phrase finale).
- Mobile **390 × 844** : les deux transformations et le cadrage final ont été contrôlés par ces mêmes outils de revue. Le bloc reste à `x=73,8958 ; y=364`, de taille `242,2083 × 116` px, sans débordement. La page temporaire de revue a été supprimée ; elle ne fait pas partie du livrable.
- Parcours réel sur ordinateur : connexion simulée jouée, progression intermédiaire `binaryToHex=0.441` observée avec `hexToCipher=0`, puis phrase finale exacte. Captures finales claire puis sombre inspectées.
- Annuler et Visiteur ont été rejoués : aucun avancement du déchiffrement, et phrase masquée dans le parcours visiteur.
- Aucune erreur ni aucun avertissement navigateur observé pendant ces contrôles.

**Limites :** aucune mesure de FPS, aucune préférence de réduction des mouvements forcée dans le navigateur et aucune nouvelle matrice de langues pour cette correction. Les contrôles antérieurs du focus, des libellés FR/EN/AR et de la boîte arabe appartiennent à l'itération précédente ; ils ne sont pas présentés comme de nouveaux essais de cette version. Le code prévoit une pause lorsque l'onglet est masqué ; aucune vérification dédiée de ce cas n'est consignée.

Les contrôles démontrent le fonctionnement ciblé décrit ci-dessus. Ils ne valent ni acceptation finale de la proposition algorithmique, ni intégration au prototype Figma ou à l'application.
