export const meta = {
  name: 'horizon-design-review-trials-parallel',
  description: 'Termine en parallèle les 10 essais restants issus de l’avis sur le design (6 unités, chacune vérifiée dès qu’elle est finie), puis contrôle les combinaisons des 19 essais en trois passes parallèles et corrige les conflits',
  phases: [
    { title: 'Réalisation', detail: '6 unités de 1 à 3 essais, toutes en parallèle, reprise en cas de coupure' },
    { title: 'Vérification', detail: 'un vérificateur contradictoire par unité, dès qu’elle est terminée' },
    { title: 'Combinaisons', detail: 'trois contrôles parallèles en lecture seule' },
    { title: 'Intégration', detail: 'corrections minimales des conflits, contrôle final de la copie et des fiches' },
  ],
}

const REPO = args.repo
const STUDY = args.study
const SCRATCH = args.scratch
// Steps finished in an earlier run (args.done): their results are read from DONE_FILE, never redone.
const DONE_FILE = STUDY + '/checks/_reprise/vague2-resultats-partiels.json'
const DONE = new Set(args.done || [])

const CONTEXT = `You are working on design TRIALS ("essais") for the 42 Horizon web prototype (school project ft_transcendence). The project owner (French-speaking) received a design review and asked: "Fais-moi tous ces changements à part, comme les essais que me faisait Codex, pour savoir ce que je voulais" — build every proposed change as a SEPARATE, optional trial on an isolated copy of the site, so they can compare with the current site and choose. Nothing is integrated into the active site.

The main agent already did the project start-up routine (AGENTS.md, PROJECT_CONTEXT.md, journal) and will update all continuity docs and build the gallery itself. Do NOT edit PROJECT_CONTEXT.md, BOARDING_JOURNAL.md, README.md, AGENTS.md or any NOTES.md; grep PROJECT_CONTEXT.md only if you need a specific fact.

HARD RULES
1. Write ONLY inside ${STUDY}/essais/<your trial ids>/ (essai.css, essai.mjs, essai.json, and early.js only for titres-marque, titres-forts, echelle-unifiee) and ${STUDY}/checks/<your trial ids>/ (check scripts, screenshots, results), unless your ROLE below says otherwise. Scratch files may go under ${SCRATCH}/agents/. Never modify ${STUDY}/baseline/, ${STUDY}/originals/, ${STUDY}/snapshot*, ${STUDY}/essais/boot.js, styles.js, modules.mjs, essais/_partage/, ${STUDY}/checks/helper.py, other agents' folders, the active prototype ${REPO}/site/, or any doc. "python3 -I ${STUDY}/snapshot.py --verify" fails if one baseline byte changes.
2. Strict scope (explicit user rule of 13 Oct 2026): each trial changes ONLY what its spec describes, plus the technical adjustments strictly needed for it to work. A colour trial must not change sizes or layout; a layout trial must not restyle colours. When unsure, do less and write it in "limites".
3. A trial's CSS is loaded only when its id is in ?essais=…, but several trials can be active together: keep selectors specific to the targeted components and make essai.mjs defensive and idempotent (MutationObserver if the baseline re-renders; the baseline re-renders lists/details on navigation, theme and language changes). With no trial active the copy must stay pixel-identical to the active prototype (already verified).
4. Any new visible text needs FR, EN and AR versions (Arabic is RTL; read the current language from document.documentElement.lang and update on change). Respect prefers-reduced-motion. Keep keyboard access, accessible names and visible focus. Keep targets of at least 44 px where the baseline had them.
5. Code comments in English, concise, in the repository's compact style. essai.json text in French.
6. Evidence over assertion. Verify in Chrome with ${STUDY}/checks/helper.py (read its docstring and code first): Session.open(route, essais=[...], theme=..., lang=..., viewport=D|M|S|L, block_globe=..., page='content-preview.html'|'index.html'), shot(), js(), rect(), style(), errors(), overflow(), image_diff(), contrast(). Run ONE Chrome session at a time in your process and always close it. Block the globe module (block_globe=True) unless your check needs the real globe (lighter and faster); if a call times out, close the session and retry once. Save before/after screenshots as checks/<id>/avant-<vue>.png and checks/<id>/apres-<vue>.png (vue: ordinateur, mobile, petit, paysage, sombre-ordinateur, sombre-mobile, ar-mobile…), your script as checks/<id>/check.py (python3 -I) and measured results as checks/<id>/results.json. Open (Read) the screenshots you cite and look at them — never claim a visual result you did not see.
7. Do not commit, push or publish anything. Do not start or stop the local server (http://127.0.0.1:8765/ serves ${REPO}).
8. MEMORY: /tmp is a RAM-backed tmpfs and earlier attempts ran out of memory (undeleted Chrome profiles in /tmp, then several uncapped headless Chrome, one globe tab reaching 3 GB). helper.py now (a) keeps profiles in ~/.cache/horizon-design-review-chrome/ and deletes them on close, (b) allows a few headless Chrome at a time on the whole machine (shared slots, currently 3, lowered automatically if memory gets low) and starts one only when at least 3 GB are free — Session() waits, printing 'Waiting for the shared headless Chrome slot…', so keep each session short and close it as soon as a check is done, and (c) runs each Chrome under a 2.6 GB memory cap: if a heavy page exceeds it, that Chrome is killed ('Chrome pipe closed'); then open a fresh Session and do fewer globe navigations per session (at most about 6). A guard may also stop a check Chrome when memory is critically low: treat it like a cap kill and retry. Use ONLY helper.py's Session (never tempfile profiles in /tmp, never another Chrome launcher), always close it in a finally block, run long checks with a Bash timeout of at least 600000 ms, and keep screenshots to the ones you need. Other agents share the slots: if a Bash call times out while waiting for a slot, simply run it again.
9. RESUMED WORK: an earlier run implemented and verified the groups «Explorer et globe» and «Couleurs, thème sombre et illustrations» (never touch their folders, except for a genuine cross-trial conflict in the final integration). The trials of the two other groups were started by earlier agents, interrupted by API connection drops (13:30–13:49) and then by a deliberate stop at 14:30 to run the remaining work in parallel, and finally by a pause the project owner asked for at 14:39 — never by their code or checks. Everything they wrote is on disk, and your prompt gives the STATE ON DISK of your trials. Treat unfinished parts as unverified drafts: read them, keep what is correct and in scope, redo the rest. Before re-running an existing check, compare timestamps: if results.json is newer than the trial files and covers the acceptance criteria, you may reuse it (still open the screenshots you cite).
10. IMAGES: very large transcripts made earlier API requests fragile. Open (Read) only the screenshots you need to judge, at most about 15 per agent, and prefer one composed side-by-side crop at reduced size (PIL) over several full-size screenshots.
11. The project owner's own browser may be open on this machine: never kill processes by name or pattern (no pkill, killall, or kill of Chrome processes you did not start). Only helper.py's Session.close() stops a headless Chrome.

STUDY LAYOUT AND LOADER
- Study root ${STUDY}, served at http://127.0.0.1:8765/studies/design-review-studies/ .
- baseline/ is a frozen copy of the current prototype (137 files, storage keys isolated with prefix horizon-design-review-studies-20261014-). Entries: baseline/index.html (arrival: encrypted scan, Se connecter / Visiter, then 42 logo → globe) and baseline/content-preview.html (skips the arrival). Hash routes: #explore, #projects, #people, #journal, #awards; details #projects/<id>?tab=overview|implementation|media|test|comments, #people/<id>?tab=overview|projects|path|contribution, #journal/<id>?tab=article|media|authors|comments; Explorer scope #explore?country=FRA&campus=paris. Sample ids: projects ft-transcendence-building-together, minishell-under-the-prompt; profile profile-leila-mansour; article journal-an-evening-debugging.
- URL query: ?essais=id1,id2 activates trials (canonical order and exclusive pairs in essais/boot.js); ?theme=light|dark; ?lang=fr|en|ar.
- essais/boot.js runs first: sets document.documentElement.dataset.essais and window.horizonEssais {active, has(id), order, early}. essais/styles.js writes <link href="../essais/<id>/essai.css"> after all baseline stylesheets, and for ids in horizonEssais.early runs ../essais/<id>/early.js before the baseline modules execute. essais/modules.mjs waits for window.horizonStudy (read-only bridge appended to the copy's welcome.mjs: getters globe, locale, section; setLocale()), applies ?lang, then imports each active essais/<id>/essai.mjs and awaits its default export called with {id, horizon, root, has}; finally sets dataset.essaisReady="true".
- Shared fonts: essais/_partage/fonts.css declares Jost 700/800 upright and 500/700/800 italic (OFL, downloaded today) — import it from your essai.css with @import url(../_partage/fonts.css); when needed. Jost is only a stand-in: Futura PT, the charter typeface, is still pending.
- Read (never edit) baseline sources: the 36 stylesheets listed in baseline/index.html, the *.mjs modules, tokens in baseline/shared/figma/tokens.css.

EVIDENCE FROM THE DESIGN REVIEW (14 Oct 2026)
- Screenshots of the current site: ${SCRATCH}/design-review/shots/*.png (E-* arrival, X-* explore and overlays, L-* lists, P-* project, R-* profile, J-* article; -D = 1440×900, -M390 = 390×844 DPR 2, -M320 = 320×640; fr/en/ar; light/dark). Text and contrast audit: ${SCRATCH}/design-review/metrics/audit_fixed.json. These review files live in a temporary folder and may be gone after a restart: then take your own 'avant' screenshots of the baseline instead.
- Brand charter PDF: ${REPO}/42 - Charte graphique 2024.pdf — p.6 campus logotype system (42 + name in Futura PT Heavy Oblique capitals), p.15 Futura PT, p.17–22 colours (noir #1B1B1B, blanc #FFFFFF, 42 Blue #00BABC, CG Blue #04809F, Royal Pink #ED3491, Dark Cerulean #173D7A, Violet #6000BC, Bubbles #E7FEFE, Bright Gray #E6F4F1, Dark Slate Gray #324B4B, Cadet Gray #95B0B0, Light Cobalt Blue #96A3EB), p.30–34 UI elements (titles 55/35/28/20/18 px).

ESSAI.JSON — overwrite the placeholder of each of your trials with valid JSON, French text:
{"id": "...", "groupe": "...", "titre": "short French title (keep the placeholder title unless clearly wrong)", "resume": "1–2 sentences: what changes", "probleme": "the measured problem", "changement": "what exactly the trial changes, and where", "decisionConcernee": "earlier explicit user decision this trial revisits (date + words), or empty string", "alternativeDe": "id of the alternative trial for the same problem, or empty string", "vues": [{"libelle": "Ordinateur clair", "page": "content-preview.html", "route": "projects", "viewport": "ordinateur|mobile|petit|paysage", "theme": "light|dark", "lang": "fr|en|ar"}], "verifications": ["checks that passed, with numbers"], "limites": ["what was not verified or stays imperfect"], "fichiers": ["essais/<id>/essai.css", "..."], "captures": [{"vue": "ordinateur", "avant": "checks/<id>/avant-ordinateur.png", "apres": "checks/<id>/apres-ordinateur.png"}]}
"vues" (2–4) are opened side by side in the gallery (current copy vs trial): choose the views where the difference is clearest. Paths in "fichiers" and "captures" are relative to the study root.`

