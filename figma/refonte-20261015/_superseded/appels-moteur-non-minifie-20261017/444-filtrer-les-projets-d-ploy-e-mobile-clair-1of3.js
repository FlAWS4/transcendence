// 42 Horizon — appel autonome : données S et X, puis le moteur render.js (refonte Figma, 16 oct. 2026)
const S = {"ops":[[null,[{"t":"F","n":"Application","x":0,"y":0,"w":390,"h":2825.9,"c":1,"dom":"app","ch":[],"ph":"p1"},{"t":"F","n":"Voile de la fenêtre (::backdrop)","x":0,"y":0,"w":390,"h":2826,"f":[{"v":0}],"e":[{"t":"B","b":12.0}]}]],[null,[{"t":"F","n":"#content-category-dialog","x":8,"y":8,"w":374,"h":828,"f":[{"v":1}],"s":{"v":2},"sw":1.0,"r":20.0,"e":[{"t":"D","x":0,"y":22,"b":64.0,"s":0.0,"c":{"v":3}},{"t":"D","x":0,"y":3,"b":12.0,"s":0.0,"c":{"v":4}},{"t":"I","x":0,"y":1,"b":0.0,"s":0.0,"c":{"v":5}},{"t":"I","x":0,"y":-1,"b":0.0,"s":0.0,"c":{"v":6}},{"t":"B","b":56.0}],"c":1,"fx":1,"dom":"content-category-dialog","ch":[{"t":"F","n":".cp-project-filter-form","x":1,"y":1,"w":372,"h":826,"ch":[{"t":"F","n":".cp-project-filter-header","x":0,"y":0,"w":372,"h":107,"s":{"v":7},"sw":[0,0,1.0,0],"ch":[{"t":"T","x":16,"y":18,"tx":"Filtrer les projets","fn":0,"fs":20.0,"lh":27.0,"col":{"v":8},"al":"LEFT","ls":-0.4,"sv":{"n":"Projets/Filtrer les projets"}},{"t":"T","x":16,"y":51.8,"tx":"Sélectionnez une catégorie entière ou dépliez-la pour choisir ses critères.","fn":1,"fs":13.0,"lh":19.5,"col":{"v":9},"al":"LEFT","w":264.9,"ar":"H","nl":2,"wmin":264.56,"wmax":288.0,"sv":{"n":"Projets/Sélectionnez une catégorie entière ou dé…"}},{"t":"F","n":"Fermer les filtres","x":312,"y":18,"w":44,"h":44,"ch":[{"t":"S","n":"Fermer les filtres","ref":"la84mm-88","x":12,"y":12,"w":20,"h":20,"fit":"contain","col":{"v":8},"st":1}],"k":0}]},{"t":"F","n":".cp-project-filter-body","x":0,"y":107,"w":372,"h":610,"c":1,"ch":[{"t":"F","n":".cp-project-filter-section","x":14,"y":5,"w":344,"h":616.4,"ch":[{"t":"F","n":"Projets","x":0,"y":11,"w":207,"h":44,"r":12.0,"dom":"content-category-dialog-toggle-1","ch":[{"t":"T","x":0,"y":11.7,"tx":"Projets","sv":{"n":"Projets/Projets"},"k":1},{"t":"F","n":"2 critères sélectionnés","x":47.6,"y":11.5,"w":21,"h":21,"ch":[{"t":"T","x":6.6,"y":1,"tx":"2","k":3}],"k":2},{"t":"S","n":"Illustration","ref":"13q8uf4-63","x":189,"y":13,"w":18,"h":18,"fit":"contain","col":{"v":8},"st":1,"tf":[-1.0,0.0,0.0,-1.0]}]},{"t":"F","n":"Tout sélectionner · Projets","x":216,"y":4.4,"w":128,"h":57.2,"ch":[{"t":"F","n":".cp-project-filter-bulk-check","x":9,"y":20.6,"w":16,"h":16,"ch":[{"t":"F","n":"Après · .cp-project-filter-bulk-check","x":4.5,"y":7,"w":7,"h":2,"k":6}],"k":5},{"t":"T","x":31,"y":8.2,"tx":"Tout sélectionner","w":71.6,"nl":2,"wmin":71.34,"wmax":90.0,"sv":{"n":"Projets/Tout sélectionner"},"k":7}],"k":4},{"t":"F","n":".cp-project-filter-group","x":0,"y":66,"w":344,"h":416.2,"ch":[{"t":"F","n":"Tronc commun","x":11,"y":6.6,"w":209,"h":44,"r":12.0,"dom":"content-category-dialog-toggle-2","ch":[{"t":"T","x":0,"y":11.7,"tx":"Tronc commun","sv":{"n":"Projets/Tronc commun"},"k":1},{"t":"F","n":"2 critères sélectionnés","x":95.7,"y":11.5,"w":21,"h":21,"ch":[{"t":"T","x":6.6,"y":1,"tx":"2","k":3}],"k":2},{"t":"S","n":"Illustration","ref":"13q8uf4-63","x":191,"y":13,"w":18,"h":18,"fit":"contain","col":{"v":8},"st":1,"tf":[-1.0,0.0,0.0,-1.0]}]},{"t":"F","n":"Tout sélectionner · Tronc commun","x":228,"y":0,"w":116,"h":57.2,"ch":[{"t":"F","n":".cp-project-filter-bulk-check","x":8,"y":20.6,"w":16,"h":16,"ch":[{"t":"F","n":"Après · .cp-project-filter-bulk-check","x":4.5,"y":7,"w":7,"h":2,"k":6}],"k":5},{"t":"T","x":30,"y":8.2,"tx":"Tout sélectionner","w":71.6,"nl":2,"wmin":71.34,"wmax":80.0,"sv":{"n":"Projets/Tout sélectionner"},"k":7}],"k":4},{"t":"F","n":"libft","x":23,"y":70.2,"w":18,"h":18,"k":9},{"t":"T","x":50,"y":68.9,"tx":"libft","k":10},{"t":"F","n":".cp-project-filter-choice","x":11,"y":107.2,"w":333,"h":44,"ch":[{"t":"F","n":"minishell","x":12,"y":13,"w":18,"h":18,"ch":[{"t":"F","n":"Après · minishell","x":6,"y":4,"w":6,"h":10,"tf":[0.7071,0.7071,-0.7071,0.7071],"k":12}],"k":11},{"t":"T","x":39,"y":11.7,"tx":"minishell","k":10}],"k":4},{"t":"F","n":"cub3d","x":23,"y":170.2,"w":18,"h":18,"k":9},{"t":"T","x":50,"y":168.9,"tx":"cub3d","k":10},{"t":"F","n":"so_long","x":23,"y":220.2,"w":18,"h":18,"k":9},{"t":"T","x":50,"y":218.9,"tx":"so_long","k":10},{"t":"F","n":"born2beroot","x":23,"y":270.2,"w":18,"h":18,"k":9},{"t":"T","x":50,"y":268.9,"tx":"Born2beroot","k":10},{"t":"F","n":"ft_irc","x":23,"y":320.2,"w":18,"h":18,"k":9},{"t":"T","x":50,"y":318.9,"tx":"ft_irc","k":10},{"t":"F","n":".cp-project-filter-choice","x":11,"y":357.2,"w":333,"h":44,"ch":[{"t":"F","n":"ft_transcendence","x":12,"y":13,"w":18,"h":18,"ch":[{"t":"F","n":"Après · ft_transcendence","x":6,"y":4,"w":6,"h":10,"tf":[0.7071,0.7071,-0.7071,0.7071],"k":12}],"k":11},{"t":"T","x":39,"y":11.7,"tx":"ft_transcendence","k":10}],"k":4}],"k":8},{"t":"F","n":".cp-project-filter-group","x":0,"y":490.2,"w":344,"h":57.2,"ch":[{"t":"F","n":"Spécialisation","x":11,"y":6.6,"w":209,"h":44,"r":12.0,"dom":"content-category-dialog-toggle-3","ch":[{"t":"T","x":0,"y":11.7,"tx":"Spécialisation","sv":{"n":"Projets/Spécialisation"},"k":1},{"t":"F","n":"0 critères sélectionnés","x":90.7,"y":11.5,"w":21,"h":21,"ch":[{"t":"T","x":6.6,"y":1,"tx":"0","k":14}],"k":13},{"t":"S","n":"Illustration","ref":"13q8uf4-63","x":193,"y":13,"w":18,"h":18,"fit":"contain","col":{"v":8},"st":1}]},{"t":"F","n":"Tout sélectionner · Spécialisation","x":228,"y":0,"w":116,"h":57.2,"ch":[{"t":"F","n":".cp-project-filter-bulk-check","x":8,"y":20.6,"w":16,"h":16,"k":16},{"t":"T","x":30,"y":8.2,"tx":"Tout sélectionner","w":71.6,"nl":2,"wmin":71.34,"wmax":80.0,"sv":{"n":"Projets/Tout sélectionner"},"k":7}],"k":15}],"k":8},{"t":"F","n":"personal","x":12,"y":570.4,"w":18,"h":18,"k":9},{"t":"T","x":39,"y":569.1,"tx":"Projets personnels","sv":{"n":"Projets/Projets personnels"},"k":10}]},{"t":"F","n":".cp-project-filter-section","x":14,"y":621.4,"w":344,"h":67,"ch":[{"t":"F","n":"Technologies","x":0,"y":12,"w":207,"h":44,"r":12.0,"dom":"content-category-dialog-toggle-4","ch":[{"t":"T","x":0,"y":11.7,"tx":"Technologies","sv":{"n":"Projets/Technologies"},"k":1},{"t":"F","n":"0 critères sélectionnés","x":85.9,"y":11.5,"w":21,"h":21,"ch":[{"t":"T","x":6.6,"y":1,"tx":"0","k":14}],"k":13},{"t":"S","n":"Illustration","ref":"13q8uf4-63","x":191,"y":13,"w":18,"h":18,"fit":"contain","col":{"v":8},"st":1}]},{"t":"F","n":"Tout sélectionner · Technologies","x":216,"y":5.4,"w":128,"h":57.2,"ch":[{"t":"F","n":".cp-project-filter-bulk-check","x":9,"y":20.6,"w":16,"h":16,"k":16},{"t":"T","x":31,"y":8.2,"tx":"Tout sélectionner","w":71.6,"nl":2,"wmin":71.34,"wmax":90.0,"sv":{"n":"Projets/Tout sélectionner"},"k":7}],"k":15}],"k":17},{"t":"F","n":".cp-project-filter-section","x":14,"y":688.4,"w":344,"h":67,"ch":[{"t":"F","n":"Savoir-faire","x":0,"y":12,"w":207,"h":44,"r":12.0,"dom":"content-category-dialog-toggle-5","ch":[{"t":"T","x":0,"y":11.7,"tx":"Savoir-faire","sv":{"n":"Projets/Savoir-faire"},"k":1},{"t":"F","n":"0 critères sélectionnés","x":75,"y":11.5,"w":21,"h":21,"ch":[{"t":"T","x":6.6,"y":1,"tx":"0","k":14}],"k":13},{"t":"S","n":"Illustration","ref":"13q8uf4-63","x":191,"y":13,"w":18,"h":18,"fit":"contain","col":{"v":8},"st":1}]},{"t":"F","n":"Tout sélectionner · Savoir-faire","x":216,"y":5.4,"w":128,"h":57.2,"ch":[{"t":"F","n":".cp-project-filter-bulk-check","x":9,"y":20.6,"w":16,"h":16,"k":16},{"t":"T","x":31,"y":8.2,"tx":"Tout sélectionner","w":71.6,"nl":2,"wmin":71.34,"wmax":90.0,"sv":{"n":"Projets/Tout sélectionner"},"k":7}],"k":15}],"k":17}]},{"t":"F","n":".cp-project-filter-footer","x":0,"y":717,"w":372,"h":109,"f":[{"v":1}],"s":{"v":7},"sw":[1.0,0,0,0],"e":[{"t":"B","b":48.0}],"sk":1,"ch":[{"t":"T","x":16,"y":17,"tx":"2 critères sélectionnés","sv":{"n":"Projets/2 critères sélectionnés"},"k":18},{"t":"F","n":"Réinitialiser","x":286.1,"y":11,"w":69.9,"h":32,"r":16.0,"ch":[{"t":"T","x":1,"y":5.4,"tx":"Réinitialiser","fn":1,"fs":14.0,"lh":19.6,"col":{"v":8},"al":"CENTER","td":"UNDERLINE","w":67.9,"aw":1,"sv":{"n":"Projets/Réinitialiser"}}]},{"t":"F","n":"Annuler","x":16,"y":51,"w":166,"h":44,"ch":[{"t":"T","x":59.7,"y":11.4,"tx":"Annuler","fn":1,"fs":14.0,"lh":19.6,"col":{"v":8},"al":"CENTER","w":46.5,"aw":1,"sv":{"n":"Projets/Annuler"}}],"k":0},{"t":"F","n":"Appliquer","x":190,"y":51,"w":166,"h":44,"f":[{"v":16}],"s":{"v":16},"sw":1.0,"r":22.0,"ch":[{"t":"T","x":52,"y":11.4,"tx":"Appliquer","fn":0,"fs":14.0,"lh":19.6,"col":{"v":17},"al":"CENTER","w":62,"aw":1,"sv":{"n":"Projets/Appliquer"}}]}]}],"al":{"d":"V","g":0.0,"p":[0.0,0.0,0.0,0.0],"pa":"MIN","ca":"CENTER","rtl":0}}]}]],["p1",[{"t":"F","n":"Fond","x":0,"y":0,"w":390,"h":844,"f":[{"g":"R","a":180.0,"c":[0.95,0.28],"st":[[0.0,"#00000000","dérivées/dégradé/00000000-00BABC17"],[0.52,"#00000000","dérivées/dégradé/00000000-00BABC00"]]},{"g":"R","a":180.0,"c":[0.1,0.65],"st":[[0.0,"#00000000","dérivées/dégradé/00000000-ED349114"],[0.54,"#00000000","dérivées/dégradé/00000000-ED349100"]]},{"g":"L","a":160.0,"c":[0.5,0.5],"st":[[0.0,"#FFFFFF","dérivées/dégradé/FFFFFF-1B1B1B00"],[1.0,"#F4F8F8","dérivées/dégradé/F4F8F8-1B1B1B00"]]},{"g":"R","a":180.0,"c":[0.03,0.86],"st":[[0.0,"#EC33910D","dérivées/dégradé/EC33910D-1B1B1B00"],[0.43,"#EC339100","dérivées/dégradé/EC339100-1B1B1B00"]]},{"g":"R","a":180.0,"c":[0.83,0.39],"st":[[0.0,"#00BABC14","dérivées/dégradé/00BABC14-1B1B1B00"],[0.49,"#00BABC00","dérivées/dégradé/00BABC00-1B1B1B00"]]}],"o":0.42,"fx":1},{"t":"F","n":"Après · Application","x":0,"y":0,"w":390,"h":2147.9,"f":[{"g":"L","a":180.0,"c":[0.5,0.5],"st":[[0.0,"#F7FAFA","Rôles/bg"],[0.3333,"#F7FAFA","Rôles/bg"],[0.6667,"#F7FAFAD1","dérivées/dégradé/F7FAFAD1-1B1B1BD1"],[1.0,"#F7FAFA00","dérivées/dégradé/F7FAFA00-1B1B1B00"]]}]},{"t":"F","n":"Principal","x":0,"y":92,"w":390,"h":2733.9,"dom":"main","ch":[],"ph":"p2"},{"t":"F","n":"En-tête","x":0,"y":0,"w":390,"h":92,"sk":1,"ch":[{"t":"F","n":"Marque 42 Horizon · 42 Horizon","x":22,"y":31.8,"w":126.7,"h":28.5,"ch":[{"t":"P","n":"Image · 42","src":"../../figma/logo-42.svg","x":0,"y":0,"w":40.6,"h":28.5,"col":{"v":18}},{"t":"T","x":55.3,"y":4,"tx":"H","k":19},{"t":"T","x":67.1,"y":4,"tx":"O","k":19},{"t":"T","x":79.9,"y":4,"tx":"R","k":19},{"t":"T","x":89.3,"y":4,"tx":"I","k":19},{"t":"T","x":93.3,"y":4,"tx":"Z","k":19},{"t":"T","x":101.5,"y":4,"tx":"O","k":19},{"t":"T","x":114.3,"y":4,"tx":"N","k":19}]},{"t":"F","n":"Bouton du compte · Menu du compte","x":324,"y":24,"w":44,"h":44,"dom":"profile","ch":[{"t":"S","n":"Menu du compte","ref":"3q45rj-133","x":12,"y":12,"w":20,"h":20,"fit":"contain","col":{"v":8},"st":1}],"k":20}],"al":{"d":"H","g":0,"p":[24.0,22.0,24.0,22.0],"pa":"SPACE_BETWEEN","ca":"CENTER","rtl":0}}]],["p2",[{"t":"F","n":"Contenu","x":24,"y":0,"w":342,"h":2733.9,"dom":"content-sheet","ch":[],"ph":"p3"},{"t":"F","n":"Barre de périmètre","x":130.9,"y":-8,"w":128.1,"h":46,"fx":1,"dom":"scope-bar","ch":[{"t":"F","n":"Filtre de périmètre · Chemin géographique","x":0,"y":0,"w":128.1,"h":46,"s":{"v":19},"sw":1.0,"r":23.0,"e":[{"t":"D","x":0,"y":9,"b":22.0,"s":0.0,"c":{"v":3}},{"t":"I","x":0,"y":1,"b":0.0,"s":0.0,"c":{"v":5}},{"t":"I","x":0,"y":-1,"b":0.0,"s":0.0,"c":{"v":6}}],"dom":"scope-path","ch":[{"t":"F","n":"Avant · Filtre de périmètre · Chemin géographique","x":1,"y":1,"w":126.1,"h":44,"f":[{"v":1}],"r":22.0,"e":[{"t":"B","b":52.0}],"hole":[22.0,22.0,15.75]},{"t":"F","n":"Médaillon du globe","x":7,"y":7,"w":32,"h":32,"s":{"v":19},"sw":1.0,"r":16.0,"dom":"scope-medallion","ch":[{"t":"S","n":"Globe · médaillon","ref":"globe:globe-medaillon","x":0,"y":0,"w":32,"h":32}]},{"t":"F","n":"Chemin","x":45,"y":1,"w":82.1,"h":44,"ch":[{"t":"F","n":"Périmètre actuel · Monde","x":3,"y":1,"w":76.1,"h":42,"ch":[{"t":"F","n":"Sélecteur de périmètre · Monde · Choisir un pays ou un ca…","x":0,"y":0,"w":76.1,"h":42,"r":21.0,"dom":"scope-picker","ch":[{"t":"T","x":7,"y":11,"tx":"Monde","fn":0,"fs":14.0,"lh":null,"col":{"v":8},"al":"LEFT","w":43.1,"aw":1,"sv":{"n":"Projets/Monde"}},{"t":"I","n":"Icône · down","id":"i-down","x":55.1,"y":12,"w":14,"h":18,"col":{"v":8},"st":1}]}]}]}]}]},{"t":"F","n":"Menu du bas","x":16,"y":2657,"w":358,"h":60,"fx":1,"ch":[{"t":"F","n":"Recherche · Rechercher dans Horizon","x":53,"y":-57,"w":200,"h":44,"ch":[{"t":"T","x":30.9,"y":12,"tx":"Chercher dans Horizon","fn":1,"fs":14.0,"lh":null,"col":{"v":20},"al":"CENTER","w":138.2,"aw":1,"sv":{"n":"Projets/Chercher dans Horizon"}}],"k":20},{"t":"F","n":"Dé · Découvrir un projet","x":261,"y":-57,"w":44,"h":44,"dom":"random-campus","ch":[{"t":"I","n":"Icône · dice","id":"i-dice","x":11.5,"y":11.5,"w":21,"h":21,"col":{"v":13},"st":1}],"k":20},{"t":"F","n":"Navigation principale","x":0,"y":0,"w":358,"h":60,"r":30.0,"dom":"main-nav","ch":[{"t":"F","n":"Avant · Navigation principale","x":0,"y":0,"w":358,"h":60,"f":[{"v":1}],"s":{"v":19},"sw":1.0,"r":30.0,"e":[{"t":"D","x":0,"y":9,"b":22.0,"s":0.0,"c":{"v":3}},{"t":"I","x":0,"y":1,"b":0.0,"s":0.0,"c":{"v":5}},{"t":"I","x":0,"y":-1,"b":0.0,"s":0.0,"c":{"v":6}},{"t":"B","b":52.0}]},{"t":"F","n":"Pastille active","x":76.2,"y":6,"w":67.2,"h":48,"f":[{"v":11}],"s":{"v":12},"sw":1.0,"r":24.0},{"t":"F","n":"Explorer","x":7,"y":6,"w":67.2,"h":48,"r":24.0,"ch":[{"t":"I","n":"Icône · compass","id":"i-compass","x":23.6,"y":4,"w":20,"h":20,"col":{"v":20},"st":1},{"t":"T","x":14.3,"y":26,"tx":"Explorer","w":38.5,"aw":1,"sv":{"n":"Projets/Explorer"},"k":21}]},{"t":"F","n":"Projets","x":76.2,"y":6,"w":67.2,"h":48,"r":24.0,"ch":[{"t":"I","n":"Icône · projects","id":"i-projects","x":23.6,"y":4,"w":20,"h":20,"col":{"v":13},"st":1},{"t":"T","x":17.2,"y":26,"tx":"Projets","fn":0,"fs":11.0,"lh":18.0,"col":{"v":8},"al":"CENTER","w":32.7,"aw":1,"sv":{"n":"Projets/Projets"}}]},{"t":"F","n":"Profils","x":145.4,"y":6,"w":67.2,"h":48,"r":24.0,"ch":[{"t":"I","n":"Icône · people","id":"i-people","x":23.6,"y":4,"w":20,"h":20,"col":{"v":20},"st":1},{"t":"T","x":19.4,"y":26,"tx":"Profils","w":28.4,"aw":1,"sv":{"n":"Projets/Profils"},"k":21}]},{"t":"F","n":"Chroniques","x":214.6,"y":6,"w":67.2,"h":48,"r":24.0,"ch":[{"t":"I","n":"Icône · journal","id":"i-journal","x":23.6,"y":4,"w":20,"h":20,"col":{"v":20},"st":1},{"t":"T","x":6.8,"y":26,"tx":"Chroniques","w":53.7,"aw":1,"sv":{"n":"Projets/Chroniques"},"k":21}]},{"t":"F","n":"42 Awards","x":283.8,"y":6,"w":67.2,"h":48,"r":24.0,"ch":[{"t":"I","n":"Icône · awards","id":"i-awards","x":23.6,"y":4,"w":20,"h":20,"col":{"v":20},"st":1},{"t":"T","x":8.6,"y":26,"tx":"42 Awards","w":49.9,"aw":1,"sv":{"n":"Projets/42 Awards"},"k":21}]}]}]}]],["p3",[{"t":"T","x":0,"y":96.5,"tx":"78 contenus","fn":1,"fs":13.0,"lh":null,"col":{"v":9},"al":"LEFT","sv":{"n":"Projets/78 contenus"}},{"t":"F","n":"Filtrer · Tous les projets","x":85.6,"y":84,"w":67.9,"h":44,"f":[{"v":1}],"s":{"v":12},"sw":1.0,"r":22.0,"e":[{"t":"D","x":0,"y":9,"b":22.0,"s":0.0,"c":{"v":3}},{"t":"I","x":0,"y":1,"b":0.0,"s":0.0,"c":{"v":5}},{"t":"I","x":0,"y":-1,"b":0.0,"s":0.0,"c":{"v":6}},{"t":"B","b":52.0}],"dom":"content-category-button","ch":[{"t":"S","n":"Filtrer","ref":"1nhyeqv-91","x":8.7,"y":14.7,"w":14.6,"h":14.6,"fit":"contain","col":{"v":8},"st":1},{"t":"T","x":27.7,"y":12.5,"tx":"Filtrer","sv":{"n":"Projets/Filtrer"},"k":22}]},{"t":"F","n":"Affichage · Grille","x":157.9,"y":84,"w":104.2,"h":44,"dom":"content-layout-button","ch":[{"t":"S","n":"Affichage","ref":"1wf24jc-274","x":8.7,"y":14.7,"w":14.6,"h":14.6,"fit":"contain","col":{"v":8},"st":1},{"t":"T","x":27.7,"y":12.5,"tx":"Affichage","sv":{"n":"Projets/Affichage"},"k":22},{"t":"S","n":"Affichage","ref":"1pci56f-81","x":85,"y":16.8,"w":10.5,"h":10.5,"fit":"contain","col":{"v":8},"st":1}],"k":20},{"t":"F","n":"Trier · Du plus récent au plus ancie…","x":266.6,"y":84,"w":75.4,"h":44,"dom":"content-sort-button","ch":[{"t":"S","n":"Trier","ref":"1h4ccyt-112","x":8.7,"y":14.7,"w":14.6,"h":14.6,"fit":"contain","col":{"v":8},"st":1},{"t":"T","x":27.7,"y":12.5,"tx":"Trier","sv":{"n":"Projets/Trier"},"k":22},{"t":"S","n":"Trier","ref":"1pci56f-81","x":56.2,"y":16.8,"w":10.5,"h":10.5,"fit":"contain","col":{"v":8},"st":1}],"k":20}]],["p3",[{"t":"F","n":"Carte","x":0,"y":150.2,"w":164,"h":366.4,"r":20.0,"ch":[{"t":"F","n":"Lien de l’illustration","x":0,"y":0,"w":164,"h":99.4,"r":12.0,"ch":[{"t":"F","n":"Illustration","x":0,"y":0,"w":164,"h":99.4,"f":[{"v":21}],"r":12.0,"c":1,"ch":[{"t":"S","n":"ft_transcendence","ref":"kz2k1m-1697","x":0,"y":0,"w":164,"h":99.4}]}]},{"t":"T","x":53.3,"y":111.2,"tx":"·","w":4,"k":23},{"t":"T","x":111,"y":111.2,"tx":"·","w":4,"k":23},{"t":"T","x":38.4,"y":130.7,"tx":"·","w":4,"k":23},{"t":"T","x":2,"y":111.2,"tx":"42 Paris","k":24},{"t":"T","x":61.2,"y":111.2,"tx":"42 Lyon","k":24},{"t":"T","x":119,"y":111.2,"tx":"42","k":24},{"t":"T","x":2,"y":130.7,"tx":"Tokyo","k":24},{"t":"T","x":46.3,"y":130.7,"tx":"42 Rio","k":24},{"t":"T","x":2,"y":162.8,"tx":"8 oct. 2026","fn":0,"fs":13.0,"lh":18.2,"col":{"v":9},"al":"LEFT","sv":{"n":"Projets/8 oct․ 2026"}},{"t":"F","n":"Titre · ft_transcendence · Construire à…","x":2,"y":189.6,"w":160,"h":52,"r":4.0,"c":1,"ch":[{"t":"T","x":0,"y":-0.5,"tx":"ft_transcendence · Construire à cinq","fn":0,"fs":20.0,"lh":26.0,"col":{"v":8},"al":"LEFT","ls":-0.7,"w":160.4,"ar":"H","ml":3,"sv":{"n":"Projets/ft_transcendence · Construire à cinq"}}]},{"t":"T","x":2,"y":249.3,"tx":"Créé par","sv":{"n":"Projets/Créé par"},"k":18},{"t":"F","n":"Liste des auteurs","x":2,"y":273.1,"w":160,"h":40,"ch":[{"t":"F","n":"Auteur · Luiza Costa","x":0,"y":0,"w":108,"h":40,"ch":[{"t":"F","n":"Lien d’auteur · Luiza Costa. Chef de projet","x":0,"y":0,"w":108,"h":40,"r":11.0,"ch":[{"t":"P","n":"Image · luiza-costa.svg","src":"./assets/profile-avatars/luiza-costa.svg","x":0,"y":8,"w":24,"h":24,"s":{"v":7},"sw":1.0,"r":12.0},{"t":"T","x":30,"y":0.2,"tx":"Luiza Costa","fn":0,"fs":13.0,"lh":18.85,"col":{"v":8},"al":"LEFT","w":54.4,"ar":"H","ml":2,"sv":{"n":"Projets/Luiza Costa"}},{"t":"S","n":"Chef de projet","ref":"m50f8r-133","x":90,"y":1.2,"w":18,"h":18,"fit":"contain","col":{"v":22},"st":1}]}]},{"t":"F","n":"Auteur · +","x":120,"y":0,"w":40,"h":40,"ch":[{"t":"F","n":"Autres auteurs (+N) · Voir les 5 auteurs","x":0,"y":0,"w":40,"h":40,"f":[{"v":23}],"s":{"v":7},"sw":1.0,"r":20.0,"ch":[{"t":"T","x":11.7,"y":10.3,"tx":"+","k":25},{"t":"T","x":20.7,"y":10.3,"tx":"4","k":25}]}]}],"al":{"d":"H","g":12.0,"p":[0.0,0.0,0.0,0.0],"pa":"MIN","ca":"CENTER","rtl":0}},{"t":"T","x":2,"y":322.2,"tx":"Cinq regards pour imaginer une applicatio…","fn":1,"fs":14.0,"lh":21.7,"col":{"v":9},"al":"LEFT","w":160.4,"ar":"H","ml":2,"sv":{"n":"Projets/Cinq regards pour imaginer une applicati…","en":"Five perspectives on a web application,…","ar":"خمس وجهات نظر لتصوّر تطبيق ويب وربط شاشاته…"}},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · ft_transce…","x":118,"y":6,"w":40,"h":40,"f":[{"v":1}],"s":{"v":19},"sw":1.0,"r":20.0,"e":[{"t":"D","x":0,"y":9,"b":22.0,"s":0.0,"c":{"v":3}},{"t":"I","x":0,"y":1,"b":0.0,"s":0.0,"c":{"v":5}},{"t":"I","x":0,"y":-1,"b":0.0,"s":0.0,"c":{"v":6}},{"t":"B","b":52.0}],"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":24},"st":1}]}]}]]],"name":"projects/filter-projects-expanded","w":390,"h":2826,"bg":{"v":14},"VN":["dérivées/fond/17393829-08101680","Contrôles/glass-surface","dérivées/bordure/FFFFFF-FFFFFF40","dérivées/ombre/183D3C12-00000033","dérivées/ombre/183D3C06-1B1B1B00","dérivées/ombre/FFFFFFB2-FFFFFF30","dérivées/ombre/183D3C0B-00000022","Contenus/line","Rôles/logo","Rôles/muted","Rôles/soft","Contrôles/glass-selection","Contrôles/glass-selection-edge","Verre lisible/text-accent","Rôles/bg","Rôles/surface","Rôles/access-accent","Primitives/ink","dérivées/icône/000000-FFFFFF","Contrôles/glass-edge","Verre lisible/glass-muted","dérivées/fond/F8E6EC-F8E6EC","Contenus/accent","Chaleur/soft","Horizon/favorite-heart"],"FN":[["Jost","Medium"],["Jost","Regular"]],"ST":[{"f":[{"v":10}],"s":{"v":7},"sw":1.0,"r":22.0},{"fn":0,"fs":14.0,"lh":20.3,"col":{"v":8},"al":"LEFT"},{"f":[{"v":11}],"s":{"v":12},"sw":1.0,"r":10.5},{"fn":0,"fs":13.0,"lh":null,"col":{"v":13},"al":"LEFT"},{"f":[{"v":11}],"s":{"v":12},"sw":1.0,"r":12.0},{"f":[{"v":13}],"s":{"v":13},"sw":1.0,"r":4.0},{"f":[{"v":14}]},{"fn":1,"fs":14.0,"lh":19.6,"col":{"v":8},"al":"LEFT","ar":"H"},{"s":{"v":7},"sw":[0,0,0,2.0]},{"f":[{"v":15}],"s":{"v":9},"sw":1.0,"r":5.0},{"fn":1,"fs":14.0,"lh":20.3,"col":{"v":8},"al":"LEFT"},{"f":[{"v":13}],"s":{"v":13},"sw":1.0,"r":5.0},{"s":{"v":14},"sw":[0,2.0,2.0,0]},{"f":[{"v":10}],"s":{"v":7},"sw":1.0,"r":10.5},{"fn":0,"fs":13.0,"lh":null,"col":{"v":9},"al":"LEFT"},{"s":{"v":7},"sw":1.0,"r":12.0},{"f":[{"v":15}],"s":{"v":9},"sw":1.0,"r":4.0},{"s":{"v":7},"sw":[1.0,0,0,0]},{"fn":1,"fs":13.0,"lh":19.5,"col":{"v":9},"al":"LEFT"},{"fn":0,"fs":16.7,"lh":19.2,"col":{"v":8},"al":"LEFT","ls":-0.585},{"f":[{"v":1}],"s":{"v":19},"sw":1.0,"r":22.0,"e":[{"t":"D","x":0,"y":9,"b":22.0,"s":0.0,"c":{"v":3}},{"t":"I","x":0,"y":1,"b":0.0,"s":0.0,"c":{"v":5}},{"t":"I","x":0,"y":-1,"b":0.0,"s":0.0,"c":{"v":6}},{"t":"B","b":52.0}]},{"fn":1,"fs":11.0,"lh":18.0,"col":{"v":20},"al":"CENTER"},{"fn":1,"fs":13.0,"lh":null,"col":{"v":8},"al":"LEFT"},{"fn":0,"fs":13.0,"lh":19.5,"col":{"v":13},"al":"CENTER","ar":"H"},{"fn":0,"fs":13.0,"lh":19.5,"col":{"v":13},"al":"LEFT"},{"fn":1,"fs":13.0,"lh":18.2,"col":{"v":8},"al":"LEFT"}]};
const X = {"page":"1:10","icons":{"i-compass":"2:8","i-projects":"2:13","i-people":"2:19","i-journal":"2:25","i-moon":"2:30","i-system":"2:36","i-sun":"2:42","i-user":"2:48","i-down":"2:53","i-arrow":"2:58","i-back":"2:63","i-close":"2:68","i-globe":"2:75","i-plus":"2:80","i-minus":"2:85","i-dice":"2:95","i-check":"2:100","i-awards":"2:106"},"assets":{"file:../../figma/logo-42.svg":"2:112","1nhyeqv-91":"5:6","1wf24jc-274":"5:12","1pci56f-81":"5:15","1h4ccyt-112":"5:18","kz2k1m-1697":"5:42","m50f8r-133":"5:75","144rg4x-170":"5:100","11myu71-1682":"5:122","114x1ky-1393":"5:161","9fxl1s-1710":"5:223","199u7iw-88":"5:246","lf0o2g-89":"5:249","3q45rj-133":"5:253","file:./assets/profile-avatars/caio-mendes.svg":"5:243","file:./assets/profile-avatars/haru-mizuno.svg":"5:202","file:./assets/profile-avatars/ines-morel.svg":"5:183","file:./assets/profile-avatars/leila-mansour.svg":"5:97","file:./assets/profile-avatars/luiza-costa.svg":"5:72","file:./assets/profile-avatars/noe-laurent.svg":"5:144","dejavu-digit-0":"18:6","dejavu-digit-1":"18:9","dejavu-digit-7":"18:12","dejavu-digit-2":"18:15","dejavu-digit-5":"18:18","dejavu-digit-3":"18:21","dejavu-digit-4":"18:24","dejavu-digit-9":"18:27","dejavu-digit-8":"18:30","ring-100":"18:33","ring-50":"18:36","globe:globe-monde--desktop":"33:19","globe:globe-monde--mobile":"45:20","globe:globe-pays-france--desktop":"45:44","globe:globe-pays-france--mobile":"45:32","globe:globe-medaillon":"41:12","1ehl152-105":"2:53","1xxepqf-82":"2:100","la84mm-88":"2:68","1kl8k69-88":"48:9","1mopehs-109":"48:12","s1d9ye-113":"48:15","1eo8bcu-167":"48:19","s9vxgk-128":"48:22","sf9jel-207":"48:27","1bejxq9-175":"48:31","a2q91f-211":"48:35","zasdjy-113":"48:38","1a1q759-172":"48:43","qs6h5l-210":"48:46","mwr94p-210":"48:49","myncfa-89":"48:52","13q8uf4-63":"48:55","file:./assets/minishell-flow-demo.svg":"48:93","jlxw6u-111":"48:96","rqcd84-1681":"48:118","zhjh88-105":"2:53","16ihdny-112":"2:68","1fetukd-211":"63:10","5rjxzj-157":"63:14","zpj70d-136":"63:17","jzsgmo-219":"63:22","19hqjfg-168":"63:26","14x7gt8-180":"63:29","7a7jq8-89":"63:32","file:./assets/campuses/paris-logo-official.svg":"77:7905","file:./assets/campuses/mulhouse-logo-official-white.svg":"77:7989","1ytnqxa-88":"2:68","1gzwyo8-106":"2:68","m2k74t-81":"162:17011","1qgndoo-164":"162:17016","gdbd7c-83":"162:17019","nk3jnr-179":"162:17023","1p72vvm-123":"162:17026","ru0s0h-159":"162:17031","1xhf2rd-121":"162:17034","1ehh37d-101":"162:17037","1c87ybt-145":"162:17041","wur4f5-193":"171:10","1jtwtz9-1629":"171:31"},"texts":"VariableCollectionId:3:97","colors":"VariableCollectionId:3:2","images":{"file:./assets/campuses/paris-campus.jpg":"f2e4fda31aaa44b147068849268de8fb348618a5","file:./assets/campuses/mulhouse-km0-campus.jpg":"19ca25625ad67ccf741edcf82995e38a16e15f85"},"theme":"Clair","lang":"fr","section":"35:643","name":"⟦build jects-filter-projects-expanded-mobile-fr⟧","at":[3200,3246]};
const page = await figma.getNodeByIdAsync(X.page);
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const V = {}; for (const v of vars) V[v.name] = v;
const missing = { vars: {}, icons: {}, assets: {}, fonts: {} };
const stats = { frames: 0, texts: 0, icons: 0, svgs: 0, placeholders: 0, strings: 0, newStrings: 0 };
const hex = h => { const n = h.replace('#', ''); return { r: parseInt(n.slice(0, 2), 16) / 255, g: parseInt(n.slice(2, 4), 16) / 255, b: parseInt(n.slice(4, 6), 16) / 255, a: n.length > 6 ? parseInt(n.slice(6, 8), 16) / 255 : 1 }; };
function varOf(ref) {
const name = ref && (typeof ref.v === 'number' ? S.VN[ref.v] : ref.v);
return name && V[name] ? V[name] : null;
}
function solid(ref) {
if (!ref) return null;
if (typeof ref.v === 'number') ref = { v: S.VN[ref.v] };
if (ref.v && V[ref.v]) return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[ref.v]);
if (ref.v) missing.vars[ref.v] = 1;
const c = hex(ref.h || '#FF00FF');
return { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a };
}
let bindStops = true;
function gradient(g, w, h) {
const stops = g.st.map(([p, h2, vn]) => {
const c = hex(h2); const s = { position: Math.max(0, Math.min(1, p)), color: { r: c.r, g: c.g, b: c.b, a: c.a } };
const name = typeof vn === 'number' ? S.VN[vn] : vn;
if (bindStops && name && V[name]) s.boundVariables = { color: figma.variables.createVariableAlias(V[name]) };
else if (name && !V[name]) missing.vars[name] = 1;
return s;
});
if (g.g === 'L') {
const a0 = (g.a === undefined ? 180 : g.a) * Math.PI / 180;
const L = Math.abs(w * Math.sin(a0)) + Math.abs(h * Math.cos(a0)) || 1;
const A = w * Math.sin(a0) / L, B = -h * Math.cos(a0) / L;
return { type: 'GRADIENT_LINEAR', gradientStops: stops, gradientTransform: [[A, B, 0.5 - 0.5 * A - 0.5 * B], [-B, A, 0.5 + 0.5 * B - 0.5 * A]] };
}
const [cx, cy] = g.c || [0.5, 0.5];
const rx = Math.max(cx, 1 - cx) * w * Math.SQRT2 || 1, ry = Math.max(cy, 1 - cy) * h * Math.SQRT2 || 1;
return { type: 'GRADIENT_RADIAL', gradientStops: stops, gradientTransform: [[w / (2 * rx), 0, 0.5 - cx * w / (2 * rx)], [0, h / (2 * ry), 0.5 - cy * h / (2 * ry)]] };
}
function paints(list, w, h) {
const out = [];
for (const p of list || []) {
if (p.g) { try { out.push(gradient(p, w, h)); } catch (e) { } }
else if (p.url) { }
else { const s = solid(p); if (s) out.push(s); }
}
return out;
}
function effects(list) {
const out = [];
for (const e of list || []) {
if (e.t === 'B') { out.push({ type: 'BACKGROUND_BLUR', radius: e.b, visible: true }); continue; }
if (e.t === 'L') { out.push({ type: 'LAYER_BLUR', radius: e.b, visible: true }); continue; }
const c = e.c && e.c.h ? hex(e.c.h) : (e.c && e.c.v && V[e.c.v] ? { r: 0, g: 0, b: 0, a: 0.2 } : { r: 0, g: 0, b: 0, a: 0.2 });
let fx = { type: e.t === 'I' ? 'INNER_SHADOW' : 'DROP_SHADOW', color: c, offset: { x: e.x, y: e.y }, radius: e.b, spread: e.s || 0, visible: true, blendMode: 'NORMAL' };
if (e.t !== 'I') fx.showShadowBehindNode = false;  // only drop shadows accept this key
const ev = e.c && (typeof e.c.v === 'number' ? S.VN[e.c.v] : e.c.v);
if (ev && V[ev]) { try { fx = figma.variables.setBoundVariableForEffect(fx, 'color', V[ev]); } catch (err) { } }
out.push(fx);
}
return out;
}
const fonts = new Map();
const JOBS = S.jobs || [S];
function walkFonts(list) { for (const n of list || []) { if (n.t === 'T' && typeof n.fn === 'number') n.fn = S.FN[n.fn]; if (n.t === 'T' && n.sv && n.sv.en !== undefined && n.sv.fr === undefined) n.sv.fr = n.tx; if (n.t === 'T') { fonts.set(n.fn.join('|'), { family: n.fn[0], style: n.fn[1] }); if (n.rtl) fonts.set('Noto Sans Arabic|' + arStyle(n.fn[1]), { family: 'Noto Sans Arabic', style: arStyle(n.fn[1]) }); } walkFonts(n.ch); } }
function expand(list) { for (const n of list || []) { if (n.k !== undefined && S.ST) { Object.assign(n, S.ST[n.k]); delete n.k; } expand(n.ch); } }
for (const J of JOBS) for (const [, list] of (J.ops || [[null, J.ch]])) expand(list);
for (const J of JOBS) for (const [, list] of (J.ops || [[null, J.ch]])) walkFonts(list);
function arStyle(s) { const b = s.replace(' Italic', '').replace('Italic', 'Regular'); return ['SemiBold', 'Bold', 'ExtraBold', 'Black'].includes(b) ? 'Bold' : 'Regular'; }
await Promise.all([...fonts.values()].map(f => figma.loadFontAsync(f).catch(() => { missing.fonts[f.family + ' ' + f.style] = 1; })));
let textColl = null, modes = null;
if (X.texts) { textColl = await figma.variables.getVariableCollectionByIdAsync(X.texts); modes = {}; for (const m of textColl.modes) modes[m.name] = m.modeId; }
function stringVar(sv) {
if (!textColl) return null;
if (!('fr' in sv)) { const v = V[sv.n]; if (v && v.variableCollectionId === textColl.id) return v; missing.vars[sv.n] = 1; return null; }
let name = sv.n, k = 1;
while (V[name] && V[name].variableCollectionId === textColl.id) {
const v = V[name];
const same = v.valuesByMode[modes['Français']] === sv.fr && v.valuesByMode[modes['English']] === sv.en && v.valuesByMode[modes['العربية']] === sv.ar;
if (same) return v;
if (v.valuesByMode[modes['Français']] === sv.fr && v.valuesByMode[modes['English']] === sv.en && '‏' + v.valuesByMode[modes['العربية']] === sv.ar) { v.setValueForMode(modes['العربية'], sv.ar); return v; }
k += 1; name = sv.n + ' (' + k + ')';
}
const v = figma.variables.createVariable(name, textColl, 'STRING');
v.setValueForMode(modes['Français'], sv.fr); v.setValueForMode(modes['English'], sv.en); v.setValueForMode(modes['العربية'], sv.ar);
v.scopes = ['TEXT_CONTENT'];
V[name] = v; stats.newStrings++;
return v;
}
const created = [];
const TS = {}; for (const s of await figma.getLocalTextStylesAsync()) TS[s.name] = s;
const r2 = v => Math.round(v * 100) / 100;
function tsName(fam, style, fs, lh, ls, tc) {
const cat = fam === 'Noto Sans Arabic' ? 'Arabe' : (fam === 'IBM Plex Mono' || fam === 'Cousine') ? 'Code' : fs >= 24 ? 'Titres' : fs >= 18 ? 'Sous-titres' : fs >= 15 ? 'Corps' : fs >= 13 ? 'Libellés' : 'Petits';
let n = cat + '/' + r2(fs) + ' · ' + style + (lh ? ' · ' + r2(lh) : '') + (ls ? ' · ' + (ls > 0 ? '+' : '') + r2(ls) : '') + (tc === 'UPPER' ? ' · capitales' : '');
return n;
}
function textStyle(fam, style, fs, lh, ls, tc) {
const name = tsName(fam, style, fs, lh, ls, tc);
let s = TS[name];
if (!s) {
s = figma.createTextStyle(); s.name = name; s.fontName = { family: fam, style }; s.fontSize = fs;
s.lineHeight = lh ? { value: lh, unit: 'PIXELS' } : { unit: 'AUTO' };
s.letterSpacing = { value: ls || 0, unit: 'PIXELS' };
if (tc) s.textCase = tc;
TS[name] = s; stats.newStyles = (stats.newStyles || 0) + 1;
}
return s;
}
const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+/g;
function place(node, n) { node.x = n.x; node.y = n.y; }
function turn(node, n) {
if (!n.tf) return;
const [a, b, c, d] = n.tf, w = node.width, h = node.height, cx = n.x + n.w / 2, cy = n.y + n.h / 2;
node.relativeTransform = [[a, c, cx - (a * w + c * h) / 2], [b, d, cy - (b * w + d * h) / 2]];
}
function fitLines(t, n) {
let h1 = t.lineHeight && t.lineHeight.unit === 'PIXELS' ? t.lineHeight.value : 0;
if (!h1) { const w = t.width; t.textAutoResize = 'WIDTH_AND_HEIGHT'; h1 = t.height; t.textAutoResize = 'HEIGHT'; t.resize(w, t.height); }
if (!(h1 > 0)) return;
const lines = () => Math.round(t.height / h1);
let w = t.width, c = lines();
if (c === n.nl) return;
const step = c > n.nl ? 0.25 : -0.25, lo = n.wmin || w - 20, hi = n.wmax || w + 2;
for (let i = 0; i < 80; i++) {
const nw = w + step;
if (nw > hi || nw < lo) break;
t.resize(nw, t.height); w = nw; c = lines();
if (step > 0 ? c <= n.nl : c >= n.nl) break;
}
stats.fitted = (stats.fitted || 0) + 1;
}
function fillIcon(inst, n) {
const fp = n.fc ? solid(n.fc) : null;
if (fp) for (const v of inst.findAllWithCriteria({ types: ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'POLYGON', 'STAR', 'BOOLEAN_OPERATION'] })) v.fills = [fp];
}
async function build(n, parent) {
if (n.t === 'T') {
const t = figma.createText();
parent.appendChild(t);
t.fontName = { family: n.fn[0], style: n.fn[1] };
t.fontSize = n.fs;
t.characters = n.tx;
if (n.lh) t.lineHeight = { value: n.lh, unit: 'PIXELS' };
if (n.ls) t.letterSpacing = { value: n.ls, unit: 'PIXELS' };
if (n.tc) t.textCase = n.tc;
if (n.td) t.textDecoration = n.td;
t.textAlignHorizontal = n.al || 'LEFT';
const p = solid(n.col); if (p) t.fills = [p];
const base = textStyle(n.fn[0], n.fn[1], n.fs, n.lh, n.ls, n.tc);
await t.setTextStyleIdAsync(base.id);
if (n.rtl) { let m; ARABIC.lastIndex = 0; const st = arStyle(n.fn[1]); const ars = textStyle('Noto Sans Arabic', st, n.fs, n.lh, 0, null); while ((m = ARABIC.exec(n.tx))) await t.setRangeTextStyleIdAsync(m.index, m.index + m[0].length, ars.id); }
if (n.td) t.textDecoration = n.td;
if (n.w && !n.aw) { t.textAutoResize = 'HEIGHT'; t.resize(Math.max(1, n.w), t.height); }
else t.textAutoResize = 'WIDTH_AND_HEIGHT';
if (n.ml) { t.textTruncation = 'ENDING'; t.maxLines = n.ml; }
if (n.sv) { const v = stringVar(n.sv); if (v) { t.setBoundVariable('characters', v); stats.strings++; } }
if (n.nl && n.w && !n.aw && !n.ml) fitLines(t, n);
t.name = n.tx.length > 40 ? n.tx.slice(0, 40) + '…' : n.tx;
if (n.o !== undefined) t.opacity = n.o;
place(t, n); stats.texts++;
if (n.aw && n.w) {
if (t.textAlignHorizontal === 'CENTER') t.x = n.x + (n.w - t.width) / 2;
else if (t.textAlignHorizontal === 'RIGHT') t.x = n.x + n.w - t.width;
} else if (n.nl && n.w && Math.abs(t.width - n.w) > 0.01 && !n.tf) {
if (t.textAlignHorizontal === 'RIGHT') t.x = n.x + n.w - t.width;
else if (t.textAlignHorizontal === 'CENTER') t.x = n.x + (n.w - t.width) / 2;
}
if (n.sx) {
const cx = n.x + (n.w || t.width) / 2;
const v = figma.flatten([t], parent);
const x0 = v.x;
v.resize(Math.max(0.01, v.width * n.sx), Math.max(0.01, v.height));
v.x = cx + (x0 - cx) * n.sx;
const cv = varOf(n.col);
if (cv) { try { const rv = cv.resolveForConsumer(v).value; v.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: rv.r, g: rv.g, b: rv.b } }, 'color', cv)]; } catch (e) { if (p) v.fills = [p]; } }
else if (p) v.fills = [p];
if (n.o !== undefined) v.opacity = n.o;
v.name = n.tx + ' · resserré ×' + n.sx;
return v;
}
return t;
}
if (n.t === 'I') {
const cid = X.icons && X.icons[n.id];
const comp = cid ? await figma.getNodeByIdAsync(cid) : null;
if (!comp) { missing.icons[n.id] = 1; const r = figma.createFrame(); parent.appendChild(r); r.resize(n.w, n.h); r.fills = []; r.name = n.n + ' (absente)'; place(r, n); return r; }
const inst = comp.createInstance(); parent.appendChild(inst);
inst.rescale(n.w / comp.width);
if (Math.abs(inst.height - n.h) > 0.5) inst.resize(n.w, n.h);
const p = solid(n.col);
if (p) for (const v of inst.findAllWithCriteria({ types: ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'LINE', 'POLYGON', 'STAR', 'BOOLEAN_OPERATION'] })) {
if (v.strokes && v.strokes.length) v.strokes = [p];
if (v.fills && v.fills.length) v.fills = [p];
}
fillIcon(inst, n);
if (n.o !== undefined) inst.opacity = n.o;
inst.name = n.n; place(inst, n); turn(inst, n); stats.icons++;
return inst;
}
if (n.t === 'S' || n.t === 'P') {
const key = n.t === 'S' ? n.ref : n.src;
const cid = X.assets && (X.assets[key] || X.assets['file:' + key]);
const comp = cid ? await figma.getNodeByIdAsync(cid) : null;
if (comp) {
const inst = comp.createInstance();
const k = n.w / comp.width, kh = n.h / comp.height;
let node = inst;
if (Math.abs(k - kh) / Math.max(k, kh) < 0.02 && !n.r) { parent.appendChild(inst); inst.rescale(k); }
else {
const box = figma.createFrame(); parent.appendChild(box); box.resize(n.w, n.h); box.fills = []; box.clipsContent = true;
box.appendChild(inst); const kk = n.fit === 'contain' ? Math.min(k, kh) : Math.max(k, kh); inst.rescale(kk);
inst.x = (n.w - inst.width) / 2; inst.y = (n.h - inst.height) / 2; node = box;
if (n.r) { if (Array.isArray(n.r)) { box.topLeftRadius = n.r[0]; box.topRightRadius = n.r[1]; box.bottomRightRadius = n.r[2]; box.bottomLeftRadius = n.r[3]; } else box.cornerRadius = n.r; }
if (n.s) {
const sp = solid(n.s); if (sp) { box.strokes = [sp]; box.strokeAlign = 'INSIDE'; box.strokeWeight = Array.isArray(n.sw) ? Math.max(...n.sw) : (n.sw || 1); }
}
}
if (n.col) { const p = solid(n.col); if (p) for (const v of inst.findAllWithCriteria({ types: ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'LINE', 'POLYGON', 'STAR', 'BOOLEAN_OPERATION'] })) { if (v.strokes && v.strokes.length) v.strokes = [p]; if (v.fills && v.fills.length) v.fills = [p]; } }
fillIcon(inst, n);
node.name = n.n; place(node, n); turn(node, n);
if (n.o !== undefined) node.opacity = n.o;
stats.svgs++; return node;
}
const r = figma.createFrame(); parent.appendChild(r); r.resize(Math.max(1, n.w), Math.max(1, n.h));
const ih = IMG[key] || IMG['file:' + key];
if (ih) {
r.fills = [{ type: 'IMAGE', imageHash: ih, scaleMode: n.fit === 'contain' ? 'FIT' : 'FILL' }];
r.name = key === 'canvas' ? 'Plan du campus · carte du site' : n.n;
stats.images = (stats.images || 0) + 1;
} else {
missing.assets[key] = 1;
r.name = n.n + ' · à remplacer';
let f; try { f = paints(n.f, n.w, n.h); r.fills = f.length ? f : [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 0.9 }, opacity: 0.6 }]; } catch (e) { bindStops = false; f = paints(n.f, n.w, n.h); r.fills = f.length ? f : []; }
}
if (n.r) { if (Array.isArray(n.r)) { [r.topLeftRadius, r.topRightRadius, r.bottomRightRadius, r.bottomLeftRadius] = n.r; } else r.cornerRadius = n.r; }
place(r, n); stats.placeholders++;
return r;
}
const f = figma.createFrame();
parent.appendChild(f);
f.name = n.n || 'Bloc';
f.resize(Math.max(0.01, n.w), Math.max(0.01, n.h));
try { f.fills = paints(n.f, n.w, n.h); } catch (e) { bindStops = false; stats.unboundGradients = 1; f.fills = paints(n.f, n.w, n.h); }
const spread = (n.e || []).some(e => (e.t === 'D' || e.t === 'I') && e.s);
const leaf = !(n.ch || []).length;
f.clipsContent = !!n.c || (spread && leaf && f.fills.length > 0);
if (n.s) {
const p = solid(n.s); if (p) f.strokes = [p];
f.strokeAlign = 'INSIDE';
if (Array.isArray(n.sw)) { f.strokeTopWeight = n.sw[0]; f.strokeRightWeight = n.sw[1]; f.strokeBottomWeight = n.sw[2]; f.strokeLeftWeight = n.sw[3]; }
else f.strokeWeight = n.sw;
if (n.sd) f.dashPattern = n.sd === 'dotted' ? [1, 2] : [4, 4];
}
if (n.r) { if (Array.isArray(n.r)) { f.topLeftRadius = n.r[0]; f.topRightRadius = n.r[1]; f.bottomRightRadius = n.r[2]; f.bottomLeftRadius = n.r[3]; } else f.cornerRadius = n.r; }
if (n.e) f.effects = effects(n.e);
if (n.o !== undefined) f.opacity = n.o;
if (n.hole && !n.al) {
const [hx, hy, hr] = n.hole;
const rect = figma.createRectangle(); f.appendChild(rect); rect.resize(Math.max(0.01, n.w), Math.max(0.01, n.h)); rect.x = 0; rect.y = 0;
if (n.r) { if (Array.isArray(n.r)) { rect.topLeftRadius = n.r[0]; rect.topRightRadius = n.r[1]; rect.bottomRightRadius = n.r[2]; rect.bottomLeftRadius = n.r[3]; } else rect.cornerRadius = n.r; }
const ell = figma.createEllipse(); f.appendChild(ell); ell.resize(Math.max(0.01, 2 * hr), Math.max(0.01, 2 * hr)); ell.x = hx - hr; ell.y = hy - hr;
const veil = figma.subtract([rect, ell], f); veil.name = 'Voile percé (masque CSS)';
veil.fills = f.fills; veil.effects = f.effects; f.fills = []; f.effects = [];
}
if (n.cm && !n.al) {
const [mx, my, mr] = n.cm;
const m = figma.createEllipse(); f.appendChild(m); m.resize(Math.max(0.01, 2 * mr), Math.max(0.01, 2 * mr)); m.x = mx - mr; m.y = my - mr;
m.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; m.isMask = true; m.name = 'Masque · clip-path circle()';
}
if (n.ph) f.name = f.name + ' ⟨' + n.ph + '⟩';
stats.frames++;
const kids = n.ch || [];
if (n.al) {
f.layoutMode = n.al.d === 'H' ? 'HORIZONTAL' : 'VERTICAL';
f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
f.itemSpacing = n.al.g || 0;
[f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft] = n.al.p;
f.primaryAxisAlignItems = n.al.pa; f.counterAxisAlignItems = n.al.ca;
const ordered = n.al.d === 'H' ? [...kids].sort((a, b) => a.x - b.x) : [...kids].sort((a, b) => a.y - b.y);
for (const k of ordered) { const c = await build(k, f); if (c && 'layoutSizingHorizontal' in c) { try { c.layoutSizingHorizontal = 'FIXED'; c.layoutSizingVertical = 'FIXED'; } catch (e) { } } }
f.resize(Math.max(0.01, n.w), Math.max(0.01, n.h));
} else {
for (const k of kids) await build(k, f);
}
if (spread && !leaf && !n.c && !n.hole) {
const bk = figma.createRectangle(); f.insertChild(0, bk); bk.name = 'Fond, bordure et ombres';
bk.resize(Math.max(0.01, n.w), Math.max(0.01, n.h));
if (n.al) bk.layoutPositioning = 'ABSOLUTE';
bk.x = 0; bk.y = 0;
if (n.r) { if (Array.isArray(n.r)) { bk.topLeftRadius = n.r[0]; bk.topRightRadius = n.r[1]; bk.bottomRightRadius = n.r[2]; bk.bottomLeftRadius = n.r[3]; } else bk.cornerRadius = n.r; }
bk.fills = f.fills; f.fills = [];
if (f.strokes.length) {
bk.strokes = f.strokes; bk.strokeAlign = 'INSIDE';
if (Array.isArray(n.sw)) { bk.strokeTopWeight = n.sw[0]; bk.strokeRightWeight = n.sw[1]; bk.strokeBottomWeight = n.sw[2]; bk.strokeLeftWeight = n.sw[3]; }
else bk.strokeWeight = n.sw;
if (n.sd) bk.dashPattern = n.sd === 'dotted' ? [1, 2] : [4, 4];
f.strokes = [];
}
bk.effects = f.effects.filter(e => e.type !== 'LAYER_BLUR'); f.effects = f.effects.filter(e => e.type === 'LAYER_BLUR');
stats.backed = (stats.backed || 0) + 1;
}
if (n.fx || n.sk) { try { f.scrollBehavior = n.fx ? 'FIXED' : 'STICKY_SCROLLS'; } catch (e) { } }
place(f, n); turn(f, n);
return f;
}
let IMG = {};   // image hashes of the job being built (X.images, or the job's own with its street map)
async function runJob(J, XJ) {
IMG = XJ.images || X.images || {};
let top;
const host = XJ.section ? await figma.getNodeByIdAsync(XJ.section) : page;
if (!host) throw new Error('Section not found: ' + XJ.section);
if (XJ.find) {
top = host.children.find(n => n.name === XJ.find);
if (!top) throw new Error('Build frame not found: ' + XJ.find);
} else {
if (XJ.name && XJ.name.startsWith('⟦build')) for (const old of host.children.filter(n => n.name === XJ.name)) old.remove();
top = figma.createFrame();
host.appendChild(top);
top.name = XJ.name || J.name;
top.resize(J.w, J.h);
top.x = XJ.at ? XJ.at[0] : 0; top.y = XJ.at ? XJ.at[1] : 0;
const bg = solid(J.bg); top.fills = bg ? [bg] : [];
top.clipsContent = true;
if (XJ.colors && XJ.theme) { const cc = await figma.variables.getVariableCollectionByIdAsync(XJ.colors); const m = cc.modes.find(m => m.name === XJ.theme); if (m) top.setExplicitVariableModeForCollection(cc, m.modeId); }
if (textColl && XJ.lang) { const ln = { fr: 'Français', en: 'English', ar: 'العربية' }[XJ.lang]; if (modes[ln]) top.setExplicitVariableModeForCollection(textColl, modes[ln]); }
}
for (const [target, list] of (J.ops || [[null, J.ch]])) {
let box = top;
if (target) { box = top.findOne(n => n.name.endsWith('⟨' + target + '⟩')); if (!box) throw new Error('Placeholder not found: ' + target); }
for (const n of list) await build(n, box);
}
if (XJ.final) { for (const old of host.children.filter(n => n.name === XJ.final && n !== top)) old.remove(); top.name = XJ.final; for (const n of top.findAll(n => / ⟨p\d+⟩$/.test(n.name))) n.name = n.name.replace(/ ⟨p\d+⟩$/, ''); }
return { id: top.id, name: top.name };
}
const done = [];
for (const J of JOBS) done.push(await runJob(J, J.X ? Object.assign({}, X, J.X) : X));
const root = { id: done[done.length - 1].id, name: done[done.length - 1].name };
return { id: root.id, name: root.name, frames: done, stats, missing: { vars: Object.keys(missing.vars), icons: Object.keys(missing.icons), assets: Object.keys(missing.assets), fonts: Object.keys(missing.fonts) } };