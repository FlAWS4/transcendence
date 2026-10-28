# Recherche IA Horizon — décisions du 4 octobre 2026

## Intention et état

L’utilisateur veut une recherche conversationnelle comparable dans son usage à ChatGPT, capable de retrouver tout le contenu du site, y compris à partir d’indices visuels vagues. Son exemple : un auteur dont la photo de profil représente un arbre et un projet dont les images montrent un FPS. Il accepte explicitement **l’approche hybride** : une demande simple comme « Paris » doit directement montrer les contenus liés à Paris.

**Précision explicite de l’utilisateur, même échange du 4 octobre :** la recherche porte sur tous les types de contenu présents sur Horizon : textes, images, vidéos, audio, documents, code, données structurées et relations, entre autres. Cette liste donne des exemples non exhaustifs ; elle n’impose pas de publier de nouveaux types de contenu. Tout type ajouté à l’avenir devra prévoir son indexation et sa restitution dans les résultats.

Ces exigences et ce principe sont retenus. Les détails d’architecture ci-dessous restent une recommandation de l’assistant : fournisseur, modèles, budget et stack ne sont pas encore choisis. La recherche du prototype reste déterministe et locale ; aucune IA, clé API ou base vectorielle n’a été ajoutée. Les exemples actuels n’incluent pas de vrais profils auteurs ni leur photothèque.

## Comportement retenu

- **Demande simple identifiable** : résoudre campus, pays, titre ou technologie puis afficher les résultats directs, sans réponse rédigée obligatoire. « Paris » correspond au campus et aux contenus rattachés, toutes rubriques confondues ; une adresse lyonnaise contenant « rue de Paris » ne rattache pas Lyon à Paris. Tous les résultats doivent rester accessibles, avec pagination si nécessaire.
- **Description vague ou croisée** : interpréter les indices disponibles dans les différents types de contenu, chercher les sources correspondantes et utiliser leurs relations. « Son avatar avait un arbre et son projet ressemblait à un FPS » porte sur deux médias différents reliés par l’auteur.
- **Conversation** : conserver les contraintes utiles des échanges (« plutôt celui à Lyon », « il y avait aussi du multijoueur »), présenter les candidats et demander une précision quand plusieurs réponses restent plausibles. Une hypothèse tirée d’un contenu ou de ses relations n’est pas présentée comme une certitude.

La recherche couvre tous les contenus du site accessibles à la personne qui cherche, indépendamment de la rubrique et du campus ouverts. Le périmètre « tout » demande un inventaire des types de contenu, de leurs formats et de leurs relations ; il ne signifie pas exposer des contenus privés sans droits.

## Architecture recommandée

1. **Indexer lors de la publication et des modifications.** Conserver les métadonnées communes pertinentes : ID stable, type, titre, résumé, langue, campus/pays, tags, URL, visibilité et version, avec les champs propres au type de contenu. Ajouter les relations structurées auteur → profil/avatar → projets, projet → médias/documents/code, ainsi que les autres contenus liés. Les unités indexées pointent vers leur source exacte, avec une position quand elle est pertinente : section, page, horodatage, fichier ou identifiant de donnée. Tout nouveau type de contenu doit définir cette prise en charge dès son ajout.
2. **Préparer chaque type de contenu en arrière-plan.** Choisir des extractions et représentations adaptées aux formats réellement présents : sections et contexte pour les textes ; description visuelle et OCR pour les images ; transcriptions horodatées pour l’audio et les vidéos, avec images clés pour ces dernières ; texte, structure et pages pour les documents ; fichiers, symboles et contexte de dépôt pour le code ; champs, identifiants et liens pour les données structurées. Ces exemples ne limitent pas les types pris en charge. Combiner les représentations utiles à chaque type, y compris vectorielles lorsque cela aide, puis évaluer leur qualité sur les sources réelles. Un titre ou une métadonnée seuls ne suffisent pas à déclarer le contenu couvert.
3. **Combiner plusieurs recherches.** Noms exacts, plein texte, filtres et relations structurés, similarité sémantique multilingue et recherches adaptées aux différentes modalités fournissent des candidats. Fusionner puis regrouper par contenu pour éviter qu’une source volumineuse monopolise les résultats. Un indice vague reste un signal de classement : il ne devient pas automatiquement un filtre excluant des candidats.
4. **Croiser les relations.** Pour l’exemple de l’utilisateur, rechercher les avatars évoquant un arbre et les médias de projets évoquant un FPS, puis rapprocher les résultats par les identifiants d’auteur. Reclasser une sélection limitée avec les sources pertinentes selon leur type : extraits, médias, code ou données, par exemple. Le nombre de candidats et l’utilité de cette vérification dépendent des mesures de qualité/coût ; ce n’est pas une inspection de tout le site à chaque frappe.
5. **Répondre à partir de preuves.** Afficher les résultats réellement retrouvés avec un lien vers leur source précise quand c’est pertinent, un aperçu adapté à leur type et la raison de la correspondance quand cela aide. Le serveur résout les IDs vers les URL enregistrées et contrôle les droits avant récupération, envoi au modèle et affichage. Une réponse sans correspondance fiable doit le dire ; la recherche classique reste disponible si l’IA échoue.