const GROUPS = {
  pile: {
    title: 'Pile flottante, cartes et petits écrans', globe: 'Block the globe (block_globe=True) for content-page checks; use the real globe only to prove that Explorer is unchanged.',
    trials: [
      { id: 'recherche-repliee', spec: 'PROBLEM: on content pages (Projets, Profils, Chroniques, Awards and the detail pages) the floating search capsule "Chercher dans Horizon" and the dice float above the dock and hide content at rest: text is cut under the capsule (P-project-overview-light-D.png caption, L-projects-fr-light-D.png summaries, P-project-comments-light-D.png empty state). At 390×844 the header plus the bottom stack take about 45 % of the screen at rest, more than 50 % at 320×640 (L-projects-fr-light-M390.png, L-projects-fr-light-M320.png). CHANGE: on content pages only (Explorer keeps the full capsule), collapse the capsule into a round icon button showing a magnifier, same size and style family as the dice button, next to the dice, so the floating stack becomes two small round buttons. Activating it must open the very same search as the capsule does today: reuse the existing toggle element and behaviour (restyle it; do not build a second search). Keep its localized accessible name, a visible title/tooltip, focus ring and a target of at least 44 px; RTL mirrored like the baseline. DECISION REVISITED: 5 Oct, floating capsule explicitly chosen — this trial shrinks it on content pages. ALTERNATIVE: voile-pile-basse. ACCEPTANCE: area of the union bounding box of the floating stack before/after at 1440×900, 390×844 and 320×640 (report px²); search opens with focus in the field, typing "Paris" shows results, Escape closes and returns focus; Explorer pixel-identical to the baseline; the 4-stage dock labels unchanged; FR/EN/AR.' },
      { id: 'voile-pile-basse', spec: 'PROBLEM: same as recherche-repliee. CHANGE: keep the capsule. On content pages, add a soft full-width gradient scrim behind the whole bottom floating zone (from a little above the capsule down to the bottom edge), in the page background colour of each theme, so content passing behind the stack fades out consistently instead of being cut by floating pills; pointer-events:none. Make sure the end of each page (last cards, pagination, comment form) can scroll fully above the stack (extra bottom padding only if needed). Integrate with the existing list fade instead of stacking two fades; if the dock hides while scrolling, the scrim follows it. DECISION REVISITED: none (compatible with the chosen floating capsule). ALTERNATIVE: recherche-repliee. ACCEPTANCE: at rest, the area behind the capsule is at least 85 % covered (sample pixels against the page background); the bottom of pages is fully readable after scrolling to the end at 1440×900, 390×844 and 320×640; clicks are not blocked (elementFromPoint just above the scrim hits content); Explorer unchanged; light and dark.' },
      { id: 'une-colonne-320', spec: 'PROBLEM: at 320 px wide, two-column project and chronicle cards are cramped: author names break inside the word ("Luiz a…", "Leïl a…"), titles take 3 lines or more, crown and +N chips collide (L-projects-fr-light-M320.png). CHANGE: below about 360 px of available width, the Projets and Chroniques grids (list pages, and the projects tab of a profile if it uses the same grid) show one card per row; card internals unchanged. Leave the Profiles grid as it is unless you measure the same breakage (then report, do not change). DECISION REVISITED: 8 Oct "Projets et Chroniques : deux cartes par ligne sur mobile à 320 px" and 6 Oct "adapter d’abord les tailles avant d’imposer une grille mobile" — this trial revisits them. ALTERNATIVE: deux-colonnes-allegees. ACCEPTANCE: 320×640 and 340×720: one column, author names on one line, no overflow, no collisions; 390×844 pixel-identical to the baseline; the Grid/List switch still works.' },
      { id: 'deux-colonnes-allegees', spec: 'PROBLEM: same as une-colonne-320. CHANGE: keep two columns at 320 px (respecting the 8 Oct decision) but remove the collisions, only below about 360 px: in the author row keep the avatars and the +N chip, show the crown as a small badge on the lead author avatar, and the name on ONE line with an ellipsis (or visually hidden when there is no room, keeping the accessible name); clamp titles to 3 lines; no colour change. DECISION REVISITED: none (keeps the two columns). ALTERNATIVE: une-colonne-320. ACCEPTANCE: no name broken inside a word, no overlapping chips (rect intersections), titles at most 3 lines, no overflow; 390×844 pixel-identical to the baseline.' },
      { id: 'pseudo-manquant', spec: 'PROBLEM: profile cards and pages show "Pseudo Intra à renseigner" (baseline/profile-ui.mjs line 10, plus the EN/AR equivalents) for fictional profiles without a login, visible in the first rows of the directory (L-people-fr-light-D.png: Lucía Roca, Emma De Smet, Tomás Vieira, Amir Keller…). CHANGE: hide that placeholder line when no login exists (grid, list and detail), keeping the cards of a row aligned (keep the space if equal heights depend on it, otherwise collapse). Never invent logins. DECISION REVISITED: none (the rule "sans comptes Intra inventés" stays respected). ACCEPTANCE: the placeholder text is absent from visible DOM text in FR/EN/AR; cards in a row keep equal heights; list view and detail page OK.' },
    ],
  },
  typo: {
    title: 'Typographie, lisibilité et pages', globe: 'Block the globe (block_globe=True) for lists, details and the arrival checks unless a check needs it.',
    trials: [
      { id: 'lisibilite-textes', spec: 'PROBLEM: 41 % of the visible text nodes measured at 11–12 px (12 px = 27 %); Favoris/Signaler buttons at 11 px; campus names and links #008E90 on #F7FAFA = 3.8:1 and status chips (Cadet/Alumni/Transcender) #008E90 on white = 3.98:1 (AA needs 4.5:1 at these sizes); in dark, Royal Pink chips on #202026 = 4.24:1 at 11 px (audit_fixed.json). CHANGE: (1) a floor of 13 px for useful small text (metadata, campus names, chips/badges, counters, captions, "Créé par"), 14 px for small action buttons (Favoris, Signaler, Envoyer un message…); map attribution excluded. (2) a darker accent for small teal text in light, within the 42 Blue / CG Blue family, reaching at least 4.5:1 on both #F7FAFA and #FFFFFF (state the hex and the ratios); in dark, a lighter pink (or neutral) for small pink text reaching at least 4.5:1 on the dark surfaces. Keep 42 Blue #00BABC for surfaces and large elements. No layout redesign: cards, the 4-stage dock and the header must not overflow or wrap badly. DECISION REVISITED: none. ACCEPTANCE: rerun a text audit (reuse the AUDIT_JS logic of ${SCRATCH}/design-review/capture.py) on at least 8 key views (lists, details, explore, mobile): share of text below 13 px (attribution excluded) and number of contrast failures before/after; no overflow at 320, 390 and 1440; FR/EN/AR.' },
      { id: 'titres-marque', spec: 'PROBLEM: the charter signature — Futura PT Heavy Oblique in capitals for brand names (campus logotype system p.6, labels like ALUMNI) — is absent: the HORIZON/AWARDS wordmark and the "BEYOND THE CODE" slogan are in Jost Medium; only Jost 400/500/600 upright are loaded by the site. CHANGE: use Jost 800 italic (shared stand-in in essais/_partage/fonts.css — never present it as Futura PT) for the brand moments only: the HORIZON ↔ AWARDS wordmark in the header (baseline/brand-wordmark.mjs measures text with a canvas font built from the computed style: check the letter-cascade transition still lands correctly, with no clipping) and the "BEYOND THE CODE" slogan revealed after the simulated sign-in on baseline/index.html (canvas-rendered by baseline/shared/decryption-examples/* and entrance.mjs; if it can only change by patching the canvas font early, do it in essais/titres-marque/early.js, which runs before the baseline modules; if it cannot be done safely, leave it and explain in limites). The Arabic wordmark line (أفق) has no italic: keep its family, at most a heavier real weight if one is loaded. DECISION REVISITED: pending point "Futura PT Heavy Oblique reste en attente ; HORIZON reste provisoirement en Jost Medium". ACCEPTANCE: header wordmark in FR and AR, light and dark, desktop and mobile, before/during/after HORIZON → AWARDS → HORIZON transitions (no clipping or overflow); arrival after simulated sign-in shows the slogan in the new style (screenshot) or a documented limit; nothing else moves.' },
      { id: 'titres-forts', spec: 'PROBLEM: page and section titles are in Jost 500 like the rest (weights measured: 400 and 500 everywhere, 700 on only 14 nodes), so hierarchy relies on size alone; the charter UI scale (p.30) uses Heavy for titles. CHANGE: give detail titles (project and article titles, profile name), card titles and section headings (À propos, Technologies et savoir-faire, Équipe, Réseaux et liens…) a heavier weight (700, upright, not uppercase), with slightly tighter letter-spacing if needed; sizes unchanged. Arabic headings: heavier Noto Sans Arabic only if a real bold face is available (check what is loaded; avoid faux bold). Do not reintroduce the list introductions and section titles that the user removed on 13 Oct. DECISION REVISITED: none (removed list titles stay removed). ACCEPTANCE: title line counts on cards at 1440, 390 and 320 compared before/after (no layout breakage), FR/EN/AR, light/dark, no overflow.' },
      { id: 'echelle-unifiee', spec: 'PROBLEM: the stylesheets declare 85 distinct font-size values and 48 border-radius values across 36 files (20 !important), which shows as small inconsistencies between pills, cards, menus and dialogs. CHANGE: a demonstrator of a consolidated system — map the main components onto a short type scale (e.g. 12/14/16/20/25/35 px, aligned with the charter where relevant), three radii (e.g. 12 px controls/cards/images, 20 px panels/dialogs, 999 px pills/round buttons) and two shadow elevations; keep the visual change subtle; no colour or layout-structure change. Document in essai.json the mapping table and that the real consolidation (fewer stylesheets, tokens as single source) is structural work a trial cannot show. DECISION REVISITED: none. ACCEPTANCE: on 6 key views, count distinct visible font sizes and radii before/after (expect a large drop); no overflow; FR/AR; light/dark.' },
      { id: 'awards-a-venir', spec: 'PROBLEM: the 42 Awards page is completely empty (header and menu only, L-awards-fr-light-D.png), which can read as a broken page to outside viewers. CHANGE: a minimal centred "coming soon" message — FR "Les 42 Awards arrivent bientôt.", EN "42 Awards are coming soon.", AR using the Arabic naming the site already uses for 42 Awards (check the dock label, e.g. "جوائز 42") — with at most a discreet trophy icon reused from the site icon set; no new feature, link or content; light/dark and RTL. DECISION REVISITED: 7 Oct, Awards page explicitly kept with only the header and the menu — this trial adds a message. ACCEPTANCE: FR/EN/AR, light/dark, desktop/mobile screenshots; the AWARDS wordmark transition and the dock unaffected; the message never appears in other sections.' },
    ],
  },
}

