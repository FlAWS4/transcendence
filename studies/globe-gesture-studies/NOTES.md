# Commandes discrètes du globe — 13 octobre 2026

## Demande et statut

L’utilisateur souhaite revoir les commandes du globe : elles occupent trop de hauteur sur mobile et leur position varie avec le texte voisin sur ordinateur. Après les [deux premiers placements](../globe-control-placement/index.html), il demande des idées pour disposer des boutons « sans les avoir », puis des essais concrets. Il précise explicitement qu’il faut garder l’accessibilité en tête.

Cette collection propose **trois essais locaux indépendants**, raccordés au vrai globe et aux contenus fictifs du prototype. **Retour explicite du 13 octobre : aucun des trois essais ne plaît à l’utilisateur ; il reporte le sujet à plus tard.** Aucune variante n’est intégrée à l’interface active. Le projet reste en **0.0.1 pré-alpha** ; le numéro d’un essai ne change pas la version du projet. Les propositions initiales, le prototype courant et leurs sources restent conservés.

## Ouvrir et comparer

La [galerie des trois essais](index.html) est l’entrée commune. Servir le dépôt avec le serveur local existant, puis ouvrir `/studies/globe-gesture-studies/`.

| Essai | Interaction proposée | Accès direct |
| --- | --- | --- |
| **01 — Gestes directs** | Glissement, molette ou pincement sur le globe. Le petit globe du filtre devient le retour au Monde. Un accès discret ouvre les commandes complètes. | [Essayer 01](baseline/content-preview.html?variant=1#explore) |
| **02 — Un halo à découvrir** | Une poignée épouse le bord du globe. Le survol, le focus ou un clic/toucher ouvrent les commandes disposées en arc. | [Essayer 02](baseline/content-preview.html?variant=2#explore) |
| **03 — Sous le doigt** | Un appui prolongé sur une zone libre ouvre les commandes près du point de contact. Relâcher puis choisir reste possible ; le glissement vers une action est un raccourci supplémentaire. | [Essayer 03](baseline/content-preview.html?variant=3#explore) |

Le texte de situation du globe est placé séparément des commandes. Le bouton **Essai · Mode d’emploi** décrit la variante et permet de revenir au comparatif. La commande **Toujours afficher les commandes** est disponible dans ce mode d’emploi et dans le panneau. Les trois variantes partagent ce choix dans un stockage réservé à l’étude.

## Accessibilité prévue dans les essais

Les gestes restent **facultatifs**. Chaque variante conserve un bouton accessible par simple clic ou toucher, avec zoom avant/arrière, retour au Monde et **quatre flèches cliquables** pour déplacer la vue sans glisser. L’alternative au pincement n’est donc pas un autre geste complexe. L’accès au clavier complète les actions par pointeur : Tab pour parcourir les commandes, flèches lorsque le globe a le focus, `+`/`−` pour zoomer, `Début` pour revenir au Monde et Entrée pour ouvrir le panneau.

L’option d’affichage permanent permet de garder les commandes visibles sans mémoriser les gestes. Le halo peut être rejoint avec le clavier ou activé au toucher ; son contenu doit rester disponible pendant son utilisation. Échap et le bouton de fermeture ferment le panneau avec restitution du focus. Les commandes masquées sont retirées du parcours ; leur nom accessible et leur état ouvert/fermé sont explicites. Les libellés de l’étude suivent les trois langues du prototype, français, anglais et arabe.

Les nouvelles actions visent des cibles d’au moins **44 × 44 pixels CSS**, un focus visible et des surfaces lisibles. Cette dimension est un choix de confort correspondant au critère **renforcé** WCAG 2.5.5, et ne doit pas être présentée comme le minimum AA. Les animations de panneau sont désactivées lorsque `prefers-reduced-motion` demande moins de mouvements ; le globe conserve aussi son traitement existant de cette préférence.

L’appui prolongé est un raccourci annulable : un mouvement ordinaire avant reconnaissance doit rester disponible pour tourner la carte ; l’arrivée d’un deuxième doigt, l’annulation du pointeur, Échap ou une perte de visibilité doivent abandonner l’action. Les gestes cartographiques sont suspendus pendant l’appui reconnu, puis rétablis lorsque leur état le permet. Ces intentions et dispositions de code nécessitent les contrôles d’interaction consignés ci-dessous : elles ne constituent pas à elles seules une déclaration de conformité.

## Références de conception

Références W3C consultées le **13 octobre 2026** :

- [WCAG 2.5.1 — Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html) : fournir une alternative à pointeur simple aux gestes multipoints ou dépendants d’un tracé.
- [WCAG 2.5.7 — Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) : permettre les actions sans glissement ; une alternative uniquement au clavier ne couvre pas ce besoin. Le document cite les quatre boutons directionnels d’une carte comme exemple.
- [WCAG 1.4.13 — Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) : le contenu révélé au survol/focus doit pouvoir être fermé, survolé et rester disponible selon les conditions du critère.
- [WCAG 2.5.5 — Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) : repère de 44 × 44 pixels CSS, niveau AAA et exceptions du critère.

## Sources et conservation

Le [socle et ses adaptations](SNAPSHOT.md) décrivent les **136 fichiers locaux figés** et les **11 originaux adaptés**. Le [manifeste](snapshot-manifest.json) conserve les empreintes avant/après adaptation ; [snapshot.py](snapshot.py) contrôle ces empreintes et prépare une copie dans un nouveau dossier sans écraser une ancienne étude. Le contrôleur et le moteur actifs sous `horizon-welcome/` ne sont pas modifiés.

Les interactions spécifiques résident dans [study.mjs](study.mjs), [study.css](study.css) et [press-gesture.mjs](press-gesture.mjs). La galerie utilise [index.html](index.html) et [gallery.css](gallery.css). Les préférences, favoris, commentaires, signalements et liens de dépôt du socle ont des clés réservées aux essais ; l’option de commandes permanentes utilise également sa propre clé. Aucun compte réel ni publication distante n’est créé.

## Vérifications réalisées

Le socle conserve **136 empreintes de source**, **11 originaux adaptés**, la syntaxe de **64 fichiers JavaScript** hors bibliothèques et **120 références relatives** sans manque ; [preuve du snapshot](snapshot-verification.json). Le contrôle des empreintes est rejoué après les essais. Les sources fonctionnelles du prototype actif ne sont pas modifiées.

- **29 tests unitaires** du reconnaisseur d’appui passent : attente, déplacement, plusieurs pointeurs, capture, annulation, clic synthétique, clavier, destruction et distinction entre perte de focus d’un élément et de la fenêtre. Commande : `node press-gesture.test.mjs`.
- **22 relevés Chrome** passent sur les trois variantes : galerie responsive, vrai globe chargé, zoom et déplacement par clic, Échap/focus, ouverture clavier, affichage permanent, retour Monde, guide, changement de rubrique, halo au clic/survol après resize, appui immobile sans action, annulation pendant maintien, rotation ordinaire et sélection par glissement. Arabe320px et paysage sont inclus. [Résultats et empreintes](checks/browser-results.json), [script](check-browser.py).
- **12 relevés tactiles Chrome** passent : appui répété au même endroit, caméra inchangée lors du simple relâchement, rotation native, second doigt avant/après reconnaissance, zoom au toucher et accès clavier. Le retour galerie → précédent utilise réellement le cache arrière/avant du navigateur ; l’appui fonctionne encore. [Preuve](checks/touch-results.json), [script](checks/check-touch.py).
- **11 relevés complémentaires** passent : cibles visibles mesurées d’au moins44×44px, animation désactivée avec mouvements réduits, français/arabe320px sans débordement horizontal, masquage pendant le compte, sombre, paysage, libellés anglais, noms dans l’arbre d’accessibilité Chrome et option permanente conservée après rechargement. [Preuve](checks/accessibility/browser-results.json), [script](checks/check-accessibility.py). Le contrôle de l’arbre ne remplace pas un lecteur d’écran.

Les captures de la galerie, des panneaux ordinateur/mobile, de l’appui, de l’arabe sombre320px et du paysage ont été examinées. En petite hauteur, le panneau peut défiler pour conserver l’accès à toutes ses commandes. Aucune erreur JavaScript relevée dans les scénarios finaux.

La revue et les essais ont fait corriger : action involontaire au relâchement immobile, annulation incomplète par Échap, ressources détruites lors d’un retour en cache, réarmement du survol et position transitoire du halo après resize, annulation souris due au blur d’un bouton, et rangée de zoom héritée verticale en paysage. Les états initiaux, scripts et preuves de diagnostic restent dans `archive/` et `checks/` ; ce sont des traces intermédiaires, pas des variantes approuvées. Les premiers placements restent [consultables séparément](../globe-control-placement/index.html). La galerie est la dixième collection du [registre des recherches](../research-archive/index.html).

Ces contrôles utilisent Chrome isolé et des formats/touches émulés. Aucun téléphone physique, lecteur d’écran réel, audit exhaustif WCAG ou nouvelle vérification des rues distantes n’est revendiqué. Le rendu de toutes les rubriques héritées du socle n’est pas rejoué ; cette étude porte sur les commandes du globe. Les rues détaillées d’un campus dépendent toujours du service cartographique distant ; le globe Monde et ses données locales sont conservés dans le snapshot.

**Suite réellement demandée :** sujet reporté à plus tard par l’utilisateur. Conserver les essais et attendre une nouvelle demande ; ne pas lancer de nouvelle variante ni d’intégration.
