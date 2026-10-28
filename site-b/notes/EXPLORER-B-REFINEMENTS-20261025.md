# Explorer B — refinements requested on 25–26 October 2026

Binding specification for the changes to version B's Explorer, entrance and pages requested by the user after the Halo
build (five at first, on 25 October; the later requests of 25 and 26 October became §H to §W) ([SPEC-B-HALO.md](SPEC-B-HALO.md), its amendments, and [HALO-FIXES-20261025.md](HALO-FIXES-20261025.md)).
It starts from the state left by the removal of « Monde » from level 1 (same day: level 1 shows only the four
continents, the world filter is the default while no continent is validated; cache keys `b6`). Version A (`site/`)
never changes. Nothing else changes: same copy, same colours, same layouts, same behaviour of levels, sheet, history,
search and content pages, except what each section below states.

## 0. Requests and decisions (user's words, then the answers to the assistant's questions)

1. « Je n'aime pas l'animation fondu quand tu sélectionnes par exemple un continent, il y a trop d'éléments qui sont
   inclus dans le fondu alors qu'ils ne changent pas, comme par exemple la partie au-dessus qui permet de suivre le
   niveau de profondeur dans la sélection ou bien ce qu'il y a en bas. » → §D. The assistant proposed: what does not
   change stays still, only what changes animates in place; the user chose « glissements doux »: the step dots glide to
   their new place when the prompt changes width (the Previous/Next part of that answer became moot with §B).
2. « Quand je déplace le filtre à la main l'animation ne suit pas la courbure comme lorsque j'utilise les touches. » →
   §C (go-ahead given with answer 1).
3. « Je veux que tu retires les halos autour des continents, des pays et des campus. » → §A. Answers: keep the pool of
   light under the centre item (« La garder »); remove the halo of the logo in the campus sheet too (« Le retirer
   aussi »); on phones at the campus level, show the neighbours' logos at the screen edge instead of their halo
   (« Leurs logos »).
4. « Retire la navigation par bouton. » → §B, read by the assistant as the Previous/Next buttons of the selector (foot,
   and the sides of the compact row); stated to the user.
5. « Lors de la transition entre la première page et Explorer je ne veux plus de cercle qui entoure le logo 42 ; au lieu
   de ça tu commences la formation de l'arc de cercle pour créer la transition. » → §E. Answers: the arc forms exactly
   where the Explorer's horizon will be (« À la place de l'horizon »); the Explorer then opens from the arc, the
   entrance background parting upwards and downwards (« Il s'ouvre depuis l'arc »); the 42 fades out as today.
6. Later, while the builds ran: « Je veux que tu retires aussi les indications des touches en bas et que tu les caches
   derrière un petit bouton d'info. » → §H. Answers: « En bas, à côté du compteur »; « Au clic ou au toucher ».
7. « La ligne d'horizon ne se trouve pas au même endroit quand on doit sélectionner le campus ; elle remonte un peu
   après avoir choisi un pays. » → §I. Answer: « Garder celle des pays ».
8. « Les points qui représentent les campus passent devant le texte, le texte doit se situer au premier plan. » → §J.
9. « Je veux que tu retires l'inscription des campus sous les différents choix, garde uniquement l'indication en haut
   sous le filtre. » → §K. Answer: « Il remonte sous la silhouette ».
10. « Quand on reste appuyé sur les flèches pour déplacer les éléments, l'animation ne suit pas bien la ligne
    d'horizon comme elle le fait à une vitesse de déplacement normale. » → §L.
11. « Supprime le texte Exploration 42 Horizon. » → §N. Answers: « La supprimer avec le texte »; « Garder la place
    vide ».
12. « Je veux que le bouton Valider ait toujours la même position, et ça doit être la position du bouton sous le
    campus. » → §P. Answer: « Fixe, il ne bouge jamais ».
13. « Je veux que tu modifies le fond du site en mode sombre et que tu gardes uniquement la couleur noire, donc il faut
    retirer le rose et le bleu qu'il y a dans les coins. » → §Q. Answers: « Version B seulement »; « Le noir actuel ».
14. « Je veux que tu modifies l'animation quand on passe du logo 42 avec horizon à la page Explorer, le logo 42 doit
    monter en haut à gauche puis afficher Horizon de la même façon que AWARDS. Et les continents doivent arriver avec
    une animation de la gauche vers la droite et s'arrêter sur Afrique », then « En arabe l'animation doit être
    inversée ». → §R. Answers: « Miroir, arrêt sur l'Asie »; « En même temps ».
15. « Je veux aussi que tu gardes le petit globe dans le filtre dans chaque page où il peut être présent. » → §S.
    Answer: « Immobile », then the correction « Tu as rajouté un globe, mais moi je parlais de l'émoticône déjà
    présente » (the « Revenir au monde » button's globe pictogram).
16. « Je ne suis pas satisfait du fait que le filtre change en fonction de ce qu'il y a écrit comme pays et campus ; il
    faudrait que la taille reste fixe pour éviter que, par exemple, lorsqu'on appuie sur retour, le bouton se
    déplace. » → §T. Answer: « La plus longue indication ».
17. « Je trouve que la ligne d'horizon est trop haute au moment de l'affichage du logo 42 ; il faudrait que tu la
    descendes, et par conséquent qu'elle descende aussi dans Explorer pour rester cohérente. » → §U. Answer:
    « Nettement sous le 42 ».
18. « Je veux aussi que tu retires le texte qui demande à l'utilisateur où il veut aller… je pense qu'il vaut mieux
    garder juste les points centrés. Si tu as une meilleure idée, propose-la-moi. » → §V. Answer: « Juste les points
    centrés ».
19. « À partir d'une certaine hauteur minimale, je veux que le menu et les boutons ne soient plus en bas mais sur le côté
    gauche, pour libérer de l'espace dans la hauteur pour les continents et la ligne d'horizon. » → §W. Answers:
    « Paysage et moins de 720 px »; « Toutes les pages »; labels by the available width as in the bottom dock, icons only
    when it is not enough.
20. (26 Oct, about 13 h 20) « Je veux que le nouveau menu, quand la hauteur devient trop faible, soit dans le même style
    que le menu dans les premières versions du site A. » → §X. Answers: « Centrée, comme avant »; « Deux lignes du même
    style » for the search and the dice; « Paliers de l'ancien menu » for the labels; « Turquoise, et lance » for the
    current item's pill in light mode.
21. (26 Oct, about 13 h 35) « Tu dois aussi me changer le filtre : la plupart du temps il y a beaucoup d'espace vide.
    Propose-moi des solutions pour qu'il ne soit pas vide, qu'il soit centré, mais qu'en même temps il ne se déplace pas
    à chaque fois qu'on sélectionne un pays ou un campus. » The assistant proposed four solutions; the user asked for
    trials of all four (« Fais-moi des essais avec toutes les propositions pour que je me fasse une idée, ensuite tu
    archiveras ça avec le reste »), built in `studies/explorer-b-filter-studies/`. Choice (about 21 h 55): « Je parle du
    chemin en étapes, mais sans la partie continent, car il y a déjà Monde qui est censé être ce niveau de filtre. »
    Answers: on phones at a campus, « Le pays et le campus »; « Oui, lance ». → §Y.

## A. No halos around items

**Today.** L1/L2 items carry two glow spans in `.explorer-box` (`.explorer-glow`, quiet, on neighbours; `.explorer-glow
.explorer-glow-cursor` on the cursor), plus a hover glow (`--hx-glow-hover`). L3 lanterns draw `::before` (quiet logo
glow) and `::after` (cursor logo glow) plus a hover glow. The sheet's heart lantern draws `::before`
(`--hx-logo-glow`). On phones (non-compact) the L3 neighbours' logos are hidden and only their quiet glow peeks into
the edge fade (R5).

**Target.**
- No glow is drawn behind or around any item, at any level, in any state (cursor, neighbour, hover, focus, glide,
  drag, transition), theme (light, dark, forced colours), density (normal, short, compact) or size; none around the
  sheet's heart logo either.
- Kept: the pool of light on the horizon under the centre item (`.explorer-pool`); the horizon line and its glow; the
  names' legibility stroke and glow over the shapes (`--hx-text-halo`, `--hx-text-glow`: they hold the 12.6:1 minimum
  over flags); the cursor's shape shadow; the « Valider » chip and its shadow; Codam's white plate (part of its print).
