# 42 Awards — cadrage et état du prototype

## Trois interfaces de test — suite du 8 octobre 2026

À la demande explicite **« Tu peux construire des interfaces pour tester »**, trois propositions sont réalisées dans une [galerie séparée](../../studies/awards-studies/index.html) : **01 Vue d’ensemble**, **02 Sommaire latéral**, **03 Éditions à explorer**. Elles reprennent les cinq rubriques, les parcours de candidature, vote campus/Monde, calendrier, historique et Règlement (Participation / Vote / Résultats). La page Awards de l’aperçu principal demeure vide avec son en-tête et son dock ; aucun choix ni intégration d’une de ces variantes n’est déduit.

Compte Paris ou visiteur, quatre dates simulées, données fictives, thèmes et adaptation mobile ; les actions restent en session locale séparée par variante. Les autres campus se consultent sans droit de vote, aucun dépôt direct au Monde et qualifications issues d’éditions locales déjà terminées. Le barème et les modalités d’essai sont signalés comme non adoptés. Galerie, sources et dépendances conservées ; neuvième collection du registre. **10 tests du modèle passent**, parcours et rendus Chrome ordinateur/320px contrôlés, corrections de navigation/focus et d’un débordement de carte vérifiées. Français seulement, sans compte, vote, candidature, serveur, report Figma ou publication réels. [Données, réalisation, vérifications et limites](../../studies/awards-studies/NOTES.md). Version **0.0.1 pré-alpha** maintenue.

## Cadrage fonctionnel — 8 octobre 2026

**Origine :** l’utilisateur veut désormais définir le contenu de la page principale Awards et invite l’assistant à proposer des idées complémentaires. Les besoins ci-dessous précisent la suite de la page vide demandée le 7 octobre. **État au moment de ce cadrage : documentaire seulement. Les études interactives réalisées ensuite sont décrites en tête ; la page Awards active reste vide.**

### Demandes explicites

- Retrouver l’historique des Awards de chaque campus individuellement, ainsi que celui des Awards Monde.
- Voir les Awards de son campus en cours et consulter ceux des autres campus, sans pouvoir voter dans les éditions des autres campus.
- Voir les Awards Monde et pouvoir y voter pendant leur période de vote.
- Disposer d’une section pour participer en soumettant des projets dans les catégories choisies.
- Voir les périodes de participation et les dates importantes, notamment l’annonce des résultats.
- **Précision suivante du 8 octobre :** après un retour favorable sur la proposition, l’utilisateur demande une section expliquant les conditions de **participation, de vote et de résultats**. L’assistant propose le nom **Règlement** et son accès comme cinquième rubrique ; cela ne fixe pas les règles détaillées encore ouvertes.
- **Précision explicite dans la même conversation :** l’utilisateur choisit **« Lauréats des campus qualifiés »** pour accéder aux Awards Monde. La candidature commence au niveau campus ; il n’y a pas de candidature directe au Monde. Le rythme annuel et les modalités de qualification par édition/catégorie ne sont pas fixés par cette réponse.

**Interprétation proposée :** le vote local est ouvert dans son propre campus, pendant la période prévue. La restriction « on ne peut pas voter » est comprise comme concernant les autres campus. Le campus d’appartenance du compte doit être distinct du campus consulté ; sélectionner un autre campus ne confère aucun droit. Les statuts éligibles, les changements de campus et les équipes réunissant plusieurs campus restent à définir.

### Organisation proposée par l’assistant

Conserver le dock global et l’en-tête actuels. La proposition initiale à quatre rubriques est complétée, à la demande suivante de l’utilisateur, par une section explicative : **Vue d’ensemble · Participer · Calendrier · Historique · Règlement**.

