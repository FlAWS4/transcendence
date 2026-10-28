export const meta = {
  name: 'verif-maquettes-figma',
  description: 'Compare chaque cadre Figma construit avec la capture du site (clair et sombre) et recense les défauts par cause',
  phases: [
    { title: 'Comparer', detail: 'un vérificateur par groupe de sections : planches site | Figma, cadre par cadre' },
    { title: 'Synthèse', detail: 'recoupe les défauts, écarte les faux positifs, les rattache au code' },
  ],
}

const BASE = '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015'
const DEFECTS = {
  type: 'object',
  properties: {
    sections: { type: 'array', items: { type: 'string' } },
    framesChecked: { type: 'number' },
    defects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          frame: { type: 'string' },
          element: { type: 'string' },
          observed: { type: 'string' },
          expected: { type: 'string' },
          severity: { type: 'string', enum: ['bloquant', 'visible', 'mineur'] },
          category: { type: 'string', enum: ['couleur', 'position', 'taille', 'texte', 'police', 'manquant', 'en trop', 'forme', 'thème sombre', 'autre'] },
          cause: { type: 'string' },
          board: { type: 'string' },
        },
        required: ['frame', 'element', 'observed', 'expected', 'severity', 'category'],
      },
    },
    notes: { type: 'string' },
  },
  required: ['sections', 'defects'],
}
const FIXES = {
  type: 'object',
  properties: {
    confirmed: { type: 'number' },
    refuted: { type: 'array', items: { type: 'string' } },
    fixes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          frames: { type: 'array', items: { type: 'string' } },
          rootCause: { type: 'string' },
          where: { type: 'string' },
          proposal: { type: 'string' },
          priority: { type: 'number' },
        },
        required: ['title', 'rootCause', 'where', 'proposal', 'priority'],
      },
    },
  },
  required: ['fixes'],
}

const area = args.area
const groups = args.groups   // [[ [sectionId(site-map), screenshotPath], ... ], ...]
// 16 Oct.: a new pass keeps the earlier ones (verification/<area>/<tag>/…, synthese-<tag>.md) and may list the defects
// of the previous pass to check one by one (args.focus)
const tag = args.tag || ''
const OUT = BASE + '/verification/' + area + (tag ? '/' + tag : '')
const focus = (args.focus ? '\nDéfauts de la passe précédente, à revérifier un par un (corrigé, partiellement, ou non) : ' + args.focus : '')
  + (args.known ? '\nLimites connues, à ne pas compter comme défauts : ' + args.known : '')

const COMMON = [
  'Projet 42 Horizon, dépôt /home/le-rif/Bureau/Transcendence, documents en français. Les maquettes Figma du site sont reconstruites en calques à partir de relevés exacts du prototype (méthode : ' + BASE + '/README.md).',
  'Tu vérifies le rendu Figma de la zone « ' + area + ' » contre les captures du site. LECTURE SEULE : tu n’écris que dans ' + OUT + '/. Aucun outil Figma, aucun Chrome.' + focus,
  'Outil : « cd ' + BASE + '/scripts && python3 section_frames.py ' + area + ' <id de section> <capture Figma de la section> ' + OUT + '/<id de section> » découpe la capture Figma de la section cadre par cadre (il détecte la marge de l’export) et écrit, pour chaque cadre, une planche « site | Figma » à la même échelle. index.json donne la part de pixels différents (changed), l’écart moyen par canal (meanRGB) et la part de pixels dont un canal s’écarte de plus de 12 niveaux (channelOff12) : ces deux dernières mesures révèlent les dérives de teinte. Les cadres sombres de Figma sont des clones en mode Sombre : compare-les aux captures sombres du site.',
  'Ouvre les planches avec l’outil Read (toutes, en commençant par les plus différentes). Les petites différences d’anticrénelage, de lissage des polices ou d’une demi-ligne ne sont pas des défauts. Cherche : éléments manquants ou en trop, mauvaises couleurs (surtout en sombre), textes faux ou coupés, mauvaise police, positions ou tailles décalées, formes (rayons, bordures, ombres, flou) différentes, globe ou images absents.',
].join('\n')

phase('Comparer')
const results = await parallel(groups.map((g, i) => () => agent(
  COMMON + '\n\nTes sections : ' + g.map(([sid, png]) => sid + ' (capture Figma : ' + png + ')').join(', ') + '.\n' +
  'Pour chaque défaut, précise le cadre, l’élément, ce que montre Figma, ce que montre le site, la gravité (bloquant : l’écran est faux ; visible : on le remarque ; mineur : à peine), la catégorie, une hypothèse de cause (relevé, conversion dom2fig.py, moteur render.js, ressource, variable de couleur) et le chemin de la planche.',
  { label: 'comparer:' + g.map(x => x[0]).join('+'), phase: 'Comparer', schema: DEFECTS })))

phase('Synthèse')
const all = results.filter(Boolean)
const synth = await agent(
  COMMON + '\n\nVoici les défauts relevés par ' + all.length + ' vérificateurs : ' + JSON.stringify(all).slice(0, 60000) + '\n\n' +
  'Ton rôle : 1) rouvrir les planches des défauts « bloquant » et « visible » et écarter ceux qui n’en sont pas (liste les écartés avec la raison) ; ' +
  '2) regrouper les défauts confirmés par cause commune ; 3) pour chaque cause, lire le code concerné (' + BASE + '/scripts/dom2fig.py, render.js, figlib.py, assets.py, layout.py, et les relevés dom/' + area + '/*.json.gz si utile) et proposer un correctif précis (fichier, fonction, logique), sans rien modifier ; 4) classer par priorité (1 = à corriger d’abord). Écris aussi ' + BASE + '/verification/' + area + '/synthese' + (tag ? '-' + tag : '') + '.md (français, concis).',
  { label: 'synthese', phase: 'Synthèse', schema: FIXES })
return { area, defects: all, synthesis: synth }
