# Vérification Figma d'Explorer — synthèse v6, fenêtre « Autour du campus » (18 octobre 2026)

**Périmètre.** Section `campus-window` : 4 cadres (ordinateur et mobile, clair et sombre ; pas de cadre arabe). Un vérificateur a relevé 2 défauts. Les planches v6 sont identiques à celles de v5 : la capture Figma v6 (18 oct., 00 h 36) est la même, octet pour octet, que la v5 (17 oct., 18 h 35), et les captures du site sont celles reprises le 17 à 19 h 45.

Pour recouper :
- les 4 planches et les agrandissements du vérificateur ont été rouverts : barre de périmètre, historique v3 à v6, contrôle croisé sur la fiche projet, réticule, crédits, cartes des écarts. Les mesures de la zone de la barre ont été refaites ;
- code relu : `dom2fig.py` (`build`, `build_one`, `order`, `zsort`, `pseudo_frame`), `render.js` (dégradés, `scrollBehavior`), `section_frames.py` et `layout.py`. Le relevé `dom/explorer/campus-window--desktop--fr-light` et les scènes ont aussi été examinés ;
- le correctif a été contrôlé à blanc (`v6/hoist_check.py`), puis sur la capture v7 parue pendant cette synthèse (`v6/campus-window-v7/`).

Travail en lecture seule : seuls `v6/` et ce fichier ont été écrits. Aucun outil Figma ni Chrome n'a été utilisé.

**Bilan.**
- 2 défauts confirmés, dus à une seule cause ; aucun écarté.
- Ils sont mineurs dans cette section, car la barre est sous le voile flouté. La même cause masquait pourtant la barre, nette cette fois, dans 89 scènes envoyées hors de la section.
- La session principale a appliqué le correctif pendant ce contrôle. Il est vérifié sur la capture v7 de la fenêtre. Reste l'envoi des autres zones.

## Défauts de la passe précédente (synthese.md, planches v5)

| § | Défaut | État en v6 |
|---|---|---|
| 1 | Globe Monde à la place du plan | **Corrigé**, 4 cadres. Plan des rues présent, en version sombre dans les clones ; carte à 2 niveaux près. |
| 6 | Réticule sans halo de 9 px ni anneau rose | **Corrigé**, 4 cadres. Halo de 69,4 px contre 69,5 sur le site. |
| 8 | Croix du réticule décalée de 1 px | **Corrigé** : traits à moins de 0,7 px, sous la résolution de l'export. |
| 8 | Verre du dock et du fil sans flou | **Non vérifiable.** Le dock est en bas du cadre (convention 3). Le fil est caché (défaut ci-dessous) sur ordinateur, sous la fenêtre sur mobile. |
| 9 | Séparateur du fil tourné | **Non vérifiable** : le fil n'affiche que « Monde ». |
| 11 | Crédits de la carte | **Conformes** : positions et largeurs identiques. |
| 13 | Creux du médaillon | **Non vérifiable** sous le voile. |
| — | Flèche de direction cachée sous le point | **Corrigé** : elle est retirée. |
| — | Emplacement du plan resté clair en sombre | **Corrigé** : le plan sombre est posé dans les clones. |

## Défaut confirmé (cause unique)

### 1. Barre de périmètre masquée par le fondu de l'en-tête — priorité 1

**Cadres.** Fenêtre « Autour du campus », Ordinateur · Clair et Ordinateur · Sombre. Régression de v5 (appel 783 du 17 oct. à 18 h 33, clone 784) : la barre est présente en v3 et v4.

**Constat** (planches v6, zone x 660–780, y 40–88) :

| Thème | Site | Figma | Pixels à plus de 12 niveaux | Tache « Monde » (site / Figma) | Autres manques |
|---|---|---|---|---|---|
| Clair | 158,5 / 159,7 / 159,6 | 160,8 / 163,1 / 163,1 | 11 % | 141,5 / 161,1 | — |
| Sombre | 35,3 / 35,3 / 36,8 | 26,2 / 26,2 / 26,2 | 26 % | 56,4 / 26,4 | anneau du médaillon |

