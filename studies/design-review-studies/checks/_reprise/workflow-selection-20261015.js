export const meta = {
  name: 'horizon-design-review-selection-check',
  description: 'Teste en combinaison la sélection de l’utilisateur (9 essais issus de l’avis sur le design), corrige les conflits entre essais et revérifie le résultat',
  phases: [
    { title: 'Contrôles', detail: 'deux contrôles parallèles en lecture seule : Explorer, arrivée et Awards ; rubriques, fiches et dialogues' },
    { title: 'Intégration', detail: 'corrections minimales des conflits, puis contrôle final de la sélection' },
  ],
}

const REPO = args.repo
const STUDY = args.study
const SCRATCH = args.scratch
const OUT = STUDY + '/checks/_selection-20261015'
const SELECTION = ['globe-espace-libre', 'police-etiquettes-globe', 'une-colonne-320', 'pseudo-manquant', 'roles-couleur', 'visiter-contour-sombre', 'lisibilite-textes', 'echelle-unifiee', 'awards-a-venir']

const CONTEXT = `You are checking a COMBINATION of design trials ("essais") for the 42 Horizon web prototype (school project ft_transcendence). On 14–15 Oct 2026 nineteen separate, optional trials were built on an isolated frozen copy of the site and each was verified alone by an adversarial agent. The project owner (French-speaking) has now picked the trials they like, by their gallery numbers 1, 3, 7, 9, 12, 13, 15, 18 and 19:
- globe-espace-libre (01, Globe dans l’espace libre)
- police-etiquettes-globe (03, Étiquettes du globe en Jost)
- une-colonne-320 (07, Une colonne sous 360 px)
- pseudo-manquant (09, Sans « pseudo à renseigner »)
- roles-couleur (12, Rôles de couleur unifiés)
- visiter-contour-sombre (13, Contour de « Visiter » en sombre)
- lisibilite-textes (15, Textes plus lisibles)
- echelle-unifiee (18, Échelle et arrondis unifiés)
- awards-a-venir (19, Page Awards « à venir »)
Goal: make sure these nine work TOGETHER exactly as they do alone. This is not an integration into the active site: nothing outside the study changes.

Do NOT edit PROJECT_CONTEXT.md, BOARDING_JOURNAL.md, README.md, AGENTS.md or any NOTES.md; the main agent updates them.

STUDY LAYOUT AND LOADER
- Study root ${STUDY}, served at http://127.0.0.1:8765/studies/design-review-studies/ . baseline/ is a frozen copy of the prototype (never edit it; "python3 -I ${STUDY}/snapshot.py --verify" fails if one byte changes). Entries: baseline/index.html (arrival: encrypted scan, Se connecter / Visiter, then globe) and baseline/content-preview.html (skips the arrival). Hash routes: #explore, #projects, #people, #journal, #awards; details #projects/<id>?tab=overview|implementation|media|test|comments, #people/<id>?tab=overview|projects|path|contribution, #journal/<id>?tab=article|media|authors|comments; Explorer scope #explore?country=FRA&campus=paris. Sample ids: ft-transcendence-building-together, profile-leila-mansour, journal-an-evening-debugging.
- URL query: ?essais=id1,id2 activates trials; ?theme=light|dark; ?lang=fr|en|ar. essais/boot.js defines the canonical order: stylesheets are inserted in that order, so at equal specificity the later trial wins (order: globe-espace-libre, police-etiquettes-globe, une-colonne-320, roles-couleur, visiter-contour-sombre, lisibilite-textes, echelle-unifiee, pseudo-manquant, awards-a-venir — check boot.js). early.js runs before the baseline modules for echelle-unifiee.
- Each trial lives in essais/<id>/ (essai.css, essai.mjs, essai.json, early.js for echelle-unifiee) with its own checks in checks/<id>/. Read the nine essai.json (problem, change, verifications, limits) and their essai.css/essai.mjs before checking. checks/<id>/ also holds the scripts their authors and verifiers wrote: reuse them where useful.

KNOWN INTERACTION RISKS (from the trial sheets — check them first)
1. globe-espace-libre shrinks the world globe between fixed bands measured on the copy (filter pill, stats line « 58 campus · 30 pays », status line « Exploration · 42 Horizon », search capsule). lisibilite-textes and echelle-unifiee change text sizes, radii and shadows and may move or enlarge those elements: the shrunk disc may collide again, or the air may be wrong. Measure the disc (horizon.globe.getWorldScreenGeometry() through window.horizonStudy) against the real rects at 1440×900, 1366×768, 1280×720, 1920×1080, 667×375 and 390×844, with the REAL globe.
2. police-etiquettes-globe sets the globe label font; check that lisibilite-textes and echelle-unifiee leave globe labels alone (lisibilite says it excludes .hg-marker) or at least do not break them.
3. une-colonne-320 + pseudo-manquant + lisibilite-textes + echelle-unifiee on Projets/Chroniques/Profils grids and lists at 320, 340, 360 and 390 px: one column below 360 px, no broken word in names, no collision, no clipped chip, rows still level.
4. roles-couleur + visiter-contour-sombre + lisibilite-textes + echelle-unifiee on buttons and dialogs (filter dialog Appliquer/Annuler/Réinitialiser, comments Ajouter/Emoji, report dialog, message composer, sign-in and sign-up dialogs, repository-link form, account menu, arrival Visiter/Se connecter): colours from roles-couleur, radii and shadows from echelle-unifiee, sizes from lisibilite-textes. Every button text at least 4.5:1, Visiter boundary at least 3:1 in dark, Visiter and Se connecter still the same dimensions (explicit decision of 13 Oct), no clipped label, visible focus.
5. awards-a-venir with echelle-unifiee and lisibilite-textes: message size and position, no overlap with the header fade or the dock.

HARD RULES
- Verify in Chrome with ${STUDY}/checks/helper.py (read its docstring and code first): Session.open(route, essais=[...], theme=..., lang=..., viewport=D|M|S|L, block_globe=..., page='content-preview.html'|'index.html'), shot(), js(), rect(), style(), errors(), overflow(), image_diff(), contrast(). Compare three states where useful: no trial (baseline), each relevant trial alone, and the nine together. Open (Read) the screenshots you cite — never claim a visual result you did not see.
- MEMORY: /tmp is a RAM-backed tmpfs and this machine has little free RAM (the owner's browser may be open, swap is full). helper.py allows a few headless Chrome at a time on the whole machine (shared slots, lowered automatically when memory is low) and starts one only with 3 GB free — Session() waits, printing 'Waiting for the shared headless Chrome slot…'; if a Bash call times out while waiting, run it again. Each Chrome is capped at 2.6 GB: if it dies ('Chrome pipe closed'), open a fresh Session and do fewer globe navigations per session (at most about 6). A guard may stop a check Chrome when memory is critically low: retry. Run ONE Session at a time in your process, close it in a finally block, use Bash timeouts of at least 600000 ms for long checks. Never kill processes by name or pattern (no pkill/killall): the owner's browser may be open.
- IMAGES: open at most about 15 screenshots, preferably composed side-by-side crops at reduced size (PIL).
- Strict scope (explicit user rule of 13 Oct 2026): a trial changes only what its spec describes. When a conflict appears, the fix must stay inside the scope of the trials concerned, minimal, and must not change how each trial looks ALONE unless that is the only way (then say so).
- Do not commit, push or publish. Do not start or stop the local server. Code comments in English, concise; reports and essai.json text in French.`

