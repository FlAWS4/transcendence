export const meta = {
  name: 'horizon-design-review-integration',
  description: 'Intègre au prototype actif (état 146) les 9 essais choisis par l’utilisateur, après archivage de l’état actuel, puis vérifie l’intégration de façon contradictoire',
  phases: [
    { title: 'Intégration', detail: 'archive de l’état 146, ajout de la feuille et du module, tests, références et comparaisons Chrome' },
    { title: 'Vérification', detail: 'contrôle contradictoire de l’archive, du périmètre, des tests et du rendu' },
  ],
}

const REPO = args.repo
const STUDY = args.study
const H = REPO + '/site'
const PKG = STUDY + '/integration-20261015'
const ARCH = H + '/archive/pre-design-review-selection-20261015'
const EVID = H + '/checks/20261015-design-review-selection'
const IDS = ['globe-espace-libre', 'police-etiquettes-globe', 'une-colonne-320', 'pseudo-manquant', 'roles-couleur', 'visiter-contour-sombre', 'lisibilite-textes', 'echelle-unifiee', 'awards-a-venir']

const CONTEXT = `Context: 42 Horizon web prototype (school project ft_transcendence; French-speaking owner). The owner selected nine design trials from the 14–15 Oct design-review study (${STUDY}; trials in essais/<id>/; selection test in checks/_selection-20261015/) and now explicitly asks: "Je veux que tu appliques tous les changements à l'original" — apply the nine selected trials (${IDS.join(', ')}) to the ORIGINAL active prototype ${H}. The other ten trials are NOT applied.

The integration package is ready and verified on the study copy: ${PKG}/design-review-selection.css (sha256 68c9986bf451fc95…) and ${PKG}/design-review-selection.mjs (sha256 0200f2ff846812a1…), with ${PKG}/PLAN.md (read it entirely first: the exact edits, cache identifiers, archive procedure, tests, references, and the analysis of the original's current state). Package equivalence: 36 states in 27 views, pixel-identical to the study copy with the nine trials except known WebGL noise. Preparation scripts and evidence: ${STUDY}/checks/_integration-20261015/preparation/ (equivalence.py, etat_actuel.py with INTEGRE=1 mode for after the integration, check_package_source.py, build_package.py).

The original is now in state 146 (controller welcome.mjs?v=audit-fixes-146, preview content-preview.mjs?v=113): another session fixed five audit defects today (archives ${H}/archive/pre-codex-audit-fixes-20261015/ = 144 and ${H}/archive/pre-audit-fixes-refinement-20261015/ = 145). That session has finished; nobody else is editing the original now. The study copy dates from state 144; PLAN.md lists the differences (D1–D5), notably the dark «Créer un compte» background (#1B1B1B, 4.51:1) that complements the visiter-contour-sombre boundary.

PROJECT RULES (AGENTS.md is injected; the ones that matter here): strict scope — change only what the integration needs; keep every earlier state consultable (archive before modifying); do not commit, push or publish; do not start or stop the local server (http://127.0.0.1:8765/ serves ${REPO}); do NOT edit PROJECT_CONTEXT.md, BOARDING_JOURNAL.md, README.md, AGENTS.md or the study NOTES.md (the main agent does). Code comments in English, concise; notes in French in the style of the existing *_NOTES.md files of ${H}; archive READMEs in English like the existing ones.

Chrome: use ONLY ${STUDY}/checks/helper.py (read its docstring and code): one Session at a time in your process, closed in a finally block; it shares a few slots with other agents, starts Chrome only with 3 GB free and caps each at 2.6 GB ('Chrome pipe closed' → fresh Session, fewer globe navigations per session); Bash timeouts of at least 600000 ms; if a call times out waiting for a slot, run it again. helper.py's ACTIVE constant points to ${H}/. Never kill processes by name or pattern (the owner's browser may be open). Open at most about 15 screenshots, preferably composed side-by-side crops at reduced size.`

