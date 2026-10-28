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

Dans les variantes01 et03, au-dessus de760px, l’espace personnel occupe un cadre borné entre l’en-tête et le bas de la fenêtre. Sommaire et contenu ont chacun leur propre défilement ; faire défiler la lecture ne déplace pas l’identité. Les liens restent atteignables lorsque la colonne gauche est plus haute que l’espace disponible. Sur mobile, un sélecteur remplace le sommaire et le contenu retrouve un flux vertical.

Le volet02 possède son propre défilement, une navigation locale adhérente sur ordinateur et un sélecteur mobile. Échap ferme le volet et revient au bouton Mon espace. Les trois pistes reprennent les couleurs, le logo42 et Jost d’Horizon ; clair/sombre et mouvements réduits sont prévus.

La demande de liens sociaux et de défilements séparés concerne aussi les fiches actives : voir [notes des profils](../../../../site/notes/PROFILES_NOTES.md) et [notes du défilement](../../../../site/notes/DETAIL_SCROLL_NOTES.md). Cette intégration ciblée ne signifie pas qu’une des trois architectures de compte a été choisie.

## Contrôles effectués

Chrome :

- Les trois départs Explorer et ouvertures personnelles examinés sur ordinateur et à320×640 ; thèmes clair/sombre répartis sur les pistes. Aucun débordement horizontal relevé aux écrans contrôlés.
- Piste01 : compte → Mon espace ; ajout d’un lien fictif `example.test` → enregistrement → aperçu avec URL correcte ; nouveau projet → formulaire → aperçu → publication → carte publiée ; message ajouté au fil local.
- Awards : sélection Atlas → récapitulatif → confirmation → Mes votes ; candidature au projet de test → état enregistré. Les actions créent les notifications de démonstration correspondantes.
- Piste02 à320px sombre : navigation locale, notifications toutes marquées lues ; déconnexion depuis Paramètres → Explorer visiteur → formulaire Créer un compte → entrée simulée.
- Piste03 à320px sombre : bascule personnelle, article existant → éditeur → aperçu → publication ; Découvrir restitue Explorer. Formulaire et page sans débordement horizontal.
- Espacement corrigé entre statistiques du globe et recherche sur mobile : à320×640 dans03, statistiques jusqu’à484px et recherche à500,33px, soit environ16px d’air.
- Défilement01 : colonne gauche à228px avant/après, contenu droit défilé puis revenu en haut, scroll de page0. Piste03 profil : lecture à866,67px, colonne gauche à228px et scroll de page0.
- Galerie : ordinateur clair, trois miniatures à320×640 sombre, liens et thème examinés. La miniature02 a ensuite été rapprochée du volet réel ; galerie finale réexaminée sur ordinateur clair et laissée ouverte. Anciennes collections préservées, registre à sept collections.

Revue indépendante des sources : déconnexion manquante en02 et mobile03, retour de lecture publique vers le privé et nom accessible du bouton d’envoi mobile corrigés. Le lien d’évitement n’altère pas la route. Les liens sociaux échappent leurs valeurs et refusent les protocoles non web et les identifiants intégrés. Syntaxe des modules contrôlée ; montage de trente routes et cas de visibilité/URL examinés par contrôle Node. Aucun nouveau test de performance ni test utilisateur comparatif.

## Limites

- Français seulement dans les études, sans RTL. Le support des liens sociaux du prototype actif est traduit FR/EN/AR.
- Globe SVG simplifié et cinq repères illustratifs, dépendances D3/topojson et géographie figées localement. Pas de carte urbaine, de véritable filtrage géographique des contenus ou de recherche IA ; le sélecteur oriente l’illustration.
- Corpus fictif propre à la comparaison ; catégories et candidats Awards ne sont pas un règlement accepté. Les publications de démo ne modifient pas le catalogue principal.
- Pas d’authentification, permissions serveur, envoi réseau, upload de médias, système de commentaires, administration complète ni suppression de compte réelle. Le thème et les formulaires montrent des intentions d’interface ; les préférences de diffusion n’appellent aucun service.
- Pas de téléphone physique, de clavier virtuel ou de préférence système de réduction du mouvement forcée. Pas de report Figma ni publication distante.

## Conservation

`index.html` ouvre les variantes de `demo.html`. Les styles, contrôleurs, contenus, logo, police, géographie et bibliothèques nécessaires sont dans ce dossier ; aucune dépendance de rendu à une source changeante de l’aperçu principal. Le manifeste SHA-256 identifie l’état livré. Une sélection ultérieure doit préserver cette collection et ses dépendances.
