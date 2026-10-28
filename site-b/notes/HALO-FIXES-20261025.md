# Halo build — fixes after verification (25 Oct 2026)

Four read-only verifications of the integrated Halo build (visual parity, accessibility, behaviour and performance,
campus sheets) found no blocker. This list is the lead's triage of their findings, by owner (file ownership of
[SPEC-B-HALO.md](SPEC-B-HALO.md) §8). Status is kept up to date as the fixes land.

**Status, 25 Oct 2026, about 6 h 15:** every item below is fixed by its owner and checked in Chrome, except item 10's
goal (the website pill at 667×375 still rests half under the search capsule; it is reachable by scrolling, R17; a
different tiny heart layout would be needed and was not made). Measured: the strip pill stays in view after direction
switches and resizes; 0 ResizeObserver loop messages over the resize series that gave 44 before; the heart glow's
top step 0.6–2.1 (2.5–10.2 before); 3 layouts per glide (25–28 before); 8 px at 320×640; Mulhouse « 1 / 4 » in dark
9.74:1 (4.35:1 before); Codam's ink 90.9×35 px in the heart at 1440 (46×17.5 before). Tests: B 634/634, A 660/660; the
generator and the prints `--check` up to date. The spec's amendments section records the changed rules; cache keys of
the changed files are `?v=b3`.

## Done by the lead

- **A2 — `explorer-art.css`: logo glows (major, H2c).** In light, `--hx-logo-glow` and `--hx-logo-glow-quiet` were almost
  flat over their first half and read as a teal disc behind the L3 and sheet logos. New stops, verified by runtime
  injection (plateau share 0.73 → 0.46 at the cursor, never lighter than the page, dark unchanged), only halo's teal
  and pink: cursor `.19 0 %, .178 15 %, .148 30 %, .11 45 %, pink .058 66 %, pink .03 82 %, transparent`; quiet
  `.11 0 %, .1 20 %, .074 40 %, .043 60 %, .017 80 %, transparent`. `explorer-art.test.mjs` pins the new values.

## C — `explorer-selector.mjs` / `explorer-selector.css`

1. **Major — current pill out of view in the strip** after a language switch that flips direction, or after a resize
   (`revealPill()` was only called from `show()` and `switchCampus()`). Call it, before `updateFades`, from the campus
   branch of `localize()`, from `update()` and from `resized()`; add a selector test (fr → ar on a campus screen whose
   pill is off view → the pill is inside the list box).
2. **Major — « ResizeObserver loop completed with undelivered notifications »** whenever a viewport change moves the
   band's edges: the band observer rewrites `#explorer`'s padding inside its callback while the selector observes
   `#explorer`'s content box at the same depth. Fix verified by the behaviour verifier: observe the root with
   `{box:'border-box'}` (line 177); band changes still reach the selector through its deeper observations.
3. **Major — straight cut at the top of the sheet's heart glow** at almost every viewport (halo kept an 18 px top fade
   whenever its sheet overflowed). Verified fix: mask only the heart column with halo's 18 px fade, combined with the
   existing scroll fades (side columns keep the current fades), in every fade state, at `data-density=normal` and
   in the wide layout at short density; not in short stacked/single nor tiny.
4. **Minor — margin rule leaking into the sheet:** `:root #explorer :is(.explorer-level,.explorer-campus)
   :where(p,h2){margin:0}` matches B's nodes (no visible effect today); scope it to C's own nodes.
5. **Minor — cursor drop shadow painted in forced colours:** add `filter:none` on `.explorer-item .hx-art` in the
   forced-colours block.
6. **Minor — forced colours: the focus ring of the current strip pill merges with its Highlight border:** separate
   them (for example `outline-offset:-6px` or a CanvasText ring) for the current pill.
7. **Minor (performance) — pager dots animate `inline-size`:** a layout on every frame of a glide (25 per glide, §9.3
   asks ≤ 4). Keep the dots fixed and draw the current pill with `transform` (scaleX or a translated indicator).
8. **Minor — 320×640: about 4 px between the cursor button and the ±1 art** (spec formula vs the 8 px spacing rule):
   keep at least 8 px.

## B — `explorer-campus.css` / `explorer-campus.mjs`

9. **Minor (contrast) — the photo prints' shadow paints over the photo bar** (count « 1 / 4 » 4.35:1 in dark): put the
   bar above the stack (`position:relative; z-index:11`, or an equivalent stacking context).