Hors de la section, la pilule nette manque aussi : voir le contrôle croisé sur la fiche projet, `v6/campus-window/zoom/crosscheck-projects-project-scopebar.png`. Le défaut y est visible, voire bloquant.

**Cause** : `dom2fig.py`, `build_one()`.
- Depuis le correctif du 17 oct. au soir, `#app::after` est peint après les enfants de `#app` et garde son z-index. C'est le fondu fixe de l'en-tête : z-index 6, `Rôles/bg` opaque de 0 à 84 px, puis en dégradé jusqu'à 124 px.
- `zsort()` ne trie que des frères. « Après · Application » (6) passe donc au-dessus de « Principal » (`main`), qui reste au rang 0 : élément statique, il ne crée pas de contexte d'empilement. Or « Principal » contient la barre de périmètre (fixe, z-index 8, en 660,44 ; 40).
- Sur le site, ni `main` ni `#app` (relatif, z-index auto) ne créent de contexte d'empilement. La barre (8) est peinte au-dessus du fondu (6), sous l'en-tête (10) et sous le menu du bas (20).
- **Étendue.** 89 scènes régénérées depuis le 17 oct. à 18 h 29 et envoyées (appels 699 à 798) : Projets 35, Compte 19, Profils 18, Chroniques 11, Communs 5, Explorer 1. Avec leurs clones sombres, cela fait environ 160 cadres. Les 42 scènes plus anciennes peignaient le fondu en premier et ne présentent pas le défaut.

**Correctif** (`dom2fig.py`) : il a été écrit par la session principale pendant ce contrôle, le 18 oct. à 05 h 27, et il est conforme à la proposition du vérificateur.
- `stacking_context(n, par)` dit si un élément crée un contexte d'empilement. C'est le cas d'un élément :
  - fixe ou collant ;
  - positionné, ou enfant d'un conteneur flex ou grid, avec un z-index ;
  - d'opacité inférieure à 1 ;
  - avec `transform`, `filter` ou `backdrop-filter` ;
  - `dialog`.

  Les cadres des autres éléments reçoivent `_nsc`, retiré ensuite par `strip_z`.
- `hoist_z(ch)` s'exécute juste avant `zsort(ch)`, dans `build_one()` et à la racine. Il traite les cadres marqués `_nsc`, sans `_z` ni transformation (`tf`) :
  - il se déclenche quand un de leurs descendants à z-index doit passer au-dessus d'un frère, c'est-à-dire quand son z dépasse le z positif de ce frère, ou passe sous son z négatif ;
  - tous les descendants à z-index du cadre remontent alors au niveau des frères, coordonnées ajoutées, et sont triés avec eux ;
  - un cadre qui rogne ne cède que ses descendants fixes ;
  - un cadre vidé et sans peinture est supprimé.
- Ordre obtenu dans « Application » :
  1. Fond (−1) ;
  2. Contenu (5) ;
  3. Après · Application (6) ;
  4. Barre de périmètre (8) ;
  5. En-tête (10) ;
  6. Menu du bas (20).

  C'est l'ordre CSS du contexte d'empilement racine.

**Contrôles.**
- **À blanc** : `v6/hoist_check.py`, sur dom2fig `a3032046…`, résultat dans `v6/hoist_check.json`. Les 201 scènes des layouts ont été converties avec et sans `hoist_z` ; 131 changent.
  - Recouvrements dont l'ordre s'inverse : seulement deux.
    - Dans les 131 scènes, la barre (médaillon, verre, « Monde », chevron) passe au-dessus du fondu.
    - Dans « Menu à trois points d'un commentaire — Ordinateur · Clair » (Projets), le menu (absolu, z-index 6) passe au-dessus des réponses (`ol` statique). Le recouvrement n'est que de 1 px, et ce nouvel ordre est celui du site.
  - Seul cadre supprimé : « Principal », vidé dans les 131 scènes, sans effet visuel.