- Phones, L3 (user's choice): the ±1 neighbours' logos are visible at their slots, faded by the track's edge mask like
  the L1/L2 neighbour silhouettes; their names stay hidden on phones as before; the logos keep their 28 / 22 px floors.
  They must not overlap the cursor's name or chip, and a tap on them moves the cursor (§B).
- Dead code goes with the feature: the glow spans, their CSS (including gliding, compact and forced-colours rules), the
  `gx` layout field and `--gx` if nothing else uses them, and the colour tokens nothing uses any more (search all of
  `site-b/`; light, dark and forced definitions). The track's 170 px bleed stays (the pool, the horizon glow and the
  shadows still need it); update the comments that justified it by the halos.

## B. No Previous/Next buttons

**Today.** The foot's pager is `[‹ Previous] dots count [Next ›]`; in compact density the two buttons sit on the sides
of the row over a foot overlay; a click on `.explorer-nav` moves the cursor by one.

**Target.**
- No Previous/Next button anywhere in the selector. The pager keeps the dots and the count, centred, with today's
  rules (dots hidden below 381 px of viewport, dense or normal by width). `pagerDots()` keeps its thresholds (strict
  scope: the room once taken by the buttons is not reassigned without a request).
- The cursor still moves by the arrows (and Home / End), drag and swipe, the wheel, and a click or tap on a neighbour —
  all unchanged. The click on a visible neighbour is the single-pointer alternative to dragging (WCAG 2.5.7): it must
  work at every size and density, including 320×640 and the compact row.
- Compact density: the foot overlay that only held the buttons goes; nothing empty may intercept pointers.
- Remove the buttons' DOM, listeners, labels, disabled states, CSS (also forced colours) and the copy strings that
  nothing else uses. The shared art icons may stay.

## C. Dragging follows the horizon

**Today.** During a drag the items layer is translated rigidly (`translateX(dx)` on `.explorer-items`): the items
leave the curve and keep their sizes until release; on release the offset is folded into each `--x` and the new layout
glides.

**Target (non-compact densities, L1/L2/L3).**
- At every pointer move, the layout is the continuous one for a fractional cursor `c = startIndex − dx·mirror / pitch`
  (`pitch` as today, `g.x1`): each item's distance from the centre and its scale vary continuously between the rank
  values (rank 0, ±1, ±2, beyond), and its feet stay exactly on the horizon (`y = BLEED + floorAt(g, |x − W/2|) − bh`).
  The derived values (name scale, count offset and scale, logo scale `lk`, name shift `nx`) follow the same
  interpolation, so an item grows as it nears the centre and shrinks as it leaves it — the key glide's look, tied to
  the finger. Integer `c` gives exactly `layoutItems()`'s positions and scales.
- Rank-based looks (names, counts, the « Valider » chip, `data-off`, phone rules) follow the nearest rank during the
  drag, with the existing opacity transitions (a name fades, never pops). The cursor itself (tabindex, ARIA,
  announcements, focus) changes only at release, by today's rule (nearest item, clamped to the list).
