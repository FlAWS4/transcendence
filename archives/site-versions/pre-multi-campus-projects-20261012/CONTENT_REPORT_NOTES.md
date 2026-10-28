# Signalements de contenu — 11 octobre 2026

L’utilisateur demande de pouvoir signaler un article, un projet et un profil depuis leur fiche, puis un commentaire depuis son menu. Un bouton **Signaler**, avec drapeau et nom accessible précisant la cible, rejoint les actions de chaque fiche dans le prototype actif. Le menu vertical **⋮** des commentaires/réponses propose la même action.

Le dialogue partagé affiche le titre ou le texte du contenu ciblé, un motif obligatoire et des précisions facultatives limitées à1000 caractères. Six motifs sont proposés par l’assistant : spam, harcèlement, contenu haineux ou violent, vie privée, usurpation d’identité, autre. Cette liste est un choix d’interface à essayer, pas un règlement de modération accepté. Français, anglais, arabe RTL et couleurs du thème sont raccordés. Le dialogue natif gère la modalité ; Annuler, fermer, Échap et clic sur le fond ferment avec retour du focus. Un changement de fiche nettoie le dialogue sans conserver de commande détachée.

**Démonstration locale :** le formulaire indique que rien n’est envoyé à une équipe de modération. La confirmation parle d’un signalement enregistré dans la démonstration. Les données sont stockées dans sessionStorage (`horizon-content-reports-v1`,200 signalements maximum), avec repli mémoire si ce stockage échoue. Un second signalement de la même cible montre son état déjà enregistré. Une cible commentaire comprend son type de contenu parent, son identifiant et l’identifiant du commentaire, pour ne pas confondre deux discussions. Le texte saisi reste du texte et ne crée pas de balisage. Fermer avant enregistrement ne conserve pas le brouillon du signalement.

Ce prototype n’implémente ni envoi serveur, identité réelle, file de modération, sanction ni suppression automatique. L’électorat ou les droits Awards ne sont pas concernés. Les droits réels de signalement, le traitement administratif et le règlement restent à définir lors du travail sur l’application.

Sources : [module partagé](content-report.mjs), [styles](content-report.css), raccord dans [Projet/Chroniques](project-ui.mjs) et [Profils](profile-ui.mjs). [Sources précédentes conservées](archive/pre-content-reporting-20261011/README.md). Les deux entrées chargent CSS2/module2 via ProfilUI26 et ProjetUI28/JournalUI27 ; contrôleur `community-actions-117`, aperçu85.

Les11 cas de [content-report.test.mjs](tests/content-report.test.mjs) passent : identité des cibles, stockage/rechargement, données invalides, panne de stockage, doublons, motif requis, borne de texte, texte littéral, traductions, annulation, remplacement et fermeture au nettoyage. Les interactions sont jouées au DOM simulé ; revue indépendante du module et du raccord sans défaut concret. Aucun parcours ni rendu navigateur nouveau n’est revendiqué, CUA restant indisponible. Les anciens contrôles visuels des fiches restent datés séparément. Projet en0.0.1 pré-alpha, sans publication ni nouveau Figma.


## Précision suivante — mêmes dimensions que Favoris

L’utilisateur demande que **Signaler respecte les dimensions de Favoris**, sauf si son texte ne rentre pas à la même taille. Les deux boutons partagent maintenant la hauteur minimale, la police, la taille de l’icône, les marges intérieures et l’écart icône/texte, y compris les densités compactes des fiches. La largeur du libellé Favoris courant sert de minimum via un étalon invisible, non annoncé par le lecteur d’écran ; le libellé Signaler peut agrandir son seul bouton. Les couleurs restent propres à chaque action. [Premier bouton conservé](archive/pre-report-button-sizing-20261011/README.md). CSS contrôles14, Profils22, Projets6 et défilement6 ; revue de cascade effectuée sans égalité géométrique mesurée en navigateur.

À sa question sur les usages professionnels, l’assistant distingue les boutons adaptés au texte et les groupes à largeur uniforme. [Carbon d’IBM](https://www.carbondesignsystem.com/building-blocks/core/components/button/guidelines#button-width-in-button-groups), consulté le11 octobre, décrit les boutons dont le libellé détermine la largeur et recommande le plus long libellé pour uniformiser un groupe lié. Pour ces actions indépendantes, l’assistant recommande la base commune avec extension individuelle déjà demandée ; ce conseil ne constitue pas une nouvelle décision de l’utilisateur.


## Dernière précision — Signaler avant Explorer

L’utilisateur demande d’inverser Signaler et Explorer dans les fiches Projet et Chroniques. Leur rendu partagé crée maintenant les actions dans l’ordre **Favoris → Signaler → Explorer le campus**, ce qui fixe aussi l’ordre clavier et l’ordre logique RTL. La fiche Profil conserve son organisation. [Ordre précédent archivé](archive/pre-report-explore-order-20261011/README.md). Contrôle de l’ordre de construction, syntaxe et références des modules effectués ; aucune nouvelle simulation d’interaction nécessaire pour ce déplacement. Rendu navigateur toujours indisponible.


## 11 octobre — Contour visible en mode clair

L’utilisateur signale une moindre visibilité puis précise qu’il parle **du contour**. Cause relevée dans la cascade : Signaler héritait du bord de verre blanc à72% d’opacité, alors que son fond, son ombre et son flou sont retirés. Ce blanc se distinguait peu de la page claire.

Correction limitée à `:root[data-theme=light] .cp-report-trigger` : couleur de bordure issue du token existant `--h42-color-input-border` (**#AFBFBE**). Épaisseur1px, dimensions, texte, icône et mode sombre conservés. Applicable aux fiches Profil, Projet et Chroniques. Les deux entrées chargent `content-report.css?v=3` ; contrôleur119/aperçu87 inchangés. [Trois sources précédentes archivées](archive/pre-light-report-border-20261011/README.md).

Cascade relue avec revue indépendante, diff limité au contour et imports ; trois empreintes d’archive vérifiées. La feuille CSS répond HTTP200 et sa réponse correspond exactement au fichier local. Aucun test d’interaction ajouté pour ce changement de couleur ; rendu navigateur non examiné, CUA restant indisponible.
