# Logos officiels des campus — 24 octobre 2026

55 fichiers pour les 58 campus de la version B, décrits dans [`campus-logos.json`](../../campus-logos.json) (clé : identifiant de campus du site). Les quatre campus 1337 partagent `1337.png`.

## Source et droits

- **Catalogue officiel du réseau 42** : [campus.json](https://www.42network.org/wp-content/uploads/campus/campus.json), relevé le 24 octobre 2026 (en-tête Last-Modified : 22 octobre 2026, 14 h 37 GMT), 28 666 octets, SHA-256 `4ba6ce012e0bf89a3182e92467aaa843bda7a3b78056acf0628404a766793afe`. Ses 58 entrées correspondent aux `officialId` de `campuses.json` ; chacune donne l’URL de son logo (`properties.logo`).
- Ce sont les **logos officiels des campus du réseau 42**, marques et logos de leurs titulaires (42, les campus et leurs partenaires). Aucune licence ouverte : ils servent à identifier les campus dans le prototype, comme la fiche campus existante, où Paris et Mulhouse utilisent déjà leur logo officiel (voir `campus-profiles.json`, non modifié). Aucune autorisation de redistribution n’a été établie dans ce relevé.
- Dessins non modifiés : ni recoloration, ni recadrage, ni marge ajoutée. Cela vaut pour les fichiers sources de ce dossier ; les variantes d’affichage du dossier `print/`, décrites plus bas, sont dérivées (encre seule et recadrées) et ne remplacent pas les sources.

## Relevé et contrôles

- Requêtes séquentielles espacées de 1,2 s, User-Agent de navigateur ordinaire, HTTPS sur `www.42network.org` uniquement (redirection vers un autre hôte refusée).
- **Original d’abord** : l’URL du catalogue sans son suffixe final `-LxH` (miniature WordPress 120×60). 51 originaux obtenus (HTTP 200) ; les 4 SVG n’ont pas de suffixe et ont été pris tels quels. Aucune miniature utilisée (aucun 404). Fichiers relevés le 24 octobre 2026 entre 10 h 49 et 10 h 51 (heure de Paris) ; la colonne Version des tableaux donne la date `Last-Modified` renvoyée par le serveur.
- Signature des octets conforme à l’extension et au `Content-Type` ; décodage complet par Pillow 12.1.1 (`python3 -I`) ; aucune donnée après la fin d’image ; orientation EXIF absente ou normale.
- SVG : XML sans DOCTYPE, entité ni instruction de traitement ; ni `script`, ni `foreignObject`, ni animation, ni gestionnaire `on*`, ni référence externe (seulement des `#id`, aucune image intégrée). Les 4 SVG passent sans modification. Les utiliser en `<img>` : `wels.svg` contient un `<style>` à classes génériques (`.cls-1`, `.cls-2`).

## Normalisation

Rasters de plus de 640 px de grand côté réduits à 640 px (Lanczos) : PNG reste PNG, JPEG en qualité 88. Lors de la réduction, palette convertie en RGB, canal alpha entièrement opaque retiré, profil ICC sRGB retiré (sRGB implicite) et métadonnées retirées. Les rasters de 640 px ou moins et les SVG sont copiés à l’octet près.

## Classement d’affichage (`surface`)

Mesuré sur le fichier livré : bord de 2 px (fond transparent si au moins la moitié de ses pixels ont un alpha < 16, sinon couleur dominante), luminance de l’encre, contraste avec #F7FAFA, #121315 et #202026, puis planche de contrôle à 160 px sur ces trois fonds (captures hors dépôt).

- `opaque` : fond blanc propre (`#FFFFFF`, Nice `#FEFEFE`) avec marges. Afficher tel quel, coins arrondis : aucune encre perdue jusqu’à 16 px de rayon à 160 px de large.
- `light` : fond transparent et encre noire, plaque claire nécessaire (`antwerp.svg`, `brussels.svg`, `marseille.png`, `milano.png`, `tirana.png`, `wels.svg`, `zurich.svg`).
- `irbid.jpg` et `lyon.jpg` : classés `light` malgré leur fond blanc opaque, car leur encre touche les bords (Irbid : gauche, droite et bas ; Lyon : les quatre côtés). Des coins arrondis de 12 px pour Irbid, et dès 8 px pour Lyon, coupent le 42 et le nom. Une plaque claire avec marge les protège ; leur blanc se confond avec une plaque `#fff`. `background` reste `#FFFFFF`.
- `dark` : aucun logo à encre claire.

## Fichiers copiés sans modification

| Fichier | Campus | Source | Version | Octets | SHA-256 | Dimensions |
| --- | --- | --- | --- | ---: | --- | --- |
| `amman.jpg` | 42 Amman | [42-Amman-website.jpg](https://www.42network.org/wp-content/uploads/2021/04/42-Amman-website.jpg) | 2024-07-24 | 23 941 | `e13a46a573f14076042eddf7f32fe01e644f2ad0f3337223a4d28b9181afe1b6` | 420×140 |
| `antananarivo.png` | 42 Antananarivo | [42-Antananarivo.png](https://www.42network.org/wp-content/uploads/2023/04/42-Antananarivo.png) | 2024-07-24 | 10 281 | `bff695ae5b103133e4bae4520935ff5f893c0cd59827f8e99e304483463c6c88` | 420×140 |
| `antwerp.svg` | 42 Antwerp | [42-Antwerp.svg](https://www.42network.org/wp-content/uploads/2022/09/42-Antwerp.svg) | 2025-10-20 | 1 850 | `2d18b0eacd3ccef90c6cebf0218a67674118ef6a312eea0e4fa54de987b50bb9` | viewBox 0 0 265.48 96.5 |
| `beirut.jpg` | 42 Beirut | [Logo-42-Beirut_Plan-de-travail-1.jpg](https://www.42network.org/wp-content/uploads/2023/09/Logo-42-Beirut_Plan-de-travail-1.jpg) | 2024-07-24 | 18 120 | `5e91a90ab622bc7257e4ff9d1457b77d6582d5045a8bf8214e1f476fd3ec4d41` | 420×140 |
| `berlin.png` | 42 Berlin | [42-Berlin-420x140-1.png](https://www.42network.org/wp-content/uploads/2021/11/42-Berlin-420x140-1.png) | 2024-07-24 | 5 063 | `6cf6426dde82f6aaefb3c6cc52b5f3838a0872e48a4fcbac022640dc637919ab` | 420×140 |
| `brussels.svg` | 42 Brussels | [42-Brussels.svg](https://www.42network.org/wp-content/uploads/2021/04/42-Brussels.svg) | 2025-10-20 | 3 612 | `67d4c9c8274494225a4fba8984ecc29b98e63619569f56c117f6de86fb7b7d6b` | viewBox 0 0 262.39 96.5 |
| `gyeongsan.jpg` | 42 Gyeongsan | [42-Gyeongsan@3x-420x140-1.jpg](https://www.42network.org/wp-content/uploads/2023/07/42-Gyeongsan@3x-420x140-1.jpg) | 2024-07-24 | 8 537 | `ec195e51a43c12b967cc3e93121dd8541fa3e646f247aee5148b2f968ea92ae9` | 420×140 |
| `istanbul.jpg` | 42 Istanbul | [42-Bilisim-Vadisi.jpg](https://www.42network.org/wp-content/uploads/2021/04/42-Bilisim-Vadisi.jpg) | 2024-09-30 | 3 669 | `b69c316430828a390d8b6ce8a7b4cdfdcba309bcc58ff0be144e24204fb3f1c0` | 300×100 |
| `kocaeli.jpg` | 42 Kocaeli | [42-Kocaeli-BV-Website-1.jpg](https://www.42network.org/wp-content/uploads/2021/04/42-Kocaeli-BV-Website-1.jpg) | 2024-09-30 | 6 584 | `a83152462a0840d2d6366ab0049263ae72a979fc05d3093ae9bcb01a53946b50` | 320×140 |
| `luanda.png` | 42 Luanda | [42-Luanda.png](https://www.42network.org/wp-content/uploads/2023/06/42-Luanda.png) | 2024-07-24 | 6 710 | `6d18c63b693c55fa228bae3b0114d295b6b644b761427dcea68d7ab22f28ca2e` | 420×140 |
| `marseille.png` | 42 Marseille | [42-Marseille-Horizontal.png](https://www.42network.org/wp-content/uploads/2025/05/42-Marseille-Horizontal.png) | 2025-05-05 | 2 032 | `bde40517d4ac42a05922b5b8788f417d155564399124b542154ccc63624a5525` | 273×97 |
| `milano.png` | 42 Milano | [42-MILANO-side-black.png](https://www.42network.org/wp-content/uploads/2023/12/42-MILANO-side-black.png) | 2026-09-01 | 2 162 | `72a15ccf1fdf0a49f15071b7a0f46756e64993ba98d749c09e86ddee2accb2a4` | 169×65 |
| `nablus.jpg` | 42 Nablus | [42-Nablus_Plan-de-travail-1-1.jpg](https://www.42network.org/wp-content/uploads/2023/09/42-Nablus_Plan-de-travail-1-1.jpg) | 2024-07-24 | 17 981 | `3f1271271313fc7c7419a9c2fa041ecc19f2b305b324fae64af63b1a618e2fd9` | 420×140 |
| `singapore.jpg` | 42 Singapore | [42-Singapore.jpg](https://www.42network.org/wp-content/uploads/2023/03/42-Singapore.jpg) | 2024-07-24 | 12 998 | `15d52091817d018e958be2358e48d0377660932c0ae906693272d4baafde4b2a` | 420×140 |
| `vienna.png` | 42 Vienna | [42-Vienna-420x140-1.png](https://www.42network.org/wp-content/uploads/2022/01/42-Vienna-420x140-1.png) | 2024-07-24 | 7 290 | `22395630f152f1f8e52a82a0ef0c64bfa4799c9019adb58cf0767e3d5942c74b` | 420×140 |
| `warsaw.png` | 42 Warsaw | [42-Warsaw.png](https://www.42network.org/wp-content/uploads/2023/06/42-Warsaw.png) | 2024-07-24 | 7 343 | `5d605e118c20e4af5c05c0eb50ae59e53d326f505e0bf85b837d3d77a8faab8b` | 420×140 |
| `wels.svg` | 42 Wels | [42-WELSblack.svg](https://www.42network.org/wp-content/uploads/2026/02/42-WELSblack.svg) | 2026-02-06 | 1 568 | `67800299e36203c36a9b238d79e77fc7f15c9df77b521a3ca89522fb5f432fcd` | viewBox 0 0 222.64 96.5 |
| `zurich.svg` | 42 Zürich | [42-Z.svg](https://www.42network.org/wp-content/uploads/2026/05/42-Z.svg) | 2026-05-19 | 1 614 | `1e70ff3e97cd42f697e1a57356aa6af61ce1a03b4fe8b02004d8cb60198a995e` | viewBox 0 0 243.9 96.5 |

## Fichiers réduits

| Fichier | Campus | Source | Version | Octets source | SHA-256 source | Pixels | Octets livrés | SHA-256 livré |
| --- | --- | --- | --- | ---: | --- | --- | ---: | --- |
| `1337.png` | 1337 Ben Guérir, 1337 Khouribga, 1337 Med, 1337 – Rabat | [1337-1.png](https://www.42network.org/wp-content/uploads/2021/04/1337-1.png) | 2024-07-24 | 6 097 | `af8a00a7651b404bd64fc1cf6531cfab91c1180aeb3b25caa97586035df95a77` | 947×316 → 640×214 | 3 612 | `c0db18f6cab3f06b651fefb57f0bdff3a9c11635d4c3128392f3c507686bde3c` |
| `abu-dhabi.png` | 42 Abu Dhabi | [42-Abu-Dhabi.png](https://www.42network.org/wp-content/uploads/2021/04/42-Abu-Dhabi.png) | 2024-07-24 | 10 445 | `569b59d6922feca60fc29c85d349087d5fff556e21b735e2a52e60a77c0fbe3e` | 947×316 → 640×214 | 12 762 | `55fe861a6a45b3bfd0938baf2bc722d408344513c78224a0b499081d89ce6bfa` |
| `angouleme.png` | 42 Angoulême | [42-Angouleme-fond-1.png](https://www.42network.org/wp-content/uploads/2021/04/42-Angouleme-fond-1.png) | 2024-07-24 | 14 852 | `4386cca0e2e9f06eeeae75dd468fa512451dbbb1083031218bc64fb4d787b6f9` | 947×316 → 640×214 | 17 216 | `6351ece0f6fcf6279c443b0a37ffdd22db0a9896396847cf80d5d046f0cec12b` |
| `bangkok.png` | 42 Bangkok | [42-BANGKOK@3x.png](https://www.42network.org/wp-content/uploads/2021/04/42-BANGKOK@3x.png) | 2024-07-24 | 10 190 | `b1ff6aea950e8b492e5c0148128509719342428fe35d021ee05e6b1d19ec1372` | 947×316 → 640×214 | 15 116 | `b5eb06e99ebeccf6667fb1b764caf816a57fc264da092b2493f0ac553df3bde2` |
| `barcelona.png` | 42 Barcelona | [42-Barcelona.png](https://www.42network.org/wp-content/uploads/2021/04/42-Barcelona.png) | 2024-07-24 | 14 988 | `5aa9d2ee2ec81a533c75b29d293045d54bf1fccc62cb5a650ceb05aaf440769c` | 947×316 → 640×214 | 17 510 | `4bf7e3e522c7dd9a1d155937c9b20898fb9f5331dfb67a3fcf73e4539fbebf93` |
| `belo-horizonte.jpg` | 42 Belo Horizonte | [42-BeloHorizonte-790x264-1.jpg](https://www.42network.org/wp-content/uploads/2022/09/42-BeloHorizonte-790x264-1.jpg) | 2024-07-24 | 14 537 | `236bc933fab1b1140384611d22c12fc96242952e9372312f796fd7ecece5401a` | 790×264 → 640×214 | 8 605 | `af6cac739ffefb8789d43a0f66eace8341c1ffa79e5d500c0e69c258899cf0f2` |
| `codam.png` | Codam | [Codam-1.png](https://www.42network.org/wp-content/uploads/2021/04/Codam-1.png) | 2024-07-24 | 24 006 | `7f3ff8b7f8f71dc35fd92da54b3e5dcb85711bf5535c3fbb5ccdd5b506585549` | 947×316 → 640×214 | 16 080 | `dca7a27d46fbef15e4e10ab872300bda396dd7b92a366f5b7446343dac602582` |
| `firenze.png` | 42 Firenze | [42-Firenze-Logo.png](https://www.42network.org/wp-content/uploads/2022/01/42-Firenze-Logo.png) | 2024-07-24 | 50 870 | `aa32a6980006929195c022b290f71ed67c8a20f0daaceb1100f13131096f9bd6` | 2500×1042 → 640×267 | 20 390 | `e7c27013d29e2b08a1a3b61f77f8c3d56136e90cc2a4f65e4f38cce503c63c1b` |
| `heilbronn.png` | 42 Heilbronn | [42-Heilbroon@3x.png](https://www.42network.org/wp-content/uploads/2021/04/42-Heilbroon@3x.png) | 2024-07-24 | 9 389 | `0539826bebd8e85395bfdb6465c349bd08d34a7ea8063c4c65f14eb4ce0f01f6` | 947×316 → 640×214 | 13 540 | `406b281851a4b518c18809369af5bdb176a3cd163aa74fd243a15034b256045b` |
| `irbid.jpg` | 42 Irbid | [42-Irbid-Logo-Variations_Horizontal.jpg](https://www.42network.org/wp-content/uploads/2025/04/42-Irbid-Logo-Variations_Horizontal.jpg) | 2025-04-08 | 81 323 | `a4a8acc278b61aa8d1df1a4590d7b268a581ade52fdeae2cb05ee706d85716b1` | 1400×607 → 640×277 | 14 449 | `6c1a2563d6c37939dd424c3b1e620ec4b994c648b3e2796586833629d5f2ef16` |
| `iskandar-puteri.jpg` | 42 Iskandar Puteri | [42-Iskandar-Puter.jpg](https://www.42network.org/wp-content/uploads/2024/05/42-Iskandar-Puter.jpg) | 2024-07-26 | 91 540 | `3ee0b6569dc7ba236712d8cd4e8670dca2441e19fae632413ca80fa5fd61943d` | 2099×807 → 640×246 | 12 005 | `9849616a4a74161d9fa3a40e187b0bac82d0f66b1ee426ecbafe0d31c4b4cb7e` |
| `kuala-lumpur.png` | 42 Kuala Lumpur | [42-kuala-lumpur-1.png](https://www.42network.org/wp-content/uploads/2021/04/42-kuala-lumpur-1.png) | 2024-07-24 | 15 766 | `b6604dffd9ae65057624978a5ae396646c0414c28b6c36de83702b5648f95165` | 947×316 → 640×214 | 19 232 | `23c3e51b59974fc63836f909de02377d294b6d7ce0486ff6ce84242b0b4541d7` |
| `lausanne.png` | 42 Lausanne | [42-Lausanne@3x.png](https://www.42network.org/wp-content/uploads/2021/04/42-Lausanne@3x.png) | 2024-07-24 | 9 244 | `020741fdc9ff41261cf557ecb12d37cd52b4035b1a425021d1981cbd2084f7cd` | 947×316 → 640×214 | 13 258 | `2276e4c7a5a2ffadb88d11191502bc51af0e57d185b731760543491f53acb78c` |
| `le-havre.jpg` | 42 Le Havre | [42-LeHavre-790x264-1.jpg](https://www.42network.org/wp-content/uploads/2022/09/42-LeHavre-790x264-1.jpg) | 2024-07-24 | 12 498 | `7438eab4b9d191df8bd11697b6bc88d705f8eb0174f97cea74f16b88ad0172c7` | 790×264 → 640×214 | 6 644 | `da09d4e1900632fb5fe0065c0e2b00a10b4c941bd7e0106c9d8bceb1b2aafe3c` |
| `lisboa.png` | 42 Lisboa | [42-Lisboa@3x.png](https://www.42network.org/wp-content/uploads/2021/04/42-Lisboa@3x.png) | 2024-07-24 | 8 397 | `53ef435961bebfc402add919187802f1ddf0ffb35370b3d158b69190b7a31b78` | 947×316 → 640×214 | 11 834 | `7a47140cff17b71d2a0657aded49c9862d4b2febfc628c6c1f0c02f192630402` |
| `london.jpg` | 42 London | [42-London.jpg](https://www.42network.org/wp-content/uploads/2022/01/42-London.jpg) | 2024-07-24 | 33 781 | `84ab45ec33004bafe80e03c4b63d4d536ed38acb42799d567fd3843129a48ae7` | 947×316 → 640×214 | 7 067 | `6d32df8f7ea9d656e9c30c723d40796a49c3c7b69d130b3e15bb0795992f7ede` |
| `luxembourg.png` | 42 Luxembourg | [42-Luxembourg-790x264-1.png](https://www.42network.org/wp-content/uploads/2022/05/42-Luxembourg-790x264-1.png) | 2024-07-24 | 13 601 | `3dce9db63720ea7cb1ce8975818f25b249820242929c53411e8657dbfbde87ad` | 790×264 → 640×214 | 14 878 | `b99c09209472965fb2aac5e3beec43ad8fcaf85a3d2ef71bca9f8937c642d0c3` |
| `lyon.jpg` | 42 Lyon | [42-Lyon-Vertical.jpg](https://www.42network.org/wp-content/uploads/2021/04/42-Lyon-Vertical.jpg) | 2024-08-13 | 210 449 | `a215bc977797a292b6c1421bc40b364ae7482e9907134c62b67d9a35c88bac1d` | 3586×1644 → 640×293 | 16 062 | `c5544c6df54c09f0d3e90051612db92e0dc9c5d28f93069115fe8fa337ebf453` |
| `madrid.png` | 42 Madrid | [42-Madrid@3x.png](https://www.42network.org/wp-content/uploads/2021/04/42-Madrid@3x.png) | 2024-07-24 | 11 963 | `cba757a0861704f1162d5c83c29345ff29f774c832680daec0d0d4a5df7aaa16` | 947×316 → 640×214 | 18 665 | `aa64741cff8c7ba2d544c597e15a7c4c321da16cff3e1ac47d9f00091638039b` |
| `malaga.png` | 42 Málaga | [42-Malaga.png](https://www.42network.org/wp-content/uploads/2021/04/42-Malaga.png) | 2024-07-24 | 14 131 | `11f2fd96f8391838e053787cec62673bbc06e5cfbd4fb302b3a3f3731c6e4b12` | 947×316 → 640×214 | 16 281 | `1d809150f559c0fb079997e3ba61220c88d9c2fc87b35bd1c57904951cc66a88` |
| `mulhouse.png` | 42 Mulhouse | [42-Mulhouse.png](https://www.42network.org/wp-content/uploads/2021/04/42-Mulhouse.png) | 2024-07-24 | 11 552 | `df3fc2609fe7846f0922eb04ef3a5ab6fde20c77830edf1fd4ee7908c798ea07` | 947×316 → 640×214 | 21 473 | `ca286c423e47b6f334333bdb68d7e90e5d92193cf06dda6d6e3618d31f5b33e4` |
| `nice.jpg` | 42 Nice | [42Nice-logo-v2.jpeg](https://www.42network.org/wp-content/uploads/2021/04/42Nice-logo-v2.jpeg) | 2024-07-31 | 46 688 | `e49c72278bff2b47fd627c3de8645c7572edb67915c852be9efd8f3e6c0e2bf5` | 1770×808 → 640×292 | 7 268 | `f708a64778810a98d10b94fb763d93f190e9ec020e4ca75fdd5e2157e370423d` |
| `paris.png` | 42 Paris | [42.png](https://www.42network.org/wp-content/uploads/2021/04/42.png) | 2024-07-24 | 3 364 | `5c3f71eb5ee89b59175621105fd6cb21b5acf88eefacf94a460b3114ed8dbb71` | 947×316 → 640×214 | 4 929 | `ef48054daff9b3a809003373aaaab9f46b77ecb52b7bb583217d600aa8a6aa26` |
| `penang.jpg` | 42 Penang | [42-Penang.jpg](https://www.42network.org/wp-content/uploads/2024/07/42-Penang.jpg) | 2024-07-26 | 89 656 | `c3b6d836f3f0ce473793548b5f47de05e61e2a6e6a4e2d7a971b42c9b79a1a46` | 2244×1006 → 640×287 | 9 848 | `c838e845108094412a5ee2acf8a71ca354fbdefcfd7edd4ef7f01541067a09b5` |
| `perpignan.jpg` | 42 Perpignan | [42-Perpignan-790x264-1.jpg](https://www.42network.org/wp-content/uploads/2022/05/42-Perpignan-790x264-1.jpg) | 2024-07-24 | 16 271 | `f0e4dcc64742ab0e328026389f50b72f1cc21295872506cb3d093fba0d12f983` | 790×264 → 640×214 | 9 140 | `6f4d5aecc68d148d939817513282e00a3aec4bdc666b6051d3a9edce93d549f6` |
| `porto.jpg` | 42 Porto | [42-Porto.jpg](https://www.42network.org/wp-content/uploads/2022/01/42-Porto.jpg) | 2024-07-24 | 32 823 | `7c5ce7eb993a63e361b2295ec09499db3d5c33a3a9e76b1aa37d72d4df166716` | 947×316 → 640×214 | 6 491 | `b6020febce50471c78c9a364d7ac364ae175973fd530fd4b29b4f7b9dc8a2bde` |
| `prague.jpg` | 42 Prague | [42-Prague.jpg](https://www.42network.org/wp-content/uploads/2022/01/42-Prague.jpg) | 2024-07-24 | 33 580 | `1caacbcd5dfe02695b7023fcc2976a5e17be9c13eca0455f128be391e323943d` | 947×316 → 640×214 | 6 849 | `df7a50883c92e5762d5ef6a9cf3cfbdc21fa14b798d9d811003c777e9e011a90` |
| `quebec.png` | 42 Québec | [42-QueI_bec@3x.png](https://www.42network.org/wp-content/uploads/2021/04/42-QueI_bec@3x.png) | 2024-07-24 | 8 456 | `fc0bf768f69959260fccd3b323cde31e747fbf11d73a6c94317974f29fef9cfe` | 947×316 → 640×214 | 12 119 | `9dc96328a3ca60197d1a64c06d0e370064d427e42aae126b97deae51fc3e8318` |
| `rio.png` | 42 Rio | [42-Rio.png](https://www.42network.org/wp-content/uploads/2021/04/42-Rio.png) | 2024-07-24 | 6 549 | `1a4e711b7866f26dc96bf19745e8d29fd1d7ae4a564acef41381ca677d0501da` | 947×316 → 640×214 | 9 818 | `3a695b0a3a751b6e0ef5ebac58b098924fa280bec604581a691a18f8a7bdb44a` |
| `roma.png` | 42 Roma | [42-Roma@3x.png](https://www.42network.org/wp-content/uploads/2021/04/42-Roma@3x.png) | 2024-07-24 | 8 891 | `0883b315293303d18f37ed198684f96ef1db81d508e872be0aa6f53a3a354fd6` | 947×316 → 640×214 | 12 861 | `76f22678ecea7ab8cbfd7ef1aa318c5ad467374e8b8572f63685b53e917357b9` |
| `sao.png` | 42 São Paulo | [42-Sao-Paulo.png](https://www.42network.org/wp-content/uploads/2021/04/42-Sao-Paulo.png) | 2024-07-24 | 8 223 | `89c6cab7822946035b3287aa34a1196e3162f5aed79cb8c66d2ca26287c386a0` | 947×316 → 640×214 | 13 047 | `6b9ce32fd403903bf7051746c36adcb5fa1a8c92d29bd44fff28ea8bb1634cb8` |
| `seoul.png` | 42 Seoul | [42-Seoul@3x.png](https://www.42network.org/wp-content/uploads/2021/04/42-Seoul@3x.png) | 2024-07-24 | 8 147 | `ec8d4216051240a44bf3f317ca71b73d0f15181272e523010333cbf10ca9b15c` | 947×316 → 640×214 | 11 462 | `0d34f6e2c4fb43992d65fdd5f4fad54b3ede3c1aab3dbdb14666c12cf183cc24` |
| `tirana.png` | 42 Tirana | [42-Tirana-logo.png](https://www.42network.org/wp-content/uploads/2025/04/42-Tirana-logo.png) | 2025-04-08 | 16 599 | `3daf1a8302b8fc11fd9c4ed7a08e0c4f366a4dbfa9cc61396ea1209bbcf388fa` | 1020×403 → 640×253 | 11 192 | `8319df1c81bc1b94a96c4815c858f0706feab0436732916b96333f0c8c51e6bd` |
| `tokyo.png` | 42 Tokyo | [42-Tokyo@3x.png](https://www.42network.org/wp-content/uploads/2021/04/42-Tokyo@3x.png) | 2024-07-24 | 8 241 | `3a10b9e87e9dd2b85e74d400cdbc05a8c34df7f6995ffbe97a7bab6ca2dbccbe` | 947×316 → 640×214 | 11 650 | `b949fb66fb4a13bd5435bc0af39d2eda1143af68d18c17b95dccdcd2a8402835` |
| `urduliz.png` | 42 Urduliz | [42-Urduliz@3x.png](https://www.42network.org/wp-content/uploads/2021/04/42-Urduliz@3x.png) | 2024-07-24 | 12 929 | `5d25d9d4fc84f8a8a78b798a34975b3b694c3de8016545820d86b62c0a6e8dc7` | 947×316 → 640×214 | 21 283 | `14f4134057f29613f7bdbd76b2e5e77deda4c146e01668187cbf0fa7409cd639` |
| `wolfsburg.png` | 42 Wolfsburg | [42-Wolfsburg.png](https://www.42network.org/wp-content/uploads/2021/04/42-Wolfsburg.png) | 2024-07-24 | 9 232 | `03fa8ec0fbec2d3620f53e1bb3bdf192d32c81b13941b03015edc55ead3c4be8` | 947×316 → 640×214 | 10 982 | `9df236d2cf629fe489df0cf1140473ab08edace6f61d0d40c3c5d342406ecf1a` |
| `yerevan.png` | 42 Yerevan | [42-Yerevan.png](https://www.42network.org/wp-content/uploads/2021/04/42-Yerevan.png) | 2024-07-24 | 7 756 | `497732ca6b8cdaf9f7a35850400e6444a95c7596e0d6319367f77a8078112011` | 947×316 → 640×214 | 12 123 | `a13e05063c3ec7d08b228363dc42e25ecaf39f51ac6da141c6b6d34c4d076038` |

## Variantes d’affichage (`print/`) — 25 octobre 2026

Pour la version B « Halo », l’Explorer dessine chaque logo dans l’encre du thème (encre sombre en clair, blanche en sombre) au moyen d’un masque CSS. Ces masques sont calculés une fois, à la construction, par l’outil reproductible [`site-b/tools/build-campus-logo-prints.py`](../../tools/build-campus-logo-prints.py) (`python3 -I site-b/tools/build-campus-logo-prints.py`, puis `--check`), selon la méthode de la spécification ([SPEC-B-HALO.md](../../notes/SPEC-B-HALO.md), §6.3) ; aucun canvas n’est utilisé dans la page. Le champ `print` de chaque campus dans `campus-logos.json` décrit sa variante.

- **Masques (50 rasters)** : couverture d’encre calculée à partir de la luminance par rapport au fond du logo (le 5ᵉ centile de l’encre vaut encre pleine), recadrée sur l’encre avec une marge de 2 %, puis enregistrée en PNG niveaux de gris avec alpha (L = 0, alpha = encre), sans métadonnées. Aucune tache n’est retirée. Les quatre campus 1337 partagent `print/1337.png`.
- **SVG (4)** : Anvers, Bruxelles, Wels et Zurich servent de masque tels quels, depuis leur fichier d’origine.
- **Codam, seul logo en couleur** : affiché dans ses couleurs sur une petite plaque blanche. Sa variante `print/codam.png` reprend les pixels de l’original sans recoloration ni rééchantillonnage, recadrés sur son encre avec la marge de 6 % de Halo : boîte [148, 33, 491, 177] de 640 × 214 (recadrage ajouté le 25 octobre après la vérification : l’original non recadré rendait le logo deux fois trop petit sur sa plaque). L’original `codam.png` reste inchangé.
- Outils : Python 3.14.4, Pillow 12.1.1, numpy 2.3.5, zlib 1.3.1, libjpeg-turbo 2.1.5 (le contrôle s’arrête si le décodeur JPEG diffère). 51 fichiers, 285 774 octets.
- Ce sont des représentations dérivées de marques de leurs titulaires : les réserves de la section « Source et droits » s’appliquent de la même façon.

| Variante | Campus | Type | Pixels | Octets | SHA-256 |
| --- | --- | --- | --- | ---: | --- |
| `assets/campus-logos/antwerp.svg` | antwerp | mask (original) | viewBox 265.48×96.5 | 1850 | `2d18b0eacd3ccef90c6cebf0218a67674118ef6a312eea0e4fa54de987b50bb9` |
| `assets/campus-logos/brussels.svg` | brussels | mask (original) | viewBox 262.39×96.5 | 3612 | `67d4c9c8274494225a4fba8984ecc29b98e63619569f56c117f6de86fb7b7d6b` |
| `assets/campus-logos/print/1337.png` | 1337-ben-guerir, 1337-khouribga, 1337-med, 1337-rabat | mask | 259×76 | 1554 | `b6b2df31149dad7e784a12b3b33507ed865d64b6a41b29f5332f80c7f117e6e0` |
| `assets/campus-logos/print/abu-dhabi.png` | abu-dhabi | mask | 394×146 | 5725 | `95b63b2b0733086095668e3aa8b466ccb859970b99827dd2309c72abdfe0eb34` |
| `assets/campus-logos/print/amman.png` | amman | mask | 227×93 | 4143 | `a6e327b5b8649565e45411b049a8e832f75520de8c7e9c490532dea54b22966d` |
| `assets/campus-logos/print/angouleme.png` | angouleme | mask | 488×148 | 7927 | `4d02ae60787eb92cc6c08b35a198b05e1cc5acd3b7c6c2d936b34fef60a7287f` |
| `assets/campus-logos/print/antananarivo.png` | antananarivo | mask | 311×100 | 3508 | `4c267d0fa6dee7590990cd638788ba198aecf4c8a18e4ea921adcd61aeaba438` |
| `assets/campus-logos/print/bangkok.png` | bangkok | mask | 379×144 | 5374 | `aacd43debf6c5b08853cdff64fdd39a1cc3be79cd79fe15ecbc817d50f5595ea` |
| `assets/campus-logos/print/barcelona.png` | barcelona | mask | 505×150 | 7891 | `b0f7111756be50bcdd34d1c9c9e1ba1c50c56df0d49123842de5acce3aa78b44` |
| `assets/campus-logos/print/beirut.png` | beirut | mask | 213×92 | 2221 | `e573d9f8d927245ea02601cb13039063dc349739a99cc0b553c778b05a54d61b` |
| `assets/campus-logos/print/belo-horizonte.png` | belo-horizonte | mask | 454×144 | 7863 | `74af2be335050cac5bbc91f507ea1b1f8b4c94e73ebdf70e223b0c8d0ae06092` |
| `assets/campus-logos/print/berlin.png` | berlin | mask | 215×94 | 1940 | `5a42f1725fafd0e2d51b9037bad8d19ce2b611b986d2d5ce71622cc3c4b1331b` |
| `assets/campus-logos/print/codam.png` | codam | sticker (cropped [148, 33, 491, 177] of [640, 214]) | 343×144 | 14569 | `837d372a915f14f51192310200cb8dc1feab911ce40556cd0810c2983560780a` |
| `assets/campus-logos/print/firenze.png` | firenze | mask | 410×147 | 6743 | `e4656e6530000c8d420a1cb3a2bce8c29721a7ee248af7fbe89856bc0b7816f2` |
| `assets/campus-logos/print/gyeongsan.png` | gyeongsan | mask | 266×94 | 3664 | `747f7222155e15282d63f3d8af658215081cfef34b57054dba72377e0ab88362` |
| `assets/campus-logos/print/heilbronn.png` | heilbronn | mask | 398×146 | 4819 | `56dcaa7f8f7619e9d9605f95a672cf929d185818387d01ed608703ba2e291466` |
| `assets/campus-logos/print/irbid.png` | irbid | mask | 640×277 | 14054 | `4502f819331bfa0b99a84fb919f8104d1be0444c447dffabbd4069815d60cf63` |
| `assets/campus-logos/print/iskandar-puteri.png` | iskandar-puteri | mask | 531×145 | 11026 | `24ce860ac8c060a960a5fdf5f03d17a040676de43649434da6703f05dc1c6c86` |
| `assets/campus-logos/print/istanbul.png` | istanbul | mask | 157×55 | 2480 | `bffbc5867312534f0c2f58412e1beb5bad27098aa34fd8adcdf7a8c2483f6342` |
| `assets/campus-logos/print/kocaeli.png` | kocaeli | mask | 266×95 | 4632 | `2392619088e747c211b6fc9039c3c364a5c24b92892c81c78ab9b631390793dd` |
| `assets/campus-logos/print/kuala-lumpur.png` | kuala-lumpur | mask | 558×152 | 8685 | `052ed3f52bc6159265d84c5dfdd118fc3fcdae0202c8a85f5530ecd35a40bfcd` |
| `assets/campus-logos/print/lausanne.png` | lausanne | mask | 384×144 | 4731 | `d3f1f92299ab4896156278a03e03866e487700071ad94fedd1b6aa9cdc0271d9` |
| `assets/campus-logos/print/le-havre.png` | le-havre | mask | 352×140 | 6242 | `81d33fe98ca1dfa0a8a74812f89f3b6dd3b6eb3f286e964d6368db26aef80086` |
| `assets/campus-logos/print/lisboa.png` | lisboa | mask | 334×142 | 3794 | `addd6a9cedf313697c05785f6efb05e638eee619d0d1a02bdd3773ff0bfbe477` |
| `assets/campus-logos/print/london.png` | london | mask | 362×144 | 5824 | `3e3bccfe63ff97e3f482e4a22435a6c555b74a55374c10d3db710dfab8ef51fe` |
| `assets/campus-logos/print/luanda.png` | luanda | mask | 236×98 | 1863 | `9c5b3c9124b56113694f3d7972d571b4fca8fead65fa30628136d48fe60930fb` |
| `assets/campus-logos/print/luxembourg.png` | luxembourg | mask | 429×147 | 5563 | `d2f5d0177104ca5ece927e4df91c6ca9ed3cc20d7309b363bc1b90aa46309736` |
| `assets/campus-logos/print/lyon.png` | lyon | mask | 640×293 | 15281 | `4f24a19d6ca4f43de93d5dd831e62a87a6306857a4dce580a9e1031449d70f1a` |
| `assets/campus-logos/print/madrid.png` | madrid | mask | 506×150 | 7394 | `b2148d9f411e2d3a57fa08965bb5da769dbf8bf4d7c0a11ff6383321e0f7a2c4` |
| `assets/campus-logos/print/malaga.png` | malaga | mask | 505×150 | 7213 | `ba098ddefe0f45ee70d5233c10c850871cdf17a30a22273ad98ef82bf2145819` |
| `assets/campus-logos/print/marseille.png` | marseille | mask | 273×97 | 1244 | `77949898a3d1d6adf89cf2ec4140b94f2c0e0211f23cb9faa14bc9265eba2c50` |
| `assets/campus-logos/print/milano.png` | milano | mask | 169×65 | 1553 | `84b16baa6594a8e87cc6dc1a21a0a31d31e449891f09e70f089022557cf6249e` |
| `assets/campus-logos/print/mulhouse.png` | mulhouse | mask | 414×177 | 8443 | `8a421595d941222ef27ab282dd0800171463ca84c8bb940febef66d77e8393e6` |
| `assets/campus-logos/print/nablus.png` | nablus | mask | 223×92 | 2693 | `0d90a22eb9eba633f60e830523ea7b65abf28c6cb27493557d0b29dbc2907595` |
| `assets/campus-logos/print/nice.png` | nice | mask | 342×160 | 5975 | `38e093cc485d6efdaf8ec5b8d53303ea81d6757017ef8c4a06804e1750873804` |
| `assets/campus-logos/print/paris.png` | paris | mask | 193×138 | 1999 | `a88230d5c1951a90b4c64e2b92ca2d783b9f25407c50c57cd0de61de1467fd1d` |
| `assets/campus-logos/print/penang.png` | penang | mask | 499×138 | 8762 | `b70a88292e23c31914321eb282daa3a2c89713274312f4cedb292b9e3a3f5ca7` |
| `assets/campus-logos/print/perpignan.png` | perpignan | mask | 397×145 | 8733 | `eee38a17829bf59924aa8ddf55dc5b46961d596e85c67b03fab0ef1f89be521d` |
| `assets/campus-logos/print/porto.png` | porto | mask | 332×143 | 5314 | `f66a95c3bbf45d4ece1e76004008a3a4f57589aadeb71a74e192c96fe4accb8f` |
| `assets/campus-logos/print/prague.png` | prague | mask | 348×145 | 5820 | `5f71b22ffeefa9332aa43dc1227da786f391b80de1e1be267a62f6601ab527d0` |
| `assets/campus-logos/print/quebec.png` | quebec | mask | 347×144 | 3980 | `de1ea7a23ec91472874104227af8f462345b17b740206588f28bcddbf1d5405a` |
| `assets/campus-logos/print/rio.png` | rio | mask | 290×142 | 2967 | `9ad0bc9a82903dbfc2132f6f83eb604e21e598aeac8cc46b145406becb6de13c` |
| `assets/campus-logos/print/roma.png` | roma | mask | 323×142 | 4305 | `80e7d88526e6ccd162e48ae9592d42cd620618f67e910d2d8cb3c8f9ee894675` |
| `assets/campus-logos/print/sao.png` | sao | mask | 392×146 | 4460 | `5e748594cb222e0646e663b231f5dee669e2054356aafdb116b46d374faf296b` |
| `assets/campus-logos/print/seoul.png` | seoul | mask | 325×142 | 3822 | `19646c0ef68465cc10c52e2e1dde444c389a866eb38bd21385d4341a811ec5be` |
| `assets/campus-logos/print/singapore.png` | singapore | mask | 267×98 | 4821 | `ca2730a3805708a5b49d4c7a6b45e2a73f0ca4c06b1ecdba9f062f4cd7212c02` |
| `assets/campus-logos/print/tirana.png` | tirana | mask | 640×253 | 8687 | `cb53759e7d1e55e235e1a2f6f18f1034581495c8f0d22a2120d640ec97be6610` |
| `assets/campus-logos/print/tokyo.png` | tokyo | mask | 333×142 | 3833 | `2c6b7f62d69e552b4e480cb67afb8338216f1b48d5871197cd0dc52645c7088b` |
| `assets/campus-logos/print/urduliz.png` | urduliz | mask | 506×175 | 8651 | `25a21f9192a1bd488795739032e600afedaa62b76d7b881200ce4594d7c965d2` |
| `assets/campus-logos/print/vienna.png` | vienna | mask | 222×91 | 1913 | `df33f862e0234ea24fc25913cb67b46c3f36cbb4857aac0689c6af74f4301a2e` |
| `assets/campus-logos/print/warsaw.png` | warsaw | mask | 248×98 | 2120 | `c40781d8b45c5f4c5b08cb62bd36642163bc6bc91ece21c5d132a7b6f3a2aaef` |
| `assets/campus-logos/print/wolfsburg.png` | wolfsburg | mask | 407×146 | 4816 | `c0d6f729dabb85b6d79da2f220701675957f912168006453b448c3d5e0ed9775` |
| `assets/campus-logos/print/yerevan.png` | yerevan | mask | 362×144 | 4140 | `9805d69e996e9017ae8e3cc06929b50306f8e31fe7c23752580ea5db84553a18` |
| `assets/campus-logos/wels.svg` | wels | mask (original) | viewBox 222.64×96.5 | 1568 | `67800299e36203c36a9b238d79e77fc7f15c9df77b521a3ca89522fb5f432fcd` |
| `assets/campus-logos/zurich.svg` | zurich | mask (original) | viewBox 243.9×96.5 | 1614 | `1e70ff3e97cd42f697e1a57356aa6af61ce1a03b4fe8b02004d8cb60198a995e` |

## Limites

- **Paris** : le catalogue donne le seul signe « 42 », noir sur blanc, sans le mot Paris. Le logo blanc de la fiche campus provient d’une autre source et reste inchangé.
- Les quatre campus 1337 ont le même logo « 1337 », sans nom de ville.
- Originaux de faible définition : Milano 169×65, Marseille 273×97, Istanbul 300×100, Kocaeli 320×140. À 160 px, ils restent lisibles ; Milano est un peu flou sur un écran haute densité.
- Cadrages hétérogènes : les marges sont presque nulles pour Lyon, Irbid, Tirana, Marseille, Milano et les SVG, mais atteignent 30 à 36 % de la largeur de chaque côté pour Paris et 1337. À largeur égale, le « 42 » n’a donc pas la même taille d’un logo à l’autre.
- Codam associe le noir à des accents magenta et orange. La petite ligne sous « CODAM » est illisible à 160 px.
