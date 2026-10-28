// 42 Horizon — appel autonome : données S et X, puis le moteur render.js (refonte Figma, 16 oct. 2026)
const S = {"ops":[["p3",[{"t":"F","n":"Carte","x":0,"y":453.8,"w":204,"h":275.8,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · leila-mansour.svg","src":"./assets/profile-avatars/leila-mansour.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Cadet","x":13,"y":111,"w":53.7,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Cadet","sv":{"n":"Profils/Cadet"},"k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Emma De Smet","sv":{"n":"Profils/Emma De Smet"},"k":4},{"t":"T","x":2,"y":223.7,"tx":"42 Brussels","k":5},{"t":"T","x":2,"y":254.2,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":254.2,"tx":"2024","k":7},{"t":"T","x":93.8,"y":254.2,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":254.2,"tx":"5","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Emma De Sm…","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]},{"t":"F","n":"Carte","x":224,"y":453.8,"w":204,"h":275.8,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · caio-mendes.svg","src":"./assets/profile-avatars/caio-mendes.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Alumni","x":13,"y":111,"w":60.2,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Alumni","sv":{"n":"Profils/Alumni"},"k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Tomás Vieira","sv":{"n":"Profils/Tomás Vieira"},"k":4},{"t":"T","x":2,"y":223.7,"tx":"42 Luanda","k":5},{"t":"T","x":2,"y":254.2,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":254.2,"tx":"2022","k":7},{"t":"T","x":93.8,"y":254.2,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":254.2,"tx":"4","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Tomás Viei…","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]}]],["p3",[{"t":"F","n":"Carte","x":448,"y":453.8,"w":204,"h":275.8,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · luiza-costa.svg","src":"./assets/profile-avatars/luiza-costa.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Tronc commun terminé, spécialisation…","x":13,"y":111,"w":89.4,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Transcender","k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Léa Rakoto","sv":{"n":"Profils/Léa Rakoto"},"k":4},{"t":"T","x":2,"y":223.7,"tx":"42 Antananarivo","k":5},{"t":"T","x":2,"y":254.2,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":254.2,"tx":"2023","k":7},{"t":"T","x":93.8,"y":254.2,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":254.2,"tx":"3","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Léa Rakoto","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]},{"t":"F","n":"Carte","x":672,"y":453.8,"w":204,"h":275.8,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · haru-mizuno.svg","src":"./assets/profile-avatars/haru-mizuno.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Cadet","x":13,"y":111,"w":53.7,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Cadet","sv":{"n":"Profils/Cadet"},"k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Haru Mizuno","sv":{"n":"Profils/Haru Mizuno"},"k":4},{"t":"T","x":2,"y":196.3,"tx":"@hmizuno","k":6},{"t":"T","x":2,"y":223.7,"tx":"42 Tokyo","k":5},{"t":"T","x":2,"y":254.2,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":254.2,"tx":"2024","k":7},{"t":"T","x":93.8,"y":254.2,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":254.2,"tx":"7","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Haru Mizun…","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]}]],["p3",[{"t":"F","n":"Carte","x":896,"y":453.8,"w":204,"h":275.8,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · haru-mizuno.svg","src":"./assets/profile-avatars/haru-mizuno.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Cadet","x":13,"y":111,"w":53.7,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Cadet","sv":{"n":"Profils/Cadet"},"k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Amir Keller","sv":{"n":"Profils/Amir Keller"},"k":4},{"t":"T","x":2,"y":223.7,"tx":"42 Heilbronn","k":5},{"t":"T","x":2,"y":254.2,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":254.2,"tx":"2024","k":7},{"t":"T","x":93.8,"y":254.2,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":254.2,"tx":"2","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Amir Kelle…","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]},{"t":"F","n":"Carte","x":0,"y":759.6,"w":204,"h":275.8,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · ines-morel.svg","src":"./assets/profile-avatars/ines-morel.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Alumni","x":13,"y":111,"w":60.2,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Alumni","sv":{"n":"Profils/Alumni"},"k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Elena Novák","sv":{"n":"Profils/Elena Novák"},"k":4},{"t":"T","x":2,"y":223.7,"tx":"42 Prague","k":5},{"t":"T","x":2,"y":254.2,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":254.2,"tx":"2022","k":7},{"t":"T","x":93.8,"y":254.2,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":254.2,"tx":"6","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Elena Nová…","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]}]],["p3",[{"t":"F","n":"Carte","x":224,"y":759.6,"w":204,"h":275.8,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · noe-laurent.svg","src":"./assets/profile-avatars/noe-laurent.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Tronc commun terminé, spécialisation…","x":13,"y":111,"w":89.4,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Transcender","k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Arun Suri","sv":{"n":"Profils/Arun Suri"},"k":4},{"t":"T","x":2,"y":223.7,"tx":"42 Bangkok","k":5},{"t":"T","x":2,"y":254.2,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":254.2,"tx":"2023","k":7},{"t":"T","x":93.8,"y":254.2,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":254.2,"tx":"5","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Arun Suri","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]},{"t":"F","n":"Carte","x":448,"y":759.6,"w":204,"h":275.8,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · leila-mansour.svg","src":"./assets/profile-avatars/leila-mansour.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Cadet","x":13,"y":111,"w":53.7,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Cadet","sv":{"n":"Profils/Cadet"},"k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Mei Tan","sv":{"n":"Profils/Mei Tan"},"k":4},{"t":"T","x":2,"y":223.7,"tx":"42 Singapore","k":5},{"t":"T","x":2,"y":254.2,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":254.2,"tx":"2024","k":7},{"t":"T","x":93.8,"y":254.2,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":254.2,"tx":"4","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Mei Tan","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]}]],["p3",[{"t":"F","n":"Carte","x":672,"y":759.6,"w":204,"h":275.8,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · caio-mendes.svg","src":"./assets/profile-avatars/caio-mendes.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Alumni","x":13,"y":111,"w":60.2,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Alumni","sv":{"n":"Profils/Alumni"},"k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Caio Mendes","sv":{"n":"Profils/Caio Mendes"},"k":4},{"t":"T","x":2,"y":196.3,"tx":"@cmendes","k":6},{"t":"T","x":2,"y":223.7,"tx":"42 São Paulo","k":5},{"t":"T","x":2,"y":254.2,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":254.2,"tx":"2022","k":7},{"t":"T","x":93.8,"y":254.2,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":254.2,"tx":"3","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Caio Mende…","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]},{"t":"F","n":"Carte","x":896,"y":759.6,"w":204,"h":275.8,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · caio-mendes.svg","src":"./assets/profile-avatars/caio-mendes.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Alumni","x":13,"y":111,"w":60.2,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Alumni","sv":{"n":"Profils/Alumni"},"k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Deniz Eren","sv":{"n":"Profils/Deniz Eren"},"k":4},{"t":"T","x":2,"y":223.7,"tx":"42 Istanbul","k":5},{"t":"T","x":2,"y":254.2,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":254.2,"tx":"2022","k":7},{"t":"T","x":93.8,"y":254.2,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":254.2,"tx":"3","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Deniz Eren","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]}]],["p3",[{"t":"F","n":"Carte","x":0,"y":1065.4,"w":204,"h":248.4,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · luiza-costa.svg","src":"./assets/profile-avatars/luiza-costa.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Tronc commun terminé, spécialisation…","x":13,"y":111,"w":89.4,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Transcender","k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Sora Han","sv":{"n":"Profils/Sora Han"},"k":4},{"t":"T","x":2,"y":196.3,"tx":"42 Seoul","k":5},{"t":"T","x":2,"y":226.7,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":226.7,"tx":"2023","k":7},{"t":"T","x":93.8,"y":226.7,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":226.7,"tx":"2","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Sora Han","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]},{"t":"F","n":"Carte","x":224,"y":1065.4,"w":204,"h":248.4,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · haru-mizuno.svg","src":"./assets/profile-avatars/haru-mizuno.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Cadet","x":13,"y":111,"w":53.7,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Cadet","sv":{"n":"Profils/Cadet"},"k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Theo Vermeer","sv":{"n":"Profils/Theo Vermeer"},"k":4},{"t":"T","x":2,"y":196.3,"tx":"Codam","k":5},{"t":"T","x":2,"y":226.7,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":226.7,"tx":"2024","k":7},{"t":"T","x":93.8,"y":226.7,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":226.7,"tx":"6","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Theo Verme…","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]}]],["p3",[{"t":"F","n":"Carte","x":448,"y":1065.4,"w":204,"h":248.4,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · ines-morel.svg","src":"./assets/profile-avatars/ines-morel.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Alumni","x":13,"y":111,"w":60.2,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Alumni","sv":{"n":"Profils/Alumni"},"k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Lina Moreau","sv":{"n":"Profils/Lina Moreau"},"k":4},{"t":"T","x":2,"y":196.3,"tx":"42 Québec","k":5},{"t":"T","x":2,"y":226.7,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":226.7,"tx":"2022","k":7},{"t":"T","x":93.8,"y":226.7,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":226.7,"tx":"5","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Lina Morea…","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]},{"t":"F","n":"Carte","x":672,"y":1065.4,"w":204,"h":248.4,"r":20.0,"ch":[{"t":"F","n":".cp-profile-portrait","x":0,"y":0,"w":204,"h":151.5,"ch":[{"t":"F","n":"Avant · .cp-profile-portrait","x":35,"y":8,"w":134,"h":134,"k":1},{"t":"P","n":"Image · noe-laurent.svg","src":"./assets/profile-avatars/noe-laurent.svg","x":58,"y":15,"w":88,"h":88,"s":{"v":3},"sw":3.0,"r":44.0},{"t":"F","n":"Tronc commun terminé, spécialisation…","x":13,"y":111,"w":89.4,"h":27.5,"ch":[{"t":"T","x":10,"y":3.8,"tx":"Transcender","k":3}],"k":2}],"k":0},{"t":"T","x":2,"y":164,"tx":"Sami Nasser","sv":{"n":"Profils/Sami Nasser"},"k":4},{"t":"T","x":2,"y":196.3,"tx":"42 Abu Dhabi","k":5},{"t":"T","x":2,"y":226.7,"tx":"Rentrée","sv":{"n":"Profils/Rentrée"},"k":6},{"t":"T","x":48.6,"y":226.7,"tx":"2023","k":7},{"t":"T","x":93.8,"y":226.7,"tx":"Promotion","sv":{"n":"Profils/Promotion"},"k":6},{"t":"T","x":154.7,"y":226.7,"tx":"4","k":7},{"t":"F","n":"Bouton Favoris · Ajouter aux favoris · Sami Nasse…","x":158,"y":6,"w":40,"h":40,"ch":[{"t":"S","n":"Ajouter aux favoris","ref":"144rg4x-170","x":11.5,"y":11.5,"w":17,"h":17,"fit":"contain","col":{"v":12},"st":1}],"k":8}]}]]],"VN":["dérivées/fond/EDFAFA-1E2B30","Contenus/line","dérivées/bordure/00BABC24-00BABC24","Rôles/surface","Verre lisible/text-accent","Rôles/logo","Rôles/muted","Contrôles/glass-surface","Contrôles/glass-edge","dérivées/ombre/183D3C12-00000033","dérivées/ombre/FFFFFFB2-FFFFFF30","dérivées/ombre/183D3C0B-00000022","Horizon/favorite-heart"],"FN":[["Jost","Medium"],["Jost","Regular"]],"ST":[{"f":[{"v":0}],"s":{"v":1},"sw":1.0,"r":20.0,"c":1},{"s":{"v":2},"sw":1.0,"r":67.0},{"f":[{"v":3}],"s":{"v":1},"sw":1.0,"r":13.75},{"fn":0,"fs":13.0,"lh":19.5,"col":{"v":4},"al":"LEFT"},{"fn":0,"fs":20.0,"lh":26.0,"col":{"v":5},"al":"LEFT","ls":-0.7},{"fn":0,"fs":13.0,"lh":21.45,"col":{"v":4},"al":"LEFT","ls":0.39},{"fn":1,"fs":13.0,"lh":21.45,"col":{"v":6},"al":"LEFT"},{"fn":0,"fs":13.0,"lh":21.45,"col":{"v":5},"al":"LEFT"},{"f":[{"v":7}],"s":{"v":8},"sw":1.0,"r":20.0,"e":[{"t":"D","x":0,"y":9,"b":22.0,"s":0.0,"c":{"v":9}},{"t":"I","x":0,"y":1,"b":0.0,"s":0.0,"c":{"v":10}},{"t":"I","x":0,"y":-1,"b":0.0,"s":0.0,"c":{"v":11}},{"t":"B","b":52.0}]}]};
const X = {"page":"1:11","icons":{"i-compass":"2:8","i-projects":"2:13","i-people":"2:19","i-journal":"2:25","i-moon":"2:30","i-system":"2:36","i-sun":"2:42","i-user":"2:48","i-down":"2:53","i-arrow":"2:58","i-back":"2:63","i-close":"2:68","i-globe":"2:75","i-plus":"2:80","i-minus":"2:85","i-dice":"2:95","i-check":"2:100","i-awards":"2:106"},"assets":{"file:../../figma/logo-42.svg":"2:112","1nhyeqv-91":"5:6","1wf24jc-274":"5:12","1pci56f-81":"5:15","1h4ccyt-112":"5:18","kz2k1m-1697":"5:42","m50f8r-133":"5:75","144rg4x-170":"5:100","11myu71-1682":"5:122","114x1ky-1393":"5:161","9fxl1s-1710":"5:223","199u7iw-88":"5:246","lf0o2g-89":"5:249","3q45rj-133":"5:253","file:./assets/profile-avatars/caio-mendes.svg":"5:243","file:./assets/profile-avatars/haru-mizuno.svg":"5:202","file:./assets/profile-avatars/ines-morel.svg":"5:183","file:./assets/profile-avatars/leila-mansour.svg":"5:97","file:./assets/profile-avatars/luiza-costa.svg":"5:72","file:./assets/profile-avatars/noe-laurent.svg":"5:144","dejavu-digit-0":"18:6","dejavu-digit-1":"18:9","dejavu-digit-7":"18:12","dejavu-digit-2":"18:15","dejavu-digit-5":"18:18","dejavu-digit-3":"18:21","dejavu-digit-4":"18:24","dejavu-digit-9":"18:27","dejavu-digit-8":"18:30","ring-100":"18:33","ring-50":"18:36","globe:globe-monde--desktop":"33:19","globe:globe-monde--mobile":"45:20","globe:globe-pays-france--desktop":"45:44","globe:globe-pays-france--mobile":"45:32","globe:globe-medaillon":"41:12","1ehl152-105":"2:53","1xxepqf-82":"2:100","la84mm-88":"2:68","1kl8k69-88":"48:9","1mopehs-109":"48:12","s1d9ye-113":"48:15","1eo8bcu-167":"48:19","s9vxgk-128":"48:22","sf9jel-207":"48:27","1bejxq9-175":"48:31","a2q91f-211":"48:35","zasdjy-113":"48:38","1a1q759-172":"48:43","qs6h5l-210":"48:46","mwr94p-210":"48:49","myncfa-89":"48:52","13q8uf4-63":"48:55","file:./assets/minishell-flow-demo.svg":"48:93","jlxw6u-111":"48:96","rqcd84-1681":"48:118","zhjh88-105":"2:53","16ihdny-112":"2:68","1fetukd-211":"63:10","5rjxzj-157":"63:14","zpj70d-136":"63:17","jzsgmo-219":"63:22","19hqjfg-168":"63:26","14x7gt8-180":"63:29","7a7jq8-89":"63:32","file:./assets/campuses/paris-logo-official.svg":"77:7905","file:./assets/campuses/mulhouse-logo-official-white.svg":"77:7989","1ytnqxa-88":"2:68","1gzwyo8-106":"2:68","m2k74t-81":"162:17011","1qgndoo-164":"162:17016","gdbd7c-83":"162:17019","nk3jnr-179":"162:17023","1p72vvm-123":"162:17026","ru0s0h-159":"162:17031","1xhf2rd-121":"162:17034","1ehh37d-101":"162:17037","1c87ybt-145":"162:17041","wur4f5-193":"171:10","1jtwtz9-1629":"171:31"},"texts":"VariableCollectionId:3:97","colors":"VariableCollectionId:3:2","images":{"file:./assets/campuses/paris-campus.jpg":"f2e4fda31aaa44b147068849268de8fb348618a5","file:./assets/campuses/mulhouse-km0-campus.jpg":"19ca25625ad67ccf741edcf82995e38a16e15f85"},"theme":"Clair","lang":"fr","section":"50:10","find":"⟦build ofiles-filter-people-expanded-desktop-fr⟧"};
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