// Remaining work at the 14:39 pause, all units in parallel; each unit is verified as soon as it ends.
// args: {repo, study, scratch} — scratch is the session's temporary folder for agent scratch files.
const UNITS = [
  { key: 'pile-recherche-voile', group: 'pile', ids: ['recherche-repliee', 'voile-pile-basse'], state: '- recherche-repliee: essai.css and essai.mjs (13:00), check.py and results.json (13:06), every acceptance criterion reported passed; the only Explorer difference was the inserted icon kept at display:none (0.0 pixel difference with and without the real globe). The unit stopped at 14:30 then added checks/recherche-repliee/check-complement.py and results-complement.json (14:28): read them. essai.json is still the placeholder.\n- voile-pile-basse: essai.mjs (13:16); essai.css changed again at 14:21 by the stopped unit, which re-ran checks (results-menus.json 14:22, results.json 14:27, results-bande.json 14:29, about 80 new screenshots in checks/voile-pile-basse/). essai.json is still the placeholder.\nTask: confirm both against their specs and latest results (open the key screenshots), finish any check the stop left incomplete, then write both essai.json.', verifyNote: 'NOTE: a previous verification of these trials was cut by a network outage at about 19:00. It had re-measured (checks/recherche-repliee/results-verification.json 18:47, checks/voile-pile-basse/results-verification.json 18:53), changed essais/voile-pile-basse/essai.css at 18:42 and updated both essai.json (18:49 and 18:55). Find out from those files what it changed and why, check that the change is correct and in scope, then finish the verification.' },
  { key: 'pile-colonnes', group: 'pile', ids: ['une-colonne-320', 'deux-colonnes-allegees'], state: '- une-colonne-320: essai.css/essai.mjs (13:22); check.py detects names broken inside a word at character level (a false positive from collapsed spaces at line ends was fixed by resetting on whitespace), rect intersections in the author row and the Grid/List switch; results.json (13:29) after that fix: one column at 320/340/360, no broken names or collisions, 390 px pixel-identical. A stopped unit then edited check.py at 14:38 and its run was interrupted (new screenshots 14:38–14:39, results.json still from 13:29): re-run the check. essai.json is still the placeholder.\n- deux-colonnes-allegees: essai.css and essai.mjs drafted at 13:23 and NEVER checked; no checks folder; essai.json placeholder. Reuse the une-colonne-320 measurement approach (copy the useful parts of its check into checks/deux-colonnes-allegees/).\nTask: confirm une-colonne-320 and write its essai.json; implement, verify and document deux-colonnes-allegees.' },
  { key: 'pile-pseudo', group: 'pile', ids: ['pseudo-manquant'], state: '- pseudo-manquant: not started — placeholders only (essai.css and essai.mjs from 09:50, essai.json placeholder), no checks folder.\nTask: implement, verify and document it.', verifyNote: 'NOTE: a previous verification of this trial was cut by a network outage at about 19:00, after writing checks/pseudo-manquant/contre-verification-partiel.json (18:56) and other recent files: read them and continue from there.' },
  { key: 'typo-lisibilite-marque-forts', group: 'typo', ids: ['lisibilite-textes', 'titres-marque', 'titres-forts'], state: '- lisibilite-textes: complete — essai.css (12:59), checks and results.json (13:15), essai.json finalised at 14:29. Only read essai.json and results.json, confirm they are valid and consistent, and report it; do not redo it unless you find a real defect.\n- titres-marque: complete — essai.css (13:21), early.js and essai.mjs (13:22), results.json (13:28), essai.json finalised at 14:29. Confirm only, as above.\n- titres-forts: implemented and checked by the previous agent, which a network outage cut at about 19:00: early.js and essai.mjs (14:22), essai.css (18:53), checks/titres-forts/results.json (18:58) and about 40 recent check files. essai.json is still the placeholder. Confirm the results against the spec (open the key screenshots), finish what is missing, then write essai.json; it must stay correct when combined with lisibilite-textes and titres-marque.' },
  { key: 'typo-echelle', group: 'typo', ids: ['echelle-unifiee'], state: '- echelle-unifiee: implemented and checked by the previous agent, which a network outage cut at about 19:00: early.js and essai.mjs (18:29), essai.css (18:46), checks/echelle-unifiee/results.json (18:58) and about 30 recent check files. essai.json is still the placeholder. Its stylesheet loads after lisibilite-textes and titres-forts in the canonical order of essais/boot.js: combined, it must not silently undo the 13/14 px floors of lisibilite-textes (complete: make sure that combination was checked) or the title weights of titres-forts (finished in parallel by another agent; the final combination pass tests the three together). State the result in verifications or limites.\nTask: confirm the results against the spec (open the key screenshots), finish what is missing, then write essai.json.', verifyNote: 'NOTE: two previous verifications of this trial were cut by the session limit (14 Oct 20:34, 15 Oct 04:57). The first found three defects and changed essais/echelle-unifiee/essai.css between 20:18 and 20:28 (portraits turned into ovals, an ineffective elevation on the scope popover, a chip clipped in the combination with lisibilite-textes) and corrected its header comment; it wrote checks/echelle-unifiee/verif.py and made check.py use fresh page loads. The second re-ran check.py (results.json 04:40), then changed essai.css at 04:49: Profiles card pseudonyms stay card metadata (12 px, 13 with lisibilite-textes) because at 14 px the pending-login placeholder wrapped and unlevelled four grid rows; it was re-running verif.py (width checks, verif-results.json 04:57) when cut. essai.json still dates from 19:49, before all these fixes. Check that every fix is correct and in scope, finish the re-runs, then update essai.json and results.json.' },
  { key: 'typo-awards', group: 'typo', ids: ['awards-a-venir'], state: '- awards-a-venir: draft from the first interrupted attempt (essai.css and essai.mjs at 10:27, two files in checks/awards-a-venir/, no results.json), never verified.\nTask: read it, keep what is correct, redo the rest, verify and document it.' },
]

