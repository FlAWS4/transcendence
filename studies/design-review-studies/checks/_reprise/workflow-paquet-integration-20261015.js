export const meta = {
  name: 'horizon-design-review-integration-package',
  description: 'Prépare dans l’étude, sans toucher au prototype actif, le paquet d’intégration des 9 essais choisis par l’utilisateur et vérifie son équivalence au pixel près avec la combinaison testée',
  phases: [
    { title: 'Préparation', detail: 'une feuille et un module autonomes, plan précis des changements de l’original' },
    { title: 'Vérification', detail: 'contrôle contradictoire de l’équivalence et du code' },
  ],
}

const REPO = args.repo
const STUDY = args.study
const H = REPO + '/site'
const PKG = STUDY + '/integration-20261015'
const EVID = STUDY + '/checks/_integration-20261015'
const IDS = ['globe-espace-libre', 'police-etiquettes-globe', 'une-colonne-320', 'pseudo-manquant', 'roles-couleur', 'visiter-contour-sombre', 'lisibilite-textes', 'echelle-unifiee', 'awards-a-venir']

const CONTEXT = `Context: 42 Horizon web prototype (school project ft_transcendence; French-speaking owner). On 14–15 Oct 2026 nineteen optional design trials were built on an isolated frozen copy of the active prototype (study ${STUDY}, copy in baseline/, trials in essais/<id>/, loader essais/boot.js + styles.js + modules.mjs). The owner selected nine trials, the combination was tested and fixed on 15 Oct (checks/_selection-20261015/), and the owner now asks to apply them to the ORIGINAL prototype ${H} ("Je veux que tu appliques tous les changements à l'original").

The nine trials, in the canonical order of essais/boot.js (stylesheets are inserted in this order, after all baseline stylesheets): ${IDS.join(', ')}. Read each essai.css, essai.mjs, early.js (echelle-unifiee only, a no-op) and essai.json. Seven are CSS-only (their essai.mjs are no-op install functions); pseudo-manquant and awards-a-venir have real behaviour. None uses the study bridge window.horizonStudy or the shared fonts. Cross-trial conditions exist only as ':root[data-essais~=lisibilite-textes]' in globe-espace-libre (globe bands adapted on 15 Oct) and echelle-unifiee (two rules): in the original all nine are always on, so those conditions become unconditional. In the study, modules.mjs imported each essai.mjs after the controller initialised (it waited for window.horizonStudy, defined at the end of the copy's welcome.mjs) and called its default export with {id, horizon, root: document.documentElement, has}.

IMPORTANT — another Claude Code session is working on the ORIGINAL right now (audit fixes of 15 Oct, "state 145", verification running). NEVER modify anything under ${H} (read it freely) and never modify ${STUDY}/baseline, ${STUDY}/originals, ${STUDY}/snapshot*, ${STUDY}/essais/ or other trials' checks. Write only under ${PKG}/ (the package) and ${EVID}/ (scripts, results, screenshots). Do not commit, push or publish; do not start or stop the local server (http://127.0.0.1:8765/ serves ${REPO}).

Chrome: use ONLY ${STUDY}/checks/helper.py (read its docstring and code): one Session at a time in your process, closed in a finally block; helper.py shares a few slots with other agents, starts Chrome only with 3 GB free, caps each at 2.6 GB ('Chrome pipe closed' → open a fresh Session, fewer globe navigations per session); Bash timeouts of at least 600000 ms; if a call times out waiting for a slot, run it again. Another session may run its own Chrome: never kill processes by name or pattern. Open at most about 15 screenshots, preferably composed side-by-side crops at reduced size. Code comments in English, concise, in the repository's compact style; documents in French.`