1. **Vue d’ensemble.** En tête, deux espaces identifiés : **Mon campus** et **Monde**, chacun avec son édition, sa phase, la prochaine échéance et l’action adaptée : participer, découvrir les candidats, voter ou voir les résultats. L’édition mondiale devient plus visible lorsqu’elle est active. Sans compte, proposer Monde et le choix d’un campus sans prétendre connaître le campus personnel. Une zone **Autres campus** permet de parcourir leurs éditions en cours par pays/campus, avec « Consultation uniquement · vote réservé à ce campus ». Le prochain rendez-vous, un accès aux candidatures personnelles et un aperçu des dernières éditions complètent la page.
2. **Participer.** Réutiliser un projet du portfolio Horizon ou passer par sa création, choisir l’édition de son campus puis une ou plusieurs catégories, compléter la présentation utile au concours et vérifier l’équipe. Prévoir brouillon, aperçu et récapitulatif avant soumission. **Mes candidatures** montre les catégories, le statut, les éventuelles corrections demandées et l’échéance. Les lauréats concernés reçoivent l’état **Qualifié pour les Awards Monde**, avec un accès à l’édition mondiale correspondante lorsqu’elle est connue ; aucun formulaire de candidature directe au Monde. Les droits de soumission au nom d’une équipe et de modification après envoi restent à fixer.
3. **Calendrier.** Pour chaque édition, afficher ouverture/clôture des candidatures, ouverture/clôture des votes, annonce des résultats et cérémonie si elle existe. Montrer les dates absolues avec heure et fuseau, même si un compte à rebours est proposé. Chaque campus peut avoir son calendrier ; ne pas supposer des éditions synchronisées ni inventer des dates. Une date non publiée reste « À annoncer ».
4. **Historique.** Filtres **Monde ou campus précis · année · édition · catégorie** ; conserver l’accès à chaque édition, ses lauréats, ses projets et équipes, ainsi qu’au règlement appliqué à cette édition. Ne pas réduire l’histoire d’un campus à un résultat mondial agrégé. Un campus sans édition publiée reçoit un état vide explicite, sans fausse archive.
5. **Règlement.** Section explicative organisée en **Participation · Vote · Résultats**, disponible avant toute action. Afficher clairement l’édition et le périmètre concernés (campus ou Monde), avec un accès direct à la bonne partie depuis la candidature, le vote et les résultats. Garder la version applicable dans l’historique de chaque édition.

Contenu à expliquer dans cette rubrique, une fois les modalités définies :

- **Participation :** qui peut participer, projets et catégories admissibles, conditions pour les équipes, campus de rattachement, nombre de candidatures autorisées, éléments à fournir, délais et possibilités de modification ou de retrait. Expliquer le passage des lauréats locaux vers les Awards Monde, sans candidature mondiale directe, conformément au choix déjà confirmé.
- **Vote :** qui peut voter et dans quelles éditions, dates d’ouverture/clôture, nombre de choix, éventuel barème, validation et modification du vote, règles concernant son propre projet ou son campus au Monde. Distinguer explicitement cette dernière question du vote dans les éditions locales des autres campus, déjà exclu.
- **Résultats :** méthode de calcul et de classement, traitement des égalités, vérification des résultats, date et mode d’annonce, distinctions éventuelles et qualification mondiale des lauréats locaux. Les valeurs du barème, le départage et les récompenses restent à définir ; leur présence dans la rubrique n’en fait pas des décisions prises.

Présentation proposée : un résumé lisible des règles applicables, puis les détails de ces trois parties. Éviter une FAQ comme seul accès aux conditions ; une FAQ pourrait compléter la rubrique. Le besoin d’explication est explicite, tandis que le nom, l’agencement et les liens contextuels sont des propositions de l’assistant. La réponse favorable ne constitue pas une acceptation de toutes les idées additionnelles ni d’un règlement chiffré. Mise à jour documentaire seulement, sans modification du prototype.

La fiche d’une édition pourrait reprendre le sommaire déjà utilisé dans Horizon : **Présentation · Catégories et projets · Calendrier · Résultats · Règlement**. Sur mobile, conserver le sélecteur local et le dock global ; FR/EN/AR, RTL et thèmes restent les exigences du projet. Aucun nouvel agencement n’est encore choisi par l’utilisateur.

### Consultation, vote et phases

| Situation | Comportement proposé | Statut de la règle |
| --- | --- | --- |
| Son campus, vote ouvert | Consulter les projets et voter si le compte est éligible. | Vote local déduit du contexte, éligibilité précise ouverte. |
| Autre campus, vote ouvert | Consulter les projets ; expliquer pourquoi le vote est indisponible. | Restriction explicitement demandée. |
| Monde, vote ouvert | Consulter les projets et voter si le compte est éligible. | Vote explicitement demandé ; électorat exact à définir. |
| Visiteur sans connexion | Consulter ; inviter à se connecter pour participer ou voter. | Proposition de l’assistant, à distinguer du sens encore ouvert de « visiteur ». |
| Candidatures campus ouvertes | Participer si éligible ; afficher la date de clôture. | Période demandée, mécanisme détaillé proposé. |
| Votes clos, résultats attendus | Consultation ; date d’annonce et état « Résultats à venir ». | Proposition, sans délai arbitraire d’un jour. |
| Édition terminée | Consulter les résultats publiés et l’archive ; aucun vote ni dépôt tardif. | Proposition de fonctionnement. |

Une édition possède son propre état. Les actions doivent dépendre de cet état et des droits du compte, pas du filtre géographique. Dans une future application, ces contrôles devront aussi être effectués côté serveur ; aucun contrôle réel de permissions n’existe dans le prototype actuel.

