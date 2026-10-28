# Intégrer la sélection du 15 octobre au prototype actif — plan

**Statut (15 octobre 2026, 16 h 35) : paquet préparé et vérifié, non appliqué.** Demande de l’utilisateur : « Je veux que tu appliques tous les changements à l’original ». Les neuf essais retenus le 15 octobre (01, 03, 07, 09, 12, 13, 15, 18, 19) sont réunis dans deux fichiers prêts à copier dans `site/`. Pendant cette préparation, une autre session corrigeait l’original : **ni l’original ni l’étude n’ont été modifiés**, aucun commit, push ni publication. L’application reste à faire, par une seule session, une fois cette autre session terminée, après archivage de l’état courant.

L’original a changé pendant la préparation : état **145** au début, **`audit-fixes-146`** (aperçu 113) depuis 16 h 09. Toutes les mesures sur l’original ci-dessous portent sur 146 ; relire les fichiers avant d’appliquer.

## 1. Le paquet

| Fichier | Contenu | Octets | SHA-256 |
| --- | --- | --- | --- |
| [design-review-selection.css](design-review-selection.css) | les neuf `essai.css`, fusionnés | 30 433 | `68c9986bf451fc95eea0a50b1863db42661c6ee0c9adcdbbe966acaf87b83dff` |
| [design-review-selection.mjs](design-review-selection.mjs) | comportements de `pseudo-manquant` et `awards-a-venir` | 4 226 | `0200f2ff846812a1bfaf869571e3acf264923bcd5772a257e622798b1038d351` |

**Feuille.** Neuf sections dans l’ordre canonique de [essais/boot.js](../essais/boot.js), qui est l’ordre réel des feuilles dans l’étude : globe-espace-libre, police-etiquettes-globe, une-colonne-320, roles-couleur, visiter-contour-sombre, lisibilite-textes, echelle-unifiee, **pseudo-manquant**, awards-a-venir. La consigne reçue plaçait pseudo-manquant en 4ᵉ position ; boot.js le place en 8ᵉ, et c’est cet ordre, testé dans l’étude, qui est suivi. Chaque section commence par une ligne de titre en anglais ; les commentaires d’origine des essais sont conservés. La feuille est produite par [build_package.py](../checks/_integration-20261015/preparation/build_package.py), qui n’applique que les modifications ci-dessous, avec leur nombre attendu.

**Conditions entre essais.** Les cinq sélecteurs `:root[data-essais~=lisibilite-textes]` (trois bandes du globe réduit, deux règles de l’échelle unifiée) deviennent `:root:root`, avec un commentaire qui le dit. Spécificité identique, vérifiée sélecteur par sélecteur : (1,5,0) ×3, (0,2,0), (2,5,0). Aucune règle n’est retirée, aucune valeur n’est changée : une fois les renommages défaits et `:root:root` remis en condition, les règles (sans les commentaires) sont identiques aux neuf `essai.css` mis bout à bout ([results-source.json](../checks/_integration-20261015/preparation/results-source.json)).

**Renommages** (repères propres aux essais, toutes leurs occurrences dans le CSS et le JS) :

| Étude | Paquet | Occurrences |
| --- | --- | --- |
| `--essai-globe-radius`, `-top`, `-bottom`, `-disc`, `-q` (dont `@property`) | `--globe-fit-radius`, `-top`, `-bottom`, `-disc`, `-q` | 23 (CSS) |
| `--essai-lt-accent` | `--readable-text-accent` | 3 (CSS) |
| classe `.essai-awards-a-venir` et `@keyframes essai-awards-a-venir-in` | `.awards-coming-soon`, `awards-coming-soon-in` | 8 (CSS), 2 (JS) |
| `data-pseudo-manquant="replie"` (`dataset.pseudoManquant`) | `data-pending-login="collapsed"` (`dataset.pendingLogin`) | 1 (CSS), 6 (JS) |
| commentaire « essai.mjs marks … "replie" » | « design-review-selection.mjs marks … "collapsed" » | 1 (CSS) |

Conservés : les quatorze variables `--eu-*` de l’échelle unifiée (abréviation sans mention d’essai, documentée dans sa section) et tous les noms du socle (`--hg-radius`, `--h42-*`…). Seul nom ajouté : `Symbol.for('horizon.design-review-selection')`, garde d’installation unique. Aucun des nouveaux noms n’existe déjà dans l’original (état 146) ni dans la copie ; les sélecteurs renommés gardent leur spécificité (classe pour classe, attribut pour attribut).

