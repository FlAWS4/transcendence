# Version B — Explorer redesign « Halo » (build specification, final, 25 Oct 2026)

Repository `/home/le-rif/Bureau/Transcendence`, served from its root at `http://127.0.0.1:8765/`. `site/` is version A and
MUST NOT change. `site-b/` is version B (untracked). This document is binding for five builders working in parallel
without talking to each other (§8): **A1 data** (generator metadata, globe, logo prints, manifest), **A2 art** (shared
rendering module and tokens), **B campus sheet**, **C selector**, **D integration**. It implements the design the user
chose on 24 Oct 2026 (« Je choisis Halo ») with the lead's decisions H1–H8, the decisions taken on the review of the
draft (§0) and the user's decision of 24 Oct 2026 on the keyboard focus (option A, D3). `SPEC-B.md` (functional spec)
stays valid for everything not restated here. The engineering parts of `SPEC-B-VISUAL.md` (atlas, abandoned) are reused
where they still apply and are restated here, so builders do not need to read the atlas spec. The draft this version
replaces is kept as `SPEC-B-HALO.draft-before-review.md`.

Words: MUST / MUST NOT are requirements; SHOULD is a default a builder may change only with a written reason in its
report. « px » are CSS pixels; « units » are viewBox units of `site-b/explorer-shapes.mjs` (long side 100). FR/EN/AR are
the interface languages. « The mock-up » is `studies/explorer-b-design/halo/` (`halo.css`, `halo.js`, `index.html`); its
token and class names start with `hx-`. « The prototype » is the scratch renderer of this spec (Appendix C), which drew
halo with B's real band, shapes, flags and logos inside `site-b/content-preview.html` (nothing in the repository was
changed). All numbers in the UI use Latin digits.