const IMPLEMENT_SCHEMA = {
  type: 'object',
  properties: {
    group: { type: 'string' },
    trials: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' },
      status: { type: 'string', enum: ['réalisé', 'partiel', 'non réalisé'] },
      resume: { type: 'string' },
      fichiers: { type: 'array', items: { type: 'string' } },
      verifications: { type: 'array', items: { type: 'string' } },
      limites: { type: 'array', items: { type: 'string' } },
      decisionConcernee: { type: 'string' },
    }, required: ['id', 'status', 'resume', 'fichiers', 'verifications', 'limites', 'decisionConcernee'] } },
    notesForMain: { type: 'string' },
  },
  required: ['group', 'trials', 'notesForMain'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    group: { type: 'string' },
    trials: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' },
      verdict: { type: 'string', enum: ['validé', 'corrigé', 'réserves'] },
      problemesTrouves: { type: 'array', items: { type: 'string' } },
      corrections: { type: 'array', items: { type: 'string' } },
      verificationsRejouees: { type: 'array', items: { type: 'string' } },
      reservesRestantes: { type: 'array', items: { type: 'string' } },
    }, required: ['id', 'verdict', 'problemesTrouves', 'corrections', 'verificationsRejouees', 'reservesRestantes'] } },
    notesForMain: { type: 'string' },
  },
  required: ['group', 'trials', 'notesForMain'],
}

