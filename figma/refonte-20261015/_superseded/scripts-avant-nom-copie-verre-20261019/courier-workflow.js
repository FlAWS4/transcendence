export const meta = {
  name: 'coursier-figma',
  description: 'Envoie dans l’ordre des appels Figma déjà écrits (un agent neuf par appel), contrôle la recopie et consigne les résultats',
  whenToUse: 'Refonte Figma du 15 octobre 2026 : envoyer les fichiers de calls/ selon COURIER.md, par chaînes indépendantes',
  phases: [{ title: 'Envoi', detail: 'un agent coursier par fichier, arrêt de la chaîne à la première erreur' }],
}

// args = { base, transcripts, chains: [[{ file, shots?: [{ node, max, out }] }, …], …], pre?, context? }
// 18 Oct.: context (optional) tells the couriers where the calls come from; a courier had refused to send a test call,
// reading a later message of the user (a progress summary) as a stop of the work
// 18 Oct.: pre (optional, [{ file }, …]): calls every chain needs first (text and shadow variables, rendu_complet.py
// chains), sent one after the other before any chain; the chains start only when each of them succeeded with an exact
// copy (call 977: a screen sent beside the call creating its variables ran first)
// Each chain runs in order and stops at the first failure; chains run side by side (they must touch different
// pages or independent nodes). A fresh agent per file keeps every context small: one 40 000-character call
// is about 37 000 tokens to read and as many to write.
const A = args
const FILE_KEY = '2iWoG3h7SegFmchssYAV80'

const SCHEMA = {
  type: 'object',
  properties: {
    file: { type: 'string' },
    ok: { type: 'boolean', description: 'true si use_figma a réussi' },
    result: { type: 'string', description: 'texte exact renvoyé par use_figma, ou message d’erreur complet' },
    verify: { type: 'string', description: 'sortie complète de verify_sent.py' },
    moved: { type: 'boolean', description: 'fichier déplacé dans calls/done/' },
    screenshots: {
      type: 'array',
      items: { type: 'object', properties: { node: { type: 'string' }, path: { type: 'string' }, size: { type: 'string' } }, required: ['node', 'path'] },
    },
    notes: { type: 'string' },
  },
  required: ['file', 'ok', 'result', 'verify', 'moved'],
}