const INTEGRATE = CONTEXT + `

ROLE: integrator. Follow PLAN.md, step by step:
0. Re-read ${H}/index.html and ${H}/content-preview.html (one content-report.css?v=3 line and one main module line each), run check_package_source.py (passed expected) and check the two package hashes.
1. Archive the current original (state 146) BEFORE any change, in ${ARCH}/, on the model of the two existing archives of today (README.md in English, snapshot.py adapted from theirs with this folder's own date, purpose, title and storage prefix horizon-archive-pre-design-review-selection-20261015-, snapshot-manifest.json, snapshot-verification.json, originals/, baseline/ with every local runtime dependency). Verify it (snapshot.py --verify) and check that its main entries answer HTTP 200 and render (one quick Chrome look at baseline/index.html and baseline/content-preview.html#explore). The archive must reproduce state 146 exactly (compare a few views of the archive with the current original before you change it).
2. Copy the two package files unchanged into ${H}/ and check their sha256.
3. Add exactly the lines of PLAN.md to index.html and content-preview.html (stylesheet after content-report.css?v=3, module after the main module), with the cache identifiers PLAN.md specifies. Change nothing else; do not touch welcome-panels.html or any other entry.
4. Run the original's full test suite from ${REPO}: node --test site/*.test.mjs site/tests/*.test.mjs (660/660 expected before; report the exact result after, and if a test fails, find out why before anything else).
5. References and HTTP: on the model of ${H}/checks/20261015-audit-fixes/146/references.py, check that the two new URLs answer 200 and are byte-identical to the sources, and that all local references of the two entries resolve.
6. Browser: run the preparation's etat_actuel.py with INTEGRE=1 (read it first; adapt paths only if needed, writing outputs under ${EVID}/) to compare the integrated original with the study copy + nine trials, and compare the integrated original with the archive (state 146 before the integration): differences must be exactly the nine trials' effects (study side) and only the D1–D5 areas (archive side). Cover at least: Explorer with the real globe 1440×900 FR light, 1366×768 AR and 390×844 dark; Projets 320×640 AR; Profils grid 1440 and 340 px; a project's comments tab with the sort panel opened low on the screen at 390×844 (D2); the account menu in dark (D3 + boundary); the arrival in dark and its error screen (D4); the Awards page FR→AR→EN without reload; welcome-panels.html still working without the package. No console error, no horizontal overflow.
7. Write ${H}/DESIGN_REVIEW_SELECTION_NOTES.md (French): the request (owner's words), the nine trials integrated with one line each (what changes for a visitor) and the earlier explicit decisions they revisit (from each essai.json decisionConcernee), the files added and the four lines added, cache identifiers, the archive link, the verifications with numbers, the limits (from the selection test and the trial sheets, updated for state 146: the «Créer un compte» contrast limit is lifted), and how to revert (remove the four lines). Link the study (${STUDY}/NOTES.md) and the archive README.
Put every script, result and screenshot under ${EVID}/. Return the structured summary (French).`

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    archive: { type: 'string' },
    fichiersModifies: { type: 'array', items: { type: 'string' } },
    fichiersAjoutes: { type: 'array', items: { type: 'string' } },
    tests: { type: 'string' },
    references: { type: 'string' },
    navigateur: { type: 'array', items: { type: 'string' } },
    ecarts: { type: 'array', items: { type: 'string' } },
    limites: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['archive', 'fichiersModifies', 'fichiersAjoutes', 'tests', 'references', 'navigateur', 'ecarts', 'limites', 'notes'],
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

const RETRY_NOTE = '\n\nNOTE: a previous attempt of this exact task was lost to API errors or a usage limit. Its files are on disk: check what it already did (archive, copies, entry edits, evidence) and continue from there; never redo the archive over an existing one, and never apply an entry edit twice.'
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

phase('Intégration')
const integration = await attempt(INTEGRATE, { label: 'intégration', phase: 'Intégration', schema: RESULT_SCHEMA })
if (!integration) return { integration: null, verification: null }
phase('Vérification')
const verification = await attempt(CONTEXT + `

ROLE: adversarial verifier AND fixer of the integration (the integrator's report is below). Be skeptical:
1. Archive ${ARCH}/: snapshot.py --verify passes; it really is state 146 (its manifest hashes equal the hashes of the original files other than the two edited entries and the two new files; its entries render); README accurate; nothing in the earlier archives changed.
2. Scope: compared with the archive manifest, the ONLY changes under ${H}/ are the two new package files (sha256 identical to ${PKG}), exactly two added lines in index.html and in content-preview.html, ${H}/DESIGN_REVIEW_SELECTION_NOTES.md, the archive folder and the evidence folder ${EVID}/. Any other change is a defect.
3. Re-run the full test suite yourself and the references/HTTP check.
4. Re-verify in Chrome a subset you choose, including what the integrator did not cover: the integrated original against the study copy + nine trials and against the archive; dark and light; FR/EN/AR; 1440×900, 390×844, 320×640 and one landscape; Explorer with the real globe; a language and a theme switch without reload; keyboard focus on the arrival and in a dialog. Look at the screenshots.
5. DESIGN_REVIEW_SELECTION_NOTES.md: every claim matches what you measured; the decisions revisited and the limits are complete and correct; the revert instructions work (try them on a scratch copy of the two entries if useful, never on the original).
Fix genuine defects only, minimally (integration files, the four added lines, the notes, the archive, the evidence); re-run what you changed. Write your scripts and results under ${EVID}/verification/. Return the structured verdict (French).

INTEGRATOR REPORT (JSON)
` + JSON.stringify(integration), { label: 'vérification', phase: 'Vérification', schema: VERIFY_SCHEMA })
return { integration, verification }