### Idées complémentaires proposées, sans acceptation déduite

- **Suivre une édition** et choisir des rappels avant clôture des candidatures, clôture des votes et publication des résultats ; proposer aussi l’ajout au calendrier.
- **Préparer son vote** : garder une sélection personnelle de projets à comparer et montrer sa progression par catégorie, avec un récapitulatif avant validation. Le nombre de choix et la possibilité de changer son vote ne sont pas encore fixés.
- **Masquer les scores avant l’annonce**, pour éviter que le classement provisoire oriente les choix ; varier l’ordre de découverte des projets. Ce sont des propositions, pas une garantie d’équité.
- **Relier les distinctions** aux projets et à tous leurs auteurs, avec édition/catégorie/campus ou Monde clairement indiqués et un lien vers les résultats. Distinguer participation, nomination et prix remporté.
- **Préserver la version présentée au concours**, afin que l’archive et les votes renvoient à la même candidature même si le portfolio évolue ensuite.
- **Catégories à discuter** : meilleur projet, interface/expérience utilisateur, innovation technique, documentation/transmission et impact utile. Séparer ces catégories de récompense des types de projets du cursus ; elles peuvent varier selon les éditions.

### Règlement encore ouvert et intentions historiques

Le journal du 9 septembre envisageait des éditions locales tous les deux mois, une finale mondiale annuelle réservée aux lauréats, un projet par personne et catégorie (participations collectives comprises), trois choix pondérés 3/1/0,5, des résultats le lendemain et une possible interdiction de voter pour son campus au Monde. **La qualification mondiale des lauréats locaux est maintenant confirmée explicitement le 8 octobre ; les autres éléments restent des idées historiques, ni tous validés ni tous annulés par cette demande.**

La restriction sur les **éditions des autres campus** est distincte d’une éventuelle restriction sur les **candidats de son campus dans une édition Monde**. Ne pas les confondre. À la question ciblée sur l’accès au Monde, l’utilisateur retient la qualification des lauréats locaux ; la proposition alternative de candidature directe n’est pas retenue.

Restent aussi à définir : catégories finales, fréquence, électorat (Cadets/Transcenders/alumni/etc.), campus de référence lors d’un transfert, équipes de plusieurs campus, limites de candidature, auto-vote, barème, modification des votes, égalités, contrôle des candidatures et récompenses. Ces points ne bloquent pas la proposition d’organisation ; ils devront être réglés avant un vote réel.

### Vérification et suite

Sources confrontées : `PROJECT_CONTEXT.md`, `IDEA.md`, journal initial et suites récentes, cette note, `welcome.mjs`, `awards.css` et les études connectées séparées. Le contrôleur et le CSS actifs confirment la page vide ; les candidatures et votes des études connectées restent des simulations non intégrées. Vérification documentaire et liens locaux uniquement pour cette suite, sans nouveau contrôle navigateur, test fonctionnel, modification Figma, commit ou publication. Version **0.0.1 pré-alpha** inchangée. La suite du travail porte sur la conception du contenu Awards ; cette proposition ne constitue pas encore le choix d’une maquette ni d’un règlement.

## Entrée initiale — 7 octobre 2026

**Mise à jour du 8 octobre 2026 :** l’utilisateur choisit la piste **08 — Cascade de lettres** pour le passage HORIZON ↔ AWARDS. Elle remplace le mécanisme aléatoire décrit ci-dessous, qui reste un état historique du 7 octobre. [Raccord courant et vérifications](BRAND_WORDMARK_NOTES.md), [ancien rendu consultable](../../archives/site-versions/pre-cascade-wordmark-20261008/preview.html). Les preuves anciennes ci-dessous ne sont pas celles de la cascade.

L’utilisateur demande un bouton cliquable dans le menu principal et une page volontairement vide, avec seulement l’en-tête et le menu. Il demande aussi de transformer HORIZON en AWARDS avec l’animation aléatoire de la connexion. À sa question sur le singulier/pluriel, l’assistant recommande **42 Awards**, pour l’ensemble des récompenses ou l’événement ; « award » désigne un prix précis. Le prototype courant est uniformisé au pluriel. Cela ne fixe aucun règlement ni contenu de l’événement.

## Réalisation