const CHECK_SCHEMA = {
  type: 'object',
  properties: {
    zone: { type: 'string' },
    vues: { type: 'array', items: { type: 'string' } },
    passed: { type: 'boolean' },
    problemes: { type: 'array', items: { type: 'object', properties: {
      description: { type: 'string' }, gravite: { type: 'string', enum: ['bloquant', 'visible', 'mineur'] },
      essaisEnCause: { type: 'array', items: { type: 'string' } }, preuves: { type: 'array', items: { type: 'string' } },
      correctionProposee: { type: 'string' },
    }, required: ['description', 'gravite', 'essaisEnCause', 'preuves', 'correctionProposee'] } },
    effetsPresents: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['zone', 'vues', 'passed', 'problemes', 'effetsPresents', 'notes'],
}

const FINAL_SCHEMA = {
  type: 'object',
  properties: {
    passed: { type: 'boolean' },
    problemesTraites: { type: 'array', items: { type: 'object', properties: {
      description: { type: 'string' }, conclusion: { type: 'string', enum: ['conflit corrigé', 'défaut d’un essai corrigé', 'fausse alerte', 'non corrigé'] },
      correction: { type: 'string' }, preuves: { type: 'array', items: { type: 'string' } },
    }, required: ['description', 'conclusion', 'correction', 'preuves'] } },
    fichiersModifies: { type: 'array', items: { type: 'string' } },
    verificationsFinales: { type: 'array', items: { type: 'string' } },
    limites: { type: 'array', items: { type: 'string' } },
    snapshotVerify: { type: 'string' },
    lienCombinaison: { type: 'string' },
  },
  required: ['passed', 'problemesTraites', 'fichiersModifies', 'verificationsFinales', 'limites', 'snapshotVerify', 'lienCombinaison'],
}

const ZONES = [
  { key: 'explorer-arrivee-awards', text: 'Explorer at world, country (France) and campus (42 Paris, campus sheet) levels with the REAL globe — risks 1 and 2 — at 1440×900 light FR, 1366×768, 1280×720, 1920×1080, 667×375, 390×844 dark FR and 320×640 AR light; the arrival page (page="index.html": encrypted scan, Visiter / Se connecter in light and dark, sign-in dialog) — the arrival part of risk 4; the Awards page and the header/dock — risk 5; one view in English.' },
  { key: 'rubriques-fiches-dialogues', text: 'Projets, Chroniques and Profils lists (grid and list views) at 1440×900 light FR, 390×844 dark FR, 360, 340 and 320×640 AR light — risk 3; the project detail (overview and comments tabs), the profile detail (profile-leila-mansour) and an article; the dialogs and menus of risk 4 except the arrival page (filter dialog, comment form, report dialog, message composer, account menu with its sign-in / sign-up dialogs, repository-link form of the « Tester le projet » tab); one view in English.' },
]

const RETRY_NOTE = '\n\nNOTE: a previous attempt of this exact task was lost to API errors or a usage limit. Its files are on disk: look at what it already wrote in your folder and continue from there instead of starting over.'

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

function checkPrompt(zone) {
  return CONTEXT + '\n\nROLE: combination checker, READ-ONLY for trials: never modify essais/ or another checks/ folder. Write your scripts, results and screenshots only under ' + OUT + '/' + zone.key + '/ (create it). Another checker covers the other zone in parallel; a final integrator will fix what you report.\nYOUR ZONE: ' + zone.text + '\nFor each problem: reproduce it with the smallest set of trials (each alone, then pairs) to name the trials involved, give its severity, evidence paths and a precise minimal fix proposal (do not apply it). Also list, per trial, one probe proving its effect is still present in the combination. Return the structured report (French text).'
}

function finalPrompt(reports) {
  return CONTEXT + '\n\nROLE: integrator for this selection. Two checkers tested the combination in read-only mode; their reports are below. Write your own scripts and results under ' + OUT + '/integration/ (create it). You may modify the folders of the nine trials (essais/<id>/ and checks/<id>/) only to fix genuine problems.\n1. For each reported problem, reproduce it with the smallest set of trials and decide: conflict between trials, defect of a single trial the verifiers missed, or false alarm (with evidence).\n2. Fix genuine problems minimally, within the scope of the trials concerned. Prefer a fix that changes nothing when a trial is shown alone; if a trial alone must change, say so explicitly. Re-run the affected checks alone and combined, and update essai.json (verifications, limites, fichiers) and results.json where their claims change.\n3. Final pass on the combination of the nine: Explorer with the real globe at 1440×900 and 390×844, Projets at 320×640 AR, a project detail with its comments, the filter dialog, the arrival page in dark, the Awards page: no console error, no horizontal overflow, no visible collision (look at the screenshots), each trial effect present.\n4. Run python3 -I ' + STUDY + '/snapshot.py --verify last and confirm that the nine essai.json are valid and every capture path exists.\n5. Give lienCombinaison: the relative URL (from the study root) that opens the nine together, e.g. baseline/content-preview.html?essais=…#projects.\nReturn the structured result (French text).\n\nCHECKER REPORTS (JSON)\n' + JSON.stringify(reports)
}

phase('Contrôles')
const reports = (await parallel(ZONES.map(zone => () => attempt(checkPrompt(zone), { label: 'contrôle:' + zone.key, phase: 'Contrôles', schema: CHECK_SCHEMA })))).filter(Boolean)
log(reports.length + '/' + ZONES.length + ' contrôles terminés ; ' + reports.reduce((n, r) => n + r.problemes.length, 0) + ' problème(s) signalé(s)')
if (reports.length < ZONES.length) {
  log('Intégration reportée : un contrôle n’a pas abouti')
  return { reports, final: null }
}
phase('Intégration')
const final = await attempt(finalPrompt(reports), { label: 'intégration', phase: 'Intégration', schema: FINAL_SCHEMA })
return { reports, final }