const PREPARE = CONTEXT + `

ROLE: build and verify the integration package.
1. ${PKG}/design-review-selection.css: the nine essai.css merged in the canonical order, each section headed by a one-line English comment naming the trial and its purpose. Resolve the ':root[data-essais~=lisibilite-textes]' conditions so they always apply WITHOUT changing the cascade: keep the same specificity (for example ':root:root', with a comment explaining it stands for the former trial condition) unless you prove by measurement that a simpler selector gives the identical result. Remove nothing else, change no value. Product-neutral names are welcome for trial-specific hooks that will live in the original (for example the class .essai-awards-a-venir, the attribute data-pseudo-manquant, custom properties --essai-*): rename consistently in CSS and JS only if every occurrence is covered, otherwise keep them; list every rename.
2. ${PKG}/design-review-selection.mjs: one standalone ES module with the behaviour of pseudo-manquant and awards-a-venir (same logic, same localised copy FR/EN/AR, same observers), installed exactly once. Decide how the original should start it so the timing matches the study (after the controller has built #content-index and #main): either an import at the very end of the original welcome.mjs (where the study bridge sits in the copy) or a module script with a safe wait for those elements. Prefer the option that changes the fewest existing original files; justify it.
3. Equivalence check, without touching the original: open the study copy (baseline/content-preview.html and baseline/index.html) WITHOUT any trial and inject your package (for example with Page.addScriptToEvaluateOnNewDocument adding the stylesheet link at the end of <head> and importing the module the way you propose for the original); compare with the same URL using ?essais=${IDS.join(',')}. Expect pixel-identical renders and identical computed styles on: Explorer with the real globe at 1440×900 light FR, 1366×768 AR, 667×375 AR and 390×844 dark; Projets at 320×640 AR and 1440×900; Profils grid and list at 1440×900 and 340 px; Chroniques 390×844 dark; a project detail with its comments tab; the profile profile-leila-mansour; the filter dialog; the account menu in dark; the arrival page in light and dark (page="index.html"); the Awards page FR, EN and AR. Also a language switch and a theme switch without reload (the Awards note and the pseudo rows must follow). No console error.
4. ${PKG}/PLAN.md (French): the exact, minimal edits to apply later to the original: files to add, lines to add in index.html and content-preview.html (and welcome.mjs if chosen), the cache identifiers to introduce or bump (read how the entries version their assets today, e.g. welcome.mjs?v=..., and follow that convention), what must NOT change, and how to archive the current original first (model: ${H}/archive/pre-codex-audit-fixes-20261015/README.md and its snapshot.py — say whether that script can be reused with a new output folder and storage prefix, after reading it). Also list the original's test commands (see the README of the repository and ${H}/tests/) and any test that inspects the entries' asset lists and would need an update.
5. Note every difference between the study copy (taken on 14 Oct, state 144) and the current original (state 145) that touches the same elements as the nine trials (read ${H}/archive/pre-codex-audit-fixes-20261015/README.md and diff the relevant original files against ${STUDY}/baseline/), in particular the dark contrast of «Créer un compte» (audit fix D3) versus visiter-contour-sombre and roles-couleur: what the combined result will be, and whether the package needs an adjustment for state 145 (propose it; do not apply it to the original).
Write scripts, results and screenshots under ${EVID}/preparation/. Return the structured summary (French).`

const PREP_SCHEMA = {
  type: 'object',
  properties: {
    fichiers: { type: 'array', items: { type: 'string' } },
    renommages: { type: 'array', items: { type: 'string' } },
    demarrageModule: { type: 'string' },
    equivalence: { type: 'object', properties: { passed: { type: 'boolean' }, vues: { type: 'number' }, ecarts: { type: 'array', items: { type: 'string' } } }, required: ['passed', 'vues', 'ecarts'] },
    planOriginal: { type: 'array', items: { type: 'string' } },
    differences145: { type: 'array', items: { type: 'string' } },
    ajustementsProposes: { type: 'array', items: { type: 'string' } },
    limites: { type: 'array', items: { type: 'string' } },
  },
  required: ['fichiers', 'renommages', 'demarrageModule', 'equivalence', 'planOriginal', 'differences145', 'ajustementsProposes', 'limites'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['validé', 'corrigé', 'réserves'] },
    problemesTrouves: { type: 'array', items: { type: 'string' } },
    corrections: { type: 'array', items: { type: 'string' } },
    verificationsRejouees: { type: 'array', items: { type: 'string' } },
    reservesRestantes: { type: 'array', items: { type: 'string' } },
  },
  required: ['verdict', 'problemesTrouves', 'corrections', 'verificationsRejouees', 'reservesRestantes'],
}

const RETRY_NOTE = '\n\nNOTE: a previous attempt of this exact task was lost to API errors or a usage limit. Its files are on disk: continue from what it already wrote instead of starting over.'
async function attempt(prompt, opts) {
  const first = await agent(prompt, opts)
  if (first) return first
  for (const suffix of [' (reprise)', ' (reprise 2)', ' (reprise 3)']) {
    log(opts.label + ' interrompu : nouvelle tentative')
    const next = await agent(prompt + RETRY_NOTE, { ...opts, label: opts.label + suffix })
    if (next) return next
  }
  log(opts.label + ' interrompu quatre fois : étape abandonnée')
  return null
}

phase('Préparation')
const prep = await attempt(PREPARE, { label: 'préparation', phase: 'Préparation', schema: PREP_SCHEMA })
if (!prep) return { prep: null, verification: null }
phase('Vérification')
const verification = await attempt(CONTEXT + `

ROLE: adversarial verifier AND fixer of the integration package in ${PKG}/ (the preparer's report is below). Be skeptical:
1. Diff design-review-selection.css against the nine essai.css: every rule present once, in canonical order, no value changed, conditions resolved with an identical cascade, renames complete (CSS and JS), comments accurate.
2. Read design-review-selection.mjs against the two essai.mjs: same behaviour, single installation, no dependency on the study loader, correct start timing for the proposal in PLAN.md.
3. Re-run the equivalence check yourself on a subset you choose (at least Explorer with the real globe in AR, Profils grid at 340 px, the Awards page with a language switch, the arrival page in dark, a project's comments tab) plus anything the preparer did not cover; look at the screenshots.
4. Check PLAN.md: minimal, complete, consistent with how the original versions its assets, archive procedure realistic (read the snapshot.py it relies on), tests listed; and the analysis of state 145 (especially «Créer un compte» in dark).
Fix real defects only inside ${PKG}/ and ${EVID}/; write your scripts and results under ${EVID}/verification/. Return the structured verdict (French).

PREPARER REPORT (JSON)
` + JSON.stringify(prep), { label: 'vérification', phase: 'Vérification', schema: VERIFY_SCHEMA })
return { prep, verification }
