# Campus du réseau 42 — provenance

## Relevé du 27 septembre 2026

L’utilisateur demande d’intégrer tous les campus, au-delà des cinq lieux de démonstration. [campuses.json](campuses.json) contient les **58 campus référencés dans 30 pays** par l’annuaire public officiel lors du relevé. Il s’agit d’une copie locale datée, pas d’une connexion à l’API Intra ni d’un annuaire actualisé automatiquement.

Sources primaires :

- [Annuaire « Partner campuses »](https://www.42network.org/42-schools/).
- [GeoJSON officiel utilisé par cette carte](https://www.42network.org/wp-content/uploads/campus/campus.json). L’URL est explicitement chargée par le [script public de la carte](https://www.42network.org/wp-content/themes/42/assets/js/campus-map.min.js?ver=1.0.0).
- [Sitemap officiel des fiches campus](https://www.42network.org/campus-sitemap.xml), utilisé pour vérifier l’exhaustivité : ses **58 URL sont exactement les mêmes** que celles du GeoJSON, sans fiche supplémentaire ni manquante.

Chaque campus conserve le nom publié, son identifiant officiel, son pays, ses coordonnées, son adresse et le lien de sa fiche. Les entités HTML sont décodées ; les coordonnées deviennent des nombres dans l’ordre **longitude, latitude**. Les pays reçoivent leurs codes ISO alpha-3 et alpha-2. Les identifiants locaux `paris`, `lyon`, `tokyo`, `rio` et `sao` sont préservés pour les contenus de démonstration existants. Les autres sont dérivés de l’URL de leur fiche, sans préfixe `42-` ; `heilbronn-42-network` est simplifié en `heilbronn`.

Empreinte SHA-256 du GeoJSON téléchargé : `08c77c27a7dfb8c1c659afe9344148e6e476fbe0d0afada2f56edcce742d6dac`.

## Portée du nombre et de la localisation

Le site international annonce globalement [plus de 50 campus dans plus de 30 pays](https://www.42network.org/). Le site français affiche encore [54 campus et 31 pays sous un titre « Statistiques en 2025 »](https://42.fr/le-reseau-mondial/). Ces chiffres ne sont pas utilisés pour reconstruire une liste : le prototype reprend les fiches effectivement présentes dans l’annuaire le 27 septembre 2026.

« Référencé » ne signifie pas que tous les campus ont actuellement un cursus commencé ou des admissions ouvertes. Le fichier source ne contient aucun champ de statut ; aucun statut uniforme « ouvert » n’est inventé. Quelques situations récentes ont été vérifiées directement :

- [42 Zürich](https://42zurich.ch/en/press-release/) : première Piscine annoncée le 14 septembre 2026, début des études en janvier 2027 ; le [calendrier de sélection](https://42zurich.ch/en/studying-at-42/the-piscine-selection-sprint/) confirme cette distinction.
- [42 Wels](https://www.42wels.at/de/bewerben/) : Piscine du 17 août au 11 septembre 2026 et début du cursus annoncé le 5 octobre 2026. La page anglaise comporte une mention de Vienna au niveau du démarrage ; la page allemande mentionne bien Wels.
- [42 London](https://42london.com/) : les nouvelles candidatures sont suspendues et aucune Piscine n’est actuellement programmée. Cela ne suffit pas à conclure à une fermeture ; Londres reste conservé car présent dans l’annuaire officiel.
- [42 Marseille](https://www.42network.org/blog/42-marseille-tech-campus-vieux-port/) : premières Piscines en 2025 et première promotion en novembre 2025. [42 Tirana](https://www.42network.org/blog/42tirana-pyramid-tech-education-albania/) : ouverture en mai 2025. Ces campus récents sont bien inclus, ainsi qu’Irbid et 1337 Rabat.

Les coordonnées sont reprises de la source officielle **sans géocodage ni vérification indépendante de chaque bâtiment**. Certaines adresses sont limitées à la ville. Le nombre de décimales n’est pas une garantie de précision : les points servent à la navigation du globe, pas à un itinéraire jusqu’à une entrée. Les noms historiques absents du catalogue actuel ne sont pas ajoutés de mémoire.

## Vérifications des données

Contrôles effectués sur le fichier produit : 58 identifiants locaux uniques, 58 identifiants officiels uniques, 30 pays uniques ; chaque campus appartient à un pays présent ; toutes les coordonnées sont numériques et dans les bornes longitude/latitude ; les cinq identifiants de démonstration sont préservés. Les 58 liens et coordonnées correspondent aux entrées de la source, après normalisation de format. La couverture est celle de l’annuaire et du sitemap, pas un audit indépendant de l’activité de chacune des écoles.

Pour une prochaine actualisation, comparer à nouveau le GeoJSON au sitemap et vérifier les éventuelles ouvertures, disparitions ou modifications. Garder les identifiants locaux stables, dater le relevé et documenter les écarts ; ne pas seulement remplacer le nombre affiché.

## Précision des vues urbaines — 27 septembre 2026

Le zoom jusqu’à la ville et aux bâtiments révèle que certaines coordonnées du répertoire réseau désignent un centre-ville ou un point voisin. Le fichier original `campuses.json` reste inchangé pour préserver la source. [campus-location-overrides.json](campus-location-overrides.json) contient **18 corrections documentées** à appliquer aux positions de navigation. Elles proviennent de points ou de bâtiments OpenStreetMap recoupés avec l’adresse officielle, ou des liens cartographiques publiés par Bangkok, Kocaeli et Irbid sur leurs sites officiels. Ce contrôle ciblé répond aux décalages repérés pendant les essais ; il ne constitue pas un audit de tous les bâtiments du réseau.

| Campus | Localisation retenue | Preuve cartographique et recoupement |
| --- | --- | --- |
| Paris | Bâtiment École 42, 96 boulevard Bessières | [OSM way 297467455](https://www.openstreetmap.org/way/297467455), attributs `name`, `operator` et adresse ; [contact 42 Paris](https://42.fr/entrer-en-contact/). Centre des sommets du bâtiment, sans cibler une entrée. |
| Lisboa | Campus, 143 avenida Infante Dom Henrique | [OSM node 12697013430](https://www.openstreetmap.org/node/12697013430) ; adresse identique à la [fiche officielle](https://www.42network.org/campus/42-lisboa/). |
| Luxembourg | Campus, 14 porte de France, Esch-sur-Alzette | [OSM node 11546026732](https://www.openstreetmap.org/node/11546026732) ; adresse identique à la [fiche officielle](https://www.42network.org/campus/42-luxembourg/). |
| Vienna | Campus, Muthgasse 26/1 | [OSM node 12133122701](https://www.openstreetmap.org/node/12133122701) ; [fiche officielle](https://www.42network.org/campus/42-vienna/). |
| Berlin | Campus, Harzer Straße 42 | [OSM node 11048360138](https://www.openstreetmap.org/node/11048360138) ; [fiche officielle](https://www.42network.org/campus/42-berlin/). |
| Firenze | Campus, via del Tiratoio 1 | [OSM node 13158540399](https://www.openstreetmap.org/node/13158540399) ; [fiche officielle](https://www.42network.org/campus/42-firenze/). |
| Antananarivo | Bâtiment École 42, zone Galaxy / Andraharo | [OSM way 1149136546](https://www.openstreetmap.org/way/1149136546), identifié par le site du campus ; [fiche officielle](https://www.42network.org/campus/42-antananarivo/). Centre des sommets du bâtiment. |
| Kuala Lumpur | Bâtiment Sunway FutureX | [OSM way 210994251](https://www.openstreetmap.org/way/210994251), point représentatif Nominatim ; [42 Malaysia](https://42malaysia.edu.my/) confirme que le campus occupe ce bâtiment. |
| Roma | Bâtiment ELIS, via Sandro Sandri | [OSM way 222895553](https://www.openstreetmap.org/way/222895553), point représentatif Nominatim ; la [fiche officielle](https://www.42network.org/campus/42-roma/) confirme le centre ELIS au 81 via Sandro Sandri. |
| Bangkok | Bâtiment KMITL Lifelong Learning Center | [Contact officiel 42 Bangkok](https://www.42bangkok.com/contact/) et son [lien de carte](https://maps.app.goo.gl/A5HevL5yz7Sw8RU79), point `100.778442, 13.727506`. La page confirme le 4e étage ; le [bâtiment universitaire OSM voisin/coïncident](https://www.openstreetmap.org/way/784091346) sert au recoupement. |
| Singapore | Locaux 42SG, bâtiment 1 de SUTD | [OSM way 1554458909](https://www.openstreetmap.org/way/1554458909), nommé `42SG`, salle `1.401`, `level:ref=4` ; [contact officiel](https://www.42singapore.sg/contact-us/) indiquant Block 1, Level 4 (Library), 8 Somapah Road. Centre des sommets du polygone des locaux ; le point réseau était décalé d’environ 17 km. |
| Mulhouse | Campus, 30 rue François Spoerry | [OSM node 12063680661](https://www.openstreetmap.org/node/12063680661), nom et adresse explicites ; [présentation officielle du campus](https://www.42mulhouse.fr/en/campus/). |
| Le Havre | École 42 à la Cité Numérique, 20 quai Frissard | [OSM node 10785309505](https://www.openstreetmap.org/node/10785309505), nom, adresse et site `42lehavre.fr` ; [adresse officielle](https://42lehavre.fr/admission/). |
| Perpignan | Campus dans le bâtiment Aux Dames de France | [OSM node 10125597530](https://www.openstreetmap.org/node/10125597530), nommé `42` ; [contact officiel](https://42perpignan.fr/nous-contacter/) confirmant le bâtiment et la rue Pierre Curie. |
| Milano | Adresse du 34 via Bergognone da Fossano | [OSM node 2297227015](https://www.openstreetmap.org/node/2297227015), entrée portant le numéro 34 ; [site officiel](https://42milano.it/) et [fiche réseau](https://www.42network.org/campus/42-milano/). Précision limitée à cette adresse dans le complexe ex-Ansaldo ; le point nommé BASE Milano au numéro 26 n’a pas été utilisé. |
| Penang | Bâtiment Wisma Yeap Chor Ee, George Town | [OSM way 264867124](https://www.openstreetmap.org/way/264867124), point représentatif Nominatim ; [fiche officielle 42 Penang](https://42malaysia.edu.my/42-penang) donnant le niveau 2, Gat Lebuh China. Le point localise le bâtiment, pas l’étage. |
| Kocaeli | Repère officiel 42 Kocaeli, Gebze | [Contact 42 Türkiye](https://42turkiye.com.tr/iletisim/) et [carte embarquée](https://maps.google.com/maps?q=42%20Kocaeli&t=m&z=11&output=embed&iwloc=near) donnant `29.5107064, 40.7925707` pour 42 Kocaeli, Muallimköy, Deniz Cd. No:143-5. Le point réseau était éloigné d’environ 34 km ; aucune entrée précise n’est revendiquée. |
| Irbid | Repère officiel 42 Irbid | [Pied de page officiel](https://42irbid.com/footer-en/) et [lien Location](https://maps.app.goo.gl/4VCnkV7EMpdA1RXH7) redirigeant vers le point `35.8713171, 32.5040645`. Coordonnées du lieu `!3d/!4d`, distinctes du centre de vue `@` ; aucune nouvelle adresse postale précise n’est déduite. |

`precision: "campus"` signifie que le point, le bâtiment ou les locaux sont explicitement identifiés comme le campus dans la cartographie OSM ou dans la carte publiée par son opérateur ; `precision: "address"` localise l’adresse ou le bâtiment accueillant le campus. Aucun de ces niveaux ne garantit l’emplacement d’une porte, d’un étage ou d’une salle. Les autres **40 campus** conservent la position publiée par le réseau, **sans vérification individuelle à l’échelle du bâtiment**. Il ne faut donc pas présenter les 58 points comme des positions de bâtiments toutes validées.

Trois points restent notamment à préciser : **Iskandar Puteri**, dont [42 Malaysia](https://42malaysia.edu.my/) confirme Sunway GRID alors que la recherche OSM renvoie un arrêt de bus ou une zone de construction ; **1337 Rabat**, dont la [fiche officielle](https://www.42network.org/campus/1337-rabat/) situe les locaux dans le campus UM6P sans donner d’adresse plus précise, et dont le résultat Nominatim n’est que le centre administratif de Rabat ; **Nablus**, pour lequel aucun lien cartographique officiel suffisamment précis n’a été établi pendant ce contrôle. Ces résultats insuffisants n’ont pas remplacé les positions du réseau.

Les recherches Nominatim ont été ponctuelles, espacées, et leurs résultats examinés : les faux positifs « 42 Bangkok » aux États-Unis/Pays-Bas ainsi que les simples centres-villes « 42 Roma » et « 1337 Rabat » ont été écartés. Les objets OSM utilisés pour Paris, Lisboa, Vienna, Berlin, Luxembourg, Firenze, Antananarivo, Singapore, Mulhouse, Le Havre, Perpignan et Milano ont été relus depuis les API OSM/Overpass ; les objets des bâtiments Sunway FutureX, ELIS et Wisma Yeap Chor Ee proviennent des résultats Nominatim de la même base. Kocaeli et Irbid reposent sur les repères des cartes publiées par leurs opérateurs, sans confirmation OSM revendiquée. Les 18 remplacements ont été contrôlés : identifiants uniques, références à des campus présents, coordonnées numériques dans les bornes et provenance explicite. Ces corrections et leur provenance sont statiques, sans géocodage automatique à chaque consultation. Données © [contributeurs OpenStreetMap](https://www.openstreetmap.org/copyright), sous ODbL.


## Sites des campus — 27 septembre 2026

À la demande d’ajouter le site officiel dans la fiche du campus, [campus-websites.json](campus-websites.json) associe les **58 identifiants** du catalogue à **56 sites de campus et deux fiches réseau de repli**. Les URL proviennent des liens « Website » des fiches officielles 42 Network. Pour Irbid, dont la fiche réseau présente une page de vérification, le lien Accueil du [site officiel déjà documenté](https://42irbid.com/footer-en/) a été suivi et confirme [42irbid.com](https://42irbid.com/).

Les fiches de [Québec](https://www.42network.org/campus/42-quebec/) et de [Nablus](https://www.42network.org/campus/42-nablus/) ne publient aucun lien de site lors de ce relevé. Elles restent les destinations de repli, avec `kind: "network-profile"` pour que l’interface les nomme explicitement « Fiche réseau ». Aucune URL n’est déduite du nom du campus.

Les liens HTTP de Paris, Gyeongsan et Warsaw ont été suivis puis normalisés vers les destinations HTTPS observées ; leur valeur publiée est conservée dans `listedUrl`. Chaque entrée garde sa source, la date et son type. Contrôles passés : **58/58 identifiants concordants, URL HTTPS valides et métadonnées complètes**. Il s’agit d’un relevé des liens publiés, sans garantie de disponibilité permanente des sites ni vérification de l’ouverture des admissions. Le catalogue principal et ses coordonnées restent inchangés.


## Langues des sites — relevé du 27 septembre 2026

[campus-website-locales.json](campus-website-locales.json) contient les URL explicites utilisées pour la préférence FR/EN/AR et les replis anglais/local. [campus-website-locale-evidence.json](campus-website-locale-evidence.json) conserve les éléments de vérification ; chaque entrée du catalogue précise aussi sa provenance, sa méthode et ses limites. 58 campus couverts, 18 destinations FR, 44 EN et 7 AR ; les nombres comptent les campus et comprennent des sites partagés.

Les variantes proviennent des menus, liens de langue et pages officielles examinés. Une langue omise n’est pas une preuve d’absence. Les redirections, protections réseau et pages traduites incomplètes sont documentées. Contrôles de rendu ciblés dans Chrome : Gyeongsan coréen/anglais, Lyon anglais sans contenu central, Le Havre avec widget de langue caché. La page arabe officielle de 1337 est attestée par son contenu indexé ; l’accès direct reste protégé. Luanda exige son menu interne pour l’anglais : aucune URL distincte n’a été inventée. Québec et Nablus gardent la fiche officielle du réseau.

Le résolveur applique langue choisie → anglais → URL locale vérifiée ; huit tests et 174 résolutions passent. Le catalogue est un instantané, pas une garantie de disponibilité ou d’exhaustivité future des traductions.
