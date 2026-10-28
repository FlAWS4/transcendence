# 42 Horizon — exploration Figma v0.1

Fichier : https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT
Date : 2026-09-14

## Périmètre de cette exploration

Accueil visiteur, étudiant, staff et admin en clair et sombre ; variantes géographiques publiques ; accueil mobile en clair et sombre ; premier portfolio public. Cette exploration ne constitue pas la conception de l'ensemble du site. Les rôles sont des variantes de contenu, avec un explorateur géographique commun. Les responsabilités staff/admin sont des hypothèses à préciser, présentées dans les annotations et non comme règles acquises.

Le filtre Monde > Pays > Campus ne change jamais les autorisations. Les publications reposent sur la confiance et la vérification communautaire, sans validation préalable de l'étudiant. Les informations privées ne sont pas visibles publiquement. Contenus, personnes et chiffres des maquettes sont des exemples fictifs.

La vérification communautaire ne donne pas le droit de modifier librement tout le portfolio : les auteurs peuvent modifier leurs propres publications ; modifier les autres éléments du profil nécessite l'autorisation de l'étudiant.

## État livré — 2026-09-14

Les maquettes sont créées dans Figma Design, pas dans Figma Make.

- Quatre accueils — visiteur, étudiant, staff et admin — chacun en thème clair et sombre.
- Deux états géographiques de l'accueil public : France et campus de Paris.
- Un accueil mobile en thème clair et sombre.
- Un premier portfolio public.

Le prototype Figma est partiel. Les interactions reliées sont :

- Accueil public → France → Paris, via le bouton ou le repère France/Paris ; retour avec « − » et « Vue monde ».
- Carte Camille → portfolio → retour à l'accueil.
- Bascule clair/sombre sur les quatre accueils par rôle et sur l'accueil mobile.

Les autres actions ne sont pas fonctionnelles. La rotation libre du globe et le zoom à la molette restent disponibles dans le prototype web.

Accès directs :

- [Fichier Figma](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT)
- [Accueil visiteur](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=16-5)
- [Portfolio source](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=30-2)
- [Copie du portfolio reliée au prototype sur la page Accueils](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=34-518)

## Sources et décisions

- Charte 42 août 2024 : référence couleurs, logo, principes typographiques.
- Ancien prototype : interaction globe/menu et navigation géographique ; ses teintes violettes et sa police Inter sont remplacées par la direction approuvée.
- Figma neuf : aucun écran/composant/style/variable local ; aucun Code Connect dans le dépôt.
- Bibliothèques disponibles : kits généralistes (Material, SDS, Apple), pas de bibliothèque 42. Recherche effectuée Button, Navigation, Card, background, Body. Création locale pour un modèle de variables et de composants propre à la charte 42 et à l'exploration, sans dépendance à une bibliothèque tierce.
- Futura PT absente des polices disponibles ; Jost Regular/Medium/SemiBold/Bold vérifiées et choisies comme alternative géométrique, conformément à l'alternative permise par la charte et à la proposition acceptée.
- Les hexadécimaux du PDF priment sur ses valeurs RVB parfois incohérentes.

## Fondations v0.1

Primitives : white #FFFFFF, ink #1B1B1B, charcoal #202026, graphite #29292E, muted #5B5B60, line #E3E3E3, teal #00BABC, tealDeep #04809F, mist #E7FEFE, pale #E6F4F1, slate #324B4B, cadet #95B0B0.
Modes : Clair / Sombre.
Couleurs sémantiques : bg, surface, soft, text, muted, border, accent, link, onAccent, inverse, onInverse, land, grid.
Espacements : 4/8/12/16/24/32/48/64 ; rayons : 4/12/20/999 ; hauteur contrôle : 44.
Styles Jost : Display 72/76 Medium, H1 48/54 Medium, H2 28/34 Medium, H3 20/28 Medium, Body 16/24 Regular, Small 14/20 Regular, Label 14/20 Medium, Eyebrow 11/16 SemiBold.
Effet : ombre flottante légère.

## Composants de départ

Button : Primary / Secondary / Quiet avec états Default, Hover, Focus, Disabled.
NavigationItem : Default / Active avec propriété de texte.
ContentCard : catégorie, titre, description, lien (textes exposés).
Globe : géométrie vectorielle issue des données cartographiques locales publiées ; globe nacré et transition progressive vers le menu gauche.

## Organisation

00 Lire les pistes : couverture et règles de lecture.
01 Fondations : références et thèmes.
02 Composants : contrôles et cartes nécessaires à ces écrans.
03 Accueils : quatre rôles, variantes géographiques, sombre et mobile.
04 Portfolio : profil public initial.

Le nom Horizon, les contenus personnels, les droits staff/admin et les priorités des blocs restent ouverts à évolution.