**Module.** Même logique et mêmes observateurs que les deux `essai.mjs` : chaque ligne de code d’origine est présente, dans l’ordre, après renommage ; les textes FR/EN/AR de la note Awards sont identiques à l’octet près. Seules les enveloppes de l’étude (`export default function install`, drapeau `installed`) sont remplacées par un démarrage commun. Les sept autres `essai.mjs` exportent une fonction vide et `echelle-unifiee/early.js` ne contient que des commentaires : rien à reprendre. Aucun des neuf essais n’utilise le pont `window.horizonStudy`, `window.horizonEssais` ni les polices partagées de l’étude.

## 2. Démarrage retenu : un module à part, après le module principal

Le module est chargé par sa propre balise, placée juste après le module principal de chaque entrée (voir § 5). C’est l’option qui modifie le moins de fichiers existants : **deux** (`index.html` et `content-preview.html`, à modifier de toute façon pour la feuille), contre **quatre** pour un import à la fin de `welcome.mjs` — il faudrait aussi changer `welcome.mjs`, puis son identifiant de cache dans `index.html` et `content-preview.mjs`, puis celui de `content-preview.mjs` dans `content-preview.html`. Ce sont précisément les fichiers que l’autre session a modifiés deux fois dans la journée (`audit-fixes-145` puis `146`, aperçu 112 puis 113) : les éviter supprime le risque de conflit, et retirer la sélection revient à retirer quatre lignes.

Calendrier. `#main` et `#content-index` font partie du balisage statique des deux entrées : un module différé les trouve toujours. Dans `index.html`, `welcome.mjs` n’a pas d’attente au niveau supérieur ; le module de la sélection s’exécute donc juste après le code d’initialisation du contrôleur, au point exact où l’étude définissait son pont (l’étude ajoutait ensuite neuf imports dynamiques). Dans `content-preview.html`, `content-preview.mjs` attend l’import de `welcome.mjs` : la sélection démarre avant le contrôleur, et ses observateurs prennent son premier rendu (MutationObserver sur `#content-index`, note ajoutée à `#main` avant les ajouts du contrôleur). Mesuré dans les 27 vues : même ordre des enfants de `#main` qu’avec les essais (… `p#loading`, la note, puis `div.map-credit` ajouté à la création du globe), mêmes marques sur les pseudos. Le module démarre dès que les deux éléments existent ; s’ils manquaient (cas absent des deux entrées), il attend leur apparition ; il ne s’installe qu’une fois par page.

## 3. Avant d’appliquer

1. Attendre la fin du travail de l’autre session sur l’original, puis relire `index.html` et `content-preview.html` : chacun doit contenir une seule ligne `content-report.css?v=3` (dernière feuille) et une seule ligne de module principal (`welcome.mjs?v=…` ou `content-preview.mjs?v=…`, identifiant du moment). Les empreintes lues pendant la préparation sont dans [empreintes-sources.json](../checks/_integration-20261015/preparation/empreintes-sources.json) et dans les résultats de `etat_actuel.py` ; si les fichiers ont changé, appliquer les mêmes lignes aux mêmes endroits, puis refaire les contrôles du § 7.
2. Relancer `python3 -I studies/design-review-studies/checks/_integration-20261015/preparation/check_package_source.py` : `passed: true` attendu, et les deux empreintes ci-dessus.
3. Ne pas modifier le paquet pendant l’intégration. Toute retouche se fait dans `integration-20261015/` (ou dans les essais, puis `build_package.py`), suivie des contrôles, avant la copie.

## 4. Archiver d’abord l’état actuel

Modèle : [pre-codex-audit-fixes-20261015](../../../archives/site-versions/pre-codex-audit-fixes-20261015/README.md) (état 144), suivi par l’autre session pour [pre-audit-fixes-refinement-20261015](../../../archives/site-versions/pre-audit-fixes-refinement-20261015/README.md) (état 145).

**Le `snapshot.py` existant ne peut pas servir tel quel avec `--output`.** Il cherche son manifeste dans son propre dossier (`HERE`) : s’il le trouve, `source_bytes()` et `runtime_files()` passent en mode reproduction et recopient les octets conservés de l’archive. Lancé depuis l’archive 144 avec un nouveau `--output`, il reproduirait donc l’état 144, avec le préfixe de stockage, la date et l’objet de cette archive, codés en dur. Il se réutilise comme **modèle** :