10. **Minor — tiny band (667×375): the website pill rests half under the search capsule;** cap the print size in tiny
    density (about 160 px wide) so more of the heart fits.
11. **Minor — Arabic 1280×720 Paris: the website pill sits half under the bottom fade at rest** (the Arabic h2 is 39 px
    because of line height 1.4 on the Latin name). Tighten the short-wide heart rhythm or the Arabic h2 line height
    when the name is Latin; keep every other fit result.
12. **Note → fix — the Lyon locator `figure` has no accessible name:** `aria-labelledby` to its figcaption.
13. **Note → fix — a « · » separator hangs when the photo credit wraps:** keep « · Source » together (`nowrap`).
14. **Note → fix — Piscine dates lost A's `<time datetime>`:** add `<time>` elements for start and end inside the range
    text, without changing what is displayed.

## A1 — `tools/build-campus-logo-prints.py`, `assets/campus-logos/print/`, `campus-logos.json`

15. **Minor — Codam's colour logo is the untrimmed original,** so its ink is 46×17.5 px in the heart (others ≥ 28.5 px
    tall). Apply halo's « crop colour logos to their ink box » at build time: the tool crops the sticker's original
    pixels (colours untouched) to the ink box plus halo's 6 % margin and writes `print/codam.png`; the manifest's
    `print` gets the new src, size, aspect ratio, sha256 and bytes; `--check` and the logo tests follow. The lead
    amends SPEC-B-HALO.md §6.3 accordingly.

## Not changed (recorded)

- Long tasks on level changes come mostly from version A's frame rules (`:has()` with focus), unchanged by design.
- Every carousel item is its own compositor layer (`translate3d`, prescribed); memory stays flat over 100 glides.
- The compact row draws logos larger than halo and without glows, as §3.5 asks.
- The deep-link announcement « Explorer · Le monde » before the catalogue applies the route behaves as in A.
- The light focus ring measures 3.2–3.6:1, just above the 3:1 threshold: unchanged.
- Accessibility checks not completed at the verifier's stop: names-over-shapes ring rule on the integrated build,
  text spacing (WCAG 1.4.12), 200 % zoom at 640×360, targets beyond 1440, strip pill contrast — to rerun in the final
  check.

## Final check (25 Oct 2026, about 7 h) and its three fixes

A final read-only check confirmed every fix above on the real pages (glows, heart top, Codam, strip pill, resize series,
Arabic 1280×720, Mulhouse in dark, forced colours, keyboard/pointer/entry flows with no error and no request outside
`/site-b/` and `/shared/`) and measured names over shapes with the §9.3 ring rule: 592 renders, minimum 12.63:1. Its
accessibility part (b)–(f) could not run (a tool outage blocked its commands); those checks were run afterwards. It
found three defects of version B, fixed by the lead with a test each (items 16–18 below); the remaining accessibility checks are recorded after them:

16. **Minor — « ResizeObserver loop » in Arabic L1/L2 when shrinking 1024×768 → 320×640.** The selector's observer ran
    before the band's and laid a level out with the old padding. `welcome.mjs` now creates the band before the selector
    (verified by request interception before the change: 3/3 → 0/3). The same message on the campus route
    390×844 → 320×640 also happens in version A (its shared dock observers): recorded, not changed.
17. **Minor — forced colours: Chrome's readability backplate painted a rectangle behind names over shapes** and cut the
    silhouettes' outline (D16 « no box »). The names now opt out (`forced-color-adjust:none`) with a CanvasText fill and a
    Canvas halo that hugs the glyphs (`explorer-selector.css`).
