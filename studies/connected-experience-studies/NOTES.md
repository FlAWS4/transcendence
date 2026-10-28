# Trois interfaces connectées depuis Explorer — 7 octobre 2026

## Demande et statut

L’utilisateur signale les parcours manquants : comptes, paramètres, gestion du profil, publication de projets et d’articles, messages, notifications et Awards. Après un premier cadrage, il demande **différentes versions des interfaces possibles depuis Explorer**. Il ajoute ensuite les liens sociaux des profils et demande que la colonne gauche reste en place lorsque la droite défile.

Ces trois propositions sont des prototypes comparatifs, pas un choix validé ni une application authentifiée. Elles sont séparées de `horizon-welcome`. Toutes les anciennes études sont conservées ; la nouvelle galerie figure dans le registre des recherches.

- [Galerie](index.html) — http://127.0.0.1:8765/studies/connected-experience-studies/index.html
- [01 · Accès directs](demo.html?variant=1#explore) : messages et notifications près du compte ; menu du compte puis espace personnel à sommaire. Le dock public reste présent.
- [02 · Volet compagnon](demo.html?variant=2#explore) : Mon espace ouvre un volet à droite du globe ; navigation locale horizontale sur ordinateur, sélecteur sur mobile. En petit écran le volet occupe l’espace entre l’en-tête et le dock.
- [03 · Deux espaces](demo.html?variant=3#explore) : bascule Découvrir / Mon espace ; l’activité personnelle dispose de sa navigation. Découvrir restitue la dernière destination publique visitée dans la session.

## Parcours réalisés

Les trois variantes partagent le même corpus fictif et les mêmes écrans :

- Explorer avec globe SVG orientable, sélection Monde/France/Paris, cinq destinations publiques et recherche des espaces de navigation.
- Vue d’ensemble personnelle, accès aux brouillons et à l’activité.
- Profil : biographie, compétences et choix de visibilité ; informations Intra explicitement illustratives ; ajout/retrait de liens GitHub, Facebook, X, Instagram, LinkedIn, Site web ou Autre, avec libellé facultatif. Liens vides au départ, aucune identité externe inventée. URL HTTP(S) absolue sans identifiants intégrés, ouverture annoncée dans un nouvel onglet, `noopener noreferrer`. Aperçu public respectant les choix de visibilité.
- Projets et articles : listes Tous/Brouillons/Publiés, création, édition, enregistrement, aperçu, publication locale, puis modification d’une publication. La version publiée reste visible tant que la nouvelle version n’est pas confirmée. Titre, résumé et texte requis pour publier ; brouillon incomplet enregistrable.
- Messagerie : deux fils fictifs, lecture et ajout d’un message local ; compteurs non lus actualisés. Rien n’est envoyé.
- Notifications : Tout/Non lues, marquer un élément ou tout, ouvrir le contenu concerné.
- Awards : édition/catégories/candidatures de démonstration, détail des projets, sélection et récapitulatif de vote, confirmation locale ; candidature à partir d’un projet publié ; suivi des participations et votes. Aucune règle réelle de calendrier, d’éligibilité ou de pondération n’est fixée par cet essai.
- Paramètres : préférences illustrées et visibilité dans l’annuaire de démonstration ; assistance et création d’un ticket local.
- Déconnexion vers Explorer, panneaux Connexion/Créer un compte et explication de récupération d’accès. Compte simulé uniquement, sans mot de passe ni email envoyé. Les actions personnelles et le vote orientent le visiteur vers cette simulation.

Les actions sont conservées en `sessionStorage`, dans une clé propre à chaque variante ; le thème possède une clé dédiée à cette collection. Elles ne changent pas les préférences, contenus ou favoris de l’aperçu principal. « À propos de l’essai → Réinitialiser cet essai » retrouve le corpus initial. Les liens de variantes repartent tous d’Explorer.

## Défilements et adaptation

Dans les variantes01 et03, au-dessus de760px, **la lecture à droite suit le défilement naturel du document, jusqu’au bas de la page**. Le lien **Retour à Explorer** et l’identité restent fixés à gauche : position horizontale et largeur proviennent de la grille, leur ancrage vertical conserve les positions initiales du retour et du contenu. Un emplacement invisible réserve la hauteur de36px de la première rangée ; le libellé MON ESPACE reste à droite dans le flux, sans déplacer le début de la lecture. La colonne gauche s’étend au maximum jusqu’à16px du bas de la fenêtre, avec une réserve si le dock la recouvre horizontalement. **Seule sa liste de navigation défile** ; Déconnexion est placé à la fin de cette liste sur ordinateur. L’identité reste hors de la zone de défilement et adopte une composition compacte si la hauteur disponible est inférieure à280px. Les dimensions sont recalculées au changement de route, de format et après chargement des polices. Sur mobile, le sélecteur, le lien de retour et le flux vertical existants sont conservés.

De petites flèches encadrent uniquement le menu gauche quand il déborde : bas au début, haut et bas entre les extrémités, haut en fin de liste ; elles disparaissent si tout tient. Chevrons de14px, cibles de24px, oscillation de2px sur1,4s ; cliquer fait défiler environ70% de la hauteur visible. La préférence de mouvement réduit supprime l’oscillation et le défilement animé, en gardant l’orientation des chevrons. Les liens restent accessibles au clavier et les flèches ne sont jamais ajoutées au contenu droit. La position du menu est conservée lors de la mise à jour des compteurs et de l’en-tête.

**Précision de l’utilisateur, même journée :** il veut les deux défilements indépendants, mais rejette le cadre borné et les petits blocs de lecture. L’état précédent, qui fixait tout l’espace personnel et imposait un défilement interne à la droite, est conservé intégralement dans [l’archive du cadre borné](archive/bounded-scroll-20261007/index.html). La correction courante retire ce cadre uniquement des variantes01/03 sur ordinateur. L’animation du conteneur devient un fondu sans translation pour que le sommaire fixe reste attaché à la fenêtre.

**Précision suivante :** seule la partie droite doit défiler comme une page classique ; le retour placé à gauche ne doit pas bouger. Le retour de ces deux études est donc fixé avec le sommaire, en conservant sa place initiale dans la grille. Cette finition complète la même correction en cours, sans nouvelle archive intermédiaire.

**Nouvelle précision, toujours le7 octobre :** le défilement doit désormais concerner le menu gauche uniquement, sans emporter l’identité ou le retour, avec des flèches animées indiquant ce qui reste à parcourir. Avant cette modification, les21 fichiers de la version3 sont copiés intégralement dans [l’archive de la colonne gauche entièrement défilante](archive/full-sidebar-scroll-20261007/index.html). La version4 réalise la séparation identité/menu et les indicateurs. Dans la même suite, le libellé français **Rentrée** remplace **Arrivée** dans les deux emplacements du profil de démonstration, conformément à la précision relayée de l’utilisateur ; clé de données `arrival` et archives conservées.

Le volet02 possède son propre défilement, une navigation locale adhérente sur ordinateur et un sélecteur mobile. Échap ferme le volet et revient au bouton Mon espace. Les trois pistes reprennent les couleurs, le logo42 et Jost d’Horizon ; clair/sombre et mouvements réduits sont prévus.

La demande de liens sociaux et de défilements séparés concerne aussi les fiches actives : voir [notes des profils](../../site/notes/PROFILES_NOTES.md) et [notes du défilement](../../site/notes/DETAIL_SCROLL_NOTES.md). Cette intégration ciblée ne signifie pas qu’une des trois architectures de compte a été choisie.

## Contrôles effectués

Chrome :

- Les trois départs Explorer et ouvertures personnelles examinés sur ordinateur et à320×640 ; thèmes clair/sombre répartis sur les pistes. Aucun débordement horizontal relevé aux écrans contrôlés.
- Piste01 : compte → Mon espace ; ajout d’un lien fictif `example.test` → enregistrement → aperçu avec URL correcte ; nouveau projet → formulaire → aperçu → publication → carte publiée ; message ajouté au fil local.
- Awards : sélection Atlas → récapitulatif → confirmation → Mes votes ; candidature au projet de test → état enregistré. Les actions créent les notifications de démonstration correspondantes.
- Piste02 à320px sombre : navigation locale, notifications toutes marquées lues ; déconnexion depuis Paramètres → Explorer visiteur → formulaire Créer un compte → entrée simulée.
- Piste03 à320px sombre : bascule personnelle, article existant → éditeur → aperçu → publication ; Découvrir restitue Explorer. Formulaire et page sans débordement horizontal.
- Espacement corrigé entre statistiques du globe et recherche sur mobile : à320×640 dans03, statistiques jusqu’à484px et recherche à500,33px, soit environ16px d’air.
- **État historique à cadre borné, désormais archivé** : défilement01 avec colonne gauche à228px avant/après, contenu droit défilé puis revenu en haut, scroll de page0. Piste03 profil : lecture à866,67px, colonne gauche à228px et scroll de page0. Ces mesures ne décrivent pas la correction courante du défilement naturel.
- Galerie : ordinateur clair, trois miniatures à320×640 sombre, liens et thème examinés. La miniature02 a ensuite été rapprochée du volet réel ; galerie finale réexaminée sur ordinateur clair et laissée ouverte. Anciennes collections préservées, registre à sept collections.

Revue indépendante des sources : déconnexion manquante en02 et mobile03, retour de lecture publique vers le privé et nom accessible du bouton d’envoi mobile corrigés. Le lien d’évitement n’altère pas la route. Les liens sociaux échappent leurs valeurs et refusent les protocoles non web et les identifiants intégrés. Syntaxe des modules contrôlée ; montage de trente routes et cas de visibilité/URL examinés par contrôle Node. Aucun nouveau test de performance ni test utilisateur comparatif.

**Correction du défilement naturel, 7 octobre :** les21 fichiers de l’état précédent ont été copiés puis comparés avant modification ; copie autonome identique, dépendances incluses. Contrôles de syntaxe et de références locales effectués, avec vérification ciblée du calcul d’ancrage dans des fenêtres hautes, courtes et avec recouvrement du dock, puis du couple retour/sommaire sans déplacement de la première rangée. La droite n’a plus de hauteur bornée, position fixe ou défilement interne propre. Versions `demo.css?v=3` et `app.mjs?v=3`.

**Contrôles Chrome de la version3, avant la précision « menu seulement » :**

- Piste01, ordinateur1920×1047 sombre : défilement du document de0 à976px, sa position maximale ; défilement interne de la lecture toujours0. Retour à Explorer reste ày172 et le sommaire ày236. Le dernier formulaire et le pied de lecture sont visibles en fin de page.
- Piste03,960×640 sombre : défilement indépendant de la gauche à353,33px jusqu’à Déconnexion, entièrement visible entrey561 ety603, tandis que le document reste à0. Le défilement de la droite atteint ensuite1319,33px, maximum du document ; la gauche conserve son défilement353,33px et son ancragey261, le retour restey172.
- Repli mobile à320px : largeur du document305px avec la barre de défilement ; Retour retrouve `position: static`, le sommaire `position: relative` et la lecture `overflow: visible`.
- Aucun nouveau contrôle de la piste02, dont la structure n’a pas changé. Les preuves antérieures restent datées séparément ; ces vérifications n’impliquent ni téléphone physique ni acceptation esthétique.

**Contrôles source de la version4 :** archive autonome copiée avant modification avec21 fichiers identiques et manifeste vérifié ; syntaxe JavaScript, références locales et états des indicateurs (tout visible, début, milieu, fin, mobile/02 exclus) contrôlés. La piste02 et les règles mobiles conservent leur structure précédente. Versions `demo.css?v=4` et `app.mjs?v=4`.

**Contrôles Chrome de la version4, réalisés le7 octobre :**

- Piste03 sombre à960×640 : cliquer la flèche basse déplace le menu de0 à99,33px, affiche les deux flèches et laisse le document à0. En fin de liste, le menu atteint400px pour un maximum arrondi de401px ; seule la flèche haute reste visible et Déconnexion est accessible entrey537,67 ety579,67. Le nom du profil reste ày349,67 et Retour à Explorer ày172.
- Le défilement de la lecture atteint ensuite1319,33px, maximum du document (1319px arrondis), tandis que le menu conserve400px, le nomy349,67 et le retoury172. L’identité ne défile donc pas avec la liste ni avec la droite sur ce parcours.
- Piste03 à1920×991 après réinitialisation : hauteur totale et hauteur visible du menu504px, défilement0, les deux flèches masquées puisque tous les liens tiennent.
- Repli à320×640 : largeur du document305px, sommaire `position: relative`, navigation `overflow: visible` et les deux flèches `display: none`.
- Aucun nouveau contrôle de la piste02, dont la structure est inchangée. Les mesures de la version3 restent historiques ; pas de nouveau contrôle navigateur exhaustif de la piste01, de préférence de mouvement réduit forcée ou de téléphone physique dans cette suite.

## Limites

- Français seulement dans les études, sans RTL. Le support des liens sociaux du prototype actif est traduit FR/EN/AR.
- Globe SVG simplifié et cinq repères illustratifs, dépendances D3/topojson et géographie figées localement. Pas de carte urbaine, de véritable filtrage géographique des contenus ou de recherche IA ; le sélecteur oriente l’illustration.
- Corpus fictif propre à la comparaison ; catégories et candidats Awards ne sont pas un règlement accepté. Les publications de démo ne modifient pas le catalogue principal.
- Pas d’authentification, permissions serveur, envoi réseau, upload de médias, système de commentaires, administration complète ni suppression de compte réelle. Le thème et les formulaires montrent des intentions d’interface ; les préférences de diffusion n’appellent aucun service.
- Pas de téléphone physique, de clavier virtuel ou de préférence système de réduction du mouvement forcée. Pas de report Figma ni publication distante.

## Conservation

`index.html` ouvre les variantes de `demo.html`. Les styles, contrôleurs, contenus, logo, police, géographie et bibliothèques nécessaires sont dans ce dossier ; aucune dépendance de rendu à une source changeante de l’aperçu principal. Le manifeste SHA-256 identifie l’état livré. Une sélection ultérieure doit préserver cette collection et ses dépendances.

[L’état avec cadre borné](archive/bounded-scroll-20261007/index.html) constitue une archive de cette même collection, pas une huitième collection. Ses21 fichiers d’origine, y compris son manifeste, sont conservés octet pour octet. Le lien est également présent en pied de galerie.

[L’état avec toute la colonne gauche défilante](archive/full-sidebar-scroll-20261007/index.html) conserve ensuite les21 fichiers de la version3, avant la séparation du menu et l’ajout des flèches. Son accès est également ajouté en pied de galerie ; les anciennes collections ne sont pas renumérotées.