- Cinquième bouton avec trophée dans les deux entrées web, après Le journal ; route `#awards`. Libellés français/anglais «42 Awards», arabe «جوائز 42».
- La page garde le fond, le logo, langue/thème/compte et le dock. Aucun titre, carte, formulaire, vote, candidature ou contenu provisoire n’est ajouté. Filtre, carte, crédits, recherche, dé et note de prototype sont masqués. Le canvas et son ancrage conservent leurs dimensions ; le même globe est restauré en quittant Awards.
- La route ferme les panneaux en cours, rend les régions masquées inertes et place le focus sur le bouton Awards. Les transitions de contenu éditorial ne tournent pas pour cette page. L’entrée principale reste jouée avant d’ouvrir un lien direct Awards.
- HORIZON devient AWARDS, puis redevient HORIZON à la sortie. Alphabet et 42 rotations inverses du message de connexion, permutation seed 42 du n°22 importée directement. Durée proposée de 1,6 s, fixation aléatoire entre 1,1 et 1,6 s ; symbole42 inchangé. La ligne arabe أفق est masquée dans Awards, car elle désigne Horizon, puis retrouve sa règle habituelle ailleurs. [Module et réglages](BRAND_WORDMARK_NOTES.md).
- **Précision suivante de l’utilisateur :** le N restait fixe dans le premier essai. Il participe désormais aux caractères brouillés dès le début, puis disparaît progressivement entre 1,1 et 1,6 s. Sept cellules pendant le brouillage, six à la fin ; retours rapides protégés. Ce premier état est archivé.
- Dock élargi à 636 px maximum pour conserver des boutons lisibles ; affichage compact jusqu’à 560 px de conteneur. Cinq positions de pastille corrigées en LTR/RTL. À 320 px, boutons inactifs de 44 px et actif environ 98,67 px : «42 Awards» reste entier. Le nom arabe long des profils peut être ellipsé à ce format, tout en conservant son nom accessible complet.

## Vérifications

Chrome ordinateur 1920×1047 : Awards vide, mot final exact, retour Explorer avec le globe, passage vers Projets et Profils, recherche Paris avec 4 résultats puis fermeture. Un état brouillé du retour vers HORIZON a été examiné en capture. Après la correction du N, lecture du DOM pendant le mouvement : sept caractères actifs, le dernier devenu «3» avec opacité 1 ; puis six cellules et AWARDS à l’état final.

Chrome 320×640 : page Awards en français clair et arabe sombre examinée, aucun débordement horizontal, pas de défilement de la page vide. Pastille alignée avec le bouton actif des deux côtés, largeur 98,67 px ; le libellé français mesure 62 px et reste entier. Retour vers Profils RTL joué, HORIZON rétabli. À 500×700, dock de 468 px et mode compact vérifiés par mesure. Format habituel, français et clair rétablis.

Lien direct `content-preview.html#awards` rechargé : page vide et AWARDS, un canvas 2880×1570 conservé malgré son masquage. Entrée principale `index.html#awards` puis Explorer en visiteur jouée : arrivée sur la page vide, focus sur 42 Awards, AWARDS en six lettres, un canvas, hauteur de page égale au viewport de 991 px. Les deux tentatives de capture finale de cette entrée ont expiré ; son état a été vérifié dans le DOM et l’arbre accessible, avec les captures de l’aperçu direct examinées auparavant.

Sept tests du mot-symbole passent (rotations/résolution, métriques, lettre sortante et effacement tardif, interruptions, mouvement réduit, visibilité, resize et nettoyage). Les fichiers de tests recherche/défilement du dock et transitions de contenu passent aussi. Revue indépendante du contrôleur, du focus et du CSS sans défaut concret relevé.32références locales dans chacun des deux HTML valides ; neuf empreintes SHA-256 de l’archive initiale vérifiées.

Pas de téléphone physique, nouveau report Figma, mesure de FPS, nouvelle authentification ni publication. Les comportements de réduction de mouvement et d’interruption rapide sont couverts par tests simulés ; pas de nouvelle préférence navigateur forcée. Les études connectées et leurs parcours Awards simulés restent des comparatifs séparés.

## Sources et états conservés

- [index.html](../index.html#awards), [aperçu direct](../content-preview.html#awards), [welcome.mjs](../welcome.mjs), [awards.css](../awards.css).
- [Module de marque](../brand-wordmark.mjs) et [styles](../brand-wordmark.css), [tests](../tests/brand-wordmark.test.mjs).
- [État 89 avant Awards](../../archives/site-versions/pre-awards-entry-20261007/manifest.json) : neuf fichiers sources conservés. Dépendances existantes laissées en place.
- Archives intermédiaires du mot-symbole liées depuis [ses notes](BRAND_WORDMARK_NOTES.md).

Versions actives : contrôleur **awards-entry-91**, aperçu 59, marque module 2/CSS 1, Awards CSS 1. La connexion et son n°22 restent inchangés. Aucun mécanisme de participation ou de vote n’est demandé dans cette page à ce stade.