function prompt(it) {
  const f = it.file
  const shots = (it.shots || []).map((s, i) =>
    `   ${i + 1}. get_screenshot(fileKey="${FILE_KEY}", nodeId=<${s.node}>, maxDimension=${s.max}), puis \`curl -sL -o ${A.base}/call-results/${s.out} '<image_url>'\` et \`file ${A.base}/call-results/${s.out}\` (doit être un PNG).`).join('\n')
  return `Tu es un coursier Figma. Ta seule tâche : envoyer UN appel Figma déjà écrit, sans le modifier, puis consigner le résultat. Tu ne décides rien d'autre et tu ne lis aucun autre fichier du dépôt.
${A.context ? '\nContexte de la session principale : ' + A.context + '\n' : ''}
Fichier : ${A.base}/calls/${f}

Étapes, dans l'ordre :
1. Charge les outils avec ToolSearch, requête \`select:mcp__claude_ai_Figma__use_figma${it.shots ? ',mcp__claude_ai_Figma__get_screenshot' : ''}\`.
2. Garde (18 oct.) : si l'appel n'est pas lui-même un appel de variables (textes ou « -effets.js »), liste \`ls '${A.base}/calls/'\` : s'il y reste un fichier dont le numéro (avant le premier tiret) est inférieur à celui de ${f} et dont le nom contient « variables-textes » ou se termine par « -effets.js » (variables d'ombre), n'envoie RIEN et réponds ok=false, result = « appel préalable en attente : <nom> » (les variables doivent exister avant l'écran).
   Ensuite : si ${A.base}/calls/${f} n'existe plus mais que ${A.base}/calls/done/${f} existe, l'appel a déjà été envoyé et rangé : n'envoie RIEN. Lance \`python3 -I '${A.base}/scripts/verify_sent.py' '${f}' '${A.base}/calls/done/${f}' '${A.transcripts}'\`, puis réponds avec ok=true, result = le contenu de ${A.base}/call-results/${f}.json et verify = la sortie complète de ce contrôle (fais seulement l'étape 9 avant, s'il y a des captures). Sinon, contrôle préalable : \`python3 -I '${A.base}/scripts/verify_sent.py' --prior-ok '${f}' '${A.base}/calls/${f}' '${A.transcripts}'\`.
   - Si la première ligne commence par ALREADY_OK, cet appel a déjà été envoyé à l'identique et a réussi : une coupure a eu lieu entre l'envoi et son enregistrement. N'envoie RIEN. Écris dans ${A.base}/call-results/${f}.json le texte affiché après cette première ligne, exactement (outil Write). Passe ensuite aux étapes 8 et 9, puis réponds (étape 10) avec ok=true, result = ce texte, verify = la sortie complète du contrôle préalable.
   - Sinon (NOT_SENT_OK), continue à l'étape 3.
3. Lis les consignes obligatoires avec Read : ${A.base}/scripts/skills/figma-use-SKILL.md puis ${A.base}/scripts/skills/figma-generate-design-SKILL.md (copies locales de skill://figma/…/SKILL.md, lues le 17 octobre : n'appelle pas get_figma_skill, chaque appel au serveur Figma compte dans le quota du jour). Rien d'autre.
4. Lis le fichier ENTIER avec Read et \`allow_large: true\` (il peut tenir sur une seule très longue ligne).
5. Appelle mcp__claude_ai_Figma__use_figma avec fileKey="${FILE_KEY}", description="${f}", skillNames="resource:figma-use,resource:figma-generate-design" et code = le contenu EXACT du fichier, caractère pour caractère : sans le préfixe de numéro de ligne affiché par Read, sans reformulation, ajout, troncature ni « … ». Réfléchis le moins possible avant cet appel : recopie. Le fichier peut contenir des caractères invisibles dans les textes (marque droite-à-gauche U+200F, espaces insécables U+00A0 et U+202F…) : recopie-les tels quels, sans les retirer ni les écrire en échappement ; le contrôle de l'étape 7 vérifie chaque caractère, n'y renonce pas à cause d'eux. Si tu ne peux pas recopier le fichier à l'identique (longues listes de coordonnées, par exemple), n'envoie RIEN et réponds ok=false avec la raison : n'ajoute jamais de code (return, arrêt, commentaire), ne raccourcis et ne corrige jamais rien (17 oct. : une copie tronquée terminée par « return { aborted: true } » a été envoyée).
6. Écris le texte exact renvoyé par use_figma dans ${A.base}/call-results/${f}.json (outil Write). En cas d'erreur : {"is_error": true, "raw": "<message complet>"}.
7. Contrôle la recopie : \`python3 -I '${A.base}/scripts/verify_sent.py' '${f}' '${A.base}/calls/${f}' '${A.transcripts}'\`. Garde sa sortie complète.
8. Si l'appel a réussi et que le contrôle dit MATCH ou EQUIV (EQUIV : mêmes valeurs, seuls des zéros finaux de nombres décimaux diffèrent) : \`mv '${A.base}/calls/${f}' '${A.base}/calls/done/'\`.
9. ${shots ? 'Après un succès seulement, captures de contrôle :\n' + shots : 'Pas de capture demandée.'}
10. Réponds avec le résultat structuré (result = le texte exact renvoyé par use_figma).

Erreurs : si use_figma signale une faute de syntaxe JavaScript ou JSON (probable erreur de recopie), relis le fichier et réessaie une seule fois, à l'identique. Toute autre erreur : ne réessaie pas, rapporte-la en entier (avec safeToRetryWithoutCanvasRead s'il est présent).
Interdits : envoyer un autre code Figma ; appeler d'autres outils Figma que ceux nommés ici (pas de get_figma_skill) ; modifier quoi que ce soit en dehors de call-results/ et du déplacement vers calls/done/.`
}