```sh
A=archives/site-versions/pre-design-review-selection-20261015   # date du jour d’intégration
mkdir "$A" && cp archives/site-versions/pre-audit-fixes-refinement-20261015/snapshot.py "$A/"
# Dans "$A/snapshot.py", modifier seulement : la ligne 2 et l’exemple de la docstring, puis
#   STORAGE_PREFIX = 'horizon-archive-pre-design-review-selection-20261015-'
#   'purpose': 'Preserved active audit-fixes-146 state before the integration of the nine design-review trials selected on 15 October.'
python3 -I "$A/snapshot.py"            # dossier neuf, sans manifeste : lit les sources ACTIVES
python3 -I "$A/snapshot.py" --verify
```

Le dossier doit rester à la même profondeur (`archive/<nom>/`) pour que `REPO = HERE.parents[4]` reste juste. Essai à blanc fait le 15 octobre sur une copie du script hors du dépôt, puis effacé ([results-archive-dryrun.json](../checks/_integration-20261015/preparation/results-archive-dryrun.json)) : 137 fichiers, 11 adaptés, 12 192 538 octets, contrôleur `audit-fixes-146` capturé, 9 fichiers différents de l’archive 144, aucun ajouté ni retiré, 7 clés de stockage isolées avec le nouveau préfixe. Compléter comme les archives précédentes : `README.md` (état, identifiants de cache, liens vers `baseline/index.html`, `baseline/content-preview.html#explore` et une fiche avec commentaires), `snapshot-verification.json` avec le contrôle des références relatives internes à l’archive (même principe que `check_references()` de [snapshot.py de l’étude](../snapshot.py)) et le HTTP 200 des entrées. Aucun test n’étant modifié par l’intégration, `test-source-manifest.json` n’est pas nécessaire.

## 5. Appliquer

Ajouter les deux fichiers, à l’identique :

```sh
cp studies/design-review-studies/integration-20261015/design-review-selection.css site/
cp studies/design-review-studies/integration-20261015/design-review-selection.mjs site/
sha256sum site/design-review-selection.*   # empreintes du § 1
```

Puis deux lignes par entrée (identifiants des modules principaux tels que lus à 16 h 09) :

```diff
# site/index.html
   <link rel="stylesheet" href="content-report.css?v=3">
+  <link rel="stylesheet" href="design-review-selection.css?v=1">
   <script src="welcome.mjs?v=audit-fixes-146" type="module"></script>
+  <script src="design-review-selection.mjs?v=1" type="module"></script>
 </head>

# site/content-preview.html
   <link rel="stylesheet" href="content-report.css?v=3">
+  <link rel="stylesheet" href="design-review-selection.css?v=1">
   <script src="content-preview.mjs?v=113" type="module"></script>
+  <script src="design-review-selection.mjs?v=1" type="module"></script>
 </head>
```

La feuille doit rester la **dernière feuille** de chaque entrée, insérée par le parseur dans `<head>` : comme les feuilles des essais, elle bloque le rendu et les modules, si bien que le contrôleur, `detail-scroll`, `author-preview-fit` et l’arrivée mesurent déjà les nouvelles tailles.

**Identifiants de cache.** Convention des entrées : chaque ressource porte `?v=` ; une ressource nouvelle commence à `?v=1` (`theme-menu.css?v=1`, `scope-popover.css?v=1`, `campus-map-dialog.css?v=1`), et son identifiant augmente à chaque modification de son contenu, dans toutes les entrées qui la chargent. Ici : deux identifiants nouveaux, `design-review-selection.css?v=1` et `design-review-selection.mjs?v=1`. **Aucun autre n’augmente** : `welcome.mjs`, `content-preview.mjs` et les feuilles existantes ne changent pas, et les entrées HTML n’ont pas d’identifiant. Comme pour les passes uniquement CSS du 11 octobre, le contrôleur garde son numéro : l’état intégré se décrit « contrôleur `audit-fixes-146` inchangé + sélection CSS1/JS1 ». Ces numéros sont des itérations de cache, pas une version du projet (0.0.1 pré-alpha).

## 6. Ce qui ne doit pas changer

- Aucun autre fichier de `horizon-welcome/` : ni `welcome.mjs`, ni `content-preview.mjs`, ni les 37 feuilles existantes et leur ordre, ni les données, ni les tests, ni les archives et les preuves.
- `welcome-panels.html`, ancienne composition conservée, ne reçoit pas le paquet.
- L’étude reste intacte et consultable : `baseline/`, `originals/`, `essais/` (les dix essais non retenus compris), la galerie, `snapshot*`. Ne pas déplacer les essais : le paquet en est une copie.
- Ne pas fusionner le paquet dans les feuilles existantes, ne pas en changer les valeurs, ne rien ajouter au-delà des neuf essais. Les décisions explicites non touchées par la sélection restent : texte Royal Pink de Visiter et Créer un compte en sombre, couleurs de Se connecter et du retour Monde, etc.
- Le paquet n’écrit aucune clé de stockage ; aucune migration n’est nécessaire.