const CHECK_SCHEMA = {
  type: 'object',
  properties: {
    combinations: { type: 'array', items: { type: 'object', properties: {
      nom: { type: 'string' }, essais: { type: 'array', items: { type: 'string' } }, vues: { type: 'array', items: { type: 'string' } },
      passed: { type: 'boolean' },
      problemes: { type: 'array', items: { type: 'object', properties: {
        description: { type: 'string' }, essaisEnCause: { type: 'array', items: { type: 'string' } },
        preuves: { type: 'array', items: { type: 'string' } }, correctionProposee: { type: 'string' },
      }, required: ['description', 'essaisEnCause', 'preuves', 'correctionProposee'] } },
    }, required: ['nom', 'essais', 'vues', 'passed', 'problemes'] } },
    snapshotVerify: { type: 'string' },
    baselineCheck: { type: 'string' },
    essaiJsonIssues: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['combinations', 'snapshotVerify', 'baselineCheck', 'essaiJsonIssues', 'notes'],
}

const INTEGRATION_SCHEMA = {
  type: 'object',
  properties: {
    snapshotVerify: { type: 'string' },
    baselineCheck: { type: 'string' },
    combinations: { type: 'array', items: { type: 'object', properties: {
      nom: { type: 'string' }, essais: { type: 'array', items: { type: 'string' } }, vues: { type: 'array', items: { type: 'string' } },
      passed: { type: 'boolean' }, problemes: { type: 'array', items: { type: 'string' } },
    }, required: ['nom', 'essais', 'vues', 'passed', 'problemes'] } },
    conflictsFixed: { type: 'array', items: { type: 'string' } },
    essaiJsonIssues: { type: 'array', items: { type: 'string' } },
    remainingIssues: { type: 'array', items: { type: 'string' } },
  },
  required: ['snapshotVerify', 'baselineCheck', 'combinations', 'conflictsFixed', 'essaiJsonIssues', 'remainingIssues'],
}

const RETRY_NOTE = '\n\nNOTE: a previous attempt of this exact task was lost to API errors. Its files are on disk: look at what it already wrote in your folders and continue from there instead of starting over.'

// Up to four tries: network drops have lasted several minutes, longer than one agent's own retries.
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

function specText(trials) {
  return trials.map(t => '### ' + t.id + '\n' + t.spec).join('\n\n')
}

function unitTrials(unit) {
  return GROUPS[unit.group].trials.filter(t => unit.ids.includes(t.id))
}

function unitPrompt(unit) {
  const group = GROUPS[unit.group]
  return CONTEXT + '\n\nYOUR GROUP: «' + group.title + '». ' + group.globe + '\nYOUR UNIT: ' + unit.ids.join(', ') + '. Other agents work IN PARALLEL on the other trials (and share the Chrome slots): do not modify their folders.\nSTATE ON DISK (pause of 14:39):\n' + unit.state + '\n\nFor each trial of your unit: read what exists against the spec (and the relevant baseline CSS/JS to target the right selectors); keep what is correct and in scope, finish or redo the rest; verify with measurements and screenshots (before = same URL without the trial, after = with ?essais=<id>); look at the screenshots; iterate until the acceptance criteria pass or you can explain precisely why not; then write essai.json and results.json. Keep Chrome usage sequential and sessions short.\n\nTRIAL SPECS\n' + specText(unitTrials(unit)) + '\n\nReturn the structured summary for the trials of your unit only (group = «' + group.title + '»; French text in resume/verifications/limites).'
}

function verifyPrompt(unit, report) {
  const group = GROUPS[unit.group]
  return CONTEXT + '\n\nROLE: adversarial verifier AND fixer for the trials ' + unit.ids.join(', ') + ' (group «' + group.title + '»). ' + group.globe + ' Other agents work in parallel on other trials: touch only these trials\' folders.\nThe implementer report is below. For EACH trial:\n1. Read its files against the spec. Check scope strictly: any change beyond the spec (sizes, colours, other components, new behaviours) is a defect — remove it.\n2. Re-verify in Chrome yourself (helper.py, one session at a time): the problem is really fixed (re-measure the numbers of the spec), nothing regresses (overflow, collisions, console errors, keyboard and focus, Arabic RTL, dark theme, 1440×900 / 390×844 / 320×640), pages and states the trial should not affect stay pixel-identical to the baseline, and the trial still behaves after a language change and a theme change without reload.\n3. Check essai.json: valid JSON, every field present, claims match what you measured, decisionConcernee correct (see spec), the vues give the clearest comparison, the captures exist and really show the change (open them, within the image budget of rule 10).\n4. Fix real defects directly in these trials\' folders only (essais/<id>/ and checks/<id>/), re-run the affected checks, update essai.json and results.json.\nBe skeptical: a claim without a measurement or a screenshot you looked at is unverified.\n\nTRIAL SPECS\n' + specText(unitTrials(unit)) + '\n\nIMPLEMENTER REPORT (JSON): ' + (report.fromFile ? 'read the object under the key «' + report.fromFile + '» in ' + DONE_FILE : JSON.stringify(report)) + (unit.verifyNote ? '\n\n' + unit.verifyNote : '')
}

const COMBINATIONS = {
  a: { title: 'Sélection compatible', text: '"Sélection compatible" = textes-sur-pastilles, police-etiquettes-globe, titre-fiche-campus, voile-pile-basse, deux-colonnes-allegees, pseudo-manquant, illustrations-sombres, roles-couleur, visiter-contour-sombre, illustrations-variees, lisibilite-textes, titres-marque, titres-forts, awards-a-venir.' },
  b: { title: 'Tout', text: '"Tout" = every trial except the second of each exclusive pair: globe-espace-libre, textes-sur-pastilles, police-etiquettes-globe, titre-fiche-campus, recherche-repliee, voile-pile-basse, une-colonne-320, pseudo-manquant, illustrations-sombres, roles-couleur, visiter-contour-sombre, illustrations-variees, lisibilite-textes, titres-marque, titres-forts, echelle-unifiee, awards-a-venir.' },
  c: { title: 'Paires et contrôles de la copie', text: 'four sets likely to interact: lisibilite-textes + echelle-unifiee + titres-forts; recherche-repliee + voile-pile-basse; globe-espace-libre + textes-sur-pastilles; roles-couleur + visiter-contour-sombre. ALSO: run python3 -I ' + STUDY + '/snapshot.py --verify (baseline untouched) and python3 -I ' + STUDY + '/checks/check-baseline.py (copy without trials identical to the active site; its "emptyTrials" pass now loads the REAL trials, so a difference there is expected: report it and judge only diffActiveVsStudy for equivalence), then confirm each of the 19 essais/<id>/essai.json is valid JSON with every field and that every capture path it lists exists (list problems).' },
}

function checkPrompt(key, summary) {
  const combo = COMBINATIONS[key]
  return CONTEXT + '\n\nROLE: combination checker «' + combo.title + '», READ-ONLY for trials: never modify a trial folder; write your scripts, results and screenshots only under ' + STUDY + '/checks/_combinaisons/' + key + '/ (create it). Two other checkers test other combinations in parallel; a final integrator will fix what you report. The 19 trials are implemented and verified (summary below; full reports of the first two groups in ' + STUDY + '/checks/_reprise/vague1-resultats.json).\nYOUR SCOPE: ' + combo.text + '\nFor each combination: explore, projects, people, journal, awards, a project detail (ft-transcendence-building-together), a profile (profile-leila-mansour) and an article (journal-an-evening-debugging) at 1440×900 light, 390×844 dark and 320×640 Arabic light, plus the arrival page (page="index.html", desktop light and mobile dark). Use the real globe only for explore (block it elsewhere). Check: no console errors (errors()), no horizontal overflow (overflow()), no visible collision (compose contact sheets and look at them, within the image budget of rule 10), and each trial effect still present (one quick DOM/style probe per trial, derived from its essai.css/essai.mjs). For each problem: reproduce it with the smallest set of trials (each alone, then pairs) to name the trials involved, give evidence paths (screenshots, results JSON) and a precise minimal fix proposal (do not apply it).\n\nTRIAL SUMMARY (JSON; entries marked «voir» are detailed in ' + DONE_FILE + ')\n' + JSON.stringify(summary)
}

function integrationPrompt(checks, summary, missing) {
  return CONTEXT + '\n\nROLE: final integrator of all 19 trials. Three checkers tested the combinations in read-only mode; their reports are below. You may modify trial folders, but only to fix genuine problems they found. Write your own scripts and results under ' + STUDY + '/checks/_combinaisons/integration/.' + (missing.length ? ' Trials without a finished report: ' + missing.join(', ') + ' — list them in remainingIssues.' : '') + '\n1. For each reported problem, reproduce it with the smallest set of trials and decide whether it is a genuine cross-trial conflict, a single-trial defect the verifiers missed, or a false alarm (say which, with evidence).\n2. Fix genuine problems minimally inside the trial folders concerned, respecting each trial\'s scope; re-run the affected checks alone and combined; update essai.json and results.json where their claims change. Say exactly what you changed.\n3. Re-run python3 -I ' + STUDY + '/snapshot.py --verify last, and confirm that every essais/<id>/essai.json is valid and every capture path exists.\n4. Return the combinations table (merge the checkers\' results with your re-checks), conflictsFixed, essaiJsonIssues and remainingIssues.\n\nTRIAL SUMMARY (JSON; entries marked «voir» are detailed in ' + DONE_FILE + ')\n' + JSON.stringify(summary) + '\n\nCHECKER REPORTS (JSON)\n' + JSON.stringify(checks)
}

log('Six unités en parallèle, trois Chrome de contrôle au plus')
const units = await pipeline(
  UNITS,
  unit => DONE.has('réalisation:' + unit.key) ? { fromFile: 'réalisation:' + unit.key } : attempt(unitPrompt(unit), { label: 'réalisation:' + unit.key, phase: 'Réalisation', schema: IMPLEMENT_SCHEMA }),
  (report, unit) => {
    if (!report) { log('Unité ' + unit.key + ' non terminée : ' + unit.ids.join(', ')); return null }
    if (DONE.has('vérification:' + unit.key)) return { unit: unit.key, group: unit.group, title: GROUPS[unit.group].title, report, verification: { fromFile: 'vérification:' + unit.key } }
    return attempt(verifyPrompt(unit, report), { label: 'vérification:' + unit.key, phase: 'Vérification', schema: VERIFY_SCHEMA })
      .then(verification => ({ unit: unit.key, group: unit.group, title: GROUPS[unit.group].title, report, verification }))
  },
)
const done = units.filter(Boolean)
const missing = UNITS.filter(u => !done.some(d => d.unit === u.key)).flatMap(u => u.ids)
log(done.length + '/' + UNITS.length + ' unités réalisées' + (missing.length ? ' ; essais sans compte rendu : ' + missing.join(', ') : ''))

// Compact summary for the combination stages: verdicts and remaining reservations.
// Steps read from DONE_FILE are summarised by reference: the next agents read that file.
const summary = done.flatMap(d => UNITS.find(u => u.key === d.unit).ids.map(id => {
  const t = d.report.trials && d.report.trials.find(x => x.id === id)
  const v = d.verification && d.verification.trials && d.verification.trials.find(x => x.id === id)
  const see = 'voir ' + DONE_FILE
  return { id, groupe: d.title, status: t ? t.status : see, verdict: v ? v.verdict : (d.verification && d.verification.fromFile ? see : 'non vérifié'), reserves: v ? v.reservesRestantes : (t ? t.limites : [see]) }
}))

// The user decided on 15 Oct to test only the selection finally chosen: args.skipCombinations stops here.
if (args.skipCombinations) return { units: done, missing, checks: [], integration: null }

// Combinations only make sense once every trial is finished and verified.
const unverified = done.filter(d => !d.verification).map(d => d.unit)
if (missing.length || unverified.length) {
  log('Combinaisons reportées : ' + [...missing, ...unverified].join(', ') + ' à terminer d’abord')
  return { units: done, missing, unverified, checks: [], integration: null }
}

phase('Combinaisons')
const checks = await parallel(['a', 'b', 'c'].map(key => () =>
  attempt(checkPrompt(key, summary), { label: 'combinaisons:' + key, phase: 'Combinaisons', schema: CHECK_SCHEMA })
    .then(result => result ? { checker: COMBINATIONS[key].title, ...result } : null)))

phase('Intégration')
const integration = await attempt(integrationPrompt(checks.filter(Boolean), summary, missing), { label: 'intégration', phase: 'Intégration', schema: INTEGRATION_SCHEMA })
return { units: done, missing, checks: checks.filter(Boolean), integration }