**`$SCRATCH`** = `/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/165b3ea3-85e7-4024-8cab-ef3e4bfacf7a/scratchpad`
(the lead's scratchpad; every scratch path of this document starts with it).

Reference material (read-only, do not re-derive):
- Design: `$SCRATCH/design-panel/halo.md` (designer's spec and self-critique); mock-up code; reference screenshots in
  `$SCRATCH/design-shots/halo/` (file names `{viewport}-{theme}-{lang}-{state}.png`).
- Judges: `$SCRATCH/design-panel/judge1.json`, `judge2.json` (§10.2 maps every halo must-fix).
- Functional state: `$SCRATCH/SPEC-B.md`, `$SCRATCH/build-results.txt` (open issues), current `site-b/` code.
- Prototype evidence: `$SCRATCH/halo-spec/` and the review evidence in `$SCRATCH/halo-final/`, `$SCRATCH/review-eng/`,
  `$SCRATCH/critique-halo/` (Appendix C, which also lists the renders that are no longer valid evidence).

Lead decisions restated (binding, short form):
- **H1** halo faithfully (look, layout, motion, copy); no atlas or arcade graft; the only departures are the H2 fixes and
  what B's real pipeline or B's existing behaviour requires (listed in §1.4).
- **H2** fixes a–j (names hug their glyphs; pale flags keep a contour; logos without white disc and with a legible
  minimum size; phone peeks read as intentional; the Urals cut dissolves without wedge or rim; behaviour = current B plus
  the open fixes; contrast ≥ 4.5:1 measured and text ≥ 13 px / 14 px Arabic; forced colours; Arabic Paris fits
  1440×900 and nothing hides under the capsule at 667×375; no layout drift).
- **H3** halo's palette in tokens only (no new hue; a warmer light mode later must be a token change only).
- **H4** Monde = halo's small orthographic globe centred at 12°E 24°N, built by B's generator; the count stays
  « 58 campus · 30 pays ».
- **H5** all geometry metadata from B's generator; URALS, the drop boxes and the MAR rule unchanged; `--check` passes.
- **H6** logos precomputed at build time; no runtime canvas.
- **H7** the campus sheet replaces the level inside `#explorer`'s band; the strip of the other campuses is always visible
  outside the scroller; the h2 is focused without outline; FLIP of the logo; halo's empty states.
- **H8** the three mock-ups untouched; cache keys `b1 → b2` for changed modules; no commit; builders write no
  documentation file (the lead documents).

---------------------------------------------------------------------------------------------------------------

## 0. Decisions on review (24 Oct 2026)

Two reviews of the draft (halo fidelity and accessibility; engineering) found 2 blockers and 13 major problems. Each is
resolved below; one sub-proposal is rejected with its reason. Measurements made for these decisions are in Appendix C.

| # | Finding (review) | Decision | Where |
| --- | --- | --- | --- |
| D1 | Forced colours: only countries had an outline; the globe, the continents and the locator were Canvas on Canvas (blocker, H2h) | Every `svg.hx-art` of every kind and variant ends with an unmasked, unclipped `path.hx-outline`; the globe also gets `circle.hx-outline` for the sphere; in this mode the continents' outline follows the Urals cut (only the normal mode clears the rim there). Flags are hidden in this mode so the names stay legible without a box (D16). A2's tests assert the outline per kind and variant; §9.3 names Monde, Europe, Asia and the Lyon locator | §2.7, §4.3, §9.1, §9.3 |
| D2 | Strokes drawn through `<use>`: Chrome does not apply `vector-effect` to the clone, rims render 3–5 px (blocker) | Every stroked layer is a **direct** `<path d>` / `<circle>` with `vector-effect:non-scaling-stroke`; fills may stay `<use>`. A Chrome 156 probe also showed that a non-scaling stroke still follows the CSS scale of HTML ancestors (1.2 px → 0.6 px at `scale(.5)`), so every stroke width is `calc(<token> / var(--s, 1))` to keep halo's on-screen widths at every rank (names: `/ var(--nk)`). Widths are exact at rest; during a glide they follow the item's scale from its first frame, which costs no repaint (R27). The prototype's rim renders are no longer evidence | §2.1, §4.3–4.8, §9.1, §9.3, App. C |
| D3 | Keyboard focus redraws a block around the item (user's « pas dans des blocs ») | **Decided by the user on 24 Oct 2026: option A.** The focused cursor item shows a focus ring around its « Valider » chip only; no frame around the shape or the item (halo's large rounded ring is rejected because it re-draws a block). The same holds in forced colours: halo's Highlight frame around the cursor is dropped for the same reason, the chip (shown on the cursor only) marks it and carries the Highlight ring when focused. The focus styling lives in one marked CSS block of `explorer-selector.css` and three tokens (`--hx-focus`, `--hx-focus-ring-width`, `--hx-focus-ring-offset`), so a later change touches nothing else (R19) | §1.4, §2.1, §2.7, §4.13, §10.1 |
| D4 | Legibility of names over flags never measured; the « 17.2:1 » was ink against its own stroke colour | Measured on rendered pixels (glyph mask from a magenta fill-only render, glyph against the composited 1–2 px ring around it; corrected run with the theme and language forced on every page, Appendix C): the draft's `.085em` stroke failed on 46 of 158 name renders (33 shapes; 1440 and 1280; light, dark, Arabic; down to 1.32:1; in dark at every size, in light at 13–16 px); a stroke of **4 px on screen at every size** (2 px visible around each glyph) passed on all 158 (≥ 17.0:1) and is thinner than halo's `.28em` from 16 px up, so at every cursor size where the judges saw rectangles. The measurement rule, its worst cases and the « no rectangle » rule are defined | §2.1, §2.2, §4.8, §9.3 |
| D5 | The L1/L2 glow geometry was missing | Halo's values restated: quiet glow 1.5·itemW × 1.5·boxH, cursor glow 1.9·itemW × 1.75·boxH, both centred on the box, itemW un-narrowed; implemented without jumps (width factor in the transform); z-order and crossfade given; the cursor glow box joins the parity gate | §4.12, §9.3 |
| D6 | Arabic Paris fit unproven on B's real content (A's fallback-language note, Source links) | The cascade gains a step `tighter` (a smaller heart lantern and heart margins, and the photo stack one notch smaller: the start wing is at the limit too, 447 px in tight plus ≈ 4 px for the contacts' 24 px Source target, of 454 px); B's fit harness MUST run on B's real content before H2i is claimed; §3.6 and J2-8 say « to be proven by B's harness » | §3.6, §5.6, §10 |
| D7 | Neighbours' logo floors changed nothing at 1440, where the judges saw small logos | « Legible » defined: the mark is recognisable (≥ 28 / 22 px tall on screen) and the name printed below carries the city (16 / 13 px); the city words inside the 42 lockups (≈ 5 px at halo's sizes) are not text the user must read. Halo's 1440 proportions are kept on purpose; the floors act at 1280×720 and on very wide marks. J1-W3 is marked « partly »; raising the floors (for example 40 / 30 px) would change halo's proportions and is left to the user (§10.3) | §4.10, §10.2, §10.3 |
| D8 | Tablet widths (700–1279) cropped the ±2 items and cut their names | Rule: on desktops an item of rank ±1 or ±2 is shown only when its slot box stays inside the viewport and its name lies where the edge fade is ≥ 60 % opaque; otherwise it is « out » (R20). 768×1024, 1024×768, 1366×768 and 1280×1024 are measured and enter the matrix | §3.4, §4.19, §9.3, App. A |
| D9 | The 350 ms guard did not cover the campus entrance: the invisible website pill sat under the « Valider » chip | Pointer clicks inside the campus section are ignored while its entrance runs (`data-entering`, R26); a test and a browser flow cover « Valider, second click at 400 ms → nothing » | §4.21, §5.1, §5.8, §9 |
| D10 | Glides started with a jump (layout width per rank, margins and logo sizes per rank) | Items are anchored by their centre (`translate(calc(var(--x) - 50%), …)`); every per-rank difference that is not the item's scale (text gaps, glow width, logo floor) is applied as a transform of its own element, so nothing jumps on the first frame; a test and a browser check | §3.4, §4.2, §4.9, §4.10, §4.12 |
| D11 | Compact-row neighbours were 35 px tall (scaled 44 px) | The compact row uses no scale transform; sizes come from layout; every item is ≥ 44 px tall; widths are on-screen widths (R23) | §3.5, §4.20 |
| D12 | The fit cascade could raise a ResizeObserver loop error | B observes only C's scroller (whose size never depends on the sheet) and runs the cascade only when that size, the density, the layout or the locale changed. **Rejected**: reserving the copy-status line (+25 px in the end wing) would break the Arabic Paris fit (end wing 441 px + 25 > 454 px available); pressing Copy may instead make a fitted sheet scroll by a line, without resizing anything | §5.6 |
| D13 | B and D had no shared fake-DOM contract; the vm lacked `countryById` | One contract: required DOM APIs (D's fake implements them), optional ones (B feature-tests them), Elements only in `append`; D's vm gains `countryById` and a fake `explorerArt` | §7.3, §7.4, §9.1 |
| D14 | The logo print pipeline was not reproducible | The prototype's algorithm is restated as the normative one (numpy allowed, formulas, percentile method, rounding, no speck removal), the tool records Pillow, numpy, zlib and libjpeg-turbo versions and stops with a clear message when the decoder differs; worked values corrected | §6.3, §4.10 |
| D15 | Keeping the outgoing view still during a band move could not pass its own check | MUST: C records each level's box at every layout and freezes a leaving element at that box (absolute, physical px, stage padding box); the FLIP reads its source from the frozen geometry (R21) | §4.22, §5.8 |
| D16 | Forced colours: the Canvas box behind names was atlas's treatment | Dropped. In forced colours names are CanvasText without box, and flag images are hidden (outline + Canvas land), so no name sits on an unforced image (R9) | §2.7 |

Minor findings folded in: halo's light glow proportions restored without the white core and the dark quiet glow
smoothed (no plateau edge) (§2.1); scope departures recorded or dropped — Source links keep A's labels, the ±2 count
fades by opacity as in halo, the outgoing freeze is R21 (§1.4, §5.4, §4.9); the phone edge fade is capped by the cursor's
whole extent and the ring check looks at masks (§4.19, §9.3); scroll padding under the sheet and strip fades (§5.1);
wording on text scaling and on held Enter (§2.5, §9.1); the Arabic font is a system font here (§2.3, §10); 400 % zoom is
a recorded limit, not a matrix row (§3.1); the instant protocol flushes styles before re-enabling transitions and
cancels glides (§4.15); Source links of the contacts get 24 px targets (§5.2); the « no disc » check runs in both themes
with a radial profile (§9.3); the sheet's scroller clips glows and shadows at its block edges as halo's did, recorded
(§1.1); per-builder test commands and the real baseline (§8); emblem flags keep their current focus point (§6.2); the
shapes import gates the arrival and a late success is applied (§6.4); will-change counts defined on screen (§4.15);
halo's opacity transitions restored (§2.5); the drag step is B's rule with halo's pitch (R25); the FLIP scales the logo
by its own rect (§5.8); the foot height is the measured 78.5 px (§3.3); masks may use `#000` (§9.2); contracts made
explicit (figure CSS owner, logo sizing, name-only items, a world without sphere, `data-layout`, campus entry order,
public `setCursor`, missing `art`, resize) (§7); stage-scroll details (§3.1, §7.2); absolute scratch paths and generator
test exemptions (§6.2, §9.1); the stroke compensation of D2 is exact at rest and follows the item's scale during a
glide (R27, §4.15).

---------------------------------------------------------------------------------------------------------------

## 1. Scope and non-goals

### 1.1 What changes (B only)

1. **Levels 1–2** (Monde + 4 continents; countries): no cards. Each item is a **silhouette standing on a halo of light
   along a curved horizon** (the edge of the former globe): Monde is a small orthographic globe; continents are land in
   the turquoise-to-rose gradient of the 27 September welcome with their campuses as pink dots; countries carry **their
   flag clipped in their shape** with **their name written over it** and, on the cursor, their campus dots. The cursor
   stands in a pool of light with a « Valider » chip; neighbours step down along the horizon, smaller.
2. **Level 3** (campuses): each item is the **official campus logo standing directly on the page** (printed in the
   theme's ink; the colour logo of Codam on a small white plate) with **the campus name below**, in a soft glow.
3. **Campus sheet**: validating a campus unfolds halo's three-column sheet **in place of the carousel, inside
   `#explorer`'s band** (no panel, no overlay, no veil): photos as a stack of prints and contacts on one wing, the logo,
   name, country, facts and website at the heart, the address and the Piscines on the other wing, one honest
   « Pas encore renseignés ici : … » line; the logo glides from the carousel into the heart (FLIP). The strip « ← France ·
   42 Angoulême … 42 Perpignan » stays visible at the foot of the band, outside the scroller.
4. **Assets**: the generator exports halo's label anchors, the campus dots, the Urals cut runs, the flag placement and
   the globe (§6.1–6.2); a build-time logo « print » pipeline (§6.3); a shared rendering module `explorer-art.mjs` and
   the halo tokens `explorer-art.css` (§7.1).
5. **Open issues of the functional build fixed (H2f)**: Escape/Backspace repeat guard; `selector.setCursor(id)` used by
   `resetScope`; `#explorer`'s `aria-describedby="loading"` removed once the catalogue is ready (restored on error); the
   carousel group's `aria-describedby` points to the visible hint only; no straight clipping of glows or shadows inside
   the screen on the levels (the track bleeds 170 px and spans the viewport; the sheet's scroller clips the heart glow
   and the photo shadows at its own top and bottom edges, as halo's sheet did — recorded, §9.3).
6. Cache keys of every changed or new B module, stylesheet and JSON file move to `?v=b2` (§7.6).

### 1.2 What does not change

- **Behaviour (H2f)** is exactly current B: the single click validation path (`detail` rules, the 350 ms guard after a
  level change, the outgoing-level guard), keyboard scoping (Enter validates only on an item; Prev/Next, the scope bar
  and the dock behave normally), arrows/Home/End (swapped in RTL), drag/swipe and wheel, history/URL, list/via state,
  announcements, focus hand-over, the sibling switch keeping focus on the activated pill. `explorer-model.mjs`,
  `explorer-band.mjs`, `continents.mjs`, `entrance.*`, content pages, the scope bar and its popover, the dock, the dice,
  the frame (header, scope bar, status line, note, search capsule, dock) and every A stylesheet are unchanged.
- `campus-details.mjs` / `campus-details.css` stay byte-identical to A (no longer used by the Explorer; their 16 direct
  tests keep running). `campus-profiles.json`, `campuses.json`, the flag files and the logo source files are not
  modified (the manifest `campus-logos.json` gains one field per entry, §6.3).
- `site/`, `shared/`, `studies/` (in particular the three mock-ups), `docs/`, `figma/`, `archives/`, root documents:
  untouched. Documentation (PROJECT_CONTEXT, journal, READMEs, notes, the PROVENANCE files, including the record of the
  logo prints, §6.3) is the lead's, after the build. No commit, no push.

### 1.3 Non-goals (MUST NOT be built)

No atlas or arcade feature: no water-line rings, paper halo, lamp, calendar leaves, « En bref », labelled progression or
`trail`, route pager, phone controller « ‹ Valider › », locator under the L3 cursor, podium, beam, sticker die-cut, coast
line, focus outline that follows the silhouette. No colour or warmth change beyond halo's tokens and the H2 fixes (the
user deferred colour review to a later check of the whole site). No `feTurbulence`, grain or texture; no runtime canvas;
no import of study code or study data (`studies/**`); no CDN request; no new symbol in the pages' sprites (modules draw
their own small inline icons, §7.1); no second logo manifest; no change to copy other than the strings of §4.16–4.18
and §5.4; no change to content pages or to A's frame CSS.

### 1.4 Recorded adaptations (departures from the mock-up, each required by an H2 fix, by B's behaviour or by B's data)

| # | Adaptation | Reason |
| --- | --- | --- |
| R1 | Names hug their glyphs: a stroke of 4 px **on screen** at every size (2 px visible around each glyph, `paint-order: stroke fill`) + a 2 px halo-coloured shadow + halo's soft glows, instead of halo's `.28em` stroke (9 px at 32 px) (§4.8) | H2a (halo's stroke merged into rectangles at the cursor sizes) and H2g (measured: a thinner `.085em` stroke fails 4.5:1 on 46 of 158 name renders, Appendix C) |
| R2 | Campus dots drawn in a layer above the name (§4.7) | H2a (names hid dots) |
| R3 | Light flag rim is a subtle dark contour `rgb(24 61 60 / .3)` instead of white (§4.4) | H2b |
| R4 | L3 and heart glows: halo's teal/pink proportions without the white core in light; the dark quiet glow's flat core smoothed; neighbours' logos have minimum on-screen heights (§2.1, §4.10) | H2c |
| R5 | Phones: edge fades of up to 64 px capped by the cursor's extent; L3 neighbours peek with their glow only, never a logo fragment (§4.19, §4.10) | H2d |
| R6 | Cut edges follow the bent Urals runs; fill dissolves over ≈ 20 px; no rim within 18 px of the cut (§4.5) | H2e |
| R7 | Dark « Valider » and website pill on `color-mix(in srgb, #ED3491 75%, white)` = #F267AC (6.0:1) | H2g |
| R8 | 13 px floor (14 px Arabic) incl. kbd chips and « Prochaine »; 44 px photo pager buttons | H2g |
| R9 | Forced colours: CanvasText outline on every silhouette (sphere included, along the Urals cut too); flag images hidden; names in CanvasText without box; logos in CanvasText | H2h (D1, D16) |
| R10 | Sheet fit cascade full → snug → tight → tighter → scroll at ≥ 1100 px (§5.6) | H2i (Arabic Paris overflowed 47–55 px) |
| R11 | Layout recomputed on every `show()`, level change, resize, font load and language change; levels overlap in one grid cell | H2j |
| R12 | The glide animates size through transforms (the mock-up animated layout sizes) | performance; halo's motion spec says « translate and size » |
| R13 | The « ← {country} » pill is always present, even for a single-campus country (halo drew it only with ≥ 2 campuses) | B's behaviour (back control of the campus screen) |
| R14 | Each fact with a source gets « · Source » on its label line; A's website-language notes under the website pill; A's « En cours » chip for an ongoing Piscine | B's data and A's behaviour (§5.3) |
| R15 | Pager dots switch to dense or hidden when they do not fit B's band (narrower than the mock-up's stage by the page gutter) | B's frame |
| R16 | Item buttons are narrowed so no two buttons overlap; on phones neighbours' buttons are their art | hit testing |
| R17 | Strip in tiny bands (667×375, 640×360) sits at the top of the band, before the scroller | H7 + H2i (halo scrolled it away) |
| R18 | Arabic list separator « ، » in the missing line | Arabic punctuation |
| R19 | **Focus cue (decided by the user on 24 Oct 2026, option A, D3):** the focused cursor item draws a 2 px focus ring around its « Valider » chip only; no frame around the shape or the item, in forced colours too (halo's Highlight frame on the cursor is dropped) | the user's « je ne veux pas que les continents, les pays etc soient dans des blocs »; halo's ring around the whole item re-drew a block |
| R20 | On desktops a ±1 / ±2 item whose slot box would leave the viewport or whose name would enter the outer 60 % of the edge fade is « out » | H2d logic at tablet widths (cropped fragments with partial labels) |
| R21 | A leaving level or campus section is frozen at its last laid-out box while the band moves (status line hidden or shown) | H2j (the mock-up and current B let it jump) |
| R22 | Non-cursor « Valider » chips are taken out of the flow (absolute, invisible) instead of halo's invisible in-flow chip | hit testing (hidden chips never extend a neighbour's button) |
| R23 | The compact row uses no scale transform; every item is ≥ 44 px tall; there, art and name sizes switch at the start of a glide (60 ↔ 48 px art, 15 ↔ 13 px names) while the centres glide | H2g targets (halo's scaled neighbours were 35 px) |
| R24 | On phones the cursor's name wraps within the unfaded width and is shifted sideways (never resized) when its box would enter the edge fade | H2d (no partial label under a fade) |
| R25 | Drag step = B's rule (one step per pitch, rounded) with halo's pitch `x1` (the mock-up used `max(80, .6·x1)`) | B's behaviour |
| R26 | Pointer clicks inside the campus section are ignored until its entrance animation has ended (at least 350 ms, also under reduced motion) | hit testing (the website pill fades in under the « Valider » chip) |
| R27 | Stroke widths (rims, outlines, dot rings, name strokes) are compensated for the item's scale at rest; during a glide they follow that scale from the first frame instead of being animated (the mock-up animated layout sizes, so its strokes stayed exact) | performance (no repaint during a glide, §4.15) |

---------------------------------------------------------------------------------------------------------------

## 2. Visual system

### 2.1 Tokens (owner A2, file `site-b/explorer-art.css`, loaded before the selector and sheet stylesheets)

Halo's own tokens (mock-up `halo.css` lines 6–83), renamed nowhere: B keeps the `--hx-` names so that the mock-up and B
can be compared line by line. Values are halo's, written as references to A's charter tokens where one exists
(`shared/brand/tokens.css`, `welcome.css`, `readable-glass.css`); the only changed or added values are the H2 fixes,
marked « fix », and the width tokens that the stroke compensation (D2) and the focus cue (D3) need. Every colour used by
the selector, the sheet and the art module MUST come from this block (or from A's frame tokens `--control-glass-*` for
the Prev/Next glass circles and `--h42-color-focus` through `--hx-focus`). A later « warmer light mode » MUST be
achievable by editing this block only (H3); §9.2 greps for literals elsewhere.

```css
:root{
 --hx-ink:var(--h42-ink);                         /* #1B1B1B */
 --hx-muted:#536163;                              /* = A's light --h42-color-muted, 6.1:1 on #F7FAFA */
 --hx-accent:var(--readable-glass-accent);        /* #0C7677, 5.2:1 */
 --hx-pink:var(--h42-pink);                       /* Royal Pink #ED3491, decoration only */
 --hx-pink-text:#C92177;                          /* = A's light .item-sign colour; check icon of the current campus pill */
 --hx-chip-text:#A3155F;                          /* « Prochaine » text, 6.1:1 on its chip */
 --hx-teal:var(--h42-teal);                       /* 42 Blue #00BABC */
 --hx-focus:var(--h42-color-focus);               /* #008E90 */
 --hx-land-a:#3FC2BE;--hx-land-b:#A9E2DB;--hx-land-c:#F4D3E3;   /* 27 Sept welcome land */
 --hx-sea-a:#FFFFFF;--hx-sea-b:#DCF0EF;
 --hx-rim:rgb(255 255 255 / .9);                  /* light rim of land shapes */
 --hx-flag-rim:rgb(24 61 60 / .3);--hx-flag-rim-width:1.2px;    /* fix H2b: was white .75 */
 --hx-sheen-hi:rgb(255 255 255 / .55);--hx-sheen-lo:rgb(0 0 0 / .18);
 --hx-text-halo:#FFFFFF;--hx-text-glow:rgb(255 255 255 / .85);
 --hx-glow-quiet:rgb(0 186 188 / .10);--hx-glow-hover:rgb(0 186 188 / .2);
 --hx-cursor-glow:radial-gradient(closest-side,rgb(255 255 255 / .96) 0 20%,rgb(0 186 188 / .19) 50%,rgb(237 52 145 / .075) 76%,transparent 100%);
 --hx-logo-glow:radial-gradient(closest-side,rgb(0 186 188 / .21) 0%,rgb(0 186 188 / .19) 50%,rgb(237 52 145 / .075) 76%,transparent 100%);   /* fix H2c: halo's cursor glow, its white 0–20 % core replaced by a gentle teal continuation */
 --hx-logo-glow-quiet:radial-gradient(closest-side,rgb(0 186 188 / .12) 0%,rgb(0 186 188 / .10) 62%,transparent 100%);                          /* fix H2c: halo's quiet lantern glow without its white 0–30 % core */
 --hx-pool:radial-gradient(closest-side,rgb(255 255 255 / .95),color-mix(in srgb,var(--hx-teal) 28%,transparent) 46%,color-mix(in srgb,var(--hx-teal) 8%,transparent) 78%,transparent 100%);
 --hx-logo-ink:#1B1B1B;
 --hx-dot:#ED3491;--hx-dot-ring:#FFFFFF;
 --hx-go-bg:var(--h42-teal);--hx-go-ink:#1B1B1B;  /* = --h42-access-accent light, ink 7.2:1 */
 --hx-go-shadow:0 8px 20px color-mix(in srgb,var(--hx-go-bg) 30%,transparent);
 --hx-hair:rgb(24 61 60 / .12);--hx-hair-strong:rgb(24 61 60 / .22);
 --hx-frame:#FFFFFF;--hx-photo-shadow:0 22px 44px rgb(24 61 60 / .16),0 3px 10px rgb(24 61 60 / .08);
 --hx-pill-surface:rgb(255 255 255 / .78);--hx-pill-solid:#FFFFFF;--hx-pill-edge:rgb(24 61 60 / .12);
 --hx-shape-shadow:drop-shadow(0 10px 18px rgb(24 61 60 / .14));
 --hx-sib-current:radial-gradient(closest-side,color-mix(in srgb,var(--hx-teal) 16%,transparent),transparent);
 --hx-sticker-bg:#FFFFFF;--hx-sticker-shadow:0 6px 18px rgb(0 0 0 / .12);
 --hx-expand-bg:rgb(255 255 255 / .82);--hx-expand-ink:#1B1B1B;
 /* widths, on screen (D2, D3, D4); not colours */
 --hx-rim-width:1.2px;--hx-sea-rim-width:1.2px;--hx-dot-ring-width:1.3px;--hx-outline-width:1.5px;
 --hx-name-stroke:4px;--hx-name-core:2px;          /* fix H2a/H2g: was .28em stroke and .5em/1.1em glows */
 --hx-focus-ring-width:2px;--hx-focus-ring-offset:3px;   /* focus cue, user decision A (§4.13) */
}
:root[data-theme=dark]{
 --hx-ink:var(--h42-white);
 --hx-muted:#A9C0C0;                              /* cadet 80 % + white, 9.0:1 on #1B1B1B */
 --hx-accent:var(--readable-glass-accent);        /* #F485BD, 7.3:1 */
 --hx-pink-text:#F485BD;--hx-chip-text:#F7A3CC;
 --hx-focus:var(--h42-color-focus);               /* #96A3EB */
 --hx-land-a:#2C8C88;--hx-land-b:#255F5E;--hx-land-c:#6A2C51;
 --hx-sea-a:#34333B;--hx-sea-b:#222127;
 --hx-rim:rgb(255 255 255 / .28);
 --hx-flag-rim:rgb(255 255 255 / .35);--hx-flag-rim-width:1.4px;
 --hx-text-halo:#1B1B1B;--hx-text-glow:rgb(27 27 27 / .8);
 --hx-glow-quiet:rgb(237 52 145 / .10);--hx-glow-hover:rgb(0 186 188 / .13);
 --hx-cursor-glow:radial-gradient(closest-side,rgb(237 52 145 / .2) 0%,rgb(237 52 145 / .1) 42%,rgb(0 186 188 / .055) 70%,transparent 100%);
 --hx-logo-glow:var(--hx-cursor-glow);            /* dark L3 was judged warm and right: unchanged */
 --hx-logo-glow-quiet:radial-gradient(closest-side,rgb(237 52 145 / .16) 0%,rgb(237 52 145 / .10) 62%,transparent 100%);   /* fix H2c: halo's flat 0–30 % core smoothed */
 --hx-pool:radial-gradient(closest-side,color-mix(in srgb,var(--hx-pink) 34%,transparent),color-mix(in srgb,var(--hx-teal) 14%,transparent) 62%,transparent 100%);
 --hx-logo-ink:#F4F7F7;
 --hx-dot:#F485BD;--hx-dot-ring:#1B1B1B;
 --hx-go-bg:color-mix(in srgb,var(--h42-pink) 75%,var(--h42-white));   /* fix H2g: #F267AC, ink 6.0:1 (was #ED3491, 4.51:1) */
 --hx-hair:rgb(255 255 255 / .12);--hx-hair-strong:rgb(255 255 255 / .24);
 --hx-frame:#2E2E34;--hx-photo-shadow:0 22px 48px rgb(0 0 0 / .45),0 3px 10px rgb(0 0 0 / .3);
 --hx-pill-surface:rgb(41 41 46 / .78);--hx-pill-solid:#29292E;--hx-pill-edge:rgb(255 255 255 / .16);
 --hx-shape-shadow:drop-shadow(0 10px 22px rgb(0 0 0 / .45));
 --hx-sib-current:radial-gradient(closest-side,color-mix(in srgb,var(--hx-pink) 22%,transparent),transparent);
}
```

- The light cursor glow keeps its white core on L1/L2 (halo's pool of light around a silhouette, not a disc behind a
  logo). In L3 and in the sheet heart the logo glows use `--hx-logo-glow*`: halo's teal and pink stops from 50 %
  outward are kept, only the white core goes (H2c), and every glow's alpha decreases from its centre outward with no
  flat part (no plateau edge, §9.3).
- A's `--h42-access-accent` is not changed (A's other buttons keep it); only `--hx-go-bg` (Valider chip, website pill)
  differs in dark.
- Literals allowed outside this block: `#000` / `#fff` as the stops of masks (SVG `<mask>` content, and CSS
  `mask-image` gradients such as the edge and scroll fades), `transparent`, `currentColor`, and system colours inside
  `@media (forced-colors: active)`.

### 2.2 Measured contrast (WCAG 2.x, final blended background)

Computed with sRGB compositing (`$SCRATCH/halo-spec/proto/contrast.py`) and measured on rendered glyph pixels: texts
over glows with `proto/glyph_contrast.py` (a screenshot with and one without the text; the 10th-percentile glyph pixel
against the median background; `out/glyph/glyph.json`), names over shapes with
`$SCRATCH/halo-final/probe/names_measure3.py` (glyph mask from a magenta fill-only render; the 10th / 90th-percentile
glyph pixel against the median of the composited pixels 1–2 px outside the glyphs; corrected run
`$SCRATCH/halo-final/out/names-rerun/names-measure3.json`, theme and language checked on every page).

| Text (token) | Worst background | Computed | Rendered | Target |
| --- | --- | --- | --- | --- |
| ink #1B1B1B | pool band (teal .28 over half white) | 13.05 | L3 cursor name 13.98 | ≥ 4.5 |
| muted #536163 (count under the cursor) | teal ≈ .30 (pool edge + horizon glow + cursor halo) | 4.71 | 4.70 (Monde 1440), 4.76 (France 390), 5.52 (±1) | ≥ 4.5 |
| muted #536163 (hint, pager count) | page | 6.14 | 6.04–6.18 | ≥ 4.5 |
| accent #0C7677 (section titles, links) | page only (never over a glow) | 5.17 | — | ≥ 4.5 |
| « Valider » / website pill, light: ink on #00BABC | opaque | 7.18 | — | ≥ 4.5 |
| « Valider » / website pill, dark: ink on #F267AC | opaque | 6.00 (was 4.51 on #ED3491) | — | ≥ 4.5 with margin (H2g) |
| « Prochaine » #A3155F on pink 11 % / dark #F7A3CC on pink 11 % over #1B1B1B | opaque | 6.10 / 8.19 | — | ≥ 4.5 |
| names over shapes, stroke 4 px on screen (§4.8) | any flag or land, 13–32 px: light and dark FR at 1440 and 1280, light AR at 1440 | — | min 17.0 on 158 renders (33 shapes) | ≥ 4.5 |
| names over shapes, the draft's `.085em` stroke (rejected) | same | — | 46 of 158 below 4.5, min 1.32 (dark, « France » at 13 px over the white band of its flag) | — |
| names over shapes, halo's `.28em` stroke (rejected: rectangles) | same | — | min 13.6 | — |
| dark: white / muted #A9C0C0 / accent #F485BD | pool core (pink .34) | 11.34 / 5.93 / 4.83 | muted under cursor 7.26–7.98 | ≥ 4.5 |
| focus ring #008E90 around the chip (graphic) | page; outer quarter of the cursor glow | 3.79 on the page; ≥ 3.2 at the glow's mid stop | — (§9.3) | ≥ 3 |
| focus ring #96A3EB (dark, graphic) | dark cursor glow | 5.80 at the core | — (§9.3) | ≥ 3 |

The accent colour MUST NOT be used over a glow (in light it falls to 3.9–4.4:1 there); §9.3 re-measures every text of
`#explorer` on rendered pixels with the rules above.

### 2.3 Type

- Jost 400/500 (`shared/assets/jost.css`); under `:lang(ar)` the family is `'Noto Sans Arabic', Jost, sans-serif`
  (system font), no `letter-spacing`, no `text-transform`. Latin digits everywhere (`Intl.NumberFormat(locale,
  {numberingSystem:'latn'})`; dates with `ar-u-nu-latn` in Arabic). « Noto Sans Arabic » is present on this machine only
  through fontconfig (it covers Arabic letters and digits, no Latin letters): every Arabic metric of this document
  (§3.3, §3.6) is this machine's; B's fit harness also runs with the fallback stack (§5.6).
- **Floor (H2g)**: no rendered text below 13 px, below 14 px under `:lang(ar)`, including kbd chips, « Prochaine »,
  counts, hints, credits and items scaled by transforms (effective size = computed font size × the scales of its own
  and its ancestors' transforms).

| Role | Size / weight / line height | Arabic |
| --- | --- | --- |
| prompt (level head) | 16 / 500 / 1.45 (15 below 700 px wide) | 16 / 1.6 |
| name over a shape, cursor | `F = clamp(22, .13·bh, 32)` / 500 / 1.12, `letter-spacing:-.01em`, `max-inline-size:9.5em` (phones: also the unfaded width, §4.8), `text-wrap:balance` | line 1.4 |
| name over a shape, ±1 / ±2 | 16 / 13 (effective) | 16 / 14 |
| campus name under its logo, cursor / ±1 / ±2 | `clamp(18, .11·bh, 22)` / 16 / 13, 500, 1.12, max 12em | ±2 14, line 1.4 |
| count under a shape (meta), cursor / ±1 / ±2 | 14 / 13 / faded out (opacity 0, halo), muted, 1.45, nowrap | 14 / 14 |
| « Valider » chip | 14 / 500, 36 px pill | 14 |
| pager count « 6 / 14 » | 13, tabular, LTR isolated | 14 |
| hint and its kbd chips | 13 / 1.45; kbd 13 / 1.5 (fix: was 12 / 1.6), so the hint line is 22.5 px (AR 24) | 14 |
| compact row names, cursor / others | 15 / 13 | 15 / 14 |
| sheet h2 | 35 / 500 / 1.15, `-.025em` (28 when short or < 700 px; 24 on a short band < 700 px) | same sizes, line 1.4 |
| sheet country line / facts value / facts label | 16 / 28-500-1.1 tabular / 13 (sizes by layout in §5.6) | 16 / 28 / 14 |
| website pill | 15 / 500, 44 px | 15 |
| section titles (h3) | 13 / 500 / 1.4, uppercase, `.06em` | 14, no caps |
| address / pills / contact label / contact link | 16-1.55 / 14 / 13 / 15 | 16 / 14 / 14 / 15 |
| Piscine name / dates / « Prochaine » / note | 16-500 / 14 / 13-500 (fix: was 12) / 13-1.5 | 16 / 14 / 14 / 14 |
| missing line / locator caption / credit / photo count / verified / website notes | 14 / 14 / 13 / 13 / 13 / 13 | 14 everywhere |
| strip pills | 14 | 14 |

### 2.4 Spacing, radii, elevation

Halo's values (listed with each element in §4–5). Radii: 999 (pills, the « Valider » chip and its focus ring), 20 / 15
(photo frame / image), 10 (sticker plate), 6 (kbd), 3 (mini flag), 50 % (dots, glows, lantern). Elevation:
`--hx-shape-shadow` (cursor silhouette only), `--hx-photo-shadow` (prints), `--hx-go-shadow` (Valider chip, website
pill), `--hx-sticker-shadow`, A's `--control-glass-shadow` (Prev/Next, photo pager). No other shadow. The item buttons
have no radius, background, border or shadow in any state (no block, H1 and D3).

### 2.5 Motion (`--ease: cubic-bezier(.22,1,.36,1)` unless noted)

| Motion | Spec (halo) | B implementation |
| --- | --- | --- |
| Cursor move | 500 ms translate and size, 450 ms font size, 350 ms halo crossfade; items' opacity .35 s, counts' opacity .3 s, chip opacity .25 s + transform .35 s | item `transform` (translate of its centre + scale about its foot, §4.2) 500 ms and `opacity` .35 s (items entering or leaving « out »); the per-rank sub-transforms of §4.2 (names, counts, L3 names, glow width, L3 logo floor) 500 ms, so sizes animate as transforms (R12); quiet and cursor glows crossfade by opacity .35 s; counts' opacity .3 s (±2 and phone neighbours fade out, halo); names: no opacity transition (halo); chip: opacity .25 s + transform .35 s from `translateY(6px) scale(.96)`, fading out in place when its item leaves the cursor (R22); dots opacity .35 s; L3 lantern glows opacity .35 s; phone L3 neighbours' logos opacity .35 s (R5); pager dots width .4 s and background .3 s (halo). Compact row: transform only (R23) |
| First layout, resize, font load, language change, band change | — | instant (§4.15) |
| Level change, descend / ascend | old level fades up in 260 ms; new rises 22 px in 420 ms after 80 ms | old (frozen at its last box, R21): opacity 1→0 + `translateY(-18px) scale(1.03)` (ascend: `translateY(18px) scale(.97)`), 260 ms, removed at the end; new: opacity 0→1 + `translateY(22px→0)` (ascend `-22px`), 420 ms, delay 80 ms, `fill:'backwards'` |
| Into the sheet from a visible L3 cursor lantern | FLIP 560 ms; heart texts 380 ms, 40 ms apart from 200 ms; wings slide 28 px out from the heart 460 ms from 260 ms; strip rises 360 ms from 340 ms | old level (frozen) opacity 1→0 220 ms **linear**; FLIP of the heart lantern 560 ms, scaled by the logo's own rect (§5.8); heart items `opacity 0→1, translateY(10px→0)` 380 ms, delay `200 + 40·i`; start wing `translateX(28·r px → 0)` and end wing `translateX(-28·r px → 0)` (r = 1 LTR, −1 RTL) with opacity, 460 ms, delay 260; strip `translateY(12px→0)` + opacity 360 ms, delay 340; all `fill:'backwards'` |
| Into the sheet otherwise (dice, deep link, popover, search, Back/Forward, missing logo, compact row) | — | generic descend |
| Sibling switch, language change | — | none |
| Photo turn | prints move 500 ms, fade 400 ms | same |
| Hover on a neighbour | glow strengthens | the quiet glow's background becomes the `--hx-glow-hover` gradient, at once (as in halo: a gradient does not transition) |
| Locator ping | 2.4 s infinite, scale .6→2.2, opacity .7→0 | same, `transform-box:fill-box; transform-origin:center` |

Text is scaled only by the cursor move (counter-scaled names and counts, as halo's font-size transition) and by the
outgoing level's exit (`scale(1.03)` / `scale(.97)`, halo); the FLIP scales the heart lantern only (logo and glow, no
text). Any new `show()` finishes or cancels running animations at once.

### 2.6 Reduced motion

Under `prefers-reduced-motion: reduce` (the `motion` MediaQueryList passed to the selector): no `element.animate()` call;
`transition:none` on items and their sub-elements (names, counts, glows, lantern glows, logos, chip, dots), dotsbar,
photos and strip; no ping; the outgoing level is removed at once; every layout is instant. Turning reduced motion on
cancels running animations (existing behaviour). The campus entrance guard (R26) still lasts 350 ms.

### 2.7 Forced colours (`@media (forced-colors: active)`, H2h)

`.hx-*` rules are A2's (`explorer-art.css`), `.explorer-*` rules C's or B's (their stylesheets).

- **Silhouettes (D1)**: every `svg.hx-art` of every kind and variant (world, continent, country; item, compact-row mini
  art, sheet locator) ends with an unmasked, unclipped `path.hx-outline` on the shape's `d`; the world also ends with
  `circle.hx-outline` on its sphere. A2: `svg.hx-art{forced-color-adjust:none}`; inside it
  `.hx-sheen,.hx-rim,.hx-flag-rim,.hx-sea-rim,.hx-sphere-sheen,.hx-flag{display:none}`, `.hx-land,.hx-sea{fill:Canvas}`,
  `.hx-outline{display:inline;fill:none;stroke:CanvasText;stroke-width:calc(var(--hx-outline-width) / var(--s, 1));
  stroke-linejoin:round;vector-effect:non-scaling-stroke}`. The outline lies outside every mask and clip, so on Europe
  and Asia it also draws the Urals cut (only the normal mode clears the rim there, §4.5). Flag images are hidden (they
  are not forced): countries are Canvas land inside a CanvasText outline, so no name ever sits on an unforced image.
- **Dots**: `svg.hx-dots{forced-color-adjust:none}`, `.hx-dot{fill:CanvasText;stroke:Canvas}`; the locator's dot and
  ring in `Highlight`.
- **Names over shapes (D16)**: `-webkit-text-stroke:0; text-shadow:none; color:CanvasText`; no background, no padding,
  no box (they sit on Canvas land).
- Glows, pool, horizon, lantern glows (L3 and heart): `display:none`.
- **Focus (D3, option A)**: no outline on any item; the focused cursor item's chip carries the ring of §4.13 with
  `outline-color:Highlight`. The cursor is marked by its chip (the only one shown) and by its size and centre.
- Valider chip, kbd, « Prochaine », website pill, Copy and Directions pills, Prev/Next, photo pager, strip pills, back
  pill: `border:1px solid ButtonText`; current strip pill `border:2px solid Highlight`; disabled Prev/Next
  `color:GrayText;border-color:GrayText`.
- Mask logos: `forced-color-adjust:none; background-color:CanvasText`; sticker: `border:1px solid CanvasText` (Codam
  keeps its colours: images are not forced).
- Steps: current `background:Highlight`, done `CanvasText`, todo `GrayText`; dotsbar current `Highlight`, others
  `GrayText`.
- The sheet's mini flag (country line) and the photos stay (images beside or outside text).

### 2.8 RTL

The carousel is mirrored (next item on the left; arrow keys and drag direction swapped — existing B rules); Prev/Next
chevrons, the back arrow, the enter icon, the external icon and the photo pager chevrons are mirrored (`scaleX(-1)`);
**silhouettes, flags, dots and logos are never mirrored**; the sheet's wings swap sides through the grid (logical
areas); the second print of the photo stack tilts the other way (halo); the Latin address keeps `dir="auto"` and is
right-aligned; numbers are LTR-isolated (« 5 000+ » stays « 5 000+ »); campus names sit in `<bdi>`; in the Arabic hint
the kbd elements holding « Enter » / « Esc » get `lang="en"`, every kbd has `unicode-bidi:isolate`; scroll paddings and
fades use logical sides (§5.1); C computes every horizontal position in physical px (centres `W/2 + dx` with the sign of
§3.4, the phone name shift of §4.8), so no CSS mirrors a transform.

---------------------------------------------------------------------------------------------------------------

## 3. Layout per band and viewport

### 3.1 The band and the stage

`#explorer` is the fixed full-viewport layer (z 7) with `padding-block: var(--explorer-top) var(--explorer-bottom)` and
`padding-inline: var(--horizon-page-gutter)`, set by the unchanged `explorer-band.mjs`. Its content box is « the band »:
top = bottom of `#globe-status` (or of `#scope-bar` when the status is hidden, at campus level) + 16 px (8 px in B's
compact band), bottom = top of the first visible of `#about`, the search capsule, the dice − 16 px. Measured on current B
(Appendix A; tablets in `$SCRATCH/halo-final/out/bands-tablet.json`):

| Viewport | Band width (+ gutter) | Level band FR (AR) | Campus band FR (AR) |
| --- | --- | --- | --- |
| 1440×900 | 1344 (+2×48) | 518.7 (506.7) | 549 (534) |
| 1366×768 | 1270 (+2×48) | 386.7 | 417 |
| 1280×1024 | 1184 (+2×48) | 642.7 | 673 |
| 1280×720 | 1184 (+2×48) | 338.7 | 369 |
| 1024×768 | 960 (+2×32) | 386.7 (374.7) | 417 (403) |
| 768×1024 (touch) | 704 (+2×32) | 642.7 (630.7) | 673 (661) |
| 390×844 | 342 (+2×24) | 481.2 (469.2) | 510 (499) |
| 320×640 | 280 (+2×20) | 283.2 | 312 |
| 853×480 (1280×720 at 150 %) | 789 (+2×32) | 175.7 | 210 |
| 667×375 | 619 (+2×24) | 76.2 | 109 |
| 640×360 (1280×720 at 200 %) | 592 (+2×24) | 61.2 | 94 |

- **Full bleed (as the mock-up's stage)**: a level's `.explorer-carousel` and the whole `section.explorer-campus` take
  `margin-inline: calc(-1 * var(--horizon-page-gutter))`, so the carousel width `W` is the viewport width and the sheet
  uses halo's own paddings; the level head and foot stay inside the band.
- C reads the band from the stage content box (`root.clientWidth/clientHeight` minus the computed paddings,
  `view.getComputedStyle`; without it — tests — the client size), synchronously in `show()` and again from its
  ResizeObserver on `root`, which observes the **content box** (so a change of `--explorer-top/-bottom` re-lays the
  view out). **C's code and CSS never read `data-band`** (the old `[data-band]` rules are deleted).
- Stage overflow: `:root #explorer{overflow:clip}` (bleeds, glows and shadows may extend into the padding without a
  scrollbar). C sets `data-stage-scroll="true"` on `root` only when a level's band is lower than the compact row's
  minimum (44 px): `:root #explorer[data-stage-scroll=true]{overflow:hidden auto;overscroll-behavior:contain;
  scroll-padding-block:var(--explorer-top) var(--explorer-bottom)}` and, in that mode only,
  `.explorer-level{min-block-size:60px}` and `.explorer-carousel{overflow:clip}` (the 170 px bleed adds no empty scroll
  range); the campus screen never sets it. C's `focusNode` scrolls a focused control into view when
  `root.dataset.stageScroll === 'true'` (the old `scrollHeight > clientHeight` test is always true under
  `overflow:clip`).
- **Known limit (recorded, not a matrix row)**: at 400 % zoom (320×256 = 1280×1024 at 400 %) `--explorer-top +
  --explorer-bottom` (≈ 357 px) exceed the viewport, so the stage scrolls and parts of the row pass under the fixed scope
  bar and dock while scrolling. §9.3 only smoke-tests that state (no error, the cursor reachable and validated by
  keyboard).

### 3.2 Densities

Computed by C from the band height `Hb` and the carousel width `W` (= viewport width):

- Levels: `compact` when `Hb < 250`, `short` when `Hb < 420`, else `normal` (halo's thresholds). `phone = W < 700`.
- Campus screen: `tiny` when the campus band `< 200`, `short` when `< 480`, else `normal`.

| Viewport | Levels | Campus screen |
| --- | --- | --- |
| 1440×900 FR / AR | normal | normal |
| 1366×768 | short | short |
| 1280×1024 | normal | normal |
| 1280×720 | short | short |
| 1024×768 FR / AR | short | short |
| 768×1024 FR / AR | normal (not phone) | normal |
| 390×844 FR / AR | normal (phone) | normal |
| 320×640 | short (phone) | short |
| 853×480 | compact | short |
| 667×375, 640×360 | compact (phone) | tiny |

### 3.3 Level grid

`div.explorer-level` fills the band (`grid-area:1/1` of the stage grid, so an outgoing level overlaps the incoming one and
never changes its size: H2j) and is itself a grid `grid-template-rows: auto minmax(0,1fr) auto` with explicit rows
(head row 1, carousel row 2, foot row 3):

```
div.explorer-level[data-level][data-density=normal|short|compact][data-phone?][data-instant?][data-dragging?]
  div.explorer-head                                   §4.16 (position:relative; z-index:2)
  div.explorer-carousel[role=group][aria-roledescription][aria-labelledby={prompt id}][aria-describedby={visible hint span id}]
        position:relative; min-block-size:0; touch-action:pan-y pinch-zoom; user-select:none; full bleed (§3.1)
    div.explorer-track                                §4.19: horizon, pool, items layer, items
  div.explorer-foot                                   §4.17–4.18 (position:relative; z-index:2; padding 4px 0 2px)
```

`aria-roledescription` copy (existing): « carrousel » / « carousel » / « عرض دوّار ». Ids are unique per level instance.

| Density | Head | Carousel height `H` | Foot |
| --- | --- | --- | --- |
| normal | 6 px top padding + prompt line 23.2 (AR 25.6) = 29.2 (31.6) | band − head − foot | 4 + pager 44 + gap 6 + hint line + 2, the hint line being 22.5 (keys hint FR/EN: kbd 13 px × 1.5 + 1 + 2 px borders), 24 (keys AR), 18.9 (touch FR/EN), 22.4 (touch AR): **78.5** (keys FR, measured on the prototype at 1440), 80 (keys AR), 74.9 (touch FR), 78.4 (touch AR) |
| short | same | band − head − foot | 4 + 44 + 2 = 50 (hint visually hidden, still the description) |
| compact | visually hidden (still labels the group) | the whole band | pager overlaid on the row: Prev at the inline start, Next at the inline end, dots and count hidden, hint visually hidden |

The hint may wrap on narrow non-touch windows: C never assumes these numbers; it measures `H` from the carousel after
insertion (the table gives expected values ±2 px; pure tests take `H` as input).

### 3.4 Carousel geometry (halo's formulas, exact; C's pure function `haloGeometry`, §7.2)

Inputs: `W`, `H` (carousel box), `phone`, `campus` (L3), `density`. Constants: `BLEED = 170` (the track reaches 170 px
above and below the carousel so glows are never cut).

```
below = campus ? 12 + 26 + 12 + 36 : 10 + 20 + 12 + 36            // name or count, then the chip
bh    = clamp(H − below − 30, 84, campus ? 200 : 250)               // cursor box height
bw    = campus ? bh : clamp(min(W·(phone ? .64 : .25), bh·1.42), 110, 340)
s1    = phone ? .56 : .58 ;  s2 = .42                               // neighbour scales
x1    = phone ? W/2 + bw·s1/2 − 46 : max(bw·.5 + bw·s1·.5 + 60, min(W·.23, 360))
x2    = phone ? x1 + 400 : x1 + bw·(s1 + s2)/2 + 64                 // ±2 exist on desktop only
top   = max(8, (H − bh − below)/2 − 2)
floor0= top + bh ;  d1 = bh·(phone ? .09 : .12) ;  R = (x1² + d1²)/(2·d1)
floor(x) = floor0 + R − sqrt(max(0, R² − x²))                       // the horizon: a circle through the cursor's feet
fade  = phone ? min(64, (W − (cursorButton + 16))/2 − 4) : .06·W     // edge fade width (§4.19)
```

- Item at signed offset `o` from the cursor (`a = |o|`): slot 0 (cursor), 1 (±1), 2 (±2); items with `a > 2` (`a > 1` in
  compact) are « out »: scale `s2·.8`, distance `x2 + (a − 2)·150`, `opacity:0`, `pointer-events:none`. On phones the
  ±2 items keep halo's slot `x1 + 400`, off screen (opacity 1, never on screen at rest).
- **Edge rule (R20, desktops)**: an item of rank ±1 or ±2 is shown only when its slot box (the art box, `base·s` wide,
  centred at its distance) stays inside the viewport (`dist + base·s/2 ≤ W/2`) and its name lies where the edge fade is
  at least 60 % opaque (`dist + nameW·nk/2 ≤ W/2 − .6·fade`, with `nameW` the name's measured layout width at the
  cursor font size and `nk` its rank's name scale, §4.2); otherwise it is « out » at its own slot distance. On the
  measured viewports this hides the ±2 items at 768×1024 always, at 1024×768 those whose ±2 name is wider than 41 px,
  at 1280×1024 those wider than 114 px; it never hides a ±1 item (table below).
- Box of an item at scale `s`: height `bh·s`; width base `campus ? bh·s : bw·s`; the figure keeps its viewBox ratio `r`
  inside: `fh = bh·s, fw = fh·r` when `base/(bh·s) > r`, else `fw = base, fh = base/r`; it is bottom-aligned in the box.
  L3 figures are squares `bh·s` (the lantern). Since `base/(bh·s)` does not depend on `s`, every figure is its
  cursor-scale figure times `s`.
- Horizontal position: distance `dist = slot x` (or the « out » distance), signed `dx = dist·sign(o)·(rtl ? −1 : 1)`;
  the item's **centre** is at `W/2 + dx`. Vertical: **the bottom of every item's box sits on the horizon**: foot at
  `BLEED + floor(dist)` in track coordinates.
- Name size (cursor): `F = campus ? clamp(.11·bh, 18, 22) : clamp(.13·bh, 22, 32)`; ±1 16; ±2 13 (AR 14).
- Item button width on screen: halo's `itemW` — cursor `max(base, 220)`, neighbours `max(base, 120)` — **narrowed so no
  two buttons overlap (R16)**: C computes the widths from the cursor outwards; a button is never narrower than its art
  (`fw` on screen) and never closer than 8 px to the previous one (`w_i ≤ 2·(x_i − x_{i−1} − w_{i−1}/2 − 8)`, at least
  `fw`); on phones a neighbour's button is its art (`fw`) and the cursor's is `min(max(base, 220), 2·(x1 − fw1/2) − 8)`.
  Halo's own spacing (art half-widths + 60 / 64 px) guarantees that the arts never overlap; the narrowing only trims the
  empty margins of wide-minimum buttons (e.g. L3 at 1280×720: ±1/±2 buttons 120 px, 15.8 px apart; small desktop
  windows with `bh = 84`). The glows keep halo's un-narrowed `itemW` (§4.12).
- These are on-screen boxes. §4.2 implements them with one transform per item (centre translate + scale about the
  foot): everything inside an item is laid out at the cursor scale and does not depend on its rank, except the button's
  layout width `--w0 = (on-screen button width)/s`, which changes at the first frame of a glide without moving anything
  (the item is anchored by its centre, D10).
- Expected values on B's bands (`$SCRATCH/halo-final/calc/geometry-final.mjs`, measured foot of §3.3; C's tests assert
  them ±1 px with `H` given). « ±2 shown »: the edge rule above, with the widest ±2 name it allows.

L1/L2:

| Viewport | density | H | bh | bw | x1 | x2 | d1 | R | floor0 | drop ±1 / ±2 | F | cursor button | fade | ±2 shown |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1440×900 FR | normal | 411 | 250 | 340 | 331.2 | 565.2 | 30 | 1843.2 | 289.5 | 30 / 88.8 | 32 | 340 | 86.4 | yes (names ≤ 205 px) |
| 1440×900 AR | normal | 395.1 | 250 | 340 | 331.2 | 565.2 | 30 | 1843.2 | 281.5 | 30 / 88.8 | 32 | 340 | 86.4 | yes (names ≤ 205 px) |
| 1366×768 | short | 307.5 | 199.5 | 283.3 | 314.2 | 519.8 | 23.9 | 2073.6 | 212.5 | 23.9 / 66.2 | 25.9 | 283.3 | 82 | yes (names ≤ 227 px) |
| 1280×1024 | normal | 535 | 250 | 320 | 312.8 | 536.8 | 30 | 1645.7 | 351.5 | 30 / 90 | 32 | 320 | 76.8 | yes (names ≤ 114 px) |
| 1280×720 | short | 259.5 | 151.5 | 215.1 | 294.4 | 466 | 18.2 | 2392.8 | 164.5 | 18.2 / 45.8 | 22 | 220 | 76.8 | yes (names ≤ 255 px) |
| 1024×768 FR | short | 307.5 | 199.5 | 256 | 262.2 | 454.2 | 23.9 | 1448.3 | 212.5 | 23.9 / 73.1 | 25.9 | 256 | 61.4 | yes (names ≤ 41 px) |
| 1024×768 AR | short | 293.1 | 185.1 | 256 | 262.2 | 454.2 | 22.2 | 1559.1 | 198.1 | 22.2 / 67.6 | 24.1 | 256 | 61.4 | yes (names ≤ 41 px) |
| 768×1024 FR | normal | 538.6 | 250 | 192 | 211.7 | 371.7 | 30 | 761.8 | 353.3 | 30 / 96.8 | 32 | 220 | 46.1 | no |
| 768×1024 AR | normal | 520.7 | 250 | 192 | 211.7 | 371.7 | 30 | 761.8 | 344.4 | 30 / 96.8 | 32 | 220 | 46.1 | no |
| 390×844 FR | normal, phone | 377.1 | 250 | 249.6 | 218.9 | — | 22.5 | 1076 | 272.6 | 22.5 / — | 32 | 249.6 | 58.2 | — |
| 390×844 AR | normal, phone | 359.2 | 250 | 249.6 | 218.9 | — | 22.5 | 1076 | 263.6 | 22.5 / — | 32 | 249.6 | 58.2 | — |
| 320×640 | short, phone | 204 | 96 | 136.3 | 152.2 | — | 8.6 | 1344.3 | 109 | 8.6 / — | 22 | 220 | 38 | — |

L3:

| Viewport | density | H | bh | bw | x1 | x2 | d1 | R | floor0 | drop ±1 / ±2 | F | cursor button | fade | ±2 shown |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1440×900 FR | normal | 411 | 200 | 200 | 331.2 | 495.2 | 24 | 2297.3 | 260.5 | 24 / 54 | 22 | 220 | 86.4 | yes (names ≤ 345 px) |
| 1440×900 AR | normal | 395.1 | 200 | 200 | 331.2 | 495.2 | 24 | 2297.3 | 252.6 | 24 / 54 | 22 | 220 | 86.4 | yes (names ≤ 345 px) |
| 1366×768 | short | 307.5 | 191.5 | 191.5 | 314.2 | 473.9 | 23 | 2159.2 | 204.5 | 23 / 52.7 | 21.1 | 220 | 82 | yes (names ≤ 319 px) |
| 1280×1024 | normal | 535 | 200 | 200 | 294.4 | 458.4 | 24 | 1817.7 | 322.5 | 24 / 58.8 | 22 | 220 | 76.8 | yes (names ≤ 271 px) |
| 1280×720 | short | 259.5 | 143.5 | 143.5 | 294.4 | 430.2 | 17.2 | 2525.2 | 156.5 | 17.2 / 36.9 | 18 | 220 | 76.8 | yes (names ≤ 327 px) |
| 1024×768 FR | short | 307.5 | 191.5 | 191.5 | 235.5 | 395.3 | 23 | 1218.4 | 204.5 | 23 / 65.9 | 21.1 | 220 | 61.4 | yes (names ≤ 159 px) |
| 1024×768 AR | short | 293.1 | 177.1 | 177.1 | 235.5 | 388.1 | 21.3 | 1315.7 | 190.1 | 21.3 / 58.5 | 19.5 | 220 | 61.4 | yes (names ≤ 174 px) |
| 768×1024 FR | normal | 538.6 | 200 | 200 | 218 | 382 | 24 | 1002.1 | 324.3 | 24 / 75.7 | 22 | 220 | 46.1 | no |
| 768×1024 AR | normal | 520.7 | 200 | 200 | 218 | 382 | 24 | 1002.1 | 315.4 | 24 / 75.7 | 22 | 220 | 46.1 | no |
| 390×844 FR | normal, phone | 377.1 | 200 | 200 | 205 | — | 18 | 1176.4 | 243.6 | 18 / — | 22 | 220 | 64 | — |
| 390×844 AR | normal, phone | 359.2 | 200 | 200 | 205 | — | 18 | 1176.4 | 234.6 | 18 / — | 22 | 220 | 64 | — |
| 320×640 | short, phone | 204 | 88 | 88 | 138.6 | — | 7.9 | 1217.4 | 101 | 7.9 / — | 18 | 220 | 38 | — |

(1440 values differ from the draft's by 3.6 px of `H` because the foot is the measured 78.5 px, not 74.9.)

- What one sees (prototype renders `$SCRATCH/halo-spec/out/p1`–`p4`, which remain valid for composition, not for rim
  widths, Appendix C): at 1440×900 the cursor and two neighbours per side, the ±2 items inside the viewport with their
  names clear of the outer part of the 6 % fades; at 1280×720 the same with ±2 names at 13 px; on 390×844 and 320×640
  one large cursor and the two ±1 neighbours peeking 46 px into the edge fade (on L1/L2 58 px wide at 390 and 38 px at
  320; 64 px on L3 at 390), names and counts hidden; at 768×1024 the cursor and its two ±1 neighbours only.

### 3.5 Compact row (`density = compact`: 853×480, 667×375, 640×360)

Halo's compact layout, without scale transforms (R23, D11): `bh = clamp(H − 16, 28, 60)`, `bw = 1.5·bh`; one row; each
item is `display:flex; flex-direction:row; align-items:center; gap:10px; min-block-size:44px` holding its mini art
(laid out at its own size: the cursor's figure fits `bw × bh`, a neighbour's `.8·bw × .8·bh`, by the viewBox ratio; L3:
the printed logo with `maxH = .5·bh` (cursor) or `.4·bh` (neighbours)), its name (15 px cursor / 13 px others, AR 15 /
14, `white-space:nowrap`, no halo) and, on the cursor only, the chip (`margin:0`). Every item has `--w0: auto` (its
width is its content's) and the transform `translate3d(calc(var(--x) - 50%), var(--y), 0) scale(1)` (`--s: 1`). C measures every item's **on-screen** width with
`getBoundingClientRect()` after writing its sizes (no transform scales it), then places the cursor's centre at `W/2`
and the others outwards with 26 px gaps between on-screen boxes; `--y = BLEED + (H − measured height)/2`. Items with
`a > 1` are « out ». The head, hint, dots, count, horizon, pool, glows, counts and the dots layer are hidden (head and
hint visually hidden, still referenced); Prev/Next overlay the row ends. On phones (`W < 700`) neighbours show their mini
art only (halo; their names stay in their accessible names); at 853×480 they show their names. Expected: 853×480 and
667×375 `bh = 60`, 640×360 `bh = 45.2`; every item ≥ 44 px tall on screen. Art and name sizes switch at the start of a
glide while the centres glide (R23).

### 3.6 Campus screen layouts

The campus section fills the band (tiny: see §5.1). Its strip row (back pill + other campuses) is 52 px (6 px top
padding + 44 px pills + 2 px bottom); the scroller holds the rest. B chooses the sheet layout from the viewport width
(`data-layout`, §5.6: `wide` ≥ 1100 px, `stacked` 700–1099 px, `single` < 700 px or tiny) and C's density.

| Viewport | Density | Sheet layout | Scroller (w × h) | Paris / Mulhouse / Lyon (FR, EN) | Arabic Paris | Website pill and strip without scrolling |
| --- | --- | --- | --- | --- | --- | --- |
| 1440×900 | normal | three columns (wide) | 1440 × 497 (AR 482) | snug, fits / tight, fits / full, fits (prototype) | **to be proven by B's harness on B's content** (H2i; prototype: tight fits by 7 px without B's extra content; with it ≈ 3 px in the heart and in the start wing; `tighter` recovers ≈ 50 px in the heart, 10 px in the start wing) | yes |
| 1366×768 | short | three columns, small heart | 1366 × 365 | scrolls under the fades; heart whole (expected) | scrolls | yes (expected) |
| 1280×1024 | normal | three columns (wide) | 1280 × 621 | cascade; expected full (more room than at 1440; not measured) | cascade (not measured) | yes (expected) |
| 1280×720 | short | three columns, small heart | 1280 × 317 | scrolls under the fades; heart (≈ 294 px) whole | scrolls | yes |
| 1024×768 | short | heart row above two wings (stacked) | 1024 × 365 (AR 351) | scrolls | scrolls | yes (expected) |
| 768×1024 | normal | heart then two wings (stacked) | 768 × 621 (AR 609) | heart then wings, scrolls | scrolls | yes (expected) |
| 390×844 | normal | one column | 390 × 458 (AR 447) | heart (≈ 341 px) then wings, scrolls | scrolls | yes |
| 320×640 | short | one column, heart row | 320 × 260 | heart (≈ 208 px), scrolls | scrolls | yes |
| 853×480 | short | heart row above two wings (stacked) | 853 × 158 | scrolls | scrolls | strip yes, pill after a short scroll |
| 667×375, 640×360 | tiny | one column, mini heart, strip on top | extends under the capsule (§5.1) | scrolls with clearance | scrolls | strip yes |

The 1440×900 outcomes come from the mock-up's sheet placed in B's exact band with B's 44 px photo pager
(`$SCRATCH/halo-spec/proto/probe_fit*.py`, `out/fit*/fit.json`): full layout Paris FR/EN overflow 4 px → snug fits
(17 px spare); Arabic Paris overflows 55 px → snug 34 → tight fits (7 px spare); Mulhouse FR/EN overflow 43 → snug 18 →
tight fits; Mulhouse AR still overflows 48 px in tight (it may scroll under the fades: H2i names Arabic Paris); Lyon fits
in every language. B's real content is longer than the mock-up's in the Arabic heart: Paris publishes its website in
French and English only, so A's fallback-language note (≈ 29 px) appears under the website pill, and the facts' Source
links (min 24 px) add ≈ 4 px; the heart then reaches ≈ 451 of the 454 px available, and one wrapped fact label would
overflow. The start wing is at the limit too: 447 px in tight on the mock-up's sheet, plus ≈ 4 px for the contacts'
Source link and its 24 px target (§5.2), ≈ 451 px. Hence the step `tighter` (§5.6), which shrinks the heart by ≈ 50 px and
the photo stack by 10 px. **H2i is claimed only when B's fit harness, run on B's real
content in Chrome at 1440×900 AR light and dark, reports `scrollHeight ≤ clientHeight` for Paris** (§9.1 B, §9.3, §10).
Lines marked « expected » are checked by §9.3, not by the prototype.

---------------------------------------------------------------------------------------------------------------

## 4. Item rendering

### 4.1 Common rules

- All DOM is built with `createElement` / `createElementNS`, never `innerHTML`; SVG classes with `setAttribute('class')`.
  Third-party SVG is never inlined: flags are `<image>` elements pointing at `assets/flags/{iso2}.svg` (§4.4), SVG logos
  are CSS masks by URL (§4.10).
- The site's global icon rule (`svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.6}`) is reset on
  art: `svg.hx-art,svg.hx-dots{display:block;width:100%;height:100%;fill:initial;stroke:none;stroke-width:0;
  overflow:visible;pointer-events:none}` (A2).
- **Strokes (D2)**: every stroked layer of the art module (rims, flag rim, sea rim, forced-colours outline, dot rings,
  locator dot and ring) is a **direct** `<path d="…">` or `<circle>` — never a `<use>` clone, whose `vector-effect`
  Chrome ignores — with `vector-effect:non-scaling-stroke` and `stroke-width:calc(<width token> / var(--s, 1))`. The
  stroke then measures the token on screen whatever the viewBox scale and the item's CSS scale `--s` (inherited from
  C's item; absent, hence 1, in the sheet and in the compact row). Fills may stay `<use href="#…-shape">`. The width is
  exact at rest; during a glide it follows the item's scale from the first frame (R27, §4.15).
- Shared gradients live in one hidden SVG inserted once per document by `ensureArtDefs(doc)` (A2): `<svg id="hx-defs"
  aria-hidden="true" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden">` — **never
  `display:none`** (Chrome does not paint gradients defined in a `display:none` SVG). Ids: `hx-land-grad`
  (linear 0,0 → 1,1: `--hx-land-a` 0, `--hx-land-b` .55, `--hx-land-c` 1), `hx-land-soft-grad` (`--hx-land-b` →
  `--hx-land-c`), `hx-sheen-grad` (linear 0,0 → .6,1: `--hx-sheen-hi` 0, `--hx-sheen-hi` at opacity 0 .45,
  `--hx-sheen-lo` 1), `hx-sea-grad` (radial cx .38 cy .32 r .75: `--hx-sea-a` → `--hx-sea-b`), `hx-horizon-line-grad`
  and `hx-horizon-glow-grad` (linear 0,0 → 1,0; line stops teal 0 / .3 teal .55 / .5 pink .5 / .7 teal .55 / 1 teal 0;
  glow stops teal 0 / .35 teal .5 / .5 pink .45 / .65 teal .5 / 1 teal 0). Every stop colour is `style="stop-color:
  var(--hx-…)"` so a theme switch never re-renders.
- Per-silhouette ids (`hx{n}-shape`, `-clip`, `-soft`, `-fade`, `-clear`) come from a counter private to
  `explorer-art.mjs`; callers pass no prefix; every `url(#…)` resolves inside its own SVG.

### 4.2 Item DOM (C)

```
button.explorer-item[type=button][data-explorer-card][data-id][data-kind=world|continent|country|campus]
      [data-off="0"|"1"|"-1"|"2"|"-2"|"out"][data-gliding?]                       aria-label (B's contract, §4.11)
      style: --x --y --s --w0 --fw --fh --lx --ly --ns --nk --ms --mt --gx --lk --nx
  span.explorer-box[aria-hidden=true]               position:relative; inline-size:100%; block-size:var(--h0); display:grid; place-items:end center
    span.explorer-glow                              quiet halo (L1/L2, §4.12)
    span.explorer-glow.explorer-glow-cursor         cursor halo (L1/L2), crossfaded with the quiet one
    span.explorer-figure                            position:relative; inline-size var(--fw); block-size var(--fh)
      svg.hx-art                                    L1/L2 silhouette (§4.3)        C: position:absolute; inset:0; z-index:0
      span.explorer-name[dir=auto]                  L1/L2 name over the shape (§4.8), z-index:1
      svg.hx-dots                                   L1/L2 campus dots (§4.7)       C: position:absolute; inset:0; z-index:2
      span.explorer-lantern                         L3 (§4.10): glow pseudo-elements + printed logo
  span.explorer-name[dir=auto]                      L3 name, below the lantern
  span.explorer-meta[aria-hidden=true]              L1/L2 count (countText)
  span.explorer-go[aria-hidden=true]                enter icon + « Valider / Select / تأكيد » (§4.9)
```

Level-wide variables, on `div.explorer-items`: `--h0` (= `bh`), `--b0` (= `bw`, the cursor's base width), `--F` (the
cursor name size), `--nmax` (phones only, §4.8). The rules that position C's children inside the figure
(`.explorer-figure > .hx-art`, `.explorer-figure > .hx-dots`) are C's, in `explorer-selector.css`: `explorer-art.css`
never names an `.explorer-*` class.

- **One transform per item, anchored by its centre (D10)**:
  `.explorer-item{position:absolute;left:0;top:0;inline-size:var(--w0);transform:translate3d(calc(var(--x) - 50%),
  var(--y),0) scale(var(--s));transform-origin:50% var(--h0)}` with `--x = W/2 + dx` (the centre, physical px) and
  `--y = BLEED + floor(dist) − h0`. The origin is the foot's centre, so the foot stands at `(W/2 + dx, BLEED +
  floor(dist))` at every scale and whatever the layout width: when `--w0` changes at the first frame of a glide, the
  percentage re-resolves and the centre does not move.
- **Everything inside an item is laid out at the cursor scale and is the same at every rank** (box height `--h0`,
  figure `--fw × --fh`, name font `--F`, lantern `--h0`, logo size), except the button's layout width
  `--w0 = (on-screen button width)/s` (§3.4, R16). Every other difference between ranks is a transform of its own
  element, transitioned with the item: the name's counter-scale `--ns` (§4.8), the count's `--ms` and offset `--mt`
  (§4.9), the L3 name's `--ns` and `--mt` (§4.10), the glows' width factor `--gx` (§4.12), the L3 logo floor `--lk`
  (§4.10), the phone cursor name's shift `--nx` (§4.8). C computes them in `layoutItems` (§7.2):

| Variable | Value |
| --- | --- |
| `--s` | rank scale (§4.14) |
| `--w0` | on-screen button width (§3.4, narrowed) / `s` |
| `--fw`, `--fh` | the figure at the cursor scale (§3.4) |
| `--lx`, `--ly` | `(label.x − vbX)/vbW·100 %`, `(label.y − vbY)/vbH·100 %` (50 % / 50 % without a label) |
| `--nk` | effective name size / `F` (cursor 1, ±1 `16/F`, ±2 `13/F`, AR `14/F`) — the name's on-screen scale |
| `--ns` | `nk / s` — the name's own counter-scale |
| `--ms` | effective count size / (14·`s`) (cursor 14, ±1 13, AR 14; ±2 and « out » as ±1, faded out) |
| `--mt` | `(10/s − 10)` px — keeps 10 px on screen between the box and the count or the L3 name |
| `--gx` | `(itemW/s)/b0`, `itemW` = halo's un-narrowed `max(base·s, rank 0 ? 220 : 120)` (L1/L2) |
| `--lk` | L3 logo floor factor ≥ 1 (§4.10); 1 elsewhere |
| `--nx` | phone cursor name shift in px (§4.8); 0 elsewhere |

- Button reset and look (halo): `display:flex; flex-direction:column; align-items:center; text-align:center;
  background:none; border:0; border-radius:0; padding:0; color:inherit; font:inherit;
  -webkit-tap-highlight-color:transparent`; no background, border, outline or shadow on the button in any state (H1, D3:
  no block).
- Every descendant has `pointer-events:none` (§4.21). Roving tabindex: cursor 0, others −1. Every item keeps
  `data-explorer-card`, `data-id`, `data-kind` (hooks of the existing keyboard, pointer and smoke logic).
- The track (`div.explorer-track`, §4.19) holds, in order: `svg.explorer-horizon`, `div.explorer-pool`, then
  `div.explorer-items` (the layer moved during a drag, §4.15) with the item buttons in list order.
- **Name-only items** (no `art`, no shape for the item, or `art.shapes === null`): the same DOM without `svg.hx-art`
  and `svg.hx-dots`; ratio 1.2 (halo's fallback), so the figure is an empty `fw × fh` box; the name at 50 % / 50 %; glows
  and pool unchanged. L3 without a print: the lantern without logo; the name below carries the item.

### 4.3 Silhouette SVG — `createSilhouette` (A2)

Built once per item instance at the cursor scale `k` (px per unit at scale 1, `k = fw/vbW`; it only sizes the cut masks,
§4.5). Layers, bottom to top:

```xml
<svg class="hx-art" viewBox="{vb}" data-kind="world|continent|country" data-variant="item|locator" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
  <defs>
    <path id="P-shape" d="{shape.d}"/>
    <clipPath id="P-clip"><use href="#P-shape"/></clipPath>                                  <!-- country, item variant -->
    <!-- europe and asia only (shape.cuts): -->
    <filter id="P-soft" filterUnits="userSpaceOnUse" x y width height color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="{5/k}"/></filter>
    <mask id="P-fade" maskUnits="userSpaceOnUse" x y width height>
      <rect fill="#fff" x y width height/>
      <polyline points="{run}" fill="none" stroke="#000" stroke-width="{2·10/k}" stroke-linecap="round" stroke-linejoin="round" filter="url(#P-soft)"/>   <!-- one per run -->
    </mask>
    <mask id="P-clear" maskUnits="userSpaceOnUse" x y width height>
      <rect fill="#fff" x y width height/>
      <polyline points="{run}" fill="none" stroke="#000" stroke-width="{2·18/k}" stroke-linecap="round" stroke-linejoin="round" filter="url(#P-soft)"/>
    </mask>
  </defs>

  <!-- world with shape.sphere (the globe, §4.6) -->
  <circle class="hx-sea" cx cy r/>
  <use class="hx-land" href="#P-shape"/>
  <circle class="hx-sea-rim" cx cy r/>
  <circle class="hx-sphere-sheen" cx cy r/>
  <path class="hx-outline" d="{shape.d}"/><circle class="hx-outline" cx cy r/>

  <!-- continent; also a world entry without sphere (the current flat module) -->
  <g class="hx-body" [mask="url(#P-fade)"]>
    <use class="hx-land" href="#P-shape"/>
    <use class="hx-sheen" href="#P-shape"/>
    <g [mask="url(#P-clear)"]><path class="hx-rim" d="{shape.d}"/></g>
  </g>
  <path class="hx-outline" d="{shape.d}"/>

  <!-- country, item variant -->
  <g clip-path="url(#P-clip)">
    <use class="hx-land" href="#P-shape"/>                                                  <!-- underlay: shows while the flag loads or if it fails -->
    <image class="hx-flag" href="{flagHref}" width="640" height="480" preserveAspectRatio="none" transform="{flagMatrix(shape.flag)}"/>
    <rect class="hx-sheen" x y width height/>                                                <!-- the viewBox -->
  </g>
  <path class="hx-flag-rim" d="{shape.d}"/>
  <path class="hx-outline" d="{shape.d}"/>

  <!-- country, locator variant (the sheet, §5.2) -->
  <use class="hx-land hx-land-soft" href="#P-shape"/>
  <path class="hx-rim" d="{shape.d}"/>
  <path class="hx-outline" d="{shape.d}"/>
  <circle class="hx-locator-ring" cx cy r/><circle class="hx-locator-dot" cx cy r/>       <!-- at shape.pins[hotPin] -->
</svg>
```

- The outline is the last layer of the shape in every kind and variant; only the locator's ring and dot come after it.
  It is never inside a mask, clip or `g.hx-body`.
- CSS (A2): `.hx-land{fill:url(#hx-land-grad)}`, `.hx-land-soft{fill:url(#hx-land-soft-grad)}`,
  `.hx-sheen{fill:url(#hx-sheen-grad);mix-blend-mode:soft-light}`, `.hx-sea{fill:url(#hx-sea-grad)}`,
  `.hx-sphere-sheen{fill:url(#hx-sheen-grad);opacity:.5;mix-blend-mode:soft-light}`, and for the strokes (§4.1)
  `.hx-rim{fill:none;stroke:var(--hx-rim);stroke-width:calc(var(--hx-rim-width) / var(--s, 1))}`,
  `.hx-flag-rim{fill:none;stroke:var(--hx-flag-rim);stroke-width:calc(var(--hx-flag-rim-width) / var(--s, 1))}`,
  `.hx-sea-rim{fill:none;stroke:color-mix(in srgb,var(--hx-pink) 22%,transparent);stroke-width:calc(var(--hx-sea-rim-width)
  / var(--s, 1))}`, each with `vector-effect:non-scaling-stroke;stroke-linejoin:round`; `.hx-outline{display:none}`
  (shown in forced colours, §2.7). Locator: `.hx-locator-dot{fill:var(--hx-pink);stroke:var(--hx-dot-ring);
  stroke-width:2px;vector-effect:non-scaling-stroke}`, `.hx-locator-ring{fill:none;stroke:var(--hx-pink);
  stroke-width:1.4px;vector-effect:non-scaling-stroke;opacity:.5}` and the ping of §2.5 (not under reduced motion).
- Mask and filter regions = the viewBox grown by 30 % on each side. The cursor's drop shadow is C's rule
  `.explorer-item[data-off="0"] .hx-art{filter:var(--hx-shape-shadow)}` (none on other ranks, none on the locator); it
  is computed from the masked rendering, so it fades along a cut too.
- **Tolerance** (lets B and C test before A1 lands): an entry without metadata (`{viewBox,d}` only) gets no dots, no
  cuts, and a flag placed as a centred 4:3 cover of `[2,2,vbW−2,vbH−2]`; a `world` entry without `sphere` (today's flat
  map) is drawn as a continent without cuts (land, sheen, rim, outline; no sea, no sphere circles).

### 4.4 Flags and the pale-band contour (H2b)

`flagHref = 'assets/flags/' + iso2.toLowerCase() + '.svg'` (Palestine `ps.svg`), resolved against the document (both
pages live in `site-b/`). The `<image>` is always 640 × 480 (the files' viewBox) and placed by
`transform="matrix(w/640 0 0 h/480 x y)"` from `shape.flag = [x,y,w,h]` (A1, §6.2): band flags stretched to the outline
box, emblem flags covered 4:3 with their emblem on the focus point (Chrome ignores `preserveAspectRatio` slice for SVG
images: `assets/flags/PROVENANCE.md`). The rim is a centred stroke along the outline drawn over the clipped flag: in
light it is `rgb(24 61 60 / .3)` at 1.2 px on screen, a hairline of A's teal-ink shadow hue that keeps France's, Italy's,
Luxembourg's and Japan's white bands readable against the light page without drawing a box; in dark it stays halo's
white .35 at 1.4 px. The prototype's comparison `out/glow/rim-l2.png` drew the rim through `<use>` (≈ 3.5 px) and is no
longer evidence for its weight; §9.3 measures the built rim.

### 4.5 Cut edges: the Europe/Asia line along the Urals (H2e)

`europe` and `asia` carry `cuts: [{points}]`, the outline runs that lie on the projected URALS polyline (A1, §6.2; today
one run each: Europe 15 points from (85.6, 2) to (98, 38), Asia 10 points from (27.6, 35.3) to (37.5, 21.2)). Rendering:
- `P-fade` masks the body (land + sheen + rim group): a blurred black core of half-width 10 px (σ 5 px) along each run
  at the cursor scale; the fill's opacity is ≈ .05 on the cut line, .5 at 10 px and ≈ .98 at 20 px inside: the land
  dissolves into the light along the bent line, with round soft ends where the cut meets the real coast. No gradient
  over the bounding box (halo's wedge, judges J1/J2). The masks are user-space shapes, so on ±1 / ±2 the dissolve
  scales with the item.
- `P-clear` removes the rim within ≈ 18 px of each run (blurred, so the rim fades out rather than stopping): **no rim
  and no glow line is drawn along the cut** in normal mode. In forced colours the outline (outside the masks) draws the
  cut (§2.7).
- The shadow follows the faded body (§4.3). Only `feGaussianBlur` is used, only in these two shapes' masks, rasterised
  with the item (never animated).
- Prototype renders at 1440 and 390 in both themes (`$SCRATCH/halo-spec/out/p1/zoom-europe.png`, `out/p4/zoom-*.png`,
  Europe and Asia as cursor and as neighbour) remain evidence for the dissolve's shape (no wedge, no straight edge, no
  rim along the Urals), not for the rim's width elsewhere (drawn through `<use>`).

### 4.6 The Monde globe (H4)

`SHAPES.world` (A1) is an orthographic hemisphere centred on 12°E 24°N: viewBox `0 0 100 100`, `sphere: [50, 50, 48]`,
land clipped at the horizon (`d`), `label: [50, 50]`, `pins` = the 51 campuses on the visible face, more than 6.9° (0.12
rad) inside the limb (§6.2). Drawn as halo: sea disc `hx-sea` (radial white → #DCF0EF light, #34333B → #222127 dark),
land `hx-land`, a pink 22 % sea rim of 1.2 px, a soft-light sheen at .5. No rim on the land. In forced colours: Canvas
sea and land, CanvasText outlines of the land and of the sphere. The name « Monde / World / العالم » is centred on the
sphere. The count stays « 58 campus · 30 pays » (model). Seven campuses sit on the far side and have no dot:
Gyeongsan, Iskandar Puteri, Kuala Lumpur, Penang, Seoul, Singapore, Tokyo (documented in the module header and in the
tests). Prototype: `$SCRATCH/halo-spec/out/p2/d1440-l1w-fr-light.png`, `m390-l1w-fr-light.png`.

### 4.7 Campus dots (H2a: never hidden by a name)

`createDots(doc, {shape, kind})` (A2) returns `svg.hx-dots` with the same viewBox and `preserveAspectRatio` as the
silhouette, placed **after the name** in `span.explorer-figure` (C positions it over the figure, above the name), one
`circle.hx-dot[data-campus]` per `shape.pins` entry (sorted by id), radius `max(vbW, vbH)/300 × (country ? 4.2 : 3.4)`
units, `fill:var(--hx-dot); stroke:var(--hx-dot-ring); stroke-width:calc(var(--hx-dot-ring-width) / var(--s, 1));
vector-effect:non-scaling-stroke` (A2). Visibility (halo; C's rules, opacity .35 s): all dots on the cursor;
continents and the globe show theirs at opacity .75 on neighbours; countries show theirs on the cursor only; hidden in
the compact row. A dot that falls on a glyph sits over it with its ring (prototype: « Japon » with the Tokyo dot,
« Europe » with Vienna's): the name stays legible and no campus disappears.

### 4.8 Names over shapes (L1/L2, H2a)

```css
.explorer-item:not([data-kind=campus]) .explorer-name{
 position:absolute;z-index:1;left:var(--lx);top:var(--ly);
 transform:translate(calc(-50% + var(--nx, 0px)),-50%) scale(var(--ns));
 inline-size:max-content;max-inline-size:min(9.5em,var(--nmax,9.5em));
 font-size:var(--F);font-weight:500;line-height:1.12;letter-spacing:-.01em;color:var(--hx-ink);text-wrap:balance;
 -webkit-text-stroke-width:calc(var(--hx-name-stroke) / var(--nk));-webkit-text-stroke-color:var(--hx-text-halo);
 paint-order:stroke fill;
 text-shadow:0 0 calc(var(--hx-name-core) / var(--nk)) var(--hx-text-halo),0 0 .22em var(--hx-text-glow),
  0 0 .5em color-mix(in srgb,var(--hx-text-halo) 45%,transparent);
 transition:transform .5s var(--ease)}
:lang(ar) .explorer-item .explorer-name{letter-spacing:0;line-height:1.4}
```

- **The halo hugs the glyphs (R1)**: a stroke of 4 px on screen at every size (`--hx-name-stroke / --nk`; half of it,
  2 px, shows around each glyph since the fill is painted over it), a 2 px halo-coloured shadow, and halo's two soft
  glows in em (they scale with the effective size, as halo's did). Measured (§2.2): ≥ 17.0:1 on all 158 renders, where
  the draft's `.085em` failed 46 times and halo's `.28em` (9 px at 32 px) merged into rectangles. Comparison renders of
  the three variants: produced by `$SCRATCH/halo-final/probe/names_measure3.py` (numbers only); the older
  `$SCRATCH/halo-spec/out/names3/` images are **not** evidence (their « light » runs could render dark and their FR and
  AR images at 1280 are identical).
- Effective sizes: cursor `F`, ±1 16, ±2 13 (Arabic 14), through `--nk` and `--ns` (§4.2). Names of « out » items are
  not shown; on phones names of non-cursor items have `opacity:0` (halo, no opacity transition).
- **Phones (R24)**: C sets `--nmax = W − 2·fade − 8px` on the items layer, so the cursor's name wraps inside the unfaded
  part of the screen, and gives the cursor `--nx` = the smallest shift (physical px) that keeps the name's box inside
  `[fade + 4, W − fade − 4]`, computed in `layoutItems` from the label anchor, the figure width and the measured name
  width (the name's centre at rest is `W/2 + (lxFraction − .5)·fw` on the cursor). The name is never resized.
- C measures every name's layout width (`offsetWidth`, at the font size `F`) after building a level and at every
  instant re-layout (§4.15); `layoutItems` uses it for R20 and R24.
- The « no rectangle » and contrast rules of §9.3 are the acceptance of this section.

### 4.9 Count and « Valider » chip

- `span.explorer-meta`: the item's `countText`, `margin-block-start:10px; font-size:14px; line-height:1.45;
  color:var(--hx-muted); white-space:nowrap; transform:translateY(var(--mt)) scale(var(--ms)); transform-origin:50% 0;
  transition:transform .5s var(--ease),opacity .3s`. On screen it sits 10 px below the box at 14 px (cursor) or 13 px
  (±1; Arabic 14). On ±2, « out » items and phone neighbours it fades out (`opacity:0`, halo); hidden
  (`display:none`) in the compact row.
- `span.explorer-go` (R22: in flow on the cursor only, so a hidden chip never extends a neighbour's button):
  `display:inline-flex; align-items:center; gap:8px; block-size:36px; margin-block-start:12px; padding:0 16px 0 13px;
  border-radius:999px; background:var(--hx-go-bg); color:var(--hx-go-ink); font-size:14px; font-weight:500;
  line-height:1; box-shadow:var(--hx-go-shadow)`; enter icon 18 px (stroke 1.8, `scaleX(-1)` in RTL) then the word.
  Not cursor: `position:absolute; top:100%; left:50%; translate:-50% 0; visibility:hidden; opacity:0;
  transform:translateY(6px) scale(.96); transition:opacity .25s, transform .35s var(--ease), visibility 0s .25s`.
  Cursor (`[data-off="0"]`): `position:relative; top:auto; left:auto; translate:none; visibility:visible; opacity:1;
  transform:none; transition:opacity .25s, transform .35s var(--ease), visibility 0s`; hover:
  `box-shadow:0 10px 26px color-mix(in srgb,var(--hx-go-bg) 42%,transparent)`. So the chip appears as halo's (fade and
  rise) and fades out in place when its item leaves the cursor. Compact row: in flow with `margin:0` on the cursor,
  `display:none` on the others (halo).

### 4.10 Campus items (L3): lantern, printed logos, glows (H2c, H6)

```
span.explorer-lantern        inline-size/block-size var(--h0); border-radius 50 %; display grid; place-items center; isolation isolate
  ::before                   quiet glow: inset −14 %, background var(--hx-logo-glow-quiet), opacity 1 → 0 on the cursor (.35 s)
  ::after                    cursor glow: inset −42 %, background var(--hx-logo-glow), opacity 0 → 1 on the cursor (.35 s)
  span.hx-logo[data-print=mask] | img.hx-logo[data-print=sticker] | (nothing: name only)
```

- **Size**: C asks `art.fitLogo(print, .76·h0, .30·h0)` (halo's box, layout px at the cursor scale; the same at every
  rank) through `layoutItems` (§7.2) and creates the logo once with `art.createPrintedLogo(doc, {print, width,
  height})`. The H2c floor is a transform: `.explorer-lantern > .hx-logo{transform:scale(var(--lk));
  transition:transform .5s var(--ease),opacity .35s}` with `lk = max(1, minH/(s·height))`, `minH` = 28 px on screen for
  ±1 and 22 px for ±2 (0 on the cursor), capped so the logo stays inside its button (`lk ≤ w0/width`). Worked values at
  1440×900 (prototype prints, §6.3; on screen): 42 Paris (aspect 1.3986) cursor 84 × 60; 42 Nice (2.1375) ±1 74 × 35;
  42 Mulhouse (2.339) ±2 59 × 25; Kuala Lumpur (3.6711) ±1 103 × 28 (floor active: `lk = 1.167`).
- **What « legible » means here (D7)**: the mark is recognisable at ≥ 28 px (±1) and ≥ 22 px (±2) tall on screen, and
  the name printed below carries the city (16 / 13 px). The city words inside the 42 lockups (≈ 5 px at these sizes) are
  not text the user must read. At 1440 halo's own sizes already exceed the floors for most marks, so the floors act on
  very wide marks and on smaller windows (1280×720, 1024×768); halo's proportions are kept on purpose (open point for the
  user, §10.3).
- **No disc**: in light the glows have halo's teal and pink stops without the white core (`--hx-logo-glow*`, §2.1); in
  dark halo's pink glows are kept, the quiet one without its flat core. Halo's white discs for comparison:
  `$SCRATCH/design-shots/halo/d1440-light-fr-l3.png`.
- Mask kind: `background-color:var(--hx-logo-ink)` through `mask-image` + `-webkit-mask-image` (URL of the print or of
  the SVG), `mask-size:contain`, `mask-position:center`, `mask-repeat:no-repeat` (longhands only; the `mask` shorthand
  would reset the image). Sticker kind (Codam only): the original image on `--hx-sticker-bg`, padding 6px 10px, radius
  10, `--hx-sticker-shadow` (halo's colour-logo rule). 42 Paris and the four 1337 use their catalogue logos; the name
  below tells them apart. Logos are decorative (`aria-hidden`, `alt=""`). These `.hx-logo` rules are A2's.
- No print (manifest missing): the lantern stays (glow) and the name below carries the item.
- **Phones (R5)**: the logos of non-cursor items are `opacity:0` (their glow still peeks into the edge fade); the cursor's
  logo is always shown.
- The L3 name: below the lantern, `margin-block-start:10px; transform:translateY(var(--mt)) scale(var(--ns));
  transform-origin:50% 0; transition:transform .5s var(--ease)`, ink, no halo, max 12 em (halo).
- On a resize or any instant re-layout C recomputes the logo box and writes it on the existing logo element
  (`style.width/height`), never re-creating it.

### 4.11 Cursor cue, accessible names, hover

- The cursor is identified without colour: centred and largest, lifted by the shadow, standing in the pool of light with
  the cursor halo, the only item with a count at 14 px and the « Valider » chip.
- Accessible name (unchanged B contract): `aria-label = {item.ariaLabel} · {position}` plus ` · {select}` on the cursor:
  FR « France · 8 campus · 6 sur 14 · Valider », EN « France · 8 campuses · 6 of 14 · Select », AR « فرنسا · 8 فروع ·
  6 من 14 · تأكيد », L3 FR « 42 Paris · France · 7 sur 8 · Valider ».
- Hover on a non-cursor item (pointer devices, `@media (hover:hover)`): its quiet glow becomes
  `radial-gradient(closest-side,var(--hx-glow-hover),transparent)` (L3: the lantern's `::before` takes the same
  background); nothing moves.
- Activation is B's single path (§7.2): pointer click positions a side item, a click on the item that was the cursor at
  `pointerdown` validates, `detail 0` (keyboard, assistive technology) validates that item, `detail > 1` and clicks within
  350 ms of a level change are ignored.

### 4.12 Glows, pool of light and horizon (D5)

- **Glows of L1/L2 items (halo's geometry, `halo.css` lines 132–134)**: both glows are centred on the item's box and sit
  under the figure (first children of `span.explorer-box`, before the positioned figure).
  `.explorer-glow{position:absolute;left:50%;top:50%;inline-size:calc(1.5 * var(--b0));block-size:calc(1.5 *
  var(--h0));transform:translate(-50%,-50%) scale(var(--gx),1);border-radius:50%;pointer-events:none;
  background:radial-gradient(closest-side,var(--hx-glow-quiet),transparent 100%);
  transition:opacity .35s,transform .5s var(--ease)}`; `.explorer-glow-cursor{inline-size:calc(1.9 * var(--b0));
  block-size:calc(1.75 * var(--h0));background:var(--hx-cursor-glow);opacity:0}`; on the cursor the quiet glow goes to
  `opacity:0` and the cursor glow to 1. On screen this is halo's quiet glow `1.5·itemW × 1.5·boxH` and cursor glow
  `1.9·itemW × 1.75·boxH`, `itemW` being halo's un-narrowed `max(base·s, 220 | 120)` and `boxH = bh·s`: R16's narrowing
  never shrinks a glow. The width factor is a transform, so a glow never jumps at the start of a glide. Hidden in the
  compact row, in forced colours and on L3 (the lantern has its own glows).
- `div.explorer-pool[aria-hidden]` in the track: `inline-size: (campus ? 1.35 : 1.25)·bw`, block-size 30 px, centred on
  `W/2`, top `BLEED + floor0 − 15`, `border-radius:50%`, `background:var(--hx-pool)`, `transition:opacity .3s`; it never
  moves during a glide; hidden in the compact row and in forced colours.
- `svg.explorer-horizon[aria-hidden]` fills the track (`viewBox="0 0 W {H + 2·BLEED}"`, `preserveAspectRatio="none"`):
  one path through 65 points `x = −(W/2+40) … +(W/2+40)` at `y = BLEED + floor(x)`, drawn twice: glow (`stroke:
  url(#hx-horizon-glow-grad); stroke-width:26; filter:blur(14px); opacity:.55`) and line (`stroke:
  url(#hx-horizon-line-grad); stroke-width:1.4`), both `fill:none`. Redrawn on every layout (not on cursor moves).
- Paint order, bottom to top: horizon, pool, then the items in list order; inside an item: glows, figure (art, name,
  dots), then the count and the chip.

### 4.13 Focus (user decision A, 24 Oct 2026)

- **Items**: the focused cursor item shows a ring around its « Valider » chip only; nothing frames the shape or the item
  (D3, R19). All of it lives in one block of `explorer-selector.css`, marked `/* Focus cue: user decision A (24 Oct
  2026) */`, and uses only `--hx-focus`, `--hx-focus-ring-width`, `--hx-focus-ring-offset`:

```css
/* Focus cue: user decision A (24 Oct 2026) */
:root #explorer .explorer-item:focus{outline:none}
:root #explorer .explorer-item:focus-visible > .explorer-go{outline:var(--hx-focus-ring-width) solid var(--hx-focus);outline-offset:var(--hx-focus-ring-offset)}
@media (forced-colors: active){:root #explorer .explorer-item:focus-visible > .explorer-go{outline-color:Highlight}}
```

  (The `:root #explorer` prefix out-ranks A's global `button:focus-visible{outline:2px solid …;outline-offset:5px}`.)

  Only the cursor is focusable (roving tabindex) and only the cursor shows its chip, so the ring always has a chip to
  surround (the outline follows the chip's 999 px radius; it appears and fades with the chip). The ring sits 3 px outside
  the chip, below the art, in the outer quarter of the cursor glow: ≥ 3:1 against its surroundings (§2.2, checked in
  §9.3). The track's vertical bleed keeps it unclipped; on phones the edge fade is capped by the whole cursor button
  (§4.19), which contains the chip and its ring.
- Other controls (Prev/Next, strip pills, sheet links and pills): the site's `button:focus-visible, a:focus-visible`
  rule (2 px, offset 5 px) except strip pills inside the scrolling list: `outline-offset:-3px` (inside the pill, never
  clipped by the list's overflow).
- The sheet h2: never an outline (`:focus{outline:none}`, no `:focus-visible` style): A's convention for programmatically
  focused titles (Chrome matches `:focus-visible` after a key press).

### 4.14 Ranks

| | cursor (0) | ±1 | ±2 (desktop) | out |
| --- | --- | --- | --- | --- |
| scale `s` | 1 | .58 (phone .56) | .42 | `.42·.8` |
| distance | 0 | `x1` | `x2` (phones `x1 + 400`, off screen) | `x2 + (a−2)·150`; an item made « out » by the edge rule R20 keeps its slot distance |
| opacity | 1 | 1 | 1 | 0 (`pointer-events:none`) |
| name (effective) | `F` | 16; hidden on phones | 13 (AR 14) | — |
| count | 14 | 13 (AR 14); faded out on phones | faded out | faded out |
| dots | all | continents/globe .75; countries 0 | same as ±1 | — |
| glow | cursor halo + pool | quiet (hover: stronger) | quiet | — |
| chip | in flow, shown | out of flow, invisible | out of flow, invisible | out of flow, invisible |
| shadow | `--hx-shape-shadow` | none | none | none |
| L3 logo min height (on screen) | — | 28 px; hidden on phones | 22 px | — |

### 4.15 Glide implementation (performance, H2j)

- **Transitions are scoped to glides**: every `transition` written in §4.8–§4.12 for an item or its sub-elements (the
  item's transform and opacity, names, counts, chip, glows, lantern glows, logos, dots) is declared by C under
  `.explorer-item[data-gliding]` (for example `.explorer-item[data-gliding] .explorer-name{transition:transform .5s
  var(--ease)}`); without `data-gliding` an item and everything inside it have `transition:none`, so a non-gliding item
  jumps.
- **Instant layouts**: `show()` builds a level, inserts it, measures the carousel and the names, computes
  `haloGeometry` and `layoutItems`, removes `data-gliding` from every item, writes every item's variables with
  `data-instant` on the level (`.explorer-level[data-instant] :is(.explorer-item,.explorer-item *,.explorer-pool),
  .explorer-level[data-instant] .explorer-lantern::before, .explorer-level[data-instant]
  .explorer-lantern::after{transition:none}`), draws the horizon and the pool, **forces a style and layout flush**
  (reads `level.offsetWidth` once), then
  removes `data-instant` on the next animation frame (`view.requestAnimationFrame`, else `setTimeout(…,0)`; nothing
  after `destroy()`). The flush makes the transition-less style apply before transitions come back, which also cancels
  any running glide: an instant re-layout during a glide (resize, `localize()`, `setCursor`, font load) jumps to the
  new layout and leaves no running transition (`document.getAnimations()` empty, §9.3). The same protocol runs for every
  re-layout not caused by a cursor move: the level's ResizeObserver (on the carousel), the root's ResizeObserver (band
  change, §3.1), `document.fonts.ready`, `localize()`, a band change at campus entry or exit. Nothing ever flies in;
  items never shrink or float above the horizon after a level change (the mock-up's bug: its new level was measured
  while the old one still shared the flex column).
- **Re-layout contents**: at every instant re-layout C re-measures the names (§4.8), rewrites the logo boxes (§4.10) and
  rebuilds the `svg.hx-art` of an item only when the level's `k` changed by more than 5 % since that SVG was built (the
  cut masks depend on `k`; nothing else does). A cursor move never rebuilds an SVG (`k` is the same at every rank).
- **Cursor move**: recompute `layoutItems`; items visible on screen at rest before **or** after the move (visible = not
  « out » and some of its art box inside the viewport; on phones `|o| ≤ 1`) get `data-gliding` (CSS: the transitions of
  §2.5, `will-change:transform`), removed on their item's `transitionend` (`transform`) or after 560 ms; every other
  item jumps in the same frame without transition and without `will-change`. No SVG is rebuilt, no font size or other
  layout size changes except each button's `--w0` and the chips' switch in or out of the flow (R22) — one layout at
  the start (D10) — and no layout runs during the glide.
  Stroke widths (§4.1, §4.8) take their new compensation at the first frame and are exact again when the transform
  ends (R27): at most ×1.72 / ×0.58 on the first frames of a cursor ↔ ±1 move, converging under the ease-out, with no
  repaint per frame.
- **Drag** (existing B behaviour, adapted): the items layer `div.explorer-items` follows the pointer with `translateX(dx)`
  (no transition; `will-change` during the drag only) while the horizon and the pool stay; on release the selector folds
  `dx` into each item's `--x` (instant, one frame), resets the layer, then applies the new layout with the glide. Steps
  `round(−dx·dir / x1)` (dir 1 LTR, −1 RTL): B's rule with halo's pitch `x1` (R25); cancel snaps back. During a drag on
  phones the neighbours keep their peeks.
- **Budget per view**: one drop shadow (the cursor's silhouette); one `feGaussianBlur` per cut shape (Europe, Asia); no
  `filter` on non-cursor items except the horizon glow's static blur; at most 30 flag images (Monde list); during a
  one-step glide `will-change` on ≤ 6 items at 1440×900 and ≤ 4 on phones (≤ 10 for Home/End or a multi-step drag).

### 4.16 Head: steps and prompt (C)

```
div.explorer-head                         flex, centred, gap 14 (10 below 700 px), padding 6px 0 0
  span.explorer-steps[aria-hidden=true]   3 dots linked by 14 × 1 px hairlines (--hx-hair-strong), gap 5
    span.explorer-step[data-state=done|current|todo]   done: 6 px --hx-teal; current: 8 px --hx-pink + 4 px ring pink 16 %; todo: 6 px --hx-hair-strong
  p.explorer-prompt#explorer-prompt-N     the prompt + span.sr-only « · Étape n sur 3 »
```

Copy (halo; the L1 prompt is A's `scopeTitle` exactly): L1 FR « Où veux-tu aller ? », EN « Where would you like to
go? », AR « إلى أين تريد الذهاب؟ »; L2 « Choisir un pays », « Choose a country », « اختر دولة »; L3 « Choisir un
campus », « Choose a campus », « اختر فرعًا »; step FR « Étape {n} sur 3 », EN « Step {n} of 3 », AR « المرحلة {n} من 3 ».
The carousel group is labelled by this paragraph (« Choisir un pays · Étape 2 sur 3 »). In the compact row the head is
visually hidden (sr-only), never `display:none`.

### 4.17 Pager (C)

```
div.explorer-foot > div.explorer-pager     flex, centred, gap 12
  button.explorer-nav[data-dir=prev]       44 px circle: --control-glass-surface, 1 px --control-glass-edge, --control-glass-shadow,
                                           backdrop blur 26 px saturate 1.15; chevron icon 20 px (stroke 1.8), mirrored in RTL
  span.explorer-dots[aria-hidden=true]     one i per item: 6 × 6 px --hx-hair-strong, gap 6; current 20 × 6 --hx-pink (width .4 s, background .3 s)
                                           [data-dense]: 4 × 4, gap 4, current 14 × 4
  span.explorer-count[dir=ltr][aria-hidden=true]   « 6 / 14 », 13 px muted tabular, min-inline-size 4.2em, isolate (AR 14)
  button.explorer-nav[data-dir=next]
```

- Behaviour (existing B): Prev/Next keep the focus, clamp at the ends with `aria-disabled="true"` (colour muted, opacity
  .45, cursor default), announce `{name} · {i} sur {n}`; labels Précédent/Suivant · Previous/Next · السابق/التالي.
- **Dots fit (R15)**: with `n` items and the band width `Wb`, `need(n, size, gap, cur) = 88 + 36 + countWidth +
  n·size + (n−1)·gap + (cur − size)` (`countWidth` = the count's measured width, ≈ 55 px); normal dots when `n ≤ 16` and
  `need(n,6,6,20) ≤ Wb`; else dense when `need(n,4,4,14) ≤ Wb`; else no dots (`hidden`). Dots are also hidden below 381 px
  of viewport width (halo). Results: L2 Europe (14) normal at 1440/1280, dense at 390; Monde list (30) dense at 1440 and
  1280, none on phones; L1 (5) and L3 France (8) normal at 390; 320×640 never (viewport < 381). The foot never grows
  wider than the band (the mock-up's pager widened B's level to 435 px on 390×844 in the prototype: `out/p2`).

### 4.18 Hint (C)

```
p.explorer-hint                                     13 px muted, line 1.45, centred (AR 14 / 1.6)
  span.explorer-hint-keys#explorer-hint-keys-N      <kbd>Flèches</kbd> pour choisir · <kbd>Entrée</kbd> pour valider · <kbd>Échap</kbd> pour revenir
  span.explorer-hint-touch#explorer-hint-touch-N    Glisse pour choisir · Touche le centre pour valider
```

- Copy (halo): keys EN [Arrows, to choose] [Enter, to select] [Esc, to go back], AR [الأسهم, للاختيار] [Enter, للتأكيد]
  [Esc, للرجوع], joined with « · »; touch FR « Glisse pour choisir · Touche le centre pour valider », EN « Swipe to choose ·
  Tap the centre to select », AR « اسحب للاختيار · المس العنصر في الوسط للتأكيد ».
- kbd: `display:inline-block; min-inline-size:1.9em; padding:0 .45em; border:1px solid var(--hx-hair-strong);
  border-block-end-width:2px; border-radius:6px; font:inherit; font-size:13px; line-height:1.5; color:var(--hx-ink);
  background:var(--hx-pill-surface); unicode-bidi:isolate` (Arabic 14 px; « Enter » and « Esc » get `lang="en"`).
- The visible span: keys unless `(hover:none) and (pointer:coarse)` (`view.matchMedia?.(…)`, absent → keys). **The group's
  `aria-describedby` points to the id of the visible span only (H2f)**, updated on that MediaQueryList's `change`; the
  listener is removed in `destroy()`.
- Normal density: visible; short and compact: visually hidden (sr-only, still the description).

### 4.19 Edge fades (H2d)

`div.explorer-track` (absolute, `inset-inline:0; top:-170px; bottom:-170px; pointer-events:none`) carries
`mask-image` and `-webkit-mask-image: linear-gradient(90deg, transparent 0, #000 var(--fade), #000 calc(100% −
var(--fade)), transparent 100%)` with `--fade` (set by C on the track) = 6 % of `W` on desktops (halo) and, on phones,
`min(64px, (W − (cursorButton + 16))/2 − 4)`: 58.2 px at 390 (L1/L2), 64 at 390 (L3), 38 at 320 — so the fade never
covers the cursor's button, hence never its art, name, chip or focus ring. On phones every neighbour peeks 46 px into
the screen: its silhouette dissolves toward the edge (it reads as « more to the side », never as a crop), its name and
count are hidden, and on L3 only its glow peeks (§4.10). On desktops R20 (§3.4) keeps names out of the outer 60 % of the
fade. Prototype: `$SCRATCH/halo-spec/out/p2/m390-l1w-fr-light.png`, `out/p2/s320-l2-fr-light.png`. The sibling strip and
the sheet body fade on their hidden sides (§5.1).

### 4.20 Compact row specifics

Covered by §3.5; additionally: the cursor's name has no halo (`-webkit-text-stroke-width:0; text-shadow:none`), the mini
art is the full silhouette (flag, land or globe, no dots; `createSilhouette` with the mini art's own `k`) or the printed
logo, the chip follows the name (`margin:0`), Prev/Next sit above the row ends (`z-index:2`), items under them stay
reachable by Prev/Next and keys; the focus ring of §4.13 surrounds the cursor's chip.

### 4.21 Hit testing

- `.explorer-item *{pointer-events:none}`; `.explorer-track,.explorer-pool,.explorer-horizon{pointer-events:none}`; items
  `pointer-events:auto` (out items none): inside an item the target is always the item's button. Absolute, invisible
  chips (R22) never extend a button's box.
- Button boxes never overlap each other (the narrowing of §3.4, R16: ≥ 8 px between adjacent buttons), never overlap
  the head row (the carousel starts below it) and never cover Prev/Next (the foot and head have `position:relative;
  z-index:2`, above the track's bleed).
- The campus section ignores pointer clicks during its entrance (R26, §5.1, §5.8).
- §9.3 runs an `elementFromPoint` grid (art centres, button corners, gaps, glow-only points, the pool, head and foot) at
  1440, 1280, 1024, 768, 390 and 320 on L1, L2, L3.

### 4.22 Level transitions

Per §2.5, with `element.animate()` (cancellable, skipped under reduced motion; delayed animations use
`fill:'backwards'`). The outgoing level is `inert` + `aria-hidden="true"` at once (existing) and stays painted for its
exit only; it is never re-laid out.

**Freeze (R21, D15), MUST**: C records each level's and each campus section's box at every layout it runs (`show()`,
instant re-layouts, the campus mount) as `{left, top, width, height}` = its border box relative to the stage's padding
box (`element.getBoundingClientRect()` minus `root.getBoundingClientRect()`'s left and top; physical px, valid in RTL).
When an element starts leaving, C freezes it from that record before anything else is inserted:
`position:absolute; left; top; width; height` (px, inline style), `margin:0`, so neither the band move (the status line
hides at campus level and shows again on the way back: the band's top moves by ≈ 30 px) nor the incoming view's size
can move or resize it, and its internal grid keeps its rows. The FLIP (§5.8) reads its source rect after the freeze.
Without motion the outgoing element is removed at once (no freeze needed).

---------------------------------------------------------------------------------------------------------------

## 5. The campus sheet

### 5.1 Campus frame (C, in `explorer-selector.mjs/.css`)

```
section.explorer-campus[data-level=campus][data-density=normal|short|tiny][data-entering?][aria-labelledby={headingId}]
      style: --explorer-band: {campus band height}px ; margin-inline: calc(-1 * var(--horizon-page-gutter))   (full bleed)
  div.explorer-campus-body[data-fade-start?][data-fade-end?]     the scroller: flex 1 1 0; min-block-size 0; overflow-y auto;
                                                                  overscroll-behavior contain; scrollbar-width thin;
                                                                  scrollbar-gutter stable; scroll-padding-block 18px 28px;
                                                                  B mounts its sheet here
  div.explorer-campus-foot                                       the strip row (52 px): flex none; flex row centred; gap 6; padding 6px 16px 2px;
                                                                  outside the scroller; before the body in tiny mode
    button.explorer-campus-back                                  « ← {country} » (always present, R13)
    nav.explorer-siblings[aria-label]                            only when the country has ≥ 2 campuses
      div.explorer-siblings-list[data-fade-start?][data-fade-end?]   overflow-x auto; scrollbar-width none; overscroll-behavior-x contain;
                                                                      flex; gap 4; scroll-padding-inline 22px 32px
        button.explorer-sibling[data-id][aria-current="true" on the current]
```

- `section.explorer-campus` is a flex column filling the band (`grid-area:1/1`). The body's size depends only on the
  band (never on the sheet): B observes it (§5.6).
- **Tiny** (campus band < 200: 667×375, 640×360): C sets `data-density="tiny"`, computed from the stage content box
  (never from the section's own box, which grows in this mode), and **moves the foot before the body in the DOM**
  (restoring the focus if the moved foot held it), so the strip sits at the top of the band, never under the search
  capsule, and the visual and Tab orders agree (WCAG 2.4.3). The section extends to the viewport bottom
  (`margin-block-end:calc(-1 * var(--explorer-bottom))`); the body gets `padding-block-end` and
  `scroll-padding-block-end` = `calc(var(--explorer-bottom) + 12px)` so the last line and every focused control can be
  scrolled clear of the capsule and the dock (H2i). Leaving tiny mode puts the foot back after the body.
- **Scroll-position fades** on the body: 18 px at the top when `scrollTop > 1`, 28 px at the bottom when
  `scrollTop + clientHeight < scrollHeight − 1` (halo's sizes), one combined `mask-image` (+ `-webkit-`, `#000` stops);
  on the list: 22 px at the inline start and 32 px at the inline end when content is hidden on that side
  (`Math.abs(scrollLeft)`, valid in RTL; `:dir(rtl)` swaps the physical sides). The scroll paddings above equal the
  fades, so a control focused by Tab is scrolled clear of them (logical properties: RTL holds; tiny mode keeps its
  larger end padding). Updated on `scroll` (passive), from a ResizeObserver on the body, the sheet root and the list,
  after `renderCampus`, after `syncSiblings` and `revealPill`, and after `document.fonts.ready`; these updates toggle
  attributes only (no size changes). At either end of a scroll no text is under a fade.
- **Entrance guard (R26, D9)**: when C creates the section from a level (or from another screen), it sets
  `data-entering` and listens on the section, in the capture phase, to `click`, `auxclick` and `mousedown`; while the
  attribute is set, an event with `detail > 0` (a pointer) gets `preventDefault()` and `stopPropagation()` (so the
  website pill, still invisible under the « Valider » chip, never opens on a slow double click or a second tap);
  keyboard and assistive-technology activations (`detail 0`) pass. C removes `data-entering` after
  `max(350 ms, the end of the section's entrance animations)` (≈ 800 ms after a FLIP, 500 ms after a generic descend,
  350 ms under reduced motion), at `settle()` and at `destroy()`. A sibling switch does not set it.
- **Back pill**: `min-block-size:44px; padding-inline:10px 14px; border-radius:999px; background:var(--hx-pill-solid);
  border:1px solid var(--hx-pill-edge); color:var(--hx-ink); font-size:14px`; back icon 18 px (stroke 1.8, mirrored in
  RTL) + `span[dir=auto]` with the country name; `aria-label` « Revenir aux campus · {country} » / « Back to campuses ·
  {country} » / « العودة إلى فروع {country} »; activation → `onAscend()`.
- **Sibling pills** (halo): `min-block-size:44px; padding:0 12px; border-radius:999px; font-size:14px;
  color:var(--hx-muted); white-space:nowrap`; hover `--hx-ink`; current: `--hx-ink`, weight 500,
  `background:var(--hx-sib-current)`, a 16 px check icon (stroke 2, `--hx-pink-text`) before the name, `aria-current="true"`.
  `nav` label « Tous les campus · {country} » / « All campuses · {country} » / « جميع فروع {country} ». Behaviour (existing):
  a pill validates its campus (`onValidate({kind:'campus', id})`), the current pill does nothing, the activated pill keeps
  the focus across the switch (same node, `aria-current` moves), the list scrolls only itself to centre the current pill
  (`revealPill`, also when it lies under a fade).
- CSS scoping: C's rules never match `.explorer-sheet*`; B's rules are scoped under `.explorer-sheet` and may read only
  `section.explorer-campus[data-density=…]` and `--explorer-band` from C.
- The h2 is rendered by B; C labels the section with `headingId` and focuses the returned `heading`. Without a sheet
  (`renderCampus` returns null) C renders a fallback `h2#{headingId}[tabindex=-1]` with the campus name (existing).

### 5.2 Sheet DOM (B, `explorer-campus.mjs`)

DOM order = reading order = the one-column order, in every layout.

```
div.explorer-sheet#explorer-sheet-N[lang][dir][data-layout=wide|stacked|single][data-fit=full|snug|tight|tighter|scroll][data-sparse=true|false]
  div.explorer-sheet-heart
    span.explorer-sheet-lantern[aria-hidden=true]       circle --d (§5.6); ::before glow (inset −34 %, --hx-logo-glow); the printed logo
    h2.explorer-sheet-title#{headingId}[tabindex=-1]    <bdi>42 Paris</bdi>
    p.explorer-sheet-country                            img.explorer-sheet-flag[alt=""][width=20][height=15] + span[dir=auto] country
    dl.explorer-sheet-facts                             only if a fact exists
      div.explorer-sheet-fact[data-key=opening|students|cohorts|alumni]   flex column-reverse: dd above dt
        dt                                              label [ · as-of ] [ · a.explorer-sheet-source « Source » ]
        dd                                              value: <time datetime> (opening) or span[dir=ltr] (numbers, « 5 000+ »)
    a.explorer-sheet-cta                                website pill (if a website resolves)
    p.explorer-sheet-note × 0–2                         A's website-language notes
    p.explorer-sheet-verified                           « Dernière vérification : <time datetime> » (if verifiedAt parses)
  div.explorer-sheet-wing[data-wing=start]
    section.explorer-sheet-section.explorer-sheet-photos       if photos exist (h3, stack, bar)
    | figure.explorer-sheet-section.explorer-sheet-locator     if not (country silhouette, pinging dot, figcaption)
    section.explorer-sheet-section.explorer-sheet-contacts     if contacts exist (h3, ul, Source)
  div.explorer-sheet-wing[data-wing=end]
    section.explorer-sheet-section.explorer-sheet-address      h3, address, actions (Copy, Directions), status
    section.explorer-sheet-section.explorer-sheet-piscines     h3, timeline or note, piscinesNote, dates link
    p.explorer-sheet-missing                                   if anything is missing (§5.5)
```

Element styles (halo values; « snug » values of §5.6 in brackets):
- **Lantern** (only with a print; without one the heart starts with the h2): `inline-size/block-size:var(--d);
  border-radius:50%; display:grid; place-items:center; isolation:isolate; margin-block-end:14px`; logo `art.createPrintedLogo(doc, {print, ...art.fitLogo(print, .76·d, .36·d)})` (B reads the
  lantern's `clientWidth` after mount, after each cascade step and in its ResizeObserver callback, and rewrites the
  logo's size, §5.6). Light glow without white core (H2c). The returned `logo` is this element.
- **h2**: 35 / 500 / 1.15, `letter-spacing:-.025em`; `:focus{outline:none}`, no `:focus-visible` style.
- **Country line**: `inline-flex; gap:8px; margin-block-start:6px; font-size:16px; color:var(--hx-muted)`; flag image
  20 × 15, `border-radius:3px`, `box-shadow:0 0 0 1px var(--hx-hair)` (`country.flagHref`).
- **Facts**: `flex; justify-content:center; gap:30px; margin-block-start:16px`; dd 28 / 500 / 1.1, `letter-spacing:-.02em`,
  tabular, numbers `dir="ltr"` + `unicode-bidi:isolate`; dt 13 / 1.4 muted, `margin-block-start:4px`; the « Source » link
  13 px muted underlined (`text-underline-offset:3px`), `display:inline-block; min-block-size:24px`.
- **Website pill**: `inline-flex; gap:10px; min-block-size:44px; margin-block-start:18px; padding:0 20px;
  border-radius:999px; background:var(--hx-go-bg); color:var(--hx-go-ink); font-size:15px; font-weight:500;
  text-decoration:none; box-shadow:0 10px 24px color-mix(in srgb,var(--hx-go-bg) 30%,transparent)`; external icon 18 px
  (mirrored in RTL); notes 13 px muted, `margin-block-start:8px`; verified 13 px muted, `margin-block-start:12px`.
- **Wings**: `display:grid; gap:24px [16]; align-content:center; min-inline-size:0`; start `justify-items:end`, children
  `inline-size:min(100%,380px)`; end `justify-items:start`, children `inline-size:min(100%,360px)`.
- **Section titles (h3)**: `display:flex; align-items:center; gap:8px; margin-block-end:10px [8]; font-size:13px;
  font-weight:500; line-height:1.4; letter-spacing:.06em; text-transform:uppercase; color:var(--hx-accent)`; `::before`
  a 6 px `--hx-pink` dot with a 3 px ring of pink 15 %. Arabic: 14 px, no caps, no tracking.
- **Photos**: stack `position:relative; aspect-ratio:16/10; inline-size:calc(100% − 14px) [tight: min(calc(100% − 14px),
  256px)]; margin-block-start:6px`; each `figure.explorer-sheet-photo[data-depth=0|1|2]` absolute `inset:0; padding:5px;
  border-radius:20px; background:var(--hx-frame); box-shadow:var(--hx-photo-shadow); transition:transform .5s
  var(--ease),opacity .4s`, `z-index` 10 / 9 / 8 for depths 0 / 1 / 2 (`[data-depth]` rules); image `object-fit:cover;
  border-radius:15px`; depth 1 `rotate(4deg) translate(14px,-6px) scale(.94)` (RTL `rotate(-4deg) translate(-14px,-6px)
  scale(.94)`); depth 2 `rotate(-3deg) translate(-10px,-2px) scale(.92)`; back images `filter:saturate(.75)
  brightness(1.04)`; back prints `aria-hidden="true"` and `inert`. The front print's
  `button.explorer-sheet-photo-open[aria-haspopup=dialog]` (aria-label « Agrandir la photo : {alt} ») opens A's media
  viewer; `span.explorer-sheet-expand[aria-hidden]` (36 px circle, `--hx-expand-bg`, expand icon 18 px in
  `--hx-expand-ink`, `inset-inline-end:12px; top:12px`) shows on hover and `:focus-visible`. Bar: `flex;
  align-items:center; gap:10px; margin-block-start:12px [8]`: (≥ 2 photos) prev 44 px glass circle (chevron, mirrored) ·
  `span.explorer-sheet-photo-count[role=status][aria-live=polite][aria-atomic=true][dir=ltr]` « 1 / 2 » (13 px muted,
  tabular) · next; then `p.explorer-sheet-credit` (`margin-inline-start:auto`, 13 px muted): `<bdi dir=auto>` credit of
  the **active** photo + « · » + its « Source » link (underlined; inline text link, exempt from the 24 px target).
- **Contacts**: `ul` rows `flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:0 14px;
  padding:7px 0 [5px 0]; border-block-start:1px solid var(--hx-hair)` (first row: no border, no top padding); label 13 px
  muted; value `a.explorer-sheet-link[dir=auto]` 15 px `--hx-accent`, `min-block-size:24px`, `overflow-wrap:anywhere`
  (underline on hover), or a plain `span` when the href is unsafe; then `p.explorer-sheet-source` (13 px muted,
  `margin-block-start:8px`) with the « Source » link (`display:inline-block; min-block-size:24px`).
- **Address**: `address[dir=auto]` 16 / 1.55, `white-space:pre-line`, `font-style:normal` (right-aligned in RTL);
  actions `flex; flex-wrap:wrap; gap:8px; margin-block-start:12px`: `button.explorer-sheet-pill` « Copier l’adresse »
  (copy icon) and `a.explorer-sheet-pill` « Itinéraire » (route icon, new tab): pills `inline-flex; gap:8px;
  min-block-size:44px; padding:0 16px 0 13px; border-radius:999px; background:var(--hx-pill-surface); border:1px solid
  var(--hx-pill-edge); color:var(--hx-ink); font-size:14px`, icons 18 px in `--hx-accent`; then
  `p.explorer-sheet-status[role=status][aria-live=polite][aria-atomic=true]` (13 px muted; empty until a copy; its line
  is not reserved, D12).
- **Piscines**: `ul.explorer-sheet-timeline > li.explorer-sheet-piscine[data-starts-on][data-ends-on?]` (`display:grid;
  gap:2px; padding-inline-start:22px; padding-block-end:12px [8px]; position:relative`); `::before` an 8 px pink dot at
  `inset-inline-start:4px; top:8px` (first item: a 4 px ring of pink 18 %); `li + li::after` a 1 px `--hx-hair-strong`
  connector from the previous dot; `p` name 16 / 500 / 1.4 + `span.explorer-sheet-chip` (« Prochaine », or A's
  « En cours » for an ongoing one: 13 px / 500, padding 1px 8px, radius 999, `color:var(--hx-chip-text)`,
  `background:color-mix(in srgb,var(--hx-pink) 11%,transparent)`, `margin-inline-start:8px`, `vertical-align:2px`; Arabic
  14 px); `p` dates 14 px muted; notes `p.explorer-sheet-note` 13 / 1.5 muted; the dates link in a `p`
  (`margin-block-start:6px`): `a.explorer-sheet-link` + external icon 15 px.
- **Missing line**: `p.explorer-sheet-missing` `flex; gap:10px; align-items:flex-start; font-size:14px; line-height:1.5;
  color:var(--hx-muted)`; sparkle icon 18 px `--hx-pink`, `margin-block-start:2px`.
- **Locator** (no photos): `figure.explorer-sheet-locator` `display:grid; justify-items:center; gap:10px`; an art span of
  height `clamp(130px, .42·band, 220px)` and width by the viewBox ratio holding `art.createSilhouette(doc,{shape, kind:
  'country', variant:'locator', hotPin: campus.id, scale})` (soft land, rim, no flag, no sheen, the forced-colours
  outline; a pink dot of radius `max(vbW,vbH)/300·6` units with a 2 px `--hx-dot-ring` stroke and a ring of 1.6× its
  radius, 1.4 px pink at .5, pinging 2.4 s unless reduced motion); `figcaption` « Où se trouve 42 Lyon » 14 px muted.
  B calls `art.ensureArtDefs(doc)` before drawing it.

### 5.3 Field mapping (`mountCampusDetails` of A → halo sheet)

| A field | Data | Halo sheet | Behaviour kept exactly from A |
| --- | --- | --- | --- |
| hero logo slot, name h3 | `profile.logo`, `campus.name` | heart: printed **catalogue** logo (`campus.logo.print`) in the lantern + h2 name. `profile.logo` is not used. | the name is never hidden |
| country | `countryName(campus.country)` | country line with the mini flag | — |
| photos | `profile.photos` (safeURL against `doc.baseURI`) | stack of prints, pager, credit and Source of the active photo, media viewer | `safeURL`; alt / caption / credit localisation and the `photoAlt(name)` fallback; `onOpenMedia({items,index,locale,trigger})` with all photos (`type:'image'`); `loading` eager for the first, lazy after; status « i / n » (Latin digits), `role=status` |
| no photos | — | locator (country silhouette, pinging dot, caption) + « photos » in the missing line | — |
| address | `campus.address` | Adresse, Copier l’adresse, Itinéraire | clipboard flow: `copying` guard, button disabled while copying, statuses `copied` / `copyError`, `onCopyAddress` hook, no late status after destroy; directions URL `https://www.google.com/maps/dir/?api=1&destination={name}, {address on one line}`; « Non renseigné » if empty (no catalogue campus lacks one) |
| contacts | `profile.contacts`, `contactSourceUrl` | Contacts list + Source | `safeURL(…,{contact:true})` (mailto, tel, https); unsafe → plain text; localised labels and values; https links open a new tab |
| website | `resolveCampusWebsite(campus, language)` | heart pill + notes | label campus-site « Site officiel du campus » vs « Fiche officielle · 42 Network »; `hreflang`; `aria-label "{label} · {campus}. {newTab}"`; fallback-language note; manual-language note |
| opening | `openedLabel` / `openedOn`, `openedSourceUrl` | fact « Ouverture » + Source | `time[datetime]` when parsable; never an invented month or day |
| stats | `stats.students/cohorts/alumni` `{value, asOf, sourceUrl}` | facts (available only), label with « · en {date} » and Source; absent ones in the missing line | a real 0 kept; strings kept as is (« 5 000+ »); numbers `Intl.NumberFormat(locale,{numberingSystem:'latn'})` |
| piscines | `piscines`, `piscinesNote`, `piscineSourceUrl` | timeline with « Prochaine » / « En cours », note, dates link | A's filtering: day precision only, invalid or ended removed with `now`, ongoing kept with « En cours », sorted by start; dates link = `piscineSourceUrl`, or the website when nothing is upcoming; a Piscine's own `sourceUrl` shown only when it differs from the dates link |
| verified | `verifiedAt` | « Dernière vérification : … » | `time[datetime]` |
| Source links | every `sourceUrl` | « Source » links | A's labels: text « Source » / « المصدر », `aria-label` « Source. {newTab} », `target=_blank`, `rel="noopener noreferrer"` |
| missing-stats note, « Non renseigné » cells | — | none: one missing line (§5.5) | — |
| dialog sheet | `mountCampusSheet` | none (never in a dialog) | — |

### 5.4 Sheet copy (B, module-owned)

Halo's strings (mock-up `halo.js` lines 30–73) are the reference; A's strings are reused where halo has none.

| Key | FR | EN | AR |
| --- | --- | --- | --- |
| photos (h3) | Photos | Photos | الصور |
| enlarge | Agrandir la photo | Enlarge photo | تكبير الصورة |
| prevPhoto / nextPhoto | Photo précédente / Photo suivante | Previous photo / Next photo | الصورة السابقة / الصورة التالية |
| contacts | Contacts | Contacts | التواصل |
| address | Adresse | Address | العنوان |
| copy / copied | Copier l’adresse / Adresse copiée. | Copy address / Address copied. | نسخ العنوان / تم نسخ العنوان. |
| copyError (A) | La copie automatique est indisponible. Sélectionnez l’adresse ci-dessus pour la copier. | Automatic copying is unavailable. Select the address above to copy it. | النسخ التلقائي غير متاح. حدّد العنوان أعلاه لنسخه. |
| directions / directionsLabel | Itinéraire / Itinéraire dans Google Maps | Directions / Directions in Google Maps | الاتجاهات / الاتجاهات في خرائط Google |
| website / profile | Site officiel du campus / Fiche officielle · 42 Network | Official campus website / Official profile · 42 Network | الموقع الرسمي للفرع / الصفحة الرسمية · 42 Network |
| newTab | S’ouvre dans un nouvel onglet | Opens in a new tab | يفتح في علامة تبويب جديدة |
| website notes (A) | Site en {language} · Pour afficher le site en {language}, utilise son menu de langue. | Website in {language} · Select {language} from the website’s language menu. | الموقع باللغة {language} · اختر {language} من قائمة اللغات في الموقع. |
| opening | Ouverture | Opened | الافتتاح |
| students / cohorts / alumni (fact labels) | Étudiants / Promotions / Alumni | Students / Cohorts / Alumni | الطلاب / الدفعات / الخريجون |
| as-of (year or month / day) | en {date} / au {date} | in {date} / as of {date} | في {date} |
| source | Source | Source | المصدر |
| piscines (h3) | Prochaines Piscines | Upcoming Piscines | فترات البيسين القادمة |
| piscine (label fallback, A) | Piscine | Piscine | البيسين |
| upcoming chip / ongoing chip (A) | Prochaine / En cours | Next / In progress | القادمة / جارية الآن |
| checkDates | Les dates des Piscines sont publiées sur le site officiel du campus. | Piscine dates are published on the official campus website. | تُنشر مواعيد البيسين على الموقع الرسمي للفرع. |
| officialDates | Consulter les dates officielles | Check official dates | الاطلاع على المواعيد الرسمية |
| verified | Dernière vérification : | Last checked: | آخر تحقق: |
| missingIntro | Pas encore renseignés ici : | Not provided here yet: | لم تُضف هنا بعد: |
| missing items | photos, contacts, date d’ouverture, chiffres, étudiants, promotions, alumni | photos, contacts, opening date, figures, students, cohorts, alumni | الصور، جهات التواصل، تاريخ الافتتاح، الأرقام، الطلاب، الدفعات، الخريجون |
| list joiners | « , » and « et » | « , » and « and » | « ، » and « و» (R18) |
| locator caption | Où se trouve {campus} | Where {campus} is | موقع {campus} |
| missing address (A) | Non renseigné | Not provided | غير متوفر |

- Source links keep A's accessible names (`aria-label` « Source. S’ouvre dans un nouvel onglet » / « Source. Opens in a
  new tab » / « المصدر. يفتح في علامة تبويب جديدة »); they are not renamed after their fact (no departure from A).
- Examples: Lyon FR « Pas encore renseignés ici : photos, contacts, date d’ouverture et chiffres. »; Paris and Mulhouse FR
  « Pas encore renseignés ici : promotions et alumni. »; Paris EN « Not provided here yet: cohorts and alumni. »; Paris AR
  « لم تُضف هنا بعد: الدفعات والخريجون. ».
- Dates: `Intl.DateTimeFormat(tag, {...})` with `tag = language === 'ar' ? 'ar-u-nu-latn' : language`, `timeZone:'UTC'`;
  long form `{year, month:'long'?, day?}` by precision (A's `dateText`); Piscine ranges
  `{day:'numeric', month:'short', year:'numeric'}.formatRange(start, end)` (FR « 25 janv. – 19 févr. 2027 »).

### 5.5 Empty and sparse states

- `missing` = photos? → contacts? → opening? → figures (when no stat at all) or each absent one of students, cohorts,
  alumni when at least one stat exists. One sentence `missingIntro + list + "."` iff `missing.length > 0`; never a table
  of dashes, never a repeated « Non renseigné ». `data-sparse="true"` iff photos, contacts, opening and every stat are
  absent (56 of 58 campuses).
- No photos → the locator takes the photos' place. No contacts → the Contacts section is omitted. No opening and no
  stat → no facts row. No upcoming Piscine → checkDates + the dates link (falls back to the website). The address is
  always shown.

### 5.6 Layouts and the fit cascade (B)

**Layout attribute.** B sets `data-layout` on the sheet root: `single` when C's density is `tiny` or
`view.matchMedia('(max-width: 699px)')` matches; else `wide` when `(min-width: 1100px)` matches; else `stacked`. Without
`matchMedia` (test fakes): `wide`. B updates it on both MediaQueryLists' `change` (listeners removed in `destroy()`).
B's CSS keys the layouts on `.explorer-sheet[data-layout=…]` and `section.explorer-campus[data-density=…]` only — no
width media queries — so the cascade's condition and the CSS can never disagree.

| Case | Grid | Heart |
| --- | --- | --- |
| `wide`, normal | `grid-template-columns:minmax(0,1fr) minmax(280px,340px) minmax(0,1fr); grid-template-areas:"start heart end"; column-gap:clamp(28px,4vw,64px); align-items:center; max-inline-size:1240px; margin-inline:auto; padding:10px clamp(16px,4vw,64px) 18px; min-block-size:100%` (vertically centred when it fits) | centred column; `--d: clamp(124px, calc(var(--explorer-band) * .3), 172px)` |
| `wide`, short | same, `align-items:start`, wings `align-content:start` | `--d:96px; margin-block-end:6px`; h2 28; country 15 (`margin-block-start:2px`); facts `margin-block-start:8px`, dd 22; pill `margin-block-start:12px`; verified `6px` |
| `stacked`, normal | columns `minmax(0,1fr) minmax(0,1fr)`; areas `"heart heart" "start end"`; `row-gap:28px; align-items:start`; wings `align-content:start`; start wing `justify-items:stretch` | centred column |
| `stacked`, short | same, `row-gap:22px` | one row: grid `auto minmax(0,max-content)`, areas `"logo name" "logo country" "logo facts" "logo cta" "logo verified"`, `column-gap:22px; justify-content:center; text-align:start`; `--d:104px`; h2 28; country 15; facts `margin-block-start:6px; gap:22px`, dd 20, facts aligned start; pill `margin-block-start:10px`; verified `4px` |
| `single`, normal | one column; areas `"heart" "start" "end"`; `row-gap:30px; padding-block-start:6px`; wings stretch, children full width | `--d:118px; margin-block-end:8px`; h2 28; pill `margin-block-start:14px`; facts gap 24, dd 24 |
| `single`, short | one column | areas `"logo name" "logo country" "facts facts" "cta cta" "verified verified"`, columns `auto minmax(0,1fr)`, `column-gap:14px`; `--d:76px`; h2 24 (`align-self:end`); country `align-self:start`; facts `margin-block-start:10px` |
| `single`, tiny | one column, the body scrolls (strip outside, §5.1) | mini heart: areas `"logo name" "logo facts" "logo cta" "logo verified"`; `--d:64px`; no country line; facts inline (`flex-direction:row-reverse; align-items:baseline; gap:6px`), dd 16, `gap:14px`; pill `min-block-size:44px; margin-block-start:6px` (halo's 40 px raised to 44, H2g) |

Halo's sheet padding inline is `clamp(16px,4vw,64px)` in every layout (the section is full bleed).

**Fit cascade (R10, H2i)** — only when `data-layout="wide"` and C's density is `normal`; otherwise `data-fit="full"` and
the sheet scrolls by design (halo).
- Steps, each adding to the previous one: **full** (halo's values); **snug** = wing gap 16, h3 `margin-block-end:8px`,
  contact rows `padding-block:5px`, photo bar `margin-block-start:8px`, Piscine rows `padding-block-end:8px`; **tight**
  = snug + photo stack `inline-size:min(calc(100% − 14px), 256px)` (prints 160 px high instead of ≈ 200); **tighter**
  (D6) = tight + in the heart `--d: clamp(112px, calc(var(--explorer-band) * .24), 136px)`, lantern
  `margin-block-end:10px`, facts `margin-block-start:12px`, website pill `margin-block-start:14px`, notes
  `margin-block-start:6px`, verified `margin-block-start:8px` (≈ 50 px less at 1440×900 AR: the lantern 160 → 128 px),
  and in the start wing the photo stack `inline-size:min(calc(100% − 14px), 240px)` (prints 150 px high, 10 px less).
  **scroll** = halo's own overflow state: the full values, `align-items:start`, wings `align-content:start`, the body
  scrolling under C's fades.
- Algorithm (synchronous): for each step in order, set `data-fit`, re-fit the heart logo to the lantern, then read
  `container.scrollHeight ≤ container.clientHeight + 1`; stop at the first step that fits, else settle on `scroll`.
- When (D12): at mount (synchronously, before `mountExplorerCampus` returns: C's FLIP measures right after); in the
  callback of B's ResizeObserver on **the container only** (`observe(container, {box:'border-box'})`), and only when the
  container's border-box size, C's density or `data-layout` differ from the last run (in the callback itself, not in a
  later frame, so no wrong step is ever painted; safe because the observed box cannot change); on a `data-layout` change; once
  after `doc.fonts.ready`. A locale change re-mounts the sheet (C). B never observes the sheet or its children. The
  container's size depends only on the band (§5.1), so a cascade step can never resize what is observed: no
  ResizeObserver loop. Pressing Copy adds the status line without any re-run (the status line is not reserved: +25 px
  in the end wing would break the Arabic Paris fit, D12); a fitted sheet may then scroll by a line under the fade.
- **Fit harness (B, scratchpad)**: a read-only Chrome script through `helper.py` that mounts B's real sheet in
  `content-preview.html` at 1440×900 and records, for Paris, Mulhouse and Lyon in FR, EN and AR, light and dark, the
  chosen step and the spare height; once with the system Arabic font and once with `Noto Sans Arabic` replaced by the
  fallback stack (a test-only style `:lang(ar){font-family:Jost,sans-serif}` injected by the harness). **H2i is claimed
  only if Paris AR fits with the system font** (both themes); the fallback outcome is reported, not blocking (§2.3).

### 5.7 Strip and back pill

See §5.1. The strip is always rendered (back pill at least), outside the scroller, at the foot of the band (top in tiny
mode). With 8 French campuses at 1440×900 the list fits without scrolling; on phones it scrolls with the end fades and
the current pill centred.

### 5.8 Entering the sheet: FLIP and blocks (C)

At every entry into the campus screen from another view, `show()` runs, in this order:
1. **Freeze** the outgoing element at its recorded box (§4.22). The band may already have moved (`updateScope` measures
   the band before `syncExplorer`); the freeze keeps the outgoing view where it was painted.
2. **Source** (FLIP only): if the outgoing view is an L3 level in density `normal` or `short` (never the compact row)
   whose cursor item has a printed logo (`.explorer-item[data-off="0"] .explorer-lantern > .hx-logo`) inside the
   viewport, read that logo's rect `a` (after the freeze, so where it was seen).
3. **Build** the section: `data-density`, `--explorer-band`, the tiny-mode DOM order, `data-entering` (§5.1), insert it
   in the stage, then call `renderCampus(body, campusId, locale, {headingId})` — B's synchronous cascade reads the
   laid-out body — and record the section's box (§4.22).
4. **FLIP** when `a` exists and the handle has a `logo`: read the heart logo's rect `b`; hide the source lantern
   (`visibility:hidden`); fade the outgoing level 220 ms linear; animate `handle.lantern` from
   `translate(acx − bcx, acy − bcy) scale(a.width / b.width)` (centres, physical px, valid in RTL;
   `transform-origin:50% 50%`, the lantern's centre being its logo's centre) to `none`, 560 ms. The scale is the logo's
   own ratio, so the logo starts exactly at its L3 size (the heart fits logos to `.76·d × .36·d`, L3 to `.76·h0 ×
   .30·h0`; a lantern-width ratio would enlarge height-limited logos by ≈ 20 %); the glow around it scales by the same
   ratio.
5. **Blocks**: animate `handle.heartItems` (h2, country, facts, pill, notes, verified that exist, in order),
   `handle.wings.start`, `handle.wings.end` and C's own foot with the delays of §2.5 (`fill:'backwards'`).
6. Remove `data-entering` after `max(350 ms, the end of the last entrance animation)`.

No source (dice, deep link, popover, search, Back/Forward, compact row, no print on either side): the generic descend
(§2.5), with steps 1, 3 and 6. The h2 is never scaled. Any new `show()` finishes or cancels these animations at once
(existing `settle()`). Reduced motion: none of the animations; the outgoing view is removed at once; the guard lasts
350 ms.

### 5.9 Focus, announcements, keyboard

Unchanged from current B: the focus goes to the h2 (`preventScroll`) when it was inside the selector or requested; a
sibling switch keeps the focus on the activated pill; a language change re-mounts the sheet, keeps `scrollTop`
(clamped) and moves the focus to the h2 if it was inside the body; Escape/Backspace ascend from anywhere in the campus
screen (not inside an open dialog — the media viewer — nor an editable field), once per key press (repeat guard, §7.2).
Announcements stay the controller's (location announcement); status regions: the copy status and the photo count. In
tiny mode Shift+Tab from the sheet reaches the strip first (DOM order).

---------------------------------------------------------------------------------------------------------------

## 6. Data contracts

### 6.1 `site-b/explorer-shapes.mjs` (regenerated by A1)

Same module, same export, frozen plain data, no import:

```js
export const SHAPES = Object.freeze({
  world: {viewBox:'0 0 100 100', d, box, label:[50,50], pins, sphere:[50,50,48]},   // the Monde globe (H4)
  continents: {africa:{viewBox,d,box,label,pins}, americas:{…}, asia:{…, cuts}, europe:{…, cuts}},
  countries: {AGO:{viewBox,d,box,label,pins,flag[,focus]}, …},                          // the 30 catalogue countries
});
// box    [x0,y0,x1,y1] bounding box of the outline (world: of the visible land), 0.1 units
// label  [x,y] halo's name anchor (§6.2); world: the sphere's centre
// pins   {campusId:[x,y]} keys sorted by id; world: the campuses on the visible face; continent: its campuses
//        (continentOfCountry); country: its campuses
// cuts   [{points:[[x,y],…]}] europe and asia only: outline runs on the projected URALS polyline
// flag   [x,y,w,h] placement of the 640×480 flag face (countries); focus [x,y] emblem countries only
// sphere [cx,cy,r] world only
```

Key order inside each entry, as printed: `viewBox, d, box, label, pins` then `cuts` (europe, asia), `flag, focus`
(countries), `sphere` (world). Size MUST stay under 125 KB (prototype: the globe's path is 14 157 bytes against 13 910
for today's flat world; the module ≈ 114 KB). The module header's lines about the world and the labels are rewritten
for this version: the world is the orthographic globe centred on 12°E 24°N (no longer « Natural Earth 1, without
Antarctica » fitted to its box), its label is the sphere's centre (no longer « the centre of its box, on land (the pole
is in Siberia) »), its pins are the 51 campuses of the visible face and the 7 far-side campuses are named (no longer
« world: all of them »), and the label method is halo's anchor (§6.2); the `focus` line says that the focus of an emblem
flag is the polylabel point of the largest polygon (the former label) unless the rule gives a lon/lat point.

### 6.2 Generator changes (A1, `site-b/tools/build-explorer-shapes.mjs`)

The partial metadata already in the generator (`box`, `pins`, `cuts`, `flag`, `focus`, `FLAG_RULES`, `METADATA`,
`polylabel`, `cutRuns`, `flagRect`, `toView`) is **kept**; two parts change:

1. **Labels: halo's anchor.** New export `haloLabel(polygon, centre, {pull = METADATA.pull, precision = METADATA.label})`:
   the point of the polygon (outer ring and its holes) that maximises `signedDistance(p) − pull·|p − centre|`, with
   `centre` = the centre of the shape's `box` and `pull = 0.45` (halo: « the pole of inaccessibility, pulled toward the
   centre of the box »). Search: polylabel's square cells in the existing `Heap`, a cell's bound = value at its centre +
   `h·√2·(1 + pull)`, seeded with `polylabel(polygon)` and the box centre (when inside); precision 0.1; rounded to 0.1.
   Applied to the largest polygon of each continent and country. `METADATA` gains `pull: 0.45`. Expected values:
   Appendix B (±0.2; the prototype `$SCRATCH/halo-spec/proto/gen.mjs` / `run-labels.mjs` computed them on the current
   module). **Emblem flags keep their focus**: in `metadataOf`, `focus` (emblem rules without `at`) stays the rounded
   `polylabel(main)` point that is today's label, so `flag` and `focus` are byte-identical to the current module and the
   emblem contact sheet stays valid; only `label` takes `haloLabel`.
2. **World: the orthographic globe (H4).** New export `GLOBE = Object.freeze({centre: [12, 24], limb: 0.12})`.
   Projection `d3.geoOrthographic().rotate([-12, -24]).clipAngle(90)` fitted with `fitExtent([[2,2],[98,98]],
   {type:'Sphere'})` (sphere centre (50, 50), radius 48 units). Every Natural Earth feature but Antarctica (as today),
   densified at 0.25°, is streamed through `projection.stream` (the horizon clip adds the limb arcs) into rings; then the
   same union by rasterisation (10 px per unit, 4 × 4 samples, 1 px closing), contour tracing, world minima (parts 0.4,
   holes 1 square unit), weighted Visvalingam to ≤ 1500 points, rounding and orientation as the other shapes — **without
   re-fit** (the frame is the sphere's; viewBox `0 0 100 100`). `pins`: campuses with `d3.geoDistance(coordinates,
   [12, 24]) ≤ π/2 − 0.12`, projected and rounded. `label: [50, 50]`, `sphere: [50, 50, 48]`. Prototype
   (`proto/gen.mjs#buildGlobe`): 1500 points, 16 parts, 6 holes (lakes, the Caspian), 51 pins; hidden: gyeongsan,
   iskandar-puteri, kuala-lumpur, penang, seoul, singapore, tokyo.
3. Unchanged (lead): `URALS`, `CONTINENT_RULES` and their drop boxes, `COUNTRY_RULES` (`MAR:{with:['ESH']}`),
   `PARAMETERS`, `FLAG_RULES`, the cut-run algorithm and its build-time assertions (every run point within 0.35 units of
   the projected URALS, a run on europe and on asia, the longest ≥ 10 units).
4. `renderModule` prints `shape(viewBox, d, {box, label, pins, cuts?, flag?, focus?, sphere?})` with the deep-freezing
   helper and the header of §6.1. Run from the repository root:
   `node site-b/tools/build-explorer-shapes.mjs --source $SCRATCH/ne-source/ne_10m_admin_0_countries.geojson` (writes)
   then the same with `--check` (passes after regeneration; the source's SHA-256 is verified by the generator). `$SCRATCH`
   is the absolute path given at the top of this document.

### 6.3 Logo print pipeline (A1, H6, D14)

- New tool `site-b/tools/build-campus-logo-prints.py`, run from the repository root as
  `python3 -I site-b/tools/build-campus-logo-prints.py [--check]`. Dependencies: Pillow and numpy (both allowed; today
  Python 3.14.4, Pillow 12.1.1, numpy 2.3.5, zlib 1.3.1, libjpeg-turbo 2.1.5). The tool prints these five versions
  (`sys.version`, `PIL.__version__`, `numpy.__version__`, `PIL.features.version('zlib')`,
  `PIL.features.version('libjpeg_turbo')`) at the start of its output. It reads `site-b/campus-logos.json` and `site-b/assets/campus-logos/*`; it writes
  `site-b/assets/campus-logos/print/{source stem}.png` and the `print` field of every campus.
- **Normative algorithm** (the prototype `$SCRATCH/halo-spec/proto/prints.py`, restated; any difference is a defect).
  Campuses are processed in sorted id order; a `src` already processed reuses its result (the four 1337 share
  `print/1337.png`).
  - SVG source (`format == 'svg'`): `kind: 'mask'`, `src` = the original `.svg`, `width` / `height` / `aspectRatio` =
    the manifest's (viewBox numbers).
  - Raster source: `im = Image.open(path).convert('RGBA')`; `a = numpy.asarray(im).astype(numpy.float64)`;
    `rgb = a[..., :3]`, `alpha = a[..., 3]`; `L = rgb @ [0.2126, 0.7152, 0.0722]` (on the 8-bit encoded values, not
    linearised). With `background == 'transparent'`: `covered = alpha > 128`, `link = numpy.percentile(L[covered], 5)`,
    `m = alpha/255 · clip((255 − L) / max(1, 255 − link), 0, 1)`. Otherwise (`background`, default `#FFFFFF`; Nice
    `#FEFEFE`): `lbg = bgRGB @ [0.2126, 0.7152, 0.0722]`, `covered = (alpha > 128) & (|lbg − L| > 40)`, `link = numpy.percentile(L[covered],
    5)`, `m = clip((lbg − L − 14) / max(1, lbg − link − 14), 0, 1) · alpha/255`. Percentiles use numpy's default
    (`method='linear'`).
  - Classification: `chroma = rgb.max(axis=2) − rgb.min(axis=2)`; `p95 = numpy.percentile(chroma[covered], 95)`;
    `p95 < 46` → `mask`, else `sticker`. Expected: only `codam` is a sticker. A result that differs from this
    expectation is resolved in an explicit `OVERRIDES` table in the tool, with a reason (empty today).
  - Sticker: `src` = the original file, `width` / `height` = its pixel size, `aspectRatio = round(width/height, 4)`.
  - Mask print: `on = m > 8/255`; bounding box of `on` (`x0 = min x`, `x1 = max x + 1`, same for y); `pad = max(2,
    round(0.02·max(x1 − x0, y1 − y0)))` (Python `round`, half to even); the box grown by `pad` and clamped to the image
    (ink touching the edges — Lyon, Irbid, Marseille, Milano, Tirana — keeps the full width); `crop =
    numpy.round(m[y0:y1, x0:x1]·255).astype(numpy.uint8)` (half to even); output `Image.fromarray(numpy.dstack([zeros,
    crop]), 'LA')` (L = 0), saved as PNG with `optimize=True` and no metadata. **No speck removal** (the prototype's
    comment mentions one; it is not implemented and MUST NOT be).
  - Outputs on this machine (prototype): 50 print files, 271 205 bytes; aspect ratios 1.3986 (Paris) … 3.6711 (Kuala
    Lumpur); Nice 2.1375, Mulhouse 2.339; contact sheet `$SCRATCH/halo-spec/proto/prints/contact.png`.
- `--check`: first compares the running libjpeg-turbo version with the constant `JPEG_DECODER` written in the tool
  (`'2.1.5'`, the build's); if they differ it stops with exit code 2 and the message « JPEG decoder differs (built with
  libjpeg-turbo {expected}, running {found}): the 18 JPEG sources may decode differently; run the check with a matching
  Pillow build » before comparing anything. Then it rebuilds in memory and fails on any difference of decoded pixels
  (mode, size, every LA value) or of the manifest's `print` fields other than `sha256` / `bytes` (so it does not depend
  on the zlib build); the tests check `sha256` / `bytes` against the files.
- Manifest field, added **last** in each campus entry (file written with `json.dumps(data, indent=2,
  ensure_ascii=False) + '\n'` and the existing key order, so the diff only adds fields):

```json
"print": {"kind": "mask", "src": "assets/campus-logos/print/paris.png", "width": 193, "height": 138,
          "aspectRatio": 1.3986, "sha256": "…", "bytes": 1999}
```
  `kind` `"mask" | "sticker"`; `src` the print (raster masks), the original `.svg` (SVG masks) or the original file
  (sticker); `width` / `height` pixels of `src` (SVG: viewBox numbers); `aspectRatio` width/height to 4 decimals;
  `sha256` / `bytes` of `src`. All other fields unchanged (Paris's numbers above are the prototype's).
- Provenance record (H8: no documentation file from builders): A1 does **not** edit `assets/campus-logos/PROVENANCE.md`.
  The tool's output ends with what the record needs: method, tool, the five versions, date, classification and a file
  table (print path, campuses, kind, pixel size, bytes, SHA-256). After the build the lead adds a « Variantes
  imprimées » section and scopes the sentence « Dessins non modifiés : ni recoloration, ni recadrage, ni marge ajoutée. »
  to the source files, since the prints are recoloured and trimmed; the rights caveat stays as written.

### 6.4 Runtime data flow (D)

- `welcome.mjs` imports the art primitives statically and builds one `explorerArt` object (§7.5) passed to the selector
  and to the sheet. `explorer-shapes.mjs` (≈ 114 KB) is loaded with a dynamic `import()` inside `loadNetworkData`, in
  parallel with the catalogue and under its 20 s abort signal. **It gates the arrival**: `prepareExplorer` awaits
  `loadNetworkData`, so the first view waits for the module (a local file: milliseconds in practice) unless the import
  fails (resolved `null` at once) or the abort fires (resolved `null` after 20 s). A failed import stays failed for the
  page (the module map caches it): items are name-only for the page's life. **A late success is applied**: if the import
  resolves after the abort, `loadExplorerShapes` sets `explorerArt.shapes` and calls `explorer.localize()`, which
  builds the silhouettes of the items that were drawn name-only (§7.2).
- `loadNetworkData` also fetches `./campus-logos.json?v=b2` as an **optional** file (`{campuses:{}}` on failure) and merges
  `logo: logos?.campuses?.[id] || null` into each enriched campus.
- Degradation: without the manifest, L3 shows lanterns and names and the heart shows the h2 without logo (no FLIP:
  generic descend); without the shapes, L1/L2 show names only (§4.2); without a flag file, the land underlay shows
  inside the shape.

---------------------------------------------------------------------------------------------------------------

## 7. Module and API changes (exact signatures)

### 7.1 `site-b/explorer-art.mjs` and `site-b/explorer-art.css` (A2, rewritten)

```js
export function ensureArtDefs(doc)                       // → SVGSVGElement #hx-defs, inserted once as the first child of doc.body (idempotent)
export function createSilhouette(doc, {
  shape,                 // an SHAPES entry ({viewBox,d,box?,label?,pins?,cuts?,flag?,focus?,sphere?})
  kind,                  // 'world' | 'continent' | 'country'
  flagHref = null,       // country: URL of the 640×480 flag SVG
  scale = 1,             // k: px per unit at which the art is laid out; sizes the cut masks only (§4.5)
  variant = 'item',      // 'item' | 'locator' (country only: soft land, rim, outline, the pinging dot at hotPin; no flag, no sheen)
  hotPin = null,         // locator: campus id
})                       // → SVGSVGElement svg.hx-art (ids from a module counter), or null for an unusable shape
export function createDots(doc, {shape, kind})           // → SVGSVGElement svg.hx-dots (no circle when no pins)
export function createPrintedLogo(doc, {print, width, height, baseURI = doc.baseURI || 'https://horizon.invalid/'})
  // mask:    <span class="hx-logo" data-print="mask" aria-hidden="true" style="width:{w}px;height:{h}px;-webkit-mask-image:url("{abs}");mask-image:url("{abs}")">
  // sticker: <img class="hx-logo" data-print="sticker" alt="" decoding="async" src="{abs}" width="{w}" height="{h}" style="width:{w}px;height:{h}px">
  // null when print is missing or its src is not http(s)/file after resolution
export function fitLogo(print, maxW, maxH, {minH = 0} = {})   // pure → {width, height}: h = max(min(maxH, maxW/ar), minH), w = h·ar (ar = print.aspectRatio, 3 when unknown)
export function flagMatrix(rect)                          // pure → 'matrix(w/640 0 0 h/480 x y)'; identity for an invalid rect
export function icon(doc, name)                           // → inline SVG 24×24 (viewBox 0 0 24 24, aria-hidden, focusable=false, class hx-icon) drawn with the site's stroke rule; null for an unknown name
export const ICON_NAMES                                   // ['back','check','copy','enter','expand','external','next','prev','route','sparkle']
```

- Strokes are direct paths and circles (§4.1, §4.3); the forced-colours outline is the last layer of every shape.
- Icon path data = the mock-up's sprite symbols (`halo/index.html` lines 57–72: `i-back`, `i-check`, `i-enter`,
  `i-external`, `i-copy`, `i-route`, `i-prev`, `i-next`, `i-expand`, `i-sparkle`), copied verbatim. The pages' sprites are
  not changed.
- The module uses only `doc` (no globals); every colour comes from `explorer-art.css`.
- `explorer-art.css`: the tokens (§2.1), the `svg.hx-art` / `svg.hx-dots` reset, the `.hx-*` art rules (§4.3–4.7), the
  `.hx-logo` mask longhands and sticker plate (§4.10), the locator ping keyframes, the forced-colours rules for `.hx-*`
  (§2.7). No selector of `.explorer-*` in this file.
- First deliverable (§8): the tokens and this API working on the **current** shapes module (entries `{viewBox,d}` and
  partial metadata; a world without `sphere`, §4.3).

### 7.2 `site-b/explorer-selector.mjs` and `.css` (C, rewritten on the same behaviour)

```js
export function createExplorerSelector({
  root, getLocale = () => 'fr', motion = null, onValidate = () => {}, onAscend = () => {}, onAnnounce = () => {},
  renderCampus = null,   // (container, campusId, locale, {headingId}) → {element, heading, lantern, logo, heartItems, wings:{start,end}, destroy} | null
  art = null,            // explorerArt (§7.5): {shapes, ensureArtDefs, createSilhouette, createDots, createPrintedLogo, fitLogo, icon, flagHref, logo}; read lazily at each build
}) → {show(view, {direction = 'none', focus = false} = {}), focus(), localize(), destroy(), hasView(),
      setCursor(id, {focus = false, animate = true} = {}) → boolean}
export function haloGeometry({W, H, phone, campus, density})
  // pure → {density, phone, compact, campus, W, H, bh, bw, s1, s2, x1, x2, top, floor0, d1, R, F, below}
export function floorAt(geometry, x)                             // pure → y of the horizon at distance x (track coordinates without BLEED)
export function layoutItems({geometry, items, cursorIndex, rtl, fitLogo = null})
  // pure (calls only its arguments); items [{id, kind, ratio, nameWidth = 0, print = null, labelX = .5}] →
  // {fade, nmax, items: [{id, off, visible, s, dist, x, y, w0, fw, fh, nk, ns, ms, mt, gx, lk, nx, logo: {width, height} | null}]}
  // off: 0 | ±1 | ±2 | 'out' (R20 applied); x = W/2 + dx (centre); y = BLEED + floor(dist) − bh; logo at the cursor scale
  // (fitLogo(print, .76·bh, .30·bh); null without fitLogo or print); nmax null except on phones
export function pagerDots({n, width, countWidth = 55})           // pure → 'normal' | 'dense' | 'none'
```

- Behaviour kept (SPEC-B §6.3–6.5): `show()` synchronous DOM update; same key → texts and labels in place, nodes kept by
  `kind:id`, the UI cursor kept by id (re-sorted for a new language); focus hand-over only when focus was inside `root`
  or requested; the single click validation path (`detail` rules, the 350 ms guard, outgoing-level guard); keydown on
  `root` only (modifiers, composition, open dialogs and fields ignored); arrows/Home/End only on items, swapped in RTL;
  Enter: one press validates once, auto-repeated keydowns are swallowed (`preventDefault`) and never validate again;
  Prev/Next keep focus, clamp, announce; drag (§4.15) and wheel (±50 px per step, 150 ms idle, `passive:false`,
  ctrl/meta ignored); campus screen: section labelled by the sheet's heading, heading focused, back pill ascends, pills
  validate, focus kept on the activated pill, the list scrolls only itself; `renderCampus` re-run only on campus or
  locale change.
- **New** (H2f): public `setCursor(id, {focus, animate})` — if the current view is a level containing `id`, moves the UI
  cursor there (layout, glide unless reduced motion or `animate:false`, no announcement, focus only when asked) and
  returns `true`, also when the cursor already was there; otherwise `false`. It wraps, and never replaces, the internal
  move function (today's private `setCursor`, renamed), which keeps returning « changed » and keeps driving `moveBy`,
  the wheel and the drag snap-back. **Escape/Backspace repeat guard**: when the view can ascend, `preventDefault()`
  always, `onAscend()` only if `!event.repeat`. **Hint description**: the group's `aria-describedby` = the visible hint
  span's id (§4.18).
- Inputs of `layoutItems`: `ratio = vbW/vbH` of the item's shape (1.2 without), `nameWidth` = the name's measured layout
  width (§4.8), `print = art.logo(id)` for campuses, `labelX` = the label's x fraction (for R24). C passes
  `fitLogo: art?.fitLogo`.
- `renderCampus` is called with a fourth argument `{headingId}` (`explorer-campus-title-N`), after C has set the section's
  `data-density`, `--explorer-band`, the tiny-mode order and `data-entering` and inserted it (§5.8); the returned
  `lantern`, `logo`, `heartItems` and `wings` drive the FLIP; `destroy()` is called on campus change, language change,
  ascend and `destroy()`.
- Only `root.ownerDocument` and its `defaultView` are used (`matchMedia`, `ResizeObserver`, `getComputedStyle`,
  `requestAnimationFrame`, `setTimeout`, `performance`), each feature-tested (test fakes may lack them). C calls
  `art.ensureArtDefs(root.ownerDocument)` before building its first level (B calls it too before drawing a locator; it is
  idempotent). **Without `art`** (tests only): name-only items, no icons (buttons keep their accessible names), no logos,
  no FLIP. A shape missing for one item: that item is name-only.
- `focusNode(node)` scrolls the node into view (`block:'nearest'`) only when `root.dataset.stageScroll === 'true'` (§3.1).
- `localize()` repaints texts, re-sorts, builds the silhouettes of items drawn name-only whose shape is now available
  (late shapes, §6.4), and re-runs the layout with the instant protocol (direction and Arabic sizes may change). Without
  a view it only repaints the title (today's behaviour); on the campus screen it re-mounts the sheet as today (scroll
  kept), which is also what a late shapes arrival does there (the locator gets drawn).
  Resize: §4.15 (names re-measured, logo boxes rewritten, silhouettes rebuilt only when `k` changed by more than 5 %).
- `destroy()` also removes the coarse-pointer MediaQueryList listener, the scroll and capture listeners of the campus
  screen, every observer, every timer (the entrance guard included) and any pending frame.
- C's stylesheet holds the stage rules (§3.1), the level, items, figure positioning, names, counts, chip, glows, pool,
  horizon, pager, hint, fades, compact row, campus frame and strip, and the focus block of §4.13; its colours are `--hx-*`
  tokens and A's `--control-glass-*`.
- Removed: cards, index numbers, card dots, the reticle, the progress-bar pager, the glass campus panel and its clip-path
  growth, the campus head eyebrow « Campus · {country} », every `#explorer .campus-details` rule, every `[data-band]` rule.

### 7.3 `renderCampus` contract (implemented by D in `welcome.mjs`)

```js
function renderCampus(container,campusId,language,{headingId}={}){
 const campus=campusById.get(campusId);if(!campus)return null;
 const country=countryById.get(campus.country);
 return mountExplorerCampus({container,campus,locale:language,headingId,art:explorerArt,
  country:{id:campus.country,iso2:country?.iso2||null,name:countryName(campus.country),
   shape:explorerArt.shapes?.countries?.[campus.country]||null,flagHref:explorerArt.flagHref(campus.country)}});
}
```
(Top-level function, closing `}` at column 0: the vm extraction of `campus-details.test.mjs` reads it. Its free names —
`campusById`, `countryById`, `countryName`, `explorerArt`, `mountExplorerCampus` — are exactly what that test's vm
context provides, §9.1 D.)

### 7.4 `site-b/explorer-campus.mjs` and `.css` (B, rewritten)

```js
import {resolveCampusWebsite} from './campus-website.mjs?v=1';
import {openMediaViewer} from './media-viewer.mjs?v=1';
export function mountExplorerCampus({
  container,             // the selector's div.explorer-campus-body (already in the document)
  campus,                // enriched: {id, name, country, address, coordinates, sourceUrl, websiteUrl?, websiteLocales?, profile?, logo?}
  country,               // {id, iso2, name, shape|null, flagHref|null}
  locale = 'fr', headingId,
  art = null,            // explorerArt (no static import of explorer-art.mjs); absent → no logo, no locator drawing, no icons (texts stay)
  now = new Date(), onCopyAddress, onOpenMedia = openMediaViewer,
}) → {element, heading, lantern /* span.explorer-sheet-lantern | null */, logo /* the heart's printed logo | null */,
      heartItems, wings: {start, end}, destroy()}
```

- `lantern` and `logo` exist iff `campus.logo?.print` exists and `art.createPrintedLogo` returned an element; any `art`
  call may return `null`, and B then appends nothing (no empty icon slot).
- **DOM contract (D13)** — the same list binds B's code, B's fake and D's fake in `campus-details.test.mjs`:
  - *Required* (B calls them unconditionally; every fake implements them): document `createElement(tag)`,
    `createElementNS(ns, tag)`, `baseURI`, `defaultView` (an object, possibly without any of the optional members);
    element EventTarget methods (`addEventListener`, `removeEventListener`, `dispatchEvent`), `append(...elements)`
    with **Element arguments only** (text always through `textContent` on a `span`, `bdi`, `time`, `p`, `a`… — never a
    string or a Text node), `remove()`, `setAttribute(name, value)`, `getAttribute(name)`, `closest(selector)` with a
    single tag name or a single `.class`, reads of `parentElement` and `children`; writes of the properties
    `textContent`, `className`, `id`, `lang`, `dir`, `hidden`, `inert`, `tabIndex`, `href`, `hreflang`, `rel`, `target`,
    `type`, `disabled`, `alt`, `src`, `loading`, `decoding`, `width`, `height`, `dateTime`; `dataset` (B writes `data-*`
    only through it). ARIA attributes, `role` and SVG attributes go through `setAttribute`.
  - *Optional* (B tests each before use and works without it): `removeAttribute`, `replaceChildren`, `contains`,
    `getBoundingClientRect`, `style?.setProperty`, numeric reads of `clientWidth`, `clientHeight`, `scrollHeight`,
    `scrollTop` (missing → 0, so the cascade settles on `full`), `doc.fonts?.ready`, `defaultView.ResizeObserver`,
    `defaultView.matchMedia`, `defaultView.navigator?.clipboard`, `element.animate`.
- `destroy()`: closes the media viewer, disconnects the ResizeObserver, removes the MediaQueryList listeners, cancels
  the ping, removes the root, prevents late clipboard statuses.
- CSS: every rule scoped under `.explorer-sheet` (plus the allowed `section.explorer-campus[data-density]` prefix); only
  `--hx-*` tokens and A's `--control-glass-*` (photo pager); icons through `art.icon`.

### 7.5 `site-b/welcome.mjs` (D) — complete list of changes

1. Imports: `./explorer-selector.mjs?v=b1` → `?v=b2`; remove `import {mountCampusDetails} from './campus-details.mjs?v=10';`;
   add `import {ensureArtDefs,createSilhouette,createDots,createPrintedLogo,fitLogo,icon} from './explorer-art.mjs?v=b2';`
   and `import {mountExplorerCampus} from './explorer-campus.mjs?v=b2';`. No static import of `explorer-shapes.mjs`.
2. Before `const explorer=createExplorerSelector(…)`, one line:
   `const explorerArt={shapes:null,ensureArtDefs,createSilhouette,createDots,createPrintedLogo,fitLogo,icon,flagHref:id=>{const country=countryById.get(id);return country?.iso2?'assets/flags/'+country.iso2.toLowerCase()+'.svg':null;},logo:id=>campusById.get(id)?.logo?.print||null};`
   (the arrow functions read `countryById` / `campusById` lazily) and pass `art:explorerArt` to the selector.
3. A new top-level function (not extracted by the vm tests, which inject a fake):
   ```js
   function loadExplorerShapes({signal}={}){
    const load=import('./explorer-shapes.mjs?v=b2').then(module=>module.SHAPES||null,()=>null);
    // A module that arrives after the abort still draws the silhouettes.
    load.then(shapes=>{if(shapes&&!explorerArt.shapes){explorerArt.shapes=shapes;explorer.localize();}});
    return Promise.race([load,new Promise(resolve=>signal?.addEventListener('abort',()=>resolve(null),{once:true}))]);
   }
   ```
4. `loadNetworkData`: the `Promise.all` gains `optional('./campus-logos.json?v=b2')` and `loadExplorerShapes({signal})` as
   its fifth and sixth entries; in the `.then` set `explorerArt.shapes=shapes||explorerArt.shapes;` before
   `network=dataset`; each campus gets `logo:logos?.campuses?.[campus.id]||null`; in the late-success branch
   (`if(loadFailed){…}`) also `byId('explorer').removeAttribute('aria-describedby');`.
5. `renderCampus` as in §7.3.
6. `resetScope`:
   ```js
   function resetScope(){
    if(!network)return;
    if(scope.level!=='world'||explorerState().list){setContentScope(geographicScope({}),{explorerList:null});return;}
    if(entryOpen&&explorerView?.key==='continents'&&explorer.setCursor('world'))return;
    syncExplorer();
   }
   ```
7. `prepareExplorer`: on success, with `byId('loading').hidden=true`, call `byId('explorer').removeAttribute(
   'aria-describedby')`; on error `byId('explorer').setAttribute('aria-describedby','loading')`.
8. Nothing else changes (copy, routes, history, announcements, dice, `applyRoute`, `syncExplorer` — no `trail`). Every
   top-level function keeps its closing `}` at column 0; one-liners stay one-liners.

### 7.6 Pages and cache keys (D, H8)

| File | Change |
| --- | --- |
| `index.html` | `welcome.mjs?v=b2`; after `design-review-selection.css?v=1`, in this order: `explorer-art.css?v=b2`, `explorer-selector.css?v=b2`, `explorer-campus.css?v=b2` |
| `content-preview.html` | `content-preview.mjs?v=b2`; the same three stylesheets |
| `content-preview.mjs` | `./welcome.mjs?v=b2` |
| `welcome.mjs` | §7.5 keys (`explorer-selector`, `explorer-art`, `explorer-campus`, the dynamic `explorer-shapes`, `campus-logos.json`, all `b2`) |
| `explorer-selector.mjs`, `explorer-campus.mjs` | no import of `explorer-art.mjs` (injected) |
| unchanged keys | `continents.mjs?v=b1`, `explorer-model.mjs?v=b1`, `explorer-band.mjs?v=b1`, `entrance.*?v=b1`, `content-geography.mjs?v=b1`, every A key |

Assets (flags, prints, SVG logos) load without a key. `campus-details.css?v=12` stays linked (unchanged, harmless). No
sprite change. `#explorer` keeps `aria-describedby="loading"` in both pages' markup; D's code removes it when ready.

---------------------------------------------------------------------------------------------------------------

## 8. File ownership (no file has two owners)

| Builder | Owns (creates or edits) | Delivers to the others |
| --- | --- | --- |
| **A1 — data** | `site-b/tools/build-explorer-shapes.mjs`, `site-b/explorer-shapes.mjs` (regenerated), `site-b/explorer-shapes.test.mjs`, `site-b/tools/build-campus-logo-prints.py` (new), `site-b/assets/campus-logos/print/*` (new), `site-b/campus-logos.json` (the `print` field), `site-b/campus-logos.test.mjs` (new) | the regenerated shapes (§6.1–6.2); the prints and the manifest field (§6.3) |
| **A2 — art** | `site-b/explorer-art.mjs`, `site-b/explorer-art.css`, `site-b/explorer-art.test.mjs` (all three rewritten) | **first deliverable**: the tokens and the API of §7.1 working on the current shapes module (pre-metadata tolerant, world without sphere) |
| **B — campus sheet** | `site-b/explorer-campus.mjs`, `site-b/explorer-campus.css` (rewritten), `site-b/explorer-campus.test.mjs` (new), its fit harness in the scratchpad (§5.6) | `mountExplorerCampus` (§7.4), DOM and classes (§5.2), the harness report (H2i) |
| **C — selector** | `site-b/explorer-selector.mjs`, `site-b/explorer-selector.css`, `site-b/explorer-selector.test.mjs` (all rewritten on the same behaviour) | `createExplorerSelector` + `setCursor` + the pure layout functions (§7.2), the campus frame (§5.1) |
| **D — integration** | `site-b/welcome.mjs`, `site-b/index.html`, `site-b/content-preview.html`, `site-b/content-preview.mjs`, `site-b/tests/explorer-filter.test.mjs`, `site-b/campus-details.test.mjs`; and, only if its `welcome.mjs` edit breaks them, the three tests that read `welcome.mjs` (`site-b/tests/profile-navigation-scope.test.mjs`, `site-b/tests/content-pagination-history.test.mjs`, `site-b/tests/project-team-routing.test.mjs`; report each change); scratchpad smoke scripts | the wired pages, both suites, the smoke |

- **Partial atlas files** (left by the stopped build; the lead keeps a copy in `$SCRATCH/site-b-atlas-partial/site-b/`):
  `explorer-art.mjs/.css/.test.mjs` → **rewritten** by A2 (it may reuse the path parser, `flagMatrix` and the URL
  handling of `createPrintedLogo`; rings, coast, focus band, pins, lamp and atlas tokens go); `explorer-campus.mjs/.css`
  → **rewritten** by B (it may reuse the A-behaviour helpers: `parsedDate`, `dateText`, `safeURL`, the Piscine
  filtering, the clipboard flow, the media-viewer call, the website notes; DOM, classes, layout and copy follow §5);
  the generator's partial metadata → **kept** by A1 with the two changes of §6.2; `explorer-shapes.mjs` → regenerated
  by A1. No file is removed (every partial file has an owner).
- Nobody edits a file listed for another builder; nobody edits `explorer-model.mjs`, `explorer-band.mjs`,
  `continents.mjs`, `entrance.*`, `campus-details.mjs/.css`, any other B file, `site/`, `shared/`, `studies/`, documentation
  files (the PROVENANCE files included). A1 changes neither `URALS`, nor the drop boxes, nor the MAR rule.
- B and C never import `explorer-art.mjs` statically; they receive it through `art` (§7.2, §7.4), test with fakes, and add
  contract tests that dynamically import the real `explorer-art.mjs` and `explorer-shapes.mjs` and **skip** while their
  producer's work is missing: gates « `explorer-art.mjs` exports `fitLogo` and `ensureArtDefs` » and
  « `SHAPES.world.sphere` exists ».
- Order: A1, A2, B and C start together; A2 delivers its API first; D starts its test-harness changes at once, wires the
  runtime when A, B and C report, and can finish only after B (the wiring tests of `campus-details.test.mjs` mount the
  real sheet); D runs the suites and the smoke last. A builder that finds a contract problem reports it to the lead
  instead of editing another builder's file.
- **Tests while building** (bash, from `/home/le-rif/Bureau/Transcendence`). The neutral baseline is the 42 test files
  that read no file any builder changes:

  ```bash
  NEUTRAL=$(ls site-b/*.test.mjs site-b/tests/*.test.mjs | grep -Ev 'explorer-shapes|explorer-art|explorer-selector|explorer-campus|campus-logos|campus-details|explorer-filter|profile-navigation-scope|content-pagination-history|project-team-routing')
  node --test $NEUTRAL                      # today 459 / 459
  ```

  | Builder | Command (plus `node --test $NEUTRAL`) | Today |
  | --- | --- | --- |
  | A1 | `node --test site-b/explorer-shapes.test.mjs site-b/campus-logos.test.mjs`; the generator and the prints with `--check` (§6.2–6.3) | shapes 11 / 12 (the key-set test fails until A1 regenerates); logos test new |
  | A2 | `node --test site-b/explorer-art.test.mjs` | 16 / 16 (the atlas partial, replaced) |
  | B | `node --test site-b/explorer-campus.test.mjs`; the fit harness (§5.6) | new |
  | C | `node --test site-b/explorer-selector.test.mjs` | 27 / 27 (rewritten) |
  | D | `node --test site-b/tests/explorer-filter.test.mjs site-b/campus-details.test.mjs site-b/tests/profile-navigation-scope.test.mjs site-b/tests/content-pagination-history.test.mjs site-b/tests/project-team-routing.test.mjs` | 14 / 14, 19 / 19, and 13 / 13 for the three |

  A builder never runs another builder's test files during the work (they follow another builder's rewrite). Today's
  whole B suite: 560 tests in 50 files, 559 pass; the only failure is `explorer-shapes.test.mjs` « one silhouette for
  the world, each continent… » (it expects `['viewBox','d']` while the partial module already carries metadata). D runs
  the full suites at integration (§9.2).
- Chrome: one instance at a time on the machine (the helper's slot lock serialises), always with
  `HORIZON_CHROME_MIN_FREE_MB=900 HORIZON_CHROME_MEMORY_MAX=1400M`, through
  `studies/design-review-studies/checks/helper.py` (read-only); scripts and evidence in the scratchpad.

---------------------------------------------------------------------------------------------------------------

## 9. Test plan and verification matrix

### 9.1 node:test (each builder: its own files plus the neutral baseline, §8)

Constraints: Node 20; files that extract controller functions from `welcome.mjs` in a vm need every top-level function to
close with `}` at column 0 (D keeps this); test fakes use only the APIs of §7.2 and §7.4 (B's and D's fakes implement
the « required » list of §7.4 exactly, no more); exact strings produced by `Intl` (dates, ranges, numbers) are built
with `Intl` in the test itself (Node's ICU and Chrome's differ).

**A1**
- `explorer-shapes.test.mjs` (updated; the lead's tests kept: Morocco with Western Sahara, the Urals split, `clipSide`,
  the rectangle clipper, Visvalingam, refused source, frozen module and provenance): key sets and order of §6.1 (this
  replaces today's `['viewBox','d']` assertion); the fit test « each viewBox has a long side of 100 … centred » **exempts
  `world`** (its land box `[2, 2, 98, 90.9]` is off-centre by design: the frame is the sphere's) and keeps every other
  shape; the world is the globe (viewBox `0 0 100 100`, `sphere` `[50,50,48]`, every vertex of `d` within 48.2 units of
  (50, 50), label `[50,50]`, `pins` exactly the 51 ids of Appendix B, the header names the 7 hidden campuses and the
  centre 12°E 24°N and no longer says « Natural Earth 1 », « pole is in Siberia » or « world: all of them »); every
  continent and country label equals `haloLabel` recomputed on its largest polygon parsed from `d` with the box centre
  (±0.15) and the Appendix B value (±0.2), lies inside that polygon with a clearance ≥ 3 units; `box` = the outline bbox
  (±0.05); pins: continents exactly their campuses (6 / 4 / 16 / 32), countries exactly theirs, every pin inside or
  within 1.6 units of the outline; `cuts` only on europe and asia, ≥ 1 run each, every point an outline vertex, runs ≥ 2
  units; flag rectangles per `FLAG_RULES`; `focus` exactly for the 12 emblem countries and equal to the rounded
  `polylabel` point of the largest polygon (JOR: its `at` point), i.e. unchanged by the new labels; module < 125 KB;
  unit tests: `haloLabel` on a square (its centre) and on an L shape (inside the thick arm, closer to the box centre than
  polylabel's point), `GLOBE` frozen `{centre:[12,24], limb:0.12}`.
- `campus-logos.test.mjs` (new): 58 entries with `print` as their last key; kinds (`sticker` = `['codam']` only; the 4
  SVG masks keep their original `src`); every `src` exists and its `sha256` / `bytes` match; `width`/`height` equal the
  IHDR size of every PNG `src` (the 50 prints and Codam's original) and the viewBox of the 4 SVGs; `aspectRatio` =
  width/height (4 decimals); the four 1337 share one print; every file of `print/` is referenced; total print bytes
  < 600 KB; prints are mode `LA` with L = 0 (IHDR colour type 4 and the first decoded row's L values).

**A2 — `explorer-art.test.mjs`** (rewritten, rich fake DOM):
- `ensureArtDefs` idempotent, first child of `body`, never `display:none`, six gradients with `var(--hx-…)` stop colours.
- `createSilhouette` for each kind and variant — world with `sphere`, world without `sphere` (drawn as a continent),
  continent with cuts, continent without, country item, country locator: layer order and classes of §4.3; **the last
  shape layer is `path.hx-outline` whose `d` is the shape's, with the svg as its only ancestor inside the art (no mask,
  clip or `g`)**; the world also has `circle.hx-outline` on its sphere; the locator's ring and dot follow the outline;
  **every stroked layer (`.hx-rim`, `.hx-flag-rim`, `.hx-sea-rim`, `.hx-outline`, `.hx-dot`, `.hx-locator-dot`,
  `.hx-locator-ring`) is a `path` or `circle` element, never `use`**; country: underlay, 640×480 image placed by
  `flagMatrix(shape.flag)`, sheen rect, flag rim; locator: soft land, rim, no image, dot and ring at `hotPin`;
  europe and asia: one filter (`feGaussianBlur` `stdDeviation = 5/k`), fade and clear masks with one polyline per run
  (`stroke-width` 20/k and 36/k), body under fade, rim under clear, outline outside both; other shapes: no filter, no
  mask; ids unique across calls and every `url(#…)` resolves in its own SVG; the only filter primitive is
  `feGaussianBlur`; tolerance of pre-metadata entries.
- `createDots` (one circle per pin, sorted, radius rule, empty without pins); `createPrintedLogo` (mask span with sizes
  and absolute URL, sticker image with sizes, null for missing or unsafe); `fitLogo` (width-limited, height-limited,
  `minH`, unknown aspect); `flagMatrix` math; `icon` for every `ICON_NAMES` entry, null for an unknown name.
- CSS (parsed text of `explorer-art.css`): every token of §2.1 in both themes, the width tokens included; the stroke
  widths of `.hx-rim`, `.hx-flag-rim`, `.hx-sea-rim`, `.hx-dot` and the forced-colours `.hx-outline` are
  `calc(var(--hx-…-width) / var(--s, 1))` with `vector-effect:non-scaling-stroke` (the locator's fixed 2 / 1.4 px
  strokes live in the sheet, where `--s` is 1); the
  `--hx-logo-glow*` stops have alphas that never increase from the centre outward and no two equal consecutive stops
  (no flat core), and the light ones start without white; the forced-colours block of §2.7 (`.hx-flag` hidden,
  `.hx-land,.hx-sea{fill:Canvas}`, `.hx-outline` shown with `--hx-outline-width`); no `.explorer-` selector; no colour
  literal in the module.

**B — `explorer-campus.test.mjs`** (B's fake DOM implementing exactly the required list of §7.4, its `append`
throwing on a non-Element; a fake `art`):
- Paris FR/EN/AR (lantern with the logo fitted to `.76·d × .36·d`, `handle.logo` that element; h2 with `headingId`,
  `tabindex=-1`, `<bdi>`; country line with the flag image; facts « 2013 » in `time[datetime=2013]` and « 5 000+ » in a
  `dir=ltr` span with labels « Ouverture » and « Étudiants · en 2025 »; Source links with A's text and `aria-label`
  « Source. S’ouvre dans un nouvel onglet »; website pill per language with `hreflang` and `aria-label`, and in Arabic
  A's fallback-language note; verified `time`; two photos with depths 0/1, the back print `aria-hidden` and `inert`,
  count « 1 / 2 », a turn updating depths, count and credit, the media viewer called with `{items, index, locale,
  trigger}`; three contacts with mailto links and their Source; address text, copy success / denial / missing clipboard /
  destroyed, directions URL; with `now = 2026-10-24` two upcoming Piscines, « Prochaine » on the first, `formatRange`
  text, `data-starts-on/ends-on`, note, dates link; the missing line exact).
- Mulhouse (`now = 2026-10-08`: four photos; opening « novembre 2021 » in `time[datetime=2021-11]`; « 413 » with « en
  2024 »; no upcoming Piscine → checkDates + piscinesNote + dates link; four contacts incl. `tel:` and an https form link
  in a new tab); Lyon (`data-sparse=true`; locator through `createSilhouette` with `variant:'locator'` and
  `hotPin:'lyon'`, after `ensureArtDefs`; caption « Où se trouve 42 Lyon »; no contacts section; no facts; checkDates +
  the website as dates link; the missing line exact); an ongoing Piscine → « En cours »; ended and imprecise ones
  removed; unsafe contact → plain text.
- Handle shape `{element, heading, lantern, logo, heartItems, wings, destroy}` (`lantern` and `logo` null without print
  or when `art.createPrintedLogo` returns null; `heartItems` in order); `art` null → the sheet still mounts with every
  text.
- `data-layout` from a fake `matchMedia` (1440 → `wide`, 1024 → `stacked`, 390 → `single`, tiny density → `single`, no
  `matchMedia` → `wide`) and its update on a `change` event.
- Fit cascade with fake sizes: wide + normal overflowing → `snug` → `tight` → `tighter` → `scroll` (each step tried in
  order; the first that fits is kept); not wide, or density not normal → `full` without measuring; the ResizeObserver
  observes only the container with `{box:'border-box'}`; a callback with an unchanged size, density and layout runs
  nothing; a size change re-runs the cascade; a Copy press never re-runs it; `fonts.ready` runs it once.
- `destroy()` (viewer closed, observer disconnected, MediaQueryList listeners removed, root removed, no late status);
  no focusable element inside `aria-hidden` or `inert` content; `lang`/`dir` on the root; CSS text: every rule under
  `.explorer-sheet` (or the allowed density prefix), no width media query, Source links of facts and contacts with
  `min-block-size:24px`.

**C — `explorer-selector.test.mjs`** (rewritten on the new DOM; every behaviour test of the current file kept in
substance):
- One Enter → one validation; auto-repeated Enter keydowns are swallowed and never validate again; a detail-0 click
  validates that item; a pointer click positions then validates only the item that was the cursor at `pointerdown`;
  detail > 1, clicks < 350 ms after a level change and clicks on the outgoing level are ignored; drag (the items layer
  follows, release steps by `round(−dx·dir/x1)`, swallowed click, vertical pan, cancel, touch capture, RTL); Prev/Next
  keep focus, clamp with `aria-disabled`, announce; arrows/Home/End with the RTL swap; ignored keys (modifiers,
  composition, dialog, fields, non-item targets); Escape/Backspace ascend from anywhere but L1 and **once while held**;
  focus hand-over rules and `focus()` targets; the outgoing level inert and `aria-hidden`, then removed (at once under
  reduced motion); the same key keeps nodes and the UI cursor by id after a re-sort; the campus screen (section labelled
  by the sheet's heading, heading focused, back pill present with one campus too, pills validate, focus kept on the
  activated pill, `aria-current` moves, the list scrolls only itself, `renderCampus` re-run only on campus or locale
  change with `{headingId}`, called after `data-density`, `--explorer-band`, the tiny order and `data-entering` are set
  and the section is inserted); one-item level; wheel (one step per gesture, reading direction, zoom gestures
  untouched); no `animate()` under reduced motion and cancellation when it turns on; `destroy()` (listeners, observers,
  the MediaQueryList listener, timers, pending frames).
- Pure functions: `haloGeometry` values of both tables of §3.4 (±1 px for the given `H`); `floorAt`; `layoutItems`
  (offsets, scales, distances — desktop ±2, phones ±1 with ±2 at `x1 + 400`, « out » items —, RTL mirror, `x` the centre,
  feet on the horizon `y + bh = BLEED + floor(dist)`, button widths without overlap (desktop narrowing and phones),
  `nk`, `ns`, `ms`, `mt`, `gx` (un-narrowed `itemW`), `lk` with the worked values of §4.10 through a real-formula
  `fitLogo`, the fade formula (58.2 / 64 / 38 at 390 L1, 390 L3, 320), `nmax` and `nx` on phones, R20 at 768×1024 (no
  ±2), 1024×768 (a 40 px ±2 name shown, a 42 px one « out ») and 1280×1024 (114 px), `visible`); `pagerDots` cases of
  §4.17.
- DOM: item attributes (`data-explorer-card`, `data-id`, `data-kind`, `data-off`) and aria-labels FR/EN/AR; the item
  transform `translate3d(calc(var(--x) - 50%), var(--y), 0) scale(var(--s))` with origin `50% var(--h0)`; **two
  layouts of the same item at different ranks differ only in `data-off`, tabindex, aria-label and the variables `--x
  --y --s --w0 --nk --ns --ms --mt --gx --lk --nx`** (no other inline size changes: no jump at the first frame);
  prompt with the sr-only step; group `aria-labelledby` and `aria-describedby` (the visible hint, following a fake
  `matchMedia` change); `data-instant` at insertion, the flush read, its removal after a fake frame; ResizeObserver
  re-layout instant; a re-layout during a glide clears `data-gliding`; on one Next at 1440 at most 6 items get
  `data-gliding`, on phones at most 4; L3 logo boxes through `art.fitLogo` and the `--lk` floors, phone neighbours'
  logos hidden; name-only items without `art` or shape; `localize()` after `art.shapes` changes from `null` builds their
  silhouettes; public `setCursor` true when moved or already there, false otherwise, without announcement, while the
  internal move still reports « changed » to `moveBy`; `data-stage-scroll` only for bands < 44 px, `focusNode` scrolling
  only then; tiny mode moves the foot before the body and back, restoring the focus; `data-fade-start/end` from fake
  scroll sizes on the body and the list (RTL included).
- Compact row: every item's `--s` is 1, `min-block-size:44px` in the CSS, positions from fake `getBoundingClientRect`
  widths with 26 px gaps and the cursor centred.
- Campus entrance: after a level → campus `show()` with motion, a `click` with `detail:1` (and an `auxclick`) dispatched
  on an element of the section is `defaultPrevented` and does not propagate until the fake timer fires; `detail:0` passes;
  under reduced motion the guard still lasts 350 ms; a sibling switch sets no guard. The freeze: the leaving element
  gets `position:absolute` and `left/top/width/height` equal to its recorded box (fake rects), before the section is
  inserted. FLIP keyframes from a visible L3 cursor logo use the logos' own rects (`scale(a.width / b.width)`); the
  generic descend without one, and from the compact row.
- CSS text: the focus block of §4.13 (the ring on `.explorer-item:focus-visible > .explorer-go`, `outline:none` on the
  item, no other outline rule on `.explorer-item`); the glows' sizes from `--b0` / `--h0` with `scale(var(--gx),1)`; no
  `[data-band]`; no colour literal (masks' `#000` / `#fff` excepted).
- Contract test with the real model, art and shapes (skipped while absent, §8).

**D** — `tests/explorer-filter.test.mjs`: the `files` map gains `./campus-logos.json?v=b2`; the context gains `explorerArt`
(a plain object: `shapes:null`, the six art functions as stubs, `flagHref` and `logo` written as in §7.5 — the real
line cannot run in the vm, which has no imports) and a fake `loadExplorerShapes`
(resolving the real `SHAPES` or `null`); the `byId` fake gains `removeAttribute`; the `explorer` fake gains `setCursor`
and `localize`: requests list; `paris.logo.print.kind === 'mask'`, `codam.logo.print.kind === 'sticker'`; a failing
manifest leaves `logo:null` and a failing shapes import leaves `explorerArt.shapes === null`, neither fails the
catalogue; `explorerArt.shapes` set before `network`; `#explorer` loses `aria-describedby` on ready and on a late success
and gets it back on failure; Reset with only the cursor elsewhere calls `explorer.setCursor('world')` without history and
without `show()`. `campus-details.test.mjs`: the Element fake implements exactly the required list of §7.4 (it gains a
`closest` that matches `.class` as well as tag names, and an `append` that throws on a non-Element; A's
`campus-details.mjs` appends Elements only, so its 16 direct tests are unaffected); the vm context gains `countryById`
(a Map of `campuses.json` countries), `explorerArt` as a **fake** (`{shapes:null, ensureArtDefs(){}, createSilhouette:
()=>null, createDots:()=>null, createPrintedLogo:()=>null, fitLogo:(print,w,h)=>({width:w,height:h}), icon:()=>null,
flagHref:()=>null, logo:()=>null}`) and `mountExplorerCampus` (B's real function with `now` fixed); the two wiring tests
use `mountExplorerCampus` through `renderCampus` (`.explorer-sheet-cta` per language with `hreflang`, root outside any
dialog, heading id, destroy) and the Paris profile in FR/EN/AR (2 photos, opening 2013, 3 contacts, 2 Piscines through
`data-starts-on/ends-on`, « 5 000+ »); the 16 direct tests unchanged; the `exploreCampus` test unchanged.

### 9.2 Suites and invariants (D, then the lead)

- `node --test site-b/*.test.mjs site-b/tests/*.test.mjs`: all pass (report the count; today 560 tests, 559 passing).
- `node --test site/*.test.mjs site/tests/*.test.mjs`: 660/660.
- `node site-b/tools/build-explorer-shapes.mjs --source $SCRATCH/ne-source/ne_10m_admin_0_countries.geojson --check` and
  `python3 -I site-b/tools/build-campus-logo-prints.py --check`: up to date.
- `git status --porcelain -- site shared docs figma archives` empty; `studies/explorer-b-design/` byte-identical to
  `$SCRATCH/studies-explorer-b-design.sha256` (`sha256sum -c`).
- grep: no `studies/` import in `site-b`; no `feTurbulence`; no `getContext` in the Explorer modules; no colour literal in
  `explorer-selector.css/.mjs`, `explorer-campus.css/.mjs`, `explorer-art.mjs` (literals only in the token block of
  `explorer-art.css`, plus `#000` / `#fff` as mask stops — SVG masks and CSS `mask-image` gradients — and system colours
  in forced-colours rules); `--hx-` custom properties defined only in `explorer-art.css`; no `innerHTML` in the new
  modules; no `<use` with a stroked class (`hx-rim`, `hx-flag-rim`, `hx-sea-rim`, `hx-outline`) in `explorer-art.mjs`;
  every new or changed module, stylesheet and JSON URL carries `?v=b2` (assets excepted).

### 9.3 Browser verification matrix (lead; Chrome headless through `helper.py`, one at a time)

Pages: `site-b/content-preview.html#explore…` (and `index.html` for the arrival). Every run sets the language and the
theme explicitly on each page and checks them (`documentElement.lang`, `dataset.theme`) before measuring: the site keeps
both in `localStorage` across navigations. States: L1 (cursor Monde and Europe), L2 Europe (cursor France), L2 Monde
list, L3 France (cursor 42 Paris), Paris, Lyon, Mulhouse; spot states: Albanie (one campus: back pill alone), Pays-Bas
(Codam sticker), Belgique (SVG masks), Japon, Corée, Maroc, Madagascar, Portugal, Jordanie (flag rules), Asie and Europe
(Urals cut; Baltic and Azov holes), Turquie (hole), the Monde globe.

| Viewport | Languages × themes × states |
| --- | --- |
| 1440×900, 390×844 | FR, EN, AR × light, dark × L1, L2, L3, Paris, Lyon |
| 1280×720, 320×640, 667×375 | FR light and AR dark × L1, L2, L3, Paris, Lyon |
| 768×1024 (touch), 1024×768 | FR light and AR dark × L1, L2, L3, Paris |
| 1366×768, 1280×1024 | FR light × L1, L2, L3, Paris |
| 853×480, 640×360 (zoom) | FR light × L2, Paris |
| spot states | 1440×900 FR light and dark |

At 320×256 (1280×1024 at 400 %, a known limit, §3.1) only a smoke run: FR light L1, no JS error, the cursor reached and
validated by keyboard.

**Design-parity gate (blocking, lead).** B against the mock-up's own screenshots, 20 pairs: L1 (cursor Europe), L2
Europe (cursor France), L3 France (cursor 42 Paris), Paris, Lyon × 1440×900 light and dark × 390×844 light and dark,
against `$SCRATCH/design-shots/halo/{d1440,m390}-{light,dark}-fr-{l1,l2,l3,paris,lyon}.png`, laid side by side in
contact sheets in the scratchpad. Only B's build is compared (the prototype's rim renders are not evidence, Appendix C).
Mechanical part: per pair, the cursor's art box centre within ±4 px horizontally and ±12 px vertically of the
mock-up's (B's band is 4 px shorter), its size within ±8 %; the cursor glow's box (`.explorer-glow-cursor`, on screen)
within ±8 % of `1.9·itemW × 1.75·boxH` and centred within ±4 px of the box centre; the horizon's drop at ±1 within
±3 px; the pool at the cursor's feet; at 1440 the sheet's three column boxes within ±16 px. Visual part: the lead signs
off in the report — same composition, light, horizon, pool and glows; the intended differences only (the R list of
§1.4: names hugging their glyphs, dots above names, contoured pale flags, discless L3 logos, the clean Urals cut, the
phone fades, the dark pink, the fit cascade, the focus ring on the chip) — before anything is shown to the user.

Flows (motion on, then reduced): keyboard L1 → Enter → L2 → arrows → Enter → L3 → Enter → sheet → Tab through the sheet
and the strip → pill switch → Escape ×4 (focus, URL, history length and announcements at each step; a held Escape
ascends once; after each arrow press a screenshot shows the ring around the chip and no frame around the item), in FR
and in AR (arrow swap, mirrored chevrons, focus hand-over); pointer: side item click positions, second click validates,
a double click validates one level only, **« Valider » on 42 Paris then a second click at 400 ms where the website pill
appears → no navigation and no new tab**, a wheel burst moves one step; touch (390×844): swipe, tap the centre, tap a
peeking neighbour; scope bar ← and Reset (cursor-only case without history); language switch on each level and in the
sheet (scroll kept); theme switch without re-render (node identity of item SVGs kept); dice; Back/Forward into a sheet
(generic transition).

Measurements:
- **Contrast on rendered glyph pixels** for every text of `#explorer` (method of `proto/glyph_contrast.py`), at 1440 and
  390, light and dark, including the sheet at both ends of its scroll and the strip: ≥ 4.5:1.
- **Names over shapes (H2a, H2g; D4)** — method of `$SCRATCH/halo-final/probe/names_measure3.py`, on B's build: for every
  visible name (opacity ≥ .5) of the cursor, ±1 and ±2, a glyph mask from a fill-only render (fill #FF00FF, no stroke, no
  shadow; mask = pixels changed by more than half the maximum change); background = the median of the composited pixels
  (stroke and shadows on) in the ring 1–2 px outside the mask; foreground = the 10th (dark ink) or 90th (light ink)
  percentile of the glyph pixels; ratio ≥ 4.5:1. At 1440×900 and 1280×720, light and dark, FR and AR (the prototype
  measured AR in light at 1440 only; the build is measured in both themes), on L2 Europe
  (cursors DEU, BEL, ALB, FRA, ITA, LUX, POL, AUT), L2 Africa (AGO), L2 Asia (JOR, PSE, ARE, JPN, SGP), L2 Americas
  (CAN) and L1 (cursors Europe and Asia: white continent names on the dark land #2C8C88, ≈ 4:1 without halo). Named
  worst cases: light DEU, BEL, ALB, AGO, JOR, PSE, ARE, Europe; dark FRA, ITA, LUX, POL, AUT, JPN, SGP, CAN, Asia.
- **No rectangle (H2a)**: per name, in the differential render (halo on vs off), the share of the non-glyph pixels of the
  glyph box grown by 2 px whose ΔL* ≥ 10 is ≤ .85 for every name, and its median ≤ .65 per theme and size (prototype,
  4 px: max .80, medians .40–.61; halo's `.28em`: max .97, medians up to .80); the stroke's on-screen width is 4 ± .5 px
  (computed width × the scale chain); a 2× review of the differential shows no straight edge. Every dot of the cursor is
  visible (its centre pixel is the dot colour).
- **Stroke widths (D2)**: at 1440 light and dark, the rim (Europe as cursor, ±1, ±2) and the flag rim (France as cursor,
  ±1, ±2) measure 1.2 ± .3 px on screen (dark flag rim 1.4 ± .3), as the integrated ink across the outline at 4 points
  (method of `$SCRATCH/halo-final/probe/probe_stroke_scale.py`); the forced-colours outline 1.5 ± .3 px.
- **Pale flags (H2b)**: France, Italy, Luxembourg, Japan, Singapore as cursor and neighbour at 1440 light: along the
  outline the rim differs from the page by ΔE2000 ≥ 6.
- **Cuts (H2e)**: Europe and Asia as cursor and neighbour, light and dark, 1440 and 390, at 2×: no rim pixel within 12 px
  of a run, the fill's alpha ramp ≤ 22 px wide at the cursor, no straight edge (review at 2×), the shadow fades with the
  body.
- **L3 glows (H2c)**: in light and in dark, at 1440, the lantern background along 8 rays from each visible logo's centre
  (logo ink pixels excluded, 1 px steps): in light never lighter than the page (L* ≤ page + 1); in both themes no step
  (|ΔL*| ≤ 1 between adjacent samples) and monotonic toward the page within ±.5 (no plateau edge, no disc); neighbours'
  logo ink heights ≥ 28 px (±1) and ≥ 22 px (±2) at 1440, 1280 and 1024.
- **Phones (H2d)**: at 390 and 320, every visible text node lies fully inside the viewport and outside the fades; the L3
  neighbours' logos have opacity 0; the edge fade has the width of §4.19 and never covers the cursor's button.
- **Tablets (D8)**: at 768×1024 and 1024×768, FR and AR, L1, L2, L3: every visible item's art box lies inside the
  viewport and every visible name where the fade is ≥ 60 % opaque (no cropped fragment with a partial label); the
  « out » items are the ones R20 predicts.
- **Glide continuity (D10)**: one Next at 1440 (L1, L3), 1280 (L2) and 390 (L2), motion on: sampled every frame, each
  gliding item's art centre on the first frame is within 1 px of its resting centre before the move, and moves
  continuously after; one Layout event at the start of the glide, none during it.
- **No layout drift (H2j)**: after each level change (descend and ascend, motion on and off, and after a resize), every
  visible item's box bottom within 1 px of `floorAt(dist)` and its scale equal to the layout's; during the exit that
  follows a band move (campus entry and exit), the outgoing element's first painted frame within 1 px of its last
  resting position (the freeze, §4.22).
- **Hit testing** (1440, 1280, 1024, 768, 390, 320 × L1, L2, L3): `elementFromPoint` at each visible item's art centre
  and 2 px inside its button corners (→ that item), at gap midpoints and on glow-only points (→ no item), on the pool,
  the head and the foot (→ never an item), at the centres of Prev and Next (→ those buttons); during the campus entrance
  a pointer click on the pill's position does nothing (flow above).
- **Target size**: every control ≥ 44 × 44 on screen (cursor item, Prev/Next, compact-row items cursor and neighbours,
  strip pills, back pill, photo pager, Copy, Directions, website pill); text links ≥ 24 px tall (facts' and contacts'
  Source links included; the credit's inline link exempt) with ≥ 8 px between adjacent targets.
- **Focus rings**: for each control type, in both themes, the ring lies inside every clipping ancestor, is under no mask
  (the track's edge fade, the list's and the body's fades) and outside the capsule and the dock; on items the ring is
  the chip's box grown by 3 + 2 px, nothing outlines the item, and the ring is ≥ 3:1 against the pixels just outside it;
  the h2 has no outline after a keyboard validation.
- **Sheet (H2i, H7)**: at 1440×900, B's fit harness on B's real content reports `scrollHeight ≤ clientHeight` for Paris
  AR (light and dark, system font) — the H2i proof — and the steps chosen for Paris FR/EN, Lyon FR/EN/AR, Mulhouse
  FR/EN/AR (reported); the website pill and the strip inside the viewport without scrolling at 1280×720, 1366×768,
  1280×1024, 1024×768, 768×1024, 390×844 and 320×640; at 667×375 and 640×360 the strip at the top of the band, nothing
  of the sheet under the capsule or the dock once scrolled to the end, every focused control scrolled clear; no fade
  over text at either end of a scroll; no element with a background box (panel) behind the sheet; glows and shadows
  are cut only at the scroller's top and bottom edges (recorded, §1.1), never at the screen's sides.
- **Accessibility tree** (CDP `Accessibility.getPartialAXTree`): `#explorer` without description once ready (« Le monde
  se prépare… » gone) and with it again on catalogue failure; the group's name = prompt + step, its description = the
  visible hint only; item names (§4.11); the strip `nav` name and `aria-current`; the photo status; no focusable element in
  `aria-hidden` content; the h2 focused after each validation; the outgoing level absent.
- **Forced colours** (`Emulation.setEmulatedMedia` `forced-colors: active`, then also `prefers-color-scheme: dark`): L1
  (Monde, Europe and Asia — the Urals cut drawn by the outline), L2 Europe (Italy, Luxembourg, France), L3, Paris, Lyon
  (the locator), the strip and the compact row: a CanvasText outline on every silhouette (the globe's land and sphere,
  the continents, every country, the Lyon locator); flag images hidden; names in CanvasText on Canvas without any box;
  mask logos and the Codam sticker visible; no frame around any item; the focused cursor's chip ringed in Highlight;
  chips and pills bordered; no glow, pool or horizon.
- **Reduced motion**: no `animate()` call (instrumented), `transition-duration:0s` on items and their sub-elements,
  photos, strip; no ping; the campus entrance guard still 350 ms.
- **Animations settle**: `document.getAnimations()` is empty after a language switch and after `document.fonts.ready`
  (the instant protocol, §4.15).
- **Performance**: 390×844 DPR 2, motion on, `Emulation.setCPUThrottlingRate {rate: 4}`, L2 Europe, six Next activations
  700 ms apart: median frame interval ≤ 20 ms, p95 ≤ 40 ms, no task > 100 ms, ≤ 4 Layout events per glide, `will-change`
  on ≤ 4 elements at mid-glide (≤ 6 at 1440).
- **Network**: every request under `/site-b/` or `/shared/` (favicon excepted), no 4xx/5xx, no `studies/`, no CDN,
  `explorer-shapes.mjs` requested once per page. **No JS errors** (`qaErrors` empty, no « ResizeObserver loop »
  message) in every run; **no duplicate ids** in any state, including mid-transition; **text spacing** (WCAG 1.4.12
  injected) on L2, L3, the compact row and the Paris sheet: no text clipped, no overlap.

Not verifiable here (say so in the report): real screen readers, physical phones, real GPUs, other machines' Arabic
fonts. Known limits (documented): hidden carousel items stay in the accessibility tree at opacity 0 (their names carry
« i sur n »); pointer-emulating assistive technology needs two activations on a side item (SPEC-B); counter-scaled names
are not enlarged by the browser's minimum font size; the globe shows 51 of the 58 campuses (§4.6); the Arabic metrics
are this machine's (§2.3); 400 % zoom (§3.1); stroke widths follow the item's scale during a glide (R27).

---------------------------------------------------------------------------------------------------------------

## 10. Acceptance criteria

The build is accepted when every line holds (check in brackets).

1. L1/L2 items are silhouettes standing on halos along the curved horizon: Monde is the globe, continents are land with
   their campus dots, countries carry their clipped flag with their name over the shape; no card, block or box around any
   item, in any state [screenshots; the DOM has no `.explorer-card`; no outline, background or border on item buttons].
2. L3 items are printed logos standing on the page with their name below, in soft glows without a white disc in either
   theme; neighbours' logos are at least 28 / 22 px tall on screen; Codam keeps its colours on a small plate [screenshots;
   §9.3 L3 checks].
3. The campus sheet sits in `#explorer` in place of the carousel, in halo's three columns at 1440×900, with no panel,
   overlay or veil; the strip and the back pill are outside the scroller and visible at every viewport; the h2 takes the
   focus without outline; the logo glides into the heart; pointer clicks during the entrance do nothing [§9.3 sheet
   checks; flows].
4. Behaviour identical to current B (every behaviour test passes in its rewritten form; §9.3 flows) and the H2f fixes in
   place [tests + AX tree].
5. Every text ≥ 4.5:1 measured on rendered pixels — names over shapes by the ring rule of §9.3 —, ≥ 13 px (14 px
   Arabic); names never form rectangles (fill rule of §9.3); controls ≥ 44 px, text links ≥ 24 px [§9.3].
6. Forced colours, RTL and reduced motion as §2.6–2.8, with a CanvasText outline on every silhouette [screenshots;
   reduced-motion run without `animate()`].
7. Arabic Paris fits 1440×900 without overflow **on B's real content**, proven by B's fit harness with this machine's
   Arabic font; at 667×375 nothing stays under the capsule [§5.6 harness; §9.3 sheet checks].
8. No layout drift after any level change or resize, no jump at the start of a glide, no movement of the outgoing view
   when the band moves [§9.3 drift and continuity checks].
9. Colours only from the `--hx-` tokens of `explorer-art.css`, no new hue [grep + review].
10. Monde is the 12°E 24°N globe with 51 dots; the count reads « 58 campus · 30 pays » [DOM].
11. Geometry metadata come from B's generator; cut runs follow the Urals; `--check` passes; no study data ships
    [generator check; grep].
12. Logo prints are precomputed by the normative algorithm, the manifest updated, no runtime canvas [`--check`; grep
    `getContext`].
13. A untouched (660/660, clean git status), the three mock-ups untouched (hashes), cache keys at `b2` for every changed
    or new module, stylesheet and JSON file, no commit, no documentation written by builders [§9.2].
14. Design parity signed off by the lead against the mock-up's screenshots before the user sees the result; hit
    testing, target sizes, focus rings, tablets and performance thresholds of §9.3 pass [§9.3].
15. Keyboard focus as the user decided (option A): a ring around the focused item's « Valider » chip only, never a frame
    around the shape or the item, in forced colours too; the focus styling sits in its one marked block and three tokens
    [screenshots of the keyboard flow; CSS review].

### 10.1 H2 fixes and decisions → solution → check

| Fix | Solution | Check |
| --- | --- | --- |
| H2a names without rectangle, never hiding dots | 4 px on-screen stroke + 2 px core + halo's soft glows (§4.8, R1); dots layer above the name (§4.7, R2) | ring contrast; fill rule; dot centres; screenshots |
| H2b pale flags keep a contour in light | flag rim `rgb(24 61 60 / .3)` 1.2 px on screen at every rank, drawn as a direct path (§4.4, R3, D2) | ΔE along the outline (France, Italy, Luxembourg, Japan, Singapore); stroke widths |
| H2c logos on the page, no disc, legible neighbours | halo's teal/pink glows without the white core in light, the dark quiet glow smoothed; floors 28 / 22 px as a transform (§2.1, §4.10, R4) | radial profiles in both themes; logo heights |
| H2d phone peeks intentional | edge fades capped by the cursor's button; names and counts hidden; L3 neighbours glow only (§4.19, R5); on tablets the edge rule (R20) | phone and tablet fragment checks; screenshots |
| H2e Urals cut | blurred fade core along the bent runs; rim cleared within 18 px; shadow from the faded body (§4.5, R6) | differential cut renders at 2× |
| H2f behaviour + open fixes | B's paths kept (§7.2); Escape/Backspace repeat guard; `setCursor` used by `resetScope`; `aria-describedby` removed when ready and restored on error; the group described by the visible hint only | selector and filter tests; AX tree |
| H2g contrast and size | measured tokens (§2.2); dark go #F267AC (R7); 13 / 14 px floor incl. kbd and « Prochaine »; 44 px pager buttons (R8); compact row ≥ 44 px (R23) | glyph and ring contrast; text floor; target sizes |
| H2h forced colours | outline on every silhouette (globe sphere, continents with the cut, countries, locator), flags hidden, names without box (§2.7, R9, D1, D16) | forced-colours screenshots, light and dark |
| H2i Arabic Paris fits; landscape clearance | fit cascade up to `tighter`, observed safely (§5.6, R10, D6, D12); tiny frame with the strip on top and bottom clearance (§5.1, R17) | B's harness on B's content; end-of-scroll and focus checks |
| H2j no layout drift | levels share one grid cell; instant re-layout with a flush (§4.15, R11); centre-anchored glides (D10); the outgoing view frozen (§4.22, R21, D15) | drift and continuity checks; tests of the instant protocol |
| Focus (user decision A, D3) | ring around the cursor's « Valider » chip only (§4.13, R19) | keyboard-flow screenshots; focus-ring checks |
| Entrance clicks (D9) | campus entrance guard (§5.1, R26) | selector test; pointer flow |

### 10.2 Judges' must-fix items for halo → where they are solved and checked

| # | Must-fix (judge) | Solution | Check |
| --- | --- | --- | --- |
| J2-1 | Build on B's pipeline: shapes with anchors, dots, cuts, globe from B's generator; B's model and band | §6.1–6.2, §7; the study's shapes and model never ship | A1 tests; `--check`; grep `studies/` |
| J2-2 | Keep the 350 ms activation guard | unchanged single click path (§7.2), extended to the campus entrance (R26) | selector tests; double-click and entrance flows |
| J2-3 | Warm up light mode | **not adopted**: lead decision H3 (halo's palette; the user deferred colour review to a later charter check of the whole site); every colour isolated in tokens so a warmer light mode is a token change; halo's own warm pink fringe kept in the L3 glows (§2.1) | grep of literals |
| J2-4 | No white disc behind L3 logos | §2.1, §4.10 (R4) | radial profiles, both themes |
| J2-5 | No cropped neighbour fragments on phones | §4.19 (R5); tablets R20 | phone and tablet checks |
| J2-6, J1-MF1 | Russia/Asia cut reads as a wedge; border decisions | bent Urals runs, local fade, rim cleared (§4.5); borders closed by the user's choices of 24 Oct (Urals, Morocco with Western Sahara) | cut renders; generator tests |
| J2-7 | Dark Valider and website pill ≥ 4.5 with a margin | `--hx-go-bg` #F267AC, 6.0:1 (R7) | contrast |
| J2-8 | Arabic Paris overflows at 1440×900 | fit cascade up to `tighter` (§5.6); **to be proven by B's harness on B's real content** (the prototype's 7 px spare ignored A's fallback note and the Source links) | harness report; sheet check |
| J2-9 | 13 px floor for kbd chips and « Prochaine » | §2.3 (R8) | text floor |
| J2-10 | Forced colours: white flag bands lose their contour | CanvasText outline on every silhouette, flags hidden (§2.7) | forced-colours screenshots |
| J2-11 | `aria-describedby` reads both hints | visible hint only (§4.18) | AX tree |
| J2-12 | Landscape sheet under the capsule | tiny frame: strip on top, bottom padding and scroll padding (§5.1) | end-of-scroll and focus checks |
| J1-W1 | Name halos drawn as rectangles hiding pins | R1 (measured), R2 | name checks |
| J1-W2 | Flags without contour | R3, drawn as a hairline (D2) | pale-flag and stroke checks |
| J1-W3 | Logos in bubbles, tiny neighbours, cold light | bubbles: R4; tiny neighbours: **partly** — floors where halo's sizes are smaller, halo's 1440 proportions kept (D7, §10.3); cold light: H3, as J2-3 | L3 checks |
| J1-W4 | Items shrink and float after a level change | R11 (§4.15), D10 | drift and continuity checks |
| J1-W5 | Study shapes; landscape neighbours unnamed; « Dernière vérification » under the capsule | §6; unnamed phone neighbours in the compact row kept as halo (named at 853×480); R17 | A1 tests; tiny checks |
| J1-MF2 | Strip visible at every size; website pill visible at 1280×720 and 320×640 | §5.1, §3.6 | sheet checks |
| J1-MF5 | No outline on the programmatically focused h2 | §4.13 | computed outline after a keyboard validation |
| J1-MF7 | Production assets: anchors, dots, boxes, cuts, globe, logo prints, flag table | §6 | A1 tests; both `--check` |
| J1-MF8 | Rendering cost | §4.15 budget (transforms, one shadow, two blur filters, no grain, no repaint per glide frame) | performance trace |
| J1-MF9 | The globe hides Seoul and Tokyo | lead decision H4: centre 12°E 24°N kept, count stays 58; the 7 far-side campuses documented (§4.6) | DOM: 51 dots |
| J1 (weakness, not a must-fix) | « Le cadre de focus arrondi redessine un bloc autour de l'item au clavier » | the user's option A: ring on the chip only, no frame (§4.13); arcade's outline along the silhouette is not grafted (H1) | keyboard-flow screenshots |

(J1-MF4 « water lines » and J1-MF6 « atlas palette » concern the atlas only.)

### 10.3 Open point for the user (not blocking the build) — DECIDED

- **Decided by the user on 25 Oct 2026: keep halo's proportions with the 28 / 22 px floors (the recommended option).**
  Do not change these constants.
- **L3 neighbours' logo floors (D7).** Built: halo's proportions, with floors of 28 / 22 px that act only where halo's
  sizes are smaller (very wide marks, 1280×720, 1024×768). At 1440 halo already draws the French neighbours at about
  35 px (±1) and 25 px (±2), which judge 1 found « petits ». Raising the floors (for example to 40 / 30 px) would make
  every neighbour logo larger and change halo's proportions; it is a two-number change in C's `layoutItems` constants
  if the user asks for it.

---------------------------------------------------------------------------------------------------------------

## Appendix A — Measured frame (current B, Chrome headless, 24 Oct 2026)

Sources: `$SCRATCH/spec-work/out/bands.json` (the draft's viewports) and `$SCRATCH/halo-final/out/bands-tablet.json`
(1366×768, 1280×1024, 1024×768, 768×1024 touch; script `$SCRATCH/halo-final/measure_tablet.py`).

| Viewport | `--explorer-top` (levels / campus) | `--explorer-bottom` FR (AR) | status line | note `#about` | search capsule | dock |
| --- | --- | --- | --- | --- | --- | --- |
| 1440×900 | 178.3 / 148 (AR 181.3 / 154) | 203 (212) | 142–162.3 | 713–738 | 751–795 | 808–868 (636 wide) |
| 1366×768 | 178.3 / 148 | 203 | 142–162.3 | 581–606 | 619–663 | 676–736 (636 wide) |
| 1280×1024 | 178.3 / 148 | 203 | 142–162.3 | 837–862 | 875–919 | 932–992 (636 wide) |
| 1280×720 | 178.3 / 148 | 203 | 142–162.3 | 533–558 | 571–615 | 628–688 |
| 1024×768 | 178.3 / 148 (AR 181.3 / 153) | 203 (212) | 142–162.3 (AR 145–165.3) | 581–606 (AR 572–606) | 619–663 | 676–736 (636 wide) |
| 768×1024 (touch) | 178.3 / 148 (AR 181.3 / 151) | 203 (212) | 142–162.3 (AR 145–165.3) | 837–862 (AR 828–862) | 875–919 | 932–992 (636 wide) |
| 390×844 | 174.84 / 146 | 188 (197) | 140–158.8 | 672–697 | 710–754 | 767–827 (358 wide) |
| 320×640 | 168.84 / 140 | 188 | 134–152.8 | 468–493 | 506–550 | 563–623 |
| 853×480 | 162.3 / 128 | 142 | 130–154.3 | hidden | 354–398 | 406–466 |
| 667×375 | 156.84 / 124 | 142 | 126–148.8 | hidden | 249–293 | 301–361 |
| 640×360 | 156.84 / 124 | 142 | 126–148.8 | hidden | 234–278 | 286–346 |

Stacking: `#explorer` fixed z 7, scope bar and note z 8, header z 10, dock shell z 20. Page gutter
(`--horizon-page-gutter`): 48 px at 1280 px and wider, 32 px at 768–1024 px and at 853, 24 px on phones, 20 px at 320.
No horizontal overflow and no JS error at the tablet sizes. Light theme: page #F7FAFA, focus #008E90, access accent
#00BABC; dark: page #1B1B1B, focus #96A3EB, access accent #ED3491.

## Appendix B — Expected generator metadata

**Labels** (halo anchor, pull .45 toward the box centre, precision 0.1; computed by
`$SCRATCH/halo-spec/proto/run-labels.mjs` on the current module's polygons; A1's generator values may differ by ±0.2;
r = clearance in units):

| Shape | label | r | | Shape | label | r | | Shape | label | r |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| africa | 58.5, 44.5 | 22.0 | | CHE | 45.8, 27.4 | 17.9 | | LUX | 34.3, 58.3 | 21.0 |
| americas | 39.7, 64.9 | 9.9 | | CZE | 48.6, 29.9 | 17.8 | | MAR | 44.1, 55.4 | 8.5 |
| asia | 45.8, 46.0 | 21.1 | | DEU | 33.4, 46.5 | 24.3 | | MDG | 24.8, 49.0 | 15.9 |
| europe | 52.1, 53.3 | 12.5 | | ESP | 41.5, 37.9 | 23.6 | | MYS | 61.5, 26.7 | 3.6 |
| AGO | 44.1, 56.5 | 28.6 | | FRA | 48.0, 47.2 | 23.6 | | NLD | 44.0, 50.3 | 18.0 |
| ALB | 19.5, 51.6 | 12.6 | | GBR | 29.1, 49.3 | 5.2 | | POL | 53.1, 43.6 | 34.2 |
| ARE | 60.4, 59.6 | 16.6 | | ITA | 44.7, 46.6 | 7.4 | | PRT | 19.3, 54.9 | 12.5 |
| ARM | 48.4, 44.0 | 18.3 | | JOR | 30.7, 63.4 | 20.5 | | PSE | 67.4, 33.0 | 16.7 |
| AUT | 65.6, 28.9 | 18.5 | | JPN | 53.3, 65.0 | 7.0 | | SGP | 50.0, 25.5 | 22.6 |
| BEL | 55.4, 30.6 | 23.5 | | KOR | 31.8, 46.3 | 19.2 | | THA | 26.3, 34.4 | 13.1 |
| BRA | 62.5, 43.4 | 25.1 | | LBN | 37.9, 49.0 | 11.1 | | TUR | 49.8, 23.3 | 14.6 |
| CAN | 25.5, 50.5 | 18.7 | |  |  |  | |  |  |  |

World: `[50, 50]` (the sphere's centre). Compared with today's polylabel values, the pull moves the names toward the
middle of their shapes (Europe from Russia to central Europe, Italy from the Alps to the boot, the Americas from Canada
to the isthmus), as in the mock-up's stand-in. The emblem flags' `focus` points stay today's polylabel points (§6.2):
for example MAR keeps its focus at 63.7, 29.5 while its label moves to 44.1, 55.4, and PRT keeps 26.6, 30.1 while its
label moves to 19.3, 54.9.

**Globe pins** (51, keys sorted): 1337-ben-guerir, 1337-khouribga, 1337-med, 1337-rabat, abu-dhabi, amman, angouleme,
antananarivo, antwerp, bangkok, barcelona, beirut, belo-horizonte, berlin, brussels, codam, firenze, heilbronn, irbid,
istanbul, kocaeli, lausanne, le-havre, lisboa, london, luanda, luxembourg, lyon, madrid, malaga, marseille, milano,
mulhouse, nablus, nice, paris, perpignan, porto, prague, quebec, rio, roma, sao, tirana, urduliz, vienna, warsaw, wels,
wolfsburg, yerevan, zurich. **Hidden** (beyond 83.1° from 12°E 24°N): gyeongsan 95.5°, iskandar-puteri 90.9°,
kuala-lumpur 88.4°, penang 86.2°, seoul 93.4°, singapore 91.1°, tokyo 102.5°. Globe land box `[2, 2, 98, 90.9]` (hence
the world's exemption from the fit test, §9.1). (No hemisphere can show every campus: the network spans 211° of
longitude, from Québec to Tokyo.)

**Cuts** (already generated): europe one run of 15 points from (85.6, 2) to (98, 38); asia one run of 10 points from
(27.6, 35.3) to (37.5, 21.2). **Holes**: world (lakes, incl. the Caspian), europe 2 (Baltic, Azov), TUR 1 (Marmara).
**Pins**: 6 / 4 / 16 / 32 (africa / americas / asia / europe); 58 across the countries. **Flag rules**: unchanged
(`FLAG_RULES`: 14 stretch, 4 cover, 12 emblem focus).

## Appendix C — Evidence (scratch only; nothing in the repository was changed)

Every path below is under `$SCRATCH`. « Valid » says what each piece may still be used for.

| Script | What it did | Outputs | Valid for |
| --- | --- | --- | --- |
| `halo-spec/proto/gen.mjs` (scratch copy of the generator + `haloLabel`, `buildGlobe`), `run-globe.mjs`, `run-labels.mjs` | globe at several centres on the pinned Natural Earth source; halo labels on the current module | `halo-spec/proto/globe-*.json`, `proto/labels.json` | Appendix B, §6.2 |
| `halo-spec/proto/halo-proto.js`, `halo-proto.css`, `run_proto.py` | halo's level rendering with B's band, shapes, flags and logos, injected into `site-b/content-preview.html`; measurements | `halo-spec/out/p1`–`p4` (screenshots, `measure.json`, zoomed cuts) | composition, geometry, the cut's dissolve, the phone peeks; **not** rim or outline widths (drawn through `<use>`: 3–5 px, D2) |
| `halo-spec/proto/geometry-table.mjs` | §3.4 table on B's bands with the computed foot (74.9 px) | stdout | superseded by `halo-final/calc/geometry-final.mjs` |
| `halo-spec/proto/names_proto.py` | three name-halo variants on every visible name | `halo-spec/out/names3/` | **not evidence**: « light » runs could render dark (the site keeps the theme across pages) and the 1280 FR and AR images are identical |
| `halo-spec/proto/contrast.py`, `glyph_contrast.py` | computed and rendered contrast | stdout, `halo-spec/out/glyph/glyph.json` | §2.2 for every text but the names over shapes |
| `halo-spec/proto/probe_sheet.py`, `probe_fit.py`, `probe_fit2.py` | the mock-up's sheet columns, and its fit in B's band (full, snug, tight) | `halo-spec/out/sheet/`, `fit/`, `fit2/` | the mock-up's own fit; B's content is proven by B's harness (§5.6) |
| `halo-spec/proto/prints.py` | logo print masks, classification, contact sheet | `halo-spec/proto/prints/` (`prints.json`, `contact.png`, 50 prints) | the normative algorithm and outputs of §6.3 |
| `halo-spec/proto/glide_mock.py` | the mock-up's glide frames | `halo-spec/out/glide/` | the mock-up's motion |
| earlier session (`halo-spec/glow*.py`, `name_halo*.py`, `inkbox.py`, `probe_halo.py`) | glow, rim and name variants on the mock-up | `halo-spec/out/glow/`, `glow3/`, `glow5/`, `names/`, `names2/`, `inkbox.json`, `probe/` | glow look; **not** rim weight (`out/glow/rim-l2.png` drew the rim through `<use>`) nor name legibility |
| `halo-final/measure_tablet.py` | the frame and band of current B at 768×1024 (touch), 1024×768, 1366×768, 1280×1024, FR and AR | `halo-final/out/bands-tablet.json`, `measure_tablet.log` | §3.1, Appendix A |
| `halo-final/calc/geometry-final.mjs` | halo's geometry on B's measured bands with the measured foot, the fades and the edge rule R20 | stdout (the §3.4 tables) | §3.4 |
| `halo-final/probe/names_measure.py`, `names_measure2.py` | first runs of the names measurement | `halo-final/out/names/names-measure*.json` | **superseded** (the theme could carry over between pages) |
| `halo-final/probe/names_measure3.py` | names over flags and land on the prototype, theme and language forced and checked on every page: glyph against the 1–2 px ring, halo reach and fill, for halo's `.28em`, the draft's `.085em` and the 4 px stroke | `halo-final/out/names-rerun/names-measure3.json` (474 rows: 158 name renders × 3 variants; log `names-measure3-rerun.log`) | D4, §2.2, §4.8, the thresholds of §9.3 |
| `halo-final/probe/probe_stroke_scale.py` | Chrome: a non-scaling stroke on a direct path inside an HTML ancestor scaled by CSS, and a `<use>` with a calc width | `halo-final/probe/probe-stroke-scale.png` | D2 (1.2 px becomes 0.6 px at `scale(.5)`) |
| `review-eng/probe_vector_effect.py` | Chrome: `vector-effect` on a `<use>` clone (4 px instead of 1.2 px), `scrollHeight` under `overflow:clip`, clicks through a masked layer | `review-eng/probe-vector-effect.png`, `rim-compare.png`, `flag-rim-compare.png` | D2; §3.1 (stage-scroll test); §4.21 |
| `review-eng/probe_blend_paintorder.py` | Chrome: `mix-blend-mode` on `<use>` and `paint-order` with `-webkit-text-stroke` on HTML text | `review-eng/probe-blend-paintorder.png` | §4.3 (sheen on `<use>`), §4.8 (`paint-order`) |
| `review-eng/offshore.mjs` (argument: `halo-spec/proto/globe-g12-24.json`) | distance of every pin to its outline in the current module and the prototype globe | stdout: only Abu Dhabi lies more than 0.8 units outside (1.5 units, off the simplified coast of ARE) | the 1.6-unit pin tolerance of §9.1 |
| — | the halo mock-up's reference screenshots | `design-shots/halo/` | the design-parity gate (§9.3) |

Reviews of the draft: `halo-final/critiques-and-stopped-reviser.json` (two critiques and the stopped reviser's report);
the draft itself: `SPEC-B-HALO.draft-before-review.md`.


---------------------------------------------------------------------------------------------------------------

## Amendments after verification (lead, 25 Oct 2026) — binding over the sections they cite

The Halo build was checked by four read-only verifiers, then fixed; the triage and status are in
[HALO-FIXES-20261025.md](HALO-FIXES-20261025.md). Where this list and the sections above differ, this list wins.

- **Where this document lives.** It was written in the session's temporary folder; a reboot of the machine on 25 October
  erased that folder, and this copy was rebuilt byte for byte from three agents' complete reads of the final file. The
  scratch paths cited above (`$SCRATCH/…`, `halo-final/…`, `design-shots/…`) no longer exist.
- **§2.1 light tokens `--hx-logo-glow` / `--hx-logo-glow-quiet` (H2c).** The values above were almost flat over their
  first half and read as a teal disc. Now: cursor `radial-gradient(closest-side, rgb(0 186 188 / .19) 0%, / .178 15%,
  / .148 30%, / .11 45%, rgb(237 52 145 / .058) 66%, / .03 82%, transparent 100%)`; quiet `rgb(0 186 188 / .11) 0%,
  / .1 20%, / .074 40%, / .043 60%, / .017 80%, transparent 100%`. Dark values unchanged.
- **§3.4 cursor button (H2g, 8 px spacing).** `cursorButton = min(wide, 2·(x1 − base·s1/2 − 8))`; at 320×640 the
  button is 212 px and the phone edge fade 42 px (the §3.4 tables and R24 said 220 and 38). Nothing changes at 360
  and wider.
- **§4.17 pager.** The dots keep a fixed size; the current pill is one indicator (`.explorer-dots::after`) moved with
  `translateX(calc(var(--dot) × 12 px))` (8 px dense), the dots after it shifted by a transform, so a glide costs about
  3 layouts instead of 25 (§4.15, §9.3). Bar width and dot positions are unchanged.
- **§5.1 scroller mask.** The heart column (360 px, centred) keeps halo's 18 px top fade at rest, composed with the
  scroll fades (`mask-composite: subtract`), in every fade state, at normal density and at short density in the wide
  layout (≥ 1100 px); not in short stacked, short single or tiny, where the title sits at the top. Removes the
  straight cut through the heart glow.
- **§7.2 selector.** The root is observed with `{box: 'border-box'}` (no ResizeObserver loop when the band rewrites
  the root's padding); `revealPill()` also runs from the campus branch of `localize()`, from `update()` and from
  `resized()` (the last only when the strip's size changed); the margin reset no longer matches the sheet's nodes;
  forced colours drop the cursor shadow and draw the current pill's focus ring in CanvasText 6 px inside its
  Highlight border.
- **§5.2 sheet markup.** The photo bar sits above the prints (`position: relative; z-index: 11`); the credit's « · » and
  « Source » stay together (`span.explorer-sheet-credit-tail`, `nowrap`); the locator figure is named by its
  figcaption (`aria-labelledby`); Piscine dates carry `<time datetime>` for their start and end (from
  `formatRangeToParts`, displayed text unchanged); the h2 gets `data-script="latin"` for a Latin campus name.
- **§5.6 short wide heart and tiny prints.** At short density in the wide layout: lantern 88 px / 4 px gap, facts
  margin 6 px, pill margin 10 px, Arabic h2 line height 1.15 for a Latin name and country line 1.4 (Arabic Paris at
  1280×720: the website pill clear of the bottom fade). In tiny density the prints are capped at 160 × 100 px. The
  website pill still rests half under the search capsule at 667×375; it is reachable by scrolling (R17). Clearing it
  would need a different tiny heart layout: not done, recorded.
- **§6.3 sticker (Codam).** The sticker print is no longer the original file: the tool crops the original's own pixels
  (no conversion, recolouring or resampling) to the ink box of `m > 8/255` grown by `round(0.06 × ink height)` and
  clamped, and writes `print/codam.png` (343×144, box [148, 33, 491, 177] of 640×214); the manifest's `print` points
  to it. Outputs: 51 print files, 285 774 bytes. The provenance is recorded in
  `site-b/assets/campus-logos/PROVENANCE.md` (« Variantes d’affichage »).
- **§7.6 cache keys.** Files changed by the fixes carry `?v=b3`: `explorer-selector.mjs`, `explorer-campus.mjs`,
  `campus-logos.json` (imported by `welcome.mjs`), the three stylesheets `explorer-art.css`, `explorer-selector.css`,
  `explorer-campus.css`, and the entries `welcome.mjs` / `content-preview.mjs`. `explorer-art.mjs` and
  `explorer-shapes.mjs` keep `?v=b2`.
- **After the final check (25 Oct 2026).** §2.7: names over shapes use `forced-color-adjust: none`, `color: CanvasText`
  and a Canvas stroke of `var(--hx-name-stroke) / var(--nk)` with `paint-order: stroke fill`, so no browser backplate is
  painted behind them (D16 « no box » holds). §7.5: `welcome.mjs` creates the band before the selector (the band's
  observer runs first). Entrance (functional spec §9): the ring fades over the first 35 % of the iris reveal instead of
  the last 35 %. Cache keys: `welcome.mjs`, `content-preview.mjs`, `explorer-selector.css` and `entrance.mjs` at `?v=b4`.
- **§9.3 spacing rule (lead, 25 Oct 2026).** « At least 8 px between adjacent targets » applies to the carousel buttons
  (R16) and to text links. The 44 px strip and back pills keep halo's 4 px / 6 px spacing: their size meets the target
  rule on its own. Known limits added: phone ±1 neighbours narrower than 44 px at 320×640; the R17 limit also at
  640×360; at 853×480 the photo button is taller than the sheet body.
- **Keyboard-focus fixes (25 Oct 2026, about 9 h 50).** §5.1 tiny density: the sheet body has no top scroll fade;
  `padding-block-end: calc(var(--explorer-bottom, 0px) - 16px)` (the scroll ends at the search capsule) and
  `scroll-padding-block: 7px calc(var(--explorer-bottom, 0px) - 9px)`; a control focused by the keyboard (`:focus-visible`)
  is scrolled the least amount into that window, top first when taller. §5.7 strip: a pill focused by the keyboard
  while partly hidden is scrolled clear of the list's 22 / 32 px fades (sides swapped in RTL), the list alone scrolling.
  Cache keys: `explorer-selector.mjs`, `explorer-selector.css`, `welcome.mjs` and `content-preview.mjs` at `?v=b5`.
  Known limits: Arabic 640×360 (ring 3.4–3.8 px under the capsule for two 44 px controls); faded outer ring stroke at a
  phone body's edge; a hard edge under the strip in tiny bands.


## Amendments after the refinements (lead, 26 Oct 2026) — binding over the sections they cite

On 25 and 26 October the user asked for a series of changes to version B. Each one, except the removal of « Monde »
(quoted in `archives/site-b-versions/pre-no-monde-20261025/README.md`), is quoted with the user's answers and specified
in [EXPLORER-B-REFINEMENTS-20261025.md](EXPLORER-B-REFINEMENTS-20261025.md), which wins over this document wherever
they differ. The sections of this document that no longer hold (the same changes also override the sections that
repeat the old rules, such as §3.3, §3.5, §4.11, §4.13, §4.14, §4.20, §4.21, §7.2 and §10):

- **§1.1, §4.6, §4.15, §4.17 « Monde ».** Level 1 shows only the four continents; the world filter is the state where no
  continent is validated. The globe drawing and its data stay in `explorer-art.mjs` and `explorer-shapes.mjs`, unused.
  The state before is archived in `archives/site-b-versions/pre-no-monde-20261025/`.
- **§2.1, §4.10, §4.12, §5 glows (refinements §A).** No glow behind or around any item or the sheet's logo; the pool of
  light, the horizon glow and the names' legibility stroke stay. On phones, the L3 neighbours show their logos.
- **§3.4 geometry (§I, §U).** The campus level draws the line of the continent and country levels; the line is lowered
  by up to 40 px, as far as the room under it allows.
- **§4.7 and R2 (§J).** The names are drawn above the campus dots.
- **§4.9 count and chip (§K, §P).** No count under the items. Outside the compact row, which keeps its cursor's
  own chip, the cursor chip is replaced by one fixed « Valider » button at the centre of the band, at the campus level's height, still during every motion; the focus ring of
  decision A shows on it.
- **§2.5, §4.15, §4.22 motion (§C, §D, §L).** A drag and every animated cursor move follow the horizon (continuous
  layout); a level change animates only what changes.
- **§4.16 head (§V).** The prompt is visually hidden and still labels the carousel; the step dots stand alone, centred.
- **§4.17 pager and §4.18 hint (§B, §H).** No Previous/Next buttons. The hint shows in a bubble opened by an ⓘ button at
  the end of the dots and count row; the room of the old hint line stays empty.
- **§3.1 the band (§N, §W).** The note `#about` is gone, its room kept by `#note-room`. In landscape windows at most
  720 px tall, the dock is a rail at the side and the band's lower bound is the window's bottom margin (`getBottomEdge`;
  the rail's foot under §W, before §X centred the rail).
- **Entrance (functional spec §9; §E, §R, §U).** No ring and no iris. The arc is drawn on the Explorer's horizon; the 42
  flies to the header's 42; then the HORIZON cascade, the continents' slide and the edge arrivals start together. On
  short screens the entrance's 42 shows higher, so the arc passes under it.
- **Pages (§Q, §S, §T, §Y).** Plain ink background in dark mode; the « Revenir au monde » pictogram on every page; a
  scope pill of fixed size showing the path in steps.
- **§7.6 cache keys.** The files changed by the refinements, and their importers, carry `?v=b7`, then `?v=b8` (§X) and
  `?v=b9` (§Y).