## 7. Contrôles après application

- **Tests**, depuis la racine du dépôt (commande du README) : `node --test site/*.test.mjs site/tests/*.test.mjs` — 62 fichiers (22 + 40) ; dernier relevé de l’autre session sur 146 : 660/660 ([20261015-audit-fixes-146-tests.json](../../../site/checks/20261015-audit-fixes-146-tests.json)). **Aucun test n’inspecte la liste des ressources des entrées** : aucun ne lit `index.html` ni `content-preview.html` ; quatre lisent le source de `welcome.mjs` (`content-pagination-history`, `map-independent-filter`, `profile-navigation-scope`, `project-team-routing`), inchangé ici ; `entrance.test.mjs` lit `entrance.mjs`, `theme-preferences` lit `theme-bootstrap.js`, les tests du globe lisent `integrated-globe.mjs`. Aucune mise à jour de test n’est attendue.
- **Références et HTTP** : nouveau relevé sur le modèle de `checks/20261013-animated-entry-references.py` (liste des identifiants attendus écrite en dur, à compléter avec les deux nouveaux) : +2 fichiers et +4 références par rapport au même parcours avant intégration ; les deux nouvelles URL en HTTP 200, identiques aux sources.
- **Chrome** : `INTEGRE=1 python3 -I studies/design-review-studies/checks/_integration-20261015/preparation/etat_actuel.py` compare l’original intégré, sans réécriture, à la copie avec les neuf essais, et relève la position de la feuille (dernière attendue) et le nombre de feuilles, de modules et de notes de la sélection (un de chaque attendu). Attendu, d’après les mesures du § 8 : identité au pixel près sauf le fond de « Créer un compte » en sombre, le panneau de tri ouvert vers le haut et le compte de l’écran d’erreur. Pour revoir les 27 vues, `equivalence.py` (étude) reste la référence du paquet.

## 8. Écarts entre la copie (état 144) et l’original actuel (146) sur les éléments des essais

Comparaison des sources : 9 fichiers diffèrent de la copie, aucun ajouté ni retiré. Une seule feuille change, `entrance.css` ; les deux entrées ne changent que par leurs identifiants de cache. Mesures dans Chrome sur trois côtés — copie + essais, original 146, original 146 + paquet injecté à la volée — sans modifier l’original ([results-etat-actuel.json](../checks/_integration-20261015/preparation/results-etat-actuel.json)).

| Correctif de l’original | Fichiers | Éléments des essais concernés | Résultat combiné mesuré | Ajustement |
| --- | --- | --- | --- | --- |
| **D3** fond encre de « Créer un compte » en sombre | `entrance.css` (`:root[data-theme=dark] [data-account-action=signup]{background:var(--h42-ink)}`) | même bouton : contour #708383 (visiter-contour-sombre), 16 px et rayon 12 px (echelle-unifiee) ; roles-couleur exclut ce bouton | fond #1B1B1B + contour + texte rose : **texte 4,51:1** (3,84:1 à 1440 px et 3,60:1 à 390 px sur le verre dans la copie avec les essais), contour 4,32:1 contre le fond et 3,63:1 (1440) ou 3,38:1 (390) contre le verre. Sans le paquet, le bord du bouton n’est qu’à 1,2–1,3:1 du verre. Seul écart de style avec la copie + essais : ce bouton (1 élément) | aucun |
| **D4** compte visible sur l’écran d’erreur de l’arrivée | `entrance.css` | menu du compte (échelle, lisibilité, contour) | le menu y reçoit les mêmes règles qu’ailleurs : texte 4,51:1, contour 4,32:1 et 3,78:1, aucune erreur ; surface absente de la copie 144 | aucun |
| **D2** panneau de tri des commentaires ouvert vers le haut, hors des commandes flottantes | `comments.mjs` (145 puis 146) | `.cp-control-panel` (rayon 20, ombre de niveau 2), options et déclencheur à 14 px | bouton placé bas à 390 × 844 : panneau ouvert vers le haut, hauteur complète (138 px), dans la fenêtre, sans chevauchement ; la copie 144 l’ouvrait vers le bas, tronqué à 12 px | aucun |
| **D1/D5** rotation des libellés de l’arrivée (focus clavier seul, `cycleLabels`) | `entrance.mjs`, `welcome.mjs` | `#entry-guest`, `#entry-login` (contour sombre, 16 px, rayon 12 px) | arrivée sombre 1440 : original + paquet **identique au pixel près** à la copie + essais ; boutons 153,61 × 52 px des deux côtés | aucun |
| identifiants de cache | `index.html`, `content-preview.html`, `content-preview.mjs`, `project-ui.mjs`, `journal-ui.mjs` | ancres des deux lignes à ajouter | — | suivre les identifiants du moment |