- **Dans Figma** : capture v7 du 18 oct. à 05 h 38, prise après les appels 887 et 888. L'appel 887 a recréé le cadre `359:2121`, qui compte 73 cadres au lieu de 74 ; l'appel 888 a recréé son clone sombre, `360:2121`. Planches dans `v6/campus-window-v7/`, agrandissements dans `v6/campus-window-v7/zoom/`.
  - Zone de la barre : au plus 6 niveaux d'écart avec le site, aucun pixel à plus de 12 niveaux.
  - Tache « Monde » : 141,2 contre 141,5 en clair, 56,2 contre 56,4 en sombre.
  - Ailleurs, les cadres ordinateur varient d'au plus 6 niveaux par rapport à v6 (moyenne inférieure à 2 niveaux) ; les cadres mobiles sont inchangés.
- **Conclusion : corrigé pour la fenêtre campus.**

**Reste à faire.**
1. Envoyer les appels 799 à 886 (scènes régénérées à 05 h 33).
2. Refaire les clones sombres.
3. Vérifier les zones concernées, en commençant par la fiche projet, où la barre est nette.

**Remarques sur le correctif.** Elles sont facultatives : aucune n'a d'effet aujourd'hui.
- `pull()` supprime un cadre vidé même quand son parent a un auto-layout ; les éléments suivants du flux se décaleraient alors. Aucun cas actuel : seul « Principal » est supprimé, et son parent n'a pas d'auto-layout. Il suffirait de garder le cadre vide dans ce cas.
- `stacking_context()` ignore `clip-path` (relevé sous `clip`), `mix-blend-mode` (`blend`), ainsi que `isolation` et `mask`, qui ne sont pas relevés. Aujourd'hui, un `clip-path` est déjà enveloppé dans un cadre qui rogne, que `hoist_z` ne traverse pas.
- Pour garder le calque « Principal », il suffirait de ne remonter que les descendants dont le z dépasse celui du frère croisé : la barre (8) et le menu du bas (20). Contenu (5) resterait dans « Principal », pour le même rendu.

## Écarts non comptés (limites connues)
- **Menu du bas, recherche et dé** : posés en bas du cadre (convention 3). C'est la principale zone d'écart sur ordinateur.
- **Bas de la fenêtre** : 15 px de la capture du site sont pris sous la fenêtre. Sur le site, le flou du voile s'arrête au bord de l'écran ; dans le cadre pleine hauteur, la page continue (limite 1).
- **Colonne extrême des cadres mobiles** : elle se mêle au blanc de la section à l'export.
- **Ombre de la fenêtre et halo de l'étiquette en sombre** : limite 4.
- **Anticrénelage** à l'échelle 0,704.

## Points à surveiller
- **Cadres mobiles de la fenêtre** : ils viennent toujours de la scène du 16 oct. (appels 385 et 429), où le fondu est peint en premier. Aucun écart sur la hauteur mesurée, et ils ne figurent pas dans les nouveaux envois.
- **« Fond » étiré à la hauteur de la page** : autre correctif du 18 oct., pour les causes K de Projets v4 et N de Chroniques v2. Son effet calculé sur la bande mesurée de la fenêtre est d'au plus 0,5 niveau ; en v7, hors de la barre, aucun écart ne dépasse 6 niveaux.
- **Verre, séparateur et creux du médaillon (§ 8, 9 et 13)** : à juger sur un écran où la barre est nette, pas sous le voile.

## Limites
- Aucun outil Figma n'a été utilisé. Le rendu v7 n'est connu que par la capture de section, et le contrôle à blanc porte sur les scènes.
- Le dépôt a changé pendant ce contrôle :
  - `dom2fig.py` à 05 h 27, puis à 05 h 31 (polices des symboles, sans lien avec ce défaut) ;
  - scènes et appels à 05 h 33 ;
  - appels 887 et 888 envoyés à 05 h 37 et 05 h 38.

  Cette synthèse décrit l'état à 05 h 40 (UTC).
- `PROJECT_CONTEXT.md`, le journal et le README ne sont pas mis à jour, conformément à la consigne de lecture seule.