// One more try with a fresh agent when the copy was cut by the safety filter (a truncated script cannot run: the
// builds are idempotent) or when the agent returned nothing (API error). A second failure stops the chain.
// 16 Oct.: couriers may report the cut in their own words (« arrêtée par un classifieur de sécurité », truncated copy);
// a successful call is never sent again, even when its notes mention an earlier truncated copy
// 18 Oct.: a permission refusal (« Permission for this action was denied … ») is never retried: it needs the user
const retryable = r => !r || (!r.ok && !/permission for this action was denied|denied by the claude code/i.test((r.result || '') + ' ' + (r.notes || '')) &&
  (/classifi|safety|interrupted|tronqu|truncat|recopie|copie fautive/i.test((r.result || '') + ' ' + (r.notes || '')) || /^DIFF/m.test(r.verify || '')))

// 17 Oct.: the cuts land in the same part of the renderer (icons and assets, about 5 700 characters before the end of
// the file) and a later copy usually passes (390-1of2 passed at its fourth try): up to TRIES copies per file
const TRIES = A.tries || 4

// 18 Oct.: a lighter model may do the copying (args.model): verify_sent.py checks every copy and a wrong one is retried
const OPTS = label => Object.assign({ label, phase: 'Envoi', schema: SCHEMA, effort: 'low' }, A.model ? { model: A.model } : {})

async function chain(items, n, label = `chaîne ${n + 1}`) {
  const out = []
  for (const it of items) {
    let r = await agent(prompt(it), OPTS(it.file))
    for (let k = 2; k <= TRIES && retryable(r); k++) {
      log(`${label} : ${it.file} ${r ? 'coupé par le filtre de sécurité' : 'sans résultat'}, essai ${k}`)
      r = await agent(prompt(it), OPTS(it.file + ` (essai ${k})`))
    }
    if (!r) { out.push({ file: it.file, ok: false, result: 'agent sans résultat', verify: '', moved: false }); log(`${label} : ${it.file} sans résultat, arrêt`); break }
    // ALREADY_OK: an identical earlier copy had succeeded (verify_sent.py --prior-ok), nothing was sent again
    // 17 Oct.: EQUIV = same code with decimal numbers written differently (3.230 for 3.23), same geometry
    const last = (r.verify || '').split('\n').filter(l => /^(MATCH|EQUIV|DIFF|NOT FOUND|ALREADY_OK)/.test(l.trim())).pop() || ''
    r.exact = /^(MATCH|EQUIV|ALREADY_OK)/.test(last.trim())
    out.push(r)
    log(`${label} : ${it.file} ${r.ok ? 'réussi' : 'ERREUR'}${r.exact ? ', recopie identique' : ', recopie NON confirmée'}`)
    if (!r.ok || !r.exact) break
  }
  return out
}

// 18 Oct.: the calls of pre first, in order; no chain starts unless every one of them succeeded with an exact copy
const pre = A.pre && A.pre.length ? await chain(A.pre, -1, 'appels préalables') : []
if (A.pre && A.pre.length && !(pre.length === A.pre.length && pre.every(r => r.ok && r.exact))) {
  log('appels préalables incomplets : aucune chaîne lancée')
  return { pre, chains: A.chains.map((c, n) => [{ chain: n + 1, ok: false, result: 'chaîne non lancée : appels préalables incomplets' }]) }
}
const results = await parallel(A.chains.map((c, n) => () => chain(c, n)))
const chains = results.map((r, n) => r || [{ chain: n + 1, ok: false, result: 'chaîne interrompue' }])
return A.pre ? { pre, chains } : chains