Autres vues avec le paquet sur 146 : menu du compte en clair identique au pixel près à la copie + essais. **Le paquet n’a pas besoin d’ajustement pour 145 ou 146** : D3 et l’essai règlent des propriétés différentes (fond pour l’un, couleur de bordure pour l’autre), donc indépendamment de l’ordre et de la spécificité ((0,3,0) et (1,2,0)). Proposition facultative, non appliquée : compléter le commentaire de la section visiter-contour-sombre pour signaler que, depuis le correctif D3, le contour de « Créer un compte » est aussi posé sur #1B1B1B. Proposition documentaire : la limite consignée avec la sélection (« Créer un compte » à 3,4–3,8:1) ne vaudra plus après l’intégration sur 146.

## 9. Documentation lors de l’intégration

Mettre à jour PROJECT_CONTEXT.md, BOARDING_JOURNAL.md (nouvelle entrée datée), le README anglais (fonctionnalités, état, contrôles ; version 0.0.1 pré-alpha inchangée), les notes de l’étude ([NOTES.md](../NOTES.md) : sélection intégrée, limite de « Créer un compte » levée par D3) et une note dans `horizon-welcome/` (fichiers ajoutés, lignes, archive, preuves). Les dix essais non retenus restent dans la galerie. Pas de commit ni de push sans demande.

## 10. Retour arrière

Retirer les quatre lignes des deux entrées et les deux fichiers ; ou rouvrir l’archive du § 4, qui reste consultable.

## Preuves de la préparation

Dans [checks/_integration-20261015/preparation/](../checks/_integration-20261015/preparation/) :

- [results-source.json](../checks/_integration-20261015/preparation/results-source.json) : règles identiques, cinq conditions et sept sélecteurs renommés à spécificité égale, logique du module, textes, absence de collisions.
- [results-equivalence.json](../checks/_integration-20261015/preparation/results-equivalence.json) et [results-bilan.json](../checks/_integration-20261015/preparation/results-bilan.json) : copie sans essai + paquet (réécriture des entrées comme au § 5) contre copie + neuf essais, **27 vues et 36 états** — Explorer avec le vrai globe (1440 × 900 clair FR, 1366 × 768 AR, 667 × 375 AR, 390 × 844 sombre), Projets 320 × 640 AR et 1440 avec globe, Profils grille et liste à 1440 et 340 px, Chroniques 390 sombre, fiche ft_transcendence onglet Commentaires (1440 clair FR, 390 sombre AR), profil de Leïla, dialogue Filtrer, menu du compte ouvert en sombre (1440 FR, 390 AR), arrivée claire et sombre, Awards FR/EN/AR et avec mouvement, bascules de langue et de thème sans rechargement (note Awards FR → AR → EN puis sombre ; pseudos des profils FR → AR, sombre, liste, grille, puis 340 px). Styles calculés de tous les éléments, propriétés propres aux essais, géométrie du globe, enfants de `#main`, pseudos et note **identiques partout**, aucune erreur de console. Pixels : 26 vues identiques ; Explorer 1366 × 768 AR diffère de 26 pixels dans le disque du globe (écart de 15 niveaux au plus), du bruit de rendu WebGL : la copie + essais chargée deux fois diffère de 29 pixels, la reprise essais/paquet de 0. Un pixel du menu sombre varie aussi d’un chargement à l’autre d’un même côté. Deux témoins négatifs (copie nue contre essais) détectent bien les écarts.
- [results-etat-actuel.json](../checks/_integration-20261015/preparation/results-etat-actuel.json) : état 146 avec et sans paquet (§ 8), original inchangé pendant chaque vue.
- [results-archive-dryrun.json](../checks/_integration-20261015/preparation/results-archive-dryrun.json), captures et planches (`captures/`, `planches/`).

Limites : Chrome sans interface, mouvements réduits sauf une vue Awards, formats émulés, globe bloqué hors des vues Explorer et Projets 1440, pas de téléphone physique ni de lecteur d’écran ; l’original pouvait encore évoluer après 16 h 33.
