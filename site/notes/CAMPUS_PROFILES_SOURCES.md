# Informations complémentaires des campus

Relevé actualisé le **8 octobre 2026**, à la demande de renseigner les fiches de **42 Paris et 42 Mulhouse**. Les sources officielles ci-dessous alimentent `campus-profiles.json` ; `retrievedAt` indique la consultation, tandis que `asOf` conserve l’année propre à chaque statistique. Ce relevé est statique : aucune donnée en direct, synchronisation avec l’Intra ou publication distante.

Les 58 identités, pays, adresses et destinations restent issus de `campuses.json`, `campus-websites.json` et `campus-website-locales.json`, avec les limites de [CAMPUS_SOURCES.md](CAMPUS_SOURCES.md). Deux campus sont enrichis ; les 56 autres restent à compléter. Les coordonnées existantes de Paris et Mulhouse sont conservées, sans nouvelle mesure géographique dans cette recherche. Le [relevé initial du 5 octobre](../../archives/site-versions/pre-campus-profile-sources-20261008/CAMPUS_PROFILES_SOURCES.md) est conservé.

## 42 Paris

### Identité, adresse, contacts et ouverture

- **Logo officiel** : [SVG du site 42](https://42.fr/wp-content/uploads/2021/05/42-Final-sigle-seul.svg), utilisé dans l’en-tête et le pied de page de [42.fr](https://42.fr/). Copie originale `assets/campuses/paris-logo-official.svg`, 2 073 octets, `viewBox="0 0 57 40"`. Il s’agit du signe 42 seul ; aucun mot Paris n’est ajouté à son dessin. Le filtre interne du SVG produit un signe blanc : `logo.surface: "dark"` demande un fond sombre, sans recoloration de l’original.
- **Adresse principale** : 96, boulevard Bessières, 75017 Paris, France, confirmée par les pages [Contact](https://42.fr/entrer-en-contact/), [Campus](https://42.fr/le-campus-de-paris/42-paris-campus/) et [Réseau 42](https://www.42network.org/campus/42-paris/). Le bâtiment NOC, au 8, rue du Docteur-Paul-Brousse, est présenté séparément et ne remplace pas cette adresse. Coordonnées existantes `[2.3192, 48.89704]` inchangées.
- **Contacts** : admissions `apply@42paris.fr`, général `contact@42paris.fr`, accessibilité `referent-handicap@42.fr`, confirmés sur la [page officielle de contact](https://42.fr/entrer-en-contact/). Les adresses publiquement affichées par le site ont été vérifiées dans son HTML. Les admissions indiquent répondre exclusivement par courriel ; aucun numéro de téléphone n’est inventé.
- **Sites et langues** : [français](https://42.fr/) et [anglais](https://42.fr/en/homepage/) confirmés. La résolution existante est conservée : FR → français, EN → anglais, AR → anglais faute de destination arabe vérifiée.
- **Ouverture : 2013**, selon la [page du campus](https://42.fr/le-campus-de-paris/42-paris-campus/) et sa [fiche réseau](https://www.42network.org/campus/42-paris/). `openedOn: "2013"` garde la précision de l’année ; aucun mois ou jour ajouté. La rénovation de 2025 n’est pas une nouvelle date d’ouverture.

### Photos officielles

Les deux fichiers existants sont conservés. Leurs URL figurent toujours dans la [page officielle du campus](https://42.fr/le-campus-de-paris/42-paris-campus/) consultée le 8 octobre. Les alternatives FR/EN/AR, le crédit « 42 Paris » et les liens source sont préservés.

| Fichier local dans `assets/campuses/` | Dimensions | Original officiel |
| --- | --- | --- |
| `paris-campus.jpg` | 1 500 × 1 000 | [42UP-campus-hero.jpg](https://42.fr/wp-content/uploads/2025/07/42UP-campus-hero.jpg) |
| `paris-cluster.jpg` | 1 000 × 625 | [42UP-campus-details02.jpg](https://42.fr/wp-content/uploads/2025/07/42UP-campus-details02.jpg) |

### Statistiques et prochaines Piscines

**Plus de 5 000 étudiants, donnée 2025** : les pages [Accueil](https://42.fr/), [Accueil anglais](https://42.fr/en/homepage/) et [Programme expliqué](https://42.fr/42-cest-quoi/le-programme-42-explique/) identifient explicitement les statistiques du campus Paris pour 2025. La fiche utilise `value: "5 000+"`, `asOf: "2025"` et le lien officiel. Ce chiffre historique ne décrit pas un décompte actualisé au 8 octobre 2026. Les 21 000+ du réseau, les 1 400 ordinateurs et les capacités de salles sont exclus de l’effectif étudiant.

**Promotions et alumni : non renseignés.** Aucun total fiable et daté propre à Paris n’a été établi dans les sources consultées. La [page Alumni](https://42.fr/alumni/) présente notamment des taux, salaires et offres ; ce ne sont pas des nombres d’alumni. Aucun total de promotions n’est calculé depuis l’année d’ouverture.

Les pages spécifiques [Admissions FR](https://42.fr/admissions/admissions/) et [Admissions EN](https://42.fr/en/admissions/admissions/) confirment :

- Piscine du **25 janvier au 19 février 2027** ;
- Piscine du **1er au 26 mars 2027** ;
- sessions annoncées en **juillet, août et septembre 2027**, sans jours précisés.

La [FAQ](https://42.fr/tout-savoir-sur-faq/) conserve une formulation antérieure indiquant que 2027 n’est pas défini. Les dates explicites et concordantes des pages d’admission sont retenues. Aucun calendrier n’est déduit des années précédentes.

## 42 Mulhouse

### Identité, adresse, contacts et ouverture

- **Logo officiel 42 Mulhouse Grand Est** : [SVG blanc de l’en-tête officiel](https://www.42mulhouse.fr/wp-content/uploads/2024/02/logo-42-Mulhouse-GE-blanc.svg), copié sans modification dans `assets/campuses/mulhouse-logo-official-white.svg`, 9 749 octets, `viewBox="0 0 423 165"`. `logo.surface: "dark"` conserve sa lisibilité sur fond sombre, sans redessiner ni recolorer la marque.
- **Adresse** : KMØ, 30 rue François Spoerry, 68100 Mulhouse, France, confirmée par la [page du campus](https://www.42mulhouse.fr/le-campus/), la [fiche réseau](https://www.42network.org/campus/42-mulhouse/) et la [brochure officielle 2026](https://www.42mulhouse.fr/wp-content/uploads/2026/05/fr-2026-plaquette-candidats.pdf). Adresse du catalogue déjà correcte ; coordonnées `[7.3274918, 47.738475]` conservées. Le centre de la carte Google intégrée au site n’est pas utilisé comme preuve d’une nouvelle position du bâtiment.
- **Contact général** : `contact@42mulhouse.fr`, confirmé en [page 9 de la brochure](https://www.42mulhouse.fr/wp-content/uploads/2026/05/fr-2026-plaquette-candidats.pdf#page=9) et par la [fiche réseau](https://www.42network.org/campus/42-mulhouse/).
- **Téléphone public** : `+33 3 67 23 02 82`, sur les [mentions légales](https://www.42mulhouse.fr/mentions-legales/), page toujours accessible au relevé et indiquant une dernière mise à jour au 2 mars 2023. Aucun appel effectué pour vérifier le service.
- **Accessibilité** : `referent-handicap@42mulhouse.fr`, sur la [page du campus](https://www.42mulhouse.fr/le-campus/). Le [formulaire de contact](https://www.42mulhouse.fr/faq/#contact) est présent dans la FAQ ; aucun message envoyé.
- **Sites et langues** : [français](https://www.42mulhouse.fr/) et [anglais](https://www.42mulhouse.fr/en/) confirmés ; repli AR → anglais conservé, sans inventer une version arabe.
- **Ouverture : novembre 2021**, selon la [page du campus](https://www.42mulhouse.fr/le-campus/). `openedOn: "2021-11"` ne prétend pas connaître le jour. Le « Kickoff 2022 » de la brochure désigne la rentrée et n’est pas substitué à l’ouverture.

### Photos officielles

Les quatre fichiers ont été téléchargés depuis le domaine officiel, décodés et examinés visuellement. Les originaux sont conservés sans retouche. La galerie possède des alternatives FR/EN/AR, un crédit et une source pour chaque image.

| Fichier local dans `assets/campuses/` | Dimensions | Provenance et crédit |
| --- | --- | --- |
| `mulhouse-km0-campus.jpg` | 1 024 × 679 | [Façade de KMØ](https://www.42mulhouse.fr/wp-content/uploads/2022/11/KMO_-_PHOTO_LUC_BOEGLY-005-1024x679.jpg) · 42 Mulhouse / Luc Boegly |
| `mulhouse-cluster.jpg` | 1 024 × 684 | [Salle informatique](https://www.42mulhouse.fr/wp-content/uploads/2022/11/AB1A7424.jpg) · 42 Mulhouse |
| `mulhouse-entrance.jpg` | 667 × 800 | [Entrée intérieure](https://www.42mulhouse.fr/wp-content/uploads/2022/11/KM0_-_ECOLE_44_-_DeA_Architectes_-_2021_-_Photo_Luc_Boegly-023.jpg) · 42 Mulhouse / Luc Boegly |
| `mulhouse-cantina.jpg` | 1 024 × 724 | [Restauration et détente](https://www.42mulhouse.fr/wp-content/uploads/2022/11/KM0_-_ECOLE_44_-_DeA_Architectes_-_2021_-_Photo_Luc_Boegly-020-1024x724.jpg) · 42 Mulhouse / Luc Boegly |

Luc Boegly est identifié dans le nom du fichier officiel de la façade et dans les métadonnées EXIF de l’entrée et de la cantina. Aucun photographe n’est établi pour la salle informatique : le crédit de provenance « 42 Mulhouse » est conservé, sans attribution inventée.

### Statistiques et prochaines Piscines

**413 étudiants, donnée 2024** : la [brochure officielle 2026, page 2](https://www.42mulhouse.fr/wp-content/uploads/2026/05/fr-2026-plaquette-candidats.pdf#page=2), liée depuis le site du campus, porte explicitement « 2024 : 413 étudiants » dans le bloc de Mulhouse. La page a été rasterisée et lue visuellement ; ses chiffres de réseau sont présentés séparément. Ce sont bien des étudiants, pas des candidats ou diplômés du réseau. La brochure ne précise pas si l’effectif est actif ou cumulé : `value: 413`, `asOf: "2024"` conserve cette donnée historique, sans prétendre mesurer les inscrits de 2026.

**Promotions et alumni : non renseignés.** Aucun total actuel incontestable n’a été établi dans les sources officielles consultées. Une annonce de sixième rentrée à venir ne prouve pas qu’elle a eu lieu ; elle ne devient donc pas six promotions accomplies. Les anciens décomptes, chiffres internationaux et biographies du personnel ne remplacent pas un total du campus.

Les [admissions](https://www.42mulhouse.fr/admissions/) et la [brochure, page 4](https://www.42mulhouse.fr/wp-content/uploads/2026/05/fr-2026-plaquette-candidats.pdf#page=4), annoncent les sessions du **13 juillet au 7 août 2026** et du **7 septembre au 2 octobre 2026**. Elles sont toutes deux terminées au 8 octobre. Aucune date ultérieure n’a été trouvée dans ces sources : la liste structurée reste vide et une note datée l’explique. Cela ne signifie pas qu’aucune autre session ne sera organisée. Les anciennes dates 2024 de la FAQ ne sont pas reprises comme calendrier actuel.

## Vérifications, droits et limites communes

Les sources officielles ont été consultées le 8 octobre 2026 ; les copies HTML et les brochures ont permis de vérifier les contenus lorsque le service de lecture web bloquait une page. Les six JPEG se décodent ; les deux SVG sont des XML valides, sans script, `foreignObject`, gestionnaire d’événement ni ressource externe embarquée. Les références internes du logo parisien sont conservées. Les deux logos blancs et les quatre nouvelles photos de Mulhouse ont été examinés comme fichiers ; ce contrôle ne vaut pas examen de leur dernier rendu dans la fiche complète, consigné séparément dans [PROGRESSIVE_CAMPUS_NOTES.md](PROGRESSIVE_CAMPUS_NOTES.md).

Les URL des originaux et les crédits sont conservés. Aucune licence de redistribution des photographies n’a été établie dans ce relevé ; les ressources restent utilisées dans le prototype local, sans publication réalisée par ce travail.

Les sessions terminées sont exclues au rendu et une session en cours est marquée. Les calendriers ne sont pas synchronisés automatiquement ; une annonce ne garantit pas une place disponible. Les liens d’itinéraire utilisent le nom et l’adresse officiels dans Google Maps, sans demander ni enregistrer la position de l’utilisateur dans Horizon.

Les rubriques inconnues restent explicites. Un tiret ne représente jamais zéro et une section vide ne prouve pas l’absence de l’information sur tout le site officiel. Les 56 autres campus conservent leur identité, leur adresse, leur site adapté à la langue et leur itinéraire ; logo, photos, contacts, ouverture, statistiques et sessions nécessitent un relevé propre à chacun.