- No jump: consecutive moves give continuous positions; at release the items glide from where they are to the final
  layout (today's glide, 0.5 s). The drag is not bounded (as today); past the ends the items keep following the curve,
  then glide back.
- The pool and the horizon stay still during the drag (as today). Vertical-scroll detection, pointer capture, cancel,
  lost capture and the swallowed click after a drag: unchanged. RTL mirrored as today.
- Compact density (a straight row without horizon): unchanged.
- Reduced motion: the drag still follows the pointer (direct manipulation); release jumps without glide, as today.
- Performance: pointer moves are coalesced to one style write per animation frame; no layout read during the drag
  (positions come from the pure layout and the stored geometry); 60 frames/s during a continuous drag with the CPU
  slowed down four times, at 1440×900 and 390×844; no long task over 50 ms. Export the continuous layout as a pure,
  unit-tested function next to `layoutItems()`.

## D. Level changes: only what changes animates

**Today.** `generic()` fades and slides the whole outgoing `.explorer-level` (head, horizon, pool, items, foot) out and
the whole incoming one in.

**Target, for L1↔L2 and L2↔L3 in both directions (motion allowed):**
- **Still** (neither faded nor moved): the hint line (keyboard or touch); for L1↔L2 also the horizon (line and glow) and
  the pool, which are identical at both levels.
- **Moved, not faded:** the step dots and their lines glide horizontally to their new centred place when the prompt's
  width changes (about 0.42 s, the selector's easing); the current-step marker passes to the next or previous dot and
  the dot colours ease in place (about 0.3 s).
- **Crossfaded in place, no slide:** the prompt text (« Où veux-tu aller ? » ↔ « Choisir un pays » ↔ « Choisir un
  campus »); the pager's dots row and the count (both change: number of dots, « i / n »); for L2↔L3 the horizon (line
  and glow) and the pool, whose geometry changes.
- **Items** (shapes, flags, logos, names, counts, the « Valider » chip): today's motion, applied to the items only — out
  0.26 s, opacity 1→0 with `translateY(±18px) scale(.97 / 1.03)`; in 0.42 s after 0.08 s, opacity 0→1 from
  `translateY(∓22px)`.
- Unchanged: the campus-sheet transitions (L3 → sheet: the FLIP of the validated logo and the sheet unfolding while the
  L3 level fades out, since the sheet replaces the whole selector; sheet → L3: the generic ascend, since the L3 head
  and foot appear; sheet ↔ sheet in place); reduced motion (no animation); focus, ARIA (the prompt labels the
  carousel, the hint describes it), announcements; the outgoing view stays inert, aria-hidden and frozen at its box.
- Interruptions: a new view during a transition settles the running one at once, as today; nothing is left half
  faded, displaced or duplicated (rapid validate and ascend, Escape mid-transition, resize, language or theme change).
- Compact density (head visually hidden, no pager): only the items animate. Short density (hint hidden): same rules.
- Either implementation is acceptable — per-level heads and feet swapped in place with the listed sub-parts animated
  from the outgoing boxes, or a head and foot kept across level views — provided listeners, IDs, ARIA and tests stay
  right. Document the choice in the code.

## E. Entrance: the horizon arc instead of the ring (version B's `index.html` only)

**Today.** After the slogan (members) the 42 appears (0.6 s); a circle is drawn around it (0.8 s); when the Explorer is
ready the circle opens as an iris over it (1.2 s) while the 42 and the ring fade.

**Target.**
- No circle around the 42 any more (the ring leaves B's entrance markup and code).
- The arc is drawn exactly where the Explorer's horizon line is (the current level's `.explorer-horizon-line`, mapped to
  viewport coordinates: same curve, same extent), from the centre outwards to both edges, in about 0.8 s with the
  ring's easing. It starts once the 42 has appeared and the horizon's geometry is available; if the preparation is
  still running after the arc, the status « Le monde se prépare… » shows as today.
- The Explorer then opens from the arc: the entrance background parts upwards and downwards from the arc, the opening's
  edges following its curvature, in about 1.2 s, revealing the page (header, scope bar, selector, dock) with the
  silhouettes standing on the horizon. The drawn arc hands over to the real horizon line at the same place, with no
  jump in position (a style crossfade is acceptable). The 42 fades out as today.
- Light and dark as today. The arc's colour and stroke are the implementer's choice, checked in both themes.
- Compact density (the Explorer draws no horizon): the arc runs across the row's vertical centre with a gentle curve,
  the opening starts from it and the arc fades out at the end. Document it.
- Unchanged: the scan, the decryption, the slogan, the 42's appearance, the error path (retry, back, continue), reduced
  motion (no ring, no arc, the Explorer appears at once), the focus after opening (the cursor, first continent).
- Performance: 60 frames/s with the CPU slowed down four times; transforms, clips and masks only, no layout read per
  frame. Version A's `site/entrance.mjs` is untouched.
- The selector keeps the class names `.explorer-horizon` and `.explorer-horizon-line` and the meaning of the path, which
  the entrance reads (or a getter added for it; the entrance owner decides with the selector owner's code as it is).

## H. Key hints behind an info button (requested later the same day)

**Request** (25 Oct 2026, evening): « Je veux que tu retires aussi les indications des touches en bas et que tu les caches derrière un petit bouton d'info. » Answers: « En bas, à côté du compteur » (the button takes the hint's place at the end of the dots-and-count row, the bubble opens above it); « Au clic ou au toucher » (a click or a tap opens the bubble; a second click, Escape or a click elsewhere closes it; the button is reached with Tab).

**Today.** Under the pager, the hint line shows the keyboard keys (« Flèches pour choisir · Entrée pour valider · Échap pour revenir », with `<kbd>`) or, on coarse pointers, the touch hint (« Glisse pour choisir · Touche le centre pour valider »); it is visually hidden in the short and compact densities and always describes the carousel (`aria-describedby`, H2f).

**Target.**
- The hint line is no longer shown under the pager.
- A small info button (an « i » in a circle, in the site's control style) ends the pager row, after the count: `dots count ⓘ`, mirrored in Arabic. Its visual can be small but its target is at least 24×24 px (WCAG 2.5.8), and nothing else in the row moves more than the button's own room requires. Accessible name « Aide » / « Help » / « مساعدة », `aria-expanded`, `aria-controls` the bubble.
- A click or a tap toggles a small bubble above the button with exactly today's hint (keyboard or touch variant, chosen by today's rule), inside the band (never under the search capsule, the dock or the screen edge). A second click, Escape (which then does not ascend a level), a click or tap anywhere else, a level change, or leaving the Explorer closes it. A language change while it is open updates its text. Keyboard: Enter or Space on the button toggles it; the focus stays on the button.
- Screen readers: the carousel keeps being described by the hint text, still in the DOM (visually hidden when the bubble is closed); no duplicated ids.
- Densities: in the normal and short densities the button sits in the pager row (the short density, which hid the hint, gains the button); below 381 px of viewport the row is `count ⓘ`; the compact row has no pager and keeps no visible hint, as today.
- During level changes (§D) the button stays still. Forced colours: button and bubble in system colours. Reduced motion: the bubble appears without motion.
- **After the build (26 Oct, about 0 h 50), the user's answers to the builder's two open points:** the room of the old hint line is kept empty under the pager (« La garder vide »), so nothing else moves; the bubble is tightened (« Resserrer la bulle »: smaller inner padding and gap to the button) so that, open, it never covers the « Valider » chip, at any size, language or variant (it covered up to 7.7 px of the chip's bottom where the hint wraps to two lines, at 390 and 320 px). The button glides with the row when the number of dots changes between levels (it cannot stay still next to a count whose place moves); the user was told.

## I. The horizon stays in the same place at every level (requested later the same day)

**Request** (25 Oct 2026, evening): « La ligne d'horizon ne se trouve pas au même endroit quand on doit sélectionner le campus ; elle remonte un peu après avoir choisi un pays. » Answer: « Garder celle des pays » — the line of the continents and countries is kept at all three levels, and the campus logos come down onto it.

**Today.** `haloGeometry({campus:true})` sizes the campus level on its own (`bh` ≤ 200, `below` 86 instead of 78), so for the same band its line is 29 px higher (measured at 1440×520, 1440×600, 1280×420, 390×430, 390×520 and 320×380) and flatter (`R` 2297 instead of 1843 at 1440).

**Target.**
- For a given band (W, H, phone, density) the campus level draws exactly the line of the continent and country levels: same `floor0`, same curve (`d1`, `R`), same path. It keeps its own item sizes (square lanterns, `bh`, `bw`, `s1`, `s2`, `x1`, `x2`, `F`, `below`) and stands on that line: the cursor's feet on the common `floor0`, the neighbours' feet on the common curve. The logos thus come down by about 29 px.
- The room under the line must hold the campus names and the « Valider » chip (86 px); measured room 106–216 px at the sizes above. If some band is too short, report it rather than shrink anything.
- The pool stays at the line (its width per level as today).
- §D follows: for L2↔L3 the horizon is now identical, so it stays still like L1↔L2; only what still changes (the pool's width) crossfades. §C follows: a drag at L3 runs along the common line. §E and the compact row: unchanged. The campus sheet: unchanged.

## J. Names above the campus dots (requested later the same day)

**Request** (25 Oct 2026, evening): « Les points qui représentent les campus passent devant le texte, le texte doit se situer au premier plan. »

**Today.** On the continent and country silhouettes the campus dots (`.hx-dots`, `z-index: 2`) are drawn over the names (`z-index: 1`): Halo's rule R2, « the campus dots above the name ».

**Target.** The names, with their legibility stroke and glow, are drawn above the dots at every level, state, theme (forced colours too) and size. The dots keep their places, sizes and opacities; they are simply under the text where both meet. Nothing else changes.

## K. No campus counts under the continents and countries (requested later the same day)

**Request** (25 Oct 2026, evening): « Je veux que tu retires l'inscription des campus sous les différents choix, garde uniquement l'indication en haut sous le filtre. » Answer: « Il remonte sous la silhouette » (the « Valider » chip takes the count's place).

**Today.** Under each continent and country silhouette a count line (`.explorer-meta`, for example « 20 campus · 14 pays » or « 8 campus ») shows for the cursor and, on desktops, its ±1 neighbours; the « Valider » chip comes under it.

**Target.**
- No count line under any continent or country item, at any rank, size, state or theme.
- The « Valider » chip comes right under the silhouette, where the count was (about 30 px higher than today). The horizon, the silhouettes, their names and the geometry (`below`, `bh`, the line) do not move.
- Kept: the indication under the filter (the scope bar's « 58 campus · 30 pays », or the counts of the validated continent or country); the campus names under the L3 logos; the counts inside the items' accessible names, so screen readers lose nothing (the visible name stays part of the accessible name).
- Dead code goes with it (the count's node, its CSS, the layout values only it used), keeping what the campus names still use (`--mt`).
- §C and §D follow: there is no count left to interpolate during a drag or to fade at a level change.

## L. Held arrow keys follow the horizon (requested just after midnight)

**Request** (26 Oct 2026, about 0 h 10): « Quand on reste appuyé sur les flèches pour déplacer les éléments, l'animation ne suit pas bien la ligne d'horizon comme elle le fait à une vitesse de déplacement normale. »

**Today.** A cursor move by a key, the wheel or a click glides by CSS transitions of each item's transform (0.5 s): the translation goes straight from the old slot to the new one. A single move stays close to the curve, but when an arrow is held, its repeats (every 30–50 ms) restart the transitions from wherever the items are, so they cut across the line, lag and bunch.

**Target.**
- Every animated cursor move (arrow keys held or not, Home and End, the wheel, a click or tap on a neighbour, `setCursor` with animation) runs along the horizon: the layout is the continuous one of §C (`continuousLayout()`) for a fractional cursor that eases from where the row is to the target index, so every item's feet stay on the line and its scale follows its distance, at any speed.
- Held key: each repeat moves the target by one item, as today; the motion retargets with no jump and no stop (continuous velocity) and settles on the last target with today's easing and duration once the key is released. No item leaves the line, lags behind its neighbours or overlaps them.
- A single press at a normal pace looks as today (0.5 s, the selector's easing), now exactly on the arc.
- Rank looks (names, the chip, `data-off`) follow the nearest rank during the motion with their fades, as during a drag; the cursor itself (tabindex, ARIA, focus) changes at each step as today; announcements unchanged.
- Unchanged: the drag (§C), the compact row (a straight row), reduced motion (moves jump), the level changes (§D). A drag or a level change during a glide settles it cleanly.
- Performance: one style write per frame and no layout read per frame; 60 frames/s with the CPU slowed down four times during a held key, at 1440×900 and 390×844, on mains power.
- **After the build (26 Oct, about 2 h 20), the user's answer to the builder's open point** (at about 30 items/s the nearest-rank fades could not complete, so several half-transparent « Valider » chips showed until the row slowed down): « Masquer pendant le défilement » — during a fast glide (a held key or quick successive moves) the « Valider » chip is hidden; it fades back in on the item where the row stops, as the glide slows down. The names keep their nearest-rank fades; a single move at a normal pace and the drag itself are unchanged. (Superseded at about 3 h 15 by §P: the « Valider » button becomes fixed and always shown.)

## N. No « Exploration · 42 Horizon » note (requested at about 3 h 10)

**Request** (26 Oct 2026): « Supprime le texte Exploration 42 Horizon. » Answers: « La supprimer avec le texte » (the button and the dialog it opened go) and « Garder la place vide » (the Explorer's band keeps the room the note took).

**Today.** On the Explorer only, B's pages show the button `#about.prototype-note` (« Exploration · 42 Horizon », « تصوّر أولي · 42 Horizon » in Arabic; hidden on phones by existing rules). It opens the dialog « Une nouvelle façon d'explorer »: the network's 58 campuses in 30 countries with the date and the official source link, the continents after the UN regions, the fictional contents. `#about` is also one of the bottom elements that bound the Explorer's band (`createExplorerBand`), and the entrance shows it during the opening.

**Target.**
- No such button or dialog anywhere in version B (both pages, every size, language and theme); the copy strings, the listener and the rules that only served them go too (dead code), but files that only carry a harmless dead rule may be left as they are to avoid touching them (say which).
- The band keeps exactly its current box at every size: the room the note took stays empty, nothing else moves (the selector, the horizon, the items, the scope bar, the dock and the search capsule). Prove it against the state before this pass.
- The entrance's opening shows everything else as before.
- Version A (`site/`) keeps its note (only B changes).

## P. A fixed « Valider » button (requested at about 3 h 15)

**Request** (26 Oct 2026): « Je veux que le bouton Valider ait toujours la même position, et ça doit être la position du bouton sous le campus. » Answer: « Fixe, il ne bouge jamais » — at the campus-level height at every level, and still during every motion.

**Today.** Each item carries its own « Valider » chip, shown on the cursor: since §K right under the silhouette at L1/L2, and under the logo and the campus name at L3. It moves with its item during glides and drags (§C, §L), fades with the items at a level change (§D), and is hidden during fast glides (pass 7, the answer « Masquer pendant le défilement »).

**Target.**
- One « Valider » button at the centre of the band, at the height the campus level gives its chip under the cursor's logo and its one-line name: the same place at L1, L2 and L3 for a given band, language and density. At L1/L2 the space between the silhouette and the button stays empty.
- It never moves: during key glides (held or not), the wheel, clicks on neighbours, drags and level changes it stays where it is, fully shown (a still part for §D); the items pass over it. Pass 7's hiding during fast glides is superseded and goes.
- A click or tap on it validates the cursor item, as the cursor's chip does today; during a glide it validates the cursor (the target), as Enter does. Keyboard and screen readers keep today's model: one tab stop per level (the cursor item, roving tabindex), Enter or Space validates, the cursor item's accessible name keeps « Valider »; no second tab stop and no duplicated announcement. The focus cue of decision A (a ring around the « Valider » button only) shows on the fixed button whenever the cursor item has the keyboard focus.
- The compact row (no horizon): keep today's arrangement of its cursor chip unless a fixed equivalent fits without overlap; report the choice. Forced colours, reduced motion, RTL and phones: today's chip styles.
- The campus sheet is unchanged. Performance unchanged.
- **The help bubble (§H) never covers the fixed button.** Pass 7 found that, tightened, the bubble no longer touched the chip at L1/L2 but still covered the lower campus-level chip in 32 of 48 combinations (up to 29.9 px), which the fixed button would extend to every level. The user's answer (26 Oct, about 3 h 30), « À côté si possible »: where the band is wide enough, the bubble opens beside the ⓘ button, towards the screen edge, clear of the « Valider » button; where it is not (phones), it opens above the « Valider » button, over the lower part of the centre item. In every case it stays inside the band and clear of the scope bar, the search capsule, the dock and the viewport edges.

## Q. A plain black background in dark mode (requested at about 7 h)

**Request** (26 Oct 2026): « Je veux que tu modifies le fond du site en mode sombre et que tu gardes uniquement la couleur noire, donc il faut retirer le rose et le bleu qu'il y a dans les coins. » Answers: « Version B seulement »; « Le noir actuel » (#1B1B1B, the 42 charter's ink, `--h42-color-bg` in dark).

**Today.** In dark mode the page's `.atmosphere` layer paints two radial glows over the ink background: pink (`--h42-pink`, 7–8 %) towards the bottom-left corner and teal (`--h42-teal`, 8–9 %) towards the top-right corner, with a variant for narrow screens and for content pages. The entrance's dark background is already plain ink.

**Target.** In dark mode, on both B pages, every section and every size, the background is the plain ink #1B1B1B: no pink or teal glow in the corners or anywhere in the page background. Light mode is unchanged. Nothing else changes: panels, glass surfaces, the Explorer's pool and horizon glow (they belong to the selector, not to the page background), the entrance. Version A keeps its glows.

## R. The 42 flies to the header, HORIZON cascades in, the continents slide in (requested at about 7 h 10)

**Request** (26 Oct 2026): « Je veux que tu modifies l'animation quand on passe du logo 42 avec horizon à la page Explorer : le logo 42 doit monter en haut à gauche, puis afficher Horizon de la même façon que AWARDS. Et les continents doivent arriver avec une animation de la gauche vers la droite et s'arrêter sur Afrique. » Then: « En arabe l'animation doit être inversée du coup, si je ne dis pas de bêtise. » Answers: « Miroir, arrêt sur l'Asie »; « En même temps ».

**Today (after §E).** The 42 appears at the centre; the arc is drawn on the horizon; the background parts from the arc while the 42 fades out; the page shows at rest, its header brand (42 and HORIZON) revealed like everything else, the cursor on the first continent.

**Target (version B's `index.html`, members and visitors).**
- The arc and the opening stay as in §E, except that the 42 no longer fades: during the opening it flies from the centre to the header's 42 (top-left; top-right in Arabic, the header being mirrored), shrinking to the header's size, and lands exactly on it (the header's own 42 then takes over at the same place, no jump).
- When the 42 has landed, HORIZON appears next to it with the letter cascade of the HORIZON ↔ AWARDS transition (`brand-wordmark`, piste 08 « Cascade de lettres »), as from an empty word to HORIZON; what the header shows in each language (the Arabic line too where the V8 rule shows it) ends exactly as today.
- At the same time, the continents arrive along the horizon (the continuous glide of §C/§L, the feet on the line): from the left towards the right in French and English, stopping on Afrique; mirrored in Arabic, from the right towards the left, stopping on the first continent of the Arabic order (آسيا, the existing arrival rule). The fixed « Valider » button (§P) stays at its place.
- At the end, everything is exactly the state of today's arrival: the cursor and the focus on the first continent, the header and the band at rest. The rest of the page (scope bar, dock, search capsule, account) is revealed by the opening as in §E.
- **The other elements arrive from their own edge** (added at about 9 h 35, after « Les autres éléments doivent arriver avec une jolie animation », answer « Chacun depuis son bord »): during the opening, the header's controls (language, theme, account) and the scope pill come down from the top, the dock comes up from the bottom (or in from its side when it is the side rail of §W), and the search and the dice follow, each with a short slide and a fade, slightly staggered; they end exactly at their place. (The user still saw a growing circle at the entrance: the old iris, served from the browser's cache because the cache keys had not been bumped yet; the code has had no circle since §E.)
- **No opening from the arc any more** (26 Oct, about 9 h 50): « Je ne sais pas de quel cercle tu parlais, mais il y a toujours l'animation que je ne veux pas : en fait, c'est l'animation qui part depuis la ligne d'horizon pour faire apparaître tous les autres éléments du site. » This withdraws §E's « Il s'ouvre depuis l'arc »: the background no longer parts from the arc to reveal the page. Once the arc is drawn, the entrance's background gives way at once to the page's identical background with nothing revealed by a mask; every element arrives by its own animation: the 42's flight and the HORIZON cascade, the continents sliding along the line (the arc being the real horizon), the header's controls, the scope pill, the dock and the floating buttons from their edges as above, and the selector's own centre parts (the step dots, the pager row, the fixed « Valider » button) with a short fade and rise.
- **The 42 lands first** (26 Oct, about 10 h): « Je veux que tu attendes que 42 arrive à sa position avant de lancer les autres animations. » The sequence is therefore: the arc is drawn; the 42 flies to the header's 42; only once it has landed do all the other animations start together (the HORIZON cascade, the continents' slide, the edge arrivals and the selector's centre parts).
- Reduced motion: no flight, no cascade, no slide; the page appears at once. The error path, the slow preparation (the status before the arc) and the compact row (§E's fallback; the row arrives with its own straight glide, or at once if that cannot be done cleanly: report) keep working.
- Version A is untouched. The content-preview page has no entrance.

## S. A small globe in the filter's medallion (requested at about 7 h 15)

**Request** (26 Oct 2026): « Je veux aussi que tu gardes le petit globe dans le filtre dans chaque page où il peut être présent. » Answer: « Immobile ».

**Today.** In version A the scope pill's medallion (`#scope-medallion`, a 32 px seat cut into the pill) shows the real globe, moved and shrunk behind it. Version B has no globe, so the seat shows the page background, an empty ring, on every page.

**First reading, withdrawn.** The assistant read « le petit globe » as a globe to draw in the medallion and offered « Immobile » or « Tourné vers le filtre »; a first builder drew B's former « Monde » globe there. The user then corrected it (26 Oct, about 8 h 15): « Tu as rajouté un globe, mais moi je parlais de l'émoticône déjà présente. » The drawn globe is withdrawn completely.

**Target (corrected).** « Le petit globe » is the globe pictogram (`#i-globe`) of the filter's « Revenir au monde » button (`#reset.scope-world-return`), which B shows on the Explorer only: on the other sections a rule (`.app[data-navigation=dock]:not([data-section=explore]) .scope-world-return{display:none}`) hides it and the medallion's seat stays empty. In B the button and its pictogram show wherever the filter shows — the Explorer as today, every content section, the detail pages and the reading mode — at the same place and with the same look as on the Explorer, in both themes, the three languages and forced colours. It works as on the Explorer (it returns the filter to the world), except where the whole filter is inert today (the reading mode), where it only shows. Nothing else moves. Version A unchanged.

## T. A fixed-width filter (requested at about 7 h 20; replaced by §Y in the evening)

**Request** (26 Oct 2026): « Je ne suis pas satisfait du fait que le filtre change en fonction de ce qu'il y a écrit comme pays et campus ; il faudrait que la taille reste fixe pour éviter que, par exemple, lorsqu'on appuie sur retour, le bouton se déplace. » Answer: « La plus longue indication ».

**Today.** The scope pill (the medallion, the ← back button and the trail: « Monde », a continent, « France », « France › 42 Paris ») is as wide as its text and centred, so its ends and its ← button move whenever the filter changes.

**Target.**
- In B, the pill's width no longer depends on the current filter. For the current language and viewport it is the width of the longest indication the pill can show, over « Monde », the 4 continents, the 30 countries and the 58 campuses, in the form the pill uses at that size (« Pays › Campus » on large screens, the campus alone in the compact form). It is measured with the real fonts once they have loaded, and recomputed on a language change, a resize or a change of form. Nothing is truncated on desktops.
- Where that width does not fit (phones), the pill takes the available width, and longer indications end with « … »; the full indication stays available to assistive technologies (its existing accessible name or summary).
- So the ← button, the medallion and the pill's ends never move when the filter changes: validating, ascending, the ← itself, the reset, the search and the content pages' filter. The text keeps today's alignment inside the pill.
- Every page where the pill shows (the Explorer, the content sections, the reading mode). Version A unchanged.

## U. A lower horizon (requested at about 8 h 45)

**Request** (26 Oct 2026): « Je trouve que la ligne d'horizon est trop haute au moment de l'affichage du logo 42 ; il faudrait que tu la descendes, et par conséquent qu'elle descende aussi dans Explorer pour rester cohérente. » Answer: « Nettement sous le 42 ».

**Today.** The entrance's arc is drawn on the Explorer's horizon (§E), which passes behind the centred 42 at 1280×720 and 320×640 and touches its base at 1440×900.

**Target.** The horizon line comes down, in the Explorer and therefore in the entrance's arc (still drawn exactly on it): the arc passes clearly below the entrance's 42, about 40 px under its bottom edge on desktops, at every size where the band allows it. In the Explorer the line, the items standing on it (§I: the same line at every level) and the fixed « Valider » button (§P) come down by the same amount; their sizes do not change. The room under the line must still hold the campus names, the « Valider » button and the pager row clear of each other; where a band is too short for the full 40 px, the line comes down as far as that room allows (report those sizes). The entrance keeps its sequence (§E, §R).

**After the build (26 Oct, about 10 h 05).** The line came down by up to 40 px; it now passes 41 px under the 42 at 1440×900 (30.5 px in Arabic) and 37 px at 390×844 (25 px in Arabic), but the short bands could not take it under the 42: at 1366×768 it nearly touches it, at 1280×720 it still crosses it (16 px above its bottom) and at 320×640 too (36 px). The user's answer, « Placer le 42 plus haut »: on those short screens only, the entrance's 42 shows higher than the centre, so that the arc passes clearly under it (about 40 px, as elsewhere); the Explorer does not change, and the 42 then flies to the header as everywhere.

## V. Only the step dots, centred (requested at about 8 h 45)

**Request** (26 Oct 2026): « Je veux aussi que tu retires le texte qui demande à l'utilisateur où il veut aller, car le texte change et par conséquent les points suivent aussi, car il faut que tout soit centré ; donc je pense qu'il vaut mieux garder juste les points centrés. Si tu as une meilleure idée, propose-la-moi. » The assistant offered two alternatives (the dots above with the prompt below; the prompt in the ⓘ bubble); answer: « Juste les points centrés ».

**Today.** The head shows the three step dots, then the prompt (« Où veux-tu aller ? », « Choisir un pays », « Choisir un campus »), centred together, so the dots move whenever the prompt changes width (§D glides them).

**Target.** The prompt is no longer shown. The three step dots are centred alone and never move between levels (§D's sideways glide of the steps becomes moot: they stay still, only their states ease). The prompt stays in the DOM, visually hidden, still labelling the carousel with its step (« Étape n sur 3 »), so screen readers lose nothing. The head's freed height may be used by the band's geometry, together with §U's lower horizon. Nothing else changes.

## W. The menu on the side in short landscape windows (requested at about 9 h)

**Request** (26 Oct 2026): « À partir d'une certaine hauteur minimale, je veux que le menu et les boutons ne soient plus en bas mais sur le côté gauche, pour libérer de l'espace dans la hauteur pour les continents et la ligne d'horizon. » Answers: « Paysage et moins de 720 px »; « Toutes les pages »; and, for the look: « Je veux que le texte s'affiche en fonction de la largeur de la même façon que ça a été pensé pour le menu en bas. Donc si la largeur n'est pas suffisante on affiche seulement les logos. »

**Today.** The navigation is a dock at the bottom (Explorer, Projets, Profils, Chroniques, 42 Awards), with the floating search capsule and the dice above it; the dock's labels follow its width in steps (labels beside the icons, labels under the icons, only the active label, icons only).

**Target (version B, every page).**
- When the window is wider than tall and less than 720 px tall, the dock becomes a vertical rail on the left side (on the right in Arabic), and the search and the dice become buttons at the bottom of that rail; the Explorer's band (and every page's content) takes the freed height. In every other window (portrait phones included) the dock stays at the bottom as today.
- The rail's labels follow the available width with the same logic as the bottom dock: labels as long as the width allows them, otherwise the icons only (each keeping its accessible name and its tooltip). Define the steps from the existing dock rules and document them.
- The search opens from its rail button as it does from the capsule (same panel and behaviour), the dice works as today, the active section is marked as today, keyboard order and focus stay logical (the rail in reading order before or after the main content as today's dock), the header, the scope pill and the entrance's 42 flight (§R) stay clear of the rail.
- Switching between the bottom dock and the rail on a resize or a rotation is immediate and keeps the state (active section, open search, focus).
- Version A unchanged.
- **After the build (26 Oct, about 11 h 10).** The builder's readings, which the user has not confirmed yet:
  - the threshold is `(orientation: landscape) and (max-height: 720px)`, so a window exactly 720 px tall, such as 1280×720, gets the rail; a strictly-less reading changes that string in `welcome.mjs` (`DOCK_RAIL`), the four matching `@media` lines of `responsive-dock.css` (to `719.98px`) and the assertions of `tests/dock-rail.test.mjs` that pin them;
  - two label steps instead of the dock's four: labels beside the icons when the window is wider than 1050 px (a 140 px rail), icons only otherwise (a 56 px rail, each label kept as the button's name and shown as its tooltip); the dock's middle steps would cost height, which these windows lack;
  - the rail stands on the bottom margin, as the dock did, with the search and the dice at its foot, and grows upwards (about 270 px stay empty above it at 1280×720); centring it is a small change;
  - the page column (the Explorer's stage, the scope pill, the content, the loading status) is centred beside the rail, so the scope pill sits 100 px right of the window's centre at 1280×720, and the entrance's arc, drawn on the Explorer's horizon, lies about 100 px right of the centred 42 (left in Arabic);
  - while the search is open, the rail stays visible, dimmed.
  The Explorer's band reaches the rail's foot: at 1280×720 it grows from 339 to 526 px. The rows share the height between the header and the bottom margin (48 px at most, 32 px at least; 37 px at 667×375). The bottom dock is pixel-identical elsewhere.

## X. The side rail in the style of version A's first menu (requested at about 13 h 20)

**Request** (26 Oct 2026): « Je veux que le nouveau menu, quand la hauteur devient trop faible, soit dans le même style que le menu dans les premières versions du site A. » The assistant showed the reference (version A's side menu from its first versions, 27 September to 4 October 2026, before the bottom dock; for example `archives/early-prototypes/separate-city-map/index.html`; its rules are still the base `.main-nav`, `.main-nav button` and `.nav-indicator` rules of `welcome.css`, lines 6, 11, 12 and 92–96, which the dock overrides under `data-navigation=dock`) and asked four questions. Answers: « Centrée, comme avant »; « Deux lignes du même style »; « Paliers de l'ancien menu »; « Turquoise, et lance ».

**Today (§W).** In landscape windows at most 720 px tall, the dock is a vertical glass panel (white, rounded, shadowed) with icon-and-label buttons, anchored on the bottom margin, 140 px wide with labels above 1050 px and 56 px with icons only below; the search and the dice are two round glass buttons at its foot.

**Target (version B, the rail only; same threshold, same windows).**
- **The old menu's look**, with its values, not new ones: no panel (no background, border, shadow or blur on the rail or its buttons); each section is a row with its icon (23 px, stroke 1.6) and its label, start-aligned; inactive labels and icons in the old muted colour (light `#536163`, dark `--h42-color-muted`), the hovered one in the text colour; the current section in the text colour, weight 500, its icon turned (`rotate(-8deg) scale(1.08)`) and coloured (light: teal 75 % mixed with ink; dark: `--h42-pink`); one soft pill behind the current row that glides from row to row (`transform .48s var(--ease)`): light, the old turquoise pill (teal 10 % over the background, teal 22 % border, the small teal shadow); dark, the old plum pill (`--warm-soft`, `--warm-line`). Rows 22 px rounded, pill 23 px.
- **Centred** in the height between the header and the bottom margin (as the old menu's `top: 50%`), never over the header; at the old side inset (48 px; 24 px in the middle step); on the right in Arabic.
- **Width steps of the old menu:** wider than 1050 px, labels at 26 px in a 248 px menu (rows 66 px, padding 15 px 20 px, gap 19 px, 12 px between rows); from 701 to 1050 px, labels at 23 px in a 206 px menu (padding 15 px 16 px, gap 12 px); at 700 px and less, icons only, in the same style (the pill around the icon), each label kept as the button's accessible name and shown as its tooltip, as in §W.
- **The search and the dice:** two more rows of the same style under the five sections, after a slightly larger gap: « Rechercher » and « Au hasard » (English « Search » and « At random », Arabic « بحث » and « عشوائيًا »), with their existing icons; the pill never moves to them; icons only in the narrow step. They keep their behaviour from §W (the search opens the same surface beside the rail; the dice works as today; both stay hidden where they are hidden today, such as Awards). Each visible label stays part of its button's accessible name (WCAG 2.5.3): the search toggle's name already starts with « Rechercher »; the dice keeps its current per-section meaning after « Au hasard ».
- **Short windows:** when the seven rows do not fit the free height, the rows shrink together (as §W did, never under a 32 px target), the labels keeping their step's size as long as they fit their row.
- **Unchanged:** the threshold and the switch to and from the bottom dock; the bottom dock everywhere else; the page column beside the rail (with the new widths); the order, keyboard and focus, the current-section marking for assistive technologies; the entrance's arrival of the rail from its side (§R, §W) and its 42 never crossing the rail; the existing fade while a content page scrolls; forced colours in system colours. Version A unchanged.
- **Corrections after the first look (26 Oct, about 13 h 55), binding over the points above:** « Le menu est beaucoup trop gros, réduis la taille, recentre un peu ça, et pour les deux boutons du bas fais-en uniquement des icônes finalement », then « Le menu ne doit plus être affecté par l'effet de disparition lorsqu'il passe à gauche ». Answers: « Moyenne, environ 70 % »; « Centré en hauteur ». So:
  - **size:** wider than 1050 px, labels 18 px, icons 20 px, rows 44 px, a menu about 180 px wide; from 701 to 1050 px, labels 16 px, rows 40 px (icons and widths in proportion); at 700 px and less, icons only, as before; gaps, paddings and the pill's radius scaled in proportion; the colours, the pill and the turned current icon unchanged;
  - **placement:** the whole block (the five sections and the two icons) centred in the free height between the header and the bottom margin, with air above and below, its side still aligned with the header's 42;
  - **search and dice:** two icon-only buttons side by side under the five sections, in the same style (no background, the muted icon colour, the same hover and focus), their names kept as accessible names and shown as tooltips; the « Rechercher » / « Au hasard » rows are withdrawn;
  - **no scroll fade on the rail:** while the dock is the side rail, it never fades when a content page scrolls (the bottom dock keeps its fade).
- **One more correction (26 Oct, about 14 h 35):** « Le bouton pour la sélection au hasard doit passer sous la recherche quand le texte du menu à gauche disparaît. » In the icons-only step (700 px wide and less), the dice stands under the search icon, in the same column as the section icons, instead of beside it; the labelled steps keep the two icons side by side.
- **After the build (26 Oct, 14 h 30, and the lead's check of the dice at 20 h 30, its pass having been stopped by the pause before its report):**
  - wider than 1050 px: labels 18 px, icons 20 px, rows 44 px, a 180 px menu at 48 px from the side (32 px in wide windows at most 520 px tall, where the header's 42 moves to 32 px); from 701 to 1050 px: labels 16 px, icons 18 px, rows 40 px, a 150 px menu at 24 px; at 700 px and less: icons only in 40 px cells, one column (the five sections, then the search, then the dice);
  - the block is centred in the free height between the header and the bottom margin (132 px of air above and below at 1280×720, 94 px at 1024×600); the rows shrink together to a 32 px floor (35.3 px at 667×375, 32 px at 568×320), gaps and the break in proportion; below about 224 px of free height (1280×300, for example) the block runs past the bottom margin;
  - the search and the dice: icon-only buttons with the rows' colours, hover and focus ring (5 px out); on the rail their icons no longer turn on hover; side by side in the labelled steps, the dice under the search in the icons-only step; the « Rechercher » / « Au hasard » copy is gone;
  - no scroll fade while the dock is the rail (CSS inside the rail's query; the bottom dock and the back-to-top shortcut keep theirs); on the rail the Explorer's band now reaches the window's bottom margin;
  - cache keys `b8` for `responsive-dock.css`, `welcome.mjs`, `explorer-band.mjs` and `content-preview.mjs`; the bottom dock is pixel-identical to `46279b0` at 1440×900 and 1366×768; tests B 752/752, A 660/660;
  - the page column now starts 240 px from the left at 1280×720, so the entrance's arc lies about 120 px right of the centred 42 (100 px with §W); the longest 16 px label, « Chroniques », has 8 px to spare in the 150 px menu.

## Y. The scope pill as a path in steps (chosen at about 21 h 55)

**Request and choice:** §0 item 21. The reference is the trial « Le chemin en étapes » (`studies/explorer-b-filter-studies/essais/chemin-en-etapes/`, its README and the study's NOTES.md), built on a frozen copy of version B at commit `46279b0`; it is now ported into `site-b/` as it stands (with §X), with the user's two changes.

**Target (version B, wherever the scope pill shows).**
- The pill shows the whole path in three steps, the chosen ones in the text colour and the ones still to choose as muted placeholders: at the world level « Monde ⌄ › Pays › Campus »; after a continent « Europe ⌄ › Pays › Campus » (the continent takes Monde's place: there is no « Continent » step, since « Monde » is that level); after a country « Europe › France ⌄ › Campus »; at a campus « Europe › France › 42 Paris ⌄ ». English « World › Country › Campus »; Arabic mirrored, with the words the trial used for the levels. Placeholders are not interactive; the existing ancestor buttons keep their behaviour; the continent step may stay plain text, as in the trial.
- One fixed width: the longest full path over every indication in the current language and form, measured with the real fonts (as `scope-pill.mjs` does today); the pill never moves or resizes when the filter changes; its centre is on the page's axis at every level (the column beside the side rail when the rail shows; the 26 px offset of §T is gone); the ← keeps one fixed place; the text is centred on the pill's whole width (a path too long for that starts right after the globe, as in the trial).
- Phones (the compact form): a short form with its own fixed width, the current step and the next placeholder (« Monde ⌄ › Pays », « Europe ⌄ › Pays », « France ⌄ › Campus »), except at a campus, where it shows the country and the campus, « France › 42 Paris ⌄ », as today, the country staying a button that ascends to it.
- Kept: the line under the pill (« 58 campus · 30 pays »…); the « Revenir au monde » globe (§S); the reading mode (the placeholders shown and inert, as the whole pill there); accessible names (the picker's name keeps the full current place); the search, the popover and the content pages' filter. The catalogue the controller already has gives each country's continent (no second fetch of `campuses.json`). Version A unchanged.
- **After the build (26 Oct, about 22 h 40):** the steps are static markup in both pages (the continent as text, two muted placeholders filled by `localize()`), shown by `updateScope()` and measured on copies by `scope-pill.mjs`, which fixes the pill's width and its height (the tallest path: 54 px in Arabic at every level, so the line and the band sit 3 px lower in Arabic than before) and centres the text with `--scope-shift`; `.scope-bar::after` reserves the ←'s room after the pill, so the pill is on the page's axis (on the column's axis beside the side rail). Widths at 1440 × 900: 406 px in French, 418 in English, 422 in Arabic (345 to 363 before); 272 px at 390 × 844. In the existing compact form (phones about 372 px wide and less, 320 × 640 for example), the country before a campus stays hidden as before, so a campus shows « 42 Paris ⌄ » alone there; « France › 42 Paris ⌄ » shows on the other phones. At 390 px, 5 French paths end with « … » (« Émirats arabes unis › Campus », « Émirats arabes unis › 42 Abu Dhabi », « Corée du Sud › 42 Gyeongsan », « Luxembourg › 42 Luxembourg », « Madagascar › 42 Antananarivo »), 4 in English and 1 in Arabic (none before), the full text staying in the picker's name and tooltip. Long paths start right after the globe (8 of 94 in French on desktops, up to 21.9 px off the middle). Cache keys `b9` for `scope-pill.mjs`, `welcome.mjs`, `dock-navigation.css` and `content-preview.mjs`; tests B 758/758, A 660/660; at 42 Paris the pill is pixel-identical to the archived trial's.

## F. Ownership, keys, archive

- **Selector owner** (§A–§D and §H–§L, six successive passes on the same files: A+B, C, D, I+J, H+K, then L):
  `explorer-selector.mjs`, `.css`, `.test.mjs`; `explorer-campus.css` (the heart glow only) and the matching assertions
  of `explorer-campus.test.mjs`; `explorer-art.css` and `explorer-art.test.mjs` (tokens only).
- **Entrance owner** (§E, in parallel): `entrance.mjs`, `entrance.css`, `entrance.test.mjs`, B's `index.html` (the ring
  markup), `welcome.mjs` only for the entrance wiring.
- **Integration** (after both): cache keys `?v=b7` for every changed file and every file that imports or links it
  (`welcome.mjs`, `index.html`, `content-preview.html`), and the tests that pin keys; full suites.
- **Archive:** the state before these changes (after the « Monde » removal) is kept in
  [`archives/site-b-versions/`](../../archives/site-b-versions/README.md) as `pre-explorer-refinements-20261025/`, pruned
  to the files that change.

## G. Verification (read-only, independent of the builders)

1. **Motion:** frame-by-frame captures (animations paused and sought) of L1↔L2, L2↔L3, L3↔sheet and the entrance, at
   1440×900, 1280×720, 390×844, 320×640 and 667×375, FR/EN/AR, light/dark: the still parts are pixel-identical across
   frames; only the listed parts move; no element half faded after settling; interruptions.
2. **Drag and buttons:** mouse and touch drags step by step: items on the curve (`y` against `floorAt`), continuous
   scale, nearest-rank looks, release glide without jump, RTL, compact unchanged, reduced motion; no Previous/Next
   anywhere; tap or click on neighbours at every size; wheel and keys unchanged.
3. **Visual parity:** against the archived state, served side by side: only the requested differences (no halos,
   neighbour logos on phones, no buttons, the hint behind the info button), at every level, the sheet, both themes,
   forced colours, three languages. The info button and its bubble (§H): opening and closing by click, tap, Enter,
   Space, Escape and outside clicks; placement inside the band at every size; RTL; screen-reader description kept.
   The horizon (§I): the same path at L1, L2 and L3 for every size, the campus logos on it, still during L2↔L3. The
   names above the dots (§J) on continents and countries, at every rank and in forced colours. No count under the
   continents and countries (§K), the « Valider » chip right under the silhouette, the scope bar's counts unchanged.
4. **Regression:** both suites (B, then A 660/660); the « Monde » removal (four continents, world filter by default,
   counts 78/78/78 and Europe 44/42/42, reset, stale history states); keyboard flow and focus order without the
   buttons; history, reload, deep links, the « Explorer {campus} » buttons; console and requests; cache keys;
   accessibility (target sizes of the neighbours, WCAG 2.5.7); 60 frames/s during drags, transitions and the entrance
   with the CPU slowed down four times.