18. **Note → fix — on `index.html`, the entrance's ring lingered off-centre over the « Monde » globe** during the iris
    reveal (version B's globe is not where the ring stands). The ring now fades over the first 35 % of the reveal
    (`entrance.mjs`).

Cache keys after these fixes: `welcome.mjs` and `content-preview.mjs` `?v=b4`, `explorer-selector.css` `?v=b4`,
`entrance.mjs` `?v=b4`. Tests: B 635/635, A 660/660.

## Remaining accessibility checks and the last three fixes verified (25 Oct 2026, about 8 h)

- **Items 16–18 verified in Chrome:** 0 « ResizeObserver loop » messages in every run in scope (a control copy with the
  old creation order still fails 3/3 in Arabic); in forced colours no box behind names, outlines no longer cut, names
  21:1; the entrance ring fully transparent from about 0.5 s into the 1.2 s reveal and absent over the Monde globe.
- **WCAG 1.4.12 text spacing** (14 states, French and Arabic, L2, L3, compact row, Paris sheet at 1440 and 390): 0 text
  clipped, 0 overlapping ink, no horizontal scroll; the sheets scroll and every item stays reachable.
- **200 % zoom (640×360):** no horizontal scroll; every Explorer control reached by Tab in L1, L2, L3 and the sheet.
- **Text floor:** 13 px in French, 14 px in Arabic, at 390 and 320 (42 states). **Targets:** controls ≥ 44 px, text
  links ≥ 24 px (the credit's inline Source link is exempt); **strip contrast** ≥ 6.02:1 outside the fades, 13.98:1 for
  the current pill.
- **Two minor keyboard-focus defects, fixed (role C) and verified:** (19) in tiny density (640×360, 667×375) a focused sheet
  control or the last line can rest under the body's 18 px top fade, and some focus rings are cut by the body's top
  edge; (20) a strip pill focused by Tab while partly visible stays half clipped under the list's edge fade (390, 320,
  Arabic 640×360).
- **Decision (lead) — strip spacing:** the strip pills are 4 px apart (6 px from the back pill), as in halo, against the
  spec's « 8 px between targets ». They are 44 px tall, so the target-size rule is met by their size (WCAG 2.5.8); the
  spec's 8 px rule is narrowed to the carousel buttons and text links (amendment in SPEC-B-HALO.md), and halo's
  spacing is kept.
- **Recorded limits (notes):** at 320×640 the phone ±1 carousel neighbours are narrower than 44 px (their art is the hit
  area, as in halo); the R17 limit (website pill under the search capsule at rest) also applies at 640×360; at 853×480
  the Paris photo button is taller than the sheet body, so its focus ring is always cut; under text spacing, version
  A's bottom bar (outside the Explorer) truncates its labels — a version A matter, unchanged.

## Keyboard-focus fixes 19–20 (25 Oct 2026, about 9 h 50)

- **Fixed (role C, `explorer-selector.mjs/.css/.test.mjs`, two new tests):** (19) in tiny bands the sheet body has no top
  scroll fade, its scroll ends at the search capsule, its scroll paddings leave a focus window of body top + 7 px to
  capsule top − 7 px, and a control focused by the keyboard is scrolled the least amount into that window (top first
  when taller); (20) a strip pill focused by the keyboard while partly hidden is scrolled clear of the list's fades, the
  list alone scrolling. Both react to keyboard focus only (`:focus-visible`): a mouse press or a tap moves nothing.
- **Verified independently:** 924 focus stops over 48 keyboard sweeps (640×360, 667×375, 390×844, 320×640; French and
  Arabic; Paris, Lyon, Mulhouse): all strip pills inside the list and clear of its fades (26 failures before); sheet
  controls clear of the fades and edges; at rest the pages are pixel-identical to before (36 states); no regression on
  the pill reveal, the heart glow, the keyboard flow, pointer and touch, the cache keys. Tests: B 637/637, A 660/660.
- **Remaining limits (recorded):** in Arabic at 640×360 (1280×720 at 200 %), the band leaves 55 px between the strip and
  the capsule while a 44 px control with its ring needs 58 px: the website button and the directions pill stay fully
  visible but the bottom stroke of their focus ring passes 3.4–3.8 px under the capsule. At 390×844 and 320×640, when
  Chrome scrolls a control to the body's edge, the control is clear of the 18 / 28 px fades but the outer stroke of
  its 7 px ring can be drawn faded (unchanged behaviour; raising those scroll paddings by 7 px would clear it). In tiny
  bands, text scrolled under the strip is now cut by a hard edge instead of the fade (the trade-off of fix 19). The
  « ResizeObserver loop » message on the campus route at 390×844 → 320×640 also exists in version A (item 16).
- **Cache keys now:** `explorer-selector.mjs`, `explorer-selector.css`, `welcome.mjs` and `content-preview.mjs` at
  `?v=b5`; `explorer-campus.mjs/.css`, `campus-logos.json` and `explorer-art.css` at `?v=b3`; `entrance.mjs` at `?v=b4`;
  `explorer-art.mjs` and `explorer-shapes.mjs` at `?v=b2`.