La documentation d’équipe propose PostgreSQL, sans décision collective finale. PostgreSQL + plein texte + pgvector pourrait regrouper données, relations, filtres et vecteurs dans un stockage commun. Les représentations des différents types de contenu peuvent nécessiter des index distincts ; ne pas supposer leurs vecteurs directement comparables sans espace de représentation commun. Les liens structurés restent interrogeables indépendamment de ces représentations.

## Optimisation et validation

- Calculs des extractions, descriptions et représentations utiles à chaque type à l’ajout/modification des contenus ; supprimer ou invalider l’index lors d’un retrait ou changement de visibilité. Ne réindexer que les sources modifiées.
- Recherche directe sans modèle génératif pour les demandes simples ; traitement coûteux à la validation de la requête, avec annulation des réponses périmées. Caches liés à la version d’index, la langue et aux droits.
- Commencer avec un index adapté au petit corpus ; mesurer avant d’ajouter des services spécialisés ou une recherche approximative. Pas de réentraînement nécessaire pour mémoriser chaque nouvelle publication : elles entrent dans l’index.
- Constituer 30–50 demandes représentatives FR/EN/AR : noms, termes 42, technologies, fautes, indices issus des différents types présents, indices répartis entre sources reliées, suites de conversation, contradictions et absences de réponse. Vérifier la couverture de chaque type dans l’inventaire et la précision des liens vers les sources.
- Comparer recherche classique, combinaison avec les représentations adaptées aux types présents, croisement des relations puis reclassement. Mesurer résultats attendus dans les premiers rangs, erreurs de relation, faux positifs, latence et coût. Prévoir un traitement de rattrapage pour les publications non encore indexées.

## Réalisation présente et suite

Le prototype applique déjà la règle structurée campus/pays : Paris retourne trois résultats (campus et deux contenus fictifs), France douze, accessibles par pages de huit avec « Voir plus ». Les autres demandes utilisent encore le classement lexical local. **La recherche conversationnelle et multimodale reste à implémenter.** Le prochain travail à définir est l’inventaire de tous les types de contenu réels, de leurs formats et de leurs relations, puis un petit banc d’essai sur les requêtes attendues, avant de choisir modèles et hébergement.

## Sources consultées

- [Microsoft — recherche hybride](https://learn.microsoft.com/en-us/azure/search/hybrid-search-overview) : complémentarité mots-clés/vecteurs et filtres structurés ; référence conceptuelle, pas choix d’Azure.
- [Microsoft — recherche multimodale](https://learn.microsoft.com/en-us/azure/search/multimodal-search-overview) : descriptions d’images et vecteurs visuels, avantages et limites complémentaires.
- [PostgreSQL — contrôle et classement plein texte](https://www.postgresql.org/docs/current/textsearch-controls.html) : pondération et classement.
- [pgvector — combinaison avec plein texte](https://github.com/pgvector/pgvector#hybrid-search) : stockage vectoriel, recherche exacte, filtres et fusion de résultats.